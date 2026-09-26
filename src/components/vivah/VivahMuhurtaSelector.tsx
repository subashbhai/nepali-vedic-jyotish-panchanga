import React, { memo, useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sun,
  Moon,
  Filter,
  Search,
  Printer,
  ChevronRight,
  HeartHandshake,
  Star,
  Compass,
  FileText,
  X,
  Copy,
  Check,
  Award,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { BirthDetails } from '../../types/astrology';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';
import { calculateVivahMilan } from '../../utils/vivahEngine';
import {
  getJulianDay,
  getAyanamsa,
  calculateLagna,
  calculatePlanetaryPositions
} from '../../utils/astroCalculations';
import {
  CLASSICAL_VIVAH_DATES,
  evaluateVivahMuhurtasForCouple,
  EvaluatedVivahMuhurta
} from '../../utils/vivahMuhurtaEngine';

interface VivahMuhurtaSelectorProps {
  profiles: BirthDetails[];
  selectedBoy?: BirthDetails;
  selectedGirl?: BirthDetails;
  onBoyChange?: (p: BirthDetails) => void;
  onGirlChange?: (p: BirthDetails) => void;
  onBackToMilan?: () => void;
}

export const VivahMuhurtaSelector: React.FC<VivahMuhurtaSelectorProps> = memo(({
  profiles,
  selectedBoy,
  selectedGirl,
  onBoyChange,
  onGirlChange,
  onBackToMilan,
}) => {
  // Default Profiles fallback if not provided
  const defaultBoy: BirthDetails = useMemo(() => ({
    id: 'boy_def',
    name: 'वर (केटा)',
    gender: 'male',
    dateBS: '२०५५-०८-१४',
    dateAD: '1998-11-29',
    time: '०६:३०:००',
    location: { name: 'काठमाडौँ', country: 'Nepal', latitude: 27.7172, longitude: 85.3240, timeZone: 5.75 },
  }), []);

  const defaultGirl: BirthDetails = useMemo(() => ({
    id: 'girl_def',
    name: 'कन्या (केटी)',
    gender: 'female',
    dateBS: '२०५७-०२-२५',
    dateAD: '2000-06-07',
    time: '०९:१५:००',
    location: { name: 'पोखरा', country: 'Nepal', latitude: 28.2096, longitude: 83.9856, timeZone: 5.75 },
  }), []);

  const [boy, setBoy] = useState<BirthDetails>(selectedBoy || profiles.find(p => p.gender === 'male') || defaultBoy);
  const [girl, setGirl] = useState<BirthDetails>(selectedGirl || profiles.find(p => p.gender === 'female') || defaultGirl);

  // Sync if external props change
  useEffect(() => {
    if (selectedBoy) setBoy(selectedBoy);
  }, [selectedBoy]);

  useEffect(() => {
    if (selectedGirl) setGirl(selectedGirl);
  }, [selectedGirl]);

  // Compatibility Calculation
  const milanResult = useMemo(() => {
    try {
      return calculateVivahMilan(boy, girl);
    } catch {
      return null;
    }
  }, [boy, girl]);

  // Astrological calculations for Boy & Girl
  const boyAstro = useMemo(() => {
    const dateAD = boy.dateAD || '2026-09-05';
    const time = boy.time || '12:00';
    const tz = boy.location?.timeZone || 5.75;
    const jd = getJulianDay(dateAD, time, tz);
    const ayanamsa = getAyanamsa(jd);
    const lagna = calculateLagna(jd, boy.location?.latitude || 27.7172, boy.location?.longitude || 85.3240, ayanamsa);
    const planets = calculatePlanetaryPositions(jd, ayanamsa, lagna.rashiId);
    return { jd, ayanamsa, lagna, planets };
  }, [boy]);

  const girlAstro = useMemo(() => {
    const dateAD = girl.dateAD || '2026-09-05';
    const time = girl.time || '12:00';
    const tz = girl.location?.timeZone || 5.75;
    const jd = getJulianDay(dateAD, time, tz);
    const ayanamsa = getAyanamsa(jd);
    const lagna = calculateLagna(jd, girl.location?.latitude || 27.7172, girl.location?.longitude || 85.3240, ayanamsa);
    const planets = calculatePlanetaryPositions(jd, ayanamsa, lagna.rashiId);
    return { jd, ayanamsa, lagna, planets };
  }, [girl]);

  // Boy & Girl Moon Rashi and Nakshatra
  const boyMoon = boyAstro.planets.find(p => p.name === 'चन्द्र');
  const girlMoon = girlAstro.planets.find(p => p.name === 'चन्द्र');
  const boyRashiId = boyMoon ? boyMoon.rashiId : 3;
  const boyNakshatraId = boyMoon ? boyMoon.nakshatraId : 5;
  const girlRashiId = girlMoon ? girlMoon.rashiId : 2;
  const girlNakshatraId = girlMoon ? girlMoon.nakshatraId : 4;

  // Filter States
  const [selectedYear, setSelectedYear] = useState<number>(2081);
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = all
  const [onlyFavorable, setOnlyFavorable] = useState<boolean>(true);
  const [minStars, setMinStars] = useState<number>(0);
  const [dayFilter, setDayFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal States
  const [inspectingMuhurta, setInspectingMuhurta] = useState<EvaluatedVivahMuhurta | null>(null);
  const [patrikaMuhurta, setPatrikaMuhurta] = useState<EvaluatedVivahMuhurta | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Evaluated Dates List
  const evaluatedDates = useMemo(() => {
    return evaluateVivahMuhurtasForCouple(
      boyRashiId,
      boyNakshatraId,
      girlRashiId,
      girlNakshatraId,
      {
        selectedYear: selectedYear || undefined,
        selectedMonth: selectedMonth > 0 ? selectedMonth : undefined,
        onlyFavorableForCouple: onlyFavorable,
        minStars,
        dayFilter,
        searchQuery,
      }
    );
  }, [boyRashiId, boyNakshatraId, girlRashiId, girlNakshatraId, selectedYear, selectedMonth, onlyFavorable, minStars, dayFilter, searchQuery]);

  // Quick stats
  const totalCount = evaluatedDates.length;
  const bestCount = evaluatedDates.filter(d => d.starRating === 5).length;
  const goodCount = evaluatedDates.filter(d => d.starRating >= 4).length;

  const handleCopyPatrika = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Bar with Classical Shloka and Navigation */}
      <div className="bg-[#FAF7F0] dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#7A1C1C] text-amber-300 flex items-center justify-center font-bold shadow-2xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#7A1C1C] dark:text-amber-400 font-serif leading-tight flex items-center gap-2">
                <span>शुभ विवाह साइत तथा मुहूर्त छनोट औजार</span>
                <span className="text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                  पञ्चाङ्ग & त्रिबल शुद्धि
                </span>
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                वरको सूर्यबल, कन्याको गुरुबल र दुवैको चन्द्रबल तथा पञ्चाङ्ग शुद्धि अनुसार अनुकूल विवाह लगन साइत
              </p>
            </div>
          </div>

          {onBackToMilan && (
            <button
              onClick={onBackToMilan}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-stone-700 text-[#7A1C1C] dark:text-amber-300 font-bold text-xs border border-[#E6E0D5] dark:border-stone-700 shadow-2xs transition-all cursor-pointer"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>अष्टकूट मिलानमा फर्कनुहोस्</span>
            </button>
          )}
        </div>

        {/* Sanskrit Classical Shloka Banner */}
        <div className="p-3 bg-white dark:bg-stone-800/90 rounded-xl border border-amber-200 dark:border-stone-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="space-y-1 font-serif">
            <div className="text-xs font-bold text-[#7A1C1C] dark:text-amber-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>शास्त्रीय प्रमाण (मुहूर्तचिन्तामणि - विवाह प्रकरण):</span>
            </div>
            <div className="text-xs italic text-stone-800 dark:text-stone-200 font-semibold">
              "वरस्य सूर्यबलं कन्याया गुरुबलं तथा। द्वयोश्चन्द्रबलं ज्ञात्वा कर्तव्यो हि शुभो विधिः॥"
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400">
              अर्थात् विवाहमा केटाको सूर्यबल (३, ६, १०, ११ शुभ), केटीको गुरुबल (२, ५, ७, ९, ११ शुभ), र दुवैको चन्द्रबल तथा नक्षत्र ताराबल मिलेको साइत मात्र पाणिग्रहणका लागि प्रशस्त मानिन्छ।
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-center">
              <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold">अनुकूल साइतहरू</div>
              <div className="text-base font-extrabold text-emerald-900 dark:text-emerald-200 font-mono">
                {toDevanagariNumerals(totalCount)} वटा
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-center">
              <div className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold">सर्वोत्तम ५★ साइत</div>
              <div className="text-base font-extrabold text-amber-900 dark:text-amber-200 font-mono">
                {toDevanagariNumerals(bestCount)} वटा
              </div>
            </div>
          </div>
        </div>

        {/* 2. Matched Couple Astrological Profile Strip */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
          {/* Boy Astrological Details */}
          <div className="md:col-span-5 bg-white dark:bg-stone-800 p-3 rounded-xl border border-amber-200/80 dark:border-stone-700 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#7A1C1C] dark:text-amber-400 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                <span>वर (केटा): {boy.name}</span>
              </span>
              {profiles.length > 1 && (
                <select
                  value={boy.id}
                  onChange={(e) => {
                    const found = profiles.find(p => p.id === e.target.value);
                    if (found) {
                      setBoy(found);
                      if (onBoyChange) onBoyChange(found);
                    }
                  }}
                  className="text-[11px] bg-amber-50 dark:bg-stone-700 border border-amber-200 dark:border-stone-600 rounded px-1.5 py-0.5 font-medium"
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.gender === 'male' ? 'वर' : 'कन्या'})</option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[11px] bg-[#FAF7F0] dark:bg-stone-900 p-2 rounded-lg">
              <div>
                <span className="text-stone-500 text-[10px] block">जन्म चन्द्र राशि:</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{boyMoon?.rashiName || 'मिथुन'}</span>
              </div>
              <div>
                <span className="text-stone-500 text-[10px] block">जन्म नक्षत्र:</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{boyMoon?.nakshatraName || 'मृगशिरा'}</span>
              </div>
              <div>
                <span className="text-stone-500 text-[10px] block">अपेक्षित सूर्यबल:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">३, ६, १०, ११</span>
              </div>
            </div>
          </div>

          {/* Compatibility Milan Badge in Center */}
          <div className="md:col-span-2 flex flex-col items-center justify-center bg-white dark:bg-stone-800 p-2 rounded-xl border border-amber-300 dark:border-amber-800/80 shadow-2xs text-center space-y-1">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">अष्टकूट गुण मिलान</span>
            <div className="text-lg font-black text-[#7A1C1C] dark:text-amber-400 font-serif">
              {milanResult ? `${toDevanagariNumerals(milanResult.totalScore)} / ३६` : '२८ / ३६'}
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
              {milanResult?.overallCompatibility || 'अति उत्तम मिलान'}
            </span>
          </div>

          {/* Girl Astrological Details */}
          <div className="md:col-span-5 bg-white dark:bg-stone-800 p-3 rounded-xl border border-amber-200/80 dark:border-stone-700 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#7A1C1C] dark:text-amber-400 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-amber-600" />
                <span>कन्या (केटी): {girl.name}</span>
              </span>
              {profiles.length > 1 && (
                <select
                  value={girl.id}
                  onChange={(e) => {
                    const found = profiles.find(p => p.id === e.target.value);
                    if (found) {
                      setGirl(found);
                      if (onGirlChange) onGirlChange(found);
                    }
                  }}
                  className="text-[11px] bg-amber-50 dark:bg-stone-700 border border-amber-200 dark:border-stone-600 rounded px-1.5 py-0.5 font-medium"
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.gender === 'female' ? 'कन्या' : 'वर'})</option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-[11px] bg-[#FAF7F0] dark:bg-stone-900 p-2 rounded-lg">
              <div>
                <span className="text-stone-500 text-[10px] block">जन्म चन्द्र राशि:</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{girlMoon?.rashiName || 'वृष'}</span>
              </div>
              <div>
                <span className="text-stone-500 text-[10px] block">जन्म नक्षत्र:</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{girlMoon?.nakshatraName || 'रोहिणी'}</span>
              </div>
              <div>
                <span className="text-stone-500 text-[10px] block">अपेक्षित गुरुबल:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">२, ५, ७, ९, ११</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Filtering and Search Toolbar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-3.5 sm:p-4 shadow-xs space-y-3">
        {/* Row 1: Years & Seasons/Months */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
          {/* BS Year Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-stone-600 dark:text-stone-300 font-serif">वर्ष (वि.सं.):</span>
            {[2081, 2082, 2083, 2084].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-[#7A1C1C] text-white shadow-2xs dark:bg-amber-500 dark:text-stone-950'
                    : 'bg-[#FAF7F0] dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-100 dark:hover:bg-stone-700'
                }`}
              >
                {toDevanagariNumerals(yr)}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#FAF7F0] dark:bg-stone-800 p-1 rounded-lg border border-[#E6E0D5] dark:border-stone-700 text-xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-stone-700 text-[#7A1C1C] dark:text-amber-400 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              कार्ड दृश्य
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-stone-700 text-[#7A1C1C] dark:text-amber-400 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              तालिका दृश्य
            </button>
          </div>
        </div>

        {/* Row 2: Months / Wedding Seasons Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-stone-600 dark:text-stone-300 mr-1">लगन महिना:</span>
          {[
            { id: 0, label: 'सबै महिना' },
            { id: 8, label: 'मंसिर' },
            { id: 10, label: 'माघ' },
            { id: 11, label: 'फागुन' },
            { id: 1, label: 'वैशाख' },
            { id: 2, label: 'जेठ' },
            { id: 3, label: 'असार' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMonth(m.id)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                selectedMonth === m.id
                  ? 'bg-amber-600 text-white font-bold shadow-2xs'
                  : 'bg-[#FAF7F0] dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-amber-50 border border-transparent hover:border-amber-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Row 3: Couple Filter Toggle, Day of Week, and Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Couple Matched Only Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyFavorable}
              onChange={(e) => setOnlyFavorable(e.target.checked)}
              className="w-4 h-4 rounded text-amber-700 focus:ring-amber-500 accent-[#7A1C1C]"
            />
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>यी दुवै जातकका लागि त्रिबल अनुकूल साइतहरू मात्र देखाउनुहोस्</span>
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            {/* Minimum Star Filter */}
            <select
              value={minStars}
              onChange={(e) => setMinStars(Number(e.target.value))}
              className="text-xs bg-[#FAF7F0] dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-700 dark:text-stone-300"
            >
              <option value={0}>सबै गुणस्तर (१★ देखि ५★)</option>
              <option value={4}>उत्तम तथा सर्वोत्तम मात्र (४★+)</option>
              <option value={5}>सर्वोत्तम मात्र (५★)</option>
            </select>

            {/* Day Filter */}
            <select
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              className="text-xs bg-[#FAF7F0] dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-700 dark:text-stone-300"
            >
              <option value="all">सबै वार</option>
              <option value="शुक्रवार">शुक्रवार (परम शुभ)</option>
              <option value="बिहीवार">बिहीवार (गुरु वार)</option>
              <option value="बुधवार">बुधवार (सौम्य)</option>
              <option value="सोमवार">सोमवार (चन्द्र वार)</option>
            </select>

            {/* Realtime Search Input */}
            <div className="relative min-w-[170px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="मिति, नक्षत्र वा तिथि..."
                className="w-full pl-7 pr-2 py-1.5 bg-[#FAF7F0] dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-lg text-xs text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-hidden focus:border-amber-600"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2 top-2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Results List: Cards Grid View */}
      {evaluatedDates.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-8 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 font-serif">
            कुनै साइत फेला परेन
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
            चयन गरिएका फिल्टर वा वर्षमा यी दुवै जातकका लागि उपयुक्त साइत भेटिएन। कृपया महिना वा वर्ष परिवर्तन गर्नुहोस् अथवा "यी दुवै जातकका लागि मात्र" विकल्प अनचेक गर्नुहोस्।
          </p>
          <button
            onClick={() => {
              setSelectedMonth(0);
              setMinStars(0);
              setDayFilter('all');
              setSearchQuery('');
              setOnlyFavorable(false);
            }}
            className="px-4 py-2 bg-[#7A1C1C] text-white text-xs font-bold rounded-xl shadow-xs"
          >
            सबै फिल्टरहरू हटाउनुहोस्
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {evaluatedDates.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                item.starRating === 5
                  ? 'bg-gradient-to-b from-amber-50/70 to-white dark:from-stone-900 dark:to-stone-850 border-amber-300 dark:border-amber-800/80 ring-1 ring-amber-300/40'
                  : item.starRating === 4
                  ? 'bg-white dark:bg-stone-900 border-[#E6E0D5] dark:border-stone-800'
                  : 'bg-stone-50/80 dark:bg-stone-900/80 border-stone-200 dark:border-stone-800 opacity-90'
              }`}
            >
              <div className="space-y-3">
                {/* Card Top: Date & Stars */}
                <div className="flex items-start justify-between gap-2 border-b border-[#E6E0D5]/80 dark:border-stone-800 pb-2.5">
                  <div>
                    <div className="text-sm font-bold text-[#7A1C1C] dark:text-amber-400 font-serif flex items-center gap-1.5">
                      <span>{item.bsDateStr}</span>
                      <span className="text-xs text-stone-600 dark:text-stone-400 font-normal">({item.dayOfWeek})</span>
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      ई.सं. {item.adDateStr}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-0.5 text-amber-500 justify-end">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-3.5 h-3.5 ${
                            idx < item.starRating
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-stone-300 dark:text-stone-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 font-mono">
                      {toDevanagariNumerals(item.synergyScore)}% अनुकूल
                    </span>
                  </div>
                </div>

                {/* Panchanga Quick Info */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAF7F0] dark:bg-stone-800/80 p-2.5 rounded-xl">
                  <div>
                    <span className="text-[10px] text-stone-500 block">तिथि र पक्ष:</span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">{item.tithi}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block">शुभ नक्षत्र:</span>
                    <span className="font-semibold text-[#7A1C1C] dark:text-amber-400">{item.nakshatra}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block">विवाह लग्न:</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200">{item.weddingLagna}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block">साइत समय:</span>
                    <span className="font-bold text-stone-800 dark:text-stone-200 font-mono text-[11px]">{toDevanagariNumerals(item.timeSlot)}</span>
                  </div>
                </div>

                {/* Tribala Shuddhi Indicators */}
                <div className="space-y-1.5 pt-0.5">
                  <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center justify-between">
                    <span>त्रिबल शुद्धि परीक्षा:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{item.verdictNepali}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {/* Boy Sun */}
                    <div className={`p-1.5 rounded-lg border flex items-center justify-between ${
                      item.boySunBala.isFavorable 
                        ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-200' 
                        : 'bg-red-50 dark:bg-red-950/40 border-red-200 text-red-800'
                    }`}>
                      <span className="flex items-center gap-1 font-medium">
                        <Sun className="w-3 h-3 text-amber-600" />
                        <span>वर सूर्यबल:</span>
                      </span>
                      <span className="font-bold font-mono">{toDevanagariNumerals(item.boySunBala.houseFromMoon)} औं ({item.boySunBala.grade})</span>
                    </div>

                    {/* Girl Jupiter */}
                    <div className={`p-1.5 rounded-lg border flex items-center justify-between ${
                      item.girlGuruBala.isFavorable 
                        ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-200' 
                        : 'bg-red-50 dark:bg-red-950/40 border-red-200 text-red-800'
                    }`}>
                      <span className="flex items-center gap-1 font-medium">
                        <Compass className="w-3 h-3 text-amber-600" />
                        <span>कन्या गुरुबल:</span>
                      </span>
                      <span className="font-bold font-mono">{toDevanagariNumerals(item.girlGuruBala.houseFromMoon)} औं ({item.girlGuruBala.grade})</span>
                    </div>

                    {/* Moon Bala */}
                    <div className="p-1.5 rounded-lg border bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Moon className="w-3 h-3 text-stone-500" />
                        <span>चन्द्रबल:</span>
                      </span>
                      <span className="font-semibold text-[10px]">
                        वर {item.boyChandraBala.grade} / कन्या {item.girlChandraBala.grade}
                      </span>
                    </div>

                    {/* Tara Bala */}
                    <div className="p-1.5 rounded-lg border bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-stone-500" />
                        <span>ताराबल:</span>
                      </span>
                      <span className="font-semibold text-[10px] truncate">
                        {item.boyTaraBala.taraNameNepali}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Classical Notes */}
                <p className="text-[11px] text-stone-600 dark:text-stone-400 bg-white dark:bg-stone-800 p-2 rounded-lg border border-stone-200 dark:border-stone-700 italic">
                  "{item.classicalNotes}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#E6E0D5] dark:border-stone-800 flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setInspectingMuhurta(item)}
                  className="flex-1 py-1.5 px-2 bg-[#FAF7F0] dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-[#7A1C1C] dark:text-amber-400 font-bold text-xs rounded-lg transition-colors border border-amber-200 dark:border-stone-700 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>विस्तृत शुद्धि</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPatrikaMuhurta(item)}
                  className="py-1.5 px-3 bg-[#7A1C1C] hover:bg-[#5C1515] text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                  title="विवाह लगन पत्रिका मुद्रण"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>लग्न पत्रिका</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 5. Results List: Table View */
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF7F0] dark:bg-stone-800 border-b border-[#E6E0D5] dark:border-stone-700 text-[#7A1C1C] dark:text-amber-300 font-bold">
                  <th className="py-2.5 px-3">मिति (वि.सं.) र बार</th>
                  <th className="py-2.5 px-3">तिथि र पक्ष</th>
                  <th className="py-2.5 px-3">शुभ नक्षत्र</th>
                  <th className="py-2.5 px-3">विवाह लग्न साइत समय</th>
                  <th className="py-2.5 px-3">वर सूर्यबल</th>
                  <th className="py-2.5 px-3">कन्या गुरुबल</th>
                  <th className="py-2.5 px-3">अनुकूलता</th>
                  <th className="py-2.5 px-3 text-right">कार्य</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E0D5]/70 dark:divide-stone-800 text-[#2D241E] dark:text-stone-200">
                {evaluatedDates.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/40 dark:hover:bg-stone-800/40">
                    <td className="py-2.5 px-3 font-bold text-stone-900 dark:text-stone-100 font-serif">
                      <div>{item.bsDateStr}</div>
                      <div className="text-[10px] text-stone-500 font-normal">({item.dayOfWeek})</div>
                    </td>
                    <td className="py-2.5 px-3">{item.tithi}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#7A1C1C] dark:text-amber-400">{item.nakshatra}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-stone-800 dark:text-stone-200">{item.weddingLagna}</div>
                      <div className="text-[10px] text-stone-500 font-mono">{toDevanagariNumerals(item.timeSlot)}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.boySunBala.isFavorable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {toDevanagariNumerals(item.boySunBala.houseFromMoon)} औं ({item.boySunBala.grade})
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.girlGuruBala.isFavorable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {toDevanagariNumerals(item.girlGuruBala.houseFromMoon)} औं ({item.girlGuruBala.grade})
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: item.starRating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-500" />
                        ))}
                      </div>
                      <span className="text-[10px] text-stone-500 font-mono">{toDevanagariNumerals(item.synergyScore)}%</span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectingMuhurta(item)}
                          className="px-2 py-1 bg-amber-100 dark:bg-stone-700 text-[#7A1C1C] dark:text-amber-300 font-bold text-[11px] rounded hover:bg-amber-200"
                        >
                          विवरण
                        </button>
                        <button
                          onClick={() => setPatrikaMuhurta(item)}
                          className="px-2 py-1 bg-[#7A1C1C] text-white font-bold text-[11px] rounded hover:bg-[#5C1515]"
                        >
                          पत्रिका
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Detail Inspection Modal */}
      {inspectingMuhurta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-amber-200 dark:border-stone-800 max-w-2xl w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Top */}
            <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-[#7A1C1C] dark:text-amber-400 font-serif">
                  विस्तृत विवाह लगन शुद्धि विवेचना
                </h3>
              </div>
              <button
                onClick={() => setInspectingMuhurta(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 hover:bg-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Date and Highlights */}
            <div className="bg-[#FAF7F0] dark:bg-stone-800 p-3.5 rounded-xl border border-amber-200/80 dark:border-stone-700 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-bold text-[#7A1C1C] dark:text-amber-400 font-serif">
                  {inspectingMuhurta.bsDateStr} ({inspectingMuhurta.dayOfWeek}) - ई.सं. {inspectingMuhurta.adDateStr}
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-bold text-xs border border-emerald-300">
                  {inspectingMuhurta.verdictNepali}
                </span>
              </div>
              <div className="text-xs text-stone-700 dark:text-stone-300 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
                <div><strong>तिथि:</strong> {inspectingMuhurta.tithi}</div>
                <div><strong>नक्षत्र:</strong> {inspectingMuhurta.nakshatra}</div>
                <div><strong>योग:</strong> {inspectingMuhurta.yoga}</div>
                <div><strong>करण:</strong> {inspectingMuhurta.karana}</div>
              </div>
            </div>

            {/* Deep Tribala Shuddhi Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#7A1C1C] dark:text-amber-400 font-serif uppercase tracking-wider">
                १. त्रिबल शुद्धि परीक्षा (सूर्यबल, गुरुबल, चन्द्रबल)
              </h4>

              {/* Boy Surya Bala */}
              <div className="p-3 rounded-xl border bg-white dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-stone-900 dark:text-stone-100">
                  <span className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400">
                    <Sun className="w-4 h-4" />
                    <span>वर (केटा: {boy.name}) को सूर्यबल विचार:</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-stone-700 text-amber-900 dark:text-amber-300 font-mono">
                    {toDevanagariNumerals(inspectingMuhurta.boySunBala.houseFromMoon)} औं भाव ({inspectingMuhurta.boySunBala.grade})
                  </span>
                </div>
                <p className="text-stone-700 dark:text-stone-300">{inspectingMuhurta.boySunBala.statusNepali}</p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                  <strong>शान्ति उपाय / सुझाव:</strong> {inspectingMuhurta.boySunBala.remedyNepali}
                </p>
              </div>

              {/* Girl Guru Bala */}
              <div className="p-3 rounded-xl border bg-white dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-stone-900 dark:text-stone-100">
                  <span className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400">
                    <Compass className="w-4 h-4" />
                    <span>कन्या (केटी: {girl.name}) को गुरुबल विचार:</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-stone-700 text-amber-900 dark:text-amber-300 font-mono">
                    {toDevanagariNumerals(inspectingMuhurta.girlGuruBala.houseFromMoon)} औं भाव ({inspectingMuhurta.girlGuruBala.grade})
                  </span>
                </div>
                <p className="text-stone-700 dark:text-stone-300">{inspectingMuhurta.girlGuruBala.statusNepali}</p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                  <strong>शान्ति उपाय / सुझाव:</strong> {inspectingMuhurta.girlGuruBala.remedyNepali}
                </p>
              </div>

              {/* Both Chandra Bala */}
              <div className="p-3 rounded-xl border bg-white dark:bg-stone-800/90 border-stone-200 dark:border-stone-700 space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-stone-900 dark:text-stone-100">
                  <span className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400">
                    <Moon className="w-4 h-4" />
                    <span>वर तथा कन्या दुवैको चन्द्रबल विचार:</span>
                  </span>
                </div>
                <p className="text-stone-700 dark:text-stone-300">{inspectingMuhurta.boyChandraBala.statusNepali}</p>
                <p className="text-stone-700 dark:text-stone-300">{inspectingMuhurta.girlChandraBala.statusNepali}</p>
              </div>
            </div>

            {/* Lagna & Auspicious Hours */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#7A1C1C] dark:text-amber-400 font-serif uppercase tracking-wider">
                २. शुभ विवाह लग्न तथा चौघडिया समय
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-[#FAF7F0] dark:bg-stone-800 p-3 rounded-xl border border-stone-200 dark:border-stone-700">
                <div>
                  <span className="text-stone-500 text-[10px] block">विवाह लग्न:</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">{inspectingMuhurta.weddingLagna}</span>
                  <span className="text-[10px] text-stone-500 block mt-0.5">समय: {toDevanagariNumerals(inspectingMuhurta.timeSlot)}</span>
                </div>
                <div>
                  <span className="text-stone-500 text-[10px] block">अभिजित मुहूर्त तथा चौघडिया:</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">{toDevanagariNumerals(inspectingMuhurta.abhijitTime)}</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mt-0.5">{inspectingMuhurta.choghadiya}</span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-[#E6E0D5] dark:border-stone-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = inspectingMuhurta;
                  setInspectingMuhurta(null);
                  setPatrikaMuhurta(target);
                }}
                className="py-2 px-4 bg-[#7A1C1C] hover:bg-[#5C1515] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>यो साइतको विवाह लग्न पत्रिका तयार गर्नुहोस्</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Printable Traditional Marriage Lagna Certificate Modal */}
      {patrikaMuhurta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-amber-300 dark:border-stone-800 max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Action Bar */}
            <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-[#7A1C1C] dark:text-amber-400 font-serif">
                  विवाह लग्न पत्रिका (विवाह साइत पत्र)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('printable-lagna-patrika');
                    if (el) {
                      window.print();
                    }
                  }}
                  className="px-3 py-1.5 bg-[#7A1C1C] text-white text-xs font-bold rounded-lg shadow-xs hover:bg-[#5C1515] flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>प्रिन्ट गर्नुहोस्</span>
                </button>
                <button
                  onClick={() => setPatrikaMuhurta(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 hover:bg-stone-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Traditional Certificate Content Area */}
            <div
              id="printable-lagna-patrika"
              className="bg-[#FFFDF9] dark:bg-stone-950 p-6 sm:p-8 rounded-2xl border-4 border-double border-amber-600/80 text-stone-900 dark:text-stone-100 space-y-5 font-serif relative"
            >
              {/* Certificate Top Invocation */}
              <div className="text-center space-y-1">
                <div className="text-sm font-bold text-[#7A1C1C] dark:text-amber-400 tracking-widest uppercase">
                  ।। श्री गणेशाय नमः ।। श्री कुलदेवतायै नमः ।।
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-[#7A1C1C] dark:text-amber-400 tracking-wide">
                  शुभ विवाह लग्न पत्रिका
                </h1>
                <div className="text-xs text-stone-600 dark:text-stone-400 italic">
                  (पञ्चाङ्ग शुद्धि तथा वर-कन्या त्रिबल शुद्धि प्रमाणित साइत पत्र)
                </div>
              </div>

              {/* Sanskrit Mangalacharan */}
              <div className="p-3 bg-amber-50/70 dark:bg-stone-900 rounded-xl border border-amber-200 dark:border-stone-800 text-center text-xs italic text-amber-950 dark:text-amber-200 leading-relaxed font-semibold">
                शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम्।<br />
                लक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं वन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम्॥
              </div>

              {/* Biodata Table */}
              <div className="grid grid-cols-2 gap-4 border-y-2 border-amber-200 dark:border-stone-800 py-3 text-xs">
                <div className="space-y-1 pr-2 border-r border-amber-200 dark:border-stone-800">
                  <div className="font-bold text-[#7A1C1C] dark:text-amber-400 text-sm">वर (केटा): {boy.name}</div>
                  <div>जन्म मिति: {boy.dateBS || '२०५५-०८-१४'}</div>
                  <div>चन्द्र राशि: {boyMoon?.rashiName || 'मिथुन'} राशि</div>
                  <div>जन्म नक्षत्र: {boyMoon?.nakshatraName || 'मृगशिरा'} नक्षत्र</div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    सूर्यबल: {toDevanagariNumerals(patrikaMuhurta.boySunBala.houseFromMoon)} औं भाव (पूर्ण शुद्ध)
                  </div>
                </div>

                <div className="space-y-1 pl-2">
                  <div className="font-bold text-[#7A1C1C] dark:text-amber-400 text-sm">कन्या (केटी): {girl.name}</div>
                  <div>जन्म मिति: {girl.dateBS || '२०५७-०२-२५'}</div>
                  <div>चन्द्र राशि: {girlMoon?.rashiName || 'वृष'} राशि</div>
                  <div>जन्म नक्षत्र: {girlMoon?.nakshatraName || 'रोहिणी'} नक्षत्र</div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    गुरुबल: {toDevanagariNumerals(patrikaMuhurta.girlGuruBala.houseFromMoon)} औं भाव (सर्वोत्तम)
                  </div>
                </div>
              </div>

              {/* Exact Wedding Muhurta Specifications */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-sm text-[#7A1C1C] dark:text-amber-400 text-center uppercase tracking-wide">
                  विवाह साइत तथा शुभ मुहूर्त विवरण
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-amber-50/50 dark:bg-stone-900 p-3.5 rounded-xl border border-amber-200 dark:border-stone-800 font-mono">
                  <div>
                    <span className="text-[10px] text-stone-500 font-sans block">शुभ मिति:</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">{patrikaMuhurta.bsDateStr}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 font-sans block">वार:</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">{patrikaMuhurta.dayOfWeek}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 font-sans block">ईस्वी संवत्:</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">{patrikaMuhurta.adDateStr}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 font-sans block">तिथि र पक्ष:</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">{patrikaMuhurta.tithi}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 font-sans block">शुभ नक्षत्र:</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">{patrikaMuhurta.nakshatra}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 font-sans block">विवाह लग्न:</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">{patrikaMuhurta.weddingLagna}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-stone-500 font-sans block">शुभ साइत समय (गोदाह/कन्यादान):</span>
                    <span className="font-bold text-[#7A1C1C] dark:text-amber-400 text-xs">
                      {toDevanagariNumerals(patrikaMuhurta.timeSlot)} (अभिजित: {toDevanagariNumerals(patrikaMuhurta.abhijitTime)})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 font-sans block">चौघडिया:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{patrikaMuhurta.choghadiya}</span>
                  </div>
                </div>
              </div>

              {/* Classical Astrologer Endorsement */}
              <div className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed border-t border-amber-200 dark:border-stone-800 pt-3">
                <p>
                  <strong>प्रमाणीकरण:</strong> उपरोक्त मिति र लग्नमा वर र कन्या दुवैको ग्रह गोचर अनुसार त्रिबल शुद्धि (सूर्यबल, गुरुबल, चन्द्रबल) तथा भद्रा रहित शुद्ध पञ्चाङ्ग गणना गरिएको छ। यो साइत पाणिग्रहण संस्कारका लागि सर्वथा उत्तम एवं कल्याणकारी छ।
                </p>
              </div>

              {/* Signatures */}
              <div className="flex items-end justify-between pt-6 text-xs text-stone-700 dark:text-stone-300">
                <div className="text-center">
                  <div className="w-32 border-b border-stone-400 mx-auto mb-1" />
                  <span>वर पक्ष पुरोहित</span>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-stone-400 mx-auto mb-1" />
                  <span>कन्या पक्ष पुरोहित</span>
                </div>
                <div className="text-center">
                  <div className="w-36 border-b border-stone-400 mx-auto mb-1" />
                  <span className="font-bold text-[#7A1C1C] dark:text-amber-400">ज्योतिषी / पञ्चाङ्गकार हस्ताक्षर</span>
                </div>
              </div>
            </div>

            {/* Copy Lagna text button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-stone-500">लग्न विवरण सामाजिक सञ्जाल वा निमन्त्रणामा पठाउन प्रतिलिपि गर्न सकिन्छ।</span>
              <button
                type="button"
                onClick={() => handleCopyPatrika(
                  `।। शुभ विवाह लग्न पत्रिका ।।\nवर: ${boy.name} (${boyMoon?.rashiName || 'मिथुन'} राशि)\nकन्या: ${girl.name} (${girlMoon?.rashiName || 'वृष'} राशि)\nशुभ मिति: ${patrikaMuhurta.bsDateStr} (${patrikaMuhurta.dayOfWeek})\nतिथि: ${patrikaMuhurta.tithi}\nनक्षत्र: ${patrikaMuhurta.nakshatra}\nविवाह लग्न: ${patrikaMuhurta.weddingLagna}\nशुभ समय: ${patrikaMuhurta.timeSlot}\n(त्रिबल शुद्धि प्रमाणित)`
                )}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-amber-50 cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'प्रतिलिपि भयो!' : 'पाठ प्रतिलिपि'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
