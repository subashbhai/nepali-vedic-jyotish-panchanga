import { 
  BirthDetails, 
  PanchangaData, 
  LagnaInfo, 
  PlanetPosition, 
  RashiName 
} from '../types/astrology';
import { VASTU_ZONES, VastuZone } from './vastuEngine';
import { toDevanagariNumerals } from './nepaliCalendar';

export interface DailyVastuSuggestion {
  id: string;
  category: 'energy' | 'wealth' | 'peace' | 'career' | 'health' | 'study';
  categoryTitleNepali: string;
  titleNepali: string;
  primaryDirection: string; // e.g. 'उत्तर-पूर्व (ईशान)', 'उत्तर (कुबेर)', 'पूर्व (इन्द्र)', etc.
  directionCode: string; // 'NE', 'N', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'CENTER'
  elementNepali: string; // 'जल', 'अग्नि', 'वायु', 'पृथ्वी', 'आकाश'
  rulingDeity: string;
  rulingPlanet: string;
  
  // Specific dynamic actionable recommendation
  recommendationNepali: string;
  doActionNepali: string;
  avoidActionNepali: string;
  microRemedyNepali: string;
  
  // Astrology connection summary
  natalAlignmentTextNepali: string;
  auspiciousColor: string;
  auspiciousTimeWindowNepali: string;
}

// Elemental mapping by Rashi
const RASHI_ELEMENT_MAP: Record<string, { element: string; favorableZone: string; zoneCode: string }> = {
  'मेष': { element: 'अग्नि', favorableZone: 'पूर्व / आग्नेय (SE)', zoneCode: 'SE' },
  'वृष': { element: 'पृथ्वी', favorableZone: 'दक्षिण-पश्चिम (नैऋत्य - SW)', zoneCode: 'SW' },
  'मिथुन': { element: 'वायु', favorableZone: 'उत्तर-पश्चिम (वायव्य - NW)', zoneCode: 'NW' },
  'कर्कट': { element: 'जल', favorableZone: 'उत्तर-पूर्व (ईशान - NE)', zoneCode: 'NE' },
  'सिंह': { element: 'अग्नि', favorableZone: 'पूर्व (East)', zoneCode: 'E' },
  'कन्या': { element: 'पृथ्वी', favorableZone: 'उत्तर (कुबेर स्थान - North)', zoneCode: 'N' },
  'तुला': { element: 'वायु', favorableZone: 'पश्चिम (वरुण स्थान - West)', zoneCode: 'W' },
  'वृश्चिक': { element: 'जल', favorableZone: 'उत्तर-पूर्व (ईशान - NE)', zoneCode: 'NE' },
  'धनु': { element: 'अग्नि', favorableZone: 'ईशान / पूर्व (NE/E)', zoneCode: 'NE' },
  'मकर': { element: 'पृथ्वी', favorableZone: 'दक्षिण / पश्चिम (S/W)', zoneCode: 'SW' },
  'कुम्भ': { element: 'वायु', favorableZone: 'पश्चिम / वायव्य (W/NW)', zoneCode: 'NW' },
  'मीन': { element: 'जल', favorableZone: 'उत्तर-पूर्व (ईशान कोण)', zoneCode: 'NE' },
};

