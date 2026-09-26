export interface KnowledgeArticle {
  id: string;
  titleNepali: string;
  titleEnglish: string;
  category: 'article' | 'graha' | 'yoga' | 'term' | 'rashi_nakshatra';
  categoryLabel: string;
  readTime: string;
  tags: string[];
  summary: string;
  shloka?: string;
  content: {
    sectionTitle: string;
    paragraphs: string[];
    bulletPoints?: string[];
    keyTakeaway?: string;
  }[];
  relatedIds?: string[];
  isFeatured?: boolean;
}

export interface AstrologicalTerm {
  id: string;
  termNepali: string;
  termSanskrit: string;
  termEnglish: string;
  category: 'calculation' | 'house_system' | 'planetary_state' | 'astronomy' | 'prediction';
  categoryLabel: string;
  shortDefinition: string;
  detailedExplanation: string;
  classicalReference?: string;
  practicalApplication: string;
}

export interface PlanetaryInfluence {
  id: string;
  nameNepali: string;
  nameSanskrit: string;
  nameEnglish: string;
  gender: string;
  nature: string;
  karakatva: string[]; // कारकत्व
  exaltation: { rashi: string; degree: string }; // उच्च
  debilitation: { rashi: string; degree: string }; // नीच
  ownRashis: string[];
  moolatrikona: string;
  friendlyPlanets: string[];
  enemyPlanets: string[];
  neutralPlanets: string[];
  gemstone: string;
  metal: string;
  rulingDeity: string;
  beejaMantra: string;
  positiveTraits: string[];
  negativeTraits: string[];
  afflictedRemedies: string[];
  healthCorrelations: string[];
  careerFields: string[];
}

export interface AstrologicalYoga {
  id: string;
  nameNepali: string;
  nameSanskrit: string;
  type: 'raja_yoga' | 'dhana_yoga' | 'mahapurusha' | 'dosha' | 'arishta' | 'auspicious';
  typeLabel: string;
  formationCriteria: string;
  classicalResult: string;
  practicalLifeImpact: string;
  shloka?: string;
  cancellationOrRemedy?: string;
  frequency: 'सामान्य' | 'दुर्लभ' | 'अति दुर्लभ';
}

export const KNOWLEDGE_CATEGORIES = [
  { id: 'all', label: 'सबै ज्ञान सामग्री' },
  { id: 'articles', label: 'वैदिक लेख तथा अनुसन्धान' },
  { id: 'grahas', label: '९ ग्रहहरूको विस्तृत प्रभाव' },
  { id: 'yogas', label: 'प्रमुख योग तथा दोषहरू' },
  { id: 'terms', label: 'पारिभाषिक शब्दावली' },
  { id: 'rashis', label: '१२ राशि तथा २७ नक्षत्र' },
];

