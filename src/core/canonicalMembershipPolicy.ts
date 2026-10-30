/**
 * Canonical Membership Policy & State Resolver
 * Single Source of Truth for Roles, Plans, Entitlements, Payments, and Renewals
 * Balananda Vaidik Sewa
 */

export type CanonicalUserCategory = 'visitor' | 'member' | 'professional';
export type CanonicalPlanTier = 'normal' | 'professional';
export type CanonicalDuration = '1_year' | 'lifetime' | 'trial';

export interface CanonicalPlanConfig {
  id: string;
  aliases: string[];
  nameNepali: string;
  tier: CanonicalPlanTier;
  duration: CanonicalDuration;
  durationDays: number; // 365, Infinity, or 2
  priceNPR: number;
  targetCategory: CanonicalUserCategory;
  roleNameNepali: string;
  isLifetime: boolean;
  isProfessional: boolean;
  services: Array<'panchanga' | 'jyotish' | 'vastu' | 'karmakanda' | 'personal_faladesh' | 'professional_tools'>;
}

export const CANONICAL_MEMBERSHIP_PLANS: Record<string, CanonicalPlanConfig> = {
  normal_yearly: {
    id: 'normal_yearly',
    aliases: ['normal_yearly', 'yearly_mobile', 'yearly_computer', 'सामान्य सदस्यता (१ वर्ष)', 'साधारण सदस्यता (१ वर्ष)', 'normal_1_year'],
    nameNepali: 'सामान्य सदस्यता (१ वर्ष)',
    tier: 'normal',
    duration: '1_year',
    durationDays: 365,
    priceNPR: 100,
    targetCategory: 'member',
    roleNameNepali: 'साधारण सदस्य (Member)',
    isLifetime: false,
    isProfessional: false,
    services: ['panchanga', 'personal_faladesh']
  },
  normal_lifetime: {
    id: 'normal_lifetime',
    aliases: ['normal_lifetime', 'lifetime_mobile', 'lifetime_computer', 'सामान्य सदस्यता (आजीवन)', 'साधारण सदस्यता (आजीवन)', 'normal_lifetime_member'],
    nameNepali: 'सामान्य सदस्यता (आजीवन)',
    tier: 'normal',
    duration: 'lifetime',
    durationDays: Infinity,
    priceNPR: 500,
    targetCategory: 'member',
    roleNameNepali: 'साधारण सदस्य (Member)',
    isLifetime: true,
    isProfessional: false,
    services: ['panchanga', 'personal_faladesh']
  },
  pro_yearly: {
    id: 'pro_yearly',
    aliases: ['pro_yearly', 'yearly_both', 'प्रो. मेम्बरशिप / पेशागत सदस्यता (१ वर्ष)', 'व्यावसायिक सदस्यता (१ वर्ष)', 'professional_yearly', 'pro_1_year'],
    nameNepali: 'Professional सदस्यता (१ वर्ष)',
    tier: 'professional',
    duration: '1_year',
    durationDays: 365,
    priceNPR: 2000,
    targetCategory: 'professional',
    roleNameNepali: 'व्यावसायिक सदस्य (Professional)',
    isLifetime: false,
    isProfessional: true,
    services: ['panchanga', 'personal_faladesh', 'jyotish', 'vastu', 'karmakanda', 'professional_tools']
  },
  pro_lifetime: {
    id: 'pro_lifetime',
    aliases: ['pro_lifetime', 'lifetime_both', 'प्रो. मेम्बरशिप / पेशागत सदस्यता (आजीवन)', 'व्यावसायिक सदस्यता (आजीवन)', 'professional_lifetime', 'pro_life'],
    nameNepali: 'Professional सदस्यता (आजीवन)',
    tier: 'professional',
    duration: 'lifetime',
    durationDays: Infinity,
    priceNPR: 5000,
    targetCategory: 'professional',
    roleNameNepali: 'व्यावसायिक सदस्य (Professional)',
    isLifetime: true,
    isProfessional: true,
    services: ['panchanga', 'personal_faladesh', 'jyotish', 'vastu', 'karmakanda', 'professional_tools']
  },
  trial_48h: {
    id: 'trial_48h',
    aliases: ['trial_48h', 'trial_24h', '४८ घण्टा निःशुल्क परीक्षण', 'परीक्षण'],
    nameNepali: '४८ घण्टा निःशुल्क परीक्षण',
    tier: 'normal',
    duration: 'trial',
    durationDays: 2,
    priceNPR: 0,
    targetCategory: 'visitor',
    roleNameNepali: 'परीक्षण प्रयोगकर्ता (Trial)',
    isLifetime: false,
    isProfessional: false,
    services: ['panchanga', 'personal_faladesh']
  }
};

