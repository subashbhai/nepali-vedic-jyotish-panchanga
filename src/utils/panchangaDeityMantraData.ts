// Comprehensive Vedic Deity, Mantra and Classical Shloka Knowledge Base
// For Panchanga's 5 Limbs: Tithi, Vara, Nakshatra, Yoga, Karana

export interface DeityMantraInfo {
  deity: string;
  image: string;
  mantra: string;
  shloka: string;
  blessingMeaning: string;
}

// --------------------------------------------------------------------------
// 1. TITHI DEITIES, MANTRAS & SHLOKAS (१ देखि १५ र ३० औंसी)
// --------------------------------------------------------------------------
export const TITHI_DEITY_MANTRA_MAP: Record<number, DeityMantraInfo> = {
  1: {
    deity: 'भगवान् अग्निदेव',
    image: '/assets/deities/sunday_surya.jpg',
    mantra: 'ॐ अग्नये नमः',
    shloka: 'अग्निः पातु सदा नित्यं प्रतिपत्सु शुभप्रदः।',
    blessingMeaning: 'आनन्द, तेज, उत्साह र नवीन आरम्भ सिद्धि'
  },
  2: {
    deity: 'भगवान् श्रीब्रह्मा',
    image: '/assets/deities/brahma.jpg',
    mantra: 'ॐ ब्रह्मणे नमः',
    shloka: 'द्वितीयायां भवेत् सिद्धिः सर्वविद्या प्रवर्धिनी।',
    blessingMeaning: 'स्थिरता, विद्या, विवेक र सृजनशीलता'
  },
  3: {
    deity: 'माता गौरी / श्रीगणेश',
    image: '/assets/deities/ganesha.jpg',
    mantra: 'ॐ गौर्यै नमः • ॐ गं गणपतये नमः',
    shloka: 'तृतीयायां गौरीपूजा सौभाग्यारोग्यदायिनी।',
    blessingMeaning: 'विजय, सौभाग्य, ऐश्वर्य र विघ्ननाश'
  },
  4: {
    deity: 'विघ्नहर्ता श्रीगणेश',
    image: '/assets/deities/ganesha.jpg',
    mantra: 'ॐ श्रीगणेशाय नमः',
    shloka: 'विघ्नेश्वरो वरं दद्यात् चतुर्थ्यां कार्यसिद्धये।',
    blessingMeaning: 'संकटनाश, बुद्धिबल र कार्यसिद्धि'
  },
  5: {
    deity: 'नागराज / सोमदेव',
    image: '/assets/deities/monday_shiva.jpg',
    mantra: 'ॐ नवकुलाय नागराजाय नमः',
    shloka: 'पञ्चम्यां नागपूजा स्यात् सर्पदोषविनाशिनी।',
    blessingMeaning: 'सर्वसिद्धि, वंशरक्षा र पौष्टिक कर्म'
  },
  6: {
    deity: 'भगवान् कार्तिकेय (कुमार)',
    image: '/assets/deities/tuesday_hanuman.jpg',
    mantra: 'ॐ षण्मुखाय नमः',
    shloka: 'कार्तिकेयः प्रसीदतु षष्ठ्यां यशोविवर्धनः।',
    blessingMeaning: 'यश, कीर्ति, पराक्रम र आरोग्य'
  },
  7: {
    deity: 'भगवान् सूर्यदेव',
    image: '/assets/deities/sunday_surya.jpg',
    mantra: 'ॐ घृणिः सूर्याय नमः',
    shloka: 'सप्तम्यां भास्करो देवः सर्वव्याधिविनाशनः।',
    blessingMeaning: 'आरोग्य, पद-प्रतिष्ठा र आत्मबल'
  },
  8: {
    deity: 'माता दुर्गा / भगवान् शिव',
    image: '/assets/deities/durga.jpg',
    mantra: 'ॐ दुं दुर्गायै नमः • ॐ नमः शिवाय',
    shloka: 'अष्टम्यां पूजिता दुर्गा सर्वशत्रुविमर्दिनी।',
    blessingMeaning: 'शक्ति सञ्चार, शत्रुनाश र धर्मलाभ'
  },
  9: {
    deity: 'माता चण्डिका दुर्गा',
    image: '/assets/deities/durga.jpg',
    mantra: 'ॐ ऐं ह्रीं क्लीं चामुण्डायै विच्चे',
    shloka: 'नवम्यां चण्डिका देवी सर्वविजयकारिणी।',
    blessingMeaning: 'सर्वविजय, सुरक्षा र कुलकल्याण'
  },
  10: {
    deity: 'भगवान् धर्मराज (यम)',
    image: '/assets/deities/yamaraj.jpg',
    mantra: 'ॐ यमाय धर्मराजाय नमः',
    shloka: 'दशम्यां धर्मवृद्धिः स्यात् सर्वपापप्रणाशिनी।',
    blessingMeaning: 'धर्मसिद्धि, सम्पूर्णता र सर्वपापनाश'
  },
  11: {
    deity: 'भगवान् श्रीहरि विष्णु',
    image: '/assets/deities/thursday_vishnu.jpg',
    mantra: 'ॐ नमो भगवते वासुदेवाय',
    shloka: 'एकादशी व्रतेन स्यात् सर्वपापक्षयो ध्रुवम्।',
    blessingMeaning: 'आध्यात्मिक उत्थान, तप र मोक्ष'
  },
  12: {
    deity: 'भगवान् श्रीविष्णु',
    image: '/assets/deities/thursday_vishnu.jpg',
    mantra: 'ॐ विष्णवे नमः',
    shloka: 'द्वादश्यां श्रीपतिः प्रीतो भुक्तिं मुक्तिं प्रयच्छति।',
    blessingMeaning: 'दानफल, शान्ति र समृद्धि'
  },
  13: {
    deity: 'भगवान् कामदेव / शिव',
    image: '/assets/deities/monday_shiva.jpg',
    mantra: 'ॐ कामदेवाय नमः • ॐ नमः शिवाय',
    shloka: 'त्रयोदश्यां शिवप्रीत्या सर्वशान्तिर्भविष्यति।',
    blessingMeaning: 'सौन्दर्य, मैत्री, शान्ति र विजय'
  },
  14: {
    deity: 'देवाधिदेव भगवान् शिव',
    image: '/assets/deities/monday_shiva.jpg',
    mantra: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्',
    shloka: 'चतुर्दश्यां शिवस्यार्चा सर्वदुःखहरा शुभा।',
    blessingMeaning: 'शिवकृपा, भयमुक्ति र रोगनिवारण'
  },
  15: {
    deity: 'भगवान् चन्द्रदेव / सत्यनारायण',
    image: '/assets/deities/thursday_vishnu.jpg',
    mantra: 'ॐ सों सोमाय नमः • ॐ श्रीसत्यनारायणाय नमः',
    shloka: 'पूर्णिमायां पूर्णफलदा सत्यनारायणप्रिया।',
    blessingMeaning: 'मनःशान्ति, सम्पूर्णता र समृद्धि'
  },
  30: {
    deity: 'पितृदेव / भगवान् यमराज',
    image: '/assets/deities/yamaraj.jpg',
    mantra: 'ॐ पितृगणाय विद्महे सर्वशान्तिं धीमहि',
    shloka: 'अमावस्यां पितृपूजा सर्वशान्तिकरी मता।',
    blessingMeaning: 'पितृतृप्ति, कुलशान्ति र आशीर्वाद'
  }
};

