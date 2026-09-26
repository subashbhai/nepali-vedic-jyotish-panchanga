import React, { useRef } from 'react';
import {
  BirthDetails,
  LagnaInfo,
  PlanetPosition,
  PanchangaData,
  PatrikaSubCategory,
  OrganizationProfile,
  AstrologerProfile
} from '../types/astrology';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { generateDivisionalChart } from '../utils/astroCalculations';
import {
  formatPlanetDegreesMinutes,
  getPlanetStatusSuffix,
  NORTH_INDIAN_HOUSE_GEO
} from '../utils/aspectEngine';
import { GaneshaHeaderCenter } from './GaneshaHeaderCenter';
import { CheenaDocument, GreenOmBorderFrame, NAKSHATRA_AVAKAHADA, GHATA_CHAKRA_MAP } from './CheenaDocument';
import { BrihatCheenaDocument } from './BrihatCheenaDocument';
import { OfficialAstrologerSeal } from './common/OfficialAstrologerSeal';
import {
  analyzeVivahAstrology,
  analyzeBartabandhaAstrology,
  analyzeGrihaPraveshAstrology
} from '../utils/sanskritiEngine';
import { generateMasterFaladeshReport } from '../utils/faladeshEngine';
import { evaluateAllYogasAndDoshas } from '../utils/yogaEngine';
import { calculateGocharAndSadeSati } from '../utils/gocharEngine';
import { calculateVimshottariDasha } from '../utils/dashaEngine';
import { UserCheck, Sparkles, BookOpen, ShieldCheck, Heart, Compass } from 'lucide-react';

export interface SelectedPrintPages {
  profileDetails: boolean;
  china: boolean;
  janmakundali: boolean;
  grahaTable: boolean;
  bhavaTable: boolean;
  vargaCharts: boolean;
  dashaDetails: boolean;
  yogas: boolean;
  doshas: boolean;
  gochar: boolean;
  faladesh: boolean;
  remedies: boolean;
}

interface DynamicPatrikaDocumentProps {
  subCategory: PatrikaSubCategory;
  profile: BirthDetails;
  lagna: LagnaInfo;
  planets: PlanetPosition[];
  panchanga: PanchangaData;
  orgProfile: OrganizationProfile;
  astrologer?: AstrologerProfile;
  patrikaFormatMode?: 'full' | 'short';
  selectedPrintPages: SelectedPrintPages;
  hideParentPhone?: boolean;
}

// Traditional 2-letter Devanagari abbreviation for planets
export function getPlanetAbbr(name: string): string {
  switch (name) {
    case 'सूर्य': return 'सू';
    case 'चन्द्र': return 'च';
    case 'मंगल':
    case 'मङ्गल': return 'मं';
    case 'बुध': return 'बु';
    case 'गुरु':
    case 'वृहस्पति':
    case 'बृहस्पति': return 'बृ';
    case 'शुक्र': return 'शु';
    case 'शनि': return 'श';
    case 'राहु': return 'रा';
    case 'केतु': return 'के';
    case 'लग्न': return 'ल';
    default: return name.slice(0, 2);
  }
}

