import { convertADToBS } from '../utils/nepaliCalendar';

export type ClientLeadStatus = 
  | 'REGISTERED_USER'
  | 'TRIAL_ACTIVE'
  | 'TRIAL_EXPIRED'
  | 'PURCHASE_PENDING'
  | 'PURCHASE_APPROVED'
  | 'PURCHASE_REJECTED';

export interface ClientLead {
  id: string;
  fullName: string;
  address: string;
  mobile: string;
  email: string;
  whatsapp: string;
  deviceFingerprint: string;
  status: ClientLeadStatus;
  planId?: 'yearly_mobile' | 'yearly_desktop' | 'yearly_both' | 'lifetime_mobile' | 'lifetime_desktop' | 'lifetime_both';
  planNameNepali?: string;
  planAmountNPR?: number;
  paymentMethod?: 'esewa' | 'khalti' | 'bank';
  transactionId?: string;
  submittedAtISO: string;
  submittedAtBS: string;
  trialStartedAtISO?: string;
  trialExpiresAtISO?: string;
  approvedAtISO?: string;
  approvedAtBS?: string;
  approvedBy?: string;
  rejectionReason?: string;
  clientNotes?: string;
}

const STORAGE_KEY_LEADS = 'balananda_client_leads_v2';
const STORAGE_KEY_DEVICE_TRIAL = 'balananda_device_trial_lock_v2';
const STORAGE_KEY_APPROVED_LICENSE = 'balananda_approved_client_license_v2';
const BROADCAST_CHANNEL_LEADS = 'balananda_client_leads_channel';

let leadsBroadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    leadsBroadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_LEADS);
    leadsBroadcastChannel.onmessage = (event) => {
      if (event.data?.type === 'LEADS_UPDATED') {
        window.dispatchEvent(new CustomEvent('client-leads-updated', { detail: { leads: getStoredClientLeads() } }));
      }
    };
  }
} catch {}

export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'server-device';
  try {
    const key = 'balananda_hardware_device_fp_v2';
    let fp = localStorage.getItem(key);
    if (!fp) {
      const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
      const navInfo = `${navigator.language}-${navigator.hardwareConcurrency || 4}`;
      const randomSalt = Math.random().toString(36).substring(2, 10);
      fp = `DEV-${btoa(`${screenInfo}|${navInfo}|${randomSalt}`).substring(0, 24)}`;
      localStorage.setItem(key, fp);
    }
    return fp;
  } catch {
    return 'DEV-FALLBACK-001';
  }
}

export function getStoredClientLeads(): ClientLead[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LEADS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load client leads:', e);
    return [];
  }
}

export function saveClientLeads(leads: ClientLead[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
    window.dispatchEvent(new CustomEvent('client-leads-updated', { detail: { leads } }));
    try {
      leadsBroadcastChannel?.postMessage({ type: 'LEADS_UPDATED' });
    } catch {}
  } catch (e) {
    console.error('Failed to save client leads:', e);
  }
}

/**
 * Fetch and synchronize client leads from central server
 */
export async function syncClientLeadsFromServer(): Promise<ClientLead[]> {
  try {
    if (typeof window === 'undefined') return [];
    const res = await fetch('/api/client-leads');
    if (!res.ok) return getStoredClientLeads();
    const data = await res.json();
    if (data?.success && Array.isArray(data?.leads)) {
      const serverLeads: ClientLead[] = data.leads;
      const localLeads = getStoredClientLeads();
      const mergedMap = new Map<string, ClientLead>();
      localLeads.forEach(l => mergedMap.set(l.id, l));
      serverLeads.forEach(l => mergedMap.set(l.id, l));
      const merged = Array.from(mergedMap.values()).sort((a, b) => 
        new Date(b.submittedAtISO || 0).getTime() - new Date(a.submittedAtISO || 0).getTime()
      );
      saveClientLeads(merged);
      return merged;
    }
  } catch (e) {
    console.warn('[clientLeadStore] syncClientLeadsFromServer failed:', e);
  }
  return getStoredClientLeads();
}

/**
 * Check if the 24-Hour Free Trial is currently active on this device
 */
export function is24HourTrialActive(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DEVICE_TRIAL);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data.expiresAtISO) return false;

    const expiresTime = new Date(data.expiresAtISO).getTime();
    const now = Date.now();
    return now < expiresTime;
  } catch {
    return false;
  }
}

