// ============================================================================
// बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग सेवा - विस्तृत राशिफल डेटा भण्डार (Rashifal Store)
// दैनिक, मासिक र वार्षिक राशिफलको भण्डारण, सिर्जना, अद्यावधिक र सुपर एडमिन व्यवस्थापन
// ============================================================================

import { RASHI_DATA } from '../data/rashiData';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { convertADToBSFull } from '../utils/bsCalendarData';

export interface DailyRashifalItem {
  id: string;
  dateBS: string; // e.g. "२०८३-०६-२३"
  dateAD: string; // e.g. "2026-10-09"
  rashiId: number; // 1 to 12
  rashiName: string; // मेष, वृष, etc.
  overallScore: number; // 0-100
  overallVerdict: string; // e.g. "शुभ एवं कार्यसिद्धिदायक"
  overallSummary: string;
  career: string; // कार्यक्षेत्र तथा व्यवसाय
  finance: string; // आर्थिक अवस्था र धनसम्बन्धी सम्भावना
  loveAndFamily: string; // प्रेम, दाम्पत्य तथा पारिवारिक सम्बन्ध
  education: string; // अध्ययन, परीक्षा तथा बौद्धिक कार्य
  health: string; // स्वास्थ्य तथा दिनचर्याका सामान्य सुझाव
  social: string; // सामाजिक सम्बन्ध तथा मानसम्मान
  travel: string; // यात्रा तथा नयाँ कामको सम्भावना
  favorableTime: string; // अनुकूल समय
  cautionTime: string; // सावधानी अपनाउनुपर्ने समय
  luckyColor: string; // आजको शुभ रङ
  luckyNumber: string; // शुभ अंक
  luckyDirection: string; // शुभ दिशा
  mantra: string; // आजको आध्यात्मिक अभ्यास वा मन्त्र
  remedy: string; // आज गर्न उपयुक्त सत्कर्म तथा दानसम्बन्धी सुझाव
  specialGuidance: string; // आजको विशेष ज्योतिषीय मार्गदर्शन
  transitSummary: string; // आजको ग्रहगोचरको सारांश
  isPublished: boolean;
  updatedAt: string;
  version: number;
}

export interface MonthlyRashifalItem {
  id: string;
  yearBS: number; // e.g. 2083
  monthBS: number; // 1 to 12
  monthName: string; // वैशाख, जेठ, etc.
  rashiId: number;
  rashiName: string;
  overallScore: number; // 0-100
  overallVerdict: string;
  overallSummary: string; // महिनाको समग्र फल
  trendBeginMidEnd: string; // प्रारम्भ, मध्य र अन्त्यको सम्भावित प्रवृत्ति
  gocharAnalysis: string; // ग्रहगोचरको विस्तृत विश्लेषण
  career: string; // कार्यक्षेत्र, जागिर तथा व्यवसाय
  finance: string; // आम्दानी, खर्च, बचत तथा आर्थिक योजना
  loveAndFamily: string; // परिवार, प्रेम तथा दाम्पत्य जीवन
  education: string; // शिक्षा, अध्ययन तथा प्रतिस्पर्धा
  health: string; // स्वास्थ्य तथा जीवनशैलीसम्बन्धी सामान्य मार्गदर्शन
  travelAndSocial: string; // यात्रा, सम्पर्क तथा सामाजिक प्रतिष्ठा
  property: string; // घरजग्गा, सवारीसाधन तथा सम्पत्तिसम्बन्धी सम्भावित विषय
  newVentures: string; // नयाँ काम सुरु गर्ने विषयमा विचार गर्नुपर्ने पक्ष
  favorableAndCautionPeriods: string; // महिनाका अनुकूल र सावधानी अपनाउनुपर्ने अवधि
  spiritualSadhana: string; // आध्यात्मिक साधना, जप, दान तथा पूजासम्बन्धी परम्परागत सुझाव
  monthlyReview: string; // महिनाको अन्त्यमा समीक्षा गर्नुपर्ने मुख्य विषय
  isPublished: boolean;
  updatedAt: string;
  version: number;
}

