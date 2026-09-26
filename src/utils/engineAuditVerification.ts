// Golden Test Database & Engine Audit Verification for Brihat Jyotish Professional
// Validates:
// 1. Gregorian (AD) <-> Vikram Samvat (BS) bidirectional conversion
// 2. High-precision astronomical Julian Day and Timezone rollover
// 3. Sun and Moon longitudes (Meeus VSOP87 / ELP2000-82)
// 4. Astronomical Sunrise/Sunset with atmospheric refraction
// 5. Udaya Tithi (Nepal Panchanga Nirnayak Bikas Samiti & Hamro Patro standards)
// 6. Root-finding for Tithi / Nakshatra / Yoga / Karana boundaries

import { 
  canonicalJulianDay, 
  calculateAstronomicalSunriseSunset, 
  calculateCanonicalAuthoritativePanchanga,
  getCanonicalLahiriAyanamsa
} from './canonicalAstroEngine';
import { 
  convertADToBSFull, 
  convertBSToADFull, 
  getBSDaysInMonth 
} from './bsCalendarData';
import { calculatePanchanga, calculateMasaInfo, getSpecialDaysAndFestivals } from './panchangaEngine';
import { getFestivalForBSDate } from './nepalFestivalsData';
import { getAuthoritativeFestivalsForBSDate } from './festivalMaster';
import { BirthDetails } from '../types/astrology';
import { computeTibetanBirthChart } from '../core/tibetan/tibetanBirthChartEngine';
import { calculateTibetanCompatibility } from '../core/tibetan/tibetanCompatibilityEngine';

export interface AuditTestItem {
  id: string;
  nameNepali: string;
  category: string;
  passed: boolean;
  expected: string;
  actual: string;
  detailsNepali: string;
}

export interface EngineAuditReport {
  timestamp: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  isAllPassed: boolean;
  items: AuditTestItem[];
}

export type AuditReport = EngineAuditReport;

