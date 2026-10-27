import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { calculateMembershipDateSchedule, getNepaliBSDate } from './membershipDateEngine';

export type PlanDuration = '1_year' | 'lifetime' | 'trial' | '1_month' | '3_months';
export type DeviceType = 'mobile_only' | 'computer_only' | 'both';
export type MembershipStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_VERIFIED'
  | 'APPROVED'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'REJECTED'
  | 'CANCELLED';

export interface MembershipRecord {
  id: string;
  userId: string;
  phone: string;
  email?: string;
  fullName: string;
  planId: string;
  planNameNepali: string;
  duration: PlanDuration;
  devices: DeviceType;
  amountNPR: number;
  paymentMethod: 'esewa' | 'khalti' | 'bank' | 'cash';
  paymentStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  membershipStatus: MembershipStatus;
  cashVerified?: boolean;
  cashVerifiedBy?: string;
  cashVerifiedAtISO?: string;
  transactionId?: string;
  submittedAtISO: string;
  submittedAtBS: string;
  approvedBy?: string;
  approvedAtISO?: string;
  approvedAtBS?: string;
  activatedAtISO?: string;
  activatedAtBS?: string;
  expiresAtTimestamp?: number | null; // null for lifetime
  expiresAtISO?: string | null;
  expiresAtBS?: string;
  includedServices: Array<'jyotish' | 'vastu' | 'karmakanda' | 'panchanga'>;
  adminNotes?: string;
  renewalCount: number;
  history?: Array<{
    action: string;
    status: MembershipStatus;
    timestampISO: string;
    performedBy: string;
    details?: string;
  }>;
}

export interface MembershipAuditLog {
  id: string;
  membershipId: string;
  userId: string;
  action: string;
  performedBy: string;
  timestampISO: string;
  details: string;
}

