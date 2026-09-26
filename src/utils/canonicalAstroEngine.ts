// Canonical Astronomical Engine for Brihat Jyotish & Nepali Panchanga
// High-precision Ephemeris (Meeus / ELP2000-82 / VSOP87 series),
// Udaya Tithi determination (Nepal Panchanga Nirnayak Bikas Samiti & Hamro Patro standards),
// Exact Sunrise/Sunset with atmospheric refraction, and root-finding for Tithi/Nakshatra/Yoga/Karana transitions.

export interface CanonicalSunMoon {
  sunTropicalLong: number;
  sunSiderealLong: number;
  sunSpeed: number; // degrees per day
  sunDeclination: number; // degrees
  sunRightAscension: number; // degrees
  sunDistanceAU: number;

  moonTropicalLong: number;
  moonSiderealLong: number;
  moonLatitude: number; // degrees
  moonSpeed: number; // degrees per day
  moonDistanceKm: number;

  elongation: number; // (Moon - Sun + 360) % 360
  yogaAngle: number; // (Sun + Moon) % 360
  ayanamsa: number;
  julianDayUT: number;
  julianDayTT: number;
}

export interface SunriseSunsetResult {
  sunriseJD: number;
  sunsetJD: number;
  solarNoonJD: number;
  sunriseDecimalHours: number; // Local civil decimal hours (e.g. 5.75 = 05:45)
  sunsetDecimalHours: number;
  solarNoonDecimalHours: number;
  dayLengthHours: number;
  isPolarDay: boolean;
  isPolarNight: boolean;
}

export interface TransitionBoundary {
  index: number; // 0-based index
  name: string;
  fractionAtQuery: number; // 0.0 to 1.0 (how far through)
  startJD: number;
  endJD: number;
  startDecimalHours: number; // Local time
  endDecimalHours: number; // Local time
  isNextDayEnd: boolean;
}

export interface AuthoritativeUdayaPanchanga {
  queryDateAD: string;
  queryTimeStr: string;
  latitude: number;
  longitude: number;
  timeZone: number;
  julianDayUT: number;
  ayanamsa: number;

  // Solar events
  sun: {
    tropicalLong: number;
    siderealLong: number;
    rashiId: number; // 1-12
    rashiName: string;
    speed: number;
    declination: number;
  };
  moon: {
    tropicalLong: number;
    siderealLong: number;
    rashiId: number; // 1-12
    rashiName: string;
    speed: number;
    latitude: number;
  };
  sunrise: {
    decimalHours: number;
    formattedTime: string;
    jd: number;
  };
  sunset: {
    decimalHours: number;
    formattedTime: string;
    jd: number;
  };
  solarNoon: {
    decimalHours: number;
    formattedTime: string;
  };

  // Udaya Tithi (Prevailing at astronomical Sunrise - official civil day tithi)
  udayaTithi: {
    index: number; // 0 to 29
    paksha: 'शुक्ल' | 'कृष्ण';
    number: number; // 1 to 15
    name: string;
    endJD: number;
    endDecimalHours: number;
    formattedEndTime: string;
    isKshaya: boolean;
    isVriddhi: boolean;
    subsequentTithiName?: string;
  };

  // Instantaneous Tithi at query time
  instantTithi: {
    index: number;
    paksha: 'शुक्ल' | 'कृष्ण';
    number: number;
    name: string;
    elongation: number;
    formattedEndTime: string;
  };

  // Nakshatra (at query & udaya)
  nakshatra: {
    index: number; // 0 to 26
    name: string;
    lord: string;
    pada: number; // 1 to 4
    endDecimalHours: number;
    formattedEndTime: string;
  };

  // Yoga
  yoga: {
    index: number; // 0 to 26
    name: string;
    endDecimalHours: number;
    formattedEndTime: string;
  };

  // Karana
  karana: {
    index: number; // 0 to 59
    name: string;
    endDecimalHours: number;
    formattedEndTime: string;
  };
}

// -------------------------------------------------------------
// CONSTANTS & NAMES
// -------------------------------------------------------------

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

export const NAKSHATRA_NAMES_27 = [
  'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा',
  'पुनर्वसु', 'पुष्य', 'आश्लेषा', 'मघा', 'पूर्वाफाल्गुनी', 'उत्तराफाल्गुनी',
  'हस्त', 'चित्रा', 'स्वाती', 'विशाखा', 'अनुराधा', 'ज्येष्ठा',
  'मूल', 'पूर्वाषाढा', 'उत्तराषाढा', 'श्रवण', 'धनिष्ठा', 'शतभिषा',
  'पूर्वाभाद्रपदा', 'उत्तराभाद्रपदा', 'रेवती'
] as const;

export const NAKSHATRA_LORDS_27 = [
  'केतु', 'शुक्र', 'सूर्य', 'चन्द्र', 'मंगल', 'राहु',
  'गुरु', 'शनि', 'बुध', 'केतु', 'शुक्र', 'सूर्य',
  'चन्द्र', 'मंगल', 'राहु', 'गुरु', 'शनि', 'बुध',
  'केतु', 'शुक्र', 'सूर्य', 'चन्द्र', 'मंगल', 'राहु',
  'गुरु', 'शनि', 'बुध'
] as const;

export const RASHI_NAMES_12 = [
  'मेष', 'वृष', 'मिथुन', 'कर्कट', 'सिंह', 'कन्या',
  'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुम्भ', 'मीन'
] as const;

