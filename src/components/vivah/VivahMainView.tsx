import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  HeartHandshake, 
  Home, 
  UserPlus, 
  User, 
  Search, 
  Heart, 
  Inbox, 
  Send, 
  Sparkles, 
  MessageSquare, 
  FileText, 
  ShieldCheck, 
  Lock, 
  HelpCircle, 
  Shield, 
  Filter, 
  CheckCircle, 
  Eye, 
  AlertCircle, 
  Menu, 
  X,
  ChevronDown
} from 'lucide-react';
import { 
  VivahProfile, 
  VivahAdvertisement, 
  VivahRequest, 
  VivahReport, 
  VivahAuditLog,
  ProfileGender,
  ConnectionRequestStatus
} from '../../types/vivahTypes';
import { 
  getStoredVivahProfiles, 
  saveVivahProfile, 
  deleteVivahProfile, 
  getStoredVivahAds, 
  saveVivahAd, 
  getStoredVivahRequests, 
  saveVivahRequest, 
  getStoredVivahFavorites, 
  toggleVivahFavorite, 
  getStoredVivahReports, 
  saveVivahReport, 
  blockVivahProfile, 
  getStoredVivahAuditLogs, 
  logVivahAction 
} from '../../db/vivahStore';
import { VivahLandingOverview } from './VivahLandingOverview';
import { VivahProfileCard } from './VivahProfileCard';
import { VivahProfileDetailModal } from './VivahProfileDetailModal';
import { VivahRegistrationForm } from './VivahRegistrationForm';
import { VivahSearchFilter, FilterState } from './VivahSearchFilter';
import { VivahAdsSection } from './VivahAdsSection';
import { VivahRequestsSection } from './VivahRequestsSection';
import { VivahMessagingSection } from './VivahMessagingSection';
import { VivahSmartMatchSection } from './VivahSmartMatchSection';
import { VivahVerificationSection } from './VivahVerificationSection';
import { VivahAdminPanel } from './VivahAdminPanel';
import { VivahOnboardingModal } from './VivahOnboardingModal';
import { RBACSession, getRoleLabelNepali } from '../../db/rbacStore';
import { YajamanLoginGateModal } from '../yajaman/YajamanLoginGateModal';
import { getStoredMyVivahProfile, saveStoredMyVivahProfile } from '../../utils/vivahPrivacyHelper';

export type VivahSectionTab = 
  | 'OVERVIEW' 
  | 'REGISTER' 
  | 'MY_PROFILE' 
  | 'SEARCH' 
  | 'FAVORITES' 
  | 'REQUESTS' 
  | 'MATCH' 
  | 'MESSAGING' 
  | 'ADS' 
  | 'VERIFICATION' 
  | 'PRIVACY' 
  | 'SUPPORT' 
  | 'ADMIN';

interface VivahMainViewProps {
  rbacSession?: RBACSession | null;
  onOpenAuthModal?: () => void;
  onOpenAstroVivahMilan?: (aBirthDetails: any, bBirthDetails: any) => void;
}