// --------------------------------------------------------------------------
// 2. VAAR DEITIES, MANTRAS & SHLOKAS (७ वार)
// --------------------------------------------------------------------------
export const VAAR_DEITY_MANTRA_MAP: Record<string, DeityMantraInfo> = {
  'आइतबार': {
    deity: 'भगवान् सूर्यदेव',
    image: '/assets/deities/sunday_surya.jpg',
    mantra: 'ॐ घृणिः सूर्याय नमः',
    shloka: 'जपाकुसुमसंकाशं काश्यपेयं महाद्युतिम्। तमोऽरिं सर्वपापघ्नं प्रणतोऽस्मि दिवाकरम्॥',
    blessingMeaning: 'प्रशासनिक यश, आरोग्य र आत्मबल'
  },
  'सोमबार': {
    deity: 'भगवान् शिव / चन्द्रदेव',
    image: '/assets/deities/monday_shiva.jpg',
    mantra: 'ॐ सोमाय नमः • ॐ नमः शिवाय',
    shloka: 'दधिशङ्खतुषाराभं क्षीरोदार्णवसम्भवम्। नमामि शशिनं सोमं शम्भोर्मुकुटभूषणम्॥',
    blessingMeaning: 'मानसिक शान्ति, शितलता र शिवकृपा'
  },
  'मंगलबार': {
    deity: 'श्रीहनुमान् / मङ्गलदेव',
    image: '/assets/deities/tuesday_hanuman.jpg',
    mantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
    shloka: 'धरणीगर्भसम्भूतं विद्युत्कान्तिसमप्रभम्। कुमारं शक्तिहस्तं च मङ्गलं प्रणमाम्यहम्॥',
    blessingMeaning: 'साहस, पराक्रम, ऋणमुक्ति र विजय'
  },
  'बुधबार': {
    deity: 'भगवान् श्रीकृष्ण / बुधदेव',
    image: '/assets/deities/wednesday_krishna.jpg',
    mantra: 'ॐ बुं बुधाय नमः',
    shloka: 'प्रियङ्गुकलिकाश्यामं रूपेणाप्रतिमं बुधम्। सौम्यं सौम्यगुणोपेतं तं बुधं प्रणमाम्यहम्॥',
    blessingMeaning: 'बुद्धि, व्यापार, वाणी र विवेक'
  },
  'बिहीबार': {
    deity: 'देवगुरु बृहस्पति / श्रीहरि',
    image: '/assets/deities/thursday_vishnu.jpg',
    mantra: 'ॐ बृं बृहस्पतये नमः',
    shloka: 'देवानां च ऋषीणां च गुरुं काञ्चनसंनिभम्। बुद्धिभूतं त्रिलोकेशं तं नमामि बृहस्पतिम्॥',
    blessingMeaning: 'ज्ञान, धर्म, विवाहवार्ता र सन्तानसुख'
  },
  'शुक्रबार': {
    deity: 'माता महालक्ष्मी / शुक्रदेव',
    image: '/assets/deities/friday_lakshmi.jpg',
    mantra: 'ॐ शुं शुक्राय नमः • ॐ श्रीं महालक्ष्म्यै नमः',
    shloka: 'हिमकुन्दमृणालाभं दैत्यानां परमं गुरुम्। सर्वशास्त्रप्रवक्तारं भार्गवं प्रणमाम्यहम्॥',
    blessingMeaning: 'ऐश्वर्य, सौन्दर्य, धनलाभ र सुख'
  },
  'शनिबार': {
    deity: 'न्यायाधीश शनिदेव',
    image: '/assets/deities/saturday_shani.jpg',
    mantra: 'ॐ शं शनैश्चराय नमः',
    shloka: 'नीलाञ्जनसमाभासं रविपुत्रं यमाग्रजम्। छायामार्तण्डसम्भूतं तं नमामि शनैश्चरम्॥',
    blessingMeaning: 'कर्मशुद्धि, न्याय, सेवा र बाधाशान्ति'
  }
};

// --------------------------------------------------------------------------
// 3. NAKSHATRA DEITIES, MANTRAS & SHLOKAS (२७ नक्षत्र)
// --------------------------------------------------------------------------
export const NAKSHATRA_DEITY_MANTRA_MAP: Record<string, DeityMantraInfo> = {
  'अश्विनी': {
    deity: 'अश्विनीकुमार',
    image: '/assets/deities/sunday_surya.jpg',
    mantra: 'ॐ अश्विनीकुमाराभ्यां नमः',
    shloka: 'अश्विन्यां भेषजारम्भो यात्रा विजयकारिणी।',
    blessingMeaning: 'आरोग्य, गति र नवीन कार्यसिद्धि'
  },
  'भरणी': {
    deity: 'भगवान् यमराज',
    image: '/assets/deities/yamaraj.jpg',
    mantra: 'ॐ यमाय नमः',
    shloka: 'भरण्यां यमपूजा स्यात् पापदोषनिवारिणी।',
    blessingMeaning: 'कठोर कार्य नियन्त्रण र शक्ति'
  },
  'कृत्तिका': {
    deity: 'भगवान् अग्निदेव',
    image: '/assets/deities/sunday_surya.jpg',
    mantra: 'ॐ अग्नये नमः',
    shloka: 'कृत्तिकायां हुताशार्चा तेजःप्राप्तिप्रदायिनी।',
    blessingMeaning: 'तेज, प्रतिस्पर्धा र यज्ञसिद्धि'
  },
  'रोहिणी': {
    deity: 'भगवान् श्रीब्रह्मा',
    image: '/assets/deities/brahma.jpg',
    mantra: 'ॐ ब्रह्मणे नमः',
    shloka: 'रोहिण्यां सर्वकार्याणि शुभानि विदितानि च।',
    blessingMeaning: 'स्थायी कार्य, सृजनशीलता र गृहप्रवेश'
  },
  'मृगशिरा': {
    deity: 'भगवान् चन्द्रदेव (सोम)',
    image: '/assets/deities/monday_shiva.jpg',
    mantra: 'ॐ सोमाय नमः',
    shloka: 'मृगशीर्षे प्रशान्तात्मा मित्रता सौम्यकर्म च।',
    blessingMeaning: 'मित्रता, यात्रा, सङ्गीत र सौम्यकर्म'
  },
  'आर्द्रा': {
    deity: 'भगवान् रुद्र (शिव)',
    image: '/assets/deities/monday_shiva.jpg',
    mantra: 'ॐ रुद्राय नमः',
    shloka: 'आर्द्रायां रुद्रेणार्चा स्याद् विघ्नविद्राविणी सदा।',
    blessingMeaning: 'अनुसन्धान, तन्त्र र विघ्ननाश'
  },
  'पुनर्वसु': {
    deity: 'माता अदिति',
    image: '/assets/deities/durga.jpg',
    mantra: 'ॐ अदितये नमः',
    shloka: 'पुनर्वसौ नवारम्भो यात्रारोग्यविवर्धनः।',
    blessingMeaning: 'पुनरुत्थान, यात्रा र नवीन आरम्भ'
  },
  'पुष्य': {
    deity: 'देवगुरु बृहस्पति',
    image: '/assets/deities/thursday_vishnu.jpg',
    mantra: 'ॐ बृहस्पतये नमः',
    shloka: 'पुष्ये तु सिद्धिकर्माणि पोषणं सर्वमङ्गलम्।',
    blessingMeaning: 'सर्वसिद्धि, पोषण र मङ्गल अनुष्ठान'
  },
  'आश्लेषा': {
    deity: 'नागराज (सर्प)',
    image: '/assets/deities/monday_shiva.jpg',
    mantra: 'ॐ सर्पेभ्यो नमः',
    shloka: 'आश्लेषायां सर्पपूजा विषदोषप्रणाशिनी।',
    blessingMeaning: 'गुप्त कार्य, रक्षा र दृढ निश्चय'
  },
  'मघा': {
    deity: 'पितृदेवगण',
    image: '/assets/deities/saturday_shani.jpg',
    mantra: 'ॐ पितृभ्यो नमः',
    shloka: 'मघायां पितृसम्पूजा कुलसन्ततिवर्धिनी।',
    blessingMeaning: 'नेतृत्व, कुलरक्षा र पितृआशीर्वाद'
  },
  'पूर्वाफाल्गुनी': {
    deity: 'भगवान् भग (आदित्य)',
    image: '/assets/deities/friday_lakshmi.jpg',
    mantra: 'ॐ भगाय नमः',
    shloka: 'पूर्वाफाल्गुनिके काम्यं विवाहसुखवर्धनम्।',
    blessingMeaning: 'प्रेम, कला, उत्सव र सुख'
  },
  'उत्तराफाल्गुनी': {
    deity: 'भगवान् अर्यमा',
    image: '/assets/deities/sunday_surya.jpg',
    mantra: 'ॐ अर्यम्णे नमः',
    shloka: 'उत्तराफाल्गुने नित्यं स्थिरकर्म प्रशस्यते।',
    blessingMeaning: 'विवाह, स्थायी व्यापार र प्रतिष्ठा'
  },
  'हस्त': {
    deity: 'भगवान् सविता (सूर्य)',
    image: '/assets/deities/sunday_surya.jpg',
    mantra: 'ॐ सवित्रे नमः',
    shloka: 'हस्ते तु शिल्पकर्म स्याद् वाणिज्यं ज्ञानवर्धनम्।',
    blessingMeaning: 'शिल्प, वाणिज्य, अध्ययन र सिद्धि'
  },
  'चित्रा': {
    deity: 'शिल्पकार विश्वकर्मा',
    image: '/assets/deities/thursday_vishnu.jpg',
    mantra: 'ॐ विश्वकर्मणे नमः',
    shloka: 'चित्रायां चित्रनिर्माणं वस्त्राभरणभूषणम्।',
    blessingMeaning: 'कला, वास्तुकला र सौन्दर्य'
  },
  'स्वाती': {
    deity: 'पवनदेव (वायु)',
    image: '/assets/deities/tuesday_hanuman.jpg',
    mantra: 'ॐ वायवे नमः',
    shloka: 'स्वात्यां तु चपलं कार्यं व्यापारश्च विशेषतः।',
    blessingMeaning: 'व्यापार विस्तार, गतिशीलता र विचार'
  },
  'विशाखा': {
    deity: 'इन्द्राग्नि (इन्द्र र अग्नि)',
    image: '/assets/deities/sunday_surya.jpg',
    mantra: 'ॐ इन्द्राग्निभ्यां नमः',
    shloka: 'विशाखायां रिपुध्वंसः कार्यसिद्धिर्द्विदैवते।',
    blessingMeaning: 'लक्ष्य प्राप्ति, परिश्रम र विजय'
  },
  'अनुराधा': {
    deity: 'भगवान् मित्र (आदित्य)',
    image: '/assets/deities/wednesday_krishna.jpg',
    mantra: 'ॐ मित्राय नमः',
    shloka: 'अनुराधा सुहृत्कार्ये यात्रायां च शुभप्रदा।',
    blessingMeaning: 'मैत्री, विदेश यात्रा र सहयोग'
  },
  'ज्येष्ठा': {
    deity: 'देवराज इन्द्र',
    image: '/assets/deities/thursday_vishnu.jpg',
    mantra: 'ॐ इन्द्राय नमः',
    shloka: 'ज्येष्ठायां प्रभुता लाभः सामर्थ्यं विजयस्तथा।',
    blessingMeaning: 'अधिकार, प्रभुत्व र रक्षा'
  },
  'मूल': {
    deity: 'देवी निरृति (कालिका)',
    image: '/assets/deities/durga.jpg',
    mantra: 'ॐ निरृतये नमः',
    shloka: 'मूले तु मूलशोधनं शान्तिकर्म प्रशस्यते।',
    blessingMeaning: 'गहन अनुसन्धान, जडीबुटी र साधना'
  },
  'पूर्वाषाढा': {
    deity: 'आपः / वरुणदेव',
    image: '/assets/deities/monday_shiva.jpg',
    mantra: 'ॐ अद्भ्यो नमः • ॐ वरुणाय नमः',
    shloka: 'पूर्वाषाढा जलोद्भूता सर्वसौभाग्यदायिनी।',
    blessingMeaning: 'आत्मविश्वास, विजय र जलकार्य'
  },
  'उत्तराषाढा': {
    deity: 'विश्वेदेवाः (सर्वदेवता)',
    image: '/assets/deities/sunday_surya.jpg',
    mantra: 'ॐ विश्वेभ्यो देवेभ्यो नमः',
    shloka: 'उत्तराषाढके कार्यं स्थिरं विजयदं परम्।',
    blessingMeaning: 'सत्य, स्थायी विजय र सर्वप्रतिष्ठा'
  },
  'श्रवण': {
    deity: 'भगवान् श्रीहरि विष्णु',
    image: '/assets/deities/thursday_vishnu.jpg',
    mantra: 'ॐ विष्णवे नमः',
    shloka: 'श्रवणे श्रुतविद्या च सर्वकार्यार्थसाधिनी।',
    blessingMeaning: 'ज्ञानार्जन, श्रवण, यात्रा र यश'
  },
  'धनिष्ठा': {
    deity: 'अष्टवसु',
    image: '/assets/deities/friday_lakshmi.jpg',
    mantra: 'ॐ वसुभ्यो नमः',
    shloka: 'धनिष्ठायां धनप्राप्तिर्गान्धर्वं शुभकीर्तनम्।',
    blessingMeaning: 'धनवृद्धि, सङ्गीत र उत्सव'
  },
  'शतभिषा': {
    deity: 'वरुणदेव (सहस्रनेत्र)',
    image: '/assets/deities/monday_shiva.jpg',
    mantra: 'ॐ वरुणाय नमः',
    shloka: 'शतभिषे भवेद् वैद्यं सर्वव्याधिनिबर्हणम्।',
    blessingMeaning: 'चिकित्सा, आरोग्य र ध्यानसाधना'
  },
  'पूर्वाभाद्रपदा': {
    deity: 'अजैकपाद (रुद्र)',
    image: '/assets/deities/monday_shiva.jpg',
    mantra: 'ॐ अजैकपदे नमः',
    shloka: 'पूर्वाभाद्रपदा क्रूरा तपःसिद्धिप्रदायिनी।',
    blessingMeaning: 'तपस्या, कडा निर्णय र साधना'
  },
  'उत्तराभाद्रपदा': {
    deity: 'अहिर्बुध्न्य (शेषनाग/शिव)',
    image: '/assets/deities/monday_shiva.jpg',
    mantra: 'ॐ अहिर्बुध्न्याय नमः',
    shloka: 'उत्तराभाद्रपदे शान्तिः स्थिरकर्म सुशोभनम्।',
    blessingMeaning: 'गहन शान्ति, परोपकार र स्थिर सम्पत्ति'
  },
  'रेवती': {
    deity: 'पूषादेव (पोषणकर्ता)',
    image: '/assets/deities/wednesday_krishna.jpg',
    mantra: 'ॐ पूष्णे नमः',
    shloka: 'रेवत्यां पुष्टिजननं सर्वमङ्गलसम्पदः।',
    blessingMeaning: 'पोषण, पशुधन, वाणिज्य र मङ्गल'
  }
};

