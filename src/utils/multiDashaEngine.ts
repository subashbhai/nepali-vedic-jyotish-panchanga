import { PlanetName, PlanetPosition, RashiName } from '../types/astrology';
import { toDevanagariNumerals } from './nepaliCalendar';
import { convertADToBSFull } from './bsCalendarData';
import { VIMSHOTTARI_PERIODS, formatMsToBSAndNepaliTime } from './dashaEngine';

// ==========================================
// 1. TRIBHAGI DASHA ENGINE (४० वर्ष चक्र)
// ==========================================

export interface TribhagiMahadasha {
  planet: PlanetName;
  durationYears: number;
  durationFormattedNepali: string;
  cycleNumber: number;
  cycleLabelNepali: string;
  startMs: number;
  endMs: number;
  startDateBS: string;
  endDateBS: string;
  startDateAD: string;
  endDateAD: string;
  isCurrent: boolean;
  subDashas: Array<{
    planet: PlanetName;
    durationDays: number;
    startMs: number;
    endMs: number;
    startDateBS: string;
    endDateBS: string;
    startDateAD: string;
    endDateAD: string;
    isCurrent: boolean;
  }>;
}

export interface TribhagiDashaResult {
  balanceAtBirth: {
    nakshatraName: string;
    startingLord: PlanetName;
    balanceYears: number;
    balanceMonths: number;
    balanceDays: number;
    formattedBalanceNepali: string;
  };
  mahadashas: TribhagiMahadasha[];
  currentActiveDasha?: {
    cycleNumber: number;
    cycleLabelNepali: string;
    mahadasha: TribhagiMahadasha;
    antardasha: TribhagiMahadasha['subDashas'][0];
    mahadashaIndex: number;
  };
}

