import { 
  PlanetPosition, 
  LagnaInfo, 
  PlanetName, 
  RashiName, 
  VimshottariDashaResult, 
  DivisionalChart,
  DivisionalChartType 
} from '../types/astrology';
import { toDevanagariNumerals } from './nepaliCalendar';
import { generateDivisionalChart } from './astroCalculations';
import { 
  BPHS_GRAHA_SWAROOPA, 
  BPHS_BHAVA_SHLOKAS, 
  BPHSClassicalShloka 
} from './brihatParasharaDatabase';

export type DignityType = 
  | 'उच्च' 
  | 'नीच' 
  | 'मूलत्रिकोण' 
  | 'स्वक्षेत्र' 
  | 'मित्रराशि' 
  | 'समराशि' 
  | 'शत्रुराशि';

export interface DignityDetail {
  dignity: DignityType;
  badgeColor: string;
  explanationNepali: string;
}

export interface RelationshipDetail {
  rashiLord: PlanetName;
  naturalRelation: 'मित्र' | 'शत्रु' | 'सम' | 'स्वयम्';
  compoundRelation: 'अति मित्र' | 'मित्र' | 'सम' | 'शत्रु' | 'अति शत्रु' | 'स्वक्षेत्र';
  summaryNepali: string;
}

export interface BhaveshLordshipInfo {
  ownedHouseNumbers: number[];
  lordshipTitlesNepali: string[]; // e.g., ["लग्नेश (१ औँ भाव)", "अष्टमेश (८ औँ भाव)"]
  summaryNepali: string;
}

export interface AspectCastDetail {
  targetHouse: number;
  targetRashi: RashiName;
  aspectType: string; // e.g. "७ औँ दृष्टि (१००%)", "४ औँ विशेष दृष्टि"
  planetsInHouse: PlanetName[];
  effectSummaryNepali: string;
}

export interface AspectReceivedDetail {
  aspectingPlanet: PlanetName;
  fromHouse: number;
  aspectType: string;
  nature: 'शुभ' | 'अशुभ' | 'मिश्रित';
  effectSummaryNepali: string;
}

export interface ConjunctionDetail {
  planet: PlanetName;
  degreeDistance: string;
  relationType: string;
  effectSummaryNepali: string;
}

export interface NakshatraAnalysisDetail {
  nakshatraName: string;
  pada: number;
  nakshatraLord: PlanetName;
  lordHousePosition?: number;
  lordRashiName?: RashiName;
  lordDignity?: DignityType;
  summaryNepali: string;
}

export interface DashaRelevanceDetail {
  isActiveInDasha: boolean;
  dashaRoleNepali: string; // e.g. "वर्तमान महादशा स्वामी", "वर्तमान अन्तर्दशा स्वामी", "कुनै सक्रिय भूमिका छैन"
  explanationNepali: string;
}

export interface VargaStatusDetail {
  vargaType: DivisionalChartType;
  vargaTitleNepali: string;
  rashiName: RashiName;
  houseNumber: number;
  dignity: DignityType;
  isVargottama: boolean;
}

export interface DetailedGrahaAnalysis {
  planet: PlanetPosition;
  lagna: LagnaInfo;
  
  // Basic info
  rashiName: RashiName;
  houseNumber: number;
  formattedDegree: string;
  speedMotionNepali: string; // "मार्गी" | "वक्री"
  combustStatusNepali: string; // "अस्त" | "उदय (स्पष्ट)"
  
  // Dignity
  dignityDetail: DignityDetail;
  
  // Planetary Relationship
  relationshipDetail: RelationshipDetail;
  
  // House & Lordship
  bhavaSignificationsNepali: string;
  lordshipInfo: BhaveshLordshipInfo;
  housePositionImpactNepali: string;
  
  // Aspects
  aspectsCast: AspectCastDetail[];
  aspectsReceived: AspectReceivedDetail[];
  
  // Conjunctions
  conjunctions: ConjunctionDetail[];
  
  // Nakshatra
  nakshatraDetail: NakshatraAnalysisDetail;
  
  // Dasha
  dashaDetail: DashaRelevanceDetail;
  
  // Varga Charts Summary
  vargaStatuses: VargaStatusDetail[];
  isVargottama: boolean;
  
  // Natural Karakatwa
  naturalKarakatwaNepali: string[];
  
  // Synthesized Faladesh
  overallFaladeshNepali: string;
  positivePoints: string[];
  challengePoints: string[];
  lifeAreasImpacted: Array<{
    areaName: string;
    impactType: 'अनुकूल' | 'चुनौतीपूर्ण' | 'सन्तुलित';
    descriptionNepali: string;
  }>;
  recommendedRemedies: string[];
  
  // Explainable Astrology Basis (फलादेशको आधार)
  astrologicalBasisChecklist: string[];
  
  // Brihat Parashara Classical Proof (बृहत्पाराशर होराशास्त्रम् प्रमाण श्लोक)
  classicalProof: BPHSClassicalShloka;
  bhavaShloka?: {
    sanskritVerse: string;
    sourceChapter: string;
    wordMeaningNepali: string;
    classicalEffectNepali: string;
  };
}

// Map of Sign Lords
const SIGN_LORDS_MAP: Record<number, PlanetName> = {
  1: 'मंगल',  // मेष
  2: 'शुक्र',  // वृष
  3: 'बुध',   // मिथुन
  4: 'चन्द्र', // कर्कट
  5: 'सूर्य',  // सिंह
  6: 'बुध',   // कन्या
  7: 'शुक्र',  // तुला
  8: 'मंगल',  // वृश्चिक
  9: 'गुरु',  // धनु
  10: 'शनि', // मकर
  11: 'शनि', // कुम्भ
  12: 'गुरु', // मीन
};

