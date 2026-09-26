import {
  BirthDetails,
  PlanetPosition,
  LagnaInfo,
  PlanetName,
  RashiName
} from '../types/astrology';
import {
  calculatePlanetaryPositions,
  calculateLagna,
  getJulianDay,
  getAyanamsa,
  RASHI_DATA
} from './astroCalculations';
import { convertADToBSFull } from './bsCalendarData';
import { toDevanagariNumerals } from './nepaliCalendar';

export type TransitImpactNature = 'अति शुभ' | 'शुभ' | 'मध्यम' | 'सावधानी';

export interface UpcomingTransitEvent {
  id: string;
  dateAD: string; // YYYY-MM-DD
  dateBS: string; // e.g., २०८३ भाद्र २६
  dayOfWeekNepali: string; // e.g., आइतबार
  daysFromNow: number; // 0 = today, 1 = tomorrow, etc.
  planetName: PlanetName;
  glyph: string;
  eventType: 'rashi_ingress' | 'chandrashtama_start' | 'chandrashtama_end' | 'sankranti' | 'retrograde_shift';
  fromRashi?: RashiName;
  toRashi: RashiName;
  toRashiId: number;
  houseFromMoon: number;
  houseFromLagna?: number;
  nature: TransitImpactNature;
  titleNepali: string;
  summaryNepali: string;
  impactArea: 'career' | 'finance' | 'health' | 'family' | 'spiritual';
  remedyNepali: string;
  mantraNepali: string;
}

export interface DayTransitStatus {
  dateAD: string;
  dateBS: string;
  dayOfWeekNepali: string;
  dayOfWeekShort: string;
  dayIndex: number; // 0 to 29
  daysFromNow: number;
  isToday: boolean;
  score: number; // 0 to 100
  nature: TransitImpactNature;
  isChandrashtama: boolean;
  moonRashi: RashiName;
  moonHouseFromNatalMoon: number;
  sunRashi: RashiName;
  eventsCount: number;
  events: UpcomingTransitEvent[];
  planets: {
    name: PlanetName;
    glyph: string;
    rashiName: RashiName;
    degree: number;
    formattedDegree: string;
    houseFromMoon: number;
    isAuspicious: boolean;
    isRetrograde: boolean;
  }[];
}

export interface UpcomingTransitsReport {
  profileName: string;
  natalMoonRashi: RashiName;
  natalLagnaRashi?: RashiName;
  startDateAD: string;
  endDateAD: string;
  days: DayTransitStatus[];
  events: UpcomingTransitEvent[];
  chandrashtamaDays: DayTransitStatus[];
  auspiciousDaysCount: number;
  cautionDaysCount: number;
  totalEventsCount: number;
  keyHighlights: string[];
}

const PLANET_GLYPHS: Record<string, string> = {
  'सूर्य': '☉',
  'चन्द्र': '☽',
  'मंगल': '♂',
  'बुध': '☿',
  'गुरु': '♃',
  'शुक्र': '♀',
  'शनि': '♄',
  'राहु': '☊',
  'केतु': '☋'
};

const NEPALI_DAYS_SHORT = ['आइत', 'सोम', 'मङ्गल', 'बुध', 'बिही', 'शुक्र', 'शनि'];
const NEPALI_DAYS_FULL = ['आइतबार', 'सोमबार', 'मङ्गलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'];

/**
 * Classical Vedic auspicious houses from natal Moon
 */
function isAuspiciousHouseFromMoon(planet: PlanetName, house: number): boolean {
  switch (planet) {
    case 'सूर्य':
      return [3, 6, 10, 11].includes(house);
    case 'चन्द्र':
      return [1, 3, 6, 7, 10, 11].includes(house);
    case 'मंगल':
      return [3, 6, 11].includes(house);
    case 'बुध':
      return [2, 4, 6, 8, 10, 11].includes(house);
    case 'गुरु':
      return [2, 5, 7, 9, 11].includes(house);
    case 'शुक्र':
      return [1, 2, 3, 4, 5, 8, 9, 11, 12].includes(house);
    case 'शनि':
      return [3, 6, 11].includes(house);
    case 'राहु':
    case 'केतु':
      return [3, 6, 11].includes(house);
    default:
      return [3, 6, 11].includes(house);
  }
}