export interface YearlyRashifalItem {
  id: string;
  yearBS: number; // e.g. 2083
  rashiId: number;
  rashiName: string;
  overallScore: number; // 0-100
  overallVerdict: string;
  yearlyOverview: string; // वर्षको समग्र ज्योतिषीय विश्लेषण
  majorPlanetaryTransits: string; // प्रमुख ग्रहहरूको गोचर र त्यसको व्याख्या (गुरु, शनि, राहु/केतु)
  career: string; // कार्यक्षेत्र, जागिर, व्यवसाय तथा उद्यम
  finance: string; // आर्थिक अवस्था, आम्दानी, खर्च तथा बचत
  education: string; // शिक्षा, उच्च अध्ययन तथा प्रतिस्पर्धा
  loveAndMarriage: string; // प्रेम, विवाह तथा दाम्पत्य सम्बन्ध
  familyAndSocial: string; // पारिवारिक जीवन तथा सामाजिक प्रतिष्ठा
  propertyAndVehicles: string; // घरजग्गा, सम्पत्ति तथा सवारीसाधन
  travelAndAbroad: string; // यात्रा तथा विदेशसम्बन्धी सम्भावनाको परम्परागत ज्योतिषीय विश्लेषण
  healthAndWellness: string; // स्वास्थ्य तथा जीवनशैलीसम्बन्धी सामान्य सावधानी
  keyTransitTimelines: string; // वर्षका प्रमुख ग्रहगोचरका समय
  monthlyTrendsOverview: string; // महिनाअनुसार वर्षभरिका मुख्य प्रवृत्ति
  opportunitiesAndCautions: string; // अवसर तथा सावधानीका विषय
  spiritualRemedies: string; // आध्यात्मिक साधना, जप, दान तथा धार्मिक अनुष्ठानसम्बन्धी सुझाव
  practicalGuidance: string; // वर्षभरिका लागि व्यावहारिक मार्गदर्शन
  yearEndSelfReview: string; // वर्षको अन्त्यमा आत्मसमीक्षा गर्नुपर्ने विषय
  isPublished: boolean;
  updatedAt: string;
  version: number;
}

export const BALANANDA_RASHIFAL_UPDATED_EVENT = 'balananda_rashifal_updated';

const STORAGE_KEY_DAILY = 'balananda_daily_rashifal_v2';
const STORAGE_KEY_MONTHLY = 'balananda_monthly_rashifal_v2';
const STORAGE_KEY_YEARLY = 'balananda_yearly_rashifal_v2';

// ----------------------------------------------------------------------------
// 1. Classical Default Seed Generators for All 12 Rashis
// ----------------------------------------------------------------------------

