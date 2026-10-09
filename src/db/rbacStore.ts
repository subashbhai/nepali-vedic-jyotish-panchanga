import { convertADToBS } from '../utils/nepaliCalendar';
import { verifyPassword } from '../utils/cryptoUtils';
import { BirthDetails } from '../types/astrology';
import { verifyClientMobileLogin, getClientPolicyByMobile } from './menuControlStore';
import { authenticateUnifiedUser } from './unifiedSecurityBridge';

export type SystemRole = 'CUSTOMER' | 'POS_STAFF' | 'STORE_ADMIN' | 'SUPER_ADMIN' | 'MARRIAGE_USER' | 'MARRIAGE_MODERATOR' | 'NEWS_EDITOR';

export type AccountStatus = 'active' | 'pending' | 'rejected' | 'suspended' | 'disabled';

export interface SavedAddress {
  id: string;
  title: string; // e.g. 'घर', 'कार्यालय'
  fullName: string;
  phone: string;
  district: string;
  localLevel: string;
  ward: string;
  streetAddress: string;
  isDefault: boolean;
}

export interface RBACUser {
  id: string;
  username: string; // Mobile or username
  phone: string;
  email?: string;
  fullName: string;
  passwordHash: string;
  role: SystemRole;
  roleNameNepali: string;
  status: AccountStatus;
  statusReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  customerId?: string; // Auto-generated e.g. BAL-YJM-2081-0042
  savedAddresses?: SavedAddress[];
  permissions: string[];
  createdAtISO: string;
  createdAtBS: string;
  lastLoginISO?: string;
  lastLoginBS?: string;
  mobileVerified: boolean;
  emailVerified: boolean;
  storeAssigned?: string;
  birthProfileId?: string;
  birthDetails?: BirthDetails;
}

export interface RBACSession {
  token: string;
  userId: string;
  username: string;
  fullName: string;
  role: SystemRole;
  roleNameNepali: string;
  status: AccountStatus;
  permissions: string[];
  customerId?: string;
  birthProfileId?: string;
  birthDetails?: BirthDetails;
  createdAtISO: string;
  lastActivityISO: string;
}

export interface RBACAuditLog {
  id: string;
  userId: string;
  username: string;
  role: SystemRole;
  action: string;
  module: 'AUTH' | 'POS' | 'INVENTORY' | 'STORE' | 'SUPER_ADMIN' | 'CUSTOMER';
  target: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  timestampISO: string;
  timestampBS: string;
  ipDeviceInfo?: string;
}

export interface RBACApprovalRequest {
  id: string;
  userId: string;
  fullName: string;
  role: SystemRole;
  phone: string;
  email?: string;
  requestDateBS: string;
  status: AccountStatus;
  notes?: string;
  reviewedBy?: string;
  reviewedAtBS?: string;
  rejectionOrSuspensionReason?: string;
}

const STORAGE_KEYS = {
  USERS: 'balananda_rbac_users_v2',
  SESSION: 'balananda_rbac_session_v2',
  AUDIT_LOGS: 'balananda_rbac_audit_logs_v2',
  FAILED_LOGINS: 'balananda_rbac_failed_logins_v2',
};

// Default Granular Permissions Definition
export const DEFAULT_ROLE_PERMISSIONS: Record<SystemRole, string[]> = {
  CUSTOMER: [
    'store.view',
    'cart.manage',
    'orders.place',
    'orders.view_own',
    'profile.edit',
    'address.manage',
    'marriage.profile.view',
    'marriage.profile.create',
    'marriage.profile.edit',
    'marriage.requests.send',
    'marriage.messages.send',
    'marriage.ads.create',
    'marriage.favorites.manage'
  ],
  MARRIAGE_USER: [
    'marriage.profile.view',
    'marriage.profile.create',
    'marriage.profile.edit',
    'marriage.requests.send',
    'marriage.messages.send',
    'marriage.ads.create',
    'marriage.favorites.manage',
    'profile.edit'
  ],
  MARRIAGE_MODERATOR: [
    'marriage.profile.view',
    'marriage.profiles.verify',
    'marriage.ads.approve',
    'marriage.reports.manage',
    'marriage.requests.moderate',
    'marriage.audit.view',
    'audit.view'
  ],
  NEWS_EDITOR: [
    'news.view',
    'news.create',
    'news.edit',
    'news.delete',
    'news.publish',
    'news.breaking',
    'news.analytics'
  ],
  POS_STAFF: [
    'store.view',
    'pos.billing',
    'pos.shift',
    'pos.view_orders',
    'pos.search_products',
    'pos.register_customer',
    'pos.thermal_print',
    'inventory.view',
    'orders.update_status'
  ],
  STORE_ADMIN: [
    'store.view',
    'products.manage',
    'inventory.manage',
    'orders.manage',
    'payments.verify',
    'reports.view',
    'pos.manage',
    'coupons.manage',
    'store.settings',
    'customers.view'
  ],
  SUPER_ADMIN: [
    '*',
    'users.approve',
    'users.manage_roles',
    'users.suspend',
    'audit.view',
    'system.config'
  ]
};

