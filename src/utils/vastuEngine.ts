// Vedic Vastu Shastra Engine for Sukdev Jyotish Seva
// Complete calculations, 81-Pada Vastu Purusha Mandala, 8 Directions, Room Compatibility & Remedies

export interface VastuZone {
  id: string;
  nameNepali: string;
  nameSanskrit: string;
  code: string; // e.g., 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'CENTER'
  degrees: string;
  element: string;
  deity: string;
  rulingPlanet: string;
  favorableColor: string;
  characteristics: string;
  bestUsages: string[];
  avoidUsages: string[];
  doshaImpact: string;
  remedies: string[];
}

export interface RoomAuditOption {
  directionId: string; // 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'N' | 'CENTER'
  rating: 'excellent' | 'good' | 'average' | 'bad' | 'severe';
  points: number; // 0 to 10
  remarksNepali: string;
  remedyNepali?: string;
}

export interface RoomItemConfig {
  id: string;
  nameNepali: string;
  descriptionNepali: string;
  weight: number; // Importance multiplier
  options: Record<string, RoomAuditOption>;
}

export const VASTU_ZONES: VastuZone[] = [
  {
    id: 'NE',
    nameNepali: 'उत्तर-पूर्व (ईशान)',
    nameSanskrit: 'ईशान कोण',
    code: 'NE',
    degrees: '२२.५° - ६७.५°',
    element: 'जल',
    deity: 'शिव / ईश / शम्भु',
    rulingPlanet: 'बृहस्पति (गुरु)',
    favorableColor: 'हल्का नीलो, सेतो, पहेँलो',
    characteristics: 'ज्ञान, अध्यात्म, मानसिक शान्ति र सकारात्मक ऊर्जाको मूल स्रोत।',
    bestUsages: ['पूजा कोठा', 'ध्यान कक्ष', 'अध्ययन कक्ष', 'खुल्ला आँगन / पोखरी', 'सफा पानीको ट्याङ्की'],
    avoidUsages: ['शौचालय / बाथरुम', 'भान्सा कोठा', 'भर्याङ', 'भारी दराज / सेफ', 'फोहोर/जूठो राख्ने ठाउँ'],
    doshaImpact: 'मानसिक तनाव, वंश वृद्धिमा बाधा, आर्थिक हानि र स्वास्थ्य समस्या।',
    remedies: [
      'ईशान कोणलाई सधैँ सफा, हल्का र प्रकाशयुक्त राख्नुहोस्।',
      'ईशान कोणमा तामा वा पित्तलको पाथी/कलशमा सफा जल राखी गङ्गाजल हाल्नुहोस्।',
      'गुरू यन्त्र वा श्रीयन्त्र स्थापना गरी नित्य जल चढाउनुहोस्।',
      'यदि शौचालय वा भारी सामान छ भने तोडफोड नगरिकन पञ्चधातु र बृहस्पति यन्त्र स्थापना गर्नुहोस्।'
    ]
  },
  {
    id: 'E',
    nameNepali: 'पूर्व (इन्द्र)',
    nameSanskrit: 'इन्द्र दिशा',
    code: 'E',
    degrees: '६७.५° - ११२.५°',
    element: 'वायु',
    deity: 'इन्द्र देव',
    rulingPlanet: 'सूर्य',
    favorableColor: 'हल्का हरियो, सेतो, हल्का पहेँलो',
    characteristics: 'स्वास्थ्य, दीर्घायु, सामाजिक प्रतिष्ठा र राजकीय सफलता।',
    bestUsages: ['मुख्य प्रवेशद्वार', 'बैठक कोठा (Living room)', 'बरण्डा / बालकनी', 'अध्ययन कक्ष'],
    avoidUsages: ['शौचालय', 'भारी भण्डार', 'उँचा पर्खाल जसले घाम छेक्छ', 'भर्याङ'],
    doshaImpact: 'पितासँग मनमुटाव, सामाजिक प्रतिष्ठामा कमी, मुटु तथा आँखाको स्वास्थ्य समस्या।',
    remedies: [
      'पूर्वतर्फ ठूला झ्याल र ढोका राखी बिहानको सूर्यको किरण घरभित्र आउन दिनुहोस्।',
      'तामाको सूर्यदेवको प्रतीक वा सूर्य यन्त्र पूर्व भित्तामा राख्नुहोस्।',
      'बिहान सूर्य नमस्कार वा आदित्य हृदय स्तोत्र पाठ गर्नुहोस्।'
    ]
  },
  {
    id: 'SE',
    nameNepali: 'दक्षिण-पूर्व (आग्नेय)',
    nameSanskrit: 'आग्नेय कोण',
    code: 'SE',
    degrees: '११२.५° - १५७.५°',
    element: 'अग्नि',
    deity: 'अग्नि देव',
    rulingPlanet: 'शुक्र',
    favorableColor: 'रातो, सुन्तला, गुलाबी, हल्का पहेँलो',
    characteristics: 'ऊर्जा, उत्साह, पाचन शक्ति, धन-समृद्धि र दाम्पत्य सुख।',
    bestUsages: ['भान्सा कोठा (Kitchen)', 'बिजुलीको मिटर / इन्भर्टर / ट्रान्सफर्मर', 'ग्याँस / हिटर', 'इलेक्ट्रोनिक्स'],
    avoidUsages: ['पानीको ट्याङ्की / इनार / बोरिङ', 'शयन कक्ष (Bedroom)', 'पूजा कोठा', 'मुख्य ढोका'],
    doshaImpact: 'महिलाको स्वास्थ्यमा समस्या, भान्सामा आगलागी/दुर्घटना, वैवाहिक कलह र ऋणभार।',
    remedies: [
      'आग्नेय कोणमा भान्सा नभएमा ग्यास चुलो आग्नेय कुनामा राखी खाना बनाउँदा पूर्व फर्कनुहोस्।',
      'आग्नेय कोणमा रातो/सुन्तला रङ्गको ९ वाटको एलईडी बल्ब २४ सै घण्टा बालेर राख्नुहोस्।',
      'शुक्र यन्त्र वा गणेश जीको चित्र स्थापना गर्नुहोस्।'
    ]
  },
  {
    id: 'S',
    nameNepali: 'दक्षिण (यम)',
    nameSanskrit: 'यम दिशा',
    code: 'S',
    degrees: '१५७.५° - २०२.५°',
    element: 'पृथ्वी / अग्नि',
    deity: 'यमराज',
    rulingPlanet: 'मंगल',
    favorableColor: 'रातो, रातो-गुलाबी, माटो रङ्ग',
    characteristics: 'स्थायित्व, शक्ति, इच्छाशक्ति र साहस।',
    bestUsages: ['शयन कक्ष', 'भर्याङ (Staircase)', 'भारी भण्डार कक्ष', 'अग्लो पर्खाल'],
    avoidUsages: ['मुख्य प्रवेशद्वार (अपवाद बाहेक)', 'भूमिगत पानीको ट्याङ्की', 'पूजा कोठा', 'खुल्ला खाल्डो'],
    doshaImpact: 'अकाल भय, कानुनी झन्झट, भाइभाइमा विवाद, रक्तसम्बन्धी रोग।',
    remedies: [
      'दक्षिण दिशाको भित्ता सम्भव भएसम्म अग्लो र भारी बनाउनुहोस्।',
      'दक्षिण ढोकामा मंगल यन्त्र वा तामाको बार लगाउनुहोस्।',
      'हनुमान चालिसा पाठ र रातो रङ्गको सन्तुलित प्रयोग गर्नुहोस्।'
    ]
  },
  {
    id: 'SW',
    nameNepali: 'दक्षिण-पश्चिम (नैऋत्य)',
    nameSanskrit: 'नैऋत्य कोण',
    code: 'SW',
    degrees: '२०२.५° - २४७.५°',
    element: 'पृथ्वी',
    deity: 'निरृति (राक्षस/पित्रु)',
    rulingPlanet: 'राहु',
    favorableColor: 'गाढा पहेँलो, माटो रङ्ग, कफी',
    characteristics: 'घरको नेतृत्व, स्थायित्व, निर्णय क्षमता र पारिवारिक सम्बन्धको जग।',
    bestUsages: ['मुख्य शयन कक्ष (Master Bedroom)', 'नगद दराज / सेफ', 'मुख्य नाइके/मूलीको कोठा', 'भारी सामान'],
    avoidUsages: ['मुख्य प्रवेशद्वार', 'पूजा कोठा', 'भूमिगत पानीको इनार / ट्याङ्की', 'शौचालय', 'खुल्ला चोक'],
    doshaImpact: 'घरको मुलीको स्वास्थ्य खराब, अकाल मृत्युभय, व्यापारमा घाटा, सम्बन्धविच्छेद।',
    remedies: [
      'नैऋत्य कोणलाई घरको सबैभन्दा अग्लो र भारी भाग बनाउनुहोस्।',
      'नैऋत्यमा राहु यन्त्र वा पञ्चधातुको पिरामिड स्थापना गर्नुहोस्।',
      'पितृ तर्पण वा राहु शान्ति जप गर्नुहोस्, पहेँलो माटोको सजावट राख्नुहोस्।'
    ]
  },
  {
    id: 'W',
    nameNepali: 'पश्चिम (वरुण)',
    nameSanskrit: 'वरुण दिशा',
    code: 'W',
    degrees: '२४७.५° - २९२.५°',
    element: 'जल / आकाश',
    deity: 'वरुण देव',
    rulingPlanet: 'शनि',
    favorableColor: 'नीलो, सेतो, खरानी (Grey)',
    characteristics: 'सफलता, लाभ, विद्या, प्राप्ति र कर्मफल।',
    bestUsages: ['भोजन कक्ष (Dining room)', 'अध्ययन कक्ष', 'शौचालय', 'ओभरहेड वाटर ट्याङ्की'],
    avoidUsages: ['मुख्य प्रवेशद्वार (सामान्यतः)', 'खुल्ला विशाल खाल्डो', 'अग्नि स्थान'],
    doshaImpact: 'काममा ढिलासुस्ती, निराशा, खुट्टा वा नशाको समस्या, व्यापारमा मन्दी।',
    remedies: [
      'पश्चिम दिशामा शनि यन्त्र वा तामा/काँसको पात्र राख्नुहोस्।',
      'वरुण देवको प्रार्थना र नीलो/ग्रे रङ्गको सन्तुलित प्रयोग गर्नुहोस्।',
      'शनिबार पीपलमा जल चढाउनुहोस्।'
    ]
  },
  {
    id: 'NW',
    nameNepali: 'उत्तर-पश्चिम (वायव्य)',
    nameSanskrit: 'वायव्य कोण',
    code: 'NW',
    degrees: '२९२.५° - ३३७.५°',
    element: 'वायु',
    deity: 'वायु देव',
    rulingPlanet: 'चन्द्रमा',
    favorableColor: 'सेतो, चाँदी, हल्का खरानी',
    characteristics: 'गतिशीलता, सम्बन्ध, व्यापारिक यात्रा, अतिथी र परिवर्तन।',
    bestUsages: ['अतिथी गृह (Guest Room)', 'भण्डार कक्ष (अन्न/खाद्यान्न)', 'सवारी साधन पार्किङ', 'शौचालय'],
    avoidUsages: ['मुख्य शयन कक्ष', 'भारी ढुकुटी/दराज', 'अग्नि स्थान (ग्यास/चुलो)'],
    doshaImpact: 'मानसिक अशान्ति, छिमेकीसँग विवाद, कानुनी उल्झन र चञ्चलता।',
    remedies: [
      'वायव्य कोणमा चन्द्र यन्त्र वा सेतो सङ्गमर्मरको टुक्रा राख्नुहोस्।',
      'वायव्यमा वायु यन्त्र वा पवन घण्टी (Wind chime) झुन्ड्याउनुहोस्।',
      'सोमबार शिवजीलाई दूध/जल चढाउनुहोस्।'
    ]
  },
  {
    id: 'N',
    nameNepali: 'उत्तर (कुबेर)',
    nameSanskrit: 'कुबेर दिशा',
    code: 'N',
    degrees: '३३७.५° - २२.५°',
    element: 'जल',
    deity: 'कुबेर / बुद्ध',
    rulingPlanet: 'बुध',
    favorableColor: 'हल्का हरियो, सेतो, आकासे नीलो',
    characteristics: 'धन-सम्पत्ति, व्यापारिक सफलता, बुद्धि, अवसर र लक्ष्मीको बास।',
    bestUsages: ['मुख्य प्रवेशद्वार', 'नगद काउन्टर / ढुकुटी (उत्तर फर्कने)', 'बैठक कोठा', 'अध्ययन कक्ष'],
    avoidUsages: ['शौचालय', 'भारी भण्डार', 'भर्याङ', 'फोहोरको डम्पिङ'],
    doshaImpact: 'आर्थिक मन्दी, व्यापारमा घाटा, बुद्धि भ्रम र करियरमा अवरोध।',
    remedies: [
      'उत्तर दिशामा कुबेर यन्त्र वा लक्ष्मी-कुबेरको तस्बिर राख्नुहोस्।',
      'उत्तर भित्तामा हरियो वा सेतो रङ्ग लगाउनुहोस् र ढुकुटीको मुख उत्तरतर्फ फर्काउनुहोस्।',
      'मनी प्लान्ट वा तुलसीको बोट उत्तरतर्फ राख्नुहोस्।'
    ]
  },
  {
    id: 'CENTER',
    nameNepali: 'मध्यभाग (ब्रह्मस्थान)',
    nameSanskrit: 'ब्रह्मस्थान',
    code: 'CENTER',
    degrees: 'केन्द्र / नाभी',
    element: 'आकाश',
    deity: 'ब्रह्मा जी',
    rulingPlanet: 'सभी ग्रह (समग्र)',
    favorableColor: 'सेतो, हल्का पहेँलो, आकासे',
    characteristics: 'घरको प्राण, नाभी, मुख्य उर्जा केन्द्र र सुख-शान्तिको जग।',
    bestUsages: ['खुल्ला आँगन / चोक', 'तुुलसीको मठ', 'हल्का हल / बैठक कोठा'],
    avoidUsages: ['भारी स्तम्भ/खम्बा', 'शौचालय', 'भान्सा कोठा', 'भर्याङ', 'खाल्डो/सेप्टिक ट्याङ्की'],
    doshaImpact: 'घरका सम्पूर्ण सदस्यहरूमा रोग, भारी अशान्ति, आर्थिक विनाश र वंश हानि।',
    remedies: [
      'ब्रह्मस्थानलाई पूर्ण रूपमा खुल्ला, सफा र उज्यालो राख्नुहोस्।',
      'यदि ब्रह्मस्थानमा पिलर वा गारो छ भने ब्रह्मस्थान यन्त्र र तामाको स्वास्तिक राख्नुहोस्।',
      'नित्य गायत्री मन्त्र वा ॐ नमो भगवते वासुदेवाय जप गर्नुहोस्।'
    ]
  }
];

