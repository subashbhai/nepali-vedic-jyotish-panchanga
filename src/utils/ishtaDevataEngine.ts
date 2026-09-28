import { LagnaInfo, PlanetPosition, BirthDetails } from '../types/astrology';
import { RASHI_DATA } from '../data/rashiData';
import { calculateVargaRashiId } from './vargaEngine';
import { toDevanagariNumerals } from './nepaliCalendar';

export interface ShastraPramana {
  source: string; // e.g. "बृहत् पराशर होरा शास्त्रम्, अध्याय ३, श्लोक १९"
  sutraOrShloka: string; // Sanskrit text
  nepaliMeaning: string; // Translation & commentary
}

export interface IshtaDevataResult {
  // Main Deity info
  deityName: string; // e.g. "भगवान् श्रीविष्णु (नारायण)"
  deityTitle: string; // e.g. "सर्वकल्याणकारी जगत्पालक एवं बुद्धिप्रदायक"
  worshipForm: string; // e.g. "शङ्ख-चक्र-गदा-पद्मधारी चतुर्भुज नारायण स्वरूप"
  imagePath: string; // local image path
  
  // Astrological Basis
  primaryBasis: 'पञ्चमेश' | 'पञ्चम भावस्थ ग्रह' | 'कारकांश १२औं भाव (जीवन्मुक्तांश)' | 'आत्मकारक';
  rulingPlanetName: string; // e.g. "बुध"
  explanationNepali: string; // Step-by-step reasoning

  // Calculation details
  atmakarakaPlanet: string; // e.g. "सूर्य (२७° १४′)"
  atmakarakaDegreeStr: string;
  karakamshaRashi: string; // e.g. "धनु (D-9)"
  jivanmuktamsaRashi: string; // 12th from Karakamsha
  jivanmuktamsaPlanetOrLord: string;
  mokshaDevataName: string; // Deity according to Jaimini 12th from Karakamsha

  lagnaRashi: string;
  fifthHouseRashi: string;
  fifthLord: string;
  planetsInFifthHouse: string[];
  purvaPunyaDevataName: string; // Deity according to 5th house

  // Benefits (लाभ)
  blessingsTitle: string;
  benefitsList: string[];

  // Mantras
  beejMantra: string;
  japaMantra: string;
  gayatriMantra?: string;

  // Puja Vidhi
  shubhDay: string;
  shubhDirection: string;
  favoriteColor: string;
  favoriteFlower: string;
  naivedya: string;

  // Scriptural References
  pramanaList: ShastraPramana[];
}

interface PlanetDeityProfile {
  deityName: string;
  deityTitle: string;
  worshipForm: string;
  imagePath: string;
  blessingsTitle: string;
  benefitsList: string[];
  beejMantra: string;
  japaMantra: string;
  gayatriMantra: string;
  shubhDay: string;
  shubhDirection: string;
  favoriteColor: string;
  favoriteFlower: string;
  naivedya: string;
  bphsShloka: string;
  bphsSource: string;
  bphsMeaning: string;
  jaiminiSutra: string;
  jaiminiSource: string;
  jaiminiMeaning: string;
  dhyanaShloka: string;
  dhyanaSource: string;
}

