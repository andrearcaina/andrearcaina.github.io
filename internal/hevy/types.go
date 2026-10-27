package hevy

import (
	"encoding/json"
)

type WorkoutSummary struct {
	Month           string          `json:"month"`
	Year            int             `json:"year"`
	MonthNumber     int             `json:"monthNumber"`
	Workouts        int             `json:"workouts"`
	DurationSeconds int             `json:"durationSeconds"`
	VolumeLbs       float64         `json:"volumeLbs"`
	WorkoutDays     []int           `json:"workoutDays"`
	RecentWorkout   *WorkoutPreview `json:"recentWorkout,omitempty"`
}

type WorkoutPreview struct {
	Date            string  `json:"date"`
	Title           string  `json:"title"`
	URL             string  `json:"url"`
	DurationSeconds int     `json:"durationSeconds"`
	VolumeLbs       float64 `json:"volumeLbs"`
	Sets            int     `json:"sets"`
	Records         int     `json:"records"`
}

type workoutPage struct {
	Workouts []workout `json:"workouts"`
}

type workout struct {
	ID                string       `json:"id"`
	ShortID           string       `json:"short_id"`
	StartTime         flexibleTime `json:"start_time"`
	EndTime           flexibleTime `json:"end_time"`
	Name              string       `json:"name"`
	EstimatedVolumeKg float64      `json:"estimated_volume_kg"`
	Exercises         []exercise   `json:"exercises"`
}

type exercise struct {
	Sets []set `json:"sets"`
}

type set struct {
	PRs []json.RawMessage `json:"prs"`
}