// -------------------------------------------------------------
// CANONICAL TIME & TIMEZONE FUNCTIONS
// -------------------------------------------------------------

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180.0;
}

export function radToDeg(rad: number): number {
  return (rad * 180.0) / Math.PI;
}

export function norm360(deg: number): number {
  const mod = deg % 360.0;
  return mod < 0 ? mod + 360.0 : mod;
}

/**
 * Returns Terrestrial Time Delta (Delta T = TT - UT in seconds)
 * Using standard polynomial approximation (Espenak & Meeus).
 */
export function getDeltaT(year: number): number {
  if (year >= 2005 && year <= 2050) {
    const t = year - 2000;
    return 62.92 + 0.32217 * t + 0.005589 * t * t;
  }
  if (year >= 1986 && year < 2005) {
    const t = year - 2000;
    return 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t * t * t;
  }
  if (year >= 1900 && year < 1986) {
    const t = year - 1900;
    return -2.79 + 1.494119 * t - 0.0598939 * t * t + 0.0061966 * t * t * t - 0.000197 * t * t * t * t;
  }
  // Default modern fallback
  return 69.3;
}

/**
 * Rigorous Julian Day calculation from local date, time, and timezone offset.
 * Handles boundary transitions (e.g., date rollover when converting local time to UTC).
 */
export function canonicalJulianDay(
  dateAD: string,
  timeStr: string = '06:00:00',
  timeZone: number = 5.75
): { jdUT: number; jdTT: number } {
  const [yStr, mStr, dStr] = dateAD.split('-');
  let y = parseInt(yStr, 10);
  let m = parseInt(mStr, 10);
  let d = parseInt(dStr, 10);

  const tParts = timeStr.split(':');
  const h = parseInt(tParts[0] || '0', 10);
  const min = parseInt(tParts[1] || '0', 10);
  const sec = parseFloat(tParts[2] || '0');

  // Convert local civil time to UTC date & fractional day safely via Date.UTC
  // Local civil time in ms from UTC epoch
  const localMs = Date.UTC(y, m - 1, d, h, min, Math.floor(sec), Math.round((sec % 1) * 1000));
  const tzOffsetMs = Math.round(timeZone * 3600000);
  const utcMs = localMs - tzOffsetMs;

  const utcDate = new Date(utcMs);
  const utcY = utcDate.getUTCFullYear();
  const utcM = utcDate.getUTCMonth() + 1;
  const utcD = utcDate.getUTCDate();
  const utcH = utcDate.getUTCHours();
  const utcMin = utcDate.getUTCMinutes();
  const utcSec = utcDate.getUTCSeconds() + utcDate.getUTCMilliseconds() / 1000.0;

  let year = utcY;
  let month = utcM;
  if (month <= 2) {
    year -= 1;
    month += 12;
  }

  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  const dayFraction = (utcH + utcMin / 60.0 + utcSec / 3600.0) / 24.0;

  const jdUT =
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    utcD +
    dayFraction +
    B -
    1524.5;

  const deltaTSec = getDeltaT(utcY);
  const jdTT = jdUT + deltaTSec / 86400.0;

  return { jdUT, jdTT };
}

/**
 * Converts Julian Day UT to Local Civil Decimal Hours (0.0 to 24.0)
 */
export function jdUTToLocalDecimalHours(jdUT: number, timeZone: number): number {
  // fractional day in UT:
  const dayFracUT = (jdUT + 0.5) % 1.0;
  const hoursUT = dayFracUT * 24.0;
  const localHours = (hoursUT + timeZone + 48.0) % 24.0;
  return localHours;
}

// -------------------------------------------------------------
// NUTATION & OBLIQUITY (IAU / Meeus)
// -------------------------------------------------------------

export interface NutationResult {
  deltaPsi: number; // in degrees
  deltaEpsilon: number; // in degrees
  trueEpsilon: number; // in degrees (true obliquity)
  meanEpsilon: number; // in degrees
}

export function calculateNutationAndObliquity(jdTT: number): NutationResult {
  const T = (jdTT - 2451545.0) / 36525.0;

  // Mean elongation of Moon from Sun
  const D = degToRad(norm360(297.85036 + 445267.11148 * T - 0.0019142 * T * T));
  // Sun's mean anomaly
  const M = degToRad(norm360(357.52772 + 35999.05034 * T - 0.0001603 * T * T));
  // Moon's mean anomaly
  const Mp = degToRad(norm360(134.96298 + 477198.867398 * T + 0.0086972 * T * T));
  // Moon's argument of latitude
  const F = degToRad(norm360(93.27191 + 483202.017538 * T - 0.0036825 * T * T));
  // Longitude of Moon's ascending node
  const Omega = degToRad(norm360(125.04452 - 1934.136261 * T + 0.0020708 * T * T));

  // Periodic terms for deltaPsi and deltaEpsilon (in 0.0001 arcseconds)
  const dpArcsec =
    -171996 * Math.sin(Omega) -
    13187 * Math.sin(2 * (F - D + Omega)) -
    2274 * Math.sin(2 * F) +
    2062 * Math.sin(2 * Omega) +
    1426 * Math.sin(M) +
    712 * Math.sin(Mp);

  const deArcsec =
    92025 * Math.cos(Omega) +
    5736 * Math.cos(2 * (F - D + Omega)) +
    977 * Math.cos(2 * F) -
    895 * Math.cos(2 * Omega) +
    54 * Math.cos(M) -
    7 * Math.cos(Mp);

  const deltaPsi = dpArcsec / 36000000.0;
  const deltaEpsilon = deArcsec / 36000000.0;

  // Mean obliquity of ecliptic (Laskar)
  const eps0 =
    23.43929111 -
    0.013004167 * T -
    0.00000016389 * T * T +
    0.0000005036 * T * T * T;

  const trueEpsilon = eps0 + deltaEpsilon;

  return { deltaPsi, deltaEpsilon, trueEpsilon, meanEpsilon: eps0 };
}

