import {
  PlanetName,
  PlanetPosition,
  LagnaInfo,
  RashiName
} from '../types/astrology';
import { convertADToBSFull } from './bsCalendarData';
import { toDevanagariNumerals, fromDevanagariNumerals } from './nepaliCalendar';
import { calculatePlanetaryPositions, getJulianDay, getAyanamsa, calculateLagna } from './astroCalculations';

// Standard 120-Year Vimshottari Dasha Cycle Periods (Configurable Constants)
export const VIMSHOTTARI_PERIODS: Array<{ planet: PlanetName; years: number }> = [
  { planet: 'केतु', years: 7 },
  { planet: 'शुक्र', years: 20 },
  { planet: 'सूर्य', years: 6 },
  { planet: 'चन्द्र', years: 10 },
  { planet: 'मंगल', years: 7 },
  { planet: 'राहु', years: 18 },
  { planet: 'गुरु', years: 16 },
  { planet: 'शनि', years: 19 },
  { planet: 'बुध', years: 17 },
];

export type DashaLevelName = 'महादशा' | 'अन्तरदशा' | 'प्रत्यन्तरदशा' | 'सूक्ष्मदशा' | 'प्राणदशा';

export interface DashaNode {
  planet: PlanetName;
  level: DashaLevelName;
  startMs: number;
  endMs: number;
  startDateAD: string; // YYYY-MM-DD
  endDateAD: string;   // YYYY-MM-DD
  startDateBS: string; // २०८३ वैशाख १५
  endDateBS: string;   // २०८९ वैशाख १५
  startTimeNepali: string; // बिहान १०:३० बजे
  endTimeNepali: string;
  durationDays: number;
  durationFormattedNepali: string;
  isCurrent: boolean;
  parentPlanet?: PlanetName;
  subNodes?: DashaNode[];
}

export interface NakshatraDashaBalance {
  moonLongitude: number;
  nakshatraIndex: number;
  nakshatraName: string;
  nakshatraLord: PlanetName;
  pada: number;
  degreeInNakshatra: number; // 0 to 13.333333 degrees
  elapsedFraction: number;
  remainingFraction: number;
  fullMahadashaYears: number;
  yearsLeft: number;
  monthsLeft: number;
  daysLeft: number;
  hoursLeft: number;
  minutesLeft: number;
  formattedBalanceNepali: string;
}

export interface VimshottariDashaFullResult {
  birthMoonPosition: PlanetPosition;
  balanceAtBirth: NakshatraDashaBalance;
  mahadashas: DashaNode[];
  activeHierarchyAtTargetDate: {
    targetDateAD: string;
    targetDateBS: string;
    mahadasha: DashaNode;
    antardasha: DashaNode;
    pratyantardasha: DashaNode;
    sukshmadasha: DashaNode;
    pranadasha: DashaNode;
  };
}

export interface DashaGocharCoordinationResult {
  targetDateAD: string;
  targetDateBS: string;
  activeDashaHierarchy: {
    mahadasha: PlanetName;
    antardasha: PlanetName;
    pratyantardasha: PlanetName;
    sukshmadasha: PlanetName;
    pranadasha: PlanetName;
  };
  mahadashaPlanetNatalInfo?: {
    rashiName: RashiName;
    bhava: number;
    dignity: string;
    isRetrograde: boolean;
    isCombust: boolean;
    nakshatraName: string;
    formattedDegree: string;
  };
  antardashaPlanetNatalInfo?: {
    rashiName: RashiName;
    bhava: number;
    dignity: string;
    isRetrograde: boolean;
    isCombust: boolean;
    nakshatraName: string;
    formattedDegree: string;
  };
  transitPlanetsOnTargetDate: Array<{
    name: PlanetName;
    transitRashiName: RashiName;
    transitBhavaFromMoon: number;
    formattedDegree: string;
    isRetrograde: boolean;
  }>;
}

/**
 * Helper to robustly parse hours and minutes from various string formats,
 * supporting Devanagari numerals, 24-hr, 12-hr, seconds, and text suffixes.
 */
