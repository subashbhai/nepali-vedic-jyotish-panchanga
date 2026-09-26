import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Shuffle,
  Quote,
  BookOpen,
  Heart,
  Flame,
  ChevronDown,
  ChevronUp,
  Share2
} from 'lucide-react';
import {
  VedicShlokaQuote,
  UPLIFTING_VEDIC_SHLOKAS,
  getDailyVedicShloka,
  getRandomVedicShloka,
  playMeditativeBell
} from '../utils/vedicAffirmationEngine';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';

interface DailyVedicAffirmationProps {
  className?: string;
  onNavigateToShlokas?: () => void;
}

export const DailyVedicAffirmation: React.FC<DailyVedicAffirmationProps> = ({
  className = '',
  onNavigateToShlokas
}) => {
  // Current Sanskrit shloka with Nepali translation and affirmation
  const [currentShloka, setCurrentShloka] = useState<VedicShlokaQuote>(() => getDailyVedicShloka());
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [showShlokaSelector, setShowShlokaSelector] = useState<boolean>(false);
  const [hasContemplatedToday, setHasContemplatedToday] = useState<boolean>(false);
  const [contemplationStreak, setContemplationStreak] = useState<number>(1);

  // Initialize streak & contemplation status from localStorage
  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const savedDate = localStorage.getItem('balananda_daily_shloka_contemplated_date');
      const savedStreak = parseInt(localStorage.getItem('balananda_daily_shloka_streak') || '1', 10);
      setContemplationStreak(isNaN(savedStreak) || savedStreak < 1 ? 1 : savedStreak);

      if (savedDate === todayStr) {
        setHasContemplatedToday(true);
      }
    } catch {
      // Safe fallback if local storage is restricted
    }
  }, []);

  // Pick a random uplifting Vedic shloka
  const handleNextRandomShloka = useCallback(() => {
    setIsShuffling(true);
    const next = getRandomVedicShloka(currentShloka.id);
    setCurrentShloka(next);
    if (soundEnabled) {
      playMeditativeBell(next.audioFrequency || 528);
    }
    setTimeout(() => {
      setIsShuffling(false);
    }, 280);
  }, [currentShloka.id, soundEnabled]);

  // Copy Shloka & Translation to clipboard
  const handleCopyShloka = () => {
    const textToCopy = `✨ दैनिक वैदिक सुभाषित तथा सङ्कल्प ✨\n\nश्लोक:\n${currentShloka.sanskritShloka}\n\nस्रोत: ${currentShloka.source}\nक्षेत्र: ${currentShloka.category}\n\nनेपाली भावार्थ:\n${currentShloka.nepaliMeaning}\n\nआजको सकारात्मक सङ्कल्प (Daily Affirmation):\n"${currentShloka.dailyAffirmationNepali}"\n\n- बालानन्द ज्योतिष तथा वास्तु सेवा`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Web Share or Clipboard
  const handleShare = async () => {
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

  // User completes contemplation check-in for the day
  const handleContemplateToday = () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const newStreak = hasContemplatedToday ? contemplationStreak : contemplationStreak + 1;
      localStorage.setItem('balananda_daily_shloka_contemplated_date', todayStr);
      localStorage.setItem('balananda_daily_shloka_streak', String(newStreak));
      setContemplationStreak(newStreak);
      setHasContemplatedToday(true);
      if (soundEnabled) {
        playMeditativeBell(528);
      }
    } catch {
      setHasContemplatedToday(true);
    }
  };

  return (
    <div
      id="daily-vedic-affirmation-widget"
      data-testid="daily-vedic-affirmation-widget"
      className={`bg-white dark:bg-stone-900 rounded-2xl border border-amber-300/80 dark:border-stone-800 shadow-sm relative overflow-hidden transition-all duration-200 ${className}`}
    >
      {/* Decorative top sacred saffron-gold accent strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600" />

      <div className="p-5 sm:p-6 space-y-4">
        {/* Header: Title, Category Badge, and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E0D5] dark:border-stone-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-rose-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700 shadow-2xs">
                  दैनिक वैदिक सुभाषित (Daily Vedic Affirmation)
                </span>
                <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-amber-600" />
                  <span>{currentShloka.source}</span>
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-serif text-[#1A1A1A] dark:text-stone-100 mt-0.5 flex items-center gap-2">
                <span>प्रेरणादायी संस्कृत श्लोक तथा नेपाली भावार्थ</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-amber-50 dark:bg-stone-800 text-amber-800 dark:text-amber-300 font-sans font-semibold border border-amber-200 dark:border-stone-700">
                  {currentShloka.category}
                </span>
              </h3>
            </div>
          </div>

          {/* Action buttons: Sound, Copy, Share, Random */}
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {/* Random Shloka Generator Button */}
            <button
              id="btn-random-shloka"
              onClick={handleNextRandomShloka}
              disabled={isShuffling}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-75"
              title="अर्को नयाँ प्रेरणादायी श्लोक छान्नुहोस् (Random Sanskrit Shloka)"
            >
              <Shuffle className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
              <span>नयाँ श्लोक (Random)</span>
            </button>

            {/* Shloka Selector Toggle */}
            <button
              onClick={() => setShowShlokaSelector(!showShlokaSelector)}
              className="text-xs text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 transition cursor-pointer flex items-center gap-1"
              title="सबै श्लोकहरूको सूची हेर्नुहोस्"
            >
              <span>सूची ({toDevanagariNumerals(UPLIFTING_VEDIC_SHLOKAS.length)})</span>
              {showShlokaSelector ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Meditative Tone Bell Sound Toggle */}
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playMeditativeBell(currentShloka.audioFrequency || 528);
              }}
              className={`p-2 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1 ${
                soundEnabled
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-400 border-stone-300 dark:border-stone-700'
              }`}
              title={soundEnabled ? 'वैदिक ध्वनि सक्रिय (Sound On)' : 'ध्वनि बन्द (Sound Off)'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-stone-400" />}
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopyShloka}
              className="p-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-700 transition cursor-pointer flex items-center gap-1.5"
              title="श्लोक तथा अर्थ प्रतिलिपि गर्नुहोस् (Copy)"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline text-[11px]">{copied ? 'भयो!' : 'प्रतिलिपि'}</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-700 transition cursor-pointer"
              title="सेयर गर्नुहोस्"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expandable Shloka Quick Selector Grid */}
        {showShlokaSelector && (
          <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700 space-y-2 max-h-52 overflow-y-auto scrollbar-thin animate-in fade-in duration-150">
            <div className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              वैदिक सुभाषित सङ्ग्रहबाट छान्नुहोस्:
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
                  className={`text-left p-2.5 rounded-lg text-xs transition cursor-pointer border flex flex-col ${
                    currentShloka.id === item.id
                      ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 text-amber-900 dark:text-amber-200 font-bold'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 hover:bg-amber-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <span className="font-serif truncate font-medium">{item.sanskritShloka}</span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                    {item.source} • {item.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sacred Sanskrit Shloka Hero Card */}
        <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-stone-50 dark:from-stone-850 dark:via-stone-900 dark:to-stone-900 border border-amber-300/80 dark:border-stone-700/80 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs relative overflow-hidden">
          {/* Sanskrit Shloka Block */}
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
          <div className="space-y-1.5 bg-white/85 dark:bg-stone-950/60 p-4 rounded-xl border border-amber-200/60 dark:border-stone-800 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>नेपाली भावार्थ (Nepali Translation):</span>
            </div>
            <p className="text-sm sm:text-base text-stone-800 dark:text-stone-200 leading-relaxed font-serif">
              {currentShloka.nepaliMeaning}
            </p>
          </div>

          {/* Daily Positive Affirmation / Sankalpa */}
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

          {/* Bottom Actions Bar: Contemplate Check-in & Streak */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <button
              id="btn-affirmation-contemplated"
              onClick={handleContemplateToday}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                hasContemplatedToday
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-stone-800 hover:bg-stone-900 dark:bg-stone-700 dark:hover:bg-stone-600 text-white'
              }`}
            >
              {hasContemplatedToday ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>आजको सङ्कल्प मनन सम्पन्न भयो</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 text-rose-300" />
                  <span>मैले आज यो सङ्कल्प मनन गरेँ (Check-in)</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-3">
              {/* Contemplation Streak Badge */}
              <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-3 py-1.5 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-semibold">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>सङ्कल्प निरन्तरता: {toDevanagariNumerals(contemplationStreak)} दिन</span>
              </div>

              {onNavigateToShlokas && (
                <button
                  onClick={onNavigateToShlokas}
                  className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-bold"
                >
                  श्लोक सङ्ग्रह →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
