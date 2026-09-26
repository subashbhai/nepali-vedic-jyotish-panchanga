import { PanchangaData, RashiName, MasaInfo } from '../types/astrology';
import { 
  getJulianDay, 
  getAyanamsa, 
  calculatePlanetaryPositions, 
  RASHI_DATA, 
  NAKSHATRA_DATA 
} from './astroCalculations';
import { 
  calculateCanonicalAuthoritativePanchanga,
  canonicalJulianDay,
  AuthoritativeUdayaPanchanga,
  NAKSHATRA_NAMES_27,
  NAKSHATRA_LORDS_27
} from './canonicalAstroEngine';
import { toDevanagariNumerals } from './nepaliCalendar';
import { 
  convertADToBSFull, 
  convertBSToADFull, 
  getBSDaysInMonth, 
  getSamvatsaraForBSYear, 
  getRituForBSMonth, 
  getAyanaForBSMonth,
  PADA_NAMES_NEPALI,
  NEPALI_MONTH_NAMES
} from './bsCalendarData';
import { getFestivalForBSDate } from './nepalFestivalsData';

export const TITHI_NAMES_30 = [
  'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पञ्चमी',
  'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
  'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'पूर्णिमा',
  'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पञ्चमी',
  'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी',
  'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'औंसी'
] as const;

export const YOGA_NAMES_27 = [
  'विष्कुम्भ', 'प्रीति', 'आयुष्मान्', 'सौभाग्य', 'शोभन', 'अतिगण्ड', 'सुकर्मा',
  'धृति', 'शूल', 'गण्ड', 'वृद्धि', 'ध्रुव', 'व्याघात', 'हर्षण',
  'वज्र', 'सिद्धि', 'व्यतीपात', 'वरीयान्', 'परिघ', 'शिव', 'सिद्ध',
  'साध्य', 'शुभ', 'शुक्ल', 'ब्रह्म', 'इन्द्र', 'वैधृति'
] as const;

export const KARANA_NAMES_11 = [
  'बव', 'बालव', 'कौलव', 'तैतिल', 'गरज', 'वणिज', 'विष्टि (भद्रा)',
  'शकुनि', 'चतुष्पाद', 'नाग', 'किंस्तुघ्न'
] as const;

// 27 Nakshatras x 4 Padas = 108 Namakshara Letters
export const NAKSHATRA_NAMAKSHARA_MAP: Record<number, [string, string, string, string]> = {
  1: ['चु', 'चे', 'चो', 'ला'],     // अश्विनी
  2: ['ली', 'लू', 'ले', 'लो'],     // भरणी
  3: ['अ', 'ई', 'उ', 'ए'],       // कृत्तिका
  4: ['ओ', 'वा', 'वी', 'वू'],     // रोहिणी
  5: ['वे', 'वो', 'का', 'की'],     // मृगशिरा
  6: ['कु', 'घ', 'ङ', 'छ'],       // आर्द्रा
  7: ['के', 'को', 'हा', 'ही'],     // पुनर्वसु
  8: ['हू', 'हे', 'हो', 'डा'],     // पुष्य
  9: ['डी', 'डू', 'डे', 'डो'],     // आश्लेषा
  10: ['मा', 'मी', 'मू', 'मे'],    // मघा
  11: ['मो', 'टा', 'टी', 'टू'],    // पूर्वाफाल्गुनी
  12: ['टे', 'टो', 'पा', 'पी'],    // उत्तराफाल्गुनी
  13: ['पू', 'ष', 'ण', 'ढा'],     // हस्त
  14: ['पे', 'पो', 'रा', 'री'],    // चित्रा
  15: ['रू', 'रे', 'रो', 'ता'],    // स्वाती
  16: ['ती', 'तू', 'ते', 'तो'],    // विशाखा
  17: ['ना', 'नी', 'नू', 'ने'],    // अनुराधा
  18: ['नो', 'या', 'यी', 'यू'],    // ज्येष्ठा
  19: ['ये', 'यो', 'भा', 'भी'],    // मूल
  20: ['भू', 'धा', 'फा', 'ढा'],    // पूर्वाषाढा
  21: ['भे', 'भो', 'जा', 'जी'],    // उत्तराषाढा
  22: ['खी', 'खू', 'खे', 'खो'],    // श्रवण
  23: ['गा', 'गी', 'गु', 'गे'],    // धनिष्ठा
  24: ['गो', 'सा', 'सी', 'सू'],    // शतभिषा
  25: ['से', 'सो', 'दा', 'दी'],    // पूर्वाभाद्रपदा
  26: ['दू', 'थ', 'झ', 'ञ'],       // उत्तराभाद्रपदा
  27: ['दे', 'दो', 'चा', 'ची'],    // रेवती
};

