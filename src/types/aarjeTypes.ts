export type AarjeItemCategory =
  | 'cash'
  | 'jewelry'
  | 'documents'
  | 'mobile'
  | 'electronics'
  | 'clothing'
  | 'vehicles'
  | 'household'
  | 'livestock'
  | 'other';

export type AarjeSubCategory =
  | 'new_query'
  | 'lost_item'
  | 'stolen_item'
  | 'lost_wealth'
  | 'stolen_wealth'
  | 'documents'
  | 'jewelry'
  | 'electronics'
  | 'other'
  | 'archive'
  | 'report'
  | 'research';

export interface AarjeQueryLocation {
  country: string;
  province: string;
  district: string;
  localLevel: string;
  locationName: string;
  lat: number;
  lng: number;
  timezone: string;
}

export interface ActualFoundDetails {
  foundLocationCategory: 'home_room' | 'cupboard_closet' | 'vehicle' | 'office' | 'neighborhood' | 'other';
  foundLocationNote: string;
  foundDateBS: string;
  wasAstrologyAccurate: boolean;
  feedbackNotes: string;
}

export interface AarjeRecord {
  id: string;
  serialNo: string; // e.g. आर-२०८३-००१
  querierName: string;
  contactNumber: string;
  queryDateBS: string;
  queryDateAD: string;
  queryTime: string;
  queryLocation: AarjeQueryLocation;
  
  itemCategory: AarjeItemCategory;
  itemName: string;
  estimatedValue: string; // e.g. २५,०००
  lastSeenTime: string;
  lastSeenLocation: string;
  estimatedIncidentTime: string;
  incidentDetails: string;
  isStolen: boolean;
  
  evalBasis: 'prashna_only' | 'prashna_and_janma';
  janmaProfileId?: string; // If user attached a birth profile
  notes?: string;
  
  status: 'not_found' | 'found' | 'closed';
  actualFoundDetails?: ActualFoundDetails;
  
  createdAt: string;
}

export interface AarjeRule {
  id: string;
  nameNepali: string;
  category: AarjeItemCategory | 'all';
  houseIndicators: number[]; // e.g. [1, 2, 4, 7, 8, 11, 12]
  planetIndicators: string[]; // e.g. ['Surya', 'Chandra', 'Mangal', 'Guru', 'Shukra', 'Shani', 'Rahu']
  direction: 'पूर्व' | 'पश्चिम' | 'उत्तर' | 'दक्षिण' | 'ईशान' | 'आग्नेय' | 'नैऋत्य' | 'वायव्य';
  placeType: 'घरभित्र' | 'बाहिर' | 'कार्यालय' | 'सवारी साधन' | 'छिमेकी क्षेत्र' | 'अर्को स्थान';
  recoveryChance: 'भेटिने सम्भावना उच्च' | 'ढिलो भेटिन सक्ने' | 'स्थान परिवर्तन भएको सम्भावना' | 'अन्य व्यक्तिसँग गएको सम्भावना' | 'नजिकै हुन सक्ने' | 'टाढा हुन सक्ने';
  sourceText: string; // Classical text, e.g. "प्रश्नायन / प्रश्नमार्ग अध्याय १०, श्लोक १५"
  tradition: string; // e.g. "पराशर / प्रश्न परम्परा"
  descriptionNepali: string;
  isActive?: boolean;
  confidenceWeight?: number; // 1 to 5
  version?: string;
}

export interface DirectionScore {
  directionName: string;
  direction?: string;
  planetScore: number;
  rashiScore: number;
  bhavaScore: number;
  totalScore: number;
  indicatorLevel: 'उच्च' | 'मध्यम' | 'न्यून';
}

export interface ThreeLayerDirectionInfo {
  planetDirection: string;
  planetDirectionReason: string;
  rashiDirection: string;
  rashiDirectionReason: string;
  bhavaDirection: string;
  bhavaDirectionReason: string;
  combinedDirection: string;
  isMixedSignal: boolean;
  directionScores: DirectionScore[];
}

export interface HouseAnalysisInfo {
  houseNo: number;
  houseName: string;
  rashiName: string;
  lordName: string;
  lordBhava: number;
  planetsPresent: string[];
  aspectingPlanets: string[];
  significanceNepali: string;
}

export interface AarjeCalculationDetails {
  engineVersion: string;
  julianDay: number;
  ayanamsaDeg: number;
  ayanamsaDegrees: number;
  lagnaDegree: number;
  lagnaRashiName: string;
  lagnaNakshatra: string;
  lagnaLord: string;
  moonDegree: number;
  moonRashiName: string;
  moonNakshatra: string;
  moonPhase: string;
  retrogradePlanets: string[];
  combustPlanets: string[];
  elementSummary: { agni: number; prithvi: number; vayu: number; jal: number };
  qualitySummary: { chara: number; sthira: number; dvisvabhav: number };
  multiIndicatorCount: number;
  appliedRuleCount: number;
  directionScoreTable: DirectionScore[];
}

export interface AarjeResearchRecord {
  id: string;
  recordId: string;
  serialNo: string;
  querierName: string;
  itemName: string;
  estimatedDirection: string;
  actualDirection: string;
  estimatedPlace: string;
  actualPlace: string;
  isDirectionMatch: boolean;
  isPlaceMatch: boolean;
  engineVersion: string;
  testedAt: string;
  notes: string;
}

export interface AarjeAnalysisResult {
  engineVersion: string;
  prashnaTimeBS: string;
  prashnaTimeAD: string;
  prashnaLocationName: string;
  
  // Astrological Data calculated for Prashna
  lagnaRashi: string;
  lagnaLord: string;
  moonRashi: string;
  moonNakshatra: string;
  tithi: string;
  vara: string;
  
  // Three Layer Direction
  threeLayerDirection: ThreeLayerDirectionInfo;
  probableDirection: string;
  directionAstrologicalReason: string;
  
  // Place & Environment
  probablePlaceCategory: string;
  placeAstrologicalReason: string;
  
  // House Analysis
  houseAnalysis: HouseAnalysisInfo[];
  
  // Outcomes
  probableCondition: string;
  conditionAstrologicalReason: string;
  
  recoveryChancePercentage: number;
  confidenceLevel: 'उच्च' | 'मध्यम' | 'कम';
  
  appliedRules: AarjeRule[];
  calculationDetails: AarjeCalculationDetails;
  
  stolenAnalysis?: {
    isStolenConfirmedByChart: boolean;
    natureOfInvolvement: string;
    disclaimerNotice: string;
  };
  
  recommendedSearchAreas: string[];
  safetyAndLegalGuidance: string[];
  astrologerInterpretation: string;
}

