import React, { useState, useMemo, useCallback } from 'react';
import {
  Printer,
  Download,
  X,
  ZoomIn,
  ZoomOut,
  FileText,
  Calendar,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  Sun,
  Layout,
  Scroll,
  Eye,
  Sliders,
  Palette
} from 'lucide-react';

import {
  BirthDetails,
  LagnaInfo,
  PlanetPosition,
  PanchangaData,
  VimshottariDashaResult,
  YogaResult,
  OrganizationProfile,
  AstrologerProfile
} from '../types/astrology';

import { PrintablePage, PrintKeepTogether, PrintTableContainer } from './PrintablePage';
import { exportElementToPDF, printElement } from '../utils/pdfGenerator';
import { ReportActionToolbar } from './common/ReportActionToolbar';
import { toDevanagariNumerals, fromDevanagariNumerals } from '../utils/nepaliCalendar';
import { generateDivisionalChart, calculatePlanetaryPositions, calculateLagna, getJulianDay, getAyanamsa } from '../utils/astroCalculations';
import { calculateBhavaAndDrishtiSystem } from '../utils/bhavaDrishtiEngine';
import {
  formatPlanetDegreesMinutes,
  getPlanetStateDescriptionNepali,
  NORTH_INDIAN_HOUSE_GEO
} from '../utils/aspectEngine';
import {
  calculatePanchanga,
  generateMonthlyPanchanga
} from '../utils/panchangaEngine';
import {
  convertADToBSFull,
  NEPALI_MONTH_NAMES
} from '../utils/bsCalendarData';
import { generateFull5LevelVimshottariDasha } from '../utils/dashaEngine';
import { BrihatCheenaDocument } from './BrihatCheenaDocument';
import { BalanandaDailyPanchangaDocument } from './panchanga/BalanandaDailyPanchangaDocument';

export type PrintReportType = 'kundali' | 'panchanga' | 'combined' | 'tipan' | 'brihat_china';
export type PrintColorTheme = 'vedic_color' | 'monochrome' | 'sepia';
export type ChartStyleType = 'North Indian' | 'South Indian' | 'East Indian';

export interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: BirthDetails | null;
  profiles?: BirthDetails[];
  lagna?: LagnaInfo;
  planets?: PlanetPosition[];
  panchanga?: PanchangaData;
  dasha?: VimshottariDashaResult;
  yogas?: YogaResult[];
  orgProfile?: OrganizationProfile;
  astrologer?: AstrologerProfile;
  defaultReportType?: PrintReportType;
  selectedDateAD?: string;
}

// 2-Letter Planet Abbreviation Helper
function getPlanetAbbr(name: string): string {
  switch (name) {
    case 'सूर्य': return 'सू';
    case 'चन्द्र': return 'च';
    case 'मंगल':
    case 'मङ्गल': return 'मं';
    case 'बुध': return 'बु';
    case 'गुरु':
    case 'वृहस्पति': return 'बृ';
    case 'शुक्र': return 'शु';
    case 'शनि': return 'श';
    case 'राहु': return 'रा';
    case 'केतु': return 'के';
    case 'लग्न': return 'ल';
    default: return name.slice(0, 2);
  }
}

// -------------------------------------------------------------
// SVG Chart Renderers for Print
// -------------------------------------------------------------

