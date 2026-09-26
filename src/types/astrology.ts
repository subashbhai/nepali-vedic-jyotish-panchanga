// TypeScript definitions for Nepali Vedic Jyotish & Panchanga Engine

export type Gender = 'male' | 'female' | 'other';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

export interface LocationData {
  name: string;
  district?: string;
  province?: string;
  country: string;
  latitude: number;
  longitude: number;
  timeZone: number; // in hours, e.g. 5.75 for Nepal UTC+5:45
  isDST?: boolean;
  localBody?: string; // स्थानीय तह
  ward?: string; // वडा
  tole?: string; // गाउँ/टोल
  altitude?: number; // उचाइ
  region?: string; // e.g. 'usa', 'uk', 'australia', 'nepal', 'india', etc.
  flag?: string;
  englishName?: string;
  state?: string;
}

export interface FamilyMemberItem {
  id: string;
  relation: 'दाजु' | 'भाइ' | 'दिदी' | 'बहिनी' | 'पति' | 'पत्नी' | 'छोरा' | 'छोरी' | 'अन्य';
  name: string;
  dateBS?: string;
  phone?: string;
  notes?: string;
}

export interface BirthDetails {
  id?: string;
  customerId?: string; // e.g. 'CUST-०१'
  jatakSerialNo?: string; // e.g. 'जातक-००१'
  name: string;
  gender: Gender;
  dateAD: string; // YYYY-MM-DD
  dateBS?: string; // YYYY-MM-DD Nepali date
  time: string; // HH:mm 24hr
  timeSeconds?: string; // ss
  timeAccuracy?: 'exact' | 'estimated' | 'unclear';
  isTimeUncertain?: boolean;
  location: LocationData;
  maritalStatus?: MaritalStatus;
  parentName?: string;
  phone?: string;
  email?: string;
  address?: string;
  photoUrl?: string;
  isPhotoPrivate?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: string; // e.g., 'Family', 'Client', 'VIP'
  gotra?: string; // गोत्र (e.g. कश्यप, भारद्वाज, आदि)
  clientId?: string; // Multi-tenant Client/Astrologer ID for strict data isolation

  // Father Details (बाबुको विवरण)
  fatherDetails?: {
    name: string;
    surname?: string;
    gotra?: string;
    birthplace?: string;
    district?: string;
    province?: string;
    country?: string;
    occupation?: string;
    phone?: string;
  };

  // Mother Details (आमाको विवरण)
  motherDetails?: {
    name: string;
    surname?: string;
    gotra?: string; // मायती गोत्र
    birthplace?: string;
    district?: string;
    province?: string;
    country?: string;
    occupation?: string;
    phone?: string;
  };

  // Grandparents Details (बाजे–बज्यै विवरण)
  grandparentsDetails?: {
    pitamaha?: { name: string; location?: string; notes?: string };
    pitamahi?: { name: string; location?: string; notes?: string };
    matamaha?: { name: string; location?: string; notes?: string };
    matamahi?: { name: string; location?: string; notes?: string };
  };

  // Family History & Clan Details (वंश तथा पारिवारिक पृष्ठभूमि)
  familyHistory?: {
    childOrder?: string; // e.g. 'द्वितिय' (प्रथम, द्वितिय, तृतीय, चतुर्थ, पञ्चम, आदि)
    childType?: string; // e.g. 'पुत्र' (पुत्र, पुत्री, सन्तति)
    kuldevata?: string; // कुलदेवता / कुलदेवी
    ishtaDevata?: string; // इष्टदेवता
    ancestralOrigin?: string; // मूल थलो / पैतृक घर
    vamsa?: string; // वंश / प्रवर
    notes?: string; // पारिवारिक इतिहास टिप्पणी
  };

  // Family Members (परिवार विवरण)
  familyMembers?: FamilyMemberItem[];
}

