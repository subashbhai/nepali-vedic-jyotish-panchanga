import { LagnaInfo, PlanetPosition, VimshottariDashaResult } from '../types/astrology';
import { toDevanagariNumerals } from './nepaliCalendar';

export interface AfflictedPlanetAnalysis {
  planetName: string;
  englishName: string;
  rashiName: string;
  houseNumber: number;
  dignity: string;
  isCombust: boolean;
  isRetrograde: boolean;
  afflictionReasons: string[];
  severity: 'उच्च' | 'मध्यम' | 'सामान्य';
  severityColor: string;
  problemAreasNepali: string[];
  unfavorableYearsAge: {
    naturalAgeYears: number[];
    specificAgeDescription: string;
    dashaPeriodsDescription: string;
    criticalYearsList: number[];
  };
  remedies: {
    mantra: string;
    japCount: string;
    daanItems: string;
    daanDay: string;
    vrataRule: string;
    pujaPath: string;
    gemstoneGuidance: string; // Alert on whether to wear or avoid!
    rudrakshaSuggestion: string;
    practicalAdvice: string;
  };
}

export interface ComprehensiveUnfavorablePeriodsReport {
  afflictedPlanets: AfflictedPlanetAnalysis[];
  allPlanetsStrengthSummary: Array<{
    planetName: string;
    status: 'शुभ/सबल' | 'मध्यम' | 'कमजोर/अशुभ';
    primaryReason: string;
  }>;
  criticalLifeYears: Array<{
    ageYear: number;
    approxCalendarYearBS: number;
    governingPlanet: string;
    riskCategory: 'स्वास्थ्य' | 'आर्थिक' | 'मानसिक/पारिवारिक' | 'शिक्षा/कर्म' | 'चोटपटक/दुर्घटना';
    counselingNote: string;
    recommendedProtection: string;
  }>;
  generalShantiRecommendations: string[];
}

/**
 * Classical natural ages of planets (नैसर्गिक ग्रह आयु वर्ष)
 */
const PLANET_NATURAL_AGES: Record<string, number[]> = {
  'सूर्य': [22, 44],
  'चन्द्र': [24, 48],
  'मंगल': [28, 56],
  'बुध': [32, 64],
  'गुरु': [16, 32, 60],
  'शुक्र': [25, 50],
  'शनि': [36, 72],
  'राहु': [42, 45],
  'केतु': [48, 52],
};

/**
 * Evaluates whether a planet is considered afflicted, malefic or weak in the birth chart
 */
