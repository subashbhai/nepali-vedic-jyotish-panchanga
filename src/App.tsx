import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense, useTransition } from 'react';
import { Header } from './components/Header';
import { Navigation, NavTab, TabTransition, NORMAL_USER_ALLOWED_TABS, PUBLIC_UNAUTH_NAV_IDS } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
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
import { AppUpdateNotificationModal, AppUpdateFloatingBanner } from './components/common/AppUpdateNotificationModal';
import { ApkDownloadPromptModal } from './components/common/ApkDownloadPromptModal';

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
const VivahMainView = lazy(() => import('./components/vivah/VivahMainView').then((m) => ({ default: m.VivahMainView })));
const SanskarDocsView = lazy(() => import('./components/SanskarDocsView').then((m) => ({ default: m.SanskarDocsView })));
const VastuView = lazy(() => import('./components/VastuView').then((m) => ({ default: m.VastuView })));
const YajamanView = lazy(() => import('./components/YajamanView').then((m) => ({ default: m.YajamanView })));
const ExpertApplicationView = lazy(() => import('./components/ExpertApplicationView').then((m) => ({ default: m.ExpertApplicationView })));
const AarjeView = lazy(() => import('./components/AarjeView').then((m) => ({ default: m.AarjeView })));
const PurchaseSubscriptionView = lazy(() => import('./components/PurchaseSubscriptionView').then((m) => ({ default: m.PurchaseSubscriptionView })));
const VedicPasalMainView = lazy(() => import('./components/vedicPasal/VedicPasalMainView').then((m) => ({ default: m.VedicPasalMainView })));
const MySubscriptionView = lazy(() => import('./components/MySubscriptionView').then((m) => ({ default: m.MySubscriptionView })));
const JyotishiDashboard = lazy(() => import('./components/JyotishiDashboard').then((m) => ({ default: m.JyotishiDashboard })));
const JyotishMainView = lazy(() => import('./components/JyotishMainView').then((m) => ({ default: m.JyotishMainView })));
const PrashnaListView = lazy(() => import('./components/PrashnaListView').then((m) => ({ default: m.PrashnaListView })));
const AnkaJyotishView = lazy(() => import('./components/AnkaJyotishView').then((m) => ({ default: m.AnkaJyotishView })));
const KPJyotishView = lazy(() => import('./components/KPJyotishView').then((m) => ({ default: m.KPJyotishView })));
const NeemaJyotishView = lazy(() => import('./components/NeemaJyotishView').then((m) => ({ default: m.NeemaJyotishView })));
const NepaliCalendarView = lazy(() => import('./components/NepaliCalendarView').then((m) => ({ default: m.NepaliCalendarView })));
const SamacharView = lazy(() => import('./components/SamacharView').then((m) => ({ default: m.SamacharView })));
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
import { AdvertisementBanner } from './components/common/AdvertisementBanner';
import { GlobalSiteNoticeBanner } from './components/common/GlobalSiteNoticeBanner';
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
  savePurohits
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

