// ============================================================================
// बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग सेवा - समाचार तथा लेख डेटा भण्डार (Samachar Store)
// ============================================================================

import { PlanetPosition } from '../types/astrology';
import { generateLiveGrahaGocharNews, GrahaGocharNewsArticle } from '../utils/grahaGocharNewsEngine';
import { syncAndPruneShastriyaNews } from '../utils/shastriyaNewsEngine';
import { convertADToBS } from '../utils/nepaliCalendar';

export type SamacharCategory =
  | 'panchanga'      // पञ्चाङ्ग तथा खगोलीय घटना
  | 'festival'       // चाडपर्व तथा धार्मिक मेला
  | 'dharma'         // वैदिक धर्म तथा संस्कार
  | 'astrology'      // ज्योतिष अनुसन्धान तथा राशिफल
  | 'notice'         // संस्थागत तथा पञ्चाङ्ग सूचना
  | 'general';       // सामान्य वैदिक समाचार

export interface SamacharArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: SamacharCategory;
  categoryNameNepali: string;
  author: string;
  authorRole: string;
  coverImageUrl: string;
  publishedAtBS: string;
  publishedAtAD: string;
  isPublished: boolean;
  isFeatured: boolean;
  isBreaking: boolean;
  tags: string[];
  viewsCount: number;
  readTimeMinutes: number;
  source?: string;
}

export interface NewsEditorMagicToken {
  token: string;
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  issuedAt: string;
  expiresAt: string;
  isRevoked: boolean;
  createdBy: string;
  note?: string;
}

const STORAGE_KEY_SAMACHAR = 'balananda_samachar_articles_v4';
const STORAGE_KEY_MAGIC_TOKENS = 'balananda_news_editor_magic_tokens_v1';

export const SAMACHAR_CATEGORY_NAMES: Record<SamacharCategory, string> = {
  panchanga: 'पञ्चाङ्ग तथा खगोल',
  festival: 'चाडपर्व तथा मेला',
  dharma: 'वैदिक धर्म तथा संस्कार',
  astrology: 'ज्योतिष अनुसन्धान',
  notice: 'संस्थागत सूचना',
  general: 'विविध वैदिक समाचार',
};

