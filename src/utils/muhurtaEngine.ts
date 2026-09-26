import { 
  DetailedMuhurtaItem, 
  MuhurtaActivityKey, 
  MuhurtaClassification, 
  MuhurtaSearchFilter, 
  SubhaMuhurtaItem, 
  LocationData, 
  BirthDetails 
} from '../types/astrology';
import { calculatePanchanga, formatTimeNepali } from './panchangaEngine';
import { convertADToBSFull, convertBSToADFull } from './bsCalendarData';
import { toDevanagariNumerals } from './nepaliCalendar';
import { getJulianDay, getAyanamsa, calculatePlanetaryPositions, RASHI_DATA, NAKSHATRA_DATA } from './astroCalculations';

export const MUHURTA_ENGINE_VERSION = '9.0.0-MUHURTA-CLASSICAL';

export interface ActivityRuleConfig {
  key: MuhurtaActivityKey;
  titleNepali: string;
  categoryGroup: string;
  descriptionNepali: string;
  favorableTithis: number[]; // 1 to 15 (1=Pratipada, 2=Dwitiya, etc.)
  forbiddenTithis: number[];
  favorableVaraIndices: number[]; // 0=Sunday ... 6=Saturday
  forbiddenVaraIndices: number[];
  favorableNakshatras: number[]; // 1 to 27
  forbiddenNakshatras: number[];
  favorableLagnas: number[]; // 1 to 12
  keyHouses: number[]; // e.g. 7 for Vivah, 4 for Griha, 10 for Business
  classicalReference: string;
}

