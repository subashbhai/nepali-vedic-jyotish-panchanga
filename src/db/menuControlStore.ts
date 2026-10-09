/**
 * src/db/menuControlStore.ts
 *
 * Categorized Menu & Submenu Access Control System for Super Admin:
 * - 3-Way State per Feature: 'open' (Accessible) | 'close' (Deemed & Unclickable) | 'lock' (Password/Key Required)
 * - Per-Mobile Registration & Policy Storage
 * - Auto-Generated Strong Passwords (viewable & editable by Super Admin)
 * - Single-Device Session Lock (strictly 1 active device per user at a time)
 * - Subscription Periods: 1 Year ('1_year'), 5 Years ('5_years'), Lifetime ('lifetime')
 * - Full synchronization with user signup and RBAC login
 */

import { convertADToBS, fromDevanagariNumerals } from '../utils/nepaliCalendar';

export type AccessState = 'open' | 'close' | 'lock';
export type SubscriptionPeriod = '1_year' | '5_years' | 'lifetime';

export interface MenuFeatureDefinition {
  id: string;
  nameNepali: string;
  nameEnglish: string;
  category: 'jyotish' | 'vastu' | 'other';
  descriptionNepali: string;
  defaultState: AccessState;
}

export interface ClientAccessRecord {
  id: string;
  mobile: string; // Clean digits only
  fullName: string;
  loginId?: string; // e.g. subash9866 or mobile number
  passwordPlain: string; // Visible to Super Admin to give to client
  passwordHash: string;
  createdAtISO: string;
  createdAtBS: string;
  period: SubscriptionPeriod;
  expiresAtTimestamp: number;
  expiresAtBS: string;
  activeDeviceId?: string; // Single device lock
  activeDeviceName?: string;
  lastLoginISO?: string;
  status: 'active' | 'suspended';
  // Map of feature ID -> AccessState ('open' | 'close' | 'lock')
  permissions: Record<string, AccessState>;
}

