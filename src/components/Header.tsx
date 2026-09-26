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
  Crown
} from 'lucide-react';
import { BirthDetails, ApplicationSettings, OrganizationProfile } from '../types/astrology';
import { getStoredRBACUsers, type RBACSession } from '../db/rbacStore';
import { getStoredOfficialMembers } from '../db/officialMemberStore';
import { getSubscriptionBadgeInfo, type SubscriptionBadgeInfo } from '../db/subscriptionStore';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { PWAInstallButton } from './PWAInstallButton';
import { TransitNotificationBell } from './TransitNotificationBell';

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
}) => {
  const orgName = orgProfile?.name || 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा';
  const orgPhone = orgProfile?.phone || '+९७त्-९७६४४००५३३';
  const orgEmail = orgProfile?.email || 'suwashdmk@gmail.com';

  const [pendingCount, setPendingCount] = useState(0);
  const [rbacPendingCount, setRbacPendingCount] = useState(0);
  const [badgeInfo, setBadgeInfo] = useState<SubscriptionBadgeInfo>(() => getSubscriptionBadgeInfo());

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
    <header className="text-[#2D241E] dark:text-stone-100 border-b border-[#E6E0D5]/70 dark:border-stone-800/70 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div 
            onClick={handleLogoClick} 
            className="w-11 h-11 md:w-12 md:h-12 bg-white dark:bg-stone-800 border-2 border-amber-400/60 dark:border-amber-500/60 rounded-full flex items-center justify-center shadow-md overflow-hidden shrink-0 cursor-pointer hover:opacity-95 hover:scale-105 transition-all p-0.5 ring-2 ring-amber-400/20"
            title="बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा"
          >
            <img 
              src={orgProfile?.logoUrl || '/logo.png'} 
              alt={orgName} 
              className="w-full h-full object-cover rounded-full select-none" 
              onError={(e) => {
                e.currentTarget.src = '/logo.png';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg md:text-xl font-bold font-serif tracking-wide text-[#1A1A1A] dark:text-stone-100 flex items-center gap-2 flex-wrap">
                <span>{orgName}</span>
                {badgeInfo.isPurchased && (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider font-sans bg-gradient-to-r from-amber-500/25 to-orange-500/20 text-amber-900 dark:text-amber-200 border-2 border-amber-500/50 shadow-xs backdrop-blur-xs select-none cursor-default"
                    title={badgeInfo.tooltip}
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>{badgeInfo.text}</span>
                  </span>
                )}
              </h1>
            </div>
            <p className="text-xs font-semibold text-[#D97706] dark:text-amber-400 mt-0.5">
              नेपालकै सबैभन्दा भरपर्दो वैदिक सेवा
            </p>
            <div className="flex flex-wrap items-center gap-x-3 text-xs text-[#78716C] dark:text-stone-400 mt-0.5">
              <button
                type="button"
                onClick={onOpenDateConverter}
                className="flex items-center gap-1 hover:text-amber-700 dark:hover:text-amber-300 transition-colors cursor-pointer group"
                title="नेपाली मिति रूपान्तरण औजार खोल्नुहोस्"
              >
                <Calendar className="w-3.5 h-3.5 text-[#D97706] group-hover:scale-110 transition-transform" />
                <span>मिति:</span>
                <strong className="text-[#2D241E] dark:text-stone-200 underline decoration-amber-500/40 underline-offset-2 group-hover:text-[#D97706]">{todayBS}</strong>
                <ArrowRightLeft className="w-3 h-3 text-amber-600 opacity-60 group-hover:opacity-100 ml-0.5" />
              </button>
              <span className="hidden md:inline">•</span>
              <a 
                href={`tel:${orgPhone.replace(/[^0-9+]/g, '')}`} 
                className="hidden md:flex items-center gap-1 text-[#D97706] hover:underline font-bold"
                title="सम्पर्क गर्नुहोस्"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{orgPhone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Profile Selector & Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* RBAC Session Status Button (when logged in) */}
          {rbacSession && (
            <div className="flex items-center gap-2 bg-amber-500/10 dark:bg-amber-950/40 p-1.5 pl-3 rounded-2xl border border-amber-500/30 text-xs">
              <div className="text-left leading-tight">
                <span className="font-bold text-stone-900 dark:text-stone-100 block truncate max-w-[120px]">
                  {rbacSession.fullName}
                </span>
                <span className="text-[10px] font-mono text-[#D97706] font-bold block">
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

          {/* PWA Install Button (Chromium / Android / iOS) */}
          <PWAInstallButton />

          {/* Planetary Transit Push Notification Bell */}
          {onOpenTransitNotifications && (
            <TransitNotificationBell
              alertCount={transitAlertCount}
              hasHighPriority={hasHighPriorityTransitAlert}
              onClick={onOpenTransitNotifications}
            />
          )}

          {/* Superadmin Quick Portal Button */}
          {onNavigateToAdmin && (
            <button
              type="button"
              onClick={() => onNavigateToAdmin('client_approvals')}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-amber-500/15 via-red-500/10 to-amber-500/15 hover:from-amber-500/25 hover:to-red-500/25 text-[#7A1C1C] dark:text-amber-300 font-bold text-xs rounded-xl border border-amber-400/50 dark:border-amber-600/50 shadow-xs cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0"
              title="सुपरएडमिन नियन्त्रण कक्ष तथा खरिद आवेदन स्वीकृति (Superadmin Approval Portal)"
            >
              <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-amber-500/30 shrink-0" />
              <span className="hidden sm:inline">सुपरएडमिन</span>
              <span className="px-1.5 py-0.2 bg-amber-500 text-stone-950 text-[10px] font-black rounded-md">
                स्वीकृति
              </span>
            </button>
          )}

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-xl border border-[#E6E0D5] dark:border-stone-700 text-[#78716C] dark:text-stone-300 hover:text-[#1a1a1a] transition-colors shadow-sm"
            title="सेटिङहरू"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-xl border border-[#E6E0D5] dark:border-stone-700 text-[#78716C] dark:text-stone-300 hover:text-[#1a1a1a] transition-colors shadow-sm"
            title="लाइट/डार्क मोड फेर्नुहोस्"
          >
            {settings.themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-stone-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
});

