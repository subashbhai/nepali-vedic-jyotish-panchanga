import {
  PlanetName,
  PanchangaData,
  BirthDetails,
  LagnaInfo,
  PlanetPosition,
  VimshottariDashaResult,
  DashaPeriod
} from '../types/astrology';
import {
  ALL_VEDIC_SUBHASHITAS,
  VedicSubhashita,
  getDailyVedicSubhashita,
  getRandomVedicSubhashita,
  filterVedicSubhashitas,
  ShlokaSourceCategory
} from '../data/vedicSubhashitas';

export interface VedicAffirmation {
  id: string;
  type: 'dasha' | 'transit' | 'daily_vaar';
  category: 'strength' | 'peace' | 'wisdom' | 'wealth' | 'courage' | 'healing' | 'spiritual';
  categoryNepali: string;
  themeTitleNepali: string;
  
  // Mantra, Shloka & Sankalpa
  sanskritMantra: string;
  mantraTransliteration?: string;
  mantraMeaningNepali: string;
  positiveAffirmationNepali: string; // The primary daily positive Sankalpa
  
  // Authentic Dasha-based Graha Jap Shloka & Mantras
  grahaJapShloka?: string;
  grahaJapShlokaMeaningNepali?: string;
  beejMantra?: string;
  gayatriMantra?: string;
  dashaRemedyNepali?: string;
  totalJapaTargetNepali?: string;

  // Astrological Context
  rulingPlanet: PlanetName;
  planetGlyph: string;
  astrologicalContextNepali: string;
  activeDashaSummaryNepali?: string;
  
  // Practice Details
  recommendedCount: number; // e.g. 11, 21, 108
  recommendedCountNepali: string;
  idealTimeOfDayNepali: string;
  recommendedDirectionNepali: string;
  elementNepali: string;
  colorTheme: {
    gradient: string;
    badgeBg: string;
    textColor: string;
    border: string;
  };
  mindfulBreathingTipNepali: string;
}

const PLANET_GLYPHS: Record<PlanetName, string> = {
  'सूर्य': '☉',
  'चन्द्र': '☽',
  'मंगल': '♂',
  'बुध': '☿',
  'गुरु': '♃',
  'शुक्र': '♀',
  'शनि': '♄',
  'राहु': '☊',
  'केतु': '☋'
};

