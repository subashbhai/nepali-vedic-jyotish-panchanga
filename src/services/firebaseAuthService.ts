/**
 * Balananda Firebase Service & Phone Authentication
 * Project: balananda-vaidik-sewa
 * Configuration provided by Firebase Console
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult, Auth, UserCredential } from 'firebase/auth';
import { apiClient } from './apiClient';
import { RBACSession, setRBACSession } from '../db/rbacStore';
import { fromDevanagariNumerals } from '../utils/nepaliCalendar';

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Authoritative Firebase Configuration
export const BALANANDA_FIREBASE_CONFIG: FirebaseClientConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAO2mSw16bXlASlNPwjXRa9c8cNOk-Qaeg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "balananda-vaidik-sewa.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "balananda-vaidik-sewa",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "balananda-vaidik-sewa.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "300738709131",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:300738709131:web:3c308f285e9f85dfce368e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-BRNS1W48QD"
};

// Singleton instances
let firebaseAppInstance: FirebaseApp | null = null;
let firebaseAuthInstance: Auth | null = null;
let firebaseAnalyticsInstance: Analytics | null = null;

/**
 * Normalizes and validates Nepal mobile phone numbers.
 * Supports:
 * - 98XXXXXXXX, 97XXXXXXXX, 96XXXXXXXX (10 digits)
 * - +97798XXXXXXXX / 97798XXXXXXXX
 * - 098XXXXXXXX
 * - Spaces, dashes, parentheses and Devanagari numerals
 */
export function formatNepalPhoneNumber(rawPhone: string): {
  isValid: boolean;
  e164: string;
  local10: string;
  error?: string;
} {
  if (!rawPhone || !rawPhone.trim()) {
    return {
      isValid: false,
      e164: '',
      local10: '',
      error: 'कृपया मोबाइल नम्बर प्रविष्ट गर्नुहोस्।'
    };
  }

  // Convert any Devanagari numerals to Latin (९८... -> 98...)
  const latinized = fromDevanagariNumerals(rawPhone.trim());
  const cleanDigits = latinized.replace(/\D/g, '');

  let local10 = '';
  if (cleanDigits.startsWith('977') && cleanDigits.length === 13) {
    local10 = cleanDigits.slice(3);
  } else if (cleanDigits.startsWith('0') && cleanDigits.length === 11) {
    local10 = cleanDigits.slice(1);
  } else if (cleanDigits.length === 10) {
    local10 = cleanDigits;
  } else {
    return {
      isValid: false,
      e164: '',
      local10: '',
      error: 'कृपया १० अङ्कको मान्य नेपाली मोबाइल नम्बर प्रविष्ट गर्नुहोस् (उदा: ९८xxxxxxxx)।'
    };
  }

  // Validate Nepal Telecom / Ncell / SmartCell mobile prefixes: 98, 97, 96
  if (!/^(9[78]\d{8}|96\d{8})$/.test(local10)) {
    return {
      isValid: false,
      e164: '',
      local10,
      error: 'नेपाली मोबाइल नम्बर ९८, ९७ वा ९६ बाट सुरु हुनुपर्छ (उदा: ९८४१२३४५६७)।'
    };
  }

  return {
    isValid: true,
    e164: `+977${local10}`,
    local10
  };
}

/**
 * Initialize or retrieve Firebase App Singleton
 */
export function getFirebaseApp(): FirebaseApp {
  if (firebaseAppInstance) return firebaseAppInstance;

  if (getApps().length > 0) {
    firebaseAppInstance = getApp();
  } else {
    firebaseAppInstance = initializeApp(BALANANDA_FIREBASE_CONFIG);
  }
  return firebaseAppInstance;
}

/**
 * Initialize or retrieve Firebase Auth Singleton
 */
export function getFirebaseAuth(): Auth {
  if (firebaseAuthInstance) return firebaseAuthInstance;
  const app = getFirebaseApp();
  firebaseAuthInstance = getAuth(app);
  return firebaseAuthInstance;
}

