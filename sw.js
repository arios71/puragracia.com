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
  '/assets/coalicion-evangelio.png',
  '/assets/iglesia-bautista.png',
  '/assets/integridad-sabiduria.png',
  '/assets/desiring-god.png'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activación y limpieza de caches antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Interceptar requests y servir de cache si existe
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(resp => resp || fetch(event.request))
  );
});