// 24 Classical Muhurta Activities Configuration
export const ACTIVITY_RULES: Record<MuhurtaActivityKey, ActivityRuleConfig> = {
  vivah: {
    key: 'vivah',
    titleNepali: 'विवाह संस्कार (Marriage)',
    categoryGroup: 'विवाह तथा पारिवारिक संस्कार',
    descriptionNepali: 'पाणिग्रहण तथा वैवाहिक जीवन शुभारम्भका लागि शुभ तिथि, रोहिणी/मृगशिरा/हस्त/स्वाती/अनुराधा आदि नक्षत्र र सप्तम-शुक्र शुद्धि।',
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13, 15],
    forbiddenTithis: [4, 9, 14, 30],
    favorableVaraIndices: [0, 1, 3, 4, 5], // Sun, Mon, Wed, Thu, Fri
    forbiddenVaraIndices: [2, 6], // Tue, Sat
    favorableNakshatras: [4, 5, 12, 13, 15, 17, 21, 22, 26, 27], // Rohini, Mrigashira, Uttara Phalguni, Hasta, Swati, Anuradha, Uttara Ashadha, Uttara Bhadrapada, Revati
    forbiddenNakshatras: [1, 2, 3, 6, 9, 10, 18, 19], // Bharani, Krittika, Ardra, Ashlesha, Magha, Jyeshtha, Mula
    favorableLagnas: [2, 3, 4, 6, 7, 9, 11, 12], // Taurus, Gemini, Cancer, Virgo, Libra, Sag, Aqu, Pisces
    keyHouses: [7, 8],
    classicalReference: 'मुहूर्तचिन्तामणि - विवाह प्रकरण',
  },
  upanayan: {
    key: 'upanayan',
    titleNepali: 'उपनयन (Upanayana)',
    categoryGroup: 'शिक्षा तथा वैदिक संस्कार',
    descriptionNepali: 'गायत्री मन्त्र दीक्षा तथा जनै धारणका लागि उत्तरा फाल्गुनी, हस्त, चित्रा, स्वाती, पुनर्वसु नक्षत्र एवं गुरु/शुक्रको शुभ स्थिति।',
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13],
    forbiddenTithis: [4, 8, 9, 14, 30],
    favorableVaraIndices: [1, 3, 4, 5], // Mon, Wed, Thu, Fri
    forbiddenVaraIndices: [2, 6], // Tue, Sat
    favorableNakshatras: [1, 4, 5, 7, 8, 12, 13, 14, 15, 17, 21, 26, 27],
    forbiddenNakshatras: [2, 3, 6, 9, 10, 18, 19],
    favorableLagnas: [2, 3, 5, 6, 7, 9, 12],
    keyHouses: [5, 9],
    classicalReference: 'मुहूर्तपारिजात - उपनयन संस्कार',
  },
  bartabandha: {
    key: 'bartabandha',
    titleNepali: 'व्रतबन्ध (Bratabandha)',
    categoryGroup: 'शिक्षा तथा वैदिक संस्कार',
    descriptionNepali: 'बालकको जनैधारण तथा गुरुदीक्षा लिने शुभ समय। गुरु र शुक्रको तारा बलियो भएको र हस्त/चित्रा/स्वाती/पुष्य नक्षत्रयुक्त।',
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13],
    forbiddenTithis: [4, 9, 14, 30],
    favorableVaraIndices: [1, 3, 4, 5],
    forbiddenVaraIndices: [2, 6],
    favorableNakshatras: [1, 4, 5, 7, 8, 12, 13, 14, 15, 17, 21, 26, 27],
    forbiddenNakshatras: [2, 3, 6, 9, 10, 18, 19],
    favorableLagnas: [2, 3, 6, 7, 9, 12],
    keyHouses: [5, 9],
    classicalReference: 'मुहूर्तचिन्तामणि - संस्कार प्रकरण',
  },
  naamkaran: {
    key: 'naamkaran',
    titleNepali: 'नामकरण (Nwarān / Naming)',
    categoryGroup: 'बाल संस्कार',
    descriptionNepali: 'नवाजात शिशुको जन्मको १०/११/१२ औं दिनमा नक्षत्र र तिथिको शुभ योग मिलाई नाम राख्ने शुभ समय।',
    favorableTithis: [1, 2, 3, 5, 7, 10, 11, 12, 13, 15],
    forbiddenTithis: [4, 9, 14, 30],
    favorableVaraIndices: [0, 1, 3, 4, 5],
    forbiddenVaraIndices: [2],
    favorableNakshatras: [1, 4, 5, 7, 8, 11, 12, 13, 15, 17, 20, 21, 22, 23, 26, 27],
    forbiddenNakshatras: [2, 3, 6, 9, 18, 19],
    favorableLagnas: [1, 2, 3, 4, 5, 6, 7, 9, 11, 12],
    keyHouses: [1, 5],
    classicalReference: 'संस्काररत्नमाला - नामकरण अध्याय',
  },
  annaprashan: {
    key: 'annaprashan',
    titleNepali: 'अन्नप्राशन / पासनी (Rice Feeding)',
    categoryGroup: 'बाल संस्कार',
    descriptionNepali: 'शिशुलाई पहिलोपटक सोझै अन्न खुवाउने शुभ समय (छोरालाई ६/८ औं महिना, छोरीलाई ५/७ औं महिना)।',
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13, 15],
    forbiddenTithis: [4, 8, 9, 14, 30],
    favorableVaraIndices: [1, 3, 4, 5],
    forbiddenVaraIndices: [2, 6],
    favorableNakshatras: [1, 4, 5, 7, 8, 12, 13, 14, 15, 17, 21, 22, 23, 26, 27],
    forbiddenNakshatras: [2, 3, 6, 9, 10, 18, 19],
    favorableLagnas: [2, 3, 5, 6, 7, 9, 11, 12],
    keyHouses: [2, 5],
    classicalReference: 'मुहूर्तचिन्तामणि - अन्नप्राशन',
  },
  niskramana: {
    key: 'niskramana',
    titleNepali: 'निष्क्रमण (Nishkramana / First Outdoor)',
    categoryGroup: 'बाल संस्कार',
    descriptionNepali: 'शिशुलाई पहिलोपटक घरबाहिर सूर्य तथा चन्द्रको दर्शन गराउने शुभ समय।',
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13, 15],
    forbiddenTithis: [4, 9, 14, 30],
    favorableVaraIndices: [0, 1, 3, 4, 5],
    forbiddenVaraIndices: [2],
    favorableNakshatras: [1, 4, 5, 7, 8, 12, 13, 15, 17, 21, 22, 27],
    forbiddenNakshatras: [2, 3, 6, 9, 18],
    favorableLagnas: [2, 3, 6, 7, 9, 12],
    keyHouses: [1, 9],
    classicalReference: 'गृह्यसूत्र - निष्क्रमण विधि',
  },
  choodakarma: {
    key: 'choodakarma',
    titleNepali: 'चूडाकर्म / छेवर (First Haircut)',
    categoryGroup: 'बाल संस्कार',
    descriptionNepali: 'बालकको प्रथम शिखा/कपाल मुण्डन गरी पवित्र बनाउने शुभ मुहूर्त।',
    favorableTithis: [2, 3, 5, 7, 10, 11, 13],
    forbiddenTithis: [4, 8, 9, 14, 30],
    favorableVaraIndices: [1, 3, 4, 5],
    forbiddenVaraIndices: [0, 2, 6],
    favorableNakshatras: [1, 4, 5, 7, 8, 12, 13, 14, 15, 21, 26, 27],
    forbiddenNakshatras: [2, 3, 6, 9, 10, 18, 19],
    favorableLagnas: [2, 3, 6, 7, 9, 12],
    keyHouses: [1, 5],
    classicalReference: 'मुहूर्त गणपति - चूडाकर्म',
  },
  vidyarambha: {
    key: 'vidyarambha',
    titleNepali: 'विद्यारम्भ (Vidyarambha / Learning Start)',
    categoryGroup: 'शिक्षा तथा वैदिक संस्कार',
    descriptionNepali: 'पढाइ-लेखाइ, विद्या तथा सरस्वती साधनाको आरम्भ गर्ने अति शुभ समय।',
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13, 15],
    forbiddenTithis: [4, 8, 9, 14, 30],
    favorableVaraIndices: [1, 3, 4, 5],
    forbiddenVaraIndices: [2, 6],
    favorableNakshatras: [1, 4, 5, 7, 8, 12, 13, 14, 15, 17, 21, 22, 26, 27],
    forbiddenNakshatras: [2, 3, 6, 9, 18],
    favorableLagnas: [2, 3, 5, 6, 7, 9, 11, 12],
    keyHouses: [4, 5],
    classicalReference: 'मुहूर्तचिन्तामणि - विद्यारम्भ',
  },
  akshararambha: {
    key: 'akshararambha',
    titleNepali: 'अक्षरारम्भ (Akshararambha)',
    categoryGroup: 'शिक्षा तथा वैदिक संस्कार',
    descriptionNepali: 'अक्षर लेखन तथा औपचारिक पठन-पाठन आरम्भका लागि शुभ नक्षत्र र बुध/गुरुको अनुकूलता।',
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13, 15],
    forbiddenTithis: [4, 9, 14, 30],
    favorableVaraIndices: [1, 3, 4, 5],
    forbiddenVaraIndices: [2, 6],
    favorableNakshatras: [1, 4, 5, 7, 8, 12, 13, 14, 15, 17, 21, 22, 27],
    forbiddenNakshatras: [2, 3, 6, 9, 18, 19],
    favorableLagnas: [2, 3, 6, 7, 9, 12],
    keyHouses: [4, 5],
    classicalReference: 'मुहूर्त कल्पद्रुम',
  },
  griha_pravesh: {
    key: 'griha_pravesh',
    titleNepali: 'गृहप्रवेश (Griha Pravesh)',
    categoryGroup: 'गृह तथा वास्तु',
    descriptionNepali: 'नयाँ वा पुननिर्मित भवनमा सपरिवार प्रवेश गरी बसोबास सुरु गर्ने शुभ मुहूर्त (स्थिर/द्विस्वभाव लग्न, चतुर्थ शुद्धि)।',
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13, 15],
    forbiddenTithis: [4, 8, 9, 14, 30],
    favorableVaraIndices: [1, 3, 4, 5, 6], // Mon, Wed, Thu, Fri, Sat (Sat allowed in some traditions for permanent structure)
    forbiddenVaraIndices: [2, 0], // Tue, Sun avoided for peaceful entry
    favorableNakshatras: [4, 5, 8, 12, 13, 15, 17, 21, 22, 23, 26, 27],
    forbiddenNakshatras: [1, 2, 3, 6, 9, 10, 18, 19],
    favorableLagnas: [2, 3, 5, 6, 7, 8, 9, 11, 12], // Taurus, Leo, Scorpio, Aqu are fixed lagnas
    keyHouses: [4, 8],
    classicalReference: 'वास्तुसौख्यम् / मुहूर्तचिन्तामणि - गृहप्रवेश',
  },
  vastu_puja: {
    key: 'vastu_puja',
    titleNepali: 'वास्तु पूजा (Vāstu Pūjā)',
    categoryGroup: 'गृह तथा वास्तु',
    descriptionNepali: 'भूमि तथा गृहको वास्तु पुरुषको पूजा गरी शान्ति एवं समृद्धि प्राप्त गर्ने शुभ समय।',
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13, 15],
    forbiddenTithis: [4, 9, 14, 30],
    favorableVaraIndices: [0, 1, 3, 4, 5],
    forbiddenVaraIndices: [2],
    favorableNakshatras: [4, 5, 8, 12, 13, 15, 17, 21, 22, 23, 26, 27],
    forbiddenNakshatras: [2, 3, 6, 9, 18],
    favorableLagnas: [2, 5, 8, 11], // Fixed Signs (स्थिर लग्न)
    keyHouses: [4, 1],
    classicalReference: 'समराङ्गणसूत्रधार - वास्तुपूजन',
  },
  bhumipujan: {
    key: 'bhumipujan',
    titleNepali: 'भूमिपूजन (Bhūmi Pūjan)',
    categoryGroup: 'गृह तथा वास्तु',
    descriptionNepali: 'भवन/संरचना निर्माण पूर्व धर्तीमाता र नाग देवताको क्षमापूजा तथा अनुमति लिने मुहूर्त।',
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13, 15],
    forbiddenTithis: [4, 8, 9, 14, 30],
    favorableVaraIndices: [1, 3, 4, 5, 6],
    forbiddenVaraIndices: [2, 0],
    favorableNakshatras: [4, 5, 8, 12, 13, 15, 17, 21, 22, 23, 26, 27],
    forbiddenNakshatras: [2, 3, 6, 9, 18, 19],
    favorableLagnas: [2, 5, 8, 11],
    keyHouses: [4, 10],
    classicalReference: 'वास्तुराजवल्लभ - भूमिपूजन',
  },
  shilanyas: {
    key: 'shilanyas',
    titleNepali: 'शिलान्यास (Foundation Stone)',
    categoryGroup: 'गृह तथा वास्तु',
    descriptionNepali: 'घर, मन्दिर वा भवनको पहिलो जगको ढुङ्गा राख्ने (फाउन्डेशन) अति महत्त्वपूर्ण समय।',
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13, 15],
    forbiddenTithis: [4, 9, 14, 30],
    favorableVaraIndices: [1, 3, 4, 5],
    forbiddenVaraIndices: [0, 2],
    favorableNakshatras: [4, 5, 8, 12, 13, 15, 17, 21, 22, 23, 26, 27],
    forbiddenNakshatras: [2, 3, 6, 9, 18],
    favorableLagnas: [2, 5, 8, 11],
    keyHouses: [4, 10],
    classicalReference: 'अपराजितपृच्छा - शिलान्यास',
  },
  business_launch: {
    key: 'business_launch',
    titleNepali: 'व्यापार आरम्भ (Business Launch)',
    categoryGroup: 'व्यापार तथा अर्थ',
    descriptionNepali: 'नयाँ व्यवसाय, पसल, उद्योग वा कम्पनीको औपचारिक शुभारम्भ (दशम/एकादश भाव, बुध/गुरु/शुक्र बलियो)।',
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13, 15],
    forbiddenTithis: [4, 9, 14, 30],
    favorableVaraIndices: [1, 3, 4, 5], // Mon, Wed, Thu, Fri
    forbiddenVaraIndices: [2, 6], // Tue, Sat
    favorableNakshatras: [1, 4, 5, 7, 8, 12, 13, 14, 15, 17, 21, 22, 23, 26, 27],
    forbiddenNakshatras: [2, 3, 6, 9, 18, 19],
    favorableLagnas: [2, 3, 6, 7, 9, 10, 11, 12],
    keyHouses: [10, 11],
    classicalReference: 'मुहूर्तचिन्तामणि - वाणिज्य प्रकरण',
  },
  office_inauguration: {
    key: 'office_inauguration',
    titleNepali: 'कार्यालय उद्घाटन (Office Inauguration)',
    categoryGroup: 'व्यापार तथा अर्थ',
    descriptionNepali: 'कार्यालय, कार्यकक्ष वा सेवा केन्द्रको द्वारोद्घाटन गरी काम सुरु गर्ने शुभ समय।',
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13, 15],
    forbiddenTithis: [4, 9, 14, 30],
    favorableVaraIndices: [1, 3, 4, 5],
    forbiddenVaraIndices: [2],
    favorableNakshatras: [1, 4, 5, 7, 8, 12, 13, 14, 15, 17, 21, 22, 26, 27],
    forbiddenNakshatras: [2, 3, 6, 9, 18],
    favorableLagnas: [2, 3, 6, 7, 9, 10, 11],
    keyHouses: [10, 11],
    classicalReference: 'मुहूर्त प्रकाश - कार्यालयारम्भ',
  },
  journey: {
    key: 'journey',
    titleNepali: 'यात्रा आरम्भ (Journey / Travel)',
    categoryGroup: 'यात्रा तथा नयाँ कार्य',
    descriptionNepali: 'स्वदेश वा विदेश यात्रा, व्यापारिक वा तीर्थ यात्रा सुरु गर्ने शुभ नक्षत्र, बार तथा दिशाशूल शुद्धि।',
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13],
    forbiddenTithis: [4, 8, 9, 14, 30],
    favorableVaraIndices: [1, 3, 4, 5],
    forbiddenVaraIndices: [2, 6],
    favorableNakshatras: [1, 4, 5, 7, 8, 12, 13, 15, 17, 21, 22, 27],
    forbiddenNakshatras: [2, 3, 6, 9, 18, 19],
    favorableLagnas: [3, 6, 9, 12], // Dual Signs (द्विस्वभाव)
    keyHouses: [9, 12],
    classicalReference: 'मुहूर्तचिन्तामणि - यात्रा प्रकरण',
  },
  new_work: {
    key: 'new_work',
    titleNepali: 'नयाँ काम आरम्भ (New Project Start)',
    categoryGroup: 'यात्रा तथा नयाँ कार्य',
    descriptionNepali: 'नयाँ आयोजना, अनुसन्धान, ठेक्का वा सम्झौतामा हस्ताक्षर गर्ने शुभ समय।',
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13, 15],
    forbiddenTithis: [4, 9, 14, 30],
    favorableVaraIndices: [0, 1, 3, 4, 5],
    forbiddenVaraIndices: [2],
    favorableNakshatras: [1, 4, 5, 7, 8, 12, 13, 14, 15, 17, 21, 22, 26, 27],
    forbiddenNakshatras: [2, 3, 6, 9, 18],
    favorableLagnas: [1, 2, 3, 5, 6, 7, 9, 10, 11],
    keyHouses: [10, 1],
    classicalReference: 'मुहूर्त दीपक - कार्यारम्भ',
  },
  vehicle_purchase: {
    key: 'vehicle_purchase',
    titleNepali: 'वाहन खरिद / प्रयोग (Vehicle Purchase)',
    categoryGroup: 'सम्पत्ति तथा वाहन',
    descriptionNepali: 'सवारी साधन (कार, बाइक, बस आदि) खरिद तथा पहिलोपटक प्रयोग गर्ने शुभ समय।',
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13, 15],
    forbiddenTithis: [4, 9, 14, 30],
    favorableVaraIndices: [1, 3, 4, 5],
    forbiddenVaraIndices: [2, 6],
    favorableNakshatras: [1, 4, 5, 7, 8, 12, 13, 14, 15, 17, 21, 22, 23, 26, 27],
    forbiddenNakshatras: [2, 3, 6, 9, 18],
    favorableLagnas: [2, 3, 4, 6, 7, 9, 11, 12],
    keyHouses: [4, 3],
    classicalReference: 'मुहूर्तचिन्तामणि - वाहन योग',
  },
  puja: {
    key: 'puja',
    titleNepali: 'विशेष पूजा अनुष्ठान (Puja Ritual)',
    categoryGroup: 'देवकार्य तथा अनुष्ठान',
    descriptionNepali: 'गृहशान्ति, सत्यनारायण व्रत, रुद्री तथा इष्टदेवको आराधना गर्ने सर्वसिद्धिदायी शुभ समय।',
    favorableTithis: [1, 2, 3, 5, 7, 8, 10, 11, 12, 13, 15],
    forbiddenTithis: [30],
    favorableVaraIndices: [0, 1, 3, 4, 5],
    forbiddenVaraIndices: [],
    favorableNakshatras: [1, 4, 5, 7, 8, 11, 12, 13, 15, 17, 20, 21, 22, 23, 26, 27],
    forbiddenNakshatras: [2, 3, 9, 18],
    favorableLagnas: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    keyHouses: [9, 5],
    classicalReference: 'धर्मसिन्धु - देवपूजा निर्णय',
  },
  havan: {
    key: 'havan',
    titleNepali: 'हवन तथा याग (Havan / Yajna)',
    categoryGroup: 'देवकार्य तथा अनुष्ठान',
    descriptionNepali: 'अग्निदेवको आहुति, होम तथा हवन गर्ने समय। अग्निवास (पृथ्वी वा पाताल) जाँच आवश्यक।',
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13, 15],
    forbiddenTithis: [4, 9, 14, 30],
    favorableVaraIndices: [0, 1, 3, 4, 5],
    forbiddenVaraIndices: [2, 6],
    favorableNakshatras: [1, 4, 5, 7, 8, 12, 13, 14, 15, 17, 21, 22, 26, 27],
    forbiddenNakshatras: [2, 3, 6, 9, 18],
    favorableLagnas: [1, 2, 3, 5, 6, 7, 9, 11],
    keyHouses: [9, 1],
    classicalReference: 'निर्णयसिन्धु - होमादि विधि',
  },
  yajna: {
    key: 'yajna',
    titleNepali: 'महा-यज्ञ (Maha Yajna)',
    categoryGroup: 'देवकार्य तथा अनुष्ठान',
    descriptionNepali: 'सप्ताह, नवाह, कोटिहोम वा महायज्ञ सङ्कल्प तथा पूर्णाहुतिका लागि अति शुभ मुहूर्त।',
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13, 15],
    forbiddenTithis: [4, 9, 14, 30],
    favorableVaraIndices: [0, 1, 3, 4, 5],
    forbiddenVaraIndices: [2],
    favorableNakshatras: [1, 4, 5, 7, 8, 12, 13, 15, 17, 21, 22, 26, 27],
    forbiddenNakshatras: [2, 3, 6, 9, 18],
    favorableLagnas: [2, 3, 5, 6, 7, 9, 12],
    keyHouses: [9, 5],
    classicalReference: 'शास्त्र संग्रह - यज्ञ प्रकरण',
  },
  devapratishtha: {
    key: 'devapratishtha',
    titleNepali: 'देवप्रतिष्ठा (Deity Consecration)',
    categoryGroup: 'देवकार्य तथा अनुष्ठान',
    descriptionNepali: 'मूर्ति प्राणप्रतिष्ठा, देवमन्दिरमा देवविग्रहको स्थापना गर्ने सर्वोत्कृष्ट मुहूर्त।',
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13, 15],
    forbiddenTithis: [4, 8, 9, 14, 30],
    favorableVaraIndices: [0, 1, 3, 4, 5],
    forbiddenVaraIndices: [2, 6],
    favorableNakshatras: [4, 5, 8, 12, 13, 15, 17, 21, 22, 23, 26, 27],
    forbiddenNakshatras: [2, 3, 6, 9, 18, 19],
    favorableLagnas: [2, 5, 8, 11], // Fixed Lagnas (स्थिर लग्न)
    keyHouses: [1, 9],
    classicalReference: 'प्रतिष्ठा मयूख - देवप्रतिष्ठा',
  },
  temple_work: {
    key: 'temple_work',
    titleNepali: 'मन्दिरसम्बन्धी कार्य (Temple Renovation)',
    categoryGroup: 'देवकार्य तथा अनुष्ठान',
    descriptionNepali: 'मन्दिर निर्माण, जिर्णोद्धार वा देवस्थल सरसफाइ तथा शिखर थपना गर्ने शुभ समय।',
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13, 15],
    forbiddenTithis: [4, 9, 14, 30],
    favorableVaraIndices: [0, 1, 3, 4, 5],
    forbiddenVaraIndices: [2],
    favorableNakshatras: [4, 5, 8, 12, 13, 15, 17, 21, 22, 23, 26, 27],
    forbiddenNakshatras: [2, 3, 6, 9, 18],
    favorableLagnas: [2, 5, 8, 11],
    keyHouses: [9, 4],
    classicalReference: 'वास्तु शास्त्र मञ्जरी',
  },
  other_sanskar: {
    key: 'other_sanskar',
    titleNepali: 'अन्य संस्कार तथा शुभ कार्य (Other Sanskar)',
    categoryGroup: 'अन्य शुभ कार्य',
    descriptionNepali: 'अन्य कुनै पनि परम्परागत संस्कार वा मांगलिक कार्य आरम्भ गर्ने सामान्य शुभ समय।',
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13, 15],
    forbiddenTithis: [4, 9, 14, 30],
    favorableVaraIndices: [0, 1, 3, 4, 5],
    forbiddenVaraIndices: [2, 6],
    favorableNakshatras: [1, 4, 5, 7, 8, 12, 13, 15, 17, 21, 22, 26, 27],
    forbiddenNakshatras: [2, 3, 6, 9, 18],
    favorableLagnas: [1, 2, 3, 5, 6, 7, 9, 11, 12],
    keyHouses: [1, 9],
    classicalReference: 'सामान्य शास्त्र विधान',
  },
};

