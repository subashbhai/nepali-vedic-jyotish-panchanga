/**
 * Vedic Ritu Engine (षड्ऋतु निर्णय तथा शास्त्रोक्त सङ्कल्प इन्जिन)
 * Authoritative 6-Ritu Astronomical & Shastriya Engine based on Nepal Panchanga Nirnayak Samiti
 * and Surya Siddhanta Vedic Tradition.
 * 
 * षड्ऋतवः (The 6 Vedic Seasons):
 * 1. वसन्त (Vasanta - Spring):    चैत्र (Chaitra - 12) & वैशाख (Baishakh - 1)  | वैदिक नाम: मधु र माधव  | सौर राशि: मीन र मेष
 * 2. ग्रीष्म (Grishma - Summer):    ज्येष्ठ/जेठ (Jestha - 2) & आषाढ/असार (Ashadh - 3) | वैदिक नाम: शुक्र र शुचि | सौर राशि: वृष र मिथुन
 * 3. वर्षा (Varsha - Monsoon):     श्रावण/साउन (Shrawan - 4) & भाद्र/भदौ (Bhadra - 5) | वैदिक नाम: नभ र नभस्य | सौर राशि: कर्कट र सिंह
 * 4. शरद् (Sharad - Autumn):       आश्विन/असोज (Ashwin - 6) & कार्तिक/कात्तिक (Kartik - 7) | वैदिक नाम: इष र ऊर्ज  | सौर राशि: कन्या र तुला
 * 5. हेमन्त (Hemanta - Pre-winter): मार्गशीर्ष/मङ्सिर (Mangsir - 8) & पौष/पुस (Poush - 9) | वैदिक नाम: सह र सहस्य | सौर राशि: वृश्चिक र धनु
 * 6. शिशिर (Shishira - Winter):    माघ (Magh - 10) & फाल्गुन/फागुन (Falgun - 11) | वैदिक नाम: तप र तपस्य | सौर राशि: मकर र कुम्भ
 */

export type VedicRituKey = 'vasanta' | 'grishma' | 'varsha' | 'sharad' | 'hemanta' | 'shishira';

export interface VedicRituDefinition {
  key: VedicRituKey;
  nameNepali: 'वसन्त' | 'ग्रीष्म' | 'वर्षा' | 'शरद्' | 'हेमन्त' | 'शिशिर';
  nameSanskrit: string;
  sanskritLocative: string; // e.g. 'शरद् ऋतौ' (वा 'शरत् ऋतौ') for Sankalpa
  vedicMonthsSanskrit: [string, string]; // e.g. ['इष', 'ऊर्ज']
  bsMonthIndices: [number, number]; // 1-indexed BS month numbers e.g. [6, 7]
  bsMonthNamesNepali: [string, string]; // e.g. ['असोज/आश्विन', 'कात्तिक/कार्तिक']
  solarRashis: [string, string]; // e.g. ['कन्या', 'तुला']
  englishName: string;
  presidingDeity: string;
  seasonalDescriptionNepali: string;
  majorFestivalsNepali: string[];
}

