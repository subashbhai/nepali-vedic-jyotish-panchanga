import React, { useMemo } from 'react';
import {
  BirthDetails,
  LagnaInfo,
  PlanetPosition,
  PanchangaData,
  VimshottariDashaResult,
  DivisionalChartType,
  OrganizationProfile,
  PlanetName,
} from '../../types/astrology';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';
import { generateDivisionalChart } from '../../utils/astroCalculations';
import { NORTH_INDIAN_HOUSE_GEO } from '../../utils/aspectEngine';
import { generateFull5LevelVimshottariDasha, DashaNode } from '../../utils/dashaEngine';

export interface PrintableKundaliDocumentProps {
  profile: BirthDetails;
  lagna: LagnaInfo;
  planets: PlanetPosition[];
  dasha?: VimshottariDashaResult;
  panchanga?: PanchangaData;
  chartStyle?: 'North Indian' | 'South Indian' | 'East Indian';
  selectedDivType?: DivisionalChartType;
  orgProfile?: OrganizationProfile;
  ayanamsaSystem?: string;
}

// 2-Letter Planet Abbreviation Helper for Traditional Kundali
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

// Vedic Lucky Attributes Helper
function getAuspiciousAttributes(planetName: string) {
  switch (planetName) {
    case 'सूर्य':
      return { gem: 'माणिक्य (Ruby)', day: 'आइतबार', num: '१', color: 'रातो / सुवर्ण', deity: 'सूर्य नारायण / शिवजी', dir: 'पूर्व' };
    case 'चन्द्र':
      return { gem: 'मोती (Pearl)', day: 'सोमबार', num: '२', color: 'सेतो / चम्किलो', deity: 'माता पार्वती / चन्द्रदेव', dir: 'उत्तर-पश्चिम' };
    case 'मंगल':
    case 'मङ्गल':
      return { gem: 'मुगा (Red Coral)', day: 'मंगलबार', num: '९', color: 'गाढा रातो', deity: 'हनुमानजी / गणेशजी', dir: 'दक्षिण' };
    case 'बुध':
      return { gem: 'पन्ना (Emerald)', day: 'बुधबार', num: '५', color: 'हरियो', deity: 'भगवान् विष्णु / नारायण', dir: 'उत्तर' };
    case 'गुरु':
    case 'वृहस्पति':
      return { gem: 'पुखराज (Yellow Sapphire)', day: 'बिहीबार', num: '३', color: 'पहेंलो / केसरिया', deity: 'बृहस्पति देव / शिवजी', dir: 'उत्तर-पूर्व (ईशान)' };
    case 'शुक्र':
      return { gem: 'हीरा / ओपल (Diamond/Opal)', day: 'शुक्रबार', num: '६', color: 'सेतो / गुलाबी', deity: 'माता महालक्ष्मी', dir: 'दक्षिण-पूर्व (आग्नेय)' };
    case 'शनि':
      return { gem: 'नीलम (Blue Sapphire)', day: 'शनिबार', num: '८', color: 'कालो / निलो', deity: 'शनिदेव / भैरवनाथ', dir: 'पश्चिम' };
    case 'राहु':
      return { gem: 'गोमेद (Hessonite)', day: 'शनिबार', num: '४', color: 'धुँवा जस्तो', deity: 'माता दुर्गा / सरस्वती', dir: 'दक्षिण-पश्चिम (नैऋत्य)' };
    case 'केतु':
      return { gem: 'लहसुनिया (Cat’s Eye)', day: 'मंगलबार', num: '७', color: 'खैरो / बहुरङ्गी', deity: 'भगवान् गणेश', dir: 'वायव्य' };
    default:
      return { gem: 'माणिक्य / मोती', day: 'आइतबार / बिहीबार', num: '१, ३', color: 'पहेंलो', deity: 'इष्ट देव', dir: 'पूर्व' };
  }
}

function getRashiElement(rashiId: number): string {
  switch (rashiId) {
    case 1: case 5: case 9: return 'अग्नि';
    case 2: case 6: case 10: return 'पृथ्वी';
    case 3: case 7: case 11: return 'वायु';
    case 4: case 8: case 12: return 'जल';
    default: return 'अग्नि';
  }
}

function getRashiNature(rashiId: number): string {
  switch (rashiId) {
    case 1: case 4: case 7: case 10: return 'चर';
    case 2: case 5: case 8: case 11: return 'स्थिर';
    case 3: case 6: case 9: case 12: return 'द्विस्वभाव';
    default: return 'चर';
  }
}

function getRashiLordName(rashiId: number): string {
  switch (rashiId) {
    case 1: case 8: return 'मंगल';
    case 2: case 7: return 'शुक्र';
    case 3: case 6: return 'बुध';
    case 4: return 'चन्द्र';
    case 5: return 'सूर्य';
    case 9: case 12: return 'गुरु';
    case 10: case 11: return 'शनि';
    default: return 'गुरु';
  }
}

// South Indian 4x4 Box Fixed Order
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

/**
 * Print-Safe North Indian Diamond SVG Chart
 */