// Day-specific Vastu Focus Patterns
const DAY_VASTU_THEMES: Record<string, {
  category: DailyVastuSuggestion['category'];
  categoryTitleNepali: string;
  focusZoneCode: string;
  microTipTemplate: (name: string, rashi: string, lagnaRashi: string) => {
    title: string;
    recommendation: string;
    doAction: string;
    avoidAction: string;
    remedy: string;
    timeWindow: string;
  };
}> = {
  'आइतबार': {
    category: 'career',
    categoryTitleNepali: 'आत्मबल, प्रतिष्ठा र सकारात्मक ऊर्जा',
    focusZoneCode: 'E',
    microTipTemplate: (name, rashi, lagnaRashi) => ({
      title: 'पूर्व दिशा (इन्द्र क्षेत्र) ऊर्जा सक्रियीकरण',
      recommendation: `आज आइतबार सूर्यको दिन हो। ${name ? `${name}को` : ''} जन्म कुण्डली (लग्न: ${lagnaRashi}, राशि: ${rashi}) अनुसार घर वा कार्यकक्षको पूर्व दिशा खुला, सफा र प्रकाशयुक्त राख्दा मान-प्रतिष्ठा र प्रशासनिक कार्यमा विशेष सफलता मिल्नेछ।`,
      doAction: 'बिहानको पहिलो घाम घरभित्र आउन पूर्वका झ्याल-ढोका खुला राख्नुहोस् वा पूर्व भित्तामा तामाको सूर्य प्रतीक राख्नुहोस्।',
      avoidAction: 'पूर्व दिशामा भारी फोहोर, पुराना जुत्ता-चप्पल वा कालो रङ्गका सामान नराख्नुहोस्।',
      remedy: 'बिहान सूर्योदयको समयमा पूर्व फर्किएर तामाको भाँडोबाट सूर्यलाई जल अर्पण गर्नुहोस्।',
      timeWindow: 'सूर्योदयदेखि बिहान ९:३० बजेसम्म'
    })
  },
  'सोमबार': {
    category: 'peace',
    categoryTitleNepali: 'मानसिक शान्ति, जलतत्व र पारिवारिक सौहार्द',
    focusZoneCode: 'NE',
    microTipTemplate: (name, rashi, lagnaRashi) => ({
      title: 'ईशान कोण (उत्तर-पूर्व) जलतत्व सन्तुलन',
      recommendation: `सोमबार चन्द्रमा र महादेवको दिन हो। ${name ? `${name}को` : ''} जन्म चन्द्र राशि ${rashi} को मानसिक शान्तिका लागि घरको उत्तर-पूर्व (ईशान) कोणलाई पूर्णतः सफा र शान्त राख्नु लाभदायक हुन्छ।`,
      doAction: 'ईशान कोणमा सफा तामा वा काँचको कचौरामा शुद्ध जल राखी त्यसमा ताजा फूलका पातहरू राख्नुहोस्।',
      avoidAction: 'ईशान कोणमा गह्रौं फलामे सामान, जुठो भाँडा वा झाडु नराख्नुहोस्।',
      remedy: 'घरको मुख्य द्वार वा उत्तर-पूर्वमा बिहान गंगाजल वा चोखो पानी छर्कनुहोस्।',
      timeWindow: 'बिहान ६:०० देखि ८:३० बजेसम्म'
    })
  },
  'मंगलबार': {
    category: 'energy',
    categoryTitleNepali: 'शौर्य, उत्साह र अग्नितत्व सन्तुलन',
    focusZoneCode: 'SE',
    microTipTemplate: (name, rashi, lagnaRashi) => ({
      title: 'आग्नेय कोण (दक्षिण-पूर्व) भान्सा तथा ऊर्जा नियमन',
      recommendation: `मंगलबार भौम (मंगल) को वार हो। जन्म लग्न ${lagnaRashi} को सुरक्षा र ओज वृद्धिका लागि घरको दक्षिण-पूर्व (आग्नेय) कुनाको ऊर्जा सन्तुलन गर्नु उत्तम हुन्छ।`,
      doAction: 'भान्साको आग्नेय कुनामा दीप प्रज्वलन गर्नुहोस् र खाना पकाउँदा पूर्व फर्किएर पकाउनुहोस्।',
      avoidAction: 'आग्नेय कोणमा पानीको चुहावट (Leaking Tap) वा पानीको जार/ट्याङ्की नराख्नुहोस् (अग्नि-जल वैरभाव)।',
      remedy: 'घरको दक्षिण-पूर्व कुनामा रातो वा सुन्तला रङ्गको हल्का बत्ती बाल्नुहोस्।',
      timeWindow: 'बिहान ७:०० देखि १०:०० बजेसम्म'
    })
  },
  'बुधबार': {
    category: 'study',
    categoryTitleNepali: 'बुद्धि, व्यापार, वाणी र अध्ययन सन्तुलन',
    focusZoneCode: 'N',
    microTipTemplate: (name, rashi, lagnaRashi) => ({
      title: 'उत्तर दिशा (कुबेर तथा बुध स्थान) व्यवस्थापन',
      recommendation: `बुधबार विद्या र व्यापारका कारक बुधदेवको दिन हो। ${name ? `${name}को` : ''} राशि (${rashi}) अनुसार अध्ययन कक्ष वा कार्य टेबल उत्तर वा पूर्व फर्कने गरी राख्दा स्मरणशक्ति र व्यापारिक लाभमा तीव्रता आउँछ।`,
      doAction: 'अध्ययन वा हिसाब-किताब गर्दा उत्तरतर्फ मुख गर्नुहोस् र उत्तर भित्तामा हरियो बिरुवा (मनिप्लान्ट) राख्नुहोस्।',
      avoidAction: 'उत्तर दिशामा फोहोरको डस्टबिन वा बन्द गह्रौं बक्सहरू नराख्नुहोस्।',
      remedy: 'उत्तर दिशामा हरियो कपडामा ५ वटा तुलसीको पात वा हरियो इलायची राख्नुहोस्।',
      timeWindow: 'बिहान ८:०० देखि ११:०० बजेसम्म'
    })
  },
  'बिहीबार': {
    category: 'wealth',
    categoryTitleNepali: 'ज्ञान, समृद्धि, गुरुबल र भाग्यवृद्धि',
    focusZoneCode: 'NE',
    microTipTemplate: (name, rashi, lagnaRashi) => ({
      title: 'ईशान कोण (देव स्थान) र पहेँलो रङ्गको तरङ्ग',
      recommendation: `बिहीबार देवगुरु बृहस्पतिको पावन दिन हो। ${name ? `${name}को` : ''} जन्मकुण्डली अनुसार घरको पूजास्थल, मन्दिर र अध्ययन पुस्तकहरू ईशान कोणमा व्यवस्थित गर्दा गुरुबल मजबुत हुन्छ।`,
      doAction: 'पूजा कोठामा पहेँलो चन्दन, घिउको दियो र धार्मिक ग्रन्थहरूलाई ईशान वा उत्तर दिशामा सफा गरी सजाउनुहोस्।',
      avoidAction: 'ईशान कोणमा जुत्ता-चप्पल, फोहोर कपडा वा मदिरा/तामसिक वस्तु कदापि नराख्नुहोस्।',
      remedy: 'घरको पूजास्थानमा पहेँलो फूल चढाउनुहोस् र ॐ नमो भगवते वासुदेवाय जप गर्नुहोस्।',
      timeWindow: 'बिहान ६:३० देखि ९:३० बजेसम्म'
    })
  },
  'शुक्रबार': {
    category: 'wealth',
    categoryTitleNepali: 'सुख-समृद्धि, ऐश्वर्य र लक्ष्मी वास',
    focusZoneCode: 'SE',
    microTipTemplate: (name, rashi, lagnaRashi) => ({
      title: 'मुख्य प्रवेशद्वार तथा आग्नेय कोण लक्ष्मी आकर्षण',
      recommendation: `शुक्रबार धनधान्यकी देवी महालक्ष्मी र शुक्रदेवको वार हो। ${name ? `${name}को` : ''} चन्द्र राशि ${rashi} को आर्थिक समृद्धि बढाउन घरको मुख्य ढोका र बैठक कोठालाई सुगन्धित र चम्किलो राख्नुपर्छ।`,
      doAction: 'घरको मुख्य ढोकामा सफा पानीमा काँचो दूध र बेसार मिलाई छर्कनुहोस् तथा साँझमा कपूर वा गुगलको धूप बाल्नुहोस्।',
      avoidAction: 'मुख्य ढोका अगाडि च्यातिएका म्याट, भाँच्चिएका सामान वा फोहोर पानी जम्न नदिनुहोस्।',
      remedy: 'उत्तर वा दक्षिण-पूर्वमा चमेली/गुलाबी सुगन्धित अगरबत्ती वा अत्तर प्रयोग गर्नुहोस्।',
      timeWindow: 'साँझ गोधूली बेला (साँझ ५:३० देखि ७:०० बजे)'
    })
  },
  'शनिबार': {
    category: 'health',
    categoryTitleNepali: 'स्थायित्व, वास्तुदोष निवारण र नकारात्मक ऊर्जा निष्कासन',
    focusZoneCode: 'SW',
    microTipTemplate: (name, rashi, lagnaRashi) => ({
      title: 'नैऋत्य कोण (दक्षिण-पश्चिम) भारी र सुदृढ सन्तुलन',
      recommendation: `शनिबार शनिदेव र स्थायित्वको दिन हो। ${name ? `${name}को` : ''} कुण्डली (लग्न: ${lagnaRashi}, राशि: ${rashi}) अनुसार घरको दक्षिण-पश्चिम (नैऋत्य कोण) लाई भारी, बन्द र सुदृढ राख्दा नकारात्मक ऊर्जा र आर्थिक अपव्यय रोकिन्छ।`,
      doAction: 'घरको दक्षिण-पश्चिम कुनामा भारी दराज, सेफ वा मुख्य व्यक्तिको सुत्ने ओछ्यान राख्नुहोस् (टाउको दक्षिण वा पूर्व फर्काएर)।',
      avoidAction: 'नैऋत्य कोणमा खाल्डो, भूमिगत पानीको ट्याङ्की वा मुख्य प्रवेशद्वार नबनाउनुहोस्।',
      remedy: 'घरको चारै कुनामा सिधे नुन (Rock salt) को सानो कचौरा राखी नकारात्मक ऊर्जा शमन गर्नुहोस्।',
      timeWindow: 'साँझ सूर्यास्तपछि (साँझ ६:३० देखि ८:०० बजे)'
    })
  }
};

