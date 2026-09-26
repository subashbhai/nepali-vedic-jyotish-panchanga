// Authentic Vedic Visha Nadi (विषघटी) & Nadi Vichar (नाडी विचार) Engine
// Based on classical authorities: Muhurta Chintamani, Muhurta Deepika, Narada Samhita, Brihat Samhita
// Determines:
// 1. Classical Ashtakoot / Avakahada Nadi: Adi (Vata), Madhya (Pitta), Antya (Kapha)
// 2. Exact 4-Ghati toxic window (विषघटी) for each of the 27 Nakshatras
// 3. Native's birth Bhayaat evaluation (whether birth falls within toxic window or is completely Dosharahit)
// 4. Animal/poison totem and classical remedial measures (शान्ति विधि)

import { toDevanagariNumerals } from './bsCalendarData';

export type AvakahadaNadiType = 'आद्य' | 'मध्य' | 'अन्त्य';
export type NadiHumor = 'वात' | 'पित्त' | 'कफ';

export interface NakshatraVishaRule {
  nakshatraIndex: number; // 0 to 26
  nakshatraName: string;
  nadi: AvakahadaNadiType;
  humor: NadiHumor;
  vishaStartGhati: number; // Classical starting Ghati of Visha (0 to 60)
  vishaDurationGhatis: number; // Classically 4 Ghatis (96 minutes)
  totem: string; // Symbolic toxic animal or element representation
  totemDescription: string;
}