export function generateDefaultDailyForRashi(rashiId: number, dateBS: string, dateAD: string): DailyRashifalItem {
  const rashi = RASHI_DATA.find(r => r.id === rashiId) || RASHI_DATA[0];
  const name = rashi.name;

  const luckyColors = ['रातो', 'सेतो', 'पहेंलो', 'गुलाबी', 'सुन्तला', 'हरियो', 'आकाशी', 'गाढा रातो', 'सुनौलो', 'नीलो', 'हल्का नीलो', 'हलेदो'];
  const luckyNumbers = ['९', '६', '५', '२', '१', '५', '६', '९', '३', '८', '८', '३'];
  const luckyDirections = ['पूर्व', 'दक्षिण-पूर्व', 'उत्तर', 'उत्तर-पश्चिम', 'पूर्व', 'उत्तर', 'पश्चिम', 'उत्तर', 'ईशान', 'दक्षिण', 'पश्चिम', 'ईशान'];
  const mantras = [
    'ॐ क्रां क्रीं क्रौं सः भौमाय नमः',
    'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः',
    'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः',
    'ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः',
    'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः',
    'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः',
    'ॐ शुं शुक्राय नमः',
    'ॐ अं अङ्गारकाय नमः',
    'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः',
    'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः',
    'ॐ शं शनैश्चराय नमः',
    'ॐ बृं बृहस्पतये नमः'
  ];

  const color = luckyColors[rashiId - 1] || 'पहेंलो';
  const num = luckyNumbers[rashiId - 1] || '३';
  const dir = luckyDirections[rashiId - 1] || 'पूर्व';
  const mantra = mantras[rashiId - 1] || 'ॐ नमो भगवते वासुदेवाय';

  return {
    id: `daily_${rashiId}_${dateBS}`,
    dateBS,
    dateAD,
    rashiId,
    rashiName: name,
    overallScore: 78 + ((rashiId * 3) % 18),
    overallVerdict: rashiId % 2 === 0 ? 'उत्कृष्ट एवं सफलताप्रद दिन' : 'शुभ एवं सकारात्मक ऊर्जापूर्ण दिन',
    overallSummary: `${name} राशिका जातकहरूका लागि आजको दिन चन्द्रमा तथा गोचर ग्रहहरूको अनुकूलताले गर्दा आत्मबल उच्च रहनेछ। सोचेका कार्यहरूमा अग्रसर हुँदा सकारात्मक नतिजा हात लाग्नेछ।`,
    career: `कार्यक्षेत्रमा तपाईंको दक्षता र लगनशीलताको कदर हुनेछ। व्यापार तथा नोकरीमा नयाँ अवसरहरूको ढोका खुल्ने प्रबल सम्भावना छ। सहयोगी साथीभाइबाट समयमै साथ मिल्नेछ।`,
    finance: `आर्थिक दृष्टिले दिन सन्तोषजनक रहनेछ। रोकिएको धन फिर्ता आउने वा नयाँ आम्दानीको बाटो फेला पर्न सक्नेछ। अनावश्यक विलासिताका वस्तुमा हुने खर्चमा भने नियन्त्रण राख्नुहोला।`,
    loveAndFamily: `पारिवारिक वातावरण सौहार्दपूर्ण रहनेछ। दाम्पत्य जीवनमा आपसी समझदारी र प्रेमभाव बढ्नेछ। अविवाहितहरूका लागि पारिवारिक कुराकानी अघि बढ्न सक्नेछ।`,
    education: `अध्ययन-अध्यापन तथा बौद्धिक विमर्शमा एकाग्रता बढ्नेछ। प्रतिस्पर्धी परीक्षा तथा अन्तर्वार्तामा सामेल हुनेहरूका लागि आजको दिन आत्मविश्वासी साबित हुनेछ।`,
    health: `स्वास्थ्य अवस्था सामान्यतया सबल रहनेछ। शारीरिक स्फूर्तिका लागि बिहानको हिँडडुल र सन्तुलित आहारमा ध्यान दिनुहोस्। पानी प्रशस्त पिउनुहोला।`,
    social: `सामाजिक तथा सामुदायिक गतिविधिमा सक्रियता बढ्नेछ। मान्यजन तथा विशिष्ट व्यक्तिहरूसँगको भेटघाटले मान-प्रतिष्ठामा वृद्धि गराउनेछ।`,
    travel: `नजिकको र छोटो दूरीको फलदायी यात्राको सम्भावना छ। नयाँ कामको प्रारम्भ गर्दा दिउँसोको शुभ समय चयन गर्दा बढी फलदायी हुनेछ।`,
    favorableTime: 'बिहान ०८:१५ देखि १०:३० सम्म र दिउँसो ०१:४५ देखि ०३:१५ सम्म',
    cautionTime: 'राहुकालको समय (दिउँसो १:३० देखि ३:०० बीचमा महत्वपूर्ण सम्झौता नगर्नुहोला)',
    luckyColor: color,
    luckyNumber: num,
    luckyDirection: dir,
    mantra,
    remedy: `आज बिहान घरबाट निस्कँदा इष्टदेवको स्मरण गरी मन्त्र जप गर्नुहोस् र सम्भव भए गाई वा बटुकलाई फलफूल/गुलियो अर्पण गर्नुहोस्।`,
    specialGuidance: `कुनै पनि काम गर्दा धैर्य र संयम नगुमाउनुहोस्। सकारात्मक सोचका साथ गरिएको मिहिनेतले अवश्य उत्तम फल दिनेछ।`,
    transitSummary: `चन्द्रमाको गोचर अनुकूल भावमा रहँदा मानसिक शान्ति तथा ग्रहहरूको समन्वयले भाग्य वृद्धिमा टेवा पुर्‍याउनेछ।`,
    isPublished: true,
    updatedAt: new Date().toISOString(),
    version: 1
  };
}

