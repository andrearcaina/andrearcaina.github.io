package hevy

import (
	"encoding/json"
	"testing"
	"time"
)

func TestSummarizeFiltersMonthAndFutureWorkouts(t *testing.T) {
	location := time.FixedZone("Toronto", -4*60*60)
	now := time.Date(2026, 10, 27, 12, 0, 0, 0, location)
	workouts := []workout{
		{ID: "old", StartTime: flexibleTime{Time: time.Date(2026, 9, 30, 10, 0, 0, 0, location)}},
		{ID: "valid-1", ShortID: "v1", StartTime: flexibleTime{Time: time.Date(2026, 10, 25, 10, 0, 0, 0, location)}, EndTime: flexibleTime{Time: time.Date(2026, 10, 25, 11, 30, 0, 0, location)}, EstimatedVolumeKg: 10},
		{ID: "valid-2", StartTime: flexibleTime{Time: time.Date(2026, 10, 27, 11, 0, 0, 0, location)}},
		{ID: "future", StartTime: flexibleTime{Time: time.Date(2026, 10, 28, 10, 0, 0, 0, location)}},
	}

	got := summarize(workouts, now)
	if got.Workouts != 2 || got.DurationSeconds != 5400 || len(got.WorkoutDays) != 2 || got.WorkoutDays[0] != 25 || got.WorkoutDays[1] != 27 {
		t.Fatalf("summary = %#v", got)
	}
	if got.RecentWorkout == nil || got.RecentWorkout.URL != "https://hevy.com/workout/v1" {
		t.Fatalf("recent workout = %#v", got.RecentWorkout)
	}
}

func TestPreviewCountsSetsAndRecords(t *testing.T) {
	location := time.UTC
	item := workout{
		ID:                "workout-id",
		StartTime:         flexibleTime{Time: time.Date(2026, 10, 27, 14, 0, 0, 0, location)},
		EndTime:           flexibleTime{Time: time.Date(2026, 10, 27, 14, 45, 0, 0, location)},
		Name:              "Upper body",
		EstimatedVolumeKg: 12.5,
		Exercises:         []exercise{{Sets: []set{{PRs: []json.RawMessage{{}, {}}}, {}}}},
	}

	got := preview(item, location)
	if got.URL != "https://hevy.com/workout/workout-id" || got.Title != "Upper body" || got.Sets != 2 || got.Records != 2 || got.DurationSeconds != 2700 {
		t.Fatalf("preview = %#v", got)
	}
}