export const VEDIC_RITU_CATALOG: Record<VedicRituKey, VedicRituDefinition> = {
  vasanta: {
    key: 'vasanta',
    nameNepali: 'वसन्त',
    nameSanskrit: 'वसन्त',
    sanskritLocative: 'वसन्त ऋतौ',
    vedicMonthsSanskrit: ['मधु', 'माधव'],
    bsMonthIndices: [12, 1], // Chaitra (12), Baishakh (1)
    bsMonthNamesNepali: ['चैत्र/चैत', 'वैशाख'],
    solarRashis: ['मीन', 'मेष'],
    englishName: 'Spring Season',
    presidingDeity: 'श्रीसरस्वती तथा कामदेव (वसन्तराज)',
    seasonalDescriptionNepali: 'वृक्षहरूमा नयाँ पालुवा पलाउने, कोइलीको कुहू-कुहू धुन र मौसम मनमोहक हुने ऋतुराज वसन्त।',
    majorFestivalsNepali: ['वसन्त पञ्चमी (सरस्वती पूजा)', 'फागु पूर्णिमा (होली)', 'नयाँ वर्ष (मेष संक्रान्ति)', 'चैते दशैँ', 'रामनवमी'],
  },
  grishma: {
    key: 'grishma',
    nameNepali: 'ग्रीष्म',
    nameSanskrit: 'ग्रीष्म',
    sanskritLocative: 'ग्रीष्म ऋतौ',
    vedicMonthsSanskrit: ['शुक्र', 'शुचि'],
    bsMonthIndices: [2, 3], // Jestha (2), Ashadh (3)
    bsMonthNamesNepali: ['ज्येष्ठ/जेठ', 'आषाढ/असार'],
    solarRashis: ['वृषभ', 'मिथुन'],
    englishName: 'Summer Season',
    presidingDeity: 'भगवान् सूर्य तथा अग्निदेव',
    seasonalDescriptionNepali: 'सूर्यको ताप तीव्र हुने, पृथ्वी तप्त हुने र नदी-नाला तथा वातावरणमा प्रचण्ड गर्मीको अनुभूति हुने ग्रीष्म काल।',
    majorFestivalsNepali: ['बुद्ध जयन्ती', 'उभौली पर्व', 'गंगा दशहरा', 'निर्जला एकादशी', 'असार १५ (दही चिउरा)'],
  },
  varsha: {
    key: 'varsha',
    nameNepali: 'वर्षा',
    nameSanskrit: 'वर्षा',
    sanskritLocative: 'वर्षा ऋतौ',
    vedicMonthsSanskrit: ['नभ', 'नभस्य'],
    bsMonthIndices: [4, 5], // Shrawan (4), Bhadra (5)
    bsMonthNamesNepali: ['श्रावण/साउन', 'भाद्र/भदौ'],
    solarRashis: ['कर्कट', 'सिंह'],
    englishName: 'Monsoon / Rainy Season',
    presidingDeity: 'देवराज इन्द्र तथा भगवान् शिव',
    seasonalDescriptionNepali: 'मेघ गर्जन सहित मुसलधारे वर्षा हुने, खोलानाला भरिने र प्रकृतिको हरियाली चरमोत्कर्षमा पुग्ने वर्षा काल।',
    majorFestivalsNepali: ['श्रावण संक्रान्ति (कर्कट संक्रान्ति - दक्षिणायन)', 'नागपञ्चमी', 'जनैपूर्णिमा (रक्षाबन्धन)', 'श्रीकृष्ण जन्माष्टमी', 'हरितालिका तीज', 'ऋषिपञ्चमी'],
  },
  sharad: {
    key: 'sharad',
    nameNepali: 'शरद्',
    nameSanskrit: 'शरद्',
    sanskritLocative: 'शरद् ऋतौ',
    vedicMonthsSanskrit: ['इष', 'ऊर्ज'],
    bsMonthIndices: [6, 7], // Ashwin (6), Kartik (7)
    bsMonthNamesNepali: ['आश्विन/असोज', 'कार्तिक/कात्तिक'],
    solarRashis: ['कन्या', 'तुला'],
    englishName: 'Autumn Season',
    presidingDeity: 'श्रीमहादुर्गा तथा महालक्ष्मी',
    seasonalDescriptionNepali: 'आकाश नीलो र निर्मल हुने, बादल फाट्ने, चाँदी जस्तै टलक्क जून लाग्ने र महान् चाडपर्वहरूको पावन समय शरद् काल।',
    majorFestivalsNepali: ['सोह्र श्राद्ध (पितृपक्ष)', 'बडादशैँ (घटस्थापना, विजयादशमी)', 'कोजाग्रत पूर्णिमा', 'यमपञ्चक (तिहार/दीपावली)', 'लक्ष्मीपूजा', 'भाइटीका', 'छठ पर्व'],
  },
  hemanta: {
    key: 'hemanta',
    nameNepali: 'हेमन्त',
    nameSanskrit: 'हेमन्त',
    sanskritLocative: 'हेमन्त ऋतौ',
    vedicMonthsSanskrit: ['सह', 'सहस्य'],
    bsMonthIndices: [8, 9], // Mangsir (8), Poush (9)
    bsMonthNamesNepali: ['मार्गशीर्ष/मङ्सिर', 'पौष/पुस'],
    solarRashis: ['वृश्चिक', 'धनु'],
    englishName: 'Pre-Winter Season',
    presidingDeity: 'भगवान् श्रीविष्णु (नारायण)',
    seasonalDescriptionNepali: 'शीतको थोपा खस्ने, बिहानीपख कुहिरो लाग्ने, धान थन्क्याउने र जाडोको सुरुआत हुने हेमन्त काल।',
    majorFestivalsNepali: ['हरिबोधिनी एकादशी (तुलसी विवाह)', 'बालाचतुर्दशी', 'विवाह पञ्चमी', 'उधौली पर्व', 'धान्य पूर्णिमा (योमरी पुन्ही)'],
  },
  shishira: {
    key: 'shishira',
    nameNepali: 'शिशिर',
    nameSanskrit: 'शिशिर',
    sanskritLocative: 'शिशिर ऋतौ',
    vedicMonthsSanskrit: ['तप', 'तपस्य'],
    bsMonthIndices: [10, 11], // Magh (10), Falgun (11)
    bsMonthNamesNepali: ['माघ', 'फाल्गुन/फागुन'],
    solarRashis: ['मकर', 'कुम्भ'],
    englishName: 'Winter Season',
    presidingDeity: 'भगवान् सूर्यदेव तथा रुद्र',
    seasonalDescriptionNepali: 'अत्यधिक चिसो हुने, हिउँ पर्ने, पातहरू झर्ने र उत्तरायणको आगमनसँगै दिन लामो हुँदै जाने शिशिर काल।',
    majorFestivalsNepali: ['माघे संक्रान्ति (मकर संक्रान्ति - उत्तरायण)', 'श्रीस्वस्थानी व्रत आरम्भ', 'माघी पर्व', 'महाशिवरात्रि', 'सोनाम ल्होसार'],
  },
};

