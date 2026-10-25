package hevy

import (
	"context"
	"encoding/json"
	"fmt"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/jellydator/ttlcache/v3"
	"github.com/mxschmitt/playwright-go"
)

const summaryCacheKey = "current-month"

type Client struct {
	username, email, password string
	headless                  bool
	refreshInterval           time.Duration
	cache                     *ttlcache.Cache[string, WorkoutSummary]
	refreshMu                 sync.Mutex
	lastErr                   error
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
	PRs []json.RawMessage `json:"prs"`
}

type flexibleTime struct {
	time.Time
}

func (t *flexibleTime) UnmarshalJSON(value []byte) error {
	var number float64
	if json.Unmarshal(value, &number) == nil {
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

func NewClient(username, email, password string, headless bool, refreshInterval time.Duration) *Client {
	if refreshInterval <= 0 {
		refreshInterval = 30 * time.Minute
	}
	return &Client{
		username:        username,
		email:           email,
		password:        password,
		headless:        headless,
		refreshInterval: refreshInterval,
		cache: ttlcache.New[string, WorkoutSummary](
			ttlcache.WithTTL[string, WorkoutSummary](refreshInterval),
			ttlcache.WithCapacity[string, WorkoutSummary](1),
		),
	}
}

func (c *Client) Start(ctx context.Context) {
	go func() {
		c.refresh(ctx)
		ticker := time.NewTicker(c.refreshInterval)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				c.refresh(ctx)
			}
		}
	}()
}

func (c *Client) CurrentMonthSummary(ctx context.Context, _ time.Time) (WorkoutSummary, error) {
	if item := c.cache.Get(summaryCacheKey); item != nil {
		return item.Value(), nil
	}

	c.refresh(ctx)
	if item := c.cache.Get(summaryCacheKey); item != nil {
		return item.Value(), nil
	}

	c.refreshMu.Lock()
	lastErr := c.lastErr
	c.refreshMu.Unlock()
	if lastErr != nil {
		return WorkoutSummary{}, fmt.Errorf("Hevy summary refresh failed: %w", lastErr)
	}

	return WorkoutSummary{}, fmt.Errorf("Hevy summary is not ready yet")
}

func (c *Client) refresh(ctx context.Context) {
	c.refreshMu.Lock()
	defer c.refreshMu.Unlock()

	if c.email == "" || c.password == "" {
		c.lastErr = fmt.Errorf("HEVY_EMAIL and HEVY_PASSWORD are not configured")
		return
	}

	summary, err := c.scrape(ctx, time.Now())
	if err != nil {
		c.lastErr = err
		return
	}

	c.lastErr = nil
	c.cache.Set(summaryCacheKey, summary, ttlcache.DefaultTTL)
}

func (c *Client) scrape(ctx context.Context, now time.Time) (WorkoutSummary, error) {
	pw, err := playwright.Run()
	if err != nil {
		return WorkoutSummary{}, err
	}
	defer pw.Stop()
	browser, err := pw.Chromium.Launch(playwright.BrowserTypeLaunchOptions{Headless: &c.headless})
	if err != nil {
		return WorkoutSummary{}, err
	}
	defer browser.Close()
	page, err := browser.NewPage()
	if err != nil {
		return WorkoutSummary{}, err
	}
	if _, err = page.Goto("https://hevy.com/login"); err != nil {
		return WorkoutSummary{}, err
	}
	page.WaitForTimeout(2000)
	if err = page.GetByText("Or with email").Click(); err != nil {
		return WorkoutSummary{}, fmt.Errorf("could not open Hevy email login at %s (%s): %w", page.URL(), pageState(page), err)
	}
	page.WaitForTimeout(500)
	emailInput := page.Locator("input:not([type]), input[type='email'], input[name='email'], input[autocomplete='email'], input[placeholder*='email' i], input[type='text']").First()
	if err = emailInput.Fill(c.email); err != nil {
		return WorkoutSummary{}, fmt.Errorf("could not find Hevy email input at %s (%s): %w", page.URL(), pageState(page), err)
	}
	if err = page.Locator("input[type='password'], input[name='password'], input[autocomplete='current-password']").First().Fill(c.password); err != nil {
		return WorkoutSummary{}, fmt.Errorf("could not find Hevy password input at %s (%s): %w", page.URL(), pageState(page), err)
	}
	if err = clickLoginButton(page); err != nil {
		return WorkoutSummary{}, fmt.Errorf("could not submit Hevy login at %s (%s): %w", page.URL(), pageState(page), err)
	}

	page.WaitForTimeout(1500)
	bodyCh := make(chan []byte, 1)
	page.OnResponse(func(response playwright.Response) {
		if strings.Contains(response.URL(), "/user_workouts_paged") && response.Status() == 200 {
			if body, bodyErr := response.Body(); bodyErr == nil {
				select {
				case bodyCh <- body:
				default:
				}
			}
		}
	})
	if _, err = page.Goto("https://hevy.com/profile"); err != nil {
		return WorkoutSummary{}, err
	}

	var body []byte
	select {
	case body = <-bodyCh:
	case <-ctx.Done():
		return WorkoutSummary{}, ctx.Err()
	case <-time.After(30 * time.Second):
		return WorkoutSummary{}, fmt.Errorf("timed out waiting for Hevy workout data")
	}
	var data workoutPage
	if err = json.Unmarshal(body, &data); err != nil {
		return WorkoutSummary{}, err
	}

	return summarize(data.Workouts, now), nil
}

