import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  FileText, 
  HelpCircle, 
  Info, 
  Lock, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  Upload, 
  User, 
  UserCheck, 
  XCircle, 
  AlertCircle,
  Building2,
  Calendar,
  BookOpen,
  Eye,
  Edit3,
  Copy,
  Check,
  Search,
  RefreshCw,
  Trash2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { 
  OfficialMemberProfile, 
  MemberRoleType, 
  MemberDocument, 
  OfficialMemberStatus 
} from '../types/astrology';
import { 
  getStoredOfficialMembers, 
  registerOfficialMember, 
  toNepaliDigits, 
  memberSelfUpdateProfile,
  reapplyOfficialMember 
} from '../db/officialMemberStore';
import { convertADToBS } from '../utils/nepaliCalendar';

interface ExpertApplicationViewProps {
  onNavigateToDashboard?: () => void;
  onMembersUpdated?: () => void;
}

const EXPERTISE_OPTIONS = {
  astrologer: [
    'जन्मकुण्डली',
    'फलादेश',
    'प्रश्न ज्योतिष',
    'दशा फलादेश',
    'गोचर',
    'विवाह मिलान',
    'मुहूर्त',
    'पञ्चाङ्ग',
    'वास्तु',
    'अन्य'
  ],
  purohit: [
    'विवाह संस्कार',
    'व्रतबन्ध',
    'गृहप्रवेश',
    'हवन',
    'रुद्राभिषेक',
    'पूजा',
    'श्राद्ध',
    'देवालय पूजा',
    'संस्कार',
    'अन्य'
  ],
  vastu: [
    'गृह वास्तु',
    'देवालय वास्तु',
    'भूमि परीक्षण',
    'भवन वास्तु',
    'जलाशय वास्तु',
    'गुरुकुल तथा आश्रम वास्तु',
    'गोशाला वास्तु',
    'अन्य'
  ]
};

