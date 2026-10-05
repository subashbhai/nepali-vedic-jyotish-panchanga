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
  tagline: 'नेपालकै सबैभन्दा भरपर्दो वैदिक सेवा • सनातन धर्म र प्रामाणिक वास्तुको संगम',
  mangalShloka: '॥ श्री गणेशाय नमः ॥ ॥ श्री वास्तुपुरुषाय नमः ॥ ॥ श्री कुलदेवतायै नमः ॥',
  astrologerName: 'ज्योतिषाचार्य सुकदेव शर्मा',
  astrologerTitle: 'वरिष्ठ वास्तुविद् तथा ज्योतिषाचार्य',
  shlokaText: 'ॐ सह नाववतु।\nसह नौ भुनक्तु।\nसह वीर्यं करवावहै।\nतेजस्विनावधीतमस्तु मा विद्विषावहै॥\nॐ शान्तिः शान्तिः शान्तिः॥',
  intro: 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा वैदिक सनातन परम्परा, ज्योतिषीय ज्ञान, वास्तुशास्त्र तथा कर्मकाण्डीय संस्कारलाई आधुनिक प्रविधिसँग जोड्दै व्यवस्थित र सेवामुखी रूपमा अघि बढाउने उद्देश्यले हालै स्थापना गरिएको संस्था हो।\n\nसंस्थाले ज्योतिष, पत्रिका तथा कुण्डली, कर्मकाण्ड तथा संस्कार, वास्तु, मुहूर्त तथा सम्बन्धित वैदिक सेवाहरूलाई आधुनिक digital platform मार्फत सरल, व्यवस्थित र पहुँचयोग्य बनाउने लक्ष्य राखेको छ।\n\nनवस्थापित संस्थाका रूपमा निरन्तर अध्ययन, प्रविधिको सदुपयोग, सेवा प्रदायकको व्यावसायिक व्यवस्थापन तथा सेवाग्राहीप्रतिको जिम्मेवारीलाई प्राथमिकता दिँदै दीर्घकालीन रूपमा विश्वसनीय वैदिक सेवा प्रणाली निर्माण गर्ने हाम्रो उद्देश्य हो।',
  visionText: 'वैदिक ज्ञान र परम्पराको मूल भावनालाई संरक्षण गर्दै आधुनिक प्रविधिको माध्यमबाट ज्योतिष, वास्तु तथा कर्मकाण्डीय सेवाहरूलाई व्यवस्थित, पारदर्शी, सुरक्षित र सेवाग्राहीमैत्री बनाउनु।',
  objectivesList: [
    'वैदिक ज्ञान र परम्पराको संरक्षण',
    'ज्योतिषीय सेवा तथा पत्रिका प्रणालीको डिजिटल व्यवस्थापन',
    'कर्मकाण्ड तथा संस्कार सेवाको व्यवस्थित booking प्रणाली',
    'प्रमाणित/आधिकारिक सेवा प्रदायकलाई डिजिटल platform मा जोड्नु',
    'यजमान र सेवा प्रदायकबीच सुरक्षित communication प्रणाली',
    'वास्तु तथा अन्य वैदिक सेवाहरूलाई आधुनिक माध्यमबाट उपलब्ध गराउनु',
    'वैदिक सामग्री तथा पुस्तकहरूको व्यवस्थित digital/online सेवा विकास गर्नु'
  ],
  newJourneyTitle: 'नवप्रारम्भ — दीर्घकालीन यात्रा',
  newJourneyText: 'यो संस्था हालै स्थापना भएको नयाँ संस्था हो। नयाँ सुरुवातसँगै दीर्घकालीन लक्ष्य बोकेर वैदिक ज्ञान, परम्परा, प्रविधि र सेवाको समन्वय गर्दै क्रमशः अझ व्यवस्थित तथा विश्वसनीय सेवा प्रणाली निर्माण गर्ने हाम्रो संकल्प हो।',
  coreValues: [
    { title: 'ज्ञान', desc: 'सनातन वैदिक शास्त्र, ज्योतिष र कर्मकाण्डको सही तथा प्रमाणिक ज्ञानप्रतिको प्रतिबद्धता।' },
    { title: 'परम्परा', desc: 'प्राचीन गुरु-परम्परा र वैदिक रीतिरिवाजको मर्यादा संरक्षण।' },
    { title: 'विश्वसनीयता', desc: 'सेवाग्राहीप्रतिको पूर्ण उत्तरदायित्व, यथार्थपरक परामर्श र गोपनीयता।' },
    { title: 'पारदर्शिता', desc: 'दक्षता, शुल्क तथा सेवा प्रक्रियामा पूर्ण स्पष्टता र पारदर्शिता।' },
    { title: 'सेवा', desc: 'व्यावसायिकताभन्दा माथि उठेर धर्म, संस्कृति र समाज कल्याणको सेवाभाव।' }
  ],
  website: 'www.balanandavaidiksewa.com',
  logoUrl: '/logo.png',
  mainPhotoUrl: getDefaultMainPhotoSvg(),
  headerNote: 'नेपालकै सबैभन्दा भरपर्दो वैदिक सेवा • सनातन धर्म र प्रामाणिक वास्तुको संगम',
  footerNote: 'सम्पर्क: +९७७-९७६४४००५३३ | इमेल: suwashdmk@gmail.com | वेबसाइट: www.balanandavaidiksewa.com',
  showLogoOnBills: true,
  showPhotoOnReports: true,
  registeredNo: 'दर्ता नं. १२३४/०८०',
  panNo: 'PAN: ६०१२३४५६७',
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
    // Strip out legacy demo profiles (sample_1, sample_2, Ram Sharma, Sita Devi)
    const cleaned = Array.isArray(parsed)
      ? parsed.filter(
          (p) =>
            p &&
            !p.id?.startsWith('sample_') &&
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

export function saveProfile(profile: BirthDetails): BirthDetails {
  const profiles = getStoredProfiles();
  const id = profile.id || `profile_${Date.now()}`;
  const customerId = profile.customerId || `ग्राह-${String(profiles.length + 1).padStart(3, '०')}`;
  const currentSession = getActiveRBACSession();
  const clientId = profile.clientId || currentSession?.userId || 'client_self';
  const updatedProfile = { 
    ...profile, 
    id, 
    customerId,
    clientId,
    createdAt: profile.createdAt || new Date().toISOString() 
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
    if (!parsed.name || parsed.name.includes('सुकदेव') || !parsed.logoUrl || parsed.logoUrl.includes('सुकदेव') || parsed.logoUrl.startsWith('data:image/svg')) {
      parsed.name = DEFAULT_ORG_PROFILE.name;
      parsed.phone = DEFAULT_ORG_PROFILE.phone;
      parsed.headerNote = DEFAULT_ORG_PROFILE.headerNote;
      parsed.intro = DEFAULT_ORG_PROFILE.intro;
      parsed.footerNote = DEFAULT_ORG_PROFILE.footerNote;
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