// Initial Seed Articles: ९ वटै ग्रहहरूको प्रत्यक्ष गोचर तथा १२ राशि फलादेश समाचारहरू
export const INITIAL_SAMACHAR_ARTICLES: SamacharArticle[] = [
  {
    id: 'graha_news_surya',
    slug: 'surya-graha-gochar-12-rashi-samachar',
    title: 'सूर्यदेवको प्रत्यक्ष राशि तथा नक्षत्र सञ्चार: १२ वटै राशिमा पर्ने राज्य, आर्थिक तथा स्वास्थ्य प्रभाव',
    summary: 'वैदिक ज्योतिषका अधिपति तथा आत्माका कारक भगवान् सूर्यदेवको प्रत्यक्ष गोचर चाल; मेष देखि मीन सम्मका १२ वटै राशिमा पर्ने सरकारी सम्मान, पराक्रम, पित्त विकार तथा दैनिक फलादेश।',
    content: `वैदिक ज्योतिषका अधिपति तथा समस्त ब्रह्माण्डका आत्मा भगवान् सूर्यदेवको वर्तमान राशि तथा नक्षत्र सञ्चारले सम्पूर्ण १२ राशिमा महत्त्वपूर्ण प्रभाव पारेको छ।

**खगोलीय तथा फलित सार:**
- सूर्यदेव चन्द्र राशिबाट ३, ६, १० र ११ औँ भावमा अत्यन्त शुभ फलदायी मानिनुहुन्छ। यी भावहरूमा गोचर हुँदा रोकिएका सरकारी कामहरू सम्पन्न हुने, प्रशासनिक अधिकार प्राप्त हुने र मान-सम्मानमा उच्च वृद्धि हुनेछ।
- बाँकी भावहरूमा सूर्यले पित्त विकार, शारीरिक उष्णता र अहंकारी स्वभाव ल्याउन सक्ने भएकाले संयम र धैर्यता आवश्यक हुन्छ।

**विशेष अनुकूल राशिहरू:** मेष, सिंह, धनु तथा वृश्चिक
**सावधानी चाहिने राशिहरू:** कन्या, कुम्भ तथा मकर

**दैनिक शान्ति उपाय:** बिहान तामाको भाँडोबाट सूर्यलाई रातो चन्दन र अक्षतायुक्त जल अर्पण गर्ने तथा आदित्य हृदय स्तोत्रको पाठ गर्ने।`,
    category: 'astrology',
    categoryNameNepali: 'ज्योतिष अनुसन्धान',
    author: 'बालानन्द खगोल तथा गोचर अनुसन्धान परिषद',
    authorRole: 'वरिष्ठ फलित ज्योतिषी',
    coverImageUrl: '/assets/deities/sunday_surya.jpg',
    publishedAtBS: '२०८३-०५-२५',
    publishedAtAD: '2026-09-10',
    isPublished: true,
    isFeatured: true,
    isBreaking: true,
    tags: ['सूर्य', 'गोचर', 'राशिफल', 'नक्षत्र', 'फलादेश'],
    viewsCount: 2450,
    readTimeMinutes: 4,
    source: 'बालानन्द वैदिक अनुसन्धान केन्द्र'
  },
  {
    id: 'graha_news_chandra',
    slug: 'chandra-graha-gochar-manasik-faladesh',
    title: 'मन र जलका कारक चन्द्रमाको प्रत्यक्ष तीव्र गोचर: १२ राशिको दैनिक मानसिक शान्ति र आर्थिक विश्लेषण',
    summary: 'सवा दुई दिनमा राशि परिवर्तन गर्ने मनका स्वामी चन्द्रमाको प्रत्यक्ष गति; अष्टम चन्द्र दोषको सतर्कता, मनोभाव, दैनिक व्यापारिक लाभ र १२ राशिको विस्तृत फलादेश।',
    content: `चन्द्रमा वैदिक ज्योतिषमा मन, भावना, माता र जल तत्त्वका स्वामी हुनुहुन्छ। दैनिक गोचरमा चन्द्रमाको स्थिति नै हाम्रो दैनिक मनोदशा, मुड र व्यापारिक निर्णयको प्रमुख आधार हो।

**खगोलीय तथा फलित सार:**
- चन्द्रमा चन्द्र राशिबाट १, ३, ६, ७, १० र ११ औँ भावमा गोचर गर्दा उत्तम भोजन, वस्त्रलाभ, पारिवारिक सुख र व्यापारमा तरलता प्रदान गर्नुहुन्छ।
- आठौँ भावमा चन्द्रमा रहँदा 'अष्टम चन्द्र' लाग्ने भएकाले यस अवधिमा महत्त्वपूर्ण नयाँ कार्य सुरु नगर्नु र मानसिक तनावबाट जोगिनु शास्त्रीय नियम छ।

**दैनिक शान्ति उपाय:** भगवान् शिवजीलाई काँचो दूध र जल अर्पण गर्नुहोस् तथा ॐ नमः शिवाय मन्त्रको जप गर्नुहोस्।`,
    category: 'astrology',
    categoryNameNepali: 'ज्योतिष अनुसन्धान',
    author: 'बालानन्द खगोल तथा गोचर अनुसन्धान परिषद',
    authorRole: 'पञ्चाङ्ग खगोलविद्',
    coverImageUrl: '/assets/festivals/janai_purnima.jpg',
    publishedAtBS: '२०८३-०५-२५',
    publishedAtAD: '2026-09-10',
    isPublished: true,
    isFeatured: true,
    isBreaking: false,
    tags: ['चन्द्रमा', 'अष्टम चन्द्र', 'गोचर', 'दैनिक फल', 'मन'],
    viewsCount: 2180,
    readTimeMinutes: 3,
    source: 'बालानन्द वैदिक अनुसन्धान केन्द्र'
  },
  {
    id: 'graha_news_mangal',
    slug: 'mangal-graha-gochar-parakram-bhoomi',
    title: 'सेनापति मंगलको पराक्रमी राशि सञ्चार: ऊर्जा, घरजग्गा, कानुनी विजय र १२ राशिको प्रभाव',
    summary: 'शौर्य, पराक्रम र भूमिकारक मंगलदेवको प्रत्यक्ष गोचर चाल; इन्जिनियरिङ, ठेक्कापट्टा, जग्गा-जमिन खरिद तथा सुरक्षा क्षेत्रमा सफलता र १२ राशिको पूर्ण विश्लेषण।',
    content: `मंगलदेव नवग्रह मण्डलका सेनापति हुनुहुन्छ। उहाँको प्रभावले मानिसमा दृढ संकल्प, प्राविधिक सीप र प्रतिस्पर्धी क्षमता पैदा गर्दछ।

**खगोलीय तथा फलित सार:**
- मंगलदेव चन्द्र राशिबाट ३, ६ र ११ औँ भावमा अत्यन्त शुभ फलदायी हुनुहुन्छ। यी भावहरूमा मंगल रहँदा शत्रुहरू परास्त हुने, कर्जा चुक्ता हुने र निर्माण क्षेत्रमा विशाल सफलता मिल्ने गर्दछ।
- १, २, ४, ७, ८ र १२ भावमा भने रक्त विकार, चोटपटक र दाम्पत्य खटपट गराउने भएकाले संयम अपनाउनुपर्छ।

**दैनिक शान्ति उपाय:** मंगलबार हनुमान चालीसा वा बजरंग बाण पाठ गर्ने तथा रातो मसुरो दाल दान गर्ने।`,
    category: 'astrology',
    categoryNameNepali: 'ज्योतिष अनुसन्धान',
    author: 'बालानन्द खगोल तथा गोचर अनुसन्धान परिषद',
    authorRole: 'वरिष्ठ फलित ज्योतिषी',
    coverImageUrl: '/assets/deities/tuesday_hanuman.jpg',
    publishedAtBS: '२०८३-०५-२५',
    publishedAtAD: '2026-09-10',
    isPublished: true,
    isFeatured: false,
    isBreaking: false,
    tags: ['मंगल', 'भूमि', 'पराक्रम', 'गोचर', 'साहस'],
    viewsCount: 1940,
    readTimeMinutes: 4,
    source: 'बालानन्द वैदिक अनुसन्धान केन्द्र'
  },
  {
    id: 'graha_news_budha',
    slug: 'budha-graha-gochar-byapar-buddhi',
    title: 'बुद्धिदाता बुधको शुभ गोचर सञ्चार: व्यापार, शिक्षा, वाणी र १२ राशिको आर्थिक फलादेश',
    summary: 'तर्क, गणित र सञ्चारका अधिपति बुधदेवको प्रत्यक्ष गोचर; वाणीको प्रभाव, व्यापारिक सम्झौता, अध्ययन र शेयर बजारमा १२ राशिको प्रभाव विवरण।',
    content: `बुधदेव नवग्रहका राजकुमार मानिनुहुन्छ। उहाँको गोचर प्रभावले विद्यार्थीहरूमा प्रखर स्मरणशक्ति, व्यापारीहरूमा नाफा र लेखक/पत्रकारहरूमा उत्कृष्ट सिर्जनशीलता ल्याउँछ।

**खगोलीय तथा फलित सार:**
- बुधदेव चन्द्र राशिबाट २, ४, ६, ८, १० र ११ औँ भावमा गोचर गर्दा अत्यन्त शुभ मानिन्छ। यी भावहरूमा बुधले मीठो बोली, नयाँ साथीभाइको संगत, परीक्षामा सफलता र व्यापारिक सम्झौताबाट आकस्मिक धनलाभ गराउँछन्।

**दैनिक शान्ति उपाय:** बुधबार भगवान् गणेशजीलाई २१ मुन्ठा दुबो र लड्डु चढाउने तथा ॐ बुं बुधाय नमः जप गर्ने।`,
    category: 'astrology',
    categoryNameNepali: 'ज्योतिष अनुसन्धान',
    author: 'बालानन्द खगोल तथा गोचर अनुसन्धान परिषद',
    authorRole: 'वरिष्ठ फलित ज्योतिषी',
    coverImageUrl: '/assets/deities/wednesday_krishna.jpg',
    publishedAtBS: '२०८३-०५-२५',
    publishedAtAD: '2026-09-10',
    isPublished: true,
    isFeatured: false,
    isBreaking: false,
    tags: ['बुध', 'बुद्धि', 'व्यापार', 'शिक्षा', 'गोचर'],
    viewsCount: 1720,
    readTimeMinutes: 3,
    source: 'बालानन्द वैदिक अनुसन्धान केन्द्र'
  },
  {
    id: 'graha_news_guru',
    slug: 'guru-graha-gochar-bhagyodaya-samachar',
    title: 'देवगुरु बृहस्पतिको अमृतमय महागोचर: ज्ञान, सन्तान, विवाह र १२ राशिको भाग्योदय फलादेश',
    summary: 'ब्रह्माण्डका परोपकारी महाग्रह देवगुरु बृहस्पतिको प्रत्यक्ष गोचर; विवाह योग, सन्तान सुख, उच्च शिक्षा र १२ वटै राशिमा पर्ने अमृतमय प्रभावको पूर्ण विवरण।',
    content: `देवगुरु बृहस्पति नवग्रह मण्डलका सबैभन्दा परोपकारी र शुभ फल प्रदायक ग्रह हुनुहुन्छ। उहाँको दृष्टि जहाँ पर्छ, त्यहाँ अमृत वर्षा समान कल्याण हुने शास्त्रीय वचन छ।

**खगोलीय तथा फलित सार:**
- बृहस्पति चन्द्र राशिबाट २, ५, ७, ९ र ११ औँ भावमा गोचर गर्दा राजयोग समान फल प्रदान गर्नुहुन्छ। दोस्रोमा धन, पाँचौँमा सन्तान र बुद्धि, सातौँमा विवाह र व्यापार, नवौँमा महाभाग्य र एघारौँमा सर्वतोमुखी लाभ प्राप्त हुन्छ।

**दैनिक शान्ति उपाय:** बिहीबार पहेँलो वस्त्र लगाउने, चनाको दाल दान गर्ने र ॐ बृं बृहस्पतये नमः जप गर्ने।`,
    category: 'astrology',
    categoryNameNepali: 'ज्योतिष अनुसन्धान',
    author: 'बालानन्द खगोल तथा गोचर अनुसन्धान परिषद',
    authorRole: 'प्रमुख ज्योतिषाचार्य',
    coverImageUrl: '/assets/deities/thursday_vishnu.jpg',
    publishedAtBS: '२०८३-०५-२५',
    publishedAtAD: '2026-09-10',
    isPublished: true,
    isFeatured: true,
    isBreaking: false,
    tags: ['बृहस्पति', 'देवगुरु', 'भाग्योदय', 'विवाह', 'गोचर'],
    viewsCount: 3100,
    readTimeMinutes: 5,
    source: 'बालानन्द वैदिक अनुसन्धान केन्द्र'
  },
  {
    id: 'graha_news_shukra',
    slug: 'shukra-graha-gochar-aishwarya-samachar',
    title: 'दैत्यगुरु शुक्रको सौन्दर्यमय गोचर: ऐश्वर्य, वाहन, दाम्पत्य र १२ राशिको भौतिक सुख विश्लेषण',
    summary: 'विलासिता, प्रेम र कलाका अधिपति शुक्रदेवको प्रत्यक्ष गोचर; नयाँ सवारी साधन, वस्त्र-आभूषण, मनोरञ्जन र १२ राशिको आर्थिक फलादेश।',
    content: `शुक्रदेव कला, सङ्गीत, सौन्दर्य, फेसन र दाम्पत्य सुखका प्रत्यक्ष कारक हुनुहुन्छ। उहाँको अनुकूल गोचरले जीवनमा रोमान्स र आर्थिक सहजता ल्याउँछ।

**खगोलीय तथा फलित सार:**
- शुक्रदेव प्रायः धेरै भावहरू (१, २, ३, ४, ५, ८, ९, ११ र १२) मा शुभ फल दिने ग्रह हुनुहुन्छ। केवल ६, ७ र १० औँ भावमा भने दाम्पत्य खटपट र अपव्ययबाट जोगिनुपर्छ।

**दैनिक शान्ति उपाय:** शुक्रबार महालक्ष्मी मन्दिरमा सेतो खीर वा मिश्री चढाउने तथा सेतो चामल दान गर्ने।`,
    category: 'astrology',
    categoryNameNepali: 'ज्योतिष अनुसन्धान',
    author: 'बालानन्द खगोल तथा गोचर अनुसन्धान परिषद',
    authorRole: 'वरिष्ठ फलित ज्योतिषी',
    coverImageUrl: '/assets/deities/friday_lakshmi.jpg',
    publishedAtBS: '२०८३-०५-२५',
    publishedAtAD: '2026-09-10',
    isPublished: true,
    isFeatured: false,
    isBreaking: false,
    tags: ['शुक्र', 'ऐश्वर्य', 'सुख', 'दाम्पत्य', 'गोचर'],
    viewsCount: 1890,
    readTimeMinutes: 4,
    source: 'बालानन्द वैदिक अनुसन्धान केन्द्र'
  },
  {
    id: 'graha_news_shani',
    slug: 'shani-graha-gochar-sadesati-dhaiyya',
    title: 'न्यायाधीश शनिदेवको ऐतिहासिक गोचर: साढेसाती, ढैय्या चक्र र १२ राशिको कर्मफल विश्लेषण',
    summary: 'कर्मफलदाता शनिदेवको प्रत्यक्ष गोचर चक्र; साढेसातीका तीनै चरण, अष्टम र कण्टक ढैय्या तथा १२ वटै राशिमा पर्ने कर्मफल र शान्ति उपायको पूर्ण विवरण।',
    content: `शनिदेव निष्पक्ष न्यायाधीश हुनुहुन्छ। उहाँले मानिसलाई उसको सत्कर्म र दुष्कर्म अनुसार फल प्रदान गर्नुहुन्छ। शनिदेवको गोचरले समाजमा अनुशासन, श्रमको सम्मान र आध्यात्मिक वैराग्य जगाउँछ।

**खगोलीय तथा फलित सार:**
- शनिदेव चन्द्र राशिबाट ३, ६ र ११ औँ भावमा गोचर गर्दा अभूतपूर्व सफलता, शत्रु दमन र स्थिर सम्पत्ति लाभ गराउनुहुन्छ।
- १२, १ र २ भावमा साढेसाती (७.५ वर्ष) तथा ४ र ८ भावमा ढैय्या (२.५ वर्ष) चल्ने भएकाले यस अवधिमा मानसिक संयम, गरिब सेवा र नियमित शनि-हनुमान उपासना अनिवार्य छ।

**दैनिक शान्ति उपाय:** शनिबार पीपलको रुखमुनि तोरीको तेलको दीप बाल्ने, कालो तिल दान गर्ने र हनुमान चालिसा पाठ गर्ने।`,
    category: 'astrology',
    categoryNameNepali: 'ज्योतिष अनुसन्धान',
    author: 'बालानन्द खगोल तथा गोचर अनुसन्धान परिषद',
    authorRole: 'प्रमुख धर्माधिकारी',
    coverImageUrl: '/assets/deities/saturday_shani.jpg',
    publishedAtBS: '२०८३-०५-२५',
    publishedAtAD: '2026-09-10',
    isPublished: true,
    isFeatured: true,
    isBreaking: true,
    tags: ['शनि', 'साढेसाती', 'ढैय्या', 'कर्मफल', 'गोचर'],
    viewsCount: 3850,
    readTimeMinutes: 5,
    source: 'बालानन्द वैदिक अनुसन्धान केन्द्र'
  },
  {
    id: 'graha_news_rahu',
    slug: 'rahu-graha-gochar-baideshik-avsar',
    title: 'छायाग्रह राहुको रहस्यमय गोचर: प्रविधि, वैदेशिक अवसर, अप्रत्याशित लाभ र सतर्कता फलादेश',
    summary: 'कूटनीति, इन्टरनेट र आकस्मिक लाभ-हानिका कारक राहुको प्रत्यक्ष वक्री गोचर; वैदेशिक सफलता, भ्रमबाट मुक्ति र १२ राशिको विस्तृत फलादेश।',
    content: `राहु आधुनिक युगमा प्रविधि, राजनीति, वैदेशिक भ्रमण, इन्टरनेट र अप्रत्याशित लाभ-हानिका मुख्य कारक हुन्। राहुले कूटनीतिक चतुरता र ठूला अवसरहरू प्रदान गर्दछ।

**खगोलीय तथा फलित सार:**
- राहुदेव चन्द्र राशिबाट ३, ६ र ११ औँ भावमा गोचर गर्दा सिंह समान पराक्रम र अचानक अथाह धनलाभ गराउनुहुन्छ।
- अन्य भावमा भने मानसिक भ्रम, शङ्का र अनिद्रा निम्त्याउन सक्ने भएकाले दुर्गा कवचको पाठ उत्तम मानिन्छ।

**दैनिक शान्ति उपाय:** दुर्गा सप्तशती वा देवी कवचको पाठ गर्ने, कालो तिल वा नरिवल बग्दो नदीमा बगाउने।`,
    category: 'astrology',
    categoryNameNepali: 'ज्योतिष अनुसन्धान',
    author: 'बालानन्द खगोल तथा गोचर अनुसन्धान परिषद',
    authorRole: 'वरिष्ठ फलित ज्योतिषी',
    coverImageUrl: '/assets/deities/durga_ashtami.jpg',
    publishedAtBS: '२०८३-०५-२५',
    publishedAtAD: '2026-09-10',
    isPublished: true,
    isFeatured: false,
    isBreaking: false,
    tags: ['राहु', 'छायाग्रह', 'वैदेशिक', 'गोचर', 'आकस्मिक लाभ'],
    viewsCount: 1650,
    readTimeMinutes: 4,
    source: 'बालानन्द वैदिक अनुसन्धान केन्द्र'
  },
  {
    id: 'graha_news_ketu',
    slug: 'ketu-graha-gochar-moksha-sadhana',
    title: 'मोक्षकारक केतुको आध्यात्मिक गोचर: अन्तर्ज्ञान, साधना, अनुसन्धान र १२ राशिको प्रभाव',
    summary: 'वैराग्य, रहस्यमय ज्ञान र मोक्षका अधिपति केतुदेवको प्रत्यक्ष चाल; आध्यात्मिक सिद्धि, स्वास्थ्य सतर्कता र १२ राशिको पूर्ण विश्लेषण।',
    content: `केतुदेव भौतिक बन्धनबाट मुक्त गराई आत्मिक ज्ञान तर्फ लैजाने मोक्षकारक ग्रह हुन्। उहाँको प्रभावले मानिसलाई गम्भीर चिन्तन, रहस्यमय विद्या र ईश्वरभक्ति प्रदान गर्दछ।

**खगोलीय तथा फलित सार:**
- केतुदेव चन्द्र राशिबाट ३, ६, ११ र १२ भावमा शुभ फल प्रदान गर्नुहुन्छ। बाह्रौँ भावको केतुले मोक्षको ढोका खोल्ने शास्त्रीय मान्यता छ।
- १, २, ५, ७, ८ भावमा भने भौतिक उदासीनता र चोटपटकबाट बच्न गणेशजीको आराधना फलदायी हुन्छ।

**दैनिक शान्ति उपाय:** भगवान् गणेश सङ्कटनाशन स्तोत्र पाठ गर्ने र कुकुरलाई मीठो रोटी खुवाउने।`,
    category: 'astrology',
    categoryNameNepali: 'ज्योतिष अनुसन्धान',
    author: 'बालानन्द खगोल तथा गोचर अनुसन्धान परिषद',
    authorRole: 'वरिष्ठ फलित ज्योतिषी',
    coverImageUrl: '/assets/deities/ganesha.jpg',
    publishedAtBS: '२०८३-०५-२५',
    publishedAtAD: '2026-09-10',
    isPublished: true,
    isFeatured: false,
    isBreaking: false,
    tags: ['केतु', 'मोक्ष', 'साधना', 'अन्तर्ज्ञान', 'गोचर'],
    viewsCount: 1540,
    readTimeMinutes: 3,
    source: 'बालानन्द वैदिक अनुसन्धान केन्द्र'
  }
];

