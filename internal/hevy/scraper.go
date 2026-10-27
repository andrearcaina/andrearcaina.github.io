package hevy

import (
	"context"
	"encoding/json"
	"fmt"
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
	workouts := make(map[string]workout)
	var workoutsMu sync.Mutex
	page.OnResponse(func(response playwright.Response) {
		url := strings.ToLower(response.URL())
		if response.Status() == 200 && (strings.Contains(url, "workout") || strings.Contains(url, "api.hevy")) {
			if body, bodyErr := response.Body(); bodyErr == nil {
				var data workoutPage
				if json.Unmarshal(body, &data) == nil {
					workoutsMu.Lock()
					for _, item := range data.Workouts {
						key := item.ID
						if key == "" {
							key = item.ShortID
						}
						if key != "" {
							workouts[key] = item
						}
					}
					workoutsMu.Unlock()
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

	workoutCount := func() int {
		workoutsMu.Lock()
		defer workoutsMu.Unlock()
		return len(workouts)
	}

	deadline := time.NewTimer(30 * time.Second)
	defer deadline.Stop()
	for attempt, unchanged := 0, 0; attempt < 20; attempt++ {
		select {
		case <-ctx.Done():
			return WorkoutSummary{}, ctx.Err()
		case <-deadline.C:
			if workoutCount() == 0 {
				return WorkoutSummary{}, fmt.Errorf("timed out waiting for Hevy workout data")
			}
			attempt = 20
		default:
		}

		before := workoutCount()
		if workoutCount() == before {
			unchanged++
		} else {
			unchanged = 0
		}
		if workoutCount() > 0 && unchanged >= 5 {
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
		page.WaitForTimeout(250) //nolint:staticcheck // allow workout data to load after scrolling
	}
	if workoutCount() == 0 {
		return WorkoutSummary{}, fmt.Errorf("hevy profile returned no workouts")
	}
	workoutsMu.Lock()
	items := make([]workout, 0, len(workouts))
	for _, item := range workouts {
		items = append(items, item)
	}
	workoutsMu.Unlock()
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