/**
 * Calculates a dynamic, personalized Daily Vastu Suggestion combining:
 * 1. Current Panchanga Date / Weekday
 * 2. Active Native's Natal Moon Rashi and Lagna Rashi
 * 3. Associated Vastu Zone element and deity rules
 */
export function getDailyVastuSuggestion(
  panchanga: PanchangaData,
  activeProfile: BirthDetails | null,
  lagna?: LagnaInfo,
  planets?: PlanetPosition[]
): DailyVastuSuggestion {
  const dayName = panchanga?.dayNameNepali || 'आइतबार';
  const defaultTheme = DAY_VASTU_THEMES[dayName] || DAY_VASTU_THEMES['आइतबार'];
  
  const userName = activeProfile?.name || '';
  
  // Find Moon Rashi
  const moonPlanet = planets?.find((p) => p.name === 'चन्द्र');
  const moonRashi = (moonPlanet?.rashiName || 'मेष') as RashiName;
  const lagnaRashi = (lagna?.rashiName || 'मेष') as RashiName;
  
  const elementInfo = RASHI_ELEMENT_MAP[moonRashi] || { element: 'अग्नि', favorableZone: 'पूर्व (East)', zoneCode: 'E' };
  
  const themeDetails = defaultTheme.microTipTemplate(userName, moonRashi, lagnaRashi);
  
  // Find corresponding Vastu Zone info
  const zone = VASTU_ZONES.find((z) => z.code === defaultTheme.focusZoneCode) || VASTU_ZONES[0];
  
  const natalAlignmentText = `${userName ? `${userName}को ` : ''}जन्म राशि (${moonRashi} - ${elementInfo.element} तत्व) तथा लग्न (${lagnaRashi}) अनुसार आज ${zone.nameNepali} को ऊर्जा सक्रिय गर्दा विशेष फलदायी हुनेछ।`;

  return {
    id: `vastu_daily_${dayName}_${moonRashi}_${lagnaRashi}`,
    category: defaultTheme.category,
    categoryTitleNepali: defaultTheme.categoryTitleNepali,
    titleNepali: themeDetails.title,
    primaryDirection: zone.nameNepali,
    directionCode: zone.code,
    elementNepali: zone.element,
    rulingDeity: zone.deity,
    rulingPlanet: zone.rulingPlanet,
    recommendationNepali: themeDetails.recommendation,
    doActionNepali: themeDetails.doAction,
    avoidActionNepali: themeDetails.avoidAction,
    microRemedyNepali: themeDetails.remedy,
    natalAlignmentTextNepali: natalAlignmentText,
    auspiciousColor: zone.favorableColor,
    auspiciousTimeWindowNepali: themeDetails.timeWindow
  };
}
