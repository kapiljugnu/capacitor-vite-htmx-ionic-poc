
const ExplodedPromise = () => {
  let status = "pending", value = null;
  const get = () => ({ status, value });
  let resolve, reject;
  let promise = new Promise((_resolve, _reject) => {
    resolve = (_value) => {
      status = "resolved";
      value = _value;
      _resolve(_value);
    };
    reject = (_value) => {
      status = "rejected"
      value = _value;
      _reject(_value)
    };
  });
  return [promise, get, resolve, reject];
};

let DEBUG = false;

let WasmApp, WasmAppStatus;

const LoadWasmApp = (() => {
  let locked = false;
  let currentEtag;
  const appUri = "main.wasm?v="+Date.now();

  let resolveApp, rejectApp;
  [WasmApp, WasmAppStatus, resolveApp, rejectApp] = ExplodedPromise();

  return async (trigger = "unknown" /* for debugging */) => {
    if (locked) {
      console.log("skipped redundant checking for new App", { trigger });
      return;
    }
    try {
      locked = true;

      // Check for new version. Assume a competent server that either does not
      // implement ETags and 304 Not Modified at all OR it implementes them correctly
      let response = await fetch(appUri, { cache: "no-cache" });

      // Skip updating if etag matches
      let newEtag = response.headers.get('etag');
      if (newEtag && newEtag === currentEtag) {
        console.log("skipped reinstalling App with matching etag", { trigger, etag: newEtag });
        locked = false;
        return;
      }

      // {
      //   let { status, value } = WasmAppStatus();
      //   if (status === "resolved") {
      //     console.log("stopping old App", { trigger, etag: currentEtag });

      //     // Reset App promise so any new clients wait until the new App is installed
      //     [WasmApp, WasmAppStatus, resolveApp, rejectApp] = ExplodedPromise();

      //     // Call exported stop method on old App
      //     // value.exports.stop();
      //   }
      //   // references to old App fall out of scope and should be GC'd
      // }

      try {
        console.log("installing new App", { trigger, newEtag });
        const go = new Go()
        go.argv = [appUri, ...[]]
        newApp = await WebAssembly.instantiateStreaming(response, go.importObject);
        go.run(newApp.instance)
        resolveApp(newApp.instance);
        currentEtag = newEtag;
      } catch (error) {
        console.error("failed to install new App", { error })
        rejectApp(error);
      }
    } catch (error) {
      console.error("error thrown while updating app", { error })
    }
    finally {
      locked = false;
    }
  };
})();


const skewnormal = (min, max, skew = 1, sigma = 4) => {
  /// normal() returns a random number from the standard normal distribution.
  /// Uses the Box-Muller transform.
  const normal = () => Math.sqrt(-2.0 * Math.log(Math.random())) * Math.cos(2.0 * Math.PI * Math.random());

  /// normal01(..) returns normally distributed random number, whose range is
  /// truncated at `sigma` standard deviations and shifted to interval `[0, 1]`.
  const normal01 = (sigma = 4) => {
    while (true) {
      let num = normal() / (sigma * 2.0) + 0.5; // translate to [0, 1]
      if (0 <= num && num <= 1) return num;     // ok if in range, else resample
    }
  };

  var num = normal01(sigma);
  num = Math.pow(num, skew); // skew
  num *= max - min; // stretch to fill range
  num += min; // offset to min
  return num;
}


function register_fetch_event(base) {
  let path = new URL(registration.scope).pathname
  if (base && base !== '') path = `${trimEnd(path, '/')}/${trimStart(base, '/')}`

  const handlerPromise = new Promise(setHandler => {
    self.wasmhttp = {
      path,
      setHandler,
    }
  })

  addEventListener('fetch', (e) => {
    const { pathname } = new URL(e.request.url)

    let shouldOverride = !(pathname.startsWith(path) && WasmAppStatus().status === "resolved");

    if (DEBUG) console.log("fetch event received", { overriding: shouldOverride, method: e.request.method, url, event })

    if (shouldOverride) {
      return; // fall back to browser default fetch handling
    }

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