// ----------------------------------------------------------------------------
// LocalStorage Helper Methods for Samachar Articles
// ----------------------------------------------------------------------------
export function getStoredArticles(
  todayBS?: string,
  todayAD?: string,
  todayTithiName?: string,
  todayPaksha?: 'शुक्लपक्ष' | 'कृष्णपक्ष'
): SamacharArticle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAMACHAR);
    let current: SamacharArticle[] = [];
    if (!raw) {
      current = [...INITIAL_SAMACHAR_ARTICLES];
    } else {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        current = parsed;
      } else {
        current = [...INITIAL_SAMACHAR_ARTICLES];
      }
    }

    // Run Shastriya Tithi and 1-Month-Advance Festival Sync & Midnight Auto-Pruning
    const synced = syncAndPruneShastriyaNews(current, todayBS, todayAD, todayTithiName, todayPaksha);
    
    // If article count or contents changed, update localStorage
    if (JSON.stringify(synced) !== raw) {
      localStorage.setItem(STORAGE_KEY_SAMACHAR, JSON.stringify(synced));
    }
    return synced;
  } catch (e) {
    console.error('Failed to get stored articles:', e);
    return INITIAL_SAMACHAR_ARTICLES;
  }
}

export function saveArticles(articles: SamacharArticle[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SAMACHAR, JSON.stringify(articles));
  } catch (e) {
    console.error('Failed to save articles:', e);
  }
}

