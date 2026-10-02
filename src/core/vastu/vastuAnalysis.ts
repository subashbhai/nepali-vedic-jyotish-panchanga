/**
 * Vastu Core — Analysis Module
 * Comprehensive Floor Plan & Placement Evaluation Engine
 * Calculates Vastu Score, Percentage, Element Balance, Dosha Identification, and Remedies.
 */

import { VastuPrimaryDirection, getVastuDirectionByCode } from './vastuDirections';
import { Panchamahabhuta, PANCHAMAHABHUTA_DATA } from './vastuZones';
import { VASTU_ROOM_CATEGORIES, VastuRoomCategory, RoomRating } from './vastuRules';
import { TRADITIONAL_VASTU_REMEDIES, VastuRemedyItem } from './vastuRemedies';

export interface RoomPlacementEntry {
  roomId: string; // e.g. 'entrance', 'kitchen', 'puja_room', etc.
  direction: VastuPrimaryDirection;
  customName?: string;
  floorLevel?: number; // 0 = Ground, 1 = 1st Floor, etc.
}

export interface DetectedDosha {
  roomId: string;
  roomNameNepali: string;
  direction: VastuPrimaryDirection;
  directionNameNepali: string;
  rating: RoomRating;
  ratingLabelNepali: string;
  observationNepali: string;
  traditionalInterpretation: string;
  suggestedRemedies: string[];
}

export interface PositiveVastuPoint {
  roomId: string;
  roomNameNepali: string;
  directionNameNepali: string;
  remarksNepali: string;
}

export interface ElementBalanceScore {
  element: Panchamahabhuta;
  nameEnglish: string;
  scorePercentage: number; // 0 to 100
  statusNepali: 'सन्तुलित' | 'अति सक्रिय' | 'कमजोर / असन्तुलित';
  statusColor: string;
}

export interface VastuAnalysisResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  gradeNepali: string;
  gradeColor: string;
  summaryNepali: string;
  elementBalances: ElementBalanceScore[];
  doshas: DetectedDosha[];
  positivePoints: PositiveVastuPoint[];
  evaluatedRoomsCount: number;
  analyzedAt: string;
}

