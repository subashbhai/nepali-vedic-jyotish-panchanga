/**
 * Vedic Sankalpa & Maha Sankalpa Generation Engine (वैदिक सङ्कल्प तथा महासङ्कल्प इन्जिन)
 * Formulates shastra-compliant Vedic declarations based on real-time Panchanga,
 * Graha positions (planetary transits), and geographical sacred coordinates (Country, District, Sacred River, Deity).
 */

import { PanchangaData, BirthDetails, PlanetPosition } from '../types/astrology';
import { toDevanagariNumerals } from './nepaliCalendar';

export interface SacredLocationInfo {
  countrySanskrit: string; // e.g. नेपाल देशे
  subdivisionSanskrit: string; // e.g. बागमती मण्डले
  localitySanskrit: string; // e.g. काष्ठमण्डप नगरे (काठमाडौँ)
  sacredRiverSanskrit: string; // e.g. पवित्र बागमती-विष्णुमती-मनोहरा पुण्यतीर्थे
  prominentDeitySanskrit: string; // e.g. श्रीपशुपतिनाथ-गुह्येश्वरी-स्वयम्भू चरणसन्निधौ
  riverNepali: string;
  deityNepali: string;
}

// Database of Nepal Districts to Sacred Rivers and Pilgrimage Deity Shrines
const NEPAL_SACRED_GEOGRAPHY: Record<string, {
  subdivision: string;
  locality: string;
  riverSanskrit: string;
  deitySanskrit: string;
  riverNepali: string;
  deityNepali: string;
}> = {
  // Kathmandu Valley
  'काठमाडौँ': {
    subdivision: 'बागमती मण्डले',
    locality: 'काष्ठमण्डप नगरे',
    riverSanskrit: 'पवित्र बागमती-विष्णुमती-मनोहरा पुण्यतीर्थे',
    deitySanskrit: 'श्रीपशुपतिनाथ-गुह्येश्वरी-स्वयम्भू चरणसन्निधौ',
    riverNepali: 'बागमती र विष्णुमती नदी',
    deityNepali: 'श्री पशुपतिनाथ तथा गुह्येश्वरी'
  },
  'काठमाडौं': {
    subdivision: 'बागमती मण्डले',
    locality: 'काष्ठमण्डप नगरे',
    riverSanskrit: 'पवित्र बागमती-विष्णुमती-मनोहरा पुण्यतीर्थे',
    deitySanskrit: 'श्रीपशुपतिनाथ-गुह्येश्वरी-स्वयम्भू चरणसन्निधौ',
    riverNepali: 'बागमती र विष्णुमती नदी',
    deityNepali: 'श्री पशुपतिनाथ तथा गुह्येश्वरी'
  },
  'ललितपुर': {
    subdivision: 'बागमती मण्डले',
    locality: 'ललितपत्तन नगरे',
    riverSanskrit: 'पवित्र बागमती-गोदावरी पुण्यसलिला क्षेत्रे',
    deitySanskrit: 'श्रीकृष्ण-रातोमच्छिन्द्रनाथ चरणसन्निधौ',
    riverNepali: 'बागमती र गोदावरी खोला',
    deityNepali: 'श्रीकृष्ण मन्दिर तथा पाटन दरबार क्षेत्र'
  },
  'भक्तपुर': {
    subdivision: 'बागमती मण्डले',
    locality: 'भक्तपुर भादगाउँ नगरे',
    riverSanskrit: 'पवित्र हनुमन्ते-मनोहरा पुण्यतीर्थे',
    deitySanskrit: 'श्रीचाँगुनारायण-दत्तात्रेय-नवदुर्गा चरणसन्निधौ',
    riverNepali: 'हनुमन्ते र मनोहरा नदी',
    deityNepali: 'श्री चाँगुनारायण तथा दत्तात्रेय'
  },

  // Gandaki / Pokhara
  'कास्की': {
    subdivision: 'गण्डकी प्रदेशे',
    locality: 'पोखरा नगरे',
    riverSanskrit: 'पवित्र सेतीगण्डकीतीरे फेवाताल पुण्यजलाशयक्षेत्रे',
    deitySanskrit: 'श्रीविन्ध्यवासिनी-तालवाराही भगवती चरणसन्निधौ',
    riverNepali: 'सेतीगण्डकी र फेवाताल',
    deityNepali: 'श्री विन्ध्यवासिनी तथा तालवाराही'
  },
  'पोखरा': {
    subdivision: 'गण्डकी प्रदेशे',
    locality: 'पोखरा नगरे',
    riverSanskrit: 'पवित्र सेतीगण्डकीतीरे फेवाताल पुण्यजलाशयक्षेत्रे',
    deitySanskrit: 'श्रीविन्ध्यवासिनी-तालवाराही भगवती चरणसन्निधौ',
    riverNepali: 'सेतीगण्डकी र फेवाताल',
    deityNepali: 'श्री विन्ध्यवासिनी तथा तालवाराही'
  },

  // Chitwan & Nawalparasi
  'चितवन': {
    subdivision: 'बागमती मण्डले',
    locality: 'भरतपुर-नारायणगढ क्षेत्रे',
    riverSanskrit: 'पवित्र नारायणी-सप्तगण्डकी-त्रिशूली देवघाट सङ्गमपुण्यतीर्थे',
    deitySanskrit: 'श्रीहरिहरक्षेत्र-मौलाकालिका भगवती चरणसन्निधौ',
    riverNepali: 'नारायणी नदी र देवघाट सङ्गम',
    deityNepali: 'श्री देवघाटधाम तथा मौलाकालिका'
  },
  'नवलपरासी': {
    subdivision: 'गण्डकी-लुम्बिनी प्रदेशे',
    locality: 'नवलपरासी क्षेत्रे',
    riverSanskrit: 'पवित्र नारायणी-त्रिवेणी सङ्गमपुण्यतीर्थे',
    deitySanskrit: 'श्रीत्रिवेणीधाम-वाल्मीकि आश्रम चरणसन्निधौ',
    riverNepali: 'नारायणी नदी र त्रिवेणी धाम',
    deityNepali: 'श्री त्रिवेणीधाम तथा गजेन्द्रमोक्ष'
  },

  // Lumbini / Rupandehi
  'रुपन्देही': {
    subdivision: 'लुम्बिनी मण्डले',
    locality: 'बुटवल-भैरहवा नगरे',
    riverSanskrit: 'पवित्र तिनाउ-दानव नदीतीरे लुम्बिनी तपोभूमि क्षेत्रे',
    deitySanskrit: 'श्रीमायादेवी-सिद्धबाबा चरणसन्निधौ',
    riverNepali: 'तिनाउ नदी र लुम्बिनी क्षेत्र',
    deityNepali: 'श्री सिद्धबाबा मन्दिर तथा लुम्बिनी'
  },
  'बुटवल': {
    subdivision: 'लुम्बिनी मण्डले',
    locality: 'बुटवल नगरे',
    riverSanskrit: 'पवित्र तिनाउ नदीतीरे सिद्धक्षेत्रे',
    deitySanskrit: 'श्रीसिद्धबाबा-जितगढी चरणसन्निधौ',
    riverNepali: 'तिनाउ नदी',
    deityNepali: 'श्री सिद्धबाबा मन्दिर'
  },

  // Koshi / Eastern Nepal
  'सुनसरी': {
    subdivision: 'कोशी मण्डले',
    locality: 'धरान-इटहरी क्षेत्रे',
    riverSanskrit: 'पवित्र सप्तकोशीतीरे पिण्डेश्वर-कौशिकी पुण्यतीर्थे',
    deitySanskrit: 'श्रीवराहक्षेत्र-दन्तकाली-पिण्डेश्वर चरणसन्निधौ',
    riverNepali: 'सप्तकोशी नदी र वराहक्षेत्र',
    deityNepali: 'श्री वराहक्षेत्र तथा पिण्डेश्वर'
  },
  'धरान': {
    subdivision: 'कोशी मण्डले',
    locality: 'धरान विजयपुर नगरे',
    riverSanskrit: 'पवित्र सेउती-सर्दू नदीतीरे विजयपुर पुण्यक्षेत्रे',
    deitySanskrit: 'श्रीदन्तकाली-पिण्डेश्वर-बुढासुब्बा चरणसन्निधौ',
    riverNepali: 'सेउती र सर्दू खोला',
    deityNepali: 'श्री दन्तकाली तथा पिण्डेश्वर'
  },
  'मोरङ': {
    subdivision: 'कोशी मण्डले',
    locality: 'विराटनगर नगरे',
    riverSanskrit: 'पवित्र बक्राहा-केशल्या नदीतीरे विराटक्षेत्रे',
    deitySanskrit: 'श्रीविराटेश्वर-काली मन्दिर चरणसन्निधौ',
    riverNepali: 'बक्राहा र केशल्या नदी',
    deityNepali: 'श्री विराटेश्वर महादेव'
  },
  'विराटनगर': {
    subdivision: 'कोशी मण्डले',
    locality: 'विराटनगर नगरे',
    riverSanskrit: 'पवित्र बक्राहा-केशल्या नदीतीरे विराटक्षेत्रे',
    deitySanskrit: 'श्रीविराटेश्वर-काली मन्दिर चरणसन्निधौ',
    riverNepali: 'बक्राहा र केशल्या नदी',
    deityNepali: 'श्री विराटेश्वर महादेव'
  },

  // Madhesh / Janakpur
  'धनुषा': {
    subdivision: 'मधेश प्रदेशे',
    locality: 'जनकपुरधाम नगरे',
    riverSanskrit: 'पवित्र दुग्धमती नदीतीरे गङ्गासागर-धनुषसागर पुण्यक्षेत्रे',
    deitySanskrit: 'श्रीमज्जगज्जननी जानकी-श्रीरामचन्द्र चरणसन्निधौ',
    riverNepali: 'दुग्धमती नदी र गङ्गासागर',
    deityNepali: 'श्री जानकी मन्दिर तथा राम मन्दिर'
  },
  'जनकपुर': {
    subdivision: 'मधेश प्रदेशे',
    locality: 'जनकपुरधाम नगरे',
    riverSanskrit: 'पवित्र दुग्धमती नदीतीरे गङ्गासागर-धनुषसागर पुण्यक्षेत्रे',
    deitySanskrit: 'श्रीमज्जगज्जननी जानकी-श्रीरामचन्द्र चरणसन्निधौ',
    riverNepali: 'दुग्धमती नदी र गङ्गासागर',
    deityNepali: 'श्री जानकी मन्दिर तथा राम मन्दिर'
  },

  // Dhaulagiri / Kali Gandaki
  'बागलुङ': {
    subdivision: 'गण्डकी प्रदेशे',
    locality: 'बागलुङ नगरे',
    riverSanskrit: 'पवित्र कालिगण्डकी-काठेखोला सङ्गमक्षेत्रे शालिग्रामतीर्थे',
    deitySanskrit: 'श्रीकालिका भगवती-पञ्चकोट चरणसन्निधौ',
    riverNepali: 'कालीगण्डकी र काठेखोला',
    deityNepali: 'श्री बागलुङ कालिका भगवती'
  },
  'मुस्ताङ': {
    subdivision: 'गण्डकी प्रदेशे',
    locality: 'मुक्तिनाथ क्षेत्रे',
    riverSanskrit: 'पवित्र शालिग्रामवाहिनी कालिगण्डकी उद्गमतीर्थे',
    deitySanskrit: 'श्रीमुक्तिनाथ-ज्वालामाई चरणसन्निधौ',
    riverNepali: 'कालीगण्डकी नदी उद्गमस्थल',
    deityNepali: 'श्री मुक्तिनाथ भगवान्'
  },

  // Mid-West / Bheri / Rapti
  'बाँके': {
    subdivision: 'लुम्बिनी प्रदेशे',
    locality: 'नेपालगञ्ज नगरे',
    riverSanskrit: 'पवित्र राप्ती नदीतीरे बागेश्वरी क्षेत्रे',
    deitySanskrit: 'श्रीबागेश्वरी भगवती चरणसन्निधौ',
    riverNepali: 'राप्ती नदी',
    deityNepali: 'श्री बागेश्वरी मन्दिर'
  },
  'नेपालगञ्ज': {
    subdivision: 'लुम्बिनी प्रदेशे',
    locality: 'नेपालगञ्ज नगरे',
    riverSanskrit: 'पवित्र राप्ती नदीतीरे बागेश्वरी क्षेत्रे',
    deitySanskrit: 'श्रीबागेश्वरी भगवती चरणसन्निधौ',
    riverNepali: 'राप्ती नदी',
    deityNepali: 'श्री बागेश्वरी मन्दिर'
  },
  'दाङ': {
    subdivision: 'लुम्बिनी प्रदेशे',
    locality: 'दाङ उपत्यका क्षेत्रे',
    riverSanskrit: 'पवित्र बबई नदीतीरे धारपानी-धारापानी क्षेत्रे',
    deitySanskrit: 'श्रीअम्बिकेश्वरी-पाण्डवेश्वर महादेव चरणसन्निधौ',
    riverNepali: 'बबई नदी',
    deityNepali: 'श्री अम्बिकेश्वरी तथा पाण्डवेश्वर'
  },

  // Far-West / Sudurpashchim
  'कैलाली': {
    subdivision: 'सुदूरपश्चिम प्रदेशे',
    locality: 'धनगढी नगरे',
    riverSanskrit: 'पवित्र कर्णाली-मोहना नदीतीरे बेहडाबाबा क्षेत्रे',
    deitySanskrit: 'श्रीबेहडाबाबा महादेव चरणसन्निधौ',
    riverNepali: 'कर्णाली र मोहना नदी',
    deityNepali: 'श्री बेहडाबाबा मन्दिर'
  },
  'कञ्चनपुर': {
    subdivision: 'सुदूरपश्चिम प्रदेशे',
    locality: 'महेन्द्रनगर क्षेत्रे',
    riverSanskrit: 'पवित्र महाकाली नदीतीरे सिद्धनाथ क्षेत्रे',
    deitySanskrit: 'श्रीसिद्धनाथ बाबा-झिलमिला चरणसन्निधौ',
    riverNepali: 'महाकाली नदी',
    deityNepali: 'श्री सिद्धनाथ मन्दिर'
  },
  'डडेल्धुरा': {
    subdivision: 'सुदूरपश्चिम प्रदेशे',
    locality: 'डडेल्धुरा क्षेत्रे',
    riverSanskrit: 'पवित्र रङ्गुन नदीतीरे उग्रतारा क्षेत्रे',
    deitySanskrit: 'श्रीउग्रतारा भगवती चरणसन्निधौ',
    riverNepali: 'रङ्गुन खोला',
    deityNepali: 'श्री उग्रतारा मन्दिर'
  },

  // Gorkha
  'गोरखा': {
    subdivision: 'गण्डकी प्रदेशे',
    locality: 'गोरखा ऐतिहासिक क्षेत्रे',
    riverSanskrit: 'पवित्र त्रिशूली-दरौंदी नदीतीरे मनकामना क्षेत्रे',
    deitySanskrit: 'श्रीगोरखनाथ-मनकामना भगवती चरणसन्निधौ',
    riverNepali: 'त्रिशूली र दरौंदी नदी',
    deityNepali: 'श्री गोरखनाथ तथा मनकामना'
  }
};

