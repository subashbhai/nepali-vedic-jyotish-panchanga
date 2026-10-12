/**
 * src/db/securityBlacklist.ts
 *
 * Persistent Deletion & Blacklist Store:
 * Guarantees that once a Super Admin permanently deletes a user, customer,
 * or record (phone, loginId, username, or id), it is NEVER revived or resurrected
 * by fallback initializers, seed records, or cross-store synchronization.
 */

const DELETED_IDENTIFIERS_KEY = 'balananda_permanently_deleted_identifiers_v2';

export function getPermanentlyDeletedIdentifiers(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_IDENTIFIERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addPermanentlyDeletedIdentifier(identifier: string): void {
  if (typeof window === 'undefined' || !identifier) return;
  try {
    const norm = String(identifier).trim().toLowerCase();
    const cleanDigits = norm.replace(/\D/g, '').slice(-10);
    const list = getPermanentlyDeletedIdentifiers();
    const set = new Set(list);
    if (norm) set.add(norm);
    if (cleanDigits && cleanDigits.length >= 7) set.add(cleanDigits);
    localStorage.setItem(DELETED_IDENTIFIERS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error('Failed to blacklist deleted user identifier:', e);
  }
}

export function isPermanentlyDeleted(identifier?: string | null): boolean {
  if (!identifier) return false;
  const list = getPermanentlyDeletedIdentifiers();
  if (!list || list.length === 0) return false;
  const norm = String(identifier).trim().toLowerCase();
  const cleanDigits = norm.replace(/\D/g, '').slice(-10);
  if (list.includes(norm)) return true;
  if (cleanDigits && cleanDigits.length >= 7 && list.includes(cleanDigits)) return true;
  return false;
}