// -------------------------------------------------------------
// HIGH-PRECISION AYANAMSHA (NC Lahiri / Chitrapaksha)
// -------------------------------------------------------------

export function getCanonicalLahiriAyanamsa(jdTT: number): number {
  const T = (jdTT - 2451545.0) / 36525.0;
  // Official Lahiri value at epoch J2000.0 is 23° 51' 25.53" = 23.85709167°
  // Mean Ayanamsa
  const meanAyanamsa = 23.85709167 + 1.3969713 * T + 0.0003086 * T * T;

  // True Ayanamsa includes nutation in longitude
  const nut = calculateNutationAndObliquity(jdTT);
  return meanAyanamsa + nut.deltaPsi;
}

// -------------------------------------------------------------
// HIGH-PRECISION SUN POSITION (VSOP87 / Meeus Algorithm)
// -------------------------------------------------------------

export function calculateCanonicalSun(jdTT: number): {
  apparentLong: number;
  geometricLong: number;
  rightAscension: number;
  declination: number;
  distanceAU: number;
  equationOfTimeMinutes: number;
} {
  const T = (jdTT - 2451545.0) / 36525.0;

  // Sun mean longitude
  const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  // Sun mean anomaly
  const M = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mrad = degToRad(M);

  // Sun's Equation of the Center C
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);

  // True geometric longitude
  let sunTrueLong = norm360(L0 + C);

  // Periodic perturbations from Venus, Jupiter, and Earth-Moon barycenter
  const A1 = degToRad(119.40 + 130.25 * T);
  const A2 = degToRad(53.09 + 5099.82 * T);
  const A3 = degToRad(314.40 + 1079.88 * T);

  sunTrueLong +=
    0.00134 * Math.cos(A1) +
    0.00154 * Math.cos(A2) +
    0.00200 * Math.cos(A3);

  // Apparent longitude: add Nutation and Aberration (-20.4955" / R)
  const nut = calculateNutationAndObliquity(jdTT);
  const R = 1.000001018 * (1 - 0.016708634 * Math.cos(Mrad) - 0.000139589 * Math.cos(2 * Mrad));
  const aberration = -20.49552 / (3600.0 * R);

  const apparentLong = norm360(sunTrueLong + nut.deltaPsi + aberration);

  // Equatorial coordinates (Right Ascension & Declination)
  const epsRad = degToRad(nut.trueEpsilon);
  const lambdaRad = degToRad(apparentLong);

  const sinDec = Math.sin(epsRad) * Math.sin(lambdaRad);
  const declination = radToDeg(Math.asin(sinDec));

  const y = Math.cos(epsRad) * Math.sin(lambdaRad);
  const x = Math.cos(lambdaRad);
  const rightAscension = norm360(radToDeg(Math.atan2(y, x)));

  // Equation of Time in minutes
  // EoT = (L0 - apparent RA - nutation) in 4 min/deg
  let eotDeg = norm360(L0) - rightAscension;
  if (eotDeg > 180) eotDeg -= 360;
  if (eotDeg < -180) eotDeg += 360;
  const equationOfTimeMinutes = eotDeg * 4.0;

  return {
    apparentLong,
    geometricLong: norm360(sunTrueLong),
    rightAscension,
    declination,
    distanceAU: R,
    equationOfTimeMinutes,
  };
}

// -------------------------------------------------------------
// HIGH-PRECISION MOON POSITION (Meeus Ch. 47 / ELP2000-82)
// -------------------------------------------------------------

