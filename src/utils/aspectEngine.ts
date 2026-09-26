import {
  PlanetName,
  RashiName,
  PlanetPosition
} from '../types/astrology';
import { toDevanagariNumerals } from './nepaliCalendar';

export interface AspectRule {
  planetName: PlanetName;
  aspects: Array<{
    relativeHouseDistance: number; // e.g. 7 for 7th house, 4 for 4th house, etc.
    drishtiTypeNepali: string; // e.g. 'पूर्ण दृष्टि (७औँ)'
    shortTypeNepali: string; // e.g. '७औँ'
    strengthPercentage: number; // 100%
  }>;
}

// Vedic Graha Drishti Rules Repository
export const VEDIC_ASPECT_RULES: Record<string, AspectRule> = {
  'सूर्य': {
    planetName: 'सूर्य',
    aspects: [
      { relativeHouseDistance: 7, drishtiTypeNepali: 'पूर्ण दृष्टि (७औँ भाव)', shortTypeNepali: '७औँ', strengthPercentage: 100 }
    ]
  },
  'चन्द्र': {
    planetName: 'चन्द्र',
    aspects: [
      { relativeHouseDistance: 7, drishtiTypeNepali: 'पूर्ण दृष्टि (७औँ भाव)', shortTypeNepali: '७औँ', strengthPercentage: 100 }
    ]
  },
  'मंगल': {
    planetName: 'मंगल',
    aspects: [
      { relativeHouseDistance: 4, drishtiTypeNepali: 'विशेष दृष्टि (४औँ भाव)', shortTypeNepali: '४औँ', strengthPercentage: 100 },
      { relativeHouseDistance: 7, drishtiTypeNepali: 'पूर्ण दृष्टि (७औँ भाव)', shortTypeNepali: '७औँ', strengthPercentage: 100 },
      { relativeHouseDistance: 8, drishtiTypeNepali: 'विशेष दृष्टि (८औँ भाव)', shortTypeNepali: '८औँ', strengthPercentage: 100 }
    ]
  },
  'बुध': {
    planetName: 'बुध',
    aspects: [
      { relativeHouseDistance: 7, drishtiTypeNepali: 'पूर्ण दृष्टि (७औँ भाव)', shortTypeNepali: '७औँ', strengthPercentage: 100 }
    ]
  },
  'गुरु': {
    planetName: 'गुरु',
    aspects: [
      { relativeHouseDistance: 5, drishtiTypeNepali: 'विशेष दृष्टि (५औँ भाव)', shortTypeNepali: '५औँ', strengthPercentage: 100 },
      { relativeHouseDistance: 7, drishtiTypeNepali: 'पूर्ण दृष्टि (७औँ भाव)', shortTypeNepali: '७औँ', strengthPercentage: 100 },
      { relativeHouseDistance: 9, drishtiTypeNepali: 'विशेष दृष्टि (९औँ भाव)', shortTypeNepali: '९औँ', strengthPercentage: 100 }
    ]
  },
  'शुक्र': {
    planetName: 'शुक्र',
    aspects: [
      { relativeHouseDistance: 7, drishtiTypeNepali: 'पूर्ण दृष्टि (७औँ भाव)', shortTypeNepali: '७औँ', strengthPercentage: 100 }
    ]
  },
  'शनि': {
    planetName: 'शनि',
    aspects: [
      { relativeHouseDistance: 3, drishtiTypeNepali: 'विशेष दृष्टि (३औँ भाव)', shortTypeNepali: '३औँ', strengthPercentage: 100 },
      { relativeHouseDistance: 7, drishtiTypeNepali: 'पूर्ण दृष्टि (७औँ भाव)', shortTypeNepali: '७औँ', strengthPercentage: 100 },
      { relativeHouseDistance: 10, drishtiTypeNepali: 'विशेष दृष्टि (१०औँ भाव)', shortTypeNepali: '१०औँ', strengthPercentage: 100 }
    ]
  },
  'राहु': {
    planetName: 'राहु',
    aspects: [
      { relativeHouseDistance: 5, drishtiTypeNepali: 'विशेष दृष्टि (५औँ भाव)', shortTypeNepali: '५औँ', strengthPercentage: 100 },
      { relativeHouseDistance: 7, drishtiTypeNepali: 'पूर्ण दृष्टि (७औँ भाव)', shortTypeNepali: '७औँ', strengthPercentage: 100 },
      { relativeHouseDistance: 9, drishtiTypeNepali: 'विशेष दृष्टि (९औँ भाव)', shortTypeNepali: '९औँ', strengthPercentage: 100 }
    ]
  },
  'केतु': {
    planetName: 'केतु',
    aspects: [
      { relativeHouseDistance: 5, drishtiTypeNepali: 'विशेष दृष्टि (५औँ भाव)', shortTypeNepali: '५औँ', strengthPercentage: 100 },
      { relativeHouseDistance: 7, drishtiTypeNepali: 'पूर्ण दृष्टि (७औँ भाव)', shortTypeNepali: '७औँ', strengthPercentage: 100 },
      { relativeHouseDistance: 9, drishtiTypeNepali: 'विशेष दृष्टि (९औँ भाव)', shortTypeNepali: '९औँ', strengthPercentage: 100 }
    ]
  }
};

