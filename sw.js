const CACHE_NAME = 'athos-portal-v3';

const STATIC_ASSETS = ['./', './index.html', './manifest.json', './favicon.svg', './assets/icons/favicon.svg', './assets/icons/icon-192.svg', './assets/icons/icon-512.svg', './assets/images/qr-code.png', './assets/images/og-preview.png', './css/portal.css', './js/portal.js', './js/nav-injector.js', './pages/agios-pavlos.html', './pages/athos-halbinsel.html', './pages/byzanz-griechischer-einfluss.html', './pages/dionysiou.html', './pages/dochiariou.html', './pages/esphigmenou.html', './pages/grigoriu.html', './pages/hilandar.html', './pages/interaktiver-leitfaden.html', './pages/iviron.html', './pages/karakallou.html', './pages/kloester-kompendium.html', './pages/konstamonitou.html', './pages/koutloumousiou.html', './pages/megisti-lavra.html', './pages/nea-skiti.html', './pages/pantokratoros.html', './pages/philotheou.html', './pages/podcast-athos.html', './pages/rossikon-russischer-einfluss.html', './pages/rossikon.html', './pages/simonos-petras.html', './pages/skete-agia-anna.html', './pages/skete-andreas.html', './pages/skete-kapsokalyvia.html', './pages/skete-prodromou.html', './pages/stavronikita.html', './pages/vatopedi.html', './pages/xenophontos.html', './pages/xiropotamou.html', './pages/zografou-bulgarisch-moldawisch.html', './pages/zografou.html'];

// Install: Cache all 32 monastery pages and assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Athos PWA] Precaching full monastery encyclopedia for offline pilgrimage...');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Athos PWA] Partial precache notice:', err);
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
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Stale-while-revalidate / Offline First
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const toCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, toCache);
        });
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
