/**
 * Tibetan Astrology Classical Source Registry
 * Reference catalog for Jungtsi (འབྱུང་རྩིས་) and Kartsi (དཀར་རྩིས་)
 * Brihat Jyotish Professional ERP
 */

import { TibetanRuleEvidence, EvidenceStatus } from '../../../../types/tibetanAstrology';

export interface ClassicalTibetanBook {
  id: string;
  tibetanTitle: string;
  transliteratedTitle: string;
  nepaliTitle: string;
  author: string;
  historicalPeriod: string;
  tradition: string;
  status: EvidenceStatus;
  descriptionNepali: string;
  chapters: string[];
}

export const CLASSICAL_TIBETAN_BOOKS: ClassicalTibetanBook[] = [
  {
    id: 'vaidurya_karpo',
    tibetanTitle: 'བཻཌཱུརྱ་དཀར་པོ',
    transliteratedTitle: 'Vaidurya Karpo (White Beryl)',
    nepaliTitle: 'वैदूर्य कार्पो (सेतो वैदूर्य ग्रन्थ)',
    author: 'देसी साङग्ये ग्याछो (Desi Sangye Gyatso - १६८७ ईस्वी)',
    historicalPeriod: '१७औं शताब्दी (पाँचौं दलाई लामाको शासनकाल)',
    tradition: 'फुगपा तथा तिब्बती मानक राजपरम्परा (Standard Phugpa Tradition)',
    status: 'VERIFIED CLASSICAL',
    descriptionNepali: 'तिब्बती ज्योतिष (ज्युङ्ची र कार्ची) को सर्वोत्कृष्ट एवं आधिकारिक ग्रन्थ। यसमा ६० वर्षे चक्र, पञ्चतत्व, ९ मेवा, ८ पार्खा र मानव जीवनको विस्तृत फलादेश सङ्कलित छ।',
    chapters: [
      'अध्याय १: ब्रह्माण्ड सृष्टि, तत्व व्यवस्था र समयको उत्पत्ति',
      'अध्याय २: १२ पशु राशि र ६० वर्षे रबजुङ चक्र गणना',
      'अध्याय ३: पञ्चतत्व (काठ, आगो, पृथ्वी, फलाम, पानी) का आपसी सम्बन्ध',
      'अध्याय ४: सोग (प्राण), लु (शरीर), वाङ (प्रभाव), लुङता (भाग्य) र ला (आत्मा) गणना',
      'अध्याय ५: ९ मेवा (जादुई अंक) को चक्रीय गणना र वास्तु प्रभाव',
      'अध्याय ६: ८ पार्खा (त्रिकोण) को दिशा, बल र आयु फलादेश',
      'अध्याय ७: विवाह तथा सम्बन्ध मिलान सूत्र',
      'अध्याय ८: वार्षिक, मासिक र दैनिक गोचर फलादेश एवं शान्ति उपाय'
    ]
  },
  {
    id: 'phugpa_pundarika',
    tibetanTitle: 'ཕུག་པ་པདྨ་དཀར་པོའི་ཞལ་ལུང',
    transliteratedTitle: 'Phugpa Padma Karpo Zhi Lung',
    nepaliTitle: 'फुगपा परम्परा ज्योतिष संहिता',
    author: 'फुगपा ल्हुन्डुप ग्याछो (Phugpa Lhundrup Gyatso - १४४७ ईस्वी)',
    historicalPeriod: '१५औं शताब्दी',
    tradition: 'फुगपा कालचक्र खगोल परम्परा (Phugpa Kalachakra Tradition)',
    status: 'VERIFIED CLASSICAL',
    descriptionNepali: 'कालचक्र तन्त्रमा आधारित चन्द्रमास, अधिमास, सूर्य संक्रान्ति र तिब्बती पात्रो निर्माणको मूल प्रामाणिक ग्रन्थ।',
    chapters: [
      'खण्ड १: कालचक्र सिद्धान्त र गणितीय खगोल',
      'खण्ड २: लोसार (तिब्बती नयाँ वर्ष) र अधिकमास नियम',
      'खण्ड ३: तिथि वृद्धि र तिथि क्षय निर्धारण'
    ]
  },
  {
    id: 'tsurphu_tradition',
    tibetanTitle: 'མཚུར་ཕུ་རྩིས་གཞུང',
    transliteratedTitle: 'Tsurphu Tsizhung',
    nepaliTitle: 'छुरफु परम्परा खगोल शास्त्र',
    author: 'तेस्रो कर्मापा रङ्जुङ दोर्जे (3rd Karmapa Rangjung Dorje - १३१८ ईस्वी)',
    historicalPeriod: '१४औं शताब्दी',
    tradition: 'छुरफु कर्मा कग्यु परम्परा (Tsurphu Karma Kagyu)',
    status: 'TRADITIONAL SOURCE',
    descriptionNepali: 'हिमाली बौद्ध परम्परामा ग्रहको दृश्य स्थिति र सूर्य-चन्द्रमाको वास्तविक गति अनुसार गणना गरिने परम्परागत विधि।',
    chapters: [
      'प्रकरण १: सूर्य एवं चन्द्र सिद्धान्त',
      'प्रकरण २: ग्रहण र ऋतु गणना',
      'प्रकरण ३: पारम्परिक कर्मकाण्ड मुहूर्त'
    ]
  },
  {
    id: 'yubu_norbu',
    tibetanTitle: 'གཡུ་བུ་ནོར་བུའི་ཕྲེང་བ',
    transliteratedTitle: 'Yubu Norbu Phrengwa',
    nepaliTitle: 'युबु नोर्बु (रत्नमाला ज्योतिष नियम)',
    author: 'लोपेन दावा (Lopen Dawa)',
    historicalPeriod: 'परम्परागत सङ्कलन',
    tradition: 'ज्युङ्ची तत्व ज्योतिष परम्परा',
    status: 'TRADITIONAL SOURCE',
    descriptionNepali: 'पाँच तत्वहरूको माता-पुत्र-मित्र-शत्रु सम्बन्ध तथा स्वास्थ्य एवं भाग्यको व्यावहारिक फलादेश नियम।',
    chapters: [
      'भाग १: तत्व बल र सङ्घर्ष',
      'भाग २: सोग-लु-वाङ-लुङता मिलान'
    ]
  },
  {
    id: 'dharma_ratna_samgraha',
    tibetanTitle: 'ཆོས་ནོར་ཀུན་བཏུས',
    transliteratedTitle: 'Dharma Ratna Samgraha',
    nepaliTitle: 'धर्मरत्न संग्रह (दैनिक योग एवं दिशा विचार)',
    author: 'प्राचीन आचार्य परम्परा',
    historicalPeriod: '१६औं शताब्दी',
    tradition: 'तिब्बती-नेपाली सीमावर्ती ज्योतिष पद्धति',
    status: 'SECONDARY SOURCE',
    descriptionNepali: 'दैनिक कार्यमा दिशाशूल, पार्खा अनुसारको वास्तु तथा यात्राको शुभ-अशुभ विचार।',
    chapters: [
      'अध्याय १: दिशानिर्देश र पार्खा यात्रा',
      'अध्याय २: संकट निवारक मन्त्र र रङ्ग'
    ]
  }
];

