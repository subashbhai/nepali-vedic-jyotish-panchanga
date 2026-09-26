import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon, 
  Sparkles, 
  Clock, 
  Compass, 
  Award, 
  ShieldAlert, 
  ShieldCheck,
  Info,
  Flame,
  CheckCircle2,
  CalendarCheck,
  Search,
  Layers,
  MapPin,
  X,
  ArrowRightLeft
} from 'lucide-react';
import { 
  NEPALI_MONTH_NAMES, 
  DAYS_NEPALI_FULL, 
  convertBSToADFull, 
  convertADToBSFull 
} from '../utils/bsCalendarData';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { calculatePanchanga } from '../utils/panchangaEngine';
import { 
  getHamroPatroMonthData, 
  getBSMonthLength, 
  HamroPatroDayInfo 
} from '../utils/hamroPatroEngine';
import { runEngineAuditVerification, AuditReport } from '../utils/engineAuditVerification';
import { PanchangaData } from '../types/astrology';
import { DailyPanchangaPopup } from './DailyPanchangaPopup';
import { QuickDateConverter } from './QuickDateConverter';

interface NepaliCalendarViewProps {
  onSelectDate?: (dateBS: string) => void;
  onNavigateToPanchanga?: () => void;
}

export const NepaliCalendarView: React.FC<NepaliCalendarViewProps> = ({
  onSelectDate,
  onNavigateToPanchanga
}) => {
  // Current real-time anchor
  const todayAd = new Date();
  const todayAdStr = todayAd.toISOString().split('T')[0];
  const todayBS = convertADToBSFull(todayAdStr);

  const [bsYear, setBsYear] = useState<number>(todayBS.year || 2083);
  const [bsMonth, setBsMonth] = useState<number>(todayBS.month || 5);
  const [selectedDay, setSelectedDay] = useState<number>(todayBS.day || 19);
  const [showPanchangaModal, setShowPanchangaModal] = useState<boolean>(false);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [filterQuery, setFilterQuery] = useState<string>('');

  const handleRunAudit = () => {
    const report = runEngineAuditVerification();
    setAuditReport(report);
    setShowAuditModal(true);
  };

  // Fetch Hamro Patro reference month data
  const monthData = useMemo(() => {
    return getHamroPatroMonthData(bsYear, bsMonth);
  }, [bsYear, bsMonth]);

  // English month-year range for the header (e.g., "August / September 2026")
  const adMonthRange = useMemo(() => {
    const firstDayAd = convertBSToADFull(bsYear, bsMonth, 1);
    const lastDayAd = convertBSToADFull(bsYear, bsMonth, monthData.totalDays);
    const d1 = new Date(firstDayAd);
    const d2 = new Date(lastDayAd);
    const m1 = d1.toLocaleString('en-US', { month: 'short' });
    const m2 = d2.toLocaleString('en-US', { month: 'short' });
    const y1 = d1.getFullYear();
    const y2 = d2.getFullYear();

    if (m1 === m2 && y1 === y2) {
      return `${m1} ${y1}`;
    } else if (y1 === y2) {
      return `${m1} / ${m2} ${y1}`;
    } else {
      return `${m1} ${y1} - ${m2} ${y2}`;
    }
  }, [bsYear, bsMonth, monthData.totalDays]);

  // Previous month overflow days to fill row 1
  const prevMonthOverflowDays = useMemo(() => {
    if (monthData.firstDayWeekIndex === 0) return [];
    const prevYear = bsMonth === 1 ? bsYear - 1 : bsYear;
    const prevMonth = bsMonth === 1 ? 12 : bsMonth - 1;
    const prevMonthTotalDays = getBSMonthLength(prevYear, prevMonth);

    const list = [];
    const count = monthData.firstDayWeekIndex;
    for (let i = count - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const adDateStr = convertBSToADFull(prevYear, prevMonth, dayNum);
      const adDate = new Date(adDateStr);
      const pan = calculatePanchanga(adDateStr, '06:00', 27.7172, 85.3240, 5.75);
      list.push({
        bsYear: prevYear,
        bsMonth: prevMonth,
        bsDay: dayNum,
        adDay: adDate.getDate(),
        adMonthStr: adDate.toLocaleString('en-US', { month: 'short' }),
        tithiName: pan.tithi.name || 'चतुर्थी',
      });
    }
    return list;
  }, [bsYear, bsMonth, monthData.firstDayWeekIndex]);

  // Next month overflow days to fill last row up to 35 or 42 grid cells
  const nextMonthOverflowDays = useMemo(() => {
    const totalFilled = monthData.firstDayWeekIndex + monthData.totalDays;
    const targetGridCount = totalFilled > 35 ? 42 : 35;
    const remainder = targetGridCount - totalFilled;
    if (remainder <= 0) return [];

    const nextYear = bsMonth === 12 ? bsYear + 1 : bsYear;
    const nextMonth = bsMonth === 12 ? 1 : bsMonth + 1;

    const list = [];
    for (let d = 1; d <= remainder; d++) {
      const adDateStr = convertBSToADFull(nextYear, nextMonth, d);
      const adDate = new Date(adDateStr);
      const pan = calculatePanchanga(adDateStr, '06:00', 27.7172, 85.3240, 5.75);
      list.push({
        bsYear: nextYear,
        bsMonth: nextMonth,
        bsDay: d,
        adDay: adDate.getDate(),
        adMonthStr: adDate.toLocaleString('en-US', { month: 'short' }),
        tithiName: pan.tithi.name || 'प्रतिपदा',
      });
    }
    return list;
  }, [bsYear, bsMonth, monthData.firstDayWeekIndex, monthData.totalDays]);

  // Selected Day's active Panchanga
  const selectedDayInfo = useMemo(() => {
    return monthData.days.find((d) => d.bsDay === selectedDay) || monthData.days[0];
  }, [monthData, selectedDay]);

  const selectedDayPanchanga = useMemo<PanchangaData | null>(() => {
    if (!selectedDayInfo) return null;
    return calculatePanchanga(selectedDayInfo.adDateStr, '06:00', 27.7172, 85.3240, 5.75);
  }, [selectedDayInfo]);

  // Handle Month Navigation
  const handlePrevMonth = () => {
    if (bsMonth === 1) {
      setBsYear((prev) => prev - 1);
      setBsMonth(12);
    } else {
      setBsMonth((prev) => prev - 1);
    }
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    if (bsMonth === 12) {
      setBsYear((prev) => prev + 1);
      setBsMonth(1);
    } else {
      setBsMonth((prev) => prev + 1);
    }
    setSelectedDay(1);
  };

  const handleJumpToToday = () => {
    setBsYear(todayBS.year || 2083);
    setBsMonth(todayBS.month || 5);
    setSelectedDay(todayBS.day || 19);
  };

  // Filtered festivals for right sidebar search
  const filteredFestivals = useMemo(() => {
    if (!filterQuery.trim()) return monthData.festivals;
    const q = filterQuery.toLowerCase();
    return monthData.festivals.filter(
      (f) => f.title.toLowerCase().includes(q) || f.tithi.toLowerCase().includes(q) || f.bsDateFormatted.includes(q)
    );
  }, [monthData.festivals, filterQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Balananda Patro Brand & Navigation Header Bar */}
      <div className="bg-[#B91C1C] text-white rounded-3xl p-4 sm:p-6 shadow-md border border-red-700/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Logo and Context */}
        <div className="flex items-center gap-3">
          <div className="min-w-12 h-12 px-1.5 rounded-2xl bg-white text-[#B91C1C] flex flex-col items-center justify-center font-bold shadow-md shrink-0">
            <span className="text-[9px] leading-none font-sans font-black tracking-tight">बालानन्द</span>
            <span className="text-[11px] font-serif font-black tracking-tight mt-0.5">पात्रो</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-serif tracking-tight text-white">
                {monthData.monthName} {toDevanagariNumerals(bsYear)}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 text-white font-medium border border-white/20">
                {adMonthRange}
              </span>
            </div>
            <p className="text-xs text-red-100 font-medium">
              नेपालकै आधिकारिक पात्रो तथा पञ्चाङ्ग प्रणाली
            </p>
          </div>
        </div>

        {/* Month Navigation & Controls */}
        <div className="flex items-center flex-wrap gap-2 justify-between md:justify-end">
          {onNavigateToPanchanga && (
            <button
              type="button"
              onClick={onNavigateToPanchanga}
              className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-amber-200 hover:text-white text-xs font-bold transition-all border border-amber-300/30 flex items-center gap-1.5 cursor-pointer"
              title="विस्तृत पञ्चाङ्ग हेर्नुहोस्"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>पञ्चाङ्ग</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('patro-date-converter-block');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-amber-200 hover:text-white text-xs font-bold transition-all border border-amber-300/30 flex items-center gap-1.5 cursor-pointer"
            title="पात्रो भित्रको मिति रूपान्तरण ब्लकमा जानुहोस्"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-300" />
            <span>मिति रूपान्तरण</span>
          </button>

          <button
            type="button"
            onClick={handleJumpToToday}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="आजको मितिमा जानुहोस्"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>आज (Today)</span>
          </button>

          <div className="flex items-center gap-1 bg-black/20 p-1 rounded-2xl border border-white/20">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="अघिल्लो महिना"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Month Select */}
            <select
              value={bsMonth}
              onChange={(e) => {
                setBsMonth(parseInt(e.target.value, 10));
                setSelectedDay(1);
              }}
              className="bg-[#7A1C1C] text-white text-xs sm:text-sm font-bold py-1.5 px-2.5 rounded-xl border border-white/30 focus:outline-none cursor-pointer"
            >
              {NEPALI_MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>

            {/* Year Select */}
            <select
              value={bsYear}
              onChange={(e) => {
                setBsYear(parseInt(e.target.value, 10));
                setSelectedDay(1);
              }}
              className="bg-[#7A1C1C] text-white text-xs sm:text-sm font-bold py-1.5 px-2.5 rounded-xl border border-white/30 focus:outline-none font-mono cursor-pointer max-h-60"
            >
              {Array.from({ length: 2190 - 1970 + 1 }, (_, i) => 1970 + i).map((y) => (
                <option key={y} value={y} className="bg-stone-900 text-white">
                  {toDevanagariNumerals(y)} BS
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="पछिल्लो महिना"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid & Right Sidebar (Hamro Patro 2-Column Desktop Architecture) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Authentic Monthly Grid (8 or 9 cols on large screens) */}
        <div className="lg:col-span-8 xl:col-span-8 bg-white dark:bg-stone-900 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 p-3 sm:p-5 shadow-sm space-y-3">
          {/* Weekday Column Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs pb-2 border-b border-stone-200 dark:border-stone-800">
            {DAYS_NEPALI_FULL.map((day, idx) => (
              <div
                key={day}
                className={`py-2 rounded-xl text-xs sm:text-sm ${
                  idx === 6
                    ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 font-black'
                    : 'text-stone-700 dark:text-stone-300'
                }`}
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.slice(0, 3)}</span>
              </div>
            ))}
          </div>

          {/* Calendar Day Cells Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* 1. Overflow Days from Previous Month */}
            {prevMonthOverflowDays.map((pDay) => (
              <div
                key={`prev-${pDay.bsDay}`}
                className="min-h-[85px] sm:min-h-[105px] p-1.5 rounded-2xl bg-stone-50/60 dark:bg-stone-800/30 border border-stone-200/40 dark:border-stone-800/40 flex flex-col justify-between opacity-50 cursor-not-allowed select-none"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400 dark:text-stone-500 font-mono">
                    {pDay.adDay}
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-stone-400 dark:text-stone-500 font-mono">
                    {toDevanagariNumerals(pDay.bsDay)}
                  </span>
                </div>
                <div className="text-[10px] text-stone-400 dark:text-stone-500 font-medium truncate text-center">
                  {pDay.tithiName}
                </div>
              </div>
            ))}

            {/* 2. Active Month Days (Hamro Patro exact rendering) */}
            {monthData.days.map((day) => {
              const isSelected = selectedDay === day.bsDay;
              const isToday = day.isToday;
              const isRedDay = day.isSaturday || day.isHoliday;

              // Today cell has emerald green background matching Hamro Patro
              const cellBgClass = isToday
                ? 'bg-[#1b6d39] text-white border-emerald-600 shadow-lg ring-2 ring-emerald-500'
                : isSelected
                ? 'bg-amber-50 dark:bg-stone-800 border-[#B91C1C] dark:border-amber-500 shadow-md ring-2 ring-[#B91C1C]'
                : isRedDay
                ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200/70 dark:border-red-900/40 hover:bg-red-50/80'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/60';

              return (
                <div
                  key={day.bsDay}
                  onClick={() => {
                    setSelectedDay(day.bsDay);
                  }}
                  onDoubleClick={() => {
                    setSelectedDay(day.bsDay);
                    setShowPanchangaModal(true);
                  }}
                  className={`min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer select-none relative ${cellBgClass}`}
                >
                  {/* Top: English AD date (top-right) & Festival snippet */}
                  <div className="flex items-start justify-between gap-1">
                    <span
                      className={`text-[10px] sm:text-xs font-mono font-bold shrink-0 ${
                        isToday
                          ? 'text-emerald-100'
                          : 'text-stone-400 dark:text-stone-500'
                      }`}
                    >
                      {day.adDay === 1 ? `${day.adDay} ${new Date(day.adDateStr).toLocaleString('en-US', { month: 'short' })}` : day.adDay}
                    </span>

                    {/* Festival snippet if any */}
                    {day.festival && (
                      <span
                        className={`text-[9px] sm:text-[10px] font-bold line-clamp-2 text-right leading-tight max-w-[85%] ${
                          isToday
                            ? 'text-white'
                            : isRedDay
                            ? 'text-red-700 dark:text-red-400'
                            : 'text-stone-800 dark:text-stone-200'
                        }`}
                        title={day.festival}
                      >
                        {day.festival}
                      </span>
                    )}
                  </div>

                  {/* Center: Bold Large Devanagari BS Date */}
                  <div className="flex items-center justify-center my-auto">
                    <span
                      className={`text-xl sm:text-3xl font-black font-mono leading-none tracking-tight ${
                        isToday
                          ? 'text-white scale-105'
                          : isRedDay
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-stone-900 dark:text-stone-100'
                      }`}
                    >
                      {toDevanagariNumerals(day.bsDay)}
                    </span>
                  </div>

                  {/* Bottom: Tithi Name */}
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-semibold">
                    <span
                      className={`truncate mx-auto ${
                        isToday
                          ? 'text-emerald-100 font-bold'
                          : isRedDay
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {day.tithiDisplayName}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* 3. Overflow Days into Next Month */}
            {nextMonthOverflowDays.map((nDay) => (
              <div
                key={`next-${nDay.bsDay}`}
                className="min-h-[85px] sm:min-h-[105px] p-1.5 rounded-2xl bg-stone-50/60 dark:bg-stone-800/30 border border-stone-200/40 dark:border-stone-800/40 flex flex-col justify-between opacity-50 cursor-not-allowed select-none"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400 dark:text-stone-500 font-mono">
                    {nDay.adDay}
                  </span>
                  <span className="text-sm sm:text-base font-extrabold text-stone-400 dark:text-stone-500 font-mono">
                    {toDevanagariNumerals(nDay.bsDay)}
                  </span>
                </div>
                <div className="text-[10px] text-stone-400 dark:text-stone-500 font-medium truncate text-center">
                  {nDay.tithiName}
                </div>
              </div>
            ))}
          </div>

          {/* Active Date Bar below calendar grid */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-[#1b6d39]" />
              <span className="text-stone-600 dark:text-stone-400 font-medium">हरियो: आज (Today)</span>
              <span className="w-3 h-3 rounded-md bg-red-100 border border-red-300 ml-2" />
              <span className="text-stone-600 dark:text-stone-400 font-medium">रातो: बिदा / शनिबार</span>
            </div>

            <button
              type="button"
              onClick={() => setShowPanchangaModal(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-[#7A1C1C] dark:text-amber-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{monthData.monthName} {toDevanagariNumerals(selectedDay)} को विस्तृत पञ्चाङ्ग हेर्नुहोस्</span>
            </button>
          </div>
        </div>

        {/* Right Column: Authentic Hamro Patro Events & Festivals Sidebar */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-sm flex flex-col h-full max-h-[640px]">
            {/* Sidebar Header */}
            <div className="pb-3 border-b border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100 font-serif">
                    चाडपर्व तथा विशेष दिवसहरू
                  </h3>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900/50">
                  {toDevanagariNumerals(monthData.festivals.length)} पर्वहरू
                </span>
              </div>

              {/* Search Filter for Events */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                <input
                  type="text"
                  placeholder="पर्व वा तिथि खोज्नुहोस्..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-[#B91C1C]"
                />
              </div>
            </div>

            {/* Scrollable Festival Cards List (Exact layout of Hamro Patro screenshot) */}
            <div className="overflow-y-auto space-y-2 pr-1 pt-2 flex-1 scrollbar-thin">
              {filteredFestivals.length === 0 ? (
                <div className="text-center py-10 text-stone-400 text-xs">
                  कुनै पनि चाडपर्व भेटिएन।
                </div>
              ) : (
                filteredFestivals.map((fest) => {
                  const isFestToday = fest.daysDiffText === 'आज';
                  const isPast = fest.daysDiffText.includes('अगाडि');
                  const isSelectedFest = selectedDay === fest.bsDay;

                  return (
                    <div
                      key={`${fest.bsDay}-${fest.title}`}
                      onClick={() => setSelectedDay(fest.bsDay)}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isFestToday
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-xs'
                          : isSelectedFest
                          ? 'bg-amber-50 dark:bg-stone-800 border-[#B91C1C] dark:border-amber-500 shadow-xs'
                          : 'bg-stone-50/70 dark:bg-stone-800/40 border-stone-200/70 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
                      }`}
                    >
                      {/* Left: Festival Theme Icon */}
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                          isFestToday
                            ? 'bg-emerald-600 text-white'
                            : fest.iconType === 'krishna'
                            ? 'bg-blue-600 text-white'
                            : fest.iconType === 'devi'
                            ? 'bg-rose-600 text-white'
                            : fest.iconType === 'shiva'
                            ? 'bg-amber-600 text-white'
                            : 'bg-[#B91C1C] text-white'
                        }`}
                      >
                        {fest.iconType === 'krishna' ? (
                          <Sparkles className="w-5 h-5" />
                        ) : fest.iconType === 'devi' ? (
                          <Flame className="w-5 h-5" />
                        ) : fest.iconType === 'shiva' ? (
                          <Compass className="w-5 h-5" />
                        ) : (
                          <Award className="w-5 h-5" />
                        )}
                      </div>

                      {/* Middle: Title, Tithi & English Date */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                          {fest.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                          <span className="font-medium text-amber-700 dark:text-amber-400">
                            {fest.tithi}
                          </span>
                          <span>•</span>
                          <span className="font-mono">{fest.adDateFormatted}</span>
                        </div>
                      </div>

                      {/* Right: BS Date & Relative Time Badge */}
                      <div className="text-right shrink-0 flex flex-col items-end">
                        <span className="font-extrabold text-xs text-stone-900 dark:text-stone-100 font-mono">
                          {fest.bsDateFormatted}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 ${
                            isFestToday
                              ? 'bg-emerald-600 text-white animate-pulse'
                              : isPast
                              ? 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                              : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                          }`}
                        >
                          {fest.daysDiffText}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Day Panchanga Card (Always visible summary below calendar) */}
      {selectedDayInfo && selectedDayPanchanga && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 dark:from-stone-900 dark:to-stone-900/80 rounded-3xl border border-amber-300/80 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-200/80 dark:border-stone-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#B91C1C] text-amber-200 flex flex-col items-center justify-center font-bold shadow-md">
                <span className="text-xs font-sans text-amber-100">{monthData.monthName}</span>
                <span className="text-xl font-mono leading-none">{toDevanagariNumerals(selectedDay)}</span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black font-serif text-[#7A1C1C] dark:text-amber-400">
                    {toDevanagariNumerals(bsYear)} {monthData.monthName} {toDevanagariNumerals(selectedDay)} गते ({selectedDayInfo.dayNameNepali})
                  </h3>
                  {selectedDayInfo.isToday && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                      आज
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                  Gregorian Date: {new Date(selectedDayInfo.adDateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {selectedDayInfo.festival && (
                <div className="px-3.5 py-1.5 rounded-2xl bg-[#B91C1C] text-white text-xs font-bold shadow-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{selectedDayInfo.festival}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('patro-date-converter-block');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-3 py-1.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-[#7A1C1C] dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/50 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="यो मिति रूपान्तरण गर्नुहोस्"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>मिति रूपान्तरण</span>
              </button>
            </div>
          </div>

          {/* 5 Limbs of Panchanga for Selected Day */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
            {/* Tithi */}
            <div className="p-3 bg-white dark:bg-stone-800 rounded-2xl border border-amber-200/60 dark:border-stone-700">
              <span className="text-stone-500 dark:text-stone-400 block text-[10px]">१. तिथि (Tithi)</span>
              <strong className="text-stone-900 dark:text-stone-100 block text-sm mt-0.5">
                {selectedDayPanchanga.tithi.name} ({selectedDayPanchanga.tithi.paksha} पक्ष)
              </strong>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 block mt-1">
                {selectedDayPanchanga.tithi.endTime}
              </span>
            </div>

            {/* Vara */}
            <div className="p-3 bg-white dark:bg-stone-800 rounded-2xl border border-amber-200/60 dark:border-stone-700">
              <span className="text-stone-500 dark:text-stone-400 block text-[10px]">२. वार (Vara)</span>
              <strong className="text-stone-900 dark:text-stone-100 block text-sm mt-0.5">
                {selectedDayPanchanga.dayNameNepali}
              </strong>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-1">
                {selectedDayPanchanga.dayNameSanskrit}
              </span>
            </div>

            {/* Nakshatra */}
            <div className="p-3 bg-white dark:bg-stone-800 rounded-2xl border border-amber-200/60 dark:border-stone-700">
              <span className="text-stone-500 dark:text-stone-400 block text-[10px]">३. नक्षत्र (Nakshatra)</span>
              <strong className="text-stone-900 dark:text-stone-100 block text-sm mt-0.5">
                {selectedDayPanchanga.nakshatra.name} (चरण {toDevanagariNumerals(selectedDayPanchanga.nakshatra.pada)})
              </strong>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-1">
                स्वामी: {selectedDayPanchanga.nakshatra.lord}
              </span>
            </div>

            {/* Yoga */}
            <div className="p-3 bg-white dark:bg-stone-800 rounded-2xl border border-amber-200/60 dark:border-stone-700">
              <span className="text-stone-500 dark:text-stone-400 block text-[10px]">४. योग (Yoga)</span>
              <strong className="text-stone-900 dark:text-stone-100 block text-sm mt-0.5">
                {selectedDayPanchanga.yoga.name}
              </strong>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-1">
                {selectedDayPanchanga.yoga.endTime}
              </span>
            </div>

            {/* Karana */}
            <div className="p-3 bg-white dark:bg-stone-800 rounded-2xl border border-amber-200/60 dark:border-stone-700 col-span-2 sm:col-span-1">
              <span className="text-stone-500 dark:text-stone-400 block text-[10px]">५. करण (Karana)</span>
              <strong className="text-stone-900 dark:text-stone-100 block text-sm mt-0.5">
                {selectedDayPanchanga.karana.name}
              </strong>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-1">
                {selectedDayPanchanga.karana.endTime}
              </span>
            </div>
          </div>

          {/* Solar & Auspicious Timings Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-2.5 bg-white/70 dark:bg-stone-800/60 rounded-xl border border-amber-200/40 dark:border-stone-700 flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <div>
                <span className="text-[10px] text-stone-500 block">सूर्योदय / सूर्यास्त</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {selectedDayPanchanga.sunrise} / {selectedDayPanchanga.sunset}
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-white/70 dark:bg-stone-800/60 rounded-xl border border-amber-200/40 dark:border-stone-700 flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-[10px] text-stone-500 block">चन्द्रोदय / चन्द्रास्त</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {selectedDayPanchanga.moonrise} / {selectedDayPanchanga.moonset}
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-white/70 dark:bg-stone-800/60 rounded-xl border border-amber-200/40 dark:border-stone-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <div>
                <span className="text-[10px] text-stone-500 block">राहु काल (अशुभ)</span>
                <span className="font-bold text-rose-700 dark:text-rose-400">
                  {selectedDayPanchanga.rahuKaal.start} - {selectedDayPanchanga.rahuKaal.end}
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-white/70 dark:bg-stone-800/60 rounded-xl border border-amber-200/40 dark:border-stone-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <div>
                <span className="text-[10px] text-stone-500 block">अभिजित मुहूर्त (शुभ)</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {selectedDayPanchanga.abhijitMuhurta.start} - {selectedDayPanchanga.abhijitMuhurta.end}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* मिति रूपान्तरण ब्लक (Date Converter Block inside Patro) */}
      <div id="patro-date-converter-block" className="scroll-mt-6 pt-2">
        <QuickDateConverter
          mode="card"
          isOpen={true}
          initialDateAD={selectedDayInfo ? selectedDayInfo.adDateStr : undefined}
          initialDateBS={{ year: bsYear, month: bsMonth, day: selectedDay }}
          onNavigateToPanchanga={onNavigateToPanchanga ? () => onNavigateToPanchanga() : undefined}
        />
      </div>

      {/* Authoritative Daily Panchanga & Sait Details Popup */}
      <DailyPanchangaPopup
        isOpen={showPanchangaModal}
        onClose={() => setShowPanchangaModal(false)}
        dateAD={selectedDayInfo ? selectedDayInfo.adDateStr : ''}
      />

      {/* Engine Audit & Verification Modal */}
      {showAuditModal && auditReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-amber-500/30 p-6 space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                    नेपाली क्यालेन्डर तथा पञ्चाङ्ग इन्जिन शुद्धता परीक्षण
                  </h3>
                  <p className="text-xs text-stone-500">
                    नेपाल पञ्चाङ्ग निर्णायक विकास समिति तथा हाम्रो पात्रो मानक अनुसार खगोलीय शुद्धता अडिट
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Summary Banner */}
            <div className={`p-4 rounded-2xl flex items-center justify-between gap-4 ${
              auditReport.isAllPassed 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
                : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-full ${auditReport.isAllPassed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                  {auditReport.isAllPassed ? <CheckCircle2 className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base">
                    {auditReport.isAllPassed ? 'सबै ९ वटै खगोलीय परीक्षणहरू शतप्रतिशत सफल (100% Passed)' : 'केही परीक्षण असफल'}
                  </h4>
                  <p className="text-xs opacity-90">
                    कुल परीक्षण: {auditReport.totalTests} | सफल: {auditReport.passedCount} | असफल: {auditReport.failedCount}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRunAudit}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 text-xs font-bold border border-stone-300 dark:border-stone-700 shadow-2xs hover:bg-stone-50 transition-colors cursor-pointer shrink-0"
              >
                पुनः परीक्षण
              </button>
            </div>

            {/* Test Items List */}
            <div className="space-y-3">
              {auditReport.items.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-3.5 rounded-2xl border transition-all ${
                    item.passed
                      ? 'bg-stone-50/80 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800'
                      : 'bg-rose-50 dark:bg-rose-950/20 border-rose-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 w-full">
                      <div className="mt-0.5">
                        {item.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                      </div>
                      <div className="w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                            {item.nameNepali}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                          {item.detailsNepali}
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] font-mono bg-white dark:bg-stone-900 p-2 rounded-xl border border-stone-200 dark:border-stone-800">
                          <div>
                            <span className="text-stone-400 block text-[9px] uppercase">अपेक्षित (Expected)</span>
                            <span className="text-stone-700 dark:text-stone-300">{item.expected}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block text-[9px] uppercase">गणना (Actual)</span>
                            <span className={item.passed ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-rose-600 font-bold'}>
                              {item.actual}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-right pt-2 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="px-5 py-2 rounded-xl bg-[#7A1C1C] text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
              >
                बन्द गर्नुहोस् (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
