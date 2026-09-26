// Traditional Nepali Sait & Muhurta Engine
// Classical Astrological Algorithms for:
// 1. Rudri Jurrne / Shiva Vaas (रुद्री जुर्ने / शिव वास विचार)
// 2. Agni Vaas (अग्नि वास विचार for Havan / Yajna)
// 3. Disha Shool (यात्रा दिशाशूल विचार & परिहार)
// 4. Day & Night Choghadiya (अहोरात्र चौघडिया मुहूर्त)
// 5. Planetary Hora (दैनिक ग्रह होरा चक्र)
// 6. Sohra Shraddha / Pitru Paksha exact Tithi matching (महालय श्राद्ध निर्णय)
// 7. Commercial / Business Sait (वाणिज्य साइत)

import { toDevanagariNumerals } from './nepaliCalendar';
import { formatTimeNepali } from './panchangaEngine';
import { calculatePlanetaryPositions, getAyanamsa, RASHI_DATA, NAKSHATRA_DATA } from './astroCalculations';

export interface ShivaVaasResult {
  location: string; // e.g., 'कैलाशे', 'नन्दी पृष्ठे', 'भोजने', 'शयने', 'सभायाम्', 'क्रीडायाम्', 'श्मशाने'
  locationNepali: string; // नेपाली अर्थ: 'कैलाशमा शिवजी विराजमान', 'नन्दीको पिठ्युँमा'
  isFavorable: boolean; // True if Rudri Jurxa (कैलाशे वा नन्दी पृष्ठे)
  resultText: string; // 'अति शुभ, सुख-समृद्धि एवं अभीष्ट फलदायक (रुद्री जुरेको छ)'
  description: string;
  sourceText: string; // 'मुहूर्तचिन्तामणि - शिववास विचार'
}

export interface AgniVaasResult {
  residence: 'पृथ्वी' | 'पाताल' | 'आकाश';
  isFavorable: boolean; // True if Prithvi
  resultText: string;
  description: string;
  sourceText: string; // 'मुहूर्तमार्तण्ड - अग्निवास विचार'
}

export interface DishaShoolResult {
  direction: 'पूर्व' | 'पश्चिम' | 'उत्तर' | 'दक्षिण';
  isForbidden: boolean;
  remedyNepali: string; // परिहार (e.g. 'घिउ वा पान खाएर यात्रा शुभारम्भ गर्ने')
  notes: string;
}

export interface ChoghadiyaSlot {
  period: 'दिन' | 'रात';
  name: 'शुभ' | 'लाभ' | 'अमृत' | 'चर' | 'रोग' | 'उद्वेग' | 'काल';
  type: 'शुभ' | 'अशुभ' | 'सामान्य';
  startTime: string;
  endTime: string;
  ruler: string;
  description: string;
}

export interface HoraSlot {
  slotNumber: number;
  timeRange: string;
  lord: string;
  isFavorable: boolean;
  suitableWork: string;
}

export interface ShraddhaDayInfo {
  isShraddhaPaksha: boolean; // Whether currently in Pitru Paksha
  shraddhaTithiName?: string; // e.g. "द्वितीया श्राद्ध", "सर्वपितृ औंसी श्राद्ध"
  aparahnaKaal?: string; // 1:00 PM to 3:30 PM approx
  significance?: string;
}

/**
 * Calculates Shiva Vaas (Rudri Jurrne / नजुर्ने)
 * Classical Formula: (Tithi Count from Shukla Pratipada x 2 + 5) % 7
 * Remainder 1: Kailashe (कैलाशे - सौख्यं) -> शुभ (रुद्री जुर्छ)
 * Remainder 2: Nandi Prishthe (नन्दी पृष्ठे - अभीष्ट सिद्धि) -> शुभ (रुद्री जुर्छ)
 * Remainder 3: Bhojane (भोजने - पीडा) -> अशुभ (रुद्री जुर्दैन)
 * Remainder 4: Shayane (शयने - कष्ट) -> अशुभ (रुद्री जुर्दैन)
 * Remainder 5: Sabhayam (सभायाम् - सन्ताप) -> अशुभ (रुद्री जुर्दैन)
 * Remainder 6: Kridhayam (क्रीडायाम् - शोक) -> अशुभ (रुद्री जुर्दैन)
 * Remainder 0 (7): Shmashane (श्मशाने - मरण/सर्वथा वर्जित) -> अशुभ (रुद्री जुर्दैन)
 */
