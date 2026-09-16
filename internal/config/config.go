package config

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port            string
	StaticDir       string
	APIHost         string
	SiteHost        string
	ResendAPIKey    string
	Email           string
	SpotifyClientID string
	SpotifySecret   string
	SpotifyRefresh  string
	SpotifyRedirect string
	AllowedOrigins  []string
}

func New() *Config {
	_ = godotenv.Load()

	return &Config{
		Port:            ":" + getEnv("PORT", "8080"),
		StaticDir:       getEnv("STATIC_DIR", "./web/out"),
		APIHost:         getEnv("API_HOST", "api.andrearcaina.ca"),
		SiteHost:        getEnv("SITE_HOST", "andrearcaina.ca"),
		ResendAPIKey:    os.Getenv("RESEND_API_KEY"),
		Email:           os.Getenv("EMAIL"),
		SpotifyClientID: os.Getenv("SPOTIFY_CLIENT_ID"),
		SpotifySecret:   os.Getenv("SPOTIFY_CLIENT_SECRET"),
		SpotifyRefresh:  os.Getenv("SPOTIFY_REFRESH_TOKEN"),
		SpotifyRedirect: os.Getenv("SPOTIFY_REDIRECT_URI"),
		AllowedOrigins:  splitOrigins(getEnv("ALLOWED_ORIGINS", "https://andrearcaina.ca,https://www.andrearcaina.ca,https://andrearcaina.vercel.app,http://localhost:3000,http://localhost:8080")),
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return fallback
}

func splitOrigins(value string) []string {
	values := strings.Split(value, ",")
	origins := make([]string, 0, len(values))

	for _, origin := range values {
		if origin = strings.TrimSpace(origin); origin != "" {
			origins = append(origins, origin)
		}
	}

	return origins
}
