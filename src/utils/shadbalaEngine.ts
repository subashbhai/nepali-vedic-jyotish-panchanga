import { ShadbalaResult, PlanetPosition, PlanetName } from '../types/astrology';

export function calculateShadbala(planets: PlanetPosition[]): ShadbalaResult[] {
  const results: ShadbalaResult[] = [];

  const requiredRupasMap: Record<PlanetName, number> = {
    'सूर्य': 6.5,
    'चन्द्र': 6.0,
    'मंगल': 5.0,
    'बुध': 7.0,
    'गुरु': 6.5,
    'शुक्र': 5.5,
    'शनि': 5.0,
    'राहु': 5.0,
    'केतु': 5.0,
  };

  planets.forEach((p) => {
    // 1. Sthana Bala (Exaltation + Own sign + Drekkana)
    let sthana = 120;
    if (p.dignity === 'उच्च') sthana = 240;
    if (p.dignity === 'स्वक्षेत्र') sthana = 180;
    if (p.dignity === 'नीच') sthana = 40;

    // 2. Dik Bala (Directional strength)
    // Sun/Mars strong in 10th, Jupiter/Mercury in 1st, Venus/Moon in 4th, Saturn in 7th
    let dik = 30;
    if ((p.name === 'सूर्य' || p.name === 'मंगल') && p.bhava === 10) dik = 60;
    if ((p.name === 'गुरु' || p.name === 'बुध') && p.bhava === 1) dik = 60;
    if ((p.name === 'शुक्र' || p.name === 'चन्द्र') && p.bhava === 4) dik = 60;
    if (p.name === 'शनि' && p.bhava === 7) dik = 60;

    // 3. Kala Bala (Temporal strength)
    let kala = 80;

    // 4. Chesta Bala (Motional strength)
    let chesta = p.isRetrograde ? 55 : 35;

    // 5. Naisargika Bala (Natural strength in Virupas)
    const naisargikaMap: Record<PlanetName, number> = {
      'सूर्य': 60,
      'चन्द्र': 51.4,
      'शुक्र': 42.8,
      'गुरु': 34.2,
      'बुध': 25.7,
      'मंगल': 17.1,
      'शनि': 8.5,
      'राहु': 20,
      'केतु': 20,
    };
    const naisargika = naisargikaMap[p.name] || 25;

    // 6. Drik Bala (Aspect strength)
    let drik = 25;

    const totalVirupas = sthana + dik + kala + chesta + naisargika + drik;
    const totalRupas = Number((totalVirupas / 60).toFixed(2));
    const req = requiredRupasMap[p.name] || 6.0;
    const ratio = Number((totalRupas / req).toFixed(2));

    let strengthLabel: ShadbalaResult['strengthLabel'] = 'सामान्य';
    if (ratio >= 1.2) strengthLabel = 'अत्यन्त बलियो';
    else if (ratio >= 1.0) strengthLabel = 'बलियो';
    else if (ratio < 0.8) strengthLabel = 'कमजोर';

    results.push({
      planet: p.name,
      sthanaBala: Math.round(sthana),
      dikBala: Math.round(dik),
      kalaBala: Math.round(kala),
      chestaBala: Math.round(chesta),
      naisargikaBala: Math.round(naisargika),
      drikBala: Math.round(drik),
      totalVirupas: Math.round(totalVirupas),
      totalRupas,
      requiredRupas: req,
      ratio,
      strengthLabel,
    });
  });

  return results;
}