export function calculateShivaVaas(tithiNumber: number, paksha: 'शुक्ल' | 'कृष्ण'): ShivaVaasResult {
  // Total Tithi 1-30: Shukla 1-15 is 1-15, Krishna 1-15 is 16-30
  let tithiSeq = tithiNumber;
  if (paksha === 'कृष्ण') {
    tithiSeq = tithiNumber + 15;
  }
  if (tithiSeq > 30) tithiSeq = 30;

  const remainder = ((tithiSeq * 2) + 5) % 7;

  switch (remainder) {
    case 1:
      return {
        location: 'कैलाशे',
        locationNepali: 'कैलाश पर्वतमा (भगवान शिव कैलाशमा विराजमान)',
        isFavorable: true,
        resultText: 'परम शुभ (रुद्री जुरेको छ)',
        description: 'कैलाशमा शिव वास हुँदा रुद्री पाठ, रुद्राभिषेक तथा शिव आराधना गर्दा परिवारमा सुख, शान्ति र आनन्द प्राप्ति हुन्छ।',
        sourceText: 'मुहूर्तचिन्तामणि - शिववास विचार: "कैलाशे लभते सौख्यं..."',
      };
    case 2:
      return {
        location: 'नन्दी पृष्ठे',
        locationNepali: 'नन्दीको पिठ्युँमा (भगवान शिव नन्दी सवार)',
        isFavorable: true,
        resultText: 'अति शुभ (रुद्री जुरेको छ)',
        description: 'नन्दीको पिठ्युँमा शिव वास हुँदा मनोवाञ्छित कार्य सिद्धि, पदोन्नति र समस्त विघ्न विनाश हुन्छ।',
        sourceText: 'मुहूर्तचिन्तामणि - शिववास विचार: "नन्दिपृष्ठेऽभीष्टसिद्धिश्च..."',
      };
    case 3:
      return {
        location: 'भोजने',
        locationNepali: 'भोजन कक्षमा (भगवान शिव भोजनरत)',
        isFavorable: false,
        resultText: 'अशुभ (रुद्री जुर्दैन)',
        description: 'भोजनरत अवस्थामा रुद्राभिषेक गर्दा पीडा र अशान्ति हुने शास्त्रीय मान्यता रहेकाले आज रुद्री नगर्नु उपयुक्त हुन्छ।',
        sourceText: 'मुहूर्तचिन्तामणि - शिववास विचार: "भोजने पीडा भवति..."',
      };
    case 4:
      return {
        location: 'शयने',
        locationNepali: 'शयन कक्षमा (भगवान शिव शयनरत)',
        isFavorable: false,
        resultText: 'अशुभ (रुद्री जुर्दैन)',
        description: 'शिवजी विश्राम तथा शयनरत अवस्थामा हुनुभएकाले रुद्री अनुष्ठान फलदायी मानिँदैन।',
        sourceText: 'मुहूर्तचिन्तामणि - शिववास विचार: "शयने च उपद्रवः..."',
      };
    case 5:
      return {
        location: 'सभायाम्',
        locationNepali: 'सभामा (भगवान शिव देवसभामा उपस्थित)',
        isFavorable: false,
        resultText: 'अशुभ (रुद्री जुर्दैन)',
        description: 'सभामा शिव वास हुँदा सन्ताप तथा मनोद्वेग बढ्ने भएकाले नित्य पूजा बाहेक विशेष काम्य रुद्री त्याज्य छ।',
        sourceText: 'मुहूर्तचिन्तामणि - शिववास विचार: "सभायां च सन्तापः..."',
      };
    case 6:
      return {
        location: 'क्रीडायाम्',
        locationNepali: 'क्रीडास्थलमा (भगवान शिव क्रीडारत)',
        isFavorable: false,
        resultText: 'अशुभ (रुद्री जुर्दैन)',
        description: 'क्रीडारत शिव वास हुँदा भय तथा शोक उत्पन्न हुने मानिन्छ।',
        sourceText: 'मुहूर्तचिन्तामणि - शिववास विचार: "क्रीडायां शोकमाप्नुयात्..."',
      };
    case 0:
    default:
      return {
        location: 'श्मशाने',
        locationNepali: 'श्मशानमा (भगवान शिव श्मशानबासी)',
        isFavorable: false,
        resultText: 'वर्जित (रुद्री जुर्दैन)',
        description: 'श्मशान वासको समयमा काम्य रुद्राभिषेक सर्वथा निषेध मानिन्छ।',
        sourceText: 'मुहूर्तचिन्तामणि - शिववास विचार: "श्मशाने मरणं ध्रुवम्..."',
      };
  }
}

