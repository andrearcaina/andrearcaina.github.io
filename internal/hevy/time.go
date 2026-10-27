package hevy

import (
	"encoding/json"
	"time"
)

type flexibleTime struct {
	time.Time
}

func (t *flexibleTime) UnmarshalJSON(value []byte) error {
	var number float64
	if json.Unmarshal(value, &number) == nil {
		t.Time = time.Unix(int64(number), 0)
		return nil
	}

	var text string
	if err := json.Unmarshal(value, &text); err != nil {
		return err
	}
	parsed, err := time.Parse(time.RFC3339, text)
	if err != nil {
		return err
	}
	t.Time = parsed
	return nil
}