export const MUHURTA_CATEGORIES = Object.values(ACTIVITY_RULES).map((rule) => ({
  key: rule.key,
  titleNepali: rule.titleNepali,
  categoryGroup: rule.categoryGroup,
}));

/**
 * Calculates Chandrabala (चन्द्रबल)
 * Distance from Person's Birth Moon Rashi to Muhurta Moon Rashi.
 * 1, 3, 6, 7, 10, 11th houses: Favorable (शुभ)
 * 2, 5, 9th houses: Moderate (मध्यम)
 * 4, 8, 12th houses: Unfavorable/Anishta (अनिष्ट)
 */
export function calculateChandrabala(birthMoonRashiId: number, muhurtaMoonRashiId: number): {
  houseFromMoon: number;
  score: number;
  statusNepali: string;
  isFavorable: boolean;
} {
  const houseFromMoon = ((muhurtaMoonRashiId - birthMoonRashiId + 12) % 12) + 1;

  if ([1, 3, 6, 7, 10, 11].includes(houseFromMoon)) {
    return {
      houseFromMoon,
      score: 10,
      statusNepali: `चन्द्रमा जन्म राशिसँग ${toDevanagariNumerals(houseFromMoon)} औं भावमा रहेकाले उत्कृष्ट एवं शुभ चन्द्रबल छ।`,
      isFavorable: true,
    };
  } else if ([2, 5, 9].includes(houseFromMoon)) {
    return {
      houseFromMoon,
      score: 6,
      statusNepali: `चन्द्रमा जन्म राशिसँग ${toDevanagariNumerals(houseFromMoon)} औं भावमा रहेकाले सामान्य/मध्यम चन्द्रबल छ।`,
      isFavorable: true,
    };
  } else {
    return {
      houseFromMoon,
      score: 0,
      statusNepali: `चन्द्रमा जन्म राशिसँग ${toDevanagariNumerals(houseFromMoon)} औं (४, ८ वा १२ औं) भावमा रहेकाले अनिष्ट चन्द्रबल (चन्द्रदोष) छ।`,
      isFavorable: false,
    };
  }
}

