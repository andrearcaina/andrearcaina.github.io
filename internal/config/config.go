package config

import (
	"os"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                string
	StaticDir           string
	APIHost             string
	SiteHost            string
	ResendAPIKey        string
	Email               string
	GitHubToken         string
	HevyUsername        string
	HevyEmail           string
	HevyPassword        string
	HevyHeadless        bool
	HevyRefreshInterval time.Duration
	SpotifyClientID     string
	SpotifySecret       string
	SpotifyRefresh      string
	SpotifyRedirect     string
	AllowedOrigins      []string
}

func New() *Config {
	_ = godotenv.Load()
	siteHost := getEnv("SITE_HOST", "andrearcaina.ca")
	allowedOrigins := splitOrigins(getEnv("ALLOWED_ORIGINS", "https://andrearcaina.ca,https://www.andrearcaina.ca,https://andrearcaina.vercel.app,http://localhost:3000,http://localhost:8080"))
	for _, origin := range []string{
		"https://" + strings.TrimPrefix(siteHost, "www."),
		"https://www." + strings.TrimPrefix(siteHost, "www."),
	} {
		if !contains(allowedOrigins, origin) {
			allowedOrigins = append(allowedOrigins, origin)
		}
	}

	return &Config{
		Port:                ":" + getEnv("PORT", "8080"),
		StaticDir:           getEnv("STATIC_DIR", "./web/out"),
		APIHost:             getEnv("API_HOST", "api.andrearcaina.ca"),
		SiteHost:            siteHost,
		ResendAPIKey:        os.Getenv("RESEND_API_KEY"),
		Email:               os.Getenv("EMAIL"),
		GitHubToken:         os.Getenv("GITHUB_TOKEN"),
		HevyUsername:        getEnv("HEVY_USERNAME", "andre331"),
		HevyEmail:           os.Getenv("HEVY_EMAIL"),
		HevyPassword:        os.Getenv("HEVY_PASSWORD"),
		HevyHeadless:        getBool("HEVY_HEADLESS", true),
		HevyRefreshInterval: getDuration("HEVY_REFRESH_INTERVAL", 30*time.Minute),
		SpotifyClientID:     os.Getenv("SPOTIFY_CLIENT_ID"),
		SpotifySecret:       os.Getenv("SPOTIFY_CLIENT_SECRET"),
		SpotifyRefresh:      os.Getenv("SPOTIFY_REFRESH_TOKEN"),
		SpotifyRedirect:     os.Getenv("SPOTIFY_REDIRECT_URI"),
		AllowedOrigins:      allowedOrigins,
	}
}

func contains(values []string, target string) bool {
	return slices.Contains(values, target)
}

func getBool(key string, fallback bool) bool {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func getDuration(key string, fallback time.Duration) time.Duration {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := time.ParseDuration(value)
	if err != nil || parsed <= 0 {
		return fallback
	}
	return parsed
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
