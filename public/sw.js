const CACHE_NAME = 'totalenergies-station-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/Logo_TotalEnergies.webp',
  '/kissosso.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('PWA Pre-cache failed for some assets:', err);
      });
    })
  );
  self.skipWaiting();
});

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
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Éviter de mettre en cache les requêtes d'API ou socket
  if (url.pathname.startsWith('/api') || url.protocol.startsWith('ws')) {
    return;
  }

  // Stratégie Network-First avec fallback Cache pour les pages et requêtes GET
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Fallback pour la navigation vers les pages
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        return new Response('Hors-ligne', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});