export const ROOM_CONFIGS: RoomItemConfig[] = [
  {
    id: 'main_entrance',
    nameNepali: '१. मुख्य प्रवेशद्वार (Main Entrance)',
    descriptionNepali: 'घरभित्र सकारात्मक उर्जा प्रवेश गर्ने मुख्य नाका।',
    weight: 2.0,
    options: {
      NE: { directionId: 'NE', rating: 'excellent', points: 10, remarksNepali: 'ईशान कोणको ढोका अति उत्तम! सुख, समृद्धि र ईश्वर कृपा मिल्छ।' },
      E: { directionId: 'E', rating: 'excellent', points: 10, remarksNepali: 'पूर्व ढोका अति शुभ! प्रतिष्ठा, आरोग्य र समृद्धि मिल्छ।' },
      N: { directionId: 'N', rating: 'excellent', points: 10, remarksNepali: 'उत्तर ढोका अति शुभ! कुबेरको दृष्टि, धनलाभ र प्रगति मिल्छ।' },
      NW: { directionId: 'NW', rating: 'good', points: 7, remarksNepali: 'वायव्य ढोका मध्यम शुभ। वैदेशिक लाभ र व्यापारका लागि राम्रो।' },
      SE: { directionId: 'SE', rating: 'average', points: 5, remarksNepali: 'आग्नेय ढोका मध्यम। अग्नि भय र वादविवाद रोक्न तामाको बार लगाउनुहोस्।', remedyNepali: 'ढोकामा पञ्चधातु स्वास्तिक र तोरण झुन्ड्याउनुहोस्।' },
      W: { directionId: 'W', rating: 'average', points: 5, remarksNepali: 'पश्चिम ढोका मध्यम। व्यापारीका लागि अनुकूल, तर सुरक्षा ध्यान दिनुहोस्।' },
      S: { directionId: 'S', rating: 'bad', points: 3, remarksNepali: 'दक्षिण ढोका दोषयुक्त। यम दिशा भएकाले सुरक्षात्मक उपाय आवश्यक।', remedyNepali: 'मुख्य ढोकाको माथि पञ्चमुखी हनुमान जीको तस्बिर र सिद्ध मंगल यन्त्र लगाउनुहोस्।' },
      SW: { directionId: 'SW', rating: 'severe', points: 0, remarksNepali: 'नैऋत्य ढोका महादोष! घरका मुलीलाई स्वास्थ्य र आर्थिक कष्ट।', remedyNepali: 'राहु/नैऋत्य दोष निवारण पिरामिड, पञ्चधातु र तामाको पट्टी ढोकाको डिलमा लगाउनुहोस्।' }
    }
  },
  {
    id: 'kitchen',
    nameNepali: '२. भान्सा कोठा (Kitchen / Cooking Place)',
    descriptionNepali: 'अग्नि स्थान - घरका सदस्यहरूको स्वास्थ्य र ऊर्जाको स्रोत।',
    weight: 1.8,
    options: {
      SE: { directionId: 'SE', rating: 'excellent', points: 10, remarksNepali: 'आग्नेय कोणको भान्सा सर्वोत्तम! अन्नपूर्णाको बास र आरोग्य मिल्छ।' },
      NW: { directionId: 'NW', rating: 'good', points: 8, remarksNepali: 'वायव्य कोणको भान्सा दोस्रो राम्रो विकल्प। पाहुना सत्कार र भण्डारका लागि शुभ।' },
      E: { directionId: 'E', rating: 'good', points: 7, remarksNepali: 'पूर्व दिशाको भान्सा सामान्य शुभ। खाना बनाउँदा पूर्व फर्कनुहोस्।' },
      S: { directionId: 'S', rating: 'average', points: 5, remarksNepali: 'दक्षिण दिशाको भान्सा मध्यम। ग्यास चुलो आग्नेय कुनामा राख्नुहोस्।' },
      W: { directionId: 'W', rating: 'average', points: 5, remarksNepali: 'पश्चिम दिशाको भान्सा सामान्य।', remedyNepali: 'भान्साको उत्तर-पूर्व कुनामा पहेँलो/रातो रङ्गको सन्तुलन मिलाउनुहोस्।' },
      NE: { directionId: 'NE', rating: 'severe', points: 0, remarksNepali: 'ईशान कोणमा भान्सा हुनु महादोष! जल र अग्निको टकरावले वंश र स्वास्थ्यमा असर।', remedyNepali: 'ईशानको चुलो हटाउनुहोस् वा चुलोमुनि पहेँलो ज्यास्पर/मार्बल स्ल्याब राख्नुहोस् र अन्नपूर्णा यन्त्र राख्नुहोस्।' },
      SW: { directionId: 'SW', rating: 'severe', points: 1, remarksNepali: 'नैऋत्यमा भान्सा हुनु दोषयुक्त। भान्साका कारण खर्च बढ्ने र कलह हुने।', remedyNepali: 'चुलोमुनि पहेँलो जैसलमेर ढुङ्गा राख्नुहोस् र आग्नेयमा रातो बल्ब बाल्नुहोस्।' }
    }
  },
  {
    id: 'master_bedroom',
    nameNepali: '३. मुख्य शयन कक्ष (Master Bedroom)',
    descriptionNepali: 'घरको मुली (Head of family) को सुत्ने कोठा।',
    weight: 1.5,
    options: {
      SW: { directionId: 'SW', rating: 'excellent', points: 10, remarksNepali: 'नैऋत्य कोणको मास्टर बेडरुम सर्वोत्तम! घरमा स्थायित्व, नेतृत्व र शान्ति रहन्छ।' },
      S: { directionId: 'S', rating: 'good', points: 8, remarksNepali: 'दक्षिण दिशाको बेडरुम शुभ। राम्रो निद्रा र शारीरिक बल प्राप्त हुन्छ।' },
      W: { directionId: 'W', rating: 'good', points: 8, remarksNepali: 'पश्चिम दिशाको बेडरुम शुभ। समृद्धि र सन्तोष मिल्छ।' },
      NW: { directionId: 'NW', rating: 'average', points: 5, remarksNepali: 'वायव्य दिशाको बेडरुम छोरी वा अतिथीका लागि राम्रो। मुलीका लागि चञ्चलता ल्याउँछ।' },
      SE: { directionId: 'SE', rating: 'bad', points: 2, remarksNepali: 'आग्नेय कोणमा सुत्दा दम्पतीमा मनमुटाव र क्रोध बढ्छ।', remedyNepali: 'खाट नैऋत्य कुनामा सार्नुहोस्, सुत्दा टाउको दक्षिण वा पूर्व गर्नुहोस्।' },
      NE: { directionId: 'NE', rating: 'bad', points: 1, remarksNepali: 'ईशानमा दम्पती सुत्नु दोषयुक्त। यो स्थान पूजा र ध्यानका लागि मात्र उपयुक्त।', remedyNepali: 'खाट ईशान कुना छाडेर दक्षिण/पश्चिम भित्तातर्फ सार्नुहोस्।' }
    }
  },
  {
    id: 'pooja_room',
    nameNepali: '४. पूजा कोठा (Puja Room / Mandir)',
    descriptionNepali: 'ईश्वरीय ऊर्जा र आध्यात्मिक केन्द्र।',
    weight: 1.8,
    options: {
      NE: { directionId: 'NE', rating: 'excellent', points: 10, remarksNepali: 'ईशान कोणको पूजा कोठा सर्वोत्तम! ईश्वरीय साक्षात् कृपा र समृद्धि मिल्छ।' },
      E: { directionId: 'E', rating: 'excellent', points: 9, remarksNepali: 'पूर्व दिशाको मन्दिर अति शुभ! पूजा गर्दा पूर्व फर्कनुहोस्।' },
      N: { directionId: 'N', rating: 'good', points: 8, remarksNepali: 'उत्तर दिशाको मन्दिर शुभ! धन र ज्ञान वृद्धि हुन्छ।' },
      CENTER: { directionId: 'CENTER', rating: 'good', points: 7, remarksNepali: 'ब्रह्मस्थान (घरको मध्यभाग) मा मन्दिर हुनु शुभ।' },
      NW: { directionId: 'NW', rating: 'average', points: 5, remarksNepali: 'वायव्य दिशामा पूजा स्थान मध्यम।' },
      SE: { directionId: 'SE', rating: 'bad', points: 2, remarksNepali: 'आग्नेयमा पूजा स्थान अनिष्टजनक।', remedyNepali: 'मन्दिरलाई ईशान वा पूर्वतर्फ स्थानान्तरण गर्नुहोस्।' },
      SW: { directionId: 'SW', rating: 'severe', points: 0, remarksNepali: 'नैऋत्यमा पूजा स्थान हुनु दोषयुक्त। पूजाको फल प्राप्त हुँदैन।', remedyNepali: 'मन्दिर ईशान वा पूर्व भित्तामा सार्नुहोस्।' }
    }
  },
  {
    id: 'toilet_bathroom',
    nameNepali: '५. शौचालय र बाथरुम (Toilet & Bathroom)',
    descriptionNepali: 'नकारात्मक र दूषित ऊर्जा विसर्जन गर्ने ठाउँ।',
    weight: 1.8,
    options: {
      NW: { directionId: 'NW', rating: 'excellent', points: 10, remarksNepali: 'वायव्य कोणको शौचालय सर्वोत्तम! दूषित ऊर्जा सजिलै बाहिरिन्छ।' },
      S: { directionId: 'S', rating: 'good', points: 7, remarksNepali: 'दक्षिण दिशामा शौचालय (दक्षिण-दक्षिण-पश्चिम) उत्तम मानिन्छ।' },
      W: { directionId: 'W', rating: 'good', points: 7, remarksNepali: 'पश्चिम दिशामा शौचालय उपयुक्त।' },
      SE: { directionId: 'SE', rating: 'average', points: 4, remarksNepali: 'आग्नेय शौचालय मध्यम दोषयुक्त।', remedyNepali: 'शौचालयभित्र हरियो/रातो क्यान्डल वा तामाको बार लगाउनुहोस्।' },
      NE: { directionId: 'NE', rating: 'severe', points: 0, remarksNepali: 'ईशानमा शौचालय हुनु अति ठूलो वास्तुदोष! गम्भीर बिरामी र आर्थिक विनाश।', remedyNepali: 'शौचालय प्रयोग बन्द गर्नुहोस् वा शौचालय कमोडको बाहिर नीलो टेप/तामाको बार र वास्तु समुद्री नुनको कचौरा राख्नुहोस्।' },
      CENTER: { directionId: 'CENTER', rating: 'severe', points: 0, remarksNepali: 'ब्रह्मस्थानमा शौचालय हुनु महादोष!', remedyNepali: 'ब्रह्मस्थानको शौचालय यथाशीघ्र हटाउनुहोस् र पिरामिड स्थापना गर्नुहोस्।' },
      SW: { directionId: 'SW', rating: 'severe', points: 1, remarksNepali: 'नैऋत्यमा शौचालय हुनु ठूलो दोष।', remedyNepali: 'पीलो/माटो रङ्गको टेप ढोकाको डिलमा लगाउनुहोस् र कचौरामा डल्ले नुन राख्नुहोस्।' }
    }
  },
  {
    id: 'underground_water',
    nameNepali: '६. खानेपानी / इनार / बोरिङ (Water Source)',
    descriptionNepali: 'भूमिगत जल स्रोत र ट्याङ्की।',
    weight: 1.5,
    options: {
      NE: { directionId: 'NE', rating: 'excellent', points: 10, remarksNepali: 'ईशान कोणमा जल स्रोत हुनु सर्वोपरि शुभ! वंश वृद्धि र अपार धन।' },
      N: { directionId: 'N', rating: 'excellent', points: 9, remarksNepali: 'उत्तर दिशामा बोरिङ/ट्याङ्की हुनु अति शुभ।' },
      E: { directionId: 'E', rating: 'good', points: 8, remarksNepali: 'पूर्व दिशामा खानेपानी हुनु शुभ।' },
      NW: { directionId: 'NW', rating: 'average', points: 5, remarksNepali: 'वायव्य दिशामा जल स्रोत मध्यम।' },
      SE: { directionId: 'SE', rating: 'severe', points: 0, remarksNepali: 'आग्नेयमा पानीको खाल्डो हुनु अग्नि र जलको शत्रुता! रोग र ऋण।', remedyNepali: 'इनार बुझाउनुहोस् वा आग्नेयमा रातो बल्ब बालेर ईशानमा जल स्रोत बनाउनुहोस्।' },
      SW: { directionId: 'SW', rating: 'severe', points: 0, remarksNepali: 'नैऋत्यमा भूमिगत खाल्डो/ट्याङ्की हुनु महादोष! असामयिक दुर्घटना र अकाल भय।', remedyNepali: 'नैऋत्यको खाल्डो पुरेई ईशान वा उत्तरमा बोरिङ खन्नुहोस्।' }
    }
  },
  {
    id: 'staircase',
    nameNepali: '७. घरको भर्याङ (Staircase)',
    descriptionNepali: 'माथिल्लो तलामा जाने भारी संरचना।',
    weight: 1.2,
    options: {
      S: { directionId: 'S', rating: 'excellent', points: 10, remarksNepali: 'दक्षिण दिशाको भर्याङ अति उत्तम। घुमाउरो घडीको दिशा (Clockwise) हुनुपर्छ।' },
      SW: { directionId: 'SW', rating: 'excellent', points: 10, remarksNepali: 'नैऋत्य कोणको भर्याङ अति उत्तम! घरलाई भारी र बलियो बनाउँछ।' },
      W: { directionId: 'W', rating: 'good', points: 8, remarksNepali: 'पश्चिम दिशाको भर्याङ शुभ।' },
      NW: { directionId: 'NW', rating: 'good', points: 7, remarksNepali: 'वायव्य दिशाको भर्याङ शुभ।' },
      NE: { directionId: 'NE', rating: 'severe', points: 0, remarksNepali: 'ईशान कोणमा भर्याङ हुनु भारी वास्तु दोष! शिरमा गरुङ्गो भार परी मानसिक रोग।', remedyNepali: 'भर्याङमुनि खुल्ला र सफा राख्नुहोस्, कुनै वस्तु नराख्नुहोस् र ईशानमा तामाको स्वास्तिक लगाउनुहोस्।' },
      CENTER: { directionId: 'CENTER', rating: 'severe', points: 0, remarksNepali: 'ब्रह्मस्थानमा भर्याङ हुनु महादोष!', remedyNepali: 'भर्याङको फेदमा पञ्चधातु र पिरामिड स्थापना गर्नुहोस्।' }
    }
  },
  {
    id: 'cash_locker',
    nameNepali: '८. ढुकुटी / नगद दराज (Cash & Jewelry Safe)',
    descriptionNepali: 'सम्पत्ति र गहना राख्ने सुरक्षित स्थान।',
    weight: 1.2,
    options: {
      SW: { directionId: 'SW', rating: 'excellent', points: 10, remarksNepali: 'दराज दक्षिण/नैऋत्य भित्तामा राखी मुख उत्तरतर्फ खुल्ने बनाउनुहोस् - कुबेरको दृष्टि पर्छ।' },
      S: { directionId: 'S', rating: 'excellent', points: 9, remarksNepali: 'दक्षिण भित्तामा दराज राखी उत्तरतर्फ फर्काउनु अति शुभ।' },
      N: { directionId: 'N', rating: 'good', points: 7, remarksNepali: 'उत्तर कोठामा दराज राखी पूर्व वा उत्तरतर्फ फर्काउनु शुभ।' },
      E: { directionId: 'E', rating: 'good', points: 7, remarksNepali: 'पूर्व भित्तामा राखी पश्चिम फर्कने दराज सामान्य।' },
      SE: { directionId: 'SE', rating: 'bad', points: 2, remarksNepali: 'आग्नेयमा दराज राख्दा अनावश्यक फजुल खर्च र मुद्दा मामिलामा धन नाश।', remedyNepali: 'दराजलाई दक्षिण भित्तामा सारेर मुख उत्तरतर्फ फर्काउनुहोस्।' }
    }
  }
];

