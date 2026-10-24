/**
 * Balananda Firebase Phone Authentication Service
 * Integrates Firebase Web SDK Phone Auth with Balananda backend session engine.
 * Project: balananda-vaidik-sewa
 */

import { apiClient } from './apiClient';
import { RBACSession, setRBACSession } from '../db/rbacStore';

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export const BALANANDA_FIREBASE_CONFIG: FirebaseClientConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: "balananda-vaidik-sewa.firebaseapp.com",
  projectId: "balananda-vaidik-sewa",
  storageBucket: "balananda-vaidik-sewa.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

class FirebaseAuthService {
  private confirmationResult: any = null;

  public isConfigured(): boolean {
    return Boolean(
      BALANANDA_FIREBASE_CONFIG.apiKey &&
      BALANANDA_FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY"
    );
  }

  /**
   * Send Phone OTP using Firebase Web SDK (if configured and installed)
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
        message: 'Firebase API Key (.env मा VITE_FIREBASE_API_KEY) कन्फिगर गरिएको छैन। कृपया सिधै Balananda SMS गेटवे (Sparrow SMS) वा WhatsApp/Email रोज्नुहोस्।'
      };
    }

    try {
      // Dynamic import to avoid build errors if firebase package is optional
      // @ts-ignore
      const { initializeApp, getApps } = await import('firebase/app');
      // @ts-ignore
      const { getAuth, signInWithPhoneNumber, RecaptchaVerifier } = await import('firebase/auth');

      const app = getApps().length > 0 ? getApps()[0] : initializeApp(BALANANDA_FIREBASE_CONFIG);
      const auth = getAuth(app);

      if (!(window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
          size: 'invisible'
        });
      }

      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+977${phoneNumber.replace(/\D/g, '').slice(-10)}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, (window as any).recaptchaVerifier);
      this.confirmationResult = confirmation;

      return {
        success: true,
        message: `Firebase मार्फत ${formattedPhone} मा सुरक्षा कोड पठाइयो।`
      };
    } catch (err: any) {
      console.error('[Firebase Phone Auth] Error:', err);
      return {
        success: false,
        message: `Firebase त्रुटि: ${err.message || 'OTP पठाउन सकिएन'}`
      };
    }
  }

  /**
   * Verify confirmation code from Firebase and exchange ID Token with server for RBACSession
   */
  async verifyCode(code: string): Promise<{
    success: boolean;
    session?: RBACSession;
    message: string;
  }> {
    if (!this.confirmationResult) {
      return {
        success: false,
        message: 'सक्रिय Firebase प्रमाणीकरण सत्र फेला परेन।'
      };
    }

    try {
      const userCredential = await this.confirmationResult.confirm(code.trim());
      const idToken = await userCredential.user.getIdToken();

      // Exchange with backend server
      const res = await apiClient.post<any>('/api/auth/firebase-verify', {
        idToken,
        phoneNumber: userCredential.user.phoneNumber
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
          permissions: user.permissions || ['store.view', 'kundali.view', 'profile.edit'],
          customerId: user.customerId,
          phone: user.phone,
          createdAtISO: user.createdAtISO || new Date().toISOString(),
          lastActivityISO: new Date().toISOString()
        };

        setRBACSession(session);
        return {
          success: true,
          session,
          message: 'Firebase फोन प्रमाणीकरण सफल भयो!'
        };
      }

      return {
        success: false,
        message: payload?.message || res.error || 'सर्भरमा प्रमाणीकरण दर्ता गर्न सकिएन।'
      };
    } catch (err: any) {
      return {
        success: false,
        message: `गलत वा अमान्य कोड: ${err.message}`
      };
    }
  }
}

export const firebaseAuthService = new FirebaseAuthService();