export function calculateTribhagiDasha(
  moonPosition: PlanetPosition,
  birthDateAD: string,
  birthTimeStr: string = '12:00',
  targetDateAD?: string
): TribhagiDashaResult {
  const moonLong = ((moonPosition.longitude % 360) + 360) % 360;
  const nakshatraSpan = 360 / 27; // 13°20' = 13.333333 degrees
  const tribhagaSpan = nakshatraSpan / 3; // 4°26'40" = 4.444444 degrees

  const nakshatraIndex = Math.floor(moonLong / nakshatraSpan);
  const degreeInNakshatra = moonLong % nakshatraSpan;

  // Tribhagi division in current nakshatra (0, 1, 2)
  const tribhagaPart = Math.floor(degreeInNakshatra / tribhagaSpan);
  const degreeInTribhaga = degreeInNakshatra % tribhagaSpan;
  const remainingFraction = 1.0 - (degreeInTribhaga / tribhagaSpan);

  // In standard Tribhagi, the 9 planets each rule 1/3 of their Vimshottari period (total = 120 / 3 = 40 years)
  // Starting lord calculated from nakshatra and part
  const baseLordIndex = (nakshatraIndex * 3 + tribhagaPart) % 9;
  const startLord = VIMSHOTTARI_PERIODS[baseLordIndex];

  const fullTribhagiYears = startLord.years / 3;
  const balanceYearsTotal = fullTribhagiYears * remainingFraction;

  const bYears = Math.floor(balanceYearsTotal);
  const bRemMonths = (balanceYearsTotal - bYears) * 12;
  const bMonths = Math.floor(bRemMonths);
  const bDays = Math.floor((bRemMonths - bMonths) * 30);

  const formattedBalanceNepali = `${startLord.planet} त्रिभागी दशा - बाँकी ${toDevanagariNumerals(bYears)} वर्ष, ${toDevanagariNumerals(bMonths)} महिना, ${toDevanagariNumerals(bDays)} दिन`;

  // Parse birth timestamp
  const [bh, bm] = birthTimeStr.split(':').map(Number);
  const birthMs = new Date(`${birthDateAD}T${bh < 10 ? '0' + bh : bh}:${bm < 10 ? '0' + bm : bm}:00.000Z`).getTime();
  const targetMs = targetDateAD ? new Date(targetDateAD).getTime() : Date.now();

  let currentStartMs = birthMs;
  const mahadashas: TribhagiMahadasha[] = [];

  // Generate complete lifetime (3 cycles * 40 years = 120 years)
  const TOTAL_TRIBHAGI_CYCLES = 3;
  for (let c = 0; c < TOTAL_TRIBHAGI_CYCLES; c++) {
    const cycleNumber = c + 1;
    const startAge = c * 40;
    const endAge = (c + 1) * 40;
    const cycleLabelNepali = `चक्र ${toDevanagariNumerals(cycleNumber)} (${toDevanagariNumerals(startAge)}-${toDevanagariNumerals(endAge)} वर्ष)`;

    for (let i = 0; i < 9; i++) {
      const cycleIdx = (baseLordIndex + i) % 9;
      const lord = VIMSHOTTARI_PERIODS[cycleIdx];
      const fullYears = lord.years / 3;

      let dashaYears = fullYears;
      if (c === 0 && i === 0) {
        dashaYears = balanceYearsTotal;
      }

      const dashaDurationMs = dashaYears * 365.25 * 24 * 3600 * 1000;
      const endMs = currentStartMs + dashaDurationMs;

      const startFmt = formatMsToBSAndNepaliTime(currentStartMs);
      const endFmt = formatMsToBSAndNepaliTime(endMs);
      const isCurrent = targetMs >= currentStartMs && targetMs < endMs;

      // Sub dashas (Antardashas within Tribhagi)
      const subDashas: TribhagiMahadasha['subDashas'] = [];
      let subStartMs = currentStartMs;

      for (let j = 0; j < 9; j++) {
        const subIdx = (cycleIdx + j) % 9;
        const subLord = VIMSHOTTARI_PERIODS[subIdx];

        // Proportional duration
        let adYears = (fullYears * (subLord.years / 3)) / 40;
        if (c === 0 && i === 0) {
          adYears = adYears * remainingFraction;
        }

        const adMs = adYears * 365.25 * 24 * 3600 * 1000;
        const adEndMs = subStartMs + adMs;

        const adStartFmt = formatMsToBSAndNepaliTime(subStartMs);
        const adEndFmt = formatMsToBSAndNepaliTime(adEndMs);
        const adIsCurrent = targetMs >= subStartMs && targetMs < adEndMs;

        subDashas.push({
          planet: subLord.planet,
          durationDays: Math.round(adYears * 365.25),
          startMs: subStartMs,
          endMs: adEndMs,
          startDateBS: adStartFmt.dateBS,
          endDateBS: adEndFmt.dateBS,
          startDateAD: adStartFmt.dateAD,
          endDateAD: adEndFmt.dateAD,
          isCurrent: adIsCurrent,
        });

        subStartMs = adEndMs;
      }

      mahadashas.push({
        planet: lord.planet,
        durationYears: parseFloat(dashaYears.toFixed(2)),
        durationFormattedNepali: `${toDevanagariNumerals(parseFloat(dashaYears.toFixed(2)))} वर्ष`,
        cycleNumber,
        cycleLabelNepali,
        startMs: currentStartMs,
        endMs,
        startDateBS: startFmt.dateBS,
        endDateBS: endFmt.dateBS,
        startDateAD: startFmt.dateAD,
        endDateAD: endFmt.dateAD,
        isCurrent,
        subDashas,
      });

      currentStartMs = endMs;
    }
  }

  let activeMahaIdx = mahadashas.findIndex((m) => m.isCurrent);
  if (activeMahaIdx === -1) {
    if (targetMs < birthMs) activeMahaIdx = 0;
    else activeMahaIdx = mahadashas.length - 1;
    mahadashas[activeMahaIdx].isCurrent = true;
  }
  const activeMaha = mahadashas[activeMahaIdx];
  let activeSubIdx = activeMaha.subDashas.findIndex((s) => s.isCurrent);
  if (activeSubIdx === -1) {
    activeSubIdx = 0;
    activeMaha.subDashas[0].isCurrent = true;
  }
  const activeSub = activeMaha.subDashas[activeSubIdx];

  const currentActiveDasha = {
    cycleNumber: activeMaha.cycleNumber,
    cycleLabelNepali: activeMaha.cycleLabelNepali,
    mahadasha: activeMaha,
    antardasha: activeSub,
    mahadashaIndex: activeMahaIdx,
  };

  return {
    balanceAtBirth: {
      nakshatraName: moonPosition.nakshatraName,
      startingLord: startLord.planet,
      balanceYears: bYears,
      balanceMonths: bMonths,
      balanceDays: bDays,
      formattedBalanceNepali,
    },
    mahadashas,
    currentActiveDasha,
  };
}