/**
 * Initialize Firebase Analytics safely (runs only in browser environment)
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (firebaseAnalyticsInstance) return firebaseAnalyticsInstance;
  if (typeof window === 'undefined') return null;

  try {
    const supported = await isSupported();
    if (supported) {
      const app = getFirebaseApp();
      firebaseAnalyticsInstance = getAnalytics(app);
      return firebaseAnalyticsInstance;
    }
  } catch (err) {
    console.warn('[Firebase Analytics] Not initialized:', err);
  }
  return null;
}

// Automatically initialize analytics when running in client browser
if (typeof window !== 'undefined') {
  getFirebaseAnalytics().catch(() => {});
}

class FirebaseAuthService {
  private confirmationResult: ConfirmationResult | null = null;
  private lastPhoneNumber: string = '';
  private lastFormattedPhone: string = '';
  private lastSentTimestamp: number = 0;
  private lastVerifiedUid: string = '';
  private lastVerifiedPhone: string = '';

  public isConfigured(): boolean {
    return Boolean(
      BALANANDA_FIREBASE_CONFIG.apiKey &&
      BALANANDA_FIREBASE_CONFIG.apiKey.startsWith('AIza') &&
      BALANANDA_FIREBASE_CONFIG.projectId
    );
  }

  public getLastVerifiedUid(): string {
    return this.lastVerifiedUid;
  }

  public getLastVerifiedPhone(): string {
    return this.lastVerifiedPhone;
  }

  /**
   * Safely clears any active reCAPTCHA verifier instance to prevent duplication errors
   */
  public clearRecaptcha(): void {
    if (typeof window !== 'undefined' && (window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {
        console.warn('[Firebase] Recaptcha clear notice:', e);
      }
      (window as any).recaptchaVerifier = null;
    }
  }

  /**
   * Ensures the reCAPTCHA container exists in the DOM and is visible for challenge prompts
   */
  private ensureContainer(containerId: string): HTMLElement {
    if (typeof document === 'undefined') {
      throw new Error('Browser environment required');
    }
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.style.position = 'fixed';
      container.style.bottom = '12px';
      container.style.right = '12px';
      container.style.zIndex = '999999';
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * Initialize or retrieve a fresh RecaptchaVerifier
   */
  private getOrCreateRecaptchaVerifier(containerId: string): RecaptchaVerifier {
    this.ensureContainer(containerId);

    if ((window as any).recaptchaVerifier) {
      return (window as any).recaptchaVerifier;
    }

    const auth = getFirebaseAuth();
    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        this.clearRecaptcha();
      }
    });

    (window as any).recaptchaVerifier = verifier;
    return verifier;
  }

  /**
   * Send Phone OTP via Firebase Phone Auth using invisible reCAPTCHA
   */
  async sendPhoneOTP(phoneNumber: string, containerId: string = 'recaptcha-container'): Promise<{
    success: boolean;
    challengeId?: string;
    formattedPhone?: string;
    localPhone?: string;
    message: string;
    error?: string;
  }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Firebase कन्फिगरेसन अधुरो छ। कृपया Firebase API Key र Project ID जाँच गर्नुहोस्।'
      };
    }

    // Validate Nepal phone number
    const validation = formatNepalPhoneNumber(phoneNumber);
    if (!validation.isValid) {
      return {
        success: false,
        message: validation.error || 'कृपया मान्य १० अङ्कको नेपाली मोबाइल नम्बर प्रविष्ट गर्नुहोस्।'
      };
    }

    const formattedPhone = validation.e164;

    try {
      const auth = getFirebaseAuth();
      this.clearRecaptcha();
      const verifier = this.getOrCreateRecaptchaVerifier(containerId);

      this.lastPhoneNumber = phoneNumber;
      this.lastFormattedPhone = formattedPhone;
      this.confirmationResult = null;

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      this.confirmationResult = confirmation;
      this.lastSentTimestamp = Date.now();

      const challengeId = `fb_phone_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      return {
        success: true,
        challengeId,
        formattedPhone,
        localPhone: validation.local10,
        message: `Firebase आधिकारिक SMS मार्फत ${formattedPhone} मा ६-अङ्कको सुरक्षा कोड पठाइयो।`
      };
    } catch (err: any) {
      console.error('[Firebase Phone Auth] Send Error:', err);
      this.clearRecaptcha();

      let errorMsg = 'सुरक्षा कोड पठाउन सकिएन।';
      if (err.code === 'auth/invalid-phone-number') {
        errorMsg = 'अमान्य मोबाइल नम्बर। कृपया १० अङ्कको सही नेपाली नम्बर लेख्नुहोस्।';
      } else if (err.code === 'auth/missing-phone-number') {
        errorMsg = 'कृपया मोबाइल नम्बर प्रविष्ट गर्नुहोस्।';
      } else if (err.code === 'auth/too-many-requests') {
        errorMsg = 'धेरै पटक प्रयास गरियो। सुरक्षाको लागि केही समय (१-२ मिनेट) पर्खनुहोस्।';
      } else if (err.code === 'auth/quota-exceeded') {
        errorMsg = 'Firebase SMS दैनिक कोटा समाप्त भयो। कृपया Firebase Console मा Blaze (Pay-as-you-go) योजना सक्रिय गर्नुहोस्।';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMsg = 'Firebase मा Phone Provider सक्रिय (Enable) गरिएको छैन। कृपया Firebase Console > Authentication > Sign-in method मा Phone सक्रिय गर्नुहोस्।';
      } else if (err.code === 'auth/captcha-check-failed') {
        errorMsg = 'reCAPTCHA सुरक्षा प्रमाणीकरण असफल भयो। कृपया पृष्ठ रिफ्रेस गरी पुनः प्रयास गर्नुहोस्।';
      } else if (err.code === 'auth/app-not-authorized') {
        errorMsg = 'यो डोमेन Firebase मा आधिकारिक छैन। कृपया Firebase Console > Authentication > Settings > Authorized Domains मा यो डोमेन थप्नुहोस्।';
      } else if (err.code === 'auth/network-request-failed') {
        errorMsg = 'इन्टरनेट कनेक्सनमा समस्या आयो। कृपया इन्टरनेट जाँच गरी पुनः प्रयास गर्नुहोस्।';
      } else if (err.message) {
        errorMsg = `Firebase त्रुटि: ${err.message}`;
      }

      return {
        success: false,
        message: errorMsg,
        error: err.code || err.message
      };
    }
  }

  /**
   * Resend Phone OTP via Firebase Phone Auth with 60-second cooldown protection
   */
  async resendPhoneOTP(containerId: string = 'recaptcha-container'): Promise<{
    success: boolean;
    remainingSeconds?: number;
    message: string;
  }> {
    const now = Date.now();
    const elapsed = Math.floor((now - this.lastSentTimestamp) / 1000);
    if (elapsed < 60) {
      const wait = 60 - elapsed;
      return {
        success: false,
        remainingSeconds: wait,
        message: `कृपया नयाँ सुरक्षा कोड पुनः माग्न ${wait} सेकेन्ड पर्खनुहोस्।`
      };
    }

    if (!this.lastFormattedPhone && !this.lastPhoneNumber) {
      return {
        success: false,
        message: 'पहिले मोबाइल नम्बर प्रविष्ट गरी कोड पठाउनुहोस्।'
      };
    }

    const targetPhone = this.lastFormattedPhone || this.lastPhoneNumber;
    const res = await this.sendPhoneOTP(targetPhone, containerId);
    return {
      success: res.success,
      remainingSeconds: 60,
      message: res.message
    };
  }

  /**
   * Verify confirmation code entered by the user.
   * If purpose is 'signup', verifies telephone ownership and prepares for credentials step.
   * If purpose is 'login', issues session and completes sign-in.
   */
  async verifyCode(
    code: string,
    purpose: 'login' | 'signup' = 'signup',
    userDetails?: { fullName?: string }
  ): Promise<{
    success: boolean;
    session?: RBACSession;
    firebaseUid?: string;
    phoneNumber?: string;
    message: string;
  }> {
    if (!this.confirmationResult) {
      return {
        success: false,
        message: 'सक्रिय Firebase प्रमाणीकरण सत्र फेला परेन। कृपया "नयाँ कोड पठाउनुहोस्" मा क्लिक गर्नुहोस्।'
      };
    }

    const cleanCode = code.trim().replace(/\D/g, '');
    if (cleanCode.length !== 6) {
      return {
        success: false,
        message: 'कृपया ६ अङ्कको सुरक्षा कोड पूरा प्रविष्ट गर्नुहोस्।'
      };
    }

    try {
      const userCredential: UserCredential = await this.confirmationResult.confirm(cleanCode);
      const user = userCredential.user;
      const phone = user.phoneNumber || this.lastFormattedPhone || '९८xxxxxxxx';
      const cleanMob = phone.replace(/^\+977/, '').replace(/^\+/, '');

      this.lastVerifiedUid = user.uid;
      this.lastVerifiedPhone = phone;

      // For registration: verify phone ownership, but let user set username and password in Step 2
      if (purpose === 'signup') {
        return {
          success: true,
          firebaseUid: user.uid,
          phoneNumber: phone,
          message: 'मोबाइल नम्बर सफलतापूर्वक प्रमाणित भयो! अब आफ्नो प्रयोगकर्ता नाम र पासवर्ड सेट गर्नुहोस्।'
        };
      }

      // For login: issue active session immediately
      // 1. Try exchanging with backend server if available
      try {
        const idToken = await user.getIdToken();
        const res = await apiClient.post<any>('/api/auth/firebase-verify', {
          idToken,
          phoneNumber: phone
        });

        const payload = (res.data || res) as any;
        if (res.success && payload?.token && payload?.user) {
          const u = payload.user;
          const session: RBACSession = {
            token: payload.token,
            userId: u.id,
            username: u.phone || u.username,
            fullName: u.fullName || userDetails?.fullName || 'वैदिक साधक',
            role: u.role || 'CUSTOMER',
            roleNameNepali: u.roleNameNepali || 'यजमान / ग्राहक',
            status: 'active',
            permissions: u.permissions || ['store.view', 'kundali.view', 'profile.edit', 'yajaman.view'],
            customerId: u.customerId,
            phone: u.phone,
            createdAtISO: u.createdAtISO || new Date().toISOString(),
            lastActivityISO: new Date().toISOString()
          };

          setRBACSession(session);
          return {
            success: true,
            session,
            firebaseUid: user.uid,
            phoneNumber: phone,
            message: 'Firebase फोन प्रमाणीकरण सफल भयो! स्वागत छ।'
          };
        }
      } catch {
        // Backend offline -> proceed with resilient local session
      }

      // 2. Resilient local session issuance (for Firebase Hosting / Static / Offline)
      const userId = `usr_fb_${user.uid.slice(0, 8)}`;
      const token = `tok_fb_${Date.now()}`;

      const session: RBACSession = {
        token,
        userId,
        username: cleanMob,
        fullName: userDetails?.fullName || 'वैदिक साधक',
        role: 'CUSTOMER',
        roleNameNepali: 'यजमान / ग्राहक',
        status: 'active',
        permissions: ['store.view', 'kundali.view', 'profile.edit', 'yajaman.view'],
        customerId: `सदस्य-२०८३-${Math.floor(1000 + Math.random() * 9000)}`,
        phone: cleanMob,
        createdAtISO: new Date().toISOString(),
        lastActivityISO: new Date().toISOString()
      };

      setRBACSession(session);
      return {
        success: true,
        session,
        firebaseUid: user.uid,
        phoneNumber: phone,
        message: 'Firebase फोन प्रमाणीकरण सफल भयो! स्वागत छ।'
      };
    } catch (err: any) {
      console.error('[Firebase Phone Auth] Confirm Error:', err);
      let errorMsg = 'गलत वा अमान्य सुरक्षा कोड।';
      if (err.code === 'auth/invalid-verification-code') {
        errorMsg = 'तपाईंले प्रविष्ट गर्नुभएको ६-अङ्कको सुरक्षा कोड गलत छ। कृपया एसएमएसमा आएको कोड पुनः जाँच्नुहोस्।';
      } else if (err.code === 'auth/code-expired') {
        errorMsg = 'सुरक्षा कोडको म्याद समाप्त भएको छ। कृपया "नयाँ कोड पठाउनुहोस्" मा क्लिक गर्नुहोस्।';
      } else if (err.code === 'auth/session-expired') {
        errorMsg = 'प्रमाणीकरण सत्र समाप्त भयो। कृपया कोड पुनः पठाउनुहोस्।';
      } else if (err.message) {
        errorMsg = err.message;
      }
      return {
        success: false,
        message: errorMsg
      };
    }
  }
}

export const firebaseAuthService = new FirebaseAuthService();
