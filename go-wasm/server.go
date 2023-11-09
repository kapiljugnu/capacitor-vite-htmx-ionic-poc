//go:build !js && !wasm
// +build !js,!wasm

package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/hello", func(res http.ResponseWriter, req *http.Request) {
		// params := make(map[string]string)
		// if err := json.NewDecoder(req.Body).Decode(&params); err != nil {
		// 	panic(err)
		// }

		res.Header().Add("Content-Type", "application/json")
		if err := json.NewEncoder(res).Encode(map[string]string{
			"message": fmt.Sprintf("Hello %s!", "World"),
		}); err != nil {
			panic(err)
		}
	})
	http.ListenAndServe(":8080", nil)
}
