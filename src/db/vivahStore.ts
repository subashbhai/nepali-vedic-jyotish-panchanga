import { 
  VivahProfile, 
  VivahAdvertisement, 
  VivahRequest, 
  VivahFavorite, 
  VivahReport, 
  VivahBlock, 
  VivahAuditLog,
  VivahMatchResult
} from '../types/vivahTypes';

const STORAGE_KEYS = {
  PROFILES: 'balananda_vivah_profiles_v1',
  ADS: 'balananda_vivah_ads_v1',
  REQUESTS: 'balananda_vivah_requests_v1',
  FAVORITES: 'balananda_vivah_favorites_v1',
  REPORTS: 'balananda_vivah_reports_v1',
  BLOCKS: 'balananda_vivah_blocks_v1',
  AUDIT_LOGS: 'balananda_vivah_audit_logs_v1',
};

// Seed Profiles for Nepal Matrimonial Portal
export const SEED_VIVAH_PROFILES: VivahProfile[] = [
  {
    id: 'vivah_p_101',
    profileCode: 'VIV-2081-01',
    userId: 'user_groom_01',
    userFullName: 'इ. रुपेश के.सी.',
    displayFirstName: 'रुपेश',
    gender: 'GROOM',
    dobAD: '1996-05-14',
    dobBS: '२०५३-०१-३१',
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
    partnerPreferences: {
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
    },
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    additionalPhotos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'
    ],
    verificationLevel: 'ADMIN_VERIFIED',
    verificationStatus: 'APPROVED',
    contactPhone: '+977-9841234567',
    contactEmail: 'rupesh.kc@example.com',
    privacySettings: {
      visibility: 'PUBLIC',
      hideContactDetails: true,
      allowDirectMatch: true,
    },
    createdAt: '2025-01-10T10:00:00.000Z',
    updatedAt: '2025-01-10T10:00:00.000Z',
    viewCount: 142,
    isActive: true,
    isFeatured: true,
  },
  {
    id: 'vivah_p_102',
    profileCode: 'VIV-2081-02',
    userId: 'user_bride_01',
    userFullName: 'डा. प्रनिशा श्रेष्ठ',
    displayFirstName: 'प्रनिशा',
    gender: 'BRIDE',
    dobAD: '1998-09-20',
    dobBS: '२०५५-०६-०४',
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
    partnerPreferences: {
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
    },
    profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    additionalPhotos: [],
    verificationLevel: 'ADMIN_VERIFIED',
    verificationStatus: 'APPROVED',
    contactPhone: '+977-9851098765',
    contactEmail: 'pranisha.shrestha@example.com',
    privacySettings: {
      visibility: 'PUBLIC',
      hideContactDetails: true,
      allowDirectMatch: true,
    },
    createdAt: '2025-01-12T11:30:00.000Z',
    updatedAt: '2025-01-12T11:30:00.000Z',
    viewCount: 198,
    isActive: true,
    isFeatured: true,
  },
  {
    id: 'vivah_p_103',
    profileCode: 'VIV-2081-03',
    userId: 'user_groom_02',
    userFullName: 'इ. प्रशान्त पौडेल',
    displayFirstName: 'प्रशान्त',
    gender: 'GROOM',
    dobAD: '1995-11-05',
    dobBS: '२०५२-०७-१९',
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
    partnerPreferences: {
      minAge: 22,
      maxAge: 27,
      minHeightFeet: 5.0,
      maxHeightFeet: 5.6,
      maritalStatus: ['NEVER_MARRIED'],
      minEducation: 'स्नातक (Bachelor)',
      preferredProfessions: ['शिक्षक', 'बैङ्कर', 'स्वास्थ्यकर्मी', 'सरकारी सेवा'],
      preferredDistricts: ['कास्की', 'काठमाडौँ', 'तनहुँ', 'स्याङ्जा'],
      preferredProvinces: ['गण्डकी प्रदेश', 'बागमती प्रदेश'],
      gotraAvoidance: ['आत्रेय'],
    },
    profilePhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    additionalPhotos: [],
    verificationLevel: 'MOBILE_VERIFIED',
    verificationStatus: 'APPROVED',
    contactPhone: '+977-9801122334',
    contactEmail: 'prashant.paudel@example.com',
    privacySettings: {
      visibility: 'PUBLIC',
      hideContactDetails: true,
      allowDirectMatch: true,
    },
    createdAt: '2025-01-15T09:15:00.000Z',
    updatedAt: '2025-01-15T09:15:00.000Z',
    viewCount: 88,
    isActive: true,
  },
  {
    id: 'vivah_p_104',
    profileCode: 'VIV-2081-04',
    userId: 'user_bride_02',
    userFullName: 'अनुश्री रिजाल',
    displayFirstName: 'अनुश्री',
    gender: 'BRIDE',
    dobAD: '2000-03-12',
    dobBS: '२०५६-११-२९',
    birthTime: '11:10',
    birthPlace: 'चितवन',
    age: 24,
    currentDistrict: 'चितवन',
    currentProvince: 'बागमती प्रदेश',
    permanentAddress: 'भरतपुर-१०, चितवन',
    maritalStatus: 'NEVER_MARRIED',
    education: 'MBA (Finance & Banking)',
    fieldOfStudy: 'Management',
    occupation: 'सहायक प्रबन्धक (Assistant Manager - Commercial Bank)',
    employedIn: 'PRIVATE',
    monthlyIncomeRange: 'रु ८०,००० - रु १,१०,०००',
    heightFeetInches: "5'3\"",
    complexion: 'गोरो (Fair)',
    religion: 'हिन्दू (Hindu)',
    casteEthnicity: 'ब्राह्मण (Brahman)',
    gotra: 'कौण्डिन्य (Kaundinya)',
    fatherOccupation: 'व्यवसायी (Agri Business)',
    motherOccupation: 'शिक्षिका (Teacher)',
    familyType: 'JOINT',
    familyValues: 'MODERATE',
    familyLocation: 'भरतपुर, चितवन',
    siblingsInfo: '१ दाइ (अस्ट्रेलियामा कार्यरत)',
    diet: 'VEG',
    drinkingSmoking: 'NO',
    hobbiesInterests: ['चित्रकला', 'कुकिङ', 'शास्त्रीय नृत्य', 'सङ्गीत'],
    aboutMe: 'चितवन घर भई वाणिज्य बैङ्कमा कार्यरत। पारिवारिक वातावरणमा हुर्किएकी, सकारात्मक सोच भएकी।',
    partnerPreferences: {
      minAge: 25,
      maxAge: 30,
      minHeightFeet: 5.6,
      maxHeightFeet: 6.0,
      maritalStatus: ['NEVER_MARRIED'],
      minEducation: 'स्नातक वा स्नातकोत्तर',
      preferredProfessions: ['बैङ्कर', 'इन्जिनियर', 'अधिकारी', 'व्यवसायी'],
      preferredDistricts: ['चितवन', 'काठमाडौँ', 'ललितपुर', 'रूपन्देही'],
      preferredProvinces: ['बागमती प्रदेश', 'लुम्बिनी प्रदेश'],
      gotraAvoidance: ['कौण्डिन्य'],
    },
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    additionalPhotos: [],
    verificationLevel: 'ADMIN_VERIFIED',
    verificationStatus: 'APPROVED',
    contactPhone: '+977-9812345678',
    contactEmail: 'anushree.rijal@example.com',
    privacySettings: {
      visibility: 'PUBLIC',
      hideContactDetails: true,
      allowDirectMatch: true,
    },
    createdAt: '2025-01-18T14:20:00.000Z',
    updatedAt: '2025-01-18T14:20:00.000Z',
    viewCount: 165,
    isActive: true,
    isFeatured: true,
  },
  {
    id: 'vivah_p_105',
    profileCode: 'VIV-2081-05',
    userId: 'user_groom_03',
    userFullName: 'सुमन थापा',
    displayFirstName: 'सुमन',
    gender: 'GROOM',
    dobAD: '1993-02-28',
    dobBS: '२०४९-११-१७',
    birthTime: '18:30',
    birthPlace: 'बुटवल, रूपन्देही',
    age: 31,
    currentDistrict: 'रूपन्देही',
    currentProvince: 'लुम्बिनी प्रदेश',
    permanentAddress: 'बुटवल-११, रूपन्देही',
    maritalStatus: 'NEVER_MARRIED',
    education: 'M.A. International Relations',
    fieldOfStudy: 'Humanities / Public Service',
    occupation: 'शाखा अधिकृत (Section Officer - Govt of Nepal)',
    employedIn: 'GOVT',
    monthlyIncomeRange: 'रु ७५,००० - रु १,००,०००',
    heightFeetInches: "5'8\"",
    complexion: 'गहुँगोरो (Wheatish)',
    religion: 'हिन्दू (Hindu)',
    casteEthnicity: 'मगर/थापा (Magar/Thapa)',
    gotra: 'आत्रेय (Aatreya)',
    fatherOccupation: 'भूपू सैनिक (Ex-Army Officer)',
    motherOccupation: 'गृहणी (Homemaker)',
    familyType: 'NUCLEAR',
    familyValues: 'MODERATE',
    familyLocation: 'बुटवल',
    siblingsInfo: '२ बहिनी (विवाहित)',
    diet: 'NON_VEG',
    drinkingSmoking: 'NO',
    hobbiesInterests: ['फुटबल', 'समाचार विश्लेषक', 'पुस्तक लेखन'],
    aboutMe: 'निजामती सेवामा कार्यरत अधिकृत। राष्ट्रसेवा, इमानदारिता र परिवारप्रति उच्च समर्पण।',
    partnerPreferences: {
      minAge: 24,
      maxAge: 29,
      minHeightFeet: 5.1,
      maxHeightFeet: 5.6,
      maritalStatus: ['NEVER_MARRIED'],
      minEducation: 'स्नातक (Bachelor)',
      preferredProfessions: ['सरकारी सेवा', 'शिक्षिका', 'बैङ्कर', 'स्वास्थ्यकर्मी'],
      preferredDistricts: ['रूपन्देही', 'काठमाडौँ', 'पाल्पा', 'दाङ'],
      preferredProvinces: ['लुम्बिनी प्रदेश', 'बागमती प्रदेश'],
    },
    profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
    additionalPhotos: [],
    verificationLevel: 'ADMIN_VERIFIED',
    verificationStatus: 'APPROVED',
    contactPhone: '+977-9860112233',
    contactEmail: 'suman.thapa@example.com',
    privacySettings: {
      visibility: 'PUBLIC',
      hideContactDetails: true,
      allowDirectMatch: true,
    },
    createdAt: '2025-01-20T08:00:00.000Z',
    updatedAt: '2025-01-20T08:00:00.000Z',
    viewCount: 110,
    isActive: true,
  }
];

