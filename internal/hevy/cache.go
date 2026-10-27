package hevy

import (
	"bytes"
	"encoding/json"

	"github.com/andrearcaina/andrearcaina.github.io/internal/cache"
)

type summaryCache struct {
	store cache.Store[WorkoutSummary]
}

func newSummaryCache() *summaryCache {
	return &summaryCache{
		store: cache.New[WorkoutSummary](cache.NoTTL, 1),
	}
}

func (c *summaryCache) Get() (WorkoutSummary, bool) {
	return c.store.Get()
}

func (c *summaryCache) SetIfChanged(summary WorkoutSummary) bool {
	if current, ok := c.Get(); ok {
		oldJSON, _ := json.Marshal(current)
		newJSON, _ := json.Marshal(summary)

		if bytes.Equal(oldJSON, newJSON) {
			return false
		}
	}
	c.store.Set(summary)
	return true
}
