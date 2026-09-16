package api

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"html"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/andrearcaina/andrearcaina.github.io/internal/config"
	"github.com/andrearcaina/andrearcaina.github.io/internal/email"
	"github.com/andrearcaina/andrearcaina.github.io/internal/github"
	"github.com/andrearcaina/andrearcaina.github.io/internal/logger"
	"github.com/andrearcaina/andrearcaina.github.io/internal/ratelimit"
	"github.com/go-chi/chi/v5"
)

type Handler struct {
	config         *config.Config
	logger         *logger.Logger
	client         *http.Client
	email          *email.Client
	github         *github.Client
	contactLimiter *ratelimit.Limiter
	githubLimiter  *ratelimit.Limiter
	spotifyLimiter *ratelimit.Limiter
	states         sync.Map
}

func NewHandler(cfg *config.Config, appLogger *logger.Logger) *Handler {
	return &Handler{
		config:         cfg,
		logger:         appLogger,
		client:         &http.Client{Timeout: 10 * time.Second},
		email:          email.NewClient(cfg.ResendAPIKey),
		github:         github.NewClient("andrearcaina"),
		contactLimiter: ratelimit.New(5, time.Minute),
		githubLimiter:  ratelimit.New(30, time.Minute),
		spotifyLimiter: ratelimit.New(30, time.Minute),
	}
}

func (h *Handler) ServeRoutes() chi.Router {
	router := chi.NewRouter()
	router.Use(h.cors, ratelimit.ClientIP)

	router.Get("/healthz", h.health)
	router.With(h.contactLimiter.Middleware).Post("/v1/contact", h.contact)
	router.With(h.githubLimiter.Middleware).Get("/v1/github/repos", h.githubRepos)
	router.With(h.spotifyLimiter.Middleware).Get("/v1/spotify/now-playing", h.spotify)
	router.With(h.spotifyLimiter.Middleware).Get("/v1/spotify/login", h.spotifyLogin)
	router.With(h.spotifyLimiter.Middleware).Get("/v1/spotify/callback", h.spotifyCallback)

	return router
}

func (h *Handler) githubRepos(w http.ResponseWriter, r *http.Request) {
	limit := 10
	if value := r.URL.Query().Get("limit"); value != "" {
		if parsed, err := strconv.Atoi(value); err == nil {
			limit = parsed
		}
	}
	if limit < 1 {
		limit = 1
	}
	if limit > 20 {
		limit = 20
	}

	repos, err := h.github.RecentRepositories(r.Context(), limit, 20)
	if err != nil {
		h.logger.Error(r.Context(), "Failed to fetch GitHub repositories", "error", err)
		writeError(w, http.StatusBadGateway, "failed to fetch GitHub repositories")
		return
	}

	writeJSON(w, http.StatusOK, repos)
}

func (h *Handler) health(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("ok\n"))
}

func (h *Handler) contact(w http.ResponseWriter, r *http.Request) {
	var request contactRequest
	if err := json.NewDecoder(io.LimitReader(r.Body, 64<<10)).Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	request.Name = strings.TrimSpace(request.Name)
	request.Email = strings.TrimSpace(request.Email)
	request.Message = strings.TrimSpace(request.Message)
	if request.Name == "" || request.Email == "" || request.Message == "" {
		writeError(w, http.StatusBadRequest, "name, email, and message are required")
		return
	}
	if len(request.Name) > 100 || len(request.Email) > 320 || len(request.Message) > 10000 || !strings.Contains(request.Email, "@") {
		writeError(w, http.StatusBadRequest, "invalid contact details")
		return
	}
	if h.config.ResendAPIKey == "" || h.config.Email == "" {
		writeError(w, http.StatusServiceUnavailable, "contact service is not configured")
		return
	}

	message := email.Message{
		From:    "Acme <onboarding@resend.dev>",
		To:      []string{h.config.Email},
		Subject: fmt.Sprintf("New contact from %s", request.Name),
		HTML: fmt.Sprintf("<h3>New Contact Form Submission</h3><p><strong>Name:</strong> %s</p><p><strong>Email:</strong> %s</p><p><strong>Message:</strong></p><p style=\"white-space: pre-wrap;\">%s</p>",
			html.EscapeString(request.Name), html.EscapeString(request.Email), html.EscapeString(request.Message)),
	}
	if err := h.email.Send(r.Context(), message); err != nil {
		h.logger.Error(r.Context(), "Failed to send contact email", "error", err)
		writeError(w, http.StatusBadGateway, "failed to send message")
		return
	}

	writeJSON(w, http.StatusOK, map[string]bool{"success": true})
}

