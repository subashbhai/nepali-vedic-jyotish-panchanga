import crypto from 'crypto';
import {
  generateSecureOTP,
  hashOTP,
  normalizePhoneNumber,
  normalizeEmail,
  smsProviderService,
  emailProviderService
} from './otpProviderService';

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

class AuthEngine {
  private registrationChallenges = new Map<string, RegistrationChallenge>();
  private activeSessions = new Map<string, UserSessionData>();
  private ipRateLimits = new Map<string, { count: number; resetAt: number }>();

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
  ): Promise<{ success: boolean; challengeId?: string; message: string; error?: string }> {
    // 1. Rate limiting
    if (!this.checkRateLimit(clientIp, 10, 60000).allowed) {
      return {
        success: false,
        message: 'धेरै पटक प्रयास भयो। कृपया १ मिनेटपछि पुनः प्रयास गर्नुहोस्।'
      };
    }

    // 2. Validate Full Name
    const fullName = String(fullNameRaw || '').trim();
    if (!fullName || fullName.length < 2 || fullName.length > 70) {
      return {
        success: false,
        message: 'कृपया पूरा नाम (२ देखि ७० अक्षरभित्र) अनिवार्य रूपमा प्रविष्ट गर्नुहोस्।'
      };
    }

    // 3. Validate Phone Number
    const phoneNorm = normalizePhoneNumber(phoneRaw);
    if (!phoneNorm.valid) {
      return {
        success: false,
        message: 'कृपया मान्य १० अङ्कको मोबाइल नम्बर प्रविष्ट गर्नुहोस् (उदा: ९८xxxxxxxx वा ९७xxxxxxxx)।'
      };
    }

    // 4. Validate Email
    const emailNorm = normalizeEmail(emailRaw);
    if (!emailNorm.valid) {
      return {
        success: false,
        message: 'कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस् (उदा: yourname@gmail.com)।'
      };
    }

    // 5. Uniqueness check against existing verified accounts
    const clean10 = phoneNorm.display.slice(-10);
    const existing = existingUsers.find(u => {
      const uPhone = String(u.phone || '').replace(/\D/g, '').slice(-10);
      const uEmail = String(u.email || '').trim().toLowerCase();
      return uPhone === clean10 || (uEmail && uEmail === emailNorm.normalized);
    });

    if (existing) {
      return {
        success: false,
        message: 'यो मोबाइल नम्बर वा इमेल पहिले नै दर्ता भएको खातासँग आबद्ध छ। कृपया लगइन वा खाता पुनःप्राप्ति गर्नुहोस्।'
      };
    }

    // 6. Generate Dual OTPs and Salt
    const salt = crypto.randomBytes(16).toString('hex');
    const phoneOtp = generateSecureOTP();
    const emailOtp = generateSecureOTP();

    const phoneOtpHashed = hashOTP(phoneOtp, salt);
    const emailOtpHashed = hashOTP(emailOtp, salt);

    const challengeId = `reg_ch_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const now = Date.now();

    const challenge: RegistrationChallenge = {
      challengeId,
      fullName,
      phone: clean10,
      phoneNormalized: phoneNorm.normalized,
      email: emailNorm.normalized,
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

    // Store in active challenge registry
    this.registrationChallenges.set(challengeId, challenge);

    // 7. Dispatch OTPs concurrently through Real Providers
    const [smsRes, emailRes] = await Promise.all([
      smsProviderService.sendSMS(phoneNorm.normalized, phoneOtp),
      emailProviderService.sendEmail(emailNorm.normalized, emailOtp, { fullName })
    ]);

    if (!smsRes.success && !emailRes.success) {
      this.registrationChallenges.delete(challengeId);
      return {
        success: false,
        message: `OTP पठाउन सकिएन। SMS: ${smsRes.error || 'त्रुटि'}, इमेल: ${emailRes.error || 'त्रुटि'}`
      };
    }

    return {
      success: true,
      challengeId,
      message: 'तपाईंको मोबाइल नम्बर र इमेल ठेगानामा अलग-अलग ६ अङ्कको सुरक्षा कोड (OTP) पठाइएको छ।'
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
        return {
          success: false,
          phoneVerified: false,
          emailVerified: false,
          isBothVerified: false,
          message: 'धेरै पटक गलत OTP प्रविष्ट गरियो। सुरक्षाका लागि यो सत्र रद्द गरियो।'
        };
      }
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
        return {
          success: false,
          phoneVerified: false,
          emailVerified: false,
          isBothVerified: false,
          message: 'धेरै पटक गलत इमेल OTP प्रविष्ट गरियो। सुरक्षाका लागि यो सत्र रद्द गरियो।'
        };
      }
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
  ): Promise<{ success: boolean; message: string }> {
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

    const promises: Promise<any>[] = [];

    if (target === 'phone' || target === 'both') {
      const newPhoneOtp = generateSecureOTP();
      challenge.phoneOtpHashed = hashOTP(newPhoneOtp, newSalt);
      challenge.phoneAttempts = 0;
      challenge.lastPhoneResendAt = now;
      promises.push(smsProviderService.sendSMS(challenge.phoneNormalized, newPhoneOtp));
    }

    if (target === 'email' || target === 'both') {
      const newEmailOtp = generateSecureOTP();
      challenge.emailOtpHashed = hashOTP(newEmailOtp, newSalt);
      challenge.emailAttempts = 0;
      challenge.lastEmailResendAt = now;
      promises.push(emailProviderService.sendEmail(challenge.email, newEmailOtp, { fullName: challenge.fullName }));
    }

    await Promise.all(promises);
    return { success: true, message: 'नयाँ प्रमाणीकरण कोड (OTP) पुनः पठाइएको छ।' };
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
      emailVerified: true,
      profileCompleted: false, // Second stage profile completion pending
      permissions: ['store.view', 'kundali.view', 'profile.edit', 'yajaman.view'],
      address: '',
      gender: 'other',
      birthDetails: null,
      createdAtISO: now.toISOString(),
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

    return {
      success: true,
      user: newUser,
      token,
      message: 'साइन अप सफल भयो! स्वागत छ।'
    };
  }

  // Session validation middleware helper
  validateSession(token: string): UserSessionData | null {
    if (!token) return null;
    const session = this.activeSessions.get(token);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      this.activeSessions.delete(token);
      return null;
    }
    return session;
  }

  revokeSession(token: string): void {
    if (token) this.activeSessions.delete(token);
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
    return token;
  }

  getChallenge(challengeId: string): RegistrationChallenge | undefined {
    return this.registrationChallenges.get(challengeId);
  }

  resetForTesting(): void {
    this.registrationChallenges.clear();
    this.activeSessions.clear();
    this.ipRateLimits.clear();
  }
}

export const authEngine = new AuthEngine();
