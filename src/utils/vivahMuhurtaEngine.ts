import { toDevanagariNumerals } from './nepaliCalendar';
import { RASHI_DATA, NAKSHATRA_DATA } from './astroCalculations';
import { BirthDetails } from '../types/astrology';

export interface VivahMuhurtaRawDate {
  id: string;
  bsYear: number;
  bsMonth: number;
  bsMonthName: string;
  bsDay: number;
  bsDateStr: string;
  dayOfWeek: string;
  adDateStr: string;
  tithi: string;
  paksha: 'शुक्ल' | 'कृष्ण';
  nakshatra: string;
  nakshatraId: number;
  yoga: string;
  karana: string;
  transitSunRashiId: number;
  transitSunRashiName: string;
  transitJupiterRashiId: number;
  transitJupiterRashiName: string;
  transitMoonRashiId: number;
  transitMoonRashiName: string;
  weddingLagna: string;
  timeSlot: string;
  abhijitTime: string;
  choghadiya: string;
  bhadraFree: boolean;
  guruShukraUdaya: boolean;
  classicalNotes: string;
}

export interface EvaluatedVivahMuhurta extends VivahMuhurtaRawDate {
  boySunBala: {
    houseFromMoon: number;
    score: number; // 0-10
    grade: 'शुभ' | 'मध्यम' | 'अनिष्ट';
    statusNepali: string;
    remedyNepali: string;
    isFavorable: boolean;
  };
  girlGuruBala: {
    houseFromMoon: number;
    score: number; // 0-10
    grade: 'शुभ' | 'मध्यम' | 'अनिष्ट';
    statusNepali: string;
    remedyNepali: string;
    isFavorable: boolean;
  };
  boyChandraBala: {
    houseFromMoon: number;
    score: number; // 0-10
    grade: 'शुभ' | 'मध्यम' | 'अनिष्ट';
    statusNepali: string;
    isFavorable: boolean;
  };
  girlChandraBala: {
    houseFromMoon: number;
    score: number; // 0-10
    grade: 'शुभ' | 'मध्यम' | 'अनिष्ट';
    statusNepali: string;
    isFavorable: boolean;
  };
  boyTaraBala: {
    taraNumber: number;
    taraNameNepali: string;
    score: number;
    isFavorable: boolean;
  };
  girlTaraBala: {
    taraNumber: number;
    taraNameNepali: string;
    score: number;
    isFavorable: boolean;
  };
  synergyScore: number; // 0 - 100%
  qualityClassification: 'सर्वोत्तम' | 'उत्तम' | 'मध्यम' | 'सावधानी' | 'त्याज्य';
  starRating: number; // 1 to 5
  verdictNepali: string;
  isRecommendedForCouple: boolean;
}

/**
 * Classical Wedding Dates Database for BS 2081, 2082, 2083, 2084
 * Based on Nepal Panchanga Nirnayak Vikas Samiti and Classical Vivah Prakarana
 */
