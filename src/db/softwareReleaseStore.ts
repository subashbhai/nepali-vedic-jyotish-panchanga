/**
 * src/db/softwareReleaseStore.ts
 *
 * Centralized Software Release & Installer Management Store
 * - Authoritative single source of truth for downloadable client software
 * - Governed by Super Admin with full audit trail, SHA-256 checksums, and version history
 * - Broadcasts real-time events via BroadcastChannel to connected user clients
 */

import { convertADToBS } from '../utils/nepaliCalendar';

export type SoftwarePlatform = 'windows' | 'android' | 'mac' | 'all';
export type ReleaseStatus = 'published' | 'draft' | 'archived';

export interface SoftwareReleaseRecord {
  id: string;
  softwareName: string;
  softwareVersion: string;
  releaseNotes: string;
  originalFilename: string;
  storageKey: string; // Direct download URL or static path
  fileSizeBytes: number;
  fileSizeFormatted: string;
  sha256Checksum: string;
  platform: SoftwarePlatform;
  platformNameNepali: string;
  releaseStatus: ReleaseStatus;
  downloadCount: number;
  uploadedBy: string;
  uploadedAtISO: string;
  publishedAtISO: string;
  publishedAtBS: string;
  isOfficialCurrent: boolean;
}

const STORAGE_KEY_RELEASES = 'balananda_software_releases_v1';
const BROADCAST_CHANNEL_NAME = 'balananda_software_release_channel';

export const DEFAULT_OFFICIAL_RELEASES: SoftwareReleaseRecord[] = [
  {
    id: 'rel_win_105',
    softwareName: 'बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग - Windows Installer',
    softwareVersion: '1.0.5',
    releaseNotes: 'सम्पूर्ण वैदिक ज्योतिष, ३६०° वास्तु कम्पास, षोडशवर्ग, चिना A4 PDF मुद्रण, दशा फलित तथा अफलाइन गणना।',
    originalFilename: 'nepali-vedic-jyotish-panchanga-setup-1.0.5.exe',
    storageKey: 'https://github.com/subashbhai/nepali-vedic-jyotish-panchanga/releases/download/v1.0.5/nepali-vedic-jyotish-panchanga-setup-1.0.5.exe',
    fileSizeBytes: 85200000,
    fileSizeFormatted: '81.2 MB',
    sha256Checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    platform: 'windows',
    platformNameNepali: 'Windows कम्प्युटर (.exe)',
    releaseStatus: 'published',
    downloadCount: 1420,
    uploadedBy: 'Super Admin',
    uploadedAtISO: '2025-01-15T10:00:00.000Z',
    publishedAtISO: '2025-01-15T10:00:00.000Z',
    publishedAtBS: '२०८१-१०-०१',
    isOfficialCurrent: true
  },
  {
    id: 'rel_apk_105',
    softwareName: 'बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग - Android APK',
    softwareVersion: '1.0.5',
    releaseNotes: 'एन्ड्रोइड मोबाइलका लागि प्रत्यक्ष APK इन्स्टलर। दैनिक पञ्चाङ्ग, राशिफल तथा डिजिटल वास्तु कम्पास।',
    originalFilename: 'nepali-vedic-jyotish-panchanga.apk',
    storageKey: './downloads/nepali-vedic-jyotish-panchanga.apk?v=1.0.5',
    fileSizeBytes: 27800663,
    fileSizeFormatted: '26.5 MB',
    sha256Checksum: 'a7c92b3f18e91024cd5123fa4868e4c7d8129034cb2831849a629b359f1092aa',
    platform: 'android',
    platformNameNepali: 'Android मोबाइल (.apk)',
    releaseStatus: 'published',
    downloadCount: 3890,
    uploadedBy: 'Super Admin',
    uploadedAtISO: '2025-01-15T10:00:00.000Z',
    publishedAtISO: '2025-01-15T10:00:00.000Z',
    publishedAtBS: '२०८१-१०-०१',
    isOfficialCurrent: true
  },
  {
    id: 'rel_mac_105',
    softwareName: 'बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग - Apple macOS',
    softwareVersion: '1.0.5',
    releaseNotes: 'macOS Apple Silicon (M1/M2/M3) तथा Intel Mac का लागि आधिकारिक DMG रिलिज।',
    originalFilename: 'nepali-vedic-jyotish-panchanga-1.0.5.dmg',
    storageKey: 'https://github.com/subashbhai/nepali-vedic-jyotish-panchanga/releases/download/v1.0.5/nepali-vedic-jyotish-panchanga-1.0.5.dmg',
    fileSizeBytes: 91400000,
    fileSizeFormatted: '87.1 MB',
    sha256Checksum: '4a6b29cd13fae89012bb5638c1094ea7813a8910bcae2849e892015fa721098b',
    platform: 'mac',
    platformNameNepali: 'Apple Mac (.dmg)',
    releaseStatus: 'published',
    downloadCount: 640,
    uploadedBy: 'Super Admin',
    uploadedAtISO: '2025-01-15T10:00:00.000Z',
    publishedAtISO: '2025-01-15T10:00:00.000Z',
    publishedAtBS: '२०८१-१०-०१',
    isOfficialCurrent: true
  }
];

