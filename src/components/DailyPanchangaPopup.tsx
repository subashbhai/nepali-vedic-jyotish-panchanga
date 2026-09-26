// Daily Panchanga Details Popup Component (दैनिक पञ्चाङ्ग तथा साइत विवरण)
// Comprehensive Vedic, Astronomical, Festival, and Muhurta inspection for any calendar date

import React, { useState, useMemo } from 'react';
import { 
  X, 
  Sun, 
  Moon, 
  Sparkles, 
  ShieldAlert, 
  Compass, 
  Calendar as CalendarIcon, 
  Clock, 
  Flame, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  ChevronRight,
  ShieldCheck,
  Zap,
  BookOpen
} from 'lucide-react';
import { PanchangaData, LocationData } from '../types/astrology';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { 
  calculateShivaVaas, 
  calculateAgniVaas, 
  calculateDishaShool, 
  calculateFullChoghadiya, 
  calculatePlanetaryHora, 
  getShraddhaStatus,
  getDailyNinePlanets 
} from '../utils/saitEngine';
import { getAuthoritativeFestivalsForBSDate } from '../utils/festivalMaster';
import { 
  canonicalJulianDay, 
  calculateCanonicalAuthoritativePanchanga,
  NAKSHATRA_NAMES_27,
  YOGA_NAMES_27
} from '../utils/canonicalAstroEngine';
import { getAyanamsa } from '../utils/astroCalculations';
import { convertADToBSFull } from '../utils/bsCalendarData';

interface DailyPanchangaPopupProps {
  isOpen: boolean;
  onClose: () => void;
  dateAD: string; // YYYY-MM-DD
  location?: LocationData;
}