/**
 * Resolves a plan string or ID to its canonical plan configuration
 */
export function resolveCanonicalPlan(planIdentifier?: string | null): CanonicalPlanConfig | null {
  if (!planIdentifier) return null;
  const clean = String(planIdentifier).trim().toLowerCase();

  // Direct key lookup
  if (CANONICAL_MEMBERSHIP_PLANS[clean]) {
    return CANONICAL_MEMBERSHIP_PLANS[clean];
  }

  // Alias lookup
  for (const plan of Object.values(CANONICAL_MEMBERSHIP_PLANS)) {
    if (plan.id === clean) return plan;
    if (plan.nameNepali === planIdentifier) return plan;
    for (const alias of plan.aliases) {
      if (alias.toLowerCase() === clean || alias === planIdentifier) {
        return plan;
      }
    }
  }

  // Partial substring heuristics
  if (clean.includes('pro') || clean.includes('पेशागत') || clean.includes('व्यावसायिक')) {
    if (clean.includes('life') || clean.includes('आजीवन')) return CANONICAL_MEMBERSHIP_PLANS.pro_lifetime;
    return CANONICAL_MEMBERSHIP_PLANS.pro_yearly;
  }

  if (clean.includes('सामान्य') || clean.includes('साधारण') || clean.includes('normal') || clean.includes('member')) {
    if (clean.includes('life') || clean.includes('आजीवन')) return CANONICAL_MEMBERSHIP_PLANS.normal_lifetime;
    return CANONICAL_MEMBERSHIP_PLANS.normal_yearly;
  }

  return null;
}

export interface CanonicalUserState {
  userId: string;
  userCategory: CanonicalUserCategory;
  roleNameNepali: string;
  isSuperAdmin: boolean;
  isStoreAdmin: boolean;
  isProfessional: boolean;
  isPaidMember: boolean;
  isTrialActive: boolean;
  isMembershipExpired: boolean;
  isPendingPayment: boolean;
  membershipStatus: 'ACTIVE' | 'EXPIRED' | 'PENDING_PAYMENT' | 'NONE';
  canonicalPlanId: string | null;
  planNameNepali: string;
  confirmedPaymentAmountNPR: number;
  totalConfirmedAmountPaidNPR: number;
  isJyotishAllowed: boolean;
  isVastuAllowed: boolean;
  isProfessionalToolsAllowed: boolean;
  remainingDays: number;
  expiresAtISO: string | null;
  expiresAtTimestamp: number | null;
  isLifetime: boolean;
}

/**
 * Authoritative Payment Ledger Revenue Calculator
 * Calculates verified, settled NPR revenue strictly from confirmed payment records.
 * 
 * Rules:
 * 1. Only counts positive settlements: 'paid', 'verified', 'confirmed', 'purchase_approved'.
 * 2. Explicitly excludes non-revenue states: 'duplicate_admin_activation', 'duplicate_activation',
 *    'no_settlement', 'refunded', 'failed', 'cancelled', 'voided', 'pending', 'pending_verification'.
 * 3. Deduplicates by unique payment ID (`p.id`) to prevent double-counting.
 * 4. Deduplicates by unique external transaction reference (`transactionReference` / `transactionId`) when present.
 * 5. Excludes records explicitly flagged as duplicate administrative activations.
 * 6. NEVER discards genuine distinct payments simply because expiry dates or plans match.
 */
