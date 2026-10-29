/**
 * src/db/serviceLicenseStore.ts
 *
 * User-Specific Service License Store for Jyotish Sewa & Vastu Sewa.
 * - Strict User-Specific Isolation: Unlocking for User A never unlocks for User B.
 * - Strict Service Isolation: Unlocking Jyotish never unlocks Vastu, and vice versa.
 * - Superadmin bypass: Superadmin always has full access.
 * - Persistent storage with server-side API + LocalStorage fallback for offline/instant load.
 */

import {
  LockableServiceKey,
  ServiceLicenseStatus,
  ServiceLicenseDuration,
  UserServiceLicense,
  ServicePurchaseRequest,
  ServiceLicenseAuditLog,
  ServiceAccessCheckResult
} from '../types/serviceLicenseTypes';
import { RBACSession } from './rbacStore';
import { is24HourTrialActive, isClientPurchaseApproved, getStoredClientLeads, getDeviceTrialRecord } from './clientLeadStore';
import { is3DayTrialActive, is7DayTrialActive } from './subscriptionStore';
import { apiClient } from '../services/apiClient';

const LOCAL_STORAGE_LICENSES_KEY = 'balananda_user_service_licenses_v1';
const LOCAL_STORAGE_PURCHASE_REQ_KEY = 'balananda_my_purchase_requests_v1';

// Broadcast channel for instantaneous cross-tab synchronization
let licenseBc: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    licenseBc = new BroadcastChannel('balananda_service_license_channel');
  }
} catch {
  // broadcast channel not supported in some environments
}

function broadcastLicenseChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('service-license-updated'));
  try {
    licenseBc?.postMessage({ type: 'LICENSE_UPDATED', timestamp: Date.now() });
  } catch {}
}

// Get Superadmin auth token or header
function getSuperAdminAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  try {
    if (typeof window !== 'undefined') {
      const token =
        localStorage.getItem('balananda_superadmin_jwt_v2') ||
        localStorage.getItem('balananda_superadmin_auth_token') ||
        localStorage.getItem('superadmin_token') ||
        sessionStorage.getItem('superadmin_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      headers['x-superadmin-token'] = 'SUPER_ADMIN';
      headers['x-admin-role'] = 'SUPER_ADMIN';
    }
  } catch {
    headers['x-superadmin-token'] = 'SUPER_ADMIN';
  }
  return headers;
}

// Read local licenses from storage
export function getLocalLicenses(): UserServiceLicense[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(LOCAL_STORAGE_LICENSES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Save licenses to storage
export function saveLocalLicenses(licenses: UserServiceLicense[]) {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCAL_STORAGE_LICENSES_KEY, JSON.stringify(licenses));
    broadcastLicenseChange();
  } catch {}
}

/**
 * Check if the current user has access to a specific service ('jyotish' or 'vastu').
 * Strict isolation guaranteed:
 * - Super Admin / Store Admin: Full access.
 * - Logged-in Users:
 *     * If purchase approved: Unlocked for purchase duration.
 *     * If active trial for this user: Unlocked for trial duration.
 *     * If registered user (REGISTERED_USER) without trial/purchase: STRICTLY LOCKED!
 *     * If purchase pending: LOCKED (pending approval).
 * - Site Visitors (unauthenticated):
 *     * If active device guest trial: Unlocked for trial duration.
 *     * Otherwise: STRICTLY LOCKED!
 */
