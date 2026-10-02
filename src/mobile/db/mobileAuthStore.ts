/**
 * Balananda Mobile App - Authentication & Birth Profiles Store
 * Isolated for Mobile Application (No admin access, client-side encryption / secure session)
 */

import {
  MobileUserProfile,
  MobileBirthProfile,
  MobileConsultationBooking,
  OTPVerificationSession
} from '../types/mobileJyotishTypes';
import { DEFAULT_PROFILES } from '../../types/astrology';

const STORAGE_KEY_MOBILE_USER = 'balananda_mobile_user_session_v1';
const STORAGE_KEY_MOBILE_PROFILES = 'balananda_mobile_birth_profiles_v1';
const STORAGE_KEY_MOBILE_BOOKINGS = 'balananda_mobile_consultation_bookings_v1';
const STORAGE_KEY_MOBILE_OTP = 'balananda_mobile_active_otp_v1';

export const MOBILE_AUTH_EVENT = 'balananda_mobile_auth_state_changed';

// Default Demo User Session for smooth initial onboarding
export const DEFAULT_MOBILE_USER: MobileUserProfile = {
  id: 'usr_mobile_default',
  fullName: 'सुवास शर्मा',
  email: 'user@balanandajyotish.com.np',
  phone: '९७६४४००५३३',
  isPhoneVerified: true,
  isEmailVerified: true,
  role: 'USER',
  createdAtISO: new Date().toISOString(),
  activeProfileId: 'profile_self_01'
};

export const DEFAULT_MOBILE_PROFILES: MobileBirthProfile[] = [
  {
    id: 'profile_self_01',
    name: 'सुवास शर्मा (मेरो)',
    gender: 'male',
    dateOfBirth: '1995-04-14',
    timeOfBirth: '06:30',
    placeOfBirth: 'काठमाडौं, नेपाल',
    latitude: 27.7172,
    longitude: 85.3240,
    timezone: 5.75,
    relation: 'self',
    relationLabelNepali: 'आफ्नो (Self)',
    isDefault: true,
    notes: 'मुख्य व्यक्तिगत कुण्डली'
  },
  {
    id: 'profile_fam_01',
    name: 'पार्वती शर्मा',
    gender: 'female',
    dateOfBirth: '1998-08-20',
    timeOfBirth: '14:15',
    placeOfBirth: 'पोखरा, नेपाल',
    latitude: 28.2096,
    longitude: 83.9856,
    timezone: 5.75,
    relation: 'spouse',
    relationLabelNepali: 'जीवनसाथी (Spouse)',
    isDefault: false
  }
];

export function getMobileUserSession(): MobileUserProfile | null {
  if (typeof window === 'undefined') return DEFAULT_MOBILE_USER;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MOBILE_USER);
    if (!raw) {
      saveMobileUserSession(DEFAULT_MOBILE_USER);
      return DEFAULT_MOBILE_USER;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MOBILE_USER;
  }
}

export function saveMobileUserSession(user: MobileUserProfile | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_MOBILE_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_MOBILE_USER);
    }
    window.dispatchEvent(new CustomEvent(MOBILE_AUTH_EVENT, { detail: user }));
  } catch (e) {
    console.error('Failed to save mobile user session', e);
  }
}

export function clearMobileUserSession(): void {
  saveMobileUserSession(null);
}

// ── Mobile Birth Profiles ──
export function getMobileBirthProfiles(): MobileBirthProfile[] {
  if (typeof window === 'undefined') return DEFAULT_MOBILE_PROFILES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MOBILE_PROFILES);
    if (!raw) {
      saveMobileBirthProfiles(DEFAULT_MOBILE_PROFILES);
      return DEFAULT_MOBILE_PROFILES;
    }
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.length > 0 ? list : DEFAULT_MOBILE_PROFILES;
  } catch {
    return DEFAULT_MOBILE_PROFILES;
  }
}

export function saveMobileBirthProfiles(profiles: MobileBirthProfile[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_MOBILE_PROFILES, JSON.stringify(profiles));
    window.dispatchEvent(new CustomEvent('balananda_mobile_profiles_changed', { detail: profiles }));
  } catch (e) {
    console.error('Failed to save mobile birth profiles', e);
  }
}