export function calculateVerifiedLedgerRevenue(payments: any[]): number {
  if (!Array.isArray(payments) || payments.length === 0) return 0;
  let totalNPR = 0;
  const seenPaymentIds = new Set<string>();
  const seenTxRefs = new Set<string>();

  for (const p of payments) {
    if (!p) continue;
    const pId = String(p.id || '').trim();
    if (pId) {
      if (seenPaymentIds.has(pId)) continue;
      seenPaymentIds.add(pId);
    }

    const rawStatus = String(p.paymentStatus || p.status || p.paymentVerificationStatus || '').toUpperCase();
    
    // Explicitly exclude non-revenue states:
    // 1. Administrative duplicate activations / no-settlement records
    // 2. Refunds
    // 3. Failures, cancellations, voided entries
    // 4. Pending / unverified requests
    if (
      rawStatus.includes('DUPLICATE') ||
      rawStatus.includes('NO_SETTLEMENT') ||
      rawStatus.includes('REFUND') ||
      rawStatus.includes('FAIL') ||
      rawStatus.includes('CANCEL') ||
      rawStatus.includes('VOID') ||
      rawStatus.includes('PENDING') ||
      Boolean(p.isDuplicate) ||
      Boolean(p.isDuplicateAdminActivation)
    ) {
      continue;
    }

    // Only count confirmed positive settlements
    if (rawStatus === 'PAID' || rawStatus === 'VERIFIED' || rawStatus === 'CONFIRMED' || rawStatus === 'PURCHASE_APPROVED') {
      // Deduplicate by external reference if genuine non-empty reference is provided
      const txRef = String(p.transactionReference || p.transactionId || '').trim();
      if (txRef && txRef.toLowerCase() !== 'null' && txRef.toLowerCase() !== 'undefined' && txRef.length >= 4) {
        if (seenTxRefs.has(txRef)) continue;
        seenTxRefs.add(txRef);
      }

      const amt = Number(p.amountNPR || p.amount || p.planAmountNPR || 0);
      if (amt > 0) {
        totalNPR += amt;
      }
    }
  }
  return totalNPR;
}

/**
 * Authoritative Canonical User State Resolver
 * Single Source of Truth for Header, Dashboard, SuperAdmin, and backend APIs.
 */
