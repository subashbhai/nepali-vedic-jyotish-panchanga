/**
 * Balananda Vaidik Sewa — Central Client Authentication Service
 * 
 * Rebuilt to remove all obsolete OTP infrastructure:
 * - 5-Field Signup: Full Name, Address, Mobile No, Username, Password
 * - Dual-Identifier Login: Mobile Number OR Username + Password
 * - Server-Verified Sessions & RBAC Store Synchronization
 * - Super Admin User Management, Category Control & Payment API Integration
 */

import { apiClient } from './apiClient';
import { RBACSession, setRBACSession, clearRBACSession, getActiveRBACSession, getStoredRBACUsers, saveRBACUsers, RBACUser } from '../db/rbacStore';
import { getStoredClientLeads, saveClientLeads } from '../db/clientLeadStore';
import { hashPasswordSync, verifyPassword } from '../utils/cryptoUtils';
import { unifiedUserSyncService } from './unifiedUserSyncService';
import { buildCanonicalBirthProfile } from '../utils/birthProfileCanonical';
import { saveUserPersonalBirthProfile } from '../db/profileStore';
import { resolveCanonicalUserState } from '../core/canonicalMembershipPolicy';

export interface SignupInput {
  fullName: string;
  address: string;
  mobileNumber: string;
  username: string;
  password: string;
  dobBS?: string;
  dobAD?: string;
  birthTime?: string;
  birthPlace?: any;
  email?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: any;
  token?: string;
  session?: RBACSession;
  error?: string;
}

class AuthService {
  /**
   * 1. Direct 8-Field User Signup (No OTP)
   */
  async signup(data: SignupInput): Promise<AuthResponse> {
    const fullName = String(data.fullName || '').trim();
    const address = String(data.address || '').trim();
    const mobileNumber = String(data.mobileNumber || '').trim();
    const username = String(data.username || '').trim().toLowerCase();
    const password = String(data.password || '').trim();
    const dobBS = String(data.dobBS || '').trim();
    const dobAD = String(data.dobAD || '').trim();
    const birthTime = String(data.birthTime || '').trim();
    const birthPlace = data.birthPlace || null;
    const email = String(data.email || '').trim();

    if (!fullName || !address || !mobileNumber || !username || !password) {
      return {
        success: false,
        message: 'कृपया सबै अनिवार्य विवरणहरू (पूरा नाम, ठेगाना, मोबाइल नम्बर, युजरनेम, पासवर्ड, जन्म मिति, जन्म समय र जन्म स्थान) भर्नुहोस्।'
      };
    }

    try {
      const res = await apiClient.post<AuthResponse>('/api/auth/register', {
        fullName,
        address,
        mobileNumber,
        phone: mobileNumber,
        username,
        password,
        dobBS,
        dobAD,
        birthTime,
        birthPlace,
        email
      });

      const payload = (res.data || res) as any;
      if (res.success && payload?.user) {
        const user = payload.user;
        const token = payload.token || `session_${Date.now()}`;

        const canonicalBirth = user.birthDetails 
          ? buildCanonicalBirthProfile(user.birthDetails)
          : (user.dobBS || user.birthTime || user.birthPlace || user.address)
            ? buildCanonicalBirthProfile(user)
            : undefined;

        const session: RBACSession = {
          token,
          userId: user.id,
          username: user.username,
          fullName: user.fullName,
          role: (user.role || 'CUSTOMER') as any,
          roleNameNepali: user.roleNameNepali || 'साधारण प्रयोगकर्ता (विजिटर)',
          status: 'active',
          permissions: user.permissions || ['visitor.view'],
          customerId: user.customerId,
          phone: user.phone,
          birthDetails: canonicalBirth as any,
          createdAtISO: user.createdAtISO || new Date().toISOString(),
          lastActivityISO: new Date().toISOString(),
          userCategory: user.userCategory || 'visitor',
          lifecycleState: user.lifecycleState,
          jyotishAccess: user.jyotishAccess,
          vastuAccess: user.vastuAccess,
          trial: user.trial
        };

        if (canonicalBirth && user.id) {
          try {
            saveUserPersonalBirthProfile(user.id, canonicalBirth as any);
            localStorage.setItem(`balananda_user_birth_profile_${user.id}`, JSON.stringify(canonicalBirth));
          } catch {}
        }

        // Cache locally for offline session liveness
        const storedUsers = getStoredRBACUsers();
        if (!storedUsers.some(u => u.id === user.id || u.phone === user.phone)) {
          storedUsers.unshift(user);
          saveRBACUsers(storedUsers);
        }

        setRBACSession(session);
        try {
          localStorage.setItem('balananda_user_session_token', token);
          localStorage.setItem('balananda_user_category', user.userCategory || 'visitor');
        } catch {}

        try {
          unifiedUserSyncService.recordUserSignup(user);
        } catch {}

        return {
          success: true,
          message: payload.message || 'खाता सफलतापूर्वक दर्ता भयो!',
          user,
          token,
          session
        };
      }

      if (res.error || payload?.error || payload?.message) {
        return {
          success: false,
          message: payload?.message || res.error || payload?.error || 'दर्ता असफल भयो।'
        };
      }
    } catch (e: any) {
      console.error('Backend signup error:', e);
      return {
        success: false,
        message: 'केन्द्रीय सर्भरसँग सम्पर्क हुन सकेन। कृपया इन्टरनेट वा सर्भर जडान जाँच गरी पुनः प्रयास गर्नुहोस्।'
      };
    }
  }

