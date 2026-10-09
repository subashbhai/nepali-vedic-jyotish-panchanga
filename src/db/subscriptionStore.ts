import { convertADToBS } from '../utils/nepaliCalendar';

export const ESEWA_RECIPIENT_NUMBER = '९७६४४००५३३';
export const ESEWA_RECIPIENT_NUMBER_EN = '9764400533';
export const KHALTI_RECIPIENT_NUMBER = '९७६४४००५३३';
export const KHALTI_RECIPIENT_NUMBER_EN = '9764400533';
export const PAYMENT_RECIPIENT_FULL_ID = '+977-9764400533';
export const SOFTWARE_FULL_ACCESS_KEY = 'balananda_software_full_access_license_v2';

export type SubscriptionPlanId = 'free' | 'trial' | 'monthly' | 'yearly' | 'lifetime';
export type PlatformType = 'desktop' | 'web' | 'mobile';
export type EsewaVerificationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface SoftwarePackageTier {
  id: string;
  category: 'lifetime' | 'yearly';
  platform: 'mobile' | 'desktop' | 'both';
  labelNepali: string;
  icon: string;
  priceNPR: number;
  priceFormattedNepali: string;
  durationLabel: string;
  features: string[];
  isPopular?: boolean;
  isBestValue?: boolean;
}

export const SOFTWARE_PURCHASE_TIERS: SoftwarePackageTier[] = [
  // 1. जीवनभर (Lifetime)
  {
    id: 'lifetime_mobile',
    category: 'lifetime',
    platform: 'mobile',
    labelNepali: '📱 मोबाइल जीवनभर',
    icon: '📱',
    priceNPR: 4000,
    priceFormattedNepali: 'रु. ४,००० मात्र',
    durationLabel: 'जीवनभर',
    features: [
      'एन्ड्रोइड तथा आईफोन मोबाइलमा पूर्ण पहुँच',
      'दैनिक पञ्चाङ्ग, मुहूर्त तथा गोचर फलादेश',
      'जन्मकुण्डली, विंशोत्तरी दशा र नक्षत्र विश्लेषण',
      '३६०° डिजिटल वास्तु कम्पास र दिक्पाल दिशा',
      'जीवनभर निःशुल्क नयाँ अपडेट तथा प्राविधिक सहयोग'
    ]
  },
  {
    id: 'lifetime_desktop',
    category: 'lifetime',
    platform: 'desktop',
    labelNepali: '💻 कम्प्युटर जीवनभर',
    icon: '💻',
    priceNPR: 7000,
    priceFormattedNepali: 'रु. ७,००० मात्र',
    durationLabel: 'जीवनभर',
    features: [
      'विन्डोज तथा म्याक कम्प्युटरमा पूर्ण पहुँच',
      'सम्पूर्ण षोडशवर्ग (D1 देखि D60), अष्टकवर्ग र दशा फलित',
      'बृहत् कुण्डली, चिना तथा पत्रिका A4 PDF मुद्रण',
      '८१-पद वास्तु मण्डल, भूमि परीक्षण र नक्शा विश्लेषण',
      'संस्थागत लेटरहेड, लोगो र आफ्नै नाममा ब्रान्डिङ'
    ]
  },
  {
    id: 'lifetime_both',
    category: 'lifetime',
    platform: 'both',
    labelNepali: '📱💻 मोबाइल + कम्प्युटर जीवनभर',
    icon: '📱💻',
    priceNPR: 10000,
    priceFormattedNepali: 'रु. १०,००० मात्र',
    durationLabel: 'जीवनभर',
    isBestValue: true,
    features: [
      'मोबाइल तथा कम्प्युटर दुवैमा असीमित आजीवन पहुँच',
      'सम्पूर्ण वैदिक ज्योतिष, वास्तु तथा कर्मकाण्ड सुविधाहरू',
      'असीमित जातक विवरण बचत तथा स्वचालित क्लाउड सिंक',
      'संस्थागत ब्रान्डिङ, डिजिटल हस्ताक्षर र A4 लेटरहेड मुद्रण',
      '२४/७ प्राथमिकता प्राविधिक तथा ज्योतिषीय सहायता'
    ]
  },

  // 2. एक वर्षको सदस्यता (Yearly Subscription)
  {
    id: 'yearly_mobile',
    category: 'yearly',
    platform: 'mobile',
    labelNepali: '📱 मोबाइल',
    icon: '📱',
    priceNPR: 2000,
    priceFormattedNepali: 'रु. २,०००',
    durationLabel: '१ वर्ष',
    features: [
      '१ वर्षसम्म मोबाइलमा सम्पूर्ण ज्योतिष तथा पञ्चाङ्ग',
      'दैनिक तिथि, पर्व तथा शुभ-मुहूर्त अलर्ट',
      'जन्मकुण्डली, गोचर र आधारभूत वास्तु कम्पास',
      '१ वर्षसम्म सबै नयाँ अपडेट तथा प्राविधिक सहयोग'
    ]
  },
  {
    id: 'yearly_desktop',
    category: 'yearly',
    platform: 'desktop',
    labelNepali: '💻 कम्प्युटर',
    icon: '💻',
    priceNPR: 3500,
    priceFormattedNepali: 'रु. ३,५००',
    durationLabel: '१ वर्ष',
    features: [
      '१ वर्षसम्म कम्प्युटरमा सम्पूर्ण कुण्डली तथा वास्तु कार्यक्षेत्र',
      'A4 कुण्डली तथा वास्तु प्रतिवेदन मुद्रण सुविधा',
      'संस्थागत लेटरहेड तथा ग्राहक विवरण व्यवस्थापन',
      '१ वर्षसम्म प्राविधिक सहायता तथा सफ्टवेयर अपडेट'
    ]
  },
  {
    id: 'yearly_both',
    category: 'yearly',
    platform: 'both',
    labelNepali: '📱💻 मोबाइल + कम्प्युटर',
    icon: '📱💻',
    priceNPR: 5000,
    priceFormattedNepali: 'रु. ५,०००',
    durationLabel: '१ वर्ष',
    isPopular: true,
    features: [
      '१ वर्षसम्म मोबाइल तथा कम्प्युटर दुवैमा पूर्ण पहुँच',
      'सम्पूर्ण पत्रिका, चिना, वास्तु र पञ्चाङ्ग विश्लेषण',
      'यन्त्र, मन्त्र, कर्मकाण्ड र क्लाउड सिंक',
      '१ वर्षसम्म पूर्ण प्राविधिक तथा ग्राहक सहायता'
    ]
  }
];

export const SOFTWARE_SUPPORT_CONTACT = {
  phone: '9764400533',
  phoneFormatted: '९७६४४००५३३',
  phoneFull: '+977-9764400533',
  whatsappNumber: '9764400533',
  whatsappUrl: 'https://wa.me/9779764400533',
  email: 'suwashdmk@gmail.com',
  emailMailto: 'mailto:suwashdmk@gmail.com'
};

export interface PlanConfig {
  id: SubscriptionPlanId;
  nameNepali: string;
  basePriceNPR: number; // Base price for computer version (100%)
  basePriceFormattedNepali: string; // e.g. "रु. १०,०००"
  durationLabelNepali: string; // e.g. "आजीवन", "१ वर्ष", "१ महिना", "४८ घण्टा"
  durationDays: number | null; // null for lifetime, 2 for trial, 30 for monthly, 365 for yearly
  descriptionNepali: string;
  badgeTagNepali?: string;
}

