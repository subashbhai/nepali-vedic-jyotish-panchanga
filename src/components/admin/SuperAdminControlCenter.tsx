import React, { useState, useEffect } from 'react';
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
  Megaphone
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

import { getStoredRBACUsers, RBACUser, updateRBACUserStatus, editRBACUserDetails } from '../../db/rbacStore';
import { getStoredBookings, saveBookings } from '../../db/yajamanStore';
import { INITIAL_DEMO_PRODUCTS } from '../../db/vedicStore';
import { Booking, BookingStatus } from '../../types/yajamanTypes';

import { AdminOverviewSection } from './sections/AdminOverviewSection';
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
import { AdminSamacharSection } from './sections/AdminSamacharSection';
import { AdminRoleMagicLinksSection } from './sections/AdminRoleMagicLinksSection';
import { AdminClientApprovalsSection } from './sections/AdminClientApprovalsSection';
import { AdminTargetedPushNotificationSection } from './sections/AdminTargetedPushNotificationSection';
import { AdminVivahSection } from './sections/AdminVivahSection';
import { AdminAdvertisementSection } from './sections/AdminAdvertisementSection';
import { getStoredClientLeads, ClientLead } from '../../db/clientLeadStore';
import {
  getStoredVivahProfiles,
  getStoredVivahAds,
  getStoredVivahRequests,
  getStoredVivahReports
} from '../../db/vivahStore';

