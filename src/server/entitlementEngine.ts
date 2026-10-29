/**
 * Centralized Server-Authoritative Entitlement Engine
 * Balananda Vaidik Sewa
 * 
 * Defines the complete 8-state user lifecycle and maps each state to exact
 * permissions, accessible navigation tabs, and service authorizations.
 */

export type UserLifecycleState =
  | 'ANONYMOUS_VISITOR'
  | 'REGISTERED_USER'
  | 'TRIAL_USER'
  | 'NORMAL_MEMBER'
  | 'PROFESSIONAL_MEMBER'
  | 'EXPIRED_MEMBER'
  | 'PURCHASE_PENDING'
  | 'SUPER_ADMIN';

export interface UserEntitlement {
  lifecycleState: UserLifecycleState;
  stateNepali: string;
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
  hasActiveMembership: boolean;
  isTrialActive: boolean;
  isExpired: boolean;
  isPendingPayment: boolean;
  planNameNepali: string;
  allowedServices: Array<'panchanga' | 'jyotish' | 'vastu' | 'karmakanda' | 'personal_faladesh' | 'professional_tools'>;
  isJyotishAllowed: boolean;
  isVastuAllowed: boolean;
  isProfessionalToolsAllowed: boolean;
  isMemberDashboardAllowed: boolean;
  canAccessPersonalFaladesh: boolean;
  remainingDays: number;
  expiresAtBS?: string | null;
  messageNepali: string;
  allowedNavTabs: string[];
}

export const VISITOR_PUBLIC_TABS = [
  'home',
  'panchanga',
  'sewa',
  'calendar',
  'samachar',
  'date_converter',
  'org_profile',
  'app_download',
  'books_download',
  'media_download',
  'membership',
  'kharedi',
  'vivah',
  'yajaman'
];

export const REGISTERED_BASE_TABS = [
  ...VISITOR_PUBLIC_TABS,
  'user_dashboard',
  'settings'
];

export const PROFESSIONAL_SERVICE_TABS = [
  ...REGISTERED_BASE_TABS,
  'jyotishi',
  'vastu',
  'kundali',
  'dasha',
  'aarje',
  'neema',
  'kp',
  'muhurta',
  'anka',
  'apply_expert'
];

/**
 * Server-authoritative resolution of user entitlement
 */
