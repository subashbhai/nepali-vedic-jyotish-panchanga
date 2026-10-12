import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Camera,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Sun,
  Moon,
  Compass,
  Palette,
  ShieldCheck,
  Edit3,
  CheckCircle2,
  Share2,
  Printer,
  ChevronRight,
  Save,
  X,
  Phone,
  Mail,
  Award,
  Hash,
  AlertTriangle,
  Heart,
  Briefcase,
  Coins,
  GraduationCap,
  Activity,
  Users as UsersIcon,
  HelpCircle,
  FileText
} from 'lucide-react';
import { 
  BirthDetails, 
  PanchangaData, 
  PlanetPosition, 
  OrganizationProfile 
} from '../../types/astrology';
import { RBACSession, updateRBACUserProfile, getStoredRBACUsers } from '../../db/rbacStore';
import { saveUserPersonalBirthProfile, getUserPersonalBirthProfile, saveProfile } from '../../db/profileStore';
import { RASHI_DATA } from '../../utils/astroCalculations';
import { convertADToBSFull, convertBSToADFull, NEPALI_MONTH_NAMES } from '../../utils/bsCalendarData';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';
import {
  generatePersonalizedDailyRashifal,
  generatePersonalizedMonthlyRashifal,
  generatePersonalizedYearlyRashifal,
  PersonalizedDailyResult,
  PersonalizedMonthlyResult,
  PersonalizedYearlyResult,
  getAvailableYearlyArchives,
  BALANANDA_RASHIFAL_UPDATED_EVENT
} from '../../utils/personalizedRashifalEngine';
import { ImageCropModal } from '../ImageCropModal';

interface UserDashboardViewProps {
  rbacSession: RBACSession | null;
  activeProfile: BirthDetails | null;
  todayPanchanga: PanchangaData;
  todayAD: string;
  todayBS: string;
  transitPlanets?: PlanetPosition[];
  orgProfile: OrganizationProfile;
  onNavigateHome: () => void;
  onNavigateTab: (tab: any) => void;
  onUpdateProfile: (updated: BirthDetails) => void;
}

