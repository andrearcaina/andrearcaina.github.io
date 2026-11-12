package hevy

import (
	"testing"
	"time"
)

func TestMockSummary(t *testing.T) {
	now := time.Date(2026, time.November, 11, 12, 0, 0, 0, time.UTC)
	got := MockSummary(now)
	if got.Month != "November" || got.Year != 2026 || got.MonthNumber != 11 || got.RecentWorkout == nil {
		t.Fatalf("mock summary = %#v", got)
	}
}