// Default Initial Accounts - Zero members by default
export const INITIAL_SEED_USERS: RBACUser[] = [];

const PURGE_FLAG_KEY = 'balananda_members_purged_zero_v3';

/**
 * Reset all demo/logged-in members to zero and deactivate active yearly licenses
 */
export function purgeAllMembersAndLicenses(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, '[]');
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem('balananda_rbac_active_session_v1');
    localStorage.setItem('balananda_client_leads_v2', '[]');
    localStorage.removeItem('balananda_approved_client_license_v2');
    localStorage.removeItem('software_full_access_unlocked_v1');
    localStorage.removeItem('balananda_software_full_access_license_v2');
    localStorage.removeItem('balananda_device_trial_lock_v2');
    localStorage.removeItem('sukdev_user_subscription_account_v1');
    localStorage.setItem(PURGE_FLAG_KEY, 'true');
    window.dispatchEvent(new CustomEvent('software-full-access-updated', { detail: { hasFullAccess: false } }));
    window.dispatchEvent(new CustomEvent('client-leads-updated', { detail: { leads: [] } }));
  } catch (e) {
    console.error('Failed to purge member data:', e);
  }
}

// Auto-run once in browser environment
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem(PURGE_FLAG_KEY) !== 'true') {
      purgeAllMembersAndLicenses();
    }
  } catch {}
}

// Helper: Get stored users
export function getStoredRBACUsers(): RBACUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      saveRBACUsers([]);
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse RBAC users:', e);
    return [];
  }
}

// Helper: Save users
export function saveRBACUsers(users: RBACUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save RBAC users:', e);
  }
}

// Helper: Get active session
export function getActiveRBACSession(): RBACSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    const session: RBACSession = JSON.parse(raw);

    // Verify session user status in DB for standard customer sessions
    const isSpecialAdminOrStaffSession =
      session.role === 'SUPER_ADMIN' ||
      session.role === 'STORE_ADMIN' ||
      session.role === 'POS_STAFF' ||
      session.role === 'MARRIAGE_MODERATOR' ||
      session.role === 'NEWS_EDITOR' ||
      session.userId?.includes('direct') ||
      session.userId?.includes('master') ||
      session.userId?.includes('override') ||
      session.userId?.includes('superadmin') ||
      session.token?.startsWith('BLN-');

    if (!isSpecialAdminOrStaffSession) {
      const allUsers = getStoredRBACUsers();
      const dbUser = allUsers.find(u => u.id === session.userId);
      
      if (!dbUser || dbUser.status !== 'active') {
        clearRBACSession();
        return null;
      }
    } else {
      // Ensure special user is also present in DB users to avoid foreign-key mismatches
      try {
        const allUsers = getStoredRBACUsers();
        if (!allUsers.some(u => u.id === session.userId)) {
          allUsers.push({
            id: session.userId,
            username: session.username,
            phone: '9800000000',
            fullName: session.fullName,
            passwordHash: 'direct_portal_auth',
            role: session.role,
            roleNameNepali: session.roleNameNepali,
            status: 'active',
            permissions: session.permissions,
            createdAtISO: session.createdAtISO || new Date().toISOString(),
            createdAtBS: '२०८१-०१-०१',
            mobileVerified: true,
            emailVerified: true
          });
          saveRBACUsers(allUsers);
        }
      } catch {}
    }

    // Check 24-hour session expiry
    const now = Date.now();
    const lastActive = new Date(session.lastActivityISO || session.createdAtISO).getTime();
    if (now - lastActive > 24 * 60 * 60 * 1000) {
      clearRBACSession();
      return null;
    }

    // Update last activity
    session.lastActivityISO = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    return session;
  } catch (e) {
    return null;
  }
}

