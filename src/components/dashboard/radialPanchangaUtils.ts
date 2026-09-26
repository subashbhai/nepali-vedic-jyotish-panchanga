import { PanchangaData } from '../../types/astrology';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';

export interface RingSegment {
  id: string;
  name: string;
  startHour: number; // 0 to 24
  endHour: number;   // 0 to 24
  color: string;
  gradientId: string;
  secondaryInfo?: string;
  detail?: string;
  badge?: string;
  isAuspicious?: boolean;
}

export interface TransitionDetail {
  id: string;
  element: 'nakshatra' | 'yoga' | 'tithi';
  elementLabel: string;
  currentName: string;
  nextName: string;
  transitionHour: number; // 0 to 24
  transitionTimeFormatted: string; // e.g. दिउँसो ०४:२५ बजे
  timeStr: string; // e.g. १६:२५
  isUpcomingAt: (hour: number) => boolean;
  getTimeRemainingFrom: (hour: number) => {
    isUpcoming: boolean;
    diffHours: number;
    hours: number;
    minutes: number;
    text: string;
    shortText: string;
  };
  secondaryNote?: string;
  badge?: string;
  color?: string;
}

export interface PanchangaProgressionData {
  tithiSegments: RingSegment[];
  nakshatraSegments: RingSegment[];
  yogaSegments: RingSegment[];
  sunriseHour: number;
  sunsetHour: number;
  rahuStartHour: number;
  rahuEndHour: number;
  abhijitStartHour?: number;
  abhijitEndHour?: number;
  activeTithiAt: (hour: number) => RingSegment;
  activeNakshatraAt: (hour: number) => RingSegment;
  activeYogaAt: (hour: number) => RingSegment;
  tithiTransition?: TransitionDetail;
  nakshatraTransition?: TransitionDetail;
  yogaTransition?: TransitionDetail;
  allTransitions: TransitionDetail[];
}

// Map Devanagari digits to ASCII digits
const DEV_TO_ASCII: Record<string, string> = {
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
};

export function devanagariToAsciiDigits(str: string): string {
  return str.replace(/[०-९]/g, (ch) => DEV_TO_ASCII[ch] || ch);
}

/**
 * Parses time strings in various formats (Nepali Devanagari or English AM/PM or 24h)
 * into a decimal hour in range [0, 24).
 */
export function parseTimeToDecimalHours(timeStr?: string, defaultVal: number = 12): number {
  if (!timeStr || typeof timeStr !== 'string') return defaultVal;

  const normalized = devanagariToAsciiDigits(timeStr).trim();

  // Match standard HH:MM (e.g. "05:42", "18:48")
  const match24 = normalized.match(/(\d{1,2})[:.](\d{2})/);
  if (!match24) return defaultVal;

  let hours = parseInt(match24[1], 10);
  const minutes = parseInt(match24[2], 10);

  const lower = normalized.toLowerCase();
  const isPM = lower.includes('pm') || lower.includes('दिउँसो') || lower.includes('साँझ') || lower.includes('राति');
  const isAM = lower.includes('am') || lower.includes('बिहान');

  if (isPM && hours < 12) {
    hours += 12;
  } else if (isAM && hours === 12) {
    hours = 0;
  } else if (lower.includes('राति') && hours === 12) {
    hours = 0;
  }

  const dec = (hours + minutes / 60) % 24;
  return Number.isNaN(dec) ? defaultVal : dec;
}

/**
 * Formats a decimal hour (0 - 24) to a friendly Nepali clock string (e.g., "दिउँसो ०२:१५ बजे")
 */
export function formatDecimalHourToNepali(hour: number): string {
  const norm = (hour % 24 + 24) % 24;
  let h = Math.floor(norm);
  const m = Math.round((norm - h) * 60) % 60;
  if (m === 60) {
    h = (h + 1) % 24;
  }

  let period = 'बिहान';
  if (h >= 12 && h < 16) {
    period = 'दिउँसो';
  } else if (h >= 16 && h < 19) {
    period = 'साँझ';
  } else if (h >= 19 || h < 4) {
    period = 'राति';
  }

  let displayH = h % 12;
  if (displayH === 0) displayH = 12;

  const hStr = toDevanagariNumerals(String(displayH).padStart(2, '0'));
  const mStr = toDevanagariNumerals(String(m).padStart(2, '0'));

  return `${period} ${hStr}:${mStr} बजे`;
}

