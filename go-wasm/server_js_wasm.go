//go:build js && wasm
// +build js,wasm

package main

import (
	"go-wasm/templates"
	"net/http"

	"github.com/a-h/templ"
	wasmhttp "github.com/nlepage/go-wasm-http-server"
)

type Data struct {
	Name string
}

func main() {
	http.Handle("/home", templ.Handler(templates.Home()))
	http.Handle("/about", templ.Handler(templates.About()))
	wasmhttp.Serve(nil)

	select {}
}