// --------------------------------------------------------------------------
// 4. YOGA DEITIES, MANTRAS & SHLOKAS (२७ योग)
// --------------------------------------------------------------------------
export const YOGA_DEITY_MANTRA_MAP: Record<string, DeityMantraInfo> = {
  'शोभन': {
    deity: 'देवगुरु बृहस्पति',
    image: '/assets/deities/thursday_vishnu.jpg',
    mantra: 'ॐ बृहस्पतये नमः',
    shloka: 'शोभने सर्वकार्याणि शोभनानि भवन्ति च।',
    blessingMeaning: 'सौभाग्य, शोभा र सर्वकार्य सिद्धि'
  },
  'सिद्धि': {
    deity: 'विघ्नहर्ता श्रीगणेश',
    image: '/assets/deities/ganesha.jpg',
    mantra: 'ॐ सिद्धिबुद्धिसहिताय गणपतये नमः',
    shloka: 'सिद्धिर्योगे महासिद्धी रारब्धेषु च कर्मसु।',
    blessingMeaning: 'कार्यसिद्धि, सफलता र बुद्धिबल'
  },
  'शुभ': {
    deity: 'माता महालक्ष्मी',
    image: '/assets/deities/friday_lakshmi.jpg',
    mantra: 'ॐ महालक्ष्म्यै नमः',
    shloka: 'शुभयोगे कृतं कर्म शुभदं सर्वकामदम्।',
    blessingMeaning: 'मङ्गल, आरोग्य र धनधान्य'
  },
  'सौभाग्य': {
    deity: 'भगवान् श्रीब्रह्मा',
    image: '/assets/deities/brahma.jpg',
    mantra: 'ॐ ब्रह्मणे नमः',
    shloka: 'सौभाग्यं जनयेन्नित्यं सर्वमङ्गलहेतुके।',
    blessingMeaning: 'अखण्ड सौभाग्य र ऐश्वर्य'
  },
  'प्रीति': {
    deity: 'भगवान् श्रीविष्णु',
    image: '/assets/deities/thursday_vishnu.jpg',
    mantra: 'ॐ विष्णवे नमः',
    shloka: 'प्रीतियोगे भवेत् प्रीतिः सर्वजनप्रिया सदा।',
    blessingMeaning: 'स्नेह, सद्भाव र मैत्री'
  },
  'आयुष्मान्': {
    deity: 'भगवान् चन्द्रदेव',
    image: '/assets/deities/monday_shiva.jpg',
    mantra: 'ॐ सोमाय नमः',
    shloka: 'आयुष्मन्तं प्रकुरुते दीर्घायुः सुखवर्धनम्।',
    blessingMeaning: 'दीर्घायु, निरोगिता र कान्ति'
  },
  'शिव': {
    deity: 'देवाधिदेव महादेव',
    image: '/assets/deities/monday_shiva.jpg',
    mantra: 'ॐ नमः शिवाय',
    shloka: 'शिवयोगे कृतं कर्म शिवदं शान्तिकारकम्।',
    blessingMeaning: 'परम शान्ति, कल्याण र शिवकृपा'
  },
  'विष्कुम्भ': {
    deity: 'भगवान् यमराज',
    image: '/assets/deities/yamaraj.jpg',
    mantra: 'ॐ मृत्युञ्जयाय नमः',
    shloka: 'विष्कुम्भे शान्तिपाठेन दोषनाशो विधीयते।',
    blessingMeaning: 'सावधानीपूर्वक कार्य र शान्तिपाठ'
  },
  'व्यतीपात': {
    deity: 'भगवान् महारुद्र',
    image: '/assets/deities/monday_shiva.jpg',
    mantra: 'ॐ रुद्राय नमः',
    shloka: 'व्यतीपाते जपस्तपो दानं च सर्वपापजित्।',
    blessingMeaning: 'तप, ध्यान र मन्त्रजप फलदायी'
  },
  'वैधृति': {
    deity: 'माता दिति',
    image: '/assets/deities/durga.jpg',
    mantra: 'ॐ कुलदेवतायै नमः',
    shloka: 'वैधृतौ शान्तिकर्माणि जपहोमार्चनेन च।',
    blessingMeaning: 'सावधानी, शान्ति र प्रार्थना'
  },
  'सुकर्मा': {
    deity: 'देवराज इन्द्र',
    image: '/assets/deities/thursday_vishnu.jpg',
    mantra: 'ॐ इन्द्राय नमः',
    shloka: 'सुकर्मणि कृतं कर्म सुकीर्तिकरमुत्तमम्।',
    blessingMeaning: 'सत्कर्म, प्रतिष्ठा र यश'
  },
  'धृति': {
    deity: 'जलदेवता वरुण',
    image: '/assets/deities/monday_shiva.jpg',
    mantra: 'ॐ वरुणाय नमः',
    shloka: 'धृतियोगे धैर्यलाभः सर्वकार्यार्थसाधकः।',
    blessingMeaning: 'धैर्य, स्थिरता र सन्तोष'
  },
  'वृद्धि': {
    deity: 'भगवान् सूर्यदेव',
    image: '/assets/deities/sunday_surya.jpg',
    mantra: 'ॐ सूर्याय नमः',
    shloka: 'वृद्धियोगे वृद्धिमेति धनधान्यादिसम्पदः।',
    blessingMeaning: 'उन्नति, समृद्धि र प्रभाव'
  },
  'ध्रुव': {
    deity: 'भूमिदेवी (पृथ्वी)',
    image: '/assets/deities/brahma.jpg',
    mantra: 'ॐ भूम्यै नमः',
    shloka: 'ध्रुवे तु निश्चलं कर्म शिलान्यासादि सिद्ध्यति।',
    blessingMeaning: 'स्थिरता, अचल सम्पत्ति र जग'
  },
  'हर्षण': {
    deity: 'भगवान् भग',
    image: '/assets/deities/friday_lakshmi.jpg',
    mantra: 'ॐ भगाय नमः',
    shloka: 'हर्षणे हर्षसंयोगः प्रहर्षयति सर्वदा।',
    blessingMeaning: 'हर्ष, उल्लास र उत्सव'
  },
  'वज्र': {
    deity: 'वरुणदेव',
    image: '/assets/deities/monday_shiva.jpg',
    mantra: 'ॐ वरुणाय नमः',
    shloka: 'वज्रे पराक्रमो नित्यं साहसे सिद्धिरीरिता।',
    blessingMeaning: 'दृढता, शक्ति र साहस'
  },
  'वरीयान्': {
    deity: 'धनाधिप कुबेर',
    image: '/assets/deities/thursday_vishnu.jpg',
    mantra: 'ॐ कुबेराय नमः',
    shloka: 'वरीयाने श्रेष्ठलाभः स्यात् सर्वसम्पत्सुखप्रदः।',
    blessingMeaning: 'धनलाभ, श्रेष्ठता र सुख'
  },
  'साध्य': {
    deity: 'भगवान् सविता',
    image: '/assets/deities/sunday_surya.jpg',
    mantra: 'ॐ सवित्रे नमः',
    shloka: 'साध्ये सिद्धिं समाप्नोति यत्नेन कृतकर्मसु।',
    blessingMeaning: 'प्रयत्नसिद्धि र कार्यसफलता'
  },
  'शुक्ल': {
    deity: 'माता पार्वती',
    image: '/assets/deities/durga.jpg',
    mantra: 'ॐ पार्वत्यै नमः',
    shloka: 'शुक्लयोगे विमलं ज्ञानं सर्वशुद्धिकरं परम्।',
    blessingMeaning: 'निर्मलता, पवित्रता र ज्ञान'
  },
  'ब्रह्म': {
    deity: 'अश्विनीकुमार',
    image: '/assets/deities/brahma.jpg',
    mantra: 'ॐ ब्रह्मणे नमः',
    shloka: 'ब्रह्मयोगे ब्रह्मतेजो विद्यालाभकरं शुभम्।',
    blessingMeaning: 'ब्रह्मतेज, विद्या र ज्ञान'
  },
  'ऐन्द्र': {
    deity: 'देवराज इन्द्र',
    image: '/assets/deities/thursday_vishnu.jpg',
    mantra: 'ॐ इन्द्राय नमः',
    shloka: 'ऐन्द्रे तु विजयो नित्यं शत्रुसैन्यविनाशनः।',
    blessingMeaning: 'विजय, ऐश्वर्य र शक्ति'
  }
};

