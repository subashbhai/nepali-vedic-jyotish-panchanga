import React, { useState, useEffect, useMemo } from 'react';
import {
  Sun,
  Moon,
  Sparkles,
  Calendar,
  Clock,
  Compass,
  Star,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Coins,
  Heart,
  GraduationCap,
  Activity,
  Users,
  Compass as TravelIcon,
  ShieldCheck,
  Printer,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Home,
  Award,
  Layers,
  History,
  Info
} from 'lucide-react';
import {
  BirthDetails,
  PanchangaData,
  PlanetPosition,
  LagnaInfo
} from '../../types/astrology';
import { RASHI_DATA } from '../../data/rashiData';
import {
  generatePersonalizedDailyRashifal,
  generatePersonalizedMonthlyRashifal,
  generatePersonalizedYearlyRashifal,
  PersonalizedDailyResult,
  PersonalizedMonthlyResult,
  PersonalizedYearlyResult
} from '../../utils/personalizedRashifalEngine';
import {
  getAvailableYearlyArchives,
  BALANANDA_RASHIFAL_UPDATED_EVENT
} from '../../db/rashifalStore';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';
import { convertADToBSFull, NEPALI_MONTH_NAMES } from '../../utils/bsCalendarData';

interface PersonalizedRashifalDashboardProps {
  profile: BirthDetails | null;
  todayPanchanga: PanchangaData;
  todayAD?: string;
  todayBS?: string;
  transitPlanets?: PlanetPosition[];
  onOpenKundali?: () => void;
}

