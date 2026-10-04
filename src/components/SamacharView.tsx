import React, { useState, useMemo, memo, useEffect } from 'react';
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
  BookOpen,
  CalendarDays,
  Scroll,
  HelpCircle,
  Sparkle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { PlanetPosition, PlanetName, RashiName, PanchangaData } from '../types/astrology';
import { RASHI_DATA } from '../data/rashiData';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { convertADToBSFull } from '../utils/bsCalendarData';
import { getCachedAstroCalculation } from '../utils/astroCache';
import { 
  SamacharArticle, 
  getStoredArticles, 
  incrementArticleViews, 
  SAMACHAR_CATEGORY_NAMES,
  getWhatsAppShareUrl 
} from '../db/samacharStore';
import { 
  generateLiveGrahaGocharNews, 
  getConsolidatedRashiTransitForecast, 
  GrahaGocharNewsArticle, 
  RashiTransitImpact 
} from '../utils/grahaGocharNewsEngine';
import { mapTithiNameToNumber } from '../utils/shastriyaNewsEngine';
import { 
  getDeityPortraitForTithi, 
  getNepaliFestivalArt, 
  DeityPortraitInfo, 
  NepaliFestivalArtInfo 
} from '../utils/deityAndFestivalArtEngine';

interface SamacharViewProps {
  todayTransitPlanets?: PlanetPosition[];
  todayPanchanga?: PanchangaData;
  todayAD?: string;
  todayBS?: string;
  onNavigateTab?: (tab: string) => void;
}

