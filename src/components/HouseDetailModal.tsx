import React, { useEffect, useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Eye,
  Compass,
  Heart,
  Shield,
  Activity,
  Award,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PlanetPosition, RashiName } from '../types/astrology';
import { VEDIC_HOUSE_DETAILS, HouseSignificationDetail } from '../data/houseDetailsData';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { formatPlanetDegreesMinutes, getPlanetStatusSuffix } from '../utils/aspectEngine';
import { calculateSinglePlanetAspects } from '../utils/aspectEngine';

export interface HouseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  houseNumber: number; // 1 to 12
  onChangeHouse?: (newHouseNumber: number) => void;
  // Optional dynamic chart context
  rashiId?: number;
  rashiName?: RashiName;
  rashiLord?: string;
  planetsInHouse?: PlanetPosition[];
  allHouses?: Array<{
    houseNumber: number;
    rashiId?: number;
    rashiName?: RashiName;
    rashiLord?: string;
    planets: PlanetPosition[];
  }>;
  chartTitle?: string;
}

const RASHI_LORDS: Record<number, string> = {
  1: 'मंगल (Mars)', 2: 'शुक्र (Venus)', 3: 'बुध (Mercury)', 4: 'चन्द्र (Moon)',
  5: 'सूर्य (Sun)', 6: 'बुध (Mercury)', 7: 'शुक्र (Venus)', 8: 'मंगल (Mars)',
  9: 'गुरु (Jupiter)', 10: 'शनि (Saturn)', 11: 'शनि (Saturn)', 12: 'गुरु (Jupiter)'
};

const RASHI_NAMES: Record<number, RashiName> = {
  1: 'मेष', 2: 'वृष', 3: 'मिथुन', 4: 'कर्कट', 5: 'सिंह', 6: 'कन्या',
  7: 'तुला', 8: 'वृश्चिक', 9: 'धनु', 10: 'मकर', 11: 'कुम्भ', 12: 'मीन'
};

