/**
 * Tibetan Compatibility Matching Engine (विवाह तथा सहकार्य मिलान)
 * Comprehensive Traditional Implementation based on Vaidurya Karpo (वैदूर्य कार्पो)
 * Brihat Jyotish Professional ERP
 */

import {
  TibetanYearInfo,
  TibetanLifeForces,
  TibetanMewa,
  TibetanParkha,
  TibetanCompatibilityResult,
  TibetanCompatibilityDimensionRow,
  TibetanLifeForceComparisonRow,
  TibetanElement
} from '../../types/tibetanAstrology';
import { getElementRelation, TIBETAN_FIVE_ELEMENTS } from './tibetanElementEngine';
import { getRuleEvidenceById } from '../rules/sources/tibetan/tibetanSourceRegistry';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';

// 1. ANIMAL COMPATIBILITY EVALUATION (१२ पशु राशि मिलान)
interface AnimalEval {
  status: TibetanCompatibilityResult['animalHarmonyStatus'];
  score: number;
  categoryName: string;
  nameTibetan: string;
  badgeClass: string;
  interpretationNepali: string;
  remedyNepali: string;
}

function evaluateAnimalPair(boyIdx: number, girlIdx: number): AnimalEval {
  // Trines (टुङ्सुम / Tun-sum / त्रिसङ्गम)
  const trines = [
    [0, 4, 8], // Water: Rat (0), Dragon (4), Monkey (8)
    [1, 5, 9], // Metal: Ox (1), Snake (5), Bird (9)
    [2, 6, 10], // Fire: Tiger (2), Horse (6), Dog (10)
    [3, 7, 11] // Wood: Rabbit (3), Sheep (7), Pig (11)
  ];

  const inSameTrine = trines.some((t) => t.includes(boyIdx) && t.includes(girlIdx));
  if (inSameTrine) {
    return {
      status: 'अति अनुकूल (त्रि-सङ्गम)',
      score: 25,
      categoryName: 'टुङ्सुम (त्रिसङ्गम / Triple Harmony)',
      nameTibetan: 'མཐུན་གསུམ',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300',
      interpretationNepali:
        'यी दुई राशिहरू एउटै त्रिसङ्गम चक्रमा पर्दछन्। यिनीहरूको स्वभाव, दृष्टिकोण, जीवन लक्ष्य र मानसिक गतिशीलतामा उत्कृष्ट तालमेल रहन्छ। सहजीवन र साझेदारीमा दीर्घकालीन ऐश्वर्य, सन्तान सुख र आपसी आदर प्राप्त हुन्छ।',
      remedyNepali:
        'विशेष शान्ति आवश्यक छैन। संयुक्त रूपमा लुङता ध्वजा फहराउनु र भगवान मञ्जुश्रीको मन्त्र जप गर्नु अझ लाभदायक हुन्छ।'
    };
  }

  // Secret Friends (ड्रुकथुन / Druk-thun / षट्-मैत्री - 6 Soul Friends)
  const secretFriends = [
    [0, 1], // Rat + Ox
    [2, 11], // Tiger + Pig
    [3, 10], // Rabbit + Dog
    [4, 9], // Dragon + Bird
    [5, 8], // Snake + Monkey
    [6, 7] // Horse + Sheep
  ];

  const isSecretFriend = secretFriends.some(
    (pair) => (boyIdx === pair[0] && girlIdx === pair[1]) || (boyIdx === pair[1] && girlIdx === pair[0])
  );
  if (isSecretFriend) {
    return {
      status: 'मित्रवत (अनुकूल)',
      score: 22,
      categoryName: 'ड्रुकथुन (षट्-मैत्री / Secret Soul Friends)',
      nameTibetan: 'དྲུག་མཐུན',
      badgeClass: 'bg-teal-50 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300',
      interpretationNepali:
        'यी राशिहरू शास्त्रीय रूपमा गुह्य मित्र (षट्-मैत्री) मानिन्छन्। यिनीहरू बीच आन्तरिक आकर्षण, गहिरो विश्वास र कठिन परिस्थितिमा पनि एक-अर्कालाई आड-भरोसा दिने स्वाभाविक गुण रहन्छ।',
      remedyNepali:
        'दम्पतीले पूजास्थलमा तारा (Tara) स्तुति वा इष्टदेवीको पूजा गर्नु एवं एक-अर्काको आत्मसम्मानको सदैव कदर गर्नु उत्तम हुन्छ।'
    };
  }

  // Opposites (दुन्जुर / Dun-zur / ७औं राशि - प्रत्यक्ष द्वन्द्व)
  const diff = Math.abs(boyIdx - girlIdx);
  if (diff === 6) {
    return {
      status: 'शत्रुवत (द्वन्द्व)',
      score: 5,
      categoryName: 'दुन्जुर (विपरीत शत्रु / Direct Axis Conflict)',
      nameTibetan: 'བདུན་ཟུར',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300',
      interpretationNepali:
        'यी दुई राशिहरू अक्षीय रूपमा १८० डिग्री विपरीत (७औं राशि) पर्दछन्। यिनीहरूको विचार, निर्णय शैली र प्राथमिकताहरू बाझिन सक्ने संकेत छ। अहङ्कारको टकराव, संवादहीनता र तनाव उत्पन्न हुन सक्छ।',
      remedyNepali:
        'घरको मुख्य ढोकामा महाकरुणा मन्त्र र दोर्जे (वज्र) को चिन्ह अङ्कित गर्नु, संयुक्त शान्ति पाठ गराउनु र सञ्चारमा खुलापन राख्नु अनिवार्य छ।'
    };
  }

  // Four Hindrances (त्सुनखोर / Tsun-khor / केन्द्रिक दोष / Square)
  if (diff === 3 || diff === 9) {
    return {
      status: 'चुनौतीपूर्ण (षष्ठ-अष्टक)',
      score: 8,
      categoryName: 'त्सुनखोर (केन्द्रिक बाधा / 4 Obstacles)',
      nameTibetan: 'བཙུན་འཁོར',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300',
      interpretationNepali:
        'यी राशिहरू बीच ९० डिग्रीको कोणिक अन्तर (केन्द्रिक बाधा) रहेको छ। पारिवारिक वा व्यावहारिक निर्णयहरूमा सुरुमा असहमति देखिन सक्छ, तर धैर्य र परिपक्वताले सम्बन्ध टिकाउन सकिन्छ।',
      remedyNepali:
        'सेतो वा पहेँलो रङ्गको लुङता फहराउनुहोस्, परिवारका अग्रजहरूको सल्लाह लिनुहोस् र आर्थिक लेनदेनमा स्पष्ट सम्झौता गर्नुहोस्।'
    };
  }

  // Quincunx (षष्ठ-अष्टक - 6-8)
  if (diff === 5 || diff === 7) {
    return {
      status: 'चुनौतीपूर्ण (षष्ठ-अष्टक)',
      score: 10,
      categoryName: 'षष्ठ-अष्टक (सङ्घर्ष र स्वास्थ्य संवेदनशीलता)',
      nameTibetan: 'དྲུག་བརྒྱད',
      badgeClass: 'bg-orange-50 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300',
      interpretationNepali:
        '६ र ८ राशिको अन्तरले एक-अर्काको सूक्ष्म भावना बुझ्न केही समय लाग्ने र कहिलेकाहीं स्वास्थ्य वा जिम्मेवारीको असन्तुलन हुन सक्ने शास्त्रीय मान्यता छ।',
      remedyNepali:
        'आयुर्वेद वा तिब्बती सोवा-रिग्पा पद्धतिको पालना, नियमित ध्यान र आपसी सेवाभावले यो दोषलाई शान्त गर्दछ।'
    };
  }

  // Same Animal (समान राशि)
  if (diff === 0) {
    return {
      status: 'सामान्य (तटस्थ)',
      score: 16,
      categoryName: 'समान राशि (सम-सन्तुलन / Same Animal)',
      nameTibetan: 'རང་མཐུན',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200',
      interpretationNepali:
        'दुवैको राशि एउटै भएकाले उस्तै गुण र कमजोरीहरू हुन्छन्। एक-अर्कालाई छिट्टै बुझ्न सके पनि स्वभाव मिल्दा कहिलेकाहीं दुवै एकैपटक हठी बन्ने सम्भावना रहन्छ।',
      remedyNepali:
        'दुवैले एकै समयमा क्रोध नगर्ने नियम बसाल्नुहोस्। घरमा शान्त वातावरण कायम राख्नुहोस्।'
    };
  }

  // Neutral / General
  return {
    status: 'सामान्य (तटस्थ)',
    score: 15,
    categoryName: 'सामान्य तटस्थ सम्बन्ध (Neutral Harmony)',
    nameTibetan: 'བར་མ',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300',
    interpretationNepali:
      'यी दुई राशिहरू बीच कुनै गम्भीर दोष वा विषेश बाधा छैन। आपसी समझदारी, प्रेम र सहकार्यले दाम्पत्य जीवन सुखद र स्थिर बन्न सक्छ।',
    remedyNepali: 'सामान्य कुलदेवताको पूजा र आपसी सदभाव नै पर्याप्त छ।'
  };
}

