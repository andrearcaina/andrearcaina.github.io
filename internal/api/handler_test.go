package api

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/andrearcaina/andrearcaina.github.io/internal/config"
)

func TestCORS(t *testing.T) {
	handler := &Handler{config: &config.Config{AllowedOrigins: []string{"https://example.com"}}}
	next := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusTeapot) })
	recording := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/", nil)
	request.Header.Set("Origin", "https://example.com")
	handler.cors(next).ServeHTTP(recording, request)

	if recording.Code != http.StatusTeapot || recording.Header().Get("Access-Control-Allow-Origin") != "https://example.com" {
		t.Fatalf("CORS response = %d, headers = %v", recording.Code, recording.Header())
	}
}

func TestCORSOptions(t *testing.T) {
	handler := &Handler{config: &config.Config{}}
	recording := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodOptions, "/", nil)
	handler.cors(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		t.Fatal("OPTIONS request should not reach the next handler")
	})).ServeHTTP(recording, request)

	if recording.Code != http.StatusNoContent {
		t.Fatalf("OPTIONS status = %d, want %d", recording.Code, http.StatusNoContent)
	}
}

func TestContactValidation(t *testing.T) {
	handler := &Handler{config: &config.Config{}}
	recording := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPost, "/v1/contact", strings.NewReader(`{"name":"","email":"bad","message":""}`))
	handler.contact(recording, request)

	if recording.Code != http.StatusBadRequest || !strings.Contains(recording.Body.String(), "required") {
		t.Fatalf("contact response = %d %q", recording.Code, recording.Body.String())
	}
}

func TestSpotifyReturnsCurrentState(t *testing.T) {
	handler := &Handler{spotifyCurrent: spotifyNowPlaying{Message: "Not currently listening to anything"}}
	recording := httptest.NewRecorder()
	handler.spotify(recording, httptest.NewRequest(http.MethodGet, "/v1/spotify/now-playing", nil))

	if recording.Code != http.StatusOK || !strings.Contains(recording.Body.String(), "Not currently listening") {
		t.Fatalf("spotify response = %d %q", recording.Code, recording.Body.String())
	}
}
