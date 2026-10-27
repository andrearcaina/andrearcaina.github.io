package hevy

import (
	"context"
	"sync"
	"time"
)

var toronto, _ = time.LoadLocation("America/Toronto")

type worker struct {
	client    *Client
	startOnce sync.Once
}

func newWorker(client *Client) *worker {
	return &worker{client: client}
}

func (w *worker) Start(ctx context.Context) {
	w.startOnce.Do(func() {
		go w.run(ctx)
	})
}

func (w *worker) run(ctx context.Context) {
	w.client.logger.Info(ctx, "Hevy worker started", "timezone", torontoLocation().String())
	w.client.refresh(ctx)
	w.client.logger.Info(ctx, "Hevy worker warm-up completed")

	for {
		nextRun := nextRefreshTime(time.Now().In(torontoLocation()))

		w.client.logger.Info(ctx, "Hevy worker sleeping", "next_run", nextRun, "duration", time.Until(nextRun))
		timer := time.NewTimer(time.Until(nextRun))
		select {
		case <-ctx.Done():
			if !timer.Stop() {
				<-timer.C
			}
			w.client.logger.Info(ctx, "Hevy worker stopped", "reason", "context canceled")
			return
		case <-timer.C:
			w.client.logger.Info(ctx, "Hevy worker woke up", "scheduled_for", nextRun)
			w.client.refresh(ctx)
		}
	}
}

func torontoLocation() *time.Location {
	if toronto != nil {
		return toronto
	}
	return time.UTC
}

func nextRefreshTime(now time.Time) time.Time {
	now = now.In(torontoLocation())
	date := time.Date(now.Year(), now.Month(), now.Day(), now.Hour()+1, 0, 2, 0, torontoLocation())
	if now.Hour() < 10 {
		return time.Date(now.Year(), now.Month(), now.Day(), 10, 0, 2, 0, torontoLocation())
	}
	if now.Hour() >= 21 {
		date = date.AddDate(0, 0, 1)
		return time.Date(date.Year(), date.Month(), date.Day(), 10, 0, 2, 0, torontoLocation())
	}
	return date
}