export type PatrikaSubCategory = 
  | 'brihat_china' // बृहत् चिना (10 pages)
  | 'china' // चिना (3 pages)
  | 'tippan' // टिप्पन (1 page)
  | 'janmakundali' // जन्मकुण्डली
  | 'vivah' // विवाह
  | 'bartabandha' // व्रतबन्ध
  | 'upanayan' // उपनयन
  | 'naamkaran' // नामकरण
  | 'grihapravesh' // गृहप्रवेश
  | 'muhurta' // मुहूर्त
  | 'dasha' // दशा विवरण
  | 'graha' // ग्रह विवरण
  | 'varga' // वर्ग कुण्डली
  | 'bhavachalit' // भावचलित
  | 'gochar' // गोचर
  | 'faladesh' // फलादेश
  | 'anya'; // अन्य पत्रिका

export type PatrikaStatus = 'मस्यौदा' | 'स्वीकृत' | 'छापिएको' | 'संशोधित';

export interface PatrikaRecord {
  id: string;
  patrikaNo: string; // e.g., 'पत्र-००१/०८३'
  jatakId: string;
  jatakName: string;
  subCategory: PatrikaSubCategory;
  version: number;
  status: PatrikaStatus;
  printedAtBS?: string;
  astrologerId?: string;
  astrologerName?: string;
  createdDateBS: string;
  notes?: string;
}

export type RashiName = 
  | 'मेष' | 'वृष' | 'मिथुन' | 'कर्कट' 
  | 'सिंह' | 'कन्या' | 'तुला' | 'वृश्चिक' 
  | 'धनु' | 'मकर' | 'कुम्भ' | 'मीन';

export interface RashiInfo {
  id: number; // 1 to 12
  name: RashiName;
  englishName: string;
  lord: string;
  element: 'अग्नि' | 'पृथ्वी' | 'वायु' | 'जल';
  quality: 'चर' | 'स्थिर' | 'द्विस्वभाव';
  gender: 'पुरुष' | 'स्त्री';
  symbol: string;
}

export type PlanetName = 
  | 'सूर्य' | 'चन्द्र' | 'मंगल' | 'बुध' 
  | 'गुरु' | 'शुक्र' | 'शनि' | 'राहु' | 'केतु';

export interface PlanetPosition {
  id: string;
  name: PlanetName;
  englishName: string;
  symbol: string;
  longitude: number; // Total degrees 0 - 360
  degree: number; // Degrees within Rashi 0 - 30
  minutes: number;
  seconds: number;
  formattedDegree: string; // e.g. "१४° २३' १०\""
  rashiId: number; // 1 to 12
  rashiName: RashiName;
  nakshatraId: number; // 1 to 27
  nakshatraName: string;
  nakshatraLord: string;
  pada: number; // 1, 2, 3, 4
  bhava: number; // House 1 to 12
  speed: number; // Degrees per day
  isRetrograde: boolean; // वक्री
  isCombust: boolean; // अस्त
  dignity: 'उच्च' | 'नीच' | 'स्वक्षेत्र' | 'मूलत्रिकोण' | 'मित्रराशि' | 'शत्रुराशि' | 'समराशि';
  relationshipWithLagnaLord?: 'मित्र' | 'शत्रु' | 'सम';
  shadbalaVirupas?: number; // Total Shadbala score
}

export interface BhavaCusp {
  bhava: number; // 1 to 12
  rashiId: number;
  rashiName: RashiName;
  degree: number;
  formattedDegree: string;
  lord: string;
}

export interface LagnaInfo {
  rashiId: number;
  rashiName: RashiName;
  degree: number;
  formattedDegree: string;
  nakshatraName: string;
  pada: number;
  lord: string;
}

export interface MasaInfo {
  isAdhimasa: boolean;
  isKshayamasa: boolean;
  masaType: 'शुद्ध मास' | 'अधिकमास (पुरुषोत्तम महिना)' | 'क्षयमास';
  masaName: string;
  details: string;
  amantaMasaIndex?: number; // 0=Chaitra, 1=Vaishakha, ..., 5=Bhadrapada, 6=Ashwina, 7=Kartika...
  purnimantaMasaIndex?: number;
}