// Single North Indian Diamond SVG Chart Component
const PrintableDiamondChart: React.FC<{
  title: string;
  houses: Array<{ houseNumber: number; rashiId: number; planets: PlanetPosition[] }>;
  maxSize?: number;
}> = ({ title, houses, maxSize = 240 }) => {
  // Extract all unique planets in this chart
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
    <div className="flex flex-col items-center page-break-inside-avoid my-0.5 w-full">
      <div className="bg-amber-800 text-amber-50 text-[10px] font-bold px-3 py-0.5 rounded-full mb-0.5 border border-amber-900 shadow-2xs">
        {title}
      </div>

      <div
        className="relative w-full aspect-square bg-[#FFFDF7] border-2 border-amber-900 p-0.5 shadow-2xs select-none"
        style={{ maxWidth: `${maxSize}px` }}
      >
        <svg viewBox="0 0 400 400" className="w-full h-full stroke-amber-950 fill-none stroke-[2]">
          <rect x="5" y="5" width="390" height="390" className="stroke-amber-950 stroke-[3]" />
          <line x1="5" y1="5" x2="395" y2="395" />
          <line x1="395" y1="5" x2="5" y2="395" />
          <polygon points="200,5 395,200 200,395 5,200" className="stroke-amber-950 stroke-[3]" />
        </svg>

        {houses.map((house) => {
          const geo = NORTH_INDIAN_HOUSE_GEO[house.houseNumber];
          if (!geo) return null;

          return (
            <div
              key={house.houseNumber}
              className="absolute text-center transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none"
              style={{ left: `${(geo.center.x / 400) * 100}%`, top: `${(geo.center.y / 400) * 100}%` }}
            >
              <span className="text-[9.5px] font-black text-blue-900 leading-none">
                {toDevanagariNumerals(house.rashiId)}
              </span>

              {/* Planets inside house - Only Graha and Degree to prevent line overlap */}
              <div className="flex flex-wrap justify-center items-center gap-0.5 mt-0.5 max-w-[70px]">
                {house.planets.map((p) => {
                  const degStr = formatPlanetDegreesMinutes(p);

                  return (
                    <span
                      key={p.id}
                      className="text-red-800 font-bold text-[8.5px] leading-none px-0.5 py-0.2 bg-amber-100/70 rounded inline-flex items-center"
                    >
                      <span>{getPlanetAbbr(p.name)}</span>
                      <span className="text-[7.5px] text-stone-700 ml-0.5 font-mono font-normal">{degStr}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Compact Astrologer Certification & Signature Block with Official Seal
const AstrologerSignatureBlock: React.FC<{
  astrologer?: AstrologerProfile;
  orgProfile: OrganizationProfile;
  dateBS?: string;
}> = ({ astrologer, orgProfile, dateBS }) => {
  return (
    <div className="pt-1.5 border-t border-amber-800/80 flex items-center justify-between gap-2 text-[10px] text-amber-950 shrink-0">
      <div className="space-y-0.5 leading-tight max-w-[48%] text-left">
        <p className="font-bold text-red-900 text-[10.5px]">॥ अधिकृत प्रमाणीकरण एवं आशीर्वाद ॥</p>
        <p className="text-[9px] text-stone-700 italic font-serif">
          ॐ स्वस्ति न इन्द्रो वृद्धश्रवाः स्वस्ति नः पूषा विश्ववेदाः ।
        </p>
        <p className="text-[8px] text-stone-600 leading-tight">
          यो आधिकारिक दस्तावेज शास्त्रीय सिद्धान्त, पञ्चाङ्ग गणना एवं महर्षि पराशर पद्धति अनुसार शुद्ध रूपमा प्रमाणीकरण गरिएको छ।
        </p>
      </div>

      <div className="shrink-0">
        <OfficialAstrologerSeal
          orgProfile={orgProfile}
          astrologer={astrologer}
          verificationDateBS={dateBS}
          sealSize={92}
        />
      </div>
    </div>
  );
};

// Compact Planetary Table
const CompactPlanetaryTable: React.FC<{
  lagna: LagnaInfo;
  planets: PlanetPosition[];
}> = ({ lagna, planets }) => {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-center text-[9px] border border-amber-900 border-collapse">
        <thead>
          <tr className="bg-amber-200 text-amber-950 font-bold border-b border-amber-900">
            <th className="p-0.5 border-r border-amber-900">ग्रह</th>
            <th className="p-0.5 border-r border-amber-900">राशि</th>
            <th className="p-0.5 border-r border-amber-900">अंश-कला</th>
            <th className="p-0.5 border-r border-amber-900">नक्षत्र</th>
            <th className="p-0.5 border-r border-amber-900">पाद</th>
            <th className="p-0.5 border-r border-amber-900">भाव</th>
            <th className="p-0.5">अवस्था</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-amber-900 bg-amber-100 font-bold">
            <td className="p-0.5 border-r border-amber-900 text-red-800">लग्न</td>
            <td className="p-0.5 border-r border-amber-900">{lagna.rashiName}</td>
            <td className="p-0.5 border-r border-amber-900">{lagna.formattedDegree}</td>
            <td className="p-0.5 border-r border-amber-900">{lagna.nakshatraName}</td>
            <td className="p-0.5 border-r border-amber-900">{toDevanagariNumerals(lagna.pada)}</td>
            <td className="p-0.5 border-r border-amber-900">१</td>
            <td className="p-0.5">उदय</td>
          </tr>
          {planets.map((p) => (
            <tr key={p.id} className="border-b border-amber-900/60 leading-tight">
              <td className="p-0.5 border-r border-amber-900 font-bold text-red-800">{p.name}</td>
              <td className="p-0.5 border-r border-amber-900">{p.rashiName}</td>
              <td className="p-0.5 border-r border-amber-900">{p.formattedDegree}</td>
              <td className="p-0.5 border-r border-amber-900">{p.nakshatraName}</td>
              <td className="p-0.5 border-r border-amber-900">{toDevanagariNumerals(p.pada)}</td>
              <td className="p-0.5 border-r border-amber-900">{toDevanagariNumerals(p.bhava)}</td>
              <td className="p-0.5 font-semibold text-blue-900">
                {p.dignity} {p.isRetrograde ? '(व)' : p.isCombust ? '(अ)' : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const DynamicPatrikaDocument: React.FC<DynamicPatrikaDocumentProps> = ({
  subCategory,
  profile,
  lagna,
  planets,
  panchanga,
  orgProfile,
  astrologer,
  hideParentPhone = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Safe Null-Guards for Input Props
  const safeProfile: BirthDetails = profile || {
    id: 'default',
    name: 'राम शर्मा',
    gender: 'male',
    dateAD: '1995-05-15',
    dateBS: '२०५२ जेठ ०१',
    time: '08:30',
    location: { name: 'काठमाडौँ', latitude: 27.7172, longitude: 85.3240, timeZone: 5.75, country: 'नेपाल', district: 'काठमाडौँ', province: 'बागमती' },
    category: 'Client',
  };

  const safeLagna: LagnaInfo = lagna || {
    rashiId: 1,
    rashiName: 'मेष',
    degree: 0,
    formattedDegree: "००° ००' ००\"",
    nakshatraName: 'अश्विनी',
    pada: 1,
    lord: 'मंगल',
  };

  const safePlanets: PlanetPosition[] = (planets && planets.length > 0) ? planets : [
    {
      id: '1',
      name: 'सूर्य' as const,
      englishName: 'Sun',
      symbol: '☉',
      longitude: 30,
      degree: 0,
      minutes: 0,
      seconds: 0,
      formattedDegree: "००° ००' ००\"",
      rashiId: 1,
      rashiName: 'मेष' as const,
      nakshatraId: 1,
      nakshatraName: 'अश्विनी',
      nakshatraLord: 'केतु' as const,
      pada: 1,
      bhava: 1,
      speed: 1,
      isRetrograde: false,
      isCombust: false,
      dignity: 'उच्च',
    },
  ];

  const dateBSStr = safeProfile.dateBS || '२०८१-०१-०१';
  const dateADStr = safeProfile.dateAD || '2025-01-01';

  const bsYear = parseInt((dateBSStr.includes('-') ? dateBSStr.split('-')[0] : dateBSStr.split(' ')[0]) || '2081') || 2081;
  const shakaYear = bsYear - 135;

  const d1Chart = generateDivisionalChart('D1', safeLagna, safePlanets);
  const d9Chart = generateDivisionalChart('D9', safeLagna, safePlanets);
  const d10Chart = generateDivisionalChart('D10', safeLagna, safePlanets);
  const d12Chart = generateDivisionalChart('D12', safeLagna, safePlanets);

  const foundMoon = safePlanets.find((p) => p.name === 'चन्द्र');
  const moonPlanet: PlanetPosition = foundMoon || {
    id: '2',
    name: 'चन्द्र' as const,
    englishName: 'Moon',
    symbol: '☽',
    longitude: 281.8233,
    degree: 11,
    minutes: 49,
    seconds: 24,
    formattedDegree: "११° ४९' २४\"",
    rashiId: 10,
    rashiName: 'मकर' as const,
    nakshatraId: 22,
    nakshatraName: 'श्रवण',
    nakshatraLord: 'चन्द्र' as const,
    pada: 1,
    bhava: 1,
    speed: 13.2,
    isRetrograde: false,
    isCombust: false,
    dignity: 'समराशि',
  };
  const moonRashiId = moonPlanet?.rashiId || 1;
  const moonRashiName = moonPlanet?.rashiName || 'मेष';

  const rashiHouses = Array.from({ length: 12 }, (_, idx) => {
    const houseNum = idx + 1;
    const houseRashiId = ((moonRashiId - 1 + idx) % 12) + 1;
    const housePlanets = safePlanets.filter((p) => p.rashiId === houseRashiId);
    return { houseNumber: houseNum, rashiId: houseRashiId, planets: housePlanets };
  });

  const bhavaHouses = Array.from({ length: 12 }, (_, idx) => {
    const houseNum = idx + 1;
    const houseRashiId = (((safeLagna.rashiId || 1) - 1 + idx) % 12) + 1;
    const housePlanets = safePlanets.filter((p) => p.bhava === houseNum);
    return { houseNumber: houseNum, rashiId: houseRashiId, planets: housePlanets };
  });

  const dashaResult = calculateVimshottariDasha(moonPlanet, dateADStr, safeProfile.time || '08:30');
  const yogaDoshaEval = evaluateAllYogasAndDoshas(safeLagna, safePlanets, dashaResult);
  const gochar = calculateGocharAndSadeSati(moonPlanet, safePlanets, new Date().toISOString());
  const masterFaladesh = generateMasterFaladeshReport(safeProfile, safeLagna, safePlanets, panchanga, dashaResult, gochar);

  // Safe Dasha extraction with multi-layer fallback
  const birthDashaPlanet = 
    (dashaResult as any)?.birthDashaPlanet || 
    dashaResult?.balanceAtBirth?.planet || 
    moonPlanet?.nakshatraLord || 
    'चन्द्र';

  const balanceYears = 
    typeof (dashaResult as any)?.balanceYears === 'number' && !isNaN((dashaResult as any).balanceYears)
      ? (dashaResult as any).balanceYears
      : typeof dashaResult?.balanceAtBirth?.yearsLeft === 'number' && !isNaN(dashaResult.balanceAtBirth.yearsLeft)
        ? dashaResult.balanceAtBirth.yearsLeft
        : 0;

  const balanceMonths = 
    typeof (dashaResult as any)?.balanceMonths === 'number' && !isNaN((dashaResult as any).balanceMonths)
      ? (dashaResult as any).balanceMonths
      : typeof dashaResult?.balanceAtBirth?.monthsLeft === 'number' && !isNaN(dashaResult.balanceAtBirth.monthsLeft)
        ? dashaResult.balanceAtBirth.monthsLeft
        : 0;

  const balanceDays = 
    typeof (dashaResult as any)?.balanceDays === 'number' && !isNaN((dashaResult as any).balanceDays)
      ? (dashaResult as any).balanceDays
      : typeof dashaResult?.balanceAtBirth?.daysLeft === 'number' && !isNaN(dashaResult.balanceAtBirth.daysLeft)
        ? dashaResult.balanceAtBirth.daysLeft
        : 0;

  const avakahadaInfo = NAKSHATRA_AVAKAHADA[panchanga?.nakshatra?.name || 'रोहिणी'] || {
    namakshara: ['ओ', 'वा', 'वी', 'वू'],
    yoni: 'सर्प',
    nadi: 'अन्त्य',
    gana: 'मनुष्य',
    varga: 'श्वान',
    varna: 'वैश्य',
    ashana: 'उपवेशन',
  };

  const ghataInfo = GHATA_CHAKRA_MAP[moonRashiName] || {
    tithi: '५, १०, १५',
    vara: 'शनिबार',
    nakshatra: 'हस्त',
    yoga: 'शूल',
    karana: 'कौलव',
    prahara: '२',
    lagna: 'वृष',
    rashi: 'धनु',
  };

  // 1. BRIHAT CHEENA -> Exactly 10 Pages
  if (subCategory === 'brihat_china') {
    return (
      <div ref={containerRef} id="printable-patrika-wrapper" className="w-full flex justify-center">
        <BrihatCheenaDocument
          profile={safeProfile}
          lagna={safeLagna}
          planets={safePlanets}
          panchanga={panchanga}
          orgProfile={orgProfile}
          astrologer={astrologer}
          hideParentPhone={hideParentPhone}
        />
      </div>
    );
  }

  // 2. CHEENA (or JANMAKUNDALI) -> Exactly 3 Pages
  if (subCategory === 'china' || subCategory === 'janmakundali') {
    return (
      <div ref={containerRef} id="printable-patrika-wrapper" className="w-full flex justify-center">
        <CheenaDocument
          profile={safeProfile}
          lagna={safeLagna}
          planets={safePlanets}
          panchanga={panchanga}
          orgProfile={orgProfile}
          astrologer={astrologer}
          showAllPages={true}
        />
      </div>
    );
  }

  // =========================================================================
  // 3. TIPPAN (टिप्पन) -> Exactly 1 Page
  // =========================================================================
  if (subCategory === 'tippan') {
    return (
      <div ref={containerRef} id="printable-patrika-wrapper" className="w-full flex justify-center">
        <GreenOmBorderFrame className="space-y-1.5">
          {/* Header */}
          <GaneshaHeaderCenter
            orgName={orgProfile.name}
            orgPhone={toDevanagariNumerals(orgProfile.phone || '+९७७-९७६४४००५३३')}
            title="॥ संक्षिप्त जन्म टिपण पत्रम् ॥"
            subtitle={`शुभ सम्बत् ${toDevanagariNumerals(panchanga.dateBS)} | ${panchanga.samvatsara} संवत्सर`}
            primaryShloka="ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥"
            secondaryShloka="तदेव लग्नं सुदिनं तदेव ताराबलं चन्द्रबलं तदेव। विद्याबलं दैवबलं तदेव लक्ष्मीपते तेऽङ्घ्रियुगं स्मरामि॥"
          />

          {/* Box 1: Core Birth & Family Details */}
          <div className="border border-red-800 p-2 rounded-lg bg-amber-50/70 text-[10px] grid grid-cols-2 gap-2">
            <div>
              <p><strong>जातकको नाम:</strong> <span className="text-red-900 font-bold">{safeProfile.name}</span> ({safeProfile.gender === 'male' ? 'पुरुष' : 'महिला'})</p>
              <p><strong>जन्म मिति (वि.सं.):</strong> {toDevanagariNumerals(safeProfile.dateBS)} (ई.सं. {safeProfile.dateAD})</p>
              <p><strong>जन्म समय:</strong> {toDevanagariNumerals(safeProfile.time)} | <strong>स्थान:</strong> {safeProfile.location?.name || '—'}</p>
            </div>
            <div>
              <p><strong>बाबुको नाम:</strong> {safeProfile.fatherDetails?.name || safeProfile.parentName || '—'}</p>
              <p><strong>आमाको नाम:</strong> {safeProfile.motherDetails?.name || '—'}</p>
              <p><strong>गोत्र:</strong> {safeProfile.fatherDetails?.gotra || '—'} | <strong>कुलदेवता:</strong> {safeProfile.familyHistory?.kuldevata || '—'}</p>
            </div>
          </div>

          {/* Box 2: Birth Panchanga & Avakahada */}
          <div className="border border-amber-800 p-2 rounded-lg bg-amber-100/40 text-[10px] space-y-1">
            <div className="grid grid-cols-4 gap-1">
              <p><strong>अयन/ऋतु:</strong> {panchanga?.ayana || 'उत्तरायण'} / {panchanga?.ritu || 'शिशिर'}</p>
              <p><strong>तिथि:</strong> {panchanga?.tithi?.name || 'प्रतिपदा'} ({panchanga?.tithi?.paksha || 'शुक्ल'})</p>
              <p><strong>वार:</strong> {panchanga?.dayNameNepali || 'आइतबार'}</p>
              <p><strong>नक्षत्र:</strong> {panchanga?.nakshatra?.name || 'रोहिणी'} (पाद {toDevanagariNumerals(panchanga?.nakshatra?.pada ?? 1)})</p>
              <p><strong>योग:</strong> {panchanga?.yoga?.name || 'सिद्धि'}</p>
              <p><strong>करण:</strong> {panchanga?.karana?.name || 'बव'}</p>
              <p><strong>सूर्य/चन्द्र राशि:</strong> {panchanga?.sunRashi || 'कुम्भ'} / {panchanga?.moonRashi || 'वृष'}</p>
              <p><strong>जन्म लग्न:</strong> {safeLagna?.rashiName || 'मेष'}</p>
            </div>
            <div className="pt-1 border-t border-amber-300 grid grid-cols-6 gap-1 text-center font-bold text-stone-800 text-[9.5px]">
              <span>नाडी: {avakahadaInfo.nadi}</span>
              <span>योनि: {avakahadaInfo.yoni}</span>
              <span>गण: {avakahadaInfo.gana}</span>
              <span>वर्ण: {avakahadaInfo.varna}</span>
              <span>वर्ग: {avakahadaInfo.varga}</span>
              <span>पाया: रजत</span>
            </div>
          </div>

          {/* Box 3: Compact Traditional Sankalpa */}
          <div className="border border-red-700/80 rounded-lg p-2 bg-amber-50/50 text-[10px] leading-relaxed text-justify">
            <span className="text-red-800 font-bold">श्रीशालिवाहनीयशाके {toDevanagariNumerals(shakaYear)}</span>{' '}
            <span className="text-red-800 font-bold">श्रीवीरविक्रमादित्य संवत् {toDevanagariNumerals(bsYear)}</span>{' '}
            <span className="text-red-800 font-bold">{panchanga?.samvatsara || 'सिद्धार्थी'}</span> नामसंवत्सरे श्रीसूर्ये{' '}
            <span className="text-red-800 font-bold">{panchanga?.ayana || 'उत्तरायण'}</span> अयने{' '}
            <span className="text-red-800 font-bold">{(panchanga as any)?.monthNameNepali || 'फाल्गुण'}</span> मासे{' '}
            <span className="text-red-800 font-bold">{panchanga?.tithi?.paksha || 'शुक्ल'}</span> पक्षे{' '}
            <span className="text-red-800 font-bold">{panchanga?.dayNameNepali || 'आइतबार'}</span> वासरे{' '}
            <span className="text-red-800 font-bold">{panchanga?.tithi?.name || 'प्रतिपदा'}</span> तिथौ{' '}
            <span className="text-red-800 font-bold">{panchanga?.nakshatra?.name || 'रोहिणी'}</span> नक्षत्रे{' '}
            <span className="text-red-800 font-bold">{safeLagna?.rashiName || 'मेष'}</span> लग्नोदये श्रीमान्{' '}
            <span className="text-red-800 font-bold">{safeProfile.fatherDetails?.gotra || 'भारद्वाज'}</span> गोत्रोत्पन्नस्य श्रीमत:{' '}
            <span className="text-red-800 font-bold">{safeProfile.fatherDetails?.name || safeProfile.parentName || '—'}</span> इतस्य सुपुत्र/पुत्री{' '}
            <span className="text-red-800 font-bold">{safeProfile.name}</span> नाम्ना जन्मटिपण पत्रम् शुभम्।
          </div>

          {/* Box 4: Two Kundali Charts (D1 and D9) */}
          <div className="grid grid-cols-2 gap-4 justify-center items-center py-1">
            <PrintableDiamondChart
              title="जन्म / लग्न कुण्डली (D1)"
              houses={d1Chart.houses.map((h) => ({ houseNumber: h.houseNumber, rashiId: h.rashiId, planets: h.planets }))}
              maxSize={185}
            />
            <PrintableDiamondChart
              title="नवांश कुण्डली (D9)"
              houses={d9Chart.houses.map((h) => ({ houseNumber: h.houseNumber, rashiId: h.rashiId, planets: h.planets }))}
              maxSize={185}
            />
          </div>

          {/* Box 5: Planetary Table + Dasha Balance & Ghatachakra */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-[10px]">
            <div className="md:col-span-7">
              <CompactPlanetaryTable lagna={safeLagna} planets={safePlanets} />
            </div>
            <div className="md:col-span-5 space-y-1">
              <div className="border border-amber-800 p-1.5 rounded bg-amber-50">
                <p className="font-bold text-red-900 border-b border-amber-300 pb-0.5">जन्मकालीन महादशा भोग्य शेष:</p>
                <p className="mt-0.5">महादशा स्वामी: <strong className="text-red-900 font-bold">{birthDashaPlanet}</strong></p>
                <p>भोग्य काल: <strong className="text-amber-950 font-bold">{toDevanagariNumerals(balanceYears)}</strong> वर्ष, <strong className="text-amber-950 font-bold">{toDevanagariNumerals(balanceMonths)}</strong> महिना, <strong className="text-amber-950 font-bold">{toDevanagariNumerals(balanceDays)}</strong> दिन</p>
              </div>
              <div className="border border-red-800 p-1.5 rounded bg-red-50/60">
                <p className="font-bold text-red-900 border-b border-red-300 pb-0.5">घातचक्र (सावधानी तत्व):</p>
                <p>घात वार: <span className="text-red-700 font-bold">{ghataInfo.vara}</span> | घात तिथि: {ghataInfo.tithi}</p>
                <p>घात नक्षत्र: {ghataInfo.nakshatra} | घात राशि: {ghataInfo.rashi}</p>
              </div>
            </div>
          </div>

          {/* Box 6: Classical Shloka Box for Tippan */}
          <div className="border border-[#166534] rounded-lg p-1.5 bg-amber-50/60 text-center text-[9.5px] italic text-stone-800 font-serif space-y-0.5">
            <p className="font-bold text-red-800 text-[10.5px]">॥ आयुर्दाय एवं दैवज्ञ वचनम् ॥</p>
            <p>
              अयुर्दायं प्रवक्ष्यामि नराणां पुण्यकर्मणाम् । नक्षत्राधिपतेर्वीर्यात् सुखसौभाग्यवर्धनम् ॥<br />
              न मया धारिता शंकु घटिका नैव साधिता । परोपदेशवेलायां लिखिता जन्मपत्रिका ॥
            </p>
          </div>

          {/* Signature Block */}
          <AstrologerSignatureBlock astrologer={astrologer} orgProfile={orgProfile} />
        </GreenOmBorderFrame>
      </div>
    );
  }

  // =========================================================================
  // 4. VIVAH (विवाह) -> Exactly 1 Page (Matching media_1789802127957.png)
  // =========================================================================
  if (subCategory === 'vivah') {
    const vivahAnalysis = analyzeVivahAstrology(safeProfile, safeLagna, safePlanets, panchanga);
    const marsPlanet = safePlanets.find((p) => p.name === 'मंगल' || (p.name as string) === 'मङ्गल');
    const isManglik = marsPlanet?.bhava ? [1, 4, 7, 8, 12].includes(marsPlanet.bhava) : false;

    return (
      <div ref={containerRef} id="printable-patrika-wrapper" className="w-full flex justify-center">
        <GreenOmBorderFrame className="space-y-1.5">
          {/* Header */}
          <GaneshaHeaderCenter
            orgName={orgProfile.name}
            orgPhone={toDevanagariNumerals(orgProfile.phone || '+९७७-९७६४४००५३३')}
            title="॥ शुभ विवाह संस्कार मुहूर्त तथा ३६ गुण मिलान पत्रम् ॥"
            subtitle={`सङ्कल्प तथा पञ्चाङ्ग: शुभ सम्बत् ${toDevanagariNumerals(panchanga.dateBS)} | ${panchanga.samvatsara} संवत्सर`}
            primaryShloka="ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥"
            secondaryShloka="मङ्गलं भगवान् विष्णुर्मङ्गलं गरुडध्वजः। मङ्गलं पुण्डरीकाक्षो मङ्गलायतनो हरिः॥"
          />

          {/* Box 1: जातक व्यक्तिगत तथा पारिवारिक विवरण */}
          <div className="border border-red-800 p-2 rounded-lg bg-amber-50/70 text-[10px]">
            <div className="flex items-center justify-between border-b border-red-800/50 pb-0.5 mb-1">
              <span className="font-bold text-red-900 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-red-700" />
                ॥ जातक व्यक्तिगत तथा पारिवारिक विवरण ॥
              </span>
              <span className="text-[9px] text-amber-900 font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-amber-300">
                क्रमाङ्क: {safeProfile.jatakSerialNo || safeProfile.customerId || 'विवाह-००१'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="border-r border-amber-800/30 pr-2 space-y-0.5">
                <p><strong>जातकको नाम:</strong> <span className="text-red-900 font-bold">{safeProfile.name}</span> ({safeProfile.gender === 'male' ? 'वर (पुरुष)' : 'कन्या (महिला)'})</p>
                <p><strong>जन्म मिति (वि.सं.):</strong> <span className="font-bold">{toDevanagariNumerals(safeProfile.dateBS)}</span> (ई.सं. {safeProfile.dateAD})</p>
                <p><strong>स्थानीय समय/स्थान:</strong> {toDevanagariNumerals(safeProfile.time)} | {safeProfile.location?.name || '—'}</p>
              </div>

              <div className="space-y-0.5">
                <p><strong>बाबुको नाम:</strong> {safeProfile.fatherDetails?.name || safeProfile.parentName || '—'} | <strong>आमा:</strong> {safeProfile.motherDetails?.name || '—'}</p>
                <p><strong>मुख्य गोत्र:</strong> <span className="font-bold text-amber-950">{safeProfile.fatherDetails?.gotra || '—'}</span> | <strong>कुलदेवता:</strong> {safeProfile.familyHistory?.kuldevata || '—'}</p>
                <p><strong>स्थायी ठेगाना:</strong> {[safeProfile.location?.district, safeProfile.location?.country || 'नेपाल'].filter(Boolean).join(', ') || safeProfile.location?.name || '—'}</p>
              </div>
            </div>
          </div>

          {/* Box 2: जन्मकालीन पञ्चाङ्ग तथा अङ्ग स्थिति */}
          <div className="border border-amber-800 p-1.5 rounded-lg bg-amber-100/40 text-[9.5px]">
            <div className="grid grid-cols-4 gap-1">
              <p><strong>अयन/ऋतु:</strong> {panchanga?.ayana || 'उत्तरायण'} / {panchanga?.ritu || 'शिशिर'}</p>
              <p><strong>तिथि:</strong> {panchanga?.tithi?.name || 'प्रतिपदा'} ({panchanga?.tithi?.paksha || 'शुक्ल'} पक्ष)</p>
              <p><strong>वार:</strong> {panchanga?.dayNameNepali || 'आइतबार'}</p>
              <p><strong>नक्षत्र:</strong> {panchanga?.nakshatra?.name || 'रोहिणी'} (पाद {toDevanagariNumerals(panchanga?.nakshatra?.pada ?? 1)})</p>
              <p><strong>सूर्य/चन्द्र राशि:</strong> {panchanga?.sunRashi || 'कुम्भ'} / {panchanga?.moonRashi || 'मेष'}</p>
              <p><strong>जन्म लग्न:</strong> {safeLagna?.rashiName || 'मेष'}</p>
              <p><strong>योग/करण:</strong> {panchanga?.yoga?.name || 'सिद्धि'} / {panchanga?.karana?.name || 'बव'}</p>
              <p><strong>संवत्सर:</strong> {panchanga?.samvatsara || 'सिद्धार्थी'}</p>
            </div>
          </div>

          {/* Box 3: शुभ-विवाह संस्कार मुहूर्त तथा ज्योतिषीय विचार */}
          <div className="border border-red-800 p-2 rounded-lg bg-amber-50/80 space-y-1 text-[9.5px]">
            <h3 className="font-bold text-red-900 border-b border-red-600 pb-0.5 text-[10px] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-red-700" />
                ॥ शुभ-विवाह संस्कार मुहूर्त तथा ज्योतिषीय विचार पत्रम् ॥
              </span>
              <span className="italic text-amber-900 text-[9px]">कन्या वरान्विता रम्या सुलग्ने सुमुहूर्तके</span>
            </h3>
            <div className="grid grid-cols-4 gap-1 pt-0.5">
              <p><strong>उमेर हद:</strong> {vivahAnalysis?.recommendedAgeRangeNepali || '२० देखि २८ वर्ष'}</p>
              <p><strong>उमेर मूल्यांकन:</strong> {vivahAnalysis?.ageAssessmentNepali || 'विवाहका लागि अनुकुल'}</p>
              <p><strong>गुरु बल:</strong> {vivahAnalysis?.jupiterStrengthNepali || 'अनुकुल एवं शुभ'}</p>
              <p><strong>शुक्र/सूर्य बल:</strong> {vivahAnalysis?.venusStrengthNepali || 'दाम्पत्य सुख कारक'}</p>
            </div>
            <div className="bg-white p-1 rounded border border-amber-300 space-y-0.5 text-[9px]">
              <p><strong>शुभ महिनाहरू:</strong> {(vivahAnalysis?.favorableMonthsNepali || ['वैशाख', 'ज्येष्ठ', 'अषाढ', 'माघ', 'फाल्गुन']).join(', ')} | <strong>शुभ नक्षत्रहरू:</strong> {(vivahAnalysis?.favorableNakshatrasNepali || ['रोहिणी', 'मृगशिरा', 'उत्तराफाल्गुनी', 'हस्त', 'स्वाती', 'अनुराधा', 'रेवती']).slice(0, 7).join(', ')}</p>
              <p><strong>ज्योतिषाचार्य निष्कर्ष:</strong> {vivahAnalysis?.overallRecommendationNepali || 'कुण्डली अनुसार वैवाहिक जीवन सुखद, सन्तान सुख तथा पारिवारिक कल्याण हुने योग देखिन्छ।'}</p>
            </div>
          </div>

          {/* Box 4: अष्टकूट ३६ गुण मिलान संरचना एवं मङ्गल (कुज) दोष विचार */}
          <div className="border border-amber-900 rounded-lg p-2 bg-[#FFFDF9] text-[9.5px] space-y-1">
            <div className="flex justify-between items-center border-b border-amber-700/50 pb-0.5">
              <span className="font-bold text-red-900 text-[10px]">॥ अष्टकूट ३६ गुण मिलान तालिका एवं मङ्गल (कुज) दोष विचार ॥</span>
              <span className="text-[8.5px] bg-red-100 text-red-950 font-bold px-1.5 py-0.2 rounded border border-red-300">उत्तम मिलान: १८+ ग्राह्य / २४+ उत्तम / ३०+ सर्वोत्तम</span>
            </div>
            
            <div className="grid grid-cols-8 gap-1 text-center font-semibold text-[8.5px]">
              <div className="bg-amber-50 p-1 rounded border border-amber-200">
                <span className="block text-stone-500 text-[8px]">१. वर्ण (१)</span>
                <span className="text-blue-900 font-bold">आध्यात्मिक</span>
              </div>
              <div className="bg-amber-50 p-1 rounded border border-amber-200">
                <span className="block text-stone-500 text-[8px]">२. वश्य (२)</span>
                <span className="text-blue-900 font-bold">आकर्षण</span>
              </div>
              <div className="bg-amber-50 p-1 rounded border border-amber-200">
                <span className="block text-stone-500 text-[8px]">३. तारा (३)</span>
                <span className="text-blue-900 font-bold">भाग्य/आयु</span>
              </div>
              <div className="bg-amber-50 p-1 rounded border border-amber-200">
                <span className="block text-stone-500 text-[8px]">४. योनि (४)</span>
                <span className="text-blue-900 font-bold">शारीरिक</span>
              </div>
              <div className="bg-amber-50 p-1 rounded border border-amber-200">
                <span className="block text-stone-500 text-[8px]">५. मैत्री (५)</span>
                <span className="text-blue-900 font-bold">मानसिक</span>
              </div>
              <div className="bg-amber-50 p-1 rounded border border-amber-200">
                <span className="block text-stone-500 text-[8px]">६. गण (६)</span>
                <span className="text-blue-900 font-bold">स्वभाव</span>
              </div>
              <div className="bg-amber-50 p-1 rounded border border-amber-200">
                <span className="block text-stone-500 text-[8px]">७. भकूट (७)</span>
                <span className="text-blue-900 font-bold">वंशवृद्धि</span>
              </div>
              <div className="bg-amber-50 p-1 rounded border border-amber-200">
                <span className="block text-stone-500 text-[8px]">८. नाडी (८)</span>
                <span className="text-blue-900 font-bold">आरोग्य</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5 text-[9px]">
              <div className="bg-amber-50/90 p-1 rounded border border-amber-200">
                <p><strong>मङ्गल दोष (कुज विचार):</strong> {isManglik ? `मङ्गल ${toDevanagariNumerals(marsPlanet?.bhava || 1)}औं भावमा (कुज दोष विचारणीय - समान मङ्गली अथवा गुरु दृष्टिद्वारा परिहार सम्भव)` : 'कुज दोषरहित (अति उत्तम एवं निर्दोष स्थिति)'}</p>
              </div>
              <div className="bg-emerald-50/90 p-1 rounded border border-emerald-200">
                <p><strong>वैवाहिक मङ्गल आशीर्वचन:</strong> दाम्पत्ये समरसत्वं स्यात् कुलकीर्तिविवर्धनम्। अष्टैश्वर्यसमृद्धिश्च चिरञ्जीवौ भवन्तु तौ॥</p>
              </div>
            </div>
          </div>

          {/* Box 5: Planetary Positions Table + Lagna Kundali Chart */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-[9px] items-center">
            <div className="md:col-span-7">
              <CompactPlanetaryTable lagna={safeLagna} planets={safePlanets} />
            </div>
            <div className="md:col-span-5 flex justify-center">
              <PrintableDiamondChart
                title="लग्न कुण्डली (D1)"
                houses={d1Chart.houses.map((h) => ({ houseNumber: h.houseNumber, rashiId: h.rashiId, planets: h.planets }))}
                maxSize={180}
              />
            </div>
          </div>

          {/* Box 6: Classical Vivah Blessing Shloka */}
          <div className="border border-red-800/80 rounded-lg p-1.5 bg-amber-50/60 text-center text-[9.5px] italic text-stone-800 font-serif">
            विवाहसमये प्राप्ते वरान्विता सुखावहा । शुभलग्ने सुमुहूर्ते च सर्वसम्पत्करी भवेत् ॥<br />
            ॐ सुमङ्गलीरियं वधूरिमां समेत पश्यत । सौभाग्यमस्यै दत्त्वायाथास्तं विपरेतन ॥
          </div>

          {/* Astrologer Certification & Signature Block */}
          <AstrologerSignatureBlock astrologer={astrologer} orgProfile={orgProfile} />
        </GreenOmBorderFrame>
      </div>
    );
  }

  // =========================================================================
  // 5. BRATABANDHA / UPANAYAN (व्रतबन्ध / उपनयन) -> Exactly 1 Page
  // =========================================================================
  if (subCategory === 'bartabandha' || subCategory === 'upanayan') {
    const bartabandhaAnalysis = analyzeBartabandhaAstrology(safeProfile, safeLagna, safePlanets, panchanga);

    return (
      <div ref={containerRef} id="printable-patrika-wrapper" className="w-full flex justify-center">
        <GreenOmBorderFrame className="space-y-1.5">
          <GaneshaHeaderCenter
            orgName={orgProfile.name}
            orgPhone={toDevanagariNumerals(orgProfile.phone || '+९७७-९७६४४००५३३')}
            title="॥ उपनयन (व्रतबन्ध) संस्कार शुभ मुहूर्त पत्रम् ॥"
            subtitle={`सङ्कल्प तथा पञ्चाङ्ग: शुभ सम्बत् ${toDevanagariNumerals(panchanga.dateBS)} | ${panchanga.samvatsara} संवत्सर`}
            primaryShloka="ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥"
            secondaryShloka="गायत्री छन्दसां माता ब्रह्मसञ्जननी परा। उपनीय तु यः शिष्यं वेदमध्यापयेद् द्विजः॥"
          />

          {/* Box 1: बटुक तथा पारिवारिक विवरण */}
          <div className="border border-red-800 p-2 rounded-lg bg-amber-50/70 text-[10px]">
            <div className="flex items-center justify-between border-b border-red-800/50 pb-0.5 mb-1">
              <span className="font-bold text-red-900 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-red-700" />
                ॥ बटुक (जातक) व्यक्तिगत तथा पारिवारिक विवरण ॥
              </span>
              <span className="text-[9px] text-amber-900 font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-amber-300">
                क्रमाङ्क: {safeProfile.jatakSerialNo || safeProfile.customerId || 'बटुक-००१'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="border-r border-amber-800/30 pr-2 space-y-0.5">
                <p><strong>बटुकको नाम:</strong> <span className="text-red-900 font-bold">{safeProfile.name}</span></p>
                <p><strong>जन्म मिति (वि.सं.):</strong> <span className="font-bold">{toDevanagariNumerals(safeProfile.dateBS)}</span> (ई.सं. {safeProfile.dateAD})</p>
                <p><strong>स्थानीय जन्म समय/स्थान:</strong> {toDevanagariNumerals(safeProfile.time)} | {safeProfile.location?.name || '—'}</p>
              </div>
              <div className="space-y-0.5">
                <p><strong>बाबुको नाम:</strong> {safeProfile.fatherDetails?.name || safeProfile.parentName || '—'} | <strong>आमा:</strong> {safeProfile.motherDetails?.name || '—'}</p>
                <p><strong>मुख्य गोत्र:</strong> <span className="font-bold text-amber-950">{safeProfile.fatherDetails?.gotra || '—'}</span> | <strong>कुलदेवता:</strong> {safeProfile.familyHistory?.kuldevata || '—'}</p>
                <p><strong>ठेगाना:</strong> {[safeProfile.location?.district, safeProfile.location?.country || 'नेपाल'].filter(Boolean).join(', ') || safeProfile.location?.name || '—'}</p>
              </div>
            </div>
          </div>

          {/* Box 2: जन्मकालीन पञ्चाङ्ग */}
          <div className="border border-amber-800 p-1.5 rounded-lg bg-amber-100/40 text-[9.5px]">
            <div className="grid grid-cols-4 gap-1">
              <p><strong>अयन/ऋतु:</strong> {panchanga?.ayana || 'उत्तरायण'} / {panchanga?.ritu || 'शिशिर'}</p>
              <p><strong>तिथि:</strong> {panchanga?.tithi?.name || 'प्रतिपदा'} ({panchanga?.tithi?.paksha || 'शुक्ल'} पक्ष)</p>
              <p><strong>वार:</strong> {panchanga?.dayNameNepali || 'आइतबार'}</p>
              <p><strong>नक्षत्र:</strong> {panchanga?.nakshatra?.name || 'रोहिणी'} (पाद {toDevanagariNumerals(panchanga?.nakshatra?.pada ?? 1)})</p>
              <p><strong>सूर्य/चन्द्र राशि:</strong> {panchanga?.sunRashi || 'कुम्भ'} / {panchanga?.moonRashi || 'मेष'}</p>
              <p><strong>जन्म लग्न:</strong> {safeLagna?.rashiName || 'मेष'}</p>
              <p><strong>योग/करण:</strong> {panchanga?.yoga?.name || 'सिद्धि'} / {panchanga?.karana?.name || 'बव'}</p>
              <p><strong>संवत्सर:</strong> {panchanga?.samvatsara || 'सिद्धार्थी'}</p>
            </div>
          </div>

          {/* Box 3: व्रतबन्ध सङ्कल्प तथा उपनयन विधि */}
          <div className="border border-red-700/80 rounded-lg p-1.5 bg-amber-50/50 text-[9.5px] leading-relaxed text-justify">
            <span className="text-red-800 font-bold">सङ्कल्प:</span> ॐ अस्य बटुकस्य श्री <span className="text-red-800 font-bold">{safeProfile.name}</span> नाम्न: द्विजत्वप्राप्त्यर्थं, वेदाध्ययनाधिकारार्थं, ब्रह्मतेजोऽभिवृद्ध्यर्थं च यथाशास्त्रं उपनयन (व्रतबन्ध) संस्कारविधिना यज्ञोपवीतधारणं गायत्रीमन्त्रोपदेशं च करिष्ये। संवत् {toDevanagariNumerals(bsYear)} {panchanga?.ayana || 'उत्तरायण'} अयने {safeLagna?.rashiName || 'मेष'} लग्नोदये शुभम्।
          </div>

          {/* Box 4: उपनयन मुहूर्त तथा ज्योतिषीय विचार */}
          <div className="border border-red-800 p-1.5 rounded-lg bg-amber-50/80 space-y-0.5 text-[9.5px]">
            <h3 className="font-bold text-red-900 border-b border-red-600 pb-0.5 text-[10px] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-red-700" />
                ॥ व्रतबन्ध संस्कार मुहूर्त तथा ज्योतिषीय विचार पत्रम् ॥
              </span>
              <span className="italic text-amber-900 text-[9px]">उपनयनं द्विजत्वस्य प्रथमं द्वारमुच्यते</span>
            </h3>
            <div className="grid grid-cols-4 gap-1 pt-0.5">
              <p><strong>उमेर हद:</strong> {bartabandhaAnalysis?.recommendedAgeRangeNepali || '८ वा ११औं वर्ष'}</p>
              <p><strong>उमेर मूल्यांकन:</strong> {bartabandhaAnalysis?.ageAssessmentNepali || 'उपनयनका लागि शास्त्रोक्त'}</p>
              <p><strong>गुरु बल:</strong> {bartabandhaAnalysis?.jupiterStrengthNepali || 'बृहस्पति बलवान तथा अनुकुल'}</p>
              <p><strong>सूर्य बल:</strong> {bartabandhaAnalysis?.sunStrengthNepali || 'सूर्य तेज तथा ज्ञानवृद्धि कारक'}</p>
            </div>
            <div className="bg-white p-1 rounded border border-amber-300 space-y-0.5 text-[9px]">
              <p><strong>शुभ महिनाहरू:</strong> {(bartabandhaAnalysis?.favorableMonthsNepali || ['माघ', 'फाल्गुन', 'चैत्र', 'वैशाख', 'ज्येष्ठ']).join(', ')} | <strong>शुभ नक्षत्रहरू:</strong> {(bartabandhaAnalysis?.favorableNakshatrasNepali || ['अश्विनी', 'रोहिणी', 'मृगशिरा', 'पुनर्वसु', 'पुष्य', 'हस्त', 'चित्रा', 'स्वाती', 'रेवती']).slice(0, 8).join(', ')}</p>
              <p><strong>ज्योतिषाचार्य निष्कर्ष:</strong> {bartabandhaAnalysis?.overallRecommendationNepali || 'बटुकको कुण्डली अनुसार व्रतबन्ध संस्कार सम्पन्न गरी गायत्री मन्त्रोपदेश दिनु अति उत्तम र फलदायी रहनेछ।'}</p>
            </div>
          </div>

          {/* Box 5: यज्ञोपवीत (जनै) धारण मन्त्र तथा बटुक ब्रह्मचर्य आचार */}
          <div className="border border-amber-900 rounded-lg p-1.5 bg-[#FFFDF9] text-[9.5px] space-y-0.5">
            <div className="flex justify-between items-center border-b border-amber-700/50 pb-0.5">
              <span className="font-bold text-red-900 text-[10px]">॥ यज्ञोपवीत (जनै) धारण मन्त्र, गायत्री उपदेश तथा बटुक आचार संहिता ॥</span>
              <span className="text-[8.5px] bg-amber-200 text-amber-950 font-bold px-1.5 py-0.2 rounded border border-amber-400">द्विजत्व संस्कार</span>
            </div>
            <p className="italic text-amber-950 bg-amber-100/70 p-1 rounded text-center font-serif text-[9px] leading-tight">
              यज्ञोपवीतं परमं पवित्रं प्रजापतेर्यत्सहजं पुरस्तात्। आयुष्यमग्र्यं प्रतिमुञ्च शुभ्रं यज्ञोपवीतं बलमस्तु तेजः॥<br />
              ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्॥
            </p>
            <div className="grid grid-cols-4 gap-1 pt-0.5 text-[8.5px] text-center">
              <div className="bg-amber-50 p-0.5 rounded border border-amber-200">
                <strong className="text-red-900 block">१. त्रिकाल सन्ध्या</strong>
                <span className="text-stone-600">प्रातः, मध्याह्न, सायं गायत्री जप</span>
              </div>
              <div className="bg-amber-50 p-0.5 rounded border border-amber-200">
                <strong className="text-blue-900 block">२. शिखा-सूत्र मर्यादा</strong>
                <span className="text-stone-600">टुप्पी र जनैको नित्य संरक्षण</span>
              </div>
              <div className="bg-amber-50 p-0.5 rounded border border-amber-200">
                <strong className="text-green-900 block">३. वेदाध्ययन निष्ठा</strong>
                <span className="text-stone-600">विद्या, बुद्धि तथा गुरुसेवा</span>
              </div>
              <div className="bg-amber-50 p-0.5 rounded border border-amber-200">
                <strong className="text-amber-900 block">४. आशीर्वचन</strong>
                <span className="text-stone-600">ब्रह्मतेजस्वी, मेधावी, चिरायु भव</span>
              </div>
            </div>
          </div>

          {/* Box 6: बटुक शुभ ग्रह बल एवं संस्कार फल विचार */}
          <div className="border border-green-800 rounded-lg p-1.5 bg-green-50/40 text-[9px] space-y-0.5">
            <div className="flex justify-between items-center border-b border-green-300 pb-0.5">
              <span className="font-bold text-green-950 text-[9.5px]">॥ संस्कार ग्रह बल एवं द्विजत्व सिद्धि विचार ॥</span>
              <span className="text-[8px] bg-green-200 text-green-950 font-bold px-1 py-0.2 rounded border border-green-400">उपनयन सिद्धि</span>
            </div>
            <div className="grid grid-cols-4 gap-1 pt-0.5 text-center">
              <div className="bg-white p-1 rounded border border-green-200">
                <strong className="text-amber-900 block">गुरु बल (ज्ञान)</strong>
                <span className="text-stone-600">मन्त्रदीक्षा, बुद्धि तथा सात्विक विचार</span>
              </div>
              <div className="bg-white p-1 rounded border border-green-200">
                <strong className="text-red-900 block">सूर्य बल (तेज)</strong>
                <span className="text-stone-600">आरोग्य, तेजस्विता एवं पितृआशीर्वाद</span>
              </div>
              <div className="bg-white p-1 rounded border border-green-200">
                <strong className="text-blue-900 block">मङ्गल बल (अनुशासन)</strong>
                <span className="text-stone-600">ब्रह्मचर्य पालन, धैर्य एवं कर्त्तव्यनिष्ठा</span>
              </div>
              <div className="bg-white p-1 rounded border border-green-200">
                <strong className="text-purple-900 block">चन्द्र बल (मनोबल)</strong>
                <span className="text-stone-600">एकाग्रता, स्मरणशक्ति एवं विद्यावृद्धि</span>
              </div>
            </div>
          </div>

          {/* Box 7: Planetary Table + Kundali */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-[9px] items-center">
            <div className="md:col-span-7">
              <CompactPlanetaryTable lagna={safeLagna} planets={safePlanets} />
            </div>
            <div className="md:col-span-5 flex justify-center">
              <PrintableDiamondChart
                title="लग्न कुण्डली (D1)"
                houses={d1Chart.houses.map((h) => ({ houseNumber: h.houseNumber, rashiId: h.rashiId, planets: h.planets }))}
                maxSize={180}
              />
            </div>
          </div>

          {/* Box 8: Classical Upanayan Blessing Shloka */}
          <div className="border border-red-800/80 rounded-lg p-1.5 bg-amber-50/60 text-center text-[9.5px] italic text-stone-800 font-serif">
            गायत्री वेदमाता च ब्रह्मतेजोविवर्धिनी । उपनीतो द्विजो भूत्वा वेदमध्यापयेत् सदा ॥<br />
            आयुष्मान् भव सौम्य त्वं मेधावी ब्रह्मवित्तमः । सर्वविद्यासु निष्णातो भूत्वा कुलमलं कुरु ॥
          </div>

          <AstrologerSignatureBlock astrologer={astrologer} orgProfile={orgProfile} />
        </GreenOmBorderFrame>
      </div>
    );
  }

  // =========================================================================
  // 6. NAAMKARAN (नामकरण) -> Exactly 1 Page
  // =========================================================================
  if (subCategory === 'naamkaran') {
    const chosenNakshatra = panchanga?.nakshatra?.name || 'रोहिणी';
    const chosenPada = panchanga?.nakshatra?.pada || 1;
    const nakshatraObj = NAKSHATRA_AVAKAHADA[chosenNakshatra] || { namakshara: ['ओ', 'वा', 'वी', 'वू'] };
    const chosenLetter = nakshatraObj.namakshara[chosenPada - 1] || nakshatraObj.namakshara[0] || '—';

    return (
      <div ref={containerRef} id="printable-patrika-wrapper" className="w-full flex justify-center">
        <GreenOmBorderFrame className="space-y-1.5">
          <GaneshaHeaderCenter
            orgName={orgProfile.name}
            orgPhone={toDevanagariNumerals(orgProfile.phone || '+९७७-९७६४४००५३३')}
            title="॥ नामकरण संस्कार नक्षत्र अक्षर तथा मुहूर्त पत्रम् ॥"
            subtitle={`सङ्कल्प तथा पञ्चाङ्ग: शुभ सम्बत् ${toDevanagariNumerals(panchanga.dateBS)} | ${panchanga.samvatsara} संवत्सर`}
            primaryShloka="ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥"
            secondaryShloka="आयुर्वेदाभिवृद्धिश्च सिद्धिर्विह्वारगोचरे। नामकर्मप्रभावेण पुरुषो लभते सदा॥"
          />

          {/* Box 1: शिशु तथा पारिवारिक विवरण */}
          <div className="border border-red-800 p-2 rounded-lg bg-amber-50/70 text-[10px]">
            <div className="flex items-center justify-between border-b border-red-800/50 pb-0.5 mb-1">
              <span className="font-bold text-red-900 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-red-700" />
                ॥ नवजात शिशु तथा पारिवारिक विवरण ॥
              </span>
              <span className="text-[9px] text-amber-900 font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-amber-300">
                क्रमाङ्क: {safeProfile.jatakSerialNo || safeProfile.customerId || 'शिशु-००१'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="border-r border-amber-800/30 pr-2 space-y-0.5">
                <p><strong>शिशुको नाम:</strong> <span className="text-red-900 font-bold">{safeProfile.name}</span> ({safeProfile.gender === 'male' ? 'बालक' : 'बालिका'})</p>
                <p><strong>जन्म मिति (वि.सं.):</strong> <span className="font-bold">{toDevanagariNumerals(safeProfile.dateBS)}</span> (ई.सं. {safeProfile.dateAD})</p>
                <p><strong>स्थानीय जन्म समय/स्थान:</strong> {toDevanagariNumerals(safeProfile.time)} | {safeProfile.location?.name || '—'}</p>
              </div>
              <div className="space-y-0.5">
                <p><strong>बाबुको नाम:</strong> {safeProfile.fatherDetails?.name || safeProfile.parentName || '—'} | <strong>आमा:</strong> {safeProfile.motherDetails?.name || '—'}</p>
                <p><strong>मुख्य गोत्र:</strong> <span className="font-bold text-amber-950">{safeProfile.fatherDetails?.gotra || '—'}</span> | <strong>कुलदेवता:</strong> {safeProfile.familyHistory?.kuldevata || '—'}</p>
                <p><strong>ठेगाना:</strong> {[safeProfile.location?.district, safeProfile.location?.country || 'नेपाल'].filter(Boolean).join(', ') || safeProfile.location?.name || '—'}</p>
              </div>
            </div>
          </div>

          {/* Box 2: जन्म पञ्चाङ्ग तथा अवकहडा चक्र */}
          <div className="border border-amber-800 p-1.5 rounded-lg bg-amber-100/40 text-[9.5px] space-y-1">
            <div className="grid grid-cols-4 gap-1">
              <p><strong>तिथि:</strong> {panchanga?.tithi?.name || 'प्रतिपदा'} ({panchanga?.tithi?.paksha || 'शुक्ल'})</p>
              <p><strong>वार:</strong> {panchanga?.dayNameNepali || 'आइतबार'}</p>
              <p><strong>जन्म नक्षत्र:</strong> {chosenNakshatra} (पाद {toDevanagariNumerals(chosenPada)})</p>
              <p><strong>जन्म लग्न/राशि:</strong> {safeLagna?.rashiName || 'मेष'} / {panchanga?.moonRashi || 'वृष'}</p>
            </div>
            <div className="pt-0.5 border-t border-amber-300 grid grid-cols-6 gap-1 text-center font-bold text-stone-800 text-[8.5px]">
              <span className="bg-white/70 p-0.5 rounded">नाडी: {avakahadaInfo.nadi}</span>
              <span className="bg-white/70 p-0.5 rounded">योनि: {avakahadaInfo.yoni}</span>
              <span className="bg-white/70 p-0.5 rounded">गण: {avakahadaInfo.gana}</span>
              <span className="bg-white/70 p-0.5 rounded">वर्ण: {avakahadaInfo.varna}</span>
              <span className="bg-white/70 p-0.5 rounded">वर्ग: {avakahadaInfo.varga}</span>
              <span className="bg-white/70 p-0.5 rounded">पाया: रजत (चाँदी)</span>
            </div>
          </div>

          {/* Box 3: जन्म नक्षत्र चारै पाउ तथा शास्त्रोक्त नामाक्षर चयन */}
          <div className="border border-red-800 p-1.5 rounded-lg bg-amber-50/80 text-[9.5px] space-y-1">
            <div className="flex justify-between items-center border-b border-red-600 pb-0.5">
              <span className="font-bold text-red-900 text-[10px]">॥ जन्म नक्षत्रका चारै पाउका नामाक्षरहरू एवं चयन ॥</span>
              <span className="text-[9px] text-amber-900 font-semibold">नक्षत्र स्वामी: {moonPlanet?.nakshatraLord || 'चन्द्र'}</span>
            </div>

            <div className="grid grid-cols-4 gap-1 text-center text-[9px]">
              {nakshatraObj.namakshara.map((letter, idx) => {
                const isSelected = idx + 1 === chosenPada;
                return (
                  <div
                    key={idx}
                    className={`p-1 rounded border ${
                      isSelected
                        ? 'bg-amber-200 border-amber-800 font-bold text-red-950 shadow-xs ring-1 ring-amber-600'
                        : 'bg-white border-amber-200 text-stone-700'
                    }`}
                  >
                    <span className="block text-[8px] text-stone-500">चरण {toDevanagariNumerals(idx + 1)} {isSelected ? '(जन्म पाउ)' : ''}</span>
                    <strong className="text-base text-red-900">{letter}</strong>
                  </div>
                );
              })}
            </div>

            <div className="bg-white p-1 rounded border border-amber-300 text-[9px] leading-tight space-y-0.5">
              <p>जातकको जन्म <strong>{chosenNakshatra}</strong> नक्षत्रको <strong>{toDevanagariNumerals(chosenPada)}औं पाउमा</strong> भएकाले शास्त्रोक्त मूल नामाक्षर <strong className="text-red-800 text-[10.5px]">'{chosenLetter}'</strong> निश्चित गरिएको छ।</p>
              <p><strong>शुभ नामकरण सिफारिस:</strong> नामाक्षर '{chosenLetter}' बाट सुरु हुने सार्थक, देवनाम, कुलपरम्परा अनुसारको सौम्य नाम चयन गर्दा आयु, आरोग्य, विद्या र यश वृद्धि हुनेछ।</p>
            </div>
          </div>

          {/* Box 4: शास्त्रोक्त चार प्रकारका नाम विचार तालिका */}
          <div className="border border-green-800 rounded-lg p-1.5 bg-green-50/40 text-[9px] space-y-0.5">
            <div className="flex justify-between items-center border-b border-green-300 pb-0.5">
              <span className="font-bold text-green-950 text-[9.5px]">॥ पारम्परिक शास्त्रोक्त चार प्रकारका नाम निर्धारण पद्धति ॥</span>
              <span className="text-[8px] bg-green-200 text-green-950 font-bold px-1 py-0.2 rounded border border-green-400">नाम भेद</span>
            </div>
            <div className="grid grid-cols-4 gap-1 pt-0.5 text-center">
              <div className="bg-white p-1 rounded border border-green-200">
                <strong className="text-red-900 block font-bold">१. नक्षत्र नाम</strong>
                <span className="text-stone-700">पाद अक्षर '{chosenLetter}' आधारित गुप्त नाम</span>
              </div>
              <div className="bg-white p-1 rounded border border-green-200">
                <strong className="text-blue-900 block font-bold">२. मास नाम</strong>
                <span className="text-stone-700">जन्म महिनाका अधिपति नारायण स्वरूप</span>
              </div>
              <div className="bg-white p-1 rounded border border-green-200">
                <strong className="text-amber-900 block font-bold">३. कुलदेव नाम</strong>
                <span className="text-stone-700">वंश परम्परा तथा इष्टदेवको अनुग्रह</span>
              </div>
              <div className="bg-white p-1 rounded border border-green-200">
                <strong className="text-purple-900 block font-bold">४. व्यावहारिक नाम</strong>
                <span className="text-stone-700">संसार प्रसिद्ध, कर्णप्रिय एवं शुभ नाम</span>
              </div>
            </div>
          </div>

          {/* Box 5: नामकरण संस्कार मुहूर्त तथा शास्त्रीय विधि */}
          <div className="border border-amber-900 rounded-lg p-1.5 bg-[#FFFDF9] text-[9.5px] space-y-0.5">
            <div className="flex justify-between items-center border-b border-amber-700/50 pb-0.5">
              <span className="font-bold text-red-900 text-[10px]">॥ नामकरण संस्कार विधि, शुभ मुहूर्त एवं आशीर्वचन ॥</span>
              <span className="text-[8.5px] bg-green-100 text-green-950 font-bold px-1.5 py-0.2 rounded border border-green-300">सर्वसिद्धिप्रद</span>
            </div>
            <p className="italic text-stone-800 text-center font-serif text-[9px] leading-tight bg-amber-50 p-1 rounded">
              नामकर्म प्रभावेण सर्वसिद्धिः प्रजायते। आयुष्यं च बलं वीर्यं यशः कीर्तिश्च वर्धते॥<br />
              दशमे द्वादशे वाऽपि दिने नाम विधीयते। कुलनाम च संस्मृत्य नक्षत्रोत्थं तथैव च॥
            </p>
            <div className="grid grid-cols-3 gap-1 pt-0.5 text-[9px]">
              <div className="bg-amber-50/80 p-1 rounded border border-amber-200">
                <p><strong>शास्त्रोक्त दिन:</strong> जन्मको १०औं, ११औं, १२औं वा १६औं दिन</p>
              </div>
              <div className="bg-amber-50/80 p-1 rounded border border-amber-200">
                <p><strong>शुभ वार/लग्न:</strong> सोम, बुध, गुरु, शुक्र / स्थिर-द्विस्वभाव लग्न</p>
              </div>
              <div className="bg-amber-50/80 p-1 rounded border border-amber-200">
                <p><strong>आशीर्वचन:</strong> आयुष्मान् भव, सौम्य भव, कुलभूषण भव</p>
              </div>
            </div>
          </div>

          {/* Box 6: Planetary Positions Table + Lagna Kundali Chart */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-[9px] items-center">
            <div className="md:col-span-7">
              <CompactPlanetaryTable lagna={safeLagna} planets={safePlanets} />
            </div>
            <div className="md:col-span-5 flex justify-center">
              <PrintableDiamondChart
                title="लग्न कुण्डली (D1)"
                houses={d1Chart.houses.map((h) => ({ houseNumber: h.houseNumber, rashiId: h.rashiId, planets: h.planets }))}
                maxSize={180}
              />
            </div>
          </div>

          {/* Box 7: Classical Ayu-Arogya Shloka */}
          <div className="border border-red-800/80 rounded-lg p-1.5 bg-amber-50/60 text-center text-[9.5px] italic text-stone-800 font-serif">
            शतं जीव शरदो वर्धमानः शतं हेमन्ताञ्छतमु वसन्तान् । शतमिन्द्राग्नी सविता बृहस्पतिः शतायुषा हविषेमं पुनर्दुः ॥<br />
            आयुर्वेदाभिवृद्धिश्च सिद्धिर्विह्वारगोचरे । नामकर्मप्रभावेण कुलकीर्तिर्विवर्धते ॥
          </div>

          <AstrologerSignatureBlock astrologer={astrologer} orgProfile={orgProfile} />
        </GreenOmBorderFrame>
      </div>
    );
  }

  // =========================================================================
  // 7. GRIHAPRAVESH (गृहप्रवेश) -> Exactly 1 Page
  // =========================================================================
  if (subCategory === 'grihapravesh') {
    const grihaAnalysis = analyzeGrihaPraveshAstrology(safeProfile, safeLagna, safePlanets, panchanga);

    return (
      <div ref={containerRef} id="printable-patrika-wrapper" className="w-full flex justify-center">
        <GreenOmBorderFrame className="space-y-1.5">
          <GaneshaHeaderCenter
            orgName={orgProfile.name}
            orgPhone={toDevanagariNumerals(orgProfile.phone || '+९७७-९७६४४००५३३')}
            title="॥ वास्तु पूजन तथा नूतन गृहप्रवेश मुहूर्त पत्रम् ॥"
            subtitle={`सङ्कल्प तथा पञ्चाङ्ग: शुभ सम्बत् ${toDevanagariNumerals(panchanga.dateBS)} | ${panchanga.samvatsara} संवत्सर`}
            primaryShloka="ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥"
            secondaryShloka="नमस्ते वास्तुपुरुषाय भूशय्याभिरत प्रभो। मद्गृहं धनधान्यादिसमृद्धं कुरु सर्वदा॥"
          />

          {/* Box 1: गृहस्वामी तथा पारिवारिक विवरण */}
          <div className="border border-red-800 p-2 rounded-lg bg-amber-50/70 text-[10px]">
            <div className="flex items-center justify-between border-b border-red-800/50 pb-0.5 mb-1">
              <span className="font-bold text-red-900 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-red-700" />
                ॥ गृहस्वामी तथा पारिवारिक विवरण ॥
              </span>
              <span className="text-[9px] text-amber-900 font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-amber-300">
                क्रमाङ्क: {safeProfile.jatakSerialNo || safeProfile.customerId || 'गृह-००१'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="border-r border-amber-800/30 pr-2 space-y-0.5">
                <p><strong>गृहस्वामीको नाम:</strong> <span className="text-red-900 font-bold">{safeProfile.name}</span></p>
                <p><strong>जन्म मिति (वि.सं.):</strong> {toDevanagariNumerals(safeProfile.dateBS)} | <strong>लग्न/राशि:</strong> {safeLagna?.rashiName} / {panchanga?.moonRashi}</p>
                <p><strong>नयाँ घरको ठेगाना:</strong> {safeProfile.location?.name || '—'}</p>
              </div>
              <div className="space-y-0.5">
                <p><strong>बाबुको नाम:</strong> {safeProfile.fatherDetails?.name || safeProfile.parentName || '—'}</p>
                <p><strong>मुख्य गोत्र:</strong> <span className="font-bold text-amber-950">{safeProfile.fatherDetails?.gotra || '—'}</span> | <strong>कुलदेवता:</strong> {safeProfile.familyHistory?.kuldevata || '—'}</p>
                <p><strong>सङ्कल्पकर्ता:</strong> गृहस्वामी सपरिवार</p>
              </div>
            </div>
          </div>

          {/* Box 2: वास्तु पुरुष मण्डल सङ्कल्प तथा ध्यान */}
          <div className="border border-red-700/80 rounded-lg p-1.5 bg-amber-50/50 text-[9.5px] leading-relaxed text-justify">
            <span className="text-red-800 font-bold">वास्तु सङ्कल्प:</span> ॐ अद्य श्रीसूर्य उत्तरायणे शुभमासे शुभतिथौ गृहे वास्तुदोषनिवारणार्थं, अष्टदिक्पाल, नवग्रह, वास्तुपुरुष प्रीत्यर्थं नूतनगृहप्रवेशविधिं करिष्ये। वास्तुपुरुषाय नमः सर्वशान्तिर्भवतु। सुखशान्ति, समृद्धि, सन्तानवृद्धि एवं कुलकल्याणम् अस्तु।
          </div>

          {/* Box 3: अष्टदिक्पाल तथा गृह वास्तुकला चक्र */}
          <div className="border border-amber-900 rounded-lg p-1.5 bg-[#FFFDF9] text-[9px] space-y-1">
            <div className="flex justify-between items-center border-b border-amber-700/50 pb-0.5">
              <span className="font-bold text-red-900 text-[9.5px]">॥ अष्टदिक्पाल एवं गृह वास्तुकला कक्ष निर्धारण चक्र ॥</span>
              <span className="text-[8px] bg-amber-200 text-amber-950 font-bold px-1.5 py-0.2 rounded border border-amber-400">वास्तु शास्त्र विधान</span>
            </div>

            <div className="grid grid-cols-4 gap-1 text-[8.5px] text-center">
              <div className="bg-amber-50 p-1 rounded border border-amber-200">
                <strong className="text-blue-900 block">ईशान (शिव)</strong>
                <span className="text-stone-700">पूजा कोठा, जल तत्व, ध्यान</span>
              </div>
              <div className="bg-amber-50 p-1 rounded border border-amber-200">
                <strong className="text-blue-900 block">पूर्व (इन्द्र)</strong>
                <span className="text-stone-700">मुख्य प्रवेशद्वार, खुला बरन्डा</span>
              </div>
              <div className="bg-amber-50 p-1 rounded border border-amber-200">
                <strong className="text-blue-900 block">आग्नेय (अग्नि)</strong>
                <span className="text-stone-700">भान्छाघर (किचन), अग्निस्थान</span>
              </div>
              <div className="bg-amber-50 p-1 rounded border border-amber-200">
                <strong className="text-blue-900 block">दक्षिण (यम)</strong>
                <span className="text-stone-700">शयनकक्ष, भारी सामान भण्डार</span>
              </div>
              <div className="bg-amber-50 p-1 rounded border border-amber-200">
                <strong className="text-blue-900 block">नैऋत्य (पितृ)</strong>
                <span className="text-stone-700">मुख्य शयन (Master Bed), सुरक्षा</span>
              </div>
              <div className="bg-amber-50 p-1 rounded border border-amber-200">
                <strong className="text-blue-900 block">पश्चिम (वरुण)</strong>
                <span className="text-stone-700">भोजन कक्ष, अध्ययन, पानी ट्याङ्की</span>
              </div>
              <div className="bg-amber-50 p-1 rounded border border-amber-200">
                <strong className="text-blue-900 block">वायव्य (वायु)</strong>
                <span className="text-stone-700">अतिथि कक्ष, वायु सञ्चार</span>
              </div>
              <div className="bg-amber-50 p-1 rounded border border-amber-200">
                <strong className="text-blue-900 block">उत्तर (कुबेर)</strong>
                <span className="text-stone-700">धन भण्डार, लकर, खुला स्थान</span>
              </div>
            </div>

            <p className="text-stone-800 text-[8.5px] text-center italic bg-amber-50/60 p-0.5 rounded">
              घरको केन्द्रभाग (ब्रह्मस्थान) सधैं खुला, हलुका, स्वच्छ र पवित्र राख्नुपर्दछ।
            </p>
          </div>

          {/* Box 4: गृहप्रवेश मुहूर्त तथा ज्योतिषीय विचार */}
          <div className="border border-red-800 p-1.5 rounded-lg bg-amber-50/80 space-y-0.5 text-[9.5px]">
            <h3 className="font-bold text-red-900 border-b border-red-600 pb-0.5 text-[10px] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-red-700" />
                ॥ नूतन गृहप्रवेश मुहूर्त तथा शास्त्रीय विधि ॥
              </span>
              <span className="italic text-amber-900 text-[9px]">गृहप्रवेशः शुभदो नराणां सुपुत्रपौत्रप्रचुरार्थलाभः</span>
            </h3>
            <div className="grid grid-cols-4 gap-1 pt-0.5">
              <p><strong>सूर्य अयन:</strong> {panchanga?.ayana || 'उत्तरायण'} (शुभ)</p>
              <p><strong>लग्न शुद्धि:</strong> स्थिर लग्न (वृष, सिंह, वृश्चिक, कुम्भ)</p>
              <p><strong>शुभ महिना:</strong> {(grihaAnalysis?.favorableMonthsNepali || ['वैशाख', 'ज्येष्ठ', 'माघ', 'फाल्गुन']).join(', ')}</p>
              <p><strong>शुभ नक्षत्र:</strong> {(grihaAnalysis?.favorableNakshatrasNepali || ['रोहिणी', 'मृगशिरा', 'चित्रा', 'अनुराधा', 'रेवती']).join(', ')}</p>
            </div>
            <div className="bg-white p-1 rounded border border-amber-300 space-y-0.5 text-[9px]">
              <p><strong>गृहप्रवेश विधि:</strong> कलश यात्रा, शङ्खनाद, अग्निस्थापन (वास्तु होम), गौ-प्रवेश, वास्तु पुरुष बलि तथा ब्राह्मण भोजन गराई गृहप्रवेश गर्नु श्रेयस्कर हुन्छ।</p>
              <p><strong>ज्योतिषाचार्य निष्कर्ष:</strong> {grihaAnalysis?.overallRecommendationNepali || 'शुभ लग्न तथा वास्तु पूजा सम्पन्न गरी नूतन गृहप्रवेश गर्दा कुलवृद्धि, आरोग्य र ऐश्वर्य प्राप्त हुनेछ।'}</p>
            </div>
          </div>

          {/* Box 5: गृहप्रवेश कर्म विधान एवं मङ्गल प्रवेश चरण */}
          <div className="border border-green-800 rounded-lg p-1.5 bg-green-50/40 text-[9px] space-y-0.5">
            <div className="flex justify-between items-center border-b border-green-300 pb-0.5">
              <span className="font-bold text-green-950 text-[9.5px]">॥ गृहप्रवेश मङ्गल कर्म विधान एवं चार प्रमुख चरण ॥</span>
              <span className="text-[8px] bg-green-200 text-green-950 font-bold px-1 py-0.2 rounded border border-green-400">शास्त्रोक्त विधि</span>
            </div>
            <div className="grid grid-cols-4 gap-1 pt-0.5 text-center">
              <div className="bg-white p-1 rounded border border-green-200">
                <strong className="text-red-900 block font-bold">१. देहली पूजन</strong>
                <span className="text-stone-600">तोरण बन्धन, द्वारपूजा, शङ्खनाद</span>
              </div>
              <div className="bg-white p-1 rounded border border-green-200">
                <strong className="text-blue-900 block font-bold">२. पूर्णकलश यात्रा</strong>
                <span className="text-stone-600">सधवा नारीद्वारा जलकलश प्रवेश</span>
              </div>
              <div className="bg-white p-1 rounded border border-green-200">
                <strong className="text-amber-900 block font-bold">३. गो-प्रवेश (धेनु)</strong>
                <span className="text-stone-600">सवत्सा गाई प्रवेश एवं पञ्चगव्य प्रोक्षण</span>
              </div>
              <div className="bg-white p-1 rounded border border-green-200">
                <strong className="text-purple-900 block font-bold">४. वास्तु शान्ति होम</strong>
                <span className="text-stone-600">अग्निस्थापन, वास्तुबलि, विप्र भोजन</span>
              </div>
            </div>
          </div>

          {/* Box 6: Planetary Positions Table + Lagna Kundali Chart */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-[9px] items-center">
            <div className="md:col-span-7">
              <CompactPlanetaryTable lagna={safeLagna} planets={safePlanets} />
            </div>
            <div className="md:col-span-5 flex justify-center">
              <PrintableDiamondChart
                title="लग्न कुण्डली (D1)"
                houses={d1Chart.houses.map((h) => ({ houseNumber: h.houseNumber, rashiId: h.rashiId, planets: h.planets }))}
                maxSize={180}
              />
            </div>
          </div>

          {/* Box 7: Classical Vastu Shanti Shloka */}
          <div className="border border-red-800/80 rounded-lg p-1.5 bg-amber-50/60 text-center text-[9.5px] italic text-stone-800 font-serif">
            वास्तोष्पते प्रति जानीह्यस्मान् त्स्वावेशो अनमीवो भवा नः । यत् त्वेमहे प्रति तन्नो जुषस्व शं नो भव द्विपदे शं चतुष्पदे ॥<br />
            नमस्ते वास्तुपुरुषाय भूशय्याभिरत प्रभो । मद्गृहं धनधान्यादिसमृद्धं कुरु सर्वदा ॥
          </div>

          <AstrologerSignatureBlock astrologer={astrologer} orgProfile={orgProfile} />
        </GreenOmBorderFrame>
      </div>
    );
  }

  // =========================================================================
  // 8. MUHURTA (मुहूर्त पत्रिका) -> Exactly 1 Page
  // =========================================================================
  if (subCategory === 'muhurta') {
    return (
      <div ref={containerRef} id="printable-patrika-wrapper" className="w-full flex justify-center">
        <GreenOmBorderFrame className="space-y-1.5">
          <GaneshaHeaderCenter
            orgName={orgProfile.name}
            orgPhone={toDevanagariNumerals(orgProfile.phone || '+९७७-९७६४४००५३३')}
            title="॥ शुभ कर्म मुहूर्त चयन तथा पञ्चाङ्ग शुद्धि पत्रम् ॥"
            subtitle={`सङ्कल्प तथा पञ्चाङ्ग: शुभ सम्बत् ${toDevanagariNumerals(panchanga.dateBS)} | ${panchanga.samvatsara} संवत्सर`}
            primaryShloka="ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥"
            secondaryShloka="तिथिर्वारश्च नक्षत्रं योगः करणमेव च। पञ्चाङ्गस्य फलं ज्ञात्वा सर्वकार्येषु सिद्धिदम्॥"
          />

          {/* Box 1: जातक तथा मुहूर्त विवरण */}
          <div className="border border-red-800 p-2 rounded-lg bg-amber-50/70 text-[10px]">
            <div className="flex items-center justify-between border-b border-red-800/50 pb-0.5 mb-1">
              <span className="font-bold text-red-900 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-red-700" />
                ॥ जातक तथा अभीष्ट मुहूर्त प्रयोजन विवरण ॥
              </span>
              <span className="text-[9px] text-amber-900 font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-amber-300">
                क्रमाङ्क: {safeProfile.jatakSerialNo || safeProfile.customerId || 'मुहूर्त-००१'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="border-r border-amber-800/30 pr-2 space-y-0.5">
                <p><strong>जातकको नाम:</strong> <span className="text-red-900 font-bold">{safeProfile.name}</span></p>
                <p><strong>जन्म मिति / लग्न:</strong> {toDevanagariNumerals(safeProfile.dateBS)} | {safeLagna?.rashiName}</p>
                <p><strong>चन्द्र राशि:</strong> <span className="text-blue-900 font-bold">{panchanga?.moonRashi}</span> ({panchanga?.nakshatra?.name})</p>
              </div>
              <div className="space-y-0.5">
                <p><strong>मुहूर्त प्रयोजन:</strong> सर्वकार्य सिद्धि / व्यापार आरम्भ / गृह / यात्रा</p>
                <p><strong>गोत्र / कुलदेवता:</strong> {safeProfile.fatherDetails?.gotra || '—'} / {safeProfile.familyHistory?.kuldevata || '—'}</p>
                <p><strong>सम्पर्क स्थान:</strong> {safeProfile.location?.name || 'नेपाल'}</p>
              </div>
            </div>
          </div>

          {/* Box 2: पञ्चाङ्ग शुद्धि विचार */}
          <div className="border border-amber-800 p-1.5 rounded-lg bg-amber-100/40 text-[9.5px]">
            <div className="grid grid-cols-5 gap-1 text-center font-semibold">
              <div className="bg-white/80 p-1 rounded border border-amber-200">
                <span className="block text-[8px] text-stone-500">१. तिथि शुद्धि</span>
                <strong className="text-red-900">{panchanga?.tithi?.name || 'प्रतिपदा'}</strong>
                <span className="block text-[8px] text-green-800">लक्ष्मीप्रद</span>
              </div>
              <div className="bg-white/80 p-1 rounded border border-amber-200">
                <span className="block text-[8px] text-stone-500">२. वार शुद्धि</span>
                <strong className="text-red-900">{panchanga?.dayNameNepali || 'आइतबार'}</strong>
                <span className="block text-[8px] text-green-800">कार्यबलप्रद</span>
              </div>
              <div className="bg-white/80 p-1 rounded border border-amber-200">
                <span className="block text-[8px] text-stone-500">३. नक्षत्र शुद्धि</span>
                <strong className="text-red-900">{panchanga?.nakshatra?.name || 'रोहिणी'}</strong>
                <span className="block text-[8px] text-green-800">अमृत सिद्ध्य</span>
              </div>
              <div className="bg-white/80 p-1 rounded border border-amber-200">
                <span className="block text-[8px] text-stone-500">४. योग शुद्धि</span>
                <strong className="text-red-900">{panchanga?.yoga?.name || 'सिद्धि'}</strong>
                <span className="block text-[8px] text-green-800">कार्यसाधक</span>
              </div>
              <div className="bg-white/80 p-1 rounded border border-amber-200">
                <span className="block text-[8px] text-stone-500">५. करण शुद्धि</span>
                <strong className="text-red-900">{panchanga?.karana?.name || 'बव'}</strong>
                <span className="block text-[8px] text-green-800">स्थिर फलद</span>
              </div>
            </div>
          </div>

          {/* Box 3: दैनिक अष्ट चौघडिया मुहूर्त तालिका */}
          <div className="border border-amber-900 rounded-lg p-1.5 bg-[#FFFDF9] text-[9.5px] space-y-1">
            <div className="flex justify-between items-center border-b border-amber-700/50 pb-0.5">
              <span className="font-bold text-red-900 text-[10px]">॥ दैनिक अष्ट चौघडिया मुहूर्त तालिका एवं समय शुद्धि ॥</span>
              <span className="text-[8.5px] bg-green-100 text-green-950 font-bold px-1.5 py-0.2 rounded border border-green-300">सिद्धिदायक चौघडिया</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-[8.5px] text-center font-semibold">
              <div className="bg-green-50 p-1 rounded border border-green-300 text-green-950">
                <span className="block font-bold">अमृत (चन्द्र)</span>
                <span className="text-[8px]">सर्वोत्तम सिद्धि</span>
              </div>
              <div className="bg-green-50 p-1 rounded border border-green-300 text-green-950">
                <span className="block font-bold">शुभ (गुरु)</span>
                <span className="text-[8px]">धर्म, विवाह, पूजा</span>
              </div>
              <div className="bg-green-50 p-1 rounded border border-green-300 text-green-950">
                <span className="block font-bold">लाभ (बुध)</span>
                <span className="text-[8px]">व्यापार, धनलाभ</span>
              </div>
              <div className="bg-green-50 p-1 rounded border border-green-300 text-green-950">
                <span className="block font-bold">चर (शुक्र)</span>
                <span className="text-[8px]">यात्रा, गतिशील</span>
              </div>
              <div className="bg-red-50 p-1 rounded border border-red-200 text-red-950">
                <span className="block font-bold">उद्वेग (सूर्य)</span>
                <span className="text-[8px]">चिन्ता (वर्जित)</span>
              </div>
              <div className="bg-red-50 p-1 rounded border border-red-200 text-red-950">
                <span className="block font-bold">रोग (मङ्गल)</span>
                <span className="text-[8px]">कलह (वर्जित)</span>
              </div>
              <div className="bg-red-50 p-1 rounded border border-red-200 text-red-950">
                <span className="block font-bold">काल (शनि)</span>
                <span className="text-[8px]">हानि (वर्जित)</span>
              </div>
            </div>
          </div>

          {/* Box 4: नव ताराबल चक्र तथा त्याज्य महादोष विश्लेषण */}
          <div className="border border-red-800 p-1.5 rounded-lg bg-amber-50/80 space-y-0.5 text-[9px]">
            <h3 className="font-bold text-red-900 border-b border-red-600 pb-0.5 text-[9.5px] flex items-center justify-between">
              <span>॥ नव ताराबल चक्र तथा त्याज्य महादोष विश्लेषण ॥</span>
              <span className="italic text-amber-900 text-[8.5px]">ताराबलं चन्द्रबलं तदेव लक्ष्मीपते तेऽङ्घ्रियुगं स्मरामि</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div className="bg-white p-1 rounded border border-amber-300 space-y-0.5">
                <p className="font-bold text-red-900">नव ताराबल स्थिति (जन्म नक्षत्रबाट):</p>
                <p>शुभ तारा: <strong>सम्पत् (२), क्षेम (४), साधक (६), मित्र (८), परममित्र (९)</strong> - कार्यसिद्धिप्रद।</p>
                <p>वर्जित तारा: <span className="text-red-800 font-semibold">विपत् (३), प्रत्यरि (५), वध (७)</span> - सर्वथा त्याज्य।</p>
              </div>
              <div className="bg-white p-1 rounded border border-amber-300 space-y-0.5">
                <p className="font-bold text-red-900">त्याज्य महादोष एवं सावधानी:</p>
                <p><strong>वर्जित काल:</strong> भद्रा (विष्टि करण), राहुकाल, यमघण्ट, गुलिक तथा दुर्मुहूर्त काल त्याज्य।</p>
                <p><strong>ज्योतिषाचार्य निष्कर्ष:</strong> शुभ चौघडिया (अमृत/शुभ/लाभ) र शुभ लग्नमा संकल्प गर्दा कार्य निर्विघ्न सम्पन्न हुनेछ।</p>
              </div>
            </div>
          </div>

          {/* Box 5: शुभ लग्न शुद्धि एवं द्वादश भाव शुद्धि नियम */}
          <div className="border border-green-800 rounded-lg p-1.5 bg-green-50/40 text-[9px] space-y-0.5">
            <div className="flex justify-between items-center border-b border-green-300 pb-0.5">
              <span className="font-bold text-green-950 text-[9.5px]">॥ शास्त्रीय लग्न शुद्धि एवं द्वादश भाव शुद्धि नियम ॥</span>
              <span className="text-[8px] bg-green-200 text-green-950 font-bold px-1 py-0.2 rounded border border-green-400">मुहूर्त सिद्धि</span>
            </div>
            <div className="grid grid-cols-4 gap-1 pt-0.5 text-center">
              <div className="bg-white p-1 rounded border border-green-200">
                <strong className="text-red-900 block font-bold">१. लग्न शुद्धि</strong>
                <span className="text-stone-600">केन्द्रमा शुभग्रह, ३, ६, ११ मा पापी ग्रह</span>
              </div>
              <div className="bg-white p-1 rounded border border-green-200">
                <strong className="text-blue-900 block font-bold">२. अष्टम शुद्धि</strong>
                <span className="text-stone-600">८औं भाव सर्वथा रिक्त तथा निर्दोष</span>
              </div>
              <div className="bg-white p-1 rounded border border-green-200">
                <strong className="text-amber-900 block font-bold">३. चन्द्र शुद्धि</strong>
                <span className="text-stone-600">चन्द्रमा ६, ८, १२ विहीन तथा पक्षबल युक्त</span>
              </div>
              <div className="bg-white p-1 rounded border border-green-200">
                <strong className="text-purple-900 block font-bold">४. गुरु-सूर्य दृष्टि</strong>
                <span className="text-stone-600">बृहस्पतिको अमृत दृष्टिले लक्षदोष हरण</span>
              </div>
            </div>
          </div>

          {/* Box 6: Planetary Positions Table + Lagna Kundali Chart */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-[9px] items-center">
            <div className="md:col-span-7">
              <CompactPlanetaryTable lagna={safeLagna} planets={safePlanets} />
            </div>
            <div className="md:col-span-5 flex justify-center">
              <PrintableDiamondChart
                title="लग्न कुण्डली (D1)"
                houses={d1Chart.houses.map((h) => ({ houseNumber: h.houseNumber, rashiId: h.rashiId, planets: h.planets }))}
                maxSize={180}
              />
            </div>
          </div>

          {/* Box 7: Classical Muhurta Shloka */}
          <div className="border border-red-800/80 rounded-lg p-1.5 bg-amber-50/60 text-center text-[9.5px] italic text-stone-800 font-serif">
            गुणा लक्षं प्रहन्त्येको लग्नदोषो व्यवस्थितः । तस्मात् सर्वप्रयत्नेन लग्नदोषं विवर्जयेत् ॥<br />
            तदेव लग्नं सुदिनं तदेव ताराबलं चन्द्रबलं तदेव । विद्याबलं दैवबलं तदेव लक्ष्मीपते तेऽङ्घ्रियुगं स्मरामि ॥
          </div>

          <AstrologerSignatureBlock astrologer={astrologer} orgProfile={orgProfile} />
        </GreenOmBorderFrame>
      </div>
    );
  }

  // =========================================================================
  // 9. DASHA (दशा विवरण) -> Exactly 1 Page
  // =========================================================================
  if (subCategory === 'dasha') {
    return (
      <div ref={containerRef} id="printable-patrika-wrapper" className="w-full flex justify-center">
        <GreenOmBorderFrame className="space-y-1.5">
          <GaneshaHeaderCenter
            orgName={orgProfile.name}
            orgPhone={toDevanagariNumerals(orgProfile.phone || '+९७७-९७६४४००५३३')}
            title="॥ विंशोत्तरी, त्रिभागी तथा योगिनी महादशा प्रतिवेदन ॥"
            subtitle={`जन्मकालीन दशा भोग्य शेष: ${birthDashaPlanet} महादशा`}
            primaryShloka="ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥"
            secondaryShloka="दशाफलानि जानीयात् ग्रहभावबलैः सह। शुभाशुभविपाकेन शुभानां वृद्धिरुत्तमा॥"
          />

          {/* Box 1: जातक तथा दशा विवरण */}
          <div className="border border-red-800 p-2 rounded-lg bg-amber-50/70 text-[10px]">
            <div className="flex items-center justify-between border-b border-red-800/50 pb-0.5 mb-1">
              <span className="font-bold text-red-900 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-red-700" />
                ॥ जातक विवरण तथा जन्मकालीन दशा भोग्य शेष ॥
              </span>
              <span className="text-[9px] text-amber-900 font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-amber-300">
                क्रमाङ्क: {safeProfile.jatakSerialNo || safeProfile.customerId || 'दशा-००१'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="border-r border-amber-800/30 pr-2 space-y-0.5">
                <p><strong>जातकको नाम:</strong> <span className="text-red-900 font-bold">{safeProfile.name}</span></p>
                <p><strong>जन्म मिति / समय:</strong> {toDevanagariNumerals(safeProfile.dateBS)} | {toDevanagariNumerals(safeProfile.time)}</p>
                <p><strong>जन्म लग्न / राशि:</strong> {safeLagna?.rashiName} / {panchanga?.moonRashi} ({panchanga?.nakshatra?.name})</p>
              </div>
              <div className="space-y-0.5">
                <p><strong>जन्मकालीन महादशा स्वामी:</strong> <span className="text-red-900 font-bold">{birthDashaPlanet}</span></p>
                <p><strong>दशा भोग्य शेष:</strong> <strong className="text-amber-950">{toDevanagariNumerals(balanceYears)}</strong> वर्ष, <strong className="text-amber-950">{toDevanagariNumerals(balanceMonths)}</strong> महिना, <strong className="text-amber-950">{toDevanagariNumerals(balanceDays)}</strong> दिन</p>
                <p><strong>वर्तमान दशा प्रभाव:</strong> वय अनुसार जीवनमा दशा परिवर्तनको फल विचारणीय</p>
              </div>
            </div>
          </div>

          {/* Box 2: विंशोत्तरी महादशा सम्पूर्ण १२० वर्ष तालिका */}
          <div className="border border-amber-900 p-1.5 rounded-lg bg-white text-[9.5px] space-y-0.5">
            <div className="flex justify-between items-center border-b border-amber-800 pb-0.5">
              <span className="font-bold text-amber-950 text-[10px]">॥ विंशोत्तरी महादशा सम्पूर्ण १२० वर्ष चक्र तालिका ॥</span>
              <span className="text-[8.5px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded border border-amber-300">शास्त्रसम्मत क्रम</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-center border border-amber-900 border-collapse text-[9px]">
                <thead>
                  <tr className="bg-amber-200 text-amber-950 font-bold border-b border-amber-900">
                    <th className="p-1 border-r border-amber-900">सूर्य (६)</th>
                    <th className="p-1 border-r border-amber-900">चन्द्र (१०)</th>
                    <th className="p-1 border-r border-amber-900">मङ्गल (७)</th>
                    <th className="p-1 border-r border-amber-900">राहु (१८)</th>
                    <th className="p-1 border-r border-amber-900">गुरु (१६)</th>
                    <th className="p-1 border-r border-amber-900">शनि (१९)</th>
                    <th className="p-1 border-r border-amber-900">बुध (१७)</th>
                    <th className="p-1 border-r border-amber-900">केतु (७)</th>
                    <th className="p-1">शुक्र (२०)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-amber-900/60 font-semibold text-stone-800">
                    <td className="p-1 border-r border-amber-900">१-७-५</td>
                    <td className="p-1 border-r border-amber-900">११-७-७</td>
                    <td className="p-1 border-r border-amber-900">१८-७-९</td>
                    <td className="p-1 border-r border-amber-900">३६-७-१३</td>
                    <td className="p-1 border-r border-amber-900">५२-७-१७</td>
                    <td className="p-1 border-r border-amber-900">७१-७-२२</td>
                    <td className="p-1 border-r border-amber-900">८८-७-२६</td>
                    <td className="p-1 border-r border-amber-900">९५-७-२७</td>
                    <td className="p-1">११५-८-२</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Box 3: त्रिभागी एवं योगिनी महादशा तालिका */}
          <div className="grid grid-cols-2 gap-2 text-[9px]">
            <div className="border border-amber-900 p-1 rounded-lg bg-amber-50/50 space-y-0.5">
              <div className="flex justify-between items-center border-b border-amber-300 pb-0.5">
                <span className="font-bold text-amber-950 text-[9.5px]">॥ त्रिभागी महादशा (८० वर्षे चक्र) ॥</span>
                <span className="text-[7.5px] bg-amber-200 text-amber-950 px-1 rounded font-bold">नेपाली परम्परा</span>
              </div>
              <div className="grid grid-cols-3 gap-0.5 text-center text-[8px] pt-0.5">
                <span className="bg-white p-0.5 rounded border border-amber-200">सूर्य: ४ वर्ष</span>
                <span className="bg-white p-0.5 rounded border border-amber-200">चन्द्र: ६ वर्ष ८ महिना</span>
                <span className="bg-white p-0.5 rounded border border-amber-200">भौम: ४ वर्ष ८ महिना</span>
                <span className="bg-white p-0.5 rounded border border-amber-200">राहु: १२ वर्ष</span>
                <span className="bg-white p-0.5 rounded border border-amber-200">गुरु: १० वर्ष ८ महिना</span>
                <span className="bg-white p-0.5 rounded border border-amber-200">शनि: १२ वर्ष ८ महिना</span>
                <span className="bg-white p-0.5 rounded border border-amber-200">बुध: ११ वर्ष ४ महिना</span>
                <span className="bg-white p-0.5 rounded border border-amber-200">केतु: ४ वर्ष ८ महिना</span>
                <span className="bg-white p-0.5 rounded border border-amber-200">शुक्र: १३ वर्ष ४ महिना</span>
              </div>
            </div>

            <div className="border border-red-800 p-1 rounded-lg bg-red-50/40 space-y-0.5">
              <div className="flex justify-between items-center border-b border-red-300 pb-0.5">
                <span className="font-bold text-red-950 text-[9.5px]">॥ अष्ट योगिनी महादशा (३६ वर्षे चक्र) ॥</span>
                <span className="text-[7.5px] bg-red-200 text-red-950 px-1 rounded font-bold">पारम्परिक फल</span>
              </div>
              <div className="grid grid-cols-4 gap-0.5 text-center text-[8px] pt-0.5">
                <span className="bg-white p-0.5 rounded border border-red-200">मङ्गला (१) चन्द्र</span>
                <span className="bg-white p-0.5 rounded border border-red-200">पिङ्गला (२) सूर्य</span>
                <span className="bg-white p-0.5 rounded border border-red-200">धन्या (३) गुरु</span>
                <span className="bg-white p-0.5 rounded border border-red-200">भ्रामरी (४) भौम</span>
                <span className="bg-white p-0.5 rounded border border-red-200">भद्रिका (५) बुध</span>
                <span className="bg-white p-0.5 rounded border border-red-200">उल्का (६) शनि</span>
                <span className="bg-white p-0.5 rounded border border-red-200">सिद्धा (७) शुक्र</span>
                <span className="bg-white p-0.5 rounded border border-red-200">सङ्कटा (८) राहु</span>
              </div>
            </div>
          </div>

          {/* Box 4: दशा सन्धि सावधानी तथा शान्ति विधान */}
          <div className="border border-amber-900 rounded-lg p-1.5 bg-[#FFFDF9] text-[9.5px] space-y-0.5">
            <div className="flex justify-between items-center border-b border-amber-700/50 pb-0.5">
              <span className="font-bold text-red-900 text-[10px]">॥ महादशा प्रभाव, दशा सन्धि विचार एवं शान्ति उपाय ॥</span>
              <span className="text-[8.5px] bg-green-100 text-green-950 font-bold px-1.5 py-0.2 rounded border border-green-300">दशा शान्ति कवच</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[9px]">
              <div className="bg-amber-50/80 p-1 rounded border border-amber-200 space-y-0.5">
                <p><strong>दशा सन्धि सतर्कता:</strong> दुई महादशाको सन्धिकाल (विशेषतः राहु-गुरु, गुरु-शनि, बुध-केतु) मा स्वास्थ्य, आर्थिक र पारिवारिक निर्णयमा विशेष धैर्य राख्नुपर्दछ।</p>
                <p><strong>दशा कारकत्व:</strong> महादशा स्वामी केन्द्र/त्रिकोणमा भए शुभ फल तथा ६, ८, १२ मा भए अनिष्ट निवारण आवश्यक हुन्छ।</p>
              </div>
              <div className="bg-emerald-50/80 p-1 rounded border border-emerald-200 space-y-0.5">
                <p><strong>शास्त्रोक्त शान्ति उपाय:</strong> महामृत्युञ्जय जप, नवग्रह स्तोत्र पाठ, दशा स्वामी ग्रह अनुसारको दान, पीपल पूजा एवं इष्टदेव आराधनाले दशा दोष शान्त भई शुभ फल प्राप्त हुन्छ।</p>
              </div>
            </div>
          </div>

          {/* Box 5: Planetary Table + Kundali */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-[9px] items-center">
            <div className="md:col-span-7">
              <CompactPlanetaryTable lagna={safeLagna} planets={safePlanets} />
            </div>
            <div className="md:col-span-5 flex justify-center">
              <PrintableDiamondChart
                title="लग्न कुण्डली (D1)"
                houses={d1Chart.houses.map((h) => ({ houseNumber: h.houseNumber, rashiId: h.rashiId, planets: h.planets }))}
                maxSize={180}
              />
            </div>
          </div>

          {/* Box 6: Classical Dasha & Mahamrityunjaya Shloka */}
          <div className="border border-red-800/80 rounded-lg p-1.5 bg-amber-50/60 text-center text-[9.5px] italic text-stone-800 font-serif">
            दशासु सर्वग्रहाणां स्वदशाफलदायिनः । केन्द्रत्रिकोणगाः सौम्याः कुर्वन्ति विपुलां श्रियम् ॥<br />
            ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात् ॥
          </div>

          <AstrologerSignatureBlock astrologer={astrologer} orgProfile={orgProfile} />
        </GreenOmBorderFrame>
      </div>
    );
  }

  // =========================================================================
  // 10. GRAHA (ग्रह विवरण) -> Exactly 1 Page
  // =========================================================================
  if (subCategory === 'graha') {
    return (
      <div ref={containerRef} id="printable-patrika-wrapper" className="w-full flex justify-center">
        <GreenOmBorderFrame className="space-y-1.5">
          <GaneshaHeaderCenter
            orgName={orgProfile.name}
            orgPhone={toDevanagariNumerals(orgProfile.phone || '+९७७-९७६४४००५३३')}
            title="॥ स्पष्ट ग्रह स्थिति तथा षड्बल विश्लेषण तालिका ॥"
            subtitle={`सङ्कल्प तथा पञ्चाङ्ग: शुभ सम्बत् ${toDevanagariNumerals(panchanga.dateBS)} | ${panchanga.samvatsara} संवत्सर`}
            primaryShloka="ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥"
            secondaryShloka="ग्रहाधीना नराः सर्वे ग्रहाधीनं जगत्त्रयम्। ग्रहाणां पूजनेनैव सर्वसिद्धिर्भवेन्नृणाम्॥"
          />

          {/* Box 1: जातक तथा कुण्डली परिचय */}
          <div className="border border-red-800 p-2 rounded-lg bg-amber-50/70 text-[10px]">
            <div className="flex items-center justify-between border-b border-red-800/50 pb-0.5 mb-1">
              <span className="font-bold text-red-900 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-red-700" />
                ॥ जातक परिचय तथा लग्न-चन्द्र स्थिति ॥
              </span>
              <span className="text-[9px] text-amber-900 font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-amber-300">
                क्रमाङ्क: {safeProfile.jatakSerialNo || safeProfile.customerId || 'ग्रह-००१'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[9.5px]">
              <div>
                <p><strong>जातक:</strong> <span className="text-red-900 font-bold">{safeProfile.name}</span></p>
                <p><strong>जन्म मिति:</strong> {toDevanagariNumerals(safeProfile.dateBS)}</p>
              </div>
              <div>
                <p><strong>जन्म लग्न:</strong> <span className="text-blue-900 font-bold">{safeLagna?.rashiName}</span> ({safeLagna.formattedDegree})</p>
                <p><strong>चन्द्र राशि:</strong> <span className="text-red-900 font-bold">{panchanga?.moonRashi}</span> ({panchanga?.nakshatra?.name})</p>
              </div>
              <div>
                <p><strong>जन्म समय:</strong> {toDevanagariNumerals(safeProfile.time)}</p>
                <p><strong>स्थान:</strong> {safeProfile.location?.name || 'नेपाल'}</p>
              </div>
            </div>
          </div>

          {/* Box 2: Detailed Planetary Positions Table */}
          <div className="border border-amber-900 p-1.5 rounded-lg bg-white">
            <h3 className="font-bold text-amber-950 border-b border-amber-800 pb-0.5 text-[10px] text-center">
              ॥ नवग्रह स्पष्ट अंश, कला, नक्षत्र, पाद, भाव तथा अवस्था तालिका ॥
            </h3>
            <div className="mt-1">
              <CompactPlanetaryTable lagna={safeLagna} planets={safePlanets} />
            </div>
          </div>

          {/* Box 3: नवग्रह नैसर्गिक मैत्री एवं गरिमा चक्र */}
          <div className="border border-amber-900 rounded-lg p-1.5 bg-[#FFFDF9] text-[9px] space-y-0.5">
            <div className="flex justify-between items-center border-b border-amber-700/50 pb-0.5">
              <span className="font-bold text-red-900 text-[9.5px]">॥ नवग्रह उच्च-नीच-मूलत्रिकोण एवं नैसर्गिक मैत्री सम्बन्ध ॥</span>
              <span className="text-[8px] bg-amber-100 text-amber-950 px-1 py-0.2 rounded border border-amber-300 font-bold">पारम्परिक ज्योतिष सिद्धान्त</span>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-0.5">
              <div className="bg-amber-50 p-1 rounded border border-amber-200 space-y-0.5">
                <strong className="text-red-900 block font-bold text-[9px]">सूर्य, चन्द्र, भौम (देवगण):</strong>
                <p>परस्पर मित्र | सम: बुध | शत्रु: शुक्र, शनि, राहु, केतु। सूर्य मेषमा उच्च (१०°), तुलामा नीच (१०°)। चन्द्र वृषमा उच्च (३°), वृश्चिकमा नीच।</p>
              </div>
              <div className="bg-amber-50 p-1 rounded border border-amber-200 space-y-0.5">
                <strong className="text-blue-900 block font-bold text-[9px]">बुध, शुक्र, शनि (दानवगण):</strong>
                <p>परस्पर मित्र | सम: भौम, गुरु | शत्रु: सूर्य, चन्द्र। गुरु कर्कमा उच्च (५°), मकरमा नीच। बुध कन्यामा उच्च (१५°), मीनमा नीच।</p>
              </div>
              <div className="bg-amber-50 p-1 rounded border border-amber-200 space-y-0.5">
                <strong className="text-green-900 block font-bold text-[9px]">षड्बल तथा शुभ दृष्टि फल:</strong>
                <p>स्थानबल, दिग्बल, कालबल, चेष्टाबल, दृग्बलको सामर्थ्यले ग्रहलाई फलदायी बनाउँछ। केन्द्र र त्रिकोणमा स्थित शुभग्रहले बल प्रदान गर्दछन्।</p>
              </div>
            </div>
          </div>

          {/* Box 4: नवग्रह कारकत्व चक्र */}
          <div className="border border-green-800 rounded-lg p-1.5 bg-green-50/40 text-[9px] space-y-0.5">
            <div className="flex justify-between items-center border-b border-green-300 pb-0.5">
              <span className="font-bold text-green-950 text-[9.5px]">॥ नवग्रह मुख्य कारकत्व एवं जीवन प्रभाव चक्र ॥</span>
              <span className="text-[8px] bg-green-200 text-green-950 font-bold px-1 py-0.2 rounded border border-green-400">कारकत्व विचार</span>
            </div>
            <div className="grid grid-cols-4 gap-1 pt-0.5 text-center">
              <div className="bg-white p-1 rounded border border-green-200">
                <strong className="text-red-900 block font-bold">सूर्य - चन्द्र</strong>
                <span className="text-stone-600">आत्मा, पिता, आरोग्य, मन, शान्ति, माता</span>
              </div>
              <div className="bg-white p-1 rounded border border-green-200">
                <strong className="text-blue-900 block font-bold">मङ्गल - बुध</strong>
                <span className="text-stone-600">साहस, पराक्रम, भूमि, बुद्धि, वाणिज्य, वाणी</span>
              </div>
              <div className="bg-white p-1 rounded border border-green-200">
                <strong className="text-amber-900 block font-bold">गुरु - शुक्र</strong>
                <span className="text-stone-600">ज्ञान, धर्म, सन्तान, सौन्दर्य, दाम्पत्य, वैभव</span>
              </div>
              <div className="bg-white p-1 rounded border border-green-200">
                <strong className="text-purple-900 block font-bold">शनि - राहु - केतु</strong>
                <span className="text-stone-600">कर्म, आयु, न्याय, आकस्मिकता, शोध, मोक्ष</span>
              </div>
            </div>
          </div>

          {/* Box 5: Charts D1 and D9 */}
          <div className="grid grid-cols-2 gap-2 justify-center items-center">
            <PrintableDiamondChart
              title="लग्न कुण्डली (D1 - राश्याधारित)"
              houses={d1Chart.houses.map((h) => ({ houseNumber: h.houseNumber, rashiId: h.rashiId, planets: h.planets }))}
              maxSize={180}
            />
            <PrintableDiamondChart
              title="नवांश कुण्डली (D9 - सूक्ष्माधारित)"
              houses={d9Chart.houses.map((h) => ({ houseNumber: h.houseNumber, rashiId: h.rashiId, planets: h.planets }))}
              maxSize={180}
            />
          </div>

          {/* Box 6: नवग्रह मङ्गल स्तोत्र */}
          <div className="border border-red-800/80 rounded-lg p-1.5 bg-amber-50/60 text-center text-[9.5px] italic text-stone-800 font-serif">
            ब्रह्मा मुरारिस्त्रिपुरान्तकारी भानुः शशी भूमिसुतो बुधश्च । गुरुश्च शुक्रः शनिराहुकेतवः कुर्वन्तु सर्वे मम सुप्रभातम् ॥<br />
            ग्रहाधीना नराः सर्वे ग्रहाधीनं जगत्त्रयम् । ग्रहाणां पूजनेनैव सर्वसिद्धिर्भवेन्नृणाम् ॥
          </div>

          <AstrologerSignatureBlock astrologer={astrologer} orgProfile={orgProfile} />
        </GreenOmBorderFrame>
      </div>
    );
  }

  // =========================================================================
  // 11. VARGA (वर्ग कुण्डली) -> Exactly 1 Page
  // =========================================================================
  if (subCategory === 'varga') {
    return (
      <div ref={containerRef} id="printable-patrika-wrapper" className="w-full flex justify-center">
        <GreenOmBorderFrame className="space-y-1.5">
          <GaneshaHeaderCenter
            orgName={orgProfile.name}
            orgPhone={toDevanagariNumerals(orgProfile.phone || '+९७७-९७६४४००५३३')}
            title="॥ मुख्य षोडशवर्ग कुण्डली चक्रम् ॥"
            subtitle={`जातक: ${safeProfile.name} | वि.सं. ${toDevanagariNumerals(safeProfile.dateBS)} | लग्न: ${safeLagna?.rashiName}`}
            primaryShloka="ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥"
            secondaryShloka="क्षेत्रं होरा तथा द्रेक्काणस्तथा चैव नवांशकः। द्वादशांशस्त्रिशांशश्च वर्गाः षड् गणितास्तथा॥"
          />

          {/* Box 1: जातक परिचय */}
          <div className="border border-red-800 p-2 rounded-lg bg-amber-50/70 text-[10px]">
            <div className="flex items-center justify-between border-b border-red-800/50 pb-0.5 mb-1">
              <span className="font-bold text-red-900 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-red-700" />
                ॥ जातक परिचय तथा षोडशवर्ग विश्लेषण आधार ॥
              </span>
              <span className="text-[9px] text-amber-900 font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-amber-300">
                क्रमाङ्क: {safeProfile.jatakSerialNo || safeProfile.customerId || 'वर्ग-००१'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[9.5px]">
              <div>
                <p><strong>जातकको नाम:</strong> <span className="text-red-900 font-bold">{safeProfile.name}</span></p>
                <p><strong>जन्म मिति:</strong> {toDevanagariNumerals(safeProfile.dateBS)}</p>
              </div>
              <div>
                <p><strong>जन्म लग्न:</strong> <span className="text-blue-900 font-bold">{safeLagna?.rashiName}</span> ({safeLagna.formattedDegree})</p>
                <p><strong>चन्द्र राशि:</strong> <span className="text-red-900 font-bold">{panchanga?.moonRashi}</span> ({panchanga?.nakshatra?.name})</p>
              </div>
              <div>
                <p><strong>जन्म समय:</strong> {toDevanagariNumerals(safeProfile.time)}</p>
                <p><strong>स्थान:</strong> {safeProfile.location?.name || 'नेपाल'}</p>
              </div>
            </div>
          </div>

          {/* 4 Main Varga Diamond Charts (2x2 grid) */}
          <div className="grid grid-cols-2 gap-2 justify-center items-center">
            <PrintableDiamondChart
              title="१. लग्न कुण्डली (D1 - शरीर/आरोग्य)"
              houses={d1Chart.houses.map((h) => ({ houseNumber: h.houseNumber, rashiId: h.rashiId, planets: h.planets }))}
              maxSize={165}
            />
            <PrintableDiamondChart
              title="२. नवांश कुण्डली (D9 - भाग्य/दाम्पत्य)"
              houses={d9Chart.houses.map((h) => ({ houseNumber: h.houseNumber, rashiId: h.rashiId, planets: h.planets }))}
              maxSize={165}
            />
            <PrintableDiamondChart
              title="३. दशमांश कुण्डली (D10 - कर्म/प्रतिष्ठा)"
              houses={d10Chart.houses.map((h) => ({ houseNumber: h.houseNumber, rashiId: h.rashiId, planets: h.planets }))}
              maxSize={165}
            />
            <PrintableDiamondChart
              title="४. द्वादशांश कुण्डली (D12 - मातापिता/वंश)"
              houses={d12Chart.houses.map((h) => ({ houseNumber: h.houseNumber, rashiId: h.rashiId, planets: h.planets }))}
              maxSize={165}
            />
          </div>

          {/* Varga Significances & Classical Guidance */}
          <div className="border border-amber-900 rounded-lg p-1.5 bg-[#FFFDF9] text-[9px] space-y-0.5">
            <div className="flex justify-between items-center border-b border-amber-700/50 pb-0.5">
              <span className="font-bold text-red-900 text-[9.5px]">॥ वर्ग कुण्डली विशेष सूक्ष्म फलादेश सिद्धान्त ॥</span>
              <span className="text-[8px] bg-amber-100 text-amber-950 px-1 py-0.2 rounded border border-amber-300 font-bold">महर्षि पराशर सूत्र</span>
            </div>
            <div className="grid grid-cols-4 gap-1 pt-0.5 text-center">
              <div className="bg-amber-50 p-1 rounded border border-amber-200">
                <strong className="text-red-900 block font-bold text-[9px]">D1 (लग्न वर्ग)</strong>
                <span className="text-stone-700">स्थूल शरीर, आयु, वर्ण, स्वभाव एवं जीवन मार्ग</span>
              </div>
              <div className="bg-amber-50 p-1 rounded border border-amber-200">
                <strong className="text-blue-900 block font-bold text-[9px]">D9 (नवांश वर्ग)</strong>
                <span className="text-stone-700">भाग्यबल, धर्म निष्ठा, वैवाहिक सुख एवं जीवनसाथी</span>
              </div>
              <div className="bg-amber-50 p-1 rounded border border-amber-200">
                <strong className="text-green-900 block font-bold text-[9px]">D10 (दशमांश वर्ग)</strong>
                <span className="text-stone-700">कर्मक्षेत्र, पेशा, पद-प्रतिष्ठा एवं राज्यसम्मान</span>
              </div>
              <div className="bg-amber-50 p-1 rounded border border-amber-200">
                <strong className="text-purple-900 block font-bold text-[9px]">D12 (द्वादशांश वर्ग)</strong>
                <span className="text-stone-700">मातापिताको सुख, पूर्वज संस्कार एवं वंशावली</span>
              </div>
            </div>
            <p className="text-center text-stone-700 text-[8.5px] pt-0.5 bg-amber-50/60 p-0.5 rounded">
              <strong>अन्य प्रमुख वर्गहरू:</strong> D2 (होरा - धनसम्पत्ति), D3 (द्रेक्काण - दाजुभाइ/पराक्रम), D4 (चतुर्थांश - भाग्य/गृह), D7 (सप्तांश - सन्तान सुख), D16 (षोडशांश - वाहन सुख), D20 (विंशांश - साधना), D24 (सिद्धिरंश - विद्या), D30 (त्रिंशांश - अरिष्ट निवारण)।
            </p>
          </div>

          <div className="mt-0.5">
            <CompactPlanetaryTable lagna={safeLagna} planets={safePlanets} />
          </div>

          {/* Classical Shloka on Varga */}
          <div className="border border-red-800/80 rounded-lg p-1.5 bg-amber-50/60 text-center text-[9.5px] italic text-stone-800 font-serif">
            यत्र कुत्रापि संप्राप्तः स्ववर्गस्थो ग्रहोत्तमः । कुरुते भूपतिं वाऽपि तत्समं वा न संशयः ॥<br />
            षोडशवर्गेषु ये ग्रहाः स्वोच्चस्वमित्रगाः । ते कुर्वन्ति नृणां नित्यं राज्यसौख्यं धनागमम् ॥
          </div>

          <AstrologerSignatureBlock astrologer={astrologer} orgProfile={orgProfile} />
        </GreenOmBorderFrame>
      </div>
    );
  }

  // =========================================================================
  // 12. BHAVACHALIT (भावचलित) -> Exactly 1 Page
  // =========================================================================
  if (subCategory === 'bhavachalit') {
    return (
      <div ref={containerRef} id="printable-patrika-wrapper" className="w-full flex justify-center">
        <GreenOmBorderFrame className="space-y-1.5">
          <GaneshaHeaderCenter
            orgName={orgProfile.name}
            orgPhone={toDevanagariNumerals(orgProfile.phone || '+९७७-९७६४४००५३३')}
            title="॥ भाव स्पष्ट तथा भावचलित चक्रम् ॥"
            subtitle={`जातक: ${safeProfile.name} | लग्न: ${safeLagna?.rashiName} | चन्द्र राशि: ${panchanga?.moonRashi}`}
            primaryShloka="ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥"
            secondaryShloka="भावाद् भावफलं ज्ञेयं ग्रहाणां बलसंयुतम्। सन्धिमध्यसमायोगे सूक्ष्मदृष्ट्या विचारयेत्॥"
          />

          {/* Box 1: जातक तथा कुण्डली परिचय */}
          <div className="border border-red-800 p-2 rounded-lg bg-amber-50/70 text-[10px]">
            <div className="flex items-center justify-between border-b border-red-800/50 pb-0.5 mb-1">
              <span className="font-bold text-red-900 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-red-700" />
                ॥ जातक परिचय तथा भावचलित सूक्ष्म आधार ॥
              </span>
              <span className="text-[9px] text-amber-900 font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-amber-300">
                क्रमाङ्क: {safeProfile.jatakSerialNo || safeProfile.customerId || 'भाव-००१'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[9.5px]">
              <div>
                <p><strong>जातकको नाम:</strong> <span className="text-red-900 font-bold">{safeProfile.name}</span></p>
                <p><strong>जन्म मिति:</strong> {toDevanagariNumerals(safeProfile.dateBS)} ({safeProfile.dateAD})</p>
              </div>
              <div>
                <p><strong>लग्न स्पष्ट:</strong> <span className="text-blue-900 font-bold">{safeLagna?.rashiName}</span> ({safeLagna.formattedDegree})</p>
                <p><strong>चन्द्र स्पष्ट:</strong> <span className="text-red-900 font-bold">{panchanga?.moonRashi}</span> ({panchanga?.nakshatra?.name})</p>
              </div>
              <div>
                <p><strong>जन्म समय:</strong> {toDevanagariNumerals(safeProfile.time)}</p>
                <p><strong>स्थान:</strong> {safeProfile.location?.name || 'नेपाल'}</p>
              </div>
            </div>
          </div>

          {/* Two Charts: D1 and Bhava Chalit */}
          <div className="grid grid-cols-2 gap-2 justify-center items-center">
            <PrintableDiamondChart
              title="लग्न कुण्डली (D1 - राश्याधारित)"
              houses={d1Chart.houses.map((h) => ({ houseNumber: h.houseNumber, rashiId: h.rashiId, planets: h.planets }))}
              maxSize={180}
            />
            <PrintableDiamondChart
              title="भावचलित कुण्डली (Bhava Chalit - भावाधारित)"
              houses={bhavaHouses}
              maxSize={180}
            />
          </div>

          {/* Box 3: १२ भाव कारकत्व एवं आरम्भ-मध्य-सन्धि सिद्धान्त */}
          <div className="border border-amber-900 rounded-lg p-1.5 bg-[#FFFDF9] text-[9px] space-y-0.5">
            <div className="flex justify-between items-center border-b border-amber-700/50 pb-0.5">
              <span className="font-bold text-red-900 text-[9.5px]">॥ द्वादश भाव कारकत्व एवं भाव मध्य/सन्धि सिद्धान्त ॥</span>
              <span className="text-[8px] bg-amber-100 text-amber-950 px-1 py-0.2 rounded border border-amber-300 font-bold">श्रीपति / पराशर पद्धति</span>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-0.5">
              <div className="bg-amber-50 p-1 rounded border border-amber-200">
                <strong className="text-red-900 block font-bold text-[9px]">केन्द्र भाव (१, ४, ७, १०):</strong>
                <p>१ तनु (आरोग्य), ४ सुख (भूमि/माता), ७ जाया (दाम्पत्य), १० कर्म (पेशा/प्रतिष्ठा)। केन्द्रमा रहेका ग्रह अत्यन्त बलवान् मानिन्छन्।</p>
              </div>
              <div className="bg-amber-50 p-1 rounded border border-amber-200">
                <strong className="text-blue-900 block font-bold text-[9px]">त्रिकोण भाव (१, ५, ९):</strong>
                <p>५ सुत (विद्या/सन्तान/बुद्धि), ९ भाग्य (धर्म/पिता/तीर्थ)। त्रिकोण भाव धर्म तथा पूर्वपुण्यका सूचक हुन्।</p>
              </div>
              <div className="bg-amber-50 p-1 rounded border border-amber-200">
                <strong className="text-green-900 block font-bold text-[9px]">त्रिक एवं उपचय भाव:</strong>
                <p>६ (रोग/ऋण), ८ (आयु/संकट), १२ (व्यय/मोक्ष)। ३, ६, १०, ११ उपचय भाव हुन् जहाँ पापी ग्रह पनि पराक्रम र लाभदायी हुन्छन्।</p>
              </div>
            </div>
            <p className="text-stone-800 text-[8.5px] bg-amber-50/60 p-0.5 rounded leading-tight">
              <strong>भाव परिवर्तन फल:</strong> राशि कुण्डलीमा कुनै भावमा देखिएको ग्रह भावचलितमा अघिल्लो वा पछिल्लो भावमा सर्न सक्छ। भाव मध्यको निकट रहेका ग्रहले शतप्रतिशत फल प्रदान गर्छन् भने सन्धिमा रहेका ग्रहको प्रभाव क्षीण हुन्छ।
            </p>
          </div>

          <div className="mt-0.5">
            <CompactPlanetaryTable lagna={safeLagna} planets={safePlanets} />
          </div>

          {/* Classical Shloka on Bhava */}
          <div className="border border-red-800/80 rounded-lg p-1.5 bg-amber-50/60 text-center text-[9.5px] italic text-stone-800 font-serif">
            भावाद् भावफलं ज्ञेयं ग्रहाणां बलसंयुतम् । सन्धिमध्यसमायोगे सूक्ष्मदृष्ट्या विचारयेत् ॥<br />
            भावस्य यत्फलं प्रोक्तं तद्भावेशेन चिन्तयेत् । भावेशे बलवत्येव भाववृद्धिः प्रजायते ॥
          </div>

          <AstrologerSignatureBlock astrologer={astrologer} orgProfile={orgProfile} />
        </GreenOmBorderFrame>
      </div>
    );
  }

  // =========================================================================
  // 13. GOCHAR (गोचर) -> Exactly 1 Page
  // =========================================================================
  if (subCategory === 'gochar') {
    return (
      <div ref={containerRef} id="printable-patrika-wrapper" className="w-full flex justify-center">
        <GreenOmBorderFrame className="space-y-1.5">
          <GaneshaHeaderCenter
            orgName={orgProfile.name}
            orgPhone={toDevanagariNumerals(orgProfile.phone || '+९७७-९७६४४००५३३')}
            title="॥ नवग्रह गोचर तथा शनि साढेसाती प्रभाव पत्रम् ॥"
            subtitle={`जन्म राशि: ${panchanga?.moonRashi || 'मेष'} (${panchanga?.nakshatra?.name}) | वर्तमान गोचर प्रभाव`}
            primaryShloka="ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥"
            secondaryShloka="गोचरे वा विलग्ने वा यत्र कुर्वन्ति सङ्गमम्। तत्तद्भावफलं ब्रूयात् शुभाशुभविपाकतः॥"
          />

          {/* Box 1: जातक तथा गोचर परिचय */}
          <div className="border border-red-800 p-2 rounded-lg bg-amber-50/70 text-[10px]">
            <div className="flex items-center justify-between border-b border-red-800/50 pb-0.5 mb-1">
              <span className="font-bold text-red-900 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-red-700" />
                ॥ जातक परिचय तथा वर्तमान गोचर स्थिति ॥
              </span>
              <span className="text-[9px] text-amber-900 font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-amber-300">
                क्रमाङ्क: {safeProfile.jatakSerialNo || safeProfile.customerId || 'गोचर-००१'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[9.5px]">
              <div className="border-r border-amber-800/30 pr-2 space-y-0.5">
                <p><strong>जातकको नाम:</strong> <span className="text-red-900 font-bold">{safeProfile.name}</span></p>
                <p><strong>जन्म राशि:</strong> <span className="font-bold text-blue-900">{panchanga?.moonRashi}</span> | <strong>लग्न:</strong> {safeLagna?.rashiName}</p>
              </div>
              <div className="space-y-0.5">
                <p><strong>शनि साढेसाती:</strong> <span className="font-bold text-red-900">{gochar.sadeSati.status}</span> ({(gochar.sadeSati as any).phaseNameNepali || gochar.sadeSati.phaseName || gochar.sadeSati.status})</p>
                <p><strong>वर्तमान गोचर सारांश:</strong> {((gochar.sadeSati as any).impactDescriptionNepali || gochar.sadeSati.descriptionNepali || '').slice(0, 95)}...</p>
              </div>
            </div>
          </div>

          {/* Box 2: नवग्रह गोचर शुभ/अशुभ स्थान तालिका */}
          <div className="border border-amber-900 rounded-lg p-1.5 bg-[#FFFDF9] text-[9px] space-y-0.5">
            <div className="flex justify-between items-center border-b border-amber-700/50 pb-0.5">
              <span className="font-bold text-red-900 text-[9.5px]">॥ नवग्रह गोचर शास्त्रोक्त शुभ/अशुभ फलदायी भाव चक्र (चन्द्र राशिबाट) ॥</span>
              <span className="text-[8px] bg-green-100 text-green-950 px-1 py-0.2 rounded border border-green-300 font-bold">गोचर सिद्धान्त</span>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-0.5">
              <div className="bg-amber-50 p-1 rounded border border-amber-200 space-y-0.5">
                <strong className="text-red-900 block font-bold text-[9px]">सूर्य, चन्द्र तथा भौम:</strong>
                <p>सूर्य: भाव ३, ६, १०, ११ मा शुभ। चन्द्र: १, ३, ६, ७, १०, ११ मा शुभ। मङ्गल: ३, ६, ११ मा शुभ, अन्यत्र मध्यम।</p>
              </div>
              <div className="bg-amber-50 p-1 rounded border border-amber-200 space-y-0.5">
                <strong className="text-blue-900 block font-bold text-[9px]">बुध, गुरु तथा शुक्र:</strong>
                <p>बुध: २, ४, ६, ८, १०, ११ शुभ। गुरु: २, ५, ७, ९, ११ अति शुभ (भाग्योदय)। शुक्र: १ देखि ६, ८, ९, ११, १२ शुभ।</p>
              </div>
              <div className="bg-amber-50 p-1 rounded border border-amber-200 space-y-0.5">
                <strong className="text-purple-900 block font-bold text-[9px]">शनि, राहु तथा केतु:</strong>
                <p>शनि: ३, ६, ११ शुभ; १, २, १२ साढेसाती; ४, ८ ढैया। राहु-केतु: ३, ६, ११ शुभ, अन्यत्र शान्ति फलदायी।</p>
              </div>
            </div>
          </div>

          {/* Box 3: शनि साढेसाती त्रिचरण प्रभाव तालिका */}
          <div className="border border-red-900 rounded-lg p-1.5 bg-red-50/40 text-[9px] space-y-0.5">
            <div className="flex justify-between items-center border-b border-red-300 pb-0.5">
              <span className="font-bold text-red-950 text-[9.5px]">॥ शनि साढेसाती तथा ढैया (कण्टक शनि) त्रिचरण प्रभाव तालिका ॥</span>
              <span className="text-[8px] bg-red-200 text-red-950 font-bold px-1 py-0.2 rounded border border-red-300">शनि विचार</span>
            </div>
            <div className="grid grid-cols-3 gap-1 pt-0.5 text-center">
              <div className="bg-white p-1 rounded border border-red-200">
                <strong className="text-red-900 block font-bold">१. आद्य चरण (१२औं भाव - मस्तक)</strong>
                <span className="text-stone-600">मानसिक चिन्ता, स्थान परिवर्तन, खर्च वृद्धि</span>
              </div>
              <div className="bg-white p-1 rounded border border-red-200">
                <strong className="text-blue-900 block font-bold">२. मध्य चरण (जन्म भाव - हृदय)</strong>
                <span className="text-stone-600">कार्यमा विलम्ब, स्वास्थ्य सजगता, शारीरिक थकान</span>
              </div>
              <div className="bg-white p-1 rounded border border-red-200">
                <strong className="text-green-900 block font-bold">३. अन्त्य चरण (२औं भाव - पाउ)</strong>
                <span className="text-stone-600">आर्थिक व्यवस्थापन, पारिवारिक दायित्व, लाभ</span>
              </div>
            </div>
          </div>

          {/* Box 4: गोचर अनिष्ट निवारण तथा शनि साढेसाती शान्ति उपाय */}
          <div className="border border-red-800 p-1.5 rounded-lg bg-amber-50/80 space-y-0.5 text-[9px]">
            <h3 className="font-bold text-red-900 border-b border-red-600 pb-0.5 text-[9.5px] flex items-center justify-between">
              <span>॥ गोचर अनिष्ट निवारण तथा शनि साढेसाती शान्ति उपाय ॥</span>
              <span className="italic text-amber-900 text-[8.5px]">ॐ शं शनैश्चराय नमः</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div className="bg-white p-1 rounded border border-amber-300 space-y-0.5">
                <p className="font-bold text-red-900">वैदिक शान्ति विधान:</p>
                <p>शनिबार पीपलको वृक्षमा जल चढाउने, तिलको तेलको दीप प्रज्वलन गर्ने, हनुमान चालिसा एवं दशरथकृत शनि स्तोत्र नित्य पाठ गर्ने।</p>
              </div>
              <div className="bg-white p-1 rounded border border-amber-300 space-y-0.5">
                <p className="font-bold text-red-900">दान तथा कवच:</p>
                <p>कालो तिल, कालो छाता, फलामका भाँडा तथा असहायलाई भोजन दान गर्नाले शनि एवं राहुको गोचर पीड़ा शान्त भई कार्यसिद्धि हुन्छ।</p>
              </div>
            </div>
          </div>

          {/* Box 5: Chart + Planetary Table */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-[9px] items-center">
            <div className="md:col-span-7">
              <CompactPlanetaryTable lagna={safeLagna} planets={safePlanets} />
            </div>
            <div className="md:col-span-5 flex justify-center">
              <PrintableDiamondChart
                title="चन्द्र राशि गोचर चक्र"
                houses={rashiHouses}
                maxSize={180}
              />
            </div>
          </div>

          {/* Box 6: Classical Gochar Shloka */}
          <div className="border border-red-800/80 rounded-lg p-1.5 bg-amber-50/60 text-center text-[9.5px] italic text-stone-800 font-serif">
            गोचरे वा विलग्ने वा यत्र कुर्वन्ति सङ्गमम् । तत्तद्भावफलं ब्रूयात् शुभाशुभविपाकतः ॥<br />
            ग्रहाधीना नराः सर्वे ग्रहाधीनं जगत्त्रयम् । गोचरे शुभसंयुक्ते सर्वं कल्याणमश्नुते ॥
          </div>

          <AstrologerSignatureBlock astrologer={astrologer} orgProfile={orgProfile} />
        </GreenOmBorderFrame>
      </div>
    );
  }

  // =========================================================================
  // 14. FALADESH (फलादेश) -> Exactly 1 Page
  // =========================================================================
  if (subCategory === 'faladesh') {
    const yogas = yogaDoshaEval.yogas;
    const doshas = yogaDoshaEval.doshas;

    return (
      <div ref={containerRef} id="printable-patrika-wrapper" className="w-full flex justify-center">
        <GreenOmBorderFrame className="space-y-1.5">
          <GaneshaHeaderCenter
            orgName={orgProfile.name}
            orgPhone={toDevanagariNumerals(orgProfile.phone || '+९७७-९७६४४००५३३')}
            title="॥ समग्र जीवन फलादेश तथा ज्योतिषीय परामर्श पत्रम् ॥"
            subtitle={`जातक: ${safeProfile.name} | जन्म लग्न: ${safeLagna?.rashiName} | चन्द्र राशि: ${panchanga?.moonRashi}`}
            primaryShloka="ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥"
            secondaryShloka="तदेव लग्नं सुदिनं तदेव ताराबलं चन्द्रबलं तदेव। विद्याबलं दैवबलं तदेव लक्ष्मीपते तेऽङ्घ्रियुगं स्मरामि॥"
          />

          {/* Box 1: जातक तथा कुण्डली परिचय */}
          <div className="border border-red-800 p-2 rounded-lg bg-amber-50/70 text-[10px]">
            <div className="flex items-center justify-between border-b border-red-800/50 pb-0.5 mb-1">
              <span className="font-bold text-red-900 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-red-700" />
                ॥ जातक परिचय तथा जन्म कुण्डली आधार ॥
              </span>
              <span className="text-[9px] text-amber-900 font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-amber-300">
                क्रमाङ्क: {safeProfile.jatakSerialNo || safeProfile.customerId || 'फल-००१'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[9.5px]">
              <div>
                <p><strong>जातकको नाम:</strong> <span className="text-red-900 font-bold">{safeProfile.name}</span></p>
                <p><strong>जन्म मिति:</strong> {toDevanagariNumerals(safeProfile.dateBS)} ({safeProfile.dateAD})</p>
              </div>
              <div>
                <p><strong>जन्म लग्न:</strong> <span className="text-blue-900 font-bold">{safeLagna?.rashiName}</span> ({safeLagna.formattedDegree})</p>
                <p><strong>चन्द्र राशि:</strong> <span className="text-red-900 font-bold">{panchanga?.moonRashi}</span> ({panchanga?.nakshatra?.name})</p>
              </div>
              <div>
                <p><strong>जन्म समय:</strong> {toDevanagariNumerals(safeProfile.time)}</p>
                <p><strong>स्थान:</strong> {safeProfile.location?.name || 'नेपाल'}</p>
              </div>
            </div>
          </div>

          {/* Box 2: ४ प्रमुख जीवन क्षेत्र फलादेश */}
          <div className="border border-amber-900 rounded-lg p-1.5 bg-[#FFFDF9] text-[9px] space-y-0.5">
            <div className="flex justify-between items-center border-b border-amber-700/50 pb-0.5">
              <span className="font-bold text-red-900 text-[9.5px]">॥ चार प्रमुख जीवन क्षेत्र विस्तृत फलादेश ॥</span>
              <span className="text-[8px] bg-amber-100 text-amber-950 px-1 py-0.2 rounded border border-amber-300 font-bold">वैदिक फलित सारांश</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <div className="bg-amber-50/80 p-1 rounded border border-amber-200 space-y-0.5">
                <strong className="text-red-900 block font-bold text-[9px]">१. स्वभाव, स्वरूप तथा स्वास्थ्य:</strong>
                <p>{safeLagna?.rashiName} लग्नको प्रभावले जातक दृढ निश्चयी, आत्मविश्वासी तथा स्पष्टवक्ता रहनेछ। खानपान र नियमित व्यायामले आरोग्य रक्षा हुनेछ।</p>
              </div>
              <div className="bg-amber-50/80 p-1 rounded border border-amber-200 space-y-0.5">
                <strong className="text-blue-900 block font-bold text-[9px]">२. विद्या, बुद्धि तथा धनसम्पत्ति:</strong>
                <p>द्वितीय र पञ्चम भावको शुभ प्रभावले जातक तीव्र स्मरणशक्ति, प्राविधिक वा प्रशासनिक ज्ञान तथा परिश्रमद्वारा स्थायी धन सञ्चय गर्न सक्षम हुनेछ।</p>
              </div>
              <div className="bg-amber-50/80 p-1 rounded border border-amber-200 space-y-0.5">
                <strong className="text-green-900 block font-bold text-[9px]">३. कर्म, पेशा तथा मान-सम्मान:</strong>
                <p>दशम भाव र भाग्येशको योगले कर्मक्षेत्रमा नेतृत्वदायी भूमिका, समाजमा प्रतिष्ठा तथा राज्य वा प्रतिष्ठित संस्थाबाट लाभ प्राप्त हुने योग छ।</p>
              </div>
              <div className="bg-amber-50/80 p-1 rounded border border-amber-200 space-y-0.5">
                <strong className="text-purple-900 block font-bold text-[9px]">४. दाम्पत्य, परिवार तथा सन्तान सुख:</strong>
                <p>सप्तम भावको स्थिति अनुसार समझदार जीवनसाथीको साथ, पारिवारिक सहयोग तथा सुयोग्य एवं आज्ञाकारी सन्तानको सुख प्राप्त हुनेछ।</p>
              </div>
            </div>
          </div>

          {/* Box 3: Yogas & Doshas */}
          <div className="grid grid-cols-2 gap-1.5 text-[9px]">
            <div className="border border-emerald-800 p-1 rounded bg-emerald-50/60 space-y-0.5">
              <h4 className="font-bold text-emerald-950 border-b border-emerald-300 pb-0.5 flex items-center gap-1 text-[9.5px]">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>मुख्य शुभ योगहरू:</span>
              </h4>
              {yogas.slice(0, 2).map((y, i) => (
                <p key={i}><strong className="text-emerald-900">{y.nameNepali}:</strong> {y.descriptionNepali}</p>
              ))}
            </div>

            <div className="border border-red-800 p-1 rounded bg-red-50/60 space-y-0.5">
              <h4 className="font-bold text-red-950 border-b border-red-300 pb-0.5 flex items-center gap-1 text-[9.5px]">
                <ShieldCheck className="w-3.5 h-3.5 text-red-700" />
                <span>दोष तथा शान्ति विचार:</span>
              </h4>
              {doshas.slice(0, 2).map((d, i) => (
                <p key={i}><strong className="text-red-900">{d.nameNepali}:</strong> {d.isCancelled ? 'शमित' : 'सक्रिय'} - {d.descriptionNepali}</p>
              ))}
            </div>
          </div>

          {/* Box 4: शुभ तत्व एवं उपाय सिफारिस */}
          <div className="border border-green-800 rounded-lg p-1 bg-green-50/50 text-[8.5px] grid grid-cols-4 gap-1 text-center font-semibold">
            <div className="bg-white p-1 rounded border border-green-200">
              <span className="text-stone-500 block">भाग्य रत्न</span>
              <strong className="text-red-900">माणिक्य / पुखराज</strong>
            </div>
            <div className="bg-white p-1 rounded border border-green-200">
              <span className="text-stone-500 block">शुभ रुद्राक्ष</span>
              <strong className="text-blue-900">५ मुखी / ७ मुखी</strong>
            </div>
            <div className="bg-white p-1 rounded border border-green-200">
              <span className="text-stone-500 block">शुभ वार / दिशा</span>
              <strong className="text-green-900">आइतबार / पूर्व</strong>
            </div>
            <div className="bg-white p-1 rounded border border-green-200">
              <span className="text-stone-500 block">इष्टदेवता</span>
              <strong className="text-amber-900">श्रीसूर्य / शिवजी</strong>
            </div>
          </div>

          {/* Box 5: Planetary Positions Table + Lagna Kundali Chart */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-[9px] items-center">
            <div className="md:col-span-7">
              <CompactPlanetaryTable lagna={safeLagna} planets={safePlanets} />
            </div>
            <div className="md:col-span-5 flex justify-center">
              <PrintableDiamondChart
                title="लग्न कुण्डली (D1)"
                houses={d1Chart.houses.map((h) => ({ houseNumber: h.houseNumber, rashiId: h.rashiId, planets: h.planets }))}
                maxSize={180}
              />
            </div>
          </div>

          {/* Box 6: Classical Phaladesh & Daivajna Shloka */}
          <div className="border border-red-800/80 rounded-lg p-1.5 bg-amber-50/60 text-center text-[9.5px] italic text-stone-800 font-serif">
            ग्रहाधीनं जगत्सर्वं ग्रहाधीना नराधिपाः । कालज्ञानेन सिध्यन्ति यतस्तस्माद् वदाम्यहम् ॥<br />
            यथा शिखा मयूराणां नागानां मणयो यथा । तद्वद् वेदाङ्गशास्त्राणां ज्योतिषं मूर्ध्नि वर्तते ॥
          </div>

          <AstrologerSignatureBlock astrologer={astrologer} orgProfile={orgProfile} />
        </GreenOmBorderFrame>
      </div>
    );
  }

  // =========================================================================
  // 15. ANYA (अन्य पत्रिका) -> Exactly 1 Page
  // =========================================================================
  return (
    <div ref={containerRef} id="printable-patrika-wrapper" className="w-full flex justify-center">
      <GreenOmBorderFrame className="space-y-1.5">
        <GaneshaHeaderCenter
          orgName={orgProfile.name}
          orgPhone={toDevanagariNumerals(orgProfile.phone || '+९७७-९७६४४००५३३')}
          title="॥ विशेष पूजा, अनुष्ठान तथा ज्योतिषीय परामर्श पत्रम् ॥"
          subtitle={`सङ्कल्प तथा पञ्चाङ्ग: शुभ सम्बत् ${toDevanagariNumerals(panchanga.dateBS)} | ${panchanga.samvatsara} संवत्सर`}
          primaryShloka="ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥"
          secondaryShloka="तदेव लग्नं सुदिनं तदेव ताराबलं चन्द्रबलं तदेव। विद्याबलं दैवबलं तदेव लक्ष्मीपते तेऽङ्घ्रियुगं स्मरामि॥"
        />

        {/* Box 1: यजमान तथा सङ्कल्प परिचय */}
        <div className="border border-red-800 p-2 rounded-lg bg-amber-50/70 text-[10px]">
          <div className="flex items-center justify-between border-b border-red-800/50 pb-0.5 mb-1">
            <span className="font-bold text-red-900 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-red-700" />
              ॥ यजमान (जातक) परिचय तथा अनुष्ठान सङ्कल्प ॥
            </span>
            <span className="text-[9px] text-amber-900 font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-amber-300">
              क्रमाङ्क: {safeProfile.jatakSerialNo || safeProfile.customerId || 'अनुष्ठान-००१'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[9.5px]">
            <div className="border-r border-amber-800/30 pr-2 space-y-0.5">
              <p><strong>यजमानको नाम:</strong> <span className="text-red-900 font-bold">{safeProfile.name}</span></p>
              <p><strong>जन्म मिति / समय:</strong> {toDevanagariNumerals(safeProfile.dateBS)} | {toDevanagariNumerals(safeProfile.time)}</p>
              <p><strong>लग्न / चन्द्र राशि:</strong> {safeLagna?.rashiName} / {panchanga?.moonRashi} ({panchanga?.nakshatra?.name})</p>
            </div>
            <div className="space-y-0.5">
              <p><strong>बाबुको नाम / गोत्र:</strong> {safeProfile.fatherDetails?.name || safeProfile.parentName || '—'} ({safeProfile.fatherDetails?.gotra || '—'})</p>
              <p><strong>कुलदेवता:</strong> {safeProfile.familyHistory?.kuldevata || '—'}</p>
              <p><strong>सङ्कल्प सङ्क्षिप्त:</strong> कायिक, वाचिक, मानसिक सकल दुरितोपशमनार्थं, सुखशान्ति समृद्धि प्राप्त्यर्थम्</p>
            </div>
          </div>
        </div>

        {/* Box 2: वैदिक महाशान्ति सूक्तम् एवं नवग्रह स्तोत्रम् */}
        <div className="border border-red-700/80 rounded-lg p-1.5 bg-amber-50/50 text-[9px] space-y-0.5">
          <p className="italic text-red-950 text-center font-serif leading-tight">
            ॐ द्यौः शान्तिरन्तरिक्षं शान्तिः पृथिवी शान्तिरापः शान्तिरोषधयः शान्तिः। वनस्पतयः शान्तिर्विश्वेदेवाः शान्तिर्ब्रह्म शान्तिः सर्वं शान्तिः शान्तिरेव शान्तिः सा मा शान्तिरेधि॥ ॐ शान्तिः शान्तिः शान्तिः॥
          </p>
          <p className="italic text-stone-800 text-center font-serif text-[8.5px] pt-0.5 border-t border-amber-300">
            ब्रह्मा मुरारिस्त्रिपुरान्तकारी भानुः शशी भूमिसुतो बुधश्च । गुरुश्च शुक्रः शनिराहुकेतवः कुर्वन्तु सर्वे मम सुप्रभातम् ॥
          </p>
        </div>

        {/* Box 3: चार प्रमुख वैदिक अनुष्ठान सिफारिस */}
        <div className="border border-amber-900 rounded-lg p-1.5 bg-[#FFFDF9] text-[9px] space-y-0.5">
          <div className="flex justify-between items-center border-b border-amber-700/50 pb-0.5">
            <span className="font-bold text-red-900 text-[9.5px]">॥ चार प्रमुख वैदिक अनुष्ठान एवं पूजा विधान परामर्श ॥</span>
            <span className="text-[8px] bg-amber-100 text-amber-950 px-1 py-0.2 rounded border border-amber-300 font-bold">सर्वदोष निवारक</span>
          </div>
          <div className="grid grid-cols-4 gap-1 pt-0.5 text-center">
            <div className="bg-amber-50 p-0.5 rounded border border-amber-200">
              <strong className="text-red-900 block font-bold text-[9px]">१. श्रीरुद्राभिषेक</strong>
              <span className="text-stone-700">आरोग्य, आयुवृद्धि एवं भय/रोग निवारण</span>
            </div>
            <div className="bg-amber-50 p-0.5 rounded border border-amber-200">
              <strong className="text-blue-900 block font-bold text-[9px]">२. सत्यनारायण कथा</strong>
              <span className="text-stone-700">पारिवारिक सुख, व्यापार वृद्धि एवं अभीष्ट सिद्धि</span>
            </div>
            <div className="bg-amber-50 p-0.5 rounded border border-amber-200">
              <strong className="text-green-900 block font-bold text-[9px]">३. नवग्रह शान्ति होम</strong>
              <span className="text-stone-700">दशा-गोचरजन्य अनिष्ट निवारण एवं ग्रहप्रसन्नता</span>
            </div>
            <div className="bg-amber-50 p-0.5 rounded border border-amber-200">
              <strong className="text-purple-900 block font-bold text-[9px]">४. कुलदेवता आराधना</strong>
              <span className="text-stone-700">वंशवृद्धि, पितृप्रसन्नता एवं कुल रक्षा कवच</span>
            </div>
          </div>
        </div>

        {/* Box 4: नवग्रह शान्ति दान द्रव्य एवं समिधा चक्र */}
        <div className="border border-green-800 rounded-lg p-1.5 bg-green-50/40 text-[8.5px] space-y-0.5">
          <div className="flex justify-between items-center border-b border-green-300 pb-0.5">
            <span className="font-bold text-green-950 text-[9px]">॥ नवग्रह शान्ति प्रिय दान द्रव्य एवं वैदिक समिधा तालिका ॥</span>
            <span className="text-[7.5px] bg-green-200 text-green-950 px-1 py-0.2 rounded border border-green-400 font-bold">शान्ति विधान</span>
          </div>
          <div className="grid grid-cols-3 gap-1 pt-0.5 text-stone-800">
            <div className="bg-white p-1 rounded border border-green-200">
              <strong className="text-red-900 block">सूर्य, चन्द्र, भौम:</strong>
              <span>सूर्य: गहुँ, तामा, गुड (आक) | चन्द्र: चामल, दूध, चाँदी (पलास) | भौम: रातो दाल, मुगा (खयर)</span>
            </div>
            <div className="bg-white p-1 rounded border border-green-200">
              <strong className="text-blue-900 block">बुध, गुरु, शुक्र:</strong>
              <span>बुध: मुङको दाल, काँस (अपामार्ग) | गुरु: चना, बेसार, पहेँलो वस्त्र (पिपल) | शुक्र: चिनी, घ्यू (उदुम्बर)</span>
            </div>
            <div className="bg-white p-1 rounded border border-green-200">
              <strong className="text-purple-900 block">शनि, राहु, केतु:</strong>
              <span>शनि: कालो तिल, फलाम, तेल (शमी) | राहु: उरुद, कम्बल (दुर्वा) | केतु: तिल, कम्बल, छाता (कुश)</span>
            </div>
          </div>
        </div>

        {/* Box 5: Planetary Positions Table + Lagna Kundali Chart */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 text-[9px] items-center">
          <div className="md:col-span-7">
            <CompactPlanetaryTable lagna={safeLagna} planets={safePlanets} />
          </div>
          <div className="md:col-span-5 flex justify-center">
            <PrintableDiamondChart
              title="लग्न कुण्डली (D1)"
              houses={d1Chart.houses.map((h) => ({ houseNumber: h.houseNumber, rashiId: h.rashiId, planets: h.planets }))}
              maxSize={180}
            />
          </div>
        </div>

        {/* Box 6: Classical Swasti Vachana & Anushthana Blessing Shloka */}
        <div className="border border-red-800/80 rounded-lg p-1.5 bg-amber-50/60 text-center text-[9.5px] italic text-stone-800 font-serif">
          ॐ स्वस्ति न इन्द्रो वृद्धश्रवाः स्वस्ति नः पूषा विश्ववेदाः । स्वस्ति नस्तार्क्ष्यो अरिष्टनेमिः स्वस्ति नो बृहस्पतिर्दधातु ॥<br />
          सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः । सर्वे भद्राणि पश्यन्तु मा कश्चिद् दुःखभाग्भवेत् ॥
        </div>

        <AstrologerSignatureBlock astrologer={astrologer} orgProfile={orgProfile} />
      </GreenOmBorderFrame>
    </div>
  );
};

export default DynamicPatrikaDocument;
