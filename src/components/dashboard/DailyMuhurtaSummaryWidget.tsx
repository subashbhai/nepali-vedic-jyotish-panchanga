import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  Sun,
  Moon,
  ChevronRight,
  Info,
  CalendarCheck,
  Flame,
  CheckCircle2,
  XCircle,
  Timer
} from 'lucide-react';
import { PanchangaData } from '../../types/astrology';

interface DailyMuhurtaSummaryWidgetProps {
  panchanga: PanchangaData;
  onNavigateToMuhurta?: () => void;
  className?: string;
}

// Convert "HH:MM AM/PM" or "HH:MM" string to minutes from midnight
function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  const cleaned = timeStr.trim();
  const match = cleaned.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
  if (!match) return null;

  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === 'PM' && h < 12) h += 12;
  if (meridiem === 'AM' && h === 12) h = 0;

  return h * 60 + m;
}

export const DailyMuhurtaSummaryWidget: React.FC<DailyMuhurtaSummaryWidgetProps> = ({
  panchanga,
  onNavigateToMuhurta,
  className = ''
}) => {
  const [currentMinutes, setCurrentMinutes] = useState<number>(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentMinutes(d.getHours() * 60 + d.getMinutes());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Compute status of key slots
  const slotEvaluations = useMemo(() => {
    const evaluate = (startStr?: string, endStr?: string) => {
      const s = parseTimeToMinutes(startStr);
      const e = parseTimeToMinutes(endStr);
      if (s === null || e === null) {
        return { isCurrent: false, isPassed: false, isUpcoming: false, diffMins: 0 };
      }
      if (currentMinutes >= s && currentMinutes <= e) {
        return { isCurrent: true, isPassed: false, isUpcoming: false, diffMins: e - currentMinutes };
      }
      if (currentMinutes > e) {
        return { isCurrent: false, isPassed: true, isUpcoming: false, diffMins: 0 };
      }
      return { isCurrent: false, isPassed: false, isUpcoming: true, diffMins: s - currentMinutes };
    };

    const abhijit = evaluate(panchanga?.abhijitMuhurta?.start, panchanga?.abhijitMuhurta?.end);
    const brahma = evaluate(panchanga?.brahmaMuhurta?.start, panchanga?.brahmaMuhurta?.end);
    const rahu = evaluate(panchanga?.rahuKaal?.start, panchanga?.rahuKaal?.end);
    const yama = evaluate(panchanga?.yamaganda?.start, panchanga?.yamaganda?.end);
    const gulika = evaluate(panchanga?.gulika?.start, panchanga?.gulika?.end);

    return { abhijit, brahma, rahu, yama, gulika };
  }, [panchanga, currentMinutes]);

  // Determine primary active alert (Rahu Kaal or Abhijit active right now)
  const activeAlert = useMemo(() => {
    if (slotEvaluations.rahu.isCurrent) {
      return {
        type: 'danger',
        title: 'अहिले राहुकाल चलिरहेको छ',
        desc: 'कुनै पनि नयाँ सम्झौता, यात्रा वा शुभ काम सुरु नगर्नुहोला।',
        timeRemaining: `${slotEvaluations.rahu.diffMins} मिनेट बाँकी`
      };
    }
    if (slotEvaluations.abhijit.isCurrent) {
      return {
        type: 'success',
        title: 'अहिले अभिजीत मुहूर्त चलिरहेको छ',
        desc: 'सर्वकार्य सिद्धिको महाशुभ समय! महत्त्वपूर्ण काम आरम्भ गर्न उत्तम।',
        timeRemaining: `${slotEvaluations.abhijit.diffMins} मिनेट बाँकी`
      };
    }
    if (slotEvaluations.yama.isCurrent) {
      return {
        type: 'warning',
        title: 'अहिले यमगण्ड काल चलिरहेको छ',
        desc: 'अशुभ काल, महत्त्वपूर्ण निर्णय वा लेनदेन नगर्नुहोला।',
        timeRemaining: `${slotEvaluations.yama.diffMins} मिनेट बाँकी`
      };
    }
    return null;
  }, [slotEvaluations]);

  return (
    <div className={`bg-white dark:bg-stone-900 rounded-2xl border border-amber-200/80 dark:border-stone-800 p-4 sm:p-5 shadow-sm space-y-4 ${className}`}>
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <span>दैनिक शुभ-अशुभ मुहूर्त समय</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold">
                आजको पञ्चाङ्ग
              </span>
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              अभिजीत, ब्रह्म, राहुकाल, यमगण्ड र गुलिक कालको वास्तविक समय
            </p>
          </div>
        </div>

        {onNavigateToMuhurta && (
          <button
            type="button"
            onClick={onNavigateToMuhurta}
            className="flex items-center gap-1 text-xs font-bold text-[#D97706] hover:text-[#b45309] hover:underline cursor-pointer"
          >
            <span>विस्तृत मुहूर्त</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Live Status Alert Banner if in Rahu Kaal or Abhijit */}
      {activeAlert && (
        <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs font-medium animate-pulse ${
          activeAlert.type === 'danger'
            ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            : activeAlert.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
            : 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
        }`}>
          <div className="flex items-center gap-2">
            {activeAlert.type === 'danger' ? (
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <div>
              <span className="font-bold">{activeAlert.title}</span>
              <span className="opacity-80 hidden sm:inline"> — {activeAlert.desc}</span>
            </div>
          </div>
          <span className="font-bold shrink-0 text-[11px] px-2 py-0.5 rounded bg-white/70 dark:bg-black/40">
            {activeAlert.timeRemaining}
          </span>
        </div>
      )}

      {/* Slots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Abhijit Muhurta (अभिजीत मुहूर्त) */}
        <div className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
          slotEvaluations.abhijit.isCurrent
            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 ring-2 ring-emerald-500/20'
            : slotEvaluations.abhijit.isPassed
            ? 'bg-stone-50/70 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 opacity-70'
            : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>अभिजीत मुहूर्त</span>
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              slotEvaluations.abhijit.isCurrent
                ? 'bg-emerald-600 text-white animate-pulse'
                : slotEvaluations.abhijit.isPassed
                ? 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
            }`}>
              {slotEvaluations.abhijit.isCurrent ? 'सक्रिय' : slotEvaluations.abhijit.isPassed ? 'समाप्त' : 'शुभ'}
            </span>
          </div>
          <div>
            <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
              {panchanga?.abhijitMuhurta?.start || '११:४० AM'} – {panchanga?.abhijitMuhurta?.end || '१२:३० PM'}
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
              सर्वकार्य सिद्धिको लागि दिनको सर्वोत्कृष्ट समय
            </p>
          </div>
        </div>

        {/* 2. Rahu Kaal (राहुकाल) */}
        <div className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
          slotEvaluations.rahu.isCurrent
            ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 ring-2 ring-rose-500/20'
            : slotEvaluations.rahu.isPassed
            ? 'bg-stone-50/70 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 opacity-70'
            : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>राहुकाल</span>
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              slotEvaluations.rahu.isCurrent
                ? 'bg-rose-600 text-white animate-pulse'
                : slotEvaluations.rahu.isPassed
                ? 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                : 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
            }`}>
              {slotEvaluations.rahu.isCurrent ? 'सक्रिय (अशुभ)' : slotEvaluations.rahu.isPassed ? 'समाप्त' : 'वर्जित'}
            </span>
          </div>
          <div>
            <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
              {panchanga?.rahuKaal?.start || '—'} – {panchanga?.rahuKaal?.end || '—'}
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
              नयाँ कार्य, यात्रा वा वित्तीय सम्झौता निषेध
            </p>
          </div>
        </div>

        {/* 3. Yamaganda Kaal (यमगण्ड काल) */}
        <div className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
          slotEvaluations.yama.isCurrent
            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 ring-2 ring-amber-500/20'
            : slotEvaluations.yama.isPassed
            ? 'bg-stone-50/70 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 opacity-70'
            : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>यमगण्ड काल</span>
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              slotEvaluations.yama.isCurrent
                ? 'bg-amber-600 text-white animate-pulse'
                : slotEvaluations.yama.isPassed
                ? 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
            }`}>
              {slotEvaluations.yama.isCurrent ? 'सक्रिय' : slotEvaluations.yama.isPassed ? 'समाप्त' : 'अशुभ'}
            </span>
          </div>
          <div>
            <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
              {panchanga?.yamaganda?.start || '—'} – {panchanga?.yamaganda?.end || '—'}
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
              महत्वपूर्ण कार्य तथा यात्रा नगर्नु उत्तम
            </p>
          </div>
        </div>

        {/* 4. Gulika & Brahma Muhurta */}
        <div className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
          slotEvaluations.gulika.isCurrent
            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400'
            : 'bg-stone-50/60 dark:bg-stone-900/50 border-stone-200 dark:border-stone-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-indigo-500" />
              <span>गुलिक काल</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-bold">
              {slotEvaluations.gulika.isCurrent ? 'सक्रिय' : 'सामान्य'}
            </span>
          </div>
          <div>
            <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
              {panchanga?.gulika?.start || '—'} – {panchanga?.gulika?.end || '—'}
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
              ब्रह्म मुहूर्त: {panchanga?.brahmaMuhurta?.start || '०४:१५ AM'} – {panchanga?.brahmaMuhurta?.end || '०५:०५ AM'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
