import React, { useState, useMemo, useCallback } from 'react';
import { Sparkles, Eye, Info } from 'lucide-react';
import { LagnaInfo, PlanetPosition, RashiName, PlanetName } from '../types/astrology';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import {
  calculateSinglePlanetAspects,
  calculateAspectArrowPath,
  formatPlanetDegreesMinutes
} from '../utils/aspectEngine';
import { HouseDetailModal } from './HouseDetailModal';
import { usePinchZoomPan } from '../hooks/usePinchZoomPan';
import { KundaliZoomControls } from './jyotish/KundaliZoomControls';

export interface ChartHouseData {
  houseNumber: number;
  rashiId?: number;
  rashiName?: RashiName;
  rashiLord?: string;
  planets: PlanetPosition[];
}

export interface KundaliChartProps {
  houses?: ChartHouseData[];
  lagna?: LagnaInfo;
  planets?: PlanetPosition[];
  chartTitle?: string;
  showAspectArrows?: boolean;
  onPlanetClick?: (planet: PlanetPosition, houseNumber: number) => void;
  onHouseClick?: (houseNumber: number) => void;
  className?: string;
}

const RASHI_NAME_MAP: Record<number, RashiName> = {
  1: 'मेष', 2: 'वृष', 3: 'मिथुन', 4: 'कर्कट', 5: 'सिंह', 6: 'कन्या',
  7: 'तुला', 8: 'वृश्चिक', 9: 'धनु', 10: 'मकर', 11: 'कुम्भ', 12: 'मीन',
};

// House Polygons in 400x400 SVG canvas
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

interface HouseAnchor {
  rashiX: number;
  rashiY: number;
  planetX: number;
  planetY: number;
  stepY: number;
}

const HOUSE_ANCHORS: Record<number, HouseAnchor> = {
  1:  { rashiX: 200, rashiY: 34,  planetX: 200, planetY: 72,  stepY: 18 },
  2:  { rashiX: 104, rashiY: 22,  planetX: 104, planetY: 52,  stepY: 17 },
  3:  { rashiX: 28,  rashiY: 65,  planetX: 42,  planetY: 104, stepY: 18 },
  4:  { rashiX: 104, rashiY: 148, planetX: 104, planetY: 186, stepY: 18 },
  5:  { rashiX: 28,  rashiY: 236, planetX: 44,  planetY: 278, stepY: 18 },
  6:  { rashiX: 104, rashiY: 320, planetX: 104, planetY: 354, stepY: 18 },
  7:  { rashiX: 200, rashiY: 244, planetX: 200, planetY: 280, stepY: 18 },
  8:  { rashiX: 296, rashiY: 320, planetX: 296, planetY: 354, stepY: 18 },
  9:  { rashiX: 372, rashiY: 236, planetX: 356, planetY: 278, stepY: 18 },
  10: { rashiX: 296, rashiY: 148, planetX: 296, planetY: 186, stepY: 18 },
  11: { rashiX: 372, rashiY: 65,  planetX: 356, planetY: 104, stepY: 18 },
  12: { rashiX: 296, rashiY: 22,  planetX: 296, planetY: 52,  stepY: 17 },
};

// Calculate aspect target house numbers for a given planet sitting in house H_src
export function getAspectTargetHouses(planetName: string, srcHouse: number): number[] {
  const norm = (h: number) => ((h - 1) % 12) + 1;
  const pName = planetName.trim();

  // Common 7th aspect for all planets
  const aspects: number[] = [norm(srcHouse + 6)];

  if (pName === 'मंगल' || pName === 'Mars') {
    aspects.push(norm(srcHouse + 3), norm(srcHouse + 7));
  } else if (pName === 'गुरु' || pName === 'Jupiter' || pName === 'राहु' || pName === 'Rahu' || pName === 'केतु' || pName === 'Ketu') {
    aspects.push(norm(srcHouse + 4), norm(srcHouse + 8));
  } else if (pName === 'शनि' || pName === 'Saturn') {
    aspects.push(norm(srcHouse + 2), norm(srcHouse + 9));
  }

  return Array.from(new Set(aspects));
}

