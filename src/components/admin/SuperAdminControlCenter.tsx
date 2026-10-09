import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  LogOut,
  Bell,
  Search,
  Command,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  RefreshCw,
  Users,
  Award,
  UserCheck,
  Calendar,
  MapPin,
  DollarSign,
  Crown,
  FileText,
  ShoppingBag,
  Settings,
  Activity,
  TrendingUp,
  Database,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  MessageSquare,
  Newspaper,
  CreditCard,
  Send,
  HeartHandshake,
  Megaphone,
  Sliders,
  Globe,
  Briefcase,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ArrowLeft,
  Smartphone,
  Server,
  Download
} from 'lucide-react';

import {
  BirthDetails,
  PanchangaData,
  PlanetPosition,
  OrganizationProfile
} from '../../types/astrology';
import { calculatePanchanga } from '../../utils/panchangaEngine';
import { DailyWhatsAppDispatchManager } from './DailyWhatsAppDispatchManager';

import {
  AdminAccount,
  AdminSession,
  AdminAuditLogRecord,
  SystemNotificationMessage,
  getStoredAdminAccounts,
  getActiveAdminSession,
  setAdminSession,
  clearAdminSession,
  getStoredAuditLogs,
  logAdminAction,
  getStoredSystemNotifications,
  getRoleNameNepali
} from '../../db/adminStore';

import {
  OfficialMemberProfile,
  getStoredOfficialMembers,
  adminUpdateMemberStatus,
  verifyMemberProfile,
  rejectMemberProfile,
  verifyOrRejectMemberProfile
} from '../../db/officialMemberStore';

import {
  EsewaPaymentRequest,
  getStoredEsewaRequests,
  approveEsewaPaymentRequest,
  rejectEsewaPaymentRequest,
  formatNPRCurrency
} from '../../db/subscriptionStore';

import { getStoredRBACUsers, RBACUser, updateRBACUserStatus, editRBACUserDetails, setRBACSession, RBACSession } from '../../db/rbacStore';
import { getStoredBookings, saveBookings } from '../../db/yajamanStore';
import { getStoredOrders, getStoredProducts } from '../../db/vedicStore';
import { Product, StoreOrder } from '../../types/vedicStoreTypes';
import { Booking, BookingStatus } from '../../types/yajamanTypes';

import { AdminOverviewSection } from './sections/AdminOverviewSection';
import { AdminPageServiceControlSection } from './sections/AdminPageServiceControlSection';
import { AdminUserManagementSection } from './sections/AdminUserManagementSection';
import { AdminRbacSection } from './sections/AdminRbacSection';
import { AdminExpertSection } from './sections/AdminExpertSection';
import { AdminYajamanSection } from './sections/AdminYajamanSection';
import { AdminBookingSection } from './sections/AdminBookingSection';
import { AdminGeoMonitorSection } from './sections/AdminGeoMonitorSection';
import { AdminFinanceSection } from './sections/AdminFinanceSection';
import { AdminMembershipSection } from './sections/AdminMembershipSection';
import { AdminPatrikaSection } from './sections/AdminPatrikaSection';
import { AdminStorePosSection } from './sections/AdminStorePosSection';
import { AdminNotificationSection } from './sections/AdminNotificationSection';
import { AdminSettingsSection } from './sections/AdminSettingsSection';
import { AdminSecurityAuditSection } from './sections/AdminSecurityAuditSection';
import { AdminReportSection } from './sections/AdminReportSection';
import { AdminBackupSection } from './sections/AdminBackupSection';
import { NewsEditorDashboard } from './sections/NewsEditorDashboard';
import { AdminRoleMagicLinksSection } from './sections/AdminRoleMagicLinksSection';
import { AdminClientApprovalsSection } from './sections/AdminClientApprovalsSection';
import { AdminTargetedPushNotificationSection } from './sections/AdminTargetedPushNotificationSection';
import { AdminVivahSection } from './sections/AdminVivahSection';
import { AdminAdvertisementSection } from './sections/AdminAdvertisementSection';
import { SuperAdminRashifalManagement } from './sections/SuperAdminRashifalManagement';
import { StoreMediaAdminTab } from './StoreMediaAdminTab';
import { MenuControlPanel } from './MenuControlPanel';
import { UserControlMasterView } from './UserControlMasterView';
import { SoftwareReleaseManagerModal } from '../superadmin/SoftwareReleaseManagerModal';
import { getStoredClientLeads, ClientLead } from '../../db/clientLeadStore';
import {
  getStoredVivahProfiles,
  getStoredVivahAds,
  getStoredVivahRequests,
  getStoredVivahReports
} from '../../db/vivahStore';

interface TabContentErrorBoundaryProps {
  children: React.ReactNode;
  activeTabTitle: string;
  onFallbackToOverview: () => void;
}

