importScripts('./wasm_exec')
function registerWasmHTTPListener(wasm, { base, args = [] } = {}) {
  console.log(registration.scope)
  let path = new URL(registration.scope).pathname
  if (base && base !== '') path = `${trimEnd(path, '/')}/${trimStart(base, '/')}`

  const handlerPromise = new Promise(setHandler => {
    self.wasmhttp = {
      path,
      setHandler,
    }
  })

  const go = new Go()
  go.argv = [wasm, ...args]
  WebAssembly.instantiateStreaming(fetch(wasm), go.importObject).then(({ instance }) => go.run(instance))

  addEventListener('fetch', e => {
    const { pathname } = new URL(e.request.url)
    if (!pathname.startsWith(path)) return

    e.respondWith(handlerPromise.then(handler => handler(e.request)))
  })
}

function trimStart(s, c) {
  let r = s
  while (r.startsWith(c)) r = r.slice(c.length)
  return r
}

function trimEnd(s, c) {
  let r = s
  while (r.endsWith(c)) r = r.slice(0, -c.length)
  return r
}

addEventListener('install', (event) => {
  event.waitUntil(skipWaiting())
})

// Start controlling clients as soon as the SW is activated
addEventListener('activate', event => {
  event.waitUntil(clients.claim())
})

const WASM_URL = './main.wasm'
registerWasmHTTPListener(WASM_URL, {base: "/serve"})