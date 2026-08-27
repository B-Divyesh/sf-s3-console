const CACHE = 's3-console-v3';
// Vite replaces this list with the current fingerprinted bundle at build time.
const SHELL = ['/','/index.html','/manifest.webmanifest','/favicon.svg'];
const matchCached = request => caches.match(request, { ignoreVary: true });

self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('message', event => { if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting(); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  const url = new URL(event.request.url);
  const asset = url.pathname.startsWith('/assets/');
  if (asset) {
    event.respondWith(matchCached(event.request).then(cached => cached || fetch(event.request).then(response => {
      if (response.ok) void caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
      return response;
    })));
    return;
  }
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) void caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    return response;
  }).catch(() => matchCached(event.request).then(cached => cached || caches.match('/'))));
});