/**
 * Formats a decimal hour to HH:MM in Devanagari (e.g. १६:२५)
 */
export function formatDecimalToDigital(hour: number): string {
  const norm = (hour % 24 + 24) % 24;
  const h = Math.floor(norm);
  const m = Math.round((norm - h) * 60) % 60;
  return toDevanagariNumerals(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
}

/**
 * Calculates remaining or elapsed time between an inspected hour and a target hour
 */
export function calculateTimeRemaining(fromHour: number, targetHour: number): {
  isUpcoming: boolean;
  diffHours: number;
  hours: number;
  minutes: number;
  text: string;
  shortText: string;
} {
  const normFrom = (fromHour % 24 + 24) % 24;
  const normTarget = (targetHour % 24 + 24) % 24;

  const diff = normTarget - normFrom;
  const isUpcoming = diff > 0.01;

  if (!isUpcoming) {
    const pastDiff = normFrom - normTarget;
    const pastH = Math.floor(pastDiff);
    const pastM = Math.round((pastDiff - pastH) * 60) % 60;
    const pastText =
      pastH > 0
        ? `${toDevanagariNumerals(pastH)} घण्टा ${toDevanagariNumerals(pastM)} मिनेट अघि सुरु भइसकेको`
        : `${toDevanagariNumerals(pastM)} मिनेट अघि सुरु भइसकेको`;
    return {
      isUpcoming: false,
      diffHours: pastDiff,
      hours: pastH,
      minutes: pastM,
      text: pastText,
      shortText: `सुरु भइसकेको (${toDevanagariNumerals(pastH)}घं ${toDevanagariNumerals(pastM)}मि अघि)`
    };
  }

  const h = Math.floor(diff);
  const m = Math.round((diff - h) * 60) % 60;
  let text = '';
  let shortText = '';
  if (h === 0 && m <= 1) {
    text = 'अहिले परिवर्तन हुँदैछ';
    shortText = 'अहिले परिवर्तन हुँदै';
  } else if (h === 0) {
    text = `${toDevanagariNumerals(m)} मिनेटमा आउँदै`;
    shortText = `${toDevanagariNumerals(m)} मिनेट बाँकी`;
  } else {
    text = `${toDevanagariNumerals(h)} घण्टा ${toDevanagariNumerals(m)} मिनेटमा आउँदै`;
    shortText = `${toDevanagariNumerals(h)} घं ${toDevanagariNumerals(m)} मि बाँकी`;
  }

  return {
    isUpcoming: true,
    diffHours: diff,
    hours: h,
    minutes: m,
    text,
    shortText
  };
}

/**
 * Polar to Cartesian coordinates conversion
 * 0 hour is at Top (-90 degrees / 12 o'clock)
 */
export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

/**
 * Generates an SVG Annular Arc path string from startHour to endHour
 */
export function describeAnnularArc(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startHour: number,
  endHour: number
): string {
  // Clamp start and end
  let sH = Math.max(0, startHour);
  let eH = Math.min(24, endHour);

  if (eH <= sH) {
    eH = sH + 0.001;
  }

  // Cap at 23.999 to prevent overlapping self-closing degeneracies in SVG arc
  if (eH - sH >= 24) {
    eH = sH + 23.999;
  }

  const startAngle = (sH / 24) * 360;
  const endAngle = (eH / 24) * 360;

  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);

  const arcSweep = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${arcSweep} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${arcSweep} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

// 27 Yoga Auspiciousness Lookup
const INAUSPICIOUS_YOGAS = new Set([
  'विष्कुम्भ',
  'अतिगण्ड',
  'शूल',
  'गण्ड',
  'व्याघात',
  'वज्र',
  'व्यतीपात',
  'परिघ',
  'वैधृति'
]);

/**
 * Extracts and prepares the daily progression segments for Tithi, Nakshatra, and Yoga
 */
export function calculateDailyProgression(panchanga: PanchangaData): PanchangaProgressionData {
  // 1. Sunrise and Sunset
  const sunriseHour = parseTimeToDecimalHours(panchanga.sunrise, 5.75); // approx 05:45
  const sunsetHour = parseTimeToDecimalHours(panchanga.sunset, 18.75);  // approx 18:45

  // 2. Rahu Kaal
  const rahuStartHour = parseTimeToDecimalHours(panchanga.rahuKaal?.start, 16.5);
  const rahuEndHour = parseTimeToDecimalHours(panchanga.rahuKaal?.end, 18.0);

  // 3. Abhijit
  const abhijitStartHour = panchanga.abhijitMuhurta?.start
    ? parseTimeToDecimalHours(panchanga.abhijitMuhurta.start, 11.75)
    : undefined;
  const abhijitEndHour = panchanga.abhijitMuhurta?.end
    ? parseTimeToDecimalHours(panchanga.abhijitMuhurta.end, 12.6)
    : undefined;

  // 4. Tithi progression
  // If endDecimalHours is provided, use it; otherwise parse endTime
  let tithiEndHour = panchanga.tithi.endDecimalHours ?? parseTimeToDecimalHours(panchanga.tithi.endTime, 14.5);
  // Normalize within 0-24
  tithiEndHour = (tithiEndHour % 24 + 24) % 24;

  const currentTithiName = panchanga.tithi.name || 'प्रतिपदा';
  const paksha = panchanga.tithi.paksha || 'शुक्ल';
  const nextTithiName = panchanga.tithi.subsequentName || 'अर्को तिथि';

  const tithiSegments: RingSegment[] = [];
  if (tithiEndHour > 0.5 && tithiEndHour < 23.5) {
    tithiSegments.push({
      id: 'tithi-1',
      name: `${paksha} ${currentTithiName}`,
      startHour: 0,
      endHour: tithiEndHour,
      color: paksha === 'शुक्ल' ? '#F59E0B' : '#6366F1',
      gradientId: paksha === 'शुक्ल' ? 'grad-tithi-shukla' : 'grad-tithi-krishna',
      secondaryInfo: `${formatDecimalHourToNepali(tithiEndHour)}सम्म`,
      detail: `${currentTithiName} (${paksha} पक्ष) - दिनको मुख्य तिथि`,
      badge: `${paksha} पक्ष`
    });
    tithiSegments.push({
      id: 'tithi-2',
      name: `${paksha} ${nextTithiName}`,
      startHour: tithiEndHour,
      endHour: 24,
      color: paksha === 'शुक्ल' ? '#D97706' : '#4F46E5',
      gradientId: paksha === 'शुक्ल' ? 'grad-tithi-next-shukla' : 'grad-tithi-next-krishna',
      secondaryInfo: `${formatDecimalHourToNepali(tithiEndHour)}देखि आरम्भ`,
      detail: `${nextTithiName} आरम्भ भई आगामी दिनसम्म रहनेछ`,
      badge: 'आगामी तिथि'
    });
  } else {
    // Single tithi covering whole day (Vriddhi or late shift)
    tithiSegments.push({
      id: 'tithi-full',
      name: `${paksha} ${currentTithiName}`,
      startHour: 0,
      endHour: 24,
      color: paksha === 'शुक्ल' ? '#F59E0B' : '#6366F1',
      gradientId: paksha === 'शुक्ल' ? 'grad-tithi-shukla' : 'grad-tithi-krishna',
      secondaryInfo: panchanga.tithi.endTime || 'दिनभर',
      detail: `${currentTithiName} (${paksha} पक्ष) अहोरात्र रहनेछ`,
      badge: 'अहोरात्र'
    });
  }

  // 5. Nakshatra progression
  let nakshatraEndHour = panchanga.nakshatra.endDecimalHours ?? parseTimeToDecimalHours(panchanga.nakshatra.endTime, 17.5);
  nakshatraEndHour = (nakshatraEndHour % 24 + 24) % 24;

  const currentNakshatraName = panchanga.nakshatra.name || 'अश्विनी';
  const currentNakshatraLord = panchanga.nakshatra.lord || 'केतु';
  const currentPada = panchanga.nakshatra.pada || 1;
  const nextNakshatraName = panchanga.nakshatra.subsequentName || 'अर्को नक्षत्र';
  const nextNakshatraLord = panchanga.nakshatra.subsequentLord || 'सूर्य';

  const nakshatraSegments: RingSegment[] = [];
  if (nakshatraEndHour > 0.5 && nakshatraEndHour < 23.5) {
    nakshatraSegments.push({
      id: 'nakshatra-1',
      name: currentNakshatraName,
      startHour: 0,
      endHour: nakshatraEndHour,
      color: '#0284C7',
      gradientId: 'grad-nakshatra-1',
      secondaryInfo: `${formatDecimalHourToNepali(nakshatraEndHour)}सम्म (पाद ${toDevanagariNumerals(currentPada)})`,
      detail: `स्वामी: ${currentNakshatraLord} • पाद ${toDevanagariNumerals(currentPada)}`,
      badge: `स्वामी: ${currentNakshatraLord}`
    });
    nakshatraSegments.push({
      id: 'nakshatra-2',
      name: nextNakshatraName,
      startHour: nakshatraEndHour,
      endHour: 24,
      color: '#0D9488',
      gradientId: 'grad-nakshatra-2',
      secondaryInfo: `${formatDecimalHourToNepali(nakshatraEndHour)}देखि आरम्भ`,
      detail: `स्वामी: ${nextNakshatraLord} • पाद १ आरम्भ`,
      badge: `स्वामी: ${nextNakshatraLord}`
    });
  } else {
    nakshatraSegments.push({
      id: 'nakshatra-full',
      name: currentNakshatraName,
      startHour: 0,
      endHour: 24,
      color: '#0284C7',
      gradientId: 'grad-nakshatra-1',
      secondaryInfo: panchanga.nakshatra.endTime || 'दिनभर',
      detail: `स्वामी: ${currentNakshatraLord} • पाद ${toDevanagariNumerals(currentPada)}`,
      badge: `स्वामी: ${currentNakshatraLord}`
    });
  }

  // 6. Yoga progression
  let yogaEndHour = panchanga.yoga.endDecimalHours ?? parseTimeToDecimalHours(panchanga.yoga.endTime, 11.5);
  yogaEndHour = (yogaEndHour % 24 + 24) % 24;

  const currentYogaName = panchanga.yoga.name || 'सिद्धि';
  const isCurrentYogaInauspicious = INAUSPICIOUS_YOGAS.has(currentYogaName);
  const nextYogaName = panchanga.yoga.subsequentName || 'अर्को योग';
  const isNextYogaInauspicious = INAUSPICIOUS_YOGAS.has(nextYogaName);

  const yogaSegments: RingSegment[] = [];
  if (yogaEndHour > 0.5 && yogaEndHour < 23.5) {
    yogaSegments.push({
      id: 'yoga-1',
      name: currentYogaName,
      startHour: 0,
      endHour: yogaEndHour,
      color: isCurrentYogaInauspicious ? '#E11D48' : '#059669',
      gradientId: isCurrentYogaInauspicious ? 'grad-yoga-inauspicious' : 'grad-yoga-auspicious',
      secondaryInfo: `${formatDecimalHourToNepali(yogaEndHour)}सम्म`,
      detail: isCurrentYogaInauspicious ? 'दोषयुक्त/सावधानी योग' : 'शुभ तथा मङ्गल फलदायी योग',
      badge: isCurrentYogaInauspicious ? '⚠️ सावधानी' : '✨ शुभ',
      isAuspicious: !isCurrentYogaInauspicious
    });
    yogaSegments.push({
      id: 'yoga-2',
      name: nextYogaName,
      startHour: yogaEndHour,
      endHour: 24,
      color: isNextYogaInauspicious ? '#E11D48' : '#10B981',
      gradientId: isNextYogaInauspicious ? 'grad-yoga-inauspicious' : 'grad-yoga-auspicious-alt',
      secondaryInfo: `${formatDecimalHourToNepali(yogaEndHour)}देखि आरम्भ`,
      detail: isNextYogaInauspicious ? 'दोषयुक्त/सावधानी योग' : 'शुभ तथा मङ्गल फलदायी योग',
      badge: isNextYogaInauspicious ? '⚠️ सावधानी' : '✨ शुभ',
      isAuspicious: !isNextYogaInauspicious
    });
  } else {
    yogaSegments.push({
      id: 'yoga-full',
      name: currentYogaName,
      startHour: 0,
      endHour: 24,
      color: isCurrentYogaInauspicious ? '#E11D48' : '#059669',
      gradientId: isCurrentYogaInauspicious ? 'grad-yoga-inauspicious' : 'grad-yoga-auspicious',
      secondaryInfo: panchanga.yoga.endTime || 'दिनभर',
      detail: isCurrentYogaInauspicious ? 'दोषयुक्त/सावधानी योग' : 'शुभ तथा मङ्गल फलदायी योग',
      badge: isCurrentYogaInauspicious ? '⚠️ सावधानी' : '✨ शुभ',
      isAuspicious: !isCurrentYogaInauspicious
    });
  }

  // Active element helpers
  const activeTithiAt = (hour: number) => {
    const h = (hour % 24 + 24) % 24;
    return tithiSegments.find((s) => h >= s.startHour && h < s.endHour) || tithiSegments[0];
  };

  const activeNakshatraAt = (hour: number) => {
    const h = (hour % 24 + 24) % 24;
    return nakshatraSegments.find((s) => h >= s.startHour && h < s.endHour) || nakshatraSegments[0];
  };

  const activeYogaAt = (hour: number) => {
    const h = (hour % 24 + 24) % 24;
    return yogaSegments.find((s) => h >= s.startHour && h < s.endHour) || yogaSegments[0];
  };

  // Transitions
  let tithiTransition: TransitionDetail | undefined;
  if (tithiEndHour > 0.5 && tithiEndHour < 23.5) {
    tithiTransition = {
      id: 'transition-tithi',
      element: 'tithi',
      elementLabel: 'तिथि परिवर्तन',
      currentName: `${paksha} ${currentTithiName}`,
      nextName: `${paksha} ${nextTithiName}`,
      transitionHour: tithiEndHour,
      transitionTimeFormatted: formatDecimalHourToNepali(tithiEndHour),
      timeStr: formatDecimalToDigital(tithiEndHour),
      isUpcomingAt: (h: number) => tithiEndHour - (h % 24 + 24) % 24 > 0.01,
      getTimeRemainingFrom: (h: number) => calculateTimeRemaining(h, tithiEndHour),
      secondaryNote: `${paksha} पक्ष`,
      badge: 'तिथि',
      color: '#D97706'
    };
  }

  let nakshatraTransition: TransitionDetail | undefined;
  if (nakshatraEndHour > 0.5 && nakshatraEndHour < 23.5) {
    nakshatraTransition = {
      id: 'transition-nakshatra',
      element: 'nakshatra',
      elementLabel: 'नक्षत्र परिवर्तन',
      currentName: currentNakshatraName,
      nextName: nextNakshatraName,
      transitionHour: nakshatraEndHour,
      transitionTimeFormatted: formatDecimalHourToNepali(nakshatraEndHour),
      timeStr: formatDecimalToDigital(nakshatraEndHour),
      isUpcomingAt: (h: number) => nakshatraEndHour - (h % 24 + 24) % 24 > 0.01,
      getTimeRemainingFrom: (h: number) => calculateTimeRemaining(h, nakshatraEndHour),
      secondaryNote: `स्वामी: ${nextNakshatraLord}`,
      badge: 'नक्षत्र',
      color: '#0284C7'
    };
  }

  let yogaTransition: TransitionDetail | undefined;
  if (yogaEndHour > 0.5 && yogaEndHour < 23.5) {
    yogaTransition = {
      id: 'transition-yoga',
      element: 'yoga',
      elementLabel: 'योग परिवर्तन',
      currentName: currentYogaName,
      nextName: nextYogaName,
      transitionHour: yogaEndHour,
      transitionTimeFormatted: formatDecimalHourToNepali(yogaEndHour),
      timeStr: formatDecimalToDigital(yogaEndHour),
      isUpcomingAt: (h: number) => yogaEndHour - (h % 24 + 24) % 24 > 0.01,
      getTimeRemainingFrom: (h: number) => calculateTimeRemaining(h, yogaEndHour),
      secondaryNote: isNextYogaInauspicious ? 'सावधानी योग' : 'शुभ योग',
      badge: isNextYogaInauspicious ? '⚠️ सावधानी' : '✨ शुभ',
      color: isNextYogaInauspicious ? '#E11D48' : '#059669'
    };
  }

  const allTransitions: TransitionDetail[] = [
    ...(nakshatraTransition ? [nakshatraTransition] : []),
    ...(yogaTransition ? [yogaTransition] : []),
    ...(tithiTransition ? [tithiTransition] : [])
  ].sort((a, b) => a.transitionHour - b.transitionHour);

  return {
    tithiSegments,
    nakshatraSegments,
    yogaSegments,
    sunriseHour,
    sunsetHour,
    rahuStartHour,
    rahuEndHour,
    abhijitStartHour,
    abhijitEndHour,
    activeTithiAt,
    activeNakshatraAt,
    activeYogaAt,
    tithiTransition,
    nakshatraTransition,
    yogaTransition,
    allTransitions
  };
}
