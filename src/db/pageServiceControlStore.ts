import { convertADToBS } from '../utils/nepaliCalendar';
import { checkFeatureAccess } from './menuControlStore';

export type PageStatus = 'active' | 'maintenance' | 'disabled';
export type AccessLevel = 'public' | 'registered_only' | 'paid_only' | 'admin_only';

export interface PageControlItem {
  id: string;
  tabKey: string;
  titleNepali: string;
  titleEnglish: string;
  category: 'core' | 'vedic' | 'matrimony' | 'content' | 'commerce' | 'utility';
  icon: string;
  status: PageStatus;
  accessLevel: AccessLevel;
  hideInNavigation: boolean;
  maintenanceMessage?: string;
  badge?: string;
  descriptionNepali: string;
}

export interface ServiceControlItem {
  id: string;
  nameNepali: string;
  nameEnglish: string;
  category: 'jyotish' | 'vastu' | 'purohit' | 'vivah' | 'store' | 'dispatch';
  isEnabled: boolean;
  isBookingOpen: boolean;
  baseFeeNPR: number;
  allowOnlinePayment: boolean;
  autoAssignExperts: boolean;
  descriptionNepali: string;
  badge?: string;
}

export interface GlobalNoticeConfig {
  isEnabled: boolean;
  type: 'info' | 'warning' | 'emergency' | 'festive';
  titleNepali: string;
  messageNepali: string;
  actionText?: string;
  actionTab?: string;
  dismissible: boolean;
}

export interface PageServiceMasterConfig {
  pages: PageControlItem[];
  services: ServiceControlItem[];
  globalNotice: GlobalNoticeConfig;
  lastUpdatedBS: string;
  updatedBy: string;
}

const STORAGE_KEY = 'balananda_page_service_control_v1';

