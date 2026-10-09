import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { 
  Compass, 
  Sparkles, 
  UserPlus, 
  Settings, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Calendar,
  Building2,
  LogIn,
  LogOut,
  User,
  ShieldAlert,
  ArrowRightLeft,
  Zap,
  Camera,
  LayoutDashboard,
  ChevronDown,
  ShoppingBag,
  Crown,
  Newspaper,
  KeyRound,
  Sliders
} from 'lucide-react';
import { BirthDetails, ApplicationSettings, OrganizationProfile } from '../types/astrology';
import { getStoredRBACUsers, type RBACSession, getUserDashboardTarget } from '../db/rbacStore';
import { getStoredOfficialMembers } from '../db/officialMemberStore';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { getAssetUrl, handleImageFallback, BALANANDA_DEFAULT_EMBLEM_SVG } from '../utils/assetHelper';
import { PWAInstallButton } from './PWAInstallButton';
import { TransitNotificationBell } from './TransitNotificationBell';
import { LogoUploadModal } from './common/LogoUploadModal';
import { ChangePasswordModal } from './auth/ChangePasswordModal';
import { getStoredCustomLogo, APP_LOGO_CHANGED_EVENT } from '../utils/logoManager';
import { getStoredClientTheme } from '../utils/themeStore';

interface HeaderProps {
  activeProfile?: BirthDetails | null;
  profiles?: BirthDetails[];
  onSelectProfile?: (profile: BirthDetails) => void;
  onNewProfile?: () => void;
  onOpenSettings: () => void;
  onOpenOrgProfile?: () => void;
  onOpenDateConverter?: () => void;
  onNavigateToApplyExpert?: () => void;
  onNavigateToAdmin?: (tab?: string) => void;
  onNavigateTab?: (tab: string) => void;
  orgProfile?: OrganizationProfile;
  settings: ApplicationSettings;
  onToggleTheme: () => void;
  todayBS: string;
  rbacSession?: RBACSession | null;
  onOpenAuthModal?: () => void;
  onLogoutRBAC?: () => void;
  transitAlertCount?: number;
  hasHighPriorityTransitAlert?: boolean;
  onOpenTransitNotifications?: () => void;
  onOpenPurchaseModal?: (featureName?: string) => void;
  hasUpdate?: boolean;
  updateVersion?: string;
  onOpenAppUpdates?: () => void;
}

