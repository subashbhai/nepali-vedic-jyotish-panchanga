// ============================================================================
// बालानन्द वैदिक ज्योतिष - व्यक्तिगत तथा शास्त्रीय राशिफल इन्जिन (Personalized Rashifal Engine)
// जन्मकुण्डली, गोचर, पञ्चाङ्ग, चन्द्रबल, ताराबल, दशा र साढेसातीको एकीकृत विश्लेषण
// ============================================================================

import {
  BirthDetails,
  PanchangaData,
  PlanetPosition,
  LagnaInfo,
  VimshottariDashaResult
} from '../types/astrology';
import { RASHI_DATA } from '../data/rashiData';
import { getCachedAstroCalculation } from './astroCache';
import { calculateChandrabala, calculateTarabala } from './muhurtaEngine';
import { calculateGocharAndSadeSati } from './gocharEngine';
import {
  DailyRashifalItem,
  MonthlyRashifalItem,
  YearlyRashifalItem,
  getDailyRashifalForRashi,
  getMonthlyRashifalForRashi,
  getYearlyRashifalForRashi
} from '../db/rashifalStore';
import { toDevanagariNumerals } from './nepaliCalendar';

export interface PersonalizedDailyResult {
  isPersonalized: boolean;
  hasTimeOfBirth: boolean;
  tierLabel: string; // "पूर्ण व्यक्तिगत कुण्डली आधारित" or "चन्द्रराशि आधारित सामान्य"
  nativeName: string;
  janmaRashi: string;
  janmaRashiId: number;
  janmaNakshatra?: string;
  lagnaName?: string;
  chandrabala?: {
    house: number;
    isFavorable: boolean;
    statusNepali: string;
  } | null;
  tarabala?: {
    taraName: string;
    isFavorable: boolean;
    statusNepali: string;
  } | null;
  currentDasha?: {
    mahadasha: string;
    antardasha: string;
  } | null;
  sadeSatiStatus?: string;
  item: DailyRashifalItem;
  personalSynthesis: string;
}

export interface PersonalizedMonthlyResult {
  isPersonalized: boolean;
  tierLabel: string;
  nativeName: string;
  janmaRashi: string;
  janmaRashiId: number;
  item: MonthlyRashifalItem;
  personalMonthlySynthesis: string;
}

export interface PersonalizedYearlyResult {
  isPersonalized: boolean;
  tierLabel: string;
  nativeName: string;
  janmaRashi: string;
  janmaRashiId: number;
  item: YearlyRashifalItem;
  personalYearlySynthesis: string;
}

/**
 * Generate Personalized Daily Horoscope
 */
