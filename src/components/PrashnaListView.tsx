import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  Search, 
  Compass, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  Bot, 
  TrendingUp,
  Heart,
  Briefcase,
  GraduationCap,
  Shield,
  Plane,
  Home,
  Coins,
  Smile,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Award,
  Zap,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { BirthDetails, PanchangaData, LagnaInfo, PlanetPosition } from '../types/astrology';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { handlePhoneticInputKeyDown } from '../utils/nepaliTransliteration';
import { 
  PRASHNA_100_DATABASE, 
  PRASHNA_CATEGORY_METADATA, 
  PrashnaItem 
} from '../data/prashna100Database';
import { 
  calculateHoraryChart, 
  calculateNatalChart, 
  evaluatePrashna, 
  PrashnaEvaluationResult 
} from '../utils/prashnaEngine';

interface PrashnaListViewProps {
  activeProfile: BirthDetails | null;
  todayPanchanga?: PanchangaData;
  onNavigateToAIAssistant?: () => void;
  onNavigateToJyotish?: (subTab?: string) => void;
}

// Icon mapper for categories
const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  HelpCircle,
  Briefcase,
  TrendingUp,
  Coins,
  Heart,
  Smile,
  Shield,
  GraduationCap,
  Plane,
  Home,
  AlertCircle,
  Compass,
  Sparkles
};