// 2. ELEMENT CYCLE & INTERMEDIARY MEDIATOR (पञ्चतत्व चक्र र मध्यस्थ तत्व)
interface ElementCycleAnalysis {
  relation: TibetanCompatibilityResult['elementRelation'];
  score: number;
  cycleType: string;
  badgeClass: string;
  mediatingElement?: TibetanElement;
  explanationNepali: string;
  remedyNepali: string;
}

function evaluateElementCycle(boyElem: TibetanElement, girlElem: TibetanElement): ElementCycleAnalysis {
  const rel = getElementRelation(boyElem.id, girlElem.id);

  if (rel.relation === 'माता') {
    return {
      relation: 'माता-पुत्र (शुभ)',
      score: 25,
      cycleType: 'उत्पत्ति चक्र (Generating Cycle)',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300',
      explanationNepali: `${boyElem.nameNepali} तत्वले ${girlElem.nameNepali} तत्वलाई जन्म र पोषण दिन्छ (माता-पुत्र सम्बन्ध)। यसले दम्पतीमा आपसी स्नेह, प्रेरणा, समृद्धि र प्राकृतिक ऊर्जाको निरन्तर प्रवाह गराउँछ।`,
      remedyNepali: 'यो परम शुभ सम्बन्ध हो। घरमा हरियो वा शुभ प्राकृतिक तत्वहरूको सजावट राख्नुहोस्।'
    };
  }

  if (rel.relation === 'पुत्र') {
    return {
      relation: 'माता-पुत्र (शुभ)',
      score: 22,
      cycleType: 'पोषक चक्र (Nurturing Cycle)',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300',
      explanationNepali: `${girlElem.nameNepali} तत्व ${boyElem.nameNepali}का लागि पोषक माता स्वरूप छ। यस सम्बन्धमा आत्मीयता, संवेदनशीलता र एक-अर्काको सुरक्षा गर्ने भावना प्रबल रहन्छ।`,
      remedyNepali: 'सम्बन्ध ऊर्जावान् छ। पूर्णिमाका दिन जल वा दीप दान गर्नु शुभ हुन्छ।'
    };
  }

  if (rel.relation === 'मित्र') {
    return {
      relation: 'मित्र-सम्बन्ध (उत्तम)',
      score: 20,
      cycleType: 'मित्र एवं समृद्धि चक्र (Wealth/Friend Cycle)',
      badgeClass: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300',
      explanationNepali: `${boyElem.nameNepali} र ${girlElem.nameNepali} बीच शास्त्रीय मित्र (वशवर्ती/धन) सम्बन्ध छ। यसले व्यावहारिक समृद्धि, योजना कार्यान्वयन र आर्थिक प्रगतिमा सहकार्य बलियो बनाउँछ।`,
      remedyNepali: 'व्यापारिक वा संयुक्त कार्य अघि दुवैले सल्लाह गरेर निर्णय लिनुहोस्।'
    };
  }

  if (rel.relation === 'स्व') {
    return {
      relation: 'समान तत्व (सम)',
      score: 16,
      cycleType: 'समान तत्व चक्र (Harmonic Resonance)',
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200',
      explanationNepali: `दुवैको तत्व ${boyElem.nameNepali} नै भएकाले स्वभाव र मानसिक गतिमा समानता छ। समान तत्वले स्थिरता दिन्छ तर कहिलेकाहीं एकै प्रकारको अतिरेक (जस्तै दुवै आगो भएमा रिस, दुवै पानी भएमा अत्यधिक भावुकता) हुन सक्छ।`,
      remedyNepali: 'सन्तुलनका लागि घरमा अन्य सहायक तत्वहरूको उपस्थिति (जस्तै बिरुवा, धातुका सामान) मिलाउनुहोस्।'
    };
  }

  // Enemy / Overcoming relation (दमन चक्र)
  // Determine classical mediating element
  let mediator: TibetanElement | undefined;
  let mediatorAdvice = '';

  if (
    (boyElem.id === 'wood' && girlElem.id === 'iron') ||
    (boyElem.id === 'iron' && girlElem.id === 'wood')
  ) {
    mediator = TIBETAN_FIVE_ELEMENTS.water;
    mediatorAdvice =
      'काठ र फलामको द्वन्द्वलाई शान्त पार्न "पानी (जल)" तत्व मध्यस्थ बन्दछ। घरमा जल-कुण्ड, नीलो रङ्ग वा पानीको प्रवाह राख्नुहोस् जसले फलामलाई नरम पारी काठलाई सिञ्चित गर्छ।';
  } else if (
    (boyElem.id === 'fire' && girlElem.id === 'water') ||
    (boyElem.id === 'water' && girlElem.id === 'fire')
  ) {
    mediator = TIBETAN_FIVE_ELEMENTS.wood;
    mediatorAdvice =
      'आगो र पानीको द्वन्द्वलाई शान्त पार्न "काठ (वनस्पति)" तत्व मध्यस्थ बन्दछ। हरियो रङ्ग, बिरुवा वा काठका कलाकृति प्रयोग गर्नुहोस् जसले जललाई ग्रहण गरी अग्निलाई पोषण दिन्छ।';
  } else if (
    (boyElem.id === 'earth' && girlElem.id === 'wood') ||
    (boyElem.id === 'wood' && girlElem.id === 'earth')
  ) {
    mediator = TIBETAN_FIVE_ELEMENTS.fire;
    mediatorAdvice =
      'माटो र काठको द्वन्द्वलाई शान्त पार्न "आगो (तेज)" तत्व मध्यस्थ बन्दछ। रातो, सुन्तला रङ्ग वा दीप प्रज्वलनले काठलाई भष्म गरी माटोलाई उर्वर बनाउँछ।';
  } else if (
    (boyElem.id === 'iron' && girlElem.id === 'fire') ||
    (boyElem.id === 'fire' && girlElem.id === 'iron')
  ) {
    mediator = TIBETAN_FIVE_ELEMENTS.earth;
    mediatorAdvice =
      'फलाम र आगोको द्वन्द्वलाई शान्त पार्न "पृथ्वी (माटो/धरा)" तत्व मध्यस्थ बन्दछ। पहेँलो रङ्ग, माटोका भाँडा वा ढुङ्गाको प्रयोगले अग्निको ताप सोसेर धातुलाई स्थिर गर्छ।';
  } else {
    mediator = TIBETAN_FIVE_ELEMENTS.iron;
    mediatorAdvice =
      'पानी र माटोको द्वन्द्वलाई शान्त पार्न "फलाम (धातु)" तत्व मध्यस्थ बन्दछ। सेतो रङ्ग वा धातुका भाँडाहरूको प्रयोगले माटोलाई मजबुत पारी जललाई पवित्र बनाउँछ।';
  }

  return {
    relation: 'शत्रु सम्बन्ध (सावधानी)',
    score: 6,
    cycleType: 'विनाश/दमन चक्र (Controlling/Overcoming Cycle)',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300',
    mediatingElement: mediator,
    explanationNepali: `${boyElem.nameNepali} र ${girlElem.nameNepali} बीच शास्त्रीय दमन (शत्रु) सम्बन्ध रहेको छ। यसले कहिलेकाहीं ऊर्जाको ह्रास, स्वास्थ्य संवेदनशीलता वा विचारमा प्रतिरोध सिर्जना गर्न सक्छ।`,
    remedyNepali: mediatorAdvice
  };
}

