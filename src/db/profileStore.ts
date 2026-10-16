import { 
  BirthDetails, 
  ApplicationSettings, 
  OrganizationProfile, 
  AstrologerProfile, 
  PurohitProfile,
  VastuExpertProfile 
} from '../types/astrology';

export type { BirthDetails };
import { getDefaultLogoSvg, getDefaultMainPhotoSvg } from '../utils/imageUtils';

import { convertADToBS } from '../utils/nepaliCalendar';

const STORAGE_KEY_PROFILES = 'nepali_astro_profiles_v1';
const STORAGE_KEY_SETTINGS = 'nepali_astro_settings_v1';
const STORAGE_KEY_ORG_PROFILE = 'sukdev_org_profile_v1';
const STORAGE_KEY_ASTROLOGERS = 'sukdev_astrologers_v1';
const STORAGE_KEY_PUROHITS = 'sukdev_purohits_v1';
const STORAGE_KEY_VASTU_EXPERTS = 'sukdev_vastu_experts_v1';
const STORAGE_KEY_PATRIKA_RECORDS = 'sukdev_patrika_records_v1';
import { getCachedAstroCalculation } from '../utils/astroCache';
import { convertBSToADFull } from '../utils/bsCalendarData';

/**
 * Ensures birth profile is enriched with authentic Vedic astronomical calculation
 * (Janma Rashi / Moon sign, Lagna, Nakshatra) based on DOB, Time, and Location.
 */
export function enrichProfileWithAstroCalculations(profile: BirthDetails): BirthDetails {
  if (!profile || profile.id === 'live_current_moment' || profile.name?.includes('तात्कालिक')) {
    return profile;
  }

  // 1. Resolve AD birth date if missing but BS is provided
  let adDate = profile.dateAD;
  if (!adDate && profile.dateBS) {
    try {
      const match = profile.dateBS.match(/\d+/g);
      if (match && match.length >= 3) {
        adDate = convertBSToADFull(parseInt(match[0], 10), parseInt(match[1], 10), parseInt(match[2], 10));
      }
    } catch {}
  }

  const timeStr = profile.time && profile.time.trim() !== '' ? profile.time : '12:00';
  const lat = profile.location?.latitude ?? 27.7172;
  const lng = profile.location?.longitude ?? 85.3240;
  const tz = profile.location?.timeZone ?? 5.75;

  if (adDate) {
    try {
      const calc = getCachedAstroCalculation(adDate, timeStr, lat, lng, tz, 'Lahiri');
      if (calc?.moon) {
        return {
          ...profile,
          dateAD: adDate,
          moonRashi: calc.moon.rashiName,
          lagnaRashi: calc.lagna?.rashiName,
          nakshatra: calc.moon.nakshatraName,
        };
      }
    } catch (e) {
      console.warn('Failed to calculate astro properties for profile:', e);
    }
  }

  return profile;
}


/**
 * Generates a dynamic real-time profile based on the EXACT CURRENT (recent) date and time
 * Used as the live dynamic baseline for Faladesh, Panchanga, Kundali & Gochar calculations
 * when no user profile is selected / logged in.
 */
export function getLiveCurrentMomentProfile(): BirthDetails {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateAD = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  let dateBS = '';
  try {
    dateBS = convertADToBS(dateAD).formattedBS || dateAD;
  } catch {
    dateBS = dateAD;
  }

  return {
    id: 'live_current_moment',
    name: 'तात्कालिक समय (प्रत्यक्ष गोचर)',
    gender: 'male',
    dateAD,
    dateBS,
    time,
    location: {
      name: 'काठमाडौँ (Kathmandu)',
      district: 'काठमाडौँ',
      province: 'बागमती',
      country: 'नेपाल',
      latitude: 27.7172,
      longitude: 85.3240,
      timeZone: 5.75,
    },
    category: 'Client',
    notes: 'वर्तमान समयको प्रत्यक्ष ग्रहस्थिति तथा पञ्चाङ्ग गणना।',
  };
}

// No static demo profiles - All data is user-scoped upon sign-in or dynamic live current moment
export const DEFAULT_PROFILES: BirthDetails[] = [];