// Master Categorized Menu & Submenu Definitions
export const CATEGORIZED_FEATURES: {
  category: 'jyotish' | 'vastu' | 'other';
  categoryLabelNepali: string;
  categoryLabelEnglish: string;
  items: MenuFeatureDefinition[];
}[] = [
  {
    category: 'jyotish',
    categoryLabelNepali: 'ज्योतिष सेवा तथा उप-मेनुहरू (Jyotish Services)',
    categoryLabelEnglish: 'Vedic Astrology Services & Submenus',
    items: [
      {
        id: 'kundali',
        nameNepali: 'कुण्डली निर्माण (लग्न / D1)',
        nameEnglish: 'Kundali Generation (Lagna D1)',
        category: 'jyotish',
        descriptionNepali: 'जन्मकुण्डली, ग्रह स्थिति तथा भाव स्पष्ट',
        defaultState: 'open'
      },
      {
        id: 'navamsha',
        nameNepali: 'नवमांश तथा वर्ग कुण्डली (D9 / Shodashvarga)',
        nameEnglish: 'Navamsha & Divisional Charts',
        category: 'jyotish',
        descriptionNepali: 'नवमांश, द्वादशांश, षोडशांश कुण्डलीहरू',
        defaultState: 'open'
      },
      {
        id: 'dasha',
        nameNepali: 'विंशोत्तरी महादशा & अन्तर्दशा (Dasha)',
        nameEnglish: 'Vimshottari Dasha Analysis',
        category: 'jyotish',
        descriptionNepali: 'महादशा, अन्तर्दशा र प्रत्यन्तर्दशा विश्लेषण',
        defaultState: 'open'
      },
      {
        id: 'gochar',
        nameNepali: 'गोचर फलित & साढेसाती (Gochar)',
        nameEnglish: 'Planetary Transit & Sade Sati',
        category: 'jyotish',
        descriptionNepali: 'दैनिक ग्रह गोचर र शनि साढेसाती चक्र',
        defaultState: 'open'
      },
      {
        id: 'faladesh',
        nameNepali: 'समग्र फलादेश & ग्रह फल (Faladesh)',
        nameEnglish: 'Complete Horoscope Predictions',
        category: 'jyotish',
        descriptionNepali: 'भाव फल, ग्रह योग र विस्तृत फलादेश',
        defaultState: 'open'
      },
      {
        id: 'patrika',
        nameNepali: 'चिना तथा विस्तृत पत्रिका प्रिन्ट (Patrika Print)',
        nameEnglish: 'Patrika & Cheena Full PDF Print',
        category: 'jyotish',
        descriptionNepali: 'पारिवारिक पत्रिका, जन्मपत्र र A4 रंगीन प्रिन्ट',
        defaultState: 'lock'
      },
      {
        id: 'muhurta',
        nameNepali: 'मुहूर्त निर्णय (Muhurta Engine)',
        nameEnglish: 'Auspicious Timing & Muhurta',
        category: 'jyotish',
        descriptionNepali: 'विवाह, गृहप्रवेश, यात्रा र व्रतबन्ध मुहूर्त',
        defaultState: 'open'
      },
      {
        id: 'sanskar',
        nameNepali: '१६ संस्कार विधि (Vedic Sanskar)',
        nameEnglish: '16 Vedic Sanskars & Rituals',
        category: 'jyotish',
        descriptionNepali: 'नामकरण, अन्नप्राशन, पास्नी आदि दस्तावेज',
        defaultState: 'open'
      },
      {
        id: 'prashna',
        nameNepali: 'प्रश्न ज्योतिष (Horary Astrology)',
        nameEnglish: 'Prashna Jyotish System',
        category: 'jyotish',
        descriptionNepali: 'तत्काल प्रश्न, आरूढ र कार्य सिद्धि निर्णय',
        defaultState: 'open'
      },
      {
        id: 'ankajyotish',
        nameNepali: 'अङ्क ज्योतिष (Numerology Hub)',
        nameEnglish: 'Vedic Numerology Calculations',
        category: 'jyotish',
        descriptionNepali: 'मूलाङ्क, भाग्याङ्क र नामाङ्क विश्लेषण',
        defaultState: 'open'
      },
      {
        id: 'kpjyotish',
        nameNepali: 'केपी ज्योतिष (KP System Astrology)',
        nameEnglish: 'Krishnamurti Paddhati (KP)',
        category: 'jyotish',
        descriptionNepali: 'नक्षत्र स्वामी, उप-स्वामी (Sub-Lord) निर्णय',
        defaultState: 'open'
      },
      {
        id: 'neemajyotish',
        nameNepali: 'नेमा ज्योतिष (Nadi / Neema)',
        nameEnglish: 'Neema & Nadi Astrology',
        category: 'jyotish',
        descriptionNepali: 'नाडी सूत्र, गोचर संयोग र ग्रह मिलान',
        defaultState: 'open'
      },
      {
        id: 'rashifal',
        nameNepali: 'दैनिक तथा वार्षिक राशिफल (Rashifal)',
        nameEnglish: 'Daily & Yearly Horoscope',
        category: 'jyotish',
        descriptionNepali: '१२ राशिहरूको दैनिक तथा वार्षिक फलादेश',
        defaultState: 'open'
      }
    ]
  },
  {
    category: 'vastu',
    categoryLabelNepali: 'वास्तु सेवा तथा उप-मेनुहरू (Vastu Services)',
    categoryLabelEnglish: 'Vastu Shastra Services & Submenus',
    items: [
      {
        id: 'vastu_project',
        nameNepali: 'वास्तु परियोजना व्यवस्थापन (Projects Hub)',
        nameEnglish: 'Vastu Project Management',
        category: 'vastu',
        descriptionNepali: 'नयाँ परियोजना, ग्राहक फाइल तथा नाप व्यवस्थापन',
        defaultState: 'open'
      },
      {
        id: 'vastu_compass',
        nameNepali: '३६०° डिजिटल कम्पास (Digital Compass)',
        nameEnglish: '360° Smart Compass & Directions',
        category: 'vastu',
        descriptionNepali: '१६ दिशा, दिक्पाल तथा कम्पास जाइरोस्कोप',
        defaultState: 'open'
      },
      {
        id: 'vastu_mandala',
        nameNepali: 'वास्तुपुरुष मण्डल ८१ पद (81-Pada Mandala)',
        nameEnglish: '81-Pada Vastu Purusha Mandala',
        category: 'vastu',
        descriptionNepali: 'ब्रह्मस्थान, मर्मस्थान र पद देवता ऊर्जा ग्रिड',
        defaultState: 'open'
      },
      {
        id: 'vastu_audit',
        nameNepali: 'संरचना वास्तु अडिट (Room Placement Audit)',
        nameEnglish: 'Vastu Room Placement Audit',
        category: 'vastu',
        descriptionNepali: 'मुख्यद्वार, भान्छा, पूजाकक्ष र शयनकक्ष परीक्षण',
        defaultState: 'open'
      },
      {
        id: 'vastu_bhumi',
        nameNepali: 'वैदिक भूमि परीक्षण (Land & Soil Test)',
        nameEnglish: 'Land & Soil Vedic Testing',
        category: 'vastu',
        descriptionNepali: 'खाल्डो खन्ने, पानी, दीप तथा माटो परीक्षण विधि',
        defaultState: 'open'
      },
      {
        id: 'vastu_panchatattva',
        nameNepali: 'पञ्चतत्त्व सन्तुलन (Five Elements Balancing)',
        nameEnglish: 'Panchatattva 5-Elements Balancing',
        category: 'vastu',
        descriptionNepali: 'जल, अग्नि, वायु, पृथ्वी, आकाश तत्त्व उपचार',
        defaultState: 'open'
      },
      {
        id: 'vastu_report',
        nameNepali: 'वास्तु २D/३D प्रतिवेदन & ब्लुप्रिन्ट (Vastu Report)',
        nameEnglish: 'Vastu Report & 2D/3D Blueprint Print',
        category: 'vastu',
        descriptionNepali: '१० पृष्ठको कानुनी वास्तु प्रतिवेदन तथा नक्सा प्रिन्ट',
        defaultState: 'lock'
      }
    ]
  },
  {
    category: 'other',
    categoryLabelNepali: 'अन्य मुख्य सफ्टवेयर मोड्युलहरू (Other Core Modules)',
    categoryLabelEnglish: 'Other Core Software Features',
    items: [
      {
        id: 'panchanga',
        nameNepali: 'दैनिक पञ्चाङ्ग (Daily Panchanga)',
        nameEnglish: 'Daily Panchanga & Ephemeris',
        category: 'other',
        descriptionNepali: 'तिथि, वार, नक्षत्र, योग, करण र सूर्योदय/अस्त',
        defaultState: 'open'
      },
      {
        id: 'calendar',
        nameNepali: 'नेपाली क्यालेन्डर / पात्रो (Calendar)',
        nameEnglish: 'Nepali Patro & Festival Calendar',
        category: 'other',
        descriptionNepali: 'चाडपर्व, बिदा र मासिक पात्रो तालिका',
        defaultState: 'open'
      },
      {
        id: 'date_converter',
        nameNepali: 'मिति रूपान्तरण (BS <-> AD Converter)',
        nameEnglish: 'Bikram Sambat Date Converter',
        category: 'other',
        descriptionNepali: 'वि.सं. र ई.सं. बीच तत्काल मिति परिवर्तन',
        defaultState: 'open'
      },
      {
        id: 'kharedi',
        nameNepali: 'वैदिक पसल (Vaidik Pasal / Store)',
        nameEnglish: 'Vedic Store & Puja Items',
        category: 'other',
        descriptionNepali: 'पूजा सामग्री, रत्न, रुद्राक्ष खरिद तथा अर्डर',
        defaultState: 'open'
      },
      {
        id: 'books_download',
        nameNepali: 'ई-पुस्तकालय (Digital Books Library)',
        nameEnglish: 'Vedic Books & Scriptures Download',
        category: 'other',
        descriptionNepali: 'धार्मिक ग्रन्थ, कर्मकाण्ड पुस्तकहरू र PDF',
        defaultState: 'open'
      },
      {
        id: 'vivah',
        nameNepali: 'विवाह मञ्च (Vivah Matrimony)',
        nameEnglish: 'Vedic Marriage & Matching Portal',
        category: 'other',
        descriptionNepali: 'वर-वधु बायोडाटा, गुण मिलान र अष्टकूट',
        defaultState: 'open'
      },
      {
        id: 'yajaman',
        nameNepali: 'यजमान सेवा (Yajaman Bookings)',
        nameEnglish: 'Priest & Ritual Service Booking',
        category: 'other',
        descriptionNepali: 'पूजा, पाठ, अनुष्ठान र पण्डितजी बुकिङ',
        defaultState: 'open'
      },
      {
        id: 'samachar',
        nameNepali: 'समाचार तथा धर्म लेख (News & Articles)',
        nameEnglish: 'Vedic News & Religious Articles',
        category: 'other',
        descriptionNepali: 'सनातन धर्म, चाडपर्व तथा ज्योतिष समाचार',
        defaultState: 'open'
      }
    ]
  }
];