export const Header: React.FC<HeaderProps> = memo(({
  activeProfile,
  profiles,
  onSelectProfile,
  onNewProfile,
  onOpenSettings,
  onOpenOrgProfile,
  onOpenDateConverter,
  onNavigateToApplyExpert,
  onNavigateToAdmin,
  onNavigateTab,
  orgProfile,
  settings,
  onToggleTheme,
  todayBS,
  rbacSession,
  onOpenAuthModal,
  onLogoutRBAC,
  transitAlertCount = 0,
  hasHighPriorityTransitAlert = false,
  onOpenTransitNotifications,
  onOpenPurchaseModal,
  hasUpdate = false,
  updateVersion,
  onOpenAppUpdates,
}) => {
  const orgName = orgProfile?.name || 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा';
  const orgPhone = orgProfile?.phone || '+९७त्-९७६४४००५३३';
  const orgEmail = orgProfile?.email || 'suwashdmk@gmail.com';

  const [pendingCount, setPendingCount] = useState(0);
  const [rbacPendingCount, setRbacPendingCount] = useState(0);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(() => getStoredCustomLogo());
  const [, setCurrentTheme] = useState(() => getStoredClientTheme());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleLogoChange = (e: any) => {
      setCustomLogoUrl(e.detail?.logoUrl ?? getStoredCustomLogo());
    };
    const handleThemeChange = () => {
      setCurrentTheme(getStoredClientTheme());
    };
    window.addEventListener(APP_LOGO_CHANGED_EVENT as any, handleLogoChange);
    window.addEventListener('storage', handleLogoChange);
    window.addEventListener('client-theme-changed', handleThemeChange);
    return () => {
      window.removeEventListener(APP_LOGO_CHANGED_EVENT as any, handleLogoChange);
      window.removeEventListener('storage', handleLogoChange);
      window.removeEventListener('client-theme-changed', handleThemeChange);
    };
  }, []);

  const refreshPendingCounts = useCallback(() => {
    try {
      const rbacPending = getStoredRBACUsers().filter(u => u.status === 'pending').length;
      const memberPending = getStoredOfficialMembers().filter(m => m.status === 'pending').length;
      setRbacPendingCount(rbacPending);
      setPendingCount(rbacPending + memberPending);
    } catch (e) {
      setPendingCount(0);
      setRbacPendingCount(0);
    }
  }, []);

  const logoClickCountRef = useRef(0);
  const logoClickTimerRef = useRef<any>(null);

  const handleLogoClick = () => {
    logoClickCountRef.current += 1;
    if (logoClickCountRef.current === 3) {
      logoClickCountRef.current = 0;
      if (logoClickTimerRef.current) clearTimeout(logoClickTimerRef.current);
      if (onNavigateToAdmin) {
        onNavigateToAdmin();
      }
      return;
    }

    if (logoClickTimerRef.current) clearTimeout(logoClickTimerRef.current);
    logoClickTimerRef.current = setTimeout(() => {
      if (logoClickCountRef.current === 1 && onOpenOrgProfile) {
        onOpenOrgProfile();
      }
      logoClickCountRef.current = 0;
    }, 400);
  };

  return (
    <header className="text-[var(--header-meta,#2D241E)] dark:text-[var(--header-meta,#F5F5F4)] border-b border-[#E6E0D5]/70 dark:border-stone-800/70 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="relative group shrink-0">
            <div 
              onClick={handleLogoClick} 
              className="w-11 h-11 md:w-12 md:h-12 bg-white dark:bg-stone-800 border-2 border-[var(--header-logo-border,#F59E0B)] rounded-full flex items-center justify-center shadow-md overflow-hidden shrink-0 cursor-pointer hover:opacity-95 hover:scale-105 transition-all p-0.5 ring-2 ring-[var(--header-logo-ring,rgba(245,158,11,0.25))]"
              title="बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा (क्लिक गर्नुहोस्)"
            >
              <img 
                src={customLogoUrl || getAssetUrl(orgProfile?.logoUrl || '/logo.png')} 
                alt={orgName} 
                className="w-full h-full object-cover rounded-full select-none" 
                onError={(e) => {
                  handleImageFallback(e);
                }}
              />
            </div>
            {/* Quick Camera Badge for 1-Click Logo Upload */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLogoModalOpen(true);
              }}
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--header-accent,#F59E0B)] hover:brightness-110 text-stone-950 flex items-center justify-center shadow-md border-2 border-white dark:border-stone-900 cursor-pointer hover:scale-115 transition-transform"
              title="आफ्नो लोगो अपलोड वा परिवर्तन गर्नुहोस् (Upload Custom Logo)"
            >
              <Camera className="w-2.5 h-2.5" />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg md:text-xl font-bold font-serif tracking-wide text-[var(--header-title,#1A1A1A)] flex items-center gap-2 flex-wrap transition-colors drop-shadow-xs">
                <span>{orgName}</span>
              </h1>
            </div>
            <p className="text-xs font-bold text-[var(--header-subtitle,#D97706)] mt-0.5 tracking-wide transition-colors">
              नेपालकै सबैभन्दा भरपर्दो वैदिक सेवा
            </p>
            <div className="flex flex-wrap items-center gap-x-3 text-xs text-[var(--header-meta,#78716C)] mt-0.5 transition-colors">
              <button
                type="button"
                onClick={onOpenDateConverter}
                className="flex items-center gap-1 hover:brightness-125 transition-all cursor-pointer group"
                title="नेपाली मिति रूपान्तरण औजार खोल्नुहोस्"
              >
                <Calendar className="w-3.5 h-3.5 text-[var(--header-accent,#D97706)] group-hover:scale-110 transition-transform" />
                <span>मिति:</span>
                <strong className="text-[var(--header-highlight,#2D241E)] underline decoration-current/40 underline-offset-2">{todayBS}</strong>
                <ArrowRightLeft className="w-3 h-3 text-[var(--header-accent,#D97706)] opacity-70 group-hover:opacity-100 ml-0.5" />
              </button>
              <span className="hidden md:inline opacity-60">•</span>
              <a 
                href={`tel:${orgPhone.replace(/[^0-9+]/g, '')}`} 
                className="hidden md:flex items-center gap-1 text-[var(--header-subtitle,#D97706)] hover:underline font-bold"
                title="सम्पर्क गर्नुहोस्"
              >
                <Phone className="w-3.5 h-3.5 text-[var(--header-accent,#D97706)]" />
                <span>{orgPhone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Profile Selector & Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* RBAC Session Status Button & Dropdown (when logged in) */}
          {rbacSession && (
            <div className="relative z-50" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 bg-[var(--header-btn-bg,rgba(255,255,255,0.9))] hover:bg-amber-100/90 dark:hover:bg-stone-800 p-1.5 pl-3 rounded-2xl border border-[var(--header-btn-border,#E6E0D5)] hover:border-amber-400 text-xs shadow-xs backdrop-blur-md cursor-pointer transition-all group select-none"
                title="मेरो खाता तथा ड्यासबोर्ड (My Dashboard) खोल्न क्लिक गर्नुहोस्"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                <div className="text-left leading-tight">
                  <span className="font-bold text-[var(--header-title,#1A1A1A)] block truncate max-w-[120px]">
                    {rbacSession.fullName}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--header-subtitle,#D97706)] font-bold block">
                    {rbacSession.roleNameNepali}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180 text-amber-600' : 'group-hover:translate-y-0.5'}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border-2 border-amber-300 dark:border-stone-700 p-2.5 z-[100] animate-in fade-in slide-in-from-top-2">
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

                        {rbacSession.role === 'SUPER_ADMIN' && onNavigateTab && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              onNavigateTab('user_control');
                            }}
                            className="w-full text-left p-1.5 px-2 rounded-lg text-[11px] font-bold text-blue-800 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-stone-800 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Sliders className="w-3.5 h-3.5 text-blue-600" />
                            <span>🎛️ प्रयोगकर्ता नियन्त्रण (User Control)</span>
                          </button>
                        )}

                        {rbacSession.role === 'SUPER_ADMIN' && onNavigateToAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              onNavigateToAdmin('user_control');
                            }}
                            className="w-full text-left p-1.5 px-2 rounded-lg text-[11px] font-bold text-[#7A1C1C] dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-stone-800 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Crown className="w-3.5 h-3.5 text-amber-600" />
                            <span>👑 सुपरएडमिन नियन्त्रण कक्ष</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Change Password Action */}
                    <div className="pt-1.5 border-t border-stone-100 dark:border-stone-800">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsChangePasswordOpen(true);
                        }}
                        className="w-full text-left p-1.5 px-2 rounded-lg text-[11px] font-medium text-amber-900 dark:text-amber-300 hover:bg-amber-100/60 dark:hover:bg-stone-800 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>🔐 पासवर्ड परिवर्तन (Change Password)</span>
                      </button>
                    </div>

                    {/* Settings Action */}
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
          )}

          {/* Live App Update Notification Button */}
          {hasUpdate && onOpenAppUpdates && (
            <button
              type="button"
              onClick={onOpenAppUpdates}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 animate-pulse shrink-0 border border-amber-300"
              title="नयाँ अपडेट उपलब्ध छ, हेर्न क्लिक गर्नुहोस्"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-amber-950" />
              <span className="hidden sm:inline">नयाँ अपडेट</span>
              <span className="bg-stone-950 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                {updateVersion ? `v${updateVersion.replace(/^v/i, '')}` : 'उपलब्ध'}
              </span>
            </button>
          )}

          {/* PWA Install Button (Chromium / Android / iOS) */}
          <PWAInstallButton />

          {/* Planetary Transit & Software Update Notification Bell */}
          {onOpenTransitNotifications && (
            <TransitNotificationBell
              alertCount={transitAlertCount}
              hasHighPriority={hasHighPriorityTransitAlert}
              hasUpdate={hasUpdate}
              updateVersion={updateVersion}
              onClick={onOpenTransitNotifications}
              onOpenAppUpdates={onOpenAppUpdates}
            />
          )}



          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 bg-[var(--header-btn-bg,rgba(255,255,255,0.9))] hover:bg-[var(--header-btn-hover,#F5F5F4)] rounded-xl border border-[var(--header-btn-border,#E6E0D5)] text-[var(--header-btn-text,#78716C)] hover:text-[var(--header-title,#1A1A1A)] transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
            title="सेटिङहरू"
          >
            <Settings className="w-4 h-4 text-current" />
          </button>

          {/* Theme Toggle Button (Light/Dark Mode) */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 bg-[var(--header-btn-bg,rgba(255,255,255,0.9))] hover:bg-[var(--header-btn-hover,#F5F5F4)] rounded-xl border border-[var(--header-btn-border,#E6E0D5)] text-[var(--header-btn-text,#78716C)] hover:text-[var(--header-title,#1A1A1A)] transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md group"
            title={settings.themeMode === 'dark' ? 'लाइट मोडमा जानुहोस् (Switch to Light Mode)' : 'डार्क मोडमा जानुहोस् (Switch to Dark Mode)'}
            aria-label="Toggle Light and Dark Mode"
          >
            {settings.themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300 animate-pulse group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-current group-hover:-rotate-12 transition-transform" />
            )}
          </button>
        </div>
      </div>

      {/* Custom Logo Upload Modal */}
      <LogoUploadModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        onLogoUpdated={(newUrl) => setCustomLogoUrl(newUrl)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        defaultMobile={rbacSession?.phone || ''}
      />
    </header>
  );
});