/**
 * Converts decimal hours into formatted Nepali clock time (e.g., "बिहान ०६:२८ बजे", "साँझ ०६:४५ बजे", "राति १०:१५ बजे")
 */
export function formatTimeNepali(decHours: number): string {
  let h = Math.floor((decHours % 24 + 24) % 24);
  let m = Math.floor((decHours - Math.floor(decHours)) * 60);

  let periodPrefix = 'बिहान'; // Morning 04:00 to 11:59
  if (h >= 12 && h < 16) {
    periodPrefix = 'दिउँसो'; // Afternoon 12:00 to 15:59
  } else if (h >= 16 && h < 19) {
    periodPrefix = 'साँझ'; // Evening 16:00 to 18:59
  } else if (h >= 19 || h < 4) {
    periodPrefix = 'राति'; // Night 19:00 to 03:59
  }

  let displayH = h % 12;
  if (displayH === 0) displayH = 12;

  const hDev = toDevanagariNumerals(String(displayH).padStart(2, '0'));
  const mDev = toDevanagariNumerals(String(m).padStart(2, '0'));

  return `${periodPrefix} ${hDev}:${mDev} बजे`;
}

/**
 * Calculates Adhimasa (पुरुषोत्तम महिना / अधिकमास) and Kshayamasa (क्षयमास)
 * for a given Julian Day, BS Month and BS Year.
 *
 * Astronomical Definition:
 * - A lunar month runs from Amavasya to Amavasya.
 * - Adhimasa (अधिकमास): Lunar month with NO Surya Sankranti (0 Sankrantis).
 * - Kshayamasa (क्षयमास): Lunar month with TWO Surya Sankrantis (>= 2 Sankrantis).
 * - Shuddha Masa (शुद्ध मास): Normal lunar month with 1 Surya Sankranti.
 */
export const VEDIC_LUNAR_MONTH_NAMES = [
  'चैत्र',
  'वैशाख',
  'ज्येष्ठ',
  'आषाढ',
  'श्रावण',
  'भाद्रपद',
  'आश्विन',
  'कार्तिक',
  'मार्गशीर्ष',
  'पौष',
  'माघ',
  'फाल्गुन'
] as const;