export const DEFAULT_ORG_PROFILE: OrganizationProfile = {
  name: 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा',
  phone: '+९७७-९७६४४००५३३',
  email: 'suwashdmk@gmail.com',
  address: 'काठमाडौँ, नेपाल',
  tagline: 'सनातन वैदिक ज्ञान, शास्त्रीय मर्यादा एवं प्रामाणिक सेवाको पावन संगम',
  mottoText: 'ज्ञानमा शास्त्रीय आधार, आचरणमा सत्यनिष्ठा, सेवामा श्रद्धा र प्रविधिमा आधुनिकता',
  mangalShloka: '॥ श्रीगणेशाय नमः ॥ ॥ श्रीवास्तुपुरुषाय नमः ॥ ॥ श्रीकुलदेवतायै नमः ॥',
  astrologerName: 'ज्योतिषाचार्य सुकदेव शर्मा',
  astrologerTitle: 'वरिष्ठ वास्तुविद् तथा ज्योतिषाचार्य',
  shlokaText: 'ॐ सह नाववतु।\nसह नौ भुनक्तु।\nसह वीर्यं करवावहै।\nतेजस्वि नावधीतमस्तु मा विद्विषावहै॥\nॐ शान्तिः शान्तिः शान्तिः॥',
  shlokaSource: 'कृष्ण यजुर्वेदीय तैत्तिरीयोपनिषद् (ब्रह्मानन्दवल्ली)',
  shlokaMeaning: 'परमात्माले हामी दुवै (सेवा प्रदायक र सेवाग्राही) को साथसाथै रक्षा गरून्। हामी दुवैलाई साथसाथै पोषण गरून्। हामी परस्पर मिलेर पराक्रम र सामर्थ्य प्राप्त गरौँ। हाम्रो अध्ययन र ज्ञान तेजस्वी तथा प्रकाशमान होस्। हामीबीच कहिल्यै द्वेष नहोस्। आधिभौतिक, आधिदैविक र आध्यात्मिक त्रिविध ताप शान्त हुन्।',
  intro: 'सनातन वैदिक ज्ञान केवल परम्पराको स्मृति मात्र होइन; मानव जीवनलाई धर्म, ऋत, विवेक, अनुशासन र सदाचारतर्फ अभिमुख गराउने शाश्वत ज्ञानपरम्परा हो। यही पवित्र भावना र शास्त्रीय निष्ठाबाट प्रेरित भई ‘बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा’ ले वैदिक ज्योतिष, वास्तुशास्त्र, कर्मकाण्डीय संस्कार तथा धार्मिक अनुष्ठानसम्बन्धी सेवाहरूलाई मौलिक मर्यादा, शास्त्रसम्मत विधि र आधुनिक डिजिटल प्रविधिको समन्वयमा सेवाग्राहीसमक्ष सरल एवं व्यवस्थित रूपमा पुर्‍याउने उद्देश्य लिएको छ।\n\nहामी नवस्थापित वैदिक सेवा संस्था हौँ। शताब्दियौँ पुरानो ऐतिहासिकताको आडम्बर नगरी, हामी वैदिक ज्ञानप्रतिको अनन्य श्रद्धा, निरन्तर स्वाध्याय, शास्त्रीय अनुशीलन, पारदर्शी आचरण तथा सेवाग्राहीप्रतिको गम्भीर उत्तरदायित्वलाई आफ्नो मूल आधार मान्दछौँ।\n\nज्योतिषलाई काल र कर्मफलको मार्गदर्शनका रूपमा, वास्तुलाई प्रकृति र जीवनको सामञ्जस्यका रूपमा तथा कर्मकाण्डलाई मन्त्र र विधिको अनुशासित संस्कारका रूपमा जनसमक्ष स्थापित गर्नु हाम्रो अभीष्ट हो। प्रविधिको सदुपयोग गर्दै सेवाग्राहीलाई भ्रम र भयबाट मुक्त राखी शास्त्रीय समाधानतर्फ डोर्‍याउनु नै हाम्रो सेवाधर्म हो।',
  missionText: 'वैदिक ज्ञान, शास्त्रीय मर्यादा, सदाचार र निष्काम सेवाभावका आधारमा ज्योतिष, वास्तु तथा कर्मकाण्डसम्बन्धी सेवाहरूलाई व्यवस्थित, जिम्मेवार र सबैका लागि सहज पहुँचयोग्य बनाउनु।',
  visionText: 'सनातन वैदिक परम्पराप्रति अनन्य श्रद्धा राख्दै गहन अध्ययन, प्रामाणिकता, पारदर्शिता र आधुनिक प्रविधिको सदुपयोगद्वारा एक विश्वसनीय, मर्यादित र लोकमङ्गलकारी वैदिक सेवा प्रणालीको विकास गर्नु।',
  sankalpaText: 'प्रत्येक सेवामा हृदयको श्रद्धा, सत्यनिष्ठा, शुद्ध संकल्प, सेवाग्राहीको मर्यादा, व्यक्तिगत विवरणको पूर्ण गोपनीयता र धर्मसम्मत आचरणलाई सर्वोपरि राखी निष्कपट भावले लोकमङ्गलका निम्ति समर्पित रहनु।',
  objectivesList: [
    'वैदिक ज्ञान, सनातन परम्परा तथा शास्त्रीय मर्यादाको संरक्षण र संवर्धन',
    'ज्योतिषीय परामर्श, जन्मपत्रिका तथा कुण्डली प्रणालीको सुव्यवस्थित डिजिटल व्यवस्थापन',
    'कर्मकाण्ड, पूजा–अनुष्ठान तथा संस्कार सेवाको पारदर्शी र अनुशासित व्यवस्थापन',
    'शास्त्रीय वास्तु परामर्शलाई आधुनिक स्थापत्य र प्रविधिसँग जोडी व्यावहारिक समाधान प्रदान गर्नु',
    'यजमान तथा सेवाग्राहीसँग सत्यनिष्ठ, गोप्य र मर्यादित संवाद प्रणाली कायम राख्नु',
    'वैदिक वाङ्मय, पञ्चाङ्ग तथा शास्त्रीय ज्ञानसामग्रीलाई डिजिटल माध्यममार्फत पहुँचयोग्य बनाउनु'
  ],
  newJourneyTitle: 'नवप्रारम्भ — निष्ठापूर्ण सेवा यात्रा',
  newJourneyText: 'यो संस्था हालै स्थापना भएको नवप्रारम्भ हो। कुनै कृत्रिम अतिरञ्जना बिना, सनातन परम्पराको गरिमा र प्रविधिको सामर्थ्यलाई जोडेर क्रमशः एक निष्कलङ्क, अनुशासित र लोकमङ्गलकारी वैदिक सेवा प्रणाली निर्माण गर्ने हाम्रो दृढ सङ्कल्प छ।',
  coreValues: [
    { title: 'ज्ञान', desc: 'वेद, शास्त्र, ज्योतिष, वास्तु र कर्मकाण्डसम्बन्धी ज्ञानको निरन्तर अध्ययन, विवेकपूर्ण प्रयोग तथा प्रामाणिकताको खोजी।' },
    { title: 'परम्परा', desc: 'ऋषि–महर्षिको ज्ञानपरम्परा, गुरु–शिष्य मर्यादा, वैदिक संस्कार, मन्त्रविधि र सनातन सांस्कृतिक सम्पदाप्रति अगाध सम्मान।' },
    { title: 'विश्वसनीयता', desc: 'सेवाग्राहीसँग सत्यनिष्ठ व्यवहार, यथार्थपरक परामर्श, व्यक्तिगत विवरणको पूर्ण गोपनीयता र जिम्मेवार सेवा।' },
    { title: 'पारदर्शिता', desc: 'सेवा प्रक्रिया, परामर्श विधि, समय, मर्यादा र शुल्कको स्पष्टतासहित उत्तरदायी एवं निष्कपट आचरण।' },
    { title: 'सेवा', desc: 'व्यावसायिकताभन्दा माथि उठेर श्रद्धा, करुणा, सद्भाव र लोकमङ्गलको भावबाट प्रेरित निष्कपट सेवाभाव।' },
    { title: 'सदाचार', desc: 'मन, वचन र कर्मको शुचिता तथा धर्मसम्मत नैतिक आचरणको पालना।' }
  ],
  website: 'www.balanandavaidiksewa.com',
  logoUrl: '/logo.png',
  mainPhotoUrl: getDefaultMainPhotoSvg(),
  headerNote: 'सनातन वैदिक ज्ञान, शास्त्रीय मर्यादा एवं प्रामाणिक सेवाको पावन संगम',
  footerNote: 'सम्पर्क: +९७७-९७६४४००५३३ | इमेल: suwashdmk@gmail.com | वेबसाइट: www.balanandavaidiksewa.com',
  showLogoOnBills: true,
  showPhotoOnReports: true,
  registeredNo: 'दर्ता नं. ',
  panNo: 'PAN: ',
};