export const DEFAULT_PAGES: PageControlItem[] = [
  {
    id: 'page_dashboard',
    tabKey: 'dashboard',
    titleNepali: 'गृहपृष्ठ (Dashboard)',
    titleEnglish: 'Home Dashboard',
    category: 'core',
    icon: 'Home',
    status: 'active',
    accessLevel: 'public',
    hideInNavigation: false,
    descriptionNepali: 'केन्द्रीय गृहपृष्ठ, दैनिक पञ्चाङ्ग सारांश र मुख्य सेवाहरूमा त्वरित पहुँच।'
  },
  {
    id: 'page_panchanga',
    tabKey: 'panchanga',
    titleNepali: 'वैदिक पञ्चाङ्ग तथा पात्रो',
    titleEnglish: 'Nepali Panchanga & Patro',
    category: 'core',
    icon: 'Clock',
    status: 'active',
    accessLevel: 'public',
    hideInNavigation: false,
    badge: 'दैनिक',
    descriptionNepali: 'दैनिक पञ्चाङ्ग, तिथि, नक्षत्र, योग, करण, चाडपर्व र घडीपला गणना।'
  },
  {
    id: 'page_jyotish',
    tabKey: 'jyotishi',
    titleNepali: 'वैदिक ज्योतिष कार्यक्षेत्र',
    titleEnglish: 'Jyotish Workspace & Kundali',
    category: 'vedic',
    icon: 'Sparkles',
    status: 'active',
    accessLevel: 'paid_only',
    hideInNavigation: false,
    badge: 'विशेष',
    descriptionNepali: 'विस्तृत कुण्डली चक्र, भाव, विंशोत्तरी दशा, गोचर, नवतारा र अष्टकवर्ग।'
  },
  {
    id: 'page_vastu',
    tabKey: 'vastu',
    titleNepali: 'वैदिक वास्तुशास्त्र कन्सल्टेन्सी',
    titleEnglish: 'Vastu Shastra Consultation',
    category: 'vedic',
    icon: 'Compass',
    status: 'active',
    accessLevel: 'paid_only',
    hideInNavigation: false,
    badge: '३६०°',
    descriptionNepali: '३६०° कम्पास, ८१-पद वास्तुपुरुष मण्डल, भूमि परीक्षण र संरचना अडिट।'
  },
  {
    id: 'page_vivah',
    tabKey: 'vivah',
    titleNepali: 'विवाह मञ्च (Matrimony)',
    titleEnglish: 'Vedic Vivah Portal',
    category: 'matrimony',
    icon: 'HeartHandshake',
    status: 'active',
    accessLevel: 'public',
    hideInNavigation: false,
    badge: 'लोकप्रिय',
    descriptionNepali: 'वैदिक विवाह प्रोफाइल दर्ता, ३६ गुण कुण्डली मिलान र अभिभावक सम्पर्क।'
  },
  {
    id: 'page_sewa',
    tabKey: 'sewa',
    titleNepali: 'वैदिक सेवा तथा पुरोहित बुकिङ',
    titleEnglish: 'Vedic Services & Booking',
    category: 'vedic',
    icon: 'Briefcase',
    status: 'active',
    accessLevel: 'public',
    hideInNavigation: false,
    descriptionNepali: 'प्रमाणित ज्योतिषी, पुरोहित र वास्तुविद्हरूको खोजी तथा प्रत्यक्ष बुकिङ।'
  },
  {
    id: 'page_yajaman',
    tabKey: 'yajaman',
    titleNepali: 'यजमान सेवा तथा पुरोहित परामर्श',
    titleEnglish: 'Yajaman & Purohit Hub',
    category: 'matrimony',
    icon: 'Users',
    status: 'active',
    accessLevel: 'public',
    hideInNavigation: false,
    badge: 'यजमान',
    descriptionNepali: 'यजमान र पुरोहित, ज्योतिषी बीच प्रत्यक्ष परामर्श, पूजा अनुष्ठान बुकिङ।'
  },
  {
    id: 'page_kharedi',
    tabKey: 'kharedi',
    titleNepali: 'वैदिक पसल (Vedic Store / POS)',
    titleEnglish: 'Vedic Store & Puja Items',
    category: 'commerce',
    icon: 'ShoppingBag',
    status: 'active',
    accessLevel: 'public',
    hideInNavigation: false,
    descriptionNepali: 'पूजा सामग्री, रुद्राक्ष, रत्न, पुस्तक तथा यन्त्रहरूको अनलाइन खरिद।'
  },
  {
    id: 'page_samachar',
    tabKey: 'samachar',
    titleNepali: 'समाचार, धर्म तथा अनुसन्धान लेख',
    titleEnglish: 'News & Vedic Research',
    category: 'content',
    icon: 'Newspaper',
    status: 'active',
    accessLevel: 'public',
    hideInNavigation: false,
    descriptionNepali: 'धार्मिक चाडपर्व, मुहूर्त विश्लेषण र वैदिक ज्योतिष सम्बन्धी ज्ञानवर्धक लेखहरू।'
  },
  {
    id: 'page_org_profile',
    tabKey: 'org_profile',
    titleNepali: 'संस्थागत प्रोफाइल तथा लेटरहेड',
    titleEnglish: 'Organization Profile',
    category: 'core',
    icon: 'Building2',
    status: 'active',
    accessLevel: 'public',
    hideInNavigation: false,
    descriptionNepali: 'संस्थाको आधिकारिक परिचय, सम्पर्क, कार्यसमिति र सेवा विवरण।'
  },
  {
    id: 'page_date_converter',
    tabKey: 'date_converter',
    titleNepali: 'मिति रूपान्तरण (BS ⇄ AD)',
    titleEnglish: 'Nepali Date Converter',
    category: 'utility',
    icon: 'Calendar',
    status: 'active',
    accessLevel: 'public',
    hideInNavigation: false,
    descriptionNepali: 'वि.सं. र ई.सं. बीच शतप्रतिशत सटिक द्वि-दिशात्मक मिति रूपान्तरण औजार।'
  },
  {
    id: 'page_knowledge',
    tabKey: 'knowledge',
    titleNepali: 'वैदिक ज्ञानकोष (Knowledge Base)',
    titleEnglish: 'Vedic Knowledge Base',
    category: 'content',
    icon: 'FileText',
    status: 'active',
    accessLevel: 'public',
    hideInNavigation: true,
    descriptionNepali: 'शास्त्र, उपनिषद्, मुहूर्त चिन्तामणि र श्लोकहरूको डिजिटल भण्डार।'
  },
  {
    id: 'page_ai_assistant',
    tabKey: 'ai_assistant',
    titleNepali: 'ज्योतिष सहायक (AI Assistant)',
    titleEnglish: 'Vedic AI Assistant',
    category: 'utility',
    icon: 'Bot',
    status: 'active',
    accessLevel: 'paid_only',
    hideInNavigation: true,
    descriptionNepali: 'कृत्रिम बुद्धिमत्तामा आधारित तात्कालिक ज्योतिषीय सोधपुछ सहायक।'
  }
];

