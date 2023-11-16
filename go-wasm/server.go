//go:build !js && !wasm
// +build !js,!wasm

package main

import (
	"net/http"

	"github.com/a-h/templ"

	"go-wasm/templates"
)

func main() {
	http.Handle("/home", templ.Handler(templates.Home()))
	http.Handle("/about", templ.Handler(templates.About()))
	http.ListenAndServe(":8080", nil)

}