/**
 * Calculates Agni Vaas for Havan / Homam
 * Classical Formula: (Tithi 1-30 + Vara (Sun=1..Sat=7) + 1) % 4
 * Remainder 0 or 1: Prithvi (पृथ्वी) -> अति शुभ, धन-धान्य वृद्धि (हवन फलदायी)
 * Remainder 2: Paatal (पाताल) -> धन हानि, विघ्न (हवन नगर्ने)
 * Remainder 3: Aakash / Swarga (आकाश) -> प्राण भय / कार्य नाश (हवन नगर्ने)
 */
export function calculateAgniVaas(tithiNumber: number, dayOfWeekIndex: number, paksha: 'शुक्ल' | 'कृष्ण' = 'शुक्ल'): AgniVaasResult {
  let tithiSeq = tithiNumber;
  if (paksha === 'कृष्ण') {
    tithiSeq = tithiNumber + 15;
  }
  if (tithiSeq > 30) tithiSeq = 30;

  const varaSeq = dayOfWeekIndex + 1; // Sun=1, Mon=2 ... Sat=7
  const remainder = (tithiSeq + varaSeq + 1) % 4;

  if (remainder === 0 || remainder === 1) {
    return {
      residence: 'पृथ्वी',
      isFavorable: true,
      resultText: 'पृथ्वीमा अग्नि वास (अति शुभ - हवन फलदायी)',
      description: 'अग्निदेव धर्तीमाता (पृथ्वी) मा हुनुहुन्छ। यस समयमा गरिएको हवन, होम, रुद्री-हवन तथा यज्ञ पूर्ण फलदायी र सुख-शान्तिदायक हुन्छ।',
      sourceText: 'मुहूर्तमार्तण्ड: "तिथिवारं संयुतं चैकमेकं च चतुर्हृतम्। एकशेषे भुवि वासः सर्वसिद्धिकरः..."',
    };
  } else if (remainder === 2) {
    return {
      residence: 'पाताल',
      isFavorable: false,
      resultText: 'पातालमा अग्नि वास (अशुभ - धन हानि)',
      description: 'अग्निदेव पातालमा रहनुभएकाले आज काम्य हवन गर्दा धन तथा सम्पति हानि हुने मानिन्छ। विशेष काम्य यज्ञ त्याग्नुहोला।',
      sourceText: 'मुहूर्तमार्तण्ड: "द्विशेषे पाताले वासः धनहानिकरः..."',
    };
  } else {
    return {
      residence: 'आकाश',
      isFavorable: false,
      resultText: 'आकाशमा अग्नि वास (अशुभ - प्राणपीडा/विघ्न)',
      description: 'अग्निदेव आकाशमा हुनुभएकाले आज विशेष अनुष्ठानको हवन गर्दा कार्यमा विघ्न र बाधा आउन सक्ने शास्त्रीय मान्यता छ।',
      sourceText: 'मुहूर्तमार्तण्ड: "त्रिभिः स्वर्गे प्राणनाशः..."',
    };
  }
}

/**
 * Calculates Disha Shool and traditional remedies
 */