const STORAGE_KEY = 'balananda_client_access_control_v2';
const DEVICE_KEY = 'balananda_client_device_id_v1';

// Fast device fingerprinting for Single Device Lock
export function getOrCreateDeviceId(): { deviceId: string; deviceName: string } {
  if (typeof window === 'undefined') {
    return { deviceId: 'server_dev', deviceName: 'Server Machine' };
  }

  let deviceId = localStorage.getItem(DEVICE_KEY);
  if (!deviceId) {
    const randPart = Math.random().toString(36).substring(2, 9).toUpperCase();
    const timePart = Date.now().toString(36).toUpperCase();
    deviceId = `DEV-${randPart}-${timePart}`;
    localStorage.setItem(DEVICE_KEY, deviceId);
  }

  let deviceName = 'Browser Client';
  try {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) {
      deviceName = /android/i.test(ua) ? 'Android Mobile' : /iphone|ipad/i.test(ua) ? 'Apple iOS Mobile' : 'Mobile Device';
    } else if (/windows/i.test(ua)) {
      deviceName = 'Windows PC';
    } else if (/macintosh/i.test(ua)) {
      deviceName = 'MacBook / MacOS';
    } else if (/linux/i.test(ua)) {
      deviceName = 'Linux Workstation';
    }
  } catch {}

  return { deviceId, deviceName };
}