export const DEFAULT_ASTROLOGERS: AstrologerProfile[] = [
  {
    id: 'astro_1',
    name: 'ज्योतिषाचार्य सुकदेव शर्मा',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    title: 'मुख्य ज्योतिषाचार्य तथा संस्थापक',
    expertise: ['जन्मकुण्डली फलादेश', 'विवाह मिलान', 'मुहूर्त चयन', 'ग्रहशान्ति'],
    contactPhone: '+९७७-९७६४४००५३३',
    email: 'suwashdmk@gmail.com',
    experienceYears: 25,
    signatureUrl: '',
    bio: 'वैदिक ज्योतिष, फलित तथा सिद्धान्त ज्योतिष शास्त्रका ज्ञाता। २५ वर्षभन्दा बढीको अनुसन्धान तथा परामर्श अनुभव।',
    isAvailable: true,
  },
  {
    id: 'astro_2',
    name: 'आचार्य नारायणप्रसाद पोखरेल',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    title: 'वरिष्ठ ज्योतिष अनुसन्धानकर्ता',
    expertise: ['दशा फलादेश', 'गोचर विचार', 'अष्टकवर्ग'],
    contactPhone: '+९७७-९८५१२३४५६७',
    email: 'narayan@sukdev.np',
    experienceYears: 18,
    signatureUrl: '',
    bio: 'पञ्चाङ्ग गणित तथा नवग्रह शान्ति विशेष विशेषज्ञ।',
    isAvailable: true,
  },
];

