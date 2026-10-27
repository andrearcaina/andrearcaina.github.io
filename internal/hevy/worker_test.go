package hevy

import (
	"context"
	"testing"
	"time"
)

func TestNextRefreshTimeUsesTorontoWindow(t *testing.T) {
	location := torontoLocation()
	tests := []struct {
		name string
		now  time.Time
		want time.Time
	}{
		{name: "before window", now: time.Date(2026, 10, 27, 9, 15, 0, 0, location), want: time.Date(2026, 10, 27, 10, 0, 2, 0, location)},
		{name: "between hourly runs", now: time.Date(2026, 10, 27, 13, 46, 0, 0, location), want: time.Date(2026, 10, 27, 14, 0, 2, 0, location)},
		{name: "after window", now: time.Date(2026, 10, 27, 21, 30, 0, 0, location), want: time.Date(2026, 10, 28, 10, 0, 2, 0, location)},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := nextRefreshTime(test.now); !got.Equal(test.want) {
				t.Fatalf("nextRefreshTime() = %s, want %s", got, test.want)
			}
		})
	}
}

func TestStartWarmsCacheAndCanBeCanceled(t *testing.T) {
	client := testClient()
	client.scrapeFn = func(ctx context.Context, _ time.Time) (WorkoutSummary, error) {
		return WorkoutSummary{Month: "October", Year: 2026}, ctx.Err()
	}
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	client.Start(ctx)

	deadline := time.After(time.Second)
	for {
		if _, ok := client.cache.Get(); ok {
			break
		}
		select {
		case <-deadline:
			t.Fatal("worker did not complete its startup scrape")
		default:
			time.Sleep(time.Millisecond)
		}
	}
	cancel()
}