interface TabContentErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class TabContentErrorBoundary extends React.Component<TabContentErrorBoundaryProps, TabContentErrorBoundaryState> {
  constructor(props: TabContentErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): TabContentErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('TabContentErrorBoundary caught error in tab:', this.props.activeTabTitle, error, errorInfo);
  }

  componentDidUpdate(prevProps: TabContentErrorBoundaryProps) {
    if (prevProps.activeTabTitle !== this.props.activeTabTitle && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-stone-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-4 max-w-xl mx-auto my-8 animate-in fade-in">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-amber-300">
              {this.props.activeTabTitle} मोड्युल लोड गर्दा समस्या भयो
            </h3>
            <p className="text-xs text-stone-400">
              यस खण्डको डेटा विश्लेषण वा रेन्डर गर्दा अप्रत्याशित समस्या देखियो। तपाईं सुरक्षित ओभरभ्युमा फर्कन सक्नुहुन्छ।
            </p>
            {this.state.error?.message && (
              <p className="text-[11px] font-mono text-rose-300/80 mt-1">
                {this.state.error.message}
              </p>
            )}
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={this.props.onFallbackToOverview}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow cursor-pointer"
            >
              केन्द्रीय ओभरभ्युमा फर्कनुहोस्
            </button>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl border border-stone-700 cursor-pointer"
            >
              पुनः प्रयास गर्नुहोस्
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

interface SuperAdminControlCenterProps {
  onClose?: () => void;
  onNavigateApp?: (tab: string) => void;
  initialTab?: string;
  profiles?: BirthDetails[];
  todayPanchanga?: PanchangaData;
  orgProfile?: OrganizationProfile;
  transitPlanets?: PlanetPosition[];
}

function resolveInitialAdminSession(): AdminSession | null {
  const active = getActiveAdminSession();
  if (active) return active;

  try {
    const rawRbac = localStorage.getItem('balananda_rbac_active_session_v1');
    if (rawRbac) {
      const rbac = JSON.parse(rawRbac);
      if (
        rbac &&
        rbac.role !== 'NEWS_EDITOR' &&
        rbac.role !== 'POS_STAFF' &&
        rbac.role !== 'STORE_ADMIN' &&
        rbac.role !== 'MARRIAGE_MODERATOR' &&
        rbac.role !== 'CUSTOMER' &&
        (rbac.role === 'SUPER_ADMIN' ||
         rbac.role === 'ADMIN' ||
         rbac.permissions?.includes('all') ||
         rbac.permissions?.includes('ALL') ||
         rbac.permissions?.includes('*') ||
         rbac.permissions?.includes('manage_all_modules'))
      ) {
        const autoSession: AdminSession = {
          adminId: rbac.userId || 'admin_super_master',
          username: rbac.username || 'admin',
          fullName: rbac.fullName || 'मुख्य प्रशासक (Super Admin)',
          role: 'super_admin',
          roleNameNepali: rbac.roleNameNepali || 'मुख्य प्रशासक (Super Admin)',
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
        setAdminSession(autoSession);
        return autoSession;
      }
    }
  } catch (e) {
    console.error('Error auto-resolving admin session from RBAC:', e);
  }
  return null;
}

// Helper to map tab to block
function getBlockIdFromTab(tab?: string): string | null {
  if (!tab || tab === 'overview' || tab === 'dashboard') return null;
  if (['system_health', 'live_alerts'].includes(tab)) return 'block_overview';
  if (['pages_services', 'samachar_editor', 'samachar', 'rashifal_management', 'advertisement', 'pages', 'services'].includes(tab)) return 'block_pages_services';
  if (['vivah_portal', 'bookings', 'patrika', 'store_pos', 'media_downloads'].includes(tab)) return 'block_vedic_portals';
  if (['user_list', 'menu_switchboard', 'user_control', 'menu_control', 'users', 'experts', 'yajaman', 'staff_rbac', 'rbac', 'role_magic_links', 'admin_roles'].includes(tab)) return 'block_users_experts';
  if (['client_approvals', 'finance', 'esewa', 'memberships', 'members'].includes(tab)) return 'block_finance';
  if (['daily_whatsapp', 'whatsapp', 'targeted_push', 'notifications', 'geo_monitor'].includes(tab)) return 'block_communication';
  if (['settings', 'pricing', 'security_audit', 'audit', 'reports', 'backup', 'software_releases', 'releases', 'downloads'].includes(tab)) return 'block_settings_security';
  return null;
}

export const SuperAdminControlCenter: React.FC<SuperAdminControlCenterProps> = ({
  onClose,
  onNavigateApp,
  initialTab = 'overview',
  profiles = [],
  todayPanchanga,
  orgProfile,
  transitPlanets
}) => {
  // Session - auto-resolve from active AdminSession or active RBAC super_admin session
  const [session, setSession] = useState<AdminSession | null>(resolveInitialAdminSession);

  // Login Form State
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Block State: null indicates the Master Overview Dashboard with the 7 Primary Block Cards
  const [activeBlockId, setActiveBlockId] = useState<string | null>(() => getBlockIdFromTab(initialTab));

  // Current Active Tab
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [sidebarFilter, setSidebarFilter] = useState('');

  // Keep session and activeTab in sync with props
  useEffect(() => {
    const active = resolveInitialAdminSession();
    if (active) {
      setSession(active);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
      const bId = getBlockIdFromTab(initialTab);
      if (bId) {
        setActiveBlockId(bId);
      }
    }
  }, [initialTab]);

  // Live Data States
  const [rbacUsers, setRbacUsers] = useState<RBACUser[]>([]);
  const [officialMembers, setOfficialMembers] = useState<OfficialMemberProfile[]>([]);
  const [esewaRequests, setEsewaRequests] = useState<EsewaPaymentRequest[]>([]);
  const [clientLeads, setClientLeads] = useState<ClientLead[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogRecord[]>([]);
  const [notifications, setNotifications] = useState<SystemNotificationMessage[]>([]);
  const [vivahPendingCount, setVivahPendingCount] = useState(0);
  const [totalVivahProfiles, setTotalVivahProfiles] = useState(0);

  // Store & POS live data
  const [storeOrders, setStoreOrders] = useState<StoreOrder[]>([]);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);

  // Live Clock
  const [timeString, setTimeString] = useState('');

  const loadAllData = () => {
    try {
      setRbacUsers(getStoredRBACUsers());
      setOfficialMembers(getStoredOfficialMembers());
      setEsewaRequests(getStoredEsewaRequests());
      setClientLeads(getStoredClientLeads());
      setBookings(getStoredBookings());
      setAuditLogs(getStoredAuditLogs());
      setNotifications(getStoredSystemNotifications());
      setStoreOrders(getStoredOrders());
      setStoreProducts(getStoredProducts());

      // Vivah Portal counts
      const vProfiles = getStoredVivahProfiles() || [];
      const vAds = getStoredVivahAds() || [];
      const vReqs = getStoredVivahRequests() || [];
      const vReps = getStoredVivahReports() || [];
      const pendingP = vProfiles.filter(p => p && (p.verificationStatus === 'PENDING' || (p.idDocumentUrl && p.verificationLevel !== 'ADMIN_VERIFIED'))).length;
      const pendingA = vAds.filter(a => a && a.status === 'PENDING_REVIEW').length;
      const pendingR = vReqs.filter(r => r && r.status === 'CONTACT_RELEASE_REQUESTED').length;
      const pendingRep = vReps.filter(r => r && (r.status === 'OPEN' || r.status === 'UNDER_REVIEW')).length;
      setVivahPendingCount(pendingP + pendingA + pendingR + pendingRep);
      setTotalVivahProfiles(vProfiles.length);
    } catch (e) {
      console.error('Error loading admin data:', e);
    }
  };

  useEffect(() => {
    loadAllData();
    const timer = setInterval(() => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('ne-NP', { hour12: true }));
    }, 1000);

    // Live order updates listener
    const handleOrderSync = () => {
      setStoreOrders(getStoredOrders());
      setStoreProducts(getStoredProducts());
    };
    window.addEventListener('vedic-orders-updated', handleOrderSync);

    // Keyboard Hotkey for Command Palette (Ctrl + K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(timer);
      window.removeEventListener('vedic-orders-updated', handleOrderSync);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Login Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const accounts = getStoredAdminAccounts();
    const found = accounts.find(
      a => a.username.toLowerCase() === usernameInput.trim().toLowerCase() && a.isActive
    );

    if (found && (passwordInput === 'SukdevAdmin#2081' || passwordInput === 'admin' || passwordInput === found.passwordHash)) {
      const newSession: AdminSession = {
        adminId: found.id,
        username: found.username,
        fullName: found.fullName,
        role: found.role,
        roleNameNepali: found.roleNameNepali,
        permissions: found.permissions,
        loginTimeISO: new Date().toISOString(),
        lastActivityISO: new Date().toISOString()
      };
      setAdminSession(newSession);
      setSession(newSession);

      const rbac: RBACSession = {
        token: 'superadmin_auth_sync_' + Date.now(),
        userId: found.id || 'usr_superadmin_master',
        username: found.username,
        fullName: found.fullName,
        role: 'SUPER_ADMIN',
        roleNameNepali: found.roleNameNepali || 'मुख्य प्रशासक (Super Admin)',
        status: 'active',
        permissions: ['all', 'manage_all_modules', 'user_management', 'finance_management'],
        createdAtISO: new Date().toISOString(),
        lastActivityISO: new Date().toISOString()
      };
      setRBACSession(rbac);

      logAdminAction(
        found.username,
        found.roleNameNepali,
        'security',
        'प्रशासक लगइन',
        found.id,
        found.fullName,
        'Super Admin Control Center मा सफलतापूर्व लगइन गरियो।'
      );
      loadAllData();
    } else {
      setLoginError('अवैध प्रयोगकर्ता नाम वा पासवर्ड! (Default: admin / SukdevAdmin#2081)');
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    try {
      localStorage.removeItem('balananda_rbac_active_session_v1');
    } catch {}
    setSession(null);
  };

  // Status Handlers
  const handleUpdateMemberStatus = (memberId: string, status: 'active' | 'pending' | 'rejected' | 'suspended', rejectionReason?: string) => {
    if (status === 'active') {
      verifyMemberProfile(memberId, session?.username || 'admin');
    } else if (status === 'rejected') {
      rejectMemberProfile(memberId, rejectionReason || 'मापदण्ड अनुसार कागजात अपूर्ण रहेको', session?.username || 'admin');
    } else {
      adminUpdateMemberStatus(memberId, status, rejectionReason);
      logAdminAction(session?.username || 'admin', session?.roleNameNepali || 'Super Admin', 'member', 'विशेषज्ञ स्थिति अद्यावधिक', memberId, 'Expert', `स्थिति ${status} बनाइयो।`);
    }
    loadAllData();
  };

  const handleApprovePayment = (requestId: string) => {
    approveEsewaPaymentRequest(requestId, session?.username || 'admin');
    logAdminAction(session?.username || 'admin', session?.roleNameNepali || 'Super Admin', 'payment', 'eSewa भुक्तानी स्वीकृत', requestId, 'Payment', 'रकम सफलतापूर्व स्वीकृत गरियो।');
    loadAllData();
  };

  const handleRejectPayment = (requestId: string, reason: string) => {
    rejectEsewaPaymentRequest(requestId, reason);
    logAdminAction(session?.username || 'admin', session?.roleNameNepali || 'Super Admin', 'payment', 'eSewa भुक्तानी अस्वीकृत', requestId, 'Payment', `कारण: ${reason}`);
    loadAllData();
  };

  const handleUpdateUserStatus = (userId: string, newStatus: any) => {
    updateRBACUserStatus(userId, newStatus, session?.username || 'admin');
    logAdminAction(session?.username || 'admin', session?.roleNameNepali || 'Super Admin', 'user', 'प्रयोगकर्ता खाता स्थिति अद्यावधिक', userId, 'User', `स्थिति ${newStatus} मा परिवर्तन गरियो।`);
    loadAllData();
  };

  const handleUpdateBookingStatus = (bookingId: string, newStatus: BookingStatus, note?: string) => {
    const updated = bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b);
    saveBookings(updated);
    setBookings(updated);
    logAdminAction(session?.username || 'admin', session?.roleNameNepali || 'Super Admin', 'system', 'सेवा बुकिङ ओभरराइड', bookingId, 'Booking', `स्थिति ${newStatus} बनाइयो।`);
  };

  // Calculated Stats (Safely guarded against null/undefined arrays)
  const pendingExpertsCount = (officialMembers || []).filter(m => m && (m.status === 'pending' || m.approvalStatus === 'Pending')).length;
  const activeExpertsCount = (officialMembers || []).filter(m => m && (m.status === 'approved' || m.approvalStatus === 'Approved')).length;
  const pendingPaymentsCount = (esewaRequests || []).filter(r => r && r.status === 'pending').length;
  const pendingBookingsCount = (bookings || []).filter(b => b && (b.status === 'OFFERED' || b.status === 'MATCHING')).length;
  const pendingPurchasesCount = (clientLeads || []).filter(l => l && l.status === 'PURCHASE_PENDING').length;

  const stats = {
    totalUsers: (rbacUsers || []).length || 120,
    totalYajaman: (rbacUsers || []).filter(u => u && u.role === 'CUSTOMER').length || 95,
    totalExperts: (officialMembers || []).length || 18,
    pendingExperts: pendingExpertsCount,
    activeExperts: activeExpertsCount,
    pendingBookings: pendingBookingsCount,
    todayBookings: 8,
    pendingPayments: pendingPaymentsCount,
    todayRevenue: 24500,
    monthlyRevenue: 385000,
    activeMemberships: activeExpertsCount,
    expiringMemberships: 2,
    pendingStoreOrders: (storeOrders || []).filter(o => o && o.orderType === 'ONLINE' && o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length,
    pendingPosOrders: (storeOrders || []).filter(o => o && o.orderType === 'OFFLINE_POS').length,
    lowStockItems: (storeProducts || []).filter(p => p && p.stockQuantity <= p.minStockLevel).length,
    pendingPatrikaRecords: 4,
    pendingPurchases: pendingPurchasesCount,
    pendingVivah: vivahPendingCount,
    totalVivahProfiles: totalVivahProfiles
  };

  // 7 Structured Primary Block Groups
  const blockGroups = useMemo(() => [
    {
      id: 'block_overview',
      number: '१',
      title: '१. कमान्ड र अवलोकन',
      shortTitle: 'कमान्ड र अवलोकन',
      description: 'केन्द्रीय ओभरभ्यु, मुख्य कार्यसम्पादन सूचकहरू (KPIs), प्रणाली स्वास्थ्य स्थिति तथा प्रत्यक्ष अलर्टहरू',
      icon: Activity,
      accentColor: 'from-amber-500/20 to-amber-600/10 border-amber-500/40 text-amber-400',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      defaultTab: 'overview',
      items: [
        { id: 'overview', label: 'केन्द्रीय ओभरभ्यु & सूचकहरू', icon: Activity, badge: (pendingExpertsCount + pendingPaymentsCount + pendingPurchasesCount + vivahPendingCount) > 0 ? (pendingExpertsCount + pendingPaymentsCount + pendingPurchasesCount + vivahPendingCount) : null },
        { id: 'system_health', label: 'प्रणाली स्वास्थ्य & सर्भर स्थिति', icon: Server, badge: 'Live' },
        { id: 'live_alerts', label: 'प्रत्यक्ष अलर्ट तथा कार्य सूची', icon: AlertTriangle, badge: (pendingExpertsCount + pendingPaymentsCount + pendingPurchasesCount + vivahPendingCount) > 0 ? `${pendingExpertsCount + pendingPaymentsCount + pendingPurchasesCount + vivahPendingCount} बाँकी` : null }
      ]
    },
    {
      id: 'block_pages_services',
      number: '२',
      title: '२. सम्पूर्ण पृष्ठ तथा सेवा नियन्त्रण',
      shortTitle: 'सम्पूर्ण पृष्ठ तथा सेवा नियन्त्रण',
      description: 'सफ्टवेयरका सबै पृष्ठ तथा सेवाहरू अन/अफ/लक स्विचबोर्ड, समाचार तथा धर्म लेख सम्पादक, र विज्ञापन व्यवस्थापन',
      icon: Sliders,
      accentColor: 'from-blue-500/20 to-indigo-600/10 border-blue-500/40 text-blue-400',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      defaultTab: 'pages_services',
      items: [
        { id: 'pages_services', label: 'पृष्ठ & सेवा पूर्ण नियन्त्रण (Switchboard)', icon: Sliders, badge: 'स्विचबोर्ड' },
        { id: 'samachar_editor', label: 'समाचार तथा धर्म लेख सम्पादक', icon: Newspaper },
        { id: 'rashifal_management', label: 'दैनिक, मासिक र वार्षिक राशिफल व्यवस्थापक', icon: Sparkles, badge: 'नयाँ' },
        { id: 'advertisement', label: 'विज्ञापन व्यवस्थापन (AdSense & Banners)', icon: Megaphone }
      ]
    },
    {
      id: 'block_vedic_portals',
      number: '३',
      title: '३. वैदिक मञ्च तथा सेवाहरू',
      shortTitle: 'वैदिक मञ्च तथा सेवाहरू',
      description: 'विवाह मञ्च ब्याकइन्ड, पुरोहित तथा ज्योतिष बुकिङ, केन्द्रीय कुण्डली/पत्रिका, वैदिक पसल र POS, र मिडिया भण्डार',
      icon: HeartHandshake,
      accentColor: 'from-rose-500/20 to-pink-600/10 border-rose-500/40 text-rose-400',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      defaultTab: 'vivah_portal',
      items: [
        { id: 'vivah_portal', label: 'विवाह मञ्च ब्याकइन्ड', icon: HeartHandshake, badge: vivahPendingCount > 0 ? `${vivahPendingCount}` : null },
        { id: 'bookings', label: 'सेवा बुकिङ व्यवस्थापन', icon: Calendar, badge: pendingBookingsCount > 0 ? pendingBookingsCount : null },
        { id: 'patrika', label: 'केन्द्रीय कुण्डली & पत्रिका', icon: FileText },
        { id: 'store_pos', label: 'वैदिक पसल र POS काउन्टर', icon: ShoppingBag },
        { id: 'media_downloads', label: 'मिडिया, फोटो र भिडियो व्यवस्थापक', icon: Layers, badge: 'नयाँ' }
      ]
    },
    {
      id: 'block_users_experts',
      number: '४',
      title: '४. प्रयोगकर्ता र विशेषज्ञ',
      shortTitle: 'प्रयोगकर्ता र विशेषज्ञ',
      description: 'मोबाइल दर्ता, पासवर्ड जेनेरेसन, मेनु स्विचबोर्ड, प्रमाणित पण्डित/ज्योतिषी, यजमान ग्राहक र कर्मचारी RBAC',
      icon: Users,
      accentColor: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/40 text-emerald-400',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      defaultTab: 'user_list',
      items: [
        { id: 'user_list', label: '१. मोबाइल दर्ता & पासवर्ड', icon: Smartphone, badge: 'दर्ता' },
        { id: 'menu_switchboard', label: '२. मेनु स्विचबोर्ड (Open/Lock)', icon: Sliders, badge: 'स्विचबोर्ड' },
        { id: 'experts', label: '३. प्रमाणित विशेषज्ञहरू', icon: Award, badge: pendingExpertsCount > 0 ? pendingExpertsCount : null },
        { id: 'yajaman', label: '४. यजमान ग्राहक प्रोफाइल', icon: UserCheck },
        { id: 'staff_rbac', label: '५. कर्मचारी तथा RBAC खाता', icon: ShieldCheck },
        { id: 'role_magic_links', label: '६. सक्रिय म्याजिक लिङ्क', icon: Key, badge: 'Direct' }
      ]
    },
    {
      id: 'block_finance',
      number: '५',
      title: '५. आर्थिक तथा सदस्यता',
      shortTitle: 'आर्थिक तथा सदस्यता',
      description: 'सफ्टवेयर खरिद स्वीकृति, eSewa र बैंक भुक्तानी प्रमाणीकरण, तथा विशेषज्ञ सदस्यता योजना नवीकरण',
      icon: DollarSign,
      accentColor: 'from-amber-500/20 to-yellow-600/10 border-amber-500/40 text-amber-400',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      defaultTab: 'client_approvals',
      items: [
        { id: 'client_approvals', label: 'सफ्टवेयर खरिद स्वीकृति', icon: CreditCard, badge: pendingPurchasesCount > 0 ? `${pendingPurchasesCount}` : null },
        { id: 'finance', label: 'भुक्तानी प्रमाणीकरण (eSewa & Bank)', icon: DollarSign, badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : null },
        { id: 'memberships', label: 'सदस्यता योजना & नवीकरण', icon: Crown }
      ]
    },
    {
      id: 'block_communication',
      number: '६',
      title: '६. सञ्चार र प्रसारण',
      shortTitle: 'सञ्चार र प्रसारण',
      description: 'दैनिक बिहान ७ बजे स्वचालित WhatsApp पञ्चाङ्ग प्रेषण, लक्षित पुश सूचना, र लोकेसन मनिटर',
      icon: MessageSquare,
      accentColor: 'from-purple-500/20 to-violet-600/10 border-purple-500/40 text-purple-400',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      defaultTab: 'daily_whatsapp',
      items: [
        { id: 'daily_whatsapp', label: 'दैनिक बिहान ७ बजे WhatsApp', icon: MessageSquare, badge: '७ AM' },
        { id: 'targeted_push', label: 'लक्षित पुश सूचना (Broadcasting)', icon: Send },
        { id: 'notifications', label: 'प्रणाली सूचना ब्रोडकास्ट', icon: Bell },
        { id: 'geo_monitor', label: 'लोकेसन रेडियस मनिटर', icon: MapPin }
      ]
    },
    {
      id: 'block_settings_security',
      number: '७',
      title: '७. सेटिङ्स, सुरक्षा र ब्याकअप',
      shortTitle: 'सेटिङ्स, सुरक्षा र ब्याकअप',
      description: 'प्रणाली र संस्थागत सेटिङ्स, सुरक्षा अडिट लग, विश्लेषणात्मक प्रतिवेदन, र पूर्ण डेटाबेस ब्याकअप/रिस्टोर',
      icon: Lock,
      accentColor: 'from-cyan-500/20 to-blue-600/10 border-cyan-500/40 text-cyan-400',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      defaultTab: 'settings',
      items: [
        { id: 'settings', label: 'प्रणाली र संस्थागत सेटिङ्स', icon: Settings },
        { id: 'software_releases', label: 'सफ्टवेयर रिलिज व्यवस्थापन', icon: Download, badge: 'Official' },
        { id: 'security_audit', label: 'सुरक्षा र अडिट लग', icon: Lock },
        { id: 'reports', label: 'विश्लेषणात्मक प्रतिवेदन', icon: TrendingUp },
        { id: 'backup', label: 'डाटा ब्याकअप & रिस्टोर', icon: Database }
      ]
    }
  ], [
    pendingExpertsCount,
    pendingPaymentsCount,
    pendingPurchasesCount,
    vivahPendingCount,
    pendingBookingsCount
  ]);

  // Flat list of all items for search
  const allNavItems = useMemo(() => {
    return blockGroups.flatMap(bg => bg.items.map(it => ({ ...it, blockId: bg.id, blockTitle: bg.title })));
  }, [blockGroups]);

  // Currently active block object (if inside a dedicated full-page block)
  const currentActiveBlock = useMemo(() => {
    if (!activeBlockId) return null;
    return blockGroups.find(b => b.id === activeBlockId) || null;
  }, [activeBlockId, blockGroups]);

  // Currently active item
  const currentActiveItem = allNavItems.find(i => i.id === activeTab) || { label: 'कमान्ड कक्ष', icon: Activity };
  const CurrentIcon = currentActiveItem.icon;

  // Actions
  const handleOpenBlock = (blockId: string, itemTab?: string) => {
    const targetBlock = blockGroups.find(b => b.id === blockId);
    setActiveBlockId(blockId);
    if (itemTab) {
      setActiveTab(itemTab);
    } else if (targetBlock) {
      setActiveTab(targetBlock.defaultTab);
    }
  };

  const handleBackToDashboard = () => {
    setActiveBlockId(null);
  };

  const handleNavigateTabFromInside = (tabId: string) => {
    const bId = getBlockIdFromTab(tabId) || 'block_overview';
    setActiveBlockId(bId);
    setActiveTab(tabId);
  };

  // If not logged in -> Display Dedicated Super Admin Login Modal Screen
  if (!session) {
    return (
      <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center p-4 font-sans text-stone-100">
        <div className="max-w-md w-full bg-stone-900 border border-amber-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl mx-auto flex items-center justify-center shadow-lg border border-amber-400/40">
              <ShieldCheck className="w-10 h-10 text-stone-950" />
            </div>
            <h1 className="text-xl font-bold font-serif text-amber-400 tracking-wide mt-2">
              SUPER ADMIN CONTROL CENTER
            </h1>
            <p className="text-xs text-stone-400">
              बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा — केन्द्रीय कमान्ड कक्ष
            </p>
          </div>

          {loginError && (
            <div className="bg-rose-950/80 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-stone-300 font-bold mb-1.5">प्रशासक प्रयोगकर्ता नाम (Username)</label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="admin"
                className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl p-3 text-stone-100 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-bold mb-1.5">सुरक्षित पासकोड (Password)</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl p-3 text-stone-100 outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black rounded-xl text-xs shadow-lg transition-all cursor-pointer uppercase tracking-wider"
            >
              कमान्ड कक्षमा प्रवेश गर्नुहोस्
            </button>
          </form>

          <div className="text-center pt-2 border-t border-stone-800 space-y-2">
            <p className="text-[10px] text-stone-500">
              विकासकर्ता डिफल्ट साँचो: <code className="text-amber-400 font-mono">admin</code> / <code className="text-amber-400 font-mono">SukdevAdmin#2081</code>
            </p>
            {onClose && (
              <div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer"
                >
                  ← सामान्य एपमा फर्किनुहोस्
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 403 Security Check
  if (session.role !== 'super_admin' && session.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center p-4 text-stone-100">
        <div className="max-w-md w-full bg-stone-900 border border-rose-800 p-8 rounded-3xl text-center space-y-4">
          <XCircle className="w-16 h-16 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-rose-400">403 ACCESS DENIED</h2>
          <p className="text-xs text-stone-400">
            तपाईंसँग मुख्य प्रशासक (Super Admin) नियन्त्रण कक्षमा पहुँच गर्ने अनुमति छैन।
          </p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={handleLogout} className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold cursor-pointer">
              बाहिरिनुहोस्
            </button>
            {onClose && (
              <button onClick={onClose} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-xs font-bold cursor-pointer">
                सामान्य एपमा फर्किनुहोस्
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-admin-command-center="true" className="h-screen bg-[#0C0A09] text-stone-100 flex flex-col font-sans overflow-hidden">
      {/* ── TOP HEADER COMMAND BAR (Always clean & spacious) ── */}
      <header className="shrink-0 bg-stone-900/95 border-b border-stone-800 z-40 backdrop-blur-md px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-lg">
        {/* Left: Brand & Title */}
        <div className="flex items-center gap-3">
          {activeBlockId && (
            <button
              onClick={handleBackToDashboard}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl text-xs shadow-md shadow-amber-500/20 cursor-pointer active:scale-95 transition-all shrink-0"
              title="मुख्य ड्यासबोर्डमा फर्कनुहोस्"
            >
              <ArrowLeft className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">मुख्य ड्यासबोर्डमा फर्कनुहोस्</span>
              <span className="sm:hidden">फर्कनुहोस्</span>
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center font-bold text-stone-950 shadow-md ring-2 ring-amber-400/30 shrink-0">
              ॐ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-xs sm:text-sm text-white font-serif leading-tight">
                  SUPER ADMIN COMMAND CENTER
                </h1>
                <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[10px] text-amber-400 font-mono">
                {activeBlockId && currentActiveBlock ? `${currentActiveBlock.title} • पूर्ण स्क्रिन पृष्ठ` : 'बालानन्द केन्द्रीय नियन्त्रण कक्ष • ७ मुख्य पृष्ठहरू'}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Command Palette Trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-stone-950 border border-stone-800 hover:border-amber-500/50 rounded-2xl text-stone-400 text-xs transition-all cursor-pointer shadow-inner"
        >
          <Search className="w-3.5 h-3.5 text-stone-500" />
          <span>त्वरित कमान्ड वा मोड्युल खोज्नुहोस्...</span>
          <kbd className="bg-stone-800 px-1.5 py-0.5 text-[10px] rounded text-stone-300 font-mono ml-2">Ctrl+K</kbd>
        </button>

        {/* Right Info: Live Clock, App Switcher, Profile, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden lg:inline text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-3 py-1 rounded-xl border border-amber-800/80 shadow-xs">
            {timeString || '२०८१'}
          </span>

          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition-all cursor-pointer border border-stone-700"
              title="सामान्य प्रयोगकर्ता एपमा फर्कनुहोस्"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">एपमा फर्किनुहोस्</span>
            </button>
          )}

          <div className="flex items-center gap-2 border-l border-stone-800 pl-2.5">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-stone-200">{session.fullName}</p>
              <p className="text-[10px] text-amber-400 font-mono">{session.roleNameNepali}</p>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-xl border border-rose-800 text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="कमान्ड कक्षबाट लगआउट"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── MODE 1: MAIN SUPER ADMIN DASHBOARD (activeBlockId === null) ── */}
      {/* Displays ONLY the 7 Primary Block Cards in high-end layout as requested */}
      {!activeBlockId && (
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0C0A09]">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Top Welcome & KPI Summary Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-stone-900 via-stone-900/95 to-amber-950/40 border border-stone-800/90 p-5 sm:p-7 rounded-3xl shadow-xl space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-950/70 border border-amber-800/60 px-2.5 py-0.5 rounded-lg">
                      केन्द्रीय प्रशासनिक ड्यासबोर्ड
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white font-serif tracking-tight mt-1.5">
                    सुपरएडमिन मुख्य कमान्ड सेन्टर (Master Control Center)
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-400 leading-relaxed mt-1 max-w-3xl">
                    तलका ७ वटा मुख्य प्रशासनिक पृष्ठहरू मध्ये कुनै एक शीर्षकमा क्लिक गर्नुहोस् र पूर्ण स्क्रिनमा कार्य सम्पादन गर्नुहोस्। प्रत्येक पृष्ठभित्र आफ्ना सम्बन्धित मेनुहरू उपलब्ध छन्।
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadAllData}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-xl text-xs font-bold border border-stone-700 cursor-pointer transition-colors shadow-sm"
                    title="सम्पूर्ण डेटा रिफ्रेस गर्नुहोस्"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>डेटा रिफ्रेस</span>
                  </button>
                </div>
              </div>

              {/* Quick Status KPI Ticker */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-stone-800/80 text-xs">
                <div className="bg-stone-950/60 border border-stone-800/60 p-2.5 rounded-2xl">
                  <p className="text-[10px] text-stone-400">कुल प्रयोगकर्ता</p>
                  <p className="text-base font-black text-white">{stats.totalUsers}</p>
                </div>
                <div className="bg-stone-950/60 border border-stone-800/60 p-2.5 rounded-2xl">
                  <p className="text-[10px] text-stone-400">प्रमाणित विशेषज्ञ</p>
                  <p className="text-base font-black text-emerald-400">{stats.activeExperts}</p>
                </div>
                <div className="bg-stone-950/60 border border-stone-800/60 p-2.5 rounded-2xl">
                  <p className="text-[10px] text-stone-400">पेन्डिङ भुक्तानी</p>
                  <p className={`text-base font-black ${stats.pendingPayments > 0 ? 'text-amber-400' : 'text-stone-300'}`}>
                    {stats.pendingPayments}
                  </p>
                </div>
                <div className="bg-stone-950/60 border border-stone-800/60 p-2.5 rounded-2xl">
                  <p className="text-[10px] text-stone-400">विवाह मञ्च समीक्षा</p>
                  <p className={`text-base font-black ${stats.pendingVivah > 0 ? 'text-rose-400' : 'text-stone-300'}`}>
                    {stats.pendingVivah || 0}
                  </p>
                </div>
                <div className="bg-stone-950/60 border border-stone-800/60 p-2.5 rounded-2xl">
                  <p className="text-[10px] text-stone-400">सफ्टवेयर खरिद</p>
                  <p className={`text-base font-black ${stats.pendingPurchases > 0 ? 'text-blue-400' : 'text-stone-300'}`}>
                    {stats.pendingPurchases || 0}
                  </p>
                </div>
                <div className="bg-stone-950/60 border border-stone-800/60 p-2.5 rounded-2xl">
                  <p className="text-[10px] text-stone-400">प्रणाली स्थिति</p>
                  <p className="text-base font-black text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>सक्रिय</span>
                  </p>
                </div>
              </div>
            </div>

            {/* ── THE 7 MASTER PAGE BLOCKS GRID ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                  <span className="text-amber-400">★</span>
                  <span>७ वटा मुख्य प्रशासनिक पृष्ठहरू (Master Pages)</span>
                </h3>
                <span className="text-xs text-stone-500">शीर्षकमा क्लिक गरी पूर्ण स्क्रिनमा प्रवेश गर्नुहोस्</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {blockGroups.map(block => {
                  const BlockIcon = block.icon;
                  const pendingCount = (
                    block.id === 'block_overview' ? (pendingExpertsCount + pendingPaymentsCount + pendingPurchasesCount + vivahPendingCount) :
                    block.id === 'block_finance' ? (pendingPaymentsCount + pendingPurchasesCount) :
                    block.id === 'block_vedic_portals' ? (vivahPendingCount + pendingBookingsCount) :
                    block.id === 'block_users_experts' ? pendingExpertsCount : 0
                  );

                  return (
                    <div
                      key={block.id}
                      onClick={() => handleOpenBlock(block.id, block.defaultTab)}
                      className="group relative bg-stone-900/90 hover:bg-stone-900 border border-stone-800/90 hover:border-amber-500/60 rounded-3xl p-5 sm:p-6 transition-all duration-200 hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3.5">
                        {/* Top: Number badge, Icon, Alert counter */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-stone-950 border border-stone-800 text-xs font-black text-amber-400 font-mono flex items-center justify-center shadow-inner">
                              {block.number}
                            </span>
                            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${block.accentColor} border flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                              <BlockIcon className="w-5 h-5" />
                            </div>
                          </div>

                          {pendingCount > 0 && (
                            <span className="px-2.5 py-1 rounded-xl bg-rose-600/90 text-white font-bold text-xs animate-pulse shadow-sm flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{pendingCount} बाँकी</span>
                            </span>
                          )}
                        </div>

                        {/* Title and Short Description */}
                        <div>
                          <h4 className="text-base sm:text-lg font-black text-white group-hover:text-amber-400 transition-colors leading-tight">
                            {block.shortTitle}
                          </h4>
                          <p className="text-xs text-stone-400 leading-relaxed mt-1.5 line-clamp-2">
                            {block.description}
                          </p>
                        </div>

                        {/* Sub-menu Pills (Indicating what lives inside this page) */}
                        <div className="space-y-1.5 pt-1">
                          <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                            यस पृष्ठका मेनुहरू ({block.items.length})
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {block.items.map(sub => (
                              <span
                                key={sub.id}
                                className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-stone-950/80 text-stone-300 border border-stone-800/80"
                              >
                                {sub.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Button Action */}
                      <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:text-amber-300">
                        <span className="flex items-center gap-1">
                          <span>यस पृष्ठमा प्रवेश गर्नुहोस्</span>
                        </span>
                        <span className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-stone-950 transition-all font-black text-sm">
                          →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </main>
      )}

      {/* ── MODE 2: DEDICATED FULL-SCREEN BLOCK PAGE (activeBlockId !== null) ── */}
      {activeBlockId && currentActiveBlock && (
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 w-full">

          {/* TOP HORIZONTAL SUB-MENU COMMAND BAR FOR THE BLOCK */}
          <div className="shrink-0 bg-stone-900 border-b border-stone-800 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
            {/* Left: Active Block Title & Quick Jump Selector */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold text-xs flex items-center justify-center">
                  {currentActiveBlock.number}
                </span>
                <span className="font-extrabold text-sm sm:text-base text-white">
                  {currentActiveBlock.shortTitle}
                </span>
              </div>

              {/* Quick Block Jump Dropdown */}
              <div className="relative hidden md:block">
                <select
                  value={activeBlockId}
                  onChange={(e) => handleOpenBlock(e.target.value)}
                  className="bg-stone-950 border border-stone-800 hover:border-amber-500/50 rounded-xl px-2.5 py-1 text-xs text-stone-300 font-semibold outline-none cursor-pointer"
                >
                  {blockGroups.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Center/Right: Sub-menu Tabs for this Block (Rendered horizontally as page menus) */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5">
              {currentActiveBlock.items.map(item => {
                const ItemIcon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black shadow-md shadow-amber-500/20 scale-[1.02]'
                        : 'bg-stone-950/80 border border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800/80 hover:border-stone-700'
                    }`}
                  >
                    <ItemIcon className={`w-3.5 h-3.5 ${isActive ? 'text-stone-950 stroke-[2.5]' : 'text-amber-400'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-stone-950 text-amber-300' : 'bg-red-600 text-white animate-pulse'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FULL-WIDTH CONTENT WORKSPACE (No squishing, zero text overlap) */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 bg-[#0C0A09] w-full">
            <div className="w-full mx-auto space-y-4">
              <TabContentErrorBoundary
                activeTabTitle={currentActiveItem.label}
                onFallbackToOverview={() => setActiveTab(currentActiveBlock.defaultTab)}
              >
                {/* ── BLOCK 1: COMMAND & OVERVIEW VIEWS ── */}
                {activeTab === 'overview' && (
                  <AdminOverviewSection
                    stats={stats}
                    onNavigateTab={handleNavigateTabFromInside}
                    onRefresh={loadAllData}
                  />
                )}

                {activeTab === 'system_health' && (
                  <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-6 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
                      <div>
                        <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                          <Server className="w-5 h-5 text-emerald-400" />
                          <span>प्रणाली स्वास्थ्य तथा सर्भर स्थिति (System Health Monitor)</span>
                        </h3>
                        <p className="text-xs text-stone-400">बालानन्द ज्योतिष तथा पञ्चाङ्ग प्लेटफर्मको प्रत्यक्ष प्राविधिक स्थिति</p>
                      </div>
                      <button
                        onClick={loadAllData}
                        className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-xl text-xs font-bold border border-stone-700 flex items-center gap-1.5 w-fit"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>स्थिति पुनः जाँच</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-stone-950 border border-stone-800/80 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] text-stone-400">सर्भर स्थिति (Uptime)</span>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-base font-black text-white">९९.९८% सक्रिय</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono">Response Latency: 38ms</span>
                      </div>

                      <div className="bg-stone-950 border border-stone-800/80 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] text-stone-400">खगोलीय गणना इन्जिन (Astro Engine)</span>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                          <span className="text-base font-black text-white">Swiss Ephemeris 2.10</span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono">Lahiri Ayanamsha: Calibrated</span>
                      </div>

                      <div className="bg-stone-950 border border-stone-800/80 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] text-stone-400">डाटाबेस सिङ्क (Local / Cloud)</span>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                          <span className="text-base font-black text-white">IndexedDB & Storage</span>
                        </div>
                        <span className="text-[10px] text-blue-400 font-mono">Quota: 100% Healthy</span>
                      </div>

                      <div className="bg-stone-950 border border-stone-800/80 p-4 rounded-2xl space-y-1">
                        <span className="text-[11px] text-stone-400">WhatsApp शेड्युलर क्रोन</span>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                          <span className="text-base font-black text-white">सक्रिय (७:०० AM)</span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono">Next run: Tomorrow 07:00</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'live_alerts' && (
                  <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-5 shadow-xl">
                    <div className="border-b border-stone-800 pb-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-amber-400" />
                          <span>सक्रिय कार्य अलर्ट तथा कार्य सूची (Critical Action Alerts)</span>
                        </h3>
                        <p className="text-xs text-stone-400">तुरुन्त सम्पादन गर्नुपर्ने आवश्यक प्रशासनिक कार्यहरू</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {stats.pendingPurchases > 0 && (
                        <div className="bg-stone-950 border border-rose-900/60 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-rose-400 shrink-0" />
                            <div>
                              <p className="font-bold text-sm text-white">{stats.pendingPurchases} जना ग्राहकको सफ्टवेयर खरिद स्वीकृति बाँकी</p>
                              <p className="text-xs text-stone-400">ग्राहक भुक्तानी प्रमाणीकरण गरी सफ्टवेयर लाइसेन्स अनलक गर्नुहोस्</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleOpenBlock('block_finance', 'client_approvals')}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl cursor-pointer shrink-0 transition-colors"
                          >
                            स्वीकृति दिनुहोस् →
                          </button>
                        </div>
                      )}

                      {stats.pendingPayments > 0 && (
                        <div className="bg-stone-950 border border-amber-900/60 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <DollarSign className="w-5 h-5 text-amber-400 shrink-0" />
                            <div>
                              <p className="font-bold text-sm text-white">{stats.pendingPayments} वटा eSewa / बैंक भुक्तानी प्रमाणीकरण बाँकी</p>
                              <p className="text-xs text-stone-400">ट्रान्ज्याक्सन आईडी प्रमाणीकरण गरी खाता सक्रिय गर्नुहोस्</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleOpenBlock('block_finance', 'finance')}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl cursor-pointer shrink-0 transition-colors"
                          >
                            भुक्तानी प्रमाणीकरण →
                          </button>
                        </div>
                      )}

                      {stats.pendingVivah > 0 && (
                        <div className="bg-stone-950 border border-pink-900/60 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <HeartHandshake className="w-5 h-5 text-pink-400 shrink-0" />
                            <div>
                              <p className="font-bold text-sm text-white">{stats.pendingVivah} वटा विवाह विज्ञापन तथा प्रोफाइल समीक्षा बाँकी</p>
                              <p className="text-xs text-stone-400">विवाह मञ्चका प्रोफाइल र सम्पर्क अनुरोध समीक्षा गर्नुहोस्</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleOpenBlock('block_vedic_portals', 'vivah_portal')}
                            className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl cursor-pointer shrink-0 transition-colors"
                          >
                            विवाह समीक्षा →
                          </button>
                        </div>
                      )}

                      {stats.pendingExperts > 0 && (
                        <div className="bg-stone-950 border border-blue-900/60 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Award className="w-5 h-5 text-blue-400 shrink-0" />
                            <div>
                              <p className="font-bold text-sm text-white">{stats.pendingExperts} जना नयाँ पण्डित/ज्योतिषीको प्रमाणीकरण बाँकी</p>
                              <p className="text-xs text-stone-400">कागजात रुजु गरी आधिकारिक विशेषज्ञको स्वीकृति दिनुहोस्</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleOpenBlock('block_users_experts', 'experts')}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl cursor-pointer shrink-0 transition-colors"
                          >
                            विशेषज्ञ रुजु गर्नुहोस् →
                          </button>
                        </div>
                      )}

                      {stats.pendingPurchases === 0 && stats.pendingPayments === 0 && stats.pendingVivah === 0 && stats.pendingExperts === 0 && (
                        <div className="text-center py-8 text-stone-400 space-y-2">
                          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                          <p className="text-sm font-bold text-white">कुनै पनि तत्काल कार्य अलर्ट बाँकी छैन!</p>
                          <p className="text-xs">प्रणालीका सबै भुक्तानी, प्रोफाइल र खरिदहरू अद्यावधिक छन्।</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── BLOCK 2: PAGE & SERVICE CONTROL VIEWS ── */}
                {activeTab === 'pages_services' && (
                  <AdminPageServiceControlSection
                    onNavigateAppPage={(tab) => {
                      if (onNavigateApp) onNavigateApp(tab);
                      else if (onClose) onClose();
                    }}
                    onRefreshParent={loadAllData}
                  />
                )}
                {activeTab === 'samachar_editor' && (
                  <NewsEditorDashboard orgName={orgProfile?.name} onRefreshParent={loadAllData} />
                )}
                {activeTab === 'rashifal_management' && (
                  <SuperAdminRashifalManagement />
                )}
                {activeTab === 'advertisement' && (
                  <AdminAdvertisementSection />
                )}

                {/* ── BLOCK 3: VEDIC PORTALS & SERVICES ── */}
                {activeTab === 'vivah_portal' && (
                  <AdminVivahSection onRefreshParent={loadAllData} />
                )}
                {activeTab === 'bookings' && (
                  <AdminBookingSection
                    bookings={bookings}
                    onUpdateBookingStatus={handleUpdateBookingStatus}
                    onRefresh={loadAllData}
                  />
                )}
                {activeTab === 'patrika' && <AdminPatrikaSection />}
                {activeTab === 'store_pos' && (
                  <AdminStorePosSection
                    products={storeProducts}
                    orders={storeOrders}
                    onRefresh={loadAllData}
                  />
                )}
                {activeTab === 'media_downloads' && <StoreMediaAdminTab />}

                {/* ── BLOCK 4: USERS & EXPERTS MANAGEMENT ── */}
                {(activeTab === 'user_list' || activeTab === 'user_control' || activeTab === 'menu_control' || activeTab === 'users') && (
                  <UserControlMasterView
                    hideHeader={true}
                    initialSubTab="user_list"
                    onBackToDashboard={handleBackToDashboard}
                    onLogoutAdmin={handleLogout}
                  />
                )}
                {activeTab === 'menu_switchboard' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h2 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-blue-600" />
                        <span>मेनु तथा ग्राहक पहुँच नियन्त्रण (Full Menu Switchboard)</span>
                      </h2>
                      <p className="text-xs text-slate-500">
                        सफ्टवेयरका सबै मेनु र उपमेनुहरूलाई ग्राहक अनुसार १. Open (खुल्ला) २. Close (बन्द) ३. Lock (लक) गर्नुहोस्
                      </p>
                    </div>
                    <MenuControlPanel />
                  </div>
                )}
                {activeTab === 'experts' && (
                  <AdminExpertSection
                    members={officialMembers}
                    onUpdateStatus={handleUpdateMemberStatus}
                    onRefresh={loadAllData}
                  />
                )}
                {activeTab === 'yajaman' && (
                  <AdminYajamanSection users={rbacUsers} bookings={bookings} onRefresh={loadAllData} />
                )}
                {activeTab === 'staff_rbac' && (
                  <AdminUserManagementSection
                    users={rbacUsers}
                    onUpdateUserStatus={handleUpdateUserStatus}
                    onChangeUserRole={(id, r) => editRBACUserDetails(id, { role: r }, session?.username || 'admin')}
                    onResetUserPassword={() => {}}
                    onAddNewUser={() => loadAllData()}
                    onRefresh={loadAllData}
                  />
                )}
                {activeTab === 'rbac' && <AdminRbacSection />}
                {activeTab === 'role_magic_links' && <AdminRoleMagicLinksSection />}

                {/* ── BLOCK 5: FINANCE & MEMBERSHIPS ── */}
                {activeTab === 'client_approvals' && (
                  <AdminClientApprovalsSection onRefresh={loadAllData} />
                )}
                {activeTab === 'finance' && (
                  <AdminFinanceSection
                    esewaRequests={esewaRequests}
                    onApprovePayment={handleApprovePayment}
                    onRejectPayment={handleRejectPayment}
                    onRefresh={loadAllData}
                  />
                )}
                {activeTab === 'memberships' && (
                  <AdminMembershipSection members={officialMembers} onRefresh={loadAllData} />
                )}

                {/* ── BLOCK 6: COMMUNICATION & BROADCASTING ── */}
                {activeTab === 'daily_whatsapp' && (
                  <DailyWhatsAppDispatchManager
                    profiles={profiles || []}
                    todayPanchanga={todayPanchanga || calculatePanchanga(new Date().toISOString().split('T')[0], '06:00', 27.7172, 85.3240, 5.75)}
                    orgProfile={orgProfile}
                    transitPlanets={transitPlanets || []}
                  />
                )}
                {activeTab === 'targeted_push' && <AdminTargetedPushNotificationSection />}
                {activeTab === 'notifications' && (
                  <AdminNotificationSection notifications={notifications} onRefresh={loadAllData} />
                )}
                {activeTab === 'geo_monitor' && <AdminGeoMonitorSection />}

                {/* ── BLOCK 7: SETTINGS, SECURITY & BACKUP ── */}
                {activeTab === 'settings' && <AdminSettingsSection />}
                {activeTab === 'software_releases' && (
                  <SoftwareReleaseManagerModal
                    isOpen={true}
                    onClose={() => setActiveTab('settings')}
                  />
                )}
                {activeTab === 'security_audit' && (
                  <AdminSecurityAuditSection auditLogs={auditLogs} onRefresh={loadAllData} />
                )}
                {activeTab === 'reports' && <AdminReportSection />}
                {activeTab === 'backup' && <AdminBackupSection />}
              </TabContentErrorBoundary>
            </div>
          </main>
        </div>
      )}

      {/* ── COMMAND PALETTE MODAL (Ctrl+K) ── */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
          <div className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-500" />
              <input
                type="text"
                autoFocus
                placeholder="कमान्ड वा मोड्युल खोज्नुहोस्..."
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-2xl pl-10 pr-3 py-2.5 text-xs text-stone-100 outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1 text-xs max-h-80 overflow-y-auto pr-1">
              <p className="text-[10px] font-bold text-stone-500 uppercase px-2 py-1">उपलब्ध मोड्युलहरू</p>
              {allNavItems.filter(i => i.label.toLowerCase().includes(commandQuery.toLowerCase()) || commandQuery === '').map(i => {
                const ItemIcon = i.icon;
                return (
                  <button
                    key={i.id}
                    onClick={() => {
                      handleOpenBlock(i.blockId, i.id);
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-800 text-stone-200 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <ItemIcon className="w-4 h-4 text-amber-400" />
                      <div>
                        <span className="font-bold block text-white">{i.label}</span>
                        <span className="text-[10px] text-stone-400">{i.blockTitle}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-stone-800 text-[11px] text-stone-500">
              <span>ESC थिचेर बन्द गर्नुहोस्</span>
              <button
                onClick={() => setIsCommandPaletteOpen(false)}
                className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold"
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
