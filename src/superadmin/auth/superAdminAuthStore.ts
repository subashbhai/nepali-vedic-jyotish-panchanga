/**
 * Super Admin Secure Authentication Store
 * Completely isolated from public/client user sessions and local states.
 */

export interface SuperAdminSessionState {
  token: string;
  adminId: string;
  username: string;
  fullName: string;
  role: 'super_admin';
  roleNameNepali: string;
  permissions: string[];
  loginTimeISO: string;
  lastActivityISO: string;
}

const STORAGE_KEY_SUPERADMIN_SESSION = 'balananda_superadmin_secure_session_v2';
const STORAGE_KEY_SUPERADMIN_TOKEN = 'balananda_superadmin_jwt_v2';

export function getSuperAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY_SUPERADMIN_TOKEN);
}

export function getActiveSuperAdminSession(): SuperAdminSessionState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUPERADMIN_SESSION);
    if (!raw) return null;
    const session: SuperAdminSessionState = JSON.parse(raw);
    
    // Check 2-hour session expiration
    const now = Date.now();
    const lastActivity = new Date(session.lastActivityISO || session.loginTimeISO).getTime();
    if (now - lastActivity > 2 * 60 * 60 * 1000) {
      clearSuperAdminSession();
      return null;
    }
    
    // Touch activity
    session.lastActivityISO = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_SUPERADMIN_SESSION, JSON.stringify(session));
    return session;
  } catch {
    return null;
  }
}

export function setSuperAdminSession(session: SuperAdminSessionState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SUPERADMIN_SESSION, JSON.stringify(session));
    localStorage.setItem(STORAGE_KEY_SUPERADMIN_TOKEN, session.token);
    // Dispatch custom event for state reactivity across tabs
    window.dispatchEvent(new CustomEvent('superadmin-session-changed', { detail: session }));
  } catch (err) {
    console.error('Failed to save Super Admin session:', err);
  }
}

export function clearSuperAdminSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_SUPERADMIN_SESSION);
    localStorage.removeItem(STORAGE_KEY_SUPERADMIN_TOKEN);
    window.dispatchEvent(new CustomEvent('superadmin-session-changed', { detail: null }));
  } catch (err) {
    console.error('Failed to clear Super Admin session:', err);
  }
}

/**
 * Verify token with backend server
 */
export async function verifySuperAdminTokenWithServer(): Promise<{ valid: boolean; user?: any }> {
  const token = getSuperAdminToken();
  if (!token) return { valid: false };

  try {
    const res = await fetch('/api/superadmin/auth-check', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      clearSuperAdminSession();
      return { valid: false };
    }

    const data = await res.json();
    return { valid: !!data.success, user: data.admin };
  } catch {
    // If offline or network error, fallback to valid client session check if present
    const local = getActiveSuperAdminSession();
    return { valid: !!local, user: local };
  }
}