export function setRBACSession(session: RBACSession): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to set RBAC session:', e);
  }
}

export function clearRBACSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  } catch (e) {
    console.error('Failed to clear RBAC session:', e);
  }
}

// Nepali Role Label mapping
export function getRoleLabelNepali(role: SystemRole): string {
  switch (role) {
    case 'CUSTOMER': return 'यजमान / ग्राहक';
    case 'POS_STAFF': return 'POS Staff / ग्राहक काउन्टर';
    case 'STORE_ADMIN': return 'Store Admin';
    case 'SUPER_ADMIN': return 'Super Admin';
    case 'MARRIAGE_USER': return 'विवाह सेवाग्राही (Marriage Member)';
    case 'MARRIAGE_MODERATOR': return 'विवाह सुपरभाइजर (Marriage Moderator)';
    case 'NEWS_EDITOR': return 'समाचार सम्पादक (News Editor)';
    default: return 'उपभोक्ता';
  }
}

export interface UserDashboardTarget {
  tab: string;
  labelNepali: string;
  descriptionNepali: string;
  badge: string;
  moduleType: 'store' | 'pos' | 'admin' | 'news' | 'vivah' | 'yajaman';
}

export function getUserDashboardTarget(role?: string): UserDashboardTarget {
  switch (role) {
    case 'STORE_ADMIN':
      return {
        tab: 'store_admin',
        labelNepali: 'वैदिक पसल स्टोर एडमिन ड्यासबोर्ड',
        descriptionNepali: 'सामग्री, अर्डर, भुक्तानी, PDF ग्रन्थ तथा अटो-कभर व्यवस्थापन',
        badge: 'Store Admin',
        moduleType: 'store',
      };
    case 'POS_STAFF':
      return {
        tab: 'pos',
        labelNepali: 'काउन्टर POS बिलिङ टर्मिनल',
        descriptionNepali: 'काउन्टर प्रत्यक्ष बिक्री, इनभ्वाइस तथा रसिद प्रिन्ट',
        badge: 'POS Terminal',
        moduleType: 'pos',
      };
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return {
        tab: 'admin_control',
        labelNepali: 'सुपरएडमिन नियन्त्रण कक्ष',
        descriptionNepali: 'खरिद आवेदन रुजु, प्रयोगकर्ता तथा प्रणाली नियन्त्रण',
        badge: 'Superadmin',
        moduleType: 'admin',
      };
    case 'NEWS_EDITOR':
      return {
        tab: 'news_editor',
        labelNepali: 'समाचार तथा लेख सम्पादक ड्यासबोर्ड',
        descriptionNepali: 'पञ्चाङ्ग, चाडपर्व, खगोल तथा ज्योतिष समाचार प्रकाशन',
        badge: 'News Editor',
        moduleType: 'news',
      };
    case 'MARRIAGE_MODERATOR':
      return {
        tab: 'vivah_admin',
        labelNepali: 'विवाह बायोडाटा सुपरभाइजर कक्ष',
        descriptionNepali: 'वैवाहिक प्रोफाइल प्रमाणीकरण तथा वर-वधु म्याचिङ',
        badge: 'Marriage Supervisor',
        moduleType: 'vivah',
      };
    case 'MARRIAGE_USER':
      return {
        tab: 'vivah',
        labelNepali: 'विवाह सेवा केन्द्र तथा प्रोफाइल',
        descriptionNepali: 'मेरो बायोडाटा, मिल्ने वर-वधु तथा प्रस्तावहरू',
        badge: 'Marriage Portal',
        moduleType: 'vivah',
      };
    case 'CUSTOMER':
    default:
      return {
        tab: 'yajaman',
        labelNepali: 'यजमान सेवा ड्यासबोर्ड',
        descriptionNepali: 'मेरो परामर्श, बुकिङ, चिना तथा अर्डरहरू',
        badge: 'Yajaman Portal',
        moduleType: 'yajaman',
      };
  }
}