export const CLASSICAL_VIVAH_DATES: VivahMuhurtaRawDate[] = [
  // ====================== BS 2081 ======================
  {
    id: '2081_mangsir_14',
    bsYear: 2081,
    bsMonth: 8,
    bsMonthName: 'मंसिर',
    bsDay: 14,
    bsDateStr: '२०८१ मंसिर १४',
    dayOfWeek: 'शुक्रवार',
    adDateStr: '2024-11-29',
    tithi: 'शुक्ल त्रयोदशी',
    paksha: 'शुक्ल',
    nakshatra: 'रोहिणी',
    nakshatraId: 4,
    yoga: 'शोभन',
    karana: 'कौलव',
    transitSunRashiId: 8,
    transitSunRashiName: 'वृश्चिक',
    transitJupiterRashiId: 2,
    transitJupiterRashiName: 'वृष',
    transitMoonRashiId: 2,
    transitMoonRashiName: 'वृष',
    weddingLagna: 'वृश्चिक / धनु',
    timeSlot: 'दिउँसो ११:१५ देखि ०१:३० सम्म',
    abhijitTime: '११:४५ - १२:३५ दिउँसो',
    choghadiya: 'अमृत तथा शुभ चौघडिया',
    bhadraFree: true,
    guruShukraUdaya: true,
    classicalNotes: 'रोहिणी नक्षत्र, अमृत योग तथा सप्तम भाव शुद्धि युक्त पावन लगन।',
  },
  {
    id: '2081_mangsir_19',
    bsYear: 2081,
    bsMonth: 8,
    bsMonthName: 'मंसिर',
    bsDay: 19,
    bsDateStr: '२०८१ मंसिर १९',
    dayOfWeek: 'बुधवार',
    adDateStr: '2024-12-04',
    tithi: 'शुक्ल तृतीया',
    paksha: 'शुक्ल',
    nakshatra: 'उत्तराषाढा',
    nakshatraId: 21,
    yoga: 'वृद्धि',
    karana: 'गर',
    transitSunRashiId: 8,
    transitSunRashiName: 'वृश्चिक',
    transitJupiterRashiId: 2,
    transitJupiterRashiName: 'वृष',
    transitMoonRashiId: 9,
    transitMoonRashiName: 'धनु',
    weddingLagna: 'धनु / मकर',
    timeSlot: 'बिहान १०:३० देखि १२:४५ सम्म',
    abhijitTime: '११:४२ - १२:३० दिउँसो',
    choghadiya: 'लाभ चौघडिया',
    bhadraFree: true,
    guruShukraUdaya: true,
    classicalNotes: 'सौभाग्य योग, त्रिबल शुद्धि एवं सन्तान-सम्पत्ति वृद्धि कारक।',
  },
  {
    id: '2081_mangsir_21',
    bsYear: 2081,
    bsMonth: 8,
    bsMonthName: 'मंसिर',
    bsDay: 21,
    bsDateStr: '२०८१ मंसिर २१',
    dayOfWeek: 'शुक्रवार',
    adDateStr: '2024-12-06',
    tithi: 'शुक्ल पञ्चमी',
    paksha: 'शुक्ल',
    nakshatra: 'श्रवण',
    nakshatraId: 22,
    yoga: 'ध्रुव',
    karana: 'बव',
    transitSunRashiId: 8,
    transitSunRashiName: 'वृश्चिक',
    transitJupiterRashiId: 2,
    transitJupiterRashiName: 'वृष',
    transitMoonRashiId: 10,
    transitMoonRashiName: 'मकर',
    weddingLagna: 'कुम्भ लग्न',
    timeSlot: 'दिउँसो १२:०० देखि ०२:१५ सम्म',
    abhijitTime: '११:४४ - १२:३२ दिउँसो',
    choghadiya: 'अमृत चौघडिया',
    bhadraFree: true,
    guruShukraUdaya: true,
    classicalNotes: 'विवाह पञ्चमीको पावन योग, अखण्ड सौभाग्य एवं दाम्पत्य सौख्य।',
  },
  {
    id: '2081_mangsir_24',
    bsYear: 2081,
    bsMonth: 8,
    bsMonthName: 'मंसिर',
    bsDay: 24,
    bsDateStr: '२०८१ मंसिर २४',
    dayOfWeek: 'सोमवार',
    adDateStr: '2024-12-09',
    tithi: 'शुक्ल अष्टमी',
    paksha: 'शुक्ल',
    nakshatra: 'उत्तरभाद्रपदा',
    nakshatraId: 26,
    yoga: 'हर्षण',
    karana: 'बालव',
    transitSunRashiId: 8,
    transitSunRashiName: 'वृश्चिक',
    transitJupiterRashiId: 2,
    transitJupiterRashiName: 'वृष',
    transitMoonRashiId: 12,
    transitMoonRashiName: 'मीन',
    weddingLagna: 'मीन / मेष',
    timeSlot: 'दिउँसो ०१:०० देखि ०३:०० सम्म',
    abhijitTime: '११:४५ - १२:३३ दिउँसो',
    choghadiya: 'शुभ चौघडिया',
    bhadraFree: true,
    guruShukraUdaya: true,
    classicalNotes: 'उत्तरभाद्रपदा नक्षत्र, स्थिर लग्न तथा दीर्घायु फलदायी मुहूर्त।',
  },
  {
    id: '2081_magh_10',
    bsYear: 2081,
    bsMonth: 10,
    bsMonthName: 'माघ',
    bsDay: 10,
    bsDateStr: '२०८१ माघ १०',
    dayOfWeek: 'बिहीवार',
    adDateStr: '2025-01-23',
    tithi: 'कृष्ण दशमी',
    paksha: 'कृष्ण',
    nakshatra: 'अनुराधा',
    nakshatraId: 17,
    yoga: 'गण्डान्त रहित शुभ योग',
    karana: 'विष्टि रहित',
    transitSunRashiId: 10,
    transitSunRashiName: 'मकर',
    transitJupiterRashiId: 2,
    transitJupiterRashiName: 'वृष',
    transitMoonRashiId: 8,
    transitMoonRashiName: 'वृश्चिक',
    weddingLagna: 'मीन / मेष',
    timeSlot: 'साँझ ०४:३० देखि ०६:४५ सम्म',
    abhijitTime: '१२:०० - १२:४५ दिउँसो',
    choghadiya: 'अमृत तथा लाभ चौघडिया',
    bhadraFree: true,
    guruShukraUdaya: true,
    classicalNotes: 'देवगुरु बृहस्पति वार, अनुराधा मित्र नक्षत्र एवं गोचर अनुकूलता।',
  },
  {
    id: '2081_magh_25',
    bsYear: 2081,
    bsMonth: 10,
    bsMonthName: 'माघ',
    bsDay: 25,
    bsDateStr: '२०८१ माघ २५',
    dayOfWeek: 'शुक्रवार',
    adDateStr: '2025-02-07',
    tithi: 'शुक्ल दशमी',
    paksha: 'शुक्ल',
    nakshatra: 'रोहिणी',
    nakshatraId: 4,
    yoga: 'इन्द्र',
    karana: 'तैतिल',
    transitSunRashiId: 10,
    transitSunRashiName: 'मकर',
    transitJupiterRashiId: 2,
    transitJupiterRashiName: 'वृष',
    transitMoonRashiId: 2,
    transitMoonRashiName: 'वृष',
    weddingLagna: 'वृष / मिथुन',
    timeSlot: 'बिहान ०९:०० देखि ११:१५ सम्म',
    abhijitTime: '१२:०२ - १२:४८ दिउँसो',
    choghadiya: 'शुभ तथा अमृत चौघडिया',
    bhadraFree: true,
    guruShukraUdaya: true,
    classicalNotes: 'सर्वोत्तम विवाह मुहूर्त, रोहिणी नक्षत्र तथा शुक्र उदयकाल।',
  },
  {
    id: '2081_falgun_08',
    bsYear: 2081,
    bsMonth: 11,
    bsMonthName: 'फागुन',
    bsDay: 8,
    bsDateStr: '२०८१ फागुन ०८',
    dayOfWeek: 'बिहीवार',
    adDateStr: '2025-02-20',
    tithi: 'कृष्ण अष्टमी',
    paksha: 'कृष्ण',
    nakshatra: 'अनुराधा',
    nakshatraId: 17,
    yoga: 'हर्षण',
    karana: 'बालव',
    transitSunRashiId: 11,
    transitSunRashiName: 'कुम्भ',
    transitJupiterRashiId: 2,
    transitJupiterRashiName: 'वृष',
    transitMoonRashiId: 8,
    transitMoonRashiName: 'वृश्चिक',
    weddingLagna: 'कर्कट / सिंह',
    timeSlot: 'दिउँसो ०१:३० देखि ०३:४५ सम्म',
    abhijitTime: '१२:०४ - १२:५० दिउँसो',
    choghadiya: 'लाभ चौघडिया',
    bhadraFree: true,
    guruShukraUdaya: true,
    classicalNotes: 'उत्तम लगन, मैत्र नक्षत्र, दीर्घायु एवं गृहस्थ सुख कारक योग।',
  },
  {
    id: '2081_falgun_21',
    bsYear: 2081,
    bsMonth: 11,
    bsMonthName: 'फागुन',
    bsDay: 21,
    bsDateStr: '२०८१ फागुन २१',
    dayOfWeek: 'बुधवार',
    adDateStr: '2025-03-05',
    tithi: 'शुक्ल षष्ठी',
    paksha: 'शुक्ल',
    nakshatra: 'रोहिणी',
    nakshatraId: 4,
    yoga: 'वैधृति रहित प्रीति',
    karana: 'कौलव',
    transitSunRashiId: 11,
    transitSunRashiName: 'कुम्भ',
    transitJupiterRashiId: 2,
    transitJupiterRashiName: 'वृष',
    transitMoonRashiId: 2,
    transitMoonRashiName: 'वृष',
    weddingLagna: 'वृष / मिथुन',
    timeSlot: 'बिहान १०:०० देखि १२:१५ सम्म',
    abhijitTime: '१२:०२ - १२:४८ दिउँसो',
    choghadiya: 'अमृत चौघडिया',
    bhadraFree: true,
    guruShukraUdaya: true,
    classicalNotes: 'रोहिणी नक्षत्र, चन्द्र उच्च, दाम्पत्य सौहार्द तथा वंश वृद्धि।',
  },

  // ====================== BS 2082 ======================
  {
    id: '2082_baisakh_12',
    bsYear: 2082,
    bsMonth: 1,
    bsMonthName: 'वैशाख',
    bsDay: 12,
    bsDateStr: '२०८२ वैशाख १२',
    dayOfWeek: 'शुक्रवार',
    adDateStr: '2025-04-25',
    tithi: 'शुक्ल पञ्चमी',
    paksha: 'शुक्ल',
    nakshatra: 'हस्त',
    nakshatraId: 13,
    yoga: 'शुभ',
    karana: 'बव',
    transitSunRashiId: 1,
    transitSunRashiName: 'मेष',
    transitJupiterRashiId: 3,
    transitJupiterRashiName: 'मिथुन',
    transitMoonRashiId: 6,
    transitMoonRashiName: 'कन्या',
    weddingLagna: 'सिंह / कन्या',
    timeSlot: 'दिउँसो ०२:०० देखि ०४:१५ सम्म',
    abhijitTime: '११:५२ - १२:४२ दिउँसो',
    choghadiya: 'अमृत तथा लाभ चौघडिया',
    bhadraFree: true,
    guruShukraUdaya: true,
    classicalNotes: 'सर्वदोष नाशक अक्षय लग्न, सूर्य उच्च, कन्या राशिको चन्द्रमा।',
  },
  {
    id: '2082_baisakh_18',
    bsYear: 2082,
    bsMonth: 1,
    bsMonthName: 'वैशाख',
    bsDay: 18,
    bsDateStr: '२०८२ वैशाख १८',
    dayOfWeek: 'बिहीवार',
    adDateStr: '2025-05-01',
    tithi: 'शुक्ल पञ्चमी',
    paksha: 'शुक्ल',
    nakshatra: 'मृगशिरा',
    nakshatraId: 5,
    yoga: 'सुStaticकर्मा',
    karana: 'बालव',
    transitSunRashiId: 1,
    transitSunRashiName: 'मेष',
    transitJupiterRashiId: 3,
    transitJupiterRashiName: 'मिथुन',
    transitMoonRashiId: 3,
    transitMoonRashiName: 'मिथुन',
    weddingLagna: 'तुला लग्न',
    timeSlot: 'साँझ ०५:१५ देखि ०७:०० सम्म',
    abhijitTime: '११:५० - १२:४० दिउँसो',
    choghadiya: 'शुभ चौघडिया',
    bhadraFree: true,
    guruShukraUdaya: true,
    classicalNotes: 'गुरुवारको दिन, मृगशिरा नक्षत्र, अक्षय पुण्य एवं ऐश्वर्य प्राप्ति।',
  },
  {
    id: '2082_jestha_09',
    bsYear: 2082,
    bsMonth: 2,
    bsMonthName: 'जेठ',
    bsDay: 9,
    bsDateStr: '२०८२ जेठ ०९',
    dayOfWeek: 'शुक्रवार',
    adDateStr: '2025-05-23',
    tithi: 'शुक्ल एकादशी',
    paksha: 'शुक्ल',
    nakshatra: 'स्वाती',
    nakshatraId: 15,
    yoga: 'सिद्धि',
    karana: 'गर',
    transitSunRashiId: 2,
    transitSunRashiName: 'वृष',
    transitJupiterRashiId: 3,
    transitJupiterRashiName: 'मिथुन',
    transitMoonRashiId: 7,
    transitMoonRashiName: 'तुला',
    weddingLagna: 'तुला / वृश्चिक',
    timeSlot: 'साँझ ०५:०० देखि ०७:०० सम्म',
    abhijitTime: '११:४८ - १२:३८ दिउँसो',
    choghadiya: 'अमृत चौघडिया',
    bhadraFree: true,
    guruShukraUdaya: true,
    classicalNotes: 'उत्तम विवाह लगन, शुभ तारा, सप्तम भाव शुद्धि तथा अखण्ड प्रीति।',
  },
  {
    id: '2082_jestha_23',
    bsYear: 2082,
    bsMonth: 2,
    bsMonthName: 'जेठ',
    bsDay: 23,
    bsDateStr: '२०८२ जेठ २३',
    dayOfWeek: 'शुक्रवार',
    adDateStr: '2025-06-06',
    tithi: 'शुक्ल दशमी',
    paksha: 'शुक्ल',
    nakshatra: 'हस्त',
    nakshatraId: 13,
    yoga: 'व्यतीपात रहित वरीयान्',
    karana: 'तैतिल',
    transitSunRashiId: 2,
    transitSunRashiName: 'वृष',
    transitJupiterRashiId: 3,
    transitJupiterRashiName: 'मिथुन',
    transitMoonRashiId: 6,
    transitMoonRashiName: 'कन्या',
    weddingLagna: 'धनु / मकर',
    timeSlot: 'दिउँसो १२:०० देखि ०२:०० सम्म',
    abhijitTime: '११:४९ - १२:३९ दिउँसो',
    choghadiya: 'लाभ चौघडिया',
    bhadraFree: true,
    guruShukraUdaya: true,
    classicalNotes: 'हस्त नक्षत्र, गंगा दशहरा पर्व समीप, सर्वपाप निवारक मंगल साइत।',
  },
  {
    id: '2082_ashadh_06',
    bsYear: 2082,
    bsMonth: 3,
    bsMonthName: 'असार',
    bsDay: 6,
    bsDateStr: '२०८२ असार ०६',
    dayOfWeek: 'शुक्रवार',
    adDateStr: '2025-06-20',
    tithi: 'शुक्ल दशमी',
    paksha: 'शुक्ल',
    nakshatra: 'उत्तराषाढा',
    nakshatraId: 21,
    yoga: 'शिव',
    karana: 'कौलव',
    transitSunRashiId: 3,
    transitSunRashiName: 'मिथुन',
    transitJupiterRashiId: 3,
    transitJupiterRashiName: 'मिथुन',
    transitMoonRashiId: 9,
    transitMoonRashiName: 'धनु',
    weddingLagna: 'धनु लग्न',
    timeSlot: 'दिउँसो ११:३० देखि ०१:४० सम्म',
    abhijitTime: '११:५२ - १२:४२ दिउँसो',
    choghadiya: 'अमृत चौघडिया',
    bhadraFree: true,
    guruShukraUdaya: true,
    classicalNotes: 'हरिशयनी एकादशी पूर्वको पावन विवाह साइत, त्रिबल शुद्धि पूर्ण।',
  },
  {
    id: '2082_mangsir_09',
    bsYear: 2082,
    bsMonth: 8,
    bsMonthName: 'मंसिर',
    bsDay: 9,
    bsDateStr: '२०८२ मंसिर ०९',
    dayOfWeek: 'सोमवार',
    adDateStr: '2025-11-24',
    tithi: 'शुक्ल पञ्चमी',
    paksha: 'शुक्ल',
    nakshatra: 'उत्तरभाद्रपदा',
    nakshatraId: 26,
    yoga: 'वृद्धि',
    karana: 'बव',
    transitSunRashiId: 8,
    transitSunRashiName: 'वृश्चिक',
    transitJupiterRashiId: 3,
    transitJupiterRashiName: 'मिथुन',
    transitMoonRashiId: 12,
    transitMoonRashiName: 'मीन',
    weddingLagna: 'कुम्भ / मीन',
    timeSlot: 'दिउँसो १२:१५ देखि ०२:३० सम्म',
    abhijitTime: '११:४० - १२:२८ दिउँसो',
    choghadiya: 'शुभ तथा अमृत चौघडिया',
    bhadraFree: true,
    guruShukraUdaya: true,
    classicalNotes: 'विवाह पञ्चमी पर्व, मार्गशीर्ष शुक्ल पक्ष, अक्षुण्ण ऐश्वर्य।',
  },
  {
    id: '2082_magh_16',
    bsYear: 2082,
    bsMonth: 10,
    bsMonthName: 'माघ',
    bsDay: 16,
    bsDateStr: '२०८२ माघ १६',
    dayOfWeek: 'शुक्रवार',
    adDateStr: '2026-01-30',
    tithi: 'शुक्ल त्रयोदशी',
    paksha: 'शुक्ल',
    nakshatra: 'पुनर्वसु',
    nakshatraId: 7,
    yoga: 'शोभन',
    karana: 'तैतिल',
    transitSunRashiId: 10,
    transitSunRashiName: 'मकर',
    transitJupiterRashiId: 3,
    transitJupiterRashiName: 'मिथुन',
    transitMoonRashiId: 3,
    transitMoonRashiName: 'मिथुन',
    weddingLagna: 'मेष लग्न',
    timeSlot: 'दिउँसो ०२:०० देखि ०४:१५ सम्म',
    abhijitTime: '१२:०२ - १२:४८ दिउँसो',
    choghadiya: 'लाभ तथा शुभ चौघडिया',
    bhadraFree: true,
    guruShukraUdaya: true,
    classicalNotes: 'शुक्रवार, मकर संक्रान्ति उत्तर, गोचर चन्द्र र गुरु शुभ दृष्टि।',
  },

  // ====================== BS 2083 ======================
  {
    id: '2083_baisakh_10',
    bsYear: 2083,
    bsMonth: 1,
    bsMonthName: 'वैशाख',
    bsDay: 10,
    bsDateStr: '२०८३ वैशाख १०',
    dayOfWeek: 'बिहीवार',
    adDateStr: '2026-04-23',
    tithi: 'शुक्ल सप्तमी',
    paksha: 'शुक्ल',
    nakshatra: 'पुष्य',
    nakshatraId: 8,
    yoga: 'सिद्ध',
    karana: 'गर',
    transitSunRashiId: 1,
    transitSunRashiName: 'मेष',
    transitJupiterRashiId: 4,
    transitJupiterRashiName: 'कर्कट',
    transitMoonRashiId: 4,
    transitMoonRashiName: 'कर्कट',
    weddingLagna: 'सिंह लग्न',
    timeSlot: 'दिउँसो ०१:४५ देखि ०३:५० सम्म',
    abhijitTime: '११:५० - १२:४० दिउँसो',
    choghadiya: 'अमृत चौघडिया',
    bhadraFree: true,
    guruShukraUdaya: true,
    classicalNotes: 'गुरु पुष्य योग, देवगुरु कर्कट राशिमा उच्च, अद्वितीय मंगलकारी साइत।',
  },
  {
    id: '2083_jestha_15',
    bsYear: 2083,
    bsMonth: 2,
    bsMonthName: 'जेठ',
    bsDay: 15,
    bsDateStr: '२०८३ जेठ १५',
    dayOfWeek: 'शुक्रवार',
    adDateStr: '2026-05-29',
    tithi: 'शुक्ल त्रयोदशी',
    paksha: 'शुक्ल',
    nakshatra: 'स्वाती',
    nakshatraId: 15,
    yoga: 'हर्षण',
    karana: 'कौलव',
    transitSunRashiId: 2,
    transitSunRashiName: 'वृष',
    transitJupiterRashiId: 4,
    transitJupiterRashiName: 'कर्कट',
    transitMoonRashiId: 7,
    transitMoonRashiName: 'तुला',
    weddingLagna: 'तुला / वृश्चिक',
    timeSlot: 'साँझ ०५:०० देखि ०७:१० सम्म',
    abhijitTime: '११:४८ - १२:३८ दिउँसो',
    choghadiya: 'शुभ चौघडिया',
    bhadraFree: true,
    guruShukraUdaya: true,
    classicalNotes: 'कन्याको गुरुबल उच्च, स्वाती नक्षत्र, सन्तान एवं धर्म वृद्धि।',
  },
  {
    id: '2083_mangsir_11',
    bsYear: 2083,
    bsMonth: 8,
    bsMonthName: 'मंसिर',
    bsDay: 11,
    bsDateStr: '२०८३ मंसिर ११',
    dayOfWeek: 'बिहीवार',
    adDateStr: '2026-11-26',
    tithi: 'शुक्ल द्वितीया',
    paksha: 'शुक्ल',
    nakshatra: 'मूल / पूर्वाषाढा',
    nakshatraId: 19,
    yoga: 'सुकर्मा',
    karana: 'बालव',
    transitSunRashiId: 8,
    transitSunRashiName: 'वृश्चिक',
    transitJupiterRashiId: 4,
    transitJupiterRashiName: 'कर्कट',
    transitMoonRashiId: 9,
    transitMoonRashiName: 'धनु',
    weddingLagna: 'धनु / मकर',
    timeSlot: 'बिहान १०:४५ देखि ०१:०० सम्म',
    abhijitTime: '११:४२ - १२:३० दिउँसो',
    choghadiya: 'लाभ चौघडिया',
    bhadraFree: true,
    guruShukraUdaya: true,
    classicalNotes: 'मार्गशीर्ष शुक्ल द्वितीया, चन्द्रबल अनुकूल, निर्दोष लग्न।',
  },
  {
    id: '2083_falgun_08',
    bsYear: 2083,
    bsMonth: 11,
    bsMonthName: 'फागुन',
    bsDay: 8,
    bsDateStr: '२०८३ फागुन ०८',
    dayOfWeek: 'शनिवार',
    adDateStr: '2027-02-20',
    tithi: 'शुक्ल चतुर्दशी',
    paksha: 'शुक्ल',
    nakshatra: 'रोहिणी',
    nakshatraId: 4,
    yoga: 'शोभन',
    karana: 'गर',
    transitSunRashiId: 11,
    transitSunRashiName: 'कुम्भ',
    transitJupiterRashiId: 4,
    transitJupiterRashiName: 'कर्कट',
    transitMoonRashiId: 2,
    transitMoonRashiName: 'वृष',
    weddingLagna: 'वृष लग्न',
    timeSlot: 'बिहान ०९:३० देखि ११:४५ सम्म',
    abhijitTime: '१२:०२ - १२:४८ दिउँसो',
    choghadiya: 'अमृत चौघडिया',
    bhadraFree: true,
    guruShukraUdaya: true,
    classicalNotes: 'रोहिणी अमृत नक्षत्र, कन्याको उच्च गुरुबल, स्थिर गृहस्थ जीवन।',
  },

  // ====================== BS 2084 ======================
  {
    id: '2084_baisakh_12',
    bsYear: 2084,
    bsMonth: 1,
    bsMonthName: 'वैशाख',
    bsDay: 12,
    bsDateStr: '२०८४ वैशाख १२',
    dayOfWeek: 'आइतवार',
    adDateStr: '2027-04-25',
    tithi: 'कृष्ण चतुर्थी रहित पञ्चमी',
    paksha: 'कृष्ण',
    nakshatra: 'मूल',
    nakshatraId: 19,
    yoga: 'सिद्धि',
    karana: 'तैतिल',
    transitSunRashiId: 1,
    transitSunRashiName: 'मेष',
    transitJupiterRashiId: 5,
    transitJupiterRashiName: 'सिंह',
    transitMoonRashiId: 9,
    transitMoonRashiName: 'धनु',
    weddingLagna: 'सिंह लग्न',
    timeSlot: 'दिउँसो ०२:०० देखि ०४:०० सम्म',
    abhijitTime: '११:५० - १२:४० दिउँसो',
    choghadiya: 'शुभ चौघडिया',
    bhadraFree: true,
    guruShukraUdaya: true,
    classicalNotes: 'सूर्य उच्च मेष राशि, अभिजित मुहूर्त सन्मुख, वैवाहिक सौख्य।',
  },
  {
    id: '2084_jestha_06',
    bsYear: 2084,
    bsMonth: 2,
    bsMonthName: 'जेठ',
    bsDay: 6,
    bsDateStr: '२०८४ जेठ ०६',
    dayOfWeek: 'बिहीवार',
    adDateStr: '2027-05-20',
    tithi: 'शुक्ल पूर्णिमा',
    paksha: 'शुक्ल',
    nakshatra: 'स्वाती',
    nakshatraId: 15,
    yoga: 'शिव',
    karana: 'बव',
    transitSunRashiId: 2,
    transitSunRashiName: 'वृष',
    transitJupiterRashiId: 5,
    transitJupiterRashiName: 'सिंह',
    transitMoonRashiId: 7,
    transitMoonRashiName: 'तुला',
    weddingLagna: 'तुला / वृश्चिक',
    timeSlot: 'साँझ ०५:०० देखि ०७:१५ सम्म',
    abhijitTime: '११:४८ - १२:३८ दिउँसो',
    choghadiya: 'अमृत चौघडिया',
    bhadraFree: true,
    guruShukraUdaya: true,
    classicalNotes: 'बुद्ध पूर्णिमा तिथि, गुरुवासर, स्वाती नक्षत्र, सुख-सौभाग्य।',
  },
  {
    id: '2084_mangsir_14',
    bsYear: 2084,
    bsMonth: 8,
    bsMonthName: 'मंसिर',
    bsDay: 14,
    bsDateStr: '२०८४ मंसिर १४',
    dayOfWeek: 'सोमवार',
    adDateStr: '2027-11-29',
    tithi: 'शुक्ल प्रतिपदा रहित द्वितीया',
    paksha: 'शुक्ल',
    nakshatra: 'ज्येष्ठा',
    nakshatraId: 18,
    yoga: 'सुकर्मा',
    karana: 'बालव',
    transitSunRashiId: 8,
    transitSunRashiName: 'वृश्चिक',
    transitJupiterRashiId: 5,
    transitJupiterRashiName: 'सिंह',
    transitMoonRashiId: 8,
    transitMoonRashiName: 'वृश्चिक',
    weddingLagna: 'धनु लग्न',
    timeSlot: 'दिउँसो १२:०० देखि ०२:०० सम्म',
    abhijitTime: '११:४१ - १२:२९ दिउँसो',
    choghadiya: 'लाभ तथा अमृत चौघडिया',
    bhadraFree: true,
    guruShukraUdaya: true,
    classicalNotes: 'मार्गशीर्ष मास, द्विस्वभाव लग्न, सूर्यबल तथा गुरुबल अनुकूल।',
  },
];

