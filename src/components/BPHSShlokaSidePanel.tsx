import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Award,
  ShieldCheck,
  HeartHandshake,
  CheckCircle2,
  X,
  Search,
  Copy,
  Check,
  Layers,
  ChevronRight,
  ExternalLink,
  Info,
  Calendar,
  Volume2
} from 'lucide-react';
import {
  PlanetName,
  BPHSClassicalShloka,
  BPHSDashaShloka,
  BPHSYogaShloka,
  BPHS_GRAHA_SWAROOPA,
  BPHS_MAHADASHA_SHLOKAS,
  BPHS_YOGA_SHLOKAS,
  BPHS_BHAVA_SHLOKAS,
  getBPHSShlokaForPlanet,
  getBPHSDashaShloka,
  getBPHSYogaShloka,
  getBPHSHouseShloka,
  searchAllBPHSShlokas
} from '../utils/brihatParasharaDatabase';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';

export type ShlokaViewTarget = 
  | { type: 'dasha'; planet: PlanetName; antardashaPlanet?: PlanetName }
  | { type: 'yoga'; yogaCodeOrName: string }
  | { type: 'graha'; planet: PlanetName }
  | { type: 'bhava'; houseNumber: number }
  | { type: 'browser'; defaultQuery?: string };

interface BPHSShlokaSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  target?: ShlokaViewTarget | null;
  onSelectTarget?: (target: ShlokaViewTarget) => void;
}

