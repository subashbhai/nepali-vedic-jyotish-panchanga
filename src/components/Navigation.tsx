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
  ArrowRightLeft,
  Gift,
  CloudCheck,
  Palette,
  Download,
  Monitor,
  Smartphone,
  Apple,
  Menu,
  X
} from 'lucide-react';
import { PatrikaSubCategory, BirthDetails } from '../types/astrology';
import { RBACSession } from '../db/rbacStore';
import { evaluateSubscriptionStatus, is3DayTrialActive, start3DayTrial, is7DayTrialActive } from '../db/subscriptionStore';
import { is24HourTrialActive, isClientPurchaseApproved } from '../db/clientLeadStore';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { AppDownloadModal, PlatformTab } from './AppDownloadModal';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { DEFAULT_DIRECT_DOWNLOADS, triggerDirectBrowserDownload, isDesktopApp } from '../utils/appVersionManager';
import { getStoredPageServiceConfig } from '../db/pageServiceControlStore';

// Public menus visible on the first screen before login (Jyotish & Vastu are free to use)
export const PUBLIC_UNAUTH_NAV_IDS = new Set<NavTab>([
  'dashboard',
  'panchanga',
  'jyotishi',
  'vastu',
  'sewa',
  'vivah',
  'calendar',
  'samachar',
  'kharedi',
  'date_converter',
  'org_profile',
]);