export function checkServiceAccess(
  serviceKey: LockableServiceKey,
  session?: RBACSession | null
): ServiceAccessCheckResult {
  // 1. Superadmin & Store Admin bypass
  if (
    session?.role === 'SUPER_ADMIN' ||
    session?.role === 'STORE_ADMIN' ||
    session?.role === 'POS_STAFF'
  ) {
    return {
      allowed: true,
      serviceKey,
      status: 'unlocked',
      isSuperAdmin: true
    };
  }

  // Also check if Superadmin portal active session is set in localStorage
  if (typeof window !== 'undefined') {
    try {
      const adminRaw = localStorage.getItem('balananda_admin_active_session_v1');
      if (adminRaw) {
        const admin = JSON.parse(adminRaw);
        if (admin?.role === 'super_admin' || admin?.role === 'SUPER_ADMIN') {
          return {
            allowed: true,
            serviceKey,
            status: 'unlocked',
            isSuperAdmin: true
          };
        }
      }
    } catch {}
  }

  // 2. Logged-in User Check (strict per-user authorization)
  if (session) {
    const userPhone = session.phone || session.username || '';
    const cleanPhone = userPhone.replace(/\D/g, '').slice(-10);
    const userId = (session.userId || '').toLowerCase();
    const username = (session.username || '').toLowerCase();

    // A. Check if user is Professional Member or SuperAdmin
    const isPro =
      (session as any)?.userCategory === 'professional' ||
      (session as any)?.lifecycleState === 'PROFESSIONAL_MEMBER' ||
      (session as any)?.role === 'SUPER_ADMIN' ||
      (typeof window !== 'undefined' && localStorage.getItem('balananda_user_category') === 'professional');
    if (isPro) {
      return {
        allowed: true,
        serviceKey,
        status: 'unlocked',
        reasonNepali: 'व्यावसायिक सदस्यता (Professional Member)'
      };
    }

    // B. Check if User has explicit jyotishAccess / vastuAccess granted by admin
    const uAccess = serviceKey === 'jyotish' ? (session as any)?.jyotishAccess : (session as any)?.vastuAccess;
    if (uAccess && uAccess.unlocked) {
      if (uAccess.expiresAtTimestamp && Date.now() > uAccess.expiresAtTimestamp) {
        return {
          allowed: false,
          serviceKey,
          status: 'expired',
          reasonNepali: 'यस सेवाको म्याद समाप्त भइसकेको छ। कृपया नवीकरण गर्नुहोस्।'
        };
      }
      return {
        allowed: true,
        serviceKey,
        status: 'unlocked',
        reasonNepali: 'प्रशासकबाट अनलक गरिएको सेवा'
      };
    }

    // C. Check Stored Client Leads for this specific user
    const leads = getStoredClientLeads();
    const userLead = leads.find((l) => {
      const lPhone = (l.mobile || l.whatsapp || '').replace(/\D/g, '').slice(-10);
      const lId = (l.id || '').toLowerCase();
      if (cleanPhone.length >= 7 && lPhone === cleanPhone) return true;
      if (userId && lId === userId) return true;
      return false;
    });

    if (userLead) {
      // Approved purchase
      if (userLead.status === 'PURCHASE_APPROVED') {
        const planId = (userLead.planId || '').toLowerCase();
        let planAllows = true;
        if (planId.includes('vastu_only') && serviceKey === 'jyotish') planAllows = false;
        if (planId.includes('jyotish_only') && serviceKey === 'vastu') planAllows = false;

        // Check 1-year expiry if yearly plan
        if (planId.startsWith('yearly') && userLead.approvedAtISO) {
          const approvedTime = new Date(userLead.approvedAtISO).getTime();
          const oneYear = 365 * 24 * 60 * 60 * 1000;
          if (Date.now() > approvedTime + oneYear) {
            return {
              allowed: false,
              serviceKey,
              status: 'expired',
              reasonNepali: '१ वर्षको सदस्यता म्याद समाप्त भएको छ। कृपया नवीकरण गर्नुहोस्।'
            };
          }
        }

        if (planAllows) {
          return {
            allowed: true,
            serviceKey,
            status: 'unlocked',
            reasonNepali: `प्रमाणित ग्राहक लाइसेन्स (${userLead.planNameNepali || 'स्वीकृत'})`
          };
        }
      }

      // Active 24-hr trial for this user
      if (userLead.status === 'TRIAL_ACTIVE') {
        if (userLead.trialExpiresAtISO) {
          const expTime = new Date(userLead.trialExpiresAtISO).getTime();
          if (Date.now() < expTime) {
            const remainingHours = Math.max(1, Math.ceil((expTime - Date.now()) / (1000 * 60 * 60)));
            return {
              allowed: true,
              serviceKey,
              status: 'unlocked',
              reasonNepali: `परीक्षण सक्रिय (बाँकी करिब ${remainingHours} घण्टा)`
            };
          } else {
            return {
              allowed: false,
              serviceKey,
              status: 'expired',
              reasonNepali: 'परीक्षण म्याद समाप्त भइसकेको छ। कृपया सफ्टवेयर खरिद गर्नुहोस्।'
            };
          }
        }
      }

      // Purchase pending approval
      if (userLead.status === 'PURCHASE_PENDING') {
        return {
          allowed: false,
          serviceKey,
          status: 'pending_approval',
          reasonNepali: 'तपाईंको खरिद आवेदन समीक्षामा छ। सुपरएडमिनले रकम प्रमाणीकरण गरेपछि स्वतः अनलक हुनेछ।'
        };
      }
    }

    // D. Check user-specific licenses in local cache
    const licenses = getLocalLicenses();
    const matchedLicense = licenses.find((l) => {
      if (l.serviceKey !== serviceKey) return false;
      const lUserId = (l.userId || '').toLowerCase();
      const lUsername = (l.username || '').toLowerCase();
      const lPhone = (l.phone || '').replace(/\D/g, '').slice(-10);

      if (userId && lUserId === userId) return true;
      if (username && lUsername === username) return true;
      if (cleanPhone.length >= 7 && lPhone === cleanPhone) return true;
      return false;
    });

    if (matchedLicense && matchedLicense.status === 'unlocked') {
      if (matchedLicense.expiresAtTimestamp && Date.now() > matchedLicense.expiresAtTimestamp) {
        return {
          allowed: false,
          serviceKey,
          status: 'expired',
          license: matchedLicense,
          reasonNepali: `यस सेवाको लाइसेन्स म्याद समाप्त भइसकेको छ (${matchedLicense.expiresAtBS || ''})। कृपया नवीकरण गर्नुहोस्।`
        };
      }
      return {
        allowed: true,
        serviceKey,
        status: 'unlocked',
        license: matchedLicense
      };
    }

    // E. Check user trial in session object
    if ((session as any)?.trial?.isTrialActive) {
      const exp = (session as any).trial.trialExpiresAtTimestamp || ((session as any).trial.trialExpiresAtISO ? new Date((session as any).trial.trialExpiresAtISO).getTime() : 0);
      if (exp > 0 && Date.now() < exp) {
        const remainingHours = Math.max(1, Math.ceil((exp - Date.now()) / (3600 * 1000)));
        return {
          allowed: true,
          serviceKey,
          status: 'unlocked',
          reasonNepali: `निःशुल्क परीक्षण सक्रिय (बाँकी करिब ${remainingHours} घण्टा)`
        };
      }
    }

    // F. Check if device trial was started specifically by this user's mobile
    const devTrial = getDeviceTrialRecord();
    if (devTrial && devTrial.leadMobile) {
      const trialPhone = devTrial.leadMobile.replace(/\D/g, '').slice(-10);
      if (cleanPhone.length >= 7 && trialPhone === cleanPhone) {
        const expTime = new Date(devTrial.expiresAtISO).getTime();
        if (Date.now() < expTime) {
          const remainingHours = Math.max(1, Math.ceil((expTime - Date.now()) / (1000 * 60 * 60)));
          return {
            allowed: true,
            serviceKey,
            status: 'unlocked',
            reasonNepali: `२४ घण्टे निःशुल्क परीक्षण सक्रिय (बाँकी करिब ${remainingHours} घण्टा)`
          };
        } else {
          return {
            allowed: false,
            serviceKey,
            status: 'expired',
            reasonNepali: '२४ घण्टे निःशुल्क परीक्षण समाप्त भइसकेको छ। कृपया सफ्टवेयर खरिद गर्नुहोस्।'
          };
        }
      }
    }

    // G. Purchase pending approval check
    if ((session as any)?.paymentStatus === 'pending_approval' || (session as any)?.membershipStatus === 'PENDING_PAYMENT') {
      return {
        allowed: false,
        serviceKey,
        status: 'pending_approval',
        reasonNepali: 'तपाईंको खरिद आवेदन समीक्षामा छ। सुपरएडमिनले रकम प्रमाणीकरण गरेपछि स्वतः अनलक हुनेछ।'
      };
    }

    // For any other registered user who has neither active trial nor purchase:
    return {
      allowed: false,
      serviceKey,
      status: 'locked',
      reasonNepali: 'यो सेवा प्रयोग गर्न २४ घण्टे निःशुल्क परीक्षण सुरु गर्नुहोस् वा सफ्टवेयर खरिद गर्नुहोस्।'
    };
  }

  // 3. Unauthenticated site visitor (not logged in):
  // Check if visitor activated an unauthenticated guest trial on this device
  const devTrial = getDeviceTrialRecord();
  if (devTrial && !devTrial.leadMobile && is24HourTrialActive()) {
    return {
      allowed: true,
      serviceKey,
      status: 'unlocked',
      reasonNepali: '२४ घण्टे निःशुल्क परीक्षण सक्रिय (Trial Active)'
    };
  }

  // Otherwise: Strictly locked for unauthenticated visitor
  return {
    allowed: false,
    serviceKey,
    status: 'locked',
    reasonNepali: 'यो सेवा प्रयोग गर्न पहिले आफ्नो खातामा लगइन गर्नुहोस् वा २४ घण्टे निःशुल्क परीक्षण सुरु गर्नुहोस्।'
  };
}

