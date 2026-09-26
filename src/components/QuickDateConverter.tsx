import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Calendar,
  ArrowRightLeft,
  Copy,
  Check,
  Clock,
  Sparkles,
  Sun,
  X,
  ChevronRight,
  Calculator,
  Compass,
  RotateCcw,
  CalendarDays,
  ExternalLink
} from 'lucide-react';
import {
  NEPALI_MONTH_NAMES,
  NEPALI_MONTH_NAMES_ALT,
  DAYS_NEPALI_FULL,
  DAYS_SANSKRIT_FULL,
  getBSDaysInMonth,
  convertADToBSFull,
  convertBSToADFull,
  getSamvatsaraForBSYear,
  getRituForBSMonth,
  getAyanaForBSMonth,
} from '../utils/bsCalendarData';
import { toDevanagariNumerals, fromDevanagariNumerals } from '../utils/nepaliCalendar';

export interface QuickDateConverterProps {
  mode?: 'card' | 'modal' | 'compact';
  isOpen?: boolean;
  onClose?: () => void;
  initialDateAD?: string;
  initialDateBS?: { year: number; month: number; day: number };
  onApplyDate?: (dateData: {
    dateAD: string;
    yearBS: number;
    monthBS: number;
    dayBS: number;
    formattedBS: string;
    formattedBSFull: string;
  }) => void;
  onNavigateToPanchanga?: (dateAD: string) => void;
}