export const SEED_VIVAH_ADS: VivahAdvertisement[] = [
  {
    id: 'ad_101',
    adCode: 'AD-2081-01',
    profileId: 'vivah_p_101',
    userId: 'user_groom_01',
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
    createdAt: '2025-01-11T10:00:00.000Z',
    updatedAt: '2025-01-11T10:00:00.000Z',
    isFeatured: true,
  },
  {
    id: 'ad_102',
    adCode: 'AD-2081-02',
    profileId: 'vivah_p_102',
    userId: 'user_bride_01',
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
    createdAt: '2025-01-13T12:00:00.000Z',
    updatedAt: '2025-01-13T12:00:00.000Z',
    isFeatured: true,
  }
];

export const SEED_VIVAH_REQUESTS: VivahRequest[] = [
  {
    id: 'req_101',
    senderProfileId: 'vivah_p_101',
    senderUserId: 'user_groom_01',
    senderName: 'इ. रुपेश के.सी.',
    senderGender: 'GROOM',
    senderPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    senderPhone: '+977-9841234567',
    receiverProfileId: 'vivah_p_102',
    receiverUserId: 'user_bride_01',
    receiverName: 'डा. प्रनिशा श्रेष्ठ',
    receiverGender: 'BRIDE',
    receiverPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    receiverPhone: '+977-9851098765',
    status: 'ACCEPTED',
    initialMessage: 'नमस्ते डा. प्रनिशा ज्यू, हजुरको प्रोफाइल र पृष्ठभूमि धेरै राम्रो लाग्यो। आगे विचार आदान-प्रदान गर्न चाहन्छौँ।',
    createdAt: '2025-01-15T14:00:00.000Z',
    updatedAt: '2025-01-16T10:00:00.000Z',
  }
];

