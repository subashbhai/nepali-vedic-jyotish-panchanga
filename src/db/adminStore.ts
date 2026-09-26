import { convertADToBS } from '../utils/nepaliCalendar';

const toNepaliDigits = (n: number | string): string =>
  String(n).replace(/[0-9]/g, d => '०१२३४५६७८९'[+d]);

export type AdminRoleType = 
  | 'super_admin'        // मुख्य प्रशासक
  | 'admin'              // प्रशासक
  | 'payment_manager'    // भुक्तानी व्यवस्थापक
  | 'membership_manager' // सदस्यता व्यवस्थापक
  | 'expert_manager'     // विशेषज्ञ व्यवस्थापक
  | 'content_manager'    // सामग्री व्यवस्थापक
  | 'support_manager';   // समर्थन व्यवस्थापक

export interface AdminAccount {
  id: string;
  username: string;
  passwordHash: string; // Hashed / Securely stored representation
  fullName: string;
  email: string;
  phone: string;
  role: AdminRoleType;
  roleNameNepali: string;
  permissions: string[];
  createdAtBS: string;
  isActive: boolean;
  lastLoginBS?: string;
}

export interface AdminSession {
  adminId: string;
  username: string;
  fullName: string;
  role: AdminRoleType;
  roleNameNepali: string;
  permissions: string[];
  loginTimeISO: string;
  lastActivityISO: string;
}

export interface AdminAuditLogRecord {
  id: string;
  timestampBS: string;
  timestampISO: string;
  adminUsername: string;
  adminRoleNameNepali: string;
  actionCategory: 'expert' | 'payment' | 'member' | 'pricing' | 'trial' | 'user' | 'security' | 'notification' | 'system';
  actionTitleNepali: string;
  targetId: string;
  targetName: string;
  detailsNepali: string;
}

export interface SystemNotificationMessage {
  id: string;
  sentDateBS: string;
  sentTime: string;
  recipientTarget: 'all_users' | 'all_members' | 'pending_payments' | 'all_experts' | 'specific_user';
  recipientTargetNepali: string;
  titleNepali: string;
  messageNepali: string;
  senderUsername: string;
}

const STORAGE_KEY_ADMIN_ACCOUNTS = 'sukdev_admin_accounts_v1';
const STORAGE_KEY_ADMIN_SESSION = 'sukdev_admin_active_session_v1';
const STORAGE_KEY_ADMIN_AUDIT_LOGS = 'sukdev_admin_audit_logs_v1';
const STORAGE_KEY_ADMIN_NOTIFICATIONS = 'sukdev_admin_notifications_v1';
const STORAGE_KEY_FAILED_LOGIN = 'sukdev_admin_failed_logins_v1';

// Initial Default Super Admin Credentials (username: admin, secret: SukdevAdmin#2081)
import { verifyPassword, hashPasswordSync } from '../utils/cryptoUtils';

export const DEFAULT_ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    id: 'admin_super_01',
    username: 'admin',
    passwordHash: 'sukadev#12', // Development default password
    fullName: 'मुख्य प्रशासक (Super Admin)',
    email: 'admin@balanandajyotish.com.np',
    phone: '+९७७-९७६४४००५३३',
    role: 'super_admin',
    roleNameNepali: 'मुख्य प्रशासक (Super Admin)',
    permissions: [
      'manage_admins',
      'manage_payments',
      'manage_experts',
      'manage_members',
      'manage_pricing',
      'manage_trials',
      'manage_users',
      'view_reports',
      'manage_notifications',
      'view_audit_logs',
      'system_settings'
    ],
    createdAtBS: '२०७९ वैशाख ०१',
    isActive: true,
    lastLoginBS: '२०८१ साउन २०',
  },
  {
    id: 'admin_payment_01',
    username: 'payment_admin',
    passwordHash: 'Payment#2081',
    fullName: 'रामप्रसाद शर्मा (भुक्तानी व्यवस्थापक)',
    email: 'payment@sukdevjyotish.np',
    phone: '+९७७-९८४१२३४५६७',
    role: 'payment_manager',
    roleNameNepali: 'भुक्तानी व्यवस्थापक',
    permissions: ['manage_payments', 'view_reports'],
    createdAtBS: '२०८० जेठ १५',
    isActive: true,
  },
  {
    id: 'admin_expert_01',
    username: 'expert_admin',
    passwordHash: 'Expert#2081',
    fullName: 'शिवनाथ शास्त्री (विशेषज्ञ व्यवस्थापक)',
    email: 'expert@sukdevjyotish.np',
    phone: '+९७७-९८५१०९८७६५',
    role: 'expert_manager',
    roleNameNepali: 'विशेषज्ञ व्यवस्थापक',
    permissions: ['manage_experts', 'view_reports'],
    createdAtBS: '२०८० असार ०१',
    isActive: true,
  }
];

