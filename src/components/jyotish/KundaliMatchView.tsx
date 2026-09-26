import React, { memo, useState, useMemo, useRef } from 'react';
import { 
  HeartHandshake, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  User, 
  Edit3, 
  BookOpen, 
  ShieldCheck, 
  FileText, 
  Printer, 
  X,
  Check,
  ChevronDown,
  Star,
  ChevronRight
} from 'lucide-react';
import { BirthDetails, PlanetPosition, LagnaInfo, Gender, VivahMilanResult } from '../../types/astrology';
import { calculateVivahMilan } from '../../utils/vivahEngine';
import { 
  getJulianDay, 
  getAyanamsa, 
  calculateLagna, 
  calculatePlanetaryPositions, 
  RASHI_DATA 
} from '../../utils/astroCalculations';
import { generateFull5LevelVimshottariDasha, formatMsToBSAndNepaliTime } from '../../utils/dashaEngine';
import { calculateTribhagiDasha, calculateYoginiDasha } from '../../utils/multiDashaEngine';
import { toDevanagariNumerals, convertADToBS, convertBSToAD } from '../../utils/nepaliCalendar';
import { convertADToBSFull } from '../../utils/bsCalendarData';
import { printElement } from '../../utils/pdfGenerator';
import { evaluateVivahMuhurtasForCouple } from '../../utils/vivahMuhurtaEngine';

interface KundaliMatchViewProps {
  profiles: BirthDetails[];
  activeProfile?: BirthDetails;
  onOpenMuhurtaTool?: (boy: BirthDetails, girl: BirthDetails) => void;
}

type DashaTabType = 'vimshottari' | 'yogini' | 'tribhagi';
type PlanetTabType = 'boy' | 'girl';

