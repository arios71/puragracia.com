const CACHE_NAME = 'pg-radio-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/logo.png',
  '/assets/whatsapp.png',
  '/assets/radio-eternidad.png',
  '/assets/transmundial.png',
  '/assets/thirdmill.png',
  '/assets/lectura-biblia.png',
  '/assets/coalicion-evangelio.png',
  '/assets/laibi.png',
  '/assets/integridad.png',
  '/assets/desiringgod.png'
];

// Instalar Service Worker y cachear recursos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activar Service Worker y limpiar caches antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

// Interceptar requests y responder con cache o fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => {
        // fallback opcional, ejemplo: una página offline
      })
  );
});