// House Significations Database
const BHAVA_SIGNIFICATIONS: Record<number, { title: string; keywords: string; domain: string }> = {
  1: { title: 'प्रथम भाव (लग्न)', keywords: 'शरीर, व्यक्तित्व, स्वास्थ्य, जीवनदृष्टि', domain: 'आत्मविकास, शारीरिक बल र व्यक्तित्व' },
  2: { title: 'द्वितीय भाव (धन)', keywords: 'धन, परिवार, वाणी, भोजन, सञ्चित कोष', domain: 'आर्थिक स्थिति, पारिवारिक सुख र बोली' },
  3: { title: 'तृतीय भाव (पराक्रम)', keywords: 'साहस, सहोदर भाइ-बहिनी, सञ्चार, यात्रा', domain: 'पराक्रम, भाइ-बहिनी सम्बन्ध र उद्यम' },
  4: { title: 'चतुर्थ भाव (सुख)', keywords: 'माता, घर, भूमि, वाहन, आन्तरिक शान्ति', domain: 'गृहसुख, माताको स्वास्थ्य र सवारी साधन' },
  5: { title: 'पञ्चम भाव (बुद्धि)', keywords: 'शिक्षा, सन्तान, विवेक, सिर्जनशीलता, पूर्वपुण्य', domain: 'उच्च ज्ञान, सन्तान सुख र निर्णयक्षमता' },
  6: { title: 'षष्ठ भाव (रिपु)', keywords: 'रोग, ऋण, शत्रु, प्रतिस्पर्धा, सेवा', domain: 'प्रतिस्पर्धी क्षमता, स्वास्थ्य र ऋण/शत्रु निवारण' },
  7: { title: 'सप्तम भाव (कलत्र)', keywords: 'विवाह, वैवाहिक सुख, साझेदारी, सार्वजनिक सम्बन्ध', domain: 'दाम्पत्य जीवन, व्यापारिक साझेदारी र जनसम्पर्क' },
  8: { title: 'अष्टम भाव (आयु)', keywords: 'आयु, परिवर्तन, गूढ ज्ञान, आकस्मिक लाभ/हानि', domain: 'दीर्घायु, अनुसन्धान र गुप्त विद्या' },
  9: { title: 'नवम भाव (भाग्य)', keywords: 'धर्म, गुरु, भाग्य, उच्च अध्ययन, धार्मिक यात्रा', domain: 'भाग्यवृद्धि, आध्यात्मिक प्रगति र उच्च अध्ययन' },
  10: { title: 'दशम भाव (कर्म)', keywords: 'कर्म, पेशा, प्रतिष्ठा, उत्तरदायित्व, अधिकार', domain: 'व्यावसायिक प्रगति, प्रतिष्ठा र पदोन्नति' },
  11: { title: 'एकादश भाव (लाभ)', keywords: 'आय, लाभ, मित्र, इच्छापूर्ति, सिद्धि', domain: 'आर्थिक लाभ, मित्रमण्डली र सफलता' },
  12: { title: 'द्वादश भाव (व्यय)', keywords: 'खर्च, विदेश, एकान्त, मोक्ष, अस्पताल/त्याग', domain: 'वैदेशिक यात्रा, अध्यात्म र खर्च व्यवस्थापन' },
};

// Natural Karakatwa Map
const NATURAL_KARAKATWA: Record<PlanetName, string[]> = {
  'सूर्य': ['आत्मबल र दृढ संकल्प', 'पिता र अभिभावकत्व', 'नेतृत्वदायी क्षमता र अधिकार', 'सामाजिक प्रतिष्ठा र राज्य सम्मान', 'शारीरिक ऊर्जा र मुटु/आँखा'],
  'चन्द्र': ['मन र आन्तरिक भावना', 'माता र मातृसुख', 'मानसिक शान्ति र भावुकता', 'जल, तरल पदार्थ र जनसम्पर्क', 'कल्पनाशीलता र सिर्जना'],
  'मंगल': ['साहस, पराक्रम र ऊर्जा', 'भूमि, भवन र स्थिर सम्पत्ति', 'भाइ-बहिनी (विशेष गरी भाइ)', 'इन्जिनियरिङ, प्राविधिक र सुरक्षा', 'प्रतिस्पर्धात्मक क्षमता'],
  'बुध': ['बुद्धि, विवेक र गणना', 'वाणी, संवाद र लेखन', 'व्यापार र व्यावसायिक कुशलता', 'शिक्षा, गणित र सूचना प्रविधि', 'मामाघर र मित्रमण्डली'],
  'गुरु': ['ज्ञान, धर्म र विवेक', 'गुरु, मार्गदर्शन र सल्लाह', 'सन्तान सुख र वंश वृद्धि', 'धन, समृद्धि र विस्तार', 'अध्यात्म र सदाचार'],
  'शुक्र': ['प्रेम, विवाह र सम्बन्ध', 'सौन्दर्य, कला र सङ्गीत', 'भौतिक सुविधा र वाहन सुख', 'विलासिता र आकर्षण', 'व्यापारिक तथा जनसम्पर्क'],
  'शनि': ['कर्म, अनुशासन र कर्तव्य', 'धैर्य, श्रम र लगनशीलता', 'दीर्घकालीन सफलता र स्थायित्व', 'सेवाभाव र न्यायप्रियता', 'आयु र पुराना कुरा'],
  'राहु': ['नयाँ प्रविधि र आउट-अफ-द-बक्स सोच', 'वैदेशिक सम्बन्ध र दूरयात्रा', 'असामान्य चाहना र महत्त्वाकांक्षा', 'अनुसन्धान र प्राविधिक ज्ञान', 'अकास्मिक अवसर'],
  'केतु': ['अध्यात्म र मोक्ष चिन्तन', 'अनुसन्धान र गूढ विद्या', 'निःस्वार्थ त्याग र विरक्ति', 'अन्तर्दृष्टि र सात्विक बुद्धि', 'परम्परागत चिकित्सा'],
};