// Auto Customer/User ID Generation
export function generateNextCustomerId(role: SystemRole): string {
  const users = getStoredRBACUsers();
  const yearBS = convertADToBS(new Date().toISOString().split('T')[0]).formattedBS.slice(0, 4);
  const count = users.filter(u => u.role === role).length + 1;
  const padCount = String(count).padStart(4, '0');
  
  let prefix = 'YJM';
  if (role === 'POS_STAFF') prefix = 'POS';
  if (role === 'STORE_ADMIN') prefix = 'STR';
  if (role === 'SUPER_ADMIN') prefix = 'ADM';
  if (role === 'MARRIAGE_USER') prefix = 'MRG';
  if (role === 'MARRIAGE_MODERATOR') prefix = 'MMD';
  if (role === 'NEWS_EDITOR') prefix = 'NWS';

  return `BAL-${prefix}-${yearBS}-${padCount}`;
}

export function registerRBACAccount(
  data: {
    fullName: string;
    phone: string;
    email?: string;
    password: string;
    role: SystemRole;
    address?: string;
    storeAssigned?: string;
    birthProfileId?: string;
    birthDetails?: BirthDetails;
  }
): { success: boolean; message: string; user?: RBACUser } {
  const users = getStoredRBACUsers();
  const cleanPhone = data.phone.trim();
  const cleanUsername = cleanPhone;

  if (users.some(u => u.phone === cleanPhone || u.username === cleanUsername)) {
    return {
      success: false,
      message: 'यो फोन नम्बर वा प्रयोगकर्ता नाम पहिले नै दर्ता भइसकेको छ।'
    };
  }

  if (data.role === 'SUPER_ADMIN') {
    return {
      success: false,
      message: 'सुरक्षा कारणले Super Admin खाता सर्वसाधारण दर्ताबाट सिर्जना गर्न मिल्दैन।'
    };
  }

  // Determine status: Customer & Marriage User = active immediately; POS_STAFF, STORE_ADMIN, MARRIAGE_MODERATOR = pending approval
  const initialStatus: AccountStatus = (data.role === 'CUSTOMER' || data.role === 'MARRIAGE_USER') ? 'active' : 'pending';
  const todayAD = new Date().toISOString().split('T')[0];
  const bsDate = convertADToBS(todayAD).formattedBS;

  const newUser: RBACUser = {
    id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    username: cleanUsername,
    phone: cleanPhone,
    email: data.email?.trim() || undefined,
    fullName: data.fullName.trim(),
    passwordHash: data.password, // Simulated secure hash
    role: data.role,
    roleNameNepali: getRoleLabelNepali(data.role),
    status: initialStatus,
    customerId: generateNextCustomerId(data.role),
    permissions: DEFAULT_ROLE_PERMISSIONS[data.role] || [],
    createdAtISO: new Date().toISOString(),
    createdAtBS: bsDate,
    mobileVerified: false,
    emailVerified: false,
    storeAssigned: data.storeAssigned,
    birthProfileId: data.birthProfileId,
    birthDetails: data.birthDetails,
    savedAddresses: data.address ? [
      {
        id: `addr_${Date.now()}`,
        title: 'मुख्य ठेगाना',
        fullName: data.fullName.trim(),
        phone: cleanPhone,
        district: 'काठमाडौँ',
        localLevel: 'काठमाडौँ महानगरपालिका',
        ward: '१',
        streetAddress: data.address,
        isDefault: true
      }
    ] : []
  };

  const updatedUsers = [newUser, ...users];
  saveRBACUsers(updatedUsers);

  // Log action
  logRBACAuditAction({
    userId: newUser.id,
    username: newUser.username,
    role: newUser.role,
    action: 'USER_REGISTERED',
    module: 'AUTH',
    target: `${newUser.fullName} (${newUser.roleNameNepali})`,
    details: `नयाँ ${newUser.roleNameNepali} दर्ता भयो। स्थिति: ${initialStatus === 'active' ? 'सक्रिय' : 'प्रमाणीकरण बाँकी (Pending)'}`
  });

  if (initialStatus === 'pending') {
    return {
      success: true,
      message: 'तपाईंको खाता दर्ता सफल भयो। Super Admin द्वारा प्रमाणीकरण (Approve) भएपछि मात्र प्रयोग गर्न मिल्नेछ।',
      user: newUser
    };
  }

  return {
    success: true,
    message: 'खाता सफलतापूर्वक सिर्जना गरियो। तपाईं लगइन गर्न सक्नुहुन्छ।',
    user: newUser
  };
}

