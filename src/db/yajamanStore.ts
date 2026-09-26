import {
  Booking,
  BookingStatus,
  BookingStatusHistory,
  ContactExchangeLog,
  RatingReview,
  ServiceCategory,
  ServiceProvider,
  ServiceRequest,
  YajamanAuditLog,
  YajamanComment,
  YajamanNotification,
  YajamanPost,
  YajamanReport,
  YajamanUser,
} from '../types/yajamanTypes';
import { calculateProviderMatchScore, MATCHING_RADIUS_STEPS, maskPhoneNumber, maskEmail } from '../utils/geoUtils';
import { convertADToBS } from '../utils/nepaliCalendar';

const STORAGE_KEYS = {
  CATEGORIES: 'balananda_service_categories_v1',
  PROVIDERS: 'balananda_service_providers_v1',
  YAJAMAN_USERS: 'balananda_yajaman_users_v1',
  ACTIVE_YAJAMAN_SESSION: 'balananda_active_yajaman_session_v1',
  ACTIVE_PROVIDER_SESSION: 'balananda_active_provider_session_v1',
  REQUESTS: 'balananda_service_requests_v1',
  BOOKINGS: 'balananda_bookings_v1',
  STATUS_HISTORY: 'balananda_status_history_v1',
  CONTACT_EXCHANGE: 'balananda_contact_exchange_v1',
  RATINGS: 'balananda_ratings_v1',
  NOTIFICATIONS: 'balananda_notifications_v1',
  POSTS: 'balananda_yajaman_posts_v1',
  REPORTS: 'balananda_yajaman_reports_v1',
  AUDIT_LOGS: 'balananda_yajaman_audit_logs_v1',
};

// 12 Standard Categories requested
export const DEFAULT_SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'cat_jyotish',
    code: 'jyotish',
    nameNepali: 'ज्योतिषाचार्य',
    nameEnglish: 'Jyotishacharyas / Astrologers',
    iconName: 'Sparkles',
    descriptionNepali: 'जन्मकुण्डली, फलादेश, दशा विचार र ग्रहदोष निवारण परामर्श',
    isActive: true,
  },
  {
    id: 'cat_purohit',
    code: 'purohit',
    nameNepali: 'पुरोहित',
    nameEnglish: 'Purohits / Vedic Priests',
    iconName: 'UserCheck',
    descriptionNepali: 'दैनिक नित्य पूजा, कुलपूजा, सत्यनारायण व्रतपूजा तथा अनुष्ठान',
    isActive: true,
  },
  {
    id: 'cat_pandit',
    code: 'pandit',
    nameNepali: 'पण्डित',
    nameEnglish: 'Pandit / Ritual Scholars',
    iconName: 'BookOpen',
    descriptionNepali: 'भागवत सप्ताह, पुराण वाचन, रुद्री र विशेष कथा वाचन',
    isActive: true,
  },
  {
    id: 'cat_vastu',
    code: 'vastu',
    nameNepali: 'वास्तुविद्',
    nameEnglish: 'Vastu Experts',
    iconName: 'Building2',
    descriptionNepali: 'घर, जग्गा, कार्यालय र व्यापारिक प्रतिष्ठान वास्तु निरीक्षण',
    isActive: true,
  },
  {
    id: 'cat_karmakanda',
    code: 'karmakanda',
    nameNepali: 'कर्मकाण्ड विशेषज्ञ',
    nameEnglish: 'Karmakanda Experts',
    iconName: 'Scroll',
    descriptionNepali: 'षोडश संस्कार तथा शास्त्रीय कर्मकाण्ड विधि अनुष्ठान',
    isActive: true,
  },
  {
    id: 'cat_yajna',
    code: 'yajna',
    nameNepali: 'यज्ञ/हवन विशेषज्ञ',
    nameEnglish: 'Yajna / Havan Experts',
    iconName: 'Flame',
    descriptionNepali: 'नवग्रह शान्ति, महामृत्युञ्जय जयन, चण्डी पाठ र महायज्ञ',
    isActive: true,
  },
  {
    id: 'cat_vivah',
    code: 'vivah',
    nameNepali: 'विवाह संस्कार विशेषज्ञ',
    nameEnglish: 'Marriage Ritual Experts',
    iconName: 'HeartHandshake',
    descriptionNepali: 'विवाह मण्डप पूजा, वाग्दान, स्वयंवर तथा वैवाहिक कर्मकाण्ड',
    isActive: true,
  },
  {
    id: 'cat_grihapravesh',
    code: 'grihapravesh',
    nameNepali: 'गृहप्रवेश विशेषज्ञ',
    nameEnglish: 'Grihapravesh Experts',
    iconName: 'Home',
    descriptionNepali: 'नयाँ घर प्रवेश, वास्तु शान्ति पूजा, द्वार पूजा र भूमिपूजन',
    isActive: true,
  },
  {
    id: 'cat_bartabandha',
    code: 'bartabandha',
    nameNepali: 'व्रतबन्ध/उपनयन विशेषज्ञ',
    nameEnglish: 'Bratabandha / Upanayan Experts',
    iconName: 'Award',
    descriptionNepali: 'व्रतबन्ध संस्कार, गायत्री उपदेश तथा उपनयन विधि',
    isActive: true,
  },
  {
    id: 'cat_naamkaran',
    code: 'naamkaran',
    nameNepali: 'नामकरण विशेषज्ञ',
    nameEnglish: 'Naamkaran / Chhathiyar Experts',
    iconName: 'Smile',
    descriptionNepali: 'नवान्न, पास्नी, नामकरण, अन्नप्राशन तथा जन्मोत्सव पूजा',
    isActive: true,
  },
  {
    id: 'cat_pitru',
    code: 'pitru',
    nameNepali: 'श्राद्ध/पितृकार्य विशेषज्ञ',
    nameEnglish: 'Shraddha / Pitrukarya Experts',
    iconName: 'Sun',
    descriptionNepali: 'एकौदिष्ट श्राद्ध, पार्वण श्राद्ध, तीर्थ श्राद्ध तथा सोह्र श्राद्ध',
    isActive: true,
  },
  {
    id: 'cat_anya',
    code: 'anya',
    nameNepali: 'अन्य वैदिक सेवा',
    nameEnglish: 'Other Vedic Services',
    iconName: 'Compass',
    descriptionNepali: 'अन्य विशेष धार्मिक पूजा, जप तथा वैदिक अनुष्ठान परामर्श',
    isActive: true,
  },
];

