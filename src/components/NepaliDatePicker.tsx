import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  NEPALI_MONTH_NAMES, 
  DAYS_NEPALI_FULL, 
  getBSDaysInMonth, 
  convertBSToADFull, 
  convertADToBSFull 
} from '../utils/bsCalendarData';
import { toDevanagariNumerals, fromDevanagariNumerals } from '../utils/nepaliCalendar';

interface NepaliDatePickerProps {
  valueBS?: string; // e.g., '२०८३ जेठ १५' or '2083-02-15'
  valueAD?: string; // e.g., '2026-05-29'
  onChange: (data: { yearBS: number; monthBS: number; dayBS: number; formattedBS: string; dateAD: string }) => void;
  label?: string;
  required?: boolean;
}

export const NepaliDatePicker: React.FC<NepaliDatePickerProps> = ({
  valueBS,
  valueAD,
  onChange,
  label = 'जन्म मिति (वि.सं.) *',
  required = true,
}) => {
  // Parse initial state
  const getInitialBS = () => {
    if (valueBS) {
      const latinStr = fromDevanagariNumerals(valueBS);
      const match = latinStr.match(/(\d{4})[^\d]*(\d{1,2})[^\d]*(\d{1,2})/);
      if (match) {
        const y = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const d = parseInt(match[3], 10);
        if (y >= 1970 && y <= 2110 && m >= 1 && m <= 12 && d >= 1 && d <= 32) {
          return { year: y, month: m, day: d };
        }
      }
      // Check month name
      for (let i = 0; i < NEPALI_MONTH_NAMES.length; i++) {
        if (valueBS.includes(NEPALI_MONTH_NAMES[i])) {
          const digits = latinStr.match(/\d+/g);
          if (digits && digits.length >= 2) {
            return { year: parseInt(digits[0], 10) || 2083, month: i + 1, day: parseInt(digits[1], 10) || 15 };
          }
        }
      }
    }
    if (valueAD) {
      const bs = convertADToBSFull(valueAD);
      return { year: bs.year, month: bs.month, day: bs.day };
    }
    return { year: 2083, month: 2, day: 15 }; // Default Jestha 15, 2083 BS
  };

  const initial = getInitialBS();
  const [yearBS, setYearBS] = useState<number>(initial.year);
  const [monthBS, setMonthBS] = useState<number>(initial.month);
  const [dayBS, setDayBS] = useState<number>(initial.day);
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);

  // Sync state if props change externally
  useEffect(() => {
    const init = getInitialBS();
    setYearBS(init.year);
    setMonthBS(init.month);
    setDayBS(init.day);
  }, [valueBS, valueAD]);

  // Total days in selected month
  const maxDays = getBSDaysInMonth(yearBS, monthBS);

  // Notify parent on change
  const triggerChange = (y: number, m: number, d: number) => {
    const safeDay = Math.min(d, getBSDaysInMonth(y, m));
    setYearBS(y);
    setMonthBS(m);
    setDayBS(safeDay);

    const formattedBS = `वि.सं. ${toDevanagariNumerals(y)} ${NEPALI_MONTH_NAMES[m - 1]} ${toDevanagariNumerals(safeDay)}`;
    const dateAD = convertBSToADFull(y, m, safeDay);

    onChange({
      yearBS: y,
      monthBS: m,
      dayBS: safeDay,
      formattedBS,
      dateAD,
    });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newY = parseInt(e.target.value, 10);
    triggerChange(newY, monthBS, dayBS);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newM = parseInt(e.target.value, 10);
    triggerChange(yearBS, newM, dayBS);
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newD = parseInt(e.target.value, 10);
    triggerChange(yearBS, monthBS, newD);
  };

  // Generate Year Options (1970 BS to 2100 BS)
  const yearsList = Array.from({ length: 131 }, (_, i) => 1970 + i);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#2D241E] dark:text-stone-300 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#D97706]" />
          <span>{label}</span>
        </label>
        <button
          type="button"
          onClick={() => setShowCalendarModal(!showCalendarModal)}
          className="text-[11px] font-bold text-[#D97706] hover:text-[#B45309] hover:underline flex items-center gap-1"
        >
          <span>पात्रो दृश्य</span>
        </button>
      </div>

      {/* 3 Dropdowns for Year, Month, Day in Devanagari */}
      <div className="grid grid-cols-3 gap-2">
        {/* Year Dropdown */}
        <div>
          <select
            value={yearBS}
            onChange={handleYearChange}
            required={required}
            className="w-full bg-[#FDFCF8] dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-2.5 py-2 text-xs font-bold text-[#2D241E] dark:text-stone-100 focus:ring-2 focus:ring-[#D97706]"
          >
            {yearsList.map((y) => (
              <option key={y} value={y}>
                वि.सं. {toDevanagariNumerals(y)}
              </option>
            ))}
          </select>
        </div>

        {/* Month Dropdown */}
        <div>
          <select
            value={monthBS}
            onChange={handleMonthChange}
            required={required}
            className="w-full bg-[#FDFCF8] dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-2 py-2 text-xs font-bold text-[#2D241E] dark:text-stone-100 focus:ring-2 focus:ring-[#D97706]"
          >
            {NEPALI_MONTH_NAMES.map((mName, idx) => (
              <option key={idx + 1} value={idx + 1}>
                {mName} ({toDevanagariNumerals(idx + 1)})
              </option>
            ))}
          </select>
        </div>

        {/* Day Dropdown */}
        <div>
          <select
            value={dayBS}
            onChange={handleDayChange}
            required={required}
            className="w-full bg-[#FDFCF8] dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-2 py-2 text-xs font-bold text-[#2D241E] dark:text-stone-100 focus:ring-2 focus:ring-[#D97706]"
          >
            {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {toDevanagariNumerals(d)} गते
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Date Preview Badge */}
      <div className="p-2 bg-amber-50 dark:bg-stone-800/80 border border-amber-200 dark:border-amber-800/40 rounded-xl text-center">
        <span className="text-xs font-serif font-bold text-[#D97706] dark:text-amber-400">
          वि.सं. {toDevanagariNumerals(yearBS)} {NEPALI_MONTH_NAMES[monthBS - 1]} {toDevanagariNumerals(dayBS)} गते
        </span>
      </div>

      {/* Calendar Modal Grid view */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 max-w-sm w-full shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
              <button
                type="button"
                onClick={() => {
                  if (monthBS === 1) {
                    triggerChange(yearBS - 1, 12, dayBS);
                  } else {
                    triggerChange(yearBS, monthBS - 1, dayBS);
                  }
                }}
                className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-stone-700 dark:text-stone-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="text-sm font-bold font-serif text-[#D97706]">
                  {NEPALI_MONTH_NAMES[monthBS - 1]} वि.सं. {toDevanagariNumerals(yearBS)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (monthBS === 12) {
                    triggerChange(yearBS + 1, 1, dayBS);
                  } else {
                    triggerChange(yearBS, monthBS + 1, dayBS);
                  }
                }}
                className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-stone-700 dark:text-stone-300"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Weekdays header */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-stone-500 py-1">
              {['आइत', 'सोम', 'मङ्गल', 'बुध', 'बिही', 'शुक्र', 'शनि'].map((w, idx) => (
                <div key={idx} className={idx === 6 ? 'text-red-500' : ''}>
                  {w}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    triggerChange(yearBS, monthBS, d);
                    setShowCalendarModal(false);
                  }}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    d === dayBS
                      ? 'bg-[#D97706] text-white shadow'
                      : 'hover:bg-amber-100 dark:hover:bg-amber-950/40 text-stone-800 dark:text-stone-200'
                  }`}
                >
                  {toDevanagariNumerals(d)}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowCalendarModal(false)}
              className="w-full py-1.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold rounded-xl hover:bg-stone-200"
            >
              बन्द गर्नुहोस्
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