// Natural Friendships Matrix
const NATURAL_FRIENDS: Record<PlanetName, { friends: PlanetName[]; enemies: PlanetName[]; neutrals: PlanetName[] }> = {
  'सूर्य': { friends: ['चन्द्र', 'मंगल', 'गुरु'], enemies: ['शुक्र', 'शनि', 'राहु', 'केतु'], neutrals: ['बुध'] },
  'चन्द्र': { friends: ['सूर्य', 'बुध'], enemies: ['राहु', 'केतु'], neutrals: ['मंगल', 'गुरु', 'शुक्र', 'शनि'] },
  'मंगल': { friends: ['सूर्य', 'चन्द्र', 'गुरु'], enemies: ['बुध', 'राहु', 'केतु'], neutrals: ['शुक्र', 'शनि'] },
  'बुध': { friends: ['सूर्य', 'शुक्र'], enemies: ['चन्द्र'], neutrals: ['मंगल', 'गुरु', 'शनि', 'राहु', 'केतु'] },
  'गुरु': { friends: ['सूर्य', 'चन्द्र', 'मंगल'], enemies: ['बुध', 'शुक्र'], neutrals: ['शनि', 'राहु', 'केतु'] },
  'शुक्र': { friends: ['बुध', 'शनि', 'राहु', 'केतु'], enemies: ['सूर्य', 'चन्द्र'], neutrals: ['मंगल', 'गुरु'] },
  'शनि': { friends: ['बुध', 'शुक्र', 'राहु'], enemies: ['सूर्य', 'चन्द्र', 'मंगल'], neutrals: ['गुरु', 'केतु'] },
  'राहु': { friends: ['शुक्र', 'शनि', 'बुध'], enemies: ['सूर्य', 'चन्द्र', 'मंगल'], neutrals: ['गुरु', 'केतु'] },
  'केतु': { friends: ['मंगल', 'गुरु', 'शुक्र'], enemies: ['सूर्य', 'चन्द्र'], neutrals: ['बुध', 'शनि', 'राहु'] },
};

/**
 * Calculates Planet Dignity with exact degree rules and rationale.
 */
