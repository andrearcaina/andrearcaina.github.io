# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS web-build

WORKDIR /src
COPY web/package*.json ./web/
RUN --mount=type=cache,target=/root/.npm \
    npm --prefix web ci

COPY web ./web
RUN npm --prefix web run build

FROM golang:1.26-bookworm AS build

WORKDIR /src
COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download
COPY . .
COPY --from=web-build /src/web/out ./web/out
RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/site ./cmd/server
RUN mkdir -p /out/playwright-driver \
    && PLAYWRIGHT_DRIVER_PATH=/out/playwright-driver \
       go run github.com/mxschmitt/playwright-go/cmd/playwright@v0.6201.1 --version

FROM debian:bookworm-slim AS production

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates chromium \
    && rm -rf /var/lib/apt/lists/* \
    && addgroup --system --gid 10001 site \
    && adduser --system --uid 10001 --gid 10001 --home /home/site site \
    && mkdir -p /home/site/.cache \
    && chown -R site:site /home/site

WORKDIR /app
COPY --from=build /out/site ./site
COPY --from=build /src/web/out ./web/out
COPY --from=build --chown=site:site /out/playwright-driver /opt/playwright-driver

ENV PORT=8080 STATIC_DIR=./web/out \
    PLAYWRIGHT_DRIVER_PATH=/opt/playwright-driver \
    HEVY_CHROMIUM_PATH=/usr/bin/chromium
USER 10001:10001
EXPOSE 8080

ENTRYPOINT ["./site"]