export function calculateVastuAuditScore(selectedPlacements: Record<string, string>): {
  totalScore: number;
  maxScore: number;
  percentage: number;
  gradeNepali: string;
  gradeColor: string;
  summaryNepali: string;
  doshas: Array<{ roomName: string; rating: string; remark: string; remedy?: string }>;
  positivePoints: Array<{ roomName: string; remark: string }>;
} {
  let earned = 0;
  let possible = 0;

  const doshas: Array<{ roomName: string; rating: string; remark: string; remedy?: string }> = [];
  const positivePoints: Array<{ roomName: string; remark: string }> = [];

  ROOM_CONFIGS.forEach((cfg) => {
    const selectedDir = selectedPlacements[cfg.id] || 'NE';
    const opt = cfg.options[selectedDir] || {
      directionId: selectedDir,
      rating: 'average',
      points: 5,
      remarksNepali: 'सामान्य स्थान'
    };

    const weightedEarned = opt.points * cfg.weight;
    const weightedPossible = 10 * cfg.weight;

    earned += weightedEarned;
    possible += weightedPossible;

    if (opt.rating === 'severe' || opt.rating === 'bad') {
      doshas.push({
        roomName: cfg.nameNepali,
        rating: opt.rating === 'severe' ? 'गम्भीर दोष (Severe)' : 'मध्यम दोष (Bad)',
        remark: opt.remarksNepali,
        remedy: opt.remedyNepali
      });
    } else if (opt.rating === 'excellent' || opt.rating === 'good') {
      positivePoints.push({
        roomName: cfg.nameNepali,
        remark: opt.remarksNepali
      });
    }
  });

  const percentage = possible > 0 ? Math.round((earned / possible) * 100) : 0;

  let gradeNepali = 'उत्तम वास्तु (A+)';
  let gradeColor = 'text-emerald-700 bg-emerald-50 border-emerald-300 dark:text-emerald-300 dark:bg-emerald-950/40';
  let summaryNepali = 'तपाईंको घर/घडेरीको वास्तु स्थिति अति नै उत्तम र शास्त्रोक्त नियम अनुकूल छ। यसले सुख, समृद्धि, सुस्वास्थ्य र समृद्धि प्रदान गर्दछ।';

  if (percentage < 50) {
    gradeNepali = 'अति दोषयुक्त वास्तु (D)';
    gradeColor = 'text-red-700 bg-red-50 border-red-300 dark:text-red-300 dark:bg-red-950/40';
    summaryNepali = 'तपाईंको घरमा गम्भीर वास्तु दोषहरू देखिएका छन्। तोडफोड नगरिकन गरिने वैदिक वास्तु निवारण उपायहरू तुरुन्त अपनाउनुहोला।';
  } else if (percentage < 70) {
    gradeNepali = 'मध्यम दोषयुक्त वास्तु (C)';
    gradeColor = 'text-amber-800 bg-amber-50 border-amber-300 dark:text-amber-300 dark:bg-amber-950/40';
    summaryNepali = 'तपाईंको घरमा केही महत्त्वपूर्ण वास्तु दोषहरू छन्। सुझाएका उपायहरू लागू गर्दा नकारात्मक प्रभाव घट्नेछ।';
  } else if (percentage < 85) {
    gradeNepali = 'सामान्य शुभ वास्तु (B)';
    gradeColor = 'text-blue-800 bg-blue-50 border-blue-300 dark:text-blue-300 dark:bg-blue-950/40';
    summaryNepali = 'तपाईंको घरको वास्तु अधिकांश रूपमा अनुकूल छ। केही साना सुधारले अझ बढी शुभ फल प्राप्त हुनेछ।';
  }

  return {
    totalScore: Math.round(earned),
    maxScore: Math.round(possible),
    percentage,
    gradeNepali,
    gradeColor,
    summaryNepali,
    doshas,
    positivePoints
  };
}

export function getDirectionFromDegree(degree: number): VastuZone {
  const normDeg = ((degree % 360) + 360) % 360;

  if (normDeg >= 22.5 && normDeg < 67.5) return VASTU_ZONES.find((z) => z.id === 'NE')!;
  if (normDeg >= 67.5 && normDeg < 112.5) return VASTU_ZONES.find((z) => z.id === 'E')!;
  if (normDeg >= 112.5 && normDeg < 157.5) return VASTU_ZONES.find((z) => z.id === 'SE')!;
  if (normDeg >= 157.5 && normDeg < 202.5) return VASTU_ZONES.find((z) => z.id === 'S')!;
  if (normDeg >= 202.5 && normDeg < 247.5) return VASTU_ZONES.find((z) => z.id === 'SW')!;
  if (normDeg >= 247.5 && normDeg < 292.5) return VASTU_ZONES.find((z) => z.id === 'W')!;
  if (normDeg >= 292.5 && normDeg < 337.5) return VASTU_ZONES.find((z) => z.id === 'NW')!;
  return VASTU_ZONES.find((z) => z.id === 'N')!;
}