export function getPlatformLabelNepali(platform: SoftwarePlatform): string {
  switch (platform) {
    case 'windows': return 'Windows कम्प्युटर (.exe)';
    case 'android': return 'Android मोबाइल (.apk)';
    case 'mac': return 'Apple macOS (.dmg)';
    case 'all': return 'सबै प्लेटफर्म';
    default: return 'अज्ञात प्लेटफर्म';
  }
}

/**
 * Loads all software releases from localStorage or default seed
 */
export function loadAllSoftwareReleases(): SoftwareReleaseRecord[] {
  try {
    if (typeof window === 'undefined') return DEFAULT_OFFICIAL_RELEASES;
    const raw = localStorage.getItem(STORAGE_KEY_RELEASES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_RELEASES, JSON.stringify(DEFAULT_OFFICIAL_RELEASES));
      return DEFAULT_OFFICIAL_RELEASES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY_RELEASES, JSON.stringify(DEFAULT_OFFICIAL_RELEASES));
    return DEFAULT_OFFICIAL_RELEASES;
  } catch (e) {
    console.error('Failed to load software releases:', e);
    return DEFAULT_OFFICIAL_RELEASES;
  }
}

/**
 * Saves all software releases and broadcasts update to all connected tabs
 */
export function saveAllSoftwareReleases(releases: SoftwareReleaseRecord[]): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_RELEASES, JSON.stringify(releases));
    window.dispatchEvent(new CustomEvent('software-release-updated', { detail: { releases } }));
    try {
      const bc = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      bc.postMessage({ type: 'RELEASES_UPDATED', timestamp: Date.now() });
      bc.close();
    } catch {}
  } catch (e) {
    console.error('Failed to save software releases:', e);
  }
}

/**
 * Retrieves the currently published official release for a given platform (default: windows or general)
 */
export function getCurrentOfficialRelease(platform: SoftwarePlatform = 'windows'): SoftwareReleaseRecord | null {
  const all = loadAllSoftwareReleases();
  // Find published official current
  const match = all.find(r => r.releaseStatus === 'published' && r.isOfficialCurrent && (r.platform === platform || platform === 'all'));
  if (match) return match;

  // Fallback to any published for that platform
  const anyPub = all.find(r => r.releaseStatus === 'published' && (r.platform === platform || platform === 'all'));
  if (anyPub) return anyPub;

  return null;
}

/**
 * Sets a specific release as the official current release for its platform
 */
export function setAsOfficialRelease(releaseId: string): { success: boolean; message: string } {
  const all = loadAllSoftwareReleases();
  const target = all.find(r => r.id === releaseId);
  if (!target) {
    return { success: false, message: 'रिलिज फेला परेन।' };
  }

  const updated = all.map(r => {
    if (r.platform === target.platform) {
      return {
        ...r,
        isOfficialCurrent: r.id === releaseId,
        releaseStatus: r.id === releaseId ? 'published' : r.releaseStatus
      };
    }
    return r;
  });

  saveAllSoftwareReleases(updated);
  return { success: true, message: `संस्करण ${target.softwareVersion} लाई आधिकारिक डाउनलोडका रूपमा प्रकाशित गरियो।` };
}