/**
 * Resolves sacred location coordinates (river, temple, area) for a given location string
 */
export function getSacredLocationInfo(locationName?: string): SacredLocationInfo {
  const defaultInfo: SacredLocationInfo = {
    countrySanskrit: 'नेपाल देशे',
    subdivisionSanskrit: 'बागमती मण्डले',
    localitySanskrit: 'काष्ठमण्डप नगरे',
    sacredRiverSanskrit: 'पवित्र बागमती-विष्णुमती-मनोहरा पुण्यतीर्थे',
    prominentDeitySanskrit: 'श्रीपशुपतिनाथ-गुह्येश्वरी-स्वयम्भू चरणसन्निधौ',
    riverNepali: 'बागमती र विष्णुमती नदी',
    deityNepali: 'श्री पशुपतिनाथ तथा गुह्येश्वरी'
  };

  if (!locationName) return defaultInfo;

  const cleanLoc = locationName.trim();
  for (const [key, data] of Object.entries(NEPAL_SACRED_GEOGRAPHY)) {
    if (cleanLoc.includes(key) || key.includes(cleanLoc)) {
      return {
        countrySanskrit: 'नेपाल देशे',
        subdivisionSanskrit: data.subdivision,
        localitySanskrit: data.locality,
        sacredRiverSanskrit: data.riverSanskrit,
        prominentDeitySanskrit: data.deitySanskrit,
        riverNepali: data.riverNepali,
        deityNepali: data.deityNepali
      };
    }
  }

  // Generic Nepal fallback
  return {
    countrySanskrit: 'नेपाल देशे',
    subdivisionSanskrit: `${cleanLoc} मण्डले`,
    localitySanskrit: `${cleanLoc} नगरे`,
    sacredRiverSanskrit: 'गङ्गा-यमुना-सरस्वती-सर्वतीर्थ पुण्यसलिला क्षेत्रे',
    prominentDeitySanskrit: 'स्थानीय श्रीकुलदेवता-इष्टदेवता चरणसन्निधौ',
    riverNepali: 'स्थानीय पुण्यसलिला नदी तथा तीर्थ',
    deityNepali: 'इष्टदेवता तथा कुलदेवता'
  };
}