/**
 * Check if this device has already consumed and expired its 24-hour trial
 */
export function isDeviceTrialExpired(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DEVICE_TRIAL);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data.expiresAtISO) return false;

    const expiresTime = new Date(data.expiresAtISO).getTime();
    const now = Date.now();
    return now >= expiresTime;
  } catch {
    return false;
  }
}

/**
 * Remaining seconds for active 24-hour trial
 */
export function getTrialRemainingSeconds(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DEVICE_TRIAL);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    if (!data.expiresAtISO) return 0;

    const expiresTime = new Date(data.expiresAtISO).getTime();
    const diff = Math.floor((expiresTime - Date.now()) / 1000);
    return Math.max(0, diff);
  } catch {
    return 0;
  }
}

/**
 * Check if this device / client has an approved purchase license
 */
export function isClientPurchaseApproved(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_APPROVED_LICENSE);
    if (!raw) return false;
    const license = JSON.parse(raw);
    if (!license || !license.isApproved) return false;

    // Check expiry for yearly plans
    if (license.expiresAtISO) {
      const expires = new Date(license.expiresAtISO).getTime();
      if (Date.now() > expires) return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function getApprovedClientLicense(): {
  isApproved: boolean;
  leadId: string;
  planId: string;
  planName: string;
  clientName: string;
  approvedAtBS: string;
  expiresAtISO?: string;
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_APPROVED_LICENSE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getDeviceTrialRecord(): {
  deviceFingerprint: string;
  startedAtISO: string;
  expiresAtISO: string;
  leadMobile?: string;
  leadFullName?: string;
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DEVICE_TRIAL);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Start 24-Hour Free Trial for a user who filled the lead form
 */
export function start24HourTrial(leadData: {
  fullName: string;
  address: string;
  mobile: string;
  email: string;
  whatsapp: string;
}): { success: boolean; messageNepali: string } {
  if (typeof window === 'undefined') return { success: false, messageNepali: 'अमान्य वातावरण' };

  if (isDeviceTrialExpired()) {
    return {
      success: false,
      messageNepali: 'यस डिभाइसमा २४ घण्टे निःशुल्क परीक्षण पहिले नै प्रयोग भइसकेको छ। कृपया सफ्टवेयर खरिद गरी सुपरएडमिनबाट स्वीकृत गराउनुहोस्।'
    };
  }

  if (is24HourTrialActive()) {
    return {
      success: true,
      messageNepali: 'तपाईंको २४ घण्टे परीक्षण पहिले नै सक्रिय छ।'
    };
  }

  const deviceFp = getDeviceFingerprint();
  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // exactly 24 hours
  const todayStr = now.toISOString().split('T')[0];
  const todayBS = convertADToBS(todayStr).formattedBS;

  // Save trial lock to localStorage
  const trialRecord = {
    deviceFingerprint: deviceFp,
    startedAtISO: now.toISOString(),
    expiresAtISO: expires.toISOString(),
    leadMobile: leadData.mobile,
    leadFullName: leadData.fullName,
  };
  localStorage.setItem(STORAGE_KEY_DEVICE_TRIAL, JSON.stringify(trialRecord));

  // Add or update lead
  const leads = getStoredClientLeads();
  const newLead: ClientLead = {
    id: `LEAD-${Date.now()}`,
    ...leadData,
    deviceFingerprint: deviceFp,
    status: 'TRIAL_ACTIVE',
    submittedAtISO: now.toISOString(),
    submittedAtBS: todayBS,
    trialStartedAtISO: now.toISOString(),
    trialExpiresAtISO: expires.toISOString(),
  };

  saveClientLeads([newLead, ...leads]);

  // Sync to central server
  try {
    fetch('/api/client-leads/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLead)
    }).catch((e) => console.warn('[clientLeadStore] Server sync failed for trial:', e));
  } catch {}

  window.dispatchEvent(new CustomEvent('software-full-access-updated', { detail: { hasFullAccess: true } }));
  window.dispatchEvent(new CustomEvent('trial-status-updated'));

  return {
    success: true,
    messageNepali: 'बधाई छ! तपाईंको २४ घण्टे पूर्ण परीक्षण (२४ Hours Free Trial) सक्रिय भयो। सम्पूर्ण ज्योतिष तथा वास्तुशास्त्र खुला भएका छन्।'
  };
}

/**
 * Start 24-Hour Free Trial with server validation (Strictly once only per mobile number)
 */
export async function start24HourTrialAsync(leadData: {
  fullName: string;
  address: string;
  mobile: string;
  email: string;
  whatsapp: string;
}): Promise<{ success: boolean; messageNepali: string }> {
  const cleanPhone = leadData.mobile.replace(/\D/g, '').slice(-10);
  try {
    const res = await fetch('/api/trial/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile: cleanPhone,
        fullName: leadData.fullName,
        deviceFingerprint: getDeviceFingerprint()
      })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        messageNepali: data.error || 'यस मोबाइल नम्बरबाट पहिले नै २४ घण्टे परीक्षण लिइसकिएको छ।'
      };
    }

    const now = new Date();
    const expires = new Date(data.trial?.expiresAtISO || (now.getTime() + 24 * 60 * 60 * 1000));
    localStorage.setItem(STORAGE_KEY_DEVICE_TRIAL, JSON.stringify({
      deviceFingerprint: getDeviceFingerprint(),
      startedAtISO: now.toISOString(),
      expiresAtISO: expires.toISOString(),
      leadMobile: cleanPhone,
      leadFullName: leadData.fullName
    }));

    window.dispatchEvent(new CustomEvent('software-full-access-updated', { detail: { hasFullAccess: true } }));
    window.dispatchEvent(new CustomEvent('trial-status-updated'));

    return {
      success: true,
      messageNepali: 'बधाई छ! तपाईंको २४ घण्टे पूर्ण परीक्षण (२४ Hours Free Trial) सक्रिय भयो। सम्पूर्ण ज्योतिष तथा वास्तुशास्त्र खुला भएका छन्।'
    };
  } catch {
    return start24HourTrial(leadData);
  }
}

