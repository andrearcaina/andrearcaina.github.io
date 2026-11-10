package github

import "testing"

func TestActivityCache(t *testing.T) {
	cache := newActivityCache()
	activity := Activity{
		Total:        3,
		PullRequests: []PullRequest{{Title: "Public PR"}},
	}

	if _, ok := cache.Get(); ok {
		t.Fatal("empty cache should not return a value")
	}

	cache.Set(activity)
	got, ok := cache.Get()
	if !ok {
		t.Fatal("cached activity should be available")
	}
	if got.Total != activity.Total || len(got.PullRequests) != 1 {
		t.Fatalf("cached activity = %#v, want %#v", got, activity)
	}
}

func TestRepositoryCache(t *testing.T) {
	cache := newRepositoryCache()
	repos := []Repo{{Name: "hyperion"}}

	if _, ok := cache.Get(); ok {
		t.Fatal("empty cache should not return a value")
	}

	cache.Set(repos)
	got, ok := cache.Get()
	if !ok || len(got) != 1 || got[0].Name != "hyperion" {
		t.Fatalf("cached repositories = %#v, want %#v", got, repos)
	}
}
