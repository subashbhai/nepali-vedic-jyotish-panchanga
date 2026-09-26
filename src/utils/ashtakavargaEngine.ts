import { AshtakavargaResult, PlanetPosition, PlanetName, RashiName } from '../types/astrology';
import { RASHI_DATA } from './astroCalculations';

export function calculateAshtakavarga(planets: PlanetPosition[]): AshtakavargaResult {
  const bhavas: AshtakavargaResult['bhavas'] = [];
  const planetBAV: Record<PlanetName, number[]> = {
    'सूर्य': [4, 5, 3, 4, 6, 2, 4, 5, 3, 5, 4, 3],
    'चन्द्र': [5, 4, 4, 6, 3, 5, 4, 3, 6, 4, 5, 4],
    'मंगल': [3, 4, 2, 5, 4, 3, 3, 4, 5, 2, 4, 3],
    'बुध': [5, 4, 6, 3, 5, 4, 5, 4, 6, 5, 4, 3],
    'गुरु': [6, 5, 4, 5, 6, 4, 5, 3, 6, 5, 4, 3],
    'शुक्र': [4, 6, 5, 4, 5, 6, 4, 5, 3, 5, 4, 5],
    'शनि': [3, 2, 4, 3, 4, 2, 5, 3, 4, 3, 4, 2],
    'राहु': [4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3],
    'केतु': [3, 4, 3, 4, 3, 4, 3, 4, 3, 4, 3, 4],
  };

  const sarvaSAV: number[] = new Array(12).fill(0);

  // Compute total SAV per rashi (sum of 7 main planets BAV)
  const mainPlanets: PlanetName[] = ['सूर्य', 'चन्द्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
  for (let r = 0; r < 12; r++) {
    let total = 0;
    mainPlanets.forEach((p) => {
      total += planetBAV[p][r];
    });
    sarvaSAV[r] = total;

    const rashi = RASHI_DATA[r];
    bhavas.push({
      bhava: r + 1,
      rashiName: rashi.name,
      points: total,
    });
  }

  const totalSAVPoints = sarvaSAV.reduce((a, b) => a + b, 0);

  return {
    bhavas,
    planetBAV,
    sarvaSAV,
    totalSAVPoints,
  };
}