export function generatePersonalizedDailyRashifal(
  profile: BirthDetails | null,
  todayPanchanga: PanchangaData,
  transitPlanets: PlanetPosition[] = [],
  preferredRashiId?: number,
  dateBS?: string
): PersonalizedDailyResult {
  // Determine if profile exists and has natal data
  let natalAstro = null;
  let hasValidBirthData = false;
  let hasTime = false;

  if (profile?.dateAD || profile?.dateBS) {
    try {
      const lat = profile.location?.latitude || 27.7172;
      const lng = profile.location?.longitude || 85.3240;
      const tz = profile.location?.timeZone || 5.75;
      const timeStr = profile.time && profile.time.trim() !== '' ? profile.time : '12:00';
      hasTime = Boolean(profile.time && profile.time.trim() !== '');

      natalAstro = getCachedAstroCalculation(profile.dateAD, timeStr, lat, lng, tz);
      hasValidBirthData = Boolean(natalAstro?.moon);
    } catch (e) {
      console.warn('Natal calculation fallback:', e);
    }
  }

  // Resolve Active Rashi ID
  let activeRashiId = preferredRashiId || 1;
  let activeRashiName = 'मेष';
  let janmaNakshatraName = '';
  let lagnaName = '';

  if (hasValidBirthData && natalAstro?.moon) {
    if (!preferredRashiId) {
      activeRashiId = natalAstro.moon.rashiId;
    }
    activeRashiName = natalAstro.moon.rashiName;
    janmaNakshatraName = natalAstro.moon.nakshatraName || '';
    lagnaName = natalAstro.lagna?.rashiName || '';
  } else if (profile?.moonRashi) {
    const matched = RASHI_DATA.find(r => r.name === profile.moonRashi);
    if (matched && !preferredRashiId) {
      activeRashiId = matched.id;
    }
  }

  const selectedRashiObj = RASHI_DATA.find(r => r.id === activeRashiId) || RASHI_DATA[0];
  const rashiDisplayName = selectedRashiObj.name;

  // Transit Moon calculation
  const transitMoon = transitPlanets.find(p => p.name === 'चन्द्र') || natalAstro?.moon;
  const transitMoonRashiId = transitMoon?.rashiId || todayPanchanga.tithi?.number || 1;
  const transitNakshatraId = todayPanchanga.nakshatra?.number || 1;

  // Chandrabala & Tarabala
  let chandrabalaResult = null;
  let tarabalaResult = null;
  let sadeSatiResult = null;
  let dashaInfo = null;

  if (hasValidBirthData && natalAstro?.moon) {
    const cb = calculateChandrabala(natalAstro.moon.rashiId, transitMoonRashiId);
    if (cb) {
      chandrabalaResult = {
        house: cb.houseFromMoon,
        isFavorable: cb.isFavorable,
        statusNepali: cb.statusNepali
      };
    }

    const tb = calculateTarabala(natalAstro.moon.nakshatraId || 1, transitNakshatraId);
    if (tb) {
      tarabalaResult = {
        taraName: tb.taraNameNepali,
        isFavorable: tb.isFavorable,
        statusNepali: tb.statusNepali
      };
    }

    // Sade Sati
    const todayAD = new Date().toISOString().split('T')[0];
    const ss = calculateGocharAndSadeSati(natalAstro.moon, transitPlanets, todayAD);
    if (ss?.sadeSati) {
      sadeSatiResult = ss.sadeSati.phaseName || ss.sadeSati.status || 'साढेसाती छैन (मुक्त)';
    }

    // Dasha
    if (natalAstro.dasha) {
      dashaInfo = {
        mahadasha: natalAstro.dasha.currentMahadasha?.planet || 'गुरु',
        antardasha: natalAstro.dasha.currentAntardasha?.planet || 'शनि'
      };
    }
  }

  // Get Base Published Daily Item from DB Store
  const baseItem = getDailyRashifalForRashi(activeRashiId, dateBS);

  // Synthesize personalized guidance paragraph
  const nativeName = profile?.name || 'जातक';
  let personalSynthesis = '';

  if (hasValidBirthData) {
    const cbText = chandrabalaResult?.isFavorable
      ? `चन्द्रबल अनुकूल (${toDevanagariNumerals(chandrabalaResult.house)} औँ भाव) रहेकाले मनोबल उच्च र कार्यसिद्धि सहज`
      : `चन्द्रमाको स्थिति सतर्कतापूर्ण (${toDevanagariNumerals(chandrabalaResult?.house || 1)} औँ भाव) रहेकाले संवेदनशील काममा धैर्य आवश्यक`;

    const tbText = tarabalaResult?.isFavorable
      ? `ताराबल (${tarabalaResult.taraName}) ले साथ दिनेछ`
      : `ताराबल (${tarabalaResult?.taraName || 'साधारण'}) का कारण हतारमा निर्णय लिनु उपयुक्त नहुनेछ`;

    const dashaText = dashaInfo
      ? `हाल चलिरहेको ${dashaInfo.mahadasha}को महादशा र ${dashaInfo.antardasha}को अन्तर्दशाको ऊर्जासँग तालमेल मिलाई अघि बढ्दा लाभ मिल्नेछ।`
      : '';

    personalSynthesis = `आदरणीय ${nativeName} ज्यू, तपाईंको जन्म लग्न (${lagnaName || 'लग्न'}), जन्म राशि (${activeRashiName}) तथा नक्षत्र (${janmaNakshatraName || 'नक्षत्र'}) का आधारमा आजको दिन ${cbText} र ${tbText}। ${dashaText}`;
  } else {
    personalSynthesis = `यो फलादेश वैदिक ज्योतिषको परम्परागत मान्यताअनुसार ${rashiDisplayName} राशिका लागि तयार पारिएको सामान्य दैनिक फलादेश हो।`;
  }

  return {
    isPersonalized: hasValidBirthData,
    hasTimeOfBirth: hasTime,
    tierLabel: hasValidBirthData
      ? (hasTime ? 'पूर्ण व्यक्तिगत कुण्डली आधारित फलादेश' : 'जन्ममिति तथा चन्द्रराशि आधारित फलादेश')
      : 'चन्द्रराशि आधारित सामान्य फलादेश',
    nativeName,
    janmaRashi: activeRashiName,
    janmaRashiId: activeRashiId,
    janmaNakshatra: janmaNakshatraName,
    lagnaName,
    chandrabala: chandrabalaResult,
    tarabala: tarabalaResult,
    currentDasha: dashaInfo,
    sadeSatiStatus: sadeSatiResult,
    item: {
      ...baseItem,
      rashiName: rashiDisplayName
    },
    personalSynthesis
  };
}