// Map Tithi name to Sanskrit grammatical locative (सप्तमी विभक्ति)
function getTithiSanskritLocative(tithiName: string): string {
  if (!tithiName) return 'शुभ तिथौ';
  const clean = tithiName.split(' ')[0].replace(/[\(\)\d]/g, '').trim();
  const map: Record<string, string> = {
    'प्रतिपदा': 'प्रतिपद्यां तिथौ',
    'द्वितीया': 'द्वितीयायां तिथौ',
    'तृतीया': 'तृतीयायां तिथौ',
    'चतुर्थी': 'चतुर्थ्यां तिथौ',
    'पञ्चमी': 'पञ्चम्यां तिथौ',
    'षष्ठी': 'षष्ठ्यां तिथौ',
    'सप्तमी': 'सप्तम्यां तिथौ',
    'अष्टमी': 'अष्टम्यां तिथौ',
    'नवमी': 'नवम्यां तिथौ',
    'दशमी': 'दशम्यां तिथौ',
    'एकादशी': 'एकादश्यां तिथौ',
    'द्वादशी': 'द्वादश्यां तिथौ',
    'त्रयोदशी': 'त्रयोदश्यां तिथौ',
    'चतुर्दशी': 'चतुर्दश्यां तिथौ',
    'पूर्णिमा': 'पूर्णिमायां पुण्यतिथौ',
    'पौर्णमासी': 'पौर्णमास्यां पुण्यतिथौ',
    'अमावास्या': 'अमावास्यायां पुण्यतिथौ',
    'औंसी': 'अमावास्यायां पुण्यतिथौ',
  };
  return map[clean] || `${clean} तिथौ`;
}