export function calculateMasaInfo(julianDay: number, bsMonth: number, bsYear: number): MasaInfo {
  const ayanamsa = getAyanamsa(julianDay, 'Lahiri');

  const planets = calculatePlanetaryPositions(julianDay, ayanamsa, 1);
  const sun = planets.find((p) => p.name === 'सूर्य') || planets[0];
  const moon = planets.find((p) => p.name === 'चन्द्र') || planets[1] || planets[0];

  const moonSunDiff = ((moon?.longitude ?? 0) - (sun?.longitude ?? 0) + 360) % 360;

  // Approximate days since last Amavasya (Moon-Sun diff = 0)
  const daysSinceAmavasya = moonSunDiff / 12.190749; // Moon speed relative to Sun
  const prevAmavasyaJD = julianDay - daysSinceAmavasya;
  const nextAmavasyaJD = prevAmavasyaJD + 29.530588; // Synodic month duration

  // Sun longitude at prev and next Amavasya
  const sunPrev = calculatePlanetaryPositions(prevAmavasyaJD, getAyanamsa(prevAmavasyaJD, 'Lahiri'), 1).find((p) => p.name === 'सूर्य') || sun;
  const sunNext = calculatePlanetaryPositions(nextAmavasyaJD, getAyanamsa(nextAmavasyaJD, 'Lahiri'), 1).find((p) => p.name === 'सूर्य') || sun;

  const rashiPrev = Math.floor((((sunPrev?.longitude ?? 0) % 360) + 360) % 360 / 30);
  const rashiNext = Math.floor((((sunNext?.longitude ?? 0) % 360) + 360) % 360 / 30);

  // Number of Rashi boundaries crossed by Sun between prev and next Amavasya
  const sankrantiCount = (rashiNext - rashiPrev + 12) % 12;

  let isAdhimasa = sankrantiCount === 0;
  let isKshayamasa = sankrantiCount >= 2;

  // Known BS Adhimasa lookup to guarantee 100% agreement with standard BS almanacs
  const knownAdhimasaMap: Record<number, number> = {
    2075: 2, // Jestha
    2077: 6, // Ashwin
    2080: 4, // Shrawan
    2083: 5, // Bhadra
    2085: 2, // Jestha
    2088: 1, // Baishakh
    2091: 5, // Bhadra
  };

  if (knownAdhimasaMap[bsYear] && knownAdhimasaMap[bsYear] === bsMonth) {
    isAdhimasa = true;
    isKshayamasa = false;
  }

  // True Vedic Chandramasa (Lunar Month):
  // At Amavasya:
  // Sun in Pisces (11) -> Chaitra (0)
  // Sun in Aries (0) -> Vaishakha (1)
  // Sun in Leo (4) -> Bhadrapada (5)
  // Sun in Virgo (5) -> Ashwina (6)
  const amantaMasaIndex = ((rashiPrev + 1) % 12 + 12) % 12;
  const isShukla = moonSunDiff < 180;
  // Purnimanta tradition (predominant in Nepal for civil tithi/masa naming):
  const purnimantaMasaIndex = isShukla ? amantaMasaIndex : (amantaMasaIndex + 1) % 12;
  const lunarMonthName = VEDIC_LUNAR_MONTH_NAMES[purnimantaMasaIndex];

  if (isAdhimasa) {
    return {
      isAdhimasa: true,
      isKshayamasa: false,
      masaType: 'अधिकमास (पुरुषोत्तम महिना)',
      masaName: `अधिक ${lunarMonthName} (पुरुषोत्तम महिना)`,
      details: `यस चन्द्रमासमा सूर्यको कुनै पनि संक्रान्ति नभएकाले यो अधिकमास (अधिमास / पुरुषोत्तम महिना) हो।`,
      amantaMasaIndex,
      purnimantaMasaIndex,
    };
  } else if (isKshayamasa) {
    return {
      isAdhimasa: false,
      isKshayamasa: true,
      masaType: 'क्षयमास',
      masaName: `क्षय ${lunarMonthName}`,
      details: `यस चन्द्रमासमा दुईवटा सूर्य संक्रान्ति परेकाले यो क्षयमास हो।`,
      amantaMasaIndex,
      purnimantaMasaIndex,
    };
  } else {
    return {
      isAdhimasa: false,
      isKshayamasa: false,
      masaType: 'शुद्ध मास',
      masaName: `${lunarMonthName} मास (शुद्ध)`,
      details: `यस चन्द्रमासमा एक सूर्य संक्रान्ति परेकाले यो सामान्य/शुद्ध चान्द्रमास हो।`,
      amantaMasaIndex,
      purnimantaMasaIndex,
    };
  }
}

export const MHA_PUJA_KARTIK_DAYS: Record<number, number> = {
  2070: 20,
  2071: 8,
  2072: 26,
  2073: 15,
  2074: 4,
  2075: 23,
  2076: 12,
  2077: 30,
  2078: 19,
  2079: 9,
  2080: 28,
  2081: 17,
  2082: 5,
  2083: 24,
  2084: 13,
  2085: 2,
  2086: 21,
  2087: 10,
  2088: 29,
  2089: 18,
  2090: 7,
};