export interface PanchangaData {
  vikramSamvat: number; // BS Year (e.g. 2083)
  sakaSamvat: number; // Saka Year (e.g. 1948)
  nepalSamvat?: number; // Nepal Sambat Year (e.g. 1146)
  nepalSamvatFormatted?: string; // e.g. "ने.सं. ११४६ ञलाथ्व द्वादशी - १२"
  nepalSamvatMonth?: string; // e.g. "ञला (Yanlā)"
  nepalSamvatPaksha?: string; // e.g. "थ्व (Thwa)"
  nepalSamvatTithi?: string; // e.g. "द्वादशी - १२"
  dateAD: string;
  dateBS: string; // e.g. "२०८३ वैशाख १५"
  dayNameNepali: string; // e.g. "आइतबार"
  dayNameSanskrit: string; // e.g. "रविवासरः"
  masaInfo: MasaInfo;
  tithi: {
    number: number; // 1-30
    name: string; // e.g. "प्रतिपदा", "द्वितीया"...
    paksha: 'शुक्ल' | 'कृष्ण';
    endTime: string;
    percentageRemaining: number;
    endDecimalHours?: number;
    subsequentName?: string;
  };
  vaar: {
    name: string;
    lord: string;
  };
  nakshatra: {
    number: number;
    name: string;
    lord: string;
    pada: number;
    endTime: string;
    endDecimalHours?: number;
    subsequentName?: string;
    subsequentLord?: string;
  };
  yoga: {
    number: number; // 1-27
    name: string; // e.g. "विष्कुम्भ", "प्रीति"...
    endTime: string;
    endDecimalHours?: number;
    subsequentName?: string;
  };
  karana: {
    number: number;
    name: string; // e.g. "बव", "बालव"...
    endTime: string;
  };
  sunrise: string; // e.g. "05:42 AM"
  sunset: string; // e.g. "06:48 PM"
  dayDuration?: string; // e.g. "१२ घण्टा १५ मिनेट"
  nightDuration?: string; // e.g. "११ घण्टा ४५ मिनेट"
  dayDurationHours?: number;
  solarNoon?: string; // e.g. "१२:०२ PM"
  moonrise: string;
  moonset: string;
  rahuKaal: { start: string; end: string };
  yamaganda: { start: string; end: string };
  gulika: { start: string; end: string };
  abhijitMuhurta: { start: string; end: string };
  brahmaMuhurta: { start: string; end: string };
  pradoshaTime: { start: string; end: string };
  choghadiya: Array<{ time: string; name: string; type: 'शुभ' | 'अशुभ' | 'सामान्य' }>;
  samvatsara: string; // e.g. "कालयुक्त"
  ayana: 'उत्तरायण' | 'दक्षिणायन';
  ritu: 'वसन्त' | 'ग्रीष्म' | 'वर्षा' | 'शरद' | 'हेमन्त' | 'शिशिर';
  sunRashi: RashiName;
  moonRashi: RashiName;
  namakshara?: string; // e.g. "चु", "चे", "मा"
  gana?: 'देव' | 'मनुष्य' | 'मानव' | 'राक्षस' | string;
  yoni?: string;
  nadi?: 'आद्य' | 'मध्य' | 'अन्त्य' | string;
  varna?: 'ब्राह्मण' | 'क्षत्रिय' | 'वैश्य' | 'शूद्र' | string;
  vashya?: string;
  tatwa?: 'अग्नि' | 'पृथ्वी' | 'वायु' | 'जल' | string;
  paya?: 'सुवर्ण (स्वर्ण)' | 'रजत (चाँदी)' | 'ताम्र (तामा)' | 'लौह (फलाम)' | string;
  rashiLord?: PlanetName | string;
  lagnaName?: RashiName;
  lagnaLord?: PlanetName | string;
  nakshatraLord?: PlanetName | string;
}

export type DivisionalChartType = 
  | 'D1' | 'D2' | 'D3' | 'D4' | 'D7' | 'D9' 
  | 'D10' | 'D12' | 'D16' | 'D20' | 'D24' 
  | 'D27' | 'D30' | 'D40' | 'D45' | 'D60';

export interface ChartHouse {
  houseNumber: number; // 1 to 12
  rashiId: number;
  rashiName: RashiName;
  planets: PlanetPosition[];
}

export interface DivisionalChart {
  type: DivisionalChartType;
  title: string;
  titleNepali: string;
  description: string;
  houses: ChartHouse[];
}

export interface DashaPeriod {
  planet: PlanetName;
  startDate: string;
  endDate: string;
  durationYears: number;
  subDashas?: DashaPeriod[]; // Antardashas or Pratyantardashas
  isCurrent?: boolean;
}