export const PersonalizedRashifalDashboard: React.FC<PersonalizedRashifalDashboardProps> = ({
  profile,
  todayPanchanga,
  todayAD = new Date().toISOString().split('T')[0],
  todayBS = '',
  transitPlanets = []
}) => {
  // Navigation block selection: 'all' | 'daily' | 'monthly' | 'yearly'
  const [activeBlock, setActiveBlock] = useState<'all' | 'daily' | 'monthly' | 'yearly'>('all');

  // Currently selected Rashi (defaults to user's natal moon rashi if available, else 1 = मेष)
  const [selectedRashiId, setSelectedRashiId] = useState<number>(() => {
    if (profile?.moonRashi) {
      const found = RASHI_DATA.find((r) => r.name === profile.moonRashi);
      if (found) return found.id;
    }
    return 1;
  });

  // Re-sync rashi if profile changes
  useEffect(() => {
    if (profile?.moonRashi) {
      const found = RASHI_DATA.find((r) => r.name === profile.moonRashi);
      if (found) setSelectedRashiId(found.id);
    }
  }, [profile]);

  // Calendar periods
  const currentBS = useMemo(() => convertADToBSFull(new Date(todayAD)), [todayAD]);
  const [selectedYearBS, setSelectedYearBS] = useState<number>(currentBS.year);
  const [selectedMonthBS, setSelectedMonthBS] = useState<number>(currentBS.month);

  // Archive history list
  const availableYears = useMemo(() => getAvailableYearlyArchives(), []);

  // Expand / Collapse state for deep accordion sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dailyDetails: true,
    monthlyDetails: true,
    yearlyDetails: true
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Live storage update listener
  const [updateNonce, setUpdateNonce] = useState(0);
  useEffect(() => {
    const handleUpdate = () => setUpdateNonce((n) => n + 1);
    window.addEventListener(BALANANDA_RASHIFAL_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(BALANANDA_RASHIFAL_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Compute Daily Horoscope
  const dailyResult: PersonalizedDailyResult = useMemo(() => {
    return generatePersonalizedDailyRashifal(
      profile,
      todayPanchanga,
      transitPlanets,
      selectedRashiId,
      currentBS.formattedBS
    );
  }, [profile, todayPanchanga, transitPlanets, selectedRashiId, currentBS.formattedBS, updateNonce]);

  // Compute Monthly Horoscope
  const monthlyResult: PersonalizedMonthlyResult = useMemo(() => {
    return generatePersonalizedMonthlyRashifal(
      profile,
      selectedYearBS,
      selectedMonthBS,
      selectedRashiId
    );
  }, [profile, selectedYearBS, selectedMonthBS, selectedRashiId, updateNonce]);

  // Compute Yearly Horoscope
  const yearlyResult: PersonalizedYearlyResult = useMemo(() => {
    return generatePersonalizedYearlyRashifal(
      profile,
      selectedYearBS,
      selectedRashiId
    );
  }, [profile, selectedYearBS, selectedRashiId, updateNonce]);

  // Share handlers
  const handlePrint = () => {
    window.print();
  };

  const handleShare = (title: string, text: string) => {
    const fullText = `🕉️ ${title} 🕉️\n\n${text}\n\n— बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग सेवा`;
    if (navigator.share) {
      navigator.share({ title, text: fullText }).catch(() => {});
    } else {
      navigator.clipboard.writeText(fullText);
      alert('राशिफल क्लिपबोर्डमा प्रतिलिपि गरियो!');
    }
  };

  const displayDateBS = currentBS.formattedBSFull || todayBS || 'आजको मिति';

  return (
    <div className="space-y-6 animate-fadeIn text-stone-900 dark:text-stone-100">
      
      {/* ==================================================================== */}
      {/* TOP HEADER: Title, Profile Badges & 12 Rashi Quick Switcher          */}
      {/* ==================================================================== */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-amber-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center text-xl font-bold">
                ✨
              </span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-serif text-white tracking-tight">
                बृहत् वैदिक व्यक्तिगत राशिफल
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                {dailyResult.tierLabel}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              दैनिक, मासिक एवं वार्षिक ग्रहगोचर, चन्द्रबल, ताराबल, दशा तथा पञ्चाङ्गको प्रत्यक्ष गणनामा आधारित आधिकारिक ज्योतिषीय विश्लेषण
            </p>
          </div>

          {/* User Profile Summary Tag */}
          {profile && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 flex items-center gap-3 shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-700 text-white font-bold text-xl flex items-center justify-center shadow-inner">
                {profile.name.charAt(0)}
              </div>
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>{profile.name}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-stone-300 flex items-center gap-2 flex-wrap">
                  <span>जन्मराशि: <strong className="text-amber-300">{dailyResult.janmaRashi}</strong></span>
                  {dailyResult.lagnaName && <span>लग्न: <strong className="text-amber-300">{dailyResult.lagnaName}</strong></span>}
                </div>
                {dailyResult.janmaNakshatra && (
                  <div className="text-[11px] text-stone-400">
                    नक्षत्र: {dailyResult.janmaNakshatra}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 12 RASHI QUICK SELECTOR BAR */}
        <div className="mt-5 pt-4 border-t border-white/15">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-amber-300 font-bold flex items-center gap-1.5">
              <span>♈</span> १२ राशि द्रुत छनोट:
            </span>
            <span className="text-[11px] text-stone-400">
              {profile ? `तपाईंको जन्मराशि: ${dailyResult.janmaRashi}` : 'आफ्नो चन्द्रराशि छनोट गर्नुहोस्'}
            </span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
            {RASHI_DATA.map((r) => {
              const isSelected = selectedRashiId === r.id;
              const isNatal = profile && dailyResult.janmaRashi === r.name;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRashiId(r.id)}
                  className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-0.5 border ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md scale-105'
                      : isNatal
                      ? 'bg-amber-500/20 text-amber-200 border-amber-400/40 hover:bg-amber-500/30'
                      : 'bg-white/5 text-stone-300 border-white/10 hover:bg-white/15'
                  }`}
                  title={`${r.name} राशि (${r.englishName})`}
                >
                  <span className="text-sm">{r.symbol}</span>
                  <span className="truncate w-full text-[11px]">{r.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TIME NAVIGATION TABS (सबै / दैनिक / मासिक / वार्षिक) */}
        <div className="mt-4 pt-3 flex items-center justify-between flex-wrap gap-2">
          <div className="inline-flex p-1 bg-black/40 rounded-xl border border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveBlock('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeBlock === 'all' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              तीनै खण्ड (दैनिक + मासिक + वार्षिक)
            </button>
            <button
              type="button"
              onClick={() => setActiveBlock('daily')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeBlock === 'daily' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              दैनिक राशिफल
            </button>
            <button
              type="button"
              onClick={() => setActiveBlock('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeBlock === 'monthly' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              मासिक राशिफल
            </button>
            <button
              type="button"
              onClick={() => setActiveBlock('yearly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeBlock === 'yearly' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              वार्षिक राशिफल
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/15 cursor-pointer"
              title="राशिफल प्रिन्ट गर्नुहोस्"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">प्रिन्ट</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* BLOCK १: आजको व्यक्तिगत दैनिक राशिफल                                 */}
      {/* ==================================================================== */}
      {(activeBlock === 'all' || activeBlock === 'daily') && (
        <section className="bg-white dark:bg-stone-900 rounded-3xl border-2 border-amber-300/80 dark:border-stone-800 shadow-md p-5 sm:p-7 space-y-5">
          {/* Block 1 Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-200/70 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center text-xl shadow-md shrink-0">
                ☀️
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>आजको व्यक्तिगत दैनिक राशिफल</span>
                  <span className="text-[11px] font-sans font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-300/60">
                    {dailyResult.item.rashiName} राशि
                  </span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                  📅 {displayDateBS} • {todayPanchanga.tithi?.name || 'तिथि'} • {todayPanchanga.dayNameNepali || 'बार'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 rounded-xl text-xs font-bold">
                {dailyResult.item.overallScore}% अनुकूलता
              </span>
              <button
                type="button"
                onClick={() => handleShare(`दैनिक राशिफल (${dailyResult.item.rashiName})`, dailyResult.item.overallSummary)}
                className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs cursor-pointer"
                title="दैनिक राशिफल सेयर गर्नुहोस्"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Astrological Synthesis Notice (Personalized vs General) */}
          <div className="p-3.5 bg-amber-50/70 dark:bg-stone-800/60 rounded-2xl border border-amber-200/80 dark:border-stone-700 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-semibold leading-relaxed">
                {dailyResult.personalSynthesis}
              </p>
              {dailyResult.chandrabala && (
                <div className="flex items-center gap-3 text-[11px] text-stone-600 dark:text-stone-300 flex-wrap pt-1 border-t border-amber-200/50 dark:border-stone-700">
                  <span>चन्द्रबल: <strong>{dailyResult.chandrabala.statusNepali}</strong></span>
                  {dailyResult.tarabala && <span>ताराबल: <strong>{dailyResult.tarabala.taraName} ({dailyResult.tarabala.isFavorable ? 'शुभ' : 'सामान्य'})</strong></span>}
                  {dailyResult.sadeSatiStatus && <span>साढेसाती: <strong>{dailyResult.sadeSatiStatus}</strong></span>}
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar: Verdict, Lucky Color, Number, Time, Direction */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 text-xs">
            <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200/80 dark:border-stone-700 text-center">
              <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-bold">समग्र दिनको फल</span>
              <strong className="text-amber-800 dark:text-amber-300 text-xs block mt-0.5 truncate">
                {dailyResult.item.overallVerdict}
              </strong>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200/80 dark:border-stone-700 text-center">
              <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-bold">शुभ रङ</span>
              <strong className="text-stone-800 dark:text-stone-200 text-xs block mt-0.5">
                {dailyResult.item.luckyColor}
              </strong>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200/80 dark:border-stone-700 text-center">
              <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-bold">शुभ अंक</span>
              <strong className="text-stone-800 dark:text-stone-200 text-xs block mt-0.5">
                {dailyResult.item.luckyNumber}
              </strong>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200/80 dark:border-stone-700 text-center">
              <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-bold">शुभ दिशा</span>
              <strong className="text-stone-800 dark:text-stone-200 text-xs block mt-0.5">
                {dailyResult.item.luckyDirection}
              </strong>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-2xl border border-stone-200/80 dark:border-stone-700 text-center col-span-2 sm:col-span-4 lg:col-span-1">
              <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-bold">अनुकूल समय</span>
              <strong className="text-emerald-700 dark:text-emerald-400 text-[11px] block mt-0.5 truncate">
                {dailyResult.item.favorableTime.split('र')[0]}
              </strong>
            </div>
          </div>

          {/* Comprehensive Daily Facets Grid (8 Areas) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* 1. कार्यक्षेत्र तथा व्यवसाय */}
            <div className="p-4 rounded-2xl bg-[#FCFAF5] dark:bg-stone-800/50 border border-amber-200/70 dark:border-stone-700 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-300">
                <Briefcase className="w-4 h-4 text-amber-600" />
                <span>कार्यक्षेत्र तथा व्यवसाय:</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 text-justify">
                {dailyResult.item.career}
              </p>
            </div>

            {/* 2. आर्थिक अवस्था र धनसम्बन्धी सम्भावना */}
            <div className="p-4 rounded-2xl bg-[#FCFAF5] dark:bg-stone-800/50 border border-amber-200/70 dark:border-stone-700 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-300">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>आर्थिक अवस्था र धन सम्भावना:</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 text-justify">
                {dailyResult.item.finance}
              </p>
            </div>

            {/* 3. प्रेम, दाम्पत्य तथा पारिवारिक सम्बन्ध */}
            <div className="p-4 rounded-2xl bg-[#FCFAF5] dark:bg-stone-800/50 border border-amber-200/70 dark:border-stone-700 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-300">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>प्रेम, दाम्पत्य तथा पारिवारिक सम्बन्ध:</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 text-justify">
                {dailyResult.item.loveAndFamily}
              </p>
            </div>

            {/* 4. अध्ययन, परीक्षा तथा बौद्धिक कार्य */}
            <div className="p-4 rounded-2xl bg-[#FCFAF5] dark:bg-stone-800/50 border border-amber-200/70 dark:border-stone-700 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-300">
                <GraduationCap className="w-4 h-4 text-indigo-500" />
                <span>अध्ययन, परीक्षा तथा बौद्धिक कार्य:</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 text-justify">
                {dailyResult.item.education}
              </p>
            </div>

            {/* 5. स्वास्थ्य तथा दिनचर्याका सामान्य सुझाव */}
            <div className="p-4 rounded-2xl bg-[#FCFAF5] dark:bg-stone-800/50 border border-amber-200/70 dark:border-stone-700 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-300">
                <Activity className="w-4 h-4 text-cyan-600" />
                <span>स्वास्थ्य तथा दिनचर्याका सुझाव:</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 text-justify">
                {dailyResult.item.health}
              </p>
            </div>

            {/* 6. सामाजिक सम्बन्ध तथा मानसम्मान */}
            <div className="p-4 rounded-2xl bg-[#FCFAF5] dark:bg-stone-800/50 border border-amber-200/70 dark:border-stone-700 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-300">
                <Users className="w-4 h-4 text-blue-500" />
                <span>सामाजिक सम्बन्ध तथा मानसम्मान:</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 text-justify">
                {dailyResult.item.social}
              </p>
            </div>

            {/* 7. यात्रा तथा नयाँ कामको सम्भावना */}
            <div className="p-4 rounded-2xl bg-[#FCFAF5] dark:bg-stone-800/50 border border-amber-200/70 dark:border-stone-700 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-300">
                <TravelIcon className="w-4 h-4 text-orange-500" />
                <span>यात्रा तथा नयाँ कामको सम्भावना:</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 text-justify">
                {dailyResult.item.travel}
              </p>
            </div>

            {/* 8. सावधानी अपनाउनुपर्ने समय */}
            <div className="p-4 rounded-2xl bg-[#FFF9F9] dark:bg-stone-800/50 border border-rose-200/70 dark:border-stone-700 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-900 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>सावधानी अपनाउनुपर्ने पक्ष/समय:</span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 text-justify">
                {dailyResult.item.cautionTime}
              </p>
            </div>
          </div>

          {/* Spiritual Remedies & Mantra Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50 dark:from-stone-800 dark:via-stone-800 dark:to-stone-800 border border-amber-300/80 dark:border-stone-700 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>आजको आध्यात्मिक अभ्यास, मन्त्र एवं सत्कर्म सुझाव:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-white/80 dark:bg-stone-900/80 p-3 rounded-xl border border-amber-200 dark:border-stone-700">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold block mb-1">
                  दैनिक मन्त्र जप:
                </span>
                <p className="font-serif font-bold text-amber-950 dark:text-amber-200 text-sm">
                  {dailyResult.item.mantra}
                </p>
              </div>

              <div className="bg-white/80 dark:bg-stone-900/80 p-3 rounded-xl border border-amber-200 dark:border-stone-700">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold block mb-1">
                  सत्कर्म तथा दान सुझाव:
                </span>
                <p className="text-stone-800 dark:text-stone-200 text-xs">
                  {dailyResult.item.remedy}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* BLOCK २: यस महिनाको विस्तृत मासिक राशिफल                             */}
      {/* ==================================================================== */}
      {(activeBlock === 'all' || activeBlock === 'monthly') && (
        <section className="bg-white dark:bg-stone-900 rounded-3xl border-2 border-indigo-300/80 dark:border-stone-800 shadow-md p-5 sm:p-7 space-y-5">
          {/* Block 2 Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-200/70 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center text-xl shadow-md shrink-0">
                🌙
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>यस महिनाको विस्तृत मासिक राशिफल</span>
                  <span className="text-[11px] font-sans font-bold bg-indigo-100 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-300/60">
                    {monthlyResult.item.rashiName} राशि
                  </span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                  विक्रम संवत् {toDevanagariNumerals(monthlyResult.item.yearBS)} साल, {monthlyResult.item.monthName} महिनाभरिको फलादेश
                </p>
              </div>
            </div>

            {/* Month Switcher Controls */}
            <div className="flex items-center gap-2">
              <select
                value={selectedMonthBS}
                onChange={(e) => setSelectedMonthBS(Number(e.target.value))}
                className="px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-bold text-xs cursor-pointer"
              >
                {NEPALI_MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx + 1}>
                    {m} महिना
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => handleShare(`मासिक राशिफल (${monthlyResult.item.rashiName} - ${monthlyResult.item.monthName})`, monthlyResult.item.overallSummary)}
                className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs cursor-pointer"
                title="मासिक राशिफल सेयर गर्नुहोस्"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Monthly Synthesis Overview */}
          <div className="p-4 bg-indigo-50/70 dark:bg-stone-800/60 rounded-2xl border border-indigo-200/80 dark:border-stone-700 space-y-2">
            <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>महिनाको समग्र विश्लेषण एवं ग्रहगोचर प्रभाव:</span>
            </h4>
            <p className="text-xs leading-relaxed text-stone-800 dark:text-stone-200 text-justify">
              {monthlyResult.item.overallSummary}
            </p>
            <p className="text-[11px] text-stone-600 dark:text-stone-300 pt-1 border-t border-indigo-200/50 dark:border-stone-700">
              {monthlyResult.personalMonthlySynthesis}
            </p>
          </div>

          {/* Trend: Begin, Mid, End */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-stone-100">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>महिनाको प्रारम्भ, मध्य र अन्त्यको सम्भावित प्रवृत्ति:</span>
            </div>
            <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 text-justify">
              {monthlyResult.item.trendBeginMidEnd}
            </p>
          </div>

          {/* Monthly Areas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 space-y-1">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block">💼 कार्यक्षेत्र, जागिर तथा व्यवसाय</span>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed text-justify">{monthlyResult.item.career}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 space-y-1">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">💰 आम्दानी, खर्च तथा आर्थिक योजना</span>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed text-justify">{monthlyResult.item.finance}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 space-y-1">
              <span className="text-xs font-bold text-rose-900 dark:text-rose-300 block">❤️ परिवार, प्रेम तथा दाम्पत्य</span>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed text-justify">{monthlyResult.item.loveAndFamily}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 space-y-1">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 block">🎓 शिक्षा, अध्ययन तथा प्रतिस्पर्धा</span>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed text-justify">{monthlyResult.item.education}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 space-y-1">
              <span className="text-xs font-bold text-cyan-900 dark:text-cyan-300 block">🏥 स्वास्थ्य तथा जीवनशैली</span>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed text-justify">{monthlyResult.item.health}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF9F5] dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 space-y-1">
              <span className="text-xs font-bold text-purple-900 dark:text-purple-300 block">🏠 घरजग्गा, सम्पत्ति तथा नयाँ काम</span>
              <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed text-justify">{monthlyResult.item.property}</p>
            </div>
          </div>

          {/* Monthly Favorable Periods & Spiritual Sadhana */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-stone-800/60 border border-emerald-200 dark:border-stone-700">
              <strong className="text-emerald-950 dark:text-emerald-300 block mb-1">
                ✨ महिनाका अनुकूल तथा सावधानी अपनाउनुपर्ने समय:
              </strong>
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                {monthlyResult.item.favorableAndCautionPeriods}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-stone-800/60 border border-amber-200 dark:border-stone-700">
              <strong className="text-amber-950 dark:text-amber-300 block mb-1">
                🪔 आध्यात्मिक साधना तथा महिनाको समीक्षा:
              </strong>
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                {monthlyResult.item.spiritualSadhana}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================================== */}
      {/* BLOCK ३: यस वर्षको विस्तृत वार्षिक राशिफल                            */}
      {/* ==================================================================== */}
      {(activeBlock === 'all' || activeBlock === 'yearly') && (
        <section className="bg-white dark:bg-stone-900 rounded-3xl border-2 border-amber-400/90 dark:border-stone-800 shadow-md p-5 sm:p-7 space-y-5">
          {/* Block 3 Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-300/70 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-center text-xl shadow-md shrink-0">
                🪐
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <span>यस वर्षको विस्तृत वार्षिक राशिफल</span>
                  <span className="text-[11px] font-sans font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-300/60">
                    {yearlyResult.item.rashiName} राशि
                  </span>
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                  विक्रम संवत् {toDevanagariNumerals(yearlyResult.item.yearBS)} सालभरिको समग्र फलादेश
                </p>
              </div>
            </div>

            {/* Year Switcher & Archive History */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-xl border border-stone-300 dark:border-stone-700">
                <History className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[11px] font-bold text-stone-500">वर्ष:</span>
                <select
                  value={selectedYearBS}
                  onChange={(e) => setSelectedYearBS(Number(e.target.value))}
                  className="bg-transparent font-bold text-xs cursor-pointer text-stone-900 dark:text-stone-100 focus:outline-hidden"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y} className="dark:bg-stone-900">
                      वि.सं. {toDevanagariNumerals(y)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => handleShare(`वार्षिक राशिफल (${yearlyResult.item.rashiName} - ${yearlyResult.item.yearBS})`, yearlyResult.item.yearlyOverview)}
                className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs cursor-pointer"
                title="वार्षिक राशिफल सेयर गर्नुहोस्"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Yearly Overview Box */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-amber-50/90 dark:from-stone-800/80 dark:via-stone-900 dark:to-stone-800/80 rounded-2xl border border-amber-300/80 dark:border-stone-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-amber-950 dark:text-amber-300 flex items-center gap-2">
                <span>🌟</span>
                <span>वर्षको समग्र ज्योतिषीय विश्लेषण एवं भाग्योदय फल:</span>
              </h4>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-300/50">
                {yearlyResult.item.overallVerdict}
              </span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-stone-800 dark:text-stone-200 text-justify">
              {yearlyResult.item.yearlyOverview}
            </p>
            <p className="text-xs text-amber-900 dark:text-amber-300 pt-2 border-t border-amber-200 dark:border-stone-700">
              {yearlyResult.personalYearlySynthesis}
            </p>
          </div>

          {/* Major Planetary Transits: Jupiter, Saturn, Rahu-Ketu */}
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-2">
            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <span>🪐</span>
              <span>प्रमुख ग्रहहरूको गोचर व्याख्या (गुरु, शनि, राहु-केतु):</span>
            </h4>
            <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 text-justify">
              {yearlyResult.item.majorPlanetaryTransits}
            </p>
            <div className="p-2.5 bg-stone-50 dark:bg-stone-900 rounded-xl text-[11px] text-stone-600 dark:text-stone-300">
              <strong>कालखण्ड:</strong> {yearlyResult.item.keyTransitTimelines}
            </div>
          </div>

          {/* Detailed Facets of the Year (8 Chapters) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Career & Business */}
            <div className="p-3.5 rounded-2xl bg-[#FCFAF5] dark:bg-stone-800/50 border border-amber-200 dark:border-stone-700 space-y-1">
              <strong className="text-amber-950 dark:text-amber-300 block">💼 कार्यक्षेत्र, नोकरी र व्यवसाय:</strong>
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-justify">{yearlyResult.item.career}</p>
            </div>

            {/* Finance & Wealth */}
            <div className="p-3.5 rounded-2xl bg-[#FCFAF5] dark:bg-stone-800/50 border border-amber-200 dark:border-stone-700 space-y-1">
              <strong className="text-emerald-950 dark:text-emerald-300 block">💰 आर्थिक अवस्था र धन वृद्धि:</strong>
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-justify">{yearlyResult.item.finance}</p>
            </div>

            {/* Education & Intellect */}
            <div className="p-3.5 rounded-2xl bg-[#FCFAF5] dark:bg-stone-800/50 border border-amber-200 dark:border-stone-700 space-y-1">
              <strong className="text-indigo-950 dark:text-indigo-300 block">🎓 उच्च शिक्षा र प्रतिस्पर्धा:</strong>
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-justify">{yearlyResult.item.education}</p>
            </div>

            {/* Love & Marriage */}
            <div className="p-3.5 rounded-2xl bg-[#FCFAF5] dark:bg-stone-800/50 border border-amber-200 dark:border-stone-700 space-y-1">
              <strong className="text-rose-950 dark:text-rose-300 block">❤️ प्रेम, विवाह र दाम्पत्य:</strong>
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-justify">{yearlyResult.item.loveAndMarriage}</p>
            </div>

            {/* Family & Social */}
            <div className="p-3.5 rounded-2xl bg-[#FCFAF5] dark:bg-stone-800/50 border border-amber-200 dark:border-stone-700 space-y-1">
              <strong className="text-blue-950 dark:text-blue-300 block">👥 पारिवारिक र सामाजिक प्रतिष्ठा:</strong>
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-justify">{yearlyResult.item.familyAndSocial}</p>
            </div>

            {/* Property & Vehicles */}
            <div className="p-3.5 rounded-2xl bg-[#FCFAF5] dark:bg-stone-800/50 border border-amber-200 dark:border-stone-700 space-y-1">
              <strong className="text-purple-950 dark:text-purple-300 block">🚗 घरजग्गा र सवारीसाधन:</strong>
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-justify">{yearlyResult.item.propertyAndVehicles}</p>
            </div>

            {/* Travel & Foreign */}
            <div className="p-3.5 rounded-2xl bg-[#FCFAF5] dark:bg-stone-800/50 border border-amber-200 dark:border-stone-700 space-y-1">
              <strong className="text-cyan-950 dark:text-cyan-300 block">✈️ वैदेशिक यात्रा र अवसर:</strong>
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-justify">{yearlyResult.item.travelAndAbroad}</p>
            </div>

            {/* Health & Wellness */}
            <div className="p-3.5 rounded-2xl bg-[#FCFAF5] dark:bg-stone-800/50 border border-amber-200 dark:border-stone-700 space-y-1">
              <strong className="text-rose-950 dark:text-rose-300 block">🌿 स्वास्थ्य तथा जीवनशैली:</strong>
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-justify">{yearlyResult.item.healthAndWellness}</p>
            </div>
          </div>

          {/* Opportunities, Cautions & Practical Guidance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-stone-800/60 border border-amber-200 dark:border-stone-700 space-y-1">
              <strong className="text-amber-950 dark:text-amber-300 block">
                🎯 वर्षका अवसर तथा सावधानीका विषय:
              </strong>
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-justify">
                {yearlyResult.item.opportunitiesAndCautions}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-1">
              <strong className="text-stone-900 dark:text-stone-100 block">
                🪔 वर्षभरिका लागि आध्यात्मिक साधना तथा व्यावहारिक मार्गदर्शन:
              </strong>
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-justify">
                {yearlyResult.item.spiritualRemedies}
              </p>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