export interface CalculatedAspectItem {
  planetName: PlanetName;
  sourceHouseNumber: number; // 1 to 12
  targetHouseNumber: number; // 1 to 12
  targetRashiName?: RashiName;
  drishtiTypeNepali: string;
  shortTypeNepali: string;
  strengthPercentage: number;
  descriptionNepali: string;
}

/**
 * Format degree and minute to high precision Nepali text without float roundoff errors
 */
export function formatPlanetDegreesMinutes(p: { degree?: number; minutes?: number; seconds?: number; longitude?: number; formattedDegree?: string }): string {
  let deg = p.degree;
  if (deg === undefined && p.longitude !== undefined) {
    deg = p.longitude % 30;
  }
  if (deg === undefined) {
    if (p.formattedDegree) return p.formattedDegree;
    return '०° ०′';
  }

  // Handle boundary clamp
  deg = Math.max(0, Math.min(29.9999, deg));

  let degInt = Math.floor(deg);
  let minInt = p.minutes !== undefined ? p.minutes : Math.floor((deg - degInt) * 60 + 0.5);

  if (minInt >= 60) {
    degInt = (degInt + 1) % 30;
    minInt = 0;
  }

  return `${toDevanagariNumerals(degInt)}° ${toDevanagariNumerals(minInt)}′`;
}

/**
 * Get retrograde (व) and combust (अ) status suffix
 */
export function getPlanetStatusSuffix(p: { isRetrograde?: boolean; isCombust?: boolean }): string {
  let suffix = '';
  if (p.isRetrograde) suffix += ' (व)';
  if (p.isCombust) suffix += ' (अ)';
  return suffix;
}

/**
 * Get full text description for planet state (वक्री/मार्गी, उदय/अस्त)
 */
export function getPlanetStateDescriptionNepali(p: { isRetrograde?: boolean; isCombust?: boolean; dignity?: string }): string {
  const parts: string[] = [];
  if (p.isRetrograde) {
    parts.push('वक्री (Retrograde)');
  } else {
    parts.push('मार्गी (Direct)');
  }

  if (p.isCombust) {
    parts.push('अस्त (Combust)');
  } else {
    parts.push('उदय (Radiant)');
  }

  if (p.dignity) {
    parts.push(p.dignity);
  }

  return parts.join(' • ');
}

/**
 * Calculate aspects for a single planet given its current house position in the current chart
 */
export function calculateSinglePlanetAspects(
  planet: PlanetPosition,
  sourceHouseNumber: number,
  housesList?: Array<{ houseNumber: number; rashiName?: RashiName }>
): CalculatedAspectItem[] {
  const rule = VEDIC_ASPECT_RULES[planet.name] || {
    planetName: planet.name,
    aspects: [{ relativeHouseDistance: 7, drishtiTypeNepali: 'पूर्ण दृष्टि (७औँ भाव)', shortTypeNepali: '७औँ', strengthPercentage: 100 }]
  };

  return rule.aspects.map((asp) => {
    // 1-based house index math: Target = (source - 1 + distance - 1) % 12 + 1
    const targetHouse = ((sourceHouseNumber - 1 + asp.relativeHouseDistance - 1) % 12) + 1;
    const targetHouseData = housesList?.find((h) => h.houseNumber === targetHouse);
    const rashiName = targetHouseData?.rashiName || planet.rashiName;

    return {
      planetName: planet.name,
      sourceHouseNumber,
      targetHouseNumber: targetHouse,
      targetRashiName: rashiName,
      drishtiTypeNepali: asp.drishtiTypeNepali,
      shortTypeNepali: asp.shortTypeNepali,
      strengthPercentage: asp.strengthPercentage,
      descriptionNepali: `${planet.name} ग्रहले भाव ${toDevanagariNumerals(sourceHouseNumber)} बाट भाव ${toDevanagariNumerals(targetHouse)} मा ${asp.drishtiTypeNepali} राखेका छन्।`,
    };
  });
}

/**
 * Coordinate geometry mapping for 12 Houses in 400x400 North Indian Diamond Chart
 */
export interface HouseGeoInfo {
  houseNumber: number;
  polygonPoints: string;
  center: { x: number; y: number };
}

export const NORTH_INDIAN_HOUSE_GEO: Record<number, HouseGeoInfo> = {
  1: { houseNumber: 1, polygonPoints: '200,10 295,105 200,200 105,105', center: { x: 200, y: 105 } },
  2: { houseNumber: 2, polygonPoints: '10,10 200,10 105,105', center: { x: 105, y: 42 } },
  3: { houseNumber: 3, polygonPoints: '10,10 10,200 105,105', center: { x: 42, y: 105 } },
  4: { houseNumber: 4, polygonPoints: '10,200 105,105 200,200 105,295', center: { x: 105, y: 200 } },
  5: { houseNumber: 5, polygonPoints: '10,200 10,390 105,295', center: { x: 42, y: 295 } },
  6: { houseNumber: 6, polygonPoints: '10,390 200,390 105,295', center: { x: 105, y: 358 } },
  7: { houseNumber: 7, polygonPoints: '200,390 105,295 200,200 295,295', center: { x: 200, y: 295 } },
  8: { houseNumber: 8, polygonPoints: '200,390 390,390 295,295', center: { x: 295, y: 358 } },
  9: { houseNumber: 9, polygonPoints: '390,200 390,390 295,295', center: { x: 358, y: 295 } },
  10: { houseNumber: 10, polygonPoints: '390,200 295,295 200,200 295,105', center: { x: 295, y: 200 } },
  11: { houseNumber: 11, polygonPoints: '390,10 390,200 295,105', center: { x: 358, y: 105 } },
  12: { houseNumber: 12, polygonPoints: '200,10 390,10 295,105', center: { x: 295, y: 42 } },
};

