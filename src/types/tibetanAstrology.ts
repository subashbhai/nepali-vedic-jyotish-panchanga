/**
 * Types and Interfaces for Tibetan Astrology (नेमा ज्योतिष / འབྱུང་རྩིས་ དང་ དཀར་རྩིས་)
 * Brihat Jyotish Professional ERP
 */

export type TibetanElementId = 'wood' | 'fire' | 'earth' | 'iron' | 'water';

export interface TibetanElement {
  id: TibetanElementId;
  nameNepali: string;
  nameTibetan: string;
  nameEnglish: string;
  color: string;
  hexColor: string;
  badgeBg: string;
  directionNepali: string;
  generatingElement: TibetanElementId; // Mother
  controllingElement: TibetanElementId; // Enemy
}

export type TibetanAnimalId =
  | 'mouse'
  | 'ox'
  | 'tiger'
  | 'rabbit'
  | 'dragon'
  | 'snake'
  | 'horse'
  | 'sheep'
  | 'monkey'
  | 'bird'
  | 'dog'
  | 'pig';

export interface TibetanAnimal {
  id: TibetanAnimalId;
  index: number; // 0 to 11
  nameNepali: string;
  nameTibetan: string;
  nameEnglish: string;
  fixedElementId: TibetanElementId;
  directionNepali: string;
  nature: 'याङ (पुरुष)' | 'यिन (स्त्री)';
  trineGroupNepali: string;
  compatibleAnimalsNepali: string[];
  enemyAnimalNepali: string;
  soulDayNepali: string; // Sog-za (जीवन वार)
  dangerDayNepali: string; // She-za (संकट वार)
}

export interface TibetanYearInfo {
  gregorianYear: number;
  tibetanYear: number;
  rabjungNumber: number; // e.g. 17th Rabjung
  rabjungYearInCycle: number; // 1 to 60
  animal: TibetanAnimal;
  element: TibetanElement;
  polarity: 'याङ (पुरुष)' | 'यिन (स्त्री)';
  tibetanYearNameNepali: string;
  losarDateAD: string;
  isBeforeLosar: boolean;
}

export interface TibetanLifeForceDimension {
  id: 'sog' | 'lu' | 'wang' | 'lungta' | 'la';
  titleNepali: string;
  nameTibetan: string;
  dimensionMeaning: string;
  element: TibetanElement;
  relationWithYearElement: 'माता' | 'पुत्र' | 'मित्र' | 'शत्रु' | 'स्व';
  strengthPercentage: number;
  levelNepali: 'अत्यन्त सबल' | 'उत्तम' | 'मध्यम' | 'सावधानी' | 'कमजोर';
  traditionalSignificance: string;
  supportingRemedy: string;
}

export interface TibetanLifeForces {
  sog: TibetanLifeForceDimension; // Life force (आत्मा-प्राण)
  lu: TibetanLifeForceDimension; // Body / health (शारीरिक धातु)
  wang: TibetanLifeForceDimension; // Power / status (सामर्थ्य-प्रभाव)
  lungta: TibetanLifeForceDimension; // Windhorse / fortune (भाग्य-यश)
  la: TibetanLifeForceDimension; // Soul-essence (सूक्ष्म चेतना)
  overallVitalityScore: number; // 0 - 100
  overallVitalityStatusNepali: string;
}

export interface TibetanMewa {
  number: number; // 1 to 9
  nameNepali: string;
  nameTibetan: string;
  element: TibetanElement;
  directionNepali: string;
  colorNameNepali: string;
  hexColor: string;
  symbolNepali: string;
  qualityNepali: string;
  karmicTendencyNepali: string;
  favorableActivities: string[];
  cautions: string[];
  turtlePartNepali?: string;
  protectiveDeityNepali?: string;
  sacredMantra?: string;
  pastLifeOriginNepali?: string;
  personalityDeepNepali?: string;
  tibetanRemediesNepali?: string[];
  elementHarmony?: {
    motherElement: string;
    childElement: string;
    friendElement: string;
    enemyElement: string;
  };
}

export type TibetanParkhaId = 'li' | 'khon' | 'dha' | 'khim' | 'gam' | 'gin' | 'zon' | 'zin';

export interface DirectionalGuide {
  category: 'अतिशुभ' | 'शुभ' | 'मध्यम' | 'प्रतिकूल' | 'हानिकारक';
  tibetanTerm: string;
  nameNepali: string;
  direction: string;
  effectNepali: string;
}

export interface TibetanParkha {
  id: TibetanParkhaId;
  index: number; // 0 to 7
  nameNepali: string;
  nameTibetan: string;
  trigramSymbol: string;
  element: TibetanElement;
  directionNepali: string;
  natureNepali: string;
  symbolismNepali: string;
  directions: DirectionalGuide[];
}

export type EvidenceStatus =
  | 'VERIFIED CLASSICAL'
  | 'TRADITIONAL SOURCE'
  | 'SECONDARY SOURCE'
  | 'RESEARCH/HISTORICAL'
  | 'UNVERIFIED'
  | 'EXPERIMENTAL';

