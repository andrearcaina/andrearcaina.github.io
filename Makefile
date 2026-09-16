.PHONY: build build-go build-web run dev fmt fmt-check tidy test vet check clean

build: build-web build-go

build-web:
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

check: fmt-check test vet

clean:
	rm -rf bin/*