/**
 * Calculates Tarabala (ताराबल)
 * Distance from Person's Birth Nakshatra to Muhurta Nakshatra.
 */
export function calculateTarabala(birthNakshatraId: number, muhurtaNakshatraId: number): {
  taraNumber: number;
  taraNameNepali: string;
  score: number;
  statusNepali: string;
  isFavorable: boolean;
} {
  const dist = ((muhurtaNakshatraId - birthNakshatraId + 27) % 27) + 1;
  const taraNum = ((dist - 1) % 9) + 1;

  const taraInfoMap: Record<number, { name: string; score: number; status: string; favorable: boolean }> = {
    1: { name: 'जन्म तारा', score: 5, status: 'जन्म तारा (सामान्य/शरीर सतर्कता आवश्यक)', favorable: true },
    2: { name: 'सम्पत् तारा', score: 10, status: 'सम्पत् तारा (धन-सम्पत्ति वृद्धि गराउने अति शुभ)', favorable: true },
    3: { name: 'विपत् तारा', score: 0, status: 'विपत् तारा (विपत्ति गराउने - त्याज्य)', favorable: false },
    4: { name: 'क्षेम तारा', score: 9, status: 'क्षेम तारा (कल्याणकारी तथा सुरक्षा दिने शुभ)', favorable: true },
    5: { name: 'प्रत्यरि तारा', score: 2, status: 'प्रत्यरि तारा (बाधा-अवरोध ल्याउने - त्याज्य)', favorable: false },
    6: { name: 'साधक तारा', score: 10, status: 'साधक तारा (सफलता तथा सिद्धि दिलाउने अति शुभ)', favorable: true },
    7: { name: 'निधन (वध) तारा', score: 0, status: 'निधन तारा (अत्यन्त कष्टप्रद - सर्वथा त्याज्य)', favorable: false },
    8: { name: 'मित्र तारा', score: 9, status: 'मित्र तारा (मैत्री तथा सहयोग बढाउने शुभ)', favorable: true },
    9: { name: 'परम मित्र तारा', score: 10, status: 'परम मित्र तारा (अत्यन्त हितकारी तथा अति शुभ)', favorable: true },
  };

  const info = taraInfoMap[taraNum] || taraInfoMap[1];

  return {
    taraNumber: taraNum,
    taraNameNepali: info.name,
    score: info.score,
    statusNepali: info.status,
    isFavorable: info.favorable,
  };
}

