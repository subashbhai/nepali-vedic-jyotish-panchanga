import { LagnaInfo, PlanetPosition, PanchangaData, VimshottariDashaResult, YogaResult, AyanamsaSystem } from '../types/astrology';
import { getJulianDay, getAyanamsa, calculateLagna, calculatePlanetaryPositions, clearPlanetaryAndLagnaCaches } from './astroCalculations';
import { calculatePanchanga } from './panchangaEngine';
import { calculateVimshottariDasha } from './dashaEngine';
import { evaluateYogas } from './yogaEngine';

export interface FullAstroCalculationResult {
  julianDay: number;
  ayanamsa: number;
  lagna: LagnaInfo;
  planets: PlanetPosition[];
  moon: PlanetPosition;
  panchanga: PanchangaData;
  dasha: VimshottariDashaResult;
  yogas: YogaResult[];
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
}

const MAX_CACHE_SIZE = 200;
const calculationCache = new Map<string, FullAstroCalculationResult>();

let cacheHits = 0;
let cacheMisses = 0;

/**
 * Creates a unique, deterministic cache key based on birth date, time, location coordinates, timezone, and ayanamsa system.
 */
export function createAstroCacheKey(
  dateAD: string,
  time: string,
  latitude: number,
  longitude: number,
  timeZone: number,
  ayanamsaSystem: string = 'Chitrapaksha'
): string {
  const safeDate = dateAD || '1995-05-15';
  const safeTime = time || '08:30';
  const safeLat = typeof latitude === 'number' && !isNaN(latitude) ? latitude.toFixed(4) : '27.7172';
  const safeLng = typeof longitude === 'number' && !isNaN(longitude) ? longitude.toFixed(4) : '85.3240';
  const safeTz = typeof timeZone === 'number' && !isNaN(timeZone) ? timeZone : 5.75;
  const safeAyanSystem = ayanamsaSystem === 'Lahiri' ? 'Chitrapaksha' : (ayanamsaSystem || 'Chitrapaksha');

  return `astro_v1:${safeDate}_${safeTime}_lat${safeLat}_lng${safeLng}_tz${safeTz}_ayan${safeAyanSystem}`;
}

/**
 * Retrieves cached astronomical computation or calculates and stores it if missing.
 */
export function getCachedAstroCalculation(
  dateAD: string,
  time: string,
  latitude: number,
  longitude: number,
  timeZone: number,
  ayanamsaSystem: AyanamsaSystem | string = 'Chitrapaksha'
): FullAstroCalculationResult {
  const cacheKey = createAstroCacheKey(dateAD, time, latitude, longitude, timeZone, ayanamsaSystem);

  if (calculationCache.has(cacheKey)) {
    cacheHits++;
    return calculationCache.get(cacheKey)!;
  }

  cacheMisses++;

  const safeDate = dateAD || '1995-05-15';
  const safeTime = time || '08:30';
  const safeLat = typeof latitude === 'number' && !isNaN(latitude) ? latitude : 27.7172;
  const safeLng = typeof longitude === 'number' && !isNaN(longitude) ? longitude : 85.3240;
  const safeTz = typeof timeZone === 'number' && !isNaN(timeZone) ? timeZone : 5.75;
  const safeAyanSystem = (ayanamsaSystem as AyanamsaSystem) || 'Chitrapaksha';

  // Compute astronomical details
  const jd = getJulianDay(safeDate, safeTime, safeTz);
  const ayan = getAyanamsa(jd, safeAyanSystem);
  const lg = calculateLagna(jd, safeLat, safeLng, ayan);
  const pl = calculatePlanetaryPositions(jd, ayan, lg.rashiId);
  const mn = pl.find((p) => p.name === 'चन्द्र') || pl[0];
  const dsh = calculateVimshottariDasha(mn, safeDate, safeTime);
  const ygs = evaluateYogas(lg, pl);
  const pan = calculatePanchanga(safeDate, safeTime, safeLat, safeLng, safeTz);

  const result: FullAstroCalculationResult = {
    julianDay: jd,
    ayanamsa: ayan,
    lagna: lg,
    planets: pl,
    moon: mn,
    panchanga: pan,
    dasha: dsh,
    yogas: ygs,
  };

  // Prevent memory leaks via LRU evictions
  if (calculationCache.size >= MAX_CACHE_SIZE) {
    const firstKey = calculationCache.keys().next().value;
    if (firstKey) calculationCache.delete(firstKey);
  }

  calculationCache.set(cacheKey, result);
  return result;
}

/**
 * Returns current cache statistics for monitoring and debugging performance.
 */
export function getAstroCacheStats(): CacheStats {
  return {
    hits: cacheHits,
    misses: cacheMisses,
    size: calculationCache.size,
    maxSize: MAX_CACHE_SIZE,
  };
}

/**
 * Clears stored calculation cache entries.
 */
export function clearAstroCache(): void {
  calculationCache.clear();
  clearPlanetaryAndLagnaCaches();
  cacheHits = 0;
  cacheMisses = 0;
}

/**
 * Direct cache getter function by key.
 */
export function get(key: string): FullAstroCalculationResult | undefined {
  if (calculationCache.has(key)) {
    cacheHits++;
    return calculationCache.get(key);
  }
  return undefined;
}

/**
 * Direct cache setter function by key and data.
 */
export function set(key: string, data: FullAstroCalculationResult): void {
  if (calculationCache.size >= MAX_CACHE_SIZE) {
    const firstKey = calculationCache.keys().next().value;
    if (firstKey) calculationCache.delete(firstKey);
  }
  calculationCache.set(key, data);
}

/**
 * Object interface for get and set functions.
 */
export const astroCache = {
  get,
  set,
  has: (key: string) => calculationCache.has(key),
  clear: clearAstroCache,
  stats: getAstroCacheStats,
};