// 1. North Indian Diamond Chart (Print Optimized)
const PrintNorthIndianChart: React.FC<{
  title: string;
  houses: Array<{ houseNumber: number; rashiId: number; planets: PlanetPosition[] }>;
  theme: PrintColorTheme;
}> = ({ title, houses, theme }) => {
  const borderColor = theme === 'monochrome' ? '#000000' : theme === 'sepia' ? '#78350F' : '#991B1B';
  const pillBg = theme === 'monochrome' ? 'bg-stone-900 text-white' : theme === 'sepia' ? 'bg-amber-900 text-amber-50' : 'bg-red-800 text-white';
  const rashiColor = theme === 'monochrome' ? 'text-stone-900 font-black' : theme === 'sepia' ? 'text-amber-900 font-black' : 'text-red-900 font-extrabold';

  const allPlanetsMap = new Map<string, PlanetPosition>();
  houses.forEach((h) => {
    h.planets.forEach((p) => {
      if (p.id && !allPlanetsMap.has(p.id)) {
        allPlanetsMap.set(p.id, p);
      }
    });
  });
  const allPlanets = Array.from(allPlanetsMap.values());
  const retroPlanets = allPlanets.filter((p) => p.isRetrograde);
  const combustPlanets = allPlanets.filter((p) => p.isCombust);

  return (
    <div className="flex flex-col items-center w-full">
      <div className={`text-[10px] font-bold px-3 py-0.5 rounded-full mb-1 tracking-wider shadow-2xs ${pillBg}`}>
        {title}
      </div>
      <div className="relative w-full aspect-square max-w-[260px] bg-white border border-stone-800 p-0.5 select-none">
        <svg viewBox="0 0 400 400" className="w-full h-full fill-none">
          {/* Base Grid */}
          <rect x="5" y="5" width="390" height="390" stroke={borderColor} strokeWidth="2.5" />
          <line x1="5" y1="5" x2="395" y2="395" stroke={borderColor} strokeWidth="1.5" />
          <line x1="395" y1="5" x2="5" y2="395" stroke={borderColor} strokeWidth="1.5" />
          <polygon points="200,5 395,200 200,395 5,200" stroke={borderColor} strokeWidth="2" />
        </svg>

        {/* House Content */}
        {houses.map((h) => {
          const geo = NORTH_INDIAN_HOUSE_GEO[h.houseNumber];
          if (!geo) return null;

          return (
            <div
              key={h.houseNumber}
              className="absolute text-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${(geo.center.x / 400) * 100}%`, top: `${(geo.center.y / 400) * 100}%` }}
            >
              {/* Rashi Number */}
              <div className={`text-[10px] leading-none mb-0.5 ${rashiColor}`}>
                {toDevanagariNumerals(h.rashiId)}
                {h.houseNumber === 1 && <span className="text-[8px] text-red-600 ml-0.5">(ल)</span>}
              </div>

              {/* Planets */}
              <div className="flex flex-wrap justify-center items-center gap-0.5 max-w-[68px]">
                {h.planets.map((p) => {
                  const degStr = formatPlanetDegreesMinutes(p);
                  return (
                    <span
                      key={p.id}
                      className={`text-[8px] font-bold px-0.5 leading-tight rounded-xs inline-flex items-center gap-0.5 ${
                        theme === 'monochrome'
                          ? 'border border-stone-800 text-stone-900 bg-white font-mono'
                          : theme === 'sepia'
                          ? 'bg-amber-100 text-amber-950 border border-amber-400'
                          : 'bg-amber-50 text-stone-900 border border-amber-300'
                      }`}
                    >
                      <span>{getPlanetAbbr(p.name)}</span>
                      {degStr && <span className="text-[7px] text-stone-600 font-normal">{degStr}</span>}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {/* कुण्डली मुनि सानो लामो ब्लक: वक्री तथा अस्त ग्रह स्थिति */}
      <div className="w-full max-w-[260px] mt-1 px-1.5 py-0.5 bg-[#FFFBEB] border border-amber-900/60 rounded text-[7.5px] leading-tight text-stone-800 text-center font-medium shadow-2xs">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
          <span>
            <strong className="text-red-700">वक्री (व):</strong>{' '}
            {retroPlanets.length > 0
              ? retroPlanets.map((p) => `${getPlanetAbbr(p.name)} (${p.name})`).join(', ')
              : 'छैन'}
          </span>
          <span className="text-stone-300">|</span>
          <span>
            <strong className="text-amber-700">अस्त (अ):</strong>{' '}
            {combustPlanets.length > 0
              ? combustPlanets.map((p) => `${getPlanetAbbr(p.name)} (${p.name})`).join(', ')
              : 'छैन'}
          </span>
        </div>
      </div>
    </div>
  );
};

// 2. South Indian Fixed Grid Chart (Print Optimized)
const SOUTH_INDIAN_BOX_ORDER = [
  { rashiId: 12, row: 0, col: 0, name: 'मीन' },
  { rashiId: 1,  row: 0, col: 1, name: 'मेष' },
  { rashiId: 2,  row: 0, col: 2, name: 'वृष' },
  { rashiId: 3,  row: 0, col: 3, name: 'मिथुन' },
  { rashiId: 11, row: 1, col: 0, name: 'कुम्भ' },
  { rashiId: 4,  row: 1, col: 3, name: 'कर्कट' },
  { rashiId: 10, row: 2, col: 0, name: 'मकर' },
  { rashiId: 5,  row: 2, col: 3, name: 'सिंह' },
  { rashiId: 9,  row: 3, col: 0, name: 'धनु' },
  { rashiId: 8,  row: 3, col: 1, name: 'वृश्चिक' },
  { rashiId: 7,  row: 3, col: 2, name: 'तुला' },
  { rashiId: 6,  row: 3, col: 3, name: 'कन्या' },
];

const PrintSouthIndianChart: React.FC<{
  title: string;
  lagnaRashiId: number;
  planets: PlanetPosition[];
  theme: PrintColorTheme;
}> = ({ title, lagnaRashiId, planets, theme }) => {
  const borderColor = theme === 'monochrome' ? 'border-black' : theme === 'sepia' ? 'border-amber-900' : 'border-red-900';
  const pillBg = theme === 'monochrome' ? 'bg-stone-900 text-white' : theme === 'sepia' ? 'bg-amber-900 text-amber-50' : 'bg-red-800 text-white';

  const retroPlanets = planets.filter((p) => p.isRetrograde);
  const combustPlanets = planets.filter((p) => p.isCombust);

  return (
    <div className="flex flex-col items-center w-full">
      <div className={`text-[10px] font-bold px-3 py-0.5 rounded-full mb-1 tracking-wider shadow-2xs ${pillBg}`}>
        {title} (दक्षिणी शैली)
      </div>
      <div className={`relative w-full aspect-square max-w-[260px] bg-white border-2 ${borderColor} grid grid-cols-4 grid-rows-4 select-none`}>
        {/* Center Blank Square */}
        <div className={`col-start-2 col-end-4 row-start-2 row-end-4 border ${borderColor} flex flex-col items-center justify-center bg-amber-50/40 p-1 text-center`}>
          <span className="text-[10px] font-black text-amber-900 font-serif">॥ {title} ॥</span>
          <span className="text-[8px] text-stone-600">लग्न: {toDevanagariNumerals(lagnaRashiId)} राशि</span>
        </div>

        {SOUTH_INDIAN_BOX_ORDER.map((box) => {
          const isLagna = box.rashiId === lagnaRashiId;
          const boxPlanets = planets.filter((p) => p.rashiId === box.rashiId);

          return (
            <div
              key={box.rashiId}
              style={{ gridColumn: box.col + 1, gridRow: box.row + 1 }}
              className={`border border-stone-700 p-0.5 flex flex-col justify-between relative ${
                isLagna ? (theme === 'monochrome' ? 'bg-stone-200' : 'bg-red-50/80') : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-center text-[7.5px] font-bold text-stone-600 leading-none">
                <span>{box.name}</span>
                {isLagna && <span className="text-red-700 font-black">ASC (लग्न)</span>}
              </div>
              <div className="flex flex-wrap gap-0.5 justify-center py-0.5">
                {boxPlanets.map((p) => {
                  const degStr = formatPlanetDegreesMinutes(p);
                  return (
                    <span
                      key={p.id}
                      className="text-[7.5px] font-bold px-0.5 bg-stone-100 border border-stone-300 rounded-xs text-stone-900 inline-flex items-center gap-0.5"
                    >
                      <span>{getPlanetAbbr(p.name)}</span>
                      {degStr && <span className="text-[6.5px] text-stone-600 font-normal">{degStr}</span>}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {/* कुण्डली मुनि सानो लामो ब्लक: वक्री तथा अस्त ग्रह स्थिति */}
      <div className="w-full max-w-[260px] mt-1 px-1.5 py-0.5 bg-[#FFFBEB] border border-amber-900/60 rounded text-[7.5px] leading-tight text-stone-800 text-center font-medium shadow-2xs">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
          <span>
            <strong className="text-red-700">वक्री (व):</strong>{' '}
            {retroPlanets.length > 0
              ? retroPlanets.map((p) => `${getPlanetAbbr(p.name)} (${p.name})`).join(', ')
              : 'छैन'}
          </span>
          <span className="text-stone-300">|</span>
          <span>
            <strong className="text-amber-700">अस्त (अ):</strong>{' '}
            {combustPlanets.length > 0
              ? combustPlanets.map((p) => `${getPlanetAbbr(p.name)} (${p.name})`).join(', ')
              : 'छैन'}
          </span>
        </div>
      </div>
    </div>
  );
};

const EAST_INDIAN_PRINT_BOX_GEO: Record<number, { pos: number; rashiId: number; name: string; center: { cx: number; cy: number } }> = {
  1: { pos: 1, rashiId: 1, name: 'मेष', center: { cx: 130, cy: 65 } },
  2: { pos: 2, rashiId: 2, name: 'वृष', center: { cx: 65, cy: 32 } },
  3: { pos: 3, rashiId: 3, name: 'मिथुन', center: { cx: 32, cy: 65 } },
  4: { pos: 4, rashiId: 4, name: 'कर्कट', center: { cx: 65, cy: 130 } },
  5: { pos: 5, rashiId: 5, name: 'सिंह', center: { cx: 32, cy: 195 } },
  6: { pos: 6, rashiId: 6, name: 'कन्या', center: { cx: 65, cy: 228 } },
  7: { pos: 7, rashiId: 7, name: 'तुला', center: { cx: 130, cy: 195 } },
  8: { pos: 8, rashiId: 8, name: 'वृश्चिक', center: { cx: 195, cy: 228 } },
  9: { pos: 9, rashiId: 9, name: 'धनु', center: { cx: 228, cy: 195 } },
  10: { pos: 10, rashiId: 10, name: 'मकर', center: { cx: 195, cy: 130 } },
  11: { pos: 11, rashiId: 11, name: 'कुम्भ', center: { cx: 228, cy: 65 } },
  12: { pos: 12, rashiId: 12, name: 'मीन', center: { cx: 195, cy: 32 } },
};

const PrintEastIndianChart: React.FC<{
  title: string;
  lagnaRashiId: number;
  planets: PlanetPosition[];
  theme: PrintColorTheme;
}> = ({ title, lagnaRashiId, planets, theme }) => {
  const borderColor = theme === 'monochrome' ? 'border-black stroke-black' : theme === 'sepia' ? 'border-amber-900 stroke-amber-900' : 'border-red-900 stroke-red-900';
  const pillBg = theme === 'monochrome' ? 'bg-stone-900 text-white' : theme === 'sepia' ? 'bg-amber-900 text-amber-50' : 'bg-red-800 text-white';

  const retroPlanets = planets.filter((p) => p.isRetrograde);
  const combustPlanets = planets.filter((p) => p.isCombust);

  return (
    <div className="flex flex-col items-center w-full">
      <div className={`text-[10px] font-bold px-3 py-0.5 rounded-full mb-1 tracking-wider shadow-2xs ${pillBg}`}>
        {title} (पूर्वी शैली)
      </div>
      <div className={`relative w-full aspect-square max-w-[260px] bg-white border-2 ${borderColor} select-none`}>
        <svg viewBox="0 0 260 260" className="w-full h-full stroke-stone-800 fill-none stroke-[1.2]">
          <line x1="0" y1="0" x2="260" y2="260" />
          <line x1="260" y1="0" x2="0" y2="260" />
          <polygon points="130,0 260,130 130,260 0,130" className={`stroke-[1.6] ${borderColor}`} />
        </svg>

        {Object.values(EAST_INDIAN_PRINT_BOX_GEO).map((box) => {
          const isLagna = box.rashiId === lagnaRashiId;
          const boxPlanets = planets.filter((p) => p.rashiId === box.rashiId);

          return (
            <div
              key={box.pos}
              className="absolute text-center transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none"
              style={{
                left: `${(box.center.cx / 260) * 100}%`,
                top: `${(box.center.cy / 260) * 100}%`,
              }}
            >
              <div className="flex items-center gap-0.5 leading-none">
                <span className="text-[7.5px] font-bold text-stone-700">{box.name}</span>
                {isLagna && <span className="text-[7.5px] text-red-700 font-black">(ल)</span>}
              </div>
              <div className="flex flex-wrap gap-0.5 justify-center mt-0.5 max-w-[60px]">
                {boxPlanets.map((p) => {
                  const degStr = formatPlanetDegreesMinutes(p);
                  return (
                    <span
                      key={p.id}
                      className="text-[7.5px] font-bold px-0.5 bg-stone-100 border border-stone-300 rounded-xs text-stone-900 inline-flex items-center gap-0.5"
                    >
                      <span>{getPlanetAbbr(p.name)}</span>
                      {degStr && <span className="text-[6.5px] text-stone-600 font-normal">{degStr}</span>}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {/* कुण्डली मुनि सानो लामो ब्लक: वक्री तथा अस्त ग्रह स्थिति */}
      <div className="w-full max-w-[260px] mt-1 px-1.5 py-0.5 bg-[#FFFBEB] border border-amber-900/60 rounded text-[7.5px] leading-tight text-stone-800 text-center font-medium shadow-2xs">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
          <span>
            <strong className="text-red-700">वक्री (व):</strong>{' '}
            {retroPlanets.length > 0
              ? retroPlanets.map((p) => `${getPlanetAbbr(p.name)} (${p.name})`).join(', ')
              : 'छैन'}
          </span>
          <span className="text-stone-300">|</span>
          <span>
            <strong className="text-amber-700">अस्त (अ):</strong>{' '}
            {combustPlanets.length > 0
              ? combustPlanets.map((p) => `${getPlanetAbbr(p.name)} (${p.name})`).join(', ')
              : 'छैन'}
          </span>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// MAIN PRINT PREVIEW MODAL COMPONENT
// -------------------------------------------------------------

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  profile,
  lagna: propLagna,
  planets: propPlanets = [],
  panchanga: propPanchanga,
  dasha: propDasha,
  orgProfile,
  astrologer,
  defaultReportType = 'kundali',
  selectedDateAD,
}) => {
  // Active Report Category: kundali | panchanga | combined | tipan
  const [reportType, setReportType] = useState<PrintReportType>(defaultReportType);

  // Appearance & Styling Controls
  const [colorTheme, setColorTheme] = useState<PrintColorTheme>('vedic_color');
  const [chartStyle, setChartStyle] = useState<ChartStyleType>('North Indian');
  const [showOrgHeader, setShowOrgHeader] = useState<boolean>(true);
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [showVedicBorder, setShowVedicBorder] = useState<boolean>(true);
  const [showSignatoryBox, setShowSignatoryBox] = useState<boolean>(true);

  // Zoom & Page View Controls
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activePageNum, setActivePageNum] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'all_pages' | 'single_page'>('all_pages');

  // Panchanga Date Selection within Modal
  const [modalDateAD] = useState<string>(
    selectedDateAD || new Date().toISOString().split('T')[0]
  );

  // Compute Panchanga Data dynamically
  const activePanchanga = useMemo(() => {
    if (propPanchanga && reportType === 'kundali') return propPanchanga;
    return calculatePanchanga(modalDateAD, '06:00', 27.7172, 85.3240, 5.75);
  }, [propPanchanga, modalDateAD, reportType]);

  const activeBS = useMemo(() => convertADToBSFull(modalDateAD), [modalDateAD]);

  // Monthly Panchanga Data for Page 2 of Panchanga Report
  const monthlyData = useMemo(() => {
    if (reportType !== 'panchanga' && reportType !== 'combined') return [];
    return generateMonthlyPanchanga(activeBS.year, activeBS.month, 27.7172, 85.3240, 5.75);
  }, [activeBS.year, activeBS.month, reportType]);

  // Derived Effective Astrology Data
  const effectiveProfile: BirthDetails = useMemo(() => {
    if (profile) return profile;
    return {
      name: 'श्रीमान/श्रीमती जातक',
      gender: 'male',
      dateAD: modalDateAD,
      dateBS: `${activeBS.year}-${String(activeBS.month).padStart(2, '0')}-${String(activeBS.day).padStart(2, '0')}`,
      time: '06:30',
      location: {
        name: 'काठमाडौँ, नेपाल',
        latitude: 27.7172,
        longitude: 85.3240,
        timeZone: 5.75,
        country: 'नेपाल'
      }
    };
  }, [profile, modalDateAD, activeBS]);

  const effectiveLagna: LagnaInfo = useMemo(() => {
    if (propLagna) return propLagna;
    const targetDate = effectiveProfile.dateAD || modalDateAD;
    const rawTime = effectiveProfile.time || '06:30';
    const cleanTime = fromDevanagariNumerals(rawTime);
    const jd = getJulianDay(targetDate, cleanTime, effectiveProfile.location?.timeZone || 5.75);
    const ayan = getAyanamsa(jd);
    return calculateLagna(jd, effectiveProfile.location?.latitude || 27.7172, effectiveProfile.location?.longitude || 85.3240, ayan);
  }, [propLagna, effectiveProfile, modalDateAD]);

  const effectivePlanets: PlanetPosition[] = useMemo(() => {
    if (propPlanets && propPlanets.length > 0) return propPlanets;
    const targetDate = effectiveProfile.dateAD || modalDateAD;
    const rawTime = effectiveProfile.time || '06:30';
    const cleanTime = fromDevanagariNumerals(rawTime);
    const jd = getJulianDay(targetDate, cleanTime, effectiveProfile.location?.timeZone || 5.75);
    const ayan = getAyanamsa(jd);
    return calculatePlanetaryPositions(jd, ayan, effectiveLagna.rashiId);
  }, [propPlanets, effectiveProfile, modalDateAD, effectiveLagna.rashiId]);

  // Divisional Charts Calculation
  const d1Chart = useMemo(() => generateDivisionalChart('D1', effectiveLagna, effectivePlanets), [effectiveLagna, effectivePlanets]);
  const d9Chart = useMemo(() => generateDivisionalChart('D9', effectiveLagna, effectivePlanets), [effectiveLagna, effectivePlanets]);
  const bhavaSystem = useMemo(() => calculateBhavaAndDrishtiSystem(effectiveLagna, effectivePlanets), [effectiveLagna, effectivePlanets]);

  // Compute rich effective Vimshottari Dasha
  const effectiveDasha = useMemo(() => {
    if (propDasha?.mahadashas && propDasha.mahadashas.length > 0) return propDasha;
    const moon = effectivePlanets.find((p) => p.name === 'चन्द्र') || effectivePlanets[1] || effectivePlanets[0];
    if (moon && effectiveProfile.dateAD) {
      try {
        const full = generateFull5LevelVimshottariDasha(moon, effectiveProfile.dateAD, effectiveProfile.time || '12:00');
        return {
          birthMoonDegree: moon.degree,
          balanceAtBirth: {
            planet: full.balanceAtBirth.nakshatraLord,
            yearsLeft: full.balanceAtBirth.yearsLeft,
            monthsLeft: full.balanceAtBirth.monthsLeft,
            daysLeft: full.balanceAtBirth.daysLeft,
          },
          mahadashas: full.mahadashas.map((m) => ({
            planet: m.planet,
            startDate: m.startDateBS || m.startDateAD,
            endDate: m.endDateBS || m.endDateAD,
            durationYears: m.durationDays ? Math.round(m.durationDays / 365.25) : 0,
            isCurrent: m.isCurrent,
          })),
          currentMahadasha: full.activeHierarchyAtTargetDate?.mahadasha ? {
            planet: full.activeHierarchyAtTargetDate.mahadasha.planet,
            startDate: full.activeHierarchyAtTargetDate.mahadasha.startDateBS,
            endDate: full.activeHierarchyAtTargetDate.mahadasha.endDateBS,
            durationYears: 0,
          } : undefined,
        };
      } catch (err) {
        console.error('Error generating dasha for preview modal:', err);
      }
    }
    return propDasha;
  }, [propDasha, effectivePlanets, effectiveProfile]);

  // Total Pages Calculation based on Report Type
  const totalPages = useMemo(() => {
    switch (reportType) {
      case 'brihat_china': return 10;
      case 'kundali': return 3;
      case 'panchanga': return 1;
      case 'combined': return 5;
      case 'tipan': return 1;
      default: return 3;
    }
  }, [reportType]);

  // Handlers for Print and PDF Export
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handlePrint = useCallback(() => {
    printElement('print_preview_printable_area');
  }, []);

  const handleDownloadPDF = useCallback(async () => {
    setIsExportingPDF(true);
    const sanitizedName = effectiveProfile.name.replace(/\s+/g, '_');
    const filename = `${reportType.toUpperCase()}_Report_${sanitizedName}.pdf`;
    try {
      await exportElementToPDF('print_preview_printable_area', filename, 'a4');
    } finally {
      setIsExportingPDF(false);
    }
  }, [reportType, effectiveProfile.name]);

  if (!isOpen) return null;

  // Color Theme Classes
  const themeContainerClass =
    colorTheme === 'monochrome'
      ? 'bg-white text-stone-900 border-stone-800'
      : colorTheme === 'sepia'
      ? 'bg-[#FAF6EE] text-[#451A03] border-amber-800'
      : 'bg-[#FFFDF7] text-[#1C1917] border-red-800';

  const themePrimaryText =
    colorTheme === 'monochrome'
      ? 'text-black'
      : colorTheme === 'sepia'
      ? 'text-amber-950'
      : 'text-[#7A1C1C]';

  const themeHeaderBg =
    colorTheme === 'monochrome'
      ? 'bg-stone-100 text-black border-black'
      : colorTheme === 'sepia'
      ? 'bg-amber-100 text-amber-950 border-amber-800'
      : 'bg-gradient-to-r from-red-900 via-amber-900 to-red-900 text-amber-100 border-red-800';

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-950/80 backdrop-blur-md overflow-hidden animate-fadeIn">
      {/* -------------------------------------------------------------
          TOP MODAL CONTROL TOOLBAR (Print Safe Excluded via .no-print)
         ------------------------------------------------------------- */}
      <header className="no-print bg-stone-900 text-stone-100 border-b border-stone-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md shrink-0">
        {/* Left Title & Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-900 flex items-center justify-center font-bold shrink-0">
            <Printer className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-amber-400 font-serif truncate">
                मुद्रण प्रिभ्यु तथा PDF निर्यात (Print Preview & PDF Export)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-800 text-amber-300 border border-stone-700">
                A4 Portrait
              </span>
            </div>
            <p className="text-xs text-stone-400 truncate">
              {effectiveProfile.name} | {reportType === 'kundali' ? 'जन्मकुण्डली प्रतिवेदन' : reportType === 'panchanga' ? 'वैदिक पञ्चाङ्ग' : reportType === 'combined' ? 'संयुक्त महाप्रतिवेदन' : 'जन्म टिपन'}
            </p>
          </div>
        </div>

        {/* Center: Report Mode Switcher Tabs */}
        <div className="flex items-center bg-stone-800/90 p-1 rounded-xl border border-stone-700">
          <button
            onClick={() => { setReportType('brihat_china'); setActivePageNum(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              reportType === 'brihat_china'
                ? 'bg-emerald-500 text-stone-950 shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>बृहत् चिना (१० पृष्ठ)</span>
          </button>

          <button
            onClick={() => { setReportType('kundali'); setActivePageNum(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              reportType === 'kundali'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Scroll className="w-3.5 h-3.5" />
            <span>जन्मकुण्डली (३ पृष्ठ)</span>
          </button>

          <button
            onClick={() => { setReportType('panchanga'); setActivePageNum(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              reportType === 'panchanga'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>पञ्चाङ्ग (लेटरहेड)</span>
          </button>

          <button
            onClick={() => { setReportType('combined'); setActivePageNum(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              reportType === 'combined'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>संयुक्त (५ पृष्ठ)</span>
          </button>

          <button
            onClick={() => { setReportType('tipan'); setActivePageNum(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              reportType === 'tipan'
                ? 'bg-amber-500 text-stone-950 shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>संक्षिप्त टिपन</span>
          </button>
        </div>

        {/* Right Action Buttons: Print, PDF, WhatsApp Share, Close */}
        <div className="flex items-center gap-2">
          <ReportActionToolbar
            elementId="print_preview_printable_area"
            reportTitle={`कुण्डली_प्रतिवेदन_${reportType}`}
            clientName={effectiveProfile.name}
            clientPhone={effectiveProfile.phone}
            dateBS={effectiveProfile.dateBS}
            orgName={orgProfile?.name}
            orgPhone={orgProfile?.phone}
            variant="dark_header"
            customSummaryText={`• प्रतिवेदन प्रकार: ${reportType === 'brihat_china' ? 'बृहत् चिना (विस्तृत)' : reportType === 'panchanga' ? 'पञ्चाङ्ग प्रतिवेदन' : reportType === 'tipan' ? 'संक्षिप्त टिपन' : 'कुण्डली चक्र'}\n• जन्म मिति: वि.सं. ${effectiveProfile.dateBS}\n• जन्म स्थान: ${effectiveProfile.location.name}`}
          />

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-all cursor-pointer ml-1"
            title="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* -------------------------------------------------------------
          SECONDARY TOOLBAR (Appearance, Theme, Zoom & Pagination Controls)
         ------------------------------------------------------------- */}
      <div className="no-print bg-stone-900/90 border-b border-stone-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-300 shrink-0">
        {/* Style & Theme Selectors */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Color Theme */}
          <div className="flex items-center gap-1.5 bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-700">
            <Palette className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] text-stone-400">रङ्ग:</span>
            <select
              value={colorTheme}
              onChange={(e) => setColorTheme(e.target.value as PrintColorTheme)}
              className="bg-transparent text-stone-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="vedic_color" className="bg-stone-900 text-stone-200">वैदिक रङ्गीन (Vedic Red/Gold)</option>
              <option value="monochrome" className="bg-stone-900 text-stone-200">सादा कालो-सेतो (B&W Mono)</option>
              <option value="sepia" className="bg-stone-900 text-stone-200">काष्ठ पाण्डुलिपि (Sepia)</option>
            </select>
          </div>

          {/* Chart Style */}
          <div className="flex items-center gap-1.5 bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-700">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] text-stone-400">कुण्डली:</span>
            <select
              value={chartStyle}
              onChange={(e) => setChartStyle(e.target.value as ChartStyleType)}
              className="bg-transparent text-stone-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="North Indian" className="bg-stone-900 text-stone-200">उत्तर भारतीय (Diamond)</option>
              <option value="South Indian" className="bg-stone-900 text-stone-200">दक्षिण भारतीय (Square)</option>
              <option value="East Indian" className="bg-stone-900 text-stone-200">पूर्वी भारतीय (Surya Chakra)</option>
            </select>
          </div>

          {/* Toggles */}
          <label className="flex items-center gap-1.5 cursor-pointer select-none bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-700">
            <input
              type="checkbox"
              checked={showOrgHeader}
              onChange={(e) => setShowOrgHeader(e.target.checked)}
              className="accent-amber-500 rounded cursor-pointer"
            />
            <span className="text-[11px]">संस्था लेटरहेड</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-700">
            <input
              type="checkbox"
              checked={showWatermark}
              onChange={(e) => setShowWatermark(e.target.checked)}
              className="accent-amber-500 rounded cursor-pointer"
            />
            <span className="text-[11px]">पृष्ठभूमि वाटरमार्क</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-700">
            <input
              type="checkbox"
              checked={showVedicBorder}
              onChange={(e) => setShowVedicBorder(e.target.checked)}
              className="accent-amber-500 rounded cursor-pointer"
            />
            <span className="text-[11px]">वैदिक किनारा फ्रेम</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-700">
            <input
              type="checkbox"
              checked={showSignatoryBox}
              onChange={(e) => setShowSignatoryBox(e.target.checked)}
              className="accent-amber-500 rounded cursor-pointer"
            />
            <span className="text-[11px]">ज्योतिषी हस्ताक्षर बक्स</span>
          </label>
        </div>

        {/* Zoom & View Layout Controls */}
        <div className="flex items-center gap-3">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-stone-800 px-2 py-0.5 rounded-lg border border-stone-700">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(50, prev - 10))}
              className="p-1 text-stone-400 hover:text-white cursor-pointer"
              title="जुम घटाउनुहोस्"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1 font-bold">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(150, prev + 10))}
              className="p-1 text-stone-400 hover:text-white cursor-pointer"
              title="जुम बढाउनुहोस्"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Page Display Mode */}
          <div className="flex items-center bg-stone-800 p-0.5 rounded-lg border border-stone-700">
            <button
              onClick={() => setViewMode('all_pages')}
              className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer ${
                viewMode === 'all_pages' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
              }`}
            >
              सबै पृष्ठहरू
            </button>
            <button
              onClick={() => setViewMode('single_page')}
              className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer ${
                viewMode === 'single_page' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-white'
              }`}
            >
              एक पृष्ठ
            </button>
          </div>

          {/* Pagination if single_page */}
          {viewMode === 'single_page' && (
            <div className="flex items-center gap-1 bg-stone-800 px-2 py-0.5 rounded-lg border border-stone-700">
              <button
                onClick={() => setActivePageNum((p) => Math.max(1, p - 1))}
                disabled={activePageNum === 1}
                className="p-1 text-stone-400 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-bold">
                {activePageNum} / {totalPages}
              </span>
              <button
                onClick={() => setActivePageNum((p) => Math.min(totalPages, p + 1))}
                disabled={activePageNum === totalPages}
                className="p-1 text-stone-400 hover:text-white disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------
          MAIN PREVIEW CANVAS (SCROLLABLE & PRINTABLE CONTAINER)
         ------------------------------------------------------------- */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-stone-900/60 custom-scrollbar">
        <div
          id="print_preview_printable_area"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          className="transition-transform duration-150 ease-out flex flex-col items-center gap-6"
        >
          {/* =========================================================================
              REPORT RENDERER 0: MASTER 10-PAGE BRIHAT CHEENA (१० पृष्ठे बृहत् चिना)
             ========================================================================= */}
          {reportType === 'brihat_china' && (
            <BrihatCheenaDocument
              profile={effectiveProfile}
              lagna={effectiveLagna}
              planets={effectivePlanets}
              panchanga={activePanchanga}
              orgProfile={orgProfile}
              astrologer={astrologer}
            />
          )}

          {/* =========================================================================
              REPORT RENDERER 1: KUNDALI REPORT (3 PAGES)
             ========================================================================= */}
          {reportType === 'kundali' && (
            <>
              {/* PAGE 1: PRIMARY KUNDALI, BIRTH BIO & CHARTS */}
              {(viewMode === 'all_pages' || activePageNum === 1) && (
                <PrintablePage
                  pageNumber={1}
                  totalPages={3}
                  orgProfile={orgProfile}
                  showBorderFrame={showVedicBorder}
                  watermarkText={showWatermark ? 'ॐ' : undefined}
                  className={themeContainerClass}
                >
                  {/* Top Vedic Invocations & Organization Letterhead */}
                  {showOrgHeader && (
                    <div className="border-b-2 border-red-800/60 pb-2 mb-3 text-center">
                      <div className="text-[10px] font-bold tracking-widest text-red-700 uppercase flex items-center justify-center gap-2">
                        <span>卐</span>
                        <span>॥ श्री गणेशाय नमः ॥</span>
                        <span>卐</span>
                      </div>
                      <h1 className={`text-lg font-black font-serif ${themePrimaryText}`}>
                        {orgProfile?.name || 'श्री वैदिक ज्योतिष तथा पञ्चाङ्ग अनुसन्धान केन्द्र'}
                      </h1>
                      <p className="text-[10px] text-stone-600 font-medium">
                        {orgProfile?.address || 'काठमाडौँ, नेपाल'} | फोन: {orgProfile?.phone || '९८००००००००'} | इमेल: {orgProfile?.email || 'vedicjyotish@gmail.com'}
                      </p>
                    </div>
                  )}

                  {/* Document Title Banner */}
                  <div className={`py-1 px-4 text-center rounded-lg mb-3 border ${themeHeaderBg} shadow-2xs`}>
                    <h2 className="text-sm font-black tracking-wider uppercase font-serif">
                      ॥ वैदिक जन्मकुण्डली तथा ग्रहचक्र प्रतिवेदन ॥
                    </h2>
                  </div>

                  {/* 2-Column Top Cards: Jatak Bio Card + Birth Panchanga */}
                  <div className="grid grid-cols-2 gap-3 mb-3 text-[10px]">
                    {/* Left Card: Birth Details */}
                    <div className="bg-amber-50/50 border border-stone-400 p-2.5 rounded-lg space-y-1">
                      <div className="font-bold text-red-900 border-b border-stone-300 pb-0.5 flex justify-between">
                        <span>जातक परिचय तथा जन्म विवरण</span>
                        <span className="text-stone-500">ID: {effectiveProfile.customerId || 'JATAK-०१'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-0.5">
                        <div><span className="text-stone-500">नाम:</span> <strong className="text-stone-900">{effectiveProfile.name}</strong></div>
                        <div><span className="text-stone-500">लिङ्ग:</span> <strong>{effectiveProfile.gender === 'male' ? 'पुरुष' : 'महिला'}</strong></div>
                        <div><span className="text-stone-500">जन्म मिति (वि.सं.):</span> <strong>{toDevanagariNumerals(effectiveProfile.dateBS || '—')}</strong></div>
                        <div><span className="text-stone-500">जन्म मिति (ई.सं.):</span> <strong>{effectiveProfile.dateAD}</strong></div>
                        <div><span className="text-stone-500">जन्म समय:</span> <strong>{toDevanagariNumerals(effectiveProfile.time || '—')} बजे</strong></div>
                        <div><span className="text-stone-500">जन्म स्थान:</span> <strong>{effectiveProfile.location.name}</strong></div>
                        <div><span className="text-stone-500">अक्षांश/देशान्तर:</span> <strong>{toDevanagariNumerals(effectiveProfile.location.latitude.toFixed(2))}° N / {toDevanagariNumerals(effectiveProfile.location.longitude.toFixed(2))}° E</strong></div>
                        <div><span className="text-stone-500">जन्म लग्न:</span> <strong className="text-red-800">{effectiveLagna.rashiName} ({toDevanagariNumerals(effectiveLagna.rashiId)})</strong></div>
                      </div>
                    </div>

                    {/* Right Card: Birth Panchanga */}
                    <div className="bg-amber-50/50 border border-stone-400 p-2.5 rounded-lg space-y-1">
                      <div className="font-bold text-red-900 border-b border-stone-300 pb-0.5 flex justify-between">
                        <span>जन्मकालीन पञ्चाङ्ग विवरण</span>
                        <span className="text-stone-500">{activePanchanga.dateBS}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-0.5">
                        <div><span className="text-stone-500">वार:</span> <strong>{activePanchanga.dayNameNepali}</strong></div>
                        <div><span className="text-stone-500">पक्ष / तिथि:</span> <strong>{activePanchanga.tithi.paksha} - {activePanchanga.tithi.name}</strong></div>
                        <div><span className="text-stone-500">जन्मनक्षत्र:</span> <strong className="text-red-800">{activePanchanga.nakshatra.name} (पाद {toDevanagariNumerals(activePanchanga.nakshatra.pada)})</strong></div>
                        <div><span className="text-stone-500">योग:</span> <strong>{activePanchanga.yoga.name}</strong></div>
                        <div><span className="text-stone-500">करण:</span> <strong>{activePanchanga.karana.name}</strong></div>
                        <div><span className="text-stone-500">सूर्य / चन्द्र राशि:</span> <strong>{activePanchanga.sunRashi} / {activePanchanga.moonRashi}</strong></div>
                        <div><span className="text-stone-500">सूर्योदय / सूर्यास्त:</span> <strong>{toDevanagariNumerals(activePanchanga.sunrise)} / {toDevanagariNumerals(activePanchanga.sunset)}</strong></div>
                        <div><span className="text-stone-500">संवत्सर:</span> <strong>वि.सं. {toDevanagariNumerals(activePanchanga.vikramSamvat)} / शक {toDevanagariNumerals(activePanchanga.sakaSamvat)}</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Center Stage: D-1 लग्न कुण्डली & D-9 नवांश कुण्डली (Side-by-Side) */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {chartStyle === 'North Indian' ? (
                      <>
                        <PrintNorthIndianChart
                          title="जन्म लग्न कुण्डली (D-1)"
                          houses={d1Chart.houses}
                          theme={colorTheme}
                        />
                        <PrintNorthIndianChart
                          title="नवांश कुण्डली (D-9 भाग्य/विवाह)"
                          houses={d9Chart.houses}
                          theme={colorTheme}
                        />
                      </>
                    ) : chartStyle === 'East Indian' ? (
                      <>
                        <PrintEastIndianChart
                          title="जन्म लग्न कुण्डली (D-1)"
                          lagnaRashiId={effectiveLagna.rashiId}
                          planets={effectivePlanets}
                          theme={colorTheme}
                        />
                        <PrintEastIndianChart
                          title="नवांश कुण्डली (D-9)"
                          lagnaRashiId={d9Chart.houses[0]?.rashiId || 1}
                          planets={effectivePlanets}
                          theme={colorTheme}
                        />
                      </>
                    ) : (
                      <>
                        <PrintSouthIndianChart
                          title="जन्म लग्न कुण्डली (D-1)"
                          lagnaRashiId={effectiveLagna.rashiId}
                          planets={effectivePlanets}
                          theme={colorTheme}
                        />
                        <PrintSouthIndianChart
                          title="नवांश कुण्डली (D-9)"
                          lagnaRashiId={d9Chart.houses[0]?.rashiId || 1}
                          planets={effectivePlanets}
                          theme={colorTheme}
                        />
                      </>
                    )}
                  </div>

                  {/* Compact Note Bottom */}
                  <div className="text-[9px] text-center text-stone-600 bg-stone-100 p-1.5 rounded border border-stone-300">
                    <strong>संकेत:</strong> ल = लग्न | सू = सूर्य | च = चन्द्र | मं = मंगल | बु = बुध | बृ = गुरु | शु = शुक्र | श = शनि | रा = राहु | के = केतु | (व) = वक्र गति
                  </div>
                </PrintablePage>
              )}

              {/* PAGE 2: PLANETARY POSITIONS, 12 BHAVA EXPANSION & DRISHTI MATRIX */}
              {(viewMode === 'all_pages' || activePageNum === 2) && (
                <PrintablePage
                  pageNumber={2}
                  totalPages={3}
                  orgProfile={orgProfile}
                  showBorderFrame={showVedicBorder}
                  watermarkText={showWatermark ? 'ॐ' : undefined}
                  className={themeContainerClass}
                >
                  <div className={`py-1 px-4 text-center rounded-lg mb-3 border ${themeHeaderBg}`}>
                    <h2 className="text-sm font-black tracking-wider uppercase font-serif">
                      ॥ स्पष्ट ग्रह स्थिति, १२ भाव विवरण तथा दृष्टि विश्लेषण ॥
                    </h2>
                  </div>

                  {/* 1. Complete Nirayana Planetary Positions Table */}
                  <PrintKeepTogether className="mb-4">
                    <div className="text-[11px] font-bold text-red-900 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>१. स्पष्ट निरयन ग्रह स्थिति तालिका (Nirayana Planetary Positions)</span>
                    </div>
                    <PrintTableContainer>
                      <table className="w-full text-left text-[9.5px] border-collapse">
                        <thead>
                          <tr className="bg-stone-200 text-stone-900 border-b border-stone-400 font-bold">
                            <th className="p-1.5 border border-stone-300">ग्रह</th>
                            <th className="p-1.5 border border-stone-300">राशि</th>
                            <th className="p-1.5 border border-stone-300">अंश–कला–विकला</th>
                            <th className="p-1.5 border border-stone-300">नक्षत्र (पाद)</th>
                            <th className="p-1.5 border border-stone-300">भाव</th>
                            <th className="p-1.5 border border-stone-300">गति / अवस्था</th>
                            <th className="p-1.5 border border-stone-300">कारकत्व</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Lagna Row */}
                          <tr className="bg-amber-50 font-bold border-b border-stone-300">
                            <td className="p-1 border border-stone-300 text-red-800">लग्न (Ascendant)</td>
                            <td className="p-1 border border-stone-300">{effectiveLagna.rashiName} ({toDevanagariNumerals(effectiveLagna.rashiId)})</td>
                            <td className="p-1 border border-stone-300 font-mono">{effectiveLagna.formattedDegree}</td>
                            <td className="p-1 border border-stone-300">{effectiveLagna.nakshatraName} ({toDevanagariNumerals(effectiveLagna.pada)})</td>
                            <td className="p-1 border border-stone-300">प्रथम (१)</td>
                            <td className="p-1 border border-stone-300">लग्न बिन्दु</td>
                            <td className="p-1 border border-stone-300">तनु कारक</td>
                          </tr>
                          {/* Planets Rows */}
                          {effectivePlanets.map((p, idx) => {
                            const degFormatted = formatPlanetDegreesMinutes(p);
                            const stateDesc = getPlanetStateDescriptionNepali(p);
                            const houseNum = ((p.rashiId - effectiveLagna.rashiId + 12) % 12) + 1;

                            return (
                              <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/70'}>
                                <td className="p-1 border border-stone-300 font-bold text-stone-900">{p.name}</td>
                                <td className="p-1 border border-stone-300">{p.rashiName} ({toDevanagariNumerals(p.rashiId)})</td>
                                <td className="p-1 border border-stone-300 font-mono">{degFormatted}</td>
                                <td className="p-1 border border-stone-300">{p.nakshatraName} ({toDevanagariNumerals(p.pada)})</td>
                                <td className="p-1 border border-stone-300 font-bold">{toDevanagariNumerals(houseNum)} भाव</td>
                                <td className="p-1 border border-stone-300">{stateDesc} {p.isRetrograde ? '(वक्र)' : ''}</td>
                                <td className="p-1 border border-stone-300 text-stone-600">{p.name === 'सूर्य' ? 'आत्मकारक' : p.name === 'चन्द्र' ? 'मनकारक' : p.name === 'गुरु' ? 'जीवकारक' : 'ग्रहकारक'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </PrintTableContainer>
                  </PrintKeepTogether>

                  {/* 2. 12 Bhava (House) Distribution & Lordship Table */}
                  <PrintKeepTogether className="mb-4">
                    <div className="text-[11px] font-bold text-red-900 mb-1 flex items-center gap-1.5">
                      <Layout className="w-3 h-3 text-amber-600" />
                      <span>२. द्वादश भाव (१२ भाव) फल तथा भावेश विवरण</span>
                    </div>
                    <PrintTableContainer>
                      <table className="w-full text-left text-[9px] border-collapse">
                        <thead>
                          <tr className="bg-stone-200 text-stone-900 border-b border-stone-400 font-bold">
                            <th className="p-1 border border-stone-300">भाव</th>
                            <th className="p-1 border border-stone-300">राशि</th>
                            <th className="p-1 border border-stone-300">भावेश (Lord)</th>
                            <th className="p-1 border border-stone-300">स्थित ग्रह</th>
                            <th className="p-1 border border-stone-300">मुख्य विचारणीय विषय</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bhavaSystem.bhavas.slice(0, 12).map((bh) => {
                            const planetNames = bh.planetsChalit.map((p) => p.name).join(', ') || '—';

                            return (
                              <tr key={bh.houseNumber} className={bh.houseNumber % 2 === 0 ? 'bg-white' : 'bg-stone-50/80'}>
                                <td className="p-1 border border-stone-300 font-bold">{toDevanagariNumerals(bh.houseNumber)} भाव</td>
                                <td className="p-1 border border-stone-300">{bh.rashiName} ({toDevanagariNumerals(bh.rashiId)})</td>
                                <td className="p-1 border border-stone-300 font-bold text-red-800">{bh.lord}</td>
                                <td className="p-1 border border-stone-300 font-bold text-stone-900">{planetNames}</td>
                                <td className="p-1 border border-stone-300 text-stone-600">{bh.domainNepali}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </PrintTableContainer>
                  </PrintKeepTogether>

                  {/* 3. Graha Drishti Matrix Summary */}
                  <div className="bg-amber-50/60 p-2.5 rounded-lg border border-stone-400 text-[9.5px] space-y-1">
                    <div className="font-bold text-red-900 border-b border-stone-300 pb-0.5">
                      ३. मुख्य ग्रह दृष्टि तथा युति सारांश (Planetary Aspects)
                    </div>
                    <p className="text-stone-700 leading-relaxed">
                      • <strong>विशेष दृष्टिसम्पन्न ग्रह:</strong> मंगल (४, ७, ८औँ भाव), गुरु/राहु/केतु (५, ७, ९औँ भाव), शनि (३, ७, १०औँ भाव)। बाँकी सबै ग्रहहरूको सातौँ (७) भावमा पूर्ण दृष्टि रहने गर्दछ।
                    </p>
                    <p className="text-stone-700 leading-relaxed">
                      • <strong>केन्द्र तथा त्रिकोण बल:</strong> १, ४, ७, १० भाव केन्द्रस्थान (विष्णुस्थान) र १, ५, ९ भाव त्रिकोणस्थान (लक्ष्मीस्थान) मानिन्छन्। यी स्थानमा शुभ ग्रहको स्थिति तथा दृष्टिले जीवनमा उच्च सफलता प्रदान गर्दछ।
                    </p>
                  </div>
                </PrintablePage>
              )}

              {/* PAGE 3: VIMSHOTTARI DASHA, YOGAS, REMEDIES & ASTROLOGER SIGNATURE */}
              {(viewMode === 'all_pages' || activePageNum === 3) && (
                <PrintablePage
                  pageNumber={3}
                  totalPages={3}
                  orgProfile={orgProfile}
                  showBorderFrame={showVedicBorder}
                  watermarkText={showWatermark ? 'ॐ' : undefined}
                  className={themeContainerClass}
                >
                  <div className={`py-1 px-4 text-center rounded-lg mb-3 border ${themeHeaderBg}`}>
                    <h2 className="text-sm font-black tracking-wider uppercase font-serif">
                      ॥ विंशोत्तरी महादशा, मुख्य योग, फलादेश तथा वैदिक शान्ति उपाय ॥
                    </h2>
                  </div>

                  {/* 1. Vimshottari Mahadasha Table */}
                  <PrintKeepTogether className="mb-3">
                    <div className="text-[11px] font-bold text-red-900 mb-1 flex items-center gap-1.5">
                      <Sun className="w-3 h-3 text-amber-600" />
                      <span>१. विंशोत्तरी महादशा चक्र (Vimshottari Dasha Periods)</span>
                    </div>
                    <PrintTableContainer>
                      <table className="w-full text-left text-[9px] border-collapse">
                        <thead>
                          <tr className="bg-stone-200 text-stone-900 border-b border-stone-400 font-bold">
                            <th className="p-1 border border-stone-300">दशा स्वामी</th>
                            <th className="p-1 border border-stone-300">अवधि (वर्ष)</th>
                            <th className="p-1 border border-stone-300">सुरु मिति</th>
                            <th className="p-1 border border-stone-300">समाप्त मिति</th>
                            <th className="p-1 border border-stone-300">वर्तमान अवस्था</th>
                          </tr>
                        </thead>
                        <tbody>
                          {effectiveDasha?.mahadashas && effectiveDasha.mahadashas.length > 0 ? (
                            effectiveDasha.mahadashas.map((d, idx) => (
                              <tr key={idx} className={d.isCurrent ? 'bg-amber-100 font-bold' : idx % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                                <td className="p-1 border border-stone-300 text-stone-900 font-bold">{d.planet} महादशा</td>
                                <td className="p-1 border border-stone-300 font-mono">{toDevanagariNumerals(d.durationYears)} वर्ष</td>
                                <td className="p-1 border border-stone-300 font-mono">{toDevanagariNumerals(d.startDate)}</td>
                                <td className="p-1 border border-stone-300 font-mono">{toDevanagariNumerals(d.endDate)}</td>
                                <td className="p-1 border border-stone-300 text-center">
                                  {d.isCurrent ? <span className="text-emerald-800 font-extrabold px-1.5 py-0.5 bg-emerald-100 rounded text-[8px]">चालु महादशा ✓</span> : <span className="text-stone-400 text-[8px]">सामान्य</span>}
                                </td>
                              </tr>
                            ))
                          ) : (
                            [
                              { planet: 'सूर्य', years: 6, start: '२०५५/०४/१२', end: '२०६१/०४/१२', current: false },
                              { planet: 'चन्द्र', years: 10, start: '२०६१/०४/१२', end: '२०७१/०४/१२', current: false },
                              { planet: 'मंगल', years: 7, start: '२०७१/०४/१२', end: '२०७८/०४/१२', current: false },
                              { planet: 'राहु', years: 18, start: '२०७८/०४/१२', end: '२०९६/०४/१२', current: true },
                              { planet: 'गुरु', years: 16, start: '२०९६/०४/१२', end: '२११२/०४/१२', current: false },
                            ].map((d, idx) => (
                              <tr key={idx} className={d.current ? 'bg-amber-100 font-bold' : idx % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                                <td className="p-1 border border-stone-300">{d.planet} महादशा</td>
                                <td className="p-1 border border-stone-300 font-mono">{toDevanagariNumerals(d.years)} वर्ष</td>
                                <td className="p-1 border border-stone-300 font-mono">{toDevanagariNumerals(d.start)}</td>
                                <td className="p-1 border border-stone-300 font-mono">{toDevanagariNumerals(d.end)}</td>
                                <td className="p-1 border border-stone-300 text-center">
                                  {d.current ? <span className="text-emerald-800 font-bold">चालु महादशा ✓</span> : '—'}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </PrintTableContainer>
                  </PrintKeepTogether>

                  {/* 2. Planetary Yogas and Auspicious Combinations */}
                  <div className="bg-amber-50/50 p-2.5 rounded-lg border border-stone-400 mb-3 text-[9.5px] space-y-1">
                    <div className="font-bold text-red-900 border-b border-stone-300 pb-0.5">
                      २. कुण्डलीमा विद्यमान प्रमुख शुभ/अशुभ योगहरू
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-stone-800 pt-1">
                      <li><strong>गजकेसरी योग:</strong> गुरु र चन्द्रमा केन्द्रस्थानमा युति वा दृष्टि सम्बन्धमा रहँदा जातक विद्वान्, यशस्वी र दीर्घायु हुनेछ।</li>
                      <li><strong>बुधादित्य योग:</strong> सूर्य र बुधको शुभ युतिले तीव्र बुद्धि, वाकपटुता र प्रशासनिक क्षमता प्रदान गर्दछ।</li>
                      <li><strong>धन योग:</strong> द्वितीयेश र एकादशेशको केन्द्र-त्रिकोण सम्बन्धले आर्थिक उन्नति र सम्पन्नता सुनिश्चित गर्दछ।</li>
                    </ul>
                  </div>

                  {/* 3. Vedic Remedies & Recommendations */}
                  <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-400 mb-4 text-[9.5px] space-y-1">
                    <div className="font-bold text-red-900 border-b border-stone-300 pb-0.5">
                      ३. शास्त्रीय फलादेश तथा वैदिक शान्ति उपाय (Vedic Remedies)
                    </div>
                    <p className="text-stone-700 leading-relaxed">
                      • <strong>इष्टदेव आराधना:</strong> नित्य कुलदेवता तथा भगवान् शिवको उपासना गर्नाले स्वास्थ्य र मानसिक शान्ति प्राप्त हुनेछ।
                    </p>
                    <p className="text-stone-700 leading-relaxed">
                      • <strong>ग्रहशान्ति तथा मन्त्र जप:</strong> चालु दशा स्वामीको वैदिक मन्त्र नित्य १०८ पटक जप गर्नाले अनिष्ट फल निवारण भई कार्यसिद्धि मिल्नेछ।
                    </p>
                    <p className="text-stone-700 leading-relaxed">
                      • <strong>रत्न परामर्श:</strong> कुण्डलीको अनुकूलता अनुसार प्रमाणित ज्योतिषीको प्रत्यक्ष सल्लाहमा मात्र रत्न धारण गर्नु उपयुक्त हुनेछ।
                    </p>
                  </div>

                  {/* 4. Astrologer Signature Box */}
                  {showSignatoryBox && (
                    <div className="pt-3 border-t-2 border-stone-400 flex justify-between items-end text-[10px]">
                      <div className="space-y-0.5 text-stone-600">
                        <div>गणना पद्धति: <strong>चित्रपक्षीय (लाहिरी) अयनांश</strong></div>
                        <div>पञ्चाङ्ग आधार: <strong>सूर्यसिद्धान्त / दृकसिद्धान्त समन्वय</strong></div>
                        <div>मुद्रण मिति: <strong>{activePanchanga.dateBS}</strong></div>
                      </div>

                      <div className="text-center">
                        <div className="w-36 border-b border-stone-600 mb-1 h-8 flex items-end justify-center pb-1">
                          <span className="font-serif italic text-stone-500 text-[9px]">हस्ताक्षर / मुद्रिका</span>
                        </div>
                        <div className="font-bold text-stone-900">{astrologer?.name || 'श्री ज्योतिषी पण्डित'}</div>
                        <div className="text-[9px] text-stone-600">{astrologer?.title || 'वरिष्ठ वैदिक ज्योतिष अनुसन्धानकर्ता'}</div>
                      </div>
                    </div>
                  )}
                </PrintablePage>
              )}
            </>
          )}

          {/* =========================================================================
              REPORT RENDERER 2: BALANANDA DAILY PANCHANGA (1 PAGE A4 LETTERHEAD)
             ========================================================================= */}
          {reportType === 'panchanga' && (
            <div className="flex justify-center my-2">
              <BalanandaDailyPanchangaDocument
                panchanga={activePanchanga}
                orgProfile={orgProfile}
                todayBS={effectiveProfile.dateBS ? effectiveProfile.dateBS : `${toDevanagariNumerals(activeBS.year)}/${toDevanagariNumerals(activeBS.month)}/${toDevanagariNumerals(activeBS.day)}`}
                todayAD={selectedDateAD || activePanchanga.dateAD}
                locationName={effectiveProfile.location?.name || 'काठमाडौँ, नेपाल'}
                astrologerName={astrologer?.name || 'ज्योतिषाचार्य सुकदेव शर्मा'}
              />
            </div>
          )}

          {/* =========================================================================
              REPORT RENDERER 3: COMBINED KUNDALI & PANCHANGA REPORT (5 PAGES)
             ========================================================================= */}
          {reportType === 'combined' && (
            <>
              {/* PAGE 1: KUNDALI P1 */}
              {(viewMode === 'all_pages' || activePageNum === 1) && (
                <PrintablePage
                  pageNumber={1}
                  totalPages={5}
                  orgProfile={orgProfile}
                  showBorderFrame={showVedicBorder}
                  watermarkText={showWatermark ? 'ॐ' : undefined}
                  className={themeContainerClass}
                >
                  {showOrgHeader && (
                    <div className="border-b-2 border-red-800/60 pb-2 mb-3 text-center">
                      <div className="text-[10px] font-bold tracking-widest text-red-700 uppercase flex items-center justify-center gap-2">
                        <span>卐</span>
                        <span>॥ श्री गणेशाय नमः ॥</span>
                        <span>卐</span>
                      </div>
                      <h1 className={`text-lg font-black font-serif ${themePrimaryText}`}>
                        {orgProfile?.name || 'श्री वैदिक ज्योतिष तथा पञ्चाङ्ग अनुसन्धान केन्द्र'}
                      </h1>
                    </div>
                  )}
                  <div className={`py-1 px-4 text-center rounded-lg mb-3 border ${themeHeaderBg}`}>
                    <h2 className="text-sm font-black tracking-wider uppercase font-serif">
                      ॥ संयुक्त वैदिक जन्मकुण्डली तथा पञ्चाङ्ग महाप्रतिवेदन ॥
                    </h2>
                  </div>
                  {/* Birth Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-3 text-[10px]">
                    <div className="bg-amber-50/50 border border-stone-400 p-2 rounded-lg">
                      <strong className="text-red-900 block border-b border-stone-300 pb-0.5 mb-1">जातक परिचय</strong>
                      <div>नाम: <strong>{effectiveProfile.name}</strong></div>
                      <div>जन्म मिति: <strong>{toDevanagariNumerals(effectiveProfile.dateBS || '')}</strong></div>
                      <div>समय: <strong>{toDevanagariNumerals(effectiveProfile.time || '')} बजे</strong></div>
                      <div>स्थान: <strong>{effectiveProfile.location.name}</strong></div>
                    </div>
                    <div className="bg-amber-50/50 border border-stone-400 p-2 rounded-lg">
                      <strong className="text-red-900 block border-b border-stone-300 pb-0.5 mb-1">जन्मकालीन पञ्चाङ्ग</strong>
                      <div>वार: <strong>{activePanchanga.dayNameNepali}</strong></div>
                      <div>तिथि: <strong>{activePanchanga.tithi.name}</strong></div>
                      <div>नक्षत्र: <strong>{activePanchanga.nakshatra.name} (पाद {toDevanagariNumerals(activePanchanga.nakshatra.pada)})</strong></div>
                      <div>लग्न: <strong>{effectiveLagna.rashiName} ({toDevanagariNumerals(effectiveLagna.rashiId)})</strong></div>
                    </div>
                  </div>
                  {/* Charts */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <PrintNorthIndianChart title="जन्म लग्न कुण्डली (D-1)" houses={d1Chart.houses} theme={colorTheme} />
                    <PrintNorthIndianChart title="नवांश कुण्डली (D-9)" houses={d9Chart.houses} theme={colorTheme} />
                  </div>
                </PrintablePage>
              )}

              {/* PAGE 2: KUNDALI P2 */}
              {(viewMode === 'all_pages' || activePageNum === 2) && (
                <PrintablePage
                  pageNumber={2}
                  totalPages={5}
                  orgProfile={orgProfile}
                  showBorderFrame={showVedicBorder}
                  watermarkText={showWatermark ? 'ॐ' : undefined}
                  className={themeContainerClass}
                >
                  <div className={`py-1 px-4 text-center rounded-lg mb-3 border ${themeHeaderBg}`}>
                    <h2 className="text-sm font-black tracking-wider uppercase font-serif">
                      ॥ स्पष्ट ग्रह स्थिति तथा द्वादश भाव चक्र ॥
                    </h2>
                  </div>
                  <PrintKeepTogether className="mb-4">
                    <table className="w-full text-left text-[9.5px] border-collapse">
                      <thead>
                        <tr className="bg-stone-200 text-stone-900 border-b border-stone-400 font-bold">
                          <th className="p-1 border border-stone-300">ग्रह</th>
                          <th className="p-1 border border-stone-300">राशि</th>
                          <th className="p-1 border border-stone-300">अंश–कला</th>
                          <th className="p-1 border border-stone-300">नक्षत्र (पाद)</th>
                          <th className="p-1 border border-stone-300">भाव</th>
                          <th className="p-1 border border-stone-300">गति / अवस्था</th>
                        </tr>
                      </thead>
                      <tbody>
                        {effectivePlanets.map((p, idx) => (
                          <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                            <td className="p-1 border border-stone-300 font-bold">{p.name}</td>
                            <td className="p-1 border border-stone-300">{p.rashiName}</td>
                            <td className="p-1 border border-stone-300 font-mono">{formatPlanetDegreesMinutes(p)}</td>
                            <td className="p-1 border border-stone-300">{p.nakshatraName} ({toDevanagariNumerals(p.pada)})</td>
                            <td className="p-1 border border-stone-300 font-bold">{toDevanagariNumerals(((p.rashiId - effectiveLagna.rashiId + 12) % 12) + 1)} भाव</td>
                            <td className="p-1 border border-stone-300">{getPlanetStateDescriptionNepali(p)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </PrintKeepTogether>
                </PrintablePage>
              )}

              {/* PAGE 3: KUNDALI P3 */}
              {(viewMode === 'all_pages' || activePageNum === 3) && (
                <PrintablePage
                  pageNumber={3}
                  totalPages={5}
                  orgProfile={orgProfile}
                  showBorderFrame={showVedicBorder}
                  watermarkText={showWatermark ? 'ॐ' : undefined}
                  className={themeContainerClass}
                >
                  <div className={`py-1 px-4 text-center rounded-lg mb-3 border ${themeHeaderBg}`}>
                    <h2 className="text-sm font-black tracking-wider uppercase font-serif">
                      ॥ विंशोत्तरी महादशा तथा शान्ति उपाय ॥
                    </h2>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg border border-stone-400 text-xs mb-3">
                    <strong>चालु विंशोत्तरी महादशा:</strong> सूर्य महादशा (२०७८ देखि २०८४ सम्म)
                  </div>
                  {showSignatoryBox && (
                    <div className="mt-8 pt-4 border-t-2 border-stone-400 flex justify-between items-end text-xs">
                      <div>गणना: निरयण लाहिरी अयनांश</div>
                      <div className="text-right">
                        <div className="border-b border-stone-600 w-32 ml-auto pb-6"></div>
                        <div className="font-bold">{astrologer?.name || 'प्रमाणित ज्योतिषी'}</div>
                      </div>
                    </div>
                  )}
                </PrintablePage>
              )}

              {/* PAGE 4: PANCHANGA P1 */}
              {(viewMode === 'all_pages' || activePageNum === 4) && (
                <PrintablePage
                  pageNumber={4}
                  totalPages={5}
                  orgProfile={orgProfile}
                  showBorderFrame={showVedicBorder}
                  watermarkText={showWatermark ? '卐' : undefined}
                  className={themeContainerClass}
                >
                  <div className={`py-1.5 px-4 text-center rounded-lg mb-3 border ${themeHeaderBg}`}>
                    <h2 className="text-sm font-black tracking-wider uppercase font-serif">
                      ॥ दैनिक पञ्चाङ्ग तथा मुहूर्त चक्र ॥
                    </h2>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mb-3 text-[10px]">
                    <div className="bg-amber-50 border border-stone-300 p-2 text-center rounded"><strong>तिथि:</strong> {activePanchanga.tithi.name}</div>
                    <div className="bg-amber-50 border border-stone-300 p-2 text-center rounded"><strong>वार:</strong> {activePanchanga.dayNameNepali}</div>
                    <div className="bg-amber-50 border border-stone-300 p-2 text-center rounded"><strong>नक्षत्र:</strong> {activePanchanga.nakshatra.name}</div>
                    <div className="bg-amber-50 border border-stone-300 p-2 text-center rounded"><strong>योग:</strong> {activePanchanga.yoga.name}</div>
                    <div className="bg-amber-50 border border-stone-300 p-2 text-center rounded"><strong>करण:</strong> {activePanchanga.karana.name}</div>
                  </div>
                </PrintablePage>
              )}

              {/* PAGE 5: PANCHANGA P2 */}
              {(viewMode === 'all_pages' || activePageNum === 5) && (
                <PrintablePage
                  pageNumber={5}
                  totalPages={5}
                  orgProfile={orgProfile}
                  showBorderFrame={showVedicBorder}
                  watermarkText={showWatermark ? '卐' : undefined}
                  className={themeContainerClass}
                >
                  <div className={`py-1.5 px-4 text-center rounded-lg mb-3 border ${themeHeaderBg}`}>
                    <h2 className="text-sm font-black tracking-wider uppercase font-serif">
                      ॥ मासिक पञ्चाङ्ग तालिका (वि.सं. {toDevanagariNumerals(activeBS.year)}) ॥
                    </h2>
                  </div>
                  <div className="text-xs text-stone-600 text-center py-4">
                    मासिक शुभ लग्न तथा मुहूर्त तालिका
                  </div>
                </PrintablePage>
              )}
            </>
          )}

          {/* =========================================================================
              REPORT RENDERER 4: 1-PAGE SUMMARY TIPAN (संक्षिप्त टिपन)
             ========================================================================= */}
          {reportType === 'tipan' && (
            <PrintablePage
              pageNumber={1}
              totalPages={1}
              orgProfile={orgProfile}
              showBorderFrame={showVedicBorder}
              watermarkText={showWatermark ? 'ॐ' : undefined}
              className={themeContainerClass}
            >
              {/* Top Banner */}
              <div className="text-center border-b-2 border-red-800 pb-2 mb-2">
                <div className="text-[9px] font-bold text-red-700">卐 ॥ श्री गणेशाय नमः ॥ 卐</div>
                <h1 className="text-base font-black text-red-900 font-serif">
                  {orgProfile?.name || 'श्री वैदिक ज्योतिष परामर्श सेवा'}
                </h1>
                <div className="text-xs font-bold text-amber-900">॥ परम्परागत नेपाली जन्म टिपन पत्र ॥</div>
              </div>

              {/* Bio & Panchanga Strip */}
              <div className="grid grid-cols-2 gap-2 text-[9.5px] bg-amber-50 p-2 rounded border border-stone-300 mb-2">
                <div><strong>नाम:</strong> {effectiveProfile.name}</div>
                <div><strong>जन्म मिति:</strong> वि.सं. {toDevanagariNumerals(effectiveProfile.dateBS || '')}</div>
                <div><strong>समय:</strong> {toDevanagariNumerals(effectiveProfile.time || '')} बजे</div>
                <div><strong>स्थान:</strong> {effectiveProfile.location.name}</div>
                <div><strong>जन्मनक्षत्र:</strong> {activePanchanga.nakshatra.name} ({toDevanagariNumerals(activePanchanga.nakshatra.pada)} पाद)</div>
                <div><strong>लग्न:</strong> {effectiveLagna.rashiName} ({toDevanagariNumerals(effectiveLagna.rashiId)})</div>
              </div>

              {/* Charts Side-by-Side */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <PrintNorthIndianChart title="लग्न कुण्डली (D-1)" houses={d1Chart.houses} theme={colorTheme} />
                <PrintNorthIndianChart title="नवांश कुण्डली (D-9)" houses={d9Chart.houses} theme={colorTheme} />
              </div>

              {/* Compact Graha Table */}
              <div className="mb-2">
                <table className="w-full text-left text-[8.5px] border-collapse">
                  <thead>
                    <tr className="bg-stone-200 font-bold">
                      <th className="p-0.5 border border-stone-400">ग्रह</th>
                      <th className="p-0.5 border border-stone-400">राशि</th>
                      <th className="p-0.5 border border-stone-400">अंश–कला</th>
                      <th className="p-0.5 border border-stone-400">नक्षत्र</th>
                      <th className="p-0.5 border border-stone-400">भाव</th>
                    </tr>
                  </thead>
                  <tbody>
                    {effectivePlanets.map((p) => (
                      <tr key={p.id} className="border-b border-stone-300">
                        <td className="p-0.5 border border-stone-300 font-bold">{p.name}</td>
                        <td className="p-0.5 border border-stone-300">{p.rashiName}</td>
                        <td className="p-0.5 border border-stone-300 font-mono">{formatPlanetDegreesMinutes(p)}</td>
                        <td className="p-0.5 border border-stone-300">{p.nakshatraName}</td>
                        <td className="p-0.5 border border-stone-300">{toDevanagariNumerals(((p.rashiId - effectiveLagna.rashiId + 12) % 12) + 1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Stamp */}
              <div className="pt-2 border-t border-stone-400 flex justify-between items-center text-[9px]">
                <div>प्रमाणित जन्म टिपन पत्र</div>
                <div className="font-bold">{astrologer?.name || 'ज्योतिषविद्'}</div>
              </div>
            </PrintablePage>
          )}
        </div>
      </main>
    </div>
  );
};

export default PrintPreviewModal;
