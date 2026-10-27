/**
 * Balananda Vaidik Sewa — Central Authentication, Access Control & Subscription Engine
 * 
 * Rebuilt to completely eliminate obsolete OTP infrastructure:
 * - 5-Field Signup: Full Name, Address, Mobile Number, Username, Password
 * - Dual-Identifier Login: Mobile Number OR Username + Password
 * - Scrypt Cryptographic Salted Password Hashing & Timing-Safe Verification
 * - 3-Tier Access Control: Visitor (default), Member User, Professional User
 * - Offline/Manual Payment Tracking & Subscription Lifecycle
 * - 1-Month Advance Automatic Expiry Scheduler & Notifications
 * - Super Admin 16-Column User Management Dataset
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getDatabaseAdapter, IDatabaseAdapter } from './db/databaseAdapter';
import { getNepaliBSDate } from './membershipDateEngine';

export type UserCategory = 'visitor' | 'member' | 'professional';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
export type SubscriptionStatus = 'active' | 'expired' | 'pending' | 'cancelled';
export type AccountStatus = 'active' | 'suspended' | 'inactive';

export interface UserAccount {
  id: string;
  customerId: string;
  username: string;
  phone: string;
  fullName: string;
  address: string;
  passwordHash: string;
  role: string; // 'user' | 'CUSTOMER' | 'SUPER_ADMIN'
  roleNameNepali: string;
  userCategory: UserCategory;
  accountStatus: AccountStatus;
  status?: AccountStatus; // Backward compatibility
  statusReason?: string | null;
  mobileVerified: boolean;
  emailVerified: boolean;
  email?: string;
  createdAtISO: string;
  createdAtBS: string;
  lastLoginISO?: string | null;
  subscriptionPlan?: string;
  subscriptionStartAt?: string | null;
  subscriptionExpiresAt?: string | null;
  paymentAmountNPR?: number;
  paymentStatus?: PaymentStatus;
  remainingDays?: number;
  lastUpdatedISO?: string;
  permissions?: string[];
  birthDetails?: any;
  birthProfileId?: string;
  [key: string]: any;
}

export interface UserSubscription {
  id: string;
  userId: string;
  username: string;
  phone: string;
  planId: string;
  planNameNepali: string;
  category: UserCategory;
  startAt: string;
  expiresAt: string;
  status: SubscriptionStatus;
  paymentAmountNPR: number;
  paymentStatus: PaymentStatus;
  recordedBy: string;
  createdAtISO: string;
  updatedAtISO: string;
  renewalCount?: number;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  subscriptionId?: string;
  amountNPR: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  transactionReference?: string;
  recordedBy: string;
  notes?: string;
  createdAtISO: string;
}

export interface SystemNotification {
  id: string;
  userId: string; // Specific user ID or 'all' or 'superadmin'
  subscriptionId?: string;
  type: string;
  title: string;
  message: string;
  stage?: '30_days' | '15_days' | '7_days' | '3_days' | '1_day' | 'today' | 'expired' | 'general';
  status: 'pending' | 'delivered' | 'read';
  scheduledAt: string;
  sentAt?: string;
  createdAtISO: string;
}

export interface AdminAuditEntry {
  id: string;
  actorUsername: string;
  action: string;
  targetUserId: string;
  targetUsername?: string;
  previousValue?: any;
  newValue?: any;
  reason?: string;
  timestampISO: string;
}

export interface UserSessionData {
  userId: string;
  username: string;
  phone: string;
  fullName: string;
  role: string;
  userCategory: UserCategory;
  expiresAt: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'active_sessions.json');
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, 'subscriptions.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');
const AUDIT_LOGS_FILE = path.join(DATA_DIR, 'admin_audit_logs.json');
const CLIENT_LEADS_FILE = path.join(DATA_DIR, 'client_purchase_leads.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Robust, memory-hard Scrypt password hashing with cryptographic salt
 */
export function hashUserPassword(plain: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(plain, salt, 64).toString('hex');
  return `scrypt:${salt}:${derivedKey}`;
}

/**
 * Timing-safe password verification with legacy fallback support
 */
export function verifyUserPassword(plain: string, storedHash: string): boolean {
  if (!plain || !storedHash) return false;

  const cleanPlain = String(plain).trim();
  const cleanStored = String(storedHash).trim();

  // Modern Scrypt verification
  if (cleanStored.startsWith('scrypt:')) {
    const parts = cleanStored.split(':');
    if (parts.length === 3) {
      const [, salt, expectedKey] = parts;
      const derived = crypto.scryptSync(cleanPlain, salt, 64);
      const expectedBuf = Buffer.from(expectedKey, 'hex');
      return derived.length === expectedBuf.length && crypto.timingSafeEqual(derived, expectedBuf);
    }
  }

  // Legacy SHA-256 fallback (hex)
  const legacySha = crypto.createHash('sha256').update(cleanPlain).digest('hex');
  if (cleanStored === legacySha || cleanStored === `sha256:${legacySha}`) {
    return true;
  }

  // Raw plain match if any legacy dev user exists
  if (cleanStored === cleanPlain) {
    return true;
  }

  return false;
}

