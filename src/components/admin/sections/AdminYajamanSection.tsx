import React, { useState } from 'react';
import {
  UserCheck,
  Search,
  Eye,
  Calendar,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  Lock,
  Unlock,
  Trash2,
  AlertTriangle,
  X,
  Clock,
  UserX,
  ShieldAlert,
  MapPin,
  Check
} from 'lucide-react';
import { RBACUser, updateRBACUserStatus, deleteRBACUser } from '../../../db/rbacStore';
import { Booking } from '../../../types/yajamanTypes';
import { getStoredYajamanUsers, saveYajamanUsers } from '../../../db/yajamanStore';
import { formatNPRCurrency } from '../../../db/subscriptionStore';

interface AdminYajamanSectionProps {
  users: RBACUser[];
  bookings: Booking[];
  onRefresh: () => void;
}

export const AdminYajamanSection: React.FC<AdminYajamanSectionProps> = ({ users, bookings, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedYajaman, setSelectedYajaman] = useState<RBACUser | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<RBACUser | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const allYajamans = users.filter(u => u.role === 'CUSTOMER');

  const filteredYajamanList = allYajamans.filter(u => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery) ||
      (u.customerId && u.customerId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? u.status === 'active' :
      u.status === 'suspended' || u.status === 'disabled' || u.status === 'rejected';

    return matchesSearch && matchesStatus;
  });

  const activeCount = allYajamans.filter(u => u.status === 'active').length;
  const suspendedCount = allYajamans.filter(u => u.status === 'suspended' || u.status === 'disabled').length;

  // Handle Block / Suspend
  const handleBlockUser = (user: RBACUser) => {
    if (confirm(`के तपाईं "${user.fullName}" को खाता ब्लक (निलम्बन) गर्न चाहनुहुन्छ? ब्लक गरेपछि उहाँले लगइन गर्न सक्नुहुने छैन।`)) {
      setActionLoading(true);
      const res = updateRBACUserStatus(user.id, 'suspended', 'superadmin', 'Super Admin blocked user');
      setActionLoading(false);
      if (res.success) {
        showFeedback('success', `"${user.fullName}" को खाता सफलतापूर्वक ब्लक गरियो।`);
        onRefresh();
        if (selectedYajaman?.id === user.id) {
          setSelectedYajaman(null);
        }
      } else {
        showFeedback('error', res.message || 'ब्लक गर्न असफल भयो।');
      }
    }
  };

  // Handle Unblock / Activate
  const handleUnblockUser = (user: RBACUser) => {
    setActionLoading(true);
    const res = updateRBACUserStatus(user.id, 'active', 'superadmin', 'Super Admin unblocked user');
    setActionLoading(false);
    if (res.success) {
      showFeedback('success', `"${user.fullName}" को खाता सफलतापूर्वक अनब्लक (सक्रिय) गरियो।`);
      onRefresh();
      if (selectedYajaman?.id === user.id) {
        setSelectedYajaman(null);
      }
    } else {
      showFeedback('error', res.message || 'अनब्लक गर्न असफल भयो।');
    }
  };

  // Handle Permanent Delete
  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    setActionLoading(true);
    const target = deleteCandidate;

    // Delete from RBAC Store
    const res = deleteRBACUser(target.id, 'superadmin');

    // Also clean up from Yajaman User Store if exists
    try {
      const storedYajamans = getStoredYajamanUsers();
      const filtered = storedYajamans.filter(y => y.id !== target.id && y.mobile !== target.phone);
      if (filtered.length !== storedYajamans.length) {
        saveYajamanUsers(filtered);
      }
    } catch {}

    setActionLoading(false);
    setDeleteCandidate(null);

    if (res.success) {
      showFeedback('success', `"${target.fullName}" को खाता र प्रोफाइल स्थायी रूपमा मेटाइयो।`);
      onRefresh();
      if (selectedYajaman?.id === target.id) {
        setSelectedYajaman(null);
      }
    } else {
      showFeedback('error', res.message || 'मेटाउन असफल भयो।');
    }
  };

  // Get Yajaman bookings
  const getYajamanBookings = (user: RBACUser) => {
    return bookings.filter(b => b.yajamanId === user.id || b.phone === user.phone);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 p-5 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>यजमान तथा ग्राहक व्यवस्थापन</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-100 flex items-center gap-2.5 font-serif">
            <span>४. यजमान ग्राहक प्रोफाइल (Yajaman Customer Profiles)</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
            प्रणालीमा दर्ता भएका यजमानहरूको प्रोफाइल, बुकिङ इतिहास, खाता ब्लक/अनब्लक तथा स्थायी हटाउने नियन्त्रण।
          </p>
        </div>

        {/* Quick Stats Summary */}
        <div className="flex items-center gap-3">
          <div className="bg-stone-950/80 border border-stone-800 px-3.5 py-2 rounded-2xl text-center min-w-[70px]">
            <span className="text-[10px] text-stone-400 block font-bold">कुल यजमान</span>
            <span className="text-base font-black text-amber-400">{allYajamans.length}</span>
          </div>
          <div className="bg-stone-950/80 border border-emerald-900/60 px-3.5 py-2 rounded-2xl text-center min-w-[70px]">
            <span className="text-[10px] text-emerald-400 block font-bold">सक्रिय</span>
            <span className="text-base font-black text-emerald-400">{activeCount}</span>
          </div>
          <div className="bg-stone-950/80 border border-rose-900/60 px-3.5 py-2 rounded-2xl text-center min-w-[70px]">
            <span className="text-[10px] text-rose-400 block font-bold">ब्लक/निलम्बित</span>
            <span className="text-base font-black text-rose-400">{suspendedCount}</span>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between gap-3 shadow-lg transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border border-emerald-700'
              : 'bg-rose-950/90 text-rose-200 border border-rose-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-stone-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
          <input
            type="text"
            placeholder="यजमानको नाम, मोबाइल वा ID खोज्नुहोस्..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-900 border border-stone-800 text-stone-100 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-amber-500 placeholder:text-stone-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-stone-900/90 p-1 border border-stone-800 rounded-xl">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-amber-500 text-stone-950 font-black'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            सबै ({allYajamans.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white font-black'
                : 'text-stone-400 hover:text-emerald-400'
            }`}
          >
            सक्रिय ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('suspended')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'suspended'
                ? 'bg-rose-700 text-white font-black'
                : 'text-stone-400 hover:text-rose-400'
            }`}
          >
            ब्लक/निलम्बित ({suspendedCount})
          </button>
        </div>
      </div>

      {/* Yajaman Customers Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950 text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-800">
              <tr>
                <th className="p-3.5">यजमानको नाम</th>
                <th className="p-3.5">सम्पर्क नम्बर</th>
                <th className="p-3.5">दर्ता मिति</th>
                <th className="p-3.5">खाता स्थिति</th>
                <th className="p-3.5 text-right">कार्यहरू (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredYajamanList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-500 italic">
                    कुनै यजमान भेटिएन।
                  </td>
                </tr>
              ) : (
                filteredYajamanList.map((y) => {
                  const isBlocked = y.status === 'suspended' || y.status === 'disabled' || y.status === 'rejected';

                  return (
                    <tr key={y.id} className="hover:bg-stone-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-stone-100 flex items-center gap-1.5">
                          <span>{y.fullName}</span>
                        </div>
                        {y.customerId && (
                          <span className="text-[10px] text-amber-400 font-mono block mt-0.5">
                            {y.customerId}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-stone-300">
                        📞 {y.phone}
                      </td>
                      <td className="p-3.5 font-mono text-stone-400">
                        {y.createdAtBS || '२०८१-०१-०१'}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            !isBlocked
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              !isBlocked ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                          />
                          {!isBlocked ? 'सक्रिय (Active)' : 'ब्लक/निलम्बित'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
                          {/* History / View Button */}
                          <button
                            onClick={() => setSelectedYajaman(y)}
                            className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                            title="इतिहास तथा प्रोफाइल विवरण हेर्नुहोस्"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>इतिहास</span>
                          </button>

                          {/* Block / Unblock Toggle Button */}
                          {!isBlocked ? (
                            <button
                              onClick={() => handleBlockUser(y)}
                              disabled={actionLoading}
                              className="px-2.5 py-1.5 bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                              title="यस यजमानको खाता ब्लक गर्नुहोस्"
                            >
                              <Lock className="w-3 h-3 text-rose-400" />
                              <span>ब्लक</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnblockUser(y)}
                              disabled={actionLoading}
                              className="px-2.5 py-1.5 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                              title="यस यजमानको खाता अनब्लक गर्नुहोस्"
                            >
                              <Unlock className="w-3 h-3 text-emerald-400" />
                              <span>अनब्लक</span>
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeleteCandidate(y)}
                            disabled={actionLoading}
                            className="px-2 py-1.5 bg-stone-800 hover:bg-rose-950 hover:border-rose-800 border border-stone-700 text-stone-400 hover:text-rose-300 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                            title="यस यजमानलाई स्थायी रूपमा मेटाउनुहोस्"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>हटाउनुहोस्</span>
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

      {/* CONFIRM DELETE MODAL */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-stone-200">
            <div className="flex items-center gap-3 text-rose-400 border-b border-stone-800 pb-3">
              <div className="p-2.5 bg-rose-500/10 rounded-2xl border border-rose-500/30">
                <ShieldAlert className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-stone-100">यजमान खाता मेटाउने पुष्टि</h3>
                <p className="text-[11px] text-stone-400">यो कार्य स्थायी हो र उल्टाउन सकिँदैन।</p>
              </div>
            </div>

            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-2 text-xs">
              <p>
                <strong className="text-stone-400">यजमानको नाम:</strong>{' '}
                <span className="text-stone-100 font-bold">{deleteCandidate.fullName}</span>
              </p>
              <p>
                <strong className="text-stone-400">मोबाइल नम्बर:</strong>{' '}
                <span className="text-amber-400 font-mono font-bold">{deleteCandidate.phone}</span>
              </p>
              <p>
                <strong className="text-stone-400">दर्ता मिति:</strong>{' '}
                <span className="text-stone-300 font-mono">{deleteCandidate.createdAtBS}</span>
              </p>
            </div>

            <p className="text-xs text-rose-300/90 leading-relaxed bg-rose-950/40 p-3 rounded-xl border border-rose-900/50">
              के तपाईं साच्चिकै यो यजमान प्रोफाइल, उहाँको लगइन पहुँच र सम्पूर्ण सम्बद्ध डाटा स्थायी रूपमा मेटाउन चाहनुहुन्छ?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>स्थायी रूपमा मेटाउनुहोस्</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YAJAMAN DETAILS & HISTORY MODAL */}
      {selectedYajaman && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-base text-stone-100">{selectedYajaman.fullName}</h3>
                  <p className="text-[11px] text-stone-400 font-mono">
                    {selectedYajaman.customerId || selectedYajaman.id} • {selectedYajaman.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedYajaman(null)}
                className="text-stone-400 hover:text-white text-lg font-bold p-1 rounded-lg hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-1.5">
                <p>
                  <strong className="text-stone-400">सम्पर्क नम्बर:</strong>{' '}
                  <span className="text-stone-100 font-mono font-bold">📞 {selectedYajaman.phone}</span>
                </p>
                <p>
                  <strong className="text-stone-400">इमेल:</strong>{' '}
                  <span className="text-stone-200">{selectedYajaman.email || 'उपलब्ध छैन'}</span>
                </p>
                <p>
                  <strong className="text-stone-400">दर्ता मिति (BS):</strong>{' '}
                  <span className="text-amber-400 font-mono font-bold">{selectedYajaman.createdAtBS}</span>
                </p>
              </div>

              <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 space-y-1.5">
                <p>
                  <strong className="text-stone-400">खाता स्थिति:</strong>{' '}
                  <span
                    className={`font-bold ${
                      selectedYajaman.status === 'active' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {selectedYajaman.status === 'active' ? 'सक्रिय (Active)' : 'ब्लक/निलम्बित'}
                  </span>
                </p>
                <p>
                  <strong className="text-stone-400">कुल बुकिङहरू:</strong>{' '}
                  <span className="text-stone-100 font-bold">{getYajamanBookings(selectedYajaman).length} पटक</span>
                </p>
              </div>
            </div>

            {/* Quick Actions Bar Inside Modal */}
            <div className="flex items-center justify-between p-3 bg-stone-950/70 border border-stone-800 rounded-2xl gap-2">
              <span className="text-xs text-stone-400 font-bold">यजमान खाता नियन्त्रण:</span>
              <div className="flex items-center gap-2">
                {selectedYajaman.status === 'active' ? (
                  <button
                    onClick={() => handleBlockUser(selectedYajaman)}
                    className="px-3 py-1.5 bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Lock className="w-3 h-3 text-rose-400" />
                    <span>खाता ब्लक गर्नुहोस्</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnblockUser(selectedYajaman)}
                    className="px-3 py-1.5 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Unlock className="w-3 h-3 text-emerald-400" />
                    <span>खाता अनब्लक गर्नुहोस्</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setDeleteCandidate(selectedYajaman);
                    setSelectedYajaman(null);
                  }}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-rose-950 hover:border-rose-800 border border-stone-700 text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>मेटाउनुहोस्</span>
                </button>
              </div>
            </div>

            {/* Bookings History Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>सेवा तथा बुकिङ इतिहास ({getYajamanBookings(selectedYajaman).length})</span>
              </h4>

              {getYajamanBookings(selectedYajaman).length === 0 ? (
                <div className="p-6 bg-stone-950/50 rounded-2xl border border-stone-800 text-center text-stone-500 text-xs italic">
                  यस यजमानबाट हालसम्म कुनै सेवा बुकिङ गरिएको छैन।
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {getYajamanBookings(selectedYajaman).map((b) => (
                    <div
                      key={b.id}
                      className="p-3 bg-stone-950 border border-stone-800/80 rounded-xl flex items-center justify-between text-xs gap-3"
                    >
                      <div>
                        <strong className="text-stone-100 block">{b.serviceNameNepali || b.categoryCode}</strong>
                        <span className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
                          <Calendar className="w-3 h-3 text-stone-500" />
                          <span>{b.preferredDateBS || b.dateBS || 'मिति उपलब्ध छैन'}</span>
                          {b.bookingCode && (
                            <span className="text-amber-400 font-mono font-bold">#{b.bookingCode}</span>
                          )}
                        </span>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'COMPLETED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : b.status === 'CANCELLED'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {b.status}
                        </span>
                        {b.totalAmount && (
                          <span className="block text-[11px] text-stone-300 font-mono mt-1 font-bold">
                            {formatNPRCurrency(b.totalAmount)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedYajaman(null)}
                className="px-5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
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
