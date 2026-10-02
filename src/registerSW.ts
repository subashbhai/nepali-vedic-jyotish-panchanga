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

  // In production: let vite-plugin-pwa's registerSW.js handle registration with relative path (./sw.js)
  // Clean up any stale root-scoped service worker on GitHub Pages or custom sub-paths
  try {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        // If a service worker is registered with root scope on a subpath, remove it
        if (reg.scope === window.location.origin + '/' && window.location.pathname.length > 1) {
          reg.unregister();
        }
      }
    }).catch(() => {});
  } catch {
    // silently ignore
  }
}
