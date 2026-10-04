import React, { useMemo } from 'react';
import {
  BirthDetails,
  LagnaInfo,
  PlanetPosition,
  PanchangaData,
  VimshottariDashaResult,
  OrganizationProfile,
  PlanetName,
} from '../../types/astrology';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';
import { generateDivisionalChart } from '../../utils/astroCalculations';
import { NORTH_INDIAN_HOUSE_GEO } from '../../utils/aspectEngine';
import { generateFull5LevelVimshottariDasha, DashaNode } from '../../utils/dashaEngine';
import { calculateBhavaAndDrishtiSystem } from '../../utils/bhavaDrishtiEngine';
import { evaluateAllYogasAndDoshas } from '../../utils/yogaEngine';

export interface DetailedKundaliPdfOptions {
  chartStyle?: 'North Indian' | 'South Indian' | 'East Indian';
  colorTheme?: 'vedic' | 'classic' | 'monochrome';
  includeD9?: boolean;
  includeChandra?: boolean;
  includeBhavas?: boolean;
  includeDrishti?: boolean;
  includeYogas?: boolean;
  includeFullDasha?: boolean;
  includeAntardasha?: boolean;
  includeRemedies?: boolean;
  includeSeal?: boolean;
}

export interface DetailedKundaliPdfDocumentProps {
  id?: string;
  profile: BirthDetails;
  lagna: LagnaInfo;
  planets: PlanetPosition[];
  dasha?: VimshottariDashaResult;
  panchanga?: PanchangaData;
  orgProfile?: OrganizationProfile;
  options?: DetailedKundaliPdfOptions;
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

// Auspicious life attributes
function getAuspiciousAttributes(planetName: string) {
  switch (planetName) {
    case 'सूर्य':
      return { gem: 'माणिक्य (Ruby)', day: 'आइतबार', num: '१', color: 'रातो / सुवर्ण', deity: 'सूर्य नारायण / शिवजी', dir: 'पूर्व', mantra: 'ॐ सूर्याय नमः (ह्रीं सूर्याय नमः)' };
    case 'चन्द्र':
      return { gem: 'मोती (Pearl)', day: 'सोमबार', num: '२', color: 'सेतो / चम्किलो', deity: 'माता पार्वती / चन्द्रदेव', dir: 'उत्तर-पश्चिम', mantra: 'ॐ सों सोमाय नमः (ॐ नमः शिवाय)' };
    case 'मंगल':
    case 'मङ्गल':
      return { gem: 'मुगा (Red Coral)', day: 'मंगलबार', num: '९', color: 'गाढा रातो', deity: 'हनुमानजी / श्री गणेश', dir: 'दक्षिण', mantra: 'ॐ अं अंगारकाय नमः (ॐ भौमाय नमः)' };
    case 'बुध':
      return { gem: 'पन्ना (Emerald)', day: 'बुधबार', num: '५', color: 'हरियो', deity: 'भगवान् विष्णु / नारायण', dir: 'उत्तर', mantra: 'ॐ बुं बुधाय नमः (ॐ नमो भगवते वासुदेवाय)' };
    case 'गुरु':
    case 'वृहस्पति':
      return { gem: 'पुखराज (Yellow Sapphire)', day: 'बिहीबार', num: '३', color: 'पहेंलो / केसरिया', deity: 'बृहस्पति देव / शिवजी', dir: 'उत्तर-पूर्व (ईशान)', mantra: 'ॐ बृं बृहस्पतये नमः (ॐ गुरुवे नमः)' };
    case 'शुक्र':
      return { gem: 'हीरा / ओपल (Diamond/Opal)', day: 'शुक्रबार', num: '६', color: 'सेतो / गुलाबी', deity: 'माता महालक्ष्मी', dir: 'दक्षिण-पूर्व (आग्नेय)', mantra: 'ॐ शुं शुक्राय नमः (ॐ महालक्ष्म्यै नमः)' };
    case 'शनि':
      return { gem: 'नीलम (Blue Sapphire)', day: 'शनिबार', num: '८', color: 'कालो / निलो', deity: 'शनिदेव / भैरवनाथ', dir: 'पश्चिम', mantra: 'ॐ शं शनैश्चराय नमः (महामृत्युञ्जय मन्त्र)' };
    case 'राहु':
      return { gem: 'गोमेद (Hessonite)', day: 'शनिबार', num: '४', color: 'धुँवा जस्तो', deity: 'माता दुर्गा / सरस्वती', dir: 'दक्षिण-पश्चिम (नैऋत्य)', mantra: 'ॐ रां राहवे नमः (दुर्गा सप्तशती)' };
    case 'केतु':
      return { gem: 'लहसुनिया (Cat’s Eye)', day: 'मंगलबार', num: '७', color: 'खैरो / बहुरङ्गी', deity: 'भगवान् गणेश', dir: 'वायव्य', mantra: 'ॐ कें केतवे नमः (गणेश द्वादशनाम)' };
    default:
      return { gem: 'माणिक्य / मोती', day: 'आइतबार / बिहीबार', num: '१, ३', color: 'पहेंलो', deity: 'इष्ट देव', dir: 'पूर्व', mantra: 'ॐ नमो नारायणाय' };
  }
}

function getRashiElement(rashiId: number): string {
  switch (rashiId) {
    case 1: case 5: case 9: return 'अग्नि (Fire)';
    case 2: case 6: case 10: return 'पृथ्वी (Earth)';
    case 3: case 7: case 11: return 'वायु (Air)';
    case 4: case 8: case 12: return 'जल (Water)';
    default: return 'अग्नि';
  }
}

function getRashiNature(rashiId: number): string {
  switch (rashiId) {
    case 1: case 4: case 7: case 10: return 'चर (Movable)';
    case 2: case 5: case 8: case 11: return 'स्थिर (Fixed)';
    case 3: case 6: case 9: case 12: return 'द्विस्वभाव (Dual)';
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
    default: return 'सूर्य';
  }
}

// -------------------------------------------------------------
// High-Definition Printable SVG Charts
// -------------------------------------------------------------
const NorthIndianPrintChart: React.FC<{
  title: string;
  houses: Array<{ houseNumber: number; rashiId: number; planets: PlanetPosition[] }>;
  colorTheme?: 'vedic' | 'classic' | 'monochrome';
}> = ({ title, houses, colorTheme = 'vedic' }) => {
  const borderColor = colorTheme === 'monochrome' ? '#27272A' : colorTheme === 'classic' ? '#78350F' : '#991B1B';
  const pillBg = colorTheme === 'monochrome' ? 'bg-stone-800 text-white' : colorTheme === 'classic' ? 'bg-amber-900 text-amber-50' : 'bg-[#7A1C1C] text-white';
  const rashiColor = colorTheme === 'monochrome' ? 'text-stone-900 font-black' : colorTheme === 'classic' ? 'text-amber-950 font-black' : 'text-[#7A1C1C] font-extrabold';

  const allPlanets = houses.flatMap((h) => h.planets);
  const retroPlanets = allPlanets.filter((p) => p.isRetrograde);
  const combustPlanets = allPlanets.filter((p) => p.isCombust);

  return (
    <div className="flex flex-col items-center w-full">
      <div className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full mb-1 tracking-wider shadow-2xs ${pillBg}`}>
        {title}
      </div>
      <div className="relative w-full aspect-square max-w-[210px] bg-white border border-stone-800 p-0.5 select-none shadow-xs">
        <svg viewBox="0 0 400 400" className="w-full h-full fill-none">
          <rect x="5" y="5" width="390" height="390" stroke={borderColor} strokeWidth="2.5" />
          <line x1="5" y1="5" x2="395" y2="395" stroke={borderColor} strokeWidth="1.5" />
          <line x1="395" y1="5" x2="5" y2="395" stroke={borderColor} strokeWidth="1.5" />
          <polygon points="200,5 395,200 200,395 5,200" stroke={borderColor} strokeWidth="2" />
        </svg>

        {houses.map((h) => {
          const geo = NORTH_INDIAN_HOUSE_GEO[h.houseNumber];
          if (!geo) return null;

          return (
            <div
              key={h.houseNumber}
              className="absolute text-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${(geo.center.x / 400) * 100}%`, top: `${(geo.center.y / 400) * 100}%` }}
            >
              <div className={`text-[8.5px] leading-none mb-0.5 ${rashiColor}`}>
                {toDevanagariNumerals(h.rashiId)}
                {h.houseNumber === 1 && <span className="text-[7.5px] text-red-600 ml-0.5 font-black">(ल)</span>}
              </div>

