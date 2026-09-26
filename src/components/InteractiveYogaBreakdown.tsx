import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Award, 
  Zap, 
  BookOpen, 
  Compass, 
  Eye, 
  Layers, 
  Info, 
  CheckCircle2, 
  Maximize2, 
  X, 
  Printer, 
  ChevronRight,
  Filter,
  ArrowRight,
  ShieldAlert,
  Flame,
  Star
} from 'lucide-react';
import { 
  LagnaInfo, 
  PlanetPosition, 
  PlanetName, 
  RashiName, 
  VimshottariDashaResult 
} from '../types/astrology';
import { 
  DetailedYogaResult, 
  YogaCategory 
} from '../types/yogaDoshaTypes';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { getHouseLord, SIGN_LORDS } from '../utils/planetaryRelationshipEngine';

interface InteractiveYogaBreakdownProps {
  yogas: DetailedYogaResult[];
  lagna: LagnaInfo;
  planets: PlanetPosition[];
  dasha?: VimshottariDashaResult;
  initialSelectedYogaId?: string;
  onOpenShlokaDetail?: (yoga: DetailedYogaResult) => void;
  className?: string;
}

const RASHI_NAMES: Record<number, RashiName> = {
  1: 'मेष', 2: 'वृष', 3: 'मिथुन', 4: 'कर्कट', 5: 'सिंह', 6: 'कन्या',
  7: 'तुला', 8: 'वृश्चिक', 9: 'धनु', 10: 'मकर', 11: 'कुम्भ', 12: 'मीन'
};

const PLANET_SYMBOLS: Record<string, { glyph: string; color: string; darkColor: string; bgLight: string; bgDark: string }> = {
  'सूर्य': { glyph: '☉', color: 'text-amber-600', darkColor: 'text-amber-400', bgLight: 'bg-amber-100/80', bgDark: 'bg-amber-950/60' },
  'चन्द्र': { glyph: '☽', color: 'text-sky-600', darkColor: 'text-sky-300', bgLight: 'bg-sky-100/80', bgDark: 'bg-sky-950/60' },
  'मंगल': { glyph: '♂', color: 'text-rose-600', darkColor: 'text-rose-400', bgLight: 'bg-rose-100/80', bgDark: 'bg-rose-950/60' },
  'बुध': { glyph: '☿', color: 'text-emerald-600', darkColor: 'text-emerald-400', bgLight: 'bg-emerald-100/80', bgDark: 'bg-emerald-950/60' },
  'गुरु': { glyph: '♃', color: 'text-yellow-600', darkColor: 'text-yellow-400', bgLight: 'bg-yellow-100/80', bgDark: 'bg-yellow-950/60' },
  'शुक्र': { glyph: '♀', color: 'text-pink-600', darkColor: 'text-pink-400', bgLight: 'bg-pink-100/80', bgDark: 'bg-pink-950/60' },
  'शनि': { glyph: '♄', color: 'text-indigo-600', darkColor: 'text-indigo-400', bgLight: 'bg-indigo-100/80', bgDark: 'bg-indigo-950/60' },
  'राहु': { glyph: '☊', color: 'text-purple-600', darkColor: 'text-purple-400', bgLight: 'bg-purple-100/80', bgDark: 'bg-purple-950/60' },
  'केतु': { glyph: '☋', color: 'text-amber-800', darkColor: 'text-amber-300', bgLight: 'bg-amber-200/60', bgDark: 'bg-amber-900/60' },
};

// House Polygons for 400x400 SVG canvas
const HOUSE_POLYGONS: Record<number, string> = {
  1:  "200,8 296,104 200,200 104,104",
  2:  "8,8 200,8 104,104",
  3:  "8,8 104,104 8,200",
  4:  "104,104 200,200 104,296 8,200",
  5:  "8,200 104,296 8,392",
  6:  "8,392 104,296 200,392",
  7:  "200,200 296,296 200,392 104,296",
  8:  "200,392 296,296 392,392",
  9:  "296,296 392,200 392,392",
  10: "200,200 296,104 392,200 296,296",
  11: "296,104 392,8 392,200",
  12: "200,8 392,8 296,104",
};

