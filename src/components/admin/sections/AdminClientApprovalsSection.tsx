import React, { useState, useEffect } from 'react';
import {
  Crown,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  AlertCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  ShieldCheck,
  Check,
  X,
  Zap,
  Trash2,
  RefreshCw,
  Sliders,
  Users,
  CreditCard,
  ArrowRight,
  ExternalLink,
  Copy
} from 'lucide-react';
import {
  ClientLead,
  getStoredClientLeads,
  syncClientLeadsFromServer,
  deleteClientLeadPermanently
} from '../../../db/clientLeadStore';
import { unifiedUserSyncService, REALTIME_SSE_URL } from '../../../services/unifiedUserSyncService';
import { toDevanagariNumerals } from '../../../utils/nepaliCalendar';

interface AdminClientApprovalsSectionProps {
  initialUserPhone?: string;
  onRefresh?: () => void;
  onNavigateToUsers?: (mobile?: string) => void;
  onNavigateToSwitchboard?: (mobile?: string) => void;
  onNavigateToLicenses?: (mobile?: string) => void;
}

export const AdminClientApprovalsSection: React.FC<AdminClientApprovalsSectionProps> = ({
  initialUserPhone,
  onRefresh,
  onNavigateToUsers,
  onNavigateToSwitchboard,
  onNavigateToLicenses
}) => {
  const [leads, setLeads] = useState<ClientLead[]>(() => unifiedUserSyncService.getPurchasedUsers());
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PURCHASE_PENDING' | 'PURCHASE_APPROVED' | 'TRIAL_ACTIVE'>('ALL');
  const [searchQuery, setSearchQuery] = useState(initialUserPhone || '');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [manualTxInput, setManualTxInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Modal states for verification & cash approval
  const [approvalModalLead, setApprovalModalLead] = useState<ClientLead | null>(null);
  const [isCashVerified, setIsCashVerified] = useState(false);
  const [verifiedAmountInput, setVerifiedAmountInput] = useState<number>(2100);
  const [approvalAdminNotes, setApprovalAdminNotes] = useState('');
  const [approvalAdminName, setApprovalAdminName] = useState('SuperAdmin');
  const [rejectionModalLead, setRejectionModalLead] = useState<ClientLead | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  const loadLeads = async (forceServer: boolean = false) => {
    // 1. Instant local state load
    setLeads(unifiedUserSyncService.getPurchasedUsers());

    // 2. Server synchronization
    if (forceServer) setIsSyncing(true);
    try {
      await unifiedUserSyncService.syncAllData(true);
      const fresh = unifiedUserSyncService.getPurchasedUsers();
      if (Array.isArray(fresh)) {
        setLeads(fresh);
      }
    } catch (e) {
      console.warn('[AdminClientApprovals] Failed to sync with server:', e);
    } finally {
      if (forceServer) setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadLeads(true);
    const handleLeadsUpdated = () => loadLeads(false);
    window.addEventListener('client-leads-updated', handleLeadsUpdated);
    window.addEventListener('service-license-updated', handleLeadsUpdated);
    window.addEventListener('unified-data-updated', handleLeadsUpdated);

    // High-speed SSE Listener for instant real-time incoming purchase requests (< 1s)
    let sse: EventSource | null = null;
    try {
      if (typeof EventSource !== 'undefined') {
        sse = new EventSource(REALTIME_SSE_URL);
        sse.onmessage = (event) => {
          try {
            const raw = JSON.parse(event.data);
            const msg = raw.message || raw;
            const parsed = typeof msg === 'string' ? JSON.parse(msg) : msg;
            if (parsed?.type === 'PURCHASE_REQUEST' || parsed?.type === 'LICENSE_APPROVED' || parsed?.type === 'USER_SIGNUP') {
              loadLeads(false);
            }
          } catch {}
        };
      }
    } catch {}

    // Polling fallback every 3 seconds
    const interval = setInterval(() => {
      loadLeads(false);
    }, 3000);

    return () => {
      window.removeEventListener('client-leads-updated', handleLeadsUpdated);
      window.removeEventListener('service-license-updated', handleLeadsUpdated);
      window.removeEventListener('unified-data-updated', handleLeadsUpdated);
      if (sse) sse.close();
      clearInterval(interval);
    };
  }, []);

  const openApprovalModal = (lead: ClientLead) => {
    setApprovalModalLead(lead);
    setIsCashVerified(Boolean(lead.cashVerified));
    setVerifiedAmountInput(lead.verifiedAmount || lead.planAmountNPR || 2100);
    setApprovalAdminNotes(lead.adminNotes || '');
    setApprovalAdminName('SuperAdmin');
  };

  const handleConfirmApproval = () => {
    if (!approvalModalLead) return;
    const res = unifiedUserSyncService.approvePurchase(approvalModalLead.id, approvalAdminName, {
      cashVerified: isCashVerified,
      verifiedAmount: verifiedAmountInput,
      adminNotes: approvalAdminNotes
    });

    if (res.success) {
      setActionSuccessMsg(res.messageNepali);
      setApprovalModalLead(null);
      loadLeads();
      onRefresh?.();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } else {
      alert(res.messageNepali);
    }
  };

  const handleDirectApproveTx = (txCode: string) => {
    if (!txCode.trim()) {
      alert('कृपया eSewa/Khalti कारोबार नम्बर (Transaction ID) उल्लेख गर्नुहोस्।');
      return;
    }
    const res = unifiedUserSyncService.approvePurchase(txCode.trim(), 'SuperAdmin');
    if (res.success) {
      setActionSuccessMsg(res.messageNepali);
      loadLeads();
      onRefresh?.();
      setManualTxInput('');
      setTimeout(() => setActionSuccessMsg(null), 5000);
    } else {
      alert(res.messageNepali);
    }
  };

  const handleConfirmRejection = () => {
    if (!rejectionModalLead) return;
    const reason = rejectionReasonInput.trim() || 'रकम रुजु हुन सकेन।';
    const res = unifiedUserSyncService.rejectPurchase(rejectionModalLead.id, reason, approvalAdminName);
    if (res.success) {
      setActionSuccessMsg(res.messageNepali);
      setRejectionModalLead(null);
      setRejectionReasonInput('');
      loadLeads();
      onRefresh?.();
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } else {
      alert(res.messageNepali);
    }
  };

  const handleDirectApproveLead = (lead: ClientLead) => {
    if (lead.paymentMethod === 'cash' && !lead.cashVerified) {
      openApprovalModal(lead);
      return;
    }
    const res = unifiedUserSyncService.approvePurchase(lead.id, 'SuperAdmin');
    if (res.success) {
      setActionSuccessMsg(res.messageNepali);
      loadLeads();
      onRefresh?.();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } else {
      alert(res.messageNepali);
    }
  };

  const filteredLeads = (leads || []).filter((l) => {
    if (!l) return false;
    if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (l.fullName || '').toLowerCase().includes(q) ||
        (l.mobile || '').includes(q) ||
        (l.email || '').toLowerCase().includes(q) ||
        (l.transactionId && l.transactionId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const pendingCount = (leads || []).filter((l) => l && l.status === 'PURCHASE_PENDING').length;

  return (
    <div className="space-y-6">
      {/* ── SERIAL SOFTWARE APPROVAL WORKFLOW BANNER (1. PAYMENT APPROVAL -> 2. USER LISTING -> 3. MENU CONTROL) ── */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900/95 to-amber-950/40 border-2 border-amber-500/60 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-950/80 border border-amber-700/60 px-2 py-0.5 rounded-md">
                  क्रमबद्ध स्वीकृति कार्यप्रणाली (Serial Approval Workflow)
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  प्रत्यक्ष सिङ्क सक्रिय (&lt; १ सेकेन्ड)
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white font-serif mt-1">
                सफ्टवेयर खरिद रुजु तथा त्रि-स्तरीय सक्रियता शृङ्खला (3-Step Software Activation Chain)
              </h3>
            </div>
          </div>
          <p className="text-xs text-stone-400 max-w-md">
            ग्राहकले सफ्टवेयर खरिद गर्दा तलको तीन-स्तरीय क्रमबद्ध प्रक्रिया अनुसार भुक्तानी रुजु, प्रयोगकर्ता लिसिटिङ र मेनु नियन्त्रण सञ्चालन गर्नुहोस्।
          </p>
        </div>

        {/* 3 Interactive Stepper Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Step 1: Active Current Step */}
          <div className="bg-gradient-to-br from-amber-950/80 to-stone-900 border-2 border-amber-500 rounded-2xl p-3.5 shadow-lg relative overflow-hidden ring-1 ring-amber-500/40">
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-black text-[10px] uppercase tracking-wider">
              चरण १ (वर्तमान)
            </div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 font-black flex items-center justify-center text-xs">
                १
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-amber-200">
                १. भुक्तानी रुजु (Payment Approval)
              </h4>
            </div>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              eSewa / Khalti / बैंकबाट आएको आवेदनमा <strong>Name, Address, Mobile, WhatsApp, Tx ID</strong> रुजु गरी १-क्लिकमा Approve वा Reject गर्नुहोस्।
            </p>
            <div className="mt-2 text-[10px] text-amber-400 font-bold flex items-center gap-1">
              <span>● {toDevanagariNumerals(pendingCount)} वटा आवेदन रुजु बाँकी</span>
            </div>
          </div>

          {/* Step 2: User Listing (Clickable) */}
          <button
            type="button"
            onClick={() => onNavigateToUsers?.()}
            className="bg-stone-950/70 hover:bg-stone-900 border border-stone-800 hover:border-amber-500/60 rounded-2xl p-3.5 text-left transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-stone-800 text-stone-300 group-hover:bg-amber-500 group-hover:text-stone-950 font-black flex items-center justify-center text-xs transition-colors">
                    २
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-stone-200 group-hover:text-amber-300 transition-colors">
                    २. प्रयोगकर्ता लिसिटिङ (Listing)
                  </h4>
                </div>
                <span className="text-[10px] text-stone-500 group-hover:text-amber-400 font-mono">चरण २ →</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                स्वीकृत हुनासाथ ग्राहकको प्रतिलिपि <strong>"२. खरिद गरेका प्रयोगकर्ताहरू"</strong> तालिकामा देखिन्छ र <strong>"१. दर्ता भएका"</strong> मा प्रोफाइल सुरक्षित हुन्छ।
              </p>
            </div>
            <div className="mt-2 text-[10px] text-amber-400/90 font-bold group-hover:underline">
              प्रयोगकर्ता व्यवस्थापन तालिका खोल्नुहोस् ↗
            </div>
          </button>

          {/* Step 3: Menu Switchboard (Clickable) */}
          <button
            type="button"
            onClick={() => onNavigateToSwitchboard?.()}
            className="bg-stone-950/70 hover:bg-stone-900 border border-stone-800 hover:border-amber-500/60 rounded-2xl p-3.5 text-left transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-stone-800 text-stone-300 group-hover:bg-amber-500 group-hover:text-stone-950 font-black flex items-center justify-center text-xs transition-colors">
                    ३
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-stone-200 group-hover:text-amber-300 transition-colors">
                    ३. मेनु तथा सेवा नियन्त्रण (Menu Control)
                  </h4>
                </div>
                <span className="text-[10px] text-stone-500 group-hover:text-amber-400 font-mono">चरण ३ →</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                ग्राहकका लागि कुण्डली, फलादेश, पञ्चाङ्ग, वास्तु आदि मेनुहरूलाई <strong>खुल्ला (Open), बन्द (Close) वा लक (Lock)</strong> अनुकूलन गर्नुहोस्।
              </p>
            </div>
            <div className="mt-2 text-[10px] text-amber-400/90 font-bold group-hover:underline">
              मेनु स्विचबोर्ड कन्ट्रोल खोल्नुहोस् ↗
            </div>
          </button>
        </div>
      </div>

      {/* Header Controls */}
      <div className="bg-stone-900 border border-stone-800 p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-stone-100">
              सफ्टवेयर खरिद भुक्तानी रुजु केन्द्र (Payment Approvals)
            </h2>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-stone-950 animate-bounce">
                {toDevanagariNumerals(pendingCount)} नयाँ आवेदन बाँकी
              </span>
            )}
          </div>
          <p className="text-xs text-stone-400 mt-1">
            क्लाइन्टहरूले eSewa/Khalti मार्फत पेश गरेका खरिद आवेदन रुजु गरी सफ्टवेयर सक्रिय (Approve) गर्नुहोस्।
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
              <span>← २. प्रयोगकर्ता लिसिटिङ</span>
            </button>
          )}
          {onNavigateToSwitchboard && (
            <button
              type="button"
              onClick={() => onNavigateToSwitchboard()}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>३. मेनु स्विचबोर्ड</span>
            </button>
          )}
          {onNavigateToLicenses && (
            <button
              type="button"
              onClick={() => onNavigateToLicenses()}
              className="px-3 py-1.5 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-purple-400" />
              <span>लाइसेन्स & ट्रायल</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => loadLeads(true)}
            disabled={isSyncing}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="सर्भरबाट नयाँ आवेदनहरू ताजा गर्नुहोस्"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : 'text-stone-400'}`} />
            <span>{isSyncing ? 'लोड हुँदैछ...' : 'ताजा गर्नुहोस् (Refresh)'}</span>
          </button>

          {actionSuccessMsg && (
            <div className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl animate-in fade-in">
              ✓ {actionSuccessMsg}
            </div>
          )}
        </div>
      </div>

      {/* Quick Direct Transaction Approver Box */}
      <div className="bg-gradient-to-r from-amber-950/60 via-stone-900 to-amber-950/60 border-2 border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-xl shadow-amber-950/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-500 text-stone-950 rounded-lg font-black text-xs flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-current" /> त्वरित स्वीकृति
              </span>
              <h3 className="font-bold text-stone-100 text-sm sm:text-base">
                eSewa / Khalti कारोबार नम्बर (Tx ID) बाट सिधै सक्रिय गर्नुहोस्
              </h3>
            </div>
            <p className="text-xs text-stone-400">
              ग्राहकले पठाएको Transaction Code (जस्तै: <code className="text-amber-300 font-mono font-bold">ESE454576474</code>) यहाँ राखी तुरून्त १-क्लिकमा अप्रुभ गर्नुहोस्।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="उदा: ESE454576474"
                value={manualTxInput}
                onChange={(e) => setManualTxInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleDirectApproveTx(manualTxInput);
                }}
                className="w-full sm:w-64 px-3 py-2 bg-stone-950 border border-amber-500/60 rounded-xl text-amber-200 placeholder:text-stone-500 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {manualTxInput !== 'ESE454576474' && (
                <button
                  type="button"
                  onClick={() => setManualTxInput('ESE454576474')}
                  className="absolute right-2 top-2 text-[10px] bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-2 py-0.5 rounded border border-amber-500/30 cursor-pointer"
                  title="हालैको ट्रान्ज्याक्सन कोड भर्नुहोस्"
                >
                  ESE454576474
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleDirectApproveTx(manualTxInput)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              स्वीकृत तथा सक्रिय गर्नुहोस् (Approve)
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-900 p-3 rounded-2xl border border-stone-800">
        <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-amber-600 text-white'
                : 'bg-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            सबै ({leads.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PURCHASE_PENDING')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'PURCHASE_PENDING'
                ? 'bg-amber-500 text-stone-950 font-black'
                : 'bg-stone-800 text-amber-300 hover:text-amber-200'
            }`}
          >
            स्वीकृति बाँकी ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PURCHASE_APPROVED')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'PURCHASE_APPROVED'
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            स्वीकृत ({leads.filter((l) => l.status === 'PURCHASE_APPROVED').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('TRIAL_ACTIVE')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === 'TRIAL_ACTIVE'
                ? 'bg-blue-600 text-white'
                : 'bg-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            २४ घण्टे ट्रायल ({leads.filter((l) => l.status === 'TRIAL_ACTIVE').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="नाम, फोन वा ट्रान्ज्याक्सन ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-stone-800 border border-stone-700 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Leads List / Cards */}
      <div className="space-y-3">
        {filteredLeads.length === 0 ? (
          <div className="bg-stone-900 border border-stone-800 p-8 rounded-2xl text-center text-stone-500 text-xs">
            कुनै आवेदन फेला परेन।
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const isPending = lead.status === 'PURCHASE_PENDING';
            const isApproved = lead.status === 'PURCHASE_APPROVED';
            const isTrial = lead.status === 'TRIAL_ACTIVE';

            return (
              <div
                key={lead.id}
                className={`bg-stone-900 border rounded-3xl p-4 sm:p-6 transition-all ${
                  isPending
                    ? 'border-amber-500 shadow-xl shadow-amber-950/30 ring-2 ring-amber-500/50'
                    : isApproved
                    ? 'border-emerald-500/50 shadow-md'
                    : 'border-stone-800'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-extrabold text-base sm:text-lg text-white font-serif tracking-tight">
                      {lead.fullName}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        isApproved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                          : isPending
                          ? 'bg-amber-500 text-stone-950 animate-pulse font-black shadow-sm'
                          : isTrial
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {isApproved ? '✓ स्वीकृत लाइसेन्स' : isPending ? '⏳ नयाँ खरिद आवेदन (स्वीकृति बाँकी)' : isTrial ? '⚡ २४ घण्टे ट्रायल' : lead.status}
                    </span>
                    {lead.planNameNepali && (
                      <span className="text-[11px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-lg font-bold">
                        • {lead.planNameNepali}
                      </span>
                    )}
                    {lead.paymentMethod === 'cash' && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border flex items-center gap-1 ${
                        lead.cashVerified
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                      }`}>
                        💵 नगद {lead.cashVerified ? '(रुजु भएको)' : '(रुजु आवश्यक)'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-stone-400">
                    <span>
                      माध्यम: <strong className="text-amber-300 uppercase font-mono">{lead.paymentMethod || 'eSewa'}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      रकम: <strong className="text-emerald-400 font-mono font-bold text-sm">रु. {toDevanagariNumerals(lead.planAmountNPR || 0)}</strong>
                    </span>
                    <span>•</span>
                    <span className="text-stone-400 font-mono text-[11px]">
                      {lead.submittedAtBS}
                    </span>
                  </div>
                </div>

                {/* ── THE 5 CORE REQUIRED FIELDS ── */}
                <div className="mt-4 bg-stone-950/85 border border-stone-800 rounded-2xl p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* 1. Name */}
                    <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800/80">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                        १. ग्राहकको नाम (Name):
                      </span>
                      <span className="text-sm font-black text-white font-serif mt-0.5 block">
                        {lead.fullName || 'विवरण बाँकी'}
                      </span>
                    </div>

                    {/* 2. Address */}
                    <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800/80">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                        २. ठेगाना (Address):
                      </span>
                      <span className="text-xs font-semibold text-stone-200 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>{lead.address || 'नेपाल'}</span>
                      </span>
                    </div>

                    {/* 3. Mobile No */}
                    <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800/80">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                        ३. मोबाइल नम्बर (Mobile No):
                      </span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-black text-amber-300 font-mono flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{lead.mobile}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(lead.mobile);
                            setActionSuccessMsg(`फोन नम्बर प्रतिलिपि गरियो: ${lead.mobile}`);
                            setTimeout(() => setActionSuccessMsg(null), 2500);
                          }}
                          className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-stone-200"
                          title="फोन नम्बर कपी"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* 4. WhatsApp No */}
                    <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800/80">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                        ४. ह्वाट्सएप नम्बर (WhatsApp No):
                      </span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-black text-emerald-300 font-mono flex items-center gap-1.5">
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{lead.whatsapp || lead.mobile}</span>
                        </span>
                        {lead.whatsapp && (
                          <button
                            type="button"
                            onClick={() => {
                              const clean = String(lead.whatsapp || '').replace(/\D/g, '');
                              const num = clean.startsWith('977') ? clean : (clean.length === 10 ? `977${clean}` : clean);
                              window.open(`https://wa.me/${num}?text=${encodeURIComponent('नमस्ते ' + lead.fullName + ' जी, बालानन्द वैदिक ज्योतिष सफ्टवेयर खरिद आवेदनका सम्बन्धमा सम्पर्क गर्दैछौं।')}`, '_blank');
                            }}
                            className="px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded text-[10px] font-bold border border-emerald-500/40 cursor-pointer"
                            title="WhatsApp च्याट खोल्नुहोस्"
                          >
                            च्याट ↗
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 5. Transaction ID */}
                    <div className="sm:col-span-2 bg-gradient-to-r from-amber-950/40 via-stone-900 to-amber-950/40 p-3 rounded-xl border-2 border-amber-500/60 shadow-sm">
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                        ५. eSewa / कारोबार नम्बर (Transaction ID):
                      </span>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <code className="text-sm sm:text-base font-black text-amber-200 font-mono bg-stone-950 px-3 py-1 rounded-lg border border-amber-500/60 select-all tracking-wider">
                          {lead.transactionId || 'रुजु हुन बाँकी'}
                        </code>
                        {lead.transactionId && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(lead.transactionId!);
                              setActionSuccessMsg(`कारोबार नम्बर प्रतिलिपि गरियो: ${lead.transactionId}`);
                              setTimeout(() => setActionSuccessMsg(null), 2500);
                            }}
                            className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-lg border border-stone-700 flex items-center gap-1 cursor-pointer transition-colors"
                            title="Txn ID कपी गर्नुहोस्"
                          >
                            <Copy className="w-3 h-3 text-amber-400" />
                            <span>कपी</span>
                          </button>
                        )}
                        <span className="text-[11px] text-stone-400">
                          स्थिति: <strong className={lead.paymentVerificationStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-400'}>
                            {lead.paymentVerificationStatus === 'VERIFIED' ? '✓ रुजु भएको' : 'रुजु बाँकी'}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls: Approve / Reject Actions + Serial Workflow Links */}
                <div className="mt-4 pt-3 border-t border-stone-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Serial Quick Links */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => onNavigateToUsers?.(lead.mobile)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="चरण २: प्रयोगकर्ता लिसिटिङ तालिकामा यो प्रोफाइल हेर्नुहोस्"
                    >
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>→ चरण २: लिसिटिङमा हेर्नुहोस्</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigateToSwitchboard?.(lead.mobile)}
                      className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="चरण ३: यस ग्राहकका लागि मेनु स्विचबोर्ड खोल्नुहोस्"
                    >
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      <span>→ चरण ३: मेनु नियन्त्रण</span>
                    </button>
                  </div>

                  {/* Action Buttons: 1-Click Approve / Reject */}
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDirectApproveLead(lead)}
                          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer active:scale-95"
                          title="१-क्लिकमा प्रमाणित गरी सफ्टवेयर सेवा तुरुन्त अनलक गर्नुहोस्"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                          <span>स्वीकृत गर्नुहोस् (Approve & Unlock)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openApprovalModal(lead)}
                          className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl text-xs flex items-center gap-1 border border-stone-700 transition-colors cursor-pointer"
                          title="विस्तृत रुजु फारम खोल्नुहोस्"
                        >
                          <span>विस्तृत रुजु</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setRejectionModalLead(lead);
                            setRejectionReasonInput('');
                          }}
                          className="px-3 py-2 bg-stone-800 hover:bg-rose-900 text-rose-300 hover:text-white font-bold rounded-xl text-xs flex items-center gap-1 border border-rose-900/50 transition-colors cursor-pointer"
                          title="खरिद आवेदन अस्वीकृत गर्नुहोस्"
                        >
                          <X className="w-4 h-4 text-rose-400" />
                          <span>अस्वीकृत</span>
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>स्वीकृत भइसकेको ({lead.approvedAtBS || '२०८१'})</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => openApprovalModal(lead)}
                          className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                          title="लाइसेन्स पुनः नवीकरण वा सम्पादन"
                        >
                          सम्पादन
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`के तपाईँ यो खरिद/ट्रायल रेकर्ड (${lead.fullName} - ${lead.mobile}) स्थायी रूपमा हटाउन चाहनुहुन्छ?`)) {
                          deleteClientLeadPermanently(lead.id);
                          deleteClientLeadPermanently(lead.mobile);
                          loadLeads();
                          onRefresh?.();
                        }
                      }}
                      className="p-2 bg-stone-800 hover:bg-rose-900 text-stone-400 hover:text-white rounded-xl border border-stone-700 transition-colors cursor-pointer"
                      title="रेकर्ड पूर्ण रूपमा हटाउनुहोस्"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── MODAL: PAYMENT APPROVAL & VERIFICATION ── */}
      {approvalModalLead && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-stone-900 border-2 border-amber-500/80 rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/40">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>सफ्टवेयर खरिद भुक्तानी रुजु तथा स्वीकृति</span>
                  </h3>
                  <p className="text-xs text-stone-400">
                    ग्राहक: <strong className="text-stone-200">{approvalModalLead.fullName}</strong> • फोन: <strong className="text-stone-200">{approvalModalLead.mobile}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setApprovalModalLead(null)}
                className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer Details Box */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-2 text-xs">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>१. ग्राहक तथा सम्पर्क विवरण</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-300">
                <div>ग्राहकको नाम: <strong className="text-white">{approvalModalLead.fullName}</strong></div>
                <div>मोबाइल: <strong className="text-amber-300 font-mono">{approvalModalLead.mobile}</strong></div>
                <div>WhatsApp: <strong className="text-emerald-300 font-mono">{approvalModalLead.whatsapp}</strong></div>
                <div>ठेगाना: <span className="text-stone-300">{approvalModalLead.address || 'नेपाल'}</span></div>
                <div>इमेल: <span className="text-stone-300">{approvalModalLead.email || 'उपलब्ध छैन'}</span></div>
                <div>आवेदन मिति: <span className="text-stone-300">{approvalModalLead.submittedAtBS}</span></div>
              </div>
            </div>

            {/* Purchase Details Box */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 space-y-2 text-xs">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" />
                <span>२. सफ्टवेयर तथा खरिद योजना विवरण</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-300">
                <div>सफ्टवेयर: <strong className="text-amber-300">नेपाली वैदिक ज्योतिष तथा वास्तु सफ्टवेयर</strong></div>
                <div>खरिद योजना: <strong className="text-white">{approvalModalLead.planNameNepali || '१ वर्षको सदस्यता'}</strong></div>
                <div>कुल रकम: <strong className="text-emerald-400 text-sm font-mono">रु. {toDevanagariNumerals(approvalModalLead.planAmountNPR || 0)}</strong></div>
                <div>भुक्तानी माध्यम: <strong className="text-amber-300 uppercase">{approvalModalLead.paymentMethod || 'eSewa'}</strong></div>
                {approvalModalLead.transactionId && (
                  <div className="sm:col-span-2">
                    कारोबार ID (Transaction ID): <code className="bg-stone-900 px-2 py-0.5 rounded text-amber-200 font-mono font-bold">{approvalModalLead.transactionId}</code>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Inputs */}
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
                    placeholder="उदा. eSewa/बैंक/नगद खातामा रकम प्राप्त भयो र रुजु गरियो..."
                    className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* MANDATORY CASH VERIFICATION CHECKBOX */}
            {approvalModalLead.paymentMethod === 'cash' && (
              <div className="bg-amber-950/50 border-2 border-amber-500/80 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-extrabold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>नगद भुक्तानी रुजु आवश्यकता (Cash Verification Mandatory)</span>
                </div>
                <p className="text-stone-300 text-[11px] leading-relaxed">
                  यस ग्राहकले नगद (Cash) भुक्तानी विकल्प रोज्नुभएको छ। ग्राहकबाट तोकिएको रकम <strong>रु. {toDevanagariNumerals(approvalModalLead.planAmountNPR || 0)}</strong> भौतिक रूपमा प्राप्त भएपछि मात्र तलको बाकसमा टिक लगाउनुहोस्। टिक नलगाई खरिद स्वीकृत गर्न मिल्दैन।
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

            {/* Modal Footer Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setApprovalModalLead(null)}
                className="w-full sm:w-auto px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl text-xs cursor-pointer transition-colors"
              >
                बन्द गर्नुहोस्
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {(() => {
                  const isCash = approvalModalLead.paymentMethod === 'cash';
                  const canApprove = !isCash || isCashVerified || approvalModalLead.cashVerified;

                  return (
                    <button
                      type="button"
                      disabled={!canApprove}
                      onClick={handleConfirmApproval}
                      className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black shadow-lg flex items-center justify-center gap-2 transition-all ${
                        canApprove
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-950/60 cursor-pointer active:scale-95'
                          : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed opacity-60'
                      }`}
                      title={!canApprove ? 'नगद भुक्तानी रुजु बाकसमा टिक लगाउनुहोस्' : 'स्वीकृत गरी सेवा खुल्ला गर्नुहोस्'}
                    >
                      <Check className="w-4 h-4" />
                      <span>स्वीकृत गरी सफ्टवेयर खुल्ला गर्नुहोस् (Approve & Unlock)</span>
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: REJECTION CONFIRMATION ── */}
      {rejectionModalLead && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-stone-900 border border-rose-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                <span>खरिद आवेदन अस्वीकृत गर्नुहोस्</span>
              </h3>
              <button
                type="button"
                onClick={() => setRejectionModalLead(null)}
                className="p-1 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-stone-300">
              ग्राहक: <strong>{rejectionModalLead.fullName}</strong> ({rejectionModalLead.mobile})
            </p>
            <div className="space-y-1">
              <label className="text-xs text-stone-400 font-bold block">अस्वीकृत गर्नुको कारण खुलाउनुहोस्:</label>
              <input
                type="text"
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="उदा. eSewa खातामा रकम प्राप्त भएन, कारोबार नम्बर मिलेन..."
                className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-xs outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setRejectionModalLead(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                रद्द
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                अस्वीकृति पुष्टि गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
