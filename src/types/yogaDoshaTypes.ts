import { PlanetName, RashiName, DashaPeriod } from './astrology';

export type YogaCategory = 
  | 'राजयोग' 
  | 'धनयोग' 
  | 'विपरीत राजयोग' 
  | 'पंचमहापुरुष' 
  | 'सूर्य योग' 
  | 'चन्द्र योग' 
  | 'राशि परिवर्तन योग' 
  | 'शुभयोग' 
  | 'अशुभयोग';

export type DoshaCategory = 
  | 'मङ्गल दोष' 
  | 'कालसर्प दोष' 
  | 'ग्रहण दोष' 
  | 'गुरु–चाण्डाल दोष' 
  | 'केमद्रुम दोष' 
  | 'अन्य दोष';

export type YogaStatus = 'सक्रिय' | 'कमजोर' | 'आंशिक' | 'भङ्ग' | 'लागू नभएको';

export interface ClassicalProofReference {
  textNameNepali: string; // e.g. "बृहत्पाराशर होराशास्त्र"
  textNameSanskrit: string; // e.g. "बृहत्पाराशरहोराशास्त्रम्"
  chapter: string; // e.g. "अध्याय ३५"
  shlokaOrVerse: string; // e.g. "श्लोक ३-५"
  originalSanskritText?: string;
  nepaliMeaningSummary: string;
}

export interface PlanetaryRelationEdge {
  fromPlanet: PlanetName;
  toPlanet: PlanetName;
  relationType: 'युति' | 'पूर्ण_दृष्टि' | 'आंशिक_दृष्टि' | 'राशि_परिवर्तन' | 'भावेश_सम्बन्ध' | 'नक्षत्र_सम्बन्ध';
  strengthPercentage: number;
  descriptionNepali: string;
}

export interface PlanetaryRelationshipGraph {
  nodes: PlanetName[];
  edges: PlanetaryRelationEdge[];
  conjunctions: Array<{ house: number; planets: PlanetName[] }>;
  aspects: Array<{ observer: PlanetName; target: PlanetName; houseDistance: number; percentage: number }>;
  parivartanaYogas: Array<{ planet1: PlanetName; planet2: PlanetName; house1: number; house2: number; type: 'महा' | 'दैन्य' | 'खल' }>;
  nakshatraLordLinks: Array<{ planet: PlanetName; nakshatraLord: PlanetName; lordHouse: number; lordRashi: RashiName }>;
}

export interface DetailedYogaResult {
  id: string;
  ruleCode: string;
  nameNepali: string;
  nameSanskrit: string;
  category: YogaCategory;
  status: YogaStatus;
  strengthPercentage: number;
  formingPlanets: PlanetName[];
  housesInvolved: number[];
  rashisInvolved: RashiName[];
  formingCausesNepali: string[];
  cancellationCausesNepali?: string[];
  descriptionNepali: string;
  classicalProof: ClassicalProofReference;
  vargaSupportNepali?: string; // e.g., "नवांश (D9) मा शुभ स्थिति"
  remediesNepali?: string[];
}

export interface DetailedDoshaResult {
  id: string;
  ruleCode: string;
  nameNepali: string;
  nameSanskrit: string;
  category: DoshaCategory;
  status: YogaStatus;
  isCancelled: boolean;
  severityLabel: 'उच्च' | 'मध्यम' | 'निम्न' | 'शमित / भङ्ग';
  formingPlanets: PlanetName[];
  housesInvolved: number[];
  formingRulesNepali: string[];
  cancellationRulesTriggeredNepali: string[];
  descriptionNepali: string;
  classicalProof: ClassicalProofReference;
  remediesNepali: string[];
}

export interface YogaDashaGocharLink {
  yogaId: string;
  yogaName: string;
  isActiveInMahadasha: boolean;
  isActiveInAntardasha: boolean;
  activeDashaPlanet?: PlanetName;
  transitInfluenceSummaryNepali: string;
}

export interface SharedDatabaseSchema {
  version: string;
  tableNames: {
    clients: 'clients';
    birthDetails: 'birth_details';
    panchangaLogs: 'panchanga_logs';
    kundaliRecords: 'kundali_records';
    yogasDetected: 'yogas_detected';
    doshasDetected: 'doshas_detected';
    dashaHistories: 'dasha_histories';
    ruleRegistry: 'rule_registry';
    consultationReports: 'consultation_reports';
  };
}
