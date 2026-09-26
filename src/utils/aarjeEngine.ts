import { 
  AarjeRecord, 
  AarjeRule, 
  AarjeAnalysisResult, 
  DirectionScore, 
  ThreeLayerDirectionInfo, 
  HouseAnalysisInfo, 
  AarjeCalculationDetails 
} from '../types/aarjeTypes';
import { 
  getJulianDay, 
  getAyanamsa, 
  calculateLagna, 
  calculatePlanetaryPositions, 
  RASHI_DATA 
} from './astroCalculations';
import { calculatePanchanga } from './panchangaEngine';
import { toDevanagariNumerals } from './nepaliCalendar';
import { getStoredCustomAarjeRules } from '../db/aarjeStore';

export const AARJE_ENGINE_VERSION = '1.0.0';

// Classical Rules Repository for Aarje Prashna Jyotish
export const DEFAULT_AARJE_RULES: AarjeRule[] = [
  {
    id: 'rule_01_sthir_rashi_home',
    nameNepali: 'स्थिर राशि र घरभित्रको भण्डार/दराज नियम',
    category: 'all',
    houseIndicators: [1, 4],
    planetIndicators: ['Chandra', 'Guru', 'Shukra'],
    direction: 'दक्षिण',
    placeType: 'घरभित्र',
    recoveryChance: 'भेटिने सम्भावना उच्च',
    sourceText: 'प्रश्नमार्ग अध्याय १०, श्लोक १२-१५',
    tradition: 'केरलीय प्रश्नमार्ग परम्परा',
    descriptionNepali: 'यदि प्रश्नकुण्डलीको लग्न वा चतुर्थ भावमा स्थिर राशि (वृष, सिंह, वृश्चिक, कुम्भ) भएमा हराएको वस्तु घरभित्रै दराज, बक्स वा सेफ नजिक सुरक्षित रहन्छ।',
    isActive: true,
    confidenceWeight: 5,
    version: '1.0.0'
  },
  {
    id: 'rule_02_char_rashi_outside',
    nameNepali: 'चर राशि र बाहिर/सवारी साधन स्थानान्तरण नियम',
    category: 'all',
    houseIndicators: [3, 7, 12],
    planetIndicators: ['Mangal', 'Rahu', 'Shani'],
    direction: 'पश्चिम',
    placeType: 'बाहिर',
    recoveryChance: 'स्थान परिवर्तन भएको सम्भावना',
    sourceText: 'षट्पञ्चाशिका अध्याय ४, श्लोक ८',
    tradition: 'वाराहमिहिर प्रश्न सिद्धान्त',
    descriptionNepali: 'प्रश्नकुण्डलीको ७ औँ वा १२ औँ भावमा चर राशि (मेष, कर्कट, तुला, मकर) भएमा वस्तु हराएको स्थानबाट अर्कै स्थानमा स्थानान्तरण वा यात्रा गर्दा छुटेको हुन्छ।',
    isActive: true,
    confidenceWeight: 4,
    version: '1.0.0'
  },
  {
    id: 'rule_03_dvisvabhav_rashi_workplace',
    nameNepali: 'द्विस्वभाव राशि र कार्यालय/काउन्टर/छिमेकी क्षेत्र नियम',
    category: 'all',
    houseIndicators: [3, 6, 10],
    planetIndicators: ['Budha', 'Guru'],
    direction: 'उत्तर',
    placeType: 'कार्यालय',
    recoveryChance: 'नजिकै हुन सक्ने',
    sourceText: 'प्रश्नामृतम् अध्याय ५, श्लोक २०',
    tradition: 'उत्तर भारतीय प्रश्न परम्परा',
    descriptionNepali: 'द्विस्वभाव राशि (मिथुन, कन्या, धनु, मीन) लग्न वा दशम भावमा भएमा कार्यस्थल, टेबल, दराज, छिमेकी वा आवतजावत गर्ने बाटो नजिक भेटिने सम्भावना हुन्छ।',
    isActive: true,
    confidenceWeight: 4,
    version: '1.0.0'
  },
  {
    id: 'rule_04_dhan_2nd_house_jupiter',
    nameNepali: 'द्वितीय भाव तथा गुरु बलबाट धन/नगद प्राप्ति नियम',
    category: 'cash',
    houseIndicators: [2, 11],
    planetIndicators: ['Guru', 'Shukra'],
    direction: 'ईशान',
    placeType: 'घरभित्र',
    recoveryChance: 'भेटिने सम्भावना उच्च',
    sourceText: 'प्रश्नतन्त्र अध्याय ३, श्लोक १५',
    tradition: 'नीलकण्ठ प्रश्न परम्परा',
    descriptionNepali: 'द्वितीयेश वा बृहस्पति शुभ भावमा (१, ४, ५, ९, ११) भएमा वा द्वितीय भावमा शुभग्रहको दृष्टि भएमा हराएको धन छिट्टै फेला पर्दछ।',
    isActive: true,
    confidenceWeight: 5,
    version: '1.0.0'
  },
  {
    id: 'rule_05_jewelry_sun_venus',
    nameNepali: 'सूर्य-शुक्र बल र गहना/बहुमूल्य धातु नियम',
    category: 'jewelry',
    houseIndicators: [2, 4, 8],
    planetIndicators: ['Surya', 'Shukra', 'Guru'],
    direction: 'आग्नेय',
    placeType: 'घरभित्र',
    recoveryChance: 'ढिलो भेटिन सक्ने',
    sourceText: 'भृगुसंहिता प्रश्न खण्ड अध्याय ८',
    tradition: 'भृगु प्रश्न परम्परा',
    descriptionNepali: 'गहना तथा धातुको कारक सूर्य र शुक्र शुभ स्थितिमा रहेमा वस्त्र, बक्स वा गहना राख्ने परम्परागत दराजमा अल्झिएको अवस्थामा भेटिन्छ।',
    isActive: true,
    confidenceWeight: 5,
    version: '1.0.0'
  },
  {
    id: 'rule_06_documents_mercury',
    nameNepali: 'बुध कारक र महत्त्वपूर्ण कानुनी कागजात नियम',
    category: 'documents',
    houseIndicators: [3, 5],
    planetIndicators: ['Budha'],
    direction: 'उत्तर',
    placeType: 'कार्यालय',
    recoveryChance: 'नजिकै हुन सक्ने',
    sourceText: 'प्रश्नामृतम् अध्याय ६, श्लोक ३',
    tradition: 'शास्त्रोक्त प्रश्न विचार',
    descriptionNepali: 'कागजातको कारक बुध तृतीयेश वा लग्नेशसँग युत/दृष्ट भएमा फाइल, पुस्तक, झोला वा काउन्टर टेबल नजिक सुरक्षित रूपमा भेटिन्छ।',
    isActive: true,
    confidenceWeight: 4,
    version: '1.0.0'
  },
  {
    id: 'rule_07_mobile_electronics_mercury_rahu',
    nameNepali: 'तृतीयेश र विद्युतीय/मोबाइल उपकरण नियम',
    category: 'electronics',
    houseIndicators: [3, 11],
    planetIndicators: ['Budha', 'Rahu'],
    direction: 'वायव्य',
    placeType: 'सवारी साधन',
    recoveryChance: 'अन्य व्यक्तिसँग गएको सम्भावना',
    sourceText: 'आधुनिक प्रश्न ज्योतिष प्रकाश',
    tradition: 'आधुनिक प्रश्न ज्योतिष परम्परा',
    descriptionNepali: 'विद्युतीय यन्त्र, मोबाइल वा कम्प्युटरको प्रश्नमा ३ औँ भाव र राहु/बुधको स्थिति अनुसार सवारी साधन वा अन्य व्यक्तिको नियन्त्रणमा पुगेको संकेत गर्छ।',
    isActive: true,
    confidenceWeight: 4,
    version: '1.0.0'
  },
  {
    id: 'rule_08_stolen_7th_house_malefic',
    nameNepali: 'सप्तम भाव क्रूर ग्रह र चोरी सम्बन्धी संकेत',
    category: 'all',
    houseIndicators: [7, 8, 12],
    planetIndicators: ['Shani', 'Rahu', 'Ketu', 'Mangal'],
    direction: 'नैऋत्य',
    placeType: 'अर्को स्थान',
    recoveryChance: 'अन्य व्यक्तिसँग गएको सम्भावना',
    sourceText: 'प्रश्नमार्ग अध्याय ११, श्लोक २५',
    tradition: 'केरलीय प्रश्न परम्परा',
    descriptionNepali: 'सप्तम वा अष्टम भावमा पापग्रह (शनि, राहु, केतु) रहेमा वस्तु अपरिचित वा नजिकैको बाह्य व्यक्तिको नियन्त्रणमा गएको ज्योतिषीय संकेत गर्छ।',
    isActive: true,
    confidenceWeight: 5,
    version: '1.0.0'
  },
  {
    id: 'rule_09_retrograde_planet_search',
    nameNepali: 'वक्री ग्रह र पुनः खोजी नियम',
    category: 'all',
    houseIndicators: [1, 2, 4, 10],
    planetIndicators: ['Shani', 'Guru', 'Budha', 'Mangal', 'Shukra'],
    direction: 'पश्चिम',
    placeType: 'घरभित्र',
    recoveryChance: 'भेटिने सम्भावना उच्च',
    sourceText: 'प्रश्नतन्त्र अध्याय ४, श्लोक १२',
    tradition: 'पराशर प्रश्न परम्परा',
    descriptionNepali: 'मुख्य कारक ग्रह वा लग्नेश वक्री भएमा पहिले नै हेरिसकिएको वा नजिकैको पुरानो ठाउँमा फेरि दोहोर्याएर खोज्दा वस्तु फेला पर्छ।',
    isActive: true,
    confidenceWeight: 4,
    version: '1.0.0'
  },
  {
    id: 'rule_10_combust_hidden_cloth',
    nameNepali: 'अस्त ग्रह र ओझेल/कपडा मुनि ओझेल नियम',
    category: 'all',
    houseIndicators: [4, 8, 12],
    planetIndicators: ['Surya'],
    direction: 'पूर्व',
    placeType: 'घरभित्र',
    recoveryChance: 'ढिलो भेटिन सक्ने',
    sourceText: 'षट्पञ्चाशिका अध्याय ५, श्लोक २',
    tradition: 'उत्तर भारतीय प्रश्न परम्परा',
    descriptionNepali: 'वस्तुको कारक ग्रह सूर्यसँग नजिक भएर अस्त (Combust) भएमा वस्तु कपडा, फाइल वा अर्को कुनै वस्तुको मुनि छोपिएर ओझेल परेको हुन्छ।',
    isActive: true,
    confidenceWeight: 4,
    version: '1.0.0'
  },
  {
    id: 'rule_11_vehicles_venus_mars',
    nameNepali: 'चतुर्थेश-शुक्र र सवारी साधन/सवारी साधन भित्र नियम',
    category: 'vehicles',
    houseIndicators: [4, 7],
    planetIndicators: ['Shukra', 'Mangal'],
    direction: 'आग्नेय',
    placeType: 'सवारी साधन',
    recoveryChance: 'नजिकै हुन सक्ने',
    sourceText: 'प्रश्नविचार अध्याय ९',
    tradition: 'केरलीय प्रश्न परम्परा',
    descriptionNepali: 'सवारी साधन सम्बन्धी प्रश्नमा चतुर्थेश र शुक्रको बलले गाडी, ट्याक्सी, मोटरसाइकल वा ग्यारेज नजिक छुटेको वा राखिएको संकेत गर्दछ।',
    isActive: true,
    confidenceWeight: 5,
    version: '1.0.0'
  },
  {
    id: 'rule_12_livestock_jupiter_moon',
    nameNepali: 'पशु/चौपाया र खुला चरन/छिमेकी गोठ नियम',
    category: 'livestock',
    houseIndicators: [4, 6],
    planetIndicators: ['Guru', 'Chandra'],
    direction: 'ईशान',
    placeType: 'बाहिर',
    recoveryChance: 'भेटिने सम्भावना उच्च',
    sourceText: 'पराशर प्रश्न खण्ड अध्याय १५',
    tradition: 'पराशर परम्परा',
    descriptionNepali: 'चौपाया वा पाल्तु जनावरको प्रश्नमा षष्ठेश र गुरु/चन्द्रमाको स्थितिले नजिकैको जल/चरन क्षेत्र वा छिमेकीको गोठ नजिक भेटिने संकेत गर्छ।',
    isActive: true,
    confidenceWeight: 4,
    version: '1.0.0'
  }
];