export function resolveCanonicalUserState(params: {
  user?: any;
  membership?: any;
  memberships?: any[];
  payments?: any[];
  licenses?: any[];
  trial?: any;
  activeMembership?: any;
}): CanonicalUserState {
  const u = params.user || {};
  const mem = params.membership || params.activeMembership || u.membership || (Array.isArray(params.memberships) ? params.memberships.find((m: any) => m.userId === (u.id || u.userId) || (u.phone && m.phone && String(m.phone).replace(/\D/g, '').slice(-10) === String(u.phone).replace(/\D/g, '').slice(-10))) : null);
  const allMemberships = Array.isArray(params.memberships) ? params.memberships : (mem ? [mem] : (u.memberships || []));
  const payments = params.payments || u.payments || [];
  const licenses = params.licenses || u.licenses || [];
  const trial = params.trial || u.trial;

  const userId = String(u.id || u.userId || mem?.userId || 'unknown');
  const now = Date.now();

  // 1. Super Admin Check
  const isSuperAdmin = u.role === 'SUPER_ADMIN' || u.role === 'super_admin' || u.isSuperAdmin === true;
  if (isSuperAdmin) {
    return {
      userId,
      userCategory: 'professional',
      roleNameNepali: 'मुख्य प्रशासक (Super Admin)',
      isSuperAdmin: true,
      isStoreAdmin: false,
      isProfessional: true,
      isPaidMember: true,
      isTrialActive: false,
      isMembershipExpired: false,
      isPendingPayment: false,
      membershipStatus: 'ACTIVE',
      canonicalPlanId: 'super_admin',
      planNameNepali: 'सर्वोच्च प्रशासनिक पहुँच',
      confirmedPaymentAmountNPR: 0,
      totalConfirmedAmountPaidNPR: 0,
      isJyotishAllowed: true,
      isVastuAllowed: true,
      isProfessionalToolsAllowed: true,
      remainingDays: 99999,
      expiresAtISO: null,
      expiresAtTimestamp: null,
      isLifetime: true
    };
  }

  // 2. Store Admin Check
  const isStoreAdmin = u.role === 'STORE_ADMIN';
  if (isStoreAdmin) {
    return {
      userId,
      userCategory: 'visitor',
      roleNameNepali: 'व्यवस्थापक (Store Admin)',
      isSuperAdmin: false,
      isStoreAdmin: true,
      isProfessional: false,
      isPaidMember: false,
      isTrialActive: false,
      isMembershipExpired: false,
      isPendingPayment: false,
      membershipStatus: 'NONE',
      canonicalPlanId: null,
      planNameNepali: 'स्टोर व्यवस्थापक',
      confirmedPaymentAmountNPR: 0,
      totalConfirmedAmountPaidNPR: 0,
      isJyotishAllowed: false,
      isVastuAllowed: false,
      isProfessionalToolsAllowed: false,
      remainingDays: 0,
      expiresAtISO: null,
      expiresAtTimestamp: null,
      isLifetime: false
    };
  }

  // 3. Standalone Service Licenses Check (Jyotish / Vastu specific licenses)
  // CRITICAL RULE: A standalone license grants access to THAT service ONLY,
  // and MUST NEVER elevate userCategory to 'professional' or change role to 'व्यावसायिक सदस्य'!
  const hasJyotishLicense = Boolean(
    (u.jyotishAccess === true) ||
    (u.jyotishAccess && typeof u.jyotishAccess === 'object' && u.jyotishAccess.unlocked && (!u.jyotishAccess.expiresAtTimestamp || now < u.jyotishAccess.expiresAtTimestamp)) ||
    (Array.isArray(licenses) && licenses.some((l: any) => l.serviceKey === 'jyotish' && (l.status === 'unlocked' || l.status === 'active') && (!l.expiresAtTimestamp || now < l.expiresAtTimestamp)))
  );

  const hasVastuLicense = Boolean(
    (u.vastuAccess === true) ||
    (u.vastuAccess && typeof u.vastuAccess === 'object' && u.vastuAccess.unlocked && (!u.vastuAccess.expiresAtTimestamp || now < u.vastuAccess.expiresAtTimestamp)) ||
    (Array.isArray(licenses) && licenses.some((l: any) => l.serviceKey === 'vastu' && (l.status === 'unlocked' || l.status === 'active') && (!l.expiresAtTimestamp || now < l.expiresAtTimestamp)))
  );

  // 4. Calculate Total Confirmed Amount Paid from verified payment records
  let totalConfirmedAmountPaidNPR = calculateVerifiedLedgerRevenue(payments);

  // 5. Active Membership Resolution
  const rawPlanId = mem?.planId || u.subscriptionPlan;
  const canonicalPlan = resolveCanonicalPlan(rawPlanId);

  const memStatus = String(mem?.membershipStatus || mem?.status || '').toUpperCase();
  const isRevoked = memStatus === 'REVOKED' || memStatus === 'CANCELLED' || memStatus === 'TEST_REVOKED';

  // Expiry check
  let expiresAtTimestamp: number | null = null;
  let expiresAtISO: string | null = null;
  let isLifetime = false;

  if (canonicalPlan?.isLifetime || mem?.duration === 'lifetime') {
    isLifetime = true;
    expiresAtTimestamp = null;
    expiresAtISO = null;
  } else {
    if (mem?.expiresAtTimestamp) {
      expiresAtTimestamp = Number(mem.expiresAtTimestamp);
      expiresAtISO = mem.expiresAtISO || new Date(expiresAtTimestamp).toISOString();
    } else if (mem?.expiresAtISO) {
      expiresAtISO = mem.expiresAtISO;
      expiresAtTimestamp = new Date(mem.expiresAtISO).getTime();
    } else if (u.subscriptionExpiresAt) {
      expiresAtISO = u.subscriptionExpiresAt;
      expiresAtTimestamp = new Date(u.subscriptionExpiresAt).getTime();
    }
  }

  const isExpired = !isLifetime && expiresAtTimestamp !== null && expiresAtTimestamp <= now;

  // Payment confirmation check
  const pStatus = String(mem?.paymentStatus || u.paymentStatus || '').toLowerCase();
  const isPaymentConfirmed = pStatus === 'paid' || pStatus === 'verified' || mem?.cashVerified === true;
  const isApprovedByAdmin = Boolean(mem?.approvedBy || memStatus === 'ACTIVE' || memStatus === 'APPROVED' || memStatus === 'PURCHASE_APPROVED');
  const isPending = memStatus === 'PENDING_PAYMENT' || pStatus === 'pending' || pStatus === 'pending_approval' || (Array.isArray(payments) && payments.some((p: any) => String(p.status || p.paymentVerificationStatus || '').toUpperCase().includes('PENDING')));

  const hasConfirmedActiveMembership = !isRevoked && !isExpired && (isPaymentConfirmed || isApprovedByAdmin) && Boolean(canonicalPlan);

  // If totalConfirmedAmountPaidNPR wasn't computable because payments array wasn't provided, use verified membership amount
  if (totalConfirmedAmountPaidNPR === 0 && (!Array.isArray(payments) || payments.length === 0)) {
    if (isPaymentConfirmed || isApprovedByAdmin) {
      totalConfirmedAmountPaidNPR = Number(mem?.amountNPR || u.paymentAmountNPR || canonicalPlan?.priceNPR || 0);
    }
  }

  const confirmedPaymentAmountNPR = Number(mem?.amountNPR || u.paymentAmountNPR || (hasConfirmedActiveMembership ? (canonicalPlan?.priceNPR || 0) : 0));

  // Remaining days calculation
  let remainingDays = 0;
  if (isLifetime) {
    remainingDays = 99999;
  } else if (expiresAtTimestamp && expiresAtTimestamp > now) {
    remainingDays = Math.ceil((expiresAtTimestamp - now) / (24 * 60 * 60 * 1000));
  }

  // 6. State Routing based on Canonical Business Rules
  // A. Professional Membership (Paid & Confirmed pro_yearly or pro_lifetime)
  if (hasConfirmedActiveMembership && canonicalPlan?.tier === 'professional') {
    return {
      userId,
      userCategory: 'professional',
      roleNameNepali: 'व्यावसायिक सदस्य (Professional)',
      isSuperAdmin: false,
      isStoreAdmin: false,
      isProfessional: true,
      isPaidMember: true,
      isTrialActive: false,
      isMembershipExpired: false,
      isPendingPayment: false,
      membershipStatus: 'ACTIVE',
      canonicalPlanId: canonicalPlan.id,
      planNameNepali: canonicalPlan.nameNepali,
      confirmedPaymentAmountNPR,
      totalConfirmedAmountPaidNPR,
      isJyotishAllowed: true,
      isVastuAllowed: true,
      isProfessionalToolsAllowed: true,
      remainingDays,
      expiresAtISO,
      expiresAtTimestamp,
      isLifetime
    };
  }

  // B. Normal Membership (Paid & Confirmed normal_yearly or normal_lifetime)
  if (hasConfirmedActiveMembership && canonicalPlan?.tier === 'normal') {
    return {
      userId,
      userCategory: 'member',
      roleNameNepali: 'साधारण सदस्य (Member)',
      isSuperAdmin: false,
      isStoreAdmin: false,
      isProfessional: false,
      isPaidMember: true,
      isTrialActive: false,
      isMembershipExpired: false,
      isPendingPayment: false,
      membershipStatus: 'ACTIVE',
      canonicalPlanId: canonicalPlan.id,
      planNameNepali: canonicalPlan.nameNepali,
      confirmedPaymentAmountNPR,
      totalConfirmedAmountPaidNPR,
      // Normal members only have Jyotish/Vastu if they have standalone licenses
      isJyotishAllowed: hasJyotishLicense,
      isVastuAllowed: hasVastuLicense,
      isProfessionalToolsAllowed: false,
      remainingDays,
      expiresAtISO,
      expiresAtTimestamp,
      isLifetime
    };
  }

  // B2. Robust Fallback when user record contains verified category/plan without full membership row
  if (!isExpired && !isPending && !hasConfirmedActiveMembership) {
    if (u.userCategory === 'member' || u.membershipStatus === 'ACTIVE' || (u.paymentStatus === 'paid' && canonicalPlan?.tier === 'normal')) {
      return {
        userId,
        userCategory: 'member',
        roleNameNepali: 'साधारण सदस्य (Member)',
        isSuperAdmin: false,
        isStoreAdmin: false,
        isProfessional: false,
        isPaidMember: true,
        isTrialActive: false,
        isMembershipExpired: false,
        isPendingPayment: false,
        membershipStatus: 'ACTIVE',
        canonicalPlanId: canonicalPlan?.id || 'normal_yearly',
        planNameNepali: canonicalPlan?.nameNepali || 'सामान्य सदस्यता (१ वर्ष)',
        confirmedPaymentAmountNPR: confirmedPaymentAmountNPR || 100,
        totalConfirmedAmountPaidNPR: totalConfirmedAmountPaidNPR || 100,
        isJyotishAllowed: hasJyotishLicense,
        isVastuAllowed: hasVastuLicense,
        isProfessionalToolsAllowed: false,
        remainingDays: remainingDays || 365,
        expiresAtISO,
        expiresAtTimestamp,
        isLifetime
      };
    }
    if (u.userCategory === 'professional' && (!canonicalPlan || canonicalPlan.tier === 'professional')) {
      const isPaid = isPaymentConfirmed || isApprovedByAdmin || u.paymentStatus === 'paid';
      if (isPaid) {
        return {
          userId,
          userCategory: 'professional',
          roleNameNepali: 'व्यावसायिक सदस्य (Professional)',
          isSuperAdmin: false,
          isStoreAdmin: false,
          isProfessional: true,
          isPaidMember: true,
          isTrialActive: false,
          isMembershipExpired: false,
          isPendingPayment: false,
          membershipStatus: 'ACTIVE',
          canonicalPlanId: canonicalPlan?.id || 'pro_yearly',
          planNameNepali: canonicalPlan?.nameNepali || 'Professional सदस्यता (१ वर्ष)',
          confirmedPaymentAmountNPR: confirmedPaymentAmountNPR || 2000,
          totalConfirmedAmountPaidNPR: totalConfirmedAmountPaidNPR || 2000,
          isJyotishAllowed: true,
          isVastuAllowed: true,
          isProfessionalToolsAllowed: true,
          remainingDays: remainingDays || 365,
          expiresAtISO,
          expiresAtTimestamp,
          isLifetime
        };
      }
    }
  }

  // C. Expired Membership
  if (isExpired && canonicalPlan) {
    return {
      userId,
      userCategory: 'visitor',
      roleNameNepali: 'साधारण प्रयोगकर्ता (म्याद समाप्त)',
      isSuperAdmin: false,
      isStoreAdmin: false,
      isProfessional: false,
      isPaidMember: false,
      isTrialActive: false,
      isMembershipExpired: true,
      isPendingPayment: false,
      membershipStatus: 'EXPIRED',
      canonicalPlanId: canonicalPlan.id,
      planNameNepali: `${canonicalPlan.nameNepali} (समाप्त)`,
      confirmedPaymentAmountNPR,
      totalConfirmedAmountPaidNPR,
      isJyotishAllowed: hasJyotishLicense,
      isVastuAllowed: hasVastuLicense,
      isProfessionalToolsAllowed: false,
      remainingDays: 0,
      expiresAtISO,
      expiresAtTimestamp,
      isLifetime: false
    };
  }

  // D. Pending Payment Check
  if (isPending && canonicalPlan) {
    return {
      userId,
      userCategory: 'visitor',
      roleNameNepali: 'साधारण प्रयोगकर्ता (विजिटर)',
      isSuperAdmin: false,
      isStoreAdmin: false,
      isProfessional: false,
      isPaidMember: false,
      isTrialActive: false,
      isMembershipExpired: false,
      isPendingPayment: true,
      membershipStatus: 'PENDING_PAYMENT',
      canonicalPlanId: canonicalPlan.id,
      planNameNepali: `${canonicalPlan.nameNepali} (भुक्तानी बाँकी)`,
      confirmedPaymentAmountNPR: 0,
      totalConfirmedAmountPaidNPR,
      isJyotishAllowed: hasJyotishLicense,
      isVastuAllowed: hasVastuLicense,
      isProfessionalToolsAllowed: false,
      remainingDays: 0,
      expiresAtISO: null,
      expiresAtTimestamp: null,
      isLifetime: false
    };
  }

  // E. 48-Hour Free Trial Check
  const trialExpMs = trial?.trialExpiresAtTimestamp || (trial?.trialExpiresAtISO ? new Date(trial.trialExpiresAtISO).getTime() : 0);
  const isTrialActive = Boolean(trial?.isTrialActive && trialExpMs > now);
  if (isTrialActive) {
    const trialDays = Math.ceil((trialExpMs - now) / (24 * 60 * 60 * 1000));
    return {
      userId,
      userCategory: 'visitor',
      roleNameNepali: 'परीक्षण प्रयोगकर्ता (Trial)',
      isSuperAdmin: false,
      isStoreAdmin: false,
      isProfessional: false,
      isPaidMember: false,
      isTrialActive: true,
      isMembershipExpired: false,
      isPendingPayment: false,
      membershipStatus: 'ACTIVE',
      canonicalPlanId: 'trial_48h',
      planNameNepali: '४८ घण्टा निःशुल्क परीक्षण',
      confirmedPaymentAmountNPR: 0,
      totalConfirmedAmountPaidNPR,
      // Trial unlocks Panchanga and personal horoscope, NEVER professional tools
      isJyotishAllowed: hasJyotishLicense,
      isVastuAllowed: hasVastuLicense,
      isProfessionalToolsAllowed: false,
      remainingDays: trialDays,
      expiresAtISO: trial?.trialExpiresAtISO || new Date(trialExpMs).toISOString(),
      expiresAtTimestamp: trialExpMs,
      isLifetime: false
    };
  }

  // F. Default Visitor State (New user / Unpaid visitor / Jyotish-only user)
  return {
    userId,
    userCategory: 'visitor',
    roleNameNepali: 'साधारण प्रयोगकर्ता (विजिटर)',
    isSuperAdmin: false,
    isStoreAdmin: false,
    isProfessional: false,
    isPaidMember: false,
    isTrialActive: false,
    isMembershipExpired: false,
    isPendingPayment: false,
    membershipStatus: 'NONE',
    canonicalPlanId: null,
    planNameNepali: 'साधारण खाता (योजना छैन)',
    confirmedPaymentAmountNPR: 0,
    totalConfirmedAmountPaidNPR,
    isJyotishAllowed: hasJyotishLicense,
    isVastuAllowed: hasVastuLicense,
    isProfessionalToolsAllowed: false,
    remainingDays: 0,
    expiresAtISO: null,
    expiresAtTimestamp: null,
    isLifetime: false
  };
}

