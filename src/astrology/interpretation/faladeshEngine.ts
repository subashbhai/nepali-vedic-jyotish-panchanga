import { 
  PlanetPosition, 
  LagnaInfo, 
  PlanetName, 
  RashiName, 
  VimshottariDashaResult, 
  BirthDetails 
} from '../../types/astrology';

import { 
  GrahaAnalysis, 
  BhavaAnalysis, 
  FaladeshResult, 
  RuleBasisItem, 
  LifeAreaImpact,
  DashaAnalysis 
} from './types';

import { 
  calculatePlanetDignity, 
  RASHI_LORDS 
} from './planetDignity';

import { 
  calculateLordshipAnalysis, 
  analyzeBhava, 
  BHAVA_DEFINITIONS 
} from './houseInterpretation';

import { 
  calculateAspectsCast, 
  calculateAspectsReceived 
} from './planetaryAspects';

import { 
  analyzeConjunctions 
} from './conjunctionAnalysis';

import {
  BPHS_GRAHA_SWAROOPA,
  BPHS_BHAVA_SHLOKAS
} from '../../utils/brihatParasharaDatabase';

const RASHI_NAMES_LIST: RashiName[] = [
  'मेष', 'वृष', 'मिथुन', 'कर्कट', 'सिंह', 'कन्या', 
  'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन'
];

const PLANET_SYMBOLS: Record<PlanetName, string> = {
  'सूर्य': '☉',
  'चन्द्र': '☽',
  'मंगल': '♂',
  'बुध': '☿',
  'गुरु': '♃',
  'शुक्र': '♀',
  'शनि': '♄',
  'राहु': '☊',
  'केतु': '☋',
};

/**
 * Analyzes a single planet's placement, dignity, lordships, aspects, conjunctions, and dasha.
 */