export function analyzeAfflictedPlanetsAndUnfavorableYears(
  lagna: LagnaInfo,
  planets: PlanetPosition[],
  dashaResult?: VimshottariDashaResult,
  birthYearBS: number = 2081
): ComprehensiveUnfavorablePeriodsReport {
  const lagnaRashiId = lagna?.rashiId || 1;
  const afflictedList: AfflictedPlanetAnalysis[] = [];
  const allPlanetsSummary: ComprehensiveUnfavorablePeriodsReport['allPlanetsStrengthSummary'] = [];

  // Maraka houses: 2nd and 7th lords
  const secondHouseRashiId = ((lagnaRashiId) % 12) + 1;
  const seventhHouseRashiId = ((lagnaRashiId + 5) % 12) + 1;

  const rashiLordMap: Record<number, string> = {
    1: 'मंगल', 2: 'शुक्र', 3: 'बुध', 4: 'चन्द्र', 5: 'सूर्य', 6: 'बुध',
    7: 'शुक्र', 8: 'मंगल', 9: 'गुरु', 10: 'शनि', 11: 'शनि', 12: 'गुरु'
  };

  const marakaLords = [rashiLordMap[secondHouseRashiId], rashiLordMap[seventhHouseRashiId]];

  // Detect Sun position for combustion verification
  const sun = planets.find((p) => p.name === 'सूर्य');

  // Debilitation signs
  const debilitationMap: Record<string, number> = {
    'सूर्य': 7, // Libra
    'चन्द्र': 8, // Scorpio
    'मंगल': 4, // Cancer
    'बुध': 12, // Pisces
    'गुरु': 10, // Capricorn
    'शुक्र': 6, // Virgo
    'शनि': 1, // Aries
    'राहु': 9, // Sagittarius / Scorpio
    'केतु': 3, // Gemini / Taurus
  };

  planets.forEach((p) => {
    const reasons: string[] = [];
    const problems: string[] = [];

    // 1. Debilitation (नीच)
    const debRashi = debilitationMap[p.name];
    const isDebilitated = p.rashiId === debRashi || p.dignity === 'नीच';
    if (isDebilitated) {
      reasons.push(`नीच राशि (${p.rashiName}) मा अवस्थित`);
    }

    // 2. Combustion (अस्त)
    let isCombust = p.isCombust;
    if (!isCombust && sun && p.name !== 'सूर्य' && p.name !== 'राहु' && p.name !== 'केतु') {
      const sunDeg = sun.longitude || (sun.rashiId - 1) * 30 + sun.degree;
      const planetDeg = p.longitude || (p.rashiId - 1) * 30 + p.degree;
      const diff = Math.abs(sunDeg - planetDeg);
      const minDiff = Math.min(diff, 360 - diff);
      if (minDiff < 10) isCombust = true;
    }
    if (isCombust) {
      reasons.push('सूर्यको अति निकट भई अस्त (Combust) अवस्था');
    }

    // 3. Dusthana placement (६, ८, १२ भावमा)
    const isDusthana = [6, 8, 12].includes(p.bhava);
    if (isDusthana) {
      if (p.name === 'राहु' || p.name === 'केतु' || p.name === 'शनि' || p.name === 'मंगल') {
        reasons.push(`${toDevanagariNumerals(p.bhava)} औँ त्रिक (कष्ट) भावमा पापी ग्रह स्थिति`);
      } else {
        reasons.push(`${toDevanagariNumerals(p.bhava)} औँ त्रिक (दुष्टाना) भावमा शुभ ग्रह कमजोर स्थिति`);
      }
    }

    // 4. Maraka Lordship
    const isMaraka = marakaLords.includes(p.name);
    if (isMaraka && (isDebilitated || isCombust || isDusthana)) {
      reasons.push('द्वितीय वा सप्तम भावको मारकेश ग्रह भई पीडित');
    }

    // 5. Conjunction with natural malefics
    const conjoinedWithRahu = planets.some((other) => other.name === 'राहु' && other.bhava === p.bhava && other.id !== p.id);
    const conjoinedWithKetu = planets.some((other) => other.name === 'केतु' && other.bhava === p.bhava && other.id !== p.id);
    const conjoinedWithSaturn = planets.some((other) => other.name === 'शनि' && other.bhava === p.bhava && other.id !== p.id);

    if (p.name === 'सूर्य' && (conjoinedWithRahu || conjoinedWithKetu)) {
      reasons.push('राहु/केतुसँग युति भई सूर्य ग्रहण दोष कारक');
    }
    if (p.name === 'चन्द्र' && (conjoinedWithRahu || conjoinedWithKetu)) {
      reasons.push('राहु/केतुसँग युति भई चन्द्र ग्रहण/विष दोष');
    }
    if (p.name === 'गुरु' && conjoinedWithRahu) {
      reasons.push('राहुसँग युति भई गुरु चाण्डाल दोष');
    }
    if (p.name === 'चन्द्र' && conjoinedWithSaturn) {
      reasons.push('शनिसँग युति भई विष योग (मानसिक चिन्ता)');
    }

    // Specific problem areas based on planet and affliction
    if (p.name === 'सूर्य') {
      problems.push('आत्मबलमा कमी वा अत्यधिक अहम्', 'पितासँगको वैचारिक मतभेद वा पिताको स्वास्थ्य चिन्ता', 'आँखा, हड्डी, टाउको वा मुटुसम्बन्धी समस्या', 'सरकारी वा प्रशासनिक काममा बिलम्ब');
    } else if (p.name === 'चन्द्र') {
      problems.push('मानसिक अस्थिरता, चञ्चलता, अनिद्रा वा तनाव', 'माताको स्वास्थ्य वा मातासँग वैचारिक दूरी', 'पानी, चिसो, कफ वा फोक्सोसम्बन्धी समस्या', 'निर्णय क्षमतामा बारम्बार द्विविधा');
    } else if (p.name === 'मंगल') {
      problems.push('आवेश, रिस, हतारमा निर्णय लिँदा नोक्सानी', 'रक्तदोष, चोटपटक, शल्यक्रिया वा आगो/सवारीबाट जोखिम', 'दाजुभाइ वा मित्रसँग विवाद', 'जग्गा जमिन वा सम्पत्तिसम्बन्धी विवाद');
    } else if (p.name === 'बुध') {
      problems.push('नर्भसनेस, द्विधाग्रस्त विचार, अध्ययनमा एकाग्रता कमी', 'सञ्चार, भाषण वा कागजातमा त्रुटि', 'व्यापारमा अचानक आर्थिक उतारचढाव', 'छाला, एलर्जी वा नसासम्बन्धी कमजोरी');
    } else if (p.name === 'गुरु') {
      problems.push('ज्ञान, शिक्षा वा धार्मिक मार्गदर्शनमा अवरोध', 'सन्तान सुखमा बिलम्ब वा सन्तान सम्बन्धी चिन्ता', 'कलेजो, मोटोपन वा पाचन सम्बन्धी स्वास्थ्य चासो', 'भाग्यमा केही ढिलाइ वा गुरुजनसँग असन्तुष्टि');
    } else if (p.name === 'शुक्र') {
      problems.push('वैवाहिक सम्बन्ध वा प्रेम जीवनमा खटपट/अवरोध', 'विलासिता वा फजुल खर्चले गर्दा आर्थिक तनाव', 'गुप्ताङ्ग, मिर्गौला, हर्मोन वा आँखाको समस्या', 'साझेदारी व्यापारमा विश्वासघातको जोखिम');
    } else if (p.name === 'शनि') {
      problems.push('कार्यक्षेत्रमा अधिक श्रम तर ढिलो प्रतिफल', 'जोर्नी, नसा, हड्डी, बाथरोग वा ग्यास्ट्रिक समस्या', 'दीर्घकालीन चिन्ता, निराशा वा एक्लोपनको भावना', 'अधीनस्थ कर्मचारी वा कामदारबाट असन्तुष्टि');
    } else if (p.name === 'राहु') {
      problems.push('अचानक अप्रत्याशित संकट, भ्रम वा गलत सङ्गत', 'आर्थिक धोखा, अनलाइन ठगी वा व्यर्थको दौडधुप', 'अपरिचित रोग वा मानसिक शंका/त्रास', 'पारिवारिक सुखमा अचानक उथलपुथल');
    } else if (p.name === 'केतु') {
      problems.push('अचानक चोटपटक, फोका, एलर्जी वा गुप्त पीडा', 'वैराग्य वा सांसारिक कामप्रति विरक्ति', 'पारिवारिक सम्बन्धमा विच्छेद वा अलगाव', 'विश्वासपात्रबाट घात वा आध्यात्मिक द्विविधा');
    }

    // Determine severity
    const isMajor = isDebilitated || (isCombust && isDusthana) || (p.name === 'सूर्य' && conjoinedWithRahu) || (p.name === 'चन्द्र' && (conjoinedWithRahu || conjoinedWithSaturn));
    const isMedium = reasons.length >= 1;

    let severity: 'उच्च' | 'मध्यम' | 'सामान्य' = 'सामान्य';
    let severityColor = 'text-amber-800 bg-amber-50 border-amber-300';
    if (isMajor) {
      severity = 'उच्च';
      severityColor = 'text-red-700 bg-red-50 border-red-300 font-bold';
    } else if (isMedium) {
      severity = 'मध्यम';
      severityColor = 'text-orange-800 bg-orange-50 border-orange-300';
    }

    // Compile Summary
    if (reasons.length > 0) {
      allPlanetsSummary.push({
        planetName: p.name,
        status: isMajor ? 'कमजोर/अशुभ' : 'मध्यम',
        primaryReason: reasons.join('; '),
      });
    } else {
      allPlanetsSummary.push({
        planetName: p.name,
        status: 'शुभ/सबल',
        primaryReason: `${p.rashiName} राशिमा अनुकूल स्थिति`,
      });
    }

    // If afflicted, build complete analysis object
    if (reasons.length > 0) {
      const naturalAges = PLANET_NATURAL_AGES[p.name] || [28, 42];

      // Dasha text computation
      let dashaNote = `${p.name} महादशा तथा अन्तर्दशा कालखण्ड`;
      if (dashaResult) {
        const md = dashaResult.mahadashas.find((m) => m.planet === p.name);
        if (md) {
          dashaNote = `${md.planet} महादशा (${toDevanagariNumerals(md.startDate)} देखि ${toDevanagariNumerals(md.endDate)} सम्म)`;
        }
      }

      // Remedies configuration
      const remedies = getDetailedRemediesForPlanet(p.name, isDebilitated, isCombust, isDusthana);

      afflictedList.push({
        planetName: p.name,
        englishName: p.englishName,
        rashiName: p.rashiName,
        houseNumber: p.bhava,
        dignity: p.dignity,
        isCombust: isCombust || false,
        isRetrograde: p.isRetrograde || false,
        afflictionReasons: reasons,
        severity,
        severityColor,
        problemAreasNepali: problems,
        unfavorableYearsAge: {
          naturalAgeYears: naturalAges,
          specificAgeDescription: `उमेर ${naturalAges.map((a) => toDevanagariNumerals(a)).join(', ')} औँ वर्षमा यो ग्रहको विशेष प्रभाव रहने हुँदा सतर्क रहनुहोला।`,
          dashaPeriodsDescription: dashaNote,
          criticalYearsList: naturalAges,
        },
        remedies,
      });
    }
  });

  // Calculate Critical Life Years list based on Lagna & Moon
  const criticalYears = calculateCriticalLifeYears(lagnaRashiId, afflictedList, birthYearBS);

  return {
    afflictedPlanets: afflictedList,
    allPlanetsStrengthSummary: allPlanetsSummary,
    criticalLifeYears: criticalYears,
    generalShantiRecommendations: [
      'नित्य बिहान सूर्यलाई तामाको पात्रबाट अर्घ्य दिने र गायत्री मन्त्रको जप गर्ने।',
      'प्रत्येक सोमबार भगवान् शिवजीको पञ्चामृत वा शुद्ध जलले अभिषेक गरी महामृत्युञ्जय मन्त्र पाठ गर्ने।',
      'आफ्नो कुलदेवता तथा पितृहरूको नियमित स्मरण, पूजा र वर्षमा एकपटक कुलपूजा सम्पन्न गर्ने।',
      'अशुभ वा नीच ग्रहको दशा चलेको समयमा त्यस ग्रहको रत्न नलगाउने, बरु सोही ग्रहको बारमा तोकिएको वस्तु दान र मन्त्र जप गर्ने।',
      'शनिवार वा मंगलवार असहाय, वृद्ध वा भोका प्राणीहरूलाई भोजन गराउनु सर्वग्रह शान्तिकारी हुन्छ।'
    ],
  };
}

