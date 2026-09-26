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

export const CURRENT_APP_VERSION = '1.0.1';
export const GITHUB_REPO_OWNER = 'subashbhai';
export const GITHUB_REPO_NAME = 'nepali-vedic-jyotish-panchanga';
export const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/latest`;
export const GITHUB_ALL_RELEASES_API_URL = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases`;

/**
 * Hardened direct download links to the most recent published binaries on GitHub
 * Automatically triggers browser download manager without opening GitHub repo tabs
 */
export const DEFAULT_DIRECT_DOWNLOADS = {
  windowsSetup: 'https://github.com/subashbhai/nepali-vedic-jyotish-panchanga/releases/latest/download/nepali-vedic-jyotish-panchanga-setup-1.0.1.exe',
  windowsPortable: 'https://github.com/subashbhai/nepali-vedic-jyotish-panchanga/releases/latest/download/nepali-vedic-jyotish-panchanga-1.0.1.exe',
  androidApk: 'https://github.com/subashbhai/nepali-vedic-jyotish-panchanga/releases/latest/download/nepali-vedic-jyotish-panchanga.apk',
  macDmg: 'https://github.com/subashbhai/nepali-vedic-jyotish-panchanga/releases/latest/download/nepali-vedic-jyotish-panchanga-1.0.0.dmg',
  macZip: 'https://github.com/subashbhai/nepali-vedic-jyotish-panchanga/releases/latest/download/nepali-vedic-jyotish-panchanga-1.0.0-arm64-mac.zip',
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
        downloadUrl: `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases`,
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
        ]
      };
    }

    const latestRelease = releasesList[0];
    const remoteTag = latestRelease.tag_name || latestRelease.name || CURRENT_APP_VERSION;
    const hasUpdate = isNewerVersion(remoteTag, CURRENT_APP_VERSION);

    // Find the latest release that actually has uploaded binaries (e.g. v1.0.0 has 7 assets)
    const releaseWithAssets = releasesList.find((r: any) => Array.isArray(r.assets) && r.assets.length > 0) || latestRelease;
    const rawAssets: any[] = Array.isArray(releaseWithAssets.assets) && releaseWithAssets.assets.length > 0 
      ? releaseWithAssets.assets 
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

    if (assets.length === 0) {
      assets = [
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
      ];
    }

    return {
      version: remoteTag,
      releaseName: latestRelease.name || `संस्करण ${remoteTag}`,
      publishedAt: latestRelease.published_at || new Date().toISOString(),
      releaseNotes: latestRelease.body || 'नयाँ सुधार र गतिशीलता थप गरिएको छ।',
      downloadUrl: latestRelease.html_url || `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases`,
      hasUpdate,
      assets
    };
  } catch (error) {
    console.warn('[AppVersionManager] Failed to check GitHub updates:', error);
    return null;
  }
}

/**
 * Detects if app is running in Desktop environment (Electron)
 */
export function isDesktopApp(): boolean {
  return typeof window !== 'undefined' && Boolean((window as any).electronAPI?.isDesktop);
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

