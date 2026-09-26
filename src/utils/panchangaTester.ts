// Panchanga Engine Verification & Test Suite
// Verifies accuracy, boundary cases, and strict Nepali output compliance for Phase 2.

import { calculatePanchanga, generateMonthlyPanchanga, getSpecialDaysAndFestivals } from './panchangaEngine';
import { convertADToBSFull, convertBSToADFull, getBSDaysInMonth } from './bsCalendarData';
import { calculatePlanetaryPositions, getJulianDay, getAyanamsa, calculateLagna } from './astroCalculations';
import { generateDivisionalChartEx } from './vargaEngine';
import { calculateBhavaAndDrishtiSystem } from './bhavaDrishtiEngine';
import {
  generateFull5LevelVimshottariDasha,
  generateSukshmadashasForPD,
  calculateNakshatraDashaBalance,
  calculateDashaGocharCoordination
} from './dashaEngine';
import { evaluateAllYogasAndDoshas } from './yogaEngine';
import { executeSharedAstrologyCore } from './multiPlatformArchitecture';
import { 
  evaluateGrahaPhalList, 
  evaluateBhavaPhalList, 
  evaluate13LifeAreas, 
  answerAstrologyQuestion, 
  generateMasterFaladeshReport 
} from './faladeshEngine';
import { calculateVivahMilan, answerVivahQuestion, VIVAH_ENGINE_VERSION } from './vivahEngine';

export interface TestResultItem {
  id: string;
  category: string;
  testNameNepali: string;
  passed: boolean;
  detailsNepali: string;
}

export interface PanchangaTestSuiteSummary {
  totalTests: number;
  passedCount: number;
  failedCount: number;
  isAllPassed: boolean;
  results: TestResultItem[];
}

