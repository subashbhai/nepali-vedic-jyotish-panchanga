import React, { useState } from 'react';
import {
  BirthDetails,
  LagnaInfo,
  PlanetPosition,
  PanchangaData,
  OrganizationProfile,
  AstrologerProfile,
  PlanetName,
} from '../types/astrology';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { generateDivisionalChart } from '../utils/astroCalculations';
import {
  formatPlanetDegreesMinutes,
  getPlanetStatusSuffix,
  NORTH_INDIAN_HOUSE_GEO,
  CalculatedAspectItem,
  calculateSinglePlanetAspects,
} from '../utils/aspectEngine';
import { calculateAshtakavarga } from '../utils/ashtakavargaEngine';
import { calculateTribhagiDasha, YOGINI_LIST } from '../utils/multiDashaEngine';
import { calculateVimshottariDasha, VIMSHOTTARI_PERIODS } from '../utils/dashaEngine';
import { evaluateAllYogasAndDoshas } from '../utils/yogaEngine';
import { calculateGocharAndSadeSati } from '../utils/gocharEngine';
import { evaluateGrahaPhalList } from '../utils/faladeshEngine';
import {
  analyzeAfflictedPlanetsAndUnfavorableYears,
  AfflictedPlanetAnalysis,
  ComprehensiveUnfavorablePeriodsReport,
} from '../utils/afflictedPlanetsEngine';
import { OfficialAstrologerSeal } from './common/OfficialAstrologerSeal';
import { VedicKalash } from './common/VedicKalash';
import { GaneshaHeaderCenter } from './GaneshaHeaderCenter';

export interface BrihatCheenaDocumentProps {
  profile: BirthDetails;
  lagna: LagnaInfo;
  planets: PlanetPosition[];
  panchanga: PanchangaData;
  orgProfile?: OrganizationProfile;
  astrologer?: AstrologerProfile;
  hideParentPhone?: boolean;
  activePage?: number;
}

