package hevy

import (
	"context"
	"encoding/json"
	"fmt"
	"net/url"
	"os"
	"sort"
	"strings"
	"sync"
	"time"

	applogger "github.com/andrearcaina/andrearcaina.github.io/internal/logger"
	"github.com/mxschmitt/playwright-go"
)

type scraper struct {
	username     string
	email        string
	password     string
	headless     bool
	chromiumPath string
	logger       *applogger.Logger
}

type workoutCollector struct {
	mu             sync.Mutex
	workouts       map[string]workout
	totalCount     int
	totalKnown     bool
	historyBatches int
	signal         chan struct{}
	err            error
}

func newWorkoutCollector() *workoutCollector {
	return &workoutCollector{
		workouts: make(map[string]workout),
		signal:   make(chan struct{}, 1),
	}
}

func (c *workoutCollector) observe(response playwright.Response) {
	parsed, err := url.Parse(response.URL())
	if err != nil || response.Status() != 200 || parsed.Host != "api.hevyapp.com" {
		return
	}

	path := parsed.Path
	if path != "/workout_count" && path != "/user_workouts_paged" {
		return
	}

	body, err := response.Body()
	if err != nil {
		return
	}

	c.mu.Lock()
	defer c.mu.Unlock()
	switch path {
	case "/workout_count":
		var data struct {
			Count int `json:"workout_count"`
		}
		if err := json.Unmarshal(body, &data); err != nil || data.Count < 0 {
			return
		}
		c.totalCount = data.Count
		c.totalKnown = true
	case "/user_workouts_paged":
		var data workoutPage
		if err := json.Unmarshal(body, &data); err != nil {
			c.err = fmt.Errorf("invalid Hevy workout history response")
			break
		}
		for _, item := range data.Workouts {
			key := item.ID
			if key == "" {
				key = item.ShortID
			}
			if key != "" {
				c.workouts[key] = item
			}
		}
		c.historyBatches++
	default:
		return
	}
	select {
	case c.signal <- struct{}{}:
	default:
	}
}

func (c *workoutCollector) snapshot() (items []workout, totalCount, batches int, totalKnown bool, err error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	items = make([]workout, 0, len(c.workouts))
	for _, item := range c.workouts {
		items = append(items, item)
	}
	return items, c.totalCount, c.historyBatches, c.totalKnown, c.err
}

func (c *workoutCollector) waitForBatch(ctx context.Context, previous int) error {
	deadline := time.NewTimer(15 * time.Second)
	defer deadline.Stop()
	for {
		_, _, batches, _, err := c.snapshot()
		if err != nil {
			return err
		}
		if batches > previous {
			return nil
		}
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-deadline.C:
			return fmt.Errorf("hevy workout history stopped loading")
		case <-c.signal:
		}
	}
}

func newScraper(username, email, password string, headless bool, appLogger *applogger.Logger) *scraper {
	return &scraper{
		username:     username,
		email:        email,
		password:     password,
		headless:     headless,
		chromiumPath: os.Getenv("HEVY_CHROMIUM_PATH"),
		logger:       appLogger,
	}
}

