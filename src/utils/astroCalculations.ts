import { 
  BirthDetails, 
  PlanetPosition, 
  PlanetName, 
  RashiName, 
  RashiInfo, 
  LagnaInfo, 
  DivisionalChart, 
  DivisionalChartType, 
  ChartHouse 
} from '../types/astrology';
import { toDevanagariNumerals } from './nepaliCalendar';
import { 
  canonicalJulianDay, 
  getCanonicalLahiriAyanamsa, 
  calculateCanonicalSun, 
  calculateCanonicalMoon 
} from './canonicalAstroEngine';
import { generateDivisionalChartEx } from './vargaEngine';
import { RASHI_DATA } from '../data/rashiData';
import { calculateAyanamsaValue, AyanamsaSystem } from './ayanamsaEngine';

// 12 Rashis Metadata
export { RASHI_DATA };

// 27 Nakshatras Database with Lord, Deva, Gana, Yoni, Nadi
export const NAKSHATRA_DATA = [
  { id: 1, name: 'अश्विनी', lord: 'केतु', devata: 'अश्विनीकुमार', gana: 'देव', yoni: 'अश्व', nadi: 'आद्य', rashiStartId: 1 },
  { id: 2, name: 'भरणी', lord: 'शुक्र', devata: 'यम', gana: 'मानव', yoni: 'गज', nadi: 'मध्य', rashiStartId: 1 },
  { id: 3, name: 'कृत्तिका', lord: 'सूर्य', devata: 'अग्नि', gana: 'राक्षस', yoni: 'मेष', nadi: 'अन्त्य', rashiStartId: 1 },
  { id: 4, name: 'रोहिणी', lord: 'चन्द्र', devata: 'ब्रह्मा', gana: 'मानव', yoni: 'सर्प', nadi: 'अन्त्य', rashiStartId: 2 },
  { id: 5, name: 'मृगशिरा', lord: 'मंगल', devata: 'सोम', gana: 'देव', yoni: 'सर्प', nadi: 'मध्य', rashiStartId: 2 },
  { id: 6, name: 'आर्द्रा', lord: 'राहु', devata: 'रुद्र', gana: 'मानव', yoni: 'श्वान', nadi: 'आद्य', rashiStartId: 3 },
  { id: 7, name: 'पुनर्वसु', lord: 'गुरु', devata: 'अदिति', gana: 'देव', yoni: 'मार्जार', nadi: 'आद्य', rashiStartId: 3 },
  { id: 8, name: 'पुष्य', lord: 'शनि', devata: 'बृहस्पति', gana: 'देव', yoni: 'मेष', nadi: 'मध्य', rashiStartId: 4 },
  { id: 9, name: 'आश्लेषा', lord: 'बुध', devata: 'सर्प', gana: 'राक्षस', yoni: 'मार्जार', nadi: 'अन्त्य', rashiStartId: 4 },
  { id: 10, name: 'मघा', lord: 'केतु', devata: 'पितृ', gana: 'राक्षस', yoni: 'मूषक', nadi: 'अन्त्य', rashiStartId: 5 },
  { id: 11, name: 'पूर्वाफाल्गुनी', lord: 'शुक्र', devata: 'भग', gana: 'मानव', yoni: 'मूषक', nadi: 'मध्य', rashiStartId: 5 },
  { id: 12, name: 'उत्तराफाल्गुनी', lord: 'सूर्य', devata: 'अर्यमा', gana: 'मानव', yoni: 'गो', nadi: 'आद्य', rashiStartId: 5 },
  { id: 13, name: 'हस्त', lord: 'चन्द्र', devata: 'सविता', gana: 'देव', yoni: 'महिष', nadi: 'आद्य', rashiStartId: 6 },
  { id: 14, name: 'चित्रा', lord: 'मंगल', devata: 'विश्वकर्मा', gana: 'राक्षस', yoni: 'व्याघ्र', nadi: 'मध्य', rashiStartId: 6 },
  { id: 15, name: 'स्वाती', lord: 'राहु', devata: 'वायु', gana: 'देव', yoni: 'महिष', nadi: 'अन्त्य', rashiStartId: 7 },
  { id: 16, name: 'विशाखा', lord: 'गुरु', devata: 'इन्द्राग्नि', gana: 'राक्षस', yoni: 'व्याघ्र', nadi: 'अन्त्य', rashiStartId: 7 },
  { id: 17, name: 'अनुराधा', lord: 'शनि', devata: 'मित्र', gana: 'देव', yoni: 'मृग', nadi: 'मध्य', rashiStartId: 8 },
  { id: 18, name: 'ज्येष्ठा', lord: 'बुध', devata: 'इन्द्र', gana: 'राक्षस', yoni: 'मृग', nadi: 'आद्य', rashiStartId: 8 },
  { id: 19, name: 'मूल', lord: 'केतु', devata: 'निर्ऋति', gana: 'राक्षस', yoni: 'श्वान', nadi: 'आद्य', rashiStartId: 9 },
  { id: 20, name: 'पूर्वाषाढा', lord: 'शुक्र', devata: 'जल', gana: 'मानव', yoni: 'कपि', nadi: 'मध्य', rashiStartId: 9 },
  { id: 21, name: 'उत्तराषाढा', lord: 'सूर्य', devata: 'विश्वेदेवा', gana: 'मानव', yoni: 'नकुल', nadi: 'अन्त्य', rashiStartId: 9 },
  { id: 22, name: 'श्रवण', lord: 'चन्द्र', devata: 'विष्णु', gana: 'देव', yoni: 'कपि', nadi: 'अन्त्य', rashiStartId: 10 },
  { id: 23, name: 'धनिष्ठा', lord: 'मंगल', devata: 'वसु', gana: 'राक्षस', yoni: 'सिंह', nadi: 'मध्य', rashiStartId: 10 },
  { id: 24, name: 'शतभिषा', lord: 'राहु', devata: 'वरुण', gana: 'राक्षस', yoni: 'अश्व', nadi: 'आद्य', rashiStartId: 11 },
  { id: 25, name: 'पूर्वाभाद्रपदा', lord: 'गुरु', devata: 'अजैकपाद', gana: 'मानव', yoni: 'सिंह', nadi: 'आद्य', rashiStartId: 11 },
  { id: 26, name: 'उत्तराभाद्रपदा', lord: 'शनि', devata: 'अहिर्बुध्न्य', gana: 'मानव', yoni: 'गौ', nadi: 'मध्य', rashiStartId: 12 },
  { id: 27, name: 'रेवती', lord: 'बुध', devata: 'पूषा', gana: 'देव', yoni: 'हस्ती', nadi: 'अन्त्य', rashiStartId: 12 },
];