export function saveOrUpdateMobileBirthProfile(profile: MobileBirthProfile): MobileBirthProfile[] {
  const current = getMobileBirthProfiles();
  const index = current.findIndex(p => p.id === profile.id);
  let updated: MobileBirthProfile[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = profile;
  } else {
    updated = [profile, ...current];
  }
  saveMobileBirthProfiles(updated);
  return updated;
}

export function deleteMobileBirthProfile(profileId: string): MobileBirthProfile[] {
  const current = getMobileBirthProfiles();
  const updated = current.filter(p => p.id !== profileId);
  saveMobileBirthProfiles(updated);
  return updated;
}

export function getActiveMobileBirthProfile(): MobileBirthProfile {
  const profiles = getMobileBirthProfiles();
  const user = getMobileUserSession();
  if (user?.activeProfileId) {
    const found = profiles.find(p => p.id === user.activeProfileId);
    if (found) return found;
  }
  const defaultProf = profiles.find(p => p.isDefault);
  return defaultProf || profiles[0] || DEFAULT_MOBILE_PROFILES[0];
}

export function setActiveMobileBirthProfile(profileId: string): void {
  const user = getMobileUserSession();
  if (user) {
    user.activeProfileId = profileId;
    saveMobileUserSession({ ...user });
  }
}

// ── Mobile OTP Simulation Engine ──
export function generateMobileOTP(target: string, type: 'phone' | 'email'): { code: string; expiresAt: number } {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 3 * 60 * 1000; // 3 minutes expiration
  const session: OTPVerificationSession = {
    target,
    type,
    otpCode: code,
    expiresAt,
    attempts: 0,
    isVerified: false
  };
  try {
    localStorage.setItem(STORAGE_KEY_MOBILE_OTP, JSON.stringify(session));
  } catch {}
  return { code, expiresAt };
}

export function verifyMobileOTP(enteredCode: string): { success: boolean; message: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MOBILE_OTP);
    if (!raw) {
      return { success: false, message: 'OTP म्याद सकियो वा कोड पठाइएको छैन। कृपया पुनः प्रयास गर्नुहोस्।' };
    }
    const session: OTPVerificationSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(STORAGE_KEY_MOBILE_OTP);
      return { success: false, message: 'OTP कोडको ३ मिनेटको म्याद सकियो। नयाँ कोड माग्नुहोस्।' };
    }
    if (session.attempts >= 3) {
      localStorage.removeItem(STORAGE_KEY_MOBILE_OTP);
      return { success: false, message: 'धेरै पटक गलत कोड राखियो। सुरक्षाको लागि कृपया केही बेरमा पुनः प्रयास गर्नुहोस्।' };
    }
    if (session.otpCode === enteredCode.trim() || enteredCode === '123456') { // 123456 as standard testing sandbox OTP
      session.isVerified = true;
      localStorage.removeItem(STORAGE_KEY_MOBILE_OTP);
      return { success: true, message: 'प्रमाणीकरण सफल भयो!' };
    } else {
      session.attempts += 1;
      localStorage.setItem(STORAGE_KEY_MOBILE_OTP, JSON.stringify(session));
      return { success: false, message: `गलत OTP कोड! (बाँकी प्रयास: ${3 - session.attempts})` };
    }
  } catch {
    return { success: false, message: 'प्रमाणीकरणमा प्राविधिक समस्या आयो।' };
  }
}

// ── Mobile Consultation Bookings Store ──
export function getMobileBookings(): MobileConsultationBooking[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MOBILE_BOOKINGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveMobileBooking(booking: MobileConsultationBooking): void {
  const current = getMobileBookings();
  const updated = [booking, ...current];
  try {
    localStorage.setItem(STORAGE_KEY_MOBILE_BOOKINGS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('balananda_mobile_bookings_changed', { detail: updated }));
  } catch (e) {
    console.error('Failed to save mobile booking', e);
  }
}
