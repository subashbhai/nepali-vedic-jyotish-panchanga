import { BirthDetails, LagnaInfo, PlanetPosition, PanchangaData } from '../types/astrology';
import { toDevanagariNumerals } from './nepaliCalendar';

export interface SanskriticAstrologyAnalysis {
  eventType: 'vivah' | 'bartabandha' | 'grihapravesh';
  eventTitleNepali: string;
  primaryShloka: string;
  secondaryShloka: string;
  tertiaryShloka?: string;
  
  // Favorable Age & Timing Analysis
  recommendedAgeRangeNepali: string;
  currentAgeNepali: string;
  ageAssessmentNepali: string;

  // Planetary & Dasha Reasoning
  grahaDashaAnalysisNepali: string;
  jupiterStrengthNepali: string; // गुरु बल
  venusStrengthNepali: string; // शुक्र बल
  sunStrengthNepali: string; // सूर्य बल
  
  // Recommended Muhurta Details
  favorableMonthsNepali: string[];
  favorableNakshatrasNepali: string[];
  favorableTithisNepali: string[];
  favorableLagnasNepali: string[];
  favorableDaysNepali: string[];
  
  // Astrologer Recommendation Summary
  overallRecommendationNepali: string;
}

/**
 * Calculates current age in years from BS date string (e.g. '2055-04-12' or '2055/04/12')
 */
export function calculateAgeFromBS(dateBS: string): number {
  if (!dateBS) return 25;
  const match = dateBS.match(/(\d{4})/);
  if (!match) return 25;
  const birthYear = parseInt(match[1], 10);
  const currentYearBS = 2083; // Current BS year context
  const age = currentYearBS - birthYear;
  return age > 0 && age < 110 ? age : 25;
}

/**
 * Generates Vedic Astrological & Sanskrit Analysis for Marriage (Vivah)
 */