/**
 * Returns specific remedies for each planet based on affliction rules
 */
function getDetailedRemediesForPlanet(
  planetName: string,
  isDebilitated: boolean,
  isCombust: boolean,
  isDusthana: boolean
) {
  switch (planetName) {
    case 'सूर्य':
      return {
        mantra: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः (वा "ॐ घृणि सूर्याय नमः")',
        japCount: '७,००० पटक (सूर्योदयको समयमा पूर्व फर्किएर)',
        daanItems: 'गहुँ, रातो चन्दन, तामाको भाँडो, गुड (सख्खर), रातो कपडा, केसर',
        daanDay: 'आइतबार बिहान (कुनै योग्य ब्राह्मण वा मन्दिरमा)',
        vrataRule: 'आइतबार नुन बार्ने (अलिनो भोजन गर्ने) र आदित्यहृदय स्तोत्र पाठ गर्ने।',
        pujaPath: 'दैनिक आदित्य हृदय स्तोत्र पाठ एवं सूर्य नमस्कार।',
        gemstoneGuidance: isDebilitated || isDusthana
          ? '⚠️ ध्यान दिनुहोस्: सूर्य नीच वा त्रिक भावमा भएकाले माणिक्य (Ruby) रत्न नलगाउनुहोला! केवल मन्त्र जप र दानबाटै शान्ति गर्नुहोस्।'
          : 'सूर्य मन्त्र जप र तामाको पात्रबाट जल अर्पण सर्वोत्तम रहनेछ।',
        rudrakshaSuggestion: '१ मुखी वा १२ मुखी रुद्राक्ष रातो धागोमा आइतबार धारण गर्ने।',
        practicalAdvice: 'पिता तथा अग्रजको नित्य चरण स्पर्श गरी आशीर्वाद लिने, अहङ्कार त्याग गर्ने।',
      };
    case 'चन्द्र':
      return {
        mantra: 'ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः (वा "ॐ सोमाय नमः")',
        japCount: '११,००० पटक (साँझ वा रात्रिकालमा सेतो आसनमा)',
        daanItems: 'चामल, दूध, दही, मिश्री, चाँदी, सेतो कपडा, शंख, कर्पूर',
        daanDay: 'सोमबार साँझ (कन्या वा ब्राह्मणलाई)',
        vrataRule: 'सोमबार पूर्णिमा व्रत बस्ने, दूध वा फलफूलको फलाहार गर्ने।',
        pujaPath: 'भगवान् शिवजीको पञ्चामृत अभिषेक र चन्द्र कवच पाठ।',
        gemstoneGuidance: isDebilitated || isDusthana
          ? '⚠️ ध्यान दिनुहोस्: चन्द्रमा नीच (वृश्चिक) वा त्रिक भावमा रहेकाले मोती रत्न कदापि नलगाउनुहोला! शिव उपासना र दूध-चामल दान गर्नुहोस्।'
          : 'सोमबार शिव मन्दिरमा जल चढाई चाँदीको औंठीमा मोती लगाउन सकिन्छ।',
        rudrakshaSuggestion: '२ मुखी रुद्राक्ष सेतो धागोमा सोमबार धारण गर्ने।',
        practicalAdvice: 'माताको सधैं सम्मान र सेवा गर्ने, चिसो पानी तथा रात्रिकालीन चञ्चलताबाट बच्ने।',
      };
    case 'मंगल':
      return {
        mantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः (वा "ॐ अं अङ्गारकाय नमः")',
        japCount: '१०,००० पटक (मंगलबार दिउँसो रातो आसनमा)',
        daanItems: 'रातो मुसुरोको दाल, तामा, रातो चन्दन, गुड, गहुँ, रातो बस्त्र',
        daanDay: 'मंगलबार मध्याह्नमा',
        vrataRule: 'मंगलबार व्रत बसी हनुमानजीको दर्शन गर्ने र हनुमान चालीसा ७ पटक पाठ गर्ने।',
        pujaPath: 'हनुमान अष्टक, सुन्दरकाण्ड पाठ वा रुद्राभिषेक।',
        gemstoneGuidance: isDebilitated || isDusthana
          ? '⚠️ ध्यान दिनुहोस्: मङ्गल नीच (कर्कट) वा त्रिक भावमा हुँदा मूँगा (Coral) लगाउँदा रिस र दुर्घटना बढ्न सक्छ, त्यसैले नलगाउनुहोस्! हनुमानजीको सेवा गर्नुहोस्।'
          : 'मङ्गल अनुकूल भएमा मात्र तामा वा सुनमा मूँगा धारण गर्नुहोला।',
        rudrakshaSuggestion: '३ मुखी रुद्राक्ष रातो धागोमा मंगलबार धारण गर्ने।',
        practicalAdvice: 'आवेश र क्रोध नियन्त्रण गर्ने, सवारी साधन चलाउँदा संयम अपनाउने, भाइबहिनीलाई सहयोग गर्ने।',
      };
    case 'बुध':
      return {
        mantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः (वा "ॐ बुं बुधाय नमः")',
        japCount: '९,००० पटक (बुधबार बिहान हरियो आसनमा)',
        daanItems: 'हरियो मुँग दाल, काँसको भाँडो, हरियो कपडा, हरियो सागपात, पुस्तक/कलम',
        daanDay: 'बुधबार बिहान (विद्यार्थी वा भाञ्जा-भाञ्जीलाई)',
        vrataRule: 'बुधबार व्रत बस्ने र गणेशजीलाई २१ मुठा दुबो चढाउने।',
        pujaPath: 'गणेश अथर्वशीर्ष पाठ तथा विष्णु सहस्रनाम स्तोत्र।',
        gemstoneGuidance: isDebilitated || isDusthana
          ? '⚠️ ध्यान दिनुहोस्: बुध नीच (मीन) वा त्रिक भावमा भएमा पन्ना (Emerald) रत्न नलगाउनुहोला! गणेशजीको आराधना र हरियो मुँग दान नै उत्तम छ।'
          : 'गणेशजीको उपासनापछि कान्छी औंलामा पन्ना धारण गर्न सकिन्छ।',
        rudrakshaSuggestion: '४ मुखी रुद्राक्ष हरियो धागोमा बुधबार धारण गर्ने।',
        practicalAdvice: 'बोली र कागजातमा होसियारी राख्ने, आफ्नी दिदीबहिनी वा सानी नानीहरूलाई आदर र उपहार दिने।',
      };
    case 'गुरु':
      return {
        mantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः (वा "ॐ बृं बृहस्पतये नमः")',
        japCount: '१९,००० पटक (बिहीबार बिहान पहेँलो आसनमा)',
        daanItems: 'चनाको दाल, बेसार, पहेँलो कपडा, सुन, पहेँलो फल (केरा), घ्यू, धार्मिक पुस्तक',
        daanDay: 'बिहीबार बिहान (गुरुजन, मन्दिरका पुजारी वा वृद्धलाई)',
        vrataRule: 'बिहीबार व्रत बस्ने, पहेँलो भोजन गर्ने र केराको बोटमा जल चढाउने।',
        pujaPath: 'श्रीमद्भगवद्गीता पाठ, गुरु स्तोत्र वा विष्णु सहस्रनाम।',
        gemstoneGuidance: isDebilitated || isDusthana
          ? '⚠️ ध्यान दिनुहोस्: गुरु नीच (मकर) वा त्रिक भावमा रहँदा पहेंलो पुखराज (Yellow Sapphire) नलगाउनुहोस्! बरु विष्णु सहस्रनाम पाठ र चनाको दाल दान गर्नुहोस्।'
          : 'गुरु बलवान् भएमा सुनको औंठीमा पुखराज तर्जनी औंलामा लगाउन सकिन्छ।',
        rudrakshaSuggestion: '५ मुखी रुद्राक्ष पहेँलो धागोमा बिहीबार धारण गर्ने।',
        practicalAdvice: 'गुरुजन, शिक्षक र ब्राह्मणको अपमान कहिल्यै नगर्ने, धर्मग्रन्थको आदर गर्ने।',
      };
    case 'शुक्र':
      return {
        mantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः (वा "ॐ शुं शुक्राय नमः")',
        japCount: '१६,००० पटक (शुक्रबार साँझ सेतो आसनमा)',
        daanItems: 'सेतो चामल, दूध, घ्यू, सेतो चन्दन, मिश्री, सेतो कपडा, सुगन्धित द्रव्य',
        daanDay: 'शुक्रबार साँझ (विवाहित महिला वा कन्यालाई)',
        vrataRule: 'शुक्रबार सन्तोषी माता वा महालक्ष्मीको व्रत बसी सेतो वस्तु अर्पण गर्ने।',
        pujaPath: 'श्रीसूक्त, कनकधारा स्तोत्र वा दुर्गा सप्तशती पाठ।',
        gemstoneGuidance: isDebilitated || isDusthana
          ? '⚠️ ध्यान दिनुहोस्: शुक्र नीच (कन्या) वा त्रिक भावमा रहँदा हीरा (Diamond) वा ओपल नलगाउनुहोस्! महालक्ष्मीको उपासना र सेतो वस्तु दान गर्नुहोस्।'
          : 'शुक्र अनुकूल रहेमा चाँदी वा प्लेटिनममा हीरा/ओपल लगाउन सकिन्छ।',
        rudrakshaSuggestion: '६ मुखी रुद्राक्ष सेतो धागोमा शुक्रबार धारण गर्ने।',
        practicalAdvice: 'महिलाहरूको सधैं सम्मान गर्ने, चरित्र शुद्ध राख्ने, विलासितामा अपव्यय नगर्ने।',
      };
    case 'शनि':
      return {
        mantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः (वा "ॐ शं शनैश्चराय नमः")',
        japCount: '२३,००० पटक (शनिबार साँझ पश्चिम फर्किएर)',
        daanItems: 'कालो मास, कालो तिल, तोरी/तिलको तेल, फलाम, कालो कपडा, छाता, जुत्ता',
        daanDay: 'शनिबार साँझ (श्रमजीवी, अशक्त वा गरिब व्यक्तिलाई)',
        vrataRule: 'शनिबार व्रत बस्ने र साँझ पीपलको बोटमुनि तोरीको तेलको दीप प्रज्वलन गर्ने।',
        pujaPath: 'दशरथकृत शनि स्तोत्र, हनुमान चालीसा र शनि चालिसा पाठ।',
        gemstoneGuidance: isDebilitated || isDusthana
          ? '⚠️ ध्यान दिनुहोस्: शनि नीच (मेष) वा ६/८ भावमा मारक हुँदा नीलम (Blue Sapphire) कदापि नलगाउनुहोस्! पीपलमा जल र तेलको दीप बाल्नु सर्वोत्तम हुन्छ।'
          : 'शनि योगकारक भएमा मात्र अनुभवी ज्योतिषीको परामर्शमा नीलम वा एमेथिस्ट लगाउनुहोला।',
        rudrakshaSuggestion: '७ मुखी वा १४ मुखी रुद्राक्ष कालो वा नीलो धागोमा शनिबार धारण गर्ने।',
        practicalAdvice: 'कडा श्रम गर्ने मजदुर, कर्मचारी र वृद्धवृद्धाको कहिल्यै चित्त नदुखाउने, सत्य बोल्ने।',
      };
    case 'राहु':
      return {
        mantra: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः (वा "ॐ रां राहवे नमः")',
        japCount: '१८,००० पटक (रात्रिकालमा अँध्यारो कोठा वा एकान्तमा)',
        daanItems: 'कालो मास, कालो तिल, तोरीको तेल, कच्चा कोइला, नीलो कपडा, सुर्ती/खैनी',
        daanDay: 'शनिबार राति वा ग्रहणको समयमा',
        vrataRule: 'शनिबार भैरव मन्दिर दर्शन र कुकुरलाई मीठो रोटी खुवाउने।',
        pujaPath: 'बटुक भैरव स्तोत्र, दुर्गा कवच र महामृत्युञ्जय मन्त्र जप।',
        gemstoneGuidance: '⚠️ राहुको रत्न गोमेद (Hessonite) धेरै सावधानीपूर्वक मात्र लगाउनुपर्छ। नीच वा अष्टम भावमा हुँदा गोमेद कदापि नलगाउनुहोला! भैरव उपासना नै कल्याणकारी हुन्छ।',
        rudrakshaSuggestion: '८ मुखी रुद्राक्ष कालो धागोमा धारण गर्ने।',
        practicalAdvice: 'जुवा, सट्टेबाजी, अनलाइन छलकपट र कुलतबाट पूर्ण रूपमा टाढा रहने, फोहोर नराख्ने।',
      };
    default: // Ketu
      return {
        mantra: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः (वा "ॐ कें केतवे नमः")',
        japCount: '१७,००० पटक (बिहान वा साँझमा)',
        daanItems: 'सप्तधान्य (सात प्रकारका अन्न), कालो-सेतो कम्बल, तिल, लसुन, प्याज, फलाम',
        daanDay: 'मंगलबार वा बुधबार बिहान',
        vrataRule: 'गणेशजीको उपासना गर्ने र मंगलबार कुकुर तथा चराचुरुङ्गीलाई दाना खुवाउने।',
        pujaPath: 'गणेश द्वादशनाम स्तोत्र, संकटनाशन गणेश स्तोत्र पाठ।',
        gemstoneGuidance: '⚠️ केतुको रत्न लहसुनिया (Cat’s Eye) बिना विशेष परीक्षण नलगाउनुहोला। गणेशजीको उपासना नै सबैभन्दा अचुक उपाय हो।',
        rudrakshaSuggestion: '९ मुखी रुद्राक्ष पहेँलो वा रातो धागोमा धारण गर्ने।',
        practicalAdvice: 'अध्यात्म, ध्यान, योग र निःस्वार्थ सेवामा समय दिने, साधु-सन्तको सम्मान गर्ने।',
      };
  }
}

