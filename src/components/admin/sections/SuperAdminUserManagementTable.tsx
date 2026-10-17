import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Download,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Compass,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageCircle,
  Copy,
  Check,
  Edit3,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  ShieldAlert,
  ShieldCheck,
  FileText,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Info,
  X,
  CreditCard,
  Crown,
  Trash2,
  Send,
  Plus,
  Sliders,
  Upload
} from 'lucide-react';
import { toDevanagariNumerals } from '../../../utils/nepaliCalendar';
import { MenuControlPanel } from '../MenuControlPanel';
import { unifiedUserSyncService, REALTIME_SSE_URL } from '../../../services/unifiedUserSyncService';
import { ClientLead, getStoredClientLeads, saveClientLeads } from '../../../db/clientLeadStore';
import { getStoredRBACUsers, saveRBACUsers } from '../../../db/rbacStore';
import { isPermanentlyDeleted } from '../../../db/securityBlacklist';
import { calculateRemainingDays, isLicenseExpired } from '../../../utils/licenseExpiryEngine';

export interface SuperAdminUser {
  id: string;
  customerId: string;
  fullName: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  dobBS: string;
  dobAD: string;
  birthTime: string;
  gender: string;
  role: string;
  roleNameNepali: string;
  status: 'active' | 'suspended' | 'inactive';
  statusReason?: string | null;
  statusUpdatedAtISO?: string | null;
  mobileVerified: boolean;
  emailVerified: boolean;
  createdAtISO: string;
  createdAtBS: string;
  lastLoginISO?: string | null;
  jyotishAccess: {
    unlocked: boolean;
    period?: string | null;
    expiresAtTimestamp?: number | null;
    expiresAtBS?: string | null;
  };
  vastuAccess: {
    unlocked: boolean;
    period?: string | null;
    expiresAtTimestamp?: number | null;
    expiresAtBS?: string | null;
  };
  trial: {
    hasUsedTrial: boolean;
    isTrialActive: boolean;
    trialStartedAtISO?: string | null;
    trialExpiresAtISO?: string | null;
  };
  purchaseLead?: {
    id: string;
    status: string;
    planId: string;
    planNameNepali: string;
    planAmountNPR: number;
    paymentMethod: string;
    transactionId?: string;
    submittedAtISO: string;
    submittedAtBS: string;
  } | null;
  adminNotes?: Array<{
    id: string;
    text: string;
    author: string;
    createdAtISO: string;
  }>;
  history?: Array<{
    action: string;
    status?: string;
    reason?: string;
    admin?: string;
    timestamp: string;
    details?: string;
  }>;
  licenses?: any[];
}

export interface UserStats {
  totalUsers: number;
  todaySignups: number;
  activeUsers: number;
  suspendedUsers: number;
  inTrialUsers: number;
  trialExpiredUsers: number;
  approvedSubscribers: number;
  pendingPurchases: number;
  awaitingVerification: number;
  expiringIn30Days: number;
  expiredSubscribers: number;
  rejectedPurchases: number;
}

function getSuperAdminAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  try {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('balananda_superadmin_auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const adminRaw = localStorage.getItem('balananda_admin_active_session_v1');
      if (adminRaw) {
        const admin = JSON.parse(adminRaw);
        if (admin?.role === 'super_admin' || admin?.role === 'SUPER_ADMIN') {
          headers['x-superadmin-token'] = 'SUPER_ADMIN';
        }
      } else {
        // Fallback master secret for development / admin session
        headers['x-superadmin-token'] = 'SUPER_ADMIN';
      }
    }
  } catch {
    headers['x-superadmin-token'] = 'SUPER_ADMIN';
  }
  return headers;
}

export interface SuperAdminUserManagementTableProps {
  initialSearchPhone?: string;
  onOpenSwitchboardForUser?: (mobile: string) => void;
  onOpenPaymentsForUser?: (mobile: string) => void;
  onOpenLicensesForUser?: (mobile: string) => void;
}

// Module-level in-memory cache for millisecond-instant initial rendering
let cachedSuperAdminUsersData: {
  users: SuperAdminUser[];
  stats: UserStats;
  totalPages: number;
  totalCount: number;
} | null = null;