export function calculateDishaShool(dayOfWeekIndex: number): DishaShoolResult {
  // Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
  switch (dayOfWeekIndex) {
    case 0: // Sunday
      return {
        direction: 'पश्चिम',
        isForbidden: true,
        remedyNepali: 'घिउ वा पान खाएर यात्रा सुरु गर्ने',
        notes: 'आइतबार पश्चिम दिशाशूल मानिन्छ। अत्यावश्यक भएमा घिउ वा पान खाएर पूर्व दिशाबाट प्रस्थान गरी यात्रा गर्न सकिन्छ।',
      };
    case 1: // Monday
      return {
        direction: 'पूर्व',
        isForbidden: true,
        remedyNepali: 'ऐना हेरेर वा दूध/खीर खाएर यात्रा सुरु गर्ने',
        notes: 'सोमबार पूर्व दिशाशूल मानिन्छ। ऐना हेरेर वा दूध खाएर यात्रा गर्दा दोष निवारण हुन्छ।',
      };
    case 2: // Tuesday
      return {
        direction: 'उत्तर',
        isForbidden: true,
        remedyNepali: 'सख्खर/गुड वा धनियाँ खाएर यात्रा सुरु गर्ने',
        notes: 'मङ्गलबार उत्तर दिशाशूल मानिन्छ। सख्खर वा धनियाँ सेवन गरी दक्षिणतर्फ केही पाइला हिँडेर यात्रा गर्नुहोला।',
      };
    case 3: // Wednesday
      return {
        direction: 'उत्तर',
        isForbidden: true,
        remedyNepali: 'तिल वा धनियाँ खाएर यात्रा सुरु गर्ने',
        notes: 'बुधबार उत्तर दिशाशूल मानिन्छ। तिल वा हरियो धनियाँ खाएर यात्रा गर्नु उत्तम हुन्छ।',
      };
    case 4: // Thursday
      return {
        direction: 'दक्षिण',
        isForbidden: true,
        remedyNepali: 'दही खाएर यात्रा सुरु गर्ने',
        notes: 'बिहीबार दक्षिण दिशाशूल मानिन्छ। दही वा पहेँलो वस्तुको दर्शन गरेर यात्रा गर्दा दोष नाश हुन्छ।',
      };
    case 5: // Friday
      return {
        direction: 'पश्चिम',
        isForbidden: true,
        remedyNepali: 'जौ वा रायोको गेडा खाएर यात्रा सुरु गर्ने',
        notes: 'शुक्रबार पश्चिम दिशाशूल मानिन्छ। जौ वा रायो खाएर यात्रा गर्नुहोला।',
      };
    case 6: // Saturday
    default:
      return {
        direction: 'पूर्व',
        isForbidden: true,
        remedyNepali: 'अदुवा वा मासको दाल खाएर यात्रा सुरु गर्ने',
        notes: 'शनिबार पूर्व दिशाशूल मानिन्छ। अदुवा वा मासको गेडा खाएर पूर्व दिशाको यात्रा गर्नु सुरक्षित मानिन्छ।',
      };
  }
}

/**
 * Calculates Full 16-slot Choghadiya (8 Day parts + 8 Night parts)
 */
