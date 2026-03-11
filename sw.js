const CACHE_NAME = 'pgr-v29';

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
  '/assets/icons/logo-32.png',
  '/assets/icons/logo-192.png',
  '/assets/icons/logo-512.png',
  '/assets/icons/apple-touch-icon.png',
  '/assets/icons/whatsapp.png'
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

  const url = new URL(event.request.url);

  // NO cachear streaming ni APIs externas
  if (
    url.hostname.includes('streamtheworld.com') ||
    url.hostname.includes('vercel.app') ||
    url.pathname.includes('.mp3') ||
    url.pathname.includes('.aac') ||
    url.pathname.includes('.m3u8')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );

});


