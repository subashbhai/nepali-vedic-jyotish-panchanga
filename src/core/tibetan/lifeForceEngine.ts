/**
 * Tibetan Life Force Engine (सोग, लु, वाङ, लुङता र ला)
 * Based on Vaidurya Karpo (वैदूर्य कार्पो)
 * Brihat Jyotish Professional ERP
 */

import {
  TibetanAnimal,
  TibetanElement,
  TibetanElementId,
  TibetanLifeForces,
  TibetanLifeForceDimension
} from '../../types/tibetanAstrology';
import { TIBETAN_FIVE_ELEMENTS, getElementRelation } from './tibetanElementEngine';

// Trine group mapping to Lungta Element
export function getLungtaElement(animalId: string): TibetanElementId {
  // Tiger, Horse, Dog (Fire Trine) -> Iron
  if (animalId === 'tiger' || animalId === 'horse' || animalId === 'dog') {
    return 'iron';
  }
  // Pig, Sheep, Rabbit (Wood Trine) -> Fire
  if (animalId === 'pig' || animalId === 'sheep' || animalId === 'rabbit') {
    return 'fire';
  }
  // Monkey, Mouse, Dragon (Water Trine) -> Wood
  if (animalId === 'monkey' || animalId === 'mouse' || animalId === 'dragon') {
    return 'wood';
  }
  // Snake, Bird, Ox (Iron/Metal Trine) -> Water
  return 'water';
}

// Classical Lu (Body) element lookup
export function getLuElement(yearElementId: TibetanElementId, animal: TibetanAnimal): TibetanElementId {
  // Classical systematic calculation based on year element and animal progression
  const sequence: TibetanElementId[] = ['wood', 'fire', 'earth', 'iron', 'water'];
  const baseIdx = sequence.indexOf(yearElementId);
  const animalOffset = animal.index % 5;
  const targetIdx = (baseIdx + animalOffset) % 5;
  return sequence[targetIdx];
}

/**
 * Calculates the complete 5 Life-Force dimensions for a given Year & Animal
 */