// Calculation for Julian Day (High-Precision Canonical)
export function getJulianDay(dateAD: string, timeStr: string, timeZone: number): number {
  return canonicalJulianDay(dateAD, timeStr, timeZone).jdUT;
}

// Calculate Ayanamsa across selected systems (Chitrapaksha, KP, Raman, etc.)
export function getAyanamsa(julianDay: number, ayanamsaSystem: AyanamsaSystem | string = 'Chitrapaksha'): number {
  return calculateAyanamsaValue(julianDay, ayanamsaSystem);
}

// Format Angle into Degrees, Minutes, Seconds
export function formatDegreeMinSec(degreeAngle: number): string {
  const deg = Math.floor(degreeAngle);
  const remMinutes = (degreeAngle - deg) * 60;
  const min = Math.floor(remMinutes);
  const sec = Math.round((remMinutes - min) * 60);

  return `${toDevanagariNumerals(deg)}° ${toDevanagariNumerals(min)}' ${toDevanagariNumerals(sec)}"`;
}

// Calculation Caches for Performance
const lagnaCache = new Map<string, LagnaInfo>();
const planetaryCache = new Map<string, PlanetPosition[]>();

export function clearPlanetaryAndLagnaCaches(): void {
  lagnaCache.clear();
  planetaryCache.clear();
}

