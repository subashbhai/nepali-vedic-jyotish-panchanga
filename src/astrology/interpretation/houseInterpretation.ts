import { PlanetName, RashiName } from '../../types/astrology';
import { LordshipAnalysis, BhavaAnalysis, DignityStatus } from './types';
import { RASHI_LORDS } from './planetDignity';

export interface HouseInfoDefinition {
  titleNepali: string;
  sanskritName: string;
  significationsNepali: string[];
  primaryDomainNepali: string;
}

export const BHAVA_DEFINITIONS: Record<number, HouseInfoDefinition> = {
  1: {
    titleNepali: 'प्रथम भाव (लग्न)',
    sanskritName: 'तनु भाव',
    significationsNepali: ['शरीर र स्वास्थ्य', 'व्यक्तित्व र आत्मबल', 'जीवनदृष्टिकोण', 'नाम र प्रतिष्ठा'],
    primaryDomainNepali: 'आत्मविकास, शारीरिक स्वास्थ्य र जीवनको दिशा',
  },
  2: {
    titleNepali: 'द्वितीय भाव (धन)',
    sanskritName: 'धन भाव',
    significationsNepali: ['सञ्चित धन र सम्पत्ति', 'परिवार र कुटुम्ब', 'वाणी र बोल्ने शैली', 'प्राथमिक शिक्षा'],
    primaryDomainNepali: 'आर्थिक कोष, पारिवारिक सुख र बोली',
  },
  3: {
    titleNepali: 'तृतीय भाव (पराक्रम)',
    sanskritName: 'सहज भाव',
    significationsNepali: ['साहस र पराक्रम', 'भाइ-बहिनी', 'सञ्चार र लेखन', 'छोटो यात्रा र उद्यम'],
    primaryDomainNepali: 'आत्मबल, भाइ-बहिनी सम्बन्ध र सञ्चार',
  },
  4: {
    titleNepali: 'चतुर्थ भाव (सुख)',
    sanskritName: 'सुख / मातृ भाव',
    significationsNepali: ['माता र मातृसुख', 'घर, भूमि र भवन', 'वाहन सुख', 'आन्तरिक शान्ति'],
    primaryDomainNepali: 'गृहसुख, माताको स्वास्थ्य र भौतिक सुविधा',
  },
  5: {
    titleNepali: 'पञ्चम भाव (बुद्धि)',
    sanskritName: 'पुत्र / बुद्धि भाव',
    significationsNepali: ['उच्च शिक्षा र विवेक', 'सन्तान सुख', 'सिर्जनशीलता र कला', 'पूर्वपुण्य र मन्त्रसिद्धि'],
    primaryDomainNepali: 'ज्ञान, बुद्धि, सन्तान र निर्णयक्षमता',
  },
  6: {
    titleNepali: 'षष्ठ भाव (रिपु)',
    sanskritName: 'रिपु / रोग भाव',
    significationsNepali: ['रोग र स्वास्थ्य समस्या', 'ऋण र दायित्व', 'शत्रु र प्रतिस्पर्धा', 'सेवा र अनुशासन'],
    primaryDomainNepali: 'प्रतिस्पर्धी क्षमता, स्वास्थ्य र ऋण/शत्रु निवारण',
  },
  7: {
    titleNepali: 'सप्तम भाव (कलत्र)',
    sanskritName: 'जाया / कलत्र भाव',
    significationsNepali: ['विवाह र दाम्पत्य सुख', 'व्यापारिक साझेदारी', 'सार्वजनिक छवि र जनसम्पर्क', 'विदेश यात्रा'],
    primaryDomainNepali: 'दाम्पत्य जीवन, साझेदारी र व्यापारिक सम्बन्ध',
  },
  8: {
    titleNepali: 'अष्टम भाव (आयु)',
    sanskritName: 'रन्ध्र / आयु भाव',
    significationsNepali: ['आयु र दीर्घायु', 'आकस्मिक परिवर्तन र लाभ/हानि', 'गूढ ज्ञान र अनुसन्धान', 'पैतृक सम्पत्ति'],
    primaryDomainNepali: 'दीर्घायु, परिवर्तन र रहस्यमयी ज्ञान',
  },
  9: {
    titleNepali: 'नवम भाव (भाग्य)',
    sanskritName: 'धर्म / भाग्य भाव',
    significationsNepali: ['भाग्य र उन्नति', 'धर्म र अध्यात्म', 'गुरु र पिता', 'उच्च अध्ययन र दूरयात्रा'],
    primaryDomainNepali: 'भाग्यवृद्धि, उच्च ज्ञान र धार्मिक प्रगति',
  },
  10: {
    titleNepali: 'दशम भाव (कर्म)',
    sanskritName: 'कर्म भाव',
    significationsNepali: ['पेशा र व्यवसाय', 'अधिकार र पद', 'सामाजिक प्रतिष्ठा', 'राज्य सम्मान र कर्म'],
    primaryDomainNepali: 'व्यावसायिक सफलता, प्रतिष्ठा र नेतृत्व',
  },
  11: {
    titleNepali: 'एकादश भाव (लाभ)',
    sanskritName: 'आय / लाभ भाव',
    significationsNepali: ['आय र आर्थिक लाभ', 'इच्छापूर्ति र सफलता', 'मित्रमण्डली र सञ्जाल', 'ज्येष्ठ भ्राता'],
    primaryDomainNepali: 'आर्थिक समृद्धि, सफलता र सञ्जाल',
  },
  12: {
    titleNepali: 'द्वादश भाव (व्यय)',
    sanskritName: 'व्यय / मोक्ष भाव',
    significationsNepali: ['खर्च र व्यय', 'वैदेशिक यात्रा र बसोबास', 'मोक्ष र अध्यात्म', 'एकान्त र त्याग'],
    primaryDomainNepali: 'वैदेशिक सम्बन्ध, खर्च र आन्तरिक अध्यात्म',
  },
};

