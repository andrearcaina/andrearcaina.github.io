package hevy

import (
	"context"
	"fmt"
	"sync"
	"time"

	applogger "github.com/andrearcaina/andrearcaina.github.io/internal/logger"
)

const scrapeTimeout = 2 * time.Minute

type Client struct {
	email, password string
	cache           *summaryCache
	scraper         *scraper
	scrapeFn        func(context.Context, time.Time) (WorkoutSummary, error)
	refreshMu       sync.Mutex
	stateMu         sync.RWMutex
	lastErr         error
	workerMu        sync.Mutex
	worker          *worker
	logger          *applogger.Logger
}

func NewClient(username, email, password string, headless bool, appLogger *applogger.Logger) *Client {
	if appLogger == nil {
		appLogger = applogger.New()
	}

	return &Client{
		email:    email,
		password: password,
		cache:    newSummaryCache(),
		scraper:  newScraper(username, email, password, headless, appLogger),
		logger:   appLogger,
	}
}

func (c *Client) Start(ctx context.Context) {
	c.workerMu.Lock()
	defer c.workerMu.Unlock()
	if c.worker == nil {
		c.worker = newWorker(c)
	}

	c.worker.Start(ctx)
}

func (c *Client) CurrentMonthSummary(ctx context.Context, _ time.Time) (WorkoutSummary, error) {
	if summary, ok := c.cache.Get(); ok {
		c.logger.Info(ctx, "Hevy cache hit", "source", "memory")

		return summary, nil
	}

	c.logger.Info(ctx, "Hevy cache miss", "status", "initialization in progress")

	c.stateMu.RLock()
	lastErr := c.lastErr
	c.stateMu.RUnlock()
	if lastErr != nil {
		return WorkoutSummary{}, fmt.Errorf("hevy summary refresh failed: %w", lastErr)
	}
	if err := ctx.Err(); err != nil {
		return WorkoutSummary{}, err
	}
	return WorkoutSummary{}, fmt.Errorf("hevy summary is not ready yet")
}

func (c *Client) refresh(ctx context.Context) bool {
	c.refreshMu.Lock()
	defer c.refreshMu.Unlock()

	started := time.Now()
	c.logger.Info(ctx, "Hevy scrape started")

	if c.email == "" || c.password == "" {
		err := fmt.Errorf("HEVY_EMAIL and HEVY_PASSWORD are not configured")
		c.setLastErr(err)
		c.logger.Error(ctx, "Hevy scrape failed", "duration", time.Since(started), "error", err)
		return false
	}

	scrape := c.scraper.scrape
	if c.scrapeFn != nil {
		scrape = c.scrapeFn
	}

	scrapeCtx, cancel := context.WithTimeout(ctx, scrapeTimeout)
	defer cancel()
	summary, err := scrape(scrapeCtx, time.Now().In(torontoLocation()))
	if err != nil {
		if ctx.Err() == nil {
			c.setLastErr(err)
		}
		c.logger.Error(ctx, "Hevy scrape failed", "duration", time.Since(started), "error", err)
		return false
	}

	c.setLastErr(nil)

	changed := c.cache.SetIfChanged(summary)
	c.logger.Info(ctx, "Hevy scrape completed", "duration", time.Since(started), "cache_changed", changed, "workouts", summary.Workouts)
	return changed
}

func (c *Client) setLastErr(err error) {
	c.stateMu.Lock()
	c.lastErr = err
	c.stateMu.Unlock()
}
