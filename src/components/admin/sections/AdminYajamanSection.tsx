import React, { useState, useEffect } from 'react';
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
  Check,
  Plus,
  MessageSquare,
  ShieldCheck,
  ThumbsUp,
  Share2,
  Sliders
} from 'lucide-react';
import { RBACUser, updateRBACUserStatus, deleteRBACUser } from '../../../db/rbacStore';
import { Booking, YajamanPost } from '../../../types/yajamanTypes';
import {
  getStoredYajamanUsers,
  saveYajamanUsers,
  getStoredYajamanPosts,
  saveYajamanPosts,
  logYajamanAction
} from '../../../db/yajamanStore';
import { formatNPRCurrency } from '../../../db/subscriptionStore';
import { YajamanCreatePostForm } from '../../yajaman/YajamanCreatePostForm';
import { YajamanAdminModerationPanel } from '../../yajaman/YajamanAdminModerationPanel';

interface AdminYajamanSectionProps {
  users: RBACUser[];
  bookings: Booking[];
  onRefresh: () => void;
}

export const AdminYajamanSection: React.FC<AdminYajamanSectionProps> = ({ users, bookings, onRefresh }) => {
  const [activeSubTab, setActiveSubTab] = useState<'accounts' | 'posts' | 'moderation'>('accounts');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedYajaman, setSelectedYajaman] = useState<RBACUser | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<RBACUser | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Posts State
  const [posts, setPosts] = useState<YajamanPost[]>(() => getStoredYajamanPosts());
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [postSearch, setPostSearch] = useState('');
  const [postStatusFilter, setPostStatusFilter] = useState<'all' | 'APPROVED' | 'PENDING' | 'REJECTED'>('all');

  const reloadPosts = () => {
    setPosts(getStoredYajamanPosts());
  };

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

  // Post Actions for Superadmin
  const handleApprovePost = (postId: string) => {
    const updated = posts.map(p => p.id === postId ? { ...p, status: 'APPROVED' as const } : p);
    setPosts(updated);
    saveYajamanPosts(updated);
    logYajamanAction('superadmin', 'सुपरएडमिन', 'APPROVE_POST', 'POST', postId, 'पोस्ट स्वीकृत गरियो');
    showFeedback('success', 'पोस्ट सफलतापूर्वक स्वीकृत गरियो।');
  };

  const handleRejectPost = (postId: string) => {
    const updated = posts.map(p => p.id === postId ? { ...p, status: 'REJECTED' as const } : p);
    setPosts(updated);
    saveYajamanPosts(updated);
    logYajamanAction('superadmin', 'सुपरएडमिन', 'REJECT_POST', 'POST', postId, 'पोस्ट अस्वीकृत गरियो');
    showFeedback('success', 'पोस्ट अस्वीकृत गरियो।');
  };

  const handleDeletePost = (postId: string) => {
    if (!confirm('के तपाईं यो पोस्ट पूर्ण रूपमा हटाउन चाहनुहुन्छ?')) return;
    const updated = posts.filter(p => p.id !== postId);
    setPosts(updated);
    saveYajamanPosts(updated);
    logYajamanAction('superadmin', 'सुपरएडमिन', 'DELETE_POST', 'POST', postId, 'पोस्ट हटाइयो');
    showFeedback('success', 'पोस्ट सफलतापूर्वक हटाइयो।');
  };

  const filteredPosts = posts.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(postSearch.toLowerCase()) ||
      p.authorName.toLowerCase().includes(postSearch.toLowerCase()) ||
      (p.district && p.district.toLowerCase().includes(postSearch.toLowerCase()));

    const matchesStatus =
      postStatusFilter === 'all' ? true : p.status === postStatusFilter;

    return matchesSearch && matchesStatus;
  });

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
            <span>यजमान, पोस्ट तथा नियन्त्रण केन्द्र</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-100 flex items-center gap-2.5 font-serif">
            <span>४. यजमान सेवा, पोस्ट र नियन्त्रण केन्द्र (Yajaman & Moderation Hub)</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
            दर्ता भएका यजमानहरूको प्रोफाइल, सामुदायिक पोस्ट प्रकाशन/स्वीकृति, र पूर्ण यजमान नियन्त्रण केन्द्र।
          </p>
        </div>

        {/* Quick Stats Summary */}
        <div className="flex items-center gap-3">
          <div className="bg-stone-950/80 border border-stone-800 px-3.5 py-2 rounded-2xl text-center min-w-[70px]">
            <span className="text-[10px] text-stone-400 block font-bold">कुल यजमान</span>
            <span className="text-base font-black text-amber-400">{allYajamans.length}</span>
          </div>
          <div className="bg-stone-950/80 border border-blue-900/60 px-3.5 py-2 rounded-2xl text-center min-w-[70px]">
            <span className="text-[10px] text-blue-400 block font-bold">सामुदायिक पोस्ट</span>
            <span className="text-base font-black text-blue-400">{posts.length}</span>
          </div>
          <div className="bg-stone-950/80 border border-rose-900/60 px-3.5 py-2 rounded-2xl text-center min-w-[70px]">
            <span className="text-[10px] text-rose-400 block font-bold">ब्लक/निलम्बित</span>
            <span className="text-base font-black text-rose-400">{suspendedCount}</span>
          </div>
        </div>
      </div>

      {/* Sub-tab Switcher Bar */}
      <div className="flex items-center gap-2 bg-stone-900/90 p-1.5 rounded-2xl border border-stone-800 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('accounts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'accounts'
              ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
              : 'text-stone-300 hover:bg-stone-800 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>१. यजमान ग्राहक प्रोफाइल ({allYajamans.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('posts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'posts'
              ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
              : 'text-stone-300 hover:bg-stone-800 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>२. सामुदायिक पोस्ट सिर्जना तथा व्यवस्थापन ({posts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('moderation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === 'moderation'
              ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
              : 'text-stone-300 hover:bg-stone-800 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>३. यजमान नियन्त्रण केन्द्र (Admin Moderation)</span>
        </button>
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

      {/* ── TAB 1: YAJAMAN CUSTOMER ACCOUNTS ── */}
      {activeSubTab === 'accounts' && (
        <div className="space-y-4">
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
                      <td colSpan={5} className="p-8 text-center text-stone-500">
                        कुनै यजमान फेला परेन।
                      </td>
                    </tr>
                  ) : (
                    filteredYajamanList.map((user) => {
                      const isSuspended = user.status === 'suspended' || user.status === 'disabled' || user.status === 'rejected';
                      const uBookings = getYajamanBookings(user);

                      return (
                        <tr key={user.id} className="hover:bg-stone-850/50 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                                {user.fullName.charAt(0) || 'य'}
                              </div>
                              <div>
                                <span className="font-bold text-stone-100 block">{user.fullName}</span>
                                {user.customerId && (
                                  <span className="text-[10px] font-mono text-amber-400/80 block">{user.customerId}</span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5 font-mono text-stone-300">
                            {user.phone || 'उपलब्ध छैन'}
                          </td>

                          <td className="p-3.5 text-stone-400">
                            {user.createdAtBS || user.createdAtISO?.split('T')[0] || '२०८१'}
                          </td>

                          <td className="p-3.5">
                            {isSuspended ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                                ब्लक गरिएको
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                                सक्रिय
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Details */}
                              <button
                                type="button"
                                onClick={() => setSelectedYajaman(user)}
                                className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-colors cursor-pointer"
                                title="विवरण हेर्नुहोस्"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Block / Unblock */}
                              {isSuspended ? (
                                <button
                                  type="button"
                                  onClick={() => handleUnblockUser(user)}
                                  className="px-2 py-1 bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                  title="खाता खुला गर्नुहोस्"
                                >
                                  <Unlock className="w-3 h-3" />
                                  <span>अनब्लक</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleBlockUser(user)}
                                  className="px-2 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                                  title="खाता बन्द गर्नुहोस्"
                                >
                                  <Lock className="w-3 h-3" />
                                  <span>ब्लक</span>
                                </button>
                              )}

                              {/* Permanent Delete */}
                              <button
                                type="button"
                                onClick={() => setDeleteCandidate(user)}
                                className="p-1.5 bg-rose-950/50 hover:bg-rose-900 text-rose-400 rounded-lg transition-colors cursor-pointer"
                                title="स्थायी मेटाउनुहोस्"
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
        </div>
      )}

      {/* ── TAB 2: COMMUNITY POSTS & CREATE POST ── */}
      {activeSubTab === 'posts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-900/80 p-4 rounded-2xl border border-stone-800">
            <div>
              <span className="font-bold text-white text-sm block">
                सामुदायिक पोस्ट प्रकाशन तथा सम्पादन नियन्त्रण
              </span>
              <span className="text-stone-400 text-xs">
                सुपरएडमिनको पूर्ण अधिकारबाट धार्मिक सेवा, पूजा विधि तथा घोषणा पोस्टहरू प्रकाशन तथा सम्पादन गर्नुहोस्।
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsCreatePostOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ नयाँ पोस्ट सिर्जना गर्नुहोस्</span>
            </button>
          </div>

          {/* Posts Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
              <input
                type="text"
                placeholder="शीर्षक, लेखक वा स्थान खोज्नुहोस्..."
                value={postSearch}
                onChange={(e) => setPostSearch(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 text-stone-100 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-stone-900/90 p-1 border border-stone-800 rounded-xl">
              <button
                onClick={() => setPostStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  postStatusFilter === 'all'
                    ? 'bg-amber-500 text-stone-950 font-black'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                सबै ({posts.length})
              </button>
              <button
                onClick={() => setPostStatusFilter('APPROVED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  postStatusFilter === 'APPROVED'
                    ? 'bg-emerald-600 text-white font-black'
                    : 'text-stone-400 hover:text-emerald-400'
                }`}
              >
                स्वीकृत ({posts.filter(p => p.status === 'APPROVED').length})
              </button>
              <button
                onClick={() => setPostStatusFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  postStatusFilter === 'PENDING'
                    ? 'bg-amber-600 text-white font-black'
                    : 'text-stone-400 hover:text-amber-400'
                }`}
              >
                पेन्डिङ ({posts.filter(p => p.status === 'PENDING').length})
              </button>
              <button
                onClick={() => setPostStatusFilter('REJECTED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  postStatusFilter === 'REJECTED'
                    ? 'bg-rose-700 text-white font-black'
                    : 'text-stone-400 hover:text-rose-400'
                }`}
              >
                अस्वीकृत ({posts.filter(p => p.status === 'REJECTED').length})
              </button>
            </div>
          </div>

          {/* Posts Table */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950 text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-800">
                  <tr>
                    <th className="p-3.5">पोस्टको शीर्षक</th>
                    <th className="p-3.5">श्रेणी / सेवा</th>
                    <th className="p-3.5">प्रकाशक / स्थान</th>
                    <th className="p-3.5">प्रतिक्रिया</th>
                    <th className="p-3.5">स्थिति</th>
                    <th className="p-3.5 text-right">कार्यहरू (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-500">
                        कुनै पोस्ट फेला परेन।
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-stone-850/50 transition-colors">
                        <td className="p-3.5">
                          <div className="min-w-0 max-w-[240px]">
                            <strong className="text-stone-100 block truncate">{post.title}</strong>
                            <span className="text-[10px] text-stone-500 truncate block">{post.description}</span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            {post.categoryNameNepali || post.categoryCode}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="text-stone-200 block font-medium">{post.authorName}</span>
                          <span className="text-[10px] text-stone-500">{post.district || 'नेपाल'}</span>
                        </td>

                        <td className="p-3.5 text-stone-400 font-mono text-[11px]">
                          <span className="inline-flex items-center gap-1 mr-2">
                            <ThumbsUp className="w-3 h-3 text-amber-400" /> {post.likesCount || 0}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Share2 className="w-3 h-3 text-blue-400" /> {post.sharesCount || 0}
                          </span>
                        </td>

                        <td className="p-3.5">
                          {post.status === 'APPROVED' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                              स्वीकृत
                            </span>
                          ) : post.status === 'REJECTED' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                              अस्वीकृत
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                              पेन्डिङ
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {post.status !== 'APPROVED' && (
                              <button
                                type="button"
                                onClick={() => handleApprovePost(post.id)}
                                className="px-2 py-1 bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                title="स्वीकृत गर्नुहोस्"
                              >
                                स्वीकृत
                              </button>
                            )}

                            {post.status !== 'REJECTED' && (
                              <button
                                type="button"
                                onClick={() => handleRejectPost(post.id)}
                                className="px-2 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/50 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                                title="अस्वीकृत गर्नुहोस्"
                              >
                                अस्वीकृत
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeletePost(post.id)}
                              className="p-1.5 bg-stone-800 hover:bg-rose-900 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="हटाउनुहोस्"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: ADMIN MODERATION PANEL ── */}
      {activeSubTab === 'moderation' && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-xl">
          <YajamanAdminModerationPanel
            currentUserId="superadmin"
            currentUserName="मुख्य प्रशासक (Super Admin)"
            onRefreshData={() => {
              reloadPosts();
              onRefresh();
            }}
          />
        </div>
      )}

      {/* Create Post Modal in Super Admin */}
      {isCreatePostOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 text-amber-500 rounded-xl">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    आधिकारिक सामुदायिक पोस्ट सिर्जना गर्नुहोस्
                  </h3>
                  <p className="text-[10px] text-stone-500">
                    सुपरएडमिन अधिकारसहित यो पोस्ट तुरुन्त प्रकाशित हुनेछ।
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatePostOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <YajamanCreatePostForm
              currentUserId="superadmin"
              currentUserName="बालानन्द वैदिक ज्योतिष (आधिकारिक)"
              currentUserRole="PANDIT"
              currentUserDistrict="काठमाडौँ"
              currentUserLocalLevel="केन्द्रीय कार्यालय"
              isVerified={true}
              onPostCreated={() => {
                setIsCreatePostOpen(false);
                reloadPosts();
                showFeedback('success', 'आधिकारिक पोस्ट सफलतापूर्वक प्रकाशित गरियो!');
              }}
              onCancel={() => setIsCreatePostOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-rose-700/60 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 text-rose-400 border border-rose-800 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-stone-100">स्थायी रूपमा खाता मेटाउने?</h3>
              <p className="text-xs text-stone-400">
                के तपाईं <strong className="text-rose-300">"{deleteCandidate.fullName}"</strong> को यजमान खाता स्थायी रूपमा हटाउन निश्चित हुनुहुन्छ? यो कार्य फिर्ता गर्न सकिँदैन।
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? 'मेटाउँदै...' : 'हो, स्थायी मेटाउनुहोस्'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Yajaman Details Modal */}
      {selectedYajaman && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-base border border-amber-500/30">
                  {selectedYajaman.fullName.charAt(0) || 'य'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-100">{selectedYajaman.fullName}</h3>
                  <span className="text-[10px] font-mono text-amber-400">{selectedYajaman.customerId || 'ID छैन'}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedYajaman(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-stone-950 p-4 rounded-2xl border border-stone-800">
              <div>
                <span className="text-[10px] text-stone-400 block">सम्पर्क फोन:</span>
                <strong className="text-stone-200 font-mono">{selectedYajaman.phone || 'उपलब्ध छैन'}</strong>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block">इमेल:</span>
                <strong className="text-stone-200">{selectedYajaman.email || 'उपलब्ध छैन'}</strong>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block">खाता स्थिति:</span>
                <strong className={selectedYajaman.status === 'active' ? 'text-emerald-400' : 'text-rose-400'}>
                  {selectedYajaman.status === 'active' ? 'सक्रिय' : 'निलम्बित / बन्द'}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block">दर्ता मिति:</span>
                <strong className="text-stone-200">{selectedYajaman.createdAtBS || '२०८१'}</strong>
              </div>
            </div>

            <div className="space-y-2">
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