/**
 * Calculates house lordships for a planet based on Lagna sign.
 */
export function calculateLordshipAnalysis(
  planet: PlanetName,
  lagnaRashiId: number
): LordshipAnalysis {
  const ownedHouses: number[] = [];
  const lordshipTitles: string[] = [];

  for (let house = 1; house <= 12; house++) {
    const houseRashiId = ((lagnaRashiId - 1 + house - 1) % 12) + 1;
    const lord = RASHI_LORDS[houseRashiId];

    if (lord === planet) {
      ownedHouses.push(house);

      let title = `भाव ${house}`;
      if (house === 1) title += ' (लग्नेश)';
      else if (house === 2) title += ' (धनेश/द्वितीयेश)';
      else if (house === 3) title += ' (पराक्रमेश/तृतीयेश)';
      else if (house === 4) title += ' (सुखेश/चतुर्थेश)';
      else if (house === 5) title += ' (पञ्चमेश/विद्येश)';
      else if (house === 6) title += ' (रोगेश/षष्ठेश)';
      else if (house === 7) title += ' (दाम्पत्येश/सप्तमेश)';
      else if (house === 8) title += ' (आयुषेश/अष्टमेश)';
      else if (house === 9) title += ' (भाग्येश/नवमेश)';
      else if (house === 10) title += ' (कर्मेश/दशमेश)';
      else if (house === 11) title += ' (लाभेश/एकादशेश)';
      else if (house === 12) title += ' (व्ययेश/द्वादशेश)';

      lordshipTitles.push(title);
    }
  }

  if (ownedHouses.length === 0) {
    return {
      ownedHouses: [],
      lordshipTitlesNepali: ['छाया ग्रह (राश्याधिपत्य हुँदैन)'],
      isFunctionalBenefic: false,
      isKendraLord: false,
      isTrikonaLord: false,
      isTrikLord: false,
      isMarakaLord: false,
      summaryNepali: `${planet} छाया ग्रह भएकाले यसको कुनै निश्चित राशिको आधिपत्य हुँदैन। यो बसेको भाव र राशिका आधारमा फल प्रदान गर्दछ।`,
    };
  }

  const isKendraLord = ownedHouses.some((h) => [1, 4, 7, 10].includes(h));
  const isTrikonaLord = ownedHouses.some((h) => [1, 5, 9].includes(h));
  const isTrikLord = ownedHouses.some((h) => [6, 8, 12].includes(h));
  const isMarakaLord = ownedHouses.some((h) => [2, 7].includes(h));

  // Parashari Functional Benefic logic
  let isFunctionalBenefic = isTrikonaLord;
  if (ownedHouses.includes(1)) isFunctionalBenefic = true; // Lagnesh is always benefic

  let summaryText = `${planet} यस कुण्डलीमा ${lordshipTitles.join(', ')} को रूपमा दायित्व सम्हाल्दछ।`;
  if (isTrikonaLord) {
    summaryText += ' त्रिकोण भावको स्वामी भएकाले यो ग्रह कुण्डलीका लागि विशेष शुभ र भाग्यवर्धक मानिन्छ।';
  } else if (isTrikLord && !isTrikonaLord) {
    summaryText += ' त्रिक भाव (६, ८, १२) को स्वामी भएकाले यस ग्रहको दशा-भुक्तिमा केही सतर्कता र साधना आवश्यक पर्न सक्छ।';
  }

  return {
    ownedHouses,
    lordshipTitlesNepali: lordshipTitles,
    isFunctionalBenefic,
    isKendraLord,
    isTrikonaLord,
    isTrikLord,
    isMarakaLord,
    summaryNepali: summaryText,
  };
}

