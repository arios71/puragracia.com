const CACHE_NAME = 'pgr-v23';

const urlsToCache = [
  '/',
  '/index.html',
  '/programacion.html',
  '/sermones.html',
  '/contacto.html',
  '/css/styles.css',
  '/js/radio.js',
  '/js/menu.js',
  '/js/nowplaying.js',
  '/manifest.json',
  '/assets/logo.png',
  '/assets/logo-192.png',
  '/assets/logo-512.png',
  '/assets/favicon.ico'
];

// INSTALAR SERVICE WORKER
self.addEventListener('install', event => {
  self.skipWaiting(); // activa inmediatamente el nuevo SW

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// ACTIVAR Y LIMPIAR CACHES VIEJOS
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// FETCH DESDE CACHE, SI NO EXISTE USA RED
self.addEventListener('fetch', event => {

  // no interferir con streaming de radio ni APIs externas
  if (event.request.url.includes('streamtheworld.com') ||
      event.request.url.includes('vercel.app')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );

});
