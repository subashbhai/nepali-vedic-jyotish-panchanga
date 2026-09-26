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

export const CURRENT_APP_VERSION = '1.0.0';
export const GITHUB_REPO_OWNER = 'subashbhai';
export const GITHUB_REPO_NAME = 'nepali-vedic-jyotish-panchanga';
export const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/latest`;

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
 * Checks GitHub for the latest release and update availability
 */
export async function checkLatestRelease(): Promise<RemoteReleaseInfo | null> {
  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No release published yet on github, return current version as up to date
        return {
          version: CURRENT_APP_VERSION,
          releaseName: `नेपाली वैदिक ज्योतिष v${CURRENT_APP_VERSION}`,
          publishedAt: new Date().toISOString(),
          releaseNotes: 'प्रारम्भिक आधिकारिक संस्करण (Initial Official Release)',
          downloadUrl: `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases`,
          hasUpdate: false,
          assets: []
        };
      }
      return null;
    }

    const data = await response.json();
    const remoteTag = data.tag_name || data.name || CURRENT_APP_VERSION;
    const hasUpdate = isNewerVersion(remoteTag, CURRENT_APP_VERSION);

    const assets = (data.assets || []).map((asset: any) => {
      const name = asset.name || '';
      let platform: 'windows' | 'android' | 'mac' | 'other' = 'other';
      if (name.endsWith('.exe')) platform = 'windows';
      else if (name.endsWith('.apk')) platform = 'android';
      else if (name.endsWith('.dmg')) platform = 'mac';

      return {
        name,
        downloadUrl: asset.browser_download_url,
        size: asset.size || 0,
        platform
      };
    });

    return {
      version: remoteTag,
      releaseName: data.name || `संस्करण ${remoteTag}`,
      publishedAt: data.published_at || new Date().toISOString(),
      releaseNotes: data.body || 'नयाँ सुधार र गतिशीलता थप गरिएको छ।',
      downloadUrl: data.html_url || `https://github.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases`,
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
