/**
 * App Version & Live Update Manager
 * Synchronizes with GitHub Repository: https://github.com/subashbhai/nepali-vedic-jyotish-panchanga
 * Handles automatic version checks, update prompts, and platform-specific downloads.
 */

export interface RemoteReleaseInfo {
  version: string;
  releaseName: string;
  publishedAt: string;
  releaseNotes: string;
  downloadUrl: string;
  hasUpdate: boolean;
  assets: {
    name: string;
    downloadUrl: string;
    size: number;
    platform: 'windows' | 'android' | 'mac' | 'other';
  }[];
}

export interface ElectronUpdaterStatus {
  status: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  version?: string;
  percent?: number;
  message?: string;
  releaseDate?: string;
  releaseNotes?: string;
  bytesPerSecond?: number;
  transferred?: number;
  total?: number;
}

export const CURRENT_APP_VERSION = '1.0.5';
export const GITHUB_REPO_OWNER = 'subashbhai';
export const GITHUB_REPO_NAME = 'nepali-vedic-jyotish-panchanga';
export const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/latest`;
export const GITHUB_ALL_RELEASES_API_URL = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases`;

/**
 * Resolves the full URL to the direct downloadable APK file on current origin and subpath
 * Perfectly compatible with GitHub Pages (https://subashbhai.github.io/nepali-vedic-jyotish-panchanga/downloads/...)
 */
export function getApkDirectDownloadUrl(): string {
  if (typeof window === 'undefined') return './downloads/nepali-vedic-jyotish-panchanga.apk?v=1.0.5';
  const origin = window.location.origin;
  const pathname = window.location.pathname;

  // On GitHub Pages (https://subashbhai.github.io/nepali-vedic-jyotish-panchanga/...)
  if (pathname.includes('/nepali-vedic-jyotish-panchanga')) {
    return `${origin}/nepali-vedic-jyotish-panchanga/downloads/nepali-vedic-jyotish-panchanga.apk?v=1.0.5`;
  }

  const basePath = pathname.endsWith('/') 
    ? pathname 
    : pathname.substring(0, pathname.lastIndexOf('/') + 1);
  return `${origin}${basePath}downloads/nepali-vedic-jyotish-panchanga.apk?v=1.0.5`;
}

/**
 * Hardened direct download links to the most recent published binaries on GitHub
 * Automatically triggers browser download manager without opening GitHub repo tabs
 */
export const DEFAULT_DIRECT_DOWNLOADS = {
  windowsSetup: `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/download/v1.0.5/nepali-vedic-jyotish-panchanga-setup-1.0.5.exe`,
  windowsPortable: `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/download/v1.0.5/nepali-vedic-jyotish-panchanga-1.0.5.exe`,
  androidApk: typeof window !== 'undefined' ? getApkDirectDownloadUrl() : './downloads/nepali-vedic-jyotish-panchanga.apk?v=1.0.5',
  macDmg: `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/download/v1.0.5/nepali-vedic-jyotish-panchanga-1.0.5.dmg`,
  macZip: `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/download/v1.0.5/nepali-vedic-jyotish-panchanga-1.0.5-arm64-mac.zip`,
};

/**
 * Compares two semantic version strings (e.g. "1.0.1" > "1.0.0")
 */
export function isNewerVersion(remoteVer: string, currentVer: string): boolean {
  const cleanRemote = remoteVer.replace(/^v/i, '').trim();
  const cleanCurrent = currentVer.replace(/^v/i, '').trim();

  const rParts = cleanRemote.split('.').map(p => parseInt(p) || 0);
  const cParts = cleanCurrent.split('.').map(p => parseInt(p) || 0);

  for (let i = 0; i < Math.max(rParts.length, cParts.length); i++) {
    const r = rParts[i] || 0;
    const c = cParts[i] || 0;
    if (r > c) return true;
    if (r < c) return false;
  }
  return false;
}

/**
 * Checks GitHub for the latest release and update availability.
 * Queries all releases to ensure compiled binary assets are found even if
 * the latest tag has not yet finished attaching assets.
 */