export function generateDefaultMonthlyForRashi(rashiId: number, yearBS: number, monthBS: number, monthName: string): MonthlyRashifalItem {
  const rashi = RASHI_DATA.find(r => r.id === rashiId) || RASHI_DATA[0];
  const name = rashi.name;

  return {
    id: `monthly_${rashiId}_${yearBS}_${monthBS}`,
    yearBS,
    monthBS,
    monthName,
    rashiId,
    rashiName: name,
    overallScore: 80 + ((rashiId * 2) % 15),
    overallVerdict: 'प्रगतिशील एवं आर्थिक उन्नतिकारक महिना',
    overallSummary: `वि.सं. ${toDevanagariNumerals(yearBS)} को ${monthName} महिना ${name} राशिका लागि समग्रमा उत्साहजनक र उपलब्धिमूलक रहने देखिन्छ। ग्रहगोचरको प्रभावले दीर्घकालीन कार्ययोजनाहरू अघि बढाउन अनुकूल वातावरण बन्नेछ।`,
    trendBeginMidEnd: `महिनाको पहिलो दश दिन सामान्य प्रयासबाटै कार्यसिद्धि हुनेछ। महिनाको मध्य भाग (११ देखि २० गते) मा खर्च नियन्त्रण र स्वास्थ्यमा सामान्य सजगता अपनाउनुपर्नेछ। अन्तिम दश दिन भने आर्थिक लाभ र सामाजिक प्रतिष्ठाका दृष्टिले सर्वाधिक सबल रहनेछ।`,
    gocharAnalysis: `सूर्यदेव तथा राशिको स्वामी ग्रहको अनुकूल गोचरका कारण कार्यसम्पादनमा ऊर्जा मिल्नेछ। बृहस्पति (गुरु) को दृष्टिले ज्ञान र विवेकमा वृद्धि गराउनेछ भने शनिदेवको प्रभावले धैर्यताको परीक्षा लिन सक्नेछ।`,
    career: `जागिर तथा पेसागत क्षेत्रमा पदोन्नति वा नयाँ जिम्मेवारी प्राप्त हुने योग छ। व्यापार-व्यवसायमा नयाँ बजार विस्तार गर्न सकिनेछ। सहकर्मीहरूसँगको समन्वय फलदायी साबित हुनेछ।`,
    finance: `आम्दानीका नयाँ स्रोतहरू पहिचान हुनेछन्। बचतमा वृद्धि हुने सम्भावना छ। विगतको लगानीबाट राम्रो प्रतिफल आउला। शेयर बजार वा जोखिमपूर्ण क्षेत्रमा लगानी गर्दा अग्रजहरूको सल्लाह लिनुहोला।`,
    loveAndFamily: `परिवारमा मांगलिक तथा धार्मिक कार्यको आयोजना हुन सक्नेछ। दाम्पत्य सम्बन्धमा मिठास आउनेछ। सन्तान पक्षबाट सुखद समाचार सुन्न पाइनेछ।`,
    education: `विद्यार्थीहरूका लागि यो महिना उच्च सफलताको रहनेछ। प्रतिस्पर्धात्मक परीक्षामा राम्रो नतिजा हात लाग्नेछ। विदेश अध्ययनको प्रयासमा रहेकाहरूका लागि अनुकूल खबर मिल्न सक्छ।`,
    health: `स्वास्थ्य सामान्यतया अनुकूल रहनेछ। खानपानमा अनियमितताका कारण ग्यास्ट्रिक वा पाचन सम्बन्धी सामान्य समस्या देखिन सक्ने भएकाले सात्विक भोजनलाई प्राथमिकता दिनुहोला।`,
    travelAndSocial: `व्यावसायिक तथा धार्मिक तीर्थाटनको योग बन्नेछ। सामाजिक उत्तरदायित्व पूरा गर्दा समाजमा तपाईंको व्यक्तित्वको प्रशंसा हुनेछ।`,
    property: `घर, जग्गा वा सवारी साधन खरिदबिक्रीको योजना बनाउँदै हुनुहुन्छ भने यो महिना कागजी प्रक्रिया पूरा गर्न उत्तम रहनेछ।`,
    newVentures: `नयाँ व्यापार वा साझेदारी सुरु गर्न महिनाको प्रारम्भिक र अन्तिम साता विशेष शुभ छ। सम्झौता गर्दा स्पष्टता कायम राख्नुहोला।`,
    favorableAndCautionPeriods: `यस महिनाका १ देखि १० गते र २१ देखि २८ गते विशेष अनुकूल रहनेछन्। १२ देखि १५ गतेसम्म ठूला आर्थिक निर्णय गर्दा सचेत रहनुहोला।`,
    spiritualSadhana: `प्रत्येक सोमबार वा बिहीबार इष्टदेवको आराधना, विष्णु सहस्रनाम वा शिव महिम्न स्तोत्रको पाठ तथा असहायलाई अन्नदान गर्दा ग्रहदोष निवारण हुनेछ।`,
    monthlyReview: `महिनाको अन्त्यमा आफ्नो आम्दानी-खर्चको समीक्षा गर्नुहोस् र अधुरा रहेका कामहरूलाई अर्को महिनाको पहिलो प्राथमिकतामा राख्नुहोस्।`,
    isPublished: true,
    updatedAt: new Date().toISOString(),
    version: 1
  };
}

