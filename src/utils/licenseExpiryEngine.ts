/**
 * Centralized License Expiry & 30-Day Notification Engine
 *
 * Implements strict, server-authoritative subscription expiry calculation,
 * milestone detection, duplicate-safe in-app notifications, and Nepali localization.
 */

import { convertADToBS, toDevanagariNumerals } from './nepaliCalendar';
import { ServiceLicenseDuration } from '../types/serviceLicenseTypes';

export type ExpiryMilestone = 30 | 15 | 7 | 3 | 2 | 1 | 0 | 'EXPIRED';

export interface ExpiryNotificationRecord {
  id: string;
  userId: string;
  milestone: ExpiryMilestone;
  expiryTimestamp: number;
  messageNepali: string;
  sentAtISO: string;
  isRead: boolean;
}

const STORAGE_KEY_EXPIRY_NOTIFICATIONS = 'balananda_license_expiry_notifications_v1';

/**
 * Exact remaining days calculation
 * remainingDays = ceil((expiryTimestamp - currentTimestamp) / millisecondsPerDay)
 */
export function calculateRemainingDays(expiryTimestamp?: number | null, currentTimestamp: number = Date.now()): number {
  if (!expiryTimestamp || isNaN(expiryTimestamp)) return 9999;
  const diff = expiryTimestamp - currentTimestamp;
  if (diff <= 0) return 0;
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

/**
 * Check if the license is expired according to its exact timestamp
 */
export function isLicenseExpired(expiryTimestamp?: number | null, currentTimestamp: number = Date.now()): boolean {
  if (!expiryTimestamp || isNaN(expiryTimestamp)) return false;
  return currentTimestamp >= expiryTimestamp;
}

/**
 * Determine if the remaining days or timestamp fall within an active warning milestone
 */
export function getExpiryMilestone(remainingDaysOrTimestamp: number, currentTimestamp: number = Date.now()): ExpiryMilestone | null {
  const days = remainingDaysOrTimestamp > 10000000000
    ? calculateRemainingDays(remainingDaysOrTimestamp, currentTimestamp)
    : remainingDaysOrTimestamp;

  const isExpired = remainingDaysOrTimestamp > 10000000000
    ? isLicenseExpired(remainingDaysOrTimestamp, currentTimestamp)
    : days <= 0;

  if (isExpired || days <= 0) return 'EXPIRED';
  if (days === 1) return 1;
  if (days === 2) return 2;
  if (days === 3) return 3;
  if (days <= 7 && days >= 4) return 7;
  if (days <= 15 && days >= 8) return 15;
  if (days <= 30 && days >= 16) return 30;
  return null;
}

/**
 * Standardized Nepali notification warning message with Devanagari numerals
 */
export function getNepaliExpiryWarningMessage(remainingDaysOrMilestone: number | 'EXPIRED', planName?: string): string {
  const planPrefix = planName ? `[${planName}] ` : '';
  if (remainingDaysOrMilestone === 'EXPIRED' || remainingDaysOrMilestone <= 0) {
    return `${planPrefix}तपाईंको सफ्टवेयर सदस्यताको म्याद समाप्त भएको छ। सेवा पुनः प्रयोग गर्न सदस्यता नवीकरण गर्नुहोस्।`;
  }
  if (remainingDaysOrMilestone === 1) {
    return `${planPrefix}तपाईंको सदस्यताको म्याद भोलि सकिँदैछ। कृपया समयमै नवीकरण गर्नुहोस्।`;
  }
  if (remainingDaysOrMilestone === 2) {
    return `${planPrefix}तपाईंको सदस्यताको म्याद सकिन अब २ दिन बाँकी छ।`;
  }
  if (remainingDaysOrMilestone === 3) {
    return `${planPrefix}तपाईंको सदस्यताको म्याद सकिन अब ३ दिन बाँकी छ। कृपया नवीकरण गर्नुहोस्।`;
  }
  const daysDevanagari = toDevanagariNumerals(remainingDaysOrMilestone);
  if (remainingDaysOrMilestone <= 7) {
    return `${planPrefix}तपाईंको सदस्यताको म्याद सकिन अब ${daysDevanagari} दिन बाँकी छ।`;
  }
  if (remainingDaysOrMilestone <= 15) {
    return `${planPrefix}तपाईंको सफ्टवेयर सदस्यताको म्याद सकिन अब ${daysDevanagari} दिन बाँकी छ।`;
  }
  if (remainingDaysOrMilestone <= 30) {
    return `${planPrefix}तपाईंको सफ्टवेयर सदस्यताको म्याद सकिन अब ${daysDevanagari} दिन बाँकी छ।`;
  }
  return '';
}

/**
 * Calculate Start & Expiry Timestamps for any configured plan
 */
export function calculatePlanDurationTimestamps(
  duration: ServiceLicenseDuration,
  fromTimestamp: number = Date.now()
): {
  startsAtISO: string;
  startsAtBS: string;
  expiresAtTimestamp?: number;
  expiresAtISO?: string;
  expiresAtBS: string;
} {
  const startDate = new Date(fromTimestamp);
  const startsAtISO = startDate.toISOString();
  const startsAtBS = convertADToBS(startsAtISO.split('T')[0]).formattedBS;

  if (duration === 'lifetime') {
    return {
      startsAtISO,
      startsAtBS,
      expiresAtTimestamp: undefined,
      expiresAtISO: undefined,
      expiresAtBS: 'आजीवन (Lifetime)'
    };
  }

  let durationDays = 365;
  if (duration === 'trial') durationDays = 1;
  else if (duration === '1_month') durationDays = 30;
  else if (duration === '3_months') durationDays = 90;
  else if (duration === '6_months') durationDays = 180;
  else if (duration === '1_year') durationDays = 365;
  else if (duration === '2_years') durationDays = 730;
  else if (duration === '5_years') durationDays = 1825;

  const expiresAtTimestamp = fromTimestamp + durationDays * 24 * 60 * 60 * 1000;
  const expiryDate = new Date(expiresAtTimestamp);
  const expiresAtISO = expiryDate.toISOString();
  const expiresAtBS = convertADToBS(expiresAtISO.split('T')[0]).formattedBS;

  return {
    startsAtISO,
    startsAtBS,
    expiresAtTimestamp,
    expiresAtISO,
    expiresAtBS
  };
}

/**
 * Retrieve persisted expiry notifications history
 */
export function getStoredExpiryNotifications(): ExpiryNotificationRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXPIRY_NOTIFICATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Check and record milestone notification without duplicate spamming
 */
export function processExpiryMilestoneNotification(
  userId: string,
  expiryTimestamp?: number | null,
  planName?: string
): { shouldNotify: boolean; milestone: ExpiryMilestone | null; messageNepali: string; remainingDays: number } {
  if (!expiryTimestamp) {
    return { shouldNotify: false, milestone: null, messageNepali: '', remainingDays: 9999 };
  }

  const remainingDays = calculateRemainingDays(expiryTimestamp);
  if (remainingDays > 30) {
    return { shouldNotify: false, milestone: null, messageNepali: '', remainingDays };
  }

  const milestone = getExpiryMilestone(remainingDays);
  if (!milestone) {
    return { shouldNotify: false, milestone: null, messageNepali: '', remainingDays };
  }

  const messageNepali = getNepaliExpiryWarningMessage(remainingDays, planName);
  const history = getStoredExpiryNotifications();

  // Duplicate Check: Check if this specific milestone for this user and this expiry cycle was already logged
  const alreadyLogged = history.some(
    (h) => h.userId === userId && h.milestone === milestone && Math.abs(h.expiryTimestamp - expiryTimestamp) < 86400000
  );

  if (alreadyLogged) {
    return {
      shouldNotify: false,
      milestone,
      messageNepali,
      remainingDays
    };
  }

  if (typeof window !== 'undefined') {
    const record: ExpiryNotificationRecord = {
      id: `exp_notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      milestone,
      expiryTimestamp,
      messageNepali,
      sentAtISO: new Date().toISOString(),
      isRead: false
    };
    try {
      localStorage.setItem(STORAGE_KEY_EXPIRY_NOTIFICATIONS, JSON.stringify([record, ...history.slice(0, 100)]));
    } catch {}
  }

  return {
    shouldNotify: true,
    milestone,
    messageNepali,
    remainingDays
  };
}
