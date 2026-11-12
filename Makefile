.PHONY: build build-go install-web build-web typecheck-web playwright clean-web run dev dev-mock fmt tidy test vet lint check clean

default: run

build: build-go build-web

install-web:
	npm --prefix web ci

build-web: clean-web
	npm --prefix web run build

typecheck-web:
	npm --prefix web run typecheck

run-playwright:
	go run github.com/mxschmitt/playwright-go/cmd/playwright@v0.6201.1 install chromium

build-go:
	mkdir -p bin
	go build -o bin/site ./cmd/server

run: build run-playwright
	PORT=localhost:8080 METRICS_PORT=localhost:9090 API_HOST=api.localhost ./bin/site

dev: build
	PORT=localhost:8080 METRICS_PORT=localhost:9090 API_HOST=api.localhost HEVY_MOCK=true ./bin/site

fix:
	go fix ./...

fmt:
	gofmt -w cmd internal

tidy:
	go mod tidy

lint:
	golangci-lint run ./cmd/... ./internal/...

test:
	mkdir -p coverage
	go test ./... -race -coverprofile=coverage/coverage.out -covermode=atomic

vet:
	go vet ./...

view-coverage:
	go tool cover -html=coverage/coverage.out -o=coverage/coverage.html

check: fix fmt vet lint test typecheck-web view-coverage

clean-web:
	rm -rf web/out web/.next

clean: clean-web
	rm -rf coverage/*
	rm -rf bin/*
