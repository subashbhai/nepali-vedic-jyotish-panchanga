/**
 * Multi-Sambat Conversion Engine (बहु-संवत् रूपान्तरण इन्जिन)
 * Supports:
 * 1. Vikram Sambat (विक्रम संवत् - BS)
 * 2. Nepal Sambat / Newa Sambat (नेपाल संवत् / नेवाः संवत् - NS)
 * 3. Tibetan / Himalayan / Nema Sambat (नेमा तिब्बती संवत् - बोद/लोसार संवत्)
 * 4. Gregorian Calendar (ईस्वी संवत् - AD)
 */

import {
  convertADToBSFull,
  convertBSToADFull,
  getBSDaysInMonth,
  getSamvatsaraForBSYear,
  getRituForBSMonth,
  getAyanaForBSMonth,
  NEPALI_MONTH_NAMES,
  DAYS_NEPALI_FULL
} from './bsCalendarData';
import { calculateTibetanYear } from '../core/tibetan/tibetanCalendarEngine';
import { toDevanagariNumerals } from './nepaliCalendar';
import { calculatePanchanga, MHA_PUJA_KARTIK_DAYS } from './panchangaEngine';

// 12 Nepal Sambat Months (नेपाल संवत्‌का १२ महिनाहरू)
export interface NepalSambatMonth {
  index: number; // 0 to 11
  nameNewa: string;
  nameNepali: string;
  approxBsMonthIndex: number; // roughly corresponding BS month (0-indexed)
  seasonNepali: string;
}

export const NEPAL_SAMBAT_MONTHS: NepalSambatMonth[] = [
  { index: 0, nameNewa: 'कछला (Kachhalā)', nameNepali: 'कछला (कात्तिक शुक्ल प्रतिपदा देखि)', approxBsMonthIndex: 6, seasonNepali: 'शरद्' },
  { index: 1, nameNewa: 'थिंला (Thinlā)', nameNepali: 'थिंला (मङ्सिर)', approxBsMonthIndex: 7, seasonNepali: 'हेमन्त' },
  { index: 2, nameNewa: 'प्वँहेला (Pwonhelā)', nameNepali: 'प्वँहेला (पुस)', approxBsMonthIndex: 8, seasonNepali: 'हेमन्त' },
  { index: 3, nameNewa: 'सिल्ला (Sillā)', nameNepali: 'सिल्ला (माघ)', approxBsMonthIndex: 9, seasonNepali: 'शिशिर' },
  { index: 4, nameNewa: 'चिला (Chilā)', nameNepali: 'चिला (फागुन)', approxBsMonthIndex: 10, seasonNepali: 'शिशिर' },
  { index: 5, nameNewa: 'चौला (Chaulā)', nameNepali: 'चौला (चैत)', approxBsMonthIndex: 11, seasonNepali: 'वसन्त' },
  { index: 6, nameNewa: 'बछला (Bachhalā)', nameNepali: 'बछला (वैशाख)', approxBsMonthIndex: 0, seasonNepali: 'वसन्त' },
  { index: 7, nameNewa: 'तछला (Tachhalā)', nameNepali: 'तछला (जेठ)', approxBsMonthIndex: 1, seasonNepali: 'ग्रीष्म' },
  { index: 8, nameNewa: 'दिल्ला (Dillā)', nameNepali: 'दिल्ला (असार)', approxBsMonthIndex: 2, seasonNepali: 'वर्षा' },
  { index: 9, nameNewa: 'गुंला (Gunlā)', nameNepali: 'गुंला (साउन)', approxBsMonthIndex: 3, seasonNepali: 'वर्षा' },
  { index: 10, nameNewa: 'ञला (Yanlā)', nameNepali: 'ञला / यंला (भदौ)', approxBsMonthIndex: 4, seasonNepali: 'शरद्' },
  { index: 11, nameNewa: 'कौला (Kaulā)', nameNepali: 'कौला (असोज)', approxBsMonthIndex: 5, seasonNepali: 'शरद्' },
];

export const NEPAL_SAMBAT_PAKSHAS = [
  { id: 'thwa', nameNewa: 'थ्व (Thwa)', nameNepali: 'शुक्ल पक्ष (Bright Half)' },
  { id: 'ga', nameNewa: 'गा (Gā)', nameNepali: 'कृष्ण पक्ष (Dark Half)' },
];