// Classical 27 Nakshatras Visha Ghati Table:
// मुहूर्तचिन्तामणि:
// "वस्विन्द्वग्नियमाब्धिरामतुषिरैः पञ्चाद्रिदिग्वह्निभि-
// र्बाणाङ्कैरवधेः क्रमेण घटिका नाडी विषस्योदिताः॥"
export const NAKSHATRA_VISHA_DATABASE: NakshatraVishaRule[] = [
  {
    nakshatraIndex: 0,
    nakshatraName: 'अश्विनी',
    nadi: 'आद्य',
    humor: 'वात',
    vishaStartGhati: 50,
    vishaDurationGhatis: 4,
    totem: 'अश्व विष',
    totemDescription: 'अश्विनी नक्षत्रको ५० देखि ५४ घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 1,
    nakshatraName: 'भरणी',
    nadi: 'मध्य',
    humor: 'पित्त',
    vishaStartGhati: 24,
    vishaDurationGhatis: 4,
    totem: 'सर्पको विष',
    totemDescription: 'भरणी नक्षत्रको २४ देखि २८ घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 2,
    nakshatraName: 'कृत्तिका',
    nadi: 'अन्त्य',
    humor: 'कफ',
    vishaStartGhati: 30,
    vishaDurationGhatis: 4,
    totem: 'गिद्धको विष',
    totemDescription: 'कृत्तिका नक्षत्रको ३० देखि ३४ घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 3,
    nakshatraName: 'रोहिणी',
    nadi: 'अन्त्य',
    humor: 'कफ',
    vishaStartGhati: 40,
    vishaDurationGhatis: 4,
    totem: 'बिच्छीको विष',
    totemDescription: 'रोहिणी नक्षत्रको ४० देखि ४४ घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 4,
    nakshatraName: 'मृगशिरा',
    nadi: 'मध्य',
    humor: 'पित्त',
    vishaStartGhati: 14,
    vishaDurationGhatis: 4,
    totem: 'सिंहको विष',
    totemDescription: 'मृगशिरा नक्षत्रको १४ देखि १८ घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 5,
    nakshatraName: 'आर्द्रा',
    nadi: 'आद्य',
    humor: 'वात',
    vishaStartGhati: 21,
    vishaDurationGhatis: 4,
    totem: 'हात्तीको विष',
    totemDescription: 'आर्द्रा नक्षत्रको २१ देखि २५ घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 6,
    nakshatraName: 'पुनर्वसु',
    nadi: 'आद्य',
    humor: 'वात',
    vishaStartGhati: 30,
    vishaDurationGhatis: 4,
    totem: 'श्वानको विष',
    totemDescription: 'पुनर्वसु नक्षत्रको ३० देखि ३४ घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 7,
    nakshatraName: 'पुष्य',
    nadi: 'मध्य',
    humor: 'पित्त',
    vishaStartGhati: 20,
    vishaDurationGhatis: 4,
    totem: 'मयूरको विष',
    totemDescription: 'पुष्य नक्षत्रको २० देखि २४ घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 8,
    nakshatraName: 'आश्लेषा',
    nadi: 'अन्त्य',
    humor: 'कफ',
    vishaStartGhati: 32,
    vishaDurationGhatis: 4,
    totem: 'नागको विष',
    totemDescription: 'आश्लेषा नक्षत्रको ३२ देखि ३६ घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 9,
    nakshatraName: 'मघा',
    nadi: 'अन्त्य',
    humor: 'कफ',
    vishaStartGhati: 30,
    vishaDurationGhatis: 4,
    totem: 'अग्नि विष',
    totemDescription: 'मघा नक्षत्रको ३० देखि ३४ घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 10,
    nakshatraName: 'पूर्वाफाल्गुनी',
    nadi: 'मध्य',
    humor: 'पित्त',
    vishaStartGhati: 20,
    vishaDurationGhatis: 4,
    totem: 'व्याघ्रको विष',
    totemDescription: 'पूर्वाफाल्गुनी नक्षत्रको २० देखि २४ घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 11,
    nakshatraName: 'उत्तराफाल्गुनी',
    nadi: 'आद्य',
    humor: 'वात',
    vishaStartGhati: 18,
    vishaDurationGhatis: 4,
    totem: 'अश्वको विष',
    totemDescription: 'उत्तराफाल्गुनी नक्षत्रको १८ देखि २२ घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 12,
    nakshatraName: 'हस्त',
    nadi: 'आद्य',
    humor: 'वात',
    vishaStartGhati: 21,
    vishaDurationGhatis: 4,
    totem: 'भालुको विष',
    totemDescription: 'हस्त नक्षत्रको २१ देखि २५ घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 13,
    nakshatraName: 'चित्रा',
    nadi: 'मध्य',
    humor: 'पित्त',
    vishaStartGhati: 20,
    vishaDurationGhatis: 4,
    totem: 'मृगको विष',
    totemDescription: 'चित्रा नक्षत्रको २० देखि २४ घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 14,
    nakshatraName: 'स्वाती',
    nadi: 'अन्त्य',
    humor: 'कफ',
    vishaStartGhati: 14,
    vishaDurationGhatis: 4,
    totem: 'गरुडको विष',
    totemDescription: 'स्वाती नक्षत्रको १४ देखि १८ घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 15,
    nakshatraName: 'विशाखा',
    nadi: 'अन्त्य',
    humor: 'कफ',
    vishaStartGhati: 14,
    vishaDurationGhatis: 4,
    totem: 'वानरको विष',
    totemDescription: 'विशाखा नक्षत्रको १४ देखि १८ घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 16,
    nakshatraName: 'अनुराधा',
    nadi: 'मध्य',
    humor: 'पित्त',
    vishaStartGhati: 10,
    vishaDurationGhatis: 4,
    totem: 'मकरको विष',
    totemDescription: 'अनुराधा नक्षत्रको १० देखि १४ घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 17,
    nakshatraName: 'ज्येष्ठा',
    nadi: 'आद्य',
    humor: 'वात',
    vishaStartGhati: 14,
    vishaDurationGhatis: 4,
    totem: 'मत्स्यको विष',
    totemDescription: 'ज्येष्ठा नक्षत्रको १४ देखि १८ घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 18,
    nakshatraName: 'मूल',
    nadi: 'आद्य',
    humor: 'वात',
    vishaStartGhati: 56,
    vishaDurationGhatis: 4,
    totem: 'वाराहको विष',
    totemDescription: 'मूल नक्षत्रको ५६ देखि ६० घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 19,
    nakshatraName: 'पूर्वाषाढा',
    nadi: 'मध्य',
    humor: 'पित्त',
    vishaStartGhati: 24,
    vishaDurationGhatis: 4,
    totem: 'महिषको विष',
    totemDescription: 'पूर्वाषाढा नक्षत्रको २४ देखि २८ घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 20,
    nakshatraName: 'उत्तराषाढा',
    nadi: 'अन्त्य',
    humor: 'कफ',
    vishaStartGhati: 20,
    vishaDurationGhatis: 4,
    totem: 'मण्डूकको विष',
    totemDescription: 'उत्तराषाढा नक्षत्रको २० देखि २४ घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 21,
    nakshatraName: 'श्रवण',
    nadi: 'अन्त्य',
    humor: 'कफ',
    vishaStartGhati: 10,
    vishaDurationGhatis: 4,
    totem: 'कपोतको विष',
    totemDescription: 'श्रवण नक्षत्रको १० देखि १४ घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 22,
    nakshatraName: 'धनिष्ठा',
    nadi: 'मध्य',
    humor: 'पित्त',
    vishaStartGhati: 10,
    vishaDurationGhatis: 4,
    totem: 'वृषभको विष',
    totemDescription: 'धनिष्ठा नक्षत्रको १० देखि १४ घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 23,
    nakshatraName: 'शतभिषा',
    nadi: 'आद्य',
    humor: 'वात',
    vishaStartGhati: 18,
    vishaDurationGhatis: 4,
    totem: 'मूषकको विष',
    totemDescription: 'शतभिषा नक्षत्रको १८ देखि २२ घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 24,
    nakshatraName: 'पूर्वाभाद्रपद',
    nadi: 'आद्य',
    humor: 'वात',
    vishaStartGhati: 16,
    vishaDurationGhatis: 4,
    totem: 'शशकको विष',
    totemDescription: 'पूर्वाभाद्रपद नक्षत्रको १६ देखि २० घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 25,
    nakshatraName: 'उत्तराभाद्रपद',
    nadi: 'मध्य',
    humor: 'पित्त',
    vishaStartGhati: 24,
    vishaDurationGhatis: 4,
    totem: 'वृश्चिकको विष',
    totemDescription: 'उत्तराभाद्रपद नक्षत्रको २४ देखि २८ घडी विषनाडी काल',
  },
  {
    nakshatraIndex: 26,
    nakshatraName: 'रेवती',
    nadi: 'अन्त्य',
    humor: 'कफ',
    vishaStartGhati: 30,
    vishaDurationGhatis: 4,
    totem: 'भ्रमरको विष',
    totemDescription: 'रेवती नक्षत्रको ३० देखि ३४ घडी विषनाडी काल',
  },
];

