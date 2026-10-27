package ratelimit

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestClientIPUsesForwardedAddress(t *testing.T) {
	var got string
	next := http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		got = clientIPFromContext(r.Context())
	})
	request := httptest.NewRequest(http.MethodGet, "/", nil)
	request.RemoteAddr = "10.0.0.5:1234"
	request.Header.Set("X-Forwarded-For", "203.0.113.10, 10.0.0.5")

	ClientIP(next).ServeHTTP(httptest.NewRecorder(), request)
	if got != "203.0.113.10" {
		t.Fatalf("client IP = %q, want 203.0.113.10", got)
	}
}

func TestClientIPNormalizesRemoteAddress(t *testing.T) {
	var got string
	next := http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		got = clientIPFromContext(r.Context())
	})
	request := httptest.NewRequest(http.MethodGet, "/", nil)
	request.RemoteAddr = "[2001:db8::1]:443"

	ClientIP(next).ServeHTTP(httptest.NewRecorder(), request)
	if got != "2001:db8::1" {
		t.Fatalf("client IP = %q, want 2001:db8::1", got)
	}
}

func TestLimiterRejectsRequestsAfterLimit(t *testing.T) {
	limiter := New(1, time.Hour)
	next := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	})
	handler := ClientIP(limiter.Middleware(next))

	first := httptest.NewRequest(http.MethodGet, "/", nil)
	first.RemoteAddr = "192.0.2.1:1234"
	firstResponse := httptest.NewRecorder()
	handler.ServeHTTP(firstResponse, first)
	if firstResponse.Code != http.StatusNoContent {
		t.Fatalf("first request status = %d, want %d", firstResponse.Code, http.StatusNoContent)
	}

	second := httptest.NewRequest(http.MethodGet, "/", nil)
	second.RemoteAddr = "192.0.2.1:5678"
	secondResponse := httptest.NewRecorder()
	handler.ServeHTTP(secondResponse, second)
	if secondResponse.Code != http.StatusTooManyRequests {
		t.Fatalf("second request status = %d, want %d", secondResponse.Code, http.StatusTooManyRequests)
	}
	if secondResponse.Body.String() != `{"error":"rate limit exceeded"}` {
		t.Fatalf("second response body = %q", secondResponse.Body.String())
	}
}