export const CURATED_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'kundali_basics_guide',
    titleNepali: 'जन्मकुण्डली कसरी हेर्ने? द्वादश भाव र फलादेशको आधारभूत रहस्य',
    titleEnglish: 'How to Read a Janma Kundali - 12 Houses Guide',
    category: 'article',
    categoryLabel: 'कुण्डली आधारभूत',
    readTime: '६ मिनेट',
    tags: ['कुण्डली', 'द्वादश भाव', 'फलादेश', 'लग्न'],
    summary: '१२ वटा कोठा (भाव) ले मानव जीवनका सम्पूर्ण आयामहरू—शरीर, धन, पराक्रम, सुख, सन्तान, रोग, जीवनसाथी, आयु, भाग्य, कर्म, लाभ र व्यय कसरी प्रतिनिधित्व गर्छन्?',
    shloka: 'तनुर्धनं भ्रातृबन्धुपुत्रशत्रुकलत्रकाः। आयुष्यं च तथा धर्मः कर्मायो व्यय एव च॥',
    isFeatured: true,
    content: [
      {
        sectionTitle: '१. कुण्डलीको केन्द्र र त्रिकोणको महत्व',
        paragraphs: [
          'जन्मकुण्डलीमा १, ४, ७ र १० भावलाई "केन्द्र भाव" भनिन्छ। केन्द्र भावलाई भगवान् विष्णुको स्थान मानिन्छ, जसले जीवनलाई स्थिरता, सुरक्षा र दृढता प्रदान गर्दछ।',
          'त्यस्तै १, ५ र ९ भावलाई "त्रिकोण भाव" भनिन्छ। त्रिकोणलाई माता लक्ष्मीको स्थान मानिन्छ, जसले जीवनमा पुण्य, विद्या, भाग्य र दैवी कृपा प्रदान गर्दछ।'
        ],
        bulletPoints: [
          'केन्द्रेश र त्रिकोणेशको सम्बन्ध वा दृष्टि भएमा उच्चकोटीको राजयोग निर्माण हुन्छ।',
          '६, ८ र १२ भावलाई त्रिक (दुःस्थान) मानिन्छ, जसबाट रोग, संकट र व्ययको विश्लेषण गरिन्छ।',
          '३, ६, १० र ११ भावलाई उपचय भाव भनिन्छ, जहाँ पाप ग्रहहरूले समयसँगै सफलता दिन्छन्।'
        ],
        keyTakeaway: 'कुण्डली हेर्दा सबैभन्दा पहिले लग्नेश र भाग्येशको स्थिति तथा केन्द्र-त्रिकोणको शुभता जाँच गर्नुपर्छ।'
      },
      {
        sectionTitle: '२. ग्रह बल तथा भावेश विश्लेषण',
        paragraphs: [
          'कुनै पनि भावको पूर्ण फल जान्नका लागि तीन तत्व अनिवार्य छन्: भाव (House), भावेश (Lord of House) र भावको कारक ग्रह (Karaka)।',
          'यदि भावमा शुभ ग्रहको दृष्टि छ र भावेश बलवान् भएमा उक्त भावको फल पूर्ण रूपमा प्राप्त हुन्छ।'
        ]
      }
    ],
    relatedIds: ['graha_surya', 'yoga_gajakesari', 'term_lagna']
  },
  {
    id: 'sade_sati_truth_remedies',
    titleNepali: 'शनिको साढेसाती: भ्रम, सत्य, शास्त्रीय प्रभाव र अचुक शान्ति उपाय',
    titleEnglish: 'Sade Sati: Truth, Classical Effects & Vedic Remedies',
    category: 'article',
    categoryLabel: 'ग्रह गोचर लेख',
    readTime: '८ मिनेट',
    tags: ['शनि', 'साढेसाती', 'गोचर', 'उपाय', 'शान्ति'],
    summary: 'चन्द्र राशिभन्दा १२ औँ, पहिलो र दोस्रो भावमा शनिको गोचर हुँदा हुने ७.५ वर्षको चक्र के हो? साढेसाती सधैँ कष्टकर मात्र हुन्छ कि वरदान पनि?',
    shloka: 'द्वादशे जन्मगे राशौ द्वितीये च शनैश्चरः। सार्धानि सप्तवर्षाणि साढेसाती प्रकीर्तिता॥',
    isFeatured: true,
    content: [
      {
        sectionTitle: '१. साढेसातीको तीन चरण (Three Phases)',
        paragraphs: [
          'प्रथम चरण (१२ औँ भाव): मानसिक चिन्ता, आर्थिक खर्च, अनिद्रा र स्थान परिवर्तनको सम्भावना।',
          'द्वितीय चरण (जन्म राशि): शारीरिक कष्ट, आत्ममन्थन, काममा ढिलाइ र कार्यभारमा वृद्धि।',
          'तृतीय चरण (दोस्रो भाव): पारिवारिक दायित्व, वाणीमा नियन्त्रण र आर्थिक स्थिरताको पुनः प्राप्ति।'
        ],
        bulletPoints: [
          'वृष, तुला, मकर र कुम्भ राशिका लागि शनि योगकारक हुने भएकाले साढेसातीमा पनि उन्नति हुन्छ।',
          'शनिले मानिसलाई अनुशासन, सत्य र कडा परिश्रम सिकाउँछ।',
          'विपत्तिमा परेकालाई सहयोग गर्ने, असहायलाई अन्नदान गर्ने व्यक्तिलाई शनिले शुभ फल दिन्छ।'
        ],
        keyTakeaway: 'शनि न्यायको देवता हो; सदाचार र श्रममा विश्वास राख्नेलाई साढेसातीले जीवनकै ठूलो उचाइ दिन्छ।'
      },
      {
        sectionTitle: '२. अचुक शास्त्रीय उपायहरू',
        paragraphs: [
          'शनिवार पीपलको फेदमा तोरीको तेलको दीप बाल्ने र सात पटक परिक्रमा गर्ने।',
          'दशरथकृत शनि स्तोत्र वा हनुमान चालीसाको दैनिक पाठ गर्ने।',
          'कालो तिल, फलाम, कालो कपडा वा छाता गरिब तथा असहायलाई दान दिने।'
        ]
      }
    ],
    relatedIds: ['graha_shani', 'term_gochar', 'yoga_shani_chandra']
  },
  {
    id: 'vimshottari_dasha_secrets',
    titleNepali: 'विंशोत्तरी महादशा गणना र अन्तर्दशाको फल कसरी निर्धारण गर्ने?',
    titleEnglish: 'Mastering Vimshottari Dasha and Antardasha Predictions',
    category: 'article',
    categoryLabel: 'दशा विज्ञान',
    readTime: '७ मिनेट',
    tags: ['विंशोत्तरी', 'महादशा', 'अन्तर्दशा', 'समय निर्धारण'],
    summary: 'मानव जीवनको १२० वर्षको विंशोत्तरी चक्रमा कुन ग्रहको समय कहिले आउँछ र त्यसले जीवनका घटनाहरू कसरी नियन्त्रण गर्छ?',
    shloka: 'रविर्भौमो गुरौ राहौ शनौ बुधे च केतवे। शुक्रे चन्द्रमसे चैव विंशोत्तरी प्रकीर्तिता॥',
    content: [
      {
        sectionTitle: '१. महादशा स्वामी र अन्तर्दशा स्वामीको सम्बन्ध',
        paragraphs: [
          'महादशानाथले समग्र वातावरण र परिवेश निर्माण गर्छ भने अन्तर्दशानाथले तत्काल घट्ने ठोस घटनाहरू दिन्छ।',
          'यदि महादशानाथ र अन्तर्दशानाथ कुण्डलीमा ६-८ (षडाष्टक) वा २-१२ (द्विर्द्वादश) सम्बन्धमा भएमा उक्त अवधिमा संघर्ष र तनाव आउन सक्छ।'
        ],
        bulletPoints: [
          'केन्द्र-त्रिकोण सम्बन्ध भएका ग्रहहरूको दशामा भाग्यवृद्धि र पदोन्नति हुन्छ।',
          'मारक ग्रहको दशामा स्वास्थ्य र सुरक्षामा विशेष ध्यान दिनुपर्छ।'
        ]
      }
    ],
    relatedIds: ['term_dasha', 'graha_guru', 'yoga_budhaditya']
  }
];

