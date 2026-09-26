/**
 * विवाह मञ्च (Matrimonial Portal) - गोत्र, जात/समुदाय, र धर्मको प्रामाणिक नेपाली सूची
 */

export interface GotraOption {
  value: string;
  labelNepali: string;
  rishi: string;
  exampleSurnames?: string;
}

export interface CasteOption {
  value: string;
  labelNepali: string;
  category: 'Khas/Arya' | 'Newar' | 'Janajati' | 'Madhesi/Tarai' | 'Dalit' | 'Other';
}

export interface ReligionOption {
  value: string;
  labelNepali: string;
}

// १. प्रामाणिक वैदिक तथा नेपाली गोत्रहरूको सूची
export const NEPALI_GOTRAS: GotraOption[] = [
  { value: 'कश्यप', labelNepali: 'कश्यप (Kashyap)', rishi: 'कश्यप ऋषि', exampleSurnames: 'अधिकारी, शाह, शाही, मिश्र, घिमिरे, रायमाझी' },
  { value: 'भारद्वाज', labelNepali: 'भारद्वाज (Bharadwaj)', rishi: 'भारद्वाज ऋषि', exampleSurnames: 'सुवेदी, पन्त, चौलागाईं, सिलवाल, सिटौला, थपलिया' },
  { value: 'वशिष्ठ', labelNepali: 'वशिष्ठ (Vashistha)', rishi: 'वशिष्ठ ऋषि', exampleSurnames: 'भट्टराई, खरेल, दवाडी, सुवेदी, चालिसे, मुडभरी' },
  { value: 'कौशिक', labelNepali: 'कौशिक / विश्वामित्र (Kaushik)', rishi: 'विश्वामित्र ऋषि', exampleSurnames: 'रेग्मी, खतिवडा, बिष्ट, धिताल, तिवारी' },
  { value: 'गौतम', labelNepali: 'गौतम (Gautam)', rishi: 'गौतम ऋषि', exampleSurnames: 'त्रिपाठी, चन्द, जोशी, दङ्गाल, सञ्जेल' },
  { value: 'जमदग्नि', labelNepali: 'जमदग्नि (Jamadagni)', rishi: 'जमदग्नि ऋषि', exampleSurnames: 'पोखरेल, सेढाईं' },
  { value: 'अत्रि', labelNepali: 'अत्रि (Atri)', rishi: 'अत्रि ऋषि', exampleSurnames: 'चापागाईं, वस्ती, खतिवडा, ओझा' },
  { value: 'अगस्ति', labelNepali: 'अगस्ति (Agasti)', rishi: 'अगस्त्य ऋषि', exampleSurnames: 'ढुङ्गेल' },
  { value: 'गर्ग', labelNepali: 'गर्ग (Garga)', rishi: 'गर्ग ऋषि', exampleSurnames: 'बास्तोला, लामिछाने, गजुरेल, भुर्तेल, पन्त' },
  { value: 'कौडिन्य', labelNepali: 'कौडिन्य (Kaundinya)', rishi: 'कौडिन्य ऋषि', exampleSurnames: 'खनाल, आचार्य, सापकोटा, प्याकुरेल, सत्याल' },
  { value: 'उपमन्यु', labelNepali: 'उपमन्यु (Upamanyu)', rishi: 'उपमन्यु ऋषि', exampleSurnames: 'मैनाली, ढकाल, बगाले थापा' },
  { value: 'शाण्डिल्य', labelNepali: 'शाण्डिल्य (Shandilya)', rishi: 'शाण्डिल्य ऋषि', exampleSurnames: 'प्रसाईं, काफ्ले, महत' },
  { value: 'पराशर', labelNepali: 'पराशर (Parashar)', rishi: 'पराशर ऋषि', exampleSurnames: 'मरहट्टा, कट्टेल, लामा (नेवार)' },
  { value: 'आत्रेय', labelNepali: 'आत्रेय (Aatreya)', rishi: 'आत्रेय ऋषि', exampleSurnames: 'पौडेल, दुलाल, सिग्देल, अर्याल' },
  { value: 'धनञ्जय', labelNepali: 'धनञ्जय (Dhananjaya)', rishi: 'धनञ्जय ऋषि', exampleSurnames: 'रिजाल, बस्याल, गुरागाईं, हुमागाईं' },
  { value: 'माण्डव्य', labelNepali: 'माण्डव्य (Mandavya)', rishi: 'माण्डव्य ऋषि', exampleSurnames: 'बजगाईं, पनेरू' },
  { value: 'मौद्गल्य', labelNepali: 'मौद्गल्य (Moudgalya)', rishi: 'मौद्गल्य ऋषि', exampleSurnames: 'कोइराला, कुइँकेल, सिम्खडा' },
  { value: 'वत्स', labelNepali: 'वत्स (Vatsa)', rishi: 'वत्स ऋषि', exampleSurnames: 'लम्साल, राणा, कुँवर' },
  { value: 'घृतकौशिक', labelNepali: 'घृतकौशिक (Ghritakaushik)', rishi: 'घृतकौशिक ऋषि', exampleSurnames: 'बराल, नेपाल, पण्डित, खनाल' },
  { value: 'हरितास', labelNepali: 'हरितास (Haritasa)', rishi: 'हरितास ऋषि', exampleSurnames: 'न्यौपाने' },
  { value: 'शौनक', labelNepali: 'शौनक (Shaunaka)', rishi: 'शौनक ऋषि', exampleSurnames: 'भुसाल' },
  { value: 'कपिल', labelNepali: 'कपिल (Kapila)', rishi: 'कपिल ऋषि', exampleSurnames: 'खड्का' },
  { value: 'बाभ्रव्य', labelNepali: 'बाभ्रव्य (Babhravya)', rishi: 'बाभ्रव्य ऋषि', exampleSurnames: 'बाग' },
  { value: 'विष्णुवृद्ध', labelNepali: 'विष्णुवृद्ध (Vishnuvriddha)', rishi: 'विष्णुवृद्ध ऋषि' },
  { value: 'अन्य / थाहा नभएको', labelNepali: 'अन्य / थाहा नभएको (Other / Not sure)', rishi: 'अन्य' }
];

