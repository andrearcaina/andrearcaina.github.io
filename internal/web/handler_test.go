package web

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/andrearcaina/andrearcaina.github.io/internal/config"
)

func TestIsAPIHost(t *testing.T) {
	handler := NewHandler(&config.Config{APIHost: "api.example.com"})
	for host, want := range map[string]bool{
		"api.example.com":      true,
		"api.example.com:8080": true,
		"www.example.com":      false,
		"127.0.0.1:8080":       false,
	} {
		if got := handler.isAPIHost(host); got != want {
			t.Errorf("isAPIHost(%q) = %v, want %v", host, got, want)
		}
	}
}

func TestStaticServesFileAndFallback(t *testing.T) {
	directory := t.TempDir()
	if err := os.WriteFile(filepath.Join(directory, "index.html"), []byte("home"), 0o600); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(directory, "404.html"), []byte("missing"), 0o600); err != nil {
		t.Fatal(err)
	}
	handler := NewHandler(&config.Config{StaticDir: directory})

	for path, want := range map[string]string{"/": "home", "/missing": "missing"} {
		recording := httptest.NewRecorder()
		handler.static(recording, httptest.NewRequest(http.MethodGet, path, nil))
		if recording.Code != http.StatusOK || recording.Body.String() != want {
			t.Errorf("static(%q) = %d %q, want %q", path, recording.Code, recording.Body.String(), want)
		}
	}
}

func TestHeaders(t *testing.T) {
	recording := httptest.NewRecorder()
	headers(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	})).ServeHTTP(recording, httptest.NewRequest(http.MethodGet, "/", nil))

	if recording.Header().Get("X-Content-Type-Options") != "nosniff" || recording.Header().Get("X-Frame-Options") != "DENY" {
		t.Fatalf("security headers = %v", recording.Header())
	}
}