// ==========================================
// 2. YOGINI DASHA ENGINE (३६ वर्ष चक्र)
// ==========================================

export interface YoginiInfo {
  index: number; // 1 to 8
  name: string; // मंगला, पिंगला, धन्या, भ्रामरी, भद्रिका, उल्का, सिद्धा, संकटा
  lord: PlanetName; // चन्द्र, सूर्य, गुरु, मंगल, बुध, शनि, शुक्र, राहु
  years: number; // 1, 2, 3, 4, 5, 6, 7, 8
  nature: 'सौम्य' | 'क्रूर' | 'मध्यम' | 'अतिशुभ';
  resultDescription: string;
}

export const YOGINI_LIST: YoginiInfo[] = [
  { index: 1, name: 'मंगला', lord: 'चन्द्र', years: 1, nature: 'अतिशुभ', resultDescription: 'सुख, शान्ति, मानसिक सन्तोष, धार्मिक कार्य तथा मंगलमय वातावरण।' },
  { index: 2, name: 'पिंगला', lord: 'सूर्य', years: 2, nature: 'क्रूर', resultDescription: 'मानसिक चिन्ता, स्वास्थ्यमा उतारचढाव, शत्रु भय तथा राज्यपक्षबाट झमेला।' },
  { index: 3, name: 'धन्या', lord: 'गुरु', years: 3, nature: 'सौम्य', resultDescription: 'धन लाभ, विद्या वृद्धि, यश, सम्मान, कुल कुटुम्बमा सुख समृद्धि।' },
  { index: 4, name: 'भ्रामरी', lord: 'मंगल', years: 4, nature: 'क्रूर', resultDescription: 'अनावश्यक भ्रमण, स्थान परिवर्तन, विवाद, खर्च वृद्धि तथा भागदौड।' },
  { index: 5, name: 'भद्रिका', lord: 'बुध', years: 5, nature: 'सौम्य', resultDescription: 'व्यापार-व्यवसायमा प्रगति, बन्धुबान्धवको सहयोग, बुद्धि विकास तथा कार्यसिद्धि।' },
  { index: 6, name: 'उल्का', lord: 'शनि', years: 6, nature: 'क्रूर', resultDescription: 'शारीरिक कष्ट, आलस्य, कार्यमा विघ्न-बाधा, आर्थिक हानि तथा पारिवारिक तनाव।' },
  { index: 7, name: 'सिद्धा', lord: 'शुक्र', years: 7, nature: 'अतिशुभ', resultDescription: 'सर्वकार्य सिद्धि, वाहन-आभूषण प्राप्ति, भौतिक सुख, ऐश्वर्य तथा मनोरञ्जन।' },
  { index: 8, name: 'संकटा', lord: 'राहु', years: 8, nature: 'क्रूर', resultDescription: 'संकट, रोग भय, अचानक व्यवधान, बन्धु विछोड तथा सावधानी अपनाउनुपर्ने समय।' },
];

