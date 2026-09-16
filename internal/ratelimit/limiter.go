package ratelimit

import (
	"context"
	"net"
	"net/http"
	"net/netip"
	"strings"
	"time"

	"github.com/go-chi/httprate"
)

type Limiter struct {
	middleware func(http.Handler) http.Handler
}

func New(requests int, period time.Duration) *Limiter {
	return &Limiter{
		middleware: httprate.LimitBy(
			requests,
			period,
			func(r *http.Request) (string, error) {
				return httprate.CanonicalizeIP(clientIPFromContext(r.Context())), nil
			},
			httprate.WithLimitHandler(func(w http.ResponseWriter, _ *http.Request) {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusTooManyRequests)
				_, _ = w.Write([]byte(`{"error":"rate limit exceeded"}`))
			}),
		),
	}
}

func (l *Limiter) Middleware(next http.Handler) http.Handler {
	return l.middleware(next)
}

type clientIPContextKey struct{}

func ClientIP(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		clientIP := r.RemoteAddr
		if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
			clientIP = strings.TrimSpace(strings.Split(forwarded, ",")[0])
		}
		if address, _, err := net.SplitHostPort(clientIP); err == nil {
			clientIP = address
		}
		if parsed, err := netip.ParseAddr(clientIP); err == nil {
			clientIP = parsed.String()
		}

		ctx := context.WithValue(r.Context(), clientIPContextKey{}, clientIP)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func clientIPFromContext(ctx context.Context) string {
	clientIP, _ := ctx.Value(clientIPContextKey{}).(string)

	return clientIP
}
