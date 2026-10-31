/**
 * Unified User & Purchase Synchronization Service
 * 
 * Solves GitHub Pages & Static Hosting data passing:
 * 1. Synchronizes across devices (Client Mobile/Desktop & SuperAdmin) via resilient Cloud Relay
 * 2. Aggregates LocalStorage (RBAC users, Client Leads, Service Licenses, Subscriptions)
 * 3. Gracefully supports Node.js Express server (/api/users, /api/client-leads) when active
 * 4. Enables instant SuperAdmin purchase approval with real-time client license unlock
 * 5. Provides offline/manual JSON sync bridge
 */

import { RBACUser, getStoredRBACUsers, saveRBACUsers, deleteRBACUserPermanently, clearRBACSession, getActiveRBACSession } from '../db/rbacStore';
import { 
  ClientLead, 
  getStoredClientLeads, 
  saveClientLeads, 
  superAdminApprovePurchase,
  getDeviceFingerprint,
  deleteClientLeadPermanently
} from '../db/clientLeadStore';
import { isPermanentlyDeleted, addPermanentlyDeletedIdentifier } from '../db/securityBlacklist';
import { deleteLicensesForUserPermanently } from '../db/serviceLicenseStore';
import { deleteClientPolicyPermanently, registerOrUpdateClientPolicy, loadAllClientPolicies, saveAllClientPolicies, getClientPolicyByMobile } from '../db/menuControlStore';
import { convertADToBS } from '../utils/nepaliCalendar';
import { apiClient } from './apiClient';


export interface UnifiedPurchaseRequest {
  id: string;
  userId?: string;
  fullName: string;
  mobile: string;
  email?: string;
  address?: string;
  whatsapp?: string;
  planId: string;
  planNameNepali: string;
  planAmountNPR: number;
  paymentMethod: 'esewa' | 'khalti' | 'bank';
  transactionId: string;
  status: 'PURCHASE_PENDING' | 'PURCHASE_APPROVED' | 'PURCHASE_REJECTED';
  submittedAtISO: string;
  submittedAtBS: string;
  approvedAtISO?: string;
  approvedAtBS?: string;
  approvedBy?: string;
  rejectionReason?: string;
  sourceDevice?: string;
}

export interface CloudSyncPayload {
  version: number;
  lastUpdatedAtISO: string;
  users: RBACUser[];
  purchases: ClientLead[];
}

const STORAGE_KEY_CLOUD_CACHE = 'balananda_cloud_sync_cache_v2';
const STORAGE_KEY_SYNC_PENDING_QUEUE = 'balananda_sync_pending_queue_v1';
const SYNC_BROADCAST_CHANNEL = 'balananda_unified_sync_bus_v2';

// Native Backend Realtime SSE & Polling Endpoints with Cloud Relay Fallback for GitHub Pages
export const REALTIME_REGISTRY_TOPIC = 'balananda_jyotish_registry_v2083';
export const REALTIME_REGISTRY_MIRROR = 'balananda_registry_mirror_v2083';
export const REALTIME_PRESENCE_TOPIC = 'balananda_jyotish_presence_v2083';
export const REALTIME_SECURITY_TOPIC = 'balananda_jyotish_security_v2083';
export const REALTIME_LEGACY_TOPIC = 'balananda_jyotish_realtime_sync_v2081';
export const REALTIME_SYNC_TOPIC = REALTIME_REGISTRY_TOPIC;

export const isLocalhostEnvironment = () => {
  if (typeof window === 'undefined') return true;
  const host = window.location.hostname.toLowerCase();
  return host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.endsWith('.local');
};

export const getRealtimeSSEUrl = () => {
  return apiClient.resolveUrl('/api/realtime/events');
};

export const getRealtimePollUrl = () => {
  return apiClient.resolveUrl('/api/realtime/poll');
};

export const REALTIME_SSE_URL = apiClient.resolveUrl('/api/realtime/events');

export const REALTIME_PUB_URL = apiClient.resolveUrl('/api/realtime/events');

export const REALTIME_POLL_URL = apiClient.resolveUrl('/api/realtime/poll');


class UnifiedUserSyncService {
  private broadcastChannel: BroadcastChannel | null = null;
  private isSyncing = false;
  private lastSyncTime: Date = new Date();
  private clientSse: EventSource | null = null;
  private activePresenceMap = new Map<string, number>();
  private lastNetworkHeartbeatSentAt: number = 0;

  /**
   * Subscribe to unified sync updates across tabs and storage
   */
  public subscribe(listener: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    const handler = () => listener();
    window.addEventListener('unified-data-updated', handler);
    window.addEventListener('user-registered', handler);
    window.addEventListener('user-storage-updated', handler);
    window.addEventListener('client-leads-updated', handler);
    window.addEventListener('service-license-updated', handler);
    return () => {
      window.removeEventListener('unified-data-updated', handler);
      window.removeEventListener('user-registered', handler);
      window.removeEventListener('user-storage-updated', handler);
      window.removeEventListener('client-leads-updated', handler);
      window.removeEventListener('service-license-updated', handler);
    };
  }

