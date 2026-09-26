// Vedic Vastu Rules Engine for Building Planner
// बालानन्द कर्मकाण्ड
import { CompassDirection, RoomCategory } from '../types';

export interface VastuZoneRule {
  ideal: CompassDirection[];
  acceptable: CompassDirection[];
  forbidden: CompassDirection[];
  element: 'जल' | 'अग्नि' | 'पृथ्वी' | 'वायु' | 'आकाश';
  descriptionNepali: string;
  vedicRemedy: string;
}

export const ROOM_VASTU_RULES: Record<RoomCategory, VastuZoneRule> = {
  pooja: {
    ideal: ['NE'],
    acceptable: ['E', 'N'],
    forbidden: ['SW', 'S', 'SE'],
    element: 'जल',
    descriptionNepali: 'पूजा कोठा सधैं उत्तर-पूर्व (ईशान) कोणमा हुनु परम कल्याणकारी हुन्छ। यसले सात्विक ऊर्जा र बुद्धि दिन्छ।',
    vedicRemedy: 'यदि ईशानमा सम्भव नभए पूर्व वा उत्तरमा स्थापना गरी पहेँलो र सेतो रङ्गको प्रयोग गर्नुहोस्।'
  },
  kitchen: {
    ideal: ['SE'],
    acceptable: ['NW'],
    forbidden: ['NE', 'SW', 'N'],
    element: 'अग्नि',
    descriptionNepali: 'भान्सा आग्नेय कोण (दक्षिण-पूर्व) मा उत्तम मानिन्छ, जहाँ अग्नि देवको वास हुन्छ। खाना पकाउँदा पूर्व मुख हुनुपर्दछ।',
    vedicRemedy: 'यदि आग्नेयमा सम्भव नभए वायव्य (NW) कोण विकल्प हो। ईशानमा भान्सा परेमा तामाको प्लेट र मङ्गल यन्त्र राख्नुहोस्।'
  },
  master_bedroom: {
    ideal: ['SW'],
    acceptable: ['S', 'W'],
    forbidden: ['NE', 'SE'],
    element: 'पृथ्वी',
    descriptionNepali: 'मुख्य घरमूलीको शयनकक्ष दक्षिण-पश्चिम (नैऋत्य) मा हुनुपर्छ। यसले स्थिरता, अधिकार र सुदृढ स्वास्थ्य दिन्छ।',
    vedicRemedy: 'टाउको दक्षिण वा पूर्व सिरानी बनाएर सुत्नुहोस्। नैऋत्यमा भारी सामान राख्नुहोस्।'
  },
  living: {
    ideal: ['NE', 'N', 'E'],
    acceptable: ['NW'],
    forbidden: ['SW'],
    element: 'वायु',
    descriptionNepali: 'बैठक कोठा उत्तर, पूर्व वा उत्तर-पूर्वमा भए अतिथि आगमन शुभ र सामाजिक प्रतिष्ठा उच्च रहन्छ।',
    vedicRemedy: 'बैठक कोठा उज्यालो र हलुका रङ्गको बनाउनुहोस्। सोफा पश्चिम वा दक्षिण भित्तामा अडेस लगाउने गरी राख्नुहोस्।'
  },
  dining: {
    ideal: ['W', 'E'],
    acceptable: ['S', 'SE'],
    forbidden: ['SW'],
    element: 'पृथ्वी',
    descriptionNepali: 'भोजन कक्ष पश्चिम वा पूर्व दिशामा अति उत्तम मानिन्छ, जसले पाचन शक्ति र पारिवारिक मेलमिलाप बढाउँछ।',
    vedicRemedy: 'भोजन गर्दा पूर्व वा उत्तर फर्किनु स्वास्थ्य र दीर्घायुका लागि श्रेयस्कर हुन्छ।'
  },
  bedroom: {
    ideal: ['W', 'S', 'NW'],
    acceptable: ['E'],
    forbidden: ['NE'],
    element: 'वायु',
    descriptionNepali: 'सन्तान तथा परिवारका अन्य सदस्यको शयनकक्ष पश्चिम, उत्तर-पश्चिम वा दक्षिण दिशामा उपयुक्त हुन्छ।',
    vedicRemedy: 'अविवाहित कन्याहरूका लागि वायव्य (NW) कोण उत्तम हुन्छ। ईशान कोणमा शयनकक्ष नबनाउनुहोस्।'
  },
  guest_room: {
    ideal: ['NW'],
    acceptable: ['W', 'NE'],
    forbidden: ['SW'],
    element: 'वायु',
    descriptionNepali: 'अतिथि कोठा उत्तर-पश्चिम (वायव्य) मा भए अतिथि धेरै लामो समय बस्दैनन् र आत्मीय सम्बन्ध सुमधुर रहन्छ।',
    vedicRemedy: 'वायव्य कोणमा हावाको सहज प्रवाह र सेतो वा हल्का क्रिम रङ्ग प्रयोग गर्नुहोस्।'
  },
  study: {
    ideal: ['NE', 'E', 'N'],
    acceptable: ['W'],
    forbidden: ['S', 'SW', 'SE'],
    element: 'आकाश',
    descriptionNepali: 'अध्ययन कक्ष पूर्व, उत्तर वा ईशानमा भए स्मरणशक्ति तीव्र हुने र विद्यामा सफलता मिल्ने मानिन्छ।',
    vedicRemedy: 'पढ्दा पूर्व वा उत्तर मुख फर्किनुहोस्। सरस्वती यन्त्र वा स्फटिकको पिरामिड टेबलमा राख्नुहोस्।'
  },
  office: {
    ideal: ['N', 'NE'],
    acceptable: ['E', 'W'],
    forbidden: ['S', 'SE'],
    element: 'जल',
    descriptionNepali: 'कार्यालय वा कार्यकक्ष उत्तर (कुबेर दिशा) मा भए व्यापार, धन आर्जन र आर्थिक प्रगति निरन्तर हुन्छ।',
    vedicRemedy: 'कुबेर यन्त्र उत्तर भित्तामा लगाउनुहोस् र बस्दा उत्तर वा पूर्व फर्किनुहोस्।'
  },
  toilet: {
    ideal: ['NW', 'W'],
    acceptable: ['S'],
    forbidden: ['NE', 'SW', 'SE'],
    element: 'वायु',
    descriptionNepali: 'शौचालय उत्तर-पश्चिम (वायव्य) वा पश्चिममा उपयुक्त हुन्छ। ईशान र नैऋत्यमा शौचालय महादोष मानिन्छ।',
    vedicRemedy: 'यदि ईशान वा ब्रह्मस्थानमा परेमा वास्तु पिरामिड र समुद्री नुनको कचौरा राखी नकारात्मक ऊर्जा शमन गर्नुहोस्।'
  },
  bathroom: {
    ideal: ['E', 'N'],
    acceptable: ['NW'],
    forbidden: ['SW', 'SE'],
    element: 'जल',
    descriptionNepali: 'स्नानघर (शौचालयविहीन) पूर्व वा उत्तर दिशामा जल प्रवाहका लागि उत्तम हुन्छ।',
    vedicRemedy: 'पानीको निकास उत्तर वा पूर्वतर्फ बग्ने गरी बनाउनुहोस्।'
  },
  staircase: {
    ideal: ['S', 'SW', 'W'],
    acceptable: ['SE', 'NW'],
    forbidden: ['NE'],
    element: 'पृथ्वी',
    descriptionNepali: 'भर्याङ दक्षिण, पश्चिम वा नैऋत्यमा भारी संरचनाका रूपमा हुनुपर्छ। घडीको सुईको दिशामा (Clockwise) चढ्नुपर्छ।',
    vedicRemedy: 'ईशान कोणमा कदापि भर्याङ नबनाउनुहोस्। सिँढीको संख्या विषम (१७, १९, २१) हुनु शुभ मानिन्छ।'
  },
  lift: {
    ideal: ['S', 'W'],
    acceptable: ['NW', 'SE'],
    forbidden: ['NE', 'SW'],
    element: 'पृथ्वी',
    descriptionNepali: 'लिफ्टको मेसिनरी र भारी लोड दक्षिण वा पश्चिम भित्तातर्फ उपयुक्त हुन्छ।',
    vedicRemedy: 'लिफ्टको ढोका उत्तर वा पूर्वतर्फ खुल्ने गरी बनाउनु उत्तम हुन्छ।'
  },
  store: {
    ideal: ['SW', 'S', 'W'],
    acceptable: ['NW'],
    forbidden: ['NE'],
    element: 'पृथ्वी',
    descriptionNepali: 'भण्डार कक्ष भारी सामान राख्न नैऋत्य (SW) वा दक्षिणमा भए स्थायित्व र बचत वृद्धि हुन्छ।',
    vedicRemedy: 'भारी दराजहरू दक्षिण वा पश्चिम भित्तामा टाँसेर राख्नुहोस्।'
  },
  laundry: {
    ideal: ['NW', 'SE'],
    acceptable: ['W'],
    forbidden: ['NE', 'SW'],
    element: 'वायु',
    descriptionNepali: 'धुलाई तथा वासिङ मेसिन वायव्य वा आग्नेय कोणमा राख्नु अनुकूल हुन्छ।',
    vedicRemedy: 'फोहोर पानीको निकास सकेसम्म उत्तर वा पूर्व बग्ने बनाउनुहोस्।'
  },
  balcony: {
    ideal: ['NE', 'E', 'N'],
    acceptable: ['NW'],
    forbidden: ['SW', 'S'],
    element: 'आकाश',
    descriptionNepali: 'बालकनी पूर्व, उत्तर वा ईशानमा भए बिहानीको सूर्यकिरण र प्राणवायु घरभित्र प्रवेश गर्दछ।',
    vedicRemedy: 'बालकनीमा तुलसीको मोठ वा हल्का फूलका गमलाहरू ईशानतर्फ राख्नुहोस्।'
  },
  veranda: {
    ideal: ['E', 'N', 'NE'],
    acceptable: ['NW'],
    forbidden: ['S', 'SW'],
    element: 'आकाश',
    descriptionNepali: 'बरण्डा पूर्व वा उत्तर दिशामा खुला र प्रकाशमय हुनुपर्दछ।',
    vedicRemedy: 'बरण्डाको भुइँ मुख्य घरको भन्दा १ इन्च होचो भए अझ राम्रो मानिन्छ।'
  },
  courtyard: {
    ideal: ['NE', 'N'],
    acceptable: ['E'],
    forbidden: ['SW'],
    element: 'आकाश',
    descriptionNepali: 'घरको मध्यभाग (ब्रह्मस्थान) सधैं खुला, हलुका र स्वच्छ हुनुपर्छ।',
    vedicRemedy: 'ब्रह्मस्थानमा कुनै पनि पिल्लर, भारी पर्खाल वा शौचालय हुनुहुँदैन।'
  },
  garage: {
    ideal: ['NW', 'SE'],
    acceptable: ['N', 'E'],
    forbidden: ['NE', 'SW'],
    element: 'वायु',
    descriptionNepali: 'पार्किङ/ग्यारेज उत्तर-पश्चिम (वायव्य) वा दक्षिण-पूर्व (आग्नेय) मा उपयुक्त हुन्छ।',
    vedicRemedy: 'सवारी साधनको मुख उत्तर वा पूर्व फर्किने गरी पार्क गर्नु वास्तुसम्मत हुन्छ।'
  },
  utility: {
    ideal: ['SE', 'NW'],
    acceptable: ['W'],
    forbidden: ['NE'],
    element: 'अग्नि',
    descriptionNepali: 'इन्वर्टर, मोटर तथा युटिलिटी उपकरण आग्नेय वा वायव्यमा राख्नु सुरक्षित हुन्छ।',
    vedicRemedy: 'विद्युतीय उपकरण ईशान कोणमा नराख्नुहोस्।'
  },
  other: {
    ideal: ['W', 'NW'],
    acceptable: ['N', 'E', 'S'],
    forbidden: ['NE'],
    element: 'पृथ्वी',
    descriptionNepali: 'विविध प्रयोजनका कोठा आवश्यकता अनुसार उपयुक्त स्थानमा व्यवस्थापन गर्न सकिन्छ।',
    vedicRemedy: 'कोठा सधैं सफा, उज्यालो र हावादार राख्नुहोस्।'
  }
};