export interface PricingConfig {
  desktopPercent: number; // 100%
  webPercent: number;     // 75%
  mobilePercent: number;  // 50%
  roundingRule: 'round' | 'floor' | 'ceil';
}

export interface PaymentGatewayConfig {
  id: 'esewa' | 'khalti' | 'imepay' | 'bank_qr' | 'connect_ips';
  nameNepali: string;
  logoIcon: string;
  isEnabled: boolean;
  instructionsNepali: string;
}

export interface PaymentRecord {
  txnId: string; // e.g. SJS-TXN-२०८३-८३९१
  receiptNo: string; // e.g. SJS-REC-२०८३-५९४०
  planId: SubscriptionPlanId;
  planNameNepali: string;
  platformMode: PlatformType; // 'desktop' | 'web' | 'mobile'
  platformNameNepali: string; // "कम्प्युटर" | "वेब" | "मोबाइल"
  basePriceNPR: number;
  basePriceFormattedNepali: string;
  appliedPercent: number; // e.g. 100, 75, 50
  amountNPR: number; // Final paid amount after platform percentage
  amountFormattedNepali: string;
  dateAD: string;
  dateBS: string;
  timeStr: string;
  paymentMethodNepali: string;
  paymentMethodKey: string;
  status: 'success' | 'failed' | 'pending';
  failureReasonNepali?: string;
  periodStartBS: string;
  periodEndBS: string; // "आजीवन" for lifetime
}

export interface EsewaPaymentRequest {
  requestId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  planId: 'monthly' | 'yearly' | 'lifetime';
  planNameNepali: string;
  platformMode: PlatformType;
  platformNameNepali: string;
  expectedAmountNPR: number;
  expectedAmountFormattedNepali: string;
  submittedAmountNPR: number;
  submittedAmountFormattedNepali: string;
  transactionCode: string;
  paymentDateBS: string;
  paymentDateAD: string;
  proofNoteOrImage: string;
  submittedAtISO: string;
  status: EsewaVerificationStatus;
  statusNepali: string; // "प्रमाणीकरण बाँकी", "स्वीकृत", "अस्वीकृत", "रद्द"
  reviewedAtISO?: string;
  reviewNoteNepali?: string;
  isAmountMismatch: boolean;
}

export interface EsewaIntegrationConfig {
  mode: 'manual' | 'merchant_api';
  merchantId?: string;
  secretKey?: string;
  isTestEnvironment?: boolean;
}

export interface UserSubscriptionAccount {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  currentPlanId: SubscriptionPlanId;
  trialStartedAtISO: string | null;
  trialExpiresAtISO: string | null;
  subscriptionStartedAtISO: string | null;
  subscriptionExpiresAtISO: string | null; // null for lifetime
  isSuspended: boolean;
  suspensionReasonNepali?: string;
  paymentHistory: PaymentRecord[];
  activePlatformMode: PlatformType;
}

export interface FeaturePermissionRule {
  featureKey: string;
  featureNameNepali: string;
  allowedPlans: SubscriptionPlanId[];
  descriptionNepali: string;
}

const STORAGE_KEY_USER_SUB = 'sukdev_user_subscription_account_v1';
const STORAGE_KEY_PLANS_CONFIG = 'sukdev_subscription_plans_config_v1';
const STORAGE_KEY_PRICING_CONFIG = 'sukdev_platform_pricing_config_v1';
const STORAGE_KEY_FEATURE_RULES = 'sukdev_feature_permissions_v1';
const STORAGE_KEY_GATEWAYS = 'sukdev_payment_gateways_v1';
const STORAGE_KEY_TRIAL_CONFIG = 'sukdev_trial_config_v1';

export interface TrialConfig {
  trialDurationHours: number; // Default: 168 hours (7 days)
  autoEnableOnRegistration: boolean;
  requiresCreditCard: boolean;
  welcomeNoteNepali: string;
}

export const DEFAULT_TRIAL_CONFIG: TrialConfig = {
  trialDurationHours: 168,
  autoEnableOnRegistration: false,
  requiresCreditCard: false,
  welcomeNoteNepali: 'श्री गणेशाय नमः! बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवाको ७ दिने निःशुल्क परीक्षणमा हार्दिक स्वागत छ।',
};

// Convert numbers to Nepali numerals
export function toNepaliDigits(num: number | string): string {
  const nepaliMap: { [key: string]: string } = {
    '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
    '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
  };
  return String(num).replace(/[0-9]/g, (digit) => nepaliMap[digit] || digit);
}

// Format currency as "रु. १०,०००"
export function formatNPRCurrency(amount: number): string {
  if (amount === 0) return 'निःशुल्क';
  const formattedNumber = Math.round(amount).toLocaleString('en-IN');
  return `रु. ${toNepaliDigits(formattedNumber)}`;
}

// Default Base Plans (Base Price = Computer Version 100%)
export const DEFAULT_PLANS: PlanConfig[] = [
  {
    id: 'free',
    nameNepali: 'निःशुल्क योजना',
    basePriceNPR: 0,
    basePriceFormattedNepali: 'निःशुल्क',
    durationLabelNepali: 'सीमित पहुँच',
    durationDays: null,
    descriptionNepali: 'आधारभूत पञ्चाङ्ग, १ वटा जन्मकुण्डली र सीमित फलादेश सुविधाहरू।',
  },
  {
    id: 'trial',
    nameNepali: '७ दिने पूर्ण परीक्षण',
    basePriceNPR: 0,
    basePriceFormattedNepali: 'रु. ० (निःशुल्क)',
    durationLabelNepali: '७ दिन',
    durationDays: 7,
    descriptionNepali: 'सबै सुविधाहरू ७ दिनका लागि पूर्ण रूपमा निःशुल्क परीक्षण गर्नुहोस्। (कुण्डली तथा नक्सा प्रिन्ट बाहेक)',
    badgeTagNepali: '७ दिने निःशुल्क परीक्षण',
  },
  {
    id: 'monthly',
    nameNepali: 'मासिक सदस्यता',
    basePriceNPR: 600,
    basePriceFormattedNepali: 'रु. ६००',
    durationLabelNepali: '१ महिना',
    durationDays: 30,
    descriptionNepali: 'प्रत्येक महिना नवीकरण गर्न सकिने सम्पूर्ण ज्योतिषीय सेवाहरूको पूर्ण पहुँच।',
  },
  {
    id: 'yearly',
    nameNepali: 'वार्षिक सदस्यता',
    basePriceNPR: 3000,
    basePriceFormattedNepali: 'रु. ३,०००',
    durationLabelNepali: '१ वर्ष',
    durationDays: 365,
    descriptionNepali: 'वार्षिक रूपमा ५०% सम्मको बचतसहित सबै डिजिटल पत्रिका, टिपण र वास्तु प्रतिवेदन।',
    badgeTagNepali: 'लोकप्रिय योजना',
  },
  {
    id: 'lifetime',
    nameNepali: 'आजीवन सदस्यता',
    basePriceNPR: 10000,
    basePriceFormattedNepali: 'रु. १०,०००',
    durationLabelNepali: 'आजीवन',
    durationDays: null,
    descriptionNepali: 'एकपटक मात्र भुक्तानी गर्नुहोस् र जीवनभर मोबाइल, वेब तथा कम्प्युटरमा सबै सुविधा चलाउनुहोस्।',
    badgeTagNepali: 'सर्वोत्तम आजीवन बचत',
  },
];

