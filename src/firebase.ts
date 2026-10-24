// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult, Auth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyAO2mSw16bXlASlNPwjXRa9c8cNOk-Qaeg",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "balananda-vaidik-sewa.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "balananda-vaidik-sewa",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "balananda-vaidik-sewa.firebasestorage.app",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "300738709131",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:300738709131:web:3c308f285e9f85dfce368e",
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || "G-BRNS1W48QD"
};

// Initialize Firebase App safely (singleton)
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

// Initialize Firebase Analytics safely (only when supported in browser window)
export let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log("[Firebase Analytics] Active (Measurement ID: G-BRNS1W48QD)");
    }
  }).catch(() => {
    // Graceful fallback if analytics is blocked by adblockers or offline
  });
}

// Confirmation result store for Phone Auth
let currentConfirmationResult: ConfirmationResult | null = null;

/**
 * reCAPTCHA Verifier setup for invisible anti-abuse protection
 */
export function setupRecaptchaVerifier(containerId: string = 'recaptcha-container'): RecaptchaVerifier {
  if (typeof window === 'undefined') {
    throw new Error('reCAPTCHA can only be initialized in browser environment');
  }

  // Ensure DOM container exists
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.style.display = 'none';
    document.body.appendChild(container);
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

  return (window as any).recaptchaVerifier;
}

/**
 * Send Phone OTP via Firebase Phone Authentication
 * Formats phone to international E.164 standard (+977 for Nepal)
 */
export async function sendOTP(phoneNumber: string): Promise<ConfirmationResult> {
  const appVerifier = setupRecaptchaVerifier();
  const rawDigits = phoneNumber.replace(/\D/g, '');
  const formattedPhone = phoneNumber.startsWith('+')
    ? phoneNumber
    : rawDigits.length === 10
    ? `+977${rawDigits}`
    : `+${rawDigits}`;

  const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
  currentConfirmationResult = confirmationResult;
  return confirmationResult;
}

/**
 * Verify OTP entered by the user
 */
export async function verifyOTP(verificationCode: string) {
  if (!currentConfirmationResult) {
    throw new Error('No active verification session found. Please request OTP first.');
  }
  return await currentConfirmationResult.confirm(verificationCode.trim());
}

export default app;