/**
 * Normalizes Nepal mobile phone number to standard 10 digits
 */
export function normalizeMobileNumber(raw: string): string {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.startsWith('977') && digits.length === 13) {
    return digits.slice(3);
  }
  if (digits.startsWith('0') && digits.length === 11) {
    return digits.slice(1);
  }
  return digits.slice(-10);
}

export class AuthEngine {
  private users: UserAccount[] = [];
  private activeSessions: Map<string, UserSessionData> = new Map();
  private subscriptions: UserSubscription[] = [];
  private payments: PaymentRecord[] = [];
  private notifications: SystemNotification[] = [];
  private auditLogs: AdminAuditEntry[] = [];
  private loginAttempts: Map<string, { count: number; lockedUntil: number }> = new Map();

  constructor() {
    this.loadFromDisk();
    this.runExpiryAndNotificationCheck();
  }

  public loadFromDisk(): void {
    try {
      if (fs.existsSync(USERS_FILE)) {
        this.users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
      }
    } catch (e) {
      console.error('Failed to load users.json:', e);
      this.users = [];
    }

    try {
      if (fs.existsSync(SESSIONS_FILE)) {
        const raw = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
        this.activeSessions = new Map(Object.entries(raw));
      }
    } catch {
      this.activeSessions = new Map();
    }

    try {
      if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
        this.subscriptions = JSON.parse(fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8'));
      }
    } catch {
      this.subscriptions = [];
    }

    try {
      if (fs.existsSync(PAYMENTS_FILE)) {
        this.payments = JSON.parse(fs.readFileSync(PAYMENTS_FILE, 'utf-8'));
      }
    } catch {
      this.payments = [];
    }

    try {
      if (fs.existsSync(NOTIFICATIONS_FILE)) {
        this.notifications = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8'));
      }
    } catch {
      this.notifications = [];
    }

    try {
      if (fs.existsSync(AUDIT_LOGS_FILE)) {
        this.auditLogs = JSON.parse(fs.readFileSync(AUDIT_LOGS_FILE, 'utf-8'));
      }
    } catch {
      this.auditLogs = [];
    }
  }

  /**
   * Synchronize in-memory and disk users with the authoritative central database adapter
   */
  public async syncWithDatabase(adapter: IDatabaseAdapter): Promise<void> {
    try {
      const dbUsers = await adapter.getUsers();
      if (Array.isArray(dbUsers)) {
        if (dbUsers.length > 0) {
          this.users = dbUsers.map((u: any) => ({
            ...u,
            mobileVerified: u.mobileVerified !== false,
            emailVerified: Boolean(u.emailVerified)
          }));
          this.persistUsers();
          console.log(`[authEngine] Synced ${this.users.length} users from authoritative central database.`);
        } else {
          // Authoritative DB is empty (e.g. after authorized system reset)
          this.users = [];
          this.persistUsers();
          console.log('[authEngine] Authoritative central database is empty. Local user cache cleared.');
        }
      }
    } catch (err: any) {
      console.warn('[authEngine] syncWithDatabase notice:', err.message);
    }
  }

  /**
   * Reset all user-specific data in memory and disk (SuperAdmin authorized reset)
   */
  public resetAllUserData(): void {
    this.users = [];
    this.subscriptions = [];
    this.payments = [];
    this.notifications = [];
    
    // Retain only Super Admin active sessions
    const preservedSessions = new Map<string, any>();
    for (const [token, sess] of this.activeSessions.entries()) {
      if (sess.role === 'SUPER_ADMIN' || sess.username === 'admin') {
        preservedSessions.set(token, sess);
      }
    }
    this.activeSessions = preservedSessions;

    this.persistUsers();
    this.persistSubscriptions();
    this.persistPayments();
    this.persistNotifications();
    this.persistSessions();
    console.log('[authEngine] Reset all user data in memory and disk.');
  }

  private persistUsers(): void {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(this.users, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist users.json:', e);
    }
  }

  private persistSessions(): void {
    try {
      const obj = Object.fromEntries(this.activeSessions.entries());
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist sessions:', e);
    }
  }