// Generate simple hash for password
export function hashPassword(plain: string): string {
  let hash = 0;
  for (let i = 0; i < plain.length; i++) {
    hash = (hash << 5) - hash + plain.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
}

// Generate human-friendly strong password
export function generateSmartPassword(prefix: string = 'Vedic'): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  const specials = ['@', '#', '$', '!'];
  const sp = specials[Math.floor(Math.random() * specials.length)];
  return `${prefix}${sp}${digits}`;
}

// Calculate timestamp and BS string based on subscription period
export function calculatePeriodExpiry(period: SubscriptionPeriod): { timestamp: number; bsDate: string } {
  const now = new Date();
  let yearsToAdd = 1;
  if (period === '5_years') yearsToAdd = 5;
  if (period === 'lifetime') yearsToAdd = 100;

  const targetDate = new Date(now);
  targetDate.setFullYear(now.getFullYear() + yearsToAdd);
  const ts = targetDate.getTime();

  let bs = 'आजीवन (Lifetime)';
  if (period !== 'lifetime') {
    try {
      const adStr = targetDate.toISOString().split('T')[0];
      const res = convertADToBS(adStr);
      bs = res?.formattedBS || (typeof res === 'object' ? `${res.year}-${res.month}-${res.day}` : String(res));
    } catch {
      bs = `${yearsToAdd} वर्षपछि`;
    }
  }

  return { timestamp: ts, bsDate: bs };
}

// Default permissions map: starts with defaultState of all features
export function getDefaultPermissionsMap(): Record<string, AccessState> {
  const map: Record<string, AccessState> = {};
  for (const group of CATEGORIZED_FEATURES) {
    for (const feat of group.items) {
      map[feat.id] = feat.defaultState;
    }
  }
  return map;
}

// Generate clean 8-character uppercase alphanumeric license password (e.g. 7F9K3D2P)
export function generateLicenseCodePassword(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const DEFAULT_DEMO_CLIENT_POLICIES: ClientAccessRecord[] = [
  {
    id: 'client_subash_khanal',
    mobile: '9841755199',
    fullName: 'subash khanal',
    loginId: '9841755199',
    passwordPlain: '3AACKE84',
    passwordHash: hashPassword('3AACKE84'),
    createdAtISO: '2025-01-01T10:00:00.000Z',
    createdAtBS: '२०८१-०९-१७',
    period: 'lifetime',
    expiresAtTimestamp: Date.now() + 50 * 365 * 24 * 60 * 60 * 1000,
    expiresAtBS: 'आजीवन (Lifetime)',
    status: 'active',
    permissions: getDefaultPermissionsMap()
  },
  {
    id: 'client_demo_subash',
    mobile: '9866416556',
    fullName: 'Subash Bhandari',
    loginId: 'subash9866',
    passwordPlain: '7F9K3D2P',
    passwordHash: hashPassword('7F9K3D2P'),
    createdAtISO: '2025-01-10T10:00:00.000Z',
    createdAtBS: '२०८१-०९-२६',
    period: '1_year',
    expiresAtTimestamp: Date.now() + 365 * 24 * 60 * 60 * 1000,
    expiresAtBS: '२०८२-०९-२६',
    status: 'active',
    permissions: {
      kundali: 'open',
      faladesh: 'close',
      dasha: 'lock',
      gochar: 'open',
      navamsha: 'open',
      muhurta: 'open',
      sanskar: 'close',
      vastu_project: 'open',
      vastu_compass: 'open',
      vastu_mandala: 'open',
      vastu_audit: 'close',
      vastu_report: 'lock',
      panchanga: 'open',
      calendar: 'open',
      date_converter: 'open',
      kharedi: 'open'
    }
  },
  {
    id: 'client_demo_ram',
    mobile: '9812345678',
    fullName: 'Ram Thapa',
    loginId: 'ram9812',
    passwordPlain: 'KJ8M4L9Q',
    passwordHash: hashPassword('KJ8M4L9Q'),
    createdAtISO: '2025-01-05T08:30:00.000Z',
    createdAtBS: '२०८१-०९-२१',
    period: '5_years',
    expiresAtTimestamp: Date.now() + 5 * 365 * 24 * 60 * 60 * 1000,
    expiresAtBS: '२०८६-०९-२१',
    status: 'active',
    permissions: getDefaultPermissionsMap()
  },
  {
    id: 'client_demo_sita',
    mobile: '9845678901',
    fullName: 'Sita Karki',
    loginId: 'sita9845',
    passwordPlain: 'Z6P7V8N3',
    passwordHash: hashPassword('Z6P7V8N3'),
    createdAtISO: '2024-12-15T12:00:00.000Z',
    createdAtBS: '२०८१-०८-३०',
    period: 'lifetime',
    expiresAtTimestamp: Date.now() + 50 * 365 * 24 * 60 * 60 * 1000,
    expiresAtBS: 'आजीवन (Lifetime)',
    status: 'active',
    permissions: getDefaultPermissionsMap()
  },
  {
    id: 'client_demo_hari',
    mobile: '9823456789',
    fullName: 'Hari Sharma',
    loginId: 'hari9823',
    passwordPlain: 'B1N9K6Q2',
    passwordHash: hashPassword('B1N9K6Q2'),
    createdAtISO: '2025-01-01T09:15:00.000Z',
    createdAtBS: '२०८१-०९-१७',
    period: '1_year',
    expiresAtTimestamp: Date.now() + 365 * 24 * 60 * 60 * 1000,
    expiresAtBS: '२०८२-०९-१७',
    status: 'suspended',
    permissions: getDefaultPermissionsMap()
  },
  {
    id: 'client_demo_gita',
    mobile: '9701234567',
    fullName: 'Gita Adhikari',
    loginId: 'gita9701',
    passwordPlain: 'L8M3P7H5',
    passwordHash: hashPassword('L8M3P7H5'),
    createdAtISO: '2025-01-08T14:40:00.000Z',
    createdAtBS: '२०८१-०९-२४',
    period: '5_years',
    expiresAtTimestamp: Date.now() + 5 * 365 * 24 * 60 * 60 * 1000,
    expiresAtBS: '२०८६-०९-२४',
    status: 'active',
    permissions: getDefaultPermissionsMap()
  }
];

// Helper to safely format BS date to string
export function sanitizeBSDateString(val: any, fallback: string = ''): string {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return val.formattedBS || (val.year && val.month && val.day ? `${val.year}-${val.month}-${val.day}` : fallback);
  }
  return String(val);
}