// Default Platform Pricing Config
export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  desktopPercent: 100, // Computer = 100%
  webPercent: 75,      // Web = 75%
  mobilePercent: 50,   // Mobile = 50%
  roundingRule: 'round',
};

// Initial Feature Permissions
export const DEFAULT_FEATURE_RULES: FeaturePermissionRule[] = [
  {
    featureKey: 'basic_panchanga',
    featureNameNepali: 'आधारभूत पञ्चाङ्ग तथा दैनिक सूर्योदय',
    allowedPlans: ['free', 'trial', 'monthly', 'yearly', 'lifetime'],
    descriptionNepali: 'दैनिक बार, तिथि, नक्षत्र, योग र करण',
  },
  {
    featureKey: 'basic_kundali',
    featureNameNepali: 'आधारभूत जन्मकुण्डली तथा लग्न',
    allowedPlans: ['free', 'trial', 'monthly', 'yearly', 'lifetime'],
    descriptionNepali: 'डी-१ जन्मकुण्डली तथा सामान्य ग्रह स्थिति',
  },
  {
    featureKey: 'unlimited_profiles',
    featureNameNepali: 'असीमित ग्राहक तथा जन्म विवरण अभिलेख',
    allowedPlans: ['trial', 'monthly', 'yearly', 'lifetime'],
    descriptionNepali: 'सयौँ ग्राहकका कुण्डलीहरू सुरक्षित राख्ने र खोज्ने सुविधा',
  },
  {
    featureKey: 'interactive_drishti_map',
    featureNameNepali: 'प्रत्यक्ष ग्रहदृष्टि नक्साङ्कन (Interactive Aspect Map)',
    allowedPlans: ['trial', 'monthly', 'yearly', 'lifetime'],
    descriptionNepali: 'कुण्डलीका ग्रहहरूमा स्पर्श गर्दा दृष्टि तीरहरू र भाव प्रभावित परिणाम',
  },
  {
    featureKey: 'patrika_china_print',
    featureNameNepali: 'डिजिटल चिना, टिपण तथा विवाह/व्रतबन्ध पत्रिका छाप्ने र pdf सुरक्षित गर्ने',
    allowedPlans: ['trial', 'monthly', 'yearly', 'lifetime'],
    descriptionNepali: 'संस्कृत तथा नेपाली भाषामा व्यावसायिक छापा योग्य पत्रिकाहरू',
  },
  {
    featureKey: 'vastu_complete_analysis',
    featureNameNepali: 'पूर्ण वैदिक वास्तुशास्त्र विश्लेषण तथा ३२ द्वार चक्र',
    allowedPlans: ['trial', 'monthly', 'yearly', 'lifetime'],
    descriptionNepali: 'गृह तथा व्यावसायिक भवनको दिशा, ३२ द्वार तथा ८ पद चक्र',
  },
  {
    featureKey: 'aarje_expert_records',
    featureNameNepali: 'आर्जे (Aarje) खोज तथा विशेषज्ञ अभिलेख प्रणाली',
    allowedPlans: ['trial', 'monthly', 'yearly', 'lifetime'],
    descriptionNepali: 'पुरातन ग्रन्थहरूबाट आर्जे नियम तथा अनुसन्धान खोज',
  },
  {
    featureKey: 'ai_astrologer_chat',
    featureNameNepali: 'AI ज्योतिषाचार्य सहायक परामर्श',
    allowedPlans: ['trial', 'monthly', 'yearly', 'lifetime'],
    descriptionNepali: 'AI द्वारा तत्काल ज्योतिषीय प्रश्नोत्तर तथा फलादेश',
  },
];

// Payment Gateways Config
export const DEFAULT_GATEWAYS: PaymentGatewayConfig[] = [
  {
    id: 'esewa',
    nameNepali: 'eSewa (ईसेवा डिजिटल वालेट)',
    logoIcon: '🟢',
    isEnabled: true,
    instructionsNepali: 'eSewa एपमार्फत सोझै भुक्तानी गरी तत्काल सदस्यता सक्रिय गर्नुहोस्।',
  },
  {
    id: 'khalti',
    nameNepali: 'Khalti (खल्ती डिजिटल वालेट)',
    logoIcon: '🟣',
    isEnabled: true,
    instructionsNepali: 'Khalti एप वा वेब बैंकिङमार्फत सुरक्षित भुक्तानी गर्नुहोस्।',
  },
  {
    id: 'imepay',
    nameNepali: 'IME Pay (आईएमई पे)',
    logoIcon: '🔴',
    isEnabled: true,
    instructionsNepali: 'IME Pay डिजिटल वालेटबाट सोझै रकमान्तर गर्नुहोस्।',
  },
  {
    id: 'bank_qr',
    nameNepali: 'नेपालका बैंकहरू (Fonepay / QR / बैंक ट्रान्सफर)',
    logoIcon: '🏦',
    isEnabled: true,
    instructionsNepali: 'कुनै पनि बैंक एपबाट Fonepay QR स्क्यान गरी वा सोझै खातामा भुक्तानी गर्नुहोस्।',
  },
  {
    id: 'connect_ips',
    nameNepali: 'connectIPS (नेपाल क्लियरिङ हाउस)',
    logoIcon: '🟦',
    isEnabled: true,
    instructionsNepali: 'connectIPS एकाउन्टबाट सिधै बैंक खातामार्फत भुक्तानी गर्नुहोस्।',
  },
];

// Helper to generate IDs
export function generateTxnNumber(): string {
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  const todayAD = new Date().toISOString().split('T')[0];
  const yearBS = convertADToBS(todayAD).year;
  return `SJS-TXN-${toNepaliDigits(yearBS)}-${toNepaliDigits(randomDigits)}`;
}

export function generateReceiptNumber(): string {
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  const todayAD = new Date().toISOString().split('T')[0];
  const yearBS = convertADToBS(todayAD).year;
  return `SJS-REC-${toNepaliDigits(yearBS)}-${toNepaliDigits(randomDigits)}`;
}

// Safe Platform Detector
export function detectCurrentPlatform(): PlatformType {
  if (typeof window === 'undefined') return 'desktop';
  const ua = (navigator.userAgent || '').toLowerCase();
  
  if (ua.includes('electron') || ua.includes('desktop_app')) {
    return 'desktop';
  }
  
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
  if (isMobileUA || (window.innerWidth <= 768 && 'ontouchstart' in window)) {
    return 'mobile';
  }

  return 'web';
}

export function getPlatformNameNepali(platform: PlatformType): string {
  switch (platform) {
    case 'desktop':
      return 'कम्प्युटर संस्करण';
    case 'web':
      return 'वेब संस्करण';
    case 'mobile':
      return 'मोबाइल संस्करण';
    default:
      return 'वेब संस्करण';
  }
}

// Pricing getters & setters
export function getStoredPricingConfig(): PricingConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRICING_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.desktopPercent === 'number') {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load pricing config:', e);
  }
  return DEFAULT_PRICING_CONFIG;
}