export const DEFAULT_PUROHITS: PurohitProfile[] = [
  {
    id: 'purohit_1',
    name: 'वेदमूर्ति पण्डित तुलसीराम भट्टराई',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    speciality: ['विवाह संस्कार', 'नवाहन', 'रुद्री पाठ', 'हवन'],
    contactPhone: '+९७७-९८४१२३४५६८',
    experienceYears: 20,
    bio: 'शुक्ल यजुर्वेद कर्मकाण्ड तथा विधिपूर्वक महायज्ञ गराउने वरिष्ठ पुरोहित।',
    isAvailable: true,
  },
  {
    id: 'purohit_2',
    name: 'पण्डित केशवदेव शास्त्री',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
    speciality: ['पास्नी', 'व्रतबन्ध', 'वास्तु पूजा', 'ग्रहशान्ति'],
    contactPhone: '+९७७-९८६०१२३४५६',
    experienceYears: 15,
    bio: 'संस्कार पूजा तथा हवन कर्मकाण्डमा सिद्धहस्त।',
    isAvailable: true,
  },
];

export const DEFAULT_SETTINGS: ApplicationSettings = {
  ayanamsaSystem: 'Lahiri',
  nodeType: 'True',
  houseSystem: 'Whole Sign',
  chartStyle: 'North Indian',
  language: 'ne',
  themeMode: 'light',
  jyotishiModeEnabled: true,
  astrologerName: 'ज्योतिषाचार्य सुकदेव शर्मा',
  organizationName: 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा',
  contactInfo: '+९७७-९७६४४००५३३ | suwashdmk@gmail.com',
};

// In-memory Caches
let memoryProfiles: BirthDetails[] | null = null;
let memorySettings: ApplicationSettings | null = null;
let memoryOrgProfile: OrganizationProfile | null = null;
let memoryAstrologers: AstrologerProfile[] | null = null;
let memoryPurohits: PurohitProfile[] | null = null;
let memoryVastuExperts: VastuExpertProfile[] | null = null;
let memoryPatrikaRecords: any[] | null = null;

// Profile Store Handlers
export function getStoredProfiles(): BirthDetails[] {
  if (memoryProfiles) return memoryProfiles;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILES);
    if (!raw) {
      memoryProfiles = [];
      return [];
    }
    const parsed: BirthDetails[] = JSON.parse(raw);
    // Clean up any legacy dummy visitor keys from localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('balananda_user_birth_profile_user_self');
        localStorage.removeItem('balananda_user_birth_profile_client_self');
      } catch {}
    }
    // Strip out legacy demo profiles and visitor dummy profiles
    const cleaned = Array.isArray(parsed)
      ? parsed.filter(
          (p) =>
            p &&
            !p.id?.startsWith('sample_') &&
            p.id !== 'user_profile_user_self' &&
            p.id !== 'user_profile_client_self' &&
            p.name !== 'राम शर्मा' &&
            p.name !== 'सीता देवी'
        )
      : [];
    if (cleaned.length !== parsed.length) {
      saveProfiles(cleaned);
    }
    memoryProfiles = cleaned;
    return cleaned;
  } catch (e) {
    console.error('Failed to parse profiles from LocalStorage', e);
    return [];
  }
}

