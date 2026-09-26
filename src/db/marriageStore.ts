/**
 * Marriage Module Complete Store & Data Persistence Layer
 *
 * Provides TypeScript interfaces, initial seeds, and complete CRUD helper operations
 * for all 12 entities:
 * 1. users
 * 2. marriage_profiles
 * 3. partner_preferences
 * 4. marriage_ads
 * 5. marriage_requests
 * 6. connections
 * 7. messages
 * 8. notifications
 * 9. verification_requests
 * 10. reports
 * 11. blocks
 * 12. audit_logs
 */

import {
  UserRow,
  MarriageProfileRow,
  PartnerPreferencesRow,
  MarriageAdRow,
  MarriageRequestRow,
  ConnectionRow,
  MessageRow,
  NotificationRow,
  VerificationRequestRow,
  ReportRow,
  BlockRow,
  AuditLogRow
} from './marriageSchema';

// Re-export entity interfaces for convenience
export type {
  UserRow,
  MarriageProfileRow,
  PartnerPreferencesRow,
  MarriageAdRow,
  MarriageRequestRow,
  ConnectionRow,
  MessageRow,
  NotificationRow,
  VerificationRequestRow,
  ReportRow,
  BlockRow,
  AuditLogRow
};

// ==========================================
// Storage Keys
// ==========================================
export const MARRIAGE_STORAGE_KEYS = {
  USERS: 'marriage_users_v1',
  PROFILES: 'marriage_profiles_v1',
  PARTNER_PREFERENCES: 'marriage_partner_preferences_v1',
  ADS: 'marriage_ads_v1',
  REQUESTS: 'marriage_requests_v1',
  CONNECTIONS: 'marriage_connections_v1',
  MESSAGES: 'marriage_messages_v1',
  NOTIFICATIONS: 'marriage_notifications_v1',
  VERIFICATION_REQUESTS: 'marriage_verifications_v1',
  REPORTS: 'marriage_reports_v1',
  BLOCKS: 'marriage_blocks_v1',
  AUDIT_LOGS: 'marriage_audit_logs_v1',
} as const;

// ==========================================
// Seed Data
// ==========================================

export const SEED_USERS: UserRow[] = [
  {
    id: 'usr_groom_01',
    fullName: 'इ. रुपेश के.सी.',
    email: 'rupesh.kc@example.com',
    phone: '+977-9841234567',
    role: 'USER',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    isVerified: true,
    status: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'usr_bride_01',
    fullName: 'डा. प्रनिशा श्रेष्ठ',
    email: 'pranisha.shrestha@example.com',
    phone: '+977-9851098765',
    role: 'USER',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    isVerified: true,
    status: 'ACTIVE',
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
  },
  {
    id: 'usr_groom_02',
    fullName: 'इ. प्रशान्त पौडेल',
    email: 'prashant.paudel@example.com',
    phone: '+977-9801122334',
    role: 'USER',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    isVerified: true,
    status: 'ACTIVE',
    createdAt: '2025-01-03T00:00:00.000Z',
    updatedAt: '2025-01-03T00:00:00.000Z',
  },
  {
    id: 'usr_admin_01',
    fullName: 'बालानन्द विवाह व्यवस्थापक',
    email: 'admin.vivah@balananda.org',
    phone: '+977-9800000000',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    isVerified: true,
    status: 'ACTIVE',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  }
];

