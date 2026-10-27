import { convertADToBSFull } from '../utils/bsCalendarData';

export type PlanDurationType =
  | '1_year'
  | 'lifetime'
  | 'trial'
  | '1_month'
  | '3_months'
  | '6_months'
  | '2_years'
  | '5_years';

export interface MembershipExpiryResult {
  duration: PlanDurationType;
  activatedAtDate: Date;
  activatedAtISO: string;
  activatedAtBS: string;
  expiresAtDate: Date | null;
  expiresAtISO: string | null;
  expiresAtTimestamp: number | null;
  expiresAtBS: string;
  remainingDays: number;
  isLifetime: boolean;
  isExpired: boolean;
}

/**
 * Add calendar years preserving month and day where possible.
 * Correctly handles leap years: February 29 on leap year -> February 28 on non-leap year.
 */
export function addCalendarYears(startDate: Date, yearsToAdd: number): Date {
  const result = new Date(startDate.getTime());
  const startYear = result.getFullYear();
  const startMonth = result.getMonth();
  const startDay = result.getDate();

  const targetYear = startYear + yearsToAdd;
  result.setFullYear(targetYear);

  // If start was leap day Feb 29 and target year is not leap year, adjust to Feb 28
  if (startMonth === 1 && startDay === 29) {
    const isLeap = (targetYear % 4 === 0 && targetYear % 100 !== 0) || (targetYear % 400 === 0);
    if (!isLeap) {
      result.setMonth(1, 28);
    }
  }
  return result;
}

/**
 * Add calendar months preserving day where possible.
 */
export function addCalendarMonths(startDate: Date, monthsToAdd: number): Date {
  const result = new Date(startDate.getTime());
  const expectedMonth = (result.getMonth() + monthsToAdd) % 12;
  result.setMonth(result.getMonth() + monthsToAdd);
  // Normalize if overflowed into next month (e.g. Jan 31 + 1 month -> Feb 28/29)
  if (result.getMonth() !== expectedMonth) {
    result.setDate(0); // Last day of previous month
  }
  return result;
}

/**
 * Convert any Gregorian AD date into official Bikram Sambat formatted string.
 * Example: Date(2026-10-27) -> "२०८३ कात्तिक १०"
 */
export function getNepaliBSDate(date: Date | string | number = new Date()): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '२०८३';
  const full = convertADToBSFull(d);
  return full.formattedBS || `${full.year} ${full.monthName} ${full.day}`;
}

/**
 * Calculate membership validity and exact expiry timestamps according to plan rules.
 * Server-side source of truth for trial, 1-year, and lifetime subscriptions.
 */
export function calculateMembershipDateSchedule(
  activationDate: Date | string | number = new Date(),
  durationInput: string = '1_year'
): MembershipExpiryResult {
  const actDate = activationDate instanceof Date ? activationDate : new Date(activationDate);
  const safeActDate = isNaN(actDate.getTime()) ? new Date() : actDate;
  const activatedAtISO = safeActDate.toISOString();
  const activatedAtBS = getNepaliBSDate(safeActDate);

  const dur = String(durationInput || '1_year').toLowerCase();
  const nowMs = Date.now();

  let expiresAtDate: Date | null = null;
  let expiresAtISO: string | null = null;
  let expiresAtTimestamp: number | null = null;
  let expiresAtBS = '';
  let isLifetime = false;
  let planDuration: PlanDurationType = '1_year';

  if (dur === 'lifetime' || dur.includes('lifetime') || dur.includes('aajiban') || dur.includes('आजीवन')) {
    isLifetime = true;
    planDuration = 'lifetime';
    expiresAtDate = null;
    expiresAtISO = null;
    expiresAtTimestamp = null;
    expiresAtBS = 'आजीवन (Lifetime)';
  } else if (dur === 'trial' || dur === 'trial_24h' || dur === '24_hours' || dur.includes('trial')) {
    planDuration = 'trial';
    expiresAtDate = new Date(safeActDate.getTime() + 24 * 60 * 60 * 1000); // Exactly 24 hours
    expiresAtISO = expiresAtDate.toISOString();
    expiresAtTimestamp = expiresAtDate.getTime();
    expiresAtBS = `${getNepaliBSDate(expiresAtDate)} (२४ घण्टा)`;
  } else if (dur === '1_month' || dur === 'month') {
    planDuration = '1_month';
    expiresAtDate = addCalendarMonths(safeActDate, 1);
    expiresAtISO = expiresAtDate.toISOString();
    expiresAtTimestamp = expiresAtDate.getTime();
    expiresAtBS = getNepaliBSDate(expiresAtDate);
  } else if (dur === '3_months') {
    planDuration = '3_months';
    expiresAtDate = addCalendarMonths(safeActDate, 3);
    expiresAtISO = expiresAtDate.toISOString();
    expiresAtTimestamp = expiresAtDate.getTime();
    expiresAtBS = getNepaliBSDate(expiresAtDate);
  } else if (dur === '6_months') {
    planDuration = '6_months';
    expiresAtDate = addCalendarMonths(safeActDate, 6);
    expiresAtISO = expiresAtDate.toISOString();
    expiresAtTimestamp = expiresAtDate.getTime();
    expiresAtBS = getNepaliBSDate(expiresAtDate);
  } else if (dur === '2_years') {
    planDuration = '2_years';
    expiresAtDate = addCalendarYears(safeActDate, 2);
    expiresAtISO = expiresAtDate.toISOString();
    expiresAtTimestamp = expiresAtDate.getTime();
    expiresAtBS = getNepaliBSDate(expiresAtDate);
  } else if (dur === '5_years') {
    planDuration = '5_years';
    expiresAtDate = addCalendarYears(safeActDate, 5);
    expiresAtISO = expiresAtDate.toISOString();
    expiresAtTimestamp = expiresAtDate.getTime();
    expiresAtBS = getNepaliBSDate(expiresAtDate);
  } else {
    // Default 1 calendar year
    planDuration = '1_year';
    expiresAtDate = addCalendarYears(safeActDate, 1);
    expiresAtISO = expiresAtDate.toISOString();
    expiresAtTimestamp = expiresAtDate.getTime();
    expiresAtBS = getNepaliBSDate(expiresAtDate);
  }

  let remainingDays = 0;
  let isExpired = false;

  if (isLifetime) {
    remainingDays = 99999;
    isExpired = false;
  } else if (expiresAtTimestamp) {
    const diffMs = expiresAtTimestamp - nowMs;
    if (diffMs <= 0) {
      isExpired = true;
      remainingDays = 0;
    } else {
      isExpired = false;
      remainingDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
    }
  }

  return {
    duration: planDuration,
    activatedAtDate: safeActDate,
    activatedAtISO,
    activatedAtBS,
    expiresAtDate,
    expiresAtISO,
    expiresAtTimestamp,
    expiresAtBS,
    remainingDays,
    isLifetime,
    isExpired
  };
}
