// src/utils/birthProfileCanonical.ts
import { convertBSToADFull, convertADToBSFull } from './bsCalendarData';
import { WORLD_LOCATIONS_DATA } from '../data/worldLocations';

export interface CanonicalBirthLocation {
  name: string;
  district: string;
  province?: string;
  country: string;
  latitude: number;
  longitude: number;
  timeZone: number;
}

export interface CanonicalBirthProfile {
  id: string;
  name: string;
  customerId?: string;
  clientId?: string;
  phone?: string;
  email?: string;
  gender: 'male' | 'female' | 'other' | 'पुरुष' | 'महिला' | 'अन्य';
  dateBS: string;         // Latin 'YYYY-MM-DD', e.g. '2049-04-09'
  dateAD: string;         // Latin 'YYYY-MM-DD', e.g. '1992-07-24'
  time: string;           // Display time, e.g. '04:30 PM' or '०४:३०'
  time24: string;         // Canonical 24-hr 'HH:mm', e.g. '16:30'
  location: CanonicalBirthLocation;
  gotra?: string;
  moonRashi?: string;
  lagnaRashi?: string;
  nakshatra?: string;
  photoUrl?: string;
  notes?: string;
  updatedAt?: string;
}

/**
 * Convert Devanagari numerals to standard Latin digits: ०-९ -> 0-9
 */
export function devanagariToLatinDigits(str: string): string {
  if (!str) return '';
  const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.replaceAll(devanagariDigits[i], String(i));
  }
  return result;
}

/**
 * Convert standard Latin digits to Devanagari numerals: 0-9 -> ०-९
 */
export function latinToDevanagariDigits(str: string): string {
  if (!str) return '';
  const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(str).replace(/\d/g, (d) => devanagariDigits[parseInt(d, 10)] || d);
}

/**
 * Robust normalizer for birth time:
 * Correctly parses 12-hr, 24-hr, Devanagari numerals, and Nepali/English AM/PM tokens (e.g. '04:30 प्म', '०४:३० PM', '16:30')
 */
export function normalizeBirthTime(inputTime: string): {
  time24: string;
  display12: string;
  displayNepali: string;
  isValid: boolean;
} {
  if (!inputTime || typeof inputTime !== 'string' || !inputTime.trim()) {
    return {
      time24: '12:00',
      display12: '12:00 PM',
      displayNepali: '१२:०० दिउँसो',
      isValid: false
    };
  }

  const raw = inputTime.trim();
  const latin = devanagariToLatinDigits(raw).toLowerCase();

  // Detect PM indicators
  const isPM = /(pm|p\.m\.|प्म|पिएम|साँझ|साझ|बेलुका|दिउँसो|दिउसो|अपराह्न)/i.test(raw) ||
               /(pm|p\.m\.)/i.test(latin);

  // Detect AM indicators
  const isAM = /(am|a\.m\.|एएम|बिहान|प्रभात|पूर्वाह्न|राति|मध्यरात)/i.test(raw) ||
               /(am|a\.m\.)/i.test(latin);

  // Extract hour and minute
  const match = latin.match(/(\d{1,2})[:.](\d{1,2})/);
  if (!match) {
    return {
      time24: '12:00',
      display12: raw,
      displayNepali: raw,
      isValid: false
    };
  }

  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);

  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    return {
      time24: '12:00',
      display12: raw,
      displayNepali: raw,
      isValid: false
    };
  }

  // Adjust hour according to PM/AM indicator
  if (isPM && h < 12) {
    h += 12;
  } else if (isAM && h === 12) {
    h = 0;
  }

  const padH = String(h).padStart(2, '0');
  const padM = String(m).padStart(2, '0');
  const time24 = `${padH}:${padM}`;

  // 12-hour display formatting
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  const period = h >= 12 ? 'PM' : 'AM';
  const display12 = `${String(displayHour).padStart(2, '0')}:${padM} ${period}`;

  const nepaliPeriod = h < 12 ? (h < 4 ? 'मध्यरात' : 'बिहान') : (h < 16 ? 'दिउँसो' : (h < 20 ? 'साँझ' : 'राति'));
  const displayNepali = `${latinToDevanagariDigits(String(displayHour).padStart(2, '0'))}:${latinToDevanagariDigits(padM)} ${nepaliPeriod} (${period})`;

  return {
    time24,
    display12,
    displayNepali,
    isValid: true
  };
}

/**
 * Robust normalizer for BS Date:
 * Normalizes Devanagari '२०४९-०४-०९' or Latin '2049-04-09' to standard format and computes deterministic AD date
 */