// Seed Verified Service Providers in Kathmandu / Lalitpur / Bhaktapur / Pokhara
export const SEED_SERVICE_PROVIDERS: ServiceProvider[] = [
  {
    id: 'prov_1',
    fullName: 'ज्योतिषाचार्य पं. बालानन्द भट्टराई',
    title: 'वरिष्ठ ज्योतिषाचार्य तथा कर्मकाण्ड मार्तण्ड',
    mobile: '+९७७-९८५१०१२३४५',
    email: 'balananda.astro@gmail.com',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    qualification: 'नेपाल संस्कृत विश्वविद्यालयबाट ज्योतिष तथा व्याकरणमा आचार्य',
    experienceYears: 22,
    categories: ['cat_jyotish', 'cat_karmakanda', 'cat_grihapravesh', 'cat_yajna'],
    expertise: ['जन्मकुण्डली फलादेश', 'गृहप्रवेश वास्तुशान्ति', 'नवग्रह जप तथा हवन', 'विवाह मिलान'],
    district: 'काठमाडौँ',
    localLevel: 'काठमाडौँ महानगरपालिका',
    ward: '२२',
    serviceAreas: ['काठमाडौँ', 'ललितपुर', 'भक्तपुर'],
    location: {
      latitude: 27.7012,
      longitude: 85.3015,
      addressName: 'न्यु रोड / न्युरोड मन्दिर मार्ग, काठमाडौँ',
      district: 'काठमाडौँ',
      localLevel: 'काठमाडौँ म.न.पा.',
      ward: '२२',
    },
    maxServiceRadiusKm: 30,
    rating: 4.9,
    completedServicesCount: 142,
    isAvailable: true,
    isVerified: true,
    verificationStatus: 'VERIFIED',
    bioNepali: '२२ वर्ष भन्दा बढी समयदेखि वैदिक ज्योतिष, कुण्डली निर्माण तथा धर्मशास्त्र अनुष्ठानमा समर्पित।',
    joinedDateBS: '२०७८ वैशाख ०१',
  },
  {
    id: 'prov_2',
    fullName: 'पं. लोकनाथ देवकोटा',
    title: 'वरिष्ठ पुरोहित तथा वास्तुविद्',
    mobile: '+९७७-९८४१५६७८९०',
    email: 'loknath.purohit@gmail.com',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    qualification: 'कर्मकाण्ड तथा वास्तुशास्त्र डिप्लोमा',
    experienceYears: 16,
    categories: ['cat_purohit', 'cat_vastu', 'cat_grihapravesh', 'cat_vivah'],
    expertise: ['सत्यनारायण पूजा', 'वास्तु निरीक्षण', 'गृहप्रवेश विधि', 'विवाह कर्मकाण्ड'],
    district: 'काठमाडौँ',
    localLevel: 'काठमाडौँ महानगरपालिका',
    ward: '१०',
    serviceAreas: ['काठमाडौँ', 'ललितपुर'],
    location: {
      latitude: 27.6915,
      longitude: 85.3312,
      addressName: 'बानेश्वर, काठमाडौँ',
      district: 'काठमाडौँ',
      localLevel: 'काठमाडौँ म.न.पा.',
      ward: '१०',
    },
    maxServiceRadiusKm: 25,
    rating: 4.8,
    completedServicesCount: 98,
    isAvailable: true,
    isVerified: true,
    verificationStatus: 'VERIFIED',
    bioNepali: 'घर तथा व्यावसायिक भवन वास्तु निरीक्षण र शास्त्रीय पुरोहित्याइँ सेवाका लागि परिचित।',
    joinedDateBS: '२०७९ जेठ १५',
  },
  {
    id: 'prov_3',
    fullName: 'ज्योतिषाचार्य सुवास ढकाल',
    title: 'वैदिक ज्योतिष तथा कुण्डली अनुसन्धानकर्ता',
    mobile: '+९७७-९७६४४००५३३',
    email: 'suwashdmk@gmail.com',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    qualification: 'फलित ज्योतिष तथा कम्प्युटर कुण्डली प्रणाली विशेषज्ञ',
    experienceYears: 14,
    categories: ['cat_jyotish', 'cat_naamkaran', 'cat_bartabandha', 'cat_vivah'],
    expertise: ['अष्टकूट गुण मिलान', 'नामकरण तथा पास्नी', 'व्रतबन्ध उपनयन', 'दशा फलादेश'],
    district: 'काठमाडौँ',
    localLevel: 'काठमाडौँ महानगरपालिका',
    ward: '३',
    serviceAreas: ['काठमाडौँ', 'भक्तपुर', 'काभ्रे'],
    location: {
      latitude: 27.7342,
      longitude: 85.3210,
      addressName: 'महाराजगञ्ज, काठमाडौँ',
      district: 'काठमाडौँ',
      localLevel: 'काठमाडौँ म.न.पा.',
      ward: '३',
    },
    maxServiceRadiusKm: 30,
    rating: 5.0,
    completedServicesCount: 185,
    isAvailable: true,
    isVerified: true,
    verificationStatus: 'VERIFIED',
    bioNepali: 'आधुनिक तथा वैदिक विधिद्वारा सटीक कुण्डली फलादेश र संस्कार कर्म विशेषज्ञ।',
    joinedDateBS: '२०७७ आश्विन १०',
  },
  {
    id: 'prov_4',
    fullName: 'पं. गणेशप्रसाद रिजाल',
    title: 'पितृकार्य तथा श्राद्ध कर्मकाण्ड पण्डित',
    mobile: '+९७७-९८६०११२२३३',
    email: 'ganesh.rijal@gmail.com',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    qualification: 'कर्मकाण्ड तथा वेद वाचनमा शास्त्री',
    experienceYears: 19,
    categories: ['cat_pitru', 'cat_pandit', 'cat_karmakanda', 'cat_yajna'],
    expertise: ['एकौदिष्ट श्राद्ध', 'सोह्र श्राद्ध', 'रुद्री पाठ', 'महायज्ञ हवन'],
    district: 'ललितपुर',
    localLevel: 'ललितपुर महानगरपालिका',
    ward: '५',
    serviceAreas: ['ललितपुर', 'काठमाडौँ'],
    location: {
      latitude: 27.6710,
      longitude: 85.3180,
      addressName: 'जावलाखेल, ललितपुर',
      district: 'ललितपुर',
      localLevel: 'ललितपुर म.न.पा.',
      ward: '५',
    },
    maxServiceRadiusKm: 20,
    rating: 4.7,
    completedServicesCount: 88,
    isAvailable: true,
    isVerified: true,
    verificationStatus: 'VERIFIED',
    bioNepali: 'पितृकार्य, श्राद्ध तर्पण तथा वेद पाठ कर्मकाण्डका अनुभवी पण्डित।',
    joinedDateBS: '२०८० श्रावण ०५',
  },
];