// २. जात तथा समुदाय (Caste / Community) सूची
export const NEPALI_CASTES: CasteOption[] = [
  // खस / आर्य
  { value: 'ब्राह्मण (पर्वते)', labelNepali: 'ब्राह्मण / बाहुन (पर्वते - उपाध्याय/जैसी)', category: 'Khas/Arya' },
  { value: 'क्षेत्री', labelNepali: 'क्षेत्री (थापा, बस्नेत, कार्की, खड्का, बिष्ट, भण्डारी, कुँवर आदि)', category: 'Khas/Arya' },
  { value: 'ठकुरी', labelNepali: 'ठकुरी (शाह, शाही, चन्द, सिंह, सेन, मल्ल, हमाल आदि)', category: 'Khas/Arya' },
  { value: 'सन्न्यासी / दशनामी', labelNepali: 'सन्न्यासी / दशनामी (गिरी, पुरी, भारती, वन आदि)', category: 'Khas/Arya' },

  // नेवार समुदाय
  { value: 'नेवार (श्रेष्ठ)', labelNepali: 'नेवार - श्रेष्ठ (Shrestha)', category: 'Newar' },
  { value: 'नेवार (प्रधान)', labelNepali: 'नेवार - प्रधान (Pradhan)', category: 'Newar' },
  { value: 'नेवार (जोशी)', labelNepali: 'नेवार - जोशी (Joshi)', category: 'Newar' },
  { value: 'नेवार (राजोपाध्याय/झा)', labelNepali: 'नेवार - राजोपाध्याय / द्यभाजु / झा (Rajopadhyaya)', category: 'Newar' },
  { value: 'नेवार (शाक्य/बज्राचार्य)', labelNepali: 'नेवार - शाक्य / बज्राचार्य (Shakya / Bajracharya)', category: 'Newar' },
  { value: 'नेवार (महर्जन/ज्यापू)', labelNepali: 'नेवार - महर्जन / डङ्गोल / ज्यापू (Maharjan / Jyapu)', category: 'Newar' },
  { value: 'नेवार (तुलाधर/कंसाकार/उदास)', labelNepali: 'नेवार - तुलाधर / कंसाकार / ताम्राकार / उदास', category: 'Newar' },
  { value: 'नेवार (मानन्धर/सायमी)', labelNepali: 'नेवार - मानन्धर (Manandhar)', category: 'Newar' },
  { value: 'नेवार (अन्य)', labelNepali: 'नेवार - अन्य थर (Other Newar)', category: 'Newar' },

  // जनजाति तथा आदिवासी
  { value: 'मगर', labelNepali: 'मगर (थापा, राना, पुन, बुढाथोकी, रोकामगर, आले आदि)', category: 'Janajati' },
  { value: 'गुरुङ', labelNepali: 'गुरुङ (तमु - घले, लामा, घोताने आदि)', category: 'Janajati' },
  { value: 'तामाङ', labelNepali: 'तामाङ (मोक्तान, योन्जन, ब्लोन, पाख्रिन, जिम्बा आदि)', category: 'Janajati' },
  { value: 'राई', labelNepali: 'राई (चाम्लिङ, बान्तवा, कुलुङ, थुलुङ, साम्पाङ आदि)', category: 'Janajati' },
  { value: 'लिम्बू', labelNepali: 'लिम्बू (याक्थुङ - लिङ्देन, आङ्देम्बे, तुम्बाहाङ्फे आदि)', category: 'Janajati' },
  { value: 'शेर्पा', labelNepali: 'शेर्पा (Sherpa)', category: 'Janajati' },
  { value: 'कुमाल', labelNepali: 'कुमाल (Kumal)', category: 'Janajati' },
  { value: 'दनुवार / माझी / बोटे', labelNepali: 'दनुवार / माझी / बोटे', category: 'Janajati' },
  { value: 'चेपाङ / थामी', labelNepali: 'चेपाङ / थामी', category: 'Janajati' },

  // मधेश / तराई समुदाय
  { value: 'थारू', labelNepali: 'थारू (चौधरी, महतो, गच्छदार आदि)', category: 'Madhesi/Tarai' },
  { value: 'यादव', labelNepali: 'यादव (Yadav / राय)', category: 'Madhesi/Tarai' },
  { value: 'ब्राह्मण (मैथिल/तराई)', labelNepali: 'ब्राह्मण (मैथिल / भोजपुरी / झा / मिश्र)', category: 'Madhesi/Tarai' },
  { value: 'राजपूत', labelNepali: 'राजपूत (Rajput)', category: 'Madhesi/Tarai' },
  { value: 'तेली / साह / गुप्ता', labelNepali: 'वैश्य / तेली / साह / गुप्ता / बनिया', category: 'Madhesi/Tarai' },
  { value: 'कायस्थ / कर्ण', labelNepali: 'कायस्थ / कर्ण (Kayastha)', category: 'Madhesi/Tarai' },
  { value: 'राजवंशी', labelNepali: 'राजवंशी / कोचे', category: 'Madhesi/Tarai' },
  { value: 'कुर्मी / कुशवाहा', labelNepali: 'कुर्मी / कुशवाहा / कोईरी', category: 'Madhesi/Tarai' },
  { value: 'मुस्लिम (नेपाली)', labelNepali: 'मुस्लिम (Nepali Muslim)', category: 'Madhesi/Tarai' },

  // शिल्पी तथा दलित समुदाय
  { value: 'विश्वकर्मा (कामी)', labelNepali: 'विश्वकर्मा / विक (गजमेर, रसाइली, लोहार आदि)', category: 'Dalit' },
  { value: 'परियार (दमाई)', labelNepali: 'परियार (दर्जी, नेपाली, सुन्दास आदि)', category: 'Dalit' },
  { value: 'मिजार (सार्की)', labelNepali: 'मिजार (रोक्का, नेपाली, अछामी आदि)', category: 'Dalit' },
  { value: 'तराई दलित (चमार/पासवान/धोबी)', labelNepali: 'तराई दलित (चमार / पासवान / धोबी / मुसहर)', category: 'Dalit' },

  // अन्य समुदाय
  { value: 'मारवाडी', labelNepali: 'मारवाडी (अग्रवाल, गोयनका, मित्तल, जैन आदि)', category: 'Other' },
  { value: 'अन्य समुदाय', labelNepali: 'अन्य समुदाय (Other Community)', category: 'Other' }
];