export function parseHoursMinutes(timeStr?: string): { hours: number; minutes: number } {
  if (!timeStr || typeof timeStr !== 'string') return { hours: 12, minutes: 0 };
  const latinStr = fromDevanagariNumerals(timeStr.trim());
  const match = latinStr.match(/(\d{1,2})[:.](\d{1,2})/);
  if (!match) {
    const singleMatch = latinStr.match(/(\d{1,2})/);
    if (singleMatch) {
      const h = parseInt(singleMatch[1], 10);
      return { hours: isNaN(h) || h < 0 || h > 23 ? 12 : h, minutes: 0 };
    }
    return { hours: 12, minutes: 0 };
  }
  let hours = parseInt(match[1], 10);
  let minutes = parseInt(match[2], 10);
  if (isNaN(hours) || hours < 0 || hours > 23) hours = 12;
  if (isNaN(minutes) || minutes < 0 || minutes > 59) minutes = 0;
  return { hours, minutes };
}

/**
 * Helper to parse a date string safely into a timestamp or valid ISO date,
 * supporting Devanagari numerals and invalid fallbacks.
 */
export function sanitizeDateAD(dateStr?: string): string {
  if (!dateStr || typeof dateStr !== 'string') {
    return new Date().toISOString().split('T')[0];
  }
  const clean = fromDevanagariNumerals(dateStr.trim()).split('T')[0];
  const parsed = new Date(clean).getTime();
  if (isNaN(parsed)) {
    return new Date().toISOString().split('T')[0];
  }
  return clean;
}

/**
 * Helper to convert Milliseconds timestamp to formatted Bikram Sambat date string and time
 */
export function formatMsToBSAndNepaliTime(ms: number): { dateBS: string; dateAD: string; timeNepali: string } {
  const safeMs = typeof ms === 'number' && isFinite(ms) ? ms : Date.now();
  const d = new Date(safeMs);
  let dateAD: string;
  try {
    dateAD = d.toISOString().split('T')[0];
  } catch {
    dateAD = new Date().toISOString().split('T')[0];
  }

  let bsFormatted = dateAD;
  try {
    const bs = convertADToBSFull(dateAD);
    bsFormatted = bs.formattedBS || dateAD;
  } catch {
    bsFormatted = dateAD;
  }

  const hours = isNaN(d.getHours()) ? 12 : d.getHours();
  const minutes = isNaN(d.getMinutes()) ? 0 : d.getMinutes();
  const period = hours < 12 ? 'बिहान' : hours < 16 ? 'दिउँसो' : hours < 20 ? 'साँझ' : 'राति';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;

  const hStr = toDevanagariNumerals(displayHours);
  const mStr = toDevanagariNumerals(minutes < 10 ? `0${minutes}` : minutes);
  const timeNepali = `${period} ${hStr}:${mStr} बजे`;

  return {
    dateAD,
    dateBS: bsFormatted,
    timeNepali,
  };
}

/**
 * Service 1: Calculate Birth Moon Nakshatra & Dasha Balance at Birth
 */