export function generateDefaultYearlyForRashi(rashiId: number, yearBS: number): YearlyRashifalItem {
  const rashi = RASHI_DATA.find(r => r.id === rashiId) || RASHI_DATA[0];
  const name = rashi.name;

  return {
    id: `yearly_${rashiId}_${yearBS}`,
    yearBS,
    rashiId,
    rashiName: name,
    overallScore: 82 + ((rashiId * 4) % 14),
    overallVerdict: 'भाग्योदय, स्थायित्व तथा चौतर्फी प्रगतिको वर्ष',
    yearlyOverview: `विक्रम संवत् ${toDevanagariNumerals(yearBS)} साल ${name} राशिका जातकहरूका लागि जीवनमा नयाँ आयाम थप्ने महत्वपूर्ण वर्ष सावित हुनेछ। वर्षभरि नै ग्रहहरूको सकारात्मक ऊर्जाले विगतका अधुरा कामहरू सम्पन्न हुनेछन्।`,
    majorPlanetaryTransits: `देवगुरु बृहस्पतिको शुभ दृष्टिले ज्ञान, भाग्य र धर्म भावलाई बलियो बनाउनेछ। कर्मफलदाता शनिदेवको गोचरले मिहिनेतको पूर्ण फल दिलाउनेछ। राहु र केतुको प्रभावले वैदेशिक सम्पर्क र नवीन सोचमा वृद्धि गराउनेछ।`,
    career: `नोकरीमा स्थायित्व, पदोन्नति र स्थानान्तरणका राम्रा सम्भावनाहरू छन्। उद्यमीहरूका लागि नयाँ उद्योग वा शाखा विस्तार गर्न लगानी जुट्नेछ। सरकारी क्षेत्रमा रोकिएका कामहरू फत्ते हुनेछन्।`,
    finance: `आर्थिक दृष्टिले यो वर्ष विगतका वर्षहरूभन्दा धेरै सन्तोषजनक रहनेछ। पैतृक सम्पत्तिबाट लाभ वा नयाँ स्थिर सम्पत्ति (घर/जग्गा) जोड्ने प्रबल योग बन्नेछ। आम्दानीका नियमित र आकस्मिक स्रोतहरू खुल्नेछन्।`,
    education: `उच्च शिक्षा, अनुसन्धान तथा प्राविधिक विषयका विद्यार्थीहरूका लागि वर्ष अत्यन्त फलदायी रहनेछ। राष्ट्रिय तथा अन्तर्राष्ट्रिय स्तरका छात्रवृत्ति वा प्रतिस्पर्धामा सफलता मिल्नेछ।`,
    loveAndMarriage: `अविवाहितहरूका लागि शुभ विवाहको लगन जुर्नेछ। प्रेम सम्बन्ध पारिवारिक सहमतिमा परिणत हुन सक्छ। वैवाहिक जीवनमा सद्भाव, समर्पण र सुख-शान्ति छाउनेछ।`,
    familyAndSocial: `पारिवारिक प्रतिष्ठामा वृद्धि हुनेछ। घरपरिवारमा नयाँ सदस्यको आगमन वा उत्सवको माहोल बन्नेछ। सामाजिक तथा धार्मिक नेतृत्व लिने अवसर मिल्न सक्छ।`,
    propertyAndVehicles: `सवारी साधन खरिद तथा नयाँ आवास निर्माणका लागि वर्षको मध्य भाग अत्यन्त अनुकूल रहनेछ। भौतिक सुखसुविधाका साधनहरूको संकलन हुनेछ।`,
    travelAndAbroad: `वैदेशिक यात्रा, पीआर (PR) वा रोजगारीका लागि गरिएका प्रयासहरू सफल हुनेछन्। देश-विदेशका पवित्र तीर्थस्थलहरूको भ्रमण गर्ने अवसर जुर्नेछ।`,
    healthAndWellness: `वर्षभरि नै शारीरिक स्वास्थ्य सामान्यतया सबल रहनेछ। मौसम परिवर्तन हुँदा वा अत्यधिक कार्यव्यस्तताका बेला मानसिक तनावबाट बच्न योग तथा ध्यानलाई नियमित दिनचर्या बनाउनुहोला।`,
    keyTransitTimelines: `वैशाखदेखि भदौसम्म भाग्य वृद्धि, असोज र कात्तिकमा आर्थिक लगानीमा सतर्कता, तथा मङ्सिरदेखि चैतसम्म चौतर्फी लाभको समय रहनेछ।`,
    monthlyTrendsOverview: `वर्षको प्रारम्भिक महिनाहरूमा योजना निर्माण, मध्य महिनाहरूमा कार्यान्वयन तथा अन्तिम महिनाहरूमा त्यसको सुखद नतिजा प्राप्त हुने चक्र रहनेछ।`,
    opportunitiesAndCautions: `अवसर: नयाँ उद्यम, उच्च अध्ययन, वैदेशिक अवसर र स्थिर सम्पत्ति लाभ। सावधानी: साझेदारीमा स्पष्ट सम्झौता, अनावश्यक ऋण लगानी र जोखिमपूर्ण सवारी हाँकाइबाट बच्नुपर्ने।`,
    spiritualRemedies: `वर्षभरि कुलदेवताको पूजा, नियमित गायत्री मन्त्र वा महामृत्युञ्जय जप, तथा जन्मदिन वा पर्वहरूमा असहाय दीनदुःखीलाई भोजन गराउँदा सम्पूर्ण अनिष्ट निवारण भई श्रीवृद्धि हुनेछ।`,
    practicalGuidance: `समयको सहि सदुपयोग गर्नुहोस्। आलस्य त्यागेर कर्मक्षेत्रमा दृढ रहँदा भाग्यले पनि पूर्ण साथ दिनेछ।`,
    yearEndSelfReview: `वर्षको अन्त्यमा आफूले हासिल गरेका उपलब्धिहरूको मूल्यांकन गर्नुहोस्, पाएका अनुभवबाट सिकेर आगामी वर्षका लागि थप दृढ लक्ष्य निर्धारण गर्नुहोस्।`,
    isPublished: true,
    updatedAt: new Date().toISOString(),
    version: 1
  };
}

