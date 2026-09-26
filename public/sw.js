// Service Worker for Balananda Vedic Astrology & Panchanga
// Provides complete offline caching of core application assets, basic Panchanga, and saved Kundali profiles

const CACHE_NAME = 'balananda-astro-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Pre-caching some assets failed', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Do not intercept non-GET requests, server API calls, or Vite development modules
  const url = request.url;
  if (
    request.method !== 'GET' ||
    url.includes('/api/') ||
    url.includes('/@vite/') ||
    url.includes('/@fs/') ||
    url.includes('/node_modules/') ||
    url.includes('/src/') ||
    url.includes('?v=') ||
    url.includes('hot-update') ||
    url.includes('chrome-extension')
  ) {
    return;
  }

  // Handle SPA navigation requests: network first, fallback to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // Static assets: cache-first with network fallback and revalidation
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in background to keep cache up to date
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
          }
        }).catch(() => {
          // Offline, cachedResponse already returned
        });
        return cachedResponse;
      }

      // If not in cache, fetch from network and cache
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      }).catch((err) => {
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        throw err;
      });
    })
  );
});

// Push notification event handler for Major Planetary Movement & Transit alerts
self.addEventListener('push', (event) => {
  let data = {
    title: '🪐 बालानन्द ज्योतिष: ग्रह गोचर अलर्ट',
    body: 'तपाईंको जन्म कुण्डली अनुसार महत्वपूर्ण ग्रह गोचर परिवर्तन भएको छ।',
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: 'planetary-transit',
    data: { url: '/?tab=gochar' }
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon.svg',
    badge: data.badge || '/icon.svg',
    tag: data.tag || 'planetary-transit',
    vibrate: [250, 100, 250, 100, 250],
    data: data.data || { url: '/?tab=gochar' },
    actions: [
      { action: 'open_gochar', title: 'गोचर कुण्डली हेर्नुहोस्' },
      { action: 'dismiss', title: 'बन्द गर्नुहोस्' }
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click event handler - navigates to Gochar view or focuses existing tab
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/?tab=gochar';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'NAVIGATE_TAB', tab: 'gochar' });
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