// In-Memory Caches
let memoryProfiles: VivahProfile[] | null = null;
let memoryAds: VivahAdvertisement[] | null = null;
let memoryRequests: VivahRequest[] | null = null;
let memoryFavorites: VivahFavorite[] | null = null;
let memoryReports: VivahReport[] | null = null;
let memoryBlocks: VivahBlock[] | null = null;
let memoryAuditLogs: VivahAuditLog[] | null = null;

// Handlers
export function getStoredVivahProfiles(): VivahProfile[] {
  if (memoryProfiles) return memoryProfiles;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(SEED_VIVAH_PROFILES));
      memoryProfiles = SEED_VIVAH_PROFILES;
      return SEED_VIVAH_PROFILES;
    }
    memoryProfiles = JSON.parse(raw);
    return memoryProfiles!;
  } catch {
    return SEED_VIVAH_PROFILES;
  }
}

export function saveVivahProfile(profile: VivahProfile): void {
  const current = getStoredVivahProfiles();
  const idx = current.findIndex(p => p.id === profile.id);
  if (idx >= 0) {
    current[idx] = { ...profile, updatedAt: new Date().toISOString() };
  } else {
    current.unshift(profile);
  }
  memoryProfiles = [...current];
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save Vivah Profile', e);
  }
}

export function deleteVivahProfile(id: string): void {
  const current = getStoredVivahProfiles().filter(p => p.id !== id);
  memoryProfiles = current;
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to delete Vivah Profile', e);
  }
}

