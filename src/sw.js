// Stay Single service worker: the site opens offline once visited, so the Daily Build and the
// Single Season work like an app. The site's own files are network-first, so a new deploy never mixes
// fresh pages with stale scripts; the cache is only used offline. Font files never change, so they are
// served from the cache first.
const VERSION = 'stay-single-v3';
const PRECACHE = [
  './',
  './index.html',
  './links.html',
  './404.html',
  './manifest.webmanifest',
  './src/ui/brand.css',
  './src/ui/nav.css',
  './src/ui/features.css',
  './src/ui/site.mjs',
  './src/ui/features.mjs',
  './src/ui/motion.mjs',
  './src/ui/storycard.mjs',
  './src/ui/favicon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== VERSION).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin && !FONT_HOSTS.includes(url.hostname)) return; // TikTok and everything else: straight to the network

  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(response => {
        const copy = response.clone();
        caches.open(VERSION).then(cache => cache.put(request, copy));
        return response;
      }))
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(VERSION).then(cache => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => (await caches.match(request)) || (request.mode === 'navigate' ? caches.match('./index.html') : Response.error()))
  );
});
