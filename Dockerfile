FROM node:22-alpine AS web-build

WORKDIR /src
COPY web/package*.json ./web/
RUN npm --prefix web ci

COPY web ./web
RUN npm --prefix web run build

FROM golang:1.26-alpine AS build

WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY --from=web-build /src/web/out ./web/out
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/site ./cmd/server

FROM alpine:3.22 AS production

RUN apk add --no-cache ca-certificates \
    && addgroup -S -g 10001 site \
    && adduser -S -D -H -u 10001 -G site site

WORKDIR /app
COPY --from=build /out/site ./site
COPY --from=build /src/web/out ./web/out

ENV PORT=8080 STATIC_DIR=./web/out
USER 10001:10001
EXPOSE 8080

ENTRYPOINT ["./site"]