export function getStoredVivahAds(): VivahAdvertisement[] {
  if (memoryAds) return memoryAds;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(SEED_VIVAH_ADS));
      memoryAds = SEED_VIVAH_ADS;
      return SEED_VIVAH_ADS;
    }
    memoryAds = JSON.parse(raw);
    return memoryAds!;
  } catch {
    return SEED_VIVAH_ADS;
  }
}

export function saveVivahAd(ad: VivahAdvertisement): void {
  const current = getStoredVivahAds();
  const idx = current.findIndex(a => a.id === ad.id);
  if (idx >= 0) {
    current[idx] = { ...ad, updatedAt: new Date().toISOString() };
  } else {
    current.unshift(ad);
  }
  memoryAds = [...current];
  try {
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save Vivah Ad', e);
  }
}

export function getStoredVivahRequests(): VivahRequest[] {
  if (memoryRequests) return memoryRequests;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(SEED_VIVAH_REQUESTS));
      memoryRequests = SEED_VIVAH_REQUESTS;
      return SEED_VIVAH_REQUESTS;
    }
    memoryRequests = JSON.parse(raw);
    return memoryRequests!;
  } catch {
    return SEED_VIVAH_REQUESTS;
  }
}

export function saveVivahRequest(req: VivahRequest): void {
  const current = getStoredVivahRequests();
  const idx = current.findIndex(r => r.id === req.id);
  if (idx >= 0) {
    current[idx] = { ...req, updatedAt: new Date().toISOString() };
  } else {
    current.unshift(req);
  }
  memoryRequests = [...current];
  try {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save Vivah Request', e);
  }
}

