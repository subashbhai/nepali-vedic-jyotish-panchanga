import React, { useState } from 'react';
import {
  Crown,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Edit2,
  Trash2,
  Plus,
  Search,
  X,
  Check,
  RefreshCw,
  UserCheck,
  Phone,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import {
  OfficialMemberProfile,
  editOfficialMember,
  deleteOfficialMember,
  registerOfficialMember
} from '../../../db/officialMemberStore';
import { getActiveAdminSession } from '../../../db/adminStore';

interface AdminMembershipSectionProps {
  members: OfficialMemberProfile[];
  onRefresh: () => void;
}

export const AdminMembershipSection: React.FC<AdminMembershipSectionProps> = ({ members, onRefresh }) => {
  const adminSession = getActiveAdminSession();
  const adminUsername = adminSession?.username || 'admin';

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');

  // Modal States
  const [editingMember, setEditingMember] = useState<OfficialMemberProfile | null>(null);
  const [deletingMember, setDeletingMember] = useState<OfficialMemberProfile | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit Form Fields
  const [editFullName, setEditFullName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editPlanName, setEditPlanName] = useState('');
  const [editStartDateBS, setEditStartDateBS] = useState('');
  const [editExpiryDateBS, setEditExpiryDateBS] = useState('');
  const [editStatus, setEditStatus] = useState<string>('approved');
  const [editPhone, setEditPhone] = useState('');

  // Add Form Fields
  const [addFullName, setAddFullName] = useState('');
  const [addTitle, setAddTitle] = useState('ज्योतिषाचार्य');
  const [addRole, setAddRole] = useState<'astrologer' | 'purohit' | 'vastu'>('astrologer');
  const [addPlanName, setAddPlanName] = useState('वार्षिक प्रिमियम सदस्यता');
  const [addStartDateBS, setAddStartDateBS] = useState('२०८१ वैशाख ०१');
  const [addExpiryDateBS, setAddExpiryDateBS] = useState('२०८२ चैत्र ३०');
  const [addPhone, setAddPhone] = useState('');

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const openEditModal = (m: OfficialMemberProfile) => {
    setEditingMember(m);
    setEditFullName(m.fullName || '');
    setEditTitle(m.title || 'ज्योतिषाचार्य');
    setEditPlanName(m.membershipPlanNameNepali || 'वार्षिक प्रिमियम सदस्यता');
    setEditStartDateBS(m.membershipStartDateBS || m.registrationDateBS || '२०८१ वैशाख ०१');
    setEditExpiryDateBS(m.membershipExpiryDateBS || '२०८२ चैत्र ३०');
    setEditStatus(m.status || 'approved');
    setEditPhone(m.contactPhone || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const result = editOfficialMember(
      editingMember.id,
      {
        fullName: editFullName.trim(),
        title: editTitle.trim(),
        membershipPlanNameNepali: editPlanName.trim(),
        membershipStartDateBS: editStartDateBS.trim(),
        membershipExpiryDateBS: editExpiryDateBS.trim(),
        status: editStatus as any,
        contactPhone: editPhone.trim(),
      },
      adminUsername
    );

    if (result) {
      showFeedback('success', `${editFullName} को सदस्यता विवरण सफलतापूर्वक संशोधन गरियो!`);
      setEditingMember(null);
      onRefresh();
    } else {
      showFeedback('error', 'डाटा संशोधन गर्न असफल भयो।');
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingMember) return;

    const success = deleteOfficialMember(deletingMember.id, adminUsername);
    if (success) {
      showFeedback('success', `${deletingMember.fullName} को सदस्यता रेकर्ड सफलतापूर्वक हटाइयो!`);
      setDeletingMember(null);
      onRefresh();
    } else {
      showFeedback('error', 'रेकर्ड मेटाउन सकिएन।');
    }
  };

  const handleQuickRenew = (m: OfficialMemberProfile) => {
    const currentExpiry = m.membershipExpiryDateBS || '२०८२ चैत्र ३०';
    // Increment BS year, e.g. २०८२ -> २०८३
    let newExpiry = '२०८३ चैत्र ३०';
    if (currentExpiry.includes('२०८२')) {
      newExpiry = currentExpiry.replace('२०८२', '२०८३');
    } else if (currentExpiry.includes('२०८३')) {
      newExpiry = currentExpiry.replace('२०८३', '२०८४');
    }

    editOfficialMember(
      m.id,
      {
        membershipExpiryDateBS: newExpiry,
        status: 'approved',
      },
      adminUsername
    );

    showFeedback('success', `${m.fullName} को सदस्यता १ वर्षका लागि (${newExpiry} सम्म) नवीकरण गरियो!`);
    onRefresh();
  };

  const handleCreateNewMembership = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFullName.trim()) return;

    registerOfficialMember({
      fullName: addFullName.trim(),
      title: addTitle.trim(),
      role: addRole,
      expertise: ['वैदिक ज्योतिष', 'परामर्श'],
      contactPhone: addPhone.trim() || '९८००००००००',
      bio: 'सुपरएडमिनद्वारा दर्ता गरिएको आधिकारिक विशेषज्ञ।',
      experienceYears: 10,
    });

    showFeedback('success', `नयाँ विशेषज्ञ सदस्यता (${addFullName}) सफलतापूर्वक थपियो!`);
    setIsAddModalOpen(false);
    setAddFullName('');
    setAddPhone('');
    onRefresh();
  };

  // Filtered list
  const filtered = members.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.title && m.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.contactPhone && m.contactPhone.includes(searchQuery));

    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = m.status === 'approved' || m.approvalStatus === 'Approved';
    if (statusFilter === 'suspended') matchesStatus = m.status === 'suspended';
    if (statusFilter === 'pending') matchesStatus = m.status === 'pending';

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-stone-100 font-sans">
      {/* Top Header */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div>
          <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <span>विशेषज्ञ सदस्यता व्यवस्थापन (Expert Memberships)</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            सुपरएडमिन नियन्त्रण: विशेषज्ञहरूको सदस्यता विवरण सम्पादन (Edit) गर्न, हटाउन (Delete) वा नवीकरण गर्न सकिन्छ।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>नयाँ सदस्यता थप्नुहोस्</span>
          </button>

          <button
            onClick={onRefresh}
            className="p-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs transition-colors cursor-pointer"
            title="रिफ्रेस गर्नुहोस्"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border border-rose-800 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Status Filter Controls */}
      <div className="bg-stone-900 border border-stone-800 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-500" />
          <input
            type="text"
            placeholder="विशेषज्ञको नाम वा फोन नम्बर खोजी गर्नुहोस्..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-stone-100 outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-amber-500 text-stone-950 font-black'
                : 'bg-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            सबै ({members.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white font-black'
                : 'bg-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            सक्रिय ({members.filter((m) => m.status === 'approved' || m.approvalStatus === 'Approved').length})
          </button>
          <button
            onClick={() => setStatusFilter('suspended')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              statusFilter === 'suspended'
                ? 'bg-rose-600 text-white font-black'
                : 'bg-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            निलम्बित ({members.filter((m) => m.status === 'suspended').length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white font-black'
                : 'bg-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            पेन्डिङ ({members.filter((m) => m.status === 'pending').length})
          </button>
        </div>
      </div>

      {/* Main Memberships Table with Edit & Delete Actions */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-stone-950 text-stone-400 font-bold uppercase text-[10px] tracking-wider border-b border-stone-800">
              <tr>
                <th className="p-3.5">विशेषज्ञ (Expert)</th>
                <th className="p-3.5">सदस्यता प्रकार (Plan)</th>
                <th className="p-3.5">सुरु मिति (Start Date)</th>
                <th className="p-3.5">म्याद सकिने मिति (Expiry Date)</th>
                <th className="p-3.5">अवस्था (Status)</th>
                <th className="p-3.5 text-right">सुपरएडमिन कार्य (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-500 italic">
                    कुनै पनि विशेषज्ञ सदस्यता रेकर्ड भेटिएन।
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const isApproved = m.status === 'approved' || m.approvalStatus === 'Approved';
                  const isSuspended = m.status === 'suspended';
                  const startDate = m.membershipStartDateBS || m.registrationDateBS || '२०८१ वैशाख ०१';
                  const expiryDate = m.membershipExpiryDateBS || '२०८२ चैत्र ३०';
                  const planName = m.membershipPlanNameNepali || 'वार्षिक प्रिमियम सदस्यता';

                  return (
                    <tr key={m.id} className="hover:bg-stone-800/50 transition-colors group">
                      {/* Expert Details */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-serif text-amber-400 font-bold text-xs shrink-0">
                            {m.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                              {m.fullName}
                            </p>
                            <p className="text-[10px] text-stone-400">
                              {m.title || 'ज्योतिषाचार्य'} {m.contactPhone ? `• ${m.contactPhone}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Plan Name */}
                      <td className="p-3.5 font-bold text-amber-300">
                        {planName}
                      </td>

                      {/* Start Date */}
                      <td className="p-3.5 font-mono text-stone-400">
                        {startDate}
                      </td>

                      {/* Expiry Date */}
                      <td className="p-3.5 font-mono text-stone-200 font-bold">
                        {expiryDate}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        {isApproved ? (
                          <span className="px-2.5 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            सक्रिय (Active)
                          </span>
                        ) : isSuspended ? (
                          <span className="px-2.5 py-0.5 bg-rose-950/80 text-rose-400 border border-rose-800 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            निलम्बित (Suspended)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-amber-950/80 text-amber-400 border border-amber-800 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            पेन्डिङ (Pending)
                          </span>
                        )}
                      </td>

                      {/* Super Admin Action Buttons */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Renew Button */}
                          <button
                            onClick={() => handleQuickRenew(m)}
                            className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 transition-colors cursor-pointer"
                            title="१ वर्ष नवीकरण गर्नुहोस्"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => openEditModal(m)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-[11px] transition-colors cursor-pointer"
                            title="सम्पादन गर्नुहोस्"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>सम्पादन</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeletingMember(m)}
                            className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 transition-colors cursor-pointer"
                            title="हटाउनुहोस् (Delete)"
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

      {/* ====================================================================== */}
      {/* ✏️ EDIT MODAL (सम्पादन विन्डो)                                         */}
      {/* ====================================================================== */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-stone-100 font-serif">
                  विशेषज्ञ सदस्यता सम्पादन (Edit)
                </h3>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-300 font-bold mb-1">विशेषज्ञको पूरा नाम *</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">पद / उपाधि</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">सम्पर्क फोन</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">सदस्यता प्रकार (Membership Plan)</label>
                <input
                  type="text"
                  value={editPlanName}
                  onChange={(e) => setEditPlanName(e.target.value)}
                  placeholder="उदा: वार्षिक प्रिमियम सदस्यता"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">सुरु मिति (Start Date BS)</label>
                  <input
                    type="text"
                    value={editStartDateBS}
                    onChange={(e) => setEditStartDateBS(e.target.value)}
                    placeholder="२०८१ वैशाख ०१"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">म्याद सकिने मिति (Expiry Date BS)</label>
                  <input
                    type="text"
                    value={editExpiryDateBS}
                    onChange={(e) => setEditExpiryDateBS(e.target.value)}
                    placeholder="२०८२ चैत्र ३०"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">सदस्यता अवस्था (Status)</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                >
                  <option value="approved">सक्रिय (Approved / Active)</option>
                  <option value="suspended">निलम्बित (Suspended)</option>
                  <option value="pending">प्रतीक्षामा (Pending)</option>
                  <option value="rejected">अस्वीकृत (Rejected)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-bold cursor-pointer"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black rounded-xl shadow-lg cursor-pointer"
                >
                  परिवर्तन सुरक्षित गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 🗑️ DELETE CONFIRMATION MODAL                                          */}
      {/* ====================================================================== */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-rose-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 mx-auto flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-rose-300">
                सदस्यता रेकर्ड मेटाउने पुष्टि?
              </h3>
              <p className="text-xs text-stone-400">
                के तपाईं साच्चिकै <strong className="text-stone-100">{deletingMember.fullName}</strong> को सदस्यता विवरण प्रणालीबाट स्थायी रूपमा हटाउन चाहनुहुन्छ? यो कार्य पुनः फर्काउन सकिने छैन।
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingMember(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs shadow-lg cursor-pointer"
              >
                हो, मेटाउनुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* ➕ ADD NEW MEMBERSHIP MODAL                                            */}
      {/* ====================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-stone-100 font-serif">
                  नयाँ विशेषज्ञ सदस्यता दर्ता
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewMembership} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-300 font-bold mb-1">विशेषज्ञको पूरा नाम *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा: पं. हरिहर प्रसाद शास्त्री"
                  value={addFullName}
                  onChange={(e) => setAddFullName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">भूमिका (Role)</label>
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                  >
                    <option value="astrologer">ज्योतिषी (Astrologer)</option>
                    <option value="purohit">पुरोहित (Purohit)</option>
                    <option value="vastu">वास्तुविद् (Vastu Expert)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">पद / उपाधि</label>
                  <input
                    type="text"
                    value={addTitle}
                    onChange={(e) => setAddTitle(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">सम्पर्क फोन</label>
                  <input
                    type="text"
                    placeholder="९८xxxxxxxx"
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">सदस्यता योजना</label>
                  <input
                    type="text"
                    value={addPlanName}
                    onChange={(e) => setAddPlanName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">सुरु मिति (BS)</label>
                  <input
                    type="text"
                    value={addStartDateBS}
                    onChange={(e) => setAddStartDateBS(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">म्याद सकिने मिति (BS)</label>
                  <input
                    type="text"
                    value={addExpiryDateBS}
                    onChange={(e) => setAddExpiryDateBS(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-bold cursor-pointer"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black rounded-xl shadow-lg cursor-pointer"
                >
                  दर्ता गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