/**
 * Multi-Tenant Data Isolation: Filter profiles by Client / User
 * - SuperAdmin sees ALL authentic user profiles
 * - Logged-in Client strictly sees profiles they created/saved on their account/device
 * - Visitors without login have NO demo profiles (dynamic live current moment is computed instead)
 */
export function getProfilesForUser(userId?: string | null, isSuperAdmin: boolean = false): BirthDetails[] {
  const all = getStoredProfiles();
  if (isSuperAdmin) return all;
  if (!userId) {
    // Visitor: No demo profiles - calculations will be based on real-time current date/time
    return [];
  }
  // Client / Member: strictly see their own profiles saved under their account
  const userProfiles = all.filter((p) => p.clientId && p.clientId === userId);
  return userProfiles;
}

export function saveProfiles(profiles: BirthDetails[]) {
  memoryProfiles = profiles;
  try {
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
    const now = new Date().toISOString();
    localStorage.setItem('nepali_astro_last_sync_timestamp', now);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('astro_sync_updated', { detail: { timestamp: now } }));
    }
  } catch (e) {
    console.error('Failed to save profiles to LocalStorage', e);
  }
}

import { getActiveRBACSession } from './rbacStore';

/**
 * Get or initialize user-specific birth profile for personalized rashifal dashboard
 */
export function getUserPersonalBirthProfile(
  userId?: string | null,
  userName?: string | null,
  userPhone?: string | null
): BirthDetails | null {
  // Strictly return null if no authenticated user ID or if visitor identifier
  if (!userId || userId === 'user_self' || userId === 'client_self') {
    return null;
  }

  // 0. Check active RBAC session birthDetails first
  const currentSession = getActiveRBACSession();
  if (currentSession && (currentSession.userId === userId || currentSession.username === userId || (userPhone && currentSession.phone === userPhone))) {
    if (currentSession.birthDetails && currentSession.birthDetails.id !== 'live_current_moment') {
      return enrichProfileWithAstroCalculations(currentSession.birthDetails);
    }
  }

  // 1. Try local storage key specific to this user
  if (typeof window !== 'undefined' && userId) {
    try {
      const userKey = `balananda_user_birth_profile_${userId}`;
      const raw = localStorage.getItem(userKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.name && parsed.id !== 'live_current_moment' && parsed.id !== 'user_profile_user_self') {
          return enrichProfileWithAstroCalculations(parsed);
        }
      }
    } catch {}
  }

  // 2. Check saved profiles in store
  const allProfiles = getStoredProfiles();
  if (userId) {
    const userProfile = allProfiles.find(
      (p) => p.id !== 'live_current_moment' && p.id !== 'user_profile_user_self' && (p.clientId === userId || p.id === `user_profile_${userId}`)
    );
    if (userProfile) return enrichProfileWithAstroCalculations(userProfile);
  }

  if (userName) {
    const cleanName = userName.trim().toLowerCase();
    const matchedByName = allProfiles.find(
      (p) => p.id !== 'live_current_moment' && p.id !== 'user_profile_user_self' && p.name && p.name.trim().toLowerCase() === cleanName
    );
    if (matchedByName) return enrichProfileWithAstroCalculations(matchedByName);
  }

  // If no saved personal profile exists for this user, do NOT invent an arbitrary past birthdate.
  // Returning null ensures the application uses the authentic live current moment profile for calculations.
  return null;
}

export function saveUserPersonalBirthProfile(
  userId: string,
  profile: BirthDetails
): void {
  const enriched = enrichProfileWithAstroCalculations(profile);
  if (typeof window !== 'undefined' && userId) {
    try {
      localStorage.setItem(`balananda_user_birth_profile_${userId}`, JSON.stringify(enriched));
    } catch {}
  }
  saveProfile(enriched);
}