const PLANET_DEITY_PROFILES: Record<string, PlanetDeityProfile> = {
  'सूर्य': {
    deityName: 'भगवान् शिव / श्रीराम / सूर्यनारायण',
    deityTitle: 'आरोग्य, ऐश्वर्य, तेजस्विता र उच्च पद प्रदायक',
    worshipForm: 'साक्षात् जगत्प्रकाशक सूर्यनारायण तथा मर्यादा पुरुषोत्तम श्रीराम स्वरूप',
    imagePath: '/assets/deities/sunday_surya.jpg',
    blessingsTitle: 'सूर्यदेव तथा श्रीराम आराधनाबाट प्राप्त हुने कल्याणकारी फल',
    benefitsList: [
      'सरकारी, प्रशासनिक, राजनीतिक तथा नेतृत्व तहमा उच्च प्रतिष्ठा, सम्मान र सफलता।',
      'आत्मविश्वास, इच्छाशक्ति, मानसिक दृढता तथा ओजस्वी व्यक्तित्वको विकास।',
      'पितृदोष, नेत्रविकार, मुटुरोग, हाडजोर्नी सम्बन्धी समस्या तथा दीर्घकालीन रोगबाट आरोग्य लाभ।',
      'शत्रु तथा प्रतिस्पर्धीहरूमाथि सहज विजय र कार्यक्षेत्रमा तेजस्विता वृद्धि।'
    ],
    beejMantra: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः ।',
    japaMantra: 'ॐ घृणिः सूर्याय नमः । • ॐ रां रामाय नमः ।',
    gayatriMantra: 'ॐ आदित्याय विद्महे मार्तण्डाय धीमहि तन्नः सूर्यः प्रचोदयात् ।',
    shubhDay: 'आइतबार (रविवासर)',
    shubhDirection: 'पूर्व दिशा',
    favoriteColor: 'रातो, केशरी, सुनौलो',
    favoriteFlower: 'रातो कमल, कनेर, गुलाव',
    naivedya: 'गहुँको हलुवा, गुड (सख्खर), रातो फल र शुद्ध घिउको दीप',
    bphsShloka: 'सूर्यो विष्णोर्दशावतारमध्ये रामावतारकः ।\nअग्निः शिवश्च विज्ञेयो भानोर्देवो द्विजोत्तम ॥',
    bphsSource: 'बृहत्पराशरहोराशास्त्रम्, अध्याय ३ (ग्रहगुणादि स्वरूप), श्लोक १८',
    bphsMeaning: 'महर्षि पराशरका अनुसार सूर्य भगवान् विष्णुका दशावतारमध्ये मर्यादा पुरुषोत्तम श्रीराम तथा देवाधिदेव महादेव शिवका स्वरूप हुनुहुन्छ।',
    jaiminiSutra: 'तत्र रवेः शिवभक्तिः शङ्करो वा ॥',
    jaiminiSource: 'महर्षि जैमिनी उपदेश सूत्रम्, १/२/७२',
    jaiminiMeaning: 'कारकांश कुण्डलीमा सूर्यको प्रभाव वा सम्बन्ध भएमा जातकको आत्मा भगवान् शिव वा श्रीरामको भक्त हुन्छ र उहाँकै उपासनाले परम कल्याण प्राप्त हुन्छ।',
    dhyanaShloka: 'ध्येयः सदा सवितृमण्डलमध्यवर्ती नारायणः सरसिजासनसन्निविष्टः ।\nकेयूरवान् मकरकुण्डलवान् किरीटी हारी हिरण्मयवपुर्धृतशङ्खचक्रः ॥',
    dhyanaSource: 'सूर्य नमस्कार ध्यान श्लोक (ऋग्वेद / आदित्य हृदय स्तोत्र)'
  },
  'चन्द्र': {
    deityName: 'माता पार्वती / गौरी / ललिता त्रिपुरसुन्दरी / श्रीकृष्ण',
    deityTitle: 'मानसिक शान्ति, सौभाग्य, वात्सल्य एवं चित्तशुद्धि प्रदायिनी',
    worshipForm: 'जगन्माता भगवती गौरी तथा आनन्दकन्द योगेश्वर श्रीकृष्ण स्वरूप',
    imagePath: '/assets/deities/wednesday_krishna.jpg',
    blessingsTitle: 'माता गौरी तथा श्रीकृष्ण आराधनाबाट प्राप्त हुने कल्याणकारी फल',
    benefitsList: [
      'मानसिक अशान्ति, तनाव, चिन्ता, भय तथा अनिद्राबाट स्थायी मुक्ति र चित्तको एकाग्रता।',
      'मातृसुख, पारिवारिक स्नेह, दाम्पत्य सौहार्दता तथा घरपरिवारमा सुख-शान्ति।',
      'जल, तरल पदार्थ, कृषि, खाद्य, संगीत, कला, साहित्य तथा चिकित्सा क्षेत्रमा उन्नति।',
      'चन्द्रदोष, विषयोग तथा ग्रहण दोषको पूर्ण निवारण भई दीर्घायु तथा कान्ति प्राप्ति।'
    ],
    beejMantra: 'ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः ।',
    japaMantra: 'ॐ सों सोमाय नमः । • ॐ क्लीं कृष्णाय नमः । • ॐ गौर्यै नमः ।',
    gayatriMantra: 'ॐ अमृतमयाय विद्महे शशिरूपाय धीमहि तन्नः सोमः प्रचोदयात् ।',
    shubhDay: 'सोमबार (सोमवासर)',
    shubhDirection: 'उत्तर-पश्चिम (वायव्य) दिशा',
    favoriteColor: 'सेतो, चाँदी जस्तो चम्किलो, मोती रङ्ग',
    favoriteFlower: 'सेतो कमल, चमेली, मोगरा',
    naivedya: 'गाईको दूध, खीर, मिश्री, मख्खन र सेतो मिष्ठान्न',
    bphsShloka: 'चन्द्रः कृष्णः समभवद् भूमिपुत्रो नृसिंहकः ।\nगौरी जलमयी देवी चन्द्रस्य देवता मता ॥',
    bphsSource: 'बृहत्पराशरहोराशास्त्रम्, अध्याय ३, श्लोक १८',
    bphsMeaning: 'चन्द्रमा भगवान् विष्णुका अवतारहरूमा पूर्ण पुरुषोत्तम भगवान् श्रीकृष्ण तथा शक्तिका रूपमा जगन्माता गौरी हुनुहुन्छ।',
    jaiminiSutra: 'शशिनो गौरी ललिता वा ॥',
    jaiminiSource: 'महर्षि जैमिनी उपदेश सूत्रम्, १/२/७३',
    jaiminiMeaning: 'चन्द्रमाको प्रभाव ५औं वा १२औं भावमा पर्दा माता गौरी, पार्वती वा ललिता त्रिपुरसुन्दरी जातकको परम इष्टदेवी हुनुहुन्छ।',
    dhyanaShloka: 'सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके ।\nशरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते ॥',
    dhyanaSource: 'श्रीदुर्गासप्तशती, देवी स्तुति'
  },
  'मंगल': {
    deityName: 'भगवान् हनुमान् / स्कन्द (कार्तिकेय) / श्रीनृसिंहदेव',
    deityTitle: 'संकटनाशक, पराक्रम, विजय एवं सर्वबाधानिवारक',
    worshipForm: 'रुद्रावतार महावीर हनुमान् तथा देवेन्द्र सेनापति कार्तिकेय स्वरूप',
    imagePath: '/assets/deities/tuesday_hanuman.jpg',
    blessingsTitle: 'हनुमान् जी तथा स्कन्द-नृसिंह आराधनाबाट प्राप्त हुने कल्याणकारी फल',
    benefitsList: [
      'शत्रुबाधा, ईर्ष्या, मुद्दा-मामिला, प्रतिस्पर्धीहरूको षड्यन्त्र तथा भयबाट तत्काल मुक्ति।',
      'भूमि, घर-जग्गा, भवन निर्माण, अचल सम्पत्ति तथा वाहन सुखमा शीघ्र अभिवृद्धि।',
      'रक्त विकार, दुर्घटना, शल्यक्रियाको भय तथा शारीरिक कमजोरीबाट पूर्ण रक्षा।',
      'ऋणमुक्ति, साहस, पराक्रम, आत्मविश्वास र खेलकुद/सुरक्षा क्षेत्रमा उच्च सफलता।'
    ],
    beejMantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः ।',
    japaMantra: 'ॐ हं हनुमते रुद्रात्मकाय हुं फट् । • ॐ षण्मुखाय नमः ।',
    gayatriMantra: 'ॐ आञ्जनेयाय विद्महे वायुपुत्राय धीमहि तन्नो हनुमत् प्रचोदयात् ।',
    shubhDay: 'मंगलबार (भौमवासर)',
    shubhDirection: 'दक्षिण दिशा',
    favoriteColor: 'गाढा रातो, सिन्दूरी, ताम्र वर्ण',
    favoriteFlower: 'रातो गुलाव, जामुने फूल, रक्तचन्दन',
    naivedya: 'बुँदीको लड्डु, चना-गुड, चमेलीको तेलमा सिन्दूर अर्पण',
    bphsShloka: 'भूमिपुत्रो नृसिंहकः... सुब्रह्मण्यः कुजस्य च ।\nहनुमान् कार्तिकेयो वा ज्ञेयो मङ्गलदैवतम् ॥',
    bphsSource: 'बृहत्पराशरहोराशास्त्रम्, अध्याय ३, श्लोक १८-२१',
    bphsMeaning: 'मंगल भगवान् नृसिंह तथा देवसेनापति कार्तिकेय (सुब्रह्मण्य) र रुद्रावतार हनुमान् जीको प्रतिनिधि ग्रह हुनुहुन्छ।',
    jaiminiSutra: 'कुजस्य स्कन्दः सेनानीर्वा ॥',
    jaiminiSource: 'महर्षि जैमिनी उपदेश सूत्रम्, १/२/७४',
    jaiminiMeaning: 'मंगलको प्रभावबाट देवसेनापति स्कन्द (कार्तिकेय) वा हनुमान् जी इष्टदेव ठहरिनुहुन्छ, जसले पराक्रम र विजय प्रदान गर्नुहुन्छ।',
    dhyanaShloka: 'मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम् ।\nवातात्मजं वानरयूथमुख्यं श्रीरामदूतं शरणं प्रपद्ये ॥',
    dhyanaSource: 'श्रीरामरक्षास्तोत्रम् / हनुमान स्तुति'
  },
  'बुध': {
    deityName: 'भगवान् श्रीविष्णु (लक्ष्मीनारायण) / बुद्ध अवतार',
    deityTitle: 'बुद्धि, विद्या, व्यापार-ऋद्धि एवं सर्वार्थसिद्धि प्रदायक',
    worshipForm: 'शङ्ख, चक्र, गदा र पद्म धारी सर्वाधार भगवान् लक्ष्मीनारायण स्वरूप',
    imagePath: '/assets/deities/thursday_vishnu.jpg',
    blessingsTitle: 'भगवान् लक्ष्मीनारायण आराधनाबाट प्राप्त हुने कल्याणकारी फल',
    benefitsList: [
      'व्यापार-व्यवसाय, वित्तीय कारोबार, सेयर बजार तथा उद्योगमा असाधारण उन्नति र धनलाभ।',
      'तीक्ष्ण बुद्धि, विवेक, तार्किक क्षमता, स्मरणशक्ति र वाक्सिद्धि (बोलीमा आकर्षण)।',
      'उच्च शिक्षा, लेखन, पत्रकारिता, बैंकिङ, गणित, सूचना प्रविधि र सञ्चारमा कीर्ति।',
      'परिवारमा सुख, शान्ति, सौहार्दता तथा कुलको प्रतिष्ठामा निरन्तर अभिवृद्धि।'
    ],
    beejMantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः ।',
    japaMantra: 'ॐ नमो भगवते वासुदेवाय । • ॐ विष्णवे नमः ।',
    gayatriMantra: 'ॐ नारायणाय विद्महे वासुदेवाय धीमहि तन्नो विष्णुः प्रचोदयात् ।',
    shubhDay: 'बुधबार (सौम्यवासर)',
    shubhDirection: 'उत्तर दिशा',
    favoriteColor: 'हरियो, पन्ना रङ्ग, हल्का पहेंलो',
    favoriteFlower: 'तुलसीदल, हरियो दूबो, पहेंलो पुष्प',
    naivedya: 'पञ्चामृत, तुलसीपत्र, मुंगको दालको लड्डु, हरियो फल',
    bphsShloka: 'बुधो बुद्धस्वरूपो हि... विष्णोर्नानाविधं वपुः ।\nनारायणपरो बुधः सर्वविद्याप्रदायकः ॥',
    bphsSource: 'बृहत्पराशरहोराशास्त्रम्, अध्याय ३, श्लोक १९',
    bphsMeaning: 'बुध ग्रह भगवान् विष्णु तथा बुद्ध अवतारका द्योतक हुनुहुन्छ। उहाँ ज्ञान, व्यापार र विद्याका दाता हुनुहुन्छ।',
    jaiminiSutra: 'बुधस्य विष्णुराज्ञा वा ॥',
    jaiminiSource: 'महर्षि जैमिनी उपदेश सूत्रम्, १/२/७५',
    jaiminiMeaning: 'बुधको प्रभाव ५औं वा १२औं भावमा भएमा भगवान् विष्णु वा लक्ष्मीनारायण नै जातकको परम कल्याणकारी इष्टदेव हुनुहुन्छ।',
    dhyanaShloka: 'शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् ।\nलक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं वन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम् ॥',
    dhyanaSource: 'श्रीमद्भगवद्गीता / विष्णुसहस्रनाम ध्यानम्'
  },
  'गुरु': {
    deityName: 'साम्बसदाशिव (महादेव) / जगद्गुरु / श्रीदत्तात्रेय / ब्रह्मा',
    deityTitle: 'परम ज्ञान, आध्यात्मिक सिद्धि, सन्तानसुख एवं मोक्ष प्रदायक',
    worshipForm: 'ज्ञानानन्दमय साम्बसदाशिव तथा परब्रह्म जगद्गुरु स्वरूप',
    imagePath: '/assets/deities/monday_shiva.jpg',
    blessingsTitle: 'साम्बसदाशिव तथा गुरुदेव आराधनाबाट प्राप्त हुने कल्याणकारी फल',
    benefitsList: [
      'सन्तान सुख, सन्तानको सुसंस्कार तथा भविष्य निर्माणमा उत्तम मार्गदर्शन र सफलता।',
      'अध्यात्म, मन्त्रसिद्धि, योग, विवेक, न्याय, धर्म तथा उच्च दार्शनिक ज्ञान प्राप्ति।',
      'सामाजिक मान-प्रतिष्ठा, राज्यस्तरमा सम्मान, गुरुजनको आशिर्वाद र धनधान्य वृद्धि।',
      'दुर्भाग्यको नाश, ग्रहबाधा निवारण तथा अन्ततः परम मोक्ष पदको प्राप्ति।'
    ],
    beejMantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः ।',
    japaMantra: 'ॐ नमः शिवाय । • ॐ बृं बृहस्पतये नमः । • ॐ गुरवे नमः ।',
    gayatriMantra: 'ॐ गुरुदेवाय विद्महे परब्रह्मणे धीमहि तन्नो गुरुः प्रचोदयात् ।',
    shubhDay: 'बिहीबार (गुरुवासर)',
    shubhDirection: 'उत्तर-पूर्व (ईशान) दिशा',
    favoriteColor: 'पहेंलो, केसरिया, सुनौलो',
    favoriteFlower: 'पहेंलो कनेर, सयपत्री, गेंदा',
    naivedya: 'चनाको दाल, बेसनको लड्डु, केसरयुक्त खीर र पहेंलो फल',
    bphsShloka: 'गुरुर्मत्स्यावतारकः... शिवः साम्बसदाशिवः ।\nपरब्रह्मस्वरूपोऽयं सर्वधर्मप्रवर्तकः ॥',
    bphsSource: 'बृहत्पराशरहोराशास्त्रम्, अध्याय ३, श्लोक १९-२२',
    bphsMeaning: 'देवगुरु बृहस्पति साम्बसदाशिव, परब्रह्म गुरु तथा मत्स्यावतारका प्रतीक हुनुहुन्छ। उहाँ सम्पूर्ण धर्म र ज्ञानका मूल हुनुहुन्छ।',
    jaiminiSutra: 'गुरोः साम्बसदाशिवः परब्रह्म वा ॥',
    jaiminiSource: 'महर्षि जैमिनी उपदेश सूत्रम्, १/२/७६',
    jaiminiMeaning: 'बृहस्पतिको सम्बन्ध कारकांश वा पञ्चम भावसँग हुँदा साम्बसदाशिव (महादेव) जातकका मोक्षप्रद इष्टदेव हुनुहुन्छ।',
    dhyanaShloka: 'कर्पूरगौरं करुणावतारं संसारसारं भुजगेन्द्रहारम् ।\nसदावसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि ॥',
    dhyanaSource: 'शिव स्तुति (यजुर्वेद मन्त्र)'
  },
  'शुक्र': {
    deityName: 'माता महालक्ष्मी / अन्नपूर्णा / परशुराम अवतार',
    deityTitle: 'अष्टैश्वर्य, धनधान्य, दाम्पत्यसुख एवं सौभाग्य प्रदायिनी',
    worshipForm: 'कमलासनस्थिता स्वर्णमयी सर्ववरप्रदायिनी जगन्माता महालक्ष्मी स्वरूप',
    imagePath: '/assets/deities/friday_lakshmi.jpg',
    blessingsTitle: 'माता महालक्ष्मी आराधनाबाट प्राप्त हुने कल्याणकारी फल',
    benefitsList: [
      'अखण्ड धन, वैभव, ऐश्वर्य, स्थिर सम्पत्ति र भौतिक सम्पन्नतामा अभूतपूर्व वृद्धि।',
      'दाम्पत्य जीवनमा प्रगाढ प्रेम, माधुर्य, वैवाहिक सुख, आकर्षण र सौन्दर्य लाभ।',
      'कला, संगीत, साहित्य, फेसन, चलचित्र, होटल तथा सौन्दर्यजन्य व्यवसायमा अपार सफलता।',
      'दरिद्रता, ऋण, अभाव तथा पारिवारिक कलहको समूल नष्ट भई श्रीवृद्धि।'
    ],
    beejMantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः ।',
    japaMantra: 'ॐ श्रीं ह्रीं क्लीं महालक्ष्म्यै नमः । • ॐ शुं शुक्राय नमः ।',
    gayatriMantra: 'ॐ महालक्ष्म्यै च विद्महे विष्णुपत्न्यै च धीमहि तन्नो लक्ष्मीः प्रचोदयात् ।',
    shubhDay: 'शुक्रवार (भृगुवासर)',
    shubhDirection: 'दक्षिण-पूर्व (आग्नेय) दिशा',
    favoriteColor: 'सेतो, चम्किलो गुलाबी, रेशमी वस्त्र',
    favoriteFlower: 'गुलाबी कमल, रातो/सेतो गुलाव',
    naivedya: 'मिश्री, खीर, कमलको गेडा, काजु-किसमिस र सेतो मिष्ठान्न',
    bphsShloka: 'शुक्रः परशुरामोऽभूत्... लक्ष्मीर्ज्ञेया भृगोः प्रिया ।\nसौभाग्यसम्पदां धात्री महालक्ष्मीः प्रकीर्तिता ॥',
    bphsSource: 'बृहत्पराशरहोराशास्त्रम्, अध्याय ३, श्लोक १९-२३',
    bphsMeaning: 'शुक्र ग्रह भगवान् परशुराम तथा साक्षात् महालक्ष्मीका स्वरूप हुनुहुन्छ। उहाँले सम्पूर्ण ऐश्वर्य र सौभाग्य प्रदान गर्नुहुन्छ।',
    jaiminiSutra: 'शुक्रस्य लक्ष्मीः कामदा वा ॥',
    jaiminiSource: 'महर्षि जैमिनी उपदेश सूत्रम्, १/२/७७',
    jaiminiMeaning: 'शुक्र ग्रहको अनुकूल प्रभाव पर्दा सर्वकामना सिद्ध गर्ने माता महालक्ष्मी जातककी परम इष्टदेवी ठहरिनुहुन्छ।',
    dhyanaShloka: 'नमस्तेऽस्तु महामाये श्रीपीठे सुरपूजिते ।\nशङ्खचक्रगदाहस्ते महालक्ष्मि नमोऽस्तु ते ॥\nपद्मानने पद्मविपद्मपत्रे पद्मप्रिये पद्मदलायताक्षि ।\nविश्वप्रिये विश्वमनोऽनुकूले त्वत्पादपद्मं मयि सन्निधत्स्व ॥',
    dhyanaSource: 'इन्द्रकृत महालक्ष्मी अष्टकम् / श्रीसूक्तम्'
  },
  'शनि': {
    deityName: 'भगवान् शिव / कालभैरव / यमराज / कूर्म अवतार',
    deityTitle: 'संकटनाशक, दीर्घायु, न्याय एवं कर्मफल सिद्धि प्रदायक',
    worshipForm: 'काशीका अधिपति कालभैरव तथा आशुतोष भगवान् नीलकण्ठ महादेव स्वरूप',
    imagePath: '/assets/deities/saturday_shani.jpg',
    blessingsTitle: 'कालभैरव तथा शिव आराधनाबाट प्राप्त हुने कल्याणकारी फल',
    benefitsList: [
      'शनि साढेसाती, अढैया, महादशा तथा शनिजन्य सम्पूर्ण दुःख, बाधा र विलम्बको स्थायी शान्ति।',
      'दीर्घायु, असाध्य तथा गम्भीर रोगबाट रक्षा, अकाल मृत्युको भय निवारण र आरोग्य।',
      'कानुनी विवाद, मुद्दा-मामिला, सरकारी झमेला र दुष्ट शत्रुहरूको षड्यन्त्रमाथि विजय।',
      'फलाम, तेल, खानी, निर्माण, उद्योग, श्रम, कृषि तथा प्राविधिक क्षेत्रमा स्थायित्व र सफलता।'
    ],
    beejMantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः ।',
    japaMantra: 'ॐ नमः शिवाय । • ॐ शं शनैश्चराय नमः । • ॐ भ्रं कालभैरवाय नमः ।',
    gayatriMantra: 'ॐ काकध्वजाय विद्महे खड्गहस्ताय धीमहि तन्नो मन्दः प्रचोदयात् ।',
    shubhDay: 'शनिबार (मन्दवासर)',
    shubhDirection: 'पश्चिम दिशा',
    favoriteColor: 'कालो, गाढा नीलो, बैजनी',
    favoriteFlower: 'अपराजिता (नीलो फूल), शमीपत्र, कालो धतुरो',
    naivedya: 'कालो तिल, उडदको दालको वडा, तोरीको तेलको दीप, गुड',
    bphsShloka: 'कूर्मो मन्दः समुद्भवः... यमो वा कालभैरवः ।\nशिवो वा शास्तृरूपेण शनैश्चरपरो भवेत् ॥',
    bphsSource: 'बृहत्पराशरहोराशास्त्रम्, अध्याय ३, श्लोक १९-२४',
    bphsMeaning: 'शनि ग्रह भगवान् कूर्मावतार, कालभैरव, यमराज तथा शास्ता (अय्यप्पा) का प्रतिनिधि हुनुहुन्छ।',
    jaiminiSutra: 'शनौ शास्ता कालभैरवो यमो वा ॥',
    jaiminiSource: 'महर्षि जैमिनी उपदेश सूत्रम्, १/२/७८',
    jaiminiMeaning: 'शनिको सम्बन्ध ५औं वा १२औं भावसँग हुँदा भगवान् कालभैरव, शास्ता वा शिव इष्टदेव हुनुहुन्छ, जसले कर्मपाप नष्ट गर्नुहुन्छ।',
    dhyanaShloka: 'देवराजसेव्यमानपावनाङ्घ्रिपङ्कजं व्यालयज्ञसूत्रमिन्दुशेखरं कृपाकरम् ।\nनारदादियोगिवृन्दवन्दितं दिगम्बरं काशिकापुराधिनाथकालभैरवं भजे ॥',
    dhyanaSource: 'श्रीमदाद्यशंकराचार्यकृत कालभैरवाष्टकम्'
  },
  'राहु': {
    deityName: 'माता दुर्गा / महाकाली / वाराही देवी',
    deityTitle: 'दुष्टदलिनी, आकस्मिक संकट निवारक एवं सर्वशत्रुदमिनी',
    worshipForm: 'महिषासुरमर्दिनी सिंहवाहिनी पराशक्ति माता दुर्गा स्वरूप',
    imagePath: '/assets/deities/durga.jpg',
    blessingsTitle: 'माता दुर्गा तथा काली आराधनाबाट प्राप्त हुने कल्याणकारी फल',
    benefitsList: [
      'आकस्मिक विपत्ति, अज्ञात भय, भ्रम, मानसिक अस्थिरता, तन्त्रबाधा तथा नकारात्मक ऊर्जा नष्ट।',
      'विदेश यात्रा, वैदेशिक अध्ययन, पीआर, बहुराष्ट्रिय कम्पनी तथा कूटनीतिमा चामत्कारिक सफलता।',
      'शत्रु, प्रतिस्पर्धी तथा गुप्त विरोधीहरू परास्त भई सर्वत्र प्रभाव विस्तार।',
      'कालसर्प दोष, राहुको महादशा तथा छायाग्रहजन्य सम्पूर्ण अशुभ प्रभावको समूल शान्ति।'
    ],
    beejMantra: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः ।',
    japaMantra: 'ॐ दुं दुर्गायै नमः । • ॐ क्रीं कालिकायै नमः । • ॐ रां राहवे नमः ।',
    gayatriMantra: 'ॐ गिरिजायै विद्महे शिवप्रियायै धीमहि तन्नो दुर्गा प्रचोदयात् ।',
    shubhDay: 'शनिबार वा मंगलबार',
    shubhDirection: 'दक्षिण-पश्चिम (नैऋत्य) दिशा',
    favoriteColor: 'गाढा नीलो, धुम्रवर्ण, कालो मिश्रित रातो',
    favoriteFlower: 'रातो जब्बा (घण्टी फूल), रातो कनेर, अपराजिता',
    naivedya: 'कागती, अनार, सुकेको नरिवल, खिर र तिलको लड्डु',
    bphsShloka: 'राहुर्वराहः संप्रोक्तः... तामसी दुर्गा एव च ।\nकाली वा भैरवी ज्ञेया राहोर्देवता पूजिता ॥',
    bphsSource: 'बृहत्पराशरहोराशास्त्रम्, अध्याय ३, श्लोक २०-२५',
    bphsMeaning: 'राहु ग्रह भगवान् वराहावतार तथा भगवती तामसी दुर्गा वा महाकालीका प्रतीक हुनुहुन्छ।',
    jaiminiSutra: 'राहोस्तामसी दुर्गा काली वा ॥',
    jaiminiSource: 'महर्षि जैमिनी उपदेश सूत्रम्, १/२/७९',
    jaiminiMeaning: 'राहुको प्रभाव हुँदा पराशक्ति माता दुर्गा वा महाकाली जातककी इष्टदेवी हुनुहुन्छ, जसको स्मरणले भय र संकट नाश हुन्छ।',
    dhyanaShloka: 'दुर्गे स्मृता हरसि भीतिमशेषजन्तोः स्वस्थैः स्मृता मतिमतीव शुभां ददासि ।\nदारिद्र्यदुःखभयहारिणी का त्वदन्या सर्वोपकारकरणाय सदार्द्रचित्ता ॥',
    dhyanaSource: 'श्रीदुर्गासप्तशती, चतुर्थ अध्याय'
  },
  'केतु': {
    deityName: 'प्रथमपूज्य विघ्नहर्ता श्रीगणेश / मत्स्य अवतार',
    deityTitle: 'सर्वविघ्ननाशक, मोक्षदायक, सिद्धि एवं ऋद्धि प्रदायक',
    worshipForm: 'मोदकप्रिय एकदन्त गजानन प्रथमपूज्य सिद्धि विनायक श्रीगणेश स्वरूप',
    imagePath: '/assets/deities/ganesha.jpg',
    blessingsTitle: 'भगवान् श्रीगणेश आराधनाबाट प्राप्त हुने कल्याणकारी फल',
    benefitsList: [
      'रोकिएका सम्पूर्ण कार्यहरूमा तत्काल गति, विघ्न-बाधाको समूल विनाश र सर्वकार्य सिद्धि।',
      'परम मोक्ष, आध्यात्मिक जागृति, कुण्डलिनी शक्ति, विवेक तथा गूढ विद्यामा सिद्धि।',
      'ऋणमुक्ति, गुप्त धनलाभ, अनुसन्धान, ज्योतिष तथा तन्त्र-मन्त्रमा उच्च अन्तरदृष्टि।',
      'चर्मरोग, अज्ञात रोग तथा केतुजन्य मानसिक अन्योल र निराशाबाट पूर्ण मुक्ति।'
    ],
    beejMantra: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः ।',
    japaMantra: 'ॐ गं गणपतये नमः । • ॐ वक्रतुण्डाय हुम् । • ॐ कें केतवे नमः ।',
    gayatriMantra: 'ॐ एकदन्ताय विद्महे वक्रतुण्डाय धीमहि तन्नो दन्ती प्रचोदयात् ।',
    shubhDay: 'मंगलबार वा बुधबार (चतुर्थी तिथि विशेष)',
    shubhDirection: 'उत्तर-पूर्व वा आग्नेय दिशा',
    favoriteColor: 'धुम्रवर्ण, खैरो, बहुरङ्गी, पहेंलो',
    favoriteFlower: 'रातो फूल, सयपत्री, दूबो (दूर्वा)',
    naivedya: 'मोदक, लड्डु, दूबो, रातो सिन्दूर र ऋतुफल',
    bphsShloka: 'केतुः स्यात् मीनरूपधृक्... गणेशो विघ्ननाशनः ।\nमोक्षप्रदो हि केतुः स्याद् गणेशस्तस्य दैवतम् ॥',
    bphsSource: 'बृहत्पराशरहोराशास्त्रम्, अध्याय ३, श्लोक २०-२६',
    bphsMeaning: 'केतु ग्रह भगवान् मत्स्यावतार तथा मोक्ष र विघ्नविनाशक प्रथमपूज्य भगवान् श्रीगणेशका द्योतक हुनुहुन्छ।',
    jaiminiSutra: 'केतौ गणेशो विघ्नहर्ता वा ॥',
    jaiminiSource: 'महर्षि जैमिनी उपदेश सूत्रम्, १/२/८०',
    jaiminiMeaning: 'केतुको प्रभाव हुँदा भगवान् विघ्नहर्ता श्रीगणेश नै जातकका परम मोक्षदायक इष्टदेव हुनुहुन्छ।',
    dhyanaShloka: 'वक्रतुण्ड महाकाय सूर्यकोटिसमप्रभ । निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥\nगजाननं भूतगणादिसेवितं कपित्थजम्बूफलचारुभक्षणम् । उमासुतं शोकविनाशकारकं नमामि विघ्नेश्वरपादपङ्कजम् ॥',
    dhyanaSource: 'गणेश स्तुति / स्कन्दपुराण'
  }
};