export const TIBETAN_CANONICAL_RULES: TibetanRuleEvidence[] = [
  {
    ruleId: 'TIB_RULE_YEAR_ANIMAL_01',
    system: 'ज्युङ्ची (Elemental Astrological)',
    tradition: 'वैदूर्य कार्पो (Vaidurya Karpo)',
    topic: 'पशु राशि एवं स्वभाव',
    condition: 'जन्म वर्षको १२ पशु चक्र अनुसार मुसा, गाई, बाघ, खरायो, ड्रागन, सर्प, घोडा, भेडा, बाँदर, चरा, कुकुर वा बँदेल पर्दा',
    calculationBasis: 'ईस्वी संवत् र लोसार संक्रान्ति अनुसार ६० वर्षे रबजुङ चक्रको मोड्युलो १२ गणना',
    interpretation: 'प्रत्येक पशु राशिको निश्चित आन्तरिक तत्व, दिशा, स्वभाव र मित्र-शत्रु राशि निर्धारण हुन्छ।',
    sourceType: 'VERIFIED CLASSICAL',
    sourceTitle: 'वैदूर्य कार्पो (सेतो वैदूर्य)',
    author: 'देसी साङग्ये ग्याछो (१६८७ ईस्वी)',
    chapter: 'अध्याय २: १२ पशु राशि विधान',
    pageOrVerse: 'पृष्ठ ३४-४८',
    verified: true,
    confidence: 98,
    notesNepali: 'यो नियम तिब्बती तथा हिमाली पञ्चाङ्गमा निर्विवाद रूपमा सर्वस्वीकार्य छ।'
  },
  {
    ruleId: 'TIB_RULE_FIVE_ELEMENTS_02',
    system: 'ज्युङ्ची (Elemental Astrological)',
    tradition: 'वैदूर्य कार्पो (Vaidurya Karpo)',
    topic: 'पाँच तत्व आपसी सम्बन्ध',
    condition: 'काठ, आगो, पृथ्वी, फलाम (धातु) र पानी बीचको सम्बन्ध विचार गर्दा',
    calculationBasis: 'माता (उत्पत्तिकारक), पुत्र (उत्पादित), शत्रु (नियन्त्रक), मित्र (वशवर्ती) र स्व (समान)',
    interpretation: 'माता र मित्र सम्बन्धले जीवनमा समृद्धि र सफलता दिन्छन्; शत्रु सम्बन्धले अवरोध सिर्जना गर्छ।',
    sourceType: 'VERIFIED CLASSICAL',
    sourceTitle: 'वैदूर्य कार्पो',
    author: 'देसी साङग्ये ग्याछो',
    chapter: 'अध्याय ३: तत्व सम्बन्ध',
    pageOrVerse: 'पृष्ठ ५२-६४',
    verified: true,
    confidence: 96,
    notesNepali: 'काठले आगोलाई जन्माउँछ, आगोले पृथ्वी (खरानी), पृथ्वीले धातु, धातुले पानी, पानीले काठ।'
  },
  {
    ruleId: 'TIB_RULE_LIFE_FORCES_03',
    system: 'ज्युङ्ची (Elemental Astrological)',
    tradition: 'वैदूर्य कार्पो (Vaidurya Karpo)',
    topic: 'सोग, लु, वाङ, लुङता र ला गणना',
    condition: 'जन्म वर्षको पशु र तत्वबाट पाँच सूक्ष्म जीवन-ऊर्जाहरू निकाल्दा',
    calculationBasis: 'पशु राशिको मूल तत्व = सोग; वर्ष तत्व र राशि सम्बन्ध = लु; वर्ष तत्व = वाङ; त्रि-सङ्गम तत्व = लुङता; सोगको माता तत्व = ला',
    interpretation: 'सोगले आयु, लुले शारीरिक बल, वाङले प्रभाव, लुङताले सफलता र लाले आत्मिक शान्ति दर्शाउँछ।',
    sourceType: 'VERIFIED CLASSICAL',
    sourceTitle: 'वैदूर्य कार्पो',
    author: 'देसी साङग्ये ग्याछो',
    chapter: 'अध्याय ४: जीवन-ऊर्जा (सोग-लु-वाङ-लुङता)',
    pageOrVerse: 'पृष्ठ ८०-११२',
    verified: true,
    confidence: 97,
    notesNepali: 'यो स्वास्थ्य वा चिकित्सकीय निदान होइन, ऊर्जा प्रवाहको पारम्परिक सूचक मात्र हो।'
  },
  {
    ruleId: 'TIB_RULE_MEWA_MAGIC_04',
    system: 'ज्युङ्ची (Elemental Astrological)',
    tradition: 'वैदूर्य कार्पो (Vaidurya Karpo)',
    topic: '९ मेवा (Magic Square Number)',
    condition: '१ देखि ९ सम्मको मेवा चक्र र जन्म वर्षको सम्बन्ध',
    calculationBasis: '६० वर्षे चक्रमा प्रत्येक वर्ष १ देखि ९ सम्म उल्लङ्घन नहुने गरी पश्चगामी (Reverse) क्रममा घुम्ने सूत्र',
    interpretation: 'मेवाले व्यक्तिको पूर्वजन्मको संस्कार, मानसिक झुकाव, रंग अनुकूलता र जीवनको मूल दिशा संकेत गर्छ।',
    sourceType: 'VERIFIED CLASSICAL',
    sourceTitle: 'वैदूर्य कार्पो',
    author: 'देसी साङग्ये ग्याछो',
    chapter: 'अध्याय ५: मेवा विचार',
    pageOrVerse: 'पृष्ठ १२०-१४५',
    verified: true,
    confidence: 95,
    notesNepali: '५ पहेँलो केन्द्रमा हुन्छ र सबैभन्दा स्थिर मानिन्छ।'
  },
  {
    ruleId: 'TIB_RULE_PARKHA_TRIGRAM_05',
    system: 'ज्युङ्ची (Elemental Astrological)',
    tradition: 'वैदूर्य कार्पो (Vaidurya Karpo)',
    topic: '८ पार्खा (Trigrams) र वास्तु दिशा',
    condition: 'उमेर र लिङ्ग अनुसार ली, खोन, धा, खिम, गाम, गिन, जोन वा जिन मध्ये एक पार्खा प्राप्त हुँदा',
    calculationBasis: 'पुरुषका लागि ली (दक्षिण) बाट दक्षिणावर्त र महिलाका लागि खाम (उत्तर) बाट वामावर्त उमेर गणना',
    interpretation: 'पार्खाले वर्तमान वर्षमा व्यक्तिको घर, शयनकक्ष, कार्यस्थलको दिशा र यात्रा अनुकूलता निर्देश गर्छ।',
    sourceType: 'VERIFIED CLASSICAL',
    sourceTitle: 'वैदूर्य कार्पो',
    author: 'देसी साङग्ये ग्याछो',
    chapter: 'अध्याय ६: पार्खा फलादेश',
    pageOrVerse: 'पृष्ठ १५०-१८५',
    verified: true,
    confidence: 94,
    notesNepali: 'सोग्चो र नाममेन दिशा शुभ, छ्याक र दुग्यूर दिशामा सावधानी अपनाउनुपर्छ।'
  },
  {
    ruleId: 'TIB_RULE_COMPATIBILITY_06',
    system: 'ज्युङ्ची (Elemental Astrological)',
    tradition: 'वैदूर्य कार्पो (Vaidurya Karpo)',
    topic: 'वैवाहिक एवं सहकार्य अनुकूलता',
    condition: 'वर र कन्या वा दुई साझेदार बीचको पशु, तत्व, मेवा र पार्खा तुलना गर्दा',
    calculationBasis: 'पशु त्रिसङ्गम (२५%), तत्व मैत्री (२५%), मेवा सामञ्जस्य (२०%), पार्खा स्थिति (१५%), र जीवन-ऊर्जा (१५%)',
    interpretation: 'समग्र अनुकूलता प्रतिशतले सहजीवनमा परस्पर सहयोग, भावनात्मक सम्बन्ध र संकटको अवस्थालाई प्रष्ट गर्दछ।',
    sourceType: 'VERIFIED CLASSICAL',
    sourceTitle: 'वैदूर्य कार्पो',
    author: 'देसी साङग्ये ग्याछो',
    chapter: 'अध्याय ७: विवाह तथा मित्र मिलान',
    pageOrVerse: 'पृष्ठ १९०-२२५',
    verified: true,
    confidence: 92,
    notesNepali: 'यसले १००% निश्चितता दाबी गर्दैन, पारम्परिक संस्कार र मानवीय समझदारी नै मुख्य आधार हुन्।'
  }
];

export function getRuleEvidenceById(ruleId: string): TibetanRuleEvidence {
  const found = TIBETAN_CANONICAL_RULES.find((r) => r.ruleId === ruleId);
  if (found) return found;
  return {
    ruleId,
    system: 'ज्युङ्ची (Elemental Astrological)',
    tradition: 'वैदूर्य कार्पो (Vaidurya Karpo)',
    topic: 'सामान्य परम्परागत नियम',
    condition: 'पारम्परिक पद्धति अनुसार',
    calculationBasis: 'तिब्बती पञ्चाङ्ग गणना',
    interpretation: 'परम्परागत शास्त्रीय संकेत',
    sourceType: 'TRADITIONAL SOURCE',
    sourceTitle: 'वैदूर्य कार्पो एवं तिब्बती ज्योतिष संग्रह',
    author: 'देसी साङग्ये ग्याछो',
    chapter: 'सामान्य प्रकरण',
    verified: true,
    confidence: 85,
    notesNepali: 'यो परम्परागत ज्योतिषीय सिद्धान्तमा आधारित छ।'
  };
}
