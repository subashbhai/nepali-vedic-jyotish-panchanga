import React, { useState, useEffect, useMemo } from 'react';
import {
  Lock,
  Unlock,
  Sparkles,
  Compass,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  User,
  Phone,
  Calendar,
  AlertCircle,
  RefreshCw,
  Crown,
  CreditCard,
  FileText,
  Sliders,
  Check,
  X,
  Users,
  Trash2
} from 'lucide-react';
import {
  LockableServiceKey,
  ServiceLicenseDuration,
  UserServiceLicense,
  ServicePurchaseRequest,
  ServiceLicenseAuditLog
} from '../../../types/serviceLicenseTypes';
import {
  fetchAllLicensesForAdmin,
  mutateServiceLicense,
  fetchPurchaseRequestsForAdmin,
  actionPurchaseRequest,
  fetchLicenseAuditLogs
} from '../../../db/serviceLicenseStore';
import { getStoredRBACUsers, RBACUser } from '../../../db/rbacStore';
import { loadAllClientPolicies, ClientAccessRecord } from '../../../db/menuControlStore';
import { unifiedUserSyncService } from '../../../services/unifiedUserSyncService';
import { convertADToBS, toDevanagariNumerals } from '../../../utils/nepaliCalendar';
import {
  calculateRemainingDays,
  isLicenseExpired,
  calculatePlanDurationTimestamps
} from '../../../utils/licenseExpiryEngine';

interface AdminServiceLicenseSectionProps {
  initialUserPhone?: string;
  onNavigateToUsers?: (mobile?: string) => void;
  onNavigateToSwitchboard?: (mobile?: string) => void;
  onNavigateToPayments?: (mobile?: string) => void;
}

// Module-level in-memory cache for instant 0ms mount
let cachedLicenseData: {
  licenses: UserServiceLicense[];
  purchaseRequests: ServicePurchaseRequest[];
  auditLogs: ServiceLicenseAuditLog[];
  rbacUsers: RBACUser[];
  clientPolicies: ClientAccessRecord[];
  dbUsers: any[];
} | null = null;