              <div className="flex flex-wrap justify-center items-center gap-0.5 max-w-[55px]">
                {h.planets.map((p) => {
                  return (
                    <span
                      key={p.id}
                      className={`text-[7.5px] font-bold px-0.5 leading-tight rounded-xs ${
                        colorTheme === 'monochrome'
                          ? 'border border-stone-800 text-stone-900 bg-stone-100 font-mono'
                          : 'bg-amber-50 text-stone-900 border border-amber-300'
                      }`}
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

      {/* कुण्डली मुनि ग्रह स्थिति पट्टिका */}
      <div className="w-full mt-1 px-1.5 py-0.5 bg-[#FFFBEB] border border-stone-700/60 rounded text-[7.5px] leading-tight text-stone-800 text-center font-medium shadow-2xs max-w-[210px]">
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

const SOUTH_BOX_ORDER = [
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

const SouthIndianPrintChart: React.FC<{
  title: string;
  lagnaRashiId: number;
  planets: PlanetPosition[];
  colorTheme?: 'vedic' | 'classic' | 'monochrome';
}> = ({ title, lagnaRashiId, planets, colorTheme = 'vedic' }) => {
  const borderColor = colorTheme === 'monochrome' ? 'border-zinc-800' : colorTheme === 'classic' ? 'border-amber-900' : 'border-red-900';
  const pillBg = colorTheme === 'monochrome' ? 'bg-stone-800 text-white' : colorTheme === 'classic' ? 'bg-amber-900 text-amber-50' : 'bg-[#7A1C1C] text-white';

  const retroPlanets = planets.filter((p) => p.isRetrograde);
  const combustPlanets = planets.filter((p) => p.isCombust);

  return (
    <div className="flex flex-col items-center w-full">
      <div className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full mb-1 tracking-wider shadow-2xs ${pillBg}`}>
        {title} (दक्षिणी)
      </div>
      <div className={`relative w-full aspect-square max-w-[210px] bg-white border-2 ${borderColor} grid grid-cols-4 grid-rows-4 select-none shadow-xs`}>
        <div className={`col-start-2 col-end-4 row-start-2 row-end-4 border ${borderColor} flex flex-col items-center justify-center bg-amber-50/50 p-1 text-center`}>
          <span className="text-[9px] font-black text-amber-900 font-serif">॥ {title} ॥</span>
          <span className="text-[7.5px] text-stone-600">लग्न: {toDevanagariNumerals(lagnaRashiId)}</span>
        </div>

        {SOUTH_BOX_ORDER.map((box) => {
          const isLagna = box.rashiId === lagnaRashiId;
          const boxPlanets = planets.filter((p) => p.rashiId === box.rashiId);

          return (
            <div
              key={box.rashiId}
              style={{ gridColumn: box.col + 1, gridRow: box.row + 1 }}
              className={`border border-stone-600 p-0.5 flex flex-col justify-between relative ${
                isLagna ? (colorTheme === 'monochrome' ? 'bg-stone-200' : 'bg-red-50') : 'bg-white'
              }`}
            >
              <div className="flex justify-between items-center text-[7px] font-bold text-stone-600 leading-none">
                <span>{box.name}</span>
                {isLagna && <span className="text-red-700 font-black">ASC</span>}
              </div>
              <div className="flex flex-wrap gap-0.5 justify-center py-0.5">
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
      <div className="w-full mt-1 px-1.5 py-0.5 bg-[#FFFBEB] border border-stone-700/60 rounded text-[7.5px] leading-tight text-stone-800 text-center font-medium shadow-2xs max-w-[210px]">
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

export const DetailedKundaliPdfDocument: React.FC<DetailedKundaliPdfDocumentProps> = ({
  id = 'detailed-kundali-pdf-document',
  profile,
  lagna,
  planets,
  dasha,
  panchanga,
  orgProfile,
  options = {},
}) => {
  const {
    chartStyle = 'North Indian',
    colorTheme = 'vedic',
    includeD9 = true,
    includeChandra = true,
    includeBhavas = true,
    includeDrishti = true,
    includeYogas = true,
    includeFullDasha = true,
    includeAntardasha = true,
    includeRemedies = true,
    includeSeal = true,
  } = options;

  // Generate charts
  const d1Chart = useMemo(() => generateDivisionalChart('D1', lagna, planets), [lagna, planets]);
  const d9Chart = useMemo(() => generateDivisionalChart('D9', lagna, planets), [lagna, planets]);
  const chandraChart = useMemo(() => generateDivisionalChart('D1', lagna, planets), [lagna, planets]);

  const orgName = orgProfile?.name || 'श्री बालानन्द वैदिक ज्योतिष, वास्तु तथा पञ्चाङ्ग अनुसन्धान केन्द्र';
  const orgAddress = orgProfile?.address || 'काठमाडौँ, नेपाल';
  const orgPhone = orgProfile?.phone || '+९७७-९८००००००००';
  const orgEmail = orgProfile?.email || 'vedicjyotish@gmail.com';

  const moonPlanet = planets.find((p) => p.name === 'चन्द्र') || planets[1] || planets[0];

  // Calculate full 5-level Vimshottari dasha data
  const fullDashaData = useMemo(() => {
    if (moonPlanet && profile.dateAD) {
      try {
        return generateFull5LevelVimshottariDasha(moonPlanet, profile.dateAD, profile.time || '12:00');
      } catch (err) {
        console.error('Failed to generate full dasha for detailed document:', err);
      }
    }
    return null;
  }, [moonPlanet, profile.dateAD, profile.time]);

  // Calculate Bhava, Chalit and Drishti
  const bhavaSystem = useMemo(() => {
    return calculateBhavaAndDrishtiSystem(lagna, planets, 'Sripati', true);
  }, [lagna, planets]);

  // Calculate Yogas and Doshas
  const yogaEvaluation = useMemo(() => {
    try {
      return evaluateAllYogasAndDoshas(lagna, planets, dasha);
    } catch (err) {
      console.error('Failed to evaluate yogas for detailed document:', err);
      return null;
    }
  }, [lagna, planets, dasha]);

  // Determine Jaimini Karakas based on longitude
  const karakaMap = useMemo(() => {
    const karakaOrder = [
      'आत्मकारक (AK)',
      'अमात्यकारक (AmK)',
      'भ्रातृकारक (BK)',
      'मातृकारक (MK)',
      'पुत्रकारक (PK)',
      'ज्ञातिकारक (GK)',
      'दाराकारक (DK)'
    ];
    const sevenPlanets = planets
      .filter((p) => ['सूर्य', 'चन्द्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'].includes(p.name))
      .map((p) => ({
        name: p.name,
        degInSign: (p.degree || 0) + (p.minutes || 0) / 60,
      }))
      .sort((a, b) => b.degInSign - a.degInSign);

    const map: Record<string, string> = {};
    sevenPlanets.forEach((p, idx) => {
      if (karakaOrder[idx]) {
        map[p.name] = karakaOrder[idx];
      }
    });
    map['राहु'] = 'उपग्रह (उत्तरी नोड)';
    map['केतु'] = 'मोक्षकारक (दक्षिणी नोड)';
    map['लग्न'] = 'तनु कारक (देहाधिपति)';
    return map;
  }, [planets]);

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
      karaka: karakaMap['लग्न'] || 'तनु कारक',
      nakshatraLord: '—',
      relationship: 'लग्नेश: ' + (lagna.lord || 'सूर्य'),
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
      karaka: karakaMap[p.name] || 'कारक ग्रह',
      nakshatraLord: p.nakshatraLord || '—',
      relationship: p.relationshipWithLagnaLord ? `लग्नेशसँग ${p.relationshipWithLagnaLord}` : 'कारक ग्रह',
    })),
  ];

  // Auspicious attributes based on Lagna Lord
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
  const activeAntardashas = activeMahadasha?.subNodes || [];

  // Theme-based accent styles
  const themeBorder = colorTheme === 'monochrome' ? 'border-zinc-800' : colorTheme === 'classic' ? 'border-amber-800' : 'border-[#B45309]';
  const themeInnerBorder = colorTheme === 'monochrome' ? 'border-zinc-400' : colorTheme === 'classic' ? 'border-amber-600/70' : 'border-[#D97706]/70';
  const themeHeaderColor = colorTheme === 'monochrome' ? 'text-zinc-900' : colorTheme === 'classic' ? 'text-amber-950' : 'text-[#7A1C1C]';
  const themeBgCard = colorTheme === 'monochrome' ? 'bg-zinc-50 border-zinc-300' : colorTheme === 'classic' ? 'bg-[#FFFBEB] border-amber-300' : 'bg-[#FFFBEB]/70 border-[#D97706]/40';

  return (
    <div id={id} className="font-serif text-[#1C1917] bg-[#FFFDF7]">
      {/* =========================================================================
          PAGE 1: FORMAL COVER, BIO, BIRTH PANCHANGA & CORE CHARTS
         ========================================================================= */}
      <div
        className="print-page bg-[#FFFDF7] text-[#1C1917] p-5 max-w-[210mm] mx-auto border-2 rounded-xl shadow-sm relative flex flex-col justify-between"
        style={{
          width: '210mm',
          height: '297mm',
          minHeight: '297mm',
          boxSizing: 'border-box',
          backgroundColor: '#FFFDF7',
          color: '#1C1917',
          borderColor: colorTheme === 'monochrome' ? '#27272A' : colorTheme === 'classic' ? '#78350F' : '#B45309',
        }}
      >
        <div className={`border p-3.5 rounded-lg relative flex flex-col justify-between h-full bg-[#FFFDF7] ${themeInnerBorder}`}>
          {/* Corner Sacred Glyphs */}
          <div className="absolute top-1.5 left-1.5 text-[11px] text-[#B45309] font-bold select-none">卐</div>
          <div className="absolute top-1.5 right-1.5 text-[11px] text-[#B45309] font-bold select-none">ॐ</div>
          <div className="absolute bottom-1.5 left-1.5 text-[11px] text-[#B45309] font-bold select-none">ॐ</div>
          <div className="absolute bottom-1.5 right-1.5 text-[11px] text-[#B45309] font-bold select-none">卐</div>

          <div className="space-y-2">
            {/* 1. Sacred Header */}
            <header className="border-b-2 pb-1.5 text-center" style={{ borderColor: colorTheme === 'monochrome' ? '#52525B' : '#7A1C1C' }}>
              <div className={`text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-2 ${themeHeaderColor}`}>
                <span>卐</span>
                <span>॥ श्री गणेशाय नमः ॥ ॐ नमः शिवाय ॥</span>
                <span>卐</span>
              </div>
              <h1 className={`text-base sm:text-lg font-black font-serif mt-0.5 tracking-tight ${themeHeaderColor}`}>
                {orgName}
              </h1>
              <p className="text-[9px] text-stone-600 font-medium">
                {orgAddress} | फोन: {toDevanagariNumerals(orgPhone)} | इमेल: {orgEmail}
              </p>

              {/* Official Banner */}
              <div className={`mt-1.5 py-1 px-4 text-center rounded-lg border ${themeBgCard} shadow-2xs`}>
                <h2 className={`text-xs sm:text-sm font-black tracking-wider uppercase font-serif ${themeHeaderColor}`}>
                  ॥ विस्तृत वैदिक जन्मकुण्डली प्रतिवेदन (Comprehensive Kundali Birth Analysis) ॥
                </h2>
              </div>
            </header>

            {/* 2. 2-Column Bio & Birth Panchanga Cards */}
            <div className="grid grid-cols-2 gap-2 text-[9.5px]">
              {/* Jatak Bio */}
              <div className={`border p-2 rounded-lg space-y-1 ${themeBgCard}`}>
                <div className={`font-bold border-b pb-0.5 flex justify-between ${themeHeaderColor}`} style={{ borderColor: '#D9770640' }}>
                  <span>जातक व्यक्तिगत परिचय तथा जन्म विवरण</span>
                  <span className="text-stone-500 font-normal">दर्ता: {profile.id ? profile.id.slice(0, 8).toUpperCase() : 'JATAK-०१'}</span>
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
                    <strong className={themeHeaderColor}>{lagna.rashiName} ({toDevanagariNumerals(lagna.rashiId)}) [{lagna.formattedDegree}]</strong>
                  </div>
                </div>
              </div>

              {/* Birth Panchanga */}
              <div className={`border p-2 rounded-lg space-y-1 ${themeBgCard}`}>
                <div className={`font-bold border-b pb-0.5 flex justify-between ${themeHeaderColor}`} style={{ borderColor: '#D9770640' }}>
                  <span>जन्मकालीन पञ्चाङ्ग विवरण</span>
                  <span className="text-stone-500 font-normal">{panchanga?.dateBS || profile.dateBS}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 pt-0.5">
                  <div><span className="text-stone-500">वार:</span> <strong>{panchanga?.dayNameNepali || 'शुभ दिन'}</strong></div>
                  <div><span className="text-stone-500">पक्ष / तिथि:</span> <strong>{panchanga?.tithi?.paksha || 'शुक्ल'} - {panchanga?.tithi?.name || 'प्रतिपदा'}</strong></div>
                  <div><span className="text-stone-500">जन्मनक्षत्र:</span> <strong className={themeHeaderColor}>{panchanga?.nakshatra?.name || lagna.nakshatraName} (पाद {toDevanagariNumerals(panchanga?.nakshatra?.pada || 1)})</strong></div>
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
                  <SouthIndianPrintChart
                    title="जन्म लग्न कुण्डली (D-1 Rashi)"
                    lagnaRashiId={lagna.rashiId}
                    planets={planets}
                    colorTheme={colorTheme}
                  />
                  {includeD9 ? (
                    <SouthIndianPrintChart
                      title="नवांश कुण्डली (D-9 Navamsha)"
                      lagnaRashiId={d9Chart.houses[0]?.rashiId || 1}
                      planets={planets}
                      colorTheme={colorTheme}
                    />
                  ) : (
                    <SouthIndianPrintChart
                      title="चन्द्र कुण्डली (Chandra Lagna)"
                      lagnaRashiId={moonPlanet?.rashiId || 1}
                      planets={planets}
                      colorTheme={colorTheme}
                    />
                  )}
                </>
              ) : (
                <>
                  <NorthIndianPrintChart
                    title="जन्म लग्न कुण्डली (D-1 Rashi Chart)"
                    houses={d1Chart.houses}
                    colorTheme={colorTheme}
                  />
                  {includeD9 ? (
                    <NorthIndianPrintChart
                      title="नवांश कुण्डली (D-9 Navamsha Chart)"
                      houses={d9Chart.houses}
                      colorTheme={colorTheme}
                    />
                  ) : (
                    <NorthIndianPrintChart
                      title="चन्द्र कुण्डली (Chandra Lagna Chart)"
                      houses={chandraChart.houses}
                      colorTheme={colorTheme}
                    />
                  )}
                </>
              )}
            </div>

            {/* Chandra Kundali & Chart Notation Legend */}
            <div className="text-[8px] text-center text-stone-700 bg-[#FAF7F2] p-1 rounded border border-[#E6E0D5] flex items-center justify-between">
              <div>
                <strong>संकेत:</strong> ल = लग्न | सू = सूर्य | च = चन्द्र | मं = मंगल | बु = बुध | बृ = गुरु | शु = शुक्र | श = शनि | रा = राहु | के = केतु | (व) = वक्री | (अ) = अस्त
              </div>
              {includeChandra && (
                <div className="font-bold text-amber-900">
                  चन्द्र कुण्डली: {moonPlanet?.rashiName || 'मेष'} राशि ({toDevanagariNumerals(moonPlanet?.rashiId || 1)}) | जन्मनक्षत्र: {moonPlanet?.nakshatraName}
                </div>
              )}
            </div>

            {/* 4. Auspicious Planetary Factors & Key Astrological Indicators */}
            <div className={`border p-2 rounded-lg text-[9px] ${themeBgCard}`}>
              <div className={`font-bold border-b pb-0.5 mb-1 flex items-center justify-between ${themeHeaderColor}`} style={{ borderColor: '#D9770640' }}>
                <span>शुभ तत्त्व, भाग्यशाली कारक तथा ज्योतिषीय सङ्केत (Auspicious Life Factors)</span>
                <span className="text-stone-500 text-[8px]">लग्नेश: {lagna.lord || 'सूर्य'} | राशीश: {getRashiLordName(moonPlanet?.rashiId || 1)}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <div><span className="text-stone-500">भाग्यशाली रत्न:</span> <strong className={themeHeaderColor}>{lagnaLordAttrs.gem}</strong></div>
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
          <footer className="pt-1.5 border-t flex items-center justify-between text-[8.5px] text-stone-600" style={{ borderColor: '#7A1C1C40' }}>
            <div>॥ धर्मो रक्षति रक्षितः ॥ विद्या ददाति विनयं विनयाद्याति पात्रताम् ॥</div>
            <div className={`font-bold ${themeHeaderColor}`}>पृष्ठ १ / ३ (Page 1 of 3)</div>
          </footer>
        </div>
      </div>

      {/* =========================================================================
          PAGE 2: PLANETARY POSITIONS, BHAVAS & GRAHA DRISHTI ANALYSIS
         ========================================================================= */}
      <div
        className="print-page bg-[#FFFDF7] text-[#1C1917] p-5 max-w-[210mm] mx-auto border-2 rounded-xl shadow-sm relative flex flex-col justify-between mt-6"
        style={{
          width: '210mm',
          height: '297mm',
          minHeight: '297mm',
          boxSizing: 'border-box',
          backgroundColor: '#FFFDF7',
          color: '#1C1917',
          borderColor: colorTheme === 'monochrome' ? '#27272A' : colorTheme === 'classic' ? '#78350F' : '#B45309',
        }}
      >
        <div className={`border p-3.5 rounded-lg relative flex flex-col justify-between h-full bg-[#FFFDF7] ${themeInnerBorder}`}>
          {/* Corner Sacred Glyphs */}
          <div className="absolute top-1.5 left-1.5 text-[11px] text-[#B45309] font-bold select-none">卐</div>
          <div className="absolute top-1.5 right-1.5 text-[11px] text-[#B45309] font-bold select-none">ॐ</div>
          <div className="absolute bottom-1.5 left-1.5 text-[11px] text-[#B45309] font-bold select-none">ॐ</div>
          <div className="absolute bottom-1.5 right-1.5 text-[11px] text-[#B45309] font-bold select-none">卐</div>

          <div className="space-y-2">
            {/* Page 2 Clean Continuous Section Title */}
            <div className="border-b pb-1 text-center" style={{ borderColor: colorTheme === 'monochrome' ? '#52525B' : '#7A1C1C' }}>
              <h2 className={`text-xs sm:text-sm font-black tracking-wider uppercase font-serif ${themeHeaderColor}`}>
                ॥ २. स्पष्ट निरयन ग्रहस्थिति, भाव चक्र तथा दृष्टि विश्लेषण ॥
              </h2>
            </div>

            {/* 1. Full Main Planetary Positions Table */}
            <div className="space-y-1">
              <div className={`text-[10px] font-bold flex items-center justify-between ${themeHeaderColor}`}>
                <span>१. स्पष्ट निरयन ग्रहस्थिति तालिका (Comprehensive Planetary Table)</span>
                <span className="text-[8px] text-stone-500 font-normal">अयनांश: NC Lahiri | स्पष्ट अंश, कला, विकला, गति तथा कारकत्व</span>
              </div>

              <div className="overflow-x-auto border border-stone-300 rounded-lg">
                <table className="w-full text-left text-[8px] border-collapse bg-white">
                  <thead>
                    <tr className="bg-[#FAF7F2] text-[#7A1C1C] border-b border-stone-300 font-bold">
                      <th className="p-1 border-r border-stone-200">ग्रह (Planet)</th>
                      <th className="p-1 border-r border-stone-200">राशि (Sign)</th>
                      <th className="p-1 border-r border-stone-200">स्पष्ट अंश–कला</th>
                      <th className="p-1 border-r border-stone-200">नक्षत्र (पाद)</th>
                      <th className="p-1 border-r border-stone-200 text-center">भाव</th>
                      <th className="p-1 border-r border-stone-200">गति / स्थिति</th>
                      <th className="p-1 border-r border-stone-200">अवस्था / बल</th>
                      <th className="p-1 border-r border-stone-200">जैमिनी कारकत्व</th>
                      <th className="p-1">लग्नेश सम्बन्ध</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {planetRows.map((p, idx) => (
                      <tr
                        key={idx}
                        className={p.name.includes('लग्न') ? 'bg-[#FFFBEB] font-bold' : idx % 2 === 1 ? 'bg-[#FAF7F2]/50' : 'bg-white'}
                      >
                        <td className="p-0.5 px-1 border-r border-stone-200 font-bold text-[#7A1C1C]">
                          {p.name} ({p.symbol})
                        </td>
                        <td className="p-0.5 px-1 border-r border-stone-200">
                          {p.rashiName} ({toDevanagariNumerals(p.rashiId)})
                        </td>
                        <td className="p-0.5 px-1 border-r border-stone-200 font-mono">
                          {p.formattedDegree}
                        </td>
                        <td className="p-0.5 px-1 border-r border-stone-200">
                          {p.nakshatraName} (पाद {p.pada})
                        </td>
                        <td className="p-0.5 px-1 border-r border-stone-200 text-center font-bold">
                          {toDevanagariNumerals(p.houseNumber)}
                        </td>
                        <td className="p-0.5 px-1 border-r border-stone-200">
                          <span className={p.motion.includes('वक्री') ? 'text-[#DC2626] font-bold' : ''}>
                            {p.motion}
                          </span>
                        </td>
                        <td className="p-0.5 px-1 border-r border-stone-200 text-stone-700">
                          {p.dignity}
                        </td>
                        <td className="p-0.5 px-1 border-r border-stone-200 font-medium text-amber-900">
                          {p.karaka}
                        </td>
                        <td className="p-0.5 px-1 text-stone-600">
                          {p.relationship}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. 12 Houses / Bhava Chalit Analysis */}
            {includeBhavas && (
              <div className="space-y-1">
                <div className={`text-[10px] font-bold flex items-center justify-between ${themeHeaderColor}`}>
                  <span>२. द्वादश भाव स्पष्ट तथा भावेश विश्लेषण (12 Houses & Bhavesh Summary)</span>
                  <span className="text-[8px] text-stone-500 font-normal">श्रीपति भाव विभाजन अनुसार</span>
                </div>

                <div className="grid grid-cols-4 gap-1 text-[7.5px]">
                  {bhavaSystem.bhavas.map((b) => (
                    <div key={b.houseNumber} className="bg-white border border-stone-300 rounded p-1 space-y-0.5">
                      <div className="flex items-center justify-between border-b border-stone-200 pb-0.5">
                        <strong className="text-[#7A1C1C]">भाव {toDevanagariNumerals(b.houseNumber)}</strong>
                        <span className="text-stone-500 font-mono">{toDevanagariNumerals(b.rashiId)} {b.rashiName}</span>
                      </div>
                      <div><span className="text-stone-500">भावेश:</span> <strong>{b.lord}</strong></div>
                      <div>
                        <span className="text-stone-500">स्थिति:</span>{' '}
                        {b.isKendra ? <span className="text-emerald-700 font-bold">केन्द्र</span> : b.isTrikona ? <span className="text-blue-700 font-bold">त्रिकोण</span> : b.isDushtasthana ? <span className="text-red-700 font-bold">दुःस्थान</span> : 'सामान्य'}
                      </div>
                      <div className="text-stone-600 truncate" title={b.domainNepali}>
                        {b.domainNepali.split('—')[1] || b.domainNepali}
                      </div>
                      <div>
                        <span className="text-stone-500">ग्रह:</span>{' '}
                        {b.planetsRashi.length > 0 ? (
                          <strong className="text-stone-900">{b.planetsRashi.map((p) => getPlanetAbbr(p.name)).join(', ')}</strong>
                        ) : (
                          <span className="text-stone-400">रिक्त</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Graha Drishti Matrix & Aspects */}
            {includeDrishti && (
              <div className="space-y-1">
                <div className={`text-[10px] font-bold flex items-center justify-between ${themeHeaderColor}`}>
                  <span>३. ग्रह दृष्टि सम्बन्ध (Planetary Aspects on Houses & Grahas)</span>
                  <span className="text-[8px] text-stone-500 font-normal">पूर्ण सप्तम दृष्टि तथा मंगल/गुरु/शनि/राहुका विशेष दृष्टि</span>
                </div>

                <div className="bg-white border border-stone-300 rounded-lg p-1.5 text-[8px] space-y-1">
                  <div className="grid grid-cols-3 gap-1">
                    {bhavaSystem.allDrishti.slice(0, 9).map((item, idx) => (
                      <div key={idx} className="bg-[#FAF7F2] p-1 rounded border border-stone-200">
                        <strong className="text-[#7A1C1C]">{item.aspectingPlanet}</strong>
                        <span className="text-stone-600"> → भाव {toDevanagariNumerals(item.targetHouse)} ({item.targetRashiName})</span>
                        <div className="text-[7.5px] text-stone-500">{item.aspectType}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. Astrological Highlights: Key Yogas & Dosha Assessment */}
            {includeYogas && yogaEvaluation && (
              <div className="space-y-1">
                <div className={`text-[10px] font-bold flex items-center justify-between ${themeHeaderColor}`}>
                  <span>४. मुख्य कुण्डली योग तथा दोष विश्लेषण (Key Yogas & Dosha Findings)</span>
                  <span className="text-[8px] text-stone-500 font-normal">
                    शुभ योग: {toDevanagariNumerals(yogaEvaluation.yogas.length)} | दोष: {toDevanagariNumerals(yogaEvaluation.doshas.length)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 text-[8px]">
                  {/* Top Yogas */}
                  <div className="bg-[#FFFBEB] border border-amber-300 rounded-lg p-1.5 space-y-1">
                    <strong className="text-amber-900 block border-b border-amber-200 pb-0.5">
                      ✓ प्रमुख शुभ योगहरू (Auspicious Yogas)
                    </strong>
                    {yogaEvaluation.yogas.length > 0 ? (
                      yogaEvaluation.yogas.slice(0, 3).map((y, idx) => (
                        <div key={idx} className="text-stone-800">
                          <span className="font-bold text-[#7A1C1C]">• {y.nameNepali || y.nameSanskrit}:</span>{' '}
                          <span className="text-[7.5px] text-stone-600">{y.descriptionNepali}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-stone-600 text-[7.5px]">सामान्य अनुकूल ग्रह संयोजन उपस्थित।</div>
                    )}
                  </div>

                  {/* Doshas & Remedies */}
                  <div className="bg-[#FEF2F2] border border-red-300 rounded-lg p-1.5 space-y-1">
                    <strong className="text-red-900 block border-b border-red-200 pb-0.5">
                      ! ग्रह दोष तथा शान्ति स्थिति (Dosha Assessment)
                    </strong>
                    {yogaEvaluation.doshas.length > 0 ? (
                      yogaEvaluation.doshas.slice(0, 3).map((d, idx) => (
                        <div key={idx} className="text-stone-800">
                          <span className="font-bold text-red-700">• {d.nameNepali || d.nameSanskrit}:</span>{' '}
                          <span className="text-[7.5px] text-stone-600">{d.descriptionNepali}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-stone-600 text-[7.5px]">कुनै गम्भीर मङ्गल, कालसर्प वा घातक दोष देखिएन। कुण्डली सन्तुलित छ।</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Page 2 Footer */}
          <footer className="pt-1.5 border-t flex items-center justify-between text-[8.5px] text-stone-600" style={{ borderColor: '#7A1C1C40' }}>
            <div>॥ ग्रहा राज्यं प्रयच्छन्ति ग्रहा राज्यं हरन्ति च ॥ ग्रहैर्व्याप्तमिदं सर्वं त्रैलोक्यं सचराचरम् ॥</div>
            <div className={`font-bold ${themeHeaderColor}`}>पृष्ठ २ / ३ (Page 2 of 3)</div>
          </footer>
        </div>
      </div>

      {/* =========================================================================
          PAGE 3: COMPLETE 120-YEAR VIMSHOTTARI DASHA, REMEDIES & CERTIFICATION
         ========================================================================= */}
      <div
        className="print-page bg-[#FFFDF7] text-[#1C1917] p-5 max-w-[210mm] mx-auto border-2 rounded-xl shadow-sm relative flex flex-col justify-between mt-6"
        style={{
          width: '210mm',
          height: '297mm',
          minHeight: '297mm',
          boxSizing: 'border-box',
          backgroundColor: '#FFFDF7',
          color: '#1C1917',
          borderColor: colorTheme === 'monochrome' ? '#27272A' : colorTheme === 'classic' ? '#78350F' : '#B45309',
        }}
      >
        <div className={`border p-3.5 rounded-lg relative flex flex-col justify-between h-full bg-[#FFFDF7] ${themeInnerBorder}`}>
          {/* Corner Sacred Glyphs */}
          <div className="absolute top-1.5 left-1.5 text-[11px] text-[#B45309] font-bold select-none">卐</div>
          <div className="absolute top-1.5 right-1.5 text-[11px] text-[#B45309] font-bold select-none">ॐ</div>
          <div className="absolute bottom-1.5 left-1.5 text-[11px] text-[#B45309] font-bold select-none">ॐ</div>
          <div className="absolute bottom-1.5 right-1.5 text-[11px] text-[#B45309] font-bold select-none">卐</div>

          <div className="space-y-2">
            {/* Page 3 Clean Continuous Section Title */}
            <div className="border-b pb-1 text-center" style={{ borderColor: colorTheme === 'monochrome' ? '#52525B' : '#7A1C1C' }}>
              <h2 className={`text-xs sm:text-sm font-black tracking-wider uppercase font-serif ${themeHeaderColor}`}>
                ॥ ३. सम्पूर्ण विंशोत्तरी दशा चक्र (१२० वर्ष) तथा अन्तर्दशा विस्तार ॥
              </h2>
            </div>

            {/* 1. Dasha Balance at Birth */}
            <div className={`border p-2 rounded-lg text-[9px] flex flex-wrap items-center justify-between gap-2 shadow-2xs ${themeBgCard}`}>
              <div>
                <span className={`font-bold ${themeHeaderColor}`}>जन्मकालीन विंशोत्तरी दशा भुक्तभोग्य शेष: </span>
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
              <div className={`text-right font-bold ${themeHeaderColor}`}>
                विंशोत्तरी कुल चक्र: १२० वर्ष
              </div>
            </div>

            {/* 2. Complete 120-Year Vimshottari Mahadasha Timeline Table */}
            {includeFullDasha && (
              <div className="space-y-1">
                <div className={`text-[10px] font-bold flex items-center justify-between ${themeHeaderColor}`}>
                  <span>१. सम्पूर्ण विंशोत्तरी महादशा चक्र (१२० वर्ष)</span>
                  <span className="text-[8px] text-stone-500 font-normal">वि.सं. तथा ई.सं. मिति अनुसार</span>
                </div>

                <div className="overflow-x-auto border border-stone-300 rounded-lg">
                  <table className="w-full text-left text-[8px] border-collapse bg-white">
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
                          <td className="p-0.5 px-1 border-r border-stone-200 font-bold">
                            {m.planet} महादशा
                          </td>
                          <td className="p-0.5 px-1 border-r border-stone-200 font-mono">
                            {m.durationFormattedNepali || `${toDevanagariNumerals(m.durationDays ? Math.round(m.durationDays / 365.25) : 0)} वर्ष`}
                          </td>
                          <td className="p-0.5 px-1 border-r border-stone-200 font-mono">
                            {m.startDateBS ? toDevanagariNumerals(m.startDateBS) : '—'}
                          </td>
                          <td className="p-0.5 px-1 border-r border-stone-200 font-mono">
                            {m.endDateBS ? toDevanagariNumerals(m.endDateBS) : '—'}
                          </td>
                          <td className="p-0.5 px-1 border-r border-stone-200 font-mono text-[7.5px] text-stone-600">
                            {m.startDateAD} ~ {m.endDateAD}
                          </td>
                          <td className="p-0.5 px-1 text-center">
                            {m.isCurrent ? (
                              <span className="px-1.5 py-0.2 bg-[#DC2626] text-white rounded text-[7px] font-bold tracking-wide">
                                चालु महादशा ✓
                              </span>
                            ) : (
                              <span className="text-stone-400 text-[7.5px]">
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
            )}

            {/* 3. Detailed Antardashas Breakdown for Active Mahadasha */}
            {includeAntardasha && activeAntardashas.length > 0 && (
              <div className="space-y-1">
                <div className={`text-[10px] font-bold flex items-center justify-between ${themeHeaderColor}`}>
                  <span>२. चालु {activeMahadasha.planet} महादशाको अन्तर्दशा विस्तार (Antardasha Breakdown)</span>
                  <span className="text-[8px] text-stone-500 font-normal">९ उप-अवधिहरू</span>
                </div>

                <div className="overflow-x-auto border border-stone-300 rounded-lg">
                  <table className="w-full text-left text-[7.5px] border-collapse bg-white">
                    <thead>
                      <tr className="bg-[#FAF7F2] text-[#7A1C1C] border-b border-stone-300 font-bold">
                        <th className="p-0.5 px-1 border-r border-stone-200">अन्तर्दशा</th>
                        <th className="p-0.5 px-1 border-r border-stone-200">सुरु मिति (वि.सं.)</th>
                        <th className="p-0.5 px-1 border-r border-stone-200">समाप्त मिति (वि.सं.)</th>
                        <th className="p-0.5 px-1 border-r border-stone-200">अवधि</th>
                        <th className="p-0.5 px-1 text-center">अवस्था</th>
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

            {/* 4. Astrological Guidance & Vedic Remedies */}
            {includeRemedies && (
              <div className={`border p-2 rounded-lg text-[8px] space-y-1 ${themeBgCard}`}>
                <div className={`font-bold border-b pb-0.5 flex items-center justify-between ${themeHeaderColor}`} style={{ borderColor: '#D9770640' }}>
                  <span>३. व्यक्तिगत वैदिक शान्ति, मन्त्र जप तथा शुभ उपाय (Astrological Guidance & Remedies)</span>
                  <span className="text-stone-500 font-normal">दशानाथ: {activeMahadasha?.planet || 'सूर्य'} | लग्नेश: {lagna.lord || 'सूर्य'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[7.5px] leading-relaxed">
                  <div>
                    <strong className="text-stone-800">रत्न तथा धातु परामर्श:</strong>{' '}
                    <span className="text-stone-600">
                      लग्नेश {lagna.lord} तथा भाग्येशको शुभत्व वृद्धि गर्न <strong>{lagnaLordAttrs.gem}</strong> सुन वा चाँदीमा प्राण-प्रतिष्ठा गरी साइत अनुसार धारण गर्न सकिन्छ।
                    </span>
                  </div>
                  <div>
                    <strong className="text-stone-800">दैनिक मन्त्र जप:</strong>{' '}
                    <span className="text-stone-600">
                      वर्तमान दशाधिपति {activeMahadasha?.planet} तथा इष्ट देवताको प्रसन्नताका लागि: <strong className={themeHeaderColor}>{lagnaLordAttrs.mantra}</strong> (प्रतिदिन १०८ पटक)।
                    </span>
                  </div>
                  <div>
                    <strong className="text-stone-800">दान तथा धर्मकार्य:</strong>{' '}
                    <span className="text-stone-600">
                      {lagnaLordAttrs.day} का दिन गरिब, असाहाय तथा गौसेवामा {lagnaLordAttrs.color} रङ्गका वस्तु, अन्न तथा वस्त्र दान गर्दा ग्रह शान्ति प्राप्त हुन्छ।
                    </span>
                  </div>
                  <div>
                    <strong className="text-stone-800">आचरण तथा कुलपरम्परा:</strong>{' '}
                    <span className="text-stone-600">
                      माता-पिता तथा गुरुजनको आदर, कुलदेवताको नित्य स्मरण, सत्यनिष्ठा र सदाचारले भाग्यबललाई सदैव सबल बनाउँछ।
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Official Astrologer Certification, Signature & Seal Box */}
            {includeSeal && (
              <div className="bg-[#FFFBEB]/60 border border-[#D97706]/40 p-2 rounded-lg text-[8px] space-y-1">
                <div className="flex items-center justify-between border-b border-[#D97706]/30 pb-0.5">
                  <span className={`font-bold ${themeHeaderColor}`}>४. ज्योतिषी प्रमाणीकरण तथा कार्यालय छाप (Official Certification)</span>
                  <span className="text-stone-500">स्थान: {orgAddress}</span>
                </div>

                <div className="flex justify-between items-end gap-3 pt-0.5">
                  <div className="space-y-0.5 max-w-[62%] text-stone-700 leading-relaxed text-[7.5px]">
                    <p>
                      प्रमाणित गरिन्छ कि प्रस्तुत विस्तृत जन्मकुण्डली, स्पष्ट निरयन ग्रहस्थिति, द्वादश भाव, दृष्टि सम्बन्ध तथा १२० वर्षे विंशोत्तरी महादशा चक्र परम्परागत वैदिक सिद्धान्त तथा आधुनिक खगोलीय विधिद्वारा सूक्ष्म रूपमा तयार गरिएको हो।
                    </p>
                    <p className={`italic font-semibold text-[7px] ${themeHeaderColor}`}>
                      ॥ ॐ शान्तिः शान्तिः शान्तिः ॥ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ॥
                    </p>
                  </div>

                  {/* Seal & Signature Stamp Box */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-14 h-14 border-2 border-dashed border-[#B45309] rounded-full flex flex-col items-center justify-center text-[6.5px] text-[#B45309] text-center font-bold p-1 select-none">
                      <span>॥ कार्यालय ॥</span>
                      <span>आधिकारिक छाप</span>
                      <span>卐</span>
                    </div>

                    <div className="text-center space-y-0.5 min-w-[85px]">
                      <div className="w-20 border-b border-stone-800 pb-0.5 text-[7.5px] font-bold text-stone-900 mx-auto">
                        ज्योतिषी हस्ताक्षर
                      </div>
                      <div className="text-[7px] text-stone-600">पण्डित / ज्योतिर्विद्</div>
                      <div className="text-[6.5px] text-stone-500">
                        मिति: {toDevanagariNumerals(new Date().toLocaleDateString('ne-NP'))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Page 3 Footer */}
          <footer className="pt-1.5 border-t flex items-center justify-between text-[8.5px] text-stone-600" style={{ borderColor: '#7A1C1C40' }}>
            <div>बालानन्द वैदिक ज्योतिष, वास्तु तथा कर्मकाण्ड अनुसन्धान प्रणाली v2.0</div>
            <div className={`font-bold ${themeHeaderColor}`}>पृष्ठ ३ / ३ (Page 3 of 3)</div>
          </footer>
        </div>
      </div>
    </div>
  );
};