func clickLoginButton(page playwright.Page) error {
	buttons, err := page.Locator("button").All()
	if err != nil {
		return err
	}

	for _, button := range buttons {
		text, textErr := button.InnerText()
		visible, visibleErr := button.IsVisible()
		enabled, enabledErr := button.IsEnabled()
		if textErr != nil || visibleErr != nil || enabledErr != nil || !visible || !enabled {
			continue
		}

		label := strings.ToLower(strings.Join(strings.Fields(text), " "))
		if label == "login" || label == "log in" {
			return button.Click()
		}
	}

	return fmt.Errorf("no enabled Login button found")
}

func pageState(page playwright.Page) string {
	title, _ := page.Title()
	body, _ := page.Locator("body").InnerText()
	body = strings.Join(strings.Fields(body), " ")
	if len(body) > 240 {
		body = body[:240] + "..."
	}

	inputCount, _ := page.Locator("input").Count()
	inputs := make([]string, 0, inputCount)
	for index := 0; index < inputCount; index++ {
		input := page.Locator("input").Nth(index)
		inputType, _ := input.GetAttribute("type")
		placeholder, _ := input.GetAttribute("placeholder")
		name, _ := input.GetAttribute("name")
		inputs = append(inputs, fmt.Sprintf("type=%q name=%q placeholder=%q", inputType, name, placeholder))
	}

	return fmt.Sprintf("title=%q body=%q inputs=%v", title, body, inputs)
}

func summarize(workouts []workout, now time.Time) WorkoutSummary {
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	summary := WorkoutSummary{
		Month:       startOfMonth.Format("January"),
		Year:        now.Year(),
		MonthNumber: int(now.Month()),
		WorkoutDays: []int{},
	}
	days := map[int]struct{}{}

	for _, workout := range workouts {
		start := workout.StartTime.In(now.Location())
		if start.Before(startOfMonth) || start.After(now) {
			continue
		}
		summary.Workouts++
		days[start.Day()] = struct{}{}
		if summary.RecentWorkout == nil {
			summary.RecentWorkout = preview(workout, now.Location())
		}
		if !workout.EndTime.IsZero() && workout.EndTime.After(start) {
			summary.DurationSeconds += int(workout.EndTime.Sub(start).Seconds())
		}

		summary.VolumeLbs += workout.EstimatedVolumeKg * 2.2046226218
	}

	for day := range days {
		summary.WorkoutDays = append(summary.WorkoutDays, day)
	}
	sort.Ints(summary.WorkoutDays)
	return summary
}

func preview(workout workout, location *time.Location) *WorkoutPreview {
	id := workout.ShortID
	if id == "" {
		id = workout.ID
	}
	result := &WorkoutPreview{
		Date:      workout.StartTime.In(location).Format("Jan 2, 2006"),
		Title:     workout.Name,
		URL:       "https://hevy.com/workout/" + id,
		VolumeLbs: workout.EstimatedVolumeKg * 2.2046226218,
	}
	if !workout.EndTime.IsZero() && workout.EndTime.After(workout.StartTime.Time) {
		result.DurationSeconds = int(workout.EndTime.Sub(workout.StartTime.Time).Seconds())
	}
	for _, exercise := range workout.Exercises {
		result.Sets += len(exercise.Sets)
		for _, set := range exercise.Sets {
			result.Records += len(set.PRs)
		}
	}

	return result
}