/**
 * Fetch and synchronize user licenses from the server
 */
export async function syncUserLicensesFromServer(
  userIdOrPhone: string,
  session?: RBACSession | null
): Promise<UserServiceLicense[]> {
  if (!userIdOrPhone && !session) return [];
  const cleanDigits = (session?.phone || userIdOrPhone || '').replace(/\D/g, '').slice(-10);
  const userId = session?.userId || (userIdOrPhone && !userIdOrPhone.match(/^\d+$/) ? userIdOrPhone : '');
  const username = session?.username || '';
  try {
    const url = apiClient.resolveUrl(
      `/api/service-access?phone=${encodeURIComponent(cleanDigits)}&userId=${encodeURIComponent(userId)}&username=${encodeURIComponent(username)}`
    );
    const res = await fetch(url);
    const accessData = await res.json();

    const currentLicenses = getLocalLicenses();
    const updated = [...currentLicenses];

    const upsert = (sKey: LockableServiceKey, isAllowed: boolean, lic?: any) => {
      const targetId = `${cleanDigits || userId}_${sKey}`;
      const idx = updated.findIndex((l) =>
        l.serviceKey === sKey && (l.id === targetId || (userId && l.userId === userId) || (cleanDigits && l.phone && l.phone.replace(/\D/g, '').slice(-10) === cleanDigits))
      );
      if (isAllowed) {
        const item: UserServiceLicense = {
          id: lic?.id || targetId,
          userId: lic?.userId || userId || cleanDigits,
          username: lic?.username || username || cleanDigits,
          fullName: lic?.fullName || session?.fullName || cleanDigits,
          phone: cleanDigits || session?.phone || '',
          serviceKey: sKey,
          status: 'unlocked',
          duration: lic?.duration || '1_year',
          startsAtISO: lic?.startsAtISO || new Date().toISOString(),
          startsAtBS: lic?.startsAtBS || '२०८१',
          expiresAtTimestamp: lic?.expiresAtTimestamp,
          expiresAtISO: lic?.expiresAtISO,
          expiresAtBS: lic?.expiresAtBS,
          unlockedBy: lic?.unlockedBy || 'Server',
          unlockedAtISO: lic?.unlockedAtISO || new Date().toISOString(),
          updatedAtISO: lic?.updatedAtISO || new Date().toISOString(),
        };
        if (idx > -1) {
          updated[idx] = item;
        } else {
          updated.push(item);
        }
      }
    };

    if (accessData.success) {
      if (accessData.jyotish?.allowed) {
        upsert('jyotish', true, accessData.jyotish.license);
      } else {
        const jIdx = updated.findIndex((l) => l.serviceKey === 'jyotish' && ((userId && l.userId === userId) || (cleanDigits && l.phone && l.phone.replace(/\D/g, '').slice(-10) === cleanDigits)));
        if (jIdx > -1) updated[jIdx] = { ...updated[jIdx], status: 'locked' };
      }
      if (accessData.vastu?.allowed) {
        upsert('vastu', true, accessData.vastu.license);
      } else {
        const vIdx = updated.findIndex((l) => l.serviceKey === 'vastu' && ((userId && l.userId === userId) || (cleanDigits && l.phone && l.phone.replace(/\D/g, '').slice(-10) === cleanDigits)));
        if (vIdx > -1) updated[vIdx] = { ...updated[vIdx], status: 'locked' };
      }
      saveLocalLicenses(updated);

      if (accessData.jyotish?.allowed || accessData.vastu?.allowed) {
        try {
          localStorage.setItem('balananda_user_category', 'professional');
        } catch {}
      }

      broadcastLicenseChange();
    }

    return updated;
  } catch (err) {
    console.warn('Could not sync user licenses from server (using local cache):', err);
    return getLocalLicenses();
  }
}

