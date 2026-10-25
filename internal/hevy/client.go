package hevy

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"sync"
	"time"

	"resty.dev/v3"
)

const (
	apiURL     = "https://api.hevyapp.com"
	hevyAPIKey = "shelobs_hevy_web"
	pageSize   = 5
	maxPages   = 20
)

type Client struct {
	client       *resty.Client
	username     string
	refreshToken string
	accessToken  string
	tokenMu      sync.Mutex
}

type WorkoutSummary struct {
	Month           string          `json:"month"`
	Year            int             `json:"year"`
	MonthNumber     int             `json:"monthNumber"`
	Workouts        int             `json:"workouts"`
	DurationSeconds int             `json:"durationSeconds"`
	VolumeLbs       float64         `json:"volumeLbs"`
	WorkoutDays     []int           `json:"workoutDays"`
	RecentWorkout   *WorkoutPreview `json:"recentWorkout,omitempty"`
}

type WorkoutPreview struct {
	Date            string  `json:"date"`
	Title           string  `json:"title"`
	URL             string  `json:"url"`
	DurationSeconds int     `json:"durationSeconds"`
	VolumeLbs       float64 `json:"volumeLbs"`
	Sets            int     `json:"sets"`
	Records         int     `json:"records"`
}

type workoutPage struct {
	Workouts []workout `json:"workouts"`
}

type workout struct {
	ID                string       `json:"id"`
	ShortID           string       `json:"short_id"`
	StartTime         flexibleTime `json:"start_time"`
	EndTime           flexibleTime `json:"end_time"`
	Name              string       `json:"name"`
	EstimatedVolumeKg float64      `json:"estimated_volume_kg"`
	Exercises         []exercise   `json:"exercises"`
}

type exercise struct {
	Sets []set `json:"sets"`
}

type set struct {
	Type string            `json:"indicator"`
	PRs  []json.RawMessage `json:"prs"`
}

type flexibleTime struct {
	time.Time
}

func (t *flexibleTime) UnmarshalJSON(value []byte) error {
	var number float64
	if err := json.Unmarshal(value, &number); err == nil {
		t.Time = time.Unix(int64(number), 0)
		return nil
	}

	var text string
	if err := json.Unmarshal(value, &text); err != nil {
		return err
	}
	parsed, err := time.Parse(time.RFC3339, text)
	if err != nil {
		return err
	}
	t.Time = parsed
	return nil
}

func NewClient(username, accessToken, refreshToken string) *Client {
	return &Client{
		client:       resty.New().SetTimeout(10 * time.Second),
		username:     username,
		accessToken:  accessToken,
		refreshToken: refreshToken,
	}
}

func (c *Client) CurrentMonthSummary(ctx context.Context, now time.Time) (WorkoutSummary, error) {
	if c.refreshToken == "" {
		return WorkoutSummary{}, fmt.Errorf("Hevy refresh token is not configured")
	}
	if c.username == "" {
		return WorkoutSummary{}, fmt.Errorf("Hevy username is not configured")
	}

	location := now.Location()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, location)
	summary := WorkoutSummary{
		Month:       startOfMonth.Format("January"),
		Year:        startOfMonth.Year(),
		MonthNumber: int(startOfMonth.Month()),
		WorkoutDays: make([]int, 0),
	}
	workoutDays := make(map[int]struct{})

	for pageNumber := 0; pageNumber < maxPages; pageNumber++ {
		offset := pageNumber * pageSize
		page, err := c.workoutsPage(ctx, offset)
		if err != nil {
			return WorkoutSummary{}, err
		}
		if len(page.Workouts) == 0 {
			break
		}

		stop := false
		for _, workout := range page.Workouts {
			start := workout.StartTime.In(location)
			if start.Before(startOfMonth) {
				stop = true
				continue
			}
			if start.After(now) {
				continue
			}

			summary.Workouts++
			workoutDays[start.Day()] = struct{}{}
			if summary.RecentWorkout == nil {
				summary.RecentWorkout = workout.preview(location)
			}
			if !workout.EndTime.IsZero() && workout.EndTime.After(start) {
				summary.DurationSeconds += int(workout.EndTime.Sub(start).Seconds())
			}
			summary.VolumeLbs += workout.EstimatedVolumeKg * 2.2046226218
		}
		if stop || len(page.Workouts) < pageSize {
			break
		}
	}
	for day := range workoutDays {
		summary.WorkoutDays = append(summary.WorkoutDays, day)
	}
	sort.Ints(summary.WorkoutDays)

	return summary, nil
}