// ३. धर्म (Religion) सूची
export const NEPALI_RELIGIONS: ReligionOption[] = [
  { value: 'हिन्दू (Hindu)', labelNepali: 'हिन्दू (Hindu) - वैदिक सनातन' },
  { value: 'बौद्ध (Buddhist)', labelNepali: 'बौद्ध (Buddhist)' },
  { value: 'किराँत (Kirat)', labelNepali: 'किराँत (Kirat) - मुन्धुम' },
  { value: 'प्रकृतिपूजक / बोन', labelNepali: 'प्रकृतिपूजक / बोन (Bon / Nature)' },
  { value: 'जैन (Jain)', labelNepali: 'जैन (Jain)' },
  { value: 'शिख (Sikh)', labelNepali: 'शिख (Sikh)' },
  { value: 'इसाई (Christian)', labelNepali: 'इसाई (Christian)' },
  { value: 'इस्लाम (Islam)', labelNepali: 'इस्लाम (Islam)' },
  { value: 'अन्य (Other)', labelNepali: 'अन्य (Other)' }
];

// ४. पिताको पेशा (Father's Occupation) सूची
export const NEPALI_FATHER_OCCUPATIONS: string[] = [
  'निजामती / सरकारी सेवा (Civil Service / Govt Officer)',
  'व्यापार / व्यवसाय (Business / Entrepreneur)',
  'प्राध्यापक / शिक्षक (Professor / Teacher)',
  'डाक्टर / स्वास्थ्यकर्मी (Doctor / Medical)',
  'इन्जिनियर / प्राविधिक (Engineer / Technical)',
  'बैङ्किङ तथा वित्तीय सेवा (Banking / Finance)',
  'नेपाल सेना / प्रहरी (Nepal Army / Police Force)',
  'पूर्व सरकारी कर्मचारी / सेवानिवृत्त (Ex-Govt / Retired)',
  'कृषि / जमिनदार (Agriculture / Farmer)',
  'धार्मिक / पुरोहित / ज्योतिष सेवा (Priesthood / Astrologer)',
  'निजी क्षेत्र / म्यानेजर (Private Sector Executive)',
  'कानून व्यवसायी / अधिवक्ता (Lawyer / Advocate)',
  'पत्रकारिता / सञ्चार (Media / Journalism)',
  'वैदेशिक रोजगार / कन्सल्ट्यान्सी (Foreign Employment / Business)',
  'दिवङ्गत (Late / Deceased)',
  'अन्य (Other)'
];