  constructor() {
    this.initPresenceMap();

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(SYNC_BROADCAST_CHANNEL);
        this.broadcastChannel.onmessage = (ev) => {
          if (ev.data?.type === 'SYNC_DATA_UPDATED') {
            window.dispatchEvent(new CustomEvent('unified-data-updated'));
          } else if (ev.data?.type === 'USER_HEARTBEAT') {
            this.recordPresence(ev.data.phone || ev.data.userId, ev.data.timestamp || Date.now());
            window.dispatchEvent(new CustomEvent('user-presence-updated', { detail: ev.data }));
          } else if (ev.data?.type === 'FORCE_SIGNOUT' || ev.data?.type === 'USER_DELETED') {
            const activeSessionRaw = localStorage.getItem('balananda_rbac_session_v2') || localStorage.getItem('balananda_rbac_active_session_v1');
            if (activeSessionRaw) {
              try {
                const sess = JSON.parse(activeSessionRaw);
                if (sess && sess.role !== 'SUPER_ADMIN') {
                  const sessMob = (sess?.phone || sess?.username || '').replace(/\D/g, '').slice(-10);
                  const sessId = (sess?.userId || sess?.id || '').toLowerCase();
                  const sessUsername = (sess?.username || '').toLowerCase();

                  const targets: string[] = [
                    ev.data.phone,
                    ev.data.mobile,
                    ev.data.userId,
                    ev.data.id,
                    ev.data.leadId,
                    ...(ev.data.targetIdentifiers || [])
                  ].filter(Boolean);

                  const isMatch = targets.some(t => {
                    const tLower = t.toLowerCase();
                    const tDigits = t.replace(/\D/g, '').slice(-10);
                    return (
                      tLower === sessId ||
                      tLower === sessUsername ||
                      (sessMob && (tLower === sessMob || tDigits === sessMob))
                    );
                  }) || ev.data.mobile === 'ALL_DATA_RESET' || ev.data.targetIdentifiers?.includes('ALL');

                  if (isMatch) {
                    this.forceClientSignout('deleted', ev.data.reason || 'सुरक्षा सूचना: तपाईंको खाता प्रणालीबाट हटाइएको छ। तपाईं पाहुना (Visitor) मोडमा फर्किनुभएको छ।');
                  }
                }
              } catch {}
            }
          }
        };
      } catch {}
    }

    // Auto sync on page load, window focus, online status, and cross-window storage events
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        this.syncAllData(true);
        this.validateActiveSessionLiveness();
      });
      window.addEventListener('online', () => {
        this.syncAllData(true);
        this.validateActiveSessionLiveness();
      });
      window.addEventListener('storage', (ev) => {
        if (
          ev.key?.startsWith('balananda_rbac_users') ||
          ev.key?.startsWith('balananda_client_leads') ||
          ev.key?.startsWith('balananda_service_licenses') ||
          ev.key?.startsWith('balananda_security_blacklist')
        ) {
          window.dispatchEvent(new CustomEvent('unified-data-updated'));
          this.validateActiveSessionLiveness();
        }
      });

      // Global window event for newly signed up users across any component
      window.addEventListener('balananda_user_signed_up', (ev: any) => {
        if (ev.detail) {
          this.recordUserSignup(ev.detail);
        }
      });

      // Immediate & recurring session security verification (every 1 second)
      this.validateActiveSessionLiveness();
      setInterval(() => {
        this.validateActiveSessionLiveness();
      }, 1000);

      // Initialize client-side SSE for instant approval & security revoke listening
      this.initClientSSEListener();
    }
  }

  public getLastSyncTime(): Date {
    return this.lastSyncTime;
  }

  /**
   * Real-Time User Presence Engine
   */
  private initPresenceMap(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('balananda_presence_cache_v1');
      if (raw) {
        const obj = JSON.parse(raw);
        const now = Date.now();
        Object.entries(obj).forEach(([k, ts]) => {
          if (typeof ts === 'number' && (now - ts) < 3600000) {
            this.activePresenceMap.set(k, ts);
          }
        });
      }
    } catch {}
  }

  private persistPresenceMap(): void {
    if (typeof window === 'undefined') return;
    try {
      const obj: Record<string, number> = {};
      const now = Date.now();
      this.activePresenceMap.forEach((ts, k) => {
        if (now - ts < 3600000) {
          obj[k] = ts;
        }
      });
      localStorage.setItem('balananda_presence_cache_v1', JSON.stringify(obj));
    } catch {}
  }

  public recordPresence(phoneOrId?: string, timestamp = Date.now()): void {
    if (!phoneOrId) return;
    const norm = this.normalizePhoneOrId(phoneOrId);
    const cleanDigits = phoneOrId.replace(/\D/g, '').slice(-10);
    if (norm) this.activePresenceMap.set(norm, timestamp);
    if (cleanDigits) this.activePresenceMap.set(cleanDigits, timestamp);
    this.activePresenceMap.set(phoneOrId.trim().toLowerCase(), timestamp);
    this.persistPresenceMap();
  }

  public async sendUserHeartbeat(session?: any): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const activeSession = session || getActiveRBACSession();
      if (!activeSession) return;
      const userId = activeSession.userId || activeSession.id || '';
      const phone = activeSession.phone || activeSession.username || '';
      const fullName = activeSession.fullName || '';
      const role = activeSession.role || 'CUSTOMER';
      const now = Date.now();

      // 1. Immediately record presence locally
      this.recordPresence(phone || userId, now);

      const payload = {
        type: 'USER_HEARTBEAT',
        userId,
        phone,
        fullName,
        role,
        timestamp: now
      };

      // 2. BroadcastChannel to all tabs on this machine (0ms latency)
      try {
        this.broadcastChannel?.postMessage(payload);
      } catch {}

      // 3. Network Throttle: Max 1 network heartbeat per 60 seconds (prevents relay rate limits)
      if (now - this.lastNetworkHeartbeatSentAt < 60000) {
        return;
      }
      this.lastNetworkHeartbeatSentAt = now;

      // 4. Send lightweight presence ping to dedicated PRESENCE topic
      if (!isLocalhostEnvironment()) {
        try {
          const controller = new AbortController();
          const tid = setTimeout(() => controller.abort(), 2500);
          fetch(`https://ntfy.sh/${REALTIME_PRESENCE_TOPIC}`, {
            method: 'POST',
            headers: {
              'Title': `Heartbeat: ${phone || userId}`,
              'Priority': '1',
              'Tags': 'green_heart'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
          }).catch(() => {}).finally(() => clearTimeout(tid));
        } catch {}
      } else {
        // If localhost, send to local Node backend
        apiClient.post('/api/realtime/events', payload).catch(() => {});
      }
    } catch {}
  }

  public isUserOnline(phoneOrId?: string): boolean {
    if (!phoneOrId) return false;
    const norm = this.normalizePhoneOrId(phoneOrId);
    const cleanDigits = phoneOrId.replace(/\D/g, '').slice(-10);
    const now = Date.now();

    // Check active session on this device
    try {
      if (typeof window !== 'undefined') {
        const activeSessionRaw = localStorage.getItem('balananda_rbac_session_v2') || localStorage.getItem('balananda_rbac_active_session_v1');
        if (activeSessionRaw) {
          const sess = JSON.parse(activeSessionRaw);
          const sessMob = this.normalizePhoneOrId(sess?.phone || sess?.username);
          const sessId = (sess?.userId || sess?.id || '').toLowerCase();
          if ((norm && (sessMob === norm || sessId === norm)) || (cleanDigits && sessMob === cleanDigits)) {
            return true;
          }
        }
      }
    } catch {}

    const t1 = norm ? this.activePresenceMap.get(norm) : undefined;
    const t2 = cleanDigits ? this.activePresenceMap.get(cleanDigits) : undefined;
    const t3 = this.activePresenceMap.get(phoneOrId.trim().toLowerCase());
    const latest = Math.max(t1 || 0, t2 || 0, t3 || 0);

    return latest > 0 && (now - latest) <= 65000;
  }

  public getUserPresenceStatus(phoneOrId?: string): {
    isOnline: boolean;
    isRecent: boolean;
    lastSeenText: string;
    lastSeenTimestamp: number;
  } {
    if (!phoneOrId) return { isOnline: false, isRecent: false, lastSeenText: 'अफलाइन', lastSeenTimestamp: 0 };
    const norm = this.normalizePhoneOrId(phoneOrId);
    const cleanDigits = phoneOrId.replace(/\D/g, '').slice(-10);
    const now = Date.now();

    let isCurrentDevice = false;
    try {
      if (typeof window !== 'undefined') {
        const activeSessionRaw = localStorage.getItem('balananda_rbac_session_v2') || localStorage.getItem('balananda_rbac_active_session_v1');
        if (activeSessionRaw) {
          const sess = JSON.parse(activeSessionRaw);
          const sessMob = this.normalizePhoneOrId(sess?.phone || sess?.username);
          const sessId = (sess?.userId || sess?.id || '').toLowerCase();
          if ((norm && (sessMob === norm || sessId === norm)) || (cleanDigits && sessMob === cleanDigits)) {
            isCurrentDevice = true;
          }
        }
      }
    } catch {}

    const t1 = norm ? this.activePresenceMap.get(norm) : undefined;
    const t2 = cleanDigits ? this.activePresenceMap.get(cleanDigits) : undefined;
    const t3 = this.activePresenceMap.get(phoneOrId.trim().toLowerCase());
    let latest = Math.max(t1 || 0, t2 || 0, t3 || 0);

    if (isCurrentDevice) {
      latest = now;
      this.recordPresence(phoneOrId, now);
    }

    if (latest === 0) {
      return { isOnline: false, isRecent: false, lastSeenText: 'अफलाइन', lastSeenTimestamp: 0 };
    }

    const diffSeconds = Math.floor((now - latest) / 1000);
    if (diffSeconds <= 65) {
      return { isOnline: true, isRecent: false, lastSeenText: 'हाल अनलाइन', lastSeenTimestamp: latest };
    } else if (diffSeconds < 300) {
      const mins = Math.max(1, Math.floor(diffSeconds / 60));
      return { isOnline: false, isRecent: true, lastSeenText: `${mins} मिनेट अघि`, lastSeenTimestamp: latest };
    } else if (diffSeconds < 3600) {
      const mins = Math.floor(diffSeconds / 60);
      return { isOnline: false, isRecent: false, lastSeenText: `${mins} मिनेट अघि`, lastSeenTimestamp: latest };
    } else if (diffSeconds < 86400) {
      const hrs = Math.floor(diffSeconds / 3600);
      return { isOnline: false, isRecent: false, lastSeenText: `${hrs} घण्टा अघि`, lastSeenTimestamp: latest };
    } else {
      return { isOnline: false, isRecent: false, lastSeenText: 'धेरै पहिले', lastSeenTimestamp: latest };
    }
  }

  public getOnlineUsersCount(): number {
    const registered = this.getRegisteredUsers();
    let count = 0;
    for (const u of registered) {
      if (this.isUserOnline(u.phone || u.id)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Immediately terminates active user session across the client device (< 1 millisecond)
   * Downgrades client instantly to normal visitor mode (Guest Mode)
   */
  public forceClientSignout(action: 'deleted' | 'suspended' | 'inactive' | 'disabled' | string, reason?: string): void {
    if (typeof window === 'undefined') return;
    try {
      // 1. Clear session keys
      clearRBACSession();
      localStorage.removeItem('balananda_rbac_session_v2');
      localStorage.removeItem('balananda_rbac_active_session_v1');
      localStorage.removeItem('sukdev_user_subscription_account_v1');
      localStorage.removeItem('balananda_active_profile_id');
      localStorage.removeItem('balananda_user_birth_profile_user_self');
      localStorage.removeItem('balananda_user_birth_profile_client_self');

      // 2. Clear full software access licenses for this device
      localStorage.removeItem('balananda_approved_client_license_v2');
      localStorage.removeItem('software_full_access_unlocked_v1');
      localStorage.removeItem('balananda_software_full_access_license_v2');

      // 3. Dispatch global events for instant UI transition to normal visitor (< 1ms)
      window.dispatchEvent(new CustomEvent('software-full-access-updated', { detail: { hasFullAccess: false } }));
      window.dispatchEvent(new CustomEvent('rbac-session-changed', { detail: null }));

      let message = 'सुरक्षा सूचना: तपाईंको खाता सामान्य पाहुना (Visitor) मोडमा लगिएको छ।';
      if (action === 'deleted') {
        message = 'सुरक्षा सूचना: तपाईंको खाता प्रणालीबाट हटाइएको छ। तपाईं पाहुना (Visitor) मोडमा फर्किनुभएको छ।';
      } else if (action === 'suspended') {
        message = 'सुरक्षा सूचना: तपाईंको खाता सुपरएडमिन द्वारा निलम्बन (Lock) गरिएको छ। तपाईं पाहुना (Visitor) मोडमा हुनुहुन्छ।';
      } else if (action === 'inactive' || action === 'disabled') {
        message = 'सुरक्षा सूचना: तपाईंको खाता निष्क्रिय (De-activated) गरिएको छ। तपाईं पाहुना (Visitor) मोडमा हुनुहुन्छ।';
      }

      window.dispatchEvent(new CustomEvent('user-force-logout', {
        detail: {
          action,
          reason: reason || message,
          timestamp: Date.now()
        }
      }));
    } catch (e) {
      console.warn('Error executing force client signout:', e);
    }
  }

  /**
   * Periodic security session validator
   * Verifies that the currently logged-in account is not blacklisted, deleted, locked, or deactivated
   */
  public validateActiveSessionLiveness(): boolean {
    if (typeof window === 'undefined') return true;
    try {
      const activeSessionRaw = localStorage.getItem('balananda_rbac_session_v2') || localStorage.getItem('balananda_rbac_active_session_v1');
      if (!activeSessionRaw) return true;

      const sess = JSON.parse(activeSessionRaw);
      if (!sess) return true;

      // SuperAdmin portal session is exempt from user-level revocation
      if (sess.role === 'SUPER_ADMIN') return true;

      const sessMob = (sess?.phone || sess?.username || '').replace(/\D/g, '').slice(-10);
      const sessId = (sess?.userId || sess?.id || '').toLowerCase();
      const sessUsername = (sess?.username || '').toLowerCase();

      // 1. Check blacklist
      if (
        (sessMob && isPermanentlyDeleted(sessMob)) ||
        (sessId && isPermanentlyDeleted(sessId)) ||
        (sess.phone && isPermanentlyDeleted(sess.phone)) ||
        (sess.username && isPermanentlyDeleted(sess.username))
      ) {
        this.forceClientSignout('deleted', 'सुरक्षा सूचना: तपाईंको खाता प्रणालीबाट हटाइएको छ। तपाईं पाहुना (Visitor) मोडमा फर्किनुभएको छ।');
        return false;
      }

      // 2. Check RBAC Users in memory
      const rbacUsers = getStoredRBACUsers();
      const dbUser = rbacUsers.find(u => 
        (u.id && u.id.toLowerCase() === sessId) ||
        (u.phone && (u.phone.replace(/\D/g, '').slice(-10) === sessMob || u.phone.toLowerCase() === sessUsername)) ||
        (u.username && u.username.toLowerCase() === sessUsername)
      );

      // If user was deleted from RBAC Store, check if a registered lead exists:
      if (!dbUser) {
        const clientLeads = getStoredClientLeads();
        const leadUser = clientLeads.find(l => 
          (l.id && l.id.toLowerCase() === sessId) ||
          (l.mobile && l.mobile.replace(/\D/g, '').slice(-10) === sessMob)
        );

        if (!leadUser) {
          // User was permanently removed by SuperAdmin! Force logout immediately (< 1ms)
          this.forceClientSignout('deleted', 'सुरक्षा सूचना: तपाईंको खाता प्रणालीबाट हटाइएको छ। तपाईं पाहुना (Visitor) मोडमा फर्किनुभएको छ।');
          return false;
        }
      } else {
        if (dbUser.status === 'suspended' || dbUser.status === 'inactive' || dbUser.status === 'disabled') {
          const defaultMsg = dbUser.status === 'suspended'
            ? 'सुरक्षा सूचना: तपाईंको खाता सुपरएडमिन द्वारा निलम्बन (Lock) गरिएको छ। तपाईं पाहुना (Visitor) मोडमा हुनुहुन्छ।'
            : 'सुरक्षा सूचना: तपाईंको खाता निष्क्रिय (De-activated) गरिएको छ। तपाईं पाहुना (Visitor) मोडमा हुनुहुन्छ।';
          this.forceClientSignout(dbUser.status, dbUser.statusReason || defaultMsg);
          return false;
        }
      }

      // 3. Check Menu Control Policy
      const clientPolicy = getClientPolicyByMobile(sessMob || sessId);
      if (clientPolicy && clientPolicy.status === 'suspended') {
        this.forceClientSignout('suspended', 'सुरक्षा सूचना: तपाईंको खाता सुपरएडमिन द्वारा निलम्बन (Lock) गरिएको छ।');
        return false;
      }

      return true;
    } catch {
      return true;
    }
  }

  /**
   * Broadcast local update event across components and tabs
   */
  private notifyListeners() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('unified-data-updated'));
      window.dispatchEvent(new CustomEvent('user-storage-updated'));
      window.dispatchEvent(new CustomEvent('client-leads-updated'));
      try {
        this.broadcastChannel?.postMessage({ type: 'SYNC_DATA_UPDATED', timestamp: Date.now() });
      } catch {}
    }
  }

  /**
   * Client-side Realtime SSE listener for instant license unlock and security revocation
   */
  private initClientSSEListener() {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;
    try {
      if (this.clientSse) {
        this.clientSse.close();
      }
      const sseUrl = getRealtimeSSEUrl();
      this.clientSse = new EventSource(sseUrl);
      this.clientSse.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          const messageText = raw.message || raw;
          const root = typeof messageText === 'string' ? JSON.parse(messageText) : messageText;

          if (!root || !root.type) return;

          const payload = root.payload || {};
          const eventType = root.type;
          const mobile = root.mobile || payload.mobile || payload.membership?.phone || payload.lead?.mobile || payload.user?.phone || payload.user?.username || '';
          const leadId = root.leadId || payload.leadId || payload.lead?.id || payload.membership?.id || '';
          const userId = root.userId || payload.userId || payload.user?.id || payload.membership?.userId || '';
          const lead = root.lead || payload.lead;
          const user = root.user || payload.user;

          if (eventType === 'USER_HEARTBEAT') {
            this.recordPresence(mobile || userId, root.timestamp || Date.now());
          } else if (
            eventType === 'LICENSE_APPROVED' ||
            eventType === 'PURCHASE_APPROVED' ||
            eventType === 'MEMBERSHIP_ACTIVATED' ||
            eventType === 'MEMBERSHIP_APPROVED' ||
            eventType === 'USER_SERVICES_UPDATED' ||
            eventType === 'SERVICE_LICENSE_UPDATED' ||
            eventType === 'MEMBERSHIP_STATUS_MUTATED' ||
            eventType === 'USER_UPDATED' ||
            eventType === 'USER_PROFILE_UPDATED'
          ) {
            const norm = this.normalizePhoneOrId(mobile);
            const activeSessionRaw = localStorage.getItem('balananda_rbac_session_v2') || localStorage.getItem('balananda_rbac_active_session_v1');
            let isCurrent = false;
            if (activeSessionRaw) {
              const sess = JSON.parse(activeSessionRaw);
              const sessMob = this.normalizePhoneOrId(sess?.phone || sess?.username);
              const sessId = (sess?.userId || sess?.id || '').toLowerCase();
              if (sessMob && (sessMob === norm || (userId && sessId === userId.toLowerCase()))) {
                isCurrent = true;
              }
            }

            // Check if this device has leads matching the approved mobile or leadId
            const storedLeads = getStoredClientLeads();
            const matchedLead = storedLeads.find(l => (norm && this.normalizePhoneOrId(l.mobile) === norm) || (leadId && l.id === leadId));
            if (matchedLead) isCurrent = true;

            // Check device trial record
            try {
              const trialRecordRaw = localStorage.getItem('balananda_device_trial_lock_v2');
              if (trialRecordRaw) {
                const tr = JSON.parse(trialRecordRaw);
                if (norm && this.normalizePhoneOrId(tr.leadMobile) === norm) isCurrent = true;
              }
            } catch {}

            if (isCurrent || !activeSessionRaw) {
              this.checkAndApplyClientApproval(mobile || leadId);
              // Trigger authoritative session sync to instantly reflect unlock in UI
              import('./authService').then(({ authService }) => {
                authService.syncUserSessionFromServer().catch(() => {});
              }).catch(() => {});
            }

            // Instant UI events dispatch
            this.notifyListeners();
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('software-full-access-updated', { detail: { hasFullAccess: true } }));
              window.dispatchEvent(new CustomEvent('service-license-updated', { detail: { mobile, leadId, userId, payload } }));
              window.dispatchEvent(new CustomEvent('subscription-status-updated', { detail: { mobile, leadId, userId, payload } }));
            }
          } else if (eventType === 'PURCHASE_REQUEST' && lead) {
            // Instant real-time delivery to SuperAdmin (< 1 sec)
            const lead = parsed.lead;
            if (!isPermanentlyDeleted(lead.mobile) && !isPermanentlyDeleted(lead.id)) {
              this.recordPresence(lead.mobile || lead.id, Date.now());
              const localLeads = getStoredClientLeads();
              const idx = localLeads.findIndex(l => l.id === lead.id || (l.transactionId && l.transactionId === lead.transactionId));
              if (idx >= 0) {
                localLeads[idx] = lead;
              } else {
                localLeads.unshift(lead);
              }
              saveClientLeads(localLeads);
              this.notifyListeners();
            }
          } else if (parsed.type === 'USER_SIGNUP' && parsed.user) {
            const u = parsed.user;
            if (!isPermanentlyDeleted(u.phone) && !isPermanentlyDeleted(u.id)) {
              this.recordPresence(u.phone || u.id, Date.now());
              const localUsers = getStoredRBACUsers();
              const k = this.normalizePhoneOrId(u.phone || u.id);
              if (!localUsers.some(ex => this.normalizePhoneOrId(ex.phone || ex.id) === k)) {
                saveRBACUsers([u, ...localUsers]);
                this.notifyListeners();
              }
              // Also ensure registered lead exists
              const localLeads = getStoredClientLeads();
              if (!localLeads.some(l => this.normalizePhoneOrId(l.mobile) === k)) {
                const newLead: ClientLead = {
                  id: `LEAD-REG-${u.id || Date.now()}`,
                  fullName: u.fullName,
                  address: u.savedAddresses?.[0]?.streetAddress || 'काठमाडौँ',
                  mobile: u.phone,
                  email: u.email || '',
                  whatsapp: u.phone,
                  deviceFingerprint: getDeviceFingerprint(),
                  status: 'REGISTERED_USER',
                  submittedAtISO: u.createdAtISO || new Date().toISOString(),
                  submittedAtBS: u.createdAtBS || '२०८१'
                };
                saveClientLeads([newLead, ...localLeads]);
                this.notifyListeners();
              }
            }
          } else if (parsed.type === 'USER_DELETED' || parsed.type === 'USER_FORCE_SIGNOUT') {
            // Security revoke: Immediately delete locally and force signout if active
            const targets: string[] = [
              parsed.mobile,
              parsed.phone,
              parsed.userId,
              parsed.id,
              parsed.leadId,
              ...(parsed.targetIdentifiers || [])
            ].filter(Boolean);

            targets.forEach(t => addPermanentlyDeletedIdentifier(t));

            const activeSessionRaw = localStorage.getItem('balananda_rbac_session_v2') || localStorage.getItem('balananda_rbac_active_session_v1');
            if (activeSessionRaw) {
              try {
                const sess = JSON.parse(activeSessionRaw);
                if (sess && sess.role !== 'SUPER_ADMIN') {
                  const sessMob = (sess?.phone || sess?.username || '').replace(/\D/g, '').slice(-10);
                  const sessId = (sess?.userId || sess?.id || '').toLowerCase();
                  const sessUsername = (sess?.username || '').toLowerCase();

                  const isMatch = targets.some(t => {
                    const tLower = t.toLowerCase();
                    const tDigits = t.replace(/\D/g, '').slice(-10);
                    return (
                      tLower === sessId ||
                      tLower === sessUsername ||
                      (sessMob && (tLower === sessMob || tDigits === sessMob))
                    );
                  }) || parsed.mobile === 'ALL_DATA_RESET' || parsed.targetIdentifiers?.includes('ALL');

                  if (isMatch) {
                    this.forceClientSignout('deleted', parsed.reason || 'सुरक्षा सूचना: तपाईंको खाता प्रणालीबाट हटाइएको छ। तपाईं पाहुना (Visitor) मोडमा फर्किनुभएको छ।');
                  }
                }
              } catch {}
            }
            this.notifyListeners();
          } else if (parsed.type === 'USER_STATUS_CHANGED') {
            // Security revoke: If status is suspended or inactive, force immediate client signout
            const status = parsed.userStatus || parsed.status;
            const normTarget = this.normalizePhoneOrId(parsed.mobile || parsed.phone || parsed.userId);
            const targetId = (parsed.userId || parsed.id || '').toLowerCase();

            if (status === 'suspended' || status === 'inactive' || status === 'disabled') {
              const activeSessionRaw = localStorage.getItem('balananda_rbac_session_v2') || localStorage.getItem('balananda_rbac_active_session_v1');
              if (activeSessionRaw) {
                try {
                  const sess = JSON.parse(activeSessionRaw);
                  const sessMob = (sess?.phone || sess?.username || '').replace(/\D/g, '').slice(-10);
                  const sessId = (sess?.userId || sess?.id || '').toLowerCase();
                  const sessUsername = (sess?.username || '').toLowerCase();
                  const isMatch = (normTarget && (sessMob === normTarget || sessId === normTarget || sessUsername === normTarget)) ||
                                  (targetId && (sessId === targetId || sessMob === targetId || sessUsername === targetId));
                  if (isMatch) {
                    const defaultMsg = status === 'suspended'
                      ? 'सुरक्षा सूचना: तपाईंको खाता सुपरएडमिन द्वारा निलम्बन (Lock) गरिएको छ। तपाईं पाहुना (Visitor) मोडमा हुनुहुन्छ।'
                      : 'सुरक्षा सूचना: तपाईंको खाता निष्क्रिय (De-activated) गरिएको छ। तपाईं पाहुना (Visitor) मोडमा हुनुहुन्छ।';
                    this.forceClientSignout(status, parsed.details || parsed.reason || defaultMsg);
                  }
                } catch {}
              }
            }
            this.notifyListeners();
          } else if (parsed.type === 'SYSTEM_RESET') {
            this.notifyListeners();
          }
        } catch {}
      };

      this.clientSse.onerror = () => {
        // Handled by browser auto-reconnect
      };
    } catch (e) {
      console.warn('[RealtimeSync] Client SSE init failed:', e);
    }
  }

  /**
   * Instantly broadcast an event across all local tabs, devices, and cloud relay (< 1 second)
   */
  public async pushEventToRealtimeRelay(event: {
    type: 'USER_SIGNUP' | 'USER_UPDATE' | 'PURCHASE_REQUEST' | 'LICENSE_APPROVED' | 'PURCHASE_APPROVED' | 'USER_DELETED' | 'USER_STATUS_CHANGED' | string;
    user?: any;
    lead?: any;
    mobile?: string;
    userId?: string;
    userStatus?: string;
    leadId?: string;
    details?: string;
    targetIdentifiers?: string[];
    action?: string;
    reason?: string;
  }): Promise<void> {
    // Enterprise Security: Strip password fields from transit payload
    const safeEvent = { ...event };
    if (safeEvent.user) {
      safeEvent.user = { ...safeEvent.user };
      delete safeEvent.user.passwordHash;
      delete safeEvent.user.passwordPlain;
    }

    const payloadObj = {
      ...safeEvent,
      timestamp: Date.now(),
      iso: new Date().toISOString()
    };

    // 1. BroadcastChannel (for other tabs on the same browser - 0ms latency)
    try {
      this.broadcastChannel?.postMessage(payloadObj);
    } catch (e) {
      console.warn('[RealtimeSync] Broadcast failed:', e);
    }

    // 2. Authoritative backend event bus (both local and deployed Render)
    try {
      apiClient.post('/api/realtime/events', payloadObj).catch(() => {});
    } catch {}

    // 3. Resilient Sharded Cloud Relay (ntfy.sh with mirror fallback)
    try {
      const isSecurityEvent = event.type === 'USER_FORCE_SIGNOUT' || event.type === 'USER_DELETED' || event.type === 'USER_STATUS_CHANGED';
      const isRegistryEvent = event.type === 'USER_SIGNUP' || event.type === 'USER_UPDATE' || event.type === 'PURCHASE_REQUEST';
      const targetTopic = isSecurityEvent
        ? REALTIME_SECURITY_TOPIC
        : (isRegistryEvent ? REALTIME_REGISTRY_TOPIC : REALTIME_SYNC_TOPIC);

      const asciiTitle = event.type === 'USER_SIGNUP'
        ? `New User Registration: ${(safeEvent.user?.phone || safeEvent.user?.id || 'User')}`
        : event.type === 'PURCHASE_REQUEST'
        ? `New Purchase Request: ${(safeEvent.lead?.mobile || safeEvent.lead?.id || 'Lead')}`
        : event.type === 'LICENSE_APPROVED' || event.type === 'PURCHASE_APPROVED'
        ? `License Approved: ${(event.mobile || event.leadId || '')}`
        : isSecurityEvent
        ? `Security Revocation: ${(event.mobile || event.userId || '')}`
        : `Sync Event: ${event.type}`;

      const tags = event.type === 'USER_SIGNUP'
        ? 'bust_in_silhouette,sparkles'
        : event.type === 'PURCHASE_REQUEST'
        ? 'bell,white_check_mark'
        : 'lock,shield';

      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 3500);

      // Push to primary topic
      fetch(`https://ntfy.sh/${targetTopic}`, {
        method: 'POST',
        headers: {
          'Title': asciiTitle,
          'Priority': isSecurityEvent ? '5' : '4',
          'Tags': tags
        },
        body: JSON.stringify(payloadObj),
        signal: controller.signal
      }).catch(err => {
        console.warn('[RealtimeSync] Primary cloud push warning:', err);
      }).finally(() => clearTimeout(tid));

      // For registration and security events, mirror to secondary topic for redundancy
      if (isRegistryEvent || isSecurityEvent) {
        const mirrorTopic = isSecurityEvent ? `${REALTIME_SECURITY_TOPIC}_m` : REALTIME_REGISTRY_MIRROR;
        const mirrorController = new AbortController();
        const mirrorTid = setTimeout(() => mirrorController.abort(), 3500);
        fetch(`https://ntfy.sh/${mirrorTopic}`, {
          method: 'POST',
          headers: {
            'Title': asciiTitle,
            'Priority': isSecurityEvent ? '5' : '4',
            'Tags': tags
          },
          body: JSON.stringify(payloadObj),
          signal: mirrorController.signal
        }).catch(() => {}).finally(() => clearTimeout(mirrorTid));
      }
    } catch (err) {
      console.warn('[RealtimeSync] Cloud relay error:', err);
    }
  }

  /**
   * Get all registered users (combines local RBAC store, client leads with REGISTERED_USER, and cached cloud users)
   */
  public getRegisteredUsers(): RBACUser[] {
    const localRbac = getStoredRBACUsers();
    const leads = getStoredClientLeads();
    const cloudCache = this.getCloudCache();

    const userMap = new Map<string, RBACUser>();

    // 1. Add cloud cached users
    if (cloudCache?.users) {
      cloudCache.users.forEach(u => {
        if (isPermanentlyDeleted(u.phone) || isPermanentlyDeleted(u.id) || isPermanentlyDeleted(u.username)) return;
        const key = this.normalizePhoneOrId(u.phone || u.id);
        if (key && !isPermanentlyDeleted(key)) userMap.set(key, u);
      });
    }

    // 2. Add local RBAC users
    localRbac.forEach(u => {
      if (isPermanentlyDeleted(u.phone) || isPermanentlyDeleted(u.id) || isPermanentlyDeleted(u.username)) return;
      const key = this.normalizePhoneOrId(u.phone || u.id);
      if (key && !isPermanentlyDeleted(key)) userMap.set(key, u);
    });

    // 3. Add client leads who signed up or used trial
    leads.forEach(l => {
      if (isPermanentlyDeleted(l.mobile) || isPermanentlyDeleted(l.id)) return;
      const key = this.normalizePhoneOrId(l.mobile || l.id);
      if (key && !isPermanentlyDeleted(key) && !userMap.has(key)) {
        userMap.set(key, {
          id: l.id.startsWith('usr_') ? l.id : `usr_lead_${l.id}`,
          username: l.mobile,
          phone: l.mobile,
          email: l.email || undefined,
          fullName: l.fullName,
          passwordHash: 'client_registered',
          role: 'CUSTOMER',
          roleNameNepali: 'यजमान / ग्राहक',
          status: 'active',
          customerId: `ग्राहक-${l.mobile.slice(-4)}`,
          permissions: ['kundali.view', 'kundali.create', 'panchanga.view', 'reports.view'],
          createdAtISO: l.submittedAtISO || new Date().toISOString(),
          createdAtBS: l.submittedAtBS || '२०८१',
          mobileVerified: true,
          emailVerified: Boolean(l.email)
        });
      }
    });

    return Array.from(userMap.values())
      .filter(u => !isPermanentlyDeleted(u.phone) && !isPermanentlyDeleted(u.id) && !isPermanentlyDeleted(u.username))
      .sort((a, b) => 
        new Date(b.createdAtISO || 0).getTime() - new Date(a.createdAtISO || 0).getTime()
      );
  }

  /**
   * Get all purchased users / purchase applications
   */
  public getPurchasedUsers(): ClientLead[] {
    const localLeads = getStoredClientLeads();
    const cloudCache = this.getCloudCache();

    const leadMap = new Map<string, ClientLead>();

    // 1. Cloud cached purchases
    if (cloudCache?.purchases) {
      cloudCache.purchases.forEach(p => {
        if (isPermanentlyDeleted(p.mobile) || isPermanentlyDeleted(p.id)) return;
        if (this.isPurchaseRecord(p)) {
          leadMap.set(p.id, p);
        }
      });
    }

    // 2. Local leads
    localLeads.forEach(l => {
      if (isPermanentlyDeleted(l.mobile) || isPermanentlyDeleted(l.id)) return;
      if (this.isPurchaseRecord(l)) {
        leadMap.set(l.id, l);
      }
    });

    // 3. Also check service purchase requests from balananda_my_purchase_requests_v1
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('balananda_my_purchase_requests_v1');
        if (raw) {
          const reqs = JSON.parse(raw);
          if (Array.isArray(reqs)) {
            reqs.forEach((r: any) => {
              if (r && r.id && !leadMap.has(r.id)) {
                if (isPermanentlyDeleted(r.phone) || isPermanentlyDeleted(r.userId) || isPermanentlyDeleted(r.id)) return;
                leadMap.set(r.id, {
                  id: r.id,
                  fullName: r.userName || r.clientName || 'ग्राहक',
                  address: r.address || 'काठमाडौँ',
                  mobile: r.phone || r.userId || '',
                  email: r.email || '',
                  whatsapp: r.whatsapp || r.phone || '',
                  deviceFingerprint: getDeviceFingerprint(),
                  status: r.requestStatus === 'approved' ? 'PURCHASE_APPROVED' : (r.requestStatus === 'rejected' ? 'PURCHASE_REJECTED' : 'PURCHASE_PENDING'),
                  planId: (r.serviceKey === 'vastu' ? 'yearly_desktop' : 'yearly_both') as any,
                  planNameNepali: r.serviceNameNepali || (r.serviceKey === 'vastu' ? 'वास्तु सेवा' : 'ज्योतिष सेवा'),
                  planAmountNPR: r.amountNPR || 2100,
                  paymentMethod: (r.paymentMethodKey || 'esewa') as any,
                  transactionId: r.transactionCode || r.transactionId || 'ONLINE-TXN',
                  submittedAtISO: r.requestedAtISO || new Date().toISOString(),
                  submittedAtBS: r.requestedAtBS || '२०८१',
                  approvedAtISO: r.actionedAtISO,
                  approvedAtBS: r.actionedAtBS,
                  approvedBy: r.actionedBy
                });
              }
            });
          }
        }
      }
    } catch {}

    return Array.from(leadMap.values())
      .filter(p => !isPermanentlyDeleted(p.mobile) && !isPermanentlyDeleted(p.id))
      .sort((a, b) => 
        new Date(b.submittedAtISO || 0).getTime() - new Date(a.submittedAtISO || 0).getTime()
      );
  }

  /**
   * Permanently delete a user or purchase lead across all stores, caches, and servers
   */
  public deleteUserPermanently(phoneOrId: string, secondaryIdentifier?: string, optionalFullName?: string): boolean {
    if (!phoneOrId) return false;

    // 1. Construct exhaustive target list
    const targetIdentifiers: string[] = [];
    const addTarget = (val?: string) => {
      if (!val) return;
      const trimmed = val.trim();
      if (!trimmed) return;
      targetIdentifiers.push(trimmed);
      targetIdentifiers.push(trimmed.toLowerCase());
      const digits = trimmed.replace(/\D/g, '');
      if (digits.length >= 7) {
        targetIdentifiers.push(digits);
        targetIdentifiers.push(digits.slice(-10));
      }
    };
    addTarget(phoneOrId);
    addTarget(secondaryIdentifier);
    if (optionalFullName) {
      addTarget(optionalFullName);
    }
    const uniqueTargets = Array.from(new Set(targetIdentifiers));

    // 2. Blacklist all identifiers permanently
    uniqueTargets.forEach(t => addPermanentlyDeletedIdentifier(t));

    // 3. Remove from RBAC Store, Leads, Licenses, Policies
    uniqueTargets.forEach(t => {
      deleteRBACUserPermanently(t);
      deleteClientLeadPermanently(t);
      deleteLicensesForUserPermanently(t);
      deleteClientPolicyPermanently(t);
    });

    // 4. Remove any user-specific profile storage
    if (typeof window !== 'undefined') {
      try {
        uniqueTargets.forEach(t => {
          localStorage.removeItem(`balananda_user_birth_profile_${t}`);
        });
      } catch {}
    }

    // 5. Clean localStorage Cloud Cache & purchase requests
    try {
      if (typeof window !== 'undefined') {
        const cache = this.getCloudCache();
        if (cache) {
          if (Array.isArray(cache.users)) {
            cache.users = cache.users.filter(u => {
              const uMob = (u.phone || '').replace(/\D/g, '').slice(-10);
              const uId = (u.id || '').toLowerCase();
              const uUser = (u.username || '').toLowerCase();
              return !uniqueTargets.some(t => {
                const tLower = t.toLowerCase();
                const tDigits = t.replace(/\D/g, '').slice(-10);
                return tLower === uId || tLower === uUser || (uMob && (tLower === uMob || tDigits === uMob));
              });
            });
          }
          if (Array.isArray(cache.purchases)) {
            cache.purchases = cache.purchases.filter(p => {
              const pMob = (p.mobile || '').replace(/\D/g, '').slice(-10);
              const pId = (p.id || '').toLowerCase();
              return !uniqueTargets.some(t => {
                const tLower = t.toLowerCase();
                const tDigits = t.replace(/\D/g, '').slice(-10);
                return tLower === pId || (pMob && (tLower === pMob || tDigits === pMob));
              });
            });
          }
          this.setCloudCache(cache);
        }

        // Clean balananda_registered_users_v1
        const rawReg = localStorage.getItem('balananda_registered_users_v1');
        if (rawReg) {
          const list = JSON.parse(rawReg);
          if (Array.isArray(list)) {
            const filteredReg = list.filter((u: any) => {
              const uMob = (u.phone || u.username || '').replace(/\D/g, '').slice(-10);
              const uId = (u.id || '').toLowerCase();
              return !uniqueTargets.some(t => {
                const tLower = t.toLowerCase();
                const tDigits = t.replace(/\D/g, '').slice(-10);
                return tLower === uId || (uMob && (tLower === uMob || tDigits === uMob));
              });
            });
            localStorage.setItem('balananda_registered_users_v1', JSON.stringify(filteredReg));
          }
        }
      }
    } catch (e) {
      console.warn('Error clearing user cache on delete:', e);
    }

    // 6. Make Backend Server API delete calls
    uniqueTargets.filter(t => t.length > 3).forEach(id => {
      const enc = encodeURIComponent(id);
      apiClient.delete(`/api/superadmin/users/${enc}`).catch(() => {});
      apiClient.delete(`/api/users/${enc}`).catch(() => {});
      apiClient.delete(`/api/client-leads/${enc}`).catch(() => {});
      apiClient.delete(`/api/licenses/user/${enc}`).catch(() => {});
    });

    const cleanPhone = (secondaryIdentifier || phoneOrId || '').replace(/\D/g, '').slice(-10);

    // 7. Instant force signout on current device (< 1ms) if current session belongs to deleted user
    if (typeof window !== 'undefined') {
      const activeSessionRaw = localStorage.getItem('balananda_rbac_session_v2') || localStorage.getItem('balananda_rbac_active_session_v1');
      if (activeSessionRaw) {
        try {
          const sess = JSON.parse(activeSessionRaw);
          if (sess && sess.role !== 'SUPER_ADMIN') {
            const sessMob = (sess?.phone || sess?.username || '').replace(/\D/g, '').slice(-10);
            const sessId = (sess?.userId || sess?.id || '').toLowerCase();
            const sessUsername = (sess?.username || '').toLowerCase();

            const isMatch = uniqueTargets.some(t => {
              const tLower = t.toLowerCase();
              const tDigits = t.replace(/\D/g, '').slice(-10);
              return (
                tLower === sessId ||
                tLower === sessUsername ||
                (sessMob && (tLower === sessMob || tDigits === sessMob))
              );
            });

            if (isMatch) {
              this.forceClientSignout('deleted', 'सुरक्षा सूचना: तपाईंको खाता प्रणालीबाट हटाइएको छ। तपाईं पाहुना (Visitor) मोडमा फर्किनुभएको छ।');
            }
          }
        } catch {}
      }

      // 8. Broadcast to other tabs on this machine (< 1ms)
      try {
        this.broadcastChannel?.postMessage({
          type: 'USER_DELETED',
          userId: phoneOrId,
          phone: cleanPhone || secondaryIdentifier || phoneOrId,
          targetIdentifiers: uniqueTargets,
          action: 'deleted',
          reason: 'सुरक्षा सूचना: तपाईंको खाता प्रणालीबाट हटाइएको छ। तपाईं पाहुना (Visitor) मोडमा फर्किनुभएको छ।'
        });
      } catch {}
    }

    // 9. Push updated state to Realtime Relay and Cloud Cache (< 100ms)
    this.pushEventToRealtimeRelay({
      type: 'USER_DELETED',
      mobile: cleanPhone || secondaryIdentifier || phoneOrId,
      userId: phoneOrId,
      leadId: secondaryIdentifier,
      targetIdentifiers: uniqueTargets,
      reason: 'सुरक्षा सूचना: तपाईंको खाता प्रणालीबाट हटाइएको छ। तपाईं पाहुना (Visitor) मोडमा फर्किनुभएको छ।'
    }).catch(() => {});
    this.pushLocalStateToCloud().catch(() => {});

    // 10. Dispatch all update events across components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('unified-data-updated'));
      window.dispatchEvent(new CustomEvent('user-registered'));
      window.dispatchEvent(new CustomEvent('user-storage-updated'));
      window.dispatchEvent(new CustomEvent('client-leads-updated'));
      window.dispatchEvent(new CustomEvent('service-license-updated'));
      window.dispatchEvent(new CustomEvent('client-policies-updated'));
    }
    this.notifyListeners();

    return true;
  }

  /**
   * 1-Touch Complete System & Data Reset:
   * Wipes all old test users, test purchase leads, licenses, trials, and blacklist
   * so fresh testing and production launch has clean 0ms responsive state.
   */
  public async resetEntireSystemData(): Promise<boolean> {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('balananda_permanently_deleted_identifiers_v2');
        localStorage.removeItem('balananda_registered_users_v1');
        localStorage.removeItem('balananda_rbac_users_v2');
        localStorage.removeItem('nepali_astro_rbac_users_v2');
        localStorage.removeItem('balananda_client_access_control_v2');
        localStorage.removeItem('balananda_client_leads_v2');
        localStorage.removeItem('balananda_client_purchase_leads_v2');
        localStorage.removeItem(STORAGE_KEY_CLOUD_CACHE);
        localStorage.removeItem('sukdev_esewa_payment_requests_v1');
        localStorage.removeItem('balananda_my_purchase_requests_v1');
        localStorage.removeItem('balananda_device_trial_lock_v2');
        localStorage.removeItem('balananda_approved_client_license_v2');
        localStorage.removeItem('software_full_access_unlocked_v1');
        localStorage.removeItem('balananda_software_full_access_license_v2');
        localStorage.removeItem('balananda_service_licenses_v1');
        localStorage.removeItem('balananda_rbac_session_v2');
        localStorage.removeItem('balananda_rbac_active_session_v1');

        saveRBACUsers([]);
        saveClientLeads([]);
        saveAllClientPolicies([]);
      } catch (e) {
        console.warn('Local reset error:', e);
      }
    }

    try {
      await apiClient.post('/api/superadmin/data-reset/execute', { confirmationCode: 'CONFIRM_PURGE_2081' });
    } catch {
      try {
        await apiClient.post('/api/superadmin/maintenance/reset-all-test-data', {});
      } catch {
        try {
          await apiClient.post('/api/superadmin/system-reset', {});
        } catch {}
      }
    }

    this.pushEventToRealtimeRelay({
      type: 'USER_DELETED',
      mobile: 'ALL_DATA_RESET'
    }).catch(() => {});

    try {
      this.broadcastChannel?.postMessage({ type: 'SYSTEM_RESET', timestamp: Date.now() });
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('unified-data-updated'));
      window.dispatchEvent(new CustomEvent('user-registered'));
      window.dispatchEvent(new CustomEvent('user-storage-updated'));
      window.dispatchEvent(new CustomEvent('client-leads-updated'));
      window.dispatchEvent(new CustomEvent('service-license-updated'));
      window.dispatchEvent(new CustomEvent('client-policies-updated'));
      window.dispatchEvent(new CustomEvent('software-full-access-updated', { detail: { hasFullAccess: false } }));
    }
    this.notifyListeners();
    return true;
  }

  /**
   * Instantly update a user's status (active, suspended, inactive)
   * When locked or deactivated, in milliseconds all sessions across all tabs and devices are terminated!
   */
  public updateUserAccountStatus(
    phoneOrId: string,
    status: 'active' | 'suspended' | 'inactive',
    reason?: string
  ): boolean {
    if (!phoneOrId) return false;
    const norm = this.normalizePhoneOrId(phoneOrId);
    const cleanId = phoneOrId.trim().toLowerCase();

    // 1. Update RBAC Users Store
    const rbacUsers = getStoredRBACUsers();
    let rbacUpdated = false;
    const newRbacUsers = rbacUsers.map(u => {
      const uMob = this.normalizePhoneOrId(u.phone || u.username);
      const uId = (u.id || '').toLowerCase();
      if ((norm && uMob === norm) || uId === cleanId) {
        rbacUpdated = true;
        return {
          ...u,
          status: status as any,
          statusReason: reason || u.statusReason,
          statusUpdatedAtISO: new Date().toISOString()
        };
      }
      return u;
    });
    if (rbacUpdated) {
      saveRBACUsers(newRbacUsers);
    }

    // 2. Update balananda_registered_users_v1
    if (typeof window !== 'undefined') {
      try {
        const rawReg = localStorage.getItem('balananda_registered_users_v1');
        if (rawReg) {
          const list = JSON.parse(rawReg);
          if (Array.isArray(list)) {
            const updatedReg = list.map((u: any) => {
              const uMob = this.normalizePhoneOrId(u.phone || u.username);
              const uId = (u.id || '').toLowerCase();
              if ((norm && uMob === norm) || uId === cleanId) {
                return {
                  ...u,
                  status,
                  statusReason: reason || u.statusReason,
                  statusUpdatedAtISO: new Date().toISOString()
                };
              }
              return u;
            });
            localStorage.setItem('balananda_registered_users_v1', JSON.stringify(updatedReg));
          }
        }
      } catch {}

      // 3. Update Menu Control Policy
      try {
        const allPolicies = loadAllClientPolicies();
        let policyUpdated = false;
        const updatedPolicies = allPolicies.map(p => {
          const pMob = this.normalizePhoneOrId(p.mobile);
          const pId = (p.id || '').toLowerCase();
          if ((norm && pMob === norm) || pId === cleanId) {
            policyUpdated = true;
            return {
              ...p,
              status: (status === 'active' ? 'active' : (status === 'inactive' ? 'inactive' : 'suspended')) as 'active' | 'suspended' | 'inactive'
            };
          }
          return p;
        });
        if (policyUpdated) {
          saveAllClientPolicies(updatedPolicies);
        }
      } catch {}

      // 4. If locked or deactivated: FORCE INSTANT SIGNOUT on current device (< 1ms)
      if (status !== 'active') {
        const activeSessionRaw = localStorage.getItem('balananda_rbac_session_v2') || localStorage.getItem('balananda_rbac_active_session_v1');
        if (activeSessionRaw) {
          try {
            const sess = JSON.parse(activeSessionRaw);
            const sessMob = this.normalizePhoneOrId(sess?.phone || sess?.username);
            const sessId = (sess?.userId || sess?.id || '').toLowerCase();

            if ((norm && sessMob === norm) || sessId === cleanId) {
              const defaultMsg = status === 'suspended'
                ? 'सुरक्षा सूचना: तपाईंको खाता सुपरएडमिन द्वारा निलम्बन (Lock) गरिएको छ। तपाईं पाहुना (Visitor) मोडमा हुनुहुन्छ।'
                : 'सुरक्षा सूचना: तपाईंको खाता निष्क्रिय (De-activated) गरिएको छ। तपाईं पाहुना (Visitor) मोडमा हुनुहुन्छ।';
              this.forceClientSignout(status, reason || defaultMsg);
            }
          } catch {}
        }

        // 5. Broadcast to all open tabs on this browser (< 1ms)
        try {
          this.broadcastChannel?.postMessage({
            type: 'FORCE_SIGNOUT',
            userId: phoneOrId,
            phone: phoneOrId,
            action: status,
            reason: reason || (status === 'suspended' ? 'खाता निलम्बन (Locked)' : 'खाता निष्क्रिय (De-activated)')
          });
        } catch {}
      }
    }

    // 6. Push to Realtime SSE Relay across all devices (< 100ms)
    this.pushEventToRealtimeRelay({
      type: 'USER_STATUS_CHANGED',
      userStatus: status,
      mobile: phoneOrId,
      userId: phoneOrId,
      details: reason
    }).catch(() => {});

    // 7. Background Server Call
    const enc = encodeURIComponent(phoneOrId);
    apiClient.post(`/api/superadmin/users/${enc}/status`, { status, reason }).catch(() => {});
    apiClient.post(`/api/users/${enc}/update-status`, { status, reason }).catch(() => {});

    this.notifyListeners();
    return true;
  }

  /**
   * Check if a specific registered user has an active/pending purchase
   */
  public checkUserPurchaseAlert(phoneOrId: string): {
    hasPurchase: boolean;
    isPending: boolean;
    isApproved: boolean;
    isRejected: boolean;
    lead?: ClientLead;
    planNameNepali?: string;
    planAmountNPR?: number;
    paymentMethod?: string;
    submittedAtBS?: string;
    submittedAtISO?: string;
    transactionId?: string;
  } {
    if (!phoneOrId) return { hasPurchase: false, isPending: false, isApproved: false, isRejected: false };
    const norm = this.normalizePhoneOrId(phoneOrId);
    const purchases = this.getPurchasedUsers();

    const matchedLead = purchases.find(p => {
      const pMob = this.normalizePhoneOrId(p.mobile);
      const pId = this.normalizePhoneOrId(p.id);
      return (pMob && pMob === norm) || (pId && pId === norm);
    });

    if (!matchedLead) {
      return { hasPurchase: false, isPending: false, isApproved: false, isRejected: false };
    }

    const isPending = matchedLead.status === 'PURCHASE_PENDING';
    const isApproved = matchedLead.status === 'PURCHASE_APPROVED';
    const isRejected = matchedLead.status === 'PURCHASE_REJECTED';

    return {
      hasPurchase: true,
      isPending,
      isApproved,
      isRejected,
      lead: matchedLead,
      planNameNepali: matchedLead.planNameNepali || '१ वर्षको सदस्यता',
      planAmountNPR: matchedLead.planAmountNPR || 2100,
      paymentMethod: matchedLead.paymentMethod || 'esewa',
      submittedAtBS: matchedLead.submittedAtBS || '२०८१',
      submittedAtISO: matchedLead.submittedAtISO || '',
      transactionId: matchedLead.transactionId
    };
  }

  /**
   * Superadmin Approves a Purchase Request
   * Immediately:
   * 1. Validates cash confirmation if paymentMethod === 'cash'
   * 2. Updates client lead to PURCHASE_APPROVED & paymentVerificationStatus: VERIFIED
   * 3. Sets device license & software_full_access_unlocked_v1
   * 4. Syncs with local storage and Cloud Relay
   * 5. Enables instant unlock for user across all four modules
   */
  public approvePurchase(
    leadId: string,
    adminName: string = 'SuperAdmin',
    options?: {
      cashVerified?: boolean;
      verifiedAmount?: number;
      adminNotes?: string;
    }
  ): { success: boolean; messageNepali: string } {
    const leads = getStoredClientLeads();
    const todayStr = new Date().toISOString().split('T')[0];
    const todayBS = convertADToBS(todayStr).formattedBS;
    const nowISO = new Date().toISOString();

    let found = false;
    let targetLead: ClientLead | null = null;

    // Check cash verification requirement
    const candidate = leads.find(l => l.id === leadId || l.mobile === leadId || l.transactionId === leadId);
    if (candidate && candidate.paymentMethod === 'cash' && !options?.cashVerified && !candidate.cashVerified) {
      return {
        success: false,
        messageNepali: 'नगद भुक्तानी प्राप्त भएको रुजु (Cash Payment Received Checkbox) अनिवार्य छ।'
      };
    }

    const updatedLeads = leads.map(l => {
      if (l.id === leadId || l.mobile === leadId || l.transactionId === leadId) {
        found = true;
        const updated: ClientLead = {
          ...l,
          status: 'PURCHASE_APPROVED',
          paymentVerificationStatus: 'VERIFIED',
          cashVerified: l.paymentMethod === 'cash' ? true : l.cashVerified,
          cashVerifiedBy: l.paymentMethod === 'cash' ? adminName : l.cashVerifiedBy,
          cashVerifiedAtISO: l.paymentMethod === 'cash' ? nowISO : l.cashVerifiedAtISO,
          verifiedAmount: options?.verifiedAmount || l.planAmountNPR,
          adminNotes: options?.adminNotes || l.adminNotes,
          approvedAtISO: nowISO,
          approvedAtBS: todayBS,
          approvedBy: adminName
        };
        targetLead = updated;
        return updated;
      }
      return l;
    });

    if (!found) {
      // Create instant approved lead if approving by transaction or phone
      const fallbackLead: ClientLead = {
        id: leadId.startsWith('LEAD-') ? leadId : `LEAD-${Date.now()}`,
        fullName: 'प्रमाणित ग्राहक',
        address: 'नेपाल',
        mobile: leadId,
        email: '',
        whatsapp: leadId,
        deviceFingerprint: getDeviceFingerprint(),
        status: 'PURCHASE_APPROVED',
        paymentVerificationStatus: 'VERIFIED',
        cashVerified: options?.cashVerified,
        cashVerifiedBy: options?.cashVerified ? adminName : undefined,
        cashVerifiedAtISO: options?.cashVerified ? nowISO : undefined,
        verifiedAmount: options?.verifiedAmount || 2100,
        planId: 'yearly_both',
        planNameNepali: '१ वर्षको सदस्यता (सम्पूर्ण सेवा)',
        planAmountNPR: 2100,
        paymentMethod: 'esewa',
        transactionId: leadId,
        submittedAtISO: nowISO,
        submittedAtBS: todayBS,
        approvedAtISO: nowISO,
        approvedAtBS: todayBS,
        approvedBy: adminName,
        adminNotes: options?.adminNotes
      };
      updatedLeads.unshift(fallbackLead);
      targetLead = fallbackLead;
    }

    saveClientLeads(updatedLeads);

    const approvedPhone = targetLead?.mobile || leadId;
    const approvedName = targetLead?.fullName || 'प्रमाणित ग्राहक';
    const approvedAddress = targetLead?.address || 'नेपाल';

    // 1. Ensure user exists in Registered Users table (RBAC store)
    try {
      const rbacUsers = getStoredRBACUsers();
      const phoneNorm = this.normalizePhoneOrId(approvedPhone);
      const existingRbac = rbacUsers.find(u => this.normalizePhoneOrId(u.phone || u.id) === phoneNorm);
      if (!existingRbac && targetLead) {
        const newRbacUser: RBACUser = {
          id: `usr_${Date.now()}`,
          customerId: `ग्राहक-${approvedPhone.slice(-4)}`,
          username: approvedPhone,
          fullName: approvedName,
          phone: approvedPhone,
          email: targetLead.email || `${approvedPhone}@balananda.com`,
          passwordHash: 'client_registered',
          role: 'CUSTOMER',
          roleNameNepali: 'सफ्टवेयर ग्राहक (Client)',
          status: 'active',
          mobileVerified: true,
          emailVerified: false,
          createdAtISO: nowISO,
          createdAtBS: todayBS,
          savedAddresses: [{
            id: `addr_${Date.now()}`,
            title: 'ठेगाना',
            fullName: approvedName,
            phone: approvedPhone,
            district: 'काठमाडौँ',
            localLevel: '',
            ward: '',
            streetAddress: approvedAddress,
            isDefault: true
          }],
          permissions: ['view_kundali', 'view_panchanga', 'view_vastu', 'customer_access']
        };
        saveRBACUsers([newRbacUser, ...rbacUsers]);
      }
    } catch (e) {
      console.warn('[approvePurchase] RBAC auto-register warning:', e);
    }

    // 2. Initialize / update Menu Switchboard policy (Step 3: Menu Control)
    try {
      registerOrUpdateClientPolicy({
        mobile: approvedPhone,
        fullName: approvedName,
        period: '1_year'
      });
    } catch (e) {
      console.warn('[approvePurchase] Menu policy initialization warning:', e);
    }

    // Call standard clientLeadStore approval to handle licenses and events
    try {
      superAdminApprovePurchase(targetLead?.id || leadId, adminName);
    } catch {}

    // Unlock service licenses in balananda_service_licenses_v1
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('balananda_service_licenses_v1');
        const list = raw ? JSON.parse(raw) : [];
        const phone = approvedPhone;
        const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

        ['jyotish', 'vastu'].forEach(serviceKey => {
          const idx = list.findIndex((l: any) => l.serviceKey === serviceKey && (l.phone === phone || l.userId === phone));
          const lic = {
            id: `lic_${serviceKey}_${Date.now()}`,
            serviceKey,
            userId: phone,
            phone,
            unlocked: true,
            grantedPeriod: '1_year',
            grantedAtISO: nowISO,
            grantedAtBS: todayBS,
            expiresAtISO: oneYearLater,
            grantedBy: adminName,
            paymentStatus: 'verified'
          };
          if (idx >= 0) list[idx] = lic;
          else list.push(lic);
        });

        localStorage.setItem('balananda_service_licenses_v1', JSON.stringify(list));
      }
    } catch {}

    // Push to Cloud Relay & Realtime Event Bus so user's phone / device gets unlocked in < 1s
    this.pushEventToRealtimeRelay({
      type: 'LICENSE_APPROVED',
      mobile: targetLead?.mobile || leadId,
      leadId: targetLead?.id || leadId
    }).catch(() => {});
    this.pushLocalStateToCloud();
    this.notifyListeners();

    return {
      success: true,
      messageNepali: `${targetLead?.fullName || 'प्रयोगकर्ता'} को खरिद आवेदन सफलतापूर्वक स्वीकृत गरियो! सफ्टवेयर तथा सम्पूर्ण सेवा खुल्ला भएको छ।`
    };
  }

  /**
   * Superadmin Rejects a Purchase Request
   */
  public rejectPurchase(leadId: string, reason: string = 'अमान्य भुक्तानी प्रमाण', adminName: string = 'SuperAdmin'): { success: boolean; messageNepali: string } {
    const leads = getStoredClientLeads();
    const updated = leads.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          status: 'PURCHASE_REJECTED' as const,
          paymentVerificationStatus: 'REJECTED' as const,
          rejectionReason: reason,
          adminNotes: `अस्वीकृत गर्ने: ${adminName} • कारण: ${reason}`
        };
      }
      return l;
    });

    saveClientLeads(updated);
    this.pushLocalStateToCloud();
    this.notifyListeners();

    return {
      success: true,
      messageNepali: 'खरिद आवेदन अस्वीकृत गरिएको छ। ग्राहकलाई पुनः प्रयास गर्न जानकारी पठाइयो।'
    };
  }

  /**
   * Synchronize all data with Cloud Relay, Express Server, and Local Storage
   */
  public async syncAllData(quiet = false): Promise<{ users: RBACUser[]; purchases: ClientLead[] }> {
    if (this.isSyncing) {
      return { users: this.getRegisteredUsers(), purchases: this.getPurchasedUsers() };
    }
    this.isSyncing = true;

    try {
      // 1. Try Express Server if running (node server.ts)
      await this.trySyncFromExpressServer();

      // 2. Sync with Cloud Relay (handles GitHub Pages static hosting across different devices)
      await this.syncWithCloudRelay();

      this.lastSyncTime = new Date();
      this.notifyListeners();
    } catch (err) {
      if (!quiet) console.warn('[UnifiedSync] Sync warning:', err);
    } finally {
      this.isSyncing = false;
    }

    return {
      users: this.getRegisteredUsers(),
      purchases: this.getPurchasedUsers()
    };
  }

  /**
   * Record newly signed up user and push to cloud (< 1 second delivery)
   */
  public recordUserSignup(user: RBACUser): void {
    const users = getStoredRBACUsers();
    if (!users.some(u => u.phone === user.phone || u.id === user.id)) {
      saveRBACUsers([user, ...users]);
    }

    // Also record in client leads as registered user
    const leads = getStoredClientLeads();
    if (!leads.some(l => l.mobile === user.phone)) {
      const newLead: ClientLead = {
        id: `LEAD-REG-${Date.now()}`,
        fullName: user.fullName,
        address: user.savedAddresses?.[0]?.streetAddress || 'काठमाडौँ',
        mobile: user.phone,
        email: user.email || '',
        whatsapp: user.phone,
        deviceFingerprint: getDeviceFingerprint(),
        status: 'REGISTERED_USER',
        submittedAtISO: user.createdAtISO || new Date().toISOString(),
        submittedAtBS: user.createdAtBS || '२०८१'
      };
      saveClientLeads([newLead, ...leads]);
    }

    // Instant real-time push to SuperAdmin (< 1 second)
    this.pushEventToRealtimeRelay({
      type: 'USER_SIGNUP',
      user
    }).catch(() => {});

    this.pushLocalStateToCloud(user);
    this.notifyListeners();
  }

  /**
   * Record new purchase application and push to cloud (< 1 second delivery)
   */
  public recordPurchaseRequest(lead: ClientLead): void {
    const leads = getStoredClientLeads();
    const idx = leads.findIndex(l => l.id === lead.id || (l.transactionId && l.transactionId === lead.transactionId));
    if (idx >= 0) {
      leads[idx] = lead;
    } else {
      leads.unshift(lead);
    }
    saveClientLeads(leads);

    // Instant real-time push to SuperAdmin (< 1 second)
    this.pushEventToRealtimeRelay({
      type: 'PURCHASE_REQUEST',
      lead
    }).catch(() => {});

    this.pushLocalStateToCloud(undefined, lead);
    this.notifyListeners();
  }

  /**
   * Client-side verification: Check if current logged in user has an approved purchase in cloud
   */
  public async checkAndApplyClientApproval(mobileOrId: string): Promise<boolean> {
    if (!mobileOrId) return false;
    const norm = this.normalizePhoneOrId(mobileOrId);

    // 1. First sync cloud
    await this.syncAllData(true);

    // 2. Check purchased list
    const purchases = this.getPurchasedUsers();
    const approved = purchases.find(p => {
      const pMob = this.normalizePhoneOrId(p.mobile);
      return pMob === norm && p.status === 'PURCHASE_APPROVED';
    });

    if (approved) {
      // Activate on this device
      const todayBS = convertADToBS(new Date().toISOString().split('T')[0]).formattedBS;
      const licenseRecord = {
        isApproved: true,
        leadId: approved.id,
        planId: approved.planId || 'yearly_both',
        planName: approved.planNameNepali || '१ वर्षको सदस्यता',
        clientName: approved.fullName,
        approvedAtBS: approved.approvedAtBS || todayBS,
        expiresAtISO: approved.planId?.startsWith('yearly') 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() 
          : undefined
      };
      localStorage.setItem('balananda_approved_client_license_v2', JSON.stringify(licenseRecord));
      localStorage.setItem('software_full_access_unlocked_v1', 'true');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('software-full-access-updated', { detail: { hasFullAccess: true } }));
        window.dispatchEvent(new CustomEvent('service-license-updated'));
        window.dispatchEvent(new CustomEvent('client-leads-updated'));
        window.dispatchEvent(new CustomEvent('trial-status-updated'));
      }
      this.notifyListeners();
      return true;
    }

    return false;
  }

  // ================= PRIVATE SYNC HELPERS =================

  public normalizePhoneOrId(val?: string): string {
    if (!val) return '';
    const trimmed = val.trim();
    if (
      trimmed.startsWith('usr_') ||
      trimmed.startsWith('LEAD-') ||
      trimmed.startsWith('lead_') ||
      trimmed.startsWith('ADMIN-')
    ) {
      return trimmed.toLowerCase();
    }
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length === 10 || (digits.length >= 7 && digits.length <= 11)) {
      return digits.slice(-10);
    }
    return trimmed.toLowerCase();
  }

  private isPurchaseRecord(l: ClientLead): boolean {
    return (
      l.status === 'PURCHASE_PENDING' ||
      l.status === 'PURCHASE_APPROVED' ||
      l.status === 'PURCHASE_REJECTED' ||
      Boolean(l.planId) ||
      Boolean(l.planAmountNPR) ||
      Boolean(l.transactionId)
    );
  }

  private getCloudCache(): CloudSyncPayload | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CLOUD_CACHE);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private setCloudCache(payload: CloudSyncPayload): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_CLOUD_CACHE, JSON.stringify(payload));
    } catch {}
  }

  /**
   * Try pulling data from local Node server or GitHub Pages static json files
   */
  private async trySyncFromExpressServer(): Promise<void> {
    const fetchedUsers: any[] = [];
    const fetchedLeads: any[] = [];

    // 1. Fetch via Centralized Authoritative API Client (when Node.js backend environment is active)
    if (isLocalhostEnvironment()) {
      try {
        const usersRes = await apiClient.get<any>('/api/users', { timeoutMs: 2000 });
        if (usersRes?.success && Array.isArray(usersRes.users)) {
          fetchedUsers.push(...usersRes.users);
        }
      } catch {}

      try {
        const leadsRes = await apiClient.get<any>('/api/client-leads', { timeoutMs: 2000 });
        if (leadsRes?.success && Array.isArray(leadsRes.leads)) {
          fetchedLeads.push(...leadsRes.leads);
        }
      } catch {}
    }

    // 2. ALWAYS Load Canonical Bundled JSON files (guarantees cross-device canonical data on GitHub Pages & offline)
    const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const origin = (typeof window !== 'undefined' && window.location?.origin) || '';
    const staticCandidates = [
      origin ? `${origin}${cleanBase}data/users.json` : '',
      `${cleanBase}data/users.json`,
      './data/users.json',
      'data/users.json',
      '/data/users.json',
      '/nepali-vedic-jyotish-panchanga/data/users.json'
    ].filter(Boolean);

    for (const url of staticCandidates) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            fetchedUsers.push(...data);
            break;
          }
        }
      } catch {}
    }

    // Node.js test/server environment filesystem fallback
    if (fetchedUsers.length === 0 && typeof process !== 'undefined' && (process as any).versions?.node) {
      try {
        const fsModule = await import('fs');
        const pathModule = await import('path');
        const candidatePaths = [
          pathModule.resolve(process.cwd(), 'data', 'users.json'),
          pathModule.resolve(process.cwd(), 'public', 'data', 'users.json')
        ];
        for (const p of candidatePaths) {
          if (fsModule.existsSync(p)) {
            const raw = JSON.parse(fsModule.readFileSync(p, 'utf-8'));
            if (Array.isArray(raw) && raw.length > 0) {
              fetchedUsers.push(...raw);
              break;
            }
          }
        }
      } catch {}
    }

    const staticLeadsCandidates = [
      origin ? `${origin}${cleanBase}data/client_purchase_leads.json` : '',
      `${cleanBase}data/client_purchase_leads.json`,
      './data/client_purchase_leads.json',
      'data/client_purchase_leads.json',
      '/data/client_purchase_leads.json',
      '/nepali-vedic-jyotish-panchanga/data/client_purchase_leads.json'
    ].filter(Boolean);

    for (const url of staticLeadsCandidates) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            fetchedLeads.push(...data);
            break;
          }
        }
      } catch {}
    }

    if (fetchedLeads.length === 0 && typeof process !== 'undefined' && (process as any).versions?.node) {
      try {
        const fsModule = await import('fs');
        const pathModule = await import('path');
        const candidatePaths = [
          pathModule.resolve(process.cwd(), 'data', 'client_purchase_leads.json'),
          pathModule.resolve(process.cwd(), 'public', 'data', 'client_purchase_leads.json')
        ];
        for (const p of candidatePaths) {
          if (fsModule.existsSync(p)) {
            const raw = JSON.parse(fsModule.readFileSync(p, 'utf-8'));
            if (Array.isArray(raw) && raw.length > 0) {
              fetchedLeads.push(...raw);
              break;
            }
          }
        }
      } catch {}
    }

    // 3. Poll Realtime Cloud Relays (Sharded Registry Topic + Mirror + Legacy Topic)
    // Uses fail-fast timeout (2500ms) with graceful catch
    const handleParsedItem = (msg: any) => {
      if (!msg || !msg.type) return;
      if (msg.type === 'USER_HEARTBEAT') {
        this.recordPresence(msg.phone || msg.userId, msg.timestamp || Date.now());
      } else if (msg.type === 'USER_SIGNUP' && msg.user) {
        fetchedUsers.push(msg.user);
        this.recordPresence(msg.user.phone || msg.user.id, Date.now());
        fetchedLeads.push({
          id: `LEAD-REG-${msg.user.id || Date.now()}`,
          fullName: msg.user.fullName,
          address: msg.user.savedAddresses?.[0]?.streetAddress || 'काठमाडौँ',
          mobile: msg.user.phone,
          email: msg.user.email || '',
          whatsapp: msg.user.phone,
          deviceFingerprint: getDeviceFingerprint(),
          status: 'REGISTERED_USER',
          submittedAtISO: msg.user.createdAtISO || new Date().toISOString(),
          submittedAtBS: msg.user.createdAtBS || '२०८१'
        });
      } else if (msg.type === 'PURCHASE_REQUEST' && msg.lead) {
        fetchedLeads.push(msg.lead);
        this.recordPresence(msg.lead.mobile || msg.lead.id, Date.now());
      }
    };

    const pollTopicSafe = async (topic: string) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(`https://ntfy.sh/${topic}/json?poll=1&since=all`, {
          cache: 'no-store',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const json = await res.json();
            if (Array.isArray(json?.events)) {
              json.events.forEach(handleParsedItem);
            } else if (Array.isArray(json)) {
              json.forEach((item: any) => {
                const msg = typeof item.message === 'string' ? JSON.parse(item.message) : (item.message || item);
                handleParsedItem(msg);
              });
            }
          } else {
            const text = await res.text();
            const lines = text.trim().split('\n');
            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const item = JSON.parse(line);
                const msg = typeof item.message === 'string' ? JSON.parse(item.message) : (item.message || item);
                handleParsedItem(msg);
              } catch {}
            }
          }
        }
      } catch {}
    };

    if (!isLocalhostEnvironment()) {
      // Run poll queries across sharded registry, mirror, and legacy topics
      await Promise.allSettled([
        pollTopicSafe(REALTIME_REGISTRY_TOPIC),
        pollTopicSafe(REALTIME_REGISTRY_MIRROR),
        pollTopicSafe(REALTIME_LEGACY_TOPIC)
      ]);
    }

    // 4. Merge all fetched users into local storage safely (never deleting local newly created users)
    if (fetchedUsers.length > 0) {
      const local = getStoredRBACUsers();
      const map = new Map<string, RBACUser>();
      // Keep local first
      local.forEach(u => {
        if (!isPermanentlyDeleted(u.phone) && !isPermanentlyDeleted(u.id)) {
          const k = this.normalizePhoneOrId(u.phone || u.id);
          if (k) map.set(k, u);
        }
      });
      // Merge remote if not present locally
      fetchedUsers.forEach((u: any) => {
        if (!isPermanentlyDeleted(u.phone) && !isPermanentlyDeleted(u.id)) {
          const k = this.normalizePhoneOrId(u.phone || u.id);
          if (k && !map.has(k)) {
            map.set(k, u);
          }
        }
      });
      saveRBACUsers(Array.from(map.values()));
    }

    // 5. Merge all fetched leads into local storage safely
    if (fetchedLeads.length > 0) {
      const localLeads = getStoredClientLeads();
      const map = new Map<string, ClientLead>();
      localLeads.forEach(l => {
        if (!isPermanentlyDeleted(l.mobile) && !isPermanentlyDeleted(l.id)) {
          const k = this.normalizePhoneOrId(l.mobile || l.id);
          if (k) map.set(k, l);
          map.set(l.id, l);
        }
      });
      fetchedLeads.forEach((l: any) => {
        if (!isPermanentlyDeleted(l.mobile) && !isPermanentlyDeleted(l.id)) {
          const k = this.normalizePhoneOrId(l.mobile || l.id);
          if (k && !map.has(k) && !map.has(l.id)) {
            map.set(k, l);
          }
        }
      });
      saveClientLeads(Array.from(map.values()));
    }
  }

  /**
   * Push current state to Cloud Relay / Server for cross-device access on GitHub Pages
   */
  public async pushLocalStateToCloud(recentUser?: RBACUser, recentLead?: ClientLead): Promise<void> {
    if (typeof window === 'undefined') return;
    const users = getStoredRBACUsers();
    const purchases = this.getPurchasedUsers();

    const payload: CloudSyncPayload = {
      version: 2,
      lastUpdatedAtISO: new Date().toISOString(),
      users,
      purchases
    };

    this.setCloudCache(payload);

    // Notify all open tabs and windows via BroadcastChannel
    try {
      this.broadcastChannel?.postMessage({ type: 'SYNC_DATA_UPDATED', timestamp: Date.now() });
    } catch {}

    if (recentUser) {
      this.pushEventToRealtimeRelay({
        type: 'USER_SIGNUP',
        user: recentUser
      }).catch(() => {});
    }
    if (recentLead) {
      this.pushEventToRealtimeRelay({
        type: 'PURCHASE_REQUEST',
        lead: recentLead
      }).catch(() => {});
    }
  }

  /**
   * Fallback Cloud Relay sync
   */
  private async syncWithCloudRelay(): Promise<void> {
    // Cloud sync handled through static/server merge in trySyncFromExpressServer
    return;
  }

  /**
   * Export all user accounts & purchase data as a portable JSON file for SuperAdmin
   */
  public exportDataToJsonFile(): void {
    if (typeof window === 'undefined') return;
    try {
      const data = {
        exportVersion: 2,
        exportedAt: new Date().toISOString(),
        users: getStoredRBACUsers(),
        leads: getStoredClientLeads(),
        licenses: JSON.parse(localStorage.getItem('balananda_service_licenses_v1') || '[]')
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `balananda-users-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed:', e);
    }
  }

  /**
   * Import users & purchase data from JSON file into local store
   */
  public importDataFromJson(jsonStr: string): { success: boolean; messageNepali: string; count: number } {
    try {
      const parsed = JSON.parse(jsonStr);
      let count = 0;

      // 1. Merge users
      if (Array.isArray(parsed.users) || Array.isArray(parsed)) {
        const usersToImport = Array.isArray(parsed.users) ? parsed.users : parsed;
        const local = getStoredRBACUsers();
        const map = new Map<string, RBACUser>();
        local.forEach(u => map.set(this.normalizePhoneOrId(u.phone || u.id), u));
        usersToImport.forEach((u: any) => {
          if (u && (u.phone || u.id)) {
            const k = this.normalizePhoneOrId(u.phone || u.id);
            if (!isPermanentlyDeleted(u.phone) && !isPermanentlyDeleted(u.id)) {
              map.set(k, u);
              count++;
            }
          }
        });
        saveRBACUsers(Array.from(map.values()));
      }

      // 2. Merge leads
      if (Array.isArray(parsed.leads)) {
        const localLeads = getStoredClientLeads();
        const lMap = new Map<string, ClientLead>();
        localLeads.forEach(l => lMap.set(l.id, l));
        parsed.leads.forEach((l: any) => {
          if (l && l.id && !isPermanentlyDeleted(l.mobile) && !isPermanentlyDeleted(l.id)) {
            lMap.set(l.id, l);
          }
        });
        saveClientLeads(Array.from(lMap.values()));
      }

      this.notifyListeners();
      return {
        success: true,
        messageNepali: `सफलतापूर्वक ${count} प्रयोगकर्ताहरूको डाटा आयात (Import) गरियो!`,
        count
      };
    } catch (e: any) {
      return {
        success: false,
        messageNepali: `डाटा आयात गर्न सकिएन: ${e.message}`,
        count: 0
      };
    }
  }
}

export const unifiedUserSyncService = new UnifiedUserSyncService();