export function calculateDignityDetail(planet: PlanetName, rashiId: number, degree: number): DignityDetail {
  // Exaltation (उच्च) and Debilitation (नीच) definitions
  if (planet === 'सूर्य') {
    if (rashiId === 1) return { dignity: 'उच्च', badgeColor: 'bg-amber-600 text-white', explanationNepali: 'सूर्य मेष राशिमा १०° मा परम उच्च मानिन्छ। यसले आत्मबल र नेतृत्व क्षमतालाई अत्यन्त बलिष्ठ बनाउँछ।' };
    if (rashiId === 7) return { dignity: 'नीच', badgeColor: 'bg-rose-600 text-white', explanationNepali: 'सूर्य तुला राशिमा १०° मा नीच मानिन्छ। यसले आत्मबलमा संशय वा अहम् सम्बन्धित चुनौती ल्याउन सक्छ।' };
    if (rashiId === 5) {
      if (degree <= 20) return { dignity: 'मूलत्रिकोण', badgeColor: 'bg-emerald-600 text-white', explanationNepali: 'सूर्य सिंह राशिमा ०°-२०° सम्म मूलत्रिकोण अवस्थामा रहन्छ, जुन अत्यन्त शुभ र शक्तिशाली स्थिति हो।' };
      return { dignity: 'स्वक्षेत्र', badgeColor: 'bg-amber-500 text-white', explanationNepali: 'सूर्य आफ्नै सिंह राशिमा स्वक्षेत्री भएर बसेको छ।' };
    }
  }

  if (planet === 'चन्द्र') {
    if (rashiId === 2) {
      if (degree <= 3) return { dignity: 'उच्च', badgeColor: 'bg-sky-600 text-white', explanationNepali: 'चन्द्रमा वृष राशिमा ३° मा परम उच्च मानिन्छ, जसले उच्च मानसिक शान्ति र भावनात्मक समृद्धि दिन्छ।' };
      return { dignity: 'मूलत्रिकोण', badgeColor: 'bg-emerald-600 text-white', explanationNepali: 'चन्द्रमा वृष राशिमा ४°-३०° सम्म मूलत्रिकोण क्षेत्रमा रहन्छ।' };
    }
    if (rashiId === 8) return { dignity: 'नीच', badgeColor: 'bg-rose-600 text-white', explanationNepali: 'चन्द्रमा वृश्चिक राशिमा ३° मा नीच मानिन्छ। यसले मनमा चञ्चलता वा भावनात्मक उतारचढाव गराउन सक्छ।' };
    if (rashiId === 4) return { dignity: 'स्वक्षेत्र', badgeColor: 'bg-sky-500 text-white', explanationNepali: 'चन्द्रमा आफ्नै कर्कट राशिमा स्वगृही छ।' };
  }

  if (planet === 'मंगल') {
    if (rashiId === 10) return { dignity: 'उच्च', badgeColor: 'bg-rose-600 text-white', explanationNepali: 'मंगल मकर राशिमा २८° मा परम उच्च हुन्छ। यसले पराक्रम, प्राविधिक र कार्यकुशलतामा अद्वितीय सफलता दिन्छ।' };
    if (rashiId === 4) return { dignity: 'नीच', badgeColor: 'bg-rose-700 text-white', explanationNepali: 'मंगल कर्कट राशिमा २८° मा नीच हुन्छ। यसले आवेश वा उग्रता नियन्त्रण गर्नुपर्ने संकेत गर्दछ।' };
    if (rashiId === 1) {
      if (degree <= 12) return { dignity: 'मूलत्रिकोण', badgeColor: 'bg-emerald-600 text-white', explanationNepali: 'मंगल मेष राशिमा ०°-१२° सम्म मूलत्रिकोण स्थितिमा हुन्छ।' };
      return { dignity: 'स्वक्षेत्र', badgeColor: 'bg-rose-500 text-white', explanationNepali: 'मंगल आफ्नै मेष राशिमा स्वक्षेत्री छ।' };
    }
    if (rashiId === 8) return { dignity: 'स्वक्षेत्र', badgeColor: 'bg-rose-500 text-white', explanationNepali: 'मंगल आफ्नै वृश्चिक राशिमा स्वक्षेत्री छ।' };
  }

  if (planet === 'बुध') {
    if (rashiId === 6) {
      if (degree <= 15) return { dignity: 'उच्च', badgeColor: 'bg-emerald-600 text-white', explanationNepali: 'बुध कन्या राशिमा १५° सम्म परम उच्च हुन्छ, जसले तीक्ष्ण बुद्धि र विश्लेषणात्मक क्षमता प्रदान गर्दछ।' };
      if (degree <= 20) return { dignity: 'मूलत्रिकोण', badgeColor: 'bg-emerald-500 text-white', explanationNepali: 'बुध कन्या राशिमा १६°-२०° सम्म मूलत्रिकोण अवस्थामा हुन्छ।' };
      return { dignity: 'स्वक्षेत्र', badgeColor: 'bg-emerald-500 text-white', explanationNepali: 'बुध आफ्नै कन्या राशिमा स्वगृही छ।' };
    }
    if (rashiId === 12) return { dignity: 'नीच', badgeColor: 'bg-rose-600 text-white', explanationNepali: 'बुध मीन राशिमा १५° मा नीच हुन्छ। यसले निर्णय क्षमतामा अन्योल वा एकाग्रताको कमी ल्याउन सक्छ।' };
    if (rashiId === 3) return { dignity: 'स्वक्षेत्र', badgeColor: 'bg-emerald-500 text-white', explanationNepali: 'बुध आफ्नै मिथुन राशिमा स्वक्षेत्री छ।' };
  }

  if (planet === 'गुरु') {
    if (rashiId === 4) return { dignity: 'उच्च', badgeColor: 'bg-amber-600 text-white', explanationNepali: 'बृहस्पति कर्कट राशिमा ५° मा परम उच्च मानिन्छ। यसले ज्ञान, सदाचार र ईश्वरीय कृपा प्रचुर मात्रामा दिन्छ।' };
    if (rashiId === 10) return { dignity: 'नीच', badgeColor: 'bg-rose-600 text-white', explanationNepali: 'बृहस्पति मकर राशिमा ५° मा नीच हुन्छ। यसले ज्ञानको व्यावहारिक प्रयोगमा केही मन्दता ल्याउन सक्छ।' };
    if (rashiId === 9) {
      if (degree <= 10) return { dignity: 'मूलत्रिकोण', badgeColor: 'bg-emerald-600 text-white', explanationNepali: 'गुरु धनु राशिमा ०°-१०° सम्म मूलत्रिकोण स्थितिमा हुन्छ।' };
      return { dignity: 'स्वक्षेत्र', badgeColor: 'bg-amber-500 text-white', explanationNepali: 'गुरु आफ्नै धनु राशिमा स्वगृही छ।' };
    }
    if (rashiId === 12) return { dignity: 'स्वक्षेत्र', badgeColor: 'bg-amber-500 text-white', explanationNepali: 'गुरु आफ्नै मीन राशिमा स्वगृही छ।' };
  }

  if (planet === 'शुक्र') {
    if (rashiId === 12) return { dignity: 'उच्च', badgeColor: 'bg-purple-600 text-white', explanationNepali: 'शुक्र मीन राशिमा २७° मा परम उच्च हुन्छ, जसले कला, सौन्दर्य र दाम्पत्य सुखमा पूर्णता ल्याउँछ।' };
    if (rashiId === 6) return { dignity: 'नीच', badgeColor: 'bg-rose-600 text-white', explanationNepali: 'शुक्र कन्या राशिमा २७° मा नीच हुन्छ। यसले सम्बन्धमा असन्तुष्टि वा अत्यधिक आलोचनात्मक प्रवृत्ति गराउन सक्छ।' };
    if (rashiId === 7) {
      if (degree <= 15) return { dignity: 'मूलत्रिकोण', badgeColor: 'bg-emerald-600 text-white', explanationNepali: 'शुक्र तुला राशिमा ०°-१५° सम्म मूलत्रिकोण अवस्थामा हुन्छ।' };
      return { dignity: 'स्वक्षेत्र', badgeColor: 'bg-purple-500 text-white', explanationNepali: 'शुक्र आफ्नै तुला राशिमा स्वगृही छ।' };
    }
    if (rashiId === 2) return { dignity: 'स्वक्षेत्र', badgeColor: 'bg-purple-500 text-white', explanationNepali: 'शुक्र आफ्नै वृष राशिमा स्वगृही छ।' };
  }

  if (planet === 'शनि') {
    if (rashiId === 7) return { dignity: 'उच्च', badgeColor: 'bg-slate-800 text-white', explanationNepali: 'शनि तुला राशिमा २०° मा परम उच्च हुन्छ। यसले न्यायप्रियता, दूरदर्शिता र अतुलनीय साङ्गठनिक क्षमता दिन्छ।' };
    if (rashiId === 1) return { dignity: 'नीच', badgeColor: 'bg-rose-600 text-white', explanationNepali: 'शनि मेष राशिमा २०° मा नीच हुन्छ। यसले कार्यसिद्धिमा ढिलाइ वा संघर्ष बढाउन सक्छ।' };
    if (rashiId === 11) {
      if (degree <= 20) return { dignity: 'मूलत्रिकोण', badgeColor: 'bg-emerald-600 text-white', explanationNepali: 'शनि कुम्भ राशिमा ०°-२०° सम्म मूलत्रिकोण स्थितिमा हुन्छ।' };
      return { dignity: 'स्वक्षेत्र', badgeColor: 'bg-slate-700 text-white', explanationNepali: 'शनि आफ्नै कुम्भ राशिमा स्वगृही छ।' };
    }
    if (rashiId === 10) return { dignity: 'स्वक्षेत्र', badgeColor: 'bg-slate-700 text-white', explanationNepali: 'शनि आफ्नै मकर राशिमा स्वगृही छ।' };
  }

  if (planet === 'राहु') {
    if (rashiId === 2 || rashiId === 3) return { dignity: 'उच्च', badgeColor: 'bg-teal-600 text-white', explanationNepali: 'राहु वृष/मिथुन राशिमा उच्च प्रभाव दिने मानिन्छ, जसले प्रविधि र आउट-अफ-द-बक्स सोचमा सफलता दिन्छ।' };
    if (rashiId === 8 || rashiId === 9) return { dignity: 'नीच', badgeColor: 'bg-rose-600 text-white', explanationNepali: 'राहु वृश्चिक/धनु राशिमा नीच मानिन्छ। यसले भ्रामक विचार वा निर्णयमा होसियारी माग्दछ।' };
    if (rashiId === 11) return { dignity: 'स्वक्षेत्र', badgeColor: 'bg-teal-500 text-white', explanationNepali: 'राहु कुम्भ राशिलाई आफ्नै क्षेत्रसरह मान्दछ।' };
  }

  if (planet === 'केतु') {
    if (rashiId === 8 || rashiId === 9) return { dignity: 'उच्च', badgeColor: 'bg-indigo-600 text-white', explanationNepali: 'केतु वृश्चिक/धनु राशिमा उच्च प्रभाव मानिन्छ, जसले गहिरो अनुसन्धान र सात्विक अन्तर्दृष्टि दिन्छ।' };
    if (rashiId === 2 || rashiId === 3) return { dignity: 'नीच', badgeColor: 'bg-rose-600 text-white', explanationNepali: 'केतु वृष/मिथुन राशिमा नीच स्थिति मानिन्छ।' };
    if (rashiId === 8) return { dignity: 'स्वक्षेत्र', badgeColor: 'bg-indigo-500 text-white', explanationNepali: 'केतु वृश्चिक राशिलाई स्वक्षेत्र सरह मान्दछ।' };
  }

  // Check relationship with Rashi Lord for Mitra / Sama / Shatru
  const rashiLord = SIGN_LORDS_MAP[rashiId];
  if (rashiLord === planet) {
    return { dignity: 'स्वक्षेत्र', badgeColor: 'bg-amber-500 text-white', explanationNepali: `${planet} आफ्नै राशिमा विराजमान छ।` };
  }

  const friendData = NATURAL_FRIENDS[planet];
  if (friendData?.friends.includes(rashiLord)) {
    return { dignity: 'मित्रराशि', badgeColor: 'bg-emerald-500 text-white', explanationNepali: `${planet} मित्र ग्रह ${rashiLord} को राशिमा रहेको हुँदा सकारात्मक र अनुकूल प्रभाव प्रदान गर्दछ।` };
  }
  if (friendData?.enemies.includes(rashiLord)) {
    return { dignity: 'शत्रुराशि', badgeColor: 'bg-rose-500 text-white', explanationNepali: `${planet} शत्रु ग्रह ${rashiLord} को क्षेत्रमा रहेको हुँदा ग्रहको स्वाभाविक कारकत्व प्रकट हुन केही चुनौती पर्न सक्छ।` };
  }

  return { dignity: 'समराशि', badgeColor: 'bg-stone-500 text-white', explanationNepali: `${planet} सम ग्रह ${rashiLord} को राशिमा तटस्थ स्थितिमा छ।` };
}

