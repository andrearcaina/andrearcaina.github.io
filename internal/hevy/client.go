package hevy

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"os"
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
	chromiumPath              string
	cache                     *ttlcache.Cache[string, WorkoutSummary]
	scrapeFn                  func(context.Context, time.Time) (WorkoutSummary, error)
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

func NewClient(username, email, password string, headless bool) *Client {
	return &Client{
		username:     username,
		email:        email,
		password:     password,
		headless:     headless,
		chromiumPath: os.Getenv("HEVY_CHROMIUM_PATH"),
		cache: ttlcache.New[string, WorkoutSummary](
			ttlcache.WithTTL[string, WorkoutSummary](ttlcache.NoTTL),
			ttlcache.WithCapacity[string, WorkoutSummary](1),
		),
	}
}

func (c *Client) Start(ctx context.Context) {
	go func() {
		var nextRun time.Time
		for {
			if nextRun.IsZero() {
				nextRun = nextRefreshTime(time.Now().In(torontoLocation()))
			}
			timer := time.NewTimer(time.Until(nextRun))

			select {
			case <-ctx.Done():
				timer.Stop()
				return
			case <-timer.C:
				changed := c.refresh(ctx)
				if changed {
					now := time.Now().In(torontoLocation())
					nextDay := now.AddDate(0, 0, 1)
					nextRun = time.Date(nextDay.Year(), nextDay.Month(), nextDay.Day(), 10, 0, 0, 0, torontoLocation())
				} else {
					nextRun = nextRefreshTime(time.Now().In(torontoLocation()))
				}
			}
		}
	}()
}

var toronto, _ = time.LoadLocation("America/Toronto")

func torontoLocation() *time.Location {
	if toronto != nil {
		return toronto
	}
	return time.UTC
}

func nextRefreshTime(now time.Time) time.Time {
	now = now.In(torontoLocation())
	date := time.Date(now.Year(), now.Month(), now.Day(), now.Hour()+1, 0, 0, 0, torontoLocation())
	if now.Hour() < 10 {
		return time.Date(now.Year(), now.Month(), now.Day(), 10, 0, 0, 0, torontoLocation())
	}

	if now.Hour() >= 21 {
		date = date.AddDate(0, 0, 1)
		return time.Date(date.Year(), date.Month(), date.Day(), 10, 0, 0, 0, torontoLocation())
	}
	return date
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
		return WorkoutSummary{}, fmt.Errorf("hevy summary refresh failed: %w", lastErr)
	}

	return WorkoutSummary{}, fmt.Errorf("hevy summary is not ready yet")
}

func (c *Client) refresh(ctx context.Context) bool {
	c.refreshMu.Lock()
	defer c.refreshMu.Unlock()

	if c.email == "" || c.password == "" {
		c.lastErr = fmt.Errorf("HEVY_EMAIL and HEVY_PASSWORD are not configured")
		return false
	}

	scrape := c.scrape
	if c.scrapeFn != nil {
		scrape = c.scrapeFn
	}
	summary, err := scrape(ctx, time.Now().In(torontoLocation()))
	if err != nil {
		// A disconnected HTTP request must not make the shared cache client
		// report a persistent refresh failure to the next request.
		if ctx.Err() == nil {
			c.lastErr = err
		}
		return false
	}

	c.lastErr = nil
	if item := c.cache.Get(summaryCacheKey); item != nil {
		oldJSON, _ := json.Marshal(item.Value())
		newJSON, _ := json.Marshal(summary)
		if bytes.Equal(oldJSON, newJSON) {
			return false
		}
	}
	c.cache.Set(summaryCacheKey, summary, ttlcache.DefaultTTL)
	return true
}

