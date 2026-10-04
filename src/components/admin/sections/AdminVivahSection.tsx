import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  ShieldCheck,
  Award,
  Users,
  UserPlus,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Unlock,
  Lock,
  Clock,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Plus,
  Star,
  Check,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Sparkles,
  Info,
  ShieldAlert,
  History,
  Activity,
  FileCheck,
  Maximize2
} from 'lucide-react';
import {
  VivahProfile,
  VivahAdvertisement,
  VivahRequest,
  VivahReport,
  VivahAuditLog,
  ProfileGender,
  MaritalStatus,
  VerificationLevel,
  EmploymentType,
  AdStatus
} from '../../../types/vivahTypes';
import {
  getStoredVivahProfiles,
  saveVivahProfile,
  deleteVivahProfile,
  getStoredVivahAds,
  saveVivahAd,
  getStoredVivahRequests,
  saveVivahRequest,
  getStoredVivahReports,
  saveVivahReport,
  getStoredVivahAuditLogs,
  logVivahAction
} from '../../../db/vivahStore';
import {
  NEPALI_GOTRAS,
  NEPALI_CASTES,
  NEPALI_RELIGIONS,
  NEPALI_FATHER_OCCUPATIONS,
  NEPALI_MOTHER_OCCUPATIONS,
  NEPALI_EDUCATIONS,
  NEPALI_OCCUPATIONS,
  NEPALI_INCOME_RANGES
} from '../../../constants/vivahConstants';
import { VivahPhotoUploader } from '../../vivah/VivahPhotoUploader';
import { VivahDocumentUploader } from '../../vivah/VivahDocumentUploader';
import { handlePhoneticInputKeyDown } from '../../../utils/nepaliTransliteration';

interface AdminVivahSectionProps {
  onRefreshParent?: () => void;
}