export const KundaliMatchView: React.FC<KundaliMatchViewProps> = memo(({
  profiles,
  activeProfile,
  onOpenMuhurtaTool,
}) => {
  const resultRef = useRef<HTMLDivElement>(null);

  // Default initial Boy & Girl profiles
  const defaultBoy: BirthDetails = useMemo(() => ({
    id: 'boy_default',
    name: 'केटा (वर)',
    gender: 'male',
    dateBS: '२०८३-०५-२०',
    dateAD: '2026-09-05',
    time: '१२:०६:४६',
    timeSeconds: '४६',
    location: { name: 'काठमाडौँ', country: 'Nepal', latitude: 27.7172, longitude: 85.3240, timeZone: 5.75 },
  }), []);

  const defaultGirl: BirthDetails = useMemo(() => ({
    id: 'girl_default',
    name: 'केटी (कन्या)',
    gender: 'female',
    dateBS: '२०८३-०५-२०',
    dateAD: '2026-09-05',
    time: '१२:०६:४६',
    timeSeconds: '४६',
    location: { name: 'काठमाडौँ', country: 'Nepal', latitude: 27.7172, longitude: 85.3240, timeZone: 5.75 },
  }), []);

  // Selected or custom profile states
  const [boyProfile, setBoyProfile] = useState<BirthDetails>(() => {
    const male = profiles.find((p) => p.gender === 'male');
    if (male) return male;
    if (activeProfile && activeProfile.gender === 'male') return activeProfile;
    return profiles[0] || defaultBoy;
  });

  const [girlProfile, setGirlProfile] = useState<BirthDetails>(() => {
    const female = profiles.find((p) => p.gender === 'female');
    if (female) return female;
    if (activeProfile && activeProfile.gender === 'female') return activeProfile;
    return profiles[1] || profiles[0] || defaultGirl;
  });

  // Edit Modal State
  const [editingTarget, setEditingTarget] = useState<'boy' | 'girl' | null>(null);
  const [editFormData, setEditFormData] = useState<{
    selectedProfileId: string;
    name: string;
    dateBS: string;
    dateAD: string;
    time: string;
    locationName: string;
  }>({
    selectedProfileId: '',
    name: '',
    dateBS: '',
    dateAD: '',
    time: '',
    locationName: '',
  });

  // Sub-tabs for Dasha & Planet tables
  const [boyDashaTab, setBoyDashaTab] = useState<DashaTabType>('vimshottari');
  const [girlDashaTab, setGirlDashaTab] = useState<DashaTabType>('vimshottari');
  const [planetTab, setPlanetTab] = useState<PlanetTabType>('boy');

  // Open Edit Modal
  const handleOpenEdit = (target: 'boy' | 'girl') => {
    const current = target === 'boy' ? boyProfile : girlProfile;
    setEditingTarget(target);
    setEditFormData({
      selectedProfileId: current.id || '',
      name: current.name,
      dateBS: current.dateBS || '२०८३-०५-२०',
      dateAD: current.dateAD || '2026-09-05',
      time: current.time || '१२:०६:४६',
      locationName: current.location?.name || 'काठमाडौँ',
    });
  };

  const handleSaveEdit = () => {
    if (!editingTarget) return;
    const isBoy = editingTarget === 'boy';
    const updated: BirthDetails = {
      id: editFormData.selectedProfileId || `${editingTarget}_${Date.now()}`,
      name: editFormData.name || (isBoy ? 'केटा (वर)' : 'केटी (कन्या)'),
      gender: isBoy ? 'male' : 'female',
      dateBS: editFormData.dateBS,
      dateAD: editFormData.dateAD,
      time: editFormData.time,
      location: {
        name: editFormData.locationName || 'काठमाडौँ',
        country: 'Nepal',
        latitude: 27.7172,
        longitude: 85.3240,
        timeZone: 5.75,
      },
    };
    if (isBoy) {
      setBoyProfile(updated);
    } else {
      setGirlProfile(updated);
    }
    setEditingTarget(null);
  };

  // Scroll to Phalit / Verdict Section
  const handleScrollToPhalit = () => {
    if (resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Astrological Calculations for Boy
  const boyAstro = useMemo(() => {
    const dateAD = boyProfile.dateAD || '2026-09-05';
    const time = boyProfile.time || '12:00';
    const tz = boyProfile.location?.timeZone || 5.75;
    const jd = getJulianDay(dateAD, time, tz);
    const ayanamsa = getAyanamsa(jd);
    const lagna = calculateLagna(jd, boyProfile.location?.latitude || 27.7172, boyProfile.location?.longitude || 85.3240, ayanamsa);
    const planets = calculatePlanetaryPositions(jd, ayanamsa, lagna.rashiId);
    return { jd, ayanamsa, lagna, planets };
  }, [boyProfile]);

  // Astrological Calculations for Girl
  const girlAstro = useMemo(() => {
    const dateAD = girlProfile.dateAD || '2026-09-05';
    const time = girlProfile.time || '12:00';
    const tz = girlProfile.location?.timeZone || 5.75;
    const jd = getJulianDay(dateAD, time, tz);
    const ayanamsa = getAyanamsa(jd);
    const lagna = calculateLagna(jd, girlProfile.location?.latitude || 27.7172, girlProfile.location?.longitude || 85.3240, ayanamsa);
    const planets = calculatePlanetaryPositions(jd, ayanamsa, lagna.rashiId);
    return { jd, ayanamsa, lagna, planets };
  }, [girlProfile]);

  // Comprehensive Vivah Milan Result (Ashtakoot 36 Guna)
  const matchResult: VivahMilanResult = useMemo(() => {
    return calculateVivahMilan(boyProfile, girlProfile);
  }, [boyProfile, girlProfile]);

  // Boy Dasha calculations
  const boyDashas = useMemo(() => {
    const moon = boyAstro.planets.find((p) => p.name === 'चन्द्र') || boyAstro.planets[0];
    const dateAD = boyProfile.dateAD || '2026-09-05';
    const time = boyProfile.time || '12:00';

    const vim = generateFull5LevelVimshottariDasha(moon, dateAD, time);
    const yog = calculateYoginiDasha(moon, dateAD, time);
    const tri = calculateTribhagiDasha(moon, dateAD, time);

    return { vim, yog, tri };
  }, [boyProfile, boyAstro]);

  // Girl Dasha calculations
  const girlDashas = useMemo(() => {
    const moon = girlAstro.planets.find((p) => p.name === 'चन्द्र') || girlAstro.planets[0];
    const dateAD = girlProfile.dateAD || '2026-09-05';
    const time = girlProfile.time || '12:00';

    const vim = generateFull5LevelVimshottariDasha(moon, dateAD, time);
    const yog = calculateYoginiDasha(moon, dateAD, time);
    const tri = calculateTribhagiDasha(moon, dateAD, time);

    return { vim, yog, tri };
  }, [girlProfile, girlAstro]);

  // Format header strings e.g. "केटा - बि.स २०८३/५/२० १२:६:४६ बेलुका"
  const formatHeaderString = (p: BirthDetails, label: string) => {
    let rawBs = '२०८३/५/२०';
    if (p.dateBS) {
      rawBs = p.dateBS.replace(/-/g, '/');
    } else if (p.dateAD) {
      const bsObj = convertADToBSFull(p.dateAD);
      rawBs = (bsObj.formattedBS || '२०८३-०५-२०').replace(/-/g, '/');
    }
    const rawTime = p.time || '१२:०६:४६';
    const hours = parseInt(rawTime.split(':')[0], 10) || 12;
    const period = hours >= 12 ? 'बेलुका' : 'बिहान';
    return `${label} - बि.स ${toDevanagariNumerals(rawBs)} ${toDevanagariNumerals(rawTime)} ${period}`;
  };

  // Auspicious Vivah Dates dynamically tailored to Boy's Sun strength, Girl's Jupiter strength, and Panchanga
  const auspiciousVivahDates = useMemo(() => {
    const boyMoon = boyAstro.planets.find((p) => p.name === 'चन्द्र');
    const girlMoon = girlAstro.planets.find((p) => p.name === 'चन्द्र');
    const boyRashi = boyMoon ? boyMoon.rashiId : 3;
    const boyNak = boyMoon ? boyMoon.nakshatraId : 5;
    const girlRashi = girlMoon ? girlMoon.rashiId : 2;
    const girlNak = girlMoon ? girlMoon.nakshatraId : 4;

    return evaluateVivahMuhurtasForCouple(
      boyRashi,
      boyNak,
      girlRashi,
      girlNak,
      { onlyFavorableForCouple: true }
    ).slice(0, 8);
  }, [boyAstro, girlAstro]);

  return (
    <div className="space-y-4">
      {/* 1. Top Bar: Boy & Girl Birth Info Summary with Edit buttons and [फलादेश] Button */}
      <div className="bg-[#FAF7F0] dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 rounded-xl px-4 py-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-6">
          {/* Boy Info */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 font-serif">
              {formatHeaderString(boyProfile, 'केटा')}
            </span>
            <button
              onClick={() => handleOpenEdit('boy')}
              title="केटाको विवरण सम्पादन गर्नुहोस्"
              className="w-7 h-7 flex items-center justify-center bg-[#D97706] hover:bg-[#b45309] text-white rounded-md shadow-2xs transition-transform active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Girl Info */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 font-serif">
              {formatHeaderString(girlProfile, 'केटी')}
            </span>
            <button
              onClick={() => handleOpenEdit('girl')}
              title="केटीको विवरण सम्पादन गर्नुहोस्"
              className="w-7 h-7 flex items-center justify-center bg-[#D97706] hover:bg-[#b45309] text-white rounded-md shadow-2xs transition-transform active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Side Action: [फलादेश] Button */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => printElement('kundali_milan_printable_content')}
            title="कुण्डली मिलान प्रिन्ट गर्नुहोस्"
            className="flex items-center gap-1 bg-white dark:bg-stone-800 hover:bg-stone-50 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">प्रिन्ट</span>
          </button>

          <button
            onClick={handleScrollToPhalit}
            className="flex items-center gap-1.5 bg-[#D97706] hover:bg-[#b45309] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-2xs transition-all active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>फलादेश</span>
          </button>
        </div>
      </div>

      <div id="kundali_milan_printable_content" className="space-y-4">
        {/* 2. Middle Section: Side-by-Side North Indian Kundalis (Boy & Girl) + Ashtakoot Milan Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          {/* Boy Kundali Card (Lg: 4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-stone-900 rounded-xl border border-[#E6E0D5] dark:border-stone-800 p-3 shadow-2xs flex flex-col items-center">
            <div className="text-xs font-bold text-[#7A1C1C] dark:text-amber-400 mb-1.5 font-serif flex items-center gap-1">
              <span>वर (केटा) लग्न कुण्डली</span>
            </div>
            
            {/* North Indian Diamond Chart Layout */}
            <NorthIndianChart lagna={boyAstro.lagna} planets={boyAstro.planets} />

            {/* Boy Manglik Badge */}
            <div className="mt-2.5">
              {matchResult.mangalDoshaBoy.isManglik ? (
                <span className="inline-block px-4 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
                  माङ्गलिक
                </span>
              ) : (
                <span className="inline-block px-4 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                  सामान्य / निर्दोष
                </span>
              )}
            </div>
          </div>

          {/* Girl Kundali Card (Lg: 4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-stone-900 rounded-xl border border-[#E6E0D5] dark:border-stone-800 p-3 shadow-2xs flex flex-col items-center">
            <div className="text-xs font-bold text-[#7A1C1C] dark:text-amber-400 mb-1.5 font-serif flex items-center gap-1">
              <span>कन्या (केटी) लग्न कुण्डली</span>
            </div>

            {/* North Indian Diamond Chart Layout */}
            <NorthIndianChart lagna={girlAstro.lagna} planets={girlAstro.planets} />

            {/* Girl Manglik Badge */}
            <div className="mt-2.5">
              {matchResult.mangalDoshaGirl.isManglik ? (
                <span className="inline-block px-4 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
                  माङ्गलिक
                </span>
              ) : (
                <span className="inline-block px-4 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                  सामान्य / निर्दोष
                </span>
              )}
            </div>
          </div>

          {/* Ashtakoot Milan Table (Lg: 4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-stone-900 rounded-xl border border-[#E6E0D5] dark:border-stone-800 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F0] dark:bg-stone-800/80 border-b border-[#E6E0D5] dark:border-stone-700 text-[#7A1C1C] dark:text-amber-300 font-bold">
                    <th className="py-2 px-2.5">कूट</th>
                    <th className="py-2 px-2.5">केटा</th>
                    <th className="py-2 px-2.5">केटी</th>
                    <th className="py-2 px-2 text-center">अधिकतम</th>
                    <th className="py-2 px-2 text-center">प्राप्त</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E0D5]/70 dark:divide-stone-800 text-[#2D241E] dark:text-stone-200">
                  {/* Row 1: Varna */}
                  <tr className="hover:bg-amber-50/30 dark:hover:bg-stone-800/40">
                    <td className="py-1.5 px-2.5 font-bold text-stone-900 dark:text-stone-100">वर्ण</td>
                    <td className="py-1.5 px-2.5">{cleanAttr(matchResult.ashtakoot[0]?.boyAttr || 'शूद्र')}</td>
                    <td className="py-1.5 px-2.5">{cleanAttr(matchResult.ashtakoot[0]?.girlAttr || 'शूद्र')}</td>
                    <td className="py-1.5 px-2 text-center font-semibold">१</td>
                    <td className="py-1.5 px-2 text-center font-bold text-[#7A1C1C] dark:text-amber-300">
                      {toDevanagariNumerals(matchResult.ashtakoot[0]?.obtainedPoints ?? 1)}
                    </td>
                  </tr>

                  {/* Row 2: Vashya */}
                  <tr className="hover:bg-amber-50/30 dark:hover:bg-stone-800/40">
                    <td className="py-1.5 px-2.5 font-bold text-stone-900 dark:text-stone-100">वश्य</td>
                    <td className="py-1.5 px-2.5">{cleanAttr(matchResult.ashtakoot[1]?.boyAttr || 'द्विपद')}</td>
                    <td className="py-1.5 px-2.5">{cleanAttr(matchResult.ashtakoot[1]?.girlAttr || 'द्विपद')}</td>
                    <td className="py-1.5 px-2 text-center font-semibold">२</td>
                    <td className="py-1.5 px-2 text-center font-bold text-[#7A1C1C] dark:text-amber-300">
                      {toDevanagariNumerals(matchResult.ashtakoot[1]?.obtainedPoints ?? 2)}
                    </td>
                  </tr>

                  {/* Row 3: Tara */}
                  <tr className="hover:bg-amber-50/30 dark:hover:bg-stone-800/40">
                    <td className="py-1.5 px-2.5 font-bold text-stone-900 dark:text-stone-100">तारा</td>
                    <td className="py-1.5 px-2.5">{cleanAttr(matchResult.ashtakoot[2]?.boyAttr || 'प्रत्यरि तारा')}</td>
                    <td className="py-1.5 px-2.5">{cleanAttr(matchResult.ashtakoot[2]?.girlAttr || 'प्रत्यरि तारा')}</td>
                    <td className="py-1.5 px-2 text-center font-semibold">३</td>
                    <td className="py-1.5 px-2 text-center font-bold text-[#7A1C1C] dark:text-amber-300">
                      {toDevanagariNumerals(matchResult.ashtakoot[2]?.obtainedPoints ?? 3)}
                    </td>
                  </tr>

                  {/* Row 4: Yoni */}
                  <tr className="hover:bg-amber-50/30 dark:hover:bg-stone-800/40">
                    <td className="py-1.5 px-2.5 font-bold text-stone-900 dark:text-stone-100">योनि</td>
                    <td className="py-1.5 px-2.5">{cleanAttr(matchResult.ashtakoot[3]?.boyAttr || 'सर्प')}</td>
                    <td className="py-1.5 px-2.5">{cleanAttr(matchResult.ashtakoot[3]?.girlAttr || 'सर्प')}</td>
                    <td className="py-1.5 px-2 text-center font-semibold">४</td>
                    <td className="py-1.5 px-2 text-center font-bold text-[#7A1C1C] dark:text-amber-300">
                      {toDevanagariNumerals(matchResult.ashtakoot[3]?.obtainedPoints ?? 4)}
                    </td>
                  </tr>

                  {/* Row 5: Graha Maitri */}
                  <tr className="hover:bg-amber-50/30 dark:hover:bg-stone-800/40">
                    <td className="py-1.5 px-2.5 font-bold text-stone-900 dark:text-stone-100">ग्रह मैत्री</td>
                    <td className="py-1.5 px-2.5">{cleanAttr(matchResult.ashtakoot[4]?.boyAttr || 'बुध')}</td>
                    <td className="py-1.5 px-2.5">{cleanAttr(matchResult.ashtakoot[4]?.girlAttr || 'बुध')}</td>
                    <td className="py-1.5 px-2 text-center font-semibold">५</td>
                    <td className="py-1.5 px-2 text-center font-bold text-[#7A1C1C] dark:text-amber-300">
                      {toDevanagariNumerals(matchResult.ashtakoot[4]?.obtainedPoints ?? 5)}
                    </td>
                  </tr>

                  {/* Row 6: Gana */}
                  <tr className="hover:bg-amber-50/30 dark:hover:bg-stone-800/40">
                    <td className="py-1.5 px-2.5 font-bold text-stone-900 dark:text-stone-100">गण</td>
                    <td className="py-1.5 px-2.5">{cleanAttr(matchResult.ashtakoot[5]?.boyAttr || 'देव')}</td>
                    <td className="py-1.5 px-2.5">{cleanAttr(matchResult.ashtakoot[5]?.girlAttr || 'देव')}</td>
                    <td className="py-1.5 px-2 text-center font-semibold">६</td>
                    <td className="py-1.5 px-2 text-center font-bold text-[#7A1C1C] dark:text-amber-300">
                      {toDevanagariNumerals(matchResult.ashtakoot[5]?.obtainedPoints ?? 6)}
                    </td>
                  </tr>

                  {/* Row 7: Bhakoot */}
                  <tr className="hover:bg-amber-50/30 dark:hover:bg-stone-800/40">
                    <td className="py-1.5 px-2.5 font-bold text-stone-900 dark:text-stone-100">भकूट</td>
                    <td className="py-1.5 px-2.5">{cleanAttr(matchResult.ashtakoot[6]?.boyAttr || 'मिथुन')}</td>
                    <td className="py-1.5 px-2.5">{cleanAttr(matchResult.ashtakoot[6]?.girlAttr || 'मिथुन')}</td>
                    <td className="py-1.5 px-2 text-center font-semibold">७</td>
                    <td className="py-1.5 px-2 text-center font-bold text-[#7A1C1C] dark:text-amber-300">
                      {toDevanagariNumerals(matchResult.ashtakoot[6]?.obtainedPoints ?? 7)}
                    </td>
                  </tr>

                  {/* Row 8: Nadi */}
                  <tr className="hover:bg-amber-50/30 dark:hover:bg-stone-800/40">
                    <td className="py-1.5 px-2.5 font-bold text-stone-900 dark:text-stone-100">नाडी</td>
                    <td className="py-1.5 px-2.5">{cleanAttr(matchResult.ashtakoot[7]?.boyAttr || 'मध्य')}</td>
                    <td className="py-1.5 px-2.5">{cleanAttr(matchResult.ashtakoot[7]?.girlAttr || 'मध्य')}</td>
                    <td className="py-1.5 px-2 text-center font-semibold">८</td>
                    <td className="py-1.5 px-2 text-center font-bold text-[#7A1C1C] dark:text-amber-300">
                      {toDevanagariNumerals(matchResult.ashtakoot[7]?.obtainedPoints ?? 0)}
                    </td>
                  </tr>

                  {/* Total Row */}
                  <tr className="bg-[#FAF7F0] dark:bg-stone-800 font-bold border-t border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100">
                    <td className="py-2 px-2.5">जम्मा</td>
                    <td className="py-2 px-2.5"></td>
                    <td className="py-2 px-2.5"></td>
                    <td className="py-2 px-2 text-center font-mono">३६</td>
                    <td className="py-2 px-2 text-center font-mono text-sm text-[#7A1C1C] dark:text-amber-300">
                      {toDevanagariNumerals(matchResult.totalScore)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. Lower Section: Boy Dasha | Girl Dasha | Planetary Positions Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-start">
          {/* Column 1: वरको दशा (Boy Dasha) - 4 cols */}
          <div className="lg:col-span-4 bg-white dark:bg-stone-900 rounded-xl border border-[#E6E0D5] dark:border-stone-800 shadow-2xs overflow-hidden">
            {/* Dasha Sub-tabs Header */}
            <div className="flex items-center border-b border-[#E6E0D5] dark:border-stone-800 bg-[#FAF7F0] dark:bg-stone-800/80 text-[11px] font-bold">
              <button
                onClick={() => setBoyDashaTab('vimshottari')}
                className={`flex-1 py-2 px-1 text-center transition-colors ${
                  boyDashaTab === 'vimshottari'
                    ? 'text-[#7A1C1C] dark:text-amber-400 bg-white dark:bg-stone-900 border-b-2 border-[#7A1C1C] dark:border-amber-400'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                विंशोत्तरी दशा
              </button>
              <button
                onClick={() => setBoyDashaTab('yogini')}
                className={`flex-1 py-2 px-1 text-center transition-colors ${
                  boyDashaTab === 'yogini'
                    ? 'text-[#7A1C1C] dark:text-amber-400 bg-white dark:bg-stone-900 border-b-2 border-[#7A1C1C] dark:border-amber-400'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                योगिनी दशा
              </button>
              <button
                onClick={() => setBoyDashaTab('tribhagi')}
                className={`flex-1 py-2 px-1 text-center transition-colors ${
                  boyDashaTab === 'tribhagi'
                    ? 'text-[#7A1C1C] dark:text-amber-400 bg-white dark:bg-stone-900 border-b-2 border-[#7A1C1C] dark:border-amber-400'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                त्रिभागी दशा
              </button>
            </div>

            {/* Dasha Table Content */}
            <div className="p-2">
              <div className="text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1 px-1">
                {boyDashaTab === 'vimshottari' && 'विंशोत्तरी दशा (वर)'}
                {boyDashaTab === 'yogini' && 'योगिनी दशा (वर)'}
                {boyDashaTab === 'tribhagi' && 'त्रिभागी दशा (वर)'}
              </div>

              <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F0] dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[11px]">
                      <th className="py-1 px-2">दशा</th>
                      <th className="py-1 px-2 text-right">समय</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E0D5]/60 dark:divide-stone-800 text-[11px]">
                    {boyDashaTab === 'vimshottari' &&
                      boyDashas.vim.mahadashas.map((m, idx) => (
                        <tr key={idx} className={m.isCurrent ? 'bg-amber-50/80 dark:bg-amber-950/40 font-bold' : ''}>
                          <td className="py-1.5 px-2">
                            {m.isCurrent ? (
                              <span className="text-[#7A1C1C] dark:text-amber-400 font-extrabold flex items-center gap-1">
                                {m.planet} <span className="text-red-600">➔</span>
                              </span>
                            ) : (
                              <span>{m.planet}</span>
                            )}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono text-stone-700 dark:text-stone-300">
                            {toDevanagariNumerals(cleanDashaTime(m.startDateBS))} - {toDevanagariNumerals(cleanDashaTime(m.endDateBS))}
                          </td>
                        </tr>
                      ))}

                    {boyDashaTab === 'yogini' &&
                      boyDashas.yog.mahadashas.map((y, idx) => (
                        <tr key={idx} className={y.isCurrent ? 'bg-amber-50/80 dark:bg-amber-950/40 font-bold' : ''}>
                          <td className="py-1.5 px-2">
                            {y.isCurrent ? (
                              <span className="text-[#7A1C1C] dark:text-amber-400 font-extrabold flex items-center gap-1">
                                {y.yogini.name} <span className="text-red-600">➔</span>
                              </span>
                            ) : (
                              <span>{y.yogini.name} ({y.yogini.lord})</span>
                            )}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono text-stone-700 dark:text-stone-300">
                            {toDevanagariNumerals(cleanDashaTime(y.startDateBS))} - {toDevanagariNumerals(cleanDashaTime(y.endDateBS))}
                          </td>
                        </tr>
                      ))}

                    {boyDashaTab === 'tribhagi' &&
                      boyDashas.tri.mahadashas.map((t, idx) => (
                        <tr key={idx} className={t.isCurrent ? 'bg-amber-50/80 dark:bg-amber-950/40 font-bold' : ''}>
                          <td className="py-1.5 px-2">
                            {t.isCurrent ? (
                              <span className="text-[#7A1C1C] dark:text-amber-400 font-extrabold flex items-center gap-1">
                                {t.planet} <span className="text-red-600">➔</span>
                              </span>
                            ) : (
                              <span>{t.planet}</span>
                            )}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono text-stone-700 dark:text-stone-300">
                            {toDevanagariNumerals(cleanDashaTime(t.startDateBS))} - {toDevanagariNumerals(cleanDashaTime(t.endDateBS))}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Column 2: कन्याको दशा (Girl Dasha) - 4 cols */}
          <div className="lg:col-span-4 bg-white dark:bg-stone-900 rounded-xl border border-[#E6E0D5] dark:border-stone-800 shadow-2xs overflow-hidden">
            {/* Dasha Sub-tabs Header */}
            <div className="flex items-center border-b border-[#E6E0D5] dark:border-stone-800 bg-[#FAF7F0] dark:bg-stone-800/80 text-[11px] font-bold">
              <button
                onClick={() => setGirlDashaTab('vimshottari')}
                className={`flex-1 py-2 px-1 text-center transition-colors ${
                  girlDashaTab === 'vimshottari'
                    ? 'text-[#7A1C1C] dark:text-amber-400 bg-white dark:bg-stone-900 border-b-2 border-[#7A1C1C] dark:border-amber-400'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                विंशोत्तरी दशा
              </button>
              <button
                onClick={() => setGirlDashaTab('yogini')}
                className={`flex-1 py-2 px-1 text-center transition-colors ${
                  girlDashaTab === 'yogini'
                    ? 'text-[#7A1C1C] dark:text-amber-400 bg-white dark:bg-stone-900 border-b-2 border-[#7A1C1C] dark:border-amber-400'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                योगिनी दशा
              </button>
              <button
                onClick={() => setGirlDashaTab('tribhagi')}
                className={`flex-1 py-2 px-1 text-center transition-colors ${
                  girlDashaTab === 'tribhagi'
                    ? 'text-[#7A1C1C] dark:text-amber-400 bg-white dark:bg-stone-900 border-b-2 border-[#7A1C1C] dark:border-amber-400'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                त्रिभागी दशा
              </button>
            </div>

            {/* Dasha Table Content */}
            <div className="p-2">
              <div className="text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1 px-1">
                {girlDashaTab === 'vimshottari' && 'विंशोत्तरी दशा (कन्या)'}
                {girlDashaTab === 'yogini' && 'योगिनी दशा (कन्या)'}
                {girlDashaTab === 'tribhagi' && 'त्रिभागी दशा (कन्या)'}
              </div>

              <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F0] dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[11px]">
                      <th className="py-1 px-2">दशा</th>
                      <th className="py-1 px-2 text-right">समय</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E0D5]/60 dark:divide-stone-800 text-[11px]">
                    {girlDashaTab === 'vimshottari' &&
                      girlDashas.vim.mahadashas.map((m, idx) => (
                        <tr key={idx} className={m.isCurrent ? 'bg-amber-50/80 dark:bg-amber-950/40 font-bold' : ''}>
                          <td className="py-1.5 px-2">
                            {m.isCurrent ? (
                              <span className="text-[#7A1C1C] dark:text-amber-400 font-extrabold flex items-center gap-1">
                                {m.planet} <span className="text-red-600">➔</span>
                              </span>
                            ) : (
                              <span>{m.planet}</span>
                            )}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono text-stone-700 dark:text-stone-300">
                            {toDevanagariNumerals(cleanDashaTime(m.startDateBS))} - {toDevanagariNumerals(cleanDashaTime(m.endDateBS))}
                          </td>
                        </tr>
                      ))}

                    {girlDashaTab === 'yogini' &&
                      girlDashas.yog.mahadashas.map((y, idx) => (
                        <tr key={idx} className={y.isCurrent ? 'bg-amber-50/80 dark:bg-amber-950/40 font-bold' : ''}>
                          <td className="py-1.5 px-2">
                            {y.isCurrent ? (
                              <span className="text-[#7A1C1C] dark:text-amber-400 font-extrabold flex items-center gap-1">
                                {y.yogini.name} <span className="text-red-600">➔</span>
                              </span>
                            ) : (
                              <span>{y.yogini.name} ({y.yogini.lord})</span>
                            )}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono text-stone-700 dark:text-stone-300">
                            {toDevanagariNumerals(cleanDashaTime(y.startDateBS))} - {toDevanagariNumerals(cleanDashaTime(y.endDateBS))}
                          </td>
                        </tr>
                      ))}

                    {girlDashaTab === 'tribhagi' &&
                      girlDashas.tri.mahadashas.map((t, idx) => (
                        <tr key={idx} className={t.isCurrent ? 'bg-amber-50/80 dark:bg-amber-950/40 font-bold' : ''}>
                          <td className="py-1.5 px-2">
                            {t.isCurrent ? (
                              <span className="text-[#7A1C1C] dark:text-amber-400 font-extrabold flex items-center gap-1">
                                {t.planet} <span className="text-red-600">➔</span>
                              </span>
                            ) : (
                              <span>{t.planet}</span>
                            )}
                          </td>
                          <td className="py-1.5 px-2 text-right font-mono text-stone-700 dark:text-stone-300">
                            {toDevanagariNumerals(cleanDashaTime(t.startDateBS))} - {toDevanagariNumerals(cleanDashaTime(t.endDateBS))}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Column 3: Planetary Positions Table [केटा | केटी] - 4 cols */}
          <div className="lg:col-span-4 bg-white dark:bg-stone-900 rounded-xl border border-[#E6E0D5] dark:border-stone-800 shadow-2xs overflow-hidden">
            {/* Person Tabs Header */}
            <div className="flex items-center border-b border-[#E6E0D5] dark:border-stone-800 bg-[#FAF7F0] dark:bg-stone-800/80 text-[11px] font-bold">
              <button
                onClick={() => setPlanetTab('boy')}
                className={`flex-1 py-2 px-2 text-center transition-colors ${
                  planetTab === 'boy'
                    ? 'text-[#7A1C1C] dark:text-amber-400 bg-white dark:bg-stone-900 border-b-2 border-[#7A1C1C] dark:border-amber-400'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                केटा
              </button>
              <button
                onClick={() => setPlanetTab('girl')}
                className={`flex-1 py-2 px-2 text-center transition-colors ${
                  planetTab === 'girl'
                    ? 'text-[#7A1C1C] dark:text-amber-400 bg-white dark:bg-stone-900 border-b-2 border-[#7A1C1C] dark:border-amber-400'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                केटी
              </button>
            </div>

            {/* Planetary Table Content */}
            <div className="p-2">
              <div className="overflow-x-auto max-h-[220px] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF7F0] dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-[11px]">
                      <th className="py-1 px-2">ग्रह</th>
                      <th className="py-1 px-2">राशि</th>
                      <th className="py-1 px-2">अंश</th>
                      <th className="py-1 px-2">नक्षत्र</th>
                      <th className="py-1 px-2 text-center">चरण</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E0D5]/60 dark:divide-stone-800 text-[11px]">
                    {/* Lagna Row */}
                    {planetTab === 'boy' ? (
                      <tr className="bg-amber-50/50 dark:bg-stone-800/40 font-semibold">
                        <td className="py-1.5 px-2 font-bold text-[#7A1C1C] dark:text-amber-300">लग्न</td>
                        <td className="py-1.5 px-2">{boyAstro.lagna.rashiName}</td>
                        <td className="py-1.5 px-2 font-mono">
                          {boyAstro.lagna.formattedDegree || `${toDevanagariNumerals(boyAstro.lagna.degree.toFixed(2))}°`}
                        </td>
                        <td className="py-1.5 px-2">{boyAstro.lagna.nakshatraName}</td>
                        <td className="py-1.5 px-2 text-center font-mono">{toDevanagariNumerals(boyAstro.lagna.pada)}</td>
                      </tr>
                    ) : (
                      <tr className="bg-amber-50/50 dark:bg-stone-800/40 font-semibold">
                        <td className="py-1.5 px-2 font-bold text-[#7A1C1C] dark:text-amber-300">लग्न</td>
                        <td className="py-1.5 px-2">{girlAstro.lagna.rashiName}</td>
                        <td className="py-1.5 px-2 font-mono">
                          {girlAstro.lagna.formattedDegree || `${toDevanagariNumerals(girlAstro.lagna.degree.toFixed(2))}°`}
                        </td>
                        <td className="py-1.5 px-2">{girlAstro.lagna.nakshatraName}</td>
                        <td className="py-1.5 px-2 text-center font-mono">{toDevanagariNumerals(girlAstro.lagna.pada)}</td>
                      </tr>
                    )}

                    {/* Planets List */}
                    {(planetTab === 'boy' ? boyAstro.planets : girlAstro.planets).map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                        <td className="py-1.5 px-2 font-bold text-stone-900 dark:text-stone-100">
                          {p.name}
                          {p.isRetrograde && <span className="text-[9px] text-amber-600 ml-0.5">(व)</span>}
                        </td>
                        <td className="py-1.5 px-2">{p.rashiName}</td>
                        <td className="py-1.5 px-2 font-mono">
                          {p.formattedDegree || `${toDevanagariNumerals(p.degree)}° ${toDevanagariNumerals(p.minutes)}' ${toDevanagariNumerals(p.seconds)}"`}
                        </td>
                        <td className="py-1.5 px-2">{p.nakshatraName}</td>
                        <td className="py-1.5 px-2 text-center font-mono">{toDevanagariNumerals(p.pada)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Final Section: विवाह निर्णय, शास्त्रीय श्लोक प्रमाण तथा विवाहको उत्तम साइत */}
        <div ref={resultRef} className="space-y-4 pt-2">
          {/* 4A. विवाह निर्णय (Compatibility Verdict: विवाह गर्न मिल्छ कि मिल्दैन?) */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-[#7A1C1C] dark:text-amber-400 flex items-center justify-center font-bold">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#7A1C1C] dark:text-amber-400 font-serif">
                    विवाह निर्णय तथा समग्र ज्योतिषीय फलादेश
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    केटा र केटी बीच विवाह गर्न मिल्छ कि मिल्दैन? (शास्त्रीय गुण, दोष र परिहार विश्लेषण)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-500">गुण प्राप्ताङ्क:</span>
                <span className="text-lg font-black text-[#7A1C1C] dark:text-amber-400 font-mono">
                  {toDevanagariNumerals(matchResult.totalScore)} / ३६
                </span>
              </div>
            </div>

            {/* Verdict Callout Banner */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              matchResult.totalScore >= 24
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : matchResult.totalScore >= 18
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-current shrink-0" />
                  <span className="text-sm sm:text-base font-extrabold font-serif">
                    निर्णय: {matchResult.totalScore >= 18 ? 'विवाह गर्न मिल्छ (शुभ तथा अनुकूल)' : 'विशेष ज्योतिषी परामर्श तथा शान्ति आवश्यक'}
                  </span>
                </div>
                <p className="text-xs leading-relaxed">
                  {matchResult.totalScore >= 24
                    ? `कुल ३६ गुणमध्ये ${toDevanagariNumerals(matchResult.totalScore)} गुण प्राप्त भएकाले यो विवाह अति उत्तम श्रेणीमा पर्दछ। दम्पतीबीच सुमधुर सम्बन्ध, वंश वृद्धि र ऐश्वर्य रहनेछ।`
                    : matchResult.totalScore >= 18
                    ? `कुल ३६ गुणमध्ये ${toDevanagariNumerals(matchResult.totalScore)} गुण प्राप्त भएकाले न्यूनतम १८ गुणको सीमा पार गरेको छ (विवाह योग्य मध्यम मिलान)।`
                    : `कुल ३६ गुणमध्ये ${toDevanagariNumerals(matchResult.totalScore)} गुण प्राप्त भएकाले सामान्यतया १८ भन्दा न्यून छ। कुनै परिहार नियम लागू हुन्छ कि तलका शास्त्रीय प्रमाण हेर्नुहोस्।`}
                </p>
              </div>
              <div className="shrink-0">
                <span className="px-3 py-1 rounded-full text-xs font-bold border border-current bg-white/80 dark:bg-stone-900/80">
                  {matchResult.overallCompatibility}
                </span>
              </div>
            </div>

            {/* Detailed Dosha & Parikshya Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Nadi Status */}
              <div className="p-3 rounded-xl bg-[#FAF7F0] dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-stone-800 dark:text-stone-200">नाडी स्थिति (Nadi):</span>
                  <span className={matchResult.ashtakoot[7]?.obtainedPoints > 0 ? 'text-emerald-600' : 'text-amber-600'}>
                    {matchResult.ashtakoot[7]?.obtainedPoints > 0 ? 'निर्दोष (८/८)' : 'समान नाडी'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-400">
                  {matchResult.ashtakoot[7]?.descriptionNepali}
                </p>
              </div>

              {/* Bhakoot Status */}
              <div className="p-3 rounded-xl bg-[#FAF7F0] dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-stone-800 dark:text-stone-200">भकूट स्थिति (Bhakoot):</span>
                  <span className={matchResult.ashtakoot[6]?.obtainedPoints > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    {matchResult.ashtakoot[6]?.obtainedPoints > 0 ? 'अनुकूल (७/७)' : 'दोष स्थिति (०/७)'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-400">
                  {matchResult.ashtakoot[6]?.descriptionNepali}
                </p>
              </div>

              {/* Mangal Dosha Status */}
              <div className="p-3 rounded-xl bg-[#FAF7F0] dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-stone-800 dark:text-stone-200">मङ्गल दोष (Kuja):</span>
                  <span className={matchResult.isMangalDoshaCancelled ? 'text-emerald-600' : 'text-stone-700 dark:text-stone-300'}>
                    {matchResult.isMangalDoshaCancelled ? 'दोष शमन/परिहार' : 'सामञ्जस्य स्थिति'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-400">
                  {matchResult.mangalDoshaBoy.isManglik && matchResult.mangalDoshaGirl.isManglik
                    ? 'दुवै जना माङ्गलिक भएकाले शास्त्रीय नियम अनुसार मङ्गल दोषले मङ्गल दोषलाई काटेको (शमन भएको) छ।'
                    : matchResult.isMangalDoshaCancelled
                    ? matchResult.cancellationReason
                    : 'कुण्डलीमा मङ्गल दोष सामान्य वा अनुकूल स्थितिमा छ।'}
                </p>
              </div>
            </div>
          </div>

          {/* 4B. शास्त्रीय श्लोकहरू तथा प्रमाण (Classical Vedic Shlokas with Meanings) */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="border-b border-[#E6E0D5] dark:border-stone-800 pb-2.5 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#7A1C1C] dark:text-amber-400" />
              <h3 className="text-sm sm:text-base font-bold text-[#7A1C1C] dark:text-amber-400 font-serif">
                शास्त्रीय श्लोक प्रमाण तथा दार्शनिक व्याख्या (Vedic Authorities & Shlokas)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Shloka 1: Gun Milan Standard */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F0] dark:bg-stone-800/80 border border-[#E6E0D5] dark:border-stone-700 space-y-2">
                <div className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                  १. गुण प्राप्ताङ्क फल प्रमाण (मुहूर्तचिन्तामणि)
                </div>
                <div className="font-serif text-xs font-extrabold text-[#7A1C1C] dark:text-amber-400 leading-relaxed bg-amber-50/80 dark:bg-stone-900 p-2.5 rounded-lg border border-amber-200 dark:border-stone-700">
                  अष्टादशाधिके शस्ते मध्यमे विंशतेः परम्।<br />
                  अष्टाविंशोत्तरादुत्तमे परिणीता सुखं वसेत्॥
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                  <strong>शास्त्रीय अर्थ:</strong> कुल ३६ गुणमध्ये १८ भन्दा कम आएमा विवाह त्याज्य हुन्छ। १८ देखि २४ गुण आएमा मध्यम, २४ देखि २८ आएमा उत्तम, र २८ भन्दा बढी गुण आएमा अति उत्तम मानिन्छ, जसले दाम्पत्य जीवनमा अक्षुण्ण सुख र समृद्धि दिन्छ।
                </p>
              </div>

              {/* Shloka 2: Nadi & Varna Consideration */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F0] dark:bg-stone-800/80 border border-[#E6E0D5] dark:border-stone-700 space-y-2">
                <div className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                  २. नाडी विचार तथा वर्ण प्रधानता (नारद संहिता)
                </div>
                <div className="font-serif text-xs font-extrabold text-[#7A1C1C] dark:text-amber-400 leading-relaxed bg-amber-50/80 dark:bg-stone-900 p-2.5 rounded-lg border border-amber-200 dark:border-stone-700">
                  नाडीदोषस्तु विप्राणां वर्णदोषस्तु क्षत्रिये।<br />
                  गणाधिक्यं तु वैश्येषु शूद्राणां योनिरेव च॥
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                  <strong>शास्त्रीय अर्थ:</strong> विवाह मिलानमा ब्राह्मण वर्णका लागि नाडी दोष, क्षत्रियका लागि वर्ण, वैश्यका लागि गण र शूद्रका लागि योनि दोष विशेष विचारणीय हुन्छ।
                </p>
              </div>

              {/* Shloka 3: Cancellation of Nadi & Bhakoot */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F0] dark:bg-stone-800/80 border border-[#E6E0D5] dark:border-stone-700 space-y-2">
                <div className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                  ३. नाडी तथा भकूट दोष परिहार (ज्योतिर्विदभरणम्)
                </div>
                <div className="font-serif text-xs font-extrabold text-[#7A1C1C] dark:text-amber-400 leading-relaxed bg-amber-50/80 dark:bg-stone-900 p-2.5 rounded-lg border border-amber-200 dark:border-stone-700">
                  दम्पत्योर्जन्मर्क्षैक्ये राश्यैक्ये वा शुभप्रदम्।<br />
                  नाडीदोषो न गणदोषो भकूटदोषो न विद्यते॥
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                  <strong>शास्त्रीय अर्थ:</strong> यदि वर र कन्याको चन्द्र राशि एउटै भएमा वा एउटै नक्षत्र भई पाद (चरण) भिन्न भएमा नाडी दोष, गण दोष तथा भकूट दोष लाग्दैन, ती स्वतः शमन हुन्छन्।
                </p>
              </div>

              {/* Shloka 4: Mangal Dosha Samya Pariksha */}
              <div className="p-3.5 rounded-xl bg-[#FAF7F0] dark:bg-stone-800/80 border border-[#E6E0D5] dark:border-stone-700 space-y-2">
                <div className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide">
                  ४. मङ्गल दोष साम्य श्लोक (बृहत्पाराशर होराशास्त्र)
                </div>
                <div className="font-serif text-xs font-extrabold text-[#7A1C1C] dark:text-amber-400 leading-relaxed bg-amber-50/80 dark:bg-stone-900 p-2.5 rounded-lg border border-amber-200 dark:border-stone-700">
                  धने व्यये च पाताले यामित्रे चाष्टमे कुजे।<br />
                  दम्पत्योर्जन्मकाले च कुजदोषेण शम्यते॥
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                  <strong>शास्त्रीय अर्थ:</strong> लग्नबाट १, २, ४, ७, ८, १२ भावमा मङ्गल भएमा कुज दोष हुन्छ। तर दुवै जनाको कुण्डलीमा समान प्रकारले मङ्गल अवस्थित भएमा दोषले दोषलाई काटेर दीर्घायु र सौम्य दाम्पत्य दिन्छ।
                </p>
              </div>
            </div>
          </div>

          {/* 4C. पञ्चाङ्ग तथा दुवैको ग्रह स्थिति अनुसार विवाहको उत्तम मिति तथा लगन साइत */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#E6E0D5] dark:border-stone-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#7A1C1C] dark:text-amber-400" />
                <h3 className="text-sm sm:text-base font-bold text-[#7A1C1C] dark:text-amber-400 font-serif">
                  पञ्चाङ्ग तथा दुवैको ग्रह अनुकूलता अनुसार विवाहको उत्तम मिति तथा लगन साइत
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                  त्रिबल शुद्धि (सूर्यबल, गुरुबल र चन्द्रबल) प्रमाणित
                </span>
                {onOpenMuhurtaTool && (
                  <button
                    type="button"
                    onClick={() => onOpenMuhurtaTool(boyProfile, girlProfile)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#7A1C1C] hover:bg-[#5C1515] text-white text-xs font-bold rounded-lg shadow-2xs transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>पूर्ण मुहूर्त छनोट औजार खोल्नुहोस्</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Classical Tribala Shuddhi Summary */}
            <div className="p-3 bg-[#FAF7F0] dark:bg-stone-800 rounded-xl border border-[#E6E0D5] dark:border-stone-700 text-xs leading-relaxed space-y-1 font-serif">
              <div className="font-extrabold text-[#7A1C1C] dark:text-amber-400">
                शास्त्रीय नियम: "वरस्य सूर्यबलं कन्याया गुरुबलं तथा। द्वयोश्चन्द्रबलं ज्ञात्वा कर्तव्यो हि शुभो विधिः॥"
              </div>
              <p className="text-stone-700 dark:text-stone-300">
                वर (केटा) का लागि सूर्य गोचर १, ३, ६, १०, ११ मा शुभ; कन्या (केटी) का लागि देवगुरु बृहस्पति गोचर २, ५, ७, ९, ११ मा सर्वोत्तम; तथा दुवैको जन्म राशिबाट चन्द्रमा ३, ६, ७, १०, ११ भावमा रहँदा र पञ्चाङ्गमा भद्रा (विष्टि करण) एवं गुरु-शुक्र अस्त नभएको समयमा विवाह लगन सिद्ध हुन्छ।
              </p>
            </div>

            {/* Muhurta Dates Table */}
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E0D5]/70 dark:divide-stone-800 text-[#2D241E] dark:text-stone-200">
                  {auspiciousVivahDates.map((item) => (
                    <tr key={item.id} className="hover:bg-amber-50/40 dark:hover:bg-stone-800/40">
                      <td className="py-2.5 px-3 font-bold text-stone-900 dark:text-stone-100 font-serif">
                        <div>{item.bsDateStr}</div>
                        <div className="text-[10px] text-stone-500 font-normal">({item.dayOfWeek})</div>
                      </td>
                      <td className="py-2.5 px-3">{item.tithi}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#7A1C1C] dark:text-amber-400">
                        {item.nakshatra}
                      </td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {editingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-5 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
              <h3 className="font-bold text-[#7A1C1C] dark:text-amber-400 font-serif text-sm">
                {editingTarget === 'boy' ? 'वर (केटा)' : 'कन्या (केटी)'} को जन्म विवरण सम्पादन
              </h3>
              <button
                onClick={() => setEditingTarget(null)}
                className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Choose from existing saved profiles */}
            {profiles && profiles.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  सेभ गरिएको प्रोफाइलबाट छान्नुहोस्:
                </label>
                <select
                  value={editFormData.selectedProfileId}
                  onChange={(e) => {
                    const found = profiles.find((p) => p.id === e.target.value);
                    if (found) {
                      setEditFormData({
                        selectedProfileId: found.id || '',
                        name: found.name,
                        dateBS: found.dateBS || '२०८३-०५-२०',
                        dateAD: found.dateAD || '2026-09-05',
                        time: found.time || '१२:०६:४६',
                        locationName: found.location?.name || 'काठमाडौँ',
                      });
                    }
                  }}
                  className="w-full p-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                >
                  <option value="">-- प्रोफाइल छनोट गर्नुहोस् --</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.gender === 'male' ? 'पुरुष' : 'महिला'} | {p.dateBS || p.dateAD})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Manual Form Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">नाम:</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="नाम"
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">जन्म मिति (वि.सं.):</label>
                <input
                  type="text"
                  value={editFormData.dateBS}
                  onChange={(e) => {
                    const bsVal = e.target.value;
                    const parts = bsVal.split(/[-/]/).map((s) => parseInt(s.trim(), 10));
                    let converted = '';
                    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
                      try {
                        converted = convertBSToAD(parts[0], parts[1], parts[2]);
                      } catch {
                        // ignore invalid dates
                      }
                    }
                    setEditFormData({ ...editFormData, dateBS: bsVal, dateAD: converted || editFormData.dateAD });
                  }}
                  placeholder="२०८३-०५-२०"
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">जन्म समय (HH:MM:SS):</label>
                <input
                  type="text"
                  value={editFormData.time}
                  onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                  placeholder="१२:०६:४६"
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-mono"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">जन्मस्थान:</label>
                <input
                  type="text"
                  value={editFormData.locationName}
                  onChange={(e) => setEditFormData({ ...editFormData, locationName: e.target.value })}
                  placeholder="काठमाडौँ, नेपाल"
                  className="w-full p-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={() => setEditingTarget(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#D97706] hover:bg-[#b45309] text-white shadow-2xs"
              >
                सुरक्षित गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// Helper North Indian SVG Chart Renderer
const NorthIndianChart: React.FC<{
  lagna: LagnaInfo;
  planets: PlanetPosition[];
}> = ({ lagna, planets }) => {
  const houseCoordinates: Record<number, { cx: number; cy: number; rashiPos: { cx: number; cy: number } }> = {
    1: { cx: 200, cy: 95, rashiPos: { cx: 200, cy: 135 } },
    2: { cx: 100, cy: 50, rashiPos: { cx: 135, cy: 45 } },
    3: { cx: 50, cy: 100, rashiPos: { cx: 80, cy: 75 } },
    4: { cx: 100, cy: 200, rashiPos: { cx: 135, cy: 200 } },
    5: { cx: 50, cy: 300, rashiPos: { cx: 80, cy: 325 } },
    6: { cx: 100, cy: 350, rashiPos: { cx: 135, cy: 355 } },
    7: { cx: 200, cy: 305, rashiPos: { cx: 200, cy: 265 } },
    8: { cx: 300, cy: 350, rashiPos: { cx: 265, cy: 355 } },
    9: { cx: 350, cy: 300, rashiPos: { cx: 320, cy: 325 } },
    10: { cx: 300, cy: 200, rashiPos: { cx: 265, cy: 200 } },
    11: { cx: 350, cy: 100, rashiPos: { cx: 320, cy: 75 } },
    12: { cx: 300, cy: 50, rashiPos: { cx: 265, cy: 45 } },
  };

  const getPlanetAbbr = (name: string): string => {
    switch (name) {
      case 'सूर्य': return 'सू';
      case 'चन्द्र': return 'च';
      case 'मंगल':
      case 'मङ्गल': return 'मं';
      case 'बुध': return 'बु';
      case 'गुरु':
      case 'बृहस्पति': return 'बृ';
      case 'शुक्र': return 'शु';
      case 'शनि': return 'श';
      case 'राहु': return 'रा';
      case 'केतु': return 'के';
      default: return name.slice(0, 2);
    }
  };

  const planetsByHouse: Record<number, PlanetPosition[]> = {};
  for (let h = 1; h <= 12; h++) planetsByHouse[h] = [];
  planets.forEach((p) => {
    if (p.bhava >= 1 && p.bhava <= 12) {
      planetsByHouse[p.bhava].push(p);
    }
  });

  return (
    <div className="relative w-full aspect-square max-w-[340px] mx-auto bg-[#FEFDF2] dark:bg-[#1E1B18] border border-[#D4AF37]/50 rounded-lg p-1 shadow-2xs select-none">
      <svg viewBox="0 0 400 400" className="w-full h-full fill-none stroke-[#E0B853] dark:stroke-[#B48425] stroke-[1.8]">
        {/* Outer Square */}
        <rect x="10" y="10" width="380" height="380" className="stroke-[#D4AF37] stroke-[2.2]" />
        {/* Main Diagonals */}
        <line x1="10" y1="10" x2="390" y2="390" />
        <line x1="390" y1="10" x2="10" y2="390" />
        {/* Center Diamond */}
        <polygon points="200,10 390,200 200,390 10,200" className="stroke-[#D4AF37] stroke-[2]" />
      </svg>

      {/* House Numerals & Planets */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((houseNum) => {
        const geo = houseCoordinates[houseNum];
        const rashiId = ((lagna.rashiId - 1 + houseNum - 1) % 12) + 1;
        const hPlanets = planetsByHouse[houseNum] || [];

        return (
          <React.Fragment key={houseNum}>
            {/* Rashi Number in house corner */}
            <div
              className="absolute text-[11px] font-semibold text-stone-700 dark:text-stone-300 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${(geo.rashiPos.cx / 400) * 100}%`, top: `${(geo.rashiPos.cy / 400) * 100}%` }}
            >
              {toDevanagariNumerals(rashiId)}
            </div>

            {/* House Center: Lagna Symbol 'ल' and Planets in bold red */}
            <div
              className="absolute flex flex-col items-center justify-center pointer-events-none transform -translate-x-1/2 -translate-y-1/2 max-w-[85px]"
              style={{ left: `${(geo.cx / 400) * 100}%`, top: `${(geo.cy / 400) * 100}%` }}
            >
              {houseNum === 1 && (
                <span className="text-red-700 dark:text-red-400 font-black text-sm leading-none mb-0.5">
                  ल
                </span>
              )}

              {hPlanets.length > 0 && (
                <div className="flex flex-wrap justify-center items-center gap-1">
                  {hPlanets.map((p) => (
                    <span
                      key={p.id || p.name}
                      className="text-red-700 dark:text-red-400 font-extrabold text-[12px] leading-tight"
                    >
                      {getPlanetAbbr(p.name)}
                      {p.isRetrograde && <span className="text-[9px] font-bold text-amber-600">(व)</span>}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Clean attribute text helper e.g. "द्विपद (मानव)" -> "द्विपद"
function cleanAttr(val: string): string {
  if (!val) return '—';
  return val.replace(/\s*\([^)]*\)/g, '').trim();
}

// Clean dasha time helper
function cleanDashaTime(val: string): string {
  if (!val) return '';
  // If format is like "२०७९ वैशाख १४", keep as is or compact to YYYY/MM/DD
  return val;
}
