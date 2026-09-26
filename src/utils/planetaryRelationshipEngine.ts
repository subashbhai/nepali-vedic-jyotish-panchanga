import { PlanetPosition, LagnaInfo, PlanetName, RashiName } from '../types/astrology';
import { 
  PlanetaryRelationshipGraph, 
  PlanetaryRelationEdge 
} from '../types/yogaDoshaTypes';

export const SIGN_LORDS: Record<number, PlanetName> = {
  1: 'मंगल',  // मेष
  2: 'शुक्र',  // वृष
  3: 'बुध',   // मिथुन
  4: 'चन्द्र', // कर्कट
  5: 'सूर्य',  // सिंह
  6: 'बुध',   // कन्या
  7: 'शुक्र',  // तुला
  8: 'मंगल',  // वृश्चिक
  9: 'गुरु',  // धनु
  10: 'शनि', // मकर
  11: 'शनि', // कुम्भ
  12: 'गुरु', // मीन
};

export function getHouseLord(lagnaRashiId: number, houseNumber: number): PlanetName {
  const houseRashiId = ((lagnaRashiId - 1 + (houseNumber - 1)) % 12) + 1;
  return SIGN_LORDS[houseRashiId];
}

export function calculatePlanetaryRelationships(
  lagna: LagnaInfo,
  planets: PlanetPosition[]
): PlanetaryRelationshipGraph {
  const planetNames: PlanetName[] = ['सूर्य', 'चन्द्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'राहु', 'केतु'];
  const edges: PlanetaryRelationEdge[] = [];
  const conjunctionsMap: Record<number, PlanetName[]> = {};

  // Group planets by house for conjunctions
  planets.forEach((p) => {
    if (!conjunctionsMap[p.bhava]) {
      conjunctionsMap[p.bhava] = [];
    }
    conjunctionsMap[p.bhava].push(p.name);
  });

  const conjunctions = Object.entries(conjunctionsMap)
    .filter(([_, list]) => list.length > 1)
    .map(([bhavaStr, list]) => ({
      house: parseInt(bhavaStr, 10),
      planets: list,
    }));

  // Create conjunction edges
  conjunctions.forEach(({ house, planets: cPlanets }) => {
    for (let i = 0; i < cPlanets.length; i++) {
      for (let j = i + 1; j < cPlanets.length; j++) {
        edges.push({
          fromPlanet: cPlanets[i],
          toPlanet: cPlanets[j],
          relationType: 'युति',
          strengthPercentage: 100,
          descriptionNepali: `भाव ${house} मा ${cPlanets[i]} र ${cPlanets[j]} को युति सम्बन्ध`,
        });
      }
    }
  });

  // Calculate Aspects (दृष्टि)
  const aspects: Array<{ observer: PlanetName; target: PlanetName; houseDistance: number; percentage: number }> = [];

  planets.forEach((p1) => {
    planets.forEach((p2) => {
      if (p1.name === p2.name) return;

      const houseDist = ((p2.bhava - p1.bhava + 12) % 12) || 12;
      let aspectPct = 0;

      // All planets aspect 7th house
      if (houseDist === 7) {
        aspectPct = 100;
      }

      // Mars (4, 7, 8)
      if (p1.name === 'मंगल' && (houseDist === 4 || houseDist === 8)) {
        aspectPct = 100;
      }

      // Jupiter (5, 7, 9)
      if (p1.name === 'गुरु' && (houseDist === 5 || houseDist === 9)) {
        aspectPct = 100;
      }

      // Saturn (3, 7, 10)
      if (p1.name === 'शनि' && (houseDist === 3 || houseDist === 10)) {
        aspectPct = 100;
      }

      // Rahu / Ketu (5, 7, 9)
      if ((p1.name === 'राहु' || p1.name === 'केतु') && (houseDist === 5 || houseDist === 9)) {
        aspectPct = 100;
      }

      if (aspectPct > 0) {
        aspects.push({
          observer: p1.name,
          target: p2.name,
          houseDistance: houseDist,
          percentage: aspectPct,
        });

        edges.push({
          fromPlanet: p1.name,
          toPlanet: p2.name,
          relationType: aspectPct === 100 ? 'पूर्ण_दृष्टि' : 'आंशिक_दृष्टि',
          strengthPercentage: aspectPct,
          descriptionNepali: `${p1.name} को ${p2.name} माथि ${houseDist} औँ भाव दृष्टि (${aspectPct}%)`,
        });
      }
    });
  });

  // Calculate Parivartana Yogas (राशि परिवर्तन)
  const parivartanaYogas: Array<{ planet1: PlanetName; planet2: PlanetName; house1: number; house2: number; type: 'महा' | 'दैन्य' | 'खल' }> = [];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];

      const p1LordOfP2Rashi = SIGN_LORDS[p2.rashiId] === p1.name;
      const p2LordOfP1Rashi = SIGN_LORDS[p1.rashiId] === p2.name;

      if (p1LordOfP2Rashi && p2LordOfP1Rashi) {
        const dusthana = [6, 8, 12];
        let pType: 'महा' | 'दैन्य' | 'खल' = 'महा';

        if (dusthana.includes(p1.bhava) || dusthana.includes(p2.bhava)) {
          pType = 'दैन्य';
        } else if (p1.bhava === 3 || p2.bhava === 3) {
          pType = 'खल';
        }

        parivartanaYogas.push({
          planet1: p1.name,
          planet2: p2.name,
          house1: p1.bhava,
          house2: p2.bhava,
          type: pType,
        });

        edges.push({
          fromPlanet: p1.name,
          toPlanet: p2.name,
          relationType: 'राशि_परिवर्तन',
          strengthPercentage: 95,
          descriptionNepali: `${p1.name} (भाव ${p1.bhava}) र ${p2.name} (भाव ${p2.bhava}) बीच ${pType} राशि परिवर्तन योग`,
        });
      }
    }
  }

  // Calculate Nakshatra Lord Links
  const nakshatraLordLinks: Array<{ planet: PlanetName; nakshatraLord: PlanetName; lordHouse: number; lordRashi: RashiName }> = [];

  planets.forEach((p) => {
    const nLordName = p.nakshatraLord as PlanetName;
    const lordObj = planets.find((lp) => lp.name === nLordName);

    if (lordObj) {
      nakshatraLordLinks.push({
        planet: p.name,
        nakshatraLord: nLordName,
        lordHouse: lordObj.bhava,
        lordRashi: lordObj.rashiName,
      });

      edges.push({
        fromPlanet: p.name,
        toPlanet: nLordName,
        relationType: 'नक्षत्र_सम्बन्ध',
        strengthPercentage: 80,
        descriptionNepali: `${p.name} (${p.nakshatraName} नक्षत्र) को नक्षत्र स्वामी ${nLordName} भाव ${lordObj.bhava} मा स्थित छ`,
      });
    }
  });

  return {
    nodes: planetNames,
    edges,
    conjunctions,
    aspects,
    parivartanaYogas,
    nakshatraLordLinks,
  };
}
