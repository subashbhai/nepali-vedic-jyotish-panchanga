import { getCanonicalLahiriAyanamsa } from './canonicalAstroEngine';
import { toDevanagariNumerals } from './nepaliCalendar';

export type AyanamsaSystem =
  | 'Chitrapaksha'
  | 'Lahiri'
  | 'KP'
  | 'Raman'
  | 'Yukteshwar'
  | 'FaganBradley'
  | 'Sayan';

export interface AyanamsaMetadata {
  id: AyanamsaSystem;
  nameNepali: string;
  nameEnglish: string;
  shortLabel: string;
  epochInfo: string;
  referenceStar: string;
  offsetDescription: string;
  descriptionNepali: string;
  isNationalStandard?: boolean;
}

export const AYANAMSA_SYSTEM_LIST: AyanamsaMetadata[] = [
  {
    id: 'Chitrapaksha',
    nameNepali: 'चित्रापक्ष / लाहिरी (Chitrapaksha / NC Lahiri)',
    nameEnglish: 'Chitrapaksha / NC Lahiri (National Standard)',
    shortLabel: 'चित्रापक्ष (Lahiri)',
    epochInfo: 'स्पाइका (चित्रा) तारा १८०° - शून्य वर्ष २८५ ई.',
    referenceStar: 'चित्रा तारा (Spica - Alpha Virginis 180°)',
    offsetDescription: '०° ००\' ००" (आधार मानक)',
    descriptionNepali:
      'नेपाल पञ्चाङ्ग निर्णायक विकास समिति तथा भारत क्यालेन्डर रिफर्म कमिटी (NC Lahiri) द्वारा स्वीकृत राष्ट्रिय आधिकारिक मानक अयनांश। चित्रा नक्षत्रको तारा १८० अंशमा स्थिर मानिन्छ।',
    isNationalStandard: true,
  },
  {
    id: 'KP',
    nameNepali: 'के.पी. प्रणाली (Krishnamurti Paddhati - KP)',
    nameEnglish: 'Krishnamurti Paddhati (KP System)',
    shortLabel: 'के.पी. (KP)',
    epochInfo: 'प्रो. कृष्णमूर्ति सब-लर्ड पद्धति - शून्य वर्ष २९१ ई.',
    referenceStar: 'केपी नक्षत्र उप-स्वामी चक्र (Sub-Lord Grid)',
    offsetDescription: '-०° ०५\' ५६" (लाहिरीभन्दा ५\' ५६" कम)',
    descriptionNepali:
      'प्रोफेसर के.एस. कृष्णमूर्तिद्वारा प्रतिपादित नक्षत्र उप-स्वामी (Sub-Lord) सिद्धान्त। यसले ग्रह र भाव स्पष्टमा सूक्ष्म अन्तर निर्धारण गर्दछ।',
  },
  {
    id: 'Raman',
    nameNepali: 'डा. बी.भी. रमण (B.V. Raman Ayanamsa)',
    nameEnglish: 'Dr. B.V. Raman Ayanamsa',
    shortLabel: 'रमण (Raman)',
    epochInfo: 'शून्य वर्ष ३९७ ई. (वराहमिहिर काल गणना)',
    referenceStar: 'रेवती तारा अन्तिम विन्दु ३५९° ५०\'',
    offsetDescription: '-१° २३\' ००" (लाहिरीभन्दा ~१° २३\' कम)',
    descriptionNepali:
      'अन्तर्राष्ट्रिय ख्यातिप्राप्त ज्योतिषी डा. बी.भी. रमणद्वारा प्रतिपादित अयनांश। परम्परागत दक्षिण तथा उत्तर भारतीय शास्त्रीय विश्लेषणमा विशेष प्रयोग हुन्छ।',
  },
  {
    id: 'Yukteshwar',
    nameNepali: 'स्वामी श्री युक्तेश्वर (Sri Yukteshwar)',
    nameEnglish: 'Swami Sri Yukteshwar (The Holy Science)',
    shortLabel: 'युक्तेश्वर (Yukteshwar)',
    epochInfo: 'शून्य वर्ष ४९९ ई. (आर्यभट युग सन्दर्भ)',
    referenceStar: 'आर्यभट विषुव विन्दु (Aryabhata Epoch)',
    offsetDescription: '+०° २२\' ००" (लाहिरीभन्दा ~२२\' बढी)',
    descriptionNepali:
      'द होली साइन्सका प्रणेता स्वामी श्री युक्तेश्वर गिरिद्वारा प्रतिपादित सम्वत्सर अयनांश गणना।',
  },
  {
    id: 'FaganBradley',
    nameNepali: 'फागन-ब्राड्ले (Fagan-Bradley Sidereal)',
    nameEnglish: 'Fagan-Bradley (Western Sidereal)',
    shortLabel: 'फागन (Fagan-Bradley)',
    epochInfo: 'रोहिणी (अल्डेबरन) १५° वृष',
    referenceStar: 'अल्डेबरन (Aldebaran at 15° Taurus)',
    offsetDescription: '+०° ५४\' ००" (लाहिरीभन्दा ~५४\' बढी)',
    descriptionNepali:
      'पाश्चात्य निरयण ज्योतिषी सिरिल फागन र डोनाल्ड ब्राड्लेद्वारा वैज्ञानिक बेबिलोनियन तारा विन्दुमा आधारित अयनांश।',
  },
  {
    id: 'Sayan',
    nameNepali: 'सायन प्रणाली (Sayana / Tropical Zodiac - ०°)',
    nameEnglish: 'Sayana / Tropical Zodiac (0° Ayanamsha)',
    shortLabel: 'सायन (Tropical ०°)',
    epochInfo: 'वसन्त सम्पात (Vernal Equinox = ०° मेष)',
    referenceStar: 'सायन विषुव रेखा (Equinox)',
    offsetDescription: 'अयनांश = ०° ००\' ००" (पूर्ण सायन)',
    descriptionNepali:
      'अयनांश शून्य मानी वसन्त सम्पातलाई मेषको सुरुवाती विन्दु मान्ने पाश्चात्य पद्धति।',
  },
];