export function calculateNakshatraDashaBalance(moonPosition: PlanetPosition): NakshatraDashaBalance {
  let rawLong = moonPosition?.longitude;
  if (rawLong === undefined || isNaN(rawLong)) {
    const rashiBase = (((moonPosition?.rashiId || 1) - 1) * 30);
    rawLong = rashiBase + (moonPosition?.degree || 0) + (moonPosition?.minutes || 0) / 60 + (moonPosition?.seconds || 0) / 3600;
  }
  if (isNaN(rawLong)) rawLong = 0;
  const moonLong = ((rawLong % 360) + 360) % 360;
  const nakshatraSpan = 360 / 27; // 13.3333333 degrees (13° 20')
  const nakshatraIndex = Math.max(0, Math.min(26, Math.floor(moonLong / nakshatraSpan) || 0));
  const degreeInNakshatra = moonLong % nakshatraSpan;

  const elapsedFraction = degreeInNakshatra / nakshatraSpan;
  const remainingFraction = Math.max(0, Math.min(1, 1.0 - elapsedFraction));

  // Lord of the nakshatra (0=Ketu, 1=Venus, 2=Sun, 3=Moon, 4=Mars, 5=Rahu, 6=Jupiter, 7=Saturn, 8=Mercury)
  const lordIndex = ((nakshatraIndex % 9) + 9) % 9;
  const lordItem = VIMSHOTTARI_PERIODS[lordIndex] || VIMSHOTTARI_PERIODS[0];

  const totalYearsLeft = (lordItem?.years || 10) * remainingFraction;

  const yearsLeft = Math.max(0, Math.floor(totalYearsLeft) || 0);
  const remMonths = (totalYearsLeft - yearsLeft) * 12;
  const monthsLeft = Math.max(0, Math.floor(remMonths) || 0);
  const remDays = (remMonths - monthsLeft) * 30;
  const daysLeft = Math.max(0, Math.floor(remDays) || 0);
  const remHours = (remDays - daysLeft) * 24;
  const hoursLeft = Math.max(0, Math.floor(remHours) || 0);
  const remMinutes = Math.max(0, Math.floor((remHours - hoursLeft) * 60) || 0);

  const yStr = toDevanagariNumerals(yearsLeft);
  const mStr = toDevanagariNumerals(monthsLeft);
  const dStr = toDevanagariNumerals(daysLeft);
  const hStr = toDevanagariNumerals(hoursLeft);

  const formattedBalanceNepali = `${lordItem.planet} महादशा - बाँकी ${yStr} वर्ष, ${mStr} महिना, ${dStr} दिन, ${hStr} घण्टा`;

  return {
    moonLongitude: moonLong,
    nakshatraIndex: nakshatraIndex + 1,
    nakshatraName: moonPosition?.nakshatraName || '',
    nakshatraLord: lordItem.planet,
    pada: moonPosition?.pada || 1,
    degreeInNakshatra,
    elapsedFraction,
    remainingFraction,
    fullMahadashaYears: lordItem.years,
    yearsLeft,
    monthsLeft,
    daysLeft,
    hoursLeft,
    minutesLeft: remMinutes,
    formattedBalanceNepali,
  };
}

const dashaCache = new Map<string, VimshottariDashaFullResult>();

/**
 * Helper to generate 9 Pranadashas on-demand for a given Sukshmadasha node
 */
export function generatePranadashasForSD(sdNode: DashaNode, targetMs: number = Date.now()): DashaNode[] {
  const sdPlanetIdx = VIMSHOTTARI_PERIODS.findIndex(p => p.planet === sdNode.planet);
  const startIdx = sdPlanetIdx !== -1 ? sdPlanetIdx : 0;

  const totalSdDurationMs = sdNode.endMs - sdNode.startMs;
  const pranadashas: DashaNode[] = [];
  let currentStartMs = sdNode.startMs;

  for (let m = 0; m < 9; m++) {
    const pranIdx = (startIdx + m) % 9;
    const pranItem = VIMSHOTTARI_PERIODS[pranIdx];

    const pranFraction = pranItem.years / 120;
    const pranDurationMs = totalSdDurationMs * pranFraction;
    const pranEndMs = m === 8 ? sdNode.endMs : currentStartMs + pranDurationMs;

    const pranFormatsStart = formatMsToBSAndNepaliTime(currentStartMs);
    const pranFormatsEnd = formatMsToBSAndNepaliTime(pranEndMs);
    const pranIsCurrent = targetMs >= currentStartMs && targetMs < pranEndMs;
    const durationDays = (pranEndMs - currentStartMs) / (1000 * 3600 * 24);

    pranadashas.push({
      planet: pranItem.planet,
      level: 'प्राणदशा',
      startMs: currentStartMs,
      endMs: pranEndMs,
      startDateAD: pranFormatsStart.dateAD,
      endDateAD: pranFormatsEnd.dateAD,
      startDateBS: pranFormatsStart.dateBS,
      endDateBS: pranFormatsEnd.dateBS,
      startTimeNepali: pranFormatsStart.timeNepali,
      endTimeNepali: pranFormatsEnd.timeNepali,
      durationDays,
      durationFormattedNepali: `${toDevanagariNumerals(durationDays.toFixed(2))} दिन`,
      isCurrent: pranIsCurrent,
      parentPlanet: sdNode.planet,
    });

    currentStartMs = pranEndMs;
  }

  return pranadashas;
}

