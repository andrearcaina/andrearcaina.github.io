package hevy

import (
	"bytes"
	"encoding/json"

	"github.com/jellydator/ttlcache/v3"
)

type summaryCache struct {
	cache *ttlcache.Cache[string, WorkoutSummary]
}

func newSummaryCache() *summaryCache {
	return &summaryCache{
		cache: ttlcache.New[string, WorkoutSummary](
			ttlcache.WithTTL[string, WorkoutSummary](ttlcache.NoTTL),
			ttlcache.WithCapacity[string, WorkoutSummary](1),
		),
	}
}

func (c *summaryCache) Get() (WorkoutSummary, bool) {
	item := c.cache.Get(summaryCacheKey)
	if item == nil {
		return WorkoutSummary{}, false
	}

	return item.Value(), true
}

func (c *summaryCache) SetIfChanged(summary WorkoutSummary) bool {
	if current, ok := c.Get(); ok {
		oldJSON, _ := json.Marshal(current)
		newJSON, _ := json.Marshal(summary)

		if bytes.Equal(oldJSON, newJSON) {
			return false
		}
	}
	c.cache.Set(summaryCacheKey, summary, ttlcache.DefaultTTL)
	return true
}