const PLANET_AFFIRMATIONS: Record<PlanetName, {
  category: VedicAffirmation['category'];
  categoryNepali: string;
  title: string;
  mantra: string;
  mantraMeaning: string;
  grahaJapShloka: string;
  grahaJapShlokaMeaning: string;
  beejMantra: string;
  gayatriMantra: string;
  dashaRemedy: string;
  totalJapaTarget: string;
  affirmation: string;
  recommendedCount: number;
  timeOfDay: string;
  direction: string;
  element: string;
  colorTheme: VedicAffirmation['colorTheme'];
  breathingTip: string;
}> = {
  'सूर्य': {
    category: 'strength',
    categoryNepali: 'आत्मबल र आरोग्यता',
    title: 'सौर्य तेज तथा आत्मगौरव संकल्प',
    mantra: 'ॐ घृणिः सूर्याय नमः',
    mantraMeaning: 'समस्त जगतलाई प्रकाश, स्वास्थ्य र जीवन प्रदान गर्ने साक्षात् भगवान् सूर्यदेवलाई मेरो सादर नमन।',
    grahaJapShloka: 'जपाकुसुमसंकाशं काश्यपेयं महाद्युतिम्। तमोऽरिं सर्वपापघ्नं प्रणतोऽस्मि दिवाकरम्॥',
    grahaJapShlokaMeaning: 'जपापुष्प जस्तै रक्तवर्ण भएका, कश्यप ऋषिका पुत्र, असीम तेजका पुञ्ज, अन्धकारका विनाशक र समस्त पापलाई हरण गर्ने भगवान् दिवाकर (सूर्यदेव) लाई म सादर नमन गर्दछु।',
    beejMantra: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः',
    gayatriMantra: 'ॐ आदित्याय विद्महे मार्तण्डाय धीमहि तन्नः सूर्यः प्रचोदयात्॥',
    dashaRemedy: 'तामाको भाँडामा जल, रक्तचन्दन र रातो फूल मिसाएर बिहान सूर्यलाई अर्घ्य दिनुहोस्। बुवाको आदर र गायत्री मन्त्रको नित्य ध्यान गर्नुहोस्।',
    totalJapaTarget: '७,००० जप',
    affirmation: 'म भित्र असीमित आत्मबल, तेज र नेतृत्व क्षमता छ। आज म आफ्ना सम्पूर्ण दायित्वहरू पूर्ण निष्ठा, स्पष्टता र आत्मविश्वासका साथ सम्पन्न गर्दछु।',
    recommendedCount: 11,
    timeOfDay: 'प्रातःकाल (सूर्योदयको समय)',
    direction: 'पूर्व दिशा',
    element: 'अग्नि / तेज',
    colorTheme: {
      gradient: 'from-amber-600 via-orange-600 to-yellow-600',
      badgeBg: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300',
      textColor: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-400/50'
    },
    breathingTip: 'पूर्व फर्किएर छाती खोलेर गहिरो श्वास लिँदै सूर्यको सुवर्ण किरण हृदयमा समाहित भएको अनुभूति गर्नुहोस्।'
  },
  'चन्द्र': {
    category: 'peace',
    categoryNepali: 'मानसिक शान्ति र आनन्द',
    title: 'चन्द्र अमृतमय शान्ति संकल्प',
    mantra: 'ॐ सों सोमाय नमः',
    mantraMeaning: 'मनलाई शीतलता, करुणा, निर्मलता र प्रसन्नता प्रदान गर्ने चन्द्रदेवलाई मेरो नमन।',
    grahaJapShloka: 'दधिशङ्खतुषाराभं क्षीरोदार्णवसम्भवम्। नमामि शशिनं सोमं शम्भोर्मुकुटभूषणम्॥',
    grahaJapShlokaMeaning: 'दही, शङ्ख र हिउँ जस्तै उज्ज्वल कान्ति भएका, क्षीरसागरबाट प्रकट भएका, देवाधिदेव महादेवको शीरको आभूषण बनेका भगवान् सोम (चन्द्रमा) लाई म सादर प्रणाम गर्दछु।',
    beejMantra: 'ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः',
    gayatriMantra: 'ॐ क्षीरपुत्राय विद्महे अमृततत्त्वाय धीमहि तन्नो सोमः प्रचोदयात्॥',
    dashaRemedy: 'सोमबार भगवान् शिवजीको जलाभिषेक गर्नुहोस्। आमाको चरणस्पर्श गरी आशिर्वाद लिनुहोस् र राति दूध वा चिसो पेय दान गर्नुहोस्।',
    totalJapaTarget: '११,००० जप',
    affirmation: 'मेरो मन स्थिर, शान्त र निर्मल छ। म विगतका चिन्ताहरूलाई छोडेर सकारात्मक ऊर्जा, प्रेम र मानसिक सन्तुलनमा विचरण गर्दछु।',
    recommendedCount: 21,
    timeOfDay: 'बिहान वा सन्ध्याकाल',
    direction: 'उत्तर-पश्चिम (वायव्य)',
    element: 'जल',
    colorTheme: {
      gradient: 'from-sky-600 via-indigo-600 to-blue-600',
      badgeBg: 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border-sky-300',
      textColor: 'text-sky-600 dark:text-sky-400',
      border: 'border-sky-400/50'
    },
    breathingTip: 'आँखा चिम्लेर ४ सेकेन्ड श्वास भित्र तान्नुहोस् र मनमा पूर्ण चन्द्रमाको शीतल उज्यालो कल्पना गर्नुहोस्।'
  },
  'मंगल': {
    category: 'courage',
    categoryNepali: 'साहस, पराक्रम र दृढता',
    title: 'भौम शौर्य र विजय संकल्प',
    mantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
    mantraMeaning: 'ऊर्जा, साहस, पराक्रम र भूमिशक्तिका स्वामी मङ्गलदेवलाई मेरो नमन।',
    grahaJapShloka: 'धरणीगर्भसम्भूतं विद्युत्कान्तिसमप्रभम्। कुमारं शक्तिहस्तं च मङ्गलं प्रणमाम्यहम्॥',
    grahaJapShlokaMeaning: 'पृथ्वीमाताको गर्भबाट उत्पन्न, आकाशको बिजुली जस्तो प्रज्वलित कान्ति भएका, हातमा दिव्य शक्ति धारण गरेका कुमार स्वरूप मङ्गल ग्रहलाई म नमन गर्दछु।',
    beejMantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
    gayatriMantra: 'ॐ अङ्गारकाय विद्महे शक्तिहस्ताय धीमहि तन्नो भौमः प्रचोदयात्॥',
    dashaRemedy: 'मंगलबार हनुमान चालीसा वा सुन्दरकाण्ड पाठ गर्नुहोस्। रातो दाल वा सख्खर दान गर्नुहोस् र दाजुभाइसँग सद्भाव राख्नुहोस्।',
    totalJapaTarget: '१०,००० जप',
    affirmation: 'म साहसी, दृढ र ऊर्जावान् छु। म कुनै पनि डर वा संकोचलाई पन्छाएर आफ्नो लक्ष्यमा निर्भीक भई अगाडि बढ्दछु।',
    recommendedCount: 21,
    timeOfDay: 'प्रातःकाल',
    direction: 'दक्षिण दिशा / आग्नेय',
    element: 'अग्नि',
    colorTheme: {
      gradient: 'from-rose-600 via-red-600 to-orange-600',
      badgeBg: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300',
      textColor: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-400/50'
    },
    breathingTip: 'नाभि (मणिपुर चक्र) मा ध्यान केन्द्रित गरी दृढतापूर्वक श्वास बाहिर छोड्दै संकल्प दोहोर्याउनुहोस्।'
  },
  'बुध': {
    category: 'wisdom',
    categoryNepali: 'बुद्धि, वाणी र विवेक',
    title: 'बुध प्रज्ञा र स्पष्टता संकल्प',
    mantra: 'ॐ बुं बुधाय नमः',
    mantraMeaning: 'सद्बुद्धि, प्रभावकारी वाणी, विद्या र व्यापारिक चातुर्य प्रदान गर्ने बुधदेवलाई नमन।',
    grahaJapShloka: 'प्रियङ्गुगलिकाश्यामं रूपेणाप्रतिमं बुधम्। सौम्यं सौम्यगुणोपेतं तं बुधं प्रणमाम्यहम्॥',
    grahaJapShlokaMeaning: 'प्रियङ्गु फूलको कोपिला जस्तै श्यामवर्ण, अनुपम सौन्दर्यले युक्त, शान्त तथा सौम्य गुणहरूले परिपूर्ण भगवान् बुधलाई म सादर प्रणाम गर्दछु।',
    beejMantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः',
    gayatriMantra: 'ॐ सौम्यरूपाय विद्महे वाणेशाय धीमहि तन्नो सौम्यः प्रचोदयात्॥',
    dashaRemedy: 'बुधबार भगवान् गणेशजीलाई दूबो र मोदक चढाउनुहोस्। गाईलाई हरियो घाँस खुवाउनुहोस् वा अध्ययन सामग्री दान गर्नुहोस्।',
    totalJapaTarget: '९,००० जप',
    affirmation: 'मेरो वाणी प्रभावकारी र मेरो बुद्धि तीक्ष्ण छ। म नयाँ ज्ञान सजिलै ग्रहण गर्दछु र रचनात्मक कार्यहरूमा सफलता प्राप्त गर्दछु।',
    recommendedCount: 11,
    timeOfDay: 'बिहान अध्ययन वा कार्य आरम्भ पूर्व',
    direction: 'उत्तर दिशा',
    element: 'पृथ्वी / वायु',
    colorTheme: {
      gradient: 'from-emerald-600 via-teal-600 to-green-600',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-400/50'
    },
    breathingTip: 'कण्ठ (विशुद्धि चक्र) मा ध्यान दिँदै सहज श्वास लिनुहोस् र आफ्ना शब्दहरूलाई ऊर्जावान् बनाउनुहोस्।'
  },
  'गुरु': {
    category: 'spiritual',
    categoryNepali: 'ज्ञान, समृद्धि र गुरुबल',
    title: 'बृहस्पति सौभाग्य र ज्ञान संकल्प',
    mantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः',
    mantraMeaning: 'समस्त ज्ञान, धर्म, विद्या र सौभाग्यका सागर देवगुरु बृहस्पतिको चरणकमलमा मेरो प्रणाम।',
    grahaJapShloka: 'देवानां च ऋषीणां च गुरुं काञ्चनसन्निभम्। बुद्धिभूतं त्रिलोकेशं तं नमामि बृहस्पतिम्॥',
    grahaJapShlokaMeaning: 'देवता र ऋषिहरूका पूज्य गुरु, सुवर्ण जस्तै देदीप्यमान कान्ति भएका, बुद्धिका साक्षात् स्वरूप तथा तीनै लोकका मार्गदर्शक देवगुरु बृहस्पतिलाई म नमन गर्दछु।',
    beejMantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः',
    gayatriMantra: 'ॐ वृषभध्वजाय विद्महे क्रौञ्चहस्ताय धीमहि तन्नो गुरुः प्रचोदयात्॥',
    dashaRemedy: 'बिहीबार पहेँलो वस्त्र वा चनाको दाल दान गर्नुहोस्। विष्णुसहस्रनाम पाठ गर्नुहोस् र आफ्ना गुरुजनहरूको आदर गर्नुहोस्।',
    totalJapaTarget: '१९,००० जप',
    affirmation: 'म ईश्वरको कृपा र गुरुको आशिर्वादले परिपूर्ण छु। म भित्र उच्च विवेक, नैतिक बल र निरन्तर प्रगतिको ढोका खुला छ।',
    recommendedCount: 11,
    timeOfDay: 'प्रातःकाल (ब्रह्ममुहूर्त वा पूजा समय)',
    direction: 'उत्तर-पूर्व (ईशान कोण)',
    element: 'आकाश',
    colorTheme: {
      gradient: 'from-amber-500 via-yellow-600 to-amber-700',
      badgeBg: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300 border-yellow-300',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      border: 'border-yellow-400/50'
    },
    breathingTip: 'आज्ञा चक्र (निधारको बीच) मा पहेँलो स्वर्णिम प्रकाशको ध्यान गर्दै गहिरो लयबद्ध श्वास लिनुहोस्।'
  },
  'शुक्र': {
    category: 'wealth',
    categoryNepali: 'ऐश्वर्य, सौन्दर्य र प्रेम',
    title: 'शुक्र समृद्धि र सौहार्द संकल्प',
    mantra: 'ॐ शुं शुक्राय नमः',
    mantraMeaning: 'संसारमा कला, सौन्दर्य, भौतिक सुख र प्रेममय सम्बन्धका दाता शुक्रदेवलाई मेरो नमन।',
    grahaJapShloka: 'हिमकुन्दमृणालाभं दैत्यानां परमं गुरुम्। सर्वशास्त्रप्रवक्तारं भार्गवं प्रणमाम्यहम्॥',
    grahaJapShlokaMeaning: 'हिउँ, कुन्दपुष्प र कमलको डाँठ जस्तै श्वेत आभा भएका, समस्त नीति तथा शास्त्रका महान् वक्ता, भृगुपुत्र शुक्रदेवलाई म आदरपूर्वक प्रणाम गर्दछु।',
    beejMantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः',
    gayatriMantra: 'ॐ भृगुजाय विद्महे दिव्यदेहाय धीमहि तन्नः शुक्रः प्रचोदयात्॥',
    dashaRemedy: 'शुक्रबार माता महालक्ष्मीको उपासना गर्नुहोस्। सेतो मिठाई वा खीर गरिब बालबालिकालाई खुवाउनुहोस् र घरमा सरसफाइ कायम राख्नुहोस्।',
    totalJapaTarget: '१६,००० जप',
    affirmation: 'मेरो जीवन सम्पन्नता, आनन्द र कृतज्ञताले भरिपूर्ण छ। म आफ्ना सम्बन्धहरूमा माया, सद्भाव र मधुरता फैलाउँदछु।',
    recommendedCount: 21,
    timeOfDay: 'बिहान वा साँझ गोधूली बेला',
    direction: 'दक्षिण-पूर्व (आग्नेय)',
    element: 'जल',
    colorTheme: {
      gradient: 'from-pink-600 via-rose-500 to-purple-600',
      badgeBg: 'bg-pink-100 dark:bg-pink-950 text-pink-800 dark:text-pink-300 border-pink-300',
      textColor: 'text-pink-600 dark:text-pink-400',
      border: 'border-pink-400/50'
    },
    breathingTip: 'हृदय (अनाहत चक्र) मा हात राखी कृतज्ञताको भावसहित शान्त श्वास लिनुहोस्।'
  },
  'शनि': {
    category: 'healing',
    categoryNepali: 'धैर्य, स्थायित्व र कर्मयोग',
    title: 'शनैश्चर धैर्य र कर्मसिद्धि संकल्प',
    mantra: 'ॐ शं शनैश्चराय नमः',
    mantraMeaning: 'कर्मफलदाता, न्यायप्रिय र धैर्यका प्रतीक भगवान् शनैश्चरलाई मेरो प्रणाम।',
    grahaJapShloka: 'नीलाञ्जनसमाभासं रविपुत्रं यमाग्रजम्। छायामार्तण्डसम्भूतं तं नमामि शनैश्चरम्॥',
    grahaJapShlokaMeaning: 'नीलो गाजल जस्तै गहिरो कान्ति भएका, सूर्यदेवका पुत्र, धर्मराज यमका दाजु, माता छाया र सूर्यबाट उत्पन्न भगवान् शनैश्चरलाई म सादर नमन गर्दछु।',
    beejMantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः',
    gayatriMantra: 'ॐ काकध्वजाय विद्महे खड्गहस्ताय धीमहि तन्नो मन्दः प्रचोदयात्॥',
    dashaRemedy: 'शनिबार पीपलको रुखमा तोरीको तेलको दीप बाल्नुहोस्। कालो तिल, मास वा फलामका वस्तु असहाय व्यक्तिलाई दान गर्नुहोस्।',
    totalJapaTarget: '२३,००० जप',
    affirmation: 'म अनुशासित, कर्मनिष्ठ र धैर्यवान् छु। समयसँगै मेरा इमान्दार प्रयासहरूले सुदृढ र दिगो सफलता ल्याउनेछन्।',
    recommendedCount: 11,
    timeOfDay: 'साँझ सूर्यास्तपछि वा बिहान',
    direction: 'पश्चिम दिशा',
    element: 'वायु',
    colorTheme: {
      gradient: 'from-indigo-900 via-purple-900 to-slate-900',
      badgeBg: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-300',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-400/50'
    },
    breathingTip: 'मेरुदण्ड (ढाड) सीधा राखी गहिरो ध्यानावस्थामा श्वासलाई बिस्तारै नियन्त्रण गर्नुहोस्।'
  },
  'राहु': {
    category: 'wisdom',
    categoryNepali: 'भ्रम निवारण र नवप्रवर्तन',
    title: 'राहु स्पष्टता र बाधा मुक्ति संकल्प',
    mantra: 'ॐ रां राहवे नमः',
    mantraMeaning: 'असाधारण बुद्धि, वैदेशिक अवसर र तीव्र सोचका प्रेरक राहुदेवलाई नमन।',
    grahaJapShloka: 'अर्धकायं महावीर्यं चन्द्रादित्यविमर्दनम्। सिंहिकागर्भसम्भूतं तं राहुं प्रणमाम्यहम्॥',
    grahaJapShlokaMeaning: 'आधा शरीर भएका, महापराक्रमी, चन्द्रमा र सूर्यलाई पनि प्रभावमा राख्ने सामर्थ्य भएका, सिंहिकाका पुत्र भगवान् राहुलाई म प्रणाम गर्दछु।',
    beejMantra: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः',
    gayatriMantra: 'ॐ शिरोरूपाय विद्महे अमृतेशाय धीमहि तन्नो राहुः प्रचोदयात्॥',
    dashaRemedy: 'भगवान् शिवजीको पञ्चाक्षर मन्त्र (ॐ नमः शिवाय) वा महामृत्युञ्जय मन्त्र जप गर्नुहोस्। कुकुर वा चराहरूलाई आहार दिनुहोस्।',
    totalJapaTarget: '१८,००० जप',
    affirmation: 'मेरो दृष्टि स्पष्ट छ र म सबै प्रकारका अनावश्यक भ्रमहरूबाट मुक्त छु। म आफ्नो क्षमतालाई सही दिशामा प्रयोग गर्दछु।',
    recommendedCount: 11,
    timeOfDay: 'साँझ वा रात्रिकाल',
    direction: 'दक्षिण-पश्चिम (नैऋत्य)',
    element: 'वायु',
    colorTheme: {
      gradient: 'from-violet-800 via-purple-900 to-stone-900',
      badgeBg: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300',
      textColor: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-400/50'
    },
    breathingTip: 'मनलाई एकाग्र गर्दै शिवजीको नीलकण्ठ स्वरूपको स्मरण गरी शान्त श्वास लिनुहोस्।'
  },
  'केतु': {
    category: 'spiritual',
    categoryNepali: 'आत्मज्ञान र मोक्ष चेतना',
    title: 'केतु आध्यात्मिक जागृति संकल्प',
    mantra: 'ॐ कें केतवे नमः',
    mantraMeaning: 'आध्यात्मिक चेतना, मोक्ष, वैराग्य र अन्तर्दृष्टिका स्वामी केतुदेवलाई नमन।',
    grahaJapShloka: 'पलाशपुष्पसंकाशं तारकाग्रहमस्तकम्। रौद्रं रौद्रात्मकं घोरं तं केतुं प्रणमाम्यहम्॥',
    grahaJapShlokaMeaning: 'पलाशका फूल जस्तै धूम्रवर्ण भएका, समस्त तारा र ग्रहहरूका शिरोभाग स्वरूप, प्रचण्ड तथा आध्यात्मिक शक्तिका भण्डार केतुदेवलाई म प्रणाम गर्दछु।',
    beejMantra: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः',
    gayatriMantra: 'ॐ गदाहस्ताय विद्महे अमृतेशाय धीमहि तन्नः केतुः प्रचोदयात्॥',
    dashaRemedy: 'भगवान् गणेशजीको अथर्वशीर्ष पाठ गर्नुहोस् वा संकट नाशन स्तोत्र पढ्नुहोस्। कम्बल वा कालो-सेतो वस्त्र दीनदुःखीलाई दान गर्नुहोस्।',
    totalJapaTarget: '१७,००० जप',
    affirmation: 'मेरो आत्मा शुद्ध छ र म सांसारिक तनावहरूबाट माथि उठेर आन्तरिक शान्ति र आत्मज्ञान अनुभव गर्दछु।',
    recommendedCount: 11,
    timeOfDay: 'ब्रह्ममुहूर्त वा ध्यानको समय',
    direction: 'उत्तर-पूर्व (ईशान)',
    element: 'अग्नि / सूक्ष्म',
    colorTheme: {
      gradient: 'from-stone-700 via-amber-800 to-stone-900',
      badgeBg: 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-300 border-stone-300',
      textColor: 'text-amber-600 dark:text-amber-400',
      border: 'border-stone-400/50'
    },
    breathingTip: 'सहस्रार चक्र (तालु) मा ध्यान राखी मनका सबै विचारहरूलाई साक्षी भावले हेर्नुहोस्।'
  }
};

