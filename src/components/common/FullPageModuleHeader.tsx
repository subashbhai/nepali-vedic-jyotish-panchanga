import React, { memo, useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Sun,
  Moon,
  ArrowRightLeft,
  Settings,
  User,
  LogIn,
  LogOut,
  Building2,
  Clock,
  Compass,
  HeartHandshake,
  Users,
  Newspaper,
  ShoppingBag,
  CalendarDays,
  FileText,
  BookOpen,
  Globe2,
  HelpCircle,
  Hash,
  Timer,
  Scroll,
  Award,
  UserPlus,
  Bot,
  ShieldCheck,
  ChevronDown,
  Check,
  LayoutDashboard,
  Crown
} from 'lucide-react';
import { NavTab } from '../Navigation';
import { BirthDetails, ApplicationSettings, OrganizationProfile } from '../../types/astrology';
import { RBACSession, getUserDashboardTarget } from '../../db/rbacStore';

export interface ModuleHeaderInfo {
  title: string;
  subtitle: string;
  badge: string;
  icon: React.FC<{ className?: string }>;
}

export const MODULE_HEADER_METADATA: Record<string, ModuleHeaderInfo> = {
  panchanga: {
    title: 'नेपाली वैदिक पञ्चाङ्ग',
    subtitle: 'दैनिक तिथि, बार, नक्षत्र, योग, करण, सूर्योदय तथा खगोलीय स्थिति',
    badge: 'पञ्चाङ्ग खण्ड',
    icon: Clock,
  },
  vastu: {
    title: 'वैदिक वास्तुशास्त्र सेवा',
    subtitle: '३६०° डिजिटल कम्पास, मण्डल, संरचना अडिट, भूमि परीक्षण तथा वास्तु उपचार',
    badge: 'वास्तु सेवा',
    icon: Compass,
  },
  vivah: {
    title: 'विवाह कुण्डली मिलान (मेलापक)',
    subtitle: 'अष्टकूट गुण मिलान, मङ्गल दोष, नाडी दोष विचार तथा वर-वधु मेलापक',
    badge: 'विवाह मिलान',
    icon: HeartHandshake,
  },
  yajaman: {
    title: 'यजमान तथा ग्राहक व्यवस्थापन',
    subtitle: 'यजमान विवरण, कुण्डली अभिलेख, पूजा इतिहास तथा सम्पर्क व्यवस्थापन',
    badge: 'यजमान केन्द्र',
    icon: Users,
  },
  samachar: {
    title: 'वैदिक पञ्चाङ्ग तथा चाडपर्व समाचार',
    subtitle: 'दैनिक शास्त्रीय समाचार, तिथि महात्म्य, शुभ साइत तथा चाडपर्व पूर्वतयारी',
    badge: 'प्रमुख समाचार',
    icon: Newspaper,
  },
  kharedi: {
    title: 'वैदिक पसल तथा पूजा सामग्री',
    subtitle: 'प्रमाणित रत्न, रुद्राक्ष, श्रीयन्त्र, धार्मिक ग्रन्थ तथा पूजा सामग्री',
    badge: 'वैदिक पसल',
    icon: ShoppingBag,
  },
  org_profile: {
    title: 'संस्थागत प्रोफाइल तथा परिचय',
    subtitle: 'बालानन्द वैदिक अनुसन्धान केन्द्र, सम्पर्क तथा आधिकारिक विवरण',
    badge: 'संस्था प्रोफाइल',
    icon: Building2,
  },
  calendar: {
    title: 'नेपाली भित्तेपात्रो तथा क्यालेन्डर',
    subtitle: 'मासिक क्यालेन्डर, चाडपर्व, राष्ट्रिय बिदा तथा शुभ साइत तालिका',
    badge: 'नेपाली क्यालेन्डर',
    icon: CalendarDays,
  },
  patro: {
    title: 'नेपाली भित्तेपात्रो तथा क्यालेन्डर',
    subtitle: 'मासिक क्यालेन्डर, चाडपर्व, राष्ट्रिय बिदा तथा शुभ साइत तालिका',
    badge: 'नेपाली क्यालेन्डर',
    icon: CalendarDays,
  },
  sewa: {
    title: 'वैदिक सेवाहरू मुख्य केन्द्र',
    subtitle: 'ज्योतिष परामर्श तथा वास्तुशास्त्र सेवाहरूको एकीकृत केन्द्र',
    badge: 'सेवा केन्द्र',
    icon: Sparkles,
  },
  rashifal: {
    title: 'दैनिक तथा वार्षिक राशिफल',
    subtitle: '१२ वटै राशिको आजको भविष्यफल, शुभ अंक, रंग तथा उपाय',
    badge: 'राशिफल',
    icon: Sparkles,
  },
  kundali: {
    title: 'जन्मकुण्डली चक्र तथा ग्रह स्पष्ट',
    subtitle: 'लग्न, नवमांश, भाव चक्र तथा विस्तृत ग्रह स्थिति',
    badge: 'कुण्डली चक्र',
    icon: Sparkles,
  },
  patrika: {
    title: 'डिजिटल चिना तथा पत्रिका',
    subtitle: 'सटीक वैदिक चिना, टिपन तथा प्रिन्ट योग्य पत्रिका',
    badge: 'पत्रिका / चिना',
    icon: FileText,
  },
  tipan: {
    title: 'जन्म टिपन तथा संक्षिप्त पत्रिका',
    subtitle: 'संक्षिप्त जन्म विवरण तथा लग्न कुण्डली टिपन',
    badge: 'जन्म टिपन',
    icon: FileText,
  },
  faladesh: {
    title: 'समग्र वैदिक फलादेश',
    subtitle: 'द्वादश भाव फल, ग्रह फल तथा जीवनको विस्तृत भविष्यवाणि',
    badge: 'फलादेश',
    icon: BookOpen,
  },
  dasha: {
    title: 'विंशोत्तरी तथा योगिनी दशा',
    subtitle: 'महादशा, अन्तर्दशा तथा प्रत्यन्तर दशा समय चक्र',
    badge: 'दशा चक्र',
    icon: Clock,
  },
  gochar: {
    title: 'वर्तमान ग्रह गोचर तथा साढेसाती',
    subtitle: 'प्रत्यक्ष खगोलीय ग्रह गोचर, अष्टकवर्ग तथा साढेसाती प्रभाव',
    badge: 'ग्रह गोचर',
    icon: Globe2,
  },
  prashna: {
    title: 'दैवज्ञ प्रश्न ज्योतिष',
    subtitle: 'तात्कालिक प्रश्न विचार, प्रश्न कुण्डली तथा समाधान',
    badge: 'प्रश्न ज्योतिष',
    icon: HelpCircle,
  },
  ankajyotish: {
    title: 'वैदिक अंक ज्योतिष (Numerology)',
    subtitle: 'मूलाङ्क, भाग्याङ्क, नामाङ्क तथा शुभ अंक विश्लेषण',
    badge: 'अंक ज्योतिष',
    icon: Hash,
  },
  kpjyotish: {
    title: 'कृष्णमूर्ति पद्धति (KP Astrology)',
    subtitle: 'उप-स्वामी (Sub-Lord), कस्प, ग्रह नक्षत्र तथा सटीक निर्णय',
    badge: 'केपी ज्योतिष',
    icon: Compass,
  },
  neemajyotish: {
    title: 'नेमा ज्योतिष (तिब्बती पञ्चतत्व)',
    subtitle: 'तिब्बती पञ्चतत्व, ९ मेवा, ८ पार्खा तथा जुङ्ची फल',
    badge: 'नेमा ज्योतिष',
    icon: Compass,
  },
  muhurta: {
    title: 'सर्वसिद्धि शुभ मुहूर्त विचार',
    subtitle: 'विवाह, गृहप्रवेश, व्रतबन्ध, पास्नी तथा शुभ कार्य साइत',
    badge: 'शुभ मुहूर्त',
    icon: Timer,
  },
  sanskar: {
    title: 'षोडश वैदिक संस्कार दस्तावेज',
    subtitle: 'नामकरण, अन्नप्राशन, चूडाकर्म, विवाह तथा अन्य संस्कार',
    badge: 'वैदिक संस्कार',
    icon: Scroll,
  },
  my_subscription: {
    title: 'मेरो सदस्यता तथा लाइसेन्स',
    subtitle: 'सक्रिय योजना, नवीकरण तथा सदस्यता स्थिति',
    badge: 'सदस्यता',
    icon: Award,
  },
  apply_expert: {
    title: 'ज्योतिषी तथा वास्तुविद् प्रमाणीकरण',
    subtitle: 'बालानन्द राष्ट्रिय वैदिक सञ्जालमा जोडिन आवेदन',
    badge: 'विज्ञ आवेदन',
    icon: UserPlus,
  },
  knowledge: {
    title: 'वैदिक ज्ञान तथा ग्रन्थ भण्डार',
    subtitle: 'शास्त्र, संहिता, श्लोक तथा ज्योतिषीय अनुसन्धान लेख',
    badge: 'ज्ञान भण्डार',
    icon: BookOpen,
  },
  ai_assistant: {
    title: 'बालानन्द वैदिक AI सहायक',
    subtitle: 'प्राचीन शास्त्र र आधुनिक AI को संगमद्वारा ज्योतिषीय संवाद',
    badge: 'AI सहायक',
    icon: Bot,
  },
  date_converter: {
    title: 'विक्रम संवत् - ईस्वी सन् मिति रूपान्तरण',
    subtitle: 'वि.सं. र ई.सं. दुईतर्फी क्यालेन्डर रूपान्तरण यन्त्र',
    badge: 'मिति रूपान्तरण',
    icon: ArrowRightLeft,
  },
  help: {
    title: 'मद्दत तथा प्रयोगकर्ता निर्देशिका',
    subtitle: 'सफ्टवेयर प्रयोग विधि, बारम्बार सोधिने प्रश्नहरू (FAQ) र सहायता',
    badge: 'मद्दत केन्द्र',
    icon: HelpCircle,
  },
  admin_control: {
    title: 'सुपरएडमिन नियन्त्रण कक्ष',
    subtitle: 'प्रणाली व्यवस्थापन, खरिद आवेदन रुजु तथा पूर्ण डेटा नियन्त्रण',
    badge: 'सुपर एडमिन',
    icon: ShieldCheck,
  },
  store_admin: {
    title: 'वैदिक पसल तथा डिजिटल पुस्तकालय व्यवस्थापन',
    subtitle: 'सामग्री, स्टक इन्भेन्टरी, अर्डर, भुक्तानी प्रमाणीकरण, ग्रन्थ तथा PDF अपलोडर',
    badge: 'स्टोर एडमिन',
    icon: ShoppingBag,
  },
  pos: {
    title: 'काउन्टर POS बिलिङ टर्मिनल',
    subtitle: 'काउन्टर प्रत्यक्ष बिक्री, इनभ्वाइस तथा रसिद प्रिन्टिङ',
    badge: 'काउन्टर POS',
    icon: ShoppingBag,
  },
  news_editor: {
    title: 'समाचार तथा लेख सम्पादक ड्यासबोर्ड',
    subtitle: 'बालानन्द वैदिक पञ्चाङ्ग, चाडपर्व, खगोल तथा धार्मिक समाचार प्रकाशन',
    badge: 'समाचार सम्पादक',
    icon: Newspaper,
  },
  vivah_admin: {
    title: 'विवाह बायोडाटा सुपरभाइजर ड्यासबोर्ड',
    subtitle: 'वैवाहिक प्रोफाइल प्रमाणीकरण, वर-वधु मेलापक तथा डेटा सुपरभाइजिङ',
    badge: 'विवाह सुपरभाइजर',
    icon: HeartHandshake,
  },
  whatsapp_admin: {
    title: 'ह्वाट्सएप दैनिक सन्देश व्यवस्थापक',
    subtitle: 'दैनिक पञ्चाङ्ग, राशिफल तथा पर्व सूचना स्वचालित ह्वाट्सएप प्रसारण',
    badge: 'ह्वाट्सएप म्यानेजर',
    icon: Bot,
  },
};