export const SEED_MARRIAGE_PROFILES: MarriageProfileRow[] = [
  {
    id: 'm_prof_101',
    profileCode: 'VIV-2081-01',
    userId: 'usr_groom_01',
    displayFirstName: 'रुपेश',
    gender: 'GROOM',
    dobAd: '1996-05-14',
    dobBs: '२०५३-०१-३१',
    birthTime: '06:15',
    birthPlace: 'काठमाडौँ',
    age: 28,
    currentDistrict: 'काठमाडौँ',
    currentProvince: 'बागमती प्रदेश',
    permanentAddress: 'बूढानीलकण्ठ-४, काठमाडौँ',
    maritalStatus: 'NEVER_MARRIED',
    education: 'B.E. Computer Engineering',
    fieldOfStudy: 'Engineering',
    occupation: 'Senior Software Engineer',
    employedIn: 'PRIVATE',
    monthlyIncomeRange: 'रु १,५०,००० - रु २,००,०००',
    heightFeetInches: "5'10\"",
    complexion: 'गोरो (Fair)',
    religion: 'हिन्दू (Hindu)',
    casteEthnicity: 'क्षेत्री (Khetri)',
    gotra: 'कश्यप (Kashyap)',
    fatherOccupation: 'निजामती सेवा (Ex-Govt Officer)',
    motherOccupation: 'गृहणी (Homemaker)',
    familyType: 'NUCLEAR',
    familyValues: 'MODERATE',
    familyLocation: 'काठमाडौँ',
    siblingsInfo: '१ बहिनी (विवाहित)',
    diet: 'VEG',
    drinkingSmoking: 'NO',
    hobbiesInterests: ['पठन', 'भ्रमण', 'सङ्गीत', 'योग र ध्यान'],
    aboutMe: 'शान्त, विनम्र र परिवारप्रति समर्पित कम्प्युटर इन्जिनियर। वैदिक संस्कृति र आधुनिक विचार दुवैको आदर गर्दछु।',
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    additionalPhotos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'],
    verificationLevel: 'ADMIN_VERIFIED',
    verificationStatus: 'APPROVED',
    contactPhone: '+977-9841234567',
    contactEmail: 'rupesh.kc@example.com',
    visibility: 'PUBLIC',
    hideContactDetails: true,
    allowDirectMatch: true,
    viewCount: 142,
    isActive: true,
    isFeatured: true,
    createdAt: '2025-01-10T10:00:00.000Z',
    updatedAt: '2025-01-10T10:00:00.000Z',
  },
  {
    id: 'm_prof_102',
    profileCode: 'VIV-2081-02',
    userId: 'usr_bride_01',
    displayFirstName: 'प्रनिशा',
    gender: 'BRIDE',
    dobAd: '1998-09-20',
    dobBs: '२०५५-०६-०४',
    birthTime: '08:45',
    birthPlace: 'पाटन, ललितपुर',
    age: 26,
    currentDistrict: 'ललितपुर',
    currentProvince: 'बागमती प्रदेश',
    permanentAddress: 'पाटन ढोका, ललितपुर',
    maritalStatus: 'NEVER_MARRIED',
    education: 'MBBS, MD (Pediatrics)',
    fieldOfStudy: 'Medicine / Healthcare',
    occupation: 'बालरोग विशेषज्ञ (Pediatrician)',
    employedIn: 'PRIVATE',
    monthlyIncomeRange: 'रु १,८०,००० - रु २,५०,०००',
    heightFeetInches: "5'4\"",
    complexion: 'गोरो (Fair)',
    religion: 'हिन्दू (Hindu)',
    casteEthnicity: 'नेवार (Newar)',
    gotra: 'भारद्वाज (Bharadwaj)',
    fatherOccupation: 'व्यवसायी (Businessman)',
    motherOccupation: 'प्राध्यापक (Professor)',
    familyType: 'JOINT',
    familyValues: 'MODERATE',
    familyLocation: 'ललितपुर',
    siblingsInfo: '१ भाइ (इन्जिनियरिङ अध्ययनरत)',
    diet: 'NON_VEG',
    drinkingSmoking: 'NO',
    hobbiesInterests: ['शास्त्रीय सङ्गीत', 'पुस्तक अध्ययन', 'सामाजिक सेवा', 'यात्रा'],
    aboutMe: 'स्वास्थ्य क्षेत्रमा कार्यरत सेवाभावयुक्त चिकित्सक। पारिवारिक मूल्यमान्यता र व्यावसायिक प्रगति दुवैलाई सन्तुलित रूपमा अघि बढाउन रुचाउँछु।',
    profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    additionalPhotos: [],
    verificationLevel: 'ADMIN_VERIFIED',
    verificationStatus: 'APPROVED',
    contactPhone: '+977-9851098765',
    contactEmail: 'pranisha.shrestha@example.com',
    visibility: 'PUBLIC',
    hideContactDetails: true,
    allowDirectMatch: true,
    viewCount: 198,
    isActive: true,
    isFeatured: true,
    createdAt: '2025-01-12T11:30:00.000Z',
    updatedAt: '2025-01-12T11:30:00.000Z',
  },
  {
    id: 'm_prof_103',
    profileCode: 'VIV-2081-03',
    userId: 'usr_groom_02',
    displayFirstName: 'प्रशान्त',
    gender: 'GROOM',
    dobAd: '1995-11-05',
    dobBs: '२०५२-०७-१९',
    birthTime: '14:20',
    birthPlace: 'पोखरा, कास्की',
    age: 29,
    currentDistrict: 'कास्की',
    currentProvince: 'गण्डकी प्रदेश',
    permanentAddress: 'लेकसाइड, पोखरा',
    maritalStatus: 'NEVER_MARRIED',
    education: 'M.Sc. Civil Engineering',
    fieldOfStudy: 'Engineering',
    occupation: 'हाइड्रोपावर कन्सल्टेन्ट',
    employedIn: 'PRIVATE',
    monthlyIncomeRange: 'रु १,२०,००० - रु १,८०,०००',
    heightFeetInches: "5'9\"",
    complexion: 'गहुँगोरो (Wheatish)',
    religion: 'हिन्दू (Hindu)',
    casteEthnicity: 'ब्राह्मण (Brahman)',
    gotra: 'आत्रेय (Aatreya)',
    fatherOccupation: 'शिक्षक (Ex-Headmaster)',
    motherOccupation: 'गृहणी (Homemaker)',
    familyType: 'NUCLEAR',
    familyValues: 'TRADITIONAL',
    familyLocation: 'पोखरा',
    siblingsInfo: '१ दिदी (विवाहित)',
    diet: 'VEG',
    drinkingSmoking: 'NO',
    hobbiesInterests: ['फोटोग्राफी', 'हाइकिङ', 'ज्योतिष अध्ययन', 'साहित्य'],
    aboutMe: 'पोखरा स्थायी घर भएको सिभिल इन्जिनियर। परिवार र धर्म-संस्कृतिप्रति आस्था राख्ने इमानदार युवा।',
    profilePhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    additionalPhotos: [],
    verificationLevel: 'MOBILE_VERIFIED',
    verificationStatus: 'APPROVED',
    contactPhone: '+977-9801122334',
    contactEmail: 'prashant.paudel@example.com',
    visibility: 'PUBLIC',
    hideContactDetails: true,
    allowDirectMatch: true,
    viewCount: 88,
    isActive: true,
    isFeatured: false,
    createdAt: '2025-01-15T09:15:00.000Z',
    updatedAt: '2025-01-15T09:15:00.000Z',
  }
];