export const NEWA_TITHIS = [
  'पारु (Pratipada / 1)',
  'दुतिया (Dwitiya / 2)',
  'तितिया (Tritiya / 3)',
  'चौथि (Chaturthi / 4)',
  'पञ्चमि (Panchami / 5)',
  'खस्तमि (Shashthi / 6)',
  'सप्तमि (Saptami / 7)',
  'अष्टमी (Ashtami / 8)',
  'नवमि (Navami / 9)',
  'दसमि (Dashami / 10)',
  'एकादसि (Ekadashi / 11)',
  'दुवादसि (Dwadashi / 12)',
  'त्रयोदसि (Trayodashi / 13)',
  'चह्रे (Chaturdashi / 14)',
  'पुन्हि / अमाइ (Purnima / Amavasya / 15)',
];

export interface MultiSambatResult {
  // Bikram Sambat
  bs: {
    year: number;
    month: number; // 1 to 12
    day: number;
    monthNameNepali: string;
    dayNameNepali: string;
    formatted: string;
    samvatsara: string;
    ritu: string;
    ayana: string;
  };
  // Gregorian (AD)
  ad: {
    year: number;
    month: number;
    day: number;
    dateString: string;
    dayOfWeek: string;
    formatted: string;
  };
  // Nepal Sambat (Newa Sambat)
  ns: {
    year: number;
    monthIndex: number;
    monthNameNewa: string;
    monthNameNepali: string;
    paksha: 'thwa' | 'ga';
    pakshaName: string;
    tithiDay: number; // 1 to 15
    tithiNameNewa: string;
    formatted: string;
    sankhadharInfo: string;
  };
  // Tibetan / Nema Sambat
  tibetan: {
    royalYear: number; // Bod Gyalo (ग्याल्पो ल्होसार संवत् = AD + 127)
    sonamYear: number; // Manjushree Sambat (सोनाम ल्होसार संवत् = AD + 840)
    tamuYear: number; // Tamu Sambat (तमु ल्होसार संवत् = AD + 584)
    rabjungNumber: number;
    rabjungYear: number;
    animalNepali: string;
    animalTibetan: string;
    elementNepali: string;
    polarity: string;
    mewaNumber: number;
    formatted: string;
    cycleDescription: string;
  };
}

/**
 * Determine Nepal Sambat year from BS date.
 * Nepal Sambat changes on Kartik Shukla Pratipada (Mha Puja / म्हपूजा).
 * Before Mha Puja in Kartik: NS Year = BS Year - 937
 * From Mha Puja in Kartik onwards: NS Year = BS Year - 936
 */
export function getNepalSambatYearFromBS(bsYear: number, bsMonth: number, bsDay: number): number {
  const mhaDay = MHA_PUJA_KARTIK_DAYS[bsYear] || 15;
  if (bsMonth > 7 || (bsMonth === 7 && bsDay >= mhaDay)) {
    return bsYear - 936;
  }
  return bsYear - 937;
}

/**
 * Map BS Date to exact Nepal Sambat Month, Paksha & Tithi
 */
export function getNepalSambatMonthFromBS(bsMonth: number, bsDay: number, bsYear?: number): {
  monthIndex: number;
  paksha: 'thwa' | 'ga';
  tithiDay: number;
} {
  if (bsYear) {
    try {
      const adDateStr = convertBSToADFull(bsYear, bsMonth, bsDay);
      const panchanga = calculatePanchanga(adDateStr);
      const amantaIdx = panchanga.masaInfo.amantaMasaIndex ?? 5;
      const monthIndex = (amantaIdx - 7 + 12) % 12;
      const paksha: 'thwa' | 'ga' = panchanga.tithi.paksha === 'शुक्ल' ? 'thwa' : 'ga';
      const tithiDay = panchanga.tithi.number > 15 ? panchanga.tithi.number - 15 : panchanga.tithi.number;
      return { monthIndex, paksha, tithiDay };
    } catch {}
  }
  // Approximate mapping fallback
  const monthMap = [6, 7, 8, 9, 10, 11, 0, 1, 2, 3, 4, 5];
  const monthIdx = monthMap[bsMonth - 1] ?? 0;
  const paksha: 'thwa' | 'ga' = bsDay <= 15 ? 'thwa' : 'ga';
  let tithiDay = bsDay <= 15 ? bsDay : (bsDay - 15);
  if (tithiDay > 15) tithiDay = 15;
  if (tithiDay < 1) tithiDay = 1;
  return { monthIndex: monthIdx, paksha, tithiDay };
}