export async function checkLatestRelease(): Promise<RemoteReleaseInfo | null> {
  try {
    let releasesList: any[] = [];
    const allResp = await fetch(GITHUB_ALL_RELEASES_API_URL, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (allResp.ok) {
      releasesList = await allResp.json();
    } else {
      const singleResp = await fetch(GITHUB_API_URL, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      if (singleResp.ok) {
        releasesList = [await singleResp.json()];
      }
    }

    if (!Array.isArray(releasesList) || releasesList.length === 0) {
      return {
        version: CURRENT_APP_VERSION,
        releaseName: `नेपाली वैदिक ज्योतिष v${CURRENT_APP_VERSION}`,
        publishedAt: new Date().toISOString(),
        releaseNotes: 'प्रारम्भिक आधिकारिक संस्करण (Initial Official Release)',
        downloadUrl: DEFAULT_DIRECT_DOWNLOADS.windowsSetup,
        hasUpdate: false,
        assets: [
          {
            name: 'nepali-vedic-jyotish-panchanga-setup-1.0.0.exe',
            downloadUrl: DEFAULT_DIRECT_DOWNLOADS.windowsSetup,
            size: 137773998,
            platform: 'windows',
          },
          {
            name: 'nepali-vedic-jyotish-panchanga-1.0.0.exe',
            downloadUrl: DEFAULT_DIRECT_DOWNLOADS.windowsPortable,
            size: 104857600,
            platform: 'windows',
          },
          {
            name: 'nepali-vedic-jyotish-panchanga-1.0.0.dmg',
            downloadUrl: DEFAULT_DIRECT_DOWNLOADS.macDmg,
            size: 143654912,
            platform: 'mac',
          },
          {
            name: 'nepali-vedic-jyotish-panchanga.apk',
            downloadUrl: getApkDirectDownloadUrl(),
            size: 29420663,
            platform: 'android',
          },
        ]
      };
    }

    // Prioritize the absolute latest release tag from GitHub
    const latestRelease = releasesList[0] || {};
    const remoteTag = latestRelease.tag_name || latestRelease.name || CURRENT_APP_VERSION;
    const cleanTag = remoteTag.startsWith('v') ? remoteTag : `v${remoteTag}`;
    const cleanNum = cleanTag.replace(/^v/i, '');

    const rawAssets: any[] = Array.isArray(latestRelease.assets) && latestRelease.assets.length > 0 
      ? latestRelease.assets 
      : [];

    let assets: RemoteReleaseInfo['assets'] = rawAssets.map((asset: any) => {
      const name = asset.name || '';
      let platform: 'windows' | 'android' | 'mac' | 'other' = 'other';
      if (name.endsWith('.exe')) platform = 'windows';
      else if (name.endsWith('.apk')) platform = 'android';
      else if (name.endsWith('.dmg') || name.endsWith('.zip')) platform = 'mac';

      return {
        name,
        downloadUrl: asset.browser_download_url,
        size: asset.size || 0,
        platform
      };
    });

    // If latest release tag assets are not yet attached, configure download URLs targeting this version
    if (!assets.some(a => a.platform === 'windows')) {
      assets.push({
        name: `nepali-vedic-jyotish-panchanga-setup-${cleanNum}.exe`,
        downloadUrl: `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/download/${cleanTag}/nepali-vedic-jyotish-panchanga-setup-${cleanNum}.exe`,
        size: 137773998,
        platform: 'windows',
      });
      assets.push({
        name: `nepali-vedic-jyotish-panchanga-${cleanNum}.exe`,
        downloadUrl: `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/download/${cleanTag}/nepali-vedic-jyotish-panchanga-${cleanNum}.exe`,
        size: 104857600,
        platform: 'windows',
      });
    }

    if (!assets.some(a => a.platform === 'android')) {
      assets.push({
        name: 'nepali-vedic-jyotish-panchanga.apk',
        downloadUrl: getApkDirectDownloadUrl(),
        size: 27800663,
        platform: 'android',
      });
    }

    const hasUpdate = isNewerVersion(remoteTag, CURRENT_APP_VERSION);
    const winExeAsset = assets.find(a => a.platform === 'windows')?.downloadUrl || DEFAULT_DIRECT_DOWNLOADS.windowsSetup;

    return {
      version: remoteTag,
      releaseName: latestRelease.name || `संस्करण ${remoteTag}`,
      publishedAt: latestRelease.published_at || new Date().toISOString(),
      releaseNotes: latestRelease.body || 'नयाँ सुधार, मोबाइल मेनु र कार्यसम्पादन थप गरिएको छ।',
      downloadUrl: winExeAsset,
      hasUpdate,
      assets
    };
  } catch (error) {
    console.warn('[AppVersionManager] Failed to check GitHub updates:', error);
    return null;
  }
}

export function isDesktopApp(): boolean {
  if (typeof window === 'undefined') return false;
  const isElectron = Boolean((window as any).electronAPI?.isDesktop);
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const isDesktopQuery = 
      searchParams.get('app') === 'windows' || 
      searchParams.get('mode') === 'windows' || 
      searchParams.get('app') === 'desktop' || 
      searchParams.get('mode') === 'desktop';
    const isStoredDesktop = localStorage.getItem('balananda_force_windows_app_shell') === 'true';
    return isElectron || isDesktopQuery || isStoredDesktop;
  } catch {
    return isElectron;
  }
}

/**
 * Detects if app is running in dedicated Mobile environment (Capacitor Android/iOS or mobile mode URL)
 */
export function isMobileApp(): boolean {
  if (typeof window === 'undefined') return false;
  const isCap = Boolean((window as any).Capacitor?.isNative);
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const isMobileQuery = searchParams.get('app') === 'mobile' || searchParams.get('mode') === 'mobile';
    const isStoredMobile = localStorage.getItem('balananda_force_mobile_app_shell') === 'true';
    return isCap || isMobileQuery || isStoredMobile;
  } catch {
    return isCap;
  }
}