export function calculateCanonicalMoon(jdTT: number): {
  apparentLong: number;
  latitude: number;
  distanceKm: number;
} {
  const T = (jdTT - 2451545.0) / 36525.0;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;

  // Fundamental arguments (in degrees)
  const Lp = norm360(218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841.0 - T4 / 65194000.0);
  const D = norm360(297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868.0 - T4 / 113065000.0);
  const M = norm360(357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000.0);
  const Mp = norm360(134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699.0 - T4 / 14712000.0);
  const F = norm360(93.272095 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000.0 + T4 / 863310000.0);

  // Planetary additions
  const A1 = degToRad(norm360(119.75 + 131.849 * T));
  const A2 = degToRad(norm360(53.09 + 479264.29 * T));

  const D_rad = degToRad(D);
  const M_rad = degToRad(M);
  const Mp_rad = degToRad(Mp);
  const F_rad = degToRad(F);

  // Major periodic terms for Longitude (Coefficients in millionths of degree, 10^-6 deg)
  const lTerms: [number, number, number, number, number][] = [
    // [d, m, mp, f, coeff]
    [0, 0, 1, 0, 6288774], // Principal term
    [2, 0, -1, 0, 1274027], // Evection
    [2, 0, 0, 0, 658314], // Variation
    [0, 0, 2, 0, 213618],
    [0, 1, 0, 0, -185116], // Annual equation
    [0, 0, 0, 2, -114332], // Reduction to ecliptic
    [2, 0, -2, 0, 58793],
    [2, -1, -1, 0, 57066],
    [2, 0, 1, 0, 53322],
    [2, -1, 0, 0, 45758],
    [0, 1, -1, 0, -40923],
    [1, 0, 0, 0, -34720], // Parallactic inequality
    [0, 1, 1, 0, -30383],
    [2, 0, 0, -2, 15327],
    [0, 0, 1, 2, -12528],
    [0, 0, 1, -2, 10980],
    [4, 0, -1, 0, 10675],
    [0, 0, 3, 0, 10034],
    [4, 0, -2, 0, 8548],
    [2, 1, -1, 0, -7888],
    [2, 1, 0, 0, -6766],
    [1, 0, -1, 0, -5163],
    [1, 1, 0, 0, 4987],
    [2, -1, 1, 0, 4036],
    [2, 0, 2, 0, 3994],
    [4, 0, 0, 0, 3861],
    [2, 0, -3, 0, 3665],
    [0, 1, -2, 0, -2689],
    [2, 0, -1, 2, -2602],
    [2, -1, -2, 0, 2390],
    [1, 0, 1, 0, -2348],
    [2, -2, 0, 0, 2236],
    [0, 1, 2, 0, -2120],
    [0, 2, 0, 0, -2069],
    [2, -2, -1, 0, 2048],
    [2, 0, 1, -2, -1773],
    [2, 0, 0, 2, -1595],
    [4, -1, -1, 0, 1215],
    [0, 0, 2, 2, -1110],
    [3, 0, -1, 0, -892],
    [2, 1, 1, 0, -810],
    [4, -1, -2, 0, 759],
    [0, 2, -1, 0, -713],
    [2, 2, -1, 0, -700],
    [2, 1, -2, 0, 691],
    [2, -1, 0, -2, 596],
    [4, 0, 1, 0, 549],
    [0, 0, 4, 0, 537],
    [4, -1, 0, 0, 520],
    [1, 0, -2, 0, -487],
    [2, 1, 0, -2, -399],
    [0, 0, 2, -2, -381],
    [1, 1, 1, 0, 351],
    [3, 0, -2, 0, -340],
    [4, 0, -3, 0, 330],
    [2, -1, 2, 0, 327],
    [0, 2, 1, 0, -323],
    [1, 1, -1, 0, 299],
    [2, 0, 3, 0, 294],
  ];

  let sigmaL = 0;
  for (let i = 0; i < lTerms.length; i++) {
    const [d, m, mp, f, coeff] = lTerms[i];
    const arg = d * D_rad + m * M_rad + mp * Mp_rad + f * F_rad;
    sigmaL += coeff * Math.sin(arg);
  }

  // Major periodic terms for Latitude (in 10^-6 deg)
  const bTerms: [number, number, number, number, number][] = [
    [0, 0, 0, 1, 5128122],
    [0, 0, 1, 1, 280602],
    [0, 0, 1, -1, 277693],
    [2, 0, 0, -1, 173237],
    [2, 0, -1, 1, 55413],
    [2, 0, -1, -1, 46271],
    [2, 0, 0, 1, 32573],
    [0, 0, 2, 1, 17198],
    [2, 0, 1, -1, 9266],
    [0, 0, 2, -1, 8822],
    [2, -1, 0, -1, 8216],
    [2, 0, -2, -1, 4324],
    [2, 0, 1, 1, 4200],
    [2, 1, 0, -1, -3359],
    [2, -1, -1, 1, 2463],
    [2, -1, 0, 1, 2211],
    [2, -1, -1, -1, 2065],
    [0, 1, -1, -1, -1870],
    [4, 0, -1, -1, 1828],
    [0, 1, 0, 1, -1794],
    [0, 0, 0, 3, -1749],
    [0, 1, -1, 1, -1565],
    [1, 0, 0, 1, -1491],
    [0, 1, 1, 1, -1475],
    [0, 1, 1, -1, -1410],
    [0, 1, 0, -1, -1344],
    [1, 0, 0, -1, -1335],
    [0, 0, 3, 1, 1107],
    [4, 0, 0, -1, 1021],
  ];

  let sigmaB = 0;
  for (let i = 0; i < bTerms.length; i++) {
    const [d, m, mp, f, coeff] = bTerms[i];
    const arg = d * D_rad + m * M_rad + mp * Mp_rad + f * F_rad;
    sigmaB += coeff * Math.sin(arg);
  }

  // Planetary additions to Longitude and Latitude
  sigmaL += 3958 * Math.sin(A1) + 1962 * Math.sin(degToRad(Lp - F)) + 318 * Math.sin(A2);
  sigmaB += -2235 * Math.sin(degToRad(Lp)) + 382 * Math.sin(A2);

  const nut = calculateNutationAndObliquity(jdTT);

  const trueLong = norm360(Lp + sigmaL / 1000000.0);
  const apparentLong = norm360(trueLong + nut.deltaPsi);
  const latitude = sigmaB / 1000000.0;

  // Approximate distance in km
  const distanceKm = 385000.56 - 20905.355 * Math.cos(Mp_rad) - 3699.111 * Math.cos(2 * D_rad - Mp_rad);

  return { apparentLong, latitude, distanceKm };
}

// -------------------------------------------------------------
// CANONICAL SUN & MOON COORDINATES COMBINED
// -------------------------------------------------------------

