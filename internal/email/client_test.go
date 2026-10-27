package email

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"testing"

	"resty.dev/v3"
)

func TestSendPostsMessageToResend(t *testing.T) {
	var received Message
	transport := roundTripFunc(func(r *http.Request) (*http.Response, error) {
		if r.Method != http.MethodPost {
			t.Errorf("method = %s, want POST", r.Method)
		}
		if r.Header.Get("Authorization") != "Bearer test-key" {
			t.Errorf("authorization = %q", r.Header.Get("Authorization"))
		}
		if err := json.NewDecoder(r.Body).Decode(&received); err != nil {
			t.Errorf("decode request: %v", err)
		}
		return response(http.StatusOK, "{}"), nil
	})

	client := &Client{
		client:   resty.New().SetTransport(transport),
		apiKey:   "test-key",
		endpoint: "https://test.resend.local/emails",
	}
	err := client.Send(context.Background(), Message{
		From: "Site <site@example.com>", To: []string{"person@example.com"}, Subject: "Test subject", HTML: "<p>Hello</p>",
	})
	if err != nil {
		t.Fatalf("Send() error = %v", err)
	}
	if received.Subject != "Test subject" || len(received.To) != 1 || received.To[0] != "person@example.com" {
		t.Fatalf("message = %#v", received)
	}
}

func TestSendReturnsResendError(t *testing.T) {
	transport := roundTripFunc(func(*http.Request) (*http.Response, error) {
		return response(http.StatusUnauthorized, "invalid API key"), nil
	})
	client := &Client{client: resty.New().SetTransport(transport), apiKey: "bad-key", endpoint: "https://test.resend.local/emails"}
	if err := client.Send(context.Background(), Message{}); err == nil {
		t.Fatal("Send() error = nil, want Resend error")
	}
}

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(request *http.Request) (*http.Response, error) {
	return f(request)
}

func response(status int, body string) *http.Response {
	return &http.Response{
		StatusCode: status,
		Status:     fmt.Sprintf("%d", status),
		Body:       io.NopCloser(strings.NewReader(body)),
		Header:     make(http.Header),
	}
}
