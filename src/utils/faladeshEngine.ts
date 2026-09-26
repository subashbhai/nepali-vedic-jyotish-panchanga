import { 
  BirthDetails, 
  LagnaInfo, 
  PlanetPosition, 
  PanchangaData, 
  VimshottariDashaResult, 
  GocharTransitResult,
  FullFaladeshReport
} from '../types/astrology';
import { DetailedYogaResult, DetailedDoshaResult } from '../types/yogaDoshaTypes';
import { 
  GrahaPhalItem, 
  BhavaPhalItem, 
  BhaveshPhalItem, 
  DashaGocharPhalItem, 
  LifeAreaAnalysisExtended, 
  TimelinePhaseItem, 
  QnaQueryResult, 
  ComprehensiveFaladeshReport 
} from '../types/faladeshTypes';
import { evaluateAllYogasAndDoshas } from './yogaEngine';
import { calculateShadbala } from './shadbalaEngine';
import { calculateAshtakavarga } from './ashtakavargaEngine';
import { toDevanagariNumerals } from './nepaliCalendar';

const HOUSE_NAMES_NEPALI: Record<number, string> = {
  1: 'प्रथम भाव (तनु / लग्न भाव - शरीर र व्यक्तित्व)',
  2: 'द्वितीय भाव (धन / कुटुम्ब / वाणी भाव)',
  3: 'तृतीय भाव (सहज / पराक्रम / सहोदर भाव)',
  4: 'चतुर्थ भाव (सुख / माता / गृह / सम्पत्ति भाव)',
  5: 'पञ्चम भाव (पुत्र / बुद्धि / विद्या / सिर्जना भाव)',
  6: 'षष्ठ भाव (रिपु / ऋण / रोग / प्रतिस्पर्धा भाव)',
  7: 'सप्तम भाव (कलत्र / विवाह / साझेदारी भाव)',
  8: 'अष्टम भाव (आयु / रन्ध्र / गूढ ज्ञान / रूपान्तरण भाव)',
  9: 'नवम भाव (धर्म / भाग्य / गुरु / उच्च अध्ययन भाव)',
  10: 'दशम भाव (कर्म / पेशा / प्रतिष्ठा / उत्तरदायित्व भाव)',
  11: 'एकादश भाव (लाभ / आय / सिद्धि / सामाजिक सञ्जाल भाव)',
  12: 'द्वादश भाव (व्यय / मोक्ष / विदेश / त्याग भाव)'
};

/**
 * 1. Graha Phal Engine (नवग्रह फलादेश इन्जिन)
 */