  /**
   * 2. Direct Dual-Identifier Login (Mobile Number OR Username + Password)
   */
  async login(phoneOrUsername: string, password: string): Promise<AuthResponse> {
    const cleanId = String(phoneOrUsername || '').trim();
    const cleanPass = String(password || '').trim();

    if (!cleanId || !cleanPass) {
      return {
        success: false,
        message: 'कृपया मोबाइल नम्बर वा प्रयोगकर्ता नाम र पासवर्ड प्रविष्ट गर्नुहोस्।'
      };
    }

    try {
      const res = await apiClient.post<AuthResponse>('/api/auth/login', {
        phoneOrUsername: cleanId,
        password: cleanPass
      });

      const payload = (res.data || res) as any;
      if (res.success && payload?.user) {
        const user = payload.user;
        const token = payload.token || `session_${Date.now()}`;

        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.role === 'super_admin';
        const canonicalBirth = user.birthDetails 
          ? buildCanonicalBirthProfile(user.birthDetails)
          : (user.dobBS || user.birthTime || user.birthPlace || user.address)
            ? buildCanonicalBirthProfile(user)
            : undefined;

        const canonical = resolveCanonicalUserState({
          user,
          membership: user.membership,
          trial: user.trial,
          licenses: user.licenses
        });

        const session: RBACSession = {
          token,
          userId: user.id,
          username: user.username,
          fullName: user.fullName,
          role: (user.role || 'CUSTOMER') as any,
          roleNameNepali: canonical.roleNameNepali,
          status: user.status || 'active',
          permissions: user.permissions || (isSuperAdmin ? ['*'] : ['visitor.view']),
          customerId: user.customerId,
          phone: user.phone,
          birthDetails: canonicalBirth as any,
          createdAtISO: user.createdAtISO || new Date().toISOString(),
          lastActivityISO: new Date().toISOString(),
          userCategory: canonical.userCategory,
          lifecycleState: user.lifecycleState,
          jyotishAccess: user.jyotishAccess,
          vastuAccess: user.vastuAccess,
          trial: user.trial
        };

        if (canonicalBirth && user.id) {
          try {
            saveUserPersonalBirthProfile(user.id, canonicalBirth as any);
            localStorage.setItem(`balananda_user_birth_profile_${user.id}`, JSON.stringify(canonicalBirth));
          } catch {}
        }

        setRBACSession(session);
        try {
          localStorage.setItem('balananda_user_session_token', token);
          localStorage.setItem('balananda_user_category', canonical.userCategory);
          if (isSuperAdmin) {
            localStorage.setItem('balananda_superadmin_auth_token', token);
            localStorage.setItem('balananda_superadmin_jwt_v2', token);
            localStorage.setItem('superadmin_token', token);
          }
        } catch {}

        return {
          success: true,
          message: payload.message || 'लगइन सफल भयो!',
          user,
          token,
          session
        };
      }

      if (res.error || payload?.error || payload?.message) {
        return {
          success: false,
          message: payload?.message || res.error || payload?.error || 'लगइन असफल भयो।'
        };
      }
    } catch (e: any) {
      console.warn('Backend login error:', e);
    }

    // Local / Offline fallback (for static hosting or offline resilience)
    const storedUsers = getStoredRBACUsers();
    const cleanDigits = cleanId.replace(/\D/g, '').slice(-10);
    const cleanUser = cleanId.toLowerCase();

    // Check against registered users
    const matchedUser = storedUsers.find(u => {
      const uDigits = (u.phone || '').replace(/\D/g, '').slice(-10);
      const uName = String(u.username || '').toLowerCase();
      return (cleanDigits.length === 10 && uDigits === cleanDigits) || uName === cleanUser;
    });

    if (matchedUser) {
      const isPassValid = verifyPassword(cleanPass, matchedUser.passwordHash) ||
        (matchedUser as any).passwordPlain === cleanPass ||
        (matchedUser as any).password === cleanPass;

      if (isPassValid) {
        const token = `session_${Date.now()}`;
        const canonical = resolveCanonicalUserState({ user: matchedUser });
        const session: RBACSession = {
          token,
          userId: matchedUser.id,
          username: matchedUser.username,
          fullName: matchedUser.fullName,
          role: (matchedUser.role || 'CUSTOMER') as any,
          roleNameNepali: canonical.roleNameNepali,
          status: matchedUser.status || 'active',
          permissions: matchedUser.permissions || ['visitor.view'],
          customerId: matchedUser.customerId,
          phone: matchedUser.phone,
          userCategory: canonical.userCategory,
          createdAtISO: matchedUser.createdAtISO || new Date().toISOString(),
          lastActivityISO: new Date().toISOString()
        };

        setRBACSession(session);
        try {
          localStorage.setItem('balananda_user_session_token', token);
          localStorage.setItem('balananda_user_category', canonical.userCategory);
        } catch {}

        return {
          success: true,
          message: 'लगइन सफल भयो!',
          user: { ...matchedUser, userCategory: canonical.userCategory, roleNameNepali: canonical.roleNameNepali },
          token,
          session
        };
      } else {
        return {
          success: false,
          message: 'पासवर्ड मिलेन। कृपया सही पासवर्ड प्रविष्ट गर्नुहोस्।'
        };
      }
    }

    return {
      success: false,
      message: 'लगइन प्रमाणिकरण हुन सकेन। कृपया मोबाइल वा युजरनेम र पासवर्ड जाँच गर्नुहोस्।'
    };
  }

