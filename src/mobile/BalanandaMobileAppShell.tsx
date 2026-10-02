import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Home,
  Star,
  Calendar,
  User,
  Heart,
  Activity,
  UserCheck,
  FileText,
  Sparkles,
  ChevronRight,
  Plus,
  X,
  Layers,
  ArrowLeft,
  Menu,
  Globe
} from 'lucide-react';
import {
  MobileTab,
  MobileUserProfile,
  MobileBirthProfile
} from './types/mobileJyotishTypes';
import {
  getMobileUserSession,
  getActiveMobileBirthProfile,
  getMobileBirthProfiles,
  setActiveMobileBirthProfile
} from './db/mobileAuthStore';
import {
  getCalculatedMobileKundali,
  getMobileDailyPanchanga,
  getMobileRashiHoroscope
} from './services/mobileAstrologyService';

// Sub Views
import { MobileHomeView } from './views/MobileHomeView';
import { MobileKundaliView } from './views/MobileKundaliView';
import { MobileHoroscopeView } from './views/MobileHoroscopeView';
import { MobilePanchangaView } from './views/MobilePanchangaView';
import { MobileTransitView } from './views/MobileTransitView';
import { MobileMatchingView } from './views/MobileMatchingView';
import { MobileConsultationView } from './views/MobileConsultationView';
import { MobileReportsView } from './views/MobileReportsView';
import { MobileProfileView } from './views/MobileProfileView';
import { MobileAuthModal } from './views/MobileAuthModal';
import { DeviceUpdateNotificationBanner } from '../components/common/DeviceUpdateNotificationBanner';

