/**
 * Balananda Vedic Jyotish Sewa - Mobile Application Type Definitions
 * Dedicated to Jyotish Services Only (Android / iOS / Mobile Shell)
 */

import { BirthDetails, PanchangaData, PlanetPosition } from '../../types/astrology';

export type MobileTab = 
  | 'home'          // गृहपृष्ठ (Home Dashboard)
  | 'kundali'       // जन्म कुण्डली (Birth Chart & Dasha)
  | 'horoscope'     // राशिफल (Daily Horoscope & Lucky Factors)
  | 'panchanga'     // पञ्चाङ्ग (Daily Astrology Panchanga)
  | 'transit'       // गोचर (Planetary Transits)
  | 'matching'      // विवाह मिलान (Kundali Matching & 36 Guna)
  | 'consultation'  // ज्योतिषी परामर्श (Astrologer Consultation)
  | 'reports'       // प्रतिवेदन (PDF Reports)
  | 'profile';      // मेरो प्रोफाइल (User Account & Profiles)

export interface MobileUserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  role: 'USER' | 'ASTROLOGER' | 'ADMIN';
  createdAtISO: string;
  activeProfileId?: string;
  avatarUrl?: string;
}

export type ProfileRelationType = 'self' | 'family' | 'spouse' | 'child' | 'parent' | 'other';

export interface MobileBirthProfile extends BirthDetails {
  relation: ProfileRelationType;
  relationLabelNepali: string;
  isDefault?: boolean;
  notes?: string;
}

export interface MobileConsultationBooking {
  id: string;
  userId: string;
  astrologerId: string;
  astrologerNameNepali: string;
  consultationType: 'audio' | 'video' | 'chat' | 'detailed_written';
  topic: string;
  scheduledDateBS: string;
  scheduledTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  feeNPR: number;
  isPaid: boolean;
  inquiryNotes?: string;
  reportUrl?: string;
  createdAtISO: string;
}

export interface MobileAstrologerInfo {
  id: string;
  nameNepali: string;
  titleNepali: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  specialtiesNepali: string[];
  languages: string[];
  feeAudioCallNPR: number;
  feeVideoCallNPR: number;
  feeReportNPR: number;
  isAvailableToday: boolean;
  photoUrl?: string;
  verifiedBadge: boolean;
}

export interface OTPVerificationSession {
  target: string; // phone or email
  type: 'phone' | 'email';
  otpCode: string;
  expiresAt: number;
  attempts: number;
  isVerified: boolean;
}