export const KundaliChart: React.FC<KundaliChartProps> = ({
  houses: propHouses,
  lagna,
  planets: propPlanets = [],
  chartTitle = 'जन्मकुण्डली',
  showAspectArrows = true,
  onPlanetClick,
  onHouseClick,
  className = '',
}) => {
  // 1. React State for hovered planet and hovered house
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetPosition | null>(null);
  const [hoveredHouse, setHoveredHouse] = useState<number | null>(null);
  const [selectedHouseModal, setSelectedHouseModal] = useState<number | null>(null);

  // Mobile pinch-to-zoom & pan interactions
  const {
    containerRef,
    scale,
    isZoomed,
    zoomIn,
    zoomOut,
    resetZoom,
    hasDragged,
    transformStyle,
  } = usePinchZoomPan({
    minScale: 1.0,
    maxScale: 4.0,
    doubleTapZoom: 2.2,
  });

  // Normalize houses data
  const normalizedHouses = useMemo(() => {
    if (propHouses && propHouses.length > 0) {
      return propHouses;
    }

    const lagnaRashiId = lagna?.rashiId || 1;
    const map: Record<number, ChartHouseData> = {};

    for (let h = 1; h <= 12; h++) {
      const rId = ((lagnaRashiId - 1 + h - 1) % 12) + 1;
      map[h] = {
        houseNumber: h,
        rashiId: rId,
        rashiName: RASHI_NAME_MAP[rId] || 'मेष',
        planets: [],
      };
    }

    if (lagna) {
      map[1].planets.push({
        id: 'lagna_marker',
        name: 'सूर्य' as PlanetName, // placeholder name compatible with PlanetName type
        englishName: 'Lagna',
        symbol: 'ल',
        longitude: 0,
        degree: Math.floor(lagna.degree || 0),
        minutes: Math.floor(((lagna.degree || 0) - Math.floor(lagna.degree || 0)) * 60),
        seconds: 0,
        formattedDegree: `${toDevanagariNumerals(Math.floor(lagna.degree || 0))}°`,
        rashiId: lagna.rashiId,
        rashiName: lagna.rashiName,
        nakshatraId: 1,
        nakshatraName: lagna.nakshatraName,
        nakshatraLord: '',
        pada: lagna.pada,
        bhava: 1,
        speed: 0,
        isRetrograde: false,
        isCombust: false,
        dignity: 'स्वक्षेत्र',
      });
    }

    propPlanets.forEach((p) => {
      let houseNum = p.bhava;
      if (!houseNum || houseNum < 1 || houseNum > 12) {
        houseNum = ((p.rashiId - lagnaRashiId + 12) % 12) + 1;
      }
      if (map[houseNum]) {
        map[houseNum].planets.push(p);
      }
    });

    return Object.values(map);
  }, [propHouses, lagna, propPlanets]);

  const allPlanetsList = useMemo(() => {
    const list: PlanetPosition[] = [];
    normalizedHouses.forEach((h) => {
      h.planets.forEach((p) => {
        if (p.id !== 'lagna_marker') list.push(p);
      });
    });
    return list;
  }, [normalizedHouses]);

  // Compute set of highlighted house numbers based on hover state
  const highlightedHouseSet = useMemo(() => {
    if (!hoveredPlanet && !hoveredHouse) {
      return new Set<number>();
    }

    const set = new Set<number>();

    if (hoveredPlanet && hoveredPlanet.id !== 'lagna_marker') {
      const srcHouse = hoveredPlanet.bhava;
      set.add(srcHouse);

      const aspectedTargets = getAspectTargetHouses(hoveredPlanet.name, srcHouse);
      aspectedTargets.forEach((t) => set.add(t));
    } else if (hoveredHouse) {
      set.add(hoveredHouse);

      allPlanetsList.forEach((p) => {
        const pAspects = getAspectTargetHouses(p.name, p.bhava);
        if (pAspects.includes(hoveredHouse)) {
          set.add(p.bhava);
        }
      });

      const houseData = normalizedHouses.find((h) => h.houseNumber === hoveredHouse);
      if (houseData) {
        houseData.planets.forEach((p) => {
          if (p.id !== 'lagna_marker') {
            const targets = getAspectTargetHouses(p.name, hoveredHouse);
            targets.forEach((t) => set.add(t));
          }
        });
      }
    }

    return set;
  }, [hoveredPlanet, hoveredHouse, allPlanetsList, normalizedHouses]);

  // Calculate Aspect Arrows for SVG
  const aspectArrows = useMemo(() => {
    if (!showAspectArrows || (!hoveredPlanet && !hoveredHouse)) {
      return [];
    }

    const arrows: Array<{ pathD: string; sourceHouse: number; targetHouse: number }> = [];

    if (hoveredPlanet && hoveredPlanet.id !== 'lagna_marker') {
      const srcHouse = hoveredPlanet.bhava;
      const aspects = calculateSinglePlanetAspects(hoveredPlanet, srcHouse, normalizedHouses);

      aspects.forEach((asp, idx) => {
        const arrowGeo = calculateAspectArrowPath(srcHouse, asp.targetHouseNumber, idx, aspects.length);
        if (arrowGeo) {
          arrows.push({
            pathD: arrowGeo.pathD,
            sourceHouse: srcHouse,
            targetHouse: asp.targetHouseNumber,
          });
        }
      });
    } else if (hoveredHouse) {
      allPlanetsList.forEach((p) => {
        const srcHouse = p.bhava;
        const pAspects = calculateSinglePlanetAspects(p, srcHouse, normalizedHouses);
        const match = pAspects.find((a) => a.targetHouseNumber === hoveredHouse);

        if (match) {
          const arrowGeo = calculateAspectArrowPath(srcHouse, hoveredHouse, 0, 1);
          if (arrowGeo) {
            arrows.push({
              pathD: arrowGeo.pathD,
              sourceHouse: srcHouse,
              targetHouse: hoveredHouse,
            });
          }
        }
      });
    }

    return arrows;
  }, [showAspectArrows, hoveredPlanet, hoveredHouse, normalizedHouses, allPlanetsList]);

  // Determine if a house should be highlighted or dimmed
  const isAnyHovered = Boolean(hoveredPlanet || hoveredHouse);

  const getHouseOpacityClass = useCallback(
    (houseNum: number) => {
      if (!isAnyHovered) return 'opacity-100';
      return highlightedHouseSet.has(houseNum) ? 'opacity-100' : 'opacity-20';
    },
    [isAnyHovered, highlightedHouseSet]
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-[460px] aspect-square mx-auto bg-[#FFFDF9] dark:bg-stone-950 p-2.5 rounded-2xl border-2 border-[#E6E0D5] dark:border-stone-800 shadow-sm overflow-hidden select-none ${className}`}
    >
      {/* Title */}
      {chartTitle && (
        <div className="absolute top-1.5 inset-x-0 text-center pointer-events-none z-10">
          <span className="text-[11px] font-serif font-black text-[#7A1C1C] dark:text-amber-400 tracking-wider">
            {chartTitle}
          </span>
        </div>
      )}

      {/* Viewport Transform Container for Pinch-to-zoom & Pan */}
      <div className="w-full h-full flex items-center justify-center origin-center" style={transformStyle}>
        <svg viewBox="0 0 400 400" className="w-full h-full stroke-[#7A1C1C] dark:stroke-amber-500 fill-none stroke-[1.6]">
        <defs>
          <marker
            id="kundaliAspectArrow"
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 9 5 L 0 8.5 z" className="fill-amber-600 dark:fill-amber-400" />
          </marker>
        </defs>

        {/* Outer Chart Framework */}
        <rect x="8" y="8" width="384" height="384" rx="4" className="stroke-[#7A1C1C] dark:stroke-amber-400 stroke-[2.5] pointer-events-none" />
        <line x1="8" y1="8" x2="392" y2="392" className="pointer-events-none" />
        <line x1="392" y1="8" x2="8" y2="392" className="pointer-events-none" />
        <polygon points="200,8 392,200 200,392 8,200" className="stroke-[#7A1C1C] dark:stroke-amber-400 stroke-[2] pointer-events-none" />

        {/* House Polygons with Opacity Highlighting */}
        {normalizedHouses.map((hData) => {
          const hNum = hData.houseNumber;
          const polyPoints = HOUSE_POLYGONS[hNum];
          if (!polyPoints) return null;

          const opacityClass = getHouseOpacityClass(hNum);
          const isDirectlyHovered = hoveredHouse === hNum;

          return (
            <polygon
              key={`house-polygon-${hNum}`}
              points={polyPoints}
              onMouseEnter={() => setHoveredHouse(hNum)}
              onMouseLeave={() => setHoveredHouse(null)}
              onClick={() => {
                if (hasDragged()) return;
                if (onHouseClick) onHouseClick(hNum);
                else setSelectedHouseModal(hNum);
              }}
              className={`transition-opacity duration-200 cursor-pointer ${opacityClass} ${
                isDirectlyHovered
                  ? 'fill-amber-200/40 dark:fill-amber-900/40 stroke-amber-600 dark:stroke-amber-300 stroke-[2.2]'
                  : 'fill-transparent hover:fill-amber-100/30 dark:hover:fill-amber-950/30'
              }`}
            />
          );
        })}

        {/* Temporary Dynamic Aspect Arrows */}
        {aspectArrows.map((a, idx) => (
          <path
            key={`aspect-arrow-${idx}`}
            d={a.pathD}
            className="stroke-amber-600 dark:stroke-amber-400 stroke-[1.6] fill-none pointer-events-none transition-all duration-200"
            style={{
              strokeDasharray: '4, 3',
              animation: 'dash 1.2s linear infinite',
            }}
            markerEnd="url(#kundaliAspectArrow)"
          />
        ))}

        {/* House Content (Rashis and Planets) with Opacity Highlighting */}
        {normalizedHouses.map((hData) => {
          const hNum = hData.houseNumber;
          const anchor = HOUSE_ANCHORS[hNum];
          if (!anchor) return null;

          const opacityClass = getHouseOpacityClass(hNum);

          return (
            <g
              key={`house-content-group-${hNum}`}
              className={`transition-opacity duration-200 ${opacityClass}`}
            >
              {/* Rashi Numeral */}
              <text
                x={anchor.rashiX}
                y={anchor.rashiY}
                textAnchor="middle"
                dominantBaseline="central"
                onMouseEnter={() => setHoveredHouse(hNum)}
                onMouseLeave={() => setHoveredHouse(null)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setSelectedHouseModal(hNum);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onHouseClick) onHouseClick(hNum);
                  else setSelectedHouseModal(hNum);
                }}
                className="fill-[#7A1C1C] dark:fill-amber-400 font-serif font-black text-[14px] stroke-none cursor-pointer hover:fill-amber-600 transition-colors"
              >
                {toDevanagariNumerals(hData.rashiId || hNum)}
              </text>

              {/* Planets */}
              {hData.planets.map((p, pIdx) => {
                const planetY = anchor.planetY + pIdx * anchor.stepY;
                const isThisPlanetHovered = hoveredPlanet?.id === p.id;
                const formattedDeg = formatPlanetDegreesMinutes(p);

                const displayName = p.id === 'lagna_marker' ? 'लग्न' : p.name;

                return (
                  <text
                    key={`planet-${p.id || pIdx}-${pIdx}`}
                    x={anchor.planetX}
                    y={planetY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    onMouseEnter={(e) => {
                      e.stopPropagation();
                      setHoveredPlanet(p);
                    }}
                    onMouseLeave={(e) => {
                      e.stopPropagation();
                      setHoveredPlanet(null);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (hasDragged()) return;
                      if (onPlanetClick) onPlanetClick(p, hNum);
                    }}
                    className={`font-sans font-bold text-[11.5px] stroke-none cursor-pointer transition-all duration-150 ${
                      isThisPlanetHovered
                        ? 'fill-amber-600 dark:fill-amber-300 font-black underline text-[12.5px]'
                        : 'fill-[#7A1C1C] dark:fill-amber-200 hover:fill-amber-600'
                    }`}
                  >
                    {displayName} {formattedDeg ? `${formattedDeg}` : ''} {p.isRetrograde ? '(व)' : ''}
                  </text>
                );
              })}
            </g>
          );
        })}
      </svg>
      </div>

      {/* Floating Zoom & Pan Controls for Mobile/Desktop */}
      <KundaliZoomControls
        scale={scale}
        isZoomed={isZoomed}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
      />

      {/* House/Bhava Detail Modal on Double Click / Click */}
      {selectedHouseModal !== null && (
        <HouseDetailModal
          isOpen={selectedHouseModal !== null}
          onClose={() => setSelectedHouseModal(null)}
          houseNumber={selectedHouseModal}
          onChangeHouse={(newH) => setSelectedHouseModal(newH)}
          allHouses={normalizedHouses as any}
          chartTitle={chartTitle}
        />
      )}
    </div>
  );
};

export default KundaliChart;

