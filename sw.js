const CACHE_NAME = 'puragracia-static-v2';


const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/logo-gold.png',
  '/assets/whatsapp.png'
];


// Instalar
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
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
  const url = request.url;


  // 🔥 Navegación: SIEMPRE red
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request));
    return;
  }


  // ❌ NO cachear audio en vivo
  if (url.includes('streamtheworld.com')) {
    return;
  }


  // ❌ NO cachear SAM widgets
  if (url.includes('samcloudmedia') || url.includes('spacial.com')) {
    event.respondWith(fetch(request));
    return;
  }


  // ❌ NO cachear embeds dinámicos
  if (url.includes('teamup.com') || url.includes('spotify.com')) {
    event.respondWith(fetch(request));
    return;
  }


  // ✅ SOLO assets estáticos propios
  event.respondWith(
    caches.match(request).then(response => {
      return (
        response ||
        fetch(request).then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
      );
    })
  );
});