/**
 * Helper to generate 9 Sukshmadashas on-demand for a given Pratyantardasha node
 */
export function generateSukshmadashasForPD(pdNode: DashaNode, targetMs: number = Date.now()): DashaNode[] {
  if (pdNode.subNodes && pdNode.subNodes.length > 0) {
    return pdNode.subNodes;
  }

  const pdPlanetIdx = VIMSHOTTARI_PERIODS.findIndex(p => p.planet === pdNode.planet);
  const startIdx = pdPlanetIdx !== -1 ? pdPlanetIdx : 0;

  const totalPdDurationMs = pdNode.endMs - pdNode.startMs;
  const sukshmadashas: DashaNode[] = [];
  let currentStartMs = pdNode.startMs;

  for (let l = 0; l < 9; l++) {
    const sdIdx = (startIdx + l) % 9;
    const sdItem = VIMSHOTTARI_PERIODS[sdIdx];

    const sdFraction = sdItem.years / 120;
    const sdDurationMs = totalPdDurationMs * sdFraction;
    const sdEndMs = l === 8 ? pdNode.endMs : currentStartMs + sdDurationMs;

    const sdFormatsStart = formatMsToBSAndNepaliTime(currentStartMs);
    const sdFormatsEnd = formatMsToBSAndNepaliTime(sdEndMs);
    const sdIsCurrent = targetMs >= currentStartMs && targetMs < sdEndMs;
    const sdDurationDays = (sdEndMs - currentStartMs) / (1000 * 3600 * 24);

    const sdNode: DashaNode = {
      planet: sdItem.planet,
      level: 'सूक्ष्मदशा',
      startMs: currentStartMs,
      endMs: sdEndMs,
      startDateAD: sdFormatsStart.dateAD,
      endDateAD: sdFormatsEnd.dateAD,
      startDateBS: sdFormatsStart.dateBS,
      endDateBS: sdFormatsEnd.dateBS,
      startTimeNepali: sdFormatsStart.timeNepali,
      endTimeNepali: sdFormatsEnd.timeNepali,
      durationDays: sdDurationDays,
      durationFormattedNepali: `${toDevanagariNumerals(sdDurationDays.toFixed(1))} दिन`,
      isCurrent: sdIsCurrent,
      parentPlanet: pdNode.planet,
    };

    // If this Sukshmadasha is current, populate its Pranadashas
    if (sdIsCurrent) {
      sdNode.subNodes = generatePranadashasForSD(sdNode, targetMs);
    }

    sukshmadashas.push(sdNode);
    currentStartMs = sdEndMs;
  }

  pdNode.subNodes = sukshmadashas;
  return sukshmadashas;
}

/**
 * Service 2 & 3: Generate 5-level Vimshottari Dasha Hierarchy
 * Mahadasha -> Antardasha -> Pratyantardasha -> Sukshmadasha -> Pranadasha
 */