export interface VimshottariDashaResult {
  birthMoonDegree: number;
  balanceAtBirth: {
    planet: PlanetName;
    yearsLeft: number;
    monthsLeft: number;
    daysLeft: number;
  };
  mahadashas: DashaPeriod[];
  currentMahadasha?: DashaPeriod;
  currentAntardasha?: DashaPeriod;
  currentPratyantardasha?: DashaPeriod;
}

export interface YogaRuleResult {
  id: string;
  name: string;
  nameSanskrit?: string;
  category: 'राजयोग' | 'धनयोग' | 'शुभयोग' | 'अशुभयोग' | 'विपरीत राजयोग' | 'पंचमहापुरुष';
  isPresent: boolean;
  strengthPercentage: number;
  formingPlanets: PlanetName[];
  housesInvolved: number[];
  descriptionNepali: string;
  classicalReference?: string;
  remedies?: string[];
}

export interface ShadbalaResult {
  planet: PlanetName;
  sthanaBala: number; // Position strength
  dikBala: number; // Directional strength
  kalaBala: number; // Temporal strength
  chestaBala: number; // Motional strength
  naisargikaBala: number; // Natural strength
  drikBala: number; // Aspect strength
  totalVirupas: number;
  totalRupas: number; // Virupas / 60
  requiredRupas: number;
  ratio: number; // score/required
  strengthLabel: 'अत्यन्त बलियो' | 'बलियो' | 'सामान्य' | 'कमजोर';
}

export interface AshtakavargaResult {
  bhavas: Array<{ bhava: number; rashiName: RashiName; points: number }>;
  planetBAV: Record<PlanetName, number[]>; // 12 values per planet
  sarvaSAV: number[]; // 12 values total for 12 rashis
  totalSAVPoints: number;
}

export interface GocharTransitResult {
  date: string;
  transits: Array<{
    planet: PlanetName;
    transitRashi: RashiName;
    houseFromMoon: number;
    nature: 'शुभ' | 'अशुभ' | 'सम';
    descriptionNepali: string;
  }>;
  sadeSati: {
    status: 'साढेसाती सुरु' | 'साढेसाती मध्य (शिखर)' | 'साढेसाती अन्तिम' | 'ढैय्या' | 'अष्टम शनि' | 'कण्टक शनि' | 'कुनै प्रभाव छैन';
    phaseName?: string;
    descriptionNepali: string;
    remediesNepali: string[];
  };
}

export interface AshtakootScore {
  kootName: string;
  kootNepali: string;
  maxPoints: number;
  obtainedPoints: number;
  boyAttr: string;
  girlAttr: string;
  descriptionNepali: string;
  isDosha: boolean;
  doshaName?: string;
  exceptionsTriggeredNepali?: string[];
  isCancelled?: boolean;
}

export interface MangalDoshaDetail {
  isManglik: boolean;
  fromLagna: boolean;
  fromMoon: boolean;
  fromVenus: boolean;
  houseLagna: number;
  houseMoon: number;
  houseVenus: number;
  severity: string;
  detailsNepali: string;
  cancellationRulesNepali: string[];
}

export interface SaptamBhavaDetail {
  house7Rashi: string;
  lord: string;
  lordBhava: number;
  lordDignity: string;
  occupants: string[];
  aspects: string[];
  summaryNepali: string;
}

export interface KarakaDetail {
  rashi: string;
  bhava: number;
  dignity: string;
  summaryNepali: string;
}

export interface MaritalLifeAreaScore {
  key: string;
  titleNepali: string;
  scoreLabel: string;
  detailsNepali: string;
}

export interface ComparativeFactor {
  factorNepali: string;
  person1Value: string;
  person2Value: string;
  compatibilityRemark: string;
}