export function saveProfile(profile: BirthDetails): BirthDetails {
  const enriched = enrichProfileWithAstroCalculations(profile);
  const profiles = getStoredProfiles();
  const id = enriched.id || `profile_${Date.now()}`;
  const customerId = enriched.customerId || `ग्राह-${String(profiles.length + 1).padStart(3, '०')}`;
  const currentSession = getActiveRBACSession();
  const clientId = enriched.clientId || currentSession?.userId || 'client_self';
  const updatedProfile = { 
    ...enriched, 
    id, 
    customerId,
    clientId,
    createdAt: enriched.createdAt || new Date().toISOString() 
  };

  const index = profiles.findIndex((p) => p.id === id);
  if (index >= 0) {
    profiles[index] = updatedProfile;
  } else {
    profiles.unshift(updatedProfile);
  }

  saveProfiles(profiles);
  return updatedProfile;
}

export function editProfile(updated: BirthDetails): BirthDetails {
  const profiles = getStoredProfiles();
  const index = profiles.findIndex((p) => p.id === updated.id);
  if (index >= 0) {
    profiles[index] = { 
      ...profiles[index], 
      ...updated, 
      updatedAt: new Date().toISOString() 
    };
    saveProfiles(profiles);
  }
  return updated;
}

export function deleteProfile(id: string) {
  const profiles = getStoredProfiles().filter((p) => p.id !== id);
  saveProfiles(profiles);
}

/**
 * Export Kundalis / Profiles to CSV with UTF-8 BOM
 */