/**
 * 1-indexed BS Month to Ritu mapping
 * Month 1 (Baishakh)  -> वसन्त
 * Month 2 (Jestha)    -> ग्रीष्म
 * Month 3 (Ashadh)    -> ग्रीष्म
 * Month 4 (Shrawan)   -> वर्षा
 * Month 5 (Bhadra)    -> वर्षा
 * Month 6 (Ashwin)    -> शरद् (शरद)
 * Month 7 (Kartik)    -> शरद् (शरद)
 * Month 8 (Mangsir)   -> हेमन्त
 * Month 9 (Poush)     -> हेमन्त
 * Month 10 (Magh)     -> शिशिर
 * Month 11 (Falgun)   -> शिशिर
 * Month 12 (Chaitra)  -> वसन्त
 */
const BS_MONTH_RITU_KEY_MAP: Record<number, VedicRituKey> = {
  1: 'vasanta',   // वैशाख
  2: 'grishma',   // जेठ
  3: 'grishma',   // असार
  4: 'varsha',    // साउन
  5: 'varsha',    // भदौ
  6: 'sharad',    // असोज / आश्विन
  7: 'sharad',    // कात्तिक / कार्तिक
  8: 'hemanta',   // मङ्सिर / मार्गशीर्ष
  9: 'hemanta',   // पुस / पौष
  10: 'shishira', // माघ
  11: 'shishira', // फागुन / फाल्गुन
  12: 'vasanta',  // चैत / चैत्र
};

/**
 * Normalize any Nepali/Sanskrit month string or number to 1-12 index
 */