// ----------------------------------------------------------------------------
// 2. Storage Readers and Writers
// ----------------------------------------------------------------------------

export function getStoredDailyRashifal(dateBS?: string): DailyRashifalItem[] {
  const targetDateBS = dateBS || convertADToBSFull(new Date()).formattedBS;
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_DAILY) : null;
    let list: DailyRashifalItem[] = raw ? JSON.parse(raw) : [];

    // Filter for target date
    const forDate = list.filter(item => item.dateBS === targetDateBS);
    if (forDate.length === 12) {
      return forDate;
    }

    // If incomplete or missing for this date, generate default Shastric items for all 12 rashis
    const todayAD = new Date().toISOString().split('T')[0];
    const generated: DailyRashifalItem[] = RASHI_DATA.map(r => {
      const existing = forDate.find(f => f.rashiId === r.id);
      return existing || generateDefaultDailyForRashi(r.id, targetDateBS, todayAD);
    });

    // Save and cache back
    const otherDates = list.filter(item => item.dateBS !== targetDateBS);
    const merged = [...otherDates, ...generated];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_DAILY, JSON.stringify(merged));
    }
    return generated;
  } catch (e) {
    console.error('Failed to load stored daily rashifal:', e);
    const todayAD = new Date().toISOString().split('T')[0];
    return RASHI_DATA.map(r => generateDefaultDailyForRashi(r.id, targetDateBS, todayAD));
  }
}

