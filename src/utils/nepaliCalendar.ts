import { LocationData } from '../types/astrology';
import { WORLD_LOCATIONS_DATA } from '../data/worldLocations';
import { 
  convertADToBSFull, 
  convertBSToADFull, 
  NEPALI_MONTH_NAMES, 
  DAYS_NEPALI_FULL, 
  DAYS_SANSKRIT_FULL 
} from './bsCalendarData';

// Devanagari Digit Converter
export function toDevanagariNumerals(num: number | string): string {
  const devanagariDigits: { [key: string]: string } = {
    '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
    '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
  };

  let str: string;
  if (typeof num === 'number') {
    if (!Number.isInteger(num)) {
      // Cleanly round floating numbers to at most 2 decimal places
      const rounded = Math.round((num + Number.EPSILON) * 100) / 100;
      str = String(rounded);
    } else {
      str = String(num);
    }
  } else {
    // If a string contains floating point numbers with more than 2 decimal digits,
    // e.g. "4.653888206802219", round it cleanly if it is purely numeric
    const parsed = Number(num);
    if (!isNaN(parsed) && num.includes('.') && /^-?\d+\.\d+$/.test(num.trim())) {
      const rounded = Math.round((parsed + Number.EPSILON) * 100) / 100;
      str = String(rounded);
    } else {
      str = String(num);
    }
  }

  return str.replace(/[0-9]/g, (w) => devanagariDigits[w]);
}

/**
 * Format year durations into Devanagari numerals with at most 2 decimal places.
 * E.g., 4.653888206802219 -> "४.६५"
 *       15.999999999999993 -> "१६"
 *       18 -> "१८"
 */
export function formatYears(years: number | string): string {
  if (typeof years === 'string') {
    const p = parseFloat(years);
    if (!isNaN(p)) years = p;
  }
  if (typeof years === 'number' && !isNaN(years)) {
    const rounded = Math.round((years + Number.EPSILON) * 100) / 100;
    return toDevanagariNumerals(rounded);
  }
  return toDevanagariNumerals(years || 0);
}

export function fromDevanagariNumerals(str: string): string {
  const latinDigits: { [key: string]: string } = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
  };
  return str.replace(/[०-९]/g, (w) => latinDigits[w]);
}

// Nepali Months Data
export const NEPALI_MONTHS = NEPALI_MONTH_NAMES;
export const DAYS_NEPALI = DAYS_NEPALI_FULL;

export const DAYS_SANSKRIT = DAYS_SANSKRIT_FULL;

// Major Locations Database in Nepal and Internationally
export const NEPAL_LOCATIONS: LocationData[] = WORLD_LOCATIONS_DATA;

// Helper to convert Gregorian (AD) Date to Vikram Samvat (BS) Date
export function convertADToBS(adDateStr: string): { year: number; month: number; day: number; formattedBS: string } {
  const full = convertADToBSFull(adDateStr);
  return {
    year: full.year,
    month: full.month,
    day: full.day,
    formattedBS: full.formattedBS
  };
}

// Convert BS to AD date string
export function convertBSToAD(bsYear: number, bsMonth: number, bsDay: number): string {
  return convertBSToADFull(bsYear, bsMonth, bsDay);
}