export function generateFull5LevelVimshottariDasha(
  moonPosition: PlanetPosition,
  birthDateAD: string,
  birthTimeStr: string = '12:00',
  targetDateAD?: string
): VimshottariDashaFullResult {
  const safeMoon: PlanetPosition = moonPosition || {
    id: '2',
    name: 'चन्द्र',
    englishName: 'Moon',
    symbol: '☽',
    longitude: 0,
    degree: 0,
    minutes: 0,
    seconds: 0,
    formattedDegree: "००° ००' ००\"",
    rashiId: 1,
    rashiName: 'मेष',
    nakshatraId: 1,
    nakshatraName: 'अश्विनी',
    nakshatraLord: 'केतु',
    pada: 1,
    bhava: 1,
    speed: 13.2,
    isRetrograde: false,
    isCombust: false,
    dignity: 'समराशि',
  };
  const cleanBirthDate = sanitizeDateAD(birthDateAD);
  const { hours: bh, minutes: bm } = parseHoursMinutes(birthTimeStr);
  const cleanBirthTime = `${String(bh).padStart(2, '0')}:${String(bm).padStart(2, '0')}`;

  const cleanTargetDate = targetDateAD ? sanitizeDateAD(targetDateAD) : undefined;
  const balance = calculateNakshatraDashaBalance(safeMoon);
  const cacheKey = `${balance.moonLongitude.toFixed(4)}_${cleanBirthDate}_${cleanBirthTime}_${cleanTargetDate || 'current'}`;
  if (dashaCache.has(cacheKey)) {
    return dashaCache.get(cacheKey)!;
  }

  // Determine starting planet lord index (0 to 8)
  const nakshatraSpan = 360 / 27;
  const lordIndex = Math.floor(balance.moonLongitude / nakshatraSpan) % 9;

  // Birth Timestamp in MS
  let birthMs = new Date(`${cleanBirthDate}T${cleanBirthTime}:00.000Z`).getTime();
  if (isNaN(birthMs)) {
    birthMs = Date.now();
  }

  let targetMs = Date.now();
  if (cleanTargetDate) {
    const parsedTarget = new Date(cleanTargetDate).getTime();
    if (!isNaN(parsedTarget)) {
      targetMs = parsedTarget;
    }
  }

  let currentStartMs = birthMs;

  const mahadashas: DashaNode[] = [];

  // Generate 9 Mahadashas (120 years)
  for (let i = 0; i < 9; i++) {
    const cycleIdx = (lordIndex + i) % 9;
    const mItem = VIMSHOTTARI_PERIODS[cycleIdx];

    let mDurationYears = mItem.years;
    if (i === 0) {
      mDurationYears = mItem.years * balance.remainingFraction; // First Mahadasha is balance
    }

    const mDurationMs = mDurationYears * 365.25 * 24 * 3600 * 1000;
    const mEndMs = currentStartMs + mDurationMs;

    const mFormatsStart = formatMsToBSAndNepaliTime(currentStartMs);
    const mFormatsEnd = formatMsToBSAndNepaliTime(mEndMs);
    const mIsCurrent = targetMs >= currentStartMs && targetMs < mEndMs;

    // Build Antardashas (Level 2)
    const antardashas: DashaNode[] = [];
    let subStartMs = currentStartMs;

    for (let j = 0; j < 9; j++) {
      const subIdx = (cycleIdx + j) % 9;
      const subItem = VIMSHOTTARI_PERIODS[subIdx];

      // Standard AD Duration = (MD_Years * AD_Years) / 120
      let adDurationYears = (mItem.years * subItem.years) / 120;

      // Adjust for partial first Mahadasha
      if (i === 0) {
        adDurationYears = adDurationYears * balance.remainingFraction;
      }

      const adDurationMs = adDurationYears * 365.25 * 24 * 3600 * 1000;
      const adEndMs = subStartMs + adDurationMs;

      const adFormatsStart = formatMsToBSAndNepaliTime(subStartMs);
      const adFormatsEnd = formatMsToBSAndNepaliTime(adEndMs);
      const adIsCurrent = targetMs >= subStartMs && targetMs < adEndMs;

      // Build Pratyantardashas (Level 3)
      const pratyantardashas: DashaNode[] = [];
      let pdStartMs = subStartMs;

      for (let k = 0; k < 9; k++) {
        const pdIdx = (subIdx + k) % 9;
        const pdItem = VIMSHOTTARI_PERIODS[pdIdx];

        const pdDurationYears = (adDurationYears * pdItem.years) / 120;
        const pdDurationMs = pdDurationYears * 365.25 * 24 * 3600 * 1000;
        const pdEndMs = pdStartMs + pdDurationMs;

        const pdFormatsStart = formatMsToBSAndNepaliTime(pdStartMs);
        const pdFormatsEnd = formatMsToBSAndNepaliTime(pdEndMs);
        const pdIsCurrent = targetMs >= pdStartMs && targetMs < pdEndMs;
        const pdDurationDays = (pdEndMs - pdStartMs) / (1000 * 3600 * 24);

        const pdNode: DashaNode = {
          planet: pdItem.planet,
          level: 'प्रत्यन्तरदशा',
          startMs: pdStartMs,
          endMs: pdEndMs,
          startDateAD: pdFormatsStart.dateAD,
          endDateAD: pdFormatsEnd.dateAD,
          startDateBS: pdFormatsStart.dateBS,
          endDateBS: pdFormatsEnd.dateBS,
          startTimeNepali: pdFormatsStart.timeNepali,
          endTimeNepali: pdFormatsEnd.timeNepali,
          durationDays: pdDurationDays,
          durationFormattedNepali: `${toDevanagariNumerals(Math.round(pdDurationDays))} दिन`,
          isCurrent: pdIsCurrent,
          parentPlanet: subItem.planet,
        };

        // If this Pratyantardasha is current, calculate its Sukshma & Prana immediately
        if (pdIsCurrent) {
          generateSukshmadashasForPD(pdNode, targetMs);
        }

        pratyantardashas.push(pdNode);
        pdStartMs = pdEndMs;
      }

      const adDurationDays = (adEndMs - subStartMs) / (1000 * 3600 * 24);

      antardashas.push({
        planet: subItem.planet,
        level: 'अन्तरदशा',
        startMs: subStartMs,
        endMs: adEndMs,
        startDateAD: adFormatsStart.dateAD,
        endDateAD: adFormatsEnd.dateAD,
        startDateBS: adFormatsStart.dateBS,
        endDateBS: adFormatsEnd.dateBS,
        startTimeNepali: adFormatsStart.timeNepali,
        endTimeNepali: adFormatsEnd.timeNepali,
        durationDays: adDurationDays,
        durationFormattedNepali: `${toDevanagariNumerals((adDurationYears * 12).toFixed(1))} महिना`,
        isCurrent: adIsCurrent,
        parentPlanet: mItem.planet,
        subNodes: pratyantardashas,
      });

      subStartMs = adEndMs;
    }

    const mDurationDays = (mEndMs - currentStartMs) / (1000 * 3600 * 24);

    mahadashas.push({
      planet: mItem.planet,
      level: 'महादशा',
      startMs: currentStartMs,
      endMs: mEndMs,
      startDateAD: mFormatsStart.dateAD,
      endDateAD: mFormatsEnd.dateAD,
      startDateBS: mFormatsStart.dateBS,
      endDateBS: mFormatsEnd.dateBS,
      startTimeNepali: mFormatsStart.timeNepali,
      endTimeNepali: mFormatsEnd.timeNepali,
      durationDays: mDurationDays,
      durationFormattedNepali: `${toDevanagariNumerals(Math.round((mDurationYears + Number.EPSILON) * 100) / 100)} वर्ष`,
      isCurrent: mIsCurrent,
      subNodes: antardashas,
    });

    currentStartMs = mEndMs;
  }

  // Find active 5-level chain at target date
  const activeM = mahadashas.find((m) => m.isCurrent) || mahadashas[0];
  const activeAD = activeM.subNodes?.find((a) => a.isCurrent) || activeM.subNodes?.[0] || activeM;
  const activePD = activeAD.subNodes?.find((p) => p.isCurrent) || activeAD.subNodes?.[0] || activeAD;
  
  // Ensure active PD has Sukshmadashas generated
  if (!activePD.subNodes || activePD.subNodes.length === 0) {
    generateSukshmadashasForPD(activePD, targetMs);
  }
  
  const activeSD = activePD.subNodes?.find((s) => s.isCurrent) || activePD.subNodes?.[0] || activePD;
  
  // Ensure active SD has Pranadashas generated
  if (!activeSD.subNodes || activeSD.subNodes.length === 0) {
    activeSD.subNodes = generatePranadashasForSD(activeSD, targetMs);
  }

  const activePran = activeSD.subNodes?.find((pr) => pr.isCurrent) || activeSD.subNodes?.[0] || activeSD;

  const targetFormats = formatMsToBSAndNepaliTime(targetMs);

  const result: VimshottariDashaFullResult = {
    birthMoonPosition: safeMoon,
    balanceAtBirth: balance,
    mahadashas,
    activeHierarchyAtTargetDate: {
      targetDateAD: targetFormats.dateAD,
      targetDateBS: targetFormats.dateBS,
      mahadasha: activeM,
      antardasha: activeAD,
      pratyantardasha: activePD,
      sukshmadasha: activeSD,
      pranadasha: activePran,
    },
  };

  if (dashaCache.size > 100) dashaCache.clear();
  dashaCache.set(cacheKey, result);
  return result;
}