export function normalizeBirthDateBS(inputBS: string, existingAD?: string): {
  dateBS: string;
  dateAD: string;
  displayBS: string;
  displayAD: string;
  isValid: boolean;
} {
  if (!inputBS || typeof inputBS !== 'string' || !inputBS.trim()) {
    return {
      dateBS: '',
      dateAD: existingAD || '',
      displayBS: '—',
      displayAD: existingAD || '—',
      isValid: false
    };
  }

  const latin = devanagariToLatinDigits(inputBS.trim());
  const parts = latin.split(/[-/.]/).map((p) => parseInt(p, 10));

  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    const y = parts[0];
    const m = parts[1];
    const d = parts[2];

    // Check reasonable BS year range (1970 to 2150 BS)
    if (y >= 1970 && y <= 2150 && m >= 1 && m <= 12 && d >= 1 && d <= 32) {
      const formattedBS = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      let computedAD = existingAD || '';
      try {
        computedAD = convertBSToADFull(y, m, d);
      } catch (e) {
        if (!computedAD) computedAD = '';
      }

      return {
        dateBS: formattedBS,
        dateAD: computedAD,
        displayBS: latinToDevanagariDigits(formattedBS),
        displayAD: computedAD || '—',
        isValid: true
      };
    }
  }

  return {
    dateBS: latin,
    dateAD: existingAD || '',
    displayBS: inputBS,
    displayAD: existingAD || '—',
    isValid: false
  };
}

/**
 * Resolves location details against world locations and Nepal districts
 */
export function resolveLocationDetails(locNameOrDistrict?: string): CanonicalBirthLocation {
  const defaultLoc: CanonicalBirthLocation = {
    name: 'काठमाडौँ, नेपाल',
    district: 'काठमाडौँ',
    province: 'बागमती प्रदेश',
    country: 'नेपाल',
    latitude: 27.7172,
    longitude: 85.3240,
    timeZone: 5.75
  };

  if (!locNameOrDistrict || !locNameOrDistrict.trim()) {
    return defaultLoc;
  }

  const clean = locNameOrDistrict.trim().toLowerCase();
  const matched = WORLD_LOCATIONS_DATA.find((l) =>
    (l.district && l.district.toLowerCase() === clean) ||
    (l.name && l.name.toLowerCase().includes(clean)) ||
    (l.englishName && l.englishName.toLowerCase().includes(clean))
  );

  if (matched) {
    return {
      name: matched.name,
      district: matched.district || locNameOrDistrict.trim(),
      province: matched.province || 'नेपाल',
      country: matched.country || 'नेपाल',
      latitude: matched.latitude,
      longitude: matched.longitude,
      timeZone: matched.timeZone || 5.75
    };
  }

  return {
    name: locNameOrDistrict.trim(),
    district: locNameOrDistrict.trim(),
    country: 'नेपाल',
    latitude: 27.7172,
    longitude: 85.3240,
    timeZone: 5.75
  };
}

/**
 * Construct authoritative CanonicalBirthProfile from user object
 */
export function buildCanonicalBirthProfile(u: any): CanonicalBirthProfile {
  if (!u) {
    return {
      id: 'user_unknown',
      name: 'प्रयोगकर्ता',
      gender: 'male',
      dateBS: '',
      dateAD: '',
      time: '12:00',
      time24: '12:00',
      location: resolveLocationDetails('काठमाडौँ')
    };
  }

  const bDet = u.birthDetails || {};
  const rawBS = bDet.dateBS || u.dobBS || u.dateBS || '';
  const rawAD = bDet.dateAD || u.dobAD || u.dateAD || '';
  const rawTime = bDet.time || u.birthTime || u.time || '';
  const rawLoc = bDet.location?.name || u.birthPlace || u.address || bDet.location?.district || u.district || 'काठमाडौँ, नेपाल';

  const dateNorm = normalizeBirthDateBS(rawBS, rawAD);
  const timeNorm = normalizeBirthTime(rawTime);
  const locNorm = typeof bDet.location === 'object' && bDet.location?.latitude
    ? {
        name: bDet.location.name || rawLoc,
        district: bDet.location.district || rawLoc,
        province: bDet.location.province,
        country: bDet.location.country || 'नेपाल',
        latitude: bDet.location.latitude,
        longitude: bDet.location.longitude,
        timeZone: bDet.location.timeZone || 5.75
      }
    : resolveLocationDetails(rawLoc);

  return {
    id: bDet.id || (u.id ? `user_profile_${u.id}` : `profile_${Date.now()}`),
    name: u.fullName || bDet.name || 'प्रयोगकर्ता',
    customerId: u.customerId || bDet.customerId,
    clientId: u.id || bDet.clientId,
    phone: u.phone || bDet.phone,
    email: u.email || bDet.email,
    gender: (u.gender === 'female' || bDet.gender === 'female' || bDet.gender === 'महिला' ? 'female' : 'male') as any,
    dateBS: dateNorm.dateBS,
    dateAD: dateNorm.dateAD,
    time: timeNorm.isValid ? timeNorm.display12 : (rawTime || '12:00'),
    time24: timeNorm.time24,
    location: locNorm,
    gotra: u.gotra || bDet.gotra || '',
    moonRashi: bDet.moonRashi,
    lagnaRashi: bDet.lagnaRashi,
    nakshatra: bDet.nakshatra,
    photoUrl: u.photoUrl || bDet.photoUrl,
    notes: bDet.notes || 'प्रमाणिक जन्म विवरण'
  };
}