/**
 * Automatically syncs fresh real-time transit news articles for all 9 planets
 * into localStorage, while strictly PRESERVING all custom and user-created news articles.
 */
export function autoSyncLivePlanetaryNews(
  transitPlanets?: PlanetPosition[],
  todayBS?: string,
  todayAD?: string
): SamacharArticle[] {
  if (typeof window === 'undefined') return getStoredArticles();

  try {
    // 1. Get current stored articles
    const raw = localStorage.getItem(STORAGE_KEY_SAMACHAR);
    let currentStored: SamacharArticle[] = [];
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          currentStored = parsed;
        }
      } catch (e) {
        console.error('Error parsing stored articles in autoSync:', e);
      }
    }
    if (currentStored.length === 0) {
      currentStored = [...INITIAL_SAMACHAR_ARTICLES];
    }

    // Preserve all non-graha articles created by the user or editorial team
    const customUserArticles = currentStored.filter((a) => !a.id.startsWith('graha_news_'));

    const activeAD = todayAD || new Date().toISOString().split('T')[0];
    const activeBS = todayBS || convertADToBS(activeAD).formattedBS;

    const planetsToUse: PlanetPosition[] = (transitPlanets && transitPlanets.length >= 7)
      ? transitPlanets
      : [];

    const liveGenerated: GrahaGocharNewsArticle[] = generateLiveGrahaGocharNews(planetsToUse, activeBS, activeAD);

    // Planet ID mapping
    const planetKeyMap: Record<string, string> = {
      'सूर्य': 'surya',
      'चन्द्र': 'chandra',
      'मंगल': 'mangal',
      'बुध': 'budha',
      'गुरु': 'guru',
      'शुक्र': 'shukra',
      'शनि': 'shani',
      'राहु': 'rahu',
      'केतु': 'ketu',
    };

    const freshGrahaArticles: SamacharArticle[] = liveGenerated.map((p) => {
      const pKey = planetKeyMap[p.planet] || 'surya';
      const existing = currentStored.find((a) => a.id === `graha_news_${pKey}`);

      const fullContent = `${p.fullBody}

---
### 🪐 प्रत्यक्ष खगोलीय अवस्थिति (Live Ephemeris Coordinates):
- **ग्रह:** ${p.planet} (${p.symbol})
- **वर्तमान राशि:** ${p.currentRashi} (${p.degreeStr})
- **नक्षत्र:** ${p.nakshatra} (चरण ${p.pada}), स्वामी: ${p.nakshatraLord}
- **गति / अवस्था:** ${p.motionStatus}
- **शास्त्रीय सन्दर्भ:** ${p.classicalReference}

---
### 🌍 देश-काल तथा सामाजिक प्रभाव:
${p.mundaneImpact}

---
### ♈ १२ वटै राशिमा पर्ने प्रत्यक्ष फल तथा शान्ति उपाय:
${p.rashiImpacts
  .map(
    (r) => `#### ${r.rashiName} (${r.symbol}) - ${r.impactType} (${r.houseNameNepali})
- **फल सार:** ${r.summary}
- **पेशा तथा धन:** ${r.careerFinance}
- **स्वास्थ्य तथा परिवार:** ${r.familyHealth}
- **शान्ति उपाय:** ${r.remedy}
- **शुभ रङ्ग:** ${r.luckyColor} | **शुभ अङ्क:** ${r.luckyNumber} | **अनुकूल दिन:** ${r.favorableDay}`
  )
  .join('\n\n')}`;

      return {
        id: `graha_news_${pKey}`,
        slug: `${pKey}-graha-gochar-${p.currentRashi.toLowerCase()}-live`,
        title: p.title,
        summary: p.leadSummary,
        content: fullContent,
        category: 'astrology',
        categoryNameNepali: 'ज्योतिष अनुसन्धान',
        author: p.author,
        authorRole: p.authorRole,
        coverImageUrl: p.coverImageUrl,
        publishedAtBS: activeBS,
        publishedAtAD: activeAD,
        isPublished: true,
        isFeatured: p.planet === 'सूर्य' || p.planet === 'गुरु',
        isBreaking: p.planet === 'सूर्य' || p.isRetrograde,
        tags: [p.planet, 'गोचर', p.currentRashi, p.nakshatra, 'फलादेश', 'दैनिक ग्रह'],
        viewsCount: existing?.viewsCount ? existing.viewsCount + 1 : p.viewsCount,
        readTimeMinutes: p.readTimeMinutes,
        source: 'बालानन्द प्रत्यक्ष खगोल अनुसन्धान केन्द्र',
      };
    });

    // Merge: Fresh 9 graha articles + All user-created custom articles
    const merged = [...freshGrahaArticles, ...customUserArticles];
    localStorage.setItem(STORAGE_KEY_SAMACHAR, JSON.stringify(merged));

    // Dispatch custom event to notify all listening components
    window.dispatchEvent(new CustomEvent('balananda_samachar_updated', { detail: merged }));

    return merged;
  } catch (err) {
    console.error('Failed to auto-sync planetary news:', err);
    return getStoredArticles();
  }
}