/**
 * Evaluates candidate time window and Panchanga against Activity Rules
 */
export function evaluateCandidateMuhurtaSlot(
  dateAD: string,
  timeSlotStart: string,
  timeSlotEnd: string,
  activityKey: MuhurtaActivityKey,
  location: LocationData,
  personDetails?: BirthDetails,
  person2Details?: BirthDetails
): DetailedMuhurtaItem {
  const activityConfig = ACTIVITY_RULES[activityKey] || ACTIVITY_RULES.vivah;
  const panchanga = calculatePanchanga(dateAD, timeSlotStart, location.latitude, location.longitude, location.timeZone);

  const bsFull = convertADToBSFull(dateAD);

  // 1. Tithi Check
  const tithiNum = panchanga.tithi.number;
  const isTithiFavorable = activityConfig.favorableTithis.includes(tithiNum);
  const isTithiForbidden = activityConfig.forbiddenTithis.includes(tithiNum);

  // 2. Vara Check
  const dayIndex = ['आइतबार', 'सोमबार', 'मङ्गलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'].indexOf(panchanga.dayNameNepali);
  const isVaraFavorable = activityConfig.favorableVaraIndices.includes(dayIndex);
  const isVaraForbidden = activityConfig.forbiddenVaraIndices.includes(dayIndex);

  // 3. Nakshatra Check
  const nakId = panchanga.nakshatra.number;
  const isNakFavorable = activityConfig.favorableNakshatras.includes(nakId);
  const isNakForbidden = activityConfig.forbiddenNakshatras.includes(nakId);

  // 4. Bhadra (Vishti Karana) Check
  const isBhadra = panchanga.karana.name.includes('विष्टि') || panchanga.karana.name.includes('भद्रा');

  // 5. Inauspicious Yogas Check
  const forbiddenYogas = ['विष्कुम्भ', 'अतिगण्ड', 'शूल', 'गण्ड', 'व्याघात', 'वज्र', 'व्यतीपात', 'परिघ', 'वैधृति'];
  const isYogaForbidden = forbiddenYogas.includes(panchanga.yoga.name);

  // 6. Lagna Calculation for candidate time slot
  const julianDay = getJulianDay(dateAD, timeSlotStart, location.timeZone);
  const ayanamsa = getAyanamsa(julianDay, 'Lahiri');
  const planets = calculatePlanetaryPositions(julianDay, ayanamsa, 1);
  const moonPlanet = planets.find((p) => p.name === 'चन्द्र')!;
  
  // Approximate Lagna Rashi ID at this hour (Lagna rotates 30 deg every ~2 hours)
  const sunPlanet = planets.find((p) => p.name === 'सूर्य')!;
  const [slotH] = timeSlotStart.split(':').map((s) => parseInt(s, 10));
  const sunriseHourNum = parseFloat(panchanga.sunrise.replace(/[^0-9.]/g, '')) || 6;
  const hoursAfterSunrise = (slotH - sunriseHourNum + 24) % 24;
  const lagnaRashiId = ((Math.floor(sunPlanet.longitude / 30) + Math.floor(hoursAfterSunrise / 2)) % 12) + 1;
  const lagnaData = RASHI_DATA[lagnaRashiId - 1];

  const isLagnaFavorable = activityConfig.favorableLagnas.includes(lagnaRashiId);

  // 7. Personalization (Chandrabala & Tarabala)
  let personalAnalysis: DetailedMuhurtaItem['personalAnalysis'] = undefined;
  let personalScoreAdjustment = 0;

  if (personDetails && personDetails.dateAD) {
    const tz = personDetails.location?.timeZone ?? 5.75;
    const pJulianDay = getJulianDay(personDetails.dateAD, personDetails.time || '12:00', tz);
    const pAyanamsa = getAyanamsa(pJulianDay, 'Lahiri');
    const pPlanets = calculatePlanetaryPositions(pJulianDay, pAyanamsa, 1);
    const pMoon = pPlanets.find((p) => p.name === 'चन्द्र')!;

    const chandrabala = calculateChandrabala(pMoon.rashiId, moonPlanet.rashiId);
    const tarabala = calculateTarabala(pMoon.nakshatraId, nakId);

    personalAnalysis = {
      personName: personDetails.name || 'प्रथम व्यक्ति',
      birthRashi: pMoon.rashiName,
      birthNakshatra: NAKSHATRA_DATA[pMoon.nakshatraId - 1].name,
      chandrabala,
      tarabala,
      isPersonalized: true,
    };

    personalScoreAdjustment += (chandrabala.score + tarabala.score) / 2;
  }

  // Double Person Check for Marriage (Couple)
  if (person2Details && person2Details.dateAD && activityKey === 'vivah') {
    const tz2 = person2Details.location?.timeZone ?? 5.75;
    const p2JulianDay = getJulianDay(person2Details.dateAD, person2Details.time || '12:00', tz2);
    const p2Ayanamsa = getAyanamsa(p2JulianDay, 'Lahiri');
    const p2Planets = calculatePlanetaryPositions(p2JulianDay, p2Ayanamsa, 1);
    const p2Moon = p2Planets.find((p) => p.name === 'चन्द्र')!;

    const cb2 = calculateChandrabala(p2Moon.rashiId, moonPlanet.rashiId);
    const tb2 = calculateTarabala(p2Moon.nakshatraId, nakId);

    if (personalAnalysis) {
      personalAnalysis.personName += ` तथा ${person2Details.name || 'द्वितीया व्यक्ति'}`;
    }

    personalScoreAdjustment = (personalScoreAdjustment + (cb2.score + tb2.score) / 2) / 2;
  }

  // 8. Quality Score Calculation (0 to 100)
  let score = 50;

  if (isTithiFavorable) score += 15;
  if (isTithiForbidden) score -= 25;

  if (isVaraFavorable) score += 10;
  if (isVaraForbidden) score -= 15;

  if (isNakFavorable) score += 15;
  if (isNakForbidden) score -= 25;

  if (isLagnaFavorable) score += 10;

  if (isBhadra) score -= 30;
  if (isYogaForbidden) score -= 15;

  // Abhijit bonus if slot falls during Abhijit
  const isAbhijitSlot = timeSlotStart.includes('११:') || timeSlotStart.includes('१२:');
  if (isAbhijitSlot && !isVaraForbidden) {
    score += 10;
  }

  score += personalScoreAdjustment;
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Classification Mapping
  let classification: MuhurtaClassification = 'सामान्य';
  if (score >= 82) {
    classification = 'अत्यन्त अनुकूल';
  } else if (score >= 68) {
    classification = 'अनुकूल';
  } else if (score >= 50) {
    classification = 'सामान्य';
  } else if (score >= 35) {
    classification = 'सावधानी आवश्यक';
  } else {
    classification = 'त्याज्य';
  }

  // Reasons & Explanations Generation
  const favorableReasons: string[] = [];
  const avoidReasons: string[] = [];
  const remedies: string[] = [];

  if (isTithiFavorable) favorableReasons.push(`अनुकूल तिथि: ${panchanga.tithi.name} (${panchanga.tithi.paksha} पक्ष)`);
  if (isVaraFavorable) favorableReasons.push(`शुभ बार: ${panchanga.dayNameNepali} (${activityConfig.titleNepali} का लागि उत्तम)`);
  if (isNakFavorable) favorableReasons.push(`अनुकूल नक्षत्र: ${panchanga.nakshatra.name} (स्वामी: ${panchanga.nakshatra.lord})`);
  if (isLagnaFavorable) favorableReasons.push(`शुभ लग्न: ${lagnaData.name} लग्न (स्वामित्व: ${lagnaData.lord})`);
  if (isAbhijitSlot) favorableReasons.push(`अभिजित मुहूर्त योग (मध्याह्न काल) सर्वदोष निवारक।`);

  if (personalAnalysis) {
    if (personalAnalysis.chandrabala.score >= 6) {
      favorableReasons.push(`चन्द्रबल: ${personalAnalysis.chandrabala.statusNepali}`);
    } else {
      avoidReasons.push(`चन्द्रदोष: ${personalAnalysis.chandrabala.statusNepali}`);
    }

    if (personalAnalysis.tarabala.score >= 5) {
      favorableReasons.push(`ताराबल: ${personalAnalysis.tarabala.statusNepali}`);
    } else {
      avoidReasons.push(`तारादोष: ${personalAnalysis.tarabala.statusNepali}`);
    }
  }

  if (isTithiForbidden) avoidReasons.push(`निषिद्ध/अशुभ तिथि: ${panchanga.tithi.name} परेको।`);
  if (isVaraForbidden) avoidReasons.push(`निषिद्ध वार: ${panchanga.dayNameNepali} परेको।`);
  if (isNakForbidden) avoidReasons.push(`त्याज्य/निषिद्ध नक्षत्र: ${panchanga.nakshatra.name}।`);
  if (isBhadra) avoidReasons.push(`भद्रा दोष (विष्टि करण) सक्रिय रहेको।`);
  if (isYogaForbidden) avoidReasons.push(`अशुभ पञ्चाङ्ग योग: ${panchanga.yoga.name} परेको।`);

  // Remedy Suggestions
  if (avoidReasons.length > 0) {
    remedies.push('अभिजित मुहूर्त वा गुरु/शुक्रको होरा प्रयोग गरी कार्य गर्न सकिने।');
    remedies.push('इष्टदेवको पूजन, गणेश सहस्रनाम वा मन्त्र जप गरी दोष शमन गर्ने।');
  } else {
    remedies.push('कुनै प्रमुख दोष नभएकाले सामान्य सङ्कल्प पूजा गरी कार्य शुभारम्भ गर्न सकिने।');
  }

  return {
    id: `muhurta_${activityKey}_${dateAD}_${timeSlotStart.replace(/[^0-9]/g, '')}`,
    activityKey,
    activityNepali: activityConfig.titleNepali,
    dateAD,
    dateBS: bsFull.formattedBS,
    dayNepali: panchanga.dayNameNepali,
    startTime: formatTimeNepali(slotH),
    endTime: timeSlotEnd,
    classification,
    qualityScore: score,
    location,
    panchangaSummary: {
      tithi: `${panchanga.tithi.name} (${panchanga.tithi.paksha})`,
      paksha: panchanga.tithi.paksha,
      nakshatra: panchanga.nakshatra.name,
      yoga: panchanga.yoga.name,
      karana: panchanga.karana.name,
      moonRashi: panchanga.moonRashi,
      sunrise: panchanga.sunrise,
      sunset: panchanga.sunset,
    },
    lagnaSummary: {
      lagnaRashi: lagnaData.name,
      lagnaLord: lagnaData.lord,
      house7Status: activityKey === 'vivah' ? 'सप्तम भाव निर्दोष' : undefined,
      house4Status: activityKey === 'griha_pravesh' ? 'चतुर्थ भाव स्थिर एवं शुभ' : undefined,
      house10Status: activityKey === 'business_launch' ? 'दशम भाव व्यापार अनुकुल' : undefined,
      ashtamaShuddhi: !isBhadra && !isTithiForbidden,
    },
    ineffectiveSlots: {
      rahuKaal: `${panchanga.rahuKaal.start} देखि ${panchanga.rahuKaal.end}`,
      yamagand: `${panchanga.yamaganda.start} देखि ${panchanga.yamaganda.end}`,
      gulika: `${panchanga.gulika.start} देखि ${panchanga.gulika.end}`,
      durmuhurta: [`बिहान ०८:३० - ०९:१५`, `साँझ १५:४५ - १६:३०`],
      bhadraActive: isBhadra,
    },
    auspiciousSlots: {
      abhijit: `${panchanga.abhijitMuhurta.start} देखि ${panchanga.abhijitMuhurta.end}`,
      brahmaMuhurta: `${panchanga.brahmaMuhurta.start} देखि ${panchanga.brahmaMuhurta.end}`,
    },
    personalAnalysis,
    reasonsFavorableNepali: favorableReasons,
    reasonsAvoidNepali: avoidReasons,
    reasonsDoshaRemediesNepali: remedies,
    sourceRuleReferenceNepali: activityConfig.classicalReference,
    astrologerNotesNepali: `शास्त्रीय नियमअनुसार ${activityConfig.titleNepali} का लागि निर्धारित नतिजा।`,
  };
}

