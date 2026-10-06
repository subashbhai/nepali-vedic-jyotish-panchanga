import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense, useTransition } from 'react';
import { Header } from './components/Header';
import { Navigation, NavTab, TabTransition, NORMAL_USER_ALLOWED_TABS, PUBLIC_UNAUTH_NAV_IDS } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { SamacharView } from './components/SamacharView';
import { DailyHoroscopeAlertBanner } from './components/DailyHoroscopeAlertBanner';
import { getActiveRBACSession, clearRBACSession, RBACSession } from './db/rbacStore';
import { RBACAuthModal } from './components/auth/RBACAuthModal';
import { SoftwareFullAccessModal } from './components/subscription/SoftwareFullAccessModal';
import { ClientPurchaseLeadModal } from './components/subscription/ClientPurchaseLeadModal';
import { ClientThemeNotificationModal } from './components/subscription/ClientThemeNotificationModal';
import { VedicLoginGateView } from './components/auth/VedicLoginGateView';
import { 
  isSoftwareFullAccessUnlocked, 
  is7DayTrialActive, 
  isTrialEligible, 
  start7DayTrial, 
  evaluateSubscriptionStatus,
  canUserPrintDocuments
} from './db/subscriptionStore';
import { 
  is24HourTrialActive, 
  isClientPurchaseApproved 
} from './db/clientLeadStore';
import { recordVisitorHit } from './db/visitorAnalyticsStore';
import { getStoredClientTheme, applyThemeToDOM } from './utils/themeStore';
import { TrialPrintRestrictionModal } from './components/common/TrialPrintRestrictionModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import PatrikaErrorBoundary from './components/PatrikaErrorBoundary';
import { setAppContextGetter } from './utils/errorLogger';
import { useAppUpdateNotifier } from './utils/useAppUpdateNotifier';
import { printElement } from './utils/pdfGenerator';
import { AppUpdateNotificationModal, AppUpdateFloatingBanner } from './components/common/AppUpdateNotificationModal';
import { isMobileApp, isDesktopApp } from './utils/appVersionManager';
import { ApkDownloadPromptModal } from './components/common/ApkDownloadPromptModal';
import { FullPageModuleHeader } from './components/common/FullPageModuleHeader';

const BalanandaMobileAppShell = lazy(() => import('./mobile/BalanandaMobileAppShell').then((m) => ({ default: m.BalanandaMobileAppShell })));
const BalanandaWindowsAppShell = lazy(() => import('./windows/BalanandaWindowsAppShell').then((m) => ({ default: m.BalanandaWindowsAppShell })));

const KundaliView = lazy(() => import('./components/KundaliView').then((m) => ({ default: m.KundaliView })));
const PatrikaView = lazy(() => import('./components/PatrikaView').then((m) => ({ default: m.PatrikaView })));
const FaladeshView = lazy(() => import('./components/FaladeshView').then((m) => ({ default: m.FaladeshView })));
const DashaView = lazy(() => import('./components/DashaView').then((m) => ({ default: m.DashaView })));
const GocharView = lazy(() => import('./components/GocharView').then((m) => ({ default: m.GocharView })));
const PanchangaView = lazy(() => import('./components/PanchangaView').then((m) => ({ default: m.PanchangaView })));
import type { PanchangaSubTab } from './components/PanchangaView';
const SewaMainView = lazy(() => import('./components/sewa/SewaMainView').then((m) => ({ default: m.SewaMainView })));
const MuhurtaView = lazy(() => import('./components/MuhurtaView').then((m) => ({ default: m.MuhurtaView })));
import type { VastuSubTab } from './components/VastuView';
const VastuModalWindow = lazy(() => import('./components/VastuModalWindow').then((m) => ({ default: m.VastuModalWindow })));
const VivahMilanView = lazy(() => import('./components/VivahMilanView').then((m) => ({ default: m.VivahMilanView })));
const AdminVivahSection = lazy(() => import('./components/admin/sections/AdminVivahSection').then((m) => ({ default: m.AdminVivahSection })));
const NewsEditorDashboard = lazy(() => import('./components/admin/sections/NewsEditorDashboard').then((m) => ({ default: m.NewsEditorDashboard })));
const VivahMainView = lazy(() => import('./components/vivah/VivahMainView').then((m) => ({ default: m.VivahMainView })));
const SanskarDocsView = lazy(() => import('./components/SanskarDocsView').then((m) => ({ default: m.SanskarDocsView })));
const VastuView = lazy(() => import('./components/VastuView').then((m) => ({ default: m.VastuView })));
const YajamanView = lazy(() => import('./components/YajamanView').then((m) => ({ default: m.YajamanView })));
const ExpertApplicationView = lazy(() => import('./components/ExpertApplicationView').then((m) => ({ default: m.ExpertApplicationView })));
const AarjeView = lazy(() => import('./components/AarjeView').then((m) => ({ default: m.AarjeView })));
const PurchaseSubscriptionView = lazy(() => import('./components/PurchaseSubscriptionView').then((m) => ({ default: m.PurchaseSubscriptionView })));
const VedicPasalMainView = lazy(() => import('./components/vedicPasal/VedicPasalMainView').then((m) => ({ default: m.VedicPasalMainView })));
const ApplicationDownloadView = lazy(() => import('./components/downloads/ApplicationDownloadView').then((m) => ({ default: m.ApplicationDownloadView })));
const DigitalLibraryView = lazy(() => import('./components/books/DigitalLibraryView').then((m) => ({ default: m.DigitalLibraryView })));
const MediaDownloadView = lazy(() => import('./components/downloads/MediaDownloadView').then((m) => ({ default: m.MediaDownloadView })));
const MySubscriptionView = lazy(() => import('./components/MySubscriptionView').then((m) => ({ default: m.MySubscriptionView })));
const JyotishiDashboard = lazy(() => import('./components/JyotishiDashboard').then((m) => ({ default: m.JyotishiDashboard })));
const JyotishMainView = lazy(() => import('./components/JyotishMainView').then((m) => ({ default: m.JyotishMainView })));
const PrashnaListView = lazy(() => import('./components/PrashnaListView').then((m) => ({ default: m.PrashnaListView })));
const AnkaJyotishView = lazy(() => import('./components/AnkaJyotishView').then((m) => ({ default: m.AnkaJyotishView })));
const KPJyotishView = lazy(() => import('./components/KPJyotishView').then((m) => ({ default: m.KPJyotishView })));
const NeemaJyotishView = lazy(() => import('./components/NeemaJyotishView').then((m) => ({ default: m.NeemaJyotishView })));
const NepaliCalendarView = lazy(() => import('./components/NepaliCalendarView').then((m) => ({ default: m.NepaliCalendarView })));
const HelpView = lazy(() => import('./components/HelpView').then((m) => ({ default: m.HelpView })));
const DailyHoroscopeView = lazy(() => import('./components/DailyHoroscopeView').then((m) => ({ default: m.DailyHoroscopeView })));
const KnowledgeBaseView = lazy(() => import('./components/KnowledgeBaseView').then((m) => ({ default: m.KnowledgeBaseView })));
const AIAssistantView = lazy(() => import('./components/AIAssistantView').then((m) => ({ default: m.AIAssistantView })));
const AdminControlPanel = lazy(() => import('./components/AdminControlPanel').then((m) => ({ default: m.AdminControlPanel })));
const BirthInputModal = lazy(() => import('./components/BirthInputModal').then((m) => ({ default: m.BirthInputModal })));
const SettingsModal = lazy(() => import('./components/SettingsModal').then((m) => ({ default: m.SettingsModal })));
const OrgProfileModal = lazy(() => import('./components/OrgProfileModal').then((m) => ({ default: m.OrgProfileModal })));
const ImageCropModal = lazy(() => import('./components/ImageCropModal').then((m) => ({ default: m.ImageCropModal })));
const QuickDateConverter = lazy(() => import('./components/QuickDateConverter').then((m) => ({ default: m.QuickDateConverter })));
const DateConverterView = lazy(() => import('./components/converter/DateConverterView').then((m) => ({ default: m.DateConverterView })));
const OrgProfileView = lazy(() => import('./components/profile/OrgProfileView').then((m) => ({ default: m.OrgProfileView })));
const TransitNotificationCenterModal = lazy(() => import('./components/TransitNotificationCenterModal').then((m) => ({ default: m.TransitNotificationCenterModal })));
const DailyWhatsAppDispatchManager = lazy(() => import('./components/admin/DailyWhatsAppDispatchManager').then((m) => ({ default: m.DailyWhatsAppDispatchManager })));
import { DailyWhatsAppReminderBanner } from './components/common/DailyWhatsAppReminderBanner';
import { GlobalSiteNoticeBanner } from './components/common/GlobalSiteNoticeBanner';
import { DeviceUpdateNotificationBanner } from './components/common/DeviceUpdateNotificationBanner';
import { PageMaintenanceView } from './components/common/PageMaintenanceView';
import { getStoredPageServiceConfig } from './db/pageServiceControlStore';

import { 
  BirthDetails, 
  LagnaInfo, 
  PlanetPosition, 
  PanchangaData, 
  VimshottariDashaResult, 
  ApplicationSettings,
  OrganizationProfile,
  AstrologerProfile,
  PurohitProfile,
  VastuExpertProfile,
  PatrikaSubCategory
} from './types/astrology';

import { getCachedAstroCalculation, createAstroCacheKey, clearAstroCache } from './utils/astroCache';
import { calculateGocharAndSadeSati } from './utils/gocharEngine';
import { convertADToBS } from './utils/nepaliCalendar';
import { 
  calculateProfileTransitAlerts, 
  checkAndSendAutoTransitNotifications,
  getUnreadTransitAlerts,
  markAlertsAsViewed
} from './utils/transitNotificationEngine';

import { 
  getStoredProfiles,
  getProfilesForUser, 
  saveProfile, 
  deleteProfile, 
  getStoredSettings, 
  saveSettings,
  getStoredOrgProfile,
  saveOrgProfile,
  getStoredAstrologers,
  saveAstrologers,
  getStoredPurohits,
  savePurohits,
  getLiveCurrentMomentProfile
} from './db/profileStore';

import {
  getStoredOfficialMembers,
  getApprovedAstrologersFromMembers,
  getApprovedPurohitsFromMembers,
  getApprovedVastuExpertsFromMembers
} from './db/officialMemberStore';
import { validateNewsEditorMagicToken, autoSyncLivePlanetaryNews } from './db/samacharStore';
import { setAdminSession, AdminSession } from './db/adminStore';
import { validateRoleMagicToken } from './db/roleMagicTokenStore';