/**
 * Generates the primary Daily Vedic Affirmation & Sankalpa for the user
 * by evaluating:
 * 1. Active Vimshottari Mahadasha & Antardasha
 * 2. Today's Vaar Lord (Panchanga)
 * 3. Specific planetary transit conditions
 */
export function getDailyVedicAffirmation(
  dasha?: VimshottariDashaResult,
  panchanga?: PanchangaData,
  activeProfile?: BirthDetails | null,
  planets?: PlanetPosition[]
): VedicAffirmation {
  const userName = activeProfile?.name || 'जातक';
  
  // 1. Identify active Mahadasha planet
  let activeDashaLord: PlanetName = 'गुरु';
  let activeAntardashaLord: PlanetName = 'शनि';
  let activeDashaText = '';

  if (dasha) {
    if (dasha.currentMahadasha) {
      activeDashaLord = dasha.currentMahadasha.planet;
      activeDashaText = `${dasha.currentMahadasha.planet} महादशा`;
    } else if (dasha.mahadashas && dasha.mahadashas.length > 0) {
      const curr = dasha.mahadashas.find((d) => d.isCurrent) || dasha.mahadashas[0];
      activeDashaLord = curr.planet;
      activeDashaText = `${curr.planet} महादशा`;
    }

    if (dasha.currentAntardasha) {
      activeAntardashaLord = dasha.currentAntardasha.planet;
      activeDashaText += ` - ${dasha.currentAntardasha.planet} अन्तरदशा`;
    }
  }

  // Determine focus planet: Default to Mahadasha lord if available, otherwise today's Vaar lord
  let focusPlanet: PlanetName = activeDashaLord;
  let contextNepali = '';

  if (dasha && activeDashaText) {
    contextNepali = `तपाईंको कुण्डलीमा हाल चलिरहेको ${activeDashaText} को शुभ ऊर्जालाई सक्रिय र प्रतिकूलतालाई शान्त बनाउन आजको यो वैदिक मन्त्र, ग्रह जप श्लोक तथा सङ्कल्प विशेष फलदायी छ।`;
  } else if (panchanga?.vaar?.lord) {
    // Map Vaar lord
    const vaarLordMap: Record<string, PlanetName> = {
      'सूर्य': 'सूर्य',
      'चन्द्र': 'चन्द्र',
      'मंगल': 'मंगल',
      'बुध': 'बुध',
      'गुरु': 'गुरु',
      'शुक्र': 'शुक्र',
      'शनि': 'शनि'
    };
    focusPlanet = vaarLordMap[panchanga.vaar.lord] || 'सूर्य';
    contextNepali = `आजको ${panchanga.dayNameNepali} (${panchanga.vaar.lord} वार) को सौर्य प्रभाव र ग्रह ऊर्जालाई आत्मसात् गर्न आजको यो सङ्कल्प जप गर्नुहोस्।`;
  }

  const planetData = PLANET_AFFIRMATIONS[focusPlanet] || PLANET_AFFIRMATIONS['सूर्य'];

  return {
    id: `affirmation_${focusPlanet}_${Date.now()}`,
    type: 'dasha',
    category: planetData.category,
    categoryNepali: planetData.categoryNepali,
    themeTitleNepali: planetData.title,
    sanskritMantra: planetData.mantra,
    mantraMeaningNepali: planetData.mantraMeaning,
    positiveAffirmationNepali: planetData.affirmation,
    grahaJapShloka: planetData.grahaJapShloka,
    grahaJapShlokaMeaningNepali: planetData.grahaJapShlokaMeaning,
    beejMantra: planetData.beejMantra,
    gayatriMantra: planetData.gayatriMantra,
    dashaRemedyNepali: planetData.dashaRemedy,
    totalJapaTargetNepali: planetData.totalJapaTarget,
    rulingPlanet: focusPlanet,
    planetGlyph: PLANET_GLYPHS[focusPlanet] || '★',
    astrologicalContextNepali: contextNepali,
    activeDashaSummaryNepali: activeDashaText || `${focusPlanet} अनुकूलन`,
    recommendedCount: planetData.recommendedCount,
    recommendedCountNepali: `${planetData.recommendedCount} पटक`,
    idealTimeOfDayNepali: planetData.timeOfDay,
    recommendedDirectionNepali: planetData.direction,
    elementNepali: planetData.element,
    colorTheme: planetData.colorTheme,
    mindfulBreathingTipNepali: planetData.breathingTip
  };
}