/**
 * Calculates critical life years where planets bring challenges
 */
function calculateCriticalLifeYears(
  lagnaRashiId: number,
  afflictedPlanets: AfflictedPlanetAnalysis[],
  birthYearBS: number
): ComprehensiveUnfavorablePeriodsReport['criticalLifeYears'] {
  // Classical age sensitivity based on Lagna
  const lagnaCriticalAges: Record<number, number[]> = {
    1: [8, 12, 21, 28, 36, 44],
    2: [7, 16, 25, 34, 42, 51],
    3: [9, 15, 22, 32, 40, 48],
    4: [5, 14, 24, 28, 38, 46],
    5: [6, 12, 22, 30, 42, 52],
    6: [8, 18, 26, 35, 45, 54],
    7: [7, 14, 23, 31, 41, 50],
    8: [6, 13, 22, 28, 36, 48],
    9: [8, 16, 25, 32, 44, 55],
    10: [9, 19, 29, 36, 46, 56],
    11: [10, 20, 30, 40, 48, 58],
    12: [8, 15, 24, 33, 42, 52],
  };

  const baseAges = lagnaCriticalAges[lagnaRashiId] || [8, 16, 28, 36, 42, 48];
  const list: ComprehensiveUnfavorablePeriodsReport['criticalLifeYears'] = [];

  baseAges.slice(0, 5).forEach((age) => {
    // Find if an afflicted planet corresponds to this age
    const matchingAfflicted = afflictedPlanets.find((ap) => ap.unfavorableYearsAge.naturalAgeYears.includes(age)) || afflictedPlanets[0];
    const govPlanet = matchingAfflicted ? matchingAfflicted.planetName : (age % 2 === 0 ? 'शनि' : 'राहु');
    
    let category: 'स्वास्थ्य' | 'आर्थिक' | 'मानसिक/पारिवारिक' | 'शिक्षा/कर्म' | 'चोटपटक/दुर्घटना' = 'स्वास्थ्य';
    let note = '';
    let prot = '';

    if (age <= 16) {
      category = 'शिक्षा/कर्म';
      note = `बाल्यावस्था तथा प्रारम्भिक शिक्षामा एकाग्रता कमी वा मौसमी स्वास्थ्य विकारको सम्भावना।`;
      prot = `सरस्वती मन्त्र तथा महामृत्युञ्जय जप, बिहान गायत्री मन्त्र स्मरण।`;
    } else if (age <= 30) {
      category = govPlanet === 'मंगल' ? 'चोटपटक/दुर्घटना' : 'शिक्षा/कर्म';
      note = `उच्च शिक्षा, करियर छनोट, पेशागत प्रतिस्पर्धा र सम्बन्धमा केही सङ्घर्ष तथा मानसिक तनाव।`;
      prot = `${govPlanet} ग्रहको बीज मन्त्र जप र हनुमान चालीसा नित्य पाठ।`;
    } else if (age <= 45) {
      category = govPlanet === 'शनि' ? 'आर्थिक' : 'मानसिक/पारिवारिक';
      note = `पारिवारिक उत्तरदायित्व, व्यापार/व्यवसाय वा लगानीमा सावधानी अपनाउनुपर्ने समय।`;
      prot = `पीपलमा जल चढाउने, असहायलाई अन्नदान तथा कुलदेवताको विशेष पूजा।`;
    } else {
      category = 'स्वास्थ्य';
      note = `शारीरिक ऊर्जा, जोर्नी, रक्तचाप वा दीर्घकालीन स्वास्थ्य विषयमा सचेत रहनुपर्ने समय।`;
      prot = `रुद्राभिषेक, महामृत्युञ्जय अनुष्ठान र नियमित स्वास्थ्य परीक्षण।`;
    }

    list.push({
      ageYear: age,
      approxCalendarYearBS: birthYearBS + age,
      governingPlanet: govPlanet,
      riskCategory: category,
      counselingNote: note,
      recommendedProtection: prot,
    });
  });

  return list;
}