export interface ServiceAccessResult {
  hasAccess: boolean;
  isExpired: boolean;
  isLifetime: boolean;
  remainingDays: number;
  showWarning30Days: boolean;
  planNameNepali: string;
  membershipStatus: MembershipStatus;
  messageNepali: string;
  unlockedServices: string[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const MEMBERSHIPS_FILE = path.join(DATA_DIR, 'memberships.json');
const AUDIT_LOGS_FILE = path.join(DATA_DIR, 'membership_audit_logs.json');

// Atomic write helper
function writeJsonAtomic(filePath: string, data: any) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tmp = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 6)}`;
  try {
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmp, filePath);
  } catch {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }
}

// Plan definitions with updated official prices
export const MEMBERSHIP_PLANS: Record<string, {
  planId: string;
  nameNepali: string;
  devices: DeviceType;
  duration: PlanDuration;
  priceNPR: number;
  services: Array<'jyotish' | 'vastu' | 'karmakanda' | 'panchanga'>;
}> = {
  yearly_mobile: {
    planId: 'yearly_mobile',
    nameNepali: 'मोबाइल मात्र (१ वर्ष)',
    devices: 'mobile_only',
    duration: '1_year',
    priceNPR: 200,
    services: ['jyotish', 'vastu', 'panchanga']
  },
  lifetime_mobile: {
    planId: 'lifetime_mobile',
    nameNepali: 'मोबाइल मात्र (आजीवन)',
    devices: 'mobile_only',
    duration: 'lifetime',
    priceNPR: 1000,
    services: ['jyotish', 'vastu', 'karmakanda', 'panchanga']
  },
  yearly_computer: {
    planId: 'yearly_computer',
    nameNepali: 'कम्प्युटर मात्र (१ वर्ष)',
    devices: 'computer_only',
    duration: '1_year',
    priceNPR: 500,
    services: ['jyotish', 'vastu', 'panchanga']
  },
  lifetime_computer: {
    planId: 'lifetime_computer',
    nameNepali: 'कम्प्युटर मात्र (आजीवन)',
    devices: 'computer_only',
    duration: 'lifetime',
    priceNPR: 2500,
    services: ['jyotish', 'vastu', 'karmakanda', 'panchanga']
  },
  yearly_both: {
    planId: 'yearly_both',
    nameNepali: 'मोबाइल + कम्प्युटर दुवै (१ वर्ष)',
    devices: 'both',
    duration: '1_year',
    priceNPR: 1200,
    services: ['jyotish', 'vastu', 'karmakanda', 'panchanga']
  },
  lifetime_both: {
    planId: 'lifetime_both',
    nameNepali: 'मोबाइल + कम्प्युटर दुवै (आजीवन - Best Value)',
    devices: 'both',
    duration: 'lifetime',
    priceNPR: 3000,
    services: ['jyotish', 'vastu', 'karmakanda', 'panchanga']
  }
};

class MembershipEngine {
  private memberships: MembershipRecord[] = [];
  private auditLogs: MembershipAuditLog[] = [];

  constructor() {
    this.loadFromDisk();
  }

  public loadFromDisk(): void {
    try {
      if (fs.existsSync(MEMBERSHIPS_FILE)) {
        this.memberships = JSON.parse(fs.readFileSync(MEMBERSHIPS_FILE, 'utf-8'));
      } else {
        this.memberships = [];
        writeJsonAtomic(MEMBERSHIPS_FILE, []);
      }

      if (fs.existsSync(AUDIT_LOGS_FILE)) {
        this.auditLogs = JSON.parse(fs.readFileSync(AUDIT_LOGS_FILE, 'utf-8'));
      } else {
        this.auditLogs = [];
        writeJsonAtomic(AUDIT_LOGS_FILE, []);
      }
    } catch (err) {
      console.warn('[MembershipEngine] Error reading memberships from disk:', err);
      this.memberships = [];
      this.auditLogs = [];
    }
  }

  private persistMemberships(): void {
    writeJsonAtomic(MEMBERSHIPS_FILE, this.memberships);
  }

  private persistAuditLogs(): void {
    writeJsonAtomic(AUDIT_LOGS_FILE, this.auditLogs);
  }

  private logAudit(membershipId: string, userId: string, action: string, performedBy: string, details: string) {
    const entry: MembershipAuditLog = {
      id: `audit_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      membershipId,
      userId,
      action,
      performedBy,
      timestampISO: new Date().toISOString(),
      details
    };
    this.auditLogs.unshift(entry);
    this.persistAuditLogs();
  }

  /**
   * Submit a new membership purchase request
   */
  public submitPurchaseRequest(params: {
    userId: string;
    phone: string;
    email?: string;
    fullName: string;
    planId: string;
    paymentMethod: 'esewa' | 'khalti' | 'bank' | 'cash';
    transactionId?: string;
    submittedAtBS?: string;
  }): { success: boolean; membership: MembershipRecord; message: string } {
    const plan = MEMBERSHIP_PLANS[params.planId] || MEMBERSHIP_PLANS.yearly_both;
    const now = new Date();

    const cleanPhone = params.phone.replace(/\D/g, '').slice(-10);

    // Look for existing pending request to avoid duplicates
    const existing = this.memberships.find(
      m => m.userId === params.userId && m.membershipStatus === 'PENDING_PAYMENT'
    );

    const membership: MembershipRecord = existing || {
      id: `mem_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      userId: params.userId,
      phone: cleanPhone,
      email: params.email?.toLowerCase().trim(),
      fullName: params.fullName,
      planId: plan.planId,
      planNameNepali: plan.nameNepali,
      duration: plan.duration,
      devices: plan.devices,
      amountNPR: plan.priceNPR,
      paymentMethod: params.paymentMethod,
      paymentStatus: 'PENDING',
      membershipStatus: 'PENDING_PAYMENT',
      transactionId: params.transactionId,
      submittedAtISO: now.toISOString(),
      submittedAtBS: params.submittedAtBS || getNepaliBSDate(now),
      includedServices: plan.services,
      renewalCount: 0,
      history: []
    };

    if (existing) {
      existing.planId = plan.planId;
      existing.planNameNepali = plan.nameNepali;
      existing.duration = plan.duration;
      existing.devices = plan.devices;
      existing.amountNPR = plan.priceNPR;
      existing.paymentMethod = params.paymentMethod;
      existing.transactionId = params.transactionId;
      existing.submittedAtISO = now.toISOString();
    } else {
      this.memberships.unshift(membership);
    }

    membership.history?.push({
      action: 'PURCHASE_SUBMITTED',
      status: 'PENDING_PAYMENT',
      timestampISO: now.toISOString(),
      performedBy: params.userId,
      details: `${plan.nameNepali} खरिद अनुरोध पेश गरियो (${params.paymentMethod.toUpperCase()})`
    });

    this.persistMemberships();
    this.logAudit(membership.id, params.userId, 'PURCHASE_SUBMITTED', params.fullName, `योजना: ${plan.nameNepali}`);

    return {
      success: true,
      membership,
      message: 'तपाईंको सदस्यता खरिद अनुरोध प्राप्त भएको छ। रुजु भएपछि तत्काल सक्रिय हुनेछ।'
    };
  }

  /**
   * SuperAdmin approves membership purchase
   */
  public approveMembership(
    membershipId: string,
    adminId: string,
    options?: {
      cashVerified?: boolean;
      verifiedAmount?: number;
      adminNotes?: string;
      customDuration?: PlanDuration;
      approvedAtBS?: string;
    }
  ): { success: boolean; membership?: MembershipRecord; message: string } {
    const membership = this.memberships.find(m => m.id === membershipId);
    if (!membership) {
      return { success: false, message: 'सदस्यता आवेदन फेला परेन।' };
    }

    // Cash payment validation
    if (membership.paymentMethod === 'cash' && !options?.cashVerified && !membership.cashVerified) {
      return {
        success: false,
        message: 'नगद भुक्तानी प्राप्त भएको रुजु (Cash Payment Received Verification) अनिवार्य छ।'
      };
    }

    const now = new Date();
    const duration = options?.customDuration || membership.duration;
    const schedule = calculateMembershipDateSchedule(now, duration);

    membership.paymentStatus = 'VERIFIED';
    membership.membershipStatus = 'ACTIVE';
    membership.approvedBy = adminId;
    membership.approvedAtISO = now.toISOString();
    membership.approvedAtBS = options?.approvedAtBS || schedule.activatedAtBS;
    membership.activatedAtISO = schedule.activatedAtISO;
    membership.activatedAtBS = schedule.activatedAtBS;
    membership.expiresAtTimestamp = schedule.expiresAtTimestamp;
    membership.expiresAtISO = schedule.expiresAtISO;
    membership.expiresAtBS = schedule.expiresAtBS;

    if (membership.paymentMethod === 'cash') {
      membership.cashVerified = true;
      membership.cashVerifiedBy = adminId;
      membership.cashVerifiedAtISO = now.toISOString();
    }

    if (options?.adminNotes) membership.adminNotes = options.adminNotes;
    if (options?.verifiedAmount) membership.amountNPR = options.verifiedAmount;

    membership.history?.push({
      action: 'MEMBERSHIP_APPROVED',
      status: 'ACTIVE',
      timestampISO: now.toISOString(),
      performedBy: adminId,
      details: `प्रशासक ${adminId} द्वारा सदस्यता स्वीकृत एवं सेवा सक्रिय गरियो`
    });

    this.persistMemberships();
    this.logAudit(membership.id, membership.userId, 'MEMBERSHIP_APPROVED', adminId, `सक्रिय: ${membership.planNameNepali}`);

    return {
      success: true,
      membership,
      message: `${membership.fullName} को सदस्यता स्वीकृत भयो र सेवाहरू स्वतः सक्रिय गरिए!`
    };
  }

  /**
   * SuperAdmin rejects membership purchase
   */
  public rejectMembership(membershipId: string, adminId: string, reason: string): { success: boolean; membership?: MembershipRecord; message: string } {
    const membership = this.memberships.find(m => m.id === membershipId);
    if (!membership) {
      return { success: false, message: 'सदस्यता आवेदन फेला परेन।' };
    }

    membership.paymentStatus = 'REJECTED';
    membership.membershipStatus = 'REJECTED';
    membership.adminNotes = reason;

    membership.history?.push({
      action: 'MEMBERSHIP_REJECTED',
      status: 'REJECTED',
      timestampISO: new Date().toISOString(),
      performedBy: adminId,
      details: `अस्वीकृत कारण: ${reason}`
    });

    this.persistMemberships();
    this.logAudit(membership.id, membership.userId, 'MEMBERSHIP_REJECTED', adminId, reason);

    return {
      success: true,
      membership,
      message: 'सदस्यता आवेदन अस्वीकृत गरियो।'
    };
  }

  /**
   * Central Service Entitlement and Expiry Check
   */
  public checkServiceAccess(userIdOrPhone: string, serviceKey: 'jyotish' | 'vastu' | 'karmakanda' | 'panchanga' = 'jyotish'): ServiceAccessResult {
    const cleanPhone = userIdOrPhone.replace(/\D/g, '').slice(-10);
    const now = Date.now();

    // Panchanga is public and always accessible
    if (serviceKey === 'panchanga') {
      return {
        hasAccess: true,
        isExpired: false,
        isLifetime: true,
        remainingDays: 9999,
        showWarning30Days: false,
        planNameNepali: 'खुल्ला वैदिक सेवा',
        membershipStatus: 'ACTIVE',
        messageNepali: 'पञ्चाङ्ग सेवा निःशुल्क खुल्ला छ।',
        unlockedServices: ['panchanga']
      };
    }

    // Find active or latest membership for this user/phone
    const userMemberships = this.memberships.filter(
      m => m.userId === userIdOrPhone || (cleanPhone && m.phone === cleanPhone)
    );

    if (userMemberships.length === 0) {
      return {
        hasAccess: false,
        isExpired: false,
        isLifetime: false,
        remainingDays: 0,
        showWarning30Days: false,
        planNameNepali: 'कुनै योजना छैन',
        membershipStatus: 'PENDING_PAYMENT',
        messageNepali: 'यो सेवा प्रयोग गर्न कृपया सदस्यता लिनुहोस्।',
        unlockedServices: []
      };
    }

    // Sort by latest activated
    userMemberships.sort((a, b) => {
      const tA = a.activatedAtISO ? new Date(a.activatedAtISO).getTime() : 0;
      const tB = b.activatedAtISO ? new Date(b.activatedAtISO).getTime() : 0;
      return tB - tA;
    });

    const activeMem = userMemberships.find(m => m.membershipStatus === 'ACTIVE');
    if (!activeMem) {
      const latest = userMemberships[0];
      return {
        hasAccess: false,
        isExpired: latest.membershipStatus === 'EXPIRED',
        isLifetime: false,
        remainingDays: 0,
        showWarning30Days: false,
        planNameNepali: latest.planNameNepali,
        membershipStatus: latest.membershipStatus,
        messageNepali: latest.membershipStatus === 'PENDING_PAYMENT'
          ? 'तपाईंको सदस्यता भुक्तानी रुजु हुन बाँकी छ।'
          : latest.membershipStatus === 'EXPIRED'
          ? 'तपाईंको सदस्यता समाप्त भएको छ। कृपया नवीकरण गर्नुहोस्।'
          : 'सदस्यता निष्क्रिय छ।',
        unlockedServices: []
      };
    }

    // Check service coverage
    const coversService = activeMem.includedServices.includes(serviceKey);
    if (!coversService) {
      return {
        hasAccess: false,
        isExpired: false,
        isLifetime: activeMem.duration === 'lifetime',
        remainingDays: 0,
        showWarning30Days: false,
        planNameNepali: activeMem.planNameNepali,
        membershipStatus: activeMem.membershipStatus,
        messageNepali: `तपाईंको हालको योजना (${activeMem.planNameNepali}) मा यो सेवा समावेश छैन।`,
        unlockedServices: activeMem.includedServices
      };
    }

    // Lifetime plan check
    if (activeMem.duration === 'lifetime' || activeMem.expiresAtTimestamp === null || activeMem.expiresAtTimestamp === undefined) {
      return {
        hasAccess: true,
        isExpired: false,
        isLifetime: true,
        remainingDays: 99999,
        showWarning30Days: false,
        planNameNepali: activeMem.planNameNepali,
        membershipStatus: 'ACTIVE',
        messageNepali: 'आजीवन सदस्यता सक्रिय छ।',
        unlockedServices: activeMem.includedServices
      };
    }

    // Time-bound plan expiration calculation
    const remainingMs = activeMem.expiresAtTimestamp - now;
    const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));

    if (remainingMs <= 0) {
      // Mark expired
      activeMem.membershipStatus = 'EXPIRED';
      this.persistMemberships();
      this.logAudit(activeMem.id, activeMem.userId, 'MEMBERSHIP_EXPIRED', 'system', 'समय सकिएकाले सेवा समाप्त');

      return {
        hasAccess: false,
        isExpired: true,
        isLifetime: false,
        remainingDays: 0,
        showWarning30Days: false,
        planNameNepali: activeMem.planNameNepali,
        membershipStatus: 'EXPIRED',
        messageNepali: 'तपाईंको सदस्यताको म्याद सकिएको छ। सेवा निरन्तर राख्न कृपया नवीकरण गर्नुहोस्।',
        unlockedServices: []
      };
    }

    const showWarning30Days = remainingDays <= 30;
    const warningMsg = showWarning30Days
      ? `तपाईंको सदस्यता सकिन ${remainingDays} दिन मात्र बाँकी छ। कृपया समयमै नवीकरण गर्नुहोस्।`
      : 'सदस्यता सक्रिय छ।';

    return {
      hasAccess: true,
      isExpired: false,
      isLifetime: false,
      remainingDays,
      showWarning30Days,
      planNameNepali: activeMem.planNameNepali,
      membershipStatus: 'ACTIVE',
      messageNepali: warningMsg,
      unlockedServices: activeMem.includedServices
    };
  }

  /**
   * SuperAdmin: List all memberships with status filters
   */
  public listMemberships(filter?: string): MembershipRecord[] {
    const now = Date.now();
    // Reconcile expirations on query
    let modified = false;
    for (const m of this.memberships) {
      if (m.membershipStatus === 'ACTIVE' && m.expiresAtTimestamp && m.expiresAtTimestamp <= now) {
        m.membershipStatus = 'EXPIRED';
        modified = true;
      }
    }
    if (modified) this.persistMemberships();

    if (!filter || filter === 'all') return this.memberships;
    if (filter === 'pending') return this.memberships.filter(m => m.membershipStatus === 'PENDING_PAYMENT');
    if (filter === 'active') return this.memberships.filter(m => m.membershipStatus === 'ACTIVE');
    if (filter === 'expired') return this.memberships.filter(m => m.membershipStatus === 'EXPIRED');
    if (filter === 'rejected') return this.memberships.filter(m => m.membershipStatus === 'REJECTED');
    return this.memberships;
  }

  /**
   * Get single membership by user ID or phone
   */
  public getMembershipByUserId(userId: string): MembershipRecord | undefined {
    return this.memberships.find(m => m.userId === userId);
  }

  public getMembershipByPhoneOrId(identifier: string): MembershipRecord | undefined {
    const cleanPhone = identifier.replace(/\D/g, '').slice(-10);
    return this.memberships.find(
      m => m.userId === identifier || (cleanPhone.length >= 7 && m.phone === cleanPhone)
    );
  }

  /**
   * SuperAdmin manual activation or upgrade
   */
  public activateManualMembership(params: {
    userId: string;
    phone: string;
    email?: string;
    fullName: string;
    planId: string;
    duration?: PlanDuration;
    customExpiresAtTimestamp?: number | null;
    includedServices?: Array<'jyotish' | 'vastu' | 'karmakanda' | 'panchanga'>;
    adminId: string;
    adminNotes?: string;
    paymentMethod?: 'esewa' | 'khalti' | 'bank' | 'cash';
    transactionId?: string;
    cashVerified?: boolean;
    approvedAtBS?: string;
  }): { success: boolean; membership?: MembershipRecord; message: string } {
    const plan = MEMBERSHIP_PLANS[params.planId] || MEMBERSHIP_PLANS.yearly_both;
    const cleanPhone = params.phone.replace(/\D/g, '').slice(-10);
    const method = params.paymentMethod || 'cash';

    if (method === 'cash' && !params.cashVerified) {
      return {
        success: false,
        message: 'नगद भुक्तानी प्राप्त भएको रुजु (Cash Payment Received Verification) अनिवार्य छ।'
      };
    }

    const duration = params.duration || plan.duration;
    const now = new Date();
    const schedule = calculateMembershipDateSchedule(now, duration);
    let expiresAtTimestamp: number | null = schedule.expiresAtTimestamp;
    let expiresAtISO: string | null = schedule.expiresAtISO;
    let expiresAtBS: string = schedule.expiresAtBS;

    if (params.customExpiresAtTimestamp !== undefined) {
      expiresAtTimestamp = params.customExpiresAtTimestamp;
      expiresAtISO = expiresAtTimestamp ? new Date(expiresAtTimestamp).toISOString() : null;
      expiresAtBS = expiresAtTimestamp ? getNepaliBSDate(expiresAtTimestamp) : 'आजीवन (Lifetime)';
    }

    let membership = this.getMembershipByPhoneOrId(params.userId) || this.getMembershipByPhoneOrId(cleanPhone);

    if (membership) {
      membership.planId = plan.planId;
      membership.planNameNepali = plan.nameNepali;
      membership.duration = duration;
      membership.devices = plan.devices;
      membership.amountNPR = plan.priceNPR;
      membership.paymentMethod = method;
      membership.paymentStatus = 'VERIFIED';
      membership.membershipStatus = 'ACTIVE';
      membership.transactionId = params.transactionId || membership.transactionId;
      membership.cashVerified = method === 'cash' ? true : membership.cashVerified;
      membership.cashVerifiedBy = method === 'cash' ? params.adminId : membership.cashVerifiedBy;
      membership.cashVerifiedAtISO = method === 'cash' ? now.toISOString() : membership.cashVerifiedAtISO;
      membership.approvedBy = params.adminId;
      membership.approvedAtISO = now.toISOString();
      membership.approvedAtBS = params.approvedAtBS || schedule.activatedAtBS;
      membership.activatedAtISO = schedule.activatedAtISO;
      membership.activatedAtBS = schedule.activatedAtBS;
      membership.expiresAtTimestamp = expiresAtTimestamp;
      membership.expiresAtISO = expiresAtISO;
      membership.expiresAtBS = expiresAtBS;
      membership.includedServices = params.includedServices || plan.services;
      membership.adminNotes = params.adminNotes || membership.adminNotes;
      membership.renewalCount = (membership.renewalCount || 0) + 1;
    } else {
      membership = {
        id: `mem_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        userId: params.userId,
        phone: cleanPhone,
        email: params.email?.toLowerCase().trim(),
        fullName: params.fullName,
        planId: plan.planId,
        planNameNepali: plan.nameNepali,
        duration,
        devices: plan.devices,
        amountNPR: plan.priceNPR,
        paymentMethod: method,
        paymentStatus: 'VERIFIED',
        membershipStatus: 'ACTIVE',
        cashVerified: method === 'cash',
        cashVerifiedBy: method === 'cash' ? params.adminId : undefined,
        cashVerifiedAtISO: method === 'cash' ? now.toISOString() : undefined,
        transactionId: params.transactionId,
        submittedAtISO: now.toISOString(),
        submittedAtBS: params.approvedAtBS || schedule.activatedAtBS,
        approvedBy: params.adminId,
        approvedAtISO: now.toISOString(),
        approvedAtBS: params.approvedAtBS || schedule.activatedAtBS,
        activatedAtISO: schedule.activatedAtISO,
        activatedAtBS: schedule.activatedAtBS,
        expiresAtTimestamp,
        expiresAtISO,
        expiresAtBS,
        includedServices: params.includedServices || plan.services,
        adminNotes: params.adminNotes,
        renewalCount: 0,
        history: []
      };
      this.memberships.unshift(membership);
    }

    membership.history?.push({
      action: 'MANUAL_ACTIVATION',
      status: 'ACTIVE',
      timestampISO: now.toISOString(),
      performedBy: params.adminId,
      details: `प्रशासक ${params.adminId} द्वारा सदस्यता सक्रिय गरियो (${plan.nameNepali}, ${duration})। कारण: ${params.adminNotes || 'प्रत्यक्ष सक्रियता'}`
    });

    this.persistMemberships();
    this.logAudit(membership.id, params.userId, 'MANUAL_ACTIVATION', params.adminId, `सक्रिय: ${plan.nameNepali} (${params.adminNotes || 'प्रशासक द्वारा'})`);

    return {
      success: true,
      membership,
      message: `${params.fullName} को सदस्यता सफलतापूर्वक सक्रिय गरियो!`
    };
  }

  /**
   * SuperAdmin Mutate Membership: Suspend, Renew, Extend, Change Plan, or Toggle Services
   */
  public mutateMembership(
    membershipIdOrUserId: string,
    adminId: string,
    options: {
      action: 'activate' | 'suspend' | 'deactivate' | 'renew' | 'extend' | 'change_plan' | 'toggle_service';
      duration?: PlanDuration;
      newPlanId?: string;
      services?: Array<'jyotish' | 'vastu' | 'karmakanda' | 'panchanga'>;
      customExpiresAtTimestamp?: number | null;
      reason: string;
    }
  ): { success: boolean; membership?: MembershipRecord; message: string } {
    const membership =
      this.memberships.find(m => m.id === membershipIdOrUserId || m.userId === membershipIdOrUserId) ||
      this.getMembershipByPhoneOrId(membershipIdOrUserId);

    if (!membership) {
      return { success: false, message: 'सदस्यता रेकर्ड फेला परेन।' };
    }

    const now = new Date();
    const action = options.action;

    if (action === 'suspend' || action === 'deactivate') {
      membership.membershipStatus = 'CANCELLED';
      membership.adminNotes = options.reason;
      membership.history?.push({
        action: 'MEMBERSHIP_SUSPENDED',
        status: 'CANCELLED',
        timestampISO: now.toISOString(),
        performedBy: adminId,
        details: `निलम्बन/निष्क्रिय कारण: ${options.reason}`
      });
      this.logAudit(membership.id, membership.userId, 'MEMBERSHIP_SUSPENDED', adminId, options.reason);
    } else if (action === 'activate') {
      membership.membershipStatus = 'ACTIVE';
      membership.adminNotes = options.reason;
      membership.history?.push({
        action: 'MEMBERSHIP_REACTIVATED',
        status: 'ACTIVE',
        timestampISO: now.toISOString(),
        performedBy: adminId,
        details: `पुनःसक्रिय कारण: ${options.reason}`
      });
      this.logAudit(membership.id, membership.userId, 'MEMBERSHIP_REACTIVATED', adminId, options.reason);
    } else if (action === 'renew' || action === 'extend') {
      const dur = options.duration || '1_year';
      membership.duration = dur;
      membership.membershipStatus = 'ACTIVE';

      let currentBase = membership.expiresAtTimestamp && membership.expiresAtTimestamp > now.getTime()
        ? membership.expiresAtTimestamp
        : now.getTime();

      let newExp: number | null = null;
      if (dur === 'lifetime') {
        newExp = null;
        membership.expiresAtBS = 'आजीवन (Lifetime)';
      } else if (dur === '1_year') {
        newExp = currentBase + 365 * 24 * 60 * 60 * 1000;
        membership.expiresAtBS = '२०८३';
      } else if (dur === '1_month') {
        newExp = currentBase + 30 * 24 * 60 * 60 * 1000;
        membership.expiresAtBS = '१ महिना थप';
      } else if (dur === '3_months') {
        newExp = currentBase + 90 * 24 * 60 * 60 * 1000;
        membership.expiresAtBS = '३ महिना थप';
      } else {
        newExp = currentBase + 365 * 24 * 60 * 60 * 1000;
        membership.expiresAtBS = '२०८३';
      }

      membership.expiresAtTimestamp = newExp;
      membership.expiresAtISO = newExp ? new Date(newExp).toISOString() : null;
      membership.renewalCount = (membership.renewalCount || 0) + 1;

      membership.history?.push({
        action: action === 'renew' ? 'MEMBERSHIP_RENEWED' : 'MEMBERSHIP_EXTENDED',
        status: 'ACTIVE',
        timestampISO: now.toISOString(),
        performedBy: adminId,
        details: `${action === 'renew' ? 'नवीकरण' : 'म्याद थप'} (${dur})। कैफियत: ${options.reason}`
      });
      this.logAudit(membership.id, membership.userId, action.toUpperCase(), adminId, `${dur} थप - ${options.reason}`);
    } else if (action === 'change_plan') {
      if (options.newPlanId && MEMBERSHIP_PLANS[options.newPlanId]) {
        const plan = MEMBERSHIP_PLANS[options.newPlanId];
        membership.planId = plan.planId;
        membership.planNameNepali = plan.nameNepali;
        membership.devices = plan.devices;
        membership.amountNPR = plan.priceNPR;
        membership.includedServices = plan.services;
        membership.history?.push({
          action: 'PLAN_CHANGED',
          status: membership.membershipStatus,
          timestampISO: now.toISOString(),
          performedBy: adminId,
          details: `योजना परिवर्तन: ${plan.nameNepali}। कारण: ${options.reason}`
        });
        this.logAudit(membership.id, membership.userId, 'PLAN_CHANGED', adminId, `योजना: ${plan.nameNepali}`);
      }
    } else if (action === 'toggle_service') {
      if (options.services) {
        membership.includedServices = options.services;
        membership.history?.push({
          action: 'SERVICES_UPDATED',
          status: membership.membershipStatus,
          timestampISO: now.toISOString(),
          performedBy: adminId,
          details: `सेवाहरू संशोधन: ${options.services.join(', ')}। कारण: ${options.reason}`
        });
        this.logAudit(membership.id, membership.userId, 'SERVICES_UPDATED', adminId, options.services.join(', '));
      }
    }

    this.persistMemberships();

    return {
      success: true,
      membership,
      message: `सदस्यता कार्य (${action}) सफलतापूर्वक सम्पन्न भयो!`
    };
  }

  /**
   * Get audit logs for a user or membership
   */
  public getAuditLogsForUser(userId: string, phone?: string): MembershipAuditLog[] {
    const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';
    const userMems = this.memberships.filter(m => m.userId === userId || (cleanPhone && m.phone === cleanPhone));
    const memIds = new Set(userMems.map(m => m.id));
    return this.auditLogs.filter(a => a.userId === userId || memIds.has(a.membershipId));
  }

  /**
   * Reset all memberships and audit logs in memory and disk (SuperAdmin authorized reset)
   */
  public resetAllData(): void {
    this.memberships = [];
    this.auditLogs = [];
    this.persistMemberships();
    this.persistAuditLogs();
    console.log('[MembershipEngine] Reset all memberships and audit logs in memory and disk.');
  }
}

export const membershipEngine = new MembershipEngine();