export interface VishaNadiResult {
  nakshatraName: string;
  nadi: AvakahadaNadiType;
  humor: NadiHumor;
  totem: string;
  vishaStartGhati: number;
  vishaEndGhati: number;
  vishaRangeGhatiDevanagari: string;
  bhayaatGhati: number;
  bhayaatGhatiDevanagari: string;
  isInVishaNadi: boolean;
  statusBadge: string;
  statusType: 'auspicious' | 'inauspicious';
  descriptionNepali: string;
  remedyNepali?: string;
}

/**
 * Finds the Nakshatra Visha rule by nakshatra name or number (1 to 27)
 */
export function findNakshatraVishaRule(nakshatraQuery: string | number): NakshatraVishaRule {
  if (typeof nakshatraQuery === 'number') {
    const idx = (nakshatraQuery - 1 + 27) % 27;
    return NAKSHATRA_VISHA_DATABASE[idx];
  }

  const cleanQuery = nakshatraQuery.trim();
  const found = NAKSHATRA_VISHA_DATABASE.find(
    (n) => cleanQuery.includes(n.nakshatraName) || n.nakshatraName.includes(cleanQuery)
  );

  return found || NAKSHATRA_VISHA_DATABASE[2]; // Default Krittika (index 2)
}

/**
 * Comprehensive Visha Nadi evaluation for native's birth moment
 * @param nakshatraQuery Nakshatra name or 1-indexed number
 * @param bhayaatDecimal Elapsed ghatis of nakshatra at birth (e.g. 43.78)
 */
