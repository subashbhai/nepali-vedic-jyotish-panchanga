import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Eye, 
  Zap, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  Printer, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Compass, 
  Award, 
  Clock, 
  BookOpen, 
  Activity 
} from 'lucide-react';
import { 
  PlanetPosition, 
  LagnaInfo, 
  VimshottariDashaResult, 
  DivisionalChart,
  BirthDetails 
} from '../types/astrology';
import { 
  analyzeGrahaDetailed, 
  DetailedGrahaAnalysis 
} from '../utils/advancedGrahaEngine';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { ClassicalShlokaCard } from './ClassicalShlokaCard';
import { printElement } from '../utils/pdfGenerator';

export interface GrahaFaladeshModalProps {
  planet: PlanetPosition;
  lagna: LagnaInfo;
  allPlanets: PlanetPosition[];
  profile?: BirthDetails;
  dasha?: VimshottariDashaResult;
  vargaCharts?: Record<string, DivisionalChart>;
  onClose: () => void;
  onOpenFullFaladesh?: () => void;
}

export const GrahaFaladeshModal: React.FC<GrahaFaladeshModalProps> = ({
  planet,
  lagna,
  allPlanets,
  profile,
  dasha,
  vargaCharts,
  onClose,
  onOpenFullFaladesh,
}) => {
  const [activeTab, setActiveTab] = useState<
    'summary' | 'shloka' | 'dignity' | 'house' | 'bhavesh' | 'aspects' | 'conjunction' | 'nakshatra' | 'dasha' | 'varga' | 'faladesh'
  >('summary');

  const [showBasis, setShowBasis] = useState<boolean>(true);

  // Compute detailed analysis using pure astrology engine
  const analysis: DetailedGrahaAnalysis = analyzeGrahaDetailed(
    planet,
    lagna,
    allPlanets,
    dasha,
    vargaCharts
  );

  const handlePrint = () => {
    printElement('graha-faladesh-printable-area');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fadeIn">
      <div 
        id="graha-faladesh-printable-area"
        className="bg-[#FFFDF9] dark:bg-stone-900 w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden transition-all text-[#2D241E] dark:text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-white p-4 sm:p-5 flex items-start justify-between border-b border-amber-800/40 relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl font-bold shadow-inner shrink-0">
              {planet.symbol || '🪐'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-bold font-serif tracking-wide text-amber-100">
                  {planet.name} ग्रह — विस्तृत फलादेश
                </h3>
                <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs ${analysis.dignityDetail.badgeColor}`}>
                  {analysis.dignityDetail.dignity}
                </span>
                {planet.isRetrograde && (
                  <span className="text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/50 px-2 py-0.5 rounded-full">
                    वक्री
                  </span>
                )}
                {planet.isCombust && (
                  <span className="text-[10px] font-bold bg-amber-500/30 text-amber-200 border border-amber-400/50 px-2 py-0.5 rounded-full">
                    अस्त
                  </span>
                )}
                {analysis.isVargottama && (
                  <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/50 px-2 py-0.5 rounded-full">
                    वर्गोत्तम
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-200/80 mt-1 font-medium flex items-center gap-2 flex-wrap">
                <span>राशि: <strong>{analysis.rashiName}</strong></span>
                <span>•</span>
                <span>भाव: <strong>{toDevanagariNumerals(analysis.houseNumber)} औँ</strong></span>
                <span>•</span>
                <span>अंश: <strong>{analysis.formattedDegree}</strong></span>
                <span>•</span>
                <span>नक्षत्र: <strong>{analysis.nakshatraDetail.nakshatraName}</strong> ({toDevanagariNumerals(analysis.nakshatraDetail.pada)} पाद)</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            title="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Tabs */}
        <div className="bg-stone-100 dark:bg-stone-800/80 px-3 py-2 border-b border-stone-200 dark:border-stone-700 overflow-x-auto flex items-center gap-1.5 text-xs font-semibold shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'summary' ? 'bg-[#D97706] text-white shadow-xs font-bold' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>सारांश</span>
          </button>

          <button
            onClick={() => setActiveTab('shloka')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'shloka' ? 'bg-[#7A1C1C] text-white shadow-xs font-bold ring-1 ring-amber-400' : 'text-amber-900 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950/40 hover:bg-amber-200/80 font-bold border border-amber-300 dark:border-amber-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>पाराशर श्लोक (BPHS)</span>
          </button>

          <button
            onClick={() => setActiveTab('dignity')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'dignity' ? 'bg-[#D97706] text-white shadow-xs font-bold' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>ग्रह अवस्था</span>
          </button>

          <button
            onClick={() => setActiveTab('house')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'house' ? 'bg-[#D97706] text-white shadow-xs font-bold' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>भावफल</span>
          </button>

          <button
            onClick={() => setActiveTab('bhavesh')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'bhavesh' ? 'bg-[#D97706] text-white shadow-xs font-bold' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>भावेश</span>
          </button>

          <button
            onClick={() => setActiveTab('aspects')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'aspects' ? 'bg-[#D97706] text-white shadow-xs font-bold' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>दृष्टि</span>
          </button>

          <button
            onClick={() => setActiveTab('conjunction')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'conjunction' ? 'bg-[#D97706] text-white shadow-xs font-bold' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>युति ({analysis.conjunctions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('nakshatra')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'nakshatra' ? 'bg-[#D97706] text-white shadow-xs font-bold' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>नक्षत्र</span>
          </button>

          <button
            onClick={() => setActiveTab('dasha')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'dasha' ? 'bg-[#D97706] text-white shadow-xs font-bold' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>दशा</span>
          </button>

          <button
            onClick={() => setActiveTab('varga')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'varga' ? 'bg-[#D97706] text-white shadow-xs font-bold' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>वर्ग कुण्डली</span>
          </button>

          <button
            onClick={() => setActiveTab('faladesh')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'faladesh' ? 'bg-[#D97706] text-white shadow-xs font-bold' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>समग्र फलादेश</span>
          </button>
        </div>

        {/* Modal Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs leading-relaxed">
          
          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-amber-50/80 dark:bg-stone-800/60 p-3 rounded-2xl border border-amber-200/80 dark:border-stone-700 space-y-0.5">
                  <span className="text-[10px] text-stone-500 font-semibold uppercase">राशि तथा स्वामी</span>
                  <p className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm">
                    {analysis.rashiName} ({analysis.relationshipDetail.rashiLord})
                  </p>
                </div>
                <div className="bg-amber-50/80 dark:bg-stone-800/60 p-3 rounded-2xl border border-amber-200/80 dark:border-stone-700 space-y-0.5">
                  <span className="text-[10px] text-stone-500 font-semibold uppercase">भाव स्थिति</span>
                  <p className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm">
                    भाव {toDevanagariNumerals(analysis.houseNumber)} औँ
                  </p>
                </div>
                <div className="bg-amber-50/80 dark:bg-stone-800/60 p-3 rounded-2xl border border-amber-200/80 dark:border-stone-700 space-y-0.5">
                  <span className="text-[10px] text-stone-500 font-semibold uppercase">नक्षत्र तथा स्वामी</span>
                  <p className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm">
                    {analysis.nakshatraDetail.nakshatraName} ({analysis.nakshatraDetail.nakshatraLord})
                  </p>
                </div>
                <div className="bg-amber-50/80 dark:bg-stone-800/60 p-3 rounded-2xl border border-amber-200/80 dark:border-stone-700 space-y-0.5">
                  <span className="text-[10px] text-stone-500 font-semibold uppercase">स्वामित्व (Bhavesh)</span>
                  <p className="font-bold text-[#D97706] text-xs sm:text-sm truncate">
                    {analysis.lordshipInfo.lordshipTitlesNepali.join(', ')}
                  </p>
                </div>
              </div>

              {/* Synthesized Summary Card */}
              <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-amber-200/80 dark:border-stone-700 shadow-sm space-y-2">
                <h4 className="font-bold text-sm text-[#D97706] font-serif flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>{planet.name} ग्रहको संक्षिप्त सार</span>
                </h4>
                <p className="text-stone-800 dark:text-stone-200 text-xs sm:text-sm leading-relaxed">
                  {analysis.overallFaladeshNepali}
                </p>
              </div>

              {/* Favorable vs Challenge Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-emerald-50/80 dark:bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                  <h5 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>अनुकूल पक्ष (Strengths)</span>
                  </h5>
                  <ul className="space-y-1 text-stone-700 dark:text-stone-300">
                    {analysis.positivePoints.length > 0 ? (
                      analysis.positivePoints.map((pt, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{pt}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-stone-500 italic">सामान्य सन्तुलित स्थिति।</li>
                    )}
                  </ul>
                </div>

                <div className="bg-rose-50/80 dark:bg-rose-950/30 p-3.5 rounded-2xl border border-rose-200 dark:border-rose-800/60 space-y-2">
                  <h5 className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5 text-xs">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>चुनौतीपूर्ण पक्ष (To Watch)</span>
                  </h5>
                  <ul className="space-y-1 text-stone-700 dark:text-stone-300">
                    {analysis.challengePoints.length > 0 ? (
                      analysis.challengePoints.map((pt, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-600 font-bold">•</span>
                          <span>{pt}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-stone-500 italic">विशेष बाधा वा नकारात्मकता देखिएको छैन।</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Classical Shloka Box in Summary */}
              {analysis.classicalProof && (
                <div className="pt-2">
                  <ClassicalShlokaCard
                    shloka={analysis.classicalProof}
                    bhavaShloka={analysis.bhavaShloka}
                    planetName={planet.name}
                    houseNumber={analysis.houseNumber}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 1.5: DEDICATED BRIHAT PARASHARA SHLOKA TAB */}
          {activeTab === 'shloka' && (
            <div className="space-y-4 animate-fadeIn">
              {analysis.classicalProof ? (
                <ClassicalShlokaCard
                  shloka={analysis.classicalProof}
                  bhavaShloka={analysis.bhavaShloka}
                  planetName={planet.name}
                  houseNumber={analysis.houseNumber}
                />
              ) : (
                <p className="text-stone-500 italic">पाराशर श्लोक विवरण उपलब्ध छैन।</p>
              )}
            </div>
          )}

          {/* TAB 2: DIGNITY & STRENGTH */}
          {activeTab === 'dignity' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-2">
                  <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#D97706]" />
                    <span>ग्रहको मर्यादा (Dignity) तथा अवस्था विश्लेषण</span>
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${analysis.dignityDetail.badgeColor}`}>
                    {analysis.dignityDetail.dignity}
                  </span>
                </div>

                <div className="p-3 bg-amber-50/70 dark:bg-stone-800/50 rounded-xl border border-amber-200/60 text-stone-800 dark:text-stone-200 text-xs">
                  <p className="font-bold text-[#D97706] mb-1">किन यो अवस्था आयो?</p>
                  <p>{analysis.dignityDetail.explanationNepali}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
                    <span className="font-bold text-stone-900 dark:text-stone-100">राशि स्वामीसँगको सम्बन्ध:</span>
                    <p className="text-stone-600 dark:text-stone-300">{analysis.relationshipDetail.summaryNepali}</p>
                  </div>

                  <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
                    <span className="font-bold text-stone-900 dark:text-stone-100">गति तथा अस्त स्थिति:</span>
                    <p className="text-stone-600 dark:text-stone-300">
                      गति: <strong>{analysis.speedMotionNepali}</strong> | उदय: <strong>{analysis.combustStatusNepali}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Natural Karakatwa Box */}
              <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2">
                <h5 className="font-bold text-stone-900 dark:text-stone-100 text-xs flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#D97706]" />
                  <span>{planet.name} ग्रहको स्वाभाविक कारकत्व (Natural Karakatwa)</span>
                </h5>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.naturalKarakatwaNepali.map((k, idx) => (
                    <span key={idx} className="bg-white dark:bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 text-[11px] font-medium text-stone-700 dark:text-stone-300 shadow-2xs">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HOUSE ANALYSIS */}
          {activeTab === 'house' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-2">
                  <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#D97706]" />
                    <span>भाव {toDevanagariNumerals(analysis.houseNumber)} औँ मा {planet.name} को फल</span>
                  </h4>
                  <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold px-2.5 py-0.5 rounded-full">
                    {analysis.rashiName} राशि
                  </span>
                </div>

                <div className="p-3 bg-amber-50/70 dark:bg-stone-800/50 rounded-xl border border-amber-200/60 text-xs space-y-1">
                  <span className="font-bold text-[#D97706]">यस भावका प्रमुख विषयहरू:</span>
                  <p className="text-stone-700 dark:text-stone-300">{analysis.bhavaSignificationsNepali}</p>
                </div>

                <div className="space-y-1 text-xs">
                  <span className="font-bold text-stone-900 dark:text-stone-100">भावगत प्रभाव व्याख्या:</span>
                  <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                    {analysis.housePositionImpactNepali}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BHAVESH ANALYSIS */}
          {activeTab === 'bhavesh' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2 border-b border-stone-200 dark:border-stone-700 pb-2">
                  <Zap className="w-4 h-4 text-[#D97706]" />
                  <span>भावेशत्व (House Lordships) र यसको संयुक्त प्रभाव</span>
                </h4>

                <div className="flex flex-wrap gap-2">
                  {analysis.lordshipInfo.lordshipTitlesNepali.map((t, idx) => (
                    <span key={idx} className="bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 px-3 py-1 rounded-xl text-xs font-bold border border-amber-300/60">
                      {t}
                    </span>
                  ))}
                </div>

                <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-xs">
                  {analysis.lordshipInfo.summaryNepali}
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: ASPECTS */}
          {activeTab === 'aspects' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Aspects Cast */}
              <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2 border-b border-stone-200 dark:border-stone-700 pb-2">
                  <Eye className="w-4 h-4 text-[#D97706]" />
                  <span>{planet.name} ले अन्य भावहरूमा दिएको दृष्टि (Aspects Cast)</span>
                </h4>

                <div className="space-y-2">
                  {analysis.aspectsCast.map((asp, idx) => (
                    <div key={idx} className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
                      <div className="flex justify-between items-center font-bold text-xs">
                        <span className="text-[#D97706]">भाव {toDevanagariNumerals(asp.targetHouse)} ({asp.targetRashi} राशि) सम्म दृष्टि</span>
                        <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded text-[10px]">{asp.aspectType}</span>
                      </div>
                      <p className="text-stone-600 dark:text-stone-300 text-xs">{asp.effectSummaryNepali}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aspects Received */}
              <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2 border-b border-stone-200 dark:border-stone-700 pb-2">
                  <Eye className="w-4 h-4 text-[#D97706]" />
                  <span>{planet.name} माथि परेको अन्य ग्रहहरूको दृष्टि (Aspects Received)</span>
                </h4>

                {analysis.aspectsReceived.length > 0 ? (
                  <div className="space-y-2">
                    {analysis.aspectsReceived.map((asp, idx) => (
                      <div key={idx} className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
                        <div className="flex justify-between items-center font-bold text-xs">
                          <span className="text-[#D97706]">{asp.aspectingPlanet} को दृष्टि (भाव {toDevanagariNumerals(asp.fromHouse)} बाट)</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] ${asp.nature === 'शुभ' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                            {asp.nature} दृष्टि
                          </span>
                        </div>
                        <p className="text-stone-600 dark:text-stone-300 text-xs">{asp.effectSummaryNepali}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-500 italic text-xs">यस ग्रहमाथि कुनै अन्य ग्रहको प्रत्यक्ष पूर्ण दृष्टि छैन।</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: CONJUNCTIONS */}
          {activeTab === 'conjunction' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2 border-b border-stone-200 dark:border-stone-700 pb-2">
                  <Activity className="w-4 h-4 text-[#D97706]" />
                  <span>ग्रह युति (Conjunctions)</span>
                </h4>

                {analysis.conjunctions.length > 0 ? (
                  <div className="space-y-2">
                    {analysis.conjunctions.map((conj, idx) => (
                      <div key={idx} className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
                        <div className="flex justify-between items-center font-bold text-xs text-[#D97706]">
                          <span>{planet.name} + {conj.planet}</span>
                          <span className="text-stone-500 font-normal">कोणात्मक दूरी: {conj.degreeDistance}</span>
                        </div>
                        <p className="text-stone-700 dark:text-stone-300 text-xs">{conj.effectSummaryNepali}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-500 italic text-xs">भाव {toDevanagariNumerals(planet.bhava)} मा {planet.name} सँग कुनै अन्य ग्रह युतिमा छैन।</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: NAKSHATRA */}
          {activeTab === 'nakshatra' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2 border-b border-stone-200 dark:border-stone-700 pb-2">
                  <BookOpen className="w-4 h-4 text-[#D97706]" />
                  <span>नक्षत्र तथा नक्षत्र स्वामी स्थिति</span>
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-amber-50/70 dark:bg-stone-800/50 rounded-xl border border-amber-200/60">
                    <span className="text-stone-500 font-semibold">नक्षत्र नाम:</span>
                    <p className="font-bold text-stone-900 dark:text-stone-100 text-sm">{analysis.nakshatraDetail.nakshatraName}</p>
                  </div>
                  <div className="p-3 bg-amber-50/70 dark:bg-stone-800/50 rounded-xl border border-amber-200/60">
                    <span className="text-stone-500 font-semibold">पाद र नक्षत्र स्वामी:</span>
                    <p className="font-bold text-[#D97706] text-sm">
                      पाद {toDevanagariNumerals(analysis.nakshatraDetail.pada)} (स्वामी: {analysis.nakshatraDetail.nakshatraLord})
                    </p>
                  </div>
                </div>

                <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-xs pt-2">
                  {analysis.nakshatraDetail.summaryNepali}
                </p>
              </div>
            </div>
          )}

          {/* TAB 8: DASHA */}
          {activeTab === 'dasha' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2 border-b border-stone-200 dark:border-stone-700 pb-2">
                  <Clock className="w-4 h-4 text-[#D97706]" />
                  <span>विंशोत्तरी दशा समन्वय (Vimshottari Dasha Context)</span>
                </h4>

                <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1 text-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span>दशा भूमिका:</span>
                    <span className="text-[#D97706] font-bold">{analysis.dashaDetail.dashaRoleNepali}</span>
                  </div>
                  <p className="text-stone-700 dark:text-stone-300 pt-1">{analysis.dashaDetail.explanationNepali}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: VARGA */}
          {activeTab === 'varga' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2 border-b border-stone-200 dark:border-stone-700 pb-2">
                  <Layers className="w-4 h-4 text-[#D97706]" />
                  <span>विभिन्न वर्ग कुण्डलीहरूमा {planet.name} को अवस्था (Varga Positions)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {analysis.vargaStatuses.map((vs, idx) => (
                    <div key={idx} className="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 text-xs space-y-0.5">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-stone-900 dark:text-stone-100">{vs.vargaType} ({vs.rashiName})</span>
                        <span className="text-[10px] text-stone-500">भाव {toDevanagariNumerals(vs.houseNumber)}</span>
                      </div>
                      <p className="text-[11px] text-stone-600 dark:text-stone-300 truncate">{vs.vargaTitleNepali}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: FALADESH (COMPREHENSIVE) */}
          {activeTab === 'faladesh' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-[#D97706] font-serif flex items-center gap-2 border-b border-stone-200 dark:border-stone-700 pb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>समग्र ग्रहफल तथा जीवनक्षेत्र प्रभाव</span>
                </h4>

                <p className="text-stone-800 dark:text-stone-200 leading-relaxed text-xs sm:text-sm">
                  {analysis.overallFaladeshNepali}
                </p>

                {/* Recommended Remedies */}
                <div className="bg-amber-50/80 dark:bg-amber-950/30 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800/60 space-y-2">
                  <h5 className="font-bold text-amber-900 dark:text-amber-200 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
                    <span>शास्त्रीय तथा व्यावहारिक उपायहरू (Remedies)</span>
                  </h5>
                  <ul className="space-y-1 text-stone-700 dark:text-stone-300 text-xs">
                    {analysis.recommendedRemedies.map((rem, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#D97706] font-bold">✓</span>
                        <span>{rem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Expandable Section: "फलादेशको आधार" (Astrological Basis Checklist) */}
          <div className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden text-xs">
            <button
              onClick={() => setShowBasis(!showBasis)}
              className="w-full p-3 flex items-center justify-between font-bold text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/70 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5 text-xs">
                <Info className="w-4 h-4 text-[#D97706]" />
                <span>फलादेशको आधार (Explainable Astrological Logic Basis)</span>
              </span>
              {showBasis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showBasis && (
              <div className="p-3.5 space-y-1.5 bg-white dark:bg-stone-850 border-t border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
                {analysis.astrologicalBasisChecklist.map((item, idx) => (
                  <p key={idx} className="flex items-center gap-1.5 font-mono text-[11px] text-amber-900 dark:text-amber-200">
                    <span>{item}</span>
                  </p>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer Buttons Section */}
        <div className="bg-stone-100 dark:bg-stone-800/90 p-3 sm:p-4 border-t border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-600 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिन्ट / PDF</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onOpenFullFaladesh && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFullFaladesh();
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 hover:from-amber-700 hover:to-amber-800 shadow-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>पूर्ण फलादेश हेर्नुहोस्</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-stone-300 dark:bg-stone-700 text-stone-800 dark:text-stone-100 rounded-xl font-bold text-xs hover:bg-stone-400 dark:hover:bg-stone-600 transition-colors cursor-pointer"
            >
              बन्द गर्नुहोस्
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