export function analyzeVivahAstrology(
  profile: BirthDetails,
  lagna: LagnaInfo,
  planets: PlanetPosition[],
  panchanga: PanchangaData
): SanskriticAstrologyAnalysis {
  const age = calculateAgeFromBS(profile.dateBS);
  const ageDev = toDevanagariNumerals(age);
  const isMale = profile.gender === 'male';

  const jupiter = planets.find((p) => p.name === 'गुरु');
  const venus = planets.find((p) => p.name === 'शुक्र');
  const sun = planets.find((p) => p.name === 'सूर्य');
  const seventhLord = lagna.lord;

  // Age suitability assessment
  let ageRange = isMale ? '२१ देखि २८ वर्ष' : '१८ देखि २५ वर्ष';
  let ageAssessment = `जातकको वर्तमान उमेर ${ageDev} वर्ष रहेको छ। `;
  
  if (age >= 18 && age <= 32) {
    ageAssessment += `विवाह संस्कारका लागि वर्तमान उमेर शारीरिक, मानसिक र ज्योतिषीय दृष्टिले अत्यन्त उत्तम र परिपक्व उमेर मानिन्छ।`;
  } else if (age < 18) {
    ageAssessment += `विवाहका लागि आगामी उमेर २१ वर्ष (पुरुष) / १८ वर्ष (महिला) पश्चात् गुरु र शुक्रको शुभ गोचरमा मुहूर्त जुराउनु उपयुक्त हुनेछ।`;
  } else {
    ageAssessment += `विवाहका लागि शुभ गुरु बल र शुक्र गोचर विचार गरी शीघ्र शुभ मुहूर्तमा गृहस्थ आश्रम प्रवेश गर्नु शुभप्रद रहनेछ।`;
  }

  const dashaText = `विंशोत्तरी महादशा चक्र अनुसार जातकको ७औँ भाव (दाम्पत्य सुख), सप्तमेश (${seventhLord}), गुरु तथा शुक्रको शुभ दशा र गोचर अनुकूल हुँदा विवाहका लागि प्रसस्त योग बन्दछ।`;

  const jupiterText = jupiter
    ? `चन्द्र राशि (${panchanga.moonRashi}) बाट गुरुको गोचर २, ५, ७, ९, ११ औँ स्थानमा रहँदा गुरु बल अति उत्तम भई विवाह सिद्ध हुन्छ।`
    : 'गुरु बलवान् स्थितिमा रहेको छ।';

  const venusText = venus
    ? `शुक्र ग्रह स्वक्षेत्र/उच्चराशि वा १, ५, ७, ९ भावमा स्थित हुँदा वैवाहिक सुख, प्रेम र पारिवारिक समृद्धि वृद्धि हुन्छ।`
    : 'शुक्र शुभ स्थितिमा छ।';

  const sunText = sun
    ? `सूर्यको अनुकूल गोचर (३, ६, १०, ११ भाव) ले दाम्पत्य जीवनमा प्रतिष्ठा र कार्यसिद्धि प्रदान गर्दछ।`
    : 'सूर्य अनुकूल छ।';

  return {
    eventType: 'vivah',
    eventTitleNepali: 'शुभ-विवाह संस्कार मुहूर्त तथा ज्योतिषीय विचार पत्रम्',
    primaryShloka: 'ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
    secondaryShloka: 'मङ्गलम् भगवान् विष्णुः मङ्गलम् गरुडध्वजः। मङ्गलम् पुण्डरीकाक्षः मङ्गलाय तनो हरिः॥',
    tertiaryShloka: 'कन्यां वरयते रूपं माता वित्तं पिता श्रुतम्। बान्धवाः कुलमिच्छन्ति मिष्टान्नमितरे जनाः॥',
    
    recommendedAgeRangeNepali: ageRange,
    currentAgeNepali: `${ageDev} वर्ष`,
    ageAssessmentNepali: ageAssessment,
    
    grahaDashaAnalysisNepali: dashaText,
    jupiterStrengthNepali: jupiterText,
    venusStrengthNepali: venusText,
    sunStrengthNepali: sunText,

    favorableMonthsNepali: ['मार्गशीर्ष (मंसिर)', 'माघ', 'फागुन', 'वैशाख', 'ज्येष्ठ', 'असार (प्रथमार्ध)'],
    favorableNakshatrasNepali: ['रोहिणी', 'मृगशिरा', 'मघा', 'उत्तराफाल्गुनी', 'हस्त', 'स्वाती', 'अनुराधा', 'मूल', 'उत्तराषाढा', 'उत्तराभाद्रपद', 'रेवती'],
    favorableTithisNepali: ['द्वितीया', 'तृतीया', 'पञ्चमी', 'सप्तमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी'],
    favorableLagnasNepali: ['मिथुन', 'कन्या', 'तुला', 'धनु', 'मीन (शुभ ग्रह दृष्ट)'],
    favorableDaysNepali: ['सोमवार', 'बुधवार', 'गुरुवार', 'शुक्रवार'],

    overallRecommendationNepali: `जातकको जन्मकुण्डलीमा लग्न ${lagna.rashiName}, चन्द्र राशि ${panchanga.moonRashi} तथा नक्षत्र ${panchanga.nakshatra.name} रहेको छ। ग्रह दशा, गुरु बल र शुक्र शुद्धिको विचार गर्दा आगामी शुभ महिनाहरूमा विवाहको लग्न तथा मुहूर्त तय गर्नु सर्वथा कल्याणकारी हुनेछ।`,
  };
}

/**
 * Generates Vedic Astrological & Sanskrit Analysis for Bartabandha / Upanayan
 */
