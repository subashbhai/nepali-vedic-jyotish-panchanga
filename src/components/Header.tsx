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
  Crown,
  Zap,
  Camera
} from 'lucide-react';
import { BirthDetails, ApplicationSettings, OrganizationProfile } from '../types/astrology';
import { getStoredRBACUsers, type RBACSession } from '../db/rbacStore';
import { getStoredOfficialMembers } from '../db/officialMemberStore';
import { getSubscriptionBadgeInfo, type SubscriptionBadgeInfo } from '../db/subscriptionStore';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { getAssetUrl, handleImageFallback, BALANANDA_DEFAULT_EMBLEM_SVG } from '../utils/assetHelper';
import { PWAInstallButton } from './PWAInstallButton';
import { TransitNotificationBell } from './TransitNotificationBell';
import { LogoUploadModal } from './common/LogoUploadModal';
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
  const [badgeInfo, setBadgeInfo] = useState<SubscriptionBadgeInfo>(() => getSubscriptionBadgeInfo());
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(() => getStoredCustomLogo());
  const [, setCurrentTheme] = useState(() => getStoredClientTheme());

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

  useEffect(() => {
    const updateBadge = () => {
      setBadgeInfo(getSubscriptionBadgeInfo());
    };

    window.addEventListener('software-full-access-updated', updateBadge);
    window.addEventListener('software-trial-updated', updateBadge);
    window.addEventListener('trial-status-updated', updateBadge);
    window.addEventListener('storage', updateBadge);

    return () => {
      window.removeEventListener('software-full-access-updated', updateBadge);
      window.removeEventListener('software-trial-updated', updateBadge);
      window.removeEventListener('trial-status-updated', updateBadge);
      window.removeEventListener('storage', updateBadge);
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
                {badgeInfo.isPurchased && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider font-sans bg-[var(--header-badge-bg,rgba(217,119,6,0.2))] text-[var(--header-badge-text,#FFFBEB)] border-2 border-[var(--header-badge-border,rgba(245,158,11,0.5))] shadow-xs backdrop-blur-xs select-none cursor-default"
                    title={badgeInfo.tooltip}
                  >
                    <Crown className="w-3.5 h-3.5 text-[var(--header-accent,#F59E0B)]" />
                    <span>{badgeInfo.text}</span>
                  </span>
                )}
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
          {/* RBAC Session Status Button (when logged in) */}
          {rbacSession && (
            <div className="flex items-center gap-2 bg-[var(--header-btn-bg,rgba(255,255,255,0.9))] p-1.5 pl-3 rounded-2xl border border-[var(--header-btn-border,#E6E0D5)] text-xs shadow-xs backdrop-blur-md">
              <div className="text-left leading-tight">
                <span className="font-bold text-[var(--header-title,#1A1A1A)] block truncate max-w-[120px]">
                  {rbacSession.fullName}
                </span>
                <span className="text-[10px] font-mono text-[var(--header-subtitle,#D97706)] font-bold block">
                  {rbacSession.roleNameNepali}
                </span>
              </div>
              {onLogoutRBAC && rbacSession.role !== 'CUSTOMER' && (
                <button
                  onClick={onLogoutRBAC}
                  className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  title="लगआउट गर्नुहोस्"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
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
    </header>
  );
});