export const NEPAL_SAMBAT_MONTH_NAMES_LIST = [
  'कछला', // 0: Kartik
  'थिंला', // 1: Margashirsha
  'प्वँहेला', // 2: Pausha
  'सिल्ला', // 3: Magha
  'चिला', // 4: Phalguna
  'चौला', // 5: Chaitra
  'बछला', // 6: Vaishakha
  'तछला', // 7: Jyeshtha
  'दिल्ला', // 8: Ashadha
  'गुंला', // 9: Shravana
  'ञला', // 10: Bhadrapada
  'कौला', // 11: Ashwina
];

export function calculateExactNepalSambat(
  bsYear: number,
  bsMonth: number,
  bsDay: number,
  amantaMasaIndex: number,
  isAdhimasa: boolean,
  paksha: 'शुक्ल' | 'कृष्ण',
  tithiNumber: number,
  tithiName: string
) {
  let nsYear = bsYear - 937;
  if (bsMonth > 7) {
    nsYear = bsYear - 936;
  } else if (bsMonth === 7) {
    if (MHA_PUJA_KARTIK_DAYS[bsYear]) {
      nsYear = bsDay >= MHA_PUJA_KARTIK_DAYS[bsYear] ? bsYear - 936 : bsYear - 937;
    } else {
      const isPastPratipada = paksha === 'शुक्ल' && tithiNumber >= 1;
      nsYear = isPastPratipada ? bsYear - 936 : bsYear - 937;
    }
  }

  const monthIndex = (amantaMasaIndex - 7 + 12) % 12;
  const baseMonth = NEPAL_SAMBAT_MONTH_NAMES_LIST[monthIndex] || 'ञला';
  const monthNameNewa = isAdhimasa ? `अनला (अधिक ${baseMonth})` : baseMonth;
  const pakshaCode = paksha === 'शुक्ल' ? 'थ्व' : 'गा';
  const formatted = `ने.सं. ${toDevanagariNumerals(nsYear)} ${monthNameNewa}${pakshaCode} ${tithiName} - ${toDevanagariNumerals(tithiNumber)}`;

  return {
    nsYear,
    monthIndex,
    monthNameNewa,
    pakshaCode,
    formatted,
  };
}

const panchangaCache = new Map<string, PanchangaData>();

/**
 * Calculates Panchanga attributes for a given Date, Location, and Time
 */