export interface VivahMilanResult {
  engineVersion: string;
  boyDetails: BirthDetails;
  girlDetails: BirthDetails;
  totalScore: number; // Out of 36
  ashtakoot: AshtakootScore[];
  mangalDoshaBoy: MangalDoshaDetail;
  mangalDoshaGirl: MangalDoshaDetail;
  isMangalDoshaCancelled: boolean;
  cancellationReason?: string;
  saptamAnalysis: {
    person1: SaptamBhavaDetail;
    person2: SaptamBhavaDetail;
    crossRelationNepali: string[];
  };
  karakaAnalysis: {
    shukraPerson1: KarakaDetail;
    shukraPerson2: KarakaDetail;
    guruPerson1: KarakaDetail;
    guruPerson2: KarakaDetail;
  };
  navamshaMatch: {
    person1D9Lagna: string;
    person1D9House7: string;
    person2D9Lagna: string;
    person2D9House7: string;
    alignmentSummaryNepali: string;
  };
  moonMoonRelation: {
    distanceInRashis: number;
    lordsRelationNepali: string;
    harmonyNepali: string;
  };
  dashaCoordination: {
    person1Dasha: string;
    person2Dasha: string;
    marriageTimingIndicatorNepali: string;
  };
  maritalLifeAreas: MaritalLifeAreaScore[];
  comparativeTable: ComparativeFactor[];
  positiveSignalsNepali: string[];
  challengingSignalsNepali: string[];
  overallCompatibility: 'उत्कृष्ट' | 'राम्रो' | 'मध्यम' | 'विशेष अध्ययन आवश्यक' | 'सामान्य' | 'अशुभ';
  recommendationNepali: string;
  detailedReportNepali: string;
  astrologerNoteNepali?: string;
  sourceRuleReferenceNepali: string;
}

export type MuhurtaActivityKey = 
  | 'vivah'
  | 'upanayan'
  | 'bartabandha'
  | 'naamkaran'
  | 'annaprashan'
  | 'niskramana'
  | 'choodakarma'
  | 'vidyarambha'
  | 'akshararambha'
  | 'griha_pravesh'
  | 'vastu_puja'
  | 'bhumipujan'
  | 'shilanyas'
  | 'business_launch'
  | 'office_inauguration'
  | 'journey'
  | 'new_work'
  | 'vehicle_purchase'
  | 'puja'
  | 'havan'
  | 'yajna'
  | 'devapratishtha'
  | 'temple_work'
  | 'other_sanskar';

export type MuhurtaClassification = 'अत्यन्त अनुकूल' | 'अनुकूल' | 'सामान्य' | 'सावधानी आवश्यक' | 'त्याज्य';

export interface SubhaMuhurtaItem {
  id: string;
  category: string; // e.g., 'विवाह', 'गृहप्रवेश', 'व्रतबन्ध'
  categoryNepali: string;
  dateAD: string;
  dateBS: string;
  dayNepali: string;
  startTime: string;
  endTime: string;
  tithi: string;
  nakshatra: string;
  lagna: string;
  quality: 'अति शुभ' | 'उत्तम' | 'मध्यम' | 'सावधानी आवश्यक' | 'त्याज्य';
  specialNotesNepali: string;
  avoidFactors?: string[]; // e.g. ['राहुकाल', 'भद्रा']
}

export interface DetailedMuhurtaItem {
  id: string;
  activityKey: MuhurtaActivityKey;
  activityNepali: string;
  dateAD: string;
  dateBS: string;
  dayNepali: string;
  startTime: string;
  endTime: string;
  classification: MuhurtaClassification;
  qualityScore: number; // 0 to 100
  location: LocationData;
  panchangaSummary: {
    tithi: string;
    paksha: string;
    nakshatra: string;
    yoga: string;
    karana: string;
    moonRashi: string;
    sunrise: string;
    sunset: string;
  };
  lagnaSummary: {
    lagnaRashi: string;
    lagnaLord: string;
    house7Status?: string;
    house4Status?: string;
    house10Status?: string;
    ashtamaShuddhi: boolean;
  };
  ineffectiveSlots: {
    rahuKaal: string;
    yamagand: string;
    gulika: string;
    durmuhurta: string[];
    varjya?: string;
    bhadraActive: boolean;
  };
  auspiciousSlots: {
    abhijit: string;
    brahmaMuhurta: string;
  };
  personalAnalysis?: {
    personName?: string;
    birthRashi?: string;
    birthNakshatra?: string;
    chandrabala: {
      houseFromMoon: number;
      score: number;
      statusNepali: string;
    };
    tarabala: {
      taraNumber: number;
      taraNameNepali: string;
      score: number;
      statusNepali: string;
    };
    isPersonalized: boolean;
  };
  reasonsFavorableNepali: string[];
  reasonsAvoidNepali: string[];
  reasonsDoshaRemediesNepali: string[];
  sourceRuleReferenceNepali: string;
  astrologerNotesNepali?: string;
}

