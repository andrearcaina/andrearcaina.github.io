package github

import (
	"github.com/andrearcaina/andrearcaina.github.io/internal/cache"
)

type activityCache struct {
	store cache.Store[Activity]
}

func newActivityCache() *activityCache {
	return &activityCache{
		store: cache.New[Activity](activityCacheTTL, 1),
	}
}

func (c *activityCache) Get() (Activity, bool) {
	return c.store.Get()
}

func (c *activityCache) Set(activity Activity) {
	c.store.Set(activity)
}

var _ cache.Store[Activity] = (*activityCache)(nil)