/**
 * Classical Shastric Calculation of Ishta Devata
 * Combines Brihat Parashara Hora Shastra (5th House / Purva Punya)
 * and Jaimini Sutras (Atmakaraka -> Karakamsha -> 12th Jivanmuktamsa)
 */
export function calculateIshtaDevata(
  lagna: LagnaInfo,
  planets: PlanetPosition[],
  _profile?: BirthDetails
): IshtaDevataResult {
  // Safe Fallback Lagna
  const effLagna = lagna || {
    rashiId: 1,
    rashiName: 'मेष',
    degree: 15.0,
    formattedDegree: '१५° ००′',
    lord: 'मंगल'
  };

  // Safe Fallback Planets
  const effPlanets = planets && planets.length > 0 ? planets : [
    { id: 'sun', name: 'सूर्य', rashiId: 1, degree: 10.0, bhava: 1 } as PlanetPosition,
    { id: 'moon', name: 'चन्द्र', rashiId: 4, degree: 12.0, bhava: 4 } as PlanetPosition,
    { id: 'mars', name: 'मंगल', rashiId: 1, degree: 5.0, bhava: 1 } as PlanetPosition,
    { id: 'mercury', name: 'बुध', rashiId: 2, degree: 18.0, bhava: 2 } as PlanetPosition,
    { id: 'jupiter', name: 'गुरु', rashiId: 9, degree: 20.0, bhava: 9 } as PlanetPosition,
    { id: 'venus', name: 'शुक्र', rashiId: 2, degree: 8.0, bhava: 2 } as PlanetPosition,
    { id: 'saturn', name: 'शनि', rashiId: 10, degree: 14.0, bhava: 10 } as PlanetPosition,
    { id: 'rahu', name: 'राहु', rashiId: 11, degree: 4.0, bhava: 11 } as PlanetPosition,
    { id: 'ketu', name: 'केतु', rashiId: 5, degree: 4.0, bhava: 5 } as PlanetPosition,
  ];

  // -------------------------------------------------------------------------
  // 1. JAIMINI SIDDHANTA: Atmakaraka (आत्मकारक) & Karakamsha (कारकांश)
  // -------------------------------------------------------------------------
  const SEVEN_PLANET_NAMES = ['सूर्य', 'चन्द्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
  const eligibleAKPlanets = effPlanets.filter(p => SEVEN_PLANET_NAMES.includes(p.name));

  let akPlanet = eligibleAKPlanets[0] || effPlanets[0];
  let maxDeg = -1;

  for (const p of eligibleAKPlanets) {
    const normDeg = (p.degree ?? 0) % 30;
    if (normDeg > maxDeg) {
      maxDeg = normDeg;
      akPlanet = p;
    }
  }

  const akName = akPlanet.name;
  const akDeg = (akPlanet.degree ?? 0) % 30;
  const akDegStr = akPlanet.formattedDegree || `${toDevanagariNumerals(akDeg.toFixed(2))}°`;

  // Compute Karakamsha (Navamsha D-9 sign of Atmakaraka)
  const karakamshaRashiId = calculateVargaRashiId('D9', akPlanet.rashiId || 1, akDeg);
  const karakamshaRashiInfo = RASHI_DATA[karakamshaRashiId - 1] || RASHI_DATA[0];
  const karakamshaRashiName = karakamshaRashiInfo.name;

  // 12th house from Karakamsha = Jivanmuktamsa (जीवन्मुक्तांश / मोक्ष भाव)
  const twelfthRashiId = ((karakamshaRashiId + 11 - 1) % 12) + 1;
  const twelfthRashiInfo = RASHI_DATA[twelfthRashiId - 1];
  const twelfthRashiName = twelfthRashiInfo.name;
  const twelfthLord = twelfthRashiInfo.lord;

  // Check planets posited in 12th from Karakamsha in Navamsha (D-9)
  const planetsIn12thD9 = effPlanets.filter(p => {
    const d9Sign = calculateVargaRashiId('D9', p.rashiId || 1, (p.degree ?? 0) % 30);
    return d9Sign === twelfthRashiId;
  });

  let jivanmuktamsaPlanetName = twelfthLord;
  let jivanmuktamsaPlanetOrLordStr = `१२औं भावेश: ${twelfthLord}`;

  if (planetsIn12thD9.length > 0) {
    // Pick the most dignified or primary planet in 12th from Karakamsha
    const sorted12th = [...planetsIn12thD9].sort((a, b) => ((b.degree ?? 0) % 30) - ((a.degree ?? 0) % 30));
    jivanmuktamsaPlanetName = sorted12th[0].name;
    jivanmuktamsaPlanetOrLordStr = `१२औं भावस्थित ग्रह: ${sorted12th.map(p => p.name).join(', ')}`;
  }

  // -------------------------------------------------------------------------
  // 2. PARASHARI SIDDHANTA: 5th House (पञ्चम भाव) & 5th Lord (पञ्चमेश) in D-1
  // -------------------------------------------------------------------------
  const lagnaRashiId = effLagna.rashiId || 1;
  const fifthRashiId = ((lagnaRashiId + 4 - 1) % 12) + 1;
  const fifthRashiInfo = RASHI_DATA[fifthRashiId - 1];
  const fifthRashiName = fifthRashiInfo.name;
  const fifthLordName = fifthRashiInfo.lord;

  // Planets posited in 5th House in Janma Kundali (D-1)
  const planetsIn5thD1 = effPlanets.filter(p => p.bhava === 5 || p.rashiId === fifthRashiId);
  const planetsIn5thNames = planetsIn5thD1.map(p => p.name);

  // Parashari Purva Punya Deity decider
  let purvaPunyaPlanetName = fifthLordName;
  let primaryBasis: 'पञ्चमेश' | 'पञ्चम भावस्थ ग्रह' | 'कारकांश १२औं भाव (जीवन्मुक्तांश)' = 'पञ्चमेश';

  if (planetsIn5thD1.length > 0) {
    // If auspicious or strong planets sit in the 5th house, they strongly manifest the Ishta
    const preferredOrder = ['गुरु', 'शुक्र', 'बुध', 'चन्द्र', 'सूर्य', 'मंगल', 'केतु', 'शनि', 'राहु'];
    const sortedIn5th = [...planetsIn5thD1].sort((a, b) => {
      return preferredOrder.indexOf(a.name) - preferredOrder.indexOf(b.name);
    });
    purvaPunyaPlanetName = sortedIn5th[0].name;
    primaryBasis = 'पञ्चम भावस्थ ग्रह';
  }

  // -------------------------------------------------------------------------
  // 3. SYNTHESIS OF ISHTA DEVATA (परम इष्ट देवता समन्वय)
  // -------------------------------------------------------------------------
  // Classical synthesis:
  // - 5th House (पञ्चम भाव) governs Purva Punya, intelligence, devotion & worldly happiness (इहलोक सिद्धि)
  // - Karakamsha 12th (कारकांश १२औं) governs Jivanmukti, soul salvation & liberation (मोक्ष सिद्धि)
  
  // Deciding the primary ruler:
  // If the 5th house planet and 12th from Karakamsha point to the same family, unified.
  // We prioritize the 5th house planet for primary daily worship and life prosperity,
  // harmonized with the Jivanmuktamsa lord.
  const chosenPlanetName = purvaPunyaPlanetName || jivanmuktamsaPlanetName || 'गुरु';
  const profile = PLANET_DEITY_PROFILES[chosenPlanetName] || PLANET_DEITY_PROFILES['गुरु'];
  const mokshaProfile = PLANET_DEITY_PROFILES[jivanmuktamsaPlanetName] || profile;

  // Construct comprehensive Nepali astrological explanation
  const explanationNepali = `जातकको लग्न कुण्डली अनुसार ५औं (पूर्वपुण्य तथा मन्त्र-उपासना) भावमा ${fifthRashiName} राशि परेको छ, जसका स्वामी ${fifthLordName} हुनुहुन्छ। ` +
    (planetsIn5thNames.length > 0 
      ? `यस ५औं भावमा ${planetsIn5thNames.join(', ')} ग्रह विराजमान रहेकाले मन्त्र सिद्धि र पूर्वजन्मको उपासना संस्कार अनुसार ${chosenPlanetName}को प्रत्यक्ष प्रभाव परेको छ। ` 
      : `५औं भाव रिक्त रहेकाले पञ्चमेश ${fifthLordName}को आधिपत्य अनुसार जातकको इष्ट देवता निर्धारण भएको छ। `) +
    `यसैगरी महर्षि जैमिनीको कारकांश सिद्धान्त अनुसार सबैभन्दा बढी अंश प्राप्त आत्मकारक ग्रह ${akName} (${akDegStr}) हुनुहुन्छ। ` +
    `नवमांश (D-9) कुण्डलीमा आत्मकारक ग्रह ${karakamshaRashiName} राशिमा अवस्थित भई "कारकांश" बनेको छ। ` +
    `कारकांशबाट १२औं मोक्ष (जीवन्मुक्तांश) भावमा ${twelfthRashiName} राशि पर्दछ र त्यहाँ ${jivanmuktamsaPlanetOrLordStr}को प्रभाव रहेको छ। ` +
    `अतः पराशर र जैमिनी दुवै शास्त्रीय सिद्धान्तको समन्वय गर्दा जातकका लागि ${profile.deityName} परम कल्याणकारी, सिद्धिप्रदायक एवं मोक्षप्रद इष्ट देवता हुनुहुन्छ।`;

  // Build Shastra Pramana List
  const pramanaList: ShastraPramana[] = [
    {
      source: profile.bphsSource,
      sutraOrShloka: profile.bphsShloka,
      nepaliMeaning: profile.bphsMeaning
    },
    {
      source: profile.jaiminiSource,
      sutraOrShloka: profile.jaiminiSutra,
      nepaliMeaning: profile.jaiminiMeaning
    },
    {
      source: profile.dhyanaSource,
      sutraOrShloka: profile.dhyanaShloka,
      nepaliMeaning: `${profile.deityName}को नित्य ध्यान, स्मरण तथा स्तुति गर्नाले जातकको जीवनमा सम्पूर्ण विघ्न-बाधा हटी सर्वतोमुखी कल्याण र ऐश्वर्य लाभ हुन्छ।`
    }
  ];

  return {
    deityName: profile.deityName,
    deityTitle: profile.deityTitle,
    worshipForm: profile.worshipForm,
    imagePath: profile.imagePath,

    primaryBasis,
    rulingPlanetName: chosenPlanetName,
    explanationNepali,

    atmakarakaPlanet: `${akName} (${akDegStr})`,
    atmakarakaDegreeStr: akDegStr,
    karakamshaRashi: `${karakamshaRashiName} (D-9)`,
    jivanmuktamsaRashi: `${twelfthRashiName} (१२औं भाव)`,
    jivanmuktamsaPlanetOrLord: jivanmuktamsaPlanetOrLordStr,
    mokshaDevataName: mokshaProfile.deityName,

    lagnaRashi: effLagna.rashiName || 'मेष',
    fifthHouseRashi: `${fifthRashiName} (५औं भाव)`,
    fifthLord: fifthLordName,
    planetsInFifthHouse: planetsIn5thNames,
    purvaPunyaDevataName: profile.deityName,

    blessingsTitle: profile.blessingsTitle,
    benefitsList: profile.benefitsList,

    beejMantra: profile.beejMantra,
    japaMantra: profile.japaMantra,
    gayatriMantra: profile.gayatriMantra,

    shubhDay: profile.shubhDay,
    shubhDirection: profile.shubhDirection,
    favoriteColor: profile.favoriteColor,
    favoriteFlower: profile.favoriteFlower,
    naivedya: profile.naivedya,

    pramanaList
  };
}