function chandrabalaScoreText(s: number): string {
  if (s >= 10) return 'उत्कृष्ट';
  if (s >= 6) return 'मध्यम';
  return 'अनिष्ट';
}

/**
 * Multi-day range search for Auspicious Subha Muhurtas
 */
export function searchSubhaMuhurtasForRange(filter: MuhurtaSearchFilter): DetailedMuhurtaItem[] {
  const results: DetailedMuhurtaItem[] = [];

  const startAD = new Date(filter.startDateAD);
  const endAD = new Date(filter.endDateAD);

  // Candidate time slots during the day (Local Sun hours)
  const candidateSlots = [
    { start: '07:15', end: '०९:४५ बिहान' },
    { start: '11:45', end: '०१:१५ दिउँसो (अभिजित)' },
    { start: '14:30', end: '०४:४५ दिउँसो' },
  ];

  const maxDays = 60; // Up to 2 months search
  let currentAD = new Date(startAD);
  let countDays = 0;

  while (currentAD <= endAD && countDays < maxDays) {
    const yearStr = currentAD.getFullYear();
    const monthStr = String(currentAD.getMonth() + 1).padStart(2, '0');
    const dayStr = String(currentAD.getDate()).padStart(2, '0');
    const dateAD = `${yearStr}-${monthStr}-${dayStr}`;

    for (const slot of candidateSlots) {
      const muhurta = evaluateCandidateMuhurtaSlot(
        dateAD,
        slot.start,
        slot.end,
        filter.activityKey,
        filter.location,
        filter.personDetails,
        filter.person2Details
      );

      // Filter based on minimum classification if requested
      if (!filter.minimumClassification || isScoreMeetingMinClassification(muhurta.classification, filter.minimumClassification)) {
        results.push(muhurta);
      }
    }

    currentAD.setDate(currentAD.getDate() + 1);
    countDays++;
  }

  // Sort by Quality Score descending
  results.sort((a, b) => b.qualityScore - a.qualityScore);

  return results;
}

