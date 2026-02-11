const CACHE_NAME = 'puragracia-static-v1';

const STATIC_ASSETS = [
  '/assets/logo-gold.png',
  '/assets/whatsapp.png'
];

// Instalar
self.addEventListener('install', event => {
  self.skipWaiting();
});

// Activar y limpiar caches viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', event => {
  const request = event.request;

  // 🔥 index.html SIEMPRE desde red
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request));
    return;
  }

  // Assets: cache-first
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(request).then(response =>
        response ||
        fetch(request).then(networkResponse => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        })
      )
    )
  );
});