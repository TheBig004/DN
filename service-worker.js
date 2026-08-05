const SHELL_CACHE = 'dnt-shell-v2';
const IMG_CACHE = 'dnt-images-v1';

const SHELL_FILES = [
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-192-maskable.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png'
];

// Install: precache the app shell. Cache each file individually (not cache.addAll)
// so that ONE missing/blocked file can't fail the whole install and leave the
// service worker stuck "waiting" forever — which is what blocks Chrome's
// install prompt from ever appearing.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.allSettled(SHELL_FILES.map((url) => cache.add(url)))
    )
  );
  self.skipWaiting();
});

// Activate: clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== IMG_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - App shell (same-origin): cache-first, falls back to network
// - Exercise images (cross-origin, e.g. wordpress.com): cache-first, network fallback, and
//   whatever loads successfully gets stored for future offline use automatically.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isImage = req.destination === 'image' || /\.(png|jpe?g|webp|gif|svg)$/i.test(url.pathname);
  const sameOrigin = url.origin === self.location.origin;

  if (isImage || !sameOrigin) {
    event.respondWith(
      caches.open(IMG_CACHE).then(async (cache) => {
        const cached = await cache.match(req, { ignoreVary: true });
        if (cached) return cached;
        try {
          const resp = await fetch(req, { mode: req.mode === 'navigate' ? 'same-origin' : 'no-cors' });
          // opaque (no-cors cross-origin) responses are still cacheable and usable as <img src>
          cache.put(req, resp.clone());
          return resp;
        } catch (err) {
          return cached || Response.error();
        }
      })
    );
    return;
  }

  if (sameOrigin) {
    // Navigations (opening the app itself) always resolve to the cached index.html,
    // regardless of the exact path requested (e.g. "/DN/" vs "/DN/index.html") —
    // this is what lets the installed app actually open with no connection.
    if (req.mode === 'navigate') {
      event.respondWith(
        fetch(req).catch(() => caches.match('./index.html'))
      );
      return;
    }
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const resp = await fetch(req);
          cache.put(req, resp.clone());
          return resp;
        } catch (err) {
          return cached || caches.match('./index.html');
        }
      })
    );
  }
});