/**
 * Idempotent Canonical Renewal Extension Helper
 * Extends membership validity without premature truncation and records verified renewal payment.
 */
export function calculateCanonicalRenewalSchedule(
  currentExpiryOrOptions: number | null | undefined | {
    currentPlanId?: string;
    renewalPlanId?: string;
    currentExpiryTimestamp?: number | null;
    plan?: any;
    baseNowMs?: number;
  },
  planParam?: any,
  baseNowMsParam: number = Date.now()
): {
  newExpiresAtTimestamp: number | null;
  newExpiresAtISO: string | null;
  extensionDays: number;
  newExpiryTimestamp: number | null;
  extendedByDays: number;
  feeNPR: number;
} {
  let currentExpiryTimestamp: number | null | undefined;
  let plan: CanonicalPlanConfig | null = null;
  let baseNowMs = baseNowMsParam;

  if (typeof currentExpiryOrOptions === 'object' && currentExpiryOrOptions !== null) {
    currentExpiryTimestamp = currentExpiryOrOptions.currentExpiryTimestamp;
    const planId = currentExpiryOrOptions.renewalPlanId || currentExpiryOrOptions.currentPlanId;
    plan = currentExpiryOrOptions.plan || resolveCanonicalPlan(planId);
    if (currentExpiryOrOptions.baseNowMs) baseNowMs = currentExpiryOrOptions.baseNowMs;
  } else {
    currentExpiryTimestamp = currentExpiryOrOptions as number | null | undefined;
    plan = planParam;
  }

  if (!plan) {
    plan = CANONICAL_MEMBERSHIP_PLANS.normal_yearly;
  }

  if (plan.isLifetime) {
    return {
      newExpiresAtTimestamp: null,
      newExpiresAtISO: null,
      extensionDays: 99999,
      newExpiryTimestamp: null,
      extendedByDays: 99999,
      feeNPR: plan.priceNPR
    };
  }

  // If current membership is still active, extend from existing expiry date!
  // If already expired, start from current timestamp.
  const currentBase = currentExpiryTimestamp && currentExpiryTimestamp > baseNowMs
    ? currentExpiryTimestamp
    : baseNowMs;

  const days = plan.durationDays || 365;
  const extensionMs = days * 24 * 60 * 60 * 1000;
  const newExpiresAtTimestamp = currentBase + extensionMs;

  return {
    newExpiresAtTimestamp,
    newExpiresAtISO: new Date(newExpiresAtTimestamp).toISOString(),
    extensionDays: days,
    newExpiryTimestamp: newExpiresAtTimestamp,
    extendedByDays: days,
    feeNPR: plan.priceNPR
  };
}
