import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {
  generateSecureOTP,
  hashOTP,
  normalizePhoneNumber,
  normalizeEmail,
  smsProviderService,
  emailProviderService,
  whatsappProviderService
} from './otpProviderService';

export type OTPChannel = 'sms' | 'whatsapp' | 'email';

export interface SingleOTPChallenge {
  challengeId: string;
  channel: OTPChannel;
  destination: string; // standard 10 digits for phone or normalized email
  destinationNormalized: string; // +977... or email
  destinationMasked: string; // e.g. ९८****०५३३ or s***h@gmail.com
  countryCode?: string;
  otpHashed: string;
  salt: string;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  expiresAt: number;
  lastResendAt: number;
  resendCount: number;
  verified: boolean;
  purpose: 'login' | 'signup' | 'verification';
  fullName?: string;
}

export interface RegistrationChallenge {
  challengeId: string;
  fullName: string;
  phone: string; // standard 10 digits
  phoneNormalized: string; // +977...
  email: string;
  phoneOtpHashed: string;
  emailOtpHashed: string;
  salt: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  phoneAttempts: number;
  emailAttempts: number;
  createdAt: number;
  expiresAt: number;
  lastPhoneResendAt: number;
  lastEmailResendAt: number;
  resendCount: number;
}

export interface UserSessionData {
  userId: string;
  phone: string;
  email?: string;
  fullName: string;
  role: string;
  profileCompleted: boolean;
  expiresAt: number;
}

const CHALLENGE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_VERIFICATION_ATTEMPTS = 5;
const MAX_RESEND_COUNT = 3;

const DATA_DIR = path.resolve(process.cwd(), 'data');
const CHALLENGES_FILE = path.join(DATA_DIR, 'otp_challenges.json');
const SINGLE_CHALLENGES_FILE = path.join(DATA_DIR, 'otp_single_challenges.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'active_sessions.json');

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

/**
 * Diagnostic Masking Utilities (Complies with Zero Secret Leakage security standards)
 */
export function maskPhoneNumber(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length <= 4) return '****';
  return digits.slice(0, 2) + '****' + digits.slice(-4);
}

export function maskEmailAddress(email: string): string {
  if (!email || !email.includes('@')) return '***@***';
  const [local, domain] = email.split('@');
  const maskedLocal = local.length <= 2 ? local[0] + '***' : local[0] + '***' + local[local.length - 1];
  return `${maskedLocal}@${domain}`;
}

export function logAuthAudit(event: string, meta: Record<string, any>) {
  const timestamp = new Date().toISOString();
  const entry = {
    timestamp,
    event,
    ...meta
  };
  console.log(`[AUTH_AUDIT] ${timestamp} [${event}]`, JSON.stringify(entry));
  try {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.appendFileSync(path.join(dataDir, 'otp_audit.log'), JSON.stringify(entry) + '\n');
  } catch {}
}

class AuthEngine {
  private registrationChallenges = new Map<string, RegistrationChallenge>();
  private singleOtpChallenges = new Map<string, SingleOTPChallenge>();
  private activeSessions = new Map<string, UserSessionData>();
  private ipRateLimits = new Map<string, { count: number; resetAt: number }>();

  constructor() {
    this.loadFromDisk();
  }

  public loadFromDisk(): void {
    try {
      if (fs.existsSync(CHALLENGES_FILE)) {
        const raw = JSON.parse(fs.readFileSync(CHALLENGES_FILE, 'utf-8'));
        if (Array.isArray(raw)) {
          const now = Date.now();
          raw.forEach((c: RegistrationChallenge) => {
            if (c && c.expiresAt > now) {
              this.registrationChallenges.set(c.challengeId, c);
            }
          });
        }
      }
      if (fs.existsSync(SINGLE_CHALLENGES_FILE)) {
        const raw = JSON.parse(fs.readFileSync(SINGLE_CHALLENGES_FILE, 'utf-8'));
        if (Array.isArray(raw)) {
          const now = Date.now();
          raw.forEach((c: SingleOTPChallenge) => {
            if (c && c.expiresAt > now) {
              this.singleOtpChallenges.set(c.challengeId, c);
            }
          });
        }
      }
      if (fs.existsSync(SESSIONS_FILE)) {
        const raw = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
        if (typeof raw === 'object' && raw !== null) {
          const now = Date.now();
          Object.entries(raw).forEach(([token, sess]: [string, any]) => {
            if (sess && sess.expiresAt > now) {
              this.activeSessions.set(token, sess);
            }
          });
        }
      }
    } catch (err) {
      console.warn('[AuthEngine] Error loading state from disk:', err);
    }
  }

  private persistChallenges(): void {
    const list = Array.from(this.registrationChallenges.values());
    writeJsonAtomic(CHALLENGES_FILE, list);
  }

