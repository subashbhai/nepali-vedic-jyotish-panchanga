import { BirthDetails, PanchangaData, PlanetPosition, LagnaInfo, VimshottariDashaResult, GocharTransitResult } from '../types/astrology';
import { DetailedYogaResult, DetailedDoshaResult, PlanetaryRelationshipGraph, SharedDatabaseSchema } from '../types/yogaDoshaTypes';
import { evaluateAllYogasAndDoshas } from './yogaEngine';

export interface MultiPlatformEngineResponse {
  engineVersion: string;
  calculatedAtISO: string;
  platformSource: 'Web Browser' | 'Desktop Electron/Tauri' | 'Mobile React Native / Android';
  birthDetails: BirthDetails;
  results: {
    yogas: DetailedYogaResult[];
    doshas: DetailedDoshaResult[];
    relationshipGraph: PlanetaryRelationshipGraph;
    summaryNepali: {
      totalYogasCount: number;
      activeYogasCount: number;
      totalDoshasCount: number;
      activeDoshasCount: number;
      description: string;
    };
  };
}

/**
 * Shared Core Astrology Engine Executor for Web, Desktop, and Mobile.
 * Guarantees 100% mathematical and rule-based consistency across all platforms.
 */
export function executeSharedAstrologyCore(
  birthDetails: BirthDetails,
  lagna: LagnaInfo,
  planets: PlanetPosition[],
  dashaResult?: VimshottariDashaResult,
  gocharResult?: GocharTransitResult,
  platformSource: 'Web Browser' | 'Desktop Electron/Tauri' | 'Mobile React Native / Android' = 'Web Browser'
): MultiPlatformEngineResponse {
  const engineResult = evaluateAllYogasAndDoshas(lagna, planets, dashaResult, gocharResult);

  return {
    engineVersion: '6.0.0-PRO-NEP',
    calculatedAtISO: new Date().toISOString(),
    platformSource,
    birthDetails,
    results: {
      yogas: engineResult.yogas,
      doshas: engineResult.doshas,
      relationshipGraph: engineResult.relationshipGraph,
      summaryNepali: engineResult.summaryNepali,
    },
  };
}

export const SHARED_DATABASE_DEFINITION: SharedDatabaseSchema = {
  version: '1.0.0-SCHEMA',
  tableNames: {
    clients: 'clients',
    birthDetails: 'birth_details',
    panchangaLogs: 'panchanga_logs',
    kundaliRecords: 'kundali_records',
    yogasDetected: 'yogas_detected',
    doshasDetected: 'doshas_detected',
    dashaHistories: 'dasha_histories',
    ruleRegistry: 'rule_registry',
    consultationReports: 'consultation_reports',
  },
};