export const BalanandaMobileAppShell: React.FC<{
  onExitToWeb?: () => void;
}> = ({ onExitToWeb }) => {
  const [currentTab, setCurrentTab] = useState<MobileTab>('home');
  const [user, setUser] = useState<MobileUserProfile | null>(getMobileUserSession);
  const [activeProfile, setActiveProfile] = useState<MobileBirthProfile>(getActiveMobileBirthProfile);
  const [allProfiles, setAllProfiles] = useState<MobileBirthProfile[]>(getMobileBirthProfiles);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [isQuickActionWheelOpen, setIsQuickActionWheelOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Synchronize state when profiles or session change
  const refreshUserData = () => {
    setUser(getMobileUserSession());
    setActiveProfile(getActiveMobileBirthProfile());
    setAllProfiles(getMobileBirthProfiles());
  };

  // Lock body scroll when mobile scroll-down menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleAuthChange = () => refreshUserData();
    const handleProfilesChange = () => refreshUserData();

    window.addEventListener('balananda_mobile_auth_state_changed', handleAuthChange);
    window.addEventListener('balananda_mobile_profiles_changed', handleProfilesChange);

    return () => {
      window.removeEventListener('balananda_mobile_auth_state_changed', handleAuthChange);
      window.removeEventListener('balananda_mobile_profiles_changed', handleProfilesChange);
    };
  }, []);

  // Calculated Core Astrology Data for active birth profile
  const kundaliData = useMemo(() => {
    return getCalculatedMobileKundali(activeProfile);
  }, [activeProfile]);

  // Daily Panchanga for mobile
  const dailyPanchanga = useMemo(() => {
    return getMobileDailyPanchanga();
  }, []);

  // Daily Horoscope for active profile's Moon Sign or default
  const dailyHoroscope = useMemo(() => {
    const moonRashiId = kundaliData.moonPlanet?.rashiId || 1;
    return getMobileRashiHoroscope(moonRashiId);
  }, [kundaliData]);

  // Tab Titles Map
  const tabTitles: Record<MobileTab, { title: string; subtitle: string }> = {
    home: { title: 'बालानन्द वैदिक ज्योतिष सेवा', subtitle: 'नेपाली वैदिक ज्योतिष तथा व्यक्तिगत ज्योतिष सेवा' },
    kundali: { title: 'जन्म कुण्डली तथा फलादेश', subtitle: 'लग्न, नवांश, ग्रहस्थिति र विंशोत्तरी दशा' },
    horoscope: { title: 'दैनिक राशिफल', subtitle: '१२ राशिको फलादेश तथा शुभ समय' },
    panchanga: { title: 'दैनिक पञ्चाङ्ग', subtitle: 'तिथि, वार, नक्षत्र र शुभ मुहूर्त' },
    transit: { title: 'ग्रह गोचर चक्र', subtitle: '९ ग्रहको प्रत्यक्ष खगोलीय स्थिति' },
    matching: { title: 'विवाह मिलान', subtitle: 'अष्टकूट ३६ गुण तथा मङ्गल दोष' },
    consultation: { title: 'ज्योतिषी परामर्श', subtitle: 'वरिष्ठ वैदिक ज्योतिषाचार्यसँग संवाद' },
    reports: { title: 'ज्योतिष प्रतिवेदन', subtitle: 'आधिकारिक कुण्डली PDF डाउनलोड' },
    profile: { title: 'मेरो प्रोफाइल', subtitle: 'प्रयोगकर्ता खाता तथा जन्म विवरणहरू' }
  };

  return (
    <div className="min-h-screen bg-[#0E0A08] text-stone-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* ── Direct Device Auto-Update Notification Banner ── */}
      <DeviceUpdateNotificationBanner />

      {/* ── 1. Dedicated Mobile App Bar (Top Navigation) ── */}
      <header className="sticky top-0 z-40 bg-[#1A0F0A]/95 border-b border-amber-500/30 backdrop-blur-md px-3 py-2 flex items-center justify-between gap-2 shadow-lg">
        <div className="flex items-center gap-2 min-w-0">
          {/* Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
              isMobileMenuOpen
                ? 'bg-amber-500 text-stone-950 border-amber-400 ring-2 ring-amber-400/40 shadow-xs'
                : 'bg-stone-900/80 hover:bg-stone-800 text-amber-400 border-amber-500/30 active:scale-95'
            }`}
            aria-label={isMobileMenuOpen ? 'मेनु बन्द गर्नुहोस्' : 'मेनु खोल्नुहोस्'}
            title="मुख्य मेनु खोल्नुहोस्"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {currentTab !== 'home' ? (
            <button
              type="button"
              onClick={() => setCurrentTab('home')}
              className="p-1.5 text-amber-400 hover:text-amber-300 rounded-xl bg-stone-900/60 border border-stone-800 transition-colors cursor-pointer shrink-0"
              title="गृहपृष्ठमा फर्कनुहोस्"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-stone-950 font-black text-xs shadow-md shrink-0">
              ॐ
            </div>
          )}

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-amber-100 font-serif truncate leading-tight">
              {tabTitles[currentTab].title}
            </h1>
            <p className="text-[10px] text-amber-400/80 truncate leading-tight">
              {tabTitles[currentTab].subtitle}
            </p>
          </div>
        </div>

        {/* Right Action Icons: Active Profile Pill + User Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsProfileSheetOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/50 rounded-full text-stone-300 text-[10.5px] font-bold transition-colors cursor-pointer"
            title="सक्रिय कुण्डली फेर्नुहोस्"
          >
            <Compass className="w-3 h-3 text-amber-400" />
            <span className="max-w-[70px] truncate">{activeProfile.name.split(' ')[0]}</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('profile')}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors cursor-pointer ${
              currentTab === 'profile'
                ? 'bg-amber-500 text-stone-950'
                : 'bg-stone-800 text-amber-300 border border-amber-500/30'
            }`}
            title="प्रोफाइल तथा खाता"
          >
            {user?.fullName ? user.fullName[0] : 'सु'}
          </button>
        </div>
      </header>

      {/* ── Scroll-Down Main Menu for Mobile App ── */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Top-Down Scrollable Sheet Container */}
          <div className="fixed top-0 left-0 right-0 max-h-[90vh] bg-[#160D08] border-b-4 border-amber-500 rounded-b-3xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-top duration-300 ease-out">
            {/* Header with Title and Close Button */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 border-b border-amber-500/30 text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-stone-950 font-serif font-black flex items-center justify-center text-sm shadow-xs">
                  ॐ
                </div>
                <div>
                  <h2 className="font-bold text-sm font-serif text-amber-100 flex items-center gap-1.5 leading-tight">
                    <span>बालानन्द ज्योतिष मेनु</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </h2>
                  <p className="text-[10px] text-amber-400/80 leading-tight">
                    नेपाली वैदिक ज्योतिष तथा व्यक्तिगत सेवा
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-xl bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center cursor-pointer border border-stone-700 active:scale-95 transition-transform"
                aria-label="मेनु बन्द गर्नुहोस्"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Active Status & Scroll Hint Bar */}
            <div className="px-4 py-2 bg-stone-950/90 border-b border-stone-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[11px] text-stone-400">सक्रिय सेवा:</span>
                <span className="text-[11px] font-bold text-amber-300 bg-stone-900 px-2 py-0.5 rounded-lg border border-amber-500/30 truncate">
                  {tabTitles[currentTab].title}
                </span>
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/25 shrink-0">
                तल स्क्रोल गर्नुहोस् ↓
              </span>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 space-y-3.5 [scrollbar-width:thin]">

              {/* ⚡ द्रुत पहुँच (4 Cards Grid) */}
              <div>
                <p className="text-[10px] font-black text-amber-400/80 uppercase tracking-wider mb-1.5 px-1">
                  ⚡ द्रुत पहुँच (Quick Access)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentTab('home');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                      currentTab === 'home'
                        ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                        : 'bg-stone-900 border-stone-800 text-stone-200 hover:border-amber-500/40'
                    }`}
                  >
                    <Home className="w-4 h-4 shrink-0" />
                    <span className="text-xs truncate">गृहपृष्ठ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentTab('kundali');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                      currentTab === 'kundali'
                        ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                        : 'bg-stone-900 border-stone-800 text-stone-200 hover:border-amber-500/40'
                    }`}
                  >
                    <Compass className="w-4 h-4 shrink-0" />
                    <span className="text-xs truncate">जन्म कुण्डली</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentTab('horoscope');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                      currentTab === 'horoscope'
                        ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                        : 'bg-stone-900 border-stone-800 text-stone-200 hover:border-amber-500/40'
                    }`}
                  >
                    <Star className="w-4 h-4 shrink-0" />
                    <span className="text-xs truncate">दैनिक राशिफल</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentTab('panchanga');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                      currentTab === 'panchanga'
                        ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                        : 'bg-stone-900 border-stone-800 text-stone-200 hover:border-amber-500/40'
                    }`}
                  >
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span className="text-xs truncate">दैनिक पञ्चाङ्ग</span>
                  </button>
                </div>
              </div>

              {/* 🔮 सम्पूर्ण ज्योतिष सेवाहरू (All 9 tabs with detailed cards) */}
              <div>
                <p className="text-[10px] font-black text-amber-400/80 uppercase tracking-wider mb-1.5 px-1">
                  🔮 सम्पूर्ण ज्योतिष सेवाहरू
                </p>
                <div className="bg-stone-900/90 rounded-2xl border border-stone-800 overflow-hidden divide-y divide-stone-800/80">
                  {[
                    { id: 'home', label: 'गृहपृष्ठ ड्यासबोर्ड', sub: 'आजको पञ्चाङ्ग, राशिफल तथा मुख्य सेवाहरू', icon: Home },
                    { id: 'kundali', label: 'जन्म कुण्डली तथा फलादेश', sub: 'लग्न, नवांश, विंशोत्तरी दशा तथा ग्रह स्थिति', icon: Compass },
                    { id: 'horoscope', label: 'दैनिक राशिफल', sub: '१२ राशिको फलादेश तथा शुभ समय', icon: Star },
                    { id: 'panchanga', label: 'दैनिक पञ्चाङ्ग', sub: 'तिथि, वार, नक्षत्र, योग, करण र मुहूर्त', icon: Calendar },
                    { id: 'transit', label: 'ग्रह गोचर चक्र', sub: '९ ग्रहको प्रत्यक्ष खगोलीय राशि भ्रमण', icon: Activity },
                    { id: 'matching', label: 'विवाह मिलान ३६ गुण', sub: 'अष्टकूट मिलान, मङ्गल दोष तथा गुण फल', icon: Heart },
                    { id: 'consultation', label: 'ज्योतिषी परामर्श', sub: 'वरिष्ठ वैदिक ज्योतिषाचार्यसँग अडियो/भिडियो', icon: UserCheck },
                    { id: 'reports', label: 'ज्योतिष प्रतिवेदन PDF', sub: 'आधिकारिक संस्थागत कुण्डली मुद्रण तथा डाउनलोड', icon: FileText },
                    { id: 'profile', label: 'मेरो प्रोफाइल तथा जन्म विवरणहरू', sub: 'खाता, जन्म विवरण व्यवस्थापन र सेटिङ', icon: User },
                  ].map((mItem) => {
                    const MIcon = mItem.icon;
                    const isCur = currentTab === mItem.id;
                    return (
                      <button
                        key={mItem.id}
                        type="button"
                        onClick={() => {
                          setCurrentTab(mItem.id as MobileTab);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full p-3 flex items-center gap-3 text-left transition-colors cursor-pointer ${
                          isCur
                            ? 'bg-amber-500/20 text-amber-200'
                            : 'text-stone-300 hover:bg-stone-800 active:bg-stone-850'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isCur
                              ? 'bg-amber-500 text-stone-950 font-bold'
                              : 'bg-stone-800 text-amber-400'
                          }`}
                        >
                          <MIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold block truncate">{mItem.label}</span>
                          <span className="text-[10px] text-stone-400 block truncate">{mItem.sub}</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isCur ? 'text-amber-400' : 'text-stone-600'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 👤 सक्रिय कुण्डली कार्ड */}
              <div className="p-3 bg-stone-900 rounded-2xl border border-stone-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs font-bold text-stone-100 truncate">{activeProfile.name}</span>
                  </div>
                  <span className="text-[10px] text-stone-400 block truncate">
                    {activeProfile.relationLabelNepali} • {activeProfile.dateOfBirth} ({activeProfile.placeOfBirth.split(',')[0]})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsProfileSheetOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-[11px] font-bold border border-stone-700 shrink-0 cursor-pointer"
                >
                  फेर्नुहोस्
                </button>
              </div>

              {/* 🌐 मुख्य वेबसाइट / डेस्कटप मोडमा जानुहोस् */}
              {onExitToWeb && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onExitToWeb();
                  }}
                  className="w-full p-2.5 bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-bold rounded-xl border border-stone-800 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>मुख्य वेबसाइट / पूर्ण डेस्कटप प्रणालीमा जानुहोस्</span>
                </button>
              )}

              <div className="h-6" />
            </div>
          </div>
        </>
      )}

      {/* ── 2. Mobile Main Scroll Container (Strict Jyotish Content Only) ── */}
      <main className="flex-1 w-full max-w-lg mx-auto p-3.5 sm:p-4 overflow-y-auto">
        {currentTab === 'home' && (
          <MobileHomeView
            user={user}
            activeProfile={activeProfile}
            panchanga={dailyPanchanga}
            horoscope={dailyHoroscope}
            onNavigateTab={(t) => setCurrentTab(t)}
            onOpenProfileSelector={() => setIsProfileSheetOpen(true)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentTab === 'kundali' && (
          <MobileKundaliView
            profile={activeProfile}
            kundaliData={kundaliData}
          />
        )}

        {currentTab === 'horoscope' && (
          <MobileHoroscopeView
            initialRashiId={kundaliData.moonPlanet?.rashiId || 1}
          />
        )}

        {currentTab === 'panchanga' && (
          <MobilePanchangaView
            panchanga={dailyPanchanga}
          />
        )}

        {currentTab === 'transit' && (
          <MobileTransitView
            profile={activeProfile}
          />
        )}

        {currentTab === 'matching' && (
          <MobileMatchingView />
        )}

        {currentTab === 'consultation' && (
          <MobileConsultationView
            user={user}
          />
        )}

        {currentTab === 'reports' && (
          <MobileReportsView
            profile={activeProfile}
            kundaliData={kundaliData}
            panchanga={dailyPanchanga}
          />
        )}

        {currentTab === 'profile' && (
          <MobileProfileView
            user={user}
            activeProfile={activeProfile}
            onRefreshProfiles={refreshUserData}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onExitToWeb={onExitToWeb}
          />
        )}
      </main>

      {/* ── 3. Quick Action Floating Wheel Sheet (Center Action Menu) ── */}
      {isQuickActionWheelOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-amber-500/50 rounded-3xl p-4 w-full max-w-sm space-y-3 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <span className="font-bold text-xs text-amber-300 font-serif flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>त्वरित ज्योतिषीय सेवाहरू</span>
              </span>
              <button
                type="button"
                onClick={() => setIsQuickActionWheelOpen(false)}
                className="p-1 text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setCurrentTab('matching');
                  setIsQuickActionWheelOpen(false);
                }}
                className="p-3 bg-stone-950 rounded-2xl border border-stone-800 text-left hover:border-rose-500/40 transition-colors flex items-center gap-2.5 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-stone-100 block">विवाह मिलान</span>
                  <span className="text-[10px] text-stone-400">३६ गुण गणना</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentTab('transit');
                  setIsQuickActionWheelOpen(false);
                }}
                className="p-3 bg-stone-950 rounded-2xl border border-stone-800 text-left hover:border-blue-500/40 transition-colors flex items-center gap-2.5 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-stone-100 block">ग्रह गोचर चक्र</span>
                  <span className="text-[10px] text-stone-400">वर्तमान ९ ग्रह</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentTab('consultation');
                  setIsQuickActionWheelOpen(false);
                }}
                className="p-3 bg-stone-950 rounded-2xl border border-stone-800 text-left hover:border-amber-500/40 transition-colors flex items-center gap-2.5 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-stone-100 block">ज्योतिषी परामर्श</span>
                  <span className="text-[10px] text-stone-400">अडियो/भिडियो कल</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentTab('reports');
                  setIsQuickActionWheelOpen(false);
                }}
                className="p-3 bg-stone-950 rounded-2xl border border-stone-800 text-left hover:border-orange-500/40 transition-colors flex items-center gap-2.5 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-300 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-stone-100 block">प्रतिवेदन PDF</span>
                  <span className="text-[10px] text-stone-400">मुद्रण तथा डाउनलोड</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Profile Selector Bottom Sheet ── */}
      {isProfileSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-4 w-full max-w-sm space-y-3 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <span className="font-bold text-xs text-stone-200 font-serif flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>सक्रिय जन्म विवरण छान्नुहोस्</span>
              </span>
              <button
                type="button"
                onClick={() => setIsProfileSheetOpen(false)}
                className="p-1 text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {allProfiles.map(p => {
                const isCur = p.id === activeProfile.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setActiveMobileBirthProfile(p.id);
                      refreshUserData();
                      setIsProfileSheetOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      isCur
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                        : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs block">{p.name}</span>
                      <span className="text-[10px] text-stone-400">
                        {p.relationLabelNepali} • {p.dateOfBirth} ({p.placeOfBirth.split(',')[0]})
                      </span>
                    </div>
                    {isCur && (
                      <span className="text-[10px] bg-amber-500 text-stone-950 font-black px-2 py-0.5 rounded-full">
                        सक्रिय
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsProfileSheetOpen(false);
                setCurrentTab('profile');
              }}
              className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>नयाँ जन्म विवरण थप्नुहोस्</span>
            </button>
          </div>
        </div>
      )}

      {/* ── 5. Dedicated Mobile Bottom Navigation Bar (5 Core Touch Tabs) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#160D08]/98 border-t border-amber-500/30 backdrop-blur-lg px-2 py-1.5 shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-around relative">
          {/* Tab 1: Home */}
          <button
            type="button"
            onClick={() => setCurrentTab('home')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors cursor-pointer ${
              currentTab === 'home'
                ? 'text-amber-400 font-black'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">गृहपृष्ठ</span>
          </button>

          {/* Tab 2: Kundali */}
          <button
            type="button"
            onClick={() => setCurrentTab('kundali')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors cursor-pointer ${
              currentTab === 'kundali'
                ? 'text-amber-400 font-black'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Compass className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">कुण्डली</span>
          </button>

          {/* Center Floating Quick Action Button (Chakra / Sparkle) */}
          <div className="relative -top-4">
            <button
              type="button"
              onClick={() => setIsQuickActionWheelOpen(prev => !prev)}
              className="w-13 h-13 rounded-full bg-gradient-to-tr from-amber-500 via-amber-600 to-orange-600 text-stone-950 flex items-center justify-center shadow-xl ring-4 ring-[#160D08] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              title="द्रुत ज्योतिष सेवा"
            >
              <Sparkles className="w-6 h-6 text-stone-950 stroke-[2.5]" />
            </button>
          </div>

          {/* Tab 3: Horoscope */}
          <button
            type="button"
            onClick={() => setCurrentTab('horoscope')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors cursor-pointer ${
              currentTab === 'horoscope'
                ? 'text-amber-400 font-black'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Star className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">राशिफल</span>
          </button>

          {/* Tab 4: Panchanga */}
          <button
            type="button"
            onClick={() => setCurrentTab('panchanga')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors cursor-pointer ${
              currentTab === 'panchanga'
                ? 'text-amber-400 font-black'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Calendar className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">पञ्चाङ्ग</span>
          </button>
        </div>
      </nav>

      {/* ── 6. Mobile Auth Modal ── */}
      <MobileAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(u) => {
          setUser(u);
          setIsAuthModalOpen(false);
        }}
      />
    </div>
  );
};