// Map Day name to Sanskrit locative
function getVaraSanskritLocative(dayNepali: string): string {
  if (!dayNepali) return 'शुभ वासरे';
  const map: Record<string, string> = {
    'आइतवार': 'आदित्यवासरे (भानुवासरे)',
    'सोमवार': 'सोमवासरे (इन्दुवासरे)',
    'मंगलबार': 'भौमवासरे (मङ्गलवासरे)',
    'मङ्गलबार': 'भौमवासरे (मङ्गलवासरे)',
    'बुधवार': 'सौम्यवासरे (बुधवासरे)',
    'बिहीबार': 'बृहस्पतिवासरे (गुरुवासरे)',
    'शुक्रवार': 'भृगुवासरे (शुक्रवासरे)',
    'शनिवार': 'मन्दवासरे (शनिवासरे)',
  };
  return map[dayNepali] || `${dayNepali} वासरे`;
}

// Map Month to Sanskrit
function getMasaSanskrit(bsMonthName: string): string {
  const map: Record<string, string> = {
    'बैशाख': 'वैशाख मासे',
    'वैशाख': 'वैशाख मासे',
    'जेठ': 'ज्येष्ठ मासे',
    'ज्येष्ठ': 'ज्येष्ठ मासे',
    'असार': 'आषाढ मासे',
    'आषाढ': 'आषाढ मासे',
    'साउन': 'श्रावण मासे',
    'श्रावण': 'श्रावण मासे',
    'भदौ': 'भाद्रपद मासे',
    'भाद्र': 'भाद्रपद मासे',
    'असोज': 'आश्विन मासे',
    'आश्विन': 'आश्विन मासे',
    'कात्तिक': 'कार्तिक मासे',
    'कार्तिक': 'कार्तिक मासे',
    'मंसिर': 'मार्गशीर्ष मासे',
    'मार्गशीर्ष': 'मार्गशीर्ष मासे',
    'पुस': 'पौष मासे',
    'पौष': 'पौष मासे',
    'माघ': 'माघ मासे',
    'फागुन': 'फाल्गुन मासे',
    'फाल्गुन': 'फाल्गुन मासे',
    'चैत': 'चैत्र मासे',
    'चैत्र': 'चैत्र मासे',
  };
  return map[bsMonthName] || `${bsMonthName} मासे`;
}

export interface DailySankalpaData {
  sanskritText: string;
  nepaliMeaning: string;
  geoInfo: SacredLocationInfo;
  panchangaSummary: string;
  grahaStatusSummary: string;
}

/**
 * Generates Daily Vedic Sankalpa for dashboard card
 */