/**
 * Play a peaceful meditative bowl chime sound via the browser Web Audio API
 */
export function playMeditativeBell(frequency: number = 528): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Sacred Solfeggio 528Hz or 432Hz tone
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Harmonic overtone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(frequency * 2.01, ctx.currentTime);

    // Envelope
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

    gain2.gain.setValueAtTime(0.001, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc2.start(ctx.currentTime);

    osc.stop(ctx.currentTime + 1.9);
    osc2.stop(ctx.currentTime + 1.3);
  } catch (err) {
    console.warn('Web Audio playback error:', err);
  }
}

/**
 * Uplifting Vedic Shloka and Daily Affirmation System
 * Backwards-compatible interface alias for VedicSubhashita
 */
export type VedicShlokaQuote = VedicSubhashita;

/**
 * Full collection of 160+ authentic Vedic Subhashitas from Gita, Upanishads, Puranas, Vedas, and Niti
 */
export const UPLIFTING_VEDIC_SHLOKAS: VedicShlokaQuote[] = ALL_VEDIC_SUBHASHITAS;

/**
 * Returns deterministic daily shloka rotating through all 160+ shlokas without repeating
 */
export const getDailyVedicShloka = getDailyVedicSubhashita;

/**
 * Returns random Vedic shloka
 */
export const getRandomVedicShloka = getRandomVedicSubhashita;

/**
 * Returns filtered list by source category or search keyword
 */
export const filterVedicShlokas = filterVedicSubhashitas;
