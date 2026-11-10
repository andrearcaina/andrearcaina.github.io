package github

import (
	"github.com/andrearcaina/andrearcaina.github.io/internal/cache"
)

type activityCache struct {
	store cache.Store[Activity]
}

type repositoryCache struct {
	store cache.Store[[]Repo]
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

func newRepositoryCache() *repositoryCache {
	return &repositoryCache{
		store: cache.New[[]Repo](activityCacheTTL, 1),
	}
}

func (c *repositoryCache) Get() ([]Repo, bool) {
	return c.store.Get()
}

func (c *repositoryCache) Set(repos []Repo) {
	c.store.Set(repos)
}

var _ cache.Store[Activity] = (*activityCache)(nil)
var _ cache.Store[[]Repo] = (*repositoryCache)(nil)
