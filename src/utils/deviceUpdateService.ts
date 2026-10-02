/**
 * Device Update Service (अटो-अपडेट तथा यन्त्र सूचना प्रणाली)
 * Automatically detects new software versions and pushes direct device notifications
 * to installed Mobile Applications (PWA / Android) and Desktop Applications (Windows .exe).
 */

import {
  CURRENT_APP_VERSION,
  checkLatestRelease,
  isDesktopApp,
  isMobileApp,
  isNewerVersion,
  triggerDesktopRestartAndInstall,
  triggerDesktopDownloadUpdate,
  getApkDirectDownloadUrl
} from './appVersionManager';

export interface DeviceUpdateInfo {
  version: string;
  buildTime?: string;
  releaseNotes?: string;
  apkUrl?: string;
  windowsExeUrl?: string;
  detectedAt: string;
  type: 'web_pwa' | 'desktop_exe' | 'android_apk';
}

const UPDATE_DISMISSED_KEY = 'balananda_dismissed_update_version_v2';
const LAST_CHECK_KEY = 'balananda_last_update_check_time';

class DeviceUpdateManager {
  private updateInfo: DeviceUpdateInfo | null = null;
  private listeners: Set<(info: DeviceUpdateInfo | null) => void> = new Set();
  private checkInterval: any = null;
  private swWaitingWorker: ServiceWorker | null = null;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    // Listen to ServiceWorker updates (PWA / Mobile / Web)
    this.initServiceWorkerListener();

    // Listen to Electron Auto-Updater events (Windows Desktop)
    this.initElectronListener();

    // Check updates after initial page load (4 seconds delay)
    setTimeout(() => {
      this.checkForUpdates();
    }, 4000);

    // Periodic background check every 5 minutes
    this.checkInterval = setInterval(() => {
      this.checkForUpdates();
    }, 5 * 60 * 1000);