export const DEFAULT_SERVICES: ServiceControlItem[] = [
  {
    id: 'srv_jyotish_consult',
    nameNepali: 'ज्योतिष परामर्श सेवा',
    nameEnglish: 'Astrology Consultation',
    category: 'jyotish',
    isEnabled: true,
    isBookingOpen: true,
    baseFeeNPR: 1000,
    allowOnlinePayment: true,
    autoAssignExperts: true,
    badge: 'मुख्य',
    descriptionNepali: 'व्यक्तिगत कुण्डली, ग्रहदशा, भविष्य फल र उपाय सम्बन्धमा विशेषज्ञसँग परामर्श।'
  },
  {
    id: 'srv_cheena_patrika',
    nameNepali: 'चिना पत्रिका मुद्रण तथा डेलिभरी',
    nameEnglish: 'Cheena Patrika Printing',
    category: 'jyotish',
    isEnabled: true,
    isBookingOpen: true,
    baseFeeNPR: 1500,
    allowOnlinePayment: true,
    autoAssignExperts: false,
    badge: 'प्रिन्ट',
    descriptionNepali: 'आधिकारिक लेटरहेड र ताम्रपत्र शैलीमा जन्मकुण्डली पत्रिका मुद्रण र घरमै डेलिभरी।'
  },
  {
    id: 'srv_vastu_audit',
    nameNepali: 'गृह तथा व्यापारिक वास्तु अडिट',
    nameEnglish: 'Vastu Site Audit',
    category: 'vastu',
    isEnabled: true,
    isBookingOpen: true,
    baseFeeNPR: 5000,
    allowOnlinePayment: true,
    autoAssignExperts: false,
    badge: 'स्थलगत',
    descriptionNepali: 'स्थलगत वा नक्सा विश्लेषण, १६ दिशा सन्तुलन र तोडफोडविहीन ऊर्जा समाधान।'
  },
  {
    id: 'srv_purohit_puja',
    nameNepali: 'कर्मकाण्ड, पूजा तथा महायज्ञ',
    nameEnglish: 'Purohit & Ritual Ceremonies',
    category: 'purohit',
    isEnabled: true,
    isBookingOpen: true,
    baseFeeNPR: 2500,
    allowOnlinePayment: true,
    autoAssignExperts: true,
    descriptionNepali: 'विवाह, व्रतबन्ध, रुद्री, सत्यनारायण पूजा र नवग्रह शान्ति पूजा सञ्चालन।'
  },
  {
    id: 'srv_vivah_matchmaking',
    nameNepali: 'विवाह कुण्डली मिलान (३६ गुण)',
    nameEnglish: 'Marriage Matchmaking',
    category: 'vivah',
    isEnabled: true,
    isBookingOpen: true,
    baseFeeNPR: 500,
    allowOnlinePayment: true,
    autoAssignExperts: true,
    badge: 'अष्टकूट',
    descriptionNepali: 'नाडी, भकूट, गण आदि अष्टकूट परीक्षण, मङ्गल दोष र दीर्घायु विश्लेषण।'
  },
  {
    id: 'srv_vivah_ad_publish',
    nameNepali: 'विवाह मञ्च विज्ञापन प्रकाशन',
    nameEnglish: 'Vivah Classified Ad Publishing',
    category: 'vivah',
    isEnabled: true,
    isBookingOpen: true,
    baseFeeNPR: 1000,
    allowOnlinePayment: true,
    autoAssignExperts: false,
    descriptionNepali: 'वर/वधु आवश्यकताको आधिकारिक विज्ञापन राष्ट्रिय तथा अन्तर्राष्ट्रिय मञ्चमा प्रकाशन।'
  },
  {
    id: 'srv_daily_whatsapp',
    nameNepali: 'दैनिक बिहान ७ बजे WhatsApp पञ्चाङ्ग',
    nameEnglish: 'Daily 7 AM WhatsApp Dispatch',
    category: 'dispatch',
    isEnabled: true,
    isBookingOpen: true,
    baseFeeNPR: 0,
    allowOnlinePayment: false,
    autoAssignExperts: false,
    badge: 'निशुल्क',
    descriptionNepali: 'हरेक बिहान ७ बजे ग्राहकहरूको WhatsApp मा शुभ मुहूर्त, पञ्चाङ्ग र राशिफल सन्देश।'
  },
  {
    id: 'srv_vedic_pasal',
    nameNepali: 'वैदिक पसल सामग्री अर्डर तथा डेलिभरी',
    nameEnglish: 'Vedic Store E-commerce Orders',
    category: 'store',
    isEnabled: true,
    isBookingOpen: true,
    baseFeeNPR: 0,
    allowOnlinePayment: true,
    autoAssignExperts: false,
    descriptionNepali: 'शुद्ध पूजा सामग्री, यन्त्र तथा धूपहरूको अनलाइन अर्डर, प्याकिङ र होम डेलिभरी।'
  }
];