  private persistSingleChallenges(): void {
    const list = Array.from(this.singleOtpChallenges.values());
    writeJsonAtomic(SINGLE_CHALLENGES_FILE, list);
  }

  private persistSessions(): void {
    const obj: Record<string, UserSessionData> = {};
    this.activeSessions.forEach((val, key) => {
      obj[key] = val;
    });
    writeJsonAtomic(SESSIONS_FILE, obj);
  }

  // Helper: check rate limit per IP
  checkRateLimit(ip: string, maxRequests: number = 20, windowMs: number = 60000): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const record = this.ipRateLimits.get(ip);
    if (!record || now > record.resetAt) {
      this.ipRateLimits.set(ip, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: maxRequests - 1 };
    }
    if (record.count >= maxRequests) {
      return { allowed: false, remaining: 0 };
    }
    record.count++;
    return { allowed: true, remaining: maxRequests - record.count };
  }

  /**
   * Phase 4 & 5: Initiates registration with exactly 3 fields.
   * Full Name, Mobile Number, Email Address.
   */
  async startRegistration(
    fullNameRaw: string,
    phoneRaw: string,
    emailRaw: string,
    existingUsers: Array<{ phone?: string; email?: string }>,
    clientIp: string = 'unknown'
  ): Promise<{
    success: boolean;
    challengeId?: string;
    message: string;
    deliveryStatus?: any;
    devHint?: { phoneOtp: string; emailOtp: string };
    isDevMock?: boolean;
    partialDelivery?: boolean;
    error?: string;
  }> {
    logAuthAudit('SIGNUP_REQUEST_RECEIVED', {
      phone: maskPhoneNumber(phoneRaw),
      email: maskEmailAddress(emailRaw),
      clientIp
    });

    // 1. Rate limiting
    if (!this.checkRateLimit(clientIp, 10, 60000).allowed) {
      logAuthAudit('SIGNUP_RATE_LIMITED', { clientIp });
      return {
        success: false,
        message: 'धेरै पटक प्रयास भयो। कृपया १ मिनेटपछि पुनः प्रयास गर्नुहोस्।'
      };
    }

    // 2. Validate Full Name
    const fullName = String(fullNameRaw || '').trim();
    if (!fullName || fullName.length < 2 || fullName.length > 70) {
      logAuthAudit('SIGNUP_VALIDATION_FAILED', { reason: 'invalid_full_name' });
      return {
        success: false,
        message: 'कृपया पूरा नाम (२ देखि ७० अक्षरभित्र) अनिवार्य रूपमा प्रविष्ट गर्नुहोस्।'
      };
    }

    // 3. Validate Phone Number
    const phoneNorm = normalizePhoneNumber(phoneRaw);
    if (!phoneNorm.valid) {
      logAuthAudit('SIGNUP_VALIDATION_FAILED', { reason: 'invalid_phone_number' });
      return {
        success: false,
        message: 'कृपया मान्य १० अङ्कको मोबाइल नम्बर प्रविष्ट गर्नुहोस् (उदा: ९८xxxxxxxx वा ९७xxxxxxxx)।'
      };
    }

    // 4. Validate Email
    const emailNorm = normalizeEmail(emailRaw);
    if (!emailNorm.valid) {
      logAuthAudit('SIGNUP_VALIDATION_FAILED', { reason: 'invalid_email' });
      return {
        success: false,
        message: 'कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस् (उदा: yourname@gmail.com)।'
      };
    }

    // 5. Uniqueness validation: Check against existing accounts
    const clean10Digits = phoneNorm.display;
    const cleanEmail = emailNorm.normalized;

    const duplicateUser = existingUsers.find(u => {
      const uPhone = (u.phone || '').replace(/\D/g, '').slice(-10);
      const uEmail = (u.email || '').toLowerCase().trim();
      return (uPhone && uPhone === clean10Digits) || (uEmail && uEmail === cleanEmail);
    });

    if (duplicateUser) {
      logAuthAudit('SIGNUP_DUPLICATE_ACCOUNT', {
        phone: maskPhoneNumber(clean10Digits),
        email: maskEmailAddress(cleanEmail)
      });
      return {
        success: false,
        message: 'यो मोबाइल नम्बर वा इमेल पहिले नै दर्ता भएको खातासँग आबद्ध छ। कृपया लगइन वा खाता पुनःप्राप्ति गर्नुहोस्।'
      };
    }

    // 6. Generate secure 6-digit OTPs and unique cryptographic salt
    const phoneOtp = generateSecureOTP();
    const emailOtp = generateSecureOTP();
    const salt = crypto.randomBytes(16).toString('hex');

    const phoneOtpHashed = hashOTP(phoneOtp, salt);
    const emailOtpHashed = hashOTP(emailOtp, salt);

    const now = Date.now();
    const challengeId = `ch_${now}_${crypto.randomBytes(6).toString('hex')}`;

    const challenge: RegistrationChallenge = {
      challengeId,
      fullName,
      phone: clean10Digits,
      phoneNormalized: phoneNorm.normalized,
      email: cleanEmail,
      phoneOtpHashed,
      emailOtpHashed,
      salt,
      phoneVerified: false,
      emailVerified: false,
      phoneAttempts: 0,
      emailAttempts: 0,
      createdAt: now,
      expiresAt: now + CHALLENGE_EXPIRY_MS,
      lastPhoneResendAt: now,
      lastEmailResendAt: now,
      resendCount: 0
    };

    // Store in persistent state
    this.registrationChallenges.set(challengeId, challenge);
    this.persistChallenges();

    logAuthAudit('CHALLENGE_CREATED', {
      challengeId,
      phone: maskPhoneNumber(challenge.phoneNormalized),
      email: maskEmailAddress(challenge.email),
      expiresAt: new Date(challenge.expiresAt).toISOString()
    });

    // 7. Dispatch SMS and Email via real provider adapters concurrently
    const [smsResult, emailResult] = await Promise.all([
      smsProviderService.sendSMS(challenge.phoneNormalized, phoneOtp, {
        appName: 'बालानन्द वैदिक ज्योतिष सेवा'
      }),
      emailProviderService.sendEmail(challenge.email, emailOtp, {
        fullName: challenge.fullName,
        appName: 'बालानन्द वैदिक ज्योतिष सेवा'
      })
    ]);

    logAuthAudit('OTP_DISPATCH_RESULTS', {
      challengeId,
      sms: {
        provider: smsResult.provider,
        channelStatus: smsResult.channelStatus,
        isMock: smsResult.isMock,
        success: smsResult.success,
        error: smsResult.error
      },
      email: {
        provider: emailResult.provider,
        channelStatus: emailResult.channelStatus,
        isMock: emailResult.isMock,
        success: emailResult.success,
        error: emailResult.error
      }
    });

    const isProduction = process.env.NODE_ENV === 'production';
    const bothMock = smsResult.isMock && emailResult.isMock;

    // Case 1: Both in simulation/mock mode
    if (bothMock) {
      console.log(`[SERVER_DEV_OTP_SIGNUP] Phone OTP: ${phoneOtp} | Email OTP: ${emailOtp}`);
      return {
        success: true,
        challengeId,
        isDevMock: true,
        deliveryStatus: {
          sms: { success: true, provider: smsResult.provider, isMock: true, status: smsResult.channelStatus },
          email: { success: true, provider: emailResult.provider, isMock: true, status: emailResult.channelStatus },
          isMock: true
        },
        message: 'तपाईंको मोबाइल र इमेलमा ६ अङ्कको सुरक्षा कोड पठाइएको छ।'
      };
    }

    // Case 2: Both real gateways succeeded
    if (smsResult.success && emailResult.success) {
      return {
        success: true,
        challengeId,
        isDevMock: false,
        deliveryStatus: {
          sms: { success: true, provider: smsResult.provider, isMock: false, status: smsResult.channelStatus },
          email: { success: true, provider: emailResult.provider, isMock: false, status: emailResult.channelStatus },
          isMock: false
        },
        message: 'तपाईंको मोबाइल र इमेल दुवैमा ६ अङ्कको गोप्य सुरक्षा कोड (OTP) पठाइएको छ।'
      };
    }

    // Case 3: Mobile SMS succeeded, but Email failed
    if (smsResult.success && !emailResult.success) {
      return {
        success: true,
        challengeId,
        partialDelivery: true,
        deliveryStatus: {
          sms: { success: true, provider: smsResult.provider, isMock: smsResult.isMock, status: smsResult.channelStatus },
          email: { success: false, provider: emailResult.provider, error: emailResult.error, status: emailResult.channelStatus }
        },
        message: `मोबाइलमा SMS OTP पठाइयो। तर इमेल पठाउन सकिएन (${emailResult.error || 'इमेल गेटवे समस्या'})। तपाईं मोबाइल कोडबाट प्रमाणीकरण अघि बढाउन सक्नुहुन्छ।`
      };
    }

    // Case 4: Email succeeded, but Mobile SMS failed
    if (!smsResult.success && emailResult.success) {
      return {
        success: true,
        challengeId,
        partialDelivery: true,
        deliveryStatus: {
          sms: { success: false, provider: smsResult.provider, error: smsResult.error, status: smsResult.channelStatus },
          email: { success: true, provider: emailResult.provider, isMock: emailResult.isMock, status: emailResult.channelStatus }
        },
        message: `इमेलमा OTP पठाइयो। तर मोबाइलमा SMS पठाउन सकिएन (${smsResult.error || 'SMS गेटवे समस्या'})। कृपया इमेलबाट प्राप्त कोड प्रविष्ट गर्नुहोस्।`
      };
    }

    // Case 5: Both failed
    this.registrationChallenges.delete(challengeId);
    this.persistChallenges();
    return {
      success: false,
      deliveryStatus: {
        sms: { success: false, provider: smsResult.provider, error: smsResult.error },
        email: { success: false, provider: emailResult.provider, error: emailResult.error }
      },
      message: `OTP पठाउन सकिएन। SMS: ${smsResult.error || 'अज्ञात समस्या'}, Email: ${emailResult.error || 'अज्ञात समस्या'}`
    };
  }

  /**
   * Phase 5: Verify Mobile OTP
   */
  verifyPhoneOTP(
    challengeId: string,
    enteredOtp: string
  ): { success: boolean; phoneVerified: boolean; emailVerified: boolean; isBothVerified: boolean; message: string } {
    const challenge = this.registrationChallenges.get(challengeId);
    if (!challenge) {
      return {
        success: false,
        phoneVerified: false,
        emailVerified: false,
        isBothVerified: false,
        message: 'दर्ता सत्र (Session) फेला परेन वा म्याद समाप्त भयो। कृपया पुनः सुरु गर्नुहोस्।'
      };
    }

    if (Date.now() > challenge.expiresAt) {
      this.registrationChallenges.delete(challengeId);
      this.persistChallenges();
      return {
        success: false,
        phoneVerified: false,
        emailVerified: false,
        isBothVerified: false,
        message: 'OTP को ५ मिनेटको समय समाप्त भएको छ। कृपया नयाँ कोड माग्नुहोस्।'
      };
    }

    if (challenge.phoneAttempts >= MAX_VERIFICATION_ATTEMPTS) {
      this.registrationChallenges.delete(challengeId);
      this.persistChallenges();
      return {
        success: false,
        phoneVerified: false,
        emailVerified: false,
        isBothVerified: false,
        message: 'धेरै पटक गलत OTP प्रविष्ट गरियो। सुरक्षाका लागि यो सत्र रद्द गरियो।'
      };
    }

    const cleanInput = String(enteredOtp || '').trim();
    const computedHash = hashOTP(cleanInput, challenge.salt);

    if (computedHash !== challenge.phoneOtpHashed) {
      challenge.phoneAttempts++;
      if (challenge.phoneAttempts >= MAX_VERIFICATION_ATTEMPTS) {
        this.registrationChallenges.delete(challengeId);
        this.persistChallenges();
        return {
          success: false,
          phoneVerified: false,
          emailVerified: false,
          isBothVerified: false,
          message: 'धेरै पटक गलत OTP प्रविष्ट गरियो। सुरक्षाका लागि यो सत्र रद्द गरियो।'
        };
      }
      this.persistChallenges();
      const remaining = MAX_VERIFICATION_ATTEMPTS - challenge.phoneAttempts;
      return {
        success: false,
        phoneVerified: false,
        emailVerified: challenge.emailVerified,
        isBothVerified: false,
        message: `गलत मोबाइल OTP कोड! बाँकी प्रयास: ${remaining}`
      };
    }

    // Success
    challenge.phoneVerified = true;
    this.persistChallenges();
    const isBothVerified = challenge.phoneVerified && challenge.emailVerified;

    return {
      success: true,
      phoneVerified: true,
      emailVerified: challenge.emailVerified,
      isBothVerified,
      message: 'मोबाइल नम्बर सफलतापूर्वक प्रमाणीकरण भयो!'
    };
  }

  /**
   * Phase 5: Verify Email OTP
   */
  verifyEmailOTP(
    challengeId: string,
    enteredOtp: string
  ): { success: boolean; phoneVerified: boolean; emailVerified: boolean; isBothVerified: boolean; message: string } {
    const challenge = this.registrationChallenges.get(challengeId);
    if (!challenge) {
      return {
        success: false,
        phoneVerified: false,
        emailVerified: false,
        isBothVerified: false,
        message: 'दर्ता सत्र (Session) फेला परेन वा म्याद समाप्त भयो। कृपया पुनः सुरु गर्नुहोस्।'
      };
    }

    if (Date.now() > challenge.expiresAt) {
      this.registrationChallenges.delete(challengeId);
      this.persistChallenges();
      return {
        success: false,
        phoneVerified: false,
        emailVerified: false,
        isBothVerified: false,
        message: 'OTP को ५ मिनेटको समय समाप्त भएको छ। कृपया नयाँ कोड माग्नुहोस्।'
      };
    }

    if (challenge.emailAttempts >= MAX_VERIFICATION_ATTEMPTS) {
      this.registrationChallenges.delete(challengeId);
      this.persistChallenges();
      return {
        success: false,
        phoneVerified: false,
        emailVerified: false,
        isBothVerified: false,
        message: 'धेरै पटक गलत इमेल OTP प्रविष्ट गरियो। सुरक्षाका लागि यो सत्र रद्द गरियो।'
      };
    }

    const cleanInput = String(enteredOtp || '').trim();
    const computedHash = hashOTP(cleanInput, challenge.salt);

    if (computedHash !== challenge.emailOtpHashed) {
      challenge.emailAttempts++;
      if (challenge.emailAttempts >= MAX_VERIFICATION_ATTEMPTS) {
        this.registrationChallenges.delete(challengeId);
        this.persistChallenges();
        return {
          success: false,
          phoneVerified: false,
          emailVerified: false,
          isBothVerified: false,
          message: 'धेरै पटक गलत इमेल OTP प्रविष्ट गरियो। सुरक्षाका लागि यो सत्र रद्द गरियो।'
        };
      }
      this.persistChallenges();
      const remaining = MAX_VERIFICATION_ATTEMPTS - challenge.emailAttempts;
      return {
        success: false,
        phoneVerified: challenge.phoneVerified,
        emailVerified: false,
        isBothVerified: false,
        message: `गलत इमेल OTP कोड! बाँकी प्रयास: ${remaining}`
      };
    }

    // Success
    challenge.emailVerified = true;
    this.persistChallenges();
    const isBothVerified = challenge.phoneVerified && challenge.emailVerified;

    return {
      success: true,
      phoneVerified: challenge.phoneVerified,
      emailVerified: true,
      isBothVerified,
      message: 'इमेल ठेगाना सफलतापूर्वक प्रमाणीकरण भयो!'
    };
  }

  /**
   * Resend OTP with 60-second cooldown and maximum limits
   */
  async resendOTP(
    challengeId: string,
    target: 'phone' | 'email' | 'both'
  ): Promise<{ success: boolean; message: string; devHint?: { phoneOtp?: string; emailOtp?: string } }> {
    const challenge = this.registrationChallenges.get(challengeId);
    if (!challenge) {
      return { success: false, message: 'सत्र फेला परेन। कृपया पुनः सुरु गर्नुहोस्।' };
    }

    const now = Date.now();
    if (challenge.resendCount >= MAX_RESEND_COUNT) {
      return { success: false, message: 'अधिकतम पुनः पठाउने सीमा समाप्त भयो। कृपया नयाँ दर्ता फारम भर्नुहोस्।' };
    }

    const lastResend = Math.max(challenge.lastPhoneResendAt, challenge.lastEmailResendAt);
    if (now - lastResend < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - (now - lastResend)) / 1000);
      return { success: false, message: `कृपया नयाँ OTP माग्न ${waitSeconds} सेकेन्ड पर्खनुहोस्।` };
    }

    challenge.resendCount++;
    challenge.expiresAt = now + CHALLENGE_EXPIRY_MS; // Extend expiry

    const newSalt = crypto.randomBytes(16).toString('hex');
    challenge.salt = newSalt;

    let newPhoneOtp = '';
    let newEmailOtp = '';
    const promises: Promise<any>[] = [];

    if (target === 'phone' || target === 'both') {
      newPhoneOtp = generateSecureOTP();
      challenge.phoneOtpHashed = hashOTP(newPhoneOtp, newSalt);
      challenge.phoneAttempts = 0;
      challenge.lastPhoneResendAt = now;
      promises.push(smsProviderService.sendSMS(challenge.phoneNormalized, newPhoneOtp));
    }

    if (target === 'email' || target === 'both') {
      newEmailOtp = generateSecureOTP();
      challenge.emailOtpHashed = hashOTP(newEmailOtp, newSalt);
      challenge.emailAttempts = 0;
      challenge.lastEmailResendAt = now;
      promises.push(emailProviderService.sendEmail(challenge.email, newEmailOtp, { fullName: challenge.fullName }));
    }

    this.persistChallenges();
    await Promise.all(promises);

    logAuthAudit('OTP_RESEND_DISPATCHED', {
      challengeId,
      target,
      phone: maskPhoneNumber(challenge.phoneNormalized),
      email: maskEmailAddress(challenge.email),
      resendCount: challenge.resendCount
    });

    if (newPhoneOtp || newEmailOtp) {
      console.log(`[SERVER_DEV_OTP_RESEND] Phone OTP: ${newPhoneOtp || '---'} | Email OTP: ${newEmailOtp || '---'}`);
    }

    return {
      success: true,
      message: 'नयाँ प्रमाणीकरण कोड (OTP) पुनः पठाइएको छ।'
    };
  }

  /**
   * Phase 7: Atomically finalize account creation after BOTH OTPs are verified.
   */
  finalizeRegistration(challengeId: string): {
    success: boolean;
    user?: any;
    token?: string;
    message: string;
  } {
    const challenge = this.registrationChallenges.get(challengeId);
    if (!challenge) {
      return { success: false, message: 'दर्ता सत्र समाप्त भएको छ।' };
    }

    if (!challenge.phoneVerified || !challenge.emailVerified) {
      return {
        success: false,
        message: 'मोबाइल र इमेल दुवै अनिवार्य प्रमाणीकरण भएको हुनुपर्छ।'
      };
    }

    // Challenge consumed
    this.registrationChallenges.delete(challengeId);
    this.persistChallenges();

    const now = new Date();
    const userId = `usr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const token = crypto.randomBytes(32).toString('hex');

    const newUser = {
      id: userId,
      customerId: `सदस्य-२०८३-${Math.floor(1000 + Math.random() * 9000)}`,
      username: challenge.phone,
      phone: challenge.phone,
      email: challenge.email,
      fullName: challenge.fullName,
      role: 'CUSTOMER',
      roleNameNepali: 'यजमान / ग्राहक',
      status: 'active',
      mobileVerified: true,
      mobileVerifiedAtISO: now.toISOString(),
      emailVerified: true,
      emailVerifiedAtISO: now.toISOString(),
      profileCompleted: false, // Second stage profile completion pending
      permissions: ['store.view', 'kundali.view', 'profile.edit', 'yajaman.view'],
      address: '',
      gender: 'other',
      birthDetails: null,
      createdAtISO: now.toISOString(),
      updatedAtISO: now.toISOString(),
      lastLoginISO: now.toISOString()
    };

    // Store active session (30 days validity)
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    this.activeSessions.set(token, {
      userId: newUser.id,
      phone: newUser.phone,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
      profileCompleted: false,
      expiresAt
    });
    this.persistSessions();

    return {
      success: true,
      user: newUser,
      token,
      message: 'साइन अप सफल भयो! स्वागत छ।'
    };
  }

  /**
   * Unified Single OTP Challenge Creation (SMS, WhatsApp, Email)
   * Sends OTP strictly to the ONE selected channel only.
   * Zero secret leakage: plain OTP is NEVER sent to the client.
   */
  async createSingleOTPChallenge(params: {
    channel: OTPChannel;
    destination: string;
    countryCode?: string;
    fullName?: string;
    purpose?: 'login' | 'signup' | 'verification';
    clientIp?: string;
  }): Promise<{
    success: boolean;
    challengeId?: string;
    channel?: OTPChannel;
    maskedDestination?: string;
    message: string;
    isMock?: boolean;
    provider?: string;
    channelStatus?: string;
    error?: string;
  }> {
    const clientIp = params.clientIp || 'unknown';
    logAuthAudit('SINGLE_OTP_REQUEST_RECEIVED', {
      channel: params.channel,
      destination: params.channel === 'email' ? maskEmailAddress(params.destination) : maskPhoneNumber(params.destination),
      purpose: params.purpose,
      clientIp
    });

    // 1. IP Rate Limiting: 10 requests per minute
    if (!this.checkRateLimit(clientIp, 10, 60000).allowed) {
      logAuthAudit('SINGLE_OTP_RATE_LIMITED', { clientIp });
      return {
        success: false,
        message: 'धेरै पटक प्रयास भयो। कृपया १ मिनेटपछि पुनः प्रयास गर्नुहोस्।'
      };
    }

    // 2. Validate channel
    const validChannels: OTPChannel[] = ['sms', 'whatsapp', 'email'];
    if (!validChannels.includes(params.channel)) {
      return {
        success: false,
        message: 'अवैध प्रमाणीकरण माध्यम छनोट गरियो। कृपया SMS, WhatsApp वा Email रोज्नुहोस्।'
      };
    }

    // 3. Normalize & validate destination
    let cleanDestination = '';
    let normalizedDestination = '';
    let maskedDestination = '';

    if (params.channel === 'sms' || params.channel === 'whatsapp') {
      const phoneNorm = normalizePhoneNumber(params.destination);
      if (!phoneNorm.valid) {
        return {
          success: false,
          message: 'कृपया मान्य १० अङ्कको मोबाइल नम्बर प्रविष्ट गर्नुहोस् (उदा: ९८xxxxxxxx वा ९७xxxxxxxx)।'
        };
      }
      cleanDestination = phoneNorm.display;
      normalizedDestination = phoneNorm.normalized;
      maskedDestination = maskPhoneNumber(phoneNorm.display);
    } else {
      const emailNorm = normalizeEmail(params.destination);
      if (!emailNorm.valid) {
        return {
          success: false,
          message: 'कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस् (उदा: yourname@gmail.com)।'
        };
      }
      cleanDestination = emailNorm.normalized;
      normalizedDestination = emailNorm.normalized;
      maskedDestination = maskEmailAddress(emailNorm.normalized);
    }

    // 4. Generate cryptographically strong 6-digit OTP and unique salt
    const otp = generateSecureOTP();
    const salt = crypto.randomBytes(16).toString('hex');
    const otpHashed = hashOTP(otp, salt);

    const now = Date.now();
    const challengeId = `sotp_${now}_${crypto.randomBytes(6).toString('hex')}`;

    const challenge: SingleOTPChallenge = {
      challengeId,
      channel: params.channel,
      destination: cleanDestination,
      destinationNormalized: normalizedDestination,
      destinationMasked: maskedDestination,
      countryCode: params.countryCode || '+977',
      otpHashed,
      salt,
      attempts: 0,
      maxAttempts: MAX_VERIFICATION_ATTEMPTS,
      createdAt: now,
      expiresAt: now + CHALLENGE_EXPIRY_MS,
      lastResendAt: now,
      resendCount: 0,
      verified: false,
      purpose: params.purpose || 'login',
      fullName: params.fullName
    };

    this.singleOtpChallenges.set(challengeId, challenge);
    this.persistSingleChallenges();

    // 5. Dispatch strictly to the ONE selected channel
    let dispatchResult: any;
    if (params.channel === 'sms') {
      dispatchResult = await smsProviderService.sendSMS(normalizedDestination, otp, {
        appName: 'बालानन्द वैदिक ज्योतिष सेवा'
      });
    } else if (params.channel === 'whatsapp') {
      dispatchResult = await whatsappProviderService.sendWhatsApp(normalizedDestination, otp, {
        appName: 'बालानन्द वैदिक ज्योतिष सेवा',
        fullName: params.fullName
      });
    } else {
      dispatchResult = await emailProviderService.sendEmail(normalizedDestination, otp, {
        appName: 'बालानन्द वैदिक ज्योतिष सेवा',
        fullName: params.fullName || 'आदरणीय सदस्य'
      });
    }

    logAuthAudit('SINGLE_OTP_DISPATCH_RESULT', {
      challengeId,
      channel: params.channel,
      destination: maskedDestination,
      provider: dispatchResult.provider,
      isMock: dispatchResult.isMock,
      success: dispatchResult.success
    });

    // In dev simulation mode, log in server terminal for developer testing (NEVER sent to client)
    if (dispatchResult.isMock) {
      console.log(`[SERVER_DEV_OTP] Channel: ${params.channel.toUpperCase()} | Dest: ${cleanDestination} | Code: ${otp}`);
    }

    // If dispatch failed completely (and not mock)
    if (!dispatchResult.success && !dispatchResult.isMock) {
      this.singleOtpChallenges.delete(challengeId);
      this.persistSingleChallenges();
      return {
        success: false,
        message: `सुरक्षा कोड पठाउन सकिएन (${dispatchResult.error || 'गेटवे समस्या'})। कृपया पुनः प्रयास गर्नुहोस्।`,
        error: dispatchResult.error
      };
    }

    const channelNamesNepali: Record<OTPChannel, string> = {
      sms: 'मोबाइल SMS',
      whatsapp: 'WhatsApp',
      email: 'इमेल'
    };

    return {
      success: true,
      challengeId,
      channel: params.channel,
      maskedDestination,
      provider: dispatchResult.provider,
      isMock: dispatchResult.isMock,
      channelStatus: dispatchResult.channelStatus,
      message: `${channelNamesNepali[params.channel]} (${maskedDestination}) मा ६ अङ्कको गोप्य सुरक्षा कोड पठाइएको छ।`
    };
  }

  /**
   * Unified Single OTP Verification (Works for SMS, WhatsApp, and Email)
   */
  verifySingleOTPChallenge(
    challengeId: string,
    enteredOtp: string
  ): { success: boolean; challenge?: SingleOTPChallenge; message: string } {
    const challenge = this.singleOtpChallenges.get(challengeId);
    if (!challenge) {
      return {
        success: false,
        message: 'प्रमाणीकरण सत्र फेला परेन वा म्याद समाप्त भयो। कृपया पुनः सुरु गर्नुहोस्।'
      };
    }

    if (Date.now() > challenge.expiresAt) {
      this.singleOtpChallenges.delete(challengeId);
      this.persistSingleChallenges();
      return {
        success: false,
        message: 'OTP को ५ मिनेटको समय समाप्त भएको छ। कृपया नयाँ कोड माग्नुहोस्।'
      };
    }

    if (challenge.attempts >= challenge.maxAttempts) {
      this.singleOtpChallenges.delete(challengeId);
      this.persistSingleChallenges();
      return {
        success: false,
        message: 'धेरै पटक गलत OTP प्रविष्ट गरियो। सुरक्षाका लागि यो सत्र रद्द गरिएको छ।'
      };
    }

    const cleanInput = String(enteredOtp || '').trim().replace(/\D/g, '');
    if (cleanInput.length < 6) {
      return {
        success: false,
        message: 'कृपया ६ अङ्कको पूरा सुरक्षा कोड प्रविष्ट गर्नुहोस्।'
      };
    }

    const computedHash = hashOTP(cleanInput, challenge.salt);
    if (computedHash !== challenge.otpHashed) {
      challenge.attempts++;
      this.persistSingleChallenges();
      const remaining = challenge.maxAttempts - challenge.attempts;
      if (remaining <= 0) {
        this.singleOtpChallenges.delete(challengeId);
        this.persistSingleChallenges();
        return {
          success: false,
          message: 'धेरै पटक गलत OTP प्रविष्ट गरियो। सुरक्षाका लागि यो सत्र रद्द गरिएको छ।'
        };
      }
      return {
        success: false,
        message: `गलत सुरक्षा कोड! कृपया पुनः जाँच्नुहोस्। (बाँकी प्रयास: ${remaining})`
      };
    }

    // Success
    challenge.verified = true;
    this.persistSingleChallenges();
    logAuthAudit('SINGLE_OTP_VERIFIED_SUCCESS', {
      challengeId,
      channel: challenge.channel,
      destination: challenge.destinationMasked
    });

    return {
      success: true,
      challenge,
      message: 'सुरक्षा कोड सफलतापूर्वक प्रमाणीकरण भयो!'
    };
  }

  /**
   * Resend Single OTP with 60s cooldown and max 3 resends
   */
  async resendSingleOTP(challengeId: string): Promise<{
    success: boolean;
    message: string;
    remainingSeconds?: number;
    resendCount?: number;
  }> {
    const challenge = this.singleOtpChallenges.get(challengeId);
    if (!challenge) {
      return { success: false, message: 'सत्र फेला परेन। कृपया पुनः सुरु गर्नुहोस्।' };
    }

    const now = Date.now();
    if (challenge.resendCount >= MAX_RESEND_COUNT) {
      return { success: false, message: 'अधिकतम पुनः पठाउने सीमा समाप्त भयो (३ पटक)। कृपया नयाँ अनुरोध गर्नुहोस्।' };
    }

    if (now - challenge.lastResendAt < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - (now - challenge.lastResendAt)) / 1000);
      return { success: false, message: `कृपया नयाँ कोड माग्न ${waitSeconds} सेकेन्ड पर्खनुहोस्।`, remainingSeconds: waitSeconds };
    }

    challenge.resendCount++;
    challenge.expiresAt = now + CHALLENGE_EXPIRY_MS;
    challenge.lastResendAt = now;
    challenge.attempts = 0; // reset attempts for fresh code

    const newSalt = crypto.randomBytes(16).toString('hex');
    const newOtp = generateSecureOTP();
    challenge.salt = newSalt;
    challenge.otpHashed = hashOTP(newOtp, newSalt);
    this.persistSingleChallenges();

    if (challenge.channel === 'sms') {
      await smsProviderService.sendSMS(challenge.destinationNormalized, newOtp);
    } else if (challenge.channel === 'whatsapp') {
      await whatsappProviderService.sendWhatsApp(challenge.destinationNormalized, newOtp, { fullName: challenge.fullName });
    } else {
      await emailProviderService.sendEmail(challenge.destinationNormalized, newOtp, { fullName: challenge.fullName });
    }

    logAuthAudit('SINGLE_OTP_RESENT', {
      challengeId,
      channel: challenge.channel,
      destination: challenge.destinationMasked,
      resendCount: challenge.resendCount
    });

    console.log(`[SERVER_DEV_OTP_RESEND] Channel: ${challenge.channel.toUpperCase()} | Dest: ${challenge.destination} | Code: ${newOtp}`);

    return {
      success: true,
      message: 'नयाँ प्रमाणीकरण कोड पुनः पठाइएको छ।',
      resendCount: challenge.resendCount,
      remainingSeconds: 60
    };
  }

  getSingleChallenge(challengeId: string): SingleOTPChallenge | undefined {
    return this.singleOtpChallenges.get(challengeId);
  }

  consumeSingleChallenge(challengeId: string): void {
    this.singleOtpChallenges.delete(challengeId);
    this.persistSingleChallenges();
  }

  // Session validation middleware helper
  validateSession(token: string): UserSessionData | null {
    if (!token) return null;
    const session = this.activeSessions.get(token);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      this.activeSessions.delete(token);
      this.persistSessions();
      return null;
    }
    return session;
  }

  revokeSession(token: string): void {
    if (token) {
      this.activeSessions.delete(token);
      this.persistSessions();
    }
  }

  createSession(user: { id: string; phone: string; email?: string; fullName: string; role: string; profileCompleted?: boolean }): string {
    const token = crypto.randomBytes(32).toString('hex');
    this.activeSessions.set(token, {
      userId: user.id,
      phone: user.phone,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      profileCompleted: Boolean(user.profileCompleted),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
    });
    this.persistSessions();
    return token;
  }

  getChallenge(challengeId: string): RegistrationChallenge | undefined {
    return this.registrationChallenges.get(challengeId);
  }

  resetForTesting(): void {
    this.registrationChallenges.clear();
    this.activeSessions.clear();
    this.ipRateLimits.clear();
    this.persistChallenges();
    this.persistSessions();
  }
}

export const authEngine = new AuthEngine();
