import React, { useState, useMemo } from 'react';
import {
  Timer,
  Calendar as CalendarIcon,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Info,
  ShieldAlert,
  HelpCircle,
  Search,
  Flame,
  Home,
  Briefcase,
  Heart,
  Car,
  Plane,
  X
} from 'lucide-react';
import { SubhaMuhurtaItem, DetailedMuhurtaItem, LocationData } from '../types/astrology';
import {
  generateSubhaMuhurtas,
  searchSubhaMuhurtasForRange,
  MUHURTA_CATEGORIES,
  askMuhurtaQuestion
} from '../utils/muhurtaEngine';
import { toDevanagariNumerals, convertADToBS } from '../utils/nepaliCalendar';

const CATEGORY_META: Record<string, { icon: any; color: string; bg: string; border: string; label: string }> = {
  vivah: { icon: Heart, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/60', border: 'border-rose-300 dark:border-rose-800', label: 'विवाह' },
  griha_pravesh: { icon: Home, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60', border: 'border-emerald-300 dark:border-emerald-800', label: 'गृहप्रवेश' },
  business_launch: { icon: Briefcase, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60', border: 'border-amber-300 dark:border-amber-800', label: 'व्यापार/पसल' },
  bartabandha: { icon: Flame, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/60', border: 'border-indigo-300 dark:border-indigo-800', label: 'व्रतबन्ध' },
  naamkaran: { icon: Sparkles, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/60', border: 'border-purple-300 dark:border-purple-800', label: 'नामकरण' },
  vehicle_purchase: { icon: Car, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/60', border: 'border-cyan-300 dark:border-cyan-800', label: 'सवारी खरिद' },
  journey: { icon: Plane, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/60', border: 'border-teal-300 dark:border-teal-800', label: 'यात्रा' },
};

const WEEKDAY_NAMES_NEPALI = ['आइत', 'सोम', 'मङ्गल', 'बुध', 'बिही', 'शुक्र', 'शनि'];

export const MuhurtaView: React.FC = () => {
  const [categoryKey, setCategoryKey] = useState<string>('vivah');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(5); // 1 to 12 (May = 5)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedDayDetails, setSelectedDayDetails] = useState<DetailedMuhurtaItem | null>(null);

  // Q&A search query
  const [faqQuestion, setFaqQuestion] = useState<string>('');
  const [faqAnswer, setFaqAnswer] = useState<string | null>(null);

  // Location configuration
  const defaultLocation: LocationData = {
    name: 'काठमाडौँ',
    country: 'नेपाल',
    latitude: 27.7172,
    longitude: 85.324,
    timeZone: 5.75,
  };

  // Month date range computation
  const { startDateAD, endDateAD, totalDaysInMonth, firstDayWeekday } = useMemo(() => {
    const monthStr = String(selectedMonth).padStart(2, '0');
    const start = `${selectedYear}-${monthStr}-01`;
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
    const end = `${selectedYear}-${monthStr}-${String(lastDay).padStart(2, '0')}`;
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();

    return {
      startDateAD: start,
      endDateAD: end,
      totalDaysInMonth: lastDay,
      firstDayWeekday: firstDay,
    };
  }, [selectedYear, selectedMonth]);

  // Compute detailed Muhurta items for the selected month and category
  const detailedMuhurtas = useMemo(() => {
    return searchSubhaMuhurtasForRange({
      activityKey: categoryKey as any,
      location: defaultLocation,
      startDateAD,
      endDateAD,
      minimumClassification: 'सामान्य',
    });
  }, [categoryKey, startDateAD, endDateAD]);

  // Also pre-fetch multi-category highlights for calendar markers (vivah, griha_pravesh, business_launch, bartabandha)
  const multiCategoryHighlights = useMemo(() => {
    const categoriesToScan = ['vivah', 'griha_pravesh', 'business_launch', 'bartabandha'];
    const map: Record<string, string[]> = {}; // dateAD -> array of category keys

    for (const cat of categoriesToScan) {
      const items = searchSubhaMuhurtasForRange({
        activityKey: cat as any,
        location: defaultLocation,
        startDateAD,
        endDateAD,
        minimumClassification: 'अनुकूल',
      });
      for (const item of items) {
        if (!map[item.dateAD]) map[item.dateAD] = [];
        if (!map[item.dateAD].includes(cat)) {
          map[item.dateAD].push(cat);
        }
      }
    }
    return map;
  }, [startDateAD, endDateAD]);

  // Map detailedMuhurtas by dateAD for quick calendar cell lookup
  const muhurtaByDateMap = useMemo(() => {
    const map = new Map<string, DetailedMuhurtaItem>();
    for (const item of detailedMuhurtas) {
      if (!map.has(item.dateAD) || item.qualityScore > (map.get(item.dateAD)?.qualityScore || 0)) {
        map.set(item.dateAD, item);
      }
    }
    return map;
  }, [detailedMuhurtas]);

  // Simple list for backward compatibility / quick card view
  const simpleList: SubhaMuhurtaItem[] = useMemo(() => {
    return generateSubhaMuhurtas(categoryKey, selectedYear, selectedMonth);
  }, [categoryKey, selectedYear, selectedMonth]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedYear(selectedYear - 1);
      setSelectedMonth(12);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedYear(selectedYear + 1);
      setSelectedMonth(1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const monthNamesNepali = [
    'जनवरी / पौष-माघ',
    'फेब्रुअरी / माघ-फाल्गुण',
    'मार्च / फाल्गुण-चैत्र',
    'अप्रिल / चैत्र-वैशाख',
    'मे / वैशाख-जेठ',
    'जुन / जेठ-असार',
    'जुलाई / असार-श्रावण',
    'अगस्ट / श्रावण-भाद्र',
    'सेप्टेम्बर / भाद्र-आश्विन',
    'अक्टोबर / आश्विन-कार्तिक',
    'नोभेम्बर / कार्तिक-मंसिर',
    'डिसेम्बर / मंसिर-पौष',
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Controls */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E6E0D5] dark:border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#D97706]/15 text-[#D97706] dark:text-amber-400">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-[#1A1A1A] dark:text-stone-100 flex items-center gap-2">
                <span>शुभ मुहूर्त पञ्चाङ्ग खोजक (Subha Muhurta Calendar)</span>
              </h2>
              <p className="text-xs text-[#78716C] dark:text-stone-400 mt-0.5">
                विवाह, गृहप्रवेश, व्यापार पसल आरम्भ तथा व्रतबन्ध आदिका लागि शास्त्रीय अनुकूल दिनहरू
              </p>
            </div>
          </div>

          {/* View Toggle & Month Navigation */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* View Switcher: Calendar vs List */}
            <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl border border-stone-200 dark:border-stone-700">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-white dark:bg-stone-700 text-[#D97706] dark:text-amber-300 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>मासिक क्यालेन्डर</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-stone-700 text-[#D97706] dark:text-amber-300 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>सूची दृश्य</span>
              </button>
            </div>

            {/* Month / Year selector controls */}
            <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl border border-stone-200 dark:border-stone-700">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 cursor-pointer"
                title="अघिल्लो महिना"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 text-xs font-bold text-stone-800 dark:text-stone-200 select-none">
                {monthNamesNepali[selectedMonth - 1]} {toDevanagariNumerals(selectedYear)}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 cursor-pointer"
                title="पछिल्लो महिना"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Categories Pills Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {MUHURTA_CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat.key] || {
              icon: Sparkles,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
              border: 'border-amber-200',
              label: cat.titleNepali,
            };
            const Icon = meta.icon;
            const isSelected = categoryKey === cat.key;

            return (
              <button
                key={cat.key}
                onClick={() => setCategoryKey(cat.key)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#D97706] text-white shadow-md scale-102 ring-2 ring-amber-500/20'
                    : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : meta.color}`} />
                <span>{cat.titleNepali}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW MODE 1: MONTHLY CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 p-4 sm:p-6 shadow-sm space-y-4">
          {/* Calendar Header Indicators */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-stone-700 dark:text-stone-300">रङ्गीन सङ्केत (Auspicious Highlights):</span>
              <div className="flex items-center gap-2 flex-wrap text-[11px]">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-800">
                  <Heart className="w-3 h-3" />
                  <span>विवाह</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                  <Home className="w-3 h-3" />
                  <span>गृहप्रवेश</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800">
                  <Briefcase className="w-3 h-3" />
                  <span>व्यापार/पसल</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
                  <Flame className="w-3 h-3" />
                  <span>व्रतबन्ध</span>
                </span>
              </div>
            </div>
            <span className="text-[11px] text-stone-500">
              * जुनसुकै दिनमा क्लिक गरी विस्तृत मुहूर्त विवरण हेर्नुहोस्
            </span>
          </div>

          {/* Weekday Column Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-stone-500 dark:text-stone-400 py-2 border-b border-stone-200 dark:border-stone-800">
            {WEEKDAY_NAMES_NEPALI.map((dayName, idx) => (
              <div key={dayName} className={idx === 6 ? 'text-rose-500' : ''}>
                {dayName}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Empty slots for month start offset */}
            {Array.from({ length: firstDayWeekday }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="min-h-[85px] sm:min-h-[110px] rounded-2xl bg-stone-50/40 dark:bg-stone-900/30 border border-stone-100 dark:border-stone-800/40 opacity-40"
              />
            ))}

            {/* Actual Days of the Month */}
            {Array.from({ length: totalDaysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateADStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayMuhurta = muhurtaByDateMap.get(dateADStr);
              const highlights = multiCategoryHighlights[dateADStr] || [];
              const bsConversion = convertADToBS(dateADStr);
              const isSelected = selectedDayDetails?.dateAD === dateADStr;

              return (
                <div
                  key={dateADStr}
                  onClick={() => {
                    if (dayMuhurta) {
                      setSelectedDayDetails(dayMuhurta);
                    } else {
                      // Generate on-the-fly candidate for this day
                      const items = searchSubhaMuhurtasForRange({
                        activityKey: categoryKey as any,
                        location: defaultLocation,
                        startDateAD: dateADStr,
                        endDateAD: dateADStr,
                        minimumClassification: 'त्याज्य',
                      });
                      if (items.length > 0) {
                        setSelectedDayDetails(items[0]);
                      }
                    }
                  }}
                  className={`min-h-[85px] sm:min-h-[110px] p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                    isSelected
                      ? 'bg-amber-100/90 dark:bg-amber-950/80 border-[#D97706] ring-2 ring-[#D97706]/30 shadow-md'
                      : dayMuhurta && dayMuhurta.qualityScore >= 70
                      ? 'bg-amber-50/60 dark:bg-stone-850 hover:bg-amber-100/50 border-amber-300 dark:border-amber-800/60 shadow-xs'
                      : 'bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800/50 border-stone-200 dark:border-stone-800'
                  }`}
                >
                  {/* Top Day numbers (AD & BS) */}
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-sm text-stone-900 dark:text-stone-100 font-mono">
                      {dayNum}
                    </span>
                    <span className="text-[10px] text-[#D97706] dark:text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                      {bsConversion.formattedBS.split(' ').slice(-1)[0] || 'वि.सं.'}
                    </span>
                  </div>

                  {/* Highlights Tags / Badges */}
                  <div className="space-y-1 my-1">
                    {/* Primary Muhurta for current active category */}
                    {dayMuhurta && (
                      <div className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 truncate border border-emerald-300 dark:border-emerald-800">
                        ⭐ {dayMuhurta.qualityScore >= 80 ? 'अति शुभ' : 'शुभ'} ({dayMuhurta.startTime})
                      </div>
                    )}

                    {/* Multi-category indicator badges */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {highlights.map((catKey) => {
                        const meta = CATEGORY_META[catKey];
                        if (!meta) return null;
                        const Icon = meta.icon;
                        return (
                          <span
                            key={catKey}
                            title={`${meta.label} मुहूर्त`}
                            className={`inline-flex items-center p-1 rounded-md text-[9px] font-bold ${meta.bg} ${meta.color} border ${meta.border}`}
                          >
                            <Icon className="w-2.5 h-2.5" />
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer hint */}
                  <div className="text-[9px] text-stone-400 dark:text-stone-500 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    विवरण →
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {detailedMuhurtas.length > 0 ? (
            detailedMuhurtas.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedDayDetails(m)}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-sm space-y-3 hover:border-amber-400 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-2">
                  <div>
                    <span className="text-sm font-bold text-[#1A1A1A] dark:text-stone-100">
                      {m.dateBS} ({m.dayNepali})
                    </span>
                    <span className="text-[10px] text-stone-500 block font-mono">
                      {m.dateAD}
                    </span>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
                    m.qualityScore >= 80
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-300'
                      : 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300'
                  }`}>
                    {m.classification} ({toDevanagariNumerals(m.qualityScore)}/१००)
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[#2D241E] dark:text-stone-200">
                  <p>⏱ समय अवधि: <strong>{m.startTime} देखि {m.endTime}</strong></p>
                  <p>🌙 तिथि: {m.panchangaSummary.tithi}</p>
                  <p>⭐ नक्षत्र: {m.panchangaSummary.nakshatra}</p>
                  <p>🪔 शुभ लग्न: {m.lagnaSummary.lagnaRashi} लग्न</p>
                </div>

                <div className="text-[11px] text-[#78716C] dark:text-stone-300 bg-[#FDFCF8] dark:bg-stone-800/80 p-2.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700/80">
                  {m.reasonsFavorableNepali.join(' • ') || 'सर्वकार्यसिद्धि मुहूर्त'}
                </div>
              </div>
            ))
          ) : (
            simpleList.map((m) => (
              <div
                key={m.id}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-2">
                  <span className="text-sm font-bold text-[#1A1A1A] dark:text-stone-100">{m.dateBS} ({m.dayNepali})</span>
                  <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-[10px] px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-700 font-bold">
                    {m.quality}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-[#2D241E] dark:text-stone-200">
                  <p>⏱ समय: <strong>{m.startTime} – {m.endTime}</strong></p>
                  <p>🌙 तिथि: {m.tithi}</p>
                  <p>⭐ नक्षत्र: {m.nakshatra}</p>
                  <p>🪔 लग्न: {m.lagna}</p>
                </div>
                <p className="text-[11px] text-[#78716C] dark:text-stone-300 bg-[#FDFCF8] dark:bg-stone-800/80 p-2 rounded-xl">
                  {m.specialNotesNepali}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* DAY DETAILS POPUP MODAL */}
      {selectedDayDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border-2 border-amber-400 dark:border-amber-600 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-[#D97706]" />
                  <span>{selectedDayDetails.activityNepali} मुहूर्त</span>
                </h3>
                <span className="text-xs text-stone-500 font-bold">
                  {selectedDayDetails.dateBS} ({selectedDayDetails.dayNepali}) • {selectedDayDetails.dateAD}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayDetails(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quality Score Badge */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                  शास्त्रीय अनुकूलता स्तर: {selectedDayDetails.classification}
                </span>
                <span className="text-[11px] text-stone-600 dark:text-stone-400">
                  शुभ समय: <strong>{selectedDayDetails.startTime} देखि {selectedDayDetails.endTime}</strong>
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-[#D97706]">
                {toDevanagariNumerals(selectedDayDetails.qualityScore)}/१००
              </div>
            </div>

            {/* Panchanga Breakdown */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-stone-800 dark:text-stone-200 border-b border-stone-100 dark:border-stone-800 pb-1">
                पञ्चाङ्ग स्थिति
              </h4>
              <div className="grid grid-cols-2 gap-2 text-stone-700 dark:text-stone-300">
                <div>तिथि: <strong>{selectedDayDetails.panchangaSummary.tithi} ({selectedDayDetails.panchangaSummary.paksha})</strong></div>
                <div>नक्षत्र: <strong>{selectedDayDetails.panchangaSummary.nakshatra}</strong></div>
                <div>योग: <strong>{selectedDayDetails.panchangaSummary.yoga}</strong></div>
                <div>करण: <strong>{selectedDayDetails.panchangaSummary.karana}</strong></div>
                <div>चन्द्र राशि: <strong>{selectedDayDetails.panchangaSummary.moonRashi}</strong></div>
                <div>लग्न: <strong>{selectedDayDetails.lagnaSummary.lagnaRashi} ({selectedDayDetails.lagnaSummary.lagnaLord})</strong></div>
              </div>
            </div>

            {/* Favorable Reasons */}
            {selectedDayDetails.reasonsFavorableNepali.length > 0 && (
              <div className="space-y-1.5 text-xs bg-emerald-50/50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>शुभ शास्त्रीय आधारहरू:</span>
                </span>
                <ul className="list-disc list-inside text-[11px] text-stone-700 dark:text-stone-300 space-y-0.5">
                  {selectedDayDetails.reasonsFavorableNepali.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cautionary Factors */}
            {selectedDayDetails.reasonsAvoidNepali.length > 0 && (
              <div className="space-y-1.5 text-xs bg-rose-50/50 dark:bg-rose-950/30 p-3 rounded-xl border border-rose-200 dark:border-rose-800/60">
                <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>सावधानी तथा त्याज्य पक्ष:</span>
                </span>
                <ul className="list-disc list-inside text-[11px] text-stone-700 dark:text-stone-300 space-y-0.5">
                  {selectedDayDetails.reasonsAvoidNepali.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={() => setSelectedDayDetails(null)}
              className="w-full py-2.5 rounded-xl bg-[#D97706] hover:bg-[#b45309] text-white font-bold text-xs transition cursor-pointer"
            >
              बन्द गर्नुहोस्
            </button>
          </div>
        </div>
      )}

      {/* Classical Muhurta Guidance FAQ Section */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#D97706]" />
          <span>शास्त्रीय मुहूर्त परामर्श तथा जिज्ञासा (Classical Guidance)</span>
        </h3>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="उदाहरण: विवाहको नियम, राहुकाल के हो?, ताराबल कसरी हेर्ने?..."
            value={faqQuestion}
            onChange={(e) => setFaqQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && faqQuestion.trim()) {
                setFaqAnswer(askMuhurtaQuestion(faqQuestion, detailedMuhurtas));
              }
            }}
            className="flex-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3.5 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="button"
            onClick={() => {
              if (faqQuestion.trim()) {
                setFaqAnswer(askMuhurtaQuestion(faqQuestion, detailedMuhurtas));
              }
            }}
            className="px-4 py-2 bg-[#D97706] hover:bg-[#b45309] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>सोध्नुहोस्</span>
          </button>
        </div>

        {faqAnswer && (
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-stone-800/70 border border-amber-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-line">
            {faqAnswer}
          </div>
        )}
      </div>
    </div>
  );
};