export function calculateFullChoghadiya(
  sunriseDec: number,
  sunsetDec: number,
  dayOfWeekIndex: number
): { daySlots: ChoghadiyaSlot[]; nightSlots: ChoghadiyaSlot[] } {
  const dayDuration = Math.max(8.0, sunsetDec - sunriseDec);
  const nightDuration = Math.max(8.0, 24.0 - dayDuration);

  const dayPart = dayDuration / 8.0;
  const nightPart = nightDuration / 8.0;

  // Day sequence for each weekday (Sun..Sat)
  const dayRulerSequences: Array<Array<'शुभ' | 'लाभ' | 'अमृत' | 'चर' | 'रोग' | 'उद्वेग' | 'काल'>> = [
    ['उद्वेग', 'चर', 'लाभ', 'अमृत', 'काल', 'शुभ', 'रोग', 'उद्वेग'], // Sun
    ['अमृत', 'काल', 'शुभ', 'रोग', 'उद्वेग', 'चर', 'लाभ', 'अमृत'], // Mon
    ['रोग', 'उद्वेग', 'चर', 'लाभ', 'अमृत', 'काल', 'शुभ', 'रोग'], // Tue
    ['चर', 'लाभ', 'अमृत', 'काल', 'शुभ', 'रोग', 'उद्वेग', 'चर'], // Wed
    ['लाभ', 'अमृत', 'काल', 'शुभ', 'रोग', 'उद्वेग', 'चर', 'लाभ'], // Thu
    ['शुभ', 'रोग', 'उद्वेग', 'चर', 'लाभ', 'अमृत', 'काल', 'शुभ'], // Fri
    ['काल', 'शुभ', 'रोग', 'उद्वेग', 'चर', 'लाभ', 'अमृत', 'काल'], // Sat
  ];

  // Night sequence for each weekday
  const nightRulerSequences: Array<Array<'शुभ' | 'लाभ' | 'अमृत' | 'चर' | 'रोग' | 'उद्वेग' | 'काल'>> = [
    ['शुभ', 'अमृत', 'चर', 'रोग', 'काल', 'लाभ', 'उद्वेग', 'शुभ'], // Sun night
    ['चल', 'रोग', 'काल', 'लाभ', 'उद्वेग', 'शुभ', 'अमृत', 'चल'] as any, // Mon night
    ['काल', 'लाभ', 'उद्वेग', 'शुभ', 'अमृत', 'चर', 'रोग', 'काल'], // Tue night
    ['उद्वेग', 'शुभ', 'अमृत', 'चर', 'रोग', 'काल', 'लाभ', 'उद्वेग'], // Wed night
    ['रोग', 'काल', 'लाभ', 'उद्वेग', 'शुभ', 'अमृत', 'चर', 'रोग'], // Thu night
    ['लाभ', 'उद्वेग', 'शुभ', 'अमृत', 'चर', 'रोग', 'काल', 'लाभ'], // Fri night
    ['अमृत', 'चर', 'रोग', 'काल', 'लाभ', 'उद्वेग', 'शुभ', 'अमृत'], // Sat night
  ];

  const slotTypeMap: Record<string, 'शुभ' | 'अशुभ' | 'सामान्य'> = {
    'शुभ': 'शुभ',
    'लाभ': 'शुभ',
    'अमृत': 'शुभ',
    'चर': 'सामान्य',
    'रोग': 'अशुभ',
    'उद्वेग': 'अशुभ',
    'काल': 'अशुभ',
  };

  const slotDescMap: Record<string, string> = {
    'शुभ': 'धर्म, मङ्गल कार्य, विवाह तथा धार्मिक अनुष्ठानका लागि श्रेष्ठ।',
    'लाभ': 'नयाँ व्यापार, वित्तीय लगानी, खरिद-बिक्री तथा लाभदायी कामका लागि सर्वोत्तम।',
    'अमृत': 'सर्वकार्य सिद्धि, औषध सेवन, नयाँ यात्रा तथा दीर्घकालीन काम आरम्भ।',
    'चर': 'यात्रा, सवारी साधन खरिद तथा चलायमान कामका लागि सामान्य/अनुकूल।',
    'रोग': 'विवाद, रोगवृद्धि तथा कलह कारक (नयाँ कार्य नगर्नुहोला)।',
    'उद्वेग': 'मानसिक चिन्ता, भय तथा तनावकारक (शुभ काम वर्जित)।',
    'काल': 'मृत्युतुल्य कष्ट, हानी तथा विघ्नकारक (सबै शुभ कार्य वर्जित)।',
  };

  const daySeq = dayRulerSequences[dayOfWeekIndex] || dayRulerSequences[0];
  const nightSeq = nightRulerSequences[dayOfWeekIndex] || nightRulerSequences[0];

  const daySlots: ChoghadiyaSlot[] = daySeq.map((name, i) => {
    const s = sunriseDec + i * dayPart;
    const e = sunriseDec + (i + 1) * dayPart;
    return {
      period: 'दिन',
      name: (name === ('चल' as any) ? 'चर' : name),
      type: slotTypeMap[name] || 'सामान्य',
      startTime: formatTimeNepali(s),
      endTime: formatTimeNepali(e),
      ruler: name,
      description: slotDescMap[name] || '',
    };
  });

  const nightSlots: ChoghadiyaSlot[] = nightSeq.map((name, i) => {
    const s = sunsetDec + i * nightPart;
    const e = sunsetDec + (i + 1) * nightPart;
    return {
      period: 'रात',
      name: (name === ('चल' as any) ? 'चर' : name),
      type: slotTypeMap[name] || 'सामान्य',
      startTime: formatTimeNepali(s),
      endTime: formatTimeNepali(e),
      ruler: name,
      description: slotDescMap[name] || '',
    };
  });

  return { daySlots, nightSlots };
}

