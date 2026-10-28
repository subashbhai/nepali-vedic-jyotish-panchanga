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
  const m = params.membership;
  const trial = params.trial || u.trial;

  // 3. Active Paid Membership Check
  const mStatus = m?.membershipStatus || m?.status;
  const isMemActive = mStatus === 'ACTIVE' || mStatus === 'PURCHASE_APPROVED' || mStatus === 'APPROVED' || (u.subscriptionExpiresAt && new Date(u.subscriptionExpiresAt).getTime() > Date.now());
  if ((m || u.subscriptionExpiresAt) && isMemActive) {
    const mem = m || {
      planId: u.subscriptionPlan || 'yearly_both',
      planNameNepali: u.subscriptionPlan || '१ वर्ष मोबाइल + कम्प्युटर',
      duration: '1_year',
      devices: 'both',
      expiresAtISO: u.subscriptionExpiresAt,
      expiresAtBS: u.jyotishAccess?.expiresAtBS
    };
    const isLifetime = mem.duration === 'lifetime';
    const isBothPlan = mem.devices === 'both' || (mem.planId && String(mem.planId).includes('both'));
    const isProfessional = isBothPlan || u.userCategory === 'professional' || mem.planType === 'PROFESSIONAL' || mem.tier === 'professional' || (mem.planId && String(mem.planId).includes('pro'));

    const now = Date.now();
    const expiryTime = mem.expiresAtTimestamp || (mem.expiresAtISO ? new Date(mem.expiresAtISO).getTime() : (u.subscriptionExpiresAt ? new Date(u.subscriptionExpiresAt).getTime() : undefined));
    const remainingMs = expiryTime ? expiryTime - now : Infinity;
    const remainingDays = isLifetime ? 99999 : Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));

    if (isProfessional) {
      return {
        lifecycleState: 'PROFESSIONAL_MEMBER',
        stateNepali: 'व्यावसायिक सदस्य (Professional Member)',
        isSuperAdmin: false,
        isAuthenticated: true,
        hasActiveMembership: true,
        isTrialActive: false,
        isExpired: false,
        isPendingPayment: false,
        planNameNepali: mem.planNameNepali || 'व्यावसायिक योजना',
        allowedServices: ['panchanga', 'jyotish', 'vastu', 'karmakanda', 'personal_faladesh', 'professional_tools'],
        isJyotishAllowed: true,
        isVastuAllowed: true,
        isProfessionalToolsAllowed: true,
        isMemberDashboardAllowed: true,
        canAccessPersonalFaladesh: true,
        remainingDays,
        expiresAtBS: mem.expiresAtBS || (isLifetime ? 'आजीवन' : null),
        messageNepali: `${mem.planNameNepali || 'व्यावसायिक योजना'} सक्रिय छ। सम्पूर्ण सुविधाहरू खुला छन्।`,
        allowedNavTabs: PROFESSIONAL_SERVICE_TABS
      };
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
      planNameNepali: mem.planNameNepali || 'साधारण सदस्य योजना',
      allowedServices: ['panchanga', 'jyotish', 'vastu', 'personal_faladesh'],
      isJyotishAllowed: true,
      isVastuAllowed: true,
      isProfessionalToolsAllowed: false,
      isMemberDashboardAllowed: true,
      canAccessPersonalFaladesh: true,
      remainingDays,
      expiresAtBS: mem.expiresAtBS,
      messageNepali: `${mem.planNameNepali || 'साधारण सदस्य योजना'} सक्रिय छ।`,
      allowedNavTabs: REGISTERED_BASE_TABS
    };
  }

  // 4. Active 24-Hour Free Trial
  if (trial && trial.isTrialActive && trial.trialExpiresAtTimestamp && Date.now() < trial.trialExpiresAtTimestamp) {
    const remainingHours = Math.max(0, Math.ceil((trial.trialExpiresAtTimestamp - Date.now()) / (3600 * 1000)));
    return {
      lifecycleState: 'TRIAL_USER',
      stateNepali: '२४ घण्टे निःशुल्क परीक्षण (Trial User)',
      isSuperAdmin: false,
      isAuthenticated: true,
      hasActiveMembership: true,
      isTrialActive: true,
      isExpired: false,
      isPendingPayment: false,
      planNameNepali: '२४ घण्टा निःशुल्क परीक्षण',
      allowedServices: ['panchanga', 'jyotish', 'vastu', 'personal_faladesh'],
      isJyotishAllowed: true,
      isVastuAllowed: true,
      isProfessionalToolsAllowed: false,
      isMemberDashboardAllowed: true,
      canAccessPersonalFaladesh: true,
      remainingDays: 1,
      expiresAtBS: trial.startedAtBS ? `${trial.startedAtBS} (२४ घण्टा)` : '२४ घण्टा',
      messageNepali: `२४ घण्टे निःशुल्क परीक्षण सक्रिय छ (बाँकी करिब ${remainingHours} घण्टा)।`,
      allowedNavTabs: REGISTERED_BASE_TABS
    };
  }

  // 5. Expired Membership / Trial
  if ((m && m.membershipStatus === 'EXPIRED') || (trial && trial.hasUsedTrial && !trial.isTrialActive)) {
    return {
      lifecycleState: 'EXPIRED_MEMBER',
      stateNepali: 'म्याद सकिएको सदस्य (Expired Member)',
      isSuperAdmin: false,
      isAuthenticated: true,
      hasActiveMembership: false,
      isTrialActive: false,
      isExpired: true,
      isPendingPayment: false,
      planNameNepali: m?.planNameNepali || 'म्याद सकिएको योजना',
      allowedServices: ['panchanga', 'personal_faladesh'],
      isJyotishAllowed: false,
      isVastuAllowed: false,
      isProfessionalToolsAllowed: false,
      isMemberDashboardAllowed: true,
      canAccessPersonalFaladesh: true,
      remainingDays: 0,
      expiresAtBS: m?.expiresAtBS,
      messageNepali: 'तपाईंको सदस्यता वा परीक्षण म्याद समाप्त भएको छ। कृपया सेवा नवीकरण गर्नुहोस्।',
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
    allowedServices: ['panchanga', 'personal_faladesh'],
    isJyotishAllowed: false,
    isVastuAllowed: false,
    isProfessionalToolsAllowed: false,
    isMemberDashboardAllowed: true,
    canAccessPersonalFaladesh: true,
    remainingDays: 0,
    expiresAtBS: null,
    messageNepali: 'तपाईंको साधारण खाता सक्रिय छ। थप सेवाहरूको लागि सदस्यता लिनुहोस्।',
    allowedNavTabs: REGISTERED_BASE_TABS
  };
}
