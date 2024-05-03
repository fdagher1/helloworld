// service-worker.js

// Cache static assets (e.g., HTML, CSS, JS, images)
const CACHE_NAME = 'Hello-World-v1';
const urlsToCache = [
  '/',
  '/helloworld.html',
  '/icon.png',
  '/service-worker.js',
  '/css/styles.css',
  "/js/1-event_handling.js",
  "/js/2-data_retrieval.js",
  "/js/3-data_display.js",
  "/js/4-helper_function.js",
  "/js/xslx-0.8.0/jszip.js",
  "/js/xslx-0.8.0/xlsx.js",
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
