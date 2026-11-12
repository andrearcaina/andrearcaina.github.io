package hevy

import "time"

// MockSummary provides stable development data without launching Playwright or Chromium.
func MockSummary(now time.Time) WorkoutSummary {
	return WorkoutSummary{
		Month:           now.Format("January"),
		Year:            now.Year(),
		MonthNumber:     int(now.Month()),
		Workouts:        6,
		DurationSeconds: 5*60*60 + 53*60,
		VolumeLbs:       85915,
		WorkoutDays:     []int{3, 4, 6, 9, 10, 11},
		RecentWorkout: &WorkoutPreview{
			Date:            now.Format("Jan 2, 2006"),
			Title:           "Functional leg day",
			URL:             "https://hevy.com",
			DurationSeconds: 52 * 60,
			VolumeLbs:       0,
			Sets:            9,
			Records:         3,
		},
	}
}
