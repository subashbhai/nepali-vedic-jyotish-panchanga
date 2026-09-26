import React, { useState, useMemo, memo } from 'react';
import { 
  Newspaper, 
  Search, 
  Calendar, 
  Clock, 
  Eye, 
  Share2, 
  Flame, 
  ChevronRight, 
  X, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  MessageCircle,
  Globe2,
  Compass,
  ArrowRight,
  ShieldAlert,
  Sun,
  Moon,
  Zap,
  Filter,
  Layers,
  BookOpen
} from 'lucide-react';
import { PlanetPosition, PlanetName, RashiName, PanchangaData } from '../types/astrology';
import { RASHI_DATA } from '../data/rashiData';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { getCachedAstroCalculation } from '../utils/astroCache';
import { getWhatsAppShareUrl } from '../db/samacharStore';
import { 
  generateLiveGrahaGocharNews, 
  getConsolidatedRashiTransitForecast, 
  GrahaGocharNewsArticle, 
  RashiTransitImpact 
} from '../utils/grahaGocharNewsEngine';

interface SamacharViewProps {
  todayTransitPlanets?: PlanetPosition[];
  todayPanchanga?: PanchangaData;
  todayAD?: string;
  todayBS?: string;
  onOpenAdminEditor?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const SamacharView: React.FC<SamacharViewProps> = memo(({
  todayTransitPlanets: propTransitPlanets,
  todayPanchanga: propPanchanga,
  todayAD: propTodayAD,
  todayBS: propTodayBS,
  onOpenAdminEditor,
  onNavigateTab
}) => {
  // Current Date Fallback
  const activeTodayAD = propTodayAD || new Date().toISOString().split('T')[0];
  const activeTodayBS = propTodayBS || '२०८३-०५-२५';

  // Obtain Live Astronomical Positions
  const livePlanets: PlanetPosition[] = useMemo(() => {
    if (propTransitPlanets && propTransitPlanets.length >= 9) {
      return propTransitPlanets;
    }
    // Fallback: Compute real-time ephemeris using AstroCache
    try {
      const calc = getCachedAstroCalculation(activeTodayAD, '06:00', 27.7172, 85.3240, 5.75);
      return calc.planets;
    } catch (e) {
      console.error('Failed to compute live planets for Samachar:', e);
      return propTransitPlanets || [];
    }
  }, [propTransitPlanets, activeTodayAD]);

  // Generate 9 Live Planetary News Articles
  const liveArticles: GrahaGocharNewsArticle[] = useMemo(() => {
    return generateLiveGrahaGocharNews(livePlanets, activeTodayBS, activeTodayAD);
  }, [livePlanets, activeTodayBS, activeTodayAD]);

  // View States
  const [activeTab, setActiveTab] = useState<'9_graha_news' | '12_rashi_forecast'>('9_graha_news');
  const [selectedPlanetFilter, setSelectedPlanetFilter] = useState<PlanetName | 'all'>('all');
  const [selectedRashiId, setSelectedRashiId] = useState<number>(1); // 1 = मेष
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<GrahaGocharNewsArticle | null>(null);
  const [modalRashiFilter, setModalRashiFilter] = useState<number | 'all'>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  // Filtered Articles for 9 Planets View
  const filteredArticles = useMemo(() => {
    return liveArticles.filter((art) => {
      const matchesPlanet = selectedPlanetFilter === 'all' || art.planet === selectedPlanetFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        art.title.toLowerCase().includes(q) ||
        art.headline.toLowerCase().includes(q) ||
        art.leadSummary.toLowerCase().includes(q) ||
        art.planet.toLowerCase().includes(q) ||
        art.currentRashi.toLowerCase().includes(q) ||
        art.nakshatra.toLowerCase().includes(q) ||
        art.rashiImpacts.some(ri => ri.rashiName.toLowerCase().includes(q) || ri.summary.toLowerCase().includes(q));

      return matchesPlanet && matchesSearch;
    });
  }, [liveArticles, selectedPlanetFilter, searchQuery]);

  // Breaking / Featured Planet (e.g., Sun, Moon or Saturn)
  const breakingArticle = useMemo(() => {
    return liveArticles.find((a) => a.planet === 'सूर्य') || liveArticles[0];
  }, [liveArticles]);

  // Consolidated 12-Rashi Report for the selected sign
  const consolidatedReport = useMemo(() => {
    return getConsolidatedRashiTransitForecast(selectedRashiId, livePlanets);
  }, [selectedRashiId, livePlanets]);

  // Handlers
  const handleOpenArticle = (art: GrahaGocharNewsArticle) => {
    setSelectedArticle(art);
    setModalRashiFilter('all');
  };

  const handleCopyShareLink = (art: GrahaGocharNewsArticle) => {
    const url = `${window.location.origin}/?tab=samachar&planet=${encodeURIComponent(art.planet)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = (art: GrahaGocharNewsArticle) => {
    const shareUrl = `${window.location.origin}/?tab=samachar&planet=${encodeURIComponent(art.planet)}`;
    const text = `*📰 ${art.headline}*\n\n` +
      `🪐 *ग्रह स्थिति:* ${art.planet} (${art.currentRashi} राशि, ${art.degreeStr}, ${art.nakshatra} नक्षत्र, चरण ${art.pada})\n` +
      `✨ *अवस्था:* ${art.motionStatus}\n\n` +
      `${art.leadSummary}\n\n` +
      `👉 *१२ वटै राशिका लागि विस्तृत फलादेश र उपाय पढ्नुहोस्:*\n${shareUrl}`;
    window.open(getWhatsAppShareUrl('', text), '_blank');
  };

  const handleShareRashiWhatsApp = (rashiName: string) => {
    const shareUrl = `${window.location.origin}/?tab=samachar&rashi=${selectedRashiId}`;
    const text = `*♈ ${rashiName} राशि - आजको प्रत्यक्ष ९ ग्रह गोचर फलादेश*\n\n` +
      `📊 *समग्र गोचर अनुकूलता:* ${consolidatedReport.overallScorePercent}% (${consolidatedReport.overallNature})\n` +
      `🪐 *शनि स्थिति:* ${consolidatedReport.sadeSatiOrDhaiyyaStatus}\n` +
      `💡 *दैनिक सल्लाह:* ${consolidatedReport.dailyAdvice}\n` +
      `🙏 *शान्ति उपाय:* ${consolidatedReport.primaryRemedy}\n\n` +
      `👉 *सम्पूर्ण ९ ग्रहको प्रत्यक्ष प्रभाव हेर्नुहोस्:*\n${shareUrl}`;
    window.open(getWhatsAppShareUrl('', text), '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#7A1C1C] via-[#9B2C2C] to-[#5C1515] text-white rounded-2xl p-5 sm:p-6 shadow-lg border border-amber-500/30 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Globe2 className="w-80 h-80 text-amber-300" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 px-3 py-1 rounded-full text-amber-200 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              <Globe2 className="w-3.5 h-3.5 text-amber-300" />
              <span>प्रत्यक्ष खगोल तथा ९ ग्रह गोचर समाचार केन्द्र (Live Transit News)</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif tracking-wide text-amber-50">
              प्रत्यक्ष ग्रह गोचर तथा १२ राशि फलादेश समाचार
            </h1>

            <p className="text-xs sm:text-sm text-stone-200 max-w-3xl leading-relaxed">
              सुद्ध दृक्सिद्धान्त खगोल गणना अनुसार नवग्रहहरू (सूर्य, चन्द्र, मंगल, बुध, गुरु, शुक्र, शनि, राहु, केतु) को वास्तविक राशि, अंश, कला, नक्षत्र र १२ वटै राशिमा पर्ने प्रत्यक्ष प्रभाव र शास्त्रीय फलादेश
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-amber-200/90 font-medium">
              <span className="flex items-center gap-1 bg-black/30 px-2.5 py-0.5 rounded-md border border-white/10">
                <Calendar className="w-3 h-3 text-amber-400" />
                वि.सं. {activeTodayBS} ({activeTodayAD})
              </span>
              <span className="flex items-center gap-1 bg-black/30 px-2.5 py-0.5 rounded-md border border-white/10">
                <Clock className="w-3 h-3 text-amber-400" />
                प्रत्यक्ष लाइभ अपडेट
              </span>
              <span className="flex items-center gap-1 bg-black/30 px-2.5 py-0.5 rounded-md border border-white/10">
                <Compass className="w-3 h-3 text-amber-400" />
                काठमाडौँ मानक (८५°१९' पू, २७°४३' उ)
              </span>
            </div>
          </div>

          {/* Admin Editor Button */}
          {onOpenAdminEditor && (
            <div className="shrink-0 self-start md:self-center">
              <button
                type="button"
                onClick={onOpenAdminEditor}
                className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer text-xs sm:text-sm"
                title="समाचार सम्पादन तथा थप व्यवस्थापन"
              >
                <ShieldCheck className="w-4 h-4 text-[#7A1C1C]" />
                <span>सम्पादक ड्यासबोर्ड</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Live 9-Graha Real-time Position Ticker */}
      <div className="bg-amber-950/80 dark:bg-stone-900 border border-amber-800/60 rounded-2xl p-3 shadow-md overflow-hidden">
        <div className="flex items-center gap-2 mb-2 px-1 text-xs font-bold text-amber-300">
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>९ ग्रहको वर्तमान खगोलीय स्थिति (Live Ephemeris Degrees):</span>
          <span className="text-[10px] text-stone-400 font-normal hidden sm:inline">(कुनै पनि ग्रहमा क्लिक गरी पूर्ण समाचार पढ्नुहोस्)</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {liveArticles.map((art) => (
            <button
              key={art.planet}
              type="button"
              onClick={() => handleOpenArticle(art)}
              className="shrink-0 flex items-center gap-2 bg-black/40 hover:bg-amber-900/60 border border-amber-700/50 hover:border-amber-400 px-3 py-1.5 rounded-xl text-left transition-all cursor-pointer group"
            >
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-serif text-xs font-bold group-hover:scale-110 transition-transform">
                {art.symbol}
              </span>
              <div className="text-[11px] leading-tight">
                <div className="font-bold text-amber-100 flex items-center gap-1">
                  <span>{art.planet}</span>
                  <span className="text-[10px] text-amber-300 font-normal">({art.currentRashi})</span>
                </div>
                <div className="text-[10px] text-amber-200/80 font-mono">
                  {art.degreeStr} • {art.nakshatra} ({art.pada})
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Primary Mode Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-2 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('9_graha_news')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === '9_graha_news'
                ? 'bg-[#7A1C1C] text-white shadow-md'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Newspaper className="w-4 h-4 text-amber-400" />
            <span>९ ग्रहका प्रत्यक्ष गोचर समाचार</span>
            <span className="text-[10px] bg-amber-400 text-stone-950 font-black px-1.5 py-0.2 rounded-full">९ ग्रह</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('12_rashi_forecast')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === '12_rashi_forecast'
                ? 'bg-[#7A1C1C] text-white shadow-md'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>१२ राशि समेकित गोचर फलादेश</span>
            <span className="text-[10px] bg-emerald-500 text-white font-black px-1.5 py-0.2 rounded-full">१२ राशि</span>
          </button>
        </div>

        {activeTab === '9_graha_news' && (
          <div className="text-xs text-stone-500 dark:text-stone-400 self-end sm:self-center pr-2">
            कुल लाइभ ग्रह समाचार: <strong className="text-stone-800 dark:text-stone-200">{toDevanagariNumerals(filteredArticles.length)}</strong> वटा
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: 9 GRAHA LIVE TRANSIT NEWS FEED (सबै ९ ग्रह एकै पृष्ठमा) */}
      {/* ========================================================================= */}
      {activeTab === '9_graha_news' && (
        <div className="space-y-6">
          {/* Planet Chips & Search Bar */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Planet filter buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 scrollbar-none text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedPlanetFilter('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedPlanetFilter === 'all'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  सबै ९ ग्रह
                </button>
                {liveArticles.map((art) => (
                  <button
                    key={art.planet}
                    type="button"
                    onClick={() => setSelectedPlanetFilter(art.planet)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      selectedPlanetFilter === art.planet
                        ? 'bg-[#7A1C1C] text-white font-bold shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    <span>{art.symbol}</span>
                    <span>{art.planet}</span>
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-72 shrink-0">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ग्रह, राशि वा नक्षत्र खोज्नुहोस्..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Breaking Lead Banner Article */}
          {selectedPlanetFilter === 'all' && !searchQuery && breakingArticle && (
            <div 
              onClick={() => handleOpenArticle(breakingArticle)}
              className="group bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 text-white rounded-2xl border border-amber-500/40 p-5 sm:p-6 shadow-xl hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row gap-5 items-start justify-between">
                <div className="space-y-3 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="flex items-center gap-1.5 bg-red-600 text-white px-2.5 py-0.5 rounded-full font-black animate-pulse">
                      <Flame className="w-3.5 h-3.5" />
                      प्रमुख खगोलीय समाचार
                    </span>
                    <span className="bg-amber-500/30 text-amber-200 px-2.5 py-0.5 rounded-full font-semibold border border-amber-400/30">
                      {breakingArticle.planet} • {breakingArticle.currentRashi} राशिमा {breakingArticle.degreeStr}
                    </span>
                    <span className="bg-white/10 text-stone-200 px-2 py-0.5 rounded-md">
                      {breakingArticle.nakshatra} नक्षत्र (चरण {breakingArticle.pada})
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-serif text-amber-100 group-hover:text-amber-300 transition-colors leading-snug">
                    {breakingArticle.headline}
                  </h2>

                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed line-clamp-3">
                    {breakingArticle.leadSummary}
                  </p>

                  {/* Beneficiary vs Cautionary Badges */}
                  <div className="pt-2 flex flex-wrap gap-2 text-xs">
                    <div className="bg-emerald-950/80 border border-emerald-700/60 px-2.5 py-1 rounded-lg text-emerald-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <strong>विशेष लाभ:</strong> {breakingArticle.beneficiaryRashis.slice(0, 4).join(', ')}
                    </div>
                    <div className="bg-rose-950/80 border border-rose-700/60 px-2.5 py-1 rounded-lg text-rose-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <strong>सतर्कता:</strong> {breakingArticle.cautionaryRashis.slice(0, 3).join(', ')}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex lg:flex-col items-center gap-3 w-full lg:w-auto justify-between lg:justify-center pt-3 lg:pt-0 border-t lg:border-t-0 border-white/10">
                  <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex flex-col items-center justify-center text-amber-300 shadow-inner">
                    <span className="text-3xl font-serif">{breakingArticle.symbol}</span>
                    <span className="text-[10px] font-bold mt-0.5">{breakingArticle.planet}</span>
                  </div>
                  <span className="flex items-center gap-1 text-amber-300 font-bold text-xs group-hover:translate-x-1 transition-transform">
                    पूर्ण फलादेश पढ्नुहोस् <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 9-Planet News Grid - Guaranteed all 9 planets on 1 page */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#7A1C1C] dark:text-amber-400" />
                <span>९ वटै ग्रहहरूको प्रत्यक्ष समाचार तथा १२ राशि फलादेश बुलेटिन</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArticles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => handleOpenArticle(art)}
                  className="group bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  {/* Card Header with Planet Symbol & Astronomical Coordinates */}
                  <div className="p-4 bg-gradient-to-r from-amber-50/80 via-stone-50 to-amber-50/40 dark:from-stone-850 dark:to-stone-800 border-b border-stone-200 dark:border-stone-800">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs">
                          {art.symbol}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-stone-950 dark:text-stone-100 group-hover:text-[#7A1C1C] dark:group-hover:text-amber-400 transition-colors">
                            {art.planet} ग्रह
                          </h3>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                            {art.currentRashi} राशि • {art.degreeStr}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          art.isRetrograde
                            ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {art.isRetrograde ? 'वक्री (R)' : 'मार्गी'}
                        </span>
                        <div className="text-[10px] text-stone-500 mt-1">
                          {art.nakshatra} ({art.pada})
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug line-clamp-2">
                        {art.headline}
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-3">
                        {art.leadSummary}
                      </p>
                    </div>

                    {/* Beneficiary Preview */}
                    <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px]">
                      <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                        <span>✨ विशेष शुभ:</span>
                        <span className="font-bold">{art.beneficiaryRashis.slice(0, 3).join(', ')}</span>
                      </div>
                      <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 font-medium">
                        <span>⚠️ सावधानी:</span>
                        <span className="font-bold">{art.cautionaryRashis.slice(0, 3).join(', ')}</span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500">
                      <span className="flex items-center gap-1 font-bold text-[#7A1C1C] dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                        १२ राशि फलादेश पढ्नुहोस् <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareWhatsApp(art);
                        }}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        title="WhatsApp मा सेयर गर्नुहोस्"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: 12 RASHIS CONSOLIDATED TRANSIT FORECAST (आफ्नो राशि अनुसार) */}
      {/* ========================================================================= */}
      {activeTab === '12_rashi_forecast' && (
        <div className="space-y-6">
          {/* 12 Rashi Selection Bar */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-600" />
                <span>तपाईंको जन्म चन्द्र राशि वा लग्न राशि छान्नुहोस्:</span>
              </span>
              <span className="text-xs text-stone-500">
                चयन गरिएको राशि: <strong className="text-[#7A1C1C] dark:text-amber-400">{consolidatedReport.rashiName} ({consolidatedReport.symbol})</strong>
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5">
              {RASHI_DATA.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRashiId(r.id)}
                  className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all cursor-pointer border ${
                    selectedRashiId === r.id
                      ? 'bg-[#7A1C1C] text-white border-amber-400 shadow-md scale-102 font-bold'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-base font-serif">{r.symbol}</span>
                  <span className="text-xs">{r.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Consolidated Rashi Overview Banner */}
          <div className="bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 text-white rounded-2xl border border-amber-600/40 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-700/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/30 border border-amber-400/50 flex items-center justify-center font-serif text-3xl text-amber-200">
                  {consolidatedReport.symbol}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-100">
                    {consolidatedReport.rashiName} राशि ({consolidatedReport.symbol}) — आजको प्रत्यक्ष ९ ग्रह गोचर विश्लेषण
                  </h2>
                  <p className="text-xs text-amber-300/90 mt-0.5">
                    राशि स्वामी: <strong>{consolidatedReport.lord}</strong> • तत्त्व: <strong>{consolidatedReport.element}</strong> • ९ वटै ग्रहहरूको संयुक्त गोचर गणना
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center">
                <button
                  type="button"
                  onClick={() => handleShareRashiWhatsApp(consolidatedReport.rashiName)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
                  title="WhatsApp मा यो राशिको फलादेश सेयर गर्नुहोस्"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp मा सेयर</span>
                </button>

                <div className="bg-black/40 border border-amber-500/40 px-3.5 py-2 rounded-xl text-center">
                  <div className="text-[10px] text-amber-300">गोचर अनुकूलता</div>
                  <div className="text-base font-bold text-amber-100">{consolidatedReport.overallScorePercent}%</div>
                </div>
              </div>
            </div>

            {/* Quick Insights Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-black/30 border border-white/10 p-3 rounded-xl space-y-1">
                <span className="text-amber-300 font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  शनि साढेसाती / ढैय्या अवस्था:
                </span>
                <p className="text-stone-200">{consolidatedReport.sadeSatiOrDhaiyyaStatus}</p>
              </div>

              <div className="bg-black/30 border border-white/10 p-3 rounded-xl space-y-1">
                <span className="text-amber-300 font-bold">शुभ कारकहरू (Lucky Factors):</span>
                <p className="text-stone-200">
                  रङ्ग: <strong>{consolidatedReport.luckyColor}</strong> • अङ्क: <strong>{consolidatedReport.luckyNumber}</strong> • दिशा: <strong>{consolidatedReport.luckyDirection}</strong>
                </p>
              </div>

              <div className="bg-black/30 border border-white/10 p-3 rounded-xl space-y-1">
                <span className="text-amber-300 font-bold">मुख्य दैनिक सल्लाह:</span>
                <p className="text-stone-200 leading-tight">{consolidatedReport.dailyAdvice}</p>
              </div>
            </div>
          </div>

          {/* 9 Planets Detailed Table for THIS Selected Rashi */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-xs space-y-4">
            <h3 className="text-base font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{consolidatedReport.rashiName} राशिका लागि ९ वटै ग्रहहरूको प्रत्यक्ष स्थिति र फल</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {liveArticles.map((art) => {
                const impact = art.rashiImpacts.find((i) => i.rashiId === selectedRashiId);
                if (!impact) return null;

                return (
                  <div
                    key={art.planet}
                    onClick={() => handleOpenArticle(art)}
                    className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-amber-400 bg-stone-50/60 dark:bg-stone-850 space-y-2.5 transition-all cursor-pointer hover:shadow-xs group"
                  >
                    <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-serif text-sm font-bold">
                          {art.symbol}
                        </span>
                        <div>
                          <strong className="text-xs text-stone-950 dark:text-stone-100 group-hover:text-[#7A1C1C] dark:group-hover:text-amber-400">
                            {art.planet} गोचर
                          </strong>
                          <div className="text-[10px] text-stone-500">
                            {art.currentRashi} राशिमा ({art.degreeStr})
                          </div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${impact.impactBadgeColor}`}>
                        {impact.impactType}
                      </span>
                    </div>

                    <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
                      {impact.houseNameNepali}
                    </div>

                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed line-clamp-3">
                      {impact.summary}
                    </p>

                    <div className="text-[11px] bg-white dark:bg-stone-900 p-2 rounded-lg border border-stone-100 dark:border-stone-800 space-y-1">
                      <div className="text-stone-600 dark:text-stone-400">
                        <strong>🎯 कर्म/आर्थिक:</strong> {impact.careerFinance}
                      </div>
                      <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                        <strong>🙏 उपाय:</strong> {impact.remedy}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FULL IN-DEPTH ARTICLE & 12-RASHI FORECAST MODAL READER */}
      {/* ========================================================================= */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 border border-[#E6E0D5] dark:border-stone-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/90 dark:bg-stone-800/90">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-serif text-base font-bold shadow-xs">
                  {selectedArticle.symbol}
                </span>
                <div>
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    {selectedArticle.planet} ग्रह प्रत्यक्ष गोचर बुलेटिन
                  </span>
                  <div className="text-[10px] text-stone-500">
                    {selectedArticle.currentRashi} राशि • {selectedArticle.degreeStr} • {selectedArticle.motionStatus}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleShareWhatsApp(selectedArticle)}
                  className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="WhatsApp मा सेयर गर्नुहोस्"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyShareLink(selectedArticle)}
                  className="p-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="लिङ्क कपी गर्नुहोस्"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  <span className="hidden sm:inline">{copiedLink ? 'कपी भयो' : 'लिङ्क'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors cursor-pointer text-stone-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-stone-800 dark:text-stone-200">
              {/* Cover Graphic with Badges */}
              <div className="w-full h-52 sm:h-64 rounded-2xl overflow-hidden shadow-md relative bg-amber-950">
                <img 
                  src={selectedArticle.coverImageUrl} 
                  alt={selectedArticle.title} 
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5 text-white">
                  <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
                    <span className="bg-amber-500 text-stone-950 font-bold px-2.5 py-0.5 rounded-full">
                      {selectedArticle.planet} ग्रह
                    </span>
                    <span className="bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-amber-200 border border-white/20">
                      {selectedArticle.currentRashi} राशि ({selectedArticle.degreeStr})
                    </span>
                    <span className="bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-amber-200 border border-white/20">
                      {selectedArticle.nakshatra} नक्षत्र • पाउ {selectedArticle.pada}
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-2xl font-bold font-serif text-white leading-tight">
                    {selectedArticle.title}
                  </h1>
                </div>
              </div>

              {/* Metadata strip */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 dark:text-stone-400 py-2 border-y border-stone-100 dark:border-stone-800">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  वि.सं. {selectedArticle.publishedAtBS} ({selectedArticle.publishedAtAD})
                </span>
                <span className="flex items-center gap-1">
                  <Globe2 className="w-3.5 h-3.5 text-amber-600" />
                  {selectedArticle.author}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {toDevanagariNumerals(selectedArticle.readTimeMinutes)} मिनेट अध्ययन
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {toDevanagariNumerals(selectedArticle.viewsCount)} पटक हेरिएको
                </span>
              </div>

              {/* Astronomical Coordinates Table */}
              <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-600" />
                  <span>प्रत्यक्ष खगोलीय अवस्थिति विवरण (Astronomical Ephemeris Data):</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white/80 dark:bg-stone-900/80 p-2 rounded-lg border border-amber-100 dark:border-amber-900">
                    <span className="text-[11px] text-stone-500">वर्तमान राशि:</span>
                    <p className="font-bold text-stone-900 dark:text-stone-100">{selectedArticle.currentRashi}</p>
                  </div>
                  <div className="bg-white/80 dark:bg-stone-900/80 p-2 rounded-lg border border-amber-100 dark:border-amber-900">
                    <span className="text-[11px] text-stone-500">स्पष्ट भोगांश (Degree):</span>
                    <p className="font-bold text-stone-900 dark:text-stone-100 font-mono">{selectedArticle.degreeStr}</p>
                  </div>
                  <div className="bg-white/80 dark:bg-stone-900/80 p-2 rounded-lg border border-amber-100 dark:border-amber-900">
                    <span className="text-[11px] text-stone-500">नक्षत्र तथा चरण:</span>
                    <p className="font-bold text-stone-900 dark:text-stone-100">{selectedArticle.nakshatra} (पाउ {selectedArticle.pada})</p>
                  </div>
                  <div className="bg-white/80 dark:bg-stone-900/80 p-2 rounded-lg border border-amber-100 dark:border-amber-900">
                    <span className="text-[11px] text-stone-500">गति / अवस्था:</span>
                    <p className="font-bold text-stone-900 dark:text-stone-100">{selectedArticle.motionStatus}</p>
                  </div>
                </div>
              </div>

              {/* News Body & Classical References */}
              <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-stone-800 dark:text-stone-200">
                <div className="bg-stone-100 dark:bg-stone-800/60 p-3 rounded-xl border-l-4 border-[#7A1C1C] dark:border-amber-500 font-medium">
                  {selectedArticle.leadSummary}
                </div>

                <div className="whitespace-pre-line space-y-3">
                  {selectedArticle.fullBody}
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-1 text-xs">
                  <strong className="text-amber-900 dark:text-amber-300">शास्त्रीय प्रमाण:</strong> {selectedArticle.classicalReference}
                  <div className="text-stone-600 dark:text-stone-400 mt-1">
                    <strong>देश-काल र बजार प्रभाव:</strong> {selectedArticle.mundaneImpact}
                  </div>
                </div>
              </div>

              {/* Comprehensive 12-Rashi Forecast Section */}
              <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold font-serif text-stone-950 dark:text-stone-100 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>{selectedArticle.planet} गोचरको १२ वटै राशिमा पर्ने प्रत्यक्ष प्रभाव र उपाय</span>
                    </h3>
                    <p className="text-xs text-stone-500">
                      आफ्नो चन्द्र राशि वा लग्न राशि अनुसार फल अवलोकन गर्नुहोस्
                    </p>
                  </div>

                  {/* Filter by single sign inside modal */}
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setModalRashiFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        modalRashiFilter === 'all'
                          ? 'bg-[#7A1C1C] text-white'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      सबै १२ राशि
                    </button>
                    {RASHI_DATA.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setModalRashiFilter(r.id)}
                        className={`px-2 py-1 rounded-lg text-xs transition cursor-pointer flex items-center gap-1 ${
                          modalRashiFilter === r.id
                            ? 'bg-[#7A1C1C] text-white font-bold'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <span>{r.symbol}</span>
                        <span>{r.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 12 Rashi Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedArticle.rashiImpacts
                    .filter((ri) => modalRashiFilter === 'all' || ri.rashiId === modalRashiFilter)
                    .map((ri) => (
                      <div 
                        key={ri.rashiId}
                        className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-850 space-y-2.5"
                      >
                        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-serif">{ri.symbol}</span>
                            <div>
                              <strong className="text-sm text-stone-900 dark:text-stone-100">
                                {ri.rashiName} राशि
                              </strong>
                              <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                                {ri.houseNameNepali}
                              </div>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ri.impactBadgeColor}`}>
                            {ri.impactType}
                          </span>
                        </div>

                        <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed font-normal">
                          {ri.summary}
                        </p>

                        <div className="bg-white dark:bg-stone-900 p-2.5 rounded-lg border border-stone-100 dark:border-stone-800 text-[11px] space-y-1">
                          <div><strong>🎯 कार्य तथा धन:</strong> {ri.careerFinance}</div>
                          <div><strong>❤️ परिवार तथा स्वास्थ्य:</strong> {ri.familyHealth}</div>
                          <div className="text-emerald-700 dark:text-emerald-400">
                            <strong>🙏 वैदिक शान्ति उपाय:</strong> {ri.remedy}
                          </div>
                          <div className="pt-1 text-stone-500 border-t border-stone-100 dark:border-stone-800">
                            शुभ रङ्ग: <strong>{ri.luckyColor}</strong> • शुभ अङ्क: <strong>{ri.luckyNumber}</strong> • अनुकूल बार: <strong>{ri.favorableDay}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 flex items-center justify-between text-xs">
              <span className="text-stone-500">
                © बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग केन्द्र
              </span>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl font-bold cursor-pointer transition-colors"
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
