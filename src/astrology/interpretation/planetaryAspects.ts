import { PlanetName, RashiName } from '../../types/astrology';
import { AspectAnalysis, AspectReceivedAnalysis } from './types';
import { BHAVA_DEFINITIONS } from './houseInterpretation';

const RASHI_NAMES_LIST: RashiName[] = [
  'मेष', 'वृष', 'मिथुन', 'कर्कट', 'सिंह', 'कन्या', 
  'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन'
];

/**
 * Calculates planetary aspects cast by a planet onto other houses and planets.
 */
export function calculateAspectsCast(
  planetName: PlanetName,
  sourceHouse: number,
  lagnaRashiId: number,
  allPlanetsPositions: Array<{ name: PlanetName; bhava: number }>
): AspectAnalysis[] {
  const result: AspectAnalysis[] = [];

  const aspectTargets: Array<{ houseDist: number; aspectName: string }> = [
    { houseDist: 7, aspectName: '७ औँ पूर्ण समदृष्टि (१००%)' },
  ];

  if (planetName === 'मंगल') {
    aspectTargets.push({ houseDist: 4, aspectName: '४ औँ विशेष दृष्टि (१००%)' });
    aspectTargets.push({ houseDist: 8, aspectName: '८ औँ विशेष दृष्टि (१००%)' });
  }
  if (planetName === 'गुरु' || planetName === 'राहु' || planetName === 'केतु') {
    aspectTargets.push({ houseDist: 5, aspectName: '५ औँ विशेष दृष्टि (१००%)' });
    aspectTargets.push({ houseDist: 9, aspectName: '९ औँ विशेष दृष्टि (१००%)' });
  }
  if (planetName === 'शनि') {
    aspectTargets.push({ houseDist: 3, aspectName: '३ औँ विशेष दृष्टि (१००%)' });
    aspectTargets.push({ houseDist: 10, aspectName: '१० औँ विशेष दृष्टि (१००%)' });
  }

  aspectTargets.forEach(({ houseDist, aspectName }) => {
    const targetHouse = ((sourceHouse - 1 + houseDist - 1) % 12) + 1;
    const targetRashiId = ((lagnaRashiId - 1 + targetHouse - 1) % 12) + 1;
    const targetRashi = RASHI_NAMES_LIST[targetRashiId - 1];

    const planetsInTarget = allPlanetsPositions
      .filter((p) => p.bhava === targetHouse && p.name !== planetName)
      .map((p) => p.name);

    const houseDef = BHAVA_DEFINITIONS[targetHouse];

    let effectText = `${planetName} ले भाव ${targetHouse} (${targetRashi} राशि) माथि ${aspectName} दिँदा ${houseDef ? houseDef.primaryDomainNepali : 'सम्बन्धित क्षेत्र'} मा आफ्नो ऊर्जा सञ्चार गर्दछ।`;
    if (planetsInTarget.length > 0) {
      effectText += ` यस दृष्टिले त्यहाँ अवस्थित ${planetsInTarget.join(', ')} ग्रहलाई प्रत्यक्ष प्रभावित गर्दछ।`;
    }

    result.push({
      targetHouse,
      targetRashi,
      aspectType: aspectName,
      strengthPercentage: 100,
      planetsInTargetHouse: planetsInTarget,
      effectNepali: effectText,
    });
  });

  return result;
}

/**
 * Calculates aspects received by a target planet from other planets.
 */
export function calculateAspectsReceived(
  targetPlanetName: PlanetName,
  targetHouse: number,
  allPlanetsPositions: Array<{ name: PlanetName; bhava: number }>
): AspectReceivedAnalysis[] {
  const result: AspectReceivedAnalysis[] = [];

  allPlanetsPositions.forEach((other) => {
    if (other.name === targetPlanetName) return;

    const houseDist = ((targetHouse - other.bhava + 12) % 12) || 12;
    let isAspecting = false;
    let aspectType = '';

    if (houseDist === 7) {
      isAspecting = true;
      aspectType = '७ औँ समदृष्टि (१००%)';
    } else if (other.name === 'मंगल' && (houseDist === 4 || houseDist === 8)) {
      isAspecting = true;
      aspectType = `${houseDist} औँ मंगल विशेष दृष्टि`;
    } else if ((other.name === 'गुरु' || other.name === 'राहु' || other.name === 'केतु') && (houseDist === 5 || houseDist === 9)) {
      isAspecting = true;
      aspectType = `${houseDist} औँ विशेष दृष्टि`;
    } else if (other.name === 'शनि' && (houseDist === 3 || houseDist === 10)) {
      isAspecting = true;
      aspectType = `${houseDist} औँ शनि विशेष दृष्टि`;
    }

    if (isAspecting) {
      const isBenefic = ['गुरु', 'शुक्र', 'बुध'].includes(other.name);
      
      let effectText = `${other.name} ले भाव ${other.bhava} बाट ${targetPlanetName} माथि ${aspectType} प्रदान गरेको छ। `;
      if (isBenefic) {
        effectText += `यस शुभ दृष्टिले ${targetPlanetName} को सकारात्मक क्षमतालाई बढावा दिन्छ।`;
      } else {
        effectText += `यस कडा दृष्टिले ${targetPlanetName} लाई थप अनुशासन, धैर्य वा सजगताको माग गराउँछ।`;
      }

      result.push({
        aspectingPlanet: other.name,
        fromHouse: other.bhava,
        aspectType,
        isBeneficAspect: isBenefic,
        effectNepali: effectText,
      });
    }
  });

  return result;
}