/**
 * Service 4: Dasha + Gochar Transit Coordination Engine
 */
export function calculateDashaGocharCoordination(
  birthMoonPosition: PlanetPosition,
  birthPlanets: PlanetPosition[],
  birthDateAD: string,
  birthTimeStr: string,
  targetDateAD: string,
  targetTimeStr: string = '10:30',
  latitude: number = 27.7172,
  longitude: number = 85.3240
): DashaGocharCoordinationResult {
  // 1. Calculate Vimshottari Dasha Hierarchy at Target Date
  const dashaResult = generateFull5LevelVimshottariDasha(
    birthMoonPosition,
    birthDateAD,
    birthTimeStr,
    targetDateAD
  );

  const activeChain = dashaResult.activeHierarchyAtTargetDate;

  // Find Natal Info for Mahadasha and Antardasha Planets
  const mNatal = birthPlanets.find((p) => p.name === activeChain.mahadasha.planet);
  const adNatal = birthPlanets.find((p) => p.name === activeChain.antardasha.planet);

  // 2. Compute Astronomical Transit (Gochar) Positions at Target Date
  const targetJD = getJulianDay(targetDateAD, targetTimeStr, 5.75);
  const targetAyanamsa = getAyanamsa(targetJD, 'Lahiri');
  const targetLagna = calculateLagna(targetJD, latitude, longitude, targetAyanamsa);
  const transitPlanets = calculatePlanetaryPositions(targetJD, targetAyanamsa, targetLagna.rashiId);

  const birthMoonRashiId = birthMoonPosition.rashiId;

  const transitMapped = transitPlanets.map((tp) => {
    // House from Moon (1 to 12)
    const houseFromMoon = ((tp.rashiId - birthMoonRashiId + 12) % 12) + 1;
    return {
      name: tp.name,
      transitRashiName: tp.rashiName,
      transitBhavaFromMoon: houseFromMoon,
      formattedDegree: tp.formattedDegree,
      isRetrograde: tp.isRetrograde,
    };
  });

  return {
    targetDateAD,
    targetDateBS: activeChain.targetDateBS,
    activeDashaHierarchy: {
      mahadasha: activeChain.mahadasha.planet,
      antardasha: activeChain.antardasha.planet,
      pratyantardasha: activeChain.pratyantardasha.planet,
      sukshmadasha: activeChain.sukshmadasha.planet,
      pranadasha: activeChain.pranadasha.planet,
    },
    mahadashaPlanetNatalInfo: mNatal ? {
      rashiName: mNatal.rashiName,
      bhava: mNatal.bhava,
      dignity: mNatal.dignity,
      isRetrograde: mNatal.isRetrograde,
      isCombust: mNatal.isCombust,
      nakshatraName: mNatal.nakshatraName,
      formattedDegree: mNatal.formattedDegree,
    } : undefined,
    antardashaPlanetNatalInfo: adNatal ? {
      rashiName: adNatal.rashiName,
      bhava: adNatal.bhava,
      dignity: adNatal.dignity,
      isRetrograde: adNatal.isRetrograde,
      isCombust: adNatal.isCombust,
      nakshatraName: adNatal.nakshatraName,
      formattedDegree: adNatal.formattedDegree,
    } : undefined,
    transitPlanetsOnTargetDate: transitMapped,
  };
}