export function getStoredAdminAccounts(): AdminAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_ACCOUNTS);
    if (!raw) {
      saveAdminAccounts(DEFAULT_ADMIN_ACCOUNTS);
      return DEFAULT_ADMIN_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse admin accounts:', e);
    return DEFAULT_ADMIN_ACCOUNTS;
  }
}

export function saveAdminAccounts(accounts: AdminAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ADMIN_ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save admin accounts:', e);
  }
}

export function getActiveAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_SESSION);
    if (!raw) return null;
    const session: AdminSession = JSON.parse(raw);
    
    // Check 30-minute inactivity timeout (1800000 ms)
    const now = new Date().getTime();
    const lastActivity = new Date(session.lastActivityISO).getTime();
    if (now - lastActivity > 1800000) {
      clearAdminSession();
      return null;
    }

    // Refresh last activity time
    session.lastActivityISO = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_ADMIN_SESSION, JSON.stringify(session));
    return session;
  } catch (e) {
    return null;
  }
}

export function updateAdminSessionActivity(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_SESSION);
    if (!raw) return;
    const session: AdminSession = JSON.parse(raw);
    session.lastActivityISO = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_ADMIN_SESSION, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to update admin session activity:', e);
  }
}

export function setAdminSession(session: AdminSession): void {
  try {
    localStorage.setItem(STORAGE_KEY_ADMIN_SESSION, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to set admin session:', e);
  }
}

export function clearAdminSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
  } catch (e) {
    console.error('Failed to clear admin session:', e);
  }
}

// Failed login attempts tracker & lockout (max 5 attempts, 10-minute lockout)
export interface FailedLoginState {
  attempts: number;
  lockoutUntilISO: string | null;
}

export function getFailedLoginState(): FailedLoginState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FAILED_LOGIN);
    if (!raw) return { attempts: 0, lockoutUntilISO: null };
    const parsed: FailedLoginState = JSON.parse(raw);
    
    // Reset if lockout expired
    if (parsed.lockoutUntilISO && new Date(parsed.lockoutUntilISO).getTime() < Date.now()) {
      const reset = { attempts: 0, lockoutUntilISO: null };
      localStorage.setItem(STORAGE_KEY_FAILED_LOGIN, JSON.stringify(reset));
      return reset;
    }
    return parsed;
  } catch (e) {
    return { attempts: 0, lockoutUntilISO: null };
  }
}

export function registerFailedLoginAttempt(): FailedLoginState {
  const current = getFailedLoginState();
  const newAttempts = current.attempts + 1;
  let lockoutUntil: string | null = null;
  
  if (newAttempts >= 5) {
    // 10 minutes lockout
    lockoutUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  }
  
  const updated: FailedLoginState = {
    attempts: newAttempts,
    lockoutUntilISO: lockoutUntil
  };
  localStorage.setItem(STORAGE_KEY_FAILED_LOGIN, JSON.stringify(updated));
  return updated;
}

export function clearFailedLoginAttempts(): void {
  localStorage.setItem(STORAGE_KEY_FAILED_LOGIN, JSON.stringify({ attempts: 0, lockoutUntilISO: null }));
}

// Admin Audit Logging
export function getStoredAuditLogs(): AdminAuditLogRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_AUDIT_LOGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function logAdminAction(
  adminUsername: string,
  adminRoleNameNepali: string,
  actionCategory: AdminAuditLogRecord['actionCategory'],
  actionTitleNepali: string,
  targetId: string,
  targetName: string,
  detailsNepali: string
): void {
  try {
    const logs = getStoredAuditLogs();
    const todayAD = new Date().toISOString().split('T')[0];
    const yearBS = convertADToBS(todayAD).formattedBS;
    const timeStr = new Date().toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit' });

    const newRecord: AdminAuditLogRecord = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestampBS: `${yearBS} ${timeStr}`,
      timestampISO: new Date().toISOString(),
      adminUsername,
      adminRoleNameNepali,
      actionCategory,
      actionTitleNepali,
      targetId,
      targetName,
      detailsNepali
    };

    const updated = [newRecord, ...logs].slice(0, 300); // keep last 300 logs
    localStorage.setItem(STORAGE_KEY_ADMIN_AUDIT_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to log admin action:', e);
  }
}