export interface MuhurtaSearchFilter {
  activityKey: MuhurtaActivityKey;
  location: LocationData;
  startDateAD: string;
  endDateAD: string;
  personDetails?: BirthDetails;
  person2Details?: BirthDetails;
  minimumClassification?: MuhurtaClassification;
}

export interface LifeAreaAnalysis {
  areaKey: string;
  areaTitleNepali: string;
  iconName: string;
  summaryNepali: string;
  strengthsNepali: string[];
  challengesNepali: string[];
  favorablePeriodsNepali: string[];
  remediesNepali: string[];
}

export interface FullFaladeshReport {
  birthDetails: BirthDetails;
  overviewNepali: string;
  lifeAreas: LifeAreaAnalysis[];
  remediesGeneral: {
    mantra: string[];
    daan: string[];
    jap: string[];
    pooja: string[];
    vrat: string[];
    behavioral: string[];
  };
  cautionNoticeNepali: string;
}

export type AyanamsaSystem =
  | 'Chitrapaksha'
  | 'Lahiri'
  | 'KP'
  | 'Raman'
  | 'Yukteshwar'
  | 'FaganBradley'
  | 'Sayan';
export type HouseSystem = 'Whole Sign' | 'Placidus' | 'Equal';

export type YogaResult = YogaRuleResult;

export interface ApplicationSettings {
  ayanamsaSystem: AyanamsaSystem;
  nodeType: 'True' | 'Mean';
  houseSystem: HouseSystem;
  chartStyle: 'North Indian' | 'South Indian' | 'East Indian';
  language: 'ne' | 'en';
  themeMode: 'light' | 'dark' | 'system';
  jyotishiModeEnabled: boolean;
  astrologerName?: string;
  organizationName?: string;
  contactInfo?: string;
  officeBranding?: {
    nameNepali?: string;
    taglineNepali?: string;
    phone?: string;
    addressNepali?: string;
  };
}

export interface ConsultationRecord {
  id: string;
  profileId: string;
  clientName: string;
  dateBS: string;
  dateAD: string;
  topic: string;
  notes: string;
  remediesSuggested?: string[];
  feeAmount: number;
  paymentStatus: 'सम्पन्न' | 'बाँकी' | 'आंशिक';
  nextFollowUpBS?: string;
  createdAt: string;
}

export interface FeeReceipt {
  id: string;
  receiptNo: string;
  clientName: string;
  profileId?: string;
  dateBS: string;
  serviceTitle: string;
  totalFee: number;
  paidAmount: number;
  balanceAmount: number;
  paymentMethod: 'नगद' | 'ई-सेवा / फोनपे' | 'बैंक ट्रान्सफर' | 'अन्य';
  notes?: string;
  createdAt: string;
}

export interface PrintLogEntry {
  id: string;
  clientName: string;
  profileId?: string;
  documentType: string;
  printedAtBS: string;
  paperSize: 'A4' | 'Letter' | 'कागजी पत्रिका (Card)';
  copiesCount: number;
  status: 'मुद्रित' | 'सुरक्षित';
}

export interface OrganizationProfile {
  name: string; // 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा'
  phone: string; // '+९७७-९७६४४००५३३'
  email: string; // 'suwashdmk@gmail.com'
  address: string; // 'काठमाडौँ, नेपाल'
  intro: string;
  tagline?: string;
  shlokaText?: string;
  visionText?: string;
  objectivesList?: string[];
  newJourneyTitle?: string;
  newJourneyText?: string;
  coreValues?: Array<{ title: string; desc: string }>;
  website?: string;
  logoUrl?: string;
  mainPhotoUrl?: string;
  headerNote?: string;
  footerNote?: string;
  showLogoOnBills: boolean;
  showPhotoOnReports: boolean;
  registeredNo?: string;
  panNo?: string;
  mangalShloka?: string; // '॥ श्री गणेशाय नमः ॥ ॥ श्री वास्तुपुरुषाय नमः ॥ ॥ श्री कुलदेवतायै नमः ॥'
  astrologerName?: string; // 'ज्योतिषाचार्य सुकदेव शर्मा'
  astrologerTitle?: string; // 'वरिष्ठ वास्तुविद् तथा ज्योतिषाचार्य'
}