export function savePricingConfig(config: PricingConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_PRICING_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save pricing config:', e);
  }
}

export function getStoredTrialConfig(): TrialConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRIAL_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.trialDurationHours === 'number') {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load trial config:', e);
  }
  return DEFAULT_TRIAL_CONFIG;
}

export function saveTrialConfig(config: TrialConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_TRIAL_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save trial config:', e);
  }
}

export function checkIsTransactionCodeUsed(code: string, excludeRequestId?: string): boolean {
  if (!code || !code.trim()) return false;
  const requests = getStoredEsewaRequests();
  const cleanCode = code.trim().toLowerCase();
  return requests.some(
    (r) =>
      r.transactionCode.trim().toLowerCase() === cleanCode &&
      r.requestId !== excludeRequestId &&
      r.status !== 'cancelled' &&
      r.status !== 'rejected'
  );
}

// Calculate dynamic platform price based on Central Pricing Engine
export function calculatePlatformPrice(
  basePriceNPR: number,
  platform: PlatformType,
  pricingConfig: PricingConfig = getStoredPricingConfig()
): { amountNPR: number; formattedNepali: string; appliedPercent: number } {
  if (basePriceNPR === 0) {
    return { amountNPR: 0, formattedNepali: 'निःशुल्क', appliedPercent: 100 };
  }

  let percent = 100;
  if (platform === 'desktop') percent = pricingConfig.desktopPercent;
  else if (platform === 'web') percent = pricingConfig.webPercent;
  else if (platform === 'mobile') percent = pricingConfig.mobilePercent;

  const rawAmount = (basePriceNPR * percent) / 100;
  let finalAmount = Math.round(rawAmount);

  if (pricingConfig.roundingRule === 'floor') {
    finalAmount = Math.floor(rawAmount);
  } else if (pricingConfig.roundingRule === 'ceil') {
    finalAmount = Math.ceil(rawAmount);
  }

  return {
    amountNPR: finalAmount,
    formattedNepali: formatNPRCurrency(finalAmount),
    appliedPercent: percent,
  };
}

// Store getters & setters for plans and user sub
export function getStoredUserSubscription(): UserSubscriptionAccount {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER_SUB);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load user subscription account:', e);
  }

  const initial: UserSubscriptionAccount = {
    userId: `usr_sukdev_${Date.now()}`,
    fullName: 'श्रद्धेय प्रयोगकर्ता',
    email: 'user@sukdev.np',
    phone: '९८००००००००',
    currentPlanId: 'free',
    trialStartedAtISO: null,
    trialExpiresAtISO: null,
    subscriptionStartedAtISO: null,
    subscriptionExpiresAtISO: null,
    isSuspended: false,
    paymentHistory: [],
    activePlatformMode: detectCurrentPlatform(),
  };

  saveUserSubscription(initial);
  return initial;
}

export function saveUserSubscription(account: UserSubscriptionAccount): void {
  try {
    localStorage.setItem(STORAGE_KEY_USER_SUB, JSON.stringify(account));
  } catch (e) {
    console.error('Failed to save user subscription:', e);
  }
}

export function getStoredPlansConfig(): PlanConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLANS_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 5) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse plans config:', e);
  }
  return DEFAULT_PLANS;
}

export function savePlansConfig(plans: PlanConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PLANS_CONFIG, JSON.stringify(plans));
  } catch (e) {
    console.error('Failed to save plans config:', e);
  }
}

export function getStoredFeatureRules(): FeaturePermissionRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FEATURE_RULES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse feature rules:', e);
  }
  return DEFAULT_FEATURE_RULES;
}

export function saveFeatureRules(rules: FeaturePermissionRule[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_FEATURE_RULES, JSON.stringify(rules));
  } catch (e) {
    console.error('Failed to save feature rules:', e);
  }
}

export function getStoredGateways(): PaymentGatewayConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GATEWAYS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse payment gateways:', e);
  }
  return DEFAULT_GATEWAYS;
}

export function saveGateways(gateways: PaymentGatewayConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_GATEWAYS, JSON.stringify(gateways));
  } catch (e) {
    console.error('Failed to save payment gateways:', e);
  }
}

/**
 * Core Status Evaluator
 * Checks whether user subscription or 48-hour trial is currently active.
 * Handles auto-expiry of trial or monthly/yearly plans gracefully.
 */
export interface SubscriptionStatusEvaluation {
  effectivePlanId: SubscriptionPlanId;
  planNameNepali: string;
  isActive: boolean;
  isTrial: boolean;
  isTrialExpired: boolean;
  isSubscriptionExpired: boolean;
  isLifetime: boolean;
  remainingDays: number | null;
  remainingHoursInTrial: number | null;
  expiresDateBS: string | null;
  formattedMessageNepali: string;
}