// AD Month Names for friendly display
const AD_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const AD_DAYS_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export const QuickDateConverter: React.FC<QuickDateConverterProps> = ({
  mode = 'card',
  isOpen = true,
  onClose,
  initialDateAD,
  initialDateBS,
  onApplyDate,
  onNavigateToPanchanga,
}) => {
  // Conversion Direction: 'AD_TO_BS' | 'BS_TO_AD' | 'AGE_CALC'
  const [activeTab, setActiveTab] = useState<'AD_TO_BS' | 'BS_TO_AD' | 'AGE_CALC'>('AD_TO_BS');

  // Today's Date Reference
  const todayObj = useMemo(() => new Date(), []);
  const todayAD = useMemo(() => todayObj.toISOString().split('T')[0], [todayObj]);
  const todayBS = useMemo(() => convertADToBSFull(todayAD), [todayAD]);

  // AD to BS State
  const [inputAD, setInputAD] = useState<string>(initialDateAD || todayAD);

  // BS to AD State
  const [bsYear, setBsYear] = useState<number>(initialDateBS?.year || todayBS.year);
  const [bsMonth, setBsMonth] = useState<number>(initialDateBS?.month || todayBS.month);
  const [bsDay, setBsDay] = useState<number>(initialDateBS?.day || todayBS.day);

  // Age Calculator State
  const [ageDateSystem, setAgeDateSystem] = useState<'BS' | 'AD'>('BS');

  // Age Calculator BS Date State (Defaults to 2031-04-15 BS or earlier birth date)
  const [birthBSYear, setBirthBSYear] = useState<number>(2031);
  const [birthBSMonth, setBirthBSMonth] = useState<number>(4); // साउन
  const [birthBSDay, setBirthBSDay] = useState<number>(15);

  const [targetBSYear, setTargetBSYear] = useState<number>(todayBS.year);
  const [targetBSMonth, setTargetBSMonth] = useState<number>(todayBS.month);
  const [targetBSDay, setTargetBSDay] = useState<number>(todayBS.day);

  // Synchronized AD Dates for Age Calculator
  const [birthDateAD, setBirthDateAD] = useState<string>(() => {
    return convertBSToADFull(2031, 4, 15);
  });
  const [targetDateAD, setTargetDateAD] = useState<string>(todayAD);

  // Sync state when initialDateAD or initialDateBS changes
  useEffect(() => {
    if (initialDateAD) {
      setInputAD(initialDateAD);
    }
  }, [initialDateAD]);

  useEffect(() => {
    if (initialDateBS) {
      setBsYear(initialDateBS.year);
      setBsMonth(initialDateBS.month);
      setBsDay(initialDateBS.day);
    }
  }, [initialDateBS?.year, initialDateBS?.month, initialDateBS?.day]);

  // Handlers for BS Birth Date Change
  const handleBirthBSChange = (y: number, m: number, d: number) => {
    const maxD = getBSDaysInMonth(y, m);
    const safeD = Math.min(d, maxD);
    setBirthBSYear(y);
    setBirthBSMonth(m);
    setBirthBSDay(safeD);
    const ad = convertBSToADFull(y, m, safeD);
    setBirthDateAD(ad);
  };

  // Handlers for BS Target Date Change
  const handleTargetBSChange = (y: number, m: number, d: number) => {
    const maxD = getBSDaysInMonth(y, m);
    const safeD = Math.min(d, maxD);
    setTargetBSYear(y);
    setTargetBSMonth(m);
    setTargetBSDay(safeD);
    const ad = convertBSToADFull(y, m, safeD);
    setTargetDateAD(ad);
  };

  // Handlers for AD Birth Date Change
  const handleBirthADChange = (newAD: string) => {
    setBirthDateAD(newAD);
    if (newAD) {
      const bs = convertADToBSFull(newAD);
      setBirthBSYear(bs.year);
      setBirthBSMonth(bs.month);
      setBirthBSDay(bs.day);
    }
  };

  // Handlers for AD Target Date Change
  const handleTargetADChange = (newAD: string) => {
    setTargetDateAD(newAD);
    if (newAD) {
      const bs = convertADToBSFull(newAD);
      setTargetBSYear(bs.year);
      setTargetBSMonth(bs.month);
      setTargetBSDay(bs.day);
    }
  };

  // Copy Feedback State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Ensure BS Day is within valid range of selected BS month
  const currentMonthMaxDays = useMemo(() => {
    return getBSDaysInMonth(bsYear, bsMonth);
  }, [bsYear, bsMonth]);

  const safeBsDay = Math.min(bsDay, currentMonthMaxDays);

  const birthBSMaxDays = useMemo(() => {
    return getBSDaysInMonth(birthBSYear, birthBSMonth);
  }, [birthBSYear, birthBSMonth]);

  const targetBSMaxDays = useMemo(() => {
    return getBSDaysInMonth(targetBSYear, targetBSMonth);
  }, [targetBSYear, targetBSMonth]);

  const safeBirthBSDay = Math.min(birthBSDay, birthBSMaxDays);
  const safeTargetBSDay = Math.min(targetBSDay, targetBSMaxDays);

  // Derived Conversion Results for AD -> BS
  const resultFromAD = useMemo(() => {
    if (!inputAD) return null;
    const bsInfo = convertADToBSFull(inputAD);
    const dateObj = new Date(inputAD);
    const isValid = !isNaN(dateObj.getTime());
    if (!isValid) return null;

    const samvatsara = getSamvatsaraForBSYear(bsInfo.year);
    const ritu = getRituForBSMonth(bsInfo.month);
    const ayana = getAyanaForBSMonth(bsInfo.month);
    const altMonthName = NEPALI_MONTH_NAMES_ALT[bsInfo.month - 1];
    const sanskritDayName = DAYS_SANSKRIT_FULL[bsInfo.dayOfWeek];
    const totalMonthDays = getBSDaysInMonth(bsInfo.year, bsInfo.month);

    // Days difference from today
    const diffTime = dateObj.getTime() - new Date(todayAD).getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    return {
      ...bsInfo,
      adDate: inputAD,
      adFormatted: `${AD_DAYS_NAMES[dateObj.getDay()]}, ${AD_MONTH_NAMES[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`,
      samvatsara,
      ritu,
      ayana,
      altMonthName,
      sanskritDayName,
      totalMonthDays,
      diffDays,
    };
  }, [inputAD, todayAD]);

  // Derived Conversion Results for BS -> AD
  const resultFromBS = useMemo(() => {
    const calculatedAD = convertBSToADFull(bsYear, bsMonth, safeBsDay);
    const bsInfo = convertADToBSFull(calculatedAD);
    const dateObj = new Date(calculatedAD);
    const isValid = !isNaN(dateObj.getTime());
    if (!isValid) return null;

    const samvatsara = getSamvatsaraForBSYear(bsYear);
    const ritu = getRituForBSMonth(bsMonth);
    const ayana = getAyanaForBSMonth(bsMonth);
    const altMonthName = NEPALI_MONTH_NAMES_ALT[bsMonth - 1];
    const sanskritDayName = DAYS_SANSKRIT_FULL[bsInfo.dayOfWeek];
    const totalMonthDays = getBSDaysInMonth(bsYear, bsMonth);

    // Days difference from today
    const diffTime = dateObj.getTime() - new Date(todayAD).getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    return {
      ...bsInfo,
      adDate: calculatedAD,
      adFormatted: `${AD_DAYS_NAMES[dateObj.getDay()]}, ${AD_MONTH_NAMES[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`,
      samvatsara,
      ritu,
      ayana,
      altMonthName,
      sanskritDayName,
      totalMonthDays,
      diffDays,
    };
  }, [bsYear, bsMonth, safeBsDay, todayAD]);

  // Derived Age / Duration Calculation
  const ageCalculationResult = useMemo(() => {
    if (!birthDateAD || !targetDateAD) return null;
    const bDate = new Date(birthDateAD);
    const tDate = new Date(targetDateAD);
    if (isNaN(bDate.getTime()) || isNaN(tDate.getTime())) return null;

    const birthBS = convertADToBSFull(birthDateAD);
    const targetBS = convertADToBSFull(targetDateAD);

    let isNegative = false;
    let totalDaysDiff = Math.round((tDate.getTime() - bDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (totalDaysDiff < 0) {
      isNegative = true;
    }

    let years = 0;
    let months = 0;
    let days = 0;

    if (ageDateSystem === 'BS') {
      // Bikram Sambat Date Difference
      let yDiff = targetBS.year - birthBS.year;
      let mDiff = targetBS.month - birthBS.month;
      let dDiff = targetBS.day - birthBS.day;

      if (dDiff < 0) {
        mDiff -= 1;
        const prevMonth = targetBS.month === 1 ? 12 : targetBS.month - 1;
        const prevYear = targetBS.month === 1 ? targetBS.year - 1 : targetBS.year;
        const daysInPrev = getBSDaysInMonth(prevYear, prevMonth);
        dDiff += daysInPrev;
      }

      if (mDiff < 0) {
        yDiff -= 1;
        mDiff += 12;
      }

      if (yDiff < 0) {
        let revY = birthBS.year - targetBS.year;
        let revM = birthBS.month - targetBS.month;
        let revD = birthBS.day - targetBS.day;
        if (revD < 0) {
          revM -= 1;
          const prevMonth = birthBS.month === 1 ? 12 : birthBS.month - 1;
          const prevYear = birthBS.month === 1 ? birthBS.year - 1 : birthBS.year;
          revD += getBSDaysInMonth(prevYear, prevMonth);
        }
        if (revM < 0) {
          revY -= 1;
          revM += 12;
        }
        years = revY;
        months = revM;
        days = revD;
      } else {
        years = yDiff;
        months = mDiff;
        days = dDiff;
      }
    } else {
      // Gregorian AD Date Difference
      let startDate = bDate;
      let endDate = tDate;

      if (bDate > tDate) {
        startDate = tDate;
        endDate = bDate;
      }

      let yDiff = endDate.getFullYear() - startDate.getFullYear();
      let mDiff = endDate.getMonth() - startDate.getMonth();
      let dDiff = endDate.getDate() - startDate.getDate();

      if (dDiff < 0) {
        mDiff -= 1;
        const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
        dDiff += prevMonth.getDate();
      }

      if (mDiff < 0) {
        yDiff -= 1;
        mDiff += 12;
      }

      years = yDiff;
      months = mDiff;
      days = dDiff;
    }

    const absTotalDays = Math.abs(totalDaysDiff);
    const totalWeeks = Math.floor(absTotalDays / 7);
    const remainingDays = absTotalDays % 7;
    const totalHours = absTotalDays * 24;
    const totalMinutes = totalHours * 60;

    // Next Birthday calculation
    let nextBirthdayBSYear = todayBS.year;
    let nextBirthdayAD = convertBSToADFull(nextBirthdayBSYear, birthBS.month, birthBS.day);
    let diffToBirthday = Math.round((new Date(nextBirthdayAD).getTime() - new Date(todayAD).getTime()) / (1000 * 60 * 60 * 24));
    if (diffToBirthday < 0) {
      nextBirthdayBSYear += 1;
      nextBirthdayAD = convertBSToADFull(nextBirthdayBSYear, birthBS.month, birthBS.day);
      diffToBirthday = Math.round((new Date(nextBirthdayAD).getTime() - new Date(todayAD).getTime()) / (1000 * 60 * 60 * 24));
    }
    const nextBirthdayBS = convertADToBSFull(nextBirthdayAD);

    return {
      years,
      months,
      days,
      totalDaysDiff: absTotalDays,
      totalWeeks,
      remainingDays,
      totalHours,
      totalMinutes,
      isNegative,
      birthBS,
      targetBS,
      birthAD: birthDateAD,
      targetAD: targetDateAD,
      nextBirthday: {
        daysRemaining: diffToBirthday,
        formattedBS: nextBirthdayBS.formattedBSFull,
        dateAD: nextBirthdayAD,
      },
    };
  }, [birthDateAD, targetDateAD, ageDateSystem, todayBS, todayAD]);

  // Copy to Clipboard Helper
  const handleCopy = useCallback((text: string, key: string) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  }, []);

  // Quick Date Adjusters for AD
  const handleAdjustAD = (daysOffset: number) => {
    const curr = inputAD ? new Date(inputAD) : new Date();
    curr.setDate(curr.getDate() + daysOffset);
    setInputAD(curr.toISOString().split('T')[0]);
  };

  // Quick Year Presets (1970 BS to 2100 BS)
  const bsYearsList = useMemo(() => {
    const list: number[] = [];
    for (let y = 2100; y >= 1970; y--) {
      list.push(y);
    }
    return list;
  }, []);

  if (mode === 'modal' && !isOpen) {
    return null;
  }

  // Active conversion result depending on tab
  const activeResult = activeTab === 'AD_TO_BS' ? resultFromAD : resultFromBS;

  const content = (
    <div className="flex flex-col w-full text-stone-800 dark:text-stone-100 select-text">
      {/* Tab Switcher Header */}
      <div className="flex items-center justify-between border-b border-amber-200/80 dark:border-stone-700/80 pb-3 mb-4 gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-amber-50 dark:bg-stone-800/90 rounded-xl border border-amber-200 dark:border-stone-700 overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab('AD_TO_BS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'AD_TO_BS'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-amber-800 dark:hover:text-white'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>ई.सं. → वि.सं. (AD to BS)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('BS_TO_AD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'BS_TO_AD'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-amber-800 dark:hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>वि.सं. → ई.सं. (BS to AD)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('AGE_CALC')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              activeTab === 'AGE_CALC'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-amber-800 dark:hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>उमेर / दिन गणना</span>
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          TAB 1: AD to BS Conversion Interface
         ------------------------------------------------------------- */}
      {activeTab === 'AD_TO_BS' && (
        <div className="space-y-4">
          <div className="bg-amber-50/60 dark:bg-stone-800/50 p-3.5 rounded-xl border border-amber-200 dark:border-stone-700">
            <label className="block text-xs font-bold text-amber-950 dark:text-amber-300 mb-1.5">
              ईस्वी संवत् मिति प्रविष्ट गर्नुहोस् (Enter English AD Date):
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="date"
                  value={inputAD}
                  onChange={(e) => setInputAD(e.target.value)}
                  className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-sm font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                />
              </div>

              {/* Quick Jump Buttons */}
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => setInputAD(todayAD)}
                  className="px-2.5 py-1.5 bg-amber-100 dark:bg-stone-700 hover:bg-amber-200 dark:hover:bg-stone-600 text-amber-900 dark:text-amber-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  title="आजको मिति"
                >
                  आज
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustAD(-1)}
                  className="px-2 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-medium transition-all cursor-pointer"
                  title="१ दिन अघि"
                >
                  -१ दिन
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustAD(1)}
                  className="px-2 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-medium transition-all cursor-pointer"
                  title="१ दिन पछि"
                >
                  +१ दिन
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjustAD(30)}
                  className="px-2 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-medium transition-all cursor-pointer"
                  title="३० दिन पछि"
                >
                  +३० दिन
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 2: BS to AD Conversion Interface
         ------------------------------------------------------------- */}
      {activeTab === 'BS_TO_AD' && (
        <div className="space-y-4">
          <div className="bg-amber-50/60 dark:bg-stone-800/50 p-3.5 rounded-xl border border-amber-200 dark:border-stone-700">
            <label className="block text-xs font-bold text-amber-950 dark:text-amber-300 mb-2">
              विक्रम संवत् मिति छनोट गर्नुहोस् (Select Bikram Sambat BS Date):
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Year Select */}
              <div>
                <span className="block text-[11px] text-stone-500 dark:text-stone-400 mb-1">साल (Year BS):</span>
                <select
                  value={bsYear}
                  onChange={(e) => setBsYear(parseInt(e.target.value, 10))}
                  className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-2.5 py-2 text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs cursor-pointer"
                >
                  {bsYearsList.map((y) => (
                    <option key={y} value={y}>
                      {toDevanagariNumerals(y)} ({y} BS)
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Select */}
              <div>
                <span className="block text-[11px] text-stone-500 dark:text-stone-400 mb-1">महिना (Month):</span>
                <select
                  value={bsMonth}
                  onChange={(e) => setBsMonth(parseInt(e.target.value, 10))}
                  className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-2.5 py-2 text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs cursor-pointer"
                >
                  {NEPALI_MONTH_NAMES.map((name, idx) => (
                    <option key={idx} value={idx + 1}>
                      {idx + 1}. {name} ({NEPALI_MONTH_NAMES_ALT[idx]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Day / Gate Select */}
              <div>
                <span className="block text-[11px] text-stone-500 dark:text-stone-400 mb-1">
                  गते / दिन (१ देखि {toDevanagariNumerals(currentMonthMaxDays)} सम्म):
                </span>
                <select
                  value={safeBsDay}
                  onChange={(e) => setBsDay(parseInt(e.target.value, 10))}
                  className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl px-2.5 py-2 text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs cursor-pointer"
                >
                  {Array.from({ length: currentMonthMaxDays }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {toDevanagariNumerals(d)} गते ({d})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick BS Presets */}
            <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-amber-200/60 dark:border-stone-700/60 flex-wrap">
              <span className="text-[11px] text-stone-500 font-medium">द्रुत छनोट:</span>
              <button
                type="button"
                onClick={() => {
                  setBsYear(todayBS.year);
                  setBsMonth(todayBS.month);
                  setBsDay(todayBS.day);
                }}
                className="px-2.5 py-1 bg-amber-100 dark:bg-stone-700 hover:bg-amber-200 dark:hover:bg-stone-600 text-amber-900 dark:text-amber-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                आजको मिति
              </button>
              <button
                type="button"
                onClick={() => {
                  setBsYear(todayBS.year);
                  setBsMonth(1);
                  setBsDay(1);
                }}
                className="px-2 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-xs transition-all cursor-pointer"
              >
                नयाँ वर्ष (वैशाख १)
              </button>
              <button
                type="button"
                onClick={() => {
                  setBsYear(todayBS.year);
                  setBsMonth(6);
                  setBsDay(1);
                }}
                className="px-2 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-xs transition-all cursor-pointer"
              >
                दशैँ महिना (असोज १)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          DISPLAY CONVERTED DATE RESULTS (For AD_TO_BS & BS_TO_AD)
         ------------------------------------------------------------- */}
      {(activeTab === 'AD_TO_BS' || activeTab === 'BS_TO_AD') && activeResult && (
        <div className="mt-4 space-y-3">
          {/* Main Primary Result Card */}
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-red-500/10 dark:from-amber-950/40 dark:via-stone-900 dark:to-red-950/30 border-2 border-amber-500/40 dark:border-amber-600/40 p-4 rounded-2xl shadow-sm relative overflow-hidden">
            {/* Top Badge & Copy Action */}
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-amber-300/40 dark:border-stone-700">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-200/60 dark:bg-amber-900/50 px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3" />
                रूपान्तरित पूर्ण विवरण (Conversion Result)
              </span>

              <button
                type="button"
                onClick={() => handleCopy(activeResult.formattedBSFull, 'bs_full')}
                className="flex items-center gap-1 text-xs font-bold text-amber-900 dark:text-amber-300 hover:text-amber-700 bg-white/80 dark:bg-stone-800 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-stone-600 shadow-2xs transition-all cursor-pointer active:scale-95"
                title="प्रतिलिपि गर्नुहोस्"
              >
                {copiedKey === 'bs_full' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 dark:text-emerald-400">प्रतिलिपि भयो!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    <span>कपि गर्नुहोस्</span>
                  </>
                )}
              </button>
            </div>

            {/* Prominent Nepali Date Hero */}
            <div className="my-2 text-center sm:text-left">
              <div className="text-lg sm:text-2xl font-black font-serif text-red-950 dark:text-amber-200 tracking-wide">
                {activeResult.formattedBSFull}
              </div>
              <div className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium mt-1">
                {activeResult.adFormatted} <span className="font-mono text-stone-500">({activeResult.adDate})</span>
              </div>
            </div>

            {/* 4-Item Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-amber-200/60 dark:border-stone-700 text-xs">
              <div className="bg-white/70 dark:bg-stone-900/60 p-2 rounded-xl border border-stone-200 dark:border-stone-700">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block">संवत्सर (Samvat):</span>
                <strong className="text-stone-900 dark:text-stone-100 font-bold">{activeResult.samvatsara}</strong>
              </div>

              <div className="bg-white/70 dark:bg-stone-900/60 p-2 rounded-xl border border-stone-200 dark:border-stone-700">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block">ऋतु (Season):</span>
                <strong className="text-stone-900 dark:text-stone-100 font-bold">{activeResult.ritu} ऋतु</strong>
              </div>

              <div className="bg-white/70 dark:bg-stone-900/60 p-2 rounded-xl border border-stone-200 dark:border-stone-700">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block">अयन (Solar Motion):</span>
                <strong className="text-stone-900 dark:text-stone-100 font-bold">{activeResult.ayana}</strong>
              </div>

              <div className="bg-white/70 dark:bg-stone-900/60 p-2 rounded-xl border border-stone-200 dark:border-stone-700">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block">संस्कृत वासर:</span>
                <strong className="text-stone-900 dark:text-stone-100 font-bold">{activeResult.sanskritDayName}</strong>
              </div>
            </div>

            {/* Days Difference Banner */}
            <div className="mt-3 flex items-center justify-between bg-amber-100/70 dark:bg-stone-800/80 p-2 rounded-xl text-xs text-stone-700 dark:text-stone-300">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                {activeResult.diffDays === 0 ? (
                  <strong className="text-emerald-700 dark:text-emerald-400">यो आजको वर्तमान मिति हो।</strong>
                ) : activeResult.diffDays > 0 ? (
                  <span>आजभन्दा <strong>{toDevanagariNumerals(activeResult.diffDays)} दिन पछिको</strong> मिति हो।</span>
                ) : (
                  <span>आजभन्दा <strong>{toDevanagariNumerals(Math.abs(activeResult.diffDays))} दिन अघिको</strong> मिति हो।</span>
                )}
              </span>

              <span className="text-[11px] font-mono text-stone-500">
                यस महिनामा कुल {toDevanagariNumerals(activeResult.totalMonthDays)} दिन
              </span>
            </div>

            {/* Action Bar (Apply Date or Navigate to Panchanga) */}
            <div className="flex items-center gap-2 mt-3 pt-2 justify-end flex-wrap">
              {onNavigateToPanchanga && (
                <button
                  type="button"
                  onClick={() => onNavigateToPanchanga(activeResult.adDate)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-amber-900 dark:text-amber-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>यस दिनको पञ्चाङ्ग हेर्नुहोस्</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              {onApplyDate && (
                <button
                  type="button"
                  onClick={() => {
                    onApplyDate({
                      dateAD: activeResult.adDate,
                      yearBS: activeResult.year,
                      monthBS: activeResult.month,
                      dayBS: activeResult.day,
                      formattedBS: activeResult.formattedBS,
                      formattedBSFull: activeResult.formattedBSFull,
                    });
                    if (onClose) onClose();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>यो मिति चयन गर्नुहोस्</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          TAB 3: Age & Duration Calculator Interface
         ------------------------------------------------------------- */}
      {activeTab === 'AGE_CALC' && (
        <div className="space-y-4">
          {/* Sub-tab / Date System Switcher (BS / AD Option) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 bg-amber-50/80 dark:bg-stone-800/70 rounded-2xl border border-amber-200 dark:border-stone-700">
            <div className="flex items-center gap-1.5 px-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                उमेर गणना मिति प्रणाली (Date System):
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/90 dark:bg-stone-900/90 p-1 rounded-xl border border-amber-200/80 dark:border-stone-700">
              <button
                type="button"
                onClick={() => setAgeDateSystem('BS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  ageDateSystem === 'BS'
                    ? 'bg-[#7A1C1C] text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-300 hover:text-amber-900 dark:hover:text-white'
                }`}
              >
                <span>🇳🇵 विक्रम संवत् (वि.सं. / BS)</span>
              </button>

              <button
                type="button"
                onClick={() => setAgeDateSystem('AD')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  ageDateSystem === 'AD'
                    ? 'bg-[#7A1C1C] text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-300 hover:text-amber-900 dark:hover:text-white'
                }`}
              >
                <span>🌐 ईस्वी सन् (ई.सं. / AD)</span>
              </button>
            </div>
          </div>

          {/* Option A: Bikram Sambat (BS) Inputs */}
          {ageDateSystem === 'BS' ? (
            <div className="bg-amber-50/60 dark:bg-stone-800/50 p-3.5 sm:p-4 rounded-2xl border border-amber-200 dark:border-stone-700 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 1. BS Birth Date */}
                <div className="bg-white/80 dark:bg-stone-900/70 p-3.5 rounded-xl border border-amber-200/60 dark:border-stone-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-950 dark:text-amber-200">
                      १. सुरु मिति वा जन्म मिति (वि.सं. / BS):
                    </label>
                    <span className="text-[10px] font-medium text-stone-500">
                      जन्म वा सुरूवात मिति
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {/* Year */}
                    <div>
                      <span className="block text-[10px] text-stone-500 mb-0.5">साल (Year):</span>
                      <select
                        value={birthBSYear}
                        onChange={(e) => handleBirthBSChange(parseInt(e.target.value, 10), birthBSMonth, birthBSDay)}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg px-2 py-1.5 text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs cursor-pointer"
                      >
                        {bsYearsList.map((y) => (
                          <option key={y} value={y}>
                            {toDevanagariNumerals(y)} ({y})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Month */}
                    <div>
                      <span className="block text-[10px] text-stone-500 mb-0.5">महिना (Month):</span>
                      <select
                        value={birthBSMonth}
                        onChange={(e) => handleBirthBSChange(birthBSYear, parseInt(e.target.value, 10), birthBSDay)}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg px-2 py-1.5 text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs cursor-pointer"
                      >
                        {NEPALI_MONTH_NAMES.map((name, idx) => (
                          <option key={idx} value={idx + 1}>
                            {toDevanagariNumerals(idx + 1)}. {name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Day */}
                    <div>
                      <span className="block text-[10px] text-stone-500 mb-0.5">गते (Day):</span>
                      <select
                        value={safeBirthBSDay}
                        onChange={(e) => handleBirthBSChange(birthBSYear, birthBSMonth, parseInt(e.target.value, 10))}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg px-2 py-1.5 text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs cursor-pointer"
                      >
                        {Array.from({ length: birthBSMaxDays }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d}>
                            {toDevanagariNumerals(d)} गते
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Equivalent AD subtext */}
                  {ageCalculationResult && (
                    <div className="text-[11px] text-amber-900 dark:text-amber-300 font-medium pt-1 border-t border-amber-100 dark:border-stone-800 flex items-center justify-between flex-wrap gap-1">
                      <span>ई.सं. (AD): <strong>{ageCalculationResult.birthAD}</strong></span>
                      <span className="text-[10px] text-stone-500">
                        ({ageCalculationResult.birthBS.formattedBSFull.split(',')[1] || ''})
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. BS Target Date */}
                <div className="bg-white/80 dark:bg-stone-900/70 p-3.5 rounded-xl border border-amber-200/60 dark:border-stone-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-950 dark:text-amber-200">
                      २. अन्तिम मिति वा आजको मिति (वि.सं. / BS):
                    </label>
                    <button
                      type="button"
                      onClick={() => handleTargetBSChange(todayBS.year, todayBS.month, todayBS.day)}
                      className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 hover:bg-amber-200 dark:bg-stone-700 text-amber-900 dark:text-amber-200 rounded-md transition-colors cursor-pointer"
                      title="आजको वि.सं. मिति"
                    >
                      आजको मिति
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {/* Year */}
                    <div>
                      <span className="block text-[10px] text-stone-500 mb-0.5">साल (Year):</span>
                      <select
                        value={targetBSYear}
                        onChange={(e) => handleTargetBSChange(parseInt(e.target.value, 10), targetBSMonth, targetBSDay)}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg px-2 py-1.5 text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs cursor-pointer"
                      >
                        {bsYearsList.map((y) => (
                          <option key={y} value={y}>
                            {toDevanagariNumerals(y)} ({y})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Month */}
                    <div>
                      <span className="block text-[10px] text-stone-500 mb-0.5">महिना (Month):</span>
                      <select
                        value={targetBSMonth}
                        onChange={(e) => handleTargetBSChange(targetBSYear, parseInt(e.target.value, 10), targetBSDay)}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg px-2 py-1.5 text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs cursor-pointer"
                      >
                        {NEPALI_MONTH_NAMES.map((name, idx) => (
                          <option key={idx} value={idx + 1}>
                            {toDevanagariNumerals(idx + 1)}. {name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Day */}
                    <div>
                      <span className="block text-[10px] text-stone-500 mb-0.5">गते (Day):</span>
                      <select
                        value={safeTargetBSDay}
                        onChange={(e) => handleTargetBSChange(targetBSYear, targetBSMonth, parseInt(e.target.value, 10))}
                        className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg px-2 py-1.5 text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs cursor-pointer"
                      >
                        {Array.from({ length: targetBSMaxDays }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d}>
                            {toDevanagariNumerals(d)} गते
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Equivalent AD subtext */}
                  {ageCalculationResult && (
                    <div className="text-[11px] text-amber-900 dark:text-amber-300 font-medium pt-1 border-t border-amber-100 dark:border-stone-800 flex items-center justify-between flex-wrap gap-1">
                      <span>ई.सं. (AD): <strong>{ageCalculationResult.targetAD}</strong></span>
                      <span className="text-[10px] text-stone-500">
                        ({ageCalculationResult.targetBS.formattedBSFull.split(',')[1] || ''})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Option B: Gregorian AD Inputs */
            <div className="bg-amber-50/60 dark:bg-stone-800/50 p-3.5 sm:p-4 rounded-2xl border border-amber-200 dark:border-stone-700 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. AD Birth Date */}
                <div className="bg-white/80 dark:bg-stone-900/70 p-3.5 rounded-xl border border-amber-200/60 dark:border-stone-700/80 space-y-2">
                  <label className="block text-xs font-bold text-amber-950 dark:text-amber-200">
                    १. सुरु मिति वा जन्म मिति (From / Birth Date AD):
                  </label>
                  <input
                    type="date"
                    value={birthDateAD}
                    onChange={(e) => handleBirthADChange(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg px-3 py-2 text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                  />
                  {ageCalculationResult && (
                    <div className="text-[11px] text-amber-900 dark:text-amber-300 font-medium pt-1 border-t border-amber-100 dark:border-stone-800 flex items-center justify-between flex-wrap gap-1">
                      <span>वि.सं.: <strong>{ageCalculationResult.birthBS.formattedBS}</strong></span>
                      <span className="text-[10px] text-stone-500">
                        ({ageCalculationResult.birthBS.formattedBSFull.split(',')[1] || ''})
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. AD Target Date */}
                <div className="bg-white/80 dark:bg-stone-900/70 p-3.5 rounded-xl border border-amber-200/60 dark:border-stone-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-950 dark:text-amber-200">
                      २. अन्तिम मिति (To / Target Date AD):
                    </label>
                    <button
                      type="button"
                      onClick={() => handleTargetADChange(todayAD)}
                      className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 hover:bg-amber-200 dark:bg-stone-700 text-amber-900 dark:text-amber-200 rounded-md transition-colors cursor-pointer"
                      title="आजको ई.सं. मिति"
                    >
                      आजको मिति
                    </button>
                  </div>
                  <input
                    type="date"
                    value={targetDateAD}
                    onChange={(e) => handleTargetADChange(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg px-3 py-2 text-xs font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                  />
                  {ageCalculationResult && (
                    <div className="text-[11px] text-amber-900 dark:text-amber-300 font-medium pt-1 border-t border-amber-100 dark:border-stone-800 flex items-center justify-between flex-wrap gap-1">
                      <span>वि.सं.: <strong>{ageCalculationResult.targetBS.formattedBS}</strong></span>
                      <span className="text-[10px] text-stone-500">
                        ({ageCalculationResult.targetBS.formattedBSFull.split(',')[1] || ''})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Age Result Presentation */}
          {ageCalculationResult && (
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-red-500/10 dark:from-amber-950/40 dark:via-stone-900 dark:to-red-950/30 border-2 border-amber-500/40 dark:border-amber-600/40 p-4 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-amber-300/40 pb-2 flex-wrap gap-2">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>उमेर तथा मिति फरक गणना फल</span>
                </div>

                {/* Copy Age Result Action */}
                <button
                  type="button"
                  onClick={() => handleCopy(
                    `उमेर: ${ageCalculationResult.years} वर्ष, ${ageCalculationResult.months} महिना, ${ageCalculationResult.days} दिन (कुल ${ageCalculationResult.totalDaysDiff} दिन)`,
                    'age_calc'
                  )}
                  className="flex items-center gap-1 text-xs font-bold text-amber-900 dark:text-amber-300 hover:text-amber-700 bg-white/80 dark:bg-stone-800 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-stone-600 shadow-2xs transition-all cursor-pointer active:scale-95"
                  title="उमेर विवरण प्रतिलिपि गर्नुहोस्"
                >
                  {copiedKey === 'age_calc' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 dark:text-emerald-400">प्रतिलिपि भयो!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                      <span>कपि गर्नुहोस्</span>
                    </>
                  )}
                </button>
              </div>

              {/* 3 Main Highlights (Years, Months, Days) */}
              <div className="grid grid-cols-3 gap-2.5 text-center py-1">
                <div className="bg-white/85 dark:bg-stone-900/80 p-3 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xs">
                  <span className="text-[11px] text-stone-500 block font-medium">वर्ष (Years)</span>
                  <span className="text-2xl sm:text-3xl font-black text-amber-950 dark:text-amber-200">
                    {toDevanagariNumerals(ageCalculationResult.years)}
                  </span>
                </div>

                <div className="bg-white/85 dark:bg-stone-900/80 p-3 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xs">
                  <span className="text-[11px] text-stone-500 block font-medium">महिना (Months)</span>
                  <span className="text-2xl sm:text-3xl font-black text-amber-950 dark:text-amber-200">
                    {toDevanagariNumerals(ageCalculationResult.months)}
                  </span>
                </div>

                <div className="bg-white/85 dark:bg-stone-900/80 p-3 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-2xs">
                  <span className="text-[11px] text-stone-500 block font-medium">दिन (Days)</span>
                  <span className="text-2xl sm:text-3xl font-black text-amber-950 dark:text-amber-200">
                    {toDevanagariNumerals(ageCalculationResult.days)}
                  </span>
                </div>
              </div>

              {/* Detailed Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div className="bg-amber-100/70 dark:bg-stone-800/80 p-2 rounded-xl text-stone-700 dark:text-stone-300">
                  <span className="text-[10px] text-stone-500 block">कुल दिन संख्या:</span>
                  <strong>{toDevanagariNumerals(ageCalculationResult.totalDaysDiff)} दिन</strong>
                </div>

                <div className="bg-amber-100/70 dark:bg-stone-800/80 p-2 rounded-xl text-stone-700 dark:text-stone-300">
                  <span className="text-[10px] text-stone-500 block">कुल हप्ता:</span>
                  <strong>{toDevanagariNumerals(ageCalculationResult.totalWeeks)} हप्ता, {toDevanagariNumerals(ageCalculationResult.remainingDays)} दिन</strong>
                </div>

                <div className="bg-amber-100/70 dark:bg-stone-800/80 p-2 rounded-xl text-stone-700 dark:text-stone-300">
                  <span className="text-[10px] text-stone-500 block">कुल घण्टा:</span>
                  <strong>{toDevanagariNumerals(ageCalculationResult.totalHours)} घण्टा</strong>
                </div>

                <div className="bg-amber-100/70 dark:bg-stone-800/80 p-2 rounded-xl text-stone-700 dark:text-stone-300">
                  <span className="text-[10px] text-stone-500 block">आगामी जन्मदिन:</span>
                  <strong className="text-amber-800 dark:text-amber-300">
                    {toDevanagariNumerals(ageCalculationResult.nextBirthday.daysRemaining)} दिन बाँकी
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (mode === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-amber-300/80 dark:border-stone-700 max-w-2xl w-full p-4 sm:p-6 overflow-hidden max-h-[92vh] overflow-y-auto custom-scrollbar relative">
          {/* Modal Header Bar with RHS Top Close Button */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-200/80 dark:border-stone-800 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#7A1C1C] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <ArrowRightLeft className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black font-serif text-amber-950 dark:text-amber-200">
                  नेपाली मिति रूपान्तरण तथा उमेर गणना (Date Converter & Age Calculator)
                </h3>
                <p className="text-[11px] text-stone-500">
                  वि.सं. (BS) र ई.सं. (AD) बीचको सटिक रूपान्तरण तथा उमेर र दिन गणना औजार
                </p>
              </div>
            </div>

            {/* Close Button Pinned to RHS TOP */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-stone-100 hover:bg-rose-50 dark:bg-stone-800 dark:hover:bg-rose-950/60 text-stone-600 hover:text-rose-600 dark:text-stone-300 dark:hover:text-rose-400 border border-stone-200 dark:border-stone-700 transition-all cursor-pointer shadow-2xs shrink-0 ml-auto"
                title="बन्द गर्नुहोस् (Close)"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {content}
        </div>
      </div>
    );
  }

  // Standalone Card Mode
  return (
    <div className="bg-white dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xs w-full relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#7A1C1C] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <ArrowRightLeft className="w-4.5 h-4.5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-stone-100">
                नेपाली मिति रूपान्तरण (Date Converter)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/50">
                वि.सं. ↔ ई.सं.
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              विक्रम संवत् (BS) र ईस्वी सन् (AD) बीचको सटिक रूपान्तरण तथा उमेर एवं दिन गणना औजार
            </p>
          </div>
        </div>

        {/* Close Button on RHS Top (if onClose is passed) */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-100 hover:bg-rose-50 dark:bg-stone-800 dark:hover:bg-rose-950/60 text-stone-600 hover:text-rose-600 dark:text-stone-300 dark:hover:text-rose-400 border border-stone-200 dark:border-stone-700 transition-all cursor-pointer shadow-2xs shrink-0 ml-auto"
            title="बन्द गर्नुहोस् (Close)"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      {content}
    </div>
  );
};