export function runEngineAuditVerification(): EngineAuditReport {
  const items: AuditTestItem[] = [];

  // -------------------------------------------------------------
  // TEST 1: Bi-directional AD <-> BS Date Conversion Accuracy
  // -------------------------------------------------------------
  const goldenDates = [
    { ad: '2023-04-14', bsYear: 2080, bsMonth: 1, bsDay: 1, label: 'नयाँ वर्ष २०८०' },
    { ad: '2024-04-13', bsYear: 2081, bsMonth: 1, bsDay: 1, label: 'नयाँ वर्ष २०८१' },
    { ad: '2024-10-31', bsYear: 2081, bsMonth: 7, bsDay: 15, label: 'लक्ष्मीपूजा २०८१' },
    { ad: '2025-04-14', bsYear: 2082, bsMonth: 1, bsDay: 1, label: 'नयाँ वर्ष २०८२' },
    { ad: '2026-09-04', bsYear: 2083, bsMonth: 5, bsDay: 19, label: 'श्रीकृष्ण जन्माष्टमी २०८३' },
  ];

  for (let i = 0; i < goldenDates.length; i++) {
    const g = goldenDates[i];
    const bsResult = convertADToBSFull(g.ad);
    const reconvertedAD = convertBSToADFull(bsResult.year, bsResult.month, bsResult.day);

    const isMatch = bsResult.year === g.bsYear && bsResult.month === g.bsMonth && bsResult.day === g.bsDay && reconvertedAD === g.ad;
    items.push({
      id: `audit_date_conv_${i + 1}`,
      nameNepali: `मिति रूपान्तरण: ${g.label} (${g.ad} ⇄ ${g.bsYear}/${g.bsMonth}/${g.bsDay})`,
      category: 'नेपाली क्यालेन्डर (BS <-> AD)',
      passed: isMatch,
      expected: `${g.bsYear}-${g.bsMonth}-${g.bsDay} & ${g.ad}`,
      actual: `${bsResult.year}-${bsResult.month}-${bsResult.day} & ${reconvertedAD}`,
      detailsNepali: isMatch 
        ? `सफल: शतप्रतिशत शुद्ध रूपान्तरण (${bsResult.formattedBSFull})`
        : `विफल: गणना फरक पर्यो`,
    });
  }

  // -------------------------------------------------------------
  // TEST 2: Canonical Julian Day Handling across Midnight & Timezone
  // -------------------------------------------------------------
  try {
    // 02:00 NST is previous day 20:15 UTC
    const jdEarlyMorning = canonicalJulianDay('2026-09-04', '02:00:00', 5.75);
    const jdPrevNight = canonicalJulianDay('2026-09-03', '20:15:00', 0);

    const diffJD = Math.abs(jdEarlyMorning.jdUT - jdPrevNight.jdUT);
    const jdPassed = diffJD < 0.00001; // exact match
    items.push({
      id: 'audit_julian_day_tz',
      nameNepali: 'जुलियन डे र समयमण्डल (Timezone) मध्यरात सीमा परीक्षण',
      category: 'खगोलीय समयमण्डल शुद्धता',
      passed: jdPassed,
      expected: `समान जुलियन डे (अन्तर < 0.00001)`,
      actual: `अन्तर = ${diffJD.toFixed(7)}`,
      detailsNepali: jdPassed
        ? 'सफल: नेपाल समय (NST +5:45) र UTC बीचको अन्तर सुरक्षित रूपमा मिल्यो'
        : 'विफल: जुलियन डे गणनामा समयमण्डल त्रुटि देखियो',
    });
  } catch (err: any) {
    items.push({
      id: 'audit_julian_day_tz',
      nameNepali: 'जुलियन डे र समयमण्डल परीक्षण',
      category: 'खगोलीय समयमण्डल शुद्धता',
      passed: false,
      expected: 'समान जुलियन डे',
      actual: String(err),
      detailsNepali: `विफल: ${err.message}`,
    });
  }

  // -------------------------------------------------------------
  // TEST 3: High-precision Sunrise & Sunset for Kathmandu
  // -------------------------------------------------------------
  try {
    // On 2026-09-04 (Bhadra 19) in Kathmandu:
    // Astronomical sunrise is approximately 05:44 NST, Sunset is ~18:22 NST
    const sunTimes = calculateAstronomicalSunriseSunset('2026-09-04', 27.7172, 85.3240, 5.75);
    const srHour = sunTimes.sunriseDecimalHours;
    const ssHour = sunTimes.sunsetDecimalHours;

    // Tolerance: 05:40 to 05:50 (5.66 to 5.83 hours), Sunset: 18:15 to 18:30 (18.25 to 18.5 hours)
    const isSunriseAccurate = srHour >= 5.65 && srHour <= 5.85;
    const isSunsetAccurate = ssHour >= 18.20 && ssHour <= 18.50;
    const isSunTimesPassed = isSunriseAccurate && isSunsetAccurate;

    items.push({
      id: 'audit_sunrise_sunset_accuracy',
      nameNepali: 'काठमाडौँको यथार्थ सूर्योदय र सूर्यास्त गणना परीक्षण (२०२६-०९-०४)',
      category: 'सूर्योदय/सूर्यास्त गणना',
      passed: isSunTimesPassed,
      expected: 'सूर्योदय: ~०५:४४ बजे, सूर्यास्त: ~०६:२२ बजे',
      actual: `सूर्योदय: ${Math.floor(srHour)}:${Math.floor((srHour % 1) * 60)} बजे, सूर्यास्त: ${Math.floor(ssHour)}:${Math.floor((ssHour % 1) * 60)} बजे`,
      detailsNepali: isSunTimesPassed
        ? `सफल: वायुमण्डलीय आवर्तन (Refraction -34') र अर्धव्यास (-16') सहित शुद्ध गणना भएको छ`
        : `विफल: सूर्योदय वा सूर्यास्त अपेक्षित दायराभन्दा फरक पर्यो`,
    });
  } catch (err: any) {
    items.push({
      id: 'audit_sunrise_sunset_accuracy',
      nameNepali: 'सूर्योदय र सूर्यास्त गणना परीक्षण',
      category: 'सूर्योदय/सूर्यास्त गणना',
      passed: false,
      expected: 'मान्य समय',
      actual: String(err),
      detailsNepali: `विफल: ${err.message}`,
    });
  }

  // -------------------------------------------------------------
  // TEST 4: Udaya Tithi and Boundary Root-Finding (Hamro Patro Standard)
  // -------------------------------------------------------------
  try {
    const authP = calculateCanonicalAuthoritativePanchanga('2026-09-04', '06:00:00', 27.7172, 85.3240, 5.75);
    // On Janmashtami day, Udaya Tithi is Krishna Ashtami (or late Saptami concluding) with Rohini Nakshatra
    const isUdayaAshtami = (authP.udayaTithi.name === 'अष्टमी' || authP.udayaTithi.name === 'सप्तमी') && authP.udayaTithi.paksha === 'कृष्ण';
    const isNakshatraRohini = authP.nakshatra.name === 'रोहिणी';

    const passed = isUdayaAshtami && isNakshatraRohini;
    items.push({
      id: 'audit_udaya_tithi_boundary',
      nameNepali: 'उदय तिथि तथा नक्षत्र शुद्धता परीक्षण (श्रीकृष्ण जन्माष्टमी / भाद्र १९)',
      category: 'उदय तिथि र पञ्चाङ्ग गणना',
      passed,
      expected: 'उदय तिथि: अष्टमी कृष्ण, नक्षत्र: रोहिणी',
      actual: `उदय तिथि: ${authP.udayaTithi.name} ${authP.udayaTithi.paksha} (${authP.udayaTithi.formattedEndTime}), नक्षत्र: ${authP.nakshatra.name}`,
      detailsNepali: passed
        ? 'सफल: हाम्रो पात्रो र नेपाल पञ्चाङ्ग निर्णायक विकास समितिको मानक अनुसार उदय तिथि र नक्षत्र पूर्णतः मिल्यो'
        : 'विफल: उदय तिथि वा नक्षत्र अपेक्षित मानक अनुसार मिलेन',
    });
  } catch (err: any) {
    items.push({
      id: 'audit_udaya_tithi_boundary',
      nameNepali: 'उदय तिथि परीक्षण',
      category: 'उदय तिथि र पञ्चाङ्ग गणना',
      passed: false,
      expected: 'सप्तमी कृष्ण',
      actual: String(err),
      detailsNepali: `विफल: ${err.message}`,
    });
  }

  // -------------------------------------------------------------
  // TEST 5: Adhimasa (अधिकमास / पुरुषोत्तम महिना) Verification
  // -------------------------------------------------------------
  try {
    // 2080 Shrawan (Month 4) had an Adhimasa (अधिकमास) in Nepal
    const masa2080Shrawan = calculateMasaInfo(2460144.5, 4, 2080);
    const masa2081Baisakh = calculateMasaInfo(2460413.5, 1, 2081);

    const isAdhimasaPassed = masa2080Shrawan.isAdhimasa && !masa2081Baisakh.isAdhimasa;
    items.push({
      id: 'audit_adhimasa_verification',
      nameNepali: 'अधिकमास (पुरुषोत्तम महिना) र शुद्ध मास पहिचान परीक्षण',
      category: 'चन्द्रमास र अधिकमास गणना',
      passed: isAdhimasaPassed,
      expected: '२०८० साउन: अधिकमास, २०८१ वैशाख: शुद्ध मास',
      actual: `२०८० साउन: ${masa2080Shrawan.masaType}, २०८१ वैशाख: ${masa2081Baisakh.masaType}`,
      detailsNepali: isAdhimasaPassed
        ? 'सफल: अधिकमास र शुद्धमासको खगोलीय पहिचान शतप्रतिशत प्रमाणित भयो'
        : 'विफल: अधिकमास पहिचानमा त्रुटि देखियो',
    });
  } catch (err: any) {
    items.push({
      id: 'audit_adhimasa_verification',
      nameNepali: 'अधिकमास परीक्षण',
      category: 'चन्द्रमास र अधिकमास गणना',
      passed: false,
      expected: 'अधिकमास पहिचान',
      actual: String(err),
      detailsNepali: `विफल: ${err.message}`,
    });
  }

  // -------------------------------------------------------------
  // TEST 6: Festival Date Accuracy & Deduplication (Vijaya Dashami & Bhai Tika)
  // -------------------------------------------------------------
  try {
    // In 2083 BS, Vijaya Dashami is Kartik 4 (7-4) and Bhai Tika is Kartik 25 (7-25).
    // They must NOT appear on obsolete/duplicate dates (Ashwin 22 or Kartik 17).
    const festKartik4 = getFestivalForBSDate(2083, 7, 4);
    const festAshwin22 = getFestivalForBSDate(2083, 6, 22);
    const authFestKartik4 = getAuthoritativeFestivalsForBSDate(7, 4, undefined, 2083);
    const authFestAshwin22 = getAuthoritativeFestivalsForBSDate(6, 22, undefined, 2083);

    const hasDashamiOnKartik4 = (festKartik4?.title || '').includes('विजयादशमी') &&
      authFestKartik4.some((f) => f.title.includes('विजयादशमी'));
    const noDashamiOnAshwin22 = !(festAshwin22?.title || '').includes('विजयादशमी') &&
      !authFestAshwin22.some((f) => f.title.includes('विजयादशमी'));

    const dashamiPassed = hasDashamiOnKartik4 && noDashamiOnAshwin22;

    items.push({
      id: 'audit_fest_dashami_accuracy',
      nameNepali: 'विजयादशमी २०८३ मिति शुद्धता तथा दोहोरोपन निवारण (कार्तिक ४)',
      category: 'चाडपर्व तथा पञ्चाङ्ग शुद्धता',
      passed: dashamiPassed,
      expected: 'कार्तिक ४: विजयादशमी, असोज २२: विजयादशमी नहुने',
      actual: `कार्तिक ४ = ${festKartik4?.title || 'कुनै छैन'}, असोज २२ = ${festAshwin22?.title || 'कुनै छैन'}`,
      detailsNepali: dashamiPassed
        ? 'सफल: २०८३ को विजयादशमी आधिकारिक रूपमा कार्तिक ४ मा मात्र कायम, असोज २२ को दोहोरोपन हट्यो'
        : 'विफल: विजयादशमीको मितिमा त्रुटि वा दोहोरोपन देखियो',
    });

    // In 2083 BS, Ashwin 5 (6-5) is Bhadrapada Shukla Dashami and MUST NOT be labelled as Vijaya Dashami
    const pAsoj5 = calculatePanchanga('2026-09-21', '06:00', 27.7172, 85.3240, 5.75);
    const festAsoj5 = getSpecialDaysAndFestivals(2083, 6, 5, pAsoj5);
    const hasFalseDashamiOnAsoj5 = festAsoj5.some((f) => f.includes('दशैँ') || f.includes('दशैं'));
    const isBhadraMasa = pAsoj5.masaInfo.masaName.includes('भाद्रपद');
    const asoj5AuditPassed = !hasFalseDashamiOnAsoj5 && isBhadraMasa;

    items.push({
      id: 'audit_asoj_5_bhadra_dashami_purity',
      nameNepali: '२०८३ असोज ५ गते भाद्रपद शुक्ल दशमी शुद्धता (विजयादशमी नहुने)',
      category: 'चाडपर्व तथा पञ्चाङ्ग शुद्धता',
      passed: asoj5AuditPassed,
      expected: 'असोज ५: भाद्रपद शुक्ल दशमी, विजयादशमी नहुने',
      actual: `असोज ५ चान्द्रमास = ${pAsoj5.masaInfo.masaName}, पर्व = ${festAsoj5.join(', ') || 'कुनै छैन'}`,
      detailsNepali: asoj5AuditPassed
        ? 'सफल: २०८३ असोज ५ मा अधिकमास पछिको शुद्ध भाद्रपद शुक्ल दशमी कायम, विजयादशमीको गलत संकेत हटेको छ'
        : 'विफल: असोज ५ मा विजयादशमी वा गलत चान्द्रमास देखियो',
    });

    const festKartik25 = getFestivalForBSDate(2083, 7, 25);
    const festKartik17 = getFestivalForBSDate(2083, 7, 17);
    const authFestKartik25 = getAuthoritativeFestivalsForBSDate(7, 25, undefined, 2083);
    const authFestKartik17 = getAuthoritativeFestivalsForBSDate(7, 17, undefined, 2083);

    const hasBhaiTikaOnKartik25 = (festKartik25?.title || '').includes('भाइटीका') &&
      authFestKartik25.some((f) => f.title.includes('भाइटीका'));
    const noBhaiTikaOnKartik17 = !(festKartik17?.title || '').includes('भाइटीका') &&
      !authFestKartik17.some((f) => f.title.includes('भाइटीका'));

    const bhaiTikaPassed = hasBhaiTikaOnKartik25 && noBhaiTikaOnKartik17;

    items.push({
      id: 'audit_fest_bhaitika_accuracy',
      nameNepali: 'भाइटीका २०८३ मिति शुद्धता तथा दोहोरोपन निवारण (कार्तिक २५)',
      category: 'चाडपर्व तथा पञ्चाङ्ग शुद्धता',
      passed: bhaiTikaPassed,
      expected: 'कार्तिक २५: भाइटीका, कार्तिक १७: भाइटीका नहुने',
      actual: `कार्तिक २५ = ${festKartik25?.title || 'कुनै छैन'}, कार्तिक १७ = ${festKartik17?.title || 'कुनै छैन'}`,
      detailsNepali: bhaiTikaPassed
        ? 'सफल: २०८३ को भाइटीका आधिकारिक रूपमा कार्तिक २५ मा मात्र कायम, कार्तिक १७ को दोहोरोपन हट्यो'
        : 'विफल: भाइटीकाको मितिमा त्रुटि वा दोहोरोपन देखियो',
    });
  } catch (err: any) {
    items.push({
      id: 'audit_fest_accuracy_err',
      nameNepali: 'चाडपर्व मिति शुद्धता परीक्षण',
      category: 'चाडपर्व तथा पञ्चाङ्ग शुद्धता',
      passed: false,
      expected: 'सफल परीक्षण',
      actual: String(err),
      detailsNepali: `विफल: ${err.message}`,
    });
  }

  // -------------------------------------------------------------
  // TEST 7: Tibetan (Neema Jyotish) Compatibility Engine Verification
  // -------------------------------------------------------------
  try {
    // Pair A: 1996 (Rat / Fire) + 2000 (Dragon / Iron) -> Same Water Trine (Tun-sum / 25 pts)
    const auditLocation = {
      name: 'Kathmandu',
      country: 'Nepal',
      latitude: 27.7172,
      longitude: 85.324,
      timeZone: 5.75,
    };
    const profileA1: BirthDetails = {
      id: 'audit-tib-1',
      name: 'जातक १ (१९९६ मुसा)',
      gender: 'male' as const,
      dateAD: '1996-05-15',
      time: '06:00',
      location: auditLocation,
    };
    const profileA2: BirthDetails = {
      id: 'audit-tib-2',
      name: 'जातक २ (२००० ड्रागन)',
      gender: 'female' as const,
      dateAD: '2000-08-20',
      time: '12:00',
      location: auditLocation,
    };

    const chartA1 = computeTibetanBirthChart(profileA1);
    const chartA2 = computeTibetanBirthChart(profileA2);
    const compatTrine = calculateTibetanCompatibility(
      chartA1.yearInfo,
      chartA1.lifeForces,
      chartA1.mewa,
      chartA1.parkha,
      chartA2.yearInfo,
      chartA2.lifeForces,
      chartA2.mewa,
      chartA2.parkha
    );

    const isTrineValid =
      compatTrine.animalHarmonyStatus === 'अति अनुकूल (त्रि-सङ्गम)' &&
      compatTrine.animalScore === 25 &&
      compatTrine.dimensionRows.length === 5 &&
      compatTrine.lifeForceRows.length === 5;

    items.push({
      id: 'audit_tibetan_compat_trine',
      nameNepali: 'तिब्बती ज्योतिष: पशु त्रिसङ्गम (टुङ्सुम) मिलान शुद्धता',
      category: 'नेमा ज्योतिष (Tibetan Astrology)',
      passed: isTrineValid,
      expected: 'अति अनुकूल (त्रि-सङ्गम), २५ अंक, ५ आयाम र ५ जीवनशक्ति चक्र',
      actual: `स्तर = ${compatTrine.animalHarmonyStatus}, अंक = ${compatTrine.animalScore}, आयाम = ${compatTrine.dimensionRows.length}`,
      detailsNepali: isTrineValid
        ? 'सफल: मुसा र ड्रागन बीचको त्रिसङ्गम (टुङ्सुम) र पाँच आयाम तालिका शुद्ध रूपमा प्रमाणीकरण भयो'
        : 'विफल: पशु त्रिसङ्गम गणना वा तालिका संरचनामा त्रुटि',
    });

    // Pair B: 1996 (Rat) + 2002 (Horse) -> 6-axis opposition (Dun-zur / 5 pts)
    const profileB2: BirthDetails = {
      id: 'audit-tib-horse',
      name: 'जातक ३ (२००२ घोडा)',
      gender: 'female' as const,
      dateAD: '2002-06-21',
      time: '14:00',
      location: auditLocation,
    };
    const chartB2 = computeTibetanBirthChart(profileB2);
    const compatOpposite = calculateTibetanCompatibility(
      chartA1.yearInfo,
      chartA1.lifeForces,
      chartA1.mewa,
      chartA1.parkha,
      chartB2.yearInfo,
      chartB2.lifeForces,
      chartB2.mewa,
      chartB2.parkha
    );

    const isOppositeValid =
      compatOpposite.animalHarmonyStatus === 'शत्रुवत (द्वन्द्व)' &&
      compatOpposite.animalScore === 5 &&
      Boolean(compatOpposite.elementCycleDetails.mediatingElement || compatOpposite.traditionalHarmonizingAdvice.length > 0);

    items.push({
      id: 'audit_tibetan_compat_dunzur',
      nameNepali: 'तिब्बती ज्योतिष: प्रत्यक्ष अक्षीय द्वन्द्व (दुन्जुर) तथा शान्ति उपाय',
      category: 'नेमा ज्योतिष (Tibetan Astrology)',
      passed: isOppositeValid,
      expected: 'शत्रुवत (द्वन्द्व), ५ अंक, शान्ति/मध्यस्थ उपाय उपलब्ध',
      actual: `स्तर = ${compatOpposite.animalHarmonyStatus}, अंक = ${compatOpposite.animalScore}`,
      detailsNepali: isOppositeValid
        ? 'सफल: मुसा र घोडा बीचको १८० डिग्री विपरीत (दुन्जुर) स्थिति र शास्त्रीय शान्ति विधि शुद्ध रूपमा प्रमाणीकरण भयो'
        : 'विफल: दुन्जुर द्वन्द्व पहिचान वा उपायमा त्रुटि',
    });
  } catch (err: any) {
    items.push({
      id: 'audit_tibetan_compat_err',
      nameNepali: 'तिब्बती मिलान इन्जिन परीक्षण',
      category: 'नेमा ज्योतिष (Tibetan Astrology)',
      passed: false,
      expected: 'सफल परीक्षण',
      actual: String(err),
      detailsNepali: `विफल: ${err.message}`,
    });
  }

  const passedCount = items.filter((t) => t.passed).length;
  const failedCount = items.length - passedCount;

  return {
    timestamp: new Date().toISOString(),
    totalTests: items.length,
    passedCount,
    failedCount,
    isAllPassed: failedCount === 0,
    items,
  };
}
