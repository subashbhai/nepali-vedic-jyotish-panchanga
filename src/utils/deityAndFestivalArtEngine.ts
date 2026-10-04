// ============================================================================
// बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग सेवा - देवी-देवता तथा नेपाली चाडपर्व चित्रावली इन्जिन
// (Authentic Presiding Deity Portraits & Traditional Nepali Festival Artwork Engine)
// ============================================================================

export interface DeityPortraitInfo {
  tithiNumber: number;
  tithiName: string;
  deityNameNepali: string;
  deityTitle: string;
  symbol: string;
  colorScheme: string;
  imageUrl: string;
  description: string;
}

export interface NepaliFestivalArtInfo {
  code: string;
  festivalName: string;
  celebrationTypeNepali: string;
  traditionalElements: string[];
  imageUrl: string;
  accentColor: string;
  description: string;
}

// १५ वटै तिथिहरूका अधिष्ठाता देवी-देवताहरूको आधिकारिक चित्रावली तथा विवरण
export const DEITY_PORTRAITS_DATABASE: Record<number, DeityPortraitInfo> = {
  1: {
    tithiNumber: 1,
    tithiName: 'प्रतिपदा',
    deityNameNepali: 'भगवान् अग्निदेव (Agni Deva)',
    deityTitle: 'हव्य-कव्यका वहनकर्ता तथा यज्ञ पुरुष',
    symbol: '🔥',
    colorScheme: 'from-orange-600 via-red-600 to-amber-700',
    imageUrl: '/assets/festivals/tihar_deepawali.jpg',
    description: 'तेजोमय यज्ञकुण्ड, प्रज्वलित पवित्र ज्वाला र समस्त देवताहरूको मुख स्वरूप भगवान् अग्निदेव।'
  },
  2: {
    tithiNumber: 2,
    tithiName: 'द्वितीया',
    deityNameNepali: 'भगवान् ब्रह्माजी तथा अश्विनीकुमार (Lord Brahma & Ashwini Kumars)',
    deityTitle: 'सृष्टिकर्ता तथा देववैद्य आरोग्य प्रदाता',
    symbol: '📜',
    colorScheme: 'from-amber-600 via-yellow-600 to-amber-800',
    imageUrl: '/assets/deities/brahma.jpg',
    description: 'कमलासनमा विराजित चार वेदधारी ब्रह्माजी र अमृत कलश लिएका देववैद्य अश्विनीकुमार।'
  },
  3: {
    tithiNumber: 3,
    tithiName: 'तृतीया',
    deityNameNepali: 'माता जगदम्बा गौरी / पार्वती (Maa Gauri)',
    deityTitle: 'अखण्ड सौभाग्य तथा दाम्पत्य कल्याणकारिणी',
    symbol: '🌺',
    colorScheme: 'from-rose-600 via-red-600 to-pink-700',
    imageUrl: '/assets/festivals/haritalika_teej.jpg',
    description: 'रातो वस्त्र, सुवर्ण आभूषण र वरद मुद्रामा आशीर्वाद दिँदै गरेकी माता गौरी।'
  },
  4: {
    tithiNumber: 4,
    tithiName: 'चतुर्थी',
    deityNameNepali: 'विघ्नहर्ता भगवान् श्री गणेश (Lord Ganesha)',
    deityTitle: 'प्रथम पूज्य तथा सर्वकार्य सिद्धिदाता',
    symbol: '🐘',
    colorScheme: 'from-red-600 via-amber-600 to-orange-700',
    imageUrl: '/assets/deities/ganesha.jpg',
    description: 'मोदक पात्र, पाश-अङ्कुश, दुबो र त्रिशूलधारी विघ्नविनाशक गजानन गणेश।'
  },
  5: {
    tithiNumber: 5,
    tithiName: 'पञ्चमी',
    deityNameNepali: 'नागराज (अनन्त-वासुकी) तथा माता सरस्वती (Naga Deities & Saraswati)',
    deityTitle: 'पातालका रक्षक नागराज तथा विद्या-बुद्धि प्रदायिनी',
    symbol: '🐍',
    colorScheme: 'from-emerald-700 via-teal-700 to-cyan-800',
    imageUrl: '/assets/deities/friday_lakshmi.jpg',
    description: 'फणा फिँजाएका दिव्य नागराज मण्डल तथा श्वेत पद्मासना वीणावादिनी सरस्वती।'
  },
  6: {
    tithiNumber: 6,
    tithiName: 'षष्ठी',
    deityNameNepali: 'भगवान् कार्तिकेय (स्कन्द कुमार) तथा षष्ठी देवी (Lord Kartikeya & Shasthi)',
    deityTitle: 'देवसेनापति शौर्यदाता तथा बालरक्षा देवी',
    symbol: '🦚',
    colorScheme: 'from-indigo-700 via-purple-700 to-pink-800',
    imageUrl: '/assets/festivals/chhath_parva.jpg',
    description: 'मयूरवाहनमा आरूढ शक्ति-अस्त्रधारी सेनापति कुमार तथा सन्तान रक्षाकारिणी षष्ठी देवी।'
  },
  7: {
    tithiNumber: 7,
    tithiName: 'सप्तमी',
    deityNameNepali: 'भगवान् सूर्यनारायण (The Sun God - Surya Deva)',
    deityTitle: 'प्रत्यक्ष देव तथा सम्पूर्ण जगत्‌का आत्मा',
    symbol: '☀️',
    colorScheme: 'from-amber-500 via-orange-600 to-red-700',
    imageUrl: '/assets/deities/sunday_surya.jpg',
    description: 'सातवटा सुनौला घोडाको रथमा आरूढ, कमलपुष्पधारी जगच्चक्षु भगवान् सूर्यदेव।'
  },
  8: {
    tithiNumber: 8,
    tithiName: 'अष्टमी',
    deityNameNepali: 'अष्टभुजा माता दुर्गा तथा कालभैरव (Maa Durga & Lord Bhairava)',
    deityTitle: 'महिषासुरमर्दिनी तथा समयका अधिष्ठाता',
    symbol: '🔱',
    colorScheme: 'from-red-700 via-rose-700 to-amber-900',
    imageUrl: '/assets/deities/durga_ashtami.jpg',
    description: 'सिंहमाथि आरूढ, अस्त्र-शस्त्रले सुसज्जित महापराक्रमी भगवती दुर्गा र रौद्र कालभैरव।'
  },
  9: {
    tithiNumber: 9,
    tithiName: 'नवमी',
    deityNameNepali: 'माता सिद्धिदात्री तथा मर्यादा पुरुषोत्तम श्रीराम (Maa Siddhidatri & Lord Rama)',
    deityTitle: 'अष्टसिद्धि प्रदायिनी तथा धर्म मर्यादा पालक',
    symbol: '🏹',
    colorScheme: 'from-amber-600 via-orange-600 to-red-600',
    imageUrl: '/assets/festivals/bibaha_panchami.jpg',
    description: 'कमलासनमा विराजित नवदुर्गाकी अन्तिम शक्ति सिद्धिदात्री तथा धनुर्धारी मर्यादा पुरुषोत्तम श्रीराम।'
  },
  10: {
    tithiNumber: 10,
    tithiName: 'दशमी',
    deityNameNepali: 'दश दिक्पाल तथा धर्मराज यमराज (Ten Digpalas & Dharmaraj Yamaraj)',
    deityTitle: 'दश दिशाका रक्षक तथा न्यायका अधिपति',
    symbol: '⚖️',
    colorScheme: 'from-stone-700 via-amber-800 to-stone-900',
    imageUrl: '/assets/deities/yamaraj.jpg',
    description: 'ऐरावत, अग्नि, यमदण्ड र वरुण पाशसहितका दश दिक्पाल तथा धर्मराज यमराज।'
  },
  11: {
    tithiNumber: 11,
    tithiName: 'एकादशी',
    deityNameNepali: 'शेषशायी भगवान् श्रीहरि विष्णु (Lord Vishnu in Vaikuntha)',
    deityTitle: 'जगतका पालनकर्ता तथा मोक्ष प्रदायक नारायण',
    symbol: '🪷',
    colorScheme: 'from-blue-700 via-indigo-700 to-purple-800',
    imageUrl: '/assets/deities/thursday_vishnu.jpg',
    description: 'क्षीरसागरमा शेषनागको शय्यामा लक्ष्मीसहित शंख-चक्र-गदा-पद्मधारी भगवान् विष्णु।'
  },
  12: {
    tithiNumber: 12,
    tithiName: 'द्वादशी',
    deityNameNepali: 'भगवान् दामोदर / माधव (Lord Damodara / Madhava)',
    deityTitle: 'भक्तवत्सल दयालु परमात्मा',
    symbol: '✨',
    colorScheme: 'from-amber-600 via-orange-600 to-yellow-700',
    imageUrl: '/assets/festivals/shree_krishna_janmashtami.jpg',
    description: 'तुलसीदल सुशोभित, पीताम्बरधारी भगवान् माधव तथा दामोदर रूप।'
  },
  13: {
    tithiNumber: 13,
    tithiName: 'त्रयोदशी',
    deityNameNepali: 'भगवान् कामदेव तथा नीलकण्ठ शिव (Lord Shiva - Pradosha Murti)',
    deityTitle: 'प्रदोष कालका स्वामी तथा विषपायी नीलकण्ठ',
    symbol: '🌙',
    colorScheme: 'from-cyan-700 via-blue-800 to-indigo-900',
    imageUrl: '/assets/deities/monday_shiva.jpg',
    description: 'नन्दीमाथि आनन्द ताण्डव नृत्य गर्दै गरेका नीलकण्ठ चन्द्रशेखर भगवान् शिव।'
  },
  14: {
    tithiNumber: 14,
    tithiName: 'चतुर्दशी',
    deityNameNepali: 'भगवान् रुद्र तथा महाकाल (Lord Shiva as Mahakaal)',
    deityTitle: 'अन्धकार र मृत्युका संहारक त्रिनेत्री महादेव',
    symbol: '🕉️',
    colorScheme: 'from-purple-900 via-stone-900 to-black',
    imageUrl: '/assets/festivals/maha_shivaratri.jpg',
    description: 'ज्योतिर्लिङ्ग स्वरूप, भस्मले सजिएका, नागमाला र त्रिशूलधारी देवाधिदेव महादेव।'
  },
  15: {
    tithiNumber: 15,
    tithiName: 'पूर्णिमा / औँसी',
    deityNameNepali: 'चन्द्रदेव तथा सत्यनारायण (पूर्णिमा) / सर्वपितृ तथा सूर्य-चन्द्र (औँसी)',
    deityTitle: 'अमृतमयी चन्द्रमा, सत्यनारायण प्रभु तथा पितृलोकका देवता',
    symbol: '🌕',
    colorScheme: 'from-amber-500 via-yellow-600 to-amber-700',
    imageUrl: '/assets/festivals/janai_purnima.jpg',
    description: 'शीतल अमृत वर्षा गर्ने चन्द्रमण्डल, शतानन्द पूजित श्री सत्यनारायण तथा तृप्त पितृगण।'
  }
};