/**
 * House name and signification in Devanagari
 */
function getHouseNameNepali(house: number): string {
  const map: Record<number, string> = {
    1: 'तनु (प्रथम - स्वास्थ्य र व्यक्तित्व)',
    2: 'धन (द्वितीय - धन र वाणी)',
    3: 'सहज (तृतीय - पराक्रम र भाइ-बहिनी)',
    4: 'सुख (चतुर्थ - माता, वाहन र भूमि)',
    5: 'सुत (पञ्चम - बुद्धि, सन्तान र विद्या)',
    6: 'रिपु (षष्ठ - रोग, ऋण र शत्रु)',
    7: 'जाया (सप्तम - दाम्पत्य र साझेदारी)',
    8: 'आयु (अष्टम - संकट, आयु र रहस्य)',
    9: 'भाग्य (नवम - धर्म, भाग्य र तीर्थ)',
    10: 'कर्म (दशम - राज्य, व्यवसाय र मान)',
    11: 'लाभ (एकादश - आम्दानी, विजय र सिद्धि)',
    12: 'व्यय (द्वादश - खर्च, विदेश र मोक्ष)'
  };
  return map[house] || `${house} औँ भाव`;
}

/**
 * Computes upcoming planetary transits for the next 30 days based on active native's birth chart.
 */
// In-memory cache for upcoming transits report
const upcomingTransitsCache = new Map<string, UpcomingTransitsReport>();