/**
 * Convert any BS Date to Full Multi-Sambat Result using exact astronomical calculations
 */
export function convertBSToMultiSambat(yearBS: number, monthBS: number, dayBS: number): MultiSambatResult {
  const adDateStr = convertBSToADFull(yearBS, monthBS, dayBS);
  const adParts = adDateStr.split('-');
  const gYear = parseInt(adParts[0], 10);
  const gMonth = parseInt(adParts[1], 10);
  const gDay = parseInt(adParts[2], 10);

  // Day of week
  const dateObj = new Date(gYear, gMonth - 1, gDay);
  const dayOfWeekIdx = dateObj.getDay();
  const dayNameNepali = DAYS_NEPALI_FULL[dayOfWeekIdx] || 'आइतवार';
  const adDayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

  // Authoritative Astronomical Panchanga for exact Nepal Sambat
  const panchanga = calculatePanchanga(adDateStr);
  const nsYear = panchanga.nepalSamvat || getNepalSambatYearFromBS(yearBS, monthBS, dayBS);
  const amantaIdx = panchanga.masaInfo.amantaMasaIndex ?? 5;
  const monthIndex = (amantaIdx - 7 + 12) % 12;
  const nsMonth = NEPAL_SAMBAT_MONTHS[monthIndex] || NEPAL_SAMBAT_MONTHS[0];
  const paksha: 'thwa' | 'ga' = panchanga.tithi.paksha === 'शुक्ल' ? 'thwa' : 'ga';
  const pakshaObj = NEPAL_SAMBAT_PAKSHAS.find(p => p.id === paksha) || NEPAL_SAMBAT_PAKSHAS[0];
  const tithiDay = panchanga.tithi.number > 15 ? panchanga.tithi.number - 15 : panchanga.tithi.number;
  const tithiName = NEWA_TITHIS[tithiDay - 1] || `${panchanga.tithi.name} / ${tithiDay}`;

  // Tibetan / Nema Sambat
  const tibetanInfo = calculateTibetanYear(adDateStr);
  const sonamYear = gYear + 840;
  const tamuYear = gYear + 584;
  const mewaNumber = ((10 - ((gYear - 1924) % 9 + 9) % 9) % 9) || 9;

  return {
    bs: {
      year: yearBS,
      month: monthBS,
      day: dayBS,
      monthNameNepali: NEPALI_MONTH_NAMES[monthBS - 1] || '',
      dayNameNepali,
      formatted: `${toDevanagariNumerals(yearBS)} ${NEPALI_MONTH_NAMES[monthBS - 1]} ${toDevanagariNumerals(dayBS)} गते (${dayNameNepali})`,
      samvatsara: getSamvatsaraForBSYear(yearBS),
      ritu: getRituForBSMonth(monthBS),
      ayana: getAyanaForBSMonth(monthBS)
    },
    ad: {
      year: gYear,
      month: gMonth,
      day: gDay,
      dateString: adDateStr,
      dayOfWeek: adDayOfWeek,
      formatted: `${adDateStr} (${adDayOfWeek})`
    },
    ns: {
      year: nsYear,
      monthIndex,
      monthNameNewa: nsMonth.nameNewa,
      monthNameNepali: nsMonth.nameNepali,
      paksha,
      pakshaName: pakshaObj.nameNepali,
      tithiDay,
      tithiNameNewa: tithiName,
      formatted: `ने.सं: ${nsYear} ${nsMonth.nameNewa.split(' ')[0]}${pakshaObj.nameNewa.split(' ')[0]} ${panchanga.tithi.name} - ${tithiDay}`,
      sankhadharInfo: 'राष्ट्रिय विभूति शङ्खधर साख्वा द्वारा प्रवर्द्धित नेपालको मौलिक संवत्'
    },
    tibetan: {
      royalYear: tibetanInfo.tibetanYear,
      sonamYear,
      tamuYear,
      rabjungNumber: tibetanInfo.rabjungNumber,
      rabjungYear: tibetanInfo.rabjungYearInCycle,
      animalNepali: tibetanInfo.animal.nameNepali,
      animalTibetan: tibetanInfo.animal.nameTibetan,
      elementNepali: tibetanInfo.element.nameNepali,
      polarity: tibetanInfo.polarity,
      mewaNumber,
      formatted: `बोद संवत् ${toDevanagariNumerals(tibetanInfo.tibetanYear)} (${tibetanInfo.element.nameNepali} ${tibetanInfo.animal.nameNepali})`,
      cycleDescription: `${tibetanInfo.rabjungNumber}औं रबजुङ: ${tibetanInfo.element.nameNepali} ${tibetanInfo.animal.nameNepali} वर्ष [${tibetanInfo.polarity}]`
    }
  };
}

