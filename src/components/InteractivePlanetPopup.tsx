import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Eye, 
  Zap, 
  ShieldAlert, 
  CheckCircle2, 
  Printer, 
  Award, 
  Compass, 
  Clock, 
  BookOpen, 
  Activity, 
  Info, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { 
  PlanetPosition, 
  LagnaInfo, 
  VimshottariDashaResult, 
  BirthDetails 
} from '../types/astrology';
import { analyzeGraha } from '../astrology/interpretation/faladeshEngine';
import { GrahaAnalysis } from '../astrology/interpretation/types';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { ClassicalShlokaCard } from './ClassicalShlokaCard';

export interface InteractivePlanetPopupProps {
  planet: PlanetPosition;
  lagna: LagnaInfo;
  allPlanets: PlanetPosition[];
  profile?: BirthDetails;
  dasha?: VimshottariDashaResult;
  onClose: () => void;
  onOpenFullFaladesh?: () => void;
}

export const InteractivePlanetPopup: React.FC<InteractivePlanetPopupProps> = ({
  planet,
  lagna,
  allPlanets,
  profile,
  dasha,
  onClose,
  onOpenFullFaladesh,
}) => {
  const [activeTab, setActiveTab] = useState<
    'summary' | 'shloka' | 'dignity' | 'house' | 'aspects' | 'conjunctions' | 'dasha' | 'remedies'
  >('summary');

  const [showBasis, setShowBasis] = useState<boolean>(true);

  // Compute interpretation data using the new Faladesh Engine
  const analysis: GrahaAnalysis = analyzeGraha(planet, lagna, allPlanets, dasha);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-[#FFFDF9] dark:bg-stone-900 w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden transition-all text-[#2D241E] dark:text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-white p-4 sm:p-5 flex items-start justify-between border-b border-amber-800/40 relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl font-bold shadow-inner shrink-0">
              {analysis.planetSymbol}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-bold font-serif tracking-wide text-amber-100">
                  {analysis.planet} ग्रह — विश्लेषण र फल
                </h3>
                <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs ${analysis.dignity.badgeColor}`}>
                  {analysis.dignity.status}
                </span>
                {analysis.isRetrograde && (
                  <span className="text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/50 px-2 py-0.5 rounded-full">
                    वक्री
                  </span>
                )}
                {analysis.isCombust && (
                  <span className="text-[10px] font-bold bg-amber-500/30 text-amber-200 border border-amber-400/50 px-2 py-0.5 rounded-full">
                    अस्त
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-200/80 mt-1 font-medium flex items-center gap-2 flex-wrap">
                <span>राशि: <strong>{analysis.rashiName}</strong></span>
                <span>•</span>
                <span>भाव: <strong>भाव {toDevanagariNumerals(analysis.houseNumber)}</strong></span>
                <span>•</span>
                <span>अंश: <strong>{analysis.formattedDegree}</strong></span>
                <span>•</span>
                <span>नक्षत्र: <strong>{analysis.nakshatraName}</strong> ({toDevanagariNumerals(analysis.pada)} पाद)</span>
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
            <span>मर्यादा र स्थिति</span>
          </button>

          <button
            onClick={() => setActiveTab('house')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'house' ? 'bg-[#D97706] text-white shadow-xs font-bold' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>भाव तथा भावेश</span>
          </button>

          <button
            onClick={() => setActiveTab('aspects')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'aspects' ? 'bg-[#D97706] text-white shadow-xs font-bold' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>ग्रह दृष्टि</span>
          </button>

          <button
            onClick={() => setActiveTab('conjunctions')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'conjunctions' ? 'bg-[#D97706] text-white shadow-xs font-bold' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>युति ({analysis.conjunctions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('dasha')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'dasha' ? 'bg-[#D97706] text-white shadow-xs font-bold' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>दशा प्रभाव</span>
          </button>

          <button
            onClick={() => setActiveTab('remedies')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'remedies' ? 'bg-[#D97706] text-white shadow-xs font-bold' : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>उपाय तथा फलादेश</span>
          </button>
        </div>

        {/* Modal Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs leading-relaxed">
          
          {/* TAB 1: SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-amber-50/80 dark:bg-stone-800/60 p-3 rounded-2xl border border-amber-200/80 dark:border-stone-700 space-y-0.5">
                  <span className="text-[10px] text-stone-500 font-semibold uppercase">राशि र स्वामी</span>
                  <p className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm">
                    {analysis.rashiName} ({analysis.rashiLord})
                  </p>
                </div>
                <div className="bg-amber-50/80 dark:bg-stone-800/60 p-3 rounded-2xl border border-amber-200/80 dark:border-stone-700 space-y-0.5">
                  <span className="text-[10px] text-stone-500 font-semibold uppercase">भाव</span>
                  <p className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm">
                    भाव {toDevanagariNumerals(analysis.houseNumber)} औँ
                  </p>
                </div>
                <div className="bg-amber-50/80 dark:bg-stone-800/60 p-3 rounded-2xl border border-amber-200/80 dark:border-stone-700 space-y-0.5">
                  <span className="text-[10px] text-stone-500 font-semibold uppercase">नक्षत्र</span>
                  <p className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm">
                    {analysis.nakshatraName} ({analysis.nakshatraLord})
                  </p>
                </div>
                <div className="bg-amber-50/80 dark:bg-stone-800/60 p-3 rounded-2xl border border-amber-200/80 dark:border-stone-700 space-y-0.5">
                  <span className="text-[10px] text-stone-500 font-semibold uppercase">स्वामित्व (Bhavesh)</span>
                  <p className="font-bold text-[#D97706] text-xs sm:text-sm truncate">
                    {analysis.lordship.lordshipTitlesNepali.join(', ')}
                  </p>
                </div>
              </div>

              {/* Classical Interpretation Synthesis */}
              <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-amber-200/80 dark:border-stone-700 shadow-sm space-y-2">
                <h4 className="font-bold text-sm text-[#D97706] font-serif flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>वैदिक शास्त्रीय फलादेश सार</span>
                </h4>
                <p className="text-stone-800 dark:text-stone-200 text-xs sm:text-sm leading-relaxed">
                  {analysis.classicalInterpretationNepali}
                </p>
              </div>

              {/* Positive vs Challenges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-emerald-50/80 dark:bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                  <h5 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>सकारात्मक पक्षहरू (Strengths)</span>
                  </h5>
                  <ul className="space-y-1 text-stone-700 dark:text-stone-300">
                    {analysis.positiveStrengths.length > 0 ? (
                      analysis.positiveStrengths.map((pt, i) => (
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
                    <span>ध्यान दिनुपर्ने पक्षहरू (To Watch)</span>
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
                      <li className="text-stone-500 italic">कुनै मुख्य प्रतिकूलता छैन।</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Classical Shloka Box */}
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

          {/* TAB 2: DIGNITY & STATUS */}
          {activeTab === 'dignity' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-2">
                  <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#D97706]" />
                    <span>ग्रह मर्यादा (Dignity) तथा श्लोकीय आधार</span>
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${analysis.dignity.badgeColor}`}>
                    {analysis.dignity.status} (बल: {analysis.dignity.score}%)
                  </span>
                </div>

                <div className="p-3 bg-amber-50/70 dark:bg-stone-800/50 rounded-xl border border-amber-200/60 text-stone-800 dark:text-stone-200 text-xs space-y-1">
                  <p className="font-bold text-[#D97706]">व्याख्या:</p>
                  <p>{analysis.dignity.explanationNepali}</p>
                  {analysis.dignity.rationaleSanskrit && (
                    <p className="text-[11px] font-serif text-amber-900 dark:text-amber-300 italic pt-1">
                      संस्कृत सूत्र: "{analysis.dignity.rationaleSanskrit}"
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
                    <span className="font-bold text-stone-900 dark:text-stone-100">गति:</span>
                    <p className="text-stone-600 dark:text-stone-300">
                      {analysis.isRetrograde ? 'वक्री (Retrograde) - चेष्टा बली' : 'मार्गी (Direct)'}
                    </p>
                  </div>
                  <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
                    <span className="font-bold text-stone-900 dark:text-stone-100">सूर्यसँग निकटता (Combustion):</span>
                    <p className="text-stone-600 dark:text-stone-300">
                      {analysis.isCombust ? 'अस्त (Combust)' : 'उदय (Visible)'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HOUSE & BHAVESH */}
          {activeTab === 'house' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2 border-b border-stone-200 dark:border-stone-700 pb-2">
                  <Compass className="w-4 h-4 text-[#D97706]" />
                  <span>भाव {toDevanagariNumerals(analysis.houseNumber)} औँ मा स्थिति र भावेशत्व</span>
                </h4>

                <div className="p-3 bg-amber-50/70 dark:bg-stone-800/50 rounded-xl border border-amber-200/60 text-xs space-y-1">
                  <span className="font-bold text-[#D97706]">भावेश (Lordship) भूमिका:</span>
                  <p className="text-stone-800 dark:text-stone-200">{analysis.lordship.summaryNepali}</p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {analysis.lordship.lordshipTitlesNepali.map((title, idx) => (
                    <span key={idx} className="bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 px-3 py-1 rounded-xl text-xs font-bold border border-amber-300/60">
                      {title}
                    </span>
                  ))}
                  {analysis.lordship.isTrikonaLord && (
                    <span className="bg-emerald-100 text-emerald-900 px-3 py-1 rounded-xl text-xs font-bold">
                      ★ त्रिकोणेश (शुभ कारक)
                    </span>
                  )}
                  {analysis.lordship.isKendraLord && (
                    <span className="bg-sky-100 text-sky-900 px-3 py-1 rounded-xl text-xs font-bold">
                      ★ केन्द्रेश
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ASPECTS */}
          {activeTab === 'aspects' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Cast */}
              <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2 border-b border-stone-200 dark:border-stone-700 pb-2">
                  <Eye className="w-4 h-4 text-[#D97706]" />
                  <span>{analysis.planet} ले अन्य भावहरूमा दिएको दृष्टि (Aspects Cast)</span>
                </h4>

                <div className="space-y-2">
                  {analysis.aspectsCast.map((asp, idx) => (
                    <div key={idx} className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
                      <div className="flex justify-between items-center font-bold text-xs">
                        <span className="text-[#D97706]">भाव {toDevanagariNumerals(asp.targetHouse)} ({asp.targetRashi} राशि) माथि दृष्टि</span>
                        <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded text-[10px]">{asp.aspectType}</span>
                      </div>
                      <p className="text-stone-600 dark:text-stone-300 text-xs">{asp.effectNepali}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Received */}
              <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2 border-b border-stone-200 dark:border-stone-700 pb-2">
                  <Eye className="w-4 h-4 text-[#D97706]" />
                  <span>{analysis.planet} माथि परेको अन्य ग्रहहरूको दृष्टि (Aspects Received)</span>
                </h4>

                {analysis.aspectsReceived.length > 0 ? (
                  <div className="space-y-2">
                    {analysis.aspectsReceived.map((asp, idx) => (
                      <div key={idx} className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1">
                        <div className="flex justify-between items-center font-bold text-xs">
                          <span className="text-[#D97706]">{asp.aspectingPlanet} को दृष्टि (भाव {toDevanagariNumerals(asp.fromHouse)} बाट)</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] ${asp.isBeneficAspect ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}`}>
                            {asp.isBeneficAspect ? 'शुभ दृष्टि' : 'कडा दृष्टि'}
                          </span>
                        </div>
                        <p className="text-stone-600 dark:text-stone-300 text-xs">{asp.effectNepali}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-500 italic text-xs">यस ग्रहमाथि अन्य ग्रहको सोझो पूर्ण दृष्टि छैन।</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: CONJUNCTIONS */}
          {activeTab === 'conjunctions' && (
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
                          <span>{analysis.planet} + {conj.conjoinedPlanet}</span>
                          <span className="text-stone-500 font-normal">दूरी: {conj.formattedDistance}</span>
                        </div>
                        {conj.specialYogaName && (
                          <span className="inline-block bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
                            {conj.specialYogaName}
                          </span>
                        )}
                        <p className="text-stone-700 dark:text-stone-300 text-xs">{conj.interpretationNepali}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-500 italic text-xs">भाव {toDevanagariNumerals(analysis.houseNumber)} मा {analysis.planet} सँग कुनै अन्य ग्रह युतिमा छैन।</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: DASHA */}
          {activeTab === 'dasha' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2 border-b border-stone-200 dark:border-stone-700 pb-2">
                  <Clock className="w-4 h-4 text-[#D97706]" />
                  <span>विंशोत्तरी दशा प्रभाव</span>
                </h4>

                {analysis.dashaContext.length > 0 ? (
                  analysis.dashaContext.map((d, idx) => (
                    <div key={idx} className="p-3 bg-amber-50/80 dark:bg-stone-800/50 rounded-xl border border-amber-200/80 space-y-1">
                      <span className="font-bold text-[#D97706]">{d.roleNepali}</span>
                      <p className="text-stone-800 dark:text-stone-200 text-xs">{d.activeInfluenceNepali}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-stone-500 italic text-xs">
                    हालको मुख्य महादशा/अन्तर्दशामा {analysis.planet} स्वामीको रूपमा छैन।
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: REMEDIES */}
          {activeTab === 'remedies' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white dark:bg-stone-850 p-4 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-[#D97706] font-serif flex items-center gap-2 border-b border-stone-200 dark:border-stone-700 pb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>शास्त्रीय उपायहरू (Remedies)</span>
                </h4>

                <ul className="space-y-2 text-stone-700 dark:text-stone-300 text-xs">
                  {analysis.recommendedRemediesNepali.map((rem, i) => (
                    <li key={i} className="flex items-start gap-2 bg-amber-50/60 dark:bg-stone-800/40 p-2.5 rounded-xl border border-amber-200/50">
                      <span className="text-[#D97706] font-bold">✓</span>
                      <span>{rem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Expandable Section: "फलादेशको आधार" */}
          <div className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden text-xs">
            <button
              onClick={() => setShowBasis(!showBasis)}
              className="w-full p-3 flex items-center justify-between font-bold text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/70 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5 text-xs">
                <Info className="w-4 h-4 text-[#D97706]" />
                <span>फलादेशको आधार (Rule Basis Checklist)</span>
              </span>
              {showBasis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showBasis && (
              <div className="p-3.5 space-y-1.5 bg-white dark:bg-stone-850 border-t border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
                {analysis.astrologicalBasis.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 font-mono text-[11px] text-amber-900 dark:text-amber-200">
                    <span className="font-bold">• {item.titleNepali}:</span>
                    <span>{item.descriptionNepali}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-stone-100 dark:bg-stone-800/90 p-3 sm:p-4 border-t border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-600 rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>प्रिन्ट / PDF</span>
          </button>

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