func (h *Handler) spotify(w http.ResponseWriter, r *http.Request) {
	if h.config.SpotifyClientID == "" || h.config.SpotifySecret == "" || h.config.SpotifyRefresh == "" {
		writeJSON(w, http.StatusOK, map[string]any{"isPlaying": false, "message": "Spotify is not configured"})
		return
	}

	token, err := h.spotifyAccessToken(r)
	if err != nil {
		h.logger.Error(r.Context(), "Failed to get Spotify access token", "error", err)
		writeJSON(w, http.StatusOK, map[string]any{"isPlaying": false, "message": "Currently listening to nothing"})
		return
	}

	request, err := http.NewRequestWithContext(r.Context(), http.MethodGet, "https://api.spotify.com/v1/me/player/currently-playing", nil)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create Spotify request")
		return
	}
	request.Header.Set("Authorization", "Bearer "+token)
	response, err := h.client.Do(request)
	if err != nil {
		writeJSON(w, http.StatusOK, map[string]any{"isPlaying": false, "message": "Currently listening to nothing"})
		return
	}
	defer response.Body.Close()
	if response.StatusCode == http.StatusNoContent || response.StatusCode >= http.StatusBadRequest {
		writeJSON(w, http.StatusOK, map[string]any{"isPlaying": false, "message": "Not currently listening to anything"})
		return
	}

	var playing spotifyCurrentlyPlaying
	if err := json.NewDecoder(response.Body).Decode(&playing); err != nil || playing.Item == nil {
		writeJSON(w, http.StatusOK, map[string]any{"isPlaying": false, "message": "Not currently listening to anything"})
		return
	}

	artists := make([]string, 0, len(playing.Item.Artists))
	for _, artist := range playing.Item.Artists {
		artists = append(artists, artist.Name)
	}
	imageURL := ""
	if len(playing.Item.Album.Images) > 0 {
		imageURL = playing.Item.Album.Images[0].URL
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"isPlaying":     playing.IsPlaying,
		"title":         playing.Item.Name,
		"artist":        strings.Join(artists, ", "),
		"album":         playing.Item.Album.Name,
		"albumImageUrl": imageURL,
		"songUrl":       playing.Item.ExternalURLs.Spotify,
		"duration":      playing.Item.Duration,
		"progress":      playing.Progress,
		"explicit":      playing.Item.Explicit,
	})
}

func (h *Handler) spotifyAccessToken(r *http.Request) (string, error) {
	form := url.Values{
		"grant_type":    {"refresh_token"},
		"refresh_token": {h.config.SpotifyRefresh},
	}
	request, err := http.NewRequestWithContext(r.Context(), http.MethodPost, "https://accounts.spotify.com/api/token", strings.NewReader(form.Encode()))
	if err != nil {
		return "", err
	}
	request.SetBasicAuth(h.config.SpotifyClientID, h.config.SpotifySecret)
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	response, err := h.client.Do(request)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()
	body, err := io.ReadAll(io.LimitReader(response.Body, 4<<10))
	if err != nil {
		return "", err
	}
	if response.StatusCode >= http.StatusBadRequest {
		return "", fmt.Errorf("Spotify token endpoint returned status %d: %s", response.StatusCode, strings.TrimSpace(string(body)))
	}

	var token spotifyTokenResponse
	if err := json.Unmarshal(body, &token); err != nil {
		return "", err
	}
	return token.AccessToken, nil
}

func (h *Handler) spotifyLogin(w http.ResponseWriter, r *http.Request) {
	state, err := randomState()
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create OAuth state")
		return
	}
	h.states.Store(state, time.Now().Add(10*time.Minute))

	redirectURI := h.config.SpotifyRedirect
	query := url.Values{
		"response_type": {"code"},
		"client_id":     {h.config.SpotifyClientID},
		"scope":         {"user-read-currently-playing user-read-playback-state"},
		"redirect_uri":  {redirectURI},
		"state":         {state},
	}
	http.Redirect(w, r, "https://accounts.spotify.com/authorize?"+query.Encode(), http.StatusFound)
}

func (h *Handler) spotifyCallback(w http.ResponseWriter, r *http.Request) {
	state := r.URL.Query().Get("state")
	value, ok := h.states.LoadAndDelete(state)
	if !ok || time.Now().After(value.(time.Time)) {
		writeError(w, http.StatusBadRequest, "invalid OAuth state")
		return
	}

	code := r.URL.Query().Get("code")
	if code == "" {
		writeError(w, http.StatusBadRequest, "authorization code is missing")
		return
	}

	form := url.Values{
		"grant_type":   {"authorization_code"},
		"code":         {code},
		"redirect_uri": {h.config.SpotifyRedirect},
	}
	request, err := http.NewRequestWithContext(r.Context(), http.MethodPost, "https://accounts.spotify.com/api/token", strings.NewReader(form.Encode()))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create Spotify request")
		return
	}
	request.SetBasicAuth(h.config.SpotifyClientID, h.config.SpotifySecret)
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	response, err := h.client.Do(request)
	if err != nil {
		writeError(w, http.StatusBadGateway, "Spotify token exchange failed")
		return
	}
	defer response.Body.Close()
	if response.StatusCode >= http.StatusBadRequest {
		writeError(w, http.StatusBadGateway, "Spotify token exchange failed")
		return
	}

	var token struct {
		RefreshToken string `json:"refresh_token"`
	}
	if err := json.NewDecoder(response.Body).Decode(&token); err != nil {
		writeError(w, http.StatusBadGateway, "invalid Spotify token response")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message":       "Spotify authorization succeeded; store the refresh token as SPOTIFY_REFRESH_TOKEN",
		"refresh_token": token.RefreshToken,
	})
}

func (h *Handler) cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		for _, allowed := range h.config.AllowedOrigins {
			if origin == allowed {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Vary", "Origin")
				break
			}
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func randomState() (string, error) {
	value := make([]byte, 24)
	if _, err := rand.Read(value); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(value), nil
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}