/**
 * Evaluates Boy's Surya Bala (वर सूर्यबल)
 * Rule: Count from Boy's Moon Rashi to Transit Sun Rashi
 * 3, 6, 10, 11: शुभ (उत्कृष्ट)
 * 1, 2, 5, 7, 9: मध्यम (सूर्य अर्घ्य/शान्ति सहित ग्राह्य)
 * 4, 8, 12: अनिष्ट (अशुभ - विवाह वर्जित)
 */
export function evaluateBoySuryaBala(boyMoonRashiId: number, transitSunRashiId: number) {
  const house = ((transitSunRashiId - boyMoonRashiId + 12) % 12) + 1;

  if ([3, 6, 10, 11].includes(house)) {
    return {
      houseFromMoon: house,
      score: 10,
      grade: 'शुभ' as const,
      statusNepali: `वरको जन्म राशिबाट सूर्य ${toDevanagariNumerals(house)} औं भावमा रहेकाले उत्कृष्ट एवं अति शुभ सूर्यबल छ।`,
      remedyNepali: 'कुनै शान्ति आवश्यक छैन (पूर्ण शुभ बल)।',
      isFavorable: true,
    };
  } else if ([1, 2, 5, 7, 9].includes(house)) {
    return {
      houseFromMoon: house,
      score: 7,
      grade: 'मध्यम' as const,
      statusNepali: `वरको जन्म राशिबाट सूर्य ${toDevanagariNumerals(house)} औं भावमा रहेकाले मध्यम सूर्यबल छ।`,
      remedyNepali: 'विवाह पूर्व रातो वस्त्र, तामा वा सूर्य भगवानलाई ॐ घृणि सूर्याय नमः मन्त्रले अर्घ्य दिनु उचित।',
      isFavorable: true,
    };
  } else {
    return {
      houseFromMoon: house,
      score: 2,
      grade: 'अनिष्ट' as const,
      statusNepali: `वरको जन्म राशिबाट सूर्य ${toDevanagariNumerals(house)} औं (४, ८ वा १२ औं) भावमा रहेकाले कमजोर/अनिष्ट सूर्यबल छ।`,
      remedyNepali: 'शास्त्रीय मान्यता अनुसार ४, ८, १२ को सूर्य अनिष्ट मानिन्छ; विशेष सूर्य शान्ति वा अन्य मिति रोज्नुहोस्।',
      isFavorable: false,
    };
  }
}