export const VivahMainView: React.FC<VivahMainViewProps> = ({
  rbacSession,
  onOpenAuthModal,
  onOpenAstroVivahMilan,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<VivahSectionTab>('OVERVIEW');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Login Gate Modal State
  const [loginGateInfo, setLoginGateInfo] = useState<{ message?: string; actionName?: string } | null>(null);

  const triggerLoginGate = (message?: string, actionName?: string) => {
    setLoginGateInfo({
      message: message || 'विवाह सेवा, सन्देश तथा बायोडाटा आदानप्रदानका लागि कृपया पहिले लगइन गर्नुहोस्।',
      actionName: actionName || 'विवाह सेवा',
    });
  };

  // Store State
  const [profiles, setProfiles] = useState<VivahProfile[]>(getStoredVivahProfiles());
  const [advertisements, setAdvertisements] = useState<VivahAdvertisement[]>(getStoredVivahAds());
  const [requests, setRequests] = useState<VivahRequest[]>(getStoredVivahRequests());
  const [favorites, setFavorites] = useState<string[]>([]);
  const [reports, setReports] = useState<VivahReport[]>(getStoredVivahReports());
  const [auditLogs, setAuditLogs] = useState<VivahAuditLog[]>(getStoredVivahAuditLogs());

  // User Onboarding Modal State
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [storedCustomProfile, setStoredCustomProfile] = useState<VivahProfile | null>(() => getStoredMyVivahProfile());

  // Current Active User Profile bound to RBAC identity
  const [myProfileId, setMyProfileId] = useState<string>(storedCustomProfile?.id || profiles[0]?.id || 'vivah_p_101');
  const myProfile = useMemo(() => {
    if (storedCustomProfile) return storedCustomProfile;
    if (rbacSession) {
      const foundByRbac = profiles.find(p => p.userId === rbacSession.userId || p.contactPhone === rbacSession.username);
      if (foundByRbac) return foundByRbac;
    }
    return profiles.find(p => p.id === myProfileId) || profiles[0] || null;
  }, [profiles, myProfileId, rbacSession, storedCustomProfile]);

  // Selected Profile Modal State
  const [selectedDetailProfile, setSelectedDetailProfile] = useState<VivahProfile | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Active Chat User State
  const [activeChatTarget, setActiveChatTarget] = useState<{ userId: string; name: string } | null>(null);

  // Dropdown States for Desktop Navigation Menus
  const [isUserFeaturesMenuOpen, setIsUserFeaturesMenuOpen] = useState<boolean>(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState<boolean>(false);
  const userFeaturesMenuRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userFeaturesMenuRef.current && !userFeaturesMenuRef.current.contains(e.target as Node)) {
        setIsUserFeaturesMenuOpen(false);
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(e.target as Node)) {
        setIsSettingsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    gender: 'ALL',
    minAge: 20,
    maxAge: 45,
    district: '',
    province: '',
    education: '',
    profession: '',
    maritalStatus: '',
    gotra: '',
    verifiedOnly: false,
    featuredOnly: false,
    searchQuery: '',
  });

  // Sync Favorites on Mount
  useEffect(() => {
    const userId = myProfile?.userId || 'user_101';
    const favs = getStoredVivahFavorites().filter(f => f.userId === userId).map(f => f.targetProfileId);
    setFavorites(favs);
  }, [myProfile]);

  // Handle Profile Save
  const handleSaveProfile = (profileToSave: VivahProfile) => {
    saveVivahProfile(profileToSave);
    saveStoredMyVivahProfile(profileToSave);
    setStoredCustomProfile(profileToSave);
    setProfiles(getStoredVivahProfiles());
    setMyProfileId(profileToSave.id);
    logVivahAction(profileToSave.userId, profileToSave.userFullName, 'SAVE_PROFILE', 'PROFILE', profileToSave.id, 'विवाह प्रोफाइल सुरक्षित गरियो।');
    setActiveSubTab('MY_PROFILE');
    alert('विवाह प्रोफाइल सफलतापूर्व सुरक्षित गरियो!');
  };

  // Handle Toggle Favorite
  const handleToggleFavorite = (targetProfileId: string) => {
    if (!rbacSession) {
      triggerLoginGate('मनपर्ने सूची (Favorites) मा राख्न पहिले लगइन गर्नुहोस्।', 'Favorite Profile');
      return;
    }
    const userId = myProfile?.userId || rbacSession.userId;
    toggleVivahFavorite(userId, targetProfileId);
    const favs = getStoredVivahFavorites().filter(f => f.userId === userId).map(f => f.targetProfileId);
    setFavorites(favs);
  };

  // Handle Connection Request Send
  const handleSendRequest = (targetProfile: VivahProfile) => {
    if (!rbacSession) {
      triggerLoginGate('विवाह अनुरोध (Connection Request) पठाउन पहिले लगइन गर्नुहोस्।', 'Send Connection Request');
      return;
    }
    if (!myProfile) {
      alert('कृपया पहिले आफ्नो विवाह प्रोफाइल दर्ता गर्नुहोस्।');
      setActiveSubTab('REGISTER');
      return;
    }

    const existing = requests.find(r => 
      (r.senderProfileId === myProfile.id && r.receiverProfileId === targetProfile.id) ||
      (r.senderProfileId === targetProfile.id && r.receiverProfileId === myProfile.id)
    );

    if (existing) {
      alert('यो प्रोफाइलसँग पहिले नै विवाह अनुरोध पठाइएको वा प्रक्रियामा रहेको छ।');
      return;
    }

    const msg = prompt(`${targetProfile.displayFirstName} लाई विवाह अनुरोध सन्देश लेख्नुहोस् (वैकल्पिक):`, 'नमस्ते, हजुरको विवाह बायोडाटा र पृष्ठभूमि धेरै राम्रो लाग्यो। आगे विचार आदान-प्रदान गर्न चाहन्छौँ।');

    const newReq: VivahRequest = {
      id: `req_${Date.now()}`,
      senderProfileId: myProfile.id,
      senderUserId: myProfile.userId,
      senderName: myProfile.displayFirstName,
      senderGender: myProfile.gender,
      senderPhoto: myProfile.profilePhoto,
      senderPhone: myProfile.contactPhone,
      receiverProfileId: targetProfile.id,
      receiverUserId: targetProfile.userId,
      receiverName: targetProfile.displayFirstName,
      receiverGender: targetProfile.gender,
      receiverPhoto: targetProfile.profilePhoto,
      receiverPhone: targetProfile.contactPhone,
      status: 'PENDING',
      initialMessage: msg || 'विवाह विचार आदान-प्रदान अनुरोध',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveVivahRequest(newReq);
    setRequests(getStoredVivahRequests());
    logVivahAction(myProfile.userId, myProfile.userFullName, 'SEND_REQUEST', 'REQUEST', newReq.id, `अनुरोध पठाइयो -> ${targetProfile.displayFirstName}`);
    alert('विवाह अनुरोध सफलतापूर्वक पठाइयो!');
  };

  // Handle Update Request Status
  const handleUpdateRequestStatus = (requestId: string, newStatus: ConnectionRequestStatus, notes?: string) => {
    const current = getStoredVivahRequests();
    const req = current.find(r => r.id === requestId);
    if (req) {
      req.status = newStatus;
      if (notes) req.adminApprovalNotes = notes;
      req.updatedAt = new Date().toISOString();
      saveVivahRequest(req);
      setRequests(getStoredVivahRequests());
      logVivahAction(myProfile?.userId || 'system', myProfile?.userFullName || 'User', 'UPDATE_REQUEST_STATUS', 'REQUEST', requestId, `स्थिति परिवर्तन -> ${newStatus}`);
    }
  };

  // Handle Create Ad
  const handleCreateAd = (newAd: VivahAdvertisement) => {
    saveVivahAd(newAd);
    setAdvertisements(getStoredVivahAds());
    logVivahAction(myProfile?.userId || 'user', myProfile?.userFullName || 'User', 'CREATE_AD', 'ADVERTISEMENT', newAd.id, 'नयाँ विवाह विज्ञापन रिभ्युका लागि दर्ता गरियो।');
  };

  // Handle Verification Submit
  const handleSubmitVerification = (idDocType: string, docUrl: string) => {
    if (myProfile) {
      myProfile.idDocumentType = idDocType;
      myProfile.idDocumentUrl = docUrl;
      myProfile.verificationLevel = 'ID_SUBMITTED';
      myProfile.verificationStatus = 'PENDING';
      saveVivahProfile(myProfile);
      setProfiles(getStoredVivahProfiles());
      logVivahAction(myProfile.userId, myProfile.userFullName, 'SUBMIT_VERIFICATION', 'VERIFICATION', myProfile.id, `परिचयपत्र पेश गरियो: ${idDocType}`);
    }
  };

  // Admin Actions
  const handleApproveAd = (adId: string) => {
    const current = getStoredVivahAds();
    const ad = current.find(a => a.id === adId);
    if (ad) {
      ad.status = 'APPROVED';
      saveVivahAd(ad);
      setAdvertisements(getStoredVivahAds());
      logVivahAction(rbacSession?.fullName || 'Admin', 'Admin', 'APPROVE_AD', 'ADVERTISEMENT', adId, 'विवाह विज्ञापन स्वीकृत');
    }
  };

  const handleRejectAd = (adId: string, reason: string) => {
    const current = getStoredVivahAds();
    const ad = current.find(a => a.id === adId);
    if (ad) {
      ad.status = 'REJECTED';
      ad.rejectionReason = reason;
      saveVivahAd(ad);
      setAdvertisements(getStoredVivahAds());
      logVivahAction(rbacSession?.fullName || 'Admin', 'Admin', 'REJECT_AD', 'ADVERTISEMENT', adId, `विज्ञापन अस्वीकृत: ${reason}`);
    }
  };

  const handleVerifyProfile = (profileId: string) => {
    const current = getStoredVivahProfiles();
    const p = current.find(item => item.id === profileId);
    if (p) {
      p.verificationLevel = 'ADMIN_VERIFIED';
      p.verificationStatus = 'APPROVED';
      saveVivahProfile(p);
      setProfiles(getStoredVivahProfiles());
      logVivahAction(rbacSession?.fullName || 'Admin', 'Admin', 'VERIFY_PROFILE', 'PROFILE', profileId, 'एडमिन प्रमाणीकरण ब्याच प्रदान');
    }
  };

  const handleApproveContactRelease = (requestId: string) => {
    handleUpdateRequestStatus(requestId, 'APPROVED_BY_ADMIN', 'सम्पर्क सेयरिङ एडमिनद्वारा स्वीकृत');
  };

  // Filter Search Results
  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      if (!p.isActive) return false;
      if (filters.gender !== 'ALL' && p.gender !== filters.gender) return false;
      if (p.age < filters.minAge || p.age > filters.maxAge) return false;
      if (filters.district && !p.currentDistrict.toLowerCase().includes(filters.district.toLowerCase())) return false;
      if (filters.maritalStatus && p.maritalStatus !== filters.maritalStatus) return false;
      if (filters.gotra && p.gotra && !p.gotra.toLowerCase().includes(filters.gotra.toLowerCase())) return false;
      if (filters.caste && p.casteEthnicity && !p.casteEthnicity.toLowerCase().includes(filters.caste.toLowerCase())) return false;
      if (filters.religion && p.religion && !p.religion.toLowerCase().includes(filters.religion.toLowerCase())) return false;
      if (filters.education && p.education && !p.education.toLowerCase().includes(filters.education.toLowerCase())) return false;
      if (filters.profession && p.occupation && !p.occupation.toLowerCase().includes(filters.profession.toLowerCase())) return false;
      if (filters.verifiedOnly && p.verificationLevel !== 'ADMIN_VERIFIED') return false;

      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesName = p.displayFirstName.toLowerCase().includes(q) || p.userFullName.toLowerCase().includes(q);
        const matchesProf = p.occupation.toLowerCase().includes(q) || p.education.toLowerCase().includes(q);
        const matchesLoc = p.currentDistrict.toLowerCase().includes(q) || p.currentProvince.toLowerCase().includes(q);
        if (!matchesName && !matchesProf && !matchesLoc) return false;
      }

      return true;
    });
  }, [profiles, filters]);

  // Main Navigation Sections
  const navTabs: Array<{ id: VivahSectionTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }> = [
    { id: 'OVERVIEW', label: 'विवाह पोर्टल', icon: Home },
    { id: 'SEARCH', label: 'प्रोफाइल खोज', icon: Search, badge: filteredProfiles.length },
    { id: 'MATCH', label: 'Match / Compatibility', icon: Sparkles },
    { id: 'REGISTER', label: 'नयाँ विवाह प्रोफाइल', icon: UserPlus },
    { id: 'MY_PROFILE', label: 'मेरो प्रोफाइल', icon: User },
    { id: 'REQUESTS', label: 'अनुरोधहरू', icon: Inbox, badge: requests.length },
    { id: 'MESSAGING', label: 'सुरक्षित सन्देश', icon: MessageSquare },
    { id: 'FAVORITES', label: 'मनपर्ने प्रोफाइल', icon: Heart, badge: favorites.length },
    { id: 'ADS', label: 'विवाह विज्ञापन', icon: FileText, badge: advertisements.filter(a => a.status === 'APPROVED').length },
    { id: 'VERIFICATION', label: 'Verification', icon: ShieldCheck },
    { id: 'PRIVACY', label: 'Privacy & Settings', icon: Lock },
    { id: 'SUPPORT', label: 'सहायता / Support', icon: HelpCircle },
  ];

  // Group 1: User / Matrimonial Features Dropdown
  const userFeatureTabs: Array<{ id: VivahSectionTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }> = [
    { id: 'MATCH', label: 'Match / Compatibility', icon: Sparkles },
    { id: 'MY_PROFILE', label: 'मेरो प्रोफाइल', icon: User },
    { id: 'REQUESTS', label: 'अनुरोधहरू', icon: Inbox, badge: requests.length },
    { id: 'MESSAGING', label: 'सुरक्षित सन्देश', icon: MessageSquare },
    { id: 'FAVORITES', label: 'मनपर्ने प्रोफाइल', icon: Heart, badge: favorites.length },
  ];

  // Group 2: Verification, Privacy & Support Dropdown
  const settingsSupportTabs: Array<{ id: VivahSectionTab; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'VERIFICATION', label: 'Verification', icon: ShieldCheck },
    { id: 'PRIVACY', label: 'Privacy & Settings', icon: Lock },
    { id: 'SUPPORT', label: 'सहायता / Support', icon: HelpCircle },
  ];

  const isUserFeaturesActive = ['MATCH', 'MY_PROFILE', 'REQUESTS', 'MESSAGING', 'FAVORITES'].includes(activeSubTab);
  const activeUserFeature = userFeatureTabs.find(t => t.id === activeSubTab);
  const userFeaturesTotalBadge = (requests.length || 0) + (favorites.length || 0);

  const isSettingsActive = ['VERIFICATION', 'PRIVACY', 'SUPPORT'].includes(activeSubTab);
  const activeSettingFeature = settingsSupportTabs.find(t => t.id === activeSubTab);

  // If Admin / Moderator, add Admin tab
  if (
    rbacSession && 
    (
      rbacSession.role === 'SUPER_ADMIN' || 
      rbacSession.role === 'STORE_ADMIN' || 
      rbacSession.role === 'MARRIAGE_MODERATOR' ||
      rbacSession.permissions?.includes('*') ||
      rbacSession.permissions?.includes('marriage.profiles.verify')
    )
  ) {
    navTabs.push({ id: 'ADMIN', label: 'विवाह Supervisor / Admin', icon: Shield });
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#141210] text-[#2D241E] dark:text-stone-100 transition-colors py-4 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* RBAC Session Header Bar */}
        <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-white rounded-3xl p-4 sm:p-5 shadow-lg border border-amber-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30 text-amber-300">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold font-serif text-amber-100">विवाह पोर्टल (Nepal Matrimonial Bureau)</h1>
                {rbacSession && (
                  <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[11px] font-mono font-bold">
                    {getRoleLabelNepali(rbacSession.role)}
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-200/80 mt-0.5">
                {rbacSession 
                  ? `प्रमाणित RBAC खाता सम्बद्ध: ${rbacSession.fullName} (${rbacSession.username})` 
                  : 'तपाईं अतिथिको रूपमा हेर्दै हुनुहुन्छ। विवाह बायोडाटा सिर्जना गर्न वा खोज्न RBAC लगइन गर्नुहोस्।'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-amber-400/40"
              title="जन्म मिति, समय र स्थान भरेर ३६ गुण कुण्डली मिलान हेर्नुहोस्"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{myProfile?.dobBS ? `🎂 जन्म विवरण (${myProfile.dobBS})` : '🎂 जन्म विवरण दर्ता गर्नुहोस्'}</span>
            </button>

            {rbacSession ? (
              <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-2xl border border-amber-500/30">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-amber-100">{rbacSession.fullName}</span>
              </div>
            ) : (
              onOpenAuthModal && (
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="bg-[#D97706] hover:bg-[#B45309] text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5"
                >
                  <Lock className="w-4 h-4" />
                  RBAC लगइन / दर्ता
                </button>
              )
            )}
          </div>
        </div>

        {/* Navigation Bar / Menu */}
        <div className="bg-white/95 dark:bg-[#1E1B18]/95 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-2 sm:p-3 shadow-md sticky top-[52px] sm:top-14 z-30 backdrop-blur-md">
          {/* Desktop Tab Menu with Clean Dropdowns */}
          <div className="hidden lg:flex items-center gap-2 overflow-visible pb-1">
            {/* 1. विवाह पोर्टल (Overview) */}
            <button
              type="button"
              onClick={() => setActiveSubTab('OVERVIEW')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubTab === 'OVERVIEW'
                  ? 'bg-[#D97706] text-white shadow-md'
                  : 'hover:bg-amber-100/60 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              <Home className={`w-4 h-4 ${activeSubTab === 'OVERVIEW' ? 'text-white' : 'text-[#D97706]'}`} />
              <span>विवाह पोर्टल</span>
            </button>

            {/* 2. प्रोफाइल खोज (Search) */}
            <button
              type="button"
              onClick={() => setActiveSubTab('SEARCH')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubTab === 'SEARCH'
                  ? 'bg-[#D97706] text-white shadow-md'
                  : 'hover:bg-amber-100/60 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              <Search className={`w-4 h-4 ${activeSubTab === 'SEARCH' ? 'text-white' : 'text-[#D97706]'}`} />
              <span>प्रोफाइल खोज</span>
              {filteredProfiles.length > 0 && (
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                  activeSubTab === 'SEARCH' ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-300'
                }`}>
                  {filteredProfiles.length}
                </span>
              )}
            </button>

            {/* 3. नयाँ विवाह प्रोफाइल (Register) */}
            <button
              type="button"
              onClick={() => setActiveSubTab('REGISTER')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubTab === 'REGISTER'
                  ? 'bg-[#D97706] text-white shadow-md'
                  : 'hover:bg-amber-100/60 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              <UserPlus className={`w-4 h-4 ${activeSubTab === 'REGISTER' ? 'text-white' : 'text-[#D97706]'}`} />
              <span>नयाँ विवाह प्रोफाइल</span>
            </button>

            {/* Dropdown 1: Match, My Profile, Requests, Messaging, Favorites */}
            <div className="relative" ref={userFeaturesMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsUserFeaturesMenuOpen(!isUserFeaturesMenuOpen);
                  setIsSettingsMenuOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isUserFeaturesActive
                    ? 'bg-[#D97706] text-white shadow-md'
                    : isUserFeaturesMenuOpen
                    ? 'bg-amber-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                    : 'hover:bg-amber-100/60 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
                title="म्याच, मेरो प्रोफाइल, अनुरोध, सन्देश तथा मनपर्ने सूची"
              >
                <Sparkles className={`w-4 h-4 ${isUserFeaturesActive ? 'text-white' : 'text-[#D97706]'}`} />
                <span>{activeUserFeature ? activeUserFeature.label : 'म्याच एवं प्रोफाइल'}</span>
                {userFeaturesTotalBadge > 0 && (
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                    isUserFeaturesActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200'
                  }`}>
                    {userFeaturesTotalBadge}
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isUserFeaturesMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserFeaturesMenuOpen && (
                <div className="absolute left-0 mt-1.5 w-60 bg-white dark:bg-[#1E1B18] rounded-2xl shadow-2xl border border-amber-200/80 dark:border-stone-700 p-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                  {userFeatureTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeSubTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setActiveSubTab(tab.id);
                          setIsUserFeaturesMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-amber-500/15 text-amber-900 dark:text-amber-200 font-extrabold'
                            : 'hover:bg-amber-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-[#D97706]' : 'text-stone-500 dark:text-stone-400'}`} />
                          <span>{tab.label}</span>
                        </div>
                        {tab.badge !== undefined && tab.badge > 0 && (
                          <span className="px-1.5 py-0.2 text-[10px] rounded-full font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200">
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. विवाह विज्ञापन (Ads) */}
            <button
              type="button"
              onClick={() => setActiveSubTab('ADS')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                activeSubTab === 'ADS'
                  ? 'bg-[#D97706] text-white shadow-md'
                  : 'hover:bg-amber-100/60 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
              }`}
            >
              <FileText className={`w-4 h-4 ${activeSubTab === 'ADS' ? 'text-white' : 'text-[#D97706]'}`} />
              <span>विवाह विज्ञापन</span>
              {advertisements.filter(a => a.status === 'APPROVED').length > 0 && (
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                  activeSubTab === 'ADS' ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-300'
                }`}>
                  {advertisements.filter(a => a.status === 'APPROVED').length}
                </span>
              )}
            </button>

            {/* Dropdown 2: Verification, Privacy & Settings, Support */}
            <div className="relative" ref={settingsMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsSettingsMenuOpen(!isSettingsMenuOpen);
                  setIsUserFeaturesMenuOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isSettingsActive
                    ? 'bg-[#D97706] text-white shadow-md'
                    : isSettingsMenuOpen
                    ? 'bg-amber-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                    : 'hover:bg-amber-100/60 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
                title="प्रमाणीकरण, गोपनीयता र सहायता केन्द्र"
              >
                <Lock className={`w-4 h-4 ${isSettingsActive ? 'text-white' : 'text-[#D97706]'}`} />
                <span>{activeSettingFeature ? activeSettingFeature.label : 'सहयोग एवं सेटिङ'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isSettingsMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSettingsMenuOpen && (
                <div className="absolute right-0 sm:right-auto sm:left-0 mt-1.5 w-56 bg-white dark:bg-[#1E1B18] rounded-2xl shadow-2xl border border-amber-200/80 dark:border-stone-700 p-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                  {settingsSupportTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeSubTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setActiveSubTab(tab.id);
                          setIsSettingsMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-amber-500/15 text-amber-900 dark:text-amber-200 font-extrabold'
                            : 'hover:bg-amber-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-[#D97706]' : 'text-stone-500 dark:text-stone-400'}`} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 5. Supervisor / Admin Tab (if authorized) */}
            {rbacSession && (
              rbacSession.role === 'SUPER_ADMIN' || 
              rbacSession.role === 'STORE_ADMIN' || 
              rbacSession.role === 'MARRIAGE_MODERATOR' ||
              rbacSession.permissions?.includes('*') ||
              rbacSession.permissions?.includes('marriage.profiles.verify')
            ) && (
              <button
                type="button"
                onClick={() => setActiveSubTab('ADMIN')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSubTab === 'ADMIN'
                    ? 'bg-[#D97706] text-white shadow-md'
                    : 'hover:bg-amber-100/60 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                <Shield className={`w-4 h-4 ${activeSubTab === 'ADMIN' ? 'text-white' : 'text-[#D97706]'}`} />
                <span>विवाह Supervisor</span>
              </button>
            )}
          </div>

          {/* Mobile Navigation Header Dropdown Button */}
          <div className="lg:hidden flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-[#D97706]" />
              <span className="font-bold font-serif text-sm">
                {navTabs.find(t => t.id === activeSubTab)?.label || 'विवाह मञ्च'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Drawer Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden grid grid-cols-2 gap-2 pt-3 border-t border-stone-200 dark:border-stone-800 mt-2">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveSubTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-[#D97706] text-white shadow'
                        : 'bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#D97706]" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tab 1: OVERVIEW */}
        {activeSubTab === 'OVERVIEW' && (
          <VivahLandingOverview
            profiles={profiles}
            advertisements={advertisements.filter(a => a.status === 'APPROVED')}
            favorites={favorites}
            myProfile={myProfile}
            onOpenOnboardingModal={() => setIsOnboardingOpen(true)}
            onToggleFavorite={handleToggleFavorite}
            onViewProfile={(p) => {
              setSelectedDetailProfile(p);
              setIsDetailModalOpen(true);
            }}
            onSendRequest={handleSendRequest}
            onNavigateTab={(tabKey) => setActiveSubTab(tabKey as VivahSectionTab)}
            onQuickSearch={(gender, district) => {
              setFilters(prev => ({ ...prev, gender, district }));
              setActiveSubTab('SEARCH');
            }}
          />
        )}

        {/* Tab 2: SEARCH */}
        {activeSubTab === 'SEARCH' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between lg:hidden">
              <span className="text-xs font-bold text-stone-600">नतिजा: {filteredProfiles.length} प्रोफाइल</span>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="bg-[#D97706] text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>फिल्टर (Filters)</span>
              </button>
            </div>

            <div className="flex gap-6 items-start">
              <VivahSearchFilter
                filters={filters}
                onChangeFilters={setFilters}
                onResetFilters={() => setFilters({
                  gender: 'ALL',
                  minAge: 20,
                  maxAge: 45,
                  district: '',
                  province: '',
                  education: '',
                  profession: '',
                  maritalStatus: '',
                  gotra: '',
                  verifiedOnly: false,
                  featuredOnly: false,
                  searchQuery: '',
                })}
                totalResultsCount={filteredProfiles.length}
                isMobileDrawerOpen={isMobileFilterOpen}
                onCloseMobileDrawer={() => setIsMobileFilterOpen(false)}
              />

              <div className="flex-1 space-y-4">
                {filteredProfiles.length === 0 ? (
                  <div className="bg-white dark:bg-[#1E1B18] p-10 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 text-center space-y-2">
                    <Search className="w-10 h-10 text-stone-400 mx-auto" />
                    <h4 className="font-bold text-stone-700 dark:text-stone-300">छनोट गरिएका शर्त अनुसार कुनै प्रोफाइल भेटिएन।</h4>
                    <p className="text-xs text-stone-500">कृपया फिल्टर दायरा थोरै खुकुलो पारेर पुन: प्रयास गर्नुहोस्।</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredProfiles.map((p) => (
                      <VivahProfileCard
                        key={p.id}
                        profile={p}
                        isFavorite={favorites.includes(p.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onViewProfile={(p) => {
                          setSelectedDetailProfile(p);
                          setIsDetailModalOpen(true);
                        }}
                        onSendRequest={handleSendRequest}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: MATCH */}
        {activeSubTab === 'MATCH' && (
          <VivahSmartMatchSection
            myProfile={myProfile}
            candidates={profiles}
            onViewProfile={(p) => {
              setSelectedDetailProfile(p);
              setIsDetailModalOpen(true);
            }}
            onSendRequest={handleSendRequest}
            onOpenOnboardingModal={() => setIsOnboardingOpen(true)}
            onOpenGunaMilanModal={(candidate) => {
              if (onOpenAstroVivahMilan) {
                onOpenAstroVivahMilan(myProfile, candidate);
              } else {
                alert(`ज्योतिषीय मिलान: ${myProfile?.displayFirstName} र ${candidate.displayFirstName} को जन्मकुण्डली एवं गुण मिलान रिपोर्ट।`);
              }
            }}
          />
        )}

        {/* Tab 4: REGISTER */}
        {activeSubTab === 'REGISTER' && (
          <VivahRegistrationForm
            onSaveProfile={handleSaveProfile}
            onCancel={() => setActiveSubTab('OVERVIEW')}
          />
        )}

        {/* Tab 5: MY_PROFILE */}
        {activeSubTab === 'MY_PROFILE' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {myProfile ? (
              <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
                  <div className="flex items-center gap-3">
                    <img src={myProfile.profilePhoto} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500" />
                    <div>
                      <h2 className="text-xl font-bold font-serif">{myProfile.userFullName} ({myProfile.displayFirstName})</h2>
                      <p className="text-xs text-stone-500">{myProfile.profileCode} | {myProfile.gender === 'GROOM' ? 'वर प्रोफाइल' : 'वधू प्रोफाइल'}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveSubTab('REGISTER')}
                    className="bg-[#D97706] text-white font-bold px-4 py-2 rounded-xl text-xs shadow"
                  >
                    प्रोफाइल सम्पादन गर्नुहोस्
                  </button>
                </div>

                {/* Profile Completion Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>प्रोफाइल पूर्णता (Profile Completion):</span>
                    <span className="text-[#D97706]">९५% पूर्ण</span>
                  </div>
                  <div className="w-full bg-stone-100 dark:bg-stone-800 h-3 rounded-full overflow-hidden">
                    <div className="bg-[#D97706] h-full rounded-full w-[95%]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center">
                  <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200">
                    <span className="font-bold text-base text-[#D97706] block">{myProfile.viewCount}</span>
                    <span className="text-stone-500">हेरिएको सङ्ख्या (Views)</span>
                  </div>
                  <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200">
                    <span className="font-bold text-base text-emerald-600 block">
                      {requests.filter(r => r.receiverProfileId === myProfile.id).length}
                    </span>
                    <span className="text-stone-500">प्राप्त अनुरोध</span>
                  </div>
                  <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200">
                    <span className="font-bold text-base text-sky-600 block">
                      {requests.filter(r => r.senderProfileId === myProfile.id).length}
                    </span>
                    <span className="text-stone-500">पठाइएको अनुरोध</span>
                  </div>
                  <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200">
                    <span className="font-bold text-base text-purple-600 block">
                      {requests.filter(r => (r.senderProfileId === myProfile.id || r.receiverProfileId === myProfile.id) && r.status === 'APPROVED_BY_ADMIN').length}
                    </span>
                    <span className="text-stone-500">स्वीकृत सम्बन्ध</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-10 bg-white dark:bg-[#1E1B18] rounded-3xl border border-[#E6E0D5]">
                <h3 className="font-bold text-lg">कुनै प्रोफाइल भेटिएन। कृपया दर्ता गर्नुहोस्।</h3>
              </div>
            )}
          </div>
        )}

        {/* Tab 6: REQUESTS */}
        {activeSubTab === 'REQUESTS' && (
          <VivahRequestsSection
            requests={requests}
            currentProfile={myProfile}
            onUpdateRequestStatus={handleUpdateRequestStatus}
            onOpenChatWithUser={(targetUserId, targetName) => {
              setActiveChatTarget({ userId: targetUserId, name: targetName });
              setActiveSubTab('MESSAGING');
            }}
          />
        )}

        {/* Tab 7: MESSAGING */}
        {activeSubTab === 'MESSAGING' && (
          <VivahMessagingSection
            currentProfile={myProfile}
            targetUserId={activeChatTarget?.userId}
            targetName={activeChatTarget?.name}
          />
        )}

        {/* Tab 8: FAVORITES */}
        {activeSubTab === 'FAVORITES' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold font-serif flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-current" />
              <span>मनपर्ने प्रोफाइलहरू (Private Saved Favorites)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.filter(p => favorites.includes(p.id)).map(p => (
                <VivahProfileCard
                  key={p.id}
                  profile={p}
                  isFavorite={true}
                  onToggleFavorite={handleToggleFavorite}
                  onViewProfile={(p) => {
                    setSelectedDetailProfile(p);
                    setIsDetailModalOpen(true);
                  }}
                  onSendRequest={handleSendRequest}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 9: ADS */}
        {activeSubTab === 'ADS' && (
          <VivahAdsSection
            ads={advertisements}
            userProfile={myProfile}
            onCreateAd={handleCreateAd}
            onViewProfile={(profileId) => {
              const p = profiles.find(item => item.id === profileId);
              if (p) {
                setSelectedDetailProfile(p);
                setIsDetailModalOpen(true);
              }
            }}
          />
        )}

        {/* Tab 10: VERIFICATION */}
        {activeSubTab === 'VERIFICATION' && (
          <VivahVerificationSection
            currentProfile={myProfile}
            onSubmitVerification={handleSubmitVerification}
          />
        )}

        {/* Tab 11: PRIVACY & SETTINGS */}
        {activeSubTab === 'PRIVACY' && (
          <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 max-w-2xl mx-auto space-y-4 text-xs sm:text-sm">
            <h3 className="font-bold font-serif text-lg flex items-center gap-2 text-amber-900 dark:text-amber-200">
              <Lock className="w-5 h-5 text-[#D97706]" />
              <span>गोपनीयता तथा सम्पर्क नियन्त्रण नीति (Privacy First Policy)</span>
            </h3>

            <div className="space-y-3 text-stone-700 dark:text-stone-300">
              <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200">
                <h4 className="font-bold text-[#D97706] mb-1">१. फोन र ठेगाना सार्वजनिक कहिल्यै नहुने</h4>
                <p>सबै प्रोफाइलमा "सम्पर्क विवरण गोप्य (Contact Hidden)" प्रणाली लागू रहन्छ।</p>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200">
                <h4 className="font-bold text-[#D97706] mb-1">२. दोहोरो सहमति र एडमिन स्वीकृतिको नियम</h4>
                <p>प्रयोगकर्ता A ले B लाई विवाह अनुरोध पठाउने र B ले स्वीकार गरेपछि एडमिन प्रमाणीकरण भई मात्र सम्पर्क खुला हुन्छ।</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 12: SUPPORT */}
        {activeSubTab === 'SUPPORT' && (
          <div className="bg-white dark:bg-[#1E1B18] p-6 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 max-w-2xl mx-auto space-y-4 text-xs sm:text-sm">
            <h3 className="font-bold font-serif text-lg flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#D97706]" />
              <span>विवाह मञ्च सहायता तथा परामर्श (Vivah Support & Helpline)</span>
            </h3>

            <div className="space-y-2 text-stone-700 dark:text-stone-300">
              <p>विवाह मञ्चसम्बन्धी कुनै जिज्ञासा वा प्राविधिक सहयोग चाहिएमा बालानन्द ज्योतिष हेल्पलाइनमा सम्पर्क गर्नुहोस्:</p>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl font-mono text-xs space-y-1">
                <p>फोन: +९७७-०१-४४००००० / ९८४१२३४५६७</p>
                <p>ईमेल: vivah@balanandajyotish.com</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 13: ADMIN */}
        {activeSubTab === 'ADMIN' && (
          <VivahAdminPanel
            profiles={profiles}
            advertisements={advertisements}
            requests={requests}
            reports={reports}
            auditLogs={auditLogs}
            onApproveAd={handleApproveAd}
            onRejectAd={handleRejectAd}
            onVerifyProfile={handleVerifyProfile}
            onApproveContactRelease={handleApproveContactRelease}
            onResolveReport={(reportId, notes) => {
              const rep = reports.find(r => r.id === reportId);
              if (rep) {
                rep.status = 'RESOLVED';
                rep.adminNotes = notes;
                setReports([...reports]);
              }
            }}
          />
        )}

      </div>

      {/* Profile Detail View Modal */}
      <VivahProfileDetailModal
        profile={selectedDetailProfile}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        isFavorite={selectedDetailProfile ? favorites.includes(selectedDetailProfile.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onSendRequest={handleSendRequest}
        onReportProfile={(p) => {
          const reason = prompt('रिपोर्ट गर्नुको मुख्य कारण लेख्नुहोस् (उदा: फेक प्रोफाइल, अभद्र सन्देश):');
          if (reason) {
            const newReport: VivahReport = {
              id: `rep_${Date.now()}`,
              reporterUserId: myProfile?.userId || 'user_101',
              reporterName: myProfile?.userFullName || 'User',
              targetProfileId: p.id,
              targetName: p.displayFirstName,
              reason: 'INAPPROPRIATE_CONTENT',
              details: reason,
              status: 'OPEN',
              createdAt: new Date().toISOString()
            };
            saveVivahReport(newReport);
            setReports(getStoredVivahReports());
            alert('प्रतिवेदन/उजुरी एडमिन टोलीकहाँ दर्ता भएको छ।');
          }
        }}
        onBlockProfile={(p) => {
          if (confirm(`${p.displayFirstName} लाई अवरोध (Block) गर्न चाहनुहुन्छ?`)) {
            blockVivahProfile(myProfile?.userId || 'user_101', p.id);
            alert('प्रयोगकर्तालाई सफलतापूर्वक अवरोध गरियो।');
            setIsDetailModalOpen(false);
          }
        }}
        onCheckAstroMilan={(candidate) => {
          setIsDetailModalOpen(false);
          if (onOpenAstroVivahMilan) {
            onOpenAstroVivahMilan(myProfile, candidate);
          } else {
            alert(`ज्योतिषीय मिलान: ${myProfile?.displayFirstName} र ${candidate.displayFirstName} को जन्मकुण्डली गुण मिलान रिपोर्ट तयार पारिँदैछ।`);
          }
        }}
        connectionStatus={
          requests.find(r => 
            (r.senderProfileId === myProfile?.id && r.receiverProfileId === selectedDetailProfile?.id) ||
            (r.senderProfileId === selectedDetailProfile?.id && r.receiverProfileId === myProfile?.id)
          )?.status as any || 'NONE'
        }
      />

      {/* Birth Details & Profile Onboarding Modal */}
      <VivahOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        initialProfile={myProfile}
        onProfileSaved={(p) => {
          handleSaveProfile(p);
          setIsOnboardingOpen(false);
        }}
      />

      {/* Login Gate Modal */}
      {loginGateInfo && (
        <YajamanLoginGateModal
          isOpen={true}
          onClose={() => setLoginGateInfo(null)}
          onOpenLogin={() => {
            setLoginGateInfo(null);
            if (onOpenAuthModal) onOpenAuthModal();
          }}
          onOpenRegister={() => {
            setLoginGateInfo(null);
            if (onOpenAuthModal) onOpenAuthModal();
          }}
          featureName={loginGateInfo.actionName}
          actionMessage={loginGateInfo.message}
        />
      )}
    </div>
  );
};