export function calculateUpcomingTransits(params: {
  activeProfile: BirthDetails | null;
  birthMoon?: PlanetPosition;
  birthLagna?: LagnaInfo;
  startDateAD?: string;
  daysCount?: number;
}): UpcomingTransitsReport {
  const {
    activeProfile,
    startDateAD = new Date().toISOString().split('T')[0],
    daysCount = 30
  } = params;

  const profileName = activeProfile?.name?.trim() || 'गृहस्वामी (जातक)';

  // Determine native's natal Moon and Lagna
  let natalMoonRashiId = 1;
  let natalMoonRashiName: RashiName = 'मेष';
  let natalLagnaRashiId = 1;
  let natalLagnaRashiName: RashiName = 'मेष';

  if (params.birthMoon) {
    natalMoonRashiId = params.birthMoon.rashiId;
    natalMoonRashiName = params.birthMoon.rashiName;
  } else if (activeProfile?.dateAD && activeProfile?.time) {
    try {
      const lat = activeProfile.location?.latitude ?? 27.7172;
      const lon = activeProfile.location?.longitude ?? 85.324;
      const tz = activeProfile.location?.timeZone ?? 5.75;
      const jd = getJulianDay(activeProfile.dateAD, activeProfile.time, tz);
      const ayan = getAyanamsa(jd, 'Lahiri');
      const lagna = calculateLagna(jd, lat, lon, ayan);
      const planets = calculatePlanetaryPositions(jd, ayan, lagna.rashiId);
      const moon = planets.find((p) => p.name === 'चन्द्र') || planets[0];
      natalMoonRashiId = moon.rashiId;
      natalMoonRashiName = moon.rashiName;
      natalLagnaRashiId = lagna.rashiId;
      natalLagnaRashiName = lagna.rashiName as RashiName;
    } catch {
      natalMoonRashiId = 1;
      natalMoonRashiName = 'मेष';
    }
  }

  if (params.birthLagna) {
    natalLagnaRashiId = params.birthLagna.rashiId;
    natalLagnaRashiName = params.birthLagna.rashiName as RashiName;
  }

  const cacheKey = `${profileName}_${natalMoonRashiId}_${natalLagnaRashiId}_${startDateAD}_${daysCount}`;
  if (upcomingTransitsCache.has(cacheKey)) {
    return upcomingTransitsCache.get(cacheKey)!;
  }

  const startParsed = new Date(startDateAD);
  const baseTime = isNaN(startParsed.getTime()) ? new Date() : startParsed;

  const days: DayTransitStatus[] = [];
  const events: UpcomingTransitEvent[] = [];

  let previousPlanets: PlanetPosition[] | null = null;
  let wasPreviousChandrashtama = false;

  for (let i = 0; i < daysCount; i++) {
    const currentDate = new Date(baseTime);
    currentDate.setDate(baseTime.getDate() + i);

    const dateAD = currentDate.toISOString().split('T')[0];
    const bsInfo = convertADToBSFull(dateAD);
    const dayOfWeek = currentDate.getDay();
    const dayOfWeekNepali = NEPALI_DAYS_FULL[dayOfWeek];
    const dayOfWeekShort = NEPALI_DAYS_SHORT[dayOfWeek];

    // Compute planetary positions for 12:00 PM (Noon) on this day in Nepal (UTC+5:45 = +5.75)
    const jd = getJulianDay(dateAD, '12:00', 5.75);
    const ayan = getAyanamsa(jd, 'Lahiri');
    const planets = calculatePlanetaryPositions(jd, ayan, natalLagnaRashiId);

    const moon = planets.find((p) => p.name === 'चन्द्र') || planets[0];
    const sun = planets.find((p) => p.name === 'सूर्य') || planets[0];

    const moonHouseFromNatal = ((moon.rashiId - natalMoonRashiId + 12) % 12) + 1;
    const isChandrashtama = moonHouseFromNatal === 8;

    // Detect Ingress and State Changes compared to previous day
    const dayEvents: UpcomingTransitEvent[] = [];

    if (previousPlanets) {
      planets.forEach((p) => {
        const prev = previousPlanets!.find((prevP) => prevP.name === p.name);
        if (!prev) return;

        // 1. Rashi Ingress (Sign change)
        if (prev.rashiId !== p.rashiId) {
          const houseFromMoon = ((p.rashiId - natalMoonRashiId + 12) % 12) + 1;
          const isAusp = isAuspiciousHouseFromMoon(p.name, houseFromMoon);
          const isSankranti = p.name === 'सूर्य';

          let nature: TransitImpactNature = isAusp ? 'शुभ' : 'मध्यम';
          if (p.name === 'गुरु' && [2, 5, 9, 11].includes(houseFromMoon)) nature = 'अति शुभ';
          if (p.name === 'शनि' && [12, 1, 2, 4, 8].includes(houseFromMoon)) nature = 'सावधानी';
          if (p.name === 'चन्द्र' && houseFromMoon === 8) nature = 'सावधानी';

          let titleNepali = '';
          let summaryNepali = '';
          let remedyNepali = '';
          let mantraNepali = '';
          let impactArea: UpcomingTransitEvent['impactArea'] = 'career';

          if (isSankranti) {
            titleNepali = `☀️ सूर्य सङ्क्रान्ति: ${p.rashiName} राशि प्रवेश`;
            summaryNepali = `सूर्यदेव ${prev.rashiName} राशिबाट ${p.rashiName} राशि (${toDevanagariNumerals(houseFromMoon)} औँ भाव) मा प्रवेश गर्नुभएको छ। यसले प्रतिष्ठा, सरकारी काम र ऊर्जामा प्रभाव पार्नेछ।`;
            remedyNepali = 'बिहान तामाको लोटाबाट सूर्यलाई अर्घ्य दिई ॐ घृणिः सूर्याय नमः जप गर्नुहोस्।';
            mantraNepali = 'ॐ सूर्याय नमः';
            impactArea = 'career';
          } else if (p.name === 'चन्द्र') {
            if (houseFromMoon === 8) {
              titleNepali = `⚠️ चन्द्राष्टम प्रारम्भ (${p.rashiName} राशि)`;
              summaryNepali = `चन्द्रमा जन्म चन्द्र राशिबाट ८औँ भाव (${p.rashiName}) मा प्रवेश गर्नुभएको छ। मानसिक तनाव, छिटो निर्णय लिनु पर्ने अवस्था र यात्रामा विशेष संयमता अपनाउनुहोला।`;
              remedyNepali = 'शिवजीको मन्दिरमा जल अर्पण वा ॐ नमः शिवाय मन्त्रको शान्त जप।';
              mantraNepali = 'ॐ नमः शिवाय (१०८ पटक)';
              impactArea = 'health';
            } else {
              titleNepali = `☽ चन्द्र गोचर: ${p.rashiName} राशि (${toDevanagariNumerals(houseFromMoon)} औँ भाव)`;
              summaryNepali = `चन्द्रमा ${getHouseNameNepali(houseFromMoon)} मा प्रवेश गर्दा मनस्थिति र दैनिक कार्यमा नयाँ गतिशीलता आउनेछ।`;
              remedyNepali = 'सकारात्मक सोच र जलको शुद्ध प्रयोग।';
              mantraNepali = 'ॐ सोमाय नमः';
              impactArea = 'family';
            }
          } else if (p.name === 'मंगल') {
            titleNepali = `♂ मङ्गल राशि परिवर्तन: ${p.rashiName} राशि प्रवेश`;
            summaryNepali = `भूमिपुत्र मङ्गल जन्म राशिबाट ${toDevanagariNumerals(houseFromMoon)} औँ भावमा पुग्दा आँट, साहस र प्राविधिक कार्यमा प्रभाव रहनेछ।`;
            remedyNepali = 'मङ्गलबार हनुमान चालीसा पाठ र रातो वस्तुको सम्मान।';
            mantraNepali = 'ॐ अं अङ्गारकाय नमः';
            impactArea = 'finance';
          } else if (p.name === 'बुध') {
            titleNepali = `☿ बुध राशि परिवर्तन: ${p.rashiName} राशि प्रवेश`;
            summaryNepali = `बुद्धिदाता बुध ${toDevanagariNumerals(houseFromMoon)} औँ भावमा गोचर गर्दा व्यापार, सञ्चार, अध्ययन र वाणीमा अनुकूलता ल्याउनेछ।`;
            remedyNepali = 'बुधवार गाईलाई हरियो घाँस वा फलफूल खुवाउने।';
            mantraNepali = 'ॐ बुं बुधाय नमः';
            impactArea = 'career';
          } else if (p.name === 'शुक्र') {
            titleNepali = `♀ शुक्र राशि परिवर्तन: ${p.rashiName} राशि प्रवेश`;
            summaryNepali = `दैत्यगुरु शुक्र ${toDevanagariNumerals(houseFromMoon)} औँ भावमा प्रवेश गर्दा सुख, ऐश्वर्य, प्रेम सम्बन्ध र आर्थिक लाभमा वृद्धि हुनेछ।`;
            remedyNepali = 'सेतो वस्तु (दूध, चामल वा सेतो वस्त्र) को दान वा माता लक्ष्मीको उपासना।';
            mantraNepali = 'ॐ शुं शुक्राय नमः';
            impactArea = 'family';
          } else if (p.name === 'गुरु') {
            titleNepali = `♃ देवगुरु वृहस्पति राशि परिवर्तन: ${p.rashiName} प्रवेश`;
            summaryNepali = `ज्ञान र भाग्याधिपति गुरु ${toDevanagariNumerals(houseFromMoon)} औँ भावमा प्रवेश गर्दा दीर्घकालीन सौभाग्य र ज्ञानार्जनका अवसरहरू प्राप्त हुनेछन्।`;
            remedyNepali = 'बिहीबार पहेँलो फल, चनाको दाल दान वा विष्णु सहस्रनाम पाठ।';
            mantraNepali = 'ॐ बृं बृहस्पतये नमः';
            impactArea = 'spiritual';
          } else {
            titleNepali = `${p.name} राशि परिवर्तन: ${p.rashiName} प्रवेश`;
            summaryNepali = `${p.name} जन्म चन्द्र राशिबाट ${toDevanagariNumerals(houseFromMoon)} औँ भावमा गोचर गर्दै हुनुहुन्छ।`;
            remedyNepali = 'इष्टदेवको पूजा र दैनिक गायत्री मन्त्र जप।';
            mantraNepali = `ॐ ${p.name} देवाय नमः`;
            impactArea = 'career';
          }

          const eventItem: UpcomingTransitEvent = {
            id: `transit_${p.name}_${dateAD}`,
            dateAD,
            dateBS: bsInfo.formattedBS,
            dayOfWeekNepali,
            daysFromNow: i,
            planetName: p.name,
            glyph: PLANET_GLYPHS[p.name] || '★',
            eventType: isSankranti
              ? 'sankranti'
              : p.name === 'चन्द्र' && houseFromMoon === 8
              ? 'chandrashtama_start'
              : 'rashi_ingress',
            fromRashi: prev.rashiName,
            toRashi: p.rashiName,
            toRashiId: p.rashiId,
            houseFromMoon,
            nature,
            titleNepali,
            summaryNepali,
            impactArea,
            remedyNepali,
            mantraNepali
          };

          dayEvents.push(eventItem);
          events.push(eventItem);
        }

        // 2. Retrograde (वक्री / मार्गी) shift
        if (prev.isRetrograde !== p.isRetrograde && p.name !== 'राहु' && p.name !== 'केतु') {
          const shiftTitle = p.isRetrograde ? `${p.name} वक्री चाल प्रारम्भ` : `${p.name} मार्गी (प्रत्यक्ष) चाल प्रारम्भ`;
          const shiftSummary = `${p.name}देव ${p.rashiName} राशिमा ${p.isRetrograde ? 'वक्री (उल्टो)' : 'मार्गी (सीधा)'} हुनुभएको छ। यसले कार्यगत गतिमा परिवर्तन ल्याउनेछ।`;

          const eventItem: UpcomingTransitEvent = {
            id: `retro_${p.name}_${dateAD}`,
            dateAD,
            dateBS: bsInfo.formattedBS,
            dayOfWeekNepali,
            daysFromNow: i,
            planetName: p.name,
            glyph: PLANET_GLYPHS[p.name] || '★',
            eventType: 'retrograde_shift',
            toRashi: p.rashiName,
            toRashiId: p.rashiId,
            houseFromMoon: ((p.rashiId - natalMoonRashiId + 12) % 12) + 1,
            nature: p.isRetrograde ? 'मध्यम' : 'शुभ',
            titleNepali: shiftTitle,
            summaryNepali: shiftSummary,
            impactArea: 'career',
            remedyNepali: `${p.name}को शान्ति मन्त्र वा दैनिक ध्यान गर्नुहोस्।`,
            mantraNepali: `ॐ ${p.name} देवाय नमः`
          };

          dayEvents.push(eventItem);
          events.push(eventItem);
        }
      });
    }

    // Chandrashtama ending notification if transitioning out
    if (wasPreviousChandrashtama && !isChandrashtama) {
      const exitItem: UpcomingTransitEvent = {
        id: `chandrashtama_end_${dateAD}`,
        dateAD,
        dateBS: bsInfo.formattedBS,
        dayOfWeekNepali,
        daysFromNow: i,
        planetName: 'चन्द्र',
        glyph: '☽',
        eventType: 'chandrashtama_end',
        toRashi: moon.rashiName,
        toRashiId: moon.rashiId,
        houseFromMoon: moonHouseFromNatal,
        nature: 'शुभ',
        titleNepali: '✅ चन्द्राष्टम समाप्ति - नवउमङ्ग एवं शुभ समय',
        summaryNepali: `चन्द्रमा ८औँ भावबाट ९औँ (भाग्य भाव) मा सर्नुभएको छ। विगत २ दिनको मानसिक भारीपन समाप्त भई कार्य सिद्धि र उत्साह प्रारम्भ हुनेछ।`,
        impactArea: 'health',
        remedyNepali: 'मनमा शान्ति राखी नयाँ योजना सुरु गर्न सकिन्छ।',
        mantraNepali: 'ॐ चन्द्रमसे नमः'
      };
      dayEvents.push(exitItem);
      events.push(exitItem);
    }
    wasPreviousChandrashtama = isChandrashtama;

    // Calculate daily transit score for native (0 - 100)
    let favorablePlanetsCount = 0;
    const formattedPlanetList = planets.map((p) => {
      const hFromMoon = ((p.rashiId - natalMoonRashiId + 12) % 12) + 1;
      const isAusp = isAuspiciousHouseFromMoon(p.name, hFromMoon);
      if (isAusp) favorablePlanetsCount++;

      const degInt = Math.floor(p.degree || 0);
      const minInt = Math.floor(((p.degree || 0) % 1) * 60);
      return {
        name: p.name,
        glyph: PLANET_GLYPHS[p.name] || '★',
        rashiName: p.rashiName,
        degree: p.degree,
        formattedDegree: `${toDevanagariNumerals(degInt)}° ${toDevanagariNumerals(minInt)}'`,
        houseFromMoon: hFromMoon,
        isAuspicious: isAusp,
        isRetrograde: p.isRetrograde || false
      };
    });

    // Score calculation: base from favorable planets + Moon penalty/bonus
    let score = Math.round((favorablePlanetsCount / 9) * 100);
    if (isChandrashtama) {
      score = Math.max(25, score - 25);
    }

    let nature: TransitImpactNature = 'मध्यम';
    if (score >= 70 && !isChandrashtama) {
      nature = 'अति शुभ';
    } else if (score >= 50 && !isChandrashtama) {
      nature = 'शुभ';
    } else if (isChandrashtama || score < 40) {
      nature = 'सावधानी';
    }

    days.push({
      dateAD,
      dateBS: bsInfo.formattedBS,
      dayOfWeekNepali,
      dayOfWeekShort,
      dayIndex: i,
      daysFromNow: i,
      isToday: i === 0,
      score,
      nature,
      isChandrashtama,
      moonRashi: moon.rashiName,
      moonHouseFromNatalMoon: moonHouseFromNatal,
      sunRashi: sun.rashiName,
      eventsCount: dayEvents.length,
      events: dayEvents,
      planets: formattedPlanetList
    });

    previousPlanets = planets;
  }

  const chandrashtamaDays = days.filter((d) => d.isChandrashtama);
  const auspiciousDaysCount = days.filter((d) => d.nature === 'अति शुभ' || d.nature === 'शुभ').length;
  const cautionDaysCount = days.filter((d) => d.nature === 'सावधानी').length;

  // Build top 3 key highlights for native
  const keyHighlights: string[] = [];
  if (chandrashtamaDays.length > 0) {
    const firstCd = chandrashtamaDays[0];
    keyHighlights.push(
      `⚠️ चन्द्राष्टम सतर्कता: ${firstCd.dateBS} (${firstCd.daysFromNow === 0 ? 'आज' : `${toDevanagariNumerals(firstCd.daysFromNow)} दिन पछि`}) मा मानसिक संयम अपनाउनुहोला।`
    );
  }

  const majorIngresses = events.filter(
    (e) => e.planetName !== 'चन्द्र' && e.eventType === 'rashi_ingress'
  );
  if (majorIngresses.length > 0) {
    const nextMajor = majorIngresses[0];
    keyHighlights.push(
      `✨ ${nextMajor.titleNepali}: ${nextMajor.dateBS} मा चन्द्र राशिबाट ${toDevanagariNumerals(nextMajor.houseFromMoon)} औँ भावमा।`
    );
  }

  const bestDay = [...days].sort((a, b) => b.score - a.score)[0];
  if (bestDay) {
    keyHighlights.push(
      `🌟 सर्वोत्तम गोचर अनुकूल दिन: ${bestDay.dateBS} (${bestDay.dayOfWeekNepali}) - गोचर अनुकूलता ${toDevanagariNumerals(bestDay.score)}%।`
    );
  }

  const report: UpcomingTransitsReport = {
    profileName,
    natalMoonRashi: natalMoonRashiName,
    natalLagnaRashi: natalLagnaRashiName,
    startDateAD,
    endDateAD: days[days.length - 1]?.dateAD || startDateAD,
    days,
    events,
    chandrashtamaDays,
    auspiciousDaysCount,
    cautionDaysCount,
    totalEventsCount: events.length,
    keyHighlights
  };

  upcomingTransitsCache.set(cacheKey, report);
  if (upcomingTransitsCache.size > 20) {
    const firstKey = upcomingTransitsCache.keys().next().value;
    if (firstKey) upcomingTransitsCache.delete(firstKey);
  }

  return report;
}
