.PHONY: build build-go install-web build-web clean-web run dev fmt fmt-check tidy test vet check clean

build: build-web build-go

install-web:
	npm --prefix web ci

build-web: clean-web
	npm --prefix web run build

build-go:
	mkdir -p bin
	go build -o bin/site ./cmd/server

run: build
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