func (workout workout) preview(location *time.Location) *WorkoutPreview {
	workoutID := workout.ShortID
	if workoutID == "" {
		workoutID = workout.ID
	}
	preview := &WorkoutPreview{
		Date:      workout.StartTime.In(location).Format("Jan 2, 2006"),
		Title:     workout.Name,
		URL:       "https://hevy.com/workout/" + workoutID,
		VolumeLbs: workout.EstimatedVolumeKg * 2.2046226218,
	}
	if !workout.EndTime.IsZero() && workout.EndTime.After(workout.StartTime.Time) {
		preview.DurationSeconds = int(workout.EndTime.Sub(workout.StartTime.Time).Seconds())
	}
	for _, exercise := range workout.Exercises {
		preview.Sets += len(exercise.Sets)
		for _, set := range exercise.Sets {
			preview.Records += len(set.PRs)
		}
	}
	return preview
}

func (c *Client) workoutsPage(ctx context.Context, offset int) (workoutPage, error) {
	accessToken, err := c.ensureAccessToken(ctx)
	if err != nil {
		return workoutPage{}, err
	}

	page, response, err := c.requestWorkoutsPage(ctx, offset, accessToken)
	if err != nil {
		return workoutPage{}, err
	}
	if response.StatusCode() == http.StatusUnauthorized {
		c.tokenMu.Lock()
		c.accessToken = ""
		c.tokenMu.Unlock()
		accessToken, err = c.refreshAccessToken(ctx)
		if err != nil {
			return workoutPage{}, err
		}
		page, response, err = c.requestWorkoutsPage(ctx, offset, accessToken)
		if err != nil {
			return workoutPage{}, err
		}
	}
	if response.StatusCode() == http.StatusNotModified {
		return page, nil
	}
	if response.StatusCode() >= http.StatusBadRequest {
		return workoutPage{}, fmt.Errorf("Hevy returned status %d: %s", response.StatusCode(), response.String())
	}
	return page, nil
}

func (c *Client) requestWorkoutsPage(ctx context.Context, offset int, accessToken string) (workoutPage, *resty.Response, error) {
	var page workoutPage
	request := c.client.R()
	if accessToken != "" {
		request.SetHeader("Authorization", "Bearer "+accessToken).SetHeader("auth-token", accessToken)
	}
	response, err := request.
		SetContext(ctx).
		SetHeader("Accept", "application/json").
		SetHeader("Hevy-Platform", "web").
		SetHeader("x-api-key", hevyAPIKey).
		SetHeader("x-client-time", strconv.FormatInt(time.Now().Unix(), 10)).
		SetHeader("Authorization", "Bearer "+c.accessToken).
		SetQueryParams(map[string]string{
			"username": c.username,
			"limit":    strconv.Itoa(pageSize),
			"offset":   strconv.Itoa(offset),
		}).
		SetResult(&page).
		Get(apiURL + "/user_workouts_paged")
	if err != nil {
		return workoutPage{}, response, err
	}
	return page, response, nil
}

type tokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

func (c *Client) ensureAccessToken(ctx context.Context) (string, error) {
	c.tokenMu.Lock()
	accessToken := c.accessToken
	c.tokenMu.Unlock()
	if accessToken != "" {
		return accessToken, nil
	}
	return c.refreshAccessToken(ctx)
}

func (c *Client) refreshAccessToken(ctx context.Context) (string, error) {
	c.tokenMu.Lock()
	defer c.tokenMu.Unlock()
	if c.accessToken != "" {
		return c.accessToken, nil
	}

	var tokens tokenResponse
	request := c.client.R()
	if c.accessToken != "" {
		request.SetHeader("Authorization", "Bearer "+c.accessToken)
	}
	response, err := request.
		SetContext(ctx).
		SetHeader("Accept", "application/json").
		SetHeader("Hevy-Platform", "web").
		SetHeader("x-api-key", hevyAPIKey).
		SetHeader("x-client-time", strconv.FormatInt(time.Now().Unix(), 10)).
		SetBody(map[string]string{"refresh_token": c.refreshToken}).
		SetResult(&tokens).
		Post(apiURL + "/auth/refresh_token")
	if err != nil {
		return "", err
	}
	if response.StatusCode() >= http.StatusBadRequest || tokens.AccessToken == "" {
		return "", fmt.Errorf("Hevy token refresh returned status %d: %s", response.StatusCode(), response.String())
	}
	c.accessToken = tokens.AccessToken
	if tokens.RefreshToken != "" {
		c.refreshToken = tokens.RefreshToken
	}
	return c.accessToken, nil
}