export function generateDailyVedicSankalpa(
  panchanga: PanchangaData,
  profile?: BirthDetails | null,
  planets?: PlanetPosition[]
): DailySankalpaData {
  const geo = getSacredLocationInfo(profile?.location?.name);

  const dayName = panchanga.dayNameNepali || panchanga.vaar?.name || 'शुभ वार';
  const masaName = panchanga.masaInfo?.masaName || 'वैशाख';
  const paksha = panchanga.tithi?.paksha || 'शुक्ल';
  const yearNum = panchanga.vikramSamvat || 2081;

  const tithiLoc = getTithiSanskritLocative(panchanga.tithi?.name || '');
  const varaLoc = getVaraSanskritLocative(dayName);
  const masaLoc = getMasaSanskrit(masaName);
  const pakshaText = paksha === 'शुक्ल' ? 'शुक्लपक्षे' : 'कृष्णपक्षे';
  const nakshatraLoc = panchanga.nakshatra?.name ? `${panchanga.nakshatra.name} नक्षत्रे` : 'शुभ नक्षत्रे';
  const yogaText = panchanga.yoga?.name ? `${panchanga.yoga.name} योगे` : 'शुभ योगे';
  const karanaText = panchanga.karana?.name ? `${panchanga.karana.name} करणे` : 'शुभ करणे';
  const samvatsarName = panchanga.samvatsara || 'कालयुक्त';
  const ayanaText = panchanga.ayana || 'उत्तरायण';
  const rituText = panchanga.ritu || 'वसन्त';

  // Graha Rashi Positions
  let sunRashi = panchanga.sunRashi || 'मेष';
  let moonRashi = panchanga.moonRashi || 'वृश्चिक';
  let guruRashi = 'वृष';
  let shaniRashi = 'कुम्भ';
  let rahuRashi = 'मीन';
  let ketuRashi = 'कन्या';

  if (planets && planets.length > 0) {
    const sunP = planets.find(p => p.name === 'सूर्य' || p.englishName?.toLowerCase() === 'sun');
    const moonP = planets.find(p => p.name === 'चन्द्र' || p.englishName?.toLowerCase() === 'moon');
    const guruP = planets.find(p => p.name === 'गुरु' || p.englishName?.toLowerCase() === 'jupiter');
    const shaniP = planets.find(p => p.name === 'शनि' || p.englishName?.toLowerCase() === 'saturn');
    const rahuP = planets.find(p => p.name === 'राहु' || p.englishName?.toLowerCase() === 'rahu');
    const ketuP = planets.find(p => p.name === 'केतु' || p.englishName?.toLowerCase() === 'ketu');

    if (sunP) sunRashi = sunP.rashiName;
    if (moonP) moonRashi = moonP.rashiName;
    if (guruP) guruRashi = guruP.rashiName;
    if (shaniP) shaniRashi = shaniP.rashiName;
    if (rahuP) rahuRashi = rahuP.rashiName;
    if (ketuP) ketuRashi = ketuP.rashiName;
  }

  const shakaYear = yearNum > 135 ? yearNum - 135 : 1946;

  let planetsTransitSanskrit = `सूर्ये ${sunRashi} राशौ, चन्द्रे ${moonRashi} राशौ`;
  if (planets && planets.length > 0) {
    planetsTransitSanskrit += `, देवगुरौ बृहस्पतौ ${guruRashi} राशौ, शनैश्चरे ${shaniRashi} राशौ, राहौ ${rahuRashi} राशौ, केतौ ${ketuRashi} राशौ, एवं शेषेषु ग्रहेषु यथायथा राशिस्थानस्थितेषु सत्सु`;
  } else {
    planetsTransitSanskrit += `, एवं शेषेषु ग्रहेषु यथायथा शुभराशिस्थानस्थितेषु सत्सु`;
  }

  const gotra = profile?.gotra || profile?.fatherDetails?.gotra || 'कश्यप';
  const name = profile?.name || 'अमुक नामाहम्';

  const sanskritText = `ॐ विष्णुर्विष्णुर्विष्णुः श्रीमद्भगवतो महापुरुषस्य विष्णोराज्ञया प्रवर्तमानस्य अद्य ब्रह्मणो द्वितीयपरार्धे श्रीश्वेतवाराहकल्पे वैवस्वतमन्वन्तरे अष्टाविंशतितमे कलियुगे कलिप्रथमचरणे, भूर्लोके जम्बूद्वीपे भरतखण्डे भारतवर्षे आर्यावर्तैकदेशे पुण्यतमे नेपालदेशे, ${geo.subdivisionSanskrit}, ${geo.localitySanskrit}, पवित्र-सुरसरित्-सदृश ${geo.sacredRiverSanskrit}, ${geo.prominentDeitySanskrit} पावन-चरणसन्निधौ, श्रीविक्रमादित्य नृपतेः शकाब्दे संवत् ${toDevanagariNumerals(yearNum)} प्रवर्त्तमाने श्रीविक्रमार्कशके ${samvatsarName} नाम संवत्सरे, श्रीशालिवाहन शके ${toDevanagariNumerals(shakaYear)}, श्रीसूर्ये ${ayanaText}े, ${rituText} ऋतौ, महामाङ्गल्यप्रदे शुभे ${masaLoc}, ${pakshaText}, ${tithiLoc}, ${varaLoc}, ${nakshatraLoc}, ${yogaText}, ${karanaText}, आनन्दादि योगमध्ये शुभयोगे, ग्रहगोचर स्थितिज्ञानेन ${planetsTransitSanskrit}, एवं गुणविशेषणविशिष्टायां शुभपुण्यतिथौ, ${gotra} गोत्रोत्पन्नः ${name} नामाहं, सपत्नीकः सपुत्र-पौत्र-सकुटुम्ब-सपरिवार-सहितोऽहम्, मम आत्मनः श्रुतिस्मृतिपुराणोक्त-समस्तपुण्यफलप्राप्त्यर्थं, कायिक-वाचिक-मानसिक-सांसर्गिक-सकलदुरितोपशान्त्यर्थं, आधिव्याधि-जरामृत्यु-भयनिवारणपूर्वकं दीर्घायुः-आरोग्य-ऐश्वर्य-सन्तति-यशः-कीर्ति-अभिवृद्ध्यर्थं, श्रीसूर्यादिनवग्रहदेवतानां प्रसादेन अनुकूलतासिद्ध्यर्थं, धर्मार्थकाममोक्ष-चतुर्विधपुरुषार्थसिद्धये, इष्टदेवता-कुलदेवता-स्थानदेवता-वास्तुदेवता-प्रीत्यर्थं च अद्य प्रातःकाले (सायङ्काले वा) यथाज्ञानं यथामिलितोपचारैः नित्य वैदिक भगवत्पूजनं, सन्ध्यावन्दनं, देवतार्चनं, मङ्गलकर्म चाहं करिष्ये। तत्पूर्वाङ्गत्वेन निर्विघ्नतासिद्ध्यर्थं श्रीगणेशस्मरणपूर्वकं कलशार्चनादि नित्यकर्म सम्पादयामि। ॥ ॐ तत्सत्, श्रीब्रह्मार्पणमस्तु ॥`;

  const nepaliMeaning = `ॐ श्रीविष्णु भगवान्‌को आज्ञाले यस अनन्त ब्रह्माण्डीय सृष्टि-चक्र अन्तर्गत ब्रह्माजीको ५१औँ वर्षको द्वितीय परार्ध, श्वेतवाराह कल्प, वैवस्वत मन्वन्तर तथा २८औँ कलियुगको प्रथम चरणमा, जम्बूद्वीप भरतखण्ड अन्तर्गत पावन नेपाल देश, ${geo.subdivisionSanskrit}, ${geo.localitySanskrit} मा पवित्र ${geo.riverNepali} को पावन तट एवं ${geo.deityNepali} को पवित्र सानिध्यमा; आज श्रीविक्रम संवत् ${toDevanagariNumerals(yearNum)} (शालिवाहन शक ${toDevanagariNumerals(shakaYear)}) ${samvatsarName} संवत्सर, ${ayanaText}ायन, ${rituText} ऋतु, ${masaName} ${paksha} पक्षको ${panchanga.tithi?.name || ''} तिथि, ${dayName} वार, ${panchanga.nakshatra?.name || ''} नक्षत्र, ${panchanga.yoga?.name || ''} योग, ${panchanga.karana?.name || ''} करणको शुभ घडीमा तथा नवग्रह गोचरमा सूर्यदेव ${sunRashi} राशिमा, चन्द्रमा ${moonRashi} राशिमा एवं बृहस्पति, शनि, राहु-केतु लगायत सबै ग्रहहरू आ-आफ्नो राशिमा गोचर भइरहँदा: म (${name}, ${gotra} गोत्र, सपरिवार) आफ्नो तथा सम्पूर्ण परिवारको कायिक, वाचिक र मानसिक पापकष्ट निवारण, दीर्घायु, सुस्वास्थ्य, धनधान्य, यश-कीर्ति, नवग्रह कृपा एवं धर्म, अर्थ, काम, मोक्ष चारै पुरुषार्थ सिद्धिका लागि भगवान्‌को नित्य वैदिक पूजा, सन्ध्यावन्दन तथा ईश आराधना गर्दछु।`;

  const panchangaSummary = `${toDevanagariNumerals(yearNum)} ${masaName} • ${paksha} पक्ष • ${panchanga.tithi?.name || ''} • ${panchanga.nakshatra?.name || ''} • ${dayName}`;
  const grahaStatusSummary = `सूर्य: ${sunRashi} | चन्द्र: ${moonRashi} | संवत्सर: ${samvatsarName}`;

  return {
    sanskritText,
    nepaliMeaning,
    geoInfo: geo,
    panchangaSummary,
    grahaStatusSummary
  };
}