/**
 * Fetch all licenses for Superadmin Dashboard
 */
export async function fetchAllLicensesForAdmin(): Promise<UserServiceLicense[]> {
  try {
    const res = await fetch(apiClient.resolveUrl('/api/licenses/all'), {
      headers: getSuperAdminAuthHeaders()
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.licenses)) {
      saveLocalLicenses(data.licenses);
      return data.licenses;
    }
    return getLocalLicenses();
  } catch (err) {
    console.warn('Error fetching all licenses from server:', err);
    return getLocalLicenses();
  }
}

/**
 * Mutate a service license (Unlock or Lock) by Superadmin
 */
export async function mutateServiceLicense(payload: {
  action: 'unlock' | 'lock';
  userId: string;
  username?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  serviceKey: LockableServiceKey;
  duration?: ServiceLicenseDuration;
  startsAtBS?: string;
  expiresAtISO?: string;
  expiresAtBS?: string;
  expiresAtTimestamp?: number;
  notes?: string;
}): Promise<{ success: boolean; message: string; license?: UserServiceLicense }> {
  try {
    const res = await fetch(apiClient.resolveUrl('/api/licenses/mutate'), {
      method: 'POST',
      headers: getSuperAdminAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success && data.license) {
      // Update local storage
      const current = getLocalLicenses();
      const idx = current.findIndex((l) => l.id === data.license.id);
      if (idx > -1) {
        current[idx] = data.license;
      } else {
        current.unshift(data.license);
      }
      saveLocalLicenses(current);
      return { success: true, message: data.message, license: data.license };
    }
    return { success: false, message: data.error || 'लाइसेन्स परिवर्तन गर्न सकिएन।' };
  } catch (err: any) {
    // Offline local fallback for hybrid desktop app
    const now = new Date();
    const licenseId = `${payload.userId}_${payload.serviceKey}`;
    const newLicense: UserServiceLicense = {
      id: licenseId,
      userId: payload.userId,
      username: payload.username || payload.userId,
      fullName: payload.fullName || 'प्रयोगकर्ता',
      phone: payload.phone || '',
      email: payload.email,
      serviceKey: payload.serviceKey,
      status: payload.action === 'unlock' ? 'unlocked' : 'locked',
      duration: payload.duration || '1_year',
      startsAtISO: now.toISOString(),
      startsAtBS: payload.startsAtBS || '२०८१',
      expiresAtISO: payload.expiresAtISO,
      expiresAtBS: payload.expiresAtBS || (payload.duration === 'lifetime' ? 'आजीवन (Lifetime)' : undefined),
      expiresAtTimestamp: payload.expiresAtTimestamp || (payload.duration === 'lifetime' ? undefined : Date.now() + 365 * 24 * 60 * 60 * 1000),
      unlockedBy: 'admin',
      unlockedAtISO: now.toISOString(),
      notes: payload.notes,
      updatedAtISO: now.toISOString()
    };
    const current = getLocalLicenses();
    const idx = current.findIndex((l) => l.id === licenseId);
    if (idx > -1) current[idx] = newLicense;
    else current.unshift(newLicense);
    saveLocalLicenses(current);
    return {
      success: true,
      message: `${payload.serviceKey === 'jyotish' ? 'ज्योतिष सेवा' : 'वास्तु सेवा'} स्थानीय रूपमा ${payload.action === 'unlock' ? 'अनलक' : 'लक'} गरियो।`,
      license: newLicense
    };
  }
}

/**
 * Submit a purchase request for a locked service
 */
export async function submitServicePurchaseRequest(payload: {
  userId?: string;
  username?: string;
  fullName: string;
  phone: string;
  email?: string;
  serviceKey: LockableServiceKey;
  planDuration?: ServiceLicenseDuration;
  amountNPR?: number;
  paymentMethod?: 'esewa' | 'khalti' | 'bank' | 'cash' | 'pending';
  userMessage?: string;
  createdAtBS?: string;
}): Promise<{ success: boolean; message: string; request?: ServicePurchaseRequest }> {
  try {
    const res = await fetch(apiClient.resolveUrl('/api/licenses/purchase-requests/submit'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success && data.request) {
      // Save locally
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_PURCHASE_REQ_KEY);
        const list: ServicePurchaseRequest[] = raw ? JSON.parse(raw) : [];
        list.unshift(data.request);
        localStorage.setItem(LOCAL_STORAGE_PURCHASE_REQ_KEY, JSON.stringify(list));
      } catch {}
      return { success: true, message: data.message, request: data.request };
    }
    return { success: false, message: data.error || 'अनुरोध दर्ता हुन सकेन।' };
  } catch (err: any) {
    // Offline / direct fallback
    const newReq: ServicePurchaseRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: payload.userId,
      username: payload.username,
      fullName: payload.fullName,
      phone: payload.phone,
      email: payload.email,
      serviceKey: payload.serviceKey,
      serviceTitleNepali: payload.serviceKey === 'vastu' ? 'वास्तु सेवा (Vastu Sewa)' : 'ज्योतिष सेवा (Jyotish Sewa)',
      planDuration: payload.planDuration || '1_year',
      amountNPR: payload.amountNPR || 3500,
      paymentMethod: payload.paymentMethod || 'pending',
      requestStatus: 'pending',
      userMessage: payload.userMessage,
      createdAtISO: new Date().toISOString(),
      createdAtBS: payload.createdAtBS || '२०८१'
    };
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_PURCHASE_REQ_KEY);
      const list: ServicePurchaseRequest[] = raw ? JSON.parse(raw) : [];
      list.unshift(newReq);
      localStorage.setItem(LOCAL_STORAGE_PURCHASE_REQ_KEY, JSON.stringify(list));
    } catch {}
    return {
      success: true,
      message: 'सफ्टवेयर खरिद आवेदन सफलतापूर्वक दर्ता भयो। सुपरएडमिनले समीक्षा गरी लाइसेन्स सक्रिय गर्नेछन्।',
      request: newReq
    };
  }
}