export function analyzeVastuFloorPlan(placements: RoomPlacementEntry[]): VastuAnalysisResult {
  let earned = 0;
  let possible = 0;

  const doshas: DetectedDosha[] = [];
  const positivePoints: PositiveVastuPoint[] = [];

  // Track elements weight for balance
  const elementEarned: Record<Panchamahabhuta, number> = { जल: 0, अग्नि: 0, पृथ्वी: 0, वायु: 0, आकाश: 0 };
  const elementPossible: Record<Panchamahabhuta, number> = { जल: 0, अग्नि: 0, पृथ्वी: 0, वायु: 0, आकाश: 0 };

  placements.forEach((placement) => {
    const roomCat = VASTU_ROOM_CATEGORIES.find((r) => r.id === placement.roomId);
    if (!roomCat) return;

    const dirInfo = getVastuDirectionByCode(placement.direction);
    const rule = roomCat.directionRules[placement.direction] || {
      direction: placement.direction,
      rating: 'average',
      points: 5,
      remarksNepali: 'सामान्य स्थान',
      traditionalInterpretation: 'परम्परागत मान्यता अनुसार मध्यम फलदायी।',
    };

    const weightedEarned = rule.points * roomCat.weight;
    const weightedPossible = 10 * roomCat.weight;

    earned += weightedEarned;
    possible += weightedPossible;

    // Element attribution
    const elem = dirInfo.element;
    elementEarned[elem] += weightedEarned;
    elementPossible[elem] += weightedPossible;

    // Check for doshas
    if (rule.rating === 'severe' || rule.rating === 'bad') {
      // Find matching remedies
      const specificRemedy = TRADITIONAL_VASTU_REMEDIES.find(
        (r) => r.affectedDirection === placement.direction
      );

      const remediesList: string[] = [];
      if (rule.suggestedRemedyNepali) {
        remediesList.push(rule.suggestedRemedyNepali);
      }
      if (specificRemedy) {
        remediesList.push(...specificRemedy.actionableStepsNepali);
      }
      if (remediesList.length === 0) {
        remediesList.push('उक्त स्थानलाई सफा, उज्यालो र हलुङ्गो राखी पञ्चधातु स्वास्तिक वा पिरामिड स्थापना गर्नुहोस्।');
      }

      doshas.push({
        roomId: roomCat.id,
        roomNameNepali: placement.customName || roomCat.nameNepali,
        direction: placement.direction,
        directionNameNepali: dirInfo.nameNepali,
        rating: rule.rating,
        ratingLabelNepali: rule.rating === 'severe' ? 'गम्भीर दोष (Severe)' : 'मध्यम दोष (Bad)',
        observationNepali: `${placement.customName || roomCat.nameNepali} ${dirInfo.nameNepali} दिशामा अवस्थित छ।`,
        traditionalInterpretation: rule.traditionalInterpretation,
        suggestedRemedies: remediesList,
      });
    } else if (rule.rating === 'excellent' || rule.rating === 'good') {
      positivePoints.push({
        roomId: roomCat.id,
        roomNameNepali: placement.customName || roomCat.nameNepali,
        directionNameNepali: dirInfo.nameNepali,
        remarksNepali: rule.remarksNepali,
      });
    }
  });

  const percentage = possible > 0 ? Math.round((earned / possible) * 100) : 100;

  // Grade determination
  let gradeNepali = 'उत्तम वास्तु (A+)';
  let gradeColor = 'text-emerald-700 bg-emerald-50 border-emerald-300 dark:text-emerald-300 dark:bg-emerald-950/40';
  let summaryNepali = 'परम्परागत वास्तुशास्त्रीय मान्यता अनुसार तपाईंको घरको स्थान र कोठाहरूको विन्यास अति नै उत्तम छ। यसले पारिवारिक सुख, शान्ति र समृद्धि बढाउन मद्दत गर्दछ।';

  if (percentage < 50) {
    gradeNepali = 'अति दोषयुक्त वास्तु (D)';
    gradeColor = 'text-rose-700 bg-rose-50 border-rose-300 dark:text-rose-300 dark:bg-rose-950/40';
    summaryNepali = 'परम्परागत वास्तुशास्त्रीय मान्यता अनुसार घरमा केही महत्त्वपूर्ण वास्तु दोषहरू देखिएका छन्। तोडफोड नगरिकन गरिने पञ्चतत्व सन्तुलन तथा वैदिक उपचार अपनाउन सल्लाह दिइन्छ।';
  } else if (percentage < 70) {
    gradeNepali = 'मध्यम दोषयुक्त वास्तु (C)';
    gradeColor = 'text-amber-800 bg-amber-50 border-amber-300 dark:text-amber-300 dark:bg-amber-950/40';
    summaryNepali = 'परम्परागत वास्तुशास्त्रीय मान्यता अनुसार घरको वास्तु स्थिति मध्यम छ। केही महत्त्वपूर्ण दोषहरूलाई शास्त्रीय उपायद्वारा सन्तुलनमा ल्याउन सकिन्छ।';
  } else if (percentage < 85) {
    gradeNepali = 'सामान्य शुभ वास्तु (B)';
    gradeColor = 'text-blue-800 bg-blue-50 border-blue-300 dark:text-blue-300 dark:bg-blue-950/40';
    summaryNepali = 'परम्परागत वास्तुशास्त्रीय मान्यता अनुसार तपाईंको घरको अधिकांश विन्यास अनुकूल र शुभ छ। केही सामान्य सुधारले थप सकारात्मक ऊर्जा प्रदान गर्नेछ।';
  }

  // Calculate Element Balances
  const elements: Panchamahabhuta[] = ['जल', 'अग्नि', 'पृथ्वी', 'वायु', 'आकाश'];
  const elementBalances: ElementBalanceScore[] = elements.map((elem) => {
    const eEarn = elementEarned[elem];
    const ePoss = elementPossible[elem];
    const pct = ePoss > 0 ? Math.round((eEarn / ePoss) * 100) : 80;

    let statusNepali: 'सन्तुलित' | 'अति सक्रिय' | 'कमजोर / असन्तुलित' = 'सन्तुलित';
    let statusColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30';

    if (pct < 50) {
      statusNepali = 'कमजोर / असन्तुलित';
      statusColor = 'text-rose-600 bg-rose-50 dark:bg-rose-950/30';
    } else if (pct > 90) {
      statusNepali = 'सन्तुलित';
      statusColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30';
    } else {
      statusNepali = 'सन्तुलित';
      statusColor = 'text-blue-600 bg-blue-50 dark:bg-blue-950/30';
    }

    return {
      element: elem,
      nameEnglish: PANCHAMAHABHUTA_DATA[elem].nameEnglish,
      scorePercentage: pct,
      statusNepali,
      statusColor,
    };
  });

  return {
    totalScore: Math.round(earned),
    maxScore: Math.round(possible),
    percentage,
    gradeNepali,
    gradeColor,
    summaryNepali,
    elementBalances,
    doshas,
    positivePoints,
    evaluatedRoomsCount: placements.length,
    analyzedAt: new Date().toISOString(),
  };
}