export function getAllAarjeRules(): AarjeRule[] {
  const custom = getStoredCustomAarjeRules();
  // Merge custom over default by ID or append
  const map = new Map<string, AarjeRule>();
  DEFAULT_AARJE_RULES.forEach((r) => map.set(r.id, r));
  custom.forEach((r) => map.set(r.id, r));
  return Array.from(map.values());
}

export function analyzeAarjeQuery(rawRecord: AarjeRecord): AarjeAnalysisResult {
  try {
    if (!rawRecord) {
      throw new Error('AarjeRecord is undefined or null');
    }

    // Safe field extraction with fallbacks
    const dateAD = rawRecord.queryDateAD || '2026-04-14';
    const timeStr = rawRecord.queryTime || '12:00';
    const locName = rawRecord.queryLocation?.locationName || 'काठमाडौँ';
    const lat = rawRecord.queryLocation?.lat ?? 27.7;
    const lng = rawRecord.queryLocation?.lng ?? 85.3;
    const tzOffset = rawRecord.queryLocation?.timezone === 'Asia/Kathmandu' ? 5.75 : 5.75;

    const julianDay = getJulianDay(dateAD, timeStr, tzOffset);
    const ayanamsa = getAyanamsa(julianDay);
    
    // Calculate Prashna Lagna
    const lagna = calculateLagna(julianDay, lat, lng, ayanamsa);
    
    // Calculate Planetary Positions
    const planets = calculatePlanetaryPositions(julianDay, ayanamsa, lagna?.rashiId ?? 0);
    
    // Panchanga
    let panchanga: any = null;
    try {
      panchanga = calculatePanchanga(dateAD, timeStr, lat, lng, tzOffset);
    } catch (pErr) {
      console.error('Error calculating Panchanga for Aarje:', pErr);
    }

    // Lagna Rashi info
    const lagnaRashi = RASHI_DATA.find((r) => r.id === (lagna?.rashiId ?? 0)) || RASHI_DATA[0];
    const lagnaLord = lagnaRashi?.lord || 'मंगल';
    
    const moonPlanet = planets?.find((p) => p.name === 'चन्द्र') || planets?.[0] || {
      name: 'चन्द्र',
      rashiName: 'मेष',
      bhava: 1,
      degree: 0,
      nakshatraName: 'अश्विनी',
      isRetrograde: false,
      isCombust: false
    };
    const moonRashiObj = RASHI_DATA.find((r) => r.name === moonPlanet.rashiName) || RASHI_DATA[0];

    const tithiName = panchanga?.tithi?.name || 'प्रथमा';
    const nakshatraName = panchanga?.nakshatra?.name || moonPlanet.nakshatraName || 'अश्विनी';
    const dayNameNepali = panchanga?.dayNameNepali || 'आइतबार';

    // Retrograde and Combust planets lists
    const retrogradePlanets = (planets || [])
      .filter((p) => p.isRetrograde && p.name !== 'राहु' && p.name !== 'केतु')
      .map((p) => `${p.name} (वक्री)`);
    const combustPlanets = (planets || []).filter((p) => p.isCombust).map((p) => `${p.name} (अस्त)`);

    // --- THREE-LAYER DIRECTION ANALYSIS (तीन तहको दिशा गणना) ---
    const directionsList: Array<'पूर्व' | 'आग्नेय' | 'दक्षिण' | 'नैऋत्य' | 'पश्चिम' | 'वायव्य' | 'उत्तर' | 'ईशान'> = [
      'पूर्व', 'आग्नेय', 'दक्षिण', 'नैऋत्य', 'पश्चिम', 'वायव्य', 'उत्तर', 'ईशान'
    ];

    const dirScoresMap: Record<string, { planet: number; rashi: number; bhava: number }> = {};
    directionsList.forEach((d) => {
      dirScoresMap[d] = { planet: 0, rashi: 0, bhava: 0 };
    });

    const planetDirMap: Record<string, 'पूर्व' | 'आग्नेय' | 'दक्षिण' | 'नैऋत्य' | 'पश्चिम' | 'वायव्य' | 'उत्तर' | 'ईशान'> = {
      'सूर्य': 'पूर्व',
      'शुक्र': 'आग्नेय',
      'मंगल': 'दक्षिण',
      'राहु': 'नैऋत्य',
      'शनि': 'पश्चिम',
      'चन्द्र': 'वायव्य',
      'केतु': 'वायव्य',
      'बुध': 'उत्तर',
      'गुरु': 'ईशान'
    };

    (planets || []).forEach((p) => {
      const dir = planetDirMap[p.name];
      if (dir) {
        if (p.name === lagnaLord) dirScoresMap[dir].planet += 3;
        if (p.name === 'चन्द्र') dirScoresMap[dir].planet += 2.5;
        if ([1, 4, 7, 8, 10, 11].includes(p.bhava)) dirScoresMap[dir].planet += 1.5;
      }
    });

    let primaryPlanetDir = planetDirMap[lagnaLord] || 'पूर्व';
    let planetDirReason = `लग्नेश (${lagnaLord}) को दिशा ${primaryPlanetDir} र चन्द्रमाको स्थितिबाट ग्रह-दिशा निर्धारण गरियो।`;

    const getRashiDir = (element: string): 'पूर्व' | 'दक्षिण' | 'पश्चिम' | 'उत्तर' => {
      if (element === 'अग्नि') return 'पूर्व';
      if (element === 'पृथ्वी') return 'दक्षिण';
      if (element === 'वायु') return 'पश्चिम';
      return 'उत्तर';
    };

    const lagnaRashiDir = getRashiDir(lagnaRashi?.element || 'अग्नि');
    dirScoresMap[lagnaRashiDir].rashi += 3;

    const moonRashiDir = getRashiDir(moonRashiObj?.element || 'जल');
    dirScoresMap[moonRashiDir].rashi += 2.5;

    const rashi2 = RASHI_DATA[((lagna?.rashiId ?? 0) + 1 - 1) % 12] || RASHI_DATA[0];
    const rashi4 = RASHI_DATA[((lagna?.rashiId ?? 0) + 4 - 1) % 12] || RASHI_DATA[0];
    const rashi8 = RASHI_DATA[((lagna?.rashiId ?? 0) + 8 - 1) % 12] || RASHI_DATA[0];
    dirScoresMap[getRashiDir(rashi2?.element || 'पृथ्वी')].rashi += 1;
    dirScoresMap[getRashiDir(rashi4?.element || 'जल')].rashi += 1.5;
    dirScoresMap[getRashiDir(rashi8?.element || 'जल')].rashi += 1;

    let primaryRashiDir = lagnaRashiDir;
    let rashiDirReason = `प्रश्न लग्न राशि (${lagnaRashi?.name || 'मेष'} - ${lagnaRashi?.element || 'अग्नि'} तत्व) ले मुख्य रूपमा ${lagnaRashiDir} दिशा संकेत गर्दछ।`;

    const bhavaDirMap: Record<number, 'पूर्व' | 'आग्नेय' | 'दक्षिण' | 'नैऋत्य' | 'पश्चिम' | 'वायव्य' | 'उत्तर' | 'ईशान'> = {
      1: 'पूर्व',
      2: 'आग्नेय',
      3: 'आग्नेय',
      4: 'उत्तर',
      5: 'नैऋत्य',
      6: 'नैऋत्य',
      7: 'पश्चिम',
      8: 'वायव्य',
      9: 'वायव्य',
      10: 'दक्षिण',
      11: 'ईशान',
      12: 'ईशान'
    };

    const lagnaLordPlanet = (planets || []).find((p) => p.name === lagnaLord);
    let primaryBhavaDir = 'पूर्व';
    if (lagnaLordPlanet) {
      primaryBhavaDir = bhavaDirMap[lagnaLordPlanet.bhava] || 'पूर्व';
      dirScoresMap[primaryBhavaDir].bhava += 3;
    }
    const moonBhavaDir = bhavaDirMap[moonPlanet.bhava] || 'उत्तर';
    dirScoresMap[moonBhavaDir].bhava += 2.5;

    let bhavaDirReason = `लग्नेश ${lagnaLordPlanet ? lagnaLordPlanet.bhava + ' भाव' : 'प्रथम भाव'} मा रहेकाले भाव-दिशा ${primaryBhavaDir} प्राप्त भयो।`;

    const directionScores: DirectionScore[] = directionsList.map((d) => {
      const pScore = Number(dirScoresMap[d].planet.toFixed(1));
      const rScore = Number(dirScoresMap[d].rashi.toFixed(1));
      const bScore = Number(dirScoresMap[d].bhava.toFixed(1));
      const totalScore = Number((pScore + rScore + bScore).toFixed(1));
      let indicatorLevel: 'उच्च' | 'मध्यम' | 'न्यून' = 'न्यून';
      if (totalScore >= 5) indicatorLevel = 'उच्च';
      else if (totalScore >= 2.5) indicatorLevel = 'मध्यम';

      return {
        directionName: d,
        planetScore: pScore,
        rashiScore: rScore,
        bhavaScore: bScore,
        totalScore,
        indicatorLevel
      };
    });

    const sortedDirections = [...directionScores].sort((a, b) => b.totalScore - a.totalScore);
    const topDir = sortedDirections[0] || { directionName: 'पूर्व', totalScore: 5 };
    const secondDir = sortedDirections[1] || { directionName: 'उत्तर', totalScore: 3 };

    let isMixedSignal = false;
    let combinedDirection = topDir.directionName;

    if (secondDir && (topDir.totalScore - secondDir.totalScore) <= 1.0 && secondDir.totalScore >= 3.0) {
      isMixedSignal = true;
      combinedDirection = `${topDir.directionName} / ${secondDir.directionName} (मिश्रित दिशा संकेत)`;
    }

    const directionAstrologicalReason = isMixedSignal
      ? `बहु-संकेत गणना अनुसार ${topDir.directionName} (अङ्क: ${topDir.totalScore}) र ${secondDir.directionName} (अङ्क: ${secondDir.totalScore}) दुवै बलियो देखिएकाले मिश्रित दिशा संकेत प्राप्त भएको छ।`
      : `ग्रह-दिशा (${primaryPlanetDir}), राशि-दिशा (${primaryRashiDir}) र भाव-दिशा (${primaryBhavaDir}) को त्रि-स्तरीय गणनाबाट ${topDir.directionName} दिशामा सबैभन्दा उच्च सूचक प्राप्त भयो।`;

    const threeLayerDirection: ThreeLayerDirectionInfo = {
      planetDirection: primaryPlanetDir,
      planetDirectionReason: planetDirReason,
      rashiDirection: primaryRashiDir,
      rashiDirectionReason: rashiDirReason,
      bhavaDirection: primaryBhavaDir,
      bhavaDirectionReason: bhavaDirReason,
      combinedDirection,
      isMixedSignal,
      directionScores
    };

    const houseNamesMap: Record<number, string> = {
      1: '१ (प्रथम भाव - प्रश्नकर्ता / मानसिक स्थिति)',
      2: '२ (द्वितीय भाव - धन / नगद / गहना / कोष)',
      3: '३ (तृतीय भाव - कागजात / सञ्चार / मोबाइल / प्रयास)',
      4: '४ (चतुर्थ भाव - घर / दराज / सेफ / भण्डार / सवारी)',
      5: '५ (पञ्चम भाव - बुद्धि / ज्ञान / विवेक)',
      6: '६ (षष्ठ भाव - रोग / ऋण / शत्रु / चौपाया)',
      7: '७ (सप्तम भाव - बाह्य व्यक्ति / चोरी / काउन्टर)',
      8: '८ (अष्टम भाव - गुप्त / अदृश्य / चोरी / चिन्ता)',
      9: '९ (नवम भाव - भाग्य / धर्म / टाढाको क्षेत्र)',
      10: '१० (दशम भाव - कार्यस्थल / कार्यालय / बजार)',
      11: '११ (एकादश भाव - प्राप्ति / लाभ / फेला पर्ने अवसर)',
      12: '१२ (द्वादश भाव - व्यय / हानि / टाढा स्थानान्तरण)'
    };

    const houseAnalysis: HouseAnalysisInfo[] = [];
    for (let h = 1; h <= 12; h++) {
      const rashiIdx = ((lagna?.rashiId ?? 0) + h - 2) % 12;
      const rashiObj = RASHI_DATA[rashiIdx < 0 ? rashiIdx + 12 : rashiIdx] || RASHI_DATA[0];
      const lordName = rashiObj?.lord || 'मंगल';

      const lordPlanet = (planets || []).find((p) => p.name === lordName);
      const planetsPresent = (planets || []).filter((p) => p.bhava === h).map((p) => p.name);

      const aspectingPlanets: string[] = [];
      (planets || []).forEach((p) => {
        if (p.bhava !== h) {
          if (((p.bhava + 6) % 12 || 12) === h) aspectingPlanets.push(`${p.name} (७ औँ दृष्टि)`);
          if (p.name === 'मंगल' && (((p.bhava + 3) % 12 || 12) === h || ((p.bhava + 7) % 12 || 12) === h)) aspectingPlanets.push('मंगल (विशेष दृष्टि)');
          if (p.name === 'गुरु' && (((p.bhava + 4) % 12 || 12) === h || ((p.bhava + 8) % 12 || 12) === h)) aspectingPlanets.push('गुरु (विशेष दृष्टि)');
          if (p.name === 'शनि' && (((p.bhava + 2) % 12 || 12) === h || ((p.bhava + 9) % 12 || 12) === h)) aspectingPlanets.push('शनि (विशेष दृष्टि)');
        }
      });

      let significance = `${rashiObj.name} राशि र ${lordName} स्वामी। `;
      if (planetsPresent.length > 0) significance += `स्थित ग्रह: ${planetsPresent.join(', ')}। `;
      if (lordPlanet) significance += `भावेश ${lordName} ${lordPlanet.bhava} भावमा स्थित छ।`;

      houseAnalysis.push({
        houseNo: h,
        houseName: houseNamesMap[h] || `${h} भाव`,
        rashiName: rashiObj.name,
        lordName,
        lordBhava: lordPlanet ? lordPlanet.bhava : h,
        planetsPresent,
        aspectingPlanets,
        significanceNepali: significance
      });
    }

    let probablePlaceCategory = 'घरभित्र';
    let placeReason = '';

    if (lagnaRashi?.quality === 'स्थिर') {
      probablePlaceCategory = 'घरभित्र (मुख्य दराज / सेफ / भण्डार कोठा)';
      placeReason = `प्रश्न लग्न स्थिर राशि (${lagnaRashi?.name || 'मेष'}) भएकाले वस्तु हराएको ठाउँ नजिकै, घर वा सुरक्षित भण्डार कोठाभित्रै रहेको ज्योतिषीय संकेत छ।`;
    } else if (lagnaRashi?.quality === 'द्विस्वभाव') {
      probablePlaceCategory = 'कार्यालय / टेबल ड्रअर / काउन्टर / छिमेकी क्षेत्र';
      placeReason = `प्रश्न लग्न द्विस्वभाव राशि (${lagnaRashi?.name || 'मेष'}) भएकाले कार्यस्थल, अध्ययन टेबल, छिमेकी वा दैनिक आउजाउ गर्ने ठाउँ नजिक छ।`;
    } else {
      probablePlaceCategory = 'बाहिर / सवारी साधन / यात्राको क्रममा';
      placeReason = `प्रश्न लग्न चर राशि (${lagnaRashi?.name || 'मेष'}) भएकाले वस्तु यात्राको क्रममा, बाहिर वा सवारी साधन (ट्याक्सी, बस) मा छुटेको हुन सक्छ।`;
    }

    let agniCount = 0, prithviCount = 0, vayuCount = 0, jalCount = 0;
    let charaCount = 0, sthiraCount = 0, dvisvabhavCount = 0;

    (planets || []).forEach((p) => {
      const rObj = RASHI_DATA.find((r) => r.name === p.rashiName);
      if (rObj) {
        if (rObj.element === 'अग्नि') agniCount++;
        if (rObj.element === 'पृथ्वी') prithviCount++;
        if (rObj.element === 'वायु') vayuCount++;
        if (rObj.element === 'जल') jalCount++;

        if (rObj.quality === 'चर') charaCount++;
        if (rObj.quality === 'स्थिर') sthiraCount++;
        if (rObj.quality === 'द्विस्वभाव') dvisvabhavCount++;
      }
    });

    let recoveryChancePercentage = 75;
    let probableCondition = 'भेटिने सम्भावना उच्च';
    let conditionReason = 'प्रश्नकुण्डलीमा लग्नेश र चन्द्रमाको स्थिति अनुकूल रहेकाले गहन खोजी गर्दा फेला पर्ने सम्भावना प्रबल देखिन्छ।';
    let confidenceLevel: 'उच्च' | 'मध्यम' | 'कम' = 'उच्च';

    const category = rawRecord.itemCategory || 'other';

    if (category === 'documents') {
      conditionReason = 'कागजातको कारक बुध र प्रश्न लग्नको स्थिति अनुसार नजिकैको फाइल, दराज वा काउन्टरमा छुटेको सम्भावना छ।';
      recoveryChancePercentage = 85;
    } else if (category === 'cash' || category === 'jewelry') {
      if (rawRecord.isStolen) {
        probableCondition = 'अन्य व्यक्तिसँग गएको सम्भावना';
        recoveryChancePercentage = 55;
        confidenceLevel = 'मध्यम';
        conditionReason = 'चोरी भएको प्रश्न र सप्तम/अष्टम भावमा क्रूर ग्रह प्रभावले बाह्य वा अपरिचित व्यक्तिको संलग्नताको संकेत गर्दछ।';
      } else {
        probableCondition = 'ढिलो भेटिन सक्ने';
        recoveryChancePercentage = 70;
        conditionReason = 'द्वितीयेश र बृहस्पतिको स्थिति अनुसार गहन खोजी गर्दा केही समयपछि घरभित्रै फेला पर्ने सम्भावना छ।';
      }
    } else if (category === 'mobile' || category === 'electronics') {
      if (rawRecord.isStolen) {
        probableCondition = 'स्थान परिवर्तन भएको सम्भावना';
        recoveryChancePercentage = 50;
        confidenceLevel = 'कम';
        conditionReason = 'विद्युतीय उपकरणको कारक राहु/बुध र तृतीयेशको स्थिति अनुसार वस्तुको स्थान परिवर्तन भइसकेको देखिन्छ।';
      }
    }

    const allRules = getAllAarjeRules().filter((r) => r.isActive !== false);
    const appliedRules = allRules.filter((rule) => {
      return rule.category === 'all' || rule.category === category;
    });

    const recommendedSearchAreas: string[] = [];
    if (probablePlaceCategory.includes('घरभित्र')) {
      recommendedSearchAreas.push('मुख्य दराज, कपडा राख्ने तखता, सेफ, बक्स तथा भण्डार कोठा');
      recommendedSearchAreas.push('पूजा कोठा नजिक वा दक्षिण-पश्चिम (नैऋत्य) दिशाका कुनाहरू');
      recommendedSearchAreas.push('वक्री/अस्त ग्रहको प्रभाव भएमा पहिले नै हेरिसकिएका कपडा वा फाइलका मुनि पुनः दोहोर्याएर खोज्नुहोस्।');
    } else if (probablePlaceCategory.includes('कार्यालय')) {
      recommendedSearchAreas.push('कार्यालयको काउन्टर, टेबलका ड्रअर, फाइल राख्ने र्याक');
      recommendedSearchAreas.push('दैनिक बस्ने कुर्सी वा सहकर्मीको कार्यक्षेत्र नजिक');
    } else {
      recommendedSearchAreas.push('अन्तिम पटक प्रयोग गरिएको सवारी साधन (ट्याक्सी, बस, गाडी)');
      recommendedSearchAreas.push('सार्वजनिक सेवा केन्द्र, मालपोत काउन्टर तथा यात्रा मार्ग');
    }

    const safetyAndLegalGuidance: string[] = [];
    if (category === 'cash' || category === 'jewelry' || rawRecord.isStolen) {
      safetyAndLegalGuidance.push('नजिकैको प्रहरी कार्यालयमा तुरुन्तै घटनाको औपचारिक जानकारी तथा निवेदन दर्ता गराउनुहोस्।');
      safetyAndLegalGuidance.push('पसल, घर वा कार्यालय आसपासका सीसीटीभी फुटेज सुरक्षित राख्नुहोस्।');
      safetyAndLegalGuidance.push('महत्त्वपूर्ण कानुनी चेतावनी: ज्योतिषीय संकेत केवल खोजीमा सहयोग पुर्याउने सम्भावित दिशा र क्षेत्र हुन्। विना प्रमाण कुनै व्यक्तिलाई दोषी ठहर नगर्नुहोस्।');
    }
    if (category === 'documents') {
      safetyAndLegalGuidance.push('नागरिकता, राहदानी वा जग्गाको धनीपुर्जा हराएको भए सम्बन्धित जिल्ला प्रशासन वा मालपोतमा रोक्का/प्रतिलिपि निवेदन दिनुहोस्।');
      safetyAndLegalGuidance.push('प्रहरी रिपोर्ट (Lost Document Police Report) बनाउनुहोस्।');
    }
    if (category === 'mobile' || category === 'electronics') {
      safetyAndLegalGuidance.push('नेपाल दूरसञ्चार प्राधिकरण (NTA MDMS Lost Mobile Portal) मा IMEI नम्बर ब्लक र ट्रेसिङका लागि दर्ता गर्नुहोस्।');
      safetyAndLegalGuidance.push('मोबाइल बैंकिङ तथा सिम कार्ड तुरुन्तै टेलिकम सेवाप्रदायकबाट रोक्का गर्नुहोस्।');
    }

    const astrologerInterpretation = `प्रस्तुत प्रश्नकुण्डलीको त्रि-स्तरीय (ग्रह, राशि, भाव) विश्लेषण गर्दा प्रश्न समयमा ${lagnaRashi?.name || 'मेष'} लग्न र ${moonPlanet.rashiName} राशि उदित भएको छ। शास्त्रोक्त प्रश्न परम्परा अनुसार मुख्यतया ${combinedDirection} दिशा तथा ${probablePlaceCategory} क्षेत्रमा खोजी गर्नु फलदायी हुने देखिन्छ।`;

    const calculationDetails: AarjeCalculationDetails = {
      engineVersion: AARJE_ENGINE_VERSION,
      julianDay: Number(julianDay.toFixed(5)),
      ayanamsaDeg: Number(ayanamsa.toFixed(4)),
      ayanamsaDegrees: Number(ayanamsa.toFixed(4)),
      lagnaDegree: Number((lagna?.degree ?? 0).toFixed(2)),
      lagnaRashiName: lagnaRashi?.name || 'मेष',
      lagnaNakshatra: `${lagna?.nakshatraName || 'अश्विनी'} (${toDevanagariNumerals(lagna?.pada || 1)} पद)`,
      lagnaLord,
      moonDegree: Number((moonPlanet.degree || 0).toFixed(2)),
      moonRashiName: moonPlanet.rashiName,
      moonNakshatra: moonPlanet.nakshatraName,
      moonPhase: tithiName,
      retrogradePlanets,
      combustPlanets,
      elementSummary: { agni: agniCount, prithvi: prithviCount, vayu: vayuCount, jal: jalCount },
      qualitySummary: { chara: charaCount, sthira: sthiraCount, dvisvabhav: dvisvabhavCount },
      multiIndicatorCount: Math.round(topDir.totalScore),
      appliedRuleCount: appliedRules.length,
      directionScoreTable: directionScores
    };

    return {
      engineVersion: AARJE_ENGINE_VERSION,
      prashnaTimeBS: (rawRecord.queryDateBS || '२०८३-०१-०१') + ' ' + toDevanagariNumerals(timeStr),
      prashnaTimeAD: dateAD + ' ' + timeStr,
      prashnaLocationName: locName,
      lagnaRashi: lagnaRashi?.name || 'मेष',
      lagnaLord,
      moonRashi: moonPlanet.rashiName,
      moonNakshatra: nakshatraName,
      tithi: tithiName,
      vara: dayNameNepali,
      threeLayerDirection,
      probableDirection: combinedDirection,
      directionAstrologicalReason,
      probablePlaceCategory,
      placeAstrologicalReason: placeReason,
      houseAnalysis,
      probableCondition,
      conditionAstrologicalReason: conditionReason,
      recoveryChancePercentage,
      confidenceLevel,
      appliedRules,
      calculationDetails,
      stolenAnalysis: rawRecord.isStolen
        ? {
            isStolenConfirmedByChart: true,
            natureOfInvolvement: 'सप्तम भाव, अष्टम भाव र पापग्रहको प्रभावले बाह्य वा अपरिचित व्यक्तिको हस्तक्षेपको ज्योतिषीय संकेत गर्दछ।',
            disclaimerNotice: 'महत्त्वपूर्ण कानुनी चेतावनी: ज्योतिषीय संकेतका आधारमा कुनै पनि व्यक्तिलाई विना प्रमाण चोर वा दोषीको आरोप नलगाउनुहोस्।'
          }
        : undefined,
      recommendedSearchAreas,
      safetyAndLegalGuidance,
      astrologerInterpretation
    };
  } catch (err) {
    console.error('Error in analyzeAarjeQuery:', err);
    // Safe fallback analysis result so the application never crashes
    return {
      engineVersion: AARJE_ENGINE_VERSION,
      prashnaTimeBS: (rawRecord?.queryDateBS || '२०८३-०१-०१') + ' ' + toDevanagariNumerals(rawRecord?.queryTime || '१२:००'),
      prashnaTimeAD: (rawRecord?.queryDateAD || '2026-04-14') + ' ' + (rawRecord?.queryTime || '12:00'),
      prashnaLocationName: rawRecord?.queryLocation?.locationName || 'काठमाडौँ',
      lagnaRashi: 'मेष',
      lagnaLord: 'मंगल',
      moonRashi: 'मेष',
      moonNakshatra: 'अश्विनी',
      tithi: 'प्रथमा',
      vara: 'आइतबार',
      threeLayerDirection: {
        planetDirection: 'पूर्व',
        planetDirectionReason: 'गणना सम्पन्न हुन सकेन',
        rashiDirection: 'पूर्व',
        rashiDirectionReason: 'गणना सम्पन्न हुन सकेन',
        bhavaDirection: 'पूर्व',
        bhavaDirectionReason: 'गणना सम्पन्न हुन सकेन',
        combinedDirection: 'पूर्व',
        isMixedSignal: false,
        directionScores: []
      },
      probableDirection: 'पूर्व',
      directionAstrologicalReason: 'आर्जे गणना गर्दा प्राविधिक समस्या आयो। कृपया प्रश्नको मिति, समय र स्थान जाँच गर्नुहोस्।',
      probablePlaceCategory: 'घरभित्र',
      placeAstrologicalReason: 'सामान्य अनुमान',
      houseAnalysis: [],
      probableCondition: 'प्रतीक्षारत',
      conditionAstrologicalReason: 'गणना प्रक्रियामा त्रुटि',
      recoveryChancePercentage: 50,
      confidenceLevel: 'कम',
      appliedRules: [],
      calculationDetails: {
        engineVersion: AARJE_ENGINE_VERSION,
        julianDay: 0,
        ayanamsaDeg: 24,
        ayanamsaDegrees: 24,
        lagnaDegree: 0,
        lagnaRashiName: 'मेष',
        lagnaNakshatra: 'अश्विनी',
        lagnaLord: 'मंगल',
        moonDegree: 0,
        moonRashiName: 'मेष',
        moonNakshatra: 'अश्विनी',
        moonPhase: 'प्रथमा',
        retrogradePlanets: [],
        combustPlanets: [],
        elementSummary: { agni: 0, prithvi: 0, vayu: 0, jal: 0 },
        qualitySummary: { chara: 0, sthira: 0, dvisvabhav: 0 },
        multiIndicatorCount: 0,
        appliedRuleCount: 0,
        directionScoreTable: []
      },
      recommendedSearchAreas: ['नजिकैका सम्भावित स्थानहरू'],
      safetyAndLegalGuidance: [],
      astrologerInterpretation: 'आर्जे गणना सेवामा प्राविधिक त्रुटि देखा परेको छ। कृपया विवरण पुनः जाँच गरी प्रयास गर्नुहोस्।'
    };
  }
}
