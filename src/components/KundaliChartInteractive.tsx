import React, { useState, useMemo, useCallback } from 'react';
import { Sparkles, Eye, Info, X, Compass, Moon, Sun, Shield, Award } from 'lucide-react';
import { LagnaInfo, PlanetPosition, RashiName, PlanetName } from '../types/astrology';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import {
  calculateSinglePlanetAspects,
  calculateAspectArrowPath,
  formatPlanetDegreesMinutes,
  getPlanetStatusSuffix,
  CalculatedAspectItem
} from '../utils/aspectEngine';
import { HouseDetailModal } from './HouseDetailModal';

export interface ChartHouseData {
  houseNumber: number;
  rashiId?: number;
  rashiName?: RashiName;
  rashiLord?: string;
  planets: PlanetPosition[];
}

export interface KundaliChartInteractiveProps {
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

const HOUSE_NAMES: Record<number, string> = {
  1: 'प्रथम भाव (लग्न - तनु भाव)',
  2: 'द्वितीय भाव (धन - कुटुम्ब भाव)',
  3: 'तृतीय भाव (सहज - पराक्रम भाव)',
  4: 'चतुर्थ भाव (सुख - मातृ भाव)',
  5: 'पञ्चम भाव (पुत्र - बुद्धि भाव)',
  6: 'षष्ठ भाव (रिपु - रोग भाव)',
  7: 'सप्तम भाव (युवती - जाया भाव)',
  8: 'अष्टम भाव (रन्ध्र - आयु भाव)',
  9: 'नवम भाव (धर्म - भाग्य भाव)',
  10: 'दशम भाव (कर्म - राज्य भाव)',
  11: 'एकादश भाव (आय - लाभ भाव)',
  12: 'द्वादश भाव (व्यय - मोक्ष भाव)',
};

const HOUSE_DESCRIPTIONS: Record<number, string> = {
  1: 'शारीरिक बनावट, व्यक्तित्व, स्वभाव, स्वास्थ्य, आत्मबल र जीवन दृष्टिकोण।',
  2: 'पैतृक सम्पत्ति, धन सञ्चय, वाणी, परिवार, प्राथमिक शिक्षा र खानपान।',
  3: 'भाइबहिनी, साहस, पराक्रम, छोटो यात्रा, सञ्चार र कला-कौशल।',
  4: 'माता, गृह सुख, जग्गा-जमीन, वाहन, मानसिक शान्ति र मातृभूमि।',
  5: 'सन्तान सुख, उच्च शिक्षा, बुद्धि, विवेक, पूर्वजन्मको पुण्य र प्रेम सम्बन्ध।',
  6: 'ऋण, रोग, शत्रु, प्रतिस्पर्धा, मामाघर, सेवा र मुद्दा-मामिला।',
  7: 'वैवाहिक जीवन, जीवनसाथी, व्यापारिक साझेदारी, रोजगारी र कामवासना।',
  8: 'आयु, गुप्त ज्ञान, अनुसन्धान, अचानक लाभ-हानि, कष्ट र संकट।',
  9: 'भाग्य, धर्म, गुरु, उच्च ज्ञान, लामो धार्मिक यात्रा र सदाचार।',
  10: 'कारोबार, पेशा, कर्म, प्रतिष्ठा, अधिकार, पिता र सामाजिक स्थिति।',
  11: 'आम्दानी, लाभ, ज्येष्ठ भाइबहिनी, इच्छा पूर्ति र मित्रमण्डल।',
  12: 'खर्च, विदेश यात्रा, मोक्ष, अस्पताल वास, निद्रा र त्याग।',
};

// House Polygons in 400x400 SVG coordinate system
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

export const KundaliChartInteractive: React.FC<KundaliChartInteractiveProps> = ({
  houses: propHouses,
  lagna,
  planets: propPlanets = [],
  chartTitle = 'मुख्य जन्मकुण्डली',
  showAspectArrows = true,
  onPlanetClick,
  onHouseClick,
  className = '',
}) => {
  // React States for interactive hover & modal popups
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetPosition | null>(null);
  const [hoveredHouse, setHoveredHouse] = useState<number | null>(null);
  const [modalPlanet, setModalPlanet] = useState<{ planet: PlanetPosition; houseNumber: number } | null>(null);
  const [modalHouse, setModalHouse] = useState<number | null>(null);


  // Normalize house mapping
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
        name: 'सूर्य' as PlanetName,
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

  const housesMap = useMemo(() => {
    const map: Record<number, ChartHouseData> = {};
    normalizedHouses.forEach((h) => {
      map[h.houseNumber] = h;
    });
    return map;
  }, [normalizedHouses]);

  const allPlanetsList = useMemo(() => {
    const list: PlanetPosition[] = [];
    normalizedHouses.forEach((h) => {
      h.planets.forEach((p) => {
        if (p.id !== 'lagna_marker') list.push(p);
      });
    });
    return list;
  }, [normalizedHouses]);

  // Dynamic aspect arrows starting EXACTLY from hovered planet coordinates
  const aspectArrows = useMemo(() => {
    if (!showAspectArrows || (!hoveredPlanet && !hoveredHouse)) {
      return [];
    }

    const arrows: Array<{
      pathD: string;
      sourceHouse: number;
      targetHouse: number;
      aspectItem: CalculatedAspectItem;
    }> = [];

    if (hoveredPlanet && hoveredPlanet.id !== 'lagna_marker') {
      const srcHouse = hoveredPlanet.bhava;
      const aspects = calculateSinglePlanetAspects(hoveredPlanet, srcHouse, normalizedHouses);
      const anchor = HOUSE_ANCHORS[srcHouse];
      const hPlanets = housesMap[srcHouse]?.planets || [];
      const pIdx = Math.max(0, hPlanets.findIndex((p) => p.id === hoveredPlanet.id));

      const planetCoords = anchor
        ? { x: anchor.planetX, y: anchor.planetY + pIdx * anchor.stepY }
        : undefined;

      aspects.forEach((asp, idx) => {
        const arrowGeo = calculateAspectArrowPath(srcHouse, asp.targetHouseNumber, idx, aspects.length, planetCoords);
        if (arrowGeo) {
          arrows.push({
            pathD: arrowGeo.pathD,
            sourceHouse: srcHouse,
            targetHouse: asp.targetHouseNumber,
            aspectItem: asp,
          });
        }
      });
    } else if (hoveredHouse) {
      allPlanetsList.forEach((p) => {
        const srcHouse = p.bhava;
        const pAspects = calculateSinglePlanetAspects(p, srcHouse, normalizedHouses);
        const match = pAspects.find((a) => a.targetHouseNumber === hoveredHouse);

        if (match) {
          const anchor = HOUSE_ANCHORS[srcHouse];
          const hPlanets = housesMap[srcHouse]?.planets || [];
          const pIdx = Math.max(0, hPlanets.findIndex((item) => item.id === p.id));
          const planetCoords = anchor
            ? { x: anchor.planetX, y: anchor.planetY + pIdx * anchor.stepY }
            : undefined;

          const arrowGeo = calculateAspectArrowPath(srcHouse, hoveredHouse, 0, 1, planetCoords);
          if (arrowGeo) {
            arrows.push({
              pathD: arrowGeo.pathD,
              sourceHouse: srcHouse,
              targetHouse: hoveredHouse,
              aspectItem: match,
            });
          }
        }
      });
    }

    return arrows;
  }, [showAspectArrows, hoveredPlanet, hoveredHouse, normalizedHouses, housesMap, allPlanetsList]);

  // Set of aspected houses to highlight
  const aspectedHousesSet = useMemo(() => {
    if (!hoveredPlanet && !hoveredHouse) return new Set<number>();
    const set = new Set<number>();

    if (hoveredPlanet && hoveredPlanet.id !== 'lagna_marker') {
      set.add(hoveredPlanet.bhava);
      aspectArrows.forEach((a) => set.add(a.targetHouse));
    } else if (hoveredHouse) {
      set.add(hoveredHouse);
      aspectArrows.forEach((a) => set.add(a.sourceHouse));
    }

    return set;
  }, [hoveredPlanet, hoveredHouse, aspectArrows]);

  const isAnyHovered = Boolean(hoveredPlanet || hoveredHouse);

  const getHouseOpacityClass = useCallback(
    (houseNum: number) => {
      if (!isAnyHovered) return 'opacity-100';
      return aspectedHousesSet.has(houseNum) ? 'opacity-100' : 'opacity-20';
    },
    [isAnyHovered, aspectedHousesSet]
  );

  return (
    <div
      className={`relative w-full max-w-[660px] aspect-square mx-auto bg-[#FFFDF9] dark:bg-stone-950 p-3 sm:p-4 rounded-2xl border-2 border-[#E6E0D5] dark:border-stone-800 shadow-md overflow-hidden select-none ${className}`}
    >
      {/* Title Badge */}
      {chartTitle && (
        <div className="absolute top-2 inset-x-0 text-center pointer-events-none z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#7A1C1C]/10 dark:bg-amber-400/10 text-[12px] font-serif font-black text-[#7A1C1C] dark:text-amber-400 tracking-wider uppercase border border-[#7A1C1C]/20 dark:border-amber-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            {chartTitle}
          </span>
        </div>
      )}

      <svg viewBox="0 0 400 400" className="w-full h-full stroke-[#7A1C1C] dark:stroke-amber-500 fill-none stroke-[1.6]">
        <defs>
          <marker
            id="interactiveKundaliAspectArrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 9 5 L 0 8.5 z" className="fill-amber-600 dark:fill-amber-400 stroke-none" />
          </marker>
        </defs>

        {/* Outer Frame */}
        <rect x="8" y="8" width="384" height="384" rx="4" className="stroke-[#7A1C1C] dark:stroke-amber-400 stroke-[2.5] pointer-events-none" />
        <line x1="8" y1="8" x2="392" y2="392" className="pointer-events-none" />
        <line x1="392" y1="8" x2="8" y2="392" className="pointer-events-none" />
        <polygon points="200,8 392,200 200,392 8,200" className="stroke-[#7A1C1C] dark:stroke-amber-400 stroke-[2] pointer-events-none" />

        {/* House Polygons with Highlighting */}
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
                setModalHouse(hNum);
                if (onHouseClick) onHouseClick(hNum);
              }}
              className={`transition-opacity duration-200 cursor-pointer ${opacityClass} ${
                isDirectlyHovered
                  ? 'fill-amber-200/40 dark:fill-amber-900/40 stroke-amber-600 dark:stroke-amber-300 stroke-[2.2]'
                  : 'fill-transparent hover:fill-amber-100/30 dark:hover:fill-amber-950/30'
              }`}
            />
          );
        })}

        {/* Dynamic Aspect Arrows */}
        {aspectArrows.map((a, idx) => (
          <path
            key={`aspect-arrow-${idx}`}
            d={a.pathD}
            className="stroke-amber-600 dark:stroke-amber-400 stroke-[1.8] fill-none pointer-events-none transition-all duration-200"
            style={{
              strokeDasharray: '4, 3',
            }}
            markerEnd="url(#interactiveKundaliAspectArrow)"
          />
        ))}

        {/* House Content (Rashis and Planets) */}
        {normalizedHouses.map((hData) => {
          const hNum = hData.houseNumber;
          const anchor = HOUSE_ANCHORS[hNum];
          if (!anchor) return null;

          const opacityClass = getHouseOpacityClass(hNum);

          return (
            <g
              key={`house-content-${hNum}`}
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
                onClick={() => {
                  setModalHouse(hNum);
                  if (onHouseClick) onHouseClick(hNum);
                }}
                className="fill-[#7A1C1C] dark:fill-amber-400 font-serif font-black text-[14px] stroke-none cursor-pointer"
              >
                {toDevanagariNumerals(hData.rashiId || hNum)}
              </text>

              {/* Planets */}
              {hData.planets.map((p, pIdx) => {
                const planetY = anchor.planetY + pIdx * anchor.stepY;
                const isThisPlanetHovered = hoveredPlanet?.id === p.id;
                const formattedDeg = formatPlanetDegreesMinutes(p);
                const displayName = p.id === 'lagna_marker' ? 'लग्न' : p.name;
                const statusSuffix = p.id === 'lagna_marker' ? '' : getPlanetStatusSuffix(p);

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
                      if (p.id !== 'lagna_marker') {
                        setModalPlanet({ planet: p, houseNumber: hNum });
                      } else {
                        setModalHouse(1);
                      }
                      if (onPlanetClick) onPlanetClick(p, hNum);
                    }}
                    className={`font-sans font-bold text-[11.5px] stroke-none cursor-pointer transition-all duration-150 ${
                      isThisPlanetHovered
                        ? 'fill-amber-600 dark:fill-amber-300 font-black text-[12.5px]'
                        : 'fill-[#7A1C1C] dark:fill-amber-200 hover:fill-amber-600'
                    }`}
                  >
                    {displayName} {formattedDeg} {statusSuffix}
                  </text>
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Planet Detail Modal on Click */}
      {modalPlanet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FFFDF9] dark:bg-stone-900 border-2 border-[#7A1C1C]/30 dark:border-amber-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 text-stone-900 dark:text-stone-100">
            <button
              onClick={() => setModalPlanet(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-[#7A1C1C]/10 dark:bg-amber-400/10 flex items-center justify-center text-[#7A1C1C] dark:text-amber-400 font-serif font-black text-xl">
                {modalPlanet.planet.symbol || modalPlanet.planet.name[0]}
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-[#7A1C1C] dark:text-amber-400">
                  {modalPlanet.planet.name} ({modalPlanet.planet.englishName})
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {modalPlanet.houseNumber}औँ भाव ({HOUSE_NAMES[modalPlanet.houseNumber] || 'भाव'}) — {modalPlanet.planet.rashiName} राशि
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800/60 space-y-1">
                <span className="text-xs text-stone-500 block font-medium">अंश तथा कला (Degree)</span>
                <span className="font-bold text-amber-700 dark:text-amber-300">
                  {formatPlanetDegreesMinutes(modalPlanet.planet)}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800/60 space-y-1">
                <span className="text-xs text-stone-500 block font-medium">नक्षत्र तथा पाद</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  {modalPlanet.planet.nakshatraName || 'अश्विनी'} — पाद {toDevanagariNumerals(modalPlanet.planet.pada || 1)}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800/60 space-y-1">
                <span className="text-xs text-stone-500 block font-medium">राशि स्थिति</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  {modalPlanet.planet.dignity || 'मित्र'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800/60 space-y-1">
                <span className="text-xs text-stone-500 block font-medium">गति / वक्री स्थिति</span>
                <span className="font-bold text-stone-800 dark:text-stone-200">
                  {modalPlanet.planet.isRetrograde ? 'वक्री (Retrograde)' : 'मार्गी (Direct)'} {modalPlanet.planet.isCombust ? '/ अस्त' : ''}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
              <h4 className="text-sm font-bold flex items-center gap-1.5 text-[#7A1C1C] dark:text-amber-400">
                <Eye className="w-4 h-4" /> ग्रहदृष्टि (Drishti)
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {modalPlanet.planet.name} ले {modalPlanet.houseNumber}औँ भावमा बसेर वैदिक नियमअनुसार दृष्टिक्षेत्रहरू प्रभावित गर्दछ।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* House Detail Modal on Click or Double Click */}
      {modalHouse && (
        <HouseDetailModal
          isOpen={modalHouse !== null}
          onClose={() => setModalHouse(null)}
          houseNumber={modalHouse}
          onChangeHouse={(newH) => setModalHouse(newH)}
          allHouses={normalizedHouses as any}
          chartTitle={chartTitle}
        />
      )}
    </div>
  );
};

export default KundaliChartInteractive;
