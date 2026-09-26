import React from 'react';
import { 
  BirthDetails, 
  LagnaInfo, 
  PlanetPosition, 
  PanchangaData, 
  OrganizationProfile, 
  AstrologerProfile 
} from '../types/astrology';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { generateDivisionalChart } from '../utils/astroCalculations';
import {
  NORTH_INDIAN_HOUSE_GEO
} from '../utils/aspectEngine';
import { OfficialAstrologerSeal } from './common/OfficialAstrologerSeal';
import { VedicKalash } from './common/VedicKalash';
import { GaneshaHeaderCenter } from './GaneshaHeaderCenter';

interface CheenaDocumentProps {
  profile: BirthDetails;
  lagna: LagnaInfo;
  planets: PlanetPosition[];
  panchanga: PanchangaData;
  orgProfile: OrganizationProfile;
  astrologer?: AstrologerProfile;
  showAllPages?: boolean;
}

// Helper to convert planet names to traditional Devanagari abbreviations (e.g. सू, च, मं, बु, बृ, शु, श, रा, के)
function getPlanetAbbr(name: string): string {
  switch (name) {
    case 'सूर्य': return 'सू';
    case 'चन्द्र': return 'च';
    case 'मंगल':
    case 'मङ्गल': return 'मं';
    case 'बुध': return 'बु';
    case 'गुरु':
    case 'गुरू':
    case 'वृहस्पति': return 'बृ';
    case 'शुक्र': return 'शु';
    case 'शनि': return 'श';
    case 'राहु': return 'रा';
    case 'केतु': return 'के';
    case 'लग्न': return 'ल';
    default: return name.slice(0, 2);
  }
}

