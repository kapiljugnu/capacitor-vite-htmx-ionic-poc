importScripts('./wasm_exec');
importScripts('./register_wasm');

const WASM_URL = './main.wasm'

self.addEventListener("install", (event) => {
  console.log("received service worker lifecycle event: install");
  event.waitUntil(LoadWasmApp("install"));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("received service worker lifecycle event: activate");
  event.waitUntil(LoadWasmApp("activate"));
  event.waitUntil(clients.claim());
});

// Check for a new app when a new client loads
self.addEventListener('message', (event) => {
  if (event.data.type === 'clientattached') {
    console.log("received message", { type: event.data.type, event });
    event.waitUntil(LoadWasmApp("clientattached"));
  }
});


register_fetch_event("/serve")
setInterval(() => LoadWasmApp("interval"), skewnormal(5, 15) * 60 * 1000); // 5-15 min