export const PLANETARY_INFLUENCES: PlanetaryInfluence[] = [
  {
    id: 'graha_surya',
    nameNepali: 'सूर्य (Sun)',
    nameSanskrit: 'आदित्य / भास्कर / दिनकर',
    nameEnglish: 'Sun',
    gender: 'पुरुष (Male)',
    nature: 'क्रूर/पाप (Malefic)',
    karakatva: ['आत्मा (Soul)', 'पिता (Father)', 'राजा/सरकार (Authority)', 'आत्मबल (Confidence)', 'हड्डी (Bones)', 'नेतृत्व (Leadership)'],
    exaltation: { rashi: 'मेष (Aries)', degree: '१०°' },
    debilitation: { rashi: 'तुला (Libra)', degree: '१०°' },
    ownRashis: ['सिंह (Leo)'],
    moolatrikona: 'सिंह (०° देखि २०°)',
    friendlyPlanets: ['चन्द्र', 'मंगल', 'गुरु'],
    enemyPlanets: ['शुक्र', 'शनि', 'राहु', 'केतु'],
    neutralPlanets: ['बुध'],
    gemstone: 'माणिक्य (Ruby)',
    metal: 'तामा / सुन (Copper/Gold)',
    rulingDeity: 'भगवान् शिव / गायत्री माता',
    beejaMantra: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः',
    positiveTraits: ['उच्च नेतृत्व क्षमता', 'आत्मविश्वास', 'सरकारी पद तथा प्रतिष्ठा', 'दृढ इच्छाशक्ति', 'तेजस्वी व्यक्तित्व'],
    negativeTraits: ['अहंकार (Ego)', 'क्रोध', 'आँखाको समस्या', 'मुटुरोग', 'पितासँग मतभेद', 'अस्थिरता'],
    afflictedRemedies: [
      'दैनिक बिहान तामाको लोटाबाट सूर्यलाई जल (अर्घ्य) चढाउने।',
      'आदित्य हृदय स्तोत्र वा गायत्री मन्त्रको नियमित जप गर्ने।',
      'पिता र गुरुजनको सम्मान गर्ने, आइतबार नुन कम खाने।'
    ],
    healthCorrelations: ['मुटु (Heart)', 'आँखा (Eyes)', 'मेरुदण्ड र हाडजोर्नी (Spine/Bones)', 'रोगप्रतिरोधात्मक क्षमता (Immunity)'],
    careerFields: ['सरकारी सेवा (Civil/Govt)', 'राजनीति', 'प्रशासनिक अधिकृत', 'चिकित्सा (Doctor)', 'उद्योगपति']
  },
  {
    id: 'graha_chandra',
    nameNepali: 'चन्द्र (Moon)',
    nameSanskrit: 'सोम / शशांक / इन्दु',
    nameEnglish: 'Moon',
    gender: 'स्त्री (Female)',
    nature: 'शुभ (Benefic)',
    karakatva: ['मन (Mind)', 'माता (Mother)', 'भावना (Emotions)', 'जल तत्व (Liquids)', 'रक्त सञ्चार (Blood)', 'कल्पनाशक्ति (Imagination)'],
    exaltation: { rashi: 'वृष (Taurus)', degree: '३°' },
    debilitation: { rashi: 'वृश्चिक (Scorpio)', degree: '३°' },
    ownRashis: ['कर्कट (Cancer)'],
    moolatrikona: 'वृष (३° देखि ३०°)',
    friendlyPlanets: ['सूर्य', 'बुध'],
    enemyPlanets: ['कुनै प्रत्यक्ष शत्रु छैन'],
    neutralPlanets: ['मंगल', 'गुरु', 'शुक्र', 'शनि'],
    gemstone: 'मोती (Pearl / Moonstone)',
    metal: 'चाँदी (Silver)',
    rulingDeity: 'माता पार्वती / भगवान् शिव',
    beejaMantra: 'ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः',
    positiveTraits: ['शान्त मन', 'कोमल हृदय', 'उच्च कल्पनाशक्ति', 'आमाको सुख', 'सामाजिक लोकप्रियता', 'सहनशीलता'],
    negativeTraits: ['अत्यधिक भावुकता', 'मानसिक तनाव/डिप्रेसन', 'अनिद्रा', 'चिसो/कफ सम्बन्धी समस्या', 'निर्णयमा अस्थिरता'],
    afflictedRemedies: [
      'सोमबार भगवान् शिवको जलाभिषेक गर्ने र ॐ नमः शिवाय जप गर्ने।',
      'माताको चरणस्पर्श गरी आशीर्वाद लिने, चाँदीको गिलासमा पानी पिउने।',
      'पूर्णिमाको दिन चन्द्रमाको दर्शन तथा खीर दान गर्ने।'
    ],
    healthCorrelations: ['मस्तिष्क/मन', 'फोक्सो र छाती', 'रक्तचाप', 'पाचन र जल सन्तुलन'],
    careerFields: ['मनोविज्ञान', 'हस्पिटालिटी/पर्यटन', 'नर्सिङ/चिकित्सा', 'डेयरी/जल व्यवसाय', 'कला/साहित्य']
  },
  {
    id: 'graha_mangala',
    nameNepali: 'मंगल (Mars)',
    nameSanskrit: 'भौम / कुज / अंगारक',
    nameEnglish: 'Mars',
    gender: 'पुरुष (Male)',
    nature: 'क्रूर/पाप (Malefic)',
    karakatva: ['पराक्रम (Courage)', 'भाइ (Brother)', 'भूमि/जग्गा (Land)', 'रगत (Blood)', 'ऊर्जा (Energy)', 'प्राविधिक बुद्धि (Engineering)'],
    exaltation: { rashi: 'मकर (Capricorn)', degree: '२८°' },
    debilitation: { rashi: 'कर्कट (Cancer)', degree: '२८°' },
    ownRashis: ['मेष (Aries)', 'वृश्चिक (Scorpio)'],
    moolatrikona: 'मेष (०° देखि १२°)',
    friendlyPlanets: ['सूर्य', 'चन्द्र', 'गुरु'],
    enemyPlanets: ['बुध'],
    neutralPlanets: ['शुक्र', 'शनि'],
    gemstone: 'मुगा (Red Coral)',
    metal: 'तामा / पित्तल (Copper/Brass)',
    rulingDeity: 'भगवान् कार्तिकेय / हनुमान जी',
    beejaMantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
    positiveTraits: ['निडरता र साहस', 'नेतृत्व', 'शारीरिक स्फूर्ति', 'जग्गाजमिनको लाभ', 'शीघ्र निर्णय क्षमता'],
    negativeTraits: ['उग्र क्रोध', 'हिंसात्मक प्रवृत्ति', 'रक्तविकार', 'दुर्घटना/चोटपटक', 'दाम्पत्य जीवनमा तनाव (मांगलिक)'],
    afflictedRemedies: [
      'मंगलबार हनुमान चालिसा वा सुन्दरकाण्डको पाठ गर्ने।',
      'रातो दाल (मुसुरो), तामाको भाँडो वा रातो कपडा दान गर्ने।',
      'भाइहरूसँग राम्रो सम्बन्ध राख्ने र क्रोधमा संयम अपनाउने।'
    ],
    healthCorrelations: ['मांसपेशी', 'अस्थिमज्जा (Bone Marrow)', 'रगत', 'टाउको र अनुहार'],
    careerFields: ['सेना/प्रहरी', 'इन्जिनियरिङ', 'शल्यक्रिया (Surgeon)', 'घरजग्गा (Real Estate)', 'खेलकुद (Sports)']
  },
  {
    id: 'graha_budha',
    nameNepali: 'बुध (Mercury)',
    nameSanskrit: 'सौम्य / ज्ञ / रोहिणेय',
    nameEnglish: 'Mercury',
    gender: 'नपुंसक (Eunuch)',
    nature: 'सम (Neutral - सङ्गत अनुसार)',
    karakatva: ['बुद्धि (Intellect)', 'वाणी (Speech)', 'व्यापार (Business)', 'गणित (Mathematics)', 'सञ्चार (Communication)', 'तर्क (Logic)'],
    exaltation: { rashi: 'कन्या (Virgo)', degree: '१५°' },
    debilitation: { rashi: 'मीन (Pisces)', degree: '१५°' },
    ownRashis: ['मिथुन (Gemini)', 'कन्या (Virgo)'],
    moolatrikona: 'कन्या (१५° देखि २०°)',
    friendlyPlanets: ['सूर्य', 'शुक्र'],
    enemyPlanets: ['चन्द्र'],
    neutralPlanets: ['मंगल', 'गुरु', 'शनि'],
    gemstone: 'पन्ना (Emerald)',
    metal: 'काँस (Bronze)',
    rulingDeity: 'भगवान् विष्णु / गणेश जी',
    beejaMantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः',
    positiveTraits: ['कुशाग्र बुद्धि', 'मिठो र प्रभावकारी बोली', 'व्यापारिक कुशलता', 'विश्लेषणात्मक क्षमता', 'हास्यचेत'],
    negativeTraits: ['बोली लरबराउने/भकभकाउने', 'नसा सम्बन्धी कमजोरी', 'अति चञ्चलता', 'धोकाधडीमा फस्ने'],
    afflictedRemedies: [
      'बुधबार गणेश जीलाई दूबो र लड्डु चढाउने।',
      'हरियो मुंगको दाल दान गर्ने र गाईलाई हरियो घाँस खुवाउने।',
      'विष्णु सहस्रनाम पाठ गर्ने वा ॐ गं गणपतये नमः जप गर्ने।'
    ],
    healthCorrelations: ['स्नायु प्रणाली (Nervous System)', 'छाला (Skin)', 'जिब्रो र घाँटी', 'फोक्सो'],
    careerFields: ['बैंकिङ/लेखा (CA)', 'सञ्चार/पत्रकारिता', 'कम्प्युटर सफ्टवेयर', 'व्यापार/वाणिज्य', 'शिक्षण/परामर्शदाता']
  },
  {
    id: 'graha_guru',
    nameNepali: 'गुरु / बृहस्पति (Jupiter)',
    nameSanskrit: 'देवगुरु / वागीश / जीव',
    nameEnglish: 'Jupiter',
    gender: 'पुरुष (Male)',
    nature: 'अति शुभ (Great Benefic)',
    karakatva: ['ज्ञान (Wisdom)', 'सन्तान (Children)', 'धर्म (Spirituality)', 'धन/सम्पत्ति (Wealth)', 'गुरु/आचार्य (Mentors)', 'भाग्य (Fortune)'],
    exaltation: { rashi: 'कर्कट (Cancer)', degree: '५°' },
    debilitation: { rashi: 'मकर (Capricorn)', degree: '५°' },
    ownRashis: ['धनु (Sagittarius)', 'मीन (Pisces)'],
    moolatrikona: 'धनु (०° देखि १०°)',
    friendlyPlanets: ['सूर्य', 'चन्द्र', 'मंगल'],
    enemyPlanets: ['बुध', 'शुक्र'],
    neutralPlanets: ['शनि'],
    gemstone: 'पुष्पराज (Yellow Sapphire)',
    metal: 'सुन / पित्तल (Gold/Brass)',
    rulingDeity: 'भगवान् ब्रह्मा / दक्षिणामूर्ति शिव / विष्णु',
    beejaMantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः',
    positiveTraits: ['अगाध ज्ञान र विवेक', 'धार्मिक र परोपकारी स्वभाव', 'सन्तान सुख', 'उच्च सामाजिक मान-सम्मान', 'आर्थिक सम्पन्नता'],
    negativeTraits: ['मोटापा/मधुमेह', 'अहंकारी धार्मिकता', 'कलेजोको समस्या', 'सन्तान सम्बन्धी चिन्ता'],
    afflictedRemedies: [
      'बिहीबार भगवान् विष्णुको पूजा गर्ने र पहेँलो फूल/फल चढाउने।',
      'चनाको दाल, बेसार, पहेँलो कपडा दान गर्ने।',
      'गुरु, शिक्षक तथा वृद्धहरूको आदर-सत्कार गर्ने।'
    ],
    healthCorrelations: ['कलेजो (Liver)', 'बोसो/मोटापा', 'कान (Hearing)', 'धमनी र रक्तसंचार'],
    careerFields: ['प्राध्यापक/शिक्षक', 'न्यायाधीश/वकिल', 'धर्माचार्य/ज्योतिषी', 'अर्थशास्त्री/बैंकर', 'परामर्शदाता']
  },
  {
    id: 'graha_shukra',
    nameNepali: 'शुक्र (Venus)',
    nameSanskrit: 'दैत्यगुरु / भार्गव / काव्य',
    nameEnglish: 'Venus',
    gender: 'स्त्री (Female)',
    nature: 'शुभ (Benefic)',
    karakatva: ['प्रेम/विवाह (Love/Marriage)', 'सौन्दर्य (Beauty)', 'कला/संगीत (Arts)', 'सवारी साधन/सम्पत्ति (Luxury)', 'जीवनसाथी (Spouse)'],
    exaltation: { rashi: 'मीन (Pisces)', degree: '२७°' },
    debilitation: { rashi: 'कन्या (Virgo)', degree: '२७°' },
    ownRashis: ['वृष (Taurus)', 'तुला (Libra)'],
    moolatrikona: 'तुला (०° देखि १५°)',
    friendlyPlanets: ['बुध', 'शनि', 'राहु'],
    enemyPlanets: ['सूर्य', 'चन्द्र'],
    neutralPlanets: ['मंगल', 'गुरु'],
    gemstone: 'हीरा / ओपल (Diamond/Opal)',
    metal: 'चाँदी / प्लेटिनम (Silver/Platinum)',
    rulingDeity: 'माता महालक्ष्मी / इन्द्राणी',
    beejaMantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः',
    positiveTraits: ['आकर्षक व्यक्तित्व', 'कलात्मक प्रतिभा', 'सुखी वैवाहिक जीवन', 'धनधान्य र विलासिता', 'मिठासपूर्ण बोली'],
    negativeTraits: ['अत्याधिक भोगविलास', 'वैवाहिक खटपट', 'गुप्त रोग/मधुमेह', 'अपव्यय र ऋण'],
    afflictedRemedies: [
      'शुक्रबार श्री सूक्त वा कनकधारा स्तोत्रको पाठ गर्ने।',
      'सेतो कपडा, चामल, चिनी, दही वा सेतो मिठाई दान गर्ने।',
      'स्त्रीजातिको सम्मान गर्ने र सरसफाइमा विशेष ध्यान दिने।'
    ],
    healthCorrelations: ['प्रजनन प्रणाली (Reproductive)', 'मृगौला (Kidneys)', 'आँखाको ज्योति', 'हर्मोन सन्तुलन'],
    careerFields: ['कला/अभिनय/संगीत', 'फेसन/डिजाइनिङ', 'सौन्दर्य व्यवसाय', 'होटल/रेष्टुरेन्ट', 'वास्तुकला']
  },
  {
    id: 'graha_shani',
    nameNepali: 'शनि (Saturn)',
    nameSanskrit: 'शनैश्चर / मन्द / छायापुत्र',
    nameEnglish: 'Saturn',
    gender: 'नपुंसक (Eunuch)',
    nature: 'क्रूर/पाप (Malefic - न्यायाधीश)',
    karakatva: ['कर्म (Work/Karma)', 'आयु (Longevity)', 'अनुशासन (Discipline)', 'कष्ट/धैर्य (Patience)', 'गरिब/मजदुर (Labour)', 'वैराग्य (Detachment)'],
    exaltation: { rashi: 'तुला (Libra)', degree: '२०°' },
    debilitation: { rashi: 'मेष (Aries)', degree: '२०°' },
    ownRashis: ['मकर (Capricorn)', 'कुम्भ (Aquarius)'],
    moolatrikona: 'कुम्भ (०° देखि २०°)',
    friendlyPlanets: ['बुध', 'शुक्र', 'राहु'],
    enemyPlanets: ['सूर्य', 'चन्द्र', 'मंगल'],
    neutralPlanets: ['गुरु'],
    gemstone: 'नीलम (Blue Sapphire / Amethyst)',
    metal: 'फलाम / सिसा (Iron/Lead)',
    rulingDeity: 'भगवान् शिव / कालभैरव / हनुमान जी',
    beejaMantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः',
    positiveTraits: ['दृढ इच्छाशक्ति र धैर्य', 'अथक परिश्रम', 'न्यायप्रियता', 'दीर्घायु', 'उच्च प्रशासनिक संगठन क्षमता'],
    negativeTraits: ['अत्यधिक ढिलासुस्ती', 'निराशावाद (Depression)', 'दीर्घरोग (वात/जोर्नी दुख्ने)', 'एक्लोपन'],
    afflictedRemedies: [
      'शनिवार पीपलको पूजा र तोरीको तेलको दियो बाल्ने।',
      'दशरथकृत शनि स्तोत्र र हनुमान चालिसा पाठ गर्ने।',
      'कालो तिल, फलाम, कालो जुत्ता/छाता गरिबलाई दान दिने।'
    ],
    healthCorrelations: ['जोर्नी र हाड (Joints/Arthritis)', 'स्नायु र खुट्टा', 'दीर्घरोग', 'दाँत'],
    careerFields: ['न्यायालय/कानून', 'खानी तथा धातु उद्योग', 'कृषि तथा वन पैदावार', 'इन्जिनियरिङ/निर्माण', 'राजनीतिक संगठन']
  },
  {
    id: 'graha_rahu',
    nameNepali: 'राहु (North Node)',
    nameSanskrit: 'तमो ग्रह / सर्पशीर्ष / स्वर्भानु',
    nameEnglish: 'Rahu (North Node)',
    gender: 'स्त्री/छाया',
    nature: 'अति क्रूर छायाग्रह (Shadow Malefic)',
    karakatva: ['रहस्य (Mystery)', 'विदेश (Foreign Travel)', 'प्रविधि/इन्टरनेट (Tech/AI)', 'भ्रम/माया (Illusion)', 'अचानक घटना (Sudden Events)'],
    exaltation: { rashi: 'वृष/मिथुन (Taurus/Gemini)', degree: '१५°' },
    debilitation: { rashi: 'वृश्चिक/धनु (Scorpio/Sagittarius)', degree: '१५°' },
    ownRashis: ['कुम्भ (सह-स्वामी)'],
    moolatrikona: 'मिथुन',
    friendlyPlanets: ['बुध', 'शुक्र', 'शनि'],
    enemyPlanets: ['सूर्य', 'चन्द्र', 'मंगल'],
    neutralPlanets: ['गुरु'],
    gemstone: 'गोमेद (Hessonite)',
    metal: 'अष्टधातु / सिसा (Alloy/Lead)',
    rulingDeity: 'माता दुर्गा / सरस्वती / कालभैरव',
    beejaMantra: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः',
    positiveTraits: ['तीक्ष्ण कूटनीति', 'अन्तर्राष्ट्रिय सफलता', 'नवीन प्रविधिमा निपुणता', 'अप्रत्याशित धनलाभ', 'अनुसन्धान क्षमता'],
    negativeTraits: ['भ्रम र शंकालु मन', 'नशालु पदार्थको लत', 'धोकाधडी', 'अनिद्रा र मानसिक डर'],
    afflictedRemedies: [
      'दुर्गा सप्तशती वा दुर्गा चालिसा पाठ गर्ने।',
      'कुकुरलाई रोटी खुवाउने, चराचुरुङ्गीलाई चारो हाल्ने।',
      'सरसफाइमा ध्यान दिने र राहु कालमा महत्त्वपूर्ण निर्णय नगर्ने।'
    ],
    healthCorrelations: ['विषालु संक्रमण', 'मानसिक विकार/फोबिया', 'छालाको एलर्जी', 'ग्यास्ट्रिक'],
    careerFields: ['सफ्टवेयर/AI प्रविधि', 'विदेशी व्यापार/कूटनीति', 'सिनेमा/मिडिया', 'जासुसी/अनुसन्धान', 'शेयर बजार']
  },
  {
    id: 'graha_ketu',
    nameNepali: 'केतु (South Node)',
    nameSanskrit: 'शिखी / मोक्षकारक / ध्वजा',
    nameEnglish: 'Ketu (South Node)',
    gender: 'नपुंसक/छाया',
    nature: 'आध्यात्मिक छायाग्रह (Moksha Karaka)',
    karakatva: ['मोक्ष (Liberation)', 'अध्यात्म (Spirituality)', 'वैराग्य (Detachment)', 'शल्यक्रिया (Surgery)', 'रहस्यमय ज्ञान (Occult)'],
    exaltation: { rashi: 'वृश्चिक/धनु (Scorpio/Sagittarius)', degree: '१५°' },
    debilitation: { rashi: 'वृष/मिथुन (Taurus/Gemini)', degree: '१५°' },
    ownRashis: ['वृश्चिक (सह-स्वामी)'],
    moolatrikona: 'धनु',
    friendlyPlanets: ['मंगल', 'गुरु', 'शुक्र'],
    enemyPlanets: ['सूर्य', 'चन्द्र'],
    neutralPlanets: ['बुध', 'शनि'],
    gemstone: 'लहसुनिया (Cat’s Eye)',
    metal: 'पञ्चधातु (Five Metals)',
    rulingDeity: 'भगवान् गणेश / मत्स्यावतार',
    beejaMantra: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः',
    positiveTraits: ['गहन आध्यात्मिक अनुभव', 'उच्च अन्तर्ज्ञान (Intuition)', 'मन्त्र सिद्धि', 'निःस्वार्थ सेवा', 'रहस्य विद्यामा निपुण'],
    negativeTraits: ['एकाकीपन र अलगाव', 'घाउ-खत र शल्यक्रिया', 'अचानक बाधा', 'निराशा'],
    afflictedRemedies: [
      'गणेश अथर्वशीर्षको पाठ गर्ने र गणेशजीलाई लड्डु चढाउने।',
      'अपाङ्ग वा असहाय व्यक्तिलाई कम्बल/न्यानो कपडा दान गर्ने।',
      'आवारा कुकुरलाई भोजन गराउने।'
    ],
    healthCorrelations: ['नसा/मेरुदण्ड', 'छालाको घाउ/खत', 'शल्यक्रिया जन्य समस्या', 'पेटको रहस्यमय रोग'],
    careerFields: ['अध्यात्म/योग साधना', 'शल्यचिकित्सक (Surgeon)', 'खगोल/ज्योतिष विद्या', 'दर्शनशास्त्र', 'साइबर सुरक्षा']
  }
];