export type OfficialMemberStatus = 'pending' | 'under_review' | 'info_requested' | 'approved' | 'rejected' | 'inactive' | 'suspended';
export type MemberApprovalStatus = 'Pending' | 'Approved' | 'Rejected';
export type MemberRoleType = 'astrologer' | 'purohit' | 'vastu' | 'both' | 'all';

export interface MemberDocument {
  id: string;
  name: string;
  type: 'academic' | 'training' | 'experience' | 'other';
  typeLabelNepali: string;
  fileUrl: string;
  uploadedAtBS: string;
}

export interface OfficialMemberProfile {
  id: string;
  applicationNumber: string; // e.g. "SJS-APP-२०८१-४८१५"
  fullName: string;
  title: string;
  role: MemberRoleType;
  secondaryRoles?: MemberRoleType[];
  photoUrl?: string;
  expertise: string[];
  contactPhone: string;
  email?: string;
  dobBS?: string;
  dobAD?: string;
  district?: string;
  permanentAddress?: {
    district?: string;
    localLevel?: string;
    ward?: string;
    fullAddress?: string;
  };
  currentAddress?: string;
  qualification?: string; // शास्त्रीय अध्ययन
  gurukulName?: string; // अध्ययन गरेको गुरुकुल/संस्था
  guruName?: string; // गुरु/आचार्यको नाम
  studyDurationYears?: number; // अध्ययन गरेको अवधि
  experienceYears: number; // कार्य अनुभव
  expertExperienceYears?: number; // विशेषज्ञको रूपमा अनुभव
  serviceRegions?: string; // सेवा दिने क्षेत्र
  serviceMode?: 'online' | 'in_person' | 'both'; // अनलाइन / प्रत्यक्ष / दुवै
  documents?: MemberDocument[];
  bio: string; // आफ्नो परिचय तथा विशेषज्ञता
  isAvailable: boolean;
  isVerified: boolean; // "प्रमाणित" - प्रशासकले मात्र प्रदान गर्ने
  status: OfficialMemberStatus;
  approvalStatus?: MemberApprovalStatus;
  rejectionReason?: string;
  infoRequestNote?: string;
  registrationDateBS: string;
  isPreExisting?: boolean;
  updatedAtBS?: string;
  consultationFee?: number;
  onlineServiceEnabled?: boolean;
  membershipPlan?: string;
  membershipPlanNameNepali?: string;
  membershipStartDateBS?: string;
  membershipExpiryDateBS?: string;
}

export interface AstrologerProfile {
  id: string;
  name: string;
  photoUrl?: string;
  title: string;
  expertise: string[];
  contactPhone: string;
  email?: string;
  experienceYears: number;
  signatureUrl?: string;
  bio: string;
  isAvailable: boolean;
  isVerified?: boolean;
  status?: OfficialMemberStatus;
  rejectionReason?: string;
  isPreExisting?: boolean;
  role?: MemberRoleType;
}

export interface PurohitProfile {
  id: string;
  name: string;
  photoUrl?: string;
  speciality: string[];
  contactPhone: string;
  experienceYears: number;
  bio: string;
  isAvailable: boolean;
  isVerified?: boolean;
  status?: OfficialMemberStatus;
  rejectionReason?: string;
  isPreExisting?: boolean;
  role?: MemberRoleType;
}

export interface VastuExpertProfile {
  id: string;
  name: string;
  photoUrl?: string;
  title: string;
  speciality: string[];
  contactPhone: string;
  email?: string;
  experienceYears: number;
  bio: string;
  isAvailable: boolean;
  isVerified?: boolean;
  status?: OfficialMemberStatus;
  rejectionReason?: string;
  isPreExisting?: boolean;
  role?: MemberRoleType;
  serviceMode?: 'online' | 'in_person' | 'both';
}

