import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  BookOpen,
  Building2,
  CheckCircle2,
  XCircle,
  Search,
  Eye,
  Phone,
  MapPin,
  ShieldAlert,
  Edit2,
  Trash2,
  X,
  Check
} from 'lucide-react';
import { OfficialMemberProfile, editOfficialMember, deleteOfficialMember } from '../../../db/officialMemberStore';

interface AdminExpertSectionProps {
  members: OfficialMemberProfile[];
  onUpdateStatus: (memberId: string, status: 'active' | 'pending' | 'rejected' | 'suspended') => void;
  onRefresh: () => void;
}

export const AdminExpertSection: React.FC<AdminExpertSectionProps> = ({
  members,
  onUpdateStatus,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'astrologer' | 'purohit' | 'vastu'>('astrologer');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<OfficialMemberProfile | null>(null);
  const [rejectionModalMember, setRejectionModalMember] = useState<OfficialMemberProfile | null>(null);
  const [customRejectionReason, setCustomRejectionReason] = useState('');

  // Edit & Delete State
  const [editingMember, setEditingMember] = useState<OfficialMemberProfile | null>(null);
  const [deletingMember, setDeletingMember] = useState<OfficialMemberProfile | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editExperienceYears, setEditExperienceYears] = useState(1);
  const [editBio, setEditBio] = useState('');
  const [editStatus, setEditStatus] = useState<string>('approved');

  const openEditModal = (m: OfficialMemberProfile) => {
    setEditingMember(m);
    setEditFullName(m.fullName || '');
    setEditTitle(m.title || '');
    setEditPhone(m.contactPhone || '');
    setEditDistrict(m.district || m.permanentAddress?.district || 'काठमाडौं');
    setEditExperienceYears(m.experienceYears || 1);
    setEditBio(m.bio || '');
    setEditStatus(m.status || 'approved');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    editOfficialMember(editingMember.id, {
      fullName: editFullName.trim(),
      title: editTitle.trim(),
      contactPhone: editPhone.trim(),
      district: editDistrict.trim(),
      experienceYears: Number(editExperienceYears) || 1,
      bio: editBio.trim(),
      status: editStatus as any,
    });

    setEditingMember(null);
    onRefresh();
  };

  const handleConfirmDelete = () => {
    if (!deletingMember) return;
    deleteOfficialMember(deletingMember.id);
    setDeletingMember(null);
    onRefresh();
  };

  const pendingCount = members.filter(m => m.status === 'pending' || m.status === 'under_review' || m.approvalStatus === 'Pending').length;

  const filteredMembers = members.filter(m => {
    const matchesRole = m.role === activeTab || (activeTab === 'astrologer' && (m.role === 'both' || m.role === 'all'));

    const memberDistrict = m.district || m.permanentAddress?.district || '';
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.contactPhone && m.contactPhone.includes(searchQuery)) ||
      (memberDistrict && memberDistrict.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || m.status === statusFilter || (statusFilter === 'approved' && m.approvalStatus === 'Approved') || (statusFilter === 'rejected' && m.approvalStatus === 'Rejected');

    return matchesRole && matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>आधिकारिक विशेषज्ञ व्यवस्थापन (Official Experts Directory)</span>
            </h2>
            {pendingCount > 0 && (
              <span className="bg-red-600 text-white font-bold text-xs px-2.5 py-0.5 rounded-full animate-pulse shadow">
                {pendingCount} स्वीकृतिका लागि बाँकी
              </span>
            )}
          </div>
          <p className="text-xs text-stone-400 mt-1">
            प्रणालीमा दर्ता भएका ज्योतिषी, पुरोहित र वास्तुविद्हरूको प्रोफाइल, कागजात, सहमतिपत्र र स्वीकृति नियन्त्रण।
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab('astrologer')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'astrologer'
              ? 'bg-amber-500 text-stone-950 font-extrabold shadow-md'
              : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>आधिकारिक ज्योतिषी ({members.filter(m => m.role === 'astrologer' || m.role === 'both' || m.role === 'all').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('purohit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'purohit'
              ? 'bg-amber-500 text-stone-950 font-extrabold shadow-md'
              : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>आधिकारिक पुरोहित ({members.filter(m => m.role === 'purohit').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vastu')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'vastu'
              ? 'bg-amber-500 text-stone-950 font-extrabold shadow-md'
              : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>वास्तुविद् ({members.filter(m => m.role === 'vastu').length})</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
          <input
            type="text"
            placeholder="विशेषज्ञको नाम, फोन वा ठेगानाबाट खोज्नुहोस्..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-900 border border-stone-800 text-stone-100 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-amber-500 placeholder:text-stone-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-stone-900 border border-stone-800 text-stone-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">सबै स्थिति (All Status)</option>
            <option value="approved">स्वीकृत (Approved / Active)</option>
            <option value="pending">स्वीकृति बाँकी (Pending)</option>
            <option value="rejected">अस्वीकृत (Rejected)</option>
            <option value="suspended">निलम्बित (Suspended)</option>
          </select>
        </div>
      </div>

      {/* Experts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.length === 0 ? (
          <div className="col-span-full bg-stone-900 border border-stone-800 rounded-2xl p-8 text-center text-stone-500 italic">
            कुनै विशेषज्ञ भेटिएन।
          </div>
        ) : (
          filteredMembers.map(m => (
            <div key={m.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3 shadow-md flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={m.photoUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200'}
                      alt={m.fullName}
                      className="w-12 h-12 rounded-xl object-cover border border-amber-500/40"
                    />
                    <div>
                      <h3 className="font-bold text-stone-100 text-sm">{m.fullName}</h3>
                      <p className="text-xs text-amber-400 font-serif">{m.title}</p>
                      {m.applicationNumber && (
                        <p className="text-[10px] text-stone-500 font-mono">{m.applicationNumber}</p>
                      )}
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    m.status === 'approved' || m.approvalStatus === 'Approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    m.status === 'pending' || m.status === 'under_review' || m.approvalStatus === 'Pending' ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse' :
                    'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {m.approvalStatus || m.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-stone-400 pt-1">
                  <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-stone-500" /> {m.contactPhone || '८८८८८८८८'}</p>
                  <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-stone-500" /> {m.district || m.permanentAddress?.district || 'काठमाडौं'}, नेपाल</p>
                  {m.rejectionReason && (
                    <p className="text-[11px] text-rose-400 bg-rose-950/40 p-1.5 rounded-lg border border-rose-900/50">
                      <strong>अस्वीकार कारण:</strong> {m.rejectionReason}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-stone-800/80">
                <button
                  onClick={() => setSelectedMember(m)}
                  className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>विवरण</span>
                </button>

                <button
                  onClick={() => openEditModal(m)}
                  className="py-1.5 px-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  title="सम्पादन गर्नुहोस्"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>सम्पादन</span>
                </button>

                <button
                  onClick={() => setDeletingMember(m)}
                  className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  title="हटाउनुहोस् (Delete)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {(m.status === 'pending' || m.status === 'under_review' || m.approvalStatus === 'Pending') && (
                  <>
                    <button
                      onClick={() => onUpdateStatus(m.id, 'active')}
                      className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-colors cursor-pointer"
                    >
                      स्वीकृत
                    </button>
                    <button
                      onClick={() => setRejectionModalMember(m)}
                      className="py-1.5 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow transition-colors cursor-pointer"
                    >
                      अस्वीकृत
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl text-stone-200">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-bold text-stone-100">विशेषज्ञ आवेदन तथा कागजात विवरण</h3>
              <button onClick={() => setSelectedMember(null)} className="text-stone-400 hover:text-white text-lg">×</button>
            </div>

            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2 text-xs">
              <p><strong className="text-stone-400">नाम:</strong> <span className="text-stone-100 font-bold">{selectedMember.fullName} ({selectedMember.title})</span></p>
              <p><strong className="text-stone-400">आवेदन नं:</strong> <span className="text-amber-400 font-mono font-bold">{selectedMember.applicationNumber}</span></p>
              <p><strong className="text-stone-400">सम्पर्क:</strong> <span className="text-stone-200">{selectedMember.contactPhone}</span></p>
              <p><strong className="text-stone-400">ठेगाना:</strong> <span className="text-stone-200">{selectedMember.district || selectedMember.permanentAddress?.district || 'काठमाडौं'}</span></p>
              <p><strong className="text-stone-400">विशेषज्ञता:</strong> <span className="text-amber-300 font-bold">{(selectedMember.expertise || []).join(', ')}</span></p>
              <p><strong className="text-stone-400">स्वीकृति स्थिति:</strong> <span className="text-emerald-400 font-bold">{selectedMember.approvalStatus || selectedMember.status}</span></p>
              {selectedMember.rejectionReason && (
                <p className="text-rose-400"><strong>अस्वीकार कारण:</strong> {selectedMember.rejectionReason}</p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onUpdateStatus(selectedMember.id, 'active');
                  setSelectedMember(null);
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
              >
                स्वीकृत (Approve)
              </button>
              <button
                onClick={() => {
                  setRejectionModalMember(selectedMember);
                  setSelectedMember(null);
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
              >
                अस्वीकृत (Reject)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectionModalMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-stone-200">
            <h3 className="font-bold text-stone-100">प्रोफाइल अस्वीकृत गर्ने कारण</h3>
            <p className="text-xs text-stone-400">
              विशेषज्ञ {rejectionModalMember.fullName} को आवेदन अस्वीकृत गर्दा प्रयोगकर्तालाई कारणसहितको सूचना पठाइनेछ।
            </p>
            <textarea
              rows={3}
              value={customRejectionReason}
              onChange={(e) => setCustomRejectionReason(e.target.value)}
              placeholder="मापदण्ड अनुसार कागजात तथा अध्ययन प्रमाण अपूर्ण रहेको..."
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-100 focus:outline-none focus:border-rose-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onUpdateStatus(rejectionModalMember.id, 'rejected');
                  setRejectionModalMember(null);
                  setCustomRejectionReason('');
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
              >
                अस्वीकृत पुष्टि गर्नुहोस्
              </button>
              <button onClick={() => setRejectionModalMember(null)} className="py-2 px-4 bg-stone-800 text-stone-300 font-bold text-xs rounded-xl">
                रद्द
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EXPERT MODAL */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-stone-100 font-serif">
                  विशेषज्ञ प्रोफाइल सम्पादन (Edit Expert)
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-bold mb-1">जिल्ला / ठेगाना</label>
                  <input
                    type="text"
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-bold mb-1">अनुभव (वर्ष)</label>
                  <input
                    type="number"
                    min={1}
                    value={editExperienceYears}
                    onChange={(e) => setEditExperienceYears(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">स्थिति (Status)</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                >
                  <option value="approved">सक्रिय / स्वीकृत (Approved)</option>
                  <option value="pending">प्रतीक्षामा (Pending)</option>
                  <option value="suspended">निलम्बित (Suspended)</option>
                  <option value="rejected">अस्वीकृत (Rejected)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">संक्षिप्त परिचय (Bio)</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500 resize-none"
                />
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

      {/* DELETE EXPERT MODAL */}
      {deletingMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-rose-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 mx-auto flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-rose-300">
                विशेषज्ञ प्रोफाइल मेटाउने पुष्टि?
              </h3>
              <p className="text-xs text-stone-400">
                के तपाईं साच्चिकै <strong className="text-stone-100">{deletingMember.fullName}</strong> लाई प्रणालीबाट स्थायी रूपमा हटाउन चाहनुहुन्छ? यो कार्य पुनः फर्काउन सकिने छैन।
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
    </div>
  );
};
