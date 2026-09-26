import { BirthDetails, LagnaInfo, PlanetPosition, PanchangaData, VimshottariDashaResult, GocharTransitResult } from './astrology';
import { DetailedYogaResult, DetailedDoshaResult } from './yogaDoshaTypes';

export interface GrahaPhalItem {
  planetId: string;
  planetNameNepali: string;
  planetNameSanskrit: string;
  rashiName: string;
  houseNumber: number;
  lordshipsNepali: string[];
  dignity: string;
  nakshatraName: string;
  nakshatraLord: string;
  aspectingHouses: number[];
  conjoinedPlanets: string[];
  classicalSummaryNepali: string;
  positiveEffects: string[];
  challengesToWatch: string[];
  remedyNepali: string;
}

export interface BhavaPhalItem {
  houseNumber: number;
  houseNameNepali: string;
  significationsNepali: string;
  rashiName: string;
  lordPlanet: string;
  lordHousePosition: number;
  occupyingPlanets: string[];
  aspectingPlanets: string[];
  strengthRating: 'अति सबल' | 'सबल' | 'मध्यम' | 'चुनौतीपूर्ण';
  classicalInterpretationNepali: string;
}

export interface BhaveshPhalItem {
  houseNumber: number;
  houseNameNepali: string;
  lordPlanet: string;
  placedInHouse: number;
  placedInRashi: string;
  effectType: 'शुभ फलदायी' | 'मध्यम फलदायी' | 'विशेष ध्यान दिनुपर्ने';
  explanationNepali: string;
}

export interface DashaGocharPhalItem {
  mahadashaPlanet: string;
  antardashaPlanet: string;
  pratyantardashaPlanet?: string;
  startDateBS: string;
  endDateBS: string;
  dashaRelationNepali: string;
  activeLifeAreasNepali: string[];
  gocharCoordinationNepali: string;
  keyAdviceNepali: string;
}

export interface LifeAreaAnalysisExtended {
  areaKey: string;
  areaTitleNepali: string;
  iconName: string;
  primaryPlanetsInvolved: string[];
  primaryHousesInvolved: number[];
  overallRating: 'अति उत्तम' | 'उत्तम' | 'सामान्य/सन्तुलित' | 'सजगता अपनाउनुपर्ने';
  summaryNepali: string;
  strengthsNepali: string[];
  challengesNepali: string[];
  activeTimingNepali: string;
  remediesNepali: string[];
  medicalDisclaimerNoticeNepali?: string;
}

export interface TimelinePhaseItem {
  phaseId: string;
  titleNepali: string;
  periodBS: string;
  mahadasha: string;
  antardasha: string;
  dominantThemesNepali: string[];
  opportunityAreasNepali: string[];
  precautionAreasNepali: string[];
}

export interface QnaQueryResult {
  questionCategory: string;
  userQuery: string;
  astrologicalFactsInvolved: {
    relevantPlanets: string[];
    relevantHouses: number[];
    currentDasha: string;
    keyYogaOrDosha: string[];
  };
  appliedClassicalRuleNepali: string;
  balancedPredictionNepali: string;
  favorablePeriodNepali: string;
  recommendedRemediesNepali: string[];
  sourceReferenceNepali: string;
}

export interface ComprehensiveFaladeshReport {
  generatedAtISO: string;
  engineVersion: string;
  profile: BirthDetails;
  overviewSummaryNepali: string;
  grahaPhalList: GrahaPhalItem[];
  bhavaPhalList: BhavaPhalItem[];
  bhaveshPhalList: BhaveshPhalItem[];
  activeYogasAndDoshasNepali: {
    yogasSummary: string[];
    doshasSummary: string[];
  };
  dashaGocharPhal: DashaGocharPhalItem;
  lifeAreas: LifeAreaAnalysisExtended[];
  lifeTimeline: TimelinePhaseItem[];
  remediesMasterList: {
    mantraJap: string[];
    daanSewa: string[];
    poojaVrat: string[];
    lifestyleAndBehavior: string[];
  };
  healthDisclaimerNepali: string;
  astrologerNotesNepali?: string;
}