export const SEED_PARTNER_PREFERENCES: PartnerPreferencesRow[] = [
  {
    id: 'pref_101',
    profileId: 'm_prof_101',
    minAge: 23,
    maxAge: 28,
    minHeightFeet: 5.1,
    maxHeightFeet: 5.7,
    maritalStatus: ['NEVER_MARRIED'],
    minEducation: 'स्नातक (Bachelor)',
    preferredProfessions: ['इन्जिनियर', 'डाक्टर', 'शिक्षक', 'बैङ्किङ', 'सरकारी सेवा'],
    preferredDistricts: ['काठमाडौँ', 'ललितपुर', 'भक्तपुर', 'कास्की'],
    preferredProvinces: ['बागमती प्रदेश', 'गण्डकी प्रदेश'],
    religion: 'हिन्दू',
    dietPreference: 'शाकाहारी वा लचिलो',
    gotraAvoidance: ['कश्यप'],
    createdAt: '2025-01-10T10:00:00.000Z',
    updatedAt: '2025-01-10T10:00:00.000Z',
  },
  {
    id: 'pref_102',
    profileId: 'm_prof_102',
    minAge: 26,
    maxAge: 32,
    minHeightFeet: 5.6,
    maxHeightFeet: 6.2,
    maritalStatus: ['NEVER_MARRIED'],
    minEducation: 'स्नातकोत्तर (Master) वा MBBS/BE',
    preferredProfessions: ['डाक्टर', 'इन्जिनियर', 'प्रशासक', 'सफल व्यवसायी'],
    preferredDistricts: ['ललितपुर', 'काठमाडौँ', 'भक्तपुर', 'चितवन'],
    preferredProvinces: ['बागमती प्रदेश'],
    religion: 'हिन्दू',
    dietPreference: 'सबै',
    gotraAvoidance: ['भारद्वाज'],
    createdAt: '2025-01-12T11:30:00.000Z',
    updatedAt: '2025-01-12T11:30:00.000Z',
  }
];

export const SEED_MARRIAGE_ADS: MarriageAdRow[] = [
  {
    id: 'ad_101',
    adCode: 'AD-2081-01',
    profileId: 'm_prof_101',
    userId: 'usr_groom_01',
    candidateName: 'क्षेत्री कुलीन परिवारका २८ वर्षे कम्प्युटर इन्जिनियर',
    gender: 'GROOM',
    age: 28,
    education: 'B.E. Computer Engineering',
    profession: 'Senior Software Engineer (रु १.५ लाख+ मासिक कमाई)',
    location: 'बूढानीलकण्ठ, काठमाडौँ',
    familySummary: 'पिता पूर्व-निजामती अधिकृत, माता गृहणी, १ विवाहित बहिनी।',
    partnerExpectations: '२३-२७ वर्ष उमेरकी स्नातक/स्नातकोत्तर उत्तीर्ण, सुसंस्कृत क्षेत्री/ठकुरी कन्याको खोजी।',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    contactPhoneHidden: true,
    status: 'APPROVED',
    isFeatured: true,
    createdAt: '2025-01-11T10:00:00.000Z',
    updatedAt: '2025-01-11T10:00:00.000Z',
  },
  {
    id: 'ad_102',
    adCode: 'AD-2081-02',
    profileId: 'm_prof_102',
    userId: 'usr_bride_01',
    candidateName: '२६ वर्षीया बालरोग विशेषज्ञ (MD Pediatrics)',
    gender: 'BRIDE',
    age: 26,
    education: 'MBBS, MD Pediatrics',
    profession: 'बालरोग विशेषज्ञ डाक्टर',
    location: 'पाटन, ललितपुर',
    familySummary: 'पिता प्रतिष्ठित व्यवसायी, माता क्याम्पस प्राध्यापक।',
    partnerExpectations: '२६-३२ वर्ष उमेरका डाक्टर, इन्जिनियर वा उच्च पदस्थ अधिकृत सुयोग्य वरको खोजी।',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    contactPhoneHidden: true,
    status: 'APPROVED',
    isFeatured: true,
    createdAt: '2025-01-13T12:00:00.000Z',
    updatedAt: '2025-01-13T12:00:00.000Z',
  }
];

