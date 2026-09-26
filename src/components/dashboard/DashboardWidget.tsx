import React, { useState, useMemo, memo } from 'react';
import {
  CalendarDays,
  Sparkles,
  Sun,
  Moon,
  Compass,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  Sunrise,
  Sunset,
  ArrowRight,
  Info,
  Flame,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { PanchangaData } from '../../types/astrology';
import { NavTab } from '../Navigation';
import { RadialPanchangaChart } from './RadialPanchangaChart';
import {
  getTithiDeityInfo,
  getVaarDeityInfo,
  getNakshatraDeityInfo,
  getYogaDeityInfo,
  getKaranaDeityInfo,
  getTithiDetailedExplanation,
  getVaarDetailedExplanation,
  getNakshatraDetailedExplanation,
  getYogaDetailedExplanation,
  getKaranaDetailedExplanation
} from '../../utils/panchangaDeityMantraData';

export interface DashboardWidgetProps {
  panchanga: PanchangaData;
  onNavigate?: (tab: NavTab) => void;
  className?: string;
  showSolarTimings?: boolean;
  showRahuAbhijit?: boolean;
}

// 1. Tithi Sanjna & Deities
interface TithiInfo {
  category: 'नन्दा' | 'भद्रा' | 'जया' | 'रिक्ता' | 'पूर्णा';
  deity: string;
  effect: string;
  color: string;
}

const TITHI_LOOKUP: Record<number, TithiInfo> = {
  1: { category: 'नन्दा', deity: 'अग्नि', effect: 'आनन्द, उत्सव, नयाँ कार्य आरम्भ', color: 'emerald' },
  2: { category: 'भद्रा', deity: 'ब्रह्मा', effect: 'स्थायी कार्य, मित्रता, यात्रा', color: 'blue' },
  3: { category: 'जया', deity: 'गणेश / गौरी', effect: 'विजय, सफलता, पराक्रम', color: 'amber' },
  4: { category: 'रिक्ता', deity: 'यम / गणेश', effect: 'सावधानी, साधना, कडा कार्य', color: 'rose' },
  5: { category: 'पूर्णा', deity: 'सर्प / सोम', effect: 'सर्वकार्य सिद्धि, पौष्टिक कर्म', color: 'purple' },
  6: { category: 'नन्दा', deity: 'कार्तिकेय', effect: 'आनन्द, यश, उत्सव', color: 'emerald' },
  7: { category: 'भद्रा', deity: 'सूर्यदेव', effect: 'आरोग्य, पद-प्रतिष्ठा, यात्रा', color: 'blue' },
  8: { category: 'जया', deity: 'शिव / दुर्गा', effect: 'शक्ति सञ्चार, विजय, धर्म', color: 'amber' },
  9: { category: 'रिक्ता', deity: 'दुर्गा / यम', effect: 'साधना, रक्षाकर्म, विवाद मुक्ति', color: 'rose' },
  10: { category: 'पूर्णा', deity: 'धर्मराज / यम', effect: 'सम्पूर्णता, शुभ मङ्गल कार्य', color: 'purple' },
  11: { category: 'नन्दा', deity: 'हरि / रुद्र', effect: 'एकादशी व्रत, तप, अध्यात्म', color: 'emerald' },
  12: { category: 'भद्रा', deity: 'विष्णु', effect: 'धार्मिक अनुष्ठान, दान, यात्रा', color: 'blue' },
  13: { category: 'जया', deity: 'कामदेव', effect: 'मैत्री, सौन्दर्य, विजय', color: 'amber' },
  14: { category: 'रिक्ता', deity: 'शिव / काली', effect: 'शिवाराधना, तन्त्र, शान्ति पाठ', color: 'rose' },
  15: { category: 'पूर्णा', deity: 'चन्द्रमा', effect: 'पूर्णिमा महाफल, सत्यनारायण पूजा', color: 'purple' },
  30: { category: 'पूर्णा', deity: 'पितृदेव', effect: 'औंसी, श्राद्ध, तर्पण, दान', color: 'stone' },
};

// 2. Vaar Deities, Elements & Guidance
interface VaarInfo {
  deity: string;
  tattva: string;
  mantra: string;
  favorableAction: string;
}

const VAAR_LOOKUP: Record<string, VaarInfo> = {
  'आइतबार': {
    deity: 'सूर्यदेव',
    tattva: 'अग्नि',
    mantra: 'ॐ घृणिः सूर्याय नमः',
    favorableAction: 'प्रशासनिक कार्य, औषधि सेवन, पदभार ग्रहण, मान-सम्मान'
  },
  'सोमबार': {
    deity: 'चन्द्रमा / भगवान् शिव',
    tattva: 'जल',
    mantra: 'ॐ सोमाय नमः',
    favorableAction: 'मानसिक शान्ति, जलयात्रा, दूध/चाँदीको कारोबार, नयाँ विचार'
  },
  'मंगलबार': {
    deity: 'मङ्गल / हनुमान्',
    tattva: 'अग्नि',
    mantra: 'ॐ भौमाय नमः',
    favorableAction: 'साहस, भूमि, प्राविधिक कार्य, व्यायाम तथा ऋण मोचन'
  },
  'बुधबार': {
    deity: 'बुध / भगवान् विष्णु',
    tattva: 'पृथ्वी',
    mantra: 'ॐ बुधाय नमः',
    favorableAction: 'व्यापार, बैङ्किङ, लेखन, सञ्चार, अध्ययन तथा लेखापरीक्षण'
  },
  'बिहीबार': {
    deity: 'बृहस्पति / ब्रह्मा',
    tattva: 'आकाश',
    mantra: 'ॐ बृहस्पतये नमः',
    favorableAction: 'ज्ञानार्जन, मङ्गलमय उत्सव, विवाह वार्ता, धार्मिक अनुष्ठान'
  },
  'शुक्रबार': {
    deity: 'शुक्र / महालक्ष्मी',
    tattva: 'जल',
    mantra: 'ॐ शुक्राय नमः',
    favorableAction: 'कला, सौन्दर्य, नयाँ वस्त्र, आभूषण, मनोरञ्जन तथा साझेदारी'
  },
  'शनिबार': {
    deity: 'शनिदेव / यमराज',
    tattva: 'वायु',
    mantra: 'ॐ शनैश्चराय नमः',
    favorableAction: 'स्थायी कार्य, न्याय, उद्योग, सेवा, तेल तथा फलाम सम्बन्धी काम'
  }
};

// 3. Nakshatra Nature
interface NakshatraCategoryInfo {
  nature: 'स्थिर/ध्रुव' | 'चर/चल' | 'उग्र/क्रूर' | 'मिश्र' | 'क्षिप्र/लघु' | 'मृदु/मैत्र' | 'तीक्ष्ण/दारुण';
  deity: string;
  activity: string;
}

const NAKSHATRA_NATURE_MAP: Record<string, NakshatraCategoryInfo> = {
  'अश्विनी': { nature: 'क्षिप्र/लघु', deity: 'अश्विनीकुमार', activity: 'औषधोपचार, यात्रा, नयाँ कार्य आरम्भ' },
  'भरणी': { nature: 'उग्र/क्रूर', deity: 'यमराज', activity: 'मुद्दा, कडा कार्य, नियन्त्रण' },
  'कृत्तिका': { nature: 'मिश्र', deity: 'अग्नि', activity: 'प्रतिस्पर्धा, धातु कार्य, यज्ञ' },
  'रोहिणी': { nature: 'स्थिर/ध्रुव', deity: 'ब्रह्मा/प्रजापति', activity: 'गृहप्रवेश, शिलान्यास, स्थायी कार्य' },
  'मृगशिरा': { nature: 'मृदु/मैत्र', deity: 'चन्द्र/सोम', activity: 'सङ्गीत, मित्रता, यात्रा, वस्त्र' },
  'आर्द्रा': { nature: 'तीक्ष्ण/दारुण', deity: 'रुद्र', activity: 'अनुसन्धान, बाधा निवारण, तन्त्र' },
  'पुनर्वसु': { nature: 'चर/चल', deity: 'अदिति', activity: 'यात्रा, नवीन आरम्भ, वाहन' },
  'पुष्य': { nature: 'क्षिप्र/लघु', deity: 'बृहस्पति', activity: 'सर्वकार्य सिद्धि, पोषण, मङ्गलमय अनुष्ठान' },
  'आश्लेषा': { nature: 'तीक्ष्ण/दारुण', deity: 'सर्प', activity: 'रक्षा, कठोर निर्णय, गुप्त कार्य' },
  'मघा': { nature: 'उग्र/क्रूर', deity: 'पितृ', activity: 'पितृकार्य, नेतृत्व, अधिकार प्रदर्शन' },
  'पूर्वाफाल्गुनी': { nature: 'उग्र/क्रूर', deity: 'भग', activity: 'प्रेम, कला, उत्सव, सभा' },
  'उत्तराफाल्गुनी': { nature: 'स्थिर/ध्रुव', deity: 'अर्यमा', activity: 'विवाह, स्थायी व्यापार, गृह' },
  'हस्त': { nature: 'क्षिप्र/लघु', deity: 'सूर्य/सविता', activity: 'शिल्प, वाणिज्य, अध्ययन, यात्रा' },
  'चित्रा': { nature: 'मृदु/मैत्र', deity: 'विश्वकर्मा', activity: 'चित्रकला, निर्माण, सौन्दर्य' },
  'स्वाती': { nature: 'चर/चल', deity: 'वायु', activity: 'व्यापार विस्तार, गतिशीलता, नयाँ विचार' },
  'विशाखा': { nature: 'मिश्र', deity: 'इन्द्राग्नि', activity: 'लक्ष्य प्राप्ति, प्रतिस्पर्धा, परिश्रम' },
  'अनुराधा': { nature: 'मृदु/मैत्र', deity: 'मित्र', activity: 'मैत्री, यात्रा, वैदेशिक कार्य' },
  'ज्येष्ठा': { nature: 'तीक्ष्ण/दारुण', deity: 'इन्द्र', activity: 'नेतृत्व, रक्षा, कठोर कार्य' },
  'मूल': { nature: 'तीक्ष्ण/दारुण', deity: 'निरृति', activity: 'मूल शोध, जडीबुटी, साधना' },
  'पूर्वाषाढा': { nature: 'उग्र/क्रूर', deity: 'जल/आपः', activity: 'आत्मविश्वास, विजय, जलकार्य' },
  'उत्तराषाढा': { nature: 'स्थिर/ध्रुव', deity: 'विश्वेदेवा', activity: 'सत्य, स्थायी सम्झौता, प्रतिष्ठा' },
  'श्रवण': { nature: 'चर/चल', deity: 'विष्णु', activity: 'शिक्षा, सुन्ने/सुनाउने, यात्रा' },
  'धनिष्ठा': { nature: 'चर/चल', deity: 'अष्टवसु', activity: 'सङ्गीत, धनवृद्धि, उत्सव' },
  'शतभिषा': { nature: 'चर/चल', deity: 'वरुण', activity: 'चिकित्सा, आरोग्य, ध्यान' },
  'पूर्वाभाद्रपदा': { nature: 'उग्र/क्रूर', deity: 'अजैकपाद', activity: 'तपस्या, कडा निर्णय, साधना' },
  'उत्तराभाद्रपदा': { nature: 'स्थिर/ध्रुव', deity: 'अहिर्बुध्न्य', activity: 'स्थिर सम्पत्ति, परोपकार, ध्यान' },
  'रेवती': { nature: 'मृदु/मैत्र', deity: 'पूषा', activity: 'यात्रा, वाणिज्य, सौम्य कर्म, वस्त्र' },
};

// 4. Yoga Auspiciousness
const INAUSPICIOUS_YOGAS = new Set([
  'विष्कुम्भ',
  'अतिगण्ड',
  'शूल',
  'गण्ड',
  'व्याघात',
  'वज्र',
  'व्यतीपात',
  'परिघ',
  'वैधृति'
]);

// 5. Karana Categories & Bhadra Detection
const FIXED_KARANAS = new Set(['शकुनि', 'चतुष्पाद', 'नाग', 'किंस्तुघ्न']);

export const DashboardWidget: React.FC<DashboardWidgetProps> = memo(({
  panchanga,
  onNavigate,
  className = '',
  showSolarTimings = true,
  showRahuAbhijit = true,
}) => {
  const [showDeepInsight, setShowDeepInsight] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'radial' | 'cards'>('cards');

  // 1. Tithi enrichment
  const tithiNumber = panchanga?.tithi?.number ? ((panchanga.tithi.number - 1) % 15) + 1 : 1;
  const isAunsi = panchanga?.tithi?.name?.includes('औंसी') || panchanga?.tithi?.number === 30;
  const tithiMeta = isAunsi ? TITHI_LOOKUP[30] : (TITHI_LOOKUP[tithiNumber] || TITHI_LOOKUP[1]);

  // 2. Vaar enrichment
  const vaarKey = panchanga?.dayNameNepali || panchanga?.vaar?.name || 'आइतबार';
  const vaarMeta = VAAR_LOOKUP[vaarKey] || VAAR_LOOKUP['आइतबार'];

  // 3. Nakshatra enrichment
  const nakshatraName = panchanga?.nakshatra?.name || 'अश्विनी';
  const nakshatraMeta = NAKSHATRA_NATURE_MAP[nakshatraName] || {
    nature: 'मृदु/मैत्र',
    deity: 'शुभ देवता',
    activity: 'दैनिक कार्य'
  };

  // 4. Yoga enrichment
  const yogaName = panchanga?.yoga?.name || 'सिद्धि';
  const isYogaInauspicious = INAUSPICIOUS_YOGAS.has(yogaName);

  // 5. Karana enrichment & Bhadra detection
  const karanaName = panchanga?.karana?.name || 'बव';
  const isFixedKarana = FIXED_KARANAS.has(karanaName);
  const isBhadra = karanaName.includes('विष्टि') || karanaName.includes('भद्रा');

  // Deities, Mantras & Classical Shlokas for all 5 limbs
  const tithiDeity = useMemo(() => getTithiDeityInfo(tithiNumber, panchanga?.tithi?.name || isAunsi), [tithiNumber, panchanga?.tithi?.name, isAunsi]);
  const vaarDeity = useMemo(() => getVaarDeityInfo(panchanga?.dayNameNepali || panchanga?.vaar?.name), [panchanga?.dayNameNepali, panchanga?.vaar?.name]);
  const nakshatraDeity = useMemo(() => getNakshatraDeityInfo(panchanga?.nakshatra?.name), [panchanga?.nakshatra?.name]);
  const yogaDeity = useMemo(() => getYogaDeityInfo(panchanga?.yoga?.name), [panchanga?.yoga?.name]);
  const karanaDeity = useMemo(() => getKaranaDeityInfo(panchanga?.karana?.name), [panchanga?.karana?.name]);

  // In-depth Astrological Explanations & Muhurta Action Guidance for all 5 limbs
  const tithiAnalysis = useMemo(() => getTithiDetailedExplanation(tithiNumber, panchanga?.tithi?.name, panchanga?.tithi?.paksha), [tithiNumber, panchanga?.tithi?.name, panchanga?.tithi?.paksha]);
  const vaarAnalysis = useMemo(() => getVaarDetailedExplanation(panchanga?.dayNameNepali || panchanga?.vaar?.name), [panchanga?.dayNameNepali, panchanga?.vaar?.name]);
  const nakshatraAnalysis = useMemo(() => getNakshatraDetailedExplanation(panchanga?.nakshatra?.name, panchanga?.nakshatra?.pada), [panchanga?.nakshatra?.name, panchanga?.nakshatra?.pada]);
  const yogaAnalysis = useMemo(() => getYogaDetailedExplanation(panchanga?.yoga?.name), [panchanga?.yoga?.name]);
  const karanaAnalysis = useMemo(() => getKaranaDetailedExplanation(panchanga?.karana?.name), [panchanga?.karana?.name]);

  return (
    <div
      aria-label="दैनिक पञ्चाङ्ग पञ्च-अङ्ग द्रुत दृष्टि"
      className={`bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-5 sm:p-6 shadow-sm relative overflow-hidden flex flex-col justify-between transition-all ${className}`}
    >
      {/* Decorative Vedic backdrop accent */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/5 dark:bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E0D5] dark:border-stone-800 pb-3.5 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-500/15 to-orange-500/25 text-[#D97706] dark:text-amber-400 rounded-xl border border-amber-400/30 shrink-0 shadow-2xs">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold font-serif text-[#1A1A1A] dark:text-stone-100">
                आजको पञ्चाङ्ग (पञ्च-अङ्ग द्रुत दृष्टि)
              </h2>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                <Sparkles className="w-2.5 h-2.5" />
                <span>५ मुख्य अङ्ग</span>
              </span>
            </div>
            <p className="text-xs text-[#78716C] dark:text-stone-400 flex flex-wrap items-center gap-1.5 mt-0.5">
              <span className="font-semibold text-[#2D241E] dark:text-stone-200">
                {panchanga?.dateBS}
              </span>
              <span>({panchanga?.dayNameNepali})</span>
              <span className="text-[#D97706] dark:text-amber-400">• {panchanga?.dayNameSanskrit}</span>
              {panchanga?.samvatsara && (
                <span className="hidden sm:inline text-stone-500 dark:text-stone-400">
                  | {panchanga.samvatsara} संवत्सर
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* View Mode Switcher: Radial Chart vs 5-Limbs Cards */}
          <div className="flex items-center p-0.5 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={() => setViewMode('radial')}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'radial'
                  ? 'bg-white dark:bg-stone-700 text-[#D97706] dark:text-amber-300 font-bold shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title="दैनिक पञ्चाङ्गको २४ घण्टे रेडियल चक्र"
            >
              <Compass className="w-3.5 h-3.5 text-amber-500" />
              <span>दैनिक चक्र</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse hidden xs:inline-block" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-stone-700 text-[#D97706] dark:text-amber-300 font-bold shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title="पञ्चाङ्गका ५ अङ्ग कार्डहरू"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>५ अङ्ग कार्ड</span>
            </button>
          </div>

          {/* Detailed Astrological Insights Toggle (relevant in cards view) */}
          {viewMode === 'cards' && (
            <button
              onClick={() => setShowDeepInsight((prev) => !prev)}
              className="text-xs text-stone-600 dark:text-stone-300 hover:text-[#D97706] dark:hover:text-amber-300 bg-stone-100 dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-stone-200 dark:border-stone-700 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="पञ्चाङ्गका ५ अङ्गको शास्त्रीय विश्लेषण देखाउनुहोस् / लुकाउनुहोस्"
            >
              <Info className="w-3.5 h-3.5 text-[#D97706]" />
              <span className="hidden xs:inline">{showDeepInsight ? 'संक्षिप्त' : 'अङ्ग विमर्श'}</span>
              {showDeepInsight ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Full Panchanga Navigation Button */}
          {onNavigate && (
            <button
              onClick={() => onNavigate('panchanga')}
              className="text-xs text-white bg-[#D97706] hover:bg-[#b45309] border border-amber-600 px-3 py-1.5 rounded-xl font-semibold transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <span>पूर्ण पञ्चाङ्ग</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main View: Conditional between Radial Interactive Chart and 5 Core Cards */}
      {viewMode === 'radial' ? (
        <div className="flex-1 my-1">
          <RadialPanchangaChart
            panchanga={panchanga}
            onNavigateToFullPanchanga={onNavigate ? () => onNavigate('panchanga') : undefined}
          />
        </div>
      ) : (
        <>
          {/* The 5 Core Limbs Cards Grid (पञ्चाङ्गका ५ अङ्ग) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 flex-1">
            {/* 1. Tithi Card (तिथि) */}
            <div className="bg-[#FDFCF8] dark:bg-stone-850 border border-[#E6E0D5] dark:border-stone-700/80 p-3 sm:p-3.5 rounded-2xl shadow-2xs flex flex-col justify-between relative group hover:border-amber-400/60 transition-colors space-y-2.5">
              <div className="space-y-2">
                {/* Header Row */}
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] text-[#A8A29E] dark:text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Moon className="w-3 h-3 text-amber-500" />
                    <span>१. तिथि (Tithi)</span>
                  </span>
                  <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-400/40">
                    {tithiMeta.category}
                  </span>
                </div>

                {/* Title & Paksha */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#1A1A1A] dark:text-stone-100 font-serif leading-tight">
                    {panchanga?.tithi?.name || 'प्रतिपदा'}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10.5px]">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                      {panchanga?.tithi?.paksha || 'शुक्ल'} पक्ष
                    </span>
                    <span className="text-stone-400">•</span>
                    <span className="text-stone-600 dark:text-stone-400 font-medium">
                      {tithiMeta.category} तिथि
                    </span>
                  </div>
                </div>

                {/* Deity & Sacred Mantra Box */}
                <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-300/60 dark:border-amber-700/50 flex items-start gap-2 shadow-2xs">
                  <div className="relative shrink-0 w-9 h-9 rounded-full overflow-hidden ring-2 ring-amber-400/70 shadow-xs bg-amber-100 dark:bg-stone-800 flex items-center justify-center">
                    <img
                      src={tithiDeity.image}
                      alt={tithiDeity.deity}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10.5px] font-bold text-amber-950 dark:text-amber-100 leading-tight">
                      {tithiDeity.deity}
                    </div>
                    <div className="text-[9.5px] font-semibold text-amber-800 dark:text-amber-300 leading-snug font-mono mt-0.5">
                      {tithiDeity.mantra}
                    </div>
                    <div className="text-[9px] text-stone-700 dark:text-stone-300 italic font-serif leading-snug mt-0.5">
                      {tithiDeity.shloka}
                    </div>
                  </div>
                </div>

                {/* Astrological Explanation & Muhurta Guidance Box */}
                <div className="p-2 rounded-xl bg-amber-50/70 dark:bg-stone-800/80 border border-amber-200/80 dark:border-stone-700/80 space-y-1.5 text-[10.5px]">
                  <div className="flex items-center gap-1 font-bold text-amber-900 dark:text-amber-300 text-[10px] uppercase tracking-wider">
                    <Info className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>शास्त्रीय फल तथा विमर्श</span>
                  </div>
                  <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-sans text-justify">
                    {tithiAnalysis.explanation}
                  </p>
                  <div className="pt-1 border-t border-amber-200/60 dark:border-stone-700/60 space-y-0.5 text-[10px]">
                    <div className="text-stone-800 dark:text-stone-200 font-medium">
                      <strong className="text-amber-800 dark:text-amber-300 font-bold">🎯 उपयुक्त:</strong> {tithiAnalysis.favorableWork}
                    </div>
                    <div className="text-stone-600 dark:text-stone-400 italic">
                      <strong className="text-stone-700 dark:text-stone-300 font-semibold">💡 सल्लाह:</strong> {tithiAnalysis.keyAdvice}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Row */}
              <div className="pt-2 border-t border-stone-200/70 dark:border-stone-700/70 text-[10.5px] text-stone-600 dark:text-stone-300 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="font-semibold">{panchanga?.tithi?.endTime || 'दिनभर'}</span>
                </div>
                <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-medium">
                  {tithiMeta.effect.split(',')[0]}
                </span>
              </div>
            </div>

            {/* 2. Vara Card (वार) */}
            <div className="bg-[#FDFCF8] dark:bg-stone-850 border border-[#E6E0D5] dark:border-stone-700/80 p-3 sm:p-3.5 rounded-2xl shadow-2xs flex flex-col justify-between relative group hover:border-amber-400/60 transition-colors space-y-2.5">
              <div className="space-y-2">
                {/* Header Row */}
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] text-[#A8A29E] dark:text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sun className="w-3 h-3 text-amber-500" />
                    <span>२. वार (Vara)</span>
                  </span>
                  <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-900 dark:text-orange-200 border border-orange-400/40">
                    {vaarMeta.tattva} तत्त्व
                  </span>
                </div>

                {/* Title & Lord */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#1A1A1A] dark:text-stone-100 font-serif leading-tight">
                    {panchanga?.dayNameNepali || panchanga?.vaar?.name || 'आइतबार'}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10.5px]">
                    <span className="text-orange-700 dark:text-orange-400 font-bold">
                      स्वामी: {panchanga?.vaar?.lord || 'सूर्य'}
                    </span>
                    <span className="text-stone-400">•</span>
                    <span className="text-stone-600 dark:text-stone-400 font-medium">
                      {panchanga?.dayNameSanskrit || 'वासरः'}
                    </span>
                  </div>
                </div>

                {/* Deity & Sacred Mantra Box */}
                <div className="p-2 rounded-xl bg-orange-500/10 dark:bg-orange-400/10 border border-orange-300/60 dark:border-orange-700/50 flex items-start gap-2 shadow-2xs">
                  <div className="relative shrink-0 w-9 h-9 rounded-full overflow-hidden ring-2 ring-orange-400/70 shadow-xs bg-orange-100 dark:bg-stone-800 flex items-center justify-center">
                    <img
                      src={vaarDeity.image}
                      alt={vaarDeity.deity}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10.5px] font-bold text-orange-950 dark:text-orange-100 leading-tight">
                      {vaarDeity.deity}
                    </div>
                    <div className="text-[9.5px] font-semibold text-orange-800 dark:text-orange-300 leading-snug font-mono mt-0.5">
                      {vaarDeity.mantra}
                    </div>
                    <div className="text-[9px] text-stone-700 dark:text-stone-300 italic font-serif leading-snug mt-0.5">
                      {vaarDeity.shloka}
                    </div>
                  </div>
                </div>

                {/* Astrological Explanation & Day Guidance Box */}
                <div className="p-2 rounded-xl bg-orange-50/70 dark:bg-stone-800/80 border border-orange-200/80 dark:border-stone-700/80 space-y-1.5 text-[10.5px]">
                  <div className="flex items-center gap-1 font-bold text-orange-900 dark:text-orange-300 text-[10px] uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-orange-600 dark:text-orange-400 shrink-0" />
                    <span>दिनको शास्त्रीय विमर्श</span>
                  </div>
                  <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-sans text-justify">
                    {vaarAnalysis.explanation}
                  </p>
                  <div className="pt-1 border-t border-orange-200/60 dark:border-stone-700/60 space-y-0.5 text-[10px]">
                    <div className="text-stone-800 dark:text-stone-200 font-medium">
                      <strong className="text-orange-800 dark:text-orange-300 font-bold">🎯 अनुकूल:</strong> {vaarAnalysis.favorableWork}
                    </div>
                    <div className="text-stone-600 dark:text-stone-400 italic">
                      <strong className="text-stone-700 dark:text-stone-300 font-semibold">💡 सल्लाह:</strong> {vaarAnalysis.keyAdvice}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Row */}
              <div className="pt-2 border-t border-stone-200/70 dark:border-stone-700/70 text-[10.5px] text-stone-600 dark:text-stone-300 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500 shrink-0" />
                  <span className="font-semibold">{panchanga?.dayNameSanskrit || 'रविवासरः'}</span>
                </div>
                <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-medium">
                  {vaarMeta.tattva} प्रधान
                </span>
              </div>
            </div>

            {/* 3. Nakshatra Card (नक्षत्र) */}
            <div className="bg-[#FDFCF8] dark:bg-stone-850 border border-[#E6E0D5] dark:border-stone-700/80 p-3 sm:p-3.5 rounded-2xl shadow-2xs flex flex-col justify-between relative group hover:border-amber-400/60 transition-colors space-y-2.5">
              <div className="space-y-2">
                {/* Header Row */}
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] text-[#A8A29E] dark:text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>३. नक्षत्र (Nakshatra)</span>
                  </span>
                  <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-900 dark:text-blue-200 border border-blue-400/40">
                    पाद {panchanga?.nakshatra?.pada || '१'}
                  </span>
                </div>

                {/* Title & Lord */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#1A1A1A] dark:text-stone-100 font-serif leading-tight">
                    {panchanga?.nakshatra?.name || 'अश्विनी'}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10.5px]">
                    <span className="text-blue-700 dark:text-blue-400 font-bold">
                      स्वामी: {panchanga?.nakshatra?.lord || 'केतु'}
                    </span>
                    <span className="text-stone-400">•</span>
                    <span className="text-stone-600 dark:text-stone-400 font-medium">
                      {nakshatraMeta.nature}
                    </span>
                  </div>
                </div>

                {/* Deity & Sacred Mantra Box */}
                <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 border border-blue-300/60 dark:border-blue-700/50 flex items-start gap-2 shadow-2xs">
                  <div className="relative shrink-0 w-9 h-9 rounded-full overflow-hidden ring-2 ring-blue-400/70 shadow-xs bg-blue-100 dark:bg-stone-800 flex items-center justify-center">
                    <img
                      src={nakshatraDeity.image}
                      alt={nakshatraDeity.deity}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10.5px] font-bold text-blue-950 dark:text-blue-100 leading-tight">
                      {nakshatraDeity.deity}
                    </div>
                    <div className="text-[9.5px] font-semibold text-blue-800 dark:text-blue-300 leading-snug font-mono mt-0.5">
                      {nakshatraDeity.mantra}
                    </div>
                    <div className="text-[9px] text-stone-700 dark:text-stone-300 italic font-serif leading-snug mt-0.5">
                      {nakshatraDeity.shloka}
                    </div>
                  </div>
                </div>

                {/* Astrological Explanation & Nakshatra Guidance Box */}
                <div className="p-2 rounded-xl bg-blue-50/70 dark:bg-stone-800/80 border border-blue-200/80 dark:border-stone-700/80 space-y-1.5 text-[10.5px]">
                  <div className="flex items-center gap-1 font-bold text-blue-900 dark:text-blue-300 text-[10px] uppercase tracking-wider">
                    <Info className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>नक्षत्र स्वभाव तथा फल</span>
                  </div>
                  <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-sans text-justify">
                    {nakshatraAnalysis.explanation}
                  </p>
                  <div className="pt-1 border-t border-blue-200/60 dark:border-stone-700/60 space-y-0.5 text-[10px]">
                    <div className="text-stone-800 dark:text-stone-200 font-medium">
                      <strong className="text-blue-800 dark:text-blue-300 font-bold">🎯 उपयुक्त:</strong> {nakshatraAnalysis.favorableWork}
                    </div>
                    <div className="text-stone-600 dark:text-stone-400 italic">
                      <strong className="text-stone-700 dark:text-stone-300 font-semibold">💡 सल्लाह:</strong> {nakshatraAnalysis.keyAdvice}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Row */}
              <div className="pt-2 border-t border-stone-200/70 dark:border-stone-700/70 text-[10.5px] text-stone-600 dark:text-stone-300 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span className="font-semibold">{panchanga?.nakshatra?.endTime || 'दिनभर'}</span>
                </div>
                <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-medium">
                  {nakshatraMeta.nature.split('/')[0]}
                </span>
              </div>
            </div>

            {/* 4. Yoga Card (योग) */}
            <div className="bg-[#FDFCF8] dark:bg-stone-850 border border-[#E6E0D5] dark:border-stone-700/80 p-3 sm:p-3.5 rounded-2xl shadow-2xs flex flex-col justify-between relative group hover:border-amber-400/60 transition-colors space-y-2.5">
              <div className="space-y-2">
                {/* Header Row */}
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] text-[#A8A29E] dark:text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Compass className="w-3 h-3 text-amber-500" />
                    <span>४. योग (Yoga)</span>
                  </span>
                  <span
                    className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded border ${
                      isYogaInauspicious
                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-400/40'
                        : 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-400/40'
                    }`}
                  >
                    {isYogaInauspicious ? 'दोष/सावधानी' : 'शुभ फलदायी'}
                  </span>
                </div>

                {/* Title & Status */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#1A1A1A] dark:text-stone-100 font-serif leading-tight">
                    {panchanga?.yoga?.name || 'सिद्धि'}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10.5px]">
                    <span
                      className={`font-bold ${
                        isYogaInauspicious ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isYogaInauspicious ? 'अशुभ / शान्तिकर्म' : 'उत्तम / मङ्गल कार्य'}
                    </span>
                  </div>
                </div>

                {/* Deity & Sacred Mantra Box */}
                <div
                  className={`p-2 rounded-xl border flex items-start gap-2 shadow-2xs ${
                    isYogaInauspicious
                      ? 'bg-rose-500/10 dark:bg-rose-400/10 border-rose-300/60 dark:border-rose-700/50'
                      : 'bg-emerald-500/10 dark:bg-emerald-400/10 border-emerald-300/60 dark:border-emerald-700/50'
                  }`}
                >
                  <div className="relative shrink-0 w-9 h-9 rounded-full overflow-hidden ring-2 ring-amber-400/70 shadow-xs bg-amber-100 dark:bg-stone-800 flex items-center justify-center">
                    <img
                      src={yogaDeity.image}
                      alt={yogaDeity.deity}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10.5px] font-bold text-stone-900 dark:text-stone-100 leading-tight">
                      {yogaDeity.deity}
                    </div>
                    <div className="text-[9.5px] font-semibold text-amber-800 dark:text-amber-300 leading-snug font-mono mt-0.5">
                      {yogaDeity.mantra}
                    </div>
                    <div className="text-[9px] text-stone-700 dark:text-stone-300 italic font-serif leading-snug mt-0.5">
                      {yogaDeity.shloka}
                    </div>
                  </div>
                </div>

                {/* Astrological Explanation & Yoga Guidance Box */}
                <div
                  className={`p-2 rounded-xl border space-y-1.5 text-[10.5px] ${
                    isYogaInauspicious
                      ? 'bg-rose-50/70 dark:bg-stone-800/80 border-rose-200/80 dark:border-stone-700/80'
                      : 'bg-emerald-50/70 dark:bg-stone-800/80 border-emerald-200/80 dark:border-stone-700/80'
                  }`}
                >
                  <div
                    className={`flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider ${
                      isYogaInauspicious ? 'text-rose-900 dark:text-rose-300' : 'text-emerald-900 dark:text-emerald-300'
                    }`}
                  >
                    <Compass className="w-3 h-3 shrink-0" />
                    <span>योग फल तथा प्रभाव</span>
                  </div>
                  <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-sans text-justify">
                    {yogaAnalysis.explanation}
                  </p>
                  <div className="pt-1 border-t border-stone-200/60 dark:border-stone-700/60 space-y-0.5 text-[10px]">
                    <div className="text-stone-800 dark:text-stone-200 font-medium">
                      <strong className="text-amber-800 dark:text-amber-300 font-bold">🎯 उपयुक्त:</strong> {yogaAnalysis.favorableWork}
                    </div>
                    <div className="text-stone-600 dark:text-stone-400 italic">
                      <strong className="text-stone-700 dark:text-stone-300 font-semibold">💡 सल्लाह:</strong> {yogaAnalysis.keyAdvice}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Row */}
              <div className="pt-2 border-t border-stone-200/70 dark:border-stone-700/70 text-[10.5px] text-stone-600 dark:text-stone-300 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="font-semibold">{panchanga?.yoga?.endTime || 'दिनभर'}</span>
                </div>
                <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-medium">
                  {isYogaInauspicious ? 'दोष विचार' : 'शुभ योग'}
                </span>
              </div>
            </div>

            {/* 5. Karana Card (करण) */}
            <div
              className={`bg-[#FDFCF8] dark:bg-stone-850 border p-3 sm:p-3.5 rounded-2xl shadow-2xs flex flex-col justify-between relative group transition-colors space-y-2.5 ${
                isBhadra
                  ? 'border-rose-400/80 dark:border-rose-700/80 bg-rose-50/40 dark:bg-rose-950/20'
                  : 'border-[#E6E0D5] dark:border-stone-700/80 hover:border-amber-400/60'
              }`}
            >
              <div className="space-y-2">
                {/* Header Row */}
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] text-[#A8A29E] dark:text-stone-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    {isBhadra ? (
                      <AlertTriangle className="w-3 h-3 text-rose-500" />
                    ) : (
                      <ShieldCheck className="w-3 h-3 text-amber-500" />
                    )}
                    <span>५. करण (Karana)</span>
                  </span>
                  <span
                    className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded border ${
                      isBhadra
                        ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-400/40 animate-pulse'
                        : isFixedKarana
                        ? 'bg-stone-500/15 text-stone-700 dark:text-stone-300 border-stone-400/30'
                        : 'bg-teal-500/15 text-teal-800 dark:text-teal-200 border-teal-400/30'
                    }`}
                  >
                    {isBhadra ? 'भद्रा काल' : isFixedKarana ? 'स्थिर' : 'चर'}
                  </span>
                </div>

                {/* Title & Status */}
                <div>
                  <h3
                    className={`text-base sm:text-lg font-black font-serif leading-tight ${
                      isBhadra ? 'text-rose-700 dark:text-rose-300' : 'text-[#1A1A1A] dark:text-stone-100'
                    }`}
                  >
                    {panchanga?.karana?.name || 'बव'}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10.5px]">
                    <span
                      className={`font-bold ${
                        isBhadra
                          ? 'text-rose-600 dark:text-rose-400'
                          : isFixedKarana
                          ? 'text-stone-600 dark:text-stone-400'
                          : 'text-teal-600 dark:text-teal-400'
                      }`}
                    >
                      {isBhadra ? '⚠️ शुभ कार्य वर्जित' : isFixedKarana ? 'स्थिर फलदायी' : 'चर/चलायमान'}
                    </span>
                  </div>
                </div>

                {/* Deity & Sacred Mantra Box */}
                <div
                  className={`p-2 rounded-xl border flex items-start gap-2 shadow-2xs ${
                    isBhadra
                      ? 'bg-rose-500/10 dark:bg-rose-950/40 border-rose-300/60 dark:border-rose-800/40'
                      : 'bg-teal-500/10 dark:bg-teal-400/10 border-teal-300/60 dark:border-teal-700/50'
                  }`}
                >
                  <div className="relative shrink-0 w-9 h-9 rounded-full overflow-hidden ring-2 ring-amber-400/70 shadow-xs bg-amber-100 dark:bg-stone-800 flex items-center justify-center">
                    <img
                      src={karanaDeity.image}
                      alt={karanaDeity.deity}
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10.5px] font-bold text-stone-900 dark:text-stone-100 leading-tight">
                      {karanaDeity.deity}
                    </div>
                    <div className="text-[9.5px] font-semibold text-teal-800 dark:text-teal-300 leading-snug font-mono mt-0.5">
                      {karanaDeity.mantra}
                    </div>
                    <div className="text-[9px] text-stone-700 dark:text-stone-300 italic font-serif leading-snug mt-0.5">
                      {karanaDeity.shloka}
                    </div>
                  </div>
                </div>

                {/* Astrological Explanation & Karana Guidance Box */}
                <div
                  className={`p-2 rounded-xl border space-y-1.5 text-[10.5px] ${
                    isBhadra
                      ? 'bg-rose-50/70 dark:bg-stone-800/80 border-rose-200/80 dark:border-stone-700/80'
                      : 'bg-teal-50/70 dark:bg-stone-800/80 border-teal-200/80 dark:border-stone-700/80'
                  }`}
                >
                  <div
                    className={`flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider ${
                      isBhadra ? 'text-rose-900 dark:text-rose-300' : 'text-teal-900 dark:text-teal-300'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3 shrink-0" />
                    <span>करण फल तथा प्रभाव</span>
                  </div>
                  <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-sans text-justify">
                    {karanaAnalysis.explanation}
                  </p>
                  <div className="pt-1 border-t border-stone-200/60 dark:border-stone-700/60 space-y-0.5 text-[10px]">
                    <div className="text-stone-800 dark:text-stone-200 font-medium">
                      <strong className="text-teal-800 dark:text-teal-300 font-bold">🎯 उपयुक्त:</strong> {karanaAnalysis.favorableWork}
                    </div>
                    <div className="text-stone-600 dark:text-stone-400 italic">
                      <strong className="text-stone-700 dark:text-stone-300 font-semibold">💡 सल्लाह:</strong> {karanaAnalysis.keyAdvice}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Footer Row */}
              <div className="pt-2 border-t border-stone-200/70 dark:border-stone-700/70 text-[10.5px] text-stone-600 dark:text-stone-300 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="font-semibold">{panchanga?.karana?.endTime || 'दिनभर'}</span>
                </div>
                <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-medium">
                  {isBhadra ? 'भद्रा' : isFixedKarana ? 'स्थिर' : 'चर'}
                </span>
              </div>
            </div>
          </div>


      {/* Quick link to Radial view */}
      <div className="mt-3.5 p-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-300/40 dark:border-amber-700/40 text-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-stone-700 dark:text-stone-300 text-[11px] sm:text-xs">
            दिनभरिको तिथि, नक्षत्र र योगको चक्रिय समयावधि हेर्न चाहनुहुन्छ?
          </span>
        </div>
        <button
          type="button"
          onClick={() => setViewMode('radial')}
          className="text-xs text-[#D97706] hover:text-[#b45309] dark:text-amber-400 font-bold flex items-center gap-1 hover:underline cursor-pointer shrink-0"
        >
          <span>दैनिक चक्र हेर्नुहोस्</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Bottom Bar: Auspicious Timings, Solar/Lunar Cycles & Rahukaal */}
      {(showSolarTimings || showRahuAbhijit) && (
        <div className="mt-3.5 pt-3 border-t border-[#E6E0D5] dark:border-stone-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Solar/Lunar Timings */}
          {showSolarTimings && (
            <div className="flex flex-wrap items-center gap-3 text-[#78716C] dark:text-stone-400 text-[11px]">
              <div className="flex items-center gap-1">
                <Sunrise className="w-3.5 h-3.5 text-amber-500" />
                <span>सूर्योदय:</span>
                <strong className="text-[#2D241E] dark:text-stone-200">
                  {panchanga?.sunrise || '०५:४२'}
                </strong>
              </div>
              <div className="flex items-center gap-1">
                <Sunset className="w-3.5 h-3.5 text-orange-500" />
                <span>सूर्यास्त:</span>
                <strong className="text-[#2D241E] dark:text-stone-200">
                  {panchanga?.sunset || '१८:४८'}
                </strong>
              </div>
              {panchanga?.moonrise && (
                <div className="hidden sm:flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5 text-sky-400" />
                  <span>चन्द्रोदय:</span>
                  <strong className="text-[#2D241E] dark:text-stone-200">
                    {panchanga.moonrise}
                  </strong>
                </div>
              )}
            </div>
          )}

          {/* Muhurta Alerts (Rahu Kaal & Abhijit) */}
          {showRahuAbhijit && (
            <div className="flex flex-wrap items-center gap-2 text-[11px] ml-auto">
              {/* Rahukaal Badge */}
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 shadow-2xs"
                title="राहुकालमा कुनै पनि नयाँ तथा शुभ कार्य आरम्भ नगर्नुहोस्"
              >
                <AlertTriangle className="w-3 h-3 text-rose-500" />
                <span className="font-bold">राहुकाल:</span>
                <span>
                  {panchanga?.rahuKaal?.start || '—'} देखि {panchanga?.rahuKaal?.end || '—'}
                </span>
              </div>

              {/* Abhijit Muhurta or Auspicious window */}
              {panchanga?.abhijitMuhurta ? (
                <div
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 shadow-2xs"
                  title="दिनको सर्वोत्कृष्ट शुभ अभिजित मुहूर्त"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span className="font-bold">अभिजित:</span>
                  <span>
                    {panchanga.abhijitMuhurta.start} - {panchanga.abhijitMuhurta.end}
                  </span>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-1 text-stone-500 dark:text-stone-400 text-[11px]">
                  <span>ऋतु: <strong className="text-stone-700 dark:text-stone-300">{panchanga?.ritu || 'वसन्त'}</strong></span>
                  <span>•</span>
                  <span>अयन: <strong className="text-stone-700 dark:text-stone-300">{panchanga?.ayana || 'उत्तरायण'}</strong></span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Expandable Astrological Deep Insight Drawer */}
      {showDeepInsight && (
        <div className="mt-4 pt-3.5 border-t border-dashed border-[#E6E0D5] dark:border-stone-800 bg-amber-50/50 dark:bg-stone-800/40 p-3.5 rounded-xl space-y-2 text-xs text-[#2D241E] dark:text-stone-200 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
            <span>आजको पञ्च-अङ्ग शास्त्रीय विमर्श (Classical Limbs Analysis)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1 text-[11px] leading-relaxed">
            <div className="p-2 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
              <strong className="text-[#D97706] block mb-0.5">१. तिथि प्रभाव ({tithiMeta.category}):</strong>
              <span>{tithiMeta.effect}। अधिष्ठात्री देवता {tithiDeity.deity} हुन्। मन्त्र: <em>{tithiDeity.mantra}</em>।</span>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 italic mt-1 font-serif">श्लोक: {tithiDeity.shloka}</p>
            </div>

            <div className="p-2 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
              <strong className="text-[#D97706] block mb-0.5">२. वार साधना ({panchanga?.dayNameNepali}):</strong>
              <span>{vaarMeta.favorableAction}। मन्त्र: <em>{vaarDeity.mantra}</em>।</span>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 italic mt-1 font-serif">श्लोक: {vaarDeity.shloka}</p>
            </div>

            <div className="p-2 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
              <strong className="text-[#D97706] block mb-0.5">३. नक्षत्र शक्ति ({nakshatraName}):</strong>
              <span>{nakshatraMeta.nature} नक्षत्र। अधिष्ठाता {nakshatraDeity.deity}। {nakshatraMeta.activity}का लागि उपयुक्त।</span>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 italic mt-1 font-serif">श्लोक: {nakshatraDeity.shloka}</p>
            </div>

            <div className="p-2 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
              <strong className="text-[#D97706] block mb-0.5">४. योग फलादेश ({yogaName}):</strong>
              <span>
                {isYogaInauspicious
                  ? 'यो योग सामान्यतया प्रतिकूल मानिन्छ; महत्त्वपूर्ण कार्यमा सावधानी वा ईश्वर आराधना गर्नुहोस्।'
                  : 'यो योग शुभ र मनोरथ सिद्ध गर्ने मानिन्छ; नवीन उद्यमका लागि उपयुक्त समय हो।'} अधिष्ठाता {yogaDeity.deity}।
              </span>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 italic mt-1 font-serif">श्लोक: {yogaDeity.shloka}</p>
            </div>

            <div className="p-2 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 sm:col-span-2 lg:col-span-2">
              <strong className="text-[#D97706] block mb-0.5">५. करण मार्गदर्शन ({karanaName}):</strong>
              <span>
                {isBhadra
                  ? '⚠️ विष्टि करण (भद्रा) परेकाले शुभ माङ्गलिक कर्म, यात्रा तथा शिलान्यास नगर्नुहोस्। तन्त्र तथा रक्षाकर्म मात्र उपयुक्त छ।'
                  : `${karanaName} करण अनुकूल रहेको छ। दैनिक लौकिक तथा व्यावसायिक कार्यहरू सहज रूपमा सम्पादन गर्न सकिन्छ।`} अधिष्ठाता {karanaDeity.deity}।
              </span>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 italic mt-1 font-serif">श्लोक: {karanaDeity.shloka}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )}
</div>
  );
});

DashboardWidget.displayName = 'DashboardWidget';