export interface YoginiMahadasha {
  yogini: YoginiInfo;
  durationYears: number;
  durationFormattedNepali: string;
  cycleNumber: number;
  cycleLabelNepali: string;
  startMs: number;
  endMs: number;
  startDateBS: string;
  endDateBS: string;
  startDateAD: string;
  endDateAD: string;
  isCurrent: boolean;
  subDashas: Array<{
    yogini: YoginiInfo;
    durationMonths: number;
    durationDays: number;
    startMs: number;
    endMs: number;
    startDateBS: string;
    endDateBS: string;
    startDateAD: string;
    endDateAD: string;
    isCurrent: boolean;
  }>;
}

export interface YoginiDashaResult {
  balanceAtBirth: {
    nakshatraName: string;
    startingYogini: YoginiInfo;
    balanceYears: number;
    balanceMonths: number;
    balanceDays: number;
    formattedBalanceNepali: string;
  };
  mahadashas: YoginiMahadasha[];
  currentActiveDasha?: {
    cycleNumber: number;
    cycleLabelNepali: string;
    mahadasha: YoginiMahadasha;
    antardasha: YoginiMahadasha['subDashas'][0];
    mahadashaIndex: number;
  };
}

export function calculateYoginiDasha(
  moonPosition: PlanetPosition,
  birthDateAD: string,
  birthTimeStr: string = '12:00',
  targetDateAD?: string
): YoginiDashaResult {
  const moonLong = ((moonPosition.longitude % 360) + 360) % 360;
  const nakshatraSpan = 360 / 27; // 13.3333333 degrees
  const nakshatraIndex = Math.floor(moonLong / nakshatraSpan) + 1; // 1 to 27 (Ashwini = 1)
  const degreeInNakshatra = moonLong % nakshatraSpan;

  const remainingFraction = 1.0 - (degreeInNakshatra / nakshatraSpan);

  // Yogini rule: (NakshatraNumber + 3) % 8
  let yoginiNum = (nakshatraIndex + 3) % 8;
  if (yoginiNum === 0) yoginiNum = 8; // 8 = Sankata

  const startingYogini = YOGINI_LIST[yoginiNum - 1];
  const balanceYearsTotal = startingYogini.years * remainingFraction;

  const bYears = Math.floor(balanceYearsTotal);
  const bRemMonths = (balanceYearsTotal - bYears) * 12;
  const bMonths = Math.floor(bRemMonths);
  const bDays = Math.floor((bRemMonths - bMonths) * 30);

  const formattedBalanceNepali = `${startingYogini.name} योगिनी (${startingYogini.lord}) - बाँकी ${toDevanagariNumerals(bYears)} वर्ष, ${toDevanagariNumerals(bMonths)} महिना, ${toDevanagariNumerals(bDays)} दिन`;

  // Parse birth timestamp
  const [bh, bm] = birthTimeStr.split(':').map(Number);
  const birthMs = new Date(`${birthDateAD}T${bh < 10 ? '0' + bh : bh}:${bm < 10 ? '0' + bm : bm}:00.000Z`).getTime();
  const targetMs = targetDateAD ? new Date(targetDateAD).getTime() : Date.now();

  let currentStartMs = birthMs;
  const mahadashas: YoginiMahadasha[] = [];

  // Generate complete cycles (3 cycles * 36 years = 108 years)
  const startIndex = yoginiNum - 1; // 0 to 7
  const TOTAL_YOGINI_CYCLES = 3;

  for (let c = 0; c < TOTAL_YOGINI_CYCLES; c++) {
    const cycleNumber = c + 1;
    const startAge = c * 36;
    const endAge = (c + 1) * 36;
    const cycleLabelNepali = `चक्र ${toDevanagariNumerals(cycleNumber)} (${toDevanagariNumerals(startAge)}-${toDevanagariNumerals(endAge)} वर्ष)`;

    for (let i = 0; i < 8; i++) {
      const cycleIdx = (startIndex + i) % 8;
      const yogini = YOGINI_LIST[cycleIdx];

      let dashaYears = yogini.years;
      if (c === 0 && i === 0) {
        dashaYears = balanceYearsTotal;
      }

      const dashaDurationMs = dashaYears * 365.25 * 24 * 3600 * 1000;
      const endMs = currentStartMs + dashaDurationMs;

      const startFmt = formatMsToBSAndNepaliTime(currentStartMs);
      const endFmt = formatMsToBSAndNepaliTime(endMs);
      const isCurrent = targetMs >= currentStartMs && targetMs < endMs;

      // Build Antardashas within Yogini
      const subDashas: YoginiMahadasha['subDashas'] = [];
      let subStartMs = currentStartMs;

      for (let j = 0; j < 8; j++) {
        const subIdx = (cycleIdx + j) % 8;
        const subYogini = YOGINI_LIST[subIdx];

        // Standard Yogini AD duration = (MD_Years * AD_Years) / 36 (in years)
        let adYears = (yogini.years * subYogini.years) / 36;
        if (c === 0 && i === 0) {
          adYears = adYears * remainingFraction;
        }

        const adMs = adYears * 365.25 * 24 * 3600 * 1000;
        const adEndMs = subStartMs + adMs;

        const adStartFmt = formatMsToBSAndNepaliTime(subStartMs);
        const adEndFmt = formatMsToBSAndNepaliTime(adEndMs);
        const adIsCurrent = targetMs >= subStartMs && targetMs < adEndMs;

        const durationMonths = parseFloat((adYears * 12).toFixed(1));
        const durationDays = Math.round(adYears * 365.25);

        subDashas.push({
          yogini: subYogini,
          durationMonths,
          durationDays,
          startMs: subStartMs,
          endMs: adEndMs,
          startDateBS: adStartFmt.dateBS,
          endDateBS: adEndFmt.dateBS,
          startDateAD: adStartFmt.dateAD,
          endDateAD: adEndFmt.dateAD,
          isCurrent: adIsCurrent,
        });

        subStartMs = adEndMs;
      }

      mahadashas.push({
        yogini,
        durationYears: parseFloat(dashaYears.toFixed(2)),
        durationFormattedNepali: `${toDevanagariNumerals(parseFloat(dashaYears.toFixed(2)))} वर्ष`,
        cycleNumber,
        cycleLabelNepali,
        startMs: currentStartMs,
        endMs,
        startDateBS: startFmt.dateBS,
        endDateBS: endFmt.dateBS,
        startDateAD: startFmt.dateAD,
        endDateAD: endFmt.dateAD,
        isCurrent,
        subDashas,
      });

      currentStartMs = endMs;
    }
  }

  let activeYoginiIdx = mahadashas.findIndex((m) => m.isCurrent);
  if (activeYoginiIdx === -1) {
    if (targetMs < birthMs) activeYoginiIdx = 0;
    else activeYoginiIdx = mahadashas.length - 1;
    mahadashas[activeYoginiIdx].isCurrent = true;
  }
  const activeYoginiMaha = mahadashas[activeYoginiIdx];
  let activeYoginiSubIdx = activeYoginiMaha.subDashas.findIndex((s) => s.isCurrent);
  if (activeYoginiSubIdx === -1) {
    activeYoginiSubIdx = 0;
    activeYoginiMaha.subDashas[0].isCurrent = true;
  }
  const activeYoginiSub = activeYoginiMaha.subDashas[activeYoginiSubIdx];

  const currentActiveDasha = {
    cycleNumber: activeYoginiMaha.cycleNumber,
    cycleLabelNepali: activeYoginiMaha.cycleLabelNepali,
    mahadasha: activeYoginiMaha,
    antardasha: activeYoginiSub,
    mahadashaIndex: activeYoginiIdx,
  };

  return {
    balanceAtBirth: {
      nakshatraName: moonPosition.nakshatraName,
      startingYogini,
      balanceYears: bYears,
      balanceMonths: bMonths,
      balanceDays: bDays,
      formattedBalanceNepali,
    },
    mahadashas,
    currentActiveDasha,
  };
}
