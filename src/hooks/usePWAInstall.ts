import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // 1. Standard PWA display-mode media queries
    if (typeof window.matchMedia === 'function') {
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        window.matchMedia('(display-mode: window-controls-overlay)').matches
      ) {
        return true;
      }
    }

    // 2. iOS Safari standalone mode (Add to Home Screen)
    if ((window.navigator as unknown as { standalone?: boolean })?.standalone === true) {
      return true;
    }

    // 3. Android TWA (Trusted Web Activity) / Android App wrapper
    if (typeof document !== 'undefined' && document.referrer && document.referrer.startsWith('android-app://')) {
      return true;
    }

    // 4. Desktop wrappers (Electron, Tauri, Capacitor, or Native Desktop App wrappers)
    const navUserAgent = window.navigator?.userAgent || '';
    if (
      /electron/i.test(navUserAgent) ||
      (window as any).electron ||
      (window as any).electronAPI ||
      (window as any).isElectron ||
      (window as any).Capacitor ||
      (window as any).AndroidBridge
    ) {
      return true;
    }
  } catch {
    // Silently ignore in sandboxed environments or iframes
  }

  return false;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => isAppInstalled());
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    try {
      setIsInstalled(isAppInstalled());

      // Listen for display-mode changes (e.g. app launched in or switched to standalone)
      let mediaQuery: MediaQueryList | null = null;
      let handleChange: ((e: MediaQueryListEvent) => void) | null = null;

      if (typeof window.matchMedia === 'function') {
        mediaQuery = window.matchMedia('(display-mode: standalone)');
        handleChange = (e: MediaQueryListEvent) => {
          if (e.matches) {
            setIsInstalled(true);
          }
        };
        if (typeof mediaQuery.addEventListener === 'function') {
          mediaQuery.addEventListener('change', handleChange);
        } else if (typeof (mediaQuery as any).addListener === 'function') {
          (mediaQuery as any).addListener(handleChange);
        }
      }

      // Detect iOS devices
      const userAgent = (typeof window !== 'undefined' && window.navigator?.userAgent) ? window.navigator.userAgent.toLowerCase() : '';
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIOS(isIOSDevice);

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };

      const handleAppInstalled = () => {
        setIsInstalled(true);
        setDeferredPrompt(null);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
        if (mediaQuery && handleChange) {
          if (typeof mediaQuery.removeEventListener === 'function') {
            mediaQuery.removeEventListener('change', handleChange);
          } else if (typeof (mediaQuery as any).removeListener === 'function') {
            (mediaQuery as any).removeListener(handleChange);
          }
        }
      };
    } catch {
      // Silently ignore in sandboxed environments or iframes
    }
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}