export const DEFAULT_GLOBAL_NOTICE: GlobalNoticeConfig = {
  isEnabled: false,
  type: 'info',
  titleNepali: 'शुभ सूचना',
  messageNepali: 'बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग प्लेटफर्ममा हार्दिक स्वागत छ।',
  dismissible: true
};

function getTodayBSString(): string {
  try {
    const today = new Date().toISOString().split('T')[0];
    return convertADToBS(today).formattedBS;
  } catch {
    return '२०८१';
  }
}

export function getStoredPageServiceConfig(): PageServiceMasterConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with defaults in case new pages or services were added
      const mergedPages = DEFAULT_PAGES.map(dp => {
        const found = parsed.pages?.find((p: any) => p.id === dp.id);
        return found ? { ...dp, ...found } : dp;
      });
      const mergedServices = DEFAULT_SERVICES.map(ds => {
        const found = parsed.services?.find((s: any) => s.id === ds.id);
        return found ? { ...ds, ...found } : ds;
      });

      const safeLastUpdated = typeof parsed.lastUpdatedBS === 'string'
        ? parsed.lastUpdatedBS
        : (parsed.lastUpdatedBS?.formattedBS || getTodayBSString());

      return {
        pages: mergedPages,
        services: mergedServices,
        globalNotice: parsed.globalNotice || DEFAULT_GLOBAL_NOTICE,
        lastUpdatedBS: safeLastUpdated,
        updatedBy: parsed.updatedBy || 'Super Admin'
      };
    }
  } catch (e) {
    console.error('Error reading page service config:', e);
  }

  return {
    pages: DEFAULT_PAGES,
    services: DEFAULT_SERVICES,
    globalNotice: DEFAULT_GLOBAL_NOTICE,
    lastUpdatedBS: getTodayBSString(),
    updatedBy: 'System Default'
  };
}

export function savePageServiceConfig(config: PageServiceMasterConfig): void {
  try {
    config.lastUpdatedBS = getTodayBSString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('page-service-control-updated', { detail: config }));
    try {
      const bc = new BroadcastChannel('balananda_page_service_control_channel');
      bc.postMessage({ type: 'PAGE_SERVICE_UPDATED', timestamp: Date.now() });
      bc.close();
    } catch {}
  } catch (e) {
    console.error('Error saving page service config:', e);
  }
}