export function evaluateSubscriptionStatus(): SubscriptionStatusEvaluation {
  const account = getStoredUserSubscription();
  const plans = getStoredPlansConfig();
  const nowMs = Date.now();

  // 1. Account Suspended Check
  if (account.isSuspended) {
    return {
      effectivePlanId: 'free',
      planNameNepali: 'खाता निलम्बित',
      isActive: false,
      isTrial: false,
      isTrialExpired: false,
      isSubscriptionExpired: true,
      isLifetime: false,
      remainingDays: 0,
      remainingHoursInTrial: null,
      expiresDateBS: null,
      formattedMessageNepali: account.suspensionReasonNepali || 'तपाईंको खाता प्रशासकद्वारा निलम्बित गरिएको छ।',
    };
  }

  // 2. Active Subscription Check (Lifetime, Monthly, Yearly)
  if (account.currentPlanId === 'lifetime') {
    return {
      effectivePlanId: 'lifetime',
      planNameNepali: 'आजीवन सदस्यता',
      isActive: true,
      isTrial: false,
      isTrialExpired: false,
      isSubscriptionExpired: false,
      isLifetime: true,
      remainingDays: null,
      remainingHoursInTrial: null,
      expiresDateBS: 'आजीवन',
      formattedMessageNepali: 'तपाईंको आजीवन सदस्यता सक्रिय छ। मोबाइल, वेब र कम्प्युटर तीनै प्लेटफर्ममा सबै सुविधा उपलब्ध छन्।',
    };
  }

  if ((account.currentPlanId === 'monthly' || account.currentPlanId === 'yearly') && account.subscriptionExpiresAtISO) {
    const expireMs = new Date(account.subscriptionExpiresAtISO).getTime();
    if (nowMs < expireMs) {
      const remainingMs = expireMs - nowMs;
      const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
      const expAD = account.subscriptionExpiresAtISO.split('T')[0];
      const expBS = convertADToBS(expAD).formattedBS;

      const planObj = plans.find((p) => p.id === account.currentPlanId);
      const planName = planObj ? planObj.nameNepali : 'सशुल्क सदस्यता';

      return {
        effectivePlanId: account.currentPlanId,
        planNameNepali: planName,
        isActive: true,
        isTrial: false,
        isTrialExpired: false,
        isSubscriptionExpired: false,
        isLifetime: false,
        remainingDays,
        remainingHoursInTrial: null,
        expiresDateBS: expBS,
        formattedMessageNepali: remainingDays <= 7
          ? `तपाईंको सदस्यता समाप्त हुन अब ${toNepaliDigits(remainingDays)} दिन मात्र बाँकी छ।`
          : `तपाईंको ${planName} सक्रिय छ (समाप्ति मिति: ${expBS})।`,
      };
    } else {
      const expAD = account.subscriptionExpiresAtISO.split('T')[0];
      const expBS = convertADToBS(expAD).formattedBS;
      return {
        effectivePlanId: 'free',
        planNameNepali: 'सदस्यता समाप्त (निःशुल्क योजना)',
        isActive: false,
        isTrial: false,
        isTrialExpired: false,
        isSubscriptionExpired: true,
        isLifetime: false,
        remainingDays: 0,
        remainingHoursInTrial: null,
        expiresDateBS: expBS,
        formattedMessageNepali: 'तपाईंको सदस्यता अवधि पूरा भएको छ। पुनः सेवा प्राप्त गर्न नयाँ सदस्यता योजना खरिद गर्नुहोस्।',
      };
    }
  }

  // 3. 7-Day Trial Check
  if (account.currentPlanId === 'trial' && account.trialStartedAtISO) {
    const trialStartMs = new Date(account.trialStartedAtISO).getTime();
    const trialDurationMs = 7 * 24 * 60 * 60 * 1000; // Exactly 7 Days = 168 Hours
    const trialExpireMs = trialStartMs + trialDurationMs;

    if (nowMs < trialExpireMs) {
      const remainingMs = trialExpireMs - nowMs;
      const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
      const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
      const expAD = new Date(trialExpireMs).toISOString().split('T')[0];
      const expBS = convertADToBS(expAD).formattedBS;

      const timeText = remainingDays > 0 
        ? `${toNepaliDigits(remainingDays)} दिन ${toNepaliDigits(remainingHours % 24)} घण्टा`
        : `${toNepaliDigits(remainingHours)} घण्टा`;

      return {
        effectivePlanId: 'trial',
        planNameNepali: '७ दिने पूर्ण निःशुल्क परीक्षण',
        isActive: true,
        isTrial: true,
        isTrialExpired: false,
        isSubscriptionExpired: false,
        isLifetime: false,
        remainingDays,
        remainingHoursInTrial: remainingHours,
        expiresDateBS: expBS,
        formattedMessageNepali: `तपाईंको ७ दिने पूर्ण सफ्टवेयर परीक्षण (Full Access) सक्रिय छ। बाँकी समय: ${timeText}।`,
      };
    } else {
      return {
        effectivePlanId: 'free',
        planNameNepali: '७ दिने परीक्षण समाप्त',
        isActive: false,
        isTrial: false,
        isTrialExpired: true,
        isSubscriptionExpired: true,
        isLifetime: false,
        remainingDays: 0,
        remainingHoursInTrial: 0,
        expiresDateBS: null,
        formattedMessageNepali: 'तपाईंको ७ दिने निःशुल्क परीक्षण अवधि समाप्त भएको छ। सम्पूर्ण ज्योतिष तथा वास्तु सुविधाहरू प्रयोग गर्न सदस्यता खरिद गर्नुहोस्।',
      };
    }
  }

  // Default Free Tier
  return {
    effectivePlanId: 'free',
    planNameNepali: 'निःशुल्क योजना',
    isActive: true,
    isTrial: false,
    isTrialExpired: false,
    isSubscriptionExpired: false,
    isLifetime: false,
    remainingDays: null,
    remainingHoursInTrial: null,
    expiresDateBS: 'असीमित',
    formattedMessageNepali: 'तपाईं हाल आधारभूत निःशुल्क योजना प्रयोग गर्दै हुनुहुन्छ।',
  };
}

/**
 * Start 7-Day Free Trial (Full software access for Jyotish & Vastu)
 */
export function start7DayTrial(): UserSubscriptionAccount {
  const account = getStoredUserSubscription();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Exactly 7 days (168 hours)

  const updated: UserSubscriptionAccount = {
    ...account,
    currentPlanId: 'trial',
    trialStartedAtISO: now.toISOString(),
    trialExpiresAtISO: expiresAt.toISOString(),
  };

  saveUserSubscription(updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('software-trial-updated', { 
      detail: { isTrial: true, expiresAtISO: expiresAt.toISOString() } 
    }));
    window.dispatchEvent(new CustomEvent('software-full-access-updated', { 
      detail: { hasFullAccess: true } 
    }));
  }
  return updated;
}

export const start3DayTrial = start7DayTrial;
export const start48HourTrial = start7DayTrial;

/**
 * Check if 3-day trial is currently active
 */
export function is3DayTrialActive(): boolean {
  const status = evaluateSubscriptionStatus();
  return status.isActive && status.isTrial;
}

export const is7DayTrialActive = is3DayTrialActive;

/**
 * Check if the user is eligible to start 7-day trial (has not activated it yet)
 */
export function isTrialEligible(): boolean {
  const account = getStoredUserSubscription();
  return !account.trialStartedAtISO && account.currentPlanId === 'free';
}

/**
 * Check if printing/exporting is permitted for this user.
 * Note: Only Jyotish Patrika Print ('kundali') and Vastu Report ('vastu') are subject to subscription/trial lock.
 * ALL other documents (including Baidik Pasal payment vouchers, receipts, invoices, books, etc.) are 100% FREE!
 */
export function canUserPrintDocuments(docType?: 'kundali' | 'vastu' | 'general'): { allowed: boolean; reasonNepali: string } {
  if (typeof window === 'undefined') return { allowed: true, reasonNepali: '' };

  // 1. Any non-astrology document (Baidik Pasal payment voucher, receipts, etc.) is ALWAYS 100% FREE!
  if (docType !== 'kundali' && docType !== 'vastu') {
    return { allowed: true, reasonNepali: '' };
  }

  // 2. Direct Software Full Access License Key
  if (isSoftwareFullAccessUnlocked()) {
    return { allowed: true, reasonNepali: '' };
  }

  // 3. SuperAdmin / Admin check from RBAC or Admin Control session
  try {
    const rbacRaw = localStorage.getItem('balananda_rbac_active_session_v1');
    if (rbacRaw) {
      const session = JSON.parse(rbacRaw);
      if (session.role === 'SUPER_ADMIN' || session.role === 'STORE_ADMIN' || session.role === 'POS_STAFF') {
        return { allowed: true, reasonNepali: '' };
      }
    }
  } catch {}

  try {
    const adminRaw = localStorage.getItem('balananda_admin_active_session_v1');
    if (adminRaw) {
      const admin = JSON.parse(adminRaw);
      if (admin && admin.role) {
        return { allowed: true, reasonNepali: '' };
      }
    }
  } catch {}

  // 4. Subscription status
  const status = evaluateSubscriptionStatus();
  if (status.isActive && !status.isTrial && (status.effectivePlanId === 'monthly' || status.effectivePlanId === 'yearly' || status.effectivePlanId === 'lifetime')) {
    return { allowed: true, reasonNepali: '' };
  }

  // 5. Trial Mode restriction (strictly for Kundali and Vastu only)
  if (status.isActive && status.isTrial) {
    const featureName = docType === 'kundali' ? 'कुण्डली तथा चिना' : 'वास्तु नक्सा तथा प्रतिवेदन';
    return {
      allowed: false,
      reasonNepali: `निःशुल्क ७ दिने परीक्षण (Trial) मा ${featureName} प्रिन्ट वा PDF डाउनलोड गर्ने सुविधा उपलब्ध छैन। आधिकारिक प्रिन्ट गर्नका लागि कृपया पूर्ण सदस्यता लिनुहोस्।`
    };
  }

  // 6. Free or Expired
  return {
    allowed: false,
    reasonNepali: 'कुण्डली तथा वास्तु नक्सा प्रिन्ट गर्नका लागि आधिकारिक सदस्यता आवश्यक पर्दछ।'
  };
}