export const SamacharView: React.FC<SamacharViewProps> = memo(({
  todayTransitPlanets: propTransitPlanets,
  todayPanchanga: propPanchanga,
  todayAD: propTodayAD,
  todayBS: propTodayBS,
  onNavigateTab
}) => {
  const activeTodayAD = propTodayAD || new Date().toISOString().split('T')[0];
  const activeTodayBS = propTodayBS || convertADToBSFull(activeTodayAD).formattedBS;

  // Obtain Live Astronomical Positions
  const livePlanets: PlanetPosition[] = useMemo(() => {
    if (Array.isArray(propTransitPlanets) && propTransitPlanets.length >= 9) {
      return propTransitPlanets;
    }
    // Fallback: Compute real-time ephemeris using AstroCache
    try {
      const calc = getCachedAstroCalculation(activeTodayAD, '06:00', 27.7172, 85.3240, 5.75);
      if (calc?.planets && calc.planets.length >= 9) {
        return calc.planets;
      }
    } catch (e) {
      console.warn('Failed to compute live planets for Samachar fallback:', e);
    }
    return Array.isArray(propTransitPlanets) ? propTransitPlanets : [];
  }, [propTransitPlanets, activeTodayAD]);

  // Generate 9 Live Planetary News Articles
  const liveArticles: GrahaGocharNewsArticle[] = useMemo(() => {
    try {
      const arts = generateLiveGrahaGocharNews(livePlanets, activeTodayBS, activeTodayAD);
      return Array.isArray(arts) ? arts : [];
    } catch (err) {
      console.error('Error generating live articles in SamacharView:', err);
      return [];
    }
  }, [livePlanets, activeTodayBS, activeTodayAD]);

  // Stored Shastriya, Festival and Editorial Articles
  const [storedArticles, setStoredArticles] = useState<SamacharArticle[]>(() => {
    return getStoredArticles(
      activeTodayBS, 
      activeTodayAD, 
      propPanchanga?.tithi?.name, 
      propPanchanga?.paksha
    );
  });

  // Reload and listen to store updates
  useEffect(() => {
    const fresh = getStoredArticles(
      activeTodayBS, 
      activeTodayAD, 
      propPanchanga?.tithi?.name, 
      propPanchanga?.paksha
    );
    setStoredArticles([...fresh]);

    const handleUpdate = (e: any) => {
      if (Array.isArray(e?.detail)) {
        setStoredArticles([...e.detail]);
      } else {
        const updated = getStoredArticles(
          activeTodayBS, 
          activeTodayAD, 
          propPanchanga?.tithi?.name, 
          propPanchanga?.paksha
        );
        setStoredArticles([...updated]);
      }
    };

    window.addEventListener('balananda_samachar_updated', handleUpdate);
    return () => window.removeEventListener('balananda_samachar_updated', handleUpdate);
  }, [activeTodayBS, activeTodayAD, propPanchanga]);

  // View States
  const [activeTab, setActiveTab] = useState<'shastriya_tithi_parva' | '9_graha_news' | '12_rashi_forecast'>('shastriya_tithi_parva');
  const [selectedPlanetFilter, setSelectedPlanetFilter] = useState<PlanetName | 'all'>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedRashiId, setSelectedRashiId] = useState<number>(1); // 1 = मेष
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [selectedGrahaArticle, setSelectedGrahaArticle] = useState<GrahaGocharNewsArticle | null>(null);
  const [selectedStoredArticle, setSelectedStoredArticle] = useState<SamacharArticle | null>(null);
  const [modalRashiFilter, setModalRashiFilter] = useState<number | 'all'>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  // Today's Daily Tithi Article
  const todayTithiArticle = useMemo(() => {
    return storedArticles.find(a => a.id.startsWith('daily_tithi_article_')) || null;
  }, [storedArticles]);

  // Upcoming Major Festivals within 1-month window
  const upcomingFestivalArticles = useMemo(() => {
    return storedArticles.filter(a => a.id.startsWith('auto_festival_'));
  }, [storedArticles]);

  // Editorial & General Articles
  const editorialArticles = useMemo(() => {
    return storedArticles.filter(a => !a.id.startsWith('daily_tithi_article_') && !a.id.startsWith('auto_festival_') && !a.id.startsWith('graha_news_'));
  }, [storedArticles]);

  // Filtered Shastriya / Stored Articles
  const filteredShastriyaArticles = useMemo(() => {
    return storedArticles.filter((art) => {
      // Exclude raw 9-graha articles from this tab to keep focus on Shastriya Tithi, Festivals & Editorial
      if (art.id.startsWith('graha_news_')) return false;

      const matchesCat = selectedCategoryFilter === 'all' || art.category === selectedCategoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        art.title?.toLowerCase()?.includes(q) ||
        art.summary?.toLowerCase()?.includes(q) ||
        art.content?.toLowerCase()?.includes(q) ||
        art.author?.toLowerCase()?.includes(q) ||
        (Array.isArray(art.tags) && art.tags.some(t => t?.toLowerCase()?.includes(q)));

      return matchesCat && matchesSearch;
    });
  }, [storedArticles, selectedCategoryFilter, searchQuery]);

  // Filtered Articles for 9 Planets View
  const filteredGrahaArticles = useMemo(() => {
    if (!Array.isArray(liveArticles)) return [];
    return liveArticles.filter((art) => {
      if (!art) return false;
      const matchesPlanet = selectedPlanetFilter === 'all' || art.planet === selectedPlanetFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        art.title?.toLowerCase()?.includes(q) ||
        art.headline?.toLowerCase()?.includes(q) ||
        art.leadSummary?.toLowerCase()?.includes(q) ||
        art.planet?.toLowerCase()?.includes(q) ||
        art.currentRashi?.toLowerCase()?.includes(q) ||
        art.nakshatra?.toLowerCase()?.includes(q) ||
        (Array.isArray(art.rashiImpacts) && art.rashiImpacts.some(ri => ri?.rashiName?.toLowerCase()?.includes(q) || ri?.summary?.toLowerCase()?.includes(q)));

      return Boolean(matchesPlanet && matchesSearch);
    });
  }, [liveArticles, selectedPlanetFilter, searchQuery]);

  // Breaking / Featured Planet
  const breakingArticle = useMemo(() => {
    if (!Array.isArray(liveArticles) || liveArticles.length === 0) return null;
    return liveArticles.find((a) => a && a.planet === 'सूर्य') || liveArticles[0] || null;
  }, [liveArticles]);

  // Consolidated 12-Rashi Report for the selected sign
  const consolidatedReport = useMemo(() => {
    try {
      return getConsolidatedRashiTransitForecast(selectedRashiId, livePlanets);
    } catch (err) {
      console.error('Failed to get consolidated report:', err);
      const safeId = typeof selectedRashiId === 'number' && selectedRashiId >= 1 && selectedRashiId <= 12 ? selectedRashiId : 1;
      const fallbackRashi = RASHI_DATA[safeId - 1] || RASHI_DATA[0];
      return {
        rashiId: safeId,
        rashiName: fallbackRashi.name,
        symbol: fallbackRashi.symbol,
        element: fallbackRashi.element,
        lord: fallbackRashi.lord,
        overallScorePercent: 70,
        overallNature: 'अनुकूल' as const,
        favorablePlanets: [],
        challengingPlanets: [],
        sadeSatiOrDhaiyyaStatus: 'कुनै साढेसाती वा ढैय्या छैन',
        primaryRemedy: `${fallbackRashi.lord} मन्त्रको नियमित जप र आज बिहान सूर्यलाई अर्घ्य दिनुहोस्।`,
        dailyAdvice: 'महत्त्वपूर्ण निर्णय लिँदा शुभ समय र अनुभवी व्यक्तिको राय लिनुहोस्।',
        luckyColor: 'पहेँलो',
        luckyNumber: '१, ९',
        luckyDirection: 'पूर्व',
      };
    }
  }, [selectedRashiId, livePlanets]);

  // Handlers
  const handleOpenGrahaArticle = (art: GrahaGocharNewsArticle) => {
    setSelectedGrahaArticle(art);
    setModalRashiFilter('all');
  };

  const handleOpenStoredArticle = (art: SamacharArticle) => {
    incrementArticleViews(art.id);
    setSelectedStoredArticle(art);
  };

  const handleCopyShareLink = (title: string, slug: string) => {
    const url = `${window.location.origin}/?tab=samachar&slug=${encodeURIComponent(slug)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareStoredWhatsApp = (art: SamacharArticle) => {
    const shareUrl = `${window.location.origin}/?tab=samachar&slug=${encodeURIComponent(art.slug)}`;
    const text = `*📜 ${art.title}*\n\n` +
      `${art.summary}\n\n` +
      `📅 *मिति:* वि.सं. ${art.publishedAtBS}\n` +
      `✍️ *स्रोत:* ${art.source || 'बालानन्द वैदिक पञ्चाङ्ग अनुसन्धान'}\n\n` +
      `👉 *पूरा शास्त्रीय प्रमाण, श्लोक, मन्त्र तथा कथा पढ्नुहोस्:*\n${shareUrl}`;
    window.open(getWhatsAppShareUrl('', text), '_blank');
  };

  const handleShareGrahaWhatsApp = (art: GrahaGocharNewsArticle) => {
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
              <Scroll className="w-3.5 h-3.5 text-amber-300" />
              <span>वैदिक पञ्चाङ्ग, शास्त्रीय तिथि, चाडपर्व तथा प्रत्यक्ष ग्रह गोचर समाचार केन्द्र</span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif tracking-wide text-amber-50">
              शास्त्रीय तिथि, १ महिना अगाडिका चाडपर्व तथा प्रत्यक्ष गोचर समाचार
            </h1>

            <p className="text-xs sm:text-sm text-stone-200 max-w-3xl leading-relaxed">
              निर्णयसिन्धु, धर्मसिन्धु र पुराणहरूका प्रामाणिक संस्कृत श्लोक, मन्त्र, व्रत/भोजन निषेध-विधि, पौराणिक कथा, साइत तथा ९ वटै ग्रहहरूको प्रत्यक्ष राशि सञ्चार र दैनिक फलादेश।
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-amber-200/90 font-medium">
              <span className="flex items-center gap-1 bg-black/30 px-2.5 py-0.5 rounded-md border border-white/10">
                <Calendar className="w-3 h-3 text-amber-400" />
                वि.सं. {activeTodayBS} ({activeTodayAD})
              </span>
              <span className="flex items-center gap-1 bg-black/30 px-2.5 py-0.5 rounded-md border border-white/10">
                <Clock className="w-3 h-3 text-amber-400" />
                मध्यरात १२:०० बजे स्वतः तिथि नवीकरण
              </span>
              <span className="flex items-center gap-1 bg-black/30 px-2.5 py-0.5 rounded-md border border-white/10">
                <Compass className="w-3 h-3 text-amber-400" />
                काठमाडौँ मानक (८५°१९' पू, २७°४३' उ)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Live 9-Graha Real-time Position Ticker */}
      <div className="bg-amber-950/80 dark:bg-stone-900 border border-amber-800/60 rounded-2xl p-3 shadow-md overflow-hidden">
        <div className="flex items-center gap-2 mb-2 px-1 text-xs font-bold text-amber-300">
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>९ ग्रहको वर्तमान खगोलीय स्थिति (Live Ephemeris Degrees):</span>
          <span className="text-[10px] text-stone-400 font-normal hidden sm:inline">(कुनै पनि ग्रहमा क्लिक गरी प्रत्यक्ष फलादेश हेर्नुहोस्)</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {liveArticles.map((art) => (
            <button
              key={art.planet}
              type="button"
              onClick={() => handleOpenGrahaArticle(art)}
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
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('shastriya_tithi_parva')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'shastriya_tithi_parva'
                ? 'bg-[#7A1C1C] text-white shadow-md'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Scroll className="w-4 h-4 text-amber-400" />
            <span>तिथि, चाडपर्व तथा शास्त्रीय कथा</span>
            <span className="text-[10px] bg-amber-400 text-stone-950 font-black px-1.5 py-0.2 rounded-full">
              {toDevanagariNumerals(filteredShastriyaArticles.length)}
            </span>
          </button>

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

        <div className="text-xs text-stone-500 dark:text-stone-400 self-end sm:self-center pr-2">
          अद्यावधिक: <strong className="text-stone-800 dark:text-stone-200">वि.सं. {activeTodayBS}</strong>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: SHASTRIYA TITHI, ADVANCE FESTIVALS & PAURANIK KATHA */}
      {/* ========================================================================= */}
      {activeTab === 'shastriya_tithi_parva' && (
        <div className="space-y-6">
          {/* Category Chips & Search Bar */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Category buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 scrollbar-none text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategoryFilter === 'all'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  सबै शास्त्रीय सामग्रीहरू
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('panchanga')}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategoryFilter === 'panchanga'
                      ? 'bg-[#7A1C1C] text-white font-bold'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  📜 दैनिक तिथि विशेष
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('festival')}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategoryFilter === 'festival'
                      ? 'bg-[#7A1C1C] text-white font-bold'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  🎉 १ महिना अगाडिका चाडपर्वहरू
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('dharma')}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategoryFilter === 'dharma'
                      ? 'bg-[#7A1C1C] text-white font-bold'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  🪔 वैदिक धर्म तथा संस्कार
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('astrology')}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategoryFilter === 'astrology'
                      ? 'bg-[#7A1C1C] text-white font-bold'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  🪐 ज्योतिष अनुसन्धान
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-72 shrink-0">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="तिथि, श्लोक, चाड वा कथा खोज्नुहोस्..."
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

          {/* 1. FEATURED: TODAY'S ACTIVE TITHI SPECIAL ARTICLE */}
          {todayTithiArticle && !searchQuery && selectedCategoryFilter === 'all' && (() => {
            const tithiNum = mapTithiNameToNumber(propPanchanga?.tithi?.name || 'प्रतिपदा');
            const deityInfo = getDeityPortraitForTithi(tithiNum);

            return (
              <div className="bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-100/40 dark:from-stone-900 dark:via-stone-900/90 dark:to-amber-950/30 rounded-3xl border-2 border-amber-300/80 dark:border-amber-700/60 p-5 sm:p-7 shadow-lg relative overflow-hidden space-y-4">
                <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                        <Flame className="w-3.5 h-3.5 animate-bounce" />
                        आजको चालू तिथि विशेष
                      </span>
                      <span className="bg-amber-200/80 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-300 dark:border-amber-700">
                        📜 निर्णयसिन्धु / धर्मसिन्धु प्रामाणिक
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        मध्यरात १२ बजे स्वतः नवीकरण हुने
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 leading-snug">
                      {todayTithiArticle.title}
                    </h2>

                    {/* Presiding Deity Emblem Banner */}
                    <div className="bg-gradient-to-r from-amber-100/90 via-orange-100/60 to-amber-50 dark:from-amber-950/60 dark:via-stone-850 dark:to-stone-900 border border-amber-300 dark:border-amber-800 rounded-2xl p-3.5 flex items-center gap-3.5 shadow-2xs">
                      <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white text-2xl flex items-center justify-center shrink-0 shadow-xs">
                        {deityInfo.symbol}
                      </span>
                      <div className="text-xs space-y-0.5">
                        <div className="font-bold text-amber-950 dark:text-amber-200 text-xs sm:text-sm">
                          🕉️ आजको अधिष्ठाता देवता: {deityInfo.deityNameNepali}
                        </div>
                        <div className="text-stone-700 dark:text-stone-300 text-[11px] leading-tight">
                          {deityInfo.deityTitle} — <span className="text-stone-600 dark:text-stone-400">{deityInfo.description}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed line-clamp-2">
                      {todayTithiArticle.summary}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-stone-600 dark:text-stone-400">
                      <span className="font-semibold text-amber-900 dark:text-amber-300">
                        ✍️ {todayTithiArticle.author}
                      </span>
                      <span>•</span>
                      <span>📅 वि.सं. {todayTithiArticle.publishedAtBS}</span>
                      <span>•</span>
                      <span>⏱️ {toDevanagariNumerals(todayTithiArticle.readTimeMinutes)} मिनेट अध्ययन</span>
                      <span>•</span>
                      <span>👁️ {toDevanagariNumerals(todayTithiArticle.viewsCount)} पाठक</span>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleOpenStoredArticle(todayTithiArticle)}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#7A1C1C] to-[#9B2C2C] hover:from-[#5C1515] hover:to-[#7A1C1C] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <span>पूर्ण शास्त्रीय श्लोक, मन्त्र र कथा पढ्नुहोस्</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShareStoredWhatsApp(todayTithiArticle)}
                        className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>ह्वाट्सएपमा सेयर</span>
                      </button>
                    </div>
                  </div>

                  {todayTithiArticle.coverImageUrl && (
                    <div className="w-full lg:w-72 h-52 sm:h-60 rounded-2xl overflow-hidden border border-amber-300 dark:border-amber-800 shadow-md shrink-0 relative group cursor-pointer"
                         onClick={() => handleOpenStoredArticle(todayTithiArticle)}>
                      <img 
                        src={todayTithiArticle.coverImageUrl} 
                        alt={todayTithiArticle.title}
                        onError={(e) => { e.currentTarget.src = deityInfo.portraitUrl || '/assets/festivals/dashain_ghatasthapana.jpg'; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex flex-col justify-end p-3">
                        <span className="text-xs text-amber-300 font-bold">
                          {deityInfo.deityNameNepali}
                        </span>
                        <span className="text-[10px] text-amber-100">
                          शास्त्र: {todayTithiArticle.source || 'निर्णयसिन्धु'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* 2. UPCOMING MAJOR FESTIVALS SECTION (1 MONTH IN ADVANCE) */}
          {upcomingFestivalArticles.length > 0 && selectedCategoryFilter === 'all' && !searchQuery && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-amber-600" />
                    <span>आगामी प्रमुख चाडपर्व विशेष समाचार (१ महिना पूर्वतयारी)</span>
                  </h3>
                </div>
                <span className="text-xs text-stone-500 font-medium">
                  {toDevanagariNumerals(upcomingFestivalArticles.length)} पर्वहरू सूचीकृत
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingFestivalArticles.map((art) => {
                  const festCode = art.id.replace('auto_festival_', '').replace('_2083', '');
                  const festArt = getNepaliFestivalArt(festCode) || getNepaliFestivalArt(art.slug.replace('festival-', ''));

                  return (
                    <div
                      key={art.id}
                      onClick={() => handleOpenStoredArticle(art)}
                      className="bg-white dark:bg-stone-900 rounded-2xl border border-amber-200 dark:border-stone-800 p-4 hover:border-amber-400 dark:hover:border-amber-600 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between group space-y-3"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <span className="inline-block bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-bold text-[11px] px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                              🎉 चाडपर्व पूर्वतयारी
                            </span>
                            <h4 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors leading-snug">
                              {art.title}
                            </h4>
                          </div>
                          {art.coverImageUrl && (
                            <img 
                              src={art.coverImageUrl} 
                              alt={art.title} 
                              onError={(e) => { e.currentTarget.src = festArt?.illustrationUrl || '/assets/festivals/dashain_ghatasthapana.jpg'; }}
                              className="w-24 h-24 rounded-xl object-cover shrink-0 border border-stone-100 dark:border-stone-800 group-hover:scale-105 transition-transform" 
                            />
                          )}
                        </div>

                        <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                          {art.summary}
                        </p>

                        {/* Traditional Nepali Elements Badge */}
                        {festArt && (
                          <div className="bg-amber-50/70 dark:bg-stone-850 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/40 text-[11px] space-y-1">
                            <div className="text-amber-900 dark:text-amber-300 font-bold flex items-center gap-1">
                              <span>🇳🇵 नेपाली परम्परा:</span>
                              <span className="font-normal text-stone-700 dark:text-stone-300 line-clamp-1">{festArt.celebrationTypeNepali}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {festArt.traditionalElements.slice(0, 4).map((el, i) => (
                                <span key={i} className="text-[10px] bg-white dark:bg-stone-900 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60 font-medium">
                                  ✓ {el}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-2.5 mt-1 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500">
                        <span className="font-medium text-amber-800 dark:text-amber-400">
                          📅 पर्व मिति: वि.सं. {art.publishedAtBS}
                        </span>
                        <span className="font-bold text-[#7A1C1C] dark:text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>श्लोक र विधि हेर्नुहोस्</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. ALL FILTERED SHASTRIYA & EDITORIAL ARTICLES GRID */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span>सम्पूर्ण शास्त्रीय लेख, तिथि तथा चाडपर्व समाचार सूची</span>
              </h3>
              <span className="text-xs text-stone-500">
                कुल: {toDevanagariNumerals(filteredShastriyaArticles.length)} लेखहरू
              </span>
            </div>

            {filteredShastriyaArticles.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-2">
                <Search className="w-8 h-8 text-stone-400 mx-auto" />
                <p className="text-sm font-bold text-stone-700 dark:text-stone-300">कुनै लेख वा समाचार भेटिएन</p>
                <p className="text-xs text-stone-500">कृपया खोज शब्द परिवर्तन गर्नुहोस् वा अर्को वर्ग छान्नुहोस्।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredShastriyaArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => handleOpenStoredArticle(art)}
                    className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-600 p-4 transition-all shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="space-y-2.5">
                      {art.coverImageUrl && (
                        <div className="w-full h-40 rounded-xl overflow-hidden mb-2 relative">
                          <img 
                            src={art.coverImageUrl} 
                            alt={art.title} 
                            onError={(e) => { e.currentTarget.src = '/assets/festivals/dashain_ghatasthapana.jpg'; }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-2 left-2 bg-black/70 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                            {art.categoryNameNepali}
                          </span>
                        </div>
                      )}

                      <div className="space-y-1">
                        {!art.coverImageUrl && (
                          <span className="inline-block bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-bold px-2 py-0.5 rounded-md mb-1">
                            {art.categoryNameNepali}
                          </span>
                        )}
                        <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-[#7A1C1C] dark:group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
                          {art.title}
                        </h4>
                      </div>

                      <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-3 leading-relaxed">
                        {art.summary}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500">
                      <span>वि.सं. {art.publishedAtBS}</span>
                      <span className="flex items-center gap-1 font-bold text-amber-800 dark:text-amber-400">
                        <span>अध्ययन</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: 9 GRAHA LIVE TRANSIT NEWS FEED (सबै ९ ग्रह एकै पृष्ठमा) */}
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
              onClick={() => handleOpenGrahaArticle(breakingArticle)}
              className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-md hover:border-amber-500 transition-all cursor-pointer group"
            >
              <div className="flex flex-col lg:flex-row gap-5 items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-red-600 text-white font-black text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 animate-pulse">
                      <Flame className="w-3 h-3" />
                      प्रमुख गोचर समाचार
                    </span>
                    <span className="bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 text-xs font-bold px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800">
                      {breakingArticle.planet} ({breakingArticle.currentRashi} राशि) • {breakingArticle.degreeStr}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400">
                      {breakingArticle.nakshatra} नक्षत्र ({breakingArticle.pada} पाउ)
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 group-hover:text-amber-600 transition-colors">
                    {breakingArticle.headline}
                  </h2>

                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3">
                    {breakingArticle.leadSummary}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 dark:text-stone-400 pt-1">
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      ✍️ {breakingArticle.author}
                    </span>
                    <span>•</span>
                    <span>⏱️ {toDevanagariNumerals(breakingArticle.readTimeMinutes)} मिनेट अध्ययन</span>
                    <span>•</span>
                    <span>👁️ {toDevanagariNumerals(breakingArticle.viewsCount)} पटक हेरिएको</span>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenGrahaArticle(breakingArticle);
                      }}
                      className="px-4 py-2 bg-[#7A1C1C] hover:bg-[#5C1515] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <span>१२ राशिको प्रभाव र पूर्ण समाचार पढ्नुहोस्</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareGrahaWhatsApp(breakingArticle);
                      }}
                      className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer transition-colors"
                      title="ह्वाट्सएपमा सेयर गर्नुहोस्"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {breakingArticle.coverImageUrl && (
                  <div className="w-full lg:w-72 h-44 sm:h-48 rounded-2xl overflow-hidden border border-amber-200 dark:border-amber-800 shadow-xs shrink-0 relative">
                    <img 
                      src={breakingArticle.coverImageUrl} 
                      alt={breakingArticle.planet} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {breakingArticle.motionStatus}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 9 Planets Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGrahaArticles.map((art) => (
              <div
                key={art.planet}
                onClick={() => handleOpenGrahaArticle(art)}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-600 p-4 transition-all shadow-2xs hover:shadow-md cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-serif text-base font-bold flex items-center justify-center">
                        {art.symbol}
                      </span>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 group-hover:text-amber-600 transition-colors">
                          {art.planet} ग्रह
                        </h3>
                        <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                          {art.currentRashi} राशि • {art.degreeStr}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700">
                      {art.motionStatus}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-3 leading-relaxed">
                    {art.leadSummary}
                  </p>

                  <div className="bg-amber-50/60 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/60 text-[11px] space-y-1">
                    <div className="text-stone-700 dark:text-stone-300 font-medium flex items-center justify-between">
                      <span>नक्षत्र: <strong>{art.nakshatra} (चरण {art.pada})</strong></span>
                      <span className="text-stone-500">स्वामी: {art.nakshatraLord}</span>
                    </div>
                    <div className="text-amber-900 dark:text-amber-300 line-clamp-1 font-mono text-[10px]">
                      {art.classicalReference}
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-400">
                    👁️ {toDevanagariNumerals(art.viewsCount)} पटक हेरिएको
                  </span>
                  <span className="flex items-center gap-1 font-bold text-[#7A1C1C] dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                    <span>१२ राशिको फल</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: 12 RASHI CONSOLIDATED TRANSIT REPORT */}
      {/* ========================================================================= */}
      {activeTab === '12_rashi_forecast' && (
        <div className="space-y-6">
          {/* 12 Rashi Selection Chips */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>आफ्नो जन्म राशि वा लग्न राशि चयन गर्नुहोस्:</span>
              </h3>
              <span className="text-xs text-stone-500 font-medium">
                चयन गरिएको राशि: <strong className="text-amber-600">{consolidatedReport.rashiName} ({consolidatedReport.symbol})</strong>
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
              {RASHI_DATA.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRashiId(r.id)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                    selectedRashiId === r.id
                      ? 'bg-[#7A1C1C] text-white border-[#7A1C1C] shadow-md scale-105'
                      : 'bg-stone-50 dark:bg-stone-800/80 text-stone-800 dark:text-stone-200 border-stone-200 dark:border-stone-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-amber-400'
                  }`}
                >
                  <span className="text-xl font-serif mb-0.5">{r.symbol}</span>
                  <span className="text-xs font-bold">{r.name}</span>
                  <span className="text-[10px] opacity-75">{r.lord}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Consolidated Sign Card */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-5 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
              <div className="flex items-center gap-3.5">
                <span className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 font-serif text-3xl font-bold flex items-center justify-center border border-amber-300 dark:border-amber-800">
                  {consolidatedReport.symbol}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">
                      {consolidatedReport.rashiName} राशि
                    </h2>
                    <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800">
                      स्वामी: {consolidatedReport.lord}
                    </span>
                    <span className="text-xs bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded-md">
                      तत्त्व: {consolidatedReport.element}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    आजको प्रत्यक्ष ९ ग्रह सञ्चारका आधारमा विस्तृत फलादेश
                  </p>
                </div>
              </div>

              {/* Overall Compatibility Meter */}
              <div className="flex items-center gap-3 bg-stone-50 dark:bg-stone-800 p-3 rounded-2xl border border-stone-200 dark:border-stone-700">
                <div className="text-right">
                  <div className="text-[11px] text-stone-500">समग्र गोचर अनुकूलता</div>
                  <div className="text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                    {consolidatedReport.overallNature} ({toDevanagariNumerals(consolidatedReport.overallScorePercent)}%)
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                  {consolidatedReport.overallScorePercent}%
                </div>
              </div>
            </div>

            {/* Saturn Sade Sati / Dhaiyya Status Alert */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-stone-800 dark:text-stone-200">
                  शनि साढेसाती / ढैय्या अवस्था: <strong className="text-amber-800 dark:text-amber-300">{consolidatedReport.sadeSatiOrDhaiyyaStatus}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleShareRashiWhatsApp(consolidatedReport.rashiName)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-colors shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>ह्वाट्सएपमा सेयर</span>
              </button>
            </div>

            {/* Daily Advice and Remedies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-850 border border-stone-200 dark:border-stone-800 space-y-2">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 text-xs sm:text-sm">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>दैनिक शास्त्रीय सल्लाह तथा मार्गनिर्देश:</span>
                </h4>
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                  {consolidatedReport.dailyAdvice}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 text-xs sm:text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>वैदिक शान्ति उपाय तथा मन्त्र:</span>
                </h4>
                <p className="text-stone-800 dark:text-stone-200 leading-relaxed">
                  {consolidatedReport.primaryRemedy}
                </p>
                <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 text-stone-600 dark:text-stone-400 flex flex-wrap gap-3 text-[11px]">
                  <span>शुभ रङ्ग: <strong>{consolidatedReport.luckyColor}</strong></span>
                  <span>शुभ अङ्क: <strong>{consolidatedReport.luckyNumber}</strong></span>
                  <span>शुभ दिशा: <strong>{consolidatedReport.luckyDirection}</strong></span>
                </div>
              </div>
            </div>

            {/* 9-Planets Impact Grid for this Selected Sign */}
            <div className="space-y-3 pt-4 border-t border-stone-200 dark:border-stone-800">
              <h3 className="text-sm sm:text-base font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>{consolidatedReport.rashiName} राशिका लागि ९ वटै ग्रहहरूको छुट्टाछुट्टै प्रभाव:</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {liveArticles.map((art) => {
                  const impact = art.rashiImpacts.find((ri) => ri.rashiId === selectedRashiId);
                  if (!impact) return null;

                  return (
                    <div
                      key={art.planet}
                      className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-850 space-y-2"
                    >
                      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-base">{art.symbol}</span>
                          <div>
                            <strong className="text-xs text-stone-900 dark:text-stone-100">
                              {art.planet} ग्रह
                            </strong>
                            <div className="text-[10px] text-amber-700 dark:text-amber-400">
                              {impact.houseNameNepali} ({art.currentRashi} राशिमा)
                            </div>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${impact.impactBadgeColor}`}>
                          {impact.impactType}
                        </span>
                      </div>

                      <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed line-clamp-3">
                        {impact.summary}
                      </p>

                      <div className="text-[11px] text-stone-500 space-y-0.5 pt-1">
                        <div>🎯 <strong>कार्य:</strong> {impact.careerFinance}</div>
                        <div>🙏 <strong>उपाय:</strong> {impact.remedy}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: STORED / SHASTRIYA ARTICLE FULL READER MODAL */}
      {/* ========================================================================= */}
      {selectedStoredArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-6 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#7A1C1C] via-[#9B2C2C] to-[#5C1515] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Scroll className="w-5 h-5 text-amber-300" />
                <span className="font-bold text-sm sm:text-base font-serif">
                  {selectedStoredArticle.categoryNameNepali || 'शास्त्रीय लेख तथा समाचार'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleShareStoredWhatsApp(selectedStoredArticle)}
                  className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  title="ह्वाट्सएपमा सेयर गर्नुहोस्"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">ह्वाट्सएप</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyShareLink(selectedStoredArticle.title, selectedStoredArticle.slug)}
                  className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  title="लिङ्क कपी गर्नुहोस्"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
                  <span className="hidden sm:inline">{copiedLink ? 'कपी भयो' : 'लिङ्क'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStoredArticle(null)}
                  className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
              {/* Title & Metadata */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-2.5 py-1 rounded-md font-bold">
                    {selectedStoredArticle.categoryNameNepali}
                  </span>
                  <span className="text-stone-500">📅 वि.सं. {selectedStoredArticle.publishedAtBS}</span>
                  <span className="text-stone-500">•</span>
                  <span className="text-stone-500">⏱️ {toDevanagariNumerals(selectedStoredArticle.readTimeMinutes)} मिनेट अध्ययन</span>
                  <span className="text-stone-500">•</span>
                  <span className="text-stone-500">👁️ {toDevanagariNumerals(selectedStoredArticle.viewsCount)} पटक हेरिएको</span>
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif text-stone-900 dark:text-stone-100 leading-snug">
                  {selectedStoredArticle.title}
                </h1>

                <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 font-medium">
                  <span>✍️ लेखक: <strong>{selectedStoredArticle.author}</strong> ({selectedStoredArticle.authorRole})</span>
                  {selectedStoredArticle.source && (
                    <span>• स्रोत: <strong>{selectedStoredArticle.source}</strong></span>
                  )}
                </div>
              </div>

              {/* Cover Image */}
              {selectedStoredArticle.coverImageUrl && (
                <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-md">
                  <img 
                    src={selectedStoredArticle.coverImageUrl} 
                    alt={selectedStoredArticle.title}
                    onError={(e) => { e.currentTarget.src = '/assets/festivals/dashain_ghatasthapana.jpg'; }}
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}

              {/* Tithi Presiding Deity Card (If Tithi Article) */}
              {selectedStoredArticle.id.startsWith('daily_tithi_article_') && (() => {
                const tNum = mapTithiNameToNumber(propPanchanga?.tithi?.name || 'प्रतिपदा');
                const dInfo = getDeityPortraitForTithi(tNum);
                return (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-100/90 via-orange-100/70 to-amber-50 dark:from-amber-950/70 dark:via-stone-850 dark:to-stone-900 border-2 border-amber-300 dark:border-amber-700 shadow-sm space-y-2">
                    <div className="flex items-center gap-3.5">
                      <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white text-2xl flex items-center justify-center shadow-xs shrink-0">
                        {dInfo.symbol}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm sm:text-base font-serif text-amber-950 dark:text-amber-200">
                          🕉️ तिथिका अधिष्ठाता देवता: {dInfo.deityNameNepali}
                        </h4>
                        <p className="text-xs text-amber-900 dark:text-amber-300 font-medium">
                          {dInfo.deityTitle}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed pt-1">
                      {dInfo.description}
                    </p>
                  </div>
                );
              })()}

              {/* Traditional Nepali Festival Cultural Box (If Festival Article) */}
              {selectedStoredArticle.id.startsWith('auto_festival_') && (() => {
                const fCode = selectedStoredArticle.id.replace('auto_festival_', '').replace('_2083', '');
                const fArt = getNepaliFestivalArt(fCode) || getNepaliFestivalArt(selectedStoredArticle.slug.replace('festival-', ''));
                if (!fArt) return null;
                return (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 dark:from-stone-850 dark:via-stone-900 dark:to-stone-850 border-2 border-amber-300 dark:border-amber-700 shadow-sm space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🇳🇵</span>
                      <h4 className="font-bold text-sm sm:text-base font-serif text-[#7A1C1C] dark:text-amber-400">
                        नेपाली मौलिक परम्परा तथा मनाउने विधि: {fArt.festivalName}
                      </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                      {fArt.description}
                    </p>
                    <div className="space-y-1.5 pt-1 border-t border-amber-200/60 dark:border-stone-700">
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                        नेपाली परम्परागत पूजन तथा सांस्कृतिक सामग्रीहरू:
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {fArt.traditionalElements.map((el, i) => (
                          <span key={i} className="text-xs bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/70 font-medium shadow-2xs">
                            ✓ {el}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Lead Summary */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-600 rounded-r-2xl font-medium text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
                {selectedStoredArticle.summary}
              </div>

              {/* Full Article Content with Rich Typography & Shloka Styling */}
              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-stone-800 dark:text-stone-200">
                {selectedStoredArticle.content.split('\n\n').map((para, pIdx) => {
                  const trimmed = para.trim();
                  if (!trimmed) return null;

                  // Heading 1
                  if (trimmed.startsWith('# ')) {
                    return (
                      <h2 key={pIdx} className="text-lg sm:text-xl font-bold font-serif text-stone-950 dark:text-stone-50 border-b border-stone-200 dark:border-stone-800 pb-2 pt-2">
                        {trimmed.replace('# ', '')}
                      </h2>
                    );
                  }

                  // Heading 2
                  if (trimmed.startsWith('## ')) {
                    return (
                      <h3 key={pIdx} className="text-base sm:text-lg font-bold font-serif text-[#7A1C1C] dark:text-amber-400 pt-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>{trimmed.replace('## ', '')}</span>
                      </h3>
                    );
                  }

                  // Heading 3
                  if (trimmed.startsWith('### ')) {
                    return (
                      <h4 key={pIdx} className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 pt-2">
                        {trimmed.replace('### ', '')}
                      </h4>
                    );
                  }

                  // Shloka Blockquote (> )
                  if (trimmed.startsWith('>')) {
                    const cleanQuotes = trimmed.split('\n').map(l => l.replace(/^>\s?/, '')).join('\n');
                    return (
                      <div 
                        key={pIdx}
                        className="my-3 p-4 bg-gradient-to-r from-amber-100/80 via-orange-50 to-amber-50 dark:from-amber-950/50 dark:via-stone-900 dark:to-stone-900 border-l-4 border-amber-600 rounded-r-2xl font-serif text-amber-950 dark:text-amber-200 shadow-2xs whitespace-pre-line leading-relaxed"
                      >
                        {cleanQuotes}
                      </div>
                    );
                  }

                  // Bullet Points
                  if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    return (
                      <ul key={pIdx} className="list-disc pl-5 space-y-1.5 text-stone-700 dark:text-stone-300">
                        {trimmed.split('\n').map((line, lIdx) => (
                          <li key={lIdx}>{line.replace(/^[-*]\s+/, '')}</li>
                        ))}
                      </ul>
                    );
                  }

                  // Divider
                  if (trimmed === '---') {
                    return <hr key={pIdx} className="border-stone-200 dark:border-stone-800 my-4" />;
                  }

                  // Regular Paragraph
                  return (
                    <p key={pIdx} className="leading-relaxed whitespace-pre-line">
                      {trimmed}
                    </p>
                  );
                })}
              </div>

              {/* Tags */}
              {selectedStoredArticle.tags && selectedStoredArticle.tags.length > 0 && (
                <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-stone-500 font-medium">ट्यागहरू:</span>
                  {selectedStoredArticle.tags.map((t, idx) => (
                    <span 
                      key={idx}
                      className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2.5 py-1 rounded-lg text-[11px]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 flex items-center justify-between text-xs shrink-0">
              <span className="text-stone-500">
                © बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग केन्द्र
              </span>
              <button
                type="button"
                onClick={() => setSelectedStoredArticle(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl font-bold cursor-pointer transition-colors"
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: 9-GRAHA LIVE TRANSIT FULL REPORT MODAL */}
      {/* ========================================================================= */}
      {selectedGrahaArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-6 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#7A1C1C] via-[#9B2C2C] to-[#5C1515] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-amber-500/20 font-serif text-xl font-bold flex items-center justify-center text-amber-300 border border-amber-400/40">
                  {selectedGrahaArticle.symbol}
                </span>
                <div>
                  <h3 className="font-bold text-base sm:text-lg font-serif">
                    {selectedGrahaArticle.planet} ग्रह प्रत्यक्ष गोचर समाचार
                  </h3>
                  <p className="text-xs text-amber-200">
                    {selectedGrahaArticle.currentRashi} राशि • {selectedGrahaArticle.degreeStr} • {selectedGrahaArticle.nakshatra} ({selectedGrahaArticle.pada} पाउ)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleShareGrahaWhatsApp(selectedGrahaArticle)}
                  className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  title="ह्वाट्सएपमा सेयर गर्नुहोस्"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">ह्वाट्सएप</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyShareLink(selectedGrahaArticle.headline, selectedGrahaArticle.planet)}
                  className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  title="लिङ्क कपी गर्नुहोस्"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
                  <span className="hidden sm:inline">{copiedLink ? 'कपी भयो' : 'लिङ्क'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGrahaArticle(null)}
                  className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
              {/* Headline */}
              <div className="space-y-2">
                <span className="bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 text-xs font-bold px-2.5 py-1 rounded-md">
                  प्रत्यक्ष खगोल गोचर विश्लेषण
                </span>
                <h2 className="text-lg sm:text-2xl font-bold font-serif text-stone-950 dark:text-stone-50 leading-snug">
                  {selectedGrahaArticle.headline}
                </h2>
              </div>

              {/* Author and Read metadata */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pb-2 border-b border-stone-100 dark:border-stone-800">
                <span className="flex items-center gap-1 font-semibold text-stone-700 dark:text-stone-300">
                  <Globe2 className="w-3.5 h-3.5 text-amber-600" />
                  {selectedGrahaArticle.author}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {toDevanagariNumerals(selectedGrahaArticle.readTimeMinutes)} मिनेट अध्ययन
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {toDevanagariNumerals(selectedGrahaArticle.viewsCount)} पटक हेरिएको
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
                    <p className="font-bold text-stone-900 dark:text-stone-100">{selectedGrahaArticle.currentRashi}</p>
                  </div>
                  <div className="bg-white/80 dark:bg-stone-900/80 p-2 rounded-lg border border-amber-100 dark:border-amber-900">
                    <span className="text-[11px] text-stone-500">स्पष्ट भोगांश (Degree):</span>
                    <p className="font-bold text-stone-900 dark:text-stone-100 font-mono">{selectedGrahaArticle.degreeStr}</p>
                  </div>
                  <div className="bg-white/80 dark:bg-stone-900/80 p-2 rounded-lg border border-amber-100 dark:border-amber-900">
                    <span className="text-[11px] text-stone-500">नक्षत्र तथा चरण:</span>
                    <p className="font-bold text-stone-900 dark:text-stone-100">{selectedGrahaArticle.nakshatra} (पाउ {selectedGrahaArticle.pada})</p>
                  </div>
                  <div className="bg-white/80 dark:bg-stone-900/80 p-2 rounded-lg border border-amber-100 dark:border-amber-900">
                    <span className="text-[11px] text-stone-500">गति / अवस्था:</span>
                    <p className="font-bold text-stone-900 dark:text-stone-100">{selectedGrahaArticle.motionStatus}</p>
                  </div>
                </div>
              </div>

              {/* News Body & Classical References */}
              <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-stone-800 dark:text-stone-200">
                <div className="bg-stone-100 dark:bg-stone-800/60 p-3 rounded-xl border-l-4 border-[#7A1C1C] dark:border-amber-500 font-medium">
                  {selectedGrahaArticle.leadSummary}
                </div>

                <div className="whitespace-pre-line space-y-3">
                  {selectedGrahaArticle.fullBody}
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl space-y-1 text-xs">
                  <strong className="text-amber-900 dark:text-amber-300">शास्त्रीय प्रमाण:</strong> {selectedGrahaArticle.classicalReference}
                  <div className="text-stone-600 dark:text-stone-400 mt-1">
                    <strong>देश-काल र बजार प्रभाव:</strong> {selectedGrahaArticle.mundaneImpact}
                  </div>
                </div>
              </div>

              {/* Comprehensive 12-Rashi Forecast Section */}
              <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold font-serif text-stone-950 dark:text-stone-100 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>{selectedGrahaArticle.planet} गोचरको १२ वटै राशिमा पर्ने प्रत्यक्ष प्रभाव र उपाय</span>
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
                  {(selectedGrahaArticle.rashiImpacts || [])
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
            <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-850 flex items-center justify-between text-xs shrink-0">
              <span className="text-stone-500">
                © बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग केन्द्र
              </span>
              <button
                type="button"
                onClick={() => setSelectedGrahaArticle(null)}
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
