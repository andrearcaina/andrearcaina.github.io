package cache

import (
	"time"

	"github.com/jellydator/ttlcache/v3"
)

type Store[T any] interface {
	Get() (T, bool)
	Set(T)
}

const NoTTL = ttlcache.NoTTL

type TTL[T any] struct {
	cache *ttlcache.Cache[string, T]
}

func New[T any](ttl time.Duration, capacity uint64) *TTL[T] {
	return &TTL[T]{
		cache: ttlcache.New[string, T](
			ttlcache.WithTTL[string, T](ttl),
			ttlcache.WithCapacity[string, T](capacity),
		),
	}
}

func (c *TTL[T]) Get() (T, bool) {
	item := c.cache.Get("value")
	if item == nil {
		var zero T
		return zero, false
	}

	return item.Value(), true
}

func (c *TTL[T]) Set(value T) {
	c.cache.Set("value", value, ttlcache.DefaultTTL)
}
