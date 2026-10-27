package hevy

import (
	"context"
	"errors"
	"sync/atomic"
	"testing"
	"time"

	applogger "github.com/andrearcaina/andrearcaina.github.io/internal/logger"
)

func TestRefreshDoesNotRecordCanceledRequest(t *testing.T) {
	client := testClient()
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	client.scrapeFn = func(ctx context.Context, _ time.Time) (WorkoutSummary, error) {
		return WorkoutSummary{}, ctx.Err()
	}

	if client.refresh(ctx) {
		t.Fatal("canceled refresh should not report a cache change")
	}
	if client.lastErr != nil {
		t.Fatalf("canceled refresh recorded lastErr = %v", client.lastErr)
	}
}

func TestRefreshRecordsNonContextErrors(t *testing.T) {
	client := testClient()
	wantErr := errors.New("Hevy unavailable")
	client.scrapeFn = func(context.Context, time.Time) (WorkoutSummary, error) {
		return WorkoutSummary{}, wantErr
	}

	if client.refresh(context.Background()) {
		t.Fatal("failed refresh should not report a cache change")
	}
	if !errors.Is(client.lastErr, wantErr) {
		t.Fatalf("lastErr = %v, want %v", client.lastErr, wantErr)
	}
}

func TestCurrentMonthSummaryDoesNotScrapeOnCacheMiss(t *testing.T) {
	client := testClient()
	var scrapeCalls atomic.Int32
	client.scrapeFn = func(context.Context, time.Time) (WorkoutSummary, error) {
		scrapeCalls.Add(1)
		return WorkoutSummary{}, nil
	}

	_, err := client.CurrentMonthSummary(context.Background(), time.Now())
	if err == nil || scrapeCalls.Load() != 0 {
		t.Fatalf("cache miss = (%v), scrape calls = %d; expected immediate miss without scraping", err, scrapeCalls.Load())
	}
}

func testClient() *Client {
	return &Client{
		email:    "test@example.com",
		password: "password",
		cache:    newSummaryCache(),
		logger:   applogger.New(),
	}
}