// Helper to convert AD date to BS string for timestamping
export function getCurrentDateBS(): string {
  const today = new Date().toISOString().split('T')[0];
  const bs = convertADToBS(today);
  return bs.formattedBS;
}

export function generateBookingCode(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  const bsYear = convertADToBS(new Date().toISOString().split('T')[0]).year;
  return `YJM-${bsYear}-${rand}`;
}

// Local Storage Memory Caches
let memoryCategories: ServiceCategory[] | null = null;
let memoryProviders: ServiceProvider[] | null = null;
let memoryUsers: YajamanUser[] | null = null;
let memoryRequests: ServiceRequest[] | null = null;
let memoryBookings: Booking[] | null = null;
let memoryNotifications: YajamanNotification[] | null = null;

// Local Storage Handlers
export function getStoredServiceCategories(): ServiceCategory[] {
  if (memoryCategories) return memoryCategories;
  const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_SERVICE_CATEGORIES));
    memoryCategories = DEFAULT_SERVICE_CATEGORIES;
    return DEFAULT_SERVICE_CATEGORIES;
  }
  try {
    memoryCategories = JSON.parse(raw);
    return memoryCategories!;
  } catch {
    return DEFAULT_SERVICE_CATEGORIES;
  }
}

export function saveServiceCategories(categories: ServiceCategory[]): void {
  memoryCategories = categories;
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}

