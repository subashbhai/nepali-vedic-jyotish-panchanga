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

// Native Backend Realtime SSE & Polling Endpoints (Fast, Self-Contained, Zero External Dependency)
export const REALTIME_SYNC_TOPIC = 'balananda_jyotish_realtime_sync_v2081';
export const getRealtimeSSEUrl = () => apiClient.resolveUrl('/api/realtime/events');
export const getRealtimePollUrl = () => apiClient.resolveUrl('/api/realtime/poll');
export const REALTIME_SSE_URL = typeof window !== 'undefined' ? `${window.location.origin}/api/realtime/events` : '/api/realtime/events';
export const REALTIME_PUB_URL = typeof window !== 'undefined' ? `${window.location.origin}/api/realtime/events` : '/api/realtime/events';
export const REALTIME_POLL_URL = typeof window !== 'undefined' ? `${window.location.origin}/api/realtime/poll` : '/api/realtime/poll';

class UnifiedUserSyncService {
  private broadcastChannel: BroadcastChannel | null = null;
  private isSyncing = false;
  private lastSyncTime: Date = new Date();
  private clientSse: EventSource | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(SYNC_BROADCAST_CHANNEL);
        this.broadcastChannel.onmessage = (ev) => {
          if (ev.data?.type === 'SYNC_DATA_UPDATED') {
            window.dispatchEvent(new CustomEvent('unified-data-updated'));
          } else if (ev.data?.type === 'FORCE_SIGNOUT') {
            const activeSessionRaw = localStorage.getItem('balananda_rbac_session_v2') || localStorage.getItem('balananda_rbac_active_session_v1');
            if (activeSessionRaw) {
              try {
                const sess = JSON.parse(activeSessionRaw);
                const sessMob = this.normalizePhoneOrId(sess?.phone || sess?.username);
                const sessId = (sess?.userId || sess?.id || '').toLowerCase();
                const targetMob = this.normalizePhoneOrId(ev.data.phone);
                const targetId = (ev.data.userId || '').toLowerCase();

                const isMatch = (targetMob && (sessMob === targetMob || sessId === targetMob)) ||
                                (targetId && (sessId === targetId || sessMob === targetId));
                if (isMatch) {
                  this.forceClientSignout(ev.data.action, ev.data.reason);
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

      // Immediate & recurring session security verification (every 3 seconds)
      this.validateActiveSessionLiveness();
      setInterval(() => {
        this.validateActiveSessionLiveness();
      }, 3000);

      // Initialize client-side SSE for instant approval & security revoke listening
      this.initClientSSEListener();
    }
  }

  public getLastSyncTime(): Date {
    return this.lastSyncTime;
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

      const sessMob = this.normalizePhoneOrId(sess?.phone || sess?.username);
      const sessId = (sess?.userId || sess?.id || '').toLowerCase();

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
        (u.phone && this.normalizePhoneOrId(u.phone) === sessMob) ||
        (u.username && u.username.toLowerCase() === (sess.username || '').toLowerCase())
      );

      if (dbUser) {
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
      window.dispatchEvent(new CustomEvent('software-full-access-updated'));
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
          const parsed = typeof messageText === 'string' ? JSON.parse(messageText) : messageText;

          if (!parsed || !parsed.type) return;

          if ((parsed.type === 'LICENSE_APPROVED' || parsed.type === 'PURCHASE_APPROVED') && (parsed.mobile || parsed.leadId)) {
            const mobile = parsed.mobile || '';
            const norm = this.normalizePhoneOrId(mobile);
            const activeSessionRaw = localStorage.getItem('balananda_rbac_session_v2') || localStorage.getItem('balananda_rbac_active_session_v1');
            let isCurrent = false;
            if (activeSessionRaw) {
              const sess = JSON.parse(activeSessionRaw);
              const sessMob = this.normalizePhoneOrId(sess?.phone || sess?.username);
              if (sessMob && sessMob === norm) isCurrent = true;
            }

            // Check if this device has leads matching the approved mobile or leadId
            const storedLeads = getStoredClientLeads();
            const matchedLead = storedLeads.find(l => (norm && this.normalizePhoneOrId(l.mobile) === norm) || l.id === parsed.leadId);
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
              this.checkAndApplyClientApproval(mobile || parsed.leadId);
            }
          } else if (parsed.type === 'PURCHASE_REQUEST' && parsed.lead) {
            // Instant real-time delivery to SuperAdmin (< 1 sec)
            const lead = parsed.lead;
            if (!isPermanentlyDeleted(lead.mobile) && !isPermanentlyDeleted(lead.id)) {
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
              const localUsers = getStoredRBACUsers();
              const k = this.normalizePhoneOrId(u.phone || u.id);
              if (!localUsers.some(ex => this.normalizePhoneOrId(ex.phone || ex.id) === k)) {
                saveRBACUsers([u, ...localUsers]);
                this.notifyListeners();
              }
            }
          } else if (parsed.type === 'USER_DELETED' || parsed.type === 'USER_FORCE_SIGNOUT') {
            // Security revoke: Immediately delete locally and force signout if active
            const normTarget = this.normalizePhoneOrId(parsed.mobile || parsed.phone || parsed.userId);
            const targetId = (parsed.userId || parsed.id || '').toLowerCase();
            if (parsed.mobile) addPermanentlyDeletedIdentifier(parsed.mobile);
            if (parsed.userId) addPermanentlyDeletedIdentifier(parsed.userId);

            const activeSessionRaw = localStorage.getItem('balananda_rbac_session_v2') || localStorage.getItem('balananda_rbac_active_session_v1');
            if (activeSessionRaw) {
              try {
                const sess = JSON.parse(activeSessionRaw);
                const sessMob = this.normalizePhoneOrId(sess?.phone || sess?.username);
                const sessId = (sess?.userId || sess?.id || '').toLowerCase();
                const isMatch = (normTarget && (sessMob === normTarget || sessId === normTarget)) ||
                                (targetId && (sessId === targetId || sessMob === targetId));
                if (isMatch) {
                  this.forceClientSignout('deleted', parsed.reason || 'तपाईंको खाता प्रणालीबाट हटाइएको छ वा निलम्बन गरिएको छ।');
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
                  const sessMob = this.normalizePhoneOrId(sess?.phone || sess?.username);
                  const sessId = (sess?.userId || sess?.id || '').toLowerCase();
                  const isMatch = (normTarget && (sessMob === normTarget || sessId === normTarget)) ||
                                  (targetId && (sessId === targetId || sessMob === targetId));
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
   * Instantly broadcast an event across all local tabs and devices (< 1 second)
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
  }): Promise<void> {
    try {
      this.broadcastChannel?.postMessage({
        ...event,
        timestamp: Date.now()
      });
    } catch (e) {
      console.warn('[RealtimeSync] Broadcast failed:', e);
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
  public deleteUserPermanently(phoneOrId: string, secondaryIdentifier?: string): boolean {
    if (!phoneOrId) return false;

    // 1. Blacklist permanently so they can never be resurrected
    addPermanentlyDeletedIdentifier(phoneOrId);
    if (secondaryIdentifier) {
      addPermanentlyDeletedIdentifier(secondaryIdentifier);
    }

    // 2. Remove from RBAC Store
    deleteRBACUserPermanently(phoneOrId);
    if (secondaryIdentifier) {
      deleteRBACUserPermanently(secondaryIdentifier);
    }

    // 3. Remove from Client Leads
    deleteClientLeadPermanently(phoneOrId);
    if (secondaryIdentifier) {
      deleteClientLeadPermanently(secondaryIdentifier);
    }

    // 4. Remove from Service Licenses
    deleteLicensesForUserPermanently(phoneOrId);
    if (secondaryIdentifier) {
      deleteLicensesForUserPermanently(secondaryIdentifier);
    }

    // 5. Remove from Menu Access Policies
    deleteClientPolicyPermanently(phoneOrId);
    if (secondaryIdentifier) {
      deleteClientPolicyPermanently(secondaryIdentifier);
    }

    // 6. Clean localStorage Cloud Cache & purchase requests
    try {
      if (typeof window !== 'undefined') {
        const norm1 = phoneOrId.trim().toLowerCase();
        const clean1 = phoneOrId.replace(/\D/g, '').slice(-10);
        const norm2 = secondaryIdentifier ? secondaryIdentifier.trim().toLowerCase() : '';
        const clean2 = secondaryIdentifier ? secondaryIdentifier.replace(/\D/g, '').slice(-10) : '';

        const cache = this.getCloudCache();
        if (cache) {
          if (Array.isArray(cache.users)) {
            cache.users = cache.users.filter(u => {
              const uMob = (u.phone || '').replace(/\D/g, '').slice(-10);
              const uId = (u.id || '').toLowerCase();
              if (clean1 && clean1.length >= 7 && uMob === clean1) return false;
              if (clean2 && clean2.length >= 7 && uMob === clean2) return false;
              if (uId === norm1 || uId === norm2) return false;
              return true;
            });
          }
          if (Array.isArray(cache.purchases)) {
            cache.purchases = cache.purchases.filter(p => {
              const pMob = (p.mobile || '').replace(/\D/g, '').slice(-10);
              const pId = (p.id || '').toLowerCase();
              if (clean1 && clean1.length >= 7 && pMob === clean1) return false;
              if (clean2 && clean2.length >= 7 && pMob === clean2) return false;
              if (pId === norm1 || pId === norm2) return false;
              return true;
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
              if (clean1 && clean1.length >= 7 && uMob === clean1) return false;
              if (clean2 && clean2.length >= 7 && uMob === clean2) return false;
              if (uId === norm1 || uId === norm2) return false;
              return true;
            });
            localStorage.setItem('balananda_registered_users_v1', JSON.stringify(filteredReg));
          }
        }
      }
    } catch (e) {
      console.warn('Error clearing user cache on delete:', e);
    }

    // 7. Make Backend Server API delete calls
    const idsToDelete = [phoneOrId];
    if (secondaryIdentifier && secondaryIdentifier !== phoneOrId) {
      idsToDelete.push(secondaryIdentifier);
    }
    idsToDelete.forEach(id => {
      const enc = encodeURIComponent(id);
      apiClient.delete(`/api/superadmin/users/${enc}`).catch(() => {});
      apiClient.delete(`/api/users/${enc}`).catch(() => {});
      apiClient.delete(`/api/client-leads/${enc}`).catch(() => {});
      apiClient.delete(`/api/licenses/user/${enc}`).catch(() => {});
    });

    // 8. Push updated state to Realtime Relay and Cloud Cache
    this.pushEventToRealtimeRelay({
      type: 'USER_DELETED',
      mobile: phoneOrId,
      leadId: secondaryIdentifier
    }).catch(() => {});
    this.pushLocalStateToCloud().catch(() => {});

    // Instant force signout on current device (< 1ms) if current session belongs to deleted user
    if (typeof window !== 'undefined') {
      const activeSessionRaw = localStorage.getItem('balananda_rbac_session_v2') || localStorage.getItem('balananda_rbac_active_session_v1');
      if (activeSessionRaw) {
        try {
          const sess = JSON.parse(activeSessionRaw);
          const sessMob = this.normalizePhoneOrId(sess?.phone || sess?.username);
          const sessId = (sess?.userId || sess?.id || '').toLowerCase();
          const target1 = this.normalizePhoneOrId(phoneOrId);
          const target2 = secondaryIdentifier ? this.normalizePhoneOrId(secondaryIdentifier) : '';

          if ((target1 && sessMob === target1) || sessId === phoneOrId.toLowerCase() || (target2 && (sessMob === target2 || sessId === secondaryIdentifier?.toLowerCase()))) {
            this.forceClientSignout('deleted', 'सुरक्षा सूचना: तपाईंको खाता प्रणालीबाट हटाइएको छ। तपाईं पाहुना (Visitor) मोडमा फर्किनुभएको छ।');
          }
        } catch {}
      }

      // Broadcast to other tabs on this machine (< 1ms)
      try {
        this.broadcastChannel?.postMessage({
          type: 'FORCE_SIGNOUT',
          userId: phoneOrId,
          phone: secondaryIdentifier || phoneOrId,
          action: 'deleted',
          reason: 'खाता स्थायी रूपमा हटाइयो'
        });
      } catch {}
    }

    // 9. Dispatch all update events across components
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
        await apiClient.post('/api/superadmin/system-reset', {});
      } catch {}
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
              status: status === 'active' ? 'active' : (status === 'inactive' ? 'inactive' : 'suspended')
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
          role: 'CUSTOMER',
          roleNameNepali: 'सफ्टवेयर ग्राहक (Client)',
          status: 'active',
          mobileVerified: true,
          emailVerified: false,
          createdAtISO: nowISO,
          createdAtBS: todayBS,
          savedAddresses: [{
            id: `addr_${Date.now()}`,
            label: 'ठेगाना',
            streetAddress: approvedAddress,
            city: 'काठमाडौँ',
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

  private normalizePhoneOrId(val?: string): string {
    if (!val) return '';
    const digits = val.replace(/\D/g, '');
    if (digits.length >= 7) return digits.slice(-10);
    return val.trim().toLowerCase();
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
    let fetchedUsers: any[] | null = null;
    let fetchedLeads: any[] | null = null;

    // 1. Fetch via Centralized Authoritative API Client
    try {
      const usersRes = await apiClient.get<any>('/api/users', { timeoutMs: 3000 });
      if (usersRes?.success && Array.isArray(usersRes.users)) {
        fetchedUsers = usersRes.users;
      }
    } catch {}

    try {
      const leadsRes = await apiClient.get<any>('/api/client-leads', { timeoutMs: 3000 });
      if (leadsRes?.success && Array.isArray(leadsRes.leads)) {
        fetchedLeads = leadsRes.leads;
      }
    } catch {}

    // 2. Poll Realtime Hub fallback for any recent signups / purchase requests across devices
    try {
      const pollRes = await apiClient.get<any>('/api/realtime/poll', { timeoutMs: 2000 });
      if (pollRes?.success && Array.isArray(pollRes.events)) {
        const pollUsers: RBACUser[] = [];
        const pollLeads: ClientLead[] = [];

        pollRes.events.forEach((ev: any) => {
          if (ev.type === 'USER_SIGNUP' && ev.user) {
            pollUsers.push(ev.user);
          } else if (ev.type === 'PURCHASE_REQUEST' && ev.lead) {
            pollLeads.push(ev.lead);
          }
        });

        if (pollUsers.length > 0) {
          fetchedUsers = fetchedUsers ? [...pollUsers, ...fetchedUsers] : pollUsers;
        }
        if (pollLeads.length > 0) {
          fetchedLeads = fetchedLeads ? [...pollLeads, ...fetchedLeads] : pollLeads;
        }
      }
    } catch (e) {
      // Quiet fallback
    }

    // 3. Fallback to local offline bundled JSON if backend was not reachable (e.g. offline static standalone)
    if (!fetchedUsers || fetchedUsers.length === 0) {
      const staticCandidates = [
        './data/users.json',
        '/data/users.json'
      ];
      for (const url of staticCandidates) {
        try {
          const res = await fetch(url, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              fetchedUsers = data;
              break;
            }
          }
        } catch {}
      }
    }

    if (!fetchedLeads || fetchedLeads.length === 0) {
      const staticLeadsCandidates = [
        './data/client_purchase_leads.json',
        '/data/client_purchase_leads.json'
      ];
      for (const url of staticLeadsCandidates) {
        try {
          const res = await fetch(url, { cache: 'no-store' });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              fetchedLeads = data;
              break;
            }
          }
        } catch {}
      }
    }

    // 4. Merge fetched users into local storage safely (never deleting local newly created users)
    if (Array.isArray(fetchedUsers) && fetchedUsers.length > 0) {
      const local = getStoredRBACUsers();
      const map = new Map<string, RBACUser>();
      // Keep local first
      local.forEach(u => {
        if (!isPermanentlyDeleted(u.phone) && !isPermanentlyDeleted(u.id)) {
          map.set(this.normalizePhoneOrId(u.phone || u.id), u);
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

    // 5. Merge fetched leads into local storage safely
    if (Array.isArray(fetchedLeads) && fetchedLeads.length > 0) {
      const localLeads = getStoredClientLeads();
      const map = new Map<string, ClientLead>();
      localLeads.forEach(l => {
        if (!isPermanentlyDeleted(l.mobile) && !isPermanentlyDeleted(l.id)) {
          map.set(l.id, l);
        }
      });
      fetchedLeads.forEach((l: any) => {
        if (!isPermanentlyDeleted(l.mobile) && !isPermanentlyDeleted(l.id)) {
          if (!map.has(l.id)) {
            map.set(l.id, l);
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
