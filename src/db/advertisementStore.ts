import { convertADToBS } from '../utils/nepaliCalendar';

export type AdDisplayMode = 
  | 'adsense_flexible'   // गुगल एडसेन्स प्राथमिकता (उपलब्ध हुँदा मात्र देखिने, नत्र कस्टम वा लुक्ने)
  | 'custom_ad'          // आफ्नै कस्टम/प्रायोजक डिजाइन विज्ञापन मात्र देखाउने
  | 'default_banner'     // बालानन्द आधिकारिक विज्ञापन सम्पर्क ब्यानर मात्र देखाउने
  | 'hidden';            // विज्ञापन पूर्ण रूपमा बन्द (कुनै खाली ठाउँ नदेखिने)

export type AdThemeType = 
  | 'vedic_dark'       // मौलिक वैदिक गाढा खैरो / एम्बर
  | 'royal_gold'       // शाही सुनौलो आभा
  | 'deep_crimson'     // सिन्दूरी रातो
  | 'emerald_forest'   // समृद्ध हरियो
  | 'midnight_blue';   // मध्यरात निलो

export interface GoogleAdSenseConfig {
  enabled: boolean;
  clientId: string;            // जस्तै: ca-pub-1955279955732879
  slotId: string;              // ऐच्छिक स्लट ID (default: 'auto')
  autoAdsEnabled: boolean;     // स्वतः विज्ञापन
}

export interface CustomAdItem {
  id: string;
  title: string;               // विज्ञापनको मुख्य शीर्षक वा संस्थाको नाम
  badgeText: string;           // ट्याग: जस्तै "व्यावसायिक विज्ञापन तथा प्रायोजन स्थान"
  subBadgeText: string;        // सब-ट्याग: जस्तै "नेपालकै आधिकारिक वैदिक तथा पञ्चाङ्ग प्लेटफर्म"
  description: string;         // विस्तृत विज्ञापन विवरण
  phone: string;               // सम्पर्क नम्बर
  whatsappNumber: string;      // WhatsApp च्याट नम्बर
  email: string;               // आधिकारिक ईमेल
  websiteUrl: string;          // वेबसाइट वा सामाजिक सञ्जाल लिङ्क
  actionButtonText: string;    // बटनको नाम (जस्तै: "थप जानकारी लिनुहोस्" / "वेबसाइट खोल्नुहोस्")
  
  // ब्यानर फोटो (यदि ग्राहकले फोटो मात्र दिएको भए)
  bannerImageUrl: string;      // सिधै इमेज ब्यानर URL वा Base64
  isImageOnly: boolean;        // के फोटो मात्र देखाउने हो? (साइज: 1200x250 वा 728x90)
  
  // दायाँ तर्फको आकर्षक ब्राण्ड कार्ड (Right Side Brand Box)
  showSideCard: boolean;       // दायाँ तर्फको कार्ड देखाउने?
  sideCardBadge: string;       // जस्तै: "विज्ञापन स्थान (Ad Space)"
  sideCardTitle: string;       // जस्तै: "बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा"
  sideCardSubtitle: string;    // जस्तै: "नेपालकै सबैभन्दा भरपर्दो वैदिक सेवा"
  sideCardIconType: 'om' | 'swastik' | 'kalash' | 'custom_image';
  sideCardImageUrl?: string;   // साइड बक्सको लोगो फोटो
  
  // डिजाइन तथा रङ संयोजन
  theme: AdThemeType;
}

export interface AdvertisementConfig {
  displayMode: AdDisplayMode;
  adsense: GoogleAdSenseConfig;
  customAd: CustomAdItem;
  hideWhenNoAd: boolean;        // विज्ञापन नआउँदा खाली ठाउँ स्वतः हटाउने
  autoCollapseEmptySpace: boolean; // ० पिक्सेल बनाउने (कुनै खाली ग्याप नराख्ने)
  lastUpdatedBS: string;
}

const STORAGE_KEY_AD_CONFIG = 'balananda_advertisement_config_v2';
export const AD_CONFIG_CHANGE_EVENT = 'balananda_ad_config_updated';

export const DEFAULT_AD_CONFIG: AdvertisementConfig = {
  displayMode: 'adsense_flexible',
  adsense: {
    enabled: true,
    clientId: 'ca-pub-1955279955732879',
    slotId: 'auto',
    autoAdsEnabled: true,
  },
  customAd: {
    id: 'ad_default_balananda',
    title: 'विज्ञापनको लागि सम्पर्क : ९७६४४००५३३',
    badgeText: 'व्यावसायिक विज्ञापन तथा प्रायोजन स्थान',
    subBadgeText: 'नेपालकै आधिकारिक वैदिक तथा पञ्चाङ्ग प्लेटफर्म',
    description: 'यस लोकप्रिय नेपाली वैदिक ज्योतिष तथा पञ्चाङ्ग पोर्टलमा तपाईंको व्यवसाय, ब्रान्ड, धार्मिक संघसंस्था वा सेवाको आधिकारिक विज्ञापन तथा प्रवर्द्धन गरी लाखौँ श्रद्धालु तथा पञ्चाङ्ग प्रेमीहरूमाझ सहजै पुग्नुहोस्।',
    phone: '९७६४४००५३३',
    whatsappNumber: '९७६४४००५३३',
    email: 'suwashdmk@gmail.com',
    websiteUrl: '',
    actionButtonText: 'कल गर्नुहोस्',
    bannerImageUrl: '',
    isImageOnly: false,
    showSideCard: true,
    sideCardBadge: 'विज्ञापन स्थान (Ad Space)',
    sideCardTitle: 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा',
    sideCardSubtitle: 'नेपालकै सबैभन्दा भरपर्दो वैदिक सेवा',
    sideCardIconType: 'om',
    sideCardImageUrl: '',
    theme: 'vedic_dark'
  },
  hideWhenNoAd: true,
  autoCollapseEmptySpace: true,
  lastUpdatedBS: '२०८१'
};

export function getStoredAdConfig(): AdvertisementConfig {
  if (typeof window === 'undefined') return DEFAULT_AD_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AD_CONFIG);
    if (!raw) {
      saveAdConfig(DEFAULT_AD_CONFIG);
      return DEFAULT_AD_CONFIG;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_AD_CONFIG,
      ...parsed,
      adsense: {
        ...DEFAULT_AD_CONFIG.adsense,
        ...(parsed.adsense || {})
      },
      customAd: {
        ...DEFAULT_AD_CONFIG.customAd,
        ...(parsed.customAd || {})
      }
    };
  } catch (e) {
    console.error('Failed to parse ad config:', e);
    return DEFAULT_AD_CONFIG;
  }
}

export function saveAdConfig(config: AdvertisementConfig): void {
  if (typeof window === 'undefined') return;
  try {
    const todayAD = new Date().toISOString().split('T')[0];
    const todayBS = convertADToBS(todayAD).formattedBS;
    const toSave: AdvertisementConfig = {
      ...config,
      lastUpdatedBS: todayBS
    };
    localStorage.setItem(STORAGE_KEY_AD_CONFIG, JSON.stringify(toSave));
    window.dispatchEvent(new CustomEvent(AD_CONFIG_CHANGE_EVENT, { detail: toSave }));
  } catch (e) {
    console.error('Failed to save ad config:', e);
  }
}

export function resetAdConfig(): AdvertisementConfig {
  saveAdConfig(DEFAULT_AD_CONFIG);
  return DEFAULT_AD_CONFIG;
}