// नेपाली मौलिक चाडपर्वहरूको सांस्कृतिक परम्परा तथा चित्रावली
export const NEPALI_FESTIVALS_ART_DATABASE: Record<string, NepaliFestivalArtInfo> = {
  dashain_ghatasthapana: {
    code: 'dashain_ghatasthapana',
    festivalName: 'बडादशैँ / घटस्थापना (जमरा राख्ने दिन)',
    celebrationTypeNepali: 'नेपाली घर-घरमा पूजा कोठामा कलश स्थापना र जौको जमरा रोपण',
    traditionalElements: ['जौको जमरा', 'तामाको कलश', 'दियो', 'माटोको वेदी', 'शङ्ख', 'दुर्गासप्तशती पाठ'],
    imageUrl: '/assets/festivals/dashain_ghatasthapana.jpg',
    accentColor: 'border-red-600',
    description: 'शुद्ध गोबरले लिपेको पूजा कोठामा पवित्र माटो र बालुवा बिछ्याएर कलशमा पञ्चपल्लव, जल र नरिवल स्थापना गरी हरियो जमरा उमार्ने मौलिक नेपाली परम्परा।'
  },
  dashain_vijayadashami: {
    code: 'dashain_vijayadashami',
    festivalName: 'विजयादशमी (बडादशैँको मुख्य टीका)',
    celebrationTypeNepali: 'मान्यजनबाट रातो अक्षताको टीका र पहेँलो जमरा लगाई आशीर्वाद ग्रहण',
    traditionalElements: ['रातो अक्षताको टीका', 'पहेँलो जमरा', 'दौरा-सुरुवाल', 'ढाका टोपी', 'दक्षिणा', 'दशैं पिङ'],
    imageUrl: '/assets/festivals/dashain_vijayadashami.jpg',
    accentColor: 'border-red-600',
    description: 'नेपाली परिवारमा ज्येष्ठ सदस्यहरूको हातबाट निधारभरि रातो टीका र कानमा जमरा सिउरेर दीर्घायुको आशीर्वाद लिने नेपालीहरूको सबैभन्दा महान् सांस्कृतिक उत्सव।'
  },
  tihar_deepawali: {
    code: 'tihar_deepawali',
    festivalName: 'यमपञ्चक तिहार तथा लक्ष्मीपूजा',
    celebrationTypeNepali: 'झिलिमिली दियो, सयपत्री माला, रङ्गोली र माता महालक्ष्मीको भव्य स्वागत',
    traditionalElements: ['सयपत्री माला', 'माटोको दियो', 'रङ्गोली', 'सेलरोटी', 'भैलो गीत', 'लक्ष्मी पदचिन्ह'],
    imageUrl: '/assets/festivals/tihar_deepawali.jpg',
    accentColor: 'border-amber-500',
    description: 'सयपत्री र मखमलीको बास्ना, ढोकादेखि पूजा कोठासम्म लक्ष्मीको पाइला, रातो माटोको लिपाई र झिलिमिली दीपमा सेलरोटी पकाई लक्ष्मी आराधना गर्ने मौलिक तिहार।'
  },
  tihar_bhaatika: {
    code: 'tihar_bhaatika',
    festivalName: 'भाइटीका (यमद्वितीया)',
    celebrationTypeNepali: 'दिदीबहिनीद्वारा दाजुभाइलाई सप्तरङ्गी टीका, मखमली माला र ओखर फुटाउने विधि',
    traditionalElements: ['सप्तरङ्गी टीका', 'मखमली माला', 'सयपत्री माला', 'ओखर', 'भाइमसला', 'ढाका टोपी'],
    imageUrl: '/assets/festivals/tihar_bhaatika.jpg',
    accentColor: 'border-purple-600',
    description: 'तेलको घेरा हालेर अकाल मृत्यु छेक्ने, ओखर फुटाएर यमदूतको बाटो रोक्ने, ललाटमा सात रङ्गको टीका र कहिल्यै नओइलाउने मखमली माला लगाइदिने आत्मीय पर्व।'
  },
  chhath_parva: {
    code: 'chhath_parva',
    festivalName: 'महापर्व छठ (सूर्य षष्ठी)',
    celebrationTypeNepali: 'पवित्र नदी/पोखरीमा उभिएर अस्ताउँदो र उदाउँदो सूर्यदेवलाई अर्घ्य दान',
    traditionalElements: ['बाँसको सूप/ढाकी', 'ठेकुवा', 'भुसुवा', 'उखु', 'केराको घारी', 'माटोको हात्ती दियो'],
    imageUrl: '/assets/festivals/chhath_parva.jpg',
    accentColor: 'border-amber-600',
    description: 'मधेश र तराईका पवित्र नदी र सरोवर किनारमा कम्मरसम्म पानीमा उभिएर बाँसको सूपमा ठेकुवा र फलफूल लिई सूर्य र छठि मातालाई साष्टाङ्ग प्रणाम गर्ने महापर्व।'
  },
  maha_shivaratri: {
    code: 'maha_shivaratri',
    festivalName: 'महाशिवरात्रि (पशुपतिनाथ महाकुम्भ)',
    celebrationTypeNepali: 'पशुपतिनाथ मन्दिरमा चार प्रहर पूजा, अखण्ड दीप, धुनी र शिव भजन',
    traditionalElements: ['पशुपतिनाथ मन्दिर', 'धुनी (पवित्र अग्नि)', 'बेलपत्र', 'धतुरो', 'रुद्राभिषेक', 'साधु-सन्त दर्शन'],
    imageUrl: '/assets/festivals/maha_shivaratri.jpg',
    accentColor: 'border-cyan-600',
    description: 'काठमाडौँको पावन पशुपतिनाथमा देश-विदेशका लाखौं श्रद्धालु भक्तजनहरूले रातभर जाग्राम बसी चार प्रहरको दूध, दही, घिउ र महले भगवान् शिवको अभिषेक गर्ने महातिथि।'
  },
  haritalika_teej: {
    code: 'haritalika_teej',
    festivalName: 'हरितालिका तीज तथा ऋषि पञ्चमी',
    celebrationTypeNepali: 'रातो साडी, पोते, तिलहरीमा सजिएर दर खाने, निराहार व्रत बस्ने र शिव आराधना',
    traditionalElements: ['रातो साडी', 'हरियो पोते', 'तिलहरी', 'तीज गीत र नृत्य', 'बालुवाको शिवलिङ्ग', 'दतिउन दातुन'],
    imageUrl: '/assets/festivals/haritalika_teej.jpg',
    accentColor: 'border-rose-600',
    description: 'नेपाली चेलीबेटीहरू माइतीघरमा जम्मा भई दर खाने, आफ्ना सुख-दुःख गीतमार्फत गाउने र भगवान् शिव-पार्वतीको बालुवाको लिङ्ग बनाई अखण्ड सौभाग्यको कामना गर्ने पर्व।'
  },
  janai_purnima: {
    code: 'janai_purnima',
    festivalName: 'जनैपूर्णिमा, रक्षाबन्धन तथा क्वाँटी खाने दिन',
    celebrationTypeNepali: 'पवित्र तीर्थमा ऋषितर्पणी स्नान, नयाँ जनै फेर्ने, रक्षासूत्र बाँध्ने र क्वाँटी भोजन',
    traditionalElements: ['पवित्र जनै (यज्ञोपवीत)', 'रक्षाबन्धन डोरो', '९ थरी गेडागुडीको क्वाँटी', 'कुम्भेश्वर कुण्ड', 'सप्तर्षि तर्पण'],
    imageUrl: '/assets/festivals/janai_purnima.jpg',
    accentColor: 'border-orange-600',
    description: 'पाटनको कुम्भेश्वर वा गोसाइँकुण्डमा स्नान गरी वैदिक मन्त्रसहित गुरु-पुरोहितबाट रक्षासूत्र बाँध्ने, नयाँ जनै धारण गर्ने र टुसा उम्रेको तातो क्वाँटी खाने मौलिक परम्परा।'
  },
  maghe_sankranti: {
    code: 'maghe_sankranti',
    festivalName: 'माघे संक्रान्ति (मकर संक्रान्ति)',
    celebrationTypeNepali: 'देवघाट/रिडी संगम स्नान, घिउ-चाकु-तरुल-तिलको लड्डु खाने र न्यानो बाँड्ने दिन',
    traditionalElements: ['घिउ र चाकु', 'तिलको लड्डु', 'तरुल र सखरखण्ड', 'खिचडी', 'त्रिवेणी संगम स्नान', 'थारु माघी'],
    imageUrl: '/assets/festivals/maghe_sankranti.jpg',
    accentColor: 'border-amber-700',
    description: 'सूर्य उत्तरायण हुने दिन देवघाट तथा रिडीमा मकर स्नान गरी काँसको थालीमा घिउ, चाकु, उसिनेको तरुल, तिलको लड्डु र खिचडी परिवारसहित बाँडेर खाने जाडो भगाउने पर्व।'
  },
  fagu_purnima_holi: {
    code: 'fagu_purnima_holi',
    festivalName: 'फागु पूर्णिमा (होली पर्व)',
    celebrationTypeNepali: 'वसन्तपुरमा चीर ठड्याउने, प्राकृतिक अबीर र रङ्ग दलेर सद्भाव साटासाट',
    traditionalElements: ['वसन्तपुरको चीर', 'रातो अबीर', 'पिचकारी', 'होली गीत', 'मालपुवा', 'भ्रातृत्व'],
    imageUrl: '/assets/festivals/fagu_purnima_holi.jpg',
    accentColor: 'border-pink-600',
    description: 'काठमाडौँको वसन्तपुर दरबार स्क्वायरमा रङ्गीबिरङ्गी चीर ठड्याएर सुरु हुने, पहाड र तराईमा आपसी मनमुटाव बिर्सेर अबीर दली वसन्तको स्वागत गर्ने रङ्गहरूको उत्सव।'
  },
  shree_krishna_janmashtami: {
    code: 'shree_krishna_janmashtami',
    festivalName: 'श्रीकृष्ण जन्माष्टमी',
    celebrationTypeNepali: 'पाटन कृष्ण मन्दिरमा मेला, बालगोपालको झुला, मध्यरात जन्मोत्सव र भजन-कीर्तन',
    traditionalElements: ['पाटनको कृष्ण मन्दिर', 'बालगोपालको झुला', 'माखन-मिश्री', 'काँक्राको चिरा', 'रोहिणी नक्षत्र मध्यरात आरती'],
    imageUrl: '/assets/festivals/shree_krishna_janmashtami.jpg',
    accentColor: 'border-blue-600',
    description: 'ललितपुर पाटनको प्रख्यात १६ औं शताब्दीको प्रस्तर कृष्ण मन्दिरमा मध्यरात १२ बजे शङ्ख-घण्ट बजाई बालगोपाललाई झुलामा झुलाएर कृष्ण जन्मोत्सव मनाउने दिन।'
  },
  bibaha_panchami: {
    code: 'bibaha_panchami',
    festivalName: 'विवाह पञ्चमी (राम-जानकी विवाह महोत्सव)',
    celebrationTypeNepali: 'जनकपुरधाम जानकी मन्दिरमा राम-सीताको भव्य वैवाहिक शोभायात्रा, स्वयंवर र डोली',
    traditionalElements: ['जानकी मन्दिर जनकपुरधाम', 'राम-जानकी डोली', 'मटकोर र स्वयंवर', 'मिथिला मण्डप', 'विवाह गीत'],
    imageUrl: '/assets/festivals/bibaha_panchami.jpg',
    accentColor: 'border-amber-600',
    description: 'जनकपुरधामको विशाल जानकी मन्दिर र रङ्गभूमि मैदानमा अयोध्याबाट आएका जन्तीको स्वागत गरी विधिपूर्वक राम-सीताको शुभ विवाह महोत्सव मनाउने ऐतिहासिक पर्व।'
  }
};

/**
 * Returns the Deity Portrait for a given Tithi Number (1 to 15)
 */
export function getDeityPortraitForTithi(tithiNum: number): DeityPortraitInfo {
  const safeNum = tithiNum >= 1 && tithiNum <= 15 ? tithiNum : 1;
  return DEITY_PORTRAITS_DATABASE[safeNum] || DEITY_PORTRAITS_DATABASE[1];
}

/**
 * Returns the Nepali Festival Art Info for a festival code
 */
export function getNepaliFestivalArt(code: string): NepaliFestivalArtInfo | null {
  return NEPALI_FESTIVALS_ART_DATABASE[code] || null;
}