export const NORMAL_USER_ALLOWED_TABS = new Set<NavTab>([
  'dashboard',
  'panchanga',
  'jyotishi',
  'vastu',
  'sewa',
  'calendar',
  'samachar',
  'date_converter',
  'org_profile',
  'rashifal',
  'yajaman',
  'kharedi',
  'vivah',
  'settings',
  'my_subscription',
  'apply_expert',
  'help'
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
  | 'aarje';

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
  onOpenDateConverter?: () => void;
  onOpenOrgProfile?: () => void;
  onOpenThemeModal?: () => void;
  onNavigateToAdmin?: (tab?: string) => void;
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
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
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
  onOpenDateConverter,
  onOpenOrgProfile,
  onOpenThemeModal,
  onNavigateToAdmin,
  profiles = [],
}) => {
  const [isSewaMenuOpen, setIsSewaMenuOpen] = useState(false);
  const [sewaDropdownPosition, setSewaDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isUnifiedSettingsOpen, setIsUnifiedSettingsOpen] = useState(false);
  const [isCloudSyncModalOpen, setIsCloudSyncModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false);
  const [downloadModalPlatform, setDownloadModalPlatform] = useState<PlatformTab>('WINDOWS');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
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
  const isTrialActive = is24HourTrialActive() || is3DayTrialActive() || is7DayTrialActive();
  const isApprovedClient = isClientPurchaseApproved();
  const isFullyUnlocked = isSuperOrStoreAdmin || !!hasFullAccess || isTrialActive || isApprovedClient;

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

  useEffect(() => {
    const handleCfg = () => setPageServiceCfg(getStoredPageServiceConfig());
    window.addEventListener('page-service-control-updated', handleCfg);
    return () => window.removeEventListener('page-service-control-updated', handleCfg);
  }, []);

  const hiddenNavKeys = useMemo(() => {
    return new Set(pageServiceCfg.pages.filter(p => p.hideInNavigation).map(p => p.tabKey));
  }, [pageServiceCfg]);

  // When not logged in: only show first screen public menus (गृहपृष्ठ, पञ्चाङ्ग, पात्रो, समाचार, मिति रूपान्तरण, संस्था प्रोफाइल)
  // When logged in: show all menus (except pages hidden by Super Admin)
  const baseNavItems = rbacSession
    ? MAIN_NAV_ITEMS
    : MAIN_NAV_ITEMS.filter((item) => PUBLIC_UNAUTH_NAV_IDS.has(item.id));
  const visibleNavItems = baseNavItems.filter((item) => !hiddenNavKeys.has(item.id));

  return (
    <nav className="text-[#2D241E] dark:text-stone-100 transition-colors">
      <div className="max-w-[1700px] w-full mx-auto px-2 sm:px-3 py-1.5 flex items-center justify-between gap-1.5 sm:gap-2 relative">

        {/* ☰ Mobile Hamburger Button — only on small screens */}
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-stone-100/80 dark:bg-stone-800/80 border border-[#E6E0D5] dark:border-stone-700 text-[#7A1C1C] dark:text-amber-400 shadow-xs shrink-0 cursor-pointer"
          aria-label="मेनु खोल्नुहोस्"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Main Navigation Items - Compact Single Line Layout */}
        <div className="hidden sm:flex items-center gap-0.5 md:gap-1 lg:gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-1 min-w-0 py-0.5">
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

            const isTabAllowed = true; // Jyotish, Vastu and all main items are free to explore

            if (isSewa) {
              return (
                <React.Fragment key={item.id}>
                  <motion.button
                    ref={sewaButtonRef}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={toggleSewaMenu}
                    className={`relative flex items-center gap-1 px-2 py-1 lg:px-2.5 lg:py-1.5 rounded-xl font-bold text-[11px] sm:text-[11.5px] lg:text-[12.5px] whitespace-nowrap cursor-pointer transition-colors duration-150 border shrink-0 ${
                      isActive
                        ? 'text-amber-300 ring-2 ring-amber-500/50 shadow-md border-transparent bg-gradient-to-r from-[#7A1C1C] via-[#9B2C2C] to-[#5C1515]'
                        : isSewaMenuOpen
                        ? 'bg-amber-100 dark:bg-stone-800 text-[#7A1C1C] dark:text-amber-400 border-amber-300 dark:border-stone-700 shadow-2xs'
                        : 'bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700/80 text-[#2D241E] dark:text-stone-200 border-[#E6E0D5] dark:border-stone-700 shadow-2xs'
                    }`}
                    title="वैदिक सेवाहरू: पुरोहित, विवाह र कन्सल्टिङ"
                  >
                    {isActive && (
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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleTabClick}
                  className={`relative flex items-center gap-1 px-2 py-1 lg:px-2.5 lg:py-1.5 rounded-xl font-bold text-[11px] sm:text-[11.5px] lg:text-[12.5px] whitespace-nowrap cursor-pointer transition-colors duration-150 border shrink-0 ${
                    isActive
                      ? 'text-white ring-2 ring-[#7A1C1C]/30 shadow-md border-transparent'
                      : 'bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700/80 text-[#2D241E] dark:text-stone-200 border-[#E6E0D5] dark:border-stone-700 shadow-2xs'
                  }`}
                  title={item.labelNepali}
                >
                  {/* Animated active pill using Framer Motion layoutId */}
                  {isActive && (
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
                        isActive
                          ? 'text-amber-300'
                          : 'text-[#7A1C1C] dark:text-amber-400'
                      }`}
                    />
                    <span>{item.labelNepali}</span>
                  </span>
                </motion.button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Right Section: Dropdowns and User Actions (Outside overflow-x-auto so dropdowns float on front!) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 relative z-50">

          {/* डाउनलोड Dropdown Menu (Windows, Android, Mac, iOS) - मात्र वेबसाइटमा देखिने, इन्स्टल भइसकेको एपमा स्वतः हट्ने */}
          {!isInstalled && !isDesktopApp() && (
            <div className="relative shrink-0 z-50" ref={downloadMenuRef}>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsDownloadDropdownOpen(!isDownloadDropdownOpen)}
              className={`relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs sm:text-[13px] whitespace-nowrap cursor-pointer transition-colors duration-150 border shrink-0 ${
                isDownloadDropdownOpen
                  ? 'bg-[#7A1C1C] text-white border-[#5C1515] ring-2 ring-[#7A1C1C]/30 shadow-md'
                  : 'bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700/80 text-[#2D241E] dark:text-stone-200 border-[#E6E0D5] dark:border-stone-700 shadow-2xs'
              }`}
              title="कम्प्युटर तथा मोबाइल एप डाउनलोड गर्नुहोस् (Windows, Android, Mac, iOS)"
            >
              <Download className={`w-4 h-4 ${isDownloadDropdownOpen ? 'text-amber-300' : 'text-[#7A1C1C] dark:text-amber-400'}`} />
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
                      📲 एप डाउनलोड (Download App)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60">
                    १००% अफलाइन
                  </span>
                </div>

                {/* 4 Platforms list */}
                <div className="py-1.5 space-y-1">
                  {/* 1. Windows */}
                  <div className="flex items-center justify-between p-2 rounded-xl hover:bg-blue-50/70 dark:hover:bg-stone-800 group border border-transparent hover:border-blue-200 dark:hover:border-stone-700 transition-all">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDownloadDropdownOpen(false);
                        setDownloadModalPlatform('WINDOWS');
                        setIsDownloadModalOpen(true);
                      }}
                      className="flex-1 text-left flex items-start gap-2.5 cursor-pointer text-stone-800 dark:text-stone-200"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <Monitor className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 group-hover:text-blue-700 dark:group-hover:text-blue-400">
                            १. Windows (कम्प्युटर एप)
                          </span>
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                            .exe
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                          Windows 10, 11 • सेटअप इन्स्टलर तथा पोर्टेबल
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      title="सिधै Windows Setup (.exe) डाउनलोड गर्नुहोस्"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDownloadDropdownOpen(false);
                        triggerDirectBrowserDownload(
                          DEFAULT_DIRECT_DOWNLOADS.windowsSetup,
                          'nepali-vedic-jyotish-panchanga-setup-1.0.0.exe'
                        );
                      }}
                      className="ml-2 px-2.5 py-1.5 rounded-lg bg-[#7A1C1C] hover:bg-[#991B1B] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer shrink-0 transition-transform active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>.exe</span>
                    </button>
                  </div>

                  {/* 2. Android */}
                  <div className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50/70 dark:hover:bg-stone-800 group border border-transparent hover:border-emerald-200 dark:hover:border-stone-700 transition-all">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDownloadDropdownOpen(false);
                        setDownloadModalPlatform('ANDROID');
                        setIsDownloadModalOpen(true);
                      }}
                      className="flex-1 text-left flex items-start gap-2.5 cursor-pointer text-stone-800 dark:text-stone-200"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                            २. Android (मोबाइल एप)
                          </span>
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                            .apk
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                          Samsung, Xiaomi, Vivo • .apk फाइल तथा १-क्लिक इन्स्टल
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      title="Android मोबाइल एप स्थापना विकल्प हेर्नुहोस्"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDownloadDropdownOpen(false);
                        setDownloadModalPlatform('ANDROID');
                        setIsDownloadModalOpen(true);
                      }}
                      className="ml-2 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer shrink-0 transition-transform active:scale-95"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>इन्स्टल</span>
                    </button>
                  </div>

                  {/* 3. Mac */}
                  <div className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 group border border-transparent hover:border-stone-300 dark:hover:border-stone-700 transition-all">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDownloadDropdownOpen(false);
                        setDownloadModalPlatform('MAC');
                        setIsDownloadModalOpen(true);
                      }}
                      className="flex-1 text-left flex items-start gap-2.5 cursor-pointer text-stone-800 dark:text-stone-200"
                    >
                      <div className="w-8 h-8 rounded-lg bg-stone-500/15 text-stone-800 dark:text-stone-200 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <Apple className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 group-hover:text-stone-900 dark:group-hover:text-white">
                            ३. Mac (macOS एप्पल एप)
                          </span>
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200">
                            .dmg
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                          Apple Mac M1/M2/M3/M4 तथा Intel MacBook
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      title="सिधै Mac DMG (.dmg) डाउनलोड गर्नुहोस्"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDownloadDropdownOpen(false);
                        triggerDirectBrowserDownload(
                          DEFAULT_DIRECT_DOWNLOADS.macDmg,
                          'nepali-vedic-jyotish-panchanga-1.0.0.dmg'
                        );
                      }}
                      className="ml-2 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-black text-white text-[11px] font-bold flex items-center gap-1 shadow-xs cursor-pointer shrink-0 transition-transform active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>.dmg</span>
                    </button>
                  </div>

                  {/* 4. iOS */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsDownloadDropdownOpen(false);
                      setDownloadModalPlatform('IOS');
                      setIsDownloadModalOpen(true);
                    }}
                    className="w-full text-left p-2 rounded-xl flex items-start gap-2.5 transition-all cursor-pointer hover:bg-purple-50/70 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 group border border-transparent hover:border-purple-200 dark:hover:border-stone-700"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 group-hover:text-purple-700 dark:group-hover:text-purple-400">
                          ४. iOS (iPhone / iPad)
                        </span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                          PWA / Safari
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                        Safari बाट Add to Home Screen गरी १००% अफलाइन
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
                    <span>विस्तृत हब हेर्नुहोस्</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

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
                  {/* 6. Super Admin Control & Purchase Approvals */}
                  {onNavigateToAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsUnifiedSettingsOpen(false);
                        onNavigateToAdmin('client_approvals');
                      }}
                      className="w-full text-left p-2 rounded-xl flex items-start gap-2.5 transition-all cursor-pointer hover:bg-amber-500/10 dark:hover:bg-amber-950/40 text-stone-800 dark:text-stone-200 group border border-amber-500/30"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                        <Crown className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs sm:text-sm text-[#7A1C1C] dark:text-amber-300">
                            ६. सुपरएडमिन कक्ष तथा खरिद स्वीकृति
                          </span>
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500 text-stone-950">
                            Superadmin
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                          eSewa/Khalti खरिद आवेदन रुजु, प्रयोगकर्ता तथा प्रणाली नियन्त्रण
                        </p>
                      </div>
                    </button>
                  )}
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

          {/* Right Action: RBAC Session status badge or Sign In */}
          {rbacSession ? (
            <div className="pl-1.5 sm:pl-2 border-l border-stone-200 dark:border-stone-800 flex items-center gap-1.5 shrink-0">
              {/* Post-sign-in user status pill */}
              <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-stone-800 border border-amber-200/80 dark:border-stone-700 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight truncate max-w-[100px] xl:max-w-[120px]">
                    {rbacSession.fullName}
                  </span>
                  <span className="text-[10px] text-[#7A1C1C] dark:text-amber-400 font-semibold leading-tight truncate">
                    {rbacSession.roleNameNepali}
                  </span>
                </div>
              </div>

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
                if (!isFullyUnlocked) {
                  if (onOpenPurchaseModal) onOpenPurchaseModal('ज्योतिष');
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
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500 text-stone-950">
                      प्रवेश
                    </span>
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
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setIsSewaMenuOpen(false);
                      onTabChange(sub.id);
                    }}
                    className="text-left p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 hover:bg-amber-50 dark:hover:bg-stone-700/60 flex items-center gap-1.5 cursor-pointer"
                  >
                    <SubIcon className="w-3 h-3 text-[#7A1C1C] dark:text-amber-400 shrink-0" />
                    <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200 truncate">
                      {sub.labelNepali}
                    </span>
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
                setIsSewaMenuOpen(false);
                if (!isFullyUnlocked) {
                  if (onOpenPurchaseModal) onOpenPurchaseModal('वास्तुशास्त्र');
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
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-600 text-white">
                      विन्डो
                    </span>
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
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setIsSewaMenuOpen(false);
                      if (!isFullyUnlocked && onOpenPurchaseModal) {
                        onOpenPurchaseModal(item.labelNepali);
                        return;
                      }
                      if (onOpenVastuModal) onOpenVastuModal(item.id);
                      else onTabChange('vastu');
                    }}
                    className="text-left p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 hover:bg-emerald-50 dark:hover:bg-stone-700/60 flex items-center gap-1.5 cursor-pointer"
                  >
                    <SubIcon className="w-3 h-3 text-emerald-700 dark:text-emerald-400 shrink-0" />
                    <span className="text-[11px] font-bold text-stone-800 dark:text-stone-200 truncate">
                      {item.labelNepali}
                    </span>
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
      {/* MOBILE LEFT DRAWER — visible only on small screens                 */}
      {/* ================================================================= */}
      {isMobileDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[9990] sm:hidden"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed top-0 left-0 h-full w-[82vw] max-w-xs bg-white dark:bg-stone-900 z-[9995] shadow-2xl sm:hidden flex flex-col overflow-hidden animate-in slide-in-from-left duration-200">

            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#7A1C1C] to-[#9B2C2C] text-white shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span className="font-bold text-sm font-serif">नेपाली वैदिक पञ्चाङ्ग</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Active indicator bar */}
            <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/50 shrink-0">
              <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">हाल सक्रिय</p>
              <p className="text-xs font-bold text-[#7A1C1C] dark:text-amber-300">
                {MAIN_NAV_ITEMS.find(i => i.id === activeTab)?.labelNepali || activeTab}
              </p>
            </div>

            {/* Scrollable Menu Content */}
            <div className="flex-1 overflow-y-auto py-2">

              {/* MAIN MENUS */}
              <div className="px-4 pt-2 pb-1">
                <p className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest">मुख्य मेनु</p>
              </div>
              {visibleNavItems.filter(i => i.id !== 'sewa').map((item) => {
                const MIcon = item.icon;
                const mIsActive = activeTab === item.id && activeModule === 'MAIN';
                const mIsAllowed = !rbacSession
                  ? PUBLIC_UNAUTH_NAV_IDS.has(item.id)
                  : (isFullyUnlocked || NORMAL_USER_ALLOWED_TABS.has(item.id));
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      if (!rbacSession && !PUBLIC_UNAUTH_NAV_IDS.has(item.id)) { if (onOpenAuthModal) onOpenAuthModal(); return; }
                      if (!mIsAllowed) { if (onOpenPurchaseModal) onOpenPurchaseModal(item.labelNepali); return; }
                      onTabChange(item.id);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors cursor-pointer border-b border-stone-50 dark:border-stone-800/40 ${
                      mIsActive ? 'bg-[#7A1C1C] text-white' : 'text-stone-800 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <MIcon className={`w-4 h-4 shrink-0 ${mIsActive ? 'text-amber-300' : 'text-[#7A1C1C] dark:text-amber-400'}`} />
                    <span className="flex-1 text-left">{item.labelNepali}</span>
                    {!mIsAllowed && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
                    {mIsActive && <ChevronRight className="w-3 h-3 text-amber-300 shrink-0" />}
                  </button>
                );
              })}

              {/* VEDIC SERVICES */}
              <div className="px-4 pt-3 pb-1 mt-1 border-t border-stone-100 dark:border-stone-800">
                <p className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest">वैदिक सेवाहरू</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  if (onEnterJyotish) onEnterJyotish(); else onTabChange('jyotishi');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors cursor-pointer ${
                  activeModule === 'JYOTISH' ? 'bg-[#7A1C1C] text-white' : 'text-stone-800 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-800'
                }`}
              >
                <Sparkles className={`w-4 h-4 shrink-0 ${activeModule === 'JYOTISH' ? 'text-amber-300' : 'text-[#7A1C1C] dark:text-amber-400'}`} />
                <span className="flex-1 text-left">ज्योतिष कार्यक्षेत्र</span>
                <ChevronRight className={`w-3 h-3 shrink-0 ${activeModule === 'JYOTISH' ? 'text-amber-300' : 'text-stone-400'}`} />
              </button>

              {ANYA_FALADESH_ITEMS.map((sub) => {
                const SIcon = sub.icon;
                const sActive = activeTab === sub.id;
                return (
                  <button key={sub.id} type="button"
                    onClick={() => { setIsMobileDrawerOpen(false); onTabChange(sub.id); }}
                    className={`w-full flex items-center gap-3 pl-10 pr-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer border-b border-stone-50 dark:border-stone-800/30 ${
                      sActive ? 'bg-amber-100 dark:bg-amber-950/40 text-[#7A1C1C]' : 'text-stone-600 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <SIcon className="w-3.5 h-3.5 shrink-0 text-[#7A1C1C] dark:text-amber-500" />
                    <span className="flex-1 text-left">{sub.labelNepali}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold">{sub.badge}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  if (onOpenVastuModal) onOpenVastuModal('project'); else onTabChange('vastu');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold cursor-pointer text-stone-800 dark:text-stone-200 hover:bg-emerald-50 dark:hover:bg-stone-800 transition-colors"
              >
                <Compass className="w-4 h-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
                <span className="flex-1 text-left">वास्तुशास्त्र</span>
                <ChevronRight className="w-3 h-3 shrink-0 text-stone-400" />
              </button>

              {VASTU_SUBMENU_ITEMS.slice(0, 4).map((vi) => {
                const VI = vi.icon;
                return (
                  <button key={vi.id} type="button"
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      if (onOpenVastuModal) onOpenVastuModal(vi.id);
                    }}
                    className="w-full flex items-center gap-3 pl-10 pr-4 py-2.5 text-xs font-semibold cursor-pointer text-stone-600 dark:text-stone-400 hover:bg-emerald-50 dark:hover:bg-stone-800 transition-colors border-b border-stone-50 dark:border-stone-800/30"
                  >
                    <VI className="w-3.5 h-3.5 shrink-0 text-emerald-700 dark:text-emerald-400" />
                    <span className="flex-1 text-left">{vi.labelNepali}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 font-bold">{vi.badge}</span>
                  </button>
                );
              })}

              {/* OTHER SECTION */}
              <div className="px-4 pt-3 pb-1 mt-1 border-t border-stone-100 dark:border-stone-800">
                <p className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-widest">अन्य</p>
              </div>

              <button type="button"
                onClick={() => { setIsMobileDrawerOpen(false); if (onOpenSettingsModal) onOpenSettingsModal('astro'); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold cursor-pointer text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                <Settings className="w-4 h-4 shrink-0 text-[#7A1C1C] dark:text-amber-400" />
                <span className="flex-1 text-left">सेटिङ</span>
              </button>

              <button type="button"
                onClick={() => { setIsMobileDrawerOpen(false); onTabChange('help'); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold cursor-pointer text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                <HelpCircle className="w-4 h-4 shrink-0 text-[#7A1C1C] dark:text-amber-400" />
                <span className="flex-1 text-left">मद्दत / सहायता</span>
              </button>

              {!isInstalled && !isDesktopApp() && (
                <button type="button"
                  onClick={() => { setIsMobileDrawerOpen(false); setDownloadModalPlatform('ANDROID'); setIsDownloadModalOpen(true); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold cursor-pointer text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  <Download className="w-4 h-4 shrink-0 text-[#7A1C1C] dark:text-amber-400" />
                  <span className="flex-1 text-left">एप डाउनलोड</span>
                </button>
              )}

              {rbacSession ? (
                onLogoutRBAC && rbacSession.role !== 'CUSTOMER' && (
                  <button type="button"
                    onClick={() => { setIsMobileDrawerOpen(false); onLogoutRBAC(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold cursor-pointer text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-stone-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-left">लगआउट</span>
                  </button>
                )
              ) : (
                onOpenAuthModal && (
                  <button type="button"
                    onClick={() => { setIsMobileDrawerOpen(false); onOpenAuthModal(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold cursor-pointer text-[#7A1C1C] dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-stone-800 transition-colors"
                  >
                    <LogIn className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-left">साइन इन / लगइन</span>
                  </button>
                )
              )}

              <div className="h-8" />
            </div>
          </div>
        </>
      )}

    </nav>
  );
});