export const TAB_TO_HASH: Record<string, string> = {
  dashboard: 'dashboard',
  panchanga: 'panchanga',
  jyotishi: 'jyotish',
  vastu: 'vastu',
  vivah: 'vivah',
  yajaman: 'yajaman',
  samachar: 'samachar',
  kharedi: 'pasal',
  pustak: 'pustak',
  org_profile: 'org_profile',
  calendar: 'calendar',
  date_converter: 'date_converter',
  sewa: 'sewa',
  kundali: 'kundali',
  rashifal: 'rashifal',
  dasha: 'dasha',
  gochar: 'gochar',
  muhurta: 'muhurta',
  sanskar: 'sanskar',
  prashna: 'prashna',
  ankajyotish: 'ankajyotish',
  kpjyotish: 'kpjyotish',
  neemajyotish: 'neemajyotish',
  faladesh: 'faladesh',
  patrika: 'patrika',
  my_subscription: 'my_subscription',
  apply_expert: 'apply_expert',
  admin_control: 'admin_control',
  store_admin: 'store_admin',
  pos: 'pos',
  news_editor: 'news_editor',
  vivah_admin: 'vivah_admin',
  whatsapp_admin: 'whatsapp_admin',
  knowledge: 'knowledge',
  ai_assistant: 'ai_assistant',
  settings: 'settings',
  help: 'help',
  aarje: 'aarje',
  app_download: 'app_download',
  books_download: 'books_download',
  media_download: 'media_download',
};

export const HASH_TO_TAB: Record<string, NavTab> = {
  '': 'dashboard',
  'dashboard': 'dashboard',
  'home': 'dashboard',
  'panchanga': 'panchanga',
  'panchang': 'panchanga',
  'jyotish': 'jyotishi',
  'jyotishi': 'jyotishi',
  'vastu': 'vastu',
  'vivah': 'vivah',
  'yajaman': 'yajaman',
  'samachar': 'samachar',
  'kharedi': 'kharedi',
  'pasal': 'kharedi',
  'store': 'kharedi',
  'pustak': 'books_download',
  'books_download': 'books_download',
  'library': 'books_download',
  'digital_library': 'books_download',
  'app_download': 'app_download',
  'app': 'app_download',
  'download_app': 'app_download',
  'media_download': 'media_download',
  'media': 'media_download',
  'audio': 'media_download',
  'org_profile': 'org_profile',
  'calendar': 'calendar',
  'patro': 'calendar',
  'date_converter': 'date_converter',
  'converter': 'date_converter',
  'sewa': 'sewa',
  'kundali': 'kundali',
  'rashifal': 'rashifal',
  'dasha': 'dasha',
  'gochar': 'gochar',
  'muhurta': 'muhurta',
  'sanskar': 'sanskar',
  'prashna': 'prashna',
  'ankajyotish': 'ankajyotish',
  'kpjyotish': 'kpjyotish',
  'neemajyotish': 'neemajyotish',
  'faladesh': 'faladesh',
  'patrika': 'patrika',
  'my_subscription': 'my_subscription',
  'subscription': 'my_subscription',
  'apply_expert': 'apply_expert',
  'expert': 'apply_expert',
  'admin_control': 'admin_control',
  'admin': 'admin_control',
  'super_admin': 'admin_control',
  'store_admin': 'store_admin',
  'pasal_admin': 'store_admin',
  'library_admin': 'store_admin',
  'digital_library_admin': 'store_admin',
  'pos': 'pos',
  'pos_terminal': 'pos',
  'news_editor': 'news_editor',
  'news_admin': 'news_editor',
  'vivah_admin': 'vivah_admin',
  'marriage_admin': 'vivah_admin',
  'whatsapp_admin': 'whatsapp_admin',
  'whatsapp_dispatch': 'whatsapp_admin',
  'knowledge': 'knowledge',
  'ai_assistant': 'ai_assistant',
  'settings': 'settings',
  'help': 'help',
  'aarje': 'aarje',
};

export const TAB_PAGE_TITLES: Record<string, string> = {
  dashboard: 'गृहपृष्ठ - नेपाली वैदिक ज्योतिष र पञ्चाङ्ग',
  jyotish: 'नेपाली वैदिक ज्योतिष सेवा कार्यक्षेत्र',
  jyotishi: 'नेपाली वैदिक ज्योतिष सेवा कार्यक्षेत्र',
  panchanga: 'नेपाली वैदिक पञ्चाङ्ग',
  vastu: 'वैदिक वास्तुशास्त्र सेवा',
  vivah: 'विवाह कुण्डली मिलान (मेलापक)',
  kharedi: 'वैदिक पसल तथा पूजा सामग्री',
  pasal: 'वैदिक पसल तथा पूजा सामग्री',
  pustak: '📚 पुस्तक डाउनलोड - बालानन्द वैदिक डिजिटल पुस्तकालय',
  books_download: '📚 पुस्तक डाउनलोड - बालानन्द वैदिक डिजिटल पुस्तकालय',
  app_download: '📲 एप्लिकेसन डाउनलोड (Windows, Android, Mac, iOS)',
  media_download: '🎵 मिडिया डाउनलोड - वैदिक मन्त्र, स्तोत्र, अडियो तथा वालपेपर',
  yajaman: 'यजमान तथा ग्राहक व्यवस्थापन',
  samachar: 'वैदिक पञ्चाङ्ग तथा चाडपर्व समाचार',
  org_profile: 'संस्थागत प्रोफाइल तथा परिचय',
  calendar: 'नेपाली भित्तेपात्रो तथा क्यालेन्डर',
  date_converter: 'मिति रूपान्तरण (वि.सं. - ई.सं.)',
  sewa: 'वैदिक परामर्श तथा सेवा केन्द्र',
  kundali: 'जन्मकुण्डली चक्र तथा ग्रह स्पष्ट',
  rashifal: 'दैनिक तथा वार्षिक राशिफल',
  dasha: 'विंशोत्तरी तथा योगिनी दशा चक्र',
  gochar: 'वर्तमान ग्रह गोचर तथा साढेसाती',
  muhurta: 'सर्वसिद्धि शुभ मुहूर्त विचार',
  sanskar: 'षोडश वैदिक संस्कार दस्तावेज',
  prashna: 'दैवज्ञ प्रश्न ज्योतिष',
  ankajyotish: 'वैदिक अंक ज्योतिष (Numerology)',
  kpjyotish: 'कृष्णमूर्ति पद्धति (KP Astrology)',
  neemajyotish: 'नेमा ज्योतिष (तिब्बती पञ्चतत्व)',
  faladesh: 'समग्र वैदिक फलादेश',
  patrika: 'डिजिटल चिना तथा पत्रिका',
  my_subscription: 'मेरो सदस्यता तथा लाइसेन्स',
  apply_expert: 'ज्योतिषी तथा वास्तुविद् प्रमाणीकरण',
  admin_control: 'सुपरएडमिन नियन्त्रण कक्ष',
  store_admin: '🏬 स्टोर तथा डिजिटल पुस्तकालय व्यवस्थापक',
  pos: '🛍️ काउन्टर POS बिलिङ टर्मिनल',
  news_editor: '📰 समाचार तथा लेख सम्पादक ड्यासबोर्ड',
  vivah_admin: '💍 विवाह बायोडाटा सुपरभाइजर ड्यासबोर्ड',
  whatsapp_admin: '💬 ह्वाट्सएप दैनिक सन्देश व्यवस्थापक',
  knowledge: 'वैदिक ज्ञान तथा ग्रन्थ भण्डार',
  ai_assistant: 'बालानन्द वैदिक AI सहायक',
  help: 'मद्दत तथा प्रयोगकर्ता निर्देशिका',
};

const getInitialRouteFromHash = (): { tab: NavTab; module: 'MAIN' | 'JYOTISH' } => {
  if (typeof window === 'undefined') return { tab: 'dashboard', module: 'MAIN' };
  const raw = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
  if (!raw || raw === 'dashboard' || raw === 'home') {
    return { tab: 'dashboard', module: 'MAIN' };
  }
  const resolved = HASH_TO_TAB[raw] || (raw as NavTab);
  if (resolved === 'jyotishi' || raw === 'jyotish' || raw === 'aarje') {
    return { tab: 'jyotishi', module: 'JYOTISH' };
  }
  return { tab: resolved, module: 'MAIN' };
};

