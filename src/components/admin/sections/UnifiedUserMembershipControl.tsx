import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Calendar,
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
  X,
  CreditCard,
  Crown,
  Smartphone,
  Monitor,
  CheckSquare,
  Square,
  ExternalLink,
  Info,
  DollarSign,
  AlertCircle,
  ArrowUpDown,
  Laptop
} from 'lucide-react';
import { toDevanagariNumerals } from '../../../utils/nepaliCalendar';
import { unifiedUserSyncService, REALTIME_SSE_URL } from '../../../services/unifiedUserSyncService';
import { authService } from '../../../services/authService';
import { apiClient } from '../../../services/apiClient';

const getAdminHeaders = (): Record<string, string> => {
  const token = typeof localStorage !== 'undefined'
    ? localStorage.getItem('balananda_superadmin_jwt_v2') ||
      localStorage.getItem('balananda_superadmin_auth_token') ||
      localStorage.getItem('superadmin_token') ||
      sessionStorage.getItem('superadmin_token')
    : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (token && token !== 'SUPERADMIN' && token !== 'SUPER_ADMIN') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export interface UnifiedUserRecord {
  id: string;
  customerId: string;
  fullName: string;
  address: string;
  phone: string;
  username?: string;
  userCategory?: 'visitor' | 'member' | 'professional';
  paymentAmountNPR?: number;
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
  profileCompleted?: boolean;
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
  membership: any;
  membershipStatus: 'ACTIVE' | 'EXPIRED' | 'PENDING_PAYMENT' | 'NONE';
  purchasedPlan: string;
  paymentStatus: 'VERIFIED' | 'PENDING' | 'REJECTED' | 'UNPAID';
  remainingDays: number;
  showWarning30Days: boolean;
  activationDateISO: string | null;
  activationDateBS: string | null;
  expiryDateISO: string | null;
  expiryDateBS: string | null;
  availableServices: string[];
  purchaseHistory: any[];
  membershipHistory: any[];
  auditLogs: any[];
  adminNotes: any[];
  history: any[];
  licenses: any[];
}

export interface UserStats {
  totalUsers: number;
  regularLoginUsers: number;
  contactVerifiedUsers: number;
  pendingPurchases: number;
  paymentVerifiedUsers: number;
  activeMembers: number;
  trialUsers: number;
  expiredMembers: number;
  suspendedInactiveUsers: number;
  expiringIn30Days: number;
  todaySignups: number;
}

// 9 Master Classification Filters
export type MasterFilterKey =
  | 'all'
  | 'regular_login'
  | 'contact_verified'
  | 'pending_payment'
  | 'payment_verified'
  | 'active_member'
  | 'trial_user'
  | 'expired_member'
  | 'suspended_inactive';

interface UnifiedUserMembershipControlProps {
  initialSearchPhone?: string;
  onNavigateTab?: (tab: string, param?: string) => void;
}

export const UnifiedUserMembershipControl: React.FC<UnifiedUserMembershipControlProps> = ({
  initialSearchPhone = '',
  onNavigateTab
}) => {
  // State: List, Filtering & Pagination
  const [users, setUsers] = useState<UnifiedUserRecord[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    regularLoginUsers: 0,
    contactVerifiedUsers: 0,
    pendingPurchases: 0,
    paymentVerifiedUsers: 0,
    activeMembers: 0,
    trialUsers: 0,
    expiredMembers: 0,
    suspendedInactiveUsers: 0,
    expiringIn30Days: 0,
    todaySignups: 0
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<MasterFilterKey>('all');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchPhone);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Modal Control
  const [selectedUser, setSelectedUser] = useState<UnifiedUserRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeModalTab, setActiveModalTab] = useState<'info' | 'status' | 'membership' | 'activation' | 'history'>('info');

  // Copy Feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modal Form States
  // Tab 1: Edit Profile
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editDobBS, setEditDobBS] = useState('');
  const [editDobAD, setEditDobAD] = useState('');
  const [editBirthTime, setEditBirthTime] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Tab 2: Account Status
  const [targetStatus, setTargetStatus] = useState<'active' | 'suspended' | 'inactive'>('active');
  const [statusReason, setStatusReason] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [newAdminNote, setNewAdminNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Tab 3: Membership Mutations
  const [renewDuration, setRenewDuration] = useState<'1_year' | 'lifetime'>('1_year');
  const [extendPeriod, setExtendPeriod] = useState<'1_month' | '3_months' | '1_year'>('1_year');
  const [mutationReason, setMutationReason] = useState('');
  const [savingMutation, setSavingMutation] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>(['jyotish', 'vastu', 'karmakanda', 'panchanga']);

  // Tab 4: Direct Activation Form
  const [actPlanId, setActPlanId] = useState<string>('yearly_both');
  const [actPaymentMethod, setActPaymentMethod] = useState<'cash' | 'esewa' | 'khalti' | 'bank'>('cash');
  const [actCashVerified, setActCashVerified] = useState<boolean>(false);
  const [actAmount, setActAmount] = useState<number>(1200);
  const [actAdminNotes, setActAdminNotes] = useState<string>('');
  const [activatingMembership, setActivatingMembership] = useState<boolean>(false);

  // Tab 5: Purchase Action
  const [purchaseActionReason, setPurchaseActionReason] = useState('');
  const [processingPurchaseId, setProcessingPurchaseId] = useState<string | null>(null);
  const [cashApprovalChecked, setCashApprovalChecked] = useState<boolean>(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // ── 16-COLUMN SPREADSHEET INLINE ACTIONS ──
  const [editingPaymentAmounts, setEditingPaymentAmounts] = useState<Record<string, number | string>>({});
  const [savingPaymentId, setSavingPaymentId] = useState<string | null>(null);
  const [savingCategoryId, setSavingCategoryId] = useState<string | null>(null);

  const handleUpdatePaymentAmount = async (userId: string, currentVal: number | string) => {
    const val = editingPaymentAmounts[userId] !== undefined ? Number(editingPaymentAmounts[userId]) : Number(currentVal);
    setSavingPaymentId(userId);
    try {
      const res = await fetch(apiClient.resolveUrl(`/api/admin/users/${userId}/payment-amount`), {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ amountNPR: val })
      });
      const data = await res.json();
      if (data.success) {
        showToast('भुक्तानी रकम सफलतापूर्वक बचत भयो!', 'success');
        fetchUsers(true);
      } else {
        showToast(data.error || 'बचत गर्न सकिएन।', 'error');
      }
    } catch {
      showToast('सर्भर त्रुटि भयो।', 'error');
    } finally {
      setSavingPaymentId(null);
    }
  };

  const handleChangeCategoryDirect = async (userId: string, newCat: 'visitor' | 'member' | 'professional') => {
    setSavingCategoryId(userId);
    try {
      const res = await authService.updateUserCategory(userId, newCat);
      if (res.success) {
        showToast(`प्रयोगकर्ताको वर्ग '${newCat}' मा परिवर्तन भयो।`, 'success');
        fetchUsers(true);
      } else {
        showToast(res.message || 'वर्ग परिवर्तन असफल भयो।', 'error');
      }
    } catch {
      showToast('त्रुटि भयो।', 'error');
    } finally {
      setSavingCategoryId(null);
    }
  };

  // 1. Fetch Users with Real Filters
  const fetchUsers = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        filter: activeFilter,
        search: searchQuery.trim(),
        sort: sortBy,
        page: String(currentPage),
        limit: String(pageSize)
      });

      const res = await fetch(apiClient.resolveUrl(`/api/superadmin/users?${params.toString()}`), {
        headers: getAdminHeaders()
      });

      if (!res.ok) {
        throw new Error(`सर्भर त्रुटि (${res.status})`);
      }

      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        setStats(data.stats || stats);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);

        // Keep selected user fresh if modal open
        if (selectedUser) {
          const fresh = data.users.find((u: UnifiedUserRecord) => u.id === selectedUser.id || u.phone === selectedUser.phone);
          if (fresh) setSelectedUser(fresh);
        }
      } else {
        throw new Error(data.error || 'डेटा लोड हुन सकेन।');
      }
    } catch (err: any) {
      console.error('[UnifiedUserControl] Fetch Error:', err);
      setError(err.message || 'प्रयोगकर्ता डेटा लोड गर्दा समस्या भयो।');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter, searchQuery, sortBy, currentPage, pageSize, selectedUser]);

  // Initial and reactive load
  useEffect(() => {
    fetchUsers();
  }, [activeFilter, sortBy, currentPage, pageSize]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers();
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Real-time SSE / Broadcast listener
  useEffect(() => {
    let evtSource: EventSource | null = null;
    if (typeof window !== 'undefined' && 'EventSource' in window) {
      try {
        evtSource = new EventSource(REALTIME_SSE_URL);
        evtSource.onmessage = (e) => {
          try {
            const parsed = JSON.parse(e.data);
            if ([
              'USER_REGISTERED',
              'USER_PROFILE_UPDATED',
              'USER_STATUS_CHANGED',
              'MEMBERSHIP_ACTIVATED',
              'MEMBERSHIP_APPROVED',
              'MEMBERSHIP_REJECTED',
              'MEMBERSHIP_STATUS_MUTATED',
              'USER_SERVICES_UPDATED'
            ].includes(parsed.type)) {
              fetchUsers(true);
            }
          } catch {}
        };
      } catch {}
    }

    const handleSync = () => fetchUsers(true);
    if (typeof window !== 'undefined') {
      window.addEventListener('user-registered', handleSync);
      window.addEventListener('user-storage-updated', handleSync);
      window.addEventListener('unified-data-updated', handleSync);
      window.addEventListener('client-leads-updated', handleSync);
      window.addEventListener('service-license-updated', handleSync);
    }

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('balananda_unified_sync_bus_v2');
        bc.onmessage = (event) => {
          if (event.data?.type === 'SYNC_DATA_UPDATED' || event.data?.type === 'SYSTEM_RESET') {
            fetchUsers(true);
          }
        };
      } catch {}
    }

    let unsub: (() => void) | null = null;
    if (typeof unifiedUserSyncService?.subscribe === 'function') {
      try {
        unsub = unifiedUserSyncService.subscribe(() => {
          fetchUsers(true);
        });
      } catch {}
    }

    return () => {
      if (evtSource) evtSource.close();
      if (typeof window !== 'undefined') {
        window.removeEventListener('user-registered', handleSync);
        window.removeEventListener('user-storage-updated', handleSync);
        window.removeEventListener('unified-data-updated', handleSync);
        window.removeEventListener('client-leads-updated', handleSync);
        window.removeEventListener('service-license-updated', handleSync);
      }
      if (bc) bc.close();
      if (unsub) unsub();
    };
  }, [fetchUsers]);

  // Populate modal fields on user selection
  const handleOpenUserModal = (u: UnifiedUserRecord, tab: 'info' | 'status' | 'membership' | 'activation' | 'history' = 'info') => {
    setSelectedUser(u);
    setActiveModalTab(tab);

    // Populate Tab 1 (Profile Edit)
    setEditFullName(u.fullName || '');
    setEditPhone(u.phone || '');
    setEditEmail(u.email || '');
    setEditWhatsapp(u.whatsapp || '');
    setEditAddress(u.address || '');
    setEditDobBS(u.dobBS || '');
    setEditDobAD(u.dobAD || '');
    setEditBirthTime(u.birthTime || '');

    // Populate Tab 2 (Account Status)
    setTargetStatus(u.status || 'active');
    setStatusReason('');

    // Populate Tab 3 (Services)
    setSelectedServices(u.availableServices?.length ? u.availableServices : ['jyotish', 'vastu', 'panchanga']);
    setMutationReason('');

    // Populate Tab 4 (Activation Form default)
    setActPlanId('yearly_both');
    setActAmount(1200);
    setActCashVerified(false);
    setActAdminNotes('');

    // Tab 5 Reset
    setCashApprovalChecked(false);
    setPurchaseActionReason('');

    setIsModalOpen(true);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ── SAVE PROFILE (Tab 1) ──
  const handleSaveProfile = async () => {
    if (!selectedUser) return;
    setSavingProfile(true);
    try {
      const res = await fetch(apiClient.resolveUrl(`/api/superadmin/users/${selectedUser.id}`), {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          fullName: editFullName,
          phone: editPhone,
          email: editEmail,
          whatsapp: editWhatsapp,
          address: editAddress,
          dobBS: editDobBS,
          dobAD: editDobAD,
          birthTime: editBirthTime
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast('प्रयोगकर्ता विवरण सफलतापूर्वक सुरक्षित भयो!', 'success');
        setSelectedUser(data.user);
        fetchUsers(true);
      } else {
        showToast(data.error || 'विवरण सुरक्षित गर्न सकिएन।', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'नेटवर्क समस्या भयो।', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // ── SAVE ACCOUNT STATUS (Tab 2) ──
  const handleSaveStatus = async () => {
    if (!selectedUser) return;
    if ((targetStatus === 'suspended' || targetStatus === 'inactive') && !statusReason.trim()) {
      showToast('खाता निलम्बन वा निष्क्रिय गर्न कारण (Reason) अनिवार्य छ।', 'error');
      return;
    }

    setSavingStatus(true);
    try {
      const res = await fetch(apiClient.resolveUrl(`/api/superadmin/users/${selectedUser.id}/status`), {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          status: targetStatus,
          reason: statusReason.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'खाता स्थिति परिवर्तन गरियो!', 'success');
        setSelectedUser(data.user);
        setStatusReason('');
        fetchUsers(true);
      } else {
        showToast(data.error || 'स्थिति परिवर्तन असफल भयो।', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'सर्भर त्रुटि भयो।', 'error');
    } finally {
      setSavingStatus(false);
    }
  };

  // ── TRIAL ACTIONS (Tab 2) ──
  const handleTrialAction = async (action: 'activate' | 'reset') => {
    if (!selectedUser) return;
    try {
      const res = await fetch(apiClient.resolveUrl(`/api/superadmin/users/${selectedUser.id}/trial`), {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        setSelectedUser(data.user);
        fetchUsers(true);
      } else {
        showToast(data.error || 'कार्य असफल भयो।', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'त्रुटि भयो।', 'error');
    }
  };

  // ── ADD ADMIN NOTE (Tab 2) ──
  const handleAddAdminNote = async () => {
    if (!selectedUser || !newAdminNote.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch(apiClient.resolveUrl(`/api/superadmin/users/${selectedUser.id}/notes`), {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ note: newAdminNote.trim() })
      });
      const data = await res.json();
      if (data.success) {
        showToast('प्रशासक नोट थपियो!', 'success');
        setNewAdminNote('');
        fetchUsers(true);
      } else {
        showToast(data.error || 'नोट थप्न सकिएन।', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'सर्भर त्रुटि।', 'error');
    } finally {
      setSavingNote(false);
    }
  };

  // ── TOGGLE SERVICE (Tab 3) ──
  const handleSaveServices = async () => {
    if (!selectedUser) return;
    setSavingMutation(true);
    try {
      const res = await fetch(apiClient.resolveUrl(`/api/superadmin/users/${selectedUser.id}/toggle-service`), {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          services: selectedServices,
          reason: mutationReason.trim() || 'सेवा पहुँच अद्यावधिक'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'सेवा पहुँच अद्यावधिक भयो!', 'success');
        setSelectedUser(data.user);
        fetchUsers(true);
      } else {
        showToast(data.error || 'सेवा अद्यावधिक असफल भयो।', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'त्रुटि भयो।', 'error');
    } finally {
      setSavingMutation(false);
    }
  };

  // ── MEMBERSHIP STATUS MUTATION: RENEW, EXTEND, SUSPEND (Tab 3) ──
  const handleMutateMembership = async (action: 'renew' | 'extend' | 'suspend') => {
    if (!selectedUser) return;
    if (action === 'suspend' && !mutationReason.trim()) {
      showToast('सदस्यता निलम्बन गर्न कारण अनिवार्य छ।', 'error');
      return;
    }

    setSavingMutation(true);
    try {
      const res = await fetch(apiClient.resolveUrl(`/api/superadmin/users/${selectedUser.id}/membership-status`), {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          action,
          duration: action === 'renew' ? renewDuration : extendPeriod,
          reason: mutationReason.trim() || (action === 'renew' ? 'सदस्यता नवीकरण' : 'म्याद थप')
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'सदस्यता कार्य सम्पन्न भयो!', 'success');
        setSelectedUser(data.user);
        setMutationReason('');
        fetchUsers(true);
      } else {
        showToast(data.error || 'सदस्यता कार्य असफल भयो।', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'सर्भर त्रुटि भयो।', 'error');
    } finally {
      setSavingMutation(false);
    }
  };

  // ── DIRECT MEMBERSHIP ACTIVATION FORM (Tab 4) ──
  const officialPlans: Record<string, { name: string; device: string; price: number; dur: string }> = {
    yearly_mobile: { name: 'मोबाइल मात्र (१ वर्ष)', device: 'Mobile Only', price: 200, dur: '1_year' },
    lifetime_mobile: { name: 'मोबाइल मात्र (आजीवन)', device: 'Mobile Only', price: 1000, dur: 'lifetime' },
    yearly_computer: { name: 'कम्प्युटर मात्र (१ वर्ष)', device: 'Computer Only', price: 500, dur: '1_year' },
    lifetime_computer: { name: 'कम्प्युटर मात्र (आजीवन)', device: 'Computer Only', price: 2500, dur: 'lifetime' },
    yearly_both: { name: 'मोबाइल + कम्प्युटर दुवै (१ वर्ष)', device: 'Mobile + Computer', price: 1200, dur: '1_year' },
    lifetime_both: { name: 'मोबाइल + कम्प्युटर दुवै (आजीवन)', device: 'Mobile + Computer', price: 3000, dur: 'lifetime' }
  };

  const handlePlanChange = (pId: string) => {
    setActPlanId(pId);
    if (officialPlans[pId]) {
      setActAmount(officialPlans[pId].price);
    }
  };

  const handleActivateMembership = async () => {
    if (!selectedUser) return;

    // Strict cash payment enforcement
    if (actPaymentMethod === 'cash' && !actCashVerified) {
      showToast('नगद भुक्तानी प्राप्त भएको रुजु (Cash Payment Verified) चेकबक्स अनिवार्य छ!', 'error');
      return;
    }

    setActivatingMembership(true);
    try {
      const res = await fetch(apiClient.resolveUrl(`/api/superadmin/users/${selectedUser.id}/activate-membership`), {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          planId: actPlanId,
          paymentMethod: actPaymentMethod,
          cashVerified: actCashVerified,
          verifiedAmount: actAmount,
          adminNotes: actAdminNotes.trim() || 'सुपरएडमिन द्वारा प्रत्यक्ष सदस्यता सक्रिय गरिएको',
          customDuration: officialPlans[actPlanId]?.dur || '1_year',
          services: selectedServices
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'सदस्यता सफलतापूर्वक सक्रिय भयो!', 'success');
        setSelectedUser(data.user);
        setActiveModalTab('membership');
        fetchUsers(true);
      } else {
        showToast(data.error || 'सदस्यता सक्रिय गर्न सकिएन।', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'सर्भर त्रुटि भयो।', 'error');
    } finally {
      setActivatingMembership(false);
    }
  };

  // ── APPROVE/REJECT PURCHASE REQUEST (Tab 5) ──
  const handleApprovePurchaseRequest = async (purchase: any) => {
    if (!selectedUser) return;
    if (purchase.paymentMethod === 'cash' && !cashApprovalChecked) {
      showToast('नगद भुक्तानी प्राप्त भएको रुजु चेकबक्स अनिवार्य छ।', 'error');
      return;
    }

    setProcessingPurchaseId(purchase.id);
    try {
      const res = await fetch(apiClient.resolveUrl(`/api/superadmin/memberships/${purchase.id}/approve`), {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          cashVerified: purchase.paymentMethod === 'cash' ? cashApprovalChecked : true,
          verifiedAmount: purchase.planAmountNPR || purchase.amountNPR,
          adminNotes: purchaseActionReason.trim() || 'सुपरएडमिन द्वारा खरिद स्वीकृत'
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast('खरिद अनुरोध सफलतापूर्वक स्वीकृत भयो र सेवा स्वतः सक्रिय गरियो!', 'success');
        fetchUsers(true);
        setCashApprovalChecked(false);
        setPurchaseActionReason('');
      } else {
        showToast(data.message || 'खरिद स्वीकृत गर्न सकिएन।', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'त्रुटि भयो।', 'error');
    } finally {
      setProcessingPurchaseId(null);
    }
  };

  const handleRejectPurchaseRequest = async (purchase: any) => {
    if (!selectedUser) return;
    if (!purchaseActionReason.trim()) {
      showToast('खरिद अनुरोध अस्वीकृत गर्न कारण अनिवार्य छ।', 'error');
      return;
    }

    setProcessingPurchaseId(purchase.id);
    try {
      const res = await fetch(apiClient.resolveUrl(`/api/superadmin/memberships/${purchase.id}/reject`), {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          reason: purchaseActionReason.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast('खरिद अनुरोध अस्वीकृत गरियो।', 'info');
        fetchUsers(true);
        setPurchaseActionReason('');
      } else {
        showToast(data.message || 'अस्वीकृत गर्न सकिएन।', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'त्रुटि भयो।', 'error');
    } finally {
      setProcessingPurchaseId(null);
    }
  };

  // 9 Filter Tabs Configuration
  const filterTabs: Array<{ key: MasterFilterKey; label: string; count: number; badgeColor: string }> = [
    { key: 'all', label: '१. सबै प्रयोगकर्ता', count: stats.totalUsers, badgeColor: 'bg-stone-800 text-stone-200' },
    { key: 'regular_login', label: '२. सामान्य Login User', count: stats.regularLoginUsers, badgeColor: 'bg-stone-700 text-stone-300' },
    { key: 'contact_verified', label: '३. सम्पर्क विवरण Verified User', count: stats.contactVerifiedUsers, badgeColor: 'bg-cyan-900/40 text-cyan-300 border border-cyan-800/60' },
    { key: 'pending_payment', label: '४. खरिद/भुक्तानी पर्खिरहेका', count: stats.pendingPurchases, badgeColor: 'bg-amber-900/50 text-amber-300 border border-amber-800/80 animate-pulse' },
    { key: 'payment_verified', label: '५. खरिद प्रमाणित भएका', count: stats.paymentVerifiedUsers, badgeColor: 'bg-blue-900/50 text-blue-300 border border-blue-800' },
    { key: 'active_member', label: '६. सक्रिय सदस्य', count: stats.activeMembers, badgeColor: 'bg-emerald-900/50 text-emerald-300 border border-emerald-800' },
    { key: 'trial_user', label: '७. Trial User', count: stats.trialUsers, badgeColor: 'bg-purple-900/50 text-purple-300 border border-purple-800' },
    { key: 'expired_member', label: '८. म्याद सकिएका सदस्य', count: stats.expiredMembers, badgeColor: 'bg-red-900/50 text-red-300 border border-red-800' },
    { key: 'suspended_inactive', label: '९. निष्क्रिय वा निलम्बित', count: stats.suspendedInactiveUsers, badgeColor: 'bg-stone-900 text-stone-400 border border-stone-800' }
  ];

  return (
    <div className="space-y-6">
      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-semibold transition-all duration-300 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-600/60 shadow-emerald-950/50'
              : toastMessage.type === 'error'
              ? 'bg-red-950 text-red-200 border-red-600/60 shadow-red-950/50'
              : 'bg-stone-900 text-stone-200 border-stone-700 shadow-black/80'
          }`}
        >
          {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toastMessage.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />}
          {toastMessage.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
          <span>{toastMessage.text}</span>
          <button type="button" onClick={() => setToastMessage(null)} className="ml-2 text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── TOP MASTER HEADER & STATS ── */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 sm:p-7 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-stone-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight font-serif">
                  प्रयोगकर्ता तथा सदस्यता नियन्त्रण
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Unified System
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
                सबै दर्ता भएका प्रयोगकर्ता र सदस्यता योजनाहरूको एकिकृत प्रशासनिक केन्द्र (User & Membership Control)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => fetchUsers(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span>ताजा गर्नुहोस्</span>
            </button>
          </div>
        </div>

        {/* ── TOP KPI SUMMARY CARDS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-5">
          <div className="bg-stone-950/60 border border-stone-800/80 rounded-2xl p-3.5">
            <div className="text-[11px] text-stone-400 font-medium">जम्मा दर्ता</div>
            <div className="text-xl font-black text-stone-100 mt-1 font-mono">
              {toDevanagariNumerals(stats.totalUsers)}
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5">आज दर्ता: {toDevanagariNumerals(stats.todaySignups)}</div>
          </div>

          <div className="bg-stone-950/60 border border-emerald-900/30 rounded-2xl p-3.5">
            <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-emerald-400" />
              <span>सक्रिय सदस्य</span>
            </div>
            <div className="text-xl font-black text-emerald-300 mt-1 font-mono">
              {toDevanagariNumerals(stats.activeMembers)}
            </div>
            <div className="text-[10px] text-emerald-500/80 mt-0.5">पूर्ण पहुँच प्राप्त</div>
          </div>

          <div className="bg-stone-950/60 border border-amber-900/40 rounded-2xl p-3.5">
            <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>खरिद पेन्डिङ</span>
            </div>
            <div className="text-xl font-black text-amber-300 mt-1 font-mono">
              {toDevanagariNumerals(stats.pendingPurchases)}
            </div>
            <div className="text-[10px] text-amber-500/80 mt-0.5">रुजु गर्न बाँकी</div>
          </div>

          <div className="bg-stone-950/60 border border-cyan-900/30 rounded-2xl p-3.5">
            <div className="text-[11px] text-cyan-400 font-medium">सम्पर्क प्रमाणित</div>
            <div className="text-xl font-black text-cyan-300 mt-1 font-mono">
              {toDevanagariNumerals(stats.contactVerifiedUsers)}
            </div>
            <div className="text-[10px] text-cyan-500/80 mt-0.5">मोबाइल र ईमेल दुवै</div>
          </div>

          <div className="bg-stone-950/60 border border-purple-900/30 rounded-2xl p-3.5">
            <div className="text-[11px] text-purple-400 font-medium">Trial Users</div>
            <div className="text-xl font-black text-purple-300 mt-1 font-mono">
              {toDevanagariNumerals(stats.trialUsers)}
            </div>
            <div className="text-[10px] text-purple-400/80 mt-0.5">२४ घण्टे परीक्षणमा</div>
          </div>

          <div className="bg-stone-950/60 border border-red-900/30 rounded-2xl p-3.5">
            <div className="text-[11px] text-red-400 font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>३० दिन चेतावनी</span>
            </div>
            <div className="text-xl font-black text-red-300 mt-1 font-mono">
              {toDevanagariNumerals(stats.expiringIn30Days)}
            </div>
            <div className="text-[10px] text-red-400/80 mt-0.5">म्याद सकिन लागेको</div>
          </div>
        </div>
      </div>

      {/* ── 9 MASTER CLASSIFICATION TABS / PILLS ── */}
      <div className="bg-stone-900/70 border border-stone-800 rounded-3xl p-3 sm:p-4 shadow-md overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max pb-1">
          {filterTabs.map((tab) => {
            const isSelected = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveFilter(tab.key);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 font-black shadow-md scale-102'
                    : 'bg-stone-950/80 text-stone-300 hover:bg-stone-800 border border-stone-800/80'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isSelected ? 'bg-stone-950 text-amber-400' : tab.badgeColor
                  }`}
                >
                  {toDevanagariNumerals(tab.count)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SEARCH, SORT & TABLE CONTROLS ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-900/50 p-3 rounded-2xl border border-stone-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="नाम, मोबाइल, ईमेल, वा ग्राहक ID द्वारा खोज्नुहोस्..."
            className="w-full pl-10 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <span>क्रम:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
            >
              <option value="newest">नयाँ दर्ता पहिले (Newest)</option>
              <option value="oldest">पुरानो दर्ता पहिले (Oldest)</option>
              <option value="name">नाम (A-Z)</option>
            </select>
          </div>

          <div className="text-xs text-stone-400 font-medium ml-2">
            जम्मा: <span className="font-bold text-amber-400 font-mono">{toDevanagariNumerals(totalCount)}</span>
          </div>
        </div>
      </div>

      {/* ── MASTER USER & MEMBERSHIP TABLE ── */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-3xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-sm font-semibold text-stone-400">डेटा लोड हुँदैछ, कृपया प्रतीक्षा गर्नुहोस्...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <UserX className="w-12 h-12 text-stone-600 mx-auto" />
            <div className="text-base font-bold text-stone-300">कुनै पनि प्रयोगकर्ता फेला परेन</div>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              छनोट गरिएको फिल्टर वा खोजी शब्द अनुसार कुनै रेकर्ड देखिएन। कृपया फिल्टर परिवर्तन गरेर प्रयास गर्नुहोस्।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[1700px]">
              <thead>
                <tr className="bg-stone-950/90 border-b border-stone-800 text-[11px] text-stone-400 uppercase tracking-wider select-none">
                  <th className="py-3 px-3 font-bold text-center w-12">१. क्र.सं.</th>
                  <th className="py-3 px-3 font-bold min-w-[160px]">२. पूरा नाम</th>
                  <th className="py-3 px-3 font-bold min-w-[130px]">३. ठेगाना</th>
                  <th className="py-3 px-3 font-bold min-w-[120px]">४. मोबाइल नं.</th>
                  <th className="py-3 px-3 font-bold min-w-[110px]">५. युजरनेम</th>
                  <th className="py-3 px-3 font-bold min-w-[100px]">६. दर्ता मिति</th>
                  <th className="py-3 px-3 font-bold min-w-[90px]">७. खाता स्थिति</th>
                  <th className="py-3 px-3 font-bold min-w-[160px]">८. प्रयोगकर्ता वर्ग</th>
                  <th className="py-3 px-3 font-bold min-w-[140px]">९. सदस्यता योजना</th>
                  <th className="py-3 px-3 font-bold min-w-[150px]">१०. भुक्तानी रकम (रु.)</th>
                  <th className="py-3 px-3 font-bold min-w-[100px]">११. भुक्तानी स्थिति</th>
                  <th className="py-3 px-3 font-bold min-w-[100px]">१२. सुरु मिति</th>
                  <th className="py-3 px-3 font-bold min-w-[100px]">१३. समाप्ति मिति</th>
                  <th className="py-3 px-3 font-bold min-w-[100px]">१४. बाँकी दिन</th>
                  <th className="py-3 px-3 font-bold min-w-[100px]">१५. अद्यावधिक</th>
                  <th className="py-3 px-3 font-bold text-right min-w-[120px]">१६. कार्य (Action)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 font-sans">
                {users.map((u, idx) => {
                  const isSuspended = u.status === 'suspended' || u.status === 'inactive';
                  const isActiveMember = u.membershipStatus === 'ACTIVE';
                  const isPendingPayment = u.membershipStatus === 'PENDING_PAYMENT' || u.purchaseHistory?.some(p => p.status === 'PURCHASE_PENDING');
                  const isExpired = u.membershipStatus === 'EXPIRED';
                  const serialNum = (currentPage - 1) * pageSize + idx + 1;
                  const currentCategory = u.userCategory || (u.role === 'SUPER_ADMIN' ? 'professional' : (u.membershipStatus === 'ACTIVE' ? 'member' : 'visitor'));
                  const currentPaymentAmt = editingPaymentAmounts[u.id] !== undefined ? editingPaymentAmounts[u.id] : (u.paymentAmountNPR !== undefined ? u.paymentAmountNPR : (u.membership?.amountNPR || 0));

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-stone-800/40 transition-colors ${
                        isSuspended ? 'opacity-70 bg-stone-950/40' : ''
                      }`}
                    >
                      {/* Column 1: Serial Number */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-stone-400">
                        {toDevanagariNumerals(serialNum)}
                      </td>

                      {/* Column 2: Full Name */}
                      <td className="py-3 px-3 font-bold text-stone-100">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center font-bold text-amber-400 shrink-0 text-xs">
                            {u.fullName ? u.fullName.slice(0, 1) : 'U'}
                          </div>
                          <span className="truncate max-w-[140px]" title={u.fullName}>
                            {u.fullName || 'अज्ञात'}
                          </span>
                        </div>
                      </td>

                      {/* Column 3: Address */}
                      <td className="py-3 px-3 text-stone-300 text-[11px] truncate max-w-[130px]" title={u.address}>
                        {u.address || 'नेपाल'}
                      </td>

                      {/* Column 4: Mobile Number */}
                      <td className="py-3 px-3 font-mono text-[11px] text-stone-200">
                        <div className="flex items-center gap-1">
                          <span>{u.phone || '-'}</span>
                          {u.mobileVerified && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" title="प्रमाणित" />
                          )}
                        </div>
                      </td>

                      {/* Column 5: Username */}
                      <td className="py-3 px-3 font-mono text-[11px] text-amber-300/90 truncate max-w-[110px]" title={u.username || u.phone}>
                        {u.username || u.phone || '-'}
                      </td>

                      {/* Column 6: Registration Date */}
                      <td className="py-3 px-3 font-mono text-[10.5px] text-stone-400">
                        {u.createdAtBS || u.createdAtISO?.split('T')[0] || '-'}
                      </td>

                      {/* Column 7: Account Status */}
                      <td className="py-3 px-3">
                        {u.status === 'active' ? (
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            सक्रिय
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-red-950 text-red-300 border border-red-800">
                            निलम्बित
                          </span>
                        )}
                      </td>

                      {/* Column 8: User Category (Direct Selection Dropdown) */}
                      <td className="py-3 px-3">
                        <select
                          value={currentCategory}
                          disabled={savingCategoryId === u.id}
                          onChange={(e) => handleChangeCategoryDirect(u.id, e.target.value as any)}
                          className="px-2 py-1 bg-stone-900 border border-stone-700 rounded-lg text-[10.5px] font-bold text-amber-300 focus:border-amber-500 outline-none cursor-pointer"
                        >
                          <option value="visitor">साधारण (Visitor)</option>
                          <option value="member">सदस्य (Member)</option>
                          <option value="professional">व्यावसायिक (Professional)</option>
                        </select>
                      </td>

                      {/* Column 9: Subscription Plan */}
                      <td className="py-3 px-3 text-[11px] font-semibold text-stone-200">
                        {u.purchasedPlan || 'निःशुल्क'}
                      </td>

                      {/* Column 10: Payment Amount (NPR) [Editable Field with Save Button] */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-stone-400 font-mono">रु.</span>
                          <input
                            type="number"
                            min="0"
                            step="50"
                            value={currentPaymentAmt}
                            onChange={(e) => setEditingPaymentAmounts(prev => ({ ...prev, [u.id]: e.target.value }))}
                            className="w-20 px-2 py-1 bg-stone-950 border border-stone-700 focus:border-amber-400 rounded-lg text-[11px] font-mono text-stone-100 outline-none text-right"
                          />
                          <button
                            type="button"
                            disabled={savingPaymentId === u.id}
                            onClick={() => handleUpdatePaymentAmount(u.id, currentPaymentAmt)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                            title="रकम बचत गर्नुहोस्"
                          >
                            {savingPaymentId === u.id ? '...' : 'बचत'}
                          </button>
                        </div>
                      </td>

                      {/* Column 11: Payment Status */}
                      <td className="py-3 px-3">
                        {u.paymentStatus === 'VERIFIED' ? (
                          <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                            प्रमाणित
                          </span>
                        ) : u.paymentStatus === 'PENDING' ? (
                          <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                            पर्खिरहेको
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9.5px] font-medium bg-stone-800 text-stone-400">
                            निःशुल्क
                          </span>
                        )}
                      </td>

                      {/* Column 12: Start Date */}
                      <td className="py-3 px-3 font-mono text-[10px] text-stone-300">
                        {u.activationDateBS || u.createdAtBS || '-'}
                      </td>

                      {/* Column 13: Expiry Date */}
                      <td className="py-3 px-3 font-mono text-[10px] text-stone-300">
                        <span className={u.showWarning30Days ? 'text-amber-400 font-bold' : ''}>
                          {u.expiryDateBS || 'असीमित'}
                        </span>
                      </td>

                      {/* Column 14: Remaining Days */}
                      <td className="py-3 px-3">
                        {u.remainingDays === 9999 ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            आजीवन
                          </span>
                        ) : u.remainingDays > 0 ? (
                          <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold font-mono ${
                            u.showWarning30Days
                              ? 'bg-amber-950 text-amber-300 border border-amber-700 animate-pulse'
                              : 'bg-stone-800 text-stone-200'
                          }`}>
                            {toDevanagariNumerals(u.remainingDays)} दिन
                          </span>
                        ) : (
                          <span className="text-[9.5px] text-stone-500 font-medium">सकियो / छैन</span>
                        )}
                      </td>

                      {/* Column 15: Last Updated */}
                      <td className="py-3 px-3 font-mono text-[10px] text-stone-400">
                        {u.statusUpdatedAtISO ? u.statusUpdatedAtISO.split('T')[0] : (u.createdAtBS || '-')}
                      </td>

                      {/* Column 16: Actions */}
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenUserModal(u, 'info')}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-[10.5px] font-black shadow-xs transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>नियन्त्रण</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── PAGINATION CONTROLS ── */}
        {!loading && users.length > 0 && (
          <div className="px-5 py-3.5 bg-stone-950/80 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-stone-400">
              पृष्ठ <span className="font-bold text-stone-200">{toDevanagariNumerals(currentPage)}</span> /{' '}
              <span className="font-bold text-stone-200">{toDevanagariNumerals(totalPages)}</span> (जम्मा{' '}
              <span className="font-bold text-amber-400">{toDevanagariNumerals(totalCount)}</span> प्रयोगकर्ता)
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-800 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5 inline mr-1" />
                <span>अघिल्लो</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-800 cursor-pointer"
              >
                <span>पछिल्लो</span>
                <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 5-SECTION USER DETAILS & CONTROL MODAL ── */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-stone-950 border border-stone-800 rounded-3xl w-full max-w-4xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden text-stone-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4.5 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-sm">
                  {selectedUser.fullName ? selectedUser.fullName.slice(0, 1) : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-stone-100 font-serif">
                      {selectedUser.fullName}
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
                      ID: {selectedUser.customerId || selectedUser.id}
                    </span>
                  </div>
                  <div className="text-xs text-stone-400 flex items-center gap-3 mt-0.5">
                    <span>📱 {selectedUser.phone}</span>
                    {selectedUser.email && <span>✉️ {selectedUser.email}</span>}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-100 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal 5 Sub-Section Navigation Tabs */}
            <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 bg-stone-900/50 border-b border-stone-800 overflow-x-auto shrink-0 text-xs">
              <button
                type="button"
                onClick={() => setActiveModalTab('info')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeModalTab === 'info'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                    : 'bg-stone-900 text-stone-400 hover:bg-stone-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>खण्ड क: व्यक्तिगत जानकारी</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('status')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeModalTab === 'status'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                    : 'bg-stone-900 text-stone-400 hover:bg-stone-800'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>खण्ड ख: खाता नियन्त्रण</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('membership')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeModalTab === 'membership'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                    : 'bg-stone-900 text-stone-400 hover:bg-stone-800'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>खण्ड ग: सदस्यता तथा लाइसेन्स</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('activation')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeModalTab === 'activation'
                    ? 'bg-emerald-500 text-stone-950 font-black shadow-sm'
                    : 'bg-stone-900 text-emerald-400 hover:bg-stone-800 border border-emerald-900/40'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>खण्ड घ: सदस्यता सक्रिय फारम</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab('history')}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeModalTab === 'history'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                    : 'bg-stone-900 text-stone-400 hover:bg-stone-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>खण्ड ङ: खरिद तथा अडिट इतिहास</span>
              </button>
            </div>

            {/* Modal Body: Active Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* ── SECTION A: USER INFORMATION & PROFILE EDIT ── */}
              {activeModalTab === 'info' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                    <div>
                      <h3 className="text-sm font-bold text-stone-200">प्रयोगकर्ताको व्यक्तिगत विवरण सम्पादन</h3>
                      <p className="text-xs text-stone-500">
                        परिवर्तन गरिएको विवरण स्वतः प्रयोगकर्ता डेटाबेस र खरिद लिड प्रणालीमा सिङ्क हुनेछ।
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedUser.mobileVerified ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>फोन प्रमाणित ✓</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                          फोन अप्रमाणित
                        </span>
                      )}
                      {selectedUser.emailVerified && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                          <span>ईमेल प्रमाणित ✓</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-400 mb-1">पूरा नाम (Full Name)</label>
                      <input
                        type="text"
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-400 mb-1">मोबाइल नम्बर (Phone)</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-100 font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-400 mb-1">ईमेल ठेगाना (Email)</label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-400 mb-1">WhatsApp नम्बर</label>
                      <input
                        type="text"
                        value={editWhatsapp}
                        onChange={(e) => setEditWhatsapp(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-100 font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-stone-400 mb-1">ठेगाना / जिल्ला (Address)</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-400 mb-1">जन्म मिति वि.सं. (DOB BS)</label>
                      <input
                        type="text"
                        value={editDobBS}
                        onChange={(e) => setEditDobBS(e.target.value)}
                        placeholder="२०५२-०४-१५"
                        className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-400 mb-1">जन्म समय (Birth Time)</label>
                      <input
                        type="text"
                        value={editBirthTime}
                        onChange={(e) => setEditBirthTime(e.target.value)}
                        placeholder="०८:३० AM"
                        className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-4 border-t border-stone-800">
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-450 text-stone-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {savingProfile ? 'सुरक्षित हुँदैछ...' : 'परिवर्तन सुरक्षित गर्नुहोस्'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── SECTION B: ACCOUNT STATUS & ACCESS CONTROL ── */}
              {activeModalTab === 'status' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-stone-200">खाता स्थिति नियन्त्रण (Account Access & Status)</h3>
                    <p className="text-xs text-stone-500">
                      प्रयोगकर्ताको प्रणाली पहुँच सक्रिय, निष्क्रिय वा निलम्बन गर्नुहोस्।
                    </p>
                  </div>

                  {/* Status Picker */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label
                      onClick={() => setTargetStatus('active')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        targetStatus === 'active'
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-xs">सक्रिय (Active)</span>
                      </div>
                      <p className="text-[10px] text-stone-400 mt-1">सामान्य रूपमा लगइन र सफ्टवेयर चलाउन पाउने।</p>
                    </label>

                    <label
                      onClick={() => setTargetStatus('suspended')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        targetStatus === 'suspended'
                          ? 'bg-red-950/40 border-red-500 text-red-200'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <UserX className="w-4 h-4 text-red-400" />
                        <span className="font-bold text-xs">निलम्बित (Suspended)</span>
                      </div>
                      <p className="text-[10px] text-stone-400 mt-1">तत्काल लगआउट भई सफ्टवेयर खुल्न रोकिने।</p>
                    </label>

                    <label
                      onClick={() => setTargetStatus('inactive')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        targetStatus === 'inactive'
                          ? 'bg-stone-800 border-stone-600 text-stone-200'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-stone-400" />
                        <span className="font-bold text-xs">निष्क्रिय (Inactive)</span>
                      </div>
                      <p className="text-[10px] text-stone-400 mt-1">अस्थायी रूपमा खाता निस्क्रिय रहने।</p>
                    </label>
                  </div>

                  {(targetStatus === 'suspended' || targetStatus === 'inactive') && (
                    <div>
                      <label className="block text-xs font-semibold text-red-400 mb-1">
                        निलम्बन वा स्थिति परिवर्तनको कारण (Mandatory Reason)*
                      </label>
                      <textarea
                        rows={2}
                        value={statusReason}
                        onChange={(e) => setStatusReason(e.target.value)}
                        placeholder="निलम्बन गर्नुको स्पष्ट कारण यहाँ लेख्नुहोस्..."
                        className="w-full px-3.5 py-2 bg-stone-900 border border-red-900/60 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={handleSaveStatus}
                      disabled={savingStatus}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-450 text-stone-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {savingStatus ? 'परिवर्तन हुँदैछ...' : 'खाता स्थिति अद्यावधिक गर्नुहोस्'}
                    </button>
                  </div>

                  {/* 24-Hour Trial Management */}
                  <div className="pt-5 border-t border-stone-800 space-y-3">
                    <h4 className="text-xs font-bold text-stone-300">२४ घण्टे निःशुल्क परीक्षण नियन्त्रण</h4>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleTrialAction('activate')}
                        className="px-4 py-2 rounded-xl bg-purple-950 text-purple-200 border border-purple-800 hover:bg-purple-900 text-xs font-bold transition-all cursor-pointer"
                      >
                        २४ घण्टे परीक्षण सक्रिय गर्नुहोस्
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTrialAction('reset')}
                        className="px-4 py-2 rounded-xl bg-stone-900 text-stone-300 border border-stone-700 hover:bg-stone-800 text-xs font-bold transition-all cursor-pointer"
                      >
                        परीक्षण रिसेट (पुनः सुरु)
                      </button>
                    </div>
                  </div>

                  {/* Admin Notes */}
                  <div className="pt-5 border-t border-stone-800 space-y-3">
                    <h4 className="text-xs font-bold text-stone-300">प्रशासक आन्तरिक नोटहरू</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newAdminNote}
                        onChange={(e) => setNewAdminNote(e.target.value)}
                        placeholder="यो प्रयोगकर्ता बारे गोप्य प्रशासक नोट लेख्नुहोस्..."
                        className="flex-1 px-3.5 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddAdminNote}
                        disabled={savingNote || !newAdminNote.trim()}
                        className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-40"
                      >
                        {savingNote ? 'थपिँदै...' : 'नोट थप्नुहोस्'}
                      </button>
                    </div>

                    {selectedUser.adminNotes?.length > 0 && (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {selectedUser.adminNotes.map((note: any, idx: number) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800 text-xs">
                            <div className="text-stone-300">{note.text}</div>
                            <div className="text-[10px] text-stone-500 mt-1 flex items-center justify-between">
                              <span>लेखक: {note.author || 'SuperAdmin'}</span>
                              <span>{note.createdAtISO ? new Date(note.createdAtISO).toLocaleString('ne-NP') : ''}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── SECTION C: MEMBERSHIP & LICENSE CONTROL ── */}
              {activeModalTab === 'membership' && (
                <div className="space-y-6">
                  {/* Current Active Plan Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-amber-400" />
                        <h4 className="font-bold text-sm text-stone-100">वर्तमान सदस्यता विवरण</h4>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {selectedUser.membershipStatus || 'कुनै सदस्यता छैन'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                      <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800/80">
                        <div className="text-stone-500 text-[10px]">योजना</div>
                        <div className="font-bold text-stone-200 mt-0.5">{selectedUser.purchasedPlan || 'निःशुल्क'}</div>
                      </div>
                      <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800/80">
                        <div className="text-stone-500 text-[10px]">सुरु मिति</div>
                        <div className="font-bold text-stone-200 mt-0.5">{selectedUser.activationDateBS || '-'}</div>
                      </div>
                      <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800/80">
                        <div className="text-stone-500 text-[10px]">समाप्त मिति</div>
                        <div className="font-bold text-stone-200 mt-0.5">{selectedUser.expiryDateBS || 'आजीवन'}</div>
                      </div>
                      <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-800/80">
                        <div className="text-stone-500 text-[10px]">बाँकी दिन</div>
                        <div className="font-bold text-amber-400 mt-0.5">
                          {selectedUser.remainingDays === 9999
                            ? 'आजीवन'
                            : `${toDevanagariNumerals(selectedUser.remainingDays)} दिन`}
                        </div>
                      </div>
                    </div>

                    {selectedUser.showWarning30Days && (
                      <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-700/80 text-amber-300 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>३० दिनभित्र म्याद समाप्त हुँदैछ! कृपया समयमै नवीकरण गर्नुहोस् वा म्याद थप गर्नुहोस्।</span>
                      </div>
                    )}
                  </div>

                  {/* Service Toggles */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-stone-300">खुल्ला सेवाहरू (Service Entitlements)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      {[
                        { key: 'jyotish', label: 'ज्योतिष (Kundali)' },
                        { key: 'vastu', label: 'वास्तु परामर्श' },
                        { key: 'karmakanda', label: 'कर्मकाण्ड विधि' },
                        { key: 'panchanga', label: 'पञ्चाङ्ग (सधैं खुल्ला)', disabled: true }
                      ].map((srv) => {
                        const isChecked = selectedServices.includes(srv.key) || srv.key === 'panchanga';
                        return (
                          <button
                            key={srv.key}
                            type="button"
                            disabled={srv.disabled}
                            onClick={() => {
                              if (srv.disabled) return;
                              if (isChecked) {
                                setSelectedServices(selectedServices.filter((s) => s !== srv.key));
                              } else {
                                setSelectedServices([...selectedServices, srv.key]);
                              }
                            }}
                            className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-amber-950/40 border-amber-600/60 text-amber-200'
                                : 'bg-stone-900 border-stone-800 text-stone-500'
                            }`}
                          >
                            <span className="font-bold text-xs">{srv.label}</span>
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-amber-400" />
                            ) : (
                              <Square className="w-4 h-4 text-stone-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveServices}
                      disabled={savingMutation}
                      className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      सेवा संशोधन सुरक्षित गर्नुहोस्
                    </button>
                  </div>

                  {/* Membership Quick Mutations: Renew, Extend, Suspend */}
                  <div className="pt-4 border-t border-stone-800 space-y-4">
                    <h4 className="text-xs font-bold text-stone-300">सदस्यता नवीकरण तथा म्याद थप</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Renewal Box */}
                      <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-3">
                        <div className="font-bold text-xs text-stone-200">सदस्यता नवीकरण (+१ वर्ष वा आजीवन)</div>
                        <select
                          value={renewDuration}
                          onChange={(e) => setRenewDuration(e.target.value as any)}
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200"
                        >
                          <option value="1_year">+१ वर्ष नवीकरण</option>
                          <option value="lifetime">आजीवन (Lifetime) नवीकरण</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleMutateMembership('renew')}
                          disabled={savingMutation}
                          className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs transition-all cursor-pointer"
                        >
                          नवीकरण गर्नुहोस्
                        </button>
                      </div>

                      {/* Extend Box */}
                      <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-3">
                        <div className="font-bold text-xs text-stone-200">म्याद थप (Grace Extension)</div>
                        <select
                          value={extendPeriod}
                          onChange={(e) => setExtendPeriod(e.target.value as any)}
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200"
                        >
                          <option value="1_month">+१ महिना थप</option>
                          <option value="3_months">+३ महिना थप</option>
                          <option value="1_year">+१ वर्ष थप</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleMutateMembership('extend')}
                          disabled={savingMutation}
                          className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-stone-950 font-bold text-xs transition-all cursor-pointer"
                        >
                          म्याद थप गर्नुहोस्
                        </button>
                      </div>
                    </div>

                    {/* Suspension Box */}
                    <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/40 space-y-3">
                      <div className="font-bold text-xs text-red-300">सदस्यता निलम्बन वा रद्द गर्नुहोस्</div>
                      <input
                        type="text"
                        value={mutationReason}
                        onChange={(e) => setMutationReason(e.target.value)}
                        placeholder="निलम्बन गर्न कारण अनिवार्य छ..."
                        className="w-full px-3 py-2 bg-stone-950 border border-red-900/60 rounded-xl text-xs text-stone-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleMutateMembership('suspend')}
                        disabled={savingMutation || !mutationReason.trim()}
                        className="px-4 py-2 rounded-xl bg-red-800 hover:bg-red-700 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-40"
                      >
                        सदस्यता निलम्बन गर्नुहोस्
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── SECTION D: MEMBERSHIP ACTIVATION FORM ── */}
              {activeModalTab === 'activation' && (
                <div className="space-y-6">
                  <div className="pb-3 border-b border-stone-800">
                    <h3 className="text-sm font-bold text-emerald-400">नयाँ सदस्यता प्रत्यक्ष सक्रिय फारम</h3>
                    <p className="text-xs text-stone-500">
                      प्रशासक द्वारा नगद वा अनलाइन भुक्तानी रुजु गरी नयाँ योजना सक्रिय गर्नुहोस्।
                    </p>
                  </div>

                  {/* Plan Picker Cards */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-400 mb-2">
                      १. सदस्यता योजना छनोट (Select Official Plan)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Mobile Only */}
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>१. मोबाइल मात्र</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePlanChange('yearly_mobile')}
                          className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            actPlanId === 'yearly_mobile'
                              ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-md font-bold'
                              : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                          }`}
                        >
                          <div className="font-bold text-xs">१ वर्ष: रु. २००</div>
                          <div className="text-[10px] opacity-80 mt-0.5">मोवाइल डिभाइस मात्र</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePlanChange('lifetime_mobile')}
                          className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            actPlanId === 'lifetime_mobile'
                              ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-md font-bold'
                              : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                          }`}
                        >
                          <div className="font-bold text-xs">आजीवन: रु. १,०००</div>
                          <div className="text-[10px] opacity-80 mt-0.5">मोवाइल आजीवन असीमित</div>
                        </button>
                      </div>

                      {/* Computer Only */}
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-cyan-400 flex items-center gap-1.5">
                          <Monitor className="w-3.5 h-3.5" />
                          <span>२. कम्प्युटर मात्र</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePlanChange('yearly_computer')}
                          className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            actPlanId === 'yearly_computer'
                              ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-md font-bold'
                              : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                          }`}
                        >
                          <div className="font-bold text-xs">१ वर्ष: रु. ५००</div>
                          <div className="text-[10px] opacity-80 mt-0.5">कम्प्युटर / ल्यापटप मात्र</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePlanChange('lifetime_computer')}
                          className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            actPlanId === 'lifetime_computer'
                              ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-md font-bold'
                              : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                          }`}
                        >
                          <div className="font-bold text-xs">आजीवन: रु. २,५००</div>
                          <div className="text-[10px] opacity-80 mt-0.5">कम्प्युटर आजीवन असीमित</div>
                        </button>
                      </div>

                      {/* Both Mobile & Computer */}
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                          <Laptop className="w-3.5 h-3.5" />
                          <span>३. मोबाइल + कम्प्युटर</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePlanChange('yearly_both')}
                          className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            actPlanId === 'yearly_both'
                              ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-md font-bold'
                              : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                          }`}
                        >
                          <div className="font-bold text-xs">१ वर्ष: रु. १,२००</div>
                          <div className="text-[10px] opacity-80 mt-0.5">सबै डिभाइसमा पूर्ण पहुँच</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePlanChange('lifetime_both')}
                          className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            actPlanId === 'lifetime_both'
                              ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-md font-bold'
                              : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                          }`}
                        >
                          <div className="font-bold text-xs">आजीवन: रु. ३,०००</div>
                          <div className="text-[10px] opacity-80 mt-0.5">आजीवन दुवै डिभाइसमा पहुँच</div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method & Amount */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-400 mb-1">२. भुक्तानी माध्यम</label>
                      <select
                        value={actPaymentMethod}
                        onChange={(e) => setActPaymentMethod(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-100"
                      >
                        <option value="cash">नगद भुक्तानी (Cash In Hand)</option>
                        <option value="esewa">eSewa वालेट</option>
                        <option value="khalti">Khalti वालेट</option>
                        <option value="bank">बैंक ट्रान्सफर (Bank Deposit)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-400 mb-1">३. रकम (रुपैयाँमा)</label>
                      <input
                        type="number"
                        value={actAmount}
                        onChange={(e) => setActAmount(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-100 font-mono"
                      />
                    </div>
                  </div>

                  {/* Mandatory Cash Verification Checkbox */}
                  {actPaymentMethod === 'cash' && (
                    <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/80 space-y-2">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={actCashVerified}
                          onChange={(e) => setActCashVerified(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 bg-stone-900 border-stone-700 mt-0.5 cursor-pointer"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-amber-300">
                            [✓] नगद भुक्तानी प्राप्त भयो र रुजु गरियो (Cash Payment Received & Verified)
                          </span>
                          <p className="text-[11px] text-amber-400/80 mt-0.5">
                            प्रशासकले ग्राहकबाट तोकिएको रकम नगदमा प्राप्त गरेको सुनिश्चित गर्न यो चेकबक्स अनिवार्य छ।
                          </p>
                        </div>
                      </label>
                    </div>
                  )}

                  {/* Admin Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-400 mb-1">
                      ४. प्रशासकीय टिप्पणी / रसिद नम्बर (Remarks)
                    </label>
                    <input
                      type="text"
                      value={actAdminNotes}
                      onChange={(e) => setActAdminNotes(e.target.value)}
                      placeholder="उदा: रसिद नं. १०५२, शाखा काउन्टर मार्फत प्राप्त"
                      className="w-full px-3.5 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-100"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-stone-800 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleActivateMembership}
                      disabled={activatingMembership || (actPaymentMethod === 'cash' && !actCashVerified)}
                      className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-450 text-stone-950 font-black text-xs shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Crown className="w-4 h-4" />
                      <span>{activatingMembership ? 'सक्रिय हुँदैछ...' : 'सदस्यता तत्काल सक्रिय गर्नुहोस्'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── SECTION E: PURCHASE & PAYMENT HISTORY ── */}
              {activeModalTab === 'history' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-stone-200">खरिद अनुरोध तथा सदस्यता इतिहास</h3>
                    <p className="text-xs text-stone-500">
                      प्रयोगकर्ताले पेश गरेका सबै अनलाइन र नगद खरिद अनुरोधहरूको स्थिति तथा अडिट रेकर्ड।
                    </p>
                  </div>

                  {/* Purchase History List */}
                  {selectedUser.purchaseHistory?.length > 0 ? (
                    <div className="space-y-3">
                      {selectedUser.purchaseHistory.map((lead: any, idx: number) => {
                        const isPending = lead.status === 'PURCHASE_PENDING' || lead.paymentVerificationStatus === 'PENDING';
                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-2xl border space-y-3 ${
                              isPending
                                ? 'bg-amber-950/30 border-amber-600/70'
                                : 'bg-stone-900/60 border-stone-800'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <div className="font-bold text-xs text-stone-100 flex items-center gap-2">
                                  <span>{lead.planNameNepali || lead.planId || 'सदस्यता योजना'}</span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      isPending
                                        ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                                        : lead.status === 'PURCHASE_APPROVED'
                                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                        : 'bg-red-950 text-red-300 border border-red-800'
                                    }`}
                                  >
                                    {lead.status || 'SUBMITTED'}
                                  </span>
                                </div>
                                <div className="text-[10px] text-stone-500 mt-0.5 font-mono">
                                  मिति: {lead.submittedAtBS || lead.createdAtBS || '-'} • भुक्तानी: {lead.paymentMethod?.toUpperCase()} • रकम: रु. {lead.planAmountNPR || lead.amountNPR || '-'}
                                </div>
                              </div>

                              {isPending && (
                                <div className="space-y-2 sm:text-right">
                                  {lead.paymentMethod === 'cash' && (
                                    <label className="flex items-center gap-2 text-[11px] text-amber-300 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={cashApprovalChecked}
                                        onChange={(e) => setCashApprovalChecked(e.target.checked)}
                                        className="w-3.5 h-3.5 rounded text-amber-500"
                                      />
                                      <span>[✓] नगद प्राप्त रुजु भयो</span>
                                    </label>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleApprovePurchaseRequest(lead)}
                                      disabled={processingPurchaseId === lead.id || (lead.paymentMethod === 'cash' && !cashApprovalChecked)}
                                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs transition-all cursor-pointer disabled:opacity-40"
                                    >
                                      स्वीकृत गर्नुहोस्
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRejectPurchaseRequest(lead)}
                                      disabled={processingPurchaseId === lead.id}
                                      className="px-3 py-1.5 rounded-xl bg-red-950 text-red-300 border border-red-800 hover:bg-red-900 font-bold text-xs transition-all cursor-pointer"
                                    >
                                      अस्वीकृत
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {lead.adminNotes && (
                              <div className="text-[11px] text-stone-400 bg-stone-950 p-2 rounded-lg">
                                कैफियत: {lead.adminNotes}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-stone-500 bg-stone-900/40 rounded-2xl border border-stone-800">
                      कुनै खरिद अनुरोध रेकर्ड फेला परेन।
                    </div>
                  )}

                  {/* Audit Logs */}
                  <div className="pt-4 border-t border-stone-800 space-y-3">
                    <h4 className="text-xs font-bold text-stone-300">प्रशासनिक कार्य अडिट लग (Audit Logs)</h4>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {selectedUser.auditLogs?.length > 0 ? (
                        selectedUser.auditLogs.map((log: any, idx: number) => (
                          <div key={idx} className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800 text-xs">
                            <div className="flex items-center justify-between font-bold text-stone-300">
                              <span>{log.action}</span>
                              <span className="text-[10px] text-stone-500 font-mono">
                                {log.timestampISO ? new Date(log.timestampISO).toLocaleString('ne-NP') : ''}
                              </span>
                            </div>
                            <div className="text-stone-400 text-[11px] mt-0.5">{log.details}</div>
                            <div className="text-[10px] text-stone-500 mt-1">द्वारा: {log.performedBy || 'SuperAdmin'}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-stone-500 italic p-3 bg-stone-950 rounded-xl">
                          कुनै अडिट लग छैन।
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