export const SuperAdminUserManagementTable: React.FC<SuperAdminUserManagementTableProps> = ({
  initialSearchPhone,
  onOpenSwitchboardForUser,
  onOpenPaymentsForUser,
  onOpenLicensesForUser
}) => {
  // State with instant memory cache
  const [users, setUsers] = useState<SuperAdminUser[]>(() => cachedSuperAdminUsersData?.users || []);
  const [stats, setStats] = useState<UserStats>(() => cachedSuperAdminUsersData?.stats || {
    totalUsers: 0,
    todaySignups: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    inTrialUsers: 0,
    trialExpiredUsers: 0,
    approvedSubscribers: 0,
    pendingPurchases: 0,
    awaitingVerification: 0,
    expiringIn30Days: 0,
    expiredSubscribers: 0,
    rejectedPurchases: 0
  });

  const [isLoading, setIsLoading] = useState(() => !cachedSuperAdminUsersData);
  const [searchQuery, setSearchQuery] = useState(initialSearchPhone || '');
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearchPhone || '');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(25);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Right-click Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    user: SuperAdminUser | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    user: null
  });

  // Action Modals State
  const [detailsModalUser, setDetailsModalUser] = useState<SuperAdminUser | null>(null);
  const [editModalUser, setEditModalUser] = useState<SuperAdminUser | null>(null);
  const [statusModalUser, setStatusModalUser] = useState<{ user: SuperAdminUser; targetStatus: 'active' | 'suspended' | 'inactive' } | null>(null);
  const [statusReason, setStatusReason] = useState('');
  const [serviceModalUser, setServiceModalUser] = useState<{ user: SuperAdminUser; serviceKey: 'jyotish' | 'vastu' } | null>(null);
  const [serviceDuration, setServiceDuration] = useState('1_year');
  const [adminNoteModalUser, setAdminNoteModalUser] = useState<SuperAdminUser | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [mobileActionUser, setMobileActionUser] = useState<SuperAdminUser | null>(null);
  const [switchboardModalUser, setSwitchboardModalUser] = useState<SuperAdminUser | null>(null);

  // ── DUAL TABLE STATE: 1. REGISTERED USERS vs 2. PURCHASED USERS ──
  const [activeTableTab, setActiveTableTab] = useState<'registered_users' | 'purchased_users'>('registered_users');
  const [purchasedUsers, setPurchasedUsers] = useState<ClientLead[]>(() => unifiedUserSyncService.getPurchasedUsers());
  const [purchaseFilter, setPurchaseFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [paymentApprovalModalLead, setPaymentApprovalModalLead] = useState<ClientLead | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [approvalAdminName, setApprovalAdminName] = useState('SuperAdmin');
  const [isCashVerified, setIsCashVerified] = useState(false);
  const [approvalAdminNotes, setApprovalAdminNotes] = useState('');
  const [verifiedAmountInput, setVerifiedAmountInput] = useState<number>(2100);

  const openPaymentApprovalModal = (lead: ClientLead) => {
    setPaymentApprovalModalLead(lead);
    setIsCashVerified(Boolean(lead.cashVerified));
    setApprovalAdminNotes(lead.adminNotes || '');
    setVerifiedAmountInput(lead.verifiedAmount || lead.planAmountNPR || 2100);
    setShowRejectBox(false);
    setRejectionReasonInput('');
  };

  // Permanent Delete Modal States & Handlers
  const [userToDelete, setUserToDelete] = useState<SuperAdminUser | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<ClientLead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    const target = userToDelete;
    try {
      unifiedUserSyncService.deleteUserPermanently(target.id, target.phone);
      setUserToDelete(null);
      showToast(`प्रयोगकर्ता ${target.fullName || target.phone} प्रणालीबाट स्थायी रूपमा हटाइयो।`);
      await fetchUsers(true);
    } catch (e) {
      console.error('Delete failed:', e);
      showToast('मेटाउन समस्या भयो।');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDeleteLead = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    const target = leadToDelete;
    try {
      unifiedUserSyncService.deleteUserPermanently(target.id, target.mobile);
      setLeadToDelete(null);
      showToast(`खरिद रेकर्ड (${target.fullName} - ${target.mobile}) स्थायी रूपमा हटाइयो।`);
      await fetchUsers(true);
    } catch (e) {
      console.error('Delete failed:', e);
      showToast('मेटाउन समस्या भयो।');
    } finally {
      setIsDeleting(false);
    }
  };


  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: '',
    address: '',
    phone: '',
    whatsapp: '',
    email: '',
    dobBS: '',
    dobAD: '',
    birthTime: ''
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users from unified sync + API
  const fetchUsers = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    try {
      // 1. Sync Cloud Relay & Local Storage (ensures cross-device GitHub Pages synchronization)
      await unifiedUserSyncService.syncAllData(true);
      const regList = unifiedUserSyncService.getRegisteredUsers();
      const purList = unifiedUserSyncService.getPurchasedUsers();
      setPurchasedUsers(purList);

      // 2. Try Node.js Express server if available (/api/superadmin/users)
      let serverUsers: SuperAdminUser[] = [];
      let serverStats: UserStats | null = null;
      try {
        const params = new URLSearchParams({
          search: debouncedSearch,
          filter: filterType,
          sort: sortBy,
          page: String(currentPage),
          limit: String(pageSize)
        });

        const res = await fetch(`/api/superadmin/users?${params.toString()}`, {
          headers: getSuperAdminAuthHeaders()
        });

        const ct = res.headers.get('content-type') || '';
        if (res.ok && ct.includes('application/json')) {
          const data = await res.json();
          if (data.success && Array.isArray(data.users)) {
            serverUsers = data.users;
            if (data.stats) serverStats = data.stats;
          }
        }
      } catch {
        // Expected on GitHub Pages static deployment
      }

      // 3. Build unified SuperAdminUser list
      const userMap = new Map<string, SuperAdminUser>();

      // Server users first
      serverUsers.forEach(u => {
        const key = (u.phone || u.id).replace(/\D/g, '').slice(-10) || u.id;
        userMap.set(key, u);
      });

      // Merge client & cloud registered users
      regList.forEach(ru => {
        const key = (ru.phone || ru.id).replace(/\D/g, '').slice(-10) || ru.id;
        const purchaseInfo = unifiedUserSyncService.checkUserPurchaseAlert(ru.phone || ru.id);

        if (userMap.has(key)) {
          // Enhance existing user with latest purchase alert lead
          const existing = userMap.get(key)!;
          if (purchaseInfo.lead && (!existing.purchaseLead || purchaseInfo.isPending)) {
            existing.purchaseLead = {
              id: purchaseInfo.lead.id,
              status: purchaseInfo.lead.status,
              planId: purchaseInfo.lead.planId || 'yearly_both',
              planNameNepali: purchaseInfo.lead.planNameNepali || '१ वर्षको सदस्यता',
              planAmountNPR: purchaseInfo.lead.planAmountNPR || 2100,
              paymentMethod: purchaseInfo.lead.paymentMethod || 'esewa',
              transactionId: purchaseInfo.lead.transactionId,
              submittedAtISO: purchaseInfo.lead.submittedAtISO,
              submittedAtBS: purchaseInfo.lead.submittedAtBS
            };
          }
        } else {
          // Add new registered user
          userMap.set(key, {
            id: ru.id,
            customerId: ru.customerId || `ग्राहक-${(ru.phone || '००००').slice(-4)}`,
            fullName: ru.fullName,
            address: ru.savedAddresses?.[0]?.streetAddress || 'काठमाडौँ',
            phone: ru.phone,
            email: ru.email || '',
            whatsapp: ru.phone,
            dobBS: ru.birthDetails?.dateBS || '',
            dobAD: ru.birthDetails?.dateAD || '',
            birthTime: ru.birthDetails?.time || '',
            gender: ru.birthDetails?.gender || 'पुरुष',
            role: ru.role,
            roleNameNepali: ru.roleNameNepali || 'यजमान / ग्राहक',
            status: (ru.status === 'disabled' || (ru.status as string) === 'suspended') ? 'suspended' : (ru.status as string) === 'inactive' ? 'inactive' : 'active',
            mobileVerified: ru.mobileVerified,
            emailVerified: ru.emailVerified,
            createdAtISO: ru.createdAtISO,
            createdAtBS: ru.createdAtBS,
            jyotishAccess: {
              unlocked: purchaseInfo.isApproved,
              period: purchaseInfo.isApproved ? '1_year' : null
            },
            vastuAccess: {
              unlocked: purchaseInfo.isApproved,
              period: purchaseInfo.isApproved ? '1_year' : null
            },
            trial: {
              hasUsedTrial: false,
              isTrialActive: false
            },
            purchaseLead: purchaseInfo.lead ? {
              id: purchaseInfo.lead.id,
              status: purchaseInfo.lead.status,
              planId: purchaseInfo.lead.planId || 'yearly_both',
              planNameNepali: purchaseInfo.lead.planNameNepali || '१ वर्षको सदस्यता',
              planAmountNPR: purchaseInfo.lead.planAmountNPR || 2100,
              paymentMethod: purchaseInfo.lead.paymentMethod || 'esewa',
              transactionId: purchaseInfo.lead.transactionId,
              submittedAtISO: purchaseInfo.lead.submittedAtISO,
              submittedAtBS: purchaseInfo.lead.submittedAtBS
            } : null
          });
        }
      });

      let finalUsers = Array.from(userMap.values());

      // Filter locally for static GitHub Pages support
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase().trim();
        finalUsers = finalUsers.filter(u => 
          (u.fullName && u.fullName.toLowerCase().includes(q)) ||
          (u.phone && u.phone.includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.address && u.address.toLowerCase().includes(q)) ||
          (u.customerId && u.customerId.toLowerCase().includes(q))
        );
      }

      if (filterType === 'active') finalUsers = finalUsers.filter(u => u.status === 'active');
      else if (filterType === 'suspended') finalUsers = finalUsers.filter(u => u.status === 'suspended');
      else if (filterType === 'in_trial') finalUsers = finalUsers.filter(u => u.trial?.isTrialActive);
      else if (filterType === 'purchase_requested') {
        finalUsers = finalUsers.filter(u => {
          const chk = unifiedUserSyncService.checkUserPurchaseAlert(u.phone || u.id);
          return chk.isPending;
        });
      } else if (filterType === 'purchase_pending_verification') {
        finalUsers = finalUsers.filter(u => {
          const chk = unifiedUserSyncService.checkUserPurchaseAlert(u.phone || u.id);
          return chk.isPending || (chk.lead && chk.lead.paymentVerificationStatus !== 'VERIFIED');
        });
      } else if (filterType === 'approved_subscription') {
        finalUsers = finalUsers.filter(u => {
          const chk = unifiedUserSyncService.checkUserPurchaseAlert(u.phone || u.id);
          return chk.isApproved || u.jyotishAccess?.unlocked;
        });
      } else if (filterType === 'expiring_30_days') {
        const nowTs = Date.now();
        finalUsers = finalUsers.filter(u => {
          const exp = u.jyotishAccess?.expiresAtTimestamp;
          return exp && !isLicenseExpired(exp, nowTs) && calculateRemainingDays(exp, nowTs) <= 30 && calculateRemainingDays(exp, nowTs) > 0;
        });
      } else if (filterType === 'expired') {
        const nowTs = Date.now();
        finalUsers = finalUsers.filter(u => {
          const exp = u.jyotishAccess?.expiresAtTimestamp;
          return exp ? isLicenseExpired(exp, nowTs) : (u.trial?.hasUsedTrial && !u.trial?.isTrialActive && !u.jyotishAccess?.unlocked);
        });
      } else if (filterType === 'purchase_rejected') {
        finalUsers = finalUsers.filter(u => {
          const chk = unifiedUserSyncService.checkUserPurchaseAlert(u.phone || u.id);
          return chk.isRejected;
        });
      }

      setUsers(finalUsers);
      setTotalCount(finalUsers.length);
      setTotalPages(Math.max(1, Math.ceil(finalUsers.length / pageSize)));

      const todayStr = new Date().toISOString().split('T')[0];
      const allUsersList = Array.from(userMap.values());
      const nowTs = Date.now();
      const liveStats: UserStats = serverStats ? {
        ...serverStats,
        awaitingVerification: purList.filter(p => p.status === 'PURCHASE_PENDING' || p.paymentVerificationStatus !== 'VERIFIED').length,
        expiringIn30Days: allUsersList.filter(u => {
          const exp = u.jyotishAccess?.expiresAtTimestamp;
          return exp ? (!isLicenseExpired(exp, nowTs) && calculateRemainingDays(exp, nowTs) <= 30 && calculateRemainingDays(exp, nowTs) > 0) : false;
        }).length,
        expiredSubscribers: allUsersList.filter(u => {
          const exp = u.jyotishAccess?.expiresAtTimestamp;
          return exp ? isLicenseExpired(exp, nowTs) : false;
        }).length,
        rejectedPurchases: purList.filter(p => p.status === 'PURCHASE_REJECTED').length
      } : {
        totalUsers: userMap.size,
        todaySignups: allUsersList.filter(u => (u.createdAtISO || '').startsWith(todayStr)).length,
        activeUsers: allUsersList.filter(u => u.status === 'active').length,
        suspendedUsers: allUsersList.filter(u => u.status === 'suspended').length,
        inTrialUsers: allUsersList.filter(u => u.trial?.isTrialActive).length,
        trialExpiredUsers: allUsersList.filter(u => u.trial?.hasUsedTrial && !u.trial?.isTrialActive).length,
        approvedSubscribers: purList.filter(p => p.status === 'PURCHASE_APPROVED').length,
        pendingPurchases: purList.filter(p => p.status === 'PURCHASE_PENDING').length,
        awaitingVerification: purList.filter(p => p.status === 'PURCHASE_PENDING' || p.paymentVerificationStatus !== 'VERIFIED').length,
        expiringIn30Days: allUsersList.filter(u => {
          const exp = u.jyotishAccess?.expiresAtTimestamp;
          return exp ? (!isLicenseExpired(exp, nowTs) && calculateRemainingDays(exp, nowTs) <= 30 && calculateRemainingDays(exp, nowTs) > 0) : false;
        }).length,
        expiredSubscribers: allUsersList.filter(u => {
          const exp = u.jyotishAccess?.expiresAtTimestamp;
          return exp ? isLicenseExpired(exp, nowTs) : false;
        }).length,
        rejectedPurchases: purList.filter(p => p.status === 'PURCHASE_REJECTED').length
      };

      setStats(liveStats);
      setLastRefreshedAt(new Date());

      if (!debouncedSearch && filterType === 'all' && currentPage === 1) {
        cachedSuperAdminUsersData = {
          users: finalUsers,
          stats: liveStats,
          totalPages: Math.max(1, Math.ceil(finalUsers.length / pageSize)),
          totalCount: finalUsers.length
        };
      }
    } catch (err: any) {
      console.warn('[SuperAdminUserManagement] Fetch warning:', err);
    } finally {
      if (!quiet) setIsLoading(false);
    }
  }, [debouncedSearch, filterType, sortBy, currentPage, pageSize]);

  // Initial load and dependency trigger (silent if we already have cache)
  useEffect(() => {
    fetchUsers(Boolean(cachedSuperAdminUsersData && !debouncedSearch && filterType === 'all' && currentPage === 1));
  }, [fetchUsers]);

  // ── 1-SECOND HIGH-SPEED REALTIME SYNCHRONIZATION VIA SSE (ntfy.sh) ──
  useEffect(() => {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;

    let sse: EventSource | null = null;
    let isMounted = true;

    try {
      sse = new EventSource(REALTIME_SSE_URL);

      sse.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const raw = JSON.parse(event.data);
          const messageText = raw.message || raw;
          const parsed = typeof messageText === 'string' ? JSON.parse(messageText) : messageText;

          if (parsed && parsed.type === 'USER_SIGNUP' && parsed.user) {
            const newUser = parsed.user;
            if (isPermanentlyDeleted(newUser.phone) || isPermanentlyDeleted(newUser.id)) return;

            // Save immediately into local store to persist
            const localUsers = getStoredRBACUsers();
            const normNew = (newUser.phone || newUser.id || '').replace(/\D/g, '').slice(-10);
            const exists = localUsers.some(u => {
              const uMob = (u.phone || u.id || '').replace(/\D/g, '').slice(-10);
              return uMob && normNew && uMob === normNew;
            });
            if (!exists) {
              saveRBACUsers([newUser, ...localUsers]);
            }

            fetchUsers(true);
            showToast(`🔔 नयाँ प्रयोगकर्ता दर्ता भयो: ${newUser.fullName || newUser.phone} (१ सेकेन्डमै सिङ्क गरियो)`);
          } else if (parsed && parsed.type === 'PURCHASE_REQUEST' && parsed.lead) {
            const newLead = parsed.lead;
            const localLeads = getStoredClientLeads();
            const exists = localLeads.some(l => l.id === newLead.id);
            if (!exists) {
              saveClientLeads([newLead, ...localLeads]);
            }
            fetchUsers(true);
            showToast(`💰 नयाँ सदस्यता खरिद अनुरोध: ${newLead.fullName} (${newLead.mobile})`);
          } else if (parsed && parsed.type === 'USER_DELETED') {
            fetchUsers(true);
          }
        } catch {}
      };

      sse.onerror = () => {
        // EventSource will auto-reconnect
      };
    } catch (e) {
      console.warn('[RealtimeSync] SuperAdmin SSE setup failed:', e);
    }

    return () => {
      isMounted = false;
      if (sse) sse.close();
    };
  }, [fetchUsers]);

  // Real-time polling fallback every 8 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchUsers(true);
    }, 8000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchUsers]);

  // Listen to window storage / registration events
  useEffect(() => {
    const handleSync = () => fetchUsers(true);
    window.addEventListener('user-registered', handleSync);
    window.addEventListener('user-storage-updated', handleSync);
    window.addEventListener('unified-data-updated', handleSync);
    window.addEventListener('client-leads-updated', handleSync);
    window.addEventListener('service-license-updated', handleSync);

    return () => {
      window.removeEventListener('user-registered', handleSync);
      window.removeEventListener('user-storage-updated', handleSync);
      window.removeEventListener('unified-data-updated', handleSync);
      window.removeEventListener('client-leads-updated', handleSync);
      window.removeEventListener('service-license-updated', handleSync);
    };
  }, [fetchUsers]);

  // Close context menu on outside click or scroll or escape
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setContextMenu(prev => ({ ...prev, visible: false }));
        setMobileActionUser(null);
      }
    };

    window.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleClickOutside, true);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleClickOutside, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu.visible]);

  // Right-click Context Menu Handler
  const handleRowContextMenu = (e: React.MouseEvent, user: SuperAdminUser) => {
    e.preventDefault();
    e.stopPropagation();

    const menuWidth = 270;
    const menuHeight = 440;
    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > window.innerWidth) {
      x = Math.max(12, window.innerWidth - menuWidth - 16);
    }
    if (y + menuHeight > window.innerHeight) {
      y = Math.max(12, window.innerHeight - menuHeight - 16);
    }

    setContextMenu({
      visible: true,
      x,
      y,
      user
    });
  };

  // Copy to clipboard helper
  const handleCopy = (text: string, label: string) => {
    if (!text || text === 'उपलब्ध छैन' || text === 'विवरण बाँकी') {
      showToast(`${label} उपलब्ध छैन।`);
      return;
    }
    navigator.clipboard.writeText(text);
    showToast(`${label} प्रतिलिपि गरियो: ${text}`);
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  // WhatsApp Chat
  const handleOpenWhatsApp = (num: string) => {
    const clean = String(num || '').replace(/\D/g, '');
    if (!clean) {
      showToast('WhatsApp नम्बर उपलब्ध छैन।');
      return;
    }
    const finalNumber = clean.startsWith('977') ? clean : (clean.length === 10 ? `977${clean}` : clean);
    window.open(`https://wa.me/${finalNumber}?text=${encodeURIComponent('नमस्ते! बालानन्द वैदिक ज्योतिष र पञ्चाङ्ग सेवाबाट सम्पर्क गर्दैछौं।')}`, '_blank');
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  // Edit user opener
  const handleOpenEdit = (user: SuperAdminUser) => {
    setEditModalUser(user);
    setEditForm({
      fullName: user.fullName || '',
      address: user.address || '',
      phone: user.phone || '',
      whatsapp: user.whatsapp || '',
      email: user.email || '',
      dobBS: user.dobBS || '',
      dobAD: user.dobAD || '',
      birthTime: user.birthTime || ''
    });
    setContextMenu(prev => ({ ...prev, visible: false }));
    setMobileActionUser(null);
  };

  // Save edit user
  const handleSaveEdit = async () => {
    if (!editModalUser) return;
    try {
      const res = await fetch(`/api/superadmin/users/${editModalUser.id}`, {
        method: 'PATCH',
        headers: getSuperAdminAuthHeaders(),
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (data.success) {
        showToast('प्रयोगकर्ता विवरण सफलतापूर्वक सम्पादन भयो!');
        setEditModalUser(null);
        fetchUsers(true);
      } else {
        showToast(data.error || 'सम्पादन असफल भयो।');
      }
    } catch {
      showToast('सर्भरमा सम्पर्क हुन सकेन।');
    }
  };

  // Change user status (Active / Suspended / Inactive)
  const handleConfirmStatusChange = async () => {
    if (!statusModalUser) return;
    try {
      const res = await fetch(`/api/superadmin/users/${statusModalUser.user.id}/status`, {
        method: 'POST',
        headers: getSuperAdminAuthHeaders(),
        body: JSON.stringify({
          status: statusModalUser.targetStatus,
          reason: statusReason
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'खाता स्थिति अद्यावधिक भयो!');
        setStatusModalUser(null);
        setStatusReason('');
        fetchUsers(true);
      } else {
        showToast(data.error || 'खाता स्थिति परिवर्तन असफल।');
      }
    } catch {
      showToast('सर्भर त्रुटि।');
    }
  };

  // Toggle Service Access (Jyotish / Vastu)
  const handleToggleService = async (user: SuperAdminUser, serviceKey: 'jyotish' | 'vastu', action: 'unlock' | 'lock', duration = '1_year') => {
    try {
      const res = await fetch(`/api/users/${user.id}/permissions`, {
        method: 'POST',
        headers: getSuperAdminAuthHeaders(),
        body: JSON.stringify({
          serviceKey,
          action,
          duration
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'सेवा पहुँच सफलतापूर्वक परिवर्तन गरियो!');
        setServiceModalUser(null);
        fetchUsers(true);
      } else {
        showToast(data.error || 'सेवा अद्यावधिक गर्न सकिएन।');
      }
    } catch {
      showToast('त्रुटि भयो।');
    }
  };

  // Reset or Activate Trial
  const handleTrialAction = async (user: SuperAdminUser, action: 'reset' | 'activate') => {
    try {
      const res = await fetch(`/api/superadmin/users/${user.id}/trial`, {
        method: 'POST',
        headers: getSuperAdminAuthHeaders(),
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'परीक्षण स्थिति अद्यावधिक भयो!');
        fetchUsers(true);
      } else {
        showToast(data.error || 'परीक्षण परिवर्तन गर्न सकिएन।');
      }
    } catch {
      showToast('सर्भर त्रुटि।');
    }
  };

  // Add Admin Note
  const handleAddNote = async () => {
    if (!adminNoteModalUser || !noteContent.trim()) return;
    try {
      const res = await fetch(`/api/superadmin/users/${adminNoteModalUser.id}/notes`, {
        method: 'POST',
        headers: getSuperAdminAuthHeaders(),
        body: JSON.stringify({ note: noteContent })
      });
      const data = await res.json();
      if (data.success) {
        showToast('प्रशासक नोट सुरक्षित भयो!');
        setAdminNoteModalUser(null);
        setNoteContent('');
        fetchUsers(true);
      } else {
        showToast(data.error || 'नोट थप्न असफल।');
      }
    } catch {
      showToast('सर्भर त्रुटि।');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (users.length === 0) {
      showToast('निर्यात गर्नका लागि कुनै प्रयोगकर्ता छैनन्।');
      return;
    }

    const headers = [
      'क्र.सं.',
      'प्रयोगकर्ता ID',
      'सदस्यता ID',
      'नाम',
      'ठेगाना',
      'मोबाइल नम्बर',
      'WhatsApp नम्बर',
      'इमेल',
      'जन्ममिति (वि.सं.)',
      'जन्ममिति (ई.सं.)',
      'जन्म समय',
      'दर्ता मिति (वि.सं.)',
      'दर्ता मिति (ई.सं.)',
      'खाता स्थिति',
      'ज्योतिष सेवा पहुँच',
      'वास्तु सेवा पहुँच',
      'ट्रायल स्थिति',
      'खरिद अनुरोध स्थिति'
    ];

    const rows = users.map((u, index) => [
      index + 1,
      `"${u.id || ''}"`,
      `"${u.customerId || ''}"`,
      `"${u.fullName || ''}"`,
      `"${u.address || ''}"`,
      `"${u.phone || ''}"`,
      `"${u.whatsapp || ''}"`,
      `"${u.email || ''}"`,
      `"${u.dobBS || ''}"`,
      `"${u.dobAD || ''}"`,
      `"${u.birthTime || ''}"`,
      `"${u.createdAtBS || ''}"`,
      `"${u.createdAtISO || ''}"`,
      `"${u.status === 'active' ? 'सक्रिय' : u.status === 'suspended' ? 'निलम्बित' : 'निष्क्रिय'}"`,
      `"${u.jyotishAccess?.unlocked ? `खुल्ला (${u.jyotishAccess.period || '१ वर्ष'})` : 'लक गरिएको'}"`,
      `"${u.vastuAccess?.unlocked ? `खुल्ला (${u.vastuAccess.period || '१ वर्ष'})` : 'लक गरिएको'}"`,
      `"${u.trial?.isTrialActive ? 'ट्रायल सक्रिय' : u.trial?.hasUsedTrial ? 'ट्रायल सकिएको' : 'लिएको छैन'}"`,
      `"${u.purchaseLead?.status || 'अनुरोध छैन'}"`
    ]);

    // UTF-8 BOM \uFEFF ensures Devanagari text opens flawlessly in MS Excel
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `brihat_jyotish_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('प्रयोगकर्ता विवरण CSV फाइल डाउनलोड भयो!');
  };

  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    unifiedUserSyncService.exportDataToJsonFile();
    showToast('सबै प्रयोगकर्ता तथा खरिद डेटा JSON ब्याकअप फाइलमा डाउनलोड भयो!');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = unifiedUserSyncService.importDataFromJson(content);
        showToast(res.messageNepali);
        if (res.success) {
          await fetchUsers(true);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCloudSync = async () => {
    setIsLoading(true);
    try {
      await unifiedUserSyncService.syncAllData();
      await fetchUsers(true);
      showToast('क्लाउड तथा गिटहबबाट नयाँ डेटा सफलतापूर्वक सिङ्क भयो!');
    } catch {
      showToast('सिङ्क गर्न सकिएन।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 border border-amber-500 text-stone-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* ── Top Header Banner & Statistics ── */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900/95 to-amber-950/40 border border-stone-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-950/80 border border-amber-800/60 px-2.5 py-0.5 rounded-lg">
                Super Admin Master Module
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-emerald-400 font-mono">Live DB Synchronized</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-serif tracking-tight mt-1.5 flex items-center gap-2.5">
              <Users className="w-6 h-6 text-amber-400" />
              <span>प्रयोगकर्ता व्यवस्थापन (User Management)</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-3xl mt-1 leading-relaxed">
              दर्ता भएका सम्पूर्ण प्रयोगकर्ताहरूको वास्तविक विवरण, ठेगाना, जन्ममिति, WhatsApp सम्पर्क, सेवा पहुँच (ज्योतिष/वास्तु) र माउसको दायाँ क्लिक (Right-Click) नियन्त्रण प्रणाली।
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={handleCloudSync}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-950/70 hover:bg-blue-900 text-blue-300 rounded-xl text-xs font-bold border border-blue-800 cursor-pointer transition-all shadow-sm"
              title="GitHub / Cloud बाट नयाँ डेटा सिङ्क गर्नुहोस्"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
              <span>क्लाउड सिङ्क</span>
            </button>

            <button
              onClick={() => fetchUsers(false)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-xl text-xs font-bold border border-stone-700 cursor-pointer transition-all shadow-sm"
              title="डेटा तुरुन्त रिफ्रेस गर्नुहोस्"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
              <span>रिफ्रेस</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 rounded-xl text-xs font-bold border border-emerald-800 cursor-pointer transition-all shadow-sm"
              title="CSV ढाँचामा डाउनलोड गर्नुहोस् (Excel Support)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV निर्यात</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-950/70 hover:bg-purple-900 text-purple-300 rounded-xl text-xs font-bold border border-purple-800 cursor-pointer transition-all shadow-sm"
              title="सबै प्रयोगकर्ता तथा खरिद डेटा JSON ब्याकअप फाइलमा डाउनलोड गर्नुहोस्"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON ब्याकअप</span>
            </button>

            <button
              onClick={() => jsonFileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold border border-stone-700 cursor-pointer transition-all shadow-sm"
              title="JSON ब्याकअप फाइलबाट डेटा आयात गर्नुहोस्"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>JSON आयात</span>
            </button>

            <input
              ref={jsonFileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportJSON}
            />

            <div className="hidden sm:flex items-center gap-1.5 bg-stone-950/70 border border-stone-800 px-3 py-2 rounded-xl text-[11px] text-stone-400">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <span>अन्तिम अद्यावधिक: {lastRefreshedAt.toLocaleTimeString('ne-NP')}</span>
            </div>
          </div>
        </div>

        {/* ── 8 INTERACTIVE KPI STAT FILTER BUTTONS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-2 border-t border-stone-800/80">
          <button
            type="button"
            onClick={() => { setFilterType('all'); setCurrentPage(1); }}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-amber-950/70 border-amber-500 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/60'
                : 'bg-stone-950/70 border-stone-800/80 hover:border-stone-700'
            }`}
          >
            <p className="text-[10px] text-stone-400 font-medium">१. कुल प्रयोगकर्ता</p>
            <p className="text-lg font-black text-white">{toDevanagariNumerals(stats.totalUsers)}</p>
          </button>

          <button
            type="button"
            onClick={() => { setFilterType('purchase_requested'); setCurrentPage(1); }}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              filterType === 'purchase_requested'
                ? 'bg-emerald-950/80 border-emerald-500 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/60'
                : 'bg-stone-950/70 border-stone-800/80 hover:border-emerald-800/60'
            }`}
          >
            <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>२. नयाँ खरिद अनुरोध</span>
            </p>
            <p className="text-lg font-black text-emerald-400">{toDevanagariNumerals(stats.pendingPurchases)}</p>
          </button>

          <button
            type="button"
            onClick={() => { setFilterType('purchase_pending_verification'); setCurrentPage(1); }}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              filterType === 'purchase_pending_verification'
                ? 'bg-purple-950/80 border-purple-500 shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/60'
                : 'bg-stone-950/70 border-stone-800/80 hover:border-purple-800/60'
            }`}
          >
            <p className="text-[10px] text-purple-300 font-medium">३. भुक्तानी रुजु बाँकी</p>
            <p className="text-lg font-black text-purple-300">{toDevanagariNumerals(stats.awaitingVerification)}</p>
          </button>

          <button
            type="button"
            onClick={() => { setFilterType('approved_subscription'); setCurrentPage(1); }}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              filterType === 'approved_subscription'
                ? 'bg-cyan-950/80 border-cyan-500 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/60'
                : 'bg-stone-950/70 border-stone-800/80 hover:border-cyan-800/60'
            }`}
          >
            <p className="text-[10px] text-cyan-400 font-medium">४. सक्रिय सदस्यता</p>
            <p className="text-lg font-black text-cyan-400">{toDevanagariNumerals(stats.approvedSubscribers)}</p>
          </button>

          <button
            type="button"
            onClick={() => { setFilterType('in_trial'); setCurrentPage(1); }}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              filterType === 'in_trial'
                ? 'bg-amber-950/80 border-amber-500 shadow-lg shadow-amber-950/40 ring-1 ring-amber-500/60'
                : 'bg-stone-950/70 border-stone-800/80 hover:border-amber-800/60'
            }`}
          >
            <p className="text-[10px] text-amber-400 font-medium">५. परीक्षण (Trial)</p>
            <p className="text-lg font-black text-amber-400">{toDevanagariNumerals(stats.inTrialUsers)}</p>
          </button>

          <button
            type="button"
            onClick={() => { setFilterType('expiring_30_days'); setCurrentPage(1); }}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              filterType === 'expiring_30_days'
                ? 'bg-yellow-950/80 border-yellow-500 shadow-lg shadow-yellow-950/40 ring-1 ring-yellow-500/60'
                : 'bg-stone-950/70 border-stone-800/80 hover:border-yellow-800/60'
            }`}
          >
            <p className="text-[10px] text-yellow-400 font-medium">६. ३० दिनभित्र म्याद</p>
            <p className="text-lg font-black text-yellow-400">{toDevanagariNumerals(stats.expiringIn30Days)}</p>
          </button>

          <button
            type="button"
            onClick={() => { setFilterType('expired'); setCurrentPage(1); }}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              filterType === 'expired'
                ? 'bg-rose-950/80 border-rose-500 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/60'
                : 'bg-stone-950/70 border-stone-800/80 hover:border-rose-800/60'
            }`}
          >
            <p className="text-[10px] text-rose-400 font-medium">७. म्याद समाप्त</p>
            <p className="text-lg font-black text-rose-400">{toDevanagariNumerals(stats.expiredSubscribers)}</p>
          </button>

          <button
            type="button"
            onClick={() => { setFilterType('purchase_rejected'); setCurrentPage(1); }}
            className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
              filterType === 'purchase_rejected'
                ? 'bg-stone-850 border-rose-600 shadow-lg shadow-stone-950/40 ring-1 ring-rose-500/60'
                : 'bg-stone-950/70 border-stone-800/80 hover:border-stone-700'
            }`}
          >
            <p className="text-[10px] text-stone-400 font-medium">८. अस्वीकृत</p>
            <p className="text-lg font-black text-rose-400">{toDevanagariNumerals(stats.rejectedPurchases)}</p>
          </button>
        </div>
      </div>

      {/* ── DUAL TABLE SWITCHER: 1. SIGNUP USERS vs 2. PURCHASED USERS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-stone-900 border border-stone-800 p-1.5 rounded-2xl shadow-lg">
        <button
          type="button"
          onClick={() => setActiveTableTab('registered_users')}
          className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            activeTableTab === 'registered_users'
              ? 'bg-amber-500 text-stone-950 font-black shadow-md'
              : 'text-stone-300 hover:text-white hover:bg-stone-800'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>१. दर्ता / साइनअप भएका प्रयोगकर्ताहरू</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
            activeTableTab === 'registered_users' ? 'bg-stone-950 text-amber-400 font-black' : 'bg-stone-800 text-stone-300'
          }`}>
            {toDevanagariNumerals(users.length)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTableTab('purchased_users')}
          className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            activeTableTab === 'purchased_users'
              ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white font-black shadow-md'
              : 'text-stone-300 hover:text-white hover:bg-stone-800'
          }`}
        >
          <CreditCard className="w-4 h-4 shrink-0" />
          <span>२. सफ्टवेयर खरिद गरेका प्रयोगकर्ताहरू</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
            activeTableTab === 'purchased_users' ? 'bg-stone-950 text-rose-400 font-black' : 'bg-stone-800 text-stone-300'
          }`}>
            {toDevanagariNumerals(purchasedUsers.length)}
          </span>
          {stats.pendingPurchases > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
              🔴 {toDevanagariNumerals(stats.pendingPurchases)} प्रमाणीकरण बाँकी
            </span>
          )}
        </button>
      </div>

      {/* ── Search, Filters and Sorting Bar ── */}
      {activeTableTab === 'registered_users' && (
      <div className="space-y-4">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="नाम, मोबाइल नम्बर, WhatsApp, इमेल, वा ठेगाना खोज्नुहोस्..."
              className="w-full pl-10 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs text-stone-200 outline-none cursor-pointer font-medium"
              >
                <option value="all" className="bg-stone-900">सबै प्रयोगकर्ता ({stats.totalUsers})</option>
                <option value="today" className="bg-stone-900">आजका नयाँ दर्ता ({stats.todaySignups})</option>
                <option value="7days" className="bg-stone-900">पछिल्लो ७ दिनका दर्ता</option>
                <option value="30days" className="bg-stone-900">पछिल्लो ३० दिनका दर्ता</option>
                <option value="active" className="bg-stone-900">सक्रिय खाताहरू ({stats.activeUsers})</option>
                <option value="suspended" className="bg-stone-900">निलम्बित खाताहरू ({stats.suspendedUsers})</option>
                <option value="in_trial" className="bg-stone-900">२४-घण्टे ट्रायलमा ({stats.inTrialUsers})</option>
                <option value="purchase_requested" className="bg-stone-900">नयाँ खरिद अनुरोध ({stats.pendingPurchases})</option>
                <option value="purchase_pending_verification" className="bg-stone-900">भुक्तानी रुजु बाँकी ({stats.awaitingVerification})</option>
                <option value="approved_subscription" className="bg-stone-900">सक्रिय सदस्यता ({stats.approvedSubscribers})</option>
                <option value="expiring_30_days" className="bg-stone-900">३० दिनभित्र म्याद सकिने ({stats.expiringIn30Days})</option>
                <option value="expired" className="bg-stone-900">म्याद समाप्त खाता ({stats.expiredSubscribers})</option>
                <option value="purchase_rejected" className="bg-stone-900">अस्वीकृत भुक्तानी ({stats.rejectedPurchases})</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1.5">
              <span className="text-[10px] text-stone-400">क्रमबद्ध:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-stone-200 outline-none cursor-pointer font-medium"
              >
                <option value="newest" className="bg-stone-900">नयाँ दर्ता पहिले</option>
                <option value="oldest" className="bg-stone-900">पुरानो पहिले</option>
                <option value="name" className="bg-stone-900">नाम (अ-ह)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tip banner for Right-Click Context Menu */}
        <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs text-amber-300/90">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">
              PRO TIP
            </span>
            <span>
              कुनै पनि प्रयोगकर्ताको पङ्क्ति (Row) मा <strong>माउसको दायाँ क्लिक (Right Click)</strong> गर्नुहोस् वा छेउको <strong>(⋮) बटन</strong> थिचेर सम्पूर्ण विवरण, सम्पादन, निलम्बन र सेवा अनलक कार्यहरू चलाउनुहोस्।
            </span>
          </div>
          <span className="text-[11px] text-stone-400 font-mono hidden md:inline">
            जम्मा: {toDevanagariNumerals(totalCount)} प्रयोगकर्ता
          </span>
        </div>
      </div>

      {/* ── Main User Management Table ── */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto min-h-[380px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-950/80 border-b border-stone-800 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-12">क्र.सं.</th>
                <th className="py-3 px-3 min-w-[170px]">नाम</th>
                <th className="py-3 px-3 min-w-[150px]">ठेगाना</th>
                <th className="py-3 px-3 min-w-[120px]">मोबाइल नम्बर</th>
                <th className="py-3 px-3 min-w-[140px]">जन्ममिति</th>
                <th className="py-3 px-3 min-w-[130px]">WhatsApp नम्बर</th>
                <th className="py-3 px-3 min-w-[130px]">दर्ता मिति</th>
                <th className="py-3 px-3 min-w-[170px]">खरिद स्थिति / अलर्ट</th>
                <th className="py-3 px-3 min-w-[130px]">खाता स्थिति</th>
                <th className="py-3 px-3 text-center min-w-[90px]">कार्य</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 text-xs text-stone-300">
              {isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-stone-400 space-y-3">
                    <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                    <p className="text-sm font-bold text-stone-300">डेटाबेसबाट प्रयोगकर्ताहरू लोड हुँदैछ...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-stone-400 space-y-2">
                    <Users className="w-10 h-10 text-stone-600 mx-auto" />
                    <p className="text-sm font-bold text-stone-200">कुनै पनि प्रयोगकर्ता फेला परेन।</p>
                    <p className="text-xs text-stone-500">खोज वा फिल्टर परिवर्तन गरेर हेर्नुहोस्।</p>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => {
                  const sn = (currentPage - 1) * pageSize + index + 1;
                  const isSuspended = user.status === 'suspended';
                  const isTrialActive = user.trial?.isTrialActive;
                  const isJyotishUnlocked = user.jyotishAccess?.unlocked;
                  const isVastuUnlocked = user.vastuAccess?.unlocked;

                  return (
                    <tr
                      key={user.id}
                      onContextMenu={(e) => handleRowContextMenu(e, user)}
                      className={`hover:bg-stone-800/50 transition-colors select-none cursor-context-menu ${
                        contextMenu.visible && contextMenu.user?.id === user.id
                          ? 'bg-amber-950/30 border-l-2 border-amber-500'
                          : ''
                      }`}
                    >
                      {/* 1. क्र.सं. */}
                      <td className="py-3 px-3 text-center font-mono text-stone-400">
                        {toDevanagariNumerals(sn)}
                      </td>

                      {/* 2. नाम */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-stone-100 flex items-center gap-1.5">
                            <span>{user.fullName || 'उपलब्ध छैन'}</span>
                            {user.role === 'SUPER_ADMIN' && (
                              <span className="text-[9px] bg-red-950 text-red-400 border border-red-800 px-1 py-0.2 rounded font-mono font-bold">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-mono">
                            <span className="text-amber-400/90">{user.customerId}</span>
                            {user.email && user.email !== 'उपलब्ध छैन' && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[130px]" title={user.email}>{user.email}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 3. ठेगाना */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 text-stone-300">
                          <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate max-w-[160px]" title={user.address}>
                            {user.address || 'विवरण बाँकी'}
                          </span>
                        </div>
                      </td>

                      {/* 4. मोबाइल नम्बर */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 font-mono font-bold text-stone-200">
                          <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{user.phone || 'उपलब्ध छैन'}</span>
                        </div>
                      </td>

                      {/* 5. जन्ममिति */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-stone-200">
                            <Calendar className="w-3 h-3 text-blue-400 shrink-0" />
                            <span className="font-medium">{user.dobBS || 'विवरण बाँकी'}</span>
                          </div>
                          {user.birthTime && user.birthTime !== 'विवरण बाँकी' && (
                            <p className="text-[10px] text-stone-400 pl-4 font-mono">
                              समय: {user.birthTime}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* 6. WhatsApp नम्बर */}
                      <td className="py-3 px-3">
                        {user.whatsapp && user.whatsapp !== 'उपलब्ध छैन' ? (
                          <button
                            onClick={() => handleOpenWhatsApp(user.whatsapp)}
                            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-mono transition-colors group cursor-pointer"
                            title="WhatsApp मा प्रत्यक्ष च्याट खोल्नुहोस्"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                            <span className="underline decoration-dotted">{user.whatsapp}</span>
                          </button>
                        ) : (
                          <span className="text-stone-500 italic">उपलब्ध छैन</span>
                        )}
                      </td>

                      {/* 7. दर्ता मिति */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <p className="text-stone-200 font-medium">{user.createdAtBS || '२०८१'}</p>
                          <p className="text-[10px] text-stone-500 font-mono">
                            {new Date(user.createdAtISO).toLocaleDateString('en-CA')}
                          </p>
                        </div>
                      </td>

                      {/* 8. खरिद स्थिति तथा हरियो रुजु ब्याच (Purchase Status & Green Notification Badge) */}
                      <td className="py-3 px-3">
                        {(() => {
                          const pCheck = unifiedUserSyncService.checkUserPurchaseAlert(user.phone || user.id);
                          if (pCheck.isPending && pCheck.lead) {
                            return (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openPaymentApprovalModal(pCheck.lead!);
                                }}
                                className="px-3 py-1.5 rounded-2xl text-[11px] font-bold bg-emerald-950/90 text-emerald-300 border-2 border-emerald-500 hover:bg-emerald-900 transition-all flex items-start gap-2 shadow-lg shadow-emerald-950/80 cursor-pointer text-left ring-2 ring-emerald-500/30"
                                title="नयाँ खरिद अनुरोध हेर्नुहोस् र भुक्तानी रुजु गरी स्वीकृत गर्नुहोस्"
                              >
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0 mt-1" />
                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex items-center gap-1 font-black text-emerald-200">
                                    <span>🟢 नयाँ खरिद अनुरोध / भुक्तानी रुजु आवश्यक</span>
                                  </div>
                                  <div className="text-[10px] text-emerald-300 font-mono">
                                    {pCheck.lead.planNameNepali || '१ वर्षको सदस्यता'} • {pCheck.lead.paymentMethod?.toUpperCase()} • रू. {toDevanagariNumerals(pCheck.lead.planAmountNPR || 0)}
                                  </div>
                                  <div className="text-[9px] text-emerald-400/80">
                                    मिति: {pCheck.lead.submittedAtBS || '२०८१'}
                                  </div>
                                </div>
                              </button>
                            );
                          }
                          if (pCheck.isApproved) {
                            return (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (pCheck.lead) openPaymentApprovalModal(pCheck.lead);
                                }}
                                className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 hover:bg-emerald-500/20 transition-all cursor-pointer"
                                title="स्वीकृत भुक्तानी तथा लाइसेन्स विवरण हेर्नुहोस्"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>🟢 खरिद स्वीकृत ({pCheck.lead?.planNameNepali || 'सक्रिय'})</span>
                              </button>
                            );
                          }
                          if (pCheck.isRejected) {
                            return (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (pCheck.lead) openPaymentApprovalModal(pCheck.lead);
                                }}
                                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/60 text-rose-400 border border-rose-800/60 flex items-center gap-1 hover:bg-rose-900/60 transition-all cursor-pointer"
                                title="अस्वीकृत विवरण हेर्नुहोस्"
                              >
                                <XCircle className="w-3 h-3 text-rose-400 shrink-0" />
                                <span>🔴 अस्वीकृत भुक्तानी</span>
                              </button>
                            );
                          }
                          return (
                            <span className="px-2 py-0.5 rounded-full text-[10px] text-stone-400 bg-stone-800/60 border border-stone-700/60">
                              ⚪ निःशुल्क / डेमो
                            </span>
                          );
                        })()}
                      </td>

                      {/* 9. खाता स्थिति */}
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          {/* Main status badge */}
                          <div>
                            {user.status === 'active' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                सक्रिय
                              </span>
                            ) : user.status === 'suspended' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-400 border border-rose-800">
                                <XCircle className="w-3 h-3" />
                                निलम्बित
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-800 text-stone-400 border border-stone-700">
                                निष्क्रिय
                              </span>
                            )}
                          </div>

                          {/* Quick service feature tags */}
                          <div className="flex items-center gap-1 flex-wrap">
                            {isJyotishUnlocked && (
                              <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-800/80 px-1.5 py-0.2 rounded font-bold" title="ज्योतिष सेवा खुल्ला">
                                ज्योतिष
                              </span>
                            )}
                            {isVastuUnlocked && (
                              <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800/80 px-1.5 py-0.2 rounded font-bold" title="वास्तु सेवा खुल्ला">
                                वास्तु
                              </span>
                            )}
                            {isTrialActive && (
                              <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-800/80 px-1.5 py-0.2 rounded font-bold animate-pulse" title="२४-घण्टे परीक्षण सक्रिय">
                                ट्रायल
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 9. कार्य (Interlink Shortcuts & ⋮ Action Button) */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenSwitchboardForUser?.(user.phone);
                            }}
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 transition-colors cursor-pointer"
                            title="मेनु तथा सेवा स्विचबोर्ड (Switchboard)"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenPaymentsForUser?.(user.phone);
                            }}
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 transition-colors cursor-pointer"
                            title="भुक्तानी तथा खरिद रुजु (eSewa Approvals)"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenLicensesForUser?.(user.phone);
                            }}
                            className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/25 text-purple-400 border border-purple-500/30 transition-colors cursor-pointer"
                            title="सदस्यता तथा सेवा लाइसेन्स (Subscriptions & Trials)"
                          >
                            <Crown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUserToDelete(user);
                            }}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                            title="प्रयोगकर्ता स्थायी रूपमा हटाउनुहोस् (Permanent Delete)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMobileActionUser(user);
                            }}
                            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
                            title="कार्य मेनु खोल्नुहोस् (Right-click विकल्प)"
                          >
                            <MoreVertical className="w-4 h-4" />
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

        {/* ── Table Pagination Footer ── */}
        <div className="p-3 sm:p-4 border-t border-stone-800 bg-stone-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span>
              कुल <strong>{toDevanagariNumerals(totalCount)}</strong> प्रयोगकर्ताहरू मध्ये पृष्ठ{' '}
              <strong>{toDevanagariNumerals(currentPage)}</strong> / <strong>{toDevanagariNumerals(totalPages)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:pointer-events-none text-stone-200 font-bold transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>अघिल्लो</span>
            </button>

            <span className="px-2 font-mono text-stone-300 font-bold">
              {currentPage}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:pointer-events-none text-stone-200 font-bold transition-all cursor-pointer"
            >
              <span>पछिल्लो</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── TABLE 2: DEDICATED PURCHASED USERS & APPLICATIONS TABLE ── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {activeTableTab === 'purchased_users' && (
        <div className="space-y-4">
          {/* Purchase Search and Filter Controls */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="खरिदकर्ताको नाम, मोबाइल, कारोबार ID (Txn Code), वा ठेगाना खोज्नुहोस्..."
                  className="w-full pl-10 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setPurchaseFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    purchaseFilter === 'all'
                      ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                      : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
                  }`}
                >
                  सबै आवेदन ({toDevanagariNumerals(purchasedUsers.length)})
                </button>

                <button
                  type="button"
                  onClick={() => setPurchaseFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    purchaseFilter === 'pending'
                      ? 'bg-rose-500 text-white font-black shadow-sm'
                      : 'bg-stone-950 text-rose-400 hover:bg-stone-800 border border-rose-900/40'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>विचाराधीन ({toDevanagariNumerals(purchasedUsers.filter(p => p.status === 'PURCHASE_PENDING').length)})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPurchaseFilter('approved')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    purchaseFilter === 'approved'
                      ? 'bg-emerald-500 text-stone-950 font-black shadow-sm'
                      : 'bg-stone-950 text-emerald-400 hover:bg-stone-800 border border-emerald-900/40'
                  }`}
                >
                  स्वीकृत ग्राहक ({toDevanagariNumerals(purchasedUsers.filter(p => p.status === 'PURCHASE_APPROVED').length)})
                </button>

                <button
                  type="button"
                  onClick={() => setPurchaseFilter('rejected')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    purchaseFilter === 'rejected'
                      ? 'bg-stone-700 text-white font-black shadow-sm'
                      : 'bg-stone-950 text-stone-400 hover:bg-stone-800 border border-stone-800'
                  }`}
                >
                  अस्वीकृत ({toDevanagariNumerals(purchasedUsers.filter(p => p.status === 'PURCHASE_REJECTED').length)})
                </button>
              </div>
            </div>

            {/* Instruction Tip */}
            <div className="bg-gradient-to-r from-rose-950/40 to-amber-950/30 border border-rose-900/40 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs text-rose-300">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  यस तालिकामा सफ्टवेयर खरिदका लागि eSewa, Khalti वा बैंकबाट रकम भुक्तानी गरी आवेदन दिएका ग्राहकहरू रहेका छन्। भुक्तानी जाँच गरी <strong>"स्वीकृत गर्नुहोस्"</strong> बटन थिच्नासाथ ग्राहकको सेवा स्वतः अनलक हुनेछ।
                </span>
              </div>
              <span className="text-[11px] font-mono text-amber-400 font-bold hidden sm:inline whitespace-nowrap">
                जम्मा आवेदन: {toDevanagariNumerals(purchasedUsers.length)}
              </span>
            </div>
          </div>

          {/* Purchased Users Table */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto min-h-[380px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-950/80 border-b border-stone-800 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                    <th className="py-3 px-3 text-center w-12">क्र.सं.</th>
                    <th className="py-3 px-3 min-w-[160px]">ग्राहकको नाम</th>
                    <th className="py-3 px-3 min-w-[150px]">सम्पर्क / WhatsApp</th>
                    <th className="py-3 px-3 min-w-[130px]">ठेगाना</th>
                    <th className="py-3 px-3 min-w-[160px]">खरिद गरेको योजना</th>
                    <th className="py-3 px-3 min-w-[110px]">भुक्तानी माध्यम</th>
                    <th className="py-3 px-3 min-w-[150px]">कारोबार ID (Txn)</th>
                    <th className="py-3 px-3 min-w-[110px]">रकम (NPR)</th>
                    <th className="py-3 px-3 min-w-[120px]">आवेदन मिति</th>
                    <th className="py-3 px-3 min-w-[130px]">स्थिति</th>
                    <th className="py-3 px-3 text-center min-w-[150px]">कारबाही</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 text-xs text-stone-300">
                  {(() => {
                    let filteredPurchases = purchasedUsers;
                    if (purchaseFilter === 'pending') {
                      filteredPurchases = filteredPurchases.filter(p => p.status === 'PURCHASE_PENDING');
                    } else if (purchaseFilter === 'approved') {
                      filteredPurchases = filteredPurchases.filter(p => p.status === 'PURCHASE_APPROVED');
                    } else if (purchaseFilter === 'rejected') {
                      filteredPurchases = filteredPurchases.filter(p => p.status === 'PURCHASE_REJECTED');
                    }

                    if (searchQuery) {
                      const q = searchQuery.toLowerCase().trim();
                      filteredPurchases = filteredPurchases.filter(p => 
                        (p.fullName && p.fullName.toLowerCase().includes(q)) ||
                        (p.mobile && p.mobile.includes(q)) ||
                        (p.transactionId && p.transactionId.toLowerCase().includes(q)) ||
                        (p.address && p.address.toLowerCase().includes(q)) ||
                        (p.email && p.email.toLowerCase().includes(q))
                      );
                    }

                    if (filteredPurchases.length === 0) {
                      return (
                        <tr>
                          <td colSpan={11} className="py-16 text-center text-stone-400 space-y-2">
                            <CreditCard className="w-10 h-10 text-stone-600 mx-auto" />
                            <p className="text-sm font-bold text-stone-200">कुनै पनि खरिद आवेदन फेला परेन।</p>
                            <p className="text-xs text-stone-500">नयाँ खरिद अनुरोध आएपछि यहाँ स्वतः देखिनेछ।</p>
                          </td>
                        </tr>
                      );
                    }

                    return filteredPurchases.map((lead, idx) => {
                      const isPending = lead.status === 'PURCHASE_PENDING';
                      const isApproved = lead.status === 'PURCHASE_APPROVED';
                      const isRejected = lead.status === 'PURCHASE_REJECTED';

                      return (
                        <tr 
                          key={lead.id}
                          className={`hover:bg-stone-800/50 transition-colors ${
                            isPending ? 'bg-rose-950/20' : ''
                          }`}
                        >
                          {/* 1. क्र.सं. */}
                          <td className="py-3 px-3 text-center font-mono text-stone-400">
                            {toDevanagariNumerals(idx + 1)}
                          </td>

                          {/* 2. ग्राहकको नाम */}
                          <td className="py-3 px-3">
                            <div className="font-extrabold text-stone-100 flex items-center gap-1.5">
                              <span>{lead.fullName || 'ग्राहक'}</span>
                            </div>
                            <div className="text-[10px] text-stone-400 font-mono">
                              ID: {lead.id}
                            </div>
                          </td>

                          {/* 3. सम्पर्क */}
                          <td className="py-3 px-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 font-mono font-bold text-stone-200">
                                <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span>{lead.mobile || 'उपलब्ध छैन'}</span>
                              </div>
                              {lead.whatsapp && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenWhatsApp(lead.whatsapp)}
                                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-mono transition-colors cursor-pointer"
                                  title="WhatsApp मा कुरा गर्नुहोस्"
                                >
                                  <MessageCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                                  <span className="underline decoration-dotted">{lead.whatsapp}</span>
                                </button>
                              )}
                            </div>
                          </td>

                          {/* 4. ठेगाना */}
                          <td className="py-3 px-3 text-stone-300">
                            <div className="flex items-center gap-1 truncate max-w-[140px]" title={lead.address}>
                              <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                              <span>{lead.address || 'नेपाल'}</span>
                            </div>
                          </td>

                          {/* 5. प्याकेज */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-amber-300 text-xs">
                              {lead.planNameNepali || '१ वर्षको सदस्यता'}
                            </div>
                            <div className="text-[10px] text-stone-400">
                              {lead.planId?.includes('lifetime') ? 'आजीवन पहुँच' : '१ वर्षको म्याद'}
                            </div>
                          </td>

                          {/* 6. भुक्तानी माध्यम */}
                          <td className="py-3 px-3">
                            {lead.paymentMethod === 'esewa' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-950/80 text-green-400 border border-green-800">
                                eSewa
                              </span>
                            ) : lead.paymentMethod === 'khalti' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950/80 text-purple-400 border border-purple-800">
                                Khalti
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950/80 text-blue-400 border border-blue-800">
                                Bank Transfer
                              </span>
                            )}
                          </td>

                          {/* 7. कारोबार ID */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-amber-400 font-bold text-xs select-all">
                                {lead.transactionId || 'उपलब्ध छैन'}
                              </span>
                              {lead.transactionId && (
                                <button
                                  type="button"
                                  onClick={() => handleCopy(lead.transactionId!, 'कारोबार कोड')}
                                  className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-stone-200 cursor-pointer"
                                  title="Txn ID प्रतिलिपि गर्नुहोस्"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>

                          {/* 8. रकम */}
                          <td className="py-3 px-3">
                            <span className="font-extrabold text-stone-100 font-mono text-sm">
                              रु. {toDevanagariNumerals(lead.planAmountNPR || 0)}
                            </span>
                          </td>

                          {/* 9. मिति */}
                          <td className="py-3 px-3">
                            <div className="space-y-0.5">
                              <p className="text-stone-200 font-medium">{lead.submittedAtBS || '२०८१'}</p>
                              <p className="text-[10px] text-stone-500 font-mono">
                                {lead.submittedAtISO ? new Date(lead.submittedAtISO).toLocaleDateString('en-CA') : ''}
                              </p>
                            </div>
                          </td>

                          {/* 10. स्थिति */}
                          <td className="py-3 px-3">
                            {isPending ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                                🔴 प्रमाणीकरण बाँकी
                              </span>
                            ) : isApproved ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                🟢 स्वीकृत
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-800 text-stone-400 border border-stone-700">
                                <XCircle className="w-3 h-3 text-stone-500" />
                                🔴 अस्वीकृत
                              </span>
                            )}
                          </td>

                          {/* 11. कारबाही */}
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => openPaymentApprovalModal(lead)}
                                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold border border-stone-700 cursor-pointer transition-colors flex items-center gap-1"
                                title="सम्पूर्ण विवरण तथा भौचर हेर्नुहोस्"
                              >
                                <Info className="w-3 h-3 text-amber-400" />
                                <span>विवरण</span>
                              </button>

                              {isPending && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (lead.paymentMethod === 'cash' && !lead.cashVerified) {
                                      openPaymentApprovalModal(lead);
                                    } else {
                                      const res = unifiedUserSyncService.approvePurchase(lead.id, approvalAdminName);
                                      showToast(res.messageNepali);
                                      fetchUsers(true);
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-sm transition-all cursor-pointer flex items-center gap-1"
                                  title="तत्काल खरिद स्वीकृत गरी सेवा खुल्ला गर्नुहोस्"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>स्वीकृत</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setLeadToDelete(lead);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-bold border border-rose-800/80 cursor-pointer transition-colors flex items-center gap-1"
                                title="यो खरिद तथा प्रयोगकर्ता रेकर्ड स्थायी रूपमा हटाउनुहोस्"
                              >
                                <Trash2 className="w-3 h-3 text-rose-400" />
                                <span>हटाउनुहोस्</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── CUSTOM RIGHT-CLICK CONTEXT MENU (Bounded to Viewport) ── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {contextMenu.visible && contextMenu.user && (
        <div
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 w-64 bg-stone-900 border border-amber-500/50 rounded-2xl shadow-2xl py-2 text-stone-200 text-xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Target User Mini Header */}
          <div className="px-3.5 py-2 border-b border-stone-800 bg-stone-950/70">
            <p className="font-extrabold text-white text-xs truncate">
              {contextMenu.user.fullName || 'प्रयोगकर्ता'}
            </p>
            <p className="text-[10px] text-amber-400 font-mono truncate">
              {contextMenu.user.customerId} • {contextMenu.user.phone}
            </p>
          </div>

          <div className="max-h-[380px] overflow-y-auto py-1 divide-y divide-stone-800/80">
            {/* Section A: व्यक्तिगत विवरण */}
            <div className="py-1">
              <div className="px-3 py-1 text-[9px] font-bold tracking-wider text-stone-500 uppercase">
                १. व्यक्तिगत विवरण
              </div>
              <button
                onClick={() => {
                  setDetailsModalUser(contextMenu.user);
                  setContextMenu(prev => ({ ...prev, visible: false }));
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-stone-800 flex items-center gap-2.5 text-stone-200 font-medium transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>पूरा विवरण हेर्नुहोस्</span>
              </button>

              <button
                onClick={() => handleOpenEdit(contextMenu.user!)}
                className="w-full text-left px-3.5 py-1.5 hover:bg-stone-800 flex items-center gap-2.5 text-stone-200 font-medium transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>विवरण सम्पादन गर्नुहोस्</span>
              </button>

              <button
                onClick={() => handleCopy(contextMenu.user!.phone, 'मोबाइल नम्बर')}
                className="w-full text-left px-3.5 py-1.5 hover:bg-stone-800 flex items-center gap-2.5 text-stone-300 transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-stone-400" />
                <span>मोबाइल प्रतिलिपि (Copy)</span>
              </button>

              <button
                onClick={() => handleCopy(contextMenu.user!.whatsapp, 'WhatsApp नम्बर')}
                className="w-full text-left px-3.5 py-1.5 hover:bg-stone-800 flex items-center gap-2.5 text-stone-300 transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp प्रतिलिपि (Copy)</span>
              </button>

              <button
                onClick={() => handleCopy(contextMenu.user!.email, 'इमेल')}
                className="w-full text-left px-3.5 py-1.5 hover:bg-stone-800 flex items-center gap-2.5 text-stone-300 transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>इमेल प्रतिलिपि (Copy)</span>
              </button>
            </div>

            {/* Section B: खाता व्यवस्थापन */}
            <div className="py-1">
              <div className="px-3 py-1 text-[9px] font-bold tracking-wider text-stone-500 uppercase">
                २. खाता व्यवस्थापन
              </div>
              {contextMenu.user.status !== 'active' ? (
                <button
                  onClick={() => {
                    setStatusModalUser({ user: contextMenu.user!, targetStatus: 'active' });
                    setContextMenu(prev => ({ ...prev, visible: false }));
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-950/60 text-emerald-400 flex items-center gap-2.5 font-bold transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>खाता सक्रिय गर्नुहोस्</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setStatusModalUser({ user: contextMenu.user!, targetStatus: 'suspended' });
                    setContextMenu(prev => ({ ...prev, visible: false }));
                  }}
                  className="w-full text-left px-3.5 py-1.5 hover:bg-rose-950/60 text-rose-400 flex items-center gap-2.5 font-bold transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>खाता निलम्बन (Suspend) गर्नुहोस्</span>
                </button>
              )}
            </div>

            {/* Section C: सेवा तथा लाइसेन्स व्यवस्थापन */}
            <div className="py-1">
              <div className="px-3 py-1 text-[9px] font-bold tracking-wider text-stone-500 uppercase">
                ३. सेवा तथा लाइसेन्स
              </div>
              {/* Jyotish Access */}
              <button
                onClick={() => {
                  setServiceModalUser({ user: contextMenu.user!, serviceKey: 'jyotish' });
                  setContextMenu(prev => ({ ...prev, visible: false }));
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-stone-800 flex items-center justify-between text-stone-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>ज्योतिष सेवा पहुँच</span>
                </span>
                <span className={`text-[10px] font-bold ${contextMenu.user.jyotishAccess?.unlocked ? 'text-emerald-400' : 'text-stone-500'}`}>
                  {contextMenu.user.jyotishAccess?.unlocked ? 'खुल्ला' : 'लक'}
                </span>
              </button>

              {/* Vastu Access */}
              <button
                onClick={() => {
                  setServiceModalUser({ user: contextMenu.user!, serviceKey: 'vastu' });
                  setContextMenu(prev => ({ ...prev, visible: false }));
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-stone-800 flex items-center justify-between text-stone-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>वास्तु सेवा पहुँच</span>
                </span>
                <span className={`text-[10px] font-bold ${contextMenu.user.vastuAccess?.unlocked ? 'text-emerald-400' : 'text-stone-500'}`}>
                  {contextMenu.user.vastuAccess?.unlocked ? 'खुल्ला' : 'लक'}
                </span>
              </button>

              {/* Trial Reset */}
              <button
                onClick={() => {
                  handleTrialAction(contextMenu.user!, 'reset');
                  setContextMenu(prev => ({ ...prev, visible: false }));
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-stone-800 flex items-center gap-2.5 text-purple-300 transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>२४-घण्टे ट्रायल रिसेट गर्नुहोस्</span>
              </button>

              {/* Menu & Submenu Access Switchboard */}
              <button
                onClick={() => {
                  setSwitchboardModalUser(contextMenu.user);
                  setContextMenu(prev => ({ ...prev, visible: false }));
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-amber-950/40 border-t border-stone-800/60 flex items-center justify-between text-amber-300 font-bold transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>मेनु तथा सेवा स्विचबोर्ड</span>
                </span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 py-0.2 rounded font-mono">
                  Open/Lock
                </span>
              </button>

              {/* Payment Approvals (eSewa) */}
              <button
                onClick={() => {
                  if (onOpenPaymentsForUser && contextMenu.user) {
                    onOpenPaymentsForUser(contextMenu.user.phone);
                  }
                  setContextMenu(prev => ({ ...prev, visible: false }));
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-blue-950/40 flex items-center justify-between text-blue-300 font-bold transition-colors"
              >
                <span className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                  <span>भुक्तानी तथा खरिद रुजु (eSewa)</span>
                </span>
                <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-1 py-0.2 rounded font-mono">
                  Approvals
                </span>
              </button>

              {/* Subscriptions & Service Licenses */}
              <button
                onClick={() => {
                  if (onOpenLicensesForUser && contextMenu.user) {
                    onOpenLicensesForUser(contextMenu.user.phone);
                  }
                  setContextMenu(prev => ({ ...prev, visible: false }));
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-purple-950/40 flex items-center justify-between text-purple-300 font-bold transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Crown className="w-3.5 h-3.5 text-purple-400" />
                  <span>सदस्यता तथा लाइसेन्स व्यवस्थापन</span>
                </span>
                <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1 py-0.2 rounded font-mono">
                  Licenses
                </span>
              </button>
            </div>

            {/* Section D: प्रत्यक्ष सम्पर्क */}
            <div className="py-1">
              <div className="px-3 py-1 text-[9px] font-bold tracking-wider text-stone-500 uppercase">
                ४. प्रत्यक्ष सम्पर्क
              </div>
              <button
                onClick={() => handleOpenWhatsApp(contextMenu.user!.whatsapp)}
                className="w-full text-left px-3.5 py-1.5 hover:bg-emerald-950/50 flex items-center gap-2.5 text-emerald-400 font-bold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp प्रत्यक्ष च्याट</span>
              </button>

              <button
                onClick={() => {
                  window.open(`tel:${contextMenu.user!.phone}`, '_self');
                  setContextMenu(prev => ({ ...prev, visible: false }));
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-stone-800 flex items-center gap-2.5 text-stone-200 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>फोन कल गर्नुहोस्</span>
              </button>
            </div>

            {/* Section E: अन्य कार्य */}
            <div className="py-1">
              <button
                onClick={() => {
                  setAdminNoteModalUser(contextMenu.user);
                  setContextMenu(prev => ({ ...prev, visible: false }));
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-stone-800 flex items-center gap-2.5 text-stone-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Note थप्नुहोस्</span>
              </button>
            </div>

            {/* Section F: स्थायी रूपमा हटाउने (Permanent Deletion) */}
            <div className="py-1 border-t border-stone-800/80">
              <button
                onClick={() => {
                  const target = contextMenu.user;
                  setContextMenu(prev => ({ ...prev, visible: false }));
                  if (target) setUserToDelete(target);
                }}
                className="w-full text-left px-3.5 py-1.5 hover:bg-rose-950/60 flex items-center gap-2.5 text-rose-400 font-bold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>स्थायी रूपमा हटाउनुहोस् (Delete)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── MOBILE / TOUCH ACTION SHEET (Three dots ⋮ trigger) ── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {mobileActionUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-white">{mobileActionUser.fullName}</h3>
                <p className="text-xs text-amber-400 font-mono">{mobileActionUser.phone} • {mobileActionUser.customerId}</p>
              </div>
              <button
                onClick={() => setMobileActionUser(null)}
                className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => {
                  setDetailsModalUser(mobileActionUser);
                  setMobileActionUser(null);
                }}
                className="w-full p-3 bg-stone-950 border border-stone-800 hover:border-amber-500 rounded-xl text-left flex items-center gap-3 text-stone-200 font-bold"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>पूरा विवरण हेर्नुहोस् (Full Profile)</span>
              </button>

              <button
                onClick={() => handleOpenEdit(mobileActionUser)}
                className="w-full p-3 bg-stone-950 border border-stone-800 hover:border-amber-500 rounded-xl text-left flex items-center gap-3 text-stone-200 font-bold"
              >
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>विवरण सम्पादन गर्नुहोस् (Edit Profile)</span>
              </button>

              <button
                onClick={() => {
                  handleOpenWhatsApp(mobileActionUser.whatsapp);
                  setMobileActionUser(null);
                }}
                className="w-full p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-left flex items-center gap-3 text-emerald-300 font-bold"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp मा प्रत्यक्ष च्याट खोल्नुहोस्</span>
              </button>

              <button
                onClick={() => {
                  setSwitchboardModalUser(mobileActionUser);
                  setMobileActionUser(null);
                }}
                className="w-full p-3 bg-amber-950/40 border border-amber-500/50 hover:border-amber-400 rounded-xl text-left flex items-center justify-between text-amber-300 font-bold"
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>मेनु तथा सेवा स्विचबोर्ड (Open/Close/Lock)</span>
                </div>
                <span className="text-[10px] bg-amber-500 text-stone-950 font-black px-2 py-0.5 rounded-lg">
                  स्विचबोर्ड
                </span>
              </button>

              <button
                onClick={() => {
                  if (onOpenPaymentsForUser) {
                    onOpenPaymentsForUser(mobileActionUser.phone);
                  }
                  setMobileActionUser(null);
                }}
                className="w-full p-3 bg-blue-950/40 border border-blue-500/50 hover:border-blue-400 rounded-xl text-left flex items-center justify-between text-blue-300 font-bold"
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <span>भुक्तानी तथा खरिद रुजु (eSewa Approvals)</span>
                </div>
                <span className="text-[10px] bg-blue-500 text-stone-950 font-black px-2 py-0.5 rounded-lg">
                  भुक्तानी
                </span>
              </button>

              <button
                onClick={() => {
                  if (onOpenLicensesForUser) {
                    onOpenLicensesForUser(mobileActionUser.phone);
                  }
                  setMobileActionUser(null);
                }}
                className="w-full p-3 bg-purple-950/40 border border-purple-500/50 hover:border-purple-400 rounded-xl text-left flex items-center justify-between text-purple-300 font-bold"
              >
                <div className="flex items-center gap-2.5">
                  <Crown className="w-4 h-4 text-purple-400" />
                  <span>सदस्यता तथा लाइसेन्स (Subscriptions & Trials)</span>
                </div>
                <span className="text-[10px] bg-purple-500 text-stone-950 font-black px-2 py-0.5 rounded-lg">
                  लाइसेन्स
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    setServiceModalUser({ user: mobileActionUser, serviceKey: 'jyotish' });
                    setMobileActionUser(null);
                  }}
                  className="p-3 bg-stone-950 border border-stone-800 rounded-xl text-left space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ज्योतिष सेवा</span>
                  </div>
                  <p className="text-[10px] text-stone-400">
                    स्थिति: {mobileActionUser.jyotishAccess?.unlocked ? 'खुल्ला' : 'लक'}
                  </p>
                </button>

                <button
                  onClick={() => {
                    setServiceModalUser({ user: mobileActionUser, serviceKey: 'vastu' });
                    setMobileActionUser(null);
                  }}
                  className="p-3 bg-stone-950 border border-stone-800 rounded-xl text-left space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <Compass className="w-3.5 h-3.5" />
                    <span>वास्तु सेवा</span>
                  </div>
                  <p className="text-[10px] text-stone-400">
                    स्थिति: {mobileActionUser.vastuAccess?.unlocked ? 'खुल्ला' : 'लक'}
                  </p>
                </button>
              </div>

              {mobileActionUser.status === 'active' ? (
                <button
                  onClick={() => {
                    setStatusModalUser({ user: mobileActionUser, targetStatus: 'suspended' });
                    setMobileActionUser(null);
                  }}
                  className="w-full p-3 bg-stone-950 border border-stone-800 hover:border-rose-800 rounded-xl text-left flex items-center gap-3 text-rose-300 font-bold"
                >
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>खाता निलम्बन (Suspend Account)</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setStatusModalUser({ user: mobileActionUser, targetStatus: 'active' });
                    setMobileActionUser(null);
                  }}
                  className="w-full p-3 bg-stone-950 border border-stone-800 hover:border-emerald-800 rounded-xl text-left flex items-center gap-3 text-emerald-300 font-bold"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>खाता पुनः सक्रिय (Reactivate Account)</span>
                </button>
              )}

              <button
                onClick={() => {
                  const target = mobileActionUser;
                  setMobileActionUser(null);
                  if (target) setUserToDelete(target);
                }}
                className="w-full p-3 bg-rose-950/70 border border-rose-800/90 hover:bg-rose-900/80 rounded-xl text-left flex items-center gap-3 text-rose-300 font-bold cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>प्रयोगकर्ता स्थायी रूपमा हटाउनुहोस् (Permanent Delete)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 1: FULL USER PROFILE DETAILS ── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {detailsModalUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-7 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-stone-950 flex items-center justify-center font-black text-xl">
                  {detailsModalUser.fullName?.charAt(0) || 'प्र'}
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white">{detailsModalUser.fullName}</h2>
                  <p className="text-xs text-amber-400 font-mono">
                    {detailsModalUser.customerId} • User ID: {detailsModalUser.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailsModalUser(null)}
                className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Cross-Navigation Bar (4-मेनु अन्तरसम्बन्ध) */}
            <div className="bg-stone-950 border border-stone-800 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-300">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>द्रुत कार्य (Quick Navigation):</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    const phone = detailsModalUser.phone;
                    setDetailsModalUser(null);
                    onOpenSwitchboardForUser?.(phone);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>मेनु स्विचबोर्ड</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const phone = detailsModalUser.phone;
                    setDetailsModalUser(null);
                    onOpenPaymentsForUser?.(phone);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>भुक्तानी रुजु (eSewa)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const phone = detailsModalUser.phone;
                    setDetailsModalUser(null);
                    onOpenLicensesForUser?.(phone);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>सदस्यता तथा लाइसेन्स</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = detailsModalUser;
                    setDetailsModalUser(null);
                    setUserToDelete(target);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>स्थायी रूपमा हटाउनुहोस्</span>
                </button>
              </div>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Box 1: व्यक्तिगत & ठेगाना */}
              <div className="bg-stone-950 border border-stone-800/80 p-4 rounded-2xl space-y-2.5">
                <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider border-b border-stone-800 pb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>व्यक्तिगत विवरण</span>
                </h4>
                <div className="space-y-1.5 text-stone-300">
                  <div className="flex justify-between py-1 border-b border-stone-900">
                    <span className="text-stone-500">पूरा नाम:</span>
                    <span className="font-bold text-white">{detailsModalUser.fullName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-900">
                    <span className="text-stone-500">स्थायी ठेगाना:</span>
                    <span className="font-medium text-white">{detailsModalUser.address}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-900">
                    <span className="text-stone-500">जन्ममिति (वि.सं.):</span>
                    <span className="font-bold text-amber-300">{detailsModalUser.dobBS}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-900">
                    <span className="text-stone-500">जन्ममिति (ई.सं.):</span>
                    <span className="font-mono">{detailsModalUser.dobAD}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-stone-500">जन्म समय:</span>
                    <span className="font-mono">{detailsModalUser.birthTime || 'विवरण बाँकी'}</span>
                  </div>
                </div>
              </div>

              {/* Box 2: सम्पर्क & खाता स्थिति */}
              <div className="bg-stone-950 border border-stone-800/80 p-4 rounded-2xl space-y-2.5">
                <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider border-b border-stone-800 pb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>सम्पर्क तथा खाता</span>
                </h4>
                <div className="space-y-1.5 text-stone-300">
                  <div className="flex justify-between py-1 border-b border-stone-900">
                    <span className="text-stone-500">मोबाइल नम्बर:</span>
                    <span className="font-mono font-bold text-emerald-400">{detailsModalUser.phone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-900">
                    <span className="text-stone-500">WhatsApp नम्बर:</span>
                    <span className="font-mono font-bold text-emerald-300">{detailsModalUser.whatsapp}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-900">
                    <span className="text-stone-500">इमेल ठेगाना:</span>
                    <span className="font-mono">{detailsModalUser.email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-900">
                    <span className="text-stone-500">खाता स्थिति:</span>
                    <span className={`font-bold ${detailsModalUser.status === 'active' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {detailsModalUser.status === 'active' ? 'सक्रिय (Active)' : 'निलम्बित (Suspended)'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-stone-500">दर्ता मिति:</span>
                    <span>{detailsModalUser.createdAtBS} ({new Date(detailsModalUser.createdAtISO).toLocaleDateString()})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 3: सेवा तथा लाइसेन्स स्थिति */}
            <div className="bg-stone-950 border border-stone-800/80 p-4 rounded-2xl space-y-3">
              <h4 className="text-[11px] font-bold text-purple-400 uppercase tracking-wider border-b border-stone-800 pb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  <span>सेवा पहुँच तथा सदस्यता स्थिति (Live License State)</span>
                </span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Jyotish */}
                <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400">ज्योतिष सेवा</span>
                    <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                      detailsModalUser.jyotishAccess?.unlocked ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-stone-800 text-stone-500'
                    }`}>
                      {detailsModalUser.jyotishAccess?.unlocked ? 'खुल्ला (Active)' : 'लक (Locked)'}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400">
                    अवधि: {detailsModalUser.jyotishAccess?.period || 'उपलब्ध छैन'}
                  </p>
                  <button
                    onClick={() => handleToggleService(detailsModalUser, 'jyotish', detailsModalUser.jyotishAccess?.unlocked ? 'lock' : 'unlock')}
                    className="w-full mt-2 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    {detailsModalUser.jyotishAccess?.unlocked ? 'सेवा लक गर्नुहोस्' : 'सेवा अनलक गर्नुहोस्'}
                  </button>
                </div>

                {/* Vastu */}
                <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400">वास्तु सेवा</span>
                    <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                      detailsModalUser.vastuAccess?.unlocked ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-stone-800 text-stone-500'
                    }`}>
                      {detailsModalUser.vastuAccess?.unlocked ? 'खुल्ला (Active)' : 'लक (Locked)'}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400">
                    अवधि: {detailsModalUser.vastuAccess?.period || 'उपलब्ध छैन'}
                  </p>
                  <button
                    onClick={() => handleToggleService(detailsModalUser, 'vastu', detailsModalUser.vastuAccess?.unlocked ? 'lock' : 'unlock')}
                    className="w-full mt-2 py-1 bg-stone-800 hover:bg-stone-700 text-cyan-300 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    {detailsModalUser.vastuAccess?.unlocked ? 'सेवा लक गर्नुहोस्' : 'सेवा अनलक गर्नुहोस्'}
                  </button>
                </div>

                {/* Trial */}
                <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-400">२४-घण्टे परीक्षण</span>
                    <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                      detailsModalUser.trial?.isTrialActive ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-stone-800 text-stone-500'
                    }`}>
                      {detailsModalUser.trial?.isTrialActive ? 'सक्रिय' : detailsModalUser.trial?.hasUsedTrial ? 'समाप्त' : 'लिएको छैन'}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400">
                    सुरु: {detailsModalUser.trial?.trialStartedAtISO ? new Date(detailsModalUser.trial.trialStartedAtISO).toLocaleDateString() : 'छैन'}
                  </p>
                  <button
                    onClick={() => handleTrialAction(detailsModalUser, 'reset')}
                    className="w-full mt-2 py-1 bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-800 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    परीक्षण पुनः रिसेट गर्नुहोस्
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="bg-stone-950 border border-stone-800/80 p-4 rounded-2xl space-y-3">
              <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-800 pb-1.5 flex items-center justify-between">
                <span>प्रशासकीय टिप्पणीहरू (Admin Notes)</span>
                <span className="text-[10px] text-stone-500 font-mono">
                  {detailsModalUser.adminNotes?.length || 0} टिप्पणीहरू
                </span>
              </h4>

              {detailsModalUser.adminNotes && detailsModalUser.adminNotes.length > 0 ? (
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {detailsModalUser.adminNotes.map((note) => (
                    <div key={note.id} className="p-2.5 bg-stone-900/90 rounded-xl border border-stone-800 text-xs space-y-1">
                      <p className="text-stone-200">{note.text}</p>
                      <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono">
                        <span>लेखक: {note.author}</span>
                        <span>{new Date(note.createdAtISO).toLocaleString('ne-NP')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-500 italic">कुनै पनि प्रशासकीय नोट थपिएको छैन।</p>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex justify-end gap-2.5 pt-2 border-t border-stone-800">
              <button
                onClick={() => {
                  handleOpenEdit(detailsModalUser);
                  setDetailsModalUser(null);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>विवरण सम्पादन गर्नुहोस्</span>
              </button>
              <button
                onClick={() => setDetailsModalUser(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl text-xs cursor-pointer"
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 2: EDIT USER DETAILS ── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {editModalUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-stone-900 border border-amber-500/60 rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-400" />
                  <span>प्रयोगकर्ता विवरण सम्पादन</span>
                </h3>
                <p className="text-xs text-stone-400">
                  {editModalUser.customerId} • {editModalUser.phone}
                </p>
              </div>
              <button
                onClick={() => setEditModalUser(null)}
                className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-stone-400 font-bold">पूरा नाम (Full Name):</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-400 font-bold">ठेगाना (Address):</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-400 font-bold">मोबाइल नम्बर (Mobile):</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 font-mono outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-400 font-bold">WhatsApp नम्बर:</label>
                <input
                  type="text"
                  value={editForm.whatsapp}
                  onChange={(e) => setEditForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                  className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 font-mono outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-stone-400 font-bold">इमेल (Email):</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 font-mono outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-400 font-bold">जन्ममिति (वि.सं.):</label>
                <input
                  type="text"
                  value={editForm.dobBS}
                  onChange={(e) => setEditForm(prev => ({ ...prev, dobBS: e.target.value }))}
                  placeholder="२०५०-०१-१५"
                  className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-400 font-bold">जन्म समय (Time):</label>
                <input
                  type="text"
                  value={editForm.birthTime}
                  onChange={(e) => setEditForm(prev => ({ ...prev, birthTime: e.target.value }))}
                  placeholder="०६:३० बिहान"
                  className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-stone-800">
              <button
                onClick={() => setEditModalUser(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl text-xs cursor-pointer"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs cursor-pointer transition-colors shadow-md"
              >
                परिवर्तन सुरक्षित गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 3: ACCOUNT STATUS CONFIRMATION (Activate/Suspend) ── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {statusModalUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              {statusModalUser.targetStatus === 'active' ? (
                <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-rose-950 border border-rose-800 text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              <div>
                <h3 className="font-extrabold text-base text-white">
                  {statusModalUser.targetStatus === 'active'
                    ? 'खाता पुनः सक्रिय गर्ने पुष्टि'
                    : 'खाता निलम्बन (Suspension) पुष्टि'}
                </h3>
                <p className="text-xs text-stone-400">{statusModalUser.user.fullName} ({statusModalUser.user.phone})</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              {statusModalUser.targetStatus === 'active'
                ? 'यो खाता सक्रिय गरेपछि प्रयोगकर्ताले आफ्नो मोबाइल र पासवर्डबाट सामान्य लगइन गरी सेवा प्रयोग गर्न सक्नेछन्।'
                : 'खाता निलम्बन गरेपछि प्रयोगकर्ताले लगइन गर्न पाउने छैनन् र निजको पहुँच रोकिनेछ।'}
            </p>

            <div className="space-y-1 text-xs">
              <label className="text-stone-400 font-bold">कारण / कैफियत (वैकल्पिक):</label>
              <textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="कारण खुलाउनुहोस् (उदा. नियम उल्लंघन, भुक्तानी बाँकी, वा ग्राहक अनुरोध)..."
                rows={2}
                className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => {
                  setStatusModalUser(null);
                  setStatusReason('');
                }}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                onClick={handleConfirmStatusChange}
                className={`px-4 py-2 font-bold rounded-xl text-xs cursor-pointer transition-colors ${
                  statusModalUser.targetStatus === 'active'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                पुष्टि गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 4: SERVICE ACCESS CONTROL (Jyotish / Vastu Unlock) ── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {serviceModalUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center">
                {serviceModalUser.serviceKey === 'jyotish' ? <Sparkles className="w-5 h-5" /> : <Compass className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">
                  {serviceModalUser.serviceKey === 'jyotish' ? 'ज्योतिष सेवा' : 'वास्तु सेवा'} पहुँच व्यवस्थापन
                </h3>
                <p className="text-xs text-stone-400">{serviceModalUser.user.fullName} ({serviceModalUser.user.phone})</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-stone-300 font-bold">पहुँच अवधि छान्नुहोस् (Duration):</label>
              <select
                value={serviceDuration}
                onChange={(e) => setServiceDuration(e.target.value)}
                className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 outline-none cursor-pointer"
              >
                <option value="24_hours">२४ घण्टा (24 Hours Trial/Access)</option>
                <option value="1_month">१ महिना (1 Month)</option>
                <option value="3_months">३ महिना (3 Months)</option>
                <option value="6_months">६ महिना (6 Months)</option>
                <option value="1_year">१ वर्ष (1 Year Full)</option>
                <option value="5_years">५ वर्ष (5 Years Pro)</option>
                <option value="lifetime">आजीवन (Lifetime Full Access)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-800">
              <button
                onClick={() => handleToggleService(serviceModalUser.user, serviceModalUser.serviceKey, 'lock')}
                className="px-3.5 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold rounded-xl text-xs cursor-pointer"
              >
                सेवा पूर्ण लक (Lock) गर्नुहोस्
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setServiceModalUser(null)}
                  className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl text-xs cursor-pointer"
                >
                  रद्द
                </button>
                <button
                  onClick={() => handleToggleService(serviceModalUser.user, serviceModalUser.serviceKey, 'unlock', serviceDuration)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  अनलक गर्नुहोस्
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 5: ADD ADMIN NOTE ── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {adminNoteModalUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-white">प्रशासक नोट थप्नुहोस् (Admin Note)</h3>
                <p className="text-xs text-amber-400">{adminNoteModalUser.fullName} ({adminNoteModalUser.customerId})</p>
              </div>
              <button
                onClick={() => setAdminNoteModalUser(null)}
                className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 text-xs">
              <label className="text-stone-300 font-bold">टिप्पणी / कैफियत:</label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="यस प्रयोगकर्ता सम्बन्धी कुनै पनि आन्तरिक टिप्पणी लेख्नुहोस्..."
                rows={4}
                className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => {
                  setAdminNoteModalUser(null);
                  setNoteContent('');
                }}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                रद्द
              </button>
              <button
                onClick={handleAddNote}
                disabled={!noteContent.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold rounded-xl text-xs cursor-pointer"
              >
                सुरक्षित गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 6: DEDICATED MENU & SERVICE SWITCHBOARD MODAL ── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {switchboardModalUser && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-5xl bg-stone-900 border border-amber-500/60 rounded-3xl p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white">
                    मेनु तथा सेवा स्विचबोर्ड — {switchboardModalUser.fullName}
                  </h3>
                  <p className="text-xs text-amber-400 font-mono">
                    {switchboardModalUser.customerId} • {switchboardModalUser.phone} • {switchboardModalUser.address}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSwitchboardModalUser(null)}
                className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="pt-2">
              <MenuControlPanel
                initialSelectedMobile={switchboardModalUser.phone}
                onBackToUsers={() => setSwitchboardModalUser(null)}
              />
            </div>
          </div>
        </div>
      )}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 7: PAYMENT DETAILS & INSTANT APPROVAL MODAL ── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {paymentApprovalModalLead && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-stone-900 border border-amber-500/60 rounded-3xl p-5 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto shadow-2xl text-stone-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 text-white flex items-center justify-center font-black shadow-lg">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">
                    सफ्टवेयर खरिद तथा भुक्तानी प्रमाणीकरण
                  </h3>
                  <p className="text-xs text-amber-400 font-mono">
                    आवेदन ID: {paymentApprovalModalLead.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPaymentApprovalModalLead(null);
                  setShowRejectBox(false);
                }}
                className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details Box */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-2.5">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>१. खरिदकर्ता / ग्राहक विवरण</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-stone-400 text-[11px] block">ग्राहकको पूरा नाम:</span>
                  <span className="font-extrabold text-stone-100 text-sm">
                    {paymentApprovalModalLead.fullName || 'ग्राहक'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 text-[11px] block">सम्पर्क मोबाइल नम्बर:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {paymentApprovalModalLead.mobile || 'उपलब्ध छैन'}
                    </span>
                    {paymentApprovalModalLead.mobile && (
                      <button
                        type="button"
                        onClick={() => handleCopy(paymentApprovalModalLead.mobile, 'मोबाइल नम्बर')}
                        className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-stone-200 cursor-pointer"
                        title="नम्बर प्रतिलिपि गर्नुहोस्"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-stone-400 text-[11px] block">ठेगाना:</span>
                  <span className="text-stone-200 font-medium">
                    {paymentApprovalModalLead.address || 'नेपाल'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 text-[11px] block">इमेल ठेगाना:</span>
                  <span className="text-stone-200 font-mono">
                    {paymentApprovalModalLead.email || 'उपलब्ध छैन'}
                  </span>
                </div>
              </div>

              {/* Direct Communication Buttons */}
              <div className="pt-2 flex items-center gap-2 border-t border-stone-800/80">
                {paymentApprovalModalLead.whatsapp && (
                  <button
                    type="button"
                    onClick={() => handleOpenWhatsApp(paymentApprovalModalLead.whatsapp || paymentApprovalModalLead.mobile)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp मा कुरा गर्नुहोस्</span>
                  </button>
                )}
                {paymentApprovalModalLead.mobile && (
                  <a
                    href={`tel:${paymentApprovalModalLead.mobile}`}
                    className="py-1.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                    <span>फोन गर्नुहोस्</span>
                  </a>
                )}
              </div>
            </div>

            {/* Payment & Package Box */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>२. भुक्तानी तथा खरिद गरिएको प्याकेज</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 text-[11px] block">खरिद गरिएको योजना:</span>
                  <span className="font-extrabold text-amber-400 text-sm block mt-0.5">
                    {paymentApprovalModalLead.planNameNepali || '१ वर्षको सदस्यता'}
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {paymentApprovalModalLead.planId?.includes('lifetime') ? 'आजीवन असीमित पहुँच' : '१ वर्षको पूर्ण लाइसेन्स'}
                  </span>
                </div>

                <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 text-[11px] block">जम्मा भुक्तानी रकम:</span>
                  <span className="font-black text-emerald-400 text-base font-mono block mt-0.5">
                    रु. {toDevanagariNumerals(paymentApprovalModalLead.planAmountNPR || 0)}
                  </span>
                  <span className="text-[10px] text-stone-500">करसहित कुल रकम</span>
                </div>

                <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 text-[11px] block">भुक्तानी माध्यम:</span>
                  <div className="mt-1 flex items-center gap-1.5">
                    {paymentApprovalModalLead.paymentMethod === 'esewa' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-green-950 text-green-400 border border-green-800">
                        eSewa (मोबाइल वालेट)
                      </span>
                    ) : paymentApprovalModalLead.paymentMethod === 'khalti' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-950 text-purple-400 border border-purple-800">
                        Khalti (डिजिटल वालेट)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-950 text-blue-400 border border-blue-800">
                        बैंक दाखिला (Bank Transfer)
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 text-[11px] block">कारोबार नम्बर (Transaction ID):</span>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="font-mono font-black text-amber-300 text-sm select-all">
                      {paymentApprovalModalLead.transactionId || 'उपलब्ध छैन'}
                    </span>
                    {paymentApprovalModalLead.transactionId && (
                      <button
                        type="button"
                        onClick={() => handleCopy(paymentApprovalModalLead.transactionId!, 'कारोबार कोड')}
                        className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-stone-200 cursor-pointer"
                        title="प्रतिलिपि गर्नुहोस्"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
                <span>आवेदन मिति (BS): <strong className="text-stone-200">{paymentApprovalModalLead.submittedAtBS || '२०८१'}</strong></span>
                <span>आवेदन समय (AD): <strong className="text-stone-200 font-mono">{paymentApprovalModalLead.submittedAtISO ? new Date(paymentApprovalModalLead.submittedAtISO).toLocaleString() : ''}</strong></span>
              </div>
            </div>

            {/* Current Status Box */}
            <div>
              {paymentApprovalModalLead.status === 'PURCHASE_PENDING' ? (
                <div className="bg-rose-950/40 border border-rose-800/80 rounded-2xl p-3.5 text-xs text-rose-300 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-rose-200">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span>🔴 भुक्तानी प्रमाणीकरण बाँकी (Verification Pending)</span>
                  </div>
                  <p className="text-[11px] text-rose-300/90 leading-relaxed">
                    कृपया आफ्नो eSewa, Khalti, बैंक वा नगद खातामा उल्लिखित कारोबार ID (Txn: {paymentApprovalModalLead.transactionId || 'नगद'}) र रकम रु. {toDevanagariNumerals(paymentApprovalModalLead.planAmountNPR || 0)} जम्मा भएको रुजु गर्नुहोस्। रकम प्राप्त भएको खण्डमा तलको हरियो बटन थिचेर तुरुन्त स्वीकृत गर्नुहोस्।
                  </p>
                </div>
              ) : paymentApprovalModalLead.status === 'PURCHASE_APPROVED' ? (
                <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-2xl p-3.5 text-xs text-emerald-300 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>🟢 खरिद पहिल्यै स्वीकृत भइसकेको छ (Service Unlocked & Active)</span>
                  </div>
                  <p className="text-[11px] text-emerald-300/90">
                    स्वीकृत गर्ने प्रशासक: {paymentApprovalModalLead.approvedBy || 'SuperAdmin'} • मिति: {paymentApprovalModalLead.approvedAtBS || '२०८१'}
                  </p>
                </div>
              ) : (
                <div className="bg-stone-800 border border-stone-700 rounded-2xl p-3.5 text-xs text-stone-300 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-stone-200">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>🔴 खरिद आवेदन अस्वीकृत गरिएको छ</span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    कारण: {paymentApprovalModalLead.rejectionReason || 'अमान्य भुक्तानी'}
                  </p>
                </div>
              )}
            </div>

            {/* Verification Inputs Box */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-3 text-xs">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>३. प्रशासक रुजु तथा प्रमाणीकरण विवरण</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-stone-400 font-bold block">रुजु गरिएको रकम (रु.):</label>
                  <input
                    type="number"
                    value={verifiedAmountInput}
                    onChange={(e) => setVerifiedAmountInput(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 font-mono text-xs outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-stone-400 font-bold block">रुजु गर्ने प्रशासकको नाम:</label>
                  <input
                    type="text"
                    value={approvalAdminName}
                    onChange={(e) => setApprovalAdminName(e.target.value)}
                    className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-stone-400 font-bold block">प्रशासक नोट / कैफियत (वैकल्पिक):</label>
                  <input
                    type="text"
                    value={approvalAdminNotes}
                    onChange={(e) => setApprovalAdminNotes(e.target.value)}
                    placeholder="उदा. eSewa वालेटमा रकम प्राप्त भयो र रुजु गरियो..."
                    className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* CASH PAYMENT RECEIVED AND VERIFIED MANDATORY CHECKBOX */}
            {paymentApprovalModalLead.paymentMethod === 'cash' && (
              <div className="bg-amber-950/50 border-2 border-amber-500/80 rounded-2xl p-4 space-y-2 text-xs animate-pulse">
                <div className="flex items-center gap-2 text-amber-300 font-extrabold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>नगद भुक्तानी रुजु आवश्यकता (Cash Verification Mandatory)</span>
                </div>
                <p className="text-stone-300 text-[11px] leading-relaxed">
                  यस ग्राहकले नगद (Cash) भुक्तानी विकल्प रोज्नुभएको छ। ग्राहकबाट तोकिएको रकम <strong>रु. {toDevanagariNumerals(paymentApprovalModalLead.planAmountNPR || 0)}</strong> भौतिक रूपमा प्राप्त भएपछि मात्र तलको बाकसमा टिक लगाउनुहोस्। टिक नलगाई खरिद स्वीकृत गर्न मिल्दैन।
                </p>
                <label className="flex items-center gap-3 pt-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isCashVerified}
                    onChange={(e) => setIsCashVerified(e.target.checked)}
                    className="w-5 h-5 rounded border-amber-600 bg-stone-900 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <span className="font-extrabold text-amber-300 text-xs sm:text-sm">
                    [✓] नगद भुक्तानी प्राप्त भयो र रुजु गरियो (Cash payment received and verified)
                  </span>
                </label>
              </div>
            )}

            {/* Rejection Reason Form (if clicked Reject) */}
            {showRejectBox && (
              <div className="bg-rose-950/30 border border-rose-900 rounded-2xl p-3 space-y-2 text-xs animate-in fade-in duration-100">
                <label className="text-rose-300 font-bold block">अस्वीकृत गर्ने कारण खुलाउनुहोस्:</label>
                <input
                  type="text"
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="जस्तै: रकम बैंक खातामा प्राप्त भएन, कारोबार ID मिलेन..."
                  className="w-full p-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 outline-none text-xs"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowRejectBox(false)}
                    className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs cursor-pointer"
                  >
                    रद्द
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const res = unifiedUserSyncService.rejectPurchase(paymentApprovalModalLead.id, rejectionReasonInput || 'अमान्य भुक्तानी प्रमाण', approvalAdminName);
                      showToast(res.messageNepali);
                      setPaymentApprovalModalLead(null);
                      setShowRejectBox(false);
                      setRejectionReasonInput('');
                      fetchUsers(true);
                    }}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs cursor-pointer"
                  >
                    अस्वीकृति पुष्टि गर्नुहोस्
                  </button>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => {
                  setPaymentApprovalModalLead(null);
                  setShowRejectBox(false);
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                बन्द गर्नुहोस्
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                {paymentApprovalModalLead.status !== 'PURCHASE_REJECTED' && !showRejectBox && (
                  <button
                    type="button"
                    onClick={() => setShowRejectBox(true)}
                    className="px-3.5 py-2.5 bg-stone-800 hover:bg-rose-950 text-rose-400 hover:text-rose-300 border border-stone-700 hover:border-rose-800 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    अस्वीकृत गर्नुहोस्
                  </button>
                )}

                {(() => {
                  const isCash = paymentApprovalModalLead.paymentMethod === 'cash';
                  const canApprove = !isCash || isCashVerified || paymentApprovalModalLead.cashVerified;

                  return (
                    <button
                      type="button"
                      disabled={!canApprove}
                      onClick={() => {
                        const res = unifiedUserSyncService.approvePurchase(paymentApprovalModalLead.id, approvalAdminName, {
                          cashVerified: isCashVerified,
                          verifiedAmount: verifiedAmountInput,
                          adminNotes: approvalAdminNotes
                        });
                        showToast(res.messageNepali);
                        setPaymentApprovalModalLead(null);
                        fetchUsers(true);
                      }}
                      className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black shadow-lg flex items-center justify-center gap-2 transition-all ${
                        canApprove
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-950/60 cursor-pointer active:scale-95'
                          : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed opacity-60'
                      }`}
                      title={!canApprove ? 'नगद भुक्तानी रुजु बाकसमा टिक लगाउनुहोस्' : 'स्वीकृत गरी सेवा खुल्ला गर्नुहोस्'}
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        {paymentApprovalModalLead.status === 'PURCHASE_APPROVED'
                          ? 'लाइसेन्स पुनः नवीकरण / सक्रिय गर्नुहोस्'
                          : 'स्वीकृत गरी सेवा खुल्ला गर्नुहोस् (Approve & Unlock)'}
                      </span>
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── PERMANENT USER DELETION CONFIRMATION MODAL ── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-stone-900 border-2 border-rose-500/80 rounded-3xl p-6 space-y-5 shadow-2xl shadow-rose-950/50">
            {/* Header */}
            <div className="flex items-center gap-3.5 border-b border-rose-500/30 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-rose-200">
                  स्थायी रूपमा हटाउने पुष्टि (Permanent Delete)
                </h3>
                <p className="text-xs text-rose-400 font-medium">
                  यो कार्य फिर्ता (Undo) गर्न सकिँदैन!
                </p>
              </div>
            </div>

            {/* User Target Card */}
            <div className="bg-stone-950 border border-rose-900/60 p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-stone-800/80">
                <span className="text-stone-400">नाम:</span>
                <span className="font-extrabold text-stone-100 text-sm">{userToDelete.fullName || 'विवरण उपलब्ध छैन'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-800/80">
                <span className="text-stone-400">मोबाइल / फोन:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">{userToDelete.phone}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-800/80">
                <span className="text-stone-400">ग्राहक / User ID:</span>
                <span className="font-mono text-stone-300">{userToDelete.customerId || userToDelete.id}</span>
              </div>
              {userToDelete.email && (
                <div className="flex justify-between items-center py-1 border-b border-stone-800/80">
                  <span className="text-stone-400">इमेल:</span>
                  <span className="font-mono text-stone-300">{userToDelete.email}</span>
                </div>
              )}
              {userToDelete.address && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-stone-400">ठेगाना:</span>
                  <span className="text-stone-300">{userToDelete.address}</span>
                </div>
              )}
            </div>

            {/* Warning Message */}
            <div className="p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-2xl text-xs text-rose-200 space-y-1.5 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>सावधानी: सम्पूर्ण डेटा स्थायी रूपमा मेटिनेछ</span>
              </div>
              <p className="text-[11px] text-stone-300">
                यस प्रयोगकर्ताको खाता, लगइन अधिकार, मेनु पहुँच स्विचबोर्ड नीति, सेवा सदस्यता तथा लाइसेन्स (ज्योतिष/वास्तु) र भुक्तानी अभिलेखहरू सबै प्रणालीबाट तत्काल हटाइनेछन्।
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                रद्द गर्नुहोस् (Cancel)
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteUser}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black rounded-xl text-xs shadow-lg shadow-rose-950/80 flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'हटाउँदैछ...' : 'स्थायी रूपमा हटाउनुहोस् (Delete)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ── PERMANENT PURCHASE LEAD DELETION CONFIRMATION MODAL ── */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-stone-900 border-2 border-rose-500/80 rounded-3xl p-6 space-y-5 shadow-2xl shadow-rose-950/50">
            {/* Header */}
            <div className="flex items-center gap-3.5 border-b border-rose-500/30 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-black text-rose-200">
                  खरिद आवेदन स्थायी रूपमा हटाउने पुष्टि
                </h3>
                <p className="text-xs text-rose-400 font-medium">
                  यो कार्य फिर्ता (Undo) गर्न सकिँदैन!
                </p>
              </div>
            </div>

            {/* Lead Target Card */}
            <div className="bg-stone-950 border border-rose-900/60 p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-stone-800/80">
                <span className="text-stone-400">खरिदकर्ताको नाम:</span>
                <span className="font-extrabold text-stone-100 text-sm">{leadToDelete.fullName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-800/80">
                <span className="text-stone-400">मोबाइल / फोन:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">{leadToDelete.mobile}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-stone-800/80">
                <span className="text-stone-400">प्लान:</span>
                <span className="text-stone-200 font-bold">{leadToDelete.planNameNepali} (रु. {leadToDelete.planAmountNPR})</span>
              </div>
              {leadToDelete.transactionId && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-stone-400">कारोबार कोड (Txn):</span>
                  <span className="font-mono text-stone-300">{leadToDelete.transactionId}</span>
                </div>
              )}
            </div>

            {/* Warning Message */}
            <div className="p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-2xl text-xs text-rose-200 space-y-1.5 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5 text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>सावधानी: खरिद आवेदन तथा लाइसेन्स स्थायी रूपमा मेटिनेछ</span>
              </div>
              <p className="text-[11px] text-stone-300">
                यस खरिद रेकर्ड, भुक्तानी प्रमाण र सम्बन्धित सेवा सदस्यता डेटाबेसबाट सधैंका लागि मेटिनेछ।
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setLeadToDelete(null)}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                रद्द गर्नुहोस् (Cancel)
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteLead}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black rounded-xl text-xs shadow-lg shadow-rose-950/80 flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'हटाउँदैछ...' : 'स्थायी रूपमा हटाउनुहोस् (Delete)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
