import { GocharTransitResult, PlanetPosition, PlanetName, RashiName } from '../types/astrology';
import { RASHI_DATA } from './astroCalculations';

export function calculateGocharAndSadeSati(
  birthMoon: PlanetPosition,
  transitPlanets: PlanetPosition[],
  transitDateStr: string
): GocharTransitResult {
  const moonRashiId = birthMoon.rashiId;

  // Transits relative to Moon
  const transits = transitPlanets.map((tp) => {
    const houseFromMoon = ((tp.rashiId - moonRashiId + 12) % 12) + 1;

    let nature: 'शुभ' | 'अशुभ' | 'सम' = 'सम';
    let descriptionNepali = '';

    // Classical auspicious transit houses from Moon:
    // Sun: 3, 6, 10, 11
    // Moon: 1, 3, 6, 7, 10, 11
    // Mars: 3, 6, 11
    // Mercury: 2, 4, 6, 8, 10, 11
    // Jupiter: 2, 5, 7, 9, 11
    // Venus: 1, 2, 3, 4, 5, 8, 9, 11, 12
    // Saturn: 3, 6, 11
    // Rahu/Ketu: 3, 6, 11

    if (tp.name === 'गुरु') {
      if ([2, 5, 7, 9, 11].includes(houseFromMoon)) {
        nature = 'शुभ';
        descriptionNepali = `गुरु चन्द्र राशिबाट ${houseFromMoon} औँ भावमा गोचर गर्दा कार्यसिद्धि, ज्ञान वृद्धि, आर्थिक उन्नति र पारिवारिक शुभ कार्य हुनेछ।`;
      } else {
        nature = 'अशुभ';
        descriptionNepali = `गुरु चन्द्र राशिबाट ${houseFromMoon} औँ भावमा रहेकाले अनावश्यक खर्च र काममा केही ढिलाइ हुन सक्छ।`;
      }
    } else if (tp.name === 'शनि') {
      if ([3, 6, 11].includes(houseFromMoon)) {
        nature = 'शुभ';
        descriptionNepali = `शनिदेव चन्द्र राशिबाट ${houseFromMoon} औँ भावमा गोचर गर्दा शत्रु पराजय, सफलता र अधिकार प्राप्ति हुनेछ।`;
      } else {
        nature = 'अशुभ';
        descriptionNepali = `शनिदेवको चन्द्र राशिबाट ${houseFromMoon} औँ भावको गोचरले संघर्ष र कार्यमा निरन्तर धैर्यताको माग गर्दछ।`;
      }
    } else if (tp.name === 'राहु' || tp.name === 'केतु') {
      if ([3, 6, 11].includes(houseFromMoon)) {
        nature = 'शुभ';
        descriptionNepali = `${tp.name} ${houseFromMoon} औँ भावमा शुभ फलदायी रहेकाले अचानक धनलाभ र वैदेशिक सफलता मिल्न सक्छ।`;
      } else {
        nature = 'अशुभ';
        descriptionNepali = `${tp.name} ${houseFromMoon} औँ भावमा रहेकाले भ्रम तथा अनावश्यक दौडधुपबाट सतर्क रहनुहोला।`;
      }
    } else {
      nature = 'सम';
      descriptionNepali = `${tp.name} चन्द्रमाबाट ${houseFromMoon} औँ भावमा गोचर गर्दै हुनुहुन्छ।`;
    }

    return {
      planet: tp.name,
      transitRashi: tp.rashiName,
      houseFromMoon,
      nature,
      descriptionNepali,
    };
  });

  // Sade Sati / Dhaiya Detector based on Saturn's position
  const saturn = transitPlanets.find((p) => p.name === 'शनि')!;
  const saturnHouseFromMoon = ((saturn.rashiId - moonRashiId + 12) % 12) + 1;

  let sadeSatiStatus: GocharTransitResult['sadeSati']['status'] = 'कुनै प्रभाव छैन';
  let phaseName = '';
  let descriptionNepali = 'हाल तपाईंका लागि शनिदेवको साढेसाती वा अष्टम/कण्टक ढैय्या चलिरहेको छैन। गोचर अनुकूल छ।';
  let remediesNepali: string[] = ['दैनिक हनुमान चालीसा वा शिव स्तोत्र पाठ', 'शनिबार पीपलमा जल अर्पण'];

  if (saturnHouseFromMoon === 12) {
    sadeSatiStatus = 'साढेसाती सुरु';
    phaseName = 'प्रथम चरण (सिरमा साढेसाती - १२औँ भाव)';
    descriptionNepali = 'शनिदेव चन्द्र राशिबाट १२औँ भाव (व्यय भाव) मा रहेकाले साढेसातीको पहिलो चरण चलिरहेको छ। अनावश्यक खर्च, वैदेशिक दौडधुप र आँखा/स्वास्थ्यमा ध्यान दिनुहोला।';
    remediesNepali = [
      'शनिबार साँझ पीपलको बोटमुनि तोरीको तेलको दीप बाल्ने',
      'हनुमान चालीसा वा बजरंग बाणको पाठ गर्ने',
      'कालो तिल, कालो कपडा र मासको दाल दान गर्ने',
    ];
  } else if (saturnHouseFromMoon === 1) {
    sadeSatiStatus = 'साढेसाती मध्य (शिखर)';
    phaseName = 'द्वितीय चरण (हृदयमा साढेसाती - १लौँ भाव)';
    descriptionNepali = 'शनिदेव जन्म चन्द्र राशिको माथिबाटै भ्रमण गरिरहनुभएकाले साढेसातीको मुख्य शिखर चरण चलिरहेको छ। मानसिक तनाव, परिश्रम र निर्णय लिँदा विशेष सावधानी अपनाउनुहोला।';
    remediesNepali = [
      'दैनिक श्री हनुमान चालीसा र महामृत्युञ्जय मन्त्रको जप',
      'शनि मन्त्र: "ॐ शं शनैश्चराय नमः" (१०८ पटक)',
      'छायापात्र दान (तेलमा आफ्नो अनुहार हेरेर दान गर्ने)',
    ];
  } else if (saturnHouseFromMoon === 2) {
    sadeSatiStatus = 'साढेसाती अन्तिम';
    phaseName = 'तृतीय चरण (गोडामा साढेसाती - २औँ भाव)';
    descriptionNepali = 'शनिदेव चन्द्र राशिबाट २औँ भाव (धन तथा वाणी भाव) मा रहेकाले साढेसातीको अन्तिम चरण चलिरहेको छ। वाणीमा नियन्त्रण र आर्थिक कारोबारमा सतर्कता राख्नुहोला।';
    remediesNepali = [
      'शनि स्तोत्रको नियमित पाठ',
      'गरिब तथा असहाय व्यक्तिहरूलाई भोजन वा वस्त्र दान',
    ];
  } else if (saturnHouseFromMoon === 4) {
    sadeSatiStatus = 'ढैय्या';
    phaseName = 'चौथो भावको कण्टक शनि (२.५ वर्ष)';
    descriptionNepali = 'शनिदेव चन्द्र राशिबाट चौथो भावमा रहेकाले कण्टक शनिको ढैय्या चलिरहेको छ। पारिवारिक सुख र सवारी साधन चलाउँदा सावधानी अपनाउनुहोला।';
    remediesNepali = ['शनिवार शिवजीलाई तिलयुक्त जल अर्पण गर्ने', 'सवारी चलाउँदा सावधानी'];
  } else if (saturnHouseFromMoon === 8) {
    sadeSatiStatus = 'अष्टम शनि';
    phaseName = 'अष्टम शनिको ढैय्या (२.५ वर्ष)';
    descriptionNepali = 'शनिदेव चन्द्र राशिबाट आठौँ भावमा रहेकाले अष्टम शनिको ढैय्या प्रभाव छ। स्वास्थ्य, बाटोघाटो र गुप्त शत्रुबाट सतर्क रहनुहोला।';
    remediesNepali = ['महामृत्युञ्जय जप', 'शनि शान्ति पूजा तथा दीपदान'];
  }

  return {
    date: transitDateStr,
    transits,
    sadeSati: {
      status: sadeSatiStatus,
      phaseName,
      descriptionNepali,
      remediesNepali,
    },
  };
}
