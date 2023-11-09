### cmd to build wasm

```sh
tinygo build -o main.wasm -target=wasm server_js_wasm.go
```

`tinygo` cmd is taking more time and size then `go` cmd and not the output file is not working

```sh
GOOS=js GOARCH=wasm go build -o main.wasm server_js_wasm.go 
```

### copy the wasm_exec.js of the same version with which it is compiled

[refered github link for this poc](https://github.com/nlepage/go-wasm-http-server/blob/master/docs/hello/api.go)