export function getStoredVivahFavorites(): VivahFavorite[] {
  if (memoryFavorites) return memoryFavorites;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    if (!raw) return [];
    memoryFavorites = JSON.parse(raw);
    return memoryFavorites!;
  } catch {
    return [];
  }
}

export function toggleVivahFavorite(userId: string, targetProfileId: string): boolean {
  const favs = getStoredVivahFavorites();
  const idx = favs.findIndex(f => f.userId === userId && f.targetProfileId === targetProfileId);
  let isFav = false;
  if (idx >= 0) {
    favs.splice(idx, 1);
    isFav = false;
  } else {
    favs.push({
      id: `fav_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId,
      targetProfileId,
      createdAt: new Date().toISOString()
    });
    isFav = true;
  }
  memoryFavorites = [...favs];
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
  } catch (e) {
    console.error('Failed to toggle Vivah Favorite', e);
  }
  return isFav;
}

export function getStoredVivahReports(): VivahReport[] {
  if (memoryReports) return memoryReports;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!raw) return [];
    memoryReports = JSON.parse(raw);
    return memoryReports!;
  } catch {
    return [];
  }
}

export function saveVivahReport(report: VivahReport): void {
  const current = getStoredVivahReports();
  const idx = current.findIndex(r => r.id === report.id);
  if (idx >= 0) {
    current[idx] = report;
  } else {
    current.unshift(report);
  }
  memoryReports = [...current];
  try {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save Vivah Report', e);
  }
}

export function getStoredVivahBlocks(): VivahBlock[] {
  if (memoryBlocks) return memoryBlocks;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BLOCKS);
    if (!raw) return [];
    memoryBlocks = JSON.parse(raw);
    return memoryBlocks!;
  } catch {
    return [];
  }
}

export function blockVivahProfile(userId: string, targetProfileId: string): void {
  const blocks = getStoredVivahBlocks();
  if (!blocks.some(b => b.userId === userId && b.blockedProfileId === targetProfileId)) {
    blocks.push({
      id: `block_${Date.now()}`,
      userId,
      blockedProfileId: targetProfileId,
      createdAt: new Date().toISOString()
    });
    memoryBlocks = [...blocks];
    try {
      localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(blocks));
    } catch (e) {
      console.error('Failed to save Vivah Block', e);
    }
  }
}

export function getStoredVivahAuditLogs(): VivahAuditLog[] {
  if (memoryAuditLogs) return memoryAuditLogs;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!raw) return [];
    memoryAuditLogs = JSON.parse(raw);
    return memoryAuditLogs!;
  } catch {
    return [];
  }
}

export function logVivahAction(
  actorId: string,
  actorName: string,
  action: string,
  targetType: 'PROFILE' | 'ADVERTISEMENT' | 'REQUEST' | 'REPORT' | 'VERIFICATION',
  targetId: string,
  details: string
): void {
  const logs = getStoredVivahAuditLogs();
  const newLog: VivahAuditLog = {
    id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    actorId,
    actorName,
    action,
    targetType,
    targetId,
    details,
    timestamp: new Date().toISOString()
  };
  logs.unshift(newLog);
  memoryAuditLogs = logs.slice(0, 500); // keep max 500 logs
  try {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(memoryAuditLogs));
  } catch (e) {
    console.error('Failed to log Vivah action', e);
  }
}

// Smart Matching Algorithm calculation function
export function calculateVivahMatchScore(myProfile: VivahProfile, candidate: VivahProfile): VivahMatchResult {
  const pref = myProfile.partnerPreferences;
  let totalPoints = 0;
  let maxPoints = 0;

  const breakdown = {
    ageMatch: false,
    heightMatch: false,
    maritalStatusMatch: false,
    educationMatch: false,
    professionMatch: false,
    locationMatch: false,
    dietMatch: false,
    details: [] as string[],
  };

  // 1. Age Preference (Weight: 20)
  maxPoints += 20;
  if (candidate.age >= pref.minAge && candidate.age <= pref.maxAge) {
    totalPoints += 20;
    breakdown.ageMatch = true;
    breakdown.details.push(`उमेर (${candidate.age} वर्ष) हजुरको रोजाइ (${pref.minAge}-${pref.maxAge} वर्ष) भित्र पर्दछ।`);
  } else {
    breakdown.details.push(`उमेर श्रेणीमा थोरै भिन्नता।`);
  }

  // 2. Marital Status Match (Weight: 20)
  maxPoints += 20;
  if (pref.maritalStatus && pref.maritalStatus.includes(candidate.maritalStatus)) {
    totalPoints += 20;
    breakdown.maritalStatusMatch = true;
    breakdown.details.push(`वैवाहिक स्थिति (${candidate.maritalStatus === 'NEVER_MARRIED' ? 'अविवाहित' : candidate.maritalStatus}) प्राथमिकता अनुसार मिल्दछ।`);
  } else if (!pref.maritalStatus || pref.maritalStatus.length === 0) {
    totalPoints += 15;
  }

  // 3. Location Match (Weight: 15)
  maxPoints += 15;
  if (
    pref.preferredDistricts?.includes(candidate.currentDistrict) ||
    pref.preferredProvinces?.includes(candidate.currentProvince)
  ) {
    totalPoints += 15;
    breakdown.locationMatch = true;
    breakdown.details.push(`स्थान (${candidate.currentDistrict}, ${candidate.currentProvince}) प्राथमिकतासँग मिल्दछ।`);
  } else {
    totalPoints += 5; // Partial points
  }

  // 4. Education / Profession Match (Weight: 25)
  maxPoints += 25;
  let isProfMatch = false;
  if (pref.preferredProfessions && pref.preferredProfessions.some(p => candidate.occupation.toLowerCase().includes(p.toLowerCase()) || candidate.fieldOfStudy.toLowerCase().includes(p.toLowerCase()))) {
    isProfMatch = true;
    totalPoints += 15;
  } else {
    totalPoints += 8;
  }

  if (candidate.education) {
    totalPoints += 10;
    breakdown.educationMatch = true;
  }
  if (isProfMatch) {
    breakdown.professionMatch = true;
    breakdown.details.push(`पेशेवर पृष्ठभूमि (${candidate.occupation}) हजुरको रोजाइ क्षेत्रसँग मिल्दछ।`);
  }

  // 5. Diet & Lifestyle (Weight: 10)
  maxPoints += 10;
  if (pref.dietPreference) {
    if (pref.dietPreference.includes('शाकाहारी') && candidate.diet === 'VEG') {
      totalPoints += 10;
      breakdown.dietMatch = true;
      breakdown.details.push('आहार रोजाइ (शाकाहारी) पूर्ण रूपमा मिल्दछ।');
    } else {
      totalPoints += 5;
    }
  } else {
    totalPoints += 8;
  }

  // 6. Gotra Avoidance check
  if (pref.gotraAvoidance && candidate.gotra && pref.gotraAvoidance.includes(candidate.gotra)) {
    totalPoints = Math.max(0, totalPoints - 15);
    breakdown.details.push(`ध्यान दिनुहोस्: गोत्र (${candidate.gotra}) हजुरले वर्जित गर्नुभएको सूचीमा छ।`);
  }

  const matchScore = Math.min(100, Math.round((totalPoints / maxPoints) * 100));

  return {
    profile: candidate,
    matchScore,
    breakdown
  };
}