// ५. माताको पेशा (Mother's Occupation) सूची
export const NEPALI_MOTHER_OCCUPATIONS: string[] = [
  'गृहणी (Homemaker)',
  'शिक्षिका / प्राध्यापक (Teacher / Professor)',
  'निजामती / सरकारी सेवा (Govt Civil Service)',
  'व्यापार / व्यवसाय (Business / Entrepreneur)',
  'डाक्टर / नर्स / स्वास्थ्यकर्मी (Doctor / Nurse / Health)',
  'बैङ्किङ तथा वित्तीय क्षेत्र (Banking / Finance)',
  'सामाजिक सेवा / संस्था (Social Worker / NGO)',
  'कृषि (Agriculture / Farming)',
  'पूर्व सरकारी कर्मचारी / सेवानिवृत्त (Retired)',
  'दिवङ्गत (Late / Deceased)',
  'अन्य (Other)'
];

// ६. उच्चतम शिक्षा (Education) सूची
export const NEPALI_EDUCATIONS: string[] = [
  'विधावारिधि (Ph.D. / Doctorate)',
  'चिकित्सा शिक्षा (MBBS / MD / MS / BDS)',
  'इन्जिनियरिङ (B.E. / B.Tech / M.E. / M.Tech)',
  'स्नातकोत्तर (Master - MBA / MBS / MA / M.Sc. / M.Com)',
  'चार्टर्ड एकाउन्टेन्ट (CA / ACCA / CFA)',
  'कानून (BALLB / LLM)',
  'स्नातक (Bachelor - BBA / BBS / BA / B.Sc. / BCA / BIT)',
  'नर्सिङ तथा प्यारामेडिकल (B.Sc. Nursing / B.Pharma / Public Health)',
  'पाइलट / उड्डयन (Commercial Pilot / Aviation)',
  'डिप्लोमा / प्राविधिक (Diploma / CTEVT / Polytechnic)',
  'उच्च माध्यमिक (+2 / Intermediate / A-Levels)',
  'अन्य शिक्षा (Other Degree)'
];