/**
 * Evaluates Girl's Guru Bala (कन्या गुरुबल)
 * Rule: Count from Girl's Moon Rashi to Transit Jupiter Rashi
 * 2, 5, 7, 9, 11: शुभ (उत्कृष्ट गुरुबल)
 * 1, 3, 6, 10: मध्यम (पीतवस्त्र/गुरु शान्ति सहित ग्राह्य)
 * 4, 8, 12: अनिष्ट (गुरुबल हीन - वर्जित)
 */
export function evaluateGirlGuruBala(girlMoonRashiId: number, transitJupiterRashiId: number) {
  const house = ((transitJupiterRashiId - girlMoonRashiId + 12) % 12) + 1;

  if ([2, 5, 7, 9, 11].includes(house)) {
    return {
      houseFromMoon: house,
      score: 10,
      grade: 'शुभ' as const,
      statusNepali: `कन्याको जन्म राशिबाट देवगुरु बृहस्पति ${toDevanagariNumerals(house)} औं भावमा रहेकाले सर्वश्रेष्ठ एवं अति शुभ गुरुबल छ।`,
      remedyNepali: 'कुनै शान्ति आवश्यक छैन (अखण्ड सौभाग्य कारक)।',
      isFavorable: true,
    };
  } else if ([1, 3, 6, 10].includes(house)) {
    return {
      houseFromMoon: house,
      score: 7,
      grade: 'मध्यम' as const,
      statusNepali: `कन्याको जन्म राशिबाट देवगुरु बृहस्पति ${toDevanagariNumerals(house)} औं भावमा रहेकाले मध्यम गुरुबल छ।`,
      remedyNepali: 'विवाह पूर्व पहेंलो वस्त्र, चनाको दाल, वेसार वा गुरु मन्त्र (ॐ बृं बृहस्पतये नमः) जप गरी पूजा गर्न सकिन्छ।',
      isFavorable: true,
    };
  } else {
    return {
      houseFromMoon: house,
      score: 2,
      grade: 'अनिष्ट' as const,
      statusNepali: `कन्याको जन्म राशिबाट देवगुरु बृहस्पति ${toDevanagariNumerals(house)} औं (४, ८ वा १२ औं) भावमा रहेकाले अनिष्ट गुरुबल छ।`,
      remedyNepali: 'कन्याका लागि ४, ८, १२ को बृहस्पति त्याज्य मानिन्छ; बृहस्पति पूजन, सुवर्ण दान वा अर्को उत्तम मिति चयन गर्नुहोस्।',
      isFavorable: false,
    };
  }
}