  private persistSubscriptions(): void {
    try {
      fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(this.subscriptions, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist subscriptions.json:', e);
    }
  }

  private persistPayments(): void {
    try {
      fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(this.payments, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist payments.json:', e);
    }
  }

  private persistNotifications(): void {
    try {
      fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(this.notifications, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist notifications.json:', e);
    }
  }

  private persistAuditLogs(): void {
    try {
      fs.writeFileSync(AUDIT_LOGS_FILE, JSON.stringify(this.auditLogs, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist admin_audit_logs.json:', e);
    }
  }

  private syncLeadRecord(user: UserAccount): void {
    try {
      let leads: any[] = [];
      if (fs.existsSync(CLIENT_LEADS_FILE)) {
        leads = JSON.parse(fs.readFileSync(CLIENT_LEADS_FILE, 'utf-8'));
      }
      const existingIdx = leads.findIndex(l => normalizeMobileNumber(l.mobile) === user.phone);
      const leadItem = {
        id: `LEAD-${Date.now()}`,
        fullName: user.fullName,
        address: user.address || 'नेपाल',
        mobile: user.phone,
        email: user.email || '',
        whatsapp: user.phone,
        deviceFingerprint: 'user-registered',
        status: user.userCategory === 'professional' ? 'APPROVED' : user.userCategory === 'member' ? 'MEMBER_ACTIVE' : 'REGISTERED_USER',
        planId: user.subscriptionPlan || 'standard',
        planNameNepali: user.subscriptionPlan ? (user.userCategory === 'professional' ? 'व्यावसायिक योजना' : 'सदस्य योजना') : 'दर्ता भएको प्रयोगकर्ता (Visitor)',
        planAmountNPR: user.paymentAmountNPR || 0,
        paymentMethod: user.paymentStatus === 'paid' ? 'offline_verified' : 'none',
        submittedAtISO: user.createdAtISO,
        submittedAtBS: user.createdAtBS || getNepaliBSDate(user.createdAtISO),
        clientNotes: `प्रयोगकर्ता श्रेणी: ${user.userCategory}`
      };

      if (existingIdx > -1) {
        leads[existingIdx] = { ...leads[existingIdx], ...leadItem };
      } else {
        leads.unshift(leadItem);
      }
      fs.writeFileSync(CLIENT_LEADS_FILE, JSON.stringify(leads, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to sync client_purchase_leads:', e);
    }
  }

  // =========================================================================
  // 1. PHASE 3: NEW 5-FIELD SIGNUP (NO OTP)
  // =========================================================================
  public registerUser(params: {
    fullName: string;
    address: string;
    mobileNumber: string;
    username: string;
    password: string;
    email?: string;
  }): { success: boolean; message: string; user?: any; token?: string; error?: string } {
    this.loadFromDisk();

    const fullName = String(params.fullName || '').trim();
    const address = String(params.address || '').trim();
    const mobileRaw = String(params.mobileNumber || '').trim();
    const usernameRaw = String(params.username || '').trim();
    const password = String(params.password || '').trim();
    const email = String(params.email || '').trim();

    // 1. Validate all 5 required fields
    if (!fullName) {
      return { success: false, message: 'कृपया पूरा नाम प्रविष्ट गर्नुहोस्।' };
    }
    if (!address) {
      return { success: false, message: 'कृपया ठेगाना प्रविष्ट गर्नुहोस्।' };
    }
    if (!mobileRaw) {
      return { success: false, message: 'कृपया मोबाइल नम्बर प्रविष्ट गर्नुहोस्।' };
    }
    if (!usernameRaw) {
      return { success: false, message: 'कृपया प्रयोगकर्ता नाम (Username) प्रविष्ट गर्नुहोस्।' };
    }
    if (!password || password.length < 6) {
      return { success: false, message: 'पासवर्ड कम्तिमा ६ अक्षर वा अङ्कको हुनुपर्दछ।' };
    }

    // 2. Validate and normalize mobile number (Nepal 10-digit mobile)
    const phone = normalizeMobileNumber(mobileRaw);
    if (phone.length !== 10 || !['98', '97', '96'].some(p => phone.startsWith(p))) {
      return {
        success: false,
        message: 'कृपया मान्य १० अङ्कको नेपाल मोबाइल नम्बर प्रविष्ट गर्नुहोस् (उदा: 98XXXXXXXX वा 97XXXXXXXX)।'
      };
    }

    // 3. Normalize username (lowercase, trim) and check alphanumeric format
    const username = usernameRaw.toLowerCase();
    if (!/^[a-z0-9_.-]{3,30}$/.test(username)) {
      return {
        success: false,
        message: 'प्रयोगकर्ता नाम ३ देखि ३० अक्षरको, अङ्क, अंग्रेजी अक्षर र _ वा - मात्र प्रयोग गर्न मिल्छ।'
      };
    }

    // 4. Prevent duplicate usernames
    const existingUserByName = this.users.find(u => String(u.username || '').toLowerCase() === username);
    if (existingUserByName) {
      return {
        success: false,
        message: `प्रयोगकर्ता नाम '${username}' पहिले नै दर्ता भइसकेको छ। कृपया अर्को नाम छान्नुहोस्।`
      };
    }

    // 5. Prevent duplicate mobile numbers
    const existingUserByPhone = this.users.find(u => normalizeMobileNumber(u.phone) === phone);
    if (existingUserByPhone) {
      return {
        success: false,
        message: `मोबाइल नम्बर ${phone} पहिले नै दर्ता भइसकेको छ। कृपया लगइन गर्नुहोस्।`
      };
    }

    // 6. Cryptographically hash password using salted Scrypt
    const passwordHash = hashUserPassword(password);
    const now = new Date();
    const createdAtISO = now.toISOString();
    const createdAtBS = getNepaliBSDate(now);
    const bsYearOnly = createdAtBS.split(' ')[0] || '२०८३';
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const customerId = `सदस्य-${bsYearOnly}-${String(this.users.length + 1).padStart(4, '०')}`;

    // 7. Create user with default role 'user' and userCategory 'visitor'
    const newUser: UserAccount = {
      id: userId,
      customerId,
      username,
      phone,
      fullName,
      address,
      email: email || '',
      passwordHash,
      role: 'user',
      roleNameNepali: 'साधारण प्रयोगकर्ता (विजिटर)',
      userCategory: 'visitor', // Non-negotiable: All signups default to visitor!
      accountStatus: 'active',
      status: 'active',
      mobileVerified: true,
      emailVerified: false,
      subscriptionPlan: 'साधारण खाता (योजना छैन)',
      subscriptionStartAt: null,
      subscriptionExpiresAt: null,
      paymentAmountNPR: 0,
      paymentStatus: 'pending',
      remainingDays: 0,
      permissions: ['visitor.view', 'faladesh.view', 'panchanga.view', 'samachar.view', 'membership.view', 'vivah.view', 'yajaman.view', 'org.view'],
      createdAtISO,
      createdAtBS,
      lastLoginISO: createdAtISO,
      lastUpdatedISO: createdAtISO
    };

    this.users.unshift(newUser);
    this.persistUsers();

    // Note: Do NOT call this.syncLeadRecord(newUser) on basic registration.
    // An ordinary visitor registration must NOT create a dummy purchase lead.

    // Sync with central database adapter
    try {
      const db = getDatabaseAdapter();
      db.createUser(newUser).catch(err => {
        console.warn('[authEngine] Central database sync notice:', err.message);
      });
    } catch (e) {
      console.warn('[authEngine] Central database adapter unavailable:', e);
    }

    // Create session token
    const token = crypto.randomBytes(32).toString('hex');
    this.activeSessions.set(token, {
      userId: newUser.id,
      username: newUser.username,
      phone: newUser.phone,
      fullName: newUser.fullName,
      role: newUser.role,
      userCategory: newUser.userCategory,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    this.persistSessions();

    // Sanitize user for response
    const sanitized = { ...newUser };
    delete (sanitized as any).passwordHash;

    return {
      success: true,
      message: 'खाता सफलतापूर्वक दर्ता भयो! तपाईंको भ्रमण (विजिटर) खाता सक्रिय भएको छ।',
      user: sanitized,
      token
    };
  }

  public deleteUser(idOrPhone: string): boolean {
    const cleanDigits = String(idOrPhone || '').replace(/\D/g, '').slice(-10);
    const initialLen = this.users.length;
    this.users = this.users.filter(u => {
      const uMob = String(u.phone || '').replace(/\D/g, '').slice(-10);
      if (cleanDigits && cleanDigits.length >= 7 && uMob === cleanDigits) return false;
      if (u.id === idOrPhone || u.phone === idOrPhone) return false;
      return true;
    });
    const deleted = this.users.length < initialLen;
    if (deleted) {
      this.persistUsers();
    }
    return deleted;
  }

  // =========================================================================
  // 2. PHASE 4: NORMAL LOGIN (MOBILE NUMBER OR USERNAME + PASSWORD)
  // =========================================================================
  public loginUser(
    identifierOrOptions: string | {
      identifier?: string;
      phoneOrUsername?: string;
      username?: string;
      phone?: string;
      mobile?: string;
      password?: string;
      clientIp?: string;
    },
    passwordPlain?: string,
    clientIp = 'unknown'
  ): {
    success: boolean;
    message: string;
    user?: any;
    token?: string;
    session?: UserSessionData;
    error?: string;
  } {
    this.loadFromDisk();

    let cleanInput = '';
    let cleanPassword = '';
    let effectiveIp = clientIp;

    if (typeof identifierOrOptions === 'object' && identifierOrOptions !== null) {
      cleanInput = String(
        identifierOrOptions.identifier ||
        identifierOrOptions.phoneOrUsername ||
        identifierOrOptions.username ||
        identifierOrOptions.phone ||
        identifierOrOptions.mobile ||
        ''
      ).trim();
      cleanPassword = String(identifierOrOptions.password || passwordPlain || '').trim();
      if (identifierOrOptions.clientIp) {
        effectiveIp = identifierOrOptions.clientIp;
      }
    } else {
      cleanInput = String(identifierOrOptions || '').trim();
      cleanPassword = String(passwordPlain || '').trim();
    }

    if (!cleanInput || !cleanPassword) {
      return { success: false, message: 'कृपया मोबाइल नम्बर वा प्रयोगकर्ता नाम र पासवर्ड प्रविष्ट गर्नुहोस्।' };
    }

    // Rate limiting: max 10 failed attempts per IP per 10 minutes
    const attempt = this.loginAttempts.get(effectiveIp);
    if (attempt && attempt.lockedUntil > Date.now()) {
      const remainingMin = Math.ceil((attempt.lockedUntil - Date.now()) / 60000);
      return {
        success: false,
        message: `धेरै पटक गलत प्रयास गरियो। सुरक्षाका लागि यो IP ${remainingMin} मिनेटका लागि रोक्का गरिएको छ।`
      };
    }

    const cleanDigits = normalizeMobileNumber(cleanInput);
    const cleanUsername = cleanInput.toLowerCase();

    // Find user by either mobile number or username
    const user = this.users.find(u => {
      const uPhone = normalizeMobileNumber(u.phone);
      const uUser = String(u.username || '').toLowerCase();
      return (cleanDigits.length === 10 && uPhone === cleanDigits) || uUser === cleanUsername;
    });

    if (!user) {
      const currentCount = (attempt?.count || 0) + 1;
      const lockedUntil = currentCount >= 10 ? Date.now() + 10 * 60 * 1000 : 0;
      this.loginAttempts.set(effectiveIp, { count: currentCount, lockedUntil });
      return {
        success: false,
        message: 'यो प्रयोगकर्ता खाता फेला परेन। कृपया मोबाइल नम्बर वा युजरनेम जाँच्नुहोस् वा नयाँ खाता दर्ता गर्नुहोस्।'
      };
    }

    // Check account status
    if (user.accountStatus === 'suspended' || user.status === 'suspended') {
      return {
        success: false,
        message: 'यो खाता सुपरएडमिन द्वारा निलम्बन (Suspended) गरिएको छ। सहयोगका लागि प्रशासनमा सम्पर्क गर्नुहोस्।'
      };
    }

    // Verify password securely
    const isPassValid = verifyUserPassword(cleanPassword, user.passwordHash);
    if (!isPassValid) {
      const currentCount = (attempt?.count || 0) + 1;
      const lockedUntil = currentCount >= 10 ? Date.now() + 10 * 60 * 1000 : 0;
      this.loginAttempts.set(effectiveIp, { count: currentCount, lockedUntil });
      return {
        success: false,
        message: 'पासवर्ड मिलेन। कृपया सही पासवर्ड प्रविष्ट गर्नुहोस्।'
      };
    }

    // Reset login attempts on success
    this.loginAttempts.delete(effectiveIp);

    // Update last login
    user.lastLoginISO = new Date().toISOString();
    this.persistUsers();

    // Generate authenticated session
    const token = crypto.randomBytes(32).toString('hex');
    const sessionData: UserSessionData = {
      userId: user.id,
      username: user.username,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role,
      userCategory: user.userCategory || 'visitor',
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
    };
    this.activeSessions.set(token, sessionData);
    this.persistSessions();

    const sanitized = { ...user };
    delete (sanitized as any).passwordHash;

    return {
      success: true,
      message: 'लगइन सफल भयो!',
      user: sanitized,
      token,
      session: sessionData
    };
  }

  // =========================================================================
  // 3. SESSION MANAGEMENT
  // =========================================================================
  public validateSession(token: string): UserSessionData | null {
    if (!token) return null;
    const session = this.activeSessions.get(token);
    if (!session) return null;
    if (session.expiresAt < Date.now()) {
      this.activeSessions.delete(token);
      this.persistSessions();
      return null;
    }
    return session;
  }

  public revokeSession(token: string): boolean {
    if (this.activeSessions.has(token)) {
      this.activeSessions.delete(token);
      this.persistSessions();
      return true;
    }
    return false;
  }

  public createSession(user: { id: string; username?: string; phone?: string; fullName?: string; role?: string; userCategory?: UserCategory }): string {
    const token = crypto.randomBytes(32).toString('hex');
    this.activeSessions.set(token, {
      userId: user.id,
      username: user.username || user.phone || 'user',
      phone: user.phone || '',
      fullName: user.fullName || 'प्रयोगकर्ता',
      role: user.role || 'user',
      userCategory: user.userCategory || 'visitor',
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
    });
    this.persistSessions();
    return token;
  }

  // =========================================================================
  // 4. SUPER ADMIN USER CATEGORY MANAGEMENT (VISITOR / MEMBER / PROFESSIONAL)
  // =========================================================================
  public updateUserCategory(
    userId: string,
    category: UserCategory,
    adminUsername = 'SuperAdmin',
    reason = 'सुपर एडमिन द्वारा वर्ग परिवर्तन'
  ): { success: boolean; message: string; user?: any } {
    this.loadFromDisk();

    const user = this.users.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: 'प्रयोगकर्ता फेला परेन।' };
    }

    const prevCategory = user.userCategory || 'visitor';
    user.userCategory = category;
    user.lastUpdatedISO = new Date().toISOString();

    // Update role display
    if (category === 'professional') {
      user.roleNameNepali = 'व्यावसायिक प्रयोगकर्ता (Professional)';
    } else if (category === 'member') {
      user.roleNameNepali = 'सदस्य प्रयोगकर्ता (Member)';
    } else {
      user.roleNameNepali = 'साधारण प्रयोगकर्ता (विजिटर)';
    }

    this.persistUsers();
    this.syncLeadRecord(user);

    // Sync category with central database adapter
    try {
      const db = getDatabaseAdapter();
      db.updateUser(user.id, {
        userCategory: category,
        roleNameNepali: user.roleNameNepali,
        lastUpdatedISO: user.lastUpdatedISO
      }).catch(err => {
        console.warn('[authEngine] Central DB updateUserCategory notice:', err.message);
      });
    } catch {}

    // Record audit log
    const audit: AdminAuditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorUsername: adminUsername,
      action: 'USER_CATEGORY_CHANGED',
      targetUserId: user.id,
      targetUsername: user.username,
      previousValue: prevCategory,
      newValue: category,
      reason,
      timestampISO: new Date().toISOString()
    };
    this.auditLogs.unshift(audit);
    this.persistAuditLogs();

    // Send in-app notification to user
    const notif: SystemNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      type: 'CATEGORY_CHANGED',
      title: 'प्रयोगकर्ता श्रेणी अद्यावधिक',
      message: `तपाईंको खाता श्रेणी '${category === 'professional' ? 'व्यावसायिक' : category === 'member' ? 'सदस्य' : 'विजिटर'}' मा अद्यावधिक गरिएको छ।`,
      status: 'pending',
      scheduledAt: new Date().toISOString(),
      createdAtISO: new Date().toISOString()
    };
    this.notifications.unshift(notif);
    this.persistNotifications();

    const sanitized = { ...user };
    delete (sanitized as any).passwordHash;

    return {
      success: true,
      message: `प्रयोगकर्ताको वर्ग सफलतापूर्वक '${category}' मा परिवर्तन गरियो।`,
      user: sanitized
    };
  }

  // =========================================================================
  // 5. PHASE 11: PAYMENT & SUBSCRIPTION MANAGEMENT (OFFLINE / MANUAL & RECORDING)
  // =========================================================================
  public recordManualPayment(params: {
    userId: string;
    amountNPR: number;
    planId: string;
    planNameNepali: string;
    category: UserCategory;
    durationDays: number;
    paymentMethod?: string;
    transactionReference?: string;
    adminUsername: string;
    notes?: string;
  }): { success: boolean; message: string; subscription?: UserSubscription; payment?: PaymentRecord } {
    this.loadFromDisk();

    const user = this.users.find(u => u.id === params.userId);
    if (!user) {
      return { success: false, message: 'प्रयोगकर्ता फेला परेन।' };
    }

    const now = new Date();
    const durationDays = Math.max(1, Number(params.durationDays || 30));
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newSubscription: UserSubscription = {
      id: subscriptionId,
      userId: user.id,
      username: user.username,
      phone: user.phone,
      planId: params.planId,
      planNameNepali: params.planNameNepali,
      category: params.category,
      startAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'active',
      paymentAmountNPR: Number(params.amountNPR || 0),
      paymentStatus: 'paid',
      recordedBy: params.adminUsername,
      createdAtISO: now.toISOString(),
      updatedAtISO: now.toISOString()
    };

    this.subscriptions.unshift(newSubscription);
    this.persistSubscriptions();

    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newPayment: PaymentRecord = {
      id: paymentId,
      userId: user.id,
      subscriptionId,
      amountNPR: Number(params.amountNPR || 0),
      currency: 'NPR',
      paymentMethod: params.paymentMethod || 'offline_manual',
      paymentStatus: 'paid',
      transactionReference: params.transactionReference || `TXN-${Date.now()}`,
      recordedBy: params.adminUsername,
      notes: params.notes || 'काउन्टर वा बैंक मार्फत अफलाइन भुक्तानी प्राप्त',
      createdAtISO: now.toISOString()
    };

    this.payments.unshift(newPayment);
    this.persistPayments();

    // Update user profile with active subscription details & permissions
    user.userCategory = params.category;
    user.subscriptionPlan = params.planNameNepali;
    user.subscriptionStartAt = newSubscription.startAt;
    user.subscriptionExpiresAt = newSubscription.expiresAt;
    user.paymentAmountNPR = newPayment.amountNPR;
    user.paymentStatus = 'paid';
    user.remainingDays = durationDays;
    user.lastUpdatedISO = now.toISOString();

    if (params.category === 'professional') {
      user.roleNameNepali = 'व्यावसायिक प्रयोगकर्ता (Professional)';
      user.permissions = ['*'];
    } else {
      user.roleNameNepali = 'सदस्य प्रयोगकर्ता (Member)';
      user.permissions = ['member.view', 'member.dashboard', 'rashifal.personal', 'panchanga.view', 'faladesh.view'];
    }

    this.persistUsers();
    this.syncLeadRecord(user);

    // Audit log
    const audit: AdminAuditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      actorUsername: params.adminUsername,
      action: 'OFFLINE_PAYMENT_RECORDED',
      targetUserId: user.id,
      targetUsername: user.username,
      newValue: {
        plan: params.planNameNepali,
        amountNPR: params.amountNPR,
        category: params.category,
        durationDays
      },
      reason: params.notes || 'अफलाइन भुक्तानी दर्ता',
      timestampISO: now.toISOString()
    };
    this.auditLogs.unshift(audit);
    this.persistAuditLogs();

    return {
      success: true,
      message: `भुक्तानी रु. ${params.amountNPR} र सदस्यता '${params.planNameNepali}' सफलतापूर्वक सक्रिय भयो।`,
      subscription: newSubscription,
      payment: newPayment
    };
  }

  // =========================================================================
  // 6. PHASE 12 & 13: AUTOMATIC SUBSCRIPTION EXPIRY & ADVANCE REMINDERS (1 MONTH)
  // =========================================================================
  public runExpiryAndNotificationCheck(): { expiredCount: number; remindersCount: number } {
    this.loadFromDisk();

    const now = Date.now();
    let expiredCount = 0;
    let remindersCount = 0;

    for (const sub of this.subscriptions) {
      if (sub.status !== 'active') continue;

      const expTime = new Date(sub.expiresAt).getTime();
      const remainingMs = expTime - now;
      const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));

      // 1. Check if expired
      if (remainingMs <= 0) {
        sub.status = 'expired';
        sub.updatedAtISO = new Date().toISOString();
        expiredCount++;

        // Revoke user privileges and downgrade to visitor
        const user = this.users.find(u => u.id === sub.userId);
        if (user) {
          user.userCategory = 'visitor';
          user.roleNameNepali = 'साधारण प्रयोगकर्ता (विजिटर)';
          user.remainingDays = 0;
          user.lastUpdatedISO = new Date().toISOString();

          // Send expiry notification to user
          this.notifications.unshift({
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId: user.id,
            subscriptionId: sub.id,
            type: 'SUBSCRIPTION_EXPIRED',
            title: 'सदस्यता म्याद समाप्त भयो',
            message: `तपाईंको '${sub.planNameNepali}' सदस्यता म्याद समाप्त भएको छ। सेवाहरू निरन्तर उपभोग गर्न कृपया तुरुन्त नवीकरण गर्नुहोस्।`,
            stage: 'expired',
            status: 'pending',
            scheduledAt: new Date().toISOString(),
            createdAtISO: new Date().toISOString()
          });

          // Send expiry alert to Super Admin
          this.notifications.unshift({
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId: 'superadmin',
            subscriptionId: sub.id,
            type: 'SUBSCRIPTION_EXPIRED',
            title: 'सदस्यता म्याद समाप्त सूचना (Super Admin)',
            message: `प्रयोगकर्ता: ${user.username} (${user.fullName}) — योजना: ${sub.planNameNepali} — म्याद समाप्त भयो।`,
            stage: 'expired',
            status: 'pending',
            scheduledAt: new Date().toISOString(),
            createdAtISO: new Date().toISOString()
          });
        }
        continue;
      }

      // 2. Schedule Advance Expiry Reminders (~1 month = 30 days, 15 days, 7 days, 3 days, 1 day, today)
      let targetStage: SystemNotification['stage'] | null = null;
      let stageNepali = '';

      if (remainingDays >= 25 && remainingDays <= 30) {
        targetStage = '30_days';
        stageNepali = '१ महिना (३० दिन)';
      } else if (remainingDays >= 12 && remainingDays <= 15) {
        targetStage = '15_days';
        stageNepali = '१५ दिन';
      } else if (remainingDays >= 5 && remainingDays <= 7) {
        targetStage = '7_days';
        stageNepali = '७ दिन';
      } else if (remainingDays >= 2 && remainingDays <= 3) {
        targetStage = '3_days';
        stageNepali = '३ दिन';
      } else if (remainingDays === 1) {
        targetStage = '1_day';
        stageNepali = '१ दिन (भोलि)';
      } else if (remainingDays === 0) {
        targetStage = 'today';
        stageNepali = 'आज';
      }

      if (targetStage) {
        // Prevent duplicate reminder for the same subscription and stage
        const existing = this.notifications.find(
          n => n.subscriptionId === sub.id && n.stage === targetStage
        );

        if (!existing) {
          remindersCount++;
          const expDateFormatted = new Date(sub.expiresAt).toLocaleDateString('ne-NP');

          // User Notification
          this.notifications.unshift({
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId: sub.userId,
            subscriptionId: sub.id,
            type: `EXPIRY_REMINDER_${targetStage.toUpperCase()}`,
            title: `सदस्यता म्याद चेतावनी (${stageNepali} बाँकी)`,
            message: `तपाईंको '${sub.planNameNepali}' सदस्यता आगामी ${sub.expiresAt.split('T')[0]} मा समाप्त हुँदैछ। सेवाहरू सुचारु राख्न कृपया समयमै नवीकरण गर्नुहोस्।`,
            stage: targetStage,
            status: 'pending',
            scheduledAt: new Date().toISOString(),
            createdAtISO: new Date().toISOString()
          });

          // Super Admin Alert
          this.notifications.unshift({
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId: 'superadmin',
            subscriptionId: sub.id,
            type: `EXPIRY_REMINDER_${targetStage.toUpperCase()}`,
            title: `सदस्यता म्याद चेतावनी: ${sub.username}`,
            message: `प्रयोगकर्ता: ${sub.username} (${sub.phone}) — योजना: ${sub.planNameNepali} — म्याद सकिन ${stageNepali} बाँकी।`,
            stage: targetStage,
            status: 'pending',
            scheduledAt: new Date().toISOString(),
            createdAtISO: new Date().toISOString()
          });
        }
      }
    }

    if (expiredCount > 0 || remindersCount > 0) {
      this.persistUsers();
      this.persistSubscriptions();
      this.persistNotifications();
    }

    return { expiredCount, remindersCount };
  }

  // =========================================================================
  // 7. PHASE 9: SUPER ADMIN 16-COLUMN USER DATASET
  // =========================================================================
  public getAllUsersForAdmin(params: {
    search?: string;
    category?: string;
    subscriptionStatus?: string;
    paymentStatus?: string;
  }): any[] {
    this.loadFromDisk();
    this.runExpiryAndNotificationCheck();

    const search = (params.search || '').trim().toLowerCase();
    const categoryFilter = (params.category || 'all').toLowerCase();
    const subStatusFilter = (params.subscriptionStatus || 'all').toLowerCase();
    const payStatusFilter = (params.paymentStatus || 'all').toLowerCase();
    const now = Date.now();

    return this.users
      .map((u, idx) => {
        // Find latest active subscription
        const activeSub = this.subscriptions.find(s => s.userId === u.id && s.status === 'active');
        const latestSub = activeSub || this.subscriptions.find(s => s.userId === u.id);

        let remainingDays = 0;
        let subStatus: SubscriptionStatus = 'pending';
        let subPlan = u.subscriptionPlan || 'निःशुल्क (Visitor)';
        let startDate = u.subscriptionStartAt || null;
        let expiryDate = u.subscriptionExpiresAt || null;

        if (latestSub) {
          subPlan = latestSub.planNameNepali;
          startDate = latestSub.startAt;
          expiryDate = latestSub.expiresAt;
          subStatus = latestSub.status;
          if (latestSub.status === 'active') {
            const expMs = new Date(latestSub.expiresAt).getTime();
            remainingDays = Math.max(0, Math.ceil((expMs - now) / (24 * 60 * 60 * 1000)));
          }
        }

        const paymentAmount = u.paymentAmountNPR || latestSub?.paymentAmountNPR || 0;
        const paymentStatus = u.paymentStatus || latestSub?.paymentStatus || (paymentAmount > 0 ? 'paid' : 'pending');

        return {
          serialNumber: idx + 1, // Column 1
          id: u.id,
          fullName: u.fullName || 'अज्ञात', // Column 2
          address: u.address || 'नेपाल', // Column 3
          mobileNumber: u.phone || '', // Column 4
          username: u.username || '', // Column 5
          registrationDate: u.createdAtISO || new Date().toISOString(), // Column 6
          accountStatus: u.accountStatus || u.status || 'active', // Column 7
          userCategory: u.userCategory || 'visitor', // Column 8
          subscriptionPlan: subPlan, // Column 9
          paymentAmountNPR: paymentAmount, // Column 10 (Editable by Super Admin!)
          paymentStatus: paymentStatus, // Column 11
          subscriptionStartDate: startDate, // Column 12
          subscriptionExpiryDate: expiryDate, // Column 13
          remainingDays: remainingDays, // Column 14
          lastUpdated: u.lastUpdatedISO || u.createdAtISO || new Date().toISOString(), // Column 15
          actions: ['edit', 'change_category', 'record_payment', 'toggle_status', 'extend'] // Column 16
        };
      })
      .filter(u => {
        // Search filter
        if (search) {
          const matched =
            u.fullName.toLowerCase().includes(search) ||
            u.mobileNumber.toLowerCase().includes(search) ||
            u.username.toLowerCase().includes(search) ||
            u.address.toLowerCase().includes(search);
          if (!matched) return false;
        }

        // Category filter
        if (categoryFilter !== 'all' && u.userCategory.toLowerCase() !== categoryFilter) {
          return false;
        }

        // Subscription status filter
        if (subStatusFilter !== 'all') {
          if (subStatusFilter === 'active' && u.remainingDays <= 0) return false;
          if (subStatusFilter === 'expired' && u.remainingDays > 0) return false;
        }

        // Payment status filter
        if (payStatusFilter !== 'all' && u.paymentStatus.toLowerCase() !== payStatusFilter) {
          return false;
        }

        return true;
      });
  }

  // =========================================================================
  // 8. NOTIFICATIONS & AUDIT QUERY METHODS
  // =========================================================================
  public getUserNotifications(userId: string): SystemNotification[] {
    this.loadFromDisk();
    return this.notifications.filter(n => n.userId === userId || n.userId === 'all');
  }

  public getAdminNotifications(): SystemNotification[] {
    this.loadFromDisk();
    return this.notifications.filter(n => n.userId === 'superadmin' || n.userId === 'all');
  }

  public getAdminAuditLogs(): AdminAuditEntry[] {
    this.loadFromDisk();
    return this.auditLogs;
  }
}

export const authEngine = new AuthEngine();