export function calculateTibetanLifeForces(
  yearElement: TibetanElement,
  animal: TibetanAnimal
): TibetanLifeForces {
  // 1. सोग (Sog - Life Force) = Animal's inherent fixed element
  const sogElementId = animal.fixedElementId;
  const sogElement = TIBETAN_FIVE_ELEMENTS[sogElementId];
  const sogRel = getElementRelation(sogElementId, yearElement.id);

  // 2. लु (Lu - Physical Body/Health)
  const luElementId = getLuElement(yearElement.id, animal);
  const luElement = TIBETAN_FIVE_ELEMENTS[luElementId];
  const luRel = getElementRelation(luElementId, yearElement.id);

  // 3. वाङ (Wang - Power/Prosperity) = Birth Year Element
  const wangElement = yearElement;
  const wangRel = getElementRelation(wangElement.id, yearElement.id);

  // 4. लुङता (Lungta - Windhorse/Fortune) = Animal Trine Element
  const lungtaElementId = getLungtaElement(animal.id);
  const lungtaElement = TIBETAN_FIVE_ELEMENTS[lungtaElementId];
  const lungtaRel = getElementRelation(lungtaElementId, yearElement.id);

  // 5. ला (La - Soul Essence) = Mother of Sog Element
  // Which element generates Sog? That element is La!
  const laGeneratingEntries = Object.values(TIBETAN_FIVE_ELEMENTS).find(
    (el) => el.generatingElement === sogElementId
  );
  const laElementId = laGeneratingEntries ? laGeneratingEntries.id : 'water';
  const laElement = TIBETAN_FIVE_ELEMENTS[laElementId];
  const laRel = getElementRelation(laElementId, yearElement.id);

  const getStrengthAndLevel = (score: number): { percent: number; level: 'अत्यन्त सबल' | 'उत्तम' | 'मध्यम' | 'सावधानी' | 'कमजोर' } => {
    const percent = Math.min(100, Math.max(20, Math.round((score / 25) * 100)));
    if (percent >= 90) return { percent, level: 'अत्यन्त सबल' };
    if (percent >= 75) return { percent, level: 'उत्तम' };
    if (percent >= 60) return { percent, level: 'मध्यम' };
    if (percent >= 40) return { percent, level: 'सावधानी' };
    return { percent, level: 'कमजोर' };
  };

  const sogInfo = getStrengthAndLevel(sogRel.score);
  const luInfo = getStrengthAndLevel(luRel.score);
  const wangInfo = getStrengthAndLevel(wangRel.score);
  const lungtaInfo = getStrengthAndLevel(lungtaRel.score);
  const laInfo = getStrengthAndLevel(laRel.score);

  const sogDim: TibetanLifeForceDimension = {
    id: 'sog',
    titleNepali: 'सोग (Sog - प्राण/आयु)',
    nameTibetan: 'སྲོག (Srog)',
    dimensionMeaning: 'जीवनको मूल प्राण, मुटु र आयुको सूक्ष्म आधार',
    element: sogElement,
    relationWithYearElement: sogRel.relation,
    strengthPercentage: sogInfo.percent,
    levelNepali: sogInfo.level,
    traditionalSignificance: `${sogElement.nameNepali} तत्व रहेको यो ऊर्जाले दीर्घायु, आत्मबल र प्राणशक्तिको प्रतिनिधित्व गर्दछ।`,
    supportingRemedy: sogInfo.percent < 60 ? 'प्राणरक्षा जप, जीवदान (त्सेथार) तथा हरियो/निलो वस्त्र धारण उत्तम।' : 'नियमित ध्यान र सकारात्मक चिन्तन।'
  };

  const luDim: TibetanLifeForceDimension = {
    id: 'lu',
    titleNepali: 'लु (Lu - शरीर/कलेवर)',
    nameTibetan: 'ལུས (Lus)',
    dimensionMeaning: 'भौतिक शरीर, रोगप्रतिरोधी क्षमता र धातु आरोग्य',
    element: luElement,
    relationWithYearElement: luRel.relation,
    strengthPercentage: luInfo.percent,
    levelNepali: luInfo.level,
    traditionalSignificance: `${luElement.nameNepali} तत्वको प्रभावले शारीरिक तन्दुरुस्ती, ऊर्जा तथा खानपान सन्तुलन दर्शाउँछ।`,
    supportingRemedy: luInfo.percent < 60 ? 'पञ्चामृत, स्वास्थ्य मन्त्र तथा सन्तुलित आहारविहार।' : 'नियमित व्यायाम र प्राणायाम।'
  };

  const wangDim: TibetanLifeForceDimension = {
    id: 'wang',
    titleNepali: 'वाङ (Wang - सामर्थ्य/प्रभाव)',
    nameTibetan: 'དབང (Dbang)',
    dimensionMeaning: 'सामाजिक प्रभाव, व्यक्तित्व, आर्थिक अधिकार र कार्यक्षमता',
    element: wangElement,
    relationWithYearElement: 'स्व',
    strengthPercentage: wangInfo.percent,
    levelNepali: wangInfo.level,
    traditionalSignificance: `${wangElement.nameNepali} तत्व रहेको यो शक्तिले बोलीको प्रभाव, नेतृत्व र ऐश्वर्य विस्तारमा मद्दत गर्दछ।`,
    supportingRemedy: 'मञ्जुश्री मन्त्र जप तथा पहेँलो/रातो रङ्गको सन्तुलित प्रयोग।'
  };

  const lungtaDim: TibetanLifeForceDimension = {
    id: 'lungta',
    titleNepali: 'लुङता (Lungta - भाग्य/पवन-अश्व)',
    nameTibetan: 'རླུང་རྟ (Rlung-rta)',
    dimensionMeaning: 'दशा विजय, भाग्य, विघ्न विनाश र आकस्मिक सफलता',
    element: lungtaElement,
    relationWithYearElement: lungtaRel.relation,
    strengthPercentage: lungtaInfo.percent,
    levelNepali: lungtaInfo.level,
    traditionalSignificance: `पवन-अश्व (${lungtaElement.nameNepali}) को गतिले जीवनमा अप्रत्याशित सफलता र शुभ अवसर ल्याउँछ।`,
    supportingRemedy: lungtaInfo.percent < 60 ? 'पहाडको उँचाइमा लुङता (पञ्चरङ्गी मन्त्र ध्वजा) फहराउनु विशेष फलदायी।' : 'नियमित शुभ संकल्प।'
  };

  const laDim: TibetanLifeForceDimension = {
    id: 'la',
    titleNepali: 'ला (La - आत्मा/सूक्ष्म चेतना)',
    nameTibetan: 'བླ (Bla)',
    dimensionMeaning: 'मानसिक शान्ति, निद्रा, सूक्ष्म चेतना र मानसिक सन्तुलन',
    element: laElement,
    relationWithYearElement: laRel.relation,
    strengthPercentage: laInfo.percent,
    levelNepali: laInfo.level,
    traditionalSignificance: `ला तत्व (${laElement.nameNepali}) ले शरीरभित्र सूक्ष्म प्राणको स्थिरता र निश्चल मनको स्थिति जनाउँछ।`,
    supportingRemedy: laInfo.percent < 60 ? 'ला-गुग् (चेतना आकर्षण) विधि, मन शान्ति साधना तथा आमा-माताको आशीर्वाद।' : 'सदाचार र सत्संग।'
  };

  // Overall vitality
  const totalScore = (sogInfo.percent + luInfo.percent + wangInfo.percent + lungtaInfo.percent + laInfo.percent) / 5;
  const overallVitalityScore = Math.round(totalScore);

  let overallVitalityStatusNepali = 'सन्तुलित एवं उत्तम';
  if (overallVitalityScore >= 85) overallVitalityStatusNepali = 'परम सबल र तेजश्वी';
  else if (overallVitalityScore >= 70) overallVitalityStatusNepali = 'शुभ एवं सक्रिय';
  else if (overallVitalityScore >= 55) overallVitalityStatusNepali = 'मध्यम सन्तुलन';
  else overallVitalityStatusNepali = 'सावधानी एवं पारम्परिक ऊर्जा सन्तुलन आवश्यक';

  return {
    sog: sogDim,
    lu: luDim,
    wang: wangDim,
    lungta: lungtaDim,
    la: laDim,
    overallVitalityScore,
    overallVitalityStatusNepali
  };
}
