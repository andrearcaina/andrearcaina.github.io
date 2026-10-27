package config

import "testing"

func TestNewUsesDefaults(t *testing.T) {
	for _, key := range []string{
		"PORT", "STATIC_DIR", "API_HOST", "SITE_HOST", "HEVY_USERNAME", "HEVY_HEADLESS",
		"ALLOWED_ORIGINS", "RESEND_API_KEY", "EMAIL", "GITHUB_TOKEN", "HEVY_EMAIL",
		"HEVY_PASSWORD", "SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET", "SPOTIFY_REFRESH_TOKEN",
		"SPOTIFY_REDIRECT_URI",
	} {
		t.Setenv(key, "")
	}

	cfg := New()
	if cfg.Port != ":8080" || cfg.StaticDir != "./web/out" || cfg.APIHost != "api.andrearcaina.ca" {
		t.Fatalf("unexpected defaults: %#v", cfg)
	}
	if cfg.HevyUsername != "andre331" || !cfg.HevyHeadless {
		t.Fatalf("unexpected Hevy defaults: username=%q headless=%v", cfg.HevyUsername, cfg.HevyHeadless)
	}
	if len(cfg.AllowedOrigins) == 0 {
		t.Fatal("expected default allowed origins")
	}
}

func TestNewReadsEnvironmentOverrides(t *testing.T) {
	t.Setenv("PORT", "9090")
	t.Setenv("STATIC_DIR", "/srv/site")
	t.Setenv("API_HOST", "api.example.test")
	t.Setenv("SITE_HOST", "www.example.test")
	t.Setenv("HEVY_USERNAME", "tester")
	t.Setenv("HEVY_HEADLESS", "false")
	t.Setenv("ALLOWED_ORIGINS", "https://one.test, https://two.test")

	cfg := New()
	if cfg.Port != ":9090" || cfg.StaticDir != "/srv/site" || cfg.APIHost != "api.example.test" {
		t.Fatalf("environment overrides not applied: %#v", cfg)
	}
	if cfg.SiteHost != "www.example.test" || cfg.HevyUsername != "tester" || cfg.HevyHeadless {
		t.Fatalf("environment overrides not applied: %#v", cfg)
	}
	if len(cfg.AllowedOrigins) != 4 || cfg.AllowedOrigins[0] != "https://one.test" || cfg.AllowedOrigins[1] != "https://two.test" {
		t.Fatalf("allowed origins = %#v", cfg.AllowedOrigins)
	}
}

func TestGetBoolFallsBackForInvalidValues(t *testing.T) {
	t.Setenv("INVALID_BOOL", "not-a-bool")
	if got := getBool("INVALID_BOOL", true); !got {
		t.Fatal("invalid bool should use true fallback")
	}
	if got := getBool("INVALID_BOOL", false); got {
		t.Fatal("invalid bool should use false fallback")
	}
}

func TestSplitOriginsTrimsEmptyValues(t *testing.T) {
	got := splitOrigins(" https://one.test, ,https://two.test, ")
	if len(got) != 2 || got[0] != "https://one.test" || got[1] != "https://two.test" {
		t.Fatalf("splitOrigins() = %#v", got)
	}
}
