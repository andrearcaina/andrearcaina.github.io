package hevy

import (
	"sort"
	"time"
)

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
