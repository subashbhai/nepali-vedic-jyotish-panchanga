import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  Globe2, 
  Layers, 
  Award, 
  HelpCircle, 
  Share2, 
  Bookmark, 
  BookmarkCheck, 
  ExternalLink, 
  ChevronRight, 
  Sun, 
  Moon, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  HeartHandshake, 
  ShieldCheck, 
  Copy, 
  X,
  Compass,
  FileText
} from 'lucide-react';
import { 
  CURATED_ARTICLES, 
  PLANETARY_INFLUENCES, 
  ASTROLOGICAL_YOGAS, 
  ASTROLOGICAL_TERMS, 
  KnowledgeArticle, 
  PlanetaryInfluence, 
  AstrologicalYoga, 
  AstrologicalTerm 
} from '../data/jyotishKnowledgeData';
import { RASHI_DATA, NAKSHATRA_DATA } from '../utils/astroCalculations';

export const KnowledgeBaseView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'articles' | 'grahas' | 'yogas' | 'terms' | 'rashis'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [selectedGraha, setSelectedGraha] = useState<PlanetaryInfluence | null>(null);
  const [selectedYoga, setSelectedYoga] = useState<AstrologicalYoga | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<AstrologicalTerm | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('jyotish_saved_knowledge');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  // Sync saved bookmarks
  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('jyotish_saved_knowledge', JSON.stringify(next));
      } catch (err) {
        console.error('Error saving bookmark:', err);
      }
      return next;
    });
  };

  const handleCopyText = (title: string, text: string) => {
    navigator.clipboard.writeText(`${title}\n\n${text}\n\n— बालानन्द ज्योतिष ज्ञानकोश`);
    setCopiedNotification(title);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  // Filtered lists based on search & tag
  const filteredArticles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return CURATED_ARTICLES.filter((a) => {
      const matchesSearch = !q || 
        a.titleNepali.toLowerCase().includes(q) ||
        a.titleEnglish.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q));
      const matchesTag = !filterTag || a.tags.includes(filterTag);
      return matchesSearch && matchesTag;
    });
  }, [searchQuery, filterTag]);

  const filteredGrahas = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return PLANETARY_INFLUENCES.filter((g) => {
      return !q || 
        g.nameNepali.toLowerCase().includes(q) ||
        g.nameEnglish.toLowerCase().includes(q) ||
        g.karakatva.some((k) => k.toLowerCase().includes(q)) ||
        g.gemstone.toLowerCase().includes(q);
    });
  }, [searchQuery]);

  const filteredYogas = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return ASTROLOGICAL_YOGAS.filter((y) => {
      return !q || 
        y.nameNepali.toLowerCase().includes(q) ||
        y.nameSanskrit.toLowerCase().includes(q) ||
        y.classicalResult.toLowerCase().includes(q) ||
        y.practicalLifeImpact.toLowerCase().includes(q);
    });
  }, [searchQuery]);

  const filteredTerms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return ASTROLOGICAL_TERMS.filter((t) => {
      return !q || 
        t.termNepali.toLowerCase().includes(q) ||
        t.termEnglish.toLowerCase().includes(q) ||
        t.shortDefinition.toLowerCase().includes(q) ||
        t.detailedExplanation.toLowerCase().includes(q);
    });
  }, [searchQuery]);

  const filteredRashis = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return RASHI_DATA.filter((r) => {
      return !q || 
        r.name.toLowerCase().includes(q) ||
        r.element.toLowerCase().includes(q) ||
        r.lord.toLowerCase().includes(q);
    });
  }, [searchQuery]);

  const totalResultsCount = 
    filteredArticles.length + 
    filteredGrahas.length + 
    filteredYogas.length + 
    filteredTerms.length +
    filteredRashis.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4">
      
      {/* 1. TOP HERO BANNER */}
      <div className="bg-gradient-to-r from-amber-900 via-red-950 to-stone-900 text-amber-50 p-6 sm:p-8 rounded-3xl shadow-xl border border-amber-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/30 text-amber-200 px-3 py-1 rounded-full text-xs font-bold border border-amber-400/40 uppercase tracking-wide flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span>वैदिक ज्ञान भण्डार</span>
              </span>
              <span className="text-amber-300 text-xs font-serif font-bold">॥ ज्ञानं परं बलम् ॥</span>
            </div>

            {savedIds.length > 0 && (
              <span className="bg-amber-100/20 text-amber-200 px-3 py-1 rounded-full text-xs font-medium border border-amber-300/30 flex items-center gap-1.5">
                <BookmarkCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>{savedIds.length} सामग्री सुरक्षित (Saved)</span>
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-black font-serif text-white tracking-tight flex items-center gap-2.5">
              <span>ज्योतिष ज्ञानकोश</span>
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 animate-pulse" />
            </h1>
            <p className="text-xs sm:text-sm text-amber-200/90 max-w-3xl font-serif leading-relaxed">
              वैदिक ज्योतिष, ९ ग्रहहरूको प्रभाव तथा कारकत्व, शुभ राजयोग तथा अरिष्ट दोष, प्रामाणिक पारिभाषिक शब्दावली र १२ राशि २७ नक्षत्रको विस्तृत विश्वकोश।
            </p>
          </div>

          {/* SEARCH BAR */}
          <div className="pt-2">
            <div className="relative max-w-2xl">
              <Search className="w-5 h-5 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="खोज्नुहोस्: जस्तै सूर्यको प्रभाव, गजकेसरी योग, साढेसाती, अयनांश, मांगलिक दोष..."
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-black/40 border border-amber-500/40 text-amber-50 placeholder-amber-200/60 focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs sm:text-sm font-medium backdrop-blur-md shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-300 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* COPY NOTIFICATION TOAST */}
      {copiedNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-emerald-100 border border-emerald-500 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>"{copiedNotification}" को सारांश क्लिपबोर्डमा प्रतिलिपि भयो!</span>
        </div>
      )}

      {/* 2. CATEGORY TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: 'सबै ज्ञान सामग्री', count: totalResultsCount, icon: BookOpen },
          { id: 'articles', label: 'वैदिक लेखहरू', count: filteredArticles.length, icon: FileText },
          { id: 'grahas', label: '९ ग्रह प्रभाव', count: filteredGrahas.length, icon: Globe2 },
          { id: 'yogas', label: 'योग तथा दोष', count: filteredYogas.length, icon: Award },
          { id: 'terms', label: 'शब्दावली (Glossary)', count: filteredTerms.length, icon: Compass },
          { id: 'rashis', label: 'राशि र नक्षत्र', count: filteredRashis.length, icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id as any);
                setFilterTag(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-red-800 text-white shadow-md ring-2 ring-red-700/50'
                  : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-amber-200/80 dark:border-stone-800 hover:bg-amber-50 dark:hover:bg-stone-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-amber-700 dark:text-amber-400'}`} />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-red-950 text-amber-200' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ACTIVE TAG FILTER IF APPLIED */}
      {filterTag && (
        <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-3.5 py-1.5 rounded-xl text-xs text-amber-950 dark:text-amber-200">
          <span>ट्याग फिल्टर: <strong>#{filterTag}</strong></span>
          <button onClick={() => setFilterTag(null)} className="text-red-700 hover:text-red-900 font-bold ml-1">
            ✕ हटाउनुहोस्
          </button>
        </div>
      )}

      {/* 3. MAIN CONTENT GRID */}
      <div className="space-y-8">

        {/* SECTION A: CURATED VEDIC ARTICLES */}
        {(activeCategory === 'all' || activeCategory === 'articles') && filteredArticles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 dark:border-stone-800 pb-2">
              <h2 className="text-lg font-bold font-serif text-red-900 dark:text-amber-400 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-700" />
                <span>वैदिक अनुसन्धान तथा विस्तृत लेखहरू ({filteredArticles.length})</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredArticles.map((article) => {
                const isSaved = savedIds.includes(article.id);
                return (
                  <div
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between group space-y-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                          {article.categoryLabel}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.readTime}
                          </span>
                          <button
                            onClick={(e) => toggleBookmark(article.id, e)}
                            className="text-stone-400 hover:text-amber-600 p-1"
                            title={isSaved ? 'सुरक्षित सूचीबाट हटाउनुहोस्' : 'सुरक्षित गर्नुहोस्'}
                          >
                            {isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-600" /> : <Bookmark className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-red-800 dark:group-hover:text-amber-400 font-serif line-clamp-2">
                        {article.titleNepali}
                      </h3>

                      <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-3 leading-relaxed">
                        {article.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {article.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[10px] text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <span className="text-xs font-bold text-red-800 dark:text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>विस्तृत पढ्नुहोस्</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION B: 9 PLANETARY INFLUENCES (९ ग्रह प्रभाव) */}
        {(activeCategory === 'all' || activeCategory === 'grahas') && filteredGrahas.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 dark:border-stone-800 pb-2">
              <h2 className="text-lg font-bold font-serif text-red-900 dark:text-amber-400 flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-red-700" />
                <span>नवग्रह प्रभाव, कारकत्व तथा शास्त्रीय विश्लेषण ({filteredGrahas.length})</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGrahas.map((graha) => {
                const isSaved = savedIds.includes(graha.id);
                return (
                  <div
                    key={graha.id}
                    onClick={() => setSelectedGraha(graha)}
                    className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-amber-400 transition-all cursor-pointer space-y-3 group"
                  >
                    <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center font-bold text-red-800 dark:text-amber-400 text-sm">
                          {graha.nameNepali.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-red-800 dark:group-hover:text-amber-400">
                            {graha.nameNepali}
                          </h3>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400">{graha.nameSanskrit}</p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => toggleBookmark(graha.id, e)}
                        className="text-stone-400 hover:text-amber-600 p-1"
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-600" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-amber-50/70 dark:bg-stone-800/60 p-2 rounded-lg">
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-bold">उच्च राशि</span>
                        <strong className="text-emerald-700 dark:text-emerald-400">{graha.exaltation.rashi} ({graha.exaltation.degree})</strong>
                      </div>
                      <div className="bg-amber-50/70 dark:bg-stone-800/60 p-2 rounded-lg">
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 block font-bold">नीच राशि</span>
                        <strong className="text-red-700 dark:text-red-400">{graha.debilitation.rashi} ({graha.debilitation.degree})</strong>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="text-stone-700 dark:text-stone-300">
                        <strong className="text-amber-900 dark:text-amber-300">मुख्य कारकत्व:</strong> {graha.karakatva.slice(0, 3).join(', ')}
                      </p>
                      <p className="text-stone-700 dark:text-stone-300">
                        <strong className="text-amber-900 dark:text-amber-300">शुभ रत्न:</strong> {graha.gemstone} ({graha.metal})
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs font-bold text-red-800 dark:text-amber-400">
                      <span>उपाय र प्रभाव हेर्नुहोस्</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION C: ASTROLOGICAL YOGAS & DOSHAS (योग तथा दोष) */}
        {(activeCategory === 'all' || activeCategory === 'yogas') && filteredYogas.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 dark:border-stone-800 pb-2">
              <h2 className="text-lg font-bold font-serif text-red-900 dark:text-amber-400 flex items-center gap-2">
                <Award className="w-5 h-5 text-red-700" />
                <span>प्रमुख राजयोग, धनयोग तथा अरिष्ट दोषहरू ({filteredYogas.length})</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredYogas.map((yoga) => {
                const isSaved = savedIds.includes(yoga.id);
                const isDosha = yoga.type === 'dosha' || yoga.type === 'arishta';
                return (
                  <div
                    key={yoga.id}
                    onClick={() => setSelectedYoga(yoga)}
                    className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-amber-400 transition-all cursor-pointer space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isDosha 
                            ? 'bg-red-100 text-red-900 border-red-300 dark:bg-red-950 dark:text-red-300' 
                            : 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {yoga.typeLabel}
                        </span>
                        <span className="text-[10px] text-stone-500 font-semibold">{yoga.frequency}</span>
                      </div>

                      <button
                        onClick={(e) => toggleBookmark(yoga.id, e)}
                        className="text-stone-400 hover:text-amber-600 p-1"
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-600" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>

                    <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-red-800 dark:group-hover:text-amber-400 font-serif">
                      {yoga.nameNepali}
                    </h3>

                    <div className="bg-amber-50/60 dark:bg-stone-800/50 p-3 rounded-xl border border-amber-200/60 dark:border-stone-700 text-xs space-y-1">
                      <p><strong className="text-amber-900 dark:text-amber-300">निर्माण सूत्र:</strong> {yoga.formationCriteria}</p>
                      <p className="text-stone-700 dark:text-stone-300"><strong className="text-stone-900 dark:text-stone-100">शास्त्रीय फल:</strong> {yoga.classicalResult}</p>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-xs font-bold text-red-800 dark:text-amber-400">
                      <span>{isDosha ? 'शान्ति उपाय तथा विश्लेषण' : 'जीवनमा प्रभाव तथा विश्लेषण'}</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION D: ASTROLOGICAL TERMS (पारिभाषिक शब्दावली) */}
        {(activeCategory === 'all' || activeCategory === 'terms') && filteredTerms.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 dark:border-stone-800 pb-2">
              <h2 className="text-lg font-bold font-serif text-red-900 dark:text-amber-400 flex items-center gap-2">
                <Compass className="w-5 h-5 text-red-700" />
                <span>ज्योतिष पारिभाषिक शब्दावली (Glossary - {filteredTerms.length})</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTerms.map((term) => {
                const isSaved = savedIds.includes(term.id);
                return (
                  <div
                    key={term.id}
                    onClick={() => setSelectedTerm(term)}
                    className="bg-white dark:bg-stone-900 border border-amber-200/80 dark:border-stone-800 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between group space-y-2"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2 py-0.5 rounded font-bold">
                          {term.categoryLabel}
                        </span>
                        <button
                          onClick={(e) => toggleBookmark(term.id, e)}
                          className="text-stone-400 hover:text-amber-600 p-0.5"
                        >
                          {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-red-800 dark:group-hover:text-amber-400 font-serif">
                        {term.termNepali}
                      </h3>

                      <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2">
                        {term.shortDefinition}
                      </p>
                    </div>

                    <span className="text-[11px] font-bold text-red-800 dark:text-amber-400 flex items-center gap-0.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                      <span>परिभाषा हेर्नुहोस्</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION E: 12 RASHIS & 27 NAKSHATRAS */}
        {(activeCategory === 'all' || activeCategory === 'rashis') && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200 dark:border-stone-800 pb-2">
                <h2 className="text-lg font-bold font-serif text-red-900 dark:text-amber-400 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-red-700" />
                  <span>१२ राशि निर्देशिका (12 Zodiac Signs)</span>
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredRashis.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white dark:bg-stone-900 rounded-2xl border border-amber-200/80 dark:border-stone-800 p-3.5 shadow-sm space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-1">
                      <span className="font-extrabold text-stone-900 dark:text-stone-100">{r.id}. {r.name}</span>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">{r.element}</span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300"><strong>स्वामी:</strong> {r.lord}</p>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300"><strong>स्वभाव:</strong> {r.quality}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-amber-200 dark:border-stone-800 pb-2">
                <h2 className="text-lg font-bold font-serif text-red-900 dark:text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-red-700" />
                  <span>२७ नक्षत्र निर्देशिका (27 Nakshatras)</span>
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {NAKSHATRA_DATA.map((n) => (
                  <div
                    key={n.id}
                    className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-3 shadow-sm space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-1">
                      <span className="font-bold text-stone-900 dark:text-stone-100">{n.id}. {n.name}</span>
                      <span className="text-[10px] text-red-700 dark:text-amber-400 font-semibold">{n.gana}</span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300"><strong>स्वामी:</strong> {n.lord}</p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">{n.yoni} / {n.nadi}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NO RESULTS EMPTY STATE */}
        {totalResultsCount === 0 && (
          <div className="text-center py-16 bg-white dark:bg-stone-900 border border-dashed border-stone-300 dark:border-stone-700 rounded-3xl space-y-3">
            <HelpCircle className="w-12 h-12 text-stone-400 mx-auto" />
            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">
              तपाईंको खोजी अनुसार कुनै ज्ञान सामग्री फेला परेन
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              कृपया फरक शब्दहरू जस्तै: सूर्य, चन्द्र, गजकेसरी, साढेसाती, विंशोत्तरी वा अयनांश प्रयोग गरी खोजी गर्नुहोस्।
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setFilterTag(null);
              }}
              className="mt-2 bg-red-800 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              सबै सामग्री पुनः हेर्नुहोस्
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ARTICLE DETAILS MODAL */}
      {/* ========================================================================= */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 border-2 border-amber-300 dark:border-stone-700 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-amber-900 to-red-950 text-amber-50 flex items-start justify-between gap-4 border-b border-amber-700/60">
              <div className="space-y-1">
                <span className="bg-amber-500/30 text-amber-200 px-3 py-0.5 rounded-full text-xs font-bold border border-amber-400/40">
                  {selectedArticle.categoryLabel} • {selectedArticle.readTime}
                </span>
                <h2 className="text-lg sm:text-2xl font-black font-serif text-white pt-1">
                  {selectedArticle.titleNepali}
                </h2>
                <p className="text-xs text-amber-200/80 font-sans">{selectedArticle.titleEnglish}</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleCopyText(selectedArticle.titleNepali, selectedArticle.summary)}
                  className="p-2 rounded-xl bg-amber-950/60 hover:bg-amber-900 text-amber-200 border border-amber-500/30 transition"
                  title="सारांश प्रतिलिपि गर्नुहोस्"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleBookmark(selectedArticle.id)}
                  className="p-2 rounded-xl bg-amber-950/60 hover:bg-amber-900 text-amber-200 border border-amber-500/30 transition"
                  title="सुरक्षित सूचीमा राख्नुहोस्"
                >
                  {savedIds.includes(selectedArticle.id) ? <BookmarkCheck className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 sm:p-8 overflow-y-auto space-y-6 text-stone-800 dark:text-stone-200 text-sm leading-relaxed">
              
              {/* Shloka if present */}
              {selectedArticle.shloka && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 p-4 rounded-2xl text-center space-y-1">
                  <p className="text-[11px] text-amber-900 dark:text-amber-300 font-bold uppercase tracking-wider">शास्त्रीय प्रमाण श्लोक</p>
                  <p className="font-serif font-bold text-red-950 dark:text-amber-200 text-base sm:text-lg">
                    {selectedArticle.shloka}
                  </p>
                </div>
              )}

              {/* Summary */}
              <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-2xl border border-stone-200 dark:border-stone-700">
                <h4 className="font-bold text-xs uppercase text-stone-500 dark:text-stone-400 mb-1">लेख सारांश</h4>
                <p className="text-sm font-medium">{selectedArticle.summary}</p>
              </div>

              {/* Sections */}
              {selectedArticle.content.map((sec, idx) => (
                <div key={idx} className="space-y-3">
                  <h3 className="text-base font-bold text-red-900 dark:text-amber-400 font-serif border-b border-amber-200 dark:border-stone-800 pb-1.5">
                    {sec.sectionTitle}
                  </h3>
                  
                  {sec.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="text-sm text-stone-700 dark:text-stone-300">
                      {p}
                    </p>
                  ))}

                  {sec.bulletPoints && (
                    <ul className="space-y-1.5 pl-2">
                      {sec.bulletPoints.map((bp, bIdx) => (
                        <li key={bIdx} className="flex items-start gap-2 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{bp}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {sec.keyTakeaway && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-3 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                      <strong>मुख्य निष्कर्ष:</strong> {sec.keyTakeaway}
                    </div>
                  )}
                </div>
              ))}

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-4 border-t border-stone-200 dark:border-stone-800">
                <span className="text-xs font-bold text-stone-500">सम्बन्धित विषय:</span>
                {selectedArticle.tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setFilterTag(t);
                      setSelectedArticle(null);
                    }}
                    className="text-xs bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-300 px-2.5 py-1 rounded-lg hover:bg-amber-200 transition font-medium"
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-stone-50 dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-serif">बालानन्द ज्योतिष ज्ञानकोश</span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="bg-red-800 hover:bg-red-900 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PLANETARY INFLUENCE DETAILS MODAL */}
      {/* ========================================================================= */}
      {selectedGraha && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 border-2 border-amber-300 dark:border-stone-700 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-amber-900 to-red-950 text-amber-50 flex items-start justify-between gap-4 border-b border-amber-700/60">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-bold text-amber-300 text-xl font-serif">
                  {selectedGraha.nameNepali.charAt(0)}
                </div>
                <div>
                  <span className="bg-amber-500/30 text-amber-200 px-3 py-0.5 rounded-full text-xs font-bold border border-amber-400/40">
                    {selectedGraha.nature}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black font-serif text-white pt-1">
                    {selectedGraha.nameNepali} ({selectedGraha.nameEnglish})
                  </h2>
                  <p className="text-xs text-amber-200/80 font-serif">{selectedGraha.nameSanskrit}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => toggleBookmark(selectedGraha.id)}
                  className="p-2 rounded-xl bg-amber-950/60 hover:bg-amber-900 text-amber-200 border border-amber-500/30 transition"
                  title="सुरक्षित गर्नुहोस्"
                >
                  {savedIds.includes(selectedGraha.id) ? <BookmarkCheck className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setSelectedGraha(null)}
                  className="p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 sm:p-8 overflow-y-auto space-y-6 text-stone-800 dark:text-stone-200 text-xs sm:text-sm">
              
              {/* Mantra Box */}
              <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 p-4 rounded-2xl text-center space-y-1">
                <p className="text-[11px] text-amber-900 dark:text-amber-300 font-bold">बीज मन्त्र</p>
                <p className="font-serif font-black text-red-900 dark:text-amber-200 text-base sm:text-lg">
                  {selectedGraha.beejaMantra}
                </p>
                <p className="text-[11px] text-stone-600 dark:text-stone-400">आराध्य देव: <strong>{selectedGraha.rulingDeity}</strong></p>
              </div>

              {/* Rashi Dignities Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold block">उच्च राशि</span>
                  <strong className="text-sm font-bold text-emerald-950 dark:text-emerald-200">{selectedGraha.exaltation.rashi}</strong>
                  <p className="text-[10px] text-emerald-700">परमोच्च: {selectedGraha.exaltation.degree}</p>
                </div>

                <div className="bg-red-50 dark:bg-red-950/30 border border-red-300 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] text-red-800 dark:text-red-300 font-bold block">नीच राशि</span>
                  <strong className="text-sm font-bold text-red-950 dark:text-red-200">{selectedGraha.debilitation.rashi}</strong>
                  <p className="text-[10px] text-red-700">परम नीच: {selectedGraha.debilitation.degree}</p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold block">स्वराशि</span>
                  <strong className="text-sm font-bold text-amber-950 dark:text-amber-200">{selectedGraha.ownRashis.join(', ')}</strong>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-300 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] text-indigo-800 dark:text-indigo-300 font-bold block">मूलत्रिकोण</span>
                  <strong className="text-sm font-bold text-indigo-950 dark:text-indigo-200">{selectedGraha.moolatrikona}</strong>
                </div>
              </div>

              {/* Karakatva & Traits */}
              <div className="space-y-3">
                <h4 className="font-bold text-red-900 dark:text-amber-400 font-serif border-b pb-1 text-sm sm:text-base">
                  मुख्य कारकत्व तथा प्रभाव
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedGraha.karakatva.map((k) => (
                    <span key={k} className="bg-amber-100 dark:bg-stone-800 text-amber-950 dark:text-amber-200 px-3 py-1 rounded-xl font-semibold text-xs border border-amber-300/60 dark:border-stone-700">
                      • {k}
                    </span>
                  ))}
                </div>
              </div>

              {/* Positive & Negative Traits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-300/70 p-4 rounded-2xl space-y-2">
                  <h5 className="font-bold text-emerald-900 dark:text-emerald-300 text-xs uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>बलवान् / शुभ हुँदाका लक्षण</span>
                  </h5>
                  <ul className="space-y-1 text-xs text-stone-700 dark:text-stone-300">
                    {selectedGraha.positiveTraits.map((t, idx) => (
                      <li key={idx}>✓ {t}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-50/70 dark:bg-red-950/20 border border-red-300/70 p-4 rounded-2xl space-y-2">
                  <h5 className="font-bold text-red-900 dark:text-red-300 text-xs uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>कमजोर / पीडित हुँदाका लक्षण</span>
                  </h5>
                  <ul className="space-y-1 text-xs text-stone-700 dark:text-stone-300">
                    {selectedGraha.negativeTraits.map((t, idx) => (
                      <li key={idx}>⚠️ {t}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Classical Remedies */}
              <div className="bg-amber-50 dark:bg-stone-800/60 p-4 rounded-2xl border border-amber-300 dark:border-stone-700 space-y-2">
                <h4 className="font-bold text-red-900 dark:text-amber-400 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-red-700" />
                  <span>शास्त्रीय शान्ति तथा शुभता अभिवृद्धि उपायहरू</span>
                </h4>
                <ul className="space-y-1.5 pl-2 text-xs text-stone-800 dark:text-stone-200">
                  {selectedGraha.afflictedRemedies.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-700 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Health & Career */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
                  <strong className="text-amber-900 dark:text-amber-300 block font-bold">स्वास्थ्य सम्बन्धी सम्बन्ध:</strong>
                  <p>{selectedGraha.healthCorrelations.join(', ')}</p>
                </div>
                <div className="p-3.5 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
                  <strong className="text-amber-900 dark:text-amber-300 block font-bold">अनुकूल पेशा / व्यवसाय:</strong>
                  <p>{selectedGraha.careerFields.join(', ')}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-stone-50 dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-serif">रत्न: {selectedGraha.gemstone} | धातु: {selectedGraha.metal}</span>
              <button
                onClick={() => setSelectedGraha(null)}
                className="bg-red-800 hover:bg-red-900 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* YOGA / DOSHA DETAILS MODAL */}
      {/* ========================================================================= */}
      {selectedYoga && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 border-2 border-amber-300 dark:border-stone-700 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            <div className="p-4 sm:p-6 bg-gradient-to-r from-amber-900 to-red-950 text-amber-50 flex items-start justify-between gap-4 border-b border-amber-700/60">
              <div>
                <span className="bg-amber-500/30 text-amber-200 px-3 py-0.5 rounded-full text-xs font-bold border border-amber-400/40">
                  {selectedYoga.typeLabel}
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-serif text-white pt-1">
                  {selectedYoga.nameNepali}
                </h2>
                <p className="text-xs text-amber-200/80 font-serif">{selectedYoga.nameSanskrit}</p>
              </div>

              <button
                onClick={() => setSelectedYoga(null)}
                className="p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-stone-800 dark:text-stone-200 text-xs sm:text-sm">
              {selectedYoga.shloka && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 p-3.5 rounded-xl text-center">
                  <p className="font-serif font-bold text-red-950 dark:text-amber-200 text-sm sm:text-base">
                    {selectedYoga.shloka}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-bold text-red-900 dark:text-amber-400 text-sm">१. निर्माण हुने शास्त्रीय सूत्र (Formation)</h4>
                <p className="bg-stone-50 dark:bg-stone-800 p-3.5 rounded-xl border border-stone-200 dark:border-stone-700 leading-relaxed">
                  {selectedYoga.formationCriteria}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-red-900 dark:text-amber-400 text-sm">२. शास्त्रीय फल तथा प्रभाव (Result)</h4>
                <p className="bg-stone-50 dark:bg-stone-800 p-3.5 rounded-xl border border-stone-200 dark:border-stone-700 leading-relaxed">
                  {selectedYoga.classicalResult}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-red-900 dark:text-amber-400 text-sm">३. व्यावहारिक जीवनमा प्रभाव</h4>
                <p className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 p-3.5 rounded-xl text-emerald-950 dark:text-emerald-200 leading-relaxed font-medium">
                  {selectedYoga.practicalLifeImpact}
                </p>
              </div>

              {selectedYoga.cancellationOrRemedy && (
                <div className="space-y-2">
                  <h4 className="font-bold text-red-900 dark:text-amber-400 text-sm">४. दोष भङ्ग तथा शास्त्रीय शान्ति उपाय</h4>
                  <p className="bg-red-50 dark:bg-red-950/30 border border-red-300 p-3.5 rounded-xl text-red-950 dark:text-red-200 leading-relaxed">
                    {selectedYoga.cancellationOrRemedy}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-stone-50 dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 flex items-center justify-end">
              <button
                onClick={() => setSelectedYoga(null)}
                className="bg-red-800 hover:bg-red-900 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                बन्द गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GLOSSARY TERM DETAILS MODAL */}
      {/* ========================================================================= */}
      {selectedTerm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 border-2 border-amber-300 dark:border-stone-700 rounded-3xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden">
            
            <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-900 to-red-950 text-amber-50 flex items-start justify-between gap-4 border-b border-amber-700/60">
              <div>
                <span className="bg-amber-500/30 text-amber-200 px-3 py-0.5 rounded-full text-xs font-bold border border-amber-400/40">
                  {selectedTerm.categoryLabel}
                </span>
                <h2 className="text-xl font-black font-serif text-white pt-1">
                  {selectedTerm.termNepali}
                </h2>
                <p className="text-xs text-amber-200/80">{selectedTerm.termEnglish}</p>
              </div>

              <button
                onClick={() => setSelectedTerm(null)}
                className="p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-stone-800 dark:text-stone-200 text-xs sm:text-sm">
              <div className="bg-amber-50 dark:bg-stone-800 p-4 rounded-xl border border-amber-200 dark:border-stone-700">
                <h4 className="font-bold text-xs uppercase text-amber-900 dark:text-amber-300 mb-1">संक्षिप्त परिभाषा</h4>
                <p className="font-medium leading-relaxed">{selectedTerm.shortDefinition}</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-stone-900 dark:text-stone-100">विस्तृत शास्त्रीय व्याख्या:</h4>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed">{selectedTerm.detailedExplanation}</p>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 p-3.5 rounded-xl text-emerald-900 dark:text-emerald-200">
                <strong className="block text-xs font-bold mb-0.5">व्यावहारिक फलादेशमा प्रयोग:</strong>
                <p>{selectedTerm.practicalApplication}</p>
              </div>
            </div>

            <div className="p-4 bg-stone-50 dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 flex items-center justify-end">
              <button
                onClick={() => setSelectedTerm(null)}
                className="bg-red-800 hover:bg-red-900 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                बुझें (बन्द गर्नुहोस्)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