export const SEED_MARRIAGE_REQUESTS: MarriageRequestRow[] = [
  {
    id: 'req_101',
    senderProfileId: 'm_prof_101',
    senderUserId: 'usr_groom_01',
    receiverProfileId: 'm_prof_102',
    receiverUserId: 'usr_bride_01',
    status: 'ACCEPTED',
    initialMessage: 'नमस्ते डा. प्रनिशा ज्यू, हजुरको प्रोफाइल र पृष्ठभूमि धेरै राम्रो लाग्यो। आगे विचार आदान-प्रदान गर्न चाहन्छौँ।',
    adminApprovalNotes: 'Approved by admin for contact exchange',
    createdAt: '2025-01-15T14:00:00.000Z',
    updatedAt: '2025-01-16T10:00:00.000Z',
  }
];

export const SEED_CONNECTIONS: ConnectionRow[] = [
  {
    id: 'conn_101',
    requestId: 'req_101',
    profile1Id: 'm_prof_101',
    profile2Id: 'm_prof_102',
    status: 'ACTIVE',
    contactReleased: true,
    createdAt: '2025-01-16T10:00:00.000Z',
    updatedAt: '2025-01-16T10:00:00.000Z',
  }
];

export const SEED_MESSAGES: MessageRow[] = [
  {
    id: 'msg_101',
    connectionId: 'conn_101',
    senderUserId: 'usr_groom_01',
    receiverUserId: 'usr_bride_01',
    content: 'नमस्ते डा. प्रनिशा ज्यू! बालानन्द विवाह पोर्टल मार्फत सम्पर्क जोडिएकोमा खुसी लाग्यो।',
    isRead: true,
    createdAt: '2025-01-16T10:05:00.000Z',
  },
  {
    id: 'msg_102',
    connectionId: 'conn_101',
    senderUserId: 'usr_bride_01',
    receiverUserId: 'usr_groom_01',
    content: 'नमस्ते रुपेश ज्यू! धन्यवाद। हजुरको प्रोफाइल विवरण हेरेँ, धेरै सन्तुलित लाग्यो।',
    isRead: true,
    createdAt: '2025-01-16T10:20:00.000Z',
  }
];

export const SEED_NOTIFICATIONS: NotificationRow[] = [
  {
    id: 'notif_101',
    userId: 'usr_bride_01',
    title: 'नयाँ विवाह प्रस्ताव प्राप्त भयो',
    message: 'इ. रुपेश के.सी. ले हजुरको प्रोफाइलमा रुचि व्यक्त गर्दै विवाह प्रस्ताव पठाउनुभएको छ।',
    type: 'REQUEST_RECEIVED',
    referenceId: 'req_101',
    isRead: true,
    createdAt: '2025-01-15T14:00:00.000Z',
  }
];

export const SEED_VERIFICATION_REQUESTS: VerificationRequestRow[] = [
  {
    id: 'ver_101',
    profileId: 'm_prof_101',
    userId: 'usr_groom_01',
    documentType: 'CITIZENSHIP',
    documentNumber: '27-01-73-12345',
    documentFrontUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400',
    status: 'APPROVED',
    adminNotes: 'नागरिकता प्रमाणपत्र प्रमाणित गरिएको छ।',
    reviewedBy: 'usr_admin_01',
    reviewedAt: '2025-01-10T10:30:00.000Z',
    createdAt: '2025-01-10T10:05:00.000Z',
    updatedAt: '2025-01-10T10:30:00.000Z',
  }
];

export const SEED_REPORTS: ReportRow[] = [];
export const SEED_BLOCKS: BlockRow[] = [];
export const SEED_AUDIT_LOGS: AuditLogRow[] = [
  {
    id: 'log_101',
    actorId: 'usr_admin_01',
    actorName: 'बालानन्द व्यवस्थापक',
    action: 'VERIFY_PROFILE',
    targetType: 'PROFILE',
    targetId: 'm_prof_101',
    details: 'Profile verified and marked as ADMIN_VERIFIED',
    createdAt: '2025-01-10T10:30:00.000Z',
  }
];

