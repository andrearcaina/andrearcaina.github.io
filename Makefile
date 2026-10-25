.PHONY: build build-go install-web build-web playwright clean-web run dev fmt fmt-check tidy test vet check clean

build: build-web build-go

install-web:
	npm --prefix web ci

build-web: clean-web
	npm --prefix web run build

playwright:
	go run github.com/mxschmitt/playwright-go/cmd/playwright@v0.6201.1 install chromium

build-go:
	mkdir -p bin
	go build -o bin/site ./cmd/server

run: build playwright
	./bin/site

fmt:
	gofmt -w cmd internal

fmt-check:
	test -z "$$(gofmt -l cmd internal)"

tidy:
	go mod tidy

test:
	go test ./...

vet:
	go vet ./...

check: fmt-check vet test

clean-web:
	rm -rf web/out web/.next

clean: clean-web
	rm -rf bin/*