export function getStoredServiceProviders(): ServiceProvider[] {
  if (memoryProviders) return memoryProviders;
  const raw = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(SEED_SERVICE_PROVIDERS));
    memoryProviders = SEED_SERVICE_PROVIDERS;
    return SEED_SERVICE_PROVIDERS;
  }
  try {
    memoryProviders = JSON.parse(raw);
    return memoryProviders!;
  } catch {
    return SEED_SERVICE_PROVIDERS;
  }
}

/**
 * Privacy-Enforcing Provider Retrieval (Server/Store-Side Access Control)
 * Masks direct contact info (mobile, email, address) unless viewer has an ACCEPTED/CONFIRMED booking.
 */
export function getSanitizedServiceProviders(viewerYajamanId?: string): ServiceProvider[] {
  const providers = getStoredServiceProviders();
  const bookings = getStoredBookings();

  return providers.map((p) => {
    const isUnlocked = viewerYajamanId ? bookings.some(
      (b) =>
        b.yajamanId === viewerYajamanId &&
        b.providerId === p.id &&
        ['ACCEPTED', 'CONTACT_UNLOCKED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(b.status)
    ) : false;

    if (isUnlocked) {
      return p; // Unlocked contact
    }

    return {
      ...p,
      mobile: maskPhoneNumber(p.mobile),
      email: p.email ? maskEmail(p.email) : undefined,
      location: {
        ...p.location,
        addressName: p.district ? `${p.district}, ${p.localLevel || 'नेपाल'} (गोप्य स्थान)` : 'काठमाडौँ (समीप स्थान)',
      },
    };
  });
}

export function getSanitizedServiceProviderById(providerId: string, viewerYajamanId?: string): ServiceProvider | null {
  const sanitized = getSanitizedServiceProviders(viewerYajamanId);
  return sanitized.find((p) => p.id === providerId) || null;
}

export function saveServiceProviders(providers: ServiceProvider[]): void {
  memoryProviders = providers;
  localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(providers));
}

export function getStoredYajamanUsers(): YajamanUser[] {
  if (memoryUsers) return memoryUsers;
  const raw = localStorage.getItem(STORAGE_KEYS.YAJAMAN_USERS);
  if (!raw) return [];
  try {
    memoryUsers = JSON.parse(raw);
    return memoryUsers!;
  } catch {
    return [];
  }
}

export function saveYajamanUsers(users: YajamanUser[]): void {
  memoryUsers = users;
  localStorage.setItem(STORAGE_KEYS.YAJAMAN_USERS, JSON.stringify(users));
}

export function getActiveYajamanSession(): YajamanUser | null {
  const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_YAJAMAN_SESSION);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setActiveYajamanSession(user: YajamanUser | null): void {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_YAJAMAN_SESSION);
  } else {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_YAJAMAN_SESSION, JSON.stringify(user));
  }
}

export function getActiveProviderSession(): ServiceProvider | null {
  const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROVIDER_SESSION);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setActiveProviderSession(provider: ServiceProvider | null): void {
  if (!provider) {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROVIDER_SESSION);
  } else {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROVIDER_SESSION, JSON.stringify(provider));
  }
}

export function getStoredServiceRequests(): ServiceRequest[] {
  if (memoryRequests) return memoryRequests;
  const raw = localStorage.getItem(STORAGE_KEYS.REQUESTS);
  if (!raw) return [];
  try {
    memoryRequests = JSON.parse(raw);
    return memoryRequests!;
  } catch {
    return [];
  }
}

export function saveServiceRequests(requests: ServiceRequest[]): void {
  memoryRequests = requests;
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
}

export function getStoredBookings(): Booking[] {
  if (memoryBookings) return memoryBookings;
  const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
  if (!raw) return [];
  try {
    memoryBookings = JSON.parse(raw);
    return memoryBookings!;
  } catch {
    return [];
  }
}

export function saveBookings(bookings: Booking[]): void {
  memoryBookings = bookings;
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
}

export function getStoredNotifications(): YajamanNotification[] {
  if (memoryNotifications) return memoryNotifications;
  const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  if (!raw) return [];
  try {
    memoryNotifications = JSON.parse(raw);
    return memoryNotifications!;
  } catch {
    return [];
  }
}

export function saveNotifications(notifications: YajamanNotification[]): void {
  memoryNotifications = notifications;
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
}