// --------------------------------------------------------------------------
// 5. KARANA DEITIES, MANTRAS & SHLOKAS (११ करण)
// --------------------------------------------------------------------------
export const KARANA_DEITY_MANTRA_MAP: Record<string, DeityMantraInfo> = {
  'बव': {
    deity: 'देवराज इन्द्र',
    image: '/assets/deities/thursday_vishnu.jpg',
    mantra: 'ॐ इन्द्राय नमः',
    shloka: 'बवे सर्वाणि कार्याणि सिद्ध्यन्ति सुखसम्पदः।',
    blessingMeaning: 'पुष्टि, आरोग्य र सर्वसिद्धि'
  },
  'बालव': {
    deity: 'भगवान् श्रीब्रह्मा',
    image: '/assets/deities/brahma.jpg',
    mantra: 'ॐ ब्रह्मणे नमः',
    shloka: 'बालवे वेदशास्त्राणि धार्मिकं कर्म शस्यते।',
    blessingMeaning: 'विद्या, संस्कार र धर्म'
  },
  'कौलव': {
    deity: 'भगवान् मित्र (सूर्य)',
    image: '/assets/deities/sunday_surya.jpg',
    mantra: 'ॐ मित्राय नमः',
    shloka: 'कौलवे मित्रतावृद्धिः सर्वसङ्घटनं शुभम्।',
    blessingMeaning: 'मैत्री, सङ्घटन र सद्भाव'
  },
  'तैतिल': {
    deity: 'भगवान् अर्यमा (आदित्य)',
    image: '/assets/deities/sunday_surya.jpg',
    mantra: 'ॐ अर्यम्णे नमः',
    shloka: 'तैतिले गृहकार्याणि सौभाग्यं च यशस्करम्।',
    blessingMeaning: 'गृहकार्य, सौभाग्य र यश'
  },
  'गर': {
    deity: 'भूमिदेवी (पृथ्वी)',
    image: '/assets/deities/brahma.jpg',
    mantra: 'ॐ भूम्यै नमः',
    shloka: 'गरे तु कृषिगोरक्षा भूमिकार्यं विशिष्यते।',
    blessingMeaning: 'कृषि, पशुपालन र भूमि'
  },
  'वणिज': {
    deity: 'माता महालक्ष्मी',
    image: '/assets/deities/friday_lakshmi.jpg',
    mantra: 'ॐ महालक्ष्म्यै नमः',
    shloka: 'वणिजि स्यान्महाव्यापारो धनधान्यविवर्धनः।',
    blessingMeaning: 'व्यापार, वाणिज्य र धन'
  },
  'विष्टि': {
    deity: 'भगवान् यमराज (काल)',
    image: '/assets/deities/yamaraj.jpg',
    mantra: 'ॐ भद्रायै नमः • ॐ यमाय नमः',
    shloka: 'विष्टौ तु वर्जयेत् कार्यं शुभं सर्वं प्रयत्नतः।',
    blessingMeaning: 'साधना, रक्षाकर्म र सावधानी'
  },
  'भद्रा': {
    deity: 'भगवान् यमराज / भद्रा',
    image: '/assets/deities/yamaraj.jpg',
    mantra: 'ॐ भद्रायै नमः',
    shloka: 'भद्रायां शान्तिकर्माणि जपहोमार्चनेन च।',
    blessingMeaning: 'सावधानी र बाधाशान्ति'
  },
  'शकुनि': {
    deity: 'कलियुग / सर्पदेव',
    image: '/assets/deities/monday_shiva.jpg',
    mantra: 'ॐ कुलदेवतायै नमः',
    shloka: 'शकुनौ मन्त्रसिद्धिः स्यादौषधं शान्तिकर्म च।',
    blessingMeaning: 'औषधोपचार र गुप्तमन्त्र'
  },
  'चतुष्पाद': {
    deity: 'वृषभ (पशुपति शिव)',
    image: '/assets/deities/monday_shiva.jpg',
    mantra: 'ॐ पशुपतये नमः',
    shloka: 'चतुष्पादे पशुप्रीतिर्गोदानं शुभदं मतम्।',
    blessingMeaning: 'पशुसेवा, गोदान र धर्म'
  },
  'नाग': {
    deity: 'अनन्त शेषनाग',
    image: '/assets/deities/monday_shiva.jpg',
    mantra: 'ॐ अनन्ताय नागराजाय नमः',
    shloka: 'नागे तु स्थावरं कर्म भूमिसम्पत्तिवर्धनम्।',
    blessingMeaning: 'धैर्य, अचल सम्पत्ति र रक्षा'
  },
  'किंस्तुघ्न': {
    deity: 'पवनदेव / कुबेर',
    image: '/assets/deities/thursday_vishnu.jpg',
    mantra: 'ॐ वायवे नमः • ॐ कुबेराय नमः',
    shloka: 'किंस्तुघ्ने सर्वकार्याणि सिद्ध्यन्ति सुखसम्पदः।',
    blessingMeaning: 'पुष्टि, उत्सव र मङ्गल'
  }
};

// --------------------------------------------------------------------------
// Helper Getters with fallbacks (Type-Safe & Error-Resilient)
// --------------------------------------------------------------------------
export function getTithiDeityInfo(tithiNumber?: number, tithiNameOrIsAunsi?: string | boolean): DeityMantraInfo {
  try {
    const isAunsi = typeof tithiNameOrIsAunsi === 'boolean'
      ? tithiNameOrIsAunsi
      : (typeof tithiNameOrIsAunsi === 'string' && (tithiNameOrIsAunsi.includes('औंसी') || tithiNameOrIsAunsi.includes('अमावस्या'))) || tithiNumber === 30;

    if (isAunsi) {
      return TITHI_DEITY_MANTRA_MAP[30];
    }
    const cleanNum = (typeof tithiNumber === 'number' && !isNaN(tithiNumber)) ? (((tithiNumber - 1) % 15) + 1) : 1;
    return TITHI_DEITY_MANTRA_MAP[cleanNum] || TITHI_DEITY_MANTRA_MAP[1];
  } catch {
    return TITHI_DEITY_MANTRA_MAP[1];
  }
}