// ७. पेशा / पद (Occupation) सूची
export const NEPALI_OCCUPATIONS: string[] = [
  'सफ्टवेयर / आइटी इन्जिनियर (Software Engineer / Tech Lead)',
  'चिकित्सक / डाक्टर (Medical Doctor / Specialist)',
  'निजामती अधिकृत / सरकारी सेवा (Govt Civil Service Officer)',
  'बैङ्कर / वित्तीय विश्लेषक (Banker / CA / Finance)',
  'इन्जिनियर (Civil / Electrical / Mechanical)',
  'प्राध्यापक / कलेज लेक्चरर (Professor / Lecturer)',
  'शिक्षक / शिक्षिका (School Teacher)',
  'व्यवसायी / उद्यमी (Business Owner / Entrepreneur)',
  'नर्सिङ / स्वास्थ्यकर्मी (Nursing Officer / Healthcare)',
  'नेपाल सेना / सशस्त्र / प्रहरी अधिकृत (Officer / Armed Forces)',
  'पाइलट / एभिएसन (Airline Pilot / Aviation Crew)',
  'अधिवक्ता / कानून व्यवसायी (Advocate / Legal Professional)',
  'पत्रकार / सञ्चारकर्मी (Journalist / Media Professional)',
  'अनुसन्धानकर्ता / वैज्ञानिक (Researcher / Scientist)',
  'वैदेशिक रोजगार / PR धारक (Working Abroad / PR Holder)',
  'वास्तु तथा ज्योतिष परामर्शदाता (Vedic Astrologer / Consultant)',
  'स्वतन्त्र व्यवसायी (Freelancer / Consultant)',
  'उच्च अध्ययनरत (Currently Pursuing Higher Studies)',
  'अन्य पेशा (Other Profession)'
];

// ८. मासिक आम्दानी दायरा (Monthly Income Range) सूची
export const NEPALI_INCOME_RANGES: string[] = [
  'रु ३५,००० सम्म (Up to NPR 35K)',
  'रु ३५,००० - रु ५०,००० (NPR 35K - 50K)',
  'रु ५०,००० - रु ७५,००० (NPR 50K - 75K)',
  'रु ७५,००० - रु १,००,००० (NPR 75K - 1 Lakh)',
  'रु १,००,००० - रु १,५०,००० (NPR 1 Lakh - 1.5 Lakh)',
  'रु १,५०,००० - रु २,००,००० (NPR 1.5 Lakh - 2 Lakh)',
  'रु २,००,००० - रु ३,००,००० (NPR 2 Lakh - 3 Lakh)',
  'रु ३,००,००० भन्दा माथि (NPR 3 Lakh+)',
  'वैदेशिक आम्दानी (Foreign Income - USD / AUD / CAD / EUR / AED)',
  'गोप्य / खुलाउन नचाहेको (Prefer Not to Disclose)'
];