// Calculate Ascendant (Lagna)
export function calculateLagna(julianDay: number, latitude: number, longitude: number, ayanamsa: number): LagnaInfo {
  const cacheKey = `${julianDay.toFixed(5)}_${latitude.toFixed(4)}_${longitude.toFixed(4)}_${ayanamsa.toFixed(4)}`;
  if (lagnaCache.has(cacheKey)) {
    return lagnaCache.get(cacheKey)!;
  }

  const T = (julianDay - 2451545.0) / 36525.0;
  // Greenwich Sidereal Time (GST) in degrees
  let gmst = 280.46061837 + 360.98564736629 * (julianDay - 2451545.0) + 0.000387933 * T * T;
  gmst = (gmst % 360 + 360) % 360;

  // Local Sidereal Time (LST)
  const lst = (gmst + longitude % 360 + 360) % 360;
  const radLST = (lst * Math.PI) / 180.0;
  const radLat = (latitude * Math.PI) / 180.0;
  const eps = (23.4392911 * Math.PI) / 180.0; // Obliquity of ecliptic

  // Ascendant formula
  const y = Math.cos(radLST);
  const x = -Math.sin(radLST) * Math.cos(eps) - Math.tan(radLat) * Math.sin(eps);
  let ascendantRad = Math.atan2(y, x);
  let ascendantDeg = (ascendantRad * 180.0) / Math.PI;
  ascendantDeg = (ascendantDeg % 360 + 360) % 360;

  // Sidereal Lagna
  let siderealLagnaDeg = (ascendantDeg - ayanamsa + 360) % 360;
  if (isNaN(siderealLagnaDeg)) siderealLagnaDeg = 0;

  const rashiId = ((Math.floor(siderealLagnaDeg / 30) % 12) + 12) % 12 + 1;
  const degreeInRashi = ((siderealLagnaDeg % 30) + 30) % 30;
  const rashi = RASHI_DATA[rashiId - 1] || RASHI_DATA[0];

  const nakshatraIndex = Math.min(26, Math.max(0, Math.floor(siderealLagnaDeg / (360 / 27))));
  const nakshatra = NAKSHATRA_DATA[nakshatraIndex] || NAKSHATRA_DATA[0];
  const nakshatraDeg = siderealLagnaDeg % (360 / 27);
  const pada = Math.floor(nakshatraDeg / (360 / 108)) + 1;

  const result: LagnaInfo = {
    rashiId,
    rashiName: rashi.name,
    degree: degreeInRashi,
    formattedDegree: formatDegreeMinSec(degreeInRashi),
    nakshatraName: nakshatra.name,
    pada,
    lord: rashi.lord,
  };

  if (lagnaCache.size > 200) lagnaCache.clear();
  lagnaCache.set(cacheKey, result);
  return result;
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function norm360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function solveKepler(M_deg: number, e: number): number {
  const M = degToRad(M_deg);
  let E = M;
  for (let i = 0; i < 6; i++) {
    const delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= delta;
    if (Math.abs(delta) < 1e-7) break;
  }
  return E;
}

interface HeliocentricElements {
  a: number;
  e: number;
  I: number;
  L: number;
  w: number;
  node: number;
  rates: { a: number; e: number; I: number; L: number; w: number; node: number };
}

const PLANET_ELEMENTS: Record<string, HeliocentricElements> = {
  earth:   { a: 1.000000, e: 0.016709, I: 0.0,      L: 100.464, w: 102.937, node: 0.0,     rates: { a: 0, e: -0.000042, I: 0,      L: 36000.770, w: 0.323, node: 0 } },
  mercury: { a: 0.387098, e: 0.205630, I: 7.005,    L: 252.251, w: 77.456,  node: 48.331,  rates: { a: 0, e: 0.000025,  I: -0.006, L: 149472.674, w: 0.160, node: -0.125 } },
  venus:   { a: 0.723332, e: 0.006773, I: 3.395,    L: 181.980, w: 131.572, node: 76.680,  rates: { a: 0, e: -0.000049, I: 0.004,  L: 58517.816, w: 0.050, node: -0.278 } },
  mars:    { a: 1.523679, e: 0.093405, I: 1.850,    L: 355.433, w: 336.060, node: 49.558,  rates: { a: 0, e: 0.000092,  I: -0.007, L: 19140.299, w: 0.444, node: -0.295 } },
  jupiter: { a: 5.204267, e: 0.048498, I: 1.303,    L: 34.351,  w: 14.331,  node: 100.464, rates: { a: 0, e: 0.000163,  I: -0.006, L: 3034.906,  w: 0.161, node: 0.177 } },
  saturn:  { a: 9.582017, e: 0.055546, I: 2.489,    L: 50.077,  w: 93.057,  node: 113.666, rates: { a: 0, e: -0.000346, I: 0.004,  L: 1222.114,  w: 0.542, node: -0.289 } }
};

function getHeliocentricPos(pName: string, T: number) {
  const el = PLANET_ELEMENTS[pName];
  const a = el.a + el.rates.a * T;
  const e = el.e + el.rates.e * T;
  const I = degToRad(el.I + el.rates.I * T);
  const L = norm360(el.L + el.rates.L * T);
  const w = norm360(el.w + el.rates.w * T);
  const node = degToRad(norm360(el.node + el.rates.node * T));
  const M = norm360(L - w);

  const E = solveKepler(M, e);
  const xv = a * (Math.cos(E) - e);
  const yv = a * Math.sqrt(Math.max(0, 1 - e * e)) * Math.sin(E);
  const v = Math.atan2(yv, xv);
  const r = Math.sqrt(xv * xv + yv * yv);

  const u = v + degToRad(w) - node;
  const x = r * (Math.cos(node) * Math.cos(u) - Math.sin(node) * Math.sin(u) * Math.cos(I));
  const y = r * (Math.sin(node) * Math.cos(u) + Math.cos(node) * Math.sin(u) * Math.cos(I));
  const z = r * (Math.sin(u) * Math.sin(I));
  return { x, y, z };
}

function calculateGeocentricPlanet(pName: string, d: number): { longitude: number; speed: number; isRetrograde: boolean } {
  const calcAt = (dayOffset: number) => {
    const T = (d + dayOffset) / 36525.0;
    const p = getHeliocentricPos(pName, T);
    const earth = getHeliocentricPos('earth', T);
    const xg = p.x - earth.x;
    const yg = p.y - earth.y;
    return norm360(radToDeg(Math.atan2(yg, xg)));
  };

  const l0 = calcAt(0);
  const l1 = calcAt(0.05);
  let speed = (l1 - l0) / 0.05;
  if (speed > 180) speed -= 360 / 0.05;
  if (speed < -180) speed += 360 / 0.05;

  return {
    longitude: l0,
    speed,
    isRetrograde: speed < 0
  };
}

function calculateSunCoordinates(d: number): { longitude: number; speed: number } {
  const g = norm360(357.529 + 0.98560028 * d);
  const q = norm360(280.459 + 0.98564736 * d);
  const l0 = norm360(q + 1.915 * Math.sin(degToRad(g)) + 0.020 * Math.sin(degToRad(2 * g)));
  
  const g1 = norm360(357.529 + 0.98560028 * (d + 0.1));
  const q1 = norm360(280.459 + 0.98564736 * (d + 0.1));
  const l1 = norm360(q1 + 1.915 * Math.sin(degToRad(g1)) + 0.020 * Math.sin(degToRad(2 * g1)));
  let speed = (l1 - l0) / 0.1;
  if (speed > 180) speed -= 3600;
  if (speed < -180) speed += 3600;

  return { longitude: l0, speed };
}

function calculateMoonCoordinates(d: number): { longitude: number; speed: number } {
  const calcAt = (dayOffset: number) => {
    const T = (d + dayOffset) / 36525.0;
    const L0 = norm360(218.3164477 + 481267.88128 * T);
    const D = norm360(297.8501921 + 445267.11140 * T);
    const M = norm360(357.5291092 + 35999.05029 * T);
    const Mprime = norm360(134.9633964 + 477198.86750 * T);
    const F = norm360(93.2720950 + 483202.01752 * T);

    let l = L0
      + 6.288774 * Math.sin(degToRad(Mprime))
      + 1.274027 * Math.sin(degToRad(2 * D - Mprime))
      + 0.658314 * Math.sin(degToRad(2 * D))
      + 0.213618 * Math.sin(degToRad(2 * Mprime))
      - 0.185116 * Math.sin(degToRad(M))
      - 0.114332 * Math.sin(degToRad(2 * F))
      + 0.058793 * Math.sin(degToRad(2 * D - 2 * Mprime))
      + 0.057432 * Math.sin(degToRad(2 * D - M - Mprime))
      + 0.053322 * Math.sin(degToRad(2 * D + Mprime))
      + 0.045874 * Math.sin(degToRad(2 * D - M))
      + 0.041024 * Math.sin(degToRad(Mprime - M))
      - 0.034722 * Math.sin(degToRad(D))
      - 0.030771 * Math.sin(degToRad(Mprime + M))
      + 0.015327 * Math.sin(degToRad(2 * D - 2 * F))
      - 0.012528 * Math.sin(degToRad(2 * Mprime + M))
      - 0.010980 * Math.sin(degToRad(2 * D + Mprime - M));
    return norm360(l);
  };

  const l0 = calcAt(0);
  const l1 = calcAt(0.05);
  let speed = (l1 - l0) / 0.05;
  if (speed > 180) speed -= 360 / 0.05;
  if (speed < -180) speed += 360 / 0.05;

  return { longitude: l0, speed };
}

// Calculate Astronomical Positions of Planets
export function calculatePlanetaryPositions(
  julianDay: number, 
  ayanamsa: number, 
  lagnaRashiId: number,
  nodeType: 'True' | 'Mean' = 'True'
): PlanetPosition[] {
  const cacheKey = `${julianDay.toFixed(5)}_${ayanamsa.toFixed(4)}_${lagnaRashiId}_${nodeType}`;
  if (planetaryCache.has(cacheKey)) {
    return planetaryCache.get(cacheKey)!;
  }
  const d = julianDay - 2451545.0; // Days from epoch J2000
  const T = d / 36525.0;

  // High Precision Ephemeris (Canonical VSOP87 & ELP2000-82 for Sun & Moon)
  const sunCanonical0 = calculateCanonicalSun(julianDay);
  const sunCanonical1 = calculateCanonicalSun(julianDay + 0.05);
  let sunSpeed = (sunCanonical1.apparentLong - sunCanonical0.apparentLong) / 0.05;
  if (sunSpeed > 180) sunSpeed -= 360 / 0.05;
  if (sunSpeed < -180) sunSpeed += 360 / 0.05;

  const moonCanonical0 = calculateCanonicalMoon(julianDay);
  const moonCanonical1 = calculateCanonicalMoon(julianDay + 0.05);
  let moonSpeed = (moonCanonical1.apparentLong - moonCanonical0.apparentLong) / 0.05;
  if (moonSpeed > 180) moonSpeed -= 360 / 0.05;
  if (moonSpeed < -180) moonSpeed += 360 / 0.05;

  const sunInfo = { longitude: sunCanonical0.apparentLong, speed: sunSpeed };
  const moonInfo = { longitude: moonCanonical0.apparentLong, speed: moonSpeed };
  const marsInfo = calculateGeocentricPlanet('mars', d);
  const mercuryInfo = calculateGeocentricPlanet('mercury', d);
  const jupiterInfo = calculateGeocentricPlanet('jupiter', d);
  const venusInfo = calculateGeocentricPlanet('venus', d);
  const saturnInfo = calculateGeocentricPlanet('saturn', d);

  // Lunar Node (Rahu/Ketu)
  const D_node = norm360(297.8501921 + 445267.11140 * T);
  const M_node = norm360(357.5291092 + 35999.05029 * T);
  const Mprime_node = norm360(134.9633964 + 477198.86750 * T);
  const F_node = norm360(93.2720950 + 483202.01752 * T);

  const meanNodeLong = norm360(125.04452 - 1934.136261 * T + 0.0020708 * T * T);
  const trueNodeLong = norm360(
    meanNodeLong
      - 1.4979 * Math.sin(degToRad(2 * (D_node - F_node)))
      - 0.1500 * Math.sin(degToRad(M_node))
      + 0.1226 * Math.sin(degToRad(2 * D_node))
      + 0.1176 * Math.sin(degToRad(2 * Mprime_node))
  );

  const rahuLong = nodeType === 'True' ? trueNodeLong : meanNodeLong;
  const ketuLong = (rahuLong + 180) % 360;

  const rawPlanets: Array<{
    name: PlanetName;
    englishName: string;
    symbol: string;
    long: number;
    speed: number;
    isRetrograde: boolean;
  }> = [
    { name: 'सूर्य', englishName: 'Sun', symbol: '☉', long: sunInfo.longitude, speed: sunInfo.speed, isRetrograde: false },
    { name: 'चन्द्र', englishName: 'Moon', symbol: '☽', long: moonInfo.longitude, speed: moonInfo.speed, isRetrograde: false },
    { name: 'मंगल', englishName: 'Mars', symbol: '♂', long: marsInfo.longitude, speed: marsInfo.speed, isRetrograde: marsInfo.isRetrograde },
    { name: 'बुध', englishName: 'Mercury', symbol: '☿', long: mercuryInfo.longitude, speed: mercuryInfo.speed, isRetrograde: mercuryInfo.isRetrograde },
    { name: 'गुरु', englishName: 'Jupiter', symbol: '♃', long: jupiterInfo.longitude, speed: jupiterInfo.speed, isRetrograde: jupiterInfo.isRetrograde },
    { name: 'शुक्र', englishName: 'Venus', symbol: '♀', long: venusInfo.longitude, speed: venusInfo.speed, isRetrograde: venusInfo.isRetrograde },
    { name: 'शनि', englishName: 'Saturn', symbol: '♄', long: saturnInfo.longitude, speed: saturnInfo.speed, isRetrograde: saturnInfo.isRetrograde },
    { name: 'राहु', englishName: 'Rahu', symbol: '☊', long: rahuLong, speed: -0.0529, isRetrograde: true },
    { name: 'केतु', englishName: 'Ketu', symbol: '☋', long: ketuLong, speed: -0.0529, isRetrograde: true },
  ];

  const result = rawPlanets.map((p, idx) => {
    // Sidereal Conversion
    let siderealLong = ((p.long - ayanamsa) % 360 + 360) % 360;
    if (isNaN(siderealLong)) siderealLong = 0;
    const rashiId = ((Math.floor(siderealLong / 30) % 12) + 12) % 12 + 1;
    const degree = ((siderealLong % 30) + 30) % 30;
    const minutes = Math.floor((degree - Math.floor(degree)) * 60);
    const seconds = Math.round((((degree - Math.floor(degree)) * 60) - minutes) * 60);

    const rashi = RASHI_DATA[rashiId - 1] || RASHI_DATA[0];

    // Nakshatra and Pada
    const nakshatraIdx = Math.min(26, Math.max(0, Math.floor(siderealLong / (360 / 27))));
    const nakshatra = NAKSHATRA_DATA[nakshatraIdx] || NAKSHATRA_DATA[0];
    const nakshatraDeg = siderealLong % (360 / 27);
    const pada = Math.floor(nakshatraDeg / (360 / 108)) + 1;

    // Bhava (House) calculation relative to Lagna
    let bhava = ((rashiId - lagnaRashiId + 12) % 12) + 1;

    // Combustion (अस्त) - Sun proximity
    let isCombust = false;
    if (p.name !== 'सूर्य' && p.name !== 'राहु' && p.name !== 'केतु') {
      const sunSidereal = (sunInfo.longitude - ayanamsa + 360) % 360;
      const diff = Math.min(Math.abs(siderealLong - sunSidereal), 360 - Math.abs(siderealLong - sunSidereal));
      if (p.name === 'चन्द्र' && diff < 12) isCombust = true;
      if (p.name === 'मंगल' && diff < 17) isCombust = true;
      if (p.name === 'बुध' && diff < 14) isCombust = true;
      if (p.name === 'गुरु' && diff < 11) isCombust = true;
      if (p.name === 'शुक्र' && diff < 10) isCombust = true;
      if (p.name === 'शनि' && diff < 15) isCombust = true;
    }

    // Dignity
    let dignity: PlanetPosition['dignity'] = 'समराशि';
    if (p.name === 'सूर्य') {
      if (rashiId === 1) dignity = 'उच्च'; // Aries exaltation
      else if (rashiId === 7) dignity = 'नीच'; // Libra debilitation
      else if (rashiId === 5) dignity = 'स्वक्षेत्र'; // Leo
    } else if (p.name === 'चन्द्र') {
      if (rashiId === 2) dignity = 'उच्च'; // Taurus
      else if (rashiId === 8) dignity = 'नीच'; // Scorpio
      else if (rashiId === 4) dignity = 'स्वक्षेत्र'; // Cancer
    } else if (p.name === 'मंगल') {
      if (rashiId === 10) dignity = 'उच्च'; // Capricorn
      else if (rashiId === 4) dignity = 'नीच'; // Cancer
      else if (rashiId === 1 || rashiId === 8) dignity = 'स्वक्षेत्र';
    } else if (p.name === 'बुध') {
      if (rashiId === 6) dignity = 'उच्च'; // Virgo
      else if (rashiId === 12) dignity = 'नीच'; // Pisces
      else if (rashiId === 3) dignity = 'स्वक्षेत्र';
    } else if (p.name === 'गुरु') {
      if (rashiId === 4) dignity = 'उच्च'; // Cancer
      else if (rashiId === 10) dignity = 'नीच'; // Capricorn
      else if (rashiId === 9 || rashiId === 12) dignity = 'स्वक्षेत्र';
    } else if (p.name === 'शुक्र') {
      if (rashiId === 12) dignity = 'उच्च'; // Pisces
      else if (rashiId === 6) dignity = 'नीच'; // Virgo
      else if (rashiId === 2 || rashiId === 7) dignity = 'स्वक्षेत्र';
    } else if (p.name === 'शनि') {
      if (rashiId === 7) dignity = 'उच्च'; // Libra
      else if (rashiId === 1) dignity = 'नीच'; // Aries
      else if (rashiId === 10 || rashiId === 11) dignity = 'स्वक्षेत्र';
    } else if (p.name === 'राहु') {
      if (rashiId === 3 || rashiId === 2) dignity = 'उच्च';
      else if (rashiId === 9 || rashiId === 8) dignity = 'नीच';
    } else if (p.name === 'केतु') {
      if (rashiId === 9 || rashiId === 8) dignity = 'उच्च';
      else if (rashiId === 3 || rashiId === 2) dignity = 'नीच';
    }

    return {
      id: `planet_${idx + 1}`,
      name: p.name,
      englishName: p.englishName,
      symbol: p.symbol,
      longitude: siderealLong,
      degree,
      minutes,
      seconds,
      formattedDegree: formatDegreeMinSec(degree),
      rashiId,
      rashiName: rashi.name,
      nakshatraId: nakshatra.id,
      nakshatraName: nakshatra.name,
      nakshatraLord: nakshatra.lord,
      pada,
      bhava,
      speed: p.speed,
      isRetrograde: p.isRetrograde,
      isCombust,
      dignity,
    };
  });

  if (planetaryCache.size > 200) planetaryCache.clear();
  planetaryCache.set(cacheKey, result);
  return result;
}

// Generate Divisional Charts D1 to D60
export function generateDivisionalChart(
  type: DivisionalChartType,
  lagnaInfo: LagnaInfo,
  planets: PlanetPosition[]
): DivisionalChart {
  return generateDivisionalChartEx(type, lagnaInfo, planets);
}