/**
 * Process Paid Subscription Purchase
 * Calculates dynamic price based on platformMode and central pricing config
 * Prevents duplicate purchases if active subscription exists.
 */
export function processPlanPurchase(
  planId: 'monthly' | 'yearly' | 'lifetime',
  paymentMethodKey: string,
  paymentMethodNepali: string,
  platformMode: PlatformType = 'web',
  forceSimulatedFailure: boolean = false
): { success: boolean; messageNepali: string; receipt?: PaymentRecord; isAlreadyActive?: boolean } {
  const account = getStoredUserSubscription();
  const plans = getStoredPlansConfig();
  const pricingConfig = getStoredPricingConfig();
  const plan = plans.find((p) => p.id === planId);

  // Check active subscription duplicate guard
  const status = evaluateSubscriptionStatus();
  if (status.isActive && (account.currentPlanId === 'monthly' || account.currentPlanId === 'yearly' || account.currentPlanId === 'lifetime')) {
    return {
      success: false,
      messageNepali: 'तपाईंको खातामा हाल सक्रिय सदस्यता रहेको छ। पुनः दोहोरो खरिद गर्नु पर्दैन।',
      isAlreadyActive: true,
    };
  }

  if (!plan) {
    return {
      success: false,
      messageNepali: 'अमान्य सदस्यता योजना चयन गरियो।',
    };
  }

  if (forceSimulatedFailure) {
    return {
      success: false,
      messageNepali: 'भुक्तानी सफल हुन सकेन। कृपया पुनः प्रयास गर्नुहोस्।',
    };
  }

  // Server-side / engine calculated final price based on platform
  const calcPrice = calculatePlatformPrice(plan.basePriceNPR, platformMode, pricingConfig);

  const now = new Date();
  const nowISO = now.toISOString();
  const todayAD = nowISO.split('T')[0];
  const todayBS = convertADToBS(todayAD).formattedBS;
  const timeStr = `${toNepaliDigits(now.getHours().toString().padStart(2, '0'))}:${toNepaliDigits(now.getMinutes().toString().padStart(2, '0'))}`;

  let expireISO: string | null = null;
  let periodEndBS = 'आजीवन';

  if (planId === 'monthly') {
    const expDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    expireISO = expDate.toISOString();
    periodEndBS = convertADToBS(expDate.toISOString().split('T')[0]).formattedBS;
  } else if (planId === 'yearly') {
    const expDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    expireISO = expDate.toISOString();
    periodEndBS = convertADToBS(expDate.toISOString().split('T')[0]).formattedBS;
  }

  const txnId = generateTxnNumber();
  const receiptNo = generateReceiptNumber();

  const newReceipt: PaymentRecord = {
    txnId,
    receiptNo,
    planId,
    planNameNepali: plan.nameNepali,
    platformMode,
    platformNameNepali: getPlatformNameNepali(platformMode),
    basePriceNPR: plan.basePriceNPR,
    basePriceFormattedNepali: plan.basePriceFormattedNepali,
    appliedPercent: calcPrice.appliedPercent,
    amountNPR: calcPrice.amountNPR,
    amountFormattedNepali: calcPrice.formattedNepali,
    dateAD: todayAD,
    dateBS: todayBS,
    timeStr,
    paymentMethodNepali,
    paymentMethodKey,
    status: 'success',
    periodStartBS: todayBS,
    periodEndBS,
  };

  const updatedAccount: UserSubscriptionAccount = {
    ...account,
    currentPlanId: planId,
    subscriptionStartedAtISO: nowISO,
    subscriptionExpiresAtISO: expireISO,
    activePlatformMode: platformMode,
    paymentHistory: [newReceipt, ...account.paymentHistory],
  };

  saveUserSubscription(updatedAccount);

  return {
    success: true,
    messageNepali: 'तपाईंको सदस्यता सफलतापूर्वक सक्रिय भएको छ। तीनै प्लेटफर्म (मोबाइल, वेब र कम्प्युटर) मा पूर्ण पहुँच उपलब्ध छ।',
    receipt: newReceipt,
  };
}

/**
 * Check if a specific feature is allowed for current subscription state
 */
export function isFeatureAllowed(featureKey: string): boolean {
  const status = evaluateSubscriptionStatus();
  const rules = getStoredFeatureRules();
  const rule = rules.find((r) => r.featureKey === featureKey);

  if (!rule) return true;
  return rule.allowedPlans.includes(status.effectivePlanId);
}

/* ==========================================================================
   eSewa Manual Verification & Integration Store
   ========================================================================== */

const STORAGE_KEY_ESEWA_REQUESTS = 'sukdev_esewa_payment_requests_v1';
const STORAGE_KEY_ESEWA_CONFIG = 'sukdev_esewa_integration_config_v1';

export const DEFAULT_ESEWA_CONFIG: EsewaIntegrationConfig = {
  mode: 'manual',
  merchantId: 'EPAYTEST',
  secretKey: '8gAkyRykSAsA',
  isTestEnvironment: true,
};

export const INITIAL_DEMO_ESEWA_REQUESTS: EsewaPaymentRequest[] = [
  {
    requestId: 'ESW-२०८३-९८२४',
    userId: 'usr_sukdev_demo_1',
    userName: 'रामचन्द्र शर्मा (नमूना)',
    userEmail: 'ramchandra@example.com',
    userPhone: '९८४१२३४५६७',
    planId: 'yearly',
    planNameNepali: 'वार्षिक सदस्यता',
    platformMode: 'web',
    platformNameNepali: 'वेब संस्करण',
    expectedAmountNPR: 2250,
    expectedAmountFormattedNepali: 'रु. २,२५०',
    submittedAmountNPR: 2250,
    submittedAmountFormattedNepali: 'रु. २,२५०',
    transactionCode: 'ESW98210349',
    paymentDateBS: '२०८३/०४/२०',
    paymentDateAD: '2026-08-05',
    proofNoteOrImage: 'eSewa बाट रु. २२५० रकमान्तर गरियो। ट्रान्सफर रिफरेन्स: ESW98210349',
    submittedAtISO: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'pending',
    statusNepali: 'प्रमाणीकरण बाँकी',
    isAmountMismatch: false,
  },
];

export function getStoredEsewaRequests(): EsewaPaymentRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ESEWA_REQUESTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load eSewa payment requests:', e);
  }
  return INITIAL_DEMO_ESEWA_REQUESTS;
}

export function saveEsewaRequests(requests: EsewaPaymentRequest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ESEWA_REQUESTS, JSON.stringify(requests));
  } catch (e) {
    console.error('Failed to save eSewa payment requests:', e);
  }
}