/**
 * Submit Software Purchase Application (Pending SuperAdmin Approval)
 */
export function submitPurchaseApplication(data: {
  fullName: string;
  address: string;
  mobile: string;
  email: string;
  whatsapp: string;
  planId: 'yearly_mobile' | 'yearly_desktop' | 'yearly_both' | 'lifetime_mobile' | 'lifetime_desktop' | 'lifetime_both';
  planNameNepali: string;
  planAmountNPR: number;
  paymentMethod: 'esewa' | 'khalti' | 'bank';
  transactionId: string;
}): { success: boolean; messageNepali: string; leadId: string } {
  if (typeof window === 'undefined') return { success: false, messageNepali: 'अमान्य वातावरण', leadId: '' };

  const deviceFp = getDeviceFingerprint();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const todayBS = convertADToBS(todayStr).formattedBS;
  const leadId = `LEAD-${Date.now()}`;

  const newLead: ClientLead = {
    id: leadId,
    fullName: data.fullName,
    address: data.address,
    mobile: data.mobile,
    email: data.email,
    whatsapp: data.whatsapp,
    deviceFingerprint: deviceFp,
    status: 'PURCHASE_PENDING',
    planId: data.planId,
    planNameNepali: data.planNameNepali,
    planAmountNPR: data.planAmountNPR,
    paymentMethod: data.paymentMethod,
    transactionId: data.transactionId,
    submittedAtISO: now.toISOString(),
    submittedAtBS: todayBS,
  };

  const leads = getStoredClientLeads();
  saveClientLeads([newLead, ...leads]);

  // Sync to central server
  try {
    fetch('/api/client-leads/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLead)
    }).catch((e) => console.warn('[clientLeadStore] Server sync failed for purchase lead:', e));
  } catch {}

  return {
    success: true,
    messageNepali: 'तपाईंको खरिद आवेदन सफलतापूर्वक दर्ता भएको छ! सुपरएडमिनले रकम प्रमाणित तथा स्वीकृत (Approve) गरेपछि तपाईंको सफ्टवेयर स्वतः सक्रिय हुनेछ।',
    leadId,
  };
}

/**
 * SuperAdmin: Approve a Client Purchase Application
 */
