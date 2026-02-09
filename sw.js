const CACHE_NAME = 'puragracia-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/logo.png',
  '/assets/whatsapp.png',
  '/assets/ministerio1.png',
  '/assets/ministerio2.png',
  '/assets/ministerio3.png',
  '/assets/ministerio4.png',
  '/assets/ministerio5.png',
  '/assets/ministerio6.png',
  '/assets/ministerio7.png',
  '/assets/ministerio8.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