export function saveSingleArticle(article: SamacharArticle): SamacharArticle {
  const current = getStoredArticles();
  const existingIdx = current.findIndex(a => a.id === article.id);
  
  let updatedList: SamacharArticle[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = { ...article };
  } else {
    updatedList = [article, ...current];
  }
  
  saveArticles(updatedList);
  return article;
}

export function deleteArticle(articleId: string): boolean {
  const current = getStoredArticles();
  const updatedList = current.filter(a => a.id !== articleId);
  saveArticles(updatedList);
  return true;
}

export function incrementArticleViews(articleId: string): void {
  const current = getStoredArticles();
  const article = current.find(a => a.id === articleId);
  if (article) {
    article.viewsCount = (article.viewsCount || 0) + 1;
    saveArticles(current);
  }
}

// ----------------------------------------------------------------------------
// Active Magic Link Engine for News Editors
// ----------------------------------------------------------------------------
export function getStoredActiveMagicTokens(): NewsEditorMagicToken[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MAGIC_TOKENS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const now = new Date().getTime();
      // Filter out tokens expired more than 30 days ago
      return parsed.filter(t => !t.isRevoked && new Date(t.expiresAt).getTime() > now - 86400000 * 30);
    }
    return [];
  } catch (e) {
    return [];
  }
}