export function addNotification(
  recipientId: string,
  recipientType: 'YAJAMAN' | 'PROVIDER' | 'ADMIN',
  title: string,
  message: string,
  bookingId?: string,
  requestId?: string,
  postId?: string
): void {
  const all = getStoredNotifications();
  const newNotif: YajamanNotification = {
    id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    recipientId,
    recipientType,
    title,
    message,
    relatedBookingId: bookingId,
    relatedRequestId: requestId,
    isRead: false,
    timestamp: Date.now(),
    timestampBS: getCurrentDateBS(),
  };
  saveNotifications([newNotif, ...all]);
}

// Contact Exchange Logger
export function getContactExchangeLogs(): ContactExchangeLog[] {
  const raw = localStorage.getItem(STORAGE_KEYS.CONTACT_EXCHANGE);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function recordContactExchange(
  bookingId: string,
  requestId: string,
  yajamanId: string,
  providerId: string
): void {
  const logs = getContactExchangeLogs();
  const newLog: ContactExchangeLog = {
    id: `ce_${Date.now()}`,
    bookingId,
    requestId,
    yajamanId,
    providerId,
    exchangeTimestamp: Date.now(),
    exchangeTimestampBS: getCurrentDateBS(),
    status: 'EXCHANGED',
  };
  localStorage.setItem(STORAGE_KEYS.CONTACT_EXCHANGE, JSON.stringify([newLog, ...logs]));
}

// Progressive Geolocation Matching logic
export function getMatchingProvidersForRequest(
  request: ServiceRequest,
  radiusKm: number
): { provider: ServiceProvider; score: number; distanceKm: number }[] {
  const allProviders = getStoredServiceProviders();
  const matches: { provider: ServiceProvider; score: number; distanceKm: number }[] = [];

  for (const prov of allProviders) {
    const { score, distanceKm, isEligible } = calculateProviderMatchScore(prov, request, radiusKm);
    if (isEligible) {
      matches.push({ provider: prov, score, distanceKm });
    }
  }

  // Sort by highest score first, then closest distance
  return matches.sort((a, b) => b.score - a.score || a.distanceKm - b.distanceKm);
}

// Accept Service Request Flow (Provider Side)
export function acceptServiceRequest(requestId: string, providerId: string): { success: boolean; booking?: Booking; error?: string } {
  const requests = getStoredServiceRequests();
  const reqIndex = requests.findIndex((r) => r.id === requestId);
  if (reqIndex === -1) {
    return { success: false, error: 'Service Request not found' };
  }

  const req = requests[reqIndex];
  if (req.status === 'ACCEPTED' || req.status === 'CONFIRMED' || req.status === 'COMPLETED') {
    return { success: false, error: 'Request is already accepted by another provider' };
  }

  const providers = getStoredServiceProviders();
  const provider = providers.find((p) => p.id === providerId);
  if (!provider) {
    return { success: false, error: 'Provider record not found' };
  }

  // Update Request
  req.status = 'ACCEPTED';
  req.assignedProviderId = provider.id;
  req.assignedProviderName = provider.fullName;
  req.assignedProviderPhone = provider.mobile;
  req.updatedTimestamp = Date.now();
  requests[reqIndex] = req;
  saveServiceRequests(requests);

  // Calculate actual distance
  const matchResult = calculateProviderMatchScore(provider, req, 30);

  // Create Booking
  const newBooking: Booking = {
    id: `bk_${Date.now()}`,
    bookingCode: req.bookingCode,
    requestId: req.id,
    yajamanId: req.yajamanId,
    yajamanName: req.yajamanName,
    yajamanPhone: req.yajamanMobile,
    yajamanEmail: req.yajamanEmail,
    yajamanLocation: req.location,
    providerId: provider.id,
    providerName: provider.fullName,
    providerPhone: provider.mobile,
    providerTitle: provider.title,
    providerPhoto: provider.photoUrl,
    categoryName: req.categoryNameNepali,
    serviceType: req.serviceType,
    appointmentDateBS: req.preferredDateBS,
    appointmentTime: req.preferredTime,
    matchedRadiusKm: req.currentRadiusKm,
    calculatedDistanceKm: matchResult.distanceKm,
    status: 'ACCEPTED',
    acceptanceTimestamp: Date.now(),
    notes: req.additionalNotes,
  };

  const bookings = getStoredBookings();
  saveBookings([newBooking, ...bookings]);

  // Record Contact Details Exchange Log
  recordContactExchange(newBooking.id, req.id, req.yajamanId, provider.id);

  // Send Notification to Yajaman
  addNotification(
    req.yajamanId,
    'YAJAMAN',
    'सेवा अनुरोध स्वीकार गरियो!',
    `तपाईंको '${req.serviceType}' सेवा अनुरोध ${provider.fullName} ले स्वीकार गर्नुभएको छ। सम्पर्क नम्बर तथा विस्तृत विवरण उपलब्ध भएको छ।`,
    newBooking.id,
    req.id
  );

  // Send Notification to Provider
  addNotification(
    provider.id,
    'PROVIDER',
    'बुकिङ निश्चित भयो!',
    `तपाईंले ${req.yajamanName} को '${req.serviceType}' सेवा स्वीकार गर्नुभयो। यजमानको सम्पर्क र स्थान विवरण प्राप्त भएको छ।`,
    newBooking.id,
    req.id
  );

  return { success: true, booking: newBooking };
}

// ----------------------------------------------------
// Social / Community Posts Store & Actions
// ----------------------------------------------------

export const DEFAULT_YAJAMAN_POSTS: YajamanPost[] = [
  {
    id: 'yp_post_101',
    authorId: 'prov_1',
    authorName: 'पं. श्री बालानन्द न्यौपाने',
    authorPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    authorRole: 'PANDIT',
    isVerified: true,
    title: 'आगामी शुभ मुहूर्तमा गृहप्रवेश, वास्तु शान्ति तथा नवग्रह पूजा संकल्प सेवा',
    description: 'काठमाडौँ उपत्यका तथा वरपरका क्षेत्रमा नयाँ घर निर्माण पश्चात शास्त्रीय विधिअनुसार वास्तुशान्ति, द्वार पूजा, मातृका पूजन र नवग्रह महायज्ञ सम्पन्न गर्न सेवा उपलब्ध छ। आवश्यक सामग्री सूची र मुहूर्त निर्धारण निःशुल्क गरिन्छ।',
    serviceType: 'गृहप्रवेश तथा वास्तु शान्ति पूजा',
    categoryCode: 'grihapravesh',
    categoryNameNepali: 'गृहप्रवेश विशेषज्ञ',
    district: 'काठमाडौँ',
    localLevel: 'काठमाडौँ महानगरपालिका',
    availableDates: 'फागुन १ देखि चैत्र १५ सम्म',
    availableTimes: 'बिहान ०६:३० देखि दिउँसो ०१:०० सम्म',
    estimatedFee: 'शास्त्रीय दक्षिणा (पारस्परिक छलफल अनुसार)',
    requiredSamagri: 'पञ्चामृत, तील, कुश, दुबो, हवन सामग्री, कलश, रक्तवस्त्र, नवग्रह समिधा',
    photos: [
      'https://images.unsplash.com/photo-1609137144822-0a13d7890b0e?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1514533212735-5df27d970db0?auto=format&fit=crop&q=80&w=600'
    ],
    likesCount: 38,
    likedUserIds: ['user_sample_1', 'user_sample_2'],
    sharesCount: 14,
    savedUserIds: ['user_sample_1'],
    commentsCount: 3,
    comments: [
      {
        id: 'comm_101',
        postId: 'yp_post_101',
        authorId: 'yjm_sample_1',
        authorName: 'रमेश अधिकारी',
        text: 'गुरुज्यू, ललितपुर महालक्ष्मीस्थानमा फागुन १० गते बिहानको समय मिल्न सक्छ?',
        createdAtBS: '२०८१-११-०२',
        createdAtTimestamp: Date.now() - 86400000 * 2,
        replies: [
          {
            id: 'rep_101',
            authorId: 'prov_1',
            authorName: 'पं. श्री बालानन्द न्यौपाने',
            text: 'हजुर रमेशजी, सेवा अनुरोध पठाउनुहोस् वा सम्पर्क विवरण खुलाएपछि समय मिलाउन सकिन्छ।',
            createdAtBS: '२०८१-११-०२',
          }
        ]
      }
    ],
    contactPreference: 'अनुमति प्राप्त सेवा अनुरोध मार्फत मात्र',
    contactPhoneMasked: '९८४१******',
    contactEmailMasked: 'balananda.***@gmail.com',
    visibility: 'PUBLIC',
    status: 'APPROVED',
    isFeatured: true,
    createdAtBS: '२०८१-११-०१',
    createdAtTimestamp: Date.now() - 86400000 * 3,
  },
  {
    id: 'yp_post_102',
    authorId: 'prov_2',
    authorName: 'डा. हरिप्रसाद भट्टराई (ज्योतिषाचार्य)',
    authorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    authorRole: 'JYOTISH',
    isVerified: true,
    title: 'विवाह कुण्डली मिलान, गुण मिलान तथा सप्तमेश दोष निवारण परामर्श',
    description: 'वर र कन्याको जन्म विवरणका आधारमा अष्टकूट ३६ गुण, मङ्गल दोष (कुज दोष), नाडी दोष र दशा सन्धि शास्त्रीय विश्लेषण गरी वैदिक समाधान र उपाय प्रदान गरिन्छ। अनलाइन तथा प्रत्यक्ष दुवै माध्यमबाट परामर्श उपलब्ध छ।',
    serviceType: 'विवाह कुण्डली मिलान परामर्श',
    categoryCode: 'jyotish',
    categoryNameNepali: 'ज्योतिषाचार्य',
    district: 'ललितपुर',
    localLevel: 'ललितपुर महानगरपालिका',
    availableDates: 'दैनिक उपलब्ध',
    availableTimes: 'बिहान ०८:०० देखि साँझ ०६:०० सम्म',
    estimatedFee: 'रु. १५०० (विस्तृत विश्लेषण प्रतिवेदन सहित)',
    requiredSamagri: 'वर र कन्याको जन्म मिति, समय र स्थान',
    photos: [
      'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=600'
    ],
    likesCount: 52,
    likedUserIds: ['user_sample_2'],
    sharesCount: 21,
    savedUserIds: [],
    commentsCount: 2,
    comments: [
      {
        id: 'comm_102',
        postId: 'yp_post_102',
        authorId: 'yjm_sample_2',
        authorName: 'सुमन थापा',
        text: 'धेरै राम्रो विश्लेषण दिनुभयो अस्ति मेरो भाइको विवाह मिलानमा। धन्यवाद गुरुज्यू।',
        createdAtBS: '२०८१-११-०३',
        createdAtTimestamp: Date.now() - 86400000 * 1,
      }
    ],
    contactPreference: 'सिस्टम मार्फत अनलाइन बुकिङ',
    contactPhoneMasked: '९८५१******',
    contactEmailMasked: 'hari.jyotish.***@gmail.com',
    visibility: 'PUBLIC',
    status: 'APPROVED',
    isFeatured: true,
    createdAtBS: '२०८१-११-०२',
    createdAtTimestamp: Date.now() - 86400000 * 2,
  },
  {
    id: 'yp_post_103',
    authorId: 'prov_3',
    authorName: 'आचार्य कृष्णप्रसाद दाहाल',
    authorPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    authorRole: 'PUROHIT',
    isVerified: true,
    title: 'श्रीमद्भागवत सप्ताह ज्ञानमहायज्ञ तथा पुराण वाचन व्यवस्थापन',
    description: 'कुलपरम्परा, पितृउद्धार तथा धार्मिक अनुष्ठानका लागि सङ्गीतमय श्रीमद्भागवत सप्ताह, देवी भागवत र शिवपुराण वाचन व्यास तथा पाठ-पारायण समूह उपलब्ध छ।',
    serviceType: 'श्रीमद्भागवत सप्ताह वाचन',
    categoryCode: 'pandit',
    categoryNameNepali: 'पण्डित',
    district: 'भक्तपुर',
    localLevel: 'सूर्यविनायक नगरपालिका',
    availableDates: 'अग्रिम बुकिङ अनुसार',
    availableTimes: 'पूर्णकालीन अनुष्ठान',
    estimatedFee: 'अनुष्ठान आयोजना अनुसार',
    requiredSamagri: 'व्यास मण्डप, पूजा वेदी तथा सम्पूर्ण पारायण सामग्री',
    photos: [
      'https://images.unsplash.com/photo-1543083477-4f785aeafaa9?auto=format&fit=crop&q=80&w=600'
    ],
    likesCount: 29,
    likedUserIds: [],
    sharesCount: 8,
    savedUserIds: [],
    commentsCount: 1,
    comments: [],
    contactPreference: 'यजमान सेवा पोर्टल अनुरोध',
    contactPhoneMasked: '९८४२******',
    contactEmailMasked: 'kp.dahal.***@gmail.com',
    visibility: 'PUBLIC',
    status: 'APPROVED',
    isFeatured: false,
    createdAtBS: '२०८१-११-०३',
    createdAtTimestamp: Date.now() - 86400000,
  }
];

export function getStoredYajamanPosts(): YajamanPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (!raw) {
      saveYajamanPosts(DEFAULT_YAJAMAN_POSTS);
      return DEFAULT_YAJAMAN_POSTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_YAJAMAN_POSTS;
  }
}

