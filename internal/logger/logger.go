package logger

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"path"
	"strings"

	"github.com/go-chi/chi/v5/middleware"
)

type Logger struct {
	logger *slog.Logger
}

func New() *Logger {
	return &Logger{
		logger: slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo})),
	}
}

func (l *Logger) Info(ctx context.Context, message string, args ...any) {
	l.logger.InfoContext(ctx, message, args...)
}

func (l *Logger) Debug(ctx context.Context, message string, args ...any) {
	l.logger.DebugContext(ctx, message, args...)
}

func (l *Logger) Error(ctx context.Context, message string, args ...any) {
	l.logger.ErrorContext(ctx, message, args...)
}

func (l *Logger) RequestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if quietPath(r.URL.Path) {
			next.ServeHTTP(w, r)
			return
		}

		wrapped := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
		defer func() {
			l.Info(r.Context(), "HTTP request",
				"method", r.Method,
				"path", r.URL.Path,
				"status", wrapped.Status(),
			)
		}()

		next.ServeHTTP(wrapped, r)
	})
}

func quietPath(p string) bool {
	return path.Ext(p) != "" ||
		strings.HasPrefix(p, "/_next/") ||
		strings.HasPrefix(p, "/images/") ||
		strings.HasPrefix(p, "/resume/") ||
		strings.HasPrefix(p, "/.well-known/")
}
