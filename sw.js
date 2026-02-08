const CACHE_NAME = 'pg-radio-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://raw.githubusercontent.com/arios71/puragracia-assets/refs/heads/main/LogoPG%202022.png'
];

// Cache adicional de imágenes de ministerios
const ministeriosImgs = [
  "https://static.mytuner.mobi/media/tvos_radios/327/radio-eternidad.9e45a029.jpg",
  "https://www.twr360.org/media/image/custom/208601.jpg",
  "https://play-lh.googleusercontent.com/6kJ9D_gI6F1ZGRGofp1qnmaO-5Idq32Er3RRKHyRT6SIgqwMFlDOHeE_gHOTUKu7cARm",
  "https://play-lh.googleusercontent.com/hX4PAu85d0jjKbfmJHYqKQINypHB6uvDqsczkkR26keI-kSFSK9Wf9khrp8usVMRPg=w240-h480-rw",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyqR6x1-LzLeSpDR2CZlKZ2QDNPiGo1yBNog&s",
  "https://s.mxmcdn.net/dynamic-images/image/500/500/webp/https%3A%2F%2Fd3t3ozftmdmh3i.cloudfront.net%2Fproduction%2Fpodcast_uploaded_nologo%2F15627119%2F15627119-1623776276280-b1bc894b6c55c.jpg",
  "https://yt3.googleusercontent.com/ytc/AIdro_mjYTIdyQWcbDM1RRB3_7CpnXbGQT8iybr7XD1vP6Fsvjg=s900-c-k-c0x00ffffff-no-rj",
  "https://yt3.googleusercontent.com/ytc/AIdro_mtBF1-QufP6iMSqhv7yoCHDX6ggMbqzIwLScE8audgCaI=s900-c-k-c0x00ffffff-no-rj"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll([...urlsToCache, ...ministeriosImgs]))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(resp => resp || fetch(event.request))
  );
});