export const ASTROLOGICAL_YOGAS: AstrologicalYoga[] = [
  {
    id: 'yoga_gajakesari',
    nameNepali: 'गजकेसरी योग (Gaja Kesari Yoga)',
    nameSanskrit: 'गजकेसरी योग',
    type: 'raja_yoga',
    typeLabel: 'शुभ राजयोग',
    formationCriteria: 'चन्द्रमाबाट केन्द्र भावमा (१, ४, ७, १०) देवगुरु बृहस्पति स्थित भएमा वा चन्द्र र गुरुको युति/दृष्टि भएमा यो महायोग निर्माण हुन्छ।',
    classicalResult: 'जातक हात्ती जस्तै बलवान् र सिंह जस्तै तेजस्वी, ज्ञानी, यशस्वी, उच्च पद प्राप्त गर्ने, समाजमा सम्मानित र दीर्घायु हुन्छ।',
    practicalLifeImpact: 'शिक्षा, राजनीति, प्रशासनिक सेवा तथा समाजसेवामा उच्चतम सफलता। कठिन परिस्थितिमा पनि ईश्वरकृपा र प्रतिष्ठा जोगिन्छ।',
    shloka: 'केन्द्रे देवगुरौ लग्नाच्चन्द्राद्वापि शुभेक्षिते। नीचारिमूढहीने च योगोऽयं गजकेसरी॥',
    frequency: 'सामान्य'
  },
  {
    id: 'yoga_pancha_mahapurusha',
    nameNepali: 'पञ्च महापुरुष योग (Pancha Mahapurusha Yogas)',
    nameSanskrit: 'रुचक, भद्र, हंस, मालव्य, शश योग',
    type: 'mahapurusha',
    typeLabel: 'महापुरुष योग',
    formationCriteria: 'मंगल (रुचक), बुध (भद्र), गुरु (हंस), शुक्र (मालव्य) वा शनि (शश) मध्ये कुनै एक ग्रह लग्न वा चन्द्रबाट केन्द्र भावमा आफ्नै राशि वा उच्च राशिमा स्थित भएमा बन्दछ।',
    classicalResult: 'पाँचै योगले व्यक्तिलाई आ-आफ्नो कारकत्व अनुसार अद्वितीय महापुरुष, राजा समान ऐश्वर्यशाली, पराक्रमी र प्रसिद्ध बनाउँछन्।',
    practicalLifeImpact: 'रुचकले सेना/भूमि, भद्रले बुद्धि/व्यापार, हंसले ज्ञान/न्याय, मालव्यले विलासिता/कला, र शशले संगठन/राजनीतिमा असाधारण उचाइ दिन्छ।',
    shloka: 'स्वक्षेत्रोच्चगताः केन्द्रे कुजबुधगुरुभृगुशनयः। रुचकभद्रहंसमालव्यशशसंज्ञा महापुरुषाः॥',
    frequency: 'दुर्लभ'
  },
  {
    id: 'yoga_budhaditya',
    nameNepali: 'बुधादित्य योग (Budhaditya Yoga)',
    nameSanskrit: 'बुधादित्य योग',
    type: 'auspicious',
    typeLabel: 'बुद्धि तथा कीर्ति योग',
    formationCriteria: 'कुनै पनि शुभ भावमा सूर्य र बुधको युति (एकै राशिमा स्थिति) भएमा यो योग बन्दछ। (विशेष गरी १, ४, ५, ९, १० वा ११ भावमा)।',
    classicalResult: 'जातक कुशाग्र बुद्धि भएको, सरकारी कार्यमा दक्ष, वाकपटु, लोकप्रिय र आर्थिक रूपमा सम्पन्न हुन्छ।',
    practicalLifeImpact: 'प्रशासनिक परीक्षा (लोकसेवा), अनुसन्धान, पत्रकारिता, बैंकिङ र व्यवस्थापनमा उच्च सफलता।',
    frequency: 'सामान्य'
  },
  {
    id: 'yoga_neechabhanga',
    nameNepali: 'नीचभङ्ग राजयोग (Neecha Bhanga Raja Yoga)',
    nameSanskrit: 'नीचभङ्ग राजयोग',
    type: 'raja_yoga',
    typeLabel: 'विपरीतबाट सफलता',
    formationCriteria: 'कुनै नीच राशिमा रहेको ग्रहको नीचता भंग हुनु (जस्तै: उक्त नीच राशिको स्वामी केन्द्रमा हुनु वा उक्त राशिमा उच्च हुने ग्रह केन्द्रमा हुनु)।',
    classicalResult: 'सुरुवाती जीवनमा अत्यन्त गरिबी र संघर्ष भए तापनि उत्तरार्धमा चक्रवर्ती राजा जस्तै अपार धन र पदवी प्राप्त हुन्छ।',
    practicalLifeImpact: 'शून्यबाट सुरु गरेर विश्वविख्यात उद्योगपति, राजनीतिज्ञ वा प्रख्यात व्यक्तित्व बन्ने सम्भावना।',
    frequency: 'दुर्लभ'
  },
  {
    id: 'yoga_dharma_karmadhipati',
    nameNepali: 'धर्म-कर्माधिपति योग (Dharma Karmadhipati Yoga)',
    nameSanskrit: 'धर्मकर्माधिपति योग',
    type: 'raja_yoga',
    typeLabel: 'सर्वोच्च भाग्य-कर्म योग',
    formationCriteria: 'नवमेश (भाग्येश) र दशमेश (कर्मेश) को युति, परस्पर दृष्टि वा राशि परिवर्तन भएमा निर्माण हुन्छ।',
    classicalResult: 'जातक अत्यधिक धर्मात्मा, उच्च नैतिकवान्, राज्यबाट सम्मानित, नेतृत्वकर्ता र समाज सुधारक हुन्छ।',
    practicalLifeImpact: 'व्यक्तिले गर्ने कर्म सधैँ फलदायी हुन्छ र भाग्यले पाइला-पाइलामा साथ दिन्छ।',
    frequency: 'दुर्लभ'
  },
  {
    id: 'yoga_kalasarpa_dosha',
    nameNepali: 'कालसर्प दोष / योग (Kala Sarpa Dosha)',
    nameSanskrit: 'कालसर्प योग',
    type: 'dosha',
    typeLabel: 'छाया ग्रह बन्धन दोष',
    formationCriteria: 'कुण्डलीका सबै सात ग्रहहरू राहु र केतुको परिधिभित्र (एकातिर) कैद भएमा कालसर्प दोष बन्दछ (अनन्त, कुलिक, वासुकी, शंखपाल आदि १२ प्रकार)।',
    classicalResult: 'जीवनमा अचानक उत्थान र पतन, मानसिक अस्थिरता, वैवाहिक ढिलाइ र प्रगतिमा अज्ञात अवरोध।',
    practicalLifeImpact: 'कठोर संघर्षपछि ३३ वा ४२ वर्षपछि असाधारण सफलता पनि प्राप्त हुन्छ।',
    cancellationOrRemedy: 'महामृत्युञ्जय जप, नागपञ्चमीमा नागपूजा, त्र्यम्बकेश्वर वा पशुपतिनाथमा कालसर्प शान्ति पूजा, चाँदीको नाग-नागिनी जलप्रवाह।',
    frequency: 'सामान्य'
  },
  {
    id: 'yoga_manglik_dosha',
    nameNepali: 'मांगलिक दोष (Kuja / Manglik Dosha)',
    nameSanskrit: 'भौम दोष',
    type: 'dosha',
    typeLabel: 'वैवाहिक सामञ्जस्य दोष',
    formationCriteria: 'लग्न, चतुर्थ, सप्तम, अष्टम वा द्वादश भावमा मंगल ग्रह स्थित भएमा मांगलिक दोष मानिन्छ।',
    classicalResult: 'दाम्पत्य जीवनमा विचारको द्वन्द्व, वैवाहिक ढिलाइ वा जीवनसाथीको स्वास्थ्यमा उतारचढाव।',
    practicalLifeImpact: 'दुवै वर-वधु मांगलिक भएमा वा मंगल आफ्नै/उच्च राशिमा भएमा दोष स्वतः भङ्ग हुन्छ।',
    cancellationOrRemedy: 'कुम्भ विवाह, मङ्गल चण्डिका स्तोत्र पाठ, मंगलबार हनुमान जीको उपासना र रातो वस्तु दान।',
    shloka: 'लग्ने व्यये च पाताले यामित्रे चाष्टमे कुजे। कन्या भर्त्तुर्विनाशाय भर्तुः कन्या विनाशिनी॥',
    frequency: 'सामान्य'
  },
  {
    id: 'yoga_shani_chandra',
    nameNepali: 'विष योग / शशियोग (Visha Yoga)',
    nameSanskrit: 'शनि-चन्द्र युति विष योग',
    type: 'arishta',
    typeLabel: 'मानसिक संघर्ष योग',
    formationCriteria: 'शनि र चन्द्रमाको कुनै पनि भावमा युति वा परस्पर पूर्ण दृष्टि भएमा बन्दछ।',
    classicalResult: 'जातकलाई अत्यधिक मानसिक चिन्ता, निराशावाद, आमाको स्वास्थ्य कष्ट र एकाकीपनको अनुभव हुन्छ।',
    practicalLifeImpact: 'यस योगले जातकलाई वैराग्य र गहिरो अनुसन्धान/दर्शनशास्त्रमा भने उच्च सफलता दिन सक्छ।',
    cancellationOrRemedy: 'सोमबार र शनिवार भगवान् शिवको पञ्चामृत पूजा, ॐ नमः शिवाय मन्त्रको निरन्तर जप।',
    frequency: 'सामान्य'
  }
];

