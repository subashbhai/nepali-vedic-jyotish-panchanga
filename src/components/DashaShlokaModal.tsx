import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Award,
  ShieldCheck,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  X,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Layers,
  Calendar,
  Compass,
  ArrowRight,
  Info
} from 'lucide-react';
import { PlanetName } from '../types/astrology';
import {
  BPHSClassicalShloka,
  BPHSDashaShloka,
  BPHSAntardashaShloka,
  getBPHSDashaShloka,
  getBPHSAntardashaShloka,
  getBPHSShlokaForPlanet
} from '../utils/brihatParasharaDatabase';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';

export interface DashaShlokaModalData {
  level: 'mahadasha' | 'antardasha' | 'pratyantardasha' | 'sukshmadasha' | 'pranadasha';
  planet: PlanetName;
  subPlanet?: PlanetName;
  pratyantarPlanet?: PlanetName;
  startDateBS?: string;
  endDateBS?: string;
  durationFormattedNepali?: string;
  isCurrentActive?: boolean;
}

interface DashaShlokaModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DashaShlokaModalData | null;
}

export const DashaShlokaModal: React.FC<DashaShlokaModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  const [activeTab, setActiveTab] = useState<'verse' | 'meaning' | 'synergy' | 'remedy'>('verse');
  const [selectedPlanetLevel, setSelectedPlanetLevel] = useState<'main' | 'sub' | 'swaroopa'>('main');
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen, onClose]);

  // Reset tab when modal data changes
  useEffect(() => {
    setActiveTab('verse');
    setSelectedPlanetLevel(data?.subPlanet ? 'sub' : 'main');
    setIsPlayingAudio(false);
  }, [data]);

  if (!isOpen || !data) return null;

  const {
    level,
    planet,
    subPlanet,
    pratyantarPlanet,
    startDateBS,
    endDateBS,
    durationFormattedNepali,
    isCurrentActive
  } = data;

  // Retrieve classical Parashara records
  const mahadashaData: BPHSDashaShloka | undefined = getBPHSDashaShloka(planet);
  const antardashaData: BPHSAntardashaShloka | undefined = subPlanet
    ? getBPHSAntardashaShloka(planet, subPlanet)
    : undefined;

  const currentViewPlanet =
    selectedPlanetLevel === 'sub' && subPlanet
      ? subPlanet
      : selectedPlanetLevel === 'swaroopa'
      ? subPlanet || planet
      : planet;

  const swaroopaData: BPHSClassicalShloka | undefined = getBPHSShlokaForPlanet(currentViewPlanet);

  // Level name in Nepali
  const levelLabels: Record<string, string> = {
    mahadasha: '१. महादशा (MD)',
    antardasha: '२. अन्तरदशा (AD)',
    pratyantardasha: '३. प्रत्यन्तरदशा (PD)',
    sukshmadasha: '४. सूक्ष्मदशा (SD)',
    pranadasha: '५. प्राणदशा (PranD)'
  };

  // Determine current display Sanskrit verse and details based on active toggles
  let currentVerse = '';
  let currentSource = '';
  let currentWordMeaning = '';
  let currentGeneralMeaning = '';
  let currentRemedy = '';

  if (selectedPlanetLevel === 'sub' && antardashaData) {
    currentVerse = antardashaData.sanskritVerse;
    currentSource = antardashaData.sourceChapter;
    currentWordMeaning = antardashaData.wordBreakdownNepali;
    currentGeneralMeaning = antardashaData.detailedMeaningNepali;
    currentRemedy = antardashaData.remedyNepali;
  } else if (selectedPlanetLevel === 'swaroopa' && swaroopaData) {
    currentVerse = swaroopaData.sanskritVerse;
    currentSource = swaroopaData.sourceChapterNepali;
    currentWordMeaning = swaroopaData.wordMeaningNepali;
    currentGeneralMeaning = swaroopaData.detailedMeaningNepali;
    currentRemedy = swaroopaData.classicalRemedyNepali;
  } else if (mahadashaData) {
    currentVerse = mahadashaData.sanskritVerse;
    currentSource = mahadashaData.sourceChapter;
    currentWordMeaning = mahadashaData.wordBreakdownNepali;
    currentGeneralMeaning = mahadashaData.generalMeaningNepali;
    currentRemedy = mahadashaData.classicalRemedyNepali;
  } else if (swaroopaData) {
    currentVerse = swaroopaData.sanskritVerse;
    currentSource = swaroopaData.sourceChapterNepali;
    currentWordMeaning = swaroopaData.wordMeaningNepali;
    currentGeneralMeaning = swaroopaData.detailedMeaningNepali;
    currentRemedy = swaroopaData.classicalRemedyNepali;
  }

  // Copy Shloka Text Handler
  const handleCopyShloka = () => {
    const textToCopy = `॥ ${currentSource} ॥\n\n${currentVerse}\n\n[शब्दार्थ]:\n${currentWordMeaning}\n\n[नेपाली भावार्थ]:\n${currentGeneralMeaning}\n\n[शान्ति उपाय]:\n${currentRemedy}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // Sanskrit Audio Recitation using Web Speech API
  const handleToggleAudio = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(currentVerse);
    utterance.rate = 0.82;
    utterance.pitch = 1.05;
    utterance.lang = 'sa-IN'; // Sanskrit/Hindi voice
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      id="dasha-shloka-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="dasha-shloka-modal-container"
        className="relative w-full max-w-3xl max-h-[90vh] bg-gradient-to-b from-stone-950 via-amber-950/95 to-stone-950 rounded-2xl border-2 border-amber-500/50 shadow-2xl shadow-amber-950/70 flex flex-col overflow-hidden text-amber-50 animate-in zoom-in-95 duration-200"
      >
        {/* Modal Top Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 border-b border-amber-800/60 bg-amber-950/60 relative">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 font-bold rounded-2xl shadow-lg shadow-amber-500/20 border border-amber-300 flex items-center justify-center min-w-12 h-12">
              <span className="text-xl font-serif">
                {subPlanet ? `${planet.slice(0, 1)}/${subPlanet.slice(0, 1)}` : planet.slice(0, 2)}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {levelLabels[level] || 'दशा प्रमाण'}
                </span>
                {isCurrentActive && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    वर्तमान सक्रिय दशा
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-bold font-serif text-amber-200 flex items-center gap-2">
                <span>{planet} महादशा</span>
                {subPlanet && (
                  <>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300 font-bold">{subPlanet} अन्तरदशा</span>
                  </>
                )}
                {pratyantarPlanet && (
                  <>
                    <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-cyan-300 text-sm font-semibold">{pratyantarPlanet} प्रत्यन्तर</span>
                  </>
                )}
              </h2>

              {(startDateBS || durationFormattedNepali) && (
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-stone-300 mt-1">
                  {startDateBS && endDateBS && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      वि.सं. {startDateBS} देखि {endDateBS}
                    </span>
                  )}
                  {durationFormattedNepali && (
                    <span className="text-amber-400 font-medium">
                      (अवधि: {durationFormattedNepali})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Sanskrit Recitation Audio Toggle Button */}
            <button
              id="dasha-modal-audio-btn"
              onClick={handleToggleAudio}
              className={`p-2 rounded-xl border transition-all flex items-center gap-1 text-xs font-semibold ${
                isPlayingAudio
                  ? 'bg-rose-500/20 border-rose-400 text-rose-300 animate-pulse'
                  : 'bg-amber-900/40 border-amber-700/60 text-amber-300 hover:bg-amber-800/60'
              }`}
              title={isPlayingAudio ? 'वाचन रोक्नुहोस्' : 'संस्कृत श्लोक वाचन सुन्नुहोस्'}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span className="hidden sm:inline">रोक्नुहोस्</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span className="hidden sm:inline">श्लोक पाठ</span>
                </>
              )}
            </button>

            {/* Copy Shloka Text Button */}
            <button
              id="dasha-modal-copy-btn"
              onClick={handleCopyShloka}
              className="p-2 rounded-xl bg-amber-900/40 border border-amber-700/60 text-amber-300 hover:bg-amber-800/60 transition-all flex items-center gap-1 text-xs font-semibold"
              title="श्लोक तथा व्याख्या प्रतिलिपि (Copy) गर्नुहोस्"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 hidden sm:inline">कपि भयो</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">प्रतिलिपि</span>
                </>
              )}
            </button>

            {/* Close Modal Button */}
            <button
              id="dasha-modal-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-900/80 border border-stone-700 text-stone-400 hover:text-white hover:bg-stone-800 transition-all"
              title="बन्द गर्नुहोस् (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-level Target Selector Tabs (Mahadasha / Antardasha / Planet Swaroopa) */}
        {subPlanet && (
          <div className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-amber-950/80 border-b border-amber-900/60 text-xs overflow-x-auto">
            <span className="text-stone-400 font-medium whitespace-nowrap">प्रमाण स्तर:</span>
            <button
              onClick={() => setSelectedPlanetLevel('sub')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
                selectedPlanetLevel === 'sub'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'bg-stone-900/60 border border-amber-900/40 text-amber-300 hover:bg-stone-800'
              }`}
            >
              📖 {planet}–{subPlanet} अन्तरदशा श्लोक
            </button>
            <button
              onClick={() => setSelectedPlanetLevel('main')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
                selectedPlanetLevel === 'main'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'bg-stone-900/60 border border-amber-900/40 text-amber-300 hover:bg-stone-800'
              }`}
            >
              ☀️ {planet} महादशा मूल श्लोक
            </button>
            <button
              onClick={() => setSelectedPlanetLevel('swaroopa')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
                selectedPlanetLevel === 'swaroopa'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'bg-stone-900/60 border border-amber-900/40 text-amber-300 hover:bg-stone-800'
              }`}
            >
              ✨ {subPlanet} ग्रहस्वरूप श्लोक
            </button>
          </div>
        )}

        {/* Navigation Content Tabs */}
        <div className="flex items-center justify-between px-4 sm:px-5 border-b border-amber-900/60 bg-stone-950/90 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2 py-2">
            <button
              id="dasha-modal-tab-verse"
              onClick={() => setActiveTab('verse')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'verse'
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-sm'
                  : 'text-stone-400 hover:text-amber-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>संस्कृत प्रमाण श्लोक</span>
            </button>

            <button
              id="dasha-modal-tab-meaning"
              onClick={() => setActiveTab('meaning')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'meaning'
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-sm'
                  : 'text-stone-400 hover:text-amber-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>नेपाली व्याख्या एवं फलादेश</span>
            </button>

            <button
              id="dasha-modal-tab-synergy"
              onClick={() => setActiveTab('synergy')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'synergy'
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-sm'
                  : 'text-stone-400 hover:text-amber-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>ज्योतिषीय सूत्र एवं सम्बन्ध</span>
            </button>

            <button
              id="dasha-modal-tab-remedy"
              onClick={() => setActiveTab('remedy')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'remedy'
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 shadow-sm'
                  : 'text-stone-400 hover:text-amber-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>पाराशर शान्ति विधान</span>
            </button>
          </div>
        </div>

        {/* Modal Main Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar text-stone-200">
          {/* TAB 1: SANSKRIT SHLOKA & WORD-BY-WORD BREAKDOWN */}
          {activeTab === 'verse' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Sanskrit Verse Box */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-950/80 via-stone-900/90 to-amber-950/80 border-2 border-amber-500/40 shadow-inner relative group">
                <div className="flex items-center justify-between border-b border-amber-800/50 pb-2.5 mb-4">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    बृहत्पाराशर होराशास्त्रम् मूल श्लोक
                  </span>
                  <span className="text-[11px] text-amber-300/80 font-mono bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                    {currentSource}
                  </span>
                </div>

                <p className="text-base sm:text-lg font-serif font-semibold text-amber-100 leading-relaxed sm:leading-loose whitespace-pre-line text-center tracking-wide drop-shadow">
                  {currentVerse}
                </p>

                <div className="mt-4 pt-3 border-t border-amber-900/60 flex items-center justify-between text-[11px] text-amber-400/80">
                  <span>॥ महर्षि पराशर विरचित विंशोत्तरी दशाफलम् ॥</span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    प्रमाणित शास्त्रीय श्लोक
                  </span>
                </div>
              </div>

              {/* Word-by-word Breakdown (पदच्छेद एवं शब्दार्थ) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/70 border border-amber-800/40 space-y-2.5">
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  पदच्छेद एवं शब्दार्थ (Word-by-word Sanskrit Meaning)
                </h3>
                <p className="text-sm text-stone-300 leading-relaxed font-sans bg-stone-950/60 p-3 rounded-xl border border-stone-800">
                  {currentWordMeaning || 'महर्षि पराशरले दशानाथको शुभ तथा अशुभ स्थितिका आधारमा प्राप्त हुने फलको स्पष्ट व्याख्या गर्नुभएको छ।'}
                </p>
              </div>

              {/* Quick Summary Card */}
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/40 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-stone-300 space-y-1">
                  <p className="font-semibold text-amber-200">
                    पाराशर सिद्धान्त सारांश:
                  </p>
                  <p className="leading-relaxed">
                    {currentGeneralMeaning}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED NEPALI MEANING & DIGNITY EFFECTS */}
          {activeTab === 'meaning' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Comprehensive Nepali Interpretation */}
              <div className="p-5 rounded-2xl bg-stone-900/80 border border-amber-800/50 space-y-3 shadow-md">
                <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  विस्तृत नेपाली भावार्थ एवं फलादेश
                </h3>
                <p className="text-sm sm:text-base text-stone-200 leading-relaxed font-sans">
                  {currentGeneralMeaning}
                </p>
              </div>

              {/* Favorable vs Afflicted Condition Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Positive/Exalted state */}
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/30 border border-emerald-600/40 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wide">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>उच्च, स्वक्षेत्री वा शुभ दृष्टि हुँदाका फल</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                    {selectedPlanetLevel === 'sub' && antardashaData
                      ? antardashaData.favorableEffectsNepali
                      : mahadashaData
                      ? mahadashaData.exaltedOrBeneficEffectNepali
                      : swaroopaData?.practicalEffectsNepali || 'उच्च सफलता, पदोन्नति र सुख-समृद्धि।'}
                  </p>
                </div>

                {/* Negative/Afflicted state */}
                <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/30 border border-rose-600/40 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wide">
                    <AlertTriangle className="w-4 h-4" />
                    <span>नीच, अस्त वा पापी प्रभाव हुँदाका फल</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                    {selectedPlanetLevel === 'sub' && antardashaData
                      ? antardashaData.unfavorableEffectsNepali
                      : mahadashaData
                      ? mahadashaData.debilitatedOrAfflictedEffectNepali
                      : 'अवरोध, स्वास्थ्य कष्ट वा आर्थिक उतारचढाव हुन सक्ने भएकाले शास्त्रीय उपाय अवलम्बन गर्नु उचित हुन्छ।'}
                  </p>
                </div>
              </div>

              {/* Practical Effects in Everyday Life */}
              {swaroopaData?.practicalEffectsNepali && (
                <div className="p-4 rounded-2xl bg-stone-900/60 border border-amber-900/40 space-y-1.5 text-xs text-stone-300">
                  <span className="font-bold text-amber-300 block">
                    🌟 दैनिक जीवनमा व्यवहारिक प्रभाव:
                  </span>
                  <p className="leading-relaxed">
                    {swaroopaData.practicalEffectsNepali}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ASTROLOGICAL PRINCIPLES & SYNERGY */}
          {activeTab === 'synergy' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Mutual Relationship Box */}
              {antardashaData && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-stone-900/80 to-amber-950/70 border border-amber-600/40 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <HeartHandshake className="w-4 h-4 text-amber-400" />
                    दशानाथ ({planet}) र अन्तरदशानाथ ({subPlanet}) सम्बन्ध
                  </div>
                  <p className="text-sm text-stone-200 leading-relaxed font-sans">
                    {antardashaData.mutualRelationshipNepali}
                  </p>
                </div>
              )}

              {/* Core Astrological Principles List */}
              <div className="p-5 rounded-2xl bg-stone-900/80 border border-amber-800/40 space-y-3">
                <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  पाराशर शास्त्रीय ज्योतिषीय सूत्रहरू (Core Principles)
                </h3>
                <ul className="space-y-2.5">
                  {(selectedPlanetLevel === 'sub' && antardashaData
                    ? antardashaData.astrologicalPrinciplesNepali
                    : mahadashaData
                    ? mahadashaData.astrologicalPrinciplesNepali
                    : swaroopaData?.astrologicalPrinciplesNepali || [
                        'दशा कालमा सम्बन्धित ग्रह बसेको भाव र स्वामित्व भएका भावहरू सक्रिय हुन्छन्।',
                        'केन्द्र र त्रिकोणमा बसेका ग्रहले शुभ दशा फल प्रदान गर्दछन्।'
                      ]
                  ).map((principle, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-300 bg-stone-950/60 p-2.5 rounded-xl border border-stone-800/80"
                    >
                      <span className="text-amber-400 font-bold font-serif text-sm">
                        {toDevanagariNumerals(idx + 1)}.
                      </span>
                      <span className="leading-relaxed">{principle}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Timing & Trigger Rules */}
              {mahadashaData?.timingAndTriggerRulesNepali && (
                <div className="p-4 rounded-2xl bg-stone-900/60 border border-amber-900/40 space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    समय विभाजन एवं फल प्राप्ति काल (Timing Rules)
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                    {mahadashaData.timingAndTriggerRulesNepali}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CLASSICAL REMEDIES & SHANTI VIDHAN */}
          {activeTab === 'remedy' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Primary Classical Remedy Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/90 to-stone-900/90 border border-amber-500/40 space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <span>पाराशर शान्ति विधान एवं वैदिक उपचार</span>
                </div>
                <p className="text-sm sm:text-base text-amber-100 leading-relaxed font-sans bg-stone-950/70 p-4 rounded-xl border border-amber-900/60">
                  {currentRemedy}
                </p>
              </div>

              {/* Quick Mantra & Deity Worship Action Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-stone-900/70 border border-amber-800/40 space-y-2">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                    📿 नित्य मन्त्र जप सुझाव
                  </span>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    दशा अवधिभर सम्बन्धित ग्रहको वैदिक वा तान्त्रिक मन्त्र नित्य १०८ पटक बिहान सूर्योदय वा सन्ध्याकालमा जप गर्दा अनिष्ट नाश भई शुभ फल वृद्धि हुन्छ।
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-900/70 border border-amber-800/40 space-y-2">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                    🌿 सात्विक दान एवं सेवा
                  </span>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    शुभ बारमा सम्बन्धित ग्रहका कारक वस्तुहरू (अन्न, वस्त्र, धातु) असहाय, पशुपक्षी वा मन्दिरमा अर्पण गर्दा ग्रह दोष शान्त हुन्छ।
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-t border-amber-900/60 bg-stone-950/95 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="text-[11px] sm:text-xs">
              स्रोत: महर्षि पराशर विरचित बृहत्पाराशर होराशास्त्रम्
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-600 text-stone-950 font-bold hover:bg-amber-500 transition-all shadow-md"
          >
            बन्द गर्नुहोस्
          </button>
        </div>
      </div>
    </div>
  );
};