export function getVaarDeityInfo(vaarName?: string): DeityMantraInfo {
  try {
    if (!vaarName || typeof vaarName !== 'string') return VAAR_DEITY_MANTRA_MAP['आइतबार'];
    for (const k of Object.keys(VAAR_DEITY_MANTRA_MAP)) {
      if (vaarName.includes(k)) {
        return VAAR_DEITY_MANTRA_MAP[k];
      }
    }
    return VAAR_DEITY_MANTRA_MAP['सोमबार'];
  } catch {
    return VAAR_DEITY_MANTRA_MAP['आइतबार'];
  }
}

export function getNakshatraDeityInfo(nakshatraName?: string): DeityMantraInfo {
  try {
    if (!nakshatraName || typeof nakshatraName !== 'string') return NAKSHATRA_DEITY_MANTRA_MAP['उत्तराषाढा'];
    for (const k of Object.keys(NAKSHATRA_DEITY_MANTRA_MAP)) {
      if (nakshatraName.includes(k)) {
        return NAKSHATRA_DEITY_MANTRA_MAP[k];
      }
    }
    return {
      deity: 'सर्वदेवता',
      image: '/assets/deities/sunday_surya.jpg',
      mantra: 'ॐ सर्वदेवेभ्यो नमः',
      shloka: 'नक्षत्राणां पतिः सोमो रक्षां करोतु सर्वदा।',
      blessingMeaning: 'नक्षत्र अनुकूलता र शुभ फल'
    };
  } catch {
    return NAKSHATRA_DEITY_MANTRA_MAP['उत्तराषाढा'];
  }
}

export function getYogaDeityInfo(yogaName?: string): DeityMantraInfo {
  try {
    if (!yogaName || typeof yogaName !== 'string') return YOGA_DEITY_MANTRA_MAP['शोभन'];
    for (const k of Object.keys(YOGA_DEITY_MANTRA_MAP)) {
      if (yogaName.includes(k)) {
        return YOGA_DEITY_MANTRA_MAP[k];
      }
    }
    return {
      deity: 'देवगुरु बृहस्पति',
      image: '/assets/deities/thursday_vishnu.jpg',
      mantra: 'ॐ बृहस्पतये नमः',
      shloka: 'योगे शुभे समारम्भाः सर्वकामफलप्रदाः।',
      blessingMeaning: 'शुभ कार्य सिद्धि र मङ्गल'
    };
  } catch {
    return YOGA_DEITY_MANTRA_MAP['शोभन'];
  }
}

export function getKaranaDeityInfo(karanaName?: string): DeityMantraInfo {
  try {
    if (!karanaName || typeof karanaName !== 'string') return KARANA_DEITY_MANTRA_MAP['तैतिल'];
    for (const k of Object.keys(KARANA_DEITY_MANTRA_MAP)) {
      if (karanaName.includes(k)) {
        return KARANA_DEITY_MANTRA_MAP[k];
      }
    }
    return KARANA_DEITY_MANTRA_MAP['तैतिल'];
  } catch {
    return KARANA_DEITY_MANTRA_MAP['तैतिल'];
  }
}

// --------------------------------------------------------------------------
// Detailed Astrological Interpretations, Significance & Action Guidance
// To fully enrich the 5 Limbs cards and eliminate empty space
// --------------------------------------------------------------------------
export interface LimbDetailedAnalysis {
  categoryTitle: string;
  explanation: string;
  favorableWork: string;
  keyAdvice: string;
}

export function getTithiDetailedExplanation(
  tithiNumber?: number,
  tithiName?: string,
  paksha: string = 'शुक्ल'
): LimbDetailedAnalysis {
  const isAunsi = tithiName?.includes('औंसी') || tithiName?.includes('अमावस्या') || tithiNumber === 30;
  if (isAunsi) {
    return {
      categoryTitle: 'पूर्णा संज्ञक (पितृ तिथि)',
      explanation: 'अमावस्या पितृदेवहरूको पावन तिथि हो। यस दिन पितृ तर्पण, श्राद्ध, दान र आत्मचिन्तन गर्दा पितृदोष शान्त भई कुलको कल्याण हुन्छ।',
      favorableWork: 'पितृश्राद्ध, तर्पण, अन्नदान, गौसेवा तथा शान्ति पाठ',
      keyAdvice: 'नयाँ लौकिक कार्य सुरु नगरी पितृकर्ममा समर्पित रहनुहोला।'
    };
  }

  const cleanNum = (typeof tithiNumber === 'number' && !isNaN(tithiNumber)) ? (((tithiNumber - 1) % 15) + 1) : 1;

  const TITHI_EXPLANATION_MAP: Record<number, LimbDetailedAnalysis> = {
    1: {
      categoryTitle: 'नन्दा संज्ञक (आनन्ददायक)',
      explanation: 'प्रतिपदा नन्दा संज्ञक तिथि हो। यसका स्वामी भगवान् अग्नि हुन्। यस दिन अग्निहोत्र, मङ्गलोत्सव, गृहारम्भ र नवीन योजनाको जग हाल्न अति शुभ मानिन्छ।',
      favorableWork: 'नयाँ कार्य थालनी, उत्सव, गृहसज्जा, स्वास्थ्यलाभ',
      keyAdvice: 'यात्रा गर्दा पूर्व दिशाको विचार गर्नु राम्रो हुन्छ।'
    },
    2: {
      categoryTitle: 'भद्रा संज्ञक (कल्याणकारी)',
      explanation: 'द्वितीया भद्रा संज्ञक तिथि हो, जसका अधिपति सृष्टिकर्ता ब्रह्मा हुन्। यस तिथिमा विद्यारम्भ, स्थायी निर्माण, मित्रता र राजकीय भेटघाट सफल हुन्छ।',
      favorableWork: 'अध्ययन, शिलान्यास, सम्झौता, प्रतिष्ठा',
      keyAdvice: 'दीर्घकालीन प्रभाव रहने काम सुरु गर्न उत्तम।'
    },
    3: {
      categoryTitle: 'जया संज्ञक (विजयप्रद)',
      explanation: 'तृतीया जया संज्ञक तिथि हो। माता गौरी र श्रीगणेशको कृपा रहने यो दिन विजय, पराक्रम र सफलता दिलाउने सर्वश्रेष्ठ मुहूर्त हो।',
      favorableWork: 'कला, सङ्गीत, आभूषण, विवाह वार्ता, नयाँ उद्यम',
      keyAdvice: 'सौभाग्य र विजयका लागि गौरी स्तुति शुभ।'
    },
    4: {
      categoryTitle: 'रिक्ता संज्ञक (सावधानी)',
      explanation: 'चतुर्थी रिक्ता संज्ञक तिथि हो। यसका देवता विघ्नहर्ता गणेश हुन्। सांसारिक मङ्गल कार्य भन्दा कडा साधना, अवरोध हटाउने कार्य र ऋणमुक्ति उत्तम हुन्छ।',
      favorableWork: 'गणेश आराधना, सङ्कटनाश पूजा, प्रतिस्पर्धा',
      keyAdvice: 'नयाँ स्थायी कार्यमा संयम अपनाउनुहोला।'
    },
    5: {
      categoryTitle: 'पूर्णा संज्ञक (फलप्रद)',
      explanation: 'पञ्चमी पूर्णा संज्ञक तिथि हो। नागराज र चन्द्रमाको प्रभाव रहने यो दिन सर्वसिद्धिदायक, पौष्टिक र मङ्गलमय कर्मका लागि प्रसिद्ध छ।',
      favorableWork: 'गृहारम्भ, व्यापार विस्तार, औषधोपचार, व्रत',
      keyAdvice: 'नागदेवताको स्मरणले पारिवारिक सुख वृद्धि हुन्छ।'
    },
    6: {
      categoryTitle: 'नन्दा संज्ञक (यशदायक)',
      explanation: 'षष्ठी नन्दा संज्ञक तिथि हो। यसका स्वामी देवसेनापति भगवान् कार्तिकेय (कुमार) हुन्। यश, पराक्रम र कीर्ति बढाउने कार्यमा सफलता मिल्छ।',
      favorableWork: 'नेतृत्व, प्रतिस्पर्धा, वाहन, नयाँ जिम्मेवारी',
      keyAdvice: 'शरीरमा स्फूर्ति र आरोग्यको संवर्धन हुन्छ।'
    },
    7: {
      categoryTitle: 'भद्रा संज्ञक (प्रतिष्ठाप्रद)',
      explanation: 'सप्तमी भद्रा संज्ञक तिथि हो। प्रत्यक्ष देवता भगवान् सूर्य यसका स्वामी हुन्। पदभार ग्रहण, राजकीय काम र मान-प्रतिष्ठाका लागि उत्तम मानिन्छ।',
      favorableWork: 'प्रशासनिक काम, पदोन्नति, यात्रा, दान',
      keyAdvice: 'सूर्य नमस्कार तथा गायत्री जपले तेज बढाउँछ।'
    },
    8: {
      categoryTitle: 'जया संज्ञक (शक्तिप्रद)',
      explanation: 'अष्टमी जया संज्ञक तिथि हो। यस दिन माता दुर्गा र भगवान् शिवको उपासनाले शक्ति, साहस र संकटमुक्ति प्राप्त हुन्छ।',
      favorableWork: 'भगवती आराधना, तन्त्र/मन्त्र जप, रक्षाकर्म',
      keyAdvice: 'दुर्गा सप्तशती वा शिव महिम्न पाठ अति फलदायी।'
    },
    9: {
      categoryTitle: 'रिक्ता संज्ञक (शत्रुनाशक)',
      explanation: 'नवमी रिक्ता संज्ञक तिथि हो। अधिष्ठात्री देवी चण्डिका दुर्गा हुन्। यो दिन कुलदेवी पूजा, शत्रु विजय, विवाद निराकरण र आत्मरक्षाका लागि शक्तिशाली छ।',
      favorableWork: 'शक्ति उपासना, हवन, साहसिक कार्य, खेलकुद',
      keyAdvice: 'दीर्घकालीन सांसारिक निर्माणमा सावधानी राख्नुपर्छ।'
    },
    10: {
      categoryTitle: 'पूर्णा संज्ञक (सम्पूर्णता)',
      explanation: 'दशमी पूर्णा संज्ञक तिथि हो। यसका अधिपति भगवान् धर्मराज (यम) हुन्। धर्मवृद्धि, राजकीय प्रतिष्ठा, यात्रा र सर्वाङ्गीण मङ्गल कार्य सिद्ध हुन्छन्।',
      favorableWork: 'राज्य/सरकारी कार्य, पदभार, तीर्थाटन, उत्सव',
      keyAdvice: 'धर्म र सत्य मार्गमा गरिएका प्रयासमा पूर्ण विजय हुन्छ।'
    },
    11: {
      categoryTitle: 'नन्दा संज्ञक (हरिवासर)',
      explanation: 'एकादशी नन्दा संज्ञक हरिवासर तिथि हो। यसका स्वामी भगवान् श्रीविष्णु हुन्। यो दिन उपवास, भक्ति, दान र अध्यात्मका लागि सर्वोत्तम मानिन्छ।',
      favorableWork: 'एकादशी व्रत, श्रीमद्भागवत पाठ, सत्यनारायण पूजा',
      keyAdvice: 'अन्न वर्जित गरी फलाहार गर्दा पुण्य लाभ हुन्छ।'
    },
    12: {
      categoryTitle: 'भद्रा संज्ञक (कल्याणप्रद)',
      explanation: 'द्वादशी भद्रा संज्ञक तिथि हो। यसका स्वामी भगवान् श्रीहरि विष्णु हुन्। धार्मिक अनुष्ठान, पारण, यज्ञ, दान र स्थायी परोपकारका लागि उत्तम छ।',
      favorableWork: 'दान, समाजसेवा, मन्दिर दर्शन, पारण',
      keyAdvice: 'सत्पात्रलाई अन्न र जल दान गर्दा अनन्त फल मिल्छ।'
    },
    13: {
      categoryTitle: 'जया संज्ञक (सौभाग्यप्रद)',
      explanation: 'त्रयोदशी जया संज्ञक तिथि हो। कामदेव र भगवान् शिव (प्रदोष) यसका अधिष्ठाता हुन्। सौन्दर्य, आरोग्य, मित्रता र मनोरञ्जनका लागि शुभ मानिन्छ।',
      favorableWork: 'प्रदोष व्रत, शिवपूजा, विवाह वार्ता, नयाँ सम्बन्ध',
      keyAdvice: 'सन्ध्या समयमा शिव आराधना गर्दा संकट हट्छन्।'
    },
    14: {
      categoryTitle: 'रिक्ता संज्ञक (शिवशक्ति)',
      explanation: 'चतुर्दशी रिक्ता संज्ञक तिथि हो। भगवान् शिव र माता कालीको यो दिन हो। शिवरात्री व्रत, रुद्री पूजा, तन्त्र साधना र भय निवारणका लागि उत्तम छ।',
      favorableWork: 'रुद्री, महामृत्युञ्जय जप, काली उपासना, साधना',
      keyAdvice: 'सांसारिक मङ्गल कर्ममा विशेष संयम अपनाउनुहोला।'
    },
    15: {
      categoryTitle: 'पूर्णा संज्ञक (महाफलप्रद)',
      explanation: 'पूर्णिमा पूर्णा संज्ञक तिथि हो। यसका स्वामी चन्द्रदेव हुन्। आध्यात्मिक प्रकाश, सत्यनारायण कथा, गङ्गास्नान र पितृ/देव पूजाका लागि सर्वश्रेष्ठ मानिन्छ।',
      favorableWork: 'सत्यनारायण पूजा, गङ्गास्नान, हवन, दान',
      keyAdvice: 'चन्द्रमालाई अर्घ्य दिँदा मानसिक शान्ति मिल्छ।'
    }
  };

  return TITHI_EXPLANATION_MAP[cleanNum] || TITHI_EXPLANATION_MAP[10];
}