export function updateSinglePageStatus(
  pageId: string, 
  status: PageStatus, 
  accessLevel?: AccessLevel,
  hideInNav?: boolean
): void {
  const current = getStoredPageServiceConfig();
  const updatedPages = current.pages.map(p => {
    if (p.id === pageId) {
      return {
        ...p,
        status,
        ...(accessLevel !== undefined ? { accessLevel } : {}),
        ...(hideInNav !== undefined ? { hideInNavigation: hideInNav } : {})
      };
    }
    return p;
  });
  savePageServiceConfig({ ...current, pages: updatedPages });
}

export function updateSingleServiceStatus(
  serviceId: string,
  isEnabled: boolean,
  isBookingOpen?: boolean,
  baseFeeNPR?: number
): void {
  const current = getStoredPageServiceConfig();
  const updatedServices = current.services.map(s => {
    if (s.id === serviceId) {
      return {
        ...s,
        isEnabled,
        ...(isBookingOpen !== undefined ? { isBookingOpen } : {}),
        ...(baseFeeNPR !== undefined ? { baseFeeNPR } : {})
      };
    }
    return s;
  });
  savePageServiceConfig({ ...current, services: updatedServices });
}

export function updateGlobalNotice(notice: GlobalNoticeConfig): void {
  const current = getStoredPageServiceConfig();
  savePageServiceConfig({ ...current, globalNotice: notice });
}

export function resetPageServiceConfigToDefault(): PageServiceMasterConfig {
  const defaults: PageServiceMasterConfig = {
    pages: DEFAULT_PAGES,
    services: DEFAULT_SERVICES,
    globalNotice: DEFAULT_GLOBAL_NOTICE,
    lastUpdatedBS: getTodayBSString(),
    updatedBy: 'Super Admin Reset'
  };
  savePageServiceConfig(defaults);
  return defaults;
}

/**
 * Maps a Navigation tabKey (e.g. 'yajaman', 'kharedi', 'jyotishi', etc.)
 * to its corresponding feature ID in menuControlStore.
 */
export function mapTabKeyToFeatureId(tabKey: string): string {
  switch (tabKey) {
    case 'jyotishi':
    case 'kundali':
      return 'kundali';
    case 'vastu':
      return 'vastu_project';
    case 'pasal':
    case 'kharedi':
      return 'kharedi';
    case 'samachar':
      return 'samachar';
    case 'vivah':
      return 'vivah';
    case 'yajaman':
      return 'yajaman';
    case 'date_converter':
      return 'date_converter';
    case 'calendar':
    case 'patro':
      return 'calendar';
    case 'panchanga':
      return 'panchanga';
    case 'books_download':
    case 'knowledge':
    case 'pustak':
      return 'books_download';
    case 'faladesh':
      return 'faladesh';
    case 'dasha':
      return 'dasha';
    case 'gochar':
      return 'gochar';
    case 'navamsha':
      return 'navamsha';
    case 'muhurta':
      return 'muhurta';
    case 'prashna':
      return 'prashna';
    case 'ankajyotish':
      return 'ankajyotish';
    case 'kpjyotish':
      return 'kpjyotish';
    case 'neemajyotish':
      return 'neemajyotish';
    case 'rashifal':
      return 'rashifal';
    case 'ai_assistant':
      return 'ai_assistant';
    default:
      return tabKey;
  }
}

/**
 * Determines if a tab should be visible in the navigation bar/menu.
 * INTERLINKED:
 * 1. Super Admin always sees everything.
 * 2. If a specific user mobile policy has this feature set to 'open', it OVERRIDES the global hidden flag and shows on their device.
 * 3. If user mobile policy has this feature set to 'close', it is hidden.
 * 4. Otherwise, respects the global Page Control setting (hideInNavigation checkbox / disabled status).
 */