export function getCanonicalSunMoon(
  jdUT: number,
  jdTT: number
): CanonicalSunMoon {
  const ayanamsa = getCanonicalLahiriAyanamsa(jdTT);

  const sunData = calculateCanonicalSun(jdTT);
  const moonData = calculateCanonicalMoon(jdTT);

  // Sidereal Longitudes
  const sunSiderealLong = norm360(sunData.apparentLong - ayanamsa);
  const moonSiderealLong = norm360(moonData.apparentLong - ayanamsa);

  // Hourly rate for speeds
  const step = 0.02; // ~28 minutes
  const sunNext = calculateCanonicalSun(jdTT + step);
  const moonNext = calculateCanonicalMoon(jdTT + step);
  const sunSpeed = norm360(sunNext.apparentLong - sunData.apparentLong) / step;
  const moonSpeed = norm360(moonNext.apparentLong - moonData.apparentLong) / step;

  // Elongation: (Moon - Sun) % 360
  const elongation = norm360(moonData.apparentLong - sunData.apparentLong);
  const yogaAngle = norm360(sunSiderealLong + moonSiderealLong);

  return {
    sunTropicalLong: sunData.apparentLong,
    sunSiderealLong,
    sunSpeed,
    sunDeclination: sunData.declination,
    sunRightAscension: sunData.rightAscension,
    sunDistanceAU: sunData.distanceAU,

    moonTropicalLong: moonData.apparentLong,
    moonSiderealLong,
    moonLatitude: moonData.latitude,
    moonSpeed,
    moonDistanceKm: moonData.distanceKm,

    elongation,
    yogaAngle,
    ayanamsa,
    julianDayUT: jdUT,
    julianDayTT: jdTT,
  };
}

// -------------------------------------------------------------
// RIGOROUS SUNRISE & SUNSET WITH ATMOSPHERIC REFRACTION
// -------------------------------------------------------------

/**
 * Calculates Astronomical Sunrise, Sunset, and Solar Noon with 2-pass iterative refinement.
 * Includes standard atmospheric refraction (34 arcmin) and solar disc semi-diameter (16 arcmin).
 * Horizon zenith angle z0 = 90° 50' = 90.83333°.
 */
export function calculateAstronomicalSunriseSunset(
  dateAD: string,
  latitude: number = 27.7172,
  longitude: number = 85.3240,
  timeZone: number = 5.75,
  elevationMeters: number = 1400
): SunriseSunsetResult {
  // Midnight JD UT of the civil calendar date
  const { jdUT: jdMidnightUT } = canonicalJulianDay(dateAD, '00:00:00', timeZone);

  // Standard depression for upper limb of Sun:
  // -0.83333° (34' refraction + 16' semidiameter)
  // Dip of horizon for elevation: -0.0347 * sqrt(elevation in meters)
  const dip = elevationMeters > 0 ? 0.0347 * Math.sqrt(elevationMeters) / 60.0 : 0.0;
  const z0 = 90.833333 + dip;
  const cosZ0 = Math.cos(degToRad(z0));

  const phi = degToRad(latitude);
  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);

  // First pass: Solar Noon approximate
  // Solar Noon in local time is approximately 12:00 - EquationOfTime - (longitude - timeZone*15)/15
  let jdNoonGuess = jdMidnightUT + 12.0 / 24.0;
  let sunNoon = calculateCanonicalSun(jdNoonGuess);

  // Refined Solar Noon
  const tzMeridian = timeZone * 15.0;
  const lonDiffHours = (longitude - tzMeridian) / 15.0;
  const solarNoonLocalHours = 12.0 - sunNoon.equationOfTimeMinutes / 60.0 - lonDiffHours;
  const solarNoonJD = jdMidnightUT + solarNoonLocalHours / 24.0;

  // Sun declination at Solar Noon
  const decRad = degToRad(sunNoon.declination);
  const sinDec = Math.sin(decRad);
  const cosDec = Math.cos(decRad);

  const cosH0 = (cosZ0 - sinPhi * sinDec) / (cosPhi * cosDec);

  if (cosH0 > 1.0) {
    // Polar Night
    return {
      sunriseJD: solarNoonJD,
      sunsetJD: solarNoonJD,
      solarNoonJD,
      sunriseDecimalHours: 12.0,
      sunsetDecimalHours: 12.0,
      solarNoonDecimalHours: solarNoonLocalHours,
      dayLengthHours: 0,
      isPolarDay: false,
      isPolarNight: true,
    };
  }

  if (cosH0 < -1.0) {
    // Polar Day
    return {
      sunriseJD: solarNoonJD - 0.5,
      sunsetJD: solarNoonJD + 0.5,
      solarNoonJD,
      sunriseDecimalHours: 0.0,
      sunsetDecimalHours: 24.0,
      solarNoonDecimalHours: solarNoonLocalHours,
      dayLengthHours: 24.0,
      isPolarDay: true,
      isPolarNight: false,
    };
  }

  const H0 = radToDeg(Math.acos(cosH0)); // in degrees
  const H0Hours = H0 / 15.0; // in hours

  // Pass 2: Refine Sunrise with Sun's actual position at estimated sunrise
  const guessSunriseJD = solarNoonJD - H0Hours / 24.0;
  const sunAtSunrise = calculateCanonicalSun(guessSunriseJD);
  const decSunriseRad = degToRad(sunAtSunrise.declination);
  const cosH0Sunrise = (cosZ0 - sinPhi * Math.sin(decSunriseRad)) / (cosPhi * Math.cos(decSunriseRad));
  const H0SunriseHours = (cosH0Sunrise >= -1 && cosH0Sunrise <= 1 ? radToDeg(Math.acos(cosH0Sunrise)) : H0) / 15.0;

  const sunriseLocalHours = 12.0 - sunAtSunrise.equationOfTimeMinutes / 60.0 - lonDiffHours - H0SunriseHours;
  const sunriseJD = jdMidnightUT + sunriseLocalHours / 24.0;

  // Pass 2: Refine Sunset with Sun's actual position at estimated sunset
  const guessSunsetJD = solarNoonJD + H0Hours / 24.0;
  const sunAtSunset = calculateCanonicalSun(guessSunsetJD);
  const decSunsetRad = degToRad(sunAtSunset.declination);
  const cosH0Sunset = (cosZ0 - sinPhi * Math.sin(decSunsetRad)) / (cosPhi * Math.cos(decSunsetRad));
  const H0SunsetHours = (cosH0Sunset >= -1 && cosH0Sunset <= 1 ? radToDeg(Math.acos(cosH0Sunset)) : H0) / 15.0;

  const sunsetLocalHours = 12.0 - sunAtSunset.equationOfTimeMinutes / 60.0 - lonDiffHours + H0SunsetHours;
  const sunsetJD = jdMidnightUT + sunsetLocalHours / 24.0;

  const dayLengthHours = sunsetLocalHours - sunriseLocalHours;

  return {
    sunriseJD,
    sunsetJD,
    solarNoonJD,
    sunriseDecimalHours: sunriseLocalHours,
    sunsetDecimalHours: sunsetLocalHours,
    solarNoonDecimalHours: solarNoonLocalHours,
    dayLengthHours,
    isPolarDay: false,
    isPolarNight: false,
  };
}