export function getVaarDetailedExplanation(vaarName?: string): LimbDetailedAnalysis {
  const VAAR_EXPLANATION_MAP: Record<string, LimbDetailedAnalysis> = {
    'आइतबार': {
      categoryTitle: 'सूर्यदेवको तेजश्वी दिन (अग्नितत्त्व)',
      explanation: 'सूर्यदेवको आधिपत्य भएको तेजश्वी दिन। अग्नि तत्त्वको प्रभाव रहने हुँदा प्रशासनिक काम, सरकारी निर्णय र आत्मबल वृद्धिमा तीव्रता आउँछ।',
      favorableWork: 'प्रशासनिक काम, पदभार ग्रहण, औषधि सेवन, धातु कार्य',
      keyAdvice: 'पूर्व दिशा अनुकूल, रातो वा सुन्तला रङ्ग शुभ।'
    },
    'सोमबार': {
      categoryTitle: 'चन्द्रमा तथा भगवान् शिवको वार (जलतत्त्व)',
      explanation: 'चन्द्रमा र भगवान् शिवको कृपा रहने सौम्य वार। जलतत्त्वको सन्तुलन, मानसिक शान्ति, कृषि, दूध र सेतो वस्तुको कारोबारका लागि अति अनुकूल छ।',
      favorableWork: 'मानसिक शान्ति, जलयात्रा, बैङ्किङ, नयाँ सोच, शिवपूजा',
      keyAdvice: 'उत्तर दिशा अनुकूल, सेतो वा चम्किलो रङ्ग शुभ।'
    },
    'मंगलबार': {
      categoryTitle: 'भौम तथा हनुमान्‌को वार (अग्नितत्त्व)',
      explanation: 'मङ्गल ग्रह र हनुमान्‌को अग्नितत्त्वयुक्त ऊर्जावान् दिन। साहस, पराक्रम, भूमि खरिद, प्राविधिक कार्य र ऋणमोचनका लागि विशेष फलदायी मानिन्छ।',
      favorableWork: 'भूमि खरिद, इन्जिनियरिङ, खेलकुद, ऋणमोचन, हनुमान् चालिसा',
      keyAdvice: 'दक्षिण दिशा अनुकूल, रातो वा सिन्दूरी रङ्ग शुभ।'
    },
    'बुधबार': {
      categoryTitle: 'बुध तथा श्रीनारायणको वार (पृथ्वीतत्त्व)',
      explanation: 'बुध ग्रह र भगवान् श्रीविष्णुको बौद्धिक दिन। पृथ्वी तत्त्वको प्रभावले व्यापार, बैङ्किङ, सञ्चार, अध्ययन र हिसाब-किताबका काम सहजै सफल हुन्छन्।',
      favorableWork: 'वाणिज्य, लेखन, लेखा, सञ्चार, नयाँ सम्झौता',
      keyAdvice: 'उत्तर दिशा अनुकूल, हरियो रङ्ग विशेष फलदायी।'
    },
    'बिहीबार': {
      categoryTitle: 'देवगुरु बृहस्पति तथा ब्रह्माको वार (आकाशतत्त्व)',
      explanation: 'देवगुरु बृहस्पति र श्रीब्रह्माको ज्ञानवर्धक वार। आकाश तत्त्वको प्रभावले उच्च अध्ययन, मङ्गलमय उत्सव, धार्मिक अनुष्ठान र गुरुसेवामा सिद्धि मिल्छ।',
      favorableWork: 'शिक्षा, मङ्गल उत्सव, विवाह कुरा, धर्मकार्य, मन्दिर दर्शन',
      keyAdvice: 'ईशान/उत्तर-पूर्व दिशा अनुकूल, पहेँलो रङ्ग शुभ।'
    },
    'शुक्रबार': {
      categoryTitle: 'शुक्र तथा महालक्ष्मीको वार (जलतत्त्व)',
      explanation: 'दैत्यगुरु शुक्र र माता महालक्ष्मीको जलतत्त्वयुक्त सौन्दर्य वार। कला, सङ्गीत, नयाँ वस्त्र, आभूषण, मनोरञ्जन र लक्ष्मी कृपाका लागि उत्तम छ।',
      favorableWork: 'कला, सौन्दर्य, वाहन, आभूषण, साझेदारी, लक्ष्मी उपासना',
      keyAdvice: 'दक्षिण-पूर्व (आग्नेय) अनुकूल, सेतो वा गुलाबी रङ्ग शुभ।'
    },
    'शनिबार': {
      categoryTitle: 'शनिदेव तथा यमराजको वार (वायुतत्त्व)',
      explanation: 'शनिदेव र भगवान् यमराजको वायुतत्त्वयुक्त न्यायकारी वार। स्थायी निर्माण, फलाम, मेसिनरी, तेल, कर्मचारी व्यवस्थापन र साधनाका लागि शुभ छ।',
      favorableWork: 'स्थायी कार्य, उद्योग, मेसिनरी, जनसेवा, तेल/फलाम कारोबार',
      keyAdvice: 'पश्चिम दिशा अनुकूल, कालो वा गाढा निलो रङ्ग शुभ।'
    }
  };

  if (!vaarName) return VAAR_EXPLANATION_MAP['आइतबार'];
  for (const k of Object.keys(VAAR_EXPLANATION_MAP)) {
    if (vaarName.includes(k)) return VAAR_EXPLANATION_MAP[k];
  }
  return VAAR_EXPLANATION_MAP['सोमबार'];
}