const PrintSafeNorthIndianChart: React.FC<{
  title: string;
  houses: Array<{ houseNumber: number; rashiId: number; planets: PlanetPosition[] }>;
}> = ({ title, houses }) => {
  const allPlanets = houses.flatMap((h) => h.planets);
  const retroPlanets = allPlanets.filter((p) => p.isRetrograde);
  const combustPlanets = allPlanets.filter((p) => p.isCombust);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-[9.5px] font-bold px-3 py-0.5 rounded-full mb-1 tracking-wider bg-[#7A1C1C] text-white shadow-xs">
        {title}
      </div>
      <div className="relative w-full aspect-square max-w-[245px] bg-white border border-[#7A1C1C] p-0.5 select-none shadow-xs">
        <svg viewBox="0 0 400 400" className="w-full h-full fill-none">
          {/* Base Grid */}
          <rect x="5" y="5" width="390" height="390" stroke="#7A1C1C" strokeWidth="2.5" />
          <line x1="5" y1="5" x2="395" y2="395" stroke="#7A1C1C" strokeWidth="1.5" />
          <line x1="395" y1="5" x2="5" y2="395" stroke="#7A1C1C" strokeWidth="1.5" />
          <polygon points="200,5 395,200 200,395 5,200" stroke="#7A1C1C" strokeWidth="2" />
        </svg>

        {/* House Content */}
        {houses.map((h) => {
          const geo = NORTH_INDIAN_HOUSE_GEO[h.houseNumber];
          if (!geo) return null;

          return (
            <div
              key={h.houseNumber}
              className="absolute text-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${(geo.center.x / 400) * 100}%`,
                top: `${(geo.center.y / 400) * 100}%`,
              }}
            >
              {/* Rashi Number in House */}
              <div className="text-[10px] leading-none mb-0.5 text-[#7A1C1C] font-extrabold">
                {toDevanagariNumerals(h.rashiId)}
                {h.houseNumber === 1 && <span className="text-[7.5px] text-[#DC2626] ml-0.5 font-bold">(ल)</span>}
              </div>

              {/* Planets inside House - Only Planet without (व)/(अ) */}
              <div className="flex flex-wrap justify-center items-center gap-0.5 max-w-[62px]">
                {h.planets.map((p) => {
                  return (
                    <span
                      key={p.id}
                      className="text-[8px] font-bold px-0.5 leading-tight rounded-xs border bg-[#FEF3C7] text-[#1C1917] border-[#FCD34D]"
                    >
                      {getPlanetAbbr(p.name)}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* कुण्डली मुनि ग्रह स्थिति पट्टिका (वक्री / अस्त) */}
      <div className="w-full mt-1 px-1.5 py-0.5 bg-[#FFFBEB] border border-[#7A1C1C]/50 rounded text-[8px] leading-tight text-stone-800 text-center font-medium shadow-2xs max-w-[245px]">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
          <span className="inline-flex items-center gap-0.5">
            <strong className="text-red-900 font-bold">वक्री (व):</strong>
            <span className="text-stone-900 font-semibold">
              {retroPlanets.length > 0
                ? retroPlanets.map((p) => getPlanetAbbr(p.name)).join(', ')
                : '—'}
            </span>
          </span>
          <span className="text-amber-400 font-bold">•</span>
          <span className="inline-flex items-center gap-0.5">
            <strong className="text-amber-950 font-bold">अस्त (अ):</strong>
            <span className="text-stone-900 font-semibold">
              {combustPlanets.length > 0
                ? combustPlanets.map((p) => getPlanetAbbr(p.name)).join(', ')
                : '—'}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Print-Safe South Indian Fixed Grid Chart
 */
const PrintSafeSouthIndianChart: React.FC<{
  title: string;
  lagnaRashiId: number;
  planets: PlanetPosition[];
}> = ({ title, lagnaRashiId, planets }) => {
  const retroPlanets = planets.filter((p) => p.isRetrograde);
  const combustPlanets = planets.filter((p) => p.isCombust);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-[9.5px] font-bold px-3 py-0.5 rounded-full mb-1 tracking-wider bg-[#7A1C1C] text-white shadow-xs">
        {title} (दक्षिणी शैली)
      </div>
      <div className="relative w-full aspect-square max-w-[245px] bg-white border-2 border-[#7A1C1C] grid grid-cols-4 grid-rows-4 select-none">
        {/* Center Blank Square */}
        <div className="col-start-2 col-end-4 row-start-2 row-end-4 border border-[#7A1C1C] flex flex-col items-center justify-center bg-[#FFFBEB] p-1 text-center">
          <span className="text-[10px] font-black text-[#7A1C1C] font-serif">॥ {title} ॥</span>
          <span className="text-[8px] text-stone-600">लग्न: {toDevanagariNumerals(lagnaRashiId)} राशि</span>
        </div>

        {SOUTH_INDIAN_BOX_ORDER.map((box) => {
          const isLagna = box.rashiId === lagnaRashiId;
          const boxPlanets = planets.filter((p) => p.rashiId === box.rashiId);

          return (
            <div
              key={box.rashiId}
              style={{ gridColumn: box.col + 1, gridRow: box.row + 1 }}
              className={`border border-stone-600 p-0.5 flex flex-col justify-between relative ${
                isLagna ? 'bg-[#FEE2E2]' : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-center text-[7.5px] font-bold text-stone-700 leading-none">
                <span>{box.name}</span>
                {isLagna && <span className="text-[#991B1B] font-black">ASC (ल)</span>}
              </div>
              <div className="flex flex-wrap gap-0.5 justify-center py-0.5">
                {boxPlanets.map((p) => (
                  <span
                    key={p.id}
                    className="text-[7.5px] font-bold px-0.5 bg-stone-100 border border-stone-300 rounded-xs text-stone-900"
                  >
                    {getPlanetAbbr(p.name)}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* कुण्डली मुनि ग्रह स्थिति पट्टिका */}
      <div className="w-full mt-1 px-1.5 py-0.5 bg-[#FFFBEB] border border-[#7A1C1C]/50 rounded text-[8px] leading-tight text-stone-800 text-center font-medium shadow-2xs max-w-[245px]">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
          <span className="inline-flex items-center gap-0.5">
            <strong className="text-red-900 font-bold">वक्री (व):</strong>
            <span className="text-stone-900 font-semibold">
              {retroPlanets.length > 0
                ? retroPlanets.map((p) => getPlanetAbbr(p.name)).join(', ')
                : '—'}
            </span>
          </span>
          <span className="text-amber-400 font-bold">•</span>
          <span className="inline-flex items-center gap-0.5">
            <strong className="text-amber-950 font-bold">अस्त (अ):</strong>
            <span className="text-stone-900 font-semibold">
              {combustPlanets.length > 0
                ? combustPlanets.map((p) => getPlanetAbbr(p.name)).join(', ')
                : '—'}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Print-Safe East Indian Fixed Rashi Chart (Surya Chakra / Bengali)
 */
const PrintSafeEastIndianChart: React.FC<{
  title: string;
  lagnaRashiId: number;
  planets: PlanetPosition[];
}> = ({ title, lagnaRashiId, planets }) => {
  const retroPlanets = planets.filter((p) => p.isRetrograde);
  const combustPlanets = planets.filter((p) => p.isCombust);

  const EAST_BOX_GEO: Record<number, { pos: number; rashiId: number; name: string; center: { cx: number; cy: number } }> = {
    1: { pos: 1, rashiId: 1, name: 'मेष', center: { cx: 120, cy: 62 } },
    2: { pos: 2, rashiId: 2, name: 'वृष', center: { cx: 62, cy: 30 } },
    3: { pos: 3, rashiId: 3, name: 'मिथुन', center: { cx: 30, cy: 62 } },
    4: { pos: 4, rashiId: 4, name: 'कर्कट', center: { cx: 62, cy: 120 } },
    5: { pos: 5, rashiId: 5, name: 'सिंह', center: { cx: 30, cy: 178 } },
    6: { pos: 6, rashiId: 6, name: 'कन्या', center: { cx: 62, cy: 210 } },
    7: { pos: 7, rashiId: 7, name: 'तुला', center: { cx: 120, cy: 178 } },
    8: { pos: 8, rashiId: 8, name: 'वृश्चिक', center: { cx: 178, cy: 210 } },
    9: { pos: 9, rashiId: 9, name: 'धनु', center: { cx: 210, cy: 178 } },
    10: { pos: 10, rashiId: 10, name: 'मकर', center: { cx: 178, cy: 120 } },
    11: { pos: 11, rashiId: 11, name: 'कुम्भ', center: { cx: 210, cy: 62 } },
    12: { pos: 12, rashiId: 12, name: 'मीन', center: { cx: 178, cy: 30 } },
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="text-[9.5px] font-bold px-3 py-0.5 rounded-full mb-1 tracking-wider bg-[#7A1C1C] text-white shadow-xs">
        {title} (पूर्वी शैली)
      </div>
      <div className="relative w-full aspect-square max-w-[245px] bg-white border-2 border-[#7A1C1C] select-none">
        <svg viewBox="0 0 240 240" className="w-full h-full stroke-stone-800 fill-none stroke-[1.2]">
          <line x1="0" y1="0" x2="240" y2="240" />
          <line x1="240" y1="0" x2="0" y2="240" />
          <polygon points="120,0 240,120 120,240 0,120" className="stroke-[#7A1C1C] stroke-[1.6]" />
        </svg>

        {Object.values(EAST_BOX_GEO).map((box) => {
          const isLagna = box.rashiId === lagnaRashiId;
          const boxPlanets = planets.filter((p) => p.rashiId === box.rashiId);

          return (
            <div
              key={box.pos}
              className="absolute text-center transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none"
              style={{
                left: `${(box.center.cx / 240) * 100}%`,
                top: `${(box.center.cy / 240) * 100}%`,
              }}
            >
              <div className="flex items-center gap-0.5 leading-none">
                <span className="text-[7.5px] font-bold text-stone-700">{box.name}</span>
                {isLagna && <span className="text-[7px] text-[#991B1B] font-black">(ल)</span>}
              </div>
              <div className="flex flex-wrap gap-0.5 justify-center mt-0.5 max-w-[55px]">
                {boxPlanets.map((p) => (
                  <span
                    key={p.id}
                    className="text-[7px] font-bold px-0.5 bg-stone-100 border border-stone-300 rounded-xs text-stone-900"
                  >
                    {getPlanetAbbr(p.name)}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* कुण्डली मुनि ग्रह स्थिति पट्टिका */}
      <div className="w-full mt-1 px-1.5 py-0.5 bg-[#FFFBEB] border border-[#7A1C1C]/50 rounded text-[8px] leading-tight text-stone-800 text-center font-medium shadow-2xs max-w-[245px]">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
          <span className="inline-flex items-center gap-0.5">
            <strong className="text-red-900 font-bold">वक्री (व):</strong>
            <span className="text-stone-900 font-semibold">
              {retroPlanets.length > 0
                ? retroPlanets.map((p) => getPlanetAbbr(p.name)).join(', ')
                : '—'}
            </span>
          </span>
          <span className="text-amber-400 font-bold">•</span>
          <span className="inline-flex items-center gap-0.5">
            <strong className="text-amber-950 font-bold">अस्त (अ):</strong>
            <span className="text-stone-900 font-semibold">
              {combustPlanets.length > 0
                ? combustPlanets.map((p) => getPlanetAbbr(p.name)).join(', ')
                : '—'}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export const PrintableKundaliDocument: React.FC<PrintableKundaliDocumentProps> = ({
  profile,
  lagna,
  planets,
  dasha,
  panchanga,
  chartStyle = 'North Indian',
  selectedDivType = 'D1',
  orgProfile,
  ayanamsaSystem = 'Chitrapaksha',
}) => {
  // Generate primary D-1 chart and D-9 chart
  const d1Chart = generateDivisionalChart('D1', lagna, planets);
  const secondaryDivType = selectedDivType !== 'D1' ? selectedDivType : 'D9';
  const secondaryChart = generateDivisionalChart(secondaryDivType, lagna, planets);

  const orgName = orgProfile?.name || 'श्री बालानन्द वैदिक ज्योतिष, वास्तु तथा पञ्चाङ्ग अनुसन्धान केन्द्र';
  const orgTagline = orgProfile?.tagline || 'नेपालकै सबैभन्दा भरपर्दो तथा प्रामाणिक वैदिक ज्योतिष तथा वास्तु परामर्श केन्द्र';
  const orgMangalShloka = orgProfile?.mangalShloka || '॥ श्री गणेशाय नमः ॥ ॐ नमः शिवाय ॥';
  const orgAddress = orgProfile?.address || 'काठमाडौँ, नेपाल';
  const orgPhone = orgProfile?.phone || '+९७७-९८००००००००';
  const orgEmail = orgProfile?.email || 'vedicjyotish@gmail.com';
  const orgPan = orgProfile?.panNo;
  const orgReg = orgProfile?.registeredNo;
  const orgWebsite = orgProfile?.website;
  const astrologerName = orgProfile?.astrologerName;
  const astrologerTitle = orgProfile?.astrologerTitle;

  const moonPlanet = planets.find((p) => p.name === 'चन्द्र') || planets[1] || planets[0];

  // Calculate comprehensive 5-level or 9-mahadasha timeline
  const fullDashaData = useMemo(() => {
    if (moonPlanet && profile.dateAD) {
      try {
        return generateFull5LevelVimshottariDasha(moonPlanet, profile.dateAD, profile.time || '12:00');
      } catch (err) {
        console.error('Failed to generate full dasha for printable document:', err);
      }
    }
    return null;
  }, [moonPlanet, profile.dateAD, profile.time]);

  // Complete Planetary table rows (Ascendant + 9 Grahas)
  const planetRows = [
    {
      name: 'लग्न (Ascendant)',
      symbol: 'ल',
      rashiName: lagna.rashiName,
      rashiId: lagna.rashiId,
      formattedDegree: lagna.formattedDegree || `${toDevanagariNumerals(Math.floor(lagna.degree || 0))}° ००′ ००″`,
      nakshatraName: lagna.nakshatraName || '—',
      pada: toDevanagariNumerals(lagna.pada || 1),
      houseNumber: 1,
      motion: 'मार्गी',
      dignity: 'शुभ लग्न',
      karaka: 'तनु भाव (शरीर, स्वास्थ्य, स्वभाव)',
    },
    ...planets.map((p) => ({
      name: p.name,
      symbol: getPlanetAbbr(p.name),
      rashiName: p.rashiName,
      rashiId: p.rashiId,
      formattedDegree: p.formattedDegree || `${toDevanagariNumerals(p.degree)}° ${toDevanagariNumerals(p.minutes)}′ ००″`,
      nakshatraName: p.nakshatraName || '—',
      pada: toDevanagariNumerals(p.pada || 1),
      houseNumber: p.bhava,
      motion: p.isRetrograde ? 'वक्री (व)' : p.isCombust ? 'अस्त (अ)' : 'मार्गी',
      dignity: p.dignity || 'सम',
      karaka: p.relationshipWithLagnaLord ? `लग्नेशसँग ${p.relationshipWithLagnaLord}` : 'कारक ग्रह',
    })),
  ];

  // Auspicious attributes based on Lagna Lord & Moon sign
  const lagnaLordAttrs = getAuspiciousAttributes(lagna.lord || 'सूर्य');

  // Resolved Mahadashas list
  const mahadashasList: DashaNode[] = useMemo(() => {
    if (fullDashaData?.mahadashas && fullDashaData.mahadashas.length > 0) {
      return fullDashaData.mahadashas;
    }
    if (dasha?.mahadashas && dasha.mahadashas.length > 0) {
      return dasha.mahadashas.map((d) => ({
        planet: d.planet,
        level: 'महादशा' as const,
        startMs: 0,
        endMs: 0,
        startDateAD: d.startDate,
        endDateAD: d.endDate,
        startDateBS: d.startDate,
        endDateBS: d.endDate,
        startTimeNepali: '',
        endTimeNepali: '',
        durationDays: Math.round(d.durationYears * 365.25),
        durationFormattedNepali: `${toDevanagariNumerals(d.durationYears)} वर्ष`,
        isCurrent: Boolean(d.isCurrent),
      }));
    }
    return [];
  }, [fullDashaData, dasha]);

  // Current active Mahadasha node
  const activeMahadasha = mahadashasList.find((m) => m.isCurrent) || mahadashasList[0];

  // Active Antardashas from subNodes
  const activeAntardashas = activeMahadasha?.subNodes || [];

  return (
    <div id="printable-kundali-document" className="font-serif text-[#1C1917] bg-[#FFFDF7]">
      {/* =========================================================================
          PAGE 1: FORMAL COVER, BIO, BIRTH PANCHANGA & KUNDALI CHARTS
         ========================================================================= */}
      <div
        className="print-page bg-[#FFFDF7] text-[#1C1917] p-5 max-w-[210mm] mx-auto border-2 border-[#B45309] rounded-xl shadow-sm relative flex flex-col justify-between"
        style={{
          width: '210mm',
          height: '297mm',
          minHeight: '297mm',
          boxSizing: 'border-box',
          backgroundColor: '#FFFDF7',
          color: '#1C1917',
        }}
      >
        {/* Ornate Inner Double Vedic Frame */}
        <div className="border border-[#D97706]/70 p-3.5 rounded-lg relative flex flex-col justify-between h-full bg-[#FFFDF7]">
          {/* Corner Sacred Glyphs */}
          <div className="absolute top-1.5 left-1.5 text-[11px] text-[#B45309] font-bold select-none">卐</div>
          <div className="absolute top-1.5 right-1.5 text-[11px] text-[#B45309] font-bold select-none">ॐ</div>
          <div className="absolute bottom-1.5 left-1.5 text-[11px] text-[#B45309] font-bold select-none">ॐ</div>
          <div className="absolute bottom-1.5 right-1.5 text-[11px] text-[#B45309] font-bold select-none">卐</div>

          <div className="space-y-2.5">
            {/* 1. Header Section / Sacred Vedic Letterhead */}
            <header className="border-b-2 border-[#7A1C1C]/60 pb-2 text-center">
              <div className="text-[10px] font-bold tracking-widest text-[#7A1C1C] uppercase flex items-center justify-center gap-2">
                <span className="text-[#15803D] font-bold">卐</span>
                <span>{orgMangalShloka}</span>
                <span className="text-[#15803D] font-bold">卐</span>
              </div>
              <h1 className="text-base sm:text-lg font-black font-serif text-[#7A1C1C] mt-0.5 tracking-tight">
                {orgName}
              </h1>
              {orgTagline && (
                <p className="text-[9px] font-bold text-[#B45309] mt-0.5">
                  {orgTagline}
                </p>
              )}
              <div className="flex items-center justify-center gap-1.5 text-[8px] text-stone-600 font-medium mt-0.5 flex-wrap font-sans">
                {orgReg && <span className="bg-[#FAF5ED] px-1 py-0.5 rounded border border-[#E6E0D5] font-bold text-[#7A1C1C]">{orgReg}</span>}
                {orgReg && orgPan && <span>•</span>}
                {orgPan && <span className="bg-[#FAF5ED] px-1 py-0.5 rounded border border-[#E6E0D5] font-bold text-[#7A1C1C]">{orgPan}</span>}
                {orgAddress && <span>•</span>}
                {orgAddress && <span>📍 {orgAddress}</span>}
                {orgPhone && <span>•</span>}
                {orgPhone && <span>📞 {toDevanagariNumerals(orgPhone)}</span>}
                {orgEmail && <span>•</span>}
                {orgEmail && <span className="font-mono">✉️ {orgEmail}</span>}
                {orgWebsite && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[#7A1C1C] font-bold">🌐 {orgWebsite}</span>
                  </>
                )}
              </div>

              {/* Official Document Title Banner */}
              <div className="mt-1.5 py-1 px-4 text-center rounded-lg border border-[#7A1C1C]/40 bg-[#FFFBEB] shadow-2xs">
                <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase font-serif text-[#7A1C1C]">
                  ॥ औपचारिक वैदिक जन्मकुण्डली प्रतिवेदन (Formal Kundali Birth Chart) ॥
                </h2>
              </div>
            </header>

            {/* 2. 2-Column Bio & Birth Panchanga Cards */}
            <div className="grid grid-cols-2 gap-2.5 text-[9.5px]">
              {/* Left Card: Jatak Bio */}
              <div className="bg-[#FFFBEB]/70 border border-[#D97706]/40 p-2 rounded-lg space-y-1">
                <div className="font-bold text-[#7A1C1C] border-b border-[#D97706]/30 pb-0.5 flex justify-between">
                  <span>जातक परिचय तथा जन्म विवरण</span>
                  <span className="text-stone-500">दर्ता नं: {profile.id ? profile.id.slice(0, 8).toUpperCase() : 'JATAK-०१'}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-0.5">
                  <div><span className="text-stone-500">नाम:</span> <strong className="text-stone-900">{profile.name}</strong></div>
                  <div><span className="text-stone-500">लिङ्ग:</span> <strong>{profile.gender === 'male' ? 'पुरुष' : 'महिला'}</strong></div>
                  <div><span className="text-stone-500">जन्म मिति (वि.सं.):</span> <strong>{toDevanagariNumerals(profile.dateBS || '—')}</strong></div>
                  <div><span className="text-stone-500">जन्म मिति (ई.सं.):</span> <strong>{profile.dateAD || '—'}</strong></div>
                  <div><span className="text-stone-500">जन्म समय:</span> <strong>{toDevanagariNumerals(profile.time || '—')} बजे</strong></div>
                  <div><span className="text-stone-500">जन्म स्थान:</span> <strong>{profile.location?.name || 'काठमाडौँ, नेपाल'}</strong></div>
                  <div>
                    <span className="text-stone-500">अक्षांश/देशान्तर:</span>{' '}
                    <strong>
                      {profile.location?.latitude ? toDevanagariNumerals(profile.location.latitude.toFixed(2)) : '२७.७१'}° N /{' '}
                      {profile.location?.longitude ? toDevanagariNumerals(profile.location.longitude.toFixed(2)) : '८५.३२'}° E
                    </strong>
                  </div>
                  <div>
                    <span className="text-stone-500">जन्म लग्न:</span>{' '}
                    <strong className="text-[#7A1C1C]">{lagna.rashiName} ({toDevanagariNumerals(lagna.rashiId)}) [{lagna.formattedDegree}]</strong>
                  </div>
                  <div>
                    <span className="text-stone-500">अयनांश प्रणाली:</span>{' '}
                    <strong className="text-stone-800">{ayanamsaSystem === 'Lahiri' ? 'चित्रापक्ष (NC Lahiri)' : ayanamsaSystem === 'KP' ? 'के.पी. (Krishnamurti)' : ayanamsaSystem === 'Raman' ? 'बी.भी. रमण' : ayanamsaSystem}</strong>
                  </div>
                </div>
              </div>

              {/* Right Card: Birth Panchanga */}
              <div className="bg-[#FFFBEB]/70 border border-[#D97706]/40 p-2 rounded-lg space-y-1">
                <div className="font-bold text-[#7A1C1C] border-b border-[#D97706]/30 pb-0.5 flex justify-between">
                  <span>जन्मकालीन पञ्चाङ्ग विवरण</span>
                  <span className="text-stone-500">{panchanga?.dateBS || profile.dateBS}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-0.5">
                  <div><span className="text-stone-500">वार:</span> <strong>{panchanga?.dayNameNepali || 'शुभ दिन'}</strong></div>
                  <div><span className="text-stone-500">पक्ष / तिथि:</span> <strong>{panchanga?.tithi?.paksha || 'शुक्ल'} - {panchanga?.tithi?.name || 'प्रतिपदा'}</strong></div>
                  <div><span className="text-stone-500">जन्मनक्षत्र:</span> <strong className="text-[#7A1C1C]">{panchanga?.nakshatra?.name || lagna.nakshatraName} (पाद {toDevanagariNumerals(panchanga?.nakshatra?.pada || 1)})</strong></div>
                  <div><span className="text-stone-500">योग:</span> <strong>{panchanga?.yoga?.name || 'सिद्ध'}</strong></div>
                  <div><span className="text-stone-500">करण:</span> <strong>{panchanga?.karana?.name || 'बव'}</strong></div>
                  <div><span className="text-stone-500">सूर्य / चन्द्र राशि:</span> <strong>{panchanga?.sunRashi || 'मेष'} / {panchanga?.moonRashi || moonPlanet?.rashiName || 'मेष'}</strong></div>
                  <div><span className="text-stone-500">सूर्योदय / सूर्यास्त:</span> <strong>{toDevanagariNumerals(panchanga?.sunrise || '०५:३५')} / {toDevanagariNumerals(panchanga?.sunset || '१८:५०')}</strong></div>
                  <div><span className="text-stone-500">संवत्सर:</span> <strong>वि.सं. {toDevanagariNumerals(panchanga?.vikramSamvat || 2081)} / शक {toDevanagariNumerals(panchanga?.sakaSamvat || 1946)}</strong></div>
                </div>
              </div>
            </div>

            {/* 3. Side-by-Side High-Res Kundali Charts */}
            <div className="grid grid-cols-2 gap-2.5 pt-0.5">
              {chartStyle === 'South Indian' ? (
                <>
                  <PrintSafeSouthIndianChart
                    title="जन्म लग्न कुण्डली (D-1 Rashi)"
                    lagnaRashiId={lagna.rashiId}
                    planets={planets}
                  />
                  <PrintSafeSouthIndianChart
                    title={secondaryChart.titleNepali}
                    lagnaRashiId={secondaryChart.houses[0]?.rashiId || 1}
                    planets={planets}
                  />
                </>
              ) : chartStyle === 'East Indian' ? (
                <>
                  <PrintSafeEastIndianChart
                    title="जन्म लग्न कुण्डली (D-1 Rashi)"
                    lagnaRashiId={lagna.rashiId}
                    planets={planets}
                  />
                  <PrintSafeEastIndianChart
                    title={secondaryChart.titleNepali}
                    lagnaRashiId={secondaryChart.houses[0]?.rashiId || 1}
                    planets={planets}
                  />
                </>
              ) : (
                <>
                  <PrintSafeNorthIndianChart
                    title="जन्म लग्न कुण्डली (D-1 Rashi Chart)"
                    houses={d1Chart.houses}
                  />
                  <PrintSafeNorthIndianChart
                    title={`${secondaryChart.titleNepali}`}
                    houses={secondaryChart.houses}
                  />
                </>
              )}
            </div>

            {/* Chart Notation Legend */}
            <div className="text-[8px] text-center text-stone-700 bg-[#FAF7F2] p-1 rounded border border-[#E6E0D5]">
              <strong>संकेत सूची:</strong> ल = लग्न | सू = सूर्य | च = चन्द्र | मं = मंगल | बु = बुध | बृ = गुरु | शु = शुक्र | श = शनि | रा = राहु | के = केतु | (व) = वक्री ग्रह | (अ) = अस्त ग्रह
            </div>

            {/* 4. Auspicious Planetary Factors & Key Astrological Indicators */}
            <div className="bg-[#FFFBEB]/60 border border-[#D97706]/40 p-2 rounded-lg text-[9px]">
              <div className="font-bold text-[#7A1C1C] border-b border-[#D97706]/30 pb-0.5 mb-1 flex items-center justify-between">
                <span>शुभ तत्त्व तथा ज्योतिषीय कारक विवरण (Auspicious Life Factors)</span>
                <span className="text-stone-500 text-[8px]">लग्नेश: {lagna.lord || 'सूर्य'} | राशीश: {getRashiLordName(moonPlanet?.rashiId || 1)}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <div><span className="text-stone-500">भाग्यशाली रत्न:</span> <strong className="text-[#7A1C1C]">{lagnaLordAttrs.gem}</strong></div>
                <div><span className="text-stone-500">अनुकूल बार:</span> <strong className="text-stone-800">{lagnaLordAttrs.day}</strong></div>
                <div><span className="text-stone-500">शुभ अङ्क:</span> <strong className="text-stone-800">{toDevanagariNumerals(lagnaLordAttrs.num)}</strong></div>
                <div><span className="text-stone-500">शुभ रङ्ग:</span> <strong className="text-stone-800">{lagnaLordAttrs.color}</strong></div>
                <div><span className="text-stone-500">शुभ दिशा:</span> <strong className="text-stone-800">{lagnaLordAttrs.dir}</strong></div>
                <div><span className="text-stone-500">इष्ट देवता:</span> <strong className="text-stone-800">{lagnaLordAttrs.deity}</strong></div>
                <div><span className="text-stone-500">तत्व / प्रकृति:</span> <strong className="text-stone-800">{getRashiElement(lagna.rashiId)} / {getRashiNature(lagna.rashiId)}</strong></div>
                <div><span className="text-stone-500">गणना अयनांश:</span> <strong className="text-stone-800">NC Lahiri (चित्रापक्ष)</strong></div>
              </div>
            </div>
          </div>

          {/* Page 1 Footer */}
          <footer className="pt-1.5 border-t border-[#7A1C1C]/40 flex items-center justify-between text-[8.5px] text-stone-600">
            <div>॥ धर्मो रक्षति रक्षितः ॥ विद्या ददाति विनयं विनयाद्याति पात्रताम् ॥</div>
            <div className="font-bold text-[#7A1C1C]">पृष्ठ १ / २ (Page 1 of 2)</div>
          </footer>
        </div>
      </div>

      {/* =========================================================================
          PAGE 2: PLANETARY POSITIONS TABLE & VIMSHOTTARI DASHA DETAILS
         ========================================================================= */}
      <div
        className="print-page bg-[#FFFDF7] text-[#1C1917] p-5 max-w-[210mm] mx-auto border-2 border-[#B45309] rounded-xl shadow-sm relative flex flex-col justify-between mt-6"
        style={{
          width: '210mm',
          height: '297mm',
          minHeight: '297mm',
          boxSizing: 'border-box',
          backgroundColor: '#FFFDF7',
          color: '#1C1917',
        }}
      >
        {/* Ornate Inner Double Vedic Frame */}
        <div className="border border-[#D97706]/70 p-3.5 rounded-lg relative flex flex-col justify-between h-full bg-[#FFFDF7]">
          {/* Corner Sacred Glyphs */}
          <div className="absolute top-1.5 left-1.5 text-[11px] text-[#B45309] font-bold select-none">卐</div>
          <div className="absolute top-1.5 right-1.5 text-[11px] text-[#B45309] font-bold select-none">ॐ</div>
          <div className="absolute bottom-1.5 left-1.5 text-[11px] text-[#B45309] font-bold select-none">ॐ</div>
          <div className="absolute bottom-1.5 right-1.5 text-[11px] text-[#B45309] font-bold select-none">卐</div>

          <div className="space-y-2.5">
            {/* 1. Page 2 Header */}
            <header className="border-b-2 border-[#7A1C1C]/60 pb-1.5 text-center">
              <div className="text-[10px] font-bold tracking-widest text-[#7A1C1C] uppercase flex items-center justify-center gap-2">
                <span>卐</span>
                <span>॥ श्री नवग्रहेभ्यो नमः ॥ ॐ सूर्याय नमः ॥</span>
                <span>卐</span>
              </div>
              <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase font-serif text-[#7A1C1C] mt-0.5">
                ॥ स्पष्ट निरयन ग्रहस्थिति तालिका तथा विंशोत्तरी महादशा चक्र ॥
              </h2>
            </header>

            {/* 2. Full Main Planetary Positions Table (स्पष्ट निरयन ग्रह स्थिति) */}
            <div className="space-y-1">
              <div className="text-[10.5px] font-bold text-[#7A1C1C] flex items-center justify-between">
                <span>१. स्पष्ट निरयन ग्रहस्थिति तालिका (Main Planetary Positions)</span>
                <span className="text-[8.5px] text-stone-500 font-normal">अयनांश: NC Lahiri | स्पष्ट राशि, अंश, कला तथा भाव</span>
              </div>

              <div className="overflow-x-auto border border-stone-300 rounded-lg">
                <table className="w-full text-left text-[8.5px] border-collapse bg-white">
                  <thead>
                    <tr className="bg-[#FAF7F2] text-[#7A1C1C] border-b border-stone-300 font-bold">
                      <th className="p-1 border-r border-stone-200">ग्रह (Planet)</th>
                      <th className="p-1 border-r border-stone-200">राशि (Sign)</th>
                      <th className="p-1 border-r border-stone-200">स्पष्ट अंश–कला</th>
                      <th className="p-1 border-r border-stone-200">नक्षत्र (पाद)</th>
                      <th className="p-1 border-r border-stone-200 text-center">भाव</th>
                      <th className="p-1 border-r border-stone-200">गति / स्थिति</th>
                      <th className="p-1 border-r border-stone-200">अवस्था / बल</th>
                      <th className="p-1">कारकत्व / सम्बन्ध</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {planetRows.map((p, idx) => (
                      <tr
                        key={idx}
                        className={p.name.includes('लग्न') ? 'bg-[#FFFBEB] font-bold' : idx % 2 === 1 ? 'bg-[#FAF7F2]/50' : 'bg-white'}
                      >
                        <td className="p-1 border-r border-stone-200 font-bold text-[#7A1C1C]">
                          {p.name} ({p.symbol})
                        </td>
                        <td className="p-1 border-r border-stone-200">
                          {p.rashiName} ({toDevanagariNumerals(p.rashiId)})
                        </td>
                        <td className="p-1 border-r border-stone-200 font-mono">
                          {p.formattedDegree}
                        </td>
                        <td className="p-1 border-r border-stone-200">
                          {p.nakshatraName} (पाद {p.pada})
                        </td>
                        <td className="p-1 border-r border-stone-200 text-center font-bold">
                          {toDevanagariNumerals(p.houseNumber)}
                        </td>
                        <td className="p-1 border-r border-stone-200">
                          <span className={p.motion.includes('वक्री') ? 'text-[#DC2626] font-bold' : ''}>
                            {p.motion}
                          </span>
                        </td>
                        <td className="p-1 border-r border-stone-200 text-stone-700">
                          {p.dignity}
                        </td>
                        <td className="p-1 text-stone-600">
                          {p.karaka}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Vimshottari Dasha Balance at Birth */}
            <div className="bg-[#FFFBEB]/80 border border-[#D97706]/50 p-2 rounded-lg text-[9px] flex flex-wrap items-center justify-between gap-2 shadow-2xs">
              <div>
                <span className="font-bold text-[#7A1C1C]">जन्मकालीन विंशोत्तरी दशा भुक्तभोग्य शेष: </span>
                {fullDashaData?.balanceAtBirth ? (
                  <span>
                    जन्म नक्षत्र: <strong>{fullDashaData.balanceAtBirth.nakshatraName}</strong> (पाद {toDevanagariNumerals(fullDashaData.balanceAtBirth.pada)}) | महादशा: <strong>{fullDashaData.balanceAtBirth.nakshatraLord}</strong> | शेष अवधि: <strong>{fullDashaData.balanceAtBirth.formattedBalanceNepali}</strong>
                  </span>
                ) : dasha?.balanceAtBirth ? (
                  <span>
                    महादशा: <strong>{dasha.balanceAtBirth.planet}</strong> | शेष अवधि: <strong>{toDevanagariNumerals(dasha.balanceAtBirth.yearsLeft)} वर्ष {toDevanagariNumerals(dasha.balanceAtBirth.monthsLeft)} महिना {toDevanagariNumerals(dasha.balanceAtBirth.daysLeft)} दिन</strong>
                  </span>
                ) : (
                  <span>शुभ नक्षत्र दशा शेष</span>
                )}
              </div>
              <div className="text-right font-bold text-[#7A1C1C]">
                वर्तमान दशा: {activeMahadasha ? `${activeMahadasha.planet} महादशा` : '—'}
              </div>
            </div>

            {/* 4. Complete 120-Year Vimshottari Mahadasha Timeline Table */}
            <div className="space-y-1">
              <div className="text-[10.5px] font-bold text-[#7A1C1C] flex items-center justify-between">
                <span>२. सम्पूर्ण विंशोत्तरी महादशा चक्र (१२० वर्ष)</span>
                <span className="text-[8.5px] text-stone-500 font-normal">वि.सं. तथा ई.सं. अवधि अनुसार</span>
              </div>

              <div className="overflow-x-auto border border-stone-300 rounded-lg">
                <table className="w-full text-left text-[8.5px] border-collapse bg-white">
                  <thead>
                    <tr className="bg-[#FAF7F2] text-[#7A1C1C] border-b border-stone-300 font-bold">
                      <th className="p-1 border-r border-stone-200">महादशा स्वामी</th>
                      <th className="p-1 border-r border-stone-200">अवधि</th>
                      <th className="p-1 border-r border-stone-200">सुरु मिति (वि.सं.)</th>
                      <th className="p-1 border-r border-stone-200">समाप्त मिति (वि.सं.)</th>
                      <th className="p-1 border-r border-stone-200">ई.सं. मिति</th>
                      <th className="p-1 text-center">वर्तमान अवस्था</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {mahadashasList.map((m, idx) => (
                      <tr
                        key={idx}
                        className={m.isCurrent ? 'bg-[#FEF3C7] font-bold text-[#7A1C1C]' : idx % 2 === 1 ? 'bg-[#FAF7F2]/50' : 'bg-white'}
                      >
                        <td className="p-1 border-r border-stone-200 font-bold">
                          {m.planet} महादशा
                        </td>
                        <td className="p-1 border-r border-stone-200 font-mono">
                          {m.durationFormattedNepali || `${toDevanagariNumerals(m.durationDays ? Math.round(m.durationDays / 365.25) : 0)} वर्ष`}
                        </td>
                        <td className="p-1 border-r border-stone-200 font-mono">
                          {m.startDateBS ? toDevanagariNumerals(m.startDateBS) : '—'}
                        </td>
                        <td className="p-1 border-r border-stone-200 font-mono">
                          {m.endDateBS ? toDevanagariNumerals(m.endDateBS) : '—'}
                        </td>
                        <td className="p-1 border-r border-stone-200 font-mono text-[8px] text-stone-600">
                          {m.startDateAD} ~ {m.endDateAD}
                        </td>
                        <td className="p-1 text-center">
                          {m.isCurrent ? (
                            <span className="px-1.5 py-0.5 bg-[#DC2626] text-white rounded text-[7.5px] font-bold tracking-wide">
                              चालु महादशा ✓
                            </span>
                          ) : (
                            <span className="text-stone-400 text-[8px]">
                              {new Date(m.endDateAD).getTime() < Date.now() ? 'सम्पन्न' : 'आगामी'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Detailed Antardashas Table for the Active Mahadasha */}
            {activeAntardashas.length > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-[#7A1C1C] flex items-center justify-between">
                  <span>३. चालु {activeMahadasha.planet} महादशाको अन्तर्दशा विस्तार (Antardasha Breakdown)</span>
                  <span className="text-[8px] text-stone-500 font-normal">९ उप-अवधिहरू</span>
                </div>

                <div className="overflow-x-auto border border-stone-300 rounded-lg">
                  <table className="w-full text-left text-[8px] border-collapse bg-white">
                    <thead>
                      <tr className="bg-[#FAF7F2] text-[#7A1C1C] border-b border-stone-300 font-bold">
                        <th className="p-1 border-r border-stone-200">अन्तर्दशा ग्रह</th>
                        <th className="p-1 border-r border-stone-200">सुरु मिति (वि.सं.)</th>
                        <th className="p-1 border-r border-stone-200">समाप्त मिति (वि.सं.)</th>
                        <th className="p-1 border-r border-stone-200">अवधि</th>
                        <th className="p-1 text-center">अवस्था</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      {activeAntardashas.map((ant, aIdx) => (
                        <tr
                          key={aIdx}
                          className={ant.isCurrent ? 'bg-[#FEF3C7] font-bold text-[#7A1C1C]' : aIdx % 2 === 1 ? 'bg-[#FAF7F2]/40' : 'bg-white'}
                        >
                          <td className="p-0.5 px-1 border-r border-stone-200">
                            {activeMahadasha.planet} / {ant.planet}
                          </td>
                          <td className="p-0.5 px-1 border-r border-stone-200 font-mono">
                            {toDevanagariNumerals(ant.startDateBS)}
                          </td>
                          <td className="p-0.5 px-1 border-r border-stone-200 font-mono">
                            {toDevanagariNumerals(ant.endDateBS)}
                          </td>
                          <td className="p-0.5 px-1 border-r border-stone-200 font-mono">
                            {ant.durationFormattedNepali}
                          </td>
                          <td className="p-0.5 px-1 text-center">
                            {ant.isCurrent ? (
                              <span className="text-[#DC2626] font-bold">सक्रिय अन्तर्दशा ✓</span>
                            ) : (
                              <span className="text-stone-400">
                                {new Date(ant.endDateAD).getTime() < Date.now() ? 'सम्पन्न' : 'आगामी'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. Official Astrologer Certification, Signature & Seal Box */}
            <div className="bg-[#FFFBEB]/60 border border-[#D97706]/40 p-2 rounded-lg text-[8.5px] space-y-1.5">
              <div className="flex items-center justify-between border-b border-[#D97706]/30 pb-1">
                <span className="font-bold text-[#7A1C1C]">४. ज्योतिषी प्रमाणीकरण तथा कार्यालय छाप (Official Certification)</span>
                <span className="text-stone-500">स्थान: {orgAddress}</span>
              </div>

              <div className="flex justify-between items-end gap-3 pt-0.5">
                <div className="space-y-1 max-w-[62%] text-stone-700 leading-relaxed text-[8px]">
                  <p>
                    प्रमाणित गरिन्छ कि प्रस्तुत जन्मकुण्डली, निरयन स्पष्ट ग्रहस्थिति तथा १२० वर्षे विंशोत्तरी महादशा चक्र परम्परागत वैदिक सिद्धान्त तथा आधुनिक गणितीय खगोलीय विधिद्वारा तयार गरिएको हो।
                  </p>
                  <p className="italic text-[#7A1C1C] font-semibold text-[7.5px]">
                    ॥ ॐ द्यौः शान्तिरन्तरिक्षं शान्तिः पृथिवी शान्तिरापः शान्तिरोषधयः शान्तिः । वनस्पतयः शान्तिर्विश्वेदेवाः शान्तिर्ब्रह्म शान्तिः सर्वं शान्तिः शान्तिरेव शान्तिः सा मा शान्तिरेधि ॥
                  </p>
                </div>

                {/* Seal & Signature Stamp Box */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Stamp Seal Box */}
                  <div className="w-16 h-16 border-2 border-dashed border-[#B45309] rounded-full flex flex-col items-center justify-center text-[7px] text-[#B45309] text-center font-bold p-1 select-none">
                    <span className="truncate max-w-[56px]">॥ {orgName.slice(0, 10)} ॥</span>
                    <span>आधिकारिक छाप</span>
                    <span>卐</span>
                  </div>

                  {/* Signatory Box */}
                  <div className="text-center space-y-1 min-w-[95px]">
                    <div className="w-28 border-b border-stone-800 pb-1 text-[8.5px] font-bold text-stone-900">
                      {astrologerName || 'ज्योतिषी हस्ताक्षर'}
                    </div>
                    <div className="text-[7.5px] text-stone-600 font-bold">{astrologerTitle || 'पण्डित / ज्योतिर्विद्'}</div>
                    <div className="text-[7px] text-stone-500 truncate max-w-[105px]">{orgName}</div>
                    <div className="text-[7px] text-stone-500">
                      मिति: {toDevanagariNumerals(new Date().toLocaleDateString('ne-NP'))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page 2 Footer */}
          <footer className="pt-1.5 border-t border-[#7A1C1C]/40 flex items-center justify-between text-[8.5px] text-stone-600">
            <div>{orgName} • वैदिक ज्योतिष अनुसन्धान प्रणाली v2.0</div>
            <div className="font-bold text-[#7A1C1C]">पृष्ठ २ / २ (Page 2 of 2)</div>
          </footer>
        </div>
      </div>
    </div>
  );
};