/**
 * Calculates Bhavesh (House Lordships) for a planet given the Lagna.
 */
export function calculateHouseLordships(planet: PlanetName, lagnaRashiId: number): BhaveshLordshipInfo {
  const ownedHouses: number[] = [];
  const titles: string[] = [];

  for (let house = 1; house <= 12; house++) {
    const houseRashiId = ((lagnaRashiId - 1 + house - 1) % 12) + 1;
    const lord = SIGN_LORDS_MAP[houseRashiId];

    if (lord === planet) {
      ownedHouses.push(house);

      let houseTerm = `भाव ${toDevanagariNumerals(house)}`;
      if (house === 1) houseTerm += ' (लग्नेश)';
      else if (house === 2) houseTerm += ' (द्वितीयेश/धनेश)';
      else if (house === 3) houseTerm += ' (तृतीयेश/पराक्रमेश)';
      else if (house === 4) houseTerm += ' (चतुर्थेश/सुखेश)';
      else if (house === 5) houseTerm += ' (पञ्चमेश/विद्येश)';
      else if (house === 6) houseTerm += ' (षष्ठेश/रोगेश)';
      else if (house === 7) houseTerm += ' (सप्तमेश/दाम्पत्येश)';
      else if (house === 8) houseTerm += ' (अष्टमेश/आयुषेश)';
      else if (house === 9) houseTerm += ' (नवमेश/भाग्येश)';
      else if (house === 10) houseTerm += ' (दशमेश/कर्मेश)';
      else if (house === 11) houseTerm += ' (एकादशेश/लाभेश)';
      else if (house === 12) houseTerm += ' (द्वादशेश/व्ययेश)';

      titles.push(houseTerm);
    }
  }

  if (ownedHouses.length === 0) {
    return {
      ownedHouseNumbers: [],
      lordshipTitlesNepali: ['छाया ग्रह (कुनै राशिको आधिपत्य हुँदैन)'],
      summaryNepali: `${planet} छाया ग्रह भएकाले यसको कुनै निश्चित राशिको आधिपत्य हुँदैन; यो बसेको भाव र राशिका आधारमा फल दिन्छ।`,
    };
  }

  const housesText = ownedHouses.map((h) => `${toDevanagariNumerals(h)} औँ`).join(' र ');
  const titlesText = titles.join(', ');

  return {
    ownedHouseNumbers: ownedHouses,
    lordshipTitlesNepali: titles,
    summaryNepali: `${planet} यस कुण्डलीमा ${titlesText} को रूपमा भूमिका निभाउँदछ।`,
  };
}

/**
 * Calculates aspects cast by this planet on other houses/planets.
 */