export function normalizeBSMonthToIndex(monthInput: number | string): number {
  if (typeof monthInput === 'number') {
    if (monthInput >= 1 && monthInput <= 12) return monthInput;
    return ((monthInput - 1 + 12) % 12) + 1;
  }

  const str = String(monthInput).trim().toLowerCase();
  
  // Direct numeric check in string
  const numParsed = parseInt(str, 10);
  if (!isNaN(numParsed) && numParsed >= 1 && numParsed <= 12) {
    return numParsed;
  }

  // Devanagari numbers
  const devNumbers: Record<string, number> = {
    '१': 1, '२': 2, '३': 3, '४': 4, '५': 5, '६': 6,
    '७': 7, '८': 8, '९': 9, '१०': 10, '११': 11, '१२': 12
  };
  if (devNumbers[str]) return devNumbers[str];

  // Month Name Map
  if (str.includes('वैशाख') || str.includes('बैशाख') || str.includes('baishakh') || str.includes('baisakh')) return 1;
  if (str.includes('ज्येष्ठ') || str.includes('जेठ') || str.includes('jestha') || str.includes('jyeshtha')) return 2;
  if (str.includes('आषाढ') || str.includes('असार') || str.includes('ashadh') || str.includes('asar')) return 3;
  if (str.includes('श्रावण') || str.includes('साउन') || str.includes('shrawan') || str.includes('saun')) return 4;
  if (str.includes('भाद्र') || str.includes('भदौ') || str.includes('bhadra') || str.includes('bhadau')) return 5;
  if (str.includes('आश्विन') || str.includes('असोज') || str.includes('ashwin') || str.includes('asoj') || str.includes('ashwin')) return 6;
  if (str.includes('कार्तिक') || str.includes('कात्तिक') || str.includes('kartik') || str.includes('kattik')) return 7;
  if (str.includes('मार्गशीर्ष') || str.includes('मंसिर') || str.includes('मङ्सिर') || str.includes('mangsir') || str.includes('margar')) return 8;
  if (str.includes('पौष') || str.includes('पुस') || str.includes('poush') || str.includes('pus') || str.includes('paush')) return 9;
  if (str.includes('माघ') || str.includes('magh')) return 10;
  if (str.includes('फाल्गुन') || str.includes('फागुन') || str.includes('falgun') || str.includes('phagun')) return 11;
  if (str.includes('चैत्र') || str.includes('चैत') || str.includes('chaitra') || str.includes('chait')) return 12;

  // Fallback to Baishakh
  return 1;
}

/**
 * Get Full Vedic Ritu Definition for any BS month or month name
 */
export function getVedicRituInfo(monthInput: number | string): VedicRituDefinition {
  const monthIdx = normalizeBSMonthToIndex(monthInput);
  const key = BS_MONTH_RITU_KEY_MAP[monthIdx] || 'vasanta';
  return VEDIC_RITU_CATALOG[key];
}

/**
 * Returns Standard Nepali Ritu Name (e.g. 'वसन्त', 'ग्रीष्म', 'वर्षा', 'शरद्', 'हेमन्त', 'शिशिर')
 * Drop-in replacement for old getRituForBSMonth with 100% correct Shastriya mapping
 */
export function getRituForBSMonth(bsMonth: number | string): 'वसन्त' | 'ग्रीष्म' | 'वर्षा' | 'शरद्' | 'हेमन्त' | 'शिशिर' {
  const info = getVedicRituInfo(bsMonth);
  return info.nameNepali;
}

/**
 * Returns Sanskrit Locative Ritu string for Vedic Sankalpa
 * Examples:
 * - 'वसन्त ऋतौ'
 * - 'ग्रीष्म ऋतौ'
 * - 'वर्षा ऋतौ'
 * - 'शरद् ऋतौ' (वा 'शरत् ऋतौ')
 * - 'हेमन्त ऋतौ'
 * - 'शिशिर ऋतौ'
 */