export default function App() {
  const [profiles, setProfiles] = useState<BirthDetails[]>([]);
  const [activeProfile, setActiveProfile] = useState<BirthDetails | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [panchangaSubTab, setPanchangaSubTab] = useState<PanchangaSubTab>('daily');
  const [activeModule, setActiveModule] = useState<'MAIN' | 'JYOTISH'>('MAIN');
  const [activePatrikaSubTab, setActivePatrikaSubTab] = useState<any>('china');
  const [editingProfile, setEditingProfile] = useState<BirthDetails | null>(null);
  const [settings, setSettingsState] = useState<ApplicationSettings>(getStoredSettings());
  const [isApkPromptModalOpen, setIsApkPromptModalOpen] = useState(false);

  // useTransition: Jyotish module switch लाई non-urgent render बनाउँछ → blinking बन्द हुन्छ
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

  // Sync browser Back/Forward navigation with activeModule
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.hash === '#jyotish') {
        setActiveModule('JYOTISH');
        setActiveTab('jyotishi');
      } else {
        setActiveModule('MAIN');
        if (activeTab === 'jyotishi') {
          setActiveTab('dashboard');
        }
      }
    };

    if (window.location.hash === '#jyotish') {
      setActiveModule('JYOTISH');
      setActiveTab('jyotishi');
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab]);


  // NOTE: Redundant useEffect removed — enterJyotishModule() already sets both
  // activeModule='JYOTISH' and activeTab='jyotishi' together. Re-calling it from
  // a useEffect caused a second render pass which caused visible blinking/flash.

  // Seamlessly consolidate legacy 'patro', 'calendar', and 'date_converter' routes into 'panchanga'
  useEffect(() => {
    if ((activeTab as string) === 'patro' || activeTab === 'calendar') {
      setPanchangaSubTab('patro');
      setActiveTab('panchanga');
    } else if (activeTab === 'date_converter') {
      setPanchangaSubTab('converter');
      setActiveTab('panchanga');
    }
  }, [activeTab]);

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
    rbacSession?.role === 'POS_STAFF';
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
            setActiveTab('kharedi');
          } else if (magicRole === 'MARRIAGE_MODERATOR') {
            setActiveTab('vivah');
          } else if (magicRole === 'NEWS_EDITOR') {
            setActiveTab('samachar');
          }
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }
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

  // Global window.print and beforeprint interception to protect Kundali and Vastu map printing during trial
  useEffect(() => {
    const originalPrint = window.print;
    window.print = () => {
      const docType = (activeTab === 'vastu') ? 'vastu' : (activeTab === 'jyotishi' || activeTab === 'dashboard' || activeTab === 'patrika' || activeTab === 'kundali' || activeTab === 'dasha' || activeTab === 'faladesh') ? 'kundali' : 'general';
      const check = canUserPrintDocuments(docType);
      if (!check.allowed) {
        window.dispatchEvent(new CustomEvent('trial-print-blocked', { detail: { reason: check.reasonNepali, docType } }));
        return;
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

  // For unauthenticated visitors: restrict to public menus (Home, Panchanga, Patro, Samachar)
  // For signed-in users: if not fully unlocked, default to dashboard
  useEffect(() => {
    if (!rbacSession) {
      if (!PUBLIC_UNAUTH_NAV_IDS.has(activeTab)) {
        setActiveTab('dashboard');
      }
    } else if (!isFullyUnlocked) {
      if (!NORMAL_USER_ALLOWED_TABS.has(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  }, [rbacSession, isFullyUnlocked, activeTab]);

  // Function to enter full Jyotish workspace
  const enterJyotishModule = () => {
    if (!isFullyUnlocked) {
      setLockedFeatureName('ज्योतिष');
      setIsClientPurchaseLeadModalOpen(true);
      return;
    }
    // startModuleTransition: React लाई blink नगरी background मा Jyotish render गर्न भन्छ
    startModuleTransition(() => {
      setActiveModule('JYOTISH');
      setActiveTab('jyotishi');
    });
    if (window.location.hash !== '#jyotish') {
      window.history.pushState({ module: 'JYOTISH' }, '', '#jyotish');
    }
  };

  // Function to exit Jyotish workspace back to main
  const exitJyotishModule = () => {
    startModuleTransition(() => {
      setActiveModule('MAIN');
      if (activeTab === 'jyotishi') {
        setActiveTab(isFullyUnlocked ? 'dashboard' : 'yajaman');
      }
    });
    if (window.location.hash === '#jyotish') {
      window.history.pushState({ module: 'MAIN' }, '', window.location.pathname + window.location.search);
    }
  };

  const handleLogoutRBAC = () => {
    clearRBACSession();
    setRbacSession(null);
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
          role: 'SUPER_ADMIN',
          roleNameNepali: 'समाचार सम्पादक (सक्रिय लिङ्क)',
          status: 'active',
          permissions: ['ALL', 'NEWS_EDITOR', 'CREATE_SAMACHAR', 'EDIT_SAMACHAR', 'PUBLISH_SAMACHAR'],
          createdAtISO: editorRecord.issuedAt,
          lastActivityISO: new Date().toISOString(),
        };
        setRbacSession(magicSession);
        setHasFullAccess(true);

        // Also establish active AdminSession so SuperAdminControlCenter opens immediately without login wall
        const adminSessionData: AdminSession = {
          adminId: 'magic-admin-' + Date.now(),
          username: editorRecord.recipientName || 'editor',
          fullName: editorRecord.recipientName || 'समाचार सम्पादक',
          role: 'super_admin',
          roleNameNepali: 'समाचार सम्पादक (सक्रिय लिङ्क)',
          permissions: ['manage_users', 'system_config', 'samachar_editor'],
          loginTimeISO: new Date().toISOString(),
          lastActivityISO: new Date().toISOString(),
        };
        setAdminSession(adminSessionData);

        setAdminInitialTab('samachar_editor');
        setActiveTab('admin_control');
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
        setActiveTab(e.detail);
      }
    };
    window.addEventListener('navigate-tab' as any, handleNavigateTab);
    return () => window.removeEventListener('navigate-tab' as any, handleNavigateTab);
  }, []);

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

  // Default fallback if no profile exists
  const currentProfile: BirthDetails = activeProfile || {
    id: 'default',
    name: 'राम शर्मा',
    gender: 'male',
    dateAD: '1995-05-15',
    dateBS: '२०५२ जेठ ०१',
    time: '08:30',
    location: {
      name: 'काठमाडौँ (Kathmandu)',
      country: 'Nepal',
      latitude: 27.7172,
      longitude: 85.3240,
      timeZone: 5.75,
    },
    category: 'Client',
  };

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
        onNavigateToGochar: () => setActiveTab('gochar'),
      });
    }
  }, [currentProfile?.id, profileTransitAlerts]);

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
        setActiveTab(event.data.tab);
      }
    };
    const handleNavigateTabEvent = (event: any) => {
      if (event.detail) {
        setActiveTab(event.detail);
      }
    };

    window.addEventListener('message', handleSWMessage);
    window.addEventListener('navigate-tab', handleNavigateTabEvent);
    return () => {
      window.removeEventListener('message', handleSWMessage);
      window.removeEventListener('navigate-tab', handleNavigateTabEvent);
    };
  }, []);

  // If JYOTISH module is active, render full-screen workspace with no main dropdowns
  if (activeModule === 'JYOTISH' && rbacSession && isFullyUnlocked) {
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
                setActiveTab(tab);
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
      {activeTab === 'admin_control' ? (
        <Suspense fallback={
          <div className="min-h-screen bg-[#0C0A09] flex flex-col items-center justify-center p-12 space-y-3 text-amber-500">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold">सुपरएडमिन नियन्त्रण कक्ष लोड हुँदैछ...</span>
          </div>
        }>
          <AdminControlPanel
            onClosePanel={() => setActiveTab('dashboard')}
            onNavigateApp={(tab) => setActiveTab(tab as any)}
            initialTab={adminInitialTab as any}
            profiles={profiles}
            todayPanchanga={todayPanchanga}
            orgProfile={orgProfile}
            transitPlanets={todayTransitPlanets}
          />
        </Suspense>
      ) : (
        <div className="flex-1 flex flex-col w-full min-h-0">
          {/* Sticky Unified Header & Navigation Container */}
          <div className="sticky top-0 z-50 bg-white/95 dark:bg-[#262320]/95 backdrop-blur-md border-b border-[#E6E0D5] dark:border-stone-800 shadow-xs transition-colors">
            <Header
              activeProfile={activeProfile}
              profiles={profiles}
              onSelectProfile={handleSelectProfile}
              onNewProfile={handleOpenNewKundaliModal}
              onOpenSettings={() => handleOpenSettings('astro')}
              onNavigateToApplyExpert={() => setActiveTab('apply_expert')}
              onNavigateToAdmin={(tab) => {
                setAdminInitialTab(tab);
                setActiveTab('admin_control');
              }}
              settings={settings}
              onToggleTheme={handleToggleTheme}
              todayBS={todayBS}
              orgProfile={orgProfile}
              onOpenOrgProfile={() => setIsOrgModalOpen(true)}
              onOpenDateConverter={() => setIsDateConverterOpen(true)}
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
          onOpenDateConverter={() => setActiveTab('date_converter')}
          onOpenOrgProfile={() => setActiveTab('org_profile')}
          onOpenThemeModal={() => setIsClientThemeModalOpen(true)}
          onNavigateToAdmin={(tab) => {
            setAdminInitialTab(tab || 'client_approvals');
            setActiveTab('admin_control');
          }}
          profiles={profiles}
          onOpenVastuModal={(subTab) => {
            if (!isFullyUnlocked) {
              setLockedFeatureName('वास्तुशास्त्र');
              setIsClientPurchaseLeadModalOpen(true);
              return;
            }
            if (subTab) {
              setVastuSubTab(subTab as VastuSubTab);
            }
            setIsVastuModalOpen(true);
          }}
          onTabChange={(tab, subTab) => {
            const resolvedTab = (tab as string) === 'patro' ? 'calendar' : tab;
            const isPublicTab = ['dashboard', 'panchanga', 'sewa', 'vivah', 'calendar', 'samachar', 'date_converter', 'org_profile'].includes(resolvedTab);

            if (!rbacSession && !isPublicTab) {
              setIsRBACAuthModalOpen(true);
              return;
            }

            if (rbacSession && !isFullyUnlocked && !NORMAL_USER_ALLOWED_TABS.has(resolvedTab)) {
              setLockedFeatureName(
                resolvedTab === 'jyotishi' || resolvedTab === 'aarje' ? 'ज्योतिष कार्यक्षेत्र' :
                resolvedTab === 'vastu' ? 'वास्तुशास्त्र' :
                resolvedTab === 'rashifal' ? 'दैनिक राशिफल' :
                resolvedTab === 'dashboard' ? 'गृहपृष्ठ' : 'यो सेवा'
              );
              setIsClientPurchaseLeadModalOpen(true);
              return;
            }

            if (resolvedTab === 'jyotishi' || resolvedTab === 'aarje') {
              enterJyotishModule();
            } else if (resolvedTab === 'settings') {
              setIsSettingsModalOpen(true);
            } else if (resolvedTab === 'calendar' || (resolvedTab as string) === 'patro') {
              setPanchangaSubTab('patro');
              setActiveTab('panchanga');
            } else if (resolvedTab === 'date_converter') {
              setPanchangaSubTab('converter');
              setActiveTab('panchanga');
            } else if (resolvedTab === 'rashifal') {
              setPanchangaSubTab('rashifal');
              setActiveTab('panchanga');
            } else {
              setActiveTab(resolvedTab);
              if (resolvedTab === 'panchanga' && subTab) {
                setPanchangaSubTab(subTab as PanchangaSubTab);
              } else if (resolvedTab === 'vastu' && subTab) {
                setVastuSubTab(subTab as VastuSubTab);
              } else if (subTab) {
                setActivePatrikaSubTab(subTab as PatrikaSubCategory);
              }
            }
          }} 
        />
      </div>

      {/* Global Site-wide Announcement Banner (Managed by Super Admin) */}
      <GlobalSiteNoticeBanner onNavigateTab={(tab) => setActiveTab(tab as any)} />

      {/* Main Container */}
      <main className="max-w-[1700px] mx-auto px-3 sm:px-5 lg:px-6 py-4 sm:py-6 flex-1 w-full flex flex-col min-h-0">
          {currentPageControl?.status === 'maintenance' && !rbacSession ? (
            <PageMaintenanceView
              pageTitle={currentPageControl.titleNepali}
              maintenanceMessage={currentPageControl.maintenanceMessage}
              onGoHome={() => setActiveTab('dashboard')}
            />
          ) : !rbacSession && !['dashboard', 'panchanga', 'sewa', 'vivah', 'calendar', 'samachar', 'date_converter', 'org_profile'].includes(activeTab) ? (
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
                  setActiveTab('yajaman');
                }
              }}
            />
          ) : (
            <>
              {/* Advertisement Banner — website मा मात्र, Jyotish र Vastu बाहेक सबै pages मा */}
              {!['jyotishi', 'kundali', 'faladesh', 'dasha', 'gochar', 'muhurta',
                  'prashna', 'ankajyotish', 'kpjyotish', 'neemajyotish',
                  'vastu', 'vastu_compass', 'vastu_mandala', 'vastu_audit'].includes(activeTab) && (
                <AdvertisementBanner
                  contactPhone="९७६४४००५३३"
                  contactEmail={orgProfile?.email || 'suwashdmk@gmail.com'}
                />
              )}

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
              onNavigate={(tab) => {
                const resolved = (tab as string) === 'patro' ? 'calendar' : tab;
                const isPublic = ['dashboard', 'panchanga', 'sewa', 'vivah', 'calendar', 'samachar', 'date_converter', 'org_profile'].includes(resolved);
                if (!rbacSession && !isPublic) {
                  setIsRBACAuthModalOpen(true);
                  return;
                }
                if (rbacSession && !isFullyUnlocked && !NORMAL_USER_ALLOWED_TABS.has(resolved as any)) {
                  setLockedFeatureName(
                    resolved === 'jyotishi' || resolved === 'aarje' ? 'ज्योतिष कार्यक्षेत्र' :
                    resolved === 'vastu' ? 'वास्तुशास्त्र' :
                    resolved === 'rashifal' ? 'दैनिक राशिफल' : 'यो सेवा'
                  );
                  setIsClientPurchaseLeadModalOpen(true);
                  return;
                }
                if (resolved === 'calendar') {
                  setPanchangaSubTab('patro');
                  setActiveTab('panchanga');
                } else if (resolved === 'date_converter') {
                  setPanchangaSubTab('converter');
                  setActiveTab('panchanga');
                } else if (resolved === 'rashifal') {
                  setPanchangaSubTab('rashifal');
                  setActiveTab('panchanga');
                } else if (resolved === 'jyotishi' || resolved === 'aarje') {
                  enterJyotishModule();
                } else {
                  setActiveTab(resolved as any);
                }
              }}
              onOpenOrgProfile={() => setActiveTab('org_profile')}
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
                onNavigateToTab={(tab) => setActiveTab(tab as any)}
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
              onNavigateToAIAssistant={() => setActiveTab('ai_assistant')}
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
              onNavigateToPanchanga={() => setActiveTab('panchanga')}
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
              onNavigateTab={(tab) => {
                if (tab === 'panchanga') {
                  setActiveTab('panchanga');
                } else if (tab === 'vastu') {
                  setActiveTab('vastu');
                } else if (tab === 'jyotishi') {
                  enterJyotishModule();
                } else {
                  setActiveTab(tab);
                }
              }}
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
            <SamacharView
              todayTransitPlanets={todayTransitPlanets}
              todayPanchanga={todayPanchanga}
              todayAD={todayAD}
              todayBS={todayBS}
              onOpenAdminEditor={() => {
                if (!rbacSession) {
                  setIsRBACAuthModalOpen(true);
                  return;
                }
                setAdminInitialTab('samachar_editor');
                setActiveTab('admin_control');
              }}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
            />
          )}

          {activeTab === 'date_converter' && (
            <DateConverterView
              onNavigateTab={(tab) => setActiveTab(tab as any)}
            />
          )}

          {activeTab === 'org_profile' && (
            <OrgProfileView
              orgProfile={orgProfile}
              onSaveOrgProfile={handleSaveOrgProfile}
              isSuperAdmin={rbacSession?.role === 'SUPER_ADMIN'}
              isLoggedIn={!!rbacSession}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
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
            <YajamanView onNavigateToExpert={() => setActiveTab('apply_expert')} />
          )}

          {activeTab === 'kharedi' && (
            <VedicPasalMainView onNavigateHome={() => setActiveTab('dashboard')} />
          )}

          {activeTab === 'my_subscription' && (
            <MySubscriptionView
              onNavigateToPurchase={() => setActiveTab('kharedi')}
              orgProfile={orgProfile}
            />
          )}

          {activeTab === 'apply_expert' && (
            <ExpertApplicationView onNavigateToDashboard={() => setActiveTab('dashboard')} />
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
              onNavigate={(tab) => setActiveTab(tab)}
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

                  </PatrikaErrorBoundary>
                </TabTransition>
        </Suspense>
        </>
      )}
      </main>
        </div>
      )}

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
              setActiveTab(tab);
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
              setActiveTab('admin_control');
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
              setActiveTab('panchanga');
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
          onNavigateToGochar={() => setActiveTab('gochar')}
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
            setActiveTab('admin_control');
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