export const HouseDetailModal: React.FC<HouseDetailModalProps> = ({
  isOpen,
  onClose,
  houseNumber: initialHouseNumber,
  onChangeHouse,
  rashiId: propRashiId,
  rashiName: propRashiName,
  rashiLord: propRashiLord,
  planetsInHouse: propPlanetsInHouse,
  allHouses,
  chartTitle = 'जन्मकुण्डली',
}) => {
  const [currentHouse, setCurrentHouse] = useState<number>(initialHouseNumber || 1);
  const [activeTab, setActiveTab] = useState<'significations' | 'chartAnalysis' | 'classicalShloka' | 'remedies'>('significations');

  useEffect(() => {
    if (initialHouseNumber >= 1 && initialHouseNumber <= 12) {
      setCurrentHouse(initialHouseNumber);
    }
  }, [initialHouseNumber]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        goToNextHouse();
      } else if (e.key === 'ArrowLeft') {
        goToPrevHouse();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentHouse]);

  if (!isOpen) return null;

  const houseData: HouseSignificationDetail = VEDIC_HOUSE_DETAILS[currentHouse] || VEDIC_HOUSE_DETAILS[1];

  const handleSelectHouse = (h: number) => {
    setCurrentHouse(h);
    if (onChangeHouse) onChangeHouse(h);
  };

  const goToPrevHouse = () => {
    const nextH = currentHouse === 1 ? 12 : currentHouse - 1;
    handleSelectHouse(nextH);
  };

  const goToNextHouse = () => {
    const nextH = currentHouse === 12 ? 1 : currentHouse + 1;
    handleSelectHouse(nextH);
  };

  // Find live chart data for this house if allHouses provided
  const currentHouseChartData = allHouses?.find((h) => h.houseNumber === currentHouse);
  const effectiveRashiId = currentHouseChartData?.rashiId || propRashiId || currentHouse;
  const effectiveRashiName = currentHouseChartData?.rashiName || propRashiName || RASHI_NAMES[effectiveRashiId] || 'मेष';
  const effectiveRashiLord = currentHouseChartData?.rashiLord || propRashiLord || RASHI_LORDS[effectiveRashiId] || '';
  const effectivePlanets = currentHouseChartData?.planets || (currentHouse === initialHouseNumber ? propPlanetsInHouse : []) || [];

  // Compute aspecting planets on this current house from allHouses
  const aspectingPlanetsList: Array<{ planet: PlanetPosition; sourceHouse: number; aspectText: string }> = [];
  if (allHouses && allHouses.length > 0) {
    allHouses.forEach((h) => {
      h.planets.forEach((p) => {
        if (p.id !== 'lagna_marker') {
          const aspects = calculateSinglePlanetAspects(p, h.houseNumber, allHouses as any);
          const match = aspects.find((a) => a.targetHouseNumber === currentHouse);
          if (match) {
            aspectingPlanetsList.push({
              planet: p,
              sourceHouse: h.houseNumber,
              aspectText: match.shortTypeNepali,
            });
          }
        }
      });
    });
  }

  // Find where the Lord of this house is residing
  let lordResidingHouse: number | null = null;
  if (allHouses && effectiveRashiLord) {
    const cleanLordName = effectiveRashiLord.split(' ')[0]; // e.g. 'मंगल', 'शुक्र'
    allHouses.forEach((h) => {
      const match = h.planets.find((p) => p.name === cleanLordName && p.id !== 'lagna_marker');
      if (match) {
        lordResidingHouse = h.houseNumber;
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-[#FFFDF9] dark:bg-stone-900 border-2 border-amber-300 dark:border-amber-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-[#2D241E] dark:text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with Golden Theme & Quick House Switcher */}
        <div className="bg-gradient-to-r from-[#7A1C1C] via-[#9B2226] to-[#7A1C1C] text-amber-50 p-4 relative border-b border-amber-400/40">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 bg-black/20 hover:bg-black/40 text-amber-200 hover:text-white rounded-full transition-colors cursor-pointer"
            title="बन्द गर्नुहोस् (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-400 text-stone-900 font-extrabold text-xs px-2.5 py-0.5 rounded-full shadow-xs">
              भाव नं. {toDevanagariNumerals(currentHouse)}
            </span>
            <span className="text-amber-200/90 text-xs font-serif font-bold">
              ॥ श्री वैदिक ज्योतिष भाव रहस्यम् ॥
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold font-serif text-white tracking-wide flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
            <span>{houseData.primaryNameNepali}</span>
          </h2>

          <div className="text-xs text-amber-100/90 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span><strong className="text-amber-300">संज्ञा:</strong> {houseData.classificationNepali}</span>
            <span>•</span>
            <span><strong className="text-amber-300">राशि:</strong> {effectiveRashiName} (भावेश: {effectiveRashiLord})</span>
          </div>

          {/* 1 to 12 Quick Navigator Bar */}
          <div className="mt-3 pt-2.5 border-t border-amber-400/20 flex items-center justify-between gap-1 overflow-x-auto pb-0.5 scrollbar-thin">
            <button
              onClick={goToPrevHouse}
              className="p-1 hover:bg-white/10 rounded text-amber-200 cursor-pointer shrink-0"
              title="अघिल्लो भाव"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((hNum) => (
                <button
                  key={`house-tab-${hNum}`}
                  onClick={() => handleSelectHouse(hNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    currentHouse === hNum
                      ? 'bg-amber-400 text-stone-950 shadow-md scale-110 ring-2 ring-white font-black'
                      : 'bg-black/20 hover:bg-black/40 text-amber-100 hover:text-white'
                  }`}
                  title={`${hNum}औँ भावको विवरण हेर्नुहोस्`}
                >
                  {toDevanagariNumerals(hNum)}
                </button>
              ))}
            </div>
            <button
              onClick={goToNextHouse}
              className="p-1 hover:bg-white/10 rounded text-amber-200 cursor-pointer shrink-0"
              title="पछिल्लो भाव"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#E6E0D5] dark:border-stone-800 bg-[#FAF7F2] dark:bg-stone-950 px-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('significations')}
            className={`px-3.5 py-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'significations'
                ? 'border-[#D97706] text-[#D97706] dark:text-amber-400 bg-white dark:bg-stone-900 shadow-2xs'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>के–के हेरिन्छ? (विचारणीय विषयहरू)</span>
          </button>

          <button
            onClick={() => setActiveTab('chartAnalysis')}
            className={`px-3.5 py-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'chartAnalysis'
                ? 'border-[#D97706] text-[#D97706] dark:text-amber-400 bg-white dark:bg-stone-900 shadow-2xs'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>वर्तमान कुण्डली अनुसार स्थिति</span>
            {effectivePlanets.length > 0 && (
              <span className="text-[10px] bg-amber-500 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                {toDevanagariNumerals(effectivePlanets.length)} ग्रह
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('classicalShloka')}
            className={`px-3.5 py-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'classicalShloka'
                ? 'border-[#D97706] text-[#D97706] dark:text-amber-400 bg-white dark:bg-stone-900 shadow-2xs'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>शास्त्रीय श्लोक र फलित</span>
          </button>

          <button
            onClick={() => setActiveTab('remedies')}
            className={`px-3.5 py-2.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'remedies'
                ? 'border-[#D97706] text-[#D97706] dark:text-amber-400 bg-white dark:bg-stone-900 shadow-2xs'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>उपाय तथा शान्ति</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs leading-relaxed max-h-[calc(92vh-190px)]">
          {/* TAB 1: ALL SIGNIFICATIONS (के–के हेरिन्छ?) */}
          {activeTab === 'significations' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Summary Hero Box */}
              <div className="p-3.5 bg-amber-500/10 border border-amber-300 dark:border-amber-700/60 rounded-2xl">
                <div className="flex items-center gap-2 font-bold text-sm text-[#7A1C1C] dark:text-amber-300 mb-2">
                  <Compass className="w-4 h-4 text-[#D97706]" />
                  <span>यस भावद्वारा विचार गरिने मुख्य विषयहरू</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {houseData.coreThemesNepali.map((theme, i) => (
                    <span
                      key={i}
                      className="bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold px-2.5 py-1 rounded-lg border border-amber-200/80 dark:border-stone-700 shadow-2xs text-[11.5px]"
                    >
                      ✓ {theme}
                    </span>
                  ))}
                </div>
              </div>

              {/* Categorized Detailed Significations */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  विस्तृत विचारणीय क्षेत्रहरू (Detailed Domains):
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {houseData.detailedSignificationsNepali.map((cat, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-stone-800/80 p-3 rounded-xl border border-[#E6E0D5] dark:border-stone-700 shadow-2xs space-y-2"
                    >
                      <h5 className="font-bold text-[#D97706] dark:text-amber-400 text-xs border-b border-stone-100 dark:border-stone-700 pb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{cat.category}</span>
                      </h5>
                      <ul className="space-y-1 text-stone-700 dark:text-stone-300">
                        {cat.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-start gap-1.5">
                            <span className="text-amber-500 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Karakas & Body Parts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Karaka Planets */}
                <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>कारक ग्रहहरू (Karaka Planets):</span>
                  </div>
                  <div className="space-y-1 text-stone-600 dark:text-stone-300">
                    {houseData.karakaPlanets.map((k, idx) => (
                      <div key={idx} className="font-medium">• {k}</div>
                    ))}
                  </div>
                </div>

                {/* Body Parts */}
                <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-stone-200 mb-1.5">
                    <Activity className="w-3.5 h-3.5 text-rose-500" />
                    <span>शरीरका सम्बन्धित अङ्गहरू (Body Parts):</span>
                  </div>
                  <div className="flex flex-wrap gap-1 text-stone-600 dark:text-stone-300">
                    {houseData.bodyPartsNepali.map((bp, idx) => (
                      <span key={idx} className="bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 px-2 py-0.5 rounded text-[11px] font-medium border border-rose-200 dark:border-rose-800">
                        {bp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sanskrit Classical Names */}
              <div className="p-3 bg-amber-50/40 dark:bg-stone-800/30 rounded-xl border border-amber-200/60 dark:border-stone-700 text-stone-600 dark:text-stone-300">
                <span className="font-bold text-stone-800 dark:text-stone-200">शास्त्रोक्त अन्य नामहरू: </span>
                <span className="font-serif font-bold text-[#7A1C1C] dark:text-amber-300">
                  {houseData.sanskritNames.join(', ')}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE CHART ANALYSIS (वर्तमान कुण्डली अनुसार स्थिति) */}
          {activeTab === 'chartAnalysis' && (
            <div className="space-y-4 animate-fadeIn">
              {/* House Identity in User's Chart */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-2xs">
                  <div className="text-stone-500 dark:text-stone-400 text-[11px]">यो घरमा परेको राशि</div>
                  <div className="text-sm font-bold text-[#7A1C1C] dark:text-amber-400 font-serif mt-0.5">
                    {effectiveRashiName} ({toDevanagariNumerals(effectiveRashiId)} नं.)
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-2xs">
                  <div className="text-stone-500 dark:text-stone-400 text-[11px]">राशीश / भावेश (House Lord)</div>
                  <div className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif mt-0.5">
                    {effectiveRashiLord}
                  </div>
                  {lordResidingHouse && (
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                      भाव {toDevanagariNumerals(lordResidingHouse)} मा अवस्थित
                    </div>
                  )}
                </div>

                <div className="p-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-2xs">
                  <div className="text-stone-500 dark:text-stone-400 text-[11px]">भाव संज्ञा एवं प्रकार</div>
                  <div className="text-xs font-bold text-stone-800 dark:text-stone-200 mt-0.5">
                    {houseData.classificationNepali}
                  </div>
                </div>
              </div>

              {/* Planets Residing in this House */}
              <div className="bg-white dark:bg-stone-800 p-3.5 rounded-2xl border border-[#E6E0D5] dark:border-stone-700 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-700 pb-2">
                  <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#D97706]" />
                    <span>यो भावमा अवस्थित ग्रहहरू (Planets in House {toDevanagariNumerals(currentHouse)})</span>
                  </h4>
                  <span className="text-[11px] font-bold text-[#D97706] bg-amber-50 dark:bg-stone-900 px-2 py-0.5 rounded-full border border-amber-200 dark:border-stone-700">
                    कुल {toDevanagariNumerals(effectivePlanets.length)} ग्रह
                  </span>
                </div>

                {effectivePlanets.length === 0 ? (
                  <div className="text-center py-4 text-stone-500 dark:text-stone-400 bg-stone-50/60 dark:bg-stone-900/60 rounded-xl border border-dashed border-stone-200 dark:border-stone-700">
                    यस भावमा कुनै प्रत्यक्ष ग्रह अवस्थित छैनन्। (यस भावको फल भावेश तथा दृष्टि दिने ग्रहहरूको आधारमा निर्धारण हुन्छ।)
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {effectivePlanets.map((p) => {
                      const degFormatted = formatPlanetDegreesMinutes(p);
                      const statusSuffix = getPlanetStatusSuffix(p);
                      const isLagna = p.id === 'lagna_marker';

                      return (
                        <div
                          key={p.id}
                          className="p-2.5 rounded-xl border bg-amber-50/50 dark:bg-stone-900/80 border-amber-200 dark:border-amber-900/60 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                              <span>{isLagna ? 'लग्न बिन्दु' : p.name}</span>
                              {p.isRetrograde && (
                                <span className="text-[10px] bg-rose-100 text-rose-700 px-1 rounded font-bold">
                                  वक्री
                                </span>
                              )}
                              {statusSuffix && (
                                <span className="text-[10px] bg-amber-200 text-amber-900 px-1 rounded font-bold">
                                  {statusSuffix}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                              {p.rashiName} राशि • {degFormatted}
                              {p.nakshatraName ? ` • ${p.nakshatraName} नक्षत्र (${p.pada} पाद)` : ''}
                            </div>
                          </div>
                          <span className="text-xs font-bold text-[#D97706] dark:text-amber-400 bg-white dark:bg-stone-800 px-2 py-1 rounded-lg border border-amber-200 dark:border-stone-700">
                            {p.dignity || 'सामान्य'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Aspecting Planets on this House */}
              <div className="bg-white dark:bg-stone-800 p-3.5 rounded-2xl border border-[#E6E0D5] dark:border-stone-700 shadow-2xs space-y-2">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5 border-b border-stone-100 dark:border-stone-700 pb-2">
                  <Eye className="w-4 h-4 text-[#D97706]" />
                  <span>यो भावमा दृष्टि दिने ग्रहहरू (Planetary Aspects on House {toDevanagariNumerals(currentHouse)})</span>
                </h4>

                {aspectingPlanetsList.length === 0 ? (
                  <div className="text-center py-3 text-stone-500 dark:text-stone-400 text-xs">
                    यस भावमा कुनै ग्रहको प्रत्यक्ष पूर्ण दृष्टि छैन।
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {aspectingPlanetsList.map((asp, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-stone-50 dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-stone-900 dark:text-stone-100">
                          {asp.planet.name} ({toDevanagariNumerals(asp.sourceHouse)}औँ भावबाट)
                        </span>
                        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                          {asp.aspectText}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CLASSICAL SHLOKA & INTERPRETATION (शास्त्रीय श्लोक) */}
          {activeTab === 'classicalShloka' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Shloka Box */}
              <div className="p-4 bg-amber-500/10 border-2 border-amber-300 dark:border-amber-700 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-bold">
                  <span>॥ शास्त्रीय प्रमाण श्लोक ॥</span>
                  <span className="text-[11px] font-mono bg-amber-200/60 dark:bg-stone-800 px-2 py-0.5 rounded">
                    {houseData.classicalShloka.source}
                  </span>
                </div>

                <div className="font-serif text-sm sm:text-base font-bold text-[#7A1C1C] dark:text-amber-200 text-center py-2 whitespace-pre-line leading-relaxed bg-white/70 dark:bg-stone-900/70 rounded-xl border border-amber-200 dark:border-amber-800/60 shadow-2xs">
                  {houseData.classicalShloka.verse}
                </div>

                <div className="text-xs text-stone-700 dark:text-stone-300 pt-1">
                  <strong className="text-[#7A1C1C] dark:text-amber-400">नेपाली भावार्थ: </strong>
                  {houseData.classicalShloka.meaningNepali}
                </div>
              </div>

              {/* Benefic vs Malefic Results */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>शुभ प्रभाव परेमा मिल्ने फल:</span>
                  </div>
                  <ul className="space-y-1 text-stone-700 dark:text-stone-300 text-[11.5px]">
                    {houseData.beneficResultsNepali.map((res, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{res}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-rose-50/60 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300 text-xs">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>कमजोर वा पापी प्रभाव परेमा:</span>
                  </div>
                  <ul className="space-y-1 text-stone-700 dark:text-stone-300 text-[11.5px]">
                    {houseData.maleficResultsNepali.map((res, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">⚠</span>
                        <span>{res}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REMEDIES (उपाय तथा शान्ति) */}
          {activeTab === 'remedies' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="p-3.5 bg-amber-500/10 border border-amber-300 dark:border-amber-700/60 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-[#7A1C1C] dark:text-amber-300">
                  <Shield className="w-4 h-4 text-[#D97706]" />
                  <span>यस भावको शुभ फल वृद्धि गर्ने शास्त्रीय उपायहरू:</span>
                </div>
                <div className="space-y-2 text-stone-700 dark:text-stone-300 text-xs">
                  {houseData.generalRemediesNepali.map((rem, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-white dark:bg-stone-800 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700">
                      <span className="text-amber-600 dark:text-amber-400 font-extrabold text-sm">{toDevanagariNumerals(idx + 1)}.</span>
                      <span>{rem}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl border border-stone-200 dark:border-stone-700 text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-[#D97706] shrink-0" />
                <span>
                  कुण्डलीको कुनै पनि भावको विस्तृत फलित भावेशको बल, कारक ग्रहको अवस्था र दशा-अन्तर्दशामा निर्भर हुन्छ।
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Controls */}
        <div className="bg-[#FAF7F2] dark:bg-stone-950 p-3 border-t border-[#E6E0D5] dark:border-stone-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
            <kbd className="px-1.5 py-0.5 bg-stone-200 dark:bg-stone-800 rounded font-mono text-[10px]">←</kbd>
            <kbd className="px-1.5 py-0.5 bg-stone-200 dark:bg-stone-800 rounded font-mono text-[10px]">→</kbd>
            <span className="hidden sm:inline">किबोर्ड वा माथिको १–१२ बटनले भाव फेर्नुहोस्</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#D97706] hover:bg-[#b45309] text-white font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            बन्द गर्नुहोस्
          </button>
        </div>
      </div>
    </div>
  );
};
