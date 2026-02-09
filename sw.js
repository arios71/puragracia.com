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
  '/assets/lectura-publica.png',
  '/assets/coalicion.png',
  '/assets/iglesia-bautista.png',
  '/assets/integridad.png',
  '/assets/desiring-god.png'
];

// Instalación: cachear assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activación: eliminar caches antiguos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: responder con cache, fallback a red
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => {
        // Opcional: aquí podrías devolver un fallback.html si lo deseas
      })
  );
});