export interface FullPageModuleHeaderProps {
  activeTab: NavTab;
  onGoHome: () => void;
  onOpenDateConverter?: () => void;
  onToggleTheme?: () => void;
  onOpenSettings?: () => void;
  activeProfile?: BirthDetails | null;
  profiles?: BirthDetails[];
  onSelectProfile?: (p: BirthDetails) => void;
  rbacSession?: RBACSession | null;
  onOpenAuthModal?: () => void;
  onLogoutRBAC?: () => void;
  orgProfile?: OrganizationProfile;
  onNavigateTab?: (tab: string) => void;
  onNavigateToAdmin?: (tab?: string) => void;
}

export const FullPageModuleHeader: React.FC<FullPageModuleHeaderProps> = memo(({
  activeTab,
  onGoHome,
  onOpenDateConverter,
  onToggleTheme,
  onOpenSettings,
  activeProfile,
  profiles = [],
  onSelectProfile,
  rbacSession,
  onOpenAuthModal,
  onLogoutRBAC,
  orgProfile,
  onNavigateTab,
  onNavigateToAdmin,
}) => {
  const info: ModuleHeaderInfo = MODULE_HEADER_METADATA[activeTab] || {
    title: 'बालानन्द वैदिक सेवा',
    subtitle: 'वैदिक ज्योतिष तथा पञ्चाङ्ग सेवा',
    badge: 'वैदिक सेवा',
    icon: Sparkles,
  };

  const IconComponent = info.icon;
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-[#7A1C1C] text-white px-3 sm:px-4 h-[52px] sm:h-14 shadow-md border-b border-amber-600/40 flex items-center justify-between sticky top-0 z-50 select-none">
      {/* 1. Left Section: Return to Home Button & Module Identity */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Main Return to Home Button (Same as Jyotish Sewa) */}
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 active:bg-amber-600/40 text-amber-100 font-bold text-xs sm:text-sm border border-amber-400/40 shadow-xs transition-all cursor-pointer group shrink-0"
          title="गृह पृष्ठमा फर्कनुहोस्"
        >
          <ArrowLeft className="w-4 h-4 text-amber-300 group-hover:-translate-x-1 transition-transform" />
          <span className="whitespace-nowrap font-medium">गृह पृष्ठमा फर्कनुहोस्</span>
        </button>

        <div className="h-5 w-[1px] bg-amber-500/30 hidden sm:block shrink-0" />

        {/* Module Icon and Titles */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/25 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold shadow-inner shrink-0">
            <IconComponent className="w-4 h-4 text-amber-300" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold font-serif text-amber-100 tracking-wide leading-tight truncate">
              {info.title}
            </h1>
            <p className="text-[10.5px] text-amber-200/80 hidden md:block truncate">
              {info.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Center Section: Section Badge */}
      <div className="hidden xl:flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/25 border border-amber-400/30 text-amber-200 text-xs font-bold font-serif shadow-inner shrink-0 mx-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>{info.badge}</span>
      </div>

      {/* 3. Right Section: Quick Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Active Profile Pill / Dropdown (if multiple profiles exist) */}
        {profiles.length > 0 && activeProfile && onSelectProfile && (
          <div className="relative hidden lg:block" ref={profileDropdownRef}>
            <button
              type="button"
              onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-100 text-xs font-medium cursor-pointer transition-colors"
              title="सक्रिय कुण्डली प्रोफाइल"
            >
              <User className="w-3.5 h-3.5 text-amber-300" />
              <span className="max-w-[120px] truncate font-bold text-amber-200">{activeProfile.name}</span>
              <ChevronDown className={`w-3 h-3 text-amber-300 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-stone-900 border border-amber-500/30 rounded-2xl shadow-xl p-1.5 z-50 space-y-1">
                <div className="px-2.5 py-1 text-[11px] font-bold text-amber-300/80 border-b border-stone-800">
                  कुण्डली प्रोफाइल चयन:
                </div>
                <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar">
                  {profiles.map((p) => {
                    const isCur = p.id === activeProfile.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          onSelectProfile(p);
                          setIsProfileDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                          isCur
                            ? 'bg-[#7A1C1C] text-amber-100 font-bold'
                            : 'text-stone-300 hover:bg-stone-800'
                        }`}
                      >
                        <span className="truncate">{p.name}</span>
                        {isCur && <Check className="w-3.5 h-3.5 text-amber-300 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Date Converter Shortcut Button */}
        {onOpenDateConverter && (
          <button
            type="button"
            onClick={onOpenDateConverter}
            className="p-1.5 sm:px-2 sm:py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-200 hover:text-amber-100 border border-amber-400/30 transition-all cursor-pointer flex items-center gap-1 text-xs"
            title="वि.सं. ↔ ई.सं. मिति रूपान्तरण"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">रूपान्तरण</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-200 hover:text-amber-100 border border-amber-400/30 transition-all cursor-pointer"
            title="थिम परिवर्तन गर्नुहोस्"
          >
            <Sun className="w-4 h-4 text-amber-300" />
          </button>
        )}

        {/* Settings Button */}
        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-200 hover:text-amber-100 border border-amber-400/30 transition-all cursor-pointer"
            title="प्रणाली सेटिङ"
          >
            <Settings className="w-4 h-4 text-amber-300" />
          </button>
        )}

        {/* User / Login Status */}
        {rbacSession ? (
          <div className="relative z-50" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/40 text-amber-100 text-xs font-medium cursor-pointer transition-all select-none shadow-xs group"
              title="मेरो खाता तथा ड्यासबोर्ड (My Dashboard) खोल्न क्लिक गर्नुहोस्"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
              <div className="flex flex-col text-left">
                <span className="font-bold text-white text-xs leading-tight truncate max-w-[90px] sm:max-w-[120px]">
                  {rbacSession.fullName}
                </span>
                <span className="text-[10px] text-amber-300 font-semibold leading-tight truncate">
                  {rbacSession.roleNameNepali}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-amber-300 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`} />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border-2 border-amber-300 dark:border-stone-700 p-2.5 z-[100] animate-in fade-in slide-in-from-top-2 text-stone-900 dark:text-stone-100">
                {/* User Profile Header Card */}
                <div className="p-3 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/50 dark:from-stone-800 dark:via-stone-800/90 dark:to-stone-800/60 rounded-xl border border-amber-200/70 dark:border-stone-700 mb-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-stone-950 font-black flex items-center justify-center shrink-0 text-sm shadow-xs border border-amber-300">
                      {rbacSession.fullName ? rbacSession.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                          {rbacSession.fullName}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="सक्रिय सत्र (Online)" />
                      </div>
                      <span className="text-[10px] font-bold text-[#7A1C1C] dark:text-amber-300 block truncate">
                        {rbacSession.roleNameNepali}
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block truncate font-mono">
                        @{rbacSession.username}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 🌟 Primary Highlight: "My Dashboard" submenu */}
                <div className="py-1 space-y-1">
                  <div className="px-2 py-0.5 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider flex items-center justify-between">
                    <span>कार्यक्षेत्र (Workstation)</span>
                    <span className="text-[9px] text-emerald-600 font-semibold">सक्रिय</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      const target = getUserDashboardTarget(rbacSession.role);
                      if (target.tab === 'admin_control' && onNavigateToAdmin) {
                        onNavigateToAdmin('client_approvals');
                      } else if (onNavigateTab) {
                        onNavigateTab(target.tab);
                      }
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md hover:shadow-lg flex items-start gap-3 cursor-pointer transition-all transform hover:scale-[1.01] group border border-amber-300"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-black text-xs">
                          ✨ मेरो ड्यासबोर्ड (My Dashboard)
                        </span>
                        <span className="text-[9px] bg-white/25 px-1.5 py-0.5 rounded font-bold font-mono">
                          खुल्छ ↗
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-amber-100 truncate mt-0.5">
                        {getUserDashboardTarget(rbacSession.role).labelNepali}
                      </p>
                      <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">
                        {getUserDashboardTarget(rbacSession.role).descriptionNepali}
                      </p>
                    </div>
                  </button>

                  {/* Quick Access links for Super Admin or Store Admin */}
                  {(rbacSession.role === 'SUPER_ADMIN' || rbacSession.role === 'STORE_ADMIN') && onNavigateTab && (
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-1">
                      <div className="px-2 py-0.5 text-[9px] font-bold text-stone-500 dark:text-stone-400 uppercase">
                        द्रुत पहुँच (Quick Access):
                      </div>

                      {rbacSession.role !== 'STORE_ADMIN' && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onNavigateTab('store_admin');
                          }}
                          className="w-full text-left p-1.5 px-2 rounded-lg text-[11px] font-bold text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-800 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                          <span>🏬 स्टोर एवं डिजिटल पुस्तकालय एडमिन</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigateTab('pos');
                        }}
                        className="w-full text-left p-1.5 px-2 rounded-lg text-[11px] font-bold text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-800 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                        <span>💳 काउन्टर POS बिलिङ टर्मिनल</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigateTab('news_editor');
                        }}
                        className="w-full text-left p-1.5 px-2 rounded-lg text-[11px] font-bold text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-800 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Newspaper className="w-3.5 h-3.5 text-emerald-600" />
                        <span>📰 समाचार तथा लेख सम्पादक</span>
                      </button>

                      {rbacSession.role === 'SUPER_ADMIN' && onNavigateToAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onNavigateToAdmin('client_approvals');
                          }}
                          className="w-full text-left p-1.5 px-2 rounded-lg text-[11px] font-bold text-[#7A1C1C] dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-stone-800 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Crown className="w-3.5 h-3.5 text-amber-600" />
                          <span>👑 सुपरएडमिन नियन्त्रण कक्ष</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Settings Action */}
                  {onOpenSettings && (
                    <div className="pt-1.5 border-t border-stone-100 dark:border-stone-800">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenSettings();
                        }}
                        className="w-full text-left p-1.5 px-2 rounded-lg text-[11px] font-medium text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-800 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5 text-stone-500" />
                        <span>⚙️ प्रणाली सेटिङ</span>
                      </button>
                    </div>
                  )}

                  {/* Logout Action */}
                  {onLogoutRBAC && (
                    <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogoutRBAC();
                        }}
                        className="w-full text-left p-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5 cursor-pointer transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>सत्र बन्द / लगआउट (Logout)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : onOpenAuthModal ? (
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#7A1C1C] font-black text-xs shadow-xs transition-colors cursor-pointer"
            title="लगइन गर्नुहोस्"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>लगइन</span>
          </button>
        ) : null}
      </div>
    </header>
  );
});