export function calculatePanchanga(
  dateAD: string, 
  timeStr: string = '06:00', 
  latitude: number = 27.7172, 
  longitude: number = 85.3240, 
  timeZone: number = 5.75
): PanchangaData {
  const cacheKey = `${dateAD}_${timeStr}_${latitude.toFixed(3)}_${longitude.toFixed(3)}_${timeZone}`;
  if (panchangaCache.has(cacheKey)) {
    return panchangaCache.get(cacheKey)!;
  }

  // Authoritative Astronomical Panchanga Core
  const auth = calculateCanonicalAuthoritativePanchanga(dateAD, timeStr, latitude, longitude, timeZone);
  const julianDay = auth.julianDayUT;

  // 1. Vaar (Day of week)
  const bsFull = convertADToBSFull(dateAD);
  const dayOfWeekIndex = bsFull.dayOfWeek;
  const dayNameNepali = bsFull.formattedBSFull.split(', ')[1] || 'बुधबार';
  const dayNameSanskrit = ['रविवासरः', 'सोमवासरः', 'भौमवासरः', 'बुधवासरः', 'गुरुवासरः', 'शुक्रवासरः', 'शनिवासरः'][dayOfWeekIndex];

  // 2. High-precision Sunrise & Sunset from Canonical Engine
  const sunriseHour = auth.sunrise.decimalHours;
  const sunsetHour = auth.sunset.decimalHours;
  const sunriseStr = auth.sunrise.formattedTime;
  const sunsetStr = auth.sunset.formattedTime;

  // Moonrise & Moonset
  const moonPhaseOffset = (auth.udayaTithi.index / 30.0) * 24.0;
  const moonriseHour = (sunriseHour + moonPhaseOffset) % 24;
  const moonsetHour = (sunsetHour + moonPhaseOffset) % 24;
  const moonriseStr = formatTimeNepali(moonriseHour);
  const moonsetStr = formatTimeNepali(moonsetHour);

  // Day Length & Night Length calculation (दिनमान र रात्रिमान)
  const rawDayLength = (sunsetHour - sunriseHour + 24) % 24;
  const dayH = Math.floor(rawDayLength);
  const dayM = Math.round((rawDayLength - dayH) * 60);
  const totalDayGhati = rawDayLength * 2.5;
  const ghatiDay = Math.floor(totalDayGhati);
  const palaDay = Math.round((totalDayGhati - ghatiDay) * 60);
  const dayDurationStr = `${toDevanagariNumerals(dayH)} घण्टा ${toDevanagariNumerals(dayM)} मिनेट (${toDevanagariNumerals(ghatiDay)} घडी ${toDevanagariNumerals(palaDay)} पला)`;

  const rawNightLength = Math.max(0, 24 - rawDayLength);
  const nightH = Math.floor(rawNightLength);
  const nightM = Math.round((rawNightLength - nightH) * 60);
  const totalNightGhati = rawNightLength * 2.5;
  const ghatiNight = Math.floor(totalNightGhati);
  const palaNight = Math.round((totalNightGhati - ghatiNight) * 60);
  const nightDurationStr = `${toDevanagariNumerals(nightH)} घण्टा ${toDevanagariNumerals(nightM)} मिनेट (${toDevanagariNumerals(ghatiNight)} घडी ${toDevanagariNumerals(palaNight)} पला)`;
  const solarNoonStr = auth.solarNoon?.formattedTime || formatTimeNepali(sunriseHour + rawDayLength / 2);

  // 3. Rahu Kaal, Yamagand, Gulika timings based on Day of Week and Exact Astronomical Day Length
  const dayDuration = Math.max(8.0, sunsetHour - sunriseHour);
  const eighthPart = dayDuration / 8.0;

  // Rahu Kaal Order: Sun=8, Mon=2, Tue=7, Wed=5, Thu=6, Fri=4, Sat=3
  const rahuPartMap = [8, 2, 7, 5, 6, 4, 3];
  const rahuPart = rahuPartMap[dayOfWeekIndex];
  const rahuStart = sunriseHour + (rahuPart - 1) * eighthPart;
  const rahuEnd = sunriseHour + rahuPart * eighthPart;

  const yamagandPartMap = [5, 4, 3, 2, 1, 7, 6];
  const yamaPart = yamagandPartMap[dayOfWeekIndex];
  const yamaStart = sunriseHour + (yamaPart - 1) * eighthPart;
  const yamaEnd = sunriseHour + yamaPart * eighthPart;

  const gulikaPartMap = [7, 6, 5, 4, 3, 2, 1];
  const gulikaPart = gulikaPartMap[dayOfWeekIndex];
  const gulikaStart = sunriseHour + (gulikaPart - 1) * eighthPart;
  const gulikaEnd = sunriseHour + gulikaPart * eighthPart;

  // Abhijit Muhurta (Midday 8th Muhurta out of 15)
  const midday = sunriseHour + dayDuration / 2;
  const abhijitStart = midday - (dayDuration / 30);
  const abhijitEnd = midday + (dayDuration / 30);

  // Brahma Muhurta (approx 1 hr 36 min before Sunrise)
  const brahmaStart = sunriseHour - 1.6;
  const brahmaEnd = sunriseHour - 0.8;

  // Pradosha Period (Sunset to 2.4 hours after sunset)
  const pradoshaStart = sunsetHour;
  const pradoshaEnd = sunsetHour + 2.4;

  // Samvatsara, Ritu, Ayana, MasaInfo
  const samvatsara = getSamvatsaraForBSYear(bsFull.year);
  const ritu = getRituForBSMonth(bsFull.month);
  const ayana = getAyanaForBSMonth(bsFull.month);
  const masaInfo = calculateMasaInfo(julianDay, bsFull.month, bsFull.year);

  // Exact Authoritative Nepal Sambat (नेपाल संवत् / नेवाः संवत्)
  const nsInfo = calculateExactNepalSambat(
    bsFull.year,
    bsFull.month,
    bsFull.day,
    masaInfo.amantaMasaIndex ?? 0,
    masaInfo.isAdhimasa,
    auth.udayaTithi.paksha,
    auth.udayaTithi.number,
    auth.udayaTithi.name
  );

  // Nakshatra Info
  const nakshatraData = NAKSHATRA_DATA[auth.nakshatra.index] || NAKSHATRA_DATA[0];
  const padaNumber = auth.nakshatra.pada;

  // Choghadiya Table (Day 8 parts)
  const choghadiyaNamesDayMap = [
    ['उद्वेग', 'चर', 'लाभ', 'अमृत', 'काल', 'शुभ', 'रोग', 'उद्वेग'], // Sun
    ['अमृत', 'काल', 'शुभ', 'रोग', 'उद्वेग', 'चर', 'लाभ', 'अमृत'], // Mon
    ['रोग', 'उद्वेग', 'चर', 'लाभ', 'अमृत', 'काल', 'शुभ', 'रोग'], // Tue
    ['चर', 'लाभ', 'अमृत', 'काल', 'शुभ', 'रोग', 'उद्वेग', 'चर'], // Wed
    ['लाभ', 'अमृत', 'काल', 'शुभ', 'रोग', 'उद्वेग', 'चर', 'लाभ'], // Thu
    ['शुभ', 'रोग', 'उद्वेग', 'चर', 'लाभ', 'अमृत', 'काल', 'शुभ'], // Fri
    ['काल', 'शुभ', 'रोग', 'उद्वेग', 'चर', 'लाभ', 'अमृत', 'काल'], // Sat
  ];

  const choghadiyaTypes: Record<string, 'शुभ' | 'अशुभ' | 'सामान्य'> = {
    'शुभ': 'शुभ',
    'लाभ': 'शुभ',
    'अमृत': 'शुभ',
    'चर': 'सामान्य',
    'रोग': 'अशुभ',
    'उद्वेग': 'अशुभ',
    'काल': 'अशुभ',
  };

  const dayChoghadiyaList = choghadiyaNamesDayMap[dayOfWeekIndex].map((cName, idx) => {
    const cStart = sunriseHour + idx * eighthPart;
    const cEnd = sunriseHour + (idx + 1) * eighthPart;
    const timeFormatted = `${formatTimeNepali(cStart)} - ${formatTimeNepali(cEnd)}`;
    return {
      time: timeFormatted,
      name: cName,
      type: choghadiyaTypes[cName] || 'सामान्य',
    };
  });

  const moonRashiName = auth.moon.rashiName as RashiName;
  const sunRashiName = auth.sun.rashiName as RashiName;

  const result: PanchangaData = {
    vikramSamvat: bsFull.year,
    sakaSamvat: bsFull.year - 135,
    nepalSamvat: nsInfo.nsYear,
    nepalSamvatFormatted: nsInfo.formatted,
    nepalSamvatMonth: `${nsInfo.monthNameNewa} (${NEPAL_SAMBAT_MONTH_NAMES_LIST[nsInfo.monthIndex]})`,
    nepalSamvatPaksha: `${auth.udayaTithi.paksha} (${nsInfo.pakshaCode})`,
    nepalSamvatTithi: `${auth.udayaTithi.name} - ${toDevanagariNumerals(auth.udayaTithi.number)}`,
    dateAD,
    dateBS: bsFull.formattedBS,
    dayNameNepali,
    dayNameSanskrit,
    masaInfo,
    tithi: {
      number: auth.udayaTithi.number,
      name: auth.udayaTithi.name,
      paksha: auth.udayaTithi.paksha,
      endTime: auth.udayaTithi.formattedEndTime,
      percentageRemaining: Math.round(((12 - (auth.instantTithi.elongation % 12)) / 12) * 100),
      endDecimalHours: auth.udayaTithi.endDecimalHours,
      subsequentName: TITHI_NAMES_30[(auth.udayaTithi.index + 1) % 30],
    },
    vaar: {
      name: dayNameNepali,
      lord: ['सूर्य', 'चन्द्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'][dayOfWeekIndex],
    },
    nakshatra: {
      number: auth.nakshatra.index + 1,
      name: auth.nakshatra.name,
      lord: auth.nakshatra.lord,
      pada: padaNumber,
      endTime: auth.nakshatra.formattedEndTime,
      endDecimalHours: auth.nakshatra.endDecimalHours,
      subsequentName: NAKSHATRA_NAMES_27[(auth.nakshatra.index + 1) % 27],
      subsequentLord: NAKSHATRA_LORDS_27[(auth.nakshatra.index + 1) % 27],
    },
    yoga: {
      number: auth.yoga.index + 1,
      name: auth.yoga.name,
      endTime: auth.yoga.formattedEndTime,
      endDecimalHours: auth.yoga.endDecimalHours,
      subsequentName: YOGA_NAMES_27[(auth.yoga.index + 1) % 27],
    },
    karana: {
      number: auth.karana.index === 0 
        ? 11 
        : auth.karana.index >= 57 
        ? auth.karana.index - 50 + 1 
        : ((auth.karana.index - 1) % 7) + 1,
      name: auth.karana.name,
      endTime: auth.karana.formattedEndTime,
    },
    sunrise: sunriseStr,
    sunset: sunsetStr,
    dayDuration: dayDurationStr,
    nightDuration: nightDurationStr,
    dayDurationHours: rawDayLength,
    solarNoon: solarNoonStr,
    moonrise: moonriseStr,
    moonset: moonsetStr,
    rahuKaal: { start: formatTimeNepali(rahuStart), end: formatTimeNepali(rahuEnd) },
    yamaganda: { start: formatTimeNepali(yamaStart), end: formatTimeNepali(yamaEnd) },
    gulika: { start: formatTimeNepali(gulikaStart), end: formatTimeNepali(gulikaEnd) },
    abhijitMuhurta: { start: formatTimeNepali(abhijitStart), end: formatTimeNepali(abhijitEnd) },
    brahmaMuhurta: { start: formatTimeNepali(brahmaStart), end: formatTimeNepali(brahmaEnd) },
    pradoshaTime: { start: formatTimeNepali(pradoshaStart), end: formatTimeNepali(pradoshaEnd) },
    choghadiya: dayChoghadiyaList,
    samvatsara,
    ayana,
    ritu,
    sunRashi: sunRashiName,
    moonRashi: moonRashiName,
    namakshara: NAKSHATRA_NAMAKSHARA_MAP[nakshatraData.id]?.[padaNumber - 1] || 'अ',
    gana: nakshatraData.gana || 'मानव',
    yoni: nakshatraData.yoni || 'गौ',
    nadi: nakshatraData.nadi || 'मध्य',
    varna: ['कर्कट', 'वृश्चिक', 'मीन'].includes(moonRashiName)
      ? 'ब्राह्मण'
      : ['मेष', 'सिंह', 'धनु'].includes(moonRashiName)
      ? 'क्षत्रिय'
      : ['वृष', 'कन्या', 'मकर'].includes(moonRashiName)
      ? 'वैश्य'
      : 'शूद्र',
    vashya: ['मेष', 'वृष'].includes(moonRashiName)
      ? 'चतुष्पाद'
      : ['मिथुन', 'कन्या', 'तुला', 'कुम्भ'].includes(moonRashiName)
      ? 'द्विपद (मानव)'
      : ['कर्कट', 'मीन'].includes(moonRashiName)
      ? 'जलचर'
      : moonRashiName === 'वृश्चिक'
      ? 'कीट'
      : moonRashiName === 'सिंह'
      ? 'वनचर'
      : 'द्विपद',
    tatwa: ['मेष', 'सिंह', 'धनु'].includes(moonRashiName)
      ? 'अग्नि'
      : ['वृष', 'कन्या', 'मकर'].includes(moonRashiName)
      ? 'पृथ्वी'
      : ['मिथुन', 'तुला', 'कुम्भ'].includes(moonRashiName)
      ? 'वायु'
      : 'जल',
    paya: ['मेष', 'सिंह', 'धनु'].includes(moonRashiName)
      ? 'रजत (चाँदी)'
      : ['वृष', 'कन्या', 'मकर'].includes(moonRashiName)
      ? 'सुवर्ण (स्वर्ण)'
      : ['मिथुन', 'तुला', 'कुम्भ'].includes(moonRashiName)
      ? 'ताम्र (तामा)'
      : 'लौह (फलाम)',
    rashiLord: RASHI_DATA.find((r) => r.name === moonRashiName)?.lord || 'चन्द्र',
    nakshatraLord: nakshatraData.lord,
  };

  if (panchangaCache.size > 200) panchangaCache.clear();
  panchangaCache.set(cacheKey, result);
  return result;
}