export function saveMagicTokens(tokens: NewsEditorMagicToken[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MAGIC_TOKENS, JSON.stringify(tokens));
  } catch (e) {
    console.error('Failed to save magic tokens:', e);
  }
}

export function generateNewsEditorMagicToken(params: {
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string;
  durationHours?: number;
  createdBy?: string;
  note?: string;
}): { tokenRecord: NewsEditorMagicToken; activeLinkUrl: string } {
  const duration = params.durationHours || 72; // default 3 days
  const now = new Date();
  const expires = new Date(now.getTime() + duration * 3600 * 1000);

  const randomPart = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 8);
  const token = `nws_edt_${Date.now()}_${randomPart}`;

  const tokenRecord: NewsEditorMagicToken = {
    token,
    recipientName: params.recipientName,
    recipientEmail: params.recipientEmail,
    recipientPhone: params.recipientPhone,
    issuedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    isRevoked: false,
    createdBy: params.createdBy || 'SuperAdmin',
    note: params.note || 'समाचार सम्पादक प्रत्यक्ष पहुँच लिङ्क',
  };

  const tokens = getStoredActiveMagicTokens();
  tokens.unshift(tokenRecord);
  saveMagicTokens(tokens);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const activeLinkUrl = `${origin}/?admin_token=${token}&section=samachar_editor`;

  return { tokenRecord, activeLinkUrl };
}

