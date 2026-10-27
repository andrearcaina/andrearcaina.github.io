package hevy

import (
	"context"
	"reflect"
	"testing"
	"time"
)

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
	if cached, ok := client.cache.Get(); !ok || cached.Workouts != 1 {
		got := 0
		if ok {
			got = cached.Workouts
		}
		t.Fatalf("cached workouts = %d, want 1", got)
	}
}

func TestSummaryCacheSetIfChanged(t *testing.T) {
	cache := newSummaryCache()
	summary := WorkoutSummary{Month: "October", Year: 2026}
	if !cache.SetIfChanged(summary) {
		t.Fatal("first cache write should report a change")
	}
	if cache.SetIfChanged(summary) {
		t.Fatal("identical cache write should not report a change")
	}
	if got, ok := cache.Get(); !ok || !reflect.DeepEqual(got, summary) {
		t.Fatalf("cache value = %#v, %v", got, ok)
	}
}