/**
 * Convert Gregorian (AD) Date to Full Multi-Sambat Result
 */
export function convertADToMultiSambat(dateAD: string): MultiSambatResult {
  const bsResult = convertADToBSFull(dateAD);
  return convertBSToMultiSambat(bsResult.year, bsResult.month, bsResult.day);
}

/**
 * Convert Nepal Sambat (NS) Date to Multi-Sambat Result using exact astronomical matching
 * nsYear: e.g. 1146
 * monthIndex: 0 (Kachhala) to 11 (Kaula)
 * paksha: 'thwa' | 'ga'
 * tithiDay: 1 to 15
 */
export function convertNSToMultiSambat(
  nsYear: number,
  monthIndex: number,
  paksha: 'thwa' | 'ga',
  tithiDay: number
): MultiSambatResult {
  // Approximate BS year and month:
  // Month 0 (Kachhala) starts around Kartik (BS month 7)
  const targetBsYear = monthIndex <= 5 ? nsYear + 936 : nsYear + 937;
  const monthMapToBS = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6];
  const targetBsMonth = monthMapToBS[monthIndex];

  // Try surrounding days in this month and adjacent months for exact astronomical match
  for (let mOffset = 0; mOffset <= 2; mOffset++) {
    const offset = mOffset === 0 ? 0 : mOffset === 1 ? -1 : 1;
    let testMonth = targetBsMonth + offset;
    let testYear = targetBsYear;
    if (testMonth < 1) { testMonth = 12; testYear--; }
    if (testMonth > 12) { testMonth = 1; testYear++; }

    const maxDays = getBSDaysInMonth(testYear, testMonth);
    for (let day = 1; day <= maxDays; day++) {
      try {
        const adDateStr = convertBSToADFull(testYear, testMonth, day);
        const p = calculatePanchanga(adDateStr);
        const pNsYear = p.nepalSamvat || getNepalSambatYearFromBS(testYear, testMonth, day);
        const pAmantaIdx = p.masaInfo.amantaMasaIndex ?? 5;
        const pMonthIdx = (pAmantaIdx - 7 + 12) % 12;
        const pPaksha: 'thwa' | 'ga' = p.tithi.paksha === 'शुक्ल' ? 'thwa' : 'ga';
        const pTithiDay = p.tithi.number > 15 ? p.tithi.number - 15 : p.tithi.number;

        if (
          pNsYear === nsYear &&
          pMonthIdx === monthIndex &&
          pPaksha === paksha &&
          pTithiDay === tithiDay
        ) {
          return convertBSToMultiSambat(testYear, testMonth, day);
        }
      } catch {}
    }
  }

  // Graceful fallback if exact match not found
  const baseDay = paksha === 'thwa' ? tithiDay : tithiDay + 15;
  const maxDays = getBSDaysInMonth(targetBsYear, targetBsMonth);
  const safeBsDay = Math.min(Math.max(baseDay, 1), maxDays);
  return convertBSToMultiSambat(targetBsYear, targetBsMonth, safeBsDay);
}

/**
 * Convert Tibetan / Nema Sambat (Bod Year) to Multi-Sambat Result
 * bodYear: e.g. 2151
 * tibetanMonth: 1 to 12
 * tibetanDay: 1 to 30
 */
export function convertTibetanToMultiSambat(
  bodYear: number,
  tibetanMonth: number,
  tibetanDay: number
): MultiSambatResult {
  // Royal Tibetan Year = Gregorian Year + 127
  const gYear = bodYear - 127;
  // Approximate month: Tibetan month 1 (Losar) is around February (month 2)
  const gMonth = Math.min(Math.max(((tibetanMonth + 0) % 12) + 1, 1), 12);
  const gDay = Math.min(Math.max(tibetanDay, 1), 28);

  const adDateStr = `${gYear}-${String(gMonth).padStart(2, '0')}-${String(gDay).padStart(2, '0')}`;
  return convertADToMultiSambat(adDateStr);
}
