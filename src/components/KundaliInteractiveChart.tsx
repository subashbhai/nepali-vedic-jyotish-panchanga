import React, { useState } from 'react';
import {
  Sparkles,
  Info,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import {
  PlanetPosition,
  RashiName,
  PlanetName
} from '../types/astrology';
import {
  NORTH_INDIAN_HOUSE_GEO,
  calculateSinglePlanetAspects,
  calculateAspectArrowPath,
  formatPlanetDegreesMinutes,
  getPlanetStatusSuffix,
  getPlanetStateDescriptionNepali,
  generateChartAspectReport,
  CalculatedAspectItem,
  AspectReportRow
} from '../utils/aspectEngine';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { HouseDetailModal } from './HouseDetailModal';

// 12 Rashis in Devanagari
const RASHI_NAMES_MAP: Record<number, string> = {
  1: 'मेष',
  2: 'वृष',
  3: 'मिथुन',
  4: 'कर्कट',
  5: 'सिंह',
  6: 'कन्या',
  7: 'तुला',
  8: 'वृश्चिक',
  9: 'धनु',
  10: 'मकर',
  11: 'कुम्भ',
  12: 'मीन',
};

// South Indian 4x4 Perimeter Fixed Grid (Clockwise)
const SOUTH_INDIAN_CELLS = [
  { rashiId: 12, row: 0, col: 0, name: 'मीन' },
  { rashiId: 1,  row: 0, col: 1, name: 'मेष' },
  { rashiId: 2,  row: 0, col: 2, name: 'वृष' },
  { rashiId: 3,  row: 0, col: 3, name: 'मिथुन' },
  { rashiId: 4,  row: 1, col: 3, name: 'कर्कट' },
  { rashiId: 5,  row: 2, col: 3, name: 'सिंह' },
  { rashiId: 6,  row: 3, col: 3, name: 'कन्या' },
  { rashiId: 7,  row: 3, col: 2, name: 'तुला' },
  { rashiId: 8,  row: 3, col: 1, name: 'वृश्चिक' },
  { rashiId: 9,  row: 3, col: 0, name: 'धनु' },
  { rashiId: 10, row: 2, col: 0, name: 'मकर' },
  { rashiId: 11, row: 1, col: 0, name: 'कुम्भ' },
];

// East Indian Fixed Rashis in Counter-Clockwise Order (Aries at Top Diamond)
const EAST_INDIAN_POS_GEO: Record<number, { pos: number; rashiId: number; name: string; polygonPoints: string; center: { x: number; y: number } }> = {
  1: { pos: 1, rashiId: 1, name: 'मेष', polygonPoints: '200,10 295,105 200,200 105,105', center: { x: 200, y: 105 } },
  2: { pos: 2, rashiId: 2, name: 'वृष', polygonPoints: '10,10 200,10 105,105', center: { x: 105, y: 42 } },
  3: { pos: 3, rashiId: 3, name: 'मिथुन', polygonPoints: '10,10 10,200 105,105', center: { x: 42, y: 105 } },
  4: { pos: 4, rashiId: 4, name: 'कर्कट', polygonPoints: '10,200 105,105 200,200 105,295', center: { x: 105, y: 200 } },
  5: { pos: 5, rashiId: 5, name: 'सिंह', polygonPoints: '10,200 10,390 105,295', center: { x: 42, y: 295 } },
  6: { pos: 6, rashiId: 6, name: 'कन्या', polygonPoints: '10,390 200,390 105,295', center: { x: 105, y: 358 } },
  7: { pos: 7, rashiId: 7, name: 'तुला', polygonPoints: '200,390 105,295 200,200 295,295', center: { x: 200, y: 295 } },
  8: { pos: 8, rashiId: 8, name: 'वृश्चिक', polygonPoints: '200,390 390,390 295,295', center: { x: 295, y: 358 } },
  9: { pos: 9, rashiId: 9, name: 'धनु', polygonPoints: '390,200 390,390 295,295', center: { x: 358, y: 295 } },
  10: { pos: 10, rashiId: 10, name: 'मकर', polygonPoints: '390,200 295,295 200,200 295,105', center: { x: 295, y: 200 } },
  11: { pos: 11, rashiId: 11, name: 'कुम्भ', polygonPoints: '390,10 390,200 295,105', center: { x: 358, y: 105 } },
  12: { pos: 12, rashiId: 12, name: 'मीन', polygonPoints: '200,10 390,10 295,105', center: { x: 295, y: 42 } },
};

// Smooth curved path for custom points
function calculateCurvedArrowPath(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  curvature: number = 0.15
): string | null {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 3) return null;

  const ux = dx / dist;
  const uy = dy / dist;

  const sx = p1.x + ux * 16;
  const sy = p1.y + uy * 16;
  const ex = p2.x - ux * 22;
  const ey = p2.y - uy * 22;

  const nx = -uy;
  const ny = ux;
  const cx = (sx + ex) / 2 + nx * dist * curvature;
  const cy = (sy + ey) / 2 + ny * dist * curvature;

  return `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
}

export interface ChartHouseData {
  houseNumber: number;
  rashiId?: number;
  rashiName?: RashiName;
  planets: PlanetPosition[];
}

export interface KundaliInteractiveChartProps {
  houses: ChartHouseData[];
  chartTitle?: string;
  chartStyle?: 'North Indian' | 'South Indian' | 'East Indian';
  isChalit?: boolean;
  lagnaRashiId?: number;
  showAspectsInPrint?: boolean;
  showDegrees?: boolean;
  onPlanetSelect?: (planet: PlanetPosition, houseNumber: number) => void;
  className?: string;
}

const getPlanetColorClass = (planetName: string): string => {
  switch (planetName) {
    case 'सूर्य':
      return 'bg-amber-500 text-white hover:bg-amber-600';
    case 'चन्द्र':
      return 'bg-sky-100 dark:bg-sky-900/80 text-sky-900 dark:text-sky-100 border border-sky-300 dark:border-sky-700';
    case 'मंगल':
      return 'bg-rose-600 text-white hover:bg-rose-700';
    case 'गुरु':
      return 'bg-amber-400 text-stone-900 hover:bg-amber-500 font-extrabold';
    case 'शुक्र':
      return 'bg-purple-100 dark:bg-purple-900/80 text-purple-900 dark:text-purple-100 border border-purple-300 dark:border-purple-700';
    case 'शनि':
      return 'bg-slate-700 text-white hover:bg-slate-800';
    default:
      return 'bg-emerald-600 text-white hover:bg-emerald-700';
  }
};

export const KundaliInteractiveChart: React.FC<KundaliInteractiveChartProps> = ({
  houses,
  chartTitle,
  chartStyle = 'North Indian',
  isChalit = false,
  lagnaRashiId,
  showAspectsInPrint = false,
  showDegrees = true,
  onPlanetSelect,
  className = '',
}) => {
  // State for hovered/selected planet for aspect visualization
  const [activePlanet, setActivePlanet] = useState<{
    planet: PlanetPosition;
    houseNumber: number;
  } | null>(null);

  // State for opening the detailed House/Bhava Modal on double click
  const [selectedHouseModal, setSelectedHouseModal] = useState<number | null>(null);

  // Print mode aspect toggle option
  const [enablePrintAspects, setEnablePrintAspects] = useState<boolean>(showAspectsInPrint);

  // Get active planet's aspect items
  const activeAspects: CalculatedAspectItem[] = activePlanet
    ? calculateSinglePlanetAspects(activePlanet.planet, activePlanet.houseNumber, houses)
    : [];

  const activeTargetHouses = activeAspects.map((a) => a.targetHouseNumber);

  // Extract all unique planets for the status strip
  const allPlanetsMap = new Map<string, PlanetPosition>();
  houses.forEach((h) => {
    h.planets.forEach((p) => {
      if (p.id && !allPlanetsMap.has(p.id)) {
        allPlanetsMap.set(p.id, p);
      }
    });
  });
  const allPlanetsInChart = Array.from(allPlanetsMap.values());
  const retroPlanets = allPlanetsInChart.filter((p) => p.isRetrograde);
  const combustPlanets = allPlanetsInChart.filter((p) => p.isCombust);

  // Handle planet click / tap (mobile friendly toggle)
  const handlePlanetClick = (p: PlanetPosition, houseNum: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePlanet && activePlanet.planet.id === p.id && activePlanet.houseNumber === houseNum) {
      setActivePlanet(null);
    } else {
      setActivePlanet({ planet: p, houseNumber: houseNum });
    }
    if (onPlanetSelect) {
      onPlanetSelect(p, houseNum);
    }
  };

  // Handle House Number Double Click / Click for Details Modal
  const handleHouseNumberClick = (houseNum: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedHouseModal(houseNum);
  };

  // Render North Indian Diamond Layout
  const renderNorthIndian = () => {
    return (
      <div 
        className="relative w-full max-w-[640px] aspect-square mx-auto bg-[#FFFDF9] dark:bg-stone-900 p-2.5 sm:p-4 rounded-2xl border-2 border-[#E6E0D5] dark:border-stone-700 shadow-md overflow-hidden text-[#2D241E] dark:text-stone-100 select-none group transition-all duration-200"
        onClick={() => setActivePlanet(null)}
      >
        <svg viewBox="0 0 400 400" className="w-full h-full stroke-stone-800 dark:stroke-stone-300 fill-none stroke-[1.5]">
          <defs>
            {/* Arrowhead marker definition */}
            <marker
              id="aspect-arrowhead"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#D97706" />
            </marker>
            <marker
              id="aspect-arrowhead-active"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#B45309" />
            </marker>
          </defs>

          {/* Base Diamond Grid Lines */}
          <rect x="10" y="10" width="380" height="380" className="stroke-stone-900 dark:stroke-stone-200 stroke-[2]" />
          <line x1="10" y1="10" x2="390" y2="390" />
          <line x1="390" y1="10" x2="10" y2="390" />
          <polygon points="200,10 390,200 200,390 10,200" className="stroke-stone-900 dark:stroke-stone-200 stroke-[2]" />

          {/* Highlight Target Houses where aspects fall */}
          {activeTargetHouses.map((tgtHouseNum) => {
            const geo = NORTH_INDIAN_HOUSE_GEO[tgtHouseNum];
            if (!geo) return null;
            return (
              <polygon
                key={`highlight-${tgtHouseNum}`}
                points={geo.polygonPoints}
                className="fill-amber-400/25 dark:fill-amber-500/30 stroke-amber-500/80 stroke-[2.5] animate-pulse"
              />
            );
          })}

          {/* Draw Aspect Directional Arrows */}
          {activePlanet && activeAspects.map((asp, idx) => {
            const pathInfo = calculateAspectArrowPath(
              asp.sourceHouseNumber,
              asp.targetHouseNumber,
              idx,
              activeAspects.length
            );
            if (!pathInfo) return null;

            return (
              <g key={`arrow-${idx}`}>
                {/* Glow backdrop for arrow */}
                <path
                  d={pathInfo.pathD}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="5"
                  strokeOpacity="0.4"
                  strokeLinecap="round"
                />
                {/* Main animated directional arrow */}
                <path
                  d={pathInfo.pathD}
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="2.5"
                  strokeDasharray="6 3"
                  className="animate-[dash_1.5s_linear_infinite]"
                  markerEnd="url(#aspect-arrowhead-active)"
                />
              </g>
            );
          })}
        </svg>

        {/* House Content Overlays (Rashi Numbers, Planets with Degrees) */}
        {houses.map((house) => {
          const geo = NORTH_INDIAN_HOUSE_GEO[house.houseNumber];
          if (!geo) return null;

          const rashiId = house.rashiId || (lagnaRashiId ? ((lagnaRashiId - 1 + house.houseNumber - 1) % 12) + 1 : house.houseNumber);
          const isTarget = activeTargetHouses.includes(house.houseNumber);

          return (
            <div
              key={house.houseNumber}
              className={`absolute text-center transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 pointer-events-none ${
                isTarget ? 'scale-105 z-10' : ''
              }`}
              style={{ left: `${(geo.center.x / 400) * 100}%`, top: `${(geo.center.y / 400) * 100}%` }}
            >
              {/* Rashi Number - Double Click / Click to open House Details Modal */}
              <button
                type="button"
                onDoubleClick={(e) => handleHouseNumberClick(house.houseNumber, e)}
                onClick={(e) => handleHouseNumberClick(house.houseNumber, e)}
                title={`भाव नं. ${toDevanagariNumerals(house.houseNumber)} (${toDevanagariNumerals(rashiId)} नं. राशि)\nयहाँ डबल क्लिक (वा क्लिक) गरी यस भावद्वारा हेरिने सम्पूर्ण विषयहरू (स्वास्थ्य, धन, पराक्रम, सन्तान, दाम्पत्य आदि) को विवरण हेर्नुहोस्।`}
                className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border shadow-2xs cursor-pointer pointer-events-auto transition-all duration-150 select-none active:scale-95 hover:scale-115 hover:shadow-md hover:ring-2 hover:ring-amber-400 group/badge ${
                  isTarget
                    ? 'bg-amber-500 text-white border-amber-600 scale-110'
                    : 'text-[#D97706] dark:text-amber-400 bg-amber-50/95 dark:bg-stone-800/95 border-[#D97706]/40 hover:bg-[#D97706] hover:text-white dark:hover:bg-amber-500 dark:hover:text-stone-950'
                }`}
              >
                <span>{toDevanagariNumerals(rashiId)}</span>
                {house.houseNumber === 1 && <span className="text-[9px] text-red-600 dark:text-rose-400 font-black ml-0.5 group-hover/badge:text-white">(ल)</span>}
              </button>

              {/* Planets List inside House */}
              <div className="flex flex-wrap justify-center items-center gap-0.5 mt-1 max-w-[105px] pointer-events-auto">
                {house.planets.map((p) => {
                  const isSelected = activePlanet?.planet.id === p.id && activePlanet.houseNumber === house.houseNumber;
                  const degText = formatPlanetDegreesMinutes(p);
                  const statusSuffix = getPlanetStatusSuffix(p);

                  return (
                    <button
                      key={`${house.houseNumber}-${p.id}`}
                      onMouseEnter={() => setActivePlanet({ planet: p, houseNumber: house.houseNumber })}
                      onClick={(e) => handlePlanetClick(p, house.houseNumber, e)}
                      title={`${p.name}: ${p.rashiName} ${degText} ${statusSuffix} (भाव ${toDevanagariNumerals(house.houseNumber)})`}
                      className={`text-[9.5px] font-bold px-1 py-0.5 rounded-md shadow-xs transition-all duration-150 flex items-center gap-0.5 cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#D97706] text-white ring-2 ring-amber-400 scale-110 z-20 shadow-md'
                          : p.name === 'सूर्य'
                          ? 'bg-amber-500 text-white hover:bg-amber-600'
                          : p.name === 'चन्द्र'
                          ? 'bg-sky-100 dark:bg-sky-900/80 text-sky-900 dark:text-sky-100 border border-sky-300 dark:border-sky-700'
                          : p.name === 'मंगल'
                          ? 'bg-rose-600 text-white hover:bg-rose-700'
                          : p.name === 'गुरु'
                          ? 'bg-amber-400 text-stone-900 hover:bg-amber-500 font-extrabold'
                          : p.name === 'शुक्र'
                          ? 'bg-purple-100 dark:bg-purple-900/80 text-purple-900 dark:text-purple-100 border border-purple-300 dark:border-purple-700'
                          : p.name === 'शनि'
                          ? 'bg-slate-700 text-white hover:bg-slate-800'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      <span className="font-extrabold">{p.name}</span>
                      <span className="text-[8.5px] opacity-90 font-mono">{degText}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * 2. RENDER SOUTH INDIAN (दक्षिण भारतीय - चौकोश स्थिर राशि चक्र)
   * 4x4 Grid layout with 12 perimeter boxes (Rashis fixed, houses rotate clockwise)
   */
  const renderSouthIndian = () => {
    const effectiveLagna = lagnaRashiId || houses[0]?.rashiId || 1;

    return (
      <div
        className="relative w-full max-w-[640px] aspect-square mx-auto bg-[#FFFDF9] dark:bg-stone-900 p-2 sm:p-3.5 rounded-2xl border-2 border-[#E6E0D5] dark:border-stone-700 shadow-md overflow-hidden text-[#2D241E] dark:text-stone-100 select-none group transition-all duration-200"
        onClick={() => setActivePlanet(null)}
      >
        {/* SVG Base & Grid Lines */}
        <svg
          viewBox="0 0 400 400"
          className="absolute inset-0 w-full h-full pointer-events-none stroke-stone-700 dark:stroke-stone-400 fill-none"
        >
          <defs>
            <marker
              id="south-aspect-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" className="fill-[#D97706] stroke-none" />
            </marker>
          </defs>

          {/* Outer Border */}
          <rect x="10" y="10" width="380" height="380" className="stroke-stone-900 dark:stroke-stone-200 stroke-[2]" />

          {/* Vertical Grid Lines */}
          <line x1="105" y1="10" x2="105" y2="390" className="stroke-[1.2]" />
          <line x1="200" y1="10" x2="200" y2="105" className="stroke-[1.2]" />
          <line x1="200" y1="295" x2="200" y2="390" className="stroke-[1.2]" />
          <line x1="295" y1="10" x2="295" y2="390" className="stroke-[1.2]" />

          {/* Horizontal Grid Lines */}
          <line x1="10" y1="105" x2="390" y2="105" className="stroke-[1.2]" />
          <line x1="10" y1="200" x2="105" y2="200" className="stroke-[1.2]" />
          <line x1="295" y1="200" x2="390" y2="200" className="stroke-[1.2]" />
          <line x1="10" y1="295" x2="390" y2="295" className="stroke-[1.2]" />

          {/* Center 2x2 Box */}
          <rect
            x="105"
            y="105"
            width="190"
            height="190"
            className="stroke-stone-800 dark:stroke-stone-300 stroke-[1.5] fill-amber-50/30 dark:fill-stone-800/40"
          />

          {/* Highlight Target Houses for active planet */}
          {SOUTH_INDIAN_CELLS.map((cell) => {
            const houseNumber = ((cell.rashiId - effectiveLagna + 12) % 12) + 1;
            const isTarget = activeTargetHouses.includes(houseNumber);
            const isSource = activePlanet?.houseNumber === houseNumber;
            const cx = 10 + cell.col * 95;
            const cy = 10 + cell.row * 95;

            if (isTarget) {
              return (
                <rect
                  key={`south-tgt-${cell.rashiId}`}
                  x={cx + 1}
                  y={cy + 1}
                  width="93"
                  height="93"
                  className="fill-amber-400/20 dark:fill-amber-500/25 stroke-amber-500 dark:stroke-amber-400 stroke-[2] animate-pulse"
                />
              );
            }
            if (isSource) {
              return (
                <rect
                  key={`south-src-${cell.rashiId}`}
                  x={cx + 1}
                  y={cy + 1}
                  width="93"
                  height="93"
                  className="fill-amber-500/10 dark:fill-amber-400/15 stroke-amber-600 stroke-[1.5]"
                />
              );
            }
            return null;
          })}

          {/* South Indian Aspect Rays / Curved Arrows */}
          {activePlanet && activeAspects.map((asp, idx) => {
            const srcRashiId = ((effectiveLagna - 1 + activePlanet.houseNumber - 1) % 12) + 1;
            const tgtRashiId = ((effectiveLagna - 1 + asp.targetHouseNumber - 1) % 12) + 1;

            const srcCell = SOUTH_INDIAN_CELLS.find((c) => c.rashiId === srcRashiId);
            const tgtCell = SOUTH_INDIAN_CELLS.find((c) => c.rashiId === tgtRashiId);

            if (!srcCell || !tgtCell) return null;

            const p1 = { x: 10 + srcCell.col * 95 + 47.5, y: 10 + srcCell.row * 95 + 47.5 };
            const p2 = { x: 10 + tgtCell.col * 95 + 47.5, y: 10 + tgtCell.row * 95 + 47.5 };

            const curvature = 0.16 * (idx % 2 === 0 ? 1 : -1);
            const pathD = calculateCurvedArrowPath(p1, p2, curvature);
            if (!pathD) return null;

            return (
              <g key={`south-asp-${idx}`}>
                <path
                  d={pathD}
                  className="stroke-[#D97706] stroke-[2.2] fill-none animate-in fade-in duration-200"
                  markerEnd="url(#south-aspect-arrow)"
                />
              </g>
            );
          })}
        </svg>

        {/* Center 2x2 Decorative Vedic Inscription Panel */}
        <div className="absolute top-[26.25%] left-[26.25%] w-[47.5%] h-[47.5%] flex flex-col items-center justify-center text-center p-3 pointer-events-none select-none">
          <div className="text-[11px] sm:text-xs font-serif font-bold text-stone-800 dark:text-stone-200">
            {chartTitle || '॥ दक्षिण भारतीय कुण्डली ॥'}
          </div>
          <div className="mt-1 text-[10px] sm:text-[11px] font-bold text-[#D97706] dark:text-amber-400 bg-amber-100/60 dark:bg-stone-800 px-2 py-0.5 rounded-full border border-amber-300 dark:border-stone-700">
            लग्न: {RASHI_NAMES_MAP[effectiveLagna]} (राशि {toDevanagariNumerals(effectiveLagna)})
          </div>
          <div className="mt-1 text-[9px] text-stone-500 dark:text-stone-400">
            चौकोश स्थिर राशि चक्र • दक्षिणावर्त (Clockwise)
          </div>
          {activePlanet && (
            <div className="mt-2 text-[9.5px] font-medium text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-stone-900/80 p-1 rounded border border-amber-200 dark:border-stone-700 max-w-[150px]">
              {activePlanet.planet.name} दृष्टि सक्रिय ({activeAspects.length} भाव)
            </div>
          )}
        </div>

        {/* 12 Perimeter Boxes */}
        {SOUTH_INDIAN_CELLS.map((cell) => {
          const houseNumber = ((cell.rashiId - effectiveLagna + 12) % 12) + 1;
          const isLagna = houseNumber === 1;
          const houseData =
            houses.find((h) => h.houseNumber === houseNumber) ||
            houses.find((h) => h.rashiId === cell.rashiId);
          const cellPlanets = houseData?.planets || [];

          const leftPercent = ((10 + cell.col * 95) / 400) * 100;
          const topPercent = ((10 + cell.row * 95) / 400) * 100;
          const widthPercent = (95 / 400) * 100;
          const heightPercent = (95 / 400) * 100;

          return (
            <div
              key={`south-cell-${cell.rashiId}`}
              className={`absolute p-1.5 flex flex-col justify-between overflow-hidden transition-colors ${
                isLagna ? 'bg-rose-50/30 dark:bg-rose-950/15' : ''
              }`}
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                width: `${widthPercent}%`,
                height: `${heightPercent}%`,
              }}
            >
              {/* Box Header: Rashi and House Number badge */}
              <div className="flex items-center justify-between gap-0.5 border-b border-stone-200/60 dark:border-stone-700/60 pb-0.5">
                <span className="text-[10px] font-semibold text-stone-600 dark:text-stone-300">
                  {toDevanagariNumerals(cell.rashiId)}. {cell.name}
                </span>

                <button
                  type="button"
                  onClick={(e) => handleHouseNumberClick(houseNumber, e)}
                  onDoubleClick={(e) => handleHouseNumberClick(houseNumber, e)}
                  className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded cursor-pointer transition-transform hover:scale-105 ${
                    isLagna
                      ? 'bg-red-600 text-white shadow-xs font-black'
                      : 'bg-amber-100 dark:bg-stone-800 text-[#D97706] dark:text-amber-400 border border-amber-300 dark:border-stone-700'
                  }`}
                  title={`भाव ${toDevanagariNumerals(houseNumber)} को फलित र विवरण हेर्न क्लिक गर्नुहोस्`}
                >
                  भाव {toDevanagariNumerals(houseNumber)}
                  {isLagna && <span className="ml-0.5 font-black">(ल)</span>}
                </button>
              </div>

              {/* Planets in this Rashi/House */}
              <div className="flex flex-wrap items-center justify-center gap-0.5 my-auto max-h-[64px] overflow-y-auto">
                {cellPlanets.map((p) => {
                  const isHovered = activePlanet?.planet.id === p.id;
                  const degText = formatPlanetDegreesMinutes(p);
                  const suffix = getPlanetStatusSuffix(p);

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={(e) => handlePlanetClick(p, houseNumber, e)}
                      onMouseEnter={() => setActivePlanet({ planet: p, houseNumber })}
                      className={`text-[9.5px] sm:text-[10px] font-bold px-1 py-0.2 rounded-md shadow-2xs transition-all duration-150 flex items-center gap-0.5 cursor-pointer hover:scale-105 active:scale-95 ${
                        isHovered
                          ? 'ring-2 ring-amber-500 ring-offset-1 z-30 scale-105'
                          : ''
                      } ${getPlanetColorClass(p.name)}`}
                      title={`${p.name} (${degText}) - स्थिति: भाव ${toDevanagariNumerals(houseNumber)}`}
                    >
                      <span>{p.name}</span>
                      {showDegrees && (
                        <span className="text-[7.5px] opacity-85 font-mono ml-0.5">
                          {degText.split(' ')[0]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Lagna slash indicator corner icon */}
              {isLagna && (
                <div className="text-[8.5px] text-red-600 dark:text-rose-400 font-black text-right pr-0.5 select-none">
                  ASC
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * 3. RENDER EAST INDIAN (पूर्वी भारतीय / सूर्य चक्र / बङ्गाली-मैथिली शैली)
   * Diamond-in-square layout with fixed Rashis (Aries at top diamond, counter-clockwise)
   */
  const renderEastIndian = () => {
    const effectiveLagna = lagnaRashiId || houses[0]?.rashiId || 1;

    return (
      <div
        className="relative w-full max-w-[640px] aspect-square mx-auto bg-[#FFFDF9] dark:bg-stone-900 p-2 sm:p-3.5 rounded-2xl border-2 border-[#E6E0D5] dark:border-stone-700 shadow-md overflow-hidden text-[#2D241E] dark:text-stone-100 select-none group transition-all duration-200"
        onClick={() => setActivePlanet(null)}
      >
        {/* SVG Base & Lines */}
        <svg
          viewBox="0 0 400 400"
          className="absolute inset-0 w-full h-full pointer-events-none stroke-stone-800 dark:stroke-stone-300 fill-none"
        >
          <defs>
            <marker
              id="east-aspect-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" className="fill-[#D97706] stroke-none" />
            </marker>
          </defs>

          {/* Outer Border */}
          <rect x="10" y="10" width="380" height="380" className="stroke-stone-900 dark:stroke-stone-200 stroke-[2]" />

          {/* Main Diagonal Lines */}
          <line x1="10" y1="10" x2="390" y2="390" className="stroke-[1.6]" />
          <line x1="390" y1="10" x2="10" y2="390" className="stroke-[1.6]" />

          {/* Inner Diamond */}
          <polygon
            points="200,10 390,200 200,390 10,200"
            className="stroke-stone-900 dark:stroke-stone-200 stroke-[2]"
          />

          {/* Target House Highlights */}
          {Object.entries(EAST_INDIAN_POS_GEO).map(([posStr, geo]) => {
            const pos = Number(posStr);
            const houseNumber = ((pos - effectiveLagna + 12) % 12) + 1;
            const isTarget = activeTargetHouses.includes(houseNumber);
            const isSource = activePlanet?.houseNumber === houseNumber;

            if (isTarget) {
              return (
                <polygon
                  key={`east-tgt-${pos}`}
                  points={geo.polygonPoints}
                  className="fill-amber-400/25 dark:fill-amber-500/30 stroke-amber-500 dark:stroke-amber-400 stroke-[2] animate-pulse"
                />
              );
            }
            if (isSource) {
              return (
                <polygon
                  key={`east-src-${pos}`}
                  points={geo.polygonPoints}
                  className="fill-amber-500/10 dark:fill-amber-400/15 stroke-amber-600 stroke-[1.5]"
                />
              );
            }
            return null;
          })}

          {/* East Indian Aspect Curved Arrows */}
          {activePlanet && activeAspects.map((asp, idx) => {
            const srcPos = ((effectiveLagna - 1 + activePlanet.houseNumber - 1) % 12) + 1;
            const tgtPos = ((effectiveLagna - 1 + asp.targetHouseNumber - 1) % 12) + 1;

            const srcGeo = EAST_INDIAN_POS_GEO[srcPos];
            const tgtGeo = EAST_INDIAN_POS_GEO[tgtPos];

            if (!srcGeo || !tgtGeo) return null;

            const curvature = 0.16 * (idx % 2 === 0 ? 1 : -1);
            const pathD = calculateCurvedArrowPath(srcGeo.center, tgtGeo.center, curvature);
            if (!pathD) return null;

            return (
              <g key={`east-asp-${idx}`}>
                <path
                  d={pathD}
                  className="stroke-[#D97706] stroke-[2.2] fill-none animate-in fade-in duration-200"
                  markerEnd="url(#east-aspect-arrow)"
                />
              </g>
            );
          })}
        </svg>

        {/* 12 Compartments Overlay */}
        {Object.entries(EAST_INDIAN_POS_GEO).map(([posStr, geo]) => {
          const pos = Number(posStr);
          const houseNumber = ((pos - effectiveLagna + 12) % 12) + 1;
          const isLagna = houseNumber === 1;
          const houseData =
            houses.find((h) => h.houseNumber === houseNumber) ||
            houses.find((h) => h.rashiId === pos);
          const posPlanets = houseData?.planets || [];

          return (
            <div
              key={`east-pos-${pos}`}
              className="absolute text-center transform -translate-x-1/2 -translate-y-1/2 cursor-default select-none max-w-[105px] z-10"
              style={{
                left: `${(geo.center.x / 400) * 100}%`,
                top: `${(geo.center.y / 400) * 100}%`,
              }}
            >
              {/* Rashi & House Badge */}
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 bg-stone-100/90 dark:bg-stone-800/90 px-1.5 py-0.2 rounded border border-stone-200 dark:border-stone-700">
                  {toDevanagariNumerals(pos)}. {geo.name}
                </span>

                <button
                  type="button"
                  onClick={(e) => handleHouseNumberClick(houseNumber, e)}
                  onDoubleClick={(e) => handleHouseNumberClick(houseNumber, e)}
                  className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded cursor-pointer transition-transform hover:scale-105 ${
                    isLagna
                      ? 'bg-red-600 text-white shadow-xs font-black'
                      : 'bg-amber-100 dark:bg-stone-800 text-[#D97706] dark:text-amber-400 border border-amber-300 dark:border-stone-700'
                  }`}
                  title={`भाव ${toDevanagariNumerals(houseNumber)} को फलित हेर्न क्लिक गर्नुहोस्`}
                >
                  {toDevanagariNumerals(houseNumber)} भाव
                  {isLagna && <span className="ml-0.5 font-black">(ल)</span>}
                </button>
              </div>

              {/* Planets inside this East Indian compartment */}
              <div className="flex flex-wrap justify-center items-center gap-0.5 max-w-[100px]">
                {posPlanets.map((p) => {
                  const isHovered = activePlanet?.planet.id === p.id;
                  const degText = formatPlanetDegreesMinutes(p);
                  const suffix = getPlanetStatusSuffix(p);

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={(e) => handlePlanetClick(p, houseNumber, e)}
                      onMouseEnter={() => setActivePlanet({ planet: p, houseNumber })}
                      className={`text-[9.5px] sm:text-[10px] font-bold px-1 py-0.2 rounded-md shadow-2xs transition-all duration-150 flex items-center gap-0.5 cursor-pointer hover:scale-105 active:scale-95 ${
                        isHovered
                          ? 'ring-2 ring-amber-500 ring-offset-1 z-30 scale-105'
                          : ''
                      } ${getPlanetColorClass(p.name)}`}
                      title={`${p.name} (${degText}) - स्थिति: भाव ${toDevanagariNumerals(houseNumber)}`}
                    >
                      <span>{p.name}</span>
                      {showDegrees && (
                        <span className="text-[7.5px] opacity-85 font-mono ml-0.5">
                          {degText.split(' ')[0]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Optional Title Bar */}
      {chartTitle && (
        <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-2">
          <h4 className="text-sm font-bold font-serif text-[#1A1A1A] dark:text-stone-100 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#D97706]" />
            <span>{chartTitle}</span>
          </h4>
          <span className="text-xs text-stone-500 font-medium">
            (ग्रहमा कर्सर राखी दृष्टि हेर्नुहोस्)
          </span>
        </div>
      )}

      {/* Main Chart Graphic */}
      {chartStyle === 'North Indian' && renderNorthIndian()}
      {chartStyle === 'South Indian' && renderSouthIndian()}
      {chartStyle === 'East Indian' && renderEastIndian()}

      {/* कुण्डली मुनि ग्रह स्थिति पट्टिका (वक्री / अस्त ग्रह स्थिति) */}
      <div className="w-full px-3 py-1.5 bg-amber-50/90 dark:bg-stone-800/80 border border-amber-300 dark:border-stone-700 rounded-xl text-xs text-stone-800 dark:text-stone-200 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 shadow-2xs">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
          <strong className="text-red-900 dark:text-red-300 font-bold">वक्री ग्रह (Retrograde):</strong>
          <span className="font-semibold text-stone-900 dark:text-stone-100">
            {retroPlanets.length > 0
              ? retroPlanets.map((p) => p.name).join(', ')
              : 'कुनै छैन'}
          </span>
        </span>
        <span className="text-stone-300 dark:text-stone-600 hidden sm:inline">|</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
          <strong className="text-amber-900 dark:text-amber-300 font-bold">अस्त ग्रह (Combust):</strong>
          <span className="font-semibold text-stone-900 dark:text-stone-100">
            {combustPlanets.length > 0
              ? combustPlanets.map((p) => p.name).join(', ')
              : 'कुनै छैन'}
          </span>
        </span>
      </div>

      {/* Active Hovered Planet Detailed Tooltip Box */}
      {activePlanet ? (
        <div className="p-3 bg-amber-50/90 dark:bg-stone-800/90 border border-amber-300 dark:border-amber-700/60 rounded-xl shadow-sm text-xs space-y-1.5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-amber-200 dark:border-stone-700 pb-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
              <Eye className="w-4 h-4 text-[#D97706]" />
              <span className="text-sm">{activePlanet.planet.name} ग्रह स्थिति तथा दृष्टि विवरण</span>
            </div>
            <button
              onClick={() => setActivePlanet(null)}
              className="text-[10px] text-amber-700 dark:text-amber-400 hover:underline font-bold"
            >
              हटाउनुहोस् ✕
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
            <div>
              <span className="text-stone-500 dark:text-stone-400">स्थिति भाव:</span>{' '}
              <span className="font-bold text-stone-800 dark:text-stone-200">
                भाव {toDevanagariNumerals(activePlanet.houseNumber)} ({activePlanet.planet.rashiName} राशि)
              </span>
            </div>
            <div>
              <span className="text-stone-500 dark:text-stone-400">अंश–कला:</span>{' '}
              <span className="font-bold text-[#D97706] dark:text-amber-400 font-mono">
                {formatPlanetDegreesMinutes(activePlanet.planet)}
              </span>
            </div>
            <div>
              <span className="text-stone-500 dark:text-stone-400">अवस्था:</span>{' '}
              <span className="font-bold text-stone-800 dark:text-stone-200">
                {getPlanetStateDescriptionNepali(activePlanet.planet)}
              </span>
            </div>
          </div>

          <div className="pt-1 border-t border-amber-200/60 dark:border-stone-700/60">
            <span className="text-stone-600 dark:text-stone-300 font-bold">दृष्टि पर्ने भावहरू:</span>{' '}
            <span className="text-[#D97706] dark:text-amber-300 font-extrabold">
              {activeAspects.map((asp) => (
                ` ${toDevanagariNumerals(asp.targetHouseNumber)}औँ भाव (${asp.targetRashiName} - ${asp.shortTypeNepali})`
              )).join(', ')}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center text-[11px] text-stone-500 dark:text-stone-400 py-1 bg-stone-50 dark:bg-stone-800/40 rounded-lg border border-dashed border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span>✨ <strong>सुझाव:</strong> घरको नम्बर (<span className="text-[#D97706] font-bold">जस्तै: ७, १, ४, १०</span>) मा <strong>डबल क्लिक</strong> गर्दा त्यो घरद्वारा के–के हेरिन्छ त्यसको विस्तृत शास्त्रीय विवरण र फलित खुल्नेछ।</span>
        </div>
      )}

      {/* House/Bhava Detail Modal on Double Click / Click */}
      {selectedHouseModal !== null && (
        <HouseDetailModal
          isOpen={selectedHouseModal !== null}
          onClose={() => setSelectedHouseModal(null)}
          houseNumber={selectedHouseModal}
          onChangeHouse={(newH) => setSelectedHouseModal(newH)}
          allHouses={houses as any}
          chartTitle={chartTitle}
        />
      )}
    </div>
  );
};

/**
 * Aspect Summary Report Table Component (ग्रहदृष्टि प्रतिवेदन तालिका)
 */
export const KundaliAspectReportTable: React.FC<{
  houses: ChartHouseData[];
  titleNepali?: string;
}> = ({ houses, titleNepali = 'पूर्ण ग्रहदृष्टि तथा ग्रहस्थिति प्रतिवेदन तालिका' }) => {
  const reportRows: AspectReportRow[] = generateChartAspectReport(houses);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-2.5">
        <h3 className="text-sm font-bold font-serif text-[#1A1A1A] dark:text-stone-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D97706]" />
          <span>{titleNepali}</span>
        </h3>
        <span className="text-xs font-bold text-[#D97706] bg-amber-50 dark:bg-stone-800 px-2.5 py-1 rounded-full border border-amber-200 dark:border-stone-700">
          कुल ९ ग्रह विश्लेषण
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FAF8F5] dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-b border-[#E6E0D5] dark:border-stone-700">
              <th className="p-2.5 font-bold">ग्रह</th>
              <th className="p-2.5 font-bold">स्थिति भाव</th>
              <th className="p-2.5 font-bold">राशि</th>
              <th className="p-2.5 font-bold">अंश–कला</th>
              <th className="p-2.5 font-bold">गति / अवस्था</th>
              <th className="p-2.5 font-bold text-amber-700 dark:text-amber-400">दृष्टि पर्ने भावहरू</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E0D5] dark:divide-stone-800">
            {reportRows.map((row) => (
              <tr key={row.planetName} className="hover:bg-amber-50/50 dark:hover:bg-stone-800/50 transition-colors">
                <td className="p-2.5 font-bold text-[#1A1A1A] dark:text-stone-100 flex items-center gap-1">
                  <span>{row.planetName}</span>
                  {row.statusSuffix && (
                    <span className="text-[10px] font-mono text-[#D97706] font-extrabold">{row.statusSuffix}</span>
                  )}
                </td>
                <td className="p-2.5 font-bold text-stone-700 dark:text-stone-300">
                  भाव {toDevanagariNumerals(row.residingHouse)}
                </td>
                <td className="p-2.5 text-stone-800 dark:text-stone-200 font-medium">{row.rashiName}</td>
                <td className="p-2.5 font-mono font-bold text-[#D97706] dark:text-amber-400">{row.degreeFormatted}</td>
                <td className="p-2.5 text-stone-600 dark:text-stone-400">{row.stateTextNepali}</td>
                <td className="p-2.5 font-bold text-amber-800 dark:text-amber-300 bg-amber-50/30 dark:bg-stone-800/30 rounded-lg">
                  {row.aspectedHousesText}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