export type SankalpaPujaType = 
  | 'daily' // नित्य पूजा
  | 'rudri' // रुद्राभिषेक
  | 'havan' // हवन / होम
  | 'satyanarayan' // सत्यनारायण व्रत
  | 'ekadashi' // एकादशी व्रत
  | 'birthday' // जन्मोत्सव / जन्मदिन
  | 'navagraha' // नवग्रह शान्ति
  | 'pitru' // पितृ तर्पण / श्राद्ध
  | 'vastu' // वास्तु शान्ति
  | 'general'; // सर्वकार्य सिद्धि

export interface MahaSankalpaOptions {
  panchanga: PanchangaData;
  profile?: BirthDetails | null;
  planets?: PlanetPosition[];
  pujaType?: SankalpaPujaType;
  customGotra?: string;
  customName?: string;
  customLocation?: string;
  familyMembersIncluded?: boolean;
}

export interface MahaSankalpaData {
  title: string;
  sanskritFullText: string;
  nepaliFullTranslation: string;
  ritualStepsNepali: string[];
  pujaTypeLabelNepali: string;
  geoInfo: SacredLocationInfo;
  planetsFormattedList: string[];
}

export const PUJA_TYPE_DETAILS: Record<SankalpaPujaType, {
  labelNepali: string;
  sanskritPurpose: string;
  nepaliPurpose: string;
}> = {
  daily: {
    labelNepali: 'नित्य दैनिक पूजा सङ्कल्प',
    sanskritPurpose: 'मम आत्मनः कायिक-वाचिक-मानसिक-पापक्षयार्थं, श्रुतिस्मृतिपुराणोक्त फलप्राप्त्यर्थं, नित्य पूजाकर्म',
    nepaliPurpose: 'दैनिक पूजा, कुलदेवता स्मरण र सम्पूर्ण परिवारको आरोग्य एवं सुख शान्तिका लागि'
  },
  rudri: {
    labelNepali: 'श्री रुद्राभिषेक / शिव आराधना सङ्कल्प',
    sanskritPurpose: 'श्रीमहामृत्युञ्जय-सदाशिवप्रीत्यर्थं, अकालमृत्युहरणार्थं, महारोग-शोक-भयनिवारणार्थं, श्रीरुद्राभिषेककर्म',
    nepaliPurpose: 'अकाल मृत्यु हरण, महारोग निवारण र भगवान् शिवको अनुग्रह प्राप्तिका लागि रुद्राभिषेक'
  },
  havan: {
    labelNepali: 'वैदिक हवन तथा यज्ञ सङ्कल्प',
    sanskritPurpose: 'अग्निनारायणप्रीत्यर्थं, वास्तु-नवग्रहदोषोपशान्त्यर्थं, विश्वकल्याणार्थं, विधिपूर्वक होम-हवनकर्म',
    nepaliPurpose: 'अग्निदेवताको आराधना, वास्तुदोष निवारण र वातावरण शुद्धिका लागि वैदिक हवन'
  },
  satyanarayan: {
    labelNepali: 'श्रीसत्यनारायण व्रत एवं कथा सङ्कल्प',
    sanskritPurpose: 'श्रीनारायणप्रीत्यर्थं, धनधान्य-सन्तति-सौभाग्यवृद्ध्यर्थं, श्रीसत्यनारायणपूजा तथा व्रतकथा श्रवणकर्म',
    nepaliPurpose: 'धनधान्य, सन्तति, सुख समृद्धि तथा मनोकामना पूर्ण गर्न सत्यनारायण कथा'
  },
  ekadashi: {
    labelNepali: 'हरि वासर एकादशी व्रत सङ्कल्प',
    sanskritPurpose: 'श्रीमहाविष्णु-लक्ष्मीप्रीत्यर्थं, मोक्षप्राप्त्यर्थं, एकादशीव्रतोपवासकर्म',
    nepaliPurpose: 'परमपद मोक्ष प्राप्ति र भगवान् नारायणको प्रिय एकादशी व्रत अनुष्ठान'
  },
  birthday: {
    labelNepali: 'जन्मोत्सव (Birthday) आयुर्वृद्धि सङ्कल्प',
    sanskritPurpose: 'अष्टचिरञ्जीविप्रीत्यर्थं, दीर्घायुर्बल-आरोग्य-विद्या-कीर्ति-यशसंवर्धनार्थं, जन्मोत्सव पूजनकर्म',
    nepaliPurpose: 'अश्वत्थामा, बलि, व्यास, हनुमान्, विभीषण, कृपाचार्य, परशुराम, मार्कण्डेय अष्टचिरञ्जीवी स्मरणपूर्वक दीर्घायु प्राप्तिका लागि'
  },
  navagraha: {
    labelNepali: 'नवग्रह शान्ति तथा ग्रहदोष निवारण',
    sanskritPurpose: 'सूर्य-सोम-मङ्गल-बुध-बृहस्पति-शुक्र-शनि-राहु-केतु-नवग्रहाणां अरिष्टनिवारणार्थं, अनुकूलतासिद्धयर्थं, नवग्रहशान्तिकर्म',
    nepaliPurpose: 'जन्मकुण्डली तथा गोचरका प्रतिकूल ग्रहदोष निवारण एवं शुभ फल प्राप्तिका लागि नवग्रह पूजा'
  },
  pitru: {
    labelNepali: 'पितृ तर्पण / श्राद्ध सङ्कल्प',
    sanskritPurpose: 'मातृ-पितृ-पितामह-आदि-समस्तपितॄणां अक्षयतृप्त्यर्थं, वैकुण्ठवासार्थं, तर्पण-श्राद्धकर्म',
    nepaliPurpose: 'मातृ-पितृ कुलका पितृहरूको मोक्ष एवं तृप्तिका लागि वैदिक तर्पण'
  },
  vastu: {
    labelNepali: 'गृह वास्तु शान्ति सङ्कल्प',
    sanskritPurpose: 'वास्तुपुरुष-दिक्पालप्रीत्यर्थं, गृहदोष-शल्यादिनिवारणार्थं, गृहशान्तिकर्म',
    nepaliPurpose: 'आवासीय तथा व्यापारिक भवनको वास्तुदोष निवारण र स्थायी शान्ति'
  },
  general: {
    labelNepali: 'सर्वकार्य सिद्धि सङ्कल्प',
    sanskritPurpose: 'सर्वविघ्नविनाशार्थं, धर्मार्थकाममोक्ष-चतुर्विधपुरुषार्थसिद्धयर्थं, शुभकर्म',
    nepaliPurpose: 'सम्पूर्ण विघ्नबाधा नाश गरी सम्पूर्ण कार्यहरू निर्विघ्न सम्पन्न गर्न'
  }
};