export function validateNewsEditorMagicToken(token: string): {
  isValid: boolean;
  tokenRecord?: NewsEditorMagicToken;
  messageNepali: string;
} {
  if (!token) {
    return { isValid: false, messageNepali: 'अमान्य वा रिक्त टोकन।' };
  }

  // Master key bypass for emergency super-admin override or test override token
  if (token === 'SJS-SUPER-ADMIN-MASTER-KEY' || token === 'BALANANDA-SUPERADMIN-OVERRIDE-TOKEN' || token.startsWith('sess_admin_')) {
    return {
      isValid: true,
      messageNepali: 'सुपरएडमिन सक्रिय लिङ्क प्रमाणीकरण सफल भयो।',
      tokenRecord: {
        token,
        recipientName: 'सुपर प्रशासक तथा समाचार सम्पादक',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(),
        isRevoked: false,
        createdBy: 'MasterOverride'
      }
    };
  }

  const tokens = getStoredActiveMagicTokens();
  const match = tokens.find(t => t.token === token);

  if (!match) {
    return { isValid: false, messageNepali: 'यो सक्रिय लिङ्क प्रणालीमा भेटिएन वा रद्द गरिएको छ।' };
  }

  if (match.isRevoked) {
    return { isValid: false, messageNepali: 'यो सक्रिय लिङ्क सुपरएडमिनद्वारा रद्द (Revoked) गरिएको छ।' };
  }

  const expiryTime = new Date(match.expiresAt).getTime();
  if (Date.now() > expiryTime) {
    return { isValid: false, messageNepali: 'यो सक्रिय लिङ्कको म्याद समाप्त भइसकेको छ। कृपया नयाँ लिङ्क अनुरोध गर्नुहोस्।' };
  }

  return {
    isValid: true,
    tokenRecord: match,
    messageNepali: `सफलतापूर्वक प्रमाणीकरण भयो! सम्पादक: ${match.recipientName}`
  };
}

