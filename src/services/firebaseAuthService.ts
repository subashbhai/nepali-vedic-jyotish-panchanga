/**
 * Balananda Firebase Service & Phone Authentication
 * Project: balananda-vaidik-sewa
 * Configuration provided by Firebase Console
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult, Auth } from 'firebase/auth';
import { apiClient } from './apiClient';
import { RBACSession, setRBACSession } from '../db/rbacStore';

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

  public isConfigured(): boolean {
    return Boolean(
      BALANANDA_FIREBASE_CONFIG.apiKey &&
      BALANANDA_FIREBASE_CONFIG.apiKey.startsWith('AIza')
    );
  }

  /**
   * Send Phone OTP via Firebase Phone Auth using invisible reCAPTCHA
   */
  async sendPhoneOTP(phoneNumber: string, containerId: string = 'recaptcha-container'): Promise<{
    success: boolean;
    message: string;
    needsRecaptcha?: boolean;
    error?: string;
  }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Firebase कन्फिगरेसन अधुरो छ।'
      };
    }

    try {
      const auth = getFirebaseAuth();

      // Ensure container exists in DOM
      if (typeof document !== 'undefined' && !document.getElementById(containerId)) {
        const div = document.createElement('div');
        div.id = containerId;
        div.style.display = 'none';
        document.body.appendChild(div);
      }

      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved
          },
          'expired-callback': () => {
            if ((window as any).recaptchaVerifier) {
              (window as any).recaptchaVerifier.clear();
              (window as any).recaptchaVerifier = null;
            }
          }
        });
      }

      const rawDigits = phoneNumber.replace(/\D/g, '');
      const formattedPhone = phoneNumber.startsWith('+')
        ? phoneNumber
        : rawDigits.length === 10
        ? `+977${rawDigits}`
        : `+${rawDigits}`;

      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        (window as any).recaptchaVerifier
      );
      this.confirmationResult = confirmation;

      return {
        success: true,
        message: `Firebase SMS मार्फत ${formattedPhone} मा सुरक्षा कोड पठाइयो।`
      };
    } catch (err: any) {
      console.error('[Firebase Phone Auth] Send Error:', err);

      // Reset reCAPTCHA on failure
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
          (window as any).recaptchaVerifier = null;
        } catch {}
      }

      let errorMsg = 'सुरक्षा कोड पठाउन सकिएन।';
      if (err.code === 'auth/invalid-phone-number') {
        errorMsg = 'अमान्य मोबाइल नम्बर। कृपया १० अङ्कको सही नम्बर लेख्नुहोस्।';
      } else if (err.code === 'auth/too-many-requests') {
        errorMsg = 'धेरै पटक प्रयास गरियो। सुरक्षाको लागि केही समय पर्खनुहोस्।';
      } else if (err.code === 'auth/quota-exceeded') {
        errorMsg = 'दैनिक SMS कोटा समाप्त भयो। कृपया WhatsApp वा Email छनोट गर्नुहोस्।';
      } else if (err.message) {
        errorMsg = err.message;
      }

      return {
        success: false,
        message: errorMsg,
        error: err.code || err.message
      };
    }
  }

  /**
   * Verify confirmation code entered by the user
   */
  async verifyCode(code: string): Promise<{
    success: boolean;
    session?: RBACSession;
    message: string;
  }> {
    if (!this.confirmationResult) {
      return {
        success: false,
        message: 'सक्रिय Firebase प्रमाणीकरण सत्र फेला परेन। कृपया कोड पुनः पठाउनुहोस्।'
      };
    }

    try {
      const userCredential = await this.confirmationResult.confirm(code.trim());
      const idToken = await userCredential.user.getIdToken();
      const phone = userCredential.user.phoneNumber || '९८xxxxxxxx';

      // 1. Try exchanging with backend server if available
      try {
        const res = await apiClient.post<any>('/api/auth/firebase-verify', {
          idToken,
          phoneNumber: phone
        });

        const payload = (res.data || res) as any;
        if (res.success && payload?.token && payload?.user) {
          const user = payload.user;
          const session: RBACSession = {
            token: payload.token,
            userId: user.id,
            username: user.phone || user.username,
            fullName: user.fullName,
            role: user.role || 'CUSTOMER',
            roleNameNepali: user.roleNameNepali || 'यजमान / ग्राहक',
            status: 'active',
            permissions: user.permissions || ['store.view', 'kundali.view', 'profile.edit', 'yajaman.view'],
            customerId: user.customerId,
            phone: user.phone,
            createdAtISO: user.createdAtISO || new Date().toISOString(),
            lastActivityISO: new Date().toISOString()
          };

          setRBACSession(session);
          return {
            success: true,
            session,
            message: 'Firebase फोन प्रमाणीकरण सफल भयो! स्वागत छ।'
          };
        }
      } catch {
        // Backend offline -> proceed with local session issuance
      }

      // 2. Resilient local session issuance (for GitHub Pages / Offline)
      const cleanMob = phone.replace(/^\+977/, '').replace(/^\+/, '');
      const userId = `usr_fb_${userCredential.user.uid.slice(0, 8)}`;
      const token = `tok_fb_${Date.now()}`;

      const session: RBACSession = {
        token,
        userId,
        username: cleanMob,
        fullName: 'वैदिक साधक (Firebase प्रमाणित)',
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
        message: 'Firebase फोन प्रमाणीकरण सफल भयो! स्वागत छ।'
      };
    } catch (err: any) {
      console.error('[Firebase Phone Auth] Confirm Error:', err);
      let errorMsg = 'गलत वा अमान्य OTP कोड।';
      if (err.code === 'auth/invalid-verification-code') {
        errorMsg = 'गलत सुरक्षा कोड! कृपया पुनः जाँच्नुहोस्।';
      } else if (err.code === 'auth/code-expired') {
        errorMsg = 'सुरक्षा कोडको म्याद समाप्त भयो। कृपया नयाँ कोड माग्नुहोस्।';
      }
      return {
        success: false,
        message: errorMsg
      };
    }
  }
}

export const firebaseAuthService = new FirebaseAuthService();