export function getNakshatraDetailedExplanation(
  nakshatraName?: string,
  pada?: number
): LimbDetailedAnalysis {
  const name = nakshatraName || 'उत्तराषाढा';

  // Specific high-frequency detailed explanations
  const NAKSHATRA_MAP: Record<string, LimbDetailedAnalysis> = {
    'उत्तराषाढा': {
      categoryTitle: 'स्थिर तथा ध्रुव संज्ञक (सर्वदेवता)',
      explanation: 'उत्तराषाढा स्थिर तथा ध्रुव संज्ञक नक्षत्र हो। यसका अधिपति विश्वेदेवा हुन्। यस दिन शिलान्यास, गृहप्रवेश, नयाँ पदभार, स्थायी व्यापार र वृक्षारोपण उत्तम मानिन्छ।',
      favorableWork: 'शिलान्यास, स्थायी व्यापार, वृक्षारोपण, पदभार',
      keyAdvice: 'धैर्य र सत्यताले दीर्घकालीन सफलता सुनिश्चित गर्दछ।'
    },
    'रोहिणी': {
      categoryTitle: 'स्थिर तथा ध्रुव संज्ञक (ब्रह्मा)',
      explanation: 'रोहिणी स्थिर र अति सौभाग्यदायक नक्षत्र हो। यसका स्वामी ब्रह्मा हुन्। नयाँ घर निर्माण, स्थायी व्यापार, विवाह र कृषि कार्यका लागि सर्वश्रेष्ठ मानिन्छ।',
      favorableWork: 'गृहारम्भ, विवाह, कृषि, आभूषण, स्थायी सम्झौता',
      keyAdvice: 'सौन्दर्य र सिर्जनशीलताको विकास हुनेछ।'
    },
    'अश्विनी': {
      categoryTitle: 'क्षिप्र तथा लघु संज्ञक (अश्विनीकुमार)',
      explanation: 'अश्विनी क्षिप्र तथा छिटो फल दिने नक्षत्र हो। औषधोपचार, नयाँ वाहन खरिद, बैङ्किङ कारोबार, यात्रा तथा नयाँ काम थालनीका लागि अति शुभ मानिन्छ।',
      favorableWork: 'औषधोपचार, बैङ्किङ, किनमेल, अध्ययन, यात्रा',
      keyAdvice: 'चाँडो निर्णय लिने कामहरूमा सहज सफलता मिल्छ।'
    },
    'पुष्य': {
      categoryTitle: 'सर्वसिद्धिदायक नक्षत्र (बृहस्पति)',
      explanation: 'पुष्य नक्षत्रलाई नक्षत्रहरूको राजा मानिन्छ। यसका स्वामी देवगुरु बृहस्पति हुन्। सबै प्रकारका मङ्गल कार्य, किनमेल, स्वर्ण खरिद र विद्यारम्भका लागि सर्वश्रेष्ठ।',
      favorableWork: 'स्वर्ण खरिद, गृहारम्भ, अध्ययन, धार्मिक अनुष्ठान',
      keyAdvice: 'गुरु पुष्य योग परेमा सर्वसिद्धि प्राप्त हुन्छ।'
    },
    'श्रवण': {
      categoryTitle: 'चर तथा शुभ संज्ञक (विष्णु)',
      explanation: 'श्रवण चर संज्ञक पवित्र नक्षत्र हो। भगवान् विष्णु यसका अधिपति हुन्। शिक्षा, ज्ञानार्जन, यात्रा, नयाँ वस्त्र धारण तथा मङ्गल कार्यका लागि अति फलदायी।',
      favorableWork: 'शिक्षा, अध्ययन, यात्रा, वस्त्रालङ्कार, विष्णुभक्ति',
      keyAdvice: 'ज्ञानवर्धक श्रवण र चिन्तनले उन्नति गराउँछ।'
    }
  };

  if (NAKSHATRA_MAP[name]) return NAKSHATRA_MAP[name];

  // Nature-based fallback
  const isSthira = ['रोहिणी', 'उत्तराफाल्गुनी', 'उत्तराषाढा', 'उत्तराभाद्रपदा'].includes(name);
  const isChara = ['पुनर्वसु', 'स्वाती', 'श्रवण', 'धनिष्ठा', 'शतभिषा'].includes(name);
  const isKshipra = ['अश्विनी', 'पुष्य', 'हस्त'].includes(name);
  const isMridu = ['मृगशिरा', 'चित्रा', 'अनुराधा', 'रेवती'].includes(name);
  const isUgra = ['भरणी', 'मघा', 'पूर्वाफाल्गुनी', 'पूर्वाषाढा', 'पूर्वाभाद्रपदा'].includes(name);

  if (isSthira) {
    return {
      categoryTitle: 'स्थिर तथा ध्रुव संज्ञक',
      explanation: `यो ${name} स्थिर संज्ञक नक्षत्र हो। दीर्घकालीन स्थायित्व चाहिने जग हाल्ने, स्थायी व्यापार, वृक्षारोपण र पदभार ग्रहण जस्ता कार्यहरूमा सफलता दिन्छ।`,
      favorableWork: 'शिलान्यास, गृहप्रवेश, स्थायी व्यापार, वृक्षारोपण',
      keyAdvice: 'दीर्घकालीन स्थायित्व चाहिने योजना थाल्नुहोस्।'
    };
  } else if (isChara) {
    return {
      categoryTitle: 'चर तथा गतिमान संज्ञक',
      explanation: `यो ${name} चर तथा गतिमान संज्ञक नक्षत्र हो। यात्रा, सवारी साधन खरिद, नयाँ ठाउँ भ्रमण र व्यापार विस्तारका लागि अति अनुकूल मानिन्छ।`,
      favorableWork: 'यात्रा, सवारी खरिद, व्यापार विस्तार, गतिशीलता',
      keyAdvice: 'सक्रियता र नयाँ पहलका लागि उत्तम समय।'
    };
  } else if (isKshipra) {
    return {
      categoryTitle: 'क्षिप्र तथा लघु संज्ञक',
      explanation: `यो ${name} क्षिप्र नक्षत्र हो। छिटो सम्पन्न गर्नुपर्ने किनमेल, स्वास्थ्य उपचार, बैङ्किङ र अध्ययनका लागि अत्यन्तै शुभ फलदायी हुन्छ।`,
      favorableWork: 'औषधोपचार, बैङ्किङ, किनमेल, अध्ययन, यात्रा',
      keyAdvice: 'चाँडो निर्णय लिने कामहरूमा सफलता मिल्छ।'
    };
  } else if (isMridu) {
    return {
      categoryTitle: 'मृदु तथा सौम्य संज्ञक',
      explanation: `यो ${name} मृदु नक्षत्र हो। मित्रता, सङ्गीत, नयाँ वस्त्र, आभूषण, सौन्दर्य र पारिवारिक सौहार्दताका लागि सर्वश्रेष्ठ मानिन्छ।`,
      favorableWork: 'मित्रता, सङ्गीत, वस्त्र, आभूषण, सौन्दर्य',
      keyAdvice: 'सद्भाव र सम्बन्ध विस्तारका लागि अनुकूल दिन।'
    };
  } else if (isUgra) {
    return {
      categoryTitle: 'उग्र तथा साहसिक संज्ञक',
      explanation: `यो ${name} उग्र संज्ञक नक्षत्र हो। प्रतिस्पर्धा, मुद्दा-मामिला निराकरण, कडा प्रशासनिक निर्णय र कुलदेवताको साधनाका लागि उपयुक्त हुन्छ।`,
      favorableWork: 'साहसिक कार्य, प्रतिस्पर्धा, सुरक्षा, साधना',
      keyAdvice: 'शान्त लौकिक कार्यमा भने संयमता राख्नुहोला।'
    };
  }

  return {
    categoryTitle: 'शुभ फलप्रद नक्षत्र',
    explanation: `यो ${name} नक्षत्रमा गरिएका नित्य कर्महरूले शुभ फल दिन्छन्। इष्टदेवको आराधना गरी दैनिक कार्य गर्दा सफलता मिल्छ।`,
    favorableWork: 'नित्य कर्म, धार्मिक अनुष्ठान, व्यापार तथा अध्ययन',
    keyAdvice: 'सकारात्मक सोचका साथ काम अघि बढाउनुहोस्।'
  };
}