export const DailyPanchangaPopup: React.FC<DailyPanchangaPopupProps> = ({
  isOpen,
  onClose,
  dateAD,
  location = {
    name: 'काठमाडौँ, नेपाल',
    latitude: 27.7172,
    longitude: 85.3240,
    timeZone: 5.75,
    country: 'नेपाल',
  },
}) => {
  const [activeTab, setActiveTab] = useState<'panchanga' | 'planets' | 'sait' | 'festivals' | 'timeline'>('panchanga');

  // Compute Panchanga & Astro Engine data
  const data = useMemo(() => {
    if (!dateAD) return null;
    const bsFull = convertADToBSFull(dateAD);
    const auth = calculateCanonicalAuthoritativePanchanga(
      dateAD,
      '06:00',
      location.latitude,
      location.longitude,
      location.timeZone
    );
    const jd = auth.julianDayUT;
    const ayanamsa = auth.ayanamsa;

    // Day of week index
    const dayOfWeekIndex = bsFull.dayOfWeek;

    // Sait and Muhurta
    const tithiNum = auth.udayaTithi.number;
    const paksha = auth.udayaTithi.paksha;
    const shivaVaas = calculateShivaVaas(tithiNum, paksha);
    const agniVaas = calculateAgniVaas(tithiNum, dayOfWeekIndex, paksha);
    const dishaShool = calculateDishaShool(dayOfWeekIndex);

    // Choghadiya
    const choghadiya = calculateFullChoghadiya(
      auth.sunrise.decimalHours,
      auth.sunset.decimalHours,
      dayOfWeekIndex
    );

    // Hora
    const horas = calculatePlanetaryHora(auth.sunrise.decimalHours, dayOfWeekIndex);

    // Shraddha Status
    const shraddha = getShraddhaStatus(bsFull.month, bsFull.day, auth.udayaTithi.name, paksha);

    // 9 Planets
    const planets = getDailyNinePlanets(jd, ayanamsa);

    // Festivals (authoritative year-aware deduplicated lookup)
    const festivals = getAuthoritativeFestivalsForBSDate(bsFull.month, bsFull.day, undefined, bsFull.year);

    // Day & Night duration
    const dayDuration = Math.max(8.0, auth.sunset.decimalHours - auth.sunrise.decimalHours);
    const nightDuration = 24.0 - dayDuration;
    const dayHours = Math.floor(dayDuration);
    const dayMins = Math.floor((dayDuration - dayHours) * 60);
    const nightHours = Math.floor(nightDuration);
    const nightMins = Math.floor((nightDuration - nightHours) * 60);

    return {
      bsFull,
      auth,
      dayOfWeekIndex,
      shivaVaas,
      agniVaas,
      dishaShool,
      choghadiya,
      horas,
      shraddha,
      planets,
      festivals,
      dayDurationStr: `${toDevanagariNumerals(dayHours)} घण्टा ${toDevanagariNumerals(dayMins)} मिनेट`,
      nightDurationStr: `${toDevanagariNumerals(nightHours)} घण्टा ${toDevanagariNumerals(nightMins)} मिनेट`,
    };
  }, [dateAD, location]);

  if (!isOpen || !data) return null;

  const { bsFull, auth, shivaVaas, agniVaas, dishaShool, choghadiya, horas, shraddha, planets, festivals, dayDurationStr, nightDurationStr } = data;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-amber-300/80 dark:border-stone-700 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in my-auto">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#B91C1C] via-[#991B1B] to-[#7F1D1D] text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex flex-col items-center justify-center font-bold text-amber-200">
              <span className="text-[10px] font-sans uppercase">वि.सं.</span>
              <span className="text-xl font-mono leading-none">{toDevanagariNumerals(bsFull.day)}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-serif tracking-tight text-white">
                  {bsFull.formattedBSFull}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-stone-950">
                  {auth.udayaTithi.paksha} पक्ष
                </span>
              </div>
              <p className="text-xs text-red-100 flex items-center gap-2 mt-0.5">
                <span>{new Date(dateAD).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span>•</span>
                <span>{location.name}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto p-2 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 shrink-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('panchanga')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'panchanga'
                ? 'bg-[#B91C1C] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>पञ्चाङ्ग (५ अङ्ग)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sait')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'sait'
                ? 'bg-[#B91C1C] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>शुभ साइत र रुद्री/अग्नि वास</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('planets')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'planets'
                ? 'bg-[#B91C1C] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>सूर्य-चन्द्र र नवग्रह स्थिति</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('festivals')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'festivals'
                ? 'bg-[#B91C1C] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>चाडपर्व तथा श्राद्ध ({toDevanagariNumerals(festivals.length)})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'bg-[#B91C1C] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>दिनचर्या समयरेखा</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: PANCHANGA (5 Limbs) */}
          {activeTab === 'panchanga' && (
            <div className="space-y-5 animate-fade-in">
              {/* Context bar: Samvatsara, Ritu, Ayana */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 bg-amber-50/70 dark:bg-stone-800/60 rounded-2xl border border-amber-200/60 dark:border-stone-700">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-medium">संवत्सर</span>
                  <strong className="text-stone-900 dark:text-stone-100 font-bold block mt-0.5">कालयुक्त संवत्सर</strong>
                </div>
                <div className="p-3 bg-amber-50/70 dark:bg-stone-800/60 rounded-2xl border border-amber-200/60 dark:border-stone-700">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-medium">अयन</span>
                  <strong className="text-stone-900 dark:text-stone-100 font-bold block mt-0.5">
                    {bsFull.month <= 3 || bsFull.month >= 10 ? 'उत्तरायण' : 'दक्षिणायन'}
                  </strong>
                </div>
                <div className="p-3 bg-amber-50/70 dark:bg-stone-800/60 rounded-2xl border border-amber-200/60 dark:border-stone-700">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-medium">ऋतु</span>
                  <strong className="text-stone-900 dark:text-stone-100 font-bold block mt-0.5">
                    {bsFull.month <= 2 ? 'वसन्त' : bsFull.month <= 4 ? 'ग्रीष्म' : bsFull.month <= 6 ? 'वर्षा' : bsFull.month <= 8 ? 'शरद' : bsFull.month <= 10 ? 'हेमन्त' : 'शिशिर'} ऋतु
                  </strong>
                </div>
                <div className="p-3 bg-amber-50/70 dark:bg-stone-800/60 rounded-2xl border border-amber-200/60 dark:border-stone-700">
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-medium">दिनमान / रात्रिमान</span>
                  <strong className="text-stone-900 dark:text-stone-100 font-bold block mt-0.5">
                    {dayDurationStr}
                  </strong>
                </div>
              </div>

              {/* 5 Core Limbs Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Tithi Card */}
                <div className="p-4 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-mono">१</span>
                      तिथि (Tithi)
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      उदय तिथि मान्य
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 font-serif">
                      {auth.udayaTithi.name} ({auth.udayaTithi.paksha} पक्ष)
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                      समाप्ति समय: <strong>{auth.udayaTithi.formattedEndTime}</strong> सम्म
                    </p>
                    {auth.udayaTithi.subsequentTithiName && (
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        त्यसपछि: <strong>{auth.udayaTithi.subsequentTithiName}</strong> प्रारम्भ हुनेछ
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. Vara Card */}
                <div className="p-4 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] font-mono">२</span>
                      वार (Vara)
                    </span>
                    <span className="text-[11px] text-stone-500 font-mono">
                      {['रविवासरः', 'सोमवासरः', 'भौमवासरः', 'बुधवासरः', 'गुरुवासरः', 'शुक्रवासरः', 'शनिवासरः'][bsFull.dayOfWeek]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 font-serif">
                      {bsFull.formattedBSFull.split(', ')[1] || 'शुक्रबार'}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                      वार स्वामी: <strong>{['सूर्य', 'चन्द्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'][bsFull.dayOfWeek]}</strong>
                    </p>
                  </div>
                </div>

                {/* 3. Nakshatra Card */}
                <div className="p-4 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center text-[10px] font-mono">३</span>
                      नक्षत्र (Nakshatra)
                    </span>
                    <span className="text-[11px] font-bold text-stone-500">
                      चरण {toDevanagariNumerals(auth.nakshatra.pada)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 font-serif">
                      {auth.nakshatra.name}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                      समाप्ति समय: <strong>{auth.nakshatra.formattedEndTime}</strong> सम्म
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-stone-500 mt-1">
                      <span>स्वामी: <strong>{auth.nakshatra.lord}</strong></span>
                      <span>त्यसपछि: <strong>{NAKSHATRA_NAMES_27[(auth.nakshatra.index + 1) % 27]}</strong></span>
                    </div>
                  </div>
                </div>

                {/* 4. Yoga Card */}
                <div className="p-4 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-mono">४</span>
                      योग (Yoga)
                    </span>
                    <span className="text-[11px] text-stone-500 font-mono">
                      योग सङ्ख्या {toDevanagariNumerals(auth.yoga.index + 1)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 font-serif">
                      {auth.yoga.name}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                      समाप्ति समय: <strong>{auth.yoga.formattedEndTime}</strong> सम्म
                    </p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      त्यसपछि: <strong>{YOGA_NAMES_27[(auth.yoga.index + 1) % 27]}</strong> योग प्रारम्भ
                    </p>
                  </div>
                </div>

                {/* 5. Karana Card */}
                <div className="p-4 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center text-[10px] font-mono">५</span>
                      करण (Karana)
                    </span>
                    {auth.karana.name.includes('विष्टि') && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> भद्रा (विष्टि) सक्रिय
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 font-serif">
                        {auth.karana.name}
                      </h3>
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                        समाप्ति समय: <strong>{auth.karana.formattedEndTime}</strong> सम्म
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: SAIT & MUHURTA */}
          {activeTab === 'sait' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Rudri Jurrne & Agni Vaas Top Highlight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Rudri / Shiva Vaas */}
                <div className={`p-4 rounded-3xl border transition-all ${
                  shivaVaas.isFavorable 
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800' 
                    : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black flex items-center gap-1.5 text-stone-900 dark:text-stone-100">
                      <Flame className="w-4 h-4 text-[#B91C1C]" />
                      रुद्री जुर्ने / शिव वास विचार
                    </span>
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      shivaVaas.isFavorable 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200'
                    }`}>
                      {shivaVaas.resultText}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 font-serif">
                    शिव वास: {shivaVaas.location} ({shivaVaas.locationNepali})
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                    {shivaVaas.description}
                  </p>
                  <span className="text-[10px] text-stone-400 block mt-2 italic font-mono">
                    {shivaVaas.sourceText}
                  </span>
                </div>

                {/* Agni Vaas */}
                <div className={`p-4 rounded-3xl border transition-all ${
                  agniVaas.isFavorable 
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800' 
                    : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black flex items-center gap-1.5 text-stone-900 dark:text-stone-100">
                      <Zap className="w-4 h-4 text-amber-500" />
                      अग्नि वास (हवन / होम विचार)
                    </span>
                    <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      agniVaas.isFavorable 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-rose-600 text-white'
                    }`}>
                      {agniVaas.residence}मा वास
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 font-serif">
                    {agniVaas.resultText}
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                    {agniVaas.description}
                  </p>
                  <span className="text-[10px] text-stone-400 block mt-2 italic font-mono">
                    {agniVaas.sourceText}
                  </span>
                </div>

              </div>

              {/* Disha Shool & Inauspicious Periods */}
              <div className="p-4 rounded-3xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-3">
                <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-700 pb-2">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 font-serif">
                    यात्रा दिशाशूल तथा परिहार
                  </h4>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-stone-500 block text-[11px]">आजको दिशाशूल:</span>
                    <strong className="text-red-700 dark:text-red-400 text-sm font-bold">
                      {dishaShool.direction} दिशा
                    </strong>
                  </div>
                  <div className="flex-1 max-w-lg">
                    <span className="text-stone-500 block text-[11px]">दोष परिहार (उपाय):</span>
                    <p className="text-stone-700 dark:text-stone-300 font-medium">
                      {dishaShool.remedyNepali}
                    </p>
                  </div>
                </div>
              </div>

              {/* Choghadiya Day & Night */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    अहोरात्र चौघडिया मुहूर्त (दिन र रात)
                  </h4>
                  <span className="text-[10px] text-stone-500">८ दिनका + ८ रातका समयखण्ड</span>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block">
                    दिनको चौघडिया (Day Choghadiya)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {choghadiya.daySlots.map((slot, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-2xl border text-center transition-all ${
                          slot.type === 'शुभ'
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                            : slot.type === 'अशुभ'
                            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                            : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] opacity-75 mb-1 font-mono">
                          <span>{slot.period} {toDevanagariNumerals(i + 1)}</span>
                          <span className="font-bold uppercase">{slot.type}</span>
                        </div>
                        <strong className="block text-sm font-black">{slot.name}</strong>
                        <span className="text-[10px] block mt-0.5 opacity-90">{slot.startTime} - {slot.endTime}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block">
                    रातको चौघडिया (Night Choghadiya)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {choghadiya.nightSlots.map((slot, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-2xl border text-center transition-all ${
                          slot.type === 'शुभ'
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                            : slot.type === 'अशुभ'
                            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                            : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] opacity-75 mb-1 font-mono">
                          <span>{slot.period} {toDevanagariNumerals(i + 1)}</span>
                          <span className="font-bold uppercase">{slot.type}</span>
                        </div>
                        <strong className="block text-sm font-black">{slot.name}</strong>
                        <span className="text-[10px] block mt-0.5 opacity-90">{slot.startTime} - {slot.endTime}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: PLANETS & SUN/MOON */}
          {activeTab === 'planets' && (
            <div className="space-y-6 animate-fade-in">
              {/* Sun & Moon Deep Astronomical Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Sun Coordinates */}
                <div className="p-4 rounded-3xl bg-amber-50/70 dark:bg-stone-800/70 border border-amber-200 dark:border-stone-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-amber-500" />
                      सूर्यको खगोल स्पष्ट स्थिति
                    </span>
                    <span className="text-[11px] font-mono text-stone-500">
                      गति: {toDevanagariNumerals(auth.sun.speed.toFixed(2))}°/दिन
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-stone-500 text-[10px] block">राशि (Sign):</span>
                      <strong className="text-stone-900 dark:text-stone-100">{auth.sun.rashiName}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 text-[10px] block">भोगांश (Degree):</span>
                      <strong className="text-stone-900 dark:text-stone-100 font-mono">
                        {toDevanagariNumerals((auth.sun.siderealLong % 30).toFixed(2))}°
                      </strong>
                    </div>
                    <div>
                      <span className="text-stone-500 text-[10px] block">सूर्योदय (Sunrise):</span>
                      <strong className="text-emerald-700 dark:text-emerald-400">{auth.sunrise.formattedTime}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 text-[10px] block">सूर्यास्त (Sunset):</span>
                      <strong className="text-rose-700 dark:text-rose-400">{auth.sunset.formattedTime}</strong>
                    </div>
                  </div>
                </div>

                {/* Moon Coordinates */}
                <div className="p-4 rounded-3xl bg-indigo-50/70 dark:bg-stone-800/70 border border-indigo-200 dark:border-stone-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-800 dark:text-indigo-400 flex items-center gap-1.5">
                      <Moon className="w-4 h-4 text-indigo-500" />
                      चन्द्रमाको खगोल स्पष्ट स्थिति
                    </span>
                    <span className="text-[11px] font-mono text-stone-500">
                      गति: {toDevanagariNumerals(auth.moon.speed.toFixed(2))}°/दिन
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-stone-500 text-[10px] block">राशि (Sign):</span>
                      <strong className="text-stone-900 dark:text-stone-100">{auth.moon.rashiName}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 text-[10px] block">भोगांश (Degree):</span>
                      <strong className="text-stone-900 dark:text-stone-100 font-mono">
                        {toDevanagariNumerals((auth.moon.siderealLong % 30).toFixed(2))}°
                      </strong>
                    </div>
                    <div>
                      <span className="text-stone-500 text-[10px] block">नक्षत्र (Nakshatra):</span>
                      <strong className="text-stone-900 dark:text-stone-100">{auth.nakshatra.name}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 text-[10px] block">चरण (Pada):</span>
                      <strong className="text-stone-900 dark:text-stone-100">चरण {toDevanagariNumerals(auth.nakshatra.pada)}</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* 9 Grahas Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    दैनिक नवग्रह स्पष्ट स्थिति (९ ग्रहहरू)
                  </h4>
                  <span className="text-[10px] text-stone-500">लाहिरी अयनांश: {toDevanagariNumerals(auth.ayanamsa.toFixed(2))}°</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 font-bold border-b border-stone-200 dark:border-stone-800">
                      <tr>
                        <th className="p-2.5">ग्रह</th>
                        <th className="p-2.5">राशि</th>
                        <th className="p-2.5">स्पष्ट भोगांश</th>
                        <th className="p-2.5">नक्षत्र</th>
                        <th className="p-2.5">चरण</th>
                        <th className="p-2.5">दैनिक गति</th>
                        <th className="p-2.5">स्थिति</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                      {planets.map((p, idx) => (
                        <tr key={idx} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                          <td className="p-2.5 font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            {p.name}
                          </td>
                          <td className="p-2.5 text-stone-700 dark:text-stone-300">{p.rashiName}</td>
                          <td className="p-2.5 font-mono text-stone-800 dark:text-stone-200">{p.degreeStr}</td>
                          <td className="p-2.5 text-stone-700 dark:text-stone-300">{p.nakshatraName}</td>
                          <td className="p-2.5 text-stone-700 dark:text-stone-300 font-mono">{toDevanagariNumerals(p.pada)}</td>
                          <td className="p-2.5 font-mono text-stone-600 dark:text-stone-400">{p.speed}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.isRetrograde 
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' 
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: FESTIVALS & SHRADDHA */}
          {activeTab === 'festivals' && (
            <div className="space-y-5 animate-fade-in">
              
              {/* Sohra Shraddha Banner if active */}
              {shraddha.isShraddhaPaksha && (
                <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-2">
                  <div className="flex items-center gap-2 text-[#B91C1C] dark:text-amber-400 font-bold text-xs">
                    <BookOpen className="w-4 h-4" />
                    <span>महालय सोह्रश्राद्ध (पितृपक्ष) विवरण</span>
                  </div>
                  <h4 className="text-base font-black text-stone-900 dark:text-stone-100 font-serif">
                    आजको श्राद्ध: {shraddha.shraddhaTithiName}
                  </h4>
                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                    {shraddha.significance}
                  </p>
                  {shraddha.aparahnaKaal && (
                    <div className="text-xs text-amber-900 dark:text-amber-200 font-bold bg-amber-100/80 dark:bg-stone-800 px-3 py-1.5 rounded-xl inline-block mt-1">
                      श्राद्धको उपयुक्त समय: {shraddha.aparahnaKaal}
                    </div>
                  )}
                </div>
              )}

              {/* Master Festivals List */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#B91C1C]" />
                  यस दिनका मुख्य चाडपर्व, राष्ट्रिय दिवस तथा उत्सवहरू
                </h4>

                {festivals.length === 0 ? (
                  <div className="p-8 text-center bg-stone-50 dark:bg-stone-800/40 rounded-3xl border border-stone-200 dark:border-stone-800 text-stone-400 text-xs">
                    यस दिन कुनै विशेष चाडपर्व वा सार्वजनिक बिदा दर्ता भएको छैन। सामान्य नित्य कर्म तथा दैनिक पूजा गर्न सकिनेछ।
                  </div>
                ) : (
                  <div className="space-y-3">
                    {festivals.map((fest) => (
                      <div
                        key={fest.id}
                        className="p-4 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-red-100 text-[#B91C1C] dark:bg-red-950/60 dark:text-red-300 flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                                {fest.title}
                              </h5>
                              {fest.isPublicHoliday && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white">
                                  सार्वजनिक बिदा
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                              {fest.description}
                            </p>
                          </div>
                        </div>

                        {fest.tithiDisplay && (
                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 dark:bg-stone-700 dark:text-amber-300 border border-amber-200 dark:border-stone-600">
                              {fest.tithiDisplay}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 5: DAILY TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#B91C1C]" />
                दैनिक समयरेखा (ब्रह्ममुहूर्त देखि निशीथ कालसम्म)
              </h4>

              <div className="relative border-l-2 border-stone-200 dark:border-stone-700 ml-4 pl-6 space-y-6 text-xs">
                
                {/* Brahma Muhurta */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-stone-900" />
                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 block">
                    बिहान ०४:२८ - ०५:१४ (ब्रह्म मुहूर्त)
                  </span>
                  <p className="text-stone-700 dark:text-stone-300 font-medium mt-0.5">
                    ईश्वर ध्यान, साधना, मन्त्र जप तथा योग-प्राणायामका लागि सर्वोत्तम समय।
                  </p>
                </div>

                {/* Sunrise */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-white dark:ring-stone-900" />
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block">
                    {auth.sunrise.formattedTime} (सूर्योदय - Sunrise)
                  </span>
                  <p className="text-stone-700 dark:text-stone-300 font-medium mt-0.5">
                    उदय तिथि निर्धारण तथा दैनिक वैदिक कर्मकाण्ड शुभारम्भ।
                  </p>
                </div>

                {/* Abhijit Muhurta */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-stone-900" />
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block">
                    दिउँसो ११:४५ - १२:३६ (अभिजित मुहूर्त - सर्वदोष निवारक)
                  </span>
                  <p className="text-stone-700 dark:text-stone-300 font-medium mt-0.5">
                    नयाँ सम्झौता, यात्रा, व्यापार शुभारम्भ तथा कुनै पनि शुभ कार्यका लागि अति उत्तम।
                  </p>
                </div>

                {/* Sunset */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-rose-500 ring-4 ring-white dark:ring-stone-900" />
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 block">
                    {auth.sunset.formattedTime} (सूर्यास्त - Sunset)
                  </span>
                  <p className="text-stone-700 dark:text-stone-300 font-medium mt-0.5">
                    सायं सन्ध्या तथा भगवान् शिवको प्रदोष काल सुरु।
                  </p>
                </div>

                {/* Pradosha Kaal */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-purple-500 ring-4 ring-white dark:ring-stone-900" />
                  <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 block">
                    साँझ ०६:४५ - ०८:१५ (प्रदोष काल)
                  </span>
                  <p className="text-stone-700 dark:text-stone-300 font-medium mt-0.5">
                    शिवालय दर्शन, दीप प्रज्वलन तथा सन्ध्या आरती समय।
                  </p>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 flex items-center justify-between shrink-0 text-xs">
          <span className="text-stone-500 dark:text-stone-400">
            खगोलीय आधार: Meeus ELP2000 / VSOP87 • पञ्चाङ्ग निर्णायक विकास समिति मानक
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-[#B91C1C] hover:bg-red-800 text-white font-bold transition-colors cursor-pointer shadow-xs"
          >
            बन्द गर्नुहोस् (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
