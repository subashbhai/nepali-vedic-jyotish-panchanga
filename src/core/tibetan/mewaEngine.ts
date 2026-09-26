/**
 * Tibetan Mewa Engine (स्मे-बा ९ / Magic Square)
 * Based on Vaidurya Karpo (वैदूर्य कार्पो)
 * Brihat Jyotish Professional ERP
 */

import { TibetanMewa } from '../../types/tibetanAstrology';
import { TIBETAN_FIVE_ELEMENTS } from './tibetanElementEngine';

export const TIBETAN_MEWA_LIST: Record<number, TibetanMewa> = {
  1: {
    number: 1,
    nameNepali: '१ सेतो (White 1)',
    nameTibetan: 'གཅིག་དཀར (gCig dKar)',
    element: TIBETAN_FIVE_ELEMENTS.iron,
    directionNepali: 'उत्तर (North)',
    colorNameNepali: 'सेतो / चाँदी (White)',
    hexColor: '#64748B',
    symbolNepali: 'शुद्ध जल एवं स्फटिक',
    qualityNepali: 'शान्त, विचारशील, अनुसन्धानप्रिय एवं पारदर्शी',
    karmicTendencyNepali: 'पूर्वजन्मको धार्मिक पुण्य, सूक्ष्म ज्ञान एवं आध्यात्मिक चेतना।',
    favorableActivities: ['ध्यान, साधना तथा गहिरो अध्ययन', 'जल सम्बन्धी व्यापार तथा अनुसन्धान', 'कानून, न्याय र परामर्श सेवा'],
    cautions: ['धेरै चिसो वा कफजन्य विकारबाट बच्नुहोस्', 'अत्यधिक एकान्तप्रियता त्याग्नुहोस्'],
    turtlePartNepali: 'कूर्माकार महापुच्छर (Tail of the Cosmic Turtle)',
    protectiveDeityNepali: 'अवलोकितेश्वर (चेनरेजिग) एवं सेतो तारा',
    sacredMantra: 'ॐ मणि पद्मे हुँ (Om Mani Padme Hum)',
    pastLifeOriginNepali: 'जललोक वा देवलोकबाट अवतरित, पूर्वजन्ममा ज्ञानको साधक।',
    personalityDeepNepali: 'पारदर्शी सोच, गहिरो भावनात्मक समझ, नम्र व्यवहार र आध्यात्मिक झुकाव। सतहमा शान्त देखिए पनि भित्री मनमा चिन्तनको गहिरो नदी बगिरहेको हुन्छ।',
    tibetanRemediesNepali: [
      'सेतो ताराको पूजा र अवलोकितेश्वरको षडक्षरी मन्त्र पाठ',
      'जलस्रोत संरक्षण र शुद्ध पानीको दान',
      'सेतो र चाँदी रंगको वस्त्र वा स्फटिक माला धारण',
      'उत्तरी दिशामा ध्यान वेदी वा जलपात्र स्थापना'
    ],
    elementHarmony: {
      motherElement: 'पृथ्वी (माटोले फलाम जन्माउँछ)',
      childElement: 'जल (फलाम/धातुले जल उत्पन्न गर्छ)',
      friendElement: 'फलाम (समान धातु तत्व)',
      enemyElement: 'अग्नि (आगोले धातु पगाल्छ)'
    }
  },
  2: {
    number: 2,
    nameNepali: '२ कालो (Black 2)',
    nameTibetan: 'གཉིས་ནག (gNyis Nag)',
    element: TIBETAN_FIVE_ELEMENTS.water,
    directionNepali: 'दक्षिण-पश्चिम (South-West)',
    colorNameNepali: 'कालो / गाढा नीलो (Black)',
    hexColor: '#1E293B',
    symbolNepali: 'गहिरो जल एवं रात्रि',
    qualityNepali: 'दृढ, रहस्यमयी, रणनीतिक, धैर्यवान् एवं गम्भीर',
    karmicTendencyNepali: 'कडा परिश्रम र सङ्घर्षबाट मात्र सफलता मिल्ने पूर्वसंस्कार।',
    favorableActivities: ['भूमि, घरजग्गा एवं कृषि कार्य', 'कूटनीति, सुरक्षा तथा गुप्तचर व्यवस्थापन', 'धैर्यपूर्वक गरिने दीर्घकालीन लगानी'],
    cautions: ['नकारात्मक विचार र संशयबाट टाढा रहनुहोस्', 'जलदेवता (नाग) को सम्मान र पर्यावरण संरक्षण गर्नुहोस्'],
    turtlePartNepali: 'कूर्माकार दायाँ काँध (Right Shoulder of the Turtle)',
    protectiveDeityNepali: 'वज्रपाणि (चाना दोर्जे) एवं महाकाल',
    sacredMantra: 'ॐ वज्रपाणि हुँ फट् (Om Vajrapani Hum Phat)',
    pastLifeOriginNepali: 'असुर वा नागलोकबाट आएको संचित कर्म, तीव्र इच्छाशक्ति र सहनशीलता।',
    personalityDeepNepali: 'अत्यन्तै सहनशील, व्यावहारिक र कठिनाइमा नडगमगाउने। मनका भावनाहरू सजिलै अरूलाई नदेखाउने र रणनीतिक योजना बनाउन सिपालु।',
    tibetanRemediesNepali: [
      'नागपूजा (लु-चो) तथा जलधाराको सरसफाइ',
      'वज्रपाणि बोधिसत्त्वको साधना र क्रोध-शमन ध्यान',
      'भूमिदान वा वृक्षारोपण गरी धर्ती माताको सेवा',
      'दक्षिण-पश्चिम दिशामा भारी र स्थिर वस्तुको वास्तु व्यवस्थापन'
    ],
    elementHarmony: {
      motherElement: 'फलाम (धातुले जल सिर्जना गर्छ)',
      childElement: 'काठ (जलले वनस्पति हुर्काउँछ)',
      friendElement: 'जल (समान प्रवाह तत्व)',
      enemyElement: 'पृथ्वी (माटोले जललाई थुन्छ)'
    }
  },
  3: {
    number: 3,
    nameNepali: '३ नीलो (Blue 3)',
    nameTibetan: 'གསུམ་མཐིང (gSum mThing)',
    element: TIBETAN_FIVE_ELEMENTS.water,
    directionNepali: 'पूर्व (East)',
    colorNameNepali: 'इन्द्रेणी नीलो (Indigo Blue)',
    hexColor: '#2563EB',
    symbolNepali: 'बग्दो नदी एवं निर्मल आकाश',
    qualityNepali: 'क्रियाशील, स्पष्टवक्ता, स्वतन्त्रताप्रिय एवं साहसी',
    karmicTendencyNepali: 'प्रचुर ऊर्जा तर अस्थिर मन, निरन्तर परिवर्तनको चाहना।',
    favorableActivities: ['सञ्चार, मिडिया र प्रविधि', 'यात्रा, पर्यटन र वैदेशिक व्यापार', 'खेलकुद, साहसिक कार्य र कला'],
    cautions: ['छिटो आवेगमा आउने र रिस नियन्त्रण गर्नुहोस्', 'बोलीमा शिष्टता र धैर्य कायम राख्नुहोस्'],
    turtlePartNepali: 'कूर्माकार बायाँ हात/अग्रपाद (Left Forelimb of the Turtle)',
    protectiveDeityNepali: 'गुरु पद्मसंभव (पद्म सम्भव) एवं हरित तारा',
    sacredMantra: 'ॐ आः हुँ वज्र गुरु पद्मे सिद्धि हुँ',
    pastLifeOriginNepali: 'गन्धर्व वा यक्षलोकबाट प्राप्त संस्कार, कला, स्वर र गतिको आकर्षण।',
    personalityDeepNepali: 'तीव्र गतिशीलता, नयाँ कुरा सिक्न आतुर, स्वतन्त्र स्वभाव र विद्रोही चेतना। अन्याय सहन नसक्ने र आफ्नो विचार निर्धक्क राख्ने।',
    tibetanRemediesNepali: [
      'गुरु रिन्पोछेको वज्रगुरु मन्त्र जप र साङ्ग पूजा (धूप अर्पण)',
      'हरित तारा स्तोत्र पाठ र नीलो ध्वजा (लुङता) फहराउने',
      'बिहानीपख पूर्व दिशामा सूर्य नमस्कार र प्राणायाम',
      'आवेग नियन्त्रणका लागि मौन ध्यान अभ्यास'
    ],
    elementHarmony: {
      motherElement: 'फलाम (धातुबाट जल)',
      childElement: 'काठ (जलबाट वनस्पति वृद्धि)',
      friendElement: 'जल (समान जल प्रवाह)',
      enemyElement: 'पृथ्वी (पृथ्वीले जललाई अवरोध गर्छ)'
    }
  },
  4: {
    number: 4,
    nameNepali: '४ हरियो (Green 4)',
    nameTibetan: 'བཞི་ལྗང (bZhi lJang)',
    element: TIBETAN_FIVE_ELEMENTS.wood,
    directionNepali: 'दक्षिण-पूर्व (South-East)',
    colorNameNepali: 'पन्ना हरियो (Emerald Green)',
    hexColor: '#16A34A',
    symbolNepali: 'हरियाली, वनस्पति एवं पालुवा',
    qualityNepali: 'सिर्जनशील, दयालु, कलात्मक, सौम्य एवं सहयोगी',
    karmicTendencyNepali: 'प्रकृति र प्राणीप्रतिको करुणा, कलात्मक प्रतिभाको विकास।',
    favorableActivities: ['शिक्षा, शिक्षण, साहित्य र लेखन', 'पर्यावरण, जडीबुटी तथा वनस्पति उद्योग', 'डिजाइन, फेसन र सौन्दर्य कला'],
    cautions: ['अत्यधिक भावुकता र निर्णयमा ढिलाइ नगर्नुहोस्', 'अरूको कुरामा सजिलै विश्वास गर्दा सचेत रहनुहोस्'],
    turtlePartNepali: 'कूर्माकार बायाँ काँध (Left Shoulder of the Turtle)',
    protectiveDeityNepali: 'मञ्जुश्री (प्रज्ञापारमिता बोधिसत्त्व)',
    sacredMantra: 'ॐ अ र प च न धीः (Om A Ra Pa Tsa Na Dhih)',
    pastLifeOriginNepali: 'ऋषि वा विद्वान् परम्पराबाट प्राप्त ज्ञान संस्कार, दयालु मन।',
    personalityDeepNepali: 'दया, करुणा र सिर्जनाको खानी। अरूको दुःख देख्न नसक्ने, सौन्दर्य र प्रकृतिको प्रेमी। निर्णय लिँदा तर्कभन्दा मनको बढी सुन्ने स्वभाव।',
    tibetanRemediesNepali: [
      'मञ्जुश्रीको धीः मन्त्र जप र बौद्धिक ग्रन्थहरूको स्वाध्याय',
      'रुख रोप्ने, हरियाली प्रवर्धन र जडीबुटीको संरक्षण',
      'दक्षिण-पूर्व कोणमा हरियो र काठका प्राकृतिक सजावट',
      'हरियो लुङता (पवन अश्व) वायुमा फहराउने'
    ],
    elementHarmony: {
      motherElement: 'जल (पानीले वनस्पति हुर्काउँछ)',
      childElement: 'अग्नि (काठले आगो बाल्छ)',
      friendElement: 'काठ (समान वनस्पति तत्व)',
      enemyElement: 'फलाम (धातुको बञ्चरोले काठ काट्छ)'
    }
  },
  5: {
    number: 5,
    nameNepali: '५ पहेँलो (Yellow 5)',
    nameTibetan: 'ལྔ་སེར (lNga Ser)',
    element: TIBETAN_FIVE_ELEMENTS.earth,
    directionNepali: 'केन्द्र (Center)',
    colorNameNepali: 'केसरी पहेँलो (Golden Yellow)',
    hexColor: '#CA8A04',
    symbolNepali: 'मेरु पर्वत, धर्ती एवं स्वर्ण',
    qualityNepali: 'केन्द्रीय प्रभाव, स्थिरता, नेतृत्व, विश्वासिलो एवं संरक्षक',
    karmicTendencyNepali: 'केन्द्रबिन्दुमा रहने भाग्य, समुदायको मार्गदर्शक बन्ने सम्भावना।',
    favorableActivities: ['संगठनको नेतृत्व, राजनीति र प्रशासन', 'बैंक, वित्तीय संस्था र ठूला व्यापारिक प्रतिष्ठान', 'सामाजिक सेवा र परोपकार'],
    cautions: ['हठ र अहङ्कारबाट टाढा रहनुहोस्', 'पेट र पाचन प्रणालीको विशेष ख्याल राख्नुहोस्'],
    turtlePartNepali: 'कूर्माकार नाभि तथा छाती (Center Breastplate / Navel of the Turtle)',
    protectiveDeityNepali: 'शाक्यमुनि बुद्ध एवं पञ्चध्यानी बुद्ध (वैरोचन)',
    sacredMantra: 'ॐ मुनि मुनि महामुनये सोहा (Om Muni Muni Mahamunaye Soha)',
    pastLifeOriginNepali: 'राजा, धर्मगुरु वा कुलनायकको पूर्वजन्मीय परम्परा, नेतृत्व क्षमता।',
    personalityDeepNepali: 'धर्ती जस्तै अचल, सहनशील र भरपर्दो। सबैलाई मिलाएर लैजाने क्षमता, परिवार र समाजको खम्बा बन्ने प्रवृत्ति। हठी स्वभाव भए पनि न्यायप्रिय।',
    tibetanRemediesNepali: [
      'शाक्यमुनि बुद्धको ध्यान र पञ्चशीलको पूर्ण पालना',
      'पहेंलो वस्त्र, सुन वा पुखराज (Topaz) धारण',
      'घरको केन्द्र भाग (ब्रह्मस्थान) सधैं खुला, सफा र उज्यालो राख्ने',
      'अन्नदान र वृद्धवृद्धाहरूको आदर सेवा'
    ],
    elementHarmony: {
      motherElement: 'अग्नि (आगोको खरानीबाट माटो बन्छ)',
      childElement: 'फलाम (पृथ्वीको गर्भबाट धातु निस्कन्छ)',
      friendElement: 'पृथ्वी (समान स्थिर धर्ती तत्व)',
      enemyElement: 'काठ (रुखको जराले माटो फोर्छ)'
    }
  },
  6: {
    number: 6,
    nameNepali: '६ सेतो (White 6)',
    nameTibetan: 'དྲུག་དཀར (Drug dKar)',
    element: TIBETAN_FIVE_ELEMENTS.iron,
    directionNepali: 'उत्तर-पश्चिम (North-West)',
    colorNameNepali: 'चम्किलो सेतो (Bright White)',
    hexColor: '#475569',
    symbolNepali: 'धातुको खड्ग एवं आकाश',
    qualityNepali: 'अनुशासित, न्यायप्रिय, दृढ इच्छाशक्ति, सुव्यवस्थित',
    karmicTendencyNepali: 'न्याय र सत्यको पक्षधर, अधिकार र कर्तव्यप्रति सचेत संस्कार।',
    favorableActivities: ['न्यायपालिका, वकालत, सैन्य तथा प्रहरी सेवा', 'इन्जिनियरिङ, मेसिनरी तथा धातु उद्योग', 'प्रशासनिक व्यवस्थापन र अडिट'],
    cautions: ['कठोरता र अत्यधिक आलोचनात्मक दृष्टि त्याग्नुहोस्', 'घाँटी तथा श्वासप्रश्वासको ख्याल गर्नुहोस्'],
    turtlePartNepali: 'कूर्माकार दायाँ खुट्टा/पश्चपाद (Right Hindlimb of the Turtle)',
    protectiveDeityNepali: 'सामन्तभद्र (आदिबुद्ध) एवं कालचक्र',
    sacredMantra: 'ॐ आः हुँ (Om Ah Hum) / कालचक्र हृदय मन्त्र',
    pastLifeOriginNepali: 'न्यायाधीश, सेनापति वा व्यवस्थापकको पूर्वजन्म, कडा अनुशासन।',
    personalityDeepNepali: 'नियम र निष्ठामा अडिग। काममा पूर्णता (Perfectionism) चाहने, कुनै पनि लापरवाही मन नपराउने। सत्य बोल्न कहिल्यै नहिचकिचाउने निर्भिक स्वभाव।',
    tibetanRemediesNepali: [
      'सामन्तभद्रको सर्वकल्याणकारी पूजा र कालचक्र मन्त्र जप',
      'अनाथ तथा असहायलाई धातुका भाँडाकुँडा वा वस्त्र दान',
      'उत्तर-पश्चिम कोणमा धातुको घण्टी वा विन्ड चाइम्स राख्ने',
      'मनलाई लचिलो बनाउन क्षमाशीलताको ध्यान'
    ],
    elementHarmony: {
      motherElement: 'पृथ्वी (माटोबाट धातु बन्छ)',
      childElement: 'जल (धातुले जललाई संरक्षण गर्छ)',
      friendElement: 'फलाम (समान कठोर धातु तत्व)',
      enemyElement: 'अग्नि (आगोले धातुलाई पगाल्छ)'
    }
  },
  7: {
    number: 7,
    nameNepali: '७ रातो (Red 7)',
    nameTibetan: 'བདུན་དམར (bDun dMar)',
    element: TIBETAN_FIVE_ELEMENTS.fire,
    directionNepali: 'पश्चिम (West)',
    colorNameNepali: 'सिन्दूरी रातो (Vermilion Red)',
    hexColor: '#DC2626',
    symbolNepali: 'ज्वाला एवं अस्ताउँदो सूर्य',
    qualityNepali: 'रोमान्टिक, वाक्पटु, उत्सवप्रिय, आकर्षक व्यक्तित्व',
    karmicTendencyNepali: 'आनन्द, मनोरञ्जन र सामाजिक सम्बन्धको उच्च प्रभाव।',
    favorableActivities: ['हस्पिटालिटी, रेस्टुरेन्ट र मनोरञ्जन', 'मार्केटिङ, जनसम्पर्क र प्रस्तुतीकरण', 'गहना, फेसन र विलासिताका वस्तु'],
    cautions: ['अनावश्यक खर्च र विलासितामा नियन्त्रण राख्नुहोस्', 'रक्तचाप र मुटुको नियमित जाँच गराउनुहोस्'],
    turtlePartNepali: 'कूर्माकार दायाँ हात/अग्रपाद (Right Forelimb of the Turtle)',
    protectiveDeityNepali: 'अमितायुष (अमित बुद्ध) एवं कुरुकुल्ला',
    sacredMantra: 'ॐ अमितायुषे सोहा (Om Amitayushe Soha)',
    pastLifeOriginNepali: 'कलाकार, गायक वा राजदरबारका प्रियपात्र, वाक्चातुर्य र सौन्दर्य।',
    personalityDeepNepali: 'आकर्षणको केन्द्र, मीठो बोल्ने, मानिसहरूलाई मोहित पार्न सक्ने। जीवनलाई उत्सव झैं जिउन रुचाउने तर खर्च र भावनामा छिटो बहकिने सम्भावना।',
    tibetanRemediesNepali: [
      'अमितायुष भगवानको दीर्घायु पूजा र कुरुकुल्ला मन्त्र साधना',
      'दीपदान (बौद्ध स्तुपामा बत्ती बाल्ने) र रक्तदान',
      'पश्चिम दिशामा रातो र सुनौलो प्रकाश व्यवस्थापन',
      'वित्तीय अनुशासन र संयमित भोजन अभ्यास'
    ],
    elementHarmony: {
      motherElement: 'काठ (काठले आगो बाल्छ)',
      childElement: 'पृथ्वी (आगोको खरानीबाट माटो)',
      friendElement: 'अग्नि (समान ज्वाला तत्व)',
      enemyElement: 'जल (पानीले आगो निभाउँछ)'
    }
  },
  8: {
    number: 8,
    nameNepali: '८ सेतो (White 8)',
    nameTibetan: 'བརྒྱད་དཀར (bRgyad dKar)',
    element: TIBETAN_FIVE_ELEMENTS.iron,
    directionNepali: 'उत्तर-पूर्व (North-East)',
    colorNameNepali: 'दूधिया सेतो (Milky White)',
    hexColor: '#64748B',
    symbolNepali: 'पवित्र पर्वत एवं शिखर',
    qualityNepali: 'शान्त, परोपकारी, दृढ निश्चयी, दूरदर्शी एवं स्वाभिमानी',
    karmicTendencyNepali: 'आध्यात्मिक उन्नति, गुरुभक्ति र गहिरो सामाजिक प्रतिष्ठा।',
    favorableActivities: ['आध्यात्मिक संस्था, योग, ध्यान र आश्रम', 'शिक्षा अनुसन्धान, दर्शनशास्त्र र ग्रन्थ रचना', 'अचल सम्पत्ति र दीर्घकालीन संरचना निर्माण'],
    cautions: ['एक्लोपन र संन्यासभाव बढ्न नदिनुहोस्', 'पारिवारिक सम्बन्धमा समय दिनुहोस्'],
    turtlePartNepali: 'कूर्माकार बायाँ खुट्टा/पश्चपाद (Left Hindlimb of the Turtle)',
    protectiveDeityNepali: 'भेषज्यगुरु (चिकित्सा बुद्ध / Medicine Buddha)',
    sacredMantra: 'तद्यथा ॐ भैषज्ये भैषज्ये महाभैषज्ये राजसमुद्गते स्वाहा',
    pastLifeOriginNepali: 'हिमाली योगी, वैद्य वा मन्दिरका साधक, सेवा र तपस्याको संचित फल।',
    personalityDeepNepali: 'गम्भीर, स्वाभिमानी, आध्यात्मिक गहिराइ भएको व्यक्तित्व। सांसारिक सुखभन्दा आत्मिक शान्तिलाई बढी महत्व दिने। अरूको कल्याणमा समर्पित हुन सदैव तत्पर।',
    tibetanRemediesNepali: [
      'चिकित्सा बुद्ध (मेनल्हा) को साधना र रोगीहरूको निःशुल्क सेवा',
      'उत्तर-पूर्व (ईशान) कोणलाई अति पवित्र र मन्दिरको रूपमा राख्ने',
      'सेतो शङ्ख ध्वनि र स्फटिक जल अर्पण',
      'सन्त, गुरु र जेष्ठ नागरिकहरूको सेवा तथा आशिर्वाद ग्रहण'
    ],
    elementHarmony: {
      motherElement: 'पृथ्वी (माटोले धातु दिन्छ)',
      childElement: 'जल (धातुले जल प्रवाह गराउँछ)',
      friendElement: 'फलाम (समान धातु तत्व)',
      enemyElement: 'अग्नि (आगोले पगाल्छ)'
    }
  },
  9: {
    number: 9,
    nameNepali: '९ रातो (Red 9)',
    nameTibetan: 'དགུ་དམར (dGu dMar)',
    element: TIBETAN_FIVE_ELEMENTS.fire,
    directionNepali: 'दक्षिण (South)',
    colorNameNepali: 'प्रदीप्त रातो (Luminous Crimson)',
    hexColor: '#B91C1C',
    symbolNepali: 'मध्याह्नको सूर्य एवं अग्नि',
    qualityNepali: 'तेजस्वी, ऊर्जावान्, प्रेरणादायी, प्रसिद्धिकामी, तीव्र बुद्धि',
    karmicTendencyNepali: 'नाम, यश र कीर्ति आर्जन गर्ने प्रबल पूर्वजन्मीय संस्कार।',
    favorableActivities: ['राजनीति, उच्चस्तरीय नेतृत्व र सार्वजनिक जीवन', 'ऊर्जा, विद्युतीय सामग्री, अनुसन्धान र प्रविधि', 'मिडिया, चलचित्र र अभिनय क्षेत्र'],
    cautions: ['अधीरता, छिटो उत्तेजित हुने बानी र दम्भ नियन्त्रण गर्नुहोस्', 'आँखा र टाउकोको स्वास्थ्यमा ध्यान दिनुहोस्'],
    turtlePartNepali: 'कूर्माकार महाशिर (Head of the Cosmic Turtle)',
    protectiveDeityNepali: 'मञ्जुघोष एवं जाम्बला (धन-समृद्धि देवता)',
    sacredMantra: 'ॐ मञ्जुघोष हुँ / ॐ जाम्बला जालेन्द्राय सोहा',
    pastLifeOriginNepali: 'सूर्यवंशी वा अग्निउपासक कुल, ख्यातिप्राप्त शासक वा धर्मप्रचारक।',
    personalityDeepNepali: 'सूर्य झैं प्रखर प्रकाश र तेज। जहाँ पुगे पनि नेतृत्व लिने र मानिसहरूलाई दिशानिर्देश गर्ने स्वभाव। आत्मसम्मान उच्च हुने र महत्वाकांक्षा विशाल हुने।',
    tibetanRemediesNepali: [
      'जाम्बला जलतर्पण र मञ्जुघोष मन्त्रको नित्य पाठ',
      'घाम लाग्ने दक्षिण भागलाई प्रकाशमय राख्ने र दीप प्रज्वलन',
      'रातो लुङता (अश्व पताका) उच्च डाँडामा फहराउने',
      'क्रोध नियन्त्रण र शीतल पानीको नियमित सेवन'
    ],
    elementHarmony: {
      motherElement: 'काठ (काठले अग्निलाई प्रदीप्त गर्छ)',
      childElement: 'पृथ्वी (अग्निले माटोलाई उर्वर बनाउँछ)',
      friendElement: 'अग्नि (समान सूर्य-ज्वाला)',
      enemyElement: 'जल (जलले अग्निलाई शान्त गर्छ)'
    }
  }
};

/**
 * Calculates Natal Mewa from Tibetan effective year
 */
export function calculateNatalMewa(effectiveTibetanYear: number): TibetanMewa {
  // Anchor: 1984 CE is Mewa 7
  const diff = effectiveTibetanYear - 1984;
  const mod = (((7 - diff) % 9) + 9000) % 9;
  const mewaNum = mod === 0 ? 9 : mod;
  return TIBETAN_MEWA_LIST[mewaNum] || TIBETAN_MEWA_LIST[5];
}
