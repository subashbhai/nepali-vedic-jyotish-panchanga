import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  ShieldCheck,
  Clock,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  Edit3,
  Search,
  RefreshCw,
  Phone,
  Mail,
  Award,
  Lock,
  UserX,
  Sparkles,
  ChevronDown,
  Building2,
  FileText,
  Layers,
  Info
} from 'lucide-react';
import {
  OfficialMemberProfile,
  OfficialMemberStatus,
  MemberRoleType
} from '../types/astrology';
import {
  getStoredOfficialMembers,
  registerOfficialMember,
  adminUpdateMemberStatus,
  adminToggleMemberVerification,
  memberSelfUpdateProfile,
  reapplyOfficialMember
} from '../db/officialMemberStore';

interface OfficialMemberManagementProps {
  onMembersUpdated?: () => void;
  initialSubTab?: 'admin' | 'register' | 'self_service';
}

export const OfficialMemberManagement: React.FC<OfficialMemberManagementProps> = ({
  onMembersUpdated,
  initialSubTab = 'admin'
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'register' | 'self_service'>(initialSubTab);
  
  // Data State
  const [members, setMembers] = useState<OfficialMemberProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Admin Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Modal / Action State
  const [rejectionModalMember, setRejectionModalMember] = useState<OfficialMemberProfile | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Registration Form State
  const [regFullName, setRegFullName] = useState('');
  const [regTitle, setRegTitle] = useState('');
  const [regRole, setRegRole] = useState<MemberRoleType>('astrologer');
  const [regExpertise, setRegExpertise] = useState('');
  const [regContactPhone, setRegContactPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regExperience, setRegExperience] = useState<number>(10);
  const [regPhotoUrl, setRegPhotoUrl] = useState('');
  const [regBio, setRegBio] = useState('');
  const [regFee, setRegFee] = useState<number>(1000);
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);

  // Self Service Selected Member
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [editFullName, setEditFullName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const [editExpertise, setEditExpertise] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvailable, setEditAvailable] = useState<boolean>(true);
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);

  // Fetch Members on Mount
  const loadMembers = () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // Simulate real DB load delay safely
      setTimeout(() => {
        try {
          const loaded = getStoredOfficialMembers();
          setMembers(loaded);
          setIsLoading(false);
          if (loaded.length > 0 && !selectedMemberId) {
            setSelectedMemberId(loaded[0].id);
          }
        } catch (err) {
          setErrorMessage('आधिकारिक सदस्यहरूको विवरण प्राप्त गर्न सकिएन। कृपया पुनः प्रयास गर्नुहोस्।');
          setIsLoading(false);
        }
      }, 300);
    } catch (e) {
      setErrorMessage('आधिकारिक सदस्यहरूको विवरण प्राप्त गर्न सकिएन। कृपया पुनः प्रयास गर्नुहोस्।');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  // Sync edit form when selectedMemberId changes
  useEffect(() => {
    if (!selectedMemberId) return;
    const found = members.find((m) => m.id === selectedMemberId);
    if (found) {
      setEditFullName(found.fullName);
      setEditTitle(found.title);
      setEditPhotoUrl(found.photoUrl || '');
      setEditExpertise(found.expertise ? found.expertise.join(', ') : '');
      setEditContactPhone(found.contactPhone);
      setEditEmail(found.email || '');
      setEditBio(found.bio || '');
      setEditAvailable(found.isAvailable);
      setEditSuccessMsg(null);
    }
  }, [selectedMemberId, members]);

  // Handle Admin Status Update
  const handleStatusChange = (id: string, status: OfficialMemberStatus, reason?: string) => {
    const updated = adminUpdateMemberStatus(id, status, reason);
    if (updated) {
      loadMembers();
      if (onMembersUpdated) onMembersUpdated();
    }
  };

  // Handle Admin Toggle Verification
  const handleToggleVerification = (id: string, currentVerified: boolean) => {
    const updated = adminToggleMemberVerification(id, !currentVerified);
    if (updated) {
      loadMembers();
      if (onMembersUpdated) onMembersUpdated();
    }
  };

  // Handle Submit Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName || !regContactPhone) return;

    const expertiseList = regExpertise
      ? regExpertise.split(',').map((s) => s.trim()).filter(Boolean)
      : ['वैदिक ज्योतिष'];

    registerOfficialMember({
      fullName: regFullName,
      title: regTitle || (regRole === 'purohit' ? 'कर्मकाण्ड पुरोहित' : 'ज्योतिषाचार्य'),
      role: regRole,
      photoUrl: regPhotoUrl,
      expertise: expertiseList,
      contactPhone: regContactPhone,
      email: regEmail,
      experienceYears: Number(regExperience) || 5,
      bio: regBio,
      consultationFee: Number(regFee) || 1000,
    });

    setRegSuccessMessage('तपाईंको दर्ता आवेदन सफलतापूर्वक दर्ता भयो। प्रशासकीय स्वीकृतिपछि मात्र सार्वजनिक आधिकारिक सूचीमा देखिनेछ।');
    
    // Reset Form
    setRegFullName('');
    setRegTitle('');
    setRegExpertise('');
    setRegContactPhone('');
    setRegEmail('');
    setRegPhotoUrl('');
    setRegBio('');

    loadMembers();
    if (onMembersUpdated) onMembersUpdated();
  };

  // Handle Self Service Profile Update
  const handleSelfUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    const current = members.find((m) => m.id === selectedMemberId);
    if (!current) return;

    const expertiseList = editExpertise
      ? editExpertise.split(',').map((s) => s.trim()).filter(Boolean)
      : current.expertise;

    if (current.status === 'rejected') {
      // Re-apply
      reapplyOfficialMember(selectedMemberId, {
        fullName: editFullName,
        title: editTitle,
        role: current.role,
        photoUrl: editPhotoUrl,
        expertise: expertiseList,
        contactPhone: editContactPhone,
        email: editEmail,
        experienceYears: current.experienceYears,
        bio: editBio,
      });
      setEditSuccessMsg('सुधारिएको विवरण सहित पुनःआवेदन पेस भयो। प्रशासकीय स्वीकृतिको प्रतीक्षामा राखिएको छ।');
    } else {
      // Normal self update
      memberSelfUpdateProfile(selectedMemberId, {
        fullName: editFullName,
        title: editTitle,
        photoUrl: editPhotoUrl,
        expertise: expertiseList,
        contactPhone: editContactPhone,
        email: editEmail,
        bio: editBio,
        isAvailable: editAvailable,
      });
      setEditSuccessMsg('तपाईंको सार्वजनिक प्रोफाइल विवरण सफलतापूर्वक अद्यावधिक भयो।');
    }

    loadMembers();
    if (onMembersUpdated) onMembersUpdated();
  };

  // Filtered members for Admin View
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.contactPhone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchesRole =
      roleFilter === 'all' ||
      m.role === roleFilter ||
      (m.role === 'both' && (roleFilter === 'astrologer' || roleFilter === 'purohit'));

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Count stats
  const pendingCount = members.filter((m) => m.status === 'pending').length;
  const approvedCount = members.filter((m) => m.status === 'approved').length;
  const rejectedCount = members.filter((m) => m.status === 'rejected').length;
  const inactiveCount = members.filter((m) => m.status === 'inactive' || m.status === 'suspended').length;

  return (
    <div className="space-y-6">
      
      {/* HEADER & SUB-NAVIGATION */}
      <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100 dark:border-stone-800 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
              <span>आधिकारिक सदस्य प्रणाली तथा नियन्त्रण कक्ष</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
              ज्योतिषाचार्य तथा कर्मकाण्ड पुरोहितहरूको आवेदन व्यवस्थापन, प्रशासकीय स्वीकृति, प्रोफाइल र प्रमाणीकरण।
            </p>
          </div>

          <button
            onClick={loadMembers}
            className="px-3 py-1.5 bg-amber-50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 text-amber-900 dark:text-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-amber-100 dark:hover:bg-stone-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>ताजा गर्नुहोस्</span>
          </button>
        </div>

        {/* TAB BUTTONS */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-red-800 text-white shadow-sm ring-2 ring-red-800/20'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-100/60'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>प्रशासकीय नियन्त्रण कक्ष</span>
            {pendingCount > 0 && (
              <span className="bg-amber-400 text-stone-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {pendingCount} नयाँ
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-red-800 text-white shadow-sm ring-2 ring-red-800/20'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-100/60'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>नयाँ सदस्य दर्ता / आवेदन</span>
          </button>

          <button
            onClick={() => setActiveTab('self_service')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'self_service'
                ? 'bg-red-800 text-white shadow-sm ring-2 ring-red-800/20'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-100/60'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>सदस्य व्यक्तिगत प्रोफाइल अद्यावधिक</span>
          </button>
        </div>
      </div>

      {/* RULE 18: LOADING STATE */}
      {isLoading && (
        <div className="p-8 bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-2xl text-center space-y-3 shadow-xs">
          <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
            विवरण प्राप्त हुँदैछ...
          </p>
          <p className="text-xs text-stone-500">
            डाटाबेसबाट आधिकारिक सदस्यहरूको सूची लोड भइरहेको छ।
          </p>
        </div>
      )}

      {/* RULE 19: ERROR STATE */}
      {errorMessage && !isLoading && (
        <div className="p-5 bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-800 dark:text-red-300">
                {errorMessage}
              </p>
              <p className="text-xs text-red-600/80 dark:text-red-400 mt-0.5">
                इन्टरनेट वा भण्डारण जडानमा समस्या हुन सक्छ।
              </p>
            </div>
          </div>
          <button
            onClick={loadMembers}
            className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer"
          >
            पुनः प्रयास गर्नुहोस्
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: ADMINISTRATOR CONTROL PANEL */}
      {/* ========================================================= */}
      {!isLoading && !errorMessage && activeTab === 'admin' && (
        <div className="space-y-6">
          
          {/* STATS OVERVIEW CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-amber-200 dark:border-stone-800 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-stone-500">स्वीकृत सदस्यहरू</span>
              <p className="text-xl font-bold font-serif text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                <span>{approvedCount} जना</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-500/40" />
              </p>
            </div>

            <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-amber-200 dark:border-stone-800 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-stone-500">प्रतीक्षामा (Pending)</span>
              <p className="text-xl font-bold font-serif text-amber-600 dark:text-amber-400 flex items-center justify-between">
                <span>{pendingCount} जना</span>
                <Clock className="w-5 h-5 text-amber-500/40" />
              </p>
            </div>

            <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-amber-200 dark:border-stone-800 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-stone-500">अस्वीकृत आवेदन</span>
              <p className="text-xl font-bold font-serif text-rose-600 dark:text-rose-400 flex items-center justify-between">
                <span>{rejectedCount} जना</span>
                <XCircle className="w-5 h-5 text-rose-500/40" />
              </p>
            </div>

            <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-amber-200 dark:border-stone-800 shadow-xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-stone-500">निष्क्रिय / निलम्बित</span>
              <p className="text-xl font-bold font-serif text-stone-500 flex items-center justify-between">
                <span>{inactiveCount} जना</span>
                <UserX className="w-5 h-5 text-stone-400" />
              </p>
            </div>
          </div>

          {/* SEARCH & FILTERS BAR */}
          <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-amber-200 dark:border-stone-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="नाम, पद वा फोन नम्बरबाट खोज्नुहोस्..."
                className="w-full bg-amber-50/50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-amber-50/50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-none"
              >
                <option value="all">सबै अवस्था (All Status)</option>
                <option value="approved">स्वीकृत (Approved)</option>
                <option value="pending">प्रशासकीय स्वीकृतिको प्रतीक्षामा (Pending)</option>
                <option value="rejected">अस्वीकृत (Rejected)</option>
                <option value="inactive">निष्क्रिय (Inactive)</option>
                <option value="suspended">निलम्बित (Suspended)</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-amber-50/50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-none"
              >
                <option value="all">सबै सेवा भूमिका</option>
                <option value="astrologer">ज्योतिषाचार्य</option>
                <option value="purohit">कर्मकाण्ड पुरोहित</option>
                <option value="both">दुवै अधिकार भएका</option>
              </select>
            </div>
          </div>

          {/* MEMBER LISTING TABLE / CARDS */}
          <div className="space-y-3">
            {filteredMembers.length === 0 ? (
              <div className="p-8 bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-2xl text-center space-y-2 text-stone-500">
                <Info className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
                  खोजिएको मापदण्डमा कुनै सदस्य फेला परेन।
                </p>
                <p className="text-xs">कृपया फिल्टर परिवर्तन गरेर हेर्नुहोस्।</p>
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-400 transition-colors"
                >
                  {/* MEMBER DETAILS */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-14 h-16 bg-stone-100 dark:bg-stone-800 rounded-xl overflow-hidden shrink-0 border border-amber-300 dark:border-stone-700 relative">
                      {member.photoUrl ? (
                        <img src={member.photoUrl} alt={member.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-stone-400">
                          ॐ
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                          {member.fullName}
                        </h3>

                        {/* STATUS BADGES */}
                        {member.status === 'approved' && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            स्वीकृत
                          </span>
                        )}

                        {member.status === 'pending' && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-900 dark:text-amber-200 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-600" />
                            प्रशासकीय स्वीकृतिको प्रतीक्षामा
                          </span>
                        )}

                        {member.status === 'rejected' && (
                          <span className="text-[10px] bg-rose-500/10 text-rose-700 dark:text-rose-300 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            अस्वीकृत
                          </span>
                        )}

                        {member.status === 'inactive' && (
                          <span className="text-[10px] bg-stone-200 text-stone-700 font-extrabold px-2 py-0.5 rounded-full">
                            निष्क्रिय
                          </span>
                        )}

                        {member.status === 'suspended' && (
                          <span className="text-[10px] bg-red-900 text-white font-extrabold px-2 py-0.5 rounded-full">
                            निलम्बित
                          </span>
                        )}

                        {/* VERIFIED BADGE */}
                        {member.isVerified ? (
                          <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            प्रमाणित (Verified)
                          </span>
                        ) : (
                          <span className="text-[10px] bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400 font-semibold px-2 py-0.5 rounded-full">
                            अप्रमाणित
                          </span>
                        )}

                        {/* RULE 22: PRE-EXISTING MEMBER BADGE */}
                        {member.isPreExisting && (
                          <span className="text-[10px] bg-blue-500/10 text-blue-800 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full">
                            पहिले नै स्वीकृत
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                        {member.title} | {member.role === 'both' ? 'ज्योतिषाचार्य तथा कर्मकाण्ड पुरोहित' : member.role === 'purohit' ? 'कर्मकाण्ड पुरोहित' : 'ज्योतिषाचार्य'}
                      </p>

                      <p className="text-xs text-stone-600 dark:text-stone-400">
                        विशेषज्ञता: {member.expertise ? member.expertise.join(', ') : 'वैदिक ज्योतिष'} ({member.experienceYears} वर्ष अनुभव)
                      </p>

                      <div className="flex items-center gap-4 text-xs text-stone-500 pt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 font-bold text-stone-700 dark:text-stone-300">
                          <Phone className="w-3 h-3 text-amber-600" />
                          {member.contactPhone}
                        </span>
                        {member.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-stone-400" />
                            {member.email}
                          </span>
                        )}
                        <span>दर्ता मिति: {member.registrationDateBS}</span>
                      </div>

                      {/* RULE 13: REJECTION REASON DISPLAY */}
                      {member.status === 'rejected' && member.rejectionReason && (
                        <div className="mt-2 p-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-800 dark:text-rose-300 space-y-1">
                          <p className="font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>अस्वीकृतिको कारण:</span>
                          </p>
                          <p>{member.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ADMIN CONTROL ACTIONS */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-amber-100 dark:border-stone-800">
                    
                    {/* APPROVE BUTTON */}
                    {member.status !== 'approved' && (
                      <button
                        onClick={() => handleStatusChange(member.id, 'approved')}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>स्वीकृत गर्नुहोस्</span>
                      </button>
                    )}

                    {/* REJECT BUTTON */}
                    {member.status !== 'rejected' && (
                      <button
                        onClick={() => {
                          setRejectionModalMember(member);
                          setRejectionReasonInput('');
                        }}
                        className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-900 dark:bg-rose-900/40 dark:text-rose-200 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>अस्वीकृत गर्नुहोस्</span>
                      </button>
                    )}

                    {/* TOGGLE VERIFIED BUTTON (ADMIN ONLY - RULE 10) */}
                    <button
                      onClick={() => handleToggleVerification(member.id, member.isVerified)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer border ${
                        member.isVerified
                          ? 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200'
                          : 'bg-stone-100 border-stone-300 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      <span>{member.isVerified ? 'प्रमाणित हटाउनुहोस्' : 'प्रमाणित गर्नुहोस्'}</span>
                    </button>

                    {/* DEACTIVATE / SUSPEND DROPDOWN */}
                    <select
                      value={member.status}
                      onChange={(e) => handleStatusChange(member.id, e.target.value as OfficialMemberStatus)}
                      className="bg-amber-50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold rounded-xl px-2.5 py-1.5 cursor-pointer focus:outline-none"
                    >
                      <option value="approved">स्वीकृत (Approved)</option>
                      <option value="pending">प्रतीक्षामा (Pending)</option>
                      <option value="inactive">निष्क्रिय (Inactive)</option>
                      <option value="suspended">निलम्बित (Suspended)</option>
                      <option value="rejected">अस्वीकृत (Rejected)</option>
                    </select>

                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectionModalMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-amber-100 dark:border-stone-800 pb-3">
              <h3 className="text-base font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>अस्वीकृतिको कारण लेख्नुहोस्</span>
              </h3>
              <button
                onClick={() => setRejectionModalMember(null)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400">
              सदस्य <strong className="text-stone-900 dark:text-stone-100">{rejectionModalMember.fullName}</strong> को आवेदन अस्वीकृत गर्नुको स्पष्ट कारण उल्लेख गर्नुहोस्:
            </p>

            <textarea
              rows={3}
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="उदाहरण: अनुभव प्रमाणपत्र अपूर्ण रहेको वा सम्पर्क नम्बर पुष्टि हुन नसकेको।"
              className="w-full p-3 bg-amber-50/50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectionModalMember(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                onClick={() => {
                  handleStatusChange(rejectionModalMember.id, 'rejected', rejectionReasonInput);
                  setRejectionModalMember(null);
                }}
                className="px-4 py-2 bg-rose-800 hover:bg-rose-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                अस्वीकृत पेस गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: NEW MEMBER REGISTRATION FORM */}
      {/* ========================================================= */}
      {!isLoading && !errorMessage && activeTab === 'register' && (
        <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="border-b border-amber-100 dark:border-stone-800 pb-3">
            <h3 className="text-base font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-amber-600" />
              <span>आधिकारिक ज्योतिषाचार्य / पुरोहित दर्ता फारम</span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
              नयाँ सदस्य दर्ता गरेपछि अवस्था स्वतः <strong className="text-amber-800 dark:text-amber-300">“प्रशासकीय स्वीकृतिको प्रतीक्षामा”</strong> रहनेछ। प्रशासकले स्वीकृत गरेपछि मात्र सार्वजनिक सूचीमा देखिनेछ।
            </p>
          </div>

          {regSuccessMessage && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                {regSuccessMessage}
              </p>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  पूरा नाम *
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="उदा. आचार्य रामप्रसाद पोखरेल"
                  className="w-full p-2.5 bg-amber-50/50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  पद / उपाधि
                </label>
                <input
                  type="text"
                  value={regTitle}
                  onChange={(e) => setRegTitle(e.target.value)}
                  placeholder="उदा. वरिष्ठ ज्योतिषाचार्य / वेदमूर्ति पुरोहित"
                  className="w-full p-2.5 bg-amber-50/50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  सेवा भूमिका *
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as MemberRoleType)}
                  className="w-full p-2.5 bg-amber-50/50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="astrologer">आधिकारिक ज्योतिषाचार्य (Astrologer)</option>
                  <option value="purohit">आधिकारिक कर्मकाण्ड पुरोहित (Purohit)</option>
                  <option value="both">दुवै अधिकार (Astrologer & Purohit)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  सम्पर्क नम्बर *
                </label>
                <input
                  type="text"
                  required
                  value={regContactPhone}
                  onChange={(e) => setRegContactPhone(e.target.value)}
                  placeholder="+९७७-९८XXXXXXXX"
                  className="w-full p-2.5 bg-amber-50/50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  विशेषज्ञता (अल्पविरामले छुट्याउनुहोस्)
                </label>
                <input
                  type="text"
                  value={regExpertise}
                  onChange={(e) => setRegExpertise(e.target.value)}
                  placeholder="उदा. जन्मकुण्डली, विवाह मिलान, रुद्री पाठ, महायज्ञ"
                  className="w-full p-2.5 bg-amber-50/50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  इमेल ठेगाना
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="example@sukdev.np"
                  className="w-full p-2.5 bg-amber-50/50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  अनुभव वर्ष
                </label>
                <input
                  type="number"
                  value={regExperience}
                  onChange={(e) => setRegExperience(Number(e.target.value))}
                  placeholder="१०"
                  className="w-full p-2.5 bg-amber-50/50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  फोटो URL
                </label>
                <input
                  type="text"
                  value={regPhotoUrl}
                  onChange={(e) => setRegPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-amber-50/50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                आत्मविवरण / संक्षिप्त परिचय
              </label>
              <textarea
                rows={3}
                value={regBio}
                onChange={(e) => setRegBio(e.target.value)}
                placeholder="शास्त्रज्ञान, संस्कृत अध्ययन तथा ज्योतिषीय सेवा अनुभवको संक्षिप्त विवरण।"
                className="w-full p-2.5 bg-amber-50/50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="p-3 bg-amber-50 dark:bg-stone-800/80 border border-amber-200 dark:border-stone-700 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                दर्ता भएपछि तपाईंको अवस्था <strong>“प्रशासकीय स्वीकृतिको प्रतीक्षामा”</strong> हुनेछ। प्रशासकले रुजु गरेपछि मात्र तपाईंको नाम आधिकारिक ज्योतिषाचार्य वा पुरोहित सूचीमा देखिनेछ।
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-red-800 hover:bg-red-900 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              सदस्य दर्ता आवेदन पेस गर्नुहोस्
            </button>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: MEMBER SELF-SERVICE PORTAL */}
      {/* ========================================================= */}
      {!isLoading && !errorMessage && activeTab === 'self_service' && (
        <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
          <div className="border-b border-amber-100 dark:border-stone-800 pb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                <span>सदस्य व्यक्तिगत प्रोफाइल अद्यावधिक पोर्टल</span>
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                फोटो, विशेषज्ञता, सम्पर्क विवरण र उपलब्धता स्थिति अद्यावधिक गर्नुहोस्। (प्रमाणित अवस्था प्रशासकले मात्र नियन्त्रण गर्दछ)।
              </p>
            </div>

            {/* SELECT MEMBER */}
            <div className="min-w-[200px]">
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full bg-amber-50/50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.title})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {editSuccessMsg && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                {editSuccessMsg}
              </p>
            </div>
          )}

          {/* REJECTED NOTICE & RE-APPLICATION PROMPT */}
          {members.find((m) => m.id === selectedMemberId)?.status === 'rejected' && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 rounded-2xl space-y-2">
              <p className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>तपाईंको दर्ता आवेदन प्रशासकबाट अस्वीकृत भएको छ।</span>
              </p>
              <p className="text-xs text-rose-700 dark:text-rose-300 font-semibold">
                अस्वीकृतिको कारण: {members.find((m) => m.id === selectedMemberId)?.rejectionReason}
              </p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400">
                कृपया मुनिको फारममा आवश्यक सुधार गरी <strong>“सुधार गरी पुनःआवेदन पेस गर्नुहोस्”</strong> बटन थिच्नुहोस्।
              </p>
            </div>
          )}

          <form onSubmit={handleSelfUpdateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  पूरा नाम
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full p-2.5 bg-amber-50/50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  पद / उपाधि
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 bg-amber-50/50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  सम्पर्क फोन नम्बर (सार्वजनिक देखिने)
                </label>
                <input
                  type="text"
                  required
                  value={editContactPhone}
                  onChange={(e) => setEditContactPhone(e.target.value)}
                  className="w-full p-2.5 bg-amber-50/50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  इमेल ठेगाना
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-2.5 bg-amber-50/50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  विशेषज्ञता (अल्पविरामले छुट्याउनुहोस्)
                </label>
                <input
                  type="text"
                  value={editExpertise}
                  onChange={(e) => setEditExpertise(e.target.value)}
                  className="w-full p-2.5 bg-amber-50/50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  फोटो URL
                </label>
                <input
                  type="text"
                  value={editPhotoUrl}
                  onChange={(e) => setEditPhotoUrl(e.target.value)}
                  className="w-full p-2.5 bg-amber-50/50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                आत्मविवरण / परिचय
              </label>
              <textarea
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full p-2.5 bg-amber-50/50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* AVAILABILITY TOGGLE */}
            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-stone-800 rounded-xl border border-amber-200 dark:border-stone-700">
              <div>
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  उपलब्धता स्थिति (Availability)
                </p>
                <p className="text-[11px] text-stone-500">
                  सार्वजनिक सूचीमा “उपलब्ध” वा “व्यस्त” देखाउनुहोस्।
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditAvailable(!editAvailable)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  editAvailable
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 text-white'
                }`}
              >
                {editAvailable ? 'उपलब्ध (Available)' : 'व्यस्त (Busy)'}
              </button>
            </div>

            {/* RULE 9: VERIFIED STATUS IS LOCKED FOR MEMBERS */}
            <div className="p-3 bg-stone-100 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-between opacity-80">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-stone-500" />
                <div>
                  <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    प्रमाणित अवस्था: {members.find((m) => m.id === selectedMemberId)?.isVerified ? 'प्रमाणित (Verified)' : 'अप्रमाणित'}
                  </p>
                  <p className="text-[10px] text-stone-500">
                    प्रमाणित (“प्रमाणित”) अवस्था केवल प्रशासकले मात्र नियन्त्रण गर्दछ।
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-stone-400 bg-stone-200 dark:bg-stone-700 px-2 py-0.5 rounded-md">
                सुरक्षित
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-red-800 hover:bg-red-900 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              {members.find((m) => m.id === selectedMemberId)?.status === 'rejected'
                ? 'सुधार गरी पुनःआवेदन पेस गर्नुहोस्'
                : 'प्रोफाइल विवरण अद्यावधिक गर्नुहोस्'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