export function getDailyRashifalForRashi(rashiId: number, dateBS?: string): DailyRashifalItem {
  const all = getStoredDailyRashifal(dateBS);
  return all.find(item => item.rashiId === rashiId) || all[0];
}

export function saveDailyRashifalList(items: DailyRashifalItem[]): void {
  try {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEY_DAILY);
    let list: DailyRashifalItem[] = raw ? JSON.parse(raw) : [];

    // Replace or add
    const itemMap = new Map(list.map(i => [`${i.dateBS}_${i.rashiId}`, i]));
    items.forEach(newItem => {
      itemMap.set(`${newItem.dateBS}_${newItem.rashiId}`, {
        ...newItem,
        updatedAt: new Date().toISOString(),
        version: (newItem.version || 1) + 1
      });
    });

    const updated = Array.from(itemMap.values());
    localStorage.setItem(STORAGE_KEY_DAILY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(BALANANDA_RASHIFAL_UPDATED_EVENT, { detail: { type: 'daily', items } }));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Failed to save daily rashifal list:', e);
  }
}

export function getStoredMonthlyRashifal(yearBS?: number, monthBS?: number): MonthlyRashifalItem[] {
  const currentBS = convertADToBSFull(new Date());
  const targetYear = yearBS || currentBS.year;
  const targetMonth = monthBS || currentBS.month;
  const monthName = currentBS.monthName;

  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_MONTHLY) : null;
    let list: MonthlyRashifalItem[] = raw ? JSON.parse(raw) : [];

    const forMonth = list.filter(item => item.yearBS === targetYear && item.monthBS === targetMonth);
    if (forMonth.length === 12) {
      return forMonth;
    }

    const generated: MonthlyRashifalItem[] = RASHI_DATA.map(r => {
      const existing = forMonth.find(f => f.rashiId === r.id);
      return existing || generateDefaultMonthlyForRashi(r.id, targetYear, targetMonth, monthName);
    });

    const otherMonths = list.filter(item => !(item.yearBS === targetYear && item.monthBS === targetMonth));
    const merged = [...otherMonths, ...generated];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_MONTHLY, JSON.stringify(merged));
    }
    return generated;
  } catch (e) {
    console.error('Failed to load stored monthly rashifal:', e);
    return RASHI_DATA.map(r => generateDefaultMonthlyForRashi(r.id, targetYear, targetMonth, monthName));
  }
}