export function superAdminApprovePurchase(leadId: string, adminName: string = 'SuperAdmin'): { success: boolean; messageNepali: string } {
  const leads = getStoredClientLeads();
  const leadIndex = leads.findIndex((l) => l.id === leadId);
  if (leadIndex === -1) {
    return { success: false, messageNepali: 'आवेदन फेला परेन।' };
  }

  const lead = leads[leadIndex];
  const now = new Date();
  const todayBS = convertADToBS(now.toISOString().split('T')[0]).formattedBS;

  // Set expiry: 1 year (365 days) for yearly plans, null for lifetime
  let expiresAtISO: string | undefined = undefined;
  if (lead.planId?.startsWith('yearly')) {
    const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    expiresAtISO = oneYearLater.toISOString();
  }

  lead.status = 'PURCHASE_APPROVED';
  lead.approvedAtISO = now.toISOString();
  lead.approvedAtBS = todayBS;
  lead.approvedBy = adminName;
  leads[leadIndex] = lead;
  saveClientLeads(leads);

  // Activate license locally if this device matches or store globally
  const licenseRecord = {
    isApproved: true,
    leadId: lead.id,
    planId: lead.planId || 'yearly_both',
    planName: lead.planNameNepali || '१ वर्षको सदस्यता',
    clientName: lead.fullName,
    approvedAtBS: todayBS,
    expiresAtISO,
  };

  localStorage.setItem(STORAGE_KEY_APPROVED_LICENSE, JSON.stringify(licenseRecord));
  localStorage.setItem('software_full_access_unlocked_v1', 'true');

  // Sync to central server
  try {
    fetch(`/api/client-leads/${lead.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedBy: adminName, approvedAtBS: todayBS })
    }).catch((e) => console.warn('[clientLeadStore] Server sync failed for approve:', e));
  } catch {}

  window.dispatchEvent(new CustomEvent('software-full-access-updated', { detail: { hasFullAccess: true } }));
  window.dispatchEvent(new CustomEvent('subscription-status-updated'));

  return {
    success: true,
    messageNepali: `${lead.fullName} को खरिद आवेदन सफलतापूर्वक स्वीकृत भयो! अब सफ्टवेयरका सम्पूर्ण सुविधाहरू खुला भएका छन्।`
  };
}

/**
 * SuperAdmin: Approve directly by Transaction ID (e.g. ESE454576474)
 */
export function superAdminApproveByTransactionId(
  transactionId: string,
  adminName: string = 'SuperAdmin',
  clientInfo?: { fullName?: string; mobile?: string; planName?: string; planAmount?: number }
): { success: boolean; messageNepali: string; lead?: ClientLead } {
  const leads = getStoredClientLeads();
  const cleanTx = transactionId.trim().toUpperCase();

  // 1. Search existing lead
  let lead = leads.find((l) => l.transactionId && l.transactionId.trim().toUpperCase() === cleanTx);
  if (lead) {
    const res = superAdminApprovePurchase(lead.id, adminName);
    return { ...res, lead };
  }

  // 2. If not found in leads, create instant approved client lead
  const now = new Date();
  const todayBS = convertADToBS(now.toISOString().split('T')[0]).formattedBS;
  const leadId = `LEAD-${Date.now()}`;
  const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

  const newLead: ClientLead = {
    id: leadId,
    fullName: clientInfo?.fullName?.trim() || 'प्रमाणित ग्राहक (Verified Client)',
    address: 'नेपाल',
    mobile: clientInfo?.mobile?.trim() || '9841000000',
    email: 'client@balananda.com',
    whatsapp: clientInfo?.mobile?.trim() || '9841000000',
    deviceFingerprint: getDeviceFingerprint(),
    status: 'PURCHASE_APPROVED',
    planId: 'yearly_both',
    planNameNepali: clientInfo?.planName || '१ वर्षको सदस्यता (मोबाइल + कम्प्युटर)',
    planAmountNPR: clientInfo?.planAmount || 5000,
    paymentMethod: cleanTx.startsWith('ESE') ? 'esewa' : cleanTx.startsWith('KHL') ? 'khalti' : 'bank',
    transactionId: cleanTx,
    submittedAtISO: now.toISOString(),
    submittedAtBS: todayBS,
    approvedAtISO: now.toISOString(),
    approvedAtBS: todayBS,
    approvedBy: adminName,
  };

  saveClientLeads([newLead, ...leads]);

  const licenseRecord = {
    isApproved: true,
    leadId: newLead.id,
    planId: newLead.planId,
    planName: newLead.planNameNepali,
    clientName: newLead.fullName,
    approvedAtBS: todayBS,
    expiresAtISO: oneYearLater,
  };

  localStorage.setItem(STORAGE_KEY_APPROVED_LICENSE, JSON.stringify(licenseRecord));
  localStorage.setItem('software_full_access_unlocked_v1', 'true');

  // Sync to central server
  try {
    fetch('/api/client-leads/approve-by-tx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId: cleanTx, approvedBy: adminName })
    }).catch((e) => console.warn('[clientLeadStore] Server sync failed for approve-by-tx:', e));
  } catch {}

  window.dispatchEvent(new CustomEvent('software-full-access-updated', { detail: { hasFullAccess: true } }));
  window.dispatchEvent(new CustomEvent('subscription-status-updated'));

  return {
    success: true,
    messageNepali: `कारोबार कोड #${cleanTx} सफलतापूर्वक प्रमाणित गरी सफ्टवेयर पूर्ण सक्रिय (Approved) गरियो!`,
    lead: newLead
  };
}

/**
 * SuperAdmin: Reject a Client Purchase Application
 */
export function superAdminRejectPurchase(leadId: string, reason: string): { success: boolean; messageNepali: string } {
  const leads = getStoredClientLeads();
  const leadIndex = leads.findIndex((l) => l.id === leadId);
  if (leadIndex === -1) {
    return { success: false, messageNepali: 'आवेदन फेला परेन।' };
  }

  leads[leadIndex].status = 'PURCHASE_REJECTED';
  leads[leadIndex].rejectionReason = reason;
  saveClientLeads(leads);

  // Sync to central server
  try {
    fetch(`/api/client-leads/${leadId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    }).catch((e) => console.warn('[clientLeadStore] Server sync failed for reject:', e));
  } catch {}

  return {
    success: true,
    messageNepali: 'खरिद आवेदन अस्वीकृत गरियो।'
  };
}

/**
 * Export Clients (Purchased, Approved, Trial) to CSV
 */
export function exportClientsToCSV(): string {
  const leads = getStoredClientLeads();
  const headers = [
    'Lead ID',
    'Full Name',
    'Address',
    'Mobile',
    'Email',
    'WhatsApp',
    'Status',
    'Plan Name',
    'Amount (NPR)',
    'Payment Method',
    'Transaction ID',
    'Submitted Date (BS)',
    'Approved By',
    'Approved Date (BS)'
  ];

  const rows = leads.map((l) => [
    `"${l.id}"`,
    `"${l.fullName}"`,
    `"${l.address}"`,
    `"${l.mobile}"`,
    `"${l.email}"`,
    `"${l.whatsapp}"`,
    `"${l.status}"`,
    `"${l.planNameNepali || ''}"`,
    `"${l.planAmountNPR || 0}"`,
    `"${l.paymentMethod || ''}"`,
    `"${l.transactionId || ''}"`,
    `"${l.submittedAtBS}"`,
    `"${l.approvedBy || ''}"`,
    `"${l.approvedAtBS || ''}"`
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Permanently delete a client lead / approval record
 */
export function deleteClientLeadPermanently(mobileOrId: string): boolean {
  if (typeof window === 'undefined' || !mobileOrId) return false;
  try {
    const current = getStoredClientLeads();
    const norm = mobileOrId.trim().toLowerCase();
    const digits = mobileOrId.replace(/\D/g, '').slice(-10);
    const targetLead = current.find(l => {
      const lMob = (l.mobile || '').replace(/\D/g, '').slice(-10);
      const lId = (l.id || '').toLowerCase();
      return (digits && digits.length >= 7 && lMob === digits) || (lId === norm);
    });

    const filtered = current.filter(l => {
      const lMob = (l.mobile || '').replace(/\D/g, '').slice(-10);
      const lId = (l.id || '').toLowerCase();
      if (digits && digits.length >= 7 && lMob === digits) return false;
      if (lId === norm) return false;
      return true;
    });
    saveClientLeads(filtered);

    if (targetLead?.id) {
      try {
        fetch(`/api/client-leads/${targetLead.id}`, { method: 'DELETE' })
          .catch((e) => console.warn('[clientLeadStore] Server sync failed for delete:', e));
      } catch {}
    }
    return true;
  } catch (e) {
    console.error('Failed to delete client lead:', e);
    return false;
  }
}