// 3. MEWA NUMBERS HARMONY MATRIX (९ मेवा परम्परागत मिलान)
interface MewaHarmonyEval {
  status: TibetanCompatibilityResult['mewaHarmonyStatus'];
  score: number;
  badgeClass: string;
  karmicBondNepali: string;
  colorHarmonyNepali: string;
  explanationNepali: string;
  remedyNepali: string;
}

function evaluateMewaPair(boyMewa: TibetanMewa, girlMewa: TibetanMewa): MewaHarmonyEval {
  const b = boyMewa.number;
  const g = girlMewa.number;

  // Same Mewa
  if (b === g) {
    const isWhite = b === 1 || b === 6 || b === 8;
    return {
      status: 'परम मित्र',
      score: 20,
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300',
      karmicBondNepali: 'समान आत्मा-संस्कार (Soulmate Mirror)',
      colorHarmonyNepali: `दुवैको अनुकूल रङ्ग: ${boyMewa.colorNameNepali}`,
      explanationNepali: `दुवैको मेवा अंक ${toDevanagariNumerals(b)} भएकाले पूर्वजन्मको संस्कार र चेतनाको तरङ्ग उस्तै छ। ${
        isWhite
          ? 'सेतो मेवा (१, ६, ८) भएकाले मानसिक शुचिता, निष्ठा र आध्यात्मिक साधनाका लागि अत्यन्त शुभ मानिन्छ।'
          : 'समान मेवा भएकाले आपसी अपेक्षा र दृष्टिकोण सहजै मिल्दछ।'
      }`,
      remedyNepali: 'संयुक्त रूपमा पूजाआजा गर्नु, एक-अर्काको व्यक्तिगत स्पेसको सम्मान गर्नु।'
    };
  }

  // Highly Auspicious Traditional Combinations
  const bestPairs = [
    [1, 6], [1, 8], [2, 7], [2, 8], [3, 4], [3, 1], [4, 9], [5, 2], [5, 8], [6, 7], [6, 8], [9, 3], [9, 4]
  ];
  const isBest = bestPairs.some(
    (p) => (b === p[0] && g === p[1]) || (b === p[1] && g === p[0])
  );

  if (isBest) {
    return {
      status: 'परम मित्र',
      score: 18,
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300',
      karmicBondNepali: 'कल्याणकारी पूर्वसम्बन्ध (Auspicious Karmic Union)',
      colorHarmonyNepali: `${boyMewa.colorNameNepali} र ${girlMewa.colorNameNepali} को सुखद संयोजन`,
      explanationNepali: `मेवा ${toDevanagariNumerals(b)} (${boyMewa.nameNepali}) र मेवा ${toDevanagariNumerals(g)} (${girlMewa.nameNepali}) को संयोजन वैदूर्य कार्पो अनुसार अत्यन्त फलदायी र आत्मीय मानिएको छ। यसले दाम्पत्यमा मानसिक सन्तुष्टि र आर्थिक समृद्धि ल्याउँछ।`,
      remedyNepali: 'घरको उत्तर वा पूर्व दिशामा घ्यूको दीप प्रज्वलन गर्नु शुभ हुन्छ।'
    };
  }

  // Inimical Combinations
  const clashPairs = [
    [1, 9], [1, 2], [3, 6], [3, 7], [4, 6], [4, 7], [9, 6]
  ];
  const isClash = clashPairs.some(
    (p) => (b === p[0] && g === p[1]) || (b === p[1] && g === p[0])
  );

  if (isClash) {
    return {
      status: 'शत्रु',
      score: 6,
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300',
      karmicBondNepali: 'ऋणानुबन्ध एवं परीक्षा (Karmic Challenge / Debt)',
      colorHarmonyNepali: `विरोधी रङ्ग: ${boyMewa.colorNameNepali} विरुद्ध ${girlMewa.colorNameNepali}`,
      explanationNepali: `मेवा ${toDevanagariNumerals(b)} र मेवा ${toDevanagariNumerals(g)} बीच तत्व वा दिशाको शास्त्रीय विरोध छ। विचारमा असमझदारी वा भावनात्मक चिसोपन आउन नदिन विशेष सचेतना आवश्यक छ।`,
      remedyNepali: 'मेवा मण्डल यन्त्रको स्थापना गर्नुहोस्, सेतो तारा मन्त्र जप गर्नुहोस् र नियमित दान-पुण्य गर्नुहोस्।'
    };
  }

  // Friendly
  const friendlyPairs = [
    [2, 5], [2, 6], [5, 7], [7, 8], [8, 9], [1, 3], [5, 9]
  ];
  const isFriendly = friendlyPairs.some(
    (p) => (b === p[0] && g === p[1]) || (b === p[1] && g === p[0])
  );

  if (isFriendly) {
    return {
      status: 'मित्र',
      score: 15,
      badgeClass: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300',
      karmicBondNepali: 'मित्रवत सहकार्य (Supportive Camaraderie)',
      colorHarmonyNepali: 'अनुकूल रङ्ग सन्तुलन',
      explanationNepali: `यी दुई मेवाहरू बीच मित्रवत सम्बन्ध छ। गृहस्थ जीवनमा व्यवहारिकता, आर्थिक सञ्चय र सन्तान संस्कारमा सहयोग पुग्दछ।`,
      remedyNepali: 'आपसी संवाद र सहकार्यलाई निरन्तरता दिनुहोस्।'
    };
  }

  // Neutral / Sam
  return {
    status: 'सम',
    score: 12,
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200',
    karmicBondNepali: 'तटस्थ पारम्परिक सम्बन्ध (Neutral Connection)',
    colorHarmonyNepali: 'मध्यम रङ्ग सामञ्जस्य',
    explanationNepali: `मेवा ${toDevanagariNumerals(b)} र मेवा ${toDevanagariNumerals(g)} बीच तटस्थ फल छ। आफ्ना गुणहरूलाई निखारेर सम्बन्धलाई सुन्दर बनाउन सकिन्छ।`,
    remedyNepali: 'सामान्य कुल परम्परा अनुसारको धार्मिक अनुष्ठान गर्नुहोस्।'
  };
}

// 4. MAIN EXPORTED COMPATIBILITY CALCULATION FUNCTION
export function calculateTibetanCompatibility(
  boyYear: TibetanYearInfo,
  boyForces: TibetanLifeForces,
  boyMewa: TibetanMewa,
  boyParkha: TibetanParkha,
  girlYear: TibetanYearInfo,
  girlForces: TibetanLifeForces,
  girlMewa: TibetanMewa,
  girlParkha: TibetanParkha
): TibetanCompatibilityResult {
  // 1. Animal Compatibility
  const animalEval = evaluateAnimalPair(boyYear.animal.index, girlYear.animal.index);

  // 2. Element Compatibility
  const elementEval = evaluateElementCycle(boyYear.element, girlYear.element);

  // 3. Mewa Compatibility
  const mewaEval = evaluateMewaPair(boyMewa, girlMewa);

  // 4. Parkha Compatibility (15 pts)
  const parkhaElemRel = getElementRelation(boyParkha.element.id, girlParkha.element.id);
  let parkhaScore = 10;
  let parkhaHarmonyStatus: TibetanCompatibilityResult['parkhaHarmonyStatus'] = 'नाममेन (शान्ति)';
  let parkhaBadgeClass = 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300';
  let parkhaExplanation = '';
  let parkhaRemedy = '';

  if (parkhaElemRel.relation === 'माता' || parkhaElemRel.relation === 'पुत्र') {
    parkhaScore = 15;
    parkhaHarmonyStatus = 'सोग्चो (प्राणदाता)';
    parkhaBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300';
    parkhaExplanation = `${boyParkha.nameNepali.split(' ')[0]} र ${girlParkha.nameNepali.split(' ')[0]} पार्खा बीच सोग्चो (जीवनदाता) योग बन्दछ, जसले सुस्वास्थ्य र आयु वृद्धि गर्दछ।`;
    parkhaRemedy = 'घरको पूर्वी वा दक्षिणी भागमा प्रकाश र स्वच्छता कायम राख्नुहोस्।';
  } else if (parkhaElemRel.relation === 'मित्र') {
    parkhaScore = 12;
    parkhaHarmonyStatus = 'नाममेन (शान्ति)';
    parkhaBadgeClass = 'bg-teal-50 text-teal-800 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300';
    parkhaExplanation = 'पार्खा स्थिति नाममेन (शान्ति-चिकित्सा) अनुकूल छ। घर-परिवारमा सुमधुर वातावरण रहन्छ।';
    parkhaRemedy = 'घरको प्रवेशद्वारमा शुभ मंगल चिन्हहरू राख्नुहोस्।';
  } else if (parkhaElemRel.relation === 'शत्रु') {
    parkhaScore = 5;
    parkhaHarmonyStatus = 'छ्याक (सावधानी)';
    parkhaBadgeClass = 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300';
    parkhaExplanation = 'पार्खा बीच छ्याक (द्वन्द्व) योग देखिन्छ। घरको वास्तु तथा शयनकक्षको दिशा मिलाउनुपर्छ।';
    parkhaRemedy = 'आठ पार्खा यन्त्र (Baguah Mandala) घरको मुख्य कोठामा राख्नुहोस्।';
  } else {
    parkhaScore = 10;
    parkhaHarmonyStatus = 'लुए (मध्यम)';
    parkhaBadgeClass = 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200';
    parkhaExplanation = 'पार्खा स्थिति मध्यम छ। सामान्य वास्तु नियम पालना गरे पर्याप्त हुन्छ।';
    parkhaRemedy = 'पूर्व वा पश्चिम दिशालाई सदैव खुला र उज्यालो राख्नुहोस्।';
  }

  // 5. Life Force Cross-Comparison (Sog, Lu, Wang, Lungta, La)
  const lifeForceDimensions: Array<{
    id: 'sog' | 'lu' | 'wang' | 'lungta' | 'la';
    titleNepali: string;
    nameTibetan: string;
    meaningNepali: string;
  }> = [
    { id: 'sog', titleNepali: 'सोग (प्राण/जीवन शक्ति)', nameTibetan: 'སྲོག', meaningNepali: 'जीवनको आयु, ऊर्जा र आन्तरिक प्राण' },
    { id: 'lu', titleNepali: 'लु (शारीरिक धातु/स्वास्थ्य)', nameTibetan: 'ལུས', meaningNepali: 'शारीरिक आरोग्य, प्रतिरोधात्मक क्षमता र कान्ति' },
    { id: 'wang', titleNepali: 'वाङ (सामर्थ्य/प्रभाव/सम्पत्ति)', nameTibetan: 'དབང', meaningNepali: 'सामाजिक प्रभाव, व्यक्तित्व र आर्थिक अधिकार' },
    { id: 'lungta', titleNepali: 'लुङता (भाग्य/यश/उर्जा)', nameTibetan: 'རླུང་རྟ', meaningNepali: 'सौभाग्य, उन्नति, प्रसिद्धि र कार्यसफलता' },
    { id: 'la', titleNepali: 'ला (आत्मा/सूक्ष्म चेतना)', nameTibetan: 'བླ', meaningNepali: 'मानसिक दृढता, भावनात्मक सुरक्षा र आध्यात्मिक ज्योति' }
  ];

  const lifeForceRows: TibetanLifeForceComparisonRow[] = lifeForceDimensions.map((dim) => {
    const boyDim = boyForces[dim.id];
    const girlDim = girlForces[dim.id];
    const rel = getElementRelation(boyDim.element.id, girlDim.element.id);

    let badgeClass = 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200';
    let statusLabel = 'सम सम्बन्ध';
    let harmonyNoteNepali = `${boyDim.element.nameNepali} र ${girlDim.element.nameNepali} सन्तुलित छन्।`;

    if (rel.relation === 'माता' || rel.relation === 'पुत्र') {
      badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300';
      statusLabel = 'अति शुभ (पोषक)';
      harmonyNoteNepali = 'एक-अर्काको ऊर्जा र सामर्थ्यलाई पोषण दिने शास्त्रीय सम्बन्ध।';
    } else if (rel.relation === 'मित्र') {
      badgeClass = 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300';
      statusLabel = 'शुभ (समृद्धि)';
      harmonyNoteNepali = 'सहकार्य र स्थायित्वका लागि अनुकूल ऊर्जा तालमेल।';
    } else if (rel.relation === 'शत्रु') {
      badgeClass = 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300';
      statusLabel = 'सावधानी (प्रतिरोध)';
      harmonyNoteNepali = 'ऊर्जा क्षय हुन नदिन आवश्यक शान्ति र ध्यान आवश्यक।';
    }

    return {
      dimensionId: dim.id,
      titleNepali: dim.titleNepali,
      nameTibetan: dim.nameTibetan,
      meaningNepali: dim.meaningNepali,
      boyElement: boyDim.element,
      girlElement: girlDim.element,
      relation: rel.relation,
      statusLabel,
      score: Math.round((rel.score / 25) * 3), // 3 pts each = 15 pts max
      maxScore: 3,
      badgeClass,
      harmonyNoteNepali
    };
  });

  const lifeForceBalanceScore = lifeForceRows.reduce((acc, curr) => acc + curr.score, 0);
  const lifeForceStatus =
    lifeForceBalanceScore >= 12
      ? 'उत्कृष्ट ऊर्जा सामञ्जस्य'
      : lifeForceBalanceScore >= 8
      ? 'मध्यम सन्तुलित ऊर्जा'
      : 'विशेष ऊर्जा शान्ति आवश्यक';

  // Total Compatibility Percentage (0 - 100)
  const totalCompatibilityPercentage = Math.min(
    100,
    Math.max(15, animalEval.score + elementEval.score + mewaEval.score + parkhaScore + lifeForceBalanceScore)
  );

  let overallVerdictNepali: TibetanCompatibilityResult['overallVerdictNepali'] = 'उत्तम मिलान';
  if (totalCompatibilityPercentage >= 80) overallVerdictNepali = 'अति उत्तम मिलान';
  else if (totalCompatibilityPercentage >= 65) overallVerdictNepali = 'उत्तम मिलान';
  else if (totalCompatibilityPercentage >= 50) overallVerdictNepali = 'मध्यम तर उपाययोग्य';
  else overallVerdictNepali = 'विशेष विचारणीय / सावधानी आवश्यक';

  // Construct Structured Dimension Rows for the Table
  const dimensionRows: TibetanCompatibilityDimensionRow[] = [
    {
      id: 'dim_animal',
      titleNepali: '१. पशु राशि मिलान (Animal Signs)',
      category: 'animal',
      weightagePercentage: 25,
      boyValue: {
        nameNepali: boyYear.animal.nameNepali,
        nameTibetan: boyYear.animal.nameTibetan,
        colorBadge: 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700',
        detail: `${boyYear.animal.trineGroupNepali.split(' ')[0]} | स्वभाव: ${boyYear.animal.nature}`
      },
      girlValue: {
        nameNepali: girlYear.animal.nameNepali,
        nameTibetan: girlYear.animal.nameTibetan,
        colorBadge: 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700',
        detail: `${girlYear.animal.trineGroupNepali.split(' ')[0]} | स्वभाव: ${girlYear.animal.nature}`
      },
      classicalRelation: animalEval.categoryName,
      levelBadge: {
        text: animalEval.status,
        badgeClass: animalEval.badgeClass
      },
      score: animalEval.score,
      maxScore: 25,
      interpretationNepali: animalEval.interpretationNepali,
      remedyNepali: animalEval.remedyNepali
    },
    {
      id: 'dim_element',
      titleNepali: '२. पञ्चतत्व चक्र (Five Element Cycles)',
      category: 'element',
      weightagePercentage: 25,
      boyValue: {
        nameNepali: boyYear.element.nameNepali,
        nameTibetan: boyYear.element.nameTibetan,
        colorBadge: boyYear.element.badgeBg,
        detail: `रङ्ग: ${boyYear.element.color} | दिशा: ${boyYear.element.directionNepali}`
      },
      girlValue: {
        nameNepali: girlYear.element.nameNepali,
        nameTibetan: girlYear.element.nameTibetan,
        colorBadge: girlYear.element.badgeBg,
        detail: `रङ्ग: ${girlYear.element.color} | दिशा: ${girlYear.element.directionNepali}`
      },
      classicalRelation: `${elementEval.cycleType} (${elementEval.relation})`,
      levelBadge: {
        text: elementEval.relation,
        badgeClass: elementEval.badgeClass
      },
      score: elementEval.score,
      maxScore: 25,
      interpretationNepali: elementEval.explanationNepali,
      remedyNepali: elementEval.remedyNepali
    },
    {
      id: 'dim_mewa',
      titleNepali: '३. मेवा अंक सामञ्जस्य (Mewa Magic Square Numbers)',
      category: 'mewa',
      weightagePercentage: 20,
      boyValue: {
        nameNepali: `मेवा ${toDevanagariNumerals(boyMewa.number)} (${boyMewa.nameNepali})`,
        nameTibetan: boyMewa.nameTibetan,
        colorBadge: boyMewa.element.badgeBg,
        detail: `तत्व: ${boyMewa.element.nameNepali} | दिशा: ${boyMewa.directionNepali}`
      },
      girlValue: {
        nameNepali: `मेवा ${toDevanagariNumerals(girlMewa.number)} (${girlMewa.nameNepali})`,
        nameTibetan: girlMewa.nameTibetan,
        colorBadge: girlMewa.element.badgeBg,
        detail: `तत्व: ${girlMewa.element.nameNepali} | दिशा: ${girlMewa.directionNepali}`
      },
      classicalRelation: `${mewaEval.status} (${mewaEval.karmicBondNepali})`,
      levelBadge: {
        text: mewaEval.status,
        badgeClass: mewaEval.badgeClass
      },
      score: mewaEval.score,
      maxScore: 20,
      interpretationNepali: mewaEval.explanationNepali,
      remedyNepali: mewaEval.remedyNepali
    },
    {
      id: 'dim_parkha',
      titleNepali: '४. पार्खा त्रिग्राम वास्तु स्थिति (Parkha Trigrams)',
      category: 'parkha',
      weightagePercentage: 15,
      boyValue: {
        nameNepali: `${boyParkha.nameNepali.split(' ')[0]} (${boyParkha.trigramSymbol})`,
        nameTibetan: boyParkha.nameTibetan,
        colorBadge: boyParkha.element.badgeBg,
        detail: `दिशा: ${boyParkha.directionNepali} | तत्व: ${boyParkha.element.nameNepali}`
      },
      girlValue: {
        nameNepali: `${girlParkha.nameNepali.split(' ')[0]} (${girlParkha.trigramSymbol})`,
        nameTibetan: girlParkha.nameTibetan,
        colorBadge: girlParkha.element.badgeBg,
        detail: `दिशा: ${girlParkha.directionNepali} | तत्व: ${girlParkha.element.nameNepali}`
      },
      classicalRelation: parkhaHarmonyStatus,
      levelBadge: {
        text: parkhaHarmonyStatus,
        badgeClass: parkhaBadgeClass
      },
      score: parkhaScore,
      maxScore: 15,
      interpretationNepali: parkhaExplanation,
      remedyNepali: parkhaRemedy
    },
    {
      id: 'dim_lifeforce',
      titleNepali: '५. पञ्च-जीवनशक्ति चक्र (5 Life Forces Harmony)',
      category: 'lifeforce',
      weightagePercentage: 15,
      boyValue: {
        nameNepali: `सोग: ${boyForces.sog.element.nameNepali.split(' ')[0]}`,
        colorBadge: boyForces.sog.element.badgeBg,
        detail: `समग्र जीवनशक्ति: ${toDevanagariNumerals(boyForces.overallVitalityScore)}%`
      },
      girlValue: {
        nameNepali: `सोग: ${girlForces.sog.element.nameNepali.split(' ')[0]}`,
        colorBadge: girlForces.sog.element.badgeBg,
        detail: `समग्र जीवनशक्ति: ${toDevanagariNumerals(girlForces.overallVitalityScore)}%`
      },
      classicalRelation: lifeForceStatus,
      levelBadge: {
        text: lifeForceBalanceScore >= 11 ? 'उत्कृष्ट' : 'सन्तुलित',
        badgeClass:
          lifeForceBalanceScore >= 11
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
            : 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300'
      },
      score: lifeForceBalanceScore,
      maxScore: 15,
      interpretationNepali: `सोग, लु, वाङ, लुङता र ला बीचको ऊर्जा तालमेल ${lifeForceStatus} रहेको छ।`,
      remedyNepali: 'संयुक्त रूपमा लुङता ध्वजा फहराउनु र इष्टदेवको पूजा गर्नु उत्तम।'
    }
  ];

  // Strengths & Challenges
  const strengthsSummary: string[] = [];
  const challengesSummary: string[] = [];
  const traditionalHarmonizingAdvice: string[] = [];

  if (animalEval.score >= 20) {
    strengthsSummary.push(
      `पशु राशि (${boyYear.animal.nameNepali} र ${girlYear.animal.nameNepali}) बीच ${animalEval.categoryName} सम्बन्ध छ, जसले स्वाभाविक प्रेम, सन्तुष्टि र सहजीवनमा बल पुर्याउँछ।`
    );
  } else if (animalEval.score <= 10) {
    challengesSummary.push(
      `पशु राशि बीच ${animalEval.categoryName} स्थिति रहेकाले अहङ्कार, हठ वा निर्णयमा टकराव आउन सक्छ।`
    );
    traditionalHarmonizingAdvice.push(animalEval.remedyNepali);
  }

  if (elementEval.score >= 20) {
    strengthsSummary.push(
      `तत्व सम्बन्ध (${boyYear.element.nameNepali} र ${girlYear.element.nameNepali}) पोषक एवं समृद्धिकारक छ (${elementEval.cycleType})।`
    );
  } else if (elementEval.score <= 8) {
    challengesSummary.push(
      `वर्ष तत्व बीच ${elementEval.cycleType} रहेकाले कहिलेकाहीं ऊर्जा र स्वास्थ्यमा असन्तुलन देखिन सक्छ।`
    );
    traditionalHarmonizingAdvice.push(elementEval.remedyNepali);
  }

  if (mewaEval.score >= 16) {
    strengthsSummary.push(
      `मेवा अंक (${boyMewa.nameNepali} र ${girlMewa.nameNepali}) को आपसी मेलले मानसिक शान्ति र आध्यात्मिक तालमेल मजबुत बनाउँछ।`
    );
  } else if (mewaEval.score <= 8) {
    challengesSummary.push(
      `मेवा अंक बीच पूर्वजन्मको ऋण वा विरोधी तत्व रहेकाले आपसी संवादमा धैर्य अपनाउनुपर्ने हुन्छ।`
    );
    traditionalHarmonizingAdvice.push(mewaEval.remedyNepali);
  }

  if (parkhaScore >= 12) {
    strengthsSummary.push('पार्खा वास्तु दिशा र पारिवारिक शान्तिको दृष्टिले शुभ स्थितिमा छ।');
  }

  traditionalHarmonizingAdvice.push(
    'विवाह वा सहकार्य पश्चात् संयुक्त रूपमा पञ्चरङ्गी लुङता ध्वजा फहराउनु र गुरु पद्मसंभव वा सेतो ताराको स्तुति गर्नु शास्त्रीय रूपमा परम कल्याणकारी मानिन्छ।'
  );
  traditionalHarmonizingAdvice.push('आपसी संवाद, सहिष्णुता, सम्मान र इमान्दारिता नै दाम्पत्य जीवनको मूल मन्त्र हो।');

  return {
    boyAnimal: boyYear.animal,
    girlAnimal: girlYear.animal,
    animalHarmonyStatus: animalEval.status,
    animalScore: animalEval.score,

    boyElement: boyYear.element,
    girlElement: girlYear.element,
    elementRelation: elementEval.relation,
    elementScore: elementEval.score,

    boyMewa,
    girlMewa,
    mewaHarmonyStatus: mewaEval.status,
    mewaScore: mewaEval.score,

    boyParkha,
    girlParkha,
    parkhaHarmonyStatus,
    parkhaScore,

    lifeForceBalanceScore,
    lifeForceStatus,

    totalCompatibilityPercentage,
    overallVerdictNepali,
    strengthsSummary,
    challengesSummary,
    traditionalHarmonizingAdvice,
    evidence: getRuleEvidenceById('TIB_RULE_COMPATIBILITY_06'),

    // Rich Table & Details
    dimensionRows,
    lifeForceRows,
    elementCycleDetails: {
      cycleType: elementEval.cycleType,
      mediatingElement: elementEval.mediatingElement,
      explanationNepali: elementEval.explanationNepali,
      remedyRitualNepali: elementEval.remedyNepali
    },
    mewaPairingDetails: {
      karmicBondNepali: mewaEval.karmicBondNepali,
      colorHarmonyNepali: mewaEval.colorHarmonyNepali,
      explanationNepali: mewaEval.explanationNepali,
      remedyNepali: mewaEval.remedyNepali
    },
    animalPairingDetails: {
      relationshipCategory: animalEval.categoryName,
      nameTibetan: animalEval.nameTibetan,
      explanationNepali: animalEval.interpretationNepali,
      remedyNepali: animalEval.remedyNepali
    }
  };
}
