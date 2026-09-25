const CACHE_NAME = 'athos-portal-v1';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './assets/icons/favicon.svg',
  './assets/icons/icon-192.svg',
  './assets/icons/icon-512.svg',
  './css/portal.css',
  './js/portal.js',
  './pages/simonos-petras.html',
  './pages/dionysiou.html',
  './pages/grigoriu.html',
  './pages/hilandar.html',
  './pages/rossikon.html',
  './pages/rossikon-russischer-einfluss.html',
  './pages/byzanz-griechischer-einfluss.html',
  './pages/zografou-bulgarisch-moldawisch.html',
  './pages/kloester-kompendium.html',
  './pages/athos-halbinsel.html',
  './pages/interaktiver-leitfaden.html',
  './pages/agios-pavlos.html',
  './pages/skete-andreas.html',
  './pages/podcast-athos.html'
];

// Install: Cache core application assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Athos PWA] Precaching static assets for offline use...');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Athos PWA] Partial precache warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Athos PWA] Cleaning up old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Stale-while-revalidate / Cache-first strategy for maximum offline resilience
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version immediately, but fetch update in background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {
          // Network unavailable; offline mode active
        });
        return cachedResponse;
      }

      // If not in cache, fetch from network and cache it
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Return offline fallback if navigating to an HTML page
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