// ==========================================
// In-Memory Caching State
// ==========================================
let cacheUsers: UserRow[] | null = null;
let cacheProfiles: MarriageProfileRow[] | null = null;
let cachePreferences: PartnerPreferencesRow[] | null = null;
let cacheAds: MarriageAdRow[] | null = null;
let cacheRequests: MarriageRequestRow[] | null = null;
let cacheConnections: ConnectionRow[] | null = null;
let cacheMessages: MessageRow[] | null = null;
let cacheNotifications: NotificationRow[] | null = null;
let cacheVerifications: VerificationRequestRow[] | null = null;
let cacheReports: ReportRow[] | null = null;
let cacheBlocks: BlockRow[] | null = null;
let cacheAuditLogs: AuditLogRow[] | null = null;

// ==========================================
// Generic LocalStorage Loader / Saver
// ==========================================
function loadFromStorage<T>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
    return seed;
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

// ==========================================
// 1. Users CRUD Operations
// ==========================================
export function getStoredUsers(): UserRow[] {
  if (!cacheUsers) {
    cacheUsers = loadFromStorage(MARRIAGE_STORAGE_KEYS.USERS, SEED_USERS);
  }
  return cacheUsers;
}

export function getUserById(id: string): UserRow | undefined {
  return getStoredUsers().find(u => u.id === id);
}

export function saveUser(user: UserRow): UserRow {
  const users = getStoredUsers();
  const idx = users.findIndex(u => u.id === user.id);
  const updated = { ...user, updatedAt: new Date().toISOString() };

  if (idx >= 0) {
    users[idx] = updated;
  } else {
    users.unshift(updated);
  }

  cacheUsers = [...users];
  saveToStorage(MARRIAGE_STORAGE_KEYS.USERS, cacheUsers);
  return updated;
}

export function deleteUser(id: string): void {
  const users = getStoredUsers().filter(u => u.id !== id);
  cacheUsers = users;
  saveToStorage(MARRIAGE_STORAGE_KEYS.USERS, cacheUsers);
}

// ==========================================
// 2. Marriage Profiles CRUD Operations
// ==========================================
export function getStoredMarriageProfiles(): MarriageProfileRow[] {
  if (!cacheProfiles) {
    cacheProfiles = loadFromStorage(MARRIAGE_STORAGE_KEYS.PROFILES, SEED_MARRIAGE_PROFILES);
  }
  return cacheProfiles;
}

export function getMarriageProfileById(id: string): MarriageProfileRow | undefined {
  return getStoredMarriageProfiles().find(p => p.id === id);
}

export function getMarriageProfileByUserId(userId: string): MarriageProfileRow | undefined {
  return getStoredMarriageProfiles().find(p => p.userId === userId);
}

export function saveMarriageProfile(profile: MarriageProfileRow): MarriageProfileRow {
  const profiles = getStoredMarriageProfiles();
  const idx = profiles.findIndex(p => p.id === profile.id);
  const updated = { ...profile, updatedAt: new Date().toISOString() };

  if (idx >= 0) {
    profiles[idx] = updated;
  } else {
    profiles.unshift(updated);
  }

  cacheProfiles = [...profiles];
  saveToStorage(MARRIAGE_STORAGE_KEYS.PROFILES, cacheProfiles);
  return updated;
}

export function deleteMarriageProfile(id: string): void {
  const profiles = getStoredMarriageProfiles().filter(p => p.id !== id);
  cacheProfiles = profiles;
  saveToStorage(MARRIAGE_STORAGE_KEYS.PROFILES, cacheProfiles);
}

export function incrementProfileViewCount(id: string): void {
  const profile = getMarriageProfileById(id);
  if (profile) {
    profile.viewCount = (profile.viewCount || 0) + 1;
    saveMarriageProfile(profile);
  }
}

// ==========================================
// 3. Partner Preferences CRUD Operations
// ==========================================
export function getStoredPartnerPreferences(): PartnerPreferencesRow[] {
  if (!cachePreferences) {
    cachePreferences = loadFromStorage(MARRIAGE_STORAGE_KEYS.PARTNER_PREFERENCES, SEED_PARTNER_PREFERENCES);
  }
  return cachePreferences;
}

export function getPartnerPreferencesByProfileId(profileId: string): PartnerPreferencesRow | undefined {
  return getStoredPartnerPreferences().find(p => p.profileId === profileId);
}

export function savePartnerPreferences(pref: PartnerPreferencesRow): PartnerPreferencesRow {
  const prefs = getStoredPartnerPreferences();
  const idx = prefs.findIndex(p => p.id === pref.id || p.profileId === pref.profileId);
  const updated = { ...pref, updatedAt: new Date().toISOString() };

  if (idx >= 0) {
    prefs[idx] = updated;
  } else {
    prefs.unshift(updated);
  }

  cachePreferences = [...prefs];
  saveToStorage(MARRIAGE_STORAGE_KEYS.PARTNER_PREFERENCES, cachePreferences);
  return updated;
}