// Load all client policies
export function loadAllClientPolicies(): ClientAccessRecord[] {
  try {
    if (typeof window === 'undefined') return DEFAULT_DEMO_CLIENT_POLICIES;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_CLIENT_POLICIES));
      return DEFAULT_DEMO_CLIENT_POLICIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      let needsPersist = false;
      const sanitized = parsed.map((r: any) => {
        const cleanCreatedAtBS = sanitizeBSDateString(r.createdAtBS, '२०८१-०१-०१');
        const cleanExpiresAtBS = sanitizeBSDateString(r.expiresAtBS, 'आजीवन (Lifetime)');
        if (typeof r.createdAtBS === 'object' || typeof r.expiresAtBS === 'object') {
          needsPersist = true;
        }
        return {
          ...r,
          createdAtBS: cleanCreatedAtBS,
          expiresAtBS: cleanExpiresAtBS
        };
      });

      // Ensure essential default accounts (e.g. Subash Khanal 9841755199) always exist and have current credentials
      for (const def of DEFAULT_DEMO_CLIENT_POLICIES) {
        const defDigits = def.mobile.replace(/\D/g, '').slice(-10);
        const existingIdx = sanitized.findIndex((c: any) => {
          const cMob = (c.mobile || '').replace(/\D/g, '').slice(-10);
          return (cMob && cMob === defDigits) || (c.loginId && def.loginId && c.loginId.toLowerCase() === def.loginId.toLowerCase());
        });
        if (existingIdx === -1) {
          sanitized.unshift(def);
          needsPersist = true;
        } else if (def.mobile === '9841755199' && (!sanitized[existingIdx].passwordPlain || sanitized[existingIdx].passwordPlain === 'Jyotish#8758')) {
          sanitized[existingIdx].passwordPlain = '3AACKE84';
          sanitized[existingIdx].passwordHash = hashPassword('3AACKE84');
          needsPersist = true;
        }
      }

      if (needsPersist) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
      }
      return sanitized;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DEMO_CLIENT_POLICIES));
    return DEFAULT_DEMO_CLIENT_POLICIES;
  } catch (e) {
    console.error('Failed to load client policies:', e);
    return DEFAULT_DEMO_CLIENT_POLICIES;
  }
}