export const BPHSShlokaSidePanel: React.FC<BPHSShlokaSidePanelProps> = ({
  isOpen,
  onClose,
  target,
  onSelectTarget
}) => {
  const [activeTab, setActiveTab] = useState<'selected' | 'dashaList' | 'yogaList' | 'search'>('selected');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPlayingChant, setIsPlayingChant] = useState(false);

  useEffect(() => {
    if (target?.type === 'browser') {
      setActiveTab('search');
      if (target.defaultQuery) {
        setSearchQuery(target.defaultQuery);
      }
    } else {
      setActiveTab('selected');
    }
  }, [target]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePlayRecitation = (verse: string) => {
    if ('speechSynthesis' in window) {
      if (isPlayingChant) {
        window.speechSynthesis.cancel();
        setIsPlayingChant(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(verse);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.lang = 'sa-IN'; // Sanskrit / Hindi voice if available
      utterance.onend = () => setIsPlayingChant(false);
      utterance.onerror = () => setIsPlayingChant(false);
      setIsPlayingChant(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Derive active content based on target
  let dashaData: BPHSDashaShloka | undefined;
  let yogaData: BPHSYogaShloka | undefined;
  let grahaData: BPHSClassicalShloka | undefined;
  let bhavaData: any | undefined;

  if (target?.type === 'dasha') {
    dashaData = getBPHSDashaShloka(target.planet);
    grahaData = getBPHSShlokaForPlanet(target.planet);
  } else if (target?.type === 'yoga') {
    yogaData = getBPHSYogaShloka(target.yogaCodeOrName);
  } else if (target?.type === 'graha') {
    grahaData = getBPHSShlokaForPlanet(target.planet);
    dashaData = getBPHSDashaShloka(target.planet);
  } else if (target?.type === 'bhava') {
    bhavaData = getBPHSHouseShloka(target.houseNumber);
  }

  // Fallback if none selected
  if (!dashaData && !yogaData && !grahaData && !bhavaData && target?.type !== 'browser') {
    dashaData = BPHS_MAHADASHA_SHLOKAS['गुरु'];
  }

  const searchResults = searchAllBPHSShlokas(searchQuery);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end transition-opacity duration-300">
      <div 
        className="w-full max-w-2xl bg-amber-50 dark:bg-stone-900 h-full shadow-2xl flex flex-col border-l border-amber-300/60 dark:border-stone-700 animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-linear-to-r from-amber-900 via-amber-950 to-stone-900 text-amber-100 px-5 py-4 border-b border-amber-700/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600/40 border border-amber-500/50 flex items-center justify-center text-amber-300 shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-serif text-amber-200">
                  बृहत्पाराशर होराशास्त्रम्
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 border border-amber-400/40 font-semibold">
                  शास्त्रीय प्रमाण
                </span>
              </div>
              <p className="text-xs text-amber-300/80">
                प्रामाणिक संस्कृत श्लोक, पदच्छेद तथा विस्तृत नेपाली व्याख्या
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-amber-900/80 hover:bg-amber-800 text-amber-200 flex items-center justify-center transition-colors border border-amber-700/60"
            title="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation / Switcher Tabs */}
        <div className="bg-amber-100/80 dark:bg-stone-950 px-4 py-2 border-b border-amber-200 dark:border-stone-800 flex items-center gap-1.5 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('selected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'selected'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-700 dark:text-stone-300 hover:bg-amber-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>वर्तमान श्लोक</span>
          </button>

          <button
            onClick={() => setActiveTab('dashaList')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'dashaList'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-700 dark:text-stone-300 hover:bg-amber-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>दशा श्लोकहरू ({toDevanagariNumerals(Object.keys(BPHS_MAHADASHA_SHLOKAS).length)})</span>
          </button>

          <button
            onClick={() => setActiveTab('yogaList')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'yogaList'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-700 dark:text-stone-300 hover:bg-amber-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>योग श्लोकहरू ({toDevanagariNumerals(Object.keys(BPHS_YOGA_SHLOKAS).length)})</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'search'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-700 dark:text-stone-300 hover:bg-amber-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>खोज तथा सङ्ग्रह</span>
          </button>
        </div>

        {/* Panel Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: CURRENT SELECTED SHLOKA */}
          {activeTab === 'selected' && (
            <div className="space-y-6">
              {/* If Dasha context */}
              {dashaData && (
                <div className="space-y-4">
                  {/* Title & Badge */}
                  <div className="bg-amber-100 dark:bg-stone-850 p-4 rounded-2xl border border-amber-300/80 dark:border-stone-700 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold font-serif text-amber-950 dark:text-amber-200">
                          {dashaData.planet} महादशा फल
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-400">
                          अवधि: {toDevanagariNumerals(dashaData.durationYears)} वर्ष
                        </span>
                      </div>
                      <p className="text-xs text-amber-800 dark:text-amber-400 mt-1 font-medium">
                        {dashaData.sourceChapter}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePlayRecitation(dashaData!.sanskritVerse)}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                          isPlayingChant
                            ? 'bg-amber-600 text-white border-amber-600 animate-pulse'
                            : 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-stone-700 hover:bg-amber-50'
                        }`}
                        title="श्लोक उच्चारण सुन्नुहोस्"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span className="hidden sm:inline">{isPlayingChant ? 'रोक्नुहोस्' : 'उच्चारण'}</span>
                      </button>

                      <button
                        onClick={() => handleCopy(`${dashaData!.sanskritVerse}\n\n${dashaData!.generalMeaningNepali}`, 'dasha')}
                        className="p-2 rounded-xl bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 hover:bg-amber-50 border border-amber-300 dark:border-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        title="श्लोक र अर्थ कपी गर्नुहोस्"
                      >
                        {copiedKey === 'dasha' ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-700 dark:text-emerald-400">कपी भयो</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span className="hidden sm:inline">कपी</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sanskrit Shloka Box */}
                  <div className="bg-linear-to-b from-amber-100/90 to-amber-50 dark:from-stone-950 dark:to-stone-900 p-5 rounded-2xl border-2 border-amber-400/80 dark:border-amber-700/60 shadow-inner relative">
                    <div className="absolute right-3 top-2 text-xs font-bold text-amber-700/60 dark:text-amber-400/60 uppercase">
                      मूल संस्कृतम्
                    </div>
                    <p className="text-amber-950 dark:text-amber-100 font-serif text-base sm:text-lg leading-relaxed text-center font-bold tracking-wide whitespace-pre-line my-2">
                      {dashaData.sanskritVerse}
                    </p>
                  </div>

                  {/* Word by word breakdown */}
                  {dashaData.wordBreakdownNepali && (
                    <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-amber-200 dark:border-stone-700 space-y-1.5 shadow-xs">
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>पदच्छेद तथा शब्दार्थ (Word Breakdown):</span>
                      </span>
                      <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                        {dashaData.wordBreakdownNepali}
                      </p>
                    </div>
                  )}

                  {/* General Classical Meaning */}
                  <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-amber-200 dark:border-stone-700 space-y-2 shadow-xs">
                    <h4 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-300 flex items-center gap-1.5 font-serif">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>विस्तृत शास्त्रीय अन्वय तथा फलादेश:</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
                      {dashaData.generalMeaningNepali}
                    </p>
                  </div>

                  {/* Benefic vs Afflicted Comparison Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-300 dark:border-emerald-800 space-y-1.5">
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>शुभ / उच्च अवस्थाको फल:</span>
                      </span>
                      <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                        {dashaData.exaltedOrBeneficEffectNepali}
                      </p>
                    </div>

                    <div className="bg-rose-50/70 dark:bg-rose-950/30 p-4 rounded-2xl border border-rose-300 dark:border-rose-800 space-y-1.5">
                      <span className="text-xs font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-rose-600" />
                        <span>नीच / पीडित अवस्थाको फल:</span>
                      </span>
                      <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                        {dashaData.debilitatedOrAfflictedEffectNepali}
                      </p>
                    </div>
                  </div>

                  {/* Astrological Principles */}
                  {dashaData.astrologicalPrinciplesNepali && dashaData.astrologicalPrinciplesNepali.length > 0 && (
                    <div className="bg-amber-50 dark:bg-stone-900 p-4 rounded-2xl border border-amber-200 dark:border-stone-800 space-y-2">
                      <span className="text-xs font-bold text-amber-950 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-amber-600" />
                        <span>दशाफलोदयका मुख्य पाराशर नियमहरू:</span>
                      </span>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                        {dashaData.astrologicalPrinciplesNepali.map((rule, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Classical Remedy */}
                  <div className="bg-gradient-to-r from-amber-100/80 via-orange-100/60 to-amber-50 dark:from-amber-950/50 dark:to-stone-900 p-4 rounded-2xl border border-amber-300 dark:border-amber-800 space-y-1.5">
                    <span className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                      <HeartHandshake className="w-4 h-4 text-amber-600" />
                      <span>पाराशर विहित शास्त्रीय शान्ति तथा उपाय:</span>
                    </span>
                    <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-medium">
                      {dashaData.classicalRemedyNepali}
                    </p>
                  </div>
                </div>
              )}

              {/* If Yoga context */}
              {yogaData && (
                <div className="space-y-4">
                  {/* Title & Category Badge */}
                  <div className="bg-amber-100 dark:bg-stone-850 p-4 rounded-2xl border border-amber-300/80 dark:border-stone-700 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold font-serif text-amber-950 dark:text-amber-200">
                          {yogaData.nameNepali}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-400">
                          {yogaData.category}
                        </span>
                      </div>
                      <p className="text-xs text-amber-800 dark:text-amber-400 mt-1 font-medium">
                        {yogaData.sourceChapter}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePlayRecitation(yogaData!.sanskritVerse)}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
                          isPlayingChant
                            ? 'bg-amber-600 text-white border-amber-600 animate-pulse'
                            : 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-stone-700 hover:bg-amber-50'
                        }`}
                        title="श्लोक उच्चारण सुन्नुहोस्"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span className="hidden sm:inline">{isPlayingChant ? 'रोक्नुहोस्' : 'उच्चारण'}</span>
                      </button>

                      <button
                        onClick={() => handleCopy(`${yogaData!.sanskritVerse}\n\n${yogaData!.detailedMeaningNepali}`, 'yoga')}
                        className="p-2 rounded-xl bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 hover:bg-amber-50 border border-amber-300 dark:border-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        title="श्लोक र अर्थ कपी गर्नुहोस्"
                      >
                        {copiedKey === 'yoga' ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span className="text-emerald-700 dark:text-emerald-400">कपी भयो</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span className="hidden sm:inline">कपी</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sanskrit Shloka Box */}
                  <div className="bg-linear-to-b from-amber-100/90 to-amber-50 dark:from-stone-950 dark:to-stone-900 p-5 rounded-2xl border-2 border-amber-400/80 dark:border-amber-700/60 shadow-inner relative">
                    <div className="absolute right-3 top-2 text-xs font-bold text-amber-700/60 dark:text-amber-400/60 uppercase">
                      मूल संस्कृतम्
                    </div>
                    <p className="text-amber-950 dark:text-amber-100 font-serif text-base sm:text-lg leading-relaxed text-center font-bold tracking-wide whitespace-pre-line my-2">
                      {yogaData.sanskritVerse}
                    </p>
                  </div>

                  {/* Word Breakdown */}
                  {yogaData.wordBreakdownNepali && (
                    <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-amber-200 dark:border-stone-700 space-y-1.5 shadow-xs">
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>पदच्छेद तथा शब्दार्थ (Word Breakdown):</span>
                      </span>
                      <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                        {yogaData.wordBreakdownNepali}
                      </p>
                    </div>
                  )}

                  {/* Detailed Meaning */}
                  <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-amber-200 dark:border-stone-700 space-y-2 shadow-xs">
                    <h4 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-300 flex items-center gap-1.5 font-serif">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>विस्तृत शास्त्रीय अन्वय तथा फलादेश:</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
                      {yogaData.detailedMeaningNepali}
                    </p>
                  </div>

                  {/* Astrological Principles */}
                  {yogaData.astrologicalPrinciplesNepali && yogaData.astrologicalPrinciplesNepali.length > 0 && (
                    <div className="bg-amber-50 dark:bg-stone-900 p-4 rounded-2xl border border-amber-200 dark:border-stone-800 space-y-2">
                      <span className="text-xs font-bold text-amber-950 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-amber-600" />
                        <span>पाराशर योग सिद्धान्तहरू:</span>
                      </span>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                        {yogaData.astrologicalPrinciplesNepali.map((rule, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Timing and Trigger Rules */}
                  {yogaData.timingAndTriggerRulesNepali && (
                    <div className="bg-sky-50 dark:bg-sky-950/30 p-4 rounded-2xl border border-sky-200 dark:border-sky-800 space-y-1.5">
                      <span className="text-xs font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-sky-600" />
                        <span>फलोदय काल तथा दशा समन्वय:</span>
                      </span>
                      <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-medium">
                        {yogaData.timingAndTriggerRulesNepali}
                      </p>
                    </div>
                  )}

                  {/* Classical Remedy */}
                  {yogaData.classicalRemedyNepali && (
                    <div className="bg-gradient-to-r from-amber-100/80 via-orange-100/60 to-amber-50 dark:from-amber-950/50 dark:to-stone-900 p-4 rounded-2xl border border-amber-300 dark:border-amber-800 space-y-1.5">
                      <span className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                        <HeartHandshake className="w-4 h-4 text-amber-600" />
                        <span>शास्त्रीय उपाय तथा साधना:</span>
                      </span>
                      <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-medium">
                        {yogaData.classicalRemedyNepali}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* If Bhava context */}
              {bhavaData && (
                <div className="space-y-4">
                  <div className="bg-amber-100 dark:bg-stone-850 p-4 rounded-2xl border border-amber-300/80 dark:border-stone-700">
                    <h3 className="text-xl font-bold font-serif text-amber-950 dark:text-amber-200">
                      भाव {toDevanagariNumerals(target && 'houseNumber' in target ? target.houseNumber : 1)} फल श्लोक
                    </h3>
                    <p className="text-xs text-amber-800 dark:text-amber-400 mt-1">
                      {bhavaData.sourceChapter}
                    </p>
                  </div>

                  <div className="bg-linear-to-b from-amber-100/90 to-amber-50 dark:from-stone-950 dark:to-stone-900 p-5 rounded-2xl border-2 border-amber-400/80 dark:border-amber-700/60 shadow-inner">
                    <p className="text-amber-950 dark:text-amber-100 font-serif text-base sm:text-lg leading-relaxed text-center font-bold tracking-wide whitespace-pre-line my-2">
                      {bhavaData.sanskritVerse}
                    </p>
                  </div>

                  <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-amber-200 dark:border-stone-700 space-y-2">
                    <h4 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-300">
                      शास्त्रीय अर्थ तथा प्रभाव:
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
                      {bhavaData.classicalEffectNepali}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DASHA SHLOKAS LIST */}
          {activeTab === 'dashaList' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-600 dark:text-stone-400">
                सबै ९ ग्रहहरूका विंशोत्तरी महादशा फल संस्कृत श्लोकहरू र पराशर सिद्धान्त:
              </p>

              <div className="space-y-2.5">
                {Object.values(BPHS_MAHADASHA_SHLOKAS).map((d) => (
                  <button
                    key={d.planet}
                    onClick={() => {
                      if (onSelectTarget) {
                        onSelectTarget({ type: 'dasha', planet: d.planet });
                      }
                      setActiveTab('selected');
                    }}
                    className="w-full text-left bg-white dark:bg-stone-850 hover:bg-amber-50 dark:hover:bg-stone-800 p-3.5 rounded-2xl border border-amber-200 dark:border-stone-700 transition-all flex items-center justify-between group shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-amber-950 dark:text-amber-200 font-serif">
                          {d.planet} महादशा फल
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          {toDevanagariNumerals(d.durationYears)} वर्ष
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-1 font-serif">
                        {d.sanskritVerse.split('\n')[0]}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: YOGA SHLOKAS LIST */}
          {activeTab === 'yogaList' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-600 dark:text-stone-400">
                बृहत्पाराशर होराशास्त्रका प्रमुख राजयोग, धनयोग तथा पञ्चमहापुरुष श्लोकहरू:
              </p>

              <div className="space-y-2.5">
                {Object.values(BPHS_YOGA_SHLOKAS).map((y) => (
                  <button
                    key={y.yogaCode}
                    onClick={() => {
                      if (onSelectTarget) {
                        onSelectTarget({ type: 'yoga', yogaCodeOrName: y.yogaCode });
                      }
                      setActiveTab('selected');
                    }}
                    className="w-full text-left bg-white dark:bg-stone-850 hover:bg-amber-50 dark:hover:bg-stone-800 p-3.5 rounded-2xl border border-amber-200 dark:border-stone-700 transition-all flex items-center justify-between group shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-amber-950 dark:text-amber-200 font-serif">
                          {y.nameNepali}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          {y.category}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-1 font-serif">
                        {y.sanskritVerse.split('\n')[0]}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SEARCH ALL BPHS SHLOKAS */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-amber-600 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ग्रह, दशा, योग वा श्लोक खोज्नुहोस् (उदा: सूर्य, गजकेसरी, राजयोग)..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-amber-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2.5">
                {searchResults.length === 0 ? (
                  <div className="text-center py-8 text-stone-500 text-xs">
                    कुनै श्लोक भेटिएन। कृपया अर्को शब्द खोजी हेर्नुहोस्।
                  </div>
                ) : (
                  searchResults.map((res, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-amber-200 dark:border-stone-700 space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-amber-950 dark:text-amber-200 font-serif">
                          {res.title}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
                          {res.type}
                        </span>
                      </div>

                      <div className="bg-amber-50 dark:bg-stone-900 p-2.5 rounded-xl border border-amber-200/80 dark:border-stone-800">
                        <p className="text-xs text-amber-900 dark:text-amber-200 font-serif leading-relaxed line-clamp-2">
                          {res.sanskritVerse}
                        </p>
                      </div>

                      <p className="text-xs text-stone-700 dark:text-stone-300 line-clamp-2">
                        {res.detailedMeaning}
                      </p>

                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => {
                            if (res.type === 'dasha' && res.rawItem.planet) {
                              if (onSelectTarget) onSelectTarget({ type: 'dasha', planet: res.rawItem.planet });
                            } else if (res.type === 'yoga' && res.rawItem.yogaCode) {
                              if (onSelectTarget) onSelectTarget({ type: 'yoga', yogaCodeOrName: res.rawItem.yogaCode });
                            } else if (res.type === 'graha') {
                              if (onSelectTarget) onSelectTarget({ type: 'graha', planet: res.title.split(' ')[0] as any });
                            }
                            setActiveTab('selected');
                          }}
                          className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 flex items-center gap-1"
                        >
                          <span>विस्तृत पढ्नुहोस्</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
