package cache

import "testing"

func TestTTLStore(t *testing.T) {
	store := New[string](NoTTL, 1)

	if _, ok := store.Get(); ok {
		t.Fatal("empty store should not return a value")
	}

	store.Set("value")
	if got, ok := store.Get(); !ok || got != "value" {
		t.Fatalf("stored value = %q, %v", got, ok)
	}
}
