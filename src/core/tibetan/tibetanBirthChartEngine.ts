/**
 * Tibetan Birth Chart Engine (तिब्बती जन्म कुण्डली गणना केन्द्र)
 * Integrated Master Engine for Neema Jyotish
 * Brihat Jyotish Professional ERP
 */

import { BirthDetails } from '../../types/astrology';
import {
  TibetanYearInfo,
  TibetanLifeForces,
  TibetanMewa,
  TibetanParkha,
  TibetanPredictionItem,
  TibetanAuditRecord
} from '../../types/tibetanAstrology';
import { calculateTibetanYear } from './tibetanCalendarEngine';
import { calculateTibetanLifeForces } from './lifeForceEngine';
import { calculateNatalMewa } from './mewaEngine';
import { calculateNatalParkha } from './parkhaEngine';
import { generateTibetanPredictions } from './tibetanPredictionEngine';

export interface TibetanBirthChartData {
  profile: BirthDetails;
  yearInfo: TibetanYearInfo;
  currentYearInfo: TibetanYearInfo;
  lifeForces: TibetanLifeForces;
  mewa: TibetanMewa;
  parkha: TibetanParkha;
  predictions: TibetanPredictionItem[];
  auditRecord: TibetanAuditRecord;
}

export function computeTibetanBirthChart(profile: BirthDetails): TibetanBirthChartData {
  // 1. Calculate Tibetan Year for Birth
  const birthYearInfo = calculateTibetanYear(profile.dateAD);

  // 2. Calculate current Tibetan year (as of today)
  const todayStr = new Date().toISOString().split('T')[0];
  const currentYearInfo = calculateTibetanYear(todayStr);

  // 3. Compute 5 Life Forces (Sog, Lu, Wang, Lungta, La)
  const lifeForces = calculateTibetanLifeForces(birthYearInfo.element, birthYearInfo.animal);

  // 4. Compute Natal Mewa
  const mewa = calculateNatalMewa(birthYearInfo.tibetanYear);

  // 5. Compute Natal Parkha based on current age and gender
  const parkha = calculateNatalParkha(
    birthYearInfo.tibetanYear,
    currentYearInfo.tibetanYear,
    profile.gender || 'male'
  );

  // 6. Generate 20-Domain Predictions
  const predictions = generateTibetanPredictions(birthYearInfo, lifeForces, mewa, parkha);

  // 7. Audit Record
  const auditRecord: TibetanAuditRecord = {
    calculationTimestamp: new Date().toISOString(),
    inputHash: `TIB-${profile.id || profile.name}-${profile.dateAD}-${profile.time}`,
    profileId: profile.id,
    clientName: profile.name,
    birthDateAD: profile.dateAD,
    birthTime: profile.time,
    latitude: profile.location?.latitude ?? 27.7172,
    longitude: profile.location?.longitude ?? 85.324,
    rabjungCycle: birthYearInfo.rabjungNumber,
    computedYearAnimal: birthYearInfo.animal.nameNepali,
    computedYearElement: birthYearInfo.element.nameNepali,
    computedNatalMewa: mewa.number,
    computedNatalParkha: parkha.nameNepali,
    engineVersion: '2.4.0-Canonical',
    sourceVersion: 'Vaidurya-Karpo-Phugpa-1687',
    ruleCountApplied: predictions.length
  };

  return {
    profile,
    yearInfo: birthYearInfo,
    currentYearInfo,
    lifeForces,
    mewa,
    parkha,
    predictions,
    auditRecord
  };
}