export function getMonthlyRashifalForRashi(rashiId: number, yearBS?: number, monthBS?: number): MonthlyRashifalItem {
  const all = getStoredMonthlyRashifal(yearBS, monthBS);
  return all.find(item => item.rashiId === rashiId) || all[0];
}

export function saveMonthlyRashifalList(items: MonthlyRashifalItem[]): void {
  try {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEY_MONTHLY);
    let list: MonthlyRashifalItem[] = raw ? JSON.parse(raw) : [];

    const itemMap = new Map(list.map(i => [`${i.yearBS}_${i.monthBS}_${i.rashiId}`, i]));
    items.forEach(newItem => {
      itemMap.set(`${newItem.yearBS}_${newItem.monthBS}_${newItem.rashiId}`, {
        ...newItem,
        updatedAt: new Date().toISOString(),
        version: (newItem.version || 1) + 1
      });
    });

    const updated = Array.from(itemMap.values());
    localStorage.setItem(STORAGE_KEY_MONTHLY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(BALANANDA_RASHIFAL_UPDATED_EVENT, { detail: { type: 'monthly', items } }));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Failed to save monthly rashifal list:', e);
  }
}

export function getStoredYearlyRashifal(yearBS?: number): YearlyRashifalItem[] {
  const currentBS = convertADToBSFull(new Date());
  const targetYear = yearBS || currentBS.year;

  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_YEARLY) : null;
    let list: YearlyRashifalItem[] = raw ? JSON.parse(raw) : [];

    const forYear = list.filter(item => item.yearBS === targetYear);
    if (forYear.length === 12) {
      return forYear;
    }

    const generated: YearlyRashifalItem[] = RASHI_DATA.map(r => {
      const existing = forYear.find(f => f.rashiId === r.id);
      return existing || generateDefaultYearlyForRashi(r.id, targetYear);
    });

    const otherYears = list.filter(item => item.yearBS !== targetYear);
    const merged = [...otherYears, ...generated];
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_YEARLY, JSON.stringify(merged));
    }
    return generated;
  } catch (e) {
    console.error('Failed to load stored yearly rashifal:', e);
    return RASHI_DATA.map(r => generateDefaultYearlyForRashi(r.id, targetYear));
  }
}

export function getYearlyRashifalForRashi(rashiId: number, yearBS?: number): YearlyRashifalItem {
  const all = getStoredYearlyRashifal(yearBS);
  return all.find(item => item.rashiId === rashiId) || all[0];
}

export function saveYearlyRashifalList(items: YearlyRashifalItem[]): void {
  try {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEY_YEARLY);
    let list: YearlyRashifalItem[] = raw ? JSON.parse(raw) : [];

    const itemMap = new Map(list.map(i => [`${i.yearBS}_${i.rashiId}`, i]));
    items.forEach(newItem => {
      itemMap.set(`${newItem.yearBS}_${newItem.rashiId}`, {
        ...newItem,
        updatedAt: new Date().toISOString(),
        version: (newItem.version || 1) + 1
      });
    });

    const updated = Array.from(itemMap.values());
    localStorage.setItem(STORAGE_KEY_YEARLY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(BALANANDA_RASHIFAL_UPDATED_EVENT, { detail: { type: 'yearly', items } }));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error('Failed to save yearly rashifal list:', e);
  }
}

export function getAvailableYearlyArchives(): number[] {
  const currentBSYear = convertADToBSFull(new Date()).year;
  const years = [currentBSYear, currentBSYear - 1, currentBSYear - 2, currentBSYear + 1];
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY_YEARLY);
      if (raw) {
        const list: YearlyRashifalItem[] = JSON.parse(raw);
        list.forEach(i => {
          if (!years.includes(i.yearBS)) years.push(i.yearBS);
        });
      }
    }
  } catch (e) {}
  return Array.from(new Set(years)).sort((a, b) => b - a);
}
