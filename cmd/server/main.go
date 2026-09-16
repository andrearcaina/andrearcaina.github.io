package main

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/andrearcaina/andrearcaina.github.io/internal/api"
	"github.com/andrearcaina/andrearcaina.github.io/internal/config"
	"github.com/andrearcaina/andrearcaina.github.io/internal/logger"
	"github.com/andrearcaina/andrearcaina.github.io/internal/web"
	"golang.org/x/sync/errgroup"
)

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	appLogger := logger.New()
	cfg := config.New()

	apiHandler := api.NewHandler(cfg, appLogger)
	server := &http.Server{
		Addr:              cfg.Port,
		Handler:           web.NewHandler(cfg).ServeRoutes(appLogger, apiHandler),
		ReadHeaderTimeout: 5 * time.Second,
	}

	g, ctx := errgroup.WithContext(ctx)
	g.Go(func() error {
		appLogger.Info(ctx, "andrearcaina site listening", "port", cfg.Port, "static_dir", cfg.StaticDir)
		if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			return err
		}

		return nil
	})

	g.Go(func() error {
		<-ctx.Done()
		shutdown, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		return server.Shutdown(shutdown)
	})

	if err := g.Wait(); err != nil {
		appLogger.Error(context.Background(), "site server exited with error", "error", err)
		os.Exit(1)
	}

	appLogger.Info(context.Background(), "site server exited cleanly")
}