interface SuperAdminControlCenterProps {
  onClose?: () => void;
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

export const SuperAdminControlCenter: React.FC<SuperAdminControlCenterProps> = ({
  onClose,
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

  // Current Active Tab
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');

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

      // Vivah Portal counts
      const vProfiles = getStoredVivahProfiles();
      const vAds = getStoredVivahAds();
      const vReqs = getStoredVivahRequests();
      const vReps = getStoredVivahReports();
      const pendingP = vProfiles.filter(p => p.verificationStatus === 'PENDING' || (p.idDocumentUrl && p.verificationLevel !== 'ADMIN_VERIFIED')).length;
      const pendingA = vAds.filter(a => a.status === 'PENDING_REVIEW').length;
      const pendingR = vReqs.filter(r => r.status === 'CONTACT_RELEASE_REQUESTED').length;
      const pendingRep = vReps.filter(r => r.status === 'OPEN' || r.status === 'UNDER_REVIEW').length;
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

  // Calculated Stats
  const pendingExpertsCount = officialMembers.filter(m => m.status === 'pending' || m.approvalStatus === 'Pending').length;
  const activeExpertsCount = officialMembers.filter(m => m.status === 'approved' || m.approvalStatus === 'Approved').length;
  const pendingPaymentsCount = esewaRequests.filter(r => r.status === 'pending').length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'OFFERED' || b.status === 'MATCHING').length;
  const pendingPurchasesCount = clientLeads.filter(l => l.status === 'PURCHASE_PENDING').length;

  const stats = {
    totalUsers: rbacUsers.length || 120,
    totalYajaman: rbacUsers.filter(u => u.role === 'CUSTOMER').length || 95,
    totalExperts: officialMembers.length || 18,
    pendingExperts: pendingExpertsCount,
    activeExperts: activeExpertsCount,
    pendingBookings: pendingBookingsCount,
    todayBookings: 8,
    pendingPayments: pendingPaymentsCount,
    todayRevenue: 24500,
    monthlyRevenue: 385000,
    activeMemberships: activeExpertsCount,
    expiringMemberships: 2,
    pendingStoreOrders: 3,
    pendingPosOrders: 1,
    lowStockItems: 2,
    pendingPatrikaRecords: 4,
    pendingPurchases: pendingPurchasesCount,
    pendingVivah: vivahPendingCount,
    totalVivahProfiles: totalVivahProfiles
  };

  const navItems = [
    { id: 'overview', label: 'ओभरभ्यु', icon: Activity, badge: (pendingExpertsCount + pendingPaymentsCount + pendingPurchasesCount + vivahPendingCount) > 0 ? (pendingExpertsCount + pendingPaymentsCount + pendingPurchasesCount + vivahPendingCount) : null },
    { id: 'vivah_portal', label: 'विवाह मञ्च ब्याकइन्ड (Matrimony)', icon: HeartHandshake, badge: vivahPendingCount > 0 ? `${vivahPendingCount} पेन्डिङ` : null },
    { id: 'client_approvals', label: 'सफ्टवेयर खरिद स्वीकृति', icon: CreditCard, badge: pendingPurchasesCount > 0 ? `${pendingPurchasesCount} पेन्डिङ` : null },
    { id: 'targeted_push', label: 'लक्षित पुश सूचना (Broadcasting)', icon: Send },
    { id: 'role_magic_links', label: 'सक्रिय म्याजिक लिङ्क (Direct Access)', icon: Key, badge: 'नयाँ' },
    { id: 'samachar_editor', label: 'समाचार तथा लेख', icon: Newspaper, badge: 'अपडेट' },
    { id: 'advertisement', label: 'विज्ञापन तथा AdSense', icon: Megaphone, badge: 'व्यवस्थापन' },
    { id: 'daily_whatsapp', label: 'दैनिक ७ बजे WhatsApp', icon: MessageSquare, badge: '७ AM' },
    { id: 'users', label: 'प्रयोगकर्ताहरू', icon: Users },
    { id: 'rbac', label: 'भूमिका र अधिकार', icon: ShieldCheck },
    { id: 'experts', label: 'विशेषज्ञहरू', icon: Award, badge: pendingExpertsCount > 0 ? pendingExpertsCount : null },
    { id: 'yajaman', label: 'यजमान प्रोफाइल', icon: UserCheck },
    { id: 'bookings', label: 'सेवा बुकिङ', icon: Calendar, badge: pendingBookingsCount > 0 ? pendingBookingsCount : null },
    { id: 'geo_monitor', label: 'लोकेसन रेडियस', icon: MapPin },
    { id: 'finance', label: 'भुक्तानी प्रमाणीकरण', icon: DollarSign, badge: pendingPaymentsCount > 0 ? pendingPaymentsCount : null },
    { id: 'memberships', label: 'सदस्यता', icon: Crown },
    { id: 'patrika', label: 'केन्द्रीय कुण्डली तथा पत्रिका', icon: FileText },
    { id: 'store_pos', label: 'वैदिक पसल र POS', icon: ShoppingBag },
    { id: 'notifications', label: 'सूचना ब्रोडकास्ट', icon: Bell },
    { id: 'reports', label: 'प्रतिवेदनहरू', icon: TrendingUp },
    { id: 'security_audit', label: 'सुरक्षा र अडिट', icon: Lock },
    { id: 'settings', label: 'प्रणाली सेटिङ्स', icon: Settings },
    { id: 'backup', label: 'डाटा ब्याकअप', icon: Database },
  ];

  return (
    <div className="h-screen bg-[#0C0A09] text-stone-100 flex flex-col font-sans overflow-hidden">
      {/* Top Header Command Bar */}
      <header className="shrink-0 bg-stone-900/90 border-b border-stone-800 z-40 backdrop-blur-md px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className="md:hidden p-2 text-stone-300 hover:text-white bg-stone-800 rounded-xl"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center font-bold text-stone-950 shadow">
              ॐ
            </div>
            <div>
              <h1 className="font-bold text-sm text-stone-100 font-serif leading-tight">SUPER ADMIN COMMAND CENTER</h1>
              <p className="text-[10px] text-amber-400 font-mono">बालानन्द केन्द्रीय नियन्त्रण कक्ष</p>
            </div>
          </div>
        </div>

        {/* Command Palette Trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-stone-950 border border-stone-800 hover:border-amber-500/50 rounded-xl text-stone-400 text-xs transition-all cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-stone-500" />
          <span>त्वरित खोज वा कमान्ड...</span>
          <kbd className="bg-stone-800 px-1.5 py-0.5 text-[10px] rounded text-stone-300 font-mono ml-2">Ctrl+K</kbd>
        </button>

        {/* Right Info */}
        <div className="flex items-center gap-3">
          <span className="hidden lg:inline text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800">
            {timeString || '२०८१'}
          </span>

          <div className="flex items-center gap-2 border-l border-stone-800 pl-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-stone-200">{session.fullName}</p>
              <p className="text-[10px] text-amber-400 font-mono">{session.roleNameNepali}</p>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-xl border border-rose-800 text-xs font-bold transition-all cursor-pointer"
              title="लगआउट"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <aside className={`fixed md:static inset-y-0 left-0 z-30 w-64 shrink-0 h-full bg-stone-900/95 border-r border-stone-800 flex flex-col justify-between overflow-hidden transition-transform duration-200 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          <div className="p-3 space-y-1 overflow-y-auto flex-1 min-h-0">
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider px-3 py-1">नियन्त्रण मोड्युलहरू</p>

            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 font-extrabold shadow-md'
                      : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-stone-950 text-amber-400' : 'bg-red-600 text-white animate-pulse'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-3 border-t border-stone-800 text-center shrink-0">
            {onClose && (
              <button
                onClick={onClose}
                className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                सामान्य एपमा फर्किनुहोस्
              </button>
            )}
          </div>
        </aside>

        {/* Center Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0C0A09] h-full">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && (
              <AdminOverviewSection stats={stats} onNavigateTab={(t) => setActiveTab(t)} onRefresh={loadAllData} />
            )}
            {activeTab === 'vivah_portal' && (
              <AdminVivahSection onRefreshParent={loadAllData} />
            )}
            {activeTab === 'client_approvals' && (
              <AdminClientApprovalsSection onRefresh={loadAllData} />
            )}
            {activeTab === 'targeted_push' && (
              <AdminTargetedPushNotificationSection />
            )}
            {activeTab === 'role_magic_links' && (
              <AdminRoleMagicLinksSection />
            )}
            {activeTab === 'samachar_editor' && (
              <AdminSamacharSection orgName={orgProfile?.name} />
            )}
            {activeTab === 'advertisement' && (
              <AdminAdvertisementSection />
            )}
            {activeTab === 'daily_whatsapp' && (
              <DailyWhatsAppDispatchManager
                profiles={profiles}
                todayPanchanga={todayPanchanga || calculatePanchanga(new Date().toISOString().split('T')[0], '06:00', 27.7172, 85.3240, 5.75)}
                orgProfile={orgProfile}
                transitPlanets={transitPlanets}
              />
            )}
            {activeTab === 'users' && (
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
            {activeTab === 'experts' && (
              <AdminExpertSection members={officialMembers} onUpdateStatus={handleUpdateMemberStatus} onRefresh={loadAllData} />
            )}
            {activeTab === 'yajaman' && (
              <AdminYajamanSection users={rbacUsers} bookings={bookings} onRefresh={loadAllData} />
            )}
            {activeTab === 'bookings' && (
              <AdminBookingSection bookings={bookings} onUpdateBookingStatus={handleUpdateBookingStatus} onRefresh={loadAllData} />
            )}
            {activeTab === 'geo_monitor' && <AdminGeoMonitorSection />}
            {activeTab === 'finance' && (
              <AdminFinanceSection
                esewaRequests={esewaRequests}
                onApprovePayment={handleApprovePayment}
                onRejectPayment={handleRejectPayment}
                onRefresh={loadAllData}
              />
            )}
            {activeTab === 'memberships' && <AdminMembershipSection members={officialMembers} onRefresh={loadAllData} />}
            {activeTab === 'patrika' && <AdminPatrikaSection />}
            {activeTab === 'store_pos' && <AdminStorePosSection products={INITIAL_DEMO_PRODUCTS} orders={[]} onRefresh={loadAllData} />}
            {activeTab === 'notifications' && <AdminNotificationSection notifications={notifications} onRefresh={loadAllData} />}
            {activeTab === 'reports' && <AdminReportSection />}
            {activeTab === 'security_audit' && <AdminSecurityAuditSection auditLogs={auditLogs} onRefresh={loadAllData} />}
            {activeTab === 'settings' && <AdminSettingsSection />}
            {activeTab === 'backup' && <AdminBackupSection />}
          </div>
        </main>
      </div>

      {/* COMMAND PALETTE MODAL (Ctrl+K) */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
          <div className="bg-stone-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-4 shadow-2xl space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
              <input
                type="text"
                autoFocus
                placeholder="कमान्ड वा मोड्युल खोज्नुहोस्..."
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-100 outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1 text-xs">
              <p className="text-[10px] font-bold text-stone-500 uppercase px-2">त्वरित सर्टकटहरू</p>
              {navItems.filter(i => i.label.includes(commandQuery) || commandQuery === '').map(i => (
                <button
                  key={i.id}
                  onClick={() => {
                    setActiveTab(i.id);
                    setIsCommandPaletteOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-800 text-stone-200 flex items-center justify-between cursor-pointer"
                >
                  <span>{i.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-stone-800">
              <button onClick={() => setIsCommandPaletteOpen(false)} className="px-3 py-1 bg-stone-800 text-stone-300 rounded-lg text-xs">रद्द</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