export function revokeMagicToken(token: string): boolean {
  const tokens = getStoredActiveMagicTokens();
  const match = tokens.find(t => t.token === token);
  if (match) {
    match.isRevoked = true;
    saveMagicTokens(tokens);
    return true;
  }
  return false;
}

// ----------------------------------------------------------------------------
// WhatsApp and Email Active Link Dispatch Helpers
// ----------------------------------------------------------------------------
export function buildWhatsAppMessageForEditor(data: {
  recipientName: string;
  activeLinkUrl: string;
  expiresAt: string;
  orgName?: string;
}): string {
  const org = data.orgName || 'बालानन्द ज्योतिष तथा पञ्चाङ्ग सेवा';
  const expiryDate = new Date(data.expiresAt).toLocaleDateString('ne-NP');
  
  return `*🕉️ ${org} - समाचार सम्पादक सक्रिय लिङ्क*

नमस्ते ${data.recipientName} ज्यू,
तपाईंलाई बालानन्द पञ्चाङ्ग तथा वैदिक समाचार प्रणालीमा समाचार, लेख तथा सूचनाहरू प्रकाशन एवं सम्पादन गर्नका लागि आधिकारिक सक्रिय पहुँच लिङ्क उपलब्ध गराइएको छ।

👉 *सिधै समाचार सम्पादक ड्यासबोर्ड खोल्न यहाँ क्लिक गर्नुहोस्:*
${data.activeLinkUrl}

⏰ *लिङ्कको म्याद:* ${expiryDate} सम्म सक्रिय रहनेछ।
🔒 _यो एक सुरक्षित व्यक्तिगत लिङ्क हो, कृपया अरूलाई सेयर नगर्नुहोला।_`;
}

export function getWhatsAppShareUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(message);
  if (cleanPhone) {
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedMsg}`;
}

export function getEmailShareUrl(email: string, subject: string, body: string): string {
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