export function exportProfilesToCSV(profilesList?: BirthDetails[]): string {
  const list = profilesList || getStoredProfiles();
  const headers = [
    'Profile ID',
    'Customer ID',
    'Full Name',
    'Gender',
    'Date BS',
    'Date AD',
    'Birth Time',
    'Location Name',
    'Latitude',
    'Longitude',
    'Timezone',
    'Created By (Client ID)',
    'Created At'
  ];

  const rows = list.map((p) => [
    `"${p.id || ''}"`,
    `"${p.customerId || ''}"`,
    `"${p.name || ''}"`,
    `"${p.gender || 'male'}"`,
    `"${p.dateBS || ''}"`,
    `"${p.dateAD || ''}"`,
    `"${p.time || ''}"`,
    `"${p.location?.name || ''}"`,
    `"${p.location?.latitude ?? ''}"`,
    `"${p.location?.longitude ?? ''}"`,
    `"${p.location?.timeZone ?? ''}"`,
    `"${p.clientId || 'System/Legacy'}"`,
    `"${p.createdAt || ''}"`
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

// Settings Store Handlers
export function getStoredSettings(): ApplicationSettings {
  if (memorySettings) return memorySettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) {
      saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    memorySettings = { ...DEFAULT_SETTINGS, ...parsed };
    if (!memorySettings.ayanamsaSystem) {
      memorySettings.ayanamsaSystem = 'Chitrapaksha';
    }
    return memorySettings!;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: ApplicationSettings) {
  memorySettings = settings;
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

// Organization Profile Handlers
export function getStoredOrgProfile(): OrganizationProfile {
  if (memoryOrgProfile) return memoryOrgProfile;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ORG_PROFILE);
    if (!raw) {
      saveOrgProfile(DEFAULT_ORG_PROFILE);
      return DEFAULT_ORG_PROFILE;
    }
    const parsed = JSON.parse(raw);
    if (
      !parsed.name || 
      parsed.name.includes('सुकदेव') || 
      !parsed.logoUrl || 
      parsed.logoUrl.includes('सुकदेव') || 
      parsed.logoUrl.startsWith('data:image/svg') ||
      !parsed.missionText ||
      !parsed.sankalpaText ||
      !parsed.mottoText ||
      parsed.registeredNo?.includes('१२३४')
    ) {
      parsed.name = DEFAULT_ORG_PROFILE.name;
      parsed.phone = DEFAULT_ORG_PROFILE.phone;
      parsed.email = DEFAULT_ORG_PROFILE.email;
      parsed.address = DEFAULT_ORG_PROFILE.address;
      parsed.website = DEFAULT_ORG_PROFILE.website;
      parsed.headerNote = DEFAULT_ORG_PROFILE.headerNote;
      parsed.intro = DEFAULT_ORG_PROFILE.intro;
      parsed.footerNote = DEFAULT_ORG_PROFILE.footerNote;
      parsed.tagline = DEFAULT_ORG_PROFILE.tagline;
      parsed.mottoText = DEFAULT_ORG_PROFILE.mottoText;
      parsed.mangalShloka = DEFAULT_ORG_PROFILE.mangalShloka;
      parsed.missionText = DEFAULT_ORG_PROFILE.missionText;
      parsed.visionText = DEFAULT_ORG_PROFILE.visionText;
      parsed.sankalpaText = DEFAULT_ORG_PROFILE.sankalpaText;
      parsed.shlokaText = DEFAULT_ORG_PROFILE.shlokaText;
      parsed.shlokaSource = DEFAULT_ORG_PROFILE.shlokaSource;
      parsed.shlokaMeaning = DEFAULT_ORG_PROFILE.shlokaMeaning;
      parsed.coreValues = DEFAULT_ORG_PROFILE.coreValues;
      parsed.registeredNo = DEFAULT_ORG_PROFILE.registeredNo;
      parsed.panNo = DEFAULT_ORG_PROFILE.panNo;
      parsed.logoUrl = '/logo.png';
      parsed.mainPhotoUrl = DEFAULT_ORG_PROFILE.mainPhotoUrl;
    }
    memoryOrgProfile = {
      ...DEFAULT_ORG_PROFILE,
      ...parsed,
      logoUrl: parsed.logoUrl && !parsed.logoUrl.startsWith('data:image/svg') ? parsed.logoUrl : '/logo.png',
      mainPhotoUrl: parsed.mainPhotoUrl || DEFAULT_ORG_PROFILE.mainPhotoUrl,
    };
    return memoryOrgProfile!;
  } catch (e) {
    return DEFAULT_ORG_PROFILE;
  }
}

export function saveOrgProfile(profile: OrganizationProfile) {
  memoryOrgProfile = profile;
  try {
    localStorage.setItem(STORAGE_KEY_ORG_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save organization profile', e);
  }
}

// Astrologers Handlers
export function getStoredAstrologers(): AstrologerProfile[] {
  if (memoryAstrologers) return memoryAstrologers;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ASTROLOGERS);
    if (!raw) {
      saveAstrologers(DEFAULT_ASTROLOGERS);
      return DEFAULT_ASTROLOGERS;
    }
    memoryAstrologers = JSON.parse(raw);
    return memoryAstrologers!;
  } catch (e) {
    return DEFAULT_ASTROLOGERS;
  }
}

export function saveAstrologers(astrologers: AstrologerProfile[]) {
  memoryAstrologers = astrologers;
  try {
    localStorage.setItem(STORAGE_KEY_ASTROLOGERS, JSON.stringify(astrologers));
  } catch (e) {
    console.error('Failed to save astrologers', e);
  }
}

export function saveAstrologer(astro: AstrologerProfile): AstrologerProfile {
  const list = getStoredAstrologers();
  const id = astro.id || `astro_${Date.now()}`;
  const updated = { ...astro, id };
  const idx = list.findIndex((a) => a.id === id);
  if (idx >= 0) {
    list[idx] = updated;
  } else {
    list.unshift(updated);
  }
  saveAstrologers(list);
  return updated;
}

export function deleteAstrologer(id: string) {
  const list = getStoredAstrologers().filter((a) => a.id !== id);
  saveAstrologers(list);
}

export const DEFAULT_VASTU_EXPERTS: VastuExpertProfile[] = [
  {
    id: 'vastu_1',
    name: 'वास्तुविद् देवराज अर्याल',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
    title: 'वरिष्ठ वैदिक वास्तुविद् तथा भूमि परीक्षण विशेषज्ञ',
    speciality: ['गृह वास्तु', 'भवन वास्तु', 'भूमि परीक्षण', 'वास्तु दोष निवारण'],
    contactPhone: '+९७७-९८५२०३४५६७',
    email: 'devraj.vastu@sukdev.np',
    experienceYears: 22,
    bio: 'विश्वकर्मा प्रकाश तथा मयमतम् ग्रन्थमा आधारित प्रामाणिक वैदिक वास्तु परामर्शदाता।',
    isAvailable: true,
    isVerified: true,
    status: 'approved',
    serviceMode: 'both',
  },
  {
    id: 'vastu_2',
    name: 'वास्तुविद् डा. गोविन्द खनाल',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300',
    title: 'देवालय तथा व्यावसायिक वास्तुविद्',
    speciality: ['देवालय वास्तु', 'गुरुकुल तथा आश्रम वास्तु', 'जलाशय वास्तु'],
    contactPhone: '+९७७-९८४९८७६५४३',
    email: 'govinda.vastu@sukdev.np',
    experienceYears: 16,
    bio: 'प्राचीन समराङ्गणसूत्रधार शास्त्र अनुसार गुरुकुल, मठमन्दिर तथा उद्योग वास्तु विशेषज्ञ।',
    isAvailable: true,
    isVerified: true,
    status: 'approved',
    serviceMode: 'both',
  },
];

// Purohits Handlers
export function getStoredPurohits(): PurohitProfile[] {
  if (memoryPurohits) return memoryPurohits;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PUROHITS);
    if (!raw) {
      savePurohits(DEFAULT_PUROHITS);
      return DEFAULT_PUROHITS;
    }
    memoryPurohits = JSON.parse(raw);
    return memoryPurohits!;
  } catch (e) {
    return DEFAULT_PUROHITS;
  }
}