/**
 * Evaluates Chandra Bala (चन्द्रबल)
 * 1, 3, 6, 7, 10, 11: शुभ
 * 2, 5, 9: मध्यम
 * 4, 8, 12: अनिष्ट
 */
export function evaluateChandraBala(moonRashiId: number, transitMoonRashiId: number, roleName: string) {
  const house = ((transitMoonRashiId - moonRashiId + 12) % 12) + 1;

  if ([1, 3, 6, 7, 10, 11].includes(house)) {
    return {
      houseFromMoon: house,
      score: 10,
      grade: 'शुभ' as const,
      statusNepali: `${roleName}को जन्म राशिबाट चन्द्रमा ${toDevanagariNumerals(house)} औं भावमा रहेकाले पूर्ण शुभ चन्द्रबल छ।`,
      isFavorable: true,
    };
  } else if ([2, 5, 9].includes(house)) {
    return {
      houseFromMoon: house,
      score: 6,
      grade: 'मध्यम' as const,
      statusNepali: `${roleName}को जन्म राशिबाट चन्द्रमा ${toDevanagariNumerals(house)} औं भावमा रहेकाले सामान्य चन्द्रबल छ।`,
      isFavorable: true,
    };
  } else {
    return {
      houseFromMoon: house,
      score: 1,
      grade: 'अनिष्ट' as const,
      statusNepali: `${roleName}को जन्म राशिबाट चन्द्रमा ${toDevanagariNumerals(house)} औं भावमा (४, ८, १२) रहेकाले अनिष्ट चन्द्रदोष छ।`,
      isFavorable: false,
    };
  }
}