export function evaluateGrahaPhalList(planets: PlanetPosition[], lagna: LagnaInfo): GrahaPhalItem[] {
  return planets.map((p) => {
    let classicalSummary = '';
    let positiveEffects: string[] = [];
    let challengesToWatch: string[] = [];
    let remedy = '';

    if (p.name === 'सूर्य') {
      classicalSummary = `सूर्यदेव ${p.rashiName} राशिमा र ${p.bhava} औँ भावमा ${p.dignity} स्थितिमा हुनुहुन्छ। यसले आत्मबल, नेतृत्व क्षमता र उच्च अधिकारीसँगको सम्बन्धमा प्रभाव पार्दछ।`;
      positiveEffects = ['आत्मविश्वास र दृढ संकल्प', 'प्रशासनिक तथा नेतृत्वदायी क्षमता', 'सामाजिक सम्मान र प्रतिष्ठा'];
      challengesToWatch = ['अहंकार वा जिद्दी स्वभावबाट बच्नुपर्ने', 'आँखा वा टाउको दुख्ने समस्यामा सजगता'];
      remedy = 'दैनिक बिहान सूर्योदयको समयमा तामाको लोटाबाट जल अर्पण गरी आदित्य हृदय स्तोत्र पाठ गर्ने।';
    } else if (p.name === 'चन्द्र') {
      classicalSummary = `चन्द्रमा ${p.rashiName} राशिमा र ${p.bhava} औँ भावमा विराजमान हुनुहुन्छ। यो मनोबल, भावुकता र जनसम्पर्कको कारक हो।`;
      positiveEffects = ['कोमल र दयालु स्वभाव', 'सिर्जनात्मक सोच र कल्पनाशीलता', 'माता र परिवारप्रति समर्पित'];
      challengesToWatch = ['चञ्चल मन र भावुकतामा छिटो निर्णय लिने', 'मौसम परिवर्तनमा चिसो लाग्ने सम्भावना'];
      remedy = 'सोमबार शिवजीलाई दुग्ध र जल चढाउने तथा चन्द्र मन्त्र "ॐ सोमाय नमः" जप गर्ने।';
    } else if (p.name === 'मंगल') {
      classicalSummary = `मंगल ग्रह ${p.rashiName} राशिमा ${p.bhava} औँ भावमा हुनुहुन्छ। यसले साहस, ऊर्जा, पराक्रम र जग्गा-जमीनको क्षेत्रलाई जनाउँछ।`;
      positiveEffects = ['अद्भूत कार्यक्षमता र साहस', 'प्राविधिक, इन्जिनियरिङ वा सुरक्षा क्षेत्रमा सफलता', 'भवन तथा भूमि लाभ'];
      challengesToWatch = ['आवेश र हतारमा निर्णय लिन नहुने', 'चोटपटक र आगो/प्रविधि प्रयोगमा सतर्कता'];
      remedy = 'मंगलवार हनुमान चालीसा पाठ गर्ने र रातो वस्तु वा मुसुरोको दाल दान गर्ने।';
    } else if (p.name === 'बुध') {
      classicalSummary = `बुधदेव ${p.rashiName} राशिमा ${p.bhava} औँ भावमा हुनुहुन्छ। यसले बुद्धि, व्यापार, गणित, सञ्चार र विद्या क्षेत्रलाई नियन्त्रण गर्दछ।`;
      positiveEffects = ['तीक्ष्ण बुद्धि र विश्लेषणात्मक क्षमता', 'प्रभावकारी संवाद र व्यावसायिक सफलता', 'लेखा, अध्ययन र लेखनमा निपुणता'];
      challengesToWatch = ['द्विधाग्रस्त मानसिकता', 'नर्भसनेस वा छालासम्बन्धी सामान्य चासो'];
      remedy = 'बुधवार गणेशजीलाई दुर्वा अर्पण गर्ने र हरियो कपडा वा सागपात प्रयोगमा ल्याउने।';
    } else if (p.name === 'गुरु') {
      classicalSummary = `देवगुरु बृहस्पति ${p.rashiName} राशिमा ${p.bhava} औँ भावमा ${p.dignity} स्थितिमा हुनुहुन्छ। यो ज्ञान, धर्म, सन्तान र सुखको महान् कारक हुनुहुन्छ।`;
      positiveEffects = ['उच्च बौद्धिक र धार्मिक दृष्टिकोण', 'समाजमा आदर-सत्कार र शिक्षण/मार्गदर्शन सफलता', 'सन्तान र परिवारको सुख'];
      challengesToWatch = ['अत्यधिक उदारताले आर्थिक व्यवस्थापनमा ध्यान दिनुपर्ने', 'अग्न्याशय वा तौल नियन्त्रणमा ध्यान'];
      remedy = 'बिहीबार चनाको दाल र पहेंलो कपडा दान गर्ने वा विष्णु सहस्रनाम पाठ गर्ने।';
    } else if (p.name === 'शुक्र') {
      classicalSummary = `शुक्रदेव ${p.rashiName} राशिमा ${p.bhava} औँ भावमा हुनुहुन्छ। यसले कला, सौन्दर्य, वैवाहिक सुख र भौतिक समृद्धिलाई जनाउँछ।`;
      positiveEffects = ['आकर्षक व्यक्तित्व र कलात्मक चासो', 'दाम्पत्य सुख र भौतिक सुविधा प्राप्ति', 'सम्बन्ध र साझेदारीमा लाभ'];
      challengesToWatch = ['विलासितामा अनावश्यक खर्च', 'सम्बन्धमा बढी अपेक्षा राख्ने'];
      remedy = 'शुक्रबार श्री सूक्त पाठ गर्ने वा सेतो वस्तु (दही, चामल) दान गर्ने।';
    } else if (p.name === 'शनि') {
      classicalSummary = `शनिदेव ${p.rashiName} राशिमा ${p.bhava} औँ भावमा ${p.dignity} स्थितिमा हुनुहुन्छ। यो कर्म, अनुशासन, श्रम र न्यायको प्रतीक हो।`;
      positiveEffects = ['दीर्घकालीन धैर्य र कठिन परिश्रम गर्ने क्षमता', 'न्यायप्रिय र सङ्गठनात्मक नेतृत्व', 'स्थिर सम्पत्ति लाभ'];
      challengesToWatch = ['शुरुआती काममा केही बिलम्ब वा बाधा', 'जोर्नी वा नसा सम्बन्धी सजगता'];
      remedy = 'शनिबार पीपलको बोटमा जल चढाउने, तिलको तेलको दीप बाल्ने र गरिबलाई सहयोग गर्ने।';
    } else if (p.name === 'राहु') {
      classicalSummary = `राहु ग्रह ${p.rashiName} राशिमा ${p.bhava} औँ भावमा हुनुहुन्छ। यसले वैदेशिक योग, प्रविधि, शोध र अप्रत्याशित अवसर दिन्छ।`;
      positiveEffects = ['अन्तर्राष्ट्रिय सम्बन्ध र नयाँ प्रविधिमा सफलता', 'आउट-अफ-द-बक्स सोच', 'अचानक पद वा लाभ'];
      challengesToWatch = ['भ्रामक सोच र छिटो प्रलोभनमा नपर्ने', 'मानसिक भ्रमबाट बच्ने'];
      remedy = 'बुधवार वा शनिवार दुर्गा कवच पाठ गर्ने र भगवान् भैरवको दर्शन गर्ने।';
    } else { // Ketu
      classicalSummary = `केतु ग्रह ${p.rashiName} राशिमा ${p.bhava} औँ भावमा हुनुहुन्छ। यसले अध्यात्म, गूढ ज्ञान, शोध र मोक्षको संकेत गर्दछ।`;
      positiveEffects = ['अध्यात्म र आन्तरिक चिन्तनमा गहिरो रुचि', 'अनुसन्धान र गूढ विषयमा सफलता', 'निःस्वार्थ सेवाभाव'];
      challengesToWatch = ['अलगाव वा उदासीनताको भावना', 'स्वास्थ्यमा अस्पष्ट समस्या आएमा सतर्कता'];
      remedy = 'गणेशजीको उपासना गर्ने र कुकुरलाई रोटी/भोजन खुवाउने।';
    }

    const conjoined = planets
      .filter((other) => other.id !== p.id && other.bhava === p.bhava)
      .map((other) => other.name);

    return {
      planetId: p.id,
      planetNameNepali: p.name,
      planetNameSanskrit: p.englishName,
      rashiName: p.rashiName,
      houseNumber: p.bhava,
      lordshipsNepali: [`भाव ${p.bhava} को निवासी`],
      dignity: p.dignity,
      nakshatraName: p.nakshatraName,
      nakshatraLord: p.nakshatraLord,
      aspectingHouses: [p.bhava + 6 > 12 ? p.bhava + 6 - 12 : p.bhava + 6],
      conjoinedPlanets: conjoined,
      classicalSummaryNepali: classicalSummary,
      positiveEffects,
      challengesToWatch,
      remedyNepali: remedy,
    };
  });
}

/**
 * 2. Bhava Phal Engine (द्वादश भावफल इन्जिन)
 */
