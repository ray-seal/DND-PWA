const CACHE_NAME = 'dnd-pwa-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/dist/assets/index.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(FILES_TO_CACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
