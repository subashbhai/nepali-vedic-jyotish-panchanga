import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Sun,
  Flame,
  User,
  Filter,
  Info,
  Layers,
  Zap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { BirthDetails, PlanetPosition, LagnaInfo } from '../../types/astrology';
import {
  calculateUpcomingTransits,
  DayTransitStatus,
  UpcomingTransitEvent,
  TransitImpactNature
} from '../../utils/upcomingTransitEngine';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';
import { NavTab } from '../Navigation';

interface UpcomingTransitWidgetProps {
  activeProfile: BirthDetails | null;
  birthMoon?: PlanetPosition;
  birthLagna?: LagnaInfo;
  startDateAD?: string;
  onNavigate?: (tab: NavTab) => void;
  className?: string;
}

type WidgetTab = 'calendar' | 'events' | 'planets';

export const UpcomingTransitWidget: React.FC<UpcomingTransitWidgetProps> = ({
  activeProfile,
  birthMoon,
  birthLagna,
  startDateAD,
  onNavigate,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<WidgetTab>('calendar');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [eventFilter, setEventFilter] = useState<'all' | 'major' | 'chandrashtama'>('all');

  // Calculate 30-day transits based on active profile
  const report = useMemo(() => {
    return calculateUpcomingTransits({
      activeProfile,
      birthMoon,
      birthLagna,
      startDateAD,
      daysCount: 30
    });
  }, [activeProfile, birthMoon, birthLagna, startDateAD]);

  const selectedDay: DayTransitStatus = report.days[selectedDayIndex] || report.days[0];

  // Filtered events
  const filteredEvents = useMemo(() => {
    if (eventFilter === 'major') {
      return report.events.filter(
        (e) => e.planetName !== 'चन्द्र' || e.eventType === 'sankranti'
      );
    }
    if (eventFilter === 'chandrashtama') {
      return report.events.filter(
        (e) => e.eventType === 'chandrashtama_start' || e.eventType === 'chandrashtama_end'
      );
    }
    return report.events;
  }, [report.events, eventFilter]);

  // Planet summary list for 30-day tracking
  const planetSummaries = useMemo(() => {
    const todayPlanets = report.days[0]?.planets || [];
    return todayPlanets.map((p) => {
      const transitsForPlanet = report.events.filter(
        (e) => e.planetName === p.name && e.eventType === 'rashi_ingress'
      );
      return {
        ...p,
        upcomingShift: transitsForPlanet[0] || null
      };
    });
  }, [report.days, report.events]);

  const getScoreBadgeClass = (score: number, isChandrashtama: boolean) => {
    if (isChandrashtama) {
      return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800';
    }
    if (score >= 70) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800';
    }
    if (score >= 50) {
      return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800';
    }
    return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800';
  };

  const getScoreProgressColor = (score: number, isChandrashtama: boolean) => {
    if (isChandrashtama) return 'bg-rose-500';
    if (score >= 70) return 'bg-emerald-500';
    if (score >= 50) return 'bg-blue-500';
    return 'bg-amber-500';
  };

  return (
    <div
      id="upcoming-planetary-transits-widget"
      className={`bg-white dark:bg-stone-900 rounded-2xl border-2 border-amber-300 dark:border-amber-900/60 p-5 sm:p-6 shadow-md space-y-5 transition-all ${className}`}
    >
      {/* 1. WIDGET HEADER */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-amber-200 dark:border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-sm">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-serif text-stone-900 dark:text-amber-100">
                  आगामी ३० दिनको ग्रह गोचर क्यालेन्डर
                </h2>
                <span className="bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                  ३० दिनको समयतालिका
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                जन्मकुण्डली (चन्द्र राशि एवं लग्न) अनुसार आगामी ३० दिनका महत्वपूर्ण ग्रह परिवर्तन तथा दैनिक अनुकूलता
              </p>
            </div>
          </div>
        </div>

        {/* ACTIVE PROFILE CONTEXT BADGE */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-amber-50 dark:bg-stone-800/90 border border-amber-200 dark:border-stone-700 px-3.5 py-1.5 rounded-xl flex items-center gap-2.5 shadow-2xs">
            <div className="w-7 h-7 rounded-full bg-amber-200 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 flex items-center justify-center font-bold text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-stone-900 dark:text-amber-200 flex items-center gap-1.5">
                <span>{report.profileName}</span>
                <span className="text-[10px] bg-amber-200/70 dark:bg-stone-700 px-1.5 py-0.2 rounded font-semibold text-amber-900 dark:text-amber-300">
                  {report.natalMoonRashi} राशि
                </span>
              </div>
            </div>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('gochar')}
              className="text-xs font-bold text-[#D97706] hover:text-[#b45309] dark:text-amber-400 flex items-center gap-1 hover:underline cursor-pointer bg-amber-500/10 dark:bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-500/20"
            >
              <span>पूर्ण गोचर चक्र</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. STATS & KEY HIGHLIGHTS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Auspicious Days */}
        <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 p-3 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium block">
              अनुकूल दिनहरू
            </span>
            <span className="text-base font-bold text-emerald-950 dark:text-emerald-100 font-mono">
              {toDevanagariNumerals(report.auspiciousDaysCount)} दिन
            </span>
          </div>
        </div>

        {/* Metric 2: Caution / Chandrashtama */}
        <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 p-3 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-rose-800 dark:text-rose-300 font-medium block">
              चन्द्राष्टम / सतर्कता
            </span>
            <span className="text-base font-bold text-rose-950 dark:text-rose-100 font-mono">
              {toDevanagariNumerals(report.chandrashtamaDays.length)} दिन
            </span>
          </div>
        </div>

        {/* Metric 3: Total Transit Events */}
        <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 p-3 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-blue-800 dark:text-blue-300 font-medium block">
              ग्रह राशि परिवर्तन
            </span>
            <span className="text-base font-bold text-blue-950 dark:text-blue-100 font-mono">
              {toDevanagariNumerals(report.totalEventsCount)} पटक
            </span>
          </div>
        </div>

        {/* Metric 4: Average Score */}
        <div className="bg-amber-50/70 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 p-3 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-stone-700 dark:text-stone-300 font-medium block">
              औसत गोचर अनुकूलता
            </span>
            <span className="text-base font-bold text-stone-900 dark:text-amber-100 font-mono">
              {toDevanagariNumerals(
                Math.round(
                  report.days.reduce((acc, d) => acc + d.score, 0) / report.days.length
                )
              )}
              %
            </span>
          </div>
        </div>
      </div>

      {/* 3. KEY HIGHLIGHTS TICKER */}
      {report.keyHighlights.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 dark:from-stone-800 dark:to-stone-800/60 border border-amber-200 dark:border-stone-700 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300 shrink-0">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>३०-दिने मुख्य गोचर संकेत:</span>
          </div>
          <div className="text-stone-700 dark:text-stone-300 flex-1 space-y-1">
            {report.keyHighlights.map((hl, idx) => (
              <p key={idx} className="leading-snug">
                {hl}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 4. TAB NAVIGATION CONTROLS */}
      <div className="flex items-center gap-2 border-b border-amber-200 dark:border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'calendar'
              ? 'bg-[#D97706] text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-amber-100 dark:hover:bg-stone-700'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>३०-दिने समयतालिका (Calendar)</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'events'
              ? 'bg-[#D97706] text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-amber-100 dark:hover:bg-stone-700'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>प्रमुख गोचर घटनाक्रम ({toDevanagariNumerals(report.events.length)})</span>
        </button>

        <button
          onClick={() => setActiveTab('planets')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'planets'
              ? 'bg-[#D97706] text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-amber-100 dark:hover:bg-stone-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>९ ग्रह गोचर ट्रयाकर</span>
        </button>
      </div>

      {/* 5. TAB CONTENT 1: 30-DAY TIMELINE & INTERACTIVE CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          {/* Quick jump actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-stone-700 dark:text-stone-300">
              दिन छान्नुहोस् (Click on any day to view planetary details):
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSelectedDayIndex(0)}
                className="px-2.5 py-1 bg-amber-100 dark:bg-stone-800 hover:bg-amber-200 text-stone-800 dark:text-stone-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
              >
                आज (Today)
              </button>
              {report.chandrashtamaDays[0] && (
                <button
                  onClick={() => setSelectedDayIndex(report.chandrashtamaDays[0].dayIndex)}
                  className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950/70 hover:bg-rose-200 text-rose-800 dark:text-rose-300 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>चन्द्राष्टम दिन</span>
                </button>
              )}
            </div>
          </div>

          {/* Horizontally scrollable 30-day timeline strip */}
          <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-300 dark:scrollbar-thumb-stone-700">
            <div className="flex items-stretch gap-2 min-w-max">
              {report.days.map((d) => {
                const isSelected = d.dayIndex === selectedDayIndex;
                const badgeClass = getScoreBadgeClass(d.score, d.isChandrashtama);

                return (
                  <button
                    key={d.dateAD}
                    onClick={() => setSelectedDayIndex(d.dayIndex)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between w-24 shrink-0 relative ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-700 shadow-md ring-2 ring-amber-400 scale-[1.03]'
                        : d.isChandrashtama
                        ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 hover:bg-rose-100'
                        : 'bg-white dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    {/* Today Pill */}
                    {d.isToday && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] bg-red-700 text-white font-bold px-1.5 py-0.2 rounded-full shadow-2xs">
                        आज
                      </span>
                    )}

                    <div>
                      {/* Day of Week & AD Date */}
                      <span
                        className={`text-[10px] font-bold block ${
                          isSelected ? 'text-amber-100' : 'text-stone-500 dark:text-stone-400'
                        }`}
                      >
                        {d.dayOfWeekShort}
                      </span>
                      <span className="text-xs font-black block mt-0.5 leading-none">
                        {d.dateBS.split(' ').slice(1).join(' ')}
                      </span>
                      <span
                        className={`text-[9px] block mt-0.5 font-mono ${
                          isSelected ? 'text-amber-200' : 'text-stone-400'
                        }`}
                      >
                        {d.dateAD.split('-').slice(1).join('/')}
                      </span>
                    </div>

                    {/* Moon Rashi */}
                    <div
                      className={`text-[10px] font-semibold mt-1.5 py-0.5 px-1 rounded-md ${
                        isSelected
                          ? 'bg-amber-700/80 text-white'
                          : 'bg-stone-100 dark:bg-stone-700/60 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      ☽ {d.moonRashi}
                    </div>

                    {/* Score badge / Chandrashtama warning */}
                    <div className="mt-1.5">
                      {d.isChandrashtama ? (
                        <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>चन्द्राष्टम</span>
                        </span>
                      ) : (
                        <div className="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${
                              isSelected
                                ? 'bg-white'
                                : getScoreProgressColor(d.score, d.isChandrashtama)
                            }`}
                            style={{ width: `${d.score}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Event Marker Dot */}
                    {d.eventsCount > 0 && (
                      <span
                        className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse"
                        title={`${d.eventsCount} वटा गोचर घटना`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SELECTED DAY DEEP DIVE PANEL */}
          <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/40 dark:from-stone-800 dark:to-stone-800/60 border-2 border-amber-300/80 dark:border-stone-700 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200 dark:border-stone-700 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-500 dark:text-stone-400">
                    छानिएको मितिको विश्लेषण:
                  </span>
                  {selectedDay.isToday && (
                    <span className="bg-red-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      आज
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-amber-100 flex items-center gap-2 mt-0.5">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>
                    {selectedDay.dateBS} ({selectedDay.dayOfWeekNepali}) • {selectedDay.dateAD}
                  </span>
                </h3>
              </div>

              {/* Day Auspiciousness Meter */}
              <div
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${getScoreBadgeClass(
                  selectedDay.score,
                  selectedDay.isChandrashtama
                )}`}
              >
                {selectedDay.isChandrashtama ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>⚠️ चन्द्राष्टम सतर्कता (८औँ भाव चन्द्र)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>
                      गोचर अनुकूलता: {toDevanagariNumerals(selectedDay.score)}% ({selectedDay.nature})
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* If Chandrashtama on selected day: Warning & Guidance Box */}
            {selectedDay.isChandrashtama && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-900 dark:text-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>चन्द्राष्टम विशेष सल्लाह (Chandrashtama Remedial Care):</span>
                </div>
                <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                  आज चन्द्रमा {report.profileName}को जन्म चन्द्र राशि ({report.natalMoonRashi}) बाट ८औँ भाव ({selectedDay.moonRashi}) मा गोचर गर्दै हुनुहुन्छ। यस समयमा नयाँ आर्थिक लगानी, महत्त्वपूर्ण सम्झौता, र लामो यात्रामा विशेष संयम अपनाउनुहोला।
                </p>
                <div className="text-[11px] text-rose-900 dark:text-rose-200 font-semibold flex items-center gap-2 pt-1 border-t border-rose-200 dark:border-rose-800/80">
                  <span>उपाय:</span>
                  <span>भगवान् शिवको मन्दिरमा जल चढाउने वा "ॐ नमः शिवाय" मन्त्रको १०८ पटक जप गर्ने।</span>
                </div>
              </div>
            )}

            {/* Events occurring on this selected day (if any) */}
            {selectedDay.events.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>यस दिन हुने प्रमुख गोचर घटना:</span>
                </span>
                <div className="space-y-2">
                  {selectedDay.events.map((ev) => (
                    <div
                      key={ev.id}
                      className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-700 p-3 rounded-xl space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 dark:text-amber-200 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
                            {ev.glyph}
                          </span>
                          <span>{ev.titleNepali}</span>
                        </span>
                        <span className="text-[10px] bg-amber-100 dark:bg-stone-800 px-2 py-0.5 rounded font-medium text-amber-900 dark:text-amber-200">
                          {ev.nature}
                        </span>
                      </div>
                      <p className="text-stone-700 dark:text-stone-300 text-[11px] leading-relaxed">
                        {ev.summaryNepali}
                      </p>
                      {ev.remedyNepali && (
                        <div className="text-[10px] text-amber-800 dark:text-amber-400 font-medium">
                          <strong>उपाय:</strong> {ev.remedyNepali}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9 Graha Positions relative to Native's Moon on this day */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
                यस दिन ९ ग्रहहरूको गोचर स्थिति (चन्द्र राशि {report.natalMoonRashi} बाट भाव स्थिति):
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5 text-center">
                {selectedDay.planets.map((pl) => (
                  <div
                    key={pl.name}
                    className={`p-2 rounded-xl border text-xs flex flex-col items-center justify-center ${
                      pl.isAuspicious
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : pl.name === 'चन्द्र' && selectedDay.isChandrashtama
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 font-bold'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <span className="font-mono text-xs opacity-70">{pl.glyph}</span>
                    <span className="font-bold text-[11px] mt-0.5">{pl.name}</span>
                    <span className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold truncate">
                      {pl.rashiName}
                    </span>
                    <span
                      className={`text-[9px] mt-1 px-1 rounded font-medium ${
                        pl.isAuspicious
                          ? 'bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-200'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      {toDevanagariNumerals(pl.houseFromMoon)} भाव
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB CONTENT 2: MAJOR TRANSIT EVENTS FEED */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-amber-100 dark:border-stone-800 pb-2">
            <span className="font-bold text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-amber-600" />
              <span>गोचर वर्गीकरण:</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setEventFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer ${
                  eventFilter === 'all'
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                सबै ({toDevanagariNumerals(report.events.length)})
              </button>
              <button
                onClick={() => setEventFilter('major')}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer ${
                  eventFilter === 'major'
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                प्रमुख ग्रह परिवर्तन
              </button>
              <button
                onClick={() => setEventFilter('chandrashtama')}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer ${
                  eventFilter === 'chandrashtama'
                    ? 'bg-rose-700 text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
              >
                चन्द्राष्टम
              </button>
            </div>
          </div>

          {/* Events List */}
          {filteredEvents.length === 0 ? (
            <div className="p-6 text-center text-stone-500 dark:text-stone-400 text-xs">
              यस वर्गीकरण अन्तर्गत कुनै विशेष गोचर भेटिएन।
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredEvents.map((ev) => {
                const isChandraAshtama = ev.eventType === 'chandrashtama_start';

                return (
                  <div
                    key={ev.id}
                    className={`p-4 rounded-2xl border transition-all space-y-2.5 shadow-2xs ${
                      isChandraAshtama
                        ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                        : ev.nature === 'अति शुभ' || ev.nature === 'शुभ'
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-white dark:bg-stone-800/80 border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    {/* Header line */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-200 flex items-center justify-center font-bold text-base">
                          {ev.glyph}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-stone-900 dark:text-amber-100">
                            {ev.titleNepali}
                          </h4>
                          <span className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>
                              {ev.dateBS} ({ev.dayOfWeekNepali}) •{' '}
                              {ev.daysFromNow === 0
                                ? 'आज'
                                : ev.daysFromNow === 1
                                ? 'भोलि'
                                : `${toDevanagariNumerals(ev.daysFromNow)} दिन पछि`}
                            </span>
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isChandraAshtama
                            ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/60 dark:text-rose-200'
                            : ev.nature === 'अति शुभ' || ev.nature === 'शुभ'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200'
                            : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/60 dark:text-amber-200'
                        }`}
                      >
                        {ev.nature}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                      {ev.summaryNepali}
                    </p>

                    {/* Remedy */}
                    {ev.remedyNepali && (
                      <div className="bg-white/80 dark:bg-stone-900/80 p-2 rounded-lg border border-amber-200/60 dark:border-stone-700 text-[11px] text-stone-800 dark:text-stone-300 space-y-0.5">
                        <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-amber-600" />
                          <span>उपाय:</span>
                        </div>
                        <p>{ev.remedyNepali}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 7. TAB CONTENT 3: 9-PLANET TRACKER */}
      {activeTab === 'planets' && (
        <div className="space-y-3">
          <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block">
            आगामी ३० दिनमा ९ ग्रहहरूको गति एवं राशि स्थानान्तरण विवरण:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {planetSummaries.map((p) => {
              const isChandra = p.name === 'चन्द्र';

              return (
                <div
                  key={p.name}
                  className="bg-white dark:bg-stone-800 border border-amber-200 dark:border-stone-700 p-3.5 rounded-xl space-y-2 text-xs shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-900 dark:text-amber-200 flex items-center justify-center font-bold text-sm">
                        {p.glyph}
                      </div>
                      <div>
                        <div className="font-bold text-stone-900 dark:text-amber-100 flex items-center gap-1">
                          <span>{p.name}</span>
                          {p.isRetrograde && (
                            <span className="text-[9px] bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 px-1 rounded font-bold">
                              वक्री
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400">
                          हाल: {p.rashiName} ({p.formattedDegree})
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.isAuspicious
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : 'bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {toDevanagariNumerals(p.houseFromMoon)} भाव
                    </span>
                  </div>

                  {/* Upcoming transit movement info */}
                  <div className="bg-amber-50/70 dark:bg-stone-900/60 p-2 rounded-lg border border-amber-200/50 dark:border-stone-700/80 text-[11px]">
                    {p.upcomingShift ? (
                      <div>
                        <span className="font-bold text-amber-900 dark:text-amber-300 block">
                          ३० दिन भित्र राशि परिवर्तन:
                        </span>
                        <span className="text-stone-700 dark:text-stone-300">
                          {p.upcomingShift.dateBS} ({toDevanagariNumerals(p.upcomingShift.daysFromNow)} दिन पछि) मा{' '}
                          <strong>{p.upcomingShift.toRashi} राशि</strong> (
                          {toDevanagariNumerals(p.upcomingShift.houseFromMoon)} औँ भाव) प्रवेश।
                        </span>
                      </div>
                    ) : isChandra ? (
                      <span className="text-stone-600 dark:text-stone-400">
                        प्रत्येक २.२५ दिनमा राशि परिवर्तन गर्दछ (महिनामा १२ वटै राशि भ्रमण)।
                      </span>
                    ) : (
                      <span className="text-stone-500 dark:text-stone-400">
                        आगामी ३० दिनसम्म {p.rashiName} राशिमै गोचर जारी रहनेछ।
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