// System Notifications Sent by Admins
export function getStoredSystemNotifications(): SystemNotificationMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_NOTIFICATIONS);
    if (!raw) {
      const initial: SystemNotificationMessage[] = [
        {
          id: 'NOTIF-01',
          sentDateBS: '२०८१ साउन १५',
          sentTime: '१०:३० AM',
          recipientTarget: 'all_members',
          recipientTargetNepali: 'सबै सदस्यहरू',
          titleNepali: 'सदस्यता प्रमाणीकरण सूचना',
          messageNepali: 'तपाईंको eSewa भुक्तानी प्रमाण प्राप्त भई प्रशासनिक प्रमाणीकरण भइसकेको छ।',
          senderUsername: 'admin'
        }
      ];
      localStorage.setItem(STORAGE_KEY_ADMIN_NOTIFICATIONS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function sendAdminNotification(
  recipientTarget: SystemNotificationMessage['recipientTarget'],
  recipientTargetNepali: string,
  titleNepali: string,
  messageNepali: string,
  senderUsername: string
): void {
  try {
    const list = getStoredSystemNotifications();
    const todayAD = new Date().toISOString().split('T')[0];
    const dateBS = convertADToBS(todayAD).formattedBS;
    const timeStr = new Date().toLocaleTimeString('ne-NP', { hour: '2-digit', minute: '2-digit' });

    const newNotif: SystemNotificationMessage = {
      id: `NOTIF-${Date.now()}`,
      sentDateBS: dateBS,
      sentTime: timeStr,
      recipientTarget,
      recipientTargetNepali,
      titleNepali,
      messageNepali,
      senderUsername
    };

    const updated = [newNotif, ...list];
    localStorage.setItem(STORAGE_KEY_ADMIN_NOTIFICATIONS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save notification:', e);
  }
}

// Role Name Map
export function getRoleNameNepali(role: AdminRoleType): string {
  switch (role) {
    case 'super_admin': return 'मुख्य प्रशासक';
    case 'admin': return 'प्रशासक';
    case 'payment_manager': return 'भुक्तानी व्यवस्थापक';
    case 'membership_manager': return 'सदस्यता व्यवस्थापक';
    case 'expert_manager': return 'विशेषज्ञ व्यवस्थापक';
    case 'content_manager': return 'सामग्री व्यवस्थापक';
    case 'support_manager': return 'समर्थन व्यवस्थापक';
    default: return 'प्रशासक';
  }
}

// Security: Change Admin Password with Current Password Verification & Secure Hash
export function changeAdminPassword(
  adminId: string,
  currentPasswordPlain: string,
  newPasswordPlain: string
): { success: boolean; message: string } {
  const accounts = getStoredAdminAccounts();
  const target = accounts.find(a => a.id === adminId);

  if (!target) {
    return { success: false, message: 'प्रशासक खाता भेटिएन।' };
  }

  // Verify current password
  if (!verifyPassword(currentPasswordPlain, target.passwordHash)) {
    return { success: false, message: 'हालको पासवर्ड मिलेन। कृपया सही पासवर्ड राख्नुहोस्।' };
  }

  if (newPasswordPlain.length < 6) {
    return { success: false, message: 'नयाँ पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ।' };
  }

  // Update with secure hash
  const newHash = hashPasswordSync(newPasswordPlain);
  target.passwordHash = newHash;
  saveAdminAccounts(accounts);

  logAdminAction(
    target.username,
    target.roleNameNepali,
    'security',
    'पासवर्ड परिवर्तन',
    target.id,
    target.fullName,
    'Super Admin ले आफ्नो पासवर्ड सफलतापूर्वक परिवर्तन गर्नुभयो।'
  );

  return {
    success: true,
    message: 'पासवर्ड सफलतापूर्वक परिवर्तन गरियो। नयाँ पासवर्ड सुरक्षित राखिएको छ।'
  };
}

// Security & Account Profile Update
export function updateAdminProfileDetails(
  adminId: string,
  data: {
    username?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  }
): { success: boolean; message: string; updatedAdmin?: AdminAccount } {
  const accounts = getStoredAdminAccounts();
  const target = accounts.find(a => a.id === adminId);

  if (!target) {
    return { success: false, message: 'प्रशासक खाता भेटिएन।' };
  }

  // Check username collision if changed
  if (data.username && data.username.trim().toLowerCase() !== target.username.toLowerCase()) {
    const cleanUser = data.username.trim().toLowerCase();
    if (accounts.some(a => a.id !== adminId && a.username.toLowerCase() === cleanUser)) {
      return { success: false, message: 'यो प्रयोगकर्ता नाम (Username) अर्कै प्रशासकले प्रयोग गरिसक्नुभएको छ।' };
    }
    target.username = cleanUser;
  }

  if (data.fullName) target.fullName = data.fullName.trim();
  if (data.email) target.email = data.email.trim();
  if (data.phone) target.phone = data.phone.trim();

  saveAdminAccounts(accounts);

  // Update session
  const activeSession = getActiveAdminSession();
  if (activeSession && activeSession.adminId === adminId) {
    activeSession.username = target.username;
    activeSession.fullName = target.fullName;
    setAdminSession(activeSession);
  }

  logAdminAction(
    target.username,
    target.roleNameNepali,
    'security',
    'प्रशासक प्रोफाइल सम्पादन',
    target.id,
    target.fullName,
    'Super Admin ले आफ्नो प्रोफाइल विवरण सम्पादन गर्नुभयो।'
  );

  return {
    success: true,
    message: 'प्रोफाइल विवरणहरू सफलतापूर्वक अद्यावधिक गरियो।',
    updatedAdmin: target
  };
}