// Login Verification with Universal Cross-Module Authentication & Role Enforcement
export function authenticateRBACUser(
  identifier: string, // phone or username
  passwordSecret: string,
  expectedRole?: SystemRole
): { success: boolean; message: string; session?: RBACSession; user?: RBACUser } {
  // 1. Delegate to the Universal Unified Security Bridge (searches Menu Control & RBAC)
  const res = authenticateUnifiedUser(identifier, passwordSecret);

  if (!res.success || !res.session || !res.user) {
    return {
      success: false,
      message: res.message
    };
  }

  // 2. Strict Role Check if specified
  if (expectedRole && res.user.role !== expectedRole) {
    return {
      success: false,
      message: `तपाईंको खाता '${getRoleLabelNepali(res.user.role)}' हो। '${getRoleLabelNepali(expectedRole)}' लगइनबाट प्रवेश गर्न मिल्दैन।`
    };
  }

  // 3. Return verified unified session
  return {
    success: true,
    message: res.message,
    session: res.session,
    user: res.user
  };
}


// Super Admin User Approval / Rejection / Suspension Management
export function updateRBACUserStatus(
  targetUserId: string,
  newStatus: AccountStatus,
  adminUsername: string,
  reasonOrNote?: string
): { success: boolean; message: string } {
  const users = getStoredRBACUsers();
  const target = users.find(u => u.id === targetUserId);

  if (!target) {
    return { success: false, message: 'प्रयोगकर्ता भेटिएन।' };
  }

  if (target.role === 'SUPER_ADMIN') {
    return { success: false, message: 'Super Admin को स्थिति परिवर्तन गर्न पाइँदैन।' };
  }

  const prevStatus = target.status;
  const bsDate = convertADToBS(new Date().toISOString().split('T')[0]).formattedBS;

  target.status = newStatus;
  target.statusReason = reasonOrNote || undefined;
  target.approvedBy = adminUsername;
  target.approvedAt = bsDate;

  saveRBACUsers(users.map(u => u.id === target.id ? target : u));

  // Invalidate session if suspended or rejected
  const activeSession = getActiveRBACSession();
  if (activeSession && activeSession.userId === targetUserId && newStatus !== 'active') {
    clearRBACSession();
  }

  const actionMap: Record<AccountStatus, string> = {
    active: 'खाता स्वीकृति (Approved & Activated)',
    pending: 'प्रमाणीकरणमा राखियो (Set to Pending)',
    rejected: 'खाता अस्वीकृत (Rejected)',
    suspended: 'खाता निलम्बन (Suspended)',
    disabled: 'खाता बन्द (Disabled)'
  };

  logRBACAuditAction({
    userId: adminUsername,
    username: adminUsername,
    role: 'SUPER_ADMIN',
    action: `USER_STATUS_${newStatus.toUpperCase()}`,
    module: 'SUPER_ADMIN',
    target: `${target.fullName} (${target.roleNameNepali})`,
    details: `${target.fullName} को खाता स्थिति '${prevStatus}' बाट '${newStatus}' बनाइयो। नोट: ${reasonOrNote || 'कुनै छैन'}`,
    previousValue: prevStatus,
    newValue: newStatus
  });

  return {
    success: true,
    message: `${target.fullName} को स्थिति सफलतापूर्वक '${actionMap[newStatus]}' गरियो।`
  };
}