    // Immediate check when app comes to foreground or user opens device screen
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        const lastCheck = parseInt(localStorage.getItem(LAST_CHECK_KEY) || '0', 10);
        // If more than 2 minutes have passed since last check
        if (Date.now() - lastCheck > 2 * 60 * 1000) {
          this.checkForUpdates();
        }
      }
    });
  }

  /**
   * Listen to Service Worker registration for installed PWA / Mobile app
   */
  private initServiceWorkerListener() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then((reg) => {
      // Check for waiting worker
      if (reg.waiting) {
        this.swWaitingWorker = reg.waiting;
        this.notifyUpdateAvailable({
          version: CURRENT_APP_VERSION,
          releaseNotes: 'नयाँ वेब/मोबाइल संस्करण तयार छ।',
          detectedAt: new Date().toISOString(),
          type: 'web_pwa'
        });
      }

      // Check on updatefound
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.swWaitingWorker = newWorker;
            this.notifyUpdateAvailable({
              version: CURRENT_APP_VERSION,
              releaseNotes: 'नयाँ सुधार र सुविधाहरू यन्त्रमा डाउनलोड भइसकेका छन्।',
              detectedAt: new Date().toISOString(),
              type: 'web_pwa'
            });
          }
        });
      });
    }).catch(() => {});

    // Listen for controllerchange
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[DeviceUpdateManager] Service worker controller changed.');
    });
  }

  /**
   * Listen to Electron IPC for desktop app
   */
  private initElectronListener() {
    if (typeof window === 'undefined') return;
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.onUpdaterStatus) {
      electronAPI.onUpdaterStatus((data: any) => {
        if (data?.status === 'available' || data?.status === 'downloaded') {
          this.notifyUpdateAvailable({
            version: data.version || '1.0.3',
            releaseNotes: data.releaseNotes || 'नयाँ विन्डोज डेस्कटप संस्करण उपलब्ध छ।',
            detectedAt: new Date().toISOString(),
            type: 'desktop_exe'
          });
        }
      });
    }
  }

  /**
   * Main check function: queries version.json and GitHub API
   */
  public async checkForUpdates(): Promise<DeviceUpdateInfo | null> {
    if (typeof window === 'undefined') return null;
    localStorage.setItem(LAST_CHECK_KEY, Date.now().toString());

    try {
      // 1. Check version.json from current origin with cache-busting timestamp
      const versionUrl = `${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '')}/version.json?_t=${Date.now()}`;
      try {
        const vResp = await fetch(versionUrl, { cache: 'no-store' });
        if (vResp.ok) {
          const vData = await vResp.json();
          if (vData && vData.version) {
            const isNewer = isNewerVersion(vData.version, CURRENT_APP_VERSION);
            if (isNewer) {
              const info: DeviceUpdateInfo = {
                version: vData.version,
                buildTime: vData.buildTime,
                releaseNotes: vData.releaseNotes || 'नयाँ संस्करण उपलब्ध छ।',
                apkUrl: vData.apkUrl || getApkDirectDownloadUrl(),
                windowsExeUrl: vData.windowsSetupUrl,
                detectedAt: new Date().toISOString(),
                type: isDesktopApp() ? 'desktop_exe' : isMobileApp() ? 'android_apk' : 'web_pwa'
              };
              this.notifyUpdateAvailable(info);
              return info;
            }
          }
        }
      } catch (e) {
        // Fallback to GitHub releases check
      }

      // 2. Check GitHub Releases
      const ghRelease = await checkLatestRelease();
      if (ghRelease && ghRelease.hasUpdate) {
        const info: DeviceUpdateInfo = {
          version: ghRelease.version,
          buildTime: ghRelease.publishedAt,
          releaseNotes: ghRelease.releaseNotes,
          apkUrl: ghRelease.assets.find(a => a.platform === 'android')?.downloadUrl || getApkDirectDownloadUrl(),
          windowsExeUrl: ghRelease.downloadUrl,
          detectedAt: new Date().toISOString(),
          type: isDesktopApp() ? 'desktop_exe' : isMobileApp() ? 'android_apk' : 'web_pwa'
        };
        this.notifyUpdateAvailable(info);
        return info;
      }

      return null;
    } catch (err) {
      console.warn('[DeviceUpdateManager] Update check error:', err);
      return null;
    }
  }

  /**
   * Internal trigger when an update is confirmed
   */
  private notifyUpdateAvailable(info: DeviceUpdateInfo) {
    this.updateInfo = info;
    const dismissedVersion = localStorage.getItem(UPDATE_DISMISSED_KEY);
    const isDismissed = dismissedVersion === info.version;

    // Send Real Device Push/OS Notification (if permission granted and not dismissed)
    if (!isDismissed) {
      this.sendDeviceNotification(info);
    }

    // Notify all UI listeners (Update Banner / Modal)
    this.listeners.forEach((listener) => listener(info));

    // Custom window event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-update-available', { detail: info }));
    }
  }

  /**
   * Sends real operating system notification to the device (Android / Windows)
   */
  public async sendDeviceNotification(info: DeviceUpdateInfo) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    try {
      if (Notification.permission === 'granted') {
        new Notification('🔔 नयाँ सफ्टवेयर अपडेट उपलब्ध छ!', {
          body: `नेपाली वैदिक ज्योतिषको नयाँ संस्करण (${info.version}) उपलब्ध छ। नयाँ सुविधाहरू प्रयोग गर्न तुरुन्त अपडेट गर्नुहोस्।`,
          icon: '/logo.png',
          badge: '/pwa-192x192.png',
          tag: 'balananda-update-' + info.version,
        });
      } else if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          new Notification('🔔 नयाँ सफ्टवेयर अपडेट उपलब्ध छ!', {
            body: `नेपाली वैदिक ज्योतिषको नयाँ संस्करण (${info.version}) उपलब्ध छ। नयाँ सुविधाहरू प्रयोग गर्न तुरुन्त अपडेट गर्नुहोस्।`,
            icon: '/logo.png',
            badge: '/pwa-192x192.png',
            tag: 'balananda-update-' + info.version,
          });
        }
      }
    } catch (e) {
      console.warn('[DeviceUpdateManager] Device notification failed:', e);
    }
  }

  /**
   * 1-Click Update Application:
   * Clears old cache, activates new service worker, and reloads on Mobile/Web.
   * Restarts and installs on Desktop.
   */
  public async applyUpdateNow(): Promise<void> {
    if (typeof window === 'undefined') return;

    // 1. Desktop App Mode
    if (isDesktopApp()) {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.restartAndInstall) {
        electronAPI.restartAndInstall();
        return;
      }
      if (this.updateInfo?.windowsExeUrl) {
        await triggerDesktopDownloadUpdate(this.updateInfo.windowsExeUrl);
        return;
      }
      triggerDesktopRestartAndInstall();
      return;
    }

    // 2. Mobile PWA / Web Browser Mode
    try {
      // Clear HTTP / CacheStorage caches
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }

      // Skip waiting service worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          await reg.update();
        }
      }
    } catch (e) {
      console.warn('[DeviceUpdateManager] Cache clear error:', e);
    }

    // Reload to fresh new version
    window.location.reload();
  }

  /**
   * Dismiss the update notification until next version
   */
  public dismissUpdate(version: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(UPDATE_DISMISSED_KEY, version);
    this.updateInfo = null;
    this.listeners.forEach((listener) => listener(null));
  }

  public subscribe(listener: (info: DeviceUpdateInfo | null) => void): () => void {
    this.listeners.add(listener);
    if (this.updateInfo) {
      listener(this.updateInfo);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getUpdateInfo(): DeviceUpdateInfo | null {
    return this.updateInfo;
  }
}

export const deviceUpdateManager = new DeviceUpdateManager();
