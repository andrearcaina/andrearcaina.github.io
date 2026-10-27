package hevy

import (
	"encoding/json"
	"testing"
	"time"
)

func TestFlexibleTimeUnmarshalsUnixTimestamp(t *testing.T) {
	var got flexibleTime
	if err := json.Unmarshal([]byte("1761573600"), &got); err != nil {
		t.Fatal(err)
	}

	want := time.Unix(1761573600, 0)
	if !got.Equal(want) {
		t.Fatalf("time = %s, want %s", got, want)
	}
}

func TestFlexibleTimeUnmarshalsRFC3339(t *testing.T) {
	var got flexibleTime
	if err := json.Unmarshal([]byte(`"2026-10-27T14:00:00Z"`), &got); err != nil {
		t.Fatal(err)
	}

	want := time.Date(2026, 10, 27, 14, 0, 0, 0, time.UTC)
	if !got.Equal(want) {
		t.Fatalf("time = %s, want %s", got, want)
	}
}

func TestFlexibleTimeRejectsInvalidValue(t *testing.T) {
	var got flexibleTime
	if err := json.Unmarshal([]byte(`"not-a-time"`), &got); err == nil {
		t.Fatal("invalid timestamp should return an error")
	}
}