// ==========================================
// 4. Marriage Ads CRUD Operations
// ==========================================
export function getStoredMarriageAds(): MarriageAdRow[] {
  if (!cacheAds) {
    cacheAds = loadFromStorage(MARRIAGE_STORAGE_KEYS.ADS, SEED_MARRIAGE_ADS);
  }
  return cacheAds;
}

export function getMarriageAdById(id: string): MarriageAdRow | undefined {
  return getStoredMarriageAds().find(a => a.id === id);
}

export function saveMarriageAd(ad: MarriageAdRow): MarriageAdRow {
  const ads = getStoredMarriageAds();
  const idx = ads.findIndex(a => a.id === ad.id);
  const updated = { ...ad, updatedAt: new Date().toISOString() };

  if (idx >= 0) {
    ads[idx] = updated;
  } else {
    ads.unshift(updated);
  }

  cacheAds = [...ads];
  saveToStorage(MARRIAGE_STORAGE_KEYS.ADS, cacheAds);
  return updated;
}

export function deleteMarriageAd(id: string): void {
  const ads = getStoredMarriageAds().filter(a => a.id !== id);
  cacheAds = ads;
  saveToStorage(MARRIAGE_STORAGE_KEYS.ADS, cacheAds);
}

// ==========================================
// 5. Marriage Requests CRUD Operations
// ==========================================
export function getStoredMarriageRequests(): MarriageRequestRow[] {
  if (!cacheRequests) {
    cacheRequests = loadFromStorage(MARRIAGE_STORAGE_KEYS.REQUESTS, SEED_MARRIAGE_REQUESTS);
  }
  return cacheRequests;
}

export function getMarriageRequestById(id: string): MarriageRequestRow | undefined {
  return getStoredMarriageRequests().find(r => r.id === id);
}

export function getMarriageRequestsForUser(userId: string): MarriageRequestRow[] {
  return getStoredMarriageRequests().filter(r => r.senderUserId === userId || r.receiverUserId === userId);
}

export function saveMarriageRequest(req: MarriageRequestRow): MarriageRequestRow {
  const reqs = getStoredMarriageRequests();
  const idx = reqs.findIndex(r => r.id === req.id);
  const updated = { ...req, updatedAt: new Date().toISOString() };

  if (idx >= 0) {
    reqs[idx] = updated;
  } else {
    reqs.unshift(updated);
  }

  cacheRequests = [...reqs];
  saveToStorage(MARRIAGE_STORAGE_KEYS.REQUESTS, cacheRequests);
  return updated;
}

export function deleteMarriageRequest(id: string): void {
  const reqs = getStoredMarriageRequests().filter(r => r.id !== id);
  cacheRequests = reqs;
  saveToStorage(MARRIAGE_STORAGE_KEYS.REQUESTS, cacheRequests);
}

// ==========================================
// 6. Connections CRUD Operations
// ==========================================
export function getStoredConnections(): ConnectionRow[] {
  if (!cacheConnections) {
    cacheConnections = loadFromStorage(MARRIAGE_STORAGE_KEYS.CONNECTIONS, SEED_CONNECTIONS);
  }
  return cacheConnections;
}

export function getConnectionById(id: string): ConnectionRow | undefined {
  return getStoredConnections().find(c => c.id === id);
}

export function saveConnection(conn: ConnectionRow): ConnectionRow {
  const conns = getStoredConnections();
  const idx = conns.findIndex(c => c.id === conn.id);
  const updated = { ...conn, updatedAt: new Date().toISOString() };

  if (idx >= 0) {
    conns[idx] = updated;
  } else {
    conns.unshift(updated);
  }

  cacheConnections = [...conns];
  saveToStorage(MARRIAGE_STORAGE_KEYS.CONNECTIONS, cacheConnections);
  return updated;
}

export function deleteConnection(id: string): void {
  const conns = getStoredConnections().filter(c => c.id !== id);
  cacheConnections = conns;
  saveToStorage(MARRIAGE_STORAGE_KEYS.CONNECTIONS, cacheConnections);
}

// ==========================================
// 7. Messages CRUD Operations
// ==========================================
export function getStoredMessages(): MessageRow[] {
  if (!cacheMessages) {
    cacheMessages = loadFromStorage(MARRIAGE_STORAGE_KEYS.MESSAGES, SEED_MESSAGES);
  }
  return cacheMessages;
}

export function getMessagesByConnectionId(connectionId: string): MessageRow[] {
  return getStoredMessages().filter(m => m.connectionId === connectionId);
}