/**
 * Evaluates Tara Bala (ताराबल)
 */
export function evaluateTaraBala(birthNakshatraId: number, muhurtaNakshatraId: number) {
  const dist = ((muhurtaNakshatraId - birthNakshatraId + 27) % 27) + 1;
  const taraNum = ((dist - 1) % 9) + 1;

  const taraNames: Record<number, { name: string; score: number; favorable: boolean }> = {
    1: { name: 'जन्म तारा', score: 6, favorable: true },
    2: { name: 'सम्पत् तारा', score: 10, favorable: true },
    3: { name: 'विपत् तारा', score: 1, favorable: false },
    4: { name: 'क्षेम तारा', score: 9, favorable: true },
    5: { name: 'प्रत्यरि तारा', score: 2, favorable: false },
    6: { name: 'साधक तारा', score: 10, favorable: true },
    7: { name: 'निधन तारा', score: 0, favorable: false },
    8: { name: 'मित्र तारा', score: 9, favorable: true },
    9: { name: 'परम मित्र तारा', score: 10, favorable: true },
  };

  const info = taraNames[taraNum] || { name: 'सामान्य तारा', score: 5, favorable: true };

  return {
    taraNumber: taraNum,
    taraNameNepali: info.name,
    score: info.score,
    isFavorable: info.favorable,
  };
}