export function isCapacitorNative(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).Capacitor?.isNative);
}

/**
 * Formats file size in MB
 */
export function formatFileSize(bytes: number): string {
  if (!bytes) return '';
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const DISMISSED_UPDATE_KEY = 'balananda_dismissed_update_version';

export function getDismissedUpdateVersion(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(DISMISSED_UPDATE_KEY);
}

export function setDismissedUpdateVersion(version: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DISMISSED_UPDATE_KEY, version);
}

export function clearDismissedUpdateVersion(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DISMISSED_UPDATE_KEY);
}

/**
 * Triggers an update check in Electron Desktop app
 */
export async function triggerDesktopUpdateCheck(): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== 'undefined' && (window as any).electronAPI?.checkForUpdates) {
    return (window as any).electronAPI.checkForUpdates();
  }
  return { success: false, error: 'Not running in desktop app' };
}

/**
 * Triggers in-app update download in Electron Desktop app
 */
export async function triggerDesktopDownloadUpdate(customUrl?: string): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== 'undefined' && (window as any).electronAPI?.downloadUpdate) {
    return (window as any).electronAPI.downloadUpdate(customUrl);
  }
  return { success: false, error: 'Not running in desktop app' };
}

/**
 * Directly downloads a binary asset in the browser without redirecting to GitHub page or opening a new tab
 */
export function triggerDirectBrowserDownload(fileUrl: string, fileName?: string): void {
  if (typeof window === 'undefined') return;
  const a = document.createElement('a');
  a.href = fileUrl;
  if (fileName) {
    a.setAttribute('download', fileName);
  }
  // IMPORTANT: Do NOT set a.target = '_blank' because that opens an empty/new tab.
  // Direct anchor click initiates native browser download without opening any other tab!
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Unified In-App Downloader
 * In Desktop: starts downloading inside the app with live percentage progress bar
 * In Web/PWA: triggers direct file download into Downloads folder without visiting GitHub
 */
export async function triggerInAppOrDirectDownload(release: RemoteReleaseInfo | null): Promise<void> {
  const winAsset = release?.assets?.find(a => a.platform === 'windows')?.downloadUrl;
  const targetUrl = winAsset || DEFAULT_DIRECT_DOWNLOADS.windowsSetup;
  const fileName = release?.assets?.find(a => a.platform === 'windows')?.name || 'nepali-vedic-jyotish-panchanga-setup-1.0.0.exe';

  if (isDesktopApp()) {
    await triggerDesktopDownloadUpdate(targetUrl);
  } else {
    triggerDirectBrowserDownload(targetUrl, fileName);
  }
}

/**
 * Triggers restart and install in Electron Desktop app
 */
export function triggerDesktopRestartAndInstall(): void {
  if (typeof window !== 'undefined' && (window as any).electronAPI?.restartAndInstall) {
    (window as any).electronAPI.restartAndInstall();
  }
}

