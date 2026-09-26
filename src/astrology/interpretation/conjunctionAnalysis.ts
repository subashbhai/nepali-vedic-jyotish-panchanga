import { PlanetName } from '../../types/astrology';
import { ConjunctionAnalysis } from './types';
import { NATURAL_FRIENDSHIPS } from './planetDignity';

/**
 * Analyzes conjunctions for a target planet with all other planets in the same house.
 */
export function analyzeConjunctions(
  targetPlanet: PlanetName,
  targetHouse: number,
  targetLongitude: number,
  allPlanetsPositions: Array<{ name: PlanetName; bhava: number; longitude: number }>
): ConjunctionAnalysis[] {
  const result: ConjunctionAnalysis[] = [];

  const conjoinedPlanets = allPlanetsPositions.filter(
    (p) => p.name !== targetPlanet && p.bhava === targetHouse
  );

  conjoinedPlanets.forEach((other) => {
    const diff = Math.abs(targetLongitude - other.longitude);
    const degrees = Math.floor(diff);
    const minutes = Math.round((diff - degrees) * 60);
    const formattedDiff = `${degrees}° ${minutes}'`;

    // Relation nature
    const friendData = NATURAL_FRIENDSHIPS[targetPlanet];
    let relationshipNature: 'मित्र' | 'शत्रु' | 'सम' = 'सम';
    if (friendData?.friends.includes(other.name)) relationshipNature = 'मित्र';
    else if (friendData?.enemies.includes(other.name)) relationshipNature = 'शत्रु';

    // Combustion check
    const isCombust = (other.name === 'सूर्य' || targetPlanet === 'सूर्य') && diff <= 8;

    // Special Yogas or Combinations
    let specialYogaName: string | undefined = undefined;
    let interpretation = `${targetPlanet} र ${other.name} भाव ${targetHouse} मा ${formattedDiff} को कोणात्मक दूरीमा युतिमा छन्। `;

    const pair = [targetPlanet, other.name].sort().join('-');

    if (pair === 'बुध-सूर्य') {
      specialYogaName = 'बुधादित्य योग (Budhaditya Yoga)';
      interpretation += 'सूर्य र बुधको यो शुभ युतिले तीव्र बौद्धिक क्षमता, गणना, प्रशासनिक कुशलता र मान-प्रतिष्ठा दिन्छ।';
    } else if (pair === 'चन्द्र-मंगल') {
      specialYogaName = 'चन्द्र-मंगल योग (Chandra-Mangal Laxmi Yoga)';
      interpretation += 'चन्द्र र मंगलको युतिले उद्यमशीलता, आर्थिक समृद्धि र कार्यकुशलता प्रदान गर्दछ।';
    } else if (pair === 'गुरु-मंगल') {
      specialYogaName = 'गुरु-मंगल योग (Guru-Mangal Yoga)';
      interpretation += 'ज्ञान र पराक्रमको यो सुन्दर मेलले नैतिक नेतृत्व र सफलता प्रदान गर्दछ।';
    } else if (pair === 'गुरु-चन्द्र') {
      specialYogaName = 'गजकेसरी योग (Gajakesari Yoga Aspect/Conjunction)';
      interpretation += 'गुरु र चन्द्रमाको शुभ संयोगले उच्च लोकप्रियता, आदर र बुद्धिमत्ता प्रदान गर्दछ।';
    } else if (pair === 'शनि-सूर्य') {
      specialYogaName = 'सूर्य-शनि पिता-पुत्र युति';
      interpretation += 'सूर्य र शनिको युतिले जीवनमा आत्म-अनुशासन, संघर्ष र अधिकार प्राप्तिका लागि विशेष मेहनत माग्दछ।';
    } else if (pair === 'राहु-सूर्य' || pair === 'केतु-सूर्य') {
      specialYogaName = 'सूर्य-ग्रहण प्रभाव (Surya Grahan Conjunction)';
      interpretation += 'सूर्यसँग छायाग्रहको युतिले आत्मबल वा पिताको स्वास्थ्य/प्रतिष्ठामा अतिरिक्त सतर्कता माग्छ।';
    } else if (pair === 'राहु-चन्द्र' || pair === 'केतु-चन्द्र') {
      specialYogaName = 'चन्द्र-ग्रहण प्रभाव (Chandra Grahan Conjunction)';
      interpretation += 'चन्द्रमासँग छायाग्रहको युतिले मानसिक चिन्तन र भावनामा उतारचढाव गराउन सक्छ।';
    } else if (pair === 'राहु-शनि') {
      specialYogaName = 'शनि-राहु युति';
      interpretation += 'शनि र राहुको युतिले प्रविधि, दूरदर्शिता र वैदेशिक क्षेत्रमा चासो दिन्छ।';
    } else {
      interpretation += `यी दुई ग्रहको निसर्ग सम्बन्ध ${relationshipNature} रहेकाले यिनीहरूले आ-आफ्नो कारकत्व अनुकूल/प्रतिकूल रूपमा मिलाएर फल दिन्छन्।`;
    }

    result.push({
      conjoinedPlanet: other.name,
      angularDistanceDegree: diff,
      formattedDistance: formattedDiff,
      relationshipNature,
      combustionRisk: isCombust,
      specialYogaName,
      interpretationNepali: interpretation,
    });
  });

  return result;
}