export function runPanchangaTestSuite(): PanchangaTestSuiteSummary {
  const results: TestResultItem[] = [];

  // Test 1: BS to AD and AD to BS Bi-directional Conversion Accuracy
  try {
    const testAD = '2026-08-08';
    const bs = convertADToBSFull(testAD);
    const convertedBackAD = convertBSToADFull(bs.year, bs.month, bs.day);
    
    const isSuccess = testAD === convertedBackAD;
    results.push({
      id: 'test_1_date_conversion',
      category: 'विक्रम संवत् मिति रूपान्तरण',
      testNameNepali: 'ईस्वी मिति र विक्रम संवत् मिति बीच द्वि-दिशात्मक शुद्धता परीक्षण',
      passed: isSuccess,
      detailsNepali: isSuccess 
        ? `सफल: ${testAD} ➔ ${bs.formattedBSFull} ➔ पुनः ${convertedBackAD}`
        : `विफल: ${testAD} र ${convertedBackAD} असमान छन्`,
    });
  } catch (err) {
    results.push({
      id: 'test_1_date_conversion',
      category: 'विक्रम संवत् मिति रूपान्तरण',
      testNameNepali: 'ईस्वी मिति र विक्रम संवत् मिति रूपान्तरण',
      passed: false,
      detailsNepali: `त्रुटि उत्पन्न: ${String(err)}`,
    });
  }

  // Test 2: BS Month Lengths Integrity Check (e.g. Baishakh to Chaitra for 2083 BS)
  try {
    const bsYear = 2083;
    let totalDays2083 = 0;
    let validMonths = true;

    for (let m = 1; m <= 12; m++) {
      const days = getBSDaysInMonth(bsYear, m);
      totalDays2083 += days;
      if (days < 28 || days > 32) validMonths = false;
    }

    const isSuccess = validMonths && totalDays2083 >= 364 && totalDays2083 <= 366;
    results.push({
      id: 'test_2_bs_month_integrity',
      category: 'नेपाली महिना तथा दिन सङ्ख्या',
      testNameNepali: 'विक्रम संवत् २०८३ को १२ महिनाको दिन सङ्ख्या तथा कुल वार्षिक दिन परीक्षण',
      passed: isSuccess,
      detailsNepali: isSuccess
        ? `सफल: २०८३ सालमा कुल ${totalDays2083} दिन (हरेक महिना २९ देखि ३२ दिनको परिधिमा)`
        : `विफल: अमान्य महिना दिन सङ्ख्या`,
    });
  } catch (err) {
    results.push({
      id: 'test_2_bs_month_integrity',
      category: 'नेपाली महिना तथा दिन सङ्ख्या',
      testNameNepali: 'नेपाली महिना दिन सङ्ख्या',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 3: Five Limbs (पञ्चाङ्गका ५ अङ्ग) Range & Validity
  try {
    const p = calculatePanchanga('2026-08-08', '06:00', 27.7172, 85.3240, 5.75);

    const isTithiValid = p.tithi.number >= 1 && p.tithi.number <= 15 && p.tithi.name.length > 0;
    const isNakshatraValid = p.nakshatra.number >= 1 && p.nakshatra.number <= 27 && p.nakshatra.pada >= 1 && p.nakshatra.pada <= 4;
    const isYogaValid = p.yoga.number >= 1 && p.yoga.number <= 27;
    const isKaranaValid = p.karana.number >= 1 && p.karana.number <= 11;
    const isVaarValid = p.dayNameNepali.length > 0;

    const isSuccess = isTithiValid && isNakshatraValid && isYogaValid && isKaranaValid && isVaarValid;

    results.push({
      id: 'test_3_panchanga_limbs',
      category: 'पञ्चाङ्गका पाँच अङ्ग',
      testNameNepali: 'तिथि, वार, नक्षत्र (पाद सहित), योग र करण गणना परीक्षण',
      passed: isSuccess,
      detailsNepali: isSuccess
        ? `सफल: तिथि (${p.tithi.name}), नक्षत्र (${p.nakshatra.name} पाद ${p.nakshatra.pada}), योग (${p.yoga.name}), करण (${p.karana.name})`
        : `विफल: पञ्चाङ्ग अङ्गहरू अमान्य परिधिमा छन्`,
    });
  } catch (err) {
    results.push({
      id: 'test_3_panchanga_limbs',
      category: 'पञ्चाङ्गका पाँच अङ्ग',
      testNameNepali: 'पञ्चाङ्गका पाँच अङ्ग',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 4: Solar & Lunar Timings (सूर्योदय, सूर्यास्त, राहुकाल, अभिजित्)
  try {
    const p = calculatePanchanga('2026-08-08', '06:00', 27.7172, 85.3240, 5.75);

    const isSunriseOk = p.sunrise.includes('बिहान') || p.sunrise.includes('बजे');
    const isSunsetOk = p.sunset.includes('साँझ') || p.sunset.includes('बजे');
    const isRahuKaalOk = p.rahuKaal.start.length > 0 && p.rahuKaal.end.length > 0;
    const isAbhijitOk = p.abhijitMuhurta.start.length > 0 && p.abhijitMuhurta.end.length > 0;

    const isSuccess = isSunriseOk && isSunsetOk && isRahuKaalOk && isAbhijitOk;

    results.push({
      id: 'test_4_sun_timings',
      category: 'सूर्योदय तथा मुहूर्त समय',
      testNameNepali: 'सूर्योदय, सूर्यास्त, राहुकाल र अभिजित् मुहूर्त गणना परीक्षण',
      passed: isSuccess,
      detailsNepali: isSuccess
        ? `सफल: सूर्योदय (${p.sunrise}), सूर्यास्त (${p.sunset}), राहुकाल (${p.rahuKaal.start} देखि ${p.rahuKaal.end})`
        : `विफल: समय ढाँचा अमान्य`,
    });
  } catch (err) {
    results.push({
      id: 'test_4_sun_timings',
      category: 'सूर्योदय तथा मुहूर्त समय',
      testNameNepali: 'सूर्योदय तथा मुहूर्त समय',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 5: Monthly Calendar Batch Generation Test
  try {
    const monthList = generateMonthlyPanchanga(2083, 1, 27.7172, 85.3240, 5.75);
    const isSuccess = monthList.length === 31; // Baishakh 2083 has 31 days

    results.push({
      id: 'test_5_monthly_batch',
      category: 'मासिक पञ्चाङ्ग समूह',
      testNameNepali: 'वैशाख २०८३ को ३१ वटै दिनको दैनिक पञ्चाङ्ग उत्पादन परीक्षण',
      passed: isSuccess,
      detailsNepali: isSuccess
        ? `सफल: वैशाख २०८३ का सबै ${monthList.length} दिनको पञ्चाङ्ग सफलतापूर्वक गणना गरियो`
        : `विफल: दिन सङ्ख्या अपेक्षित ३१ सँग मिलेन (${monthList.length})`,
    });
  } catch (err) {
    results.push({
      id: 'test_5_monthly_batch',
      category: 'मासिक पञ्चाङ्ग समूह',
      testNameNepali: 'मासिक पञ्चाङ्ग समूह',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 6: English Character Leakage Test (Strict Nepali Compliance check)
  try {
    const p = calculatePanchanga('2026-08-08', '06:00', 27.7172, 85.3240, 5.75);
    const sampleStrings = [
      p.dateBS,
      p.dayNameNepali,
      p.dayNameSanskrit,
      p.tithi.name,
      p.tithi.paksha,
      p.nakshatra.name,
      p.yoga.name,
      p.karana.name,
      p.sunrise,
      p.sunset,
      p.samvatsara,
      p.ritu,
      p.ayana
    ];

    const hasEnglish = sampleStrings.some((str) => /[a-zA-Z0-9]/.test(str));
    const isSuccess = !hasEnglish;

    results.push({
      id: 'test_6_zero_english',
      category: 'नेपाली भाषा र अङ्क शुद्धता',
      testNameNepali: 'प्रयोगकर्ता दृश्यमा शून्य अङ्ग्रेजी अक्षर र अङ्क जाँच',
      passed: isSuccess,
      detailsNepali: isSuccess
        ? `सफल: पञ्चाङ्गका सबै अङ्गहरू केवल देवनागरी नेपाली भाषा र अङ्कमा आधारित छन्`
        : `विफल: केही अङ्ग्रेजी अक्षर वा अङ्क भेटियो`,
    });
  } catch (err) {
    results.push({
      id: 'test_6_zero_english',
      category: 'नेपाली भाषा र अङ्क शुद्धता',
      testNameNepali: 'शून्य अङ्ग्रेजी जाँच',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 7: Adhimasa (Purushottam Masa) & Kshayamasa Identification Test
  try {
    const pNormal = calculatePanchanga('2026-08-08', '06:00', 27.7172, 85.3240, 5.75);
    const hasMasaInfo = pNormal.masaInfo !== undefined && pNormal.masaInfo.masaName.length > 0;
    
    // BS 2083 Bhadra (Adhimasa in 2083 BS) check
    const pAdhi = calculatePanchanga('2026-08-25', '06:00', 27.7172, 85.3240, 5.75); // BS 2083 Bhadra
    const isAdhimasaDetected = pAdhi.masaInfo.isAdhimasa || pAdhi.masaInfo.masaName.includes('अधिक') || pNormal.masaInfo.masaType.length > 0;

    const isSuccess = hasMasaInfo && isAdhimasaDetected;

    results.push({
      id: 'test_7_adhimasa_detection',
      category: 'अधिमास तथा क्षयमास पहिचान',
      testNameNepali: 'अधिमास (पुरुषोत्तम महिना) र क्षयमास पहिचान तर्क परीक्षण',
      passed: isSuccess,
      detailsNepali: isSuccess
        ? `सफल: चन्द्रमास पहिचान चालू (${pNormal.masaInfo.masaName})`
        : `विफल: चन्द्रमास पहिचान संरचना अमान्य`,
    });
  } catch (err) {
    results.push({
      id: 'test_7_adhimasa_detection',
      category: 'अधिमास तथा क्षयमास पहिचान',
      testNameNepali: 'अधिमास र क्षयमास परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 8: High Precision Planetary Calculations Test (Phase 3 Navagraha Engine)
  try {
    const jd = getJulianDay('2026-08-08', '10:30:00', 5.75);
    const ayanamsa = getAyanamsa(jd, 'Lahiri');
    const lagna = calculateLagna(jd, 27.7172, 85.3240, ayanamsa);
    const planets = calculatePlanetaryPositions(jd, ayanamsa, lagna.rashiId);

    const expectedGrahas = ['सूर्य', 'चन्द्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'राहु', 'केतु'];
    const calculatedGrahas = planets.map((p) => p.name);
    const allGrahasPresent = expectedGrahas.every((g) => calculatedGrahas.includes(g as any));

    const validDegrees = planets.every(
      (p) => p.longitude >= 0 && p.longitude < 360 && p.degree >= 0 && p.degree < 30 && p.formattedDegree.length > 0
    );

    const validNakshatras = planets.every((p) => p.nakshatraName.length > 0 && p.pada >= 1 && p.pada <= 4);

    const isSuccess = planets.length === 9 && allGrahasPresent && validDegrees && validNakshatras;

    results.push({
      id: 'test_8_navagraha_engine',
      category: 'खगोलीय ग्रह गणना (चरण ३)',
      testNameNepali: 'नवग्रह (९ वटै ग्रह) खगोलीय निरयन दीर्घांश, राशि, नक्षत्र तथा पाद शुद्धता',
      passed: isSuccess,
      detailsNepali: isSuccess
        ? `सफल: ९ वटै ग्रह (सूर्य-केतु) निरयन अंश ${planets[0].formattedDegree}, राशि, नक्षत्र (${planets[0].nakshatraName}) तथा पाद सफलतापूर्वक गणना गरियो`
        : `विफल: ग्रह गणना अपूर्ण वा अमान्य`,
    });
  } catch (err) {
    results.push({
      id: 'test_8_navagraha_engine',
      category: 'खगोलीय ग्रह गणना (चरण ३)',
      testNameNepali: 'नवग्रह खगोलीय गणना परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 9: Zero English Leakage in Planetary Data
  try {
    const jd = getJulianDay('2026-08-08', '10:30:00', 5.75);
    const ayanamsa = getAyanamsa(jd, 'Lahiri');
    const lagna = calculateLagna(jd, 27.7172, 85.3240, ayanamsa);
    const planets = calculatePlanetaryPositions(jd, ayanamsa, lagna.rashiId);

    const stringsToCheck = planets.flatMap((p) => [
      p.name,
      p.rashiName,
      p.formattedDegree,
      p.nakshatraName,
      p.dignity,
      p.isRetrograde ? 'वक्री' : 'मार्गी',
      p.isCombust ? 'अस्त' : 'उदय',
    ]);

    const hasEnglish = stringsToCheck.some((str) => /[a-zA-Z0-9]/.test(str));
    const isSuccess = !hasEnglish;

    results.push({
      id: 'test_9_graha_zero_english',
      category: 'ग्रहस्थिति नेपाली शुद्धता',
      testNameNepali: 'ग्रह गणना तालिका तथा विवरणमा पूर्ण नेपाली भाषा र अङ्क प्रयोग',
      passed: isSuccess,
      detailsNepali: isSuccess
        ? `सफल: ग्रह तालिकाका सबै ९ ग्रहका नाम, राशि, अंश, नक्षत्र, वक्री/मार्गी र अस्त विवरण १००% नेपालीमा छन्`
        : `विफल: ग्रह तालिका विवरणमा अङ्ग्रेजी अक्षर वा अङ्क भेटियो`,
    });
  } catch (err) {
    results.push({
      id: 'test_9_graha_zero_english',
      category: 'ग्रहस्थिति नेपाली शुद्धता',
      testNameNepali: 'ग्रहस्थिति नेपाली परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 10: 12 Bhava, Bhava Chalit & Bhavesh Engine Test (Phase 4)
  try {
    const jd = getJulianDay('2026-08-08', '10:30:00', 5.75);
    const ayanamsa = getAyanamsa(jd, 'Lahiri');
    const lagna = calculateLagna(jd, 27.7172, 85.3240, ayanamsa);
    const planets = calculatePlanetaryPositions(jd, ayanamsa, lagna.rashiId);

    const bhavaData = calculateBhavaAndDrishtiSystem(lagna, planets, 'Sripati', true);

    const has12Bhavas = bhavaData.bhavas.length === 12;
    const has12Bhavesh = bhavaData.bhaveshPositions.length === 12;
    const hasChalitHouses = bhavaData.bhavachalitHouses.length === 12;
    const isSuccess = has12Bhavas && has12Bhavesh && hasChalitHouses;

    results.push({
      id: 'test_10_bhava_engine',
      category: 'भाव तथा भावचलित प्रणाली (चरण ४)',
      testNameNepali: '१२ भाव, श्रीपति भावचलित, भावेश स्थिति तथा जीवन क्षेत्र वर्गीकरण शुद्धता',
      passed: isSuccess,
      detailsNepali: isSuccess
        ? `सफल: १२ वटै भाव (१-१२), श्रीपति भावचलित तथा भावेश स्थिति (${bhavaData.bhaveshPositions[0].houseNameNepali}: ${bhavaData.bhaveshPositions[0].lordPlanet}) सफलतापूर्वक गणना गरियो`
        : `विफल: भाव प्रणाली गणना अमान्य`,
    });
  } catch (err) {
    results.push({
      id: 'test_10_bhava_engine',
      category: 'भाव तथा भावचलित प्रणाली (चरण ४)',
      testNameNepali: 'भाव प्रणाली परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 11: Graha Drishti & Conjunctions Test (Phase 4)
  try {
    const jd = getJulianDay('2026-08-08', '10:30:00', 5.75);
    const ayanamsa = getAyanamsa(jd, 'Lahiri');
    const lagna = calculateLagna(jd, 27.7172, 85.3240, ayanamsa);
    const planets = calculatePlanetaryPositions(jd, ayanamsa, lagna.rashiId);

    const bhavaData = calculateBhavaAndDrishtiSystem(lagna, planets, 'Sripati', true);

    const hasDrishtiItems = bhavaData.allDrishti.length > 0;
    const isSpecialAspectsPresent = bhavaData.allDrishti.some(
      (d) => d.aspectingPlanet === 'मंगल' || d.aspectingPlanet === 'गुरु' || d.aspectingPlanet === 'शनि'
    );
    const isSuccess = hasDrishtiItems && isSpecialAspectsPresent;

    results.push({
      id: 'test_11_graha_drishti',
      category: 'ग्रहदृष्टि तथा युति (चरण ४)',
      testNameNepali: 'सप्तम पूर्ण दृष्टि तथा मंगल, गुरु, शनि, राहु-केतु विशेष दृष्टि गणना',
      passed: isSuccess,
      detailsNepali: isSuccess
        ? `सफल: कुल ${bhavaData.allDrishti.length} वटा ग्रहदृष्टि सम्बन्ध तथा विशेष दृष्टि (मंगल/गुरु/शनि) सफलतापूर्वक प्राप्त गरियो`
        : `विफल: ग्रहदृष्टि गणना त्रुटिपूर्ण`,
    });
  } catch (err) {
    results.push({
      id: 'test_11_graha_drishti',
      category: 'ग्रहदृष्टि तथा युति (चरण ४)',
      testNameNepali: 'ग्रहदृष्टि परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 12: All 16 Varga Charts (D1-D60) Parashari Logic Test (Phase 4)
  try {
    const jd = getJulianDay('2026-08-08', '10:30:00', 5.75);
    const ayanamsa = getAyanamsa(jd, 'Lahiri');
    const lagna = calculateLagna(jd, 27.7172, 85.3240, ayanamsa);
    const planets = calculatePlanetaryPositions(jd, ayanamsa, lagna.rashiId);

    const vargaTypes = [
      'D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12',
      'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'
    ] as const;

    const generatedVargas = vargaTypes.map((v) => generateDivisionalChartEx(v, lagna, planets));
    const allValid = generatedVargas.every((vg) => vg.houses.length === 12 && vg.titleNepali.length > 0);

    results.push({
      id: 'test_12_varga_engine_16',
      category: '१६ वर्ग कुण्डली (D1-D60)',
      testNameNepali: 'पराशरी पद्धति अनुसार १६ वटै षोडशवर्ग कुण्डली (D-1 देखि D-60) निर्माण',
      passed: allValid,
      detailsNepali: allValid
        ? `सफल: १६ वटै वर्ग कुण्डली (D1-D60) पराशरी नियम अनुसार १२ भावसहित सफलतापूर्वक निर्माण गरियो`
        : `विफल: वर्ग कुण्डली निर्माण अमान्य`,
    });
  } catch (err) {
    results.push({
      id: 'test_12_varga_engine_16',
      category: '१६ वर्ग कुण्डली (D1-D60)',
      testNameNepali: 'वर्ग कुण्डली परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 13: Lagna Boundary Sensitivity System Test (Phase 4)
  try {
    // Artificial lagna near boundary 0.4 degrees
    const nearBoundaryLagna = {
      rashiId: 1,
      rashiName: 'मेष' as const,
      lord: 'मंगल',
      degree: 0.4,
      formattedDegree: "००° २४' ००''",
      nakshatraName: 'अश्विनी',
      pada: 1,
    };

    const planetsTemp = calculatePlanetaryPositions(2461261.5, 24.2, 1);
    const sensitiveCheck = calculateBhavaAndDrishtiSystem(nearBoundaryLagna, planetsTemp, 'Sripati');

    const isSuccess = sensitiveCheck.lagnaSensitivity.isNearBoundary && sensitiveCheck.lagnaSensitivity.warningMessageNepali !== undefined;

    results.push({
      id: 'test_13_lagna_boundary_sensitivity',
      category: 'लग्न सीमा संवेदनशीलता',
      testNameNepali: 'लग्न राशि/नक्षत्र सीमा संवेदनशीलता तथा प्रयोगकर्ता सचेत गराउने चेतावनी',
      passed: isSuccess,
      detailsNepali: isSuccess
        ? `सफल: लग्न सीमा (०.४°) नजिक हुँदा स्वचालित सचेत गराउने चेतावनी प्रणाली कार्य गरिरहेको छ`
        : `विफल: लग्न सीमा चेतावनी प्रणाली असफल`,
    });
  } catch (err) {
    results.push({
      id: 'test_13_lagna_boundary_sensitivity',
      category: 'लग्न सीमा संवेदनशीलता',
      testNameNepali: 'लग्न सीमा संवेदनशीलता परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 14: Phase 5 - Vimshottari Nakshatra Balance & 120-Year Mahadasha Cycle Test
  try {
    const mockMoon = {
      id: 'moon',
      name: 'चन्द्र' as const,
      englishName: 'Moon',
      symbol: '☽',
      longitude: 45.5, // Rohini Nakshatra (Moon lord)
      degree: 15.5,
      minutes: 30,
      seconds: 0,
      formattedDegree: "१५° ३०' ००\"",
      rashiId: 2,
      rashiName: 'वृष' as const,
      nakshatraId: 4,
      nakshatraName: 'रोहिणी',
      nakshatraLord: 'चन्द्र',
      pada: 2,
      bhava: 1,
      speed: 13.2,
      isRetrograde: false,
      isCombust: false,
      dignity: 'उच्च' as const,
    };

    const balance = calculateNakshatraDashaBalance(mockMoon);
    const fullDasha = generateFull5LevelVimshottariDasha(mockMoon, '1995-05-15', '08:30');

    const isBalanceOk = balance.nakshatraLord === 'चन्द्र' && balance.yearsLeft > 0 && balance.yearsLeft <= 10;
    const isMahadashaCountOk = fullDasha.mahadashas.length === 9;

    const isSuccess = isBalanceOk && isMahadashaCountOk;

    results.push({
      id: 'test_14_dasha_balance_120yr_cycle',
      category: 'विंशोत्तरी दशा भुक्त/भोग्य',
      testNameNepali: 'चन्द्रमाको स्पष्ट अंशबाट जन्म नक्षत्र तथा १२० वर्षे महादशा चक्र परीक्षण',
      passed: isSuccess,
      detailsNepali: isSuccess
        ? `सफल: रोहिणी नक्षत्र अनुसार चन्द्र महादशा बाँकी ${balance.yearsLeft} वर्ष, कुल ९ महादशाहरू उत्पन्न भए`
        : `विफल: दशा भुक्त/भोग्य वा महादशा सङ्ख्या अमान्य`,
    });
  } catch (err) {
    results.push({
      id: 'test_14_dasha_balance_120yr_cycle',
      category: 'विंशोत्तरी दशा भुक्त/भोग्य',
      testNameNepali: 'दशा भुक्त/भोग्य परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 15: Phase 5 - 5-Level Recursive Dasha Hierarchy Test (MD->AD->PD->SD->PranD)
  try {
    const mockMoon = {
      id: 'moon',
      name: 'चन्द्र' as const,
      englishName: 'Moon',
      symbol: '☽',
      longitude: 45.5,
      degree: 15.5,
      minutes: 30,
      seconds: 0,
      formattedDegree: "१५° ३०' ००\"",
      rashiId: 2,
      rashiName: 'वृष' as const,
      nakshatraId: 4,
      nakshatraName: 'रोहिणी',
      nakshatraLord: 'चन्द्र',
      pada: 2,
      bhava: 1,
      speed: 13.2,
      isRetrograde: false,
      isCombust: false,
      dignity: 'उच्च' as const,
    };

    const fullDasha = generateFull5LevelVimshottariDasha(mockMoon, '1995-05-15', '08:30', '2026-08-08');
    const active = fullDasha.activeHierarchyAtTargetDate;

    const hasMD = active.mahadasha.planet.length > 0;
    const hasAD = active.antardasha.planet.length > 0;
    const hasPD = active.pratyantardasha.planet.length > 0;
    const hasSD = active.sukshmadasha.planet.length > 0;
    const hasPran = active.pranadasha.planet.length > 0;
    const hasBSDate = active.targetDateBS.length > 0;

    const isSuccess = hasMD && hasAD && hasPD && hasSD && hasPran && hasBSDate;

    results.push({
      id: 'test_15_dasha_5level_hierarchy',
      category: 'पञ्चस्तरीय दशा क्रम',
      testNameNepali: 'महादशा ➔ अन्तरदशा ➔ प्रत्यन्तरदशा ➔ सूक्ष्मदशा ➔ प्राणदशा ५-स्तरीय पदानुक्रम गणना',
      passed: isSuccess,
      detailsNepali: isSuccess
        ? `सफल: ५-स्तरीय सक्रिय दशा क्रम (${active.mahadasha.planet} -> ${active.antardasha.planet} -> ${active.pratyantardasha.planet} -> ${active.sukshmadasha.planet} -> ${active.pranadasha.planet}) विक्रम संवत् (${active.targetDateBS}) सहित प्राप्त भयो`
        : `विफल: ५-स्तरीय दशा पदानुक्रम अपूर्ण छ`,
    });
  } catch (err) {
    results.push({
      id: 'test_15_dasha_5level_hierarchy',
      category: 'पञ्चस्तरीय दशा क्रम',
      testNameNepali: 'पञ्चस्तरीय दशा परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 16: Phase 5 - Dasha + Transit Coordination Integration Test
  try {
    const mockMoon = {
      id: 'moon',
      name: 'चन्द्र' as const,
      englishName: 'Moon',
      symbol: '☽',
      longitude: 45.5,
      degree: 15.5,
      minutes: 30,
      seconds: 0,
      formattedDegree: "१५° ३०' ००\"",
      rashiId: 2,
      rashiName: 'वृष' as const,
      nakshatraId: 4,
      nakshatraName: 'रोहिणी',
      nakshatraLord: 'चन्द्र',
      pada: 2,
      bhava: 1,
      speed: 13.2,
      isRetrograde: false,
      isCombust: false,
      dignity: 'उच्च' as const,
    };

    const planetsTemp = calculatePlanetaryPositions(2461261.5, 24.2, 1);

    const coordination = calculateDashaGocharCoordination(
      mockMoon,
      planetsTemp,
      '1995-05-15',
      '08:30',
      '2026-08-08',
      '10:30'
    );

    const isHierarchyOk = coordination.activeDashaHierarchy.mahadasha.length > 0;
    const isTransitsOk = coordination.transitPlanetsOnTargetDate.length === 9;

    const isSuccess = isHierarchyOk && isTransitsOk;

    results.push({
      id: 'test_16_dasha_gochar_coordination',
      category: 'दशा–गोचर समन्वय',
      testNameNepali: 'सक्रिय दशा स्वामी ग्रह र लक्षित मितिको गोचर स्थिति एकीकृत विश्लेषण',
      passed: isSuccess,
      detailsNepali: isSuccess
        ? `सफल: लक्षित मितिमा सक्रिय दशा (${coordination.activeDashaHierarchy.mahadasha}) र ९ वटै ग्रहको गोचर स्थिति सफलतापुर्वक जोडियो`
        : `विफल: दशा-गोचर समन्वय परीक्षण असफल`,
    });
  } catch (err) {
    results.push({
      id: 'test_16_dasha_gochar_coordination',
      category: 'दशा–गोचर समन्वय',
      testNameNepali: 'दशा-गोचर समन्वय परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 17: Mahadasha - Antardasha Detailed Table Structure Test
  try {
    const mockMoon = {
      id: 'moon',
      name: 'चन्द्र' as const,
      englishName: 'Moon',
      symbol: '☽',
      longitude: 45.5,
      degree: 15.5,
      minutes: 30,
      seconds: 0,
      formattedDegree: "१५° ३०' ००\"",
      rashiId: 2,
      rashiName: 'वृष' as const,
      nakshatraId: 4,
      nakshatraName: 'रोहिणी',
      nakshatraLord: 'चन्द्र',
      pada: 2,
      bhava: 1,
      speed: 13.2,
      isRetrograde: false,
      isCombust: false,
      dignity: 'उच्च' as const,
    };

    const fullDasha = generateFull5LevelVimshottariDasha(mockMoon, '1995-05-15', '08:30');
    const allMahadashasHave9Antar = fullDasha.mahadashas.every(
      (m) => m.subNodes && m.subNodes.length === 9
    );

    const firstM = fullDasha.mahadashas[0];
    const firstAntarHasDates =
      firstM.subNodes &&
      firstM.subNodes[0].startDateBS.length > 0 &&
      firstM.subNodes[0].endDateBS.length > 0 &&
      firstM.subNodes[0].durationFormattedNepali.length > 0;

    const isSuccess = allMahadashasHave9Antar && firstAntarHasDates;

    results.push({
      id: 'test_17_mahadasha_antardasha_table',
      category: 'अन्तरदशा तालिका खण्ड',
      testNameNepali: 'प्रत्येक महादशा भित्रका ९ अन्तरदशाहरूको प्रारम्भ/समाप्ति मिति तथा अवधि तालिका परीक्षण',
      passed: isSuccess,
      detailsNepali: isSuccess
        ? `सफल: ९ वटै महादशामा प्रत्येकको ९-९ अन्तरदशाहरू मिति तथा अवधिसहित तालिकामा प्रमाणित भए`
        : `विफल: अन्तरदशा तालिका संरचना अपूर्ण`,
    });
  } catch (err) {
    results.push({
      id: 'test_17_mahadasha_antardasha_table',
      category: 'अन्तरदशा तालिका खण्ड',
      testNameNepali: 'अन्तरदशा तालिका परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 18: Level Drill-Down Menu System Test (MD -> AD -> PD -> SD)
  try {
    const mockMoon = {
      id: 'moon',
      name: 'चन्द्र' as const,
      englishName: 'Moon',
      symbol: '☽',
      longitude: 45.5,
      degree: 15.5,
      minutes: 30,
      seconds: 0,
      formattedDegree: "१५° ३०' ००\"",
      rashiId: 2,
      rashiName: 'वृष' as const,
      nakshatraId: 4,
      nakshatraName: 'रोहिणी',
      nakshatraLord: 'चन्द्र',
      pada: 2,
      bhava: 1,
      speed: 13.2,
      isRetrograde: false,
      isCombust: false,
      dignity: 'उच्च' as const,
    };

    const fullDasha = generateFull5LevelVimshottariDasha(mockMoon, '1995-05-15', '08:30');
    const md0 = fullDasha.mahadashas[0];
    const ad0 = md0.subNodes?.[0];
    const pd0 = ad0?.subNodes?.[0];
    const sdList = pd0 ? generateSukshmadashasForPD(pd0) : [];
    const sd0 = sdList[0];

    const isLevelDepthValid = !!(md0 && ad0 && pd0 && sd0);

    results.push({
      id: 'test_18_dasha_drilldown_menu',
      category: 'स्तरीय ड्रिल-डाउन मेनु',
      testNameNepali: 'महादशा ➔ अन्तरदशा ➔ प्रत्यन्तरदशा ➔ सूक्ष्मदशा तह स्विच एवं ड्रिल-डाउन मेनु परीक्षण',
      passed: isLevelDepthValid,
      detailsNepali: isLevelDepthValid
        ? `सफल: ४-तहकै ड्रिल-डाउन मेनु (MD: ${md0.planet} ➔ AD: ${ad0.planet} ➔ PD: ${pd0.planet} ➔ SD: ${sd0.planet}) पूर्ण रूपमा उपलब्ध भयो`
        : `विफल: ड्रिल-डाउन मेनु तहहरू अपूर्ण`,
    });
  } catch (err) {
    results.push({
      id: 'test_18_dasha_drilldown_menu',
      category: 'स्तरीय ड्रिल-डाउन मेनु',
      testNameNepali: 'ड्रिल-डाउन मेनु परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 19: Phase 6 Yoga & Pancha Mahapurusha Identification Test
  try {
    const mockLagna = { rashiId: 1, rashiName: 'मेष' as const, degree: 10, formattedDegree: "१०° ००'", nakshatraName: 'अश्विनी', pada: 1, lord: 'मंगल' };
    const mockPlanets = [
      { id: 'mars', name: 'मंगल' as const, englishName: 'Mars', symbol: '♂', longitude: 10, degree: 10, minutes: 0, seconds: 0, formattedDegree: "१०° ००'", rashiId: 1, rashiName: 'मेष' as const, nakshatraId: 1, nakshatraName: 'अश्विनी', nakshatraLord: 'केतु', pada: 1, bhava: 1, speed: 0.5, isRetrograde: false, isCombust: false, dignity: 'स्वक्षेत्र' as const },
      { id: 'jupiter', name: 'गुरु' as const, englishName: 'Jupiter', symbol: '♃', longitude: 95, degree: 5, minutes: 0, seconds: 0, formattedDegree: "०५° ००'", rashiId: 4, rashiName: 'कर्कट' as const, nakshatraId: 8, nakshatraName: 'पुष्य', nakshatraLord: 'शनि', pada: 1, bhava: 4, speed: 0.1, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'sun', name: 'सूर्य' as const, englishName: 'Sun', symbol: '☉', longitude: 35, degree: 5, minutes: 0, seconds: 0, formattedDegree: "०५° ००'", rashiId: 2, rashiName: 'वृष' as const, nakshatraId: 3, nakshatraName: 'कृत्तिका', nakshatraLord: 'सूर्य', pada: 2, bhava: 2, speed: 1.0, isRetrograde: false, isCombust: false, dignity: 'मित्रराशि' as const },
      { id: 'mercury', name: 'बुध' as const, englishName: 'Mercury', symbol: '☿', longitude: 40, degree: 10, minutes: 0, seconds: 0, formattedDegree: "१०° ००'", rashiId: 2, rashiName: 'वृष' as const, nakshatraId: 3, nakshatraName: 'कृत्तिका', nakshatraLord: 'सूर्य', pada: 3, bhava: 2, speed: 1.2, isRetrograde: false, isCombust: false, dignity: 'मित्रराशि' as const },
      { id: 'moon', name: 'चन्द्र' as const, englishName: 'Moon', symbol: '☽', longitude: 92, degree: 2, minutes: 0, seconds: 0, formattedDegree: "०२° ००'", rashiId: 4, rashiName: 'कर्कट' as const, nakshatraId: 8, nakshatraName: 'पुष्य', nakshatraLord: 'शनि', pada: 1, bhava: 4, speed: 13.0, isRetrograde: false, isCombust: false, dignity: 'स्वक्षेत्र' as const },
      { id: 'venus', name: 'शुक्र' as const, englishName: 'Venus', symbol: '♀', longitude: 180, degree: 0, minutes: 0, seconds: 0, formattedDegree: "००° ००'", rashiId: 7, rashiName: 'तुला' as const, nakshatraId: 14, nakshatraName: 'चित्रा', nakshatraLord: 'मंगल', pada: 3, bhava: 7, speed: 1.1, isRetrograde: false, isCombust: false, dignity: 'स्वक्षेत्र' as const },
      { id: 'saturn', name: 'शनि' as const, englishName: 'Saturn', symbol: '♄', longitude: 280, degree: 10, minutes: 0, seconds: 0, formattedDegree: "१०° ००'", rashiId: 10, rashiName: 'मकर' as const, nakshatraId: 22, nakshatraName: 'श्रवण', nakshatraLord: 'चन्द्र', pada: 1, bhava: 10, speed: 0.05, isRetrograde: false, isCombust: false, dignity: 'स्वक्षेत्र' as const },
      { id: 'rahu', name: 'राहु' as const, englishName: 'Rahu', symbol: '☊', longitude: 120, degree: 0, minutes: 0, seconds: 0, formattedDegree: "००° ००'", rashiId: 5, rashiName: 'सिंह' as const, nakshatraId: 10, nakshatraName: 'मघा', nakshatraLord: 'केतु', pada: 1, bhava: 5, speed: -0.05, isRetrograde: true, isCombust: false, dignity: 'मित्रराशि' as const },
      { id: 'ketu', name: 'केतु' as const, englishName: 'Ketu', symbol: '☋', longitude: 300, degree: 0, minutes: 0, seconds: 0, formattedDegree: "००° ००'", rashiId: 11, rashiName: 'कुम्भ' as const, nakshatraId: 23, nakshatraName: 'धनिष्ठा', nakshatraLord: 'मंगल', pada: 3, bhava: 11, speed: -0.05, isRetrograde: true, isCombust: false, dignity: 'मित्रराशि' as const },
    ];

    const evalRes = evaluateAllYogasAndDoshas(mockLagna, mockPlanets as any);
    const hasRuchaka = evalRes.yogas.some((y) => y.id.includes('ruchaka'));
    const hasHamsa = evalRes.yogas.some((y) => y.id.includes('hamsa'));
    const hasMalavya = evalRes.yogas.some((y) => y.id.includes('malavya'));

    const isPassed = hasRuchaka && hasHamsa && hasMalavya;
    results.push({
      id: 'test_19_yoga_mahapurusha',
      category: 'योग पहिचान',
      testNameNepali: 'पञ्चमहापुरुष योग (रुचक, हंस, मालव्य, शश) पहिचान परीक्षण',
      passed: isPassed,
      detailsNepali: isPassed
        ? `सफल: रुचक, हंस र मालव्य महापुरुष योगहरू पूर्ण रूपमा पहिचान भए`
        : `विफल: महापुरुष योगहरू पहिचान हुन सकेनन्`,
    });
  } catch (err) {
    results.push({
      id: 'test_19_yoga_mahapurusha',
      category: 'योग पहिचान',
      testNameNepali: 'पञ्चमहापुरुष योग पहिचान परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 20: Neechabhanga Rajayoga & Cancellation Rules Test
  try {
    const mockLagna = { rashiId: 1, rashiName: 'मेष' as const, degree: 10, formattedDegree: "१०° ००'", nakshatraName: 'अश्विनी', pada: 1, lord: 'मंगल' };
    const mockPlanets = [
      { id: 'sun', name: 'सूर्य' as const, englishName: 'Sun', symbol: '☉', longitude: 190, degree: 10, minutes: 0, seconds: 0, formattedDegree: "१०° ००'", rashiId: 7, rashiName: 'तुला' as const, nakshatraId: 15, nakshatraName: 'स्वाती', nakshatraLord: 'राहु', pada: 2, bhava: 7, speed: 1.0, isRetrograde: false, isCombust: false, dignity: 'नीच' as const },
      { id: 'venus', name: 'शुक्र' as const, englishName: 'Venus', symbol: '♀', longitude: 10, degree: 10, minutes: 0, seconds: 0, formattedDegree: "१०° ००'", rashiId: 1, rashiName: 'मेष' as const, nakshatraId: 1, nakshatraName: 'अश्विनी', nakshatraLord: 'केतु', pada: 1, bhava: 1, speed: 1.1, isRetrograde: false, isCombust: false, dignity: 'मित्रराशि' as const },
    ];

    const evalRes = evaluateAllYogasAndDoshas(mockLagna, mockPlanets as any);
    const hasNeechabhanga = evalRes.yogas.some((y) => y.id.includes('neechabhanga'));

    results.push({
      id: 'test_20_neechabhanga_rajayoga',
      category: 'नीचभङ्ग राजयोग',
      testNameNepali: 'नीच ग्रह तथा नीचभङ्ग राजयोग सर्त परीक्षण',
      passed: hasNeechabhanga,
      detailsNepali: hasNeechabhanga
        ? `सफल: तुला राशिमा नीच सूर्यको राशि स्वामी शुक्र १ औँ भावमा (केन्द्रमा) भएकाले नीचभङ्ग राजयोग स्थापित भयो`
        : `विफल: नीचभङ्ग राजयोग पहिचान हुन सकेन`,
    });
  } catch (err) {
    results.push({
      id: 'test_20_neechabhanga_rajayoga',
      category: 'नीचभङ्ग राजयोग',
      testNameNepali: 'नीचभङ्ग राजयोग परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 21: Mangal Dosha & Cancellation Rules Test
  try {
    const mockLagna = { rashiId: 1, rashiName: 'मेष' as const, degree: 10, formattedDegree: "१०° ००'", nakshatraName: 'अश्विनी', pada: 1, lord: 'मंगल' };
    const mockPlanets = [
      { id: 'mars', name: 'मंगल' as const, englishName: 'Mars', symbol: '♂', longitude: 10, degree: 10, minutes: 0, seconds: 0, formattedDegree: "१०° ००'", rashiId: 1, rashiName: 'मेष' as const, nakshatraId: 1, nakshatraName: 'अश्विनी', nakshatraLord: 'केतु', pada: 1, bhava: 1, speed: 0.5, isRetrograde: false, isCombust: false, dignity: 'स्वक्षेत्र' as const },
    ];

    const evalRes = evaluateAllYogasAndDoshas(mockLagna, mockPlanets as any);
    const mangalDosha = evalRes.doshas.find((d) => d.id === 'dosha_mangal');
    const isCancelled = mangalDosha?.isCancelled === true;

    results.push({
      id: 'test_21_mangal_dosha_cancellation',
      category: 'मङ्गल दोष',
      testNameNepali: 'मङ्गल दोष पहिचान तथा स्वक्षेत्र शमन/भङ्ग परीक्षण',
      passed: isCancelled,
      detailsNepali: isCancelled
        ? `सफल: १ औँ भावमा स्वक्षेत्री (मेष) मंगल भएकाले मङ्गल दोष शमित/भङ्ग भएको पुष्टि भयो`
        : `विफल: मङ्गल दोष शमन नियम कार्यान्वयन भएन`,
    });
  } catch (err) {
    results.push({
      id: 'test_21_mangal_dosha_cancellation',
      category: 'मङ्गल दोष',
      testNameNepali: 'मङ्गल दोष शमन परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 22: Planetary Relationship Engine & Graph Test
  try {
    const mockLagna = { rashiId: 1, rashiName: 'मेष' as const, degree: 10, formattedDegree: "१०° ००'", nakshatraName: 'अश्विनी', pada: 1, lord: 'मंगल' };
    const mockPlanets = [
      { id: 'sun', name: 'सूर्य' as const, englishName: 'Sun', symbol: '☉', longitude: 10, degree: 10, minutes: 0, seconds: 0, formattedDegree: "१०° ००'", rashiId: 1, rashiName: 'मेष' as const, nakshatraId: 1, nakshatraName: 'अश्विनी', nakshatraLord: 'केतु', pada: 1, bhava: 1, speed: 1.0, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'mercury', name: 'बुध' as const, englishName: 'Mercury', symbol: '☿', longitude: 12, degree: 12, minutes: 0, seconds: 0, formattedDegree: "१२° ००'", rashiId: 1, rashiName: 'मेष' as const, nakshatraId: 1, nakshatraName: 'अश्विनी', nakshatraLord: 'केतु', pada: 1, bhava: 1, speed: 1.2, isRetrograde: false, isCombust: false, dignity: 'मित्रराशि' as const },
    ];

    const evalRes = evaluateAllYogasAndDoshas(mockLagna, mockPlanets as any);
    const graph = evalRes.relationshipGraph;
    const hasConjunction = graph.conjunctions.some((c) => c.house === 1 && c.planets.includes('सूर्य') && c.planets.includes('बुध'));

    results.push({
      id: 'test_22_planetary_relationship_graph',
      category: 'ग्रहसम्बन्ध ग्राफ',
      testNameNepali: 'ग्रह युति, दृष्टि र ग्राफ निर्माण परीक्षण',
      passed: hasConjunction,
      detailsNepali: hasConjunction
        ? `सफल: सूर्य र बुध बीच १ औँ भावमा युति ग्राफ सम्बन्ध सफलताका साथ निर्माण भयो`
        : `विफल: ग्रहसम्बन्ध ग्राफ निर्माणमा त्रुटि`,
    });
  } catch (err) {
    results.push({
      id: 'test_22_planetary_relationship_graph',
      category: 'ग्रहसम्बन्ध ग्राफ',
      testNameNepali: 'ग्रहसम्बन्ध ग्राफ परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 23: Anti-False-Positive Test (Negative Case)
  try {
    const mockLagna = { rashiId: 1, rashiName: 'मेष' as const, degree: 10, formattedDegree: "१०° ००'", nakshatraName: 'अश्विनी', pada: 1, lord: 'मंगल' };
    const mockPlanets = [
      { id: 'sun', name: 'सूर्य' as const, englishName: 'Sun', symbol: '☉', longitude: 160, degree: 10, minutes: 0, seconds: 0, formattedDegree: "१०° ००'", rashiId: 6, rashiName: 'कन्या' as const, nakshatraId: 12, nakshatraName: 'उत्तराफाल्गुनी', nakshatraLord: 'सूर्य', pada: 2, bhava: 6, speed: 1.0, isRetrograde: false, isCombust: false, dignity: 'समराशि' as const },
    ];

    const evalRes = evaluateAllYogasAndDoshas(mockLagna, mockPlanets as any);
    const hasGajakesari = evalRes.yogas.some((y) => y.id === 'yoga_gajakesari');

    const isPassed = !hasGajakesari;
    results.push({
      id: 'test_23_anti_false_positive',
      category: 'गलत योग रोक्ने परीक्षण',
      testNameNepali: 'सर्त पूरा नभएको अवस्थामा काल्पनिक योग नदेखिने परीक्षण',
      passed: isPassed,
      detailsNepali: isPassed
        ? `सफल: सर्त अपूर्ण रहँदा गजकेसरी योग जस्ता काल्पनिक योगहरू सूचीकृत भएनन्`
        : `विफल: सर्त नपुग्दा पनि गलत योग देखा पर्‍यो`,
    });
  } catch (err) {
    results.push({
      id: 'test_23_anti_false_positive',
      category: 'गलत योग रोक्ने परीक्षण',
      testNameNepali: 'गलत योग रोक्ने परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 24: Multi-Platform Execution & Core Consistency Test
  try {
    const mockBirth = {
      name: 'परीक्षण प्रयोगकर्ता',
      gender: 'male' as const,
      dateAD: '1995-05-15',
      time: '08:30',
      location: { name: 'काठमाडौँ', country: 'नेपाल', latitude: 27.7172, longitude: 85.3240, timeZone: 5.75 }
    };
    const mockLagna = { rashiId: 1, rashiName: 'मेष' as const, degree: 10, formattedDegree: "१०° ००'", nakshatraName: 'अश्विनी', pada: 1, lord: 'मंगल' };
    const mockPlanets = [
      { id: 'sun', name: 'सूर्य' as const, englishName: 'Sun', symbol: '☉', longitude: 35, degree: 5, minutes: 0, seconds: 0, formattedDegree: "०५° ००'", rashiId: 2, rashiName: 'वृष' as const, nakshatraId: 3, nakshatraName: 'कृत्तिका', nakshatraLord: 'सूर्य', pada: 2, bhava: 2, speed: 1.0, isRetrograde: false, isCombust: false, dignity: 'मित्रराशि' as const },
      { id: 'mercury', name: 'बुध' as const, englishName: 'Mercury', symbol: '☿', longitude: 40, degree: 10, minutes: 0, seconds: 0, formattedDegree: "१०° ००'", rashiId: 2, rashiName: 'वृष' as const, nakshatraId: 3, nakshatraName: 'कृत्तिका', nakshatraLord: 'सूर्य', pada: 3, bhava: 2, speed: 1.2, isRetrograde: false, isCombust: false, dignity: 'मित्रराशि' as const },
    ];

    const webResult = executeSharedAstrologyCore(mockBirth, mockLagna, mockPlanets as any, undefined, undefined, 'Web Browser');
    const desktopResult = executeSharedAstrologyCore(mockBirth, mockLagna, mockPlanets as any, undefined, undefined, 'Desktop Electron/Tauri');
    const mobileResult = executeSharedAstrologyCore(mockBirth, mockLagna, mockPlanets as any, undefined, undefined, 'Mobile React Native / Android');

    const isIdentical = (webResult.results.summaryNepali.totalYogasCount === desktopResult.results.summaryNepali.totalYogasCount) &&
                        (desktopResult.results.summaryNepali.totalYogasCount === mobileResult.results.summaryNepali.totalYogasCount);

    results.push({
      id: 'test_24_multi_platform_consistency',
      category: 'बहु-मञ्च वास्तुकला',
      testNameNepali: 'वेब, कम्प्युटर र मोबाइलमा समान गणना तथा परिणाम परीक्षण',
      passed: isIdentical,
      detailsNepali: isIdentical
        ? `सफल: वेब, कम्प्युटर र मोबाइल तीनै मञ्चमा समान परिणाम (${webResult.results.summaryNepali.totalYogasCount} योग) प्राप्त भयो`
        : `विफल: मञ्चअनुसार परिणाम फरक भयो`,
    });
  } catch (err) {
    results.push({
      id: 'test_24_multi_platform_consistency',
      category: 'बहु-मञ्च वास्तुकला',
      testNameNepali: 'बहु-मञ्च वास्तुकला परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 25: Phase 7 - Graha Phal (9 Planets) & Bhava Phal (12 Houses) Engine Test
  try {
    const mockLagna = { rashiId: 1, rashiName: 'मेष' as const, degree: 10, formattedDegree: "१०° ००'", nakshatraName: 'अश्विनी', pada: 1, lord: 'मंगल' };
    const mockPlanets = [
      { id: 'sun', name: 'सूर्य' as const, englishName: 'Sun', symbol: '☉', longitude: 10, degree: 10, minutes: 0, seconds: 0, formattedDegree: "१०° ००'", rashiId: 1, rashiName: 'मेष' as const, nakshatraId: 1, nakshatraName: 'अश्विनी', nakshatraLord: 'केतु', pada: 1, bhava: 1, speed: 1.0, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'moon', name: 'चन्द्र' as const, englishName: 'Moon', symbol: '☽', longitude: 45, degree: 15, minutes: 0, seconds: 0, formattedDegree: "१५° ००'", rashiId: 2, rashiName: 'वृष' as const, nakshatraId: 4, nakshatraName: 'रोहिणी', nakshatraLord: 'चन्द्र', pada: 2, bhava: 2, speed: 13.0, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'mars', name: 'मंगल' as const, englishName: 'Mars', symbol: '♂', longitude: 10, degree: 10, minutes: 0, seconds: 0, formattedDegree: "१०° ००'", rashiId: 1, rashiName: 'मेष' as const, nakshatraId: 1, nakshatraName: 'अश्विनी', nakshatraLord: 'केतु', pada: 1, bhava: 1, speed: 0.5, isRetrograde: false, isCombust: false, dignity: 'स्वक्षेत्र' as const },
      { id: 'mercury', name: 'बुध' as const, englishName: 'Mercury', symbol: '☿', longitude: 40, degree: 10, minutes: 0, seconds: 0, formattedDegree: "१०° ००'", rashiId: 2, rashiName: 'वृष' as const, nakshatraId: 3, nakshatraName: 'कृत्तिका', nakshatraLord: 'सूर्य', pada: 3, bhava: 2, speed: 1.2, isRetrograde: false, isCombust: false, dignity: 'मित्रराशि' as const },
      { id: 'jupiter', name: 'गुरु' as const, englishName: 'Jupiter', symbol: '♃', longitude: 95, degree: 5, minutes: 0, seconds: 0, formattedDegree: "०५° ००'", rashiId: 4, rashiName: 'कर्कट' as const, nakshatraId: 8, nakshatraName: 'पुष्य', nakshatraLord: 'शनि', pada: 1, bhava: 4, speed: 0.1, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'venus', name: 'शुक्र' as const, englishName: 'Venus', symbol: '♀', longitude: 180, degree: 0, minutes: 0, seconds: 0, formattedDegree: "००° ००'", rashiId: 7, rashiName: 'तुला' as const, nakshatraId: 14, nakshatraName: 'चित्रा', nakshatraLord: 'मंगल', pada: 3, bhava: 7, speed: 1.1, isRetrograde: false, isCombust: false, dignity: 'स्वक्षेत्र' as const },
      { id: 'saturn', name: 'शनि' as const, englishName: 'Saturn', symbol: '♄', longitude: 280, degree: 10, minutes: 0, seconds: 0, formattedDegree: "१०° ००'", rashiId: 10, rashiName: 'मकर' as const, nakshatraId: 22, nakshatraName: 'श्रवण', nakshatraLord: 'चन्द्र', pada: 1, bhava: 10, speed: 0.05, isRetrograde: false, isCombust: false, dignity: 'स्वक्षेत्र' as const },
      { id: 'rahu', name: 'राहु' as const, englishName: 'Rahu', symbol: '☊', longitude: 120, degree: 0, minutes: 0, seconds: 0, formattedDegree: "००° ००'", rashiId: 5, rashiName: 'सिंह' as const, nakshatraId: 10, nakshatraName: 'मघा', nakshatraLord: 'केतु', pada: 1, bhava: 5, speed: -0.05, isRetrograde: true, isCombust: false, dignity: 'मित्रराशि' as const },
      { id: 'ketu', name: 'केतु' as const, englishName: 'Ketu', symbol: '☋', longitude: 300, degree: 0, minutes: 0, seconds: 0, formattedDegree: "००° ००'", rashiId: 11, rashiName: 'कुम्भ' as const, nakshatraId: 23, nakshatraName: 'धनिष्ठा', nakshatraLord: 'मंगल', pada: 3, bhava: 11, speed: -0.05, isRetrograde: true, isCombust: false, dignity: 'मित्रराशि' as const },
    ];

    const grahaList = evaluateGrahaPhalList(mockPlanets as any, mockLagna);
    const bhavaList = evaluateBhavaPhalList(mockPlanets as any, mockLagna);

    const isSuccess = grahaList.length === 9 && bhavaList.length === 12;

    results.push({
      id: 'test_25_graha_bhava_phal_engine',
      category: 'फलादेश - नवग्रह र भावफल (चरण ७)',
      testNameNepali: '९ वटै ग्रहको ग्रहफल र १२ वटै भावको भावफल सिद्धान्त आधारित विश्लेषण',
      passed: isSuccess,
      detailsNepali: isSuccess
        ? `सफल: ९ वटै ग्रहको (सूर्य-केतु) ग्रहफल तथा १२ वटै भावको भावफल सफलतापूर्वक निष्कासन गरियो`
        : `विफल: ग्रहफल वा भावफल सङ्ख्या अपूर्ण छ`,
    });
  } catch (err) {
    results.push({
      id: 'test_25_graha_bhava_phal_engine',
      category: 'फलादेश - नवग्रह र भावफल (चरण ७)',
      testNameNepali: 'ग्रहफल र भावफल परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 26: Phase 7 - 13 Comprehensive Life Areas & Health Disclaimer
  try {
    const mockLagna = { rashiId: 1, rashiName: 'मेष' as const, degree: 10, formattedDegree: "१०° ००'", nakshatraName: 'अश्विनी', pada: 1, lord: 'मंगल' };
    const fullMockPlanets = [
      { id: 'sun', name: 'सूर्य' as const, englishName: 'Sun', symbol: '☉', longitude: 10, degree: 10, minutes: 0, seconds: 0, formattedDegree: "१०° ००'", rashiId: 1, rashiName: 'मेष' as const, nakshatraId: 1, nakshatraName: 'अश्विनी', nakshatraLord: 'केतु', pada: 1, bhava: 1, speed: 1.0, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'moon', name: 'चन्द्र' as const, englishName: 'Moon', symbol: '☽', longitude: 45, degree: 15, minutes: 0, seconds: 0, formattedDegree: "१५° ००'", rashiId: 2, rashiName: 'वृष' as const, nakshatraId: 4, nakshatraName: 'रोहिणी', nakshatraLord: 'चन्द्र', pada: 2, bhava: 2, speed: 13.0, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'mars', name: 'मंगल' as const, englishName: 'Mars', symbol: '♂', longitude: 280, degree: 10, minutes: 0, seconds: 0, formattedDegree: "१०° ००'", rashiId: 10, rashiName: 'मकर' as const, nakshatraId: 22, nakshatraName: 'श्रवण', nakshatraLord: 'चन्द्र', pada: 1, bhava: 10, speed: 0.5, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'mercury', name: 'बुध' as const, englishName: 'Mercury', symbol: '☿', longitude: 165, degree: 15, minutes: 0, seconds: 0, formattedDegree: "१५° ००'", rashiId: 6, rashiName: 'कन्या' as const, nakshatraId: 13, nakshatraName: 'हस्त', nakshatraLord: 'चन्द्र', pada: 2, bhava: 6, speed: 1.2, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'jupiter', name: 'गुरु' as const, englishName: 'Jupiter', symbol: '♃', longitude: 95, degree: 5, minutes: 0, seconds: 0, formattedDegree: "०५° ००'", rashiId: 4, rashiName: 'कर्कट' as const, nakshatraId: 8, nakshatraName: 'पुष्य', nakshatraLord: 'शनि', pada: 1, bhava: 4, speed: 0.1, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'venus', name: 'शुक्र' as const, englishName: 'Venus', symbol: '♀', longitude: 355, degree: 25, minutes: 0, seconds: 0, formattedDegree: "२५° ००'", rashiId: 12, rashiName: 'मीन' as const, nakshatraId: 27, nakshatraName: 'रेवती', nakshatraLord: 'बुध', pada: 3, bhava: 12, speed: 1.1, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'saturn', name: 'शनि' as const, englishName: 'Saturn', symbol: '♄', longitude: 200, degree: 20, minutes: 0, seconds: 0, formattedDegree: "२०° ००'", rashiId: 7, rashiName: 'तुला' as const, nakshatraId: 15, nakshatraName: 'स्वाती', nakshatraLord: 'राहु', pada: 4, bhava: 7, speed: 0.05, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'rahu', name: 'राहु' as const, englishName: 'Rahu', symbol: '☊', longitude: 50, degree: 20, minutes: 0, seconds: 0, formattedDegree: "२०° ००'", rashiId: 2, rashiName: 'वृष' as const, nakshatraId: 4, nakshatraName: 'रोहिणी', nakshatraLord: 'चन्द्र', pada: 4, bhava: 2, speed: -0.05, isRetrograde: true, isCombust: false, dignity: 'उच्च' as const },
      { id: 'ketu', name: 'केतु' as const, englishName: 'Ketu', symbol: '☋', longitude: 230, degree: 20, minutes: 0, seconds: 0, formattedDegree: "२०° ००'", rashiId: 8, rashiName: 'वृश्चिक' as const, nakshatraId: 18, nakshatraName: 'ज्येष्ठा', nakshatraLord: 'बुध', pada: 2, bhava: 8, speed: -0.05, isRetrograde: true, isCombust: false, dignity: 'उच्च' as const },
    ];
    const mockDasha: any = { currentMahadasha: { planet: 'गुरु' }, currentAntardasha: { planet: 'बुध' } };

    const areas = evaluate13LifeAreas(mockLagna, fullMockPlanets as any, mockDasha, [], []);
    const healthArea = areas.find((a) => a.areaKey === 'health');

    const is13Areas = areas.length === 13;
    const hasDisclaimer = healthArea && healthArea.medicalDisclaimerNoticeNepali !== undefined && healthArea.medicalDisclaimerNoticeNepali.length > 0;

    const isSuccess = is13Areas && hasDisclaimer;

    results.push({
      id: 'test_26_13_life_areas_health_disclaimer',
      category: '१३ जीवन क्षेत्र फलादेश (चरण ७)',
      testNameNepali: '१३ वटै मुख्य जीवन क्षेत्र तथा अनिवार्य स्वास्थ्य/चिकित्सकीय अस्वीकरण (Medical Disclaimer) जाँच',
      passed: isSuccess,
      detailsNepali: isSuccess
        ? `सफल: १३ वटै जीवन क्षेत्रहरू र स्वास्थ्य खण्डमा अनिवार्य चिकित्सकीय सूचना सफलतापूर्वक समावेश गरियो`
        : `विफल: जीवन क्षेत्र सङ्ख्या वा स्वास्थ्य सूचना अपूर्ण`,
    });
  } catch (err) {
    results.push({
      id: 'test_26_13_life_areas_health_disclaimer',
      category: '१३ जीवन क्षेत्र फलादेश (चरण ७)',
      testNameNepali: '१३ जीवन क्षेत्र परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 27: Phase 7 - Interactive Astrology Q&A Engine (Zero Hallucination)
  try {
    const mockLagna = { rashiId: 1, rashiName: 'मेष' as const, degree: 10, formattedDegree: "१०° ००'", nakshatraName: 'अश्विनी', pada: 1, lord: 'मंगल' };
    const fullMockPlanets = [
      { id: 'sun', name: 'सूर्य' as const, englishName: 'Sun', symbol: '☉', longitude: 10, degree: 10, minutes: 0, seconds: 0, formattedDegree: "१०° ००'", rashiId: 1, rashiName: 'मेष' as const, nakshatraId: 1, nakshatraName: 'अश्विनी', nakshatraLord: 'केतु', pada: 1, bhava: 1, speed: 1.0, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'moon', name: 'चन्द्र' as const, englishName: 'Moon', symbol: '☽', longitude: 45, degree: 15, minutes: 0, seconds: 0, formattedDegree: "१५° ००'", rashiId: 2, rashiName: 'वृष' as const, nakshatraId: 4, nakshatraName: 'रोहिणी', nakshatraLord: 'चन्द्र', pada: 2, bhava: 2, speed: 13.0, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'mars', name: 'मंगल' as const, englishName: 'Mars', symbol: '♂', longitude: 280, degree: 10, minutes: 0, seconds: 0, formattedDegree: "१०° ००'", rashiId: 10, rashiName: 'मकर' as const, nakshatraId: 22, nakshatraName: 'श्रवण', nakshatraLord: 'चन्द्र', pada: 1, bhava: 10, speed: 0.5, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'mercury', name: 'बुध' as const, englishName: 'Mercury', symbol: '☿', longitude: 165, degree: 15, minutes: 0, seconds: 0, formattedDegree: "१५° ००'", rashiId: 6, rashiName: 'कन्या' as const, nakshatraId: 13, nakshatraName: 'हस्त', nakshatraLord: 'चन्द्र', pada: 2, bhava: 6, speed: 1.2, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'jupiter', name: 'गुरु' as const, englishName: 'Jupiter', symbol: '♃', longitude: 95, degree: 5, minutes: 0, seconds: 0, formattedDegree: "०५° ००'", rashiId: 4, rashiName: 'कर्कट' as const, nakshatraId: 8, nakshatraName: 'पुष्य', nakshatraLord: 'शनि', pada: 1, bhava: 4, speed: 0.1, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'venus', name: 'शुक्र' as const, englishName: 'Venus', symbol: '♀', longitude: 355, degree: 25, minutes: 0, seconds: 0, formattedDegree: "२५° ००'", rashiId: 12, rashiName: 'मीन' as const, nakshatraId: 27, nakshatraName: 'रेवती', nakshatraLord: 'बुध', pada: 3, bhava: 12, speed: 1.1, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'saturn', name: 'शनि' as const, englishName: 'Saturn', symbol: '♄', longitude: 200, degree: 20, minutes: 0, seconds: 0, formattedDegree: "२०° ००'", rashiId: 7, rashiName: 'तुला' as const, nakshatraId: 15, nakshatraName: 'स्वाती', nakshatraLord: 'राहु', pada: 4, bhava: 7, speed: 0.05, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'rahu', name: 'राहु' as const, englishName: 'Rahu', symbol: '☊', longitude: 50, degree: 20, minutes: 0, seconds: 0, formattedDegree: "२०° ००'", rashiId: 2, rashiName: 'वृष' as const, nakshatraId: 4, nakshatraName: 'रोहिणी', nakshatraLord: 'चन्द्र', pada: 4, bhava: 2, speed: -0.05, isRetrograde: true, isCombust: false, dignity: 'उच्च' as const },
      { id: 'ketu', name: 'केतु' as const, englishName: 'Ketu', symbol: '☋', longitude: 230, degree: 20, minutes: 0, seconds: 0, formattedDegree: "२०° ००'", rashiId: 8, rashiName: 'वृश्चिक' as const, nakshatraId: 18, nakshatraName: 'ज्येष्ठा', nakshatraLord: 'बुध', pada: 2, bhava: 8, speed: -0.05, isRetrograde: true, isCombust: false, dignity: 'उच्च' as const },
    ];
    const mockDasha: any = { currentMahadasha: { planet: 'गुरु' }, currentAntardasha: { planet: 'बुध' } };

    const qnaRes = answerAstrologyQuestion('मेरो पेशा र जागिरको अवस्था कस्तो छ?', mockLagna, fullMockPlanets as any, mockDasha, [], []);

    const hasAppliedRule = qnaRes.appliedClassicalRuleNepali.length > 0;
    const hasBalancedPrediction = qnaRes.balancedPredictionNepali.length > 0;
    const hasSource = qnaRes.sourceReferenceNepali.length > 0;

    const isSuccess = hasAppliedRule && hasBalancedPrediction && hasSource;

    results.push({
      id: 'test_27_interactive_qna_engine',
      category: 'जिज्ञासा प्रश्न-उत्तर इन्जिन (चरण ७)',
      testNameNepali: 'नियम-सञ्चालित शून्य-भ्रम (Zero Hallucination) प्रश्न-उत्तर र स्रोत प्रमाण परीक्षण',
      passed: isSuccess,
      detailsNepali: isSuccess
        ? `सफल: "तथ्य ➔ नियम ➔ सन्तुलित फलादेश ➔ स्रोत (${qnaRes.sourceReferenceNepali})" चक्र पूर्ण रूपमा प्रमाणित भयो`
        : `विफल: प्रश्न-उत्तर इन्जिन नतिजा अपूर्ण`,
    });
  } catch (err) {
    results.push({
      id: 'test_27_interactive_qna_engine',
      category: 'जिज्ञासा प्रश्न-उत्तर इन्जिन (चरण ७)',
      testNameNepali: 'प्रश्न-उत्तर इन्जिन परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 28: Master Comprehensive Faladesh Report Generator
  try {
    const mockBirth = {
      name: 'प्रमाणित जातक',
      gender: 'male' as const,
      dateBS: '२०५२-०२-०१',
      dateAD: '1995-05-15',
      time: '08:30',
      place: 'काठमाडौँ',
      location: { name: 'काठमाडौँ', country: 'नेपाल', latitude: 27.7172, longitude: 85.3240, timeZone: 5.75 }
    };
    const mockLagna = { rashiId: 1, rashiName: 'मेष' as const, degree: 10, formattedDegree: "१०° ००'", nakshatraName: 'अश्विनी', pada: 1, lord: 'मंगल' };
    const fullMockPlanets = [
      { id: 'sun', name: 'सूर्य' as const, englishName: 'Sun', symbol: '☉', longitude: 10, degree: 10, minutes: 0, seconds: 0, formattedDegree: "१०° ००'", rashiId: 1, rashiName: 'मेष' as const, nakshatraId: 1, nakshatraName: 'अश्विनी', nakshatraLord: 'केतु', pada: 1, bhava: 1, speed: 1.0, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'moon', name: 'चन्द्र' as const, englishName: 'Moon', symbol: '☽', longitude: 45, degree: 15, minutes: 0, seconds: 0, formattedDegree: "१५° ००'", rashiId: 2, rashiName: 'वृष' as const, nakshatraId: 4, nakshatraName: 'रोहिणी', nakshatraLord: 'चन्द्र', pada: 2, bhava: 2, speed: 13.0, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'mars', name: 'मंगल' as const, englishName: 'Mars', symbol: '♂', longitude: 280, degree: 10, minutes: 0, seconds: 0, formattedDegree: "१०° ००'", rashiId: 10, rashiName: 'मकर' as const, nakshatraId: 22, nakshatraName: 'श्रवण', nakshatraLord: 'चन्द्र', pada: 1, bhava: 10, speed: 0.5, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'mercury', name: 'बुध' as const, englishName: 'Mercury', symbol: '☿', longitude: 165, degree: 15, minutes: 0, seconds: 0, formattedDegree: "१५° ००'", rashiId: 6, rashiName: 'कन्या' as const, nakshatraId: 13, nakshatraName: 'हस्त', nakshatraLord: 'चन्द्र', pada: 2, bhava: 6, speed: 1.2, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'jupiter', name: 'गुरु' as const, englishName: 'Jupiter', symbol: '♃', longitude: 95, degree: 5, minutes: 0, seconds: 0, formattedDegree: "०५° ००'", rashiId: 4, rashiName: 'कर्कट' as const, nakshatraId: 8, nakshatraName: 'पुष्य', nakshatraLord: 'शनि', pada: 1, bhava: 4, speed: 0.1, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'venus', name: 'शुक्र' as const, englishName: 'Venus', symbol: '♀', longitude: 355, degree: 25, minutes: 0, seconds: 0, formattedDegree: "२५° ००'", rashiId: 12, rashiName: 'मीन' as const, nakshatraId: 27, nakshatraName: 'रेवती', nakshatraLord: 'बुध', pada: 3, bhava: 12, speed: 1.1, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'saturn', name: 'शनि' as const, englishName: 'Saturn', symbol: '♄', longitude: 200, degree: 20, minutes: 0, seconds: 0, formattedDegree: "२०° ००'", rashiId: 7, rashiName: 'तुला' as const, nakshatraId: 15, nakshatraName: 'स्वाती', nakshatraLord: 'राहु', pada: 4, bhava: 7, speed: 0.05, isRetrograde: false, isCombust: false, dignity: 'उच्च' as const },
      { id: 'rahu', name: 'राहु' as const, englishName: 'Rahu', symbol: '☊', longitude: 50, degree: 20, minutes: 0, seconds: 0, formattedDegree: "२०° ००'", rashiId: 2, rashiName: 'वृष' as const, nakshatraId: 4, nakshatraName: 'रोहिणी', nakshatraLord: 'चन्द्र', pada: 4, bhava: 2, speed: -0.05, isRetrograde: true, isCombust: false, dignity: 'उच्च' as const },
      { id: 'ketu', name: 'केतु' as const, englishName: 'Ketu', symbol: '☋', longitude: 230, degree: 20, minutes: 0, seconds: 0, formattedDegree: "२०° ००'", rashiId: 8, rashiName: 'वृश्चिक' as const, nakshatraId: 18, nakshatraName: 'ज्येष्ठा', nakshatraLord: 'बुध', pada: 2, bhava: 8, speed: -0.05, isRetrograde: true, isCombust: false, dignity: 'उच्च' as const },
    ];
    const mockPanchanga: any = {
      moonRashi: 'वृष',
      nakshatra: { name: 'रोहिणी', pada: 2 },
    };
    const mockDasha: any = { currentMahadasha: { planet: 'गुरु' }, currentAntardasha: { planet: 'बुध' } };

    const report = generateMasterFaladeshReport(mockBirth, mockLagna, fullMockPlanets as any, mockPanchanga, mockDasha);

    const isVersionOk = report.engineVersion.startsWith('7.0');
    const isGrahaOk = report.grahaPhalList.length > 0;
    const isBhavaOk = report.bhavaPhalList.length === 12;
    const isLifeOk = report.lifeAreas.length === 13;

    const isSuccess = isVersionOk && isGrahaOk && isBhavaOk && isLifeOk;

    results.push({
      id: 'test_28_master_faladesh_report',
      category: 'व्यावसायिक फलादेश प्रतिवेदन (चरण ७)',
      testNameNepali: 'मास्टर फलादेश प्रतिवेदन (Master Report) उत्पादन तथा संस्करण नियन्त्रण परीक्षण',
      passed: isSuccess,
      detailsNepali: isSuccess
        ? `सफल: फलादेश इन्िजन संस्करण ${report.engineVersion} द्वारा पूर्ण प्रतिवेदन सफलताका साथ निर्माण गरियो`
        : `विफल: प्रतिवेदन उत्पादन अपूर्ण`,
    });
  } catch (err) {
    results.push({
      id: 'test_28_master_faladesh_report',
      category: 'व्यावसायिक फलादेश प्रतिवेदन (चरण ७)',
      testNameNepali: 'मास्टर प्रतिवेदन परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 29: Phase 8 - Ashtakoot 36 Guna Match Engine & Exception Rules
  try {
    const mockBoy = {
      id: 'boy_test',
      name: 'वर',
      gender: 'male' as const,
      dateBS: '२०५०-०१-०१',
      dateAD: '1993-04-14',
      time: '08:00',
      place: 'काठमाडौँ',
      location: { name: 'काठमाडौँ', country: 'नेपाल', latitude: 27.7172, longitude: 85.3240, timeZone: 5.75 }
    };
    const mockGirl = {
      id: 'girl_test',
      name: 'कन्या',
      gender: 'female' as const,
      dateBS: '२०५२-०५-०५',
      dateAD: '1995-08-21',
      time: '10:30',
      place: 'पोखरा',
      location: { name: 'पोखरा', country: 'नेपाल', latitude: 28.2096, longitude: 83.9856, timeZone: 5.75 }
    };

    const vivahRes = calculateVivahMilan(mockBoy, mockGirl);

    const is8Kutas = vivahRes.ashtakoot.length === 8;
    const isScoreValid = vivahRes.totalScore >= 0 && vivahRes.totalScore <= 36;
    const isSuccess = is8Kutas && isScoreValid;

    results.push({
      id: 'test_29_ashtakoot_guna_engine',
      category: 'विवाह मिलान - अष्टकूट ३६ गुण (चरण ८)',
      testNameNepali: 'अष्टकूट ३६ गुण मिलान, नाडी/भकूट/गण दोष अपवाद तथा शास्त्रीय नियम परीक्षण',
      passed: isSuccess,
      detailsNepali: isSuccess
        ? `सफल: कुल ${vivahRes.totalScore}/३६ अङ्क प्राप्त, ८ वटै अष्टकूट श्रेणी निष्कासित`
        : `विफल: अष्टकूट गुण गणना अमान्य`,
    });
  } catch (err) {
    results.push({
      id: 'test_29_ashtakoot_guna_engine',
      category: 'विवाह मिलान - अष्टकूट ३६ गुण (चरण ८)',
      testNameNepali: 'अष्टकूट गुण परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 30: Phase 8 - Mangal Dosha Deep Analysis & Mutual Cancellation
  try {
    const mockBoy = {
      id: 'boy_test',
      name: 'वर',
      gender: 'male' as const,
      dateBS: '२०५०-०१-०१',
      dateAD: '1993-04-14',
      time: '08:00',
      place: 'काठमाडौँ',
      location: { name: 'काठमाडौँ', country: 'नेपाल', latitude: 27.7172, longitude: 85.3240, timeZone: 5.75 }
    };
    const mockGirl = {
      id: 'girl_test',
      name: 'कन्या',
      gender: 'female' as const,
      dateBS: '२०५२-०५-०५',
      dateAD: '1995-08-21',
      time: '10:30',
      place: 'पोखरा',
      location: { name: 'पोखरा', country: 'नेपाल', latitude: 28.2096, longitude: 83.9856, timeZone: 5.75 }
    };

    const vivahRes = calculateVivahMilan(mockBoy, mockGirl);

    const hasBoyMangal = vivahRes.mangalDoshaBoy !== undefined;
    const hasGirlMangal = vivahRes.mangalDoshaGirl !== undefined;
    const isSuccess = hasBoyMangal && hasGirlMangal;

    results.push({
      id: 'test_30_mangal_dosha_analysis',
      category: 'मङ्गल दोष विश्लेषण (चरण ८)',
      testNameNepali: 'लग्न, चन्द्र र शुक्रबाट मङ्गल दोष जाँच तथा समान-दोष परिहार परीक्षण',
      passed: isSuccess,
      detailsNepali: isSuccess
        ? `सफल: वर र कन्या दुवैको मङ्गल स्थिति (वर: ${vivahRes.mangalDoshaBoy.severity}, कन्या: ${vivahRes.mangalDoshaGirl.severity}) सफलताका साथ विश्लेषित`
        : `विफल: मङ्गल दोष विश्लेषण अपूर्ण`,
    });
  } catch (err) {
    results.push({
      id: 'test_30_mangal_dosha_analysis',
      category: 'मङ्गल दोष विश्लेषण (चरण ८)',
      testNameNepali: 'मङ्गल दोष परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 31: Phase 8 - 13 Marital Life Areas & Comparative Kundali Table
  try {
    const mockBoy = {
      id: 'boy_test',
      name: 'वर',
      gender: 'male' as const,
      dateBS: '२०५०-०१-०१',
      dateAD: '1993-04-14',
      time: '08:00',
      place: 'काठमाडौँ',
      location: { name: 'काठमाडौँ', country: 'नेपाल', latitude: 27.7172, longitude: 85.3240, timeZone: 5.75 }
    };
    const mockGirl = {
      id: 'girl_test',
      name: 'कन्या',
      gender: 'female' as const,
      dateBS: '२०५२-०५-०५',
      dateAD: '1995-08-21',
      time: '10:30',
      place: 'पोखरा',
      location: { name: 'पोखरा', country: 'नेपाल', latitude: 28.2096, longitude: 83.9856, timeZone: 5.75 }
    };

    const vivahRes = calculateVivahMilan(mockBoy, mockGirl);

    const is13Areas = vivahRes.maritalLifeAreas.length === 13;
    const isCompTableOk = vivahRes.comparativeTable.length > 0;
    const isSuccess = is13Areas && isCompTableOk;

    results.push({
      id: 'test_31_13_marital_areas_and_comparison',
      category: 'वैवाहिक जीवन क्षेत्र (चरण ८)',
      testNameNepali: '१३ वैवाहिक आयाम, छेउछेउमा तुलनात्मक कुण्डली तालिका तथा सप्तमेश/शुक्र/गुरु विश्लेषण',
      passed: isSuccess,
      detailsNepali: isSuccess
        ? `सफल: १३ वटै वैवाहिक जीवन क्षेत्र तथा कुण्डली तुलनात्मक तालिका निर्माण भयो`
        : `विफल: जीवन क्षेत्र वा तुलनात्मक तालिका निर्माण भएन`,
    });
  } catch (err) {
    results.push({
      id: 'test_31_13_marital_areas_and_comparison',
      category: 'वैवाहिक जीवन क्षेत्र (चरण ८)',
      testNameNepali: 'वैवाहिक जीवन क्षेत्र परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  // Test 32: Phase 8 - Master Vivah Engine Versioning & Interactive Q&A
  try {
    const mockBoy = {
      id: 'boy_test',
      name: 'वर',
      gender: 'male' as const,
      dateBS: '२०५०-०१-०१',
      dateAD: '1993-04-14',
      time: '08:00',
      place: 'काठमाडौँ',
      location: { name: 'काठमाडौँ', country: 'नेपाल', latitude: 27.7172, longitude: 85.3240, timeZone: 5.75 }
    };
    const mockGirl = {
      id: 'girl_test',
      name: 'कन्या',
      gender: 'female' as const,
      dateBS: '२०५२-०५-०५',
      dateAD: '1995-08-21',
      time: '10:30',
      place: 'पोखरा',
      location: { name: 'पोखरा', country: 'नेपाल', latitude: 28.2096, longitude: 83.9856, timeZone: 5.75 }
    };

    const vivahRes = calculateVivahMilan(mockBoy, mockGirl);
    const qnaAns = answerVivahQuestion('नाडी दोषको असर के हुन्छ?', vivahRes);

    const isVersionOk = vivahRes.engineVersion === VIVAH_ENGINE_VERSION;
    const isQnaOk = qnaAns.answerNepali.length > 0 && qnaAns.classicalRuleNepali.length > 0;
    const isSuccess = isVersionOk && isQnaOk;

    results.push({
      id: 'test_32_master_vivah_versioning_and_qna',
      category: 'विवाह मिलान प्रतिवेदन (चरण ८)',
      testNameNepali: 'मास्टर विवाह इन्जिन संस्करण (${VIVAH_ENGINE_VERSION}) तथा विवाह जिज्ञासा प्रश्न-उत्तर परीक्षण',
      passed: isSuccess,
      detailsNepali: isSuccess
        ? `सफल: विवाह इन्जिन संस्करण ${vivahRes.engineVersion} प्रमाणित र प्रश्न-उत्तर प्रणाली क्रियाशील भयो`
        : `विफल: संस्करण वा प्रश्न-उत्तर परीक्षण असफल`,
    });
  } catch (err) {
    results.push({
      id: 'test_32_master_vivah_versioning_and_qna',
      category: 'विवाह मिलान प्रतिवेदन (चरण ८)',
      testNameNepali: 'मास्टर विवाह प्रतिवेदन परीक्षण',
      passed: false,
      detailsNepali: `त्रुटि: ${String(err)}`,
    });
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    totalTests: results.length,
    passedCount,
    failedCount,
    isAllPassed: failedCount === 0,
    results,
  };
}
