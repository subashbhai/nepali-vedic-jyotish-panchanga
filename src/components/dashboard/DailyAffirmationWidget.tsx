import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Heart,
  Sun,
  Flame,
  Wind,
  Award,
  Compass,
  Clock,
  ChevronDown,
  ChevronUp,
  Share2,
  Layers,
  BookOpen,
  Shuffle,
  Quote,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import {
  BirthDetails,
  PanchangaData,
  PlanetPosition,
  VimshottariDashaResult,
  PlanetName
} from '../../types/astrology';
import {
  getDailyVedicAffirmation,
  VedicAffirmation,
  playMeditativeBell,
  VedicShlokaQuote,
  getDailyVedicShloka,
  getRandomVedicShloka,
  UPLIFTING_VEDIC_SHLOKAS
} from '../../utils/vedicAffirmationEngine';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';

interface DailyAffirmationWidgetProps {
  dasha?: VimshottariDashaResult;
  panchanga?: PanchangaData;
  activeProfile?: BirthDetails | null;
  planets?: PlanetPosition[];
  className?: string;
}

const ALL_PLANETS: PlanetName[] = [
  'सूर्य', 'चन्द्र', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'राहु', 'केतु'
];

export const DailyAffirmationWidget: React.FC<DailyAffirmationWidgetProps> = ({
  dasha,
  panchanga,
  activeProfile,
  planets,
  className = ''
}) => {
  // Widget Modes: 'shloka' (Uplifting Vedic Quote & Shloka) vs 'dasha' (Planetary Dasha Sankalpa)
  const [activeTab, setActiveTab] = useState<'shloka' | 'dasha'>('shloka');

  // Vedic Shloka state (initialized deterministically to Shloka of the Day)
  const [currentShloka, setCurrentShloka] = useState<VedicShlokaQuote>(() => getDailyVedicShloka());
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [hasContemplatedToday, setHasContemplatedToday] = useState<boolean>(false);
  const [contemplationStreak, setContemplationStreak] = useState<number>(1);
  const [showShlokaSelector, setShowShlokaSelector] = useState<boolean>(false);

  // Planetary Dasha Affirmation states
  const [selectedPlanetOverride, setSelectedPlanetOverride] = useState<PlanetName | null>(null);
  const [japaCount, setJapaCount] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [showBreathingTip, setShowBreathingTip] = useState<boolean>(false);
  const [showMeaning, setShowMeaning] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Initialize contemplation streak from localStorage
  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const savedDate = localStorage.getItem('balananda_shloka_contemplated_date');
      const savedStreak = parseInt(localStorage.getItem('balananda_shloka_streak') || '1', 10);
      setContemplationStreak(isNaN(savedStreak) || savedStreak < 1 ? 1 : savedStreak);

      if (savedDate === todayStr) {
        setHasContemplatedToday(true);
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Compute primary dasha affirmation
  const defaultDashaAffirmation = useMemo(() => {
    return getDailyVedicAffirmation(dasha, panchanga, activeProfile, planets);
  }, [dasha, panchanga, activeProfile, planets]);

  // If user tapped another planet tab
  const currentDashaAffirmation: VedicAffirmation = useMemo(() => {
    if (!selectedPlanetOverride) return defaultDashaAffirmation;
    const overrideDasha: VimshottariDashaResult = {
      birthMoonDegree: 0,
      balanceAtBirth: { planet: selectedPlanetOverride, yearsLeft: 0, monthsLeft: 0, daysLeft: 0 },
      mahadashas: [{
        planet: selectedPlanetOverride,
        startDate: '',
        endDate: '',
        durationYears: 10,
        isCurrent: true
      }],
      currentMahadasha: {
        planet: selectedPlanetOverride,
        startDate: '',
        endDate: '',
        durationYears: 10,
        isCurrent: true
      }
    };
    return getDailyVedicAffirmation(overrideDasha, panchanga, activeProfile, planets);
  }, [selectedPlanetOverride, defaultDashaAffirmation, panchanga, activeProfile, planets]);

  // Handle Random Uplifting Shloka selection
  const handleNextRandomShloka = () => {
    setIsShuffling(true);
    const nextShloka = getRandomVedicShloka(currentShloka.id);
    setCurrentShloka(nextShloka);
    if (soundEnabled) {
      playMeditativeBell(nextShloka.audioFrequency || 528);
    }
    setTimeout(() => {
      setIsShuffling(false);
    }, 300);
  };

  // Handle Contemplation Check-in
  const handleContemplateToday = () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const newStreak = hasContemplatedToday ? contemplationStreak : contemplationStreak + 1;
      localStorage.setItem('balananda_shloka_contemplated_date', todayStr);
      localStorage.setItem('balananda_shloka_streak', String(newStreak));
      setContemplationStreak(newStreak);
      setHasContemplatedToday(true);
      if (soundEnabled) {
        playMeditativeBell(528);
      }
    } catch {
      setHasContemplatedToday(true);
    }
  };

  // Handle Japa Step for Planetary Mode
  const handleJapaStep = () => {
    const nextCount = japaCount + 1;
    setJapaCount(nextCount);
    if (soundEnabled) {
      playMeditativeBell(528);
    }
  };

  const handleResetJapa = () => {
    setJapaCount(0);
  };

  // Copy Shloka or Dasha Affirmation
  const handleCopyShloka = () => {
    const textToCopy = `✨ दैनिक वैदिक सुभाषित तथा सङ्कल्प ✨\n\nश्लोक:\n${currentShloka.sanskritShloka}\n\nस्रोत: ${currentShloka.source}\nक्षेत्र: ${currentShloka.category}\n\nनेपाली भावार्थ:\n${currentShloka.nepaliMeaning}\n\nआजको सकारात्मक सङ्कल्प (Daily Affirmation):\n"${currentShloka.dailyAffirmationNepali}"\n\n- बालानन्द ज्योतिष तथा वास्तु सेवा`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyDasha = () => {
    const textToCopy = `✨ आजको दैनिक वैदिक संकल्प ✨\n\nमन्त्र: ${currentDashaAffirmation.sanskritMantra}\nअर्थ: ${currentDashaAffirmation.mantraMeaningNepali}\n\nदैनिक सङ्कल्प:\n"${currentDashaAffirmation.positiveAffirmationNepali}"\n\n- बालानन्द ज्योतिष तथा वास्तु सेवा`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Share action via Web Share API
  const handleShareShloka = async () => {
    const shareData = {
      title: 'दैनिक वैदिक सुभाषित तथा सङ्कल्प',
      text: `✨ ${currentShloka.sanskritShloka}\n\nनेपाली भावार्थ: ${currentShloka.nepaliMeaning}\n\nसङ्कल्प: "${currentShloka.dailyAffirmationNepali}"`,
      url: window.location.href
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        handleCopyShloka();
      }
    } else {
      handleCopyShloka();
    }
  };

  const isDashaCompleted = japaCount >= currentDashaAffirmation.recommendedCount;
  const dashaProgressPercent = Math.min(100, Math.round((japaCount / currentDashaAffirmation.recommendedCount) * 100));

  return (
    <div
      id="dashboard-daily-affirmation-card"
      className={`bg-white dark:bg-stone-900 rounded-2xl border border-amber-200/90 dark:border-stone-800 shadow-sm relative overflow-hidden transition-all duration-200 ${className}`}
    >
      {/* Decorative top accent gradient border */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600" />

      <div className="p-5 sm:p-6 space-y-4">
        {/* TOP BAR: Title, Mode Tabs, and Action Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E6E0D5] dark:border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-rose-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700 shadow-2xs">
                  दैनिक वैदिक सङ्कल्प (Daily Affirmation)
                </span>
                {activeTab === 'shloka' ? (
                  <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-amber-600" />
                    <span>{currentShloka.source}</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                    {currentDashaAffirmation.activeDashaSummaryNepali}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold font-serif text-[#1A1A1A] dark:text-stone-100 mt-0.5 flex items-center gap-2">
                <span>
                  {activeTab === 'shloka' ? 'दैनिक वैदिक सुभाषित तथा सङ्कल्प' : currentDashaAffirmation.themeTitleNepali}
                </span>
                {activeTab === 'shloka' && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-amber-50 dark:bg-stone-800 text-amber-800 dark:text-amber-300 font-sans font-medium border border-amber-200 dark:border-stone-700">
                    {currentShloka.category}
                  </span>
                )}
              </h3>
            </div>
          </div>

          {/* Mode Switcher Tabs & Tools */}
          <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
            <div className="bg-stone-100 dark:bg-stone-800 p-0.5 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center">
              <button
                onClick={() => setActiveTab('shloka')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'shloka'
                    ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-300 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>वैदिक सुभाषित</span>
              </button>
              <button
                onClick={() => setActiveTab('dasha')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'dasha'
                    ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-300 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>ग्रह सङ्कल्प (जप)</span>
              </button>
            </div>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1 ${
                soundEnabled
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-400 border-stone-300 dark:border-stone-700'
              }`}
              title={soundEnabled ? 'ध्वनि सक्रिय (Sound On)' : 'ध्वनि बन्द (Sound Off)'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={activeTab === 'shloka' ? handleCopyShloka : handleCopyDasha}
              className="p-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-700 transition cursor-pointer flex items-center gap-1.5"
              title="प्रतिलिपि गर्नुहोस् (Copy)"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline text-[11px]">{copied ? 'प्रतिलिपि भयो!' : 'प्रतिलिपि'}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: UPLIFTING VEDIC SHLOKA & DAILY AFFIRMATION */}
        {activeTab === 'shloka' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Shloka Actions Bar: Random Shloka & Direct Selector */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  id="btn-random-vedic-shloka"
                  onClick={handleNextRandomShloka}
                  disabled={isShuffling}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Shuffle className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
                  <span>नयाँ प्रेरणादायी श्लोक (Random Quote)</span>
                </button>

                <button
                  onClick={() => setShowShlokaSelector(!showShlokaSelector)}
                  className="text-xs text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 transition cursor-pointer flex items-center gap-1"
                >
                  <span>सबै श्लोकहरू ({toDevanagariNumerals(UPLIFTING_VEDIC_SHLOKAS.length)})</span>
                  {showShlokaSelector ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Contemplation Streak Badge */}
              <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-2.5 py-1 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-semibold">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>सङ्कल्प निरन्तरता: {toDevanagariNumerals(contemplationStreak)} दिन</span>
              </div>
            </div>

            {/* Expandable Shloka List Selector */}
            {showShlokaSelector && (
              <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700 space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
                <div className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  प्रेरणादायी वैदिक सुभाषित सङ्ग्रह (Choose Any Shloka):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {UPLIFTING_VEDIC_SHLOKAS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentShloka(item);
                        setShowShlokaSelector(false);
                        if (soundEnabled) {
                          playMeditativeBell(item.audioFrequency || 528);
                        }
                      }}
                      className={`text-left p-2 rounded-lg text-xs transition cursor-pointer border flex flex-col ${
                        currentShloka.id === item.id
                          ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 text-amber-900 dark:text-amber-200 font-bold'
                          : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 hover:bg-amber-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <span className="font-serif truncate">{item.sanskritShloka}</span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                        {item.source} • {item.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sacred Shloka Display Card */}
            <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-stone-50 dark:from-stone-850 dark:via-stone-900 dark:to-stone-900 border border-amber-300/80 dark:border-stone-700/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs relative overflow-hidden">
              
              {/* Sacred Sanskrit Shloka Box */}
              <div className="space-y-2.5 text-center">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider bg-amber-100/90 dark:bg-amber-950/70 px-3.5 py-1 rounded-full border border-amber-300/80 dark:border-amber-700 shadow-2xs">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span>पवित्र वैदिक श्लोक • {currentShloka.source}</span>
                </div>

                <div className="relative py-2 px-4 max-w-2xl mx-auto">
                  <Quote className="w-8 h-8 text-amber-300 dark:text-stone-700 absolute -top-1 -left-1 rotate-180 opacity-60" />
                  <blockquote className="text-xl sm:text-2xl md:text-3xl font-bold font-serif text-[#7A1C1C] dark:text-amber-300 leading-relaxed select-all tracking-wide">
                    {currentShloka.sanskritShloka}
                  </blockquote>
                  <Quote className="w-8 h-8 text-amber-300 dark:text-stone-700 absolute -bottom-1 -right-1 opacity-60" />
                </div>
              </div>

              <div className="w-full border-t border-amber-200/70 dark:border-stone-700/70" />

              {/* Nepali Translation (भावार्थ) */}
              <div className="space-y-1.5 bg-white/80 dark:bg-stone-950/50 p-4 rounded-xl border border-amber-200/60 dark:border-stone-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>नेपाली भावार्थ (Translation):</span>
                </div>
                <p className="text-sm sm:text-base text-stone-800 dark:text-stone-200 leading-relaxed font-serif">
                  {currentShloka.nepaliMeaning}
                </p>
              </div>

              {/* Daily Uplifting Positive Affirmation */}
              <div className="space-y-1.5 bg-gradient-to-r from-amber-100/70 via-orange-100/50 to-amber-50/70 dark:from-stone-800 dark:via-stone-800/80 dark:to-stone-850 p-4 rounded-xl border-l-4 border-amber-600 shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 dark:text-amber-200">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                    <span>आजको सकारात्मक जीवन-सङ्कल्प (Daily Affirmation):</span>
                  </div>
                  <span className="text-[10px] font-semibold text-stone-500 dark:text-stone-400 bg-white/70 dark:bg-stone-900/60 px-2 py-0.5 rounded-md border border-stone-200/60 dark:border-stone-700">
                    {currentShloka.category}
                  </span>
                </div>
                <blockquote className="text-sm sm:text-base font-serif font-semibold text-[#1A1A1A] dark:text-stone-100 leading-relaxed italic">
                  "{currentShloka.dailyAffirmationNepali}"
                </blockquote>
              </div>

              {/* Practical Guidance / Mindful Practice Tip */}
              {currentShloka.idealPracticeNepali && (
                <div className="text-xs text-stone-600 dark:text-stone-400 flex items-start gap-2 bg-stone-50 dark:bg-stone-800/40 p-3 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <span>
                    <strong>उत्तम अभ्यास:</strong> {currentShloka.idealPracticeNepali}
                  </span>
                </div>
              )}

              {/* BOTTOM ACTIONS BAR: Contemplate Check-in, Listen Sound, Share */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <button
                  id="btn-affirmation-contemplated"
                  onClick={handleContemplateToday}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                    hasContemplatedToday
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-stone-800 hover:bg-stone-900 dark:bg-stone-700 dark:hover:bg-stone-600 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>
                    {hasContemplatedToday
                      ? `✓ आजको सङ्कल्प मनन भयो (निरन्तरता: ${toDevanagariNumerals(contemplationStreak)} दिन)`
                      : 'आजको सङ्कल्प मनन गरेँ (+१ दिन)'}
                  </span>
                </button>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => playMeditativeBell(currentShloka.audioFrequency || 528)}
                    className="p-2.5 bg-white hover:bg-amber-50 dark:bg-stone-800 dark:hover:bg-stone-700 text-amber-800 dark:text-amber-300 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-700 transition cursor-pointer flex items-center gap-1.5"
                    title="पवित्र ध्यान घण्टी बजाउनुहोस् (528Hz Sacred Chime)"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>ध्यान ध्वनि</span>
                  </button>

                  <button
                    onClick={handleShareShloka}
                    className="p-2.5 bg-white hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-700 transition cursor-pointer flex items-center gap-1.5"
                    title="सामाजिक सञ्जाल वा साथीहरूलाई सेयर गर्नुहोस्"
                  >
                    <Share2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>सेयर</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PLANETARY DASHA JAPA & SANKALPA */}
        {activeTab === 'dasha' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* PLANET QUICK SELECTOR TABS */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 whitespace-nowrap mr-1 flex items-center gap-1">
                <Layers className="w-3 h-3 text-amber-500" />
                <span>ग्रह सङ्कल्प:</span>
              </span>
              <button
                onClick={() => setSelectedPlanetOverride(null)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedPlanetOverride === null
                    ? 'bg-[#D97706] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                }`}
              >
                ★ दशा अनुसार ({defaultDashaAffirmation.rulingPlanet})
              </button>
              {ALL_PLANETS.map((pl) => {
                const isSelected = selectedPlanetOverride === pl;
                return (
                  <button
                    key={pl}
                    onClick={() => setSelectedPlanetOverride(pl)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-700 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    {pl}
                  </button>
                );
              })}
            </div>

            {/* MANTRA & SANKALPA HERO CARD */}
            <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-stone-50 dark:from-stone-850 dark:via-stone-900 dark:to-stone-900 border border-amber-300/80 dark:border-stone-700/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs relative overflow-hidden">
              
              {/* Authentic Graha Jap Shloka (पौराणिक नवग्रह स्तोत्र) */}
              {currentDashaAffirmation.grahaJapShloka && (
                <div className="bg-white/90 dark:bg-stone-950/70 border border-amber-200 dark:border-stone-800 rounded-xl p-4 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                      <Flame className="w-3.5 h-3.5 text-amber-600" />
                      <span>पौराणिक ग्रह जप श्लोक ({currentDashaAffirmation.rulingPlanet} - वेदव्यास विरचित)</span>
                    </div>
                    {currentDashaAffirmation.totalJapaTargetNepali && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/60">
                        कुल लक्ष्य: {currentDashaAffirmation.totalJapaTargetNepali}
                      </span>
                    )}
                  </div>

                  <div className="text-lg sm:text-xl font-extrabold font-serif text-[#7A1C1C] dark:text-amber-300 py-1 text-center select-all tracking-wide">
                    {currentDashaAffirmation.grahaJapShloka}
                  </div>

                  {currentDashaAffirmation.grahaJapShlokaMeaningNepali && (
                    <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-serif bg-amber-50/60 dark:bg-stone-900/50 p-2.5 rounded-lg border border-amber-200/50 dark:border-stone-800">
                      <strong>भावार्थ:</strong> {currentDashaAffirmation.grahaJapShlokaMeaningNepali}
                    </p>
                  )}
                </div>
              )}

              {/* Tantrik Beej Mantra & Gayatri Mantra */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentDashaAffirmation.beejMantra && (
                  <div className="bg-white/80 dark:bg-stone-950/50 p-3 rounded-xl border border-amber-200/60 dark:border-stone-800 space-y-1">
                    <div className="text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>तान्त्रिक बीज मन्त्र (Tantrik Beej Mantra):</span>
                    </div>
                    <div className="font-serif font-bold text-sm text-[#7A1C1C] dark:text-amber-300">
                      {currentDashaAffirmation.beejMantra}
                    </div>
                  </div>
                )}

                {currentDashaAffirmation.gayatriMantra && (
                  <div className="bg-white/80 dark:bg-stone-950/50 p-3 rounded-xl border border-amber-200/60 dark:border-stone-800 space-y-1">
                    <div className="text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-600" />
                      <span>ग्रह गायत्री मन्त्र (Graha Gayatri):</span>
                    </div>
                    <div className="font-serif font-bold text-xs sm:text-[13px] text-[#7A1C1C] dark:text-amber-300">
                      {currentDashaAffirmation.gayatriMantra}
                    </div>
                  </div>
                )}
              </div>

              {/* Sacred Daily Mantra Box */}
              <div className="space-y-2 text-center bg-white/60 dark:bg-stone-950/40 p-3.5 rounded-xl border border-amber-200/50 dark:border-stone-800">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-widest bg-amber-100/80 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-300/60 dark:border-amber-700">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span>दैनिक नाम मन्त्र ({currentDashaAffirmation.rulingPlanet})</span>
                </div>

                <div className="text-xl sm:text-2xl font-extrabold font-serif text-[#7A1C1C] dark:text-amber-300 py-1 select-all tracking-wide">
                  {currentDashaAffirmation.sanskritMantra}
                </div>

                {showMeaning && (
                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 italic font-serif max-w-xl mx-auto">
                    अर्थ: "{currentDashaAffirmation.mantraMeaningNepali}"
                  </p>
                )}
              </div>

              <div className="w-full border-t border-amber-200/60 dark:border-stone-700/60" />

              {/* Daily Positive Sankalpa (Affirmation) */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                  <span>आजको सकारात्मक संकल्प (Daily Affirmation):</span>
                </div>
                
                <blockquote className="text-sm sm:text-base font-serif font-semibold text-[#1A1A1A] dark:text-stone-100 bg-white/90 dark:bg-stone-950/60 border-l-4 border-amber-500 rounded-r-xl p-3.5 sm:p-4 shadow-2xs leading-relaxed">
                  "{currentDashaAffirmation.positiveAffirmationNepali}"
                </blockquote>
              </div>

              {/* Dasha Shanti Upaya / Astrological Remedy */}
              {currentDashaAffirmation.dashaRemedyNepali && (
                <div className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed font-sans bg-amber-100/60 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-300/60 dark:border-amber-800 flex items-start gap-2">
                  <Award className="w-4 h-4 text-amber-700 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <strong>दशा अनुकूलन तथा शान्ति उपाय (Remedy):</strong> {currentDashaAffirmation.dashaRemedyNepali}
                  </div>
                </div>
              )}

              {/* Astrological Rationale */}
              <div className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-sans bg-stone-100/60 dark:bg-stone-800/40 p-3 rounded-xl border border-stone-200 dark:border-stone-700 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span>{currentDashaAffirmation.astrologicalContextNepali}</span>
              </div>

              {/* Quick Practice Metadata Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                <div className="bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">उत्तम समय</div>
                    <div className="font-bold text-stone-800 dark:text-stone-200 text-[11px] truncate">
                      {currentDashaAffirmation.idealTimeOfDayNepali}
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">अनुशंसित दिशा</div>
                    <div className="font-bold text-stone-800 dark:text-stone-200 text-[11px] truncate">
                      {currentDashaAffirmation.recommendedDirectionNepali}
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center gap-2">
                  <Award className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">संकल्प क्षेत्र</div>
                    <div className="font-bold text-stone-800 dark:text-stone-200 text-[11px] truncate">
                      {currentDashaAffirmation.categoryNepali}
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">तत्व</div>
                    <div className="font-bold text-stone-800 dark:text-stone-200 text-[11px] truncate">
                      {currentDashaAffirmation.elementNepali}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* INTERACTIVE JAPA COUNTER & MINDFUL BREATHING SECTION */}
            <div className="bg-stone-50 dark:bg-stone-800/60 border border-[#E6E0D5] dark:border-stone-700 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>डिजिटल जप तथा सङ्कल्प ट्र्याकर (Interactive Japa Counter)</span>
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    मन्त्र उच्चारण गर्दा प्रत्येक पटक थिच्नुहोस्। लक्ष्य: <strong>{currentDashaAffirmation.recommendedCountNepali}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-2xl font-extrabold font-serif text-[#D97706] dark:text-amber-400">
                      {toDevanagariNumerals(japaCount)}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400 ml-1">
                      / {toDevanagariNumerals(currentDashaAffirmation.recommendedCount)}
                    </span>
                  </div>

                  {japaCount > 0 && (
                    <button
                      onClick={handleResetJapa}
                      className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition cursor-pointer"
                      title="पुनः गणना सुरु गर्नुहोस् (Reset Counter)"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-stone-200 dark:bg-stone-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${dashaProgressPercent}%` }}
                />
              </div>

              {/* Interactive Chant Button */}
              <div className="flex flex-col sm:flex-row items-center gap-3 justify-between pt-1">
                <button
                  onClick={handleJapaStep}
                  className={`w-full sm:w-auto flex-1 py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-md transition-all transform active:scale-95 cursor-pointer ${
                    isDashaCompleted
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white'
                      : 'bg-gradient-to-r from-amber-600 via-amber-700 to-red-700 hover:from-amber-500 hover:to-red-600 text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4 animate-bounce" />
                  <span>
                    {isDashaCompleted
                      ? `✨ संकल्प पूर्ण भयो (${toDevanagariNumerals(japaCount)} पटक जप सम्पन्न) - थप जप गर्नुहोस्`
                      : `मन्त्र जप गर्नुहोस् (+१ गणना)`}
                  </span>
                </button>

                <button
                  onClick={() => setShowBreathingTip(!showBreathingTip)}
                  className="text-xs text-stone-600 dark:text-stone-300 hover:text-[#D97706] font-medium flex items-center gap-1 py-2 px-3 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700/50 transition cursor-pointer shrink-0"
                >
                  <Wind className="w-3.5 h-3.5 text-teal-500" />
                  <span>{showBreathingTip ? 'ध्यान विधि लुकाउनुहोस्' : 'ध्यान तथा श्वास विधि हेर्नुहोस्'}</span>
                  {showBreathingTip ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Expandable Mindful Breathing Guideline */}
              {showBreathingTip && (
                <div className="bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/50 rounded-xl p-3.5 text-xs text-teal-950 dark:text-teal-200 space-y-1.5 animate-in fade-in">
                  <div className="font-bold flex items-center gap-1.5 text-teal-800 dark:text-teal-300">
                    <Wind className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>वैदिक ध्यान तथा श्वास नियन्त्रण विधि:</span>
                  </div>
                  <p className="leading-relaxed font-sans">
                    {currentDashaAffirmation.mindfulBreathingTipNepali}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
