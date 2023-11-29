importScripts('./wasm_exec');
importScripts('./register_wasm');

addEventListener('install', (event) => {
  event.waitUntil(skipWaiting())
})

// Start controlling clients as soon as the SW is activated
addEventListener('activate', event => {
  event.waitUntil(clients.claim())
})

const WASM_URL = './main.wasm'
registerWasmHTTPListener(WASM_URL, {base: "/serve"})