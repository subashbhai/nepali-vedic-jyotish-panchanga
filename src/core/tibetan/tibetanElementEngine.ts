/**
 * Tibetan Five Elements Engine (འབྱུང་བ་ལྔ)
 * Brihat Jyotish Professional ERP
 */

import { TibetanElement, TibetanElementId } from '../../types/tibetanAstrology';

export const TIBETAN_FIVE_ELEMENTS: Record<TibetanElementId, TibetanElement> = {
  wood: {
    id: 'wood',
    nameNepali: 'काठ (वनस्पति)',
    nameTibetan: 'ཤིང (Shing)',
    nameEnglish: 'Wood',
    color: 'हरियो (Green)',
    hexColor: '#16A34A',
    badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    directionNepali: 'पूर्व (East)',
    generatingElement: 'fire', // Wood produces Fire
    controllingElement: 'earth' // Wood overcomes Earth
  },
  fire: {
    id: 'fire',
    nameNepali: 'आगो (तेज/अग्नि)',
    nameTibetan: 'མེ (Me)',
    nameEnglish: 'Fire',
    color: 'रातो (Red)',
    hexColor: '#DC2626',
    badgeBg: 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300 border-red-300 dark:border-red-700',
    directionNepali: 'दक्षिण (South)',
    generatingElement: 'earth', // Fire produces Earth (ash)
    controllingElement: 'iron' // Fire overcomes Metal/Iron
  },
  earth: {
    id: 'earth',
    nameNepali: 'पृथ्वी (माटो/धरा)',
    nameTibetan: 'ས (Sa)',
    nameEnglish: 'Earth',
    color: 'पहेँलो (Yellow)',
    hexColor: '#CA8A04',
    badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    directionNepali: 'केन्द्र तथा कुनाहरू (Center & Diagonal)',
    generatingElement: 'iron', // Earth produces Metal
    controllingElement: 'water' // Earth overcomes Water
  },
  iron: {
    id: 'iron',
    nameNepali: 'फलाम (धातु/स्वर्ण)',
    nameTibetan: 'ལྕགས (Chag)',
    nameEnglish: 'Iron / Metal',
    color: 'सेतो / चाँदी (White / Metallic)',
    hexColor: '#475569',
    badgeBg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600',
    directionNepali: 'पश्चिम (West)',
    generatingElement: 'water', // Metal produces Water (condensation)
    controllingElement: 'wood' // Metal overcomes Wood (axe cuts tree)
  },
  water: {
    id: 'water',
    nameNepali: 'पानी (जल/तरंग)',
    nameTibetan: 'ཆུ (Chu)',
    nameEnglish: 'Water',
    color: 'नीलो (Blue)',
    hexColor: '#2563EB',
    badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300 dark:border-blue-700',
    directionNepali: 'उत्तर (North)',
    generatingElement: 'wood', // Water produces Wood
    controllingElement: 'fire' // Water overcomes Fire
  }
};

export type ElementRelationType = 'माता' | 'पुत्र' | 'मित्र' | 'शत्रु' | 'स्व';

/**
 * Calculates relationship of Source element with Target element
 * (e.g. How does Source relate to Target?)
 */
export function getElementRelation(sourceId: TibetanElementId, targetId: TibetanElementId): {
  relation: ElementRelationType;
  labelNepali: string;
  effect: 'अति शुभ' | 'शुभ' | 'सम' | 'चुनौती' | 'सावधानी';
  score: number;
  explanationNepali: string;
} {
  if (sourceId === targetId) {
    return {
      relation: 'स्व',
      labelNepali: 'स्व-तत्व (समान)',
      effect: 'सम',
      score: 15,
      explanationNepali: 'दुवै तत्व समान भएकाले सन्तुलित र स्थिर सम्बन्ध रहन्छ।'
    };
  }

  const sourceDef = TIBETAN_FIVE_ELEMENTS[sourceId];
  const targetDef = TIBETAN_FIVE_ELEMENTS[targetId];

  // If source generates target => Source is Mother to Target
  if (sourceDef.generatingElement === targetId) {
    return {
      relation: 'माता',
      labelNepali: 'माता (पोषक / उत्पत्तिकर्ता)',
      effect: 'अति शुभ',
      score: 25,
      explanationNepali: `${sourceDef.nameNepali}ले ${targetDef.nameNepali}लाई जन्म र पोषण दिने हुँदा यो परम शुभ एवं ऊर्जादायक सम्बन्ध हो।`
    };
  }

  // If target generates source => Source is Son to Target
  if (targetDef.generatingElement === sourceId) {
    return {
      relation: 'पुत्र',
      labelNepali: 'पुत्र (उत्पादित / संरक्षित)',
      effect: 'शुभ',
      score: 20,
      explanationNepali: `${sourceDef.nameNepali} ${targetDef.nameNepali}बाट उत्पन्न भएको हुँदा यसले आत्मीयता र शुभ फल प्रदान गर्दछ।`
    };
  }

  // If source controls target => Source is Friend/Overcomer
  if (sourceDef.controllingElement === targetId) {
    return {
      relation: 'मित्र',
      labelNepali: 'मित्र / धन (वशवर्ती)',
      effect: 'शुभ',
      score: 18,
      explanationNepali: `${sourceDef.nameNepali}ले ${targetDef.nameNepali}माथि नियन्त्रण राख्ने हुँदा यसलाई सम्पत्ति र सामर्थ्यवर्धक मानिन्छ।`
    };
  }

  // If target controls source => Source is Enemy/Overcome by Target
  if (targetDef.controllingElement === sourceId) {
    return {
      relation: 'शत्रु',
      labelNepali: 'शत्रु (प्रतिरोधी / संहारक)',
      effect: 'सावधानी',
      score: 8,
      explanationNepali: `${targetDef.nameNepali}ले ${sourceDef.nameNepali}लाई दबाउने हुँदा ऊर्जा क्षय हुने र सावधानी अपनाउनुपर्ने हुन्छ।`
    };
  }

  return {
    relation: 'स्व',
    labelNepali: 'सम',
    effect: 'सम',
    score: 12,
    explanationNepali: 'तत्वहरू बीच तटस्थ सम्बन्ध छ।'
  };
}
