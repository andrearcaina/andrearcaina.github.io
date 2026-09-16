package web

import (
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/andrearcaina/andrearcaina.github.io/internal/api"
	"github.com/andrearcaina/andrearcaina.github.io/internal/config"
	"github.com/andrearcaina/andrearcaina.github.io/internal/logger"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type Handler struct {
	config *config.Config
}

func NewHandler(cfg *config.Config) *Handler {
	return &Handler{config: cfg}
}

func (h *Handler) ServeRoutes(appLogger *logger.Logger, apiHandler *api.Handler) chi.Router {
	router := chi.NewRouter()
	router.Use(
		middleware.Recoverer,
		appLogger.RequestLogger,
		headers,
	)

	router.Get("/healthz", h.health)
	apiRoutes := apiHandler.ServeRoutes()
	serve := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if h.isAPIHost(r.Host) {
			apiRoutes.ServeHTTP(w, r)
			return
		}
		h.static(w, r)
	})
	router.Get("/", serve)
	router.Handle("/*", serve)

	return router
}

func (h *Handler) isAPIHost(host string) bool {
	if name, _, err := net.SplitHostPort(host); err == nil {
		host = name
	}
	if host == h.config.APIHost {
		return true
	}

	return h.config.APIHost == "api.localhost" && host == "127.0.0.1"
}

func (h *Handler) health(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("ok\n"))
}

func (h *Handler) static(w http.ResponseWriter, r *http.Request) {
	path := filepath.Join(h.config.StaticDir, filepath.Clean("/"+r.URL.Path))
	info, err := os.Stat(path)
	if err == nil && !info.IsDir() {
		http.ServeFile(w, r, path)
		return
	}

	if !strings.Contains(filepath.Base(r.URL.Path), ".") {
		indexPath := filepath.Join(path, "index.html")
		if _, err := os.Stat(indexPath); err == nil {
			http.ServeFile(w, r, indexPath)
			return
		}
	}

	http.ServeFile(w, r, filepath.Join(h.config.StaticDir, "404.html"))
}

func headers(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()")
		w.Header().Set("Content-Security-Policy", "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' http://api.localhost:8080 https://api.andrearcaina.ca https://api.github.com https://api.spotify.com https://accounts.spotify.com; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; upgrade-insecure-requests")
		next.ServeHTTP(w, r)
	})
}