export interface TibetanRuleEvidence {
  ruleId: string;
  system: 'ज्युङ्ची (Elemental Astrological)' | 'कार्ची (Astronomical)' | 'याङ्चार (Vocal/Breath)';
  tradition: 'फुगपा परम्परा (Phugpa)' | 'छुरफु परम्परा (Tsurphu)' | 'वैदूर्य कार्पो (Vaidurya Karpo)';
  topic: string;
  condition: string;
  calculationBasis: string;
  interpretation: string;
  sourceType: EvidenceStatus;
  sourceTitle: string;
  author: string;
  chapter: string;
  pageOrVerse?: string;
  verified: boolean;
  confidence: number;
  notesNepali: string;
}

export interface TibetanPredictionItem {
  topicId: string;
  categoryNepali: string;
  titleNepali: string;
  headlineNepali: string;
  detailedTextNepali: string;
  strengthStatus: 'शुभ' | 'उत्तम' | 'मध्यम' | 'सावधानी' | 'प्रतिकूल';
  favorableIndicators: string[];
  challengingIndicators: string[];
  remediesNepali: string[];
  evidence: TibetanRuleEvidence;
}

export interface TibetanCompatibilityDimensionRow {
  id: string;
  titleNepali: string;
  category: 'animal' | 'element' | 'mewa' | 'parkha' | 'lifeforce';
  weightagePercentage: number;
  boyValue: {
    nameNepali: string;
    nameTibetan?: string;
    colorBadge: string;
    symbol?: string;
    detail: string;
  };
  girlValue: {
    nameNepali: string;
    nameTibetan?: string;
    colorBadge: string;
    symbol?: string;
    detail: string;
  };
  classicalRelation: string;
  levelBadge: {
    text: string;
    badgeClass: string;
  };
  score: number;
  maxScore: number;
  interpretationNepali: string;
  remedyNepali: string;
}

export interface TibetanLifeForceComparisonRow {
  dimensionId: 'sog' | 'lu' | 'wang' | 'lungta' | 'la';
  titleNepali: string;
  nameTibetan: string;
  meaningNepali: string;
  boyElement: TibetanElement;
  girlElement: TibetanElement;
  relation: 'माता' | 'पुत्र' | 'मित्र' | 'स्व' | 'शत्रु';
  statusLabel: string;
  score: number;
  maxScore: number;
  badgeClass: string;
  harmonyNoteNepali: string;
}

export interface TibetanCompatibilityResult {
  boyAnimal: TibetanAnimal;
  girlAnimal: TibetanAnimal;
  animalHarmonyStatus: 'अति अनुकूल (त्रि-सङ्गम)' | 'मित्रवत (अनुकूल)' | 'सामान्य (तटस्थ)' | 'चुनौतीपूर्ण (षष्ठ-अष्टक)' | 'शत्रुवत (द्वन्द्व)';
  animalScore: number; // out of 25

  boyElement: TibetanElement;
  girlElement: TibetanElement;
  elementRelation: 'माता-पुत्र (शुभ)' | 'मित्र-सम्बन्ध (उत्तम)' | 'समान तत्व (सम)' | 'शत्रु सम्बन्ध (सावधानी)';
  elementScore: number; // out of 25

  boyMewa: TibetanMewa;
  girlMewa: TibetanMewa;
  mewaHarmonyStatus: 'परम मित्र' | 'मित्र' | 'सम' | 'शत्रु';
  mewaScore: number; // out of 20

  boyParkha: TibetanParkha;
  girlParkha: TibetanParkha;
  parkhaHarmonyStatus: 'सोग्चो (प्राणदाता)' | 'नाममेन (शान्ति)' | 'लुए (मध्यम)' | 'छ्याक (सावधानी)';
  parkhaScore: number; // out of 15

  lifeForceBalanceScore: number; // out of 15
  lifeForceStatus: string;

  totalCompatibilityPercentage: number; // 0 to 100
  overallVerdictNepali: 'अति उत्तम मिलान' | 'उत्तम मिलान' | 'मध्यम तर उपाययोग्य' | 'विशेष विचारणीय / सावधानी आवश्यक';
  strengthsSummary: string[];
  challengesSummary: string[];
  traditionalHarmonizingAdvice: string[];
  evidence: TibetanRuleEvidence;

  // Rich interpretation table data
  dimensionRows: TibetanCompatibilityDimensionRow[];
  lifeForceRows: TibetanLifeForceComparisonRow[];
  elementCycleDetails: {
    cycleType: string;
    mediatingElement?: TibetanElement;
    explanationNepali: string;
    remedyRitualNepali: string;
  };
  mewaPairingDetails: {
    karmicBondNepali: string;
    colorHarmonyNepali: string;
    explanationNepali: string;
    remedyNepali: string;
  };
  animalPairingDetails: {
    relationshipCategory: string;
    nameTibetan: string;
    explanationNepali: string;
    remedyNepali: string;
  };
}

export interface TibetanAuditRecord {
  calculationTimestamp: string;
  inputHash: string;
  profileId?: string;
  clientName: string;
  birthDateAD: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  rabjungCycle: number;
  computedYearAnimal: string;
  computedYearElement: string;
  computedNatalMewa: number;
  computedNatalParkha: string;
  engineVersion: string;
  sourceVersion: string;
  ruleCountApplied: number;
}