// House Anchor positions for text & planet badges
const HOUSE_CENTERS: Record<number, { rashiX: number; rashiY: number; planetX: number; planetY: number }> = {
  1:  { rashiX: 200, rashiY: 36,  planetX: 200, planetY: 100 },
  2:  { rashiX: 104, rashiY: 30,  planetX: 104, planetY: 66 },
  3:  { rashiX: 28,  rashiY: 104, planetX: 54,  planetY: 126 },
  4:  { rashiX: 104, rashiY: 165, planetX: 104, planetY: 204 },
  5:  { rashiX: 28,  rashiY: 296, planetX: 54,  planetY: 316 },
  6:  { rashiX: 104, rashiY: 374, planetX: 104, planetY: 336 },
  7:  { rashiX: 200, rashiY: 228, planetX: 200, planetY: 296 },
  8:  { rashiX: 296, rashiY: 374, planetX: 296, planetY: 336 },
  9:  { rashiX: 372, rashiY: 296, planetX: 346, planetY: 316 },
  10: { rashiX: 296, rashiY: 165, planetX: 296, planetY: 204 },
  11: { rashiX: 372, rashiY: 104, planetX: 346, planetY: 126 },
  12: { rashiX: 296, rashiY: 30,  planetX: 296, planetY: 66 },
};