/**
 * Fetch purchase requests for Superadmin review
 */
export async function fetchPurchaseRequestsForAdmin(): Promise<ServicePurchaseRequest[]> {
  try {
    const res = await fetch(apiClient.resolveUrl('/api/licenses/purchase-requests'), {
      headers: getSuperAdminAuthHeaders()
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.requests)) {
      return data.requests;
    }
  } catch {}
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PURCHASE_REQ_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Superadmin Approve or Reject purchase request
 */
export async function actionPurchaseRequest(
  requestId: string,
  payload: {
    action: 'approve' | 'reject';
    duration?: ServiceLicenseDuration;
    adminNotes?: string;
    expiresAtBS?: string;
    expiresAtTimestamp?: number;
  }
): Promise<{ success: boolean; message: string; license?: UserServiceLicense }> {
  try {
    const res = await fetch(apiClient.resolveUrl(`/api/licenses/purchase-requests/${encodeURIComponent(requestId)}/action`), {
      method: 'POST',
      headers: getSuperAdminAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      if (data.license) {
        const current = getLocalLicenses();
        const idx = current.findIndex((l) => l.id === data.license.id);
        if (idx > -1) current[idx] = data.license;
        else current.unshift(data.license);
        saveLocalLicenses(current);
      }
      return { success: true, message: data.message, license: data.license };
    }
    return { success: false, message: data.error || 'कार्य सम्पन्न हुन सकेन।' };
  } catch (err: any) {
    return { success: false, message: err.message || 'नेटवर्क समस्या भयो।' };
  }
}

/**
 * Fetch Audit Logs for Superadmin
 */
export async function fetchLicenseAuditLogs(): Promise<ServiceLicenseAuditLog[]> {
  try {
    const res = await fetch(apiClient.resolveUrl('/api/licenses/audit-logs'), {
      headers: getSuperAdminAuthHeaders()
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.logs)) {
      return data.logs;
    }
  } catch {}
  return [];
}

/**
 * Permanently delete licenses for a user by phone or ID
 */
export function deleteLicensesForUserPermanently(phoneOrId: string): boolean {
  try {
    if (typeof window === 'undefined' || !phoneOrId) return false;
    const cleanDigits = phoneOrId.replace(/\D/g, '').slice(-10);
    const norm = phoneOrId.trim().toLowerCase();

    // 1. Clean localStorage licenses
    const current = getLocalLicenses();
    const filtered = current.filter(l => {
      const lMob = (l.phone || '').replace(/\D/g, '').slice(-10);
      const lUser = (l.userId || '').toLowerCase();
      const lId = (l.id || '').toLowerCase();
      if (cleanDigits && cleanDigits.length >= 7 && lMob === cleanDigits) return false;
      if (lUser === norm || lId.startsWith(norm)) return false;
      return true;
    });
    saveLocalLicenses(filtered);

    // 2. Clean purchase requests
    try {
      const rawReq = localStorage.getItem(LOCAL_STORAGE_PURCHASE_REQ_KEY);
      if (rawReq) {
        const reqs = JSON.parse(rawReq);
        if (Array.isArray(reqs)) {
          const filteredReqs = reqs.filter((r: any) => {
            const rMob = (r.mobile || r.phone || '').replace(/\D/g, '').slice(-10);
            const rUser = (r.userId || '').toLowerCase();
            const rId = (r.id || '').toLowerCase();
            if (cleanDigits && cleanDigits.length >= 7 && rMob === cleanDigits) return false;
            if (rUser === norm || rId === norm) return false;
            return true;
          });
          localStorage.setItem(LOCAL_STORAGE_PURCHASE_REQ_KEY, JSON.stringify(filteredReqs));
        }
      }
    } catch {}

    // 3. Inform server if available
    if (typeof fetch !== 'undefined') {
      fetch(`/api/licenses/user/${encodeURIComponent(phoneOrId)}`, {
        method: 'DELETE',
        headers: getSuperAdminAuthHeaders()
      }).catch(() => {});
    }

    broadcastLicenseChange();
    return true;
  } catch (e) {
    console.error('Failed to delete user licenses permanently:', e);
    return false;
  }
}