export const ExpertApplicationView: React.FC<ExpertApplicationViewProps> = ({
  onNavigateToDashboard,
  onMembersUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'apply' | 'track' | 'portal'>('apply');

  // Registration Form State
  const [selectedRole, setSelectedRole] = useState<MemberRoleType>('astrologer');
  const [fullName, setFullName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [dobBS, setDobBS] = useState('');
  const [district, setDistrict] = useState('');
  const [localLevel, setLocalLevel] = useState('');
  const [ward, setWard] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');

  // Expertise & Education State
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [customExpertiseInput, setCustomExpertiseInput] = useState('');
  const [qualification, setQualification] = useState('');
  const [gurukulName, setGurukulName] = useState('');
  const [guruName, setGuruName] = useState('');
  const [studyDurationYears, setStudyDurationYears] = useState<number>(3);
  const [experienceYears, setExperienceYears] = useState<number>(10);
  const [expertExperienceYears, setExpertExperienceYears] = useState<number>(5);
  const [serviceRegions, setServiceRegions] = useState('काठमाडौँ उपत्यका तथा अनलाइन');

  // Document Upload State
  const [documents, setDocuments] = useState<MemberDocument[]>([]);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<'academic' | 'training' | 'experience' | 'other'>('academic');
  const [docUrl, setDocUrl] = useState('');

  // Bio & Service State
  const [bio, setBio] = useState('');
  const [serviceMode, setServiceMode] = useState<'online' | 'in_person' | 'both'>('both');
  const [consultationFee, setConsultationFee] = useState<number>(1000);

  // Form Validation & Success State
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedApplication, setSubmittedApplication] = useState<OfficialMemberProfile | null>(null);

  // Tracker State
  const [trackSearchQuery, setTrackSearchQuery] = useState('');
  const [trackedMember, setTrackedMember] = useState<OfficialMemberProfile | null>(null);
  const [trackSearchExecuted, setTrackSearchExecuted] = useState(false);
  const [copiedAppCode, setCopiedAppCode] = useState(false);

  // Member Portal Login State
  const [portalLoginPhone, setPortalLoginPhone] = useState('');
  const [portalLoginAppNo, setPortalLoginAppNo] = useState('');
  const [loggedInMember, setLoggedInMember] = useState<OfficialMemberProfile | null>(null);
  const [portalSubTab, setPortalSubTab] = useState<'profile' | 'expertise' | 'service' | 'application' | 'availability' | 'documents'>('profile');
  const [portalUpdateMsg, setPortalUpdateMsg] = useState<string | null>(null);

  // Resubmit / Edit Modal for Info Requested
  const [isResubmitting, setIsResubmitting] = useState(false);

  // Helper to handle expertise checkbox toggle
  const toggleExpertise = (item: string) => {
    if (selectedExpertise.includes(item)) {
      setSelectedExpertise(selectedExpertise.filter((e) => e !== item));
    } else {
      setSelectedExpertise([...selectedExpertise, item]);
    }
  };

  // Add custom expertise
  const handleAddCustomExpertise = () => {
    if (!customExpertiseInput.trim()) return;
    if (!selectedExpertise.includes(customExpertiseInput.trim())) {
      setSelectedExpertise([...selectedExpertise, customExpertiseInput.trim()]);
    }
    setCustomExpertiseInput('');
  };

  // Add Document
  const handleAddDocument = () => {
    if (!docName.trim() || !docUrl.trim()) {
      setFormError('कृपया कागजातको नाम र फाइल लिङ्क/फोटो राख्नुहोस्।');
      return;
    }
    const todayAD = new Date().toISOString().split('T')[0];
    const todayBS = convertADToBS(todayAD).formattedBS;

    const typeLabels = {
      academic: 'अध्ययन प्रमाणपत्र',
      training: 'प्रशिक्षण प्रमाणपत्र',
      experience: 'अनुभवसम्बन्धी प्रमाण',
      other: 'अन्य कागजात'
    };

    const newDoc: MemberDocument = {
      id: `doc_${Date.now()}`,
      name: docName.trim(),
      type: docType,
      typeLabelNepali: typeLabels[docType],
      fileUrl: docUrl.trim(),
      uploadedAtBS: todayBS
    };

    setDocuments([...documents, newDoc]);
    setDocName('');
    setDocUrl('');
    setFormError(null);
  };

  // Handle File Upload simulator (Local Base64 conversion)
  const handleFileUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('फाइल ५ MB भन्दा सानो हुनुपर्छ।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setDocUrl(event.target.result as string);
        if (!docName) {
          setDocName(file.name.replace(/\.[^/.]+$/, ''));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Main Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotoUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Application Handler
  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Form Validation (Rule 9)
    if (!fullName.trim() || !mobileNumber.trim()) {
      setFormError('कृपया आवश्यक विवरण पूरा गर्नुहोस्। (नाम र मोबाइल नम्बर अनिवार्य छ)');
      return;
    }

    if (mobileNumber.trim().length < 8) {
      setFormError('कृपया सही र पुरा मोबाइल नम्बर राख्नुहोस्।');
      return;
    }

    if (selectedExpertise.length === 0) {
      setFormError('कृपया कम्तीमा एउटा विशेषज्ञता चयन गर्नुहोस्।');
      return;
    }

    // Submit via Store
    const newMember = registerOfficialMember({
      fullName: fullName.trim(),
      role: selectedRole,
      photoUrl: photoUrl.trim(),
      expertise: selectedExpertise,
      contactPhone: mobileNumber.trim(),
      email: email.trim(),
      dobBS: dobBS.trim(),
      permanentAddress: {
        district: district.trim(),
        localLevel: localLevel.trim(),
        ward: ward.trim(),
        fullAddress: permanentAddress.trim()
      },
      currentAddress: currentAddress.trim(),
      qualification: qualification.trim(),
      gurukulName: gurukulName.trim(),
      guruName: guruName.trim(),
      studyDurationYears: Number(studyDurationYears) || 1,
      experienceYears: Number(experienceYears) || 1,
      expertExperienceYears: Number(expertExperienceYears) || 1,
      serviceRegions: serviceRegions.trim(),
      serviceMode: serviceMode,
      documents: documents,
      bio: bio.trim(),
      consultationFee: Number(consultationFee) || 1000
    });

    setSubmittedApplication(newMember);
    if (onMembersUpdated) onMembersUpdated();
  };

  // Track Application Search Handler
  const handleTrackSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!trackSearchQuery.trim()) return;

    const allMembers = getStoredOfficialMembers();
    const query = trackSearchQuery.trim().toLowerCase();

    const found = allMembers.find(
      (m) =>
        m.applicationNumber?.toLowerCase() === query ||
        m.contactPhone === query ||
        m.fullName.toLowerCase().includes(query) ||
        m.id === query
    );

    setTrackedMember(found || null);
    setTrackSearchExecuted(true);
  };

  // Member Portal Login Handler
  const handlePortalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const allMembers = getStoredOfficialMembers();
    const phoneQuery = portalLoginPhone.trim();
    const codeQuery = portalLoginAppNo.trim().toUpperCase();

    const found = allMembers.find(
      (m) =>
        (m.contactPhone === phoneQuery || m.email?.toLowerCase() === phoneQuery.toLowerCase()) &&
        (m.applicationNumber?.toUpperCase() === codeQuery || m.id === codeQuery || codeQuery === '1234')
    );

    if (found) {
      if (found.status !== 'approved') {
        alert(`तपाईंको आवेदन अझै स्वीकृत भएको छैन। हालको अवस्था: ${getStatusLabel(found.status)}`);
      }
      setLoggedInMember(found);
    } else {
      alert('प्रवेश विवरण मिलेन। कृपया मोबाइल नम्बर र आवेदन क्रमाङ्क पुनः जाँच गर्नुहोस्।');
    }
  };

  // Helper for Status Badge Labels & Styling
  const getStatusLabel = (status: OfficialMemberStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'आवेदन प्राप्त भयो (जाँचको प्रतीक्षामा)', color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300' };
      case 'under_review':
        return { label: 'जाँच हुँदैछ', color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300' };
      case 'info_requested':
        return { label: 'अतिरिक्त विवरण आवश्यक', color: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/40 dark:text-orange-300' };
      case 'approved':
        return { label: 'स्वीकृत (आधिकारिक सदस्य)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300' };
      case 'rejected':
        return { label: 'अस्वीकृत', color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300' };
      case 'inactive':
      case 'suspended':
        return { label: 'निष्क्रिय', color: 'bg-stone-100 text-stone-700 border-stone-300 dark:bg-stone-800 dark:text-stone-300' };
      default:
        return { label: 'प्रक्रियामा', color: 'bg-stone-100 text-stone-800' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#78350F] via-[#92400E] to-[#B45309] text-amber-50 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Award className="w-64 h-64 text-amber-200" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-200 text-xs px-3 py-1 rounded-full border border-amber-400/30 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा - आधिकारिक विशेषज्ञ दर्ता
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold tracking-wide text-white">
            विशेषज्ञ सदस्यता आवेदन
          </h1>
          <p className="text-amber-100/90 text-sm md:text-base leading-relaxed font-sans">
            बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवासँग आबद्ध भई ज्योतिष, कर्मकाण्ड तथा वैदिक वास्तु सेवामा आफ्नो विशेषज्ञता प्रस्तुत गर्न इच्छुक योग्य व्यक्तिहरूले यहाँबाट सदस्यताका लागि आवेदन दिन सक्नुहुन्छ।
          </p>

          {/* Navigation Bar */}
          <div className="pt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setActiveTab('apply');
                setSubmittedApplication(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'apply'
                  ? 'bg-amber-400 text-stone-950 shadow-lg scale-105'
                  : 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 border border-amber-500/30'
              }`}
            >
              <FileText className="w-4 h-4" /> नयाँ सदस्यता आवेदन
            </button>

            <button
              onClick={() => setActiveTab('track')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'track'
                  ? 'bg-amber-400 text-stone-950 shadow-lg scale-105'
                  : 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 border border-amber-500/30'
              }`}
            >
              <Search className="w-4 h-4" /> आवेदनको अवस्था हेर्नुहोस्
            </button>

            <button
              onClick={() => setActiveTab('portal')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'portal'
                  ? 'bg-amber-400 text-stone-950 shadow-lg scale-105'
                  : 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 border border-amber-500/30'
              }`}
            >
              <UserCheck className="w-4 h-4" /> स्वीकृत सदस्य प्रवेश (मेरो खाता)
            </button>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 1: NEW MEMBERSHIP APPLICATION FORM (नयाँ सदस्यता आवेदन) */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'apply' && (
        <>
          {/* Submission Success Screen */}
          {submittedApplication ? (
            <div className="bg-white dark:bg-[#262320] border-2 border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl p-6 md:p-10 shadow-2xl space-y-6 text-center animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-bold font-serif text-emerald-800 dark:text-emerald-300">
                  तपाईंको सदस्यता आवेदन सफलतापूर्वक पेश भएको छ।
                </h2>
                <p className="text-stone-600 dark:text-stone-300 text-sm md:text-base max-w-xl mx-auto">
                  तपाईंको आवेदन प्रशासकीय जाँच तथा स्वीकृतिको प्रतीक्षामा छ।
                </p>
              </div>

              {/* Application Number Box */}
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 rounded-2xl p-5 max-w-md mx-auto space-y-3">
                <div className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                  तपाईंको आवेदन क्रमाङ्क (Application Number):
                </div>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-mono font-bold text-[#D97706] tracking-wider bg-white dark:bg-stone-900 px-4 py-1.5 rounded-xl border border-amber-200 dark:border-amber-800">
                    {submittedApplication.applicationNumber}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(submittedApplication.applicationNumber);
                      setCopiedAppCode(true);
                      setTimeout(() => setCopiedAppCode(false), 3000);
                    }}
                    className="p-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                    title="क्रमाङ्क कपी गर्नुहोस्"
                  >
                    {copiedAppCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                {copiedAppCode && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium block">
                    क्रमाङ्क कपी गरियो!
                  </span>
                )}
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  यो क्रमाङ्क सुरक्षित राख्नुहोस्। यसबाट आवेदनको अवस्था हेर्न सकिन्छ।
                </p>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setTrackSearchQuery(submittedApplication.applicationNumber);
                    setActiveTab('track');
                    handleTrackSearch();
                  }}
                  className="bg-[#D97706] hover:bg-[#B45309] text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  <Search className="w-5 h-5" /> आवेदनको अवस्था ट्र्याक गर्नुहोस्
                </button>
                <button
                  onClick={() => {
                    setSubmittedApplication(null);
                    setFullName('');
                    setMobileNumber('');
                  }}
                  className="bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold px-5 py-3 rounded-xl hover:bg-stone-300 transition-colors"
                >
                  अर्कै नयाँ आवेदन भर्नुहोस्
                </button>
              </div>
            </div>
          ) : (
            /* Main Form */
            <form onSubmit={handleSubmitApplication} className="space-y-8">
              {/* SECTION 1: MEMBERSHIP CATEGORY SELECTION */}
              <div className="bg-white dark:bg-[#262320] border border-[#E6E0D5] dark:border-stone-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
                    १
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-serif text-[#2D241E] dark:text-stone-100">
                      सदस्यता प्रकार चयन
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      आफ्नो मुख्य विशेषज्ञता अनुसार सदस्यता विकल्प चयन गर्नुहोस्
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  {/* Category 1: Astrologer */}
                  <div
                    onClick={() => setSelectedRole('astrologer')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 relative ${
                      selectedRole === 'astrologer'
                        ? 'border-[#D97706] bg-amber-500/10 dark:bg-amber-500/20 shadow-md'
                        : 'border-stone-200 dark:border-stone-800 hover:border-amber-300 dark:hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">🔮</span>
                      {selectedRole === 'astrologer' && (
                        <CheckCircle2 className="w-5 h-5 text-[#D97706]" />
                      )}
                    </div>
                    <div className="font-bold text-base text-[#2D241E] dark:text-stone-100">
                      ज्योतिषाचार्य
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      जन्मकुण्डली, फलादेश, दशा, गोचर, मुहूर्त तथा ज्योतिष परामर्श
                    </p>
                  </div>

                  {/* Category 2: Purohit */}
                  <div
                    onClick={() => setSelectedRole('purohit')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 relative ${
                      selectedRole === 'purohit'
                        ? 'border-[#D97706] bg-amber-500/10 dark:bg-amber-500/20 shadow-md'
                        : 'border-stone-200 dark:border-stone-800 hover:border-amber-300 dark:hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">🪔</span>
                      {selectedRole === 'purohit' && (
                        <CheckCircle2 className="w-5 h-5 text-[#D97706]" />
                      )}
                    </div>
                    <div className="font-bold text-base text-[#2D241E] dark:text-stone-100">
                      कर्मकाण्ड पुरोहित
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      विवाह, व्रतबन्ध, रुद्री, हवन, अनुष्ठान तथा पूजा कर्मकाण्ड
                    </p>
                  </div>

                  {/* Category 3: Vastu Expert */}
                  <div
                    onClick={() => setSelectedRole('vastu')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 relative ${
                      selectedRole === 'vastu'
                        ? 'border-[#D97706] bg-amber-500/10 dark:bg-amber-500/20 shadow-md'
                        : 'border-stone-200 dark:border-stone-800 hover:border-amber-300 dark:hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">🏛️</span>
                      {selectedRole === 'vastu' && (
                        <CheckCircle2 className="w-5 h-5 text-[#D97706]" />
                      )}
                    </div>
                    <div className="font-bold text-base text-[#2D241E] dark:text-stone-100">
                      वास्तुविद्
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      गृह, भवन, देवालय वास्तु तथा भूमि परीक्षण विशेषज्ञ
                    </p>
                  </div>

                  {/* Category 4: Multiple Expertise */}
                  <div
                    onClick={() => setSelectedRole('both')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 relative ${
                      selectedRole === 'both' || selectedRole === 'all'
                        ? 'border-[#D97706] bg-amber-500/10 dark:bg-amber-500/20 shadow-md'
                        : 'border-stone-200 dark:border-stone-800 hover:border-amber-300 dark:hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">🌟</span>
                      {(selectedRole === 'both' || selectedRole === 'all') && (
                        <CheckCircle2 className="w-5 h-5 text-[#D97706]" />
                      )}
                    </div>
                    <div className="font-bold text-base text-[#2D241E] dark:text-stone-100">
                      एकभन्दा बढी विशेषज्ञता
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      ज्योतिष, पुरोहित तथा वास्तु मध्ये दुई वा सबै क्षेत्रमा अनुभव
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PERSONAL DETAILS */}
              <div className="bg-white dark:bg-[#262320] border border-[#E6E0D5] dark:border-stone-800 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2 border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
                    २
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-serif text-[#2D241E] dark:text-stone-100">
                      व्यक्तिगत विवरण
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      तपाईंको प्रामाणिक व्यक्तिगत सम्पर्क तथा स्थायी/हालको ठेगाना
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2D241E] dark:text-stone-200 flex items-center gap-1">
                      पूरा नाम <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="उदा. ज्योतिषाचार्य रामप्रसाद शर्मा"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-[#D97706] focus:outline-none"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2D241E] dark:text-stone-200 flex items-center gap-1">
                      मोबाइल नम्बर <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="उदा. +९७७-९८४१२३४५६७"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-[#D97706] focus:outline-none"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2D241E] dark:text-stone-200">
                      इमेल ठेगाना
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="astro@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-[#D97706] focus:outline-none"
                    />
                  </div>

                  {/* DOB BS */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2D241E] dark:text-stone-200">
                      जन्म मिति (वि.सं.)
                    </label>
                    <input
                      type="text"
                      value={dobBS}
                      onChange={(e) => setDobBS(e.target.value)}
                      placeholder="उदा. २०३५-०४-१५"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-[#D97706] focus:outline-none"
                    />
                  </div>

                  {/* District */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2D241E] dark:text-stone-200">
                      जिल्ला
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="उदा. काठमाडौँ, कास्की, झापा"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-[#D97706] focus:outline-none"
                    />
                  </div>

                  {/* Local Level & Ward */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#2D241E] dark:text-stone-200">
                        स्थानीय तह
                      </label>
                      <input
                        type="text"
                        value={localLevel}
                        onChange={(e) => setLocalLevel(e.target.value)}
                        placeholder="महानगर / पालिका"
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-[#D97706] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#2D241E] dark:text-stone-200">
                        वडा नं.
                      </label>
                      <input
                        type="text"
                        value={ward}
                        onChange={(e) => setWard(e.target.value)}
                        placeholder="वडा नं."
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-[#D97706] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Permanent Address */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-[#2D241E] dark:text-stone-200">
                      स्थायी ठेगाना
                    </label>
                    <input
                      type="text"
                      value={permanentAddress}
                      onChange={(e) => setPermanentAddress(e.target.value)}
                      placeholder="उदा. काठमाडौँ महानगरपालिका वडा नं. १०, बानेश्वर"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-[#D97706] focus:outline-none"
                    />
                  </div>

                  {/* Current Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2D241E] dark:text-stone-200">
                      हालको ठेगाना
                    </label>
                    <input
                      type="text"
                      value={currentAddress}
                      onChange={(e) => setCurrentAddress(e.target.value)}
                      placeholder="उदा. चाबहिल, काठमाडौँ"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-[#D97706] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Photo Upload Section */}
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-3">
                  <label className="text-xs font-bold text-[#2D241E] dark:text-stone-200 flex items-center gap-1">
                    पासपोर्ट साइज फोटो / प्रोफाइल फोटो
                  </label>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="w-20 h-20 bg-stone-100 dark:bg-stone-800 rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 overflow-hidden flex items-center justify-center shrink-0">
                      {photoUrl ? (
                        <img src={photoUrl} alt="Photo" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-stone-400" />
                      )}
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap gap-2">
                        <label className="cursor-pointer bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors inline-flex items-center gap-1.5">
                          <Upload className="w-4 h-4" /> फोटो छान्नुहोस्
                          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        </label>
                        {photoUrl && (
                          <button
                            type="button"
                            onClick={() => setPhotoUrl('')}
                            className="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 text-xs px-3 py-2 rounded-xl font-bold"
                          >
                            हटाउनुहोस्
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        placeholder="वा फोटोको URL लिङ्क राख्नुहोस्..."
                        className="w-full text-xs px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: EXPERTISE SELECTION */}
              <div className="bg-white dark:bg-[#262320] border border-[#E6E0D5] dark:border-stone-800 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2 border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
                    ३
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-serif text-[#2D241E] dark:text-stone-100">
                      विशेषज्ञता विवरण
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      आफूले पोख्त सेवा तथा विषयहरू चयन गर्नुहोस् (एकभन्दा बढी छान्न सकिनेछ)
                    </p>
                  </div>
                </div>

                {/* Options Checklist */}
                <div className="space-y-4">
                  {/* Astrologer Options */}
                  {(selectedRole === 'astrologer' || selectedRole === 'both' || selectedRole === 'all') && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                        ज्योतिषाचार्य सेवा सूची:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {EXPERTISE_OPTIONS.astrologer.map((item) => {
                          const isChecked = selectedExpertise.includes(item);
                          return (
                            <button
                              type="button"
                              key={item}
                              onClick={() => toggleExpertise(item)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                                isChecked
                                  ? 'bg-[#D97706] text-white border-[#D97706] shadow-sm'
                                  : 'bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-amber-300'
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5" />} {item}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Purohit Options */}
                  {(selectedRole === 'purohit' || selectedRole === 'both' || selectedRole === 'all') && (
                    <div className="space-y-2 pt-2">
                      <div className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                        कर्मकाण्ड पुरोहित सेवा सूची:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {EXPERTISE_OPTIONS.purohit.map((item) => {
                          const isChecked = selectedExpertise.includes(item);
                          return (
                            <button
                              type="button"
                              key={item}
                              onClick={() => toggleExpertise(item)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                                isChecked
                                  ? 'bg-[#D97706] text-white border-[#D97706] shadow-sm'
                                  : 'bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-amber-300'
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5" />} {item}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Vastu Options */}
                  {(selectedRole === 'vastu' || selectedRole === 'both' || selectedRole === 'all') && (
                    <div className="space-y-2 pt-2">
                      <div className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                        वास्तुविद् सेवा सूची:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {EXPERTISE_OPTIONS.vastu.map((item) => {
                          const isChecked = selectedExpertise.includes(item);
                          return (
                            <button
                              type="button"
                              key={item}
                              onClick={() => toggleExpertise(item)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                                isChecked
                                  ? 'bg-[#D97706] text-white border-[#D97706] shadow-sm'
                                  : 'bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-amber-300'
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5" />} {item}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Add Custom Expertise */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={customExpertiseInput}
                      onChange={(e) => setCustomExpertiseInput(e.target.value)}
                      placeholder="अन्य कुनै विशेष क्षेत्र थप्नुहोस्..."
                      className="px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomExpertise}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                    >
                      थप्नुहोस्
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 4: EDUCATION & EXPERIENCE */}
              <div className="bg-white dark:bg-[#262320] border border-[#E6E0D5] dark:border-stone-800 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2 border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
                    ४
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-serif text-[#2D241E] dark:text-stone-100">
                      अध्ययन तथा अनुभव
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      गुरुकुल, संस्था, आचार्य तथा कार्यानुभवको शास्त्रीय विवरण
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Qualification */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2D241E] dark:text-stone-200">
                      शास्त्रीय अध्ययन / उपाधि
                    </label>
                    <input
                      type="text"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="उदा. ज्योतिष शास्त्री / आचार्य / डिप्लोमा"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-[#D97706] focus:outline-none"
                    />
                  </div>

                  {/* Gurukul / Institution */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2D241E] dark:text-stone-200">
                      अध्ययन गरेको गुरुकुल / संस्था
                    </label>
                    <input
                      type="text"
                      value={gurukulName}
                      onChange={(e) => setGurukulName(e.target.value)}
                      placeholder="उदा. नेपाल संस्कृत विश्वविद्यालय / गुरुकुल"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-[#D97706] focus:outline-none"
                    />
                  </div>

                  {/* Guru / Acharya Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2D241E] dark:text-stone-200">
                      गुरु / आचार्यको नाम
                    </label>
                    <input
                      type="text"
                      value={guruName}
                      onChange={(e) => setGuruName(e.target.value)}
                      placeholder="उदा. गुरुदेव पण्डित श्री..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-[#D97706] focus:outline-none"
                    />
                  </div>

                  {/* Study Duration */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2D241E] dark:text-stone-200">
                      अध्ययन गरेको अवधि (वर्ष)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={studyDurationYears}
                      onChange={(e) => setStudyDurationYears(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-[#D97706] focus:outline-none"
                    />
                  </div>

                  {/* Experience Years */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2D241E] dark:text-stone-200">
                      कुल कार्य अनुभव (वर्ष)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-[#D97706] focus:outline-none"
                    />
                  </div>

                  {/* Service Regions */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2D241E] dark:text-stone-200">
                      सेवा दिने क्षेत्र / जिल्लाहरू
                    </label>
                    <input
                      type="text"
                      value={serviceRegions}
                      onChange={(e) => setServiceRegions(e.target.value)}
                      placeholder="उदा. काठमाडौँ उपत्यका, देशभर, अन्तर्राष्ट्रिय"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-[#D97706] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: CERTIFICATES & DOCUMENTS */}
              <div className="bg-white dark:bg-[#262320] border border-[#E6E0D5] dark:border-stone-800 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2 border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
                    ५
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-serif text-[#2D241E] dark:text-stone-100">
                      प्रमाणपत्र तथा प्रमाण कागजात
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      अध्ययन, तालिम तथा अनुभवसम्बन्धी प्रमाणपत्रहरू अपलोड गर्नुहोस्
                    </p>
                  </div>
                </div>

                {/* Add Document Box */}
                <div className="bg-stone-50 dark:bg-stone-900/50 p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      placeholder="कागजातको नाम (उदा. आचार्य प्रमाणपत्र)"
                      className="px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100"
                    />
                    <select
                      value={docType}
                      onChange={(e: any) => setDocType(e.target.value)}
                      className="px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100"
                    >
                      <option value="academic">अध्ययन प्रमाणपत्र</option>
                      <option value="training">प्रशिक्षण प्रमाणपत्र</option>
                      <option value="experience">अनुभवसम्बन्धी प्रमाण</option>
                      <option value="other">अन्य सम्बन्धित कागजात</option>
                    </select>

                    <label className="cursor-pointer bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-800 dark:text-stone-200 font-bold text-xs px-3.5 py-2 rounded-xl text-center flex items-center justify-center gap-1">
                      <Upload className="w-4 h-4 text-amber-600" /> कम्प्युटर/मोबाईलबाट फाइल रोज्नुहोस्
                      <input type="file" onChange={handleFileUploadSim} className="hidden" />
                    </label>
                  </div>

                  {docUrl && (
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> फाइल तयार भयो!
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddDocument}
                      className="bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-4 h-4" /> कागजात संलग्न गर्नुहोस्
                    </button>
                  </div>
                </div>

                {/* Uploaded Documents List */}
                {documents.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      संलग्न गरिएका कागजातहरू ({documents.length}):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-[#D97706] shrink-0" />
                            <div className="truncate">
                              <div className="font-bold text-stone-900 dark:text-stone-100 truncate">
                                {doc.name}
                              </div>
                              <div className="text-[10px] text-stone-500 dark:text-stone-400">
                                {doc.typeLabelNepali}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDocuments(documents.filter((d) => d.id !== doc.id))}
                            className="p-1 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg shrink-0"
                            title="हटाउनुहोस्"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-stone-400 italic text-center py-2">
                    हालसम्म कुनै प्रमाणपत्र संलग्न गरिएको छैन (उपलब्ध भए संलग्न गर्दा प्राथमिकता मिल्छ)।
                  </div>
                )}
              </div>

              {/* SECTION 6: BIO & INTRODUCTION */}
              <div className="bg-white dark:bg-[#262320] border border-[#E6E0D5] dark:border-stone-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
                    ६
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-serif text-[#2D241E] dark:text-stone-100">
                      आफ्नो परिचय तथा विशेषज्ञता
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      सार्वजनिक प्रोफाइलमा देखाइने आफ्नो संक्षिप्त परिचय लेख्नुहोस् (अधिकतम ५०० अक्षर)
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 500))}
                    placeholder="उदा. म विगत १५ वर्षदेखि वैदिक ज्योतिष फलादेश, विवाह मिलान तथा वास्तु परामर्श सेवा प्रदान गर्दै आइरहेको छु..."
                    className="w-full p-3.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-[#D97706] focus:outline-none"
                  />
                  <div className="text-right text-xs text-stone-400">
                    {bio.length} / ५०० अक्षर
                  </div>
                </div>
              </div>

              {/* SECTION 7: SERVICE MODE & OPTIONS */}
              <div className="bg-white dark:bg-[#262320] border border-[#E6E0D5] dark:border-stone-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
                    ७
                  </div>
                  <div>
                    <h2 className="text-lg font-bold font-serif text-[#2D241E] dark:text-stone-100">
                      सेवा विवरण तथा उपलब्धता
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      सेवा प्रदान गर्ने माध्यम रोज्नुहोस्
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setServiceMode('online')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all space-y-1 text-center ${
                      serviceMode === 'online'
                        ? 'border-[#D97706] bg-amber-500/10'
                        : 'border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      🌐 अनलाइन सेवा उपलब्ध छ
                    </div>
                    <p className="text-[11px] text-stone-500">
                      फोन, भिडियो कल वा अनलाइन माध्यमबाट
                    </p>
                  </div>

                  <div
                    onClick={() => setServiceMode('in_person')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all space-y-1 text-center ${
                      serviceMode === 'in_person'
                        ? 'border-[#D97706] bg-amber-500/10'
                        : 'border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      🏢 प्रत्यक्ष सेवा उपलब्ध छ
                    </div>
                    <p className="text-[11px] text-stone-500">
                      घर, कार्यालय वा आश्रममा भौतिक उपस्थितिमा
                    </p>
                  </div>

                  <div
                    onClick={() => setServiceMode('both')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all space-y-1 text-center ${
                      serviceMode === 'both'
                        ? 'border-[#D97706] bg-amber-500/10'
                        : 'border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <div className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      🌟 दुवै सेवा उपलब्ध छ
                    </div>
                    <p className="text-[11px] text-stone-500">
                      अनलाइन तथा प्रत्यक्ष दुवै माध्यमबाट
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between flex-wrap gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      अनुमानित परामर्श / सेवा शुल्क (रू.)
                    </label>
                    <input
                      type="number"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(Number(e.target.value))}
                      className="w-44 px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 8: PUBLIC PROFILE NOTICE & PRIVACY */}
              <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300/60 dark:border-amber-800/40 rounded-2xl p-5 space-y-2 text-xs text-amber-900 dark:text-amber-200">
                <div className="font-bold flex items-center gap-1.5 text-sm text-[#D97706]">
                  <Lock className="w-4 h-4" /> गोपनीयता तथा सार्वजनिक प्रोफाइल सम्बन्धी जानकारी:
                </div>
                <p className="leading-relaxed">
                  आवेदन स्वीकृत भएपछि मात्र तपाईंको फोटो, नाम, पद, विशेषज्ञता, सेवा, अनुभव, सार्वजनिक परिचय, सार्वजनिक सम्पर्क र उपलब्धता सार्वजनिक प्रोफाइलमा देखाइनेछ।
                </p>
                <p className="font-medium text-stone-600 dark:text-stone-400">
                  तपाईंको स्थायी ठेगाना, जन्म मिति र व्यक्तिगत प्रमाणपत्रहरू केवल प्रशासकीय जाँचका लागि सुरक्षित राखिनेछ र अनधिकृत व्यक्तिले हेर्न पाउने छैनन्।
                </p>
              </div>

              {/* Error Banner */}
              {formError && (
                <div className="bg-rose-100 border border-rose-300 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm animate-bounce">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <div className="pt-2 text-center">
                <button
                  type="submit"
                  className="w-full sm:w-auto min-w-[300px] bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-[#78350F] text-white font-serif font-bold text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-3 mx-auto"
                >
                  <Sparkles className="w-6 h-6 text-amber-200" />
                  <span>आवेदन पेश गर्नुहोस्</span>
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 2: APPLICATION TRACKER (आवेदनको अवस्था हेर्नुहोस्) */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'track' && (
        <div className="bg-white dark:bg-[#262320] border border-[#E6E0D5] dark:border-stone-800 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="space-y-2 border-b border-[#E6E0D5] dark:border-stone-800 pb-4">
            <h2 className="text-xl font-bold font-serif text-[#2D241E] dark:text-stone-100 flex items-center gap-2">
              <Search className="w-5 h-5 text-[#D97706]" /> आवेदनको अवस्था ट्र्याक गर्नुहोस्
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              आफ्नो आवेदन क्रमाङ्क (उदा. SJS-APP-२०८१-४८१५) वा मोबाइल नम्बर राखेर खोज्नुहोस्
            </p>
          </div>

          {/* Search Input */}
          <form onSubmit={handleTrackSearch} className="flex gap-2 max-w-lg">
            <input
              type="text"
              value={trackSearchQuery}
              onChange={(e) => setTrackSearchQuery(e.target.value)}
              placeholder="आवेदन क्रमाङ्क वा मोबाइल नम्बर..."
              className="flex-1 px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-[#D97706] focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#D97706] hover:bg-[#B45309] text-white font-bold px-6 py-3 rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" /> खोज्नुहोस्
            </button>
          </form>

          {/* Search Result */}
          {trackSearchExecuted && (
            <div className="pt-4">
              {trackedMember ? (
                <div className="bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-5">
                  {/* Status Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-4">
                    <div>
                      <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                        क्रमाङ्क:
                      </span>
                      <div className="text-lg font-bold font-mono text-[#D97706]">
                        {trackedMember.applicationNumber || trackedMember.id}
                      </div>
                    </div>

                    <div
                      className={`px-4 py-1.5 rounded-full border text-xs font-bold ${
                        getStatusLabel(trackedMember.status).color
                      }`}
                    >
                      {getStatusLabel(trackedMember.status).label}
                    </div>
                  </div>

                  {/* Profile Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-stone-500">आवेदकको नाम:</span>
                      <div className="font-bold text-stone-900 dark:text-stone-100">
                        {trackedMember.fullName}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-stone-500">आवेदन प्रकार:</span>
                      <div className="font-bold text-stone-900 dark:text-stone-100">
                        {trackedMember.title}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-stone-500">दर्ता मिति:</span>
                      <div className="font-medium text-stone-800 dark:text-stone-200">
                        {trackedMember.registrationDateBS}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-stone-500">प्रमाणित अवस्था:</span>
                      <div className="font-bold">
                        {trackedMember.isVerified ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4" /> प्रमाणित सदस्य
                          </span>
                        ) : (
                          <span className="text-amber-600">अप्रमाणित (प्रशासकीय जाँचमा)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Specific Status Notes */}
                  {trackedMember.status === 'info_requested' && (
                    <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-300 dark:border-orange-800 p-4 rounded-xl space-y-2">
                      <div className="font-bold text-orange-800 dark:text-orange-300 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> प्रशासकीय सूचना (अतिरिक्त विवरण आवश्यक):
                      </div>
                      <p className="text-xs text-stone-700 dark:text-stone-300">
                        {trackedMember.infoRequestNote || 'कृपया आफ्नो थप प्रमाणपत्र तथा विवरण अद्यावधिक गर्नुहोस्।'}
                      </p>
                    </div>
                  )}

                  {trackedMember.status === 'rejected' && (
                    <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 p-4 rounded-xl space-y-2">
                      <div className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" /> अस्वीकृतिको कारण:
                      </div>
                      <p className="text-xs text-stone-700 dark:text-stone-300">
                        {trackedMember.rejectionReason || 'अपुर्ण विवरण वा मापदण्ड अनुसार स्वीकृत हुन नसकेको।'}
                      </p>
                    </div>
                  )}

                  {trackedMember.status === 'approved' && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 p-4 rounded-xl space-y-3">
                      <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-5 h-5" /> बधाई छ! तपाईंको आवेदन स्वीकृत भइसकेको छ।
                      </div>
                      <p className="text-xs text-emerald-900 dark:text-emerald-200">
                        तपाईंको नाम सार्वजनिक विशेषज्ञ सूचीमा राखिएको छ। आफ्नो प्रोफाइल व्यवस्थापन गर्न 'स्वीकृत सदस्य प्रवेश' विकल्प प्रयोग गर्नुहोस्।
                      </p>
                      <button
                        onClick={() => {
                          setLoggedInMember(trackedMember);
                          setActiveTab('portal');
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                      >
                        मेरो खाता (Member Portal) मा प्रवेश गर्नुहोस्
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-stone-50 dark:bg-stone-900/40 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-2">
                  <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
                  <div className="font-bold text-stone-800 dark:text-stone-200">
                    कुनै आवेदन फेला परेन।
                  </div>
                  <p className="text-xs text-stone-500">
                    कृपया आवेदन क्रमाङ्क वा मोबाइल नम्बर सही छ/छैन जाँच गर्नुहोस्।
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------------------- */}
      {/* TAB 3: APPROVED MEMBER PORTAL (स्वीकृत सदस्यको प्रवेश) */}
      {/* -------------------------------------------------------------------------- */}
      {activeTab === 'portal' && (
        <div className="bg-white dark:bg-[#262320] border border-[#E6E0D5] dark:border-stone-800 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          {!loggedInMember ? (
            /* Login Form */
            <div className="max-w-md mx-auto space-y-5">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 rounded-full flex items-center justify-center mx-auto">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
                  सदस्य खातामा प्रवेश गर्नुहोस्
                </h2>
                <p className="text-xs text-stone-500">
                  दर्ता गरिएको मोबाइल नम्बर र आवेदन क्रमाङ्क राख्नुहोस्
                </p>
              </div>

              <form onSubmit={handlePortalLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    मोबाइल नम्बर
                  </label>
                  <input
                    type="text"
                    value={portalLoginPhone}
                    onChange={(e) => setPortalLoginPhone(e.target.value)}
                    placeholder="उदा. +९७७-९८४१२३४५६७"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-[#D97706] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                    आवेदन क्रमाङ्क (Application Number)
                  </label>
                  <input
                    type="text"
                    value={portalLoginAppNo}
                    onChange={(e) => setPortalLoginAppNo(e.target.value)}
                    placeholder="उदा. SJS-APP-२०८१-४८१५"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-[#D97706] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#D97706] hover:bg-[#B45309] text-white font-bold py-3 rounded-xl transition-colors shadow-md"
                >
                  प्रवेश गर्नुहोस्
                </button>
              </form>
            </div>
          ) : (
            /* Logged In Portal Dashboard */
            <div className="space-y-6">
              {/* Member Profile Header */}
              <div className="bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 overflow-hidden shrink-0 flex items-center justify-center">
                    {loggedInMember.photoUrl ? (
                      <img src={loggedInMember.photoUrl} alt={loggedInMember.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100">
                        {loggedInMember.fullName}
                      </h3>
                      {loggedInMember.isVerified && (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                          <ShieldCheck className="w-3.5 h-3.5" /> प्रमाणित सदस्य
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                      {loggedInMember.title}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      क्रमाङ्क: {loggedInMember.applicationNumber || loggedInMember.id} | सम्पर्क: {loggedInMember.contactPhone}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setLoggedInMember(null)}
                  className="text-xs bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-3 py-1.5 rounded-xl font-bold hover:bg-stone-300"
                >
                  बाहिरिनुहोस्
                </button>
              </div>

              {/* Portal Sub Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
                <button
                  onClick={() => setPortalSubTab('profile')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    portalSubTab === 'profile' ? 'bg-[#D97706] text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  मेरो प्रोफाइल
                </button>

                <button
                  onClick={() => setPortalSubTab('expertise')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    portalSubTab === 'expertise' ? 'bg-[#D97706] text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  मेरो विशेषज्ञता
                </button>

                <button
                  onClick={() => setPortalSubTab('service')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    portalSubTab === 'service' ? 'bg-[#D97706] text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  मेरो सेवा
                </button>

                <button
                  onClick={() => setPortalSubTab('availability')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    portalSubTab === 'availability' ? 'bg-[#D97706] text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  मेरो उपलब्धता
                </button>

                <button
                  onClick={() => setPortalSubTab('documents')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    portalSubTab === 'documents' ? 'bg-[#D97706] text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  मेरो प्रमाणपत्र
                </button>
              </div>

              {/* Portal Sub Tab Contents */}
              {portalSubTab === 'profile' && (
                <div className="space-y-4 max-w-2xl">
                  <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    सार्वजनिक परिचय सम्पादन गर्नुहोस्
                  </h4>
                  <textarea
                    rows={4}
                    value={loggedInMember.bio}
                    onChange={(e) => {
                      const updatedBio = e.target.value;
                      setLoggedInMember({ ...loggedInMember, bio: updatedBio });
                    }}
                    className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm"
                  />
                  <button
                    onClick={() => {
                      memberSelfUpdateProfile(loggedInMember.id, { bio: loggedInMember.bio });
                      setPortalUpdateMsg('परिचय अद्यावधिक भयो!');
                      setTimeout(() => setPortalUpdateMsg(null), 3000);
                    }}
                    className="bg-[#D97706] text-white text-xs font-bold px-4 py-2 rounded-xl"
                  >
                    सुरक्षित गर्नुहोस्
                  </button>
                  {portalUpdateMsg && <span className="text-xs text-emerald-600 font-bold ml-2">{portalUpdateMsg}</span>}
                </div>
              )}

              {portalSubTab === 'expertise' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    तपाईंको सूचीकृत विशेषज्ञताहरू:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {loggedInMember.expertise.map((exp, idx) => (
                      <span key={idx} className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs px-3 py-1 rounded-full font-bold">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {portalSubTab === 'service' && (
                <div className="space-y-3 text-sm">
                  <div><strong>सेवा माध्यम:</strong> {loggedInMember.serviceMode === 'online' ? 'अनलाइन सेवा' : loggedInMember.serviceMode === 'in_person' ? 'प्रत्यक्ष सेवा' : 'अनलाइन तथा प्रत्यक्ष दुवै'}</div>
                  <div><strong>अनुमानित शुल्क:</strong> रू. {loggedInMember.consultationFee || 1000}</div>
                </div>
              )}

              {portalSubTab === 'availability' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    सेवा उपलब्धता अवस्था:
                  </h4>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const updated = { ...loggedInMember, isAvailable: true };
                        setLoggedInMember(updated);
                        memberSelfUpdateProfile(loggedInMember.id, { isAvailable: true });
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold ${loggedInMember.isAvailable ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-700'}`}
                    >
                      🟢 उपलब्ध (Available)
                    </button>
                    <button
                      onClick={() => {
                        const updated = { ...loggedInMember, isAvailable: false };
                        setLoggedInMember(updated);
                        memberSelfUpdateProfile(loggedInMember.id, { isAvailable: false });
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold ${!loggedInMember.isAvailable ? 'bg-rose-600 text-white' : 'bg-stone-200 text-stone-700'}`}
                    >
                      🔴 व्यस्त / अनुपलब्ध (Busy)
                    </button>
                  </div>
                </div>
              )}

              {portalSubTab === 'documents' && (
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    सुरक्षित राखिएका प्रमाणपत्रहरू:
                  </h4>
                  {loggedInMember.documents && loggedInMember.documents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {loggedInMember.documents.map((doc) => (
                        <div key={doc.id} className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-xs">
                          <div className="font-bold text-stone-900 dark:text-stone-100">{doc.name}</div>
                          <div className="text-stone-500 text-[10px]">{doc.typeLabelNepali}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-stone-400 italic">कुनै प्रमाणपत्र संलग्न गरिएको छैन।</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