export const COMMON_GOTRAS = [
  'कश्यप',
  'भारद्वाज',
  'अङ्गिरा (अंगिरस)',
  'अत्रि',
  'गौतम',
  'वशिष्ठ',
  'विश्वामित्र',
  'जमदग्नि',
  'कौशिक',
  'पराशर',
  'उपमन्यु',
  'धनञ्जय',
  'माण्डव्य',
  'गर्ग',
  'शाण्डिल्य',
  'मुद्गल',
  'वत्स',
  'कुत्स',
  'कपिल',
  'स्वगोत्र (आफ्नो गोत्र)'
];

/**
 * Generates the Complete Vedic Maha Sankalpa (बृहत् महासङ्कल्प)
 */
export function generateMahaSankalpa(options: MahaSankalpaOptions): MahaSankalpaData {
  const {
    panchanga,
    profile,
    planets,
    pujaType = 'daily',
    customGotra,
    customName,
    customLocation,
    familyMembersIncluded = true
  } = options;

  const geo = getSacredLocationInfo(customLocation || profile?.location?.name);
  const purpose = PUJA_TYPE_DETAILS[pujaType] || PUJA_TYPE_DETAILS.daily;

  const dayName = panchanga.dayNameNepali || panchanga.vaar?.name || 'शुभ वार';
  const masaName = panchanga.masaInfo?.masaName || 'वैशाख';
  const paksha = panchanga.tithi?.paksha || 'शुक्ल';
  const yearNum = panchanga.vikramSamvat || 2081;

  const tithiLoc = getTithiSanskritLocative(panchanga.tithi?.name || '');
  const varaLoc = getVaraSanskritLocative(dayName);
  const masaLoc = getMasaSanskrit(masaName);
  const pakshaText = paksha === 'शुक्ल' ? 'शुक्लपक्षे' : 'कृष्णपक्षे';
  const nakshatraLoc = panchanga.nakshatra?.name ? `${panchanga.nakshatra.name} नक्षत्रे` : 'शुभ नक्षत्रे';
  const yogaText = panchanga.yoga?.name ? `${panchanga.yoga.name} योगे` : 'विष्कम्भादि योगे';
  const karanaText = panchanga.karana?.name ? `${panchanga.karana.name} करणे` : 'बवादि करणे';
  const samvatsarName = panchanga.samvatsara || 'कालयुक्त';
  const ayanaText = panchanga.ayana || 'उत्तरायण';
  const rituText = panchanga.ritu || 'वसन्त';

  // Graha status
  let sunR = panchanga.sunRashi || 'मेष';
  let moonR = panchanga.moonRashi || 'वृश्चिक';
  let guruR = 'वृष';
  const planetsFormattedList: string[] = [];

  if (planets && planets.length > 0) {
    planets.forEach(p => {
      planetsFormattedList.push(`${p.name}: ${p.rashiName} (${p.formattedDegree})`);
      if (p.name === 'सूर्य' || p.englishName?.toLowerCase() === 'sun') sunR = p.rashiName;
      if (p.name === 'चन्द्र' || p.englishName?.toLowerCase() === 'moon') moonR = p.rashiName;
      if (p.name === 'गुरु' || p.englishName?.toLowerCase() === 'jupiter') guruR = p.rashiName;
    });
  }

  const gotra = customGotra || profile?.gotra || profile?.fatherDetails?.gotra || 'कश्यप';
  const name = customName || profile?.name || 'अमुक नामाहम्';
  const familyClause = familyMembersIncluded ? 'सपत्नीकस्य, सपरिवारस्य, सपुत्र-पौत्रादि-सहितस्य' : 'मम आत्मनः';

  const sanskritFullText = `॥ अथ बृहत् वैदिक महासङ्कल्पः ॥

ॐ विष्णुर्विष्णुर्विष्णुः श्रीमद्भगवतो महापुरुषस्य विष्णोराज्ञया प्रवर्तमानस्य अद्य श्रीब्रह्मणो द्वितीयपरार्धे श्रीश्वेतवाराहकल्पे वैवस्वतमन्वन्तरे अष्टाविंशतितमे युगे कलियुगे कलिप्रथमचरणे, भूर्लोके जम्बूद्वीपे भरतखण्डे भारतवर्षे आर्यावर्तैकदेशे पुण्यपवित्र ${geo.countrySanskrit}, ${geo.subdivisionSanskrit}, ${geo.localitySanskrit}, ${geo.sacredRiverSanskrit}, ${geo.prominentDeitySanskrit},

श्रीविक्रमादित्य नृपतेः शकाब्दे ${toDevanagariNumerals(yearNum)} प्रवर्त्तमाने श्रीविक्रमार्कशके ${samvatsarName} नाम संवत्सरे, श्रीसूर्ये ${ayanaText}े, ${rituText} ऋतौ, महामाङ्गल्यप्रदे शुभे ${masaLoc}, ${pakshaText}, ${tithiLoc}, ${varaLoc}, ${nakshatraLoc}, ${yogaText}, ${karanaText}, आनन्दादि योगमध्ये शुभयोगे,

ग्रहगोचर स्थितिज्ञानेन:
सूर्ये ${sunR} राशौ स्थिते, चन्द्रे ${moonR} राशौ स्थिते, देवगुरौ बृहस्पतौ ${guruR} राशौ स्थिते, एवं शेषेषु ग्रहेषु यथायथा राशिस्थानस्थितेषु सत्सु, एवं ग्रहगुणविशेषणविशिष्टायां शुभपुण्यतिथौ—

${gotra} गोत्रोत्पन्नस्य, ${name} शर्मणः/वर्मणः/गुप्तस्य, ${familyClause} मम आत्मनः श्रुतिस्मृतिपुराणोक्त पुण्यफलप्राप्त्यर्थं, ममोपात्त दुरितक्षयद्वारा श्रीपरमेश्वरप्रीत्यर्थं, कायिक-वाचिक-मानसिक-सांसर्गिक-सकलपापक्षयार्थं, आयुर्बलारोग्यैश्वर्याभिवद्ध्यर्थं, श्रीसूर्यादिनवग्रहदेवताप्रसादसिद्धयर्थं, मनोवाञ्छितफलप्राप्त्यर्थं, धर्मार्थकाममोक्ष-चतुर्विधपुरुषार्थसिद्धयर्थं—

अद्य अस्मिन् मङ्गलप्रदे दिने ${purpose.sanskritPurpose} अहम् आचार्योपाध्याय-ब्राह्मणद्वारा / स्वयमेव सानन्दं सङ्कल्पं करिष्ये।

॥ ॐ तत्सद् ब्रह्माऽर्पणमस्तु ॥`;

  const nepaliFullTranslation = `॥ बृहत् महासङ्कल्पको सरल नेपाली व्याख्या ॥

ॐ परमब्रह्म परमात्मा श्रीविष्णु भगवान्‌को आज्ञाले यस अनन्त सृष्टि चक्रमा:
१. काल गणना: ब्रह्माजीको दोस्रो परार्ध, श्वेतवाराह कल्प, वैवस्वत मन्वन्तर, २८औं कलियुगको प्रथम चरणमा।
२. भूगोल विवरण: जम्बूद्वीप, भरतखण्ड, नेपाल देश, ${geo.subdivisionSanskrit} अन्तर्गत ${geo.localitySanskrit}, पावन ${geo.riverNepali} को पवित्र तट तथा साक्षात् ${geo.deityNepali} को सानिध्यमा।
३. पञ्चाङ्ग गणना: विक्रम संवत् ${toDevanagariNumerals(yearNum)}, ${samvatsarName} संवत्सर, ${ayanaText}ायन, ${rituText} ऋतु, ${masaLoc}, ${paksha} पक्ष, ${panchanga.tithi?.name || ''} तिथि, ${dayName} वार, ${panchanga.nakshatra?.name || ''} नक्षत्रको महापुण्य समयमा।
४. ग्रह स्थिति: सूर्यदेव ${sunR} राशिमा, चन्द्रमा ${moonR} राशिमा, र देवगुरु बृहस्पति ${guruR} राशिमा रहँदा।
५. सङ्कल्प कर्ता: ${gotra} गोत्र, ${name} (तथा सम्पूर्ण परिवार)।
६. सङ्कल्पको उद्देश्य: ${purpose.nepaliPurpose}, समस्त पाप नाश, आरोग्य, ऐश्वर्य तथा धर्म, अर्थ, काम र मोक्ष प्राप्तिका लागि म पूर्ण श्रद्धा र भक्तिपूर्वक यो सङ्कल्प गर्दछु।`;

  const ritualStepsNepali = [
    '१. हातमा कुशको औंठी (पवित्र) लगाउनुहोस्।',
    '२. दायाँ हातको हत्केलामा शुद्ध जल, तिल, कुश, चामल (अक्षता), फूल, दुबो र दक्षिणा (सिक्का) लिनुहोस्।',
    '३. बायाँ हातले दायाँ हातको तलबाट आधार दिनुहोस् र भगवान्‌को स्मरण गर्दै माथिको महासङ्कल्प पाठ गर्नुहोस् वा सुन्नुहोस्।',
    '४. सङ्कल्पको अन्त्यमा "करिष्ये" भन्दा हातमा लिएको सम्पूर्ण सामग्री तामाको थाली वा भुइँमा अर्घ्य पात्रमा श्रद्धापूर्वक समर्पण गर्नुहोस्।'
  ];

  return {
    title: `बृहत् वैदिक महासङ्कल्प (${purpose.labelNepali})`,
    sanskritFullText,
    nepaliFullTranslation,
    ritualStepsNepali,
    pujaTypeLabelNepali: purpose.labelNepali,
    geoInfo: geo,
    planetsFormattedList
  };
}