export function resolveUserEntitlement(params: {
  userId?: string;
  phone?: string;
  user?: any;
  membership?: any;
  trial?: any;
  userLicenses?: any[];
  isSuperAdmin?: boolean;
}): UserEntitlement {
  // 1. Super Admin: Unrestricted Full Authority
  if (params.isSuperAdmin || params.user?.role === 'SUPER_ADMIN') {
    return {
      lifecycleState: 'SUPER_ADMIN',
      stateNepali: 'मुख्य प्रशासक (Super Admin)',
      isSuperAdmin: true,
      isAuthenticated: true,
      hasActiveMembership: true,
      isTrialActive: false,
      isExpired: false,
      isPendingPayment: false,
      planNameNepali: 'सर्वोच्च प्रशासनिक पहुँच',
      allowedServices: ['panchanga', 'jyotish', 'vastu', 'karmakanda', 'personal_faladesh', 'professional_tools'],
      isJyotishAllowed: true,
      isVastuAllowed: true,
      isProfessionalToolsAllowed: true,
      isMemberDashboardAllowed: true,
      canAccessPersonalFaladesh: true,
      remainingDays: 99999,
      expiresAtBS: 'आजीवन',
      messageNepali: 'सुपरएडमिन पूर्ण प्रशासनिक पहुँच सक्रिय छ।',
      allowedNavTabs: [...PROFESSIONAL_SERVICE_TABS, 'admin']
    };
  }

  // 2. Anonymous Visitor
  if (!params.user && !params.userId && !params.phone) {
    return {
      lifecycleState: 'ANONYMOUS_VISITOR',
      stateNepali: 'अज्ञात आगन्तुक (Anonymous Visitor)',
      isSuperAdmin: false,
      isAuthenticated: false,
      hasActiveMembership: false,
      isTrialActive: false,
      isExpired: false,
      isPendingPayment: false,
      planNameNepali: 'साधारण खाता (योजना छैन)',
      allowedServices: ['panchanga'],
      isJyotishAllowed: false,
      isVastuAllowed: false,
      isProfessionalToolsAllowed: false,
      isMemberDashboardAllowed: false,
      canAccessPersonalFaladesh: false,
      remainingDays: 0,
      expiresAtBS: null,
      messageNepali: 'सार्वजनिक सेवाहरू मात्र उपलब्ध छन्। व्यक्तिगत सेवाका लागि लगइन वा दर्ता गर्नुहोस्।',
      allowedNavTabs: VISITOR_PUBLIC_TABS
    };
  }

  const u = params.user || {};
  const m = params.membership || (params as any).activeMembership;
  const trial = params.trial || u.trial;
  const userLicenses = params.userLicenses || (params as any).licenses || [];

  const hasSpecificJyotish = Boolean(
    u?.jyotishAccess === true ||
    (u?.jyotishAccess && typeof u.jyotishAccess === 'object' && u.jyotishAccess.unlocked && (!u.jyotishAccess.expiresAtTimestamp || Date.now() < u.jyotishAccess.expiresAtTimestamp)) ||
    (Array.isArray(userLicenses) && userLicenses.some((l: any) => l.serviceKey === 'jyotish' && (l.status === 'unlocked' || l.status === 'active') && (!l.expiresAtTimestamp || Date.now() < l.expiresAtTimestamp)))
  );
  const hasSpecificVastu = Boolean(
    u?.vastuAccess === true ||
    (u?.vastuAccess && typeof u.vastuAccess === 'object' && u.vastuAccess.unlocked && (!u.vastuAccess.expiresAtTimestamp || Date.now() < u.vastuAccess.expiresAtTimestamp)) ||
    (Array.isArray(userLicenses) && userLicenses.some((l: any) => l.serviceKey === 'vastu' && (l.status === 'unlocked' || l.status === 'active') && (!l.expiresAtTimestamp || Date.now() < l.expiresAtTimestamp)))
  );

  // 3. Active Paid Membership Check
  const mStatus = m?.membershipStatus || m?.status;
  const isRevokedOrVoid = mStatus === 'TEST_REVOKED' || mStatus === 'REVOKED' || mStatus === 'CANCELLED' || mStatus === 'TEST_COMPLETED_REVERTED' || mStatus === 'VOIDED_TEST';
  const isMemActive = !isRevokedOrVoid && (
    mStatus === 'ACTIVE' || 
    mStatus === 'PURCHASE_APPROVED' || 
    mStatus === 'APPROVED' || 
    (!m && u.subscriptionExpiresAt && new Date(u.subscriptionExpiresAt).getTime() > Date.now())
  );
  if (!isRevokedOrVoid && (m || u.subscriptionExpiresAt) && isMemActive) {
    const mem = m || {
      planId: u.subscriptionPlan || 'yearly_both',
      planNameNepali: u.subscriptionPlan || '१ वर्ष मोबाइल + कम्प्युटर',
      duration: '1_year',
      devices: 'both',
      expiresAtISO: u.subscriptionExpiresAt,
      expiresAtBS: u.jyotishAccess?.expiresAtBS
    };
    const isLifetime = mem.duration === 'lifetime';
    const planIdStr = String(mem.planId || '').toLowerCase();
    const isProfessional = u.userCategory === 'professional' ||
      mem.tier === 'professional' ||
      mem.planType === 'PROFESSIONAL' ||
      planIdStr.startsWith('pro_') ||
      planIdStr.includes('professional') ||
      planIdStr === 'yearly_both' ||
      planIdStr === 'lifetime_both';

    const now = Date.now();
    const expiryTime = mem.expiresAtTimestamp || (mem.expiresAtISO ? new Date(mem.expiresAtISO).getTime() : (mem.validUntilISO ? new Date(mem.validUntilISO).getTime() : (u.subscriptionExpiresAt ? new Date(u.subscriptionExpiresAt).getTime() : undefined)));
    const remainingMs = expiryTime ? expiryTime - now : Infinity;
    const remainingDays = isLifetime ? 99999 : Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));

    if (isProfessional) {
      const planAllowsJyotish = !planIdStr.includes('vastu_only') && !planIdStr.includes('only_vastu');
      const planAllowsVastu = !planIdStr.includes('jyotish_only') && !planIdStr.includes('only_jyotish');
      const isJyotish = planAllowsJyotish || hasSpecificJyotish;
      const isVastu = planAllowsVastu || hasSpecificVastu;

      const proServices: Array<'panchanga' | 'jyotish' | 'vastu' | 'karmakanda' | 'personal_faladesh' | 'professional_tools'> = ['panchanga', 'personal_faladesh'];
      if (isJyotish) proServices.push('jyotish');
      if (isVastu) proServices.push('vastu');
      if (isJyotish || isVastu) proServices.push('professional_tools', 'karmakanda');

      const proTabs = [...REGISTERED_BASE_TABS];
      if (isJyotish) proTabs.push('jyotishi', 'kundali', 'dasha', 'aarje', 'neema', 'kp', 'muhurta', 'anka');
      if (isVastu) proTabs.push('vastu');
      if (isJyotish || isVastu) proTabs.push('apply_expert');

      return {
        lifecycleState: 'PROFESSIONAL_MEMBER',
        stateNepali: 'पेशागत सदस्य (Professional Member)',
        isSuperAdmin: false,
        isAuthenticated: true,
        hasActiveMembership: true,
        isTrialActive: false,
        isExpired: false,
        isPendingPayment: false,
        planNameNepali: mem.planNameNepali || 'पेशागत सदस्यता (प्रो)',
        allowedServices: proServices,
        isJyotishAllowed: isJyotish,
        isVastuAllowed: isVastu,
        isProfessionalToolsAllowed: isJyotish && isVastu,
        isMemberDashboardAllowed: true,
        canAccessPersonalFaladesh: true,
        remainingDays,
        expiresAtBS: mem.expiresAtBS || (isLifetime ? 'आजीवन' : null),
        messageNepali: `${mem.planNameNepali || 'पेशागत सदस्यता'} सक्रिय छ। पेशागत ज्योतिष तथा वास्तु सेवाहरू उपलब्ध छन्।`,
        allowedNavTabs: proTabs
      };
    }


    const normalServices: Array<'panchanga' | 'jyotish' | 'vastu' | 'karmakanda' | 'personal_faladesh' | 'professional_tools'> = ['panchanga', 'personal_faladesh'];
    const normalTabs = [...REGISTERED_BASE_TABS];
    if (hasSpecificJyotish) {
      normalServices.push('jyotish');
      normalTabs.push('jyotishi', 'kundali', 'dasha');
    }
    if (hasSpecificVastu) {
      normalServices.push('vastu');
      normalTabs.push('vastu');
    }

    return {
      lifecycleState: 'NORMAL_MEMBER',
      stateNepali: 'साधारण सशुल्क सदस्य (Normal Member)',
      isSuperAdmin: false,
      isAuthenticated: true,
      hasActiveMembership: true,
      isTrialActive: false,
      isExpired: false,
      isPendingPayment: false,
      planNameNepali: mem.planNameNepali || 'साधारण सदस्यता योजना',
      allowedServices: normalServices,
      isJyotishAllowed: hasSpecificJyotish,
      isVastuAllowed: hasSpecificVastu,
      isProfessionalToolsAllowed: hasSpecificJyotish && hasSpecificVastu,
      isMemberDashboardAllowed: true,
      canAccessPersonalFaladesh: true,
      remainingDays,
      expiresAtBS: mem.expiresAtBS,
      messageNepali: `${mem.planNameNepali || 'साधारण सदस्यता'} सक्रिय छ। व्यक्तिगत राशिफल तथा कुण्डली फलादेश उपलब्ध छ।`,
      allowedNavTabs: normalTabs
    };
  }

  // 4. Exactly 48-Hour Free Trial (from server registration timestamp)
  const trialExpiryTime = trial?.trialExpiresAtTimestamp ||
    (trial?.trialExpiresAtISO ? new Date(trial.trialExpiresAtISO).getTime() : 0) ||
    (u?.trialExpiresAtISO ? new Date(u.trialExpiresAtISO).getTime() : 0) ||
    (u?.trialStartedAtISO ? new Date(u.trialStartedAtISO).getTime() + 48 * 3600 * 1000 : 0);

  const isTrialWindowValid = trialExpiryTime > 0 && Date.now() < trialExpiryTime;

  if (isTrialWindowValid) {
    const remainingHours = Math.max(0, Math.ceil((trialExpiryTime - Date.now()) / (3600 * 1000)));
    return {
      lifecycleState: 'TRIAL_USER',
      stateNepali: '४८ घण्टे निःशुल्क परीक्षण (Trial User)',
      isSuperAdmin: false,
      isAuthenticated: true,
      hasActiveMembership: true,
      isTrialActive: true,
      isExpired: false,
      isPendingPayment: false,
      planNameNepali: '४८ घण्टा निःशुल्क परीक्षण',
      allowedServices: hasSpecificJyotish || hasSpecificVastu
        ? ['panchanga', 'personal_faladesh', ...(hasSpecificJyotish ? ['jyotish' as const] : []), ...(hasSpecificVastu ? ['vastu' as const] : [])]
        : ['panchanga', 'personal_faladesh'],
      isJyotishAllowed: hasSpecificJyotish,
      isVastuAllowed: hasSpecificVastu,
      isProfessionalToolsAllowed: false,
      isMemberDashboardAllowed: true,
      canAccessPersonalFaladesh: true,
      remainingDays: Math.max(1, Math.ceil(remainingHours / 24)),
      expiresAtBS: '४८ घण्टा',
      messageNepali: `४८ घण्टे निःशुल्क परीक्षण सक्रिय छ (बाँकी करिब ${remainingHours} घण्टा)। सामान्य सदस्य सुविधाहरू उपलब्ध छन्।`,
      allowedNavTabs: hasSpecificJyotish || hasSpecificVastu
        ? [...REGISTERED_BASE_TABS, ...(hasSpecificJyotish ? ['jyotishi', 'kundali', 'dasha'] : []), ...(hasSpecificVastu ? ['vastu'] : [])]
        : [...REGISTERED_BASE_TABS]
    };
  }

  // 5. Expired Membership / Trial (Gated Personal Faladesh!)
  const isTrialActuallyExpired = (trialExpiryTime > 0 && Date.now() >= trialExpiryTime) ||
    (trial && trial.hasUsedTrial && !trial.isTrialActive) ||
    (m && (m.membershipStatus === 'EXPIRED' || m.status === 'EXPIRED')) ||
    (u?.subscriptionExpiresAt && new Date(u.subscriptionExpiresAt).getTime() <= Date.now());

  if (isTrialActuallyExpired) {
    return {
      lifecycleState: 'EXPIRED_MEMBER',
      stateNepali: 'म्याद सकिएको सदस्य (Trial/Membership Expired)',
      isSuperAdmin: false,
      isAuthenticated: true,
      hasActiveMembership: false,
      isTrialActive: false,
      isExpired: true,
      isPendingPayment: false,
      planNameNepali: m?.planNameNepali || 'म्याद सकिएको योजना',
      allowedServices: ['panchanga'], // Gated! No personal_faladesh when trial expired without payment
      isJyotishAllowed: false,
      isVastuAllowed: false,
      isProfessionalToolsAllowed: false,
      isMemberDashboardAllowed: true,
      canAccessPersonalFaladesh: false, // Strictly false: Gated upgrade screen!
      remainingDays: 0,
      expiresAtBS: m?.expiresAtBS,
      messageNepali: 'तपाईंको ४८ घण्टे निःशुल्क परीक्षण म्याद समाप्त भएको छ। व्यक्तिगत फलादेश तथा थप सेवाहरूको लागि कृपया सदस्यता लिनुहोस्।',
      allowedNavTabs: REGISTERED_BASE_TABS
    };
  }

  // 6. Purchase Request Pending Approval
  if (m?.membershipStatus === 'PENDING_PAYMENT' || m?.status === 'PURCHASE_PENDING' || u.paymentStatus === 'pending_approval') {
    return {
      lifecycleState: 'PURCHASE_PENDING',
      stateNepali: 'खरिद रुजु हुन बाँकी (Purchase Pending)',
      isSuperAdmin: false,
      isAuthenticated: true,
      hasActiveMembership: false,
      isTrialActive: false,
      isExpired: false,
      isPendingPayment: true,
      planNameNepali: m?.planNameNepali || u.subscriptionPlan || 'भुक्तानी रुजु हुँदै',
      allowedServices: ['panchanga', 'personal_faladesh'],
      isJyotishAllowed: false,
      isVastuAllowed: false,
      isProfessionalToolsAllowed: false,
      isMemberDashboardAllowed: true,
      canAccessPersonalFaladesh: true,
      remainingDays: 0,
      expiresAtBS: null,
      messageNepali: 'तपाईंको सदस्यता खरिद अनुरोध प्राप्त भएको छ। प्रशासकद्वारा रुजु भएपछि तत्काल सेवाहरू खुल्नेछन्।',
      allowedNavTabs: REGISTERED_BASE_TABS
    };
  }

  // 7. Normal Registered User Without Paid Plan (Visitor Account)
  const regServices: Array<'panchanga' | 'jyotish' | 'vastu' | 'karmakanda' | 'personal_faladesh' | 'professional_tools'> = ['panchanga', 'personal_faladesh'];
  const regTabs = [...REGISTERED_BASE_TABS];
  if (hasSpecificJyotish) {
    regServices.push('jyotish');
    regTabs.push('jyotishi', 'kundali', 'dasha');
  }
  if (hasSpecificVastu) {
    regServices.push('vastu');
    regTabs.push('vastu');
  }

  return {
    lifecycleState: 'REGISTERED_USER',
    stateNepali: 'दर्ता भएको प्रयोगकर्ता (Registered User)',
    isSuperAdmin: false,
    isAuthenticated: true,
    hasActiveMembership: false,
    isTrialActive: false,
    isExpired: false,
    isPendingPayment: false,
    planNameNepali: 'साधारण खाता (योजना छैन)',
    allowedServices: regServices,
    isJyotishAllowed: hasSpecificJyotish,
    isVastuAllowed: hasSpecificVastu,
    isProfessionalToolsAllowed: hasSpecificJyotish && hasSpecificVastu,
    isMemberDashboardAllowed: true,
    canAccessPersonalFaladesh: true,
    remainingDays: 0,
    expiresAtBS: null,
    messageNepali: 'तपाईंको साधारण खाता सक्रिय छ। थप सेवाहरूको लागि सदस्यता लिनुहोस्।',
    allowedNavTabs: regTabs
  };
}