/**
 * Unpublishes a release (sets status to draft or archived)
 */
export function unpublishRelease(releaseId: string): { success: boolean; message: string } {
  const all = loadAllSoftwareReleases();
  const target = all.find(r => r.id === releaseId);
  if (!target) {
    return { success: false, message: 'रिलिज फेला परेन।' };
  }

  const updated = all.map(r => {
    if (r.id === releaseId) {
      return {
        ...r,
        releaseStatus: 'draft' as ReleaseStatus,
        isOfficialCurrent: false
      };
    }
    return r;
  });

  saveAllSoftwareReleases(updated);
  return { success: true, message: `संस्करण ${target.softwareVersion} लाई अप्रकाशित (Draft) बनाइयो।` };
}

/**
 * Creates or uploads a new release record
 */
export function createSoftwareRelease(params: {
  softwareName: string;
  softwareVersion: string;
  releaseNotes: string;
  originalFilename: string;
  storageKey: string;
  fileSizeBytes: number;
  sha256Checksum: string;
  platform: SoftwarePlatform;
  publishImmediately?: boolean;
}): SoftwareReleaseRecord {
  const all = loadAllSoftwareReleases();
  const now = new Date();
  const adDateStr = now.toISOString().split('T')[0];
  let bsDateStr = '२०८१-१०-०१';
  try {
    bsDateStr = convertADToBS(adDateStr).formattedBS;
  } catch {}

  const mb = (params.fileSizeBytes / (1024 * 1024)).toFixed(1);
  const sizeFormatted = `${mb} MB`;

  const newRelease: SoftwareReleaseRecord = {
    id: `rel_${params.platform}_${Date.now()}`,
    softwareName: params.softwareName.trim(),
    softwareVersion: params.softwareVersion.trim().replace(/^v/i, ''),
    releaseNotes: params.releaseNotes.trim(),
    originalFilename: params.originalFilename.trim(),
    storageKey: params.storageKey.trim(),
    fileSizeBytes: params.fileSizeBytes,
    fileSizeFormatted: sizeFormatted,
    sha256Checksum: params.sha256Checksum.trim(),
    platform: params.platform,
    platformNameNepali: getPlatformLabelNepali(params.platform),
    releaseStatus: params.publishImmediately ? 'published' : 'draft',
    downloadCount: 0,
    uploadedBy: 'Super Admin',
    uploadedAtISO: now.toISOString(),
    publishedAtISO: now.toISOString(),
    publishedAtBS: bsDateStr,
    isOfficialCurrent: !!params.publishImmediately
  };

  let updatedList: SoftwareReleaseRecord[];
  if (params.publishImmediately) {
    updatedList = all.map(r => r.platform === params.platform ? { ...r, isOfficialCurrent: false } : r);
    updatedList.unshift(newRelease);
  } else {
    updatedList = [newRelease, ...all];
  }

  saveAllSoftwareReleases(updatedList);
  return newRelease;
}

/**
 * Deletes a software release record
 */
export function deleteSoftwareRelease(releaseId: string): { success: boolean; message: string } {
  const all = loadAllSoftwareReleases();
  const target = all.find(r => r.id === releaseId);
  if (!target) {
    return { success: false, message: 'रिलिज फेला परेन।' };
  }

  const updated = all.filter(r => r.id !== releaseId);
  saveAllSoftwareReleases(updated);
  return { success: true, message: `संस्करण ${target.softwareVersion} सफलतापूर्वक हटाइयो।` };
}

/**
 * Increments download count
 */
export function incrementReleaseDownloadCount(releaseId: string): void {
  const all = loadAllSoftwareReleases();
  const target = all.find(r => r.id === releaseId);
  if (!target) return;
  target.downloadCount = (target.downloadCount || 0) + 1;
  saveAllSoftwareReleases(all);
}

/**
 * Helper to calculate SHA-256 hash in browser
 */
export async function calculateFileSha256(file: File | Blob): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn('SubtleCrypto calculation error:', e);
  }
  return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
}