export function evaluateVishaNadi(
  nakshatraQuery: string | number,
  bhayaatDecimal?: number
): VishaNadiResult {
  const rule = findNakshatraVishaRule(nakshatraQuery);
  const startG = rule.vishaStartGhati;
  const endG = rule.vishaStartGhati + rule.vishaDurationGhatis;

  const startDev = toDevanagariNumerals(startG);
  const endDev = toDevanagariNumerals(endG);
  const rangeDev = `${startDev}–${endDev} घडी`;

  // If Bhayaat is not provided, return baseline span info
  if (bhayaatDecimal === undefined || isNaN(bhayaatDecimal)) {
    return {
      nakshatraName: rule.nakshatraName,
      nadi: rule.nadi,
      humor: rule.humor,
      totem: rule.totem,
      vishaStartGhati: startG,
      vishaEndGhati: endG,
      vishaRangeGhatiDevanagari: rangeDev,
      bhayaatGhati: 0,
      bhayaatGhatiDevanagari: '०:००',
      isInVishaNadi: false,
      statusBadge: `दोषमुक्त (शुभ - ${rule.totem} ${rangeDev})`,
      statusType: 'auspicious',
      descriptionNepali: `${rule.nakshatraName} नक्षत्रमा विषनाडी काल ${rangeDev} (${rule.totem}) हुन्छ।`,
    };
  }

  // Format Bhayaat in Ghati:Pala
  const g = Math.floor(bhayaatDecimal);
  const p = Math.floor((bhayaatDecimal - g) * 60);
  const pad2 = (val: number) => String(val).padStart(2, '0');
  const bhayaatDev = `${toDevanagariNumerals(pad2(g))}:${toDevanagariNumerals(pad2(p))}`;

  // Classical test: is birth within [startG, endG]?
  const isInVisha = bhayaatDecimal >= startG && bhayaatDecimal <= endG;

  if (isInVisha) {
    return {
      nakshatraName: rule.nakshatraName,
      nadi: rule.nadi,
      humor: rule.humor,
      totem: rule.totem,
      vishaStartGhati: startG,
      vishaEndGhati: endG,
      vishaRangeGhatiDevanagari: rangeDev,
      bhayaatGhati: bhayaatDecimal,
      bhayaatGhatiDevanagari: bhayaatDev,
      isInVishaNadi: true,
      statusBadge: `विषनाडी अन्तर्गत (${rangeDev}, शान्ति आवश्यक)`,
      statusType: 'inauspicious',
      descriptionNepali: `जन्म भयात (${bhayaatDev} घडी) ${rule.nakshatraName} नक्षत्रको विषघटी काल ${rangeDev} (${rule.totem}) अन्तर्गत परेको छ। यसले स्वास्थ्य वा जीवन संघर्षमा प्रतिकूलता दिनसक्ने भएकाले वैदिक शान्ति शुभ रहन्छ।`,
      remedyNepali: 'महामृत्युञ्जय मन्त्र जप, घृतपात्र दान, सुवर्ण वा तिल दान तथा शिवजीको रुद्राभिषेक पूजन विधिपूर्वक गर्नु उपयुक्त हुन्छ।',
    };
  }

  // Outside Visha Nadi ( शुभ / दोषरहित )
  const timingRelation = bhayaatDecimal > endG ? 'समाप्त भइसकेको' : 'सुरु हुन बाँकी';
  return {
    nakshatraName: rule.nakshatraName,
    nadi: rule.nadi,
    humor: rule.humor,
    totem: rule.totem,
    vishaStartGhati: startG,
    vishaEndGhati: endG,
    vishaRangeGhatiDevanagari: rangeDev,
    bhayaatGhati: bhayaatDecimal,
    bhayaatGhatiDevanagari: bhayaatDev,
    isInVishaNadi: false,
    statusBadge: `दोषरहित (शुभ)`,
    statusType: 'auspicious',
    descriptionNepali: `जन्म भयात (${bhayaatDev} घडी) विषघटी काल ${rangeDev} (${rule.totem}) भन्दा बाहिर (${timingRelation}) रहेकाले विषनाडी दोष लाग्दैन, जातक पूर्णतः दोषरहित तथा शुभ छ।`,
  };
}