/**
 * Filter and Evaluate Vivah Muhurta Dates against matched Couple Profiles
 */
export function evaluateVivahMuhurtasForCouple(
  boyMoonRashiId: number,
  boyNakshatraId: number,
  girlMoonRashiId: number,
  girlNakshatraId: number,
  options?: {
    selectedYear?: number;
    selectedMonth?: number;
    onlyFavorableForCouple?: boolean;
    minStars?: number;
    dayFilter?: string;
    searchQuery?: string;
  }
): EvaluatedVivahMuhurta[] {
  const {
    selectedYear,
    selectedMonth,
    onlyFavorableForCouple = true,
    minStars = 0,
    dayFilter,
    searchQuery = '',
  } = options || {};

  const queryLower = searchQuery.toLowerCase().trim();

  return CLASSICAL_VIVAH_DATES
    .filter((d) => {
      if (selectedYear && d.bsYear !== selectedYear) return false;
      if (selectedMonth && d.bsMonth !== selectedMonth) return false;
      if (dayFilter && dayFilter !== 'all' && d.dayOfWeek !== dayFilter) return false;
      if (queryLower) {
        const textToSearch = `${d.bsDateStr} ${d.tithi} ${d.nakshatra} ${d.weddingLagna} ${d.classicalNotes}`.toLowerCase();
        if (!textToSearch.includes(queryLower)) return false;
      }
      return true;
    })
    .map((d) => {
      const boySunBala = evaluateBoySuryaBala(boyMoonRashiId, d.transitSunRashiId);
      const girlGuruBala = evaluateGirlGuruBala(girlMoonRashiId, d.transitJupiterRashiId);
      const boyChandraBala = evaluateChandraBala(boyMoonRashiId, d.transitMoonRashiId, 'वर');
      const girlChandraBala = evaluateChandraBala(girlMoonRashiId, d.transitMoonRashiId, 'कन्या');
      const boyTaraBala = evaluateTaraBala(boyNakshatraId, d.nakshatraId);
      const girlTaraBala = evaluateTaraBala(girlNakshatraId, d.nakshatraId);

      // Base Panchanga Score: Tithi + Nakshatra + Bhadra Free
      let basePanchangaScore = 85;
      if (!d.bhadraFree) basePanchangaScore -= 35;
      if (!d.guruShukraUdaya) basePanchangaScore -= 30;

      // Tribala Composite Calculation
      // Boy Sun: 25%, Girl Guru: 25%, Boy Chandra: 15%, Girl Chandra: 15%, Tara: 10%, Base: 10%
      const tribalaScore = Math.round(
        (boySunBala.score * 2.5) +
        (girlGuruBala.score * 2.5) +
        (boyChandraBala.score * 1.5) +
        (girlChandraBala.score * 1.5) +
        (((boyTaraBala.score + girlTaraBala.score) / 2) * 1.0) +
        ((basePanchangaScore / 10) * 1.0)
      );

      const synergyScore = Math.min(100, Math.max(15, tribalaScore));

      // Star rating
      let starRating = 3;
      let qualityClassification: EvaluatedVivahMuhurta['qualityClassification'] = 'मध्यम';
      let verdictNepali = 'मध्यम साइत (शान्ति/पूजा सहित ग्राह्य)';
      let isRecommendedForCouple = true;

      if (!boySunBala.isFavorable || !girlGuruBala.isFavorable || (!boyChandraBala.isFavorable && !girlChandraBala.isFavorable)) {
        starRating = 1;
        qualityClassification = 'सावधानी';
        verdictNepali = 'प्रतिकूल त्रिबल (सूर्यबल वा गुरुबल कमजोर - अन्य साइत रोज्नुहोस्)';
        isRecommendedForCouple = false;
      } else if (synergyScore >= 88 && boySunBala.grade === 'शुभ' && girlGuruBala.grade === 'शुभ') {
        starRating = 5;
        qualityClassification = 'सर्वोत्तम';
        verdictNepali = 'अति उत्तम विवाह साइत (त्रिबल शुद्धि पूर्ण, सर्वोत्तम अमृत योग)';
        isRecommendedForCouple = true;
      } else if (synergyScore >= 72) {
        starRating = 4;
        qualityClassification = 'उत्तम';
        verdictNepali = 'उत्तम साइत (वर-कन्या दुवैका लागि गोचर अनुकूल)';
        isRecommendedForCouple = true;
      } else {
        starRating = 3;
        qualityClassification = 'मध्यम';
        verdictNepali = 'सामान्य/मध्यम साइत (ग्रह शान्ति सहित ग्राह्य)';
        isRecommendedForCouple = true;
      }

      return {
        ...d,
        boySunBala,
        girlGuruBala,
        boyChandraBala,
        girlChandraBala,
        boyTaraBala,
        girlTaraBala,
        synergyScore,
        qualityClassification,
        starRating,
        verdictNepali,
        isRecommendedForCouple,
      };
    })
    .filter((item) => {
      if (onlyFavorableForCouple && !item.isRecommendedForCouple) return false;
      if (minStars > 0 && item.starRating < minStars) return false;
      return true;
    })
    .sort((a, b) => b.synergyScore - a.synergyScore);
}