// Super Admin Update Staff User Details
export function editRBACUserDetails(
  targetUserId: string,
  data: {
    fullName?: string;
    phone?: string;
    email?: string;
    role?: SystemRole;
    storeAssigned?: string;
  },
  adminUsername: string
): { success: boolean; message: string } {
  const users = getStoredRBACUsers();
  const target = users.find(u => u.id === targetUserId);

  if (!target) {
    return { success: false, message: 'कर्मचारी खाता भेटिएन।' };
  }

  if (data.fullName) target.fullName = data.fullName.trim();
  if (data.phone) target.phone = data.phone.trim();
  if (data.email) target.email = data.email.trim();
  if (data.storeAssigned) target.storeAssigned = data.storeAssigned.trim();

  if (data.role && data.role !== target.role) {
    if (target.role === 'SUPER_ADMIN') {
      return { success: false, message: 'Super Admin को भूमिका परिवर्तन गर्न पाइँदैन।' };
    }
    target.role = data.role;
    target.permissions = DEFAULT_ROLE_PERMISSIONS[data.role];
    const roleNepaliNames: Record<SystemRole, string> = {
      SUPER_ADMIN: 'Super Admin',
      STORE_ADMIN: 'Store Admin',
      POS_STAFF: 'POS Staff',
      CUSTOMER: 'यजमान / ग्राहक',
      MARRIAGE_USER: 'विवाह सेवाग्राही (Marriage Member)',
      MARRIAGE_MODERATOR: 'विवाह सुपरभाइजर (Marriage Moderator)'
    };
    target.roleNameNepali = roleNepaliNames[data.role] || data.role;
  }

  saveRBACUsers(users.map(u => u.id === target.id ? target : u));

  logRBACAuditAction({
    userId: adminUsername,
    username: adminUsername,
    role: 'SUPER_ADMIN',
    action: 'EDIT_USER_DETAILS',
    module: 'SUPER_ADMIN',
    target: `${target.fullName} (${target.roleNameNepali})`,
    details: `${target.fullName} को कर्मचारी विवरणहरू सम्पादन गरियो।`
  });

  return {
    success: true,
    message: `${target.fullName} को विवरण सफलतापूर्वक अद्यावधिक गरियो।`
  };
}

// Password Reset Simulator
export function resetRBACUserPassword(
  phoneOrEmail: string,
  newPasswordSecret: string,
  isSelfReset: boolean = true
): { success: boolean; message: string } {
  const users = getStoredRBACUsers();
  const clean = phoneOrEmail.trim();

  const target = users.find(u => u.phone === clean || u.email === clean || u.username === clean);

  if (!target) {
    return { success: false, message: 'उक्त फोन वा इमेल दर्ता भएको खाता भेटिएन।' };
  }

  target.passwordHash = newPasswordSecret;
  saveRBACUsers(users.map(u => u.id === target.id ? target : u));

  logRBACAuditAction({
    userId: target.id,
    username: target.username,
    role: target.role,
    action: 'PASSWORD_RESET',
    module: 'AUTH',
    target: target.fullName,
    details: `पासवर्ड परिवर्तन गरियो (${isSelfReset ? 'Self Reset' : 'Admin Reset'})`
  });

  return {
    success: true,
    message: 'पासवर्ड सफलतापूर्वक परिवर्तन भयो। अब नयाँ पासवर्ड प्रयोग गरी लगइन गर्नुहोस्।'
  };
}

// Audit Log Persistence
export function getRBACAuditLogs(): RBACAuditLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function logRBACAuditAction(data: Omit<RBACAuditLog, 'id' | 'timestampISO' | 'timestampBS'>): void {
  try {
    const logs = getRBACAuditLogs();
    const todayAD = new Date().toISOString().split('T')[0];
    const bsDate = convertADToBS(todayAD).formattedBS;

    const newLog: RBACAuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestampISO: new Date().toISOString(),
      timestampBS: bsDate,
      ipDeviceInfo: typeof window !== 'undefined' ? `${window.navigator.platform} / ${window.navigator.appName}` : 'Web App',
      ...data
    };

    const updated = [newLog, ...logs].slice(0, 500); // keep last 500 logs
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to write audit log:', e);
  }
}

// Authorization check helper
export function hasPermission(session: RBACSession | null, permissionKey: string): boolean {
  if (!session) return false;
  if (session.permissions.includes('*')) return true;
  return session.permissions.includes(permissionKey);
}

/**
 * Export all registered Members (Customers / Users) to CSV
 */
export function exportMembersToCSV(): string {
  const users = getStoredRBACUsers();
  const headers = ['User ID', 'Full Name', 'Username / Phone', 'Email', 'Role', 'Status', 'Registered Date (BS)', 'Default Address'];
  const rows = users.map((u) => {
    const defaultAddr = u.savedAddresses?.find((a) => a.isDefault) || u.savedAddresses?.[0];
    const addrStr = defaultAddr ? `${defaultAddr.district}, ${defaultAddr.localLevel}-${defaultAddr.ward}` : '';
    return [
      `"${u.id}"`,
      `"${u.fullName}"`,
      `"${u.phone || u.username}"`,
      `"${u.email || ''}"`,
      `"${u.roleNameNepali}"`,
      `"${u.status}"`,
      `"${u.createdAtBS}"`,
      `"${addrStr}"`
    ];
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