export const PrashnaListView: React.FC<PrashnaListViewProps> = ({
  activeProfile,
  todayPanchanga,
  onNavigateToAIAssistant,
  onNavigateToJyotish,
}) => {
  // Chart calculation mode: 'horary' (real-time instant) vs 'natal' (querent's birth chart)
  const [chartMode, setChartMode] = useState<'horary' | 'natal'>('horary');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedQuestion, setSelectedQuestion] = useState<PrashnaItem | null>(null);
  const [evaluatedResult, setEvaluatedResult] = useState<PrashnaEvaluationResult | null>(null);
  
  // Real-time Horary chart state
  const [horaryChart, setHoraryChart] = useState<{
    lagnaInfo: LagnaInfo;
    planets: PlanetPosition[];
    timestampText: string;
  } | null>(null);

  // Compute or refresh Horary chart
  const refreshHoraryChart = useCallback(() => {
    const lat = activeProfile?.location?.latitude || 27.7172;
    const lon = activeProfile?.location?.longitude || 85.3240;
    const tz = activeProfile?.location?.timeZone ?? activeProfile?.location?.timezone ?? 5.75;
    const res = calculateHoraryChart(undefined, undefined, lat, lon, tz);
    setHoraryChart(res);
  }, [activeProfile]);

  // Initial load
  useEffect(() => {
    refreshHoraryChart();
  }, [refreshHoraryChart]);

  // Active chart based on mode
  const activeChart = useMemo(() => {
    if (chartMode === 'natal' && activeProfile) {
      return calculateNatalChart(activeProfile);
    }
    return horaryChart || calculateHoraryChart();
  }, [chartMode, activeProfile, horaryChart]);

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    const qLower = searchQuery.toLowerCase().trim();
    return PRASHNA_100_DATABASE.filter(item => {
      const matchCat = selectedCategory === 'all' || item.categoryId === selectedCategory;
      if (!matchCat) return false;
      if (!qLower) return true;

      const inQuestion = item.question.toLowerCase().includes(qLower);
      const inHouse = item.houseNameNepali.toLowerCase().includes(qLower);
      const inPlanets = item.significatorPlanets.some(p => p.toLowerCase().includes(qLower));
      const inTags = item.tags.some(t => t.toLowerCase().includes(qLower));
      const inSource = item.shloka.source.toLowerCase().includes(qLower);
      const inMeaning = item.shloka.meaning.toLowerCase().includes(qLower);

      return inQuestion || inHouse || inPlanets || inTags || inSource || inMeaning;
    });
  }, [selectedCategory, searchQuery]);

  // Handle open question details
  const handleSelectQuestion = (item: PrashnaItem) => {
    setSelectedQuestion(item);
    if (activeChart) {
      const evaluation = evaluatePrashna(
        item,
        activeChart.lagnaInfo,
        activeChart.planets,
        chartMode,
        activeChart.timestampText
      );
      setEvaluatedResult(evaluation);
    }
  };

  // When chart mode changes while modal is open, re-evaluate
  useEffect(() => {
    if (selectedQuestion && activeChart) {
      const evaluation = evaluatePrashna(
        selectedQuestion,
        activeChart.lagnaInfo,
        activeChart.planets,
        chartMode,
        activeChart.timestampText
      );
      setEvaluatedResult(evaluation);
    }
  }, [chartMode, activeChart, selectedQuestion]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 px-2 sm:px-4">
      {/* 1. Header Hero Banner */}
      <div className="bg-gradient-to-r from-[#7A1C1C] via-[#8F2424] to-[#5C1515] text-amber-50 rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-500/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-xs font-bold tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>वैदिक प्रश्न ज्योतिष विज्ञान (Horary Astrology) — ११६ शास्त्रीय प्रश्नहरू</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-serif text-white tracking-wide">
              शास्त्रीय प्रश्न संग्रह तथा कुण्डली फलादेश
            </h1>
            <p className="text-xs sm:text-sm text-amber-100/90 max-w-3xl leading-relaxed">
              बृहत् पराशर होरा शास्त्र, प्रश्न मार्ग, भृगु संहिता, षट्पञ्चाशिका, फलदीपिका र ताजिक नीलकण्ठीमा आधारित प्रमाणिक संस्कृत श्लोक, नेपाली व्याख्या तथा कुण्डलीको गणितीय विश्लेषण।
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            {onNavigateToAIAssistant && (
              <button
                type="button"
                onClick={onNavigateToAIAssistant}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg border border-amber-200/80 flex items-center gap-2 transition-transform transform active:scale-95 cursor-pointer"
              >
                <Bot className="w-4 h-4 text-stone-950" />
                <span>AI ज्योतिषीसँग सोध्नुहोस्</span>
              </button>
            )}
            {onNavigateToJyotish && (
              <button
                type="button"
                onClick={() => onNavigateToJyotish('prashna')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-2xl border border-white/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4 text-amber-300" />
                <span>प्रश्न कुण्डली कार्यक्षेत्र</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Chart Mode Switcher & Active Lagna Indicator */}
      <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400 mr-1">
              फलादेश कुण्डली आधार:
            </span>
            <button
              type="button"
              onClick={() => setChartMode('horary')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                chartMode === 'horary'
                  ? 'bg-[#7A1C1C] text-white shadow-md border border-amber-400/50'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-300" />
              <span>तात्कालिक प्रश्न कुण्डली (अहिलेको समय)</span>
            </button>

            <button
              type="button"
              onClick={() => setChartMode('natal')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                chartMode === 'natal'
                  ? 'bg-[#7A1C1C] text-white shadow-md border border-amber-400/50'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <UserCheck className="w-4 h-4 text-amber-300" />
              <span>
                {activeProfile ? `जातकको जन्म कुण्डली (${activeProfile.name})` : 'जातकको जन्म कुण्डली'}
              </span>
            </button>
          </div>

          {chartMode === 'horary' && (
            <button
              type="button"
              onClick={refreshHoraryChart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-stone-800 text-[#7A1C1C] dark:text-amber-400 text-xs font-bold border border-amber-200 dark:border-stone-700 hover:bg-amber-100 cursor-pointer self-end lg:self-center transition-colors"
              title="ताजा समय र लग्न पुनः गणना"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>लग्न पुनः गणना (Refresh)</span>
            </button>
          )}
        </div>

        {/* Live Active Lagna & Planetary Status Bar */}
        {activeChart && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/70 via-stone-50 to-orange-50/70 dark:from-stone-800/80 dark:via-stone-800/50 dark:to-stone-800/80 border border-amber-200/80 dark:border-stone-700 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-stone-800 dark:text-stone-200 font-medium">
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#7A1C1C] dark:text-amber-400 shrink-0" />
                <span>
                  <strong>{chartMode === 'horary' ? 'प्रश्न लग्न' : 'जन्म लग्न'}:</strong>{' '}
                  <span className="font-bold text-[#7A1C1C] dark:text-amber-300">
                    {activeChart.lagnaInfo.rashiName} ({activeChart.lagnaInfo.formattedDegree})
                  </span>{' '}
                  (स्वामी: {activeChart.lagnaInfo.lord})
                </span>
              </span>

              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  <strong>नक्षत्र:</strong> {activeChart.lagnaInfo.nakshatraName} (पाद {toDevanagariNumerals(activeChart.lagnaInfo.pada)})
                </span>
              </span>

              {(() => {
                const moon = activeChart.planets.find(p => p.name === 'चन्द्र');
                return moon ? (
                  <span className="flex items-center gap-1.5">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">☽</span>
                    <span>
                      <strong>चन्द्र राशि:</strong> {moon.rashiName} ({toDevanagariNumerals(moon.bhava || 1)}ौँ भाव)
                    </span>
                  </span>
                ) : null;
              })()}
            </div>

            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
              {activeChart.timestampText}
            </div>
          </div>
        )}
      </div>

      {/* 3. Search & Category Filters */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="प्रश्न, भाव वा कारक खोज्नुहोस् (उदा: nokari, biwaha, dhan, court)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => handlePhoneticInputKeyDown(e, searchQuery, setSearchQuery)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="text-xs text-stone-500 dark:text-stone-400 font-medium self-end sm:self-center">
            कुल फेला परेका प्रश्नहरू:{' '}
            <strong className="text-stone-900 dark:text-stone-100 font-bold text-sm">
              {toDevanagariNumerals(filteredQuestions.length)}
            </strong>{' '}
            / {toDevanagariNumerals(PRASHNA_100_DATABASE.length)}
          </div>
        </div>

        {/* 13 Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {PRASHNA_CATEGORY_METADATA.map(cat => {
            const Icon = ICON_MAP[cat.icon] || HelpCircle;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#7A1C1C] text-white shadow-md border border-amber-400/40'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{cat.title}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                  isActive ? 'bg-amber-400 text-stone-950' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                }`}>
                  {toDevanagariNumerals(cat.count)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Questions Grid (116 questions) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQuestions.map((q, idx) => {
          return (
            <div
              key={q.id}
              onClick={() => handleSelectQuestion(q)}
              className="bg-white dark:bg-stone-900 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-sm hover:shadow-md hover:border-amber-400/80 dark:hover:border-amber-700 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-stone-800 text-[#7A1C1C] dark:text-amber-400 border border-amber-200 dark:border-stone-700">
                    {q.categoryTitle}
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-400">
                    #{toDevanagariNumerals(idx + 1)}
                  </span>
                </div>

                <h3 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 group-hover:text-[#7A1C1C] dark:group-hover:text-amber-400 transition-colors leading-snug">
                  {q.question}
                </h3>

                <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-300">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="font-bold text-stone-500 dark:text-stone-400">सम्बन्धित भाव:</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                      {q.houseNameNepali}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="font-bold text-stone-500 dark:text-stone-400">कारक ग्रह:</span>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {q.significatorPlanets.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="font-bold text-stone-500 dark:text-stone-400">शास्त्र प्रमाण:</span>
                    <span className="font-medium text-amber-700 dark:text-amber-400 truncate">
                      {q.shloka.source.split('—')[0]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-[#7A1C1C] dark:text-amber-400 group-hover:text-amber-600 transition-colors">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>श्लोक तथा फलादेश हेर्नुहोस्</span>
                </span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-8 space-y-3">
          <HelpCircle className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto" />
          <h4 className="text-base font-bold text-stone-700 dark:text-stone-300">
            कुनै प्रश्न फेला परेन
          </h4>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            कृपया खोजी शब्द परिवर्तन गर्नुहोस् वा &quot;सबै प्रश्नहरू&quot; श्रेणी चयन गर्नुहोस्।
          </p>
        </div>
      )}

      {/* 5. Comprehensive Question Details & Kundali Evaluation Modal */}
      {selectedQuestion && evaluatedResult && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-amber-300/80 dark:border-stone-700 max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-stone-800 text-[#7A1C1C] dark:text-amber-300 border border-amber-200 dark:border-stone-700 text-xs font-bold">
                  <span>{selectedQuestion.categoryTitle}</span>
                  <span>•</span>
                  <span>{selectedQuestion.houseNameNepali}</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 dark:text-stone-100 font-serif leading-snug">
                  ❓ {selectedQuestion.question}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedQuestion(null);
                  setEvaluatedResult(null);
                }}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 flex items-center justify-center font-bold text-sm shrink-0 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Success Probability Meter */}
            <div className={`p-5 rounded-3xl border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 ${
              evaluatedResult.verdictGrade === 'excellent'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                : evaluatedResult.verdictGrade === 'good'
                ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-100'
                : evaluatedResult.verdictGrade === 'moderate'
                ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100'
                : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100'
            }`}>
              <div className="space-y-1.5 text-center sm:text-left">
                <span className="text-xs font-bold tracking-wide uppercase opacity-80 flex items-center gap-1.5 justify-center sm:justify-start">
                  <Award className="w-4 h-4" />
                  <span>कुण्डली अनुसार कार्यसिद्धि सम्भावना</span>
                </span>
                <h4 className="text-lg font-extrabold font-serif">
                  {evaluatedResult.verdictTitle}
                </h4>
                <p className="text-xs leading-relaxed opacity-90 max-w-xl">
                  {evaluatedResult.verdictSummary}
                </p>
              </div>

              <div className="shrink-0 flex flex-col items-center justify-center p-4 rounded-2xl bg-white/90 dark:bg-stone-900/90 border border-current shadow-sm w-32 h-32">
                <span className="text-3xl font-black font-serif">
                  {toDevanagariNumerals(evaluatedResult.successScore)}%
                </span>
                <span className="text-[10px] font-bold text-center mt-1">
                  {evaluatedResult.verdictGrade === 'excellent' ? 'शीघ्र सिद्धि' : evaluatedResult.verdictGrade === 'good' ? 'प्रयासले सिद्धि' : 'धैर्य आवश्यक'}
                </span>
              </div>
            </div>

            {/* Kundali Alignment Diagnostics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-stone-50 dark:bg-stone-800/70 rounded-2xl border border-stone-200 dark:border-stone-700">
                <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 block mb-1">
                  लग्न / प्रच्छक
                </span>
                <span className="font-extrabold text-stone-900 dark:text-stone-100 block">
                  {evaluatedResult.lagnaInfo.rashiName}
                </span>
                <span className="text-[11px] text-stone-600 dark:text-stone-300">
                  लग्नेश: {evaluatedResult.lagneshaName} ({toDevanagariNumerals(evaluatedResult.lagneshaPosition?.bhava || 1)}ौँ भाव)
                </span>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-800/70 rounded-2xl border border-stone-200 dark:border-stone-700">
                <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 block mb-1">
                  कार्य भाव / कार्येश
                </span>
                <span className="font-extrabold text-stone-900 dark:text-stone-100 block">
                  {toDevanagariNumerals(evaluatedResult.karyaBhava)}ौँ भाव ({evaluatedResult.karyaRashiName})
                </span>
                <span className="text-[11px] text-stone-600 dark:text-stone-300">
                  कार्येश: {evaluatedResult.karyeshaName} ({toDevanagariNumerals(evaluatedResult.karyeshaPosition?.bhava || 1)}ौँ भाव)
                </span>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-800/70 rounded-2xl border border-stone-200 dark:border-stone-700">
                <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 block mb-1">
                  लग्नेश-कार्येश सम्बन्ध
                </span>
                <span className="font-extrabold text-[#7A1C1C] dark:text-amber-400 block truncate">
                  {evaluatedResult.lagneshaKaryeshaRelation.split('(')[0]}
                </span>
                <span className="text-[11px] text-stone-600 dark:text-stone-300">
                  {evaluatedResult.relationType === 'parivartana' || evaluatedResult.relationType === 'conjunction' || evaluatedResult.relationType === 'mutual_aspect'
                    ? 'अत्यन्त अनुकूल'
                    : evaluatedResult.relationType === 'trikona' || evaluatedResult.relationType === 'upachaya'
                    ? 'शुभ संयोग'
                    : 'सतर्कता'}
                </span>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-800/70 rounded-2xl border border-stone-200 dark:border-stone-700">
                <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 block mb-1">
                  सम्भावित समय
                </span>
                <span className="font-extrabold text-stone-900 dark:text-stone-100 block">
                  {evaluatedResult.timingForecast.split(' ')[0]}
                </span>
                <span className="text-[11px] text-stone-600 dark:text-stone-300 truncate block">
                  {evaluatedResult.favorableDirection}
                </span>
              </div>
            </div>

            {/* Classical Sanskrit Shloka Card */}
            <div className="bg-gradient-to-br from-amber-50/90 via-stone-50 to-amber-100/60 dark:from-stone-800/90 dark:via-stone-800 dark:to-stone-800/90 rounded-3xl p-5 sm:p-6 border-2 border-amber-300 dark:border-amber-700/60 space-y-4 shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-amber-200 dark:border-stone-700 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#7A1C1C] dark:text-amber-400" />
                  <span className="font-extrabold text-xs uppercase tracking-wider text-[#7A1C1C] dark:text-amber-300">
                    शास्त्रोक्त प्रमाणिक श्लोक (Sanskrit Shloka)
                  </span>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-200/70 dark:bg-stone-700 text-stone-900 dark:text-stone-100 border border-amber-300 dark:border-stone-600">
                  📜 {selectedQuestion.shloka.source}
                </span>
              </div>

              {/* Shloka Verse Box */}
              <div className="p-4 bg-white/90 dark:bg-stone-900/90 rounded-2xl border border-amber-200 dark:border-stone-700 text-center font-serif text-sm sm:text-base font-extrabold text-[#7A1C1C] dark:text-amber-200 leading-relaxed shadow-inner whitespace-pre-line tracking-wide">
                {selectedQuestion.shloka.sanskrit}
              </div>

              <div className="space-y-2.5 text-xs text-stone-800 dark:text-stone-200 leading-relaxed">
                <div>
                  <strong className="text-[#7A1C1C] dark:text-amber-400 block mb-0.5">
                    नेपाली सरल अर्थ:
                  </strong>
                  <p>{selectedQuestion.shloka.meaning}</p>
                </div>

                <div className="pt-2 border-t border-amber-200/60 dark:border-stone-700/60">
                  <strong className="text-stone-700 dark:text-stone-300 block mb-0.5">
                    विस्तृत शास्त्रीय व्याख्या:
                  </strong>
                  <p className="text-stone-600 dark:text-stone-300">
                    {selectedQuestion.shloka.vyakhya}
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Kundali Analysis */}
            <div className="bg-stone-50 dark:bg-stone-800/60 rounded-3xl p-5 border border-stone-200 dark:border-stone-700 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>तपाईंको कुण्डली अनुसार शास्त्रीय फलादेश विश्लेषण:</span>
              </h4>
              <div className="text-xs text-stone-700 dark:text-stone-300 space-y-2 leading-relaxed">
                <p className="whitespace-pre-line font-medium">
                  {evaluatedResult.kundaliAnalysisNepali}
                </p>
              </div>
            </div>

            {/* Vedic Remedy Box */}
            <div className="bg-orange-50/80 dark:bg-stone-800/80 rounded-3xl p-5 border border-orange-200 dark:border-stone-700 space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#7A1C1C] dark:text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>शास्त्रोक्त वैदिक शान्ति तथा उपाय:</span>
              </h4>
              <p className="text-xs text-stone-800 dark:text-stone-200 font-medium leading-relaxed">
                {selectedQuestion.vedicRemedy}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
              <div className="text-[11px] text-stone-500 dark:text-stone-400">
                कुण्डली आधार:{' '}
                <strong>
                  {chartMode === 'horary' ? 'तात्कालिक प्रश्न कुण्डली' : 'जातक जन्म कुण्डली'}
                </strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedQuestion(null);
                    setEvaluatedResult(null);
                  }}
                  className="px-4 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-2xl text-xs font-bold cursor-pointer transition-colors"
                >
                  बन्द गर्नुहोस्
                </button>

                {onNavigateToJyotish && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedQuestion(null);
                      setEvaluatedResult(null);
                      onNavigateToJyotish('prashna');
                    }}
                    className="px-4 py-2.5 bg-[#7A1C1C] hover:bg-[#5C1515] text-white rounded-2xl text-xs font-extrabold shadow-md cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <Compass className="w-3.5 h-3.5 text-amber-300" />
                    <span>पूर्ण कुण्डली चक्रमा हेर्नुहोस्</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