export const AdminServiceLicenseSection: React.FC<AdminServiceLicenseSectionProps> = ({
  initialUserPhone,
  onNavigateToUsers,
  onNavigateToSwitchboard,
  onNavigateToPayments
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'requests' | 'audit'>('users');
  const [searchQuery, setSearchQuery] = useState(initialUserPhone || '');
  const [filterServiceStatus, setFilterServiceStatus] = useState<string>('all');

  const [licenses, setLicenses] = useState<UserServiceLicense[]>(() => cachedLicenseData?.licenses || []);
  const [purchaseRequests, setPurchaseRequests] = useState<ServicePurchaseRequest[]>(() => cachedLicenseData?.purchaseRequests || []);
  const [auditLogs, setAuditLogs] = useState<ServiceLicenseAuditLog[]>(() => cachedLicenseData?.auditLogs || []);
  const [rbacUsers, setRbacUsers] = useState<RBACUser[]>(() => cachedLicenseData?.rbacUsers || []);
  const [clientPolicies, setClientPolicies] = useState<ClientAccessRecord[]>(() => cachedLicenseData?.clientPolicies || []);
  const [isLoading, setIsLoading] = useState(() => !cachedLicenseData);

  // Modal for unlocking service duration
  const [unlockTarget, setUnlockTarget] = useState<{
    userId: string;
    username: string;
    fullName: string;
    phone: string;
    email?: string;
    serviceKey: LockableServiceKey;
  } | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<ServiceLicenseDuration>('1_year');
  const [unlockNotes, setUnlockNotes] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const [dbUsers, setDbUsers] = useState<any[]>(() => cachedLicenseData?.dbUsers || []);

  const loadData = async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    try {
      const [lics, reqs, logs] = await Promise.all([
        fetchAllLicensesForAdmin(),
        fetchPurchaseRequestsForAdmin(),
        fetchLicenseAuditLogs()
      ]);
      setLicenses(lics);
      setPurchaseRequests(reqs);
      setAuditLogs(logs);

      // Load RBAC and client users
      const storedRbac = getStoredRBACUsers();
      const storedPolicies = loadAllClientPolicies();
      setRbacUsers(storedRbac);
      setClientPolicies(storedPolicies);

      // Load real database users
      let fetchedDbUsers = dbUsers;
      try {
        const uRes = await fetch('/api/users');
        if (uRes.ok) {
          const uData = await uRes.json();
          if (uData.success && Array.isArray(uData.users)) {
            fetchedDbUsers = uData.users;
            setDbUsers(uData.users);
          }
        }
      } catch {}

      cachedLicenseData = {
        licenses: lics,
        purchaseRequests: reqs,
        auditLogs: logs,
        rbacUsers: storedRbac,
        clientPolicies: storedPolicies,
        dbUsers: fetchedDbUsers
      };
    } finally {
      if (!quiet) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(Boolean(cachedLicenseData));

    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener('service-license-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('service-license-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Consolidate unique users ONLY from real database users (Excluding all demo dummy accounts)
  const unifiedUsers = useMemo(() => {
    const isDemo = (phone: string, name: string) => {
      const p = (phone || '').replace(/\D/g, '').slice(-10);
      const n = (name || '').toLowerCase().trim();
      if (['9800000000', '9899999999'].includes(p)) return true;
      if (['dummy demo user'].includes(n)) return true;
      return false;
    };

    const userMap = new Map<string, {
      userId: string;
      username: string;
      fullName: string;
      phone: string;
      email?: string;
      role: string;
    }>();

    // 1. Real Database Users
    for (const u of dbUsers) {
      if (!u || isDemo(u.phone, u.fullName)) continue;
      const key = (u.phone || u.id).replace(/\D/g, '').slice(-10) || u.id;
      userMap.set(key, {
        userId: u.id,
        username: u.username || u.phone,
        fullName: u.fullName || u.phone,
        phone: u.phone,
        email: u.email,
        role: u.roleNameNepali || u.role || 'ग्राहक'
      });
    }

    // 2. Client Policies (Registered mobiles)
    for (const c of clientPolicies) {
      if (!c || isDemo(c.mobile, c.fullName)) continue;
      const key = (c.mobile || c.id).replace(/\D/g, '').slice(-10) || c.id;
      if (!userMap.has(key)) {
        userMap.set(key, {
          userId: c.id,
          username: c.loginId || c.mobile,
          fullName: c.fullName || c.mobile,
          phone: c.mobile,
          role: 'ग्राहक (Client)'
        });
      }
    }

    // 3. Existing Licenses with real users
    for (const l of licenses) {
      if (!l || isDemo(l.phone, l.fullName)) continue;
      const key = (l.phone || l.username || l.userId).replace(/\D/g, '').slice(-10) || l.userId;
      if (!userMap.has(key)) {
        userMap.set(key, {
          userId: l.userId,
          username: l.username,
          fullName: l.fullName || l.username,
          phone: l.phone,
          email: l.email,
          role: 'ग्राहक'
        });
      }
    }

    return Array.from(userMap.values());
  }, [dbUsers, clientPolicies, licenses]);

  // Helper to find license for user & serviceKey
  const getLicenseForUser = (userIdOrPhone: string, serviceKey: LockableServiceKey) => {
    const cleanDigits = userIdOrPhone.replace(/\D/g, '').slice(-10);
    const cleanId = userIdOrPhone.toLowerCase();
    return licenses.find((l) => {
      if (l.serviceKey !== serviceKey) return false;
      const lUserId = (l.userId || '').toLowerCase();
      const lUsername = (l.username || '').toLowerCase();
      const lPhone = (l.phone || '').replace(/\D/g, '').slice(-10);
      if (lUserId === cleanId || lUsername === cleanId) return true;
      if (cleanDigits.length >= 7 && lPhone === cleanDigits) return true;
      return false;
    });
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return unifiedUsers.filter((u) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = u.fullName.toLowerCase().includes(q);
        const matchesPhone = u.phone.includes(q);
        const matchesUser = u.username.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesUser) return false;
      }

      // Filter by service status
      if (filterServiceStatus !== 'all') {
        const jLic = getLicenseForUser(u.phone || u.userId, 'jyotish');
        const vLic = getLicenseForUser(u.phone || u.userId, 'vastu');
        const isJUnlocked = jLic?.status === 'unlocked' && (!jLic.expiresAtTimestamp || Date.now() <= jLic.expiresAtTimestamp);
        const isVUnlocked = vLic?.status === 'unlocked' && (!vLic.expiresAtTimestamp || Date.now() <= vLic.expiresAtTimestamp);

        if (filterServiceStatus === 'jyotish_unlocked' && !isJUnlocked) return false;
        if (filterServiceStatus === 'jyotish_locked' && isJUnlocked) return false;
        if (filterServiceStatus === 'vastu_unlocked' && !isVUnlocked) return false;
        if (filterServiceStatus === 'vastu_locked' && isVUnlocked) return false;
      }

      return true;
    });
  }, [unifiedUsers, searchQuery, filterServiceStatus, licenses]);

  // Handle Lock toggle
  const handleLockService = async (u: any, serviceKey: LockableServiceKey) => {
    if (!confirm(`के तपाईं निश्चित रूपमा ${u.fullName} को लागि ${serviceKey === 'jyotish' ? 'ज्योतिष सेवा' : 'वास्तु सेवा'} लक गर्न चाहनुहुन्छ?`)) {
      return;
    }

    const res = await mutateServiceLicense({
      action: 'lock',
      userId: u.userId,
      username: u.username,
      fullName: u.fullName,
      phone: u.phone,
      serviceKey,
      notes: 'Superadmin द्वारा लक गरियो'
    });

    if (res.success) {
      setActionSuccessMsg(res.message);
      setTimeout(() => setActionSuccessMsg(null), 4000);
      loadData();
    } else {
      alert(res.message);
    }
  };

  // Handle Confirm Unlock from Modal
  const handleConfirmUnlock = async () => {
    if (!unlockTarget) return;

    const ts = calculatePlanDurationTimestamps(selectedDuration);

    const res = await mutateServiceLicense({
      action: 'unlock',
      userId: unlockTarget.userId,
      username: unlockTarget.username,
      fullName: unlockTarget.fullName,
      phone: unlockTarget.phone,
      email: unlockTarget.email,
      serviceKey: unlockTarget.serviceKey,
      duration: selectedDuration,
      startsAtBS: ts.startsAtBS,
      expiresAtISO: ts.expiresAtISO,
      expiresAtBS: ts.expiresAtBS,
      expiresAtTimestamp: ts.expiresAtTimestamp,
      notes: unlockNotes || 'Superadmin द्वारा अनलक गरियो'
    });

    setUnlockTarget(null);
    setUnlockNotes('');

    if (res.success) {
      setActionSuccessMsg(res.message);
      setTimeout(() => setActionSuccessMsg(null), 4000);
      loadData();
    } else {
      alert(res.message);
    }
  };

  // Handle Purchase Request Action
  const handlePurchaseAction = async (requestId: string, action: 'approve' | 'reject') => {
    const actionText = action === 'approve' ? 'स्वीकृत गरी सेवा अनलक' : 'अस्वीकृत';
    if (!confirm(`के तपाईं यो आवेदन ${actionText} गर्न चाहनुहुन्छ?`)) return;

    const res = await actionPurchaseRequest(requestId, {
      action,
      duration: '1_year',
      adminNotes: action === 'approve' ? 'Superadmin द्वारा स्वीकृत गरियो' : 'Superadmin द्वारा अस्वीकृत गरियो'
    });

    if (res.success) {
      setActionSuccessMsg(res.message);
      setTimeout(() => setActionSuccessMsg(null), 4000);
      loadData();
    } else {
      alert(res.message);
    }
  };

  const pendingRequestsCount = purchaseRequests.filter((r) => r.requestStatus === 'pending').length;

  return (
    <div className="space-y-5 text-stone-900 dark:text-stone-100">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold font-serif">
              सेवा लाइसेन्स नियन्त्रण (Service Lock & Unlock Manager)
            </h2>
          </div>
          <p className="text-xs text-stone-400 max-w-2xl">
            प्रत्येक प्रयोगकर्ताका लागि <strong>ज्योतिष सेवा (Jyotish)</strong> र <strong>वास्तु सेवा (Vastu)</strong> स्वतन्त्र रूपमा लक वा अनलक गर्नुहोस्। एक प्रयोगकर्ताको अनलकले अर्को प्रयोगकर्तालाई असर गर्दैन।
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onNavigateToUsers && (
            <button
              type="button"
              onClick={() => onNavigateToUsers()}
              className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>← प्रयोगकर्ता व्यवस्थापन</span>
            </button>
          )}
          {onNavigateToSwitchboard && (
            <button
              type="button"
              onClick={() => onNavigateToSwitchboard()}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>मेनु स्विचबोर्ड</span>
            </button>
          )}
          {onNavigateToPayments && (
            <button
              type="button"
              onClick={() => onNavigateToPayments()}
              className="px-3 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-blue-400" />
              <span>भुक्तानी रुजु (eSewa)</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => { void loadData(); }}
            disabled={isLoading}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl border border-stone-700 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            <span>रिफ्रेस गर्नुहोस्</span>
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Primary Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`py-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'users'
              ? 'border-amber-500 text-amber-700 dark:text-amber-400'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
          }`}
        >
          <User className="w-4 h-4" />
          <span>प्रयोगकर्ता सेवा सूची ({unifiedUsers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`py-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer relative ${
            activeTab === 'requests'
              ? 'border-amber-500 text-amber-700 dark:text-amber-400'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>खरिद आवेदनहरू</span>
          {pendingRequestsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950">
              {pendingRequestsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`py-2 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'audit'
              ? 'border-amber-500 text-amber-700 dark:text-amber-400'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>अडिट लग ({auditLogs.length})</span>
        </button>
      </div>

      {/* ── TAB 1: USERS SERVICE LIST ── */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="प्रयोगकर्ताको नाम, मोबाइल वा युजरनेम खोज्नुहोस्..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterServiceStatus}
                onChange={(e) => setFilterServiceStatus(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
              >
                <option value="all">सबै प्रयोगकर्ता</option>
                <option value="jyotish_unlocked">ज्योतिष सेवा: अनलक मात्र</option>
                <option value="jyotish_locked">ज्योतिष सेवा: लक मात्र</option>
                <option value="vastu_unlocked">वास्तु सेवा: अनलक मात्र</option>
                <option value="vastu_locked">वास्तु सेवा: लक मात्र</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs bg-white dark:bg-stone-900">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 font-serif whitespace-nowrap">
                  <th className="p-3">१. User ID / ग्राहक</th>
                  <th className="p-3">२. सम्पर्क (Phone/Email)</th>
                  <th className="p-3">३. सफ्टवेयर नाम</th>
                  <th className="p-3">४. योजना / अवधि</th>
                  <th className="p-3">५. रकम</th>
                  <th className="p-3">६. भुक्तानी स्थिति</th>
                  <th className="p-3">७. स्वीकृति मिति</th>
                  <th className="p-3">८. सुरु मिति</th>
                  <th className="p-3">९. समाप्ति मिति</th>
                  <th className="p-3">१०. बाँकी दिन</th>
                  <th className="p-3">११. स्थिति</th>
                  <th className="p-3 text-right">१२. कार्यहरू</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-6 text-center text-stone-500 text-xs">
                      कुनै प्रयोगकर्ता वा लाइसेन्स रेकर्ड फेला परेन।
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const jLic = getLicenseForUser(u.phone || u.userId, 'jyotish');
                    const vLic = getLicenseForUser(u.phone || u.userId, 'vastu');
                    const primaryLic = jLic || vLic;

                    const isJUnlocked = jLic?.status === 'unlocked' && (!jLic.expiresAtTimestamp || Date.now() <= jLic.expiresAtTimestamp);
                    const isVUnlocked = vLic?.status === 'unlocked' && (!vLic.expiresAtTimestamp || Date.now() <= vLic.expiresAtTimestamp);
                    const isAnyUnlocked = isJUnlocked || isVUnlocked;

                    // Remaining days & expiry calculation
                    const isLifetime = primaryLic?.duration === 'lifetime';
                    const expTimestamp = primaryLic?.expiresAtTimestamp || (jLic?.expiresAtTimestamp || vLic?.expiresAtTimestamp);
                    const remainingDays = expTimestamp ? calculateRemainingDays(expTimestamp) : null;
                    const isExpired = expTimestamp ? isLicenseExpired(expTimestamp) : false;
                    const isExpiringIn30Days = remainingDays !== null && !isExpired && remainingDays <= 30;

                    // Plan name formatting
                    const planDurationLabel = isLifetime
                      ? 'आजीवन (Lifetime)'
                      : primaryLic?.duration === '5_years'
                      ? '५ वर्षको सदस्यता'
                      : primaryLic?.duration === '2_years'
                      ? '२ वर्षको सदस्यता'
                      : primaryLic?.duration === '6_months'
                      ? '६ महिना'
                      : primaryLic?.duration === '3_months'
                      ? '३ महिना'
                      : primaryLic?.duration === '1_month'
                      ? '१ महिना'
                      : '१ वर्षको सदस्यता';

                    const planAmount = primaryLic?.amountNPR || 2100;
                    const paymentMethod = primaryLic?.paymentMethod || 'eSewa';
                    const startsAtBS = primaryLic?.startsAtBS || '२०८१';
                    const expiresAtBS = isLifetime ? 'आजीवन' : (primaryLic?.expiresAtBS || '२०८२');
                    const expiresAtAD = primaryLic?.expiresAtISO ? primaryLic.expiresAtISO.split('T')[0] : (isLifetime ? 'Lifetime' : '-');

                    return (
                      <tr key={u.userId} className="hover:bg-stone-50 dark:hover:bg-stone-850/50 transition-colors whitespace-nowrap">
                        {/* 1. User ID & Customer Name */}
                        <td className="p-3 align-middle">
                          <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>{u.fullName}</span>
                          </div>
                          <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                            ID: {u.userId ? u.userId.slice(-8) : 'GUEST'} • {u.role}
                          </div>
                        </td>

                        {/* 2. Contact (Phone / Email) */}
                        <td className="p-3 align-middle text-[11px]">
                          <div className="flex items-center gap-1 font-mono text-stone-700 dark:text-stone-300">
                            <Phone className="w-3 h-3 text-stone-400" />
                            <span>{u.phone}</span>
                          </div>
                          {u.email && (
                            <div className="text-[10px] text-stone-400 truncate max-w-[140px]" title={u.email}>
                              {u.email}
                            </div>
                          )}
                        </td>

                        {/* 3. Software Name */}
                        <td className="p-3 align-middle text-xs">
                          <span className="font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1">
                            <Crown className="w-3.5 h-3.5 shrink-0" />
                            <span>नेपाली वैदिक ज्योतिष तथा वास्तु</span>
                          </span>
                        </td>

                        {/* 4. Plan & Duration */}
                        <td className="p-3 align-middle">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                            {planDurationLabel}
                          </span>
                        </td>

                        {/* 5. Amount */}
                        <td className="p-3 align-middle font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          रु. {toDevanagariNumerals(planAmount)}
                        </td>

                        {/* 6. Payment Status */}
                        <td className="p-3 align-middle">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            <span>रुजु भएको ({paymentMethod.toUpperCase()})</span>
                          </span>
                        </td>

                        {/* 7. Approval Date */}
                        <td className="p-3 align-middle font-mono text-[11px] text-stone-600 dark:text-stone-400">
                          {startsAtBS}
                        </td>

                        {/* 8. Start Date */}
                        <td className="p-3 align-middle font-mono text-[11px] text-stone-600 dark:text-stone-400">
                          {startsAtBS}
                        </td>

                        {/* 9. Expiry Date */}
                        <td className="p-3 align-middle font-mono text-[11px]">
                          <span className={isExpired ? 'text-rose-500 font-bold' : 'text-stone-700 dark:text-stone-300'}>
                            {expiresAtBS}
                          </span>
                          {expiresAtAD !== '-' && (
                            <div className="text-[10px] text-stone-400">{expiresAtAD}</div>
                          )}
                        </td>

                        {/* 10. Remaining Days */}
                        <td className="p-3 align-middle">
                          {isLifetime ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                              आजीवन
                            </span>
                          ) : isExpired ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40">
                              म्याद समाप्त
                            </span>
                          ) : isExpiringIn30Days ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 animate-pulse">
                              ⚠️ {toDevanagariNumerals(remainingDays || 0)} दिन बाँकी
                            </span>
                          ) : remainingDays !== null ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700">
                              {toDevanagariNumerals(remainingDays)} दिन बाँकी
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-400">-</span>
                          )}
                        </td>

                        {/* 11. Status */}
                        <td className="p-3 align-middle">
                          {isExpired ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>म्याद समाप्त</span>
                            </span>
                          ) : isExpiringIn30Days ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              <span>३० दिने चेतावनी</span>
                            </span>
                          ) : isAnyUnlocked ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <Unlock className="w-3 h-3 text-emerald-600" />
                              <span>सक्रिय लाइसेन्स</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border border-stone-300 dark:border-stone-700">
                              <Lock className="w-3 h-3 text-stone-500" />
                              <span>लक गरिएको</span>
                            </span>
                          )}
                        </td>

                        {/* 12. Actions */}
                        <td className="p-3 align-middle text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Renew / Unlock Button */}
                            <button
                              type="button"
                              onClick={() => setUnlockTarget({ ...u, serviceKey: 'jyotish' })}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer flex items-center gap-1"
                              title="लाइसेन्स अनलक वा नवीकरण गर्नुहोस्"
                            >
                              <Unlock className="w-3 h-3" />
                              <span>{isExpired ? 'नवीकरण' : isAnyUnlocked ? 'थप अवधि' : 'अनलक'}</span>
                            </button>

                            {/* Lock Button */}
                            {isAnyUnlocked && (
                              <button
                                type="button"
                                onClick={() => handleLockService(u, 'jyotish')}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded-lg text-[11px] font-bold border border-amber-300 dark:border-amber-800 cursor-pointer"
                                title="लाइसेन्स लक गर्नुहोस्"
                              >
                                🔒 लक
                              </button>
                            )}

                            {/* Interlink Quick Actions */}
                            <button
                              type="button"
                              onClick={() => onNavigateToSwitchboard?.(u.phone)}
                              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors cursor-pointer"
                              title="मेनु स्विचबोर्ड खोल्नुहोस्"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                            </button>
                            {onNavigateToPayments && (
                              <button
                                type="button"
                                onClick={() => onNavigateToPayments(u.phone)}
                                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
                                title="भुक्तानी तथा खरिद रुजुमा हेर्नुहोस्"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onNavigateToUsers?.(u.phone)}
                              className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors cursor-pointer"
                              title="प्रयोगकर्ता व्यवस्थापन तालिकामा हेर्नुहोस्"
                            >
                              <Users className="w-3.5 h-3.5 text-amber-400" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`के तपाईं निश्चित रूपमा ${u.fullName} (${u.phone}) को लाइसेन्स तथा प्रयोगकर्ता डेटा स्थायी रूपमा मेटाउन चाहनुहुन्छ?`)) {
                                  unifiedUserSyncService.deleteUserPermanently(u.userId, u.phone);
                                  setActionSuccessMsg(`प्रयोगकर्ता ${u.fullName} स्थायी रूपमा हटाइयो।`);
                                  setTimeout(() => setActionSuccessMsg(null), 3500);
                                  loadData();
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                              title="प्रयोगकर्ता तथा लाइसेन्स स्थायी रूपमा हटाउनुहोस्"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: PURCHASE REQUESTS ── */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs bg-white dark:bg-stone-900">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 font-serif">
                  <th className="p-3">अनुरोधकर्ता</th>
                  <th className="p-3">माग गरिएको सेवा</th>
                  <th className="p-3">योजना तथा रकम</th>
                  <th className="p-3">मिति & सन्देश</th>
                  <th className="p-3">स्थिति</th>
                  <th className="p-3 text-right">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {purchaseRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-stone-500 text-xs">
                      कुनै खरिद आवेदन प्राप्त भएको छैन।
                    </td>
                  </tr>
                ) : (
                  purchaseRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-stone-50 dark:hover:bg-stone-850/50 transition-colors">
                      <td className="p-3 align-middle">
                        <div className="font-bold text-stone-900 dark:text-stone-100">{req.fullName}</div>
                        <div className="text-[11px] text-stone-500">{req.phone} {req.email ? `• ${req.email}` : ''}</div>
                      </td>

                      <td className="p-3 align-middle">
                        <span className="font-bold text-amber-700 dark:text-amber-400">
                          {req.serviceTitleNepali}
                        </span>
                      </td>

                      <td className="p-3 align-middle">
                        <div>
                          <strong>{req.planDuration === 'lifetime' ? 'आजीवन (Lifetime)' : '१ वर्ष'}</strong>
                        </div>
                        <div className="text-[11px] text-stone-500">रु {req.amountNPR || 3500} ({req.paymentMethod})</div>
                      </td>

                      <td className="p-3 align-middle text-[11px] text-stone-600 dark:text-stone-400">
                        <div>{req.createdAtBS || req.createdAtISO?.split('T')[0]}</div>
                        {req.userMessage && <div className="italic text-stone-500 mt-0.5">"{req.userMessage}"</div>}
                      </td>

                      <td className="p-3 align-middle">
                        {req.requestStatus === 'pending' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
                            प्रतीक्षारत (Pending)
                          </span>
                        ) : req.requestStatus === 'approved' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300">
                            स्वीकृत (Approved)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300">
                            अस्वीकृत (Rejected)
                          </span>
                        )}
                      </td>

                      <td className="p-3 align-middle text-right">
                        {req.requestStatus === 'pending' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handlePurchaseAction(req.id, 'approve')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>स्वीकृत गर्नुहोस्</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePurchaseAction(req.id, 'reject')}
                              className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg text-xs cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: AUDIT LOGS ── */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs bg-white dark:bg-stone-900">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 font-serif">
                  <th className="p-3">समय</th>
                  <th className="p-3">कार्य</th>
                  <th className="p-3">प्रशासक</th>
                  <th className="p-3">लक्षित प्रयोगकर्ता</th>
                  <th className="p-3">सेवा</th>
                  <th className="p-3">विवरण</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-stone-500 text-xs">
                      कुनै अडिट लग छैन।
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50 dark:hover:bg-stone-850/50">
                      <td className="p-3 font-mono text-[11px] text-stone-500">
                        {log.timestampBS || log.timestampISO?.split('T')[0]}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.action === 'UNLOCK' || log.action === 'APPROVE_PURCHASE'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-stone-800 dark:text-stone-200">{log.performedBy}</td>
                      <td className="p-3 font-medium">{log.targetUsername || log.targetUserId}</td>
                      <td className="p-3 font-bold text-amber-700 dark:text-amber-400">
                        {log.serviceKey === 'jyotish' ? 'ज्योतिष सेवा' : 'वास्तु सेवा'}
                      </td>
                      <td className="p-3 text-stone-600 dark:text-stone-400">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unlock Duration Modal */}
      {unlockTarget && (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-amber-400/80">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2.5">
              <h3 className="font-bold text-base font-serif flex items-center gap-2">
                <Unlock className="w-5 h-5 text-emerald-600" />
                <span>
                  {unlockTarget.serviceKey === 'jyotish' ? 'ज्योतिष सेवा' : 'वास्तु सेवा'} अनलक गर्नुहोस्
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setUnlockTarget(null)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-xl text-xs space-y-1">
              <div>प्रयोगकर्ता: <strong>{unlockTarget.fullName}</strong></div>
              <div>मोबाइल: <strong>{unlockTarget.phone}</strong></div>
              <div>सेवा: <strong>{unlockTarget.serviceKey === 'jyotish' ? 'ज्योतिष सेवा (Jyotish Sewa)' : 'वास्तु सेवा (Vastu Sewa)'}</strong></div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">लाइसेन्स अवधि (License Duration):</label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 focus:ring-2 focus:ring-amber-500 font-sans"
              >
                <option value="trial">२४ घण्टा परीक्षण (24 Hours Trial)</option>
                <option value="1_month">१ महिना (1 Month Access)</option>
                <option value="3_months">३ महिना (3 Months Access)</option>
                <option value="6_months">६ महिना (6 Months Access)</option>
                <option value="1_year">१ वर्ष (1 Year Access)</option>
                <option value="2_years">२ वर्ष (2 Years Access)</option>
                <option value="5_years">५ वर्ष (5 Years Access)</option>
                <option value="lifetime">आजीवन (Lifetime Full Access)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">कैफियत / टिप्पणी (वैकल्पिक):</label>
              <input
                type="text"
                value={unlockNotes}
                onChange={(e) => setUnlockNotes(e.target.value)}
                placeholder="उदा. भुक्तानी प्राप्त भयो वा विशेष छुट..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setUnlockTarget(null)}
                className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={handleConfirmUnlock}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>अनलक सुरक्षित गर्नुहोस्</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