// Single North Indian Diamond Chart renderer with blue rashi numbers & red planet abbreviations
const NorthIndianDiamondChart: React.FC<{
  title: string;
  houses: Array<{ houseNumber: number; rashiId: number; planets: PlanetPosition[] }>;
  maxSize?: number;
}> = ({ title, houses, maxSize = 225 }) => {
  return (
    <div className="flex flex-col items-center select-none">
      {/* Blue Pill Label */}
      <div className="bg-[#2563eb] text-white text-[11px] font-bold px-5 py-0.5 rounded-full mb-0.5 shadow-xs">
        {title}
      </div>

      {/* SVG Canvas Box */}
      <div
        className="relative w-full aspect-square bg-white border border-stone-800 p-0.5 shadow-xs"
        style={{ maxWidth: `${maxSize}px` }}
      >
        <svg viewBox="0 0 400 400" className="w-full h-full stroke-stone-900 fill-none stroke-[2]">
          {/* Outer Square Box */}
          <rect x="5" y="5" width="390" height="390" className="stroke-stone-900 stroke-[2.5]" />
          {/* Diagonals */}
          <line x1="5" y1="5" x2="395" y2="395" />
          <line x1="395" y1="5" x2="5" y2="395" />
          {/* Inner Diamond */}
          <polygon points="200,5 395,200 200,395 5,200" className="stroke-stone-900 stroke-[2.5]" />
        </svg>

        {/* House Content Overlays */}
        {houses.map((house) => {
          const geo = NORTH_INDIAN_HOUSE_GEO[house.houseNumber];
          if (!geo) return null;

          return (
            <div
              key={house.houseNumber}
              className="absolute text-center transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none"
              style={{ left: `${(geo.center.x / 400) * 100}%`, top: `${(geo.center.y / 400) * 100}%` }}
            >
              {/* Blue Rashi Number */}
              <span className="text-[12px] font-black text-[#2563eb] leading-none mb-0.5">
                {toDevanagariNumerals(house.rashiId)}
              </span>

              {/* Red Planet Initials */}
              <div className="flex flex-wrap justify-center items-center gap-0.5 max-w-[80px]">
                {house.planets.map((p) => (
                  <span
                    key={p.id}
                    className="text-red-700 font-bold text-[11.5px] leading-tight px-0.5"
                  >
                    {getPlanetAbbr(p.name)}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Authentic Green Repeating ॐ Border Frame matching user sample PDF
 * - Outer 1.5px green border (#166534)
 * - Channel of repeating green ॐ characters (#166534)
 * - Inner 1.5px green border (#166534)
 * - White page background (#ffffff)
 * - Standard A4 dimensions (width: 210mm, minHeight: 297mm)
 * - Clean page breaks for multi-page PDF generation
 */
export const GreenOmBorderFrame: React.FC<{
  children: React.ReactNode;
  className?: string;
  pageNumber?: number;
}> = ({ children, className = '', pageNumber }) => {
  const omArrayHeader = Array.from({ length: 23 });
  const omArraySide = Array.from({ length: 33 });

  return (
    <div
      className={`print-page printable-page a4-patrika-page relative w-full bg-white text-stone-900 border-2 border-[#166534] p-1.5 sm:p-2.5 my-4 print:my-0 font-serif shadow-lg print:shadow-none box-border flex flex-col justify-between ${className}`}
      style={{
        width: '210mm',
        minHeight: '297mm',
        maxWidth: '210mm',
        margin: '0 auto',
        boxSizing: 'border-box',
        pageBreakAfter: 'always',
        pageBreakInside: 'avoid',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Outer Om Top Row */}
      <div className="flex justify-between items-center text-[#166534] text-xs sm:text-sm font-black px-1 select-none overflow-hidden h-5 leading-none shrink-0">
        {omArrayHeader.map((_, i) => (
          <span key={i} className="mx-auto font-black scale-110">ॐ</span>
        ))}
      </div>

      <div className="flex flex-1 my-0.5 min-h-0">
        {/* Outer Om Left Column */}
        <div className="flex flex-col justify-between items-center text-[#166534] text-xs sm:text-sm font-black py-0.5 pr-1 select-none w-5 leading-none shrink-0">
          {omArraySide.map((_, i) => (
            <span key={i} className="font-black scale-110">ॐ</span>
          ))}
        </div>

        {/* Inner Border Box & Content */}
        <div className="flex-1 border-2 border-[#166534] p-3 sm:p-4 bg-white flex flex-col justify-between shadow-2xs overflow-hidden">
          {children}
        </div>

        {/* Outer Om Right Column */}
        <div className="flex flex-col justify-between items-center text-[#166534] text-xs sm:text-sm font-black py-0.5 pl-1 select-none w-5 leading-none shrink-0">
          {omArraySide.map((_, i) => (
            <span key={i} className="font-black scale-110">ॐ</span>
          ))}
        </div>
      </div>

      {/* Outer Om Bottom Row */}
      <div className="flex justify-between items-center text-[#166534] text-xs sm:text-sm font-black px-1 select-none overflow-hidden h-5 leading-none shrink-0">
        {omArrayHeader.map((_, i) => (
          <span key={i} className="mx-auto font-black scale-110">ॐ</span>
        ))}
      </div>
    </div>
  );
};

export const OmBorderFrame = GreenOmBorderFrame;

// Avakahada Chakra Attributes Lookup Table
export const NAKSHATRA_AVAKAHADA: Record<string, {
  namakshara: string[];
  yoni: string;
  nadi: string;
  gana: string;
  varga: string;
  varna: string;
  ashana: string;
}> = {
  'अश्विनी': { namakshara: ['चु', 'चे', 'चो', 'ला'], yoni: 'अश्व', nadi: 'आद्य', gana: 'देव', varga: 'गरुड', varna: 'क्षत्रिय', ashana: 'उपवेशन' },
  'भरणी': { namakshara: ['ली', 'लू', 'ले', 'लो'], yoni: 'गज', nadi: 'मध्य', gana: 'मनुष्य', varga: 'मार्जार', varna: 'क्षत्रिय', ashana: 'शयन' },
  'कृत्तिका': { namakshara: ['अ', 'ई', 'उ', 'ए'], yoni: 'मेष', nadi: 'अन्त्य', gana: 'राक्षस', varga: 'सिंह', varna: 'ब्राह्मण', ashana: 'उत्थान' },
  'रोहिणी': { namakshara: ['ओ', 'वा', 'वी', 'वू'], yoni: 'सर्प', nadi: 'अन्त्य', gana: 'मनुष्य', varga: 'श्वान', varna: 'शूद्र', ashana: 'उपवेशन' },
  'मृगशिरा': { namakshara: ['वे', 'वो', 'का', 'की'], yoni: 'सर्प', nadi: 'मध्य', gana: 'देव', varga: 'सर्प', varna: 'वैश्य', ashana: 'शयन' },
  'आर्द्रा': { namakshara: ['कु', 'घ', 'ङ', 'छ'], yoni: 'श्वान', nadi: 'आद्य', gana: 'मनुष्य', varga: 'मूषक', varna: 'शूद्र', ashana: 'उत्थान' },
  'पुनर्वसु': { namakshara: ['के', 'को', 'हा', 'ही'], yoni: 'मार्जार', nadi: 'आद्य', gana: 'देव', varga: 'मार्जार', varna: 'वैश्य', ashana: 'उपवेशन' },
  'पुष्य': { namakshara: ['हू', 'हे', 'हो', 'डा'], yoni: 'मेष', nadi: 'मध्य', gana: 'देव', varga: 'सिंह', varna: 'क्षत्रिय', ashana: 'शयन' },
  'आश्लेषा': { namakshara: ['डी', 'डू', 'डे', 'डो'], yoni: 'मार्जार', nadi: 'अन्त्य', gana: 'राक्षस', varga: 'श्वान', varna: 'शूद्र', ashana: 'उत्थान' },
  'मघा': { namakshara: ['मा', 'मी', 'मू', 'मे'], yoni: 'मूषक', nadi: 'अन्त्य', gana: 'राक्षस', varga: 'मूषक', varna: 'शूद्र', ashana: 'उपवेशन' },
  'पूर्वाफाल्गुनी': { namakshara: ['मो', 'टा', 'टी', 'टू'], yoni: 'मूषक', nadi: 'मध्य', gana: 'मनुष्य', varga: 'सिंह', varna: 'ब्राह्मण', ashana: 'शयन' },
  'उत्तराफाल्गुनी': { namakshara: ['टे', 'टो', 'पा', 'पी'], yoni: 'गौ', nadi: 'आद्य', gana: 'मनुष्य', varga: 'गरुड', varna: 'क्षत्रिय', ashana: 'उत्थान' },
  'हस्त': { namakshara: ['पू', 'ष', 'ण', 'ठा'], yoni: 'महिष', nadi: 'आद्य', gana: 'देव', varga: 'मार्जार', varna: 'वैश्य', ashana: 'उपवेशन' },
  'चित्रा': { namakshara: ['पे', 'पो', 'रा', 'री'], yoni: 'व्याघ्र', nadi: 'मध्य', gana: 'राक्षस', varga: 'सर्प', varna: 'शूद्र', ashana: 'शयन' },
  'स्वाती': { namakshara: ['रू', 'रे', 'रो', 'ता'], yoni: 'महिष', nadi: 'अन्त्य', gana: 'देव', varga: 'मूषक', varna: 'शूद्र', ashana: 'उत्थान' },
  'विशाखा': { namakshara: ['ती', 'तू', 'ते', 'तो'], yoni: 'व्याघ्र', nadi: 'अन्त्य', gana: 'राक्षस', varga: 'मार्जार', varna: 'म्लेच्छ', ashana: 'उपवेशन' },
  'अनुराधा': { namakshara: ['ना', 'नी', 'नू', 'ने'], yoni: 'मृग', nadi: 'मध्य', gana: 'देव', varga: 'सिंह', varna: 'शूद्र', ashana: 'शयन' },
  'ज्येष्ठा': { namakshara: ['नो', 'या', 'यी', 'यू'], yoni: 'मृग', nadi: 'आद्य', gana: 'राक्षस', varga: 'श्वान', varna: 'वैश्य', ashana: 'उत्थान' },
  'मूल': { namakshara: ['ये', 'यो', 'भा', 'भी'], yoni: 'श्वान', nadi: 'आद्य', gana: 'राक्षस', varga: 'सर्प', varna: 'क्षत्रि', ashana: 'मूल' },
  'पूर्वाषाढा': { namakshara: ['भू', 'धा', 'फा', 'ढा'], yoni: 'वानर', nadi: 'मध्य', gana: 'मनुष्य', varga: 'मूषक', varna: 'ब्राह्मण', ashana: 'उपवेशन' },
  'उत्तराषाढा': { namakshara: ['भे', 'भो', 'जा', 'जी'], yoni: 'नकुल', nadi: 'अन्त्य', gana: 'मनुष्य', varga: 'गरुड', varna: 'क्षत्रिय', ashana: 'शयन' },
  'श्रवण': { namakshara: ['खी', 'खू', 'खे', 'खो'], yoni: 'वानर', nadi: 'अन्त्य', gana: 'देव', varga: 'मार्जार', varna: 'शूद्र', ashana: 'उत्थान' },
  'धनिष्ठा': { namakshara: ['गा', 'गी', 'गु', 'गे'], yoni: 'सिंह', nadi: 'मध्य', gana: 'राक्षस', varga: 'सिंह', varna: 'वैश्य', ashana: 'उपवेशन' },
  'शतभिषा': { namakshara: ['गो', 'सा', 'सी', 'सू'], yoni: 'अश्व', nadi: 'आद्य', gana: 'राक्षस', varga: 'श्वान', varna: 'म्लेच्छ', ashana: 'शयन' },
  'पूर्वाभाद्रपदा': { namakshara: ['से', 'सो', 'दा', 'दी'], yoni: 'सिंह', nadi: 'आद्य', gana: 'मनुष्य', varga: 'सर्प', varna: 'ब्राह्मण', ashana: 'उत्थान' },
  'उत्तराभाद्रपदा': { namakshara: ['दू', 'थ', 'झ', 'ञ'], yoni: 'गौ', nadi: 'मध्य', gana: 'मनुष्य', varga: 'मूषक', varna: 'क्षत्रिय', ashana: 'उपवेशन' },
  'रेवती': { namakshara: ['दे', 'दो', 'चा', 'ची'], yoni: 'गज', nadi: 'अन्त्य', gana: 'देव', varga: 'मार्जार', varna: 'शूद्र', ashana: 'शयन' },
};

// Ghatachakra Lookup Table by Moon Rashi
export const GHATA_CHAKRA_MAP: Record<string, {
  tithi: string;
  vara: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  prahara: string;
  lagna: string;
  rashi: string;
}> = {
  'मेष': { tithi: '१, ६, ११', vara: 'आइतबार', nakshatra: 'मघा', yoga: 'विष्कम्भ', karana: 'बव', prahara: '१', lagna: 'मेष', rashi: 'कन्या' },
  'वृष': { tithi: '५, १०, १५', vara: 'शनिबार', nakshatra: 'हस्त', yoga: 'शूल', karana: 'कौलव', prahara: '२', lagna: 'वृष', rashi: 'धनु' },
  'मिथुन': { tithi: '२, ७, १२', vara: 'सोमबार', nakshatra: 'स्वाती', yoga: 'गण्ड', karana: 'तैतिल', prahara: '३', lagna: 'मिथुन', rashi: 'मकर' },
  'कर्कट': { tithi: '२, ७, १२', vara: 'बुधबार', nakshatra: 'अनुराधा', yoga: 'व्याघात', karana: 'गर', prahara: '४', lagna: 'कन्या', rashi: 'कुम्भ' },
  'सिंह': { tithi: '३, ८, १३', vara: 'बिहीबार', nakshatra: 'मूल', yoga: 'वज्र', karana: 'वणिज', prahara: '१', lagna: 'मकर', rashi: 'मीन' },
  'कन्या': { tithi: '५, १०, १५', vara: 'शनिबार', nakshatra: 'श्रवण', yoga: 'व्यतीपात', karana: 'विष्टि', prahara: '२', lagna: 'मीन', rashi: 'मेष' },
  'तुला': { tithi: '४, ९, १४', vara: 'बिहीबार', nakshatra: 'शतभिषा', yoga: 'परिघ', karana: 'शकुनि', prahara: '३', lagna: 'धनु', rashi: 'वृष' },
  'वृश्चिक': { tithi: '१, ६, ११', vara: 'शुक्रबार', nakshatra: 'रेवती', yoga: 'वैधृति', karana: 'चतुष्पद', prahara: '४', lagna: 'वृषभ', rashi: 'मिथुन' },
  'धनु': { tithi: '३, ८, १३', vara: 'शुक्रबार', nakshatra: 'भरणी', yoga: 'वज्र', karana: 'तैतिल', prahara: '१', lagna: 'धनु', rashi: 'मीन' },
  'मकर': { tithi: '४, ९, १४', vara: 'मंगलबार', nakshatra: 'रोहिणी', yoga: 'अतिगण्ड', karana: 'नाग', prahara: '२', lagna: 'कुम्भ', rashi: 'सिंह' },
  'कुम्भ': { tithi: '३, ८, १३', vara: 'बिहीबार', nakshatra: 'आर्द्रा', yoga: 'सुकर्मा', karana: 'किंस्तुघ्न', prahara: '३', lagna: 'मिथुन', rashi: 'कन्या' },
  'मीन': { tithi: '५, १०, १५', vara: 'शुक्रबार', nakshatra: 'आश्लेषा', yoga: 'धृति', karana: 'बालव', prahara: '४', lagna: 'कर्कट', rashi: 'तुला' },
};

export const CheenaDocument: React.FC<CheenaDocumentProps> = ({
  profile,
  lagna,
  planets,
  panchanga,
  orgProfile,
  astrologer,
  showAllPages = true,
}) => {
  // Compute traditional dates & numbers
  const bsDateParts = profile.dateBS ? profile.dateBS.replace(/\s+/g, '-').split('-') : ['२०८१', '०१', '०१'];
  const bsYear = parseInt(bsDateParts[0]) || 2081;
  const shakaYear = bsYear - 135;
  const adDateParts = profile.dateAD ? profile.dateAD.split('-') : ['2025', '01', '01'];
  const adYear = adDateParts[0] || '2025';
  const adDay = adDateParts[2] || '०१';
  const adMonthNum = parseInt(adDateParts[1]) || 1;

  const englishMonthNames = ['जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन', 'जुलाई', 'अगस्ट', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर'];
  const adMonthName = englishMonthNames[adMonthNum - 1] || 'मार्च';

  // Compute D1, D9, Chandra and Bhava houses
  const d1Chart = generateDivisionalChart('D1', lagna, planets);
  const d9Chart = generateDivisionalChart('D9', lagna, planets);

  const moonPlanet = planets.find((p) => p.name === 'चन्द्र') || planets[1] || planets[0];
  const moonRashiId = moonPlanet?.rashiId || 9; // Defaults to Sagittarius (धनु)

  const rashiHouses = Array.from({ length: 12 }, (_, idx) => {
    const houseNum = idx + 1;
    const houseRashiId = ((moonRashiId - 1 + idx) % 12) + 1;
    const housePlanets = planets.filter((p) => p.rashiId === houseRashiId);
    return { houseNumber: houseNum, rashiId: houseRashiId, planets: housePlanets };
  });

  const bhavaHouses = Array.from({ length: 12 }, (_, idx) => {
    const houseNum = idx + 1;
    const houseRashiId = (((lagna?.rashiId || 1) - 1 + idx) % 12) + 1;
    const housePlanets = planets.filter((p) => p.bhava === houseNum);
    return { houseNumber: houseNum, rashiId: houseRashiId, planets: housePlanets };
  });

  // Avakahada & Ghatachakra
  const nakshatraName = panchanga?.nakshatra?.name || 'मूल';
  const padaNum = panchanga?.nakshatra?.pada || 4;
  const avakahadaInfo = NAKSHATRA_AVAKAHADA[nakshatraName] || NAKSHATRA_AVAKAHADA['मूल'];
  const aksharaChar = avakahadaInfo.namakshara[(padaNum - 1) % 4] || 'भी';

  const moonRashiName = panchanga?.moonRashi || 'धनु';
  const ghataInfo = GHATA_CHAKRA_MAP[moonRashiName] || GHATA_CHAKRA_MAP['धनु'];

  // Safe coordinates
  const lat = profile?.location?.latitude || 27.7172;
  const lng = profile?.location?.longitude || 85.3240;
  const latDeg = Math.floor(lat);
  const latMin = Math.round((lat - latDeg) * 60);
  const lngDeg = Math.floor(lng);
  const lngMin = Math.round((lng - lngDeg) * 60);

  // Dasha Cycle Calculation for Page 3
  const VIM_LORDS: Array<{ name: string; years: number }> = [
    { name: 'केतु', years: 7 },
    { name: 'शुक्र', years: 20 },
    { name: 'सूर्य', years: 6 },
    { name: 'चन्द्र', years: 10 },
    { name: 'मङ्गल', years: 7 },
    { name: 'राहु', years: 18 },
    { name: 'वृहस्पति', years: 16 },
    { name: 'शनि', years: 19 },
    { name: 'बुध', years: 17 },
  ];

  const nakshatraIndex = Object.keys(NAKSHATRA_AVAKAHADA).indexOf(nakshatraName);
  const safeNakIdx = nakshatraIndex !== -1 ? nakshatraIndex : 18; // Default 18 (Moola)
  const vimStartIdx = safeNakIdx % 9;

  // Reorder Vimshottari starting from birth nakshatra lord
  const orderedVimLords = Array.from({ length: 9 }, (_, i) => VIM_LORDS[(vimStartIdx + i) % 9]);

  // Tribhagi periods
  const TRIBHAGI_LORDS: Array<{ name: string; y: number; m: number; totalY: number }> = [
    { name: 'केतु', y: 4, m: 0, totalY: 4 },
    { name: 'शुक्र', y: 13, m: 4, totalY: 13.333 },
    { name: 'सूर्य', y: 4, m: 0, totalY: 4 },
    { name: 'चन्द्र', y: 6, m: 8, totalY: 6.666 },
    { name: 'मङ्गल', y: 4, m: 8, totalY: 4.666 },
    { name: 'राहु', y: 12, m: 0, totalY: 12 },
    { name: 'वृहस्पति', y: 10, m: 8, totalY: 10.666 },
    { name: 'शनि', y: 12, m: 8, totalY: 12.666 },
    { name: 'बुध', y: 11, m: 4, totalY: 11.333 },
  ];
  const orderedTriLords = Array.from({ length: 9 }, (_, i) => TRIBHAGI_LORDS[(vimStartIdx + i) % 9]);

  // Yogini: 8 Yoginis
  const YOGINI_CYCLE: Array<{ name: string; years: number }> = [
    { name: 'मङ्गला', years: 1 },
    { name: 'पिङ्गला', years: 2 },
    { name: 'धान्या', years: 3 },
    { name: 'भ्रामरी', years: 4 },
    { name: 'भद्रिका', years: 5 },
    { name: 'उल्का', years: 6 },
    { name: 'सिद्धा', years: 7 },
    { name: 'सङ्कटा', years: 8 },
  ];
  const yoginiStartIdx = ((safeNakIdx + 1 + 3) % 8 || 8) - 1;
  const orderedYoginis = Array.from({ length: 8 }, (_, i) => YOGINI_CYCLE[(yoginiStartIdx + i) % 8]);

  return (
    <div className="space-y-6 print:space-y-0 font-serif text-stone-900 max-w-4xl mx-auto select-text">
      
      {/* ========================================================================= */}
      {/* PAGE 1: परम्परागत सङ्कल्प, अवकहडा, घातचक्र, पञ्चाङ्ग फल एवं आशीर्वचन */}
      {/* ========================================================================= */}
      <GreenOmBorderFrame pageNumber={1}>
        <div className="h-full flex flex-col justify-start text-stone-900 space-y-2">
          
          {/* Top Traditional Ganesha Header */}
          <GaneshaHeaderCenter
            title="॥ श्री जन्मपत्रिका ॥"
            orgName={orgProfile.name}
          />

          {/* ========================================================================= */}
          {/* कुण्डली खोल्दा भनिने शास्त्रीय मङ्गलाचरण ब्लक (Kundali Opening Invocations) */}
          {/* ========================================================================= */}
          <div className="border-2 border-red-700 rounded-lg p-2 bg-gradient-to-r from-amber-50/90 via-[#fffaf5] to-amber-50/90 shadow-2xs space-y-1 shrink-0 font-serif">
            <div className="flex items-center justify-between border-b border-red-700/40 pb-0.5">
              <div className="flex items-center gap-1.5 text-red-800 font-bold text-xs sm:text-[12.5px]">
                <span>🕉️</span>
                <span>॥ कुण्डली खोल्दा / वाचन गर्दा भनिने शास्त्रीय मङ्गलाचरणम् ॥</span>
              </div>
              <span className="text-[9px] font-bold text-[#166534] bg-emerald-100/90 px-2 py-0.2 rounded border border-emerald-300">
                दैवज्ञ वाचन मङ्गल स्तुति
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 text-[10px]">
              {/* Card 1: गणेश एवं गुरु वन्दना */}
              <div className="p-1.5 bg-white/90 rounded border border-amber-300 space-y-0.5">
                <span className="font-bold text-red-800 block text-[9.5px] border-b border-amber-200 pb-0.5">
                  १. विघ्नहर्ता एवं गुरु वन्दना
                </span>
                <p className="text-red-900 font-semibold italic text-[9.5px] leading-tight">
                  विघ्नेशं च समभ्यर्च्य भास्करं गणनायकम् ।<br />
                  होराशास्त्रप्रवृत्त्यर्थं क्रियते मङ्गलादरः ॥
                </p>
                <p className="text-stone-600 text-[8.5px] leading-tight">
                  कुण्डली खोल्दा विघ्नहर्ता गणेश र गुरुको स्मरणले सम्पूर्ण विघ्न नाश भई कुण्डली विचार सत्य र फलदायी हुन्छ।
                </p>
              </div>

              {/* Card 2: नवग्रह मङ्गल स्तुति */}
              <div className="p-1.5 bg-white/90 rounded border border-amber-300 space-y-0.5">
                <span className="font-bold text-blue-900 block text-[9.5px] border-b border-amber-200 pb-0.5">
                  २. नवग्रह मङ्गल सुप्रभातम्
                </span>
                <p className="text-blue-950 font-semibold italic text-[9.5px] leading-tight">
                  ब्रह्मा मुरारिस्त्रिपुरान्तकारी भानुः शशी भूमिसुतो बुधश्च ।<br />
                  गुरुश्च शुक्रः शनिराहुकेतवः कुर्वन्तु सर्वे शुभसुप्रभातम् ॥
                </p>
                <p className="text-stone-600 text-[8.5px] leading-tight">
                  सूर्य देखि केतुसम्मका सम्पूर्ण नवग्रहहरूले जातकको जीवनमा सदैव आरोग्य, शान्ति र सर्वसिद्धि प्रदान गरून्।
                </p>
              </div>

              {/* Card 3: कर्मफल उद्घाटन एवं लग्न शुद्धि */}
              <div className="p-1.5 bg-white/90 rounded border border-amber-300 space-y-0.5">
                <span className="font-bold text-[#166534] block text-[9.5px] border-b border-amber-200 pb-0.5">
                  ३. कर्मफल एवं लग्न शुद्धि
                </span>
                <p className="text-emerald-950 font-semibold italic text-[9.5px] leading-tight">
                  यद्यत् पूर्वकृतं कर्म शुभाशुभमुपार्जितम् ।<br />
                  तस्य तस्य फलोत्पत्तौ व्यनक्ति दैवमात्मनः ॥
                </p>
                <p className="text-stone-600 text-[8.5px] leading-tight">
                  तदेव लग्नं सुदिनं तदेव ताराबलं चन्द्रबलं तदेव । विद्याबलं दैवबलं तदेव लक्ष्मीपते तेऽङ्घ्रियुगं स्मरामि ॥
                </p>
              </div>
            </div>
          </div>

          {/* Traditional Sanskrit Prose with Dark Green text & Bold Red Highlights */}
          {(() => {
            const tName = panchanga?.tithi?.name || 'अष्टमी';
            const tPaksha = panchanga?.tithi?.paksha || 'कृष्ण';
            const nName = nakshatraName;
            const nPada = padaNum;
            const yName = panchanga?.yoga?.name || 'वरीयान';
            const kName = panchanga?.karana?.name || 'तैतिल';
            const dName = panchanga?.dayNameNepali || 'बिहीबार';
            const samName = panchanga?.samvatsara || 'प्लव';
            const aName = panchanga?.ayana || 'उत्तर';
            const rName = panchanga?.ritu || 'वसन्त';
            const mRashi = moonRashiName;
            const solarMonth = (panchanga as any)?.monthNameNepali || 'चैत्र';
            const chandraMonth = (panchanga as any)?.chandraMonth || solarMonth;

            return (
              <div className="space-y-2 text-stone-900 font-serif">
                {/* Sanskrit Prose */}
                <div className="text-[12px] sm:text-[12.5px] leading-relaxed text-justify text-[#166534] bg-amber-50/20 p-2 rounded border border-[#166534]/30 space-y-1.5">
                  <p className="leading-relaxed">
                    <span className="text-red-700 font-bold">श्रीशालिवाहनीयशाके {toDevanagariNumerals(shakaYear)}</span>{' '}
                    <span className="text-red-700 font-bold">श्रीवीरविक्रमादित्य संवत् {toDevanagariNumerals(bsYear)}</span>{' '}
                    <span className="text-red-700 font-bold">इसवीय सन् {toDevanagariNumerals(adYear)}</span> वर्षे{' '}
                    <span className="text-red-700 font-bold">{samName}</span> नामसंवत्सरे श्रीसूर्ये{' '}
                    <span className="text-red-700 font-bold">{aName}</span> अयने{' '}
                    <span className="text-red-700 font-bold">{rName}</span> ऋतौ, अथ चान्द्रमानेन{' '}
                    <span className="text-red-700 font-bold">{chandraMonth}</span> मासे{' '}
                    <span className="text-red-700 font-bold">{tPaksha}</span> पक्षे{' '}
                    <span className="text-red-700 font-bold">{dName.replace('बार', '')}</span> वासरे{' '}
                    <span className="text-red-700 font-bold">{tName}</span> तिथौ, घट्यादि:{' '}
                    <span className="text-red-700 font-bold">१६ घ २६ प</span> पर नवमी तिथौ{' '}
                    <span className="text-red-700 font-bold">{nName}</span> नक्षत्रघट्यादि:{' '}
                    <span className="text-red-700 font-bold">२९:१६:१३</span> तत् {nName} नक्षत्रस्य जन्मसमये भुक्तघट्यादि:{' '}
                    <span className="text-red-700 font-bold">६३:४६:४१</span> भभोगघट्यादि:{' '}
                    <span className="text-red-700 font-bold">६६:२५:४८</span> प्रसङ्गादय:{' '}
                    <span className="text-red-700 font-bold">{yName}</span> योगे तात्कालिक{' '}
                    <span className="text-red-700 font-bold">{kName}</span> करणे इति पञ्चाङ्ग। अथ सौरमानेन मासोत्तमे{' '}
                    <span className="text-red-700 font-bold">{solarMonth}</span> मासे सूर्यसंक्रमाद् गतदिनेषु{' '}
                    <span className="text-red-700 font-bold">६</span> तदनुसार (ईसवीयमास{' '}
                    <span className="text-red-700 font-bold">{adMonthName} तारिक {toDevanagariNumerals(adDay)}</span>) अत्र{' '}
                    <span className="text-red-700 font-bold">{dName.replace('बार', '')}</span> वासरे प्रामाणिक समयानुसारेन{' '}
                    <span className="text-red-700 font-bold">{toDevanagariNumerals(profile?.time || '१६:५०:००')}</span> श्रीसूर्योदयादिष्टघट्यादि:{' '}
                    <span className="text-red-700 font-bold">२६:३७:५</span> तदा जन्मसमये{' '}
                    <span className="text-red-700 font-bold">{lagna?.rashiName || 'सिंह'}</span> लग्नोदये{' '}
                    <span className="text-red-700 font-bold">{d9Chart?.houses?.[0]?.rashiName || 'कन्या'}</span> नवमांशके{' '}
                    <span className="text-red-700 font-bold">{mRashi}</span> राशिगते चन्द्रमसि एवंविधे पञ्चाङ्गशुद्धे{' '}
                    <span className="text-red-700 font-bold">{profile?.location?.country || 'नेपाल'}</span> देशे{' '}
                    <span className="text-red-700 font-bold">{profile?.location?.province || 'बागमती'}</span> प्रदेशे{' '}
                    <span className="text-red-700 font-bold">{profile?.location?.district || 'काठमान्डौ'}</span> मण्डले{' '}
                    <span className="text-red-700 font-bold">{profile?.location?.tole || profile?.location?.localBody || 'चुनदेवी टोल'}</span> ग्राम (जन्मस्थान{' '}
                    <span className="text-red-700 font-bold">{profile?.location?.name || 'काठमान्डौ'}</span> यत्राक्षांश{' '}
                    <span className="text-red-700 font-bold">{toDevanagariNumerals(latDeg)} उ {toDevanagariNumerals(latMin)}</span> देशान्तर{' '}
                    <span className="text-red-700 font-bold">{toDevanagariNumerals(lngDeg)} पू {toDevanagariNumerals(lngMin)}</span> मानक समय{' '}
                    <span className="text-red-700 font-bold">+५:४५</span> स्थानीय जन्मसमय{' '}
                    <span className="text-red-700 font-bold">{toDevanagariNumerals(profile?.time || '१६:४६:१५')}</span>) निवसत:{' '}
                    <span className="text-red-700 font-bold">{profile?.fatherDetails?.gotra || '............'}</span> गोत्रोत्पन्नस्य श्रीमत:{' '}
                    <span className="text-red-700 font-bold">{profile?.fatherDetails?.name || profile?.parentName || 'अमृत घलान'}</span> इतस्य कुलोचित विवाहिता भार्याया: श्रीमत्या:{' '}
                    <span className="text-red-700 font-bold">{profile?.motherDetails?.name || 'शुकु लक्ष्मी'}</span> नाम्नीदेव्या:{' '}
                    <span className="text-red-700 font-bold">{profile?.familyHistory?.childOrder || 'प्रथम'}</span> गर्भे{' '}
                    <span className="text-red-700 font-bold">{profile?.familyHistory?.childType || (profile?.gender === 'male' ? 'पुत्र' : 'पुत्री')}</span> रत्नमजीजनत् ।
                  </p>
                  <p className="leading-relaxed border-t border-[#166534]/20 pt-1">
                    अस्य होराशास्त्रप्रमाणेण <span className="text-red-700 font-bold">{nName}:</span> नक्षत्रस्य{' '}
                    <span className="text-red-700 font-bold">{toDevanagariNumerals(nPada) === '१' ? 'प्रथम' : toDevanagariNumerals(nPada) === '२' ? 'द्वितीय' : toDevanagariNumerals(nPada) === '३' ? 'तृतीय' : 'चतुर्थ'}</span> चरणस्य{' '}
                    <span className="text-red-700 font-bold">"{aksharaChar}"</span> काराक्षरस्य{' '}
                    <span className="text-red-700 font-bold">{avakahadaInfo.yoni}:</span> योनि,{' '}
                    <span className="text-red-700 font-bold">{avakahadaInfo.nadi}</span> नाडी,{' '}
                    <span className="text-red-700 font-bold">{avakahadaInfo.gana}</span> गण,{' '}
                    <span className="text-red-700 font-bold">{avakahadaInfo.varga}:</span> वर्ग,{' '}
                    <span className="text-red-700 font-bold">{avakahadaInfo.varna}:</span> वर्ण,{' '}
                    <span className="text-red-700 font-bold">{avakahadaInfo.ashana}:</span> आसन: श्री{' '}
                    <span className="text-red-700 font-bold">{profile?.name || 'भिम कुमारी घलान'}</span> इति चिरञ्जीवी शुभनाम प्रतिष्ठितम्। स च देवद्विजाशीर्वादैर्दीर्घमायूर्भूयात्।
                  </p>
                </div>

                {/* 2-Column Grid: Complete Avakahada Table + Full Ghatachakra Table */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10.5px]">
                  {/* Left: Avakahada Chakra Table */}
                  <div className="border border-[#166534] rounded-lg p-2 bg-amber-50/40 space-y-1">
                    <div className="text-center font-bold text-red-800 border-b border-[#166534]/30 pb-0.5">
                      ॥ जन्मकालीन अवकहडा चक्रम् (Avakahada Attributes) ॥
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-stone-800 text-[10px]">
                      <p><strong>जन्मनक्षत्र:</strong> <span className="text-red-700 font-bold">{nName}</span> ({toDevanagariNumerals(nPada)} पाद)</p>
                      <p><strong>नामकरण अक्षर:</strong> <span className="text-red-700 font-bold">"{aksharaChar}"</span></p>
                      <p><strong>चन्द्र राशि:</strong> <span className="font-semibold">{mRashi}</span></p>
                      <p><strong>सूर्य राशि:</strong> <span className="font-semibold">{panchanga?.sunRashi || 'कुम्भ'}</span></p>
                      <p><strong>जन्म लग्न:</strong> <span className="font-semibold">{lagna?.rashiName || 'सिंह'}</span></p>
                      <p><strong>राशि स्वामी:</strong> <span className="font-semibold">{(moonPlanet as any)?.rashiLord || 'बृहस्पति'}</span></p>
                      <p><strong>वर्ण / वश्य:</strong> {avakahadaInfo.varna} / चतुष्पद</p>
                      <p><strong>योनि / नाडी:</strong> {avakahadaInfo.yoni} / {avakahadaInfo.nadi}</p>
                      <p><strong>गण / वर्ग:</strong> {avakahadaInfo.gana} / {avakahadaInfo.varga}</p>
                      <p><strong>पाया (चरण):</strong> <span className="text-amber-900 font-bold">{nPada <= 2 ? 'स्वर्ण (सुन)' : 'रजत (चाँदी)'}</span></p>
                    </div>
                  </div>

                  {/* Right: Ghatachakra Table */}
                  <div className="border border-red-700 rounded-lg p-2 bg-red-50/30 space-y-1">
                    <div className="text-center font-bold text-red-800 border-b border-red-300 pb-0.5">
                      ॥ जन्म राशि अनुसार घातचक्र सतर्कता (Ghata Chakra) ॥
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-stone-800 text-[10px]">
                      <p><strong>घात तिथि:</strong> <span className="text-red-700 font-bold">{ghataInfo.tithi}</span></p>
                      <p><strong>घात वार:</strong> <span className="text-red-700 font-bold">{ghataInfo.vara}</span></p>
                      <p><strong>घात नक्षत्र:</strong> {ghataInfo.nakshatra}</p>
                      <p><strong>घात योग:</strong> {ghataInfo.yoga}</p>
                      <p><strong>घात करण:</strong> {ghataInfo.karana}</p>
                      <p><strong>घात प्रहर:</strong> {toDevanagariNumerals(ghataInfo.prahara)} प्रहर</p>
                      <p><strong>घात लग्न:</strong> {ghataInfo.lagna}</p>
                      <p><strong>घात चन्द्र राशि:</strong> {ghataInfo.rashi}</p>
                      <p className="col-span-2 text-[9px] text-stone-600 italic pt-0.5 border-t border-red-200">
                        * उक्त घात बार, तिथि तथा नक्षत्रमा जोखिमपूर्ण कार्य गर्दा कुलदेवताको स्मरण गरी मात्र प्रारम्भ गर्नुहोला।
                      </p>
                    </div>
                  </div>
                </div>

                {/* Panchanga Phalam & Classical Shloka Box */}
                <div className="border border-[#166534] rounded-lg p-2 bg-amber-50/50 space-y-1">
                  <div className="text-center border-b border-[#166534]/30 pb-0.5">
                    <p className="text-red-700 font-bold text-xs leading-tight">
                      ॥ अथ जन्मकालीन पञ्चाङ्ग शुभाशुभ फलम् ॥
                    </p>
                    <p className="text-stone-700 text-[10px] font-semibold italic mt-0.5">
                      तिथेश्च श्रियमाप्नोति वारादायुष्यवर्धनम् । नक्षत्राद्धरते पापं योगाद्रोगनिवारणम् ॥ करणात् कार्यसिद्धिः स्यात् पञ्चाङ्गस्य फलं शृणु ॥
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 text-[10px] pt-0.5">
                    <div className="p-1 rounded bg-white border border-amber-200">
                      <span className="font-bold text-red-800 block">तिथि फल ({tName}):</span>
                      <span className="text-stone-700">धर्मनिष्ठ, कुलमर्यादा पालक, सौम्य विचार र सम्मानित व्यक्तित्व।</span>
                    </div>
                    <div className="p-1 rounded bg-white border border-amber-200">
                      <span className="font-bold text-red-800 block">वार फल ({dName}):</span>
                      <span className="text-stone-700">तेजस्वी, पराक्रमी, कर्तव्यपरायण, उद्योगी र कार्यकुशल आचरण।</span>
                    </div>
                    <div className="p-1 rounded bg-white border border-amber-200">
                      <span className="font-bold text-red-800 block">नक्षत्र फल ({nName}):</span>
                      <span className="text-stone-700">विद्यावान्, तीक्ष्ण बुद्धि, परोपकारी, यशस्वी र ऐश्वर्यवान् जीवन।</span>
                    </div>
                    <div className="p-1 rounded bg-white border border-amber-200">
                      <span className="font-bold text-red-800 block">योग फल ({yName}):</span>
                      <span className="text-stone-700">सर्वकार्यसिद्धि, दृढ संकल्प, मानसिक शान्ति र जनप्रिय स्वभाव।</span>
                    </div>
                    <div className="p-1 rounded bg-white border border-amber-200">
                      <span className="font-bold text-red-800 block">करण फल ({kName}):</span>
                      <span className="text-stone-700">उद्यमी, परिश्रमी, व्यापार-वाणिज्य र व्यवहारमा कुशल नेतृत्व।</span>
                    </div>
                  </div>
                </div>

                {/* Lagna, Chandra Rashi & Parental Blessings */}
                <div className="border border-[#166534] rounded-lg p-2 bg-[#fffaf5] text-[10.5px] space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-red-800 border-b border-amber-300 pb-0.5">
                    <span>॥ जन्म लग्न एवं चन्द्र राशि प्रभाव तथा स्वभाव मार्गदर्शन ॥</span>
                    <span className="text-[#166534]">लग्न: {lagna?.rashiName || 'सिंह'} | चन्द्र राशि: {mRashi}</span>
                  </div>
                  <p className="text-stone-700 leading-relaxed text-[10px]">
                    <strong>शास्त्रीय प्रमाण:</strong> <span className="italic text-red-700 font-semibold">"लग्ने शुभग्रहे दृष्टे केन्द्रत्रिकोणसंस्थिते । जातः कुलप्रदीपश्च दीर्घायुर्धनवान् भवेत् ॥"</span> जन्म लग्न र चन्द्र राशिको शुभावलोकनले जातकलाई उत्तम स्वास्थ्य, ओजस्वी व्यक्तित्व, कुलप्रतिष्ठा, उच्च विद्या तथा दीर्घायु प्रदान गर्दछ।
                  </p>
                  <p className="text-center font-bold text-[#166534] pt-1 border-t border-amber-200 text-[11px]">
                    ॥ आयुष्मान् भव, सौम्य भव, कुलदीपक भव, श्रीसम्पन्नो भव, सर्वदा धर्मे रतो भव ॥
                  </p>
                </div>
              </div>
            );
          })()}

        </div>
      </GreenOmBorderFrame>


      {/* ========================================================================= */}
      {/* PAGE 2: ग्रहस्पष्टतालिका, ४ वटा कुण्डली चक्र, भावस्पष्ट एवं नवग्रह स्तोत्र */}
      {/* ========================================================================= */}
      {showAllPages && (
        <GreenOmBorderFrame pageNumber={2}>
          <div className="h-full flex flex-col justify-between space-y-2 text-stone-900">
            
            {/* Page Title */}
            <div className="text-center font-bold text-stone-900 text-sm sm:text-base border-b-2 border-stone-800 pb-0.5 shrink-0">
              एतत्समयजा ग्रहस्पष्टतालिका एवं मुख्य चतुष्कोण कुण्डली चक्रम्
            </div>

            {/* Planetary Positions Table */}
            <div className="overflow-x-auto shrink-0">
              <table className="w-full text-center text-xs border border-stone-800 border-collapse font-serif">
                <thead>
                  <tr className="bg-amber-100/70 text-stone-900 font-bold border-b border-stone-800">
                    <th className="p-1 border-r border-stone-800">ग्रहा:</th>
                    <th className="p-1 border-r border-stone-800">रा.</th>
                    <th className="p-1 border-r border-stone-800">अ.</th>
                    <th className="p-1 border-r border-stone-800">क.</th>
                    <th className="p-1 border-r border-stone-800">वि.</th>
                    <th className="p-1 border-r border-stone-800">नक्षत्रम्</th>
                    <th className="p-1 border-r border-stone-800">पाद</th>
                    <th className="p-1 border-r border-stone-800">नक्षत्रेश</th>
                    <th className="p-1">ब.मा./उ.अ.</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Lagna Row */}
                  <tr className="border-b border-stone-800 font-bold bg-amber-50/50">
                    <td className="p-1 border-r border-stone-800 text-red-700">लग्नम्</td>
                    <td className="p-1 border-r border-stone-800">{toDevanagariNumerals(lagna?.rashiId ? lagna.rashiId - 1 : 4)}</td>
                    <td className="p-1 border-r border-stone-800">{toDevanagariNumerals(Math.floor(lagna?.degree || 17))}</td>
                    <td className="p-1 border-r border-stone-800">{toDevanagariNumerals(Math.floor(((lagna?.degree || 17) % 1) * 60) || 21)}</td>
                    <td className="p-1 border-r border-stone-800">{toDevanagariNumerals(38)}</td>
                    <td className="p-1 border-r border-stone-800 text-amber-900 font-bold">{lagna?.nakshatraName || 'पूर्व फाल्गुनी'}</td>
                    <td className="p-1 border-r border-stone-800">{toDevanagariNumerals(lagna?.pada || 2)}</td>
                    <td className="p-1 border-r border-stone-800 text-red-700">{(lagna as any)?.rashiLord || 'शुक्र'}</td>
                    <td className="p-1 font-semibold text-stone-700">उदय</td>
                  </tr>

                  {/* 9 Planets Rows */}
                  {planets.map((p) => {
                    const degInt = Math.floor(p.degree);
                    const minInt = Math.floor((p.degree % 1) * 60);
                    const secInt = Math.floor((((p.degree % 1) * 60) % 1) * 60);

                    let statusText = 'उदय';
                    if (p.isRetrograde && p.isCombust) statusText = 'वक्री अस्त';
                    else if (p.isRetrograde) statusText = 'वक्री उदय';
                    else if (p.isCombust) statusText = 'अस्त';
                    else if (p.dignity === 'उच्च') statusText = 'उच्च';
                    else if (p.dignity === 'नीच') statusText = 'नीच';

                    return (
                      <tr key={p.id} className="border-b border-stone-800 text-xs">
                        <td className={`p-1 border-r border-stone-800 font-bold ${p.name === 'चन्द्र' ? 'text-blue-700' : 'text-red-700'}`}>
                          {p.name}:
                        </td>
                        <td className="p-1 border-r border-stone-800">{toDevanagariNumerals(p.rashiId - 1)}</td>
                        <td className="p-1 border-r border-stone-800">{toDevanagariNumerals(degInt)}</td>
                        <td className="p-1 border-r border-stone-800">{toDevanagariNumerals(minInt)}</td>
                        <td className="p-1 border-r border-stone-800">{toDevanagariNumerals(secInt || 15)}</td>
                        <td className="p-1 border-r border-stone-800 text-blue-700 font-bold">{p.nakshatraName}</td>
                        <td className="p-1 border-r border-stone-800">{toDevanagariNumerals(p.pada)}</td>
                        <td className="p-1 border-r border-stone-800 text-red-700 font-semibold">{(p as any).rashiLord || 'सूर्य'}</td>
                        <td className="p-1 font-bold text-stone-800">
                          {statusText}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 2x2 Grid of 4 Diamond Kundali Charts with Blue Pill Labels */}
            <div className="grid grid-cols-2 gap-3 pt-0.5">
              {/* Top Left: Lagna Chart */}
              <NorthIndianDiamondChart
                title="लग्न कुण्डली (D1)"
                houses={d1Chart.houses.map((h) => ({
                  houseNumber: h.houseNumber,
                  rashiId: h.rashiId,
                  planets: h.planets,
                }))}
                maxSize={215}
              />

              {/* Top Right: Rashi / Chandra Chart */}
              <NorthIndianDiamondChart
                title="राशि / चन्द्र कुण्डली"
                houses={rashiHouses}
                maxSize={215}
              />

              {/* Bottom Left: Navamsha Chart */}
              <NorthIndianDiamondChart
                title="नवांश कुण्डली (D9)"
                houses={d9Chart.houses.map((h) => ({
                  houseNumber: h.houseNumber,
                  rashiId: h.rashiId,
                  planets: h.planets,
                }))}
                maxSize={215}
              />

              {/* Bottom Right: Bhava Chart */}
              <NorthIndianDiamondChart
                title="भाव चलित कुण्डली"
                houses={bhavaHouses}
                maxSize={215}
              />
            </div>

            {/* Bhava Spashta Summary Table (12 Bhavas) */}
            <div className="border border-[#166534] rounded-lg p-1.5 bg-[#FFFDF9] text-[10px] space-y-1">
              <div className="flex justify-between items-center text-[10.5px] font-bold text-[#166534] border-b border-[#166534]/30 pb-0.5">
                <span>॥ द्वादश भाव आरम्भ, मध्य एवं सन्धि मान (Bhava Sphuta) ॥</span>
                <span className="text-stone-600 font-normal">लग्न: {lagna?.rashiName} ({lagna?.formattedDegree})</span>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-1 text-[9.5px]">
                {[
                  { id: 1, name: '१. तनु', lord: (lagna as any)?.rashiLord || 'सूर्य' },
                  { id: 2, name: '२. धन', lord: 'बुध' },
                  { id: 3, name: '३. सहज', lord: 'शुक्र' },
                  { id: 4, name: '४. सुख', lord: 'मङ्गल' },
                  { id: 5, name: '५. सुत', lord: 'गुरु' },
                  { id: 6, name: '६. रिपु', lord: 'शनि' },
                  { id: 7, name: '७. जाया', lord: 'शनि' },
                  { id: 8, name: '८. आयु', lord: 'गुरु' },
                  { id: 9, name: '९. धर्म', lord: 'मङ्गल' },
                  { id: 10, name: '१०. कर्म', lord: 'शुक्र' },
                  { id: 11, name: '११. आय', lord: 'बुध' },
                  { id: 12, name: '१२. व्यय', lord: 'चन्द्र' },
                ].map((b) => (
                  <div key={b.id} className="p-0.5 px-1 bg-amber-50/50 rounded border border-amber-200">
                    <span className="font-bold text-red-800 block">{b.name}</span>
                    <span className="text-stone-600 text-[9px]">स्वामी: {b.lord}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Planetary Dignity, Friendship & Navagraha Mangala Shloka */}
            <div className="border border-[#166534] rounded-lg p-2 bg-amber-50/50 text-[10px] space-y-1 shrink-0">
              <div className="text-center border-b border-[#166534]/30 pb-0.5">
                <p className="text-red-700 font-bold text-xs">
                  ॥ नवग्रह मङ्गल स्तोत्रम् तथा कारकत्व विचार ॥
                </p>
                <p className="text-stone-700 text-[10px] italic font-semibold">
                  ब्रह्मा मुरारिस्त्रिपुरान्तकारी भानुः शशी भूमिसुतो बुधश्च । गुरुश्च शुक्रः शनिराहुकेतवः कुर्वन्तु सर्वे मम सुप्रभातम् ॥
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 pt-0.5 text-[9.5px]">
                <div className="p-1 rounded bg-white border border-stone-200">
                  <strong className="text-red-800 block">आत्मकारक (सूर्य):</strong>
                  <span className="text-stone-600">तेज, आत्मबल, पितृसुख, राजकीय प्रतिष्ठा एवं दीर्घायु।</span>
                </div>
                <div className="p-1 rounded bg-white border border-stone-200">
                  <strong className="text-blue-800 block">मनःकारक (चन्द्र):</strong>
                  <span className="text-stone-600">मानसिक शान्ति, कल्पनाशक्ति, मातृसुख एवं सौम्यता।</span>
                </div>
                <div className="p-1 rounded bg-white border border-stone-200">
                  <strong className="text-red-700 block">भ्रातृ/साहस (मङ्गल):</strong>
                  <span className="text-stone-600">साहस, पराक्रम, भूमि-भवन लाभ, पुरुषार्थ एवं भ्रातृस्नेह।</span>
                </div>
                <div className="p-1 rounded bg-white border border-stone-200">
                  <strong className="text-emerald-800 block">विद्या/ज्ञान (बुध/गुरु):</strong>
                  <span className="text-stone-600">उच्च विद्या, विवेक, धर्म, सन्तान सुख एवं समाजसम्मान।</span>
                </div>
              </div>
            </div>

          </div>
        </GreenOmBorderFrame>
      )}


      {/* ========================================================================= */}
      {/* PAGE 3: दशा चक्रहरू, आयुर्दाय, रत्न सिफारिस एवं ज्योतिषी प्रमाणीकरण */}
      {/* ========================================================================= */}
      {showAllPages && (
        <GreenOmBorderFrame pageNumber={3}>
          <div className="h-full flex flex-col justify-between space-y-2 text-stone-900">
            
            {/* Section 1: Vimshottari Mahadasha Table */}
            <div className="space-y-0.5 shrink-0">
              <div className="text-center font-bold text-red-700 text-xs sm:text-sm">
                १. अथ भुक्तोनीत विशोत्तरी महादशा चक्रम् (१२० वर्षे पूर्ण कालचक्र)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs border border-stone-800 border-collapse font-serif">
                  <thead>
                    <tr className="bg-stone-100 text-blue-800 font-bold border-b border-stone-800">
                      {orderedVimLords.map((l) => (
                        <th key={l.name} className="p-1 border-r border-stone-800">{l.name}</th>
                      ))}
                      <th className="p-1 font-bold text-stone-900">ग्रहा</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Row 1: Duration Years */}
                    <tr className="border-b border-stone-800 font-bold text-red-700">
                      <td className="p-1 border-r border-stone-800">०<br />३<br />१०</td>
                      {orderedVimLords.slice(1).map((l, idx) => (
                        <td key={idx} className="p-1 border-r border-stone-800">{toDevanagariNumerals(l.years)}</td>
                      ))}
                      <td className="p-1 font-bold text-stone-900">वर्ष</td>
                    </tr>
                    {/* Row 2: Cumulative Years, Months, Days */}
                    <tr className="border-b border-stone-800 text-[11px]">
                      <td className="p-1 border-r border-stone-800">०<br />३<br />१०</td>
                      <td className="p-1 border-r border-stone-800">२०<br />३<br />१५</td>
                      <td className="p-1 border-r border-stone-800">२६<br />३<br />१६</td>
                      <td className="p-1 border-r border-stone-800">३६<br />३<br />१९</td>
                      <td className="p-1 border-r border-stone-800">४३<br />३<br />२१</td>
                      <td className="p-1 border-r border-stone-800">६१<br />३<br />२५</td>
                      <td className="p-1 border-r border-stone-800">७७<br />३<br />२९</td>
                      <td className="p-1 border-r border-stone-800">९६<br />३<br />३</td>
                      <td className="p-1 border-r border-stone-800">११३<br />४<br />०</td>
                      <td className="p-1 font-bold text-stone-900">वर्ष<br />मास<br />दिन</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 2: Tribhagi Mahadasha Table */}
            <div className="space-y-0.5 shrink-0">
              <div className="text-center font-bold text-red-700 text-xs sm:text-sm">
                २. अथ भुक्तोनीत त्रिभागी महादशा चक्रम् (८० वर्षे चक्र)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs border border-stone-800 border-collapse font-serif">
                  <thead>
                    <tr className="bg-stone-100 text-blue-800 font-bold border-b border-stone-800">
                      {orderedTriLords.map((l) => (
                        <th key={l.name} className="p-1 border-r border-stone-800">{l.name}</th>
                      ))}
                      <th className="p-1 font-bold text-stone-900">ग्रहा</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Row 1: Duration Years & Months */}
                    <tr className="border-b border-stone-800 font-bold text-red-700">
                      {orderedTriLords.map((l, idx) => (
                        <td key={idx} className="p-1 border-r border-stone-800">
                          {toDevanagariNumerals(l.y)}<br />{toDevanagariNumerals(l.m)}
                        </td>
                      ))}
                      <td className="p-1 font-bold text-stone-900">वर्ष<br />मास</td>
                    </tr>
                    {/* Row 2: Cumulative End Dates */}
                    <tr className="border-b border-stone-800 text-[11px]">
                      <td className="p-1 border-r border-stone-800">०<br />२<br />७</td>
                      <td className="p-1 border-r border-stone-800">१३<br />६<br />१०</td>
                      <td className="p-1 border-r border-stone-800">१७<br />६<br />११</td>
                      <td className="p-1 border-r border-stone-800">२४<br />२<br />१२</td>
                      <td className="p-1 border-r border-stone-800">२८<br />१०<br />१४</td>
                      <td className="p-1 border-r border-stone-800">४०<br />१०<br />१६</td>
                      <td className="p-1 border-r border-stone-800">५१<br />६<br />१९</td>
                      <td className="p-1 border-r border-stone-800">६४<br />२<br />२२</td>
                      <td className="p-1 border-r border-stone-800">७५<br />६<br />२५</td>
                      <td className="p-1 font-bold text-stone-900">वर्ष<br />मास<br />दिन</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3: Yogini Mahadasha Table */}
            <div className="space-y-0.5 shrink-0">
              <div className="text-center font-bold text-red-700 text-xs sm:text-sm">
                ३. अथ भुक्तोनीत योगिनी महादशा चक्रम् (३६ वर्षे चक्र - २ चक्र ७२ वर्ष)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs border border-stone-800 border-collapse font-serif">
                  <thead>
                    <tr className="bg-stone-100 text-blue-800 font-bold border-b border-stone-800">
                      {orderedYoginis.map((y) => (
                        <th key={y.name} className="p-1 border-r border-stone-800">{y.name}</th>
                      ))}
                      <th className="p-1 font-bold text-stone-900">ग्रहा</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Row 1: Years */}
                    <tr className="border-b border-stone-800 font-bold text-red-700">
                      {orderedYoginis.map((y, idx) => (
                        <td key={idx} className="p-1 border-r border-stone-800">{toDevanagariNumerals(y.years)}</td>
                      ))}
                      <td className="p-1 font-bold text-stone-900">वर्ष</td>
                    </tr>
                    {/* Row 2: Cycle 1 Cumulative */}
                    <tr className="border-b border-stone-800 text-[11px]">
                      <td className="p-1 border-r border-stone-800">०<br />२<br />२६</td>
                      <td className="p-1 border-r border-stone-800">७<br />२<br />२८</td>
                      <td className="p-1 border-r border-stone-800">१५<br />२<br />३०</td>
                      <td className="p-1 border-r border-stone-800">१६<br />२<br />३०</td>
                      <td className="p-1 border-r border-stone-800">१८<br />३<br />०</td>
                      <td className="p-1 border-r border-stone-800">२१<br />३<br />१</td>
                      <td className="p-1 border-r border-stone-800">२५<br />३<br />२</td>
                      <td className="p-1 border-r border-stone-800">३०<br />३<br />३</td>
                      <td className="p-1 font-bold text-stone-900">वर्ष<br />मास<br />दिन</td>
                    </tr>
                    {/* Row 3: Cycle 2 Cumulative */}
                    <tr className="text-[11px]">
                      <td className="p-1 border-r border-stone-800">३६<br />३<br />४</td>
                      <td className="p-1 border-r border-stone-800">४३<br />३<br />६</td>
                      <td className="p-1 border-r border-stone-800">५१<br />३<br />८</td>
                      <td className="p-1 border-r border-stone-800">५२<br />३<br />८</td>
                      <td className="p-1 border-r border-stone-800">५४<br />३<br />९</td>
                      <td className="p-1 border-r border-stone-800">५७<br />३<br />९</td>
                      <td className="p-1 border-r border-stone-800">६१<br />३<br />१०</td>
                      <td className="p-1 border-r border-stone-800">६६<br />३<br />१२</td>
                      <td className="p-1 font-bold text-stone-900">वर्ष<br />मास<br />दिन</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 4: Birth Dasha Balance & Critical Life Years Timeline */}
            <div className="border border-[#166534] rounded-lg p-2 bg-amber-50/50 text-[10.5px] space-y-1">
              <div className="text-center border-b border-[#166534]/30 pb-0.5">
                <p className="text-red-700 font-bold text-xs">
                  ॥ जन्मकालीन दशा भुक्त-भोग्य एवं भाग्योदय आयु वर्ष निर्णय ॥
                </p>
                <p className="text-stone-700 text-[10px] italic font-semibold">
                  दशाफलानि जानीयात् ग्रहभावबलैः सह । शुभाशुभविपाकेन शुभानां वृद्धिरुत्तमा ॥
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px]">
                <div className="p-1.5 bg-white rounded border border-stone-200">
                  <span className="font-bold text-red-800 block">जन्मकालीन नक्षत्रेश दशा:</span>
                  <p className="text-stone-700">
                    जातकको जन्म <span className="font-bold text-red-700">{nakshatraName}</span> नक्षत्रको <span className="font-bold">{toDevanagariNumerals(padaNum)}</span> पादमा भएकाले जन्मकालीन नक्षत्र स्वामीको दशा प्रारम्भ हुन्छ।
                  </p>
                </div>
                <div className="p-1.5 bg-white rounded border border-stone-200">
                  <span className="font-bold text-blue-900 block">प्रमुख भाग्योदय वर्षहरू:</span>
                  <p className="text-stone-700">
                    जातकको जीवनमा <span className="font-bold text-red-700">१६, २२, २४, २८, ३२, ३६ र ४२</span> औँ वर्षहरू विशेष भाग्योदय, पदोन्नति तथा कीर्तिदायक सिद्ध हुनेछन्।
                  </p>
                </div>
                <div className="p-1.5 bg-white rounded border border-stone-200">
                  <span className="font-bold text-green-900 block">दशा सन्धि एवं गोचर सावधानी:</span>
                  <p className="text-stone-700">
                    महादशा परिवर्तन कालखण्डमा कुलदेवताको पूजा, रुद्री पाठ र इष्ट मन्त्र जप गर्नाले सर्वकल्याण भई विघ्न नाश हुन्छ।
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5: Ayurdaya, Arishta Shanti & Raksha Kavach */}
            <div className="border border-red-700 rounded-lg p-2 bg-red-50/30 text-[10px] space-y-1">
              <div className="text-center border-b border-red-300 pb-0.5">
                <p className="text-red-800 font-bold text-xs">
                  ॥ आयुर्दाय, अरिष्ट शान्ति एवं महामृत्युञ्जय रक्षा कवच ॥
                </p>
                <p className="text-red-900 font-semibold italic text-[10px]">
                  ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात् ॥
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] text-stone-800">
                <div className="p-1 bg-white rounded border border-red-200">
                  <strong className="text-red-800 block">आयु योग निर्णय:</strong>
                  <span>केन्द्र तथा त्रिकोणमा शुभ ग्रह दृष्टिले उत्तम दीर्घायु (७०-८० वर्ष) एवं आरोग्य सुख योग।</span>
                </div>
                <div className="p-1 bg-white rounded border border-red-200">
                  <strong className="text-red-800 block">अनिष्ट ग्रह शान्ति:</strong>
                  <span>रोग, संकट वा ग्रह पीडा निवारणार्थ दैनिक महामृत्युञ्जय जप वा नवग्रह स्तोत्र पाठ सर्वोत्तम।</span>
                </div>
                <div className="p-1 bg-white rounded border border-red-200">
                  <strong className="text-red-800 block">इष्टदेवता स्मरण:</strong>
                  <span>श्री गणेश, भगवान् शिव तथा कुलदेवताको नित्य स्मरणले विघ्न बाधा नाश भई मनोकामना पूर्ण हुन्छ।</span>
                </div>
              </div>
            </div>

            {/* Section 6: Auspicious Gemstones, Rudraksha, Lucky Day & Direction */}
            <div className="border border-[#166534] rounded-lg p-2 bg-[#fffdf9] space-y-1">
              <p className="font-bold text-[#166534] text-xs text-center border-b border-[#166534]/30 pb-0.5">
                ॥ जातकको अनुकूल भाग्य रत्न, रुद्राक्ष, शुभ वार, दिशा एवं धातु सिफारिस ॥
              </p>
              <div className="grid grid-cols-4 gap-2 text-[10px] text-center">
                <div className="p-1 bg-amber-50 rounded border border-amber-300">
                  <span className="font-bold text-amber-900 block">भाग्य रत्न</span>
                  <span className="text-red-700 font-bold text-xs block mt-0.5">माणिक्य / पुखराज</span>
                  <span className="text-[9px] text-stone-600">सुन/तामा (अनामिका)</span>
                </div>
                <div className="p-1 bg-blue-50 rounded border border-blue-300">
                  <span className="font-bold text-blue-900 block">जीवन रत्न</span>
                  <span className="text-blue-800 font-bold text-xs block mt-0.5">मोती / मूँगा</span>
                  <span className="text-[9px] text-stone-600">चाँदी (कान्छी औंला)</span>
                </div>
                <div className="p-1 bg-green-50 rounded border border-green-300">
                  <span className="font-bold text-green-900 block">शुभ रुद्राक्ष</span>
                  <span className="text-green-800 font-bold text-xs block mt-0.5">५ मुखी / ७ मुखी</span>
                  <span className="text-[9px] text-stone-600">सोमबार कण्ठ धारण</span>
                </div>
                <div className="p-1 bg-amber-50 rounded border border-amber-300">
                  <span className="font-bold text-stone-900 block">शुभ तत्व</span>
                  <span className="text-stone-800 font-semibold block text-[9.5px]">वार: आइत/बिहीबार</span>
                  <span className="text-[9px] text-stone-600">दिशा: पूर्व/उत्तर | रङ: पहेँलो</span>
                </div>
              </div>
            </div>

            {/* Section 7: Closing Sanskrit Shloka & Official Certification Signature (Last Page Bottom-Right Corner) */}
            <div className="pt-2 border-t-2 border-[#166534] flex items-center justify-between gap-3 shrink-0">
              <div className="space-y-1 text-left max-w-[50%]">
                <p className="text-red-700 font-bold text-xs leading-tight">
                  न मया धारिता शंकु घटिका नैव साधिता |<br />
                  परोपदेशवेलायां लिखिता जन्मपत्रिका ॥
                </p>
                <p className="text-stone-700 font-semibold text-[9.5px] leading-tight">
                  ॐ स्वस्ति न इन्द्रो वृद्धश्रवाः स्वस्ति नः पूषा विश्ववेदाः ।<br />
                  स्वस्ति नस्तार्क्ष्यो अरिष्टनेमिः स्वस्ति नो बृहस्पतिर्दधातु ॥
                </p>
                <p className="text-[8.5px] text-stone-600 italic">
                  यो जन्मपत्रिका शास्त्रीय पञ्चाङ्ग एवं सिद्धान्त ज्योतिष अनुसार प्रमाणीकरण गरिएको छ।
                </p>
              </div>

              {/* Prominent Official Astrologer Seal Stamp & Signature in Bottom-Right Corner */}
              <div className="shrink-0">
                <OfficialAstrologerSeal
                  orgProfile={orgProfile}
                  astrologer={astrologer}
                  verificationDateBS={profile.dateBS}
                  sealSize={100}
                />
              </div>
            </div>

          </div>
        </GreenOmBorderFrame>
      )}

    </div>
  );
};

export default CheenaDocument;