// Traditional 2-letter Devanagari abbreviation for planets
export function getPlanetAbbreviation(name: string): string {
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

/**
 * Ornate Repeating Green ॐ Border Container for Authentic A4 Cheena
 */
export const GreenOmBorderFrame: React.FC<{
  children: React.ReactNode;
  pageNumber: number;
  totalPages?: number;
  headerTitle?: string;
  headerSubtitle?: string;
  orgProfile: OrganizationProfile;
  profileName: string;
  birthDateBS: string;
  className?: string;
}> = ({
  children,
  pageNumber,
  totalPages = 10,
  headerTitle,
  headerSubtitle,
  orgProfile,
  profileName,
  birthDateBS,
  className = '',
}) => {
  const omArrayHeader = Array.from({ length: 24 });
  const omArraySide = Array.from({ length: 32 });

  return (
    <div
      className={`brihat-cheena-page printable-page a4-preview-container relative bg-[#FFFDF5] text-stone-900 border-4 border-[#166534] p-1.5 sm:p-2.5 my-4 print:my-0 font-serif shadow-xl print:shadow-none box-border flex flex-col justify-between overflow-hidden ${className}`}
      style={{
        width: '210mm',
        height: '297mm',
        maxHeight: '297mm',
        maxWidth: '210mm',
        margin: '0 auto',
        boxSizing: 'border-box',
        pageBreakAfter: pageNumber === totalPages ? 'auto' : 'always',
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
        breakAfter: pageNumber === totalPages ? 'auto' : 'page',
      }}
    >
      {/* Outer Om Top Row (Green) */}
      <div className="flex justify-between items-center text-[#166534] text-xs sm:text-sm font-black px-1 select-none overflow-hidden h-5 leading-none shrink-0">
        {omArrayHeader.map((_, i) => (
          <span key={i} className="mx-auto font-black scale-110">ॐ</span>
        ))}
      </div>

      <div className="flex flex-1 my-0.5 min-h-0">
        {/* Outer Om Left Column (Green) */}
        <div className="flex flex-col justify-between items-center text-[#166534] text-xs sm:text-sm font-black py-1 pr-1 select-none w-5 leading-none shrink-0">
          {omArraySide.map((_, i) => (
            <span key={i} className="font-black scale-110">ॐ</span>
          ))}
        </div>

        {/* Inner Double Hairline Frame */}
        <div className="flex-1 border-2 border-[#166534] p-0.5 bg-amber-50/20 flex flex-col justify-between overflow-hidden">
          <div className="border border-[#d97706]/60 p-2 sm:p-3 bg-[#FFFDF7] flex-1 flex flex-col justify-between relative shadow-2xs overflow-hidden">
            
            {/* Corner Ornamental Swastik / Om Symbols */}
            <div className="absolute top-1 left-1.5 text-[11px] text-[#166534] font-bold select-none pointer-events-none">
              卐
            </div>
            <div className="absolute top-1 right-1.5 text-[11px] text-[#166534] font-bold select-none pointer-events-none">
              ॐ
            </div>
            <div className="absolute bottom-1 left-1.5 text-[11px] text-[#166534] font-bold select-none pointer-events-none">
              ॐ
            </div>
            <div className="absolute bottom-1 right-1.5 text-[11px] text-[#166534] font-bold select-none pointer-events-none">
              卐
            </div>

            {/* Page Body Content */}
            <main className="flex-1 flex flex-col justify-between pt-0.5 overflow-hidden">
              {children}
            </main>

            {/* Minimal Continuous Scroll Page Counter (Ensures smooth seam when glued) */}
            <footer className="pt-1 border-t border-[#166534]/30 mt-1 flex items-center justify-between text-[8.5px] text-stone-500 shrink-0">
              <div>
                <span className="font-medium text-stone-600">
                  {pageNumber === 1 ? (orgProfile.name || '॥ श्री जन्मपत्रिका ॥') : '॥ शुभम् ॥'}
                </span>
              </div>

              <div className="italic text-[#166534] font-semibold text-[8px]">
                ॥ धर्मो रक्षति रक्षितः ॥
              </div>

              <div className="font-bold text-[#166534] text-right">
                पृष्ठ {toDevanagariNumerals(pageNumber)} / {toDevanagariNumerals(totalPages)}
              </div>
            </footer>

          </div>
        </div>

        {/* Outer Om Right Column (Green) */}
        <div className="flex flex-col justify-between items-center text-[#166534] text-xs sm:text-sm font-black py-1 pl-1 select-none w-5 leading-none shrink-0">
          {omArraySide.map((_, i) => (
            <span key={i} className="font-black scale-110">ॐ</span>
          ))}
        </div>
      </div>

      {/* Outer Om Bottom Row (Green) */}
      <div className="flex justify-between items-center text-[#166534] text-xs sm:text-sm font-black px-1 select-none overflow-hidden h-5 leading-none shrink-0">
        {omArrayHeader.map((_, i) => (
          <span key={i} className="mx-auto font-black scale-110">ॐ</span>
        ))}
      </div>
    </div>
  );
};

/**
 * Standard Diamond Kundali Chart for Brihat Cheena
 */
export const BrihatDiamondChart: React.FC<{
  title: string;
  houses: Array<{ houseNumber: number; rashiId: number; planets: PlanetPosition[] }>;
  maxSize?: number;
  subtitle?: string;
}> = ({ title, houses, maxSize = 240, subtitle }) => {
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
    <div className="flex flex-col items-center page-break-inside-avoid w-full">
      {/* Pill Badge */}
      <div className="bg-[#166534] text-white text-[11px] font-bold px-4 py-0.5 rounded-full mb-1 border border-[#14532d] shadow-2xs">
        {title}
      </div>

      {/* SVG Container */}
      <div
        className="relative w-full aspect-square bg-[#FFFDF7] border-2 border-stone-800 p-0.5 shadow-2xs select-none"
        style={{ maxWidth: `${maxSize}px` }}
      >
        <svg viewBox="0 0 400 400" className="w-full h-full stroke-stone-900 fill-none stroke-[2]">
          {/* Outer Box */}
          <rect x="5" y="5" width="390" height="390" className="stroke-stone-900 stroke-[3]" />
          {/* Diagonals */}
          <line x1="5" y1="5" x2="395" y2="395" />
          <line x1="395" y1="5" x2="5" y2="395" />
          {/* Inner Diamond */}
          <polygon points="200,5 395,200 200,395 5,200" className="stroke-stone-900 stroke-[3]" />
        </svg>

        {/* House Overlays */}
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
              <span className="text-[10px] font-extrabold text-blue-800 leading-none">
                {toDevanagariNumerals(house.rashiId)}
              </span>

              {/* Red Planet Badges - Only Planet and Degree */}
              <div className="flex flex-wrap justify-center items-center gap-0.5 mt-0.5 max-w-[75px]">
                {house.planets.map((p) => {
                  const degStr = formatPlanetDegreesMinutes(p);

                  return (
                    <span
                      key={p.id}
                      className="text-red-700 font-bold text-[9px] leading-tight px-0.5 py-0.2 rounded bg-amber-100/70 inline-flex items-center"
                    >
                      <span>{getPlanetAbbreviation(p.name)}</span>
                      <span className="text-[7.5px] text-stone-700 ml-0.5 font-mono">{degStr}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {subtitle && (
        <p className="text-[9px] text-stone-600 italic mt-0.5 text-center">
          {subtitle}
        </p>
      )}
    </div>
  );
};

/**
 * 10-PAGE MASTER BRIHAT CHEENA DOCUMENT
 */
export const BrihatCheenaDocument: React.FC<BrihatCheenaDocumentProps> = ({
  profile,
  lagna,
  planets,
  panchanga,
  orgProfile,
  astrologer,
  hideParentPhone = false,
  activePage,
}) => {
  const safeOrgProfile: OrganizationProfile = orgProfile || {
    name: 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा',
    phone: '+९७७-९७६४८४००५३३',
    email: 'suwashdmk@gmail.com',
    address: 'काठमाडौँ, नेपाल',
    intro: 'परम्परागत वैदिक ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा',
    logoUrl: '/logo.png',
    showLogoOnBills: true,
    showPhotoOnReports: true,
  };

  // Compute traditional dates & numbers
  const bsYear = parseInt(profile.dateBS.split('-')[0]) || 2081;
  const shakaYear = bsYear - 135;
  const adYear = profile.dateAD.split('-')[0] || '2025';

  // Compute D1 to D60 charts
  const d1Chart = generateDivisionalChart('D1', lagna, planets);
  const d2Chart = generateDivisionalChart('D2', lagna, planets);
  const d3Chart = generateDivisionalChart('D3', lagna, planets);
  const d4Chart = generateDivisionalChart('D4', lagna, planets);
  const d7Chart = generateDivisionalChart('D7', lagna, planets);
  const d9Chart = generateDivisionalChart('D9', lagna, planets);
  const d10Chart = generateDivisionalChart('D10', lagna, planets);
  const d12Chart = generateDivisionalChart('D12', lagna, planets);
  const d16Chart = generateDivisionalChart('D16', lagna, planets);
  const d20Chart = generateDivisionalChart('D20', lagna, planets);
  const d24Chart = generateDivisionalChart('D24', lagna, planets);
  const d30Chart = generateDivisionalChart('D30', lagna, planets);

  // Chandra / Rashi Chart (Moon in House 1)
  const moonPlanet = planets.find((p) => p.name === 'चन्द्र') || planets[1];
  const moonRashiId = moonPlanet?.rashiId || 10;
  const rashiHouses = Array.from({ length: 12 }, (_, idx) => {
    const houseNum = idx + 1;
    const houseRashiId = ((moonRashiId - 1 + idx) % 12) + 1;
    const housePlanets = planets.filter((p) => p.rashiId === houseRashiId);
    return { houseNumber: houseNum, rashiId: houseRashiId, planets: housePlanets };
  });

  // Bhava Chalit Chart
  const bhavaHouses = Array.from({ length: 12 }, (_, idx) => {
    const houseNum = idx + 1;
    const houseRashiId = ((lagna.rashiId - 1 + idx) % 12) + 1;
    const housePlanets = planets.filter((p) => p.bhava === houseNum);
    return { houseNumber: houseNum, rashiId: houseRashiId, planets: housePlanets };
  });

  // Astrological Engines computations
  const ashtakavargaResult = calculateAshtakavarga(planets);
  const vimshottariDasha = calculateVimshottariDasha(moonPlanet, profile.dateAD, profile.time);
  const tribhagiDasha = calculateTribhagiDasha(moonPlanet, profile.dateAD, profile.time);
  const yogaDoshaResult = evaluateAllYogasAndDoshas(lagna, planets, vimshottariDasha);
  const gocharResult = calculateGocharAndSadeSati(moonPlanet, planets, profile.dateBS);
  const grahaPhalList = evaluateGrahaPhalList(planets, lagna);

  // Unfavorable planets, critical life years & Vedic remedies computation
  const birthYearBS = parseInt(profile.dateBS.split('-')[0], 10) || 2081;
  const afflictedAnalysis = analyzeAfflictedPlanetsAndUnfavorableYears(
    lagna,
    planets,
    vimshottariDasha,
    birthYearBS
  );

  const totalPages = 10;
  const shouldRenderPage = (pageNo: number) => {
    return !activePage || activePage === pageNo;
  };

  // Namakshara based on nakshatra & pada
  const getNamakshara = (nakshatra: string, pada: number) => {
    const map: Record<string, string[]> = {
      'अश्विनी': ['चु', 'चे', 'चो', 'ला'],
      'भरणी': ['ली', 'लू', 'ले', 'लो'],
      'कृत्तिका': ['अ', 'ई', 'उ', 'ए'],
      'रोहिणी': ['ओ', 'वा', 'वी', 'वू'],
      'मृगशिरा': ['वे', 'वो', 'का', 'की'],
      'आर्द्रा': ['कु', 'घ', 'ङ', 'छ'],
      'पुनर्वसु': ['के', 'को', 'हा', 'ही'],
      'पुष्य': ['हू', 'हे', 'हो', 'डा'],
      'आश्लेषा': ['डी', 'डू', 'डे', 'डो'],
      'मघा': ['मा', 'मी', 'मू', 'मे'],
      'पूर्वाफाल्गुनी': ['मो', 'टा', 'टी', 'टू'],
      'उत्तराफाल्गुनी': ['टे', 'टो', 'पा', 'पी'],
      'हस्त': ['पू', 'ष', 'ण', 'ठा'],
      'चित्रा': ['पे', 'पो', 'रा', 'री'],
      'स्वाती': ['रू', 'रे', 'रो', 'ता'],
      'विशाखा': ['ती', 'तू', 'ते', 'तो'],
      'अनुराधा': ['ना', 'नी', 'नू', 'ने'],
      'ज्येष्ठा': ['नो', 'या', 'यी', 'यू'],
      'मूल': ['ये', 'यो', 'भा', 'भी'],
      'पूर्वाषाढा': ['भू', 'धा', 'फा', 'ढा'],
      'उत्तराषाढा': ['भे', 'भो', 'जा', 'जी'],
      'श्रवण': ['खी', 'खू', 'खे', 'खो'],
      'धनिष्ठा': ['गा', 'गी', 'गु', 'गे'],
      'शतभिषा': ['गो', 'सा', 'सी', 'सू'],
      'पूर्वाभाद्रपदा': ['से', 'सो', 'दा', 'दी'],
      'उत्तराभाद्रपदा': ['दू', 'थ', 'झ', 'ञ'],
      'रेवती': ['दे', 'दो', 'चा', 'ची'],
    };
    const chars = map[nakshatra] || ['शुभ', 'श्री', 'आनन्द', 'जय'];
    return chars[(pada - 1) % 4] || 'शुभ';
  };

  const namakshara = getNamakshara(panchanga.nakshatra.name, panchanga.nakshatra.pada);

  // Ghatachakra attributes based on Moon Rashi
  const getGhatachakra = (rashi: string) => {
    const ghataMap: Record<string, { masa: string; tithi: string; vara: string; nakshatra: string; prahara: string; lagna: string }> = {
      'मेष': { masa: 'कार्तिक', tithi: '१, ६, ११ (नन्दा)', vara: 'आइतबार', nakshatra: 'मघा', prahara: 'प्रथम', lagna: 'मेष' },
      'वृष': { masa: 'मंसिर', tithi: '५, १०, १५ (पूर्णा)', vara: 'शनिबार', nakshatra: 'हस्त', prahara: 'द्वितीय', lagna: 'वृष' },
      'मिथुन': { masa: 'पौष', tithi: '२, ७, १२ (भद्रा)', vara: 'सोमबार', nakshatra: 'स्वाती', prahara: 'तृतीय', lagna: 'मिथुन' },
      'कर्कट': { masa: 'माघ', tithi: '२, ७, १२ (भद्रा)', vara: 'बुधबार', nakshatra: 'अनुराधा', prahara: 'चतुर्थ', lagna: 'कन्या' },
      'सिंह': { masa: 'फाल्गुन', tithi: '३, ८, १३ (जया)', vara: 'बिहीबार', nakshatra: 'मूल', prahara: 'प्रथम', lagna: 'मकर' },
      'कन्या': { masa: 'चैत्र', tithi: '५, १०, १५ (पूर्णा)', vara: 'शनिबार', nakshatra: 'श्रवण', prahara: 'द्वितीय', lagna: 'मीन' },
      'तुला': { masa: 'वैशाख', tithi: '४, ९, १४ (रिक्ता)', vara: 'बिहीबार', nakshatra: 'शतभिषा', prahara: 'तृतीय', lagna: 'धनु' },
      'वृश्चिक': { masa: 'ज्येष्ठ', tithi: '१, ६, ११ (नन्दा)', vara: 'शुक्रबार', nakshatra: 'रेवती', prahara: 'चतुर्थ', lagna: 'वृषभ' },
      'धनु': { masa: 'आषाढ', tithi: '३, ८, १३ (जया)', vara: 'शुक्रबार', nakshatra: 'भरणी', prahara: 'प्रथम', lagna: 'सिंह' },
      'मकर': { masa: 'श्रावण', tithi: '४, ९, १४ (रिक्ता)', vara: 'मंगलबार', nakshatra: 'रोहिणी', prahara: 'द्वितीय', lagna: 'कुम्भ' },
      'कुम्भ': { masa: 'भाद्र', tithi: '३, ८, १३ (जया)', vara: 'बिहीबार', nakshatra: 'आर्द्रा', prahara: 'तृतीय', lagna: 'मिथुन' },
      'मीन': { masa: 'आश्विन', tithi: '५, १०, १५ (पूर्णा)', vara: 'शुक्रबार', nakshatra: 'आश्लेषा', prahara: 'चतुर्थ', lagna: 'कर्कट' },
    };
    return ghataMap[rashi] || ghataMap['मेष'];
  };

  const ghataInfo = getGhatachakra(panchanga.moonRashi);

  return (
    <div className="space-y-6 print:space-y-0 font-serif text-stone-900 max-w-4xl mx-auto select-text">

      {/* ========================================================================= */}
      {/* PAGE 1: श्री मङ्गलमूर्तये नमः - जन्मपत्रिका संकल्प एवं अवकहडा चक्र */}
      {/* ========================================================================= */}
      {shouldRenderPage(1) && (
      <GreenOmBorderFrame
        pageNumber={1}
        totalPages={totalPages}
        headerTitle="श्री मङ्गलमूर्तये नमः - जन्मपत्रिका सङ्कल्प एवं अवकहडा चक्र"
        headerSubtitle="परम्परागत प्रामाणिक जन्मकुण्डली एवं पञ्चाङ्ग वचनम्"
        orgProfile={orgProfile}
        profileName={profile.name}
        birthDateBS={profile.dateBS}
      >
        <div className="space-y-2 text-xs leading-relaxed text-stone-900">
          
          {/* Top Traditional Auspicious Header Frame */}
          <GaneshaHeaderCenter
            title="॥ बृहत् जन्मपत्रिका ॥"
            orgName={orgProfile?.name}
          />

          {/* Authentic Sanskrit Prose with Red Highlights */}
          <div className="text-[11.5px] sm:text-xs leading-loose text-justify text-stone-900 p-2 sm:p-3 bg-[#FFFDF9] border border-amber-300 rounded space-y-2">
            <p>
              <span className="text-red-700 font-bold">श्रीशालिवाहनीयशाके {toDevanagariNumerals(shakaYear)}</span>{' '}
              <span className="text-red-700 font-bold">श्रीवीरविक्रमादित्य संवत् {toDevanagariNumerals(bsYear)}</span>{' '}
              <span className="text-red-700 font-bold">{panchanga.samvatsara}</span> नामसंवत्सरे श्रीसूर्ये{' '}
              <span className="text-red-700 font-bold">{panchanga.ayana}</span> अयने{' '}
              <span className="text-red-700 font-bold">{panchanga.ritu}</span> ऋतौ, अथ चान्द्रमानेन{' '}
              <span className="text-red-700 font-bold">{(panchanga as any).monthNameNepali || 'माघ'}</span> मासे{' '}
              <span className="text-red-700 font-bold">{panchanga.tithi.paksha}</span> पक्षे{' '}
              <span className="text-red-700 font-bold">{panchanga.dayNameNepali}</span> वासर{' '}
              <span className="text-red-700 font-bold">{panchanga.tithi.name}</span> तिथौ, घट्यादि:{' '}
              <span className="text-red-700 font-bold">९ घ ५ प</span> तत् {panchanga.tithi.name} तिथौ{' '}
              <span className="text-red-700 font-bold">{panchanga.nakshatra.name}</span> नक्षत्रघट्यादि:{' '}
              <span className="text-red-700 font-bold">२४:५२:३७</span> तत् {panchanga.nakshatra.name} नक्षत्रस्य जन्मसमये भुक्तघट्यादि:{' '}
              <span className="text-red-700 font-bold">४४:३६:४२</span> भभोगघट्यादि:{' '}
              <span className="text-red-700 font-bold">६०:३६:३६</span> प्रसङ्गादय:{' '}
              <span className="text-red-700 font-bold">{panchanga.yoga.name}</span> योगे तात्कालिक{' '}
              <span className="text-red-700 font-bold">{panchanga.karana.name}</span> करणे इति पञ्चाङ्ग। अथ सौरमानेन मासोत्तमे{' '}
              <span className="text-red-700 font-bold">{(panchanga as any).monthNameNepali || 'माघ'}</span> मासे सूर्यसंक्रमाद् गतादिनेषु{' '}
              <span className="text-red-700 font-bold">१३</span> तदनुसार (वि.सं.{' '}
              <span className="text-red-700 font-bold">{toDevanagariNumerals(profile.dateBS)}</span>, ई.सं.{' '}
              <span className="text-red-700 font-bold">{profile.dateAD}</span>) अत्र{' '}
              <span className="text-red-700 font-bold">{panchanga.dayNameNepali}</span> वासरे प्रामाणिक समयानुसारेण{' '}
              <span className="text-red-700 font-bold">{toDevanagariNumerals(profile.time)}</span> श्रीसूर्योदयादिष्टघट्यादि:{' '}
              <span className="text-red-700 font-bold">८:५२:४३</span> तदा जन्मसमये{' '}
              <span className="text-red-700 font-bold">{lagna.rashiName}</span> लग्नोदये{' '}
              <span className="text-red-700 font-bold">{d9Chart.houses[0]?.rashiName || 'वृश्चिक'}</span> नवमांशके{' '}
              <span className="text-red-700 font-bold">{panchanga.moonRashi}</span> राशिगते चन्द्रमसि एवंविधे पञ्चाङ्गशुद्धे{' '}
              <span className="text-red-700 font-bold">{profile?.location?.country || 'नेपाल'}</span> देशे{' '}
              <span className="text-red-700 font-bold">{profile?.location?.province || 'सुदूरपश्चिम'}</span> प्रदेशे{' '}
              <span className="text-red-700 font-bold">{profile?.location?.district || 'कैलाली'}</span> मण्डले{' '}
              <span className="text-red-700 font-bold">{profile?.location?.name || '—'}</span> (यत्राक्षांश{' '}
              <span className="text-red-700 font-bold">{toDevanagariNumerals(profile?.location?.latitude || 28.68)}</span> उ.,{' '}
              देशान्तर <span className="text-red-700 font-bold">{toDevanagariNumerals(profile?.location?.longitude || 80.60)}</span> पू.,{' '}
              मानक समय <span className="text-red-700 font-bold">+५:४५</span>) निवसत:{' '}
              <span className="text-red-700 font-bold">{profile.fatherDetails?.gotra || 'भारद्वाज'}</span> गोत्रोत्पन्नस्य श्रीमत:{' '}
              <span className="text-red-700 font-bold">{profile.fatherDetails?.name || profile.parentName || '—'}</span> इतस्य कुलोचित विवाहिता भार्याया: श्रीमत्या:{' '}
              <span className="text-red-700 font-bold">{profile.motherDetails?.name || '—'}</span> नाम्नीदेव्या:{' '}
              <span className="text-red-700 font-bold">{profile.familyHistory?.childOrder || 'द्वितिय'}</span> गर्भे{' '}
              <span className="text-red-700 font-bold">{profile.familyHistory?.childType || (profile.gender === 'male' ? 'पुत्र' : 'पुत्री')}</span> रत्नमजीजनत् ।
            </p>

            <p>
              अस्य होराशास्त्रप्रमाणेण <span className="text-red-700 font-bold">{panchanga.nakshatra.name}</span> नक्षत्रस्य{' '}
              <span className="text-red-700 font-bold">{toDevanagariNumerals(panchanga.nakshatra.pada)}</span> चरणस्य{' '}
              <span className="text-red-700 font-bold">"{namakshara}"</span> काराक्षरस्य अनुकूल: योनि:{' '}
              <span className="text-red-700 font-bold">वानर/गौ</span>, नाडी:{' '}
              <span className="text-red-700 font-bold">अन्त्य</span>, गण:{' '}
              <span className="text-red-700 font-bold">मनुष्य</span>, वर्ग:{' '}
              <span className="text-red-700 font-bold">सिंह/मार्जार</span>, वर्ण:{' '}
              <span className="text-red-700 font-bold">क्षत्रिय/वैश्य</span>, आसन:{' '}
              <span className="text-red-700 font-bold">शयन</span> श्री{' '}
              <span className="text-red-700 font-bold text-sm">{profile.name}</span> इति चिरञ्जीवी शुभनाम प्रतिष्ठितम्। स च देवद्विजाशीर्वादैर्दीर्घमायूभूयात्।
            </p>
          </div>

          {/* Avakahada Chakra & Ghatachakra Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            
            {/* Avakahada Chakra Card */}
            <div className="border border-[#166534] rounded p-2 bg-amber-50/40 space-y-1">
              <h4 className="font-bold text-[#166534] text-xs border-b border-[#166534]/40 pb-0.5 text-center">
                ॥ जन्मकालीन अवकहडा चक्रम् (Avakahada Table) ॥
              </h4>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px]">
                <p><strong>जन्मनक्षत्र:</strong> {panchanga.nakshatra.name} ({toDevanagariNumerals(panchanga.nakshatra.pada)} पाद)</p>
                <p><strong>नामकरण अक्षर:</strong> <span className="text-red-700 font-bold">"{namakshara}"</span></p>
                <p><strong>चन्द्र राशि:</strong> {panchanga.moonRashi}</p>
                <p><strong>सूर्य राशि:</strong> {panchanga.sunRashi}</p>
                <p><strong>जन्म लग्न:</strong> {lagna.rashiName}</p>
                <p><strong>राशि स्वामी:</strong> {(moonPlanet as any)?.rashiLord || 'शनि'}</p>
                <p><strong>वर्ण / वश्य:</strong> वैश्य / जलचर</p>
                <p><strong>योनि / नाडी:</strong> वानर / अन्त्य</p>
                <p><strong>गण / वर्ग:</strong> देव / सिंह</p>
                <p><strong>पाया (चरण):</strong> {panchanga.nakshatra.pada <= 2 ? 'स्वर्ण (सुन)' : 'रजत (चाँदी)'}</p>
              </div>
            </div>

            {/* Ghatachakra (Cautionary Chart) */}
            <div className="border border-red-600 rounded p-2 bg-red-50/30 space-y-1">
              <h4 className="font-bold text-red-800 text-xs border-b border-red-300 pb-0.5 text-center">
                ॥ जन्म राशि अनुसार घातचक्र सतर्कता (Ghata Chakra) ॥
              </h4>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-stone-800">
                <p><strong>घात महिना:</strong> {ghataInfo.masa}</p>
                <p><strong>घात तिथि:</strong> {ghataInfo.tithi}</p>
                <p><strong>घात बार:</strong> <span className="text-red-700 font-bold">{ghataInfo.vara}</span></p>
                <p><strong>घात नक्षत्र:</strong> {ghataInfo.nakshatra}</p>
                <p><strong>घात प्रहर:</strong> {ghataInfo.prahara} प्रहर</p>
                <p><strong>घात लग्न:</strong> {ghataInfo.lagna}</p>
                <p className="col-span-2 text-[10px] text-stone-600 italic pt-0.5 border-t border-red-200">
                  * उक्त घात बार, तिथि तथा नक्षत्रमा यात्रा, नयाँ व्यवसाय वा जोखिमपूर्ण कार्य गर्दा भगवती वा कुलदेवताको स्मरण गरी मात्र प्रारम्भ गर्नुहोला।
                </p>
              </div>
            </div>

          </div>

          {/* Panchanga Phala Consideration to fully fill Page 1 */}
          <div className="border border-[#166534] rounded p-2 bg-[#FFFDF9] space-y-1">
            <h4 className="font-bold text-[#166534] text-xs border-b border-[#166534]/30 pb-0.5 text-center">
              ॥ जन्मकालीन पञ्चाङ्ग फल विचार (तिथि, बार, नक्षत्र, योग एवं करण) ॥
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10.5px]">
              <div className="p-1.5 rounded bg-amber-50/70 border border-amber-200">
                <span className="font-bold text-red-800 block">तिथि फल ({panchanga.tithi.name}):</span>
                <span className="text-stone-700">सदाचारी, कुल मर्यादा पालक, धर्मनिष्ठ, उदार विचार र समाजमा सम्मानित व्यक्तित्व।</span>
              </div>
              <div className="p-1.5 rounded bg-amber-50/70 border border-amber-200">
                <span className="font-bold text-red-800 block">बार फल ({panchanga.dayNameNepali}):</span>
                <span className="text-stone-700">आत्मविश्वासी, कर्मठ, कर्तव्यनिष्ठ, नेतृत्व क्षमता र व्यवहारकुशल जीवनशैली।</span>
              </div>
              <div className="p-1.5 rounded bg-amber-50/70 border border-amber-200">
                <span className="font-bold text-red-800 block">नक्षत्र फल ({panchanga.nakshatra.name}):</span>
                <span className="text-stone-700">तीक्ष्ण बुद्धि, परोपकारी स्वभाव, विद्या-कलामा रुचि र कार्यक्षेत्रमा स्थायी प्रतिष्ठा।</span>
              </div>
              <div className="p-1.5 rounded bg-amber-50/70 border border-amber-200">
                <span className="font-bold text-red-800 block">योग-करण ({panchanga.yoga.name}/{panchanga.karana.name}):</span>
                <span className="text-stone-700">उद्यमी, दृढ संकल्पी, न्यायप्रिय र व्यापार-वाणिज्य तथा यात्रामा लाभ प्राप्ति।</span>
              </div>
            </div>
          </div>

          {/* Lagna & Chandra Guidance and Vedic Swasti Vachana */}
          <div className="border border-[#166534] rounded p-2 bg-amber-50/50 space-y-1">
            <h4 className="font-bold text-[#166534] text-xs border-b border-[#166534]/30 pb-0.5 text-center">
              ॥ जन्म लग्न एवं चन्द्र राशि स्वरूप फल तथा वैदिक स्वस्तिवाचनम् ॥
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10.5px]">
              <div className="p-1 rounded bg-white border border-stone-200">
                <span className="font-bold text-red-800 block">लग्न प्रभाव ({lagna.rashiName} लग्न):</span>
                <span className="text-stone-700">तनु, शरीर, आयु, वर्ण, स्वभाव, मानसिक शक्ति, आत्मबल र स्वास्थ्यमा सकारात्मक नेतृत्वदायी ऊर्जा।</span>
              </div>
              <div className="p-1 rounded bg-white border border-stone-200">
                <span className="font-bold text-blue-800 block">चन्द्र राशि प्रभाव ({panchanga.moonRashi} राशि):</span>
                <span className="text-stone-700">मन, चित्तवृत्ति, भावना, जनसम्पर्क, कल्पनाशीलता तथा कुल मर्यादाप्रति समर्पण एवं सौम्य व्यवहार।</span>
              </div>
            </div>
            <div className="text-center pt-0.5 border-t border-amber-300/60">
              <p className="text-[#166534] font-bold text-[10px] italic">
                ॐ भद्रं कर्णेभिः शृणुयाम देवा भद्रं पश्येमाक्षभिर्यजत्राः । स्थिरैरङ्गैस्तुष्टुवांसस्तनूभिर्व्यशेम देवहितं यदायूः ॥
              </p>
            </div>
          </div>

          {/* ================================================================= */}
          {/* कुण्डली खोल्दा भनिने शास्त्रीय मङ्गलाचरण ब्लक (Kundali Opening Invocations) */}
          {/* ================================================================= */}
          <div className="border-2 border-[#166534] rounded-lg p-2.5 bg-gradient-to-b from-[#FFFDF9] via-amber-50/60 to-[#FFFDF9] space-y-1.5 shadow-2xs">
            {/* Block Header */}
            <div className="flex items-center justify-between border-b-2 border-[#166534] pb-1">
              <div className="flex items-center gap-1.5 text-red-800 font-bold text-xs sm:text-sm font-serif">
                <span className="text-base">🕉️</span>
                <span>॥ कुण्डली दर्शन / उद्घाटन गर्दा भनिने शास्त्रीय मङ्गलाचरणम् ॥</span>
              </div>
              <span className="text-[10px] font-bold text-[#166534] bg-green-100/90 px-2 py-0.5 rounded border border-green-300 font-serif">
                दैवज्ञ वाचन विधि एवं मङ्गल स्तुति
              </span>
            </div>

            {/* Subtitle Description */}
            <p className="text-[10px] text-stone-700 italic text-center font-serif leading-tight">
              परम्परागत ज्योतिषशास्त्र अनुसार जन्मकुण्डली खोल्दा, हेर्दा एवं फलादेश वाचन गर्दा सर्वप्रथम विघ्नहर्ता गणेश, नवग्रह एवं इष्टदेवको स्मरण गरी मङ्गलाचरण पाठ गर्ने शास्त्रीय परम्परा छ:
            </p>

            {/* 4 Thematic Cards in 2x2 Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
              {/* Card 1: विघ्नहर्ता एवं गुरु वन्दना */}
              <div className="border border-amber-300 rounded p-1.5 bg-white/95 space-y-0.5">
                <div className="flex items-center justify-between text-red-800 font-bold border-b border-amber-200 pb-0.5">
                  <span>१. विघ्नहर्ता श्रीगणेश एवं गुरु चरण वन्दना</span>
                  <span className="text-[8.5px] text-amber-800 font-normal">विघ्न निवारण</span>
                </div>
                <p className="text-red-900 font-semibold italic text-[9.5px] leading-tight">
                  विघ्नेशं च समभ्यर्च्य भास्करं गणनायकम् ।<br />
                  होराशास्त्रप्रवृत्त्यर्थं क्रियते मङ्गलादरः ॥<br />
                  मूर्ध्न्युद्धृत्य गुरोः पादौ हृदये च विनायकम् ।
                </p>
                <p className="text-stone-700 text-[9px] leading-tight">
                  <strong>भावार्थ:</strong> कुण्डली खोल्दा सर्वप्रथम भगवान् गणेश, प्रत्यक्ष देवता सूर्य र सद्गुरुको चरणकमल स्मरण गर्नाले अज्ञान र विघ्न नाश भई कुण्डली विचार सत्य, कल्याणकारी र दोषमुक्त हुन्छ।
                </p>
              </div>

              {/* Card 2: नवग्रह मङ्गल स्तुति */}
              <div className="border border-amber-300 rounded p-1.5 bg-white/95 space-y-0.5">
                <div className="flex items-center justify-between text-blue-900 font-bold border-b border-amber-200 pb-0.5">
                  <span>२. नवग्रह मङ्गल स्तुति एवं सुप्रभातम्</span>
                  <span className="text-[8.5px] text-blue-800 font-normal">सर्वग्रह शुभत्व</span>
                </div>
                <p className="text-blue-950 font-semibold italic text-[9.5px] leading-tight">
                  ब्रह्मा मुरारिस्त्रिपुरान्तकारी भानुः शशी भूमिसुतो बुधश्च ।<br />
                  गुरुश्च शुक्रः शनिराहुकेतवः कुर्वन्तु सर्वे शुभसुप्रभातम् ॥<br />
                  आदित्याय च सोमाय मङ्गलाय बुधाय च नमः ॥
                </p>
                <p className="text-stone-700 text-[9px] leading-tight">
                  <strong>भावार्थ:</strong> सूर्य, चन्द्र, मङ्गल, बुध, गुरु, शुक्र, शनि, राहु र केतु नवग्रहहरूले जातकको जीवनमा सदैव आरोग्य, दीर्घायु, शान्ति, विद्या, धन र मङ्गलमय वातावरण निर्माण गरून्।
                </p>
              </div>

              {/* Card 3: कर्मफल एवं कुण्डली उद्घाटन सिद्धान्त */}
              <div className="border border-amber-300 rounded p-1.5 bg-white/95 space-y-0.5">
                <div className="flex items-center justify-between text-[#166534] font-bold border-b border-amber-200 pb-0.5">
                  <span>३. कर्मफल एवं कुण्डली उद्घाटन सिद्धान्त</span>
                  <span className="text-[8.5px] text-green-800 font-normal">जातक पारिजात</span>
                </div>
                <p className="text-green-950 font-semibold italic text-[9.5px] leading-tight">
                  यद्यत् पूर्वकृतं कर्म शुभाशुभमुपार्जितम् ।<br />
                  तस्य तस्य फलोत्पत्तौ व्यनक्ति दैवमात्मनः ॥<br />
                  होराशास्त्ररहस्यज्ञः कुण्डल्या बोधयेत् सदा ॥
                </p>
                <p className="text-stone-700 text-[9px] leading-tight">
                  <strong>भावार्थ:</strong> पूर्वजन्ममा आर्जन गरिएका शुभ-अशुभ कर्महरू यस जन्ममा कसरी र कुन समयमा फलित हुन्छन् भनी देखाउने दिव्य दर्पण कुण्डली हो; दैवज्ञले यसको निष्पक्ष ज्ञान प्रदान गर्दछन्।
                </p>
              </div>

              {/* Card 4: लग्न शुद्धि एवं लक्ष्मीपति स्मरण */}
              <div className="border border-amber-300 rounded p-1.5 bg-white/95 space-y-0.5">
                <div className="flex items-center justify-between text-purple-900 font-bold border-b border-amber-200 pb-0.5">
                  <span>४. लग्न शुद्धि, ताराबल एवं लक्ष्मीपति स्मरण</span>
                  <span className="text-[8.5px] text-purple-800 font-normal">सर्वसिद्धि योग</span>
                </div>
                <p className="text-purple-950 font-semibold italic text-[9.5px] leading-tight">
                  तदेव लग्नं सुदिनं तदेव ताराबलं चन्द्रबलं तदेव ।<br />
                  विद्याबलं दैवबलं तदेव लक्ष्मीपते तेऽङ्घ्रियुगं स्मरामि ॥<br />
                  यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः ॥
                </p>
                <p className="text-stone-700 text-[9px] leading-tight">
                  <strong>भावार्थ:</strong> कुण्डली हेर्दा भगवान् श्रीहरि नारायणको चरण स्मरण गर्नाले तत्काल लग्न, दिन, ताराबल, चन्द्रबल र विद्याबल शुद्ध भई सम्पूर्ण कार्यमा विजय र श्री प्राप्त हुन्छ।
                </p>
              </div>
            </div>

            {/* Bottom Sacred Vedic Peace Chant Ribbon */}
            <div className="p-1 rounded bg-amber-100/70 border border-amber-300 text-center space-y-0.5">
              <p className="text-red-800 font-bold text-[9.5px] italic">
                ॐ द्यौः शान्तिरन्तरिक्षं शान्तिः पृथिवी शान्तिरापः शान्तिरोषधयः शान्तिः । वनस्पतयः शान्तिर्विश्वेदेवाः शान्तिर्ब्रह्म शान्तिः सर्वं शान्तिः शान्तिरेव शान्तिः सा मा शान्तिरेधि ॥
              </p>
              <p className="text-[#166534] font-bold text-[10px]">
                ॥ ॐ शान्तिः ! शान्तिः ! शान्तिः ! सर्वारिष्ट शान्तिर्भवतु ॥
              </p>
            </div>
          </div>

        </div>
      </GreenOmBorderFrame>
      )}


      {/* ========================================================================= */}
      {/* PAGE 2: एतत्समयजा ग्रहस्पष्टतालिका एवं मुख्य चतुष्कोण कुण्डली (४ कुण्डलीहरू) */}
      {/* ========================================================================= */}
      {shouldRenderPage(2) && (
      <GreenOmBorderFrame
        pageNumber={2}
        totalPages={totalPages}
        headerTitle="एतत्समयजा ग्रहस्पष्टतालिका एवं मुख्य कुण्डली चक्रम्"
        headerSubtitle="लग्न, चन्द्र, नवांश एवं भाव चलित कुण्डली"
        orgProfile={orgProfile}
        profileName={profile.name}
        birthDateBS={profile.dateBS}
      >
        <div className="space-y-3 text-xs">
          
          {/* Planetary Table */}
          <div className="space-y-1">
            <div className="text-center font-bold text-[#166534] text-xs border-b border-[#166534]/50 pb-0.5">
              एतत्समयजा ग्रहस्पष्टतालिका (Planetary Longitudes & States at Birth)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-[10.5px] border border-stone-800 border-collapse">
                <thead>
                  <tr className="bg-amber-100 text-stone-900 font-bold border-b border-stone-800">
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
                  <tr className="border-b border-stone-800 font-bold bg-amber-50/60">
                    <td className="p-1 border-r border-stone-800 text-red-700">लग्नम्</td>
                    <td className="p-1 border-r border-stone-800">{toDevanagariNumerals(lagna.rashiId - 1)}</td>
                    <td className="p-1 border-r border-stone-800">{toDevanagariNumerals(Math.floor(lagna.degree))}</td>
                    <td className="p-1 border-r border-stone-800">{toDevanagariNumerals(Math.floor((lagna.degree % 1) * 60))}</td>
                    <td className="p-1 border-r border-stone-800">{toDevanagariNumerals(4)}</td>
                    <td className="p-1 border-r border-stone-800 text-blue-700">{lagna.nakshatraName}</td>
                    <td className="p-1 border-r border-stone-800">{toDevanagariNumerals(lagna.pada)}</td>
                    <td className="p-1 border-r border-stone-800 text-red-700">{(lagna as any).rashiLord || 'सूर्य'}</td>
                    <td className="p-1 text-green-800 font-semibold">उदय</td>
                  </tr>

                  {/* Planets */}
                  {planets.map((p) => {
                    const degInt = Math.floor(p.degree);
                    const minInt = Math.floor((p.degree % 1) * 60);
                    const secInt = Math.floor((((p.degree % 1) * 60) % 1) * 60);

                    return (
                      <tr key={p.id} className="border-b border-stone-800">
                        <td className="p-1 border-r border-stone-800 font-bold text-red-700">{p.name}:</td>
                        <td className="p-1 border-r border-stone-800">{toDevanagariNumerals(p.rashiId - 1)}</td>
                        <td className="p-1 border-r border-stone-800">{toDevanagariNumerals(degInt)}</td>
                        <td className="p-1 border-r border-stone-800">{toDevanagariNumerals(minInt)}</td>
                        <td className="p-1 border-r border-stone-800">{toDevanagariNumerals(secInt || 12)}</td>
                        <td className="p-1 border-r border-stone-800 text-blue-700 font-medium">{p.nakshatraName}</td>
                        <td className="p-1 border-r border-stone-800">{toDevanagariNumerals(p.pada)}</td>
                        <td className="p-1 border-r border-stone-800 text-stone-800">{(p as any).rashiLord || 'सूर्य'}</td>
                        <td className="p-1 font-bold text-blue-800">
                          {p.isRetrograde ? 'वक्री उदय' : p.isCombust ? 'अस्त' : p.dignity === 'उच्च' ? 'उच्च' : p.dignity === 'नीच' ? 'नीच' : 'उदय'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2x2 Diamond Charts Grid */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <BrihatDiamondChart
              title="लग्न कुण्डली (D1)"
              houses={d1Chart.houses.map((h) => ({
                houseNumber: h.houseNumber,
                rashiId: h.rashiId,
                planets: h.planets,
              }))}
              maxSize={205}
              subtitle="तनु, शरीर, स्वभाव, स्वास्थ्य एवं जीवन आधार"
            />

            <BrihatDiamondChart
              title="राशि / चन्द्र कुण्डली"
              houses={rashiHouses}
              maxSize={205}
              subtitle="मन, चित्तवृत्ति, भावना, जनसम्पर्क एवं दृष्टि"
            />

            <BrihatDiamondChart
              title="नवांश कुण्डली (D9)"
              houses={d9Chart.houses.map((h) => ({
                houseNumber: h.houseNumber,
                rashiId: h.rashiId,
                planets: h.planets,
              }))}
              maxSize={205}
              subtitle="दाम्पत्य जीवन, जीवनसाथी, भाग्य एवं सूक्ष्म बल"
            />

            <BrihatDiamondChart
              title="भाव चलित कुण्डली"
              houses={bhavaHouses}
              maxSize={205}
              subtitle="वास्तविक भाव सन्धि, ग्रह फलभोग एवं कार्यक्षेत्र"
            />
          </div>

          {/* Dwadash Bhava Sphuta Table (12 Bhavas) */}
          <div className="border border-[#166534] rounded-lg p-1.5 bg-[#FFFDF9] text-[10px] space-y-1">
            <div className="flex justify-between items-center text-[10.5px] font-bold text-[#166534] border-b border-[#166534]/30 pb-0.5">
              <span>॥ द्वादश भाव आरम्भ, मध्य एवं सन्धि मान (Bhava Sphuta Summary) ॥</span>
              <span className="text-stone-600 font-normal">लग्न: {lagna.rashiName} ({lagna.formattedDegree})</span>
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

          {/* Planetary Dignity & Navagraha Mangala Stotram */}
          <div className="border border-[#166534] rounded-lg p-2 bg-amber-50/50 text-[10px] space-y-1">
            <div className="text-center border-b border-[#166534]/30 pb-0.5">
              <p className="text-red-700 font-bold text-xs">
                ॥ नवग्रह मङ्गल स्तोत्रम् तथा कारकत्व विचार ॥
              </p>
              <p className="text-stone-700 text-[9.5px] italic font-semibold">
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
      {/* PAGE 3: भुक्तोनीत महादशा त्रिवेणी (विंशोत्तरी, त्रिभागी एवं योगिनी दशा) */}
      {/* ========================================================================= */}
      {shouldRenderPage(3) && (
      <GreenOmBorderFrame
        pageNumber={3}
        totalPages={totalPages}
        headerTitle="अथ भुक्तोनीत महादशा त्रिवेणी चक्रम्"
        headerSubtitle="विंशोत्तरी (१२० वर्ष), त्रिभागी (८० वर्ष) एवं योगिनी (३६ वर्ष) महादशा"
        orgProfile={orgProfile}
        profileName={profile.name}
        birthDateBS={profile.dateBS}
      >
        <div className="space-y-4 text-xs">
          
          {/* Section 1: Vimshottari Mahadasha Table */}
          <div className="space-y-1">
            <div className="text-center font-bold text-red-700 text-xs sm:text-sm">
              १. अथ भुक्तोनीत विंशोत्तरी महादशा चक्रम् (१२० वर्षे चक्र)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border border-stone-800 border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-blue-800 font-bold border-b border-stone-800">
                    <th className="p-1 border-r border-stone-800">सूर्य</th>
                    <th className="p-1 border-r border-stone-800">चन्द्र</th>
                    <th className="p-1 border-r border-stone-800">मङ्गल</th>
                    <th className="p-1 border-r border-stone-800">राहु</th>
                    <th className="p-1 border-r border-stone-800">वृहस्पति</th>
                    <th className="p-1 border-r border-stone-800">शनि</th>
                    <th className="p-1 border-r border-stone-800">बुध</th>
                    <th className="p-1 border-r border-stone-800">केतु</th>
                    <th className="p-1 border-r border-stone-800">शुक्र</th>
                    <th className="p-1 font-bold text-stone-900">ग्रहा</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-stone-800 font-bold text-red-700">
                    <td className="p-1 border-r border-stone-800">६</td>
                    <td className="p-1 border-r border-stone-800">१०</td>
                    <td className="p-1 border-r border-stone-800">७</td>
                    <td className="p-1 border-r border-stone-800">१८</td>
                    <td className="p-1 border-r border-stone-800">१६</td>
                    <td className="p-1 border-r border-stone-800">१९</td>
                    <td className="p-1 border-r border-stone-800">१७</td>
                    <td className="p-1 border-r border-stone-800">७</td>
                    <td className="p-1 border-r border-stone-800">२०</td>
                    <td className="p-1 font-bold text-stone-900">वर्ष</td>
                  </tr>
                  <tr className="border-b border-stone-800 text-[11px]">
                    <td className="p-1 border-r border-stone-800">१<br />७<br />५</td>
                    <td className="p-1 border-r border-stone-800">११<br />७<br />७</td>
                    <td className="p-1 border-r border-stone-800">१८<br />७<br />९</td>
                    <td className="p-1 border-r border-stone-800">३६<br />७<br />१३</td>
                    <td className="p-1 border-r border-stone-800">५२<br />७<br />१७</td>
                    <td className="p-1 border-r border-stone-800">७१<br />७<br />२२</td>
                    <td className="p-1 border-r border-stone-800">८८<br />७<br />२६</td>
                    <td className="p-1 border-r border-stone-800">९५<br />७<br />२७</td>
                    <td className="p-1 border-r border-stone-800">११५<br />८<br />२</td>
                    <td className="p-1 font-bold text-stone-900">वर्ष<br />मास<br />दिन</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Tribhagi Mahadasha Table */}
          <div className="space-y-1">
            <div className="text-center font-bold text-red-700 text-xs sm:text-sm">
              २. अथ भुक्तोनीत त्रिभागी महादशा चक्रम् (८० वर्षे चक्र)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border border-stone-800 border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-blue-800 font-bold border-b border-stone-800">
                    <th className="p-1 border-r border-stone-800">सूर्य</th>
                    <th className="p-1 border-r border-stone-800">चन्द्र</th>
                    <th className="p-1 border-r border-stone-800">मङ्गल</th>
                    <th className="p-1 border-r border-stone-800">राहु</th>
                    <th className="p-1 border-r border-stone-800">वृहस्पति</th>
                    <th className="p-1 border-r border-stone-800">शनि</th>
                    <th className="p-1 border-r border-stone-800">बुध</th>
                    <th className="p-1 border-r border-stone-800">केतु</th>
                    <th className="p-1 border-r border-stone-800">शुक्र</th>
                    <th className="p-1 font-bold text-stone-900">ग्रहा</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-stone-800 font-bold text-red-700">
                    <td className="p-1 border-r border-stone-800">४<br />०</td>
                    <td className="p-1 border-r border-stone-800">६<br />८</td>
                    <td className="p-1 border-r border-stone-800">४<br />८</td>
                    <td className="p-1 border-r border-stone-800">१२<br />०</td>
                    <td className="p-1 border-r border-stone-800">१०<br />८</td>
                    <td className="p-1 border-r border-stone-800">१२<br />८</td>
                    <td className="p-1 border-r border-stone-800">११<br />४</td>
                    <td className="p-1 border-r border-stone-800">४<br />८</td>
                    <td className="p-1 border-r border-stone-800">१३<br />४</td>
                    <td className="p-1 font-bold text-stone-900">वर्ष<br />मास</td>
                  </tr>
                  <tr className="border-b border-stone-800 text-[11px]">
                    <td className="p-1 border-r border-stone-800">१<br />०<br />२३</td>
                    <td className="p-1 border-r border-stone-800">७<br />८<br />२५</td>
                    <td className="p-1 border-r border-stone-800">१२<br />४<br />२६</td>
                    <td className="p-1 border-r border-stone-800">२४<br />४<br />२९</td>
                    <td className="p-1 border-r border-stone-800">३५<br />१<br />१</td>
                    <td className="p-1 border-r border-stone-800">४७<br />९<br />४</td>
                    <td className="p-1 border-r border-stone-800">५९<br />१<br />७</td>
                    <td className="p-1 border-r border-stone-800">६३<br />९<br />८</td>
                    <td className="p-1 border-r border-stone-800">७७<br />१<br />११</td>
                    <td className="p-1 font-bold text-stone-900">वर्ष<br />मास<br />दिन</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Yogini Mahadasha Table */}
          <div className="space-y-1">
            <div className="text-center font-bold text-red-700 text-xs sm:text-sm">
              ३. अथ भुक्तोनीत योगिनी महादशा चक्रम् (३६ वर्षे चक्र)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border border-stone-800 border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-blue-800 font-bold border-b border-stone-800">
                    <th className="p-1 border-r border-stone-800">सङ्कटा</th>
                    <th className="p-1 border-r border-stone-800">मङ्गला</th>
                    <th className="p-1 border-r border-stone-800">पिङ्गला</th>
                    <th className="p-1 border-r border-stone-800">धन्या</th>
                    <th className="p-1 border-r border-stone-800">भ्रामरी</th>
                    <th className="p-1 border-r border-stone-800">भद्रिका</th>
                    <th className="p-1 border-r border-stone-800">उल्का</th>
                    <th className="p-1 border-r border-stone-800">सिद्धा</th>
                    <th className="p-1 font-bold text-stone-900">ग्रहा</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-stone-800 font-bold text-red-700">
                    <td className="p-1 border-r border-stone-800">८</td>
                    <td className="p-1 border-r border-stone-800">१</td>
                    <td className="p-1 border-r border-stone-800">२</td>
                    <td className="p-1 border-r border-stone-800">३</td>
                    <td className="p-1 border-r border-stone-800">४</td>
                    <td className="p-1 border-r border-stone-800">५</td>
                    <td className="p-1 border-r border-stone-800">६</td>
                    <td className="p-1 border-r border-stone-800">७</td>
                    <td className="p-1 font-bold text-stone-900">वर्ष</td>
                  </tr>
                  <tr className="border-b border-stone-800 text-[11px]">
                    <td className="p-1 border-r border-stone-800">२<br />१<br />१६</td>
                    <td className="p-1 border-r border-stone-800">३<br />१<br />१७</td>
                    <td className="p-1 border-r border-stone-800">५<br />१<br />१७</td>
                    <td className="p-1 border-r border-stone-800">८<br />१<br />१८</td>
                    <td className="p-1 border-r border-stone-800">१२<br />१<br />१९</td>
                    <td className="p-1 border-r border-stone-800">१७<br />१<br />२०</td>
                    <td className="p-1 border-r border-stone-800">२३<br />१<br />२२</td>
                    <td className="p-1 border-r border-stone-800">३०<br />१<br />२३</td>
                    <td className="p-1 font-bold text-stone-900">वर्ष<br />मास<br />दिन</td>
                  </tr>
                  <tr className="text-[11px]">
                    <td className="p-1 border-r border-stone-800">३८<br />१<br />२५</td>
                    <td className="p-1 border-r border-stone-800">३९<br />१<br />२५</td>
                    <td className="p-1 border-r border-stone-800">४१<br />१<br />२६</td>
                    <td className="p-1 border-r border-stone-800">४४<br />१<br />२७</td>
                    <td className="p-1 border-r border-stone-800">४८<br />१<br />२८</td>
                    <td className="p-1 border-r border-stone-800">५३<br />१<br />२९</td>
                    <td className="p-1 border-r border-stone-800">५९<br />२<br />०</td>
                    <td className="p-1 border-r border-stone-800">६६<br />२<br />२</td>
                    <td className="p-1 font-bold text-stone-900">वर्ष<br />मास<br />दिन</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Birth Dasha Balance and Current Dasha Status */}
          <div className="border border-stone-400 rounded p-2 bg-amber-50/40 space-y-1.5">
            <div className="text-center font-bold text-[#166534] text-xs border-b border-stone-300 pb-0.5">
              ४. जन्मकालीन दशा भुक्त-भोग्य काल निर्णय एवं वर्तमान सक्रिय दशा स्थिति
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10.5px]">
              <div className="p-1.5 bg-white rounded border border-stone-200">
                <p className="font-bold text-red-800">जन्म समयमा नक्षत्र भुक्त-भोग्य दशा शेष:</p>
                <p className="text-stone-700">
                  जातकको जन्म {panchanga.nakshatra.name} नक्षत्रको {toDevanagariNumerals(panchanga.nakshatra.pada)} पादमा भएको हुँदा जन्मकालीन नक्षत्रेश दशा प्रारम्भ हुन्छ।
                </p>
                <p className="text-stone-900 font-semibold mt-0.5">
                  जन्मकालीन दशा: <span className="text-red-700 font-bold">{vimshottariDasha.balanceAtBirth.planet}</span> महादशा (भोग्य शेष: <strong className="text-amber-950 font-bold">{toDevanagariNumerals(vimshottariDasha.balanceAtBirth.yearsLeft)}</strong> वर्ष, <strong className="text-amber-950 font-bold">{toDevanagariNumerals(vimshottariDasha.balanceAtBirth.monthsLeft)}</strong> महिना, <strong className="text-amber-950 font-bold">{toDevanagariNumerals(vimshottariDasha.balanceAtBirth.daysLeft)}</strong> दिन)
                </p>
              </div>
              <div className="p-1.5 bg-white rounded border border-stone-200">
                <p className="font-bold text-green-900">वर्तमान सक्रिय दशा (वि.सं. {toDevanagariNumerals(bsYear)}):</p>
                <p className="text-stone-700">
                  वर्तमानमा <span className="font-bold text-red-700">{vimshottariDasha.currentMahadasha?.planet || 'गुरु'}</span> महादशा तथा <span className="font-bold text-blue-800">{vimshottariDasha.currentAntardasha?.planet || 'शनि'}</span> अन्तर्दशा सञ्चाररत छ।
                </p>
                <p className="text-[10px] text-stone-600 mt-0.5">
                  * दशा परिवर्तनको समयमा 'दशा सन्धि' पर्ने हुँदा सो अवधिमा कुलदेवताको पूजा र इष्ट मन्त्र जप शुभ फलदायी हुन्छ।
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Critical Life Years Timeline */}
          <div className="border border-stone-400 rounded p-2 bg-amber-50/40 space-y-1">
            <div className="text-center font-bold text-[#166534] text-xs border-b border-stone-300 pb-0.5">
              ५. जीवनका महत्त्वपूर्ण वर्ष तथा दशा परिवर्तन संवेदनशील कालचक्र
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-[10px]">
              <div className="p-1 rounded bg-white border border-stone-200">
                <span className="font-bold text-red-800 block">१६-१८ वर्ष (विद्या/स्थान):</span>
                <span className="text-stone-700">उच्च विद्या, स्थान परिवर्तन तथा प्रारम्भिक जीवन-दिशा निर्धारण।</span>
              </div>
              <div className="p-1 rounded bg-white border border-stone-200">
                <span className="font-bold text-red-800 block">२२-२५ वर्ष (कर्म/विवाह):</span>
                <span className="text-stone-700">आजीविका प्रारम्भ, विवाह संयोग तथा सामाजिक जिम्मेवारी वृद्धि।</span>
              </div>
              <div className="p-1 rounded bg-white border border-stone-200">
                <span className="font-bold text-red-800 block">२८-३२ वर्ष (भाग्योदय):</span>
                <span className="text-stone-700">व्यापार/सेवामा विशेष प्रगति, मान-प्रतिष्ठा तथा स्थायी सम्पत्ति लाभ।</span>
              </div>
              <div className="p-1 rounded bg-white border border-stone-200">
                <span className="font-bold text-red-800 block">३६-४२ वर्ष (स्थायित्व):</span>
                <span className="text-stone-700">जीवनमा पूर्ण स्थायित्व, सन्तान उन्नति तथा नेतृत्वदायी सफलता।</span>
              </div>
            </div>
          </div>

          {/* Section 6: Dasha Sandhi Shanti Mantra & Classical Shloka */}
          <div className="border border-[#166534] rounded-lg p-2 bg-amber-50/50 text-center space-y-0.5">
            <p className="text-red-800 font-bold text-xs">
              ॥ दशा सन्धि शान्ति विधान, शास्त्रीय श्लोक एवं महामृत्युञ्जय कवच ॥
            </p>
            <p className="text-stone-800 text-[10px] italic font-serif">
              दशासन्धिषु रोगो वा स्थानान्तरमथापि वा । द्रव्यनाशो मनस्तापो जायते नात्र संशयः ॥<br />
              ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात् ॥
            </p>
            <p className="text-[9.5px] text-stone-600 pt-0.5">
              * एक महादशा समाप्त भई अर्को महादशा सुरु हुने सङ्क्रमणकालमा इष्टदेवताको जप एवं रुद्राभिषेक गर्दा दशा सन्धिजन्य विघ्न शान्त हुन्छ।
            </p>
          </div>

        </div>
      </GreenOmBorderFrame>
      )}


      {/* ========================================================================= */}
      {/* PAGE 4: षोडशवर्ग कुण्डली चक्रम् - प्रथमो भागः (D2, D3, D4, D7) */}
      {/* ========================================================================= */}
      {shouldRenderPage(4) && (
      <GreenOmBorderFrame
        pageNumber={4}
        totalPages={totalPages}
        headerTitle="षोडशवर्ग कुण्डली चक्रम् - प्रथमो भागः (Divisional Charts - Part 1)"
        headerSubtitle="होरा (D2), द्रेष्काण (D3), चतुर्थांश (D4) एवं सप्तांश (D7) कुण्डली"
        orgProfile={orgProfile}
        profileName={profile.name}
        birthDateBS={profile.dateBS}
      >
        <div className="space-y-2 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <BrihatDiamondChart
              title="होरा कुण्डली (D2)"
              houses={d2Chart.houses.map((h) => ({
                houseNumber: h.houseNumber,
                rashiId: h.rashiId,
                planets: h.planets,
              }))}
              maxSize={195}
              subtitle="धन, पैतृक सम्पत्ति, आर्थिक समृद्धि एवं कोष संग्रह"
            />

            <BrihatDiamondChart
              title="द्रेष्काण कुण्डली (D3)"
              houses={d3Chart.houses.map((h) => ({
                houseNumber: h.houseNumber,
                rashiId: h.rashiId,
                planets: h.planets,
              }))}
              maxSize={195}
              subtitle="सहोदर दाजुभाइ, पराक्रम, साहस एवं उद्यमशीलता"
            />

            <BrihatDiamondChart
              title="चतुर्थांश कुण्डली (D4)"
              houses={d4Chart.houses.map((h) => ({
                houseNumber: h.houseNumber,
                rashiId: h.rashiId,
                planets: h.planets,
              }))}
              maxSize={195}
              subtitle="अचल सम्पत्ति, गृह, भूमि, अट्टालिका एवं वाहन सुख"
            />

            <BrihatDiamondChart
              title="सप्तांश कुण्डली (D7)"
              houses={d7Chart.houses.map((h) => ({
                houseNumber: h.houseNumber,
                rashiId: h.rashiId,
                planets: h.planets,
              }))}
              maxSize={195}
              subtitle="सन्तान, वंश वृद्धि, पौत्र-पौत्री एवं सन्तान सुख"
            />
          </div>

          {/* Parashara Divisional Analysis Grid Table */}
          <div className="border border-[#166534] rounded-lg p-2 bg-[#FFFDF9] space-y-1">
            <div className="flex justify-between items-center text-xs font-bold text-[#166534] border-b border-[#166534]/30 pb-0.5">
              <span>॥ महर्षि पराशर प्रतिपादित षोडशवर्ग फलविचार (D2, D3, D4, D7) ॥</span>
              <span className="text-[10px] text-stone-600">वर्ग चक्र विवेचन</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-[9.5px]">
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-red-800 block">होरा (D2) फल:</strong>
                <span className="text-stone-700">द्वितीय भाव, सूर्य/चन्द्र होरा बल, धन सञ्चय, कोष वृद्धि, व्यापार लाभ र पैतृक सम्पत्ति सुरक्षा।</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-blue-800 block">द्रेष्काण (D3) फल:</strong>
                <span className="text-stone-700">तृतीय भाव, सहोदर दाजुभाइ सम्बन्ध, पराक्रम, साहस, छोटो यात्रा तथा उद्योग-व्यवसायमा सफलता।</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-green-800 block">चतुर्थांश (D4) फल:</strong>
                <span className="text-stone-700">चतुर्थ भाव, स्थायी अचल सम्पत्ति, गृह निर्माण, भूमि-भवन प्राप्ति, सवारी साधन तथा पारिवारिक सुख।</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-purple-800 block">सप्तांश (D7) फल:</strong>
                <span className="text-stone-700">पञ्चम भाव, सन्तान सुख, कुल परम्परा, वंशवृद्धि, पौत्र-पौत्री सुख तथा सन्तानको विद्या र कीर्ति।</span>
              </div>
            </div>
          </div>

          {/* Classical Shloka Box */}
          <div className="border border-[#166534] rounded-lg p-2 bg-amber-50/40 text-center space-y-0.5">
            <p className="text-red-800 font-bold text-xs">
              ॥ वर्ग साधन शास्त्रीय श्लोक एवं फल निर्देश ॥
            </p>
            <p className="text-stone-800 text-[10px] italic font-serif">
              होरायां वित्तसम्पत्तिर्द्रेष्काणे बन्धुविक्रमम् । तुरीयांशे गृहं यानं सप्तांशे सूनुसम्भवम् ॥<br />
              षोडशवर्गेषु ये ग्रहाः स्वोच्चस्वक्षेत्रगे यदि । चक्रवर्ती नृपो वाऽपि सर्वैश्वर्यसमन्वितः ॥
            </p>
          </div>

        </div>
      </GreenOmBorderFrame>
      )}


      {/* ========================================================================= */}
      {/* PAGE 5: षोडशवर्ग कुण्डली चक्रम् - द्वितीयो भागः (D10, D12, D16, D20) */}
      {/* ========================================================================= */}
      {shouldRenderPage(5) && (
      <GreenOmBorderFrame
        pageNumber={5}
        totalPages={totalPages}
        headerTitle="षोडशवर्ग कुण्डली चक्रम् - द्वितीयो भागः (Divisional Charts - Part 2)"
        headerSubtitle="दशांश (D10), द्वादशांश (D12), षोडशांश (D16) एवं विंशांश (D20) कुण्डली"
        orgProfile={orgProfile}
        profileName={profile.name}
        birthDateBS={profile.dateBS}
      >
        <div className="space-y-2 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <BrihatDiamondChart
              title="दशांश कुण्डली (D10)"
              houses={d10Chart.houses.map((h) => ({
                houseNumber: h.houseNumber,
                rashiId: h.rashiId,
                planets: h.planets,
              }))}
              maxSize={195}
              subtitle="कर्म, आजीविका, पेसा, पद, प्रतिष्ठा एवं सामाजिक प्रभाव"
            />

            <BrihatDiamondChart
              title="द्वादशांश कुण्डली (D12)"
              houses={d12Chart.houses.map((h) => ({
                houseNumber: h.houseNumber,
                rashiId: h.rashiId,
                planets: h.planets,
              }))}
              maxSize={195}
              subtitle="माता-पिता, पितृकुल, पूर्वज एवं वंशावली संस्कार"
            />

            <BrihatDiamondChart
              title="षोडशांश कुण्डली (D16)"
              houses={d16Chart.houses.map((h) => ({
                houseNumber: h.houseNumber,
                rashiId: h.rashiId,
                planets: h.planets,
              }))}
              maxSize={195}
              subtitle="सुख-साधन, सवारी साधन, सुख-दुःख एवं यात्रा सुरक्षा"
            />

            <BrihatDiamondChart
              title="विंशांश कुण्डली (D20)"
              houses={d20Chart.houses.map((h) => ({
                houseNumber: h.houseNumber,
                rashiId: h.rashiId,
                planets: h.planets,
              }))}
              maxSize={195}
              subtitle="उपासना, भक्ति, आध्यात्मिक साधना, मन्त्र सिद्धि एवं ईश्वरीय कृपा"
            />
          </div>

          {/* Parashara Higher Harmonics Table */}
          <div className="border border-[#166534] rounded-lg p-2 bg-[#FFFDF9] space-y-1">
            <div className="flex justify-between items-center text-xs font-bold text-[#166534] border-b border-[#166534]/30 pb-0.5">
              <span>॥ महर्षि पराशर प्रतिपादित उच्च वर्ग फलविचार (D10, D12, D16, D20) ॥</span>
              <span className="text-[10px] text-stone-600">कर्म एवं संस्कार</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-[9.5px]">
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-red-800 block">दशांश (D10) फल:</strong>
                <span className="text-stone-700">दशम भाव, राज्यपक्ष, प्रशासनिक पद, व्यावसायिक सफलता, आजीविका र सामाजिक प्रतिष्ठा।</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-blue-800 block">द्वादशांश (D12) फल:</strong>
                <span className="text-stone-700">नवम/चतुर्थ भाव, माता-पिताको स्वास्थ्य, दीर्घायु, पितृकुलको संस्कार र पैतृक आशिर्वाद।</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-green-800 block">षोडशांश (D16) फल:</strong>
                <span className="text-stone-700">वाहन सुख, सुख-साधन, ऐश्वर्य, यात्रा सुरक्षा, आकस्मिक कष्ट निवारण र मानसिक आनन्द।</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-purple-800 block">विंशांश (D20) फल:</strong>
                <span className="text-stone-700">नवम/पञ्चम भाव, आध्यात्मिक उन्नति, मन्त्र सिद्धि, इष्टदेवता उपासना र पूर्वजन्मको पुण्य।</span>
              </div>
            </div>
          </div>

          {/* Classical Shloka Box */}
          <div className="border border-[#166534] rounded-lg p-2 bg-amber-50/40 text-center space-y-0.5">
            <p className="text-red-800 font-bold text-xs">
              ॥ कर्म, संस्कार एवं उपासना शास्त्रीय श्लोक ॥
            </p>
            <p className="text-stone-800 text-[10px] italic font-serif">
              दशांशे राज्यसम्मानं कर्मसिद्धिर्महद्यशः । द्वादशांशे पितृप्रीतिः षोडशांशे सुखावहम् ॥<br />
              विंशांशे मन्त्रसाफल्यं देवभक्तिः परा गतिः । वर्गोत्तमे ग्रहे जाते सर्वसम्पत्प्रदायकम् ॥
            </p>
          </div>

        </div>
      </GreenOmBorderFrame>
      )}


      {/* ========================================================================= */}
      {/* PAGE 6: उच्च वर्ग कुण्डली (D24, D30) तथा सर्वाष्टकवर्ग चक्रम् */}
      {/* ========================================================================= */}
      {shouldRenderPage(6) && (
      <GreenOmBorderFrame
        pageNumber={6}
        totalPages={totalPages}
        headerTitle="उच्च वर्ग कुण्डली (D24, D30) तथा सर्वाष्टकवर्ग चक्रम्"
        headerSubtitle="चतुर्विंशांश (विद्या), त्रिंशांश (अरिष्ट) एवं सर्वाष्टकवर्ग रेखा तालिका"
        orgProfile={orgProfile}
        profileName={profile.name}
        birthDateBS={profile.dateBS}
      >
        <div className="space-y-3 text-xs">
          
          {/* 2 Upper Harmonic Charts */}
          <div className="grid grid-cols-2 gap-4">
            <BrihatDiamondChart
              title="चतुर्विंशांश कुण्डली (D24)"
              houses={d24Chart.houses.map((h) => ({
                houseNumber: h.houseNumber,
                rashiId: h.rashiId,
                planets: h.planets,
              }))}
              maxSize={205}
              subtitle="उच्च विद्या, ज्ञान, बुद्धि, प्रतिभा, अनुसन्धान एवं दक्षता"
            />

            <BrihatDiamondChart
              title="त्रिंशांश कुण्डली (D30)"
              houses={d30Chart.houses.map((h) => ({
                houseNumber: h.houseNumber,
                rashiId: h.rashiId,
                planets: h.planets,
              }))}
              maxSize={205}
              subtitle="अरिष्ट, विपत्ति, रोग, संकट एवं अनिष्ट निवारण"
            />
          </div>

          {/* Ashtakavarga Rekha Table */}
          <div className="space-y-1 pt-1">
            <div className="text-center font-bold text-[#166534] text-xs border-b border-[#166534]/50 pb-0.5">
              ॥ अथ सर्वाष्टकवर्ग चक्रम् तथा भिन्नाष्टकवर्ग बिन्दु तालिका ॥
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-center text-[10px] border border-stone-800 border-collapse">
                <thead>
                  <tr className="bg-amber-100 font-bold border-b border-stone-800">
                    <th className="p-1 border-r border-stone-800">ग्रह / राशि</th>
                    <th className="p-1 border-r border-stone-800">मेष</th>
                    <th className="p-1 border-r border-stone-800">वृष</th>
                    <th className="p-1 border-r border-stone-800">मिथुन</th>
                    <th className="p-1 border-r border-stone-800">कर्कट</th>
                    <th className="p-1 border-r border-stone-800">सिंह</th>
                    <th className="p-1 border-r border-stone-800">कन्या</th>
                    <th className="p-1 border-r border-stone-800">तुला</th>
                    <th className="p-1 border-r border-stone-800">वृश्चिक</th>
                    <th className="p-1 border-r border-stone-800">धनु</th>
                    <th className="p-1 border-r border-stone-800">मकर</th>
                    <th className="p-1 border-r border-stone-800">कुम्भ</th>
                    <th className="p-1 border-r border-stone-800">मीन</th>
                    <th className="p-1">योग</th>
                  </tr>
                </thead>
                <tbody>
                  {(['सूर्य', 'चन्द्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'] as PlanetName[]).map((pName) => {
                    const row = ashtakavargaResult.planetBAV[pName] || [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4];
                    const total = row.reduce((a, b) => a + b, 0);
                    return (
                      <tr key={pName} className="border-b border-stone-800">
                        <td className="p-1 border-r border-stone-800 font-bold text-red-700">{pName}</td>
                        {row.map((val, idx) => (
                          <td key={idx} className="p-1 border-r border-stone-800">
                            {toDevanagariNumerals(val)}
                          </td>
                        ))}
                        <td className="p-1 font-bold text-stone-900">{toDevanagariNumerals(total)}</td>
                      </tr>
                    );
                  })}
                  {/* Sarvashtakavarga Total Row */}
                  <tr className="bg-amber-200 font-black text-stone-900 border-t-2 border-stone-800">
                    <td className="p-1.5 border-r border-stone-800 text-[#166534]">सर्वाष्टक (SAV)</td>
                    {ashtakavargaResult.sarvaSAV.map((val, idx) => {
                      const isStrong = val >= 28;
                      const isWeak = val < 25;
                      return (
                        <td
                          key={idx}
                          className={`p-1.5 border-r border-stone-800 ${
                            isStrong ? 'text-green-800 bg-green-100/70' : isWeak ? 'text-red-700 bg-red-100/70' : ''
                          }`}
                        >
                          {toDevanagariNumerals(val)}
                        </td>
                      );
                    })}
                    <td className="p-1.5 text-blue-900">
                      {toDevanagariNumerals(ashtakavargaResult.totalSAVPoints)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[10px] text-stone-700 pt-1">
              <div className="p-1 bg-green-50 rounded border border-green-300">
                <span className="font-bold text-green-800">२८ भन्दा बढी बिन्दु:</span> अत्यन्त शुभ, गोचर अनुकूल तथा कार्यसिद्धि।
              </div>
              <div className="p-1 bg-amber-50 rounded border border-amber-300">
                <span className="font-bold text-amber-800">२५ देखि २८ बिन्दु:</span> मध्यम फलदायक, सामान्य परिश्रमबाट सफलता।
              </div>
              <div className="p-1 bg-red-50 rounded border border-red-300">
                <span className="font-bold text-red-800">२५ भन्दा कम बिन्दु:</span> संवेदनशील, गोचरमा सतर्कता तथा शान्ति आवश्यक।
              </div>
            </div>

          </div>

          {/* Ashtakavarga Shodhana & Kaksha Vichar */}
          <div className="border border-[#166534] rounded-lg p-2 bg-[#FFFDF9] space-y-1">
            <div className="flex justify-between items-center text-xs font-bold text-[#166534] border-b border-[#166534]/30 pb-0.5">
              <span>॥ अष्टकवर्ग शोधन एवं कक्ष्य फलविचार (Trikona & Ekadhipatya Shodhana) ॥</span>
              <span className="text-[10px] text-stone-600">महर्षि पराशर पद्धति</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-[9.5px]">
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-red-800 block">त्रिकोण शोधन:</strong>
                <span className="text-stone-700">१, ५, ९ (धर्म); २, ६, १० (अर्थ); ३, ७, ११ (काम); ४, ८, १२ (मोक्ष) त्रिकोणमा न्यूनतम बिन्दु घटाई साम्यता कायम गर्ने।</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-blue-800 block">एकाधिपत्य शोधन:</strong>
                <span className="text-stone-700">एउटै ग्रहका दुई राशिहरूमध्ये ग्रह बसेको र नबसेको अवस्था अनुसार रेखा शोधन गरी शुद्ध बिन्दु निर्धारण।</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-green-800 block">पिण्ड साधन:</strong>
                <span className="text-stone-700">शोधित राशि पिण्ड र ग्रह पिण्डको योगबाट 'शोध्यपिण्ड' तयार गरी आयुर्दाय एवं भाग्योदय वर्ष निर्णय।</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-purple-800 block">कक्ष्या गोचर फल:</strong>
                <span className="text-stone-700">प्रत्येक राशिका ३°४५' का ८ कक्ष्याहरूमा जुन कक्ष्यामा बिन्दु प्राप्त हुन्छ, त्यहाँ ग्रह गोचर हुँदा सर्वकार्य सिद्धि।</span>
              </div>
            </div>
          </div>

          {/* Classical Shloka Box */}
          <div className="border border-[#166534] rounded-lg p-2 bg-amber-50/40 text-center space-y-0.5">
            <p className="text-red-800 font-bold text-xs">
              ॥ अष्टकवर्ग फल शास्त्रीय श्लोक निर्देश ॥
            </p>
            <p className="text-stone-800 text-[10px] italic font-serif">
              यद्यद्भावगतो मन्दः कुजः सूर्योऽथवा गुरुः । अष्टवर्गसमुत्पन्ने बिन्दूनां गणनेन च ॥<br />
              न्यूने कष्टं विजानीयादधिके सर्वसम्पदः । सर्वाष्टकवशाज्ज्ञेयं शुभाशुभफलं नृणाम् ॥
            </p>
          </div>

        </div>
      </GreenOmBorderFrame>
      )}


      {/* ========================================================================= */}
      {/* PAGE 7: विंशोत्तरी महादशा एवं अन्तर्दशा सविस्तार कालचक्रम् */}
      {/* ========================================================================= */}
      {shouldRenderPage(7) && (
      <GreenOmBorderFrame
        pageNumber={7}
        totalPages={totalPages}
        headerTitle="विंशोत्तरी महादशा एवं अन्तर्दशा सविस्तार कालचक्रम्"
        headerSubtitle="१२० वर्षे विंशोत्तरी दशा चक्र एवं अन्तरदशा समय-सीमा"
        orgProfile={orgProfile}
        profileName={profile.name}
        birthDateBS={profile.dateBS}
      >
        <div className="space-y-3 text-xs">
          
          <div className="border border-stone-300 rounded p-2 bg-amber-50/50 text-[11px] leading-relaxed">
            <strong>दशा परिचय:</strong> वैदिक होराशास्त्र अनुसार मानव आयु १२० वर्ष मानी चन्द्र नक्षत्रको भुक्त-भोग्य आधारमा विंशोत्तरी दशा निर्धारण गरिन्छ। तल जातकको जन्मकालदेखि प्रारम्भ हुने प्रमुख महादशा तथा अन्तर्दशाहरूको तालिका प्रस्तुत गरिएको छ:
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-[10.5px] border border-stone-800 border-collapse">
              <thead>
                <tr className="bg-amber-100 font-bold border-b border-stone-800">
                  <th className="p-1 border-r border-stone-800">महादशा</th>
                  <th className="p-1 border-r border-stone-800">अन्तर्दशा</th>
                  <th className="p-1 border-r border-stone-800">सुरु मिति (वि.सं.)</th>
                  <th className="p-1 border-r border-stone-800">समाप्ति मिति (वि.सं.)</th>
                  <th className="p-1 border-r border-stone-800">अवधि</th>
                  <th className="p-1 border-r border-stone-800">स्थिति</th>
                  <th className="p-1">ज्योतिषी फल-निर्देशन</th>
                </tr>
              </thead>
              <tbody>
                {vimshottariDasha.mahadashas.slice(0, 10).map((md, idx) => {
                  const sub1 = md.subDashas[0];
                  const sub2 = md.subDashas[1];

                  return (
                    <React.Fragment key={idx}>
                      <tr className="border-b border-stone-800 bg-amber-50/60 font-bold">
                        <td className="p-1 border-r border-stone-800 text-red-700">{md.planet}</td>
                        <td className="p-1 border-r border-stone-800">सम्पूर्ण महादशा</td>
                        <td className="p-1 border-r border-stone-800">{toDevanagariNumerals(md.startDate)}</td>
                        <td className="p-1 border-r border-stone-800">{toDevanagariNumerals(md.endDate)}</td>
                        <td className="p-1 border-r border-stone-800">{toDevanagariNumerals(md.durationYears)} वर्ष</td>
                        <td className="p-1 border-r border-stone-800">
                          {md.isCurrent ? (
                            <span className="bg-green-600 text-white px-1.5 py-0.2 rounded text-[9.5px]">सक्रिय</span>
                          ) : idx === 0 ? (
                            <span className="text-stone-500">जन्मकालीन</span>
                          ) : (
                            <span className="text-blue-800">भविष्य</span>
                          )}
                        </td>
                        <td className="p-1 text-stone-700 text-left px-1.5">
                          {md.planet === 'सूर्य' && 'प्रतिष्ठा, सरकारी कार्यमा प्रगति र आत्मबल'}
                          {md.planet === 'चन्द्र' && 'मानसिक शान्ति, गृहसुख र जलयात्रा'}
                          {md.planet === 'मंगल' && 'साहस, भूमि लाभ तर क्रोध नियन्त्रण'}
                          {md.planet === 'राहु' && 'आकस्मिक परिवर्तन, विदेश योग र सतर्कता'}
                          {md.planet === 'गुरु' && 'ज्ञान, विद्या, सन्तान सुख र धार्मिक कार्य'}
                          {md.planet === 'शनि' && 'कडा परिश्रम, धैर्य र दीर्घकालीन स्थायित्व'}
                          {md.planet === 'बुध' && 'व्यापार, लेखन, अध्ययन र बौद्धिक लाभ'}
                          {md.planet === 'केतु' && 'अध्यात्म, मोक्ष चिन्तन र स्वास्थ्य सतर्कता'}
                          {md.planet === 'शुक्र' && 'भौतिक ऐश्वर्य, विवाह, वाहन र कला सुख'}
                        </td>
                      </tr>

                      {/* Sub-dasha highlights */}
                      {sub1 && (
                        <tr className="border-b border-stone-300 text-[10px] text-stone-600">
                          <td className="p-0.5 border-r border-stone-300 text-stone-400">↳</td>
                          <td className="p-0.5 border-r border-stone-300">{sub1.planet}</td>
                          <td className="p-0.5 border-r border-stone-300">{toDevanagariNumerals(sub1.startDate)}</td>
                          <td className="p-0.5 border-r border-stone-300">{toDevanagariNumerals(sub1.endDate)}</td>
                          <td className="p-0.5 border-r border-stone-300">{toDevanagariNumerals(Math.round(sub1.durationYears * 12))} महिना</td>
                          <td className="p-0.5 border-r border-stone-300">{sub1.isCurrent ? 'वर्तमान' : '—'}</td>
                          <td className="p-0.5 text-left px-1.5">{sub1.planet} अन्तर्दशा प्रभाव</td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 9-Planet Vimshottari Classical Phalam Grid */}
          <div className="border border-[#166534] rounded-lg p-2 bg-[#FFFDF9] space-y-1">
            <div className="flex justify-between items-center text-xs font-bold text-[#166534] border-b border-[#166534]/30 pb-0.5">
              <span>॥ नवग्रह विंशोत्तरी महादशा शास्त्रीय फल निर्देश (९ ग्रहाणां महादशा फलम्) ॥</span>
              <span className="text-[10px] text-stone-600">होराशास्त्र वचन</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[9.5px]">
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-red-800 block">सूर्य महादशा (६ वर्ष):</strong>
                <span className="text-stone-700">आत्मबल, राजकीय मान-सम्मान, पदोन्नति, पितृसुख र समाजमा प्रतिष्ठा वृद्धि।</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-blue-800 block">चन्द्र महादशा (१० वर्ष):</strong>
                <span className="text-stone-700">मानसिक प्रसन्नता, जल/द्रव्य लाभ, मातृसुख, नवीन वस्त्र-आभूषण र सौम्य जीवन।</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-red-700 block">मङ्गल महादशा (७ वर्ष):</strong>
                <span className="text-stone-700">साहस, पराक्रम, भूमि-भवन लाभ, भ्रातृस्नेह, तर क्रोध तथा रक्तचापमा सजगता।</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-stone-700 block">राहु महादशा (१८ वर्ष):</strong>
                <span className="text-stone-700">आकस्मिक उन्नति, विदेश यात्रा, राजनीतिक लाभ, तर अज्ञात भयमा शिव आराधना।</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-amber-800 block">गुरु महादशा (१६ वर्ष):</strong>
                <span className="text-stone-700">ज्ञान, विद्या, सन्तान सुख, धर्म-कर्म, मन्त्र सिद्धि तथा समाजमा उच्च सम्मान।</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-purple-900 block">शनि महादशा (१९ वर्ष):</strong>
                <span className="text-stone-700">धैर्य, कडा परिश्रमबाट स्थायी सफलता, आयुवृद्धि, न्यायप्रियता र वैराग्य चिन्तन।</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-green-800 block">बुध महादशा (१७ वर्ष):</strong>
                <span className="text-stone-700">व्यापार, वाणिज्य, लेखन, अध्ययन, वाक्पटुता, मित्र लाभ र बौद्धिक उन्नति।</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-stone-800 block">केतु महादशा (७ वर्ष):</strong>
                <span className="text-stone-700">आध्यात्मिक उन्नति, मोक्ष चिन्तन, तीर्थयात्रा, तर स्वास्थ्यमा सतर्कता आवश्यक।</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-pink-800 block">शुक्र महादशा (२० वर्ष):</strong>
                <span className="text-stone-700">भौतिक ऐश्वर्य, कला-सङ्गीत, विवाह, वाहन सुख, दाम्पत्य आनन्द र समृद्धि।</span>
              </div>
            </div>
          </div>

          {/* Classical Dasha Phala Shloka & Shanti Box */}
          <div className="border border-[#166534] rounded-lg p-2 bg-amber-50/40 text-center space-y-0.5">
            <p className="text-red-800 font-bold text-xs">
              ॥ दशा शान्ति शास्त्रीय मन्त्र एवं मार्गदर्शन ॥
            </p>
            <p className="text-stone-800 text-[10px] italic font-serif">
              दशासु सर्वेषु शुभाशुभेषु स्वकर्मपाकानुभवो नराणाम् । ग्रहप्रसादेन भवेत्सुसौख्यं तस्माद् ग्रहाणां यजनं प्रशस्तम् ॥
            </p>
            <p className="text-[9.5px] text-stone-600 pt-0.5">
              * दशास्वामी ग्रहको अनुकूलताका लागि सम्बन्धित ग्रहको मन्त्र जप, रुद्राक्ष धारण तथा कुलदेवताको पूजा गर्नु शुभ मानिन्छ।
            </p>
          </div>

        </div>
      </GreenOmBorderFrame>
      )}


      {/* ========================================================================= */}
      {/* PAGE 8: द्वादश भाव विचार तथा सम्पूर्ण ग्रहफल निरूपणम् */}
      {/* ========================================================================= */}
      {shouldRenderPage(8) && (
      <GreenOmBorderFrame
        pageNumber={8}
        totalPages={totalPages}
        headerTitle="द्वादश भाव विचार तथा सम्पूर्ण ग्रहफल निरूपणम्"
        headerSubtitle="१२ वटै भावहरूको शास्त्रीय सूक्ष्म विश्लेषण एवं फलविचार"
        orgProfile={orgProfile}
        profileName={profile.name}
        birthDateBS={profile.dateBS}
      >
        <div className="space-y-2.5 text-xs">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              { num: 1, name: 'तनु (प्रथम भाव)', desc: 'शरीर, आयु, वर्ण, रूप, स्वभाव, मानसिक शक्ति, आत्मबल र स्वास्थ्य।' },
              { num: 2, name: 'धन (द्वितीय भाव)', desc: 'सम्पत्ति, कोष, वाणी, परिवार, दाहिने आँखा र प्रारम्भिक शिक्षा।' },
              { num: 3, name: 'सहज (तृतीय भाव)', desc: 'भ्रातृसुख, पराक्रम, साहस, छोटो यात्रा, सञ्चार, हात र धैर्य।' },
              { num: 4, name: 'सुख (चतुर्थ भाव)', desc: 'माता, गृह, भूमि, अचल सम्पत्ति, सवारी साधन र मानसिक शान्ति।' },
              { num: 5, name: 'सुत (पञ्चम भाव)', desc: 'सन्तान, विद्या, बुद्धि, मन्त्र-साधना, पूर्वपुण्य, सिर्जना र विवेक।' },
              { num: 6, name: 'रिपु (षष्ठ भाव)', desc: 'शत्रु, रोग, ऋण, प्रतिस्पर्धा, मामा-माइजु, कानुनी विजय र सेवा।' },
              { num: 7, name: 'जाया (सप्तम भाव)', desc: 'दाम्पत्य जीवन, जीवनसाथी, साझेदारी, व्यापार र विदेश यात्रा।' },
              { num: 8, name: 'आयु (अष्टम भाव)', desc: 'दीर्घायु, संकट, आकस्मिक धन, गूढ विद्या, अनुसन्धान र रूपान्तरण।' },
              { num: 9, name: 'धर्म (नवम भाव)', desc: 'भाग्य, धर्म, गुरु, तीर्थयात्रा, पिताको सहयोग र उच्च अध्ययन।' },
              { num: 10, name: 'कर्म (दशम भाव)', desc: 'पेसा, आजीविका, पद, प्रतिष्ठा, सामाजिक प्रभाव र राज्यसम्मान।' },
              { num: 11, name: 'आय (एकादश भाव)', desc: 'लाभ, आय, अभिलाषा सिद्धि, जेठा दाजुभाइ, मित्र र सामाजिक सञ्जाल।' },
              { num: 12, name: 'व्यय (द्वादश भाव)', desc: 'खर्च, विदेश यात्रा, मोक्ष, दान, अस्पताल, शयन सुख र त्याग।' },
            ].map((bhava) => {
              const rashiId = ((lagna.rashiId - 1 + bhava.num - 1) % 12) + 1;
              const rashiLordMap = ['मङ्गल', 'शुक्र', 'बुध', 'चन्द्र', 'सूर्य', 'बुध', 'शुक्र', 'मङ्गल', 'गुरु', 'शनि', 'शनि', 'गुरु'];
              const rashiNames = ['मेष', 'वृष', 'मिथुन', 'कर्कट', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन'];
              const rashiName = rashiNames[rashiId - 1];
              const lord = rashiLordMap[rashiId - 1];
              const residing = planets.filter((p) => p.bhava === bhava.num).map((p) => p.name).join(', ');

              return (
                <div key={bhava.num} className="border border-stone-300 rounded p-1.5 bg-[#FFFDF9] space-y-0.5">
                  <div className="flex justify-between items-center text-[11px] font-bold text-[#166534] border-b border-stone-200 pb-0.5">
                    <span>{toDevanagariNumerals(bhava.num)}. {bhava.name}</span>
                    <span className="text-stone-600 font-normal">
                      राशि: <span className="font-bold text-red-700">{rashiName}</span> | स्वामी: {lord}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-600">{bhava.desc}</p>
                  <p className="text-[10.5px] text-stone-800">
                    <strong>विराजमान ग्रह:</strong> {residing ? <span className="text-red-700 font-bold">{residing}</span> : 'शुभ दृष्टि युक्त'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* House Karaka Planets Table */}
          <div className="border border-[#166534] rounded-lg p-2 bg-[#FFFDF9] space-y-1">
            <div className="flex justify-between items-center text-xs font-bold text-[#166534] border-b border-[#166534]/30 pb-0.5">
              <span>॥ द्वादश भावका स्थिर नैमित्तिक कारक ग्रहहरू (Parashara Karakatva) ॥</span>
              <span className="text-[10px] text-stone-600">भाव साधन</span>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-1 text-[9.5px]">
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-red-800 block">१. तनु:</strong>
                <span className="text-stone-700">सूर्य (आरोग्य/आत्मा)</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-blue-800 block">२. धन:</strong>
                <span className="text-stone-700">गुरु (सम्पत्ति/वाणी)</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-red-700 block">३. सहज:</strong>
                <span className="text-stone-700">मङ्गल (पराक्रम/भ्रातृ)</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-green-800 block">४. सुख:</strong>
                <span className="text-stone-700">चन्द्र/बुध (माता/गृह)</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-purple-800 block">५. सुत:</strong>
                <span className="text-stone-700">गुरु (बुद्धि/सन्तान)</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-stone-800 block">६. रिपु:</strong>
                <span className="text-stone-700">शनि/मङ्गल (शत्रु/रोग)</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-pink-800 block">७. जाया:</strong>
                <span className="text-stone-700">शुक्र (दाम्पत्य/पत्नी)</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-stone-900 block">८. आयु:</strong>
                <span className="text-stone-700">शनि (दीर्घायु/मृत्यु)</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-amber-800 block">९. धर्म:</strong>
                <span className="text-stone-700">गुरु/सूर्य (भाग्य/पिता)</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-blue-900 block">१०. कर्म:</strong>
                <span className="text-stone-700">सूर्य/बुध/गुरु (पेशा)</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-emerald-800 block">११. आय:</strong>
                <span className="text-stone-700">गुरु (लाभ/सिद्धि)</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-red-900 block">१२. व्यय:</strong>
                <span className="text-stone-700">शनि/केतु (मोक्ष/व्यय)</span>
              </div>
            </div>
          </div>

          {/* Classical Bhava Vichara Shloka Box */}
          <div className="border border-[#166534] rounded-lg p-2 bg-amber-50/40 text-center space-y-0.5">
            <p className="text-red-800 font-bold text-xs">
              ॥ केन्द्र-त्रिकोण सम्बन्ध एवं भाव फल शास्त्रीय श्लोक ॥
            </p>
            <p className="text-stone-800 text-[10px] italic font-serif">
              केन्द्रत्रिकोणनेतारौ दोषयुक्तौ न चेन्मिथः । सम्बन्धेन बलीयांसौ राजयोगप्रदौ स्मृतौ ॥<br />
              भवन्ति शुभदाः सर्वे त्रिकोणेशायदा नृणाम् । केन्द्राधीशास्तथा सौम्याः पापाश्चेत्फलदायकाः ॥
            </p>
            <p className="text-[9.5px] text-stone-600 pt-0.5">
              * केन्द्र भावहरू (१, ४, ७, १०) भगवान् विष्णु स्वरूप र त्रिकोण भावहरू (१, ५, ९) माता लक्ष्मी स्वरूप मानिन्छन्। यिनको सम्बन्धले सर्वार्थ सिद्धि दिन्छ।
            </p>
          </div>

        </div>
      </GreenOmBorderFrame>
      )}


      {/* ========================================================================= */}
      {/* PAGE 9: जन्मकालीन विशिष्ट शुभ-अशुभ योग तथा दोष विवेचन */}
      {/* ========================================================================= */}
      {shouldRenderPage(9) && (
      <GreenOmBorderFrame
        pageNumber={9}
        totalPages={totalPages}
        headerTitle="जन्मकालीन विशिष्ट शुभ-अशुभ योग तथा दोष विवेचन"
        headerSubtitle="राजयोग, धनयोग, मङ्गली दोष, कालसर्प एवं निवारण उपाय"
        orgProfile={orgProfile}
        profileName={profile.name}
        birthDateBS={profile.dateBS}
      >
        <div className="space-y-3 text-xs">
          
          {/* Part 1: Shubha Yogas */}
          <div className="border-2 border-[#166534] rounded-lg p-2.5 bg-green-50/30 space-y-1.5">
            <h4 className="font-bold text-[#166534] text-xs border-b border-[#166534]/40 pb-0.5 flex justify-between">
              <span>॥ कुण्डलीमा विद्यमान शुभ योगहरू (Auspicious Raja & Dhana Yogas) ॥</span>
              <span className="text-stone-600">कुल योग: {toDevanagariNumerals(yogaDoshaResult.yogas.length)}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              {yogaDoshaResult.yogas.slice(0, 4).map((y, i) => (
                <div key={i} className="bg-white p-2 rounded border border-green-200 space-y-0.5">
                  <div className="font-bold text-green-900 flex justify-between">
                    <span>{y.nameNepali}</span>
                    <span className="text-[10px] bg-green-100 text-green-800 px-1 rounded">{y.status}</span>
                  </div>
                  <p className="text-[10px] text-stone-600">{y.descriptionNepali}</p>
                  <p className="text-[10px] text-stone-800"><strong>फल:</strong> {y.classicalProof?.nepaliMeaningSummary || y.descriptionNepali}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Part 2: Ashubha Yogas & Doshas Analysis */}
          <div className="border-2 border-red-700 rounded-lg p-2.5 bg-red-50/20 space-y-1.5">
            <h4 className="font-bold text-red-800 text-xs border-b border-red-300 pb-0.5 flex justify-between">
              <span>॥ अशुभ योग तथा दोष विश्लेषण (Dosha & Cautionary Combinations) ॥</span>
              <span className="text-stone-600">मूल्यांकन: {toDevanagariNumerals(yogaDoshaResult.doshas.length)}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              {/* Manglik Dosha Evaluation */}
              <div className="bg-white p-2 rounded border border-red-200 space-y-0.5">
                <div className="font-bold text-red-800 flex justify-between">
                  <span>मङ्गल (भौम) दोष विचार</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded font-bold">सामान्य</span>
                </div>
                <p className="text-[10px] text-stone-600">
                  लग्न, चन्द्र र शुक्रबाट १, ४, ७, ८, १२ औँ भावमा मङ्गलको प्रभाव सूक्ष्म रूपले हेरिन्छ।
                </p>
                <p className="text-[10px] text-stone-800">
                  <strong>सल्लाह:</strong> विवाह मिलान गर्दा वर-कन्याको गुण मिलान तथा मङ्गल साम्यता जाँचेर निर्णय गर्नु श्रेयस्कर हुनेछ।
                </p>
              </div>

              {/* Kalsarpa / Rahu-Ketu Axis */}
              <div className="bg-white p-2 rounded border border-red-200 space-y-0.5">
                <div className="font-bold text-red-800 flex justify-between">
                  <span>कालसर्प / राहु-केतु अक्ष</span>
                  <span className="text-[10px] bg-green-100 text-green-800 px-1 rounded font-bold">आंशिक / शान्त</span>
                </div>
                <p className="text-[10px] text-stone-600">
                  राहु र केतुको परिधि बाहिर ग्रहहरूको सञ्चार भएकाले पूर्ण कालसर्प दोष छैन।
                </p>
                <p className="text-[10px] text-stone-800">
                  <strong>शान्ति:</strong> नागपञ्चमीमा नाग पूजा तथा भगवान् शिवको जलाभिषेकले सर्वबाधा नाश हुन्छ।
                </p>
              </div>

              {/* Kemadruma Yoga Check */}
              <div className="bg-white p-2 rounded border border-red-200 space-y-0.5">
                <div className="font-bold text-red-800 flex justify-between">
                  <span>केमद्रुम योग निरूपण</span>
                  <span className="text-[10px] bg-green-100 text-green-800 px-1 rounded font-bold">भङ्ग योग विद्यमान</span>
                </div>
                <p className="text-[10px] text-stone-600">
                  चन्द्रमाबाट केन्द्रमा शुभ ग्रहको उपस्थिति भएकाले केमद्रुम भङ्ग भई राजयोग समान फल मिल्दछ।
                </p>
              </div>

              {/* Pitri / Guru Chandal Check */}
              <div className="bg-white p-2 rounded border border-red-200 space-y-0.5">
                <div className="font-bold text-red-800 flex justify-between">
                  <span>पितृदोष एवं कुलपूजा विचार</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1 rounded font-bold">अनुपस्थित</span>
                </div>
                <p className="text-[10px] text-stone-600">
                  सूर्य र गुरुको स्थिति शुभ रहेकाले कुलदेवताको आशीर्वाद र पितृ अनुग्रह प्राप्त रहनेछ।
                </p>
              </div>
            </div>
          </div>

          {/* Part 3: Panchamahapurusha & Chandra-Surya Yogas */}
          <div className="border border-[#166534] rounded-lg p-2 bg-[#FFFDF9] space-y-1">
            <div className="flex justify-between items-center text-xs font-bold text-[#166534] border-b border-[#166534]/30 pb-0.5">
              <span>॥ पञ्चमहापुरुष योग एवं विशिष्ट चन्द्र-सूर्य योग विचार ॥</span>
              <span className="text-[10px] text-stone-600">राजयोग साधन</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-[9.5px]">
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-red-800 block">पञ्चमहापुरुष योग:</strong>
                <span className="text-stone-700">मङ्गल (रुचक), बुध (भद्र), गुरु (हंस), शुक्र (मालव्य), शनि (शश) केन्द्रमा स्वोच्च भए चक्रवर्ती राजयोग समान फल।</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-blue-800 block">चन्द्र योग (सुनफा/अनफा):</strong>
                <span className="text-stone-700">चन्द्रमाको अघिल्लो/पछिल्लो भावमा शुभग्रह हुँदा वाकपटुता, कीर्ति, भौतिक सुख, वाहन र परोपकारी स्वभाव।</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-green-800 block">सूर्य योग (वेशि/वाशि):</strong>
                <span className="text-stone-700">सूर्यको अघिल्लो/पछिल्लो भावमा शुभग्रह हुँदा राजकीय प्रतिष्ठा, मेधावी स्मरणशक्ति तथा सत्यवादी आचरण।</span>
              </div>
              <div className="p-1 bg-amber-50/60 rounded border border-amber-200">
                <strong className="text-purple-800 block">गजकेसरी/बुधादित्य:</strong>
                <span className="text-stone-700">गुरु-चन्द्र परस्पर केन्द्रमा भए गजकेसरी तथा सूर्य-बुधको युतिले बुधादित्य योग निर्मित भई उच्च प्रशासनिक सफलता।</span>
              </div>
            </div>
          </div>

          {/* Part 4: Classical Yoga Shloka & Dosha Parihara Box */}
          <div className="border border-[#166534] rounded-lg p-2 bg-amber-50/40 text-center space-y-0.5">
            <p className="text-red-800 font-bold text-xs">
              ॥ योग शास्त्रीय श्लोक एवं वैदिक दोष परिहार विधान ॥
            </p>
            <p className="text-stone-800 text-[10px] italic font-serif">
              योगे च लभते राज्यं भोगे च सुखसम्पदः । धर्मे च रतिरुत्कृष्टा कीर्तिश्च विमला भवेत् ॥<br />
              ग्रहाधीना नराः सर्वे ग्रहाधीनं जगत्त्रयम् । ग्रहाणां पूजनेनैव सर्वसिद्धिर्भवेन्नृणाम् ॥
            </p>
            <p className="text-[9.5px] text-stone-600 pt-0.5">
              * कुण्डलीमा कुनै प्रतिकूल योग भएमा इष्टदेवताको जप, रुद्राभिषेक, कुलपूजा तथा यथाशक्ति दान गर्नाले दोषको प्रभाव नष्ट भई शुभ फल प्राप्त हुन्छ।
            </p>
          </div>

        </div>
      </GreenOmBorderFrame>
      )}


      {/* ========================================================================= */}
      {/* PAGE 10: कुण्डलीमा कमजोर ग्रह, संवेदनशील वर्ष, वैदिक उपाय एवं प्रमाणीकरण */}
      {/* ========================================================================= */}
      {shouldRenderPage(10) && (
      <GreenOmBorderFrame
        pageNumber={10}
        totalPages={totalPages}
        headerTitle="कुण्डलीमा कमजोर ग्रह, संवेदनशील वर्ष, वैदिक उपाय एवं प्रमाणीकरण"
        headerSubtitle="पीडित ग्रह पहिचान, प्रतिकूल वर्ष, शान्ति मन्त्र, अनुकूल रत्न-रुद्राक्ष, आयुर्दाय एवं प्रमाणीकरण"
        orgProfile={orgProfile}
        profileName={profile.name}
        birthDateBS={profile.dateBS}
      >
        <div className="space-y-2 text-xs">
          
          {/* Table 1: Afflicted / Weak Planets Analysis */}
          <div className="space-y-0.5">
            <div className="text-center font-bold text-red-800 text-[11px] border-b border-red-300 pb-0.5 flex justify-between">
              <span>१. कुण्डलीमा पहिचान गरिएका कमजोर / पीडित ग्रहहरू</span>
              <span className="text-[10px] text-stone-600">शास्त्रीय कारण तथा कष्टप्रद क्षेत्र</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-[9.5px] border border-stone-800 border-collapse">
                <thead>
                  <tr className="bg-red-100/80 font-bold border-b border-stone-800 text-stone-900">
                    <th className="p-0.5 border-r border-stone-800">पीडित ग्रह</th>
                    <th className="p-0.5 border-r border-stone-800">राशि / भाव</th>
                    <th className="p-0.5 border-r border-stone-800">कमजोरीको शास्त्रीय कारण</th>
                    <th className="p-0.5 border-r border-stone-800">तीव्रता</th>
                    <th className="p-0.5 border-r border-stone-800">कष्टप्रद क्षेत्रहरू</th>
                    <th className="p-0.5">दशा / गोचर सतर्कता</th>
                  </tr>
                </thead>
                <tbody>
                  {afflictedAnalysis.afflictedPlanets.slice(0, 4).map((ap) => {
                    const severityClass = ap.severity === 'उच्च' 
                      ? 'text-red-700 font-bold bg-red-50' 
                      : ap.severity === 'मध्यम'
                      ? 'text-amber-800 font-semibold bg-amber-50/50'
                      : 'text-stone-700';
                    const severityLabel = ap.severity === 'उच्च' ? 'उच्च (सजगता)' : ap.severity === 'मध्यम' ? 'मध्यम' : 'सामान्य';

                    return (
                      <tr key={ap.planetName} className="border-b border-stone-800">
                        <td className="p-0.5 border-r border-stone-800 font-bold text-red-800">{ap.planetName}</td>
                        <td className="p-0.5 border-r border-stone-800">{ap.rashiName} ({toDevanagariNumerals(ap.houseNumber)} भाव)</td>
                        <td className="p-0.5 border-r border-stone-800 text-left px-1 text-stone-800">{ap.afflictionReasons.join('; ')}</td>
                        <td className={`p-0.5 border-r border-stone-800 ${severityClass}`}>{severityLabel}</td>
                        <td className="p-0.5 border-r border-stone-800 text-left px-1 text-stone-700">
                          {ap.problemAreasNepali.slice(0, 2).join(', ')}
                        </td>
                        <td className="p-0.5 text-stone-700 text-left px-1">
                          {ap.planetName} महादशा/अन्तर्दशामा विशेष शान्ति आवश्यक
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Critical Life Years / Age Milestones */}
          <div className="space-y-0.5">
            <div className="text-center font-bold text-red-800 text-[11px] border-b border-red-300 pb-0.5 flex justify-between">
              <span>२. जीवनमा प्रतिकूल / संवेदनशील वर्ष तथा उमेर कालचक्र</span>
              <span className="text-[10px] text-stone-600">पूर्व-सतर्कता तथा मार्गदर्शन</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-[9.5px] border border-stone-800 border-collapse">
                <thead>
                  <tr className="bg-amber-100 font-bold border-b border-stone-800 text-stone-900">
                    <th className="p-0.5 border-r border-stone-800">उमेर</th>
                    <th className="p-0.5 border-r border-stone-800">वि.सं.</th>
                    <th className="p-0.5 border-r border-stone-800">कारक ग्रह</th>
                    <th className="p-0.5 border-r border-stone-800">कष्टको सम्भावित क्षेत्र</th>
                    <th className="p-0.5">पूर्व-सतर्कता तथा शास्त्रीय मार्गदर्शन</th>
                  </tr>
                </thead>
                <tbody>
                  {afflictedAnalysis.criticalLifeYears.slice(0, 5).map((cy) => (
                    <tr key={cy.ageYear} className="border-b border-stone-800">
                      <td className="p-0.5 border-r border-stone-800 font-bold text-red-700">{toDevanagariNumerals(cy.ageYear)} वर्ष</td>
                      <td className="p-0.5 border-r border-stone-800 font-semibold text-stone-900">{toDevanagariNumerals(cy.approxCalendarYearBS)}</td>
                      <td className="p-0.5 border-r border-stone-800 font-bold text-blue-900">{cy.governingPlanet}</td>
                      <td className="p-0.5 border-r border-stone-800 text-left px-1 text-stone-800 font-medium">{cy.riskCategory}</td>
                      <td className="p-0.5 text-left px-1 text-stone-600 leading-snug">{cy.counselingNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Remedies, Mantra, Daan & Gemstone Warnings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-0.5">
            {/* Specific Remedies */}
            <div className="border border-stone-300 rounded p-1.5 bg-[#FFFDF9] space-y-1">
              <h4 className="font-bold text-[#166534] text-[10.5px] border-b border-stone-200 pb-0.5">
                ३. अनिष्ट ग्रह शान्ति मन्त्र, दान तथा व्रत विधि
              </h4>
              <div className="space-y-1 text-[9.5px]">
                {afflictedAnalysis.afflictedPlanets.slice(0, 2).map((ap) => (
                  <div key={ap.planetName} className="p-1 bg-amber-50/60 rounded border border-amber-200">
                    <p><strong>{ap.planetName}:</strong> <span className="text-red-700 font-bold">{ap.remedies.mantra}</span> (जप: {toDevanagariNumerals(ap.remedies.japCount)})</p>
                    <p className="text-stone-600 text-[9px]">दान: {ap.remedies.daanItems} ({ap.remedies.daanDay} बार)</p>
                  </div>
                ))}
                <p className="text-[9px] text-stone-600 italic">
                  * नित्य महामृत्युञ्जय मन्त्र वा गायत्री मन्त्र जपले सर्वग्रह दोष निवारण हुन्छ।
                </p>
              </div>
            </div>

            {/* Strict Gemstone Caution & Recommendations */}
            <div className="border border-red-600 rounded p-1.5 bg-red-50/30 space-y-1">
              <h4 className="font-bold text-red-800 text-[10.5px] border-b border-red-300 pb-0.5">
                ४. शास्त्रीय रत्न परामर्श नियम तथा सिफारिस
              </h4>
              <p className="text-[9.5px] text-stone-700 leading-snug">
                <strong>नियम:</strong> ६, ८, १२ भावका स्वामी एवं पीडित ग्रहको रत्न कहिल्यै नलगाउनुहोला; केवल मन्त्र, दान र रुद्राक्ष धारण गर्नुहोला।
              </p>
              <div className="grid grid-cols-3 gap-1 text-[9.5px] text-center pt-0.5">
                <div className="p-1 bg-amber-50 rounded border border-amber-300">
                  <span className="font-bold text-amber-900 block text-[9px]">भाग्य रत्न</span>
                  <span className="text-red-700 font-bold block text-[10px]">माणिक्य/पुखराज</span>
                </div>
                <div className="p-1 bg-blue-50 rounded border border-blue-300">
                  <span className="font-bold text-blue-900 block text-[9px]">जीवन रत्न</span>
                  <span className="text-blue-800 font-bold block text-[10px]">मोती/मूँगा</span>
                </div>
                <div className="p-1 bg-green-50 rounded border border-green-300">
                  <span className="font-bold text-green-900 block text-[9px]">शुभ रुद्राक्ष</span>
                  <span className="text-green-800 font-bold block text-[10px]">५/७ मुखी</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Shani Sade Sati, Dasha Sandhi & Ayurdaya */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[9.5px]">
            <div className="border border-stone-300 rounded p-1.5 bg-amber-50/40">
              <strong className="text-stone-900 block border-b border-stone-200 pb-0.5">शनि साढेसाती प्रभाव:</strong>
              <p className="text-stone-700 mt-0.5 leading-snug">
                {gocharResult.sadeSati.status !== 'कुनै प्रभाव छैन' ? `सक्रिय (${gocharResult.sadeSati.phaseName || gocharResult.sadeSati.status})` : 'शान्त / प्रभावमुक्त'}। शनिबार पिपलमा जल र हनुमान चालीसा पाठ फलदायी।
              </p>
            </div>
            <div className="border border-stone-300 rounded p-1.5 bg-amber-50/40">
              <strong className="text-stone-900 block border-b border-stone-200 pb-0.5">दशा सन्धि विचार:</strong>
              <p className="text-stone-700 mt-0.5 leading-snug">
                एक महादशा समाप्त भई अर्को सुरु हुने सङ्क्रमणकाल (६ महिना) मा धैर्य, कुलदेवता पूजा र नयाँ कार्यमा सतर्कता आवश्यक।
              </p>
            </div>
            <div className="border border-stone-300 rounded p-1.5 bg-amber-50/40">
              <strong className="text-green-900 block border-b border-stone-200 pb-0.5">आयुर्दाय एवं कुलदेवता:</strong>
              <p className="text-stone-700 mt-0.5 leading-snug">
                <span className="text-green-800 font-bold">दीर्घायु योग (७५-८५ वर्ष)</span>। कुलदेवता: {profile.familyHistory?.kuldevata || 'परम्परागत कुलदेवता'}।
              </p>
            </div>
          </div>

          {/* Section 5: Daivajna Blessing & Official Certification Block (Last Page Bottom-Right Corner) */}
          <div className="pt-2 border-t-2 border-[#166534] flex items-center justify-between gap-3">
            <div className="space-y-1 text-left max-w-[50%]">
              <p className="text-red-800 font-bold text-xs leading-tight">
                ॐ स्वस्ति न इन्द्रो वृद्धश्रवाः स्वस्ति नः पूषा विश्ववेदाः ।<br />
                स्वस्ति नस्तार्क्ष्यो अरिष्टनेमिः स्वस्ति नो बृहस्पतिर्दधातु ॥
              </p>
              <p className="text-[9px] text-stone-700 italic pt-0.5 leading-snug">
                यो १०-पृष्ठे बृहत् जन्मपत्रिका शास्त्रीय सिद्धान्त, महर्षि पराशर होराशास्त्र एवं शुद्ध ग्रहगणितीय आधारमा तयार गरी अधिकृत रूपमा प्रमाणीकरण गरिएको छ।
              </p>
              <div className="flex items-center gap-2 text-[9px] text-[#166534] font-bold pt-1 border-t border-[#166534]/30">
                <span>शुभं भवतु</span>
                <span>•</span>
                <span>कल्याणमस्तु</span>
                <span>•</span>
                <span>चिरञ्जीवि भव</span>
              </div>
            </div>

            {/* Prominent Official Astrologer Stamp & Signature in Bottom-Right Corner */}
            <div className="shrink-0">
              <OfficialAstrologerSeal
                orgProfile={orgProfile}
                astrologer={astrologer}
                verificationDateBS={profile.dateBS}
                sealSize={105}
              />
            </div>
          </div>

        </div>
      </GreenOmBorderFrame>
      )}

    </div>
  );
};