/**
 * Returns metadata for the given ayanamsa system
 */
export function getAyanamsaMetadata(system: AyanamsaSystem | string = 'Chitrapaksha'): AyanamsaMetadata {
  const norm = system === 'Lahiri' ? 'Chitrapaksha' : system;
  return AYANAMSA_SYSTEM_LIST.find((item) => item.id === norm) || AYANAMSA_SYSTEM_LIST[0];
}

/**
 * Calculates high-precision Ayanamsa in decimal degrees for a given Julian Day and system
 */
export function calculateAyanamsaValue(julianDay: number, system: AyanamsaSystem | string = 'Chitrapaksha'): number {
  const lahiri = getCanonicalLahiriAyanamsa(julianDay);

  switch (system) {
    case 'KP':
      // Krishnamurti Paddhati difference: -0.0988888 degrees (-5' 56")
      return lahiri - 0.0988888;
    case 'Raman':
      // BV Raman difference: -1.3833333 degrees (-1° 23' 00")
      return lahiri - 1.3833333;
    case 'Yukteshwar':
      // Sri Yukteshwar difference: +0.3666667 degrees (+22' 00")
      return lahiri + 0.3666667;
    case 'FaganBradley':
      // Fagan-Bradley difference: +0.9000000 degrees (+54' 00")
      return lahiri + 0.9000000;
    case 'Sayan':
      // Pure Tropical: 0 degrees ayanamsa
      return 0.0;
    case 'Chitrapaksha':
    case 'Lahiri':
    default:
      return lahiri;
  }
}

/**
 * Formats decimal degree angle into Degree, Minute, Second notation in Devanagari numerals
 */
export function formatAyanamsaDMS(degreeAngle: number): string {
  if (degreeAngle === 0) return '००° ००\' ००"';
  const isNeg = degreeAngle < 0;
  const absDeg = Math.abs(degreeAngle);
  const deg = Math.floor(absDeg);
  const remMin = (absDeg - deg) * 60;
  const min = Math.floor(remMin);
  const sec = Math.round((remMin - min) * 60);

  const prefix = isNeg ? '-' : '';
  const degStr = String(deg).padStart(2, '0');
  const minStr = String(min).padStart(2, '0');
  const secStr = String(sec).padStart(2, '0');

  return `${prefix}${toDevanagariNumerals(degStr)}° ${toDevanagariNumerals(minStr)}' ${toDevanagariNumerals(secStr)}"`;
}