  /**
   * 3. Session Check & Verification
   */
  async getSession(): Promise<{ success: boolean; user?: any; session?: RBACSession }> {
    const local = getActiveRBACSession();
    const token = local?.token || (typeof localStorage !== 'undefined' ? localStorage.getItem('balananda_user_session_token') : null);
    if (token) {
      try {
        const res = await apiClient.get<any>('/api/auth/session', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const serverUser = res.user || res.data?.user;
        if (res.success && serverUser) {
          return { success: true, user: serverUser, session: local || undefined };
        }
      } catch {}
    }
    return { success: Boolean(local), user: local, session: local || undefined };
  }

  /**
   * Authoritative Session & License Synchronization from Server
   * Fetches latest user state, entitlements, payment status, and paid feature unlocks
   */
  async syncUserSessionFromServer(): Promise<boolean> {
    const local = getActiveRBACSession();
    const token = local?.token || (typeof localStorage !== 'undefined' ? localStorage.getItem('balananda_user_session_token') : null);
    if (!token) return false;

    try {
      const res = await apiClient.get<any>('/api/auth/session', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = res.user || res.data?.user;
      if (res.success && user) {
        const canonical = resolveCanonicalUserState({
          user,
          membership: user.membership,
          trial: user.trial,
          licenses: user.licenses
        });

        if (local) {
          const updatedSession: RBACSession = {
            ...local,
            fullName: user.fullName || local.fullName,
            role: user.role || local.role,
            roleNameNepali: canonical.roleNameNepali,
            status: user.status || local.status,
            permissions: user.permissions || local.permissions,
            userCategory: canonical.userCategory,
            lifecycleState: user.lifecycleState || local.lifecycleState,
            jyotishAccess: user.jyotishAccess !== undefined ? user.jyotishAccess : local.jyotishAccess,
            vastuAccess: user.vastuAccess !== undefined ? user.vastuAccess : local.vastuAccess,
            karmakandaAccess: user.karmakandaAccess !== undefined ? user.karmakandaAccess : (local as any).karmakandaAccess,
            trial: user.trial || local.trial
          };
          setRBACSession(updatedSession);
        }

        try {
          localStorage.setItem('balananda_user_category', canonical.userCategory);
        } catch {}

        // Check if user has active membership or license
        const isApproved = user.membershipStatus === 'ACTIVE' || (user.jyotishAccess && user.jyotishAccess.unlocked);
        if (isApproved) {
          try {
            localStorage.setItem('software_full_access_unlocked_v1', 'true');
            const approvedLicense = {
              isApproved: true,
              leadId: user.id,
              planId: user.purchasedPlan || 'yearly_both',
              planName: user.purchasedPlan || '१ वर्ष मोबाइल + कम्प्युटर',
              clientName: user.fullName,
              approvedAtBS: user.activationDateBS || '२०८१',
              expiresAtISO: user.expiryDateISO
            };
            localStorage.setItem('balananda_approved_client_license_v2', JSON.stringify(approvedLicense));
            window.dispatchEvent(new CustomEvent('software-full-access-updated', { detail: { hasFullAccess: true } }));
          } catch {}
        }

        return true;
      }
    } catch (e) {
      console.warn('[authService] Failed to sync session from server:', e);
    }
    return false;
  }

  /**
   * 4. Logout
   */
  async logout(): Promise<void> {
    const local = getActiveRBACSession();
    if (!apiClient.isStaticHosting() && local?.token) {
      try {
        await apiClient.post('/api/auth/logout', {}, {
          headers: { Authorization: `Bearer ${local.token}` }
        });
      } catch {}
    }
    clearRBACSession();
    try {
      localStorage.removeItem('balananda_user_session_token');
      localStorage.removeItem('balananda_user_category');
    } catch {}
  }

  /**
   * 5. User In-App Notifications
   */
  async getUserNotifications(): Promise<{ success: boolean; notifications: any[] }> {
    const local = getActiveRBACSession();
    if (!local?.token) return { success: false, notifications: [] };

    try {
      const res = await apiClient.get<any>('/api/user/notifications', {
        headers: { Authorization: `Bearer ${local.token}` }
      });
      if (res.success && Array.isArray(res.data?.notifications)) {
        return { success: true, notifications: res.data.notifications };
      }
    } catch {}
    return { success: true, notifications: [] };
  }

  /**
   * 6. Super Admin: Get 16-Column Users Table
   */
  async getAdminUsersTable(params?: {
    search?: string;
    category?: string;
    subscriptionStatus?: string;
    paymentStatus?: string;
  }): Promise<{ success: boolean; users: any[] }> {
    try {
      const q = new URLSearchParams();
      if (params?.search) q.set('search', params.search);
      if (params?.category) q.set('category', params.category);
      if (params?.subscriptionStatus) q.set('subscriptionStatus', params.subscriptionStatus);
      if (params?.paymentStatus) q.set('paymentStatus', params.paymentStatus);

      const adminToken = typeof localStorage !== 'undefined'
        ? localStorage.getItem('balananda_superadmin_jwt_v2') ||
          localStorage.getItem('balananda_superadmin_auth_token') ||
          localStorage.getItem('superadmin_token')
        : null;
      const headers: Record<string, string> = {};
      if (adminToken && adminToken !== 'SUPERADMIN' && adminToken !== 'SUPER_ADMIN') {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }

      const res = await apiClient.get<any>(`/api/admin/users-table?${q.toString()}`, { headers });
      if (res.success && Array.isArray(res.data?.users)) {
        return { success: true, users: res.data.users };
      }
      return { success: false, users: [] };
    } catch (e) {
      console.warn('Failed to fetch admin users table from server:', e);
      return { success: false, users: [] };
    }
  }

  /**
   * 7. Super Admin: Update User Category (visitor | member | professional)
   */
  async updateUserCategory(userId: string, category: 'visitor' | 'member' | 'professional', reason?: string): Promise<{ success: boolean; message: string }> {
    try {
      const adminToken = typeof localStorage !== 'undefined'
        ? localStorage.getItem('balananda_superadmin_jwt_v2') ||
          localStorage.getItem('balananda_superadmin_auth_token') ||
          localStorage.getItem('superadmin_token')
        : null;
      const headers: Record<string, string> = {};
      if (adminToken && adminToken !== 'SUPERADMIN' && adminToken !== 'SUPER_ADMIN') {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }

      const res = await apiClient.post<any>(`/api/admin/users/${userId}/category`, { category, reason }, { headers });
      if (res.success) {
        return {
          success: true,
          message: res.data?.message || res.message || 'प्रयोगकर्ता वर्ग अद्यावधिक भयो।'
        };
      }
      return {
        success: false,
        message: res.message || res.error || 'वर्ग परिवर्तन असफल भयो।'
      };
    } catch (e: any) {
      return { success: false, message: e.message || 'वर्ग परिवर्तन असफल भयो।' };
    }
  }

  /**
   * 8. Super Admin: Record Manual Payment
   */
  async recordManualPayment(data: {
    userId: string;
    amountNPR: number;
    planId: string;
    planNameNepali: string;
    category: 'member' | 'professional';
    durationDays: number;
    paymentMethod?: string;
    notes?: string;
    transactionReference?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const adminToken = typeof localStorage !== 'undefined'
        ? localStorage.getItem('balananda_superadmin_jwt_v2') ||
          localStorage.getItem('balananda_superadmin_auth_token') ||
          localStorage.getItem('superadmin_token')
        : null;
      const headers: Record<string, string> = {};
      if (adminToken && adminToken !== 'SUPERADMIN' && adminToken !== 'SUPER_ADMIN') {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }

      const res = await apiClient.post<any>('/api/admin/payments/record', data, { headers });
      if (res.success) {
        return {
          success: true,
          message: res.data?.message || res.message || 'भुक्तानी सफलतापूर्वक दर्ता भयो।'
        };
      }
      return {
        success: false,
        message: res.message || res.error || 'भुक्तानी दर्ता असफल भयो।'
      };
    } catch (e: any) {
      return { success: false, message: e.message || 'भुक्तानी दर्ता असफल भयो।' };
    }
  }

  /**
   * 9. Super Admin: Run Expiry & 1-Month Advance Reminders Check
   */
  async checkSubscriptionExpiry(): Promise<{ success: boolean; expiredCount: number; remindersCount: number }> {
    try {
      const adminToken = typeof localStorage !== 'undefined'
        ? localStorage.getItem('balananda_superadmin_jwt_v2') ||
          localStorage.getItem('balananda_superadmin_auth_token') ||
          localStorage.getItem('superadmin_token')
        : null;
      const headers: Record<string, string> = {};
      if (adminToken && adminToken !== 'SUPERADMIN' && adminToken !== 'SUPER_ADMIN') {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }

      const res = await apiClient.post<any>('/api/admin/subscriptions/check-expiry', {}, { headers });
      return {
        success: Boolean(res.success),
        expiredCount: res.data?.expiredCount || 0,
        remindersCount: res.data?.remindersCount || 0
      };
    } catch {
      return { success: false, expiredCount: 0, remindersCount: 0 };
    }
  }

  /**
   * 10. Super Admin: Get Notifications & Expiry Alerts
   */
  async getAdminNotifications(): Promise<{ success: boolean; notifications: any[] }> {
    try {
      const adminToken = typeof localStorage !== 'undefined'
        ? localStorage.getItem('balananda_superadmin_jwt_v2') ||
          localStorage.getItem('balananda_superadmin_auth_token') ||
          localStorage.getItem('superadmin_token')
        : null;
      const headers: Record<string, string> = {};
      if (adminToken && adminToken !== 'SUPERADMIN' && adminToken !== 'SUPER_ADMIN') {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }

      const res = await apiClient.get<any>('/api/admin/notifications', { headers });
      if (res.success && Array.isArray(res.data?.notifications)) {
        return { success: true, notifications: res.data.notifications };
      }
    } catch {}
    return { success: true, notifications: [] };
  }
}

export const authService = new AuthService();
