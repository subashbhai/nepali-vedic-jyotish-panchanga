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
  FileText,
  BookOpen,
  Video,
  Music,
  Bookmark,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { 
  BirthDetails, 
  PanchangaData, 
  PlanetPosition, 
  OrganizationProfile 
} from '../../types/astrology';
import { RBACSession, updateRBACUserProfile, getStoredRBACUsers } from '../../db/rbacStore';
import { saveUserPersonalBirthProfile, getUserPersonalBirthProfile, saveProfile, getLiveCurrentMomentProfile } from '../../db/profileStore';
import { RASHI_DATA } from '../../utils/astroCalculations';
import { getCachedAstroCalculation } from '../../utils/astroCache';
import { WORLD_LOCATIONS_DATA } from '../../data/worldLocations';
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
import { getUnifiedNativeDailyPrediction, UnifiedNativeDailyPrediction } from '../../utils/unifiedAstroFaladeshChain';
import { ImageCropModal } from '../ImageCropModal';
import { FaladeshView } from '../FaladeshView';
import { calculateGocharAndSadeSati } from '../../utils/gocharEngine';

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
    if (activeProfile && activeProfile.id !== 'live_current_moment') {
      return activeProfile;
    }
    const liveProf = getLiveCurrentMomentProfile();
    return {
      ...liveProf,
      id: `user_profile_${currentUserId}`,
      name: currentUserName,
      clientId: currentUserId,
      photoUrl: rbacSession?.photoUrl || '',
      notes: 'व्यक्तिगत प्रोफाइल'
    };
  });

  // ── Dynamic Astrological Engine Calculation for Active Profile ──
  const userAstroCalc = useMemo(() => {
    let ad = profileState.dateAD;
    if (!ad && profileState.dateBS) {
      try {
        const parts = profileState.dateBS.split('-').map((p) => parseInt(p, 10));
        if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
          ad = convertBSToADFull(parts[0], parts[1], parts[2]);
        }
      } catch {}
    }
    if (!ad) return null;
    const timeStr = profileState.time && profileState.time.trim() !== '' ? profileState.time : '12:00';
    const lat = profileState.location?.latitude ?? 27.7172;
    const lng = profileState.location?.longitude ?? 85.3240;
    const tz = profileState.location?.timeZone ?? 5.75;
    try {
      return getCachedAstroCalculation(ad, timeStr, lat, lng, tz, 'Lahiri');
    } catch (e) {
      console.warn('Astro calculation error in dashboard:', e);
      return null;
    }
  }, [profileState.dateAD, profileState.dateBS, profileState.time, profileState.location]);

  const computedMoonRashiName = userAstroCalc?.moon?.rashiName || profileState.moonRashi || 'मेष';
  const computedLagnaRashiName = userAstroCalc?.lagna?.rashiName || profileState.lagnaRashi || 'मेष';
  const computedNakshatraName = userAstroCalc?.moon?.nakshatraName || profileState.nakshatra || '';
  const selectedRashiId = useMemo(() => {
    if (userAstroCalc?.moon?.rashiId) return userAstroCalc.moon.rashiId;
    const found = RASHI_DATA.find((r) => r.name === computedMoonRashiName);
    return found ? found.id : 1;
  }, [userAstroCalc, computedMoonRashiName]);

  // Synchronize computed Moon and Lagna if store had stale or uncomputed values
  useEffect(() => {
    if (
      userAstroCalc?.moon?.rashiName &&
      (profileState.moonRashi !== userAstroCalc.moon.rashiName ||
        profileState.lagnaRashi !== userAstroCalc.lagna?.rashiName)
    ) {
      const synced: BirthDetails = {
        ...profileState,
        moonRashi: userAstroCalc.moon.rashiName,
        lagnaRashi: userAstroCalc.lagna?.rashiName,
        nakshatra: userAstroCalc.moon.nakshatraName,
      };
      setProfileState(synced);
      saveUserPersonalBirthProfile(currentUserId, synced);
      saveProfile(synced);
      onUpdateProfile(synced);
    }
  }, [userAstroCalc?.moon?.rashiName, userAstroCalc?.lagna?.rashiName]);

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
    moonRashi: computedMoonRashiName,
    gotra: profileState.gotra || ''
  });

  // Real-time Astro calculation inside Edit Modal
  const editCalculatedAstro = useMemo(() => {
    let ad = '';
    try {
      const parts = editForm.dateBS.split('-').map((p) => parseInt(p, 10));
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        ad = convertBSToADFull(parts[0], parts[1], parts[2]);
      }
    } catch {}
    if (!ad) return null;
    const timeStr = editForm.time && editForm.time.trim() !== '' ? editForm.time : '12:00';
    let lat = profileState.location?.latitude || 27.7172;
    let lng = profileState.location?.longitude || 85.3240;
    let tz = profileState.location?.timeZone || 5.75;
    if (editForm.district) {
      const cleanDist = editForm.district.trim().toLowerCase();
      const matched = WORLD_LOCATIONS_DATA.find(
        (l) =>
          (l.district && l.district.toLowerCase() === cleanDist) ||
          (l.name && l.name.toLowerCase().includes(cleanDist)) ||
          (l.englishName && l.englishName.toLowerCase().includes(cleanDist))
      );
      if (matched) {
        lat = matched.latitude;
        lng = matched.longitude;
        tz = matched.timeZone || 5.75;
      }
    }
    try {
      return getCachedAstroCalculation(ad, timeStr, lat, lng, tz, 'Lahiri');
    } catch {
      return null;
    }
  }, [editForm.dateBS, editForm.time, editForm.district, profileState.location]);

  const handleOpenEditModal = () => {
    const currentLocDistrict = profileState.location?.district || profileState.location?.name || 'काठमाडौँ';
    const liveProf = getLiveCurrentMomentProfile();
    setEditForm({
      name: profileState.name || currentUserName,
      phone: currentUserPhone,
      email: currentUserEmail,
      gender: profileState.gender || 'पुरुष',
      dateBS: profileState.dateBS || liveProf.dateBS,
      time: profileState.time || liveProf.time || '०६:३०',
      district: currentLocDistrict,
      moonRashi: computedMoonRashiName,
      gotra: profileState.gotra || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    let convertedAD = profileState.dateAD || getLiveCurrentMomentProfile().dateAD;
    try {
      const parts = editForm.dateBS.split('-').map((p) => parseInt(p, 10));
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        convertedAD = convertBSToADFull(parts[0], parts[1], parts[2]);
      }
    } catch {}

    let lat = profileState.location?.latitude || 27.7172;
    let lng = profileState.location?.longitude || 85.3240;
    let tz = profileState.location?.timeZone || 5.75;
    let locName = `${editForm.district}, नेपाल`;

    if (editForm.district) {
      const cleanDist = editForm.district.trim().toLowerCase();
      const matched = WORLD_LOCATIONS_DATA.find(
        (l) =>
          (l.district && l.district.toLowerCase() === cleanDist) ||
          (l.name && l.name.toLowerCase().includes(cleanDist)) ||
          (l.englishName && l.englishName.toLowerCase().includes(cleanDist))
      );
      if (matched) {
        lat = matched.latitude;
        lng = matched.longitude;
        tz = matched.timeZone || 5.75;
        locName = matched.name;
      }
    }

    const calcResult = editCalculatedAstro;
    const finalMoonRashi = calcResult?.moon?.rashiName || editForm.moonRashi || profileState.moonRashi;
    const finalLagnaRashi = calcResult?.lagna?.rashiName || profileState.lagnaRashi;
    const finalNakshatra = calcResult?.moon?.nakshatraName || profileState.nakshatra;

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
        name: locName,
        district: editForm.district,
        country: 'नेपाल',
        latitude: lat,
        longitude: lng,
        timeZone: tz
      },
      moonRashi: finalMoonRashi,
      lagnaRashi: finalLagnaRashi,
      nakshatra: finalNakshatra,
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
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'faladesh'>('overview');

  // Current-Time Kundali calculation for Dashboard Faladesh (Asia/Kathmandu local time)
  const liveMomentProfile = useMemo(() => {
    return getLiveCurrentMomentProfile();
  }, []);

  const faladeshAstroData = useMemo(() => {
    const prof = liveMomentProfile;
    const ad = prof.dateAD || todayAD;
    const time = prof.time || '12:00';
    const lat = prof.location?.latitude ?? 27.7172;
    const lng = prof.location?.longitude ?? 85.3240;
    const tz = prof.location?.timeZone ?? 5.75;
    try {
      const calc = getCachedAstroCalculation(ad, time, lat, lng, tz, 'Lahiri');
      const gch = calculateGocharAndSadeSati(calc.moon, transitPlanets, todayAD);
      return {
        profile: prof,
        lagna: calc.lagna,
        planets: calc.planets,
        dasha: calc.dasha,
        yogas: calc.yogas,
        panchanga: calc.panchanga || todayPanchanga,
        sadeSatiStatus: gch.sadeSati?.status || 'अनुकूल',
        gochar: gch
      };
    } catch (err) {
      console.warn('Faladesh astro computation error in Dashboard:', err);
      return null;
    }
  }, [liveMomentProfile, todayAD, transitPlanets, todayPanchanga]);

  const currentBS = useMemo(() => convertADToBSFull(new Date(todayAD)), [todayAD]);
  const [activeTimeframe, setActiveTimeframe] = useState<'daily' | 'monthly' | 'yearly'>('daily');

  // Master Astrological Chain System (0.1% Precision, Zero Discrepancy)
  const unifiedPrediction: UnifiedNativeDailyPrediction = useMemo(() => {
    return getUnifiedNativeDailyPrediction(
      profileState,
      todayPanchanga,
      transitPlanets,
      currentBS.formattedBS
    );
  }, [profileState, todayPanchanga, transitPlanets, currentBS.formattedBS]);

  // Compute Daily Rashifal strictly using the user's authentic calculated Moon Sign
  const dailyResult: PersonalizedDailyResult = useMemo(() => {
    return generatePersonalizedDailyRashifal(
      profileState,
      todayPanchanga,
      transitPlanets,
      selectedRashiId,
      currentBS.formattedBS
    );
  }, [profileState, todayPanchanga, transitPlanets, selectedRashiId, currentBS.formattedBS]);

  // Compute Monthly Rashifal strictly using the user's authentic calculated Moon Sign
  const monthlyResult: PersonalizedMonthlyResult = useMemo(() => {
    return generatePersonalizedMonthlyRashifal(
      profileState,
      currentBS.year,
      currentBS.month,
      selectedRashiId
    );
  }, [profileState, currentBS.year, currentBS.month, selectedRashiId]);

  // Compute Yearly Rashifal strictly using the user's authentic calculated Moon Sign
  const yearlyResult: PersonalizedYearlyResult = useMemo(() => {
    return generatePersonalizedYearlyRashifal(
      profileState,
      currentBS.year,
      selectedRashiId
    );
  }, [profileState, currentBS.year, selectedRashiId]);

  // ── Digital Library & User Favorites State ──
  const [favoriteTab, setFavoriteTab] = useState<'all' | 'books' | 'videos' | 'audios' | 'saved'>('all');
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [savedFavorites, setSavedFavorites] = useState<{
    books: any[];
    videos: any[];
    audios: any[];
    articles: any[];
    mantras: any[];
  }>({ books: [], videos: [], audios: [], articles: [], mantras: [] });
  const [isFavoriteActionBusy, setIsFavoriteActionBusy] = useState(false);

  // Fetch Library Items & User Favorites
  useEffect(() => {
    fetch('/api/library/items')
      .then((r) => r.json())
      .then((d) => {
        if (d && d.success && Array.isArray(d.items)) {
          setLibraryItems(d.items);
        }
      })
      .catch(() => {});

    if (currentUserId) {
      fetch(`/api/users/${encodeURIComponent(currentUserId)}/favorites`)
        .then((r) => r.json())
        .then((d) => {
          if (d && d.success && d.favorites) {
            setSavedFavorites(d.favorites);
          }
        })
        .catch(() => {});
    }
  }, [currentUserId]);

  const isItemSaved = (itemId: string): boolean => {
    const all = [
      ...(savedFavorites.books || []),
      ...(savedFavorites.videos || []),
      ...(savedFavorites.audios || []),
      ...(savedFavorites.articles || []),
      ...(savedFavorites.mantras || [])
    ];
    return all.some((i: any) => i.id === itemId);
  };

  const handleToggleFavorite = async (item: any) => {
    if (isFavoriteActionBusy) return;
    setIsFavoriteActionBusy(true);

    const typeKey =
      item.type === 'book'
        ? 'books'
        : item.type === 'video'
        ? 'videos'
        : item.type === 'audio'
        ? 'audios'
        : item.type === 'article'
        ? 'articles'
        : 'mantras';

    try {
      const res = await fetch(`/api/users/${encodeURIComponent(currentUserId)}/favorites/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item, itemType: typeKey })
      });
      const data = await res.json();
      if (data && data.success && data.favorites) {
        setSavedFavorites(data.favorites);
      }
    } catch (e) {
      console.warn('Favorite toggle error:', e);
    } finally {
      setIsFavoriteActionBusy(false);
    }
  };

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
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-950 uppercase tracking-wide">
                  खण्ड 'क' (Section A): व्यक्तिगत प्रोफाइल
                </span>
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
                  जन्मराशि: <strong className="text-amber-200">{computedMoonRashiName}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  लग्न: <strong className="text-amber-200">{computedLagnaRashiName}</strong>
                </span>
                {computedNakshatraName && (
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    नक्षत्र: <strong className="text-amber-200">{computedNakshatraName}</strong>
                  </span>
                )}
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
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  समय: <strong className="text-amber-200">{profileState.time || '०६:३०'}</strong>
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

      {/* ── 1.5 SUB-NAVIGATION TABS (OVERVIEW vs FALADESH) ── */}
      <div className="flex flex-wrap items-center gap-2.5 bg-white dark:bg-stone-900 p-2 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <button
          type="button"
          onClick={() => setDashboardTab('overview')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            dashboardTab === 'overview'
              ? 'bg-gradient-to-r from-[#7A1C1C] to-[#92400E] text-white shadow-md'
              : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>मेरो राशिफल तथा सिंहावलोकन</span>
        </button>
        <button
          type="button"
          onClick={() => setDashboardTab('faladesh')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            dashboardTab === 'faladesh'
              ? 'bg-gradient-to-r from-[#7A1C1C] to-[#92400E] text-white shadow-md'
              : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Compass className="w-4 h-4 text-amber-300" />
          <span>वैदिक फलादेश (Current-Time Kundali)</span>
        </button>
      </div>

      {dashboardTab === 'faladesh' ? (
        <div className="space-y-4 animate-in fade-in">
          {faladeshAstroData ? (
            <FaladeshView
              profile={faladeshAstroData.profile}
              lagna={faladeshAstroData.lagna}
              planets={faladeshAstroData.planets}
              panchanga={faladeshAstroData.panchanga}
              yogas={faladeshAstroData.yogas}
              dasha={faladeshAstroData.dasha}
              sadeSatiStatus={faladeshAstroData.sadeSatiStatus}
              gochar={faladeshAstroData.gochar}
              hideNewKundali={true}
              hidePrint={true}
            />
          ) : (
            <div className="p-8 text-center text-stone-500 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
              फलादेश गणना हुँदैछ, कृपया केही क्षण प्रतिक्षा गर्नुहोस्...
            </div>
          )}
        </div>
      ) : (
        <>
      {/* ── 2. QUICK PERSONAL LUCKY METRICS BAR ── */}
      {/* ── 2. QUICK PERSONAL LUCKY METRICS BAR (UNIFIED ZERO-DISCREPANCY CHAIN) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-amber-200/80 dark:border-stone-800 text-center shadow-xs">
          <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-bold">खण्ड 'ञ' (Sec J): शुभ रङ्ग</span>
          <strong className="text-amber-800 dark:text-amber-300 text-sm block mt-1 font-serif">
            {unifiedPrediction.luckyColor}
          </strong>
        </div>

        <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-amber-200/80 dark:border-stone-800 text-center shadow-xs">
          <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-bold">खण्ड 'ञ' (Sec J): शुभ अङ्क</span>
          <strong className="text-stone-900 dark:text-stone-100 text-sm block mt-1 font-serif">
            {unifiedPrediction.luckyNumber}
          </strong>
        </div>

        <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-amber-200/80 dark:border-stone-800 text-center shadow-xs">
          <span className="text-[10px] text-blue-700 dark:text-blue-400 block font-bold">खण्ड 'ज' (Sec H): शुभ दिशा</span>
          <strong className="text-stone-900 dark:text-stone-100 text-sm block mt-1 font-serif">
            {unifiedPrediction.luckyDirection}
          </strong>
        </div>

        <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-amber-200/80 dark:border-stone-800 text-center shadow-xs">
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-bold">खण्ड 'ज' (Sec H): अनुकूल समय</span>
          <strong className="text-emerald-700 dark:text-emerald-400 text-xs block mt-1 truncate">
            {unifiedPrediction.favorableTime.split('र')[0]}
          </strong>
        </div>

        <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-amber-200/80 dark:border-stone-800 text-center shadow-xs">
          <span className="text-[10px] text-purple-700 dark:text-purple-400 block font-bold">खण्ड 'ङ' (Sec E): चन्द्रबल स्थिति</span>
          <strong className="text-amber-700 dark:text-amber-300 text-xs block mt-1">
            {unifiedPrediction.chandrabala.houseNepali} ({unifiedPrediction.chandrabala.auspiciousLevel})
          </strong>
        </div>

        <div className="p-4 bg-white dark:bg-stone-900 rounded-2xl border border-amber-200/80 dark:border-stone-800 text-center shadow-xs">
          <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-bold">खण्ड 'घ' (Sec D): समग्र फल</span>
          <strong className="text-emerald-700 dark:text-emerald-400 text-xs block mt-1">
            {unifiedPrediction.overallVerdict}
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

          {/* Comprehensive Daily Facets Grid (Sections K, L, M, N, I) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* खण्ड 'ट' (Sec K): कार्यक्षेत्र तथा व्यवसाय */}
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-300">
                <Briefcase className="w-4 h-4 text-amber-600" />
                <span>खण्ड 'ट' (Section K): कार्यक्षेत्र तथा व्यवसाय (Career):</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 text-justify">
                {dailyResult.item.career}
              </p>
            </div>

            {/* खण्ड 'ठ' (Sec L): आर्थिक अवस्था र धन सम्भावना */}
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-300">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>खण्ड 'ठ' (Section L): आर्थिक अवस्था र धन सम्भावना (Finance):</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 text-justify">
                {dailyResult.item.finance}
              </p>
            </div>

            {/* खण्ड 'ड' (Sec M): प्रेम, दाम्पत्य तथा पारिवारिक सम्बन्ध */}
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-300">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>खण्ड 'ड' (Section M): प्रेम, दाम्पत्य तथा पारिवारिक सम्बन्ध (Family):</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 text-justify">
                {dailyResult.item.loveAndFamily}
              </p>
            </div>

            {/* खण्ड 'ढ' (Sec N): स्वास्थ्य तथा दिनचर्या */}
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-300">
                <Activity className="w-4 h-4 text-cyan-600" />
                <span>खण्ड 'ढ' (Section N): स्वास्थ्य तथा दिनचर्या (Health & Routine):</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 text-justify">
                {dailyResult.item.health}
              </p>
            </div>

            {/* खण्ड 'झ' (Sec I): सावधानी अपनाउनुपर्ने समय/अशुभ समय तथा राहुकाल */}
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-stone-900 border border-rose-200 dark:border-rose-900/40 space-y-1.5 shadow-xs md:col-span-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-900 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>खण्ड 'झ' (Section I): सावधानी अपनाउनुपर्ने समय/अशुभ समय तथा राहुकाल:</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 text-justify">
                {dailyResult.item.cautionTime}
              </p>
            </div>
          </div>

          {/* Spiritual Remedies & Mantra Box (Sections O & P) */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50 dark:from-stone-900 dark:via-stone-900 dark:to-stone-900 border-2 border-amber-300/80 dark:border-stone-800 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-950 dark:text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>आजका वैदिक उपायहरू तथा मन्त्र जप (Sections O & P):</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              <div className="bg-white dark:bg-stone-800/80 p-4 rounded-xl border border-amber-200 dark:border-stone-700 shadow-xs">
                <span className="text-[10px] text-amber-800 dark:text-amber-400 font-bold block mb-1">
                  खण्ड 'ण' (Section O): दैनिक वैदिक मन्त्र जप तथा शान्ति:
                </span>
                <p className="font-serif font-bold text-amber-950 dark:text-amber-200 text-sm">
                  {dailyResult.item.mantra}
                </p>
              </div>

              <div className="bg-white dark:bg-stone-800/80 p-4 rounded-xl border border-amber-200 dark:border-stone-700 shadow-xs">
                <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold block mb-1">
                  खण्ड 'त' (Section P): दान तथा सत्कर्म उपाय (Remedies & Charity):
                </span>
                <p className="text-stone-800 dark:text-stone-200 text-xs leading-relaxed">
                  {dailyResult.item.remedy}
                </p>
              </div>
            </div>

            {/* Classical Shastric Shlokas & Evidence Section Q */}
            <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-stone-900 dark:to-stone-950 border border-amber-300/80 dark:border-amber-800/80 rounded-2xl space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-amber-200 dark:border-stone-800 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#7A1C1C] dark:text-amber-400 font-serif">
                  <BookOpen className="w-4 h-4" />
                  <span>खण्ड 'थ' (Section Q): शास्त्रीय प्रमाण एवं श्लोक आधार (फलदीपिका, होरा शास्त्र, मुहूर्तचिन्तामणि):</span>
                </div>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                  अविभाज्य शृङ्खला (0.1% सटीकता)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {unifiedPrediction.shastricPramans.map((praman, idx) => (
                  <div key={idx} className="p-3.5 bg-white dark:bg-stone-800/90 rounded-xl border border-amber-200/90 dark:border-stone-700 space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-amber-100 dark:border-stone-700 pb-1.5">
                      <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 font-serif">
                        {praman.title}
                      </span>
                      <span className="text-[9px] text-stone-500 bg-amber-50 dark:bg-stone-900 px-1.5 py-0.5 rounded border border-amber-200/60 dark:border-stone-800">
                        {praman.source.split('(')[0].trim()}
                      </span>
                    </div>
                    <div className="p-2 bg-amber-50/60 dark:bg-stone-900/60 rounded-lg border-l-2 border-[#7A1C1C] text-[11px] font-serif text-stone-900 dark:text-amber-100 whitespace-pre-line leading-relaxed">
                      {praman.sanskrit}
                    </div>
                    <p className="text-[11px] text-stone-700 dark:text-stone-300 leading-normal">
                      <strong>नेपाली भावार्थ: </strong>
                      {praman.meaningNepali}
                    </p>
                    <p className="text-[10px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 p-1.5 rounded border border-emerald-200/60 dark:border-emerald-900/60 leading-tight">
                      <strong>मार्गदर्शन: </strong>
                      {praman.practicalGuidance}
                    </p>
                  </div>
                ))}
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
            {monthlyResult.item.overallSummary || (monthlyResult.item as any).generalOverview}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
              <span className="text-[10px] text-stone-500 font-bold block">व्यापार तथा नोकरी</span>
              <p className="text-xs text-stone-800 dark:text-stone-200 mt-1">{monthlyResult.item.career || monthlyResult.item.finance || (monthlyResult.item as any).careerFinance}</p>
            </div>
            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
              <span className="text-[10px] text-stone-500 font-bold block">स्वास्थ्य तथा दिनचर्या</span>
              <p className="text-xs text-stone-800 dark:text-stone-200 mt-1">{monthlyResult.item.health}</p>
            </div>
            <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
              <span className="text-[10px] text-stone-500 font-bold block">मासिक वैदिक उपाय</span>
              <p className="text-xs text-amber-900 dark:text-amber-300 font-medium mt-1">{monthlyResult.item.spiritualSadhana || (monthlyResult.item as any).monthlyRemedy}</p>
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
            {yearlyResult.item.yearlyOverview || (yearlyResult.item as any).yearlyTheme}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-1">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300">वार्षिक करियर तथा आर्थिक अवसर</span>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">{yearlyResult.item.career || yearlyResult.item.finance || (yearlyResult.item as any).careerFinance}</p>
            </div>
            <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-1">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300">वार्षिक वैदिक शान्ति तथा ग्रह उपाय</span>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">{yearlyResult.item.spiritualRemedies || (yearlyResult.item as any).spiritualGuidance || (yearlyResult.item as any).yearlyRemedy}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. PERSONAL KUNDALI, DASHA & ASTROLOGICAL HIGHLIGHTS ── */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 border border-amber-200/80 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-500 text-stone-950">
                खण्ड 'ख' (Sec B): जन्म कुण्डली
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-blue-500 text-white">
                खण्ड 'ग' (Sec C): पञ्चाङ्ग
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-purple-500 text-white">
                खण्ड 'च' (Sec F): विंशोत्तरी दशा
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-600 text-white">
                खण्ड 'छ' (Sec G): गोचर ग्रह
              </span>
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-[#7A1C1C] dark:text-amber-400 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-600" />
              <span>व्यक्तिगत कुण्डली, विंशोत्तरी दशा तथा शुभ योग विश्लेषण</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              तपाईंको जन्म विवरण अनुसार गणना गरिएको ग्रह स्थिति, नक्षत्र र दशा फल
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateTab('kundali')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-500/30 transition-colors cursor-pointer"
            >
              पूर्ण कुण्डली खोल्नुहोस् ↗
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('dasha')}
              className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold transition-colors cursor-pointer"
            >
              दशा तालिका ↗
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700">
            <span className="text-[10px] text-stone-400 block font-bold">जन्म चन्द्र राशि</span>
            <strong className="text-stone-900 dark:text-stone-100 text-sm mt-0.5 block font-serif">
              {profileState.moonRashi || 'कन्या'} राशि
            </strong>
          </div>
          <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700">
            <span className="text-[10px] text-stone-400 block font-bold">जन्म मिति (वि.सं.)</span>
            <strong className="text-stone-900 dark:text-stone-100 text-sm mt-0.5 block font-serif">
              {profileState.dateBS || '२०४६-०५-१५'}
            </strong>
          </div>
          <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700">
            <span className="text-[10px] text-stone-400 block font-bold">जन्म समय</span>
            <strong className="text-stone-900 dark:text-stone-100 text-sm mt-0.5 block font-serif">
              {profileState.time || '०६:३०'}
            </strong>
          </div>
          <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700">
            <span className="text-[10px] text-stone-400 block font-bold">स्थान (जन्म शहर)</span>
            <strong className="text-stone-900 dark:text-stone-100 text-sm mt-0.5 block truncate font-serif">
              {profileState.location?.name || 'काठमाडौँ'}
            </strong>
          </div>
        </div>
      </div>

      {/* ── 6. MY SAVED FAVORITES & DIGITAL LIBRARY (ग्रन्थ, भिडियो, अडियो मन्त्र) ── */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-7 border border-amber-200/80 dark:border-stone-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 gap-3">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-600" />
              <span>मेरो मनपर्ने सामग्री तथा डिजिटल पुस्तकालय (Favorites & Library)</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              वैदिक ग्रन्थ, ज्योतिष पुस्तक, भिडियो कक्षाहरू र मन्त्रहरू सुरक्षित गर्नुहोस् र जब मन लाग्छ अध्ययन गर्नुहोस्
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setFavoriteTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                favoriteTab === 'all'
                  ? 'bg-[#7A1C1C] text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              सबै ({libraryItems.length})
            </button>
            <button
              type="button"
              onClick={() => setFavoriteTab('books')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                favoriteTab === 'books'
                  ? 'bg-[#7A1C1C] text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              📖 पुस्तक
            </button>
            <button
              type="button"
              onClick={() => setFavoriteTab('videos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                favoriteTab === 'videos'
                  ? 'bg-[#7A1C1C] text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              🎥 भिडियो
            </button>
            <button
              type="button"
              onClick={() => setFavoriteTab('audios')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                favoriteTab === 'audios'
                  ? 'bg-[#7A1C1C] text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              🎵 मन्त्र
            </button>
            <button
              type="button"
              onClick={() => setFavoriteTab('saved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                favoriteTab === 'saved'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/40'
              }`}
            >
              ❤️ मेरो सेभ सूची
            </button>
          </div>
        </div>

        {/* Items Grid */}
        {(() => {
          let displayed = libraryItems;
          if (favoriteTab === 'books') displayed = libraryItems.filter((i) => i.type === 'book');
          if (favoriteTab === 'videos') displayed = libraryItems.filter((i) => i.type === 'video');
          if (favoriteTab === 'audios') displayed = libraryItems.filter((i) => i.type === 'audio' || i.type === 'mantra');
          if (favoriteTab === 'saved') {
            const allSaved = [
              ...(savedFavorites.books || []),
              ...(savedFavorites.videos || []),
              ...(savedFavorites.audios || []),
              ...(savedFavorites.articles || []),
              ...(savedFavorites.mantras || [])
            ];
            displayed = allSaved;
          }

          if (displayed.length === 0) {
            return (
              <div className="py-12 text-center text-stone-400 text-xs">
                {favoriteTab === 'saved'
                  ? 'तपाईंले कुनै सामग्री मनपर्ने सूचीमा सेभ गर्नुभएको छैन। माथिका ग्रन्थ तथा कक्षाहरूमा रहेको ❤️ बटन थिचेर सेभ गर्नुहोस्।'
                  : 'कुनै सामग्री फेला परेन।'}
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayed.map((item) => {
                const saved = isItemSaved(item.id);
                return (
                  <div
                    key={item.id}
                    className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-col justify-between hover:shadow-md transition-all group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                          {item.type === 'book'
                            ? '📖 ग्रन्थ / पुस्तक'
                            : item.type === 'video'
                            ? '🎥 भिडियो कक्षा'
                            : item.type === 'audio'
                            ? '🎵 अडियो मन्त्र'
                            : '📄 लेख'}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(item)}
                          disabled={isFavoriteActionBusy}
                          className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                            saved
                              ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 ring-1 ring-rose-400'
                              : 'text-stone-400 hover:text-rose-600 hover:bg-stone-200 dark:hover:bg-stone-700'
                          }`}
                          title={saved ? 'सेभ सूचीबाट हटाउनुहोस्' : 'मनपर्ने सूचीमा सेभ गर्नुहोस्'}
                        >
                          <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 line-clamp-2 leading-snug">
                        {item.title}
                      </h4>

                      <div className="text-[11px] text-stone-500 dark:text-stone-400">
                        लेखक/प्रस्तोता: {item.author || 'नेपाली वैदिक ज्योतिष'}
                      </div>

                      {item.description && (
                        <p className="text-[11px] text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 mt-2 border-t border-stone-200/60 dark:border-stone-700/60 flex items-center justify-between">
                      <span className="text-[10px] text-stone-400">{item.category}</span>
                      <a
                        href={item.url || '#'}
                        target={item.url && item.url !== '#' ? '_blank' : '_self'}
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                      >
                        <span>खोल्नुहोस्</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
      </>
      )}

      {/* ── 7. IMAGE CROP / UPLOAD MODAL ── */}
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
                    वैदिक कुण्डली इन्जिनबाट गणना गरिएको राशि *
                  </label>
                  <div className="p-2.5 bg-amber-50 dark:bg-stone-800/80 border border-amber-300 dark:border-stone-700 rounded-xl text-xs space-y-1">
                    <div className="text-amber-900 dark:text-amber-300 font-bold flex items-center justify-between">
                      <span>चन्द्रराशि: {editCalculatedAstro?.moon?.rashiName || editForm.moonRashi || 'गणना हुँदै...'}</span>
                      <span className="text-[10px] bg-amber-200 dark:bg-amber-900/60 px-2 py-0.5 rounded text-amber-900 dark:text-amber-200 font-mono">
                        स्वचालित
                      </span>
                    </div>
                    <div className="text-stone-600 dark:text-stone-400 text-[11px]">
                      लग्न: <strong className="text-stone-800 dark:text-stone-200">{editCalculatedAstro?.lagna?.rashiName || '—'}</strong> | नक्षत्र: <strong className="text-stone-800 dark:text-stone-200">{editCalculatedAstro?.moon?.nakshatraName || '—'}</strong>
                    </div>
                  </div>
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