export function savePurohits(purohits: PurohitProfile[]) {
  memoryPurohits = purohits;
  try {
    localStorage.setItem(STORAGE_KEY_PUROHITS, JSON.stringify(purohits));
  } catch (e) {
    console.error('Failed to save purohits', e);
  }
}

export function savePurohit(purohit: PurohitProfile): PurohitProfile {
  const list = getStoredPurohits();
  const id = purohit.id || `purohit_${Date.now()}`;
  const updated = { ...purohit, id };
  const idx = list.findIndex((p) => p.id === id);
  if (idx >= 0) {
    list[idx] = updated;
  } else {
    list.unshift(updated);
  }
  savePurohits(list);
  return updated;
}

export function deletePurohit(id: string) {
  const list = getStoredPurohits().filter((p) => p.id !== id);
  savePurohits(list);
}

// Vastu Experts Handlers
export function getStoredVastuExperts(): VastuExpertProfile[] {
  if (memoryVastuExperts) return memoryVastuExperts;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_VASTU_EXPERTS);
    if (!raw) {
      saveVastuExperts(DEFAULT_VASTU_EXPERTS);
      return DEFAULT_VASTU_EXPERTS;
    }
    memoryVastuExperts = JSON.parse(raw);
    return memoryVastuExperts!;
  } catch (e) {
    return DEFAULT_VASTU_EXPERTS;
  }
}

export function saveVastuExperts(experts: VastuExpertProfile[]) {
  memoryVastuExperts = experts;
  try {
    localStorage.setItem(STORAGE_KEY_VASTU_EXPERTS, JSON.stringify(experts));
  } catch (e) {
    console.error('Failed to save vastu experts', e);
  }
}

export function saveVastuExpert(expert: VastuExpertProfile): VastuExpertProfile {
  const list = getStoredVastuExperts();
  const id = expert.id || `vastu_${Date.now()}`;
  const updated = { ...expert, id };
  const idx = list.findIndex((v) => v.id === id);
  if (idx >= 0) {
    list[idx] = updated;
  } else {
    list.unshift(updated);
  }
  saveVastuExperts(list);
  return updated;
}

export function deleteVastuExpert(id: string) {
  const list = getStoredVastuExperts().filter((v) => v.id !== id);
  saveVastuExperts(list);
}

// Patrika Records Handlers
export function getStoredPatrikaRecords(): any[] {
  if (memoryPatrikaRecords) return memoryPatrikaRecords;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PATRIKA_RECORDS);
    if (!raw) return [];
    memoryPatrikaRecords = JSON.parse(raw);
    return memoryPatrikaRecords!;
  } catch (e) {
    return [];
  }
}

export function savePatrikaRecord(record: any): any {
  const list = getStoredPatrikaRecords();
  const id = record.id || `patrika_${Date.now()}`;
  const patrikaNo = record.patrikaNo || `पत्र-${String(list.length + 1).padStart(3, '०')}/०८३`;
  const updated = { ...record, id, patrikaNo };

  const idx = list.findIndex((r) => r.id === id);
  if (idx >= 0) {
    list[idx] = updated;
  } else {
    list.unshift(updated);
  }

  memoryPatrikaRecords = list;
  try {
    localStorage.setItem(STORAGE_KEY_PATRIKA_RECORDS, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save patrika record', e);
  }
  return updated;
}