export default function App() {
  const initialRoute = useMemo(getInitialRouteFromHash, []);
  const [profiles, setProfiles] = useState<BirthDetails[]>([]);
  const [activeProfile, setActiveProfile] = useState<BirthDetails | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>(() => initialRoute.tab);
  const [panchangaSubTab, setPanchangaSubTab] = useState<PanchangaSubTab>(() => {
    if (typeof window !== 'undefined') {
      const h = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
      if (h === 'calendar' || h === 'patro') return 'patro';
      if (h === 'date_converter' || h === 'converter') return 'converter';
      if (h === 'rashifal') return 'rashifal';
    }
    return 'daily';
  });
  const [activeModule, setActiveModule] = useState<'MAIN' | 'JYOTISH'>(() => initialRoute.module);
  const [activePatrikaSubTab, setActivePatrikaSubTab] = useState<any>('china');
  const [editingProfile, setEditingProfile] = useState<BirthDetails | null>(null);
  const [settings, setSettingsState] = useState<ApplicationSettings>(getStoredSettings());
  const [isApkPromptModalOpen, setIsApkPromptModalOpen] = useState(false);
  const [isMobileMode, setIsMobileMode] = useState<boolean>(() => isMobileApp());
  const [isWindowsDesktopMode, setIsWindowsDesktopMode] = useState<boolean>(() => isDesktopApp());

  // Listen to platform-mode events or URL changes (Mobile & Windows Desktop)
  useEffect(() => {
    const handlePlatformModeChange = () => {
      setIsMobileMode(isMobileApp());
      setIsWindowsDesktopMode(isDesktopApp());
    };
    window.addEventListener('popstate', handlePlatformModeChange);
    window.addEventListener('mobile-mode-changed', handlePlatformModeChange);
    window.addEventListener('windows-mode-changed', handlePlatformModeChange);
    return () => {
      window.removeEventListener('popstate', handlePlatformModeChange);
      window.removeEventListener('mobile-mode-changed', handlePlatformModeChange);
      window.removeEventListener('windows-mode-changed', handlePlatformModeChange);
    };
  }, []);

  // useTransition: Module switch renders non-urgently to eliminate blinking
  const [, startModuleTransition] = useTransition();

  // Super Admin Page & Service Master Control Configuration
  const [pageServiceConfig, setPageServiceConfig] = useState(getStoredPageServiceConfig);

  useEffect(() => {
    const handlePageServiceUpdate = () => {
      setPageServiceConfig(getStoredPageServiceConfig());
    };
    window.addEventListener('page-service-control-updated', handlePageServiceUpdate);
    return () => window.removeEventListener('page-service-control-updated', handlePageServiceUpdate);
  }, []);

  const currentPageControl = useMemo(() => {
    return pageServiceConfig.pages?.find(p => p.tabKey === activeTab);
  }, [pageServiceConfig, activeTab]);

  // Automatically trigger APK download prompt modal when opened with ?action=download-apk or ?download=apk (e.g. from QR scan)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('action') === 'download-apk' || urlParams.get('download') === 'apk') {
        setIsApkPromptModalOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Synchronize browser Back/Forward navigation and direct URL hash changes across ALL menu pages
  useEffect(() => {
    const handleHashSync = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
      if (!hash || hash === 'dashboard' || hash === 'home') {
        startModuleTransition(() => {
          setActiveModule('MAIN');
          setActiveTab('dashboard');
        });
        document.title = TAB_PAGE_TITLES.dashboard;
        return;
      }

      if (hash === 'jyotish' || hash === 'jyotishi' || hash === 'aarje') {
        startModuleTransition(() => {
          setActiveModule('JYOTISH');
          setActiveTab('jyotishi');
        });
        document.title = TAB_PAGE_TITLES.jyotish;
        return;
      }

      const resolved = HASH_TO_TAB[hash] || (hash as NavTab);
      startModuleTransition(() => {
        setActiveModule('MAIN');
        setActiveTab(resolved);
      });

      if (hash === 'calendar' || hash === 'patro') {
        setPanchangaSubTab('patro');
      } else if (hash === 'date_converter' || hash === 'converter') {
        setPanchangaSubTab('converter');
      } else if (hash === 'rashifal') {
        setPanchangaSubTab('rashifal');
      } else if (hash === 'pustak' || hash === 'books_download' || hash === 'library' || hash === 'digital_library') {
        setPasalInitialTab('books_download');
      }

      const pageTitle = TAB_PAGE_TITLES[hash] || TAB_PAGE_TITLES[resolved] || 'नेपाली वैदिक ज्योतिष र पञ्चाङ्ग';
      document.title = pageTitle;
    };

    window.addEventListener('popstate', handleHashSync);
    window.addEventListener('hashchange', handleHashSync);
    return () => {
      window.removeEventListener('popstate', handleHashSync);
      window.removeEventListener('hashchange', handleHashSync);
    };
  }, []);

  // Sync document title on initial load
  useEffect(() => {
    const initialHash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
    if (initialHash === 'pustak' || initialHash === 'books_download' || initialHash === 'library' || initialHash === 'digital_library') {
      setPasalInitialTab('books_download');
    }
    const titleKey = initialHash || activeTab;
    const pageTitle = TAB_PAGE_TITLES[titleKey] || TAB_PAGE_TITLES[activeTab] || 'नेपाली वैदिक ज्योतिष र पञ्चाङ्ग';
    document.title = pageTitle;
  }, []);

  const [orgProfile, setOrgProfile] = useState<OrganizationProfile>(getStoredOrgProfile());
  const [astrologers, setAstrologers] = useState<AstrologerProfile[]>(getStoredAstrologers());
  const [purohits, setPurohits] = useState<PurohitProfile[]>(getStoredPurohits());
  const [vastuExperts, setVastuExperts] = useState<VastuExpertProfile[]>([]);
  const [vastuSubTab, setVastuSubTab] = useState<VastuSubTab>('project');

  const [isBirthModalOpen, setIsBirthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'astro' | 'letterhead'>('astro');

  const handleOpenSettings = (tab: 'astro' | 'letterhead' = 'astro') => {
    setSettingsInitialTab(tab);
    setIsSettingsModalOpen(true);
  };

  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [isDateConverterOpen, setIsDateConverterOpen] = useState(false);
  const [isTransitNotificationModalOpen, setIsTransitNotificationModalOpen] = useState(false);
  const [isVastuModalOpen, setIsVastuModalOpen] = useState(false);
  const [isGlobalWhatsAppModalOpen, setIsGlobalWhatsAppModalOpen] = useState(false);

  // RBAC Authentication State
  const [rbacSession, setRbacSession] = useState<RBACSession | null>(getActiveRBACSession());
  const [isRBACAuthModalOpen, setIsRBACAuthModalOpen] = useState(false);
  const [isSuperAdminAuthModalOpen, setIsSuperAdminAuthModalOpen] = useState(false);
  const [adminInitialTab, setAdminInitialTab] = useState<string | undefined>(undefined);
  const [pasalInitialTab, setPasalInitialTab] = useState<'home' | 'books' | 'books_download' | 'pos' | 'admin'>('home');

  // Full Software Access Licensing State
  const [hasFullAccess, setHasFullAccess] = useState<boolean>(() => isSoftwareFullAccessUnlocked() || isClientPurchaseApproved());
  const [isFullAccessModalOpen, setIsFullAccessModalOpen] = useState(false);
  const [isClientPurchaseLeadModalOpen, setIsClientPurchaseLeadModalOpen] = useState(false);
  const [isClientThemeModalOpen, setIsClientThemeModalOpen] = useState(false);
  const [lockedFeatureName, setLockedFeatureName] = useState<string>('यो मेनु');

  // 24-Hour & 7-Day Trial State
  const [isTrialActive, setIsTrialActive] = useState<boolean>(() => is24HourTrialActive() || is7DayTrialActive());
  const [trialStatusInfo, setTrialStatusInfo] = useState(() => evaluateSubscriptionStatus());
  const [isTrialPrintRestrictedModalOpen, setIsTrialPrintRestrictedModalOpen] = useState(false);
  const [trialPrintDocType, setTrialPrintDocType] = useState<'kundali' | 'vastu' | 'general'>('general');

  const isSuperOrStoreAdmin =
    rbacSession?.role === 'SUPER_ADMIN' ||
    rbacSession?.role === 'STORE_ADMIN' ||
    rbacSession?.role === 'POS_STAFF' ||
    rbacSession?.role === 'NEWS_EDITOR' ||
    rbacSession?.role === 'MARRIAGE_MODERATOR';
  const isApprovedClient = isClientPurchaseApproved();
  const isFullyUnlocked = isSuperOrStoreAdmin || hasFullAccess || isTrialActive || isApprovedClient;

  // Track page view for Analytics
  useEffect(() => {
    recordVisitorHit(activeTab);
  }, [activeTab]);

  // Apply Client Theme on initial load and listen for theme change events
  useEffect(() => {
    const activeTheme = getStoredClientTheme();
    applyThemeToDOM(activeTheme);
    const handleThemeChange = (e: any) => {
      if (e.detail?.themeId) {
        applyThemeToDOM(e.detail.themeId);
      }
    };
    window.addEventListener('client-theme-changed', handleThemeChange);
    return () => window.removeEventListener('client-theme-changed', handleThemeChange);
  }, []);

  // Live App Update Check & Electron Auto-Updater System
  const appUpdate = useAppUpdateNotifier();

  // Sync licensing & trial state across tabs/events
  useEffect(() => {
    const handleFullAccessUpdate = () => {
      setHasFullAccess(isSoftwareFullAccessUnlocked() || isClientPurchaseApproved());
    };
    const handleTrialUpdate = () => {
      setIsTrialActive(is24HourTrialActive() || is7DayTrialActive());
      setTrialStatusInfo(evaluateSubscriptionStatus());
    };
    const handlePrintBlocked = (e: any) => {
      setTrialPrintDocType(e?.detail?.docType || 'general');
      setIsTrialPrintRestrictedModalOpen(true);
    };
    const handleOpenPurchase = () => {
      setIsClientPurchaseLeadModalOpen(true);
    };

    window.addEventListener('software-full-access-updated', handleFullAccessUpdate);
    window.addEventListener('storage', handleFullAccessUpdate);
    window.addEventListener('software-trial-updated', handleTrialUpdate);
    window.addEventListener('trial-status-updated', handleTrialUpdate);
    window.addEventListener('trial-print-blocked', handlePrintBlocked);
    window.addEventListener('open-subscription-purchase-modal', handleOpenPurchase);

    return () => {
      window.removeEventListener('software-full-access-updated', handleFullAccessUpdate);
      window.removeEventListener('storage', handleFullAccessUpdate);
      window.removeEventListener('software-trial-updated', handleTrialUpdate);
      window.removeEventListener('trial-status-updated', handleTrialUpdate);
      window.removeEventListener('trial-print-blocked', handlePrintBlocked);
      window.removeEventListener('open-subscription-purchase-modal', handleOpenPurchase);
    };
  }, []);

  // Handle URL Query Params: Super Admin Secret Portal and Active Role Magic Links
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const superAdminPortal = params.get('superadmin_portal');
      const secretAdmin = params.get('secret_admin');
      const adminToken = params.get('admin_token');
      const section = params.get('section');

      // 1. Role Magic Token: ?magic_role=...&magic_token=...
      const magicRole = params.get('magic_role') as any;
      const magicToken = params.get('magic_token');
      if (magicToken) {
        const validated = validateRoleMagicToken(magicToken);
        if (validated.isValid && validated.session) {
          setRbacSession(validated.session);
          try {
            localStorage.setItem('balananda_rbac_active_session_v1', JSON.stringify(validated.session));
          } catch {}
          // Direct navigation to destination workstation
          if (magicRole === 'SUPER_ADMIN' || magicRole === 'ADMIN' || validated.session.role === 'SUPER_ADMIN') {
            const adminSessionData: AdminSession = {
              adminId: validated.session.userId || 'admin_super_master',
              username: validated.session.username || 'admin',
              fullName: validated.session.fullName || 'मुख्य प्रशासक (Super Admin)',
              role: 'super_admin',
              roleNameNepali: validated.session.roleNameNepali || 'मुख्य प्रशासक (Super Admin)',
              permissions: [
                'manage_admins',
                'manage_payments',
                'manage_experts',
                'manage_members',
                'manage_pricing',
                'manage_trials',
                'manage_users',
                'view_reports',
                'manage_notifications',
                'view_audit_logs',
                'system_settings',
                'samachar_editor'
              ],
              loginTimeISO: new Date().toISOString(),
              lastActivityISO: new Date().toISOString()
            };
            setAdminSession(adminSessionData);
            setActiveTab('admin_control');
            if (section) setAdminInitialTab(section);
          } else if (magicRole === 'POS_STAFF') {
            setActiveTab('pos');
          } else if (magicRole === 'STORE_ADMIN') {
            setActiveTab('store_admin');
          } else if (magicRole === 'MARRIAGE_MODERATOR') {
            setActiveTab('vivah_admin');
          } else if (magicRole === 'NEWS_EDITOR' || validated.session.role === 'NEWS_EDITOR') {
            setActiveTab('news_editor');
          }
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }
      }

      const portal = params.get('portal');
      if (portal === 'pos') {
        setActiveTab('pos');
      } else if (portal === 'store_admin') {
        setActiveTab('store_admin');
      } else if (portal === 'vivah_mod' || portal === 'vivah_admin') {
        setActiveTab('vivah_admin');
      } else if (portal === 'samachar_editor' || portal === 'news_editor') {
        setActiveTab('news_editor');
      } else if (portal === 'superadmin' || portal === 'admin') {
        setActiveTab('admin_control');
      }

      // 2. Superadmin Direct Secret Link: ?superadmin_portal=true or ?secret_admin=balananda or ?admin_token=...
      if (
        superAdminPortal === 'true' ||
        secretAdmin === 'balananda' ||
        adminToken === 'BALANANDA-SUPERADMIN-OVERRIDE-TOKEN' ||
        adminToken === 'SJS-SUPER-ADMIN-MASTER-KEY' ||
        adminToken === 'balananda' ||
        adminToken === 'admin'
      ) {
        const superAdminSession: RBACSession = {
          token: 'superadmin_override_token',
          userId: 'usr_superadmin_master',
          username: 'admin',
          fullName: 'मुख्य प्रशासक (Super Admin)',
          role: 'SUPER_ADMIN',
          roleNameNepali: 'मुख्य प्रशासक (Super Admin)',
          status: 'active',
          permissions: ['all', 'manage_all_modules', 'user_management', 'finance_management'],
          createdAtISO: new Date().toISOString(),
          lastActivityISO: new Date().toISOString()
        };
        setRbacSession(superAdminSession);
        try {
          localStorage.setItem('balananda_rbac_active_session_v1', JSON.stringify(superAdminSession));
        } catch {}

        const adminSessionData: AdminSession = {
          adminId: 'admin_super_master',
          username: 'admin',
          fullName: 'मुख्य प्रशासक (Super Admin)',
          role: 'super_admin',
          roleNameNepali: 'मुख्य प्रशासक (Super Admin)',
          permissions: [
            'manage_admins',
            'manage_payments',
            'manage_experts',
            'manage_members',
            'manage_pricing',
            'manage_trials',
            'manage_users',
            'view_reports',
            'manage_notifications',
            'view_audit_logs',
            'system_settings',
            'samachar_editor'
          ],
          loginTimeISO: new Date().toISOString(),
          lastActivityISO: new Date().toISOString()
        };
        setAdminSession(adminSessionData);

        setActiveTab('admin_control');
        if (section) setAdminInitialTab(section);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (e) {
      console.error('Failed to parse URL query params', e);
    }
  }, []);

  // Ensure active profile is initialized from stored preference, session birth details, or profile list
  useEffect(() => {
    setActiveProfile((prev) => {
      if (prev) return prev; // Do not overwrite an already active profile!
      try {
        const storedId = localStorage.getItem('balananda_active_profile_id');
        if (storedId && profiles.length > 0) {
          const found = profiles.find((p) => p.id === storedId);
          if (found) return found;
        }
      } catch {}
      if (rbacSession?.birthDetails) {
        return rbacSession.birthDetails;
      }
      if (rbacSession?.birthProfileId && profiles.length > 0) {
        const found = profiles.find((p) => p.id === rbacSession.birthProfileId);
        if (found) return found;
      }
      return profiles[0] || null;
    });
  }, [rbacSession?.userId]);

  // Global window.print and beforeprint interception to protect and isolate report printing
  useEffect(() => {
    const originalPrint = window.print;
    window.print = () => {
      // 1. If currently inside isolated print mount, let browser print natively
      if (document.body.classList.contains('is-printing-report')) {
        originalPrint.call(window);
        return;
      }

      const docType = (activeTab === 'vastu') ? 'vastu' : (activeTab === 'jyotishi' || activeTab === 'dashboard' || activeTab === 'patrika' || activeTab === 'kundali' || activeTab === 'dasha' || activeTab === 'faladesh') ? 'kundali' : 'general';
      const check = canUserPrintDocuments(docType);
      if (!check.allowed) {
        window.dispatchEvent(new CustomEvent('trial-print-blocked', { detail: { reason: check.reasonNepali, docType } }));
        return;
      }

      // 2. Identify if any active printable report is currently in the DOM
      const targetCandidates = [
        'printable-store-invoice',
        'printable-receipt',
        'detailed-kundali-pdf-document-preview',
        'print_preview_printable_area',
        'patrika_printable_document_area',
        'printable-faladesh-report',
        'printable-dasha-report',
        'vastu-single-page-report',
        'aarje-printable-report',
        'daily-panchanga-printable-card',
        'printable-kundali-document',
        'graha-faladesh-printable-area',
        'planet-popup-printable-area',
        'yoga-breakdown-printable-area',
        'yoga-shadbala-printable-report',
        'balananda-printable-book-document'
      ];

      for (const id of targetCandidates) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.height > 0 || el.offsetParent !== null) {
            printElement(id);
            return;
          }
        }
      }

      originalPrint.call(window);
    };

    const handleBeforePrint = () => {
      const docType = (activeTab === 'vastu') ? 'vastu' : (activeTab === 'jyotishi' || activeTab === 'dashboard' || activeTab === 'patrika' || activeTab === 'kundali' || activeTab === 'dasha' || activeTab === 'faladesh') ? 'kundali' : 'general';
      const check = canUserPrintDocuments(docType);
      if (!check.allowed) {
        window.dispatchEvent(new CustomEvent('trial-print-blocked', { detail: { reason: check.reasonNepali, docType } }));
      }
    };

    window.addEventListener('beforeprint', handleBeforePrint);

    return () => {
      window.print = originalPrint;
      window.removeEventListener('beforeprint', handleBeforePrint);
    };
  }, [activeTab]);

  // Note: Tab authorization & login gates are handled gracefully inline by VedicLoginGateView
  // to ensure that on browser refresh (F5), the active page URL hash is never overwritten!

  // Centralized URL-hash routed navigation across all menus and sub-features
  const navigateTab = useCallback((
    targetTab: NavTab | string,
    subTab?: string,
    replaceHistory: boolean = false
  ) => {
    let resolved = (targetTab as string) === 'patro' ? 'calendar' : (targetTab as NavTab);
    
    if (resolved === 'settings') {
      setIsSettingsModalOpen(true);
      return;
    }

    const isPublic = PUBLIC_UNAUTH_NAV_IDS.has(resolved as NavTab);
    if (!rbacSession && !isPublic) {
      setIsRBACAuthModalOpen(true);
      return;
    }

    if (rbacSession && !isFullyUnlocked && !NORMAL_USER_ALLOWED_TABS.has(resolved)) {
      setLockedFeatureName(
        resolved === 'jyotishi' || resolved === 'aarje' ? 'ज्योतिष कार्यक्षेत्र' :
        resolved === 'vastu' ? 'वास्तुशास्त्र' :
        resolved === 'rashifal' ? 'दैनिक राशिफल' :
        resolved === 'dashboard' ? 'गृहपृष्ठ' : 'यो सेवा'
      );
      setIsClientPurchaseLeadModalOpen(true);
      return;
    }

    // Sub-route handling
    let targetHash = TAB_TO_HASH[resolved] || (resolved as string);
    if (targetTab === 'calendar' || targetTab === 'patro') {
      setPanchangaSubTab('patro');
      resolved = 'panchanga';
      targetHash = 'calendar';
    } else if (targetTab === 'date_converter') {
      setPanchangaSubTab('converter');
      resolved = 'panchanga';
      targetHash = 'date_converter';
    } else if (targetTab === 'rashifal') {
      setPanchangaSubTab('rashifal');
      resolved = 'panchanga';
      targetHash = 'rashifal';
    } else if (resolved === 'panchanga' && subTab) {
      setPanchangaSubTab(subTab as PanchangaSubTab);
    } else if (resolved === 'vastu' && subTab) {
      setVastuSubTab(subTab as VastuSubTab);
    } else if (subTab) {
      setActivePatrikaSubTab(subTab as PatrikaSubCategory);
    }

    const pageTitle = TAB_PAGE_TITLES[targetHash] || TAB_PAGE_TITLES[resolved] || 'नेपाली वैदिक ज्योतिष र पञ्चाङ्ग';
    document.title = pageTitle;

    if (resolved === 'jyotishi' || resolved === 'aarje') {
      startModuleTransition(() => {
        setActiveModule('JYOTISH');
        setActiveTab('jyotishi');
      });
      if (window.location.hash !== '#jyotish') {
        if (replaceHistory) window.history.replaceState({ module: 'JYOTISH' }, '', '#jyotish');
        else window.history.pushState({ module: 'JYOTISH' }, '', '#jyotish');
      }
      return;
    }

    startModuleTransition(() => {
      setActiveModule('MAIN');
      setActiveTab(resolved);
    });

    const fullHash = targetHash === 'dashboard' ? '#dashboard' : `#${targetHash}`;
    if (window.location.hash !== fullHash) {
      if (replaceHistory) {
        window.history.replaceState({ tab: resolved }, '', fullHash);
      } else {
        window.history.pushState({ tab: resolved }, '', fullHash);
      }
    }
  }, [rbacSession, isFullyUnlocked]);

  // Function to enter full Jyotish workspace (Free to explore)
  const enterJyotishModule = useCallback(() => {
    navigateTab('jyotishi');
  }, [navigateTab]);

  // Function to exit Jyotish workspace back to main
  const exitJyotishModule = useCallback(() => {
    navigateTab('dashboard');
  }, [navigateTab]);

  const handleLogoutRBAC = () => {
    clearRBACSession();
    setRbacSession(null);
    setPasalInitialTab('home');
    navigateTab('dashboard', undefined, true);
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  // State for Image Cropper Modal
  const [croppingTarget, setCroppingTarget] = useState<{
    type: 'customer' | 'org_logo' | 'org_hero' | 'astrologer' | 'purohit';
    title: string;
    profileId?: string;
    existingImage?: string;
    isPrivate?: boolean;
  } | null>(null);

  // Helper to sync official members with astrologer/purohit/vastu states
  const refreshOfficialMembers = () => {
    try {
      const allMembers = getStoredOfficialMembers();
      const approvedAstros = getApprovedAstrologersFromMembers(allMembers);
      const approvedPurohits = getApprovedPurohitsFromMembers(allMembers);
      const approvedVastu = getApprovedVastuExpertsFromMembers(allMembers);
      setAstrologers(approvedAstros);
      setPurohits(approvedPurohits);
      setVastuExperts(approvedVastu);
    } catch (e) {
      console.error('Failed to refresh official members:', e);
    }
  };

  // User-scoped profiles based on logged in session (Multi-tenant data isolation)
  const refreshScopedProfiles = useCallback((userId?: string | null, isSuper: boolean = false) => {
    let userProfiles = getProfilesForUser(userId, isSuper);
    // If rbacSession has birthDetails and it's not in userProfiles, include it!
    if (rbacSession?.birthDetails && !userProfiles.some(p => p.id === rbacSession.birthDetails?.id || p.name === rbacSession.birthDetails?.name)) {
      userProfiles = [rbacSession.birthDetails, ...userProfiles];
    }
    setProfiles(userProfiles);
    setActiveProfile((prev) => {
      try {
        const storedId = localStorage.getItem('balananda_active_profile_id');
        if (storedId) {
          const foundStored = userProfiles.find((p) => p.id === storedId);
          if (foundStored) return foundStored;
        }
      } catch {}
      if (prev) {
        const exists = userProfiles.find((p) => p.id === prev.id);
        if (exists) return exists;
      }
      return userProfiles[0] || null;
    });
    return userProfiles;
  }, [rbacSession?.birthDetails]);

  const handleSelectProfile = useCallback((p: BirthDetails) => {
    setActiveProfile(p);
    try {
      if (p.id) {
        localStorage.setItem('balananda_active_profile_id', p.id);
      }
    } catch {}
  }, []);

  // Initialize and refresh profiles when RBAC session changes
  useEffect(() => {
    const isSuper = rbacSession?.role === 'SUPER_ADMIN';
    refreshScopedProfiles(rbacSession?.userId, isSuper);
  }, [rbacSession?.userId, rbacSession?.role, refreshScopedProfiles]);

  // Check for active admin magic link or shared profile query parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const adminToken = urlParams.get('admin_token') || urlParams.get('magic_token');
    const targetTab = urlParams.get('tab');

    if (adminToken) {
      const validation = validateNewsEditorMagicToken(adminToken);
      if (validation.isValid && validation.tokenRecord) {
        const editorRecord = validation.tokenRecord;
        const magicSession: RBACSession = {
          token: editorRecord.token,
          userId: 'editor-' + Date.now(),
          username: editorRecord.recipientName || 'समाचार सम्पादक',
          fullName: editorRecord.recipientName || 'समाचार सम्पादक',
          role: 'NEWS_EDITOR',
          roleNameNepali: 'समाचार सम्पादक (News Editor)',
          status: 'active',
          permissions: ['news.view', 'news.create', 'news.edit', 'news.delete', 'news.publish', 'news.breaking', 'news.analytics'],
          createdAtISO: editorRecord.issuedAt,
          lastActivityISO: new Date().toISOString(),
        };
        setRbacSession(magicSession);
        try {
          localStorage.setItem('balananda_rbac_active_session_v1', JSON.stringify(magicSession));
        } catch {}

        setActiveTab('samachar');
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        alert(validation.messageNepali || 'सक्रिय लिङ्क अमान्य वा म्याद सकिएको छ।');
      }
    } else if (targetTab) {
      const resolved = (targetTab as string) === 'patro' ? 'calendar' : targetTab;
      if (['dashboard', 'panchanga', 'calendar', 'samachar', 'rashifal', 'yajaman', 'kharedi', 'vivah'].includes(resolved)) {
        setActiveTab(resolved as any);
      }
    }

    const shareName = urlParams.get('shareName');
    if (shareName) {
      const shareProfile: BirthDetails = {
        id: 'shared-' + Date.now(),
        name: shareName,
        gender: (urlParams.get('shareGender') as any) || 'male',
        dateBS: urlParams.get('shareDobBS') || '२०५५-०५-१५',
        dateAD: urlParams.get('shareDobAD') || '1998-08-31',
        time: urlParams.get('shareTime') || '12:00',
        location: {
          name: urlParams.get('sharePlace') || 'काठमाडौँ, नेपाल',
          country: 'नेपाल',
          latitude: 27.7172,
          longitude: 85.3240,
          timeZone: 5.75,
        },
        category: 'Client',
      };
      setActiveProfile(shareProfile);
      if (window.location.hash === '#kundali') {
        setActiveTab('kundali');
      }
    }
    refreshOfficialMembers();
  }, []);

  // Sync Theme Mode
  useEffect(() => {
    const isDark = settings.themeMode === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.themeMode]);

  // Listen for custom navigation events (such as from Push Notification clicks)
  useEffect(() => {
    const handleNavigateTab = (e: any) => {
      if (e?.detail) {
        navigateTab(e.detail);
      }
    };
    window.addEventListener('navigate-tab' as any, handleNavigateTab);
    return () => window.removeEventListener('navigate-tab' as any, handleNavigateTab);
  }, [navigateTab]);

  const handleToggleTheme = () => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark') || settings.themeMode === 'dark';
    const nextTheme: 'light' | 'dark' = isCurrentlyDark ? 'light' : 'dark';
    const updated: ApplicationSettings = { ...settings, themeMode: nextTheme };
    setSettingsState(updated);
    saveSettings(updated);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.dispatchEvent(new CustomEvent('theme-mode-changed', { detail: { themeMode: nextTheme } }));
  };

  const handleSaveProfile = (newProfile: BirthDetails) => {
    const saved = saveProfile(newProfile);
    const isSuper = rbacSession?.role === 'SUPER_ADMIN';
    refreshScopedProfiles(rbacSession?.userId, isSuper);
    handleSelectProfile(saved);
  };

  const handleOpenNewKundaliModal = () => {
    if (activeProfile) {
      saveProfile(activeProfile);
    }
    setEditingProfile(null);
    setIsBirthModalOpen(true);
  };

  const handleDeleteProfile = (id: string) => {
    deleteProfile(id);
    const isSuper = rbacSession?.role === 'SUPER_ADMIN';
    const updatedProfiles = refreshScopedProfiles(rbacSession?.userId, isSuper);
    if (activeProfile?.id === id) {
      if (updatedProfiles[0]) {
        handleSelectProfile(updatedProfiles[0]);
      } else {
        setActiveProfile(null);
      }
    }
  };

  const handleSaveSettings = (newSettings: ApplicationSettings) => {
    clearAstroCache();
    setSettingsState(newSettings);
    saveSettings(newSettings);
  };

  const handleSaveOrgProfile = (newOrg: OrganizationProfile) => {
    saveOrgProfile(newOrg);
    setOrgProfile(newOrg);
  };

  const handleSaveAstrologer = (astrologer: AstrologerProfile) => {
    const exists = astrologers.some((a) => a.id === astrologer.id);
    let updated: AstrologerProfile[];
    if (exists) {
      updated = astrologers.map((a) => (a.id === astrologer.id ? astrologer : a));
    } else {
      updated = [...astrologers, astrologer];
    }
    saveAstrologers(updated);
    setAstrologers(updated);
  };

  const handleDeleteAstrologer = (id: string) => {
    const updated = astrologers.filter((a) => a.id !== id);
    saveAstrologers(updated);
    setAstrologers(updated);
  };

  const handleSavePurohit = (purohit: PurohitProfile) => {
    const exists = purohits.some((p) => p.id === purohit.id);
    let updated: PurohitProfile[];
    if (exists) {
      updated = purohits.map((p) => (p.id === purohit.id ? purohit : p));
    } else {
      updated = [...purohits, purohit];
    }
    savePurohits(updated);
    setPurohits(updated);
  };

  const handleDeletePurohit = (id: string) => {
    const updated = purohits.filter((p) => p.id !== id);
    savePurohits(updated);
    setPurohits(updated);
  };

  // Save Cropped Image Handler
  const handleSaveCroppedImage = (dataUrl: string, isPrivate: boolean) => {
    if (!croppingTarget) return;

    if (croppingTarget.type === 'customer' && croppingTarget.profileId) {
      const targetP = profiles.find((p) => p.id === croppingTarget.profileId);
      if (targetP) {
        const updatedP: BirthDetails = {
          ...targetP,
          photoUrl: dataUrl,
          isPhotoPrivate: isPrivate,
        };
        saveProfile(updatedP);
        const updatedList = getStoredProfiles();
        setProfiles(updatedList);
        if (activeProfile?.id === targetP.id) {
          setActiveProfile(updatedP);
        }
      }
    } else if (croppingTarget.type === 'org_logo') {
      const updatedOrg = { ...orgProfile, logoUrl: dataUrl };
      saveOrgProfile(updatedOrg);
      setOrgProfile(updatedOrg);
    } else if (croppingTarget.type === 'org_hero') {
      const updatedOrg = { ...orgProfile, mainPhotoUrl: dataUrl };
      saveOrgProfile(updatedOrg);
      setOrgProfile(updatedOrg);
    }

    setCroppingTarget(null);
  };

  // Perform Calculations for Active Profile
  const todayAD = new Date().toISOString().split('T')[0];
  const todayBS = useMemo(() => convertADToBS(todayAD).formattedBS, [todayAD]);

  // Dynamic recent date/time fallback if no user profile is active
  const currentProfile: BirthDetails = activeProfile || getLiveCurrentMomentProfile();

  const birthAD = currentProfile.dateAD || '1995-05-15';
  const birthTime = currentProfile.time || '08:30';
  const lat = currentProfile.location?.latitude ?? 27.7172;
  const lng = currentProfile.location?.longitude ?? 85.3240;
  const tz = currentProfile.location?.timeZone ?? 5.75;
  const ayanSys = settings.ayanamsaSystem || 'Lahiri';

  const activeProfileCacheKey = createAstroCacheKey(birthAD, birthTime, lat, lng, tz, ayanSys);

  const todayPanchangaCacheKey = createAstroCacheKey(todayAD, '06:00', lat, lng, tz, ayanSys);

  const todayAstroCalculation = useMemo(() => {
    return getCachedAstroCalculation(todayAD, '06:00', lat, lng, tz, ayanSys);
  }, [todayPanchangaCacheKey]);

  const todayPanchanga: PanchangaData = todayAstroCalculation.panchanga;
  const todayTransitPlanets: PlanetPosition[] = todayAstroCalculation.planets;

  const { julianDay, ayanamsa, lagna, planets, moon, dasha, yogas, gochar } = useMemo(() => {
    const cached = getCachedAstroCalculation(birthAD, birthTime, lat, lng, tz, ayanSys);
    const gch = calculateGocharAndSadeSati(cached.moon, todayTransitPlanets, todayAD);

    return {
      julianDay: cached.julianDay,
      ayanamsa: cached.ayanamsa,
      lagna: cached.lagna,
      planets: cached.planets,
      moon: cached.moon,
      dasha: cached.dasha,
      yogas: cached.yogas,
      gochar: gch,
    };
  }, [activeProfileCacheKey, todayAD, todayTransitPlanets]);

  // Major planetary movements (transits) calculated relative to active profile's birth chart
  const profileTransitAlerts = useMemo(() => {
    return calculateProfileTransitAlerts({
      activeProfile: currentProfile,
      birthMoon: moon,
      birthLagna: lagna,
      transitPlanets: todayTransitPlanets,
      todayAD,
      todayBS,
    });
  }, [currentProfile, moon, lagna, todayTransitPlanets, todayAD, todayBS]);

  // Automatically sync 9 planets live transit news updates into samacharStore
  useEffect(() => {
    if (todayTransitPlanets && todayTransitPlanets.length >= 7) {
      autoSyncLivePlanetaryNews(todayTransitPlanets, todayBS, todayAD);
    }
  }, [todayTransitPlanets, todayBS, todayAD]);

  // Track viewed notifications revision to recompute unread alerts when opened
  const [viewedAlertsRevision, setViewedAlertsRevision] = useState(0);

  useEffect(() => {
    const handleViewedUpdate = () => {
      setViewedAlertsRevision((v) => v + 1);
    };
    window.addEventListener('transit-alerts-viewed', handleViewedUpdate);
    window.addEventListener('storage', handleViewedUpdate);
    return () => {
      window.removeEventListener('transit-alerts-viewed', handleViewedUpdate);
      window.removeEventListener('storage', handleViewedUpdate);
    };
  }, []);

  // Compute only unread/new transit alerts for the active profile
  const unreadTransitAlerts = useMemo(() => {
    return getUnreadTransitAlerts(profileTransitAlerts, currentProfile?.id);
  }, [profileTransitAlerts, currentProfile?.id, viewedAlertsRevision]);

  // High priority blinking applies ONLY to unread alerts
  const hasHighPriorityTransit = useMemo(() => {
    return unreadTransitAlerts.some((a) => a.severity === 'maha_parivartan' || a.severity === 'alert');
  }, [unreadTransitAlerts]);

  // Open transit notifications modal and mark active alerts as viewed so blinking turns off
  const handleOpenTransitNotifications = useCallback(() => {
    setIsTransitNotificationModalOpen(true);
    markAlertsAsViewed(profileTransitAlerts, currentProfile?.id);
    setViewedAlertsRevision((v) => v + 1);
  }, [profileTransitAlerts, currentProfile?.id]);

  // Check and dispatch automatic push notifications on transit changes
  useEffect(() => {
    if (currentProfile && profileTransitAlerts.length > 0) {
      checkAndSendAutoTransitNotifications({
        activeProfile: currentProfile,
        alerts: profileTransitAlerts,
        onNavigateToGochar: () => navigateTab('gochar'),
      });
    }
  }, [currentProfile?.id, profileTransitAlerts, navigateTab]);

  // Register dynamic app state context for error logging and boundary tracking
  useEffect(() => {
    setAppContextGetter(() => ({
      activeTab,
      activeModule,
      activePatrikaSubTab,
      profileId: currentProfile?.id,
      profileName: currentProfile?.name,
      profileDateBS: currentProfile?.dateBS,
      profileTime: currentProfile?.time,
      profileLocation: currentProfile?.location?.name,
      online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    }));
  }, [activeTab, activeModule, activePatrikaSubTab, currentProfile]);

  // Listen for Service Worker navigation messages
  useEffect(() => {
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NAVIGATE_TAB' && event.data.tab) {
        navigateTab(event.data.tab);
      }
    };
    const handleNavigateTabEvent = (event: any) => {
      if (event.detail) {
        navigateTab(event.detail);
      }
    };

    window.addEventListener('message', handleSWMessage);
    window.addEventListener('navigate-tab', handleNavigateTabEvent);
    return () => {
      window.removeEventListener('message', handleSWMessage);
      window.removeEventListener('navigate-tab', handleNavigateTabEvent);
    };
  }, [navigateTab]);

  // Ensure all application environments (Desktop, Mobile, Web) receive 100% full web features (No limited version)
  // If legacy limited shell query param is present, silently clean it up
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('view_shell')) {
      urlParams.delete('view_shell');
      const cleanUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '') + window.location.hash;
      window.history.replaceState({}, '', cleanUrl);
    }
  }

  // If JYOTISH module is active, render full-screen workspace with no main dropdowns (free to explore)
  if (activeModule === 'JYOTISH') {
    return (
      <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#1C1917] text-[#2D241E] dark:text-[#F5F5F4] font-sans selection:bg-amber-200 selection:text-amber-950 transition-colors duration-200 flex flex-col">
        {/* Jyotish module: Suspense fallback invisible हुन्छ — blinking/flash हुँदैन */}
        <Suspense fallback={<div className="flex-1 min-h-screen" />}>
          <JyotishMainView
            profiles={profiles}
            activeProfile={activeProfile}
            onSelectProfile={handleSelectProfile}
            onNewProfile={handleOpenNewKundaliModal}
            onDeleteProfile={handleDeleteProfile}
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onNavigate={(tab) => {
              if (tab === 'jyotishi') {
                setActiveModule('JYOTISH');
              } else {
                exitJyotishModule();
                navigateTab(tab);
              }
            }}
            onExit={exitJyotishModule}
            onMembersUpdated={refreshOfficialMembers}
            orgProfile={orgProfile}
            astrologers={astrologers}
            purohits={purohits}
            onEditProfile={(p) => {
              setEditingProfile(p);
              setIsBirthModalOpen(true);
            }}
            initialSubTab={activePatrikaSubTab}
            onOpenPurchaseModal={() => setIsClientPurchaseLeadModalOpen(true)}
          />
        </Suspense>

        {/* Birth Details Modal if opened from Jyotish module */}
        {isBirthModalOpen && (
          <BirthInputModal
            isOpen={isBirthModalOpen}
            onClose={() => {
              setIsBirthModalOpen(false);
              setEditingProfile(null);
            }}
            onSave={handleSaveProfile}
            initialProfile={editingProfile}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] dark:bg-[#1C1917] text-[#2D241E] dark:text-[#F5F5F4] font-sans selection:bg-[#D97706]/20 selection:text-[#D97706] transition-colors duration-200 flex flex-col">
      <div className="flex-1 flex flex-col w-full min-h-0">
          {activeTab === 'dashboard' ? (
            <>
              {/* Sticky Unified Header & Navigation Container (Home / Dashboard only) */}
              <div className="sticky top-0 z-50 bg-white/95 dark:bg-[#262320]/95 backdrop-blur-md border-b border-[#E6E0D5] dark:border-stone-800 shadow-xs transition-colors">
                <Header
                  activeProfile={activeProfile}
                  profiles={profiles}
                  onSelectProfile={handleSelectProfile}
                  onNewProfile={handleOpenNewKundaliModal}
                  onOpenSettings={() => handleOpenSettings('astro')}
                  onNavigateToApplyExpert={() => navigateTab('apply_expert')}
                  onNavigateToAdmin={(tab) => {
                    setAdminInitialTab(tab);
                    navigateTab('admin_control');
                  }}
                  settings={settings}
                  onToggleTheme={handleToggleTheme}
                  todayBS={todayBS}
                  orgProfile={orgProfile}
                  onOpenOrgProfile={() => navigateTab('org_profile')}
                  onOpenDateConverter={() => navigateTab('date_converter')}
                  rbacSession={rbacSession}
                  onOpenAuthModal={() => setIsRBACAuthModalOpen(true)}
                  onLogoutRBAC={handleLogoutRBAC}
                  transitAlertCount={unreadTransitAlerts.length}
                  hasHighPriorityTransitAlert={hasHighPriorityTransit}
                  onOpenTransitNotifications={handleOpenTransitNotifications}
                  onOpenPurchaseModal={(featureName) => {
                    setLockedFeatureName(featureName || 'पूर्ण सदस्यता');
                    setIsClientPurchaseLeadModalOpen(true);
                  }}
                  hasUpdate={appUpdate.hasUpdate}
                  updateVersion={appUpdate.remoteRelease?.version || appUpdate.electronStatus.version}
                  onOpenAppUpdates={() => appUpdate.setIsUpdateModalOpen(true)}
                  onNavigateTab={(tab) => navigateTab(tab as any)}
                />

                {/* Main Navigation Tabs */}
                <Navigation 
                  activeTab={activeTab} 
                  activeModule={activeModule}
                  onEnterJyotish={enterJyotishModule}
                  onOpenSettingsModal={(tab) => handleOpenSettings(tab || 'astro')}
                  rbacSession={rbacSession}
                  onOpenAuthModal={() => setIsRBACAuthModalOpen(true)}
                  onLogoutRBAC={handleLogoutRBAC}
                  hasFullAccess={isFullyUnlocked}
                  onOpenPurchaseModal={(featureName) => {
                    setLockedFeatureName(featureName || 'यो सेवा');
                    setIsClientPurchaseLeadModalOpen(true);
                  }}
                  onOpenDateConverter={() => navigateTab('date_converter')}
                  onOpenOrgProfile={() => navigateTab('org_profile')}
                  onOpenThemeModal={() => setIsClientThemeModalOpen(true)}
                  onNavigateToAdmin={(tab) => {
                    setAdminInitialTab(tab || 'client_approvals');
                    navigateTab('admin_control');
                  }}
                  profiles={profiles}
                  onOpenVastuModal={(subTab) => {
                    if (subTab) {
                      setVastuSubTab(subTab as VastuSubTab);
                    }
                    setIsVastuModalOpen(true);
                  }}
                  onTabChange={(tab, subTab) => navigateTab(tab, subTab)} 
                />
              </div>

              {/* Global Device Auto-Update Notification Banner (Instant 1-Click Update for Mobile & Desktop) */}
              <DeviceUpdateNotificationBanner />

              {/* Global Site-wide Announcement Banner (Managed by Super Admin) */}
              <GlobalSiteNoticeBanner onNavigateTab={(tab) => navigateTab(tab as any)} />
            </>
          ) : (
            /* Dedicated Full Page Window Header for ALL non-dashboard menu tabs (Same UX as Jyotish Sewa) */
            <FullPageModuleHeader
              activeTab={activeTab}
              onGoHome={() => navigateTab('dashboard')}
              onOpenDateConverter={() => navigateTab('date_converter')}
              onToggleTheme={handleToggleTheme}
              onOpenSettings={() => handleOpenSettings('astro')}
              activeProfile={activeProfile}
              profiles={profiles}
              onSelectProfile={handleSelectProfile}
              rbacSession={rbacSession}
              onOpenAuthModal={() => setIsRBACAuthModalOpen(true)}
              onLogoutRBAC={handleLogoutRBAC}
              orgProfile={orgProfile}
              onNavigateTab={(tab) => navigateTab(tab as any)}
              onNavigateToAdmin={(tab) => {
                setAdminInitialTab(tab || 'client_approvals');
                navigateTab('admin_control');
              }}
            />
          )}

      {/* Main Container */}
      <main className="max-w-[1700px] mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-6 flex-1 w-full flex flex-col min-h-0">
          {currentPageControl?.status === 'maintenance' && !rbacSession ? (
            <PageMaintenanceView
              pageTitle={currentPageControl.titleNepali}
              maintenanceMessage={currentPageControl.maintenanceMessage}
              onGoHome={() => navigateTab('dashboard')}
            />
          ) : !rbacSession && !PUBLIC_UNAUTH_NAV_IDS.has(activeTab) ? (
            <VedicLoginGateView
              onOpenSignIn={() => setIsRBACAuthModalOpen(true)}
              onOpenSignUp={() => setIsRBACAuthModalOpen(true)}
              onLoginSuccess={(session) => {
                setRbacSession(session);
                const isSuper =
                  session.role === 'SUPER_ADMIN' ||
                  session.role === 'STORE_ADMIN' ||
                  session.role === 'POS_STAFF';
                if (!isSuper && !isSoftwareFullAccessUnlocked()) {
                  navigateTab('yajaman');
                }
              }}
            />
          ) : (
            <>
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-white dark:bg-stone-900 rounded-2xl border border-amber-200/60 dark:border-stone-800 shadow-sm animate-pulse flex-1">
                  <div className="w-10 h-10 border-4 border-[#D97706] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold text-[#D97706]">सामग्री लोड हुँदैछ...</span>
                </div>
              }>
                <TabTransition activeTab={activeTab}>
                  <PatrikaErrorBoundary
                    fallbackTitle="पृष्ठ लोड गर्दा समस्या भयो"
                    appStateContext={{
                      activeTab,
                      profileId: currentProfile?.id,
                      profileName: currentProfile?.name
                    }}
                  >
          {activeTab === 'dashboard' && (
            <DashboardView
              todayPanchanga={todayPanchanga}
              activeProfile={activeProfile}
              profiles={profiles}
              orgProfile={orgProfile}
              astrologers={astrologers}
              purohits={purohits}
              vastuExperts={vastuExperts}
              lagna={lagna}
              planets={planets}
              dasha={dasha}
              transitPlanets={todayTransitPlanets}
              moon={moon}
              todayAD={todayAD}
              todayBS={todayBS}
              onOpenTransitNotifications={handleOpenTransitNotifications}
              onSelectProfile={handleSelectProfile}
              onNewProfile={handleOpenNewKundaliModal}
              onDeleteProfile={handleDeleteProfile}
              rbacSession={rbacSession}
              hasFullAccess={isFullyUnlocked}
              onNavigate={(tab) => navigateTab(tab)}
              onOpenOrgProfile={() => navigateTab('org_profile')}
              onOpenSettings={handleOpenSettings}
              onEditCustomerPhoto={(p) => {
                setCroppingTarget({
                  type: 'customer',
                  title: `${p.name} को फोटो व्यवस्थापन`,
                  profileId: p.id,
                  existingImage: p.photoUrl,
                  isPrivate: p.isPhotoPrivate,
                });
              }}
            />
          )}

          {activeTab === 'rashifal' && (
            <div className="space-y-4">
              <DailyHoroscopeAlertBanner
                activeProfile={currentProfile}
                moon={moon}
                lagna={lagna}
                todayPanchanga={todayPanchanga}
                todayAD={todayAD}
                todayBS={todayBS}
                activeTab={activeTab}
                onNavigateToHoroscope={() => {
                  const el = document.getElementById('daily-horoscope-main-content');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
              <DailyHoroscopeView
                activeProfile={currentProfile}
                profiles={profiles}
                todayPanchanga={todayPanchanga}
                transitPlanets={planets}
                natalPlanets={planets}
                lagna={lagna}
                dasha={dasha}
                onSelectProfile={handleSelectProfile}
                onNewProfile={handleOpenNewKundaliModal}
              />
            </div>
          )}

          {activeTab === 'kundali' && (
            <PatrikaErrorBoundary 
              fallbackTitle="कुण्डली चक्र गणना तथा प्रदर्शनमा समस्या भयो"
              appStateContext={{
                activeTab: 'kundali',
                profileId: currentProfile?.id,
                profileName: currentProfile?.name,
                chartStyle: settings.chartStyle,
              }}
            >
              <KundaliView
                profile={currentProfile}
                profiles={profiles}
                lagna={lagna}
                planets={planets}
                dasha={dasha}
                chartStyle={settings.chartStyle}
                onChangeChartStyle={(style) => handleSaveSettings({ ...settings, chartStyle: style })}
                ayanamsaSystem={settings.ayanamsaSystem}
                onChangeAyanamsaSystem={(system) => handleSaveSettings({ ...settings, ayanamsaSystem: system })}
                orgProfile={orgProfile}
                onNavigateToTab={(tab) => navigateTab(tab as any)}
              />
            </PatrikaErrorBoundary>
          )}

          {(activeTab === 'patrika' || (activeTab as string) === 'tipan') && (
            <PatrikaErrorBoundary 
              fallbackTitle="चिना / पत्रिका पाना लोड गर्न सकिएन"
              appStateContext={{
                activeTab: 'patrika',
                activePatrikaSubTab,
                profileId: currentProfile?.id,
                profileName: currentProfile?.name,
                profileDateBS: currentProfile?.dateBS,
                profileTime: currentProfile?.time,
                profileLocation: currentProfile?.location?.name,
              }}
              onReset={() => {
                setActivePatrikaSubTab('china');
              }}
            >
              <PatrikaView
                profile={currentProfile}
                profiles={profiles}
                lagna={lagna}
                planets={planets}
                panchanga={todayPanchanga}
                orgProfile={orgProfile}
                astrologers={astrologers}
                initialSubTab={activePatrikaSubTab}
                onSelectProfile={handleSelectProfile}
                onNewProfile={handleOpenNewKundaliModal}
                onEditProfile={(p) => {
                  setEditingProfile(p);
                  setIsBirthModalOpen(true);
                }}
              />
            </PatrikaErrorBoundary>
          )}

          {activeTab === 'faladesh' && (
            <PatrikaErrorBoundary 
              fallbackTitle="फलादेश गणना तथा विश्लेषणमा समस्या भयो"
              appStateContext={{
                activeTab: 'faladesh',
                profileId: currentProfile?.id,
                profileName: currentProfile?.name,
              }}
            >
              <FaladeshView
                profile={currentProfile}
                lagna={lagna}
                planets={planets}
                panchanga={todayPanchanga}
                yogas={yogas}
                dasha={dasha}
                sadeSatiStatus={gochar.sadeSati.status}
                onNewProfile={handleOpenNewKundaliModal}
              />
            </PatrikaErrorBoundary>
          )}

          {activeTab === 'dasha' && (
            <DashaView
              dasha={dasha}
              profile={currentProfile}
              moon={moon}
              planets={planets}
            />
          )}

          {activeTab === 'gochar' && (
            <GocharView
              moon={moon}
              transitPlanets={todayTransitPlanets}
              activeProfile={currentProfile}
              birthLagna={lagna}
              todayBS={todayBS}
              onOpenNotificationCenter={handleOpenTransitNotifications}
            />
          )}

          {activeTab === 'prashna' && (
            <PrashnaListView
              activeProfile={currentProfile}
              todayPanchanga={todayPanchanga}
              onNavigateToAIAssistant={() => navigateTab('ai_assistant')}
              onNavigateToJyotish={() => enterJyotishModule()}
            />
          )}

          {activeTab === 'ankajyotish' && (
            <AnkaJyotishView activeProfile={currentProfile} />
          )}

          {activeTab === 'kpjyotish' && (
            <KPJyotishView activeProfile={currentProfile} />
          )}

          {activeTab === 'neemajyotish' && (
            <NeemaJyotishView
              activeProfile={currentProfile}
              profiles={profiles}
              onSelectProfile={handleSelectProfile}
              onOpenNewProfileModal={handleOpenNewKundaliModal}
            />
          )}

          {(activeTab === 'calendar' || (activeTab as string) === 'patro') && (
            <NepaliCalendarView 
              onNavigateToPanchanga={() => navigateTab('panchanga')}
            />
          )}

          {activeTab === 'help' && (
            <HelpView />
          )}

          {activeTab === 'sewa' && (
            <SewaMainView
              onEnterJyotish={enterJyotishModule}
              onOpenVastuModal={(subTab) => {
                if (subTab) setVastuSubTab(subTab);
                setIsVastuModalOpen(true);
              }}
              onNavigateTab={(tab) => navigateTab(tab)}
              hasFullAccess={isFullyUnlocked}
              onOpenPurchaseModal={() => {
                setLockedFeatureName('सेवाहरू');
                setIsClientPurchaseLeadModalOpen(true);
              }}
              activeProfile={currentProfile}
              orgProfile={orgProfile}
            />
          )}

          {activeTab === 'panchanga' && (
            <PanchangaView
              initialPanchanga={todayPanchanga}
              initialSubTab={panchangaSubTab}
              activeProfile={currentProfile}
              profiles={profiles}
              todayTransitPlanets={todayTransitPlanets}
              natalPlanets={planets}
              lagna={lagna}
              dasha={dasha}
              todayAD={todayAD}
              todayBS={todayBS}
              onSelectProfile={handleSelectProfile}
              onNewProfile={handleOpenNewKundaliModal}
              orgProfile={orgProfile}
            />
          )}

          {activeTab === 'samachar' && (
            <PatrikaErrorBoundary
              fallbackTitle="समाचार तथा गोचर खण्ड लोड गर्न समस्या भयो"
              appStateContext={{
                activeTab: 'samachar',
                todayBS,
                todayAD,
              }}
            >
              <SamacharView
                todayTransitPlanets={todayTransitPlanets}
                todayPanchanga={todayPanchanga}
                todayAD={todayAD}
                todayBS={todayBS}
                onNavigateTab={(tab) => navigateTab(tab as any)}
              />
            </PatrikaErrorBoundary>
          )}

          {activeTab === 'date_converter' && (
            <DateConverterView
              onNavigateTab={(tab) => navigateTab(tab as any)}
            />
          )}

          {activeTab === 'org_profile' && (
            <OrgProfileView
              orgProfile={orgProfile}
              onSaveOrgProfile={handleSaveOrgProfile}
              isSuperAdmin={rbacSession?.role === 'SUPER_ADMIN'}
              isLoggedIn={!!rbacSession}
              onNavigateTab={(tab) => navigateTab(tab as any)}
              onOpenAuthModal={() => setIsRBACAuthModalOpen(true)}
              onOpenTrialModal={() => setIsClientPurchaseLeadModalOpen(true)}
            />
          )}

          {activeTab === 'muhurta' && <MuhurtaView />}

          {activeTab === 'vivah' && (
            <VivahMilanView 
              profiles={profiles}
              activeProfile={currentProfile}
              rbacSession={rbacSession} 
              onOpenAuthModal={() => setIsRBACAuthModalOpen(true)}
            />
          )}

          {activeTab === 'sanskar' && <SanskarDocsView profile={currentProfile} orgProfile={orgProfile} />}

          {activeTab === 'vastu' && (
            <VastuView 
              orgProfile={orgProfile} 
              activeProfile={activeProfile} 
              initialSubTab={vastuSubTab} 
              onOpenPurchaseModal={() => setIsClientPurchaseLeadModalOpen(true)}
            />
          )}

          {activeTab === 'yajaman' && (
            <YajamanView onNavigateToExpert={() => navigateTab('apply_expert')} />
          )}

          {activeTab === 'kharedi' && (
            <VedicPasalMainView 
              initialTab={pasalInitialTab}
              orgProfile={orgProfile}
              onNavigateHome={() => navigateTab('dashboard')} 
            />
          )}

          {activeTab === 'app_download' && (
            <ApplicationDownloadView
              onOpenModal={() => setIsDownloadModalOpen(true)}
              onNavigateHome={() => navigateTab('dashboard')}
            />
          )}

          {activeTab === 'books_download' && (
            <DigitalLibraryView
              orgProfile={orgProfile}
              onBackToStore={() => navigateTab('dashboard')}
            />
          )}

          {activeTab === 'media_download' && (
            <MediaDownloadView />
          )}

          {activeTab === 'my_subscription' && (
            <MySubscriptionView
              onNavigateToPurchase={() => navigateTab('kharedi')}
              orgProfile={orgProfile}
            />
          )}

          {activeTab === 'apply_expert' && (
            <ExpertApplicationView onNavigateToDashboard={() => navigateTab('dashboard')} />
          )}

          {activeTab === 'jyotishi' && (
            <JyotishiDashboard
              profiles={profiles}
              activeProfile={activeProfile}
              onSelectProfile={handleSelectProfile}
              onNewProfile={handleOpenNewKundaliModal}
              onDeleteProfile={handleDeleteProfile}
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onNavigate={(tab) => navigateTab(tab)}
              onMembersUpdated={refreshOfficialMembers}
              onOpenPurchaseModal={() => setIsClientPurchaseLeadModalOpen(true)}
            />
          )}

          {activeTab === 'knowledge' && <KnowledgeBaseView />}

          {activeTab === 'ai_assistant' && (
            <AIAssistantView
              profile={currentProfile}
              lagna={lagna}
              planets={planets}
              dasha={dasha}
              sadeSatiStatus={gochar.sadeSati.status}
            />
          )}

          {activeTab === 'admin_control' && (
            <AdminControlPanel
              onClosePanel={() => navigateTab('dashboard')}
              onNavigateApp={(tab) => navigateTab(tab as any)}
              initialTab={adminInitialTab as any}
              profiles={profiles}
              todayPanchanga={todayPanchanga}
              orgProfile={orgProfile}
              transitPlanets={todayTransitPlanets}
            />
          )}

          {activeTab === 'store_admin' && (
            <VedicPasalMainView
              initialTab="admin"
              isStandalone={true}
              orgProfile={orgProfile}
              onNavigateHome={() => navigateTab('dashboard')}
            />
          )}

          {activeTab === 'pos' && (
            <VedicPasalMainView
              initialTab="pos"
              isStandalone={true}
              orgProfile={orgProfile}
              onNavigateHome={() => navigateTab('dashboard')}
            />
          )}

          {activeTab === 'news_editor' && (
            <NewsEditorDashboard
              orgName={orgProfile.name}
              isStandalone={true}
              onRefreshParent={() => {}}
            />
          )}

          {activeTab === 'vivah_admin' && (
            <AdminVivahSection onRefreshParent={() => {}} />
          )}

          {activeTab === 'whatsapp_admin' && (
            <div className="w-full max-w-6xl mx-auto py-2">
              <DailyWhatsAppDispatchManager
                profiles={profiles}
                todayPanchanga={todayPanchanga}
                orgProfile={orgProfile}
                transitPlanets={todayTransitPlanets}
                onClose={() => navigateTab('dashboard')}
              />
            </div>
          )}

                  </PatrikaErrorBoundary>
                </TabTransition>
        </Suspense>
        </>
      )}
      </main>
      </div>

      {/* Modals */}
      <Suspense fallback={null}>
        {isGlobalWhatsAppModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
            <div className="max-w-5xl w-full my-auto">
              <DailyWhatsAppDispatchManager
                profiles={profiles}
                todayPanchanga={todayPanchanga}
                orgProfile={orgProfile}
                transitPlanets={todayTransitPlanets}
                onClose={() => setIsGlobalWhatsAppModalOpen(false)}
              />
            </div>
          </div>
        )}

        {isBirthModalOpen && (
          <BirthInputModal
            isOpen={isBirthModalOpen}
            onClose={() => {
              setIsBirthModalOpen(false);
              setEditingProfile(null);
            }}
            onSave={handleSaveProfile}
            initialProfile={editingProfile}
          />
        )}

        {isSettingsModalOpen && (
          <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            settings={settings}
            onSaveSettings={handleSaveSettings}
            orgProfile={orgProfile}
            onSaveOrgProfile={handleSaveOrgProfile}
            initialTab={settingsInitialTab}
          />
        )}

        {isOrgModalOpen && (
          <OrgProfileModal
            isOpen={isOrgModalOpen}
            onClose={() => setIsOrgModalOpen(false)}
            orgProfile={orgProfile}
            onSaveOrgProfile={handleSaveOrgProfile}
            onNavigate={(tab) => {
              navigateTab(tab);
              setIsOrgModalOpen(false);
            }}
            astrologers={astrologers}
            onSaveAstrologer={handleSaveAstrologer}
            onDeleteAstrologer={handleDeleteAstrologer}
            purohits={purohits}
            onSavePurohit={handleSavePurohit}
            onDeletePurohit={handleDeletePurohit}
            onOpenCropModal={(type, title, existingImage) => {
              setCroppingTarget({
                type,
                title,
                existingImage,
              });
            }}
            isSuperAdmin={rbacSession?.role === 'SUPER_ADMIN'}
            isLoggedIn={!!rbacSession}
            onOpenAuthModal={() => {
              setIsOrgModalOpen(false);
              setIsRBACAuthModalOpen(true);
            }}
            onOpenTrialModal={() => {
              setIsOrgModalOpen(false);
              setIsClientPurchaseLeadModalOpen(true);
            }}
          />
        )}

        {croppingTarget && (
          <ImageCropModal
            isOpen={true}
            onClose={() => setCroppingTarget(null)}
            titleNepali={croppingTarget.title}
            currentPhotoUrl={croppingTarget.existingImage}
            isPrivateInitial={croppingTarget.isPrivate}
            onSavePhoto={handleSaveCroppedImage}
          />
        )}

        <RBACAuthModal
          isOpen={isRBACAuthModalOpen || isSuperAdminAuthModalOpen}
          isSuperAdminOnly={isSuperAdminAuthModalOpen}
          onClose={() => {
            setIsRBACAuthModalOpen(false);
            setIsSuperAdminAuthModalOpen(false);
          }}
          onLoginSuccess={(session, createdProfile) => {
            setRbacSession(session);
            if (createdProfile) {
              setActiveProfile(createdProfile);
              setProfiles(prev => [createdProfile, ...prev.filter(p => p.id !== createdProfile.id)]);
            } else if (session.birthDetails) {
              setActiveProfile(session.birthDetails);
            }
            setIsRBACAuthModalOpen(false);
            setIsSuperAdminAuthModalOpen(false);
            if (session.role === 'SUPER_ADMIN') {
              if (activeTab === 'dashboard') navigateTab('admin_control');
            } else if (session.role === 'STORE_ADMIN') {
              if (activeTab === 'dashboard') navigateTab('store_admin');
            } else if (session.role === 'POS_STAFF') {
              if (activeTab === 'dashboard') navigateTab('pos');
            } else if (session.role === 'NEWS_EDITOR') {
              if (activeTab === 'dashboard') navigateTab('news_editor');
            } else if (session.role === 'MARRIAGE_MODERATOR') {
              if (activeTab === 'dashboard') navigateTab('vivah_admin');
            }
          }}
        />

        {isDateConverterOpen && (
          <QuickDateConverter
            mode="modal"
            isOpen={isDateConverterOpen}
            onClose={() => setIsDateConverterOpen(false)}
            onNavigateToPanchanga={(dateAD) => {
              setIsDateConverterOpen(false);
              navigateTab('panchanga');
            }}
          />
        )}

        {/* Major Planetary Transit & App Update Notification Center Modal */}
        <TransitNotificationCenterModal
          isOpen={isTransitNotificationModalOpen}
          onClose={() => setIsTransitNotificationModalOpen(false)}
          activeProfile={currentProfile}
          birthMoon={moon}
          birthLagna={lagna}
          transitPlanets={todayTransitPlanets}
          todayAD={todayAD}
          todayBS={todayBS}
          onNavigateToGochar={() => navigateTab('gochar')}
          hasUpdate={appUpdate.hasUpdate}
          updateVersion={appUpdate.remoteRelease?.version || appUpdate.electronStatus.version}
          onOpenAppUpdates={() => appUpdate.setIsUpdateModalOpen(true)}
        />

        {/* Vastu New Window Modal */}
        <VastuModalWindow
          isOpen={isVastuModalOpen}
          onClose={() => setIsVastuModalOpen(false)}
          orgProfile={orgProfile}
          activeProfile={activeProfile}
          initialSubTab={vastuSubTab}
        />

        {/* Full Access Purchase Modal with eSewa / Khalti +977-9764400533 */}
        {/* Client Purchase & 24-Hour Free Trial Lead Modal */}
        <ClientPurchaseLeadModal
          isOpen={isClientPurchaseLeadModalOpen}
          onClose={() => setIsClientPurchaseLeadModalOpen(false)}
          onUnlockSuccess={() => {
            setHasFullAccess(true);
            setIsTrialActive(true);
            setIsClientPurchaseLeadModalOpen(false);
          }}
          targetFeatureName={lockedFeatureName}
          onNavigateToAdmin={(tab) => {
            setIsClientPurchaseLeadModalOpen(false);
            setAdminInitialTab(tab || 'client_approvals');
            navigateTab('admin_control');
          }}
        />

        {/* Client Theme & Yajaman Broadcast Modal */}
        <ClientThemeNotificationModal
          isOpen={isClientThemeModalOpen}
          onClose={() => setIsClientThemeModalOpen(false)}
          astrologerName={settings.astrologerName}
        />

        {/* Full Access Purchase Modal with eSewa / Khalti +977-9764400533 */}
        <SoftwareFullAccessModal
          isOpen={isFullAccessModalOpen}
          onClose={() => setIsFullAccessModalOpen(false)}
          onUnlockSuccess={() => {
            setHasFullAccess(true);
            setIsFullAccessModalOpen(false);
          }}
          lockedFeatureName={lockedFeatureName}
        />

        {/* Trial Print Restriction Modal */}
        <TrialPrintRestrictionModal
          isOpen={isTrialPrintRestrictedModalOpen}
          onClose={() => setIsTrialPrintRestrictedModalOpen(false)}
          documentType={trialPrintDocType}
          onOpenPurchase={() => setIsClientPurchaseLeadModalOpen(true)}
        />

        {/* Live In-App Update Modal & Floating Notification Banner */}
        <AppUpdateNotificationModal
          isOpen={appUpdate.isUpdateModalOpen}
          onClose={() => appUpdate.setIsUpdateModalOpen(false)}
          remoteRelease={appUpdate.remoteRelease}
          electronStatus={appUpdate.electronStatus}
          onManualCheck={appUpdate.checkForUpdates}
          isChecking={appUpdate.isChecking}
        />
        <AppUpdateFloatingBanner
          remoteRelease={appUpdate.remoteRelease}
          electronStatus={appUpdate.electronStatus}
          onOpenDetails={() => appUpdate.setIsUpdateModalOpen(true)}
        />

        {/* Offline indicator banner when network is disconnected */}
        <OfflineIndicator />

        {/* Mobile QR Scan APK Download Prompt Modal ("Download App?" Popup with Yes/No) */}
        <ApkDownloadPromptModal
          isOpen={isApkPromptModalOpen}
          onClose={() => setIsApkPromptModalOpen(false)}
        />
      </Suspense>
    </div>
  );
}