export function saveYajamanPosts(posts: YajamanPost[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  } catch (err) {
    console.error('Failed to save yajaman posts to localStorage', err);
  }
}

export function saveYajamanPost(post: YajamanPost): void {
  const posts = getStoredYajamanPosts();
  const index = posts.findIndex(p => p.id === post.id);
  if (index >= 0) {
    posts[index] = post;
  } else {
    posts.unshift(post);
  }
  saveYajamanPosts(posts);
}

export function toggleYajamanPostLike(postId: string, userId: string): { likesCount: number; isLiked: boolean } {
  const posts = getStoredYajamanPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return { likesCount: 0, isLiked: false };

  const userIndex = post.likedUserIds.indexOf(userId);
  let isLiked = false;
  if (userIndex >= 0) {
    post.likedUserIds.splice(userIndex, 1);
    post.likesCount = Math.max(0, post.likesCount - 1);
    isLiked = false;
  } else {
    post.likedUserIds.push(userId);
    post.likesCount += 1;
    isLiked = true;
  }
  saveYajamanPosts(posts);
  return { likesCount: post.likesCount, isLiked };
}

export function toggleYajamanPostSave(postId: string, userId: string): { isSaved: boolean } {
  const posts = getStoredYajamanPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return { isSaved: false };

  const userIndex = post.savedUserIds.indexOf(userId);
  let isSaved = false;
  if (userIndex >= 0) {
    post.savedUserIds.splice(userIndex, 1);
    isSaved = false;
  } else {
    post.savedUserIds.push(userId);
    isSaved = true;
  }
  saveYajamanPosts(posts);
  return { isSaved };
}