/**
 * Calculates Planetary Hora for the 24 hours of the day
 * Order of Hora: Sun -> Venus -> Mercury -> Moon -> Saturn -> Jupiter -> Mars -> Sun (descending orbital speed)
 */
export function calculatePlanetaryHora(sunriseDec: number, dayOfWeekIndex: number): HoraSlot[] {
  // Days lords in standard order: Sun, Mon, Tue, Wed, Thu, Fri, Sat
  const dayLordOrder = ['सूर्य', 'चन्द्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
  // Chaldean Hora sequence: Sun -> Venus -> Mercury -> Moon -> Saturn -> Jupiter -> Mars
  const chaldeanOrder = ['सूर्य', 'शुक्र', 'बुध', 'चन्द्र', 'शनि', 'गुरु', 'मंगल'];

  const firstHoraLord = dayLordOrder[dayOfWeekIndex];
  const firstIndex = chaldeanOrder.indexOf(firstHoraLord);

  const horaList: HoraSlot[] = [];
  for (let i = 0; i < 24; i++) {
    const lord = chaldeanOrder[(firstIndex + i) % 7];
    const sHour = (sunriseDec + i) % 24;
    const eHour = (sunriseDec + i + 1) % 24;

    const isFav = ['गुरु', 'शुक्र', 'बुध', 'चन्द्र'].includes(lord);
    let suitable = 'सामान्य दैनिक कार्य';
    if (lord === 'सूर्य') suitable = 'सरकारी काम, प्रशासनिक निर्णय, पदभार ग्रहण';
    if (lord === 'चन्द्र') suitable = 'यात्रा, जलसम्बन्धी कार्य, सौन्दर्य र नवीन कार्य';
    if (lord === 'मंगल') suitable = 'साहस, जग्गाजमिन, रक्षा र प्राविधिक कार्य';
    if (lord === 'बुध') suitable = 'व्यापार, लेखा, अध्ययन, सञ्चार र सम्झौता';
    if (lord === 'गुरु') suitable = 'धार्मिक अनुष्ठान, मन्त्रदीक्षा, अध्ययन र विवाह';
    if (lord === 'शुक्र') suitable = 'वैवाहिक कार्य, वस्त्र, आभूषण र कला-सङ्गीत';
    if (lord === 'शनि') suitable = 'कारखाना, फलाम, कृषि र पुराना समस्या समाधान';

    horaList.push({
      slotNumber: i + 1,
      timeRange: `${formatTimeNepali(sHour)} - ${formatTimeNepali(eHour)}`,
      lord,
      isFavorable: isFav,
      suitableWork: suitable,
    });
  }

  return horaList;
}

/**
 * Sohra Shraddha (Pitru Paksha) exact daily identification
 * Bhadra Shukla Purnima (पूर्णिमा श्राद्ध) to Ashwin Krishna Amavasya (सर्वपितृ औंसी श्राद्ध)
 */
export function getShraddhaStatus(
  bsMonth: number,
  bsDay: number,
  tithiName: string,
  paksha: 'शुक्ल' | 'कृष्ण'
): ShraddhaDayInfo {
  // In BS calendar:
  // Bhadra Month = 5, Ashwin Month = 6
  // Bhadra Shukla Purnima (Day ~30/31 of Bhadra) -> Purnima Shraddha
  // Ashwin Krishna Paksha (First half of Ashwin) -> Pratipada to Amavasya Shraddhas

  const isBhadraPurnima = (bsMonth === 5 && tithiName === 'पूर्णिमा');
  const isAshwinKrishna = (bsMonth === 6 && paksha === 'कृष्ण');

  if (isBhadraPurnima) {
    return {
      isShraddhaPaksha: true,
      shraddhaTithiName: 'पूर्णिमा श्राद्ध (सोह्रश्राद्ध प्रारम्भ)',
      aparahnaKaal: 'दिउँसो १२:४५ देखि ०३:१५ सम्म (अपराह्न काल)',
      significance: 'महालय सोह्रश्राद्धको पहिलो दिन, भाद्र शुक्ल पूर्णिमामा दिवङ्गत पितृहरूको श्राद्ध गर्ने समय।',
    };
  }

  if (isAshwinKrishna) {
    let tName = `${tithiName} श्राद्ध`;
    if (tithiName === 'औंसी') {
      tName = 'सर्वपितृ औंसी श्राद्ध (सोह्रश्राद्ध समापन)';
    } else if (tithiName === 'नवमी') {
      tName = 'मातृ नवमी श्राद्ध (अविवाहिता वा आमाको श्राद्ध)';
    } else if (tithiName === 'एकादशी') {
      tName = 'एकादशी श्राद्ध / संन्यास लिने पितृहरूको श्राद्ध';
    } else if (tithiName === 'त्रयोदशी') {
      tName = 'त्रयोदशी श्राद्ध / मघा श्राद्ध';
    } else if (tithiName === 'चतुर्दशी') {
      tName = 'घायल / अकाल मृत्यु भएका पितृहरूको श्राद्ध (चतुर्दशी श्राद्ध)';
    }

    return {
      isShraddhaPaksha: true,
      shraddhaTithiName: tName,
      aparahnaKaal: 'दिउँसो १२:४५ देखि ०३:१५ सम्म (कुतप एवं रोहिण मुहूर्त)',
      significance: `यस दिन ${tithiName} तिथिमा दिवङ्गत हुनुभएका सम्पूर्ण पितृहरूको तृप्तिका लागि पिण्डदान तथा तर्पण गर्ने विधान छ।`,
    };
  }

  return {
    isShraddhaPaksha: false,
  };
}

/**
 * 9 Grahas complete daily position calculations
 */
export function getDailyNinePlanets(julianDay: number, ayanamsa: number): Array<{
  name: string;
  rashiName: string;
  degreeStr: string;
  nakshatraName: string;
  pada: number;
  speed: string;
  isRetrograde: boolean;
  status: string;
}> {
  const planets = calculatePlanetaryPositions(julianDay, ayanamsa, 1);
  return planets.map((p) => {
    const degInRashi = p.longitude % 30;
    const d = Math.floor(degInRashi);
    const m = Math.floor((degInRashi - d) * 60);
    const s = Math.floor(((degInRashi - d) * 60 - m) * 60);

    const degDev = toDevanagariNumerals(String(d).padStart(2, '0'));
    const minDev = toDevanagariNumerals(String(m).padStart(2, '0'));
    const secDev = toDevanagariNumerals(String(s).padStart(2, '0'));

    const nakData = NAKSHATRA_DATA[p.nakshatraId - 1] || NAKSHATRA_DATA[0];

    return {
      name: p.name,
      rashiName: p.rashiName,
      degreeStr: `${degDev}° ${minDev}' ${secDev}"`,
      nakshatraName: nakData.name,
      pada: p.pada,
      speed: p.speed !== undefined ? `${toDevanagariNumerals(Math.abs(p.speed).toFixed(2))}°/दिन` : 'सामान्य',
      isRetrograde: !!p.isRetrograde,
      status: p.isRetrograde ? 'वक्री (R)' : 'मार्गी (D)',
    };
  });
}