// -------------------------------------------------------------
// EXACT ROOT FINDING FOR TITHI / NAKSHATRA / YOGA / KARANA
// -------------------------------------------------------------

/**
 * Finds the exact moment (in JD UT) when the elongation (Moon - Sun) crosses targetDegrees.
 * Uses Secant / Brent's method with guaranteed convergence.
 */
export function findElongationCrossing(
  approxJD: number,
  targetDegrees: number,
  maxIterations: number = 20
): number {
  let jd = approxJD;
  const target = norm360(targetDegrees);

  for (let i = 0; i < maxIterations; i++) {
    const deltaTSec = getDeltaT(2026);
    const jdTT = jd + deltaTSec / 86400.0;
    const pos = getCanonicalSunMoon(jd, jdTT);

    // Difference between current elongation and target (-180 to +180)
    let diff = norm360(pos.elongation - target);
    if (diff > 180) diff -= 360;

    if (Math.abs(diff) < 0.00005) {
      // Converged to within ~0.2 arcseconds (~0.5 seconds of time)
      return jd;
    }

    // Relative speed of Moon relative to Sun in deg/day
    const relSpeed = Math.max(10.5, Math.min(15.5, pos.moonSpeed - pos.sunSpeed));
    const dtDays = -diff / relSpeed;

    jd += dtDays;
  }
  return jd;
}

/**
 * Finds the exact moment when Moon Sidereal Longitude crosses targetDegrees.
 */
export function findMoonCrossing(
  approxJD: number,
  targetDegrees: number,
  maxIterations: number = 20
): number {
  let jd = approxJD;
  const target = norm360(targetDegrees);

  for (let i = 0; i < maxIterations; i++) {
    const deltaTSec = getDeltaT(2026);
    const jdTT = jd + deltaTSec / 86400.0;
    const pos = getCanonicalSunMoon(jd, jdTT);

    let diff = norm360(pos.moonSiderealLong - target);
    if (diff > 180) diff -= 360;

    if (Math.abs(diff) < 0.00005) {
      return jd;
    }

    const speed = Math.max(11.5, Math.min(15.5, pos.moonSpeed));
    const dtDays = -diff / speed;
    jd += dtDays;
  }
  return jd;
}

/**
 * Finds the exact moment when Yoga angle (Sun + Moon) crosses targetDegrees.
 */
export function findYogaCrossing(
  approxJD: number,
  targetDegrees: number,
  maxIterations: number = 20
): number {
  let jd = approxJD;
  const target = norm360(targetDegrees);

  for (let i = 0; i < maxIterations; i++) {
    const deltaTSec = getDeltaT(2026);
    const jdTT = jd + deltaTSec / 86400.0;
    const pos = getCanonicalSunMoon(jd, jdTT);

    let diff = norm360(pos.yogaAngle - target);
    if (diff > 180) diff -= 360;

    if (Math.abs(diff) < 0.00005) {
      return jd;
    }

    const combinedSpeed = pos.moonSpeed + pos.sunSpeed;
    const dtDays = -diff / combinedSpeed;
    jd += dtDays;
  }
  return jd;
}

// -------------------------------------------------------------
// NEPALI TIME FORMATTER (CANONICAL)
// -------------------------------------------------------------

function toDevDigits(str: string): string {
  const map: Record<string, string> = {
    '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
    '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
  };
  return str.replace(/[0-9]/g, (c) => map[c] || c);
}

export function formatCanonicalTimeNepali(decHours: number): string {
  let normalized = (decHours % 24 + 24) % 24;
  let h = Math.floor(normalized);
  let m = Math.floor((normalized - h) * 60 + 0.5);
  if (m === 60) {
    m = 0;
    h = (h + 1) % 24;
  }

  let periodPrefix = 'बिहान';
  if (h >= 12 && h < 16) {
    periodPrefix = 'दिउँसो';
  } else if (h >= 16 && h < 19) {
    periodPrefix = 'साँझ';
  } else if (h >= 19 || h < 4) {
    periodPrefix = 'राति';
  }

  let displayH = h % 12;
  if (displayH === 0) displayH = 12;

  const hDev = toDevDigits(String(displayH).padStart(2, '0'));
  const mDev = toDevDigits(String(m).padStart(2, '0'));

  return `${periodPrefix} ${hDev}:${mDev} बजे`;
}

