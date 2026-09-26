import { 
  getJulianDay, 
  calculateLagna, 
  calculatePlanetaryPositions 
} from './astroCalculations';
import { calculatePanchanga } from './panchangaEngine';
import { calculateVimshottariDasha } from './dashaEngine';
import { calculateGocharAndSadeSati } from './gocharEngine';
import { evaluateYogas } from './yogaEngine';
import { 
  LagnaInfo, 
  PlanetPosition, 
  PanchangaData, 
  VimshottariDashaResult, 
  YogaRuleResult 
} from '../types/astrology';

/**
 * Generic In-Memory LRU Calculation Cache with hit/miss analytics
 */
export class CalculationCache<TValue> {
  private cache = new Map<string, TValue>();
  private maxEntries: number;
  private hits = 0;
  private misses = 0;

  constructor(maxEntries: number = 500) {
    this.maxEntries = maxEntries;
  }

  get(key: string): TValue | undefined {
    if (!this.cache.has(key)) {
      this.misses++;
      return undefined;
    }
    this.hits++;
    // Move key to end for LRU refresh
    const val = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  set(key: string, value: TValue): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
      // Evict oldest entry (first key in map iterator)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  size(): number {
    return this.cache.size;
  }

  getStats(): { hits: number; misses: number; size: number; hitRate: string } {
    const total = this.hits + this.misses;
    const rate = total > 0 ? ((this.hits / total) * 100).toFixed(1) + '%' : '0%';
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      hitRate: rate,
    };
  }
}

/**
 * Higher-Order Function to memoize any synchronous function
 */
export function memoizeCalculation<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => TResult,
  keyGenerator: (...args: TArgs) => string,
  maxEntries: number = 300
): ((...args: TArgs) => TResult) & { cache: CalculationCache<TResult>; clearCache: () => void } {
  const cache = new CalculationCache<TResult>(maxEntries);

  const memoized = (...args: TArgs): TResult => {
    const key = keyGenerator(...args);
    const cached = cache.get(key);
    if (cached !== undefined) {
      return cached;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };

  memoized.cache = cache;
  memoized.clearCache = () => cache.clear();

  return memoized;
}

// ----------------------------------------------------------------------
// Dedicated Caches & Memoized Exports for Key Astrology Operations
// ----------------------------------------------------------------------

export const julianDayCache = new CalculationCache<number>(500);
export const lagnaCache = new CalculationCache<LagnaInfo>(300);
export const planetaryPositionsCache = new CalculationCache<PlanetPosition[]>(300);
export const panchangaCache = new CalculationCache<PanchangaData>(300);
export const dashaCache = new CalculationCache<VimshottariDashaResult>(200);
export const gocharCache = new CalculationCache<any>(200);
export const yogaCache = new CalculationCache<YogaRuleResult[]>(200);

/**
 * Cached version of getJulianDay
 */
export const cachedGetJulianDay = memoizeCalculation(
  getJulianDay,
  (dateAD: string, timeStr: string, timeZone: number) => `${dateAD}_${timeStr}_${timeZone}`,
  500
);

/**
 * Cached version of calculateLagna
 */
export const cachedCalculateLagna = memoizeCalculation(
  calculateLagna,
  (julianDay: number, latitude: number, longitude: number, ayanamsa: number) =>
    `${julianDay.toFixed(5)}_${latitude.toFixed(4)}_${longitude.toFixed(4)}_${ayanamsa.toFixed(4)}`,
  300
);

/**
 * Cached version of calculatePlanetaryPositions
 */
export const cachedCalculatePlanetaryPositions = memoizeCalculation(
  calculatePlanetaryPositions,
  (julianDay: number, ayanamsa: number, lagnaRashiId: number, nodeType: 'True' | 'Mean' = 'True') =>
    `${julianDay.toFixed(5)}_${ayanamsa.toFixed(4)}_${lagnaRashiId}_${nodeType}`,
  300
);

/**
 * Cached version of calculatePanchanga
 */
export const cachedCalculatePanchanga = memoizeCalculation(
  calculatePanchanga,
  (dateAD: string, timeStr: string = '06:00', latitude: number = 27.7172, longitude: number = 85.3240, timeZone: number = 5.75) =>
    `${dateAD}_${timeStr}_${latitude.toFixed(4)}_${longitude.toFixed(4)}_${timeZone}`,
  300
);

/**
 * Cached version of calculateVimshottariDasha
 */
export const cachedCalculateVimshottariDasha = memoizeCalculation(
  calculateVimshottariDasha,
  (moonPosition: PlanetPosition, birthDateAD: string) =>
    `${moonPosition.rashiId}_${moonPosition.longitude.toFixed(4)}_${birthDateAD}`,
  200
);

/**
 * Cached version of calculateGocharAndSadeSati
 */
export const cachedCalculateGocharAndSadeSati = memoizeCalculation(
  calculateGocharAndSadeSati,
  (birthMoon: PlanetPosition, birthPlanets: PlanetPosition[], targetDateAD: string) =>
    `${birthMoon.rashiId}_${birthMoon.longitude.toFixed(4)}_${targetDateAD}`,
  200
);

/**
 * Cached version of evaluateYogas
 */
export const cachedEvaluateYogas = memoizeCalculation(
  evaluateYogas,
  (lagna: LagnaInfo, planets: PlanetPosition[]) =>
    `${lagna.rashiId}_${lagna.degree.toFixed(2)}_${planets.map((p) => `${p.name}:${p.rashiId}:${p.degree.toFixed(1)}`).join(',')}`,
  200
);

/**
 * Clears all in-memory astrology calculation caches.
 * Call this when ayanamsa settings or global calculation options change.
 */
export function clearAllAstrologyCaches(): void {
  julianDayCache.clear();
  lagnaCache.clear();
  planetaryPositionsCache.clear();
  panchangaCache.clear();
  dashaCache.clear();
  gocharCache.clear();
  yogaCache.clear();

  cachedGetJulianDay.clearCache();
  cachedCalculateLagna.clearCache();
  cachedCalculatePlanetaryPositions.clearCache();
  cachedCalculatePanchanga.clearCache();
  cachedCalculateVimshottariDasha.clearCache();
  cachedCalculateGocharAndSadeSati.clearCache();
  cachedEvaluateYogas.clearCache();
}