export function getStoredEsewaConfig(): EsewaIntegrationConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ESEWA_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.mode) return parsed;
    }
  } catch (e) {
    console.error('Failed to load eSewa config:', e);
  }
  return DEFAULT_ESEWA_CONFIG;
}

export function saveEsewaConfig(config: EsewaIntegrationConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_ESEWA_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save eSewa config:', e);
  }
}

export function submitEsewaPaymentRequest(params: {
  planId: 'monthly' | 'yearly' | 'lifetime';
  platformMode: PlatformType;
  transactionCode: string;
  submittedAmountNPR: number;
  paymentDateBS: string;
  proofNoteOrImage: string;
}): { success: boolean; messageNepali: string; request?: EsewaPaymentRequest } {
  const account = getStoredUserSubscription();
  const plans = getStoredPlansConfig();
  const pricingConfig = getStoredPricingConfig();

  const plan = plans.find((p) => p.id === params.planId);
  if (!plan) {
    return { success: false, messageNepali: 'अमान्य सदस्यता योजना चयन गरियो।' };
  }

  if (!params.transactionCode || params.transactionCode.trim().length === 0) {
    return { success: false, messageNepali: 'कृपया eSewa कारोबार क्रमाङ्क (Transaction Code) अनिवार्य राख्नुहोस्।' };
  }

  const calc = calculatePlatformPrice(plan.basePriceNPR, params.platformMode, pricingConfig);
  const isAmountMismatch = params.submittedAmountNPR !== calc.amountNPR;

  const now = new Date();
  const nowISO = now.toISOString();
  const todayAD = nowISO.split('T')[0];
  const todayBS = params.paymentDateBS || convertADToBS(todayAD).formattedBS;

  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const requestId = `ESW-${toNepaliDigits(convertADToBS(todayAD).year)}-${toNepaliDigits(randomDigits)}`;

  const newRequest: EsewaPaymentRequest = {
    requestId,
    userId: account.userId,
    userName: account.fullName,
    userEmail: account.email,
    userPhone: account.phone,
    planId: params.planId,
    planNameNepali: plan.nameNepali,
    platformMode: params.platformMode,
    platformNameNepali: getPlatformNameNepali(params.platformMode),
    expectedAmountNPR: calc.amountNPR,
    expectedAmountFormattedNepali: calc.formattedNepali,
    submittedAmountNPR: params.submittedAmountNPR,
    submittedAmountFormattedNepali: formatNPRCurrency(params.submittedAmountNPR),
    transactionCode: params.transactionCode.trim(),
    paymentDateBS: todayBS,
    paymentDateAD: todayAD,
    proofNoteOrImage: params.proofNoteOrImage || 'कारोबार विवरण पेश गरियो',
    submittedAtISO: nowISO,
    status: 'pending',
    statusNepali: 'प्रमाणीकरण बाँकी',
    isAmountMismatch,
  };

  const existingRequests = getStoredEsewaRequests();
  const updatedRequests = [newRequest, ...existingRequests];
  saveEsewaRequests(updatedRequests);

  return {
    success: true,
    messageNepali: 'तपाईंको eSewa भुक्तानी प्रमाण सफलतापूर्वक दर्ता भएको छ। प्रशासकद्वारा प्रमाणीकरण भएपछि मात्र सदस्यता सक्रिय हुनेछ।',
    request: newRequest,
  };
}

export function approveEsewaPaymentRequest(
  requestId: string,
  reviewNote: string = 'प्रशासकद्वारा भुक्तानी प्रमाण स्वीकृत गरियो'
): { success: boolean; messageNepali: string } {
  const requests = getStoredEsewaRequests();
  const targetIndex = requests.findIndex((r) => r.requestId === requestId);

  if (targetIndex === -1) {
    return { success: false, messageNepali: 'उक्त भुक्तानी प्रमाण भेटिएन।' };
  }

  const req = requests[targetIndex];
  if (req.status === 'approved') {
    return { success: false, messageNepali: 'यो भुक्तानी पहिले नै स्वीकृत भइसकेको छ।' };
  }

  const now = new Date();
  const nowISO = now.toISOString();
  const todayAD = nowISO.split('T')[0];
  const todayBS = convertADToBS(todayAD).formattedBS;
  const timeStr = `${toNepaliDigits(now.getHours().toString().padStart(2, '0'))}:${toNepaliDigits(now.getMinutes().toString().padStart(2, '0'))}`;

  let expireISO: string | null = null;
  let periodEndBS = 'आजीवन';

  if (req.planId === 'monthly') {
    const expDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    expireISO = expDate.toISOString();
    periodEndBS = convertADToBS(expDate.toISOString().split('T')[0]).formattedBS;
  } else if (req.planId === 'yearly') {
    const expDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    expireISO = expDate.toISOString();
    periodEndBS = convertADToBS(expDate.toISOString().split('T')[0]).formattedBS;
  }

  req.status = 'approved';
  req.statusNepali = 'स्वीकृत';
  req.reviewedAtISO = nowISO;
  req.reviewNoteNepali = reviewNote;

  requests[targetIndex] = req;
  saveEsewaRequests(requests);

  const account = getStoredUserSubscription();

  const txnId = generateTxnNumber();
  const receiptNo = generateReceiptNumber();

  const newReceipt: PaymentRecord = {
    txnId,
    receiptNo,
    planId: req.planId,
    planNameNepali: req.planNameNepali,
    platformMode: req.platformMode,
    platformNameNepali: req.platformNameNepali,
    basePriceNPR: req.expectedAmountNPR,
    basePriceFormattedNepali: req.expectedAmountFormattedNepali,
    appliedPercent: Math.round((req.submittedAmountNPR / (req.expectedAmountNPR || 1)) * 100),
    amountNPR: req.submittedAmountNPR,
    amountFormattedNepali: req.submittedAmountFormattedNepali,
    dateAD: todayAD,
    dateBS: todayBS,
    timeStr,
    paymentMethodNepali: 'eSewa (ईसेवा)',
    paymentMethodKey: 'esewa',
    status: 'success',
    periodStartBS: todayBS,
    periodEndBS,
  };

  const updatedAccount: UserSubscriptionAccount = {
    ...account,
    currentPlanId: req.planId,
    subscriptionStartedAtISO: nowISO,
    subscriptionExpiresAtISO: expireISO,
    activePlatformMode: req.platformMode,
    paymentHistory: [newReceipt, ...account.paymentHistory],
  };

  saveUserSubscription(updatedAccount);

  return {
    success: true,
    messageNepali: 'तपाईंको eSewa भुक्तानी सफलतापूर्वक प्रमाणित भएको छ। तपाईंको सदस्यता सक्रिय गरिएको छ।',
  };
}

