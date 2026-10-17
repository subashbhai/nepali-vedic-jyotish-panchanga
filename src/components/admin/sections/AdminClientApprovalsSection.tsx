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
  CreditCard
} from 'lucide-react';
import {
  ClientLead,
  getStoredClientLeads,
  syncClientLeadsFromServer,
  deleteClientLeadPermanently
} from '../../../db/clientLeadStore';
import { unifiedUserSyncService } from '../../../services/unifiedUserSyncService';
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

    // Auto-poll server every 4 seconds for real-time live incoming purchase leads
    const interval = setInterval(() => {
      loadLeads(false);
    }, 4000);

    return () => {
      window.removeEventListener('client-leads-updated', handleLeadsUpdated);
      window.removeEventListener('service-license-updated', handleLeadsUpdated);
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
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 p-4 sm:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-stone-100">
              सफ्टवेयर खरिद तथा लाइसेन्स स्वीकृति केन्द्र (Purchases & Approvals)
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
          {onNavigateToLicenses && (
            <button
              type="button"
              onClick={() => onNavigateToLicenses()}
              className="px-3 py-1.5 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-purple-400" />
              <span>सदस्यता & लाइसेन्स</span>
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
                className={`bg-stone-900 border rounded-2xl p-4 sm:p-5 transition-all ${
                  isPending
                    ? 'border-amber-500/80 shadow-md ring-1 ring-amber-500/40'
                    : isApproved
                    ? 'border-emerald-500/40'
                    : 'border-stone-800'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Client Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-stone-100 font-serif">
                        {lead.fullName}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : isPending
                            ? 'bg-amber-500 text-stone-950 font-black'
                            : isTrial
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {isApproved ? '✓ स्वीकृत लाइसेन्स' : isPending ? '⏳ स्वीकृति बाँकी' : isTrial ? '⚡ २४ घण्टे ट्रायल' : lead.status}
                      </span>
                      {lead.planNameNepali && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-bold">
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-stone-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-stone-500" />
                        <span>फोन: <b className="text-stone-200">{lead.mobile}</b></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span>WhatsApp: <b className="text-emerald-300">{lead.whatsapp}</b></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-stone-500" />
                        <span>इमेल: <span className="text-stone-200">{lead.email || 'उपलब्ध छैन'}</span></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-stone-400 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-500" />
                        <span>ठेगाना: <span className="text-stone-300">{lead.address}</span></span>
                      </div>
                      <div>
                        दर्ता मिति: <span className="text-stone-300 font-mono">{lead.submittedAtBS}</span>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="mt-2 p-2.5 bg-stone-800/80 rounded-xl border border-stone-700/80 text-xs flex flex-wrap items-center gap-4">
                      <div>
                        भुक्तानी माध्यम: <b className="text-amber-300 uppercase">{lead.paymentMethod || 'eSewa'}</b>
                      </div>
                      <div>
                        रकम: <b className="text-emerald-400">रु. {toDevanagariNumerals(lead.planAmountNPR || 0)}</b>
                      </div>
                      {lead.transactionId && (
                        <div>
                          कारोबार ID: <code className="bg-stone-900 px-2 py-0.5 rounded text-amber-200 font-mono font-bold">{lead.transactionId}</code>
                        </div>
                      )}
                      <div>
                        रुजु स्थिति: <b className={lead.paymentVerificationStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-400'}>
                          {lead.paymentVerificationStatus === 'VERIFIED' ? '✓ रुजु भएको' : 'रुजु बाँकी'}
                        </b>
                      </div>
                    </div>

                    {/* Interlink Quick Navigation Pill Toolbar */}
                    <div className="flex items-center gap-2 pt-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => onNavigateToSwitchboard?.(lead.mobile)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="यस ग्राहकको मेनु स्विचबोर्ड खोल्नुहोस्"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>मेनु स्विचबोर्ड</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigateToUsers?.(lead.mobile)}
                        className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="प्रयोगकर्ता व्यवस्थापन तालिकामा यो विवरण हेर्नुहोस्"
                      >
                        <Users className="w-3 h-3 text-amber-400" />
                        <span>प्रयोगकर्ता प्रोफाइल</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigateToLicenses?.(lead.mobile)}
                        className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        title="सदस्यता तथा लाइसेन्स नियन्त्रण हेर्नुहोस्"
                      >
                        <Crown className="w-3 h-3" />
                        <span>लाइसेन्स & ट्रायल</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() => openApprovalModal(lead)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
                          title="भुक्तानी रुजु गरी खरिद स्वीकृत गर्नुहोस्"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>रुजु तथा स्वीकृति (Verify & Approve)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectionModalLead(lead);
                            setRejectionReasonInput('');
                          }}
                          className="px-3 py-2 bg-stone-800 hover:bg-rose-900 text-stone-300 hover:text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer border border-stone-700"
                        >
                          <X className="w-4 h-4" />
                          <span>अस्वीकृत</span>
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <div className="flex items-center gap-2">
                        <div className="text-right text-xs">
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> स्वीकृत भइसकेको
                          </span>
                          <span className="text-[11px] text-stone-500">
                            {lead.approvedAtBS ? `मिति: ${lead.approvedAtBS}` : ''}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => openApprovalModal(lead)}
                          className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                          title="लाइसेन्स पुनः नवीकरण वा सम्पादन"
                        >
                          नवीकरण
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
