.PHONY: build build-go install-web build-web playwright clean-web run dev fmt tidy test vet lint check clean

build: build-web build-go

install-web:
	npm --prefix web ci

build-web: clean-web
	npm --prefix web run build

run-playwright:
	go run github.com/mxschmitt/playwright-go/cmd/playwright@v0.6201.1 install chromium

build-go:
	mkdir -p bin
	go build -o bin/site ./cmd/server

run: build run-playwright
	./bin/site

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

check: fix fmt vet lint test view-coverage

clean-web:
	rm -rf web/out web/.next

clean: clean-web
	rm -rf coverage/*
	rm -rf bin/*
