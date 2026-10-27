package hevy

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/jellydator/ttlcache/v3"
)

func TestNextRefreshTimeUsesTorontoWindow(t *testing.T) {
	location := torontoLocation()
	tests := []struct {
		name string
		now  time.Time
		want time.Time
	}{
		{
			name: "before window",
			now:  time.Date(2026, 10, 27, 9, 15, 0, 0, location),
			want: time.Date(2026, 10, 27, 10, 0, 0, 0, location),
		},
		{
			name: "between hourly runs",
			now:  time.Date(2026, 10, 27, 13, 46, 0, 0, location),
			want: time.Date(2026, 10, 27, 14, 0, 0, 0, location),
		},
		{
			name: "after window",
			now:  time.Date(2026, 10, 27, 21, 30, 0, 0, location),
			want: time.Date(2026, 10, 28, 10, 0, 0, 0, location),
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := nextRefreshTime(test.now); !got.Equal(test.want) {
				t.Fatalf("nextRefreshTime() = %s, want %s", got, test.want)
			}
		})
	}
}

func TestRefreshWritesOnlyWhenJSONChanges(t *testing.T) {
	client := testClient()
	first := WorkoutSummary{Month: "October", Year: 2026, WorkoutDays: []int{27}}
	second := first

	client.scrapeFn = func(context.Context, time.Time) (WorkoutSummary, error) {
		return first, nil
	}
	if !client.refresh(context.Background()) {
		t.Fatal("first refresh should populate an empty cache")
	}

	client.scrapeFn = func(context.Context, time.Time) (WorkoutSummary, error) {
		return second, nil
	}
	if client.refresh(context.Background()) {
		t.Fatal("identical JSON should not be treated as a cache change")
	}

	second.Workouts = 1
	client.scrapeFn = func(context.Context, time.Time) (WorkoutSummary, error) {
		return second, nil
	}
	if !client.refresh(context.Background()) {
		t.Fatal("changed JSON should rewrite the cache")
	}
	if got := client.cache.Get(summaryCacheKey).Value().Workouts; got != 1 {
		t.Fatalf("cached workouts = %d, want 1", got)
	}
}

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

func testClient() *Client {
	return &Client{
		email:    "test@example.com",
		password: "password",
		cache: ttlcache.New[string, WorkoutSummary](
			ttlcache.WithTTL[string, WorkoutSummary](ttlcache.NoTTL),
		),
	}
}
