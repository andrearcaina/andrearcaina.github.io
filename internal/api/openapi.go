package api

import (
	_ "embed"
	"net/http"
)

var (
	//go:embed openapi.yaml
	openAPISpec []byte
	//go:embed docs.html
	docsPage []byte
)

func openapi(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/yaml; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(openAPISpec)
}

func docs(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(docsPage)
}