func (c *Client) scrape(ctx context.Context, now time.Time) (WorkoutSummary, error) {
	pw, err := playwright.Run()
	if err != nil {
		return WorkoutSummary{}, err
	}
	defer func() { _ = pw.Stop() }()
	launchOptions := playwright.BrowserTypeLaunchOptions{Headless: &c.headless}
	if c.chromiumPath != "" {
		launchOptions.ExecutablePath = &c.chromiumPath
	}
	browser, err := pw.Chromium.Launch(launchOptions)
	if err != nil {
		return WorkoutSummary{}, err
	}
	defer func() { _ = browser.Close() }()
	page, err := browser.NewPage()
	if err != nil {
		return WorkoutSummary{}, err
	}
	if _, err = page.Goto("https://hevy.com/login"); err != nil {
		return WorkoutSummary{}, err
	}
	page.WaitForTimeout(2000) //nolint:staticcheck // the login page needs time to render
	if err = page.GetByText("Or with email").Click(); err != nil {
		return WorkoutSummary{}, fmt.Errorf("could not open Hevy email login at %s (%s): %w", page.URL(), pageState(page), err)
	}
	page.WaitForTimeout(500) //nolint:staticcheck // the login form needs time to render
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

	page.WaitForTimeout(1500) //nolint:staticcheck // wait for the login redirect
	if strings.Contains(page.URL(), "/login") {
		return WorkoutSummary{}, fmt.Errorf("hevy login did not complete at %s (%s)", page.URL(), pageState(page))
	}
	bodyCh := make(chan []byte, 32)
	page.OnResponse(func(response playwright.Response) {
		url := strings.ToLower(response.URL())
		if response.Status() == 200 && (strings.Contains(url, "workout") || strings.Contains(url, "api.hevy")) {
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
	if strings.Contains(page.URL(), "/login") {
		return WorkoutSummary{}, fmt.Errorf("hevy profile redirected to login at %s (%s)", page.URL(), pageState(page))
	}

	workouts := make(map[string]workout)
	collect := func() error {
		for {
			select {
			case body := <-bodyCh:
				var data workoutPage
				if err := json.Unmarshal(body, &data); err != nil {
					continue
				}
				for _, item := range data.Workouts {
					key := item.ID
					if key == "" {
						key = item.ShortID
					}
					if key != "" {
						workouts[key] = item
					}
				}
			default:
				return nil
			}
		}
	}

	deadline := time.NewTimer(30 * time.Second)
	defer deadline.Stop()
	for attempt, unchanged := 0, 0; attempt < 20; attempt++ {
		select {
		case <-ctx.Done():
			return WorkoutSummary{}, ctx.Err()
		case <-deadline.C:
			if len(workouts) == 0 {
				return WorkoutSummary{}, fmt.Errorf("timed out waiting for Hevy workout data")
			}
			attempt = 20
		default:
		}

		before := len(workouts)
		if err := collect(); err != nil {
			return WorkoutSummary{}, err
		}
		if len(workouts) == before {
			unchanged++
		} else {
			unchanged = 0
		}
		if len(workouts) > 0 && unchanged >= 5 {
			break
		}

		_, _ = page.Evaluate(`() => {
			const candidates = [...document.querySelectorAll('div')]
				.filter(element => {
					const rect = element.getBoundingClientRect();
					const style = getComputedStyle(element);
					return rect.width > 0 && rect.height > 100 &&
						element.scrollHeight > element.clientHeight + 100 &&
						['auto', 'scroll'].includes(style.overflowY);
				})
				.sort((a, b) => b.scrollHeight - a.scrollHeight);
			const target = candidates[0] || document.scrollingElement;
			if (target) target.scrollTop = target.scrollHeight;
		}`)
		page.WaitForTimeout(1000) //nolint:staticcheck // allow workout data to load after scrolling
	}
	if err := collect(); err != nil {
		return WorkoutSummary{}, err
	}
	if len(workouts) == 0 {
		return WorkoutSummary{}, fmt.Errorf("hevy profile returned no workouts")
	}
	items := make([]workout, 0, len(workouts))
	for _, item := range workouts {
		items = append(items, item)
	}
	sort.Slice(items, func(i, j int) bool {
		return items[i].StartTime.After(items[j].StartTime.Time)
	})
	return summarize(items, now), nil
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
	for index := range inputCount {
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