export function isTabVisibleInNavigation(tabKey: string): { visible: boolean; isUserOverride: boolean } {
  // 1. Super Admin check
  if (typeof window !== 'undefined') {
    try {
      const rbacRaw = localStorage.getItem('balananda_rbac_active_session_v1');
      if (rbacRaw) {
        const r = JSON.parse(rbacRaw);
        if (r?.role === 'SUPER_ADMIN' || r?.role === 'ADMIN') {
          return { visible: true, isUserOverride: false };
        }
      }
    } catch {}
  }

  // 2. Check user-specific policy first (Interlinked with User Control by Mobile)
  const featId = mapTabKeyToFeatureId(tabKey);
  const userAccess = checkFeatureAccess(featId);

  if (userAccess.hasPersonalPolicy) {
    if (userAccess.state === 'open') {
      // User Control has explicitly OPENED this feature for this mobile number!
      // This device MUST show and open it immediately, bypassing global hidden flag!
      return { visible: true, isUserOverride: true };
    }
    if (userAccess.state === 'close') {
      // User Control has explicitly CLOSED this feature for this mobile number!
      return { visible: false, isUserOverride: true };
    }
    if (userAccess.state === 'lock') {
      return { visible: true, isUserOverride: true };
    }
  }

  // 3. Global Page Control Check
  const cfg = getStoredPageServiceConfig();
  const page = cfg.pages?.find(p => p.tabKey === tabKey);
  if (page) {
    // If unticked in "शीर्ष मेनु बारमा देखाउने" OR status is "disabled" (बन्द)
    if (page.hideInNavigation || page.status === 'disabled') {
      return { visible: false, isUserOverride: false };
    }
  }

  return { visible: true, isUserOverride: false };
}

/**
 * Determines if a page is accessible when opened/navigated to.
 */
export function isPageAccessible(tabKey: string): {
  accessible: boolean;
  reasonNepali: string;
  isMaintenance: boolean;
  isDisabled: boolean;
} {
  // Super Admin check
  if (typeof window !== 'undefined') {
    try {
      const rbacRaw = localStorage.getItem('balananda_rbac_active_session_v1');
      if (rbacRaw) {
        const r = JSON.parse(rbacRaw);
        if (r?.role === 'SUPER_ADMIN' || r?.role === 'ADMIN') {
          return { accessible: true, reasonNepali: '', isMaintenance: false, isDisabled: false };
        }
      }
    } catch {}
  }

  const featId = mapTabKeyToFeatureId(tabKey);
  const userAccess = checkFeatureAccess(featId);

  // If user has specific permission in User Control:
  if (userAccess.hasPersonalPolicy) {
    if (userAccess.state === 'open') {
      return { accessible: true, reasonNepali: '', isMaintenance: false, isDisabled: false };
    }
    if (userAccess.state === 'close') {
      return {
        accessible: false,
        reasonNepali: userAccess.reasonNepali || 'यो सुविधा तपाईंको खाताको लागि बन्द गरिएको छ।',
        isMaintenance: false,
        isDisabled: true
      };
    }
    if (userAccess.state === 'lock') {
      return {
        accessible: false,
        reasonNepali: userAccess.reasonNepali || 'यो प्रिमियम सुविधा लक गरिएको छ। खोल्नका लागि सुपरएडमिनबाट अनुमति लिनुहोस्।',
        isMaintenance: false,
        isDisabled: false
      };
    }
  }

  // Global Page Control check
  const cfg = getStoredPageServiceConfig();
  const page = cfg.pages?.find(p => p.tabKey === tabKey);
  if (page) {
    if (page.status === 'maintenance') {
      return {
        accessible: false,
        reasonNepali: page.maintenanceMessage || 'यो पृष्ठ हाल मर्मतसम्भारमा छ।',
        isMaintenance: true,
        isDisabled: false
      };
    }
    if (page.status === 'disabled') {
      return {
        accessible: false,
        reasonNepali: 'यो पृष्ठ / सेवा हाल मुख्य प्रशासकद्वारा बन्द गरिएको छ।',
        isMaintenance: false,
        isDisabled: true
      };
    }
  }

  return { accessible: true, reasonNepali: '', isMaintenance: false, isDisabled: false };
}