export function analyzeBartabandhaAstrology(
  profile: BirthDetails,
  lagna: LagnaInfo,
  planets: PlanetPosition[],
  panchanga: PanchangaData
): SanskriticAstrologyAnalysis {
  const age = calculateAgeFromBS(profile.dateBS);
  const ageDev = toDevanagariNumerals(age);

  const sun = planets.find((p) => p.name === 'सूर्य');
  const jupiter = planets.find((p) => p.name === 'गुरु');

  const ageRange = '८औँ, ११औँ, १३औँ वा १५औँ वर्ष (शास्त्रोक्त उपनयन उमेर)';
  let ageAssessment = `जातकको वर्तमान उमेर ${ageDev} वर्ष रहेको छ। `;

  if (age >= 7 && age <= 16) {
    ageAssessment += `शास्त्र अनुसार ८ देखि १६ वर्षको उमेर व्रतबन्ध (उपनयन) संस्कारका लागि सर्वोत्कृष्ट र गायत्री मन्त्र ग्रहण गर्ने अति उपयुक्त उमेर हो।`;
  } else if (age < 7) {
    ageAssessment += `व्रतबन्धका लागि ८औँ वर्ष प्रवेश पश्चात् गुरु र सूर्य बल विचार गरी उपनयन संस्कार गर्नु शास्त्रसम्मत हुनेछ।`;
  } else {
    ageAssessment += `उपनयन संस्कारका लागि तत्काल शुभ उत्तरायण सूर्य र गुरु शुद्धिको समयमा व्रतबन्ध अनुष्ठान सम्पन्न गर्नु फलदायी हुनेछ।`;
  }

  const dashaText = `जातकको ५औँ भाव (विद्या/ज्ञान), ९औँ भाव (धर्म/संस्कार), सूर्य (तेज) तथा गुरु (विवेक) को विंशोत्तरी दशा र गोचर विचार गर्दा उपनयन संस्कार अति फलदायी देखिन्छ।`;

  return {
    eventType: 'bartabandha',
    eventTitleNepali: 'उपनयन (व्रतबन्ध) संस्कार शुभ मुहूर्त तथा ज्योतिष विचार पत्रम्',
    primaryShloka: 'ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
    secondaryShloka: 'गायत्री छन्दसां माता ब्रह्मज्ञानप्रदायिनी। उपनीतो भवेद्द्विजः सर्वशास्त्रविशारदः॥',
    tertiaryShloka: 'मातृमान् पितृमानाचार्यवान् पुरुषो वेद। उपनयनेन द्विजातिः जायते॥',

    recommendedAgeRangeNepali: ageRange,
    currentAgeNepali: `${ageDev} वर्ष`,
    ageAssessmentNepali: ageAssessment,

    grahaDashaAnalysisNepali: dashaText,
    jupiterStrengthNepali: jupiter ? 'गुरु बलवान् भई ज्ञान र वैदिक संस्कार सिद्धि गर्दछ।' : 'गुरु अनुकूल छ।',
    venusStrengthNepali: 'शुक्रको शुभ दृष्टिले संस्कार कार्यमा शोभा प्रदान गर्दछ।',
    sunStrengthNepali: sun ? 'सूर्य उत्तरायण भई आत्मतेज र गायत्री सिद्धि प्रदान गर्दछ।' : 'सूर्य बलवान् छ।',

    favorableMonthsNepali: ['माघ (उत्तरायण)', 'फागुन', 'चैत्र (प्रथमार्ध)', 'वैशाख', 'ज्येष्ठ'],
    favorableNakshatrasNepali: ['अश्विनी', 'पुनर्वसु', 'पुष्य', 'हस्त', 'चित्रा', 'स्वाती', 'श्रवण', 'घनिष्ठा', 'शतभिषा'],
    favorableTithisNepali: ['द्वितीया', 'तृतीया', 'पञ्चमी', 'सप्तमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी (शुक्ल पक्ष)'],
    favorableLagnasNepali: ['मेष', 'मिथुन', 'सिंह', 'कन्या', 'धनु', 'मीन'],
    favorableDaysNepali: ['आइतवार (सूर्य बल)', 'बुधवार', 'गुरुवार (गुरु बल)', 'शुक्रवार'],

    overallRecommendationNepali: `जातकको नक्षत्र ${panchanga.nakshatra.name} र चन्द्र राशि ${panchanga.moonRashi} अनुसार सूर्यको उत्तरायण काल तथा गुरु बल विचार गरी वैदिक विधिपूर्वक यज्ञोपवीत तथा गायत्री मन्त्र उपदेश ग्रहण गर्नु अत्यन्त मंगलकारी हुनेछ।`,
  };
}

