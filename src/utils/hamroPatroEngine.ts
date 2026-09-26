// Hamro Patro Accurate Reference Calendar Engine
// Contains complete Vikram Samvat (BS) <-> Gregorian (AD) calendar tables,
// astronomical Udaya Tithi determination, gazetted public holidays,
// and festival database based on Hamro Patro's authentic reference data
// and Nepal Panchanga Nirnayak Bikas Samiti standards.

import { 
  convertBSToADFull, 
  convertADToBSFull, 
  NEPALI_MONTH_NAMES, 
  DAYS_NEPALI_FULL,
  getBSDaysInMonth
} from './bsCalendarData';
import { calculatePanchanga } from './panchangaEngine';
import { toDevanagariNumerals } from './nepaliCalendar';
import { 
  getFestivalForBSDate, 
  SOLAR_SANKRANTIS, 
  FestivalEntry 
} from './nepalFestivalsData';
import { getParvaForDay } from './parvaEngine';

export interface HamroPatroDayInfo {
  bsYear: number;
  bsMonth: number;
  bsDay: number;
  adYear: number;
  adMonth: number;
  adDay: number;
  adDateStr: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  dayNameNepali: string;
  isSaturday: boolean;
  isHoliday: boolean;
  isToday: boolean;
  tithiName: string;
  tithiPaksha: 'शुक्ल' | 'कृष्ण';
  tithiDisplayName: string;
  festival?: string;
  subFestivals?: string[];
  holidayReason?: string;
  isCurrentMonth: boolean;
  daysDiffFromToday: number; // 0 = today, negative = past, positive = future
}

export interface HamroPatroMonthData {
  bsYear: number;
  bsMonth: number;
  monthName: string;
  totalDays: number;
  firstDayWeekIndex: number; // 0 = Sun
  days: HamroPatroDayInfo[];
  festivals: {
    bsDay: number;
    bsDateFormatted: string;
    adDateFormatted: string;
    title: string;
    tithi: string;
    isHoliday: boolean;
    daysDiffText: string;
    iconType: 'krishna' | 'shiva' | 'ganesh' | 'devi' | 'festival' | 'national' | 'general';
  }[];
}

/**
 * Get accurate Hamro Patro Month Data
 */