export function incrementYajamanPostShare(postId: string): number {
  const posts = getStoredYajamanPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return 0;
  post.sharesCount += 1;
  saveYajamanPosts(posts);
  return post.sharesCount;
}

export function addYajamanPostComment(
  postId: string,
  commentData: {
    authorId: string;
    authorName: string;
    authorPhoto?: string;
    text: string;
  }
): YajamanComment | null {
  const posts = getStoredYajamanPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return null;

  const today = new Date().toISOString().split('T')[0];
  const bs = convertADToBS(today);
  const dateBS = `${bs.year}-${bs.month.toString().padStart(2, '0')}-${bs.day.toString().padStart(2, '0')}`;

  const newComment: YajamanComment = {
    id: `comm_${Date.now()}`,
    postId,
    authorId: commentData.authorId,
    authorName: commentData.authorName,
    authorPhoto: commentData.authorPhoto,
    text: commentData.text,
    createdAtBS: dateBS,
    createdAtTimestamp: Date.now(),
  };

  post.comments.push(newComment);
  post.commentsCount = post.comments.length;
  saveYajamanPosts(posts);

  // Notify post author if not self
  if (post.authorId !== commentData.authorId) {
    addNotification(
      post.authorId,
      'PROVIDER',
      'तपाईंको पोस्टमा नयाँ टिप्पणी!',
      `${commentData.authorName} ले तपाईंको '${post.title.substring(0, 30)}...' पोस्टमा टिप्पणी गर्नुभयो।`,
      undefined,
      undefined,
      post.id
    );
  }

  return newComment;
}