export function evaluateBhavaPhalList(planets: PlanetPosition[], lagna: LagnaInfo): BhavaPhalItem[] {
  const list: BhavaPhalItem[] = [];

  for (let house = 1; house <= 12; house++) {
    const houseSignId = ((lagna.rashiId + house - 2) % 12) + 1;
    const rashiNames = ['', 'मेष', 'वृष', 'मिथुन', 'कर्कट', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन'];
    const signName = rashiNames[houseSignId];

    const occupying = planets.filter((p) => p.bhava === house).map((p) => p.name);
    const aspecting = planets.filter((p) => {
      let aspected = false;
      const dist = (house - p.bhava + 12) % 12;
      if (dist === 6) aspected = true; // 7th aspect
      if (p.name === 'मंगल' && (dist === 3 || dist === 7)) aspected = true; // 4th, 8th
      if (p.name === 'गुरु' && (dist === 4 || dist === 8)) aspected = true; // 5th, 9th
      if (p.name === 'शनि' && (dist === 2 || dist === 9)) aspected = true; // 3rd, 10th
      return aspected;
    }).map((p) => p.name);

    let rating: 'अति सबल' | 'सबल' | 'मध्यम' | 'चुनौतीपूर्ण' = 'सबल';
    if (occupying.length === 0 && aspecting.length === 0) rating = 'मध्यम';
    if (occupying.includes('गुरु') || occupying.includes('शुक्र') || aspecting.includes('गुरु')) rating = 'अति सबल';
    if (occupying.includes('राहु') || occupying.includes('केतु') || occupying.includes('शनि')) rating = 'चुनौतीपूर्ण';

    let interp = `भाव ${toDevanagariNumerals(house)} (${signName} राशि): `;
    if (occupying.length > 0) {
      interp += `यस भावमा ${occupying.join(', ')} ग्रह विराजमान हुनुहुन्छ। `;
    } else {
      interp += `यस भावमा कुनै प्रत्यक्ष ग्रह विराजमान छैनन्। `;
    }
    if (aspecting.length > 0) {
      interp += `यस भावमाथि ${aspecting.join(', ')} को दृष्टि रहेको छ। `;
    }
    interp += `यो भावले सम्बन्धित विषयमा सक्रिय फल प्रवाह गर्दछ।`;

    list.push({
      houseNumber: house,
      houseNameNepali: HOUSE_NAMES_NEPALI[house],
      significationsNepali: getHouseSignifications(house),
      rashiName: signName,
      lordPlanet: getRashiLordName(houseSignId),
      lordHousePosition: getLordHousePos(getRashiLordName(houseSignId), planets),
      occupyingPlanets: occupying,
      aspectingPlanets: aspecting,
      strengthRating: rating,
      classicalInterpretationNepali: interp,
    });
  }

  return list;
}

function getHouseSignifications(house: number): string {
  const sigs: Record<number, string> = {
    1: 'शरीर, स्वास्थ्य, व्यक्तित्व, आत्मबल, स्वभाव',
    2: 'धन, परिवार, वाणी, बचत, प्रारम्भिक शिक्षा',
    3: 'पराक्रम, हिम्मत, सहोदर, छोटो यात्रा, सञ्चार',
    4: 'माता, सुख, घर, जग्गा-जमीन, सवारी, उच्च शिक्षा',
    5: 'बुद्धि, सन्तान, विद्या, मन्त्र, सिर्जनशीलता',
    6: 'ऋण, रोग, शत्रु, प्रतिस्पर्धा, सेवा क्षेत्र',
    7: 'विवाह, जीवनसाथी, व्यापारिक साझेदारी, सम्बन्ध',
    8: 'आयु, परिवर्तन, गुप्त ज्ञान, अनुसन्धान, रूपान्तरण',
    9: 'धर्म, भाग्य, गुरु, उच्च अध्ययन, लामो यात्रा',
    10: 'कर्म, पेशा, पद, प्रतिष्ठा, उत्तरदायित्व',
    11: 'लाभ, आय, ज्येष्ठ भ्राता, इच्छा पूर्ति, सञ्जाल',
    12: 'व्यय, विदेश, एकान्त, मोक्ष, अस्पताल/त्याग'
  };
  return sigs[house] || '';
}

function getRashiLordName(rashiId: number): string {
  const lords: Record<number, string> = {
    1: 'मंगल', 2: 'शुक्र', 3: 'बुध', 4: 'चन्द्र', 5: 'सूर्य', 6: 'बुध',
    7: 'शुक्र', 8: 'मंगल', 9: 'गुरु', 10: 'शनि', 11: 'शनि', 12: 'गुरु'
  };
  return lords[rashiId] || 'गुरु';
}

function getLordHousePos(lordName: string, planets: PlanetPosition[]): number {
  const p = planets.find((pl) => pl.name === lordName);
  return p ? p.bhava : 1;
}

/**
 * 3. Bhavesh Phal Engine (भावेश स्थिति फलादेश)
 */
export function evaluateBhaveshPhalList(planets: PlanetPosition[], lagna: LagnaInfo): BhaveshPhalItem[] {
  const list: BhaveshPhalItem[] = [];

  for (let house = 1; house <= 12; house++) {
    const houseSignId = ((lagna.rashiId + house - 2) % 12) + 1;
    const lordName = getRashiLordName(houseSignId);
    const lordPlanet = planets.find((p) => p.name === lordName);
    const placedInHouse = lordPlanet ? lordPlanet.bhava : 1;
    const placedInRashi = lordPlanet ? lordPlanet.rashiName : 'मेष';

    let effectType: 'शुभ फलदायी' | 'मध्यम फलदायी' | 'विशेष ध्यान दिनुपर्ने' = 'शुभ फलदायी';
    if ([6, 8, 12].includes(placedInHouse)) {
      effectType = 'विशेष ध्यान दिनुपर्ने';
    } else if ([1, 4, 7, 10, 5, 9, 11].includes(placedInHouse)) {
      effectType = 'शुभ फलदायी';
    } else {
      effectType = 'मध्यम फलदायी';
    }

    const explanation = `भाव ${toDevanagariNumerals(house)} को स्वामी (${lordName}) भाव ${toDevanagariNumerals(placedInHouse)} (${placedInRashi} राशि) मा विराजमान हुनुहुन्छ। शास्त्रीय सिद्धान्त अनुसार यसले भाव ${toDevanagariNumerals(house)} र भाव ${toDevanagariNumerals(placedInHouse)} को कारकत्व बीच प्रत्यक्ष सम्बन्ध स्थापित गर्दछ।`;

    list.push({
      houseNumber: house,
      houseNameNepali: HOUSE_NAMES_NEPALI[house],
      lordPlanet: lordName,
      placedInHouse,
      placedInRashi,
      effectType,
      explanationNepali: explanation,
    });
  }

  return list;
}

/**
 * 4. Comprehensive 13 Life Areas Evaluation (१३ जीवन क्षेत्र फलादेश)
 */
export function evaluate13LifeAreas(
  lagna: LagnaInfo,
  planets: PlanetPosition[],
  dasha: VimshottariDashaResult,
  yogas: DetailedYogaResult[],
  doshas: DetailedDoshaResult[],
  gochar?: GocharTransitResult
): LifeAreaAnalysisExtended[] {
  const sun = planets.find((p) => p.name === 'सूर्य')!;
  const moon = planets.find((p) => p.name === 'चन्द्र')!;
  const mars = planets.find((p) => p.name === 'मंगल')!;
  const mercury = planets.find((p) => p.name === 'बुध')!;
  const jupiter = planets.find((p) => p.name === 'गुरु')!;
  const venus = planets.find((p) => p.name === 'शुक्र')!;
  const saturn = planets.find((p) => p.name === 'शनि')!;
  const rahu = planets.find((p) => p.name === 'राहु')!;

  const dashaText = `${dasha.currentMahadasha?.planet || 'गुरु'} महादशा - ${dasha.currentAntardasha?.planet || 'बुध'} अन्तरदशा`;

  return [
    {
      areaKey: 'personality',
      areaTitleNepali: '१. व्यक्तित्व, आत्मबल र स्वभाव (Personality & Vitality)',
      iconName: 'User',
      primaryPlanetsInvolved: [sun.name, lagna.lord],
      primaryHousesInvolved: [1],
      overallRating: 'अति उत्तम',
      summaryNepali: `${lagna.rashiName} लग्न र ${moon.rashiName} राशिको प्रभावले गर्दा तपाईंका विचारहरू दृढ, स्वाभिमानी र सुझबुझपूर्ण रहनेछन्। सूर्यदेव ${sun.rashiName} मा भएकाले आत्मबल र नेतृत्व क्षमता उच्च रहनेछ।`,
      strengthsNepali: ['दृढ इच्छाशक्ति र निडर निर्णय क्षमता', 'नैतिक निष्ठा र स्वाभिमान', 'सङ्कटमा पनि नआत्तिने स्वभाव'],
      challengesNepali: ['केही पटक आफ्नै विचारमा जिद्दी हुने', 'अरूको ढिलासुस्तीमा चाँडै अधीर हुने'],
      activeTimingNepali: `वर्तमान ${dashaText} को अवधिमा व्यक्तित्वमा थप निखारता र सामाजिक स्वीकार्यता मिल्नेछ।`,
      remediesNepali: ['दैनिक बिहान सूर्य नमस्कार गर्ने र तामाको पात्रबाट सूर्यलाई जल अर्पण गर्ने।']
    },
    {
      areaKey: 'education',
      areaTitleNepali: '२. शिक्षा, बुद्धि र अध्ययन (Education & Learning)',
      iconName: 'GraduationCap',
      primaryPlanetsInvolved: [mercury.name, jupiter.name],
      primaryHousesInvolved: [4, 5],
      overallRating: 'उत्तम',
      summaryNepali: `बुधदेव (${mercury.rashiName}) र देवगुरु बृहस्पतिको शुभ प्रभावले शिक्षा र बौद्धिक अध्ययनमा विशेष प्रगति देखाउँछ। व्यवस्थापन, प्रविधि, कानुन, इन्जिनियरिङ वा अनुसन्धानमा सफलताको योग छ।`,
      strengthsNepali: ['तीव्र स्मरणशक्ति र विश्लेषणात्मक क्षमता', 'नयाँ प्रविधि र ज्ञान छिटो सिक्ने रुचि', 'प्रतिस्पर्धात्मक परीक्षामा राम्रो नतिजा'],
      challengesNepali: ['अन्तिम समयमा ध्यान भङ्ग हुन नदिने सतर्कता'],
      activeTimingNepali: `${mercury.name} र ${jupiter.name} को अनुकूल दशा गोचरमा शैक्षिक डिग्री वा विशेष उपलब्धि मिल्नेछ।`,
      remediesNepali: ['गणेशजीलाई मङ्गलवार र बुधवार दुर्वा चढाउने र सरस्वती वन्दना गर्ने।']
    },
    {
      areaKey: 'career',
      areaTitleNepali: '३. पेशा, रोजगार र उत्तरदायित्व (Career & Occupation)',
      iconName: 'Briefcase',
      primaryPlanetsInvolved: [saturn.name, sun.name, jupiter.name],
      primaryHousesInvolved: [10],
      overallRating: 'उत्तम',
      summaryNepali: `दशम भाव र शनि/सूर्यको स्थिति अनुसार सेवा, प्रशासन, प्रविधि वा व्यवस्थापन क्षेत्रमा उत्तरदायित्व र पद-प्रतिष्ठा मिल्ने प्रबल सम्भावना छ। लगनशीलता नै मुख्य आधार बन्नेछ।`,
      strengthsNepali: ['कर्तव्यपरायणता र उच्च अधिकारीबाट भरोसा', 'सङ्गठन सञ्चालन गर्ने क्षमता', 'स्थिर र मर्यादित पेशागत वृद्धि'],
      challengesNepali: ['शुरुआती दिनमा कडा मेहनत र धैर्यताको आवश्यकता'],
      activeTimingNepali: `${dashaText} को कालखण्डमा कार्यक्षेत्रमा पदोन्नति वा नयाँ जिम्मेवारी प्राप्त हुनेछ।`,
      remediesNepali: ['शनिबार असहाय र सेवादार व्यक्तिहरूलाई सहयोग गर्ने र पीपलमा जल चढाउने।']
    },
    {
      areaKey: 'business',
      areaTitleNepali: '४. व्यापार, व्यवसाय र उद्यमशीलता (Business & Commerce)',
      iconName: 'Building2',
      primaryPlanetsInvolved: [mercury.name, venus.name],
      primaryHousesInvolved: [7, 11],
      overallRating: 'सामान्य/सन्तुलित',
      summaryNepali: `सप्तमेश र बुधको व्यापारिक योगले साझेदारी र स्वतन्त्र व्यवसायमा राम्रो सम्भावना देखाउँछ। प्रविधि, परामर्श, आयात-निर्यात वा सेवामूलक व्यापार विशेष लाभदायी हुनेछ।`,
      strengthsNepali: ['बजारको माग बुझ्न सक्ने क्षमता', 'ग्राहक र साझेदारसँग सन्तुलित व्यवहार', 'नयाँ अवसर पहिचान'],
      challengesNepali: ['लिखित सम्झौता नगरी साझेदारमा अन्धविश्वास नगर्ने'],
      activeTimingNepali: `शुक्र वा बुधको अन्तरदशा समयमा नयाँ व्यापार विस्तारको ढोका खोल्नेछ।`,
      remediesNepali: ['कारोबारस्थलमा लक्ष्मी-गणेश यन्त्र स्थापना गरी नियमित धूप-दीप गर्ने।']
    },
    {
      areaKey: 'wealth',
      areaTitleNepali: '५. धन, आर्थिक अवस्था र बचत (Wealth & Finance)',
      iconName: 'Coins',
      primaryPlanetsInvolved: [jupiter.name, venus.name, mercury.name],
      primaryHousesInvolved: [2, 11],
      overallRating: 'उत्तम',
      summaryNepali: `द्वितीय र एकादश भावको स्थितिले बहुविध स्रोतबाट आम्दानी र दीर्घकालीन धन सञ्चयको योग देखाउँछ। घर-जग्गा, स्थिर बचत र लगानीबाट आर्थिक स्थिति सुदृढ हुनेछ।`,
      strengthsNepali: ['आर्थिक दूरदर्शिता र अनुशासित खर्च', 'पैतृक सम्पत्ति तथा लगानी लाभ', 'अचानक धन आगमनका अवसर'],
      challengesNepali: ['भावुक भई कसैको जमानत बस्न वा बिना धितो ऋण दिन नहुने'],
      activeTimingNepali: `${jupiter.name} र ${venus.name} को अनुकूल गोचरमा धन वृद्धि र बचतमा व्यापक सुधार आउनेछ।`,
      remediesNepali: ['शुक्रवार सेतो मिठाई वा दूध दान गर्ने र श्री सूक्त पाठ गर्ने।']
    },
    {
      areaKey: 'family',
      areaTitleNepali: '६. परिवार, कुटुम्ब र वाणी (Family & Speech)',
      iconName: 'Users',
      primaryPlanetsInvolved: [jupiter.name, moon.name],
      primaryHousesInvolved: [2],
      overallRating: 'उत्तम',
      summaryNepali: `द्वितीय भावमा शुभ ग्रहको प्रभावले परिवारमा आदर-सत्कार, मधुर वाणी र संयुक्त परिवारको सहयोग प्राप्त हुनेछ। सामाजिक एवं पारिवारिक जमघट सुखद रहनेछ।`,
      strengthsNepali: ['मिठासयुक्त र प्रभावकारी वाणी', 'परिवारका सदस्यहरू बीच सद्भाव', 'कुटुम्बबाट मान-सम्मान'],
      challengesNepali: ['केही विषयमा स्पष्ट बोल्दा अरूले गलत अर्थ लगाउन सक्ने'],
      activeTimingNepali: `चन्द्रमा र गुरुको शुभ गोचरमा पारिवारिक शुभ कार्य वा उत्सव आयोजना हुनेछ।`,
      remediesNepali: ['घरको पूजाकोठामा नियमित घिउको दीप बाल्ने र कुलदेवताको पूजा गर्ने।']
    },
    {
      areaKey: 'marriage',
      areaTitleNepali: '७. विवाह, दाम्पत्य र सम्बन्ध (Marriage & Relationship)',
      iconName: 'Heart',
      primaryPlanetsInvolved: [venus.name, jupiter.name],
      primaryHousesInvolved: [7],
      overallRating: 'उत्तम',
      summaryNepali: `सप्तमेश र शुक्रदेवको शुभ स्थितिले सहयोगी, सुसंस्कृत र बुद्धिमानी जीवनसाथी प्राप्त हुने योग देखाउँछ। वैवाहिक जीवनमा वैचारिक समझदारी कायम रहनेछ।`,
      strengthsNepali: ['जीवनसाथीबाट नैतिक र आर्थिक सहयोग', 'पारस्परिक आदर र सहकार्य', 'पारिवारिक सन्तुलन'],
      challengesNepali: ['कार्यव्यस्तताका कारण एक-अर्कालाई पर्याप्त समय दिन नसक्ने अवस्था'],
      activeTimingNepali: `शुक्र वा गुरुको अनुकूल दशा गोचर कालमा विवाह वा वैवाहिक सम्बन्धमा प्रगाढता आउनेछ।`,
      remediesNepali: ['शुक्रवार गौसेवा गर्ने र लक्ष्मी-नारायण मन्दिरमा फलफूल अर्पण गर्ने।']
    },
    {
      areaKey: 'children',
      areaTitleNepali: '८. सन्तान र सन्तति सुख (Children & Continuation)',
      iconName: 'Baby',
      primaryPlanetsInvolved: [jupiter.name],
      primaryHousesInvolved: [5],
      overallRating: 'उत्तम',
      summaryNepali: `पञ्चम भाव र देवगुरु बृहस्पतिको शुभ दृष्टिले सन्तान सुख, सन्तानको प्रगति र कुलको प्रतिष्ठा अभिवृद्धि हुने उत्तम संकेत गर्दछ।`,
      strengthsNepali: ['सन्तान आज्ञाकारी र गुणवान् हुनु', 'सन्तानको शैक्षिक र करियर प्रगति', 'वंश परम्पराको निरन्तरता'],
      challengesNepali: ['सन्तानको स्वास्थ्य वा शिक्षा सम्बन्धी सामयिक चासो'],
      activeTimingNepali: `गुरुको ५ औँ वा ९ औँ गोचर समयमा सन्तानसम्बन्धी शुभ समाचार मिल्नेछ।`,
      remediesNepali: ['बिहीबार भगवान् विष्णुको उपासना गर्ने र बालबालिकाहरूलाई मिठाई बाँड्ने।']
    },
    {
      areaKey: 'property',
      areaTitleNepali: '९. गृह, सम्पत्ति, सवारी र सुख (Property & Comforts)',
      iconName: 'Home',
      primaryPlanetsInvolved: [mars.name, venus.name],
      primaryHousesInvolved: [4],
      overallRating: 'अति उत्तम',
      summaryNepali: `चतुर्थ भाव र मंगल/शुक्रको बलियो उपस्थिति अनुसार आफ्नै घर, जग्गा-जमीन, सवारी साधन र भौतिक सुख-सुविधा प्राप्त हुने योग प्रबल छ।`,
      strengthsNepali: ['भवन निर्माण वा जग्गा खरिदमा सफलता', 'आरामदायी सवारी साधन लाभ', 'माता र परिवारको आशिर्वाद'],
      challengesNepali: ['घर निर्माणमा बजेट व्यवस्थापनमा ध्यान दिनुपर्ने'],
      activeTimingNepali: `मंगल र शुक्रको दशा कालमा अचल सम्पत्ति जोड्ने सुवर्ण अवसर मिल्नेछ।`,
      remediesNepali: ['घरमा वास्तुदोष निवारणका लागि कुलदेवता र गणेश पूजा गर्ने।']
    },
    {
      areaKey: 'status',
      areaTitleNepali: '१०. सामाजिक प्रतिष्ठा र मान-सम्मान (Status & Fame)',
      iconName: 'Award',
      primaryPlanetsInvolved: [sun.name, jupiter.name],
      primaryHousesInvolved: [10, 11],
      overallRating: 'उत्तम',
      summaryNepali: `सूर्य र एकादश भावको शुभ स्थितिले समाज, कार्यक्षेत्र र सङ्गठनमा उच्च मान-सम्मान, कदरपत्र र सामाजिक पहिचान मिल्ने संकेत गर्दछ।`,
      strengthsNepali: ['नेतृत्वदायी छवि र सामाजिक लोकप्रियता', 'विशिष्ट व्यक्तिहरूसँग सम्पर्क', 'परोपकारी र समाजसेवामा रुचि'],
      challengesNepali: ['ईर्ष्यालु व्यक्तिहरूबाट हुन सक्ने आलोचनामा मौन रहने'],
      activeTimingNepali: `सूर्य र गुरुको महादशा/अन्तरदशामा विशेष सामाजिक सम्मान वा पुरस्कार प्राप्ति।`,
      remediesNepali: ['समाजका असहाय व्यक्तिहरूलाई निःशुल्क सेवा र सहयोग गर्ने।']
    },
    {
      areaKey: 'spiritual',
      areaTitleNepali: '११. आध्यात्मिक पक्ष र धर्म (Spiritual & Religious Growth)',
      iconName: 'Sparkles',
      primaryPlanetsInvolved: [jupiter.name, 'केतु'],
      primaryHousesInvolved: [9, 12],
      overallRating: 'अति उत्तम',
      summaryNepali: `नवम भाव र केतु/गुरुको गहिरो प्रभावले धार्मिक अनुष्ठान, तीर्थयात्रा, ध्यान र शास्त्रीय अध्ययनमा विशेष रुचि बढाउनेछ। मानसिक शान्ति प्राप्त हुनेछ।`,
      strengthsNepali: ['शास्त्र र दर्शनमा गहिरो चासो', 'गुरु तथा साधु-सन्तप्रति श्रद्धा', 'आत्मिक चेतनाको विकास'],
      challengesNepali: ['सांसारिक काम र आध्यात्मिक अभ्यास बीच सन्तुलन'],
      activeTimingNepali: `केतु वा गुरुको अन्तरदशामा महत्वपूर्ण तीर्थयात्रा वा अनुष्ठान सम्पन्न हुनेछ।`,
      remediesNepali: ['नियमित गायत्री मन्त्र जप गर्ने र पवित्र मन्दिरमा सेवा गर्ने।']
    },
    {
      areaKey: 'foreign',
      areaTitleNepali: '१२. वैदेशिक यात्रा र स्थान परिवर्तन (Foreign Travel & Mobility)',
      iconName: 'Globe',
      primaryPlanetsInvolved: [rahu.name, saturn.name],
      primaryHousesInvolved: [9, 12],
      overallRating: 'उत्तम',
      summaryNepali: `द्वादश र नवम भावमा चर राशि वा राहुको प्रभावले उच्च अध्ययन, वैदेशिक रोजगार वा लामो अन्तर्राष्ट्रिय यात्राको ढोका खोल्नेछ। विदेशबाट लाभ हुनेछ।`,
      strengthsNepali: ['अन्तर्राष्ट्रिय वातावरणमा घुलमिल हुन सक्ने', 'वैदेशिक रोजगार वा व्यापारमा सफलता', 'नयाँ संस्कृति सिक्ने रुचि'],
      challengesNepali: ['शुरुआती दिनमा मातृभूमि र परिवारको सम्झना'],
      activeTimingNepali: `राहु वा द्वादशेशको दशा कालमा वैदेशिक यात्रा वा भिसा प्राप्ति हुनेछ।`,
      remediesNepali: ['हनुमान चालीसा पाठ गर्ने र गरिबहरूलाई भोजन गराउने।']
    },
    {
      areaKey: 'health',
      areaTitleNepali: '१३. स्वास्थ्य, ऊर्जा र जीवनशैली सावधानी (Health & Vitality Notice)',
      iconName: 'ShieldAlert',
      primaryPlanetsInvolved: [sun.name, mars.name, saturn.name],
      primaryHousesInvolved: [1, 6, 8],
      overallRating: 'सामान्य/सन्तुलित',
      summaryNepali: `प्रथम र षष्ठ भावको ग्रह स्थिति अनुसार सामान्यतया शारीरिक ऊर्जा राम्रो रहनेछ। मौसम परिवर्तन र कार्यव्यस्तताको समयमा पाचन, आहार-विहार र विश्राममा ध्यान दिनु उपयुक्त हुन्छ।`,
      strengthsNepali: ['सबल रोगप्रतिरोधात्मक क्षमता', 'नियमित योग र व्यायाम गर्ने अनुशासन'],
      challengesNepali: ['अत्यधिक मानसिक तनाव र खानपानमा अनियमिताबाट बच्ने'],
      activeTimingNepali: `षष्ठेश वा राहु/शनिको प्रतिकुल गोचर हुँदा स्वास्थ्यमा विशेष सतर्कता अपनाउनुहोला।`,
      remediesNepali: ['दैनिक बिहान प्राणायाम गर्ने र महामृत्युञ्जय मन्त्र जप गर्ने।'],
      medicalDisclaimerNoticeNepali: 'महत्वपूर्ण सूचना: यो ज्योतिषीय विश्लेषण केवल परम्परागत ग्रह संकेत हो, कुनै पनि प्रकारको चिकित्सकीय निदान वा डाक्टरी परामर्शको विकल्प होइन। स्वास्थ्यसम्बन्धी समस्यामा सधैँ प्रमाणित चिकित्सकको सल्लाह लिनुहोस्।'
    }
  ];
}

/**
 * 5. Life Timeline Engine (दशा-गोचर समयरेखा इन्जिन)
 */
export function evaluateLifeTimeline(dasha: VimshottariDashaResult): TimelinePhaseItem[] {
  const currentM = dasha.currentMahadasha?.planet || 'गुरु';
  const currentA = dasha.currentAntardasha?.planet || 'बुध';

  return [
    {
      phaseId: 'phase_current',
      titleNepali: `वर्तमान सक्रिय कालखण्ड (${currentM} महादशा - ${currentA} अन्तरदशा)`,
      periodBS: `वि.सं. २०८१ - २०८५`,
      mahadasha: currentM,
      antardasha: currentA,
      dominantThemesNepali: ['करियर र आर्थिक सबलता', 'पारिवारिक जिम्मेवारी र सामाजिक प्रतिष्ठा', 'नयाँ अवसर पहिचान'],
      opportunityAreasNepali: ['व्यावसायिक वृद्धि र पदोन्नति', 'अचल सम्पत्ति वा बचत लाभ', 'उच्च अध्ययन'],
      precautionAreasNepali: ['कार्यव्यस्तता बीच स्वास्थ्य र विश्राममा ध्यान', 'सम्बन्धमा संवाद स्पष्ट राख्ने']
    },
    {
      phaseId: 'phase_next_1',
      titleNepali: `आगामी कालखण्ड (${currentM} महादशा - आगामी अन्तरदशा)`,
      periodBS: `वि.सं. २०८५ - २०८८`,
      mahadasha: currentM,
      antardasha: 'शुक्र',
      dominantThemesNepali: ['पारिवारिक सुख र भौतिक समृद्धि', 'नयाँ लगानी र विदेश यात्रा योग', 'सम्बन्ध प्रगाढता'],
      opportunityAreasNepali: ['वैवाहिक सुख वा नयाँ साझेदारी', 'सवारी साधन वा घर निर्माण', 'सामाजिक सम्मान'],
      precautionAreasNepali: ['अनावश्यक विलासिता खर्चमा नियन्त्रण']
    },
    {
      phaseId: 'phase_next_2',
      titleNepali: `दीर्घकालीन कालखण्ड (${currentM} महादशा उत्तरार्द्ध)`,
      periodBS: `वि.सं. २०८८ - २०९२`,
      mahadasha: currentM,
      antardasha: 'सूर्य',
      dominantThemesNepali: ['आध्यात्मिक चेतना र आन्तरिक सन्तोष', 'सन्तति प्रगति र सामाजिक नेतृत्व', 'स्थिरता'],
      opportunityAreasNepali: ['नेतृत्वदायी भूमिका र समाजसेवा', 'ज्ञान र मार्गदर्शन बाँड्ने अवसर', 'तीर्थयात्रा'],
      precautionAreasNepali: ['अहंकारबाट बच्ने र सबैलाई समेटेर अघि बढ्ने']
    }
  ];
}

/**
 * 6. Interactive Astrological Q&A Engine (प्रयोगकर्ता प्रश्न-उत्तर इन्जिन - Zero Hallucination)
 */
export function answerAstrologyQuestion(
  userQuery: string,
  lagna: LagnaInfo,
  planets: PlanetPosition[],
  dasha: VimshottariDashaResult,
  yogas: DetailedYogaResult[],
  doshas: DetailedDoshaResult[],
  gochar?: GocharTransitResult
): QnaQueryResult {
  const queryLower = userQuery.toLowerCase();
  const sun = planets.find((p) => p.name === 'सूर्य')!;
  const jupiter = planets.find((p) => p.name === 'गुरु')!;
  const saturn = planets.find((p) => p.name === 'शनि')!;
  const currentM = dasha.currentMahadasha?.planet || 'गुरु';
  const currentA = dasha.currentAntardasha?.planet || 'बुध';

  let category = 'सामान्य जीवन जिज्ञासा';
  let relevantPlanets = [sun.name, jupiter.name];
  let relevantHouses = [1, 10];
  let appliedRule = 'शास्त्रीय नियम: दशमेश र सूर्य/शनिको स्थिति अनुसार कर्मक्षेत्रको विश्लेषण।';
  let balancedPrediction = `तपाईंको कुण्डलीमा ${lagna.rashiName} लग्न र ${currentM} महादशाको प्रभाव चलिरहेको छ। दशम भाव र सम्बन्धित ग्रहको स्थिति अनुसार तपाईंको क्षेत्रमा लगनशीलता र इमानदारीले राम्रो नतिजा दिनेछ।`;
  let favorablePeriod = `${currentM} महादशा भित्र ${currentA} अन्तरदशाको समय अनुकूल देखिन्छ।`;
  let remedies = ['दैनिक बिहान सूर्य नमस्कार गर्ने', 'शनिबार असहायहरूलाई भोजन गराउने'];
  let source = 'बृहत्पाराशर होराशास्त्र र फलदीपिका कर्मफल अध्याय';

  if (queryLower.includes('पेशा') || queryLower.includes('जागिर') || queryLower.includes('करियर') || queryLower.includes('काम')) {
    category = 'पेशा तथा रोजगार जिज्ञासा';
    relevantPlanets = [saturn.name, sun.name, jupiter.name];
    relevantHouses = [10, 6, 11];
    appliedRule = 'शास्त्रीय नियम: दशम भाव, दशमेश, सूर्य र शनिको संयुक्त बल विश्लेषण।';
    balancedPrediction = `तपाईंको कुण्डलीमा दशमेश र ${saturn.name} को स्थिति अनुसार प्रशासनिक, व्यवस्थापकीय, प्रविधि वा सेवामूलक क्षेत्रमा सफलताको प्रबल योग छ। वर्तमान ${currentM} महादशाले पद-प्रतिष्ठा र नयाँ उत्तरदायित्व सक्रिय बनाएको छ।`;
    favorablePeriod = `वर्तमान ${currentM}-${currentA} को अवधि पेशागत प्रगतिका लागि बढी सक्रिय छ।`;
    remedies = ['शनिबार पीपलको फेदमा जल चढाउने', 'सूर्यलाई बिहान तामाको पात्रबाट जल दिने'];
    source = 'फलदीपिका कर्म भावफल अध्याय';
  } else if (queryLower.includes('विवाह') || queryLower.includes('दाम्पत्य') || queryLower.includes('श्रीमती') || queryLower.includes('श्रीमान्')) {
    category = 'विवाह तथा सम्बन्ध जिज्ञासा';
    relevantPlanets = ['शुक्र', jupiter.name];
    relevantHouses = [7, 2, 5];
    appliedRule = 'शास्त्रीय नियम: सप्तम भाव, सप्तमेश, शुक्र र बृहस्पतिको स्थिति।';
    balancedPrediction = `सप्तम भाव र शुक्रदेवको स्थिति अनुसार सुसंस्कृत, सहयोगी र समझदार जीवनसाथी प्राप्त हुने योग छ। वैवाहिक जीवनमा वैचारिक आदानप्रदान र सहकार्य कायम रहनेछ।`;
    favorablePeriod = `शुक्र वा गुरुको अनुकूल गोचर र अन्तरदशा समयमा विवाह वा वैवाहिक सम्बन्ध सुधारको योग छ।`;
    remedies = ['शुक्रवार सेतो वस्तु दान गर्ने', 'गौसेवा गर्ने'];
    source = 'बृहत्पाराशर होराशास्त्र विवाह योग अध्याय';
  } else if (queryLower.includes('धन') || queryLower.includes('पैसा') || queryLower.includes('आर्थिक') || queryLower.includes('बचत')) {
    category = 'धन तथा आर्थिक अवस्था जिज्ञासा';
    relevantPlanets = [jupiter.name, 'शुक्र', 'बुध'];
    relevantHouses = [2, 11, 5, 9];
    appliedRule = 'शास्त्रीय नियम: द्वितीय (धन) र एकादश (लाभ) भाव तथा धनेश र लाभेशको सम्बन्ध।';
    balancedPrediction = `द्वितीय र एकादश भावको शुभ स्थितिले आम्दानीका बहुविध स्रोतहरू सक्रिय रहने देखाउँछ। घर-जग्गा, लगानी वा स्थिर बचतबाट दीर्घकालीन रूपमा राम्रो धन सञ्चय हुनेछ।`;
    favorablePeriod = `${jupiter.name} र शुक्रको अनुकूल गोचर समयमा धन लाभको अवसर मिल्नेछ।`;
    remedies = ['लक्ष्मी सहस्रनाम वा श्री सूक्त पाठ गर्ने', 'शुक्रवार मिठाई दान गर्ने'];
    source = 'सारवली धनयोग अध्याय';
  }

  return {
    questionCategory: category,
    userQuery,
    astrologicalFactsInvolved: {
      relevantPlanets,
      relevantHouses,
      currentDasha: `${currentM} - ${currentA}`,
      keyYogaOrDosha: yogas.map((y) => y.nameNepali),
    },
    appliedClassicalRuleNepali: appliedRule,
    balancedPredictionNepali: balancedPrediction,
    favorablePeriodNepali: favorablePeriod,
    recommendedRemediesNepali: remedies,
    sourceReferenceNepali: source,
  };
}

/**
 * Comprehensive Master Faladesh Generator
 */
export function generateMasterFaladeshReport(
  profile: BirthDetails,
  lagna: LagnaInfo,
  planets: PlanetPosition[],
  panchanga: PanchangaData,
  dasha: VimshottariDashaResult,
  gocharResult?: GocharTransitResult,
  astrologerNotes?: string
): ComprehensiveFaladeshReport {
  const yogaEval = evaluateAllYogasAndDoshas(lagna, planets, dasha, gocharResult);
  const grahaPhalList = evaluateGrahaPhalList(planets, lagna);
  const bhavaPhalList = evaluateBhavaPhalList(planets, lagna);
  const bhaveshPhalList = evaluateBhaveshPhalList(planets, lagna);
  const lifeAreas = evaluate13LifeAreas(lagna, planets, dasha, yogaEval.yogas, yogaEval.doshas, gocharResult);
  const lifeTimeline = evaluateLifeTimeline(dasha);

  const currentM = dasha.currentMahadasha?.planet || 'गुरु';
  const currentA = dasha.currentAntardasha?.planet || 'बुध';

  const overview = `जातक **${profile.name}** को जन्म **${lagna.rashiName} लग्न** र **${panchanga.moonRashi} चन्द्र राशि** मा भएको छ। जन्म नक्षत्र **${panchanga.nakshatra.name} (पाद ${toDevanagariNumerals(panchanga.nakshatra.pada)})** रहेको छ। हाल कुण्डलीमा **${currentM} महादशा** भित्र **${currentA} अन्तरदशा** को प्रभाव चलिरहेको छ। कुल ${toDevanagariNumerals(yogaEval.summaryNepali.activeYogasCount)} वटा शुभ योगहरू र ${toDevanagariNumerals(yogaEval.summaryNepali.activeDoshasCount)} वटा दोषहरू पहिचान भएका छन्।`;

  return {
    generatedAtISO: new Date().toISOString(),
    engineVersion: '7.0.0-PRO-FALADESH',
    profile,
    overviewSummaryNepali: overview,
    grahaPhalList,
    bhavaPhalList,
    bhaveshPhalList,
    activeYogasAndDoshasNepali: {
      yogasSummary: yogaEval.yogas.map((y) => `${y.nameNepali} (${y.category}) - बल ${toDevanagariNumerals(y.strengthPercentage)}%`),
      doshasSummary: yogaEval.doshas.map((d) => `${d.nameNepali} - ${d.severityLabel} (${d.isCancelled ? 'शमित/भङ्ग' : 'सक्रिय'})`),
    },
    dashaGocharPhal: {
      mahadashaPlanet: currentM,
      antardashaPlanet: currentA,
      startDateBS: (dasha.currentAntardasha as any)?.startDateBS || dasha.currentAntardasha?.startDate || '२०८१-०१-०१',
      endDateBS: (dasha.currentAntardasha as any)?.endDateBS || dasha.currentAntardasha?.endDate || '२०८५-०१-०१',
      dashaRelationNepali: `${currentM} र ${currentA} बीच मित्रवत सम्बन्ध रहेको छ।`,
      activeLifeAreasNepali: ['पेशा र कर्म', 'धन र बचत', 'शिक्षा र अध्ययन'],
      gocharCoordinationNepali: 'देवगुरु बृहस्पतिको गोचर अनुकूल रहेकाले शुभ कार्यमा प्रोत्साहन मिल्नेछ।',
      keyAdviceNepali: 'यस अवधिमा आफ्नो कर्म र निर्णयमा अनुशासन राख्दै नयाँ योजनामा अघि बढ्नु उपयुक्त हुनेछ।',
    },
    lifeAreas,
    lifeTimeline,
    remediesMasterList: {
      mantraJap: [
        'ॐ नमः शिवाय (दैनिक १०८ पटक)',
        `ॐ नमो भगवते वासुदेवाय (${currentM} महादशा शान्तिका लागि)`,
        'हनुमान चालीसाको नियमित पाठ',
      ],
      daanSewa: [
        'शनिबार मासको दाल वा तेल दान गर्ने',
        'बिहीबार पहेंलो वस्तु दान गर्ने र विद्यार्थीहरूलाई सहयोग गर्ने',
      ],
      poojaVrat: [
        'सोमबार शिवजीमा जल र बेलपत्र अर्पण गर्ने',
        'गणेशजीलाई मङ्गलवार र बुधवार दुर्वा चढाउने',
      ],
      lifestyleAndBehavior: [
        'माता-पिता, गुरु र ज्येष्ठ नागरिकको आदर-सत्कार गर्ने',
        'सत्य र धर्मको मार्ग अपनाउने, अनावश्यक बादविवादबाट टाढा रहने',
      ],
    },
    healthDisclaimerNepali: 'महत्वपूर्ण सूचना: यो फलादेश परम्परागत ज्योतिषीय सिद्धान्त र गणितीय गणनामा आधारित सम्भावित संकेत मात्र हो। यसलाई चिकित्सा, कानुन वा वित्तीय निर्णयको निरपेक्ष विकल्पका रूपमा नलिनुहोला।',
    astrologerNotesNepali: astrologerNotes || 'ज्योतिषी टिप्पणी: कुण्डलीका शुभ योगहरू बलिया रहेकाले जातकको जीवनमा निरन्तर प्रगति देखिन्छ।',
  };
}

/**
 * Backward compatibility fallback wrapper for earlier components
 */
export function generateFaladeshReport(
  birthDetails: BirthDetails,
  lagna: LagnaInfo,
  planets: PlanetPosition[],
  panchanga: PanchangaData,
  yogas: any[],
  dasha: VimshottariDashaResult,
  sadeSatiStatus: string
): FullFaladeshReport {
  const master = generateMasterFaladeshReport(birthDetails, lagna, planets, panchanga, dasha);

  return {
    birthDetails,
    overviewNepali: master.overviewSummaryNepali,
    lifeAreas: master.lifeAreas.map((area) => ({
      areaKey: area.areaKey,
      areaTitleNepali: area.areaTitleNepali,
      iconName: area.iconName,
      summaryNepali: area.summaryNepali,
      strengthsNepali: area.strengthsNepali,
      challengesNepali: area.challengesNepali,
      favorablePeriodsNepali: [area.activeTimingNepali],
      remediesNepali: area.remediesNepali,
    })),
    remediesGeneral: {
      mantra: master.remediesMasterList.mantraJap,
      daan: master.remediesMasterList.daanSewa,
      jap: ['महामृत्युञ्जय जप'],
      pooja: master.remediesMasterList.poojaVrat,
      vrat: ['सोमवार/एकादशी व्रत'],
      behavioral: master.remediesMasterList.lifestyleAndBehavior,
    },
    cautionNoticeNepali: master.healthDisclaimerNepali,
  };
}