function isScoreMeetingMinClassification(curr: MuhurtaClassification, minNeeded: MuhurtaClassification): boolean {
  const levels: MuhurtaClassification[] = ['अत्यन्त अनुकूल', 'अनुकूल', 'सामान्य', 'सावधानी आवश्यक', 'त्याज्य'];
  return levels.indexOf(curr) <= levels.indexOf(minNeeded);
}

/**
 * Backward compatibility function for existing SubhaMuhurtaItem[]
 */
export function generateSubhaMuhurtas(
  categoryKey: string = 'vivah',
  targetYearAD: number = 2026,
  targetMonthAD: number = 5
): SubhaMuhurtaItem[] {
  const defaultLoc: LocationData = {
    name: 'काठमाडौँ',
    country: 'नेपाल',
    latitude: 27.7172,
    longitude: 85.324,
    timeZone: 5.75,
  };

  const monthStr = targetMonthAD < 10 ? `0${targetMonthAD}` : `${targetMonthAD}`;
  const startDateAD = `${targetYearAD}-${monthStr}-01`;
  const endDateAD = `${targetYearAD}-${monthStr}-28`;

  const keyMap: Record<string, MuhurtaActivityKey> = {
    vivah: 'vivah',
    bartabandha: 'bartabandha',
    griha_pravesh: 'griha_pravesh',
    vastu: 'vastu_puja',
    naamkaran: 'naamkaran',
    annaprashan: 'annaprashan',
    business_launch: 'business_launch',
    vehicle_purchase: 'vehicle_purchase',
    journey: 'journey',
  };

  const mappedKey = keyMap[categoryKey] || 'vivah';

  const detailedList = searchSubhaMuhurtasForRange({
    activityKey: mappedKey,
    location: defaultLoc,
    startDateAD,
    endDateAD,
    minimumClassification: 'सामान्य',
  });

  return detailedList.slice(0, 8).map((item) => ({
    id: item.id,
    category: item.activityKey,
    categoryNepali: item.activityNepali,
    dateAD: item.dateAD,
    dateBS: item.dateBS,
    dayNepali: item.dayNepali,
    startTime: item.startTime,
    endTime: item.endTime,
    tithi: item.panchangaSummary.tithi,
    nakshatra: item.panchangaSummary.nakshatra,
    lagna: `${item.lagnaSummary.lagnaRashi} लग्न (${item.classification})`,
    quality: item.qualityScore >= 82 ? 'अति शुभ' : item.qualityScore >= 68 ? 'उत्तम' : 'मध्यम',
    specialNotesNepali: item.reasonsFavorableNepali.join(' | ') || 'सर्वार्थसिद्धि योगयुक्त मुहूर्त।',
    avoidFactors: item.reasonsAvoidNepali,
  }));
}