export function deleteYajamanPostComment(postId: string, commentId: string, authorId: string, isAdmin = false): boolean {
  const posts = getStoredYajamanPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return false;

  const initialLength = post.comments.length;
  post.comments = post.comments.filter(c => {
    if (c.id === commentId) {
      return !(c.authorId === authorId || isAdmin);
    }
    return true;
  });

  if (post.comments.length < initialLength) {
    post.commentsCount = post.comments.length;
    saveYajamanPosts(posts);
    return true;
  }
  return false;
}

// ----------------------------------------------------
// Reports & Moderation Store
// ----------------------------------------------------

export function getStoredYajamanReports(): YajamanReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveYajamanReports(reports: YajamanReport[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  } catch (err) {
    console.error('Failed to save reports to localStorage', err);
  }
}

export function reportYajamanItem(report: Omit<YajamanReport, 'id' | 'createdAtBS' | 'timestamp' | 'status'>): YajamanReport {
  const reports = getStoredYajamanReports();
  const today = new Date().toISOString().split('T')[0];
  const bs = convertADToBS(today);
  const dateBS = `${bs.year}-${bs.month.toString().padStart(2, '0')}-${bs.day.toString().padStart(2, '0')}`;

  const newReport: YajamanReport = {
    ...report,
    id: `rep_${Date.now()}`,
    status: 'PENDING',
    createdAtBS: dateBS,
    timestamp: Date.now(),
  };

  reports.unshift(newReport);
  saveYajamanReports(reports);
  return newReport;
}

export function getStoredYajamanAuditLogs(): YajamanAuditLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveYajamanAuditLogs(logs: YajamanAuditLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save audit logs to localStorage', err);
  }
}

export function logYajamanAction(
  actorId: string,
  actorName: string,
  action: string,
  targetType: 'POST' | 'COMMENT' | 'VERIFICATION' | 'REQUEST' | 'USER',
  targetId: string,
  details: string
): void {
  const logs = getStoredYajamanAuditLogs();
  const today = new Date().toISOString().split('T')[0];
  const bs = convertADToBS(today);
  const dateBS = `${bs.year}-${bs.month.toString().padStart(2, '0')}-${bs.day.toString().padStart(2, '0')}`;

  const newLog: YajamanAuditLog = {
    id: `audit_${Date.now()}`,
    actorId,
    actorName,
    action,
    targetType,
    targetId,
    details,
    timestampBS: dateBS,
    timestamp: Date.now(),
  };

  logs.unshift(newLog);
  saveYajamanAuditLogs(logs.slice(0, 100)); // keep last 100 logs
}

