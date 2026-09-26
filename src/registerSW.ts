/**
 * Service Worker Registration & Cache Management
 * Strictly isolates development mode to avoid caching Vite dev modules or causing dual-React instance collisions.
 */

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // In development mode, actively unregister any existing service worker and purge dev caches
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then((success) => {
          if (success) {
            console.log('[Dev SW] Unregistered legacy service worker to ensure fresh React execution.');
          }
        });
      }
    }).catch(() => {});

    if ('caches' in window) {
      caches.keys().then((keys) => {
        for (const key of keys) {
          caches.delete(key);
        }
      }).catch(() => {});
    }
    return;
  }

  // In production only, register the offline service worker
  try {
    window.addEventListener('load', () => {
      try {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('ServiceWorker registered in production:', registration.scope);
          })
          .catch(() => {
            // Silently ignore registration error in sandboxed preview iframe
          });
      } catch (err) {
        // Silently ignore
      }
    });
  } catch (err) {
    // Silently ignore
  }
}