func (s *scraper) scrape(ctx context.Context, now time.Time) (WorkoutSummary, error) {
	pw, err := playwright.Run()
	if err != nil {
		return WorkoutSummary{}, err
	}

	defer func() { _ = pw.Stop() }()
	launchOptions := playwright.BrowserTypeLaunchOptions{Headless: &s.headless}
	if s.chromiumPath != "" {
		launchOptions.ExecutablePath = &s.chromiumPath
	}
	browser, err := pw.Chromium.Launch(launchOptions)
	if err != nil {
		return WorkoutSummary{}, err
	}

	watchStop := make(chan struct{})
	watchExited := make(chan struct{})
	go func() {
		defer close(watchExited)
		select {
		case <-ctx.Done():
			s.logger.Info(ctx, "Hevy scraper context canceled", "action", "closing browser")
			_ = browser.Close()
		case <-watchStop:
		}
	}()
	defer func() {
		close(watchStop)
		<-watchExited
		_ = browser.Close()
		s.logger.Debug(ctx, "Hevy browser cleanup completed")
	}()

	page, err := browser.NewPage()
	if err != nil {
		return WorkoutSummary{}, err
	}
	if _, err = page.Goto("https://hevy.com/login"); err != nil {
		return WorkoutSummary{}, err
	}

	if err = page.GetByText("Or with email").WaitFor(); err != nil {
		return WorkoutSummary{}, fmt.Errorf("could not find Hevy email login at %s (%s): %w", page.URL(), pageState(page), err)
	}
	if err = page.GetByText("Or with email").Click(); err != nil {
		return WorkoutSummary{}, fmt.Errorf("could not open Hevy email login at %s (%s): %w", page.URL(), pageState(page), err)
	}
	emailInput := page.Locator("input:not([type]), input[type='email'], input[name='email'], input[autocomplete='email'], input[placeholder*='email' i], input[type='text']").First()
	if err = emailInput.Fill(s.email); err != nil {
		return WorkoutSummary{}, fmt.Errorf("could not find Hevy email input at %s (%s): %w", page.URL(), pageState(page), err)
	}
	if err = page.Locator("input[type='password'], input[name='password'], input[autocomplete='current-password']").First().Fill(s.password); err != nil {
		return WorkoutSummary{}, fmt.Errorf("could not find Hevy password input at %s (%s): %w", page.URL(), pageState(page), err)
	}
	if err = clickLoginButton(page); err != nil {
		return WorkoutSummary{}, fmt.Errorf("could not submit Hevy login at %s (%s): %w", page.URL(), pageState(page), err)
	}

	if _, err = page.WaitForFunction("() => !window.location.pathname.includes('/login')", nil); err != nil {
		return WorkoutSummary{}, fmt.Errorf("hevy login redirect timed out at %s (%s): %w", page.URL(), pageState(page), err)
	}
	if strings.Contains(page.URL(), "/login") {
		return WorkoutSummary{}, fmt.Errorf("hevy login did not complete at %s (%s)", page.URL(), pageState(page))
	}
	collector := newWorkoutCollector()
	page.OnResponse(collector.observe)
	if _, err = page.Goto("https://hevy.com/profile"); err != nil {
		return WorkoutSummary{}, err
	}
	if strings.Contains(page.URL(), "/login") {
		return WorkoutSummary{}, fmt.Errorf("hevy profile redirected to login at %s (%s)", page.URL(), pageState(page))
	}

	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	stalePages := 0
	for range 500 {
		items, totalCount, batches, totalKnown, err := collector.snapshot()
		if err != nil {
			return WorkoutSummary{}, err
		}
		if len(items) == 0 && totalKnown && totalCount == 0 {
			return summarize(items, now), nil
		}

		oldest := time.Time{}
		for _, item := range items {
			started := item.StartTime.In(now.Location())
			if oldest.IsZero() || started.Before(oldest) {
				oldest = started
			}
		}
		if (totalKnown && len(items) >= totalCount) || (!oldest.IsZero() && oldest.Before(startOfMonth)) {
			s.logger.Debug(ctx, "Hevy workout history collection complete", "workouts", len(items), "total", totalCount, "total_known", totalKnown, "batches", batches)
			break
		}
		s.logger.Debug(ctx, "Hevy workout history progress", "workouts", len(items), "total", totalCount, "total_known", totalKnown, "batches", batches)

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
		if err := collector.waitForBatch(ctx, batches); err != nil {
			return WorkoutSummary{}, err
		}
		nextItems, _, _, _, err := collector.snapshot()
		if err != nil {
			return WorkoutSummary{}, err
		}
		if len(nextItems) == len(items) {
			stalePages++
			if stalePages >= 3 {
				return WorkoutSummary{}, fmt.Errorf("hevy workout history pagination did not advance")
			}
		} else {
			stalePages = 0
		}
	}
	items, _, _, _, err := collector.snapshot()
	if err != nil {
		return WorkoutSummary{}, err
	}
	if len(items) == 0 {
		return WorkoutSummary{}, fmt.Errorf("hevy profile returned no workouts")
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