/**
 * Generate Personalized Monthly Horoscope
 */
export function generatePersonalizedMonthlyRashifal(
  profile: BirthDetails | null,
  yearBS?: number,
  monthBS?: number,
  preferredRashiId?: number
): PersonalizedMonthlyResult {
  let activeRashiId = preferredRashiId || 1;
  let activeRashiName = 'मेष';
  const nativeName = profile?.name || 'जातक';
  let isPersonalized = false;

  if (profile) {
    isPersonalized = true;
    if (profile.moonRashi && !preferredRashiId) {
      const found = RASHI_DATA.find(r => r.name === profile.moonRashi);
      if (found) activeRashiId = found.id;
    }
  }

  const selectedRashiObj = RASHI_DATA.find(r => r.id === activeRashiId) || RASHI_DATA[0];
  activeRashiName = selectedRashiObj.name;

  const baseItem = getMonthlyRashifalForRashi(activeRashiId, yearBS, monthBS);

  const personalMonthlySynthesis = isPersonalized
    ? `आदरणीय ${nativeName} ज्यू, तपाईंको जन्मराशि (${activeRashiName}) मा यस महिना गोचर ग्रहहरूको स्थितिले कार्यक्षेत्र र आर्थिक योजनाहरूलाई स्थायित्व प्रदान गर्नेछ। महिनाको शुभ समयमा नयाँ लगानी र पारिवारिक सल्लाहमा अघि बढ्नुहोला।`
    : `यस महिना ${activeRashiName} राशिका जातकहरूका लागि गोचर ग्रहहरूको सामान्य विश्लेषण प्रस्तुत गरिएको छ।`;

  return {
    isPersonalized,
    tierLabel: isPersonalized ? 'व्यक्तिगत कुण्डली तथा राशि आधारित' : 'चन्द्रराशि आधारित सामान्य मासिक फलादेश',
    nativeName,
    janmaRashi: activeRashiName,
    janmaRashiId: activeRashiId,
    item: baseItem,
    personalMonthlySynthesis
  };
}

/**
 * Generate Personalized Yearly Horoscope
 */
export function generatePersonalizedYearlyRashifal(
  profile: BirthDetails | null,
  yearBS?: number,
  preferredRashiId?: number
): PersonalizedYearlyResult {
  let activeRashiId = preferredRashiId || 1;
  let activeRashiName = 'मेष';
  const nativeName = profile?.name || 'जातक';
  let isPersonalized = false;

  if (profile) {
    isPersonalized = true;
    if (profile.moonRashi && !preferredRashiId) {
      const found = RASHI_DATA.find(r => r.name === profile.moonRashi);
      if (found) activeRashiId = found.id;
    }
  }

  const selectedRashiObj = RASHI_DATA.find(r => r.id === activeRashiId) || RASHI_DATA[0];
  activeRashiName = selectedRashiObj.name;

  const baseItem = getYearlyRashifalForRashi(activeRashiId, yearBS);

  const personalYearlySynthesis = isPersonalized
    ? `आदरणीय ${nativeName} ज्यू, वि.सं. ${toDevanagariNumerals(baseItem.yearBS)} सालभरि तपाईंको जन्मराशि (${activeRashiName}) का लागि देवगुरु बृहस्पति र कर्मफलदाता शनिको गोचरले विशेष भाग्योदय तथा कार्यक्षेत्रमा प्रगतिको संकेत गरेको छ। धार्मिक साधना र सन्तुलित निर्णयले वर्षलाई स्वर्णिम बनाउनेछ।`
    : `वि.सं. ${toDevanagariNumerals(baseItem.yearBS)} सालका लागि ${activeRashiName} राशिको समग्र वार्षिक ज्योतिषीय विश्लेषण प्रस्तुत गरिएको छ।`;

  return {
    isPersonalized,
    tierLabel: isPersonalized ? 'व्यक्तिगत कुण्डली तथा जन्मराशि आधारित वार्षिक फलादेश' : 'चन्द्रराशि आधारित सामान्य वार्षिक फलादेश',
    nativeName,
    janmaRashi: activeRashiName,
    janmaRashiId: activeRashiId,
    item: baseItem,
    personalYearlySynthesis
  };
}
