import React, { useState } from 'react';
import {
  Clock,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Search,
  Calendar,
  Printer,
  Compass,
  Layers,
  Info,
  GitFork,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import {
  BirthDetails,
  PlanetPosition,
  VimshottariDashaResult,
  PlanetName
} from '../types/astrology';
import {
  generateFull5LevelVimshottariDasha,
  calculateDashaGocharCoordination,
  generateSukshmadashasForPD,
  DashaNode
} from '../utils/dashaEngine';
import { toDevanagariNumerals, convertADToBS } from '../utils/nepaliCalendar';
import { NepaliDatePicker } from './NepaliDatePicker';
import { BPHSShlokaSidePanel, ShlokaViewTarget } from './BPHSShlokaSidePanel';
import { BPHSShlokaTooltip } from './BPHSShlokaTooltip';
import { DashaShlokaModal, DashaShlokaModalData } from './DashaShlokaModal';
import { canUserPrintDocuments } from '../db/subscriptionStore';
import { printElement } from '../utils/pdfGenerator';
import { DashaTimelineChart } from './DashaTimelineChart';

interface DashaViewProps {
  dasha?: VimshottariDashaResult;
  profile?: BirthDetails;
  moon?: PlanetPosition;
  planets?: PlanetPosition[];
}

type TabType = 'active' | 'timeline' | 'drilldown' | 'tree' | 'antardasha' | 'search' | 'gochar' | 'report';
type DrillLevel = 'mahadasha' | 'antardasha' | 'pratyantardasha' | 'sukshmadasha';

export const DashaView: React.FC<DashaViewProps> = ({
  profile,
  moon,
  planets = []
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('active');

  // Interactive Dasha Shloka Popup Modal State
  const [isDashaModalOpen, setIsDashaModalOpen] = useState<boolean>(false);
  const [dashaModalData, setDashaModalData] = useState<DashaShlokaModalData | null>(null);

  const handleOpenDashaPopup = (modalData: DashaShlokaModalData) => {
    setDashaModalData(modalData);
    setIsDashaModalOpen(true);
  };

  // BPHS Shloka Side Panel state
  const [isShlokaPanelOpen, setIsShlokaPanelOpen] = useState<boolean>(false);
  const [shlokaTarget, setShlokaTarget] = useState<ShlokaViewTarget | null>(null);

  const handleOpenShloka = (target: ShlokaViewTarget) => {
    setShlokaTarget(target);
    setIsShlokaPanelOpen(true);
  };

  // Search target date state
  const todayAD = new Date().toISOString().split('T')[0];
  const [targetDateAD, setTargetDateAD] = useState<string>(todayAD);
  const [targetTimeStr, setTargetTimeStr] = useState<string>('12:00');

  // Interactive Drill-Down Navigation state
  const [drillLevel, setDrillLevel] = useState<DrillLevel>('mahadasha');
  const [drillMIdx, setDrillMIdx] = useState<number>(0);
  const [drillADIdx, setDrillADIdx] = useState<number>(0);
  const [drillPDIdx, setDrillPDIdx] = useState<number>(0);

  // Selected Mahadasha Index for detailed Antardasha Table view
  const [selectedMIndex, setSelectedMIndex] = useState<number>(0);
  const [expandedMIdx, setExpandedMIdx] = useState<number | null>(0);
  const [expandedAntarIdx, setExpandedAntarIdx] = useState<number | null>(null);
  const [expandedADIdx, setExpandedADIdx] = useState<number | null>(0);
  const [expandedPDIdx, setExpandedPDIdx] = useState<number | null>(null);
  const [expandedSDIdx, setExpandedSDIdx] = useState<number | null>(null);

  // Fallback default Moon position if not provided
  const fallbackMoon: PlanetPosition = moon || {
    id: 'moon',
    name: 'चन्द्र',
    englishName: 'Moon',
    symbol: '☽',
    longitude: 45.5,
    degree: 15.5,
    minutes: 30,
    seconds: 0,
    formattedDegree: "१५° ३०' ००\"",
    rashiId: 2,
    rashiName: 'वृष',
    nakshatraId: 4,
    nakshatraName: 'रोहिणी',
    nakshatraLord: 'चन्द्र',
    pada: 2,
    bhava: 1,
    speed: 13.2,
    isRetrograde: false,
    isCombust: false,
    dignity: 'उच्च',
  };

  const birthDateAD = profile?.dateAD || '1995-05-15';
  const birthTimeStr = profile?.time || '08:30';

  // Calculate full 5-level Dasha result
  const dashaFull = generateFull5LevelVimshottariDasha(
    fallbackMoon,
    birthDateAD,
    birthTimeStr,
    targetDateAD
  );

  const activeChain = dashaFull.activeHierarchyAtTargetDate;
  const balance = dashaFull.balanceAtBirth;

  // Dasha-Gochar Coordination
  const gocharCoordination = calculateDashaGocharCoordination(
    fallbackMoon,
    planets,
    birthDateAD,
    birthTimeStr,
    targetDateAD,
    targetTimeStr
  );

  // Print Report Handler
  const handlePrint = () => {
    const check = canUserPrintDocuments('kundali');
    if (!check.allowed) {
      window.dispatchEvent(new CustomEvent('trial-print-blocked', { detail: { reason: check.reasonNepali, docType: 'kundali' } }));
      return;
    }
    printElement('printable-dasha-report');
  };

  return (
    <div id="printable-dasha-report" className="space-y-6 print:m-0 print:p-0">
      {/* Printable Header ONLY visible during print */}
      <div className="hidden print:block text-center border-b-2 border-amber-900 pb-4 mb-6">
        <h1 className="text-2xl font-bold font-serif text-amber-950">
          विंशोत्तरी दशा तथा पञ्चस्तरीय समय-चक्र प्रतिवेदन
        </h1>
        <p className="text-sm text-stone-700 mt-1">
          जातक: <span className="font-bold">{profile?.name || 'राम शर्मा'}</span> | जन्म मिति: {profile?.dateBS || birthDateAD} | समय: {birthTimeStr}
        </p>
      </div>

      {/* Main Top Header Overview Card */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-2xl border border-amber-700/60 p-6 shadow-xl text-amber-100 print:bg-none print:border-amber-900 print:text-black">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-800/80 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-amber-100 flex items-center gap-2">
                <span>विंशोत्तरी पञ्चस्तरीय दशा प्रणाली</span>
                <span className="text-xs font-sans bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-full text-amber-300">
                  १२० वर्ष चक्र
                </span>
              </h2>
              <p className="text-xs text-amber-300/80 mt-0.5">
                जन्म नक्षत्र: <strong className="text-amber-200">{balance.nakshatraName}</strong> (पाद {toDevanagariNumerals(balance.pada)}) | स्वामी: <strong className="text-amber-200">{balance.nakshatraLord}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                handleOpenDashaPopup({
                  level: 'mahadasha',
                  planet: activeChain.mahadasha.planet,
                  subPlanet: activeChain.antardasha.planet,
                  startDateBS: activeChain.mahadasha.startDateBS,
                  endDateBS: activeChain.mahadasha.endDateBS,
                  durationFormattedNepali: activeChain.mahadasha.durationFormattedNepali,
                  isCurrentActive: true
                })
              }
              className="print:hidden flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md border border-amber-400/50 cursor-pointer"
              title="वर्तमान सक्रिय महादशाको पाराशर संस्कृत श्लोक र नेपाली व्याख्या हेर्नुहोस्"
            >
              <BookOpen className="w-4 h-4 text-amber-200" />
              <span>पाराशर प्रमाण श्लोक ({activeChain.mahadasha.planet})</span>
            </button>

            <button
              onClick={handlePrint}
              className="print:hidden flex items-center gap-2 bg-amber-700/40 hover:bg-amber-600/50 border border-amber-500/50 text-amber-200 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>प्रतिवेदन छाप्नुहोस्</span>
            </button>
          </div>
        </div>

        {/* 5-Level Active Hierarchy Row */}
        <div className="bg-amber-950/80 border border-amber-800/80 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3 border-b border-amber-800/60 pb-2">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>सक्रिय दशा क्रम ({activeChain.targetDateBS})</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenShloka({ type: 'browser', defaultQuery: '' })}
                className="text-[11px] text-amber-300 hover:text-amber-100 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
              >
                <BookOpen className="w-3 h-3 text-amber-400" />
                <span>सबै ९ दशा श्लोकहरू सङ्ग्रह</span>
              </button>
              <span className="text-[11px] text-amber-300/80">
                | वि.सं.: {activeChain.targetDateBS}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {/* Level 1: Mahadasha */}
            <div 
              onClick={() =>
                handleOpenDashaPopup({
                  level: 'mahadasha',
                  planet: activeChain.mahadasha.planet,
                  startDateBS: activeChain.mahadasha.startDateBS,
                  endDateBS: activeChain.mahadasha.endDateBS,
                  durationFormattedNepali: activeChain.mahadasha.durationFormattedNepali,
                  isCurrentActive: true
                })
              }
              className="bg-gradient-to-br from-amber-900/90 to-amber-950/90 border border-amber-500/60 rounded-xl p-3 text-center shadow-md cursor-pointer hover:border-amber-400 transition-all group hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                  १. महादशा (MD)
                </span>
                <BookOpen className="w-3 h-3 text-amber-400 opacity-60 group-hover:opacity-100" />
              </div>
              <span className="text-base font-bold text-amber-100 block my-0.5 group-hover:text-amber-300">
                {activeChain.mahadasha.planet}
              </span>
              <span className="text-[10px] text-amber-300/80 block">
                {activeChain.mahadasha.startDateBS} देखि {activeChain.mahadasha.endDateBS}
              </span>
              <span className="text-[9px] text-amber-400/90 font-medium mt-1 block">
                📖 श्लोक हेर्न क्लिक गर्नुहोस्
              </span>
            </div>

            {/* Level 2: Antardasha */}
            <div 
              onClick={() =>
                handleOpenDashaPopup({
                  level: 'antardasha',
                  planet: activeChain.mahadasha.planet,
                  subPlanet: activeChain.antardasha.planet,
                  startDateBS: activeChain.antardasha.startDateBS,
                  endDateBS: activeChain.antardasha.endDateBS,
                  durationFormattedNepali: activeChain.antardasha.durationFormattedNepali,
                  isCurrentActive: true
                })
              }
              className="bg-gradient-to-br from-amber-900/90 to-amber-950/90 border border-emerald-500/60 rounded-xl p-3 text-center shadow-md cursor-pointer hover:border-emerald-400 transition-all group hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                  २. अन्तरदशा (AD)
                </span>
                <BookOpen className="w-3 h-3 text-emerald-400 opacity-60 group-hover:opacity-100" />
              </div>
              <span className="text-base font-bold text-emerald-200 block my-0.5 group-hover:text-emerald-100">
                {activeChain.antardasha.planet}
              </span>
              <span className="text-[10px] text-amber-300/80 block">
                {activeChain.antardasha.startDateBS} देखि {activeChain.antardasha.endDateBS}
              </span>
              <span className="text-[9px] text-emerald-400/90 font-medium mt-1 block">
                📖 श्लोक हेर्न क्लिक गर्नुहोस्
              </span>
            </div>

            {/* Level 3: Pratyantardasha */}
            <div 
              onClick={() =>
                handleOpenDashaPopup({
                  level: 'pratyantardasha',
                  planet: activeChain.mahadasha.planet,
                  subPlanet: activeChain.antardasha.planet,
                  pratyantarPlanet: activeChain.pratyantardasha.planet,
                  startDateBS: activeChain.pratyantardasha.startDateBS,
                  endDateBS: activeChain.pratyantardasha.endDateBS,
                  durationFormattedNepali: activeChain.pratyantardasha.durationFormattedNepali,
                  isCurrentActive: true
                })
              }
              className="bg-gradient-to-br from-amber-900/90 to-amber-950/90 border border-cyan-500/60 rounded-xl p-3 text-center shadow-md cursor-pointer hover:border-cyan-400 transition-all group hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">
                  ३. प्रत्यन्तरदशा (PD)
                </span>
                <BookOpen className="w-3 h-3 text-cyan-400 opacity-60 group-hover:opacity-100" />
              </div>
              <span className="text-base font-bold text-cyan-200 block my-0.5 group-hover:text-cyan-100">
                {activeChain.pratyantardasha.planet}
              </span>
              <span className="text-[10px] text-amber-300/80 block">
                {activeChain.pratyantardasha.startDateBS} देखि {activeChain.pratyantardasha.endDateBS}
              </span>
              <span className="text-[9px] text-cyan-400/90 font-medium mt-1 block">
                📖 श्लोक हेर्न क्लिक गर्नुहोस्
              </span>
            </div>

            {/* Level 4: Sukshmadasha */}
            <div 
              onClick={() =>
                handleOpenDashaPopup({
                  level: 'sukshmadasha',
                  planet: activeChain.mahadasha.planet,
                  subPlanet: activeChain.sukshmadasha.planet,
                  startDateBS: activeChain.sukshmadasha.startDateBS,
                  endDateBS: activeChain.sukshmadasha.endDateBS,
                  durationFormattedNepali: activeChain.sukshmadasha.durationFormattedNepali,
                  isCurrentActive: true
                })
              }
              className="bg-gradient-to-br from-amber-900/90 to-amber-950/90 border border-purple-500/60 rounded-xl p-3 text-center shadow-md cursor-pointer hover:border-purple-400 transition-all group hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">
                  ४. सूक्ष्मदशा (SD)
                </span>
                <BookOpen className="w-3 h-3 text-purple-400 opacity-60 group-hover:opacity-100" />
              </div>
              <span className="text-base font-bold text-purple-200 block my-0.5 group-hover:text-purple-100">
                {activeChain.sukshmadasha.planet}
              </span>
              <span className="text-[10px] text-amber-300/80 block">
                {activeChain.sukshmadasha.startDateBS} देखि {activeChain.sukshmadasha.endDateBS}
              </span>
              <span className="text-[9px] text-purple-400/90 font-medium mt-1 block">
                📖 श्लोक हेर्न क्लिक गर्नुहोस्
              </span>
            </div>

            {/* Level 5: Pranadasha */}
            <div 
              onClick={() =>
                handleOpenDashaPopup({
                  level: 'pranadasha',
                  planet: activeChain.mahadasha.planet,
                  subPlanet: activeChain.pranadasha.planet,
                  durationFormattedNepali: activeChain.pranadasha.startTimeNepali,
                  isCurrentActive: true
                })
              }
              className="bg-gradient-to-br from-amber-900/90 to-amber-950/90 border border-rose-500/60 rounded-xl p-3 text-center shadow-md col-span-2 sm:col-span-1 cursor-pointer hover:border-rose-400 transition-all group hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider">
                  ५. प्राणदशा (PranD)
                </span>
                <BookOpen className="w-3 h-3 text-rose-400 opacity-60 group-hover:opacity-100" />
              </div>
              <span className="text-base font-bold text-rose-200 block my-0.5 group-hover:text-rose-100">
                {activeChain.pranadasha.planet}
              </span>
              <span className="text-[10px] text-amber-300/80 block">
                {activeChain.pranadasha.startTimeNepali}
              </span>
              <span className="text-[9px] text-rose-400/90 font-medium mt-1 block">
                📖 श्लोक हेर्न क्लिक गर्नुहोस्
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-amber-800/40 pb-3 print:hidden">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'active'
              ? 'bg-amber-600 text-amber-950 shadow-lg'
              : 'bg-amber-950/40 border border-amber-800/60 text-amber-200 hover:bg-amber-900/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>वर्तमान दशा विवरण</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'timeline'
              ? 'bg-amber-600 text-amber-950 shadow-lg'
              : 'bg-amber-950/40 border border-amber-800/60 text-amber-200 hover:bg-amber-900/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>दशा टाइमलाइन (Recharts)</span>
        </button>

        <button
          onClick={() => setActiveTab('drilldown')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'drilldown'
              ? 'bg-amber-600 text-amber-950 shadow-lg'
              : 'bg-amber-950/40 border border-amber-800/60 text-amber-200 hover:bg-amber-900/60'
          }`}
        >
          <GitFork className="w-4 h-4" />
          <span>स्तरीय ड्रिल-डाउन (MD/AD/PD)</span>
        </button>

        <button
          onClick={() => setActiveTab('tree')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tree'
              ? 'bg-amber-600 text-amber-950 shadow-lg'
              : 'bg-amber-950/40 border border-amber-800/60 text-amber-200 hover:bg-amber-900/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>१२० वर्ष महादशा वृक्ष</span>
        </button>

        <button
          onClick={() => setActiveTab('antardasha')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'antardasha'
              ? 'bg-amber-600 text-amber-950 shadow-lg'
              : 'bg-amber-950/40 border border-amber-800/60 text-amber-200 hover:bg-amber-900/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>अन्तरदशा तालिका (विस्तृत)</span>
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'search'
              ? 'bg-amber-600 text-amber-950 shadow-lg'
              : 'bg-amber-950/40 border border-amber-800/60 text-amber-200 hover:bg-amber-900/60'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>मिति अनुसार दशा खोज</span>
        </button>

        <button
          onClick={() => setActiveTab('gochar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'gochar'
              ? 'bg-amber-600 text-amber-950 shadow-lg'
              : 'bg-amber-950/40 border border-amber-800/60 text-amber-200 hover:bg-amber-900/60'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>दशा–गोचर समन्वय</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'report'
              ? 'bg-amber-600 text-amber-950 shadow-lg'
              : 'bg-amber-950/40 border border-amber-800/60 text-amber-200 hover:bg-amber-900/60'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>दशा प्रतिवेदन</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE DASHA DETAILS */}
      {activeTab === 'active' && (
        <div className="space-y-6">
          {/* Balance at Birth Banner */}
          <div className="bg-amber-950/80 border border-amber-800/80 rounded-2xl p-5 backdrop-blur-md shadow-xl text-amber-100">
            <h3 className="text-sm font-bold font-serif text-amber-300 border-b border-amber-800/80 pb-2 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              <span>जन्म समयको नक्षत्र एवं दशा भुक्त/भोग्य विवरण</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-amber-900/40 border border-amber-800/60 p-3 rounded-xl">
                <span className="text-amber-400 block font-semibold">जन्म नक्षत्र</span>
                <span className="text-sm font-bold text-amber-100">
                  {balance.nakshatraName} ({toDevanagariNumerals(balance.pada)} पाद)
                </span>
                <span className="text-[11px] text-amber-300/80 block mt-1">
                  नक्षत्र स्वामी: {balance.nakshatraLord}
                </span>
              </div>

              <div className="bg-amber-900/40 border border-amber-800/60 p-3 rounded-xl">
                <span className="text-amber-400 block font-semibold">चन्द्रमाको स्पष्ट अंश</span>
                <span className="text-sm font-bold text-amber-100">
                  {toDevanagariNumerals(fallbackMoon.formattedDegree)}
                </span>
                <span className="text-[11px] text-amber-300/80 block mt-1">
                  नक्षत्र प्रवेश: {toDevanagariNumerals(balance.degreeInNakshatra.toFixed(2))}° / १३° २०'
                </span>
              </div>

              <div className="bg-amber-900/40 border border-amber-800/60 p-3 rounded-xl">
                <span className="text-amber-400 block font-semibold">जन्ममा बाँकी दशा (Balance)</span>
                <span className="text-sm font-bold text-amber-200">
                  {balance.nakshatraLord} महादशा
                </span>
                <span className="text-[11px] text-amber-300/80 block mt-1">
                  भोग्य: {toDevanagariNumerals(balance.yearsLeft)} वर्ष, {toDevanagariNumerals(balance.monthsLeft)} महिना, {toDevanagariNumerals(balance.daysLeft)} दिन
                </span>
              </div>

              <div className="bg-amber-900/40 border border-amber-800/60 p-3 rounded-xl">
                <span className="text-amber-400 block font-semibold">भुक्त / भोग्य अनुपात</span>
                <span className="text-sm font-bold text-emerald-300">
                  भोग्य {toDevanagariNumerals((balance.remainingFraction * 100).toFixed(1))}%
                </span>
                <span className="text-[11px] text-amber-300/80 block mt-1">
                  भुक्त {toDevanagariNumerals((balance.elapsedFraction * 100).toFixed(1))}%
                </span>
              </div>
            </div>
          </div>

          {/* Active 5-Level Deep Breakdown Cards */}
          <div className="bg-amber-950/80 border border-amber-800/80 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-base font-bold font-serif text-amber-200 border-b border-amber-800 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>सक्रिय दशा ५-स्तरीय गहन विश्लेषण</span>
            </h3>

            <div className="space-y-3">
              {/* Level 1 Card */}
              <div className="p-4 bg-amber-900/60 border border-amber-600/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-amber-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500 text-amber-950 text-[10px] px-2 py-0.5 rounded font-bold">
                      १. महादशा
                    </span>
                    <h4 className="text-base font-bold">{activeChain.mahadasha.planet} महादशा</h4>
                    <button
                      onClick={() =>
                        handleOpenDashaPopup({
                          level: 'mahadasha',
                          planet: activeChain.mahadasha.planet,
                          startDateBS: activeChain.mahadasha.startDateBS,
                          endDateBS: activeChain.mahadasha.endDateBS,
                          durationFormattedNepali: activeChain.mahadasha.durationFormattedNepali,
                          isCurrentActive: true
                        })
                      }
                      className="ml-2 px-2 py-0.5 rounded-lg bg-amber-700/80 hover:bg-amber-600 text-amber-100 text-[11px] font-bold flex items-center gap-1 border border-amber-500/50 shadow-xs cursor-pointer"
                      title="पाराशर श्लोक हेर्नुहोस्"
                    >
                      <BookOpen className="w-3 h-3 text-amber-300" />
                      <span>श्लोक/प्रमाण</span>
                    </button>
                  </div>
                  <p className="text-xs text-amber-300/80 mt-1">
                    अवधि: {activeChain.mahadasha.startDateBS} देखि {activeChain.mahadasha.endDateBS} ({activeChain.mahadasha.durationFormattedNepali})
                  </p>
                </div>
                <div className="text-xs text-right">
                  <span className="text-amber-400 font-semibold block">ईस्वी अवधि</span>
                  <span className="text-amber-200">{activeChain.mahadasha.startDateAD} देखि {activeChain.mahadasha.endDateAD}</span>
                </div>
              </div>

              {/* Level 2 Card */}
              <div className="p-4 bg-emerald-950/80 border border-emerald-600/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-emerald-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500 text-emerald-950 text-[10px] px-2 py-0.5 rounded font-bold">
                      २. अन्तरदशा
                    </span>
                    <h4 className="text-base font-bold">
                      {activeChain.mahadasha.planet} – {activeChain.antardasha.planet} अन्तरदशा
                    </h4>
                    <button
                      onClick={() =>
                        handleOpenDashaPopup({
                          level: 'antardasha',
                          planet: activeChain.mahadasha.planet,
                          subPlanet: activeChain.antardasha.planet,
                          startDateBS: activeChain.antardasha.startDateBS,
                          endDateBS: activeChain.antardasha.endDateBS,
                          durationFormattedNepali: activeChain.antardasha.durationFormattedNepali,
                          isCurrentActive: true
                        })
                      }
                      className="ml-2 px-2 py-0.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 text-[11px] font-bold flex items-center gap-1 border border-emerald-600/50 shadow-xs cursor-pointer"
                      title="अन्तरदशा स्वामीको श्लोक हेर्नुहोस्"
                    >
                      <BookOpen className="w-3 h-3 text-emerald-300" />
                      <span>श्लोक/प्रमाण</span>
                    </button>
                  </div>
                  <p className="text-xs text-emerald-300/80 mt-1">
                    अवधि: {activeChain.antardasha.startDateBS} देखि {activeChain.antardasha.endDateBS} ({activeChain.antardasha.durationFormattedNepali})
                  </p>
                </div>
                <div className="text-xs text-right">
                  <span className="text-emerald-400 font-semibold block">ईस्वी अवधि</span>
                  <span className="text-emerald-200">{activeChain.antardasha.startDateAD} देखि {activeChain.antardasha.endDateAD}</span>
                </div>
              </div>

              {/* Level 3 Card */}
              <div className="p-4 bg-cyan-950/80 border border-cyan-600/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-cyan-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-cyan-500 text-cyan-950 text-[10px] px-2 py-0.5 rounded font-bold">
                      ३. प्रत्यन्तरदशा
                    </span>
                    <h4 className="text-base font-bold">
                      {activeChain.mahadasha.planet} – {activeChain.antardasha.planet} – {activeChain.pratyantardasha.planet} प्रत्यन्तरदशा
                    </h4>
                    <button
                      onClick={() =>
                        handleOpenDashaPopup({
                          level: 'pratyantardasha',
                          planet: activeChain.mahadasha.planet,
                          subPlanet: activeChain.antardasha.planet,
                          pratyantarPlanet: activeChain.pratyantardasha.planet,
                          startDateBS: activeChain.pratyantardasha.startDateBS,
                          endDateBS: activeChain.pratyantardasha.endDateBS,
                          durationFormattedNepali: activeChain.pratyantardasha.durationFormattedNepali,
                          isCurrentActive: true
                        })
                      }
                      className="ml-2 px-2 py-0.5 rounded-lg bg-cyan-800/80 hover:bg-cyan-700 text-cyan-100 text-[11px] font-bold flex items-center gap-1 border border-cyan-600/50 shadow-xs cursor-pointer"
                      title="प्रत्यन्तर स्वामी ग्रह स्वरूप श्लोक"
                    >
                      <BookOpen className="w-3 h-3 text-cyan-300" />
                      <span>श्लोक</span>
                    </button>
                  </div>
                  <p className="text-xs text-cyan-300/80 mt-1">
                    अवधि: {activeChain.pratyantardasha.startDateBS} देखि {activeChain.pratyantardasha.endDateBS} ({activeChain.pratyantardasha.durationFormattedNepali})
                  </p>
                </div>
                <div className="text-xs text-right">
                  <span className="text-cyan-400 font-semibold block">ईस्वी अवधि</span>
                  <span className="text-cyan-200">{activeChain.pratyantardasha.startDateAD} देखि {activeChain.pratyantardasha.endDateAD}</span>
                </div>
              </div>

              {/* Level 4 & Level 5 Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-purple-950/80 border border-purple-600/80 rounded-xl text-purple-100 flex items-center justify-between">
                  <div>
                    <span className="bg-purple-500 text-purple-950 text-[10px] px-2 py-0.5 rounded font-bold">
                      ४. सूक्ष्मदशा
                    </span>
                    <h5 className="text-sm font-bold mt-1">
                      {activeChain.sukshmadasha.planet} सूक्ष्मदशा
                    </h5>
                    <p className="text-xs text-purple-300/80 mt-0.5">
                      {activeChain.sukshmadasha.startDateBS} देखि {activeChain.sukshmadasha.endDateBS}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleOpenDashaPopup({
                        level: 'sukshmadasha',
                        planet: activeChain.mahadasha.planet,
                        subPlanet: activeChain.sukshmadasha.planet,
                        startDateBS: activeChain.sukshmadasha.startDateBS,
                        endDateBS: activeChain.sukshmadasha.endDateBS,
                        durationFormattedNepali: activeChain.sukshmadasha.durationFormattedNepali,
                        isCurrentActive: true
                      })
                    }
                    className="p-1.5 rounded-lg bg-purple-800 hover:bg-purple-700 text-purple-200 border border-purple-600/60 cursor-pointer"
                    title="सूक्ष्मदशा स्वामी श्लोक"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3.5 bg-rose-950/80 border border-rose-600/80 rounded-xl text-rose-100 flex items-center justify-between">
                  <div>
                    <span className="bg-rose-500 text-rose-950 text-[10px] px-2 py-0.5 rounded font-bold">
                      ५. प्राणदशा
                    </span>
                    <h5 className="text-sm font-bold mt-1">
                      {activeChain.pranadasha.planet} प्राणदशा
                    </h5>
                    <p className="text-xs text-rose-300/80 mt-0.5">
                      {activeChain.pranadasha.startTimeNepali}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleOpenDashaPopup({
                        level: 'pranadasha',
                        planet: activeChain.mahadasha.planet,
                        subPlanet: activeChain.pranadasha.planet,
                        durationFormattedNepali: activeChain.pranadasha.startTimeNepali,
                        isCurrentActive: true
                      })
                    }
                    className="p-1.5 rounded-lg bg-rose-800 hover:bg-rose-700 text-rose-200 border border-rose-600/60 cursor-pointer"
                    title="प्राणदशा स्वामी श्लोक"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dasha Visualization Timeline (Recharts) */}
          <DashaTimelineChart
            mahadashas={dashaFull.mahadashas}
            profile={profile}
            onSelectNode={(node) => {
              const idx = dashaFull.mahadashas.findIndex((m) => m.planet === node.planet);
              if (idx !== -1) {
                setDrillMIdx(idx);
                setDrillADIdx(0);
                setDrillPDIdx(0);
              }
            }}
          />
        </div>
      )}

      {/* TAB: TIMELINE VISUALIZATION (RECHARTS) */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <DashaTimelineChart
            mahadashas={dashaFull.mahadashas}
            profile={profile}
            onSelectNode={(node) => {
              const idx = dashaFull.mahadashas.findIndex((m) => m.planet === node.planet);
              if (idx !== -1) {
                setDrillMIdx(idx);
                setDrillADIdx(0);
                setDrillPDIdx(0);
                setActiveTab('drilldown');
              }
            }}
          />
        </div>
      )}

      {/* TAB: LEVEL DRILL-DOWN MENU & SWITCHER (स्तरीय ड्रिल-डाउन नेभिगेसन) */}
      {activeTab === 'drilldown' && (() => {
        const selectedM = dashaFull.mahadashas[drillMIdx] || dashaFull.mahadashas[0];
        const selectedADList = selectedM.subNodes || [];
        const selectedAD = selectedADList[drillADIdx] || selectedADList[0] || selectedM;
        const selectedPDList = selectedAD.subNodes || [];
        const selectedPD = selectedPDList[drillPDIdx] || selectedPDList[0] || selectedAD;
        const selectedSDList = (selectedPD && selectedPD.subNodes && selectedPD.subNodes.length > 0)
          ? selectedPD.subNodes
          : (selectedPD ? generateSukshmadashasForPD(selectedPD) : []);

        return (
          <div className="bg-amber-950/80 border border-amber-800/80 rounded-2xl p-5 shadow-xl space-y-6">
            {/* Header & Description */}
            <div className="border-b border-amber-800 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold font-serif text-amber-200 flex items-center gap-2">
                  <GitFork className="w-5 h-5 text-amber-400" />
                  <span>दशा तह (Level) अनुसार ड्रिल-डाउन एवं स्विच मेनु</span>
                </h3>
                <p className="text-xs text-amber-300/80 mt-1">
                  महादशा, अन्तरदशा, प्रत्यन्तरदशा र सूक्ष्मदशा तहहरू बीच सहजै स्विच गरी प्रत्येक तहका ग्रह, अवधि र मितिहरू विश्लेषण गर्नुहोस्।
                </p>
              </div>

              {/* Reset to Active Pathway Button */}
              <button
                onClick={() => {
                  const activeM = dashaFull.mahadashas.findIndex(m => m.isCurrent);
                  if (activeM !== -1) {
                    setDrillMIdx(activeM);
                    const activeAD = (dashaFull.mahadashas[activeM]?.subNodes || []).findIndex(a => a.isCurrent);
                    if (activeAD !== -1) setDrillADIdx(activeAD);
                    const activePD = ((dashaFull.mahadashas[activeM]?.subNodes || [])[activeAD]?.subNodes || []).findIndex(p => p.isCurrent);
                    if (activePD !== -1) setDrillPDIdx(activePD);
                  }
                }}
                className="text-xs bg-amber-900/60 hover:bg-amber-800/70 border border-amber-700/60 text-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-start md:self-auto transition-all"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>वर्तमान सक्रिय चक्रमा फर्कनुहोस्</span>
              </button>
            </div>

            {/* Level Switcher Segmented Control & Active Pathway Bar */}
            <div className="bg-amber-900/40 border border-amber-800/80 rounded-xl p-3.5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-800/60 pb-2.5">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>तल्लो/माथिल्लो तह छनोट गर्नुहोस् (Select Level):</span>
                </span>
                <span className="text-xs text-amber-300 bg-amber-950/80 border border-amber-800/80 px-2.5 py-1 rounded-md">
                  चयन: <strong className="text-amber-100">{selectedM.planet}</strong>
                  <span className="text-amber-500 mx-1">➔</span>
                  <strong className="text-amber-100">{selectedAD.planet}</strong>
                  <span className="text-amber-500 mx-1">➔</span>
                  <strong className="text-amber-100">{selectedPD.planet}</strong>
                </span>
              </div>

              {/* 4 Level Switch Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => setDrillLevel('mahadasha')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col justify-between transition-all ${
                    drillLevel === 'mahadasha'
                      ? 'bg-amber-600 text-amber-950 border-amber-400 shadow-lg scale-102'
                      : 'bg-amber-950/60 text-amber-200 border-amber-800/60 hover:bg-amber-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] uppercase opacity-80">तह १ (Level 1)</span>
                    <span className="w-5 h-5 rounded-full bg-amber-950/40 flex items-center justify-center text-[10px]">9</span>
                  </div>
                  <div className="text-sm font-bold font-serif my-1">१. महादशा (MD)</div>
                  <div className="text-[11px] opacity-90 truncate">ग्रह: {selectedM.planet}</div>
                </button>

                <button
                  onClick={() => setDrillLevel('antardasha')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col justify-between transition-all ${
                    drillLevel === 'antardasha'
                      ? 'bg-amber-600 text-amber-950 border-amber-400 shadow-lg scale-102'
                      : 'bg-amber-950/60 text-amber-200 border-amber-800/60 hover:bg-amber-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] uppercase opacity-80">तह २ (Level 2)</span>
                    <span className="w-5 h-5 rounded-full bg-amber-950/40 flex items-center justify-center text-[10px]">81</span>
                  </div>
                  <div className="text-sm font-bold font-serif my-1">२. अन्तरदशा (AD)</div>
                  <div className="text-[11px] opacity-90 truncate">{selectedM.planet} - {selectedAD.planet}</div>
                </button>

                <button
                  onClick={() => setDrillLevel('pratyantardasha')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col justify-between transition-all ${
                    drillLevel === 'pratyantardasha'
                      ? 'bg-amber-600 text-amber-950 border-amber-400 shadow-lg scale-102'
                      : 'bg-amber-950/60 text-amber-200 border-amber-800/60 hover:bg-amber-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] uppercase opacity-80">तह ३ (Level 3)</span>
                    <span className="w-5 h-5 rounded-full bg-amber-950/40 flex items-center justify-center text-[10px]">729</span>
                  </div>
                  <div className="text-sm font-bold font-serif my-1">३. प्रत्यन्तरदशा (PD)</div>
                  <div className="text-[11px] opacity-90 truncate">{selectedAD.planet} - {selectedPD.planet}</div>
                </button>

                <button
                  onClick={() => setDrillLevel('sukshmadasha')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col justify-between transition-all ${
                    drillLevel === 'sukshmadasha'
                      ? 'bg-amber-600 text-amber-950 border-amber-400 shadow-lg scale-102'
                      : 'bg-amber-950/60 text-amber-200 border-amber-800/60 hover:bg-amber-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] uppercase opacity-80">तह ४/५ (Level 4/5)</span>
                    <span className="w-5 h-5 rounded-full bg-amber-950/40 flex items-center justify-center text-[10px]">6.5k</span>
                  </div>
                  <div className="text-sm font-bold font-serif my-1">४. सूक्ष्म / प्राणदशा</div>
                  <div className="text-[11px] opacity-90 truncate">सूक्ष्म–प्राण विश्लेषण</div>
                </button>
              </div>
            </div>

            {/* LEVEL 1: MAHADASHA SELECTOR GRID */}
            {drillLevel === 'mahadasha' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-amber-200 font-serif flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>१. महादशा तह (Select Mahadasha) — कुल ९ ग्रहहरू</span>
                  </h4>
                  <span className="text-xs text-amber-400 hidden sm:inline">कुनै एक महादशामा क्लिक गरी अन्तरदशा ड्रिल-डाउन गर्नुहोस्</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {dashaFull.mahadashas.map((m, mIdx) => {
                    const isSelected = drillMIdx === mIdx;
                    return (
                      <div
                        key={mIdx}
                        onClick={() => {
                          setDrillMIdx(mIdx);
                          setDrillADIdx(0);
                          setDrillPDIdx(0);
                        }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                          isSelected
                            ? 'bg-gradient-to-br from-amber-900 via-amber-850 to-amber-900 border-amber-400 shadow-xl ring-2 ring-amber-400/50'
                            : m.isCurrent
                            ? 'bg-amber-900/50 border-emerald-500/80 hover:bg-amber-900/70'
                            : 'bg-amber-900/20 border-amber-800/60 hover:bg-amber-900/40'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                              ग्रह #{toDevanagariNumerals(mIdx + 1)}
                            </span>
                            <h5 className="text-base font-bold text-amber-100 font-serif my-0.5">
                              {m.planet} महादशा
                            </h5>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {m.isCurrent && (
                              <span className="bg-emerald-900/90 text-emerald-200 border border-emerald-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                हाल सक्रिय
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDashaPopup({
                                  level: 'mahadasha',
                                  planet: m.planet,
                                  startDateBS: m.startDateBS,
                                  endDateBS: m.endDateBS,
                                  durationFormattedNepali: m.durationFormattedNepali,
                                  isCurrentActive: m.isCurrent
                                });
                              }}
                              className="p-1 rounded-lg bg-amber-800/80 hover:bg-amber-700 text-amber-200 border border-amber-600/60 cursor-pointer"
                              title={`${m.planet} महादशाको प्रमाण श्लोक हेर्नुहोस्`}
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-amber-200/90 space-y-1 my-3 bg-amber-950/60 p-2.5 rounded-lg border border-amber-800/50">
                          <div className="flex justify-between">
                            <span className="text-amber-400 font-medium">कुल अवधि:</span>
                            <span className="font-bold">{m.durationFormattedNepali}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-amber-400 font-medium">प्रारम्भ:</span>
                            <span>{m.startDateBS}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-amber-400 font-medium">समाप्ति:</span>
                            <span>{m.endDateBS}</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDrillMIdx(mIdx);
                            setDrillADIdx(0);
                            setDrillPDIdx(0);
                            setDrillLevel('antardasha');
                          }}
                          className="w-full text-xs bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md mt-1"
                        >
                          <span>{m.planet} अन्तरदशाहरू हेर्नुहोस्</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LEVEL 2: ANTARDASHA DRILL-DOWN GRID */}
            {drillLevel === 'antardasha' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-800/60 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-amber-200 font-serif flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>२. अन्तरदशा तह — {selectedM.planet} महादशाका ९ अन्तरदशाहरू</span>
                    </h4>
                    <p className="text-xs text-amber-300/80">
                      अवधि: {selectedM.startDateBS} देखि {selectedM.endDateBS} ({selectedM.durationFormattedNepali})
                    </p>
                  </div>

                  <button
                    onClick={() => setDrillLevel('mahadasha')}
                    className="text-xs bg-amber-900/60 hover:bg-amber-800/80 border border-amber-700/60 text-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-start sm:self-auto transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 text-amber-400" />
                    <span>१. महादशा तहमा फर्कनुहोस्</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedADList.map((ad, adIdx) => {
                    const isSelected = drillADIdx === adIdx;
                    return (
                      <div
                        key={adIdx}
                        onClick={() => {
                          setDrillADIdx(adIdx);
                          setDrillPDIdx(0);
                        }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                          isSelected
                            ? 'bg-gradient-to-br from-amber-900 via-amber-850 to-amber-900 border-amber-400 shadow-xl ring-2 ring-amber-400/50'
                            : ad.isCurrent
                            ? 'bg-amber-900/50 border-emerald-500/80 hover:bg-amber-900/70'
                            : 'bg-amber-900/20 border-amber-800/60 hover:bg-amber-900/40'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                              अन्तरदशा #{toDevanagariNumerals(adIdx + 1)}
                            </span>
                            <h5 className="text-base font-bold text-amber-100 font-serif my-0.5">
                              {selectedM.planet} – {ad.planet} अन्तरदशा
                            </h5>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {ad.isCurrent && (
                              <span className="bg-emerald-900/90 text-emerald-200 border border-emerald-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                सक्रिय
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDashaPopup({
                                  level: 'antardasha',
                                  planet: selectedM.planet,
                                  subPlanet: ad.planet,
                                  startDateBS: ad.startDateBS,
                                  endDateBS: ad.endDateBS,
                                  durationFormattedNepali: ad.durationFormattedNepali,
                                  isCurrentActive: ad.isCurrent
                                });
                              }}
                              className="p-1 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/60 cursor-pointer"
                              title={`${selectedM.planet}-${ad.planet} अन्तरदशाको प्रमाण श्लोक हेर्नुहोस्`}
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-xs text-amber-200/90 space-y-1 my-3 bg-amber-950/60 p-2.5 rounded-lg border border-amber-800/50">
                          <div className="flex justify-between">
                            <span className="text-amber-400 font-medium">अवधि:</span>
                            <span className="font-bold">{ad.durationFormattedNepali}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-amber-400 font-medium">प्रारम्भ (BS):</span>
                            <span>{ad.startDateBS}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-amber-400 font-medium">समाप्ति (BS):</span>
                            <span>{ad.endDateBS}</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDrillADIdx(adIdx);
                            setDrillPDIdx(0);
                            setDrillLevel('pratyantardasha');
                          }}
                          className="w-full text-xs bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md mt-1"
                        >
                          <span>{ad.planet} प्रत्यन्तरदशाहरू ड्रिल-डाउन</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LEVEL 3: PRATYANTARDASHA DRILL-DOWN GRID */}
            {drillLevel === 'pratyantardasha' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-800/60 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-amber-200 font-serif flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>३. प्रत्यन्तरदशा तह — {selectedM.planet} ➔ {selectedAD.planet} का ९ प्रत्यन्तरदशाहरू</span>
                    </h4>
                    <p className="text-xs text-amber-300/80">
                      अवधि: {selectedAD.startDateBS} देखि {selectedAD.endDateBS} ({selectedAD.durationFormattedNepali})
                    </p>
                  </div>

                  <button
                    onClick={() => setDrillLevel('antardasha')}
                    className="text-xs bg-amber-900/60 hover:bg-amber-800/80 border border-amber-700/60 text-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-start sm:self-auto transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 text-amber-400" />
                    <span>२. अन्तरदशा तहमा फर्कनुहोस्</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedPDList.map((pd, pdIdx) => {
                    const isSelected = drillPDIdx === pdIdx;
                    return (
                      <div
                        key={pdIdx}
                        onClick={() => setDrillPDIdx(pdIdx)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                          isSelected
                            ? 'bg-gradient-to-br from-amber-900 via-amber-850 to-amber-900 border-amber-400 shadow-xl ring-2 ring-amber-400/50'
                            : pd.isCurrent
                            ? 'bg-amber-900/50 border-emerald-500/80 hover:bg-amber-900/70'
                            : 'bg-amber-900/20 border-amber-800/60 hover:bg-amber-900/40'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                              प्रत्यन्तरदशा #{toDevanagariNumerals(pdIdx + 1)}
                            </span>
                            <h5 className="text-base font-bold text-amber-100 font-serif my-0.5">
                              {selectedAD.planet} – {pd.planet} PD
                            </h5>
                          </div>
                          {pd.isCurrent && (
                            <span className="bg-emerald-900/90 text-emerald-200 border border-emerald-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                              सक्रिय
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-amber-200/90 space-y-1 my-3 bg-amber-950/60 p-2.5 rounded-lg border border-amber-800/50">
                          <div className="flex justify-between">
                            <span className="text-amber-400 font-medium">अवधि:</span>
                            <span className="font-bold">{pd.durationFormattedNepali}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-amber-400 font-medium">प्रारम्भ:</span>
                            <span>{pd.startDateBS}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-amber-400 font-medium">समाप्ति:</span>
                            <span>{pd.endDateBS}</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDrillPDIdx(pdIdx);
                            setDrillLevel('sukshmadasha');
                          }}
                          className="w-full text-xs bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md mt-1"
                        >
                          <span>{pd.planet} सूक्ष्मदशा ड्रिल-डाउन</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LEVEL 4: SUKSHMADASHA & PRANADASHA DRILL-DOWN GRID */}
            {drillLevel === 'sukshmadasha' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-800/60 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-amber-200 font-serif flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>४. सूक्ष्म एवं प्राणदशा तह — {selectedM.planet} ➔ {selectedAD.planet} ➔ {selectedPD.planet}</span>
                    </h4>
                    <p className="text-xs text-amber-300/80">
                      प्रत्यन्तरदशा अवधि: {selectedPD.startDateBS} देखि {selectedPD.endDateBS} ({selectedPD.durationFormattedNepali})
                    </p>
                  </div>

                  <button
                    onClick={() => setDrillLevel('pratyantardasha')}
                    className="text-xs bg-amber-900/60 hover:bg-amber-800/80 border border-amber-700/60 text-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-start sm:self-auto transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 text-amber-400" />
                    <span>३. प्रत्यन्तरदशा तहमा फर्कनुहोस्</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedSDList.map((sd, sdIdx) => (
                    <div
                      key={sdIdx}
                      className={`p-4 rounded-xl border flex flex-col justify-between ${
                        sd.isCurrent
                          ? 'bg-purple-950/80 border-purple-500 shadow-xl ring-1 ring-purple-400/50'
                          : 'bg-amber-900/20 border-amber-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block">
                            सूक्ष्मदशा #{toDevanagariNumerals(sdIdx + 1)}
                          </span>
                          <h5 className="text-base font-bold text-purple-100 font-serif my-0.5">
                            {selectedPD.planet} – {sd.planet} SD
                          </h5>
                        </div>
                        {sd.isCurrent && (
                          <span className="bg-purple-900 text-purple-200 border border-purple-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            सक्रिय
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-amber-200/90 space-y-1 my-3 bg-amber-950/60 p-2.5 rounded-lg border border-amber-800/50">
                        <div className="flex justify-between">
                          <span className="text-amber-400 font-medium">अवधि:</span>
                          <span className="font-bold">{sd.durationFormattedNepali}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-400 font-medium">प्रारम्भ:</span>
                          <span>{sd.startDateBS}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-400 font-medium">समाप्ति:</span>
                          <span>{sd.endDateBS}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* TAB 2: 120-YEAR MAHADASHA TREE */}
      {activeTab === 'tree' && (
        <div className="bg-amber-950/80 border border-amber-800/80 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="border-b border-amber-800 pb-3">
            <h3 className="text-base font-bold font-serif text-amber-200 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>१२० वर्ष महादशा एवं ९ अन्तरदशा तथा प्रत्यन्तरदशाहरूको वृक्ष</span>
            </h3>
            <p className="text-xs text-amber-300/80 mt-1">
              कुनै पनि महादशा क्लिक गरी अन्तरदशा, प्रत्यन्तरदशा तथा सूक्ष्मदशा खोल्नुहोस्।
            </p>
          </div>

          <div className="space-y-3">
            {dashaFull.mahadashas.map((m, mIdx) => {
              const isMExpanded = expandedMIdx === mIdx;
              return (
                <div
                  key={mIdx}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    m.isCurrent
                      ? 'bg-amber-900/80 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                      : 'bg-amber-900/30 border-amber-800/60 hover:bg-amber-900/50'
                  }`}
                >
                  {/* Mahadasha Header */}
                  <div
                    onClick={() => setExpandedMIdx(isMExpanded ? null : mIdx)}
                    className="p-4 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      {isMExpanded ? (
                        <ChevronDown className="w-5 h-5 text-amber-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-amber-400" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-amber-100">
                            {m.planet} महादशा ({m.durationFormattedNepali})
                          </h4>
                          {m.isCurrent && (
                            <span className="bg-emerald-900 text-emerald-200 border border-emerald-600 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> हाल सक्रिय
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-amber-300/80 mt-0.5">
                          अवधि: {m.startDateBS} देखि {m.endDateBS}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs text-amber-400 font-semibold">
                      {isMExpanded ? 'अन्तरदशा लुकाउनुहोस्' : 'अन्तरदशा हेर्नुहोस् ➔'}
                    </span>
                  </div>

                  {/* Level 2: Antardashas */}
                  {isMExpanded && m.subNodes && (
                    <div className="bg-amber-950/90 border-t border-amber-800 p-4 space-y-3">
                      <h5 className="text-xs font-bold text-amber-300 mb-2">
                        ॥ {m.planet} महादशा अन्तर्गतका ९ अन्तरदशाहरू ॥
                      </h5>
                      <div className="space-y-2">
                        {m.subNodes.map((a, aIdx) => {
                          const isADExpanded = expandedADIdx === aIdx;
                          return (
                            <div
                              key={aIdx}
                              className={`rounded-lg border text-xs overflow-hidden ${
                                a.isCurrent
                                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-100'
                                  : 'bg-amber-900/40 border-amber-800/50 text-amber-200'
                              }`}
                            >
                              <div
                                onClick={() => setExpandedADIdx(isADExpanded ? null : aIdx)}
                                className="p-3 flex items-center justify-between cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  {isADExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-emerald-400" />
                                  )}
                                  <span className="font-bold">
                                    {m.planet} – {a.planet} अन्तरदशा
                                  </span>
                                  {a.isCurrent && (
                                    <span className="text-[9px] bg-emerald-800 text-emerald-100 px-1.5 py-0.5 rounded">
                                      सक्रिय
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-amber-300/80">
                                  {a.startDateBS} देखि {a.endDateBS}
                                </span>
                              </div>

                              {/* Level 3: Pratyantardashas */}
                              {isADExpanded && a.subNodes && (
                                <div className="bg-amber-950 p-3 border-t border-amber-800/80">
                                  <h6 className="text-[11px] font-bold text-cyan-300 mb-2">
                                    {m.planet} – {a.planet} अन्तर्गतका प्रत्यन्तरदशाहरू:
                                  </h6>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    {a.subNodes.map((p, pIdx) => (
                                      <div
                                        key={pIdx}
                                        className={`p-2 rounded border text-[11px] ${
                                          p.isCurrent
                                            ? 'bg-cyan-950 border-cyan-500 text-cyan-100 font-bold'
                                            : 'bg-amber-900/30 border-amber-800/40 text-amber-200'
                                        }`}
                                      >
                                        <div className="font-bold">{a.planet} – {p.planet}</div>
                                        <div className="text-[10px] text-amber-300/80 mt-0.5">
                                          {p.startDateBS} देखि {p.endDateBS}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DETAILED ANTARDASHA BREAKDOWN TABLE */}
      {activeTab === 'antardasha' && (
        <div className="bg-amber-950/80 border border-amber-800/80 rounded-2xl p-5 shadow-xl space-y-6">
          <div className="border-b border-amber-800 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold font-serif text-amber-200 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <span>महादशा अनुसार विस्तृत अन्तरदशा खण्ड तालिका (Antardasha Detailed Breakdown Table)</span>
              </h3>
              <p className="text-xs text-amber-300/80 mt-1">
                तल दिइएको महादशा ग्रहमा क्लिक गरी उक्त महादशा भित्रका सबै ९ अन्तरदशाहरूको प्रारम्भ/समाप्ति मिति, अवधि तथा स्थिति तालिकामा हेर्नुहोस्।
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="print:hidden text-xs bg-amber-800/40 hover:bg-amber-700/50 border border-amber-600/60 text-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-start md:self-auto transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>तालिका छाप्नुहोस्</span>
            </button>
          </div>

          {/* 9 Mahadasha Quick Selector Chips */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider">
              महादशा छनोट गर्नुहोस्:
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
              {dashaFull.mahadashas.map((m, mIdx) => {
                const isSelected = selectedMIndex === mIdx;
                return (
                  <button
                    key={mIdx}
                    onClick={() => {
                      setSelectedMIndex(mIdx);
                      setExpandedAntarIdx(null);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center relative ${
                      isSelected
                        ? 'bg-amber-600 text-amber-950 border-amber-400 shadow-lg font-bold scale-105'
                        : m.isCurrent
                        ? 'bg-amber-900/90 text-amber-100 border-emerald-500 hover:bg-amber-800/80'
                        : 'bg-amber-900/30 text-amber-200 border-amber-800/60 hover:bg-amber-900/60'
                    }`}
                  >
                    <span className="text-xs font-bold">{m.planet}</span>
                    <span className="text-[10px] opacity-80 mt-0.5">{m.durationFormattedNepali}</span>
                    {m.isCurrent && (
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Mahadasha Header Banner */}
          {dashaFull.mahadashas[selectedMIndex] && (
            <div className="bg-gradient-to-r from-amber-900/80 via-amber-850/80 to-amber-900/80 border border-amber-600/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-amber-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30 font-bold text-lg font-serif">
                  {dashaFull.mahadashas[selectedMIndex].planet}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-amber-100 font-serif">
                      {dashaFull.mahadashas[selectedMIndex].planet} महादशा अन्तर्गतका ९ अन्तरदशाहरू
                    </h4>
                    {dashaFull.mahadashas[selectedMIndex].isCurrent && (
                      <span className="bg-emerald-900/90 text-emerald-200 border border-emerald-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        हाल सक्रिय महादशा
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-300/80 mt-0.5">
                    कुल अवधि: {dashaFull.mahadashas[selectedMIndex].durationFormattedNepali} ({dashaFull.mahadashas[selectedMIndex].startDateBS} देखि {dashaFull.mahadashas[selectedMIndex].endDateBS})
                  </p>
                </div>
              </div>

              <div className="text-xs text-right bg-amber-950/60 p-2.5 rounded-lg border border-amber-800/60">
                <span className="text-amber-400 font-semibold block">विक्रम संवत् अवधि</span>
                <span className="text-amber-200">
                  {dashaFull.mahadashas[selectedMIndex].startDateBS} ➔ {dashaFull.mahadashas[selectedMIndex].endDateBS}
                </span>
              </div>
            </div>
          )}

          {/* Detailed Antardasha Table */}
          {dashaFull.mahadashas[selectedMIndex]?.subNodes && (
            <div className="overflow-x-auto rounded-xl border border-amber-800/80 shadow-md">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-amber-900/80 text-amber-200 border-b border-amber-800 font-serif">
                    <th className="p-3 text-center border-r border-amber-800/60 w-12">क्र.सं.</th>
                    <th className="p-3 border-r border-amber-800/60">अन्तरदशा स्वामी (AD)</th>
                    <th className="p-3 border-r border-amber-800/60">प्रारम्भ मिति (BS / AD)</th>
                    <th className="p-3 border-r border-amber-800/60">समाप्ति मिति (BS / AD)</th>
                    <th className="p-3 border-r border-amber-800/60 text-center">अवधि</th>
                    <th className="p-3 text-center">स्थिति / विवरण</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-800/40 text-amber-100">
                  {dashaFull.mahadashas[selectedMIndex].subNodes.map((ad, adIdx) => {
                    const parentM = dashaFull.mahadashas[selectedMIndex];
                    const isExpanded = expandedAntarIdx === adIdx;
                    const nowMs = new Date().getTime();
                    const isPast = ad.endMs < nowMs;
                    const isFuture = ad.startMs > nowMs;

                    return (
                      <React.Fragment key={adIdx}>
                        <tr
                          onClick={() => setExpandedAntarIdx(isExpanded ? null : adIdx)}
                          className={`cursor-pointer transition-colors ${
                            ad.isCurrent
                              ? 'bg-emerald-950/90 font-bold border-l-4 border-l-emerald-500 text-emerald-100'
                              : isPast
                              ? 'bg-amber-950/40 hover:bg-amber-900/30 text-stone-300'
                              : 'bg-amber-900/20 hover:bg-amber-900/40 text-amber-100'
                          }`}
                        >
                          <td className="p-3 text-center font-bold text-amber-300/80 border-r border-amber-800/40">
                            {toDevanagariNumerals(adIdx + 1)}
                          </td>
                          <td className="p-3 font-semibold border-r border-amber-800/40">
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                              )}
                              <span>
                                {parentM.planet} – {ad.planet} अन्तरदशा
                              </span>
                            </div>
                          </td>
                          <td className="p-3 border-r border-amber-800/40 whitespace-nowrap">
                            <div className="font-semibold text-amber-200">{ad.startDateBS}</div>
                          </td>
                          <td className="p-3 border-r border-amber-800/40 whitespace-nowrap">
                            <div className="font-semibold text-amber-200">{ad.endDateBS}</div>
                          </td>
                          <td className="p-3 text-center font-medium border-r border-amber-800/40 whitespace-nowrap">
                            <span className="bg-amber-900/60 border border-amber-700/60 px-2 py-0.5 rounded text-[11px] text-amber-200">
                              {ad.durationFormattedNepali}
                            </span>
                          </td>
                          <td className="p-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {ad.isCurrent ? (
                                <span className="bg-emerald-800 text-emerald-100 border border-emerald-500 text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 shadow-sm">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-300" /> हाल सक्रिय
                                </span>
                              ) : isPast ? (
                                <span className="bg-stone-800 text-stone-400 border border-stone-700 text-[10px] px-2 py-0.5 rounded">
                                  भुक्त
                                </span>
                              ) : (
                                <span className="bg-amber-900/50 text-amber-300 border border-amber-700/60 text-[10px] px-2 py-0.5 rounded">
                                  आगामी
                                </span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDashaPopup({
                                    level: 'antardasha',
                                    planet: parentM.planet,
                                    subPlanet: ad.planet,
                                    startDateBS: ad.startDateBS,
                                    endDateBS: ad.endDateBS,
                                    durationFormattedNepali: ad.durationFormattedNepali,
                                    isCurrentActive: ad.isCurrent
                                  });
                                }}
                                className="p-1 rounded bg-amber-800/60 hover:bg-amber-700 text-amber-200 border border-amber-600/50 cursor-pointer"
                                title={`${parentM.planet}-${ad.planet} अन्तरदशा श्लोक हेर्नुहोस्`}
                              >
                                <BookOpen className="w-3 h-3 text-amber-300" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expandable Sub-Row: Pratyantardashas */}
                        {isExpanded && ad.subNodes && (
                          <tr className="bg-amber-950 border-b border-amber-800">
                            <td colSpan={6} className="p-4 bg-amber-950/90">
                              <div className="bg-amber-900/30 border border-amber-700/60 rounded-xl p-3.5 space-y-3">
                                <h5 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 border-b border-amber-800/80 pb-2">
                                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                                  <span>
                                    ॥ {parentM.planet} – {ad.planet} अन्तरदशा अन्तर्गतका ९ प्रत्यन्तरदशाहरू ॥
                                  </span>
                                </h5>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                                  {ad.subNodes.map((pd, pdIdx) => (
                                    <div
                                      key={pdIdx}
                                      className={`p-2.5 rounded-lg border text-xs flex justify-between items-center ${
                                        pd.isCurrent
                                          ? 'bg-cyan-950 border-cyan-500 text-cyan-100 font-bold shadow'
                                          : 'bg-amber-950/80 border-amber-800/60 text-amber-200'
                                      }`}
                                    >
                                      <div>
                                        <div className="font-bold text-amber-100">
                                          {ad.planet} – {pd.planet}
                                        </div>
                                        <div className="text-[10px] text-amber-300/80 mt-0.5">
                                          {pd.startDateBS} देखि {pd.endDateBS}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-[10px] bg-amber-900/80 text-amber-300 px-1.5 py-0.5 rounded border border-amber-700/50">
                                          {pd.durationFormattedNepali}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {activeTab === 'search' && (
        <div className="bg-amber-950/80 border border-amber-800/80 rounded-2xl p-5 shadow-xl space-y-5">
          <div className="border-b border-amber-800 pb-3">
            <h3 className="text-base font-bold font-serif text-amber-200 flex items-center gap-2">
              <Search className="w-5 h-5 text-amber-400" />
              <span>लक्षित मिति अनुसार पञ्चस्तरीय दशा खोज प्रणाली</span>
            </h3>
            <p className="text-xs text-amber-300/80 mt-1">
              कुनै पनि भूत, वर्तमान वा भविष्यको विक्रम संवत् मिति रोजेर उक्त समयमा सक्रिय महादशा देखि प्राणदशा सम्मको ५-स्तरीय क्रम पाउनुहोस्।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-amber-900/40 border border-amber-800/60 p-4 rounded-xl">
            <div className="md:col-span-2">
              <NepaliDatePicker
                valueBS={activeChain.targetDateBS}
                valueAD={targetDateAD}
                onChange={({ dateAD }) => setTargetDateAD(dateAD)}
                label="लक्षित मिति (विक्रम संवत्) *"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1">
                समय (Target Time 24hr)
              </label>
              <input
                type="time"
                value={targetTimeStr}
                onChange={(e) => setTargetTimeStr(e.target.value)}
                className="w-full bg-amber-950 border border-amber-700 rounded-lg px-3 py-2 text-xs text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Search Result Display */}
          <div className="bg-gradient-to-r from-amber-900/60 via-amber-850/60 to-amber-900/60 border border-amber-600/80 rounded-xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-amber-200 flex items-center gap-2 border-b border-amber-800 pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{activeChain.targetDateBS} मा सक्रिय ५-स्तरीय दशा</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="bg-amber-950 border border-amber-700 p-3 rounded-lg text-center">
                <span className="text-[10px] text-amber-400 font-bold block">१. महादशा</span>
                <span className="text-base font-bold text-amber-100 my-1 block">
                  {activeChain.mahadasha.planet}
                </span>
                <span className="text-[10px] text-amber-300/80 block">
                  {activeChain.mahadasha.startDateBS} देखि {activeChain.mahadasha.endDateBS}
                </span>
              </div>

              <div className="bg-amber-950 border border-emerald-700 p-3 rounded-lg text-center">
                <span className="text-[10px] text-emerald-400 font-bold block">२. अन्तरदशा</span>
                <span className="text-base font-bold text-emerald-200 my-1 block">
                  {activeChain.antardasha.planet}
                </span>
                <span className="text-[10px] text-amber-300/80 block">
                  {activeChain.antardasha.startDateBS} देखि {activeChain.antardasha.endDateBS}
                </span>
              </div>

              <div className="bg-amber-950 border border-cyan-700 p-3 rounded-lg text-center">
                <span className="text-[10px] text-cyan-400 font-bold block">३. प्रत्यन्तरदशा</span>
                <span className="text-base font-bold text-cyan-200 my-1 block">
                  {activeChain.pratyantardasha.planet}
                </span>
                <span className="text-[10px] text-amber-300/80 block">
                  {activeChain.pratyantardasha.startDateBS} देखि {activeChain.pratyantardasha.endDateBS}
                </span>
              </div>

              <div className="bg-amber-950 border border-purple-700 p-3 rounded-lg text-center">
                <span className="text-[10px] text-purple-400 font-bold block">४. सूक्ष्मदशा</span>
                <span className="text-base font-bold text-purple-200 my-1 block">
                  {activeChain.sukshmadasha.planet}
                </span>
                <span className="text-[10px] text-amber-300/80 block">
                  {activeChain.sukshmadasha.startDateBS} देखि {activeChain.sukshmadasha.endDateBS}
                </span>
              </div>

              <div className="bg-amber-950 border border-rose-700 p-3 rounded-lg text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] text-rose-400 font-bold block">५. प्राणदशा</span>
                <span className="text-base font-bold text-rose-200 my-1 block">
                  {activeChain.pranadasha.planet}
                </span>
                <span className="text-[10px] text-amber-300/80 block">
                  {activeChain.pranadasha.startTimeNepali}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DASHA - GOCHAR COORDINATION */}
      {activeTab === 'gochar' && (
        <div className="bg-amber-950/80 border border-amber-800/80 rounded-2xl p-5 shadow-xl space-y-5">
          <div className="border-b border-amber-800 pb-3">
            <h3 className="text-base font-bold font-serif text-amber-200 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" />
              <span>दशा–गोचर समन्वय (Dasha + Transit Coordination Engine)</span>
            </h3>
            <p className="text-xs text-amber-300/80 mt-1">
              सक्रिय दशा स्वामी ग्रहको जन्मकालिक स्थिति (राशि, भाव, गरिमा) र लक्षित मितिको गोचर (आकाशीय स्थिति) को एकसाथ विश्लेषण।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Active Mahadasha Lord Natal Info */}
            <div className="bg-amber-900/40 border border-amber-700/80 p-4 rounded-xl text-amber-100">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
                महादशा स्वामी ({gocharCoordination.activeDashaHierarchy.mahadasha}) - जन्मकालिक स्थिति
              </span>
              {gocharCoordination.mahadashaPlanetNatalInfo ? (
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between border-b border-amber-800/50 pb-1">
                    <span className="text-amber-300">जन्म राशि:</span>
                    <span className="font-bold">{gocharCoordination.mahadashaPlanetNatalInfo.rashiName}</span>
                  </div>
                  <div className="flex justify-between border-b border-amber-800/50 pb-1">
                    <span className="text-amber-300">जन्म भाव (House):</span>
                    <span className="font-bold">{toDevanagariNumerals(gocharCoordination.mahadashaPlanetNatalInfo.bhava)} भाव</span>
                  </div>
                  <div className="flex justify-between border-b border-amber-800/50 pb-1">
                    <span className="text-amber-300">गरिमा (Dignity):</span>
                    <span className="font-bold text-emerald-300">{gocharCoordination.mahadashaPlanetNatalInfo.dignity}</span>
                  </div>
                  <div className="flex justify-between border-b border-amber-800/50 pb-1">
                    <span className="text-amber-300">नक्षत्र:</span>
                    <span className="font-bold">{gocharCoordination.mahadashaPlanetNatalInfo.nakshatraName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-300">अवस्था:</span>
                    <span className="font-bold">
                      {gocharCoordination.mahadashaPlanetNatalInfo.isRetrograde ? 'वक्री ' : 'मार्गी '}
                      {gocharCoordination.mahadashaPlanetNatalInfo.isCombust ? '(अस्त)' : ''}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-300/80">जानकारी उपलब्ध छैन</p>
              )}
            </div>

            {/* Active Antardasha Lord Natal Info */}
            <div className="bg-emerald-950/50 border border-emerald-700/80 p-4 rounded-xl text-emerald-100">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2">
                अन्तरदशा स्वामी ({gocharCoordination.activeDashaHierarchy.antardasha}) - जन्मकालिक स्थिति
              </span>
              {gocharCoordination.antardashaPlanetNatalInfo ? (
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between border-b border-emerald-800/50 pb-1">
                    <span className="text-emerald-300">जन्म राशि:</span>
                    <span className="font-bold">{gocharCoordination.antardashaPlanetNatalInfo.rashiName}</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-800/50 pb-1">
                    <span className="text-emerald-300">जन्म भाव (House):</span>
                    <span className="font-bold">{toDevanagariNumerals(gocharCoordination.antardashaPlanetNatalInfo.bhava)} भाव</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-800/50 pb-1">
                    <span className="text-emerald-300">गरिमा (Dignity):</span>
                    <span className="font-bold text-emerald-300">{gocharCoordination.antardashaPlanetNatalInfo.dignity}</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-800/50 pb-1">
                    <span className="text-emerald-300">नक्षत्र:</span>
                    <span className="font-bold">{gocharCoordination.antardashaPlanetNatalInfo.nakshatraName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-300">अवस्था:</span>
                    <span className="font-bold">
                      {gocharCoordination.antardashaPlanetNatalInfo.isRetrograde ? 'वक्री ' : 'मार्गी '}
                      {gocharCoordination.antardashaPlanetNatalInfo.isCombust ? '(अस्त)' : ''}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-emerald-300/80">जानकारी उपलब्ध छैन</p>
              )}
            </div>
          </div>

          {/* Transiting Planets Table on Target Date */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              लक्षित मिति ({gocharCoordination.targetDateBS}) मा ९ ग्रहहरूको गोचर (Transit) स्थिति:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {gocharCoordination.transitPlanetsOnTargetDate.map((tp, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-amber-900/30 border border-amber-800/50 rounded-lg flex items-center justify-between text-amber-100"
                >
                  <div>
                    <span className="font-bold text-amber-200">{tp.name}</span>
                    <span className="text-[10px] text-amber-300/80 block">
                      {tp.transitRashiName} ({toDevanagariNumerals(tp.formattedDegree)})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-amber-800/60 px-1.5 py-0.5 rounded text-amber-200">
                      चन्द्रमाबाट {toDevanagariNumerals(tp.transitBhavaFromMoon)} भाव
                    </span>
                    {tp.isRetrograde && (
                      <span className="block text-[9px] text-rose-400 font-bold mt-0.5">
                        वक्री
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PRINTABLE REPORT */}
      {activeTab === 'report' && (
        <div className="bg-amber-950/80 border border-amber-800/80 rounded-2xl p-6 shadow-xl text-amber-100 print:bg-white print:text-black print:border-none space-y-6">
          <div className="flex justify-between items-center border-b border-amber-800 pb-4">
            <div>
              <h3 className="text-lg font-bold font-serif text-amber-200 print:text-black">
                दशा प्रतिवेदन (Vimshottari Dasha Official Report)
              </h3>
              <p className="text-xs text-amber-300/80 print:text-stone-600">
                प्रामाणिक वैदिक ज्योतिष तथा लाहिरी अयनांश खगोलीय गणना
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="print:hidden bg-amber-600 hover:bg-amber-500 text-amber-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md"
            >
              छाप्नुहोस् (Print)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs border border-amber-800/60 p-4 rounded-xl print:border-stone-400">
            <div>
              <span className="font-bold text-amber-400 print:text-black">नाम:</span> {profile?.name || 'राम शर्मा'}
            </div>
            <div>
              <span className="font-bold text-amber-400 print:text-black">जन्म मिति (वि.सं.):</span> {profile?.dateBS || 'वि.सं. २०८३ जेठ १५'}
            </div>
            <div>
              <span className="font-bold text-amber-400 print:text-black">जन्म समय:</span> {birthTimeStr}
            </div>
            <div>
              <span className="font-bold text-amber-400 print:text-black">जन्म स्थान:</span> {profile?.location?.name || 'काठमाडौँ'}
            </div>
            <div>
              <span className="font-bold text-amber-400 print:text-black">जन्म नक्षत्र:</span> {balance.nakshatraName} (पाद {toDevanagariNumerals(balance.pada)})
            </div>
            <div>
              <span className="font-bold text-amber-400 print:text-black">दशा भोग्य:</span> {balance.formattedBalanceNepali}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-amber-300 print:text-black border-b border-amber-800 pb-1">
              १२०-वर्ष महादशा एवं मुख्य अन्तरदशा तालिका
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse border border-amber-800/60 print:border-stone-400">
                <thead>
                  <tr className="bg-amber-900/60 print:bg-stone-200 text-amber-200 print:text-black">
                    <th className="p-2 border border-amber-800/60 print:border-stone-400">क्रम</th>
                    <th className="p-2 border border-amber-800/60 print:border-stone-400">महादशा स्वामी</th>
                    <th className="p-2 border border-amber-800/60 print:border-stone-400">अवधि (वर्ष)</th>
                    <th className="p-2 border border-amber-800/60 print:border-stone-400">प्रारम्भ मिति (BS)</th>
                    <th className="p-2 border border-amber-800/60 print:border-stone-400">समाप्ति मिति (BS)</th>
                    <th className="p-2 border border-amber-800/60 print:border-stone-400">स्थिति</th>
                  </tr>
                </thead>
                <tbody>
                  {dashaFull.mahadashas.map((m, idx) => (
                    <tr
                      key={idx}
                      className={
                        m.isCurrent
                          ? 'bg-amber-900/80 font-bold text-amber-100 print:bg-amber-100 print:text-black'
                          : 'hover:bg-amber-900/30'
                      }
                    >
                      <td className="p-2 border border-amber-800/60 print:border-stone-400">{toDevanagariNumerals(idx + 1)}</td>
                      <td className="p-2 border border-amber-800/60 print:border-stone-400">{m.planet} महादशा</td>
                      <td className="p-2 border border-amber-800/60 print:border-stone-400">{m.durationFormattedNepali}</td>
                      <td className="p-2 border border-amber-800/60 print:border-stone-400">{m.startDateBS}</td>
                      <td className="p-2 border border-amber-800/60 print:border-stone-400">{m.endDateBS}</td>
                      <td className="p-2 border border-amber-800/60 print:border-stone-400">
                        {m.isCurrent ? 'सक्रिय (Active)' : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* BPHS Classical Shloka Side Panel / Drawer */}
      <BPHSShlokaSidePanel
        isOpen={isShlokaPanelOpen}
        onClose={() => setIsShlokaPanelOpen(false)}
        target={shlokaTarget}
        onSelectTarget={(t) => setShlokaTarget(t)}
      />

      {/* Dedicated Interactive Dasha Shloka Popup Modal */}
      <DashaShlokaModal
        isOpen={isDashaModalOpen}
        onClose={() => setIsDashaModalOpen(false)}
        data={dashaModalData}
      />
    </div>
  );
};