/**
 * Generates Vedic Astrological & Sanskrit Analysis for Griha Pravesh
 */
export function analyzeGrihaPraveshAstrology(
  profile: BirthDetails,
  lagna: LagnaInfo,
  planets: PlanetPosition[],
  panchanga: PanchangaData
): SanskriticAstrologyAnalysis {
  const age = calculateAgeFromBS(profile.dateBS);
  const ageDev = toDevanagariNumerals(age);

  const dashaText = `जातकको कुण्डलीमा चतुर्थ भाव (गृह सुख, वास्तु), चतुर्थेश, शनि (स्थिर सम्पत्ति), शुक्र (सौन्दर्य/वैभव) र वास्तुपुरुषको अनुकूल दशा-अन्तरदशा तथा गोचर कालमा गृह प्रवेशको शुभ योग बन्दछ।`;

  return {
    eventType: 'grihapravesh',
    eventTitleNepali: 'वास्तु पूजन तथा नूतन गृहप्रवेश शुभ मुहूर्त प्रतिवेदन पत्रम्',
    primaryShloka: 'ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
    secondaryShloka: 'गृहप्रवेशः शुभदो नॄणां सर्वसम्पत्प्रदायकः। वास्तुदेव नमस्तुभ्यं गृहेऽस्मिन् वस सर्वदा॥',
    tertiaryShloka: 'अन्नपूर्णे सदा पूर्णे शङ्करप्राणवल्लभे। ज्ञानवैराग्यसिद्ध्यर्थं भिक्षां देहि च पार्वति॥',

    recommendedAgeRangeNepali: 'चतुर्थेश तथा शनि/शुक्रको शुभ दशा-अन्तरदशा काल',
    currentAgeNepali: `${ageDev} वर्ष`,
    ageAssessmentNepali: `जातकको वर्तमान उमेर ${ageDev} वर्षको उमेरमा आफ्नै वा परिवारको नूतन गृह प्रवेश अनुष्ठानका लागि गृहपति/गृहस्वामिनीको रूपमा गृह प्रवेश योग अति अनुकूल छ।`,

    grahaDashaAnalysisNepali: dashaText,
    jupiterStrengthNepali: 'गुरुको शुभ दृष्टिले नयाँ घरमा सुख, शान्ति र समृद्धि वास गराउँछ।',
    venusStrengthNepali: 'शुक्रको प्रभावले गृहमा लक्ष्मी प्राप्ति र पारिवारिक सौहार्दता वृद्धि गर्दछ।',
    sunStrengthNepali: 'सूर्यको उत्तरायण स्थितिले गृह प्रवेश कार्यमा ऊर्जा, आरोग्यता र यश प्रदान गर्दछ।',

    favorableMonthsNepali: ['माघ (उत्तरायण)', 'फागुन', 'वैशाख', 'ज्येष्ठ'],
    favorableNakshatrasNepali: ['रोहिणी', 'मृगशिरा', 'उत्तराफाल्गुनी', 'हस्त', 'चित्रा', 'अनुराधा', 'उत्तराषाढा', 'उत्तराभाद्रपद'],
    favorableTithisNepali: ['द्वितीया', 'तृतीया', 'पञ्चमी', 'सप्तमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी (शुक्ल पक्ष)'],
    favorableLagnasNepali: ['वृष (स्थिर लग्न)', 'सिंह (स्थिर लग्न)', 'वृश्चिक (स्थिर लग्न)', 'कुम्भ (स्थिर लग्न)'],
    favorableDaysNepali: ['सोमवार', 'बुधवार', 'गुरुवार', 'शुक्रवार'],

    overallRecommendationNepali: `जातकको लग्न ${lagna.rashiName} र चन्द्र राशि ${panchanga.moonRashi} अनुसार स्थिर लग्न (वृष, सिंह, वृश्चिक, कुम्भ) मा वास्तु पुरुष पूजा, कलश यात्रा र द्वार पूजा गरी गृहप्रवेश गर्दा निरन्तर धन-धान्य र वंश वृद्धि हुनेछ।`,
  };
}
