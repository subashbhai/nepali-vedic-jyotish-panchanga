import React, { memo, useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Sun,
  Sparkles, 
  FileText, 
  Compass, 
  Clock, 
  Globe2, 
  CalendarDays, 
  Timer, 
  HeartHandshake, 
  Scroll, 
  BookOpen, 
  Bot, 
  Briefcase,
  Building2,
  UserPlus,
  ShoppingBag,
  UserCheck,
  Users,
  LogIn,
  LogOut,
  HelpCircle,
  Hash,
  Layers,
  Calendar,
  Settings,
  DoorOpen,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Shovel,
  CheckCircle2,
  FileCheck,
  AppWindow,
  Lock,
  Crown,
  Newspaper,
  LayoutDashboard,
  ArrowRightLeft,
  Gift,
  CloudCheck,
  Palette,
  Download,
  Monitor,
  Smartphone,
  Apple,
  Menu,
  X,
  Laptop,
  Music,
  KeyRound,
  Sliders,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { PatrikaSubCategory, BirthDetails } from '../types/astrology';
import { RBACSession } from '../db/rbacStore';
import { evaluateSubscriptionStatus, is3DayTrialActive, start3DayTrial, is7DayTrialActive } from '../db/subscriptionStore';
import { is24HourTrialActive, isClientPurchaseApproved, getStoredClientLeads, syncClientLeadsFromServer } from '../db/clientLeadStore';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { AppDownloadModal, PlatformTab } from './AppDownloadModal';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { DEFAULT_DIRECT_DOWNLOADS, triggerDirectBrowserDownload, isDesktopApp } from '../utils/appVersionManager';
import { getStoredPageServiceConfig, isTabVisibleInNavigation, initSyncPageServiceConfigFromServer, mapTabKeyToFeatureId } from '../db/pageServiceControlStore';
import { checkFeatureAccess } from '../db/menuControlStore';
import { checkServiceAccess, syncUserLicensesFromServer } from '../db/serviceLicenseStore';
import { ChangePasswordModal } from './auth/ChangePasswordModal';
import { mobileHybridSync } from '../services/mobileHybridSync';

// Public menus visible on the first screen before login (Jyotish & Vastu require active trial or purchase license)
export const PUBLIC_UNAUTH_NAV_IDS = new Set<NavTab>([
  'dashboard',
  'panchanga',
  'sewa',
  'vivah',
  'yajaman',
  'calendar',
  'samachar',
  'kharedi',
  'date_converter',
  'org_profile',
  'app_download',
  'books_download',
  'media_download',
]);

export const NORMAL_USER_ALLOWED_TABS = new Set<NavTab>([
  'dashboard',
  'panchanga',
  'sewa',
  'calendar',
  'samachar',
  'date_converter',
  'org_profile',
  'user_dashboard',
  'rashifal',
  'yajaman',
  'kharedi',
  'vivah',
  'settings',
  'my_subscription',
  'apply_expert',
  'help',
  'app_download',
  'books_download',
  'media_download',
]);

export type NavTab = 
  | 'dashboard' 
  | 'panchanga'
  | 'sewa'
  | 'calendar'
  | 'samachar'
  | 'date_converter'
  | 'org_profile'
  | 'prashna'
  | 'ankajyotish'
  | 'kpjyotish'
  | 'neemajyotish'
  | 'patro' // Legacy alias: automatically resolved to 'calendar'
  | 'faladesh' 
  | 'vivah' 
  | 'patrika' 
  | 'settings'
  | 'help'
  | 'jyotishi'
  // Secondary / compatibility tabs:
  | 'user_dashboard'
  | 'rashifal'
  | 'yajaman'
  | 'kundali' 
  | 'dasha' 
  | 'gochar' 
  | 'muhurta' 
  | 'sanskar' 
  | 'vastu'
  | 'kharedi'
  | 'my_subscription'
  | 'apply_expert'
  | 'knowledge' 
  | 'ai_assistant' 
  | 'admin_control'
  | 'user_control'
  | 'store_admin'
  | 'pos'
  | 'news_editor'
  | 'vivah_admin'
  | 'whatsapp_admin'
  | 'aarje'
  | 'app_download'
  | 'books_download'
  | 'media_download';

// Vastu Submenu Modules for quick direct navigation
export const VASTU_SUBMENU_ITEMS: Array<{
  id: 'project' | 'compass' | 'mandala' | 'audit' | 'bhumi' | 'panchatattva' | 'report';
  labelNepali: string;
  labelEnglish: string;
  descriptionNepali: string;
  icon: React.FC<{ className?: string }>;
  badge: string;
  colorClass: string;
}> = [
  {
    id: 'project',
    labelNepali: 'वास्तु परियोजना',
    labelEnglish: 'Vastu Projects Hub',
    descriptionNepali: 'नयाँ परियोजना, ग्राहक विवरण तथा घडेरी नाप व्यवस्थापन',
    icon: FolderPlus,
    badge: 'केन्द्र',
    colorClass: 'text-amber-700 dark:text-amber-300 bg-amber-500/15'
  },
  {
    id: 'compass',
    labelNepali: 'दिशा कम्पास',
    labelEnglish: 'Digital 360° Compass',
    descriptionNepali: '३६०° डिजिटल कम्पास, दिक्पाल दिशा तथा जाइरोस्कोप सेन्सर',
    icon: Compass,
    badge: '३६०°',
    colorClass: 'text-blue-700 dark:text-blue-300 bg-blue-500/15'
  },
  {
    id: 'mandala',
    labelNepali: 'वास्तुपुरुष मण्डल',
    labelEnglish: '81-Pada Mandala',
    descriptionNepali: '१६ दिशा, ९ क्षेत्र, पद देवता, मण्डल ग्रिड तथा दिक्पाल विश्लेषण',
    icon: Layers,
    badge: '८१ पद',
    colorClass: 'text-purple-700 dark:text-purple-300 bg-purple-500/15'
  },
  {
    id: 'audit',
    labelNepali: 'संरचना वास्तु अडिट',
    labelEnglish: 'Room Placement Audit',
    descriptionNepali: 'मुख्यद्वार, भान्छा, पूजा, शयनकक्ष अवस्थिति र तोडफोडविहीन उपचार',
    icon: CheckCircle2,
    badge: 'अङ्कन',
    colorClass: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/15'
  },
  {
    id: 'bhumi',
    labelNepali: 'भूमि परीक्षण',
    labelEnglish: 'Land & Soil Vedic Test',
    descriptionNepali: 'माटोको रङ्ग, स्वाद, खाल्डो परीक्षण, जल धारणा र ढलान परीक्षण',
    icon: Shovel,
    badge: 'माटो',
    colorClass: 'text-amber-800 dark:text-amber-200 bg-amber-700/15'
  },
  {
    id: 'panchatattva',
    labelNepali: 'पञ्चतत्त्व चक्र',
    labelEnglish: '5 Elements Balance',
    descriptionNepali: 'जल, अग्नि, पृथ्वी, वायु र आकाश तत्त्व सन्तुलन विश्लेषण',
    icon: Sparkles,
    badge: 'तत्त्व',
    colorClass: 'text-orange-700 dark:text-orange-300 bg-orange-500/15'
  },
  {
    id: 'report',
    labelNepali: 'वास्तु प्रतिवेदन / प्रमाणपत्र',
    labelEnglish: 'Vastu Audit Certificate',
    descriptionNepali: 'आधिकारिक संस्थागत लेटरहेडसहितको प्रिन्ट योग्य वास्तु प्रमाणपत्र',
    icon: FileCheck,
    badge: 'प्रमाणपत्र',
    colorClass: 'text-red-700 dark:text-red-300 bg-red-500/15'
  }
];

export interface NavigationProps {
  activeTab: NavTab;
  activeModule?: 'MAIN' | 'JYOTISH';
  onTabChange: (tab: NavTab, subTab?: PatrikaSubCategory | string) => void;
  onEnterJyotish?: () => void;
  onOpenSettingsModal?: (tab?: 'astro' | 'letterhead') => void;
  rbacSession?: RBACSession | null;
  onOpenAuthModal?: () => void;
  onLogoutRBAC?: () => void;
  onOpenVastuModal?: (subTab?: any) => void;
  hasFullAccess?: boolean;
  onOpenPurchaseModal?: (lockedFeatureName?: string) => void;
  onOpenServiceLockedModal?: (serviceKey: 'jyotish' | 'vastu') => void;
  onOpenDateConverter?: () => void;
  onOpenOrgProfile?: () => void;
  onOpenThemeModal?: () => void;
  profiles?: BirthDetails[];
}

// Primary Main Menu Navigation Items
export const MAIN_NAV_ITEMS: Array<{ 
  id: NavTab; 
  labelNepali: string; 
  icon: React.FC<{ className?: string }>; 
  isJyotishWorkspace?: boolean;
  highlight?: boolean;
  hasSubmenu?: boolean;
}> = [
  { id: 'dashboard', labelNepali: 'गृहपृष्ठ', icon: Home },
  { id: 'panchanga', labelNepali: 'पञ्चाङ्ग', icon: Clock },
  { id: 'jyotishi', labelNepali: 'ज्योतिष सेवा', icon: Sparkles, isJyotishWorkspace: true, highlight: true },
  { id: 'vastu', labelNepali: 'वास्तु सेवा', icon: Compass, highlight: true },
  { id: 'vivah', labelNepali: 'विवाह', icon: HeartHandshake },
  { id: 'yajaman', labelNepali: 'यजमान', icon: Users },
  { id: 'samachar', labelNepali: 'समाचार', icon: Newspaper },
  { id: 'kharedi', labelNepali: 'पसल', icon: ShoppingBag },
  { id: 'org_profile', labelNepali: 'संस्था', icon: Building2 },
];

export const ANYA_FALADESH_ITEMS: Array<{
  id: NavTab;
  labelNepali: string;
  labelEnglish: string;
  descriptionNepali: string;
  icon: React.FC<{ className?: string }>;
  badge: string;
}> = [
  {
    id: 'prashna',
    labelNepali: 'प्रश्न ज्योतिष',
    labelEnglish: 'Prashna Horary',
    descriptionNepali: 'तत्काल प्रश्न, देवज्ञ उत्तर तथा प्रश्न फल',
    icon: HelpCircle,
    badge: 'प्रश्न'
  },
  {
    id: 'ankajyotish',
    labelNepali: 'अंक ज्योतिष',
    labelEnglish: 'Numerology',
    descriptionNepali: 'मूलाङ्क, भाग्याङ्क र नामाङ्क विश्लेषण',
    icon: Hash,
    badge: 'अंक'
  },
  {
    id: 'kpjyotish',
    labelNepali: 'केपी ज्योतिष',
    labelEnglish: 'KP Krishnamurti System',
    descriptionNepali: 'कृष्णमूर्ति पद्धति, उप-स्वामी (Sub-Lord) र कस्प',
    icon: Compass,
    badge: 'केपी'
  },
  {
    id: 'neemajyotish',
    labelNepali: 'नेमा ज्योतिष',
    labelEnglish: 'Tibetan Astrology',
    descriptionNepali: 'तिब्बती पञ्चतत्व, ९ मेवा र ८ पार्खा',
    icon: Compass,
    badge: 'नेमा'
  },
];

export const SAHAYAK_JYOTISH_ITEMS = ANYA_FALADESH_ITEMS;

export const PATRIKA_SUBMENUS: Array<{ key: PatrikaSubCategory; label: string }> = [
  { key: 'brihat_china', label: 'बृहत् चिना' },
  { key: 'china', label: 'चिना' },
  { key: 'tippan', label: 'टिप्पन' },
  { key: 'vivah', label: 'विवाह पत्रिका' },
  { key: 'bartabandha', label: 'व्रतबन्ध' },
  { key: 'upanayan', label: 'उपनयन' },
  { key: 'naamkaran', label: 'नामकरण' },
  { key: 'grihapravesh', label: 'गृहप्रवेश' },
  { key: 'muhurta', label: 'मुहूर्त पत्रिका' },
  { key: 'dasha', label: 'दशा विवरण' },
  { key: 'graha', label: 'ग्रह विवरण' },
  { key: 'varga', label: 'वर्ग कुण्डली' },
  { key: 'bhavachalit', label: 'भावचलित' },
  { key: 'gochar', label: 'गोचर' },
  { key: 'faladesh', label: 'फलादेश' },
  { key: 'anya', label: 'अन्य पत्रिका' },
];

export interface TabTransitionProps {
  activeTab: NavTab;
  children: React.ReactNode;
  className?: string;
}

/**
 * TabTransition component powered by Framer Motion.
 * Smoothly animates view transitions when switching between active tabs in the main layout.
 */
export const TabTransition: React.FC<TabTransitionProps> = ({
  activeTab,
  children,
  className = 'w-full flex-1 flex flex-col min-h-0',
}) => {
  return (
    <div
      key={activeTab}
      className={`${className} animate-in fade-in duration-75`}
    >
      {children}
    </div>
  );
};

export const Navigation: React.FC<NavigationProps> = memo(({
  activeTab,
  activeModule = 'MAIN',
  onTabChange,
  onEnterJyotish,
  onOpenSettingsModal,
  rbacSession,
  onOpenAuthModal,
  onLogoutRBAC,
  onOpenVastuModal,
  hasFullAccess = false,
  onOpenPurchaseModal,
  onOpenServiceLockedModal,
  onOpenDateConverter,
  onOpenOrgProfile,
  onOpenThemeModal,
  profiles = [],
}) => {
  const [licenseRevision, setLicenseRevision] = useState(0);

  useEffect(() => {
    const handleLicenseUpdate = () => {
      setLicenseRevision((v) => v + 1);
    };
    window.addEventListener('service-license-updated', handleLicenseUpdate);
    window.addEventListener('storage', handleLicenseUpdate);
    window.addEventListener('trial-status-updated', handleLicenseUpdate);
    window.addEventListener('software-full-access-updated', handleLicenseUpdate);
    window.addEventListener('client-leads-updated', handleLicenseUpdate);
    window.addEventListener('subscription-status-updated', handleLicenseUpdate);

    // Initial server sync for user licenses and client leads if user is logged in
    const userPhone = rbacSession?.phone || rbacSession?.username;
    if (userPhone) {
      syncUserLicensesFromServer(userPhone);
      syncClientLeadsFromServer();
    }

    return () => {
      window.removeEventListener('service-license-updated', handleLicenseUpdate);
      window.removeEventListener('storage', handleLicenseUpdate);
      window.removeEventListener('trial-status-updated', handleLicenseUpdate);
      window.removeEventListener('software-full-access-updated', handleLicenseUpdate);
      window.removeEventListener('client-leads-updated', handleLicenseUpdate);
      window.removeEventListener('subscription-status-updated', handleLicenseUpdate);
    };
  }, [rbacSession]);

  const isJyotishUnlocked = useMemo(() => {
    return checkServiceAccess('jyotish', rbacSession).allowed;
  }, [rbacSession, licenseRevision]);

  const isVastuUnlocked = useMemo(() => {
    return checkServiceAccess('vastu', rbacSession).allowed;
  }, [rbacSession, licenseRevision]);

  const [isSewaMenuOpen, setIsSewaMenuOpen] = useState(false);
  const [sewaDropdownPosition, setSewaDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isUnifiedSettingsOpen, setIsUnifiedSettingsOpen] = useState(false);
  const [isCloudSyncModalOpen, setIsCloudSyncModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
  const [downloadModalPlatform, setDownloadModalPlatform] = useState<PlatformTab>('WINDOWS');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [expandedMobileSections, setExpandedMobileSections] = useState<Record<string, boolean>>({
    jyotish: true,
    vastu: false,
    karmakanda: false,
    vivah: false,
    store: false,
    downloads: false,
    settings: false,
    admin: false,
  });

  const toggleMobileSection = (key: string) => {
    setExpandedMobileSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const sewaButtonRef = useRef<HTMLButtonElement>(null);
  const sewaMenuRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const unifiedSettingsRef = useRef<HTMLDivElement>(null);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  const isSuperOrStoreAdmin =
    rbacSession?.role === 'SUPER_ADMIN' ||
    rbacSession?.role === 'STORE_ADMIN' ||
    rbacSession?.role === 'POS_STAFF';

  const userPhoneDigits = (rbacSession?.phone || rbacSession?.username || '').replace(/\D/g, '').slice(-10);
  const userLeads = getStoredClientLeads();
  const currentUserLead = userPhoneDigits
    ? userLeads.find((l) => (l.mobile || l.whatsapp || '').replace(/\D/g, '').slice(-10) === userPhoneDigits)
    : null;
  const isRegisteredOnlyUser = currentUserLead?.status === 'REGISTERED_USER';
  const isUserTrialActive = currentUserLead
    ? (currentUserLead.status === 'TRIAL_ACTIVE' && !!currentUserLead.trialExpiresAtISO && new Date(currentUserLead.trialExpiresAtISO).getTime() > Date.now())
    : (rbacSession ? false : (is24HourTrialActive() || is3DayTrialActive() || is7DayTrialActive()));
  const isUserApprovedClient = currentUserLead
    ? currentUserLead.status === 'PURCHASE_APPROVED'
    : isClientPurchaseApproved();

  const isFullyUnlocked = isSuperOrStoreAdmin || (!isRegisteredOnlyUser && (!!hasFullAccess || isUserTrialActive || isUserApprovedClient));

  const updateSewaPosition = () => {
    if (sewaButtonRef.current) {
      const rect = sewaButtonRef.current.getBoundingClientRect();
      const dropdownWidth = 360;
      let calculatedLeft = rect.left;
      if (calculatedLeft + dropdownWidth > window.innerWidth - 12) {
        calculatedLeft = window.innerWidth - dropdownWidth - 12;
      }
      setSewaDropdownPosition({
        top: rect.bottom + 6,
        left: Math.max(8, calculatedLeft),
      });
    }
  };

  const toggleSewaMenu = () => {
    if (!isSewaMenuOpen) {
      updateSewaPosition();
      setIsUnifiedSettingsOpen(false);
    }
    setIsSewaMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sewaMenuRef.current &&
        !sewaMenuRef.current.contains(e.target as Node) &&
        sewaButtonRef.current &&
        !sewaButtonRef.current.contains(e.target as Node)
      ) {
        setIsSewaMenuOpen(false);
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target as Node)) {
        setIsSettingsMenuOpen(false);
      }
      if (unifiedSettingsRef.current && !unifiedSettingsRef.current.contains(e.target as Node)) {
        setIsUnifiedSettingsOpen(false);
      }
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(e.target as Node)) {
        setIsDownloadDropdownOpen(false);
      }
    };
    const handleScrollOrResize = () => {
      if (isSewaMenuOpen) {
        updateSewaPosition();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isSewaMenuOpen]);

  // Lock body scroll and register Android hardware back button handler when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
      const unregister = mobileHybridSync.registerBackButtonHandler(() => {
        setIsMobileDrawerOpen(false);
        return true;
      });
      return () => {
        document.body.style.overflow = '';
        unregister();
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileDrawerOpen]);

  const handle3DayTrialClick = () => {
    if (is3DayTrialActive()) {
      if (onOpenPurchaseModal) {
        onOpenPurchaseModal('पूर्ण सदस्यता');
      }
    } else {
      start3DayTrial();
      window.dispatchEvent(new CustomEvent('software-full-access-updated', { detail: { hasFullAccess: true } }));
      window.dispatchEvent(new CustomEvent('trial-status-updated'));
      alert('३ दिने (७२ घण्टा) निःशुल्क परीक्षण सक्रिय भयो! अब सम्पूर्ण कुण्डली, फलादेश तथा वास्तुशास्त्र सुविधाहरू खुला भएका छन्।');
    }
  };

  const [pageServiceCfg, setPageServiceCfg] = useState(getStoredPageServiceConfig);
  const [navVersion, setNavVersion] = useState(0);

  useEffect(() => {
    // Initial fetch from server
    initSyncPageServiceConfigFromServer();

    const handleCfg = () => {
      setPageServiceCfg(getStoredPageServiceConfig());
      setNavVersion((v) => v + 1);
    };

    let pageBc: BroadcastChannel | null = null;
    let policyBc: BroadcastChannel | null = null;
    try {
      pageBc = new BroadcastChannel('balananda_page_service_control_channel');
      pageBc.onmessage = handleCfg;
    } catch {}
    try {
      policyBc = new BroadcastChannel('balananda_client_policy_channel');
      policyBc.onmessage = handleCfg;
    } catch {}

    const handleWindowFocus = () => {
      initSyncPageServiceConfigFromServer();
    };

    window.addEventListener('page-service-control-updated', handleCfg);
    window.addEventListener('client-policies-updated', handleCfg);
    window.addEventListener('storage', handleCfg);
    window.addEventListener('focus', handleWindowFocus);

    // Periodic sync every 10 seconds to detect any superadmin menu updates across devices immediately
    const syncInterval = setInterval(() => {
      initSyncPageServiceConfigFromServer();
    }, 10000);

    return () => {
      window.removeEventListener('page-service-control-updated', handleCfg);
      window.removeEventListener('client-policies-updated', handleCfg);
      window.removeEventListener('storage', handleCfg);
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(syncInterval);
      if (pageBc) pageBc.close();
      if (policyBc) policyBc.close();
    };
  }, []);

  // When not logged in: only show first screen public menus (गृहपृष्ठ, पञ्चाङ्ग, पात्रो, समाचार, मिति रूपान्तरण, संस्था प्रोफाइल)
  // When logged in: show normal user allowed menus (respecting Page Control switchboard + User Control per-mobile overrides)
  // NOTE: Super Admin Portal is completely isolated at /superadmin and never leaks into the client navigation bar!
  const baseNavItems = useMemo(() => {
    return rbacSession
      ? [...MAIN_NAV_ITEMS]
      : MAIN_NAV_ITEMS.filter((item) => PUBLIC_UNAUTH_NAV_IDS.has(item.id));
  }, [rbacSession]);

  const visibleNavItems = useMemo(() => {
    return baseNavItems.filter((item) => isTabVisibleInNavigation(item.id).visible);
  }, [baseNavItems, pageServiceCfg, navVersion]);

  return (
    <nav className="text-[#2D241E] dark:text-stone-100 transition-colors">
      {/* 📱 Dedicated Mobile Top Navigation Bar (< 768px / md:hidden) */}
      <div className="md:hidden flex items-center justify-between px-3 py-2 bg-[#FBF7EE] dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 shadow-2xs">
        {/* Left: Branding & Active Section Title */}
        <button
          type="button"
          onClick={() => onTabChange('dashboard')}
          className="flex items-center gap-2 min-w-0 text-left cursor-pointer active:opacity-80 transition-opacity"
          title="गृहपृष्ठमा जानुहोस्"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7A1C1C] to-[#931F1F] text-amber-300 font-serif font-black flex items-center justify-center text-sm shadow-xs shrink-0 border border-amber-400/40">
            ॐ
          </div>
          <div className="min-w-0">
            <span className="font-serif font-black text-xs sm:text-sm text-[#7A1C1C] dark:text-amber-400 block truncate leading-tight">
              बालानन्द ज्योतिष
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-[10px] text-stone-600 dark:text-stone-300 font-semibold truncate leading-tight">
                {activeModule === 'JYOTISH' ? 'ज्योतिष सेवा' : activeTab === 'vastu' ? 'वास्तु सेवा' : (MAIN_NAV_ITEMS.find((i) => i.id === activeTab)?.labelNepali || activeTab)}
              </span>
            </div>
          </div>
        </button>

        {/* Right: Quick actions + Prominent Hamburger Button (>= 44x44px touch targets) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {rbacSession ? (
            <div
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-[11px] font-bold text-[#7A1C1C] dark:text-amber-300 max-w-[120px] truncate"
              title={rbacSession.fullName}
            >
              <div className="w-5 h-5 rounded-full bg-[#7A1C1C] text-amber-300 flex items-center justify-center text-[10px] shrink-0 font-serif font-black">
                {rbacSession.fullName?.charAt(0) || 'U'}
              </div>
              <span className="truncate">{rbacSession.fullName}</span>
            </div>
          ) : (
            onOpenAuthModal && (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="min-h-[44px] min-w-[44px] px-2.5 py-1.5 bg-[#7A1C1C] hover:bg-[#8B2323] text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition-all"
                title="साइन इन / लगइन"
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                <span className="hidden xs:inline">साइन इन</span>
              </button>
            )
          )}

          {/* Prominent Hamburger Drawer Trigger (>= 44x44px) */}
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen((prev) => !prev)}
            className={`min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl border shadow-xs flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-95 ${
              isMobileDrawerOpen
                ? 'bg-[#7A1C1C] text-amber-300 border-[#5C1515] ring-2 ring-amber-400/50'
                : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100'
            }`}
            aria-label={isMobileDrawerOpen ? 'मेनु बन्द गर्नुहोस्' : 'मेनु खोल्नुहोस्'}
            aria-expanded={isMobileDrawerOpen}
            title="सम्पूर्ण मेनु सूची हेर्नुहोस् (Menu)"
          >
            {isMobileDrawerOpen ? (
              <X className="w-5 h-5 text-current" />
            ) : (
              <Menu className="w-5 h-5 text-current" />
            )}
          </button>
        </div>
      </div>

      {/* 💻 Desktop & Tablet Navigation Bar (>= 768px / hidden md:flex) */}
      <div className="hidden md:flex max-w-[1700px] w-full mx-auto px-2 sm:px-3 py-1.5 items-center justify-between gap-1.5 sm:gap-2 relative">

        {/* ☰ Mobile / Tablet Hamburger Dropdown Button (3rd Image Style) */}
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen((prev) => !prev)}
          className={`xl:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl border shadow-xs shrink-0 cursor-pointer transition-all duration-150 ${
            isMobileDrawerOpen
              ? 'bg-[#7A1C1C] text-amber-300 border-[#5C1515] ring-2 ring-amber-400/40'
              : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 active:scale-95'
          }`}
          aria-label={isMobileDrawerOpen ? 'मेनु बन्द गर्नुहोस्' : 'मेनु खोल्नुहोस्'}
          aria-expanded={isMobileDrawerOpen}
          title="सम्पूर्ण मेनु सूची हेर्नुहोस् (Menu)"
        >
          {isMobileDrawerOpen ? (
            <X className="w-5 h-5 text-current" />
          ) : (
            <svg
              className="w-5 h-5 text-current"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          )}
        </button>

        {/* Main Navigation Items - Compact Horizontally Scrollable Layout */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-1 min-w-0 py-0.5">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isSewa = item.id === 'sewa';
            const isJyotishi = item.id === 'jyotishi';
            const isVastu = item.id === 'vastu';

            const isActive = isJyotishi
              ? (activeModule === 'JYOTISH' || activeTab === 'jyotishi')
              : isVastu
              ? activeTab === 'vastu'
              : isSewa
              ? activeTab === 'sewa'
              : activeTab === item.id && activeModule === 'MAIN';

            const featId = mapTabKeyToFeatureId(item.id);
            const featureAccess = checkFeatureAccess(featId);
            const isClosed = featureAccess.state === 'close';

            // User-Specific Service Licensing (strictly for Jyotish and Vastu only)
            const isServiceLocked = isJyotishi ? !isJyotishUnlocked : isVastu ? !isVastuUnlocked : false;
            const isLocked = isServiceLocked || (featureAccess.state === 'lock' && !isJyotishi && !isVastu);

            if (isSewa) {
              return (
                <React.Fragment key={item.id}>
                  <motion.button
                    ref={sewaButtonRef}
                    type="button"
                    whileHover={{ scale: isClosed ? 1 : 1.02 }}
                    whileTap={{ scale: isClosed ? 1 : 0.97 }}
                    onClick={toggleSewaMenu}
                    className={`relative flex items-center gap-1 px-2 py-1 lg:px-2.5 lg:py-1.5 rounded-xl font-bold text-[11px] sm:text-[11.5px] lg:text-[12.5px] whitespace-nowrap cursor-pointer transition-colors duration-150 border shrink-0 ${
                      isClosed
                        ? 'opacity-40 grayscale cursor-not-allowed bg-stone-200/50 dark:bg-stone-900/50 text-stone-400 border-stone-300 dark:border-stone-800'
                        : isActive
                        ? 'text-amber-300 ring-2 ring-amber-500/50 shadow-md border-transparent bg-gradient-to-r from-[#7A1C1C] via-[#9B2C2C] to-[#5C1515]'
                        : isSewaMenuOpen
                        ? 'bg-amber-100 dark:bg-stone-800 text-[#7A1C1C] dark:text-amber-400 border-amber-300 dark:border-stone-700 shadow-2xs'
                        : 'bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700/80 text-[#2D241E] dark:text-stone-200 border-[#E6E0D5] dark:border-stone-700 shadow-2xs'
                    }`}
                    title={isClosed ? `${item.labelNepali} (प्रशासकद्वारा बन्द)` : item.labelNepali}
                  >
                    {isActive && !isClosed && (
                      <motion.div
                        layoutId="mainNavActivePill"
                        className="absolute inset-0 rounded-xl pointer-events-none bg-gradient-to-r from-[#7A1C1C] via-[#9B2C2C] to-[#5C1515] border border-[#7A1C1C]"
                        transition={{
                          type: 'spring',
                          stiffness: 420,
                          damping: 32,
                        }}
                      />
                    )}

                    <span className="relative z-10 flex items-center gap-1">
                      <Icon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{item.labelNepali}</span>
                      <ChevronDown
                        className={`w-3 h-3 transition-transform duration-200 ${
                          isSewaMenuOpen ? 'rotate-180 text-amber-400' : 'opacity-70'
                        }`}
                      />
                    </span>
                  </motion.button>
                </React.Fragment>
              );
            }

            const handleTabClick = () => {
              if (isClosed) {
                alert(featureAccess.reasonNepali || 'यो मेनु मुख्य प्रशासक (Super Admin) द्वारा बन्द गरिएको छ।');
                return;
              }

              if (isLocked) {
                if (onOpenPurchaseModal) {
                  onOpenPurchaseModal(item.labelNepali);
                } else {
                  alert(featureAccess.reasonNepali || 'यो सुविधा लक गरिएको छ। खोल्नका लागि सुपरएडमिनसँग सम्पर्क गर्नुहोस्।');
                }
                return;
              }

              if (isJyotishi) {
                if (onEnterJyotish) {
                  onEnterJyotish();
                } else {
                  onTabChange('jyotishi');
                }
                return;
              }

              if (isVastu) {
                onTabChange('vastu');
                return;
              }

              if (!rbacSession && !PUBLIC_UNAUTH_NAV_IDS.has(item.id)) {
                if (onOpenAuthModal) {
                  onOpenAuthModal();
                }
                return;
              }

              if (item.id === 'settings' && onOpenSettingsModal) {
                onOpenSettingsModal('astro');
              } else {
                onTabChange(item.id);
              }
            };

            return (
              <React.Fragment key={item.id}>
                <motion.button
                  type="button"
                  whileHover={{ scale: isClosed ? 1 : 1.02 }}
                  whileTap={{ scale: isClosed ? 1 : 0.97 }}
                  onClick={handleTabClick}
                  className={`relative flex items-center gap-1 px-2 py-1 lg:px-2.5 lg:py-1.5 rounded-xl font-bold text-[11px] sm:text-[11.5px] lg:text-[12.5px] whitespace-nowrap cursor-pointer transition-colors duration-150 border shrink-0 ${
                    isClosed
                      ? 'opacity-40 grayscale cursor-not-allowed bg-stone-200/50 dark:bg-stone-900/50 text-stone-400 border-stone-300 dark:border-stone-800'
                      : isLocked
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300'
                      : isActive
                      ? 'text-white ring-2 ring-[#7A1C1C]/30 shadow-md border-transparent'
                      : 'bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700/80 text-[#2D241E] dark:text-stone-200 border-[#E6E0D5] dark:border-stone-700 shadow-2xs'
                  }`}
                  title={isClosed ? `${item.labelNepali} (प्रशासकद्वारा बन्द)` : isLocked ? `${item.labelNepali} (लक गरिएको)` : item.labelNepali}
                >
                  {/* Animated active pill using Framer Motion layoutId */}
                  {isActive && !isClosed && (
                    <motion.div
                      layoutId="mainNavActivePill"
                      className="absolute inset-0 rounded-xl pointer-events-none bg-[#7A1C1C] border border-[#5C1515]"
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 32,
                      }}
                    />
                  )}

                  <span className="relative z-10 flex items-center gap-1">
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isClosed
                          ? 'text-stone-400'
                          : isActive
                          ? 'text-amber-300'
                          : 'text-[#7A1C1C] dark:text-amber-400'
                      }`}
                    />
                    <span>{item.labelNepali}</span>
                    {isLocked && <Lock className="w-2.5 h-2.5 text-amber-500 ml-0.5" />}
                    {isClosed && <span className="text-[9px] px-1 py-0 rounded bg-stone-700 text-stone-200 ml-0.5">बन्द</span>}
                  </span>
                </motion.button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Right Section: Dropdowns and User Actions (Outside overflow-x-auto so dropdowns float on front!) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 relative z-50">

          {/* डाउनलोड Dropdown Menu: 1. Application Download  2. Books Download  3. Media Download */}
          <div className="relative shrink-0 z-50" ref={downloadMenuRef}>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsDownloadDropdownOpen(!isDownloadDropdownOpen)}
              className={`relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs sm:text-[13px] whitespace-nowrap cursor-pointer transition-colors duration-150 border shrink-0 ${
                isDownloadDropdownOpen || activeTab === 'app_download' || activeTab === 'books_download' || activeTab === 'media_download'
                  ? 'bg-[#7A1C1C] text-white border-[#5C1515] ring-2 ring-[#7A1C1C]/30 shadow-md'
                  : 'bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700/80 text-[#2D241E] dark:text-stone-200 border-[#E6E0D5] dark:border-stone-700 shadow-2xs'
              }`}
              title="डाउनलोड केन्द्र: एप्लिकेसन, पुस्तक तथा वैदिक मिडिया डाउनलोड"
            >
              <Download className={`w-4 h-4 ${isDownloadDropdownOpen || activeTab === 'app_download' || activeTab === 'books_download' || activeTab === 'media_download' ? 'text-amber-300' : 'text-[#7A1C1C] dark:text-amber-400'}`} />
              <span>डाउनलोड</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDownloadDropdownOpen ? 'rotate-180 text-amber-400' : 'opacity-70'}`} />
            </motion.button>

            {isDownloadDropdownOpen && (
              <div className="absolute right-0 sm:right-auto sm:left-0 mt-1.5 w-[calc(100vw-24px)] max-w-sm sm:w-92 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border-2 border-amber-400/80 dark:border-stone-700 p-2.5 z-[100] animate-in fade-in slide-in-from-top-1">
                {/* Header */}
                <div className="px-3 py-2 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#7A1C1C]/10 dark:bg-amber-500/15 flex items-center justify-center text-[#7A1C1C] dark:text-amber-400">
                      <Download className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-100">
                      📥 डाउनलोड केन्द्र (Downloads)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60">
                    १००% अफलाइन
                  </span>
                </div>

                {/* 3 Sub-menu Pages */}
                <div className="py-1.5 space-y-1">
                  {/* 1. Application Download */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsDownloadDropdownOpen(false);
                      onTabChange('app_download');
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-start gap-2.5 transition-all cursor-pointer group border ${
                      activeTab === 'app_download'
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800'
                        : 'hover:bg-blue-50/70 dark:hover:bg-stone-800 border-transparent hover:border-blue-200 dark:hover:border-stone-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 group-hover:text-blue-700 dark:group-hover:text-blue-400">
                          १. Application Download
                        </span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                          App Hub
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                        Windows (.exe), Android (.apk), Mac (.dmg), iOS
                      </p>
                    </div>
                  </button>

                  {/* 2. Books Download */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsDownloadDropdownOpen(false);
                      onTabChange('books_download');
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-start gap-2.5 transition-all cursor-pointer group border ${
                      activeTab === 'books_download'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                        : 'hover:bg-amber-50/70 dark:hover:bg-stone-800 border-transparent hover:border-amber-200 dark:hover:border-stone-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400">
                          २. Books Download (पुस्तक)
                        </span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                          PDF ई-बुक
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                        वैदिक धर्मशास्त्र, कर्मकाण्ड, पूजा तथा मन्त्र ई-पुस्तकहरू (PDF)
                      </p>
                    </div>
                  </button>

                  {/* 3. Media Download */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsDownloadDropdownOpen(false);
                      onTabChange('media_download');
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-start gap-2.5 transition-all cursor-pointer group border ${
                      activeTab === 'media_download'
                        ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-300 dark:border-cyan-800'
                        : 'hover:bg-cyan-50/70 dark:hover:bg-stone-800 border-transparent hover:border-cyan-200 dark:hover:border-stone-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 group-hover:text-cyan-700 dark:group-hover:text-cyan-400">
                          ३. Media Download (मिडिया)
                        </span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300">
                          Audio & 4K
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                        मन्त्र स्तोत्र अडियो (MP3), HD वालपेपर, पोस्टर तथा चार्टहरू
                      </p>
                    </div>
                  </button>
                </div>

                {/* Footer */}
                <div className="mt-1 pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px] px-1">
                  <span className="text-stone-500 dark:text-stone-400">स्वचालित लाइभ अपडेट</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDownloadDropdownOpen(false);
                      setIsDownloadModalOpen(true);
                    }}
                    className="text-[#7A1C1C] dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>१-क्लिक इन्स्टल पपअप</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* एकीकृत सेटिङ, मद्दत, क्लाउड सिंक तथा सुपरएडमिन Dropdown Menu */}
          <div className="relative shrink-0 z-50" ref={unifiedSettingsRef}>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsUnifiedSettingsOpen(!isUnifiedSettingsOpen)}
              className={`relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs sm:text-[13px] whitespace-nowrap cursor-pointer transition-colors duration-150 border shrink-0 ${
                isUnifiedSettingsOpen || activeTab === 'settings' || activeTab === 'help'
                  ? 'bg-[#7A1C1C] text-white border-[#5C1515] ring-2 ring-[#7A1C1C]/30 shadow-md'
                  : 'bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700/80 text-[#2D241E] dark:text-stone-200 border-[#E6E0D5] dark:border-stone-700 shadow-2xs'
              }`}
              title="प्रणाली सेटिङ, लेटरहेड, मद्दत तथा क्लाउड सिंक"
            >
              <Settings className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isUnifiedSettingsOpen || activeTab === 'settings' || activeTab === 'help' ? 'text-amber-300' : 'text-[#7A1C1C] dark:text-amber-400'}`} />
              <span>सेटिङ</span>
              {/* Green status indicator dot for healthy cloud sync */}
              <span className="relative flex h-2 w-2 ml-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isUnifiedSettingsOpen ? 'rotate-180 text-amber-400' : 'opacity-70'}`} />
            </motion.button>

            {isUnifiedSettingsOpen && (
              <div className="absolute right-0 mt-1.5 w-[calc(100vw-24px)] max-w-sm sm:w-96 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border-2 border-amber-400/80 dark:border-stone-700 p-2.5 z-[100] animate-in fade-in slide-in-from-top-1">
                {/* Header */}
                <div className="px-3 py-2 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#7A1C1C]/10 dark:bg-amber-500/15 flex items-center justify-center text-[#7A1C1C] dark:text-amber-400">
                      <Settings className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-100">
                      प्रणाली सेटिङ तथा सेवा
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    क्लाउड सुरक्षित
                  </span>
                </div>

                {/* Options List */}
                <div className="py-1.5 space-y-1">
                  {/* 1. Jyotish & System Settings */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsUnifiedSettingsOpen(false);
                      if (onOpenSettingsModal) onOpenSettingsModal('astro');
                    }}
                    className="w-full text-left p-2 rounded-xl flex items-start gap-2.5 transition-all cursor-pointer hover:bg-amber-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs sm:text-sm">१. प्रणाली तथा ज्योतिष गणना</span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-300">
                          गणना
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                        अयनांश, ग्रह स्पष्ट विधि, पञ्चाङ्ग तथा मुद्रण लेआउट मिलाउने
                      </p>
                    </div>
                  </button>

                  {/* 2. Letterhead Banner Settings */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsUnifiedSettingsOpen(false);
                      if (onOpenSettingsModal) onOpenSettingsModal('letterhead');
                    }}
                    className="w-full text-left p-2 rounded-xl flex items-start gap-2.5 transition-all cursor-pointer hover:bg-amber-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/15 text-[#7A1C1C] dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs sm:text-sm">२. लेटरहेड ब्यानर सेटिङ</span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-red-100 dark:bg-stone-800 text-red-800 dark:text-red-300">
                          ब्यानर
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                        आफ्नो नाम, ठेगाना, संस्था लोगो र आधिकारिक ब्यानर मिलाउने
                      </p>
                    </div>
                  </button>

                  {/* 3. Cloud Sync & Backup */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsUnifiedSettingsOpen(false);
                      setIsCloudSyncModalOpen(true);
                    }}
                    className="w-full text-left p-2 rounded-xl flex items-start gap-2.5 transition-all cursor-pointer hover:bg-emerald-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <CloudCheck className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs sm:text-sm">३. क्लाउड सिंक तथा ब्याकअप</span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-stone-800 text-emerald-800 dark:text-emerald-300">
                          क्लाउड
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                        कुण्डली डेटा, ब्याकअप, पुनर्स्थापना (Restore) र सुरक्षित सिंक
                      </p>
                    </div>
                  </button>

                  {/* 4. Help & Documentation */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsUnifiedSettingsOpen(false);
                      onTabChange('help');
                    }}
                    className="w-full text-left p-2 rounded-xl flex items-start gap-2.5 transition-all cursor-pointer hover:bg-amber-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs sm:text-sm">४. मद्दत तथा ट्यूटोरियल</span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-300">
                          मद्दत
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                        सफ्टवेयर प्रयोग विधि, ट्यूटोरियल तथा प्रायः सोधिने प्रश्नहरू (FAQ)
                      </p>
                    </div>
                  </button>

                  {/* 5. Software Theme & Client Customization */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsUnifiedSettingsOpen(false);
                      if (onOpenThemeModal) onOpenThemeModal();
                    }}
                    className="w-full text-left p-2 rounded-xl flex items-start gap-2.5 transition-all cursor-pointer hover:bg-amber-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Palette className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs sm:text-sm">५. सफ्टवेयर थिम र यजमान सूचना</span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-300">
                          थिम
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                        ५ वटा वैदिक रङ्ग, पृष्ठभूमि तथा यजमानलाई सन्देश प्रसारण
                      </p>
                    </div>
                  </button>
                  {/* 7. Store & Digital Library Admin */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsUnifiedSettingsOpen(false);
                      onTabChange('store_admin');
                    }}
                    className="w-full text-left p-2 rounded-xl flex items-start gap-2.5 transition-all cursor-pointer hover:bg-amber-500/10 dark:hover:bg-amber-950/40 text-stone-800 dark:text-stone-200 group border border-amber-500/30"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs sm:text-sm text-[#7A1C1C] dark:text-amber-300">
                          ७. स्टोर एवं डिजिटल पुस्तकालय एडमिन
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-300">
                          Store Admin
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                        सामग्री, अर्डर, भुक्तानी, PDF ग्रन्थ तथा अटो-कभर व्यवस्थापन
                      </p>
                    </div>
                  </button>

                  {/* 8. POS Billing Terminal */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsUnifiedSettingsOpen(false);
                      onTabChange('pos');
                    }}
                    className="w-full text-left p-2 rounded-xl flex items-start gap-2.5 transition-all cursor-pointer hover:bg-amber-500/10 dark:hover:bg-amber-950/40 text-stone-800 dark:text-stone-200 group border border-amber-500/20"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                          ८. काउन्टर POS बिलिङ टर्मिनल
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                          POS
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                        काउन्टर प्रत्यक्ष बिक्री, इनभ्वाइस तथा रसिद प्रिन्ट
                      </p>
                    </div>
                  </button>

                  {/* 9. News Editor Dashboard */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsUnifiedSettingsOpen(false);
                      onTabChange('news_editor');
                    }}
                    className="w-full text-left p-2 rounded-xl flex items-start gap-2.5 transition-all cursor-pointer hover:bg-amber-500/10 dark:hover:bg-amber-950/40 text-stone-800 dark:text-stone-200 group border border-amber-500/20"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Newspaper className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                          ९. समाचार तथा लेख सम्पादक
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          News
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                        पञ्चाङ्ग, चाडपर्व, खगोल तथा ज्योतिष समाचार प्रकाशन
                      </p>
                    </div>
                  </button>

                  {/* 10. Vivah Supervisor Dashboard */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsUnifiedSettingsOpen(false);
                      onTabChange('vivah_admin');
                    }}
                    className="w-full text-left p-2 rounded-xl flex items-start gap-2.5 transition-all cursor-pointer hover:bg-amber-500/10 dark:hover:bg-amber-950/40 text-stone-800 dark:text-stone-200 group border border-amber-500/20"
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                          १०. विवाह बायोडाटा सुपरभाइजर
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                          Marriage
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                        वैवाहिक प्रोफाइल प्रमाणीकरण तथा वर-वधु म्याचिङ
                      </p>
                    </div>
                  </button>

                  {/* 11. Daily WhatsApp Dispatch Manager */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsUnifiedSettingsOpen(false);
                      onTabChange('whatsapp_admin');
                    }}
                    className="w-full text-left p-2 rounded-xl flex items-start gap-2.5 transition-all cursor-pointer hover:bg-amber-500/10 dark:hover:bg-amber-950/40 text-stone-800 dark:text-stone-200 group border border-amber-500/20"
                  >
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-700 dark:text-green-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                          ११. दैनिक ह्वाट्सएप डिस्प्याच व्यवस्थापक
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300">
                          WhatsApp
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                        दैनिक पञ्चाङ्ग, राशिफल तथा उत्सव सन्देश स्वचालित प्रसारण
                      </p>
                    </div>
                  </button>
                </div>

                {/* Footer with support info */}
                <div className="mt-1 pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 px-1">
                  <span>सम्पर्क / WhatsApp: 9764400533</span>
                  <a
                    href="https://wa.me/9779764400533"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                  >
                    सम्पर्क गर्नुहोस् ↗
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Controlled Cloud Sync & Backup Modal */}
          <SyncStatusIndicator 
            profiles={profiles}
            isOpenControlled={isCloudSyncModalOpen}
            onCloseControlled={() => setIsCloudSyncModalOpen(false)}
            showTriggerButton={false}
          />

          {/* Right Action: Settings when logged in (User Profile & Workstations are in Header.tsx), or Sign In when logged out */}
          {rbacSession ? (
            <div className="pl-1.5 sm:pl-2 border-l border-stone-200 dark:border-stone-800 flex items-center gap-1.5 shrink-0">
              {/* Post-Sign-In Settings Dropdown with Letterhead Banner Settings inside */}
              <div className="relative z-50" ref={settingsMenuRef}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
                  className="p-1.5 rounded-xl bg-amber-100/70 dark:bg-stone-800 hover:bg-amber-200/80 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-amber-300/60 dark:border-stone-700 cursor-pointer transition-colors"
                  title="सेटिङ मेनु (लेटरहेड तथा गणना)"
                >
                  <Settings className="w-4 h-4 text-[#7A1C1C] dark:text-amber-400" />
                </motion.button>

                {isSettingsMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border-2 border-amber-300 dark:border-stone-700 p-2 z-[100] animate-in fade-in slide-in-from-top-2">
                    <div className="px-2.5 py-1.5 text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
                      ⚙️ प्रणाली तथा प्रतिवेदन सेटिङ
                    </div>
                    <div className="py-1 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSettingsMenuOpen(false);
                          if (onOpenSettingsModal) onOpenSettingsModal('letterhead');
                        }}
                        className="w-full text-left p-2 rounded-xl text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-800 flex items-center gap-2.5 cursor-pointer transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-[#7A1C1C] dark:text-amber-400" />
                        </div>
                        <div>
                          <div className="font-bold">📋 लेटरहेड ब्यानर सेटिङ</div>
                          <div className="text-[10px] text-stone-500 dark:text-stone-400">आफ्नो नाम, लोगो र ब्यानर मिलाउनुहोस्</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsSettingsMenuOpen(false);
                          if (onOpenSettingsModal) onOpenSettingsModal('astro');
                        }}
                        className="w-full text-left p-2 rounded-xl text-xs font-semibold text-stone-800 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-800 flex items-center gap-2.5 cursor-pointer transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-stone-500/15 flex items-center justify-center shrink-0">
                          <Settings className="w-4 h-4 text-stone-700 dark:text-stone-300" />
                        </div>
                        <div>
                          <div className="font-bold">⚙️ ज्योतिष गणना सेटिङ</div>
                          <div className="text-[10px] text-stone-500 dark:text-stone-400">अयनांश, स्थान र सुत्र समायोजन</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsSettingsMenuOpen(false);
                          setIsChangePasswordOpen(true);
                        }}
                        className="w-full text-left p-2 rounded-xl text-xs font-semibold text-amber-900 dark:text-amber-300 hover:bg-amber-100/60 dark:hover:bg-stone-800 flex items-center gap-2.5 cursor-pointer transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                          <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <div className="font-bold">🔐 पासवर्ड परिवर्तन (Change Password)</div>
                          <div className="text-[10px] text-stone-500 dark:text-stone-400">आफ्नो व्यक्तिगत पासवर्ड परिवर्तन गर्नुहोस्</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {onLogoutRBAC && rbacSession.role !== 'CUSTOMER' && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onLogoutRBAC}
                  className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
                  title="लगआउट गर्नुहोस्"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">लगआउट</span>
                </motion.button>
              )}
            </div>
          ) : (
            onOpenAuthModal && (
              <div className="pl-2 border-l border-stone-200 dark:border-stone-800 flex items-center gap-2 shrink-0">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenAuthModal}
                  className="px-3 py-1.5 bg-[#7A1C1C] hover:bg-[#8B2323] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                  title="साइन इन / लगइन गर्नुहोस्"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-300" />
                  <span>साइन इन</span>
                </motion.button>
              </div>
            )
          )}
        </div>
      </div>

      {/* सेवाहरू मेनु: ज्योतिष (मुख्य कार्यक्षेत्र + अन्य शाखाहरू) तथा वास्तुशास्त्र (कम्पास + मोड्युलहरू) */}
      {isSewaMenuOpen && (
        <div
          ref={sewaMenuRef}
          style={{
            position: 'fixed',
            top: `${sewaDropdownPosition.top}px`,
            left: `${sewaDropdownPosition.left}px`,
            width: '350px',
            maxHeight: 'calc(100vh - 80px)',
            zIndex: 9999,
          }}
          className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border-2 border-amber-400/80 dark:border-stone-700 p-3 z-[9999] animate-in fade-in slide-in-from-top-1 overflow-y-auto space-y-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#7A1C1C] text-amber-300 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-stone-900 dark:text-stone-100 font-serif">
                वैदिक सेवाहरू (Vedic Services)
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSewaMenuOpen(false);
                onTabChange('sewa');
              }}
              className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-0.5 cursor-pointer font-sans"
            >
              <span>हब हेर्नुहोस्</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* १. वैदिक ज्योतिष सेवा */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 dark:text-stone-400">
              <span className="flex items-center gap-1.5 text-[#7A1C1C] dark:text-amber-400 font-serif">
                <Sparkles className="w-3.5 h-3.5" />
                <span>१. वैदिक ज्योतिष सेवा</span>
              </span>
            </div>

            {/* मुख्य ज्योतिष कार्यक्षेत्र बटन */}
            <button
              type="button"
              onClick={() => {
                setIsSewaMenuOpen(false);
                if (!isJyotishUnlocked) {
                  if (onOpenPurchaseModal) onOpenPurchaseModal('ज्योतिष सेवा');
                  return;
                }
                if (onEnterJyotish) onEnterJyotish();
                else onTabChange('jyotishi');
              }}
              className="w-full text-left p-2 rounded-xl border border-amber-400/60 dark:border-amber-700/80 bg-gradient-to-r from-amber-500/10 via-red-500/10 to-amber-500/10 hover:from-amber-500/20 hover:to-red-500/20 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#7A1C1C] text-amber-300 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 group-hover:text-red-700">
                      मुख्य ज्योतिष कार्यक्षेत्र
                    </span>
                    {!isJyotishUnlocked ? (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5 text-amber-500" />
                        लक
                      </span>
                    ) : (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500 text-stone-950">
                        प्रवेश
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                    बृहत् जन्मकुण्डली, फलादेश, दशा, गोचर
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            {/* ४ फलादेश शाखाहरू */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              {ANYA_FALADESH_ITEMS.map((sub) => {
                const SubIcon = sub.icon;
                const subAccess = checkFeatureAccess(sub.id);
                const isSubClosed = subAccess.state === 'close';
                const isSubLocked = subAccess.state === 'lock';

                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      if (isSubClosed) {
                        alert(subAccess.reasonNepali || 'यो सेवा मुख्य प्रशासकद्वारा बन्द गरिएको छ।');
                        return;
                      }
                      if (isSubLocked) {
                        if (onOpenPurchaseModal) onOpenPurchaseModal(sub.labelNepali);
                        else alert(subAccess.reasonNepali || 'यो सेवा लक गरिएको छ।');
                        return;
                      }
                      setIsSewaMenuOpen(false);
                      onTabChange(sub.id);
                    }}
                    className={`text-left p-1.5 rounded-lg border flex items-center justify-between gap-1.5 cursor-pointer ${
                      isSubClosed
                        ? 'opacity-40 grayscale cursor-not-allowed border-stone-300 dark:border-stone-800 bg-stone-100 dark:bg-stone-900/60'
                        : isSubLocked
                        ? 'border-amber-400/60 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 hover:bg-amber-50 dark:hover:bg-stone-700/60'
                    }`}
                    title={isSubClosed ? `${sub.labelNepali} (प्रशासकद्वारा बन्द)` : sub.labelNepali}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <SubIcon className="w-3 h-3 text-[#7A1C1C] dark:text-amber-400 shrink-0" />
                      <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200 truncate">
                        {sub.labelNepali}
                      </span>
                    </div>
                    {isSubLocked && <Lock className="w-2.5 h-2.5 text-amber-500 shrink-0" />}
                    {isSubClosed && <span className="text-[8px] px-1 py-0 rounded bg-stone-700 text-stone-300 shrink-0">बन्द</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* २. वैदिक वास्तुशास्त्र सेवा */}
          <div className="space-y-1.5 pt-2 border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 dark:text-stone-400">
              <span className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-serif">
                <Compass className="w-3.5 h-3.5" />
                <span>२. वैदिक वास्तुशास्त्र सेवा</span>
              </span>
            </div>

            {/* मुख्य वास्तु विन्डो बटन */}
            <button
              type="button"
              onClick={() => {
                const vastuCheck = checkFeatureAccess('vastu');
                if (vastuCheck.state === 'close') {
                  alert(vastuCheck.reasonNepali || 'वास्तु सेवा प्रशासकद्वारा बन्द गरिएको छ।');
                  return;
                }
                setIsSewaMenuOpen(false);
                if (!isVastuUnlocked) {
                  if (onOpenPurchaseModal) onOpenPurchaseModal('वास्तु सेवा');
                  return;
                }
                if (onOpenVastuModal) onOpenVastuModal('project');
                else onTabChange('vastu');
              }}
              className="w-full text-left p-2 rounded-xl border border-emerald-400/60 dark:border-emerald-700/80 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-800 text-emerald-200 flex items-center justify-center shrink-0">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 group-hover:text-emerald-700">
                      वास्तु परियोजना तथा कम्पास
                    </span>
                    {!isVastuUnlocked ? (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5 text-emerald-600" />
                        लक
                      </span>
                    ) : (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-600 text-white">
                        विन्डो
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                    ३६०° कम्पास, मण्डल, अडिट र प्रमाणपत्र
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            {/* वास्तु मोड्युलहरू */}
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              {VASTU_SUBMENU_ITEMS.slice(0, 4).map((item) => {
                const SubIcon = item.icon;
                const vastuSubAccess = checkFeatureAccess(`vastu_${item.id}`);
                const isVastuClosed = vastuSubAccess.state === 'close';
                const isVastuLocked = vastuSubAccess.state === 'lock';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (isVastuClosed) {
                        alert(vastuSubAccess.reasonNepali || 'यो वास्तु सेवा प्रशासकद्वारा बन्द गरिएको छ।');
                        return;
                      }
                      if (!isVastuUnlocked || isVastuLocked) {
                        if (onOpenPurchaseModal) onOpenPurchaseModal(item.labelNepali);
                        else alert(vastuSubAccess.reasonNepali || 'यो सुविधा लक गरिएको छ।');
                        return;
                      }
                      setIsSewaMenuOpen(false);
                      if (onOpenVastuModal) onOpenVastuModal(item.id);
                      else onTabChange('vastu');
                    }}
                    className={`text-left p-1.5 rounded-lg border flex items-center justify-between gap-1.5 cursor-pointer ${
                      isVastuClosed
                        ? 'opacity-40 grayscale cursor-not-allowed border-stone-300 dark:border-stone-800 bg-stone-100 dark:bg-stone-900/60'
                        : isVastuLocked
                        ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 hover:bg-emerald-50 dark:hover:bg-stone-700/60'
                    }`}
                    title={isVastuClosed ? `${item.labelNepali} (प्रशासकद्वारा बन्द)` : item.labelNepali}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <SubIcon className="w-3 h-3 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200 truncate">
                        {item.labelNepali}
                      </span>
                    </div>
                    {isVastuLocked && <Lock className="w-2.5 h-2.5 text-amber-500 shrink-0" />}
                    {isVastuClosed && <span className="text-[8px] px-1 py-0 rounded bg-stone-700 text-stone-300 shrink-0">बन्द</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ४-प्लेटफर्म एप डाउनलोड मोडल (Windows, Android, Mac, iOS) - मात्र वेबसाइटमा खुला हुने */}
      {!isInstalled && (
        <AppDownloadModal
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
          initialTab={downloadModalPlatform}
        />
      )}

      {/* ================================================================= */}
      {/* MOBILE TOP-DOWN SCROLLABLE MAIN MENU (स्क्रोल-डाउन मुख्य मेनु)    */}
      {/* ================================================================= */}
      {isMobileDrawerOpen && (
        <>
          {/* Backdrop with subtle blur */}
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-xs z-[9990] xl:hidden animate-in fade-in duration-200"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Top-Down Scrollable Sheet Container */}
          <div className="fixed top-0 left-0 right-0 max-h-[92vh] bg-white dark:bg-stone-900 z-[9995] shadow-2xl xl:hidden flex flex-col rounded-b-3xl border-b-4 border-amber-500 animate-in slide-in-from-top duration-300 ease-out overflow-hidden">

            {/* Menu Header with Om emblem and Close button */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#7A1C1C] via-[#931F1F] to-[#5C1515] text-white shrink-0 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-stone-950 font-serif font-black flex items-center justify-center text-sm shadow-xs">
                  ॐ
                </div>
                <div>
                  <h2 className="font-bold text-sm font-serif leading-tight text-amber-100 flex items-center gap-1.5">
                    <span>नेपाली वैदिक पञ्चाङ्ग</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </h2>
                  <p className="text-[10px] text-amber-300/85 leading-tight">
                    सम्पूर्ण मुख्य मेनु तथा वैदिक सेवाहरू
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white cursor-pointer transition-transform border border-white/20"
                aria-label="मेनु बन्द गर्नुहोस्"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Indicator & Scroll Hint Bar */}
            <div className="px-4 py-2 bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-50 dark:from-stone-900 dark:via-stone-850 dark:to-stone-900 border-b border-amber-200/80 dark:border-stone-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 truncate">
                  हाल सक्रिय:
                </span>
                <span className="text-[11px] font-bold text-[#7A1C1C] dark:text-amber-300 bg-amber-200/70 dark:bg-stone-800 px-2 py-0.5 rounded-lg truncate border border-amber-300/60 dark:border-stone-700">
                  {MAIN_NAV_ITEMS.find((i) => i.id === activeTab)?.labelNepali || activeTab}
                </span>
              </div>
              <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 shrink-0 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300/60">
                तल स्क्रोल गर्नुहोस् ↓
              </span>
            </div>

            {/* Scrollable Menu Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 space-y-3.5 pb-28 [scrollbar-width:thin]">

              {/* ── SECTION 0: द्रुत पहुँच (Quick Access 2x2 Grid) ── */}
              <div>
                <p className="text-[10px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5 px-1">
                  ⚡ द्रुत पहुँच (Quick Access)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {isTabVisibleInNavigation('dashboard').visible && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        onTabChange('dashboard');
                      }}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                        activeTab === 'dashboard' && activeModule === 'MAIN'
                          ? 'bg-[#7A1C1C] text-white border-[#5C1515] shadow-xs'
                          : 'bg-stone-50 dark:bg-stone-800/80 hover:bg-amber-50 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-[#7A1C1C] dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Home className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">गृहपृष्ठ</span>
                        <span className="text-[10px] opacity-75 block truncate">ड्यासबोर्ड</span>
                      </div>
                    </button>
                  )}

                  {isTabVisibleInNavigation('panchanga').visible && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        onTabChange('panchanga');
                      }}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                        activeTab === 'panchanga' && activeModule === 'MAIN'
                          ? 'bg-[#7A1C1C] text-white border-[#5C1515] shadow-xs'
                          : 'bg-stone-50 dark:bg-stone-800/80 hover:bg-amber-50 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">पञ्चाङ्ग</span>
                        <span className="text-[10px] opacity-75 block truncate">दैनिक तिथि/मुहूर्त</span>
                      </div>
                    </button>
                  )}

                  {isTabVisibleInNavigation('jyotishi').visible && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        if (!isJyotishUnlocked) {
                          if (onOpenPurchaseModal) onOpenPurchaseModal('ज्योतिष सेवा');
                          return;
                        }
                        if (onEnterJyotish) onEnterJyotish();
                        else onTabChange('jyotishi');
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-left transition-all cursor-pointer ${
                        !isJyotishUnlocked
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-800 dark:text-amber-300'
                          : activeModule === 'JYOTISH' || activeTab === 'jyotishi'
                          ? 'bg-[#7A1C1C] text-white border-[#5C1515] shadow-xs'
                          : 'bg-stone-50 dark:bg-stone-800/80 hover:bg-amber-50 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-red-500/20 text-[#7A1C1C] dark:text-amber-400 flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate">ज्योतिष सेवा</span>
                          <span className="text-[10px] opacity-75 block truncate">कुण्डली/फलादेश</span>
                        </div>
                      </div>
                      {!isJyotishUnlocked && <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                    </button>
                  )}

                  {isTabVisibleInNavigation('vastu').visible && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        if (!isVastuUnlocked) {
                          if (onOpenPurchaseModal) onOpenPurchaseModal('वास्तु सेवा');
                          return;
                        }
                        onTabChange('vastu');
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-left transition-all cursor-pointer ${
                        !isVastuUnlocked
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                          : activeTab === 'vastu'
                          ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                          : 'bg-stone-50 dark:bg-stone-800/80 hover:bg-emerald-50 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Compass className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate">वास्तु सेवा</span>
                          <span className="text-[10px] opacity-75 block truncate">कम्पास/अडिट</span>
                        </div>
                      </div>
                      {!isVastuUnlocked && <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </button>
                  )}
                </div>
              </div>

              {/* ========================================================= */}
              {/* ACCORDION 1: वैदिक ज्योतिष सेवा (Vedic Astrology Suite)     */}
              {/* ========================================================= */}
              <div className="rounded-2xl border border-amber-300/60 dark:border-stone-800 bg-amber-50/40 dark:bg-stone-850/60 overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleMobileSection('jyotish')}
                  className="w-full min-h-[48px] px-3.5 py-2.5 flex items-center justify-between gap-2 text-left bg-gradient-to-r from-amber-500/15 via-red-500/10 to-transparent dark:from-stone-800 dark:to-stone-850 cursor-pointer active:opacity-80 transition-all"
                  aria-expanded={expandedMobileSections.jyotish}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-[#7A1C1C] dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs sm:text-sm text-[#7A1C1C] dark:text-amber-300 block truncate">
                        १. वैदिक ज्योतिष सेवा (Jyotish)
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block truncate">
                        कुण्डली, फलादेश, दशा, गोचर, प्रश्न, अङ्क
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-stone-700 text-stone-800 dark:text-amber-300">
                      ७ शाखा
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#7A1C1C] dark:text-amber-400 transition-transform duration-200 ${
                        expandedMobileSections.jyotish ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {expandedMobileSections.jyotish && (
                  <div className="p-2.5 space-y-2 border-t border-amber-200/70 dark:border-stone-800 animate-in fade-in duration-150">
                    {/* Primary Hero Card */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        if (!isJyotishUnlocked) {
                          if (onOpenPurchaseModal) onOpenPurchaseModal('ज्योतिष सेवा');
                          return;
                        }
                        if (onEnterJyotish) onEnterJyotish();
                        else onTabChange('jyotishi');
                      }}
                      className="w-full min-h-[52px] text-left p-3 rounded-xl border border-amber-500/60 bg-gradient-to-r from-[#7A1C1C] to-[#931F1F] text-white flex items-center justify-between group shadow-sm cursor-pointer active:scale-[0.98] transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white/20 text-amber-300 flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-xs sm:text-sm block">
                            मुख्य ज्योतिष कार्यक्षेत्र
                          </span>
                          <p className="text-[10px] text-amber-200/90 truncate">
                            बृहत् जन्मकुण्डली, फलादेश, विंशोत्तरी दशा, गोचर
                          </p>
                        </div>
                      </div>
                      {!isJyotishUnlocked ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/50 flex items-center gap-1 shrink-0">
                          <Lock className="w-3 h-3 text-amber-300" />
                          लक
                        </span>
                      ) : (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 shrink-0">
                          प्रवेश ↗
                        </span>
                      )}
                    </button>

                    {/* Secondary Jyotish Modules */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {ANYA_FALADESH_ITEMS.map((sub) => {
                        const SIcon = sub.icon;
                        const sActive = activeTab === sub.id;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => {
                              setIsMobileDrawerOpen(false);
                              onTabChange(sub.id);
                            }}
                            className={`min-h-[44px] p-2 rounded-xl text-left border flex items-center gap-2 transition-all cursor-pointer ${
                              sActive
                                ? 'bg-amber-500/20 border-amber-500 text-[#7A1C1C] dark:text-amber-300 font-bold shadow-2xs'
                                : 'bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700/80 text-stone-700 dark:text-stone-300 hover:border-amber-400 active:bg-amber-50'
                            }`}
                          >
                            <div className="w-6 h-6 rounded-md bg-amber-500/15 text-[#7A1C1C] dark:text-amber-400 flex items-center justify-center shrink-0">
                              <SIcon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[11px] font-semibold block truncate">
                                {sub.labelNepali}
                              </span>
                              <span className="text-[9px] text-amber-700 dark:text-amber-400 font-medium">
                                {sub.badge}
                              </span>
                            </div>
                          </button>
                        );
                      })}

                      {/* Patrika Submenu */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileDrawerOpen(false);
                          onTabChange('patrika');
                        }}
                        className={`min-h-[44px] p-2 rounded-xl text-left border flex items-center gap-2 transition-all cursor-pointer ${
                          activeTab === 'patrika'
                            ? 'bg-amber-500/20 border-amber-500 text-[#7A1C1C] dark:text-amber-300 font-bold shadow-2xs'
                            : 'bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700/80 text-stone-700 dark:text-stone-300 hover:border-amber-400 active:bg-amber-50'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-md bg-amber-500/15 text-[#7A1C1C] dark:text-amber-400 flex items-center justify-center shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-semibold block truncate">
                            चिना / पत्रिका
                          </span>
                          <span className="text-[9px] text-amber-700 dark:text-amber-400 font-medium">
                            टिप्पन
                          </span>
                        </div>
                      </button>

                      {/* Daily Rashifal */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileDrawerOpen(false);
                          onTabChange('rashifal');
                        }}
                        className={`min-h-[44px] p-2 rounded-xl text-left border flex items-center gap-2 transition-all cursor-pointer ${
                          activeTab === 'rashifal'
                            ? 'bg-amber-500/20 border-amber-500 text-[#7A1C1C] dark:text-amber-300 font-bold shadow-2xs'
                            : 'bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700/80 text-stone-700 dark:text-stone-300 hover:border-amber-400 active:bg-amber-50'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-md bg-amber-500/15 text-[#7A1C1C] dark:text-amber-400 flex items-center justify-center shrink-0">
                          <Sun className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-semibold block truncate">
                            दैनिक राशिफल
                          </span>
                          <span className="text-[9px] text-amber-700 dark:text-amber-400 font-medium">
                            १२ राशि
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ========================================================= */}
              {/* ACCORDION 2: वास्तुशास्त्र सेवा (Vastu Shastra Suite)       */}
              {/* ========================================================= */}
              <div className="rounded-2xl border border-emerald-300/60 dark:border-stone-800 bg-emerald-50/40 dark:bg-stone-850/60 overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleMobileSection('vastu')}
                  className="w-full min-h-[48px] px-3.5 py-2.5 flex items-center justify-between gap-2 text-left bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent dark:from-stone-800 dark:to-stone-850 cursor-pointer active:opacity-80 transition-all"
                  aria-expanded={expandedMobileSections.vastu}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 block truncate">
                        २. वास्तुशास्त्र सेवा (Vastu Shastra)
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block truncate">
                        कम्पास, मण्डल, पञ्चतत्त्व, आवासीय/व्यावसायिक अडिट
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 dark:bg-stone-700 text-stone-800 dark:text-emerald-300">
                      ६ मोड्युल
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-emerald-700 dark:text-emerald-400 transition-transform duration-200 ${
                        expandedMobileSections.vastu ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {expandedMobileSections.vastu && (
                  <div className="p-2.5 space-y-2 border-t border-emerald-200/70 dark:border-stone-800 animate-in fade-in duration-150">
                    {/* Primary Hero Card */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        if (!isVastuUnlocked) {
                          if (onOpenPurchaseModal) onOpenPurchaseModal('वास्तु सेवा');
                          return;
                        }
                        if (onOpenVastuModal) onOpenVastuModal('project');
                        else onTabChange('vastu');
                      }}
                      className="w-full min-h-[52px] text-left p-3 rounded-xl border border-emerald-600/60 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between group shadow-sm cursor-pointer active:scale-[0.98] transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white/20 text-emerald-300 flex items-center justify-center shrink-0">
                          <Compass className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-xs sm:text-sm block">
                            वास्तुशास्त्र मुख्य कक्ष
                          </span>
                          <p className="text-[10px] text-emerald-200/90 truncate">
                            डिजिटल कम्पास, मण्डल, पञ्चतत्त्व, अडिट
                          </p>
                        </div>
                      </div>
                      {!isVastuUnlocked ? (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/50 flex items-center gap-1 shrink-0">
                          <Lock className="w-3 h-3 text-emerald-300" />
                          लक
                        </span>
                      ) : (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-400 text-stone-950 shrink-0">
                          प्रवेश ↗
                        </span>
                      )}
                    </button>

                    {/* Vastu Submenu Modules */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {VASTU_SUBMENU_ITEMS.map((vi) => {
                        const VI = vi.icon;
                        return (
                          <button
                            key={vi.id}
                            type="button"
                            onClick={() => {
                              setIsMobileDrawerOpen(false);
                              if (onOpenVastuModal) onOpenVastuModal(vi.id);
                              else onTabChange('vastu');
                            }}
                            className="min-h-[44px] p-2 rounded-xl text-left border bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700/80 text-stone-700 dark:text-stone-300 hover:border-emerald-400 active:bg-emerald-50 flex items-center gap-2 transition-all cursor-pointer"
                          >
                            <div className="w-6 h-6 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              <VI className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[11px] font-semibold block truncate">
                                {vi.labelNepali}
                              </span>
                              <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-medium">
                                {vi.badge}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ========================================================= */}
              {/* ACCORDION 3: कर्मकाण्ड तथा संस्कार (Rituals & Calendar)   */}
              {/* ========================================================= */}
              <div className="rounded-2xl border border-blue-300/60 dark:border-stone-800 bg-blue-50/40 dark:bg-stone-850/60 overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleMobileSection('karmakanda')}
                  className="w-full min-h-[48px] px-3.5 py-2.5 flex items-center justify-between gap-2 text-left bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-transparent dark:from-stone-800 dark:to-stone-850 cursor-pointer active:opacity-80 transition-all"
                  aria-expanded={expandedMobileSections.karmakanda}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Scroll className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs sm:text-sm text-blue-900 dark:text-blue-300 block truncate">
                        ३. कर्मकाण्ड तथा संस्कार (Rituals & Patro)
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block truncate">
                        पञ्चाङ्ग, पात्रो, यजमान, पूजा पद्धति
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200/80 dark:bg-stone-700 text-stone-800 dark:text-blue-300">
                      ४ सेवा
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-blue-700 dark:text-blue-400 transition-transform duration-200 ${
                        expandedMobileSections.karmakanda ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {expandedMobileSections.karmakanda && (
                  <div className="p-2.5 space-y-1.5 border-t border-blue-200/70 dark:border-stone-800 animate-in fade-in duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        onTabChange('panchanga');
                      }}
                      className={`w-full min-h-[44px] flex items-center gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors border ${
                        activeTab === 'panchanga'
                          ? 'bg-blue-100 dark:bg-blue-950/60 border-blue-400 text-blue-900 dark:text-blue-200 font-bold'
                          : 'bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold block truncate">दैनिक पञ्चाङ्ग एवं मुहूर्त</span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block">तिथि, वार, नक्षत्र, योग, करण</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        onTabChange('calendar');
                      }}
                      className={`w-full min-h-[44px] flex items-center gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors border ${
                        activeTab === 'calendar'
                          ? 'bg-blue-100 dark:bg-blue-950/60 border-blue-400 text-blue-900 dark:text-blue-200 font-bold'
                          : 'bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold block truncate">वैदिक पात्रो (Nepali Calendar)</span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block">चाडपर्व, बिदा, विवाह/व्रतबन्ध लगन</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        onTabChange('yajaman');
                      }}
                      className={`w-full min-h-[44px] flex items-center gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors border ${
                        activeTab === 'yajaman'
                          ? 'bg-blue-100 dark:bg-blue-950/60 border-blue-400 text-blue-900 dark:text-blue-200 font-bold'
                          : 'bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold block truncate">यजमान तथा ग्राहक व्यवस्थापन</span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block">यजमान नामावली, पूजा इतिहास र गोत्र</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        onTabChange('knowledge');
                      }}
                      className="w-full min-h-[44px] flex items-center gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors border bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold block truncate">पूजा विधि तथा धर्मशास्त्र ज्ञान</span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block">सामग्री सूची, मन्त्र र विधि विधान</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* ========================================================= */}
              {/* ACCORDION 4: विवाह मिलान (Vivah Milan & Compatibility)     */}
              {/* ========================================================= */}
              <div className="rounded-2xl border border-rose-300/60 dark:border-stone-800 bg-rose-50/40 dark:bg-stone-850/60 overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onTabChange('vivah');
                  }}
                  className="w-full min-h-[48px] px-3.5 py-2.5 flex items-center justify-between gap-2 text-left bg-gradient-to-r from-rose-500/15 via-pink-500/10 to-transparent dark:from-stone-800 dark:to-stone-850 cursor-pointer active:opacity-80 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs sm:text-sm text-rose-900 dark:text-rose-300 block truncate">
                        ४. विवाह मिलान (Vivah Milan)
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block truncate">
                        ३६ गुण मिलान, नाडी, भकूट तथा मङ्गल दोष
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200/80 dark:bg-stone-700 text-stone-800 dark:text-rose-300">
                      ३६ गुण
                    </span>
                    <ChevronRight className="w-4 h-4 text-rose-700 dark:text-rose-400" />
                  </div>
                </button>
              </div>

              {/* ========================================================= */}
              {/* ACCORDION 5: वैदिक पसल तथा ग्रन्थ (Store & Library)        */}
              {/* ========================================================= */}
              <div className="rounded-2xl border border-amber-400/60 dark:border-stone-800 bg-amber-50/30 dark:bg-stone-850/60 overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleMobileSection('store')}
                  className="w-full min-h-[48px] px-3.5 py-2.5 flex items-center justify-between gap-2 text-left bg-gradient-to-r from-amber-600/15 via-orange-500/10 to-transparent dark:from-stone-800 dark:to-stone-850 cursor-pointer active:opacity-80 transition-all"
                  aria-expanded={expandedMobileSections.store}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-amber-300 block truncate">
                        ५. वैदिक पसल एवं सूचना (Store & Info)
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block truncate">
                        पूजा पसल, संस्था परिचय, समाचार
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-stone-700 text-stone-800 dark:text-amber-300">
                      ३ शाखा
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-amber-800 dark:text-amber-400 transition-transform duration-200 ${
                        expandedMobileSections.store ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {expandedMobileSections.store && (
                  <div className="p-2.5 space-y-1.5 border-t border-amber-200/70 dark:border-stone-800 animate-in fade-in duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        onTabChange('kharedi');
                      }}
                      className="w-full min-h-[44px] flex items-center gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors border bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold block truncate">वैदिक पूजा सामग्री पसल</span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block">रुद्राक्ष, शालिग्राम, यन्त्र, पूजा सामग्री</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        if (onOpenOrgProfile) onOpenOrgProfile();
                        else onTabChange('org_profile');
                      }}
                      className="w-full min-h-[44px] flex items-center gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors border bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold block truncate">संस्था प्रोफाइल एवं परिचय</span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block">सेवाहरू, सम्पर्क ठेगाना र विवरण</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        onTabChange('samachar');
                      }}
                      className="w-full min-h-[44px] flex items-center gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors border bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Newspaper className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold block truncate">पञ्चाङ्ग तथा खगोल समाचार</span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block">चाडपर्व, ग्रहण र शास्त्रीय समाचार</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* ========================================================= */}
              {/* ACCORDION 6: डाउनलोड केन्द्र (Download Center)             */}
              {/* ========================================================= */}
              <div className="rounded-2xl border border-cyan-300/60 dark:border-stone-800 bg-cyan-50/30 dark:bg-stone-850/60 overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleMobileSection('downloads')}
                  className="w-full min-h-[48px] px-3.5 py-2.5 flex items-center justify-between gap-2 text-left bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent dark:from-stone-800 dark:to-stone-850 cursor-pointer active:opacity-80 transition-all"
                  aria-expanded={expandedMobileSections.downloads}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-800 dark:text-cyan-400 flex items-center justify-center shrink-0">
                      <Download className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs sm:text-sm text-cyan-950 dark:text-cyan-300 block truncate">
                        ६. डाउनलोड केन्द्र (Download Hub)
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block truncate">
                        एप्लिकेसन, PDF ग्रन्थ तथा मन्त्र मिडिया
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-200/80 dark:bg-stone-700 text-stone-800 dark:text-cyan-300">
                      ३ हब
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-cyan-800 dark:text-cyan-400 transition-transform duration-200 ${
                        expandedMobileSections.downloads ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {expandedMobileSections.downloads && (
                  <div className="p-2.5 space-y-1.5 border-t border-cyan-200/70 dark:border-stone-800 animate-in fade-in duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        onTabChange('app_download');
                      }}
                      className={`w-full min-h-[44px] flex items-center gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors border ${
                        activeTab === 'app_download'
                          ? 'bg-blue-100 dark:bg-blue-950/60 border-blue-400 text-blue-900 dark:text-blue-200 font-bold'
                          : 'bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold block truncate">१. Application Download</span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block">Windows (.exe), Android (.apk), Mac</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        onTabChange('books_download');
                      }}
                      className={`w-full min-h-[44px] flex items-center gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors border ${
                        activeTab === 'books_download'
                          ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 text-amber-900 dark:text-amber-200 font-bold'
                          : 'bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold block truncate">२. Books Download (ई-पुस्तक)</span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block">धर्मशास्त्र तथा पूजा पद्धति (PDF)</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        onTabChange('media_download');
                      }}
                      className={`w-full min-h-[44px] flex items-center gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors border ${
                        activeTab === 'media_download'
                          ? 'bg-cyan-100 dark:bg-cyan-950/60 border-cyan-400 text-cyan-900 dark:text-cyan-200 font-bold'
                          : 'bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 flex items-center justify-center shrink-0">
                        <Music className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold block truncate">३. Media Download (मिडिया)</span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block">मन्त्र स्तोत्र अडियो, HD वालपेपर, चार्ट</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* ========================================================= */}
              {/* ACCORDION 7: उपकरण एवं सेटिङ (Tools & Settings)            */}
              {/* ========================================================= */}
              <div className="rounded-2xl border border-stone-300 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-850/60 overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleMobileSection('settings')}
                  className="w-full min-h-[48px] px-3.5 py-2.5 flex items-center justify-between gap-2 text-left bg-gradient-to-r from-stone-300/30 to-transparent dark:from-stone-800 dark:to-stone-850 cursor-pointer active:opacity-80 transition-all"
                  aria-expanded={expandedMobileSections.settings}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-stone-300/40 dark:bg-stone-700 text-stone-800 dark:text-stone-300 flex items-center justify-center shrink-0">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-200 block truncate">
                        ७. उपकरण एवं सेटिङ (Tools & Settings)
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block truncate">
                        मिति रूपान्तरण, लेटरहेड, थिम, क्लाउड सिंक, FAQ
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-300">
                      ६ उपकरण
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-stone-700 dark:text-stone-400 transition-transform duration-200 ${
                        expandedMobileSections.settings ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {expandedMobileSections.settings && (
                  <div className="p-2.5 space-y-1.5 border-t border-stone-200 dark:border-stone-800 animate-in fade-in duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        if (onOpenDateConverter) onOpenDateConverter();
                        else onTabChange('date_converter');
                      }}
                      className="w-full min-h-[44px] flex items-center gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors border bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <ArrowRightLeft className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold block truncate">मिति रूपान्तरण (BS ⇄ AD Converter)</span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block">विक्रम संवत् तथा ईस्वी सन् रूपान्तरण</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        if (onOpenSettingsModal) onOpenSettingsModal('astro');
                      }}
                      className="w-full min-h-[44px] flex items-center gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors border bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100"
                    >
                      <div className="w-7 h-7 rounded-lg bg-red-500/15 text-red-700 dark:text-red-400 flex items-center justify-center shrink-0">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold block truncate">प्रणाली तथा ज्योतिष गणना सेटिङ</span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block">अयनांश, स्थान र ग्रह गणना</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        if (onOpenSettingsModal) onOpenSettingsModal('letterhead');
                      }}
                      className="w-full min-h-[44px] flex items-center gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors border bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold block truncate">लेटरहेड ब्यानर सेटिङ</span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block">व्यक्तिगत नाम, लोगो र ब्यानर</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        if (onOpenThemeModal) onOpenThemeModal();
                      }}
                      className="w-full min-h-[44px] flex items-center gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors border bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <Palette className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold block truncate">सफ्टवेयर थिम र रङ्ग</span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block">५ वैदिक रङ्ग तथा पृष्ठभूमि</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        setIsCloudSyncModalOpen(true);
                      }}
                      className="w-full min-h-[44px] flex items-center gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors border bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <CloudCheck className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold block truncate">क्लाउड सिंक तथा ब्याकअप</span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block">डेटा सुरक्षित भण्डारण र रिस्टोर</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        onTabChange('help');
                      }}
                      className="w-full min-h-[44px] flex items-center gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors border bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold block truncate">मद्दत, ट्यूटोरियल तथा FAQ</span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block">सफ्टवेयर प्रयोग विधि र प्रश्नोत्तर</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* ========================================================= */}
              {/* ACCORDION 8: प्रशासनिक नियन्त्रण (Admin Control)           */}
              {/* ========================================================= */}
              {(isSuperOrStoreAdmin || (rbacSession && rbacSession.role !== 'CUSTOMER')) && (
                <div className="rounded-2xl border border-red-300/70 dark:border-stone-800 bg-red-50/40 dark:bg-stone-850/60 overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => toggleMobileSection('admin')}
                    className="w-full min-h-[48px] px-3.5 py-2.5 flex items-center justify-between gap-2 text-left bg-gradient-to-r from-red-600/15 to-transparent dark:from-stone-800 dark:to-stone-850 cursor-pointer active:opacity-80 transition-all"
                    aria-expanded={expandedMobileSections.admin}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-red-500/20 text-[#7A1C1C] dark:text-red-400 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs sm:text-sm text-[#7A1C1C] dark:text-red-300 block truncate">
                          ८. प्रशासनिक नियन्त्रण (Admin Desk)
                        </span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 block truncate">
                          सुपरएडमिन, स्टोर, POS, समाचार, विवाह
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-200/80 dark:bg-stone-700 text-stone-800 dark:text-red-300">
                        प्रशासन
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#7A1C1C] dark:text-red-400 transition-transform duration-200 ${
                          expandedMobileSections.admin ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {expandedMobileSections.admin && (
                    <div className="p-2.5 space-y-1.5 border-t border-red-200/70 dark:border-stone-800 animate-in fade-in duration-150">
                      {/* Super Admin Portal link */}
                      {rbacSession?.role === 'SUPER_ADMIN' && (
                        <a
                          href="/superadmin"
                          target="_blank"
                          rel="noreferrer"
                          className="w-full min-h-[44px] flex items-center gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors border bg-gradient-to-r from-[#7A1C1C] to-[#931F1F] text-white shadow-xs"
                        >
                          <div className="w-7 h-7 rounded-lg bg-white/20 text-amber-300 flex items-center justify-center shrink-0">
                            <Crown className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold block truncate">सुपरएडमिन पोर्टल (Super Admin Portal)</span>
                            <span className="text-[10px] text-amber-200 truncate block">सेवा लक/अनडक, प्रयोगकर्ता र वित्तीय नियन्त्रण</span>
                          </div>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileDrawerOpen(false);
                          onTabChange('store_admin');
                        }}
                        className="w-full min-h-[44px] flex items-center gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors border bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold block truncate">स्टोर एवं डिजिटल पुस्तकालय एडमिन</span>
                          <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block">सामग्री सूची, अर्डर तथा PDF व्यवस्थापन</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileDrawerOpen(false);
                          onTabChange('pos');
                        }}
                        className="w-full min-h-[44px] flex items-center gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors border bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100"
                      >
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold block truncate">काउन्टर POS बिलिङ टर्मिनल</span>
                          <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block">प्रत्यक्ष बिक्री, इनभ्वाइस तथा रसिद प्रिन्ट</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileDrawerOpen(false);
                          onTabChange('news_editor');
                        }}
                        className="w-full min-h-[44px] flex items-center gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors border bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100"
                      >
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <Newspaper className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold block truncate">समाचार तथा लेख सम्पादक</span>
                          <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block">पञ्चाङ्ग, खगोल तथा धर्म समाचार प्रकाशन</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileDrawerOpen(false);
                          onTabChange('vivah_admin');
                        }}
                        className="w-full min-h-[44px] flex items-center gap-2.5 p-2 rounded-xl text-left cursor-pointer transition-colors border bg-white/90 dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-100"
                      >
                        <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0">
                          <HeartHandshake className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold block truncate">विवाह बायोडाटा सुपरभाइजर</span>
                          <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block">बायोडाटा प्रमाणीकरण र मिलान सुपरीवेक्षण</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* SECTION: प्रयोगकर्ता खाता (User Authentication)            */}
              {/* ========================================================= */}
              <div className="pt-2">
                <p className="text-[10px] font-black text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1.5 px-1">
                  👤 प्रयोगकर्ता खाता (User Account)
                </p>
                {rbacSession ? (
                  <div className="p-3 bg-amber-50/80 dark:bg-stone-800/80 rounded-2xl border border-amber-200 dark:border-stone-700 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">
                            {rbacSession.fullName}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#7A1C1C] dark:text-amber-400 font-bold block truncate">
                          {rbacSession.roleNameNepali}
                        </span>
                      </div>
                      {onLogoutRBAC && rbacSession.role !== 'CUSTOMER' && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsMobileDrawerOpen(false);
                            onLogoutRBAC();
                          }}
                          className="min-h-[44px] px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shadow-2xs shrink-0 cursor-pointer active:scale-95"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>लगआउट</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        setIsChangePasswordOpen(true);
                      }}
                      className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-amber-100/80 dark:bg-stone-700/80 hover:bg-amber-200 text-amber-950 dark:text-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-amber-300/60 dark:border-stone-600 cursor-pointer transition-colors active:scale-[0.98]"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                      <span>🔐 पासवर्ड परिवर्तन (Change Password)</span>
                    </button>
                  </div>
                ) : (
                  onOpenAuthModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-gradient-to-r from-[#7A1C1C] to-[#931F1F] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-[0.98] transition-transform"
                    >
                      <LogIn className="w-4 h-4 text-amber-300" />
                      <span>साइन इन / लगइन गर्नुहोस्</span>
                    </button>
                  )
                )}
              </div>

              {/* Extra Safe-Area Bottom Cushion (pb-28 applied to parent + cushion) */}
              <div className="h-10" />
            </div>
          </div>
        </>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        defaultMobile={rbacSession?.phone || ''}
      />
    </nav>
  );
});
