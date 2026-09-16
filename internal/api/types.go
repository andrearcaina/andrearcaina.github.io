package api

type contactRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Message string `json:"message"`
}

type spotifyTokenResponse struct {
	AccessToken string `json:"access_token"`
}

type spotifyCurrentlyPlaying struct {
	IsPlaying bool `json:"is_playing"`
	Progress  int  `json:"progress_ms"`
	Item      *struct {
		Name     string `json:"name"`
		Duration int    `json:"duration_ms"`
		Explicit bool   `json:"explicit"`
		Artists  []struct {
			Name string `json:"name"`
		} `json:"artists"`
		Album struct {
			Name   string `json:"name"`
			Images []struct {
				URL string `json:"url"`
			} `json:"images"`
		} `json:"album"`
		ExternalURLs struct {
			Spotify string `json:"spotify"`
		} `json:"external_urls"`
	} `json:"item"`
}