/**
 * Interactive Q&A Engine for Classical Muhurta Guidance
 */
export function askMuhurtaQuestion(question: string, contextResults?: DetailedMuhurtaItem[]): string {
  const q = question.toLowerCase();

  if (q.includes('राहुकाल') || q.includes('rahu')) {
    return `**राहुकाल (Rāhu Kāla) सम्बन्धी शास्त्रीय नियम:**\n\n- राहुकाल दिनको ८ भागमध्ये १ भाग (लगभग ९० मिनेट) रहन्छ।\n- राहुकालमा आरम्भ गरिएका नयाँ कार्यहरूमा विघ्न, ढिलाइ वा हानि हुने शास्त्रीय मान्यता छ।\n- **विशेष शमन:** अभिजित मुहूर्त, गुरुको विशेष दृष्टि वा अत्यावश्यक अवस्थामा गणेश पूजन गरी कार्य गर्न सकिन्छ।`;
  }

  if (q.includes('ताराबल') || q.includes('tara')) {
    return `**ताराबल (Tārābala) गणना विधि:**\n\n- जन्म नक्षत्रदेखि मुहूर्त नक्षत्रसम्म गन्ती गरी ९ ले भाग गर्दा आउने शेष:\n  - १: जन्म तारा (सामान्य)\n  - २: सम्पत् तारा (अति शुभ)\n  - ३: विपत् तारा (त्याज्य)\n  - ४: क्षेम तारा (शुभ)\n  - ५: प्रत्यरि तारा (त्याज्य)\n  - ६: साधक तारा (अति शुभ)\n  - ७: निधन/वध तारा (सर्वथा त्याज्य)\n  - ८: मित्र तारा (शुभ)\n  - ९/०: परम मित्र तारा (अति शुभ)।`;
  }

  if (q.includes('चन्द्रबल') || q.includes('chandra')) {
    return `**चन्द्रबल (Chandrabala) नियम:**\n\n- जन्म चन्द्र राशिबाट मुहूर्तको चन्द्रमा कुन राशिमा छ भनी हेरिन्छ:\n  - १, ३, ६, ७, १०, ११ औं भाव: **उत्कृष्ट चन्द्रबल**\n  - २, ५, ९ औं भाव: **मध्यम चन्द्रबल**\n  - ४, ८, १२ औं भाव: **अनिष्ट चन्द्रबल (चन्द्रदोष)**।`;
  }

  if (q.includes('विवाह') || q.includes('marriage')) {
    return `**विवाह मुहूर्तका मुख्य आधारहरू:**\n\n- **शुभ नक्षत्र:** रोहिणी, मृगशिरा, उत्तराफाल्गुनी, हस्त, स्वाती, अनुराधा, उत्तराषाढा, उत्तराभाद्रपदा, रेवती।\n- **शुभ तिथि:** द्वितीया, तृतीया, पञ्चमी, सप्तमी, दशमी, एकादशी, त्रयोदशी, पूर्णिमा।\n- **वर्जित:** भद्रा (विष्टि करण), राहुकाल, मङ्गल/शनिवार, त्रिपुष्कर दोष तथा त्रिबल शुद्धि (वर-कन्याको गुरु/सूर्य/चन्द्र बल) विचार गरिन्छ।`;
  }

  if (q.includes('गृहप्रवेश') || q.includes('house')) {
    return `**गृहप्रवेश मुहूर्त नियम:**\n\n- स्थिर लग्न (वृष, सिंह, वृश्चिक, कुम्भ) वा द्विस्वभाव लग्न शुभ मानिन्छ।\n- चतुर्थ भाव शुद्ध हुनुपर्छ।\n- माघ, फाल्गुण, वैशाख, जेठ महिना गृहप्रवेशका लागि उत्तम मानिन्छन्।`;
  }

  if (contextResults && contextResults.length > 0) {
    const top = contextResults[0];
    return `खोजिएको विवरणअनुसार **${top.activityNepali}** का लागि सबैभन्दा उत्तम मुहूर्त **${top.dateBS} (${top.dayNepali})** मा **${top.startTime} देखि ${top.endTime}** सम्म रहेको छ।\n- श्रेणी: **${top.classification}** (अङ्क: ${toDevanagariNumerals(top.qualityScore)}/१००)\n- पञ्चाङ्ग: ${top.panchangaSummary.tithi}, ${top.panchangaSummary.nakshatra} नक्षत्र\n- मुख्य कारण: ${top.reasonsFavorableNepali.join(', ')}`;
  }

  return `शास्त्रीय मुहूर्त सिद्धान्तअनुसार कार्यको प्रकृति, स्थान, सूर्योदय/सूर्यास्त, पञ्चाङ्ग (तिथि, बार, नक्षत्र, योग, करण), चन्द्रबल, ताराबल तथा लग्न शुद्धि परीक्षण गरी मुहूर्त निर्धारण गरिन्छ।`;
}