export const DIRECTION_NAMES_NEPALI: Record<CompassDirection, { name: string; deity: string; element: string }> = {
  N: { name: 'उत्तर', deity: 'कुबेर', element: 'जल / धन' },
  NE: { name: 'उत्तर-पूर्व (ईशान)', deity: 'ईश / शिव', element: 'जल / ज्ञान' },
  E: { name: 'पूर्व', deity: 'इन्द्र / सूर्य', element: 'अग्नि / स्वास्थ्य' },
  SE: { name: 'दक्षिण-पूर्व (आग्नेय)', deity: 'अग्नि', element: 'अग्नि / ऊर्जा' },
  S: { name: 'दक्षिण', deity: 'यम', element: 'पृथ्वी / शक्ति' },
  SW: { name: 'दक्षिण-पश्चिम (नैऋत्य)', deity: 'नैऋति', element: 'पृथ्वी / स्थिरता' },
  W: { name: 'पश्चिम', deity: 'वरुण', element: 'वायु / कर्म' },
  NW: { name: 'उत्तर-पश्चिम (वायव्य)', deity: 'वायु', element: 'वायु / गतिशीलता' },
  CENTER: { name: 'केन्द्र (ब्रह्मस्थान)', deity: 'ब्रह्मा', element: 'आकाश / चेतना' }
};