export const AdminVivahSection: React.FC<AdminVivahSectionProps> = ({ onRefreshParent }) => {
  const [activeSubTab, setActiveSubTab] = useState<'OVERVIEW' | 'PROFILES' | 'ADS' | 'CONTACT_RELEASES' | 'REPORTS' | 'AUDIT'>('OVERVIEW');

  // Data states
  const [profiles, setProfiles] = useState<VivahProfile[]>([]);
  const [ads, setAds] = useState<VivahAdvertisement[]>([]);
  const [requests, setRequests] = useState<VivahRequest[]>([]);
  const [reports, setReports] = useState<VivahReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<VivahAuditLog[]>([]);

  // Search & Filters for Profiles
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'GROOM' | 'BRIDE'>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING' | 'BASIC'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Ads Filter
  const [adFilter, setAdFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  // Contact Requests Filter
  const [requestFilter, setRequestFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');

  // Modals state
  const [selectedProfileForView, setSelectedProfileForView] = useState<VivahProfile | null>(null);
  const [selectedProfileForEdit, setSelectedProfileForEdit] = useState<VivahProfile | null>(null);
  const [isAddProfileModalOpen, setIsAddProfileModalOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<VivahProfile | null>(null);

  // Ad Rejection Dialog
  const [adToReject, setAdToReject] = useState<VivahAdvertisement | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Report Resolution Dialog
  const [reportToResolve, setReportToResolve] = useState<VivahReport | null>(null);
  const [reportNotesInput, setReportNotesInput] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = () => {
    try {
      const p = getStoredVivahProfiles();
      const a = getStoredVivahAds();
      const r = getStoredVivahRequests();
      const rep = getStoredVivahReports();
      const l = getStoredVivahAuditLogs();
      setProfiles([...p]);
      setAds([...a]);
      setRequests([...r]);
      setReports([...rep]);
      setAuditLogs([...l]);
      if (onRefreshParent) onRefreshParent();
    } catch (e) {
      console.error('Failed to load Vivah admin data:', e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Counts
  const pendingAdsCount = ads.filter(a => a.status === 'PENDING_REVIEW').length;
  const pendingVerificationsCount = profiles.filter(p => p.verificationStatus === 'PENDING' || (p.idDocumentUrl && p.verificationLevel !== 'ADMIN_VERIFIED')).length;
  const pendingContactCount = requests.filter(r => r.status === 'CONTACT_RELEASE_REQUESTED').length;
  const openReportsCount = reports.filter(r => r.status === 'OPEN' || r.status === 'UNDER_REVIEW').length;

  const totalGrooms = profiles.filter(p => p.gender === 'GROOM').length;
  const totalBrides = profiles.filter(p => p.gender === 'BRIDE').length;
  const verifiedProfilesCount = profiles.filter(p => p.verificationLevel === 'ADMIN_VERIFIED').length;

  // Handler: Toggle Verification
  const handleToggleVerification = (profile: VivahProfile) => {
    const isNowVerified = profile.verificationLevel !== 'ADMIN_VERIFIED';
    const updated: VivahProfile = {
      ...profile,
      verificationLevel: isNowVerified ? 'ADMIN_VERIFIED' : 'BASIC',
      verificationStatus: isNowVerified ? 'APPROVED' : 'NONE',
      updatedAt: new Date().toISOString()
    };
    saveVivahProfile(updated);
    logVivahAction(
      'admin_super',
      'Super Admin',
      isNowVerified ? 'प्रोफाइल प्रमाणीकरण स्वीकृत' : 'प्रोफाइल प्रमाणीकरण खारेज',
      'VERIFICATION',
      profile.id,
      `${profile.userFullName} (${profile.profileCode}) लाई ${isNowVerified ? 'प्रमाणित (Verified Badge)' : 'साधारण'} बनाइयो।`
    );
    loadData();
    showToast(`${profile.userFullName} को प्रमाणीकरण स्थिति अद्यावधिक गरियो।`);
  };

  // Handler: Toggle Active / Inactive
  const handleToggleActive = (profile: VivahProfile) => {
    const updated: VivahProfile = {
      ...profile,
      isActive: !profile.isActive,
      updatedAt: new Date().toISOString()
    };
    saveVivahProfile(updated);
    logVivahAction(
      'admin_super',
      'Super Admin',
      updated.isActive ? 'प्रोफाइल सक्रिय गरियो' : 'प्रोफाइल निष्क्रिय गरियो',
      'PROFILE',
      profile.id,
      `${profile.userFullName} (${profile.profileCode}) लाई ${updated.isActive ? 'सक्रिय' : 'निष्क्रिय'} बनाइयो।`
    );
    loadData();
    showToast(`${profile.userFullName} को स्थिति ${updated.isActive ? 'सक्रिय' : 'निष्क्रिय'} भयो।`);
  };

  // Handler: Toggle Featured
  const handleToggleFeatured = (profile: VivahProfile) => {
    const updated: VivahProfile = {
      ...profile,
      isFeatured: !profile.isFeatured,
      updatedAt: new Date().toISOString()
    };
    saveVivahProfile(updated);
    logVivahAction(
      'admin_super',
      'Super Admin',
      updated.isFeatured ? 'विशेष प्रोफाइल (Featured) तोकियो' : 'विशेष सूचीबाट हटाइयो',
      'PROFILE',
      profile.id,
      `${profile.userFullName} (${profile.profileCode}) लाई फिचर्ड सेट गरियो।`
    );
    loadData();
    showToast(`${profile.userFullName} को फिचर्ड स्थिति अद्यावधिक भयो।`);
  };

  // Handler: Delete Profile
  const handleConfirmDeleteProfile = () => {
    if (!profileToDelete) return;
    deleteVivahProfile(profileToDelete.id);
    logVivahAction(
      'admin_super',
      'Super Admin',
      'प्रोफाइल स्थायी रूपमा हटाइयो',
      'PROFILE',
      profileToDelete.id,
      `${profileToDelete.userFullName} (${profileToDelete.profileCode}) को विवरण हटाइयो।`
    );
    setProfileToDelete(null);
    loadData();
    showToast('विवाह प्रोफाइल सफलतापूर्व हटाइयो।');
  };

  // Handler: Approve Ad
  const handleApproveAd = (ad: VivahAdvertisement) => {
    const updated: VivahAdvertisement = {
      ...ad,
      status: 'APPROVED',
      updatedAt: new Date().toISOString()
    };
    saveVivahAd(updated);
    logVivahAction(
      'admin_super',
      'Super Admin',
      'विवाह विज्ञापन स्वीकृत',
      'ADVERTISEMENT',
      ad.id,
      `${ad.candidateName} (${ad.adCode}) को विज्ञापन सार्वजनिक स्वीकृत गरियो।`
    );
    loadData();
    showToast(`विज्ञापन ${ad.adCode} स्वीकृत गरियो।`);
  };

  // Handler: Reject Ad
  const handleConfirmRejectAd = () => {
    if (!adToReject) return;
    const reason = rejectionReasonInput.trim() || 'मापदण्ड अनुसार विवरण अपूर्ण रहेको';
    const updated: VivahAdvertisement = {
      ...adToReject,
      status: 'REJECTED',
      rejectionReason: reason,
      updatedAt: new Date().toISOString()
    };
    saveVivahAd(updated);
    logVivahAction(
      'admin_super',
      'Super Admin',
      'विवाह विज्ञापन अस्वीकृत',
      'ADVERTISEMENT',
      adToReject.id,
      `कारण: ${reason}`
    );
    setAdToReject(null);
    setRejectionReasonInput('');
    loadData();
    showToast(`विज्ञापन ${adToReject.adCode} अस्वीकृत गरियो।`);
  };

  // Handler: Approve Contact Release
  const handleApproveContactRelease = (req: VivahRequest) => {
    const updated: VivahRequest = {
      ...req,
      status: 'APPROVED_BY_ADMIN',
      adminApprovalNotes: 'प्रशासक द्वारा दुवै पक्षको सम्पर्क विवरण खुला गर्न स्वीकृति प्रदान गरियो।',
      updatedAt: new Date().toISOString()
    };
    saveVivahRequest(updated);
    logVivahAction(
      'admin_super',
      'Super Admin',
      'सम्पर्क सेयरिङ स्वीकृत',
      'REQUEST',
      req.id,
      `${req.senderName} र ${req.receiverName} बीच फोन तथा इमेल सम्पर्क खुला गरियो।`
    );
    loadData();
    showToast('सम्पर्क विवरण आदानप्रदानका लागि अनुमति प्रदान गरियो।');
  };

  // Handler: Reject Contact Release
  const handleRejectContactRelease = (req: VivahRequest) => {
    const updated: VivahRequest = {
      ...req,
      status: 'REJECTED_BY_ADMIN',
      adminApprovalNotes: 'प्रशासकीय समीक्षा अनुसार सम्पर्क सेयरिङ अनुमति अस्वीकृत गरिएको छ।',
      updatedAt: new Date().toISOString()
    };
    saveVivahRequest(updated);
    logVivahAction(
      'admin_super',
      'Super Admin',
      'सम्पर्क सेयरिङ अस्वीकृत',
      'REQUEST',
      req.id,
      `${req.senderName} र ${req.receiverName} बीचको सम्पर्क सेयरिङ अनुरोध अस्वीकृत गरियो।`
    );
    loadData();
    showToast('सम्पर्क सेयरिङ अनुरोध अस्वीकृत गरियो।');
  };

  // Handler: Resolve Report
  const handleConfirmResolveReport = () => {
    if (!reportToResolve) return;
    const notes = reportNotesInput.trim() || 'उजुरी छानबिन पश्चात समाधान गरियो।';
    const updated: VivahReport = {
      ...reportToResolve,
      status: 'RESOLVED',
      adminNotes: notes
    };
    saveVivahReport(updated);
    logVivahAction(
      'admin_super',
      'Super Admin',
      'उजुरी समाधान गरियो',
      'REPORT',
      reportToResolve.id,
      `लक्षित: ${reportToResolve.targetName}, कैफियत: ${notes}`
    );
    setReportToResolve(null);
    setReportNotesInput('');
    loadData();
    showToast('उजुरी सफलतापूर्वक समाधान गरियो।');
  };

  // Filtered Profiles
  const filteredProfiles = profiles.filter(p => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        p.userFullName?.toLowerCase().includes(q) ||
        p.displayFirstName?.toLowerCase().includes(q) ||
        p.profileCode?.toLowerCase().includes(q) ||
        p.currentDistrict?.toLowerCase().includes(q) ||
        p.casteEthnicity?.toLowerCase().includes(q) ||
        p.gotra?.toLowerCase().includes(q) ||
        p.occupation?.toLowerCase().includes(q) ||
        p.education?.toLowerCase().includes(q) ||
        p.contactPhone?.toLowerCase().includes(q);
      if (!match) return false;
    }
    // Gender
    if (genderFilter !== 'ALL' && p.gender !== genderFilter) return false;
    // Verification
    if (verificationFilter === 'VERIFIED' && p.verificationLevel !== 'ADMIN_VERIFIED') return false;
    if (verificationFilter === 'PENDING' && p.verificationStatus !== 'PENDING' && !p.idDocumentUrl) return false;
    if (verificationFilter === 'BASIC' && p.verificationLevel === 'ADMIN_VERIFIED') return false;
    // Status
    if (statusFilter === 'ACTIVE' && !p.isActive) return false;
    if (statusFilter === 'INACTIVE' && p.isActive) return false;
    return true;
  });

  // Filtered Ads
  const filteredAds = ads.filter(a => {
    if (adFilter === 'PENDING') return a.status === 'PENDING_REVIEW';
    if (adFilter === 'APPROVED') return a.status === 'APPROVED';
    if (adFilter === 'REJECTED') return a.status === 'REJECTED';
    return true;
  });

  // Filtered Requests
  const filteredRequests = requests.filter(r => {
    if (requestFilter === 'PENDING') return r.status === 'CONTACT_RELEASE_REQUESTED';
    if (requestFilter === 'APPROVED') return r.status === 'APPROVED_BY_ADMIN';
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn text-stone-100">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-500 animate-slideUp">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Section Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-950 p-6 rounded-3xl border border-stone-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-3.5 py-1 rounded-full text-xs font-semibold border border-amber-500/30">
            <HeartHandshake className="w-4 h-4 text-amber-400" />
            <span>विवाह मञ्च ब्याकइन्ड नियन्त्रण (Matrimonial Backend Management)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-100">
            वैदिक विवाह तथा वर-वधू मञ्च व्यवस्थापन
          </h2>
          <p className="text-xs text-stone-400 max-w-3xl">
            नेपाली समाजको मर्यादित, सुरक्षित तथा वैदिक कुण्डली अनुकूल वर र वधू प्रोफाइल, विज्ञापन स्वीकृति, सम्पर्क सेयरिङ अनुमति र उजुरीहरूको केन्द्रीय प्रशासन।
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsAddProfileModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 rounded-xl text-xs font-extrabold shadow-lg transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ नयाँ प्रोफाइल दर्ता</span>
          </button>
          <button
            onClick={loadData}
            className="p-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl border border-stone-700 text-xs transition-all cursor-pointer"
            title="रिफ्रेस गर्नुहोस्"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveSubTab('OVERVIEW')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'OVERVIEW'
              ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>तथ्याङ्क र सारांश (Overview)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('PROFILES')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'PROFILES'
              ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>वर/वधू प्रोफाइलहरू ({profiles.length})</span>
          {pendingVerificationsCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {pendingVerificationsCount} पेन्डिङ
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('ADS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'ADS'
              ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>विवाह विज्ञापन समीक्षा ({ads.length})</span>
          {pendingAdsCount > 0 && (
            <span className="bg-amber-500 text-stone-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
              {pendingAdsCount} समीक्षा बाँकी
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('CONTACT_RELEASES')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'CONTACT_RELEASES'
              ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-800'
          }`}
        >
          <Unlock className="w-4 h-4" />
          <span>सम्पर्क सेयरिङ स्वीकृति ({requests.length})</span>
          {pendingContactCount > 0 && (
            <span className="bg-sky-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {pendingContactCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('REPORTS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'REPORTS'
              ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>सुरक्षा तथा उजुरी ({reports.length})</span>
          {openReportsCount > 0 && (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-bounce">
              {openReportsCount} खुला
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('AUDIT')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeSubTab === 'AUDIT'
              ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
              : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>अडिट लग (Audit Logs)</span>
        </button>
      </div>

      {/* SUB-TAB 1: OVERVIEW & ANALYTICS */}
      {activeSubTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-stone-900/90 border border-stone-800 p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-xs text-stone-400">कुल प्रोफाइलहरू</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold font-serif text-amber-400">{profiles.length}</span>
                <Users className="w-5 h-5 text-stone-600" />
              </div>
              <span className="text-[10px] text-stone-500 mt-1">वर: {totalGrooms} | वधू: {totalBrides}</span>
            </div>

            <div className="bg-stone-900/90 border border-stone-800 p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-xs text-stone-400">प्रमाणित प्रोफाइलहरू</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-bold font-serif text-emerald-400">{verifiedProfilesCount}</span>
                <Award className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[10px] text-emerald-500/80 mt-1">Verified Badges</span>
            </div>

            <div className="bg-stone-900/90 border border-stone-800 p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-xs text-stone-400">प्रमाणीकरण पेन्डिङ</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className={`text-2xl font-bold font-serif ${pendingVerificationsCount > 0 ? 'text-rose-400' : 'text-stone-300'}`}>
                  {pendingVerificationsCount}
                </span>
                <Clock className="w-5 h-5 text-rose-500/60" />
              </div>
              <span className="text-[10px] text-stone-500 mt-1">कागजात समीक्षा बाँकी</span>
            </div>

            <div className="bg-stone-900/90 border border-stone-800 p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-xs text-stone-400">विज्ञापन पेन्डिङ</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className={`text-2xl font-bold font-serif ${pendingAdsCount > 0 ? 'text-amber-400' : 'text-stone-300'}`}>
                  {pendingAdsCount}
                </span>
                <FileText className="w-5 h-5 text-amber-500/60" />
              </div>
              <span className="text-[10px] text-stone-500 mt-1">सक्रिय: {ads.filter(a => a.status === 'APPROVED').length}</span>
            </div>

            <div className="bg-stone-900/90 border border-stone-800 p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-xs text-stone-400">सम्पर्क सेयर अनुरोध</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className={`text-2xl font-bold font-serif ${pendingContactCount > 0 ? 'text-sky-400' : 'text-stone-300'}`}>
                  {pendingContactCount}
                </span>
                <Unlock className="w-5 h-5 text-sky-500/60" />
              </div>
              <span className="text-[10px] text-stone-500 mt-1">स्वीकृत: {requests.filter(r => r.status === 'APPROVED_BY_ADMIN').length}</span>
            </div>

            <div className="bg-stone-900/90 border border-stone-800 p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-xs text-stone-400">खुला उजुरीहरू</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className={`text-2xl font-bold font-serif ${openReportsCount > 0 ? 'text-rose-400' : 'text-stone-300'}`}>
                  {openReportsCount}
                </span>
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <span className="text-[10px] text-stone-500 mt-1">सुरक्षा छानबिन</span>
            </div>
          </div>

          {/* Quick Action Center */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-5 space-y-4">
            <h3 className="text-sm font-bold font-serif text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>प्रशासकीय त्वरित कार्यहरू (Admin Action Hub)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => setIsAddProfileModalOpen(true)}
                className="p-4 bg-stone-950 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/50 rounded-2xl text-left transition-all group flex items-start gap-3"
              >
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-200 group-hover:text-amber-300">नयाँ विवाह प्रोफाइल दर्ता</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">वर वा वधूको व्यक्तिगत र कुण्डली विवरण थप्नुहोस्</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveSubTab('ADS');
                  setAdFilter('PENDING');
                }}
                className="p-4 bg-stone-950 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/50 rounded-2xl text-left transition-all group flex items-start gap-3"
              >
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl group-hover:bg-amber-500 group-hover:text-stone-950 transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-200 group-hover:text-amber-300">विज्ञापन समीक्षा गर्नुहोस् ({pendingAdsCount})</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">स्वीकृतिका लागि पर्खाइमा रहेका विवाह विज्ञापनहरू</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveSubTab('PROFILES');
                  setVerificationFilter('PENDING');
                }}
                className="p-4 bg-stone-950 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/50 rounded-2xl text-left transition-all group flex items-start gap-3"
              >
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:bg-emerald-500 group-hover:text-stone-950 transition-colors">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-200 group-hover:text-emerald-300">कागजात प्रमाणीकरण ({pendingVerificationsCount})</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">नागरिकता/पासपोर्ट प्रमाणीकरण गरी ब्याज प्रदान गर्नुहोस्</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveSubTab('CONTACT_RELEASES');
                  setRequestFilter('PENDING');
                }}
                className="p-4 bg-stone-950 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/50 rounded-2xl text-left transition-all group flex items-start gap-3"
              >
                <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl group-hover:bg-sky-500 group-hover:text-stone-950 transition-colors">
                  <Unlock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-200 group-hover:text-sky-300">सम्पर्क सेयरिङ अनुमति ({pendingContactCount})</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">सहमति भएका जोडीहरूलाई फोन/इमेल खुला गरिदिनुहोस्</p>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Audit Activities Feed */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-bold font-serif text-stone-200 flex items-center gap-2">
                <History className="w-4 h-4 text-stone-400" />
                <span>पछिल्ला प्रशासनिक गतिविधिहरू (Recent Activities)</span>
              </h3>
              <button
                onClick={() => setActiveSubTab('AUDIT')}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold"
              >
                सबै लग हेर्नुहोस् →
              </button>
            </div>

            <div className="space-y-2">
              {auditLogs.slice(0, 6).map(log => (
                <div
                  key={log.id}
                  className="p-3 bg-stone-950 rounded-2xl border border-stone-800/80 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <div>
                      <p className="font-bold text-stone-200">
                        {log.action} <span className="text-stone-500 font-normal">द्वारा {log.actorName}</span>
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">{log.details}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-500 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PROFILES MANAGEMENT */}
      {activeSubTab === 'PROFILES' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-stone-900/90 border border-stone-800 p-4 rounded-2xl space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
                <input
                  type="text"
                  placeholder="नाम, कोड, जिल्ला, पेशा, जात, गोत्र (उदा: shrestha + space)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => handlePhoneticInputKeyDown(e, searchQuery, setSearchQuery)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-100 outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Gender Filter Buttons */}
              <div className="flex items-center gap-1.5 shrink-0 bg-stone-950 p-1 rounded-xl border border-stone-800">
                {(['ALL', 'GROOM', 'BRIDE'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setGenderFilter(g)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      genderFilter === g ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {g === 'ALL' ? 'सबै लिङ्ग' : g === 'GROOM' ? 'वर (Grooms)' : 'वधू (Brides)'}
                  </button>
                ))}
              </div>

              {/* Verification Filter */}
              <div className="flex items-center gap-1.5 shrink-0 bg-stone-950 p-1 rounded-xl border border-stone-800">
                {(['ALL', 'VERIFIED', 'PENDING'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setVerificationFilter(v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      verificationFilter === v ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {v === 'ALL' ? 'सबै प्रमाणीकरण' : v === 'VERIFIED' ? 'प्रमाणित (Verified)' : 'पेन्डिङ (Pending)'}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 shrink-0 bg-stone-950 p-1 rounded-xl border border-stone-800">
                {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      statusFilter === s ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {s === 'ALL' ? 'सबै' : s === 'ACTIVE' ? 'सक्रिय' : 'निष्क्रिय'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
              <span>देखाउँदैछ: <strong>{filteredProfiles.length}</strong> प्रोफाइलहरू</span>
              <button
                onClick={() => setIsAddProfileModalOpen(true)}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>नयाँ प्रोफाइल सिर्जना गर्नुहोस्</span>
              </button>
            </div>
          </div>

          {/* Profiles Table / Card List */}
          <div className="bg-stone-900/90 border border-stone-800 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-950/80 border-b border-stone-800 text-stone-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">कोड / उम्मेदवार</th>
                    <th className="py-3 px-4">लिङ्ग / उमेर</th>
                    <th className="py-3 px-4">ठेगाना / जिल्ला</th>
                    <th className="py-3 px-4">शिक्षा र पेशा</th>
                    <th className="py-3 px-4">जात र गोत्र</th>
                    <th className="py-3 px-4">प्रमाणीकरण</th>
                    <th className="py-3 px-4">स्थिति</th>
                    <th className="py-3 px-4 text-right">कार्यहरू (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {filteredProfiles.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-stone-500 text-xs">
                        कुनै पनि विवाह प्रोफाइल भेटिएन।
                      </td>
                    </tr>
                  ) : (
                    filteredProfiles.map(p => (
                      <tr key={p.id} className="hover:bg-stone-850/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'}
                              alt={p.displayFirstName}
                              className="w-10 h-10 rounded-full object-cover border border-amber-500/40 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-stone-200">{p.userFullName}</span>
                                {p.isFeatured && (
                                  <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.2 rounded font-bold">
                                    फिचर्ड
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-[10px] text-amber-400">{p.profileCode}</span>
                              <p className="text-[10px] text-stone-500">{p.contactPhone}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.gender === 'GROOM' ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}>
                            {p.gender === 'GROOM' ? 'वर (Groom)' : 'वधू (Bride)'}
                          </span>
                          <p className="text-[11px] text-stone-400 mt-1">{p.age} वर्ष ({p.heightFeetInches})</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-medium text-stone-300">{p.currentDistrict}</p>
                          <p className="text-[10px] text-stone-500">{p.currentProvince}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="font-medium text-stone-300 truncate max-w-[140px]">{p.occupation}</p>
                          <p className="text-[10px] text-stone-500 truncate max-w-[140px]">{p.education}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="text-stone-300">{p.casteEthnicity || '-'}</p>
                          <p className="text-[10px] text-stone-500">गोत्र: {p.gotra || '-'}</p>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {p.verificationLevel === 'ADMIN_VERIFIED' ? (
                            <button
                              onClick={() => handleToggleVerification(p)}
                              title="प्रमाणीकरण रद्द गर्न क्लिक गर्नुहोस्"
                              className="inline-flex items-center gap-1 bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer hover:bg-emerald-900"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>प्रमाणित (Verified)</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleVerification(p)}
                              title="प्रमाणीकरण ब्याज प्रदान गर्न क्लिक गर्नुहोस्"
                              className="inline-flex items-center gap-1 bg-stone-800 hover:bg-emerald-800 border border-stone-700 text-stone-300 hover:text-white text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer transition-colors"
                            >
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                              <span>प्रमाणित गर्नुहोस्</span>
                            </button>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleActive(p)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                              p.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-stone-800 text-stone-500'
                            }`}
                          >
                            {p.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleFeatured(p)}
                              title={p.isFeatured ? 'फिचर्ड सूचीबाट हटाउनुहोस्' : 'फिचर्ड बनाउनुहोस्'}
                              className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                                p.isFeatured ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white'
                              }`}
                            >
                              <Star className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setSelectedProfileForView(p)}
                              title="विवरण हेर्नुहोस्"
                              className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg border border-stone-700 text-xs cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setSelectedProfileForEdit(p)}
                              title="सम्पादन गर्नुहोस्"
                              className="p-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 hover:text-amber-300 rounded-lg border border-stone-700 text-xs cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setProfileToDelete(p)}
                              title="हटाउनुहोस्"
                              className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg border border-rose-800 text-xs cursor-pointer"
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

      {/* SUB-TAB 3: MARRIAGE ADVERTISEMENTS REVIEW */}
      {activeSubTab === 'ADS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-stone-900/90 border border-stone-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setAdFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    adFilter === filter ? 'bg-amber-500 text-stone-950' : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  {filter === 'ALL' ? 'सबै विज्ञापनहरू' : filter === 'PENDING' ? `समीक्षा बाँकी (${pendingAdsCount})` : filter === 'APPROVED' ? 'स्वीकृत विज्ञापन' : 'अस्वीकृत'}
                </button>
              ))}
            </div>

            <span className="text-xs text-stone-400">जम्मा विज्ञापन: <strong>{filteredAds.length}</strong></span>
          </div>

          <div className="space-y-3">
            {filteredAds.length === 0 ? (
              <div className="bg-stone-900 border border-stone-800 p-12 rounded-3xl text-center text-xs text-stone-500">
                कुनै पनि विज्ञापन फेला परेन।
              </div>
            ) : (
              filteredAds.map(ad => (
                <div
                  key={ad.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    ad.status === 'PENDING_REVIEW'
                      ? 'bg-stone-900 border-amber-500/40 shadow-lg'
                      : ad.status === 'APPROVED'
                      ? 'bg-stone-900/80 border-stone-800'
                      : 'bg-stone-900/60 border-rose-900/40'
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-stone-800">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ad.gender === 'GROOM' ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        {ad.gender === 'GROOM' ? 'वर विज्ञापन' : 'वधू विज्ञापन'}
                      </span>
                      <span className="font-mono text-xs text-amber-400 font-bold">{ad.adCode}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ad.status === 'PENDING_REVIEW' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                        ad.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                        'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}>
                        {ad.status === 'PENDING_REVIEW' ? 'समीक्षा बाँकी' : ad.status === 'APPROVED' ? 'स्वीकृत' : 'अस्वीकृत'}
                      </span>
                    </div>

                    <span className="text-[11px] text-stone-500">
                      पेश गरिएको मिति: {new Date(ad.createdAt).toLocaleDateString('ne-NP')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 text-xs">
                    <div>
                      <h4 className="font-bold text-stone-100 text-sm font-serif">{ad.candidateName} ({ad.age} वर्ष)</h4>
                      <p className="text-stone-400 mt-1">स्थान: <span className="text-stone-200">{ad.location}</span></p>
                      <p className="text-stone-400 mt-0.5">शिक्षा: <span className="text-stone-200">{ad.education}</span></p>
                      <p className="text-stone-400 mt-0.5">पेशा: <span className="text-stone-200">{ad.profession}</span></p>
                    </div>

                    <div>
                      <p className="text-stone-400 font-semibold">पारिवारिक विवरण:</p>
                      <p className="text-stone-300 mt-1 italic">{ad.familySummary || 'विवरण उपलब्ध छैन'}</p>
                    </div>

                    <div>
                      <p className="text-stone-400 font-semibold">जीवनसाथी अपेक्षा:</p>
                      <p className="text-stone-300 mt-1 italic">{ad.partnerExpectations || 'सामान्य'}</p>
                    </div>
                  </div>

                  {ad.rejectionReason && (
                    <div className="mt-3 p-2.5 bg-rose-950/40 border border-rose-800 rounded-xl text-xs text-rose-300">
                      <strong>अस्वीकृत हुनुको कारण:</strong> {ad.rejectionReason}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-stone-800/80">
                    {ad.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleApproveAd(ad)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>स्वीकृत गर्नुहोस् (Approve Ad)</span>
                      </button>
                    )}
                    {ad.status !== 'REJECTED' && (
                      <button
                        onClick={() => {
                          setAdToReject(ad);
                          setRejectionReasonInput('');
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>अस्वीकार गर्नुहोस् (Reject)</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: CONTACT RELEASE REQUESTS */}
      {activeSubTab === 'CONTACT_RELEASES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-stone-900/90 border border-stone-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              {(['ALL', 'PENDING', 'APPROVED'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setRequestFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    requestFilter === filter ? 'bg-amber-500 text-stone-950' : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  {filter === 'ALL' ? 'सबै अनुरोधहरू' : filter === 'PENDING' ? `अनुमति बाँकी (${pendingContactCount})` : 'स्वीकृत'}
                </button>
              ))}
            </div>

            <span className="text-xs text-stone-400">जम्मा अनुरोधहरू: <strong>{filteredRequests.length}</strong></span>
          </div>

          <div className="space-y-3">
            {filteredRequests.length === 0 ? (
              <div className="bg-stone-900 border border-stone-800 p-12 rounded-3xl text-center text-xs text-stone-500">
                कुनै पनि सम्पर्क सेयरिङ अनुरोध फेला परेन।
              </div>
            ) : (
              filteredRequests.map(req => (
                <div
                  key={req.id}
                  className="bg-stone-900/90 border border-stone-800 p-5 rounded-2xl space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                      <span className="font-bold text-stone-200 text-xs">सम्पर्क सेयरिङ अनुरोध</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'CONTACT_RELEASE_REQUESTED' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                        req.status === 'APPROVED_BY_ADMIN' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                        'bg-stone-800 text-stone-400'
                      }`}>
                        {req.status === 'CONTACT_RELEASE_REQUESTED' ? 'प्रशासक स्वीकृति आवश्यक' :
                         req.status === 'APPROVED_BY_ADMIN' ? 'सम्पर्क खुला गरिएको छ' : req.status}
                      </span>
                    </div>

                    <span className="text-[11px] text-stone-500">
                      अनुरोध मिति: {new Date(req.createdAt).toLocaleDateString('ne-NP')}
                    </span>
                  </div>

                  {/* Matching Pair View */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-950 p-4 rounded-xl border border-stone-800">
                    {/* Sender */}
                    <div className="flex items-center gap-3">
                      <img
                        src={req.senderPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'}
                        alt={req.senderName}
                        className="w-12 h-12 rounded-full object-cover border border-amber-500/40 shrink-0"
                      />
                      <div className="text-xs">
                        <span className="text-[10px] text-amber-400 uppercase font-bold block">अनुरोधकर्ता (Sender)</span>
                        <h4 className="font-bold text-stone-100">{req.senderName}</h4>
                        <p className="text-stone-400 text-[11px] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-stone-500" />
                          <span>{req.senderPhone}</span>
                        </p>
                      </div>
                    </div>

                    {/* Receiver */}
                    <div className="flex items-center gap-3">
                      <img
                        src={req.receiverPhoto || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120'}
                        alt={req.receiverName}
                        className="w-12 h-12 rounded-full object-cover border border-amber-500/40 shrink-0"
                      />
                      <div className="text-xs">
                        <span className="text-[10px] text-emerald-400 uppercase font-bold block">प्राप्तकर्ता (Receiver)</span>
                        <h4 className="font-bold text-stone-100">{req.receiverName}</h4>
                        <p className="text-stone-400 text-[11px] flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-stone-500" />
                          <span>{req.receiverPhone}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {req.initialMessage && (
                    <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/80 text-xs text-stone-300">
                      <strong>उम्मेदवारको सन्देश:</strong> "{req.initialMessage}"
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                    {req.status === 'CONTACT_RELEASE_REQUESTED' ? (
                      <>
                        <button
                          onClick={() => handleApproveContactRelease(req)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>सम्पर्क सेयरिङ स्वीकृत (Grant Phone/Email Access)</span>
                        </button>
                        <button
                          onClick={() => handleRejectContactRelease(req)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>अस्वीकार गर्नुहोस्</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>प्रशासकीय निर्णय सम्पन्न भइसकेको छ</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: SAFETY & REPORTS */}
      {activeSubTab === 'REPORTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-stone-900/90 border border-stone-800 p-4 rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-stone-200">उजुरी तथा सुरक्षा संयन्त्र (Reports & Moderation)</h3>
              <p className="text-xs text-stone-400">प्रयोगकर्ताहरूद्वारा शंकास्पद, नक्कली वा अमर्यादित व्यवहार विरुद्ध परेका उजुरीहरू</p>
            </div>
            <span className="text-xs text-rose-400 font-bold bg-rose-950/60 border border-rose-800 px-3 py-1 rounded-full">
              खुला उजुरी: {openReportsCount}
            </span>
          </div>

          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="bg-stone-900 border border-stone-800 p-12 rounded-3xl text-center text-xs text-stone-500">
                कुनै पनि उजुरी दर्ता भएको छैन।
              </div>
            ) : (
              reports.map(rep => (
                <div
                  key={rep.id}
                  className="bg-stone-900/90 border border-stone-800 p-5 rounded-2xl space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {rep.reason}
                      </span>
                      <span className="font-bold text-stone-200">
                        उजुरीकर्ता: {rep.reporterName} → लक्षित उम्मेदवार: <span className="text-amber-400">{rep.targetName}</span>
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rep.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}>
                      {rep.status === 'RESOLVED' ? 'समाधान भयो' : 'छानबिन बाँकी'}
                    </span>
                  </div>

                  <div className="p-3 bg-stone-950 rounded-xl border border-stone-800/80 text-stone-300">
                    <p><strong>उजुरीको विवरण:</strong> {rep.details}</p>
                    {rep.adminNotes && (
                      <p className="text-emerald-400 text-[11px] mt-2 border-t border-stone-800 pt-1.5">
                        <strong>प्रशासक कैफियत:</strong> {rep.adminNotes}
                      </p>
                    )}
                  </div>

                  {rep.status !== 'RESOLVED' && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                      <button
                        onClick={() => {
                          setReportToResolve(rep);
                          setReportNotesInput('');
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        उजुरी समाधान गर्नुहोस् (Mark Resolved)
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: AUDIT LOGS */}
      {activeSubTab === 'AUDIT' && (
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-stone-200 font-serif">विवाह प्रणाली अडिट लग (System Audit Trail)</h3>
              <p className="text-xs text-stone-400">विवाह पोर्टलमा सम्पन्न गरिएका सबै प्रशासनिक तथा सुरक्षा सम्बन्धी गतिविधिहरूको अभिलेख।</p>
            </div>
            <span className="text-xs text-stone-400">जम्मा लग रेकर्ड: <strong>{auditLogs.length}</strong></span>
          </div>

          <div className="space-y-2">
            {auditLogs.length === 0 ? (
              <div className="text-center py-10 text-xs text-stone-500">
                कुनै पनि अडिट लग रेकर्ड गरिएको छैन।
              </div>
            ) : (
              auditLogs.map(log => (
                <div
                  key={log.id}
                  className="p-3 bg-stone-950 rounded-xl border border-stone-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {log.targetType}
                      </span>
                      <span className="font-bold text-stone-200">{log.action}</span>
                      <span className="text-stone-500 text-[11px]">({log.actorName})</span>
                    </div>
                    <p className="text-[11px] text-stone-400">{log.details}</p>
                  </div>

                  <span className="text-[10px] text-stone-500 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleString('ne-NP')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: VIEW FULL PROFILE DETAILS */}
      {selectedProfileForView && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedProfileForView.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'}
                  alt={selectedProfileForView.displayFirstName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-500"
                />
                <div>
                  <h3 className="text-lg font-bold text-stone-100 font-serif">
                    {selectedProfileForView.userFullName} ({selectedProfileForView.profileCode})
                  </h3>
                  <p className="text-xs text-amber-400">
                    {selectedProfileForView.gender === 'GROOM' ? 'वर प्रोफाइल' : 'वधू प्रोफाइल'} | {selectedProfileForView.currentDistrict}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProfileForView(null)}
                className="p-2 text-stone-400 hover:text-white rounded-xl bg-stone-800"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 space-y-1.5">
                <h5 className="font-bold text-amber-400 border-b border-stone-800 pb-1">जन्म तथा ज्योतिष विवरण</h5>
                <p><strong>जन्म मिति (ई.सं.):</strong> {selectedProfileForView.dobAD}</p>
                <p><strong>जन्म मिति (वि.सं.):</strong> {selectedProfileForView.dobBS}</p>
                <p><strong>जन्म समय:</strong> {selectedProfileForView.birthTime || 'उपलब्ध छैन'}</p>
                <p><strong>जन्म स्थान:</strong> {selectedProfileForView.birthPlace || 'उपलब्ध छैन'}</p>
                <p><strong>गोत्र:</strong> {selectedProfileForView.gotra || 'उपलब्ध छैन'}</p>
                <p><strong>जात/समुदाय:</strong> {selectedProfileForView.casteEthnicity || 'उपलब्ध छैन'}</p>
              </div>

              <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 space-y-1.5">
                <h5 className="font-bold text-amber-400 border-b border-stone-800 pb-1">शिक्षा तथा पेशा</h5>
                <p><strong>शिक्षा:</strong> {selectedProfileForView.education}</p>
                <p><strong>अध्ययन क्षेत्र:</strong> {selectedProfileForView.fieldOfStudy}</p>
                <p><strong>पेशा:</strong> {selectedProfileForView.occupation}</p>
                <p><strong>रोजगार प्रकार:</strong> {selectedProfileForView.employedIn}</p>
                <p><strong>मासिक आम्दानी:</strong> {selectedProfileForView.monthlyIncomeRange}</p>
                <p><strong>उचाइ:</strong> {selectedProfileForView.heightFeetInches}</p>
              </div>

              <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 space-y-1.5">
                <h5 className="font-bold text-amber-400 border-b border-stone-800 pb-1">पारिवारिक पृष्ठभूमि</h5>
                <p><strong>बुबाको पेशा:</strong> {selectedProfileForView.fatherOccupation || '-'}</p>
                <p><strong>आमाको पेशा:</strong> {selectedProfileForView.motherOccupation || '-'}</p>
                <p><strong>परिवार प्रकार:</strong> {selectedProfileForView.familyType === 'JOINT' ? 'संयुक्त' : 'एकल'}</p>
                <p><strong>दाजुभाइ/दिदीबहिनी:</strong> {selectedProfileForView.siblingsInfo || '-'}</p>
                <p><strong>स्थायी ठेगाना:</strong> {selectedProfileForView.permanentAddress}</p>
              </div>

              <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 space-y-1.5">
                <h5 className="font-bold text-amber-400 border-b border-stone-800 pb-1">सम्पर्क तथा गोपनीयता</h5>
                <p><strong>सम्पर्क फोन:</strong> {selectedProfileForView.contactPhone}</p>
                <p><strong>इमेल:</strong> {selectedProfileForView.contactEmail || '-'}</p>
                <p><strong>प्रमाणीकरण:</strong> {selectedProfileForView.verificationLevel}</p>
                {selectedProfileForView.idDocumentUrl && (
                  <div className="pt-2 border-t border-stone-800 space-y-1.5">
                    <p className="text-amber-400 font-bold flex items-center gap-1 text-xs">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                      पेश गरिएको परिचयपत्र ({selectedProfileForView.idDocumentType || 'नागरिकता'}):
                    </p>
                    {selectedProfileForView.idDocumentUrl.startsWith('data:image') || selectedProfileForView.idDocumentUrl.startsWith('http') ? (
                      <div className="relative group rounded-xl overflow-hidden border border-stone-700 bg-stone-900 max-h-48 flex items-center justify-center">
                        <img 
                          src={selectedProfileForView.idDocumentUrl} 
                          alt="ID Document" 
                          className="max-h-44 object-contain rounded-lg"
                        />
                        <a 
                          href={selectedProfileForView.idDocumentUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold gap-1.5 transition-opacity"
                        >
                          <Maximize2 className="w-4 h-4" />
                          पूर्ण आकारमा हेर्नुहोस् (Open Full)
                        </a>
                      </div>
                    ) : (
                      <p className="text-stone-300 break-all text-[11px] font-mono">
                        {selectedProfileForView.idDocumentUrl}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedProfileForView.aboutMe && (
              <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 text-xs">
                <h5 className="font-bold text-amber-400 mb-1">आफ्नो बारेमा (About Me)</h5>
                <p className="text-stone-300 italic">"{selectedProfileForView.aboutMe}"</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
              <button
                onClick={() => handleToggleVerification(selectedProfileForView)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                {selectedProfileForView.verificationLevel === 'ADMIN_VERIFIED' ? 'प्रमाणीकरण रद्द गर्नुहोस्' : 'प्रमाणित ब्याज दिनुहोस्'}
              </button>
              <button
                onClick={() => setSelectedProfileForView(null)}
                className="px-4 py-2 bg-stone-800 text-stone-300 hover:text-white rounded-xl text-xs font-bold"
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW OR EDIT PROFILE */}
      {(isAddProfileModalOpen || selectedProfileForEdit) && (
        <ProfileFormModal
          profile={selectedProfileForEdit}
          onClose={() => {
            setIsAddProfileModalOpen(false);
            setSelectedProfileForEdit(null);
          }}
          onSave={(savedProfile) => {
            saveVivahProfile(savedProfile);
            logVivahAction(
              'admin_super',
              'Super Admin',
              selectedProfileForEdit ? 'प्रोफाइल विवरण सम्पादन' : 'नयाँ प्रोफाइल सिर्जना',
              'PROFILE',
              savedProfile.id,
              `${savedProfile.userFullName} (${savedProfile.profileCode})`
            );
            setIsAddProfileModalOpen(false);
            setSelectedProfileForEdit(null);
            loadData();
            showToast('विवाह प्रोफाइल सफलतापूर्व सुरक्षित गरियो।');
          }}
        />
      )}

      {/* MODAL 3: DELETE CONFIRMATION */}
      {profileToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-rose-800/80 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
            <Trash2 className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-stone-100">प्रोफाइल स्थायी रूपमा हटाउने पुष्टि?</h3>
            <p className="text-xs text-stone-400">
              के तपाईं <strong>{profileToDelete.userFullName}</strong> ({profileToDelete.profileCode}) को विवाह प्रोफाइल हटाउन निश्चित हुनुहुन्छ? यो कार्य पूर्ववत गर्न सकिँदैन।
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setProfileToDelete(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                onClick={handleConfirmDeleteProfile}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-lg"
              >
                हटाउनुहोस् (Delete)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: AD REJECTION REASON */}
      {adToReject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-stone-100 font-serif">विज्ञापन अस्वीकार गर्नुको कारण</h3>
            <p className="text-xs text-stone-400">
              विज्ञापन कोड: <strong className="text-amber-400">{adToReject.adCode}</strong> ({adToReject.candidateName})
            </p>
            <textarea
              rows={3}
              placeholder="अस्वीकार गर्नुको स्पष्ट कारण खुलाउनुहोस् (उदा: aupacharik + space)..."
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              onKeyDown={(e) => handlePhoneticInputKeyDown(e, rejectionReasonInput, setRejectionReasonInput)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-100 outline-none focus:border-amber-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                onClick={() => setAdToReject(null)}
                className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl text-xs font-bold"
              >
                रद्द
              </button>
              <button
                onClick={handleConfirmRejectAd}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
              >
                अस्वीकार पुष्टि गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: RESOLVE REPORT REASON */}
      {reportToResolve && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-stone-100 font-serif">उजुरी समाधान कैफियत (Resolution Notes)</h3>
            <p className="text-xs text-stone-400">
              उजुरीकर्ता: {reportToResolve.reporterName} | लक्षित: <strong className="text-amber-400">{reportToResolve.targetName}</strong>
            </p>
            <textarea
              rows={3}
              placeholder="उजुरी छानबिन सम्बन्धी निर्णय वा कैफियत लेख्नुहोस् (उदा: samadhan + space)..."
              value={reportNotesInput}
              onChange={(e) => setReportNotesInput(e.target.value)}
              onKeyDown={(e) => handlePhoneticInputKeyDown(e, reportNotesInput, setReportNotesInput)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-100 outline-none focus:border-amber-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
              <button
                onClick={() => setReportToResolve(null)}
                className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl text-xs font-bold"
              >
                रद्द
              </button>
              <button
                onClick={handleConfirmResolveReport}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
              >
                समाधान सुरक्षित गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component: Profile Add / Edit Form Modal
interface ProfileFormModalProps {
  profile: VivahProfile | null;
  onClose: () => void;
  onSave: (p: VivahProfile) => void;
}

const ProfileFormModal: React.FC<ProfileFormModalProps> = ({ profile, onClose, onSave }) => {
  const isEdit = !!profile;
  const [formData, setFormData] = useState<Partial<VivahProfile>>({
    id: profile?.id || `vivah_p_${Date.now()}`,
    profileCode: profile?.profileCode || `VIV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 899)}`,
    userId: profile?.userId || `user_admin_created_${Date.now()}`,
    userFullName: profile?.userFullName || '',
    displayFirstName: profile?.displayFirstName || '',
    gender: profile?.gender || 'GROOM',
    dobAD: profile?.dobAD || '1997-01-01',
    dobBS: profile?.dobBS || '२०५३-०९-१७',
    birthTime: profile?.birthTime || '07:30',
    birthPlace: profile?.birthPlace || 'काठमाडौँ',
    age: profile?.age || 27,
    currentDistrict: profile?.currentDistrict || 'काठमाडौँ',
    currentProvince: profile?.currentProvince || 'बागमती प्रदेश',
    permanentAddress: profile?.permanentAddress || 'काठमाडौँ',
    maritalStatus: profile?.maritalStatus || 'NEVER_MARRIED',
    education: profile?.education || 'स्नातक (Bachelor)',
    fieldOfStudy: profile?.fieldOfStudy || 'General',
    occupation: profile?.occupation || 'निजी सेवा (Private Sector)',
    employedIn: profile?.employedIn || 'PRIVATE',
    monthlyIncomeRange: profile?.monthlyIncomeRange || 'रु ५०,००० - रु १,००,०००',
    heightFeetInches: profile?.heightFeetInches || "5'7\"",
    complexion: profile?.complexion || 'गोरो (Fair)',
    religion: profile?.religion || 'हिन्दू (Hindu)',
    casteEthnicity: profile?.casteEthnicity || '',
    gotra: profile?.gotra || '',
    fatherOccupation: profile?.fatherOccupation || '',
    motherOccupation: profile?.motherOccupation || '',
    familyType: profile?.familyType || 'NUCLEAR',
    familyValues: profile?.familyValues || 'MODERATE',
    familyLocation: profile?.familyLocation || 'काठमाडौँ',
    siblingsInfo: profile?.siblingsInfo || '',
    diet: profile?.diet || 'VEG',
    drinkingSmoking: profile?.drinkingSmoking || 'NO',
    hobbiesInterests: profile?.hobbiesInterests || ['पठन', 'यात्रा'],
    aboutMe: profile?.aboutMe || '',
    partnerPreferences: profile?.partnerPreferences || {
      minAge: 22,
      maxAge: 30,
      minHeightFeet: 5.0,
      maxHeightFeet: 6.0,
      maritalStatus: ['NEVER_MARRIED'],
      minEducation: 'स्नातक',
      preferredProfessions: ['इन्जिनियर', 'डाक्टर', 'शिक्षक', 'बैङ्किङ'],
      preferredDistricts: ['काठमाडौँ', 'ललितपुर'],
      preferredProvinces: ['बागमती प्रदेश'],
    },
    profilePhoto: profile?.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    additionalPhotos: profile?.additionalPhotos || [],
    verificationLevel: profile?.verificationLevel || 'ADMIN_VERIFIED',
    verificationStatus: profile?.verificationStatus || 'APPROVED',
    contactPhone: profile?.contactPhone || '',
    contactEmail: profile?.contactEmail || '',
    privacySettings: profile?.privacySettings || {
      visibility: 'PUBLIC',
      hideContactDetails: true,
      allowDirectMatch: true,
    },
    createdAt: profile?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    viewCount: profile?.viewCount || 0,
    isActive: profile ? profile.isActive : true,
    isFeatured: profile ? profile.isFeatured : false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userFullName?.trim()) {
      alert('कृपया उम्मेदवारको पूरा नाम प्रविष्ट गर्नुहोस्।');
      return;
    }
    const finalDisplayFirstName = formData.displayFirstName?.trim() || formData.userFullName.split(' ')[0];
    onSave({
      ...(formData as VivahProfile),
      displayFirstName: finalDisplayFirstName
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl space-y-5 animate-scaleUp text-stone-100">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <h3 className="text-lg font-bold font-serif text-amber-400">
            {isEdit ? `विवाह प्रोफाइल सम्पादन (${formData.profileCode})` : 'नयाँ विवाह प्रोफाइल दर्ता (Super Admin Entry)'}
          </h3>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-white rounded-xl bg-stone-800">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Section 1: Basic Info */}
          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
            <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider">आधारभूत विवरण (Basic Details)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-stone-400 mb-1">पूरा नाम (Full Name) *</label>
                <input
                  type="text"
                  required
                  value={formData.userFullName}
                  onChange={(e) => setFormData({ ...formData, userFullName: e.target.value })}
                  onKeyDown={(e) => handlePhoneticInputKeyDown(e, formData.userFullName || '', (val) => setFormData((prev) => ({ ...prev, userFullName: val })))}
                  placeholder="उदा. इ. रुपेश के.सी."
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">प्रदर्शन नाम (First Name)</label>
                <input
                  type="text"
                  value={formData.displayFirstName}
                  onChange={(e) => setFormData({ ...formData, displayFirstName: e.target.value })}
                  onKeyDown={(e) => handlePhoneticInputKeyDown(e, formData.displayFirstName || '', (val) => setFormData((prev) => ({ ...prev, displayFirstName: val })))}
                  placeholder="उदा. रुपेश"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">लिङ्ग (Gender) *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as ProfileGender })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                >
                  <option value="GROOM">वर (Groom)</option>
                  <option value="BRIDE">वधू (Bride)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">उमेर (Age) *</label>
                <input
                  type="number"
                  required
                  min={18}
                  max={80}
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 25 })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">उचाइ (Height)</label>
                <input
                  type="text"
                  value={formData.heightFeetInches}
                  onChange={(e) => setFormData({ ...formData, heightFeetInches: e.target.value })}
                  placeholder={`उदा. 5'8"`}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">वैवाहिक स्थिति (Marital Status)</label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value as MaritalStatus })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                >
                  <option value="NEVER_MARRIED">अविवाहित (Never Married)</option>
                  <option value="DIVORCED">सम्बन्धविच्छेद (Divorced)</option>
                  <option value="WIDOWED">एकल / विदुर / विधवा (Widowed)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Astrology & Birth Details */}
          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
            <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider">जन्म तथा ज्योतिष विवरण (Birth & Kundali Details)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-stone-400 mb-1">जन्म मिति (ई.सं. AD)</label>
                <input
                  type="date"
                  value={formData.dobAD}
                  onChange={(e) => setFormData({ ...formData, dobAD: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">जन्म मिति (वि.सं. BS)</label>
                <input
                  type="text"
                  value={formData.dobBS}
                  onChange={(e) => setFormData({ ...formData, dobBS: e.target.value })}
                  placeholder="उदा. २०५४-०५-१२"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">जन्म समय (Time)</label>
                <input
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">जन्म स्थान (Birth Place)</label>
                <input
                  type="text"
                  value={formData.birthPlace}
                  onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                  onKeyDown={(e) => handlePhoneticInputKeyDown(e, formData.birthPlace || '', (val) => setFormData((prev) => ({ ...prev, birthPlace: val })))}
                  placeholder="उदा. पोखरा, कास्की"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">गोत्र (Gotra)</label>
                <select
                  value={formData.gotra}
                  onChange={(e) => setFormData({ ...formData, gotra: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                >
                  <option value="">-- गोत्र छान्नुहोस् --</option>
                  {NEPALI_GOTRAS.map(g => (
                    <option key={g.value} value={g.value}>
                      {g.labelNepali} {g.exampleSurnames ? `(${g.exampleSurnames.split(',').slice(0, 2).join(',')})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">जात/समुदाय (Caste/Ethnicity)</label>
                <select
                  value={formData.casteEthnicity}
                  onChange={(e) => setFormData({ ...formData, casteEthnicity: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                >
                  <option value="">-- जात / समुदाय छान्नुहोस् --</option>
                  {NEPALI_CASTES.map(c => (
                    <option key={c.value} value={c.value}>{c.labelNepali}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">धर्म (Religion)</label>
                <select
                  value={formData.religion}
                  onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                >
                  {NEPALI_RELIGIONS.map(r => (
                    <option key={r.value} value={r.value}>{r.labelNepali}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">पिताको पेशा (Father's Occupation)</label>
                <select
                  value={formData.fatherOccupation || ''}
                  onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                >
                  <option value="">-- पिताको पेशा छान्नुहोस् --</option>
                  {NEPALI_FATHER_OCCUPATIONS.map(occ => (
                    <option key={occ} value={occ}>{occ}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">माताको पेशा (Mother's Occupation)</label>
                <select
                  value={formData.motherOccupation || ''}
                  onChange={(e) => setFormData({ ...formData, motherOccupation: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                >
                  <option value="">-- माताको पेशा छान्नुहोस् --</option>
                  {NEPALI_MOTHER_OCCUPATIONS.map(occ => (
                    <option key={occ} value={occ}>{occ}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">हालको जिल्ला (District)</label>
                <input
                  type="text"
                  value={formData.currentDistrict}
                  onChange={(e) => setFormData({ ...formData, currentDistrict: e.target.value })}
                  onKeyDown={(e) => handlePhoneticInputKeyDown(e, formData.currentDistrict || '', (val) => setFormData((prev) => ({ ...prev, currentDistrict: val })))}
                  placeholder="उदा. काठमाडौँ"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">प्रदेश (Province)</label>
                <input
                  type="text"
                  value={formData.currentProvince}
                  onChange={(e) => setFormData({ ...formData, currentProvince: e.target.value })}
                  onKeyDown={(e) => handlePhoneticInputKeyDown(e, formData.currentProvince || '', (val) => setFormData((prev) => ({ ...prev, currentProvince: val })))}
                  placeholder="उदा. बागमती प्रदेश"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Education & Career */}
          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
            <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider">शिक्षा तथा पेशा (Education & Profession)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-stone-400 mb-1">उच्च शिक्षा (Education)</label>
                <select
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500 text-xs"
                >
                  <option value="">-- उच्च शिक्षा छान्नुहोस् --</option>
                  {NEPALI_EDUCATIONS.map(edu => (
                    <option key={edu} value={edu}>{edu}</option>
                  ))}
                  {formData.education && !NEPALI_EDUCATIONS.includes(formData.education) && (
                    <option value={formData.education}>{formData.education}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">पेशा (Occupation)</label>
                <select
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500 text-xs"
                >
                  <option value="">-- पेशा / पद छान्नुहोस् --</option>
                  {NEPALI_OCCUPATIONS.map(occ => (
                    <option key={occ} value={occ}>{occ}</option>
                  ))}
                  {formData.occupation && !NEPALI_OCCUPATIONS.includes(formData.occupation) && (
                    <option value={formData.occupation}>{formData.occupation}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">मासिक आम्दानी (Income)</label>
                <select
                  value={formData.monthlyIncomeRange}
                  onChange={(e) => setFormData({ ...formData, monthlyIncomeRange: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500 text-xs"
                >
                  <option value="">-- मासिक आम्दानी छान्नुहोस् --</option>
                  {NEPALI_INCOME_RANGES.map(inc => (
                    <option key={inc} value={inc}>{inc}</option>
                  ))}
                  {formData.monthlyIncomeRange && !NEPALI_INCOME_RANGES.includes(formData.monthlyIncomeRange) && (
                    <option value={formData.monthlyIncomeRange}>{formData.monthlyIncomeRange}</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Contact & Photo */}
          <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
            <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider">सम्पर्क तथा तस्बिर (Contact & Media)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-stone-400 mb-1">सम्पर्क फोन (Phone) *</label>
                <input
                  type="text"
                  required
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="उदा. 9841234567"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">सम्पर्क इमेल (Email)</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  placeholder="उदा. candidate@example.com"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <VivahPhotoUploader
                value={formData.profilePhoto}
                onChange={(photoUrl) => setFormData({ ...formData, profilePhoto: photoUrl })}
                label="उम्मेदवारको प्रोफाइल तस्बिर (Device Upload / Camera):"
              />
            </div>

            <div className="pt-2">
              <VivahDocumentUploader
                value={formData.idDocumentUrl}
                onChange={(docUrl) => setFormData({ ...formData, idDocumentUrl: docUrl })}
                label="परिचयपत्र कागजात (ID Document Upload / Camera):"
                docType={formData.idDocumentType || 'नागरिकता'}
              />
            </div>

            <div>
              <label className="block text-stone-400 mb-1">आफ्नो बारेमा संक्षिप्त विवरण (About Candidate)</label>
              <textarea
                rows={2}
                value={formData.aboutMe}
                onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                onKeyDown={(e) => handlePhoneticInputKeyDown(e, formData.aboutMe || '', (val) => setFormData((prev) => ({ ...prev, aboutMe: val })))}
                placeholder="उम्मेदवारको स्वभाव, रुचि र विचार (उदा: milansar + space)..."
                className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold"
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 rounded-xl text-xs font-black shadow-lg"
            >
              {isEdit ? 'परिवर्तन सुरक्षित गर्नुहोस्' : 'विवाह प्रोफाइल सुरक्षित गर्नुहोस्'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