export const ASTROLOGICAL_TERMS: AstrologicalTerm[] = [
  {
    id: 'term_lagna',
    termNepali: 'लग्न (Lagna / Ascendant)',
    termSanskrit: 'लग्नम्',
    termEnglish: 'Ascendant',
    category: 'calculation',
    categoryLabel: 'गणितीय आधार',
    shortDefinition: 'व्यक्ति जन्मिएको ठ्याक्कै समय र स्थानमा पूर्वीय क्षितिजमा उदित भइरहेको राशिलाई लग्न भनिन्छ।',
    detailedExplanation: 'लग्न कुण्डलीको प्रथम भाव हो जसले व्यक्तिको शरीर, रूप, स्वास्थ्य, स्वभाव, आत्मविश्वास र सम्पूर्ण जीवनको दिशा निर्धारण गर्दछ। लग्न नै सम्पूर्ण कुण्डलीको मेरुदण्ड हो।',
    practicalApplication: 'कुण्डली विश्लेषण गर्दा लग्न र लग्नेश बलियो भएमा अरू कमजोर ग्रहहरूको दोष पनि स्वतः कम हुन्छ।'
  },
  {
    id: 'term_ayanamsa',
    termNepali: 'अयनांश (Ayanamsa)',
    termSanskrit: 'अयनांशः',
    termEnglish: 'Ayanamsa',
    category: 'astronomy',
    categoryLabel: 'खगोलीय सिद्धान्त',
    shortDefinition: 'सायन (Tropical) र निरयण (Sidereal) राशि चक्र बीचको कोणीय भिन्नतालाई अयनांश भनिन्छ।',
    detailedExplanation: 'पृथ्वीको अक्षीय अयन गतिकारण विषुववृत्त सर्ने हुँदा यो अन्तर आउँछ। वैदिक ज्योतिषमा मुख्यतया "लाहिरी अयनांश" (Lahiri/Chitra Paksha) लाई सर्वमान्य र प्रामाणिक मानिन्छ।',
    practicalApplication: 'ग्रह र लग्नको वास्तविक स्पष्ट राशि-अंश निकाल्न अयनांश अनिवार्य हुन्छ।'
  },
  {
    id: 'term_bhavachalit',
    termNepali: 'भावचलित चक्र (Bhava Chalit Chart)',
    termSanskrit: 'भावचलितम्',
    termEnglish: 'Cuspal / Bhava Chart',
    category: 'house_system',
    categoryLabel: 'कुण्डली संरचना',
    shortDefinition: 'लग्न स्पष्ट विन्दुको आधारमा प्रत्येक भावको प्रारम्भ, मध्य र अन्त गणना गरी बनाइने वास्तविक भाव कुण्डली।',
    detailedExplanation: 'धेरैजसो अवस्थामा जन्मकुण्डलीमा एउटा राशिमा देखिएको ग्रह भावचलितमा अघिल्लो वा पछिल्लो भावमा सर्न सक्छ। फल दिने क्रममा ग्रहले भावचलित अनुसारको भाव फल दिन्छ।',
    practicalApplication: 'कुनै ग्रह कुण्डलीमा ६ भावमा देखिए तापनि चलितमा ५ भावमा सरेको भए उसले ५ भावको शुभ फल दिन्छ।'
  },
  {
    id: 'term_karaka',
    termNepali: 'कारक (Karaka)',
    termSanskrit: 'कारकत्वम्',
    termEnglish: 'Significator',
    category: 'prediction',
    categoryLabel: 'फलादेश सूत्र',
    shortDefinition: 'कुनै निश्चित विषय वा सम्बन्धको प्राकृतिक प्रतिनिधित्व गर्ने ग्रह वा विन्दु।',
    detailedExplanation: 'जस्तै: सूर्य आत्मा/पिताको कारक, चन्द्र मन/आमाको कारक, मंगल भाइ/जग्गाको कारक, बुध बुद्धि/व्यापारको कारक, गुरु सन्तान/ज्ञानको कारक, शुक्र पत्नी/विलासिताको कारक र शनि आयु/कर्मको कारक हो।',
    practicalApplication: 'भावेश कमजोर भए पनि यदि कारक ग्रह बलियो छ भने उक्त विषयको पूर्ण विनाश हुँदैन।'
  },
  {
    id: 'term_maraka',
    termNepali: 'मारक भाव र मारकेश (Maraka & Marakesh)',
    termSanskrit: 'मारक स्थानम्',
    termEnglish: 'Death Inflicting House/Lord',
    category: 'prediction',
    categoryLabel: 'फलादेश सूत्र',
    shortDefinition: 'कुण्डलीको द्वितीय (२) र सप्तम (७) भावलाई मारक स्थान र यिनका स्वामीलाई मारकेश भनिन्छ।',
    detailedExplanation: '८ औँ भाव आयु स्थान हो। आयु स्थानबाट आठौँ भाव (३ भाव) पनि आयु हो। यिनका १२ औँ भाव (व्यय) क्रमशः २ र ७ भाव हुने भएकाले यिनलाई मारक मानिन्छ।',
    practicalApplication: 'मारकेशको दशामा शारीरिक कष्ट, दुर्घटना वा रोगको जोखिम रहने हुँदा महामृत्युञ्जय जप गरिन्छ।'
  },
  {
    id: 'term_ashtakavarga',
    termNepali: 'अष्टकवर्ग (Ashtakavarga System)',
    termSanskrit: 'अष्टकवर्गः',
    termEnglish: 'Ashtakavarga System',
    category: 'calculation',
    categoryLabel: 'गणितीय आधार',
    shortDefinition: 'लग्न सहित ७ ग्रहहरूले आ-आफ्नो स्थानबाट दिने शुभ विन्दु (रेखा/विन्दु) को सामूहिक गणितीय अङ्क प्रणाली।',
    detailedExplanation: 'प्रत्येक भावमा कुल शुभ विन्दुहरू गणना गरिन्छ (कुल ३३७ विन्दु)। जुन भावमा २८ भन्दा बढी विन्दु हुन्छन्, त्यो भाव बलियो र फलदायी मानिन्छ।',
    practicalApplication: 'गोचरमा कुन ग्रहले कस्तो फल दिन्छ भन्ने कुरा अष्टकवर्गको विन्दुबाट शतप्रतिशत यकिन गर्न सकिन्छ।'
  },
  {
    id: 'term_shadbala',
    termNepali: 'षड्बल (Shadbala - 6-Fold Planetary Strength)',
    termSanskrit: 'षड्बलम्',
    termEnglish: 'Six-fold Planetary Strength',
    category: 'calculation',
    categoryLabel: 'गणितीय आधार',
    shortDefinition: 'ग्रहहरूको ६ प्रकारको बल: स्थान बल, दिक् बल, काल बल, चेष्टा बल, नैसर्गिक बल र दृक् बल।',
    detailedExplanation: 'कुनै ग्रह कुण्डलीमा देख्दा कमजोर लागे पनि षड्बलमा १ रूप (६० षष्ठ्यांश) भन्दा बढी बलवान् भएमा उसले अत्यन्त शुभ र शक्तिशाली फल दिन सक्छ।',
    practicalApplication: 'ग्रहको वास्तविक सामर्थ्य बुझ्न षड्बल हेर्नु अनिवार्य मानिन्छ।'
  },
  {
    id: 'term_vakra',
    termNepali: 'वक्री ग्रह (Retrograde Planet)',
    termSanskrit: 'वक्र गतिः',
    termEnglish: 'Retrograde Planet',
    category: 'planetary_state',
    categoryLabel: 'ग्रह अवस्था',
    shortDefinition: 'पृथ्वीबाट हेर्दा कुनै ग्रह पछाडि सरेको जस्तो देखिने खगोलीय दृष्टिभ्रम।',
    detailedExplanation: 'सूर्य र चन्द्र कहिल्यै वक्री हुँदैनन्; राहु र केतु सधैँ वक्री हुन्छन्। मंगल, बुध, गुरु, शुक्र र शनि वक्री हुँदा चेष्टा बल उच्च हुन्छ र फल तीव्र रूपमा दिन्छन्।',
    practicalApplication: 'वक्री शुभ ग्रहले असाधारण शुभ फल दिन्छन् भने वक्री पाप ग्रहले अप्रत्याशित बाधा उत्पन्न गर्न सक्छन्।'
  }
];