export function analyzeGraha(
  planet: PlanetPosition,
  lagna: LagnaInfo,
  allPlanets: PlanetPosition[],
  dasha?: VimshottariDashaResult
): GrahaAnalysis {
  const planetName = planet.name;
  const rashiId = planet.rashiId;
  const rashiName = planet.rashiName || RASHI_NAMES_LIST[rashiId - 1];
  const rashiLord = RASHI_LORDS[rashiId];
  const houseNumber = planet.bhava;

  // 1. Dignity
  const dignity = calculatePlanetDignity(planetName, rashiId, planet.degree);

  // 2. Lordships
  const lordship = calculateLordshipAnalysis(planetName, lagna.rashiId);

  // 3. Aspects Cast & Received
  const simplifiedPlanets = allPlanets.map((p) => ({
    name: p.name,
    bhava: p.bhava,
    rashiId: p.rashiId,
    rashiName: p.rashiName || RASHI_NAMES_LIST[p.rashiId - 1],
    longitude: p.longitude,
    dignityStatus: calculatePlanetDignity(p.name, p.rashiId, p.degree).status,
  }));

  const aspectsCast = calculateAspectsCast(planetName, houseNumber, lagna.rashiId, simplifiedPlanets);
  const aspectsReceived = calculateAspectsReceived(planetName, houseNumber, simplifiedPlanets);

  // 4. Conjunctions
  const conjunctions = analyzeConjunctions(planetName, houseNumber, planet.longitude, simplifiedPlanets);

  // 5. Dasha Context
  const dashaContextList: DashaAnalysis[] = [];
  if (dasha) {
    if (dasha.currentMahadasha?.planet === planetName) {
      dashaContextList.push({
        isCurrentMahadasha: true,
        isCurrentAntardasha: false,
        isCurrentPratyantardasha: false,
        roleNepali: 'वर्तमान महादशा स्वामी (Major Period Ruler)',
        activeInfluenceNepali: `हाल ${planetName} को महादशा चलिरहेको छ, जसले गर्दा यो ग्रह जीवनको प्रमुख सञ्चालक बनेको छ।`,
      });
    } else if (dasha.currentAntardasha?.planet === planetName) {
      dashaContextList.push({
        isCurrentMahadasha: false,
        isCurrentAntardasha: true,
        isCurrentPratyantardasha: false,
        roleNepali: 'वर्तमान अन्तर्दशा स्वामी (Sub Period Ruler)',
        activeInfluenceNepali: `हाल ${planetName} को अन्तर्दशा सक्रिय रहेकाले यसका फलहरू अहिले घनीभूत रूपमा प्रकट भइरहेका छन्।`,
      });
    }
  }

  // 6. Strengths, Challenges, & Life Impacts
  const positiveStrengths: string[] = [];
  const challengePoints: string[] = [];
  const astrologicalBasis: RuleBasisItem[] = [];

  // Basis Checklist
  astrologicalBasis.push({
    ruleCode: 'RULE_PLACEMENT',
    titleNepali: 'भाव तथा राशि स्थिति',
    classicalTextReference: 'बृहत् पाराशर होराशास्त्रम्',
    descriptionNepali: `${planetName} ग्रह भाव ${houseNumber} (${rashiName} राशि) मा अवस्थित छ।`,
  });

  astrologicalBasis.push({
    ruleCode: 'RULE_DIGNITY',
    titleNepali: 'ग्रह मर्यादा र बल',
    classicalTextReference: 'होरा मकरन्द / मानसागरी',
    descriptionNepali: `${planetName} यस राशिमा ${dignity.status} अवस्थामा छ। (${dignity.explanationNepali})`,
  });

  if (lordship.lordshipTitlesNepali.length > 0) {
    astrologicalBasis.push({
      ruleCode: 'RULE_LORDSHIP',
      titleNepali: 'भाव स्वामित्त्व (Bhavesh)',
      classicalTextReference: 'फलदीपिका',
      descriptionNepali: `स्वामित्व: ${lordship.lordshipTitlesNepali.join(', ')}`,
    });
  }

  if (dignity.score >= 80) {
    positiveStrengths.push(`${planetName} ${dignity.status} स्थितिमा रहेकाले सम्बन्धित क्षेत्रमा बलियो सकारात्मक जग दिन्छ।`);
  } else if (dignity.status === 'नीच' || dignity.score <= 35) {
    challengePoints.push(`${planetName} कमजोर/नीच स्थितिमा रहेकाले सम्बन्धित कार्यमा धैर्य र निरन्तर प्रयास आवश्यक छ।`);
  }

  if (planet.isRetrograde) {
    challengePoints.push(`ग्रह वक्री गतिमा रहेकाले कार्यमा दोहोऱ्याएर प्रयत्न गर्नुपर्ने हुनसक्छ।`);
    astrologicalBasis.push({
      ruleCode: 'RULE_RETROGRADE',
      titleNepali: 'वक्री गति',
      descriptionNepali: 'ग्रह चेष्टा बली मानिए तापनि आन्तरिक पुनरावलोकन गराउँछ।',
    });
  }

  if (planet.isCombust) {
    challengePoints.push(`सूर्यसँग अस्त भएकाले बाहिरी रूपमा फल प्रकट हुन केही मेहनत लाग्छ।`);
    astrologicalBasis.push({
      ruleCode: 'RULE_COMBUST',
      titleNepali: 'अस्त स्थिति (Combustion)',
      descriptionNepali: 'सूर्यको निकटताले ग्रहको बाह्य आभा कम हुन्छ।',
    });
  }

  // Life Area Impact Synthesis
  const houseDef = BHAVA_DEFINITIONS[houseNumber];
  const lifeImpacts: LifeAreaImpact[] = [
    {
      areaName: houseNumber === 1 ? 'स्वास्थ्य' : houseNumber === 2 || houseNumber === 11 ? 'धन र आर्थिक' : houseNumber === 10 ? 'करियर र पेशा' : houseNumber === 5 || houseNumber === 9 ? 'शिक्षा र बुद्धि' : houseNumber === 7 ? 'विवाह र सम्बन्ध' : 'भाग्य र अध्यात्म',
      impactType: dignity.score >= 80 ? 'अत्यन्त अनुकूल' : dignity.score >= 60 ? 'अनुकूल' : dignity.score >= 40 ? 'सन्तुलित' : 'चुनौतीपूर्ण',
      descriptionNepali: `${planetName} ले भाव ${houseNumber} मा रहेर ${houseDef ? houseDef.primaryDomainNepali : 'सम्बन्धित जीवनक्षेत्र'} मा मुख्य प्रभाव पारेको छ।`,
    },
  ];

  // Classical Summary Text
  let classicalInterpretation = `${planetName} ग्रह ${rashiName} राशि र भाव ${houseNumber} मा ${dignity.status} अवस्थामा विराजमान छ। `;
  classicalInterpretation += `${lordship.summaryNepali} `;
  if (conjunctions.length > 0) {
    const conjNames = conjunctions.map((c) => c.conjoinedPlanet).join(', ');
    classicalInterpretation += `यस भावमा ${conjNames} सँगको युतिले विशेष ऊर्जा निर्माण गरेको छ। `;
  }
  if (aspectsReceived.length > 0) {
    const aspNames = aspectsReceived.map((a) => a.aspectingPlanet).join(', ');
    classicalInterpretation += `यसमाथि ${aspNames} को दृष्टि रहेको छ। `;
  }
  classicalInterpretation += `वैदिक ज्योतिषीय सिद्धान्त अनुसार यस स्थितिले जीवनमा नियमित अनुशासन, विवेकपूर्ण निर्णय र समय अनुकूल साधना गर्दा सुखद् नतिजा दिने संकेत गर्दछ।`;

  // Recommended Remedies
  const recommendedRemedies = [
    `${planetName} को अनुकूलताका लागि दिनचर्यामा सकारात्मक सोच र अनुशासन कायम राख्ने।`,
    `${planetName} सम्बन्धी मूल मन्त्र वा स्तोत्र पाठ/श्रवण गर्ने।`,
    `सात्विक आहार, सेवा र असहायलाई सहयोग गर्ने।`,
  ];

  return {
    planet: planetName,
    planetSymbol: PLANET_SYMBOLS[planetName] || '🪐',
    rashiId,
    rashiName,
    rashiLord,
    houseNumber,
    formattedDegree: planet.formattedDegree,
    longitude: planet.longitude,
    isRetrograde: planet.isRetrograde,
    isCombust: planet.isCombust,
    nakshatraName: planet.nakshatraName,
    pada: planet.pada,
    nakshatraLord: planet.nakshatraLord as PlanetName,
    dignity,
    lordship,
    aspectsCast,
    aspectsReceived,
    conjunctions,
    dashaContext: dashaContextList,
    positiveStrengths,
    challengePoints,
    lifeImpacts,
    classicalInterpretationNepali: classicalInterpretation,
    recommendedRemediesNepali: recommendedRemedies,
    astrologicalBasis,
    classicalProof: BPHS_GRAHA_SWAROOPA[planetName] || BPHS_GRAHA_SWAROOPA['सूर्य'],
    bhavaShloka: BPHS_BHAVA_SHLOKAS[houseNumber] || BPHS_BHAVA_SHLOKAS[1],
  };
}

