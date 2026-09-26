import { 
  PlanetName, 
  RashiName, 
  PlanetPosition, 
  LagnaInfo, 
  VimshottariDashaResult, 
  BirthDetails 
} from '../../types/astrology';

export type DignityStatus = 
  | 'उच्च' 
  | 'नीच' 
  | 'मूलत्रिकोण' 
  | 'स्वक्षेत्र' 
  | 'अति मित्र'
  | 'मित्रराशि' 
  | 'समराशि' 
  | 'शत्रुराशि'
  | 'अति शत्रु';

export interface DignityAnalysis {
  status: DignityStatus;
  score: number; // 0 to 100
  badgeColor: string;
  explanationNepali: string;
  rationaleSanskrit: string;
}

export interface LordshipAnalysis {
  ownedHouses: number[];
  lordshipTitlesNepali: string[];
  isFunctionalBenefic: boolean;
  isKendraLord: boolean;
  isTrikonaLord: boolean;
  isTrikLord: boolean; // 6, 8, 12
  isMarakaLord: boolean; // 2, 7
  summaryNepali: string;
}

export interface AspectAnalysis {
  targetHouse: number;
  targetRashi: RashiName;
  aspectType: string;
  strengthPercentage: number;
  planetsInTargetHouse: PlanetName[];
  effectNepali: string;
}

export interface AspectReceivedAnalysis {
  aspectingPlanet: PlanetName;
  fromHouse: number;
  aspectType: string;
  isBeneficAspect: boolean;
  effectNepali: string;
}

export interface ConjunctionAnalysis {
  conjoinedPlanet: PlanetName;
  angularDistanceDegree: number;
  formattedDistance: string;
  relationshipNature: 'मित्र' | 'शत्रु' | 'सम';
  combustionRisk: boolean;
  specialYogaName?: string;
  interpretationNepali: string;
}

export interface DashaAnalysis {
  isCurrentMahadasha: boolean;
  isCurrentAntardasha: boolean;
  isCurrentPratyantardasha: boolean;
  roleNepali: string;
  activeInfluenceNepali: string;
}

export interface RuleBasisItem {
  ruleCode: string;
  titleNepali: string;
  classicalTextReference?: string; // e.g. "बृहत् पाराशर होराशास्त्रम्"
  descriptionNepali: string;
}

export interface LifeAreaImpact {
  areaName: 'स्वास्थ्य' | 'धन र आर्थिक' | 'करियर र पेशा' | 'शिक्षा र बुद्धि' | 'विवाह र सम्बन्ध' | 'भाग्य र अध्यात्म' | 'परिवार र सन्तान';
  impactType: 'अत्यन्त अनुकूल' | 'अनुकूल' | 'सन्तुलित' | 'चुनौतीपूर्ण';
  descriptionNepali: string;
}

export interface GrahaAnalysis {
  planet: PlanetName;
  planetSymbol: string;
  rashiId: number;
  rashiName: RashiName;
  rashiLord: PlanetName;
  houseNumber: number;
  formattedDegree: string;
  longitude: number;
  isRetrograde: boolean;
  isCombust: boolean;
  nakshatraName: string;
  pada: number;
  nakshatraLord: PlanetName;
  
  // Synthesized Analysis
  dignity: DignityAnalysis;
  lordship: LordshipAnalysis;
  aspectsCast: AspectAnalysis[];
  aspectsReceived: AspectReceivedAnalysis[];
  conjunctions: ConjunctionAnalysis[];
  dashaContext: DashaAnalysis[];
  
  // Overall Interpretation
  positiveStrengths: string[];
  challengePoints: string[];
  lifeImpacts: LifeAreaImpact[];
  classicalInterpretationNepali: string;
  recommendedRemediesNepali: string[];
  astrologicalBasis: RuleBasisItem[];

  // Classical Brihat Parashara Hora Shastra Proof
  classicalProof?: {
    sanskritVerse: string;
    sourceChapterNepali: string;
    sourceChapterSanskrit: string;
    wordMeaningNepali: string;
    detailedMeaningNepali: string;
    astrologicalPrinciplesNepali: string[];
    practicalEffectsNepali: string;
    classicalRemedyNepali: string;
  };
  bhavaShloka?: {
    sanskritVerse: string;
    sourceChapter: string;
    wordMeaningNepali: string;
    classicalEffectNepali: string;
  };
}

export interface BhavaAnalysis {
  houseNumber: number;
  houseTitleNepali: string;
  rashiName: RashiName;
  rashiLord: PlanetName;
  lordPlacementHouse: number;
  lordDignity: DignityStatus;
  occupyingPlanets: PlanetName[];
  aspectingPlanets: PlanetName[];
  bhavaStrengthRating: 'अति सबल' | 'सबल' | 'सन्तुलित' | 'चुनौतीपूर्ण';
  significationsNepali: string[];
  overallInterpretationNepali: string;
  classicalBhavaShloka?: {
    sanskritVerse: string;
    sourceChapter: string;
    wordMeaningNepali: string;
    classicalEffectNepali: string;
  };
}

export interface FaladeshResult {
  generatedAtISO: string;
  profile?: BirthDetails;
  lagna: LagnaInfo;
  
  // Summaries
  overviewSummaryNepali: string;
  dominantPlanets: PlanetName[];
  keyStrengthsNepali: string[];
  keyChallengesNepali: string[];
  
  // Detailed Analysis Blocks
  grahaAnalysisList: GrahaAnalysis[];
  bhavaAnalysisList: BhavaAnalysis[];
  
  // Categorized Life Insights
  careerInsightNepali: string;
  wealthInsightNepali: string;
  relationshipInsightNepali: string;
  healthInsightNepali: string;
  spiritualInsightNepali: string;
  
  // Master Remedies
  masterRemediesNepali: {
    mantras: string[];
    donations: string[];
    lifestyleAdvice: string[];
    vratOrPooja: string[];
  };
  
  // Explainable Rules List
  appliedRulesCount: number;
  disclaimerNepali: string;
}
