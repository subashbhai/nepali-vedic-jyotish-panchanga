import React, { useMemo, useState } from 'react';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Clock,
  Palette,
  Shield,
  Layers,
  ArrowRight,
  Info,
  Flame,
  Droplets,
  Wind,
  Mountain,
  Sun
} from 'lucide-react';
import { 
  BirthDetails, 
  PanchangaData, 
  LagnaInfo, 
  PlanetPosition 
} from '../../types/astrology';
import { 
  getDailyVastuSuggestion, 
  DailyVastuSuggestion 
} from '../../utils/dailyVastuEngine';

interface DailyVastuWidgetProps {
  panchanga: PanchangaData;
  activeProfile: BirthDetails | null;
  lagna?: LagnaInfo;
  planets?: PlanetPosition[];
  onNavigateToVastu?: () => void;
  className?: string;
}

export const DailyVastuWidget: React.FC<DailyVastuWidgetProps> = ({
  panchanga,
  activeProfile,
  lagna,
  planets,
  onNavigateToVastu,
  className = ''
}) => {
  const [showFullDetails, setShowFullDetails] = useState(false);

  const suggestion: DailyVastuSuggestion = useMemo(() => {
    return getDailyVastuSuggestion(panchanga, activeProfile, lagna, planets);
  }, [panchanga, activeProfile, lagna, planets]);

  const getElementIcon = (elem: string) => {
    switch (elem) {
      case 'जल':
        return <Droplets className="w-3.5 h-3.5 text-sky-400" />;
      case 'अग्नि':
        return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      case 'वायु':
        return <Wind className="w-3.5 h-3.5 text-teal-400" />;
      case 'पृथ्वी':
        return <Mountain className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Sun className="w-3.5 h-3.5 text-yellow-400" />;
    }
  };

  return (
    <div
      id="dashboard-vastu-suggestion-card"
      className={`bg-white dark:bg-stone-900 rounded-2xl border border-amber-200/80 dark:border-stone-800 shadow-sm relative overflow-hidden transition-all duration-200 ${className}`}
    >
      {/* Decorative top accent line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-emerald-600 to-amber-600" />

      <div className="p-5 sm:p-6 space-y-4">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-[#D97706] dark:text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shrink-0 shadow-inner">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                  दैनिक वास्तु सल्लाह (Daily Vastu)
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                  {panchanga.dateBS} ({panchanga.dayNameNepali})
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-serif text-[#1A1A1A] dark:text-stone-100 mt-0.5">
                {suggestion.titleNepali}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {onNavigateToVastu && (
              <button
                id="view-full-vastu-btn"
                onClick={onNavigateToVastu}
                className="text-xs text-[#D97706] hover:text-[#b45309] dark:text-amber-400 dark:hover:text-amber-300 bg-amber-50 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 border border-amber-300 dark:border-stone-700 px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>पूर्ण वास्तु नक्सा</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Natal Context & Recommendation Banner */}
        <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/40 dark:from-stone-800/80 dark:to-stone-850 border border-amber-200/70 dark:border-stone-700 rounded-xl p-4 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-serif">
              {suggestion.recommendationNepali}
            </p>
          </div>

          {/* Quick Badges / Pill Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
            <span className="inline-flex items-center gap-1 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 px-2.5 py-1 rounded-lg font-medium shadow-2xs">
              <Compass className="w-3.5 h-3.5 text-[#D97706]" />
              <span>केन्द्रित दिशा: <strong className="text-stone-900 dark:text-stone-100">{suggestion.primaryDirection}</strong></span>
            </span>

            <span className="inline-flex items-center gap-1 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 px-2.5 py-1 rounded-lg font-medium shadow-2xs">
              {getElementIcon(suggestion.elementNepali)}
              <span>तत्व: <strong className="text-stone-900 dark:text-stone-100">{suggestion.elementNepali}</strong></span>
            </span>

            <span className="inline-flex items-center gap-1 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 px-2.5 py-1 rounded-lg font-medium shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>उत्तम समय: <strong className="text-stone-900 dark:text-stone-100">{suggestion.auspiciousTimeWindowNepali}</strong></span>
            </span>

            <span className="inline-flex items-center gap-1 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 px-2.5 py-1 rounded-lg font-medium shadow-2xs">
              <Palette className="w-3.5 h-3.5 text-rose-500" />
              <span>शुभ रङ्ग: <strong className="text-stone-900 dark:text-stone-100">{suggestion.auspiciousColor}</strong></span>
            </span>
          </div>
        </div>

        {/* Actionable Two-Column Checklist (Do vs Avoid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Favorable action */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-3.5 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                आज गर्नुपर्ने शुभ कार्य (Do):
              </span>
              <p className="text-xs text-emerald-900 dark:text-emerald-100 leading-relaxed font-sans">
                {suggestion.doActionNepali}
              </p>
            </div>
          </div>

          {/* Avoid action */}
          <div className="bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl p-3.5 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wide">
                आज बार्नुपर्ने / गर्न नहुने (Avoid):
              </span>
              <p className="text-xs text-rose-900 dark:text-rose-100 leading-relaxed font-sans">
                {suggestion.avoidActionNepali}
              </p>
            </div>
          </div>
        </div>

        {/* Micro Remedy & Natal Alignment Bar */}
        <div className="bg-stone-50 dark:bg-stone-800/60 border border-[#E6E0D5] dark:border-stone-700/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/10 text-[#D97706] dark:text-amber-400 rounded-lg shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <div>
              <span className="font-bold text-stone-900 dark:text-stone-100">सुलभ दैनिक उपाय: </span>
              <span className="text-stone-600 dark:text-stone-300">{suggestion.microRemedyNepali}</span>
            </div>
          </div>

          <div className="text-[11px] text-stone-500 dark:text-stone-400 italic shrink-0">
            {suggestion.natalAlignmentTextNepali}
          </div>
        </div>
      </div>
    </div>
  );
};