export const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  rbacSession,
  activeProfile,
  todayPanchanga,
  todayAD,
  todayBS,
  transitPlanets = [],
  orgProfile,
  onNavigateHome,
  onNavigateTab,
  onUpdateProfile,
}) => {
  // ── Profile Resolution ──
  const currentUserId = rbacSession?.userId || activeProfile?.clientId || 'user_self';
  const currentUserName = rbacSession?.fullName || activeProfile?.name || 'प्रयोगकर्ता';
  const currentUserPhone = rbacSession?.phone || activeProfile?.phone || rbacSession?.username || '';
  const currentUserEmail = (rbacSession as any)?.email || activeProfile?.email || '';

  // Local state for profile and photo
  const [profileState, setProfileState] = useState<BirthDetails>(() => {
    const found = getUserPersonalBirthProfile(currentUserId, currentUserName, currentUserPhone);
    if (found) return found;
    return activeProfile || {
      id: `user_profile_${currentUserId}`,
      name: currentUserName,
      gender: 'पुरुष',
      dateBS: '२०४६-०५-१५',
      dateAD: '1989-08-30',
      time: '०६:३०',
      location: {
        name: 'काठमाडौँ, नेपाल',
        district: 'काठमाडौँ',
        province: 'बागमती',
        country: 'नेपाल',
        latitude: 27.7172,
        longitude: 85.3240,
        timeZone: 5.75,
      },
      moonRashi: 'कन्या',
      photoUrl: rbacSession?.photoUrl || '',
      clientId: currentUserId,
      notes: 'व्यक्तिगत प्रोफाइल'
    };
  });

  const [photoUrl, setPhotoUrl] = useState<string>(
    profileState.photoUrl || rbacSession?.photoUrl || ''
  );

  // Sync state if external profile/session changes
  useEffect(() => {
    const prof = getUserPersonalBirthProfile(currentUserId, currentUserName, currentUserPhone);
    if (prof) {
      setProfileState(prof);
      if (prof.photoUrl) setPhotoUrl(prof.photoUrl);
    } else if (activeProfile) {
      setProfileState(activeProfile);
      if (activeProfile.photoUrl) setPhotoUrl(activeProfile.photoUrl);
    }
  }, [currentUserId, currentUserName, currentUserPhone, activeProfile]);

  useEffect(() => {
    if (rbacSession?.photoUrl && !photoUrl) {
      setPhotoUrl(rbacSession.photoUrl);
    }
  }, [rbacSession?.photoUrl]);

  // Image Crop Modal
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Profile Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: profileState.name || currentUserName,
    phone: currentUserPhone,
    email: currentUserEmail,
    gender: profileState.gender || 'पुरुष',
    dateBS: profileState.dateBS || '२०४६-०५-१५',
    time: profileState.time || '०६:३०',
    district: profileState.location?.district || profileState.location?.name || 'काठमाडौँ',
    moonRashi: profileState.moonRashi || 'कन्या',
    gotra: profileState.gotra || ''
  });

  const handleOpenEditModal = () => {
    setEditForm({
      name: profileState.name || currentUserName,
      phone: currentUserPhone,
      email: currentUserEmail,
      gender: profileState.gender || 'पुरुष',
      dateBS: profileState.dateBS || '२०४६-०५-१५',
      time: profileState.time || '०६:३०',
      district: profileState.location?.district || profileState.location?.name || 'काठमाडौँ',
      moonRashi: profileState.moonRashi || 'कन्या',
      gotra: profileState.gotra || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    let convertedAD = profileState.dateAD || '1989-08-30';
    try {
      const parts = editForm.dateBS.split('-').map((p) => parseInt(p, 10));
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        convertedAD = convertBSToADFull(parts[0], parts[1], parts[2]);
      }
    } catch {}

    const updated: BirthDetails = {
      ...profileState,
      name: editForm.name.trim() || currentUserName,
      phone: editForm.phone.trim(),
      email: editForm.email.trim(),
      gender: editForm.gender as any,
      dateBS: editForm.dateBS.trim(),
      dateAD: convertedAD,
      time: editForm.time.trim() || '०६:३०',
      location: {
        ...profileState.location,
        name: `${editForm.district}, नेपाल`,
        district: editForm.district,
        country: 'नेपाल',
        latitude: profileState.location?.latitude || 27.7172,
        longitude: profileState.location?.longitude || 85.3240,
        timeZone: 5.75
      },
      moonRashi: editForm.moonRashi,
      gotra: editForm.gotra.trim(),
      photoUrl: photoUrl,
      clientId: currentUserId,
      updatedAt: new Date().toISOString()
    };

    setProfileState(updated);
    saveUserPersonalBirthProfile(currentUserId, updated);
    saveProfile(updated);
    onUpdateProfile(updated);

    // Sync RBAC account if logged in
    if (rbacSession) {
      updateRBACUserProfile(currentUserId, {
        fullName: updated.name,
        phone: updated.phone,
        email: updated.email,
        photoUrl: photoUrl,
        birthDetails: updated
      });
    }

    setIsEditModalOpen(false);
  };

  const handleSaveCroppedPhoto = (newPhotoUrl: string) => {
    setPhotoUrl(newPhotoUrl);
    const updated: BirthDetails = {
      ...profileState,
      photoUrl: newPhotoUrl,
      updatedAt: new Date().toISOString()
    };
    setProfileState(updated);
    saveUserPersonalBirthProfile(currentUserId, updated);
    saveProfile(updated);
    onUpdateProfile(updated);

    if (rbacSession) {
      updateRBACUserProfile(currentUserId, {
        photoUrl: newPhotoUrl,
        birthDetails: updated
      });
    }
    setIsPhotoModalOpen(false);
  };

  const handleDeletePhoto = () => {
    setPhotoUrl('');
    const updated: BirthDetails = {
      ...profileState,
      photoUrl: '',
      updatedAt: new Date().toISOString()
    };
    setProfileState(updated);
    saveUserPersonalBirthProfile(currentUserId, updated);
    saveProfile(updated);
    onUpdateProfile(updated);

    if (rbacSession) {
      updateRBACUserProfile(currentUserId, {
        photoUrl: '',
        birthDetails: updated
      });
    }
    setIsPhotoModalOpen(false);
  };

  // ── Astrological Personal Calculations ──
  const currentBS = useMemo(() => convertADToBSFull(new Date(todayAD)), [todayAD]);
  const [activeTimeframe, setActiveTimeframe] = useState<'daily' | 'monthly' | 'yearly'>('daily');

  // Resolved Moon Sign ID
  const selectedRashiId = useMemo(() => {
    if (profileState.moonRashi) {
      const found = RASHI_DATA.find((r) => r.name === profileState.moonRashi);
      if (found) return found.id;
    }
    return 6; // Kanya
  }, [profileState.moonRashi]);

  // Compute Daily Rashifal
  const dailyResult: PersonalizedDailyResult = useMemo(() => {
    return generatePersonalizedDailyRashifal(
      profileState,
      todayPanchanga,
      transitPlanets,
      selectedRashiId,
      currentBS.formattedBS
    );
  }, [profileState, todayPanchanga, transitPlanets, selectedRashiId, currentBS.formattedBS]);

  // Compute Monthly Rashifal
  const monthlyResult: PersonalizedMonthlyResult = useMemo(() => {
    return generatePersonalizedMonthlyRashifal(
      profileState,
      currentBS.year,
      currentBS.month,
      selectedRashiId
    );
  }, [profileState, currentBS.year, currentBS.month, selectedRashiId]);

  // Compute Yearly Rashifal
  const yearlyResult: PersonalizedYearlyResult = useMemo(() => {
    return generatePersonalizedYearlyRashifal(
      profileState,
      currentBS.year,
      selectedRashiId
    );
  }, [profileState, currentBS.year, selectedRashiId]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#12100E] text-stone-900 dark:text-stone-100 py-6 px-3 sm:px-6 max-w-7xl mx-auto space-y-6">

      {/* ── 1. TOP PROFILE HEADER & AVATAR EDIT ── */}
      <div className="bg-gradient-to-r from-[#2A1509] via-[#4A1E0C] to-[#1C1917] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-600/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
            {/* Profile Picture with Camera Badge */}
            <div className="relative group cursor-pointer" onClick={() => setIsPhotoModalOpen(true)}>
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={profileState.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-amber-400 shadow-xl group-hover:brightness-95 transition-all"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 font-black text-4xl flex items-center justify-center border-4 border-amber-300 shadow-xl group-hover:scale-105 transition-transform">
                  {(profileState.name || 'सु').charAt(0)}
                </div>
              )}
              <div 
                className="absolute -bottom-2 -right-2 bg-amber-500 hover:bg-amber-400 text-stone-950 p-2 rounded-2xl shadow-lg border-2 border-stone-900 transition-transform group-hover:scale-110"
                title="फोटो परिवर्तन / अपलोड गर्नुहोस्"
              >
                <Camera className="w-4 h-4" />
              </div>
            </div>

            {/* User Personal Details */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black font-serif text-amber-100 tracking-tight">
                  {profileState.name}
                </h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  {rbacSession?.roleNameNepali || 'यजमान / प्रयोगकर्ता'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  प्रमाणित खाता
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-stone-300 font-medium pt-1">
                <span className="flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-amber-400" />
                  जन्मराशि: <strong className="text-amber-200">{profileState.moonRashi}</strong>
                </span>
                {profileState.gotra && (
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    गोत्र: <strong className="text-amber-200">{profileState.gotra}</strong>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  जन्म मिति: <strong className="text-amber-200">{profileState.dateBS || 'वि.सं. २०४६-०५-१५'}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  स्थान: <strong className="text-amber-200">{profileState.location?.name || 'काठमाडौँ'}</strong>
                </span>
              </div>

              {(currentUserPhone || currentUserEmail) && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-stone-400 pt-0.5 font-mono">
                  {currentUserPhone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-amber-400/80" />
                      {currentUserPhone}
                    </span>
                  )}
                  {currentUserEmail && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-amber-400/80" />
                      {currentUserEmail}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Edit Profile Action Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleOpenEditModal}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>प्रोफाइल सम्पादन / विवरण परिवर्तन</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('yajaman')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>यजमान सेवा मञ्च ↗</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. QUICK PERSONAL LUCKY METRICS BAR ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-amber-200/80 dark:border-stone-800 text-center shadow-xs">
          <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-bold">आजको शुभ रङ्ग</span>
          <strong className="text-amber-800 dark:text-amber-300 text-sm block mt-1 font-serif">
            {dailyResult.item.luckyColor}
          </strong>
        </div>

        <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-amber-200/80 dark:border-stone-800 text-center shadow-xs">
          <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-bold">आजको शुभ अङ्क</span>
          <strong className="text-stone-900 dark:text-stone-100 text-sm block mt-1 font-serif">
            {dailyResult.item.luckyNumber}
          </strong>
        </div>

        <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-amber-200/80 dark:border-stone-800 text-center shadow-xs">
          <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-bold">शुभ दिशा</span>
          <strong className="text-stone-900 dark:text-stone-100 text-sm block mt-1 font-serif">
            {dailyResult.item.luckyDirection}
          </strong>
        </div>

        <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-amber-200/80 dark:border-stone-800 text-center shadow-xs">
          <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-bold">अनुकूल राम्रो समय</span>
          <strong className="text-emerald-700 dark:text-emerald-400 text-xs block mt-1 truncate">
            {dailyResult.item.favorableTime.split('र')[0]}
          </strong>
        </div>

        <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-amber-200/80 dark:border-stone-800 text-center shadow-xs">
          <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-bold">चन्द्रबल स्थिति</span>
          <strong className="text-amber-700 dark:text-amber-300 text-xs block mt-1">
            {dailyResult.chandrabala?.statusNepali || 'शुभ चन्द्रबल'}
          </strong>
        </div>

        <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-amber-200/80 dark:border-stone-800 text-center shadow-xs">
          <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-bold">समग्र दिनको फल</span>
          <strong className="text-emerald-700 dark:text-emerald-400 text-xs block mt-1">
            {dailyResult.item.overallVerdict}
          </strong>
        </div>
      </div>

      {/* ── 3. TIMEFRAME SELECTOR (दैनिक / मासिक / वार्षिक राशिफल) ── */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-amber-200/80 dark:border-stone-800 p-2 flex items-center justify-between flex-wrap gap-2 shadow-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold px-2 text-stone-500 dark:text-stone-400">
            राशिफल समयावधि:
          </span>
          <button
            type="button"
            onClick={() => setActiveTimeframe('daily')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTimeframe === 'daily'
                ? 'bg-[#7A1C1C] text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            ☀️ आजको दैनिक राशिफल
          </button>
          <button
            type="button"
            onClick={() => setActiveTimeframe('monthly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTimeframe === 'monthly'
                ? 'bg-[#7A1C1C] text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            🌙 यस महिनाको मासिक राशिफल ({currentBS.monthName})
          </button>
          <button
            type="button"
            onClick={() => setActiveTimeframe('yearly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTimeframe === 'yearly'
                ? 'bg-[#7A1C1C] text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            🪐 वर्ष {toDevanagariNumerals(currentBS.year)} को वार्षिक राशिफल
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            title="प्रिन्ट गर्नुहोस्"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">प्रिन्ट</span>
          </button>
        </div>
      </div>

      {/* ── 4. RASHIFAL CONTENT BLOCK ── */}
      {activeTimeframe === 'daily' && (
        <div className="space-y-5">
          {/* Daily Synthesis Notice */}
          <div className="p-4 bg-amber-50 dark:bg-stone-900 rounded-2xl border border-amber-300/80 dark:border-stone-800 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                {profileState.name} को लागि आजको व्यक्तिगत ज्योतिषीय संश्लेषण:
              </h4>
              <p className="leading-relaxed">
                {dailyResult.personalSynthesis}
              </p>
            </div>
          </div>

          {/* Comprehensive Daily Facets Grid (8 Areas) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. कार्यक्षेत्र तथा व्यवसाय */}
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-300">
                <Briefcase className="w-4 h-4 text-amber-600" />
                <span>कार्यक्षेत्र तथा व्यवसाय (Career):</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 text-justify">
                {dailyResult.item.career}
              </p>
            </div>

            {/* 2. आर्थिक अवस्था र धनसम्बन्धी सम्भावना */}
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-300">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>आर्थिक अवस्था र धन सम्भावना (Finance):</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 text-justify">
                {dailyResult.item.finance}
              </p>
            </div>

            {/* 3. प्रेम, दाम्पत्य तथा पारिवारिक सम्बन्ध */}
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-300">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>प्रेम, दाम्पत्य तथा पारिवारिक सम्बन्ध (Family & Relationship):</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 text-justify">
                {dailyResult.item.loveAndFamily}
              </p>
            </div>

            {/* 4. अध्ययन तथा बौद्धिक कार्य */}
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-300">
                <GraduationCap className="w-4 h-4 text-indigo-500" />
                <span>अध्ययन, परीक्षा तथा बौद्धिक कार्य (Education):</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 text-justify">
                {dailyResult.item.education}
              </p>
            </div>

            {/* 5. स्वास्थ्य तथा दिनचर्याका सामान्य सुझाव */}
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-300">
                <Activity className="w-4 h-4 text-cyan-600" />
                <span>स्वास्थ्य तथा दिनचर्या (Health):</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 text-justify">
                {dailyResult.item.health}
              </p>
            </div>

            {/* 6. सावधानी अपनाउनुपर्ने समय/नराम्रो पक्ष */}
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-stone-900 border border-rose-200 dark:border-rose-900/40 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-900 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>नराम्रो/सावधानी अपनाउनुपर्ने समय (Caution Timing):</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 text-justify">
                {dailyResult.item.cautionTime}
              </p>
            </div>
          </div>

          {/* Spiritual Remedies & Mantra Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50 dark:from-stone-900 dark:via-stone-900 dark:to-stone-900 border-2 border-amber-300/80 dark:border-stone-800 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-950 dark:text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>आजका वैदिक उपायहरू तथा मन्त्र जप (Vedic Remedies):</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              <div className="bg-white dark:bg-stone-800/80 p-4 rounded-xl border border-amber-200 dark:border-stone-700 shadow-xs">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold block mb-1">
                  दैनिक वैदिक मन्त्र जप:
                </span>
                <p className="font-serif font-bold text-amber-950 dark:text-amber-200 text-sm">
                  {dailyResult.item.mantra}
                </p>
              </div>

              <div className="bg-white dark:bg-stone-800/80 p-4 rounded-xl border border-amber-200 dark:border-stone-700 shadow-xs">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold block mb-1">
                  सत्कर्म, दान तथा शान्ति उपाय:
                </span>
                <p className="text-stone-800 dark:text-stone-200 text-xs leading-relaxed">
                  {dailyResult.item.remedy}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTimeframe === 'monthly' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-amber-200/80 dark:border-stone-800 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
            <h3 className="font-bold text-lg font-serif text-amber-950 dark:text-amber-300">
              {currentBS.monthName} महिनाको समग्र फलादेश ({profileState.moonRashi} राशि)
            </h3>
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 rounded-xl text-xs font-bold">
              {monthlyResult.item.overallScore}% अनुकूलता
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed text-justify">
            {monthlyResult.item.generalOverview}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
              <span className="text-[10px] text-stone-500 font-bold block">व्यापार तथा नोकरी</span>
              <p className="text-xs text-stone-800 dark:text-stone-200 mt-1">{monthlyResult.item.careerFinance}</p>
            </div>
            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
              <span className="text-[10px] text-stone-500 font-bold block">स्वास्थ्य तथा दिनचर्या</span>
              <p className="text-xs text-stone-800 dark:text-stone-200 mt-1">{monthlyResult.item.health}</p>
            </div>
            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
              <span className="text-[10px] text-stone-500 font-bold block">मासिक वैदिक उपाय</span>
              <p className="text-xs text-amber-900 dark:text-amber-300 font-medium mt-1">{monthlyResult.item.monthlyRemedy}</p>
            </div>
          </div>
        </div>
      )}

      {activeTimeframe === 'yearly' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-amber-200/80 dark:border-stone-800 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
            <h3 className="font-bold text-lg font-serif text-amber-950 dark:text-amber-300">
              वर्ष {toDevanagariNumerals(currentBS.year)} को बृहत् वार्षिक फलादेश ({profileState.moonRashi} राशि)
            </h3>
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 rounded-xl text-xs font-bold">
              {yearlyResult.item.overallScore}% शुभता
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed text-justify">
            {yearlyResult.item.yearlyTheme}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-1">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300">वार्षिक करियर तथा आर्थिक अवसर</span>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">{yearlyResult.item.careerFinance}</p>
            </div>
            <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-1">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300">वार्षिक वैदिक शान्ति तथा ग्रह उपाय</span>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">{yearlyResult.item.yearlyRemedy}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. IMAGE CROP / UPLOAD MODAL ── */}
      <ImageCropModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        titleNepali="प्रयोगकर्ता प्रोफाइल तस्बिर सम्पादन / क्रप गर्नुहोस्"
        currentPhotoUrl={photoUrl}
        onSavePhoto={handleSaveCroppedPhoto}
        onDeletePhoto={handleDeletePhoto}
        isPrivateInitial={false}
        allowPrivacyToggle={false}
      />

      {/* ── 6. PROFILE EDIT MODAL ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white dark:bg-stone-900 border-2 border-amber-300 dark:border-stone-700 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300">
                  <User className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100">
                  व्यक्तिगत प्रोफाइल तथा जन्म विवरण सम्पादन
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  पूरा नाम (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="तपाईंको पूरा नाम"
                  className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-[#7A1C1C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    सम्पर्क फोन / मोबाइल नम्बर
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="९८xxxxxxxx"
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-[#7A1C1C]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    ईमेल (Email)
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-[#7A1C1C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    लिङ्ग (Gender)
                  </label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-[#7A1C1C]"
                  >
                    <option value="पुरुष">पुरुष (Male)</option>
                    <option value="महिला">महिला (Female)</option>
                    <option value="अन्य">अन्य (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    गोत्र (Gotra)
                  </label>
                  <input
                    type="text"
                    value={editForm.gotra}
                    onChange={(e) => setEditForm({ ...editForm, gotra: e.target.value })}
                    placeholder="उदा: कश्यप, भारद्वाज..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-[#7A1C1C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    जन्म मिति (वि.सं.) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.dateBS}
                    onChange={(e) => setEditForm({ ...editForm, dateBS: e.target.value })}
                    placeholder="२०४६-०५-१५"
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-[#7A1C1C]"
                  />
                  <span className="text-[10px] text-stone-400 mt-0.5 block">ढाँचा: वर्ष-महिना-गते</span>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    जन्म समय (Birth Time)
                  </label>
                  <input
                    type="text"
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                    placeholder="उदा: ०६:३०"
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-[#7A1C1C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    स्थान (जिल्ला / शहर)
                  </label>
                  <input
                    type="text"
                    value={editForm.district}
                    onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                    placeholder="उदा: काठमाडौँ, पोखरा..."
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-[#7A1C1C]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    जन्म चन्द्रराशि (Moon Sign) *
                  </label>
                  <select
                    value={editForm.moonRashi}
                    onChange={(e) => setEditForm({ ...editForm, moonRashi: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-[#7A1C1C]"
                  >
                    {RASHI_DATA.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.symbol} {r.name} राशि ({r.englishName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#7A1C1C] to-[#92400E] hover:brightness-110 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>सुरक्षित गर्नुहोस्</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