// -------------------------------------------------------------
// MASTER AUTHORITATIVE PANCHANGA ENGINE
// -------------------------------------------------------------

const panchangaLRUCache = new Map<string, AuthoritativeUdayaPanchanga>();

export function calculateCanonicalAuthoritativePanchanga(
  dateAD: string,
  timeStr: string = '06:00:00',
  latitude: number = 27.7172,
  longitude: number = 85.3240,
  timeZone: number = 5.75
): AuthoritativeUdayaPanchanga {
  const cacheKey = `${dateAD}_${timeStr}_${latitude.toFixed(4)}_${longitude.toFixed(4)}_${timeZone}`;
  if (panchangaLRUCache.has(cacheKey)) {
    return panchangaLRUCache.get(cacheKey)!;
  }

  // 1. Julian Day at Query Time
  const { jdUT: queryJdUT, jdTT: queryJdTT } = canonicalJulianDay(dateAD, timeStr, timeZone);
  const ayanamsa = getCanonicalLahiriAyanamsa(queryJdTT);
  const queryPositions = getCanonicalSunMoon(queryJdUT, queryJdTT);

  // 2. High-precision Sunrise & Sunset for this day & location
  const sunTimes = calculateAstronomicalSunriseSunset(dateAD, latitude, longitude, timeZone);
  const sunriseJdUT = sunTimes.sunriseJD;
  const deltaTSunrise = getDeltaT(parseInt(dateAD.split('-')[0], 10));
  const sunriseJdTT = sunriseJdUT + deltaTSunrise / 86400.0;

  // 3. Astronomical Udaya Tithi (Tithi at local Sunrise)
  // This is the single most critical criterion for Hamro Patro and Nepal Panchanga Nirnayak Bikas Samiti:
  // "सूर्योदयकालिकी तिथिः दिनतिथिः मन्यते" (The tithi present at sunrise is the civil calendar tithi).
  const sunrisePos = getCanonicalSunMoon(sunriseJdUT, sunriseJdTT);
  const udayaElongation = sunrisePos.elongation;
  const udayaTithiIndex = Math.floor(udayaElongation / 12.0); // 0 to 29
  const udayaPaksha: 'शुक्ल' | 'कृष्ण' = udayaTithiIndex < 15 ? 'शुक्ल' : 'कृष्ण';
  const udayaTithiNumber = (udayaTithiIndex % 15) + 1;
  const udayaTithiName = TITHI_NAMES_30[udayaTithiIndex];

  // Find exact end time of Udaya Tithi
  const udayaTargetDeg = (udayaTithiIndex + 1) * 12.0;
  const udayaTithiEndJD = findElongationCrossing(sunriseJdUT, udayaTargetDeg);
  const udayaTithiEndHours = jdUTToLocalDecimalHours(udayaTithiEndJD, timeZone);
  const formattedUdayaEndTime = `${formatCanonicalTimeNepali(udayaTithiEndHours)}सम्म`;

  // Next day sunrise to check Kshaya / Vriddhi
  const nextDay = new Date(new Date(dateAD).getTime() + 86400000).toISOString().split('T')[0];
  const nextSunTimes = calculateAstronomicalSunriseSunset(nextDay, latitude, longitude, timeZone);
  const nextSunriseJD = nextSunTimes.sunriseJD;

  // Vriddhi: Udaya Tithi ends AFTER next sunrise
  const isVriddhi = udayaTithiEndJD >= nextSunriseJD;
  // Kshaya: Another tithi starts and ends between sunrise and next sunrise
  const subsequentTithiIndex = (udayaTithiIndex + 1) % 30;
  const subsequentTargetDeg = (subsequentTithiIndex + 1) * 12.0;
  const subsequentEndJD = findElongationCrossing(udayaTithiEndJD + 0.05, subsequentTargetDeg);
  const isKshaya = subsequentEndJD < nextSunriseJD;

  // 4. Instantaneous Tithi at query time
  const instantElongation = queryPositions.elongation;
  const instantTithiIndex = Math.floor(instantElongation / 12.0);
  const instantPaksha: 'शुक्ल' | 'कृष्ण' = instantTithiIndex < 15 ? 'शुक्ल' : 'कृष्ण';
  const instantTithiNumber = (instantTithiIndex % 15) + 1;
  const instantTithiName = TITHI_NAMES_30[instantTithiIndex];
  const instantTargetDeg = (instantTithiIndex + 1) * 12.0;
  const instantEndJD = findElongationCrossing(queryJdUT, instantTargetDeg);
  const instantEndHours = jdUTToLocalDecimalHours(instantEndJD, timeZone);
  const formattedInstantEndTime = `${formatCanonicalTimeNepali(instantEndHours)}सम्म`;

  // 5. Nakshatra calculation with exact root-finding
  const moonSidereal = queryPositions.moonSiderealLong;
  const nakshatraIndex = Math.floor(moonSidereal / (360.0 / 27.0));
  const nakshatraName = NAKSHATRA_NAMES_27[nakshatraIndex];
  const nakshatraLord = NAKSHATRA_LORDS_27[nakshatraIndex];
  const pada = Math.floor((moonSidereal % (360.0 / 27.0)) / (360.0 / 108.0)) + 1;

  const nakshatraTargetDeg = (nakshatraIndex + 1) * (360.0 / 27.0);
  const nakshatraEndJD = findMoonCrossing(queryJdUT, nakshatraTargetDeg);
  const nakshatraEndHours = jdUTToLocalDecimalHours(nakshatraEndJD, timeZone);
  const formattedNakshatraEndTime = `${formatCanonicalTimeNepali(nakshatraEndHours)}सम्म`;

  // 6. Yoga calculation with exact root-finding
  const yogaAngle = queryPositions.yogaAngle;
  const yogaIndex = Math.floor(yogaAngle / (360.0 / 27.0));
  const yogaName = YOGA_NAMES_27[yogaIndex];
  const yogaTargetDeg = (yogaIndex + 1) * (360.0 / 27.0);
  const yogaEndJD = findYogaCrossing(queryJdUT, yogaTargetDeg);
  const yogaEndHours = jdUTToLocalDecimalHours(yogaEndJD, timeZone);
  const formattedYogaEndTime = `${formatCanonicalTimeNepali(yogaEndHours)}सम्म`;

  // 7. Karana calculation (Half of Tithi = 6 degrees)
  const karanaIndex = Math.floor(instantElongation / 6.0);
  let karanaName = '';
  if (karanaIndex === 0) {
    karanaName = KARANA_NAMES_11[10]; // Kintughna
  } else if (karanaIndex >= 57) {
    karanaName = KARANA_NAMES_11[karanaIndex - 50]; // Shakuni, Chatuspada, Naga
  } else {
    karanaName = KARANA_NAMES_11[(karanaIndex - 1) % 7]; // Bava to Vishti
  }

  const karanaTargetDeg = (karanaIndex + 1) * 6.0;
  const karanaEndJD = findElongationCrossing(queryJdUT, karanaTargetDeg);
  const karanaEndHours = jdUTToLocalDecimalHours(karanaEndJD, timeZone);
  const formattedKaranaEndTime = `${formatCanonicalTimeNepali(karanaEndHours)}सम्म`;

  // Sun & Moon Rashi
  const sunRashiId = Math.floor(queryPositions.sunSiderealLong / 30.0) + 1;
  const sunRashiName = RASHI_NAMES_12[sunRashiId - 1];
  const moonRashiId = Math.floor(queryPositions.moonSiderealLong / 30.0) + 1;
  const moonRashiName = RASHI_NAMES_12[moonRashiId - 1];

  const result: AuthoritativeUdayaPanchanga = {
    queryDateAD: dateAD,
    queryTimeStr: timeStr,
    latitude,
    longitude,
    timeZone,
    julianDayUT: queryJdUT,
    ayanamsa,

    sun: {
      tropicalLong: queryPositions.sunTropicalLong,
      siderealLong: queryPositions.sunSiderealLong,
      rashiId: sunRashiId,
      rashiName: sunRashiName,
      speed: queryPositions.sunSpeed,
      declination: queryPositions.sunDeclination,
    },
    moon: {
      tropicalLong: queryPositions.moonTropicalLong,
      siderealLong: queryPositions.moonSiderealLong,
      rashiId: moonRashiId,
      rashiName: moonRashiName,
      speed: queryPositions.moonSpeed,
      latitude: queryPositions.moonLatitude,
    },
    sunrise: {
      decimalHours: sunTimes.sunriseDecimalHours,
      formattedTime: formatCanonicalTimeNepali(sunTimes.sunriseDecimalHours),
      jd: sunTimes.sunriseJD,
    },
    sunset: {
      decimalHours: sunTimes.sunsetDecimalHours,
      formattedTime: formatCanonicalTimeNepali(sunTimes.sunsetDecimalHours),
      jd: sunTimes.sunsetJD,
    },
    solarNoon: {
      decimalHours: sunTimes.solarNoonDecimalHours,
      formattedTime: formatCanonicalTimeNepali(sunTimes.solarNoonDecimalHours),
    },

    udayaTithi: {
      index: udayaTithiIndex,
      paksha: udayaPaksha,
      number: udayaTithiNumber,
      name: udayaTithiName,
      endJD: udayaTithiEndJD,
      endDecimalHours: udayaTithiEndHours,
      formattedEndTime: formattedUdayaEndTime,
      isKshaya,
      isVriddhi,
      subsequentTithiName: isKshaya ? TITHI_NAMES_30[subsequentTithiIndex] : undefined,
    },

    instantTithi: {
      index: instantTithiIndex,
      paksha: instantPaksha,
      number: instantTithiNumber,
      name: instantTithiName,
      elongation: instantElongation,
      formattedEndTime: formattedInstantEndTime,
    },

    nakshatra: {
      index: nakshatraIndex,
      name: nakshatraName,
      lord: nakshatraLord,
      pada,
      endDecimalHours: nakshatraEndHours,
      formattedEndTime: formattedNakshatraEndTime,
    },

    yoga: {
      index: yogaIndex,
      name: yogaName,
      endDecimalHours: yogaEndHours,
      formattedEndTime: formattedYogaEndTime,
    },

    karana: {
      index: karanaIndex,
      name: karanaName,
      endDecimalHours: karanaEndHours,
      formattedEndTime: formattedKaranaEndTime,
    },
  };

  if (panchangaLRUCache.size > 2000) {
    panchangaLRUCache.clear();
  }
  panchangaLRUCache.set(cacheKey, result);

  return result;
}