/**
 * Performs a comprehensive analysis of a House (Bhava)
 */
export function analyzeBhava(
  houseNumber: number,
  lagnaRashiId: number,
  allPlanetsPositions: Array<{ name: PlanetName; bhava: number; rashiId: number; rashiName: RashiName; dignityStatus?: DignityStatus }>
): BhavaAnalysis {
  const houseRashiId = ((lagnaRashiId - 1 + houseNumber - 1) % 12) + 1;
  const rashiNamesList: RashiName[] = ['मेष', 'वृष', 'मिथुन', 'कर्कट', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन'];
  const rashiName = rashiNamesList[houseRashiId - 1];
  const rashiLord = RASHI_LORDS[houseRashiId];

  const lordObj = allPlanetsPositions.find((p) => p.name === rashiLord);
  const lordPlacementHouse = lordObj ? lordObj.bhava : houseNumber;
  const lordDignity = lordObj?.dignityStatus || 'समराशि';

  const occupyingPlanets = allPlanetsPositions.filter((p) => p.bhava === houseNumber).map((p) => p.name);

  // Aspecting planets calculation
  const aspectingPlanets: PlanetName[] = [];
  allPlanetsPositions.forEach((p) => {
    if (p.bhava === houseNumber) return;
    const dist = ((houseNumber - p.bhava + 12) % 12) || 12;
    if (dist === 7) aspectingPlanets.push(p.name);
    else if (p.name === 'मंगल' && (dist === 4 || dist === 8)) aspectingPlanets.push(p.name);
    else if ((p.name === 'गुरु' || p.name === 'राहु' || p.name === 'केतु') && (dist === 5 || dist === 9)) aspectingPlanets.push(p.name);
    else if (p.name === 'शनि' && (dist === 3 || dist === 10)) aspectingPlanets.push(p.name);
  });

  // Strength Rating
  let rating: 'अति सबल' | 'सबल' | 'सन्तुलित' | 'चुनौतीपूर्ण' = 'सन्तुलित';
  if (lordDignity === 'उच्च' || lordDignity === 'स्वक्षेत्र' || lordDignity === 'मूलत्रिकोण') {
    rating = occupyingPlanets.length > 0 ? 'अति सबल' : 'सबल';
  } else if (lordDignity === 'नीच') {
    rating = 'चुनौतीपूर्ण';
  }

  const houseDef = BHAVA_DEFINITIONS[houseNumber];

  let interpretation = `${houseDef.titleNepali} (${rashiName} राशि) को स्वामी ${rashiLord} भाव ${lordPlacementHouse} मा ${lordDignity} स्थितिमा विराजमान छन्। `;
  if (occupyingPlanets.length > 0) {
    interpretation += `यस भावमा ${occupyingPlanets.join(', ')} ग्रहको उपस्थिति छ। `;
  }
  if (aspectingPlanets.length > 0) {
    interpretation += `यस भावमाथि ${aspectingPlanets.join(', ')} को दृष्टि रहेको छ। `;
  }
  interpretation += `यसले गर्दा ${houseDef.primaryDomainNepali} सम्बन्धी विषयमा ${rating} प्रभाव पर्ने देखिन्छ।`;

  return {
    houseNumber,
    houseTitleNepali: houseDef.titleNepali,
    rashiName,
    rashiLord,
    lordPlacementHouse,
    lordDignity,
    occupyingPlanets,
    aspectingPlanets,
    bhavaStrengthRating: rating,
    significationsNepali: houseDef.significationsNepali,
    overallInterpretationNepali: interpretation,
  };
}