export const InteractiveYogaBreakdown: React.FC<InteractiveYogaBreakdownProps> = ({
  yogas,
  lagna,
  planets,
  dasha,
  initialSelectedYogaId,
  onOpenShlokaDetail,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('सबै');
  const [selectedYogaId, setSelectedYogaId] = useState<string>(
    initialSelectedYogaId || (yogas.length > 0 ? yogas[0].id : '')
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [hoveredPlanetName, setHoveredPlanetName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'formation' | 'planets' | 'shloka' | 'dasha' | 'remedies'>('formation');

  // Filter Yogas by Category
  const categories = useMemo(() => {
    const set = new Set<string>();
    yogas.forEach((y) => set.add(y.category));
    return ['सबै', ...Array.from(set)];
  }, [yogas]);

  const filteredYogas = useMemo(() => {
    if (selectedCategory === 'सबै') return yogas;
    return yogas.filter((y) => y.category === selectedCategory);
  }, [yogas, selectedCategory]);

  // Currently active yoga
  const currentYoga = useMemo(() => {
    const found = yogas.find((y) => y.id === selectedYogaId);
    return found || (filteredYogas.length > 0 ? filteredYogas[0] : yogas[0] || null);
  }, [yogas, filteredYogas, selectedYogaId]);

  // House to Rashi & Planets mapping
  const housesMap = useMemo(() => {
    const map: Record<number, { houseNumber: number; rashiId: number; rashiName: RashiName; lord: PlanetName; planets: PlanetPosition[] }> = {};
    const lagnaRashiId = lagna?.rashiId || 1;

    for (let h = 1; h <= 12; h++) {
      const rId = ((lagnaRashiId - 1 + (h - 1)) % 12) + 1;
      map[h] = {
        houseNumber: h,
        rashiId: rId,
        rashiName: RASHI_NAMES[rId] || 'मेष',
        lord: getHouseLord(lagnaRashiId, h),
        planets: [],
      };
    }

    planets.forEach((p) => {
      let houseNum = p.bhava;
      if (!houseNum || houseNum < 1 || houseNum > 12) {
        houseNum = ((p.rashiId - lagnaRashiId + 12) % 12) + 1;
      }
      if (map[houseNum]) {
        map[houseNum].planets.push(p);
      }
    });

    return map;
  }, [lagna, planets]);

  // Planets involved in current yoga
  const involvedPlanetsList = useMemo(() => {
    if (!currentYoga) return [];
    return currentYoga.formingPlanets
      .map((pName) => planets.find((p) => p.name === pName))
      .filter((p): p is PlanetPosition => Boolean(p));
  }, [currentYoga, planets]);

  // Get Lordship role of a planet in this native's chart
  const getPlanetLordshipRole = (pName: string): string => {
    const ownedHouses: number[] = [];
    for (let h = 1; h <= 12; h++) {
      if (getHouseLord(lagna.rashiId, h) === pName) {
        ownedHouses.push(h);
      }
    }
    if (ownedHouses.length === 0) return 'छाया ग्रह';

    const roles: string[] = [];
    ownedHouses.forEach((h) => {
      if (h === 1) roles.push('लग्नेश (१)');
      else if (h === 2) roles.push('धनेश (२)');
      else if (h === 3) roles.push('तृतीयेश (३)');
      else if (h === 4) roles.push('सुखेश (४)');
      else if (h === 5) roles.push('पञ्चमेश (५)');
      else if (h === 6) roles.push('षष्ठेश (६)');
      else if (h === 7) roles.push('सप्तमेश (७)');
      else if (h === 8) roles.push('अष्टमेश (८)');
      else if (h === 9) roles.push('भाग्येश (९)');
      else if (h === 10) roles.push('कर्मेश (१०)');
      else if (h === 11) roles.push('लाभेश (११)');
      else if (h === 12) roles.push('व्ययेश (१२)');
    });

    return roles.join(' र ');
  };

  // Connected links between involved houses for SVG curve line
  const houseConnections = useMemo(() => {
    if (!currentYoga || !currentYoga.housesInvolved || currentYoga.housesInvolved.length < 2) {
      return [];
    }
    const houses = Array.from(new Set(currentYoga.housesInvolved.filter((h) => h >= 1 && h <= 12)));
    const lines: Array<{ x1: number; y1: number; x2: number; y2: number; label?: string }> = [];

    for (let i = 0; i < houses.length - 1; i++) {
      const h1 = houses[i];
      const h2 = houses[i + 1];
      const c1 = HOUSE_CENTERS[h1];
      const c2 = HOUSE_CENTERS[h2];
      if (c1 && c2) {
        lines.push({
          x1: c1.planetX,
          y1: c1.planetY,
          x2: c2.planetX,
          y2: c2.planetY,
        });
      }
    }
    return lines;
  }, [currentYoga]);

  if (!currentYoga) {
    return (
      <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-amber-200 dark:border-stone-800 text-center">
        <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-50" />
        <p className="text-sm text-stone-600 dark:text-stone-400">कुनै योग उपलब्ध छैन।</p>
      </div>
    );
  }

  // Render the visual breakdown inner content
  const renderBreakdownContent = (isExpanded: boolean = false) => {
    return (
      <div className="space-y-6">
        {/* TOP SUMMARY BANNER */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-950 to-stone-900 text-white rounded-2xl border border-amber-700/80 p-4 sm:p-5 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                  {currentYoga.category}
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>स्थिति: {currentYoga.status}</span>
                </span>
                {currentYoga.classicalProof?.chapter && (
                  <span className="bg-stone-800/80 text-stone-300 border border-stone-700 text-[11px] px-2 py-0.5 rounded-full hidden md:inline-block">
                    {currentYoga.classicalProof.textNameNepali} ({currentYoga.classicalProof.chapter})
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-amber-100 flex items-center gap-2">
                <span>{currentYoga.nameNepali}</span>
                {currentYoga.nameSanskrit && (
                  <span className="text-xs sm:text-sm font-normal text-amber-300/80 italic">
                    ({currentYoga.nameSanskrit})
                  </span>
                )}
              </h3>
            </div>

            {/* Strength Meter */}
            <div className="bg-black/40 border border-amber-500/30 rounded-xl p-3 sm:text-right shrink-0 min-w-[160px]">
              <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-bold text-amber-200 mb-1">
                <span>योग शक्ति (Strength):</span>
                <span className="text-sm font-extrabold text-amber-400">
                  {toDevanagariNumerals(currentYoga.strengthPercentage)}%
                </span>
              </div>
              <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden border border-amber-900/60">
                <div 
                  className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${currentYoga.strengthPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* DUAL COLUMN: VISUAL SVG KUNDALI CHART + INTERACTIVE TABS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: NORTH INDIAN SVG KUNDALI WITH YOGA HIGHLIGHTING */}
          <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 font-serif flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-amber-600" />
                <span>कुण्डलीमा प्रत्यक्ष संरचना दृश्य</span>
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">
                {lagna.rashiName} लग्न (१)
              </span>
            </div>

            {/* SVG Visual Stage */}
            <div className="relative aspect-square w-full max-w-[380px] mx-auto bg-amber-50/40 dark:bg-stone-950/60 rounded-xl border border-amber-200 dark:border-stone-800 p-2 select-none">
              <svg viewBox="0 0 400 400" className="w-full h-full">
                <defs>
                  {/* Glowing Filter for involved planets */}
                  <filter id="yogaGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  {/* Pattern for involved houses */}
                  <pattern id="yogaHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(217, 119, 6, 0.15)" strokeWidth="2" />
                  </pattern>
                </defs>

                {/* Draw 12 House Polygons */}
                {Array.from({ length: 12 }, (_, i) => i + 1).map((hNum) => {
                  const isInvolvedHouse = currentYoga.housesInvolved.includes(hNum);
                  const isKendra = [1, 4, 7, 10].includes(hNum);
                  const isTrikona = [1, 5, 9].includes(hNum);
                  const points = HOUSE_POLYGONS[hNum];
                  
                  // Fill color logic
                  let fill = "rgba(255, 255, 255, 0.7)";
                  let stroke = "#d6d3d1";
                  let strokeWidth = "1";

                  if (isInvolvedHouse) {
                    fill = "rgba(251, 191, 36, 0.25)";
                    stroke = "#d97706";
                    strokeWidth = "2.2";
                  } else if (isKendra) {
                    fill = "rgba(245, 158, 11, 0.05)";
                  } else if (isTrikona) {
                    fill = "rgba(16, 185, 129, 0.05)";
                  }

                  return (
                    <g key={hNum}>
                      <polygon
                        points={points}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        className="transition-all duration-300"
                      />
                      {isInvolvedHouse && (
                        <polygon
                          points={points}
                          fill="url(#yogaHatch)"
                          className="pointer-events-none"
                        />
                      )}
                    </g>
                  );
                })}

                {/* Outer frame & diagonals */}
                <rect x="8" y="8" width="384" height="384" fill="none" stroke="#78350f" strokeWidth="2" />
                <line x1="8" y1="8" x2="392" y2="392" stroke="#a8a29e" strokeWidth="1" />
                <line x1="8" y1="392" x2="392" y2="8" stroke="#a8a29e" strokeWidth="1" />

                {/* House connection dashed lines */}
                {houseConnections.map((conn, idx) => (
                  <line
                    key={idx}
                    x1={conn.x1}
                    y1={conn.y1}
                    x2={conn.x2}
                    y2={conn.y2}
                    stroke="#d97706"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    className="animate-pulse"
                  />
                ))}

                {/* Render Rashi Numbers & Planets in each house */}
                {Array.from({ length: 12 }, (_, i) => i + 1).map((hNum) => {
                  const hData = housesMap[hNum];
                  const center = HOUSE_CENTERS[hNum];
                  if (!hData || !center) return null;

                  const isInvolvedHouse = currentYoga.housesInvolved.includes(hNum);

                  return (
                    <g key={hNum}>
                      {/* Rashi Number in House */}
                      <text
                        x={center.rashiX}
                        y={center.rashiY}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="11"
                        fontWeight="bold"
                        fill={isInvolvedHouse ? '#b45309' : '#78716c'}
                      >
                        {toDevanagariNumerals(hData.rashiId)}
                      </text>

                      {/* Lagna indicator in House 1 */}
                      {hNum === 1 && (
                        <text
                          x={center.rashiX}
                          y={center.rashiY + 14}
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="bold"
                          fill="#d97706"
                        >
                          लग्न
                        </text>
                      )}

                      {/* House involved badge */}
                      {isInvolvedHouse && (
                        <circle
                          cx={center.rashiX + 16}
                          cy={center.rashiY}
                          r="3"
                          fill="#d97706"
                        />
                      )}

                      {/* Planets inside this house */}
                      <g>
                        {hData.planets.map((p, pIdx) => {
                          const isForming = currentYoga.formingPlanets.includes(p.name);
                          const yOffset = pIdx * 14;
                          const pX = center.planetX;
                          const pY = center.planetY + yOffset;

                          return (
                            <g 
                              key={p.id}
                              onMouseEnter={() => setHoveredPlanetName(p.name)}
                              onMouseLeave={() => setHoveredPlanetName(null)}
                              className="cursor-pointer"
                            >
                              {isForming && (
                                <circle
                                  cx={pX}
                                  cy={pY - 3}
                                  r="9"
                                  fill="#fef3c7"
                                  stroke="#d97706"
                                  strokeWidth="1.5"
                                  filter="url(#yogaGlow)"
                                />
                              )}
                              <text
                                x={pX}
                                y={pY}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize={isForming ? "11.5" : "9.5"}
                                fontWeight={isForming ? "bold" : "normal"}
                                fill={
                                  isForming 
                                    ? '#78350f' 
                                    : (hoveredPlanetName === p.name ? '#0284c7' : '#57534e')
                                }
                              >
                                {p.name}
                                {p.isRetrograde ? '(व)' : ''}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Quick Chart Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200 dark:border-stone-800 text-[10.5px] text-stone-600 dark:text-stone-400">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400/30 border border-amber-600 inline-block" />
                <span>योग सम्बन्धित भाव ({currentYoga.housesInvolved.map(toDevanagariNumerals).join(', ')})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-200 border border-amber-700 inline-block" />
                <span>योग कारक ग्रह ({currentYoga.formingPlanets.join(', ')})</span>
              </div>
            </div>
          </div>

          {/* RIGHT: INTERACTIVE FORMATION BREAKDOWN & DETAILS TABS */}
          <div className="lg:col-span-7 space-y-4">
            {/* Tabs Header */}
            <div className="flex flex-wrap gap-1.5 border-b border-stone-200 dark:border-stone-800 pb-2">
              <button
                onClick={() => setActiveTab('formation')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'formation'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>१. निर्माणको आधार</span>
              </button>

              <button
                onClick={() => setActiveTab('planets')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'planets'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>२. सहभागी ग्रह स्थिति ({currentYoga.formingPlanets.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('shloka')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'shloka'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>३. शास्त्रीय श्लोक</span>
              </button>

              <button
                onClick={() => setActiveTab('dasha')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'dasha'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>४. फल र सक्रिय समय</span>
              </button>

              <button
                onClick={() => setActiveTab('remedies')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'remedies'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>५. वैदिक उपाय</span>
              </button>
            </div>

            {/* TAB 1: EXACT FORMATION BREAKDOWN */}
            {activeTab === 'formation' && (
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 sm:p-5 shadow-sm space-y-4">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-2.5">
                  <h4 className="text-sm font-bold font-serif text-amber-950 dark:text-amber-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>कुण्डलीमा प्रत्यक्ष निर्माण भएका सर्त तथा आधारहरू</span>
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                    यस जातकको कुण्डलीमा {currentYoga.nameNepali} कसरी निर्मित भएको छ भन्ने प्रत्यक्ष शास्त्रीय विश्लेषण:
                  </p>
                </div>

                <div className="space-y-2.5">
                  {currentYoga.formingCausesNepali && currentYoga.formingCausesNepali.length > 0 ? (
                    currentYoga.formingCausesNepali.map((cause, cIdx) => (
                      <div 
                        key={cIdx}
                        className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 p-3 rounded-xl flex items-start gap-2.5 text-xs text-amber-950 dark:text-amber-200"
                      >
                        <span className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-bold flex items-center justify-center shrink-0 text-[11px]">
                          {toDevanagariNumerals(cIdx + 1)}
                        </span>
                        <div className="leading-relaxed font-serif pt-0.5 font-medium">
                          {cause}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      सम्बन्धित ग्रहहरूको अनुकूल स्थितिले गर्दा योग सक्रिय भएको छ।
                    </p>
                  )}
                </div>

                {/* Overall Description */}
                <div className="bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-serif">
                  <strong className="text-amber-900 dark:text-amber-300 block mb-1 font-bold">योगको शास्त्रीय फलादेश:</strong>
                  {currentYoga.descriptionNepali}
                </div>

                {/* Invalidation/Mitigation notes if any */}
                {currentYoga.cancellationCausesNepali && currentYoga.cancellationCausesNepali.length > 0 && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>सकारात्मक प्रभाव:</strong> {currentYoga.cancellationCausesNepali.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: INVOLVED PLANETS DEEP-DIVE */}
            {activeTab === 'planets' && (
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 sm:p-5 shadow-sm space-y-4">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-2.5">
                  <h4 className="text-sm font-bold font-serif text-amber-950 dark:text-amber-200 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span>योग निर्माणमा प्रत्यक्ष सहभागी ग्रहहरूको विस्तृत स्थिति</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {involvedPlanetsList.map((p) => {
                    const sym = PLANET_SYMBOLS[p.name] || { glyph: '★', color: 'text-amber-600', darkColor: 'text-amber-400', bgLight: 'bg-amber-50', bgDark: 'bg-stone-800' };
                    const lordship = getPlanetLordshipRole(p.name);
                    const formattedDeg = `${toDevanagariNumerals(Math.floor(p.degree || 0))}° ${toDevanagariNumerals(Math.floor(((p.degree || 0) % 1) * 60))}'`;

                    return (
                      <div 
                        key={p.name}
                        className="bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 p-3.5 rounded-xl space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`w-7 h-7 rounded-lg ${sym.bgLight} dark:${sym.bgDark} ${sym.color} dark:${sym.darkColor} flex items-center justify-center font-bold text-sm shadow-2xs`}>
                              {sym.glyph}
                            </span>
                            <div>
                              <strong className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif">{p.name}</strong>
                              <span className="text-[10.5px] text-stone-500 dark:text-stone-400 block">{p.englishName}</span>
                            </div>
                          </div>
                          <span className="text-[11px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                            भाव {toDevanagariNumerals(p.bhava)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 text-[11px] text-stone-700 dark:text-stone-300">
                          <div><strong>राशि:</strong> {p.rashiName} ({formattedDeg})</div>
                          <div><strong>नक्षत्र:</strong> {p.nakshatraName} ({toDevanagariNumerals(p.pada)} पाद)</div>
                          <div><strong>अवस्था:</strong> <span className="font-bold text-amber-700 dark:text-amber-400">{p.dignity}</span></div>
                          <div><strong>गति:</strong> {p.isRetrograde ? 'वक्री (Retro)' : 'मार्गी (Direct)'}</div>
                        </div>

                        <div className="bg-white dark:bg-stone-900 p-2 rounded-lg border border-stone-200 dark:border-stone-700 text-[11px] text-amber-900 dark:text-amber-300 font-medium">
                          <strong>कुण्डली स्वामित्व:</strong> {lordship}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: CLASSICAL PROOF & SHLOKA */}
            {activeTab === 'shloka' && (
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 sm:p-5 shadow-sm space-y-4">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-2.5 flex items-center justify-between">
                  <h4 className="text-sm font-bold font-serif text-amber-950 dark:text-amber-200 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span>शास्त्रीय प्रमाण तथा मूल संस्कृत श्लोक</span>
                  </h4>
                  <span className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full font-bold">
                    {currentYoga.classicalProof?.textNameNepali || 'बृहत्पाराशर होराशास्त्र'}
                  </span>
                </div>

                {/* Sanskrit Shloka Box */}
                <div className="bg-gradient-to-r from-amber-900 via-amber-950 to-stone-950 text-amber-100 p-4 rounded-xl border border-amber-600/70 shadow-inner space-y-2">
                  <div className="text-[11px] text-amber-300 font-bold tracking-wide flex items-center justify-between">
                    <span>{currentYoga.classicalProof?.chapter || 'योगाध्याय'} {currentYoga.classicalProof?.shlokaOrVerse ? `• ${currentYoga.classicalProof.shlokaOrVerse}` : ''}</span>
                    <span className="text-amber-400 font-serif">॥ मूलश्लोकः ॥</span>
                  </div>
                  <p className="font-serif text-sm sm:text-base leading-relaxed text-amber-100 text-center py-2 font-bold select-all">
                    {currentYoga.classicalProof?.originalSanskritText || 'केन्द्रत्रिकोणपतयः सम्बन्धेन परस्परम्। राजयोगं प्रकुर्वन्ति प्रसिद्धं सर्वसम्मतम्॥'}
                  </p>
                </div>

                {/* Nepali Meaning */}
                <div className="bg-amber-50/60 dark:bg-stone-800/80 p-3.5 rounded-xl border border-amber-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-200 leading-relaxed font-serif space-y-1">
                  <strong className="text-amber-900 dark:text-amber-300 block font-bold">नेपाली भावार्थ तथा अन्वय:</strong>
                  <p>{currentYoga.classicalProof?.nepaliMeaningSummary || currentYoga.descriptionNepali}</p>
                </div>
              </div>
            )}

            {/* TAB 4: FRUITION & DASHA TIMING */}
            {activeTab === 'dasha' && (
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 sm:p-5 shadow-sm space-y-4">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-2.5">
                  <h4 className="text-sm font-bold font-serif text-amber-950 dark:text-amber-200 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-600" />
                    <span>फल प्राप्ति तथा विंशोत्तरी दशा सक्रियता</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-stone-50 dark:bg-stone-800/80 p-3.5 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1.5">
                    <strong className="text-amber-800 dark:text-amber-300 block font-bold">सक्रिय गराउने दशा:</strong>
                    <p className="text-[11.5px] text-stone-700 dark:text-stone-300 font-serif leading-relaxed">
                      यो योग निर्माण गर्ने ग्रहहरू <strong className="text-amber-900 dark:text-amber-200 font-bold">{currentYoga.formingPlanets.join(', ')}</strong> को विंशोत्तरी महादशा वा अन्तर्दशाको समयमा यसको सम्पूर्ण शुभ फल प्रत्यक्ष रूपमा प्राप्त हुन्छ।
                    </p>
                  </div>

                  <div className="bg-stone-50 dark:bg-stone-800/80 p-3.5 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1.5">
                    <strong className="text-emerald-800 dark:text-emerald-300 block font-bold">वर्तमान दशा स्थिति:</strong>
                    <p className="text-[11.5px] text-stone-700 dark:text-stone-300 font-serif leading-relaxed">
                      {dasha?.currentMahadasha ? (
                        <>चालू महादशा: <strong>{dasha.currentMahadasha.planet}</strong> | अन्तर्दशा: <strong>{dasha.currentAntardasha?.planet || '--'}</strong></>
                      ) : (
                        'दशा समन्वय सक्रिय छ।'
                      )}
                    </p>
                  </div>
                </div>

                {/* Primary Life Impacts */}
                <div className="bg-amber-50/40 dark:bg-stone-800/50 p-3.5 rounded-xl border border-amber-200 dark:border-stone-700 text-xs space-y-2">
                  <strong className="text-amber-900 dark:text-amber-300 block font-bold">प्रभावित हुने मुख्य जीवन क्षेत्रहरू:</strong>
                  <div className="flex flex-wrap gap-1.5">
                    {['पद र प्रतिष्ठा', 'बौद्धिक नेतृत्व', 'आर्थिक सम्पन्नता', 'पारिवारिक सुख', 'आध्यात्मिक उन्नति'].map((area, idx) => (
                      <span key={idx} className="bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 px-2.5 py-1 rounded-lg text-[11px] font-medium shadow-2xs">
                        ✦ {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: VEDIC ACTIVATION REMEDIES */}
            {activeTab === 'remedies' && (
              <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 sm:p-5 shadow-sm space-y-4">
                <div className="border-b border-stone-200 dark:border-stone-800 pb-2.5">
                  <h4 className="text-sm font-bold font-serif text-amber-950 dark:text-amber-200 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>योग प्रवर्धन तथा वैदिक सक्रियीकरण उपायहरू</span>
                  </h4>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-3 rounded-xl space-y-1">
                    <strong className="text-amber-900 dark:text-amber-300 font-bold block">१. मन्त्र साधना:</strong>
                    <p className="text-[11.5px] text-stone-700 dark:text-stone-300 font-serif leading-relaxed">
                      योगकारक ग्रह {currentYoga.formingPlanets[0] || 'लग्नेश'} को गायत्री वा वैदिक मन्त्र दैनिक १०८ पटक जप गर्नाले योगको शक्ति थप प्रदीप्त हुन्छ।
                    </p>
                  </div>

                  <div className="bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 p-3 rounded-xl space-y-1">
                    <strong className="text-stone-900 dark:text-stone-100 font-bold block">२. धार्मिक तथा सामाजिक सेवा:</strong>
                    <p className="text-[11.5px] text-stone-700 dark:text-stone-300 font-serif leading-relaxed">
                      विद्यार्थीहरूलाई सहयोग, ज्ञान दान तथा मन्दिर/धार्मिक स्थलमा सेवा गर्नाले बृहस्पति तथा सूर्यका शुभ योगहरू तत्काल फलदायी बन्दछन्।
                    </p>
                  </div>

                  <div className="bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 p-3 rounded-xl space-y-1">
                    <strong className="text-stone-900 dark:text-stone-100 font-bold block">३. आचरण तथा जीवनशैली:</strong>
                    <p className="text-[11.5px] text-stone-700 dark:text-stone-300 font-serif leading-relaxed">
                      सत्यवादिता, प्रातः कालीन सूर्य नमस्कार, र गुरुजनहरूको सम्मान नै राजयोग र धनयोगको फल प्राप्त गर्ने मुख्य प्राकृतिक उपाय हो।
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. CATEGORY FILTER CHIPS */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-stone-600 dark:text-stone-400 flex items-center gap-1.5 mr-1">
          <Filter className="w-3.5 h-3.5 text-amber-600" />
          <span>योग वर्ग:</span>
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-amber-700 text-white font-bold shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700'
            }`}
          >
            {cat} {cat === 'सबै' ? `(${yogas.length})` : ''}
          </button>
        ))}
      </div>

      {/* 2. INTERACTIVE YOGA CARDS LIST (CLICKABLE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredYogas.map((yoga) => {
          const isSelected = yoga.id === selectedYogaId;

          return (
            <div
              key={yoga.id}
              onClick={() => setSelectedYogaId(yoga.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-500 shadow-md ring-2 ring-amber-400/50'
                  : 'bg-white dark:bg-stone-900 border-[#E6E0D5] dark:border-stone-800 hover:border-amber-400/80 hover:bg-amber-50/40 dark:hover:bg-stone-800/60 shadow-2xs'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                  <div className="absolute transform rotate-45 bg-amber-500 text-white font-bold text-[9px] py-0.5 right-[-35px] top-[18px] w-[120px] text-center shadow-xs">
                    चयनित
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md inline-block mb-1">
                    {yoga.category}
                  </span>
                  <h4 className="text-sm font-bold font-serif text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition">
                    {yoga.nameNepali}
                  </h4>
                </div>

                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full shrink-0">
                  {toDevanagariNumerals(yoga.strengthPercentage)}%
                </span>
              </div>

              {/* Quick planetary badges */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <span className="text-[10.5px] text-stone-500 dark:text-stone-400 font-medium">कारक:</span>
                {yoga.formingPlanets.map((pName) => (
                  <span 
                    key={pName} 
                    className="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 px-1.5 py-0.5 rounded text-[10.5px] font-bold"
                  >
                    {pName}
                  </span>
                ))}
                {yoga.housesInvolved.length > 0 && (
                  <span className="text-[10.5px] text-amber-700 dark:text-amber-400 font-medium ml-auto">
                    भाव {yoga.housesInvolved.map(toDevanagariNumerals).join(', ')}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-amber-800 dark:text-amber-300 pt-2.5 mt-2.5 border-t border-stone-200/70 dark:border-stone-800/80 font-medium">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>विस्तृत संरचना हेर्नुहोस्</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. VISUAL BREAKDOWN STAGE (INLINE FOR CURRENTLY SELECTED YOGA) */}
      {currentYoga && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-amber-300 dark:border-stone-800 p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
            <h3 className="text-base font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>प्रत्यक्ष योग संरचना विश्लेषण: <span className="text-amber-700 dark:text-amber-400">{currentYoga.nameNepali}</span></span>
            </h3>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-amber-100 hover:bg-amber-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-stone-600 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="पूर्ण दृश्य / Full Screen Modal"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">पूर्ण दृश्य</span>
            </button>
          </div>

          {renderBreakdownContent(false)}
        </div>
      )}

      {/* 4. FULLSCREEN / MODAL VIEW */}
      {isModalOpen && currentYoga && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-[#FAF8F5] dark:bg-stone-900 border-2 border-amber-500 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-900 via-amber-950 to-stone-950 text-white flex items-center justify-between border-b border-amber-700">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-bold text-lg text-amber-300">
                  ॐ
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold font-serif text-amber-100">
                    इन्टरएक्टिभ योग संरचना तथा ग्रह विश्लेषण
                  </h3>
                  <p className="text-[11px] text-amber-200/80">
                    {currentYoga.nameNepali} ({currentYoga.category}) • जन्मकुण्डली प्रत्यक्ष प्रमाण
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 bg-stone-800/80 hover:bg-stone-700 text-stone-200 rounded-xl text-xs transition cursor-pointer"
                  title="प्रिन्ट गर्नुहोस्"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 bg-stone-800/80 hover:bg-stone-700 text-stone-200 rounded-xl text-xs transition cursor-pointer"
                  title="बन्द गर्नुहोस्"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-white dark:bg-stone-900 space-y-6">
              {renderBreakdownContent(true)}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-stone-100 dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
              <span>बालानन्द वैदिक ज्योतिष गणना प्रणाली</span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900 rounded-xl font-bold hover:bg-black transition cursor-pointer"
              >
                बन्द गर्नुहोस् (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