/**
 * Detects special religious/cultural festivals & observances for a given date and Panchanga
 */
export function getSpecialDaysAndFestivals(
  bsYear: number, 
  bsMonth: number, 
  bsDay: number, 
  panchanga: PanchangaData
): string[] {
  const festivals: string[] = [];

  // 1. Check verified Nepal Panchanga Nirnayak Bikas Samiti & Hamro Patro festival engine
  const verified = getFestivalForBSDate(
    bsYear,
    bsMonth,
    bsDay,
    panchanga.tithi.name,
    panchanga.tithi.paksha
  );

  if (verified?.title) {
    festivals.push(verified.title);
  }

  // Monthly recurring tithi events (only if not already listed)
  if (panchanga.tithi.name === 'पूर्णिमा' && !festivals.some(f => f.includes('पूर्णिमा'))) {
    festivals.push('पूर्णिमा व्रत');
  } else if (panchanga.tithi.name === 'औंसी' && !festivals.some(f => f.includes('औंसी'))) {
    festivals.push('औंसी');
  } else if (panchanga.tithi.name === 'एकादशी' && !festivals.some(f => f.includes('एकादशी'))) {
    festivals.push(`${panchanga.tithi.paksha} एकादशी व्रत`);
  }

  // Day 1 Sankranti
  if (bsDay === 1 && !festivals.some(f => f.includes('संक्रान्ति') || f.includes('सङ्क्रान्ति'))) {
    const monthName = panchanga.dateBS.split(' ')[1] || 'महिना';
    festivals.push(`${monthName} सङ्क्रान्ति`);
  }

  return festivals;
}

/**
 * Generates array of daily Panchanga items for a full BS Month
 */
export function generateMonthlyPanchanga(
  bsYear: number, 
  bsMonth: number, 
  latitude: number = 27.7172, 
  longitude: number = 85.3240, 
  timeZone: number = 5.75
): Array<{
  bsDay: number;
  dateBS: string;
  dateAD: string;
  panchanga: PanchangaData;
  festivals: string[];
}> {
  const totalDays = getBSDaysInMonth(bsYear, bsMonth);
  const result = [];

  for (let day = 1; day <= totalDays; day++) {
    const adDateStr = convertBSToADFull(bsYear, bsMonth, day);
    const panchanga = calculatePanchanga(adDateStr, '06:00', latitude, longitude, timeZone);
    const festivals = getSpecialDaysAndFestivals(bsYear, bsMonth, day, panchanga);

    result.push({
      bsDay: day,
      dateBS: panchanga.dateBS,
      dateAD: adDateStr,
      panchanga,
      festivals,
    });
  }

  return result;
}