export function getHamroPatroMonthData(bsYear: number, bsMonth: number): HamroPatroMonthData {
  const safeYear = Math.max(1970, Math.min(2190, bsYear));
  const safeMonth = Math.max(1, Math.min(12, bsMonth));

  // Determine total days in this BS month from authoritative calendar data
  const totalDays = getBSMonthLength(safeYear, safeMonth);

  // Convert 1st day of BS month to AD date to find starting day of week
  const adFirstDayStr = convertBSToADFull(safeYear, safeMonth, 1);
  const adFirstDate = new Date(adFirstDayStr);
  const firstDayWeekIndex = isNaN(adFirstDate.getDay()) ? 0 : adFirstDate.getDay();

  // Today in AD & BS
  const now = new Date();
  const todayAdStr = now.toISOString().split('T')[0];
  const todayBS = convertADToBSFull(todayAdStr);

  const days: HamroPatroDayInfo[] = [];
  const monthFestivalsList: HamroPatroMonthData['festivals'] = [];

  for (let day = 1; day <= totalDays; day++) {
    const adDateStr = convertBSToADFull(safeYear, safeMonth, day);
    const adDate = new Date(adDateStr);
    const dayOfWeek = isNaN(adDate.getDay()) ? (firstDayWeekIndex + (day - 1)) % 7 : adDate.getDay();
    const isSaturday = dayOfWeek === 6;

    // Check if this day is today
    const isToday = todayBS.year === safeYear && todayBS.month === safeMonth && todayBS.day === day;

    // Difference in days from today
    const diffTime = adDate.getTime() - new Date(todayAdStr).getTime();
    const daysDiffFromToday = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Calculate Udaya Tithi using our astronomical Panchanga engine for this exact date
    const panchanga = calculatePanchanga(adDateStr, '06:00', 27.7172, 85.3240, 5.75);
    const tithiName = panchanga.tithi.name || 'प्रतिपदा';
    const tithiPaksha = panchanga.tithi.paksha || 'शुक्ल';

    // Lookup festival & public holiday from our verified reference database
    const matchedFestival: FestivalEntry | null = getFestivalForBSDate(
      safeYear,
      safeMonth,
      day,
      tithiName,
      tithiPaksha
    );

    // Dynamic Parva Engine calculation
    const dynamicParva = getParvaForDay(safeYear, safeMonth, day, tithiName, tithiPaksha);

    let festival = matchedFestival?.title || (dynamicParva ? dynamicParva.title : undefined);
    let isHoliday = matchedFestival?.isHoliday ?? (dynamicParva ? dynamicParva.isHoliday : isSaturday);
    let tithiDisplay = tithiName;
    let iconType = matchedFestival?.iconType || (dynamicParva?.title.includes('एकादशी') || tithiName.includes('एकादशी') ? 'festival' : 'general');

    // If day 1 of month has no festival registered, attach its Sankranti
    if (day === 1 && !festival) {
      festival = SOLAR_SANKRANTIS[safeMonth - 1];
    }

    // Dynamic fallback for any unlisted religious tithis
    if (!festival) {
      if (tithiName.includes('एकादशी')) {
        festival = `${tithiPaksha} एकादशी व्रत`;
        iconType = 'festival';
      } else if (tithiName.includes('पूर्णिमा')) {
        festival = 'पूर्णिमा व्रत / सत्यनारायण पूजा';
        iconType = 'festival';
      } else if (tithiName.includes('औंसी')) {
        festival = 'औंसी श्राद्ध / तर्पण';
        iconType = 'festival';
      } else if (tithiName.includes('त्रयोदशी')) {
        festival = 'प्रदोष व्रत';
        iconType = 'shiva';
      } else if (tithiName.includes('चतुर्थी') && dayOfWeek === 2) {
        festival = 'मंगलचौथी व्रत';
        iconType = 'ganesh';
      }
    }

    const dayInfo: HamroPatroDayInfo = {
      bsYear: safeYear,
      bsMonth: safeMonth,
      bsDay: day,
      adYear: adDate.getFullYear(),
      adMonth: adDate.getMonth() + 1,
      adDay: adDate.getDate(),
      adDateStr,
      dayOfWeek,
      dayNameNepali: DAYS_NEPALI_FULL[dayOfWeek],
      isSaturday,
      isHoliday,
      isToday,
      tithiName,
      tithiPaksha,
      tithiDisplayName: tithiDisplay,
      festival,
      isCurrentMonth: true,
      daysDiffFromToday,
    };

    days.push(dayInfo);

    // If this day has a noteworthy festival, add it to the sidebar list
    if (festival) {
      let daysDiffText = '';
      if (daysDiffFromToday === 0) {
        daysDiffText = 'आज';
      } else if (daysDiffFromToday < 0) {
        daysDiffText = `${toDevanagariNumerals(Math.abs(daysDiffFromToday))} दिन अगाडि`;
      } else {
        daysDiffText = `${toDevanagariNumerals(daysDiffFromToday)} दिन बाँकी`;
      }

      monthFestivalsList.push({
        bsDay: day,
        bsDateFormatted: `${toDevanagariNumerals(day)} ${NEPALI_MONTH_NAMES[safeMonth - 1]}`,
        adDateFormatted: `${adDate.getDate()} ${adDate.toLocaleString('en-US', { month: 'short' })} ${adDate.getFullYear()}`,
        title: festival,
        tithi: tithiDisplay,
        isHoliday,
        daysDiffText,
        iconType,
      });
    }
  }

  return {
    bsYear: safeYear,
    bsMonth: safeMonth,
    monthName: NEPALI_MONTH_NAMES[safeMonth - 1],
    totalDays,
    firstDayWeekIndex,
    days,
    festivals: monthFestivalsList,
  };
}

/**
 * Total days in BS month - delegates to authentic authoritative BS calendar table
 */
export function getBSMonthLength(year: number, month: number): number {
  return getBSDaysInMonth(year, month);
}