export function rejectEsewaPaymentRequest(
  requestId: string,
  reviewNote: string = 'भुक्तानी प्रमाण अमान्य वा रकम नमिलेको'
): { success: boolean; messageNepali: string } {
  const requests = getStoredEsewaRequests();
  const targetIndex = requests.findIndex((r) => r.requestId === requestId);

  if (targetIndex === -1) {
    return { success: false, messageNepali: 'उक्त भुक्तानी प्रमाण भेटिएन।' };
  }

  const req = requests[targetIndex];
  req.status = 'rejected';
  req.statusNepali = 'अस्वीकृत';
  req.reviewedAtISO = new Date().toISOString();
  req.reviewNoteNepali = reviewNote;

  requests[targetIndex] = req;
  saveEsewaRequests(requests);

  return {
    success: true,
    messageNepali: 'तपाईंको भुक्तानी प्रमाण प्रमाणित हुन सकेन। कृपया विवरण जाँच गरी पुनः प्रयास गर्नुहोस्।',
  };
}

export function cancelEsewaPaymentRequest(
  requestId: string
): { success: boolean; messageNepali: string } {
  const requests = getStoredEsewaRequests();
  const targetIndex = requests.findIndex((r) => r.requestId === requestId);

  if (targetIndex === -1) {
    return { success: false, messageNepali: 'उक्त भुक्तानी प्रमाण भेटिएन।' };
  }

  const req = requests[targetIndex];
  req.status = 'cancelled';
  req.statusNepali = 'रद्द';
  req.reviewedAtISO = new Date().toISOString();

  requests[targetIndex] = req;
  saveEsewaRequests(requests);

  return {
    success: true,
    messageNepali: 'भुक्तानी अनुरोध रद्द गरिएको छ।',
  };
}

/**
 * Check if the current user has unlocked Software Full Access
 */
export function isSoftwareFullAccessUnlocked(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const directLicense = localStorage.getItem(SOFTWARE_FULL_ACCESS_KEY);
    if (directLicense === 'true') return true;

    // Check subscription state
    const sub = getStoredUserSubscription();
    if (sub && (sub.currentPlanId === 'lifetime' || sub.currentPlanId === 'yearly' || sub.currentPlanId === 'monthly')) {
      const status = evaluateSubscriptionStatus();
      if (status.isActive) return true;
    }
  } catch (e) {
    console.error('Error reading software full access status:', e);
  }
  return false;
}

/**
 * Activate Software Full Access License
 */
export function activateSoftwareFullAccess(
  plan: 'lifetime' | 'yearly' = 'lifetime',
  txnCode?: string,
  method: 'esewa' | 'khalti' = 'esewa'
): { success: boolean; messageNepali: string } {
  if (typeof window === 'undefined') return { success: false, messageNepali: 'अमान्य वातावरण' };
  try {
    localStorage.setItem(SOFTWARE_FULL_ACCESS_KEY, 'true');
    const paymentMethodLabel = method === 'esewa' 
      ? `eSewa ID: ${PAYMENT_RECIPIENT_FULL_ID}` 
      : `Khalti ID: ${PAYMENT_RECIPIENT_FULL_ID}`;
    
    // Also record purchase in subscription store
    processPlanPurchase(
      plan,
      method,
      paymentMethodLabel,
      'web'
    );

    window.dispatchEvent(new CustomEvent('software-full-access-updated', { detail: { hasFullAccess: true } }));

    return {
      success: true,
      messageNepali: 'सफ्टवेयरको पूर्ण अधिकार (Full Access) सफलतापूर्वक सक्रिय भयो!'
    };
  } catch (e) {
    console.error('Error activating software full access:', e);
    return {
      success: false,
      messageNepali: 'पूर्ण अधिकार सक्रिय गर्दा समस्या आयो।'
    };
  }
}

/**
 * Revoke Software Full Access License
 */
export function revokeSoftwareFullAccess(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SOFTWARE_FULL_ACCESS_KEY);
    window.dispatchEvent(new CustomEvent('software-full-access-updated', { detail: { hasFullAccess: false } }));
  } catch (e) {
    console.error('Error revoking full access:', e);
  }
}

export interface SubscriptionBadgeInfo {
  text: string;
  isPurchased: boolean;
  tooltip: string;
  clientName?: string;
  planName?: string;
}

/**
 * Get dynamic heading badge information based on purchase/license status:
 * - '[Client Name] • One Year' for 1-year purchases
 * - '[Client Name] • Life Time' for lifetime purchases
 * - 'Full Version' for other unlocked purchases/licenses
 * - 'Demo' for unpurchased free/trial accounts
 */
export function getSubscriptionBadgeInfo(): SubscriptionBadgeInfo {
  if (typeof window === 'undefined') {
    return { text: 'Demo', isPurchased: false, tooltip: 'डेमो संस्करण' };
  }

  try {
    const status = evaluateSubscriptionStatus();
    const account = getStoredUserSubscription();
    const isDirectLicense = isSoftwareFullAccessUnlocked();

    // Check approved client license from clientLeadStore
    try {
      const approvedLicenseRaw = localStorage.getItem('balananda_approved_client_license_v2');
      if (approvedLicenseRaw) {
        const lic = JSON.parse(approvedLicenseRaw);
        if (lic && lic.isApproved) {
          const rawClient = (lic.clientName || '').trim();
          const isGeneric = rawClient.includes('प्रमाणित ग्राहक') || rawClient.includes('Verified Client');
          const clientName = isGeneric ? '' : rawClient;
          const planPrefix = lic.planId?.startsWith('lifetime') ? 'Life Time' : 'One Year';
          const badgeText = clientName ? `${clientName} • ${planPrefix}` : planPrefix;
          return {
            text: badgeText,
            isPurchased: true,
            clientName,
            planName: planPrefix,
            tooltip: `${clientName ? clientName + ' - ' : ''}${planPrefix === 'Life Time' ? 'आजीवन' : '१ वर्षे'} पूर्ण सदस्यता सक्रिय छ (${planPrefix})`,
          };
        }
      }
    } catch {}

    // 1. Life Time purchase
    if (status.isLifetime || status.effectivePlanId === 'lifetime' || account?.currentPlanId === 'lifetime') {
      return {
        text: 'Life Time',
        isPurchased: true,
        tooltip: 'आजीवन पूर्ण सदस्यता सक्रिय छ (Life Time Access)',
      };
    }

    // 2. One Year purchase
    if (
      (status.effectivePlanId === 'yearly' && status.isActive && !status.isSubscriptionExpired) ||
      (account?.currentPlanId === 'yearly' && (status.isActive || isDirectLicense))
    ) {
      return {
        text: 'One Year',
        isPurchased: true,
        tooltip: '१ वर्षे पूर्ण सदस्यता सक्रिय छ (One Year Subscription)',
      };
    }

    // 3. Direct Full Access License or monthly
    if (isDirectLicense) {
      return {
        text: 'Full Version',
        isPurchased: true,
        tooltip: 'सफ्टवेयरको पूर्ण संस्करण सक्रिय छ (Full Version)',
      };
    }

    if (status.isActive && !status.isTrial && status.effectivePlanId === 'monthly') {
      return {
        text: 'Full Version',
        isPurchased: true,
        tooltip: 'मासिक पूर्ण सदस्यता सक्रिय छ (Full Version)',
      };
    }

    // 4. Default: Demo (Free or Trial)
    return {
      text: 'Demo',
      isPurchased: false,
      tooltip: 'डेमो / परीक्षण संस्करण (पूर्ण संस्करण खरिद गर्न क्लिक गर्नुहोस्)',
    };
  } catch (e) {
    return {
      text: 'Demo',
      isPurchased: false,
      tooltip: 'डेमो संस्करण',
    };
  }
}