export function getYogaDetailedExplanation(yogaName?: string): LimbDetailedAnalysis {
  const name = yogaName || 'शोभन';

  const INAUSPICIOUS_SET = new Set([
    'विष्कुम्भ', 'अतिगण्ड', 'शूल', 'गण्ड', 'व्याघात', 'वज्र', 'व्यतीपात', 'परिघ', 'वैधृति'
  ]);

  if (INAUSPICIOUS_SET.has(name)) {
    return {
      categoryTitle: 'दोषयुक्त / सावधानी योग',
      explanation: `${name} योगमा नयाँ दीर्घकालीन शुभकार्य सुरु गर्दा सावधानी अपनाउनु पर्छ। शान्ति पाठ, कुलदेवता पूजा, मन्त्र जप तथा साधनाका लागि भने फलदायी हुन्छ।`,
      favorableWork: 'मन्त्र जप, कुलपूजा, दान, आत्मचिन्तन, संयम',
      keyAdvice: 'विशेष महत्त्वपूर्ण निर्णय गर्दा शुभ होरा रोज्नुहोला।'
    };
  }

  if (name === 'शोभन') {
    return {
      categoryTitle: 'शुभ तथा मङ्गलमय योग',
      explanation: 'शोभन योगले जीवनमा सौन्दर्य, कान्ति र ऐश्वर्य बढाउँछ। यात्रा, सभा-समारोह, नयाँ वस्त्र धारण तथा मङ्गल कार्यका लागि अति शुभ मानिन्छ।',
      favorableWork: 'सभा-समारोह, वस्त्रालङ्कार, यात्रा, मङ्गल कार्य',
      keyAdvice: 'यस योगमा गरिएको कार्यले दीर्घ यश दिन्छ।'
    };
  }

  if (name === 'सिद्धि') {
    return {
      categoryTitle: 'सर्वसिद्धिप्रद योग',
      explanation: 'सिद्धि योगमा थालिएका कामहरू निर्विघ्न सम्पन्न हुन्छन्। विद्यारम्भ, व्यापार तथा नयाँ योजनाका लागि सर्वसिद्धिदायक मानिन्छ।',
      favorableWork: 'नयाँ सम्झौता, व्यापार आरम्भ, विद्या, मङ्गलकर्म',
      keyAdvice: 'इष्टदेवको स्मरण गरी काम सुरु गर्नुहोस्।'
    };
  }

  return {
    categoryTitle: 'शुभ फलदायी योग',
    explanation: `${name} शुभ फलदायी योग हो। शुभ योगमा गरिएका कामहरूमा अनुकूलता, सहजता र सकारात्मक परिणाम प्राप्त हुन्छ।`,
    favorableWork: 'शुभ अनुष्ठान, व्यापार, यात्रा, सामाजिक कार्य',
    keyAdvice: 'मनोबल उच्च राखी काम अघि बढाउनुहोस्।'
  };
}

export function getKaranaDetailedExplanation(karanaName?: string): LimbDetailedAnalysis {
  const name = karanaName || 'तैतिल';

  if (name.includes('विष्टि') || name.includes('भद्रा')) {
    return {
      categoryTitle: 'भद्रा (विष्टि करण) - वर्जित काल',
      explanation: 'भद्रा कालमा विवाह, गृहप्रवेश, यात्रा जस्ता शुभ कार्य वर्जित मानिन्छन्। शत्रुदमन, मुद्दा मामिला, विषप्रयोग वा तान्त्रिक कर्म भने सिद्ध हुन्छ।',
      favorableWork: 'शत्रुदमन, कानुनी बहस, साधना, आत्मरक्षा',
      keyAdvice: 'भद्रा कालभर नयाँ शुभ मङ्गल कार्य नगर्नुहोला।'
    };
  }

  const KARANA_MAP: Record<string, LimbDetailedAnalysis> = {
    'तैतिल': {
      categoryTitle: 'चर संज्ञक (सौभाग्यवर्धक)',
      explanation: 'तैतिल चर संज्ञक सौभाग्यवर्धक करण हो। यसका स्वामी भगवान् अर्यमा हुन्। गृहकार्य, बन्धुबान्धव मिलन, प्रेम, मित्रता तथा प्रतिष्ठादायक कर्महरूमा शुभ फल प्राप्त हुन्छ।',
      favorableWork: 'गृहकार्य, बन्धुमिलन, मित्रता, सामाजिक प्रतिष्ठा',
      keyAdvice: 'पारिवारिक सौहार्दता वृद्धि हुनेछ।'
    },
    'बव': {
      categoryTitle: 'चर संज्ञक (धर्मवर्धक)',
      explanation: 'बव चर करणमा धर्म, कीर्ति, यज्ञ, कृषि तथा पौष्टिक कार्यहरूमा विशेष सफलता मिल्छ। आरोग्य र ऐश्वर्य अभिवृद्धि हुन्छ।',
      favorableWork: 'धार्मिक कार्य, दान, कृषि, पौष्टिक आहार',
      keyAdvice: 'आरम्भ गरिएका कामले राम्रो प्रतिफल दिन्छ।'
    },
    'बालव': {
      categoryTitle: 'चर संज्ञक (विद्याप्रद)',
      explanation: 'बालव करणमा विद्यारम्भ, धार्मिक अनुष्ठान, अध्ययन तथा सन्तान सम्बन्धी कार्य उत्तम मानिन्छ। यसका स्वामी ब्रह्मा हुन्।',
      favorableWork: 'विद्यारम्भ, ज्ञानार्जन, अनुष्ठान, दान',
      keyAdvice: 'सद्बुद्धि र एकाग्रताका लागि अनुकूल समय।'
    },
    'कौलव': {
      categoryTitle: 'चर संज्ञक (मित्रताप्रद)',
      explanation: 'कौलव करणमा मित्रता, साझेदारी, नयाँ सम्बन्ध तथा सौन्दर्य प्रसाधन कार्य शुभ हुन्छ। यसका स्वामी मित्रदेव हुन्।',
      favorableWork: 'साझेदारी, प्रेम, वस्त्रालङ्कार, मनोरञ्जन',
      keyAdvice: 'सम्बन्धमा मधुरता कायम रहन्छ।'
    },
    'गर': {
      categoryTitle: 'चर संज्ञक (कृषिप्रद)',
      explanation: 'गर करणमा कृषि, बीजारोपण, जमिनको काम तथा श्रमयुक्त कार्य सफल हुन्छ। यसका स्वामी भूमिदेव हुन्।',
      favorableWork: 'कृषि, जग्गाजमिन, बीजारोपण, श्रम',
      keyAdvice: 'धैर्यताका साथ काम गर्दा लाभ हुन्छ।'
    },
    'वणिज': {
      categoryTitle: 'चर संज्ञक (वाणिज्यप्रद)',
      explanation: 'वणिज करणमा व्यापार, वाणिज्य, लेनदेन, किनमेल तथा धनवृद्धि कार्य उत्तम हुन्छ। यसका स्वामी देवी लक्ष्मी हुन्।',
      favorableWork: 'व्यापार, वाणिज्य, बैङ्किङ, किनमेल',
      keyAdvice: 'लक्ष्मी कृपाले आर्थिक लाभ मिल्छ।'
    },
    'शकुनि': {
      categoryTitle: 'स्थिर संज्ञक (औषधि/पितृ)',
      explanation: 'शकुनि स्थिर करण हो। औषधि निर्माण, जडीबुटी संकलन, मन्त्र साधना तथा पितृकार्यका लागि शुभ मानिन्छ।',
      favorableWork: 'औषधोपचार, पितृपूजा, मन्त्र साधना',
      keyAdvice: 'स्वास्थ्य सतर्कता अपनाउनुहोला।'
    },
    'चतुष्पाद': {
      categoryTitle: 'स्थिर संज्ञक (पशुधन/पितृ)',
      explanation: 'चतुष्पाद स्थिर करण हो। गाई, बाच्छा र पशुधन सम्बन्धी काम, श्राद्ध तथा दानका लागि उत्तम मानिन्छ।',
      favorableWork: 'गौसेवा, दान, पितृश्राद्ध, पशुपालन',
      keyAdvice: 'परोपकारी भावनाले काम गर्दा शान्ति मिल्छ।'
    },
    'नाग': {
      categoryTitle: 'स्थिर संज्ञक (नागदेवता)',
      explanation: 'नाग स्थिर करण हो। यसमा कडा तान्त्रिक कर्म, विष निवारण, सुरुङ वा जमिन खन्ने काम सिद्ध हुन्छ।',
      favorableWork: 'नागपूजा, जमिन उत्खनन, तन्त्र साधना',
      keyAdvice: 'शान्त लौकिक काममा संयम राख्नुहोला।'
    },
    'किंस्तुघ्न': {
      categoryTitle: 'स्थिर संज्ञक (मङ्गलप्रद)',
      explanation: 'किंस्तुघ्न स्थिर करण हो। यसका स्वामी वायु हुन्। मङ्गलमय उत्सव, धर्मकार्य, यज्ञ र यात्राका लागि शुभ मानिन्छ।',
      favorableWork: 'धार्मिक अनुष्ठान, मङ्गलोत्सव, यज्ञ, दान',
      keyAdvice: 'सद्कर्ममा समर्पित रहनुहोला।'
    }
  };

  return KARANA_MAP[name] || {
    categoryTitle: 'चर संज्ञक करण',
    explanation: `${name} करण दैनिक व्यावहारिक कार्य तथा नित्य व्यवहारका लागि अनुकूल मानिन्छ।`,
    favorableWork: 'दैनिक व्यवहार, व्यापार, यात्रा, अध्ययन',
    keyAdvice: 'सकारात्मक सोचका साथ काम अघि बढाउनुहोस्।'
  };
}