export function calculateAspectsCast(
  planet: PlanetPosition,
  allPlanets: PlanetPosition[],
  lagnaRashiId: number
): AspectCastDetail[] {
  const result: AspectCastDetail[] = [];
  const pHouse = planet.bhava;

  const targetDistances: Array<{ houseDist: number; aspectType: string }> = [];

  // 7th Aspect for ALL planets
  targetDistances.push({ houseDist: 7, aspectType: '७ औँ पूर्ण दृष्टि (१००%)' });

  // Special Aspects
  if (planet.name === 'मंगल') {
    targetDistances.push({ houseDist: 4, aspectType: '४ औँ विशेष दृष्टि (१००%)' });
    targetDistances.push({ houseDist: 8, aspectType: '८ औँ विशेष दृष्टि (१००%)' });
  }
  if (planet.name === 'गुरु' || planet.name === 'राहु' || planet.name === 'केतु') {
    targetDistances.push({ houseDist: 5, aspectType: '५ औँ विशेष दृष्टि (१००%)' });
    targetDistances.push({ houseDist: 9, aspectType: '९ औँ विशेष दृष्टि (१००%)' });
  }
  if (planet.name === 'शनि') {
    targetDistances.push({ houseDist: 3, aspectType: '३ औँ विशेष दृष्टि (१००%)' });
    targetDistances.push({ houseDist: 10, aspectType: '१० औँ विशेष दृष्टि (१००%)' });
  }

  targetDistances.forEach(({ houseDist, aspectType }) => {
    const targetHouse = ((pHouse - 1 + houseDist - 1) % 12) + 1;
    const targetRashiId = ((lagnaRashiId - 1 + targetHouse - 1) % 12) + 1;
    const rashiNamesList: RashiName[] = ['मेष', 'वृष', 'मिथुन', 'कर्कट', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन'];
    const targetRashi = rashiNamesList[targetRashiId - 1];

    const planetsInHouse = allPlanets.filter((p) => p.bhava === targetHouse).map((p) => p.name);
    const bhavaInfo = BHAVA_SIGNIFICATIONS[targetHouse];

    let effectSummary = `${planet.name} ले भाव ${toDevanagariNumerals(targetHouse)} (${targetRashi} राशि) मा दृष्टि दिँदा ${bhavaInfo?.domain || 'विषय'} मा प्रभाव पार्दछ।`;
    if (planetsInHouse.length > 0) {
      effectSummary += ` यस दृष्टिले त्यहाँ रहेका ग्रह (${planetsInHouse.join(', ')}) हरूलाई सक्रिय बनाउँछ।`;
    }

    result.push({
      targetHouse,
      targetRashi,
      aspectType,
      planetsInHouse,
      effectSummaryNepali: effectSummary,
    });
  });

  return result;
}

/**
 * Calculates aspects received by this planet from other planets.
 */
export function calculateAspectsReceived(
  planet: PlanetPosition,
  allPlanets: PlanetPosition[]
): AspectReceivedDetail[] {
  const result: AspectReceivedDetail[] = [];
  const targetHouse = planet.bhava;

  allPlanets.forEach((other) => {
    if (other.name === planet.name) return;

    const houseDist = ((targetHouse - other.bhava + 12) % 12) || 12;
    let hasAspect = false;
    let aspectType = '';

    if (houseDist === 7) {
      hasAspect = true;
      aspectType = '७ औँ समदृष्टि (१००%)';
    } else if (other.name === 'मंगल' && (houseDist === 4 || houseDist === 8)) {
      hasAspect = true;
      aspectType = `${houseDist} औँ मंगल विशेष दृष्टि`;
    } else if ((other.name === 'गुरु' || other.name === 'राहु' || other.name === 'केतु') && (houseDist === 5 || houseDist === 9)) {
      hasAspect = true;
      aspectType = `${houseDist} औँ विशेष दृष्टि`;
    } else if (other.name === 'शनि' && (houseDist === 3 || houseDist === 10)) {
      hasAspect = true;
      aspectType = `${houseDist} औँ शनि विशेष दृष्टि`;
    }

    if (hasAspect) {
      let nature: 'शुभ' | 'अशुभ' | 'मिश्रित' = 'मिश्रित';
      if (['गुरु', 'शुक्र', 'बुध'].includes(other.name)) nature = 'शुभ';
      else if (['शनि', 'मंगल', 'राहु', 'केतु'].includes(other.name)) nature = 'अशुभ';

      const effectSummary = `${other.name} ले भाव ${toDevanagariNumerals(other.bhava)} बाट ${planet.name} माथि ${aspectType} दिएको छ। यसले ${planet.name} को ऊर्जालाई ${nature === 'शुभ' ? 'सकारात्मक उकास्ने' : 'चुनौती र अनुशासन थप्ने'} काम गर्दछ।`;

      result.push({
        aspectingPlanet: other.name,
        fromHouse: other.bhava,
        aspectType,
        nature,
        effectSummaryNepali: effectSummary,
      });
    }
  });

  return result;
}

/**
 * Comprehensive Analysis Engine for a Single Planet
 */
export function analyzeGrahaDetailed(
  planet: PlanetPosition,
  lagna: LagnaInfo,
  allPlanets: PlanetPosition[],
  dasha?: VimshottariDashaResult,
  vargaCharts?: Record<string, DivisionalChart>
): DetailedGrahaAnalysis {
  const rashiLord = SIGN_LORDS_MAP[planet.rashiId];
  const rashiNamesList: RashiName[] = ['मेष', 'वृष', 'मिथुन', 'कर्कट', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन'];
  const rashiName = planet.rashiName || rashiNamesList[planet.rashiId - 1];

  // 1. Dignity
  const dignityDetail = calculateDignityDetail(planet.name, planet.rashiId, planet.degree);

  // 2. Relationship
  const naturalRel = NATURAL_FRIENDS[planet.name];
  let naturalRelationType: 'मित्र' | 'शत्रु' | 'सम' | 'स्वयम्' = 'सम';
  if (rashiLord === planet.name) naturalRelationType = 'स्वयम्';
  else if (naturalRel?.friends.includes(rashiLord)) naturalRelationType = 'मित्र';
  else if (naturalRel?.enemies.includes(rashiLord)) naturalRelationType = 'शत्रु';

  const relationshipDetail: RelationshipDetail = {
    rashiLord,
    naturalRelation: naturalRelationType,
    compoundRelation: naturalRelationType === 'स्वयम्' ? 'स्वक्षेत्र' : naturalRelationType === 'मित्र' ? 'मित्र' : naturalRelationType === 'शत्रु' ? 'शत्रु' : 'सम',
    summaryNepali: `${planet.name} ${rashiName} राशिमा स्थित छ, जसको स्वामी ${rashiLord} हुन्। निसर्ग सम्बन्ध अनुसार यी दुई बीच ${naturalRelationType} सम्बन्ध रहेको छ।`,
  };

  // 3. Bhava Significations & Lordship
  const bhavaInfo = BHAVA_SIGNIFICATIONS[planet.bhava];
  const lordshipInfo = calculateHouseLordships(planet.name, lagna.rashiId);

  const housePositionImpact = `${planet.name} ${bhavaInfo?.title || `भाव ${planet.bhava}`} मा रहने हुँदा ${bhavaInfo?.domain || 'सम्बन्धित विषय'} मा प्रत्यक्ष भूमिका खेल्दछ। ${lordshipInfo.summaryNepali}`;

  // 4. Aspects Cast & Received
  const aspectsCast = calculateAspectsCast(planet, allPlanets, lagna.rashiId);
  const aspectsReceived = calculateAspectsReceived(planet, allPlanets);

  // 5. Conjunctions
  const conjunctions: ConjunctionDetail[] = allPlanets
    .filter((other) => other.name !== planet.name && other.bhava === planet.bhava)
    .map((other) => {
      const degDiff = Math.abs(planet.longitude - other.longitude);
      const formattedDiff = `${Math.floor(degDiff)}° ${Math.round((degDiff % 1) * 60)}'`;
      return {
        planet: other.name,
        degreeDistance: formattedDiff,
        relationType: 'युति (Conjunction)',
        effectSummaryNepali: `${planet.name} र ${other.name} भाव ${toDevanagariNumerals(planet.bhava)} मा ${formattedDiff} को अन्तरमा युतिमा छन्, जसले दुवै ग्रहको संयुक्त प्रभाव निर्माण गर्छ।`,
      };
    });

  // 6. Nakshatra
  const nLordName = planet.nakshatraLord as PlanetName;
  const nLordObj = allPlanets.find((p) => p.name === nLordName);
  const nakshatraDetail: NakshatraAnalysisDetail = {
    nakshatraName: planet.nakshatraName,
    pada: planet.pada,
    nakshatraLord: nLordName,
    lordHousePosition: nLordObj?.bhava,
    lordRashiName: nLordObj?.rashiName,
    lordDignity: nLordObj ? calculateDignityDetail(nLordObj.name, nLordObj.rashiId, nLordObj.degree).dignity : undefined,
    summaryNepali: `${planet.name} ${planet.nakshatraName} नक्षत्रको ${toDevanagariNumerals(planet.pada)} औँ पादमा छ। नक्षत्र स्वामी ${nLordName} ${nLordObj ? `भाव ${toDevanagariNumerals(nLordObj.bhava)} (${nLordObj.rashiName}) मा ${nLordObj.dignity} स्थितिमा` : 'कुण्डलीमा'} विराजमान छन्।`,
  };

  // 7. Dasha Relevance
  let isActiveInDasha = false;
  let dashaRole = 'हालको विंशोत्तरी दशामा प्रत्यक्ष भूमिका छैन';
  let dashaExplanation = 'यो ग्रह वर्तमान सक्रिय दशा-भुक्तिमा मुख्य स्वामीको रूपमा छैन।';

  if (dasha) {
    if (dasha.currentMahadasha?.planet === planet.name) {
      isActiveInDasha = true;
      dashaRole = 'वर्तमान महादशा स्वामी (Primary Dasha Ruler)';
      dashaExplanation = `हाल ${planet.name} को महादशा चलिरहेको छ। यसले गर्दा यो ग्रह कुण्डलीको प्रमुख नियन्त्रक बनेको छ र यसका विषयहरू वर्तमान समयमा सर्वाधिक सक्रिय छन्।`;
    } else if (dasha.currentAntardasha?.planet === planet.name) {
      isActiveInDasha = true;
      dashaRole = 'वर्तमान अन्तर्दशा स्वामी (Sub-period Ruler)';
      dashaExplanation = `हाल ${planet.name} को अन्तर्दशा चलिरहेकाले यस ग्रहका फलहरू वर्तमान अवधिमा घनीभूत रूपमा प्रकट हुनेछन्।`;
    } else if (dasha.currentPratyantardasha?.planet === planet.name) {
      isActiveInDasha = true;
      dashaRole = 'वर्तमान प्रत्यन्तर्दशा स्वामी';
      dashaExplanation = `हाल ${planet.name} को सूक्ष्म प्रत्यन्तर्दशा सक्रिय छ।`;
    }
  }

  const dashaDetail: DashaRelevanceDetail = {
    isActiveInDasha,
    dashaRoleNepali: dashaRole,
    explanationNepali: dashaExplanation,
  };

  // 8. Varga Chart Statuses
  const vargaTypesList: DivisionalChartType[] = ['D1', 'D9', 'D10', 'D7', 'D12', 'D20', 'D24', 'D30', 'D60'];
  const vargaStatuses: VargaStatusDetail[] = [];
  let d1Sign: RashiName | undefined;
  let d9Sign: RashiName | undefined;

  vargaTypesList.forEach((vType) => {
    let chart: DivisionalChart;
    if (vargaCharts && vargaCharts[vType]) {
      chart = vargaCharts[vType];
    } else {
      chart = generateDivisionalChart(vType, lagna, allPlanets);
    }

    let foundRashi: RashiName = planet.rashiName;
    let foundHouse = planet.bhava;

    chart.houses.forEach((h) => {
      const foundInH = h.planets.find((p) => p.name === planet.name);
      if (foundInH) {
        foundRashi = h.rashiName;
        foundHouse = h.houseNumber;
      }
    });

    if (vType === 'D1') d1Sign = foundRashi;
    if (vType === 'D9') d9Sign = foundRashi;

    const rIdx = rashiNamesList.indexOf(foundRashi) + 1;
    const vDignity = calculateDignityDetail(planet.name, rIdx, 15).dignity;

    vargaStatuses.push({
      vargaType: vType,
      vargaTitleNepali: chart.titleNepali,
      rashiName: foundRashi,
      houseNumber: foundHouse,
      dignity: vDignity,
      isVargottama: vType === 'D9' && d1Sign === d9Sign && !!d1Sign,
    });
  });

  const isVargottama = !!d1Sign && !!d9Sign && d1Sign === d9Sign;

  // 9. Synthesized Overall Faladesh
  const positivePoints: string[] = [];
  const challengePoints: string[] = [];
  const basisChecklist: string[] = [];

  basisChecklist.push(`✓ ग्रह ${planet.name} भाव ${toDevanagariNumerals(planet.bhava)} (${rashiName} राशि) मा स्थित`);
  basisChecklist.push(`✓ ग्रह अवस्था: ${dignityDetail.dignity} (${dignityDetail.explanationNepali.slice(0, 40)}...)`);
  if (lordshipInfo.lordshipTitlesNepali.length > 0) {
    basisChecklist.push(`✓ स्वामित्व: ${lordshipInfo.lordshipTitlesNepali.join(', ')}`);
  }
  basisChecklist.push(`✓ नक्षत्र: ${planet.nakshatraName} (${toDevanagariNumerals(planet.pada)} पाद), स्वामी ${nLordName}`);

  if (dignityDetail.dignity === 'उच्च' || dignityDetail.dignity === 'स्वक्षेत्र' || dignityDetail.dignity === 'मूलत्रिकोण') {
    positivePoints.push(`${planet.name} ${dignityDetail.dignity} स्थितिमा भएकाले सम्बन्धित क्षेत्रमा बलियो सकारात्मक आधार दिन्छ।`);
  } else if (dignityDetail.dignity === 'नीच') {
    challengePoints.push(`${planet.name} नीच अवस्थामा रहेकाले यसका कारकत्वमा धैर्यता र विशेष प्रयत्न आवश्यक देखिन्छ।`);
  }

  if (isVargottama) {
    positivePoints.push(`${planet.name} डी-१ र डी-९ दुवैमा एउटै राशिमा (वर्गोत्तम) रहेकाले यसको क्षमता र शुभता दुईगुण हुन्छ।`);
    basisChecklist.push('✓ वर्गोत्तम स्थिति (D1 र D9 मा एउटै राशि)');
  }

  if (planet.isRetrograde) {
    challengePoints.push(`ग्रह वक्री भएकाले काममा दोहोऱ्याएर प्रयास गर्नुपर्ने वा आन्तरिक मूल्याङ्कन आवश्यक हुनसक्छ।`);
    basisChecklist.push('✓ वक्री गति (Retrograde)');
  }

  if (planet.isCombust) {
    challengePoints.push(`ग्रह सूर्यसँग अस्त भएकाले यसको कारकत्व बाहिरी रूपमा प्रकट हुन केही परिश्रम लाग्नेछ।`);
    basisChecklist.push('✓ सूर्यसँग अस्त (Combust)');
  }

  if (conjunctions.length > 0) {
    const conjNames = conjunctions.map((c) => c.planet).join(', ');
    positivePoints.push(`भाव ${toDevanagariNumerals(planet.bhava)} मा ${conjNames} सँगको युतिले बहुआयामिक प्रभाव निर्माण गरेको छ।`);
    basisChecklist.push(`✓ युति: ${conjNames} सँग एउटै भावमा`);
  }

  if (aspectsReceived.length > 0) {
    const aspNames = aspectsReceived.map((a) => a.aspectingPlanet).join(', ');
    basisChecklist.push(`✓ प्राप्त दृष्टि: ${aspNames} बाट`);
  }

  if (isActiveInDasha) {
    basisChecklist.push(`✓ विंशोत्तरी दशा: ${dashaRole}`);
  }

  let overallFaladesh = `${planet.name} ग्रह ${rashiName} राशि र ${toDevanagariNumerals(planet.bhava)} औँ भावमा ${dignityDetail.dignity} स्थितिमा रहेको छ। `;
  overallFaladesh += `${housePositionImpact} `;
  if (positivePoints.length > 0) {
    overallFaladesh += `अनुकूल पक्षतर्फ ${positivePoints[0]} `;
  }
  if (challengePoints.length > 0) {
    overallFaladesh += `सावधानीतर्फ ${challengePoints[0]} `;
  }
  overallFaladesh += `परम्परागत ज्योतिषीय दृष्टिकोणअनुसार यस ग्रहको स्थितिले जीवनमा निरन्तर अनुशासन, सही निर्णय र समय अनुकूल प्रयास गर्दा राम्रो प्रगति दिने सम्भावना दर्शाउँछ।`;

  // Remedies
  const naturalRemedies = NATURAL_KARAKATWA[planet.name] || [];
  const recommendedRemedies: string[] = [
    `${planet.name} को अनुकूलताका लागि दिनचर्यामा अनुशासन र सकारात्मक सोच राख्ने।`,
    `${planet.name} सम्बन्धी वैदिक/पौराणिक मन्त्र जप वा स्तोत्र पाठ गर्ने।`,
    `उपयुक्त बारमा सत्कर्म, सेवा र सात्विक आहार ग्रहण गर्ने।`,
  ];

  return {
    planet,
    lagna,
    rashiName,
    houseNumber: planet.bhava,
    formattedDegree: planet.formattedDegree,
    speedMotionNepali: planet.isRetrograde ? 'वक्री (Retrograde)' : 'मार्गी (Direct)',
    combustStatusNepali: planet.isCombust ? 'अस्त (Combust)' : 'उदय (Visible)',
    dignityDetail,
    relationshipDetail,
    bhavaSignificationsNepali: bhavaInfo?.domain || 'भाव सम्बन्धित कार्यक्षेत्र',
    lordshipInfo,
    housePositionImpactNepali: housePositionImpact,
    aspectsCast,
    aspectsReceived,
    conjunctions,
    nakshatraDetail,
    dashaDetail,
    vargaStatuses,
    isVargottama,
    naturalKarakatwaNepali: naturalRemedies,
    overallFaladeshNepali: overallFaladesh,
    positivePoints,
    challengePoints,
    lifeAreasImpacted: [
      { areaName: bhavaInfo?.title || 'प्रमुख जीवनक्षेत्र', impactType: dignityDetail.dignity === 'नीच' ? 'चुनौतीपूर्ण' : 'अनुकूल', descriptionNepali: housePositionImpact },
    ],
    recommendedRemedies,
    astrologicalBasisChecklist: basisChecklist,
    classicalProof: BPHS_GRAHA_SWAROOPA[planet.name] || BPHS_GRAHA_SWAROOPA['सूर्य'],
    bhavaShloka: BPHS_BHAVA_SHLOKAS[planet.bhava] || BPHS_BHAVA_SHLOKAS[1],
  };
}