export function getRituSanskritLocative(monthOrRitu: number | string): string {
  if (typeof monthOrRitu === 'number' || (typeof monthOrRitu === 'string' && /^\d+$/.test(monthOrRitu.trim()))) {
    const info = getVedicRituInfo(monthOrRitu);
    return info.sanskritLocative;
  }

  const str = String(monthOrRitu).trim();
  if (str.includes('वसन्त') || str.includes('vasanta')) return 'वसन्त ऋतौ';
  if (str.includes('ग्रीष्म') || str.includes('grishma')) return 'ग्रीष्म ऋतौ';
  if (str.includes('वर्षा') || str.includes('varsha')) return 'वर्षा ऋतौ';
  if (str.includes('शरद') || str.includes('शरद्') || str.includes('sharad')) return 'शरद् ऋतौ';
  if (str.includes('हेमन्त') || str.includes('hemanta')) return 'हेमन्त ऋतौ';
  if (str.includes('शिशिर') || str.includes('shishira')) return 'शिशिर ऋतौ';

  // If month name passed (e.g., 'आश्विन', 'असोज', 'बैशाख')
  const info = getVedicRituInfo(str);
  return info.sanskritLocative;
}

/**
 * Returns Ayana for given BS Month or Sun's Rashi
 * मकर संक्रान्ति (माघ १) देखि असार मसान्तसम्म: उत्तरायण (६ महिना: माघ, फागुन, चैत, वैशाख, जेठ, असार)
 * कर्कट संक्रान्ति (साउन १) देखि पुस मसान्तसम्म: दक्षिणायन (६ महिना: साउन, भदौ, असोज, कात्तिक, मङ्सिर, पुस)
 */
export function getAyanaForBSMonth(bsMonth: number | string): 'उत्तरायण' | 'दक्षिणायन' {
  const monthIdx = normalizeBSMonthToIndex(bsMonth);
  // Month 10 (Magh), 11 (Falgun), 12 (Chaitra), 1 (Baishakh), 2 (Jestha), 3 (Ashadh) -> उत्तरायण
  if (monthIdx === 10 || monthIdx === 11 || monthIdx === 12 || monthIdx === 1 || monthIdx === 2 || monthIdx === 3) {
    return 'उत्तरायण';
  }
  // Month 4 (Shrawan), 5 (Bhadra), 6 (Ashwin), 7 (Kartik), 8 (Mangsir), 9 (Poush) -> दक्षिणायन
  return 'दक्षिणायन';
}

/**
 * Comprehensive Automated Ritu Test & Verification Suite (परीक्षण इन्जिन)
 * Verifies all 12 months, season boundaries, Sankalpa grammar, and returns a structured verification result.
 */
export interface RituTestResult {
  passed: boolean;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  details: Array<{
    monthIndex: number;
    monthName: string;
    expectedRitu: string;
    actualRitu: string;
    expectedLocative: string;
    actualLocative: string;
    expectedAyana: string;
    actualAyana: string;
    passed: boolean;
  }>;
  summary: string;
}