export function saveMessage(msg: MessageRow): MessageRow {
  const msgs = getStoredMessages();
  const idx = msgs.findIndex(m => m.id === msg.id);

  if (idx >= 0) {
    msgs[idx] = msg;
  } else {
    msgs.push(msg);
  }

  cacheMessages = [...msgs];
  saveToStorage(MARRIAGE_STORAGE_KEYS.MESSAGES, cacheMessages);
  return msg;
}

// ==========================================
// 8. Notifications CRUD Operations
// ==========================================
export function getStoredNotifications(): NotificationRow[] {
  if (!cacheNotifications) {
    cacheNotifications = loadFromStorage(MARRIAGE_STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
  }
  return cacheNotifications;
}

export function getNotificationsByUserId(userId: string): NotificationRow[] {
  return getStoredNotifications().filter(n => n.userId === userId);
}

export function saveNotification(notif: NotificationRow): NotificationRow {
  const notifs = getStoredNotifications();
  const idx = notifs.findIndex(n => n.id === notif.id);

  if (idx >= 0) {
    notifs[idx] = notif;
  } else {
    notifs.unshift(notif);
  }

  cacheNotifications = [...notifs];
  saveToStorage(MARRIAGE_STORAGE_KEYS.NOTIFICATIONS, cacheNotifications);
  return notif;
}

export function markNotificationRead(id: string): void {
  const notifs = getStoredNotifications();
  const notif = notifs.find(n => n.id === id);
  if (notif) {
    notif.isRead = true;
    cacheNotifications = [...notifs];
    saveToStorage(MARRIAGE_STORAGE_KEYS.NOTIFICATIONS, cacheNotifications);
  }
}

// ==========================================
// 9. Verification Requests CRUD Operations
// ==========================================
export function getStoredVerificationRequests(): VerificationRequestRow[] {
  if (!cacheVerifications) {
    cacheVerifications = loadFromStorage(MARRIAGE_STORAGE_KEYS.VERIFICATION_REQUESTS, SEED_VERIFICATION_REQUESTS);
  }
  return cacheVerifications;
}

export function getVerificationRequestById(id: string): VerificationRequestRow | undefined {
  return getStoredVerificationRequests().find(v => v.id === id);
}

export function saveVerificationRequest(req: VerificationRequestRow): VerificationRequestRow {
  const reqs = getStoredVerificationRequests();
  const idx = reqs.findIndex(v => v.id === req.id);
  const updated = { ...req, updatedAt: new Date().toISOString() };

  if (idx >= 0) {
    reqs[idx] = updated;
  } else {
    reqs.unshift(updated);
  }

  cacheVerifications = [...reqs];
  saveToStorage(MARRIAGE_STORAGE_KEYS.VERIFICATION_REQUESTS, cacheVerifications);
  return updated;
}

// ==========================================
// 10. Reports CRUD Operations
// ==========================================
export function getStoredReports(): ReportRow[] {
  if (!cacheReports) {
    cacheReports = loadFromStorage(MARRIAGE_STORAGE_KEYS.REPORTS, SEED_REPORTS);
  }
  return cacheReports;
}

export function getReportById(id: string): ReportRow | undefined {
  return getStoredReports().find(r => r.id === id);
}

export function saveReport(report: ReportRow): ReportRow {
  const reports = getStoredReports();
  const idx = reports.findIndex(r => r.id === report.id);
  const updated = { ...report, updatedAt: new Date().toISOString() };

  if (idx >= 0) {
    reports[idx] = updated;
  } else {
    reports.unshift(updated);
  }

  cacheReports = [...reports];
  saveToStorage(MARRIAGE_STORAGE_KEYS.REPORTS, cacheReports);
  return updated;
}

// ==========================================
// 11. Blocks CRUD Operations
// ==========================================
export function getStoredBlocks(): BlockRow[] {
  if (!cacheBlocks) {
    cacheBlocks = loadFromStorage(MARRIAGE_STORAGE_KEYS.BLOCKS, SEED_BLOCKS);
  }
  return cacheBlocks;
}

export function isProfileBlocked(userId: string, targetProfileId: string): boolean {
  return getStoredBlocks().some(b => b.userId === userId && b.blockedProfileId === targetProfileId);
}

export function saveBlock(block: BlockRow): BlockRow {
  const blocks = getStoredBlocks();
  if (!blocks.some(b => b.userId === block.userId && b.blockedProfileId === block.blockedProfileId)) {
    blocks.push(block);
    cacheBlocks = [...blocks];
    saveToStorage(MARRIAGE_STORAGE_KEYS.BLOCKS, cacheBlocks);
  }
  return block;
}

export function removeBlock(userId: string, targetProfileId: string): void {
  const blocks = getStoredBlocks().filter(b => !(b.userId === userId && b.blockedProfileId === targetProfileId));
  cacheBlocks = blocks;
  saveToStorage(MARRIAGE_STORAGE_KEYS.BLOCKS, cacheBlocks);
}

// ==========================================
// 12. Audit Logs Operations
// ==========================================
export function getStoredAuditLogs(): AuditLogRow[] {
  if (!cacheAuditLogs) {
    cacheAuditLogs = loadFromStorage(MARRIAGE_STORAGE_KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS);
  }
  return cacheAuditLogs;
}

export function logMarriageAction(
  actorId: string,
  actorName: string,
  action: string,
  targetType: AuditLogRow['targetType'],
  targetId: string,
  details?: string
): AuditLogRow {
  const logs = getStoredAuditLogs();
  const newLog: AuditLogRow = {
    id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    actorId,
    actorName,
    action,
    targetType,
    targetId,
    details,
    createdAt: new Date().toISOString(),
  };

  logs.unshift(newLog);
  cacheAuditLogs = logs.slice(0, 500); // keep max 500 logs
  saveToStorage(MARRIAGE_STORAGE_KEYS.AUDIT_LOGS, cacheAuditLogs);
  return newLog;
}

// ==========================================
// Smart Match Calculation Helper
// ==========================================
export interface MarriageMatchScoreResult {
  candidateProfile: MarriageProfileRow;
  score: number;
  breakdown: {
    ageMatch: boolean;
    heightMatch: boolean;
    maritalStatusMatch: boolean;
    educationMatch: boolean;
    professionMatch: boolean;
    locationMatch: boolean;
    dietMatch: boolean;
    details: string[];
  };
}

export function calculateMarriageMatchScore(
  myProfile: MarriageProfileRow,
  myPref: PartnerPreferencesRow | undefined,
  candidateProfile: MarriageProfileRow
): MarriageMatchScoreResult {
  let points = 0;
  let totalMax = 100;
  const details: string[] = [];

  const breakdown = {
    ageMatch: false,
    heightMatch: false,
    maritalStatusMatch: false,
    educationMatch: false,
    professionMatch: false,
    locationMatch: false,
    dietMatch: false,
    details,
  };

  if (!myPref) {
    return { candidateProfile, score: 70, breakdown };
  }

  // 1. Age (20 pts)
  if (candidateProfile.age >= myPref.minAge && candidateProfile.age <= myPref.maxAge) {
    points += 20;
    breakdown.ageMatch = true;
    details.push(`उमेर (${candidateProfile.age} वर्ष) प्राथमिकता भित्र परेको छ।`);
  } else {
    details.push(`उमेर श्रेणी थोरै फरक।`);
  }

  // 2. Marital Status (20 pts)
  if (myPref.maritalStatus?.includes(candidateProfile.maritalStatus)) {
    points += 20;
    breakdown.maritalStatusMatch = true;
    details.push('वैवाहिक स्थिति प्राथमिकता अनुसार।');
  } else if (!myPref.maritalStatus || myPref.maritalStatus.length === 0) {
    points += 15;
  }

  // 3. Location (20 pts)
  if (
    myPref.preferredDistricts?.includes(candidateProfile.currentDistrict) ||
    myPref.preferredProvinces?.includes(candidateProfile.currentProvince)
  ) {
    points += 20;
    breakdown.locationMatch = true;
    details.push(`स्थान (${candidateProfile.currentDistrict}) रोजाइमा पर्दछ।`);
  } else {
    points += 8;
  }

  // 4. Education & Profession (25 pts)
  if (myPref.preferredProfessions?.some(p => candidateProfile.occupation.toLowerCase().includes(p.toLowerCase()))) {
    points += 15;
    breakdown.professionMatch = true;
    details.push(`पेशा (${candidateProfile.occupation}) प्राथमिकतामा मिल्दछ।`);
  } else {
    points += 8;
  }

  if (candidateProfile.education) {
    points += 10;
    breakdown.educationMatch = true;
  }

  // 5. Diet (15 pts)
  if (myPref.dietPreference && myPref.dietPreference.toLowerCase().includes(candidateProfile.diet.toLowerCase())) {
    points += 15;
    breakdown.dietMatch = true;
    details.push('खानपान प्राथमिकतापूर्वक मिलेको।');
  } else {
    points += 10;
  }

  // 6. Gotra Avoidance check
  if (myPref.gotraAvoidance && candidateProfile.gotra && myPref.gotraAvoidance.includes(candidateProfile.gotra)) {
    points = Math.max(0, points - 20);
    details.push(`विशेष: गोत्र (${candidateProfile.gotra}) वर्जित सूचीमा परेको छ।`);
  }

  const score = Math.min(100, Math.round((points / totalMax) * 100));

  return {
    candidateProfile,
    score,
    breakdown
  };
}