// Save all client policies
export function saveAllClientPolicies(records: ClientAccessRecord[]): void {
  try {
    if (typeof window === 'undefined') return;
    const sanitized = records.map(r => ({
      ...r,
      createdAtBS: sanitizeBSDateString(r.createdAtBS, '२०८१-०१-०१'),
      expiresAtBS: sanitizeBSDateString(r.expiresAtBS, 'आजीवन (Lifetime)')
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    window.dispatchEvent(new CustomEvent('client-policies-updated', { detail: { records: sanitized } }));
    window.dispatchEvent(new CustomEvent('page-service-control-updated'));
    try {
      const bc = new BroadcastChannel('balananda_client_policy_channel');
      bc.postMessage({ type: 'POLICIES_UPDATED', timestamp: Date.now() });
      bc.close();
    } catch {}
    try {
      const bcPage = new BroadcastChannel('balananda_page_service_control_channel');
      bcPage.postMessage({ type: 'POLICIES_UPDATED', timestamp: Date.now() });
      bcPage.close();
    } catch {}
  } catch (e) {
    console.error('Failed to save client policies:', e);
  }
}

// Find client policy by mobile number, loginId, or full name
export function getClientPolicyByMobile(identifier: string): ClientAccessRecord | null {
  if (!identifier) return null;
  const latinized = fromDevanagariNumerals(String(identifier)).trim();
  const cleanDigits = latinized.replace(/\D/g, '');
  const last10 = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;
  const cleanLower = latinized.toLowerCase();

  const all = loadAllClientPolicies();
  return all.find(r => {
    const rMob = (r.mobile || '').replace(/\D/g, '');
    const rLast10 = rMob.length >= 10 ? rMob.slice(-10) : rMob;

    // 1. Match mobile digits
    if (cleanDigits && rMob) {
      if (cleanDigits === rMob) return true;
      if (last10 && rLast10 && last10 === rLast10) return true;
    }

    // 2. Match loginId
    if (r.loginId && r.loginId.trim().toLowerCase() === cleanLower) return true;

    // 3. Match raw mobile string
    if (r.mobile && r.mobile.trim().toLowerCase() === cleanLower) return true;

    // 4. Match full name
    if (r.fullName && r.fullName.trim().toLowerCase() === cleanLower) return true;

    // 5. Match ID
    if (r.id && r.id.toLowerCase() === cleanLower) return true;

    return false;
  }) || null;
}

/**
 * Register or update a user upon signup or manual entry by Super Admin
 */
export function registerOrUpdateClientPolicy(params: {
  mobile: string;
  fullName: string;
  loginId?: string;
  password?: string;
  period?: SubscriptionPeriod;
  permissions?: Record<string, AccessState>;
}): { success: boolean; record: ClientAccessRecord; generatedPassword?: string } {
  const latinized = fromDevanagariNumerals(String(params.mobile || '')).trim();
  const rawDigits = latinized.replace(/\D/g, '');
  const cleanMobile = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;

  if (!cleanMobile) {
    throw new Error('कृपया मान्य मोबाइल नम्बर प्रविष्ट गर्नुहोस्।');
  }

  const all = loadAllClientPolicies();
  const existingIdx = all.findIndex(r => {
    const rMob = (r.mobile || '').replace(/\D/g, '');
    return rMob === cleanMobile || (r.loginId && params.loginId && r.loginId.toLowerCase() === params.loginId.toLowerCase());
  });

  const plainPass = (params.password || generateLicenseCodePassword()).trim();
  const period = params.period || '1_year';
  const expiry = calculatePeriodExpiry(period);

  const defaultPerms = getDefaultPermissionsMap();
  const mergedPerms = { ...defaultPerms, ...(params.permissions || (existingIdx > -1 ? all[existingIdx].permissions : {})) };

  let todayBS = '२०८१-०१-०१';
  try {
    const todayRes = convertADToBS(new Date().toISOString().split('T')[0]);
    todayBS = sanitizeBSDateString(todayRes, '२०८१-०१-०१');
  } catch {}

  let targetRecord: ClientAccessRecord;

  if (existingIdx > -1) {
    targetRecord = {
      ...all[existingIdx],
      fullName: (params.fullName || all[existingIdx].fullName).trim(),
      loginId: (params.loginId || all[existingIdx].loginId || cleanMobile).trim(),
      passwordPlain: plainPass,
      passwordHash: hashPassword(plainPass),
      period,
      expiresAtTimestamp: expiry.timestamp,
      expiresAtBS: expiry.bsDate,
      permissions: mergedPerms,
    };
    all[existingIdx] = targetRecord;
  } else {
    targetRecord = {
      id: `client_${Date.now()}_${cleanMobile.slice(-4)}`,
      mobile: cleanMobile,
      fullName: (params.fullName || 'नयाँ प्रयोगकर्ता').trim(),
      loginId: (params.loginId || cleanMobile).trim(),
      passwordPlain: plainPass,
      passwordHash: hashPassword(plainPass),
      createdAtISO: new Date().toISOString(),
      createdAtBS: todayBS,
      period,
      expiresAtTimestamp: expiry.timestamp,
      expiresAtBS: expiry.bsDate,
      status: 'active',
      permissions: mergedPerms,
    };
    all.unshift(targetRecord);
  }

  saveAllClientPolicies(all);
  return { success: true, record: targetRecord, generatedPassword: params.password ? undefined : plainPass };
}

/**
 * Verify client login with single-device enforcement
 */
export function verifyClientMobileLogin(
  mobileOrLoginId: string,
  plainPassword: string
): { success: boolean; message: string; record?: ClientAccessRecord } {
  const policy = getClientPolicyByMobile(mobileOrLoginId);

  if (!policy) {
    return {
      success: false,
      message: 'यो मोबाइल नम्बर वा प्रयोगकर्ता नाम दर्ता भएको छैन। कृपया पहिले साइन अप वा सुपरएडमिनसँग सम्पर्क गर्नुहोस्।'
    };
  }

  if (policy.status === 'suspended') {
    return {
      success: false,
      message: 'यो खाता हाल निलम्बित (Suspended) गरिएको छ। कृपया सुपरएडमिनसँग सम्पर्क गर्नुहोस्।'
    };
  }

  const trimmedPass = (plainPassword || '').trim();

  // Check password
  const enteredHash = hashPassword(trimmedPass);
  const isMatch = 
    trimmedPass === policy.passwordPlain ||
    enteredHash === policy.passwordHash ||
    trimmedPass === policy.passwordHash;

  if (!isMatch) {
    return {
      success: false,
      message: 'गलत पासवर्ड! कृपया सुपरएडमिनले दिएको सही पासवर्ड राख्नुहोस्।'
    };
  }

  // Auto-repair passwordHash if needed
  if (policy.passwordPlain && policy.passwordHash !== hashPassword(policy.passwordPlain)) {
    policy.passwordHash = hashPassword(policy.passwordPlain);
  }

  // Check Expiration
  if (Date.now() > policy.expiresAtTimestamp) {
    return {
      success: false,
      message: `यस मोबाइल नम्बरको सदस्यता मिति समाप्त भइसकेको छ (${policy.expiresAtBS})। कृपया नवीकरण गर्नुहोस्।`
    };
  }

  // Single Device Lock Enforcement
  const { deviceId, deviceName } = getOrCreateDeviceId();
  if (policy.activeDeviceId && policy.activeDeviceId !== deviceId) {
    return {
      success: false,
      message: `सुरक्षा प्रतिबन्ध: यो पासवर्ड पहिले नै अर्को डिभाइसमा (${policy.activeDeviceName || 'अन्य उपकरण'}) सक्रिय छ। यो सफ्टवेयर एक पटकमा केवल एउटा डिभाइसमा मात्र प्रयोग गर्न मिल्छ। डिभाइस परिवर्तन गर्न सुपरएडमिनसँग डिभाइस रिसेट गराउनुहोस्।`
    };
  }

  // Lock to current device if not already set
  policy.activeDeviceId = deviceId;
  policy.activeDeviceName = deviceName;
  policy.lastLoginISO = new Date().toISOString();

  const all = loadAllClientPolicies();
  const idx = all.findIndex(r => r.mobile === policy.mobile);
  if (idx > -1) {
    all[idx] = policy;
    saveAllClientPolicies(all);
  }

  // Save current active policy to fast local store
  try {
    localStorage.setItem('balananda_active_mobile_policy_v1', JSON.stringify(policy));
  } catch {}

  return {
    success: true,
    message: 'सफलतापूर्वक लगइन भयो!',
    record: policy
  };
}

/**
 * Reset single-device lock by Super Admin
 */
export function resetClientDeviceLock(mobile: string): boolean {
  const cleanMobile = mobile.replace(/\D/g, '');
  const all = loadAllClientPolicies();
  const idx = all.findIndex(r => r.mobile === cleanMobile);
  if (idx > -1) {
    all[idx].activeDeviceId = undefined;
    all[idx].activeDeviceName = undefined;
    saveAllClientPolicies(all);
    return true;
  }
  return false;
}

/**
 * Change client password after login
 */
export function changeClientPassword(
  mobile: string,
  oldPass: string,
  newPass: string
): { success: boolean; message: string } {
  const cleanMobile = mobile.replace(/\D/g, '');
  const all = loadAllClientPolicies();
  const idx = all.findIndex(r => r.mobile === cleanMobile);
  if (idx === -1) {
    return { success: false, message: 'खाता फेला परेन।' };
  }

  const user = all[idx];
  const oldHash = hashPassword(oldPass);
  if (oldHash !== user.passwordHash && oldPass !== user.passwordPlain) {
    return { success: false, message: 'पुरानो पासवर्ड मिलेन।' };
  }

  if (newPass.length < 6) {
    return { success: false, message: 'नयाँ पासवर्ड कम्तीमा ६ अक्षरको हुनुपर्छ।' };
  }

  user.passwordPlain = newPass;
  user.passwordHash = hashPassword(newPass);
  all[idx] = user;
  saveAllClientPolicies(all);

  try {
    localStorage.setItem('balananda_active_mobile_policy_v1', JSON.stringify(user));
  } catch {}

  return { success: true, message: 'पासवर्ड सफलतापूर्वक परिवर्तन भयो!' };
}

/**
 * Helper to identify active user mobile on current device
 */
export function getActiveUserMobile(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Check active mobile policy
  try {
    const raw = localStorage.getItem('balananda_active_mobile_policy_v1');
    if (raw) {
      const p = JSON.parse(raw);
      if (p?.mobile) return String(p.mobile).replace(/\D/g, '');
    }
  } catch {}

  // 2. Check RBAC session
  try {
    const rbacRaw = localStorage.getItem('balananda_rbac_active_session_v1');
    if (rbacRaw) {
      const r = JSON.parse(rbacRaw);
      if (r?.phone) return String(r.phone).replace(/\D/g, '');
      if (r?.username && /^\d{10}$/.test(r.username)) return String(r.username).replace(/\D/g, '');
    }
  } catch {}

  // 3. Check customer session or lead phone
  try {
    const devRaw = localStorage.getItem('balananda_active_customer_mobile_v1') ||
      localStorage.getItem('balananda_user_mobile_number') ||
      localStorage.getItem('balananda_client_purchase_lead_phone');
    if (devRaw) return String(devRaw).replace(/\D/g, '');
  } catch {}

  return null;
}

/**
 * Check if a specific feature is allowed for the currently logged in mobile policy
 * Interlinked with Super Admin User Control & Page Service Switchboard
 */
export function checkFeatureAccess(featureId: string): {
  allowed: boolean;
  state: AccessState;
  reasonNepali: string;
  hasPersonalPolicy: boolean;
} {
  if (typeof window === 'undefined') {
    return { allowed: true, state: 'open', reasonNepali: '', hasPersonalPolicy: false };
  }

  // Super Admin always has 100% full access
  try {
    const rbacRaw = localStorage.getItem('balananda_rbac_active_session_v1');
    if (rbacRaw) {
      const rbac = JSON.parse(rbacRaw);
      if (rbac.role === 'SUPER_ADMIN' || rbac.role === 'ADMIN') {
        return { allowed: true, state: 'open', reasonNepali: '', hasPersonalPolicy: true };
      }
    }
  } catch {}

  try {
    const adminRaw = localStorage.getItem('balananda_admin_active_session_v1');
    if (adminRaw) {
      const admin = JSON.parse(adminRaw);
      if (admin && admin.role) {
        return { allowed: true, state: 'open', reasonNepali: '', hasPersonalPolicy: true };
      }
    }
  } catch {}

  // Check active mobile against live stored policies (real-time sync)
  const activeMobile = getActiveUserMobile();
  if (activeMobile) {
    const freshPolicy = getClientPolicyByMobile(activeMobile);
    if (freshPolicy) {
      const state = freshPolicy.permissions?.[featureId] || 'open';
      if (state === 'close') {
        return {
          allowed: false,
          state: 'close',
          reasonNepali: 'यो सुविधा मुख्य प्रशासक (Super Admin) द्वारा यस खाताको लागि बन्द गरिएको छ।',
          hasPersonalPolicy: true
        };
      }
      if (state === 'lock') {
        return {
          allowed: false,
          state: 'lock',
          reasonNepali: 'यो प्रिमियम सुविधा लक गरिएको छ। खोल्नका लागि सुपरएडमिनबाट अनुमति लिनुहोस्।',
          hasPersonalPolicy: true
        };
      }
      return { allowed: true, state: 'open', reasonNepali: '', hasPersonalPolicy: true };
    }
  }

  // Check cached active mobile policy
  try {
    const rawPolicy = localStorage.getItem('balananda_active_mobile_policy_v1');
    if (rawPolicy) {
      const policy: ClientAccessRecord = JSON.parse(rawPolicy);
      const state = policy.permissions?.[featureId] || 'open';

      if (state === 'close') {
        return {
          allowed: false,
          state: 'close',
          reasonNepali: 'यो सुविधा मुख्य प्रशासक (Super Admin) द्वारा बन्द गरिएको छ।',
          hasPersonalPolicy: true
        };
      }

      if (state === 'lock') {
        return {
          allowed: false,
          state: 'lock',
          reasonNepali: 'यो प्रिमियम सुविधा लक गरिएको छ। खोल्नका लागि सुपरएडमिनबाट अनुमति लिनुहोस्।',
          hasPersonalPolicy: true
        };
      }

      return { allowed: true, state: 'open', reasonNepali: '', hasPersonalPolicy: true };
    }
  } catch {}

  return { allowed: true, state: 'open', reasonNepali: '', hasPersonalPolicy: false };
}

