/**
 * Vastu Core — Rules Module
 * Comprehensive 17-Room Category Vedic Vastu Rules & Compatibility Specifications
 * Supports: Main Entrance, Puja, Living, Bedroom, Kitchen, Dining, Toilet, Bath,
 * Staircase, Overhead Tank, Underground Tank, Septic Tank, Store, Office,
 * Children's Room, Guest Room, and Parking.
 */

import { VastuPrimaryDirection } from './vastuDirections';

export type RoomRating = 'excellent' | 'good' | 'average' | 'bad' | 'severe';

export interface RoomDirectionRule {
  direction: VastuPrimaryDirection;
  rating: RoomRating;
  points: number; // 0 to 10
  remarksNepali: string;
  traditionalInterpretation?: string;
  suggestedRemedyNepali?: string;
}

export interface VastuRoomCategory {
  id: string;
  nameNepali: string;
  nameEnglish: string;
  iconName: string;
  weight: number; // multiplier for scoring (1.0 to 2.0 based on vitality)
  idealDirections: VastuPrimaryDirection[];
  avoidDirections: VastuPrimaryDirection[];
  descriptionNepali: string;
  directionRules: Record<VastuPrimaryDirection, RoomDirectionRule>;
}

export const VASTU_ROOM_CATEGORIES: VastuRoomCategory[] = [
  // १. मुख्य प्रवेशद्वार (Main Entrance)
  {
    id: 'entrance',
    nameNepali: 'मुख्य प्रवेशद्वार (Main Entrance)',
    nameEnglish: 'Main Entrance',
    iconName: 'DoorClosed',
    weight: 2.0,
    idealDirections: ['NE', 'E', 'N'],
    avoidDirections: ['SW', 'SE', 'S'],
    descriptionNepali: 'घरभित्र प्राणउर्जा र लक्ष्मीको मुख्य प्रवेशद्वार।',
    directionRules: {
      NE: {
        direction: 'NE',
        rating: 'excellent',
        points: 10,
        remarksNepali: 'ईशान कोणको मुख्य ढोका सर्वोपरि शुभ! सुख, शान्ति, ज्ञान र देवीदेवताको आशीर्वाद।',
        traditionalInterpretation: 'परम्परागत मान्यता अनुसार ईशान कोणबाट दैवीय उर्जा प्रवेश भई घरमा सुख-शान्ति प्राप्त हुन्छ।',
      },
      E: {
        direction: 'E',
        rating: 'excellent',
        points: 10,
        remarksNepali: 'पूर्व दिशाको मुख्य ढोका अति उत्तम! मान-सम्मान, सामाजिक प्रतिष्ठा र सुस्वास्थ्य।',
        traditionalInterpretation: 'सूर्य र इन्द्रको शुभ दृष्टिले परिवारका सदस्यहरूमा उत्साह र यश वृद्धि हुन्छ।',
      },
      N: {
        direction: 'N',
        rating: 'excellent',
        points: 10,
        remarksNepali: 'उत्तर दिशाको मुख्य ढोका अति उत्तम! कुबेरको अनुकम्पा, नयाँ अवसर र व्यापारिक सफलता।',
        traditionalInterpretation: 'कुबेर दिशाबाट लक्ष्मीको आगमन हुने विश्वास गरिन्छ।',
      },
      NW: {
        direction: 'NW',
        rating: 'good',
        points: 7,
        remarksNepali: 'वायव्य (उत्तर-पश्चिम) को मुख्य ढोका शुभ मानिन्छ, विशेष गरी व्यापार र सञ्चारका लागि।',
        traditionalInterpretation: 'वायव्य कोणले प्रगति र अतिथि आगमनमा शुभ फल दिन्छ।',
      },
      W: {
        direction: 'W',
        rating: 'good',
        points: 7,
        remarksNepali: 'पश्चिम दिशाको ढोका शुभ मानिन्छ (विशेष गरी ३ र ४ नम्बर पद सुग्रीव र पुष्पदन्त)।',
        traditionalInterpretation: 'वरुण देवताको क्षेत्र, व्यापारिक प्रतिफल र सन्तुष्टि।',
      },
      SE: {
        direction: 'SE',
        rating: 'bad',
        points: 2,
        remarksNepali: 'दक्षिण-पूर्व (आग्नेय) को ढोका मध्यम दोषयुक्त। आगलागी भय र पारिवारिक कलह हुन सक्छ।',
        traditionalInterpretation: 'अग्नि कोणमा मुख्य प्रवेश हुँदा अनावश्यक खर्च र रिसराग बढ्ने मानिन्छ।',
        suggestedRemedyNepali: 'ढोकाको दुवैतर्फ तामाको स्वास्तिक वा गणेश जीको चित्र स्थापना गरी रातो बत्ती बाल्नुहोस्।',
      },
      S: {
        direction: 'S',
        rating: 'bad',
        points: 3,
        remarksNepali: 'दक्षिणको ढोका सामान्यतया मध्यम, केवल गृहक्षत र वितथ पदमा परे मात्र शुभ हुन्छ।',
        traditionalInterpretation: 'यम दिशा भएकाले सावधानीपूर्वक पञ्चधातु वा स्वास्तिक लगाउनु उपयुक्त हुन्छ।',
        suggestedRemedyNepali: 'ढोकामा पञ्चमुखी हनुमान जीको तस्बिर वा पञ्चधातु पिरामिड लगाउनुहोस्।',
      },
      SW: {
        direction: 'SW',
        rating: 'severe',
        points: 0,
        remarksNepali: 'दक्षिण-पश्चिम (नैऋत्य) को मुख्य ढोका महादोष! घरमूलीलाई कष्ट, आर्थिक हानि र दुर्घटना भय।',
        traditionalInterpretation: 'नैऋत्य असुर र पितृको स्थिर क्षेत्र हो, त्यहाँ खुल्ला द्वार हुनु गम्भीर वास्तुदोष मानिन्छ।',
        suggestedRemedyNepali: 'तोडफोड नगरी ढोकामा बाहिरपट्टि पञ्चधातु पिरामिड, सिसा (Lead) स्ट्रिप र राहु यन्त्र जडान गर्नुहोस्।',
      },
      CENTER: {
        direction: 'CENTER',
        rating: 'severe',
        points: 0,
        remarksNepali: 'घरको बीच भाग (ब्रह्मस्थान) मा भारी प्रवेशद्वार वा खम्बा हुनु महादोष!',
        traditionalInterpretation: 'ब्रह्मस्थान सधैँ खुला र निर्बाध हुनुपर्छ।',
        suggestedRemedyNepali: 'ब्रह्मस्थानलाई भारमुक्त राखी चारैतिर तामाका पिरामिड राख्नुहोस्।',
      },
    },
  },

  // २. पूजा कोठा (Puja Room / Mandir)
  {
    id: 'puja_room',
    nameNepali: 'पूजा कोठा (Puja Room)',
    nameEnglish: 'Puja Room',
    iconName: 'Flame',
    weight: 1.8,
    idealDirections: ['NE', 'E', 'N'],
    avoidDirections: ['S', 'SW', 'SE'],
    descriptionNepali: 'दैवीय उर्जा, उपासना र साधनाको पवित्र स्थल।',
    directionRules: {
      NE: {
        direction: 'NE',
        rating: 'excellent',
        points: 10,
        remarksNepali: 'ईशान कोणमा पूजा कोठा हुनु सर्वोपरि उत्तम! ज्ञान, सत्वगुण र ईश्वरीय अनुग्रह।',
        traditionalInterpretation: 'ईशानलाई देवालयको स्थान मानिन्छ, यहाँको पूजा सर्वाधिक फलदायी हुन्छ।',
      },
      E: {
        direction: 'E',
        rating: 'good',
        points: 8,
        remarksNepali: 'पूर्व दिशामा पूजा कोठा शुभ मानिन्छ, पूजा गर्दा पूर्व फर्किनु उत्तम।',
        traditionalInterpretation: 'सूर्य र इन्द्रको सकारात्मक किरणले घरलाई उज्यालो बनाउँछ।',
      },
      N: {
        direction: 'N',
        rating: 'good',
        points: 8,
        remarksNepali: 'उत्तर दिशामा पूजा कोठा शुभ छ, ध्यान र एकाग्रताका लागि उपयुक्त।',
        traditionalInterpretation: 'कुबेर र सोमको दिशा, आर्थिक समृद्धि र सद्बुद्धि।',
      },
      W: {
        direction: 'W',
        rating: 'average',
        points: 5,
        remarksNepali: 'पश्चिम दिशामा पूजा कोठा मध्यम मानिन्छ।',
        traditionalInterpretation: 'पूजा गर्दा पूर्व फर्किने व्यवस्था मिलाउनुहोस्।',
      },
      NW: {
        direction: 'NW',
        rating: 'average',
        points: 5,
        remarksNepali: 'वायव्य दिशामा पूजा कोठा मध्यम फलदायी हुन्छ।',
        traditionalInterpretation: 'वायु कोण चञ्चल हुने भएकाले ध्यान स्थिर रहन गाह्रो हुन सक्छ।',
      },
      SE: {
        direction: 'SE',
        rating: 'bad',
        points: 2,
        remarksNepali: 'आग्नेय कोणमा पूजा कोठा दोषयुक्त। रिसराग र अशान्ति बढ्न सक्छ।',
        traditionalInterpretation: 'अग्नि कोण उग्र हुने भएकाले शान्त सात्विक पूजाका लागि प्रतिकूल।',
        suggestedRemedyNepali: 'ईशान कुनामा जलपात्र राखी पूजा कोठाको भित्तामा हल्का पहेँलो रङ्ग लगाउनुहोस्।',
      },
      S: {
        direction: 'S',
        rating: 'bad',
        points: 2,
        remarksNepali: 'दक्षिण दिशामा मन्दिर हुनु अनुचित मानिन्छ।',
        traditionalInterpretation: 'यमराजको दिशा भएकाले सात्विक साधनाका लागि उपयुक्त मानिँदैन।',
        suggestedRemedyNepali: 'मूर्तिको मुख पूर्व वा उत्तर फर्काउनुहोस् र मङ्गल यन्त्र राख्नुहोस्।',
      },
      SW: {
        direction: 'SW',
        rating: 'severe',
        points: 0,
        remarksNepali: 'नैऋत्य कोणमा पूजा कोठा हुनु गम्भीर दोष! पूजाको फल नमिल्ने र घरमा अशान्ति।',
        traditionalInterpretation: 'नैऋत्य तमोगुणी र पृथ्वी तत्व हो, जहाँ देवस्थान राख्नु निषेध छ।',
        suggestedRemedyNepali: 'पूजा कोठा तत्काल ईशान वा पूर्वमा सार्नुहोस्, नसके पञ्चधातु पिरामिड स्थापना गर्नुहोस्।',
      },
      CENTER: {
        direction: 'CENTER',
        rating: 'average',
        points: 6,
        remarksNepali: 'ब्रह्मस्थानमा मन्दिर मन्दिर-परिसरमा राम्रो भए पनि घरमा खुल्ला ठाउँ हुनुपर्छ।',
        traditionalInterpretation: 'ब्रह्मस्थानमा भारी मन्दिर संरचना नबनाई हलुङ्गो राख्नुहोस्।',
      },
    },
  },

  // ३. भान्सा कोठा (Kitchen)
  {
    id: 'kitchen',
    nameNepali: 'भान्सा कोठा (Kitchen)',
    nameEnglish: 'Kitchen',
    iconName: 'Soup',
    weight: 1.8,
    idealDirections: ['SE', 'NW'],
    avoidDirections: ['NE', 'SW', 'N'],
    descriptionNepali: 'अग्निदेवको वासस्थान, घरका सबै सदस्यको स्वास्थ्य र पोषणको केन्द्र।',
    directionRules: {
      SE: {
        direction: 'SE',
        rating: 'excellent',
        points: 10,
        remarksNepali: 'दक्षिण-पूर्व (आग्नेय कोण) भान्साको लागि सर्वोत्कृष्ट! स्वास्थ्य, दीर्घायु र सुख-समृद्धि।',
        traditionalInterpretation: 'अग्नि तत्वको आफ्नै कोण भएकाले खाना स्वादिष्ट र पाचन प्रक्रिया बलियो हुन्छ।',
      },
      NW: {
        direction: 'NW',
        rating: 'good',
        points: 8,
        remarksNepali: 'वायव्य कोण (उत्तर-पश्चिम) भान्साको दोस्रो उत्तम विकल्प हो।',
        traditionalInterpretation: 'वायुले अग्निलाई सहयोग गर्ने हुँदा वायव्यमा भान्सा राम्रो चल्छ।',
      },
      E: {
        direction: 'E',
        rating: 'good',
        points: 7,
        remarksNepali: 'पूर्व दिशामा भान्सा शुभ मानिन्छ, खाना पकाउँदा पूर्व फर्किनु उपयुक्त।',
        traditionalInterpretation: 'बिहानको सूर्यको किरणले भान्सालाई किटाणुरहित बनाउँछ।',
      },
      S: {
        direction: 'S',
        rating: 'average',
        points: 6,
        remarksNepali: 'दक्षिण दिशामा भान्सा मध्यम फलदायी हुन्छ।',
        traditionalInterpretation: 'अग्नि तत्व निकट भएकाले सामान्य अनुकूल छ।',
      },
      W: {
        direction: 'W',
        rating: 'average',
        points: 5,
        remarksNepali: 'पश्चिम दिशामा भान्सा मध्यम छ।',
        traditionalInterpretation: 'पश्चिममा भान्सा भए खर्च केही बढ्न सक्छ।',
      },
      N: {
        direction: 'N',
        rating: 'bad',
        points: 2,
        remarksNepali: 'उत्तर दिशामा भान्सा हुनु दोषयुक्त। जल र अग्निको टकरावले धन नोक्सानी।',
        traditionalInterpretation: 'उत्तर कुबेर र जलको क्षेत्र हो, त्यहाँ अग्नि बाल्दा व्यापार र धनमा अवरोध हुन्छ।',
        suggestedRemedyNepali: 'चुलोको मुनि हरियो मार्बल वा तामाको प्लेट राखी उत्तर भित्तामा हल्का हरियो रङ्ग लगाउनुहोस्।',
      },
      SW: {
        direction: 'SW',
        rating: 'severe',
        points: 0,
        remarksNepali: 'नैऋत्य कोणमा भान्सा हुनु गम्भीर दोष! गृहिणीलाई लगातार रोग, मानसिक तनाव र कलह।',
        traditionalInterpretation: 'पृथ्वी र अग्निको असन्तुलनले परिवारमा स्थायित्व बिग्रन्छ।',
        suggestedRemedyNepali: 'चुलोलाई आग्नेय कुनामा फर्काउनुहोस् र ग्यास सिलिन्डरको मुनि पहेँलो मार्बल राख्नुहोस्।',
      },
      NE: {
        direction: 'NE',
        rating: 'severe',
        points: 0,
        remarksNepali: 'ईशान कोणमा भान्सा हुनु महादोष! जल र अग्निको प्रत्यक्ष शत्रुता, स्वास्थ्य र वंश हानि।',
        traditionalInterpretation: 'ईशान देवालय र शीतल जलको केन्द्र हो, यहाँ अग्नि बाल्नु महादोष मानिन्छ।',
        suggestedRemedyNepali: 'भान्सा सार्न सम्भव नभए चुलो मुनि तामाको स्वास्तिक र ईशानमा गङ्गाजलको कलश राख्नुहोस्।',
      },
      CENTER: {
        direction: 'CENTER',
        rating: 'severe',
        points: 0,
        remarksNepali: 'घरको केन्द्र ब्रह्मस्थानमा भान्सा हुनु महादोष!',
        traditionalInterpretation: 'ब्रह्मस्थानमा अग्नि बाल्दा सम्पूर्ण घरको ऊर्जा सन्तुलन नष्ट हुन्छ।',
        suggestedRemedyNepali: 'चुलोलाई तत्काल आग्नेय वा वायव्य कोणमा स्थानान्तरण गर्नुहोस्।',
      },
    },
  },

  // ४. मुख्य शयनकक्ष (Master Bedroom)
  {
    id: 'master_bedroom',
    nameNepali: 'मुख्य शयनकक्ष (Master Bedroom)',
    nameEnglish: 'Master Bedroom',
    iconName: 'BedDouble',
    weight: 1.6,
    idealDirections: ['SW', 'S', 'W'],
    avoidDirections: ['NE', 'SE', 'CENTER'],
    descriptionNepali: 'घरमूली (गृहस्वामी) को शयनकक्ष, अधिकार र स्थायित्वको आधार।',
    directionRules: {
      SW: {
        direction: 'SW',
        rating: 'excellent',
        points: 10,
        remarksNepali: 'नैऋत्य कोणमा मुख्य शयनकक्ष हुनु सर्वोत्कृष्ट! नेतृत्व क्षमता, स्थायित्व र दीर्घायु।',
        traditionalInterpretation: 'पृथ्वी तत्वको स्थिरताले गृहस्वामीलाई दृढ निर्णय शक्ति र सुखमय निद्रा दिन्छ।',
      },
      S: {
        direction: 'S',
        rating: 'good',
        points: 8,
        remarksNepali: 'दक्षिण दिशामा शयनकक्ष उत्तम मानिन्छ, निद्रा गहिरो र शान्त हुन्छ।',
        traditionalInterpretation: 'सुत्दा शिर दक्षिणतर्फ राख्नु पृथ्वीको चुम्बकीय क्षेत्रसँग पूर्ण मेल खान्छ।',
      },
      W: {
        direction: 'W',
        rating: 'good',
        points: 8,
        remarksNepali: 'पश्चिम दिशामा मुख्य शयनकक्ष शुभ छ, सन्तोष र व्यवसायिक सफलता।',
        traditionalInterpretation: 'वरुणको क्षेत्र, परिवारमा सन्तुष्टि र सुख।',
      },
      NW: {
        direction: 'NW',
        rating: 'average',
        points: 5,
        remarksNepali: 'वायव्य कोणमा शयनकक्ष मध्यम मानिन्छ (यो अतिथि वा कन्याका लागि उत्तम हो)।',
        traditionalInterpretation: 'वायव्यमा घरमूली बस्दा बारम्बार यात्रा वा स्थान परिवर्तनको योग बन्छ।',
      },
      N: {
        direction: 'N',
        rating: 'average',
        points: 5,
        remarksNepali: 'उत्तर दिशामा शयनकक्ष विद्यार्थी र नयाँ दम्पतीका लागि सामान्य शुभ।',
        traditionalInterpretation: 'कुबेरको क्षेत्र, तर गृहस्वामीका लागि केही अस्थिर।',
      },
      E: {
        direction: 'E',
        rating: 'average',
        points: 5,
        remarksNepali: 'पूर्व दिशामा शयनकक्ष वृद्ध वा बालबालिकाका लागि राम्रो तर गृहस्वामीका लागि सामान्य।',
        traditionalInterpretation: 'सूर्यको ऊर्जा, बिहानी प्रकाश।',
      },
      SE: {
        direction: 'SE',
        rating: 'bad',
        points: 2,
        remarksNepali: 'आग्नेय कोणमा शयनकक्ष दोषयुक्त। श्रीमान्-श्रीमतीबीच अनावश्यक रिसराग र तनाव।',
        traditionalInterpretation: 'अग्नि तत्वले मनमा उद्वेग र अनिद्रा पैदा गर्छ।',
        suggestedRemedyNepali: 'खाटलाई दक्षिण भित्तातर्फ सार्नुहोस् र कोठामा हल्का क्रिम वा हल्का हरियो रङ्ग लगाउनुहोस्।',
      },
      NE: {
        direction: 'NE',
        rating: 'severe',
        points: 0,
        remarksNepali: 'ईशान कोणमा मुख्य दम्पतीको शयनकक्ष हुनु दोषयुक्त। स्वास्थ्य कमजोरी र सन्तान समस्या।',
        traditionalInterpretation: 'ईशान देवालय र साधनाको स्थान हो, गृहस्थ शयनकक्षका लागि निषेध गरिएको छ।',
        suggestedRemedyNepali: 'ईशानको कोठालाई पूजा वा ध्यान कक्ष बनाउनुहोस्, नसके खाटलाई दक्षिण-पश्चिम कुनामा राख्नुहोस्।',
      },
      CENTER: {
        direction: 'CENTER',
        rating: 'severe',
        points: 0,
        remarksNepali: 'ब्रह्मस्थानमा सुत्ने कोठा हुनु महादोष!',
        traditionalInterpretation: 'ब्रह्मस्थान खुला हुनुपर्छ, त्यहाँ सुत्दा मानसिक भ्रम र भारीपन महसुस हुन्छ।',
      },
    },
  },

  // ५. बैठक कोठा (Living Room / Hall)
  {
    id: 'living_room',
    nameNepali: 'बैठक कोठा (Living Room)',
    nameEnglish: 'Living Room',
    iconName: 'Armchair',
    weight: 1.2,
    idealDirections: ['NE', 'E', 'N', 'NW'],
    avoidDirections: ['SW'],
    descriptionNepali: 'पाहुना, साथीभाइ र परिवारजनको मिलन स्थल।',
    directionRules: {
      NE: { direction: 'NE', rating: 'excellent', points: 10, remarksNepali: 'ईशान कोणमा बैठक कोठा अति उत्तम! सकारात्मक उर्जा र आतिथ्य सत्कार।' },
      E: { direction: 'E', rating: 'excellent', points: 10, remarksNepali: 'पूर्व दिशामा बैठक कोठा अति उत्तम! सामाजिक सम्बन्ध र मान-सम्मान वृद्धि।' },
      N: { direction: 'N', rating: 'excellent', points: 10, remarksNepali: 'उत्तर दिशामा बैठक कोठा अति शुभ! व्यवसायिक अवसर र सकारात्मक वातावरण।' },
      NW: { direction: 'NW', rating: 'good', points: 8, remarksNepali: 'वायव्य दिशामा बैठक कोठा शुभ मानिन्छ, पाहुनाको आगमन राम्रो हुन्छ।' },
      W: { direction: 'W', rating: 'average', points: 6, remarksNepali: 'पश्चिम दिशामा बैठक कोठा मध्यम छ।' },
      SE: { direction: 'SE', rating: 'average', points: 5, remarksNepali: 'आग्नेय दिशामा बैठक कोठा सामान्य, चञ्चलता हुन सक्छ।' },
      S: { direction: 'S', rating: 'average', points: 5, remarksNepali: 'दक्षिण दिशामा बैठक कोठा मध्यम अनुकूल।' },
      SW: { direction: 'SW', rating: 'bad', points: 2, remarksNepali: 'नैऋत्यमा बैठक कोठा बनाउँदा पाहुनाहरूले घरमूलीजस्तै अधिकार जमाउने डर हुन्छ।' },
      CENTER: { direction: 'CENTER', rating: 'good', points: 7, remarksNepali: 'ब्रह्मस्थान खुला हलको रूपमा रहनु उपयुक्त मानिन्छ।' },
    },
  },

  // ६. शौचालय (Toilet / Commode)
  {
    id: 'toilet',
    nameNepali: 'शौचालय (Toilet)',
    nameEnglish: 'Toilet',
    iconName: 'Bath',
    weight: 2.0,
    idealDirections: ['NW', 'W', 'S'],
    avoidDirections: ['NE', 'E', 'CENTER', 'SW'],
    descriptionNepali: 'घरको विकार र अशुद्ध जल विसर्जन गर्ने संवेदनशील क्षेत्र।',
    directionRules: {
      NW: {
        direction: 'NW',
        rating: 'excellent',
        points: 10,
        remarksNepali: 'वायव्य कोण (उत्तर-पश्चिम) शौचालयका लागि सर्वोत्कृष्ट र शास्त्रोक्त स्थान हो।',
        traditionalInterpretation: 'वायु तत्वले विकारलाई सजिलै बाहिर फाल्न सहयोग गर्छ।',
      },
      W: {
        direction: 'W',
        rating: 'good',
        points: 8,
        remarksNepali: 'पश्चिम दिशामा शौचालय शुभ मानिन्छ, पानी निकास पश्चिम वा उत्तर-पश्चिम गराउनुहोस्।',
        traditionalInterpretation: 'वरुण क्षेत्र, सामान्य विसर्जनका लागि उपयुक्त।',
      },
      S: {
        direction: 'S',
        rating: 'good',
        points: 7,
        remarksNepali: 'दक्षिण दिशामा (दक्षिण र दक्षिण-पश्चिम बीचको SSW) शौचालय शास्त्रसम्मत मानिन्छ।',
        traditionalInterpretation: 'विसर्जन क्षेत्र।',
      },
      SE: {
        direction: 'SE',
        rating: 'average',
        points: 4,
        remarksNepali: 'आग्नेय कोणमा शौचालय मध्यम दोषयुक्त। अग्नि र जलको प्रतिकूल प्रभाव।',
        suggestedRemedyNepali: 'शौचालयको ढोका सधैँ बन्द राख्नुहोस् र रातो टेप वा तामाको पिरामिड लगाउनुहोस्।',
      },
      E: {
        direction: 'E',
        rating: 'bad',
        points: 1,
        remarksNepali: 'पूर्व दिशामा शौचालय हुनु दोषयुक्त! सामाजिक मान-प्रतिष्ठा र स्वास्थ्यमा असर।',
        suggestedRemedyNepali: 'ढोकामा हरियो पट्टी वा तामाको तार राखी कटोरीमा समुद्री नुन राख्नुहोस्।',
      },
      N: {
        direction: 'N',
        rating: 'bad',
        points: 1,
        remarksNepali: 'उत्तर दिशामा शौचालय हुनु भारी दोष! आर्थिक आम्दानीका स्रोतहरू बन्द हुने खतरा।',
        suggestedRemedyNepali: 'कमोडको वरिपरि नीलो टेप वा एल्युमिनियम स्ट्रिप लगाउनुहोस्, नुनको कटोरी राख्नुहोस्।',
      },
      SW: {
        direction: 'SW',
        rating: 'severe',
        points: 0,
        remarksNepali: 'नैऋत्य कोणमा शौचालय हुनु महादोष! घरमूलीको स्वास्थ्य र स्थायित्वमा गम्भीर क्षति।',
        suggestedRemedyNepali: 'कमोड वरिपरि पहेँलो टेप वा सिसा (Lead) स्ट्रिप लगाई पञ्चधातु पिरामिड स्थापना गर्नुहोस्।',
      },
      NE: {
        direction: 'NE',
        rating: 'severe',
        points: 0,
        remarksNepali: 'ईशान कोणमा शौचालय हुनु वास्तुको सबैभन्दा ठूलो महादोष! मानसिक रोग, क्यान्सर र वंशनाश भय।',
        traditionalInterpretation: 'ईशान महादेव र दिव्य ऊर्जाको केन्द्र हो, जहाँ अशुद्धि हुनु सर्वनाशक मानिन्छ।',
        suggestedRemedyNepali: 'ईशानको शौचालय प्रयोग बन्द गर्नु सर्वोत्तम हुन्छ। नसके नुनको कटोरी, तामाको स्वास्तिक र नियमित धूप बाल्नुहोस्।',
      },
      CENTER: {
        direction: 'CENTER',
        rating: 'severe',
        points: 0,
        remarksNepali: 'ब्रह्मस्थानमा शौचालय हुनु महादोष! सम्पूर्ण घरको प्राणशक्ति नष्ट हुन्छ।',
      },
    },
  },

  // ७. स्नानघर (Bathroom / Wash Area)
  {
    id: 'bathroom',
    nameNepali: 'स्नानघर (Bathroom)',
    nameEnglish: 'Bathroom',
    iconName: 'Droplets',
    weight: 1.2,
    idealDirections: ['E', 'N', 'NE'],
    avoidDirections: ['SW', 'SE'],
    descriptionNepali: 'शरीर शुद्धीकरण र जल प्रयोगको स्थान (बिना शौचालय)।',
    directionRules: {
      E: { direction: 'E', rating: 'excellent', points: 10, remarksNepali: 'पूर्व दिशामा स्नानघर अति उत्तम! बिहानी सूर्यको प्रकाशले ताजगी र स्वास्थ्य दिन्छ।' },
      N: { direction: 'N', rating: 'excellent', points: 9, remarksNepali: 'उत्तर दिशामा स्नानघर शुभ, जल तत्वको अनुकूलता।' },
      NE: { direction: 'NE', rating: 'good', points: 8, remarksNepali: 'ईशानमा केवल स्नानघर (बिना कमोड) शुभ मानिन्छ।' },
      NW: { direction: 'NW', rating: 'good', points: 7, remarksNepali: 'वायव्य दिशामा स्नानघर शुभ।' },
      W: { direction: 'W', rating: 'average', points: 6, remarksNepali: 'पश्चिम दिशामा स्नानघर मध्यम।' },
      S: { direction: 'S', rating: 'average', points: 5, remarksNepali: 'दक्षिण दिशामा स्नानघर सामान्य।' },
      SE: { direction: 'SE', rating: 'bad', points: 2, remarksNepali: 'आग्नेयमा धेरै जल प्रयोग हुँदा अग्नि मन्द हुन सक्छ।' },
      SW: { direction: 'SW', rating: 'severe', points: 0, remarksNepali: 'नैऋत्यमा स्नानघर दोषयुक्त, स्थिरता कमजोर हुन्छ।' },
      CENTER: { direction: 'CENTER', rating: 'bad', points: 1, remarksNepali: 'ब्रह्मस्थानमा स्नानघर अनुचित।' },
    },
  },

  // ८. सिँढी / भर्याङ (Staircase)
  {
    id: 'staircase',
    nameNepali: 'सिँढी / भर्याङ (Staircase)',
    nameEnglish: 'Staircase',
    iconName: 'Footprints',
    weight: 1.5,
    idealDirections: ['S', 'SW', 'W'],
    avoidDirections: ['NE', 'CENTER', 'E'],
    descriptionNepali: 'घरको भारी संरचना, माथिल्लो तलामा जाने सिँढी।',
    directionRules: {
      SW: { direction: 'SW', rating: 'excellent', points: 10, remarksNepali: 'नैऋत्य कोणमा भर्याङ अति उत्तम! घरलाई भारी, स्थिर र सुरक्षित बनाउँछ।' },
      S: { direction: 'S', rating: 'excellent', points: 10, remarksNepali: 'दक्षिण दिशामा भर्याङ अति उत्तम! घुमाउरो घडीको दिशा (Clockwise) हुनुपर्छ।' },
      W: { direction: 'W', rating: 'good', points: 8, remarksNepali: 'पश्चिम दिशामा भर्याङ शुभ मानिन्छ।' },
      NW: { direction: 'NW', rating: 'good', points: 7, remarksNepali: 'वायव्य दिशामा भर्याङ सामान्य शुभ।' },
      SE: { direction: 'SE', rating: 'average', points: 5, remarksNepali: 'आग्नेय कोणमा भर्याङ मध्यम।' },
      E: { direction: 'E', rating: 'bad', points: 2, remarksNepali: 'पूर्व दिशामा भारी भर्याङ हुनुले बिहानी प्रकाश छेक्छ।' },
      N: { direction: 'N', rating: 'bad', points: 2, remarksNepali: 'उत्तर दिशामा भारी भर्याङ हुनुले आर्थिक वृद्धिमा अवरोध गर्छ।' },
      NE: { direction: 'NE', rating: 'severe', points: 0, remarksNepali: 'ईशान कोणमा भर्याङ हुनु भारी वास्तुदोष! टाउकोमा गरुङ्गो भार परी मानसिक अशान्ति।', suggestedRemedyNepali: 'भर्याङमुनि खुल्ला राख्नुहोस्, कुनै वस्तु नराख्नुहोस् र तामाको पिरामिड लगाउनुहोस्।' },
      CENTER: { direction: 'CENTER', rating: 'severe', points: 0, remarksNepali: 'ब्रह्मस्थानमा भर्याङ हुनु महादोष! घरको प्राणकेन्द्र नै थिचिन पुग्छ।' },
    },
  },

  // ९. माथिल्लो पानी ट्याङ्की (Overhead Water Tank)
  {
    id: 'overhead_tank',
    nameNepali: 'माथिल्लो पानी ट्याङ्की (Overhead Tank)',
    nameEnglish: 'Overhead Water Tank',
    iconName: 'Cylinder',
    weight: 1.4,
    idealDirections: ['SW', 'W', 'S'],
    avoidDirections: ['NE', 'CENTER', 'SE'],
    descriptionNepali: 'छतमा राखिने भारी पानीको ट्याङ्की।',
    directionRules: {
      SW: { direction: 'SW', rating: 'excellent', points: 10, remarksNepali: 'छतको नैऋत्य कोणमा भारी ट्याङ्की हुनु अति उत्तम! यसले नैऋत्यलाई सबैभन्दा अग्लो र भारी बनाउँछ।' },
      W: { direction: 'W', rating: 'good', points: 8, remarksNepali: 'पश्चिम दिशामा ओभरहेड ट्याङ्की शुभ मानिन्छ।' },
      S: { direction: 'S', rating: 'good', points: 8, remarksNepali: 'दक्षिण दिशामा ओभरहेड ट्याङ्की शुभ मानिन्छ।' },
      NW: { direction: 'NW', rating: 'average', points: 6, remarksNepali: 'वायव्य दिशामा ट्याङ्की मध्यम।' },
      SE: { direction: 'SE', rating: 'bad', points: 2, remarksNepali: 'आग्नेयमा पानी ट्याङ्की अग्नि र जलको प्रतिकूल सम्बन्ध।' },
      E: { direction: 'E', rating: 'bad', points: 2, remarksNepali: 'पूर्वमा भारी ट्याङ्कीले बिहानी प्रकाश छेक्छ।' },
      N: { direction: 'N', rating: 'bad', points: 2, remarksNepali: 'उत्तर दिशामा भारी ओभरहेड ट्याङ्की अनुचित।' },
      NE: { direction: 'NE', rating: 'severe', points: 0, remarksNepali: 'छतको ईशान कोणमा भारी ट्याङ्की हुनु गम्भीर दोष! शिर भारी भई मानसिक तनाव र आर्थिक हानि।', suggestedRemedyNepali: 'ट्याङ्कीलाई नैऋत्य वा पश्चिममा सार्नुहोस्, नसके ट्याङ्कीमुनि सिसा वा तामाको पिरामिड राख्नुहोस्।' },
      CENTER: { direction: 'CENTER', rating: 'severe', points: 0, remarksNepali: 'ब्रह्मस्थानमा भारी ट्याङ्की हुनु महादोष!' },
    },
  },

  // १०. भूमिगत पानी / इनार / बोरिङ (Underground Water Tank / Borewell)
  {
    id: 'underground_water',
    nameNepali: 'भूमिगत पानी / इनार (Underground Water)',
    nameEnglish: 'Underground Water Tank / Borewell',
    iconName: 'Waves',
    weight: 1.8,
    idealDirections: ['NE', 'N', 'E'],
    avoidDirections: ['SW', 'SE', 'S'],
    descriptionNepali: 'जमीनमुनिको जलभण्डार, बोरिङ, इनार वा अन्डरग्राउन्ड ट्याङ्की।',
    directionRules: {
      NE: { direction: 'NE', rating: 'excellent', points: 10, remarksNepali: 'ईशान कोणमा इनार वा बोरिङ हुनु सर्वोपरि अमृततुल्य! वंश वृद्धि, ऐश्वर्य र अपार शान्ति।' },
      N: { direction: 'N', rating: 'excellent', points: 9, remarksNepali: 'उत्तर दिशामा भूमिगत जल हुनु अति उत्तम! कुबेरको अनुकम्पा र आर्थिक वृद्धि।' },
      E: { direction: 'E', rating: 'good', points: 8, remarksNepali: 'पूर्व दिशामा पानीको खाल्डो/बोरिङ शुभ मानिन्छ।' },
      NW: { direction: 'NW', rating: 'average', points: 5, remarksNepali: 'वायव्य दिशामा भूमिगत जल मध्यम।' },
      W: { direction: 'W', rating: 'average', points: 4, remarksNepali: 'पश्चिम दिशामा भूमिगत जल मध्यम।' },
      SE: { direction: 'SE', rating: 'severe', points: 0, remarksNepali: 'आग्नेयमा पानीको खाल्डो हुनु अग्नि र जलको प्रत्यक्ष शत्रुता! महिलालाई रोग र ऋणभार।', suggestedRemedyNepali: 'खाल्डो पुरेई ईशानमा बनाउनुहोस् वा आग्नेयमा निरन्तर रातो बत्ती बाल्नुहोस्।' },
      S: { direction: 'S', rating: 'severe', points: 0, remarksNepali: 'दक्षिण दिशामा भूमिगत पानी हुनु गम्भीर दोष! पारिवारिक कष्ट।' },
      SW: { direction: 'SW', rating: 'severe', points: 0, remarksNepali: 'नैऋत्य कोणमा भूमिगत खाल्डो हुनु महादोष! अकाल दुर्घटना, गृहस्वामीको नाश र विपत्ति।', suggestedRemedyNepali: 'नैऋत्यको खाल्डो तुरुन्त पुरेई माटो भर्नुहोस् र ईशान वा उत्तरमा बोरिङ खन्नुहोस्।' },
      CENTER: { direction: 'CENTER', rating: 'severe', points: 0, remarksNepali: 'ब्रह्मस्थानमा पानीको खाल्डो हुनु महादोष!' },
    },
  },

  // ११. सेप्टिक ट्याङ्की (Septic Tank)
  {
    id: 'septic_tank',
    nameNepali: 'सेप्टिक ट्याङ्की (Septic Tank)',
    nameEnglish: 'Septic Tank',
    iconName: 'Layers',
    weight: 1.8,
    idealDirections: ['NW', 'W', 'S'],
    avoidDirections: ['NE', 'SE', 'SW', 'CENTER'],
    descriptionNepali: 'घरको दिसा-पिसाब संकलन हुने भूमिगत ट्याङ्की।',
    directionRules: {
      NW: { direction: 'NW', rating: 'excellent', points: 10, remarksNepali: 'वायव्य कोण (उत्तर-पश्चिम) सेप्टिक ट्याङ्कीका लागि सर्वोत्कृष्ट शास्त्रसम्मत स्थान हो।' },
      W: { direction: 'W', rating: 'good', points: 8, remarksNepali: 'पश्चिम दिशामा सेप्टिक ट्याङ्की शुभ मानिन्छ।' },
      S: { direction: 'S', rating: 'good', points: 7, remarksNepali: 'दक्षिण दिशामा (SSW क्षेत्र) सेप्टिक ट्याङ्की राख्न सकिन्छ।' },
      E: { direction: 'E', rating: 'bad', points: 2, remarksNepali: 'पूर्व दिशामा सेप्टिक ट्याङ्की हुनु मान-प्रतिष्ठामा आँच आउनु।' },
      N: { direction: 'N', rating: 'bad', points: 1, remarksNepali: 'उत्तर दिशामा सेप्टिक ट्याङ्की हुनु धनको स्रोतमा अशुद्धि उत्पन्न हुनु।' },
      SE: { direction: 'SE', rating: 'severe', points: 0, remarksNepali: 'आग्नेयमा सेप्टिक ट्याङ्की हुनु अग्नि र अशुद्ध जलको टकराव! दुर्घटना भय।' },
      SW: { direction: 'SW', rating: 'severe', points: 0, remarksNepali: 'नैऋत्यमा सेप्टिक ट्याङ्की हुनु महादोष! स्थिरता समाप्त हुनु।' },
      NE: { direction: 'NE', rating: 'severe', points: 0, remarksNepali: 'ईशान कोणमा सेप्टिक ट्याङ्की हुनु महाभयंकर वास्तुदोष! वंशनाश र गम्भीर रोग।', suggestedRemedyNepali: 'ईशानको सेप्टिक ट्याङ्की तत्काल बन्द गरी वायव्यमा सार्नुहोस्।' },
      CENTER: { direction: 'CENTER', rating: 'severe', points: 0, remarksNepali: 'ब्रह्मस्थानमा सेप्टिक ट्याङ्की हुनु महादोष!' },
    },
  },

  // १२. भोजन कक्ष (Dining Room)
  {
    id: 'dining_room',
    nameNepali: 'भोजन कक्ष (Dining Room)',
    nameEnglish: 'Dining Room',
    iconName: 'Utensils',
    weight: 1.1,
    idealDirections: ['W', 'E', 'NW'],
    avoidDirections: ['SW'],
    descriptionNepali: 'परिवारका सदस्य बसेर भोजन गर्ने शान्त स्थान।',
    directionRules: {
      W: { direction: 'W', rating: 'excellent', points: 10, remarksNepali: 'पश्चिम दिशामा भोजन कक्ष सर्वोत्कृष्ट! अन्नको पूर्ण तृप्ति र स्वास्थ्य लाभ।' },
      E: { direction: 'E', rating: 'good', points: 8, remarksNepali: 'पूर्व दिशामा भोजन कक्ष शुभ, पाचन राम्रो हुन्छ।' },
      NW: { direction: 'NW', rating: 'good', points: 8, remarksNepali: 'वायव्य दिशामा भोजन कक्ष शुभ मानिन्छ।' },
      NE: { direction: 'NE', rating: 'good', points: 7, remarksNepali: 'ईशान दिशामा भोजन कक्ष सामान्य अनुकूल।' },
      N: { direction: 'N', rating: 'good', points: 7, remarksNepali: 'उत्तर दिशामा भोजन कक्ष शुभ।' },
      SE: { direction: 'SE', rating: 'average', points: 6, remarksNepali: 'आग्नेय (भान्सा नजिक) भोजन कक्ष सामान्य अनुकूल।' },
      S: { direction: 'S', rating: 'average', points: 5, remarksNepali: 'दक्षिण दिशामा भोजन कक्ष मध्यम।' },
      SW: { direction: 'SW', rating: 'bad', points: 3, remarksNepali: 'नैऋत्यमा भोजन कक्ष मध्यम प्रतिकूल।' },
      CENTER: { direction: 'CENTER', rating: 'average', points: 6, remarksNepali: 'केन्द्र भागमा हलुका भोजन व्यवस्था सामान्य।' },
    },
  },

  // १३. भण्डार कक्ष / स्टोर (Store Room)
  {
    id: 'store_room',
    nameNepali: 'भण्डार कक्ष / स्टोर (Store Room)',
    nameEnglish: 'Store Room',
    iconName: 'Package',
    weight: 1.1,
    idealDirections: ['SW', 'S', 'W'],
    avoidDirections: ['NE', 'E', 'CENTER'],
    descriptionNepali: 'भारी सामान, अन्न र घरायसी सामग्री भण्डारण गर्ने कोठा।',
    directionRules: {
      SW: { direction: 'SW', rating: 'excellent', points: 10, remarksNepali: 'नैऋत्य कोणमा स्टोर हुनु अति उत्तम! घरको जग भारी र स्थिर हुन्छ।' },
      S: { direction: 'S', rating: 'good', points: 8, remarksNepali: 'दक्षिण दिशामा स्टोर हुनु शुभ।' },
      W: { direction: 'W', rating: 'good', points: 8, remarksNepali: 'पश्चिम दिशामा भारी स्टोर हुनु शुभ।' },
      NW: { direction: 'NW', rating: 'good', points: 7, remarksNepali: 'वायव्य दिशामा खाद्यान्न स्टोर शुभ।' },
      SE: { direction: 'SE', rating: 'average', points: 5, remarksNepali: 'आग्नेय दिशामा स्टोर मध्यम।' },
      N: { direction: 'N', rating: 'bad', points: 2, remarksNepali: 'उत्तर दिशामा भारी कबाडी स्टोर हुनु आर्थिक अवरोध।' },
      E: { direction: 'E', rating: 'bad', points: 2, remarksNepali: 'पूर्व दिशामा भारी स्टोरले प्रकाश छेक्छ।' },
      NE: { direction: 'NE', rating: 'severe', points: 0, remarksNepali: 'ईशान कोणमा कबाड वा भारी स्टोर हुनु गम्भीर दोष! मानसिक तनाव।', suggestedRemedyNepali: 'ईशानबाट कबाड हटाई सफा र हलुङ्गो बनाउनुहोस्।' },
      CENTER: { direction: 'CENTER', rating: 'severe', points: 0, remarksNepali: 'ब्रह्मस्थानमा स्टोर हुनु महादोष!' },
    },
  },

  // १४. अध्ययन कक्ष / कार्यालय (Study / Home Office)
  {
    id: 'study_room',
    nameNepali: 'अध्ययन / कार्यालय (Study / Office)',
    nameEnglish: 'Study / Office',
    iconName: 'BookOpen',
    weight: 1.3,
    idealDirections: ['NE', 'E', 'N', 'W'],
    avoidDirections: ['SE', 'SW'],
    descriptionNepali: 'पढाइ, अध्ययन, अनुसन्धान र व्यवसायिक कार्य गर्ने कोठा।',
    directionRules: {
      NE: { direction: 'NE', rating: 'excellent', points: 10, remarksNepali: 'ईशान कोणमा अध्ययन कक्ष सर्वोत्कृष्ट! एकाग्रता, बुद्धि र स्मरणशक्ति वृद्धि।' },
      E: { direction: 'E', rating: 'excellent', points: 9, remarksNepali: 'पूर्व दिशामा अध्ययन कक्ष अति शुभ, नयाँ ज्ञान र ऊर्जा।' },
      N: { direction: 'N', rating: 'excellent', points: 9, remarksNepali: 'उत्तर दिशामा होम अफिस अति उत्तम, व्यापारिक निर्णय र करियर उन्नति।' },
      W: { direction: 'W', rating: 'good', points: 8, remarksNepali: 'पश्चिम दिशामा अध्ययन कक्ष शुभ, उच्च शिक्षाका लागि उपयुक्त।' },
      NW: { direction: 'NW', rating: 'average', points: 6, remarksNepali: 'वायव्य दिशामा अध्ययन गर्दा मन चञ्चल हुन सक्छ।' },
      S: { direction: 'S', rating: 'average', points: 5, remarksNepali: 'दक्षिण दिशामा अध्ययन मध्यम।' },
      SE: { direction: 'SE', rating: 'bad', points: 2, remarksNepali: 'आग्नेयमा अध्ययन गर्दा रिसराग र छटपटी बढ्ने।' },
      SW: { direction: 'SW', rating: 'bad', points: 2, remarksNepali: 'नैऋत्यमा अध्ययन गर्दा अल्छीपन आउन सक्छ।' },
      CENTER: { direction: 'CENTER', rating: 'average', points: 5, remarksNepali: 'ब्रह्मस्थान खुला हलुका अध्ययनका लागि सामान्य।' },
    },
  },

  // १५. बालबालिकाको कोठा (Children's Bedroom)
  {
    id: 'children_room',
    nameNepali: 'बालबालिकाको कोठा (Children Bedroom)',
    nameEnglish: 'Children Room',
    iconName: 'Baby',
    weight: 1.2,
    idealDirections: ['W', 'NW', 'E', 'N'],
    avoidDirections: ['SW', 'SE'],
    descriptionNepali: 'साना बालबालिकाको सुत्ने र खेल्ने कोठा।',
    directionRules: {
      W: { direction: 'W', rating: 'excellent', points: 10, remarksNepali: 'पश्चिम दिशा बालबालिकाको कोठाका लागि उत्तम! अध्ययन र विकासमा सहयोग।' },
      NW: { direction: 'NW', rating: 'good', points: 8, remarksNepali: 'वायव्य दिशा बालबालिका (विशेष गरी कन्या) का लागि शुभ।' },
      E: { direction: 'E', rating: 'good', points: 8, remarksNepali: 'पूर्व दिशामा बालबालिकाको कोठा शुभ, आरोग्य र ऊर्जा।' },
      N: { direction: 'N', rating: 'good', points: 8, remarksNepali: 'उत्तर दिशामा बालबालिकाको कोठा शुभ।' },
      NE: { direction: 'NE', rating: 'average', points: 6, remarksNepali: 'ईशानमा बालबालिका बस्दा सामान्य, तर सात्विक हुनुपर्छ।' },
      S: { direction: 'S', rating: 'average', points: 5, remarksNepali: 'दक्षिण दिशामा सामान्य।' },
      SE: { direction: 'SE', rating: 'bad', points: 2, remarksNepali: 'आग्नेयमा बालबालिका बस्दा उग्रता र अटेरीपन बढ्न सक्छ।' },
      SW: { direction: 'SW', rating: 'bad', points: 2, remarksNepali: 'नैऋत्य बालबालिकाका लागि नभई घरमूलीका लागि हो।' },
      CENTER: { direction: 'CENTER', rating: 'bad', points: 1, remarksNepali: 'ब्रह्मस्थान अनुचित।' },
    },
  },

  // १६. अतिथि कोठा (Guest Room)
  {
    id: 'guest_room',
    nameNepali: 'अतिथि कोठा (Guest Room)',
    nameEnglish: 'Guest Room',
    iconName: 'UserCheck',
    weight: 1.1,
    idealDirections: ['NW'],
    avoidDirections: ['SW'],
    descriptionNepali: 'आउने पाहुनाको अल्पकालीन बसाइका लागि कोठा।',
    directionRules: {
      NW: { direction: 'NW', rating: 'excellent', points: 10, remarksNepali: 'वायव्य कोण अतिथि कक्षका लागि सर्वोत्कृष्ट! पाहुना समयमै बिदा हुने र सम्बन्ध सुमधुर रहने।' },
      W: { direction: 'W', rating: 'good', points: 8, remarksNepali: 'पश्चिम दिशामा अतिथि कक्ष शुभ।' },
      N: { direction: 'N', rating: 'good', points: 7, remarksNepali: 'उत्तर दिशामा अतिथि कक्ष शुभ।' },
      E: { direction: 'E', rating: 'good', points: 7, remarksNepali: 'पूर्व दिशामा अतिथि कक्ष शुभ।' },
      NE: { direction: 'NE', rating: 'average', points: 5, remarksNepali: 'ईशानमा पाहुना कोठा मध्यम।' },
      SE: { direction: 'SE', rating: 'average', points: 5, remarksNepali: 'आग्नेयमा अतिथि कक्ष मध्यम।' },
      S: { direction: 'S', rating: 'average', points: 5, remarksNepali: 'दक्षिणमा सामान्य।' },
      SW: { direction: 'SW', rating: 'bad', points: 1, remarksNepali: 'नैऋत्यमा पाहुना राख्दा पाहुना घरमूली जस्तै हाबी हुने र लामो समय नछाड्ने डर हुन्छ।' },
      CENTER: { direction: 'CENTER', rating: 'bad', points: 1, remarksNepali: 'ब्रह्मस्थान अनुचित।' },
    },
  },

  // १७. पार्किङ / ग्यारेज (Parking / Garage)
  {
    id: 'parking',
    nameNepali: 'पार्किङ / ग्यारेज (Parking / Garage)',
    nameEnglish: 'Parking / Garage',
    iconName: 'Car',
    weight: 1.1,
    idealDirections: ['NW', 'SE', 'E'],
    avoidDirections: ['NE'],
    descriptionNepali: 'सवारी साधन (गाडी, मोटरसाइकल) राख्ने स्थान।',
    directionRules: {
      NW: { direction: 'NW', rating: 'excellent', points: 10, remarksNepali: 'वायव्य कोण पार्किङका लागि अति उत्तम! सवारी साधनको गतिशीलता र सुरक्षा।' },
      SE: { direction: 'SE', rating: 'good', points: 8, remarksNepali: 'आग्नेय कोणमा दुई पाङ्ग्रे सवारी साधनको पार्किङ शुभ।' },
      E: { direction: 'E', rating: 'good', points: 7, remarksNepali: 'पूर्व दिशामा हलुका पार्किङ शुभ।' },
      N: { direction: 'N', rating: 'good', points: 7, remarksNepali: 'उत्तर दिशामा हलुका पार्किङ शुभ।' },
      W: { direction: 'W', rating: 'average', points: 6, remarksNepali: 'पश्चिम दिशामा पार्किङ मध्यम।' },
      S: { direction: 'S', rating: 'average', points: 6, remarksNepali: 'दक्षिण दिशामा पार्किङ मध्यम।' },
      SW: { direction: 'SW', rating: 'average', points: 5, remarksNepali: 'नैऋत्यमा भारी गाडी राख्न सकिन्छ तर नियमित प्रयोगको साधन उपयुक्त हुन्न।' },
      NE: { direction: 'NE', rating: 'bad', points: 1, remarksNepali: 'ईशान कोणमा सवारी पार्किङले बिहानी प्रकाश र सकारात्मक उर्जा छेक्छ।' },
      CENTER: { direction: 'CENTER', rating: 'severe', points: 0, remarksNepali: 'ब्रह्मस्थानमा पार्किङ हुनु महादोष!' },
    },
  },
];

export function getVastuRoomCategoryById(id: string): VastuRoomCategory | undefined {
  return VASTU_ROOM_CATEGORIES.find((r) => r.id === id);
}
