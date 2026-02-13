const CACHE_VERSION = 'v4';
const CACHE_NAME = `puragracia-static-${CACHE_VERSION}`;

// Solo assets propios esenciales
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/logo-gold.png',
  '/assets/whatsapp.png'
];


// =======================
// INSTALL
// =======================
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});


// =======================
// ACTIVATE
// =======================
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


// =======================
// FETCH
// =======================
self.addEventListener('fetch', event => {

  const request = event.request;
  const url = new URL(request.url);

  // =======================
  // 1️⃣ Navegaciones HTML
  // Siempre ir a la red
  // =======================
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request));
    return;
  }

  // =======================
  // 2️⃣ NO INTERCEPTAR SERVICIOS EXTERNOS
  // =======================

  // Stream en vivo
  if (url.origin.includes('streamtheworld.com')) {
    return;
  }

  // SAM Widgets
  if (
    url.origin.includes('samcloudmedia') ||
    url.origin.includes('spacial.com')
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // Spotify embed + recursos internos
  if (
    url.origin.includes('spotify.com') ||
    url.origin.includes('scdn.co')
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // Calendario
  if (url.origin.includes('teamup.com')) {
    event.respondWith(fetch(request));
    return;
  }

  // Google Analytics
  if (
    url.origin.includes('googletagmanager.com') ||
    url.origin.includes('google-analytics.com')
  ) {
    return;
  }

  // =======================
  // 3️⃣ SOLO CACHEAR RECURSOS PROPIOS
  // =======================

  if (url.origin === location.origin) {

    event.respondWith(
      caches.match(request).then(response => {

        if (response) {
          return response;
        }

        return fetch(request).then(networkResponse => {

          // Solo cachear respuestas válidas
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });

        });

      })
    );

  }

});