export function runVedicRituEngineTests(): RituTestResult {
  const expectedTable: Array<{
    month: number;
    name: string;
    ritu: 'वसन्त' | 'ग्रीष्म' | 'वर्षा' | 'शरद्' | 'हेमन्त' | 'शिशिर';
    locative: string;
    ayana: 'उत्तरायण' | 'दक्षिणायन';
  }> = [
    { month: 1, name: 'वैशाख', ritu: 'वसन्त', locative: 'वसन्त ऋतौ', ayana: 'उत्तरायण' },
    { month: 2, name: 'ज्येष्ठ/जेठ', ritu: 'ग्रीष्म', locative: 'ग्रीष्म ऋतौ', ayana: 'उत्तरायण' },
    { month: 3, name: 'आषाढ/असार', ritu: 'ग्रीष्म', locative: 'ग्रीष्म ऋतौ', ayana: 'उत्तरायण' },
    { month: 4, name: 'श्रावण/साउन', ritu: 'वर्षा', locative: 'वर्षा ऋतौ', ayana: 'दक्षिणायन' },
    { month: 5, name: 'भाद्र/भदौ', ritu: 'वर्षा', locative: 'वर्षा ऋतौ', ayana: 'दक्षिणायन' },
    { month: 6, name: 'आश्विन/असोज', ritu: 'शरद्', locative: 'शरद् ऋतौ', ayana: 'दक्षिणायन' },
    { month: 7, name: 'कार्तिक/कात्तिक', ritu: 'शरद्', locative: 'शरद् ऋतौ', ayana: 'दक्षिणायन' },
    { month: 8, name: 'मार्गशीर्ष/मङ्सिर', ritu: 'हेमन्त', locative: 'हेमन्त ऋतौ', ayana: 'दक्षिणायन' },
    { month: 9, name: 'पौष/पुस', ritu: 'हेमन्त', locative: 'हेमन्त ऋतौ', ayana: 'दक्षिणायन' },
    { month: 10, name: 'माघ', ritu: 'शिशिर', locative: 'शिशिर ऋतौ', ayana: 'उत्तरायण' },
    { month: 11, name: 'फाल्गुन/फागुन', ritu: 'शिशिर', locative: 'शिशिर ऋतौ', ayana: 'उत्तरायण' },
    { month: 12, name: 'चैत्र/चैत', ritu: 'वसन्त', locative: 'वसन्त ऋतौ', ayana: 'उत्तरायण' },
  ];

  const details: RituTestResult['details'] = [];
  let passedCount = 0;

  for (const exp of expectedTable) {
    const rituInfo = getVedicRituInfo(exp.month);
    const actualRitu = getRituForBSMonth(exp.month);
    const actualLocative = getRituSanskritLocative(exp.month);
    const actualAyana = getAyanaForBSMonth(exp.month);

    const isMatch = (
      actualRitu === exp.ritu &&
      actualLocative === exp.locative &&
      actualAyana === exp.ayana &&
      rituInfo.key === (
        exp.month === 1 || exp.month === 12 ? 'vasanta' :
        exp.month === 2 || exp.month === 3 ? 'grishma' :
        exp.month === 4 || exp.month === 5 ? 'varsha' :
        exp.month === 6 || exp.month === 7 ? 'sharad' :
        exp.month === 8 || exp.month === 9 ? 'hemanta' : 'shishira'
      )
    );

    if (isMatch) passedCount++;

    details.push({
      monthIndex: exp.month,
      monthName: exp.name,
      expectedRitu: exp.ritu,
      actualRitu,
      expectedLocative: exp.locative,
      actualLocative,
      expectedAyana: exp.ayana,
      actualAyana,
      passed: isMatch,
    });
  }

  // Also test name-based lookups like 'आश्विन', 'asoj', 'Kartik', 'dashain'
  const ashwinCheck = getRituForBSMonth('आश्विन') === 'शरद्';
  const asojCheck = getRituForBSMonth('असोज') === 'शरद्';
  const kartikCheck = getRituForBSMonth('कार्तिक') === 'शरद्';
  const shrawanCheck = getRituForBSMonth('श्रावण') === 'वर्षा';
  const chaitraCheck = getRituForBSMonth('चैत्र') === 'वसन्त';

  const extraPassed = ashwinCheck && asojCheck && kartikCheck && shrawanCheck && chaitraCheck;
  const allPassed = passedCount === expectedTable.length && extraPassed;

  return {
    passed: allPassed,
    totalChecks: expectedTable.length + 5,
    passedChecks: passedCount + (extraPassed ? 5 : 0),
    failedChecks: (expectedTable.length + 5) - (passedCount + (extraPassed ? 5 : 0)),
    details,
    summary: allPassed
      ? `✅ सबै १२ वटै महिना तथा शास्त्रीय सङ्कल्प ऋतु परीक्षण पूर्ण रूपमा सफल (१००% Passed)। आश्विन/असोज तथा कार्तिकका लागि 'शरद् ऋतौ' (शरद् ऋतु) प्रमाणित भएको छ।`
      : `❌ केही महिनामा ऋतु वा अयन अमिल्दो देखियो। कृपया विवरण हेर्नुहोस्।`,
  };
}