/**
 * Backward Compatibility Function for App.tsx & Other Components
 */
export function calculateVimshottariDasha(
  moonPosition: PlanetPosition,
  birthDateAD: string,
  birthTimeStr: string = '12:00'
) {
  const fullResult = generateFull5LevelVimshottariDasha(
    moonPosition,
    birthDateAD,
    birthTimeStr
  );

  const activeChain = fullResult.activeHierarchyAtTargetDate;

  return {
    birthMoonDegree: moonPosition?.degree ?? 0,
    birthDashaPlanet: fullResult.balanceAtBirth.nakshatraLord,
    balanceYears: fullResult.balanceAtBirth.yearsLeft,
    balanceMonths: fullResult.balanceAtBirth.monthsLeft,
    balanceDays: fullResult.balanceAtBirth.daysLeft,
    balanceAtBirth: {
      planet: fullResult.balanceAtBirth.nakshatraLord,
      nakshatraName: fullResult.balanceAtBirth.nakshatraName,
      pada: fullResult.balanceAtBirth.pada,
      yearsLeft: fullResult.balanceAtBirth.yearsLeft,
      monthsLeft: fullResult.balanceAtBirth.monthsLeft,
      daysLeft: fullResult.balanceAtBirth.daysLeft,
      hoursLeft: fullResult.balanceAtBirth.hoursLeft,
      formattedBalanceNepali: fullResult.balanceAtBirth.formattedBalanceNepali,
    },
    mahadashas: fullResult.mahadashas.map((m) => ({
      planet: m.planet,
      startDate: m.startDateBS || m.startDateAD,
      endDate: m.endDateBS || m.endDateAD,
      durationYears: Math.round(((m.durationDays / 365.25) + Number.EPSILON) * 100) / 100,
      isCurrent: m.isCurrent,
      subDashas: m.subNodes?.map((a) => ({
        planet: a.planet,
        startDate: a.startDateBS || a.startDateAD,
        endDate: a.endDateBS || a.endDateAD,
        durationYears: Math.round(((a.durationDays / 365.25) + Number.EPSILON) * 100) / 100,
        isCurrent: a.isCurrent,
        subDashas: a.subNodes?.map((p) => ({
          planet: p.planet,
          startDate: p.startDateBS || p.startDateAD,
          endDate: p.endDateBS || p.endDateAD,
          durationYears: Math.round(((p.durationDays / 365.25) + Number.EPSILON) * 100) / 100,
          isCurrent: p.isCurrent,
        })),
      })),
    })),
    currentMahadasha: {
      planet: activeChain.mahadasha.planet,
      startDate: activeChain.mahadasha.startDateBS || activeChain.mahadasha.startDateAD,
      endDate: activeChain.mahadasha.endDateBS || activeChain.mahadasha.endDateAD,
      durationYears: Math.round(((activeChain.mahadasha.durationDays / 365.25) + Number.EPSILON) * 100) / 100,
    },
    currentAntardasha: {
      planet: activeChain.antardasha.planet,
      startDate: activeChain.antardasha.startDateBS || activeChain.antardasha.startDateAD,
      endDate: activeChain.antardasha.endDateBS || activeChain.antardasha.endDateAD,
      durationYears: Math.round(((activeChain.antardasha.durationDays / 365.25) + Number.EPSILON) * 100) / 100,
    },
    currentPratyantardasha: {
      planet: activeChain.pratyantardasha.planet,
      startDate: activeChain.pratyantardasha.startDateBS || activeChain.pratyantardasha.startDateAD,
      endDate: activeChain.pratyantardasha.endDateBS || activeChain.pratyantardasha.endDateAD,
      durationYears: Math.round(((activeChain.pratyantardasha.durationDays / 365.25) + Number.EPSILON) * 100) / 100,
    },
  };
}