/**
 * Main Orchestrator Function: Synthesizes complete chart data into a structured FaladeshResult.
 */
export function synthesizeFaladeshChart(
  planets: PlanetPosition[],
  lagna: LagnaInfo,
  profile?: BirthDetails,
  dasha?: VimshottariDashaResult
): FaladeshResult {
  // 1. Analyze all 9 planets
  const grahaAnalysisList: GrahaAnalysis[] = planets.map((p) =>
    analyzeGraha(p, lagna, planets, dasha)
  );

  // 2. Simplified planets list for house analysis
  const simplifiedPlanets = planets.map((p) => ({
    name: p.name,
    bhava: p.bhava,
    rashiId: p.rashiId,
    rashiName: p.rashiName || RASHI_NAMES_LIST[p.rashiId - 1],
    dignityStatus: calculatePlanetDignity(p.name, p.rashiId, p.degree).status,
  }));

  // 3. Analyze all 12 houses
  const bhavaAnalysisList: BhavaAnalysis[] = [];
  for (let house = 1; house <= 12; house++) {
    const bAnalysis = analyzeBhava(house, lagna.rashiId, simplifiedPlanets);
    bAnalysis.classicalBhavaShloka = BPHS_BHAVA_SHLOKAS[house];
    bhavaAnalysisList.push(bAnalysis);
  }

  // 4. Identify dominant planets (Exalted, Own sign, Lagnesh, or Dasha lord)
  const dominantPlanets: PlanetName[] = grahaAnalysisList
    .filter(
      (g) =>
        g.dignity.score >= 80 ||
        g.lordship.ownedHouses.includes(1) ||
        g.dashaContext.some((d) => d.isCurrentMahadasha)
    )
    .map((g) => g.planet);

  // 5. Collect key strengths and challenges
  const keyStrengthsNepali: string[] = [];
  const keyChallengesNepali: string[] = [];

  grahaAnalysisList.forEach((g) => {
    if (g.positiveStrengths.length > 0) {
      keyStrengthsNepali.push(...g.positiveStrengths);
    }
    if (g.challengePoints.length > 0) {
      keyChallengesNepali.push(...g.challengePoints);
    }
  });

  // 6. Synthesize Overview Summary
  const lagnaRashiName = RASHI_NAMES_LIST[lagna.rashiId - 1];
  const lagneshName = RASHI_LORDS[lagna.rashiId];
  const lagneshObj = grahaAnalysisList.find((g) => g.planet === lagneshName);

  let overview = `यो कुण्डली ${lagnaRashiName} लग्नको हो। लग्नेश ${lagneshName} भाव ${lagneshObj ? lagneshObj.houseNumber : 1} मा ${lagneshObj ? lagneshObj.dignity.status : 'सन्तुलित'} स्थितिमा रहेका छन्। `;
  if (dominantPlanets.length > 0) {
    overview += `कुण्डलीमा ${dominantPlanets.join(', ')} ग्रहहरूको बलियो प्रभाव रहेको देखिन्छ। `;
  }
  overview += `विंशोत्तरी दशा तथा ग्रहको स्थिति अनुसार जीवनका मुख्य क्षेत्रहरूमा विवेक, निरन्तर साधना र समय अनुकूल काम गर्दा राम्रो उन्नति हुने सम्भावना छ।`;

  // 7. Life Insights
  const careerHouse = bhavaAnalysisList.find((b) => b.houseNumber === 10);
  const wealthHouse = bhavaAnalysisList.find((b) => b.houseNumber === 2);
  const relationshipHouse = bhavaAnalysisList.find((b) => b.houseNumber === 7);
  const healthHouse = bhavaAnalysisList.find((b) => b.houseNumber === 1);
  const spiritualHouse = bhavaAnalysisList.find((b) => b.houseNumber === 9);

  const careerInsightNepali = careerHouse
    ? `कर्म भाव (दशम भाव) मा ${careerHouse.rashiName} राशि छ र स्वामी ${careerHouse.rashiLord} भाव ${careerHouse.lordPlacementHouse} मा छ। यसले व्यवसाय तथा पेशागत क्षेत्रमा निरन्तर अनुशासन र नेतृत्व क्षमताको विकास गराउँछ।`
    : 'पेशातर्फ सन्तुलित स्थिति रहेको छ।';

  const wealthInsightNepali = wealthHouse
    ? `द्वितीय (धन) भाव र एकादश (लाभ) भावको स्थिति अनुसार सञ्चित धन र आयआर्जनमा योजनाबद्ध व्यवस्थापन लाभदायक हुनेछ।`
    : 'आर्थिक स्थिति सन्तुलित रहनेछ।';

  const relationshipInsightNepali = relationshipHouse
    ? `सप्तम (कलत्र/विवाह) भावको स्वामी ${relationshipHouse.rashiLord} को स्थितिले दाम्पत्य जीवन र साझेदारितामा आपसी समझदारी र संवादको महत्त्व दर्शाउँछ।`
    : 'सम्बन्धमा समझदारी आवश्यक छ।';

  const healthInsightNepali = healthHouse
    ? `प्रथम भाव र लग्नेश ${lagneshName} को स्थिति अनुसार शारीरिक ऊर्जा र दिनचर्यामा सन्तुलन कायम राख्नु स्वास्थ्यका लागि हितकर हुनेछ।`
    : 'स्वास्थ्य सामान्यतया सन्तुलित रहनेछ।';

  const spiritualInsightNepali = spiritualHouse
    ? `नवम (भाग्य/धर्म) भावमा ${spiritualHouse.rashiName} राशि रहेकाले धर्म, अध्यात्म र गुरुजनप्रतिको श्रद्धाले भाग्यवृद्धिमा सहयोग पुर्‍याउनेछ।`
    : 'आध्यात्मिक चिन्तनले मानसिक शान्ति दिनेछ।';

  // Master Remedies
  const masterRemediesNepali = {
    mantras: [
      'ॐ नमः शिवाय (दैनिक १०८ पटक जप)',
      'गायत्री मन्त्र वा इष्टदेवको पाठ',
      'नवग्रह स्तोत्र वा सूर्य नमस्कार',
    ],
    donations: [
      'आफ्नो जन्मदिन वा विशेष तिथिमा असहाय तथा विद्यार्थीहरूलाई अन्न/शैक्षिक सामग्री दान गर्ने',
      'शनिवार र मंगलवार पशुपक्षीलाई आहारा दिने',
    ],
    lifestyleAdvice: [
      'सकारात्मक सोच, प्रातःकालमा सूर्य दर्शन र प्राणायाम गर्ने',
      'ज्येष्ठ नागरिक, माता-पिता र गुरुजनको आदर-सत्कार गर्ने',
    ],
    vratOrPooja: [
      'एकादशी वा आफ्नो कुल परम्परा अनुसारको व्रत/पूजा सम्पादन गर्ने',
    ],
  };

  return {
    generatedAtISO: new Date().toISOString(),
    profile,
    lagna,
    overviewSummaryNepali: overview,
    dominantPlanets,
    keyStrengthsNepali,
    keyChallengesNepali,
    grahaAnalysisList,
    bhavaAnalysisList,
    careerInsightNepali,
    wealthInsightNepali,
    relationshipInsightNepali,
    healthInsightNepali,
    spiritualInsightNepali,
    masterRemediesNepali,
    appliedRulesCount: grahaAnalysisList.length * 5 + bhavaAnalysisList.length * 3,
    disclaimerNepali: 'यो फलादेश पारम्परिक वैदिक ज्योतिषका गणितीय नियमहरूमा आधारित छ। यसलाई मार्गदर्शनको रूपमा लिएर आफ्नो विवेक र कर्ममा विश्वास राख्नु उत्तम हुन्छ।',
  };
}