export const ENTRANCE_VASTU_RATING: Record<CompassDirection, { rating: 'recommended' | 'acceptable' | 'caution' | 'conflict'; notesNepali: string }> = {
  NE: { rating: 'recommended', notesNepali: 'परम शुभ प्रवेशद्वार! धन, ज्ञान, ऐश्वर्य र वंशवृद्धिका लागि सर्वोत्तम।' },
  N: { rating: 'recommended', notesNepali: 'कुबेरको स्थान! आर्थिक सम्पन्नता, सुख शान्ति र व्यापारिक सफलता।' },
  E: { rating: 'recommended', notesNepali: 'सूर्य र इन्द्रको स्थान! मान-सम्मान, आरोग्य र निरन्तर प्रगतिका लागि शुभ।' },
  NW: { rating: 'acceptable', notesNepali: 'मध्यम शुभ। मित्र आगमन, व्यापार र चहलपहल राम्रो हुन्छ।' },
  SE: { rating: 'caution', notesNepali: 'आग्नेय द्वार सामान्यतया मध्यम वा सचेत रहनुपर्ने हुन्छ, अग्नि दोष निवारण आवश्यक।' },
  W: { rating: 'acceptable', notesNepali: 'वरुण देवताको स्थान, सामान्यतया स्वीकार्य, उद्योग र मिहिनेत फलदायी।' },
  S: { rating: 'caution', notesNepali: 'दक्षिण द्वारका लागि मुख्यद्वारको दायाँ-बायाँ सन्तुलन र पञ्चमुखी हनुमान चित्र आवश्यक।' },
  SW: { rating: 'conflict', notesNepali: 'नैऋत्य द्वार वास्तुशास्त्रमा अत्यन्त हानिकारक मानिन्छ, स्थान परिवर्तन वा विशेष महाउपचार अनिवार्य।' },
  CENTER: { rating: 'acceptable', notesNepali: 'केन्द्र भाग खुला वा आँगन (ब्रह्मस्थान) का रूपमा राख्नु अति उत्तम मानिन्छ।' }
};