export interface ArrowPathInfo {
  pathD: string;
  sourcePoint: { x: number; y: number };
  targetPoint: { x: number; y: number };
  targetHouseNumber: number;
  drishtiTypeNepali: string;
}

/**
 * Calculate smooth curved SVG arrow path from source planet/house to target house
 */
export function calculateAspectArrowPath(
  sourceHouse: number,
  targetHouse: number,
  indexInMultiple: number = 0,
  totalAspects: number = 1,
  sourcePlanetCoords?: { x: number; y: number }
): ArrowPathInfo | null {
  const srcGeo = NORTH_INDIAN_HOUSE_GEO[sourceHouse];
  const tgtGeo = NORTH_INDIAN_HOUSE_GEO[targetHouse];

  if (!srcGeo || !tgtGeo) return null;

  // Use sourcePlanetCoords if provided, otherwise fall back to house center
  const x1 = sourcePlanetCoords ? sourcePlanetCoords.x : srcGeo.center.x;
  const y1 = sourcePlanetCoords ? sourcePlanetCoords.y : srcGeo.center.y;

  // Target is ALWAYS the target house center where aspect is cast
  const x2 = tgtGeo.center.x;
  const y2 = tgtGeo.center.y;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 2) return null;

  const ux = dx / dist;
  const uy = dy / dist;

  // Offset start and end points so arrow starts near source planet and ends cleanly inside target house
  const startOffset = sourcePlanetCoords ? 14 : 20;
  const endOffset = 22;

  const sx = x1 + ux * startOffset;
  const sy = y1 + uy * startOffset;
  const ex = x2 - ux * endOffset;
  const ey = y2 - uy * endOffset;

  // Calculate curve control point
  // Perpendicular vector (-uy, ux)
  const px = -uy;
  const py = ux;

  // Offset curve slightly if multiple aspect arrows exist
  let curveAmount = 0;
  if (totalAspects > 1) {
    if (indexInMultiple === 0) curveAmount = -20;
    else if (indexInMultiple === 1) curveAmount = 8;
    else if (indexInMultiple === 2) curveAmount = 24;
  } else {
    curveAmount = 0;
  }

  const mx = (sx + ex) / 2;
  const my = (sy + ey) / 2;
  const cx = mx + px * curveAmount;
  const cy = my + py * curveAmount;

  const pathD = `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;

  return {
    pathD,
    sourcePoint: { x: sx, y: sy },
    targetPoint: { x: ex, y: ey },
    targetHouseNumber: targetHouse,
    drishtiTypeNepali: `दृष्टि (${toDevanagariNumerals(targetHouse)}औँ भाव)`,
  };
}

/**
 * Generate full Aspect Table Report for all planets in a chart
 */
export interface AspectReportRow {
  planetName: PlanetName;
  residingHouse: number;
  rashiName: RashiName;
  degreeFormatted: string;
  statusSuffix: string;
  stateTextNepali: string;
  aspectedHousesText: string;
  aspectedHousesNumbers: number[];
}

export function generateChartAspectReport(
  housesList: Array<{ houseNumber: number; rashiId?: number; rashiName?: RashiName; planets: PlanetPosition[] }>
): AspectReportRow[] {
  const rows: AspectReportRow[] = [];

  housesList.forEach((house) => {
    house.planets.forEach((planet) => {
      const aspects = calculateSinglePlanetAspects(planet, house.houseNumber, housesList);
      const aspectedNums = aspects.map((a) => a.targetHouseNumber);
      const aspectedTexts = aspects.map((a) => {
        const targetHouseData = housesList.find((h) => h.houseNumber === a.targetHouseNumber);
        const rName = targetHouseData?.rashiName || '';
        return `${toDevanagariNumerals(a.targetHouseNumber)}औँ भाव (${rName})`;
      });

      const degFormatted = formatPlanetDegreesMinutes(planet);
      const statusSuffix = getPlanetStatusSuffix(planet);
      const stateText = getPlanetStateDescriptionNepali(planet);

      rows.push({
        planetName: planet.name,
        residingHouse: house.houseNumber,
        rashiName: planet.rashiName,
        degreeFormatted: degFormatted,
        statusSuffix,
        stateTextNepali: stateText,
        aspectedHousesText: aspectedTexts.join(', '),
        aspectedHousesNumbers: aspectedNums,
      });
    });
  });

  return rows;
}
