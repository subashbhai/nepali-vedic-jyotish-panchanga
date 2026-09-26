import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Compass,
  Flame,
  ArrowRight,
  Sun,
  ShieldCheck,
  Calendar,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { PanchangaData } from '../../types/astrology';

interface VedicInsightWidgetProps {
  panchanga: PanchangaData;
  onNavigate?: (tab: string) => void;
}

// Direction Shoola by Weekday
const DISHA_SHOOLA_MAP: Record<string, { direction: string; parihar: string; description: string }> = {
  'आइतबार': {
    direction: 'पश्चिम (West)',
    parihar: 'यात्रा गर्नै परे दलिया, घिउ वा पान खाएर प्रस्थान गर्नुहोस्।',
    description: 'आइतबार पश्चिम दिशामा दिशाशूल मानिन्छ।'
  },
  'सोमबार': {
    direction: 'पूर्व (East)',
    parihar: 'यात्रा गर्नै परे ऐना हेरेर वा दूध पिएर प्रस्थान गर्नुहोस्।',
    description: 'सोमबार पूर्व दिशामा दिशाशूल मानिन्छ।'
  },
  'मंगलबार': {
    direction: 'उत्तर (North)',
    parihar: 'यात्रा गर्नै परे गुड (सख्खर) वा धनियाँ खाएर प्रस्थान गर्नुहोस्।',
    description: 'मंगलबार उत्तर दिशामा दिशाशूल मानिन्छ।'
  },
  'बुधबार': {
    direction: 'उत्तर (North)',
    parihar: 'यात्रा गर्नै परे तिल वा हरियो साग खाएर प्रस्थान गर्नुहोस्।',
    description: 'बुधबार उत्तर दिशामा दिशाशूल मानिन्छ।'
  },
  'बिहीबार': {
    direction: 'दक्षिण (South)',
    parihar: 'यात्रा गर्नै परे दही वा पहेँलो सर्स्युँ खाएर प्रस्थान गर्नुहोस्।',
    description: 'बिहीबार दक्षिण दिशामा दिशाशूल मानिन्छ।'
  },
  'शुक्रबार': {
    direction: 'पश्चिम (West)',
    parihar: 'यात्रा गर्नै परे जौ वा दही खाएर प्रस्थान गर्नुहोस्।',
    description: 'शुक्रबार पश्चिम दिशामा दिशाशूल मानिन्छ।'
  },
  'शनिबार': {
    direction: 'पूर्व (East)',
    parihar: 'यात्रा गर्नै परे अदुवा वा मासको गेडा खाएर प्रस्थान गर्नुहोस्।',
    description: 'शनिबार पूर्व दिशामा दिशाशूल मानिन्छ।'
  },
};

// Vaar Deities & Mantras
const VAAR_MANTRAS: Record<string, { deity: string; mantra: string; color: string; focus: string }> = {
  'आइतबार': {
    deity: 'भगवान् सूर्य नारायण',
    mantra: 'ॐ घृणिः सूर्याय नमः',
    color: 'रातो / केसरी',
    focus: 'मान-सम्मान, नेतृत्व क्षमता, सरकारी काम र आरोग्य वृद्धि'
  },
  'सोमबार': {
    deity: 'देवाधिदेव महादेव / चन्द्रदेव',
    mantra: 'ॐ नमः शिवाय / ॐ सोमाय नमः',
    color: 'सेतो / सिल्भर',
    focus: 'मानसिक शान्ति, पारिवारिक सौहार्द र जल सम्बन्धी कार्य'
  },
  'मंगलबार': {
    deity: 'श्री हनुमान् / मंगलदेव',
    mantra: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः / ॐ हं हनुमते नमः',
    color: 'गाढा रातो / सिन्दूरे',
    focus: 'साहस, पराक्रम, ऋणमुक्ति, जग्गाजमिन र भाइ-बन्धु सम्बन्ध'
  },
  'बुधबार': {
    deity: 'भगवान् गणेश / बुधदेव',
    mantra: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः / ॐ गं गणपतये नमः',
    color: 'हरियो',
    focus: 'बुद्धि, वाणिज्य-व्यापार, अध्ययन, लेखन र सञ्चार सफलता'
  },
  'बिहीबार': {
    deity: 'श्रीहरि विष्णु / देवगुरु बृहस्पति',
    mantra: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः / ॐ नमो भगवते वासुदेवाय',
    color: 'पहेँलो',
    focus: 'ज्ञान, धर्म-कर्म, सन्तान सुख, उच्च शिक्षा र गुरु कृपा'
  },
  'शुक्रबार': {
    deity: 'भगवती महालक्ष्मी / शुक्रदेव',
    mantra: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः / ॐ श्रीं महालक्ष्म्यै नमः',
    color: 'गुलाबी / चम्किलो सेतो',
    focus: 'धन-सम्पत्ति, ऐश्वर्य, कला, सौन्दर्य र दाम्पत्य सुख'
  },
  'शनिबार': {
    deity: 'शनिदेव / कालभैरव',
    mantra: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः / ॐ शं शनैश्चराय नमः',
    color: 'कालो / गाढा नीलो',
    focus: 'अनुशासन, न्याय, दीर्घायु, स्थिर सम्पत्ति र कर्म साधना'
  },
};

export const VedicInsightWidget: React.FC<VedicInsightWidgetProps> = ({
  panchanga,
  onNavigate
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'insight' | 'choghadiya' | 'caution' | 'shoola'>('insight');

  const dayName = panchanga.dayNameNepali || 'आइतबार';
  const vaarInfo = VAAR_MANTRAS[dayName] || VAAR_MANTRAS['आइतबार'];
  const shoolaInfo = DISHA_SHOOLA_MAP[dayName] || DISHA_SHOOLA_MAP['आइतबार'];

  // Identify Current Active Choghadiya based on current time
  const currentChoghadiyaInfo = useMemo(() => {
    const chList = panchanga.choghadiya || [];
    if (chList.length === 0) {
      return {
        active: null,
        next: null,
        statusText: 'शुभ कार्यका लागि अमृत वा शुभ चौघडिया उत्तम हुन्छ।'
      };
    }

    // Default to the first auspicious one or the first one if time parsing is simple
    const now = new Date();
    const currentHours = now.getHours() + now.getMinutes() / 60;
    
    // Find best match or current index
    // Approximate daytime 6 AM to 6 PM into 8 equal slots
    let slotIndex = 0;
    if (currentHours >= 6 && currentHours < 18) {
      slotIndex = Math.min(Math.floor(((currentHours - 6) / 12) * 8), 7);
    } else {
      slotIndex = 0;
    }

    const active = chList[slotIndex] || chList[0];
    const next = chList[(slotIndex + 1) % chList.length];

    return {
      active,
      next,
      slotIndex
    };
  }, [panchanga.choghadiya]);

  // Derive Daily Vedic Guidance based on Tithi, Nakshatra & Yoga
  const dailyGuidance = useMemo(() => {
    const tithi = panchanga.tithi.name;
    const paksha = panchanga.tithi.paksha;
    const nakshatra = panchanga.nakshatra.name;
    const yoga = panchanga.yoga.name;

    const insights: {
      highlight: string;
      auspiciousFor: string[];
      avoidFor: string[];
      recommendation: string;
    } = {
      highlight: `आज ${paksha} पक्षको ${tithi} तिथि तथा ${nakshatra} नक्षत्र रहेको छ।`,
      auspiciousFor: [],
      avoidFor: [],
      recommendation: ''
    };

    // Tithi specific guidance
    if (tithi.includes('एकादशी')) {
      insights.highlight = `आज पवित्र ${paksha} पक्षको एकादशी तिथि हो। हरि भजन तथा व्रतका लागि सर्वोत्तम दिन।`;
      insights.auspiciousFor.push('व्रत-उपवास, ध्यान-साधना, दान-पुण्य, भगवत् आराधना');
      insights.avoidFor.push('अन्न (विशेष गरी चामल) भोजन, कलह, तामसिक भोजन');
      insights.recommendation = 'श्रीहरि विष्णुको सहस्रनाम वा द्वादशाक्षर मन्त्रको जप गर्नुहोस्। नयाँ आध्यात्मिक सङ्कल्पका लागि निकै उत्तम समय हो।';
    } else if (tithi.includes('पूर्णिमा')) {
      insights.highlight = 'आज पूर्ण चन्द्रमा (पूर्णिमा) को महापुण्यदायक तिथि हो।';
      insights.auspiciousFor.push('सत्यनारायण पूजा, चन्द्र अर्घ्य, महालक्ष्मी साधना, मन्त्र सिद्धि');
      insights.avoidFor.push('अति भावुकता, शल्यक्रिया वा अनावश्यक विवाद');
      insights.recommendation = 'सन्ध्याकालमा चन्द्रमालाई दूध मिश्रित जल अर्घ्य दिनुहोस्, यसले मानसिक शान्ति र आर्थिक समृद्धि दिलाउँछ।';
    } else if (tithi.includes('औंसी') || tithi.includes('दर्शावस्या')) {
      insights.highlight = 'आज दर्श अमावस्या (औंसी) तिथि हो। पितृ तर्पण तथा दानका लागि उत्तम दिन।';
      insights.auspiciousFor.push('पितृ तर्पण, श्राद्ध, दान-दक्षिणा, आत्मनिरीक्षण, कुलदेवता पूजा');
      insights.avoidFor.push('नयाँ गृहप्रवेश, विवाह, नयाँ व्यापार शुभारम्भ वा ठूलो भौतिक लगानी');
      insights.recommendation = 'पितृहरूको स्मरण गर्दै पिपलको रुखमा जल चढाउनुहोस् र असहायलाई भोजन वा वस्त्र दान गर्नुहोस्।';
    } else if (tithi.includes('पञ्चमी') || tithi.includes('दशमी')) {
      insights.highlight = `आज पूर्णा संज्ञक शुभ ${tithi} तिथि हो। सबै प्रकारका रचनात्मक कार्य फलदायी हुन्छन्।`;
      insights.auspiciousFor.push('विद्यारम्भ, व्यापार सम्झौता, यात्रा, नयाँ वस्त्र आभूषण धारण');
      insights.avoidFor.push('अहंकार, व्यर्थको बहस');
      insights.recommendation = 'आज सुरु गरिएको व्यापारिक तथा शैक्षिक कार्यमा दीर्घकालीन सफलता प्राप्त हुने शास्त्रोक्त वचन छ।';
    } else if (tithi.includes('चतुर्थी') || tithi.includes('नवमी') || tithi.includes('चतुर्दशी')) {
      insights.highlight = `आज रिक्त/उग्र संज्ञक ${tithi} तिथि हो। संयम र सतर्कता अपनाउनु पर्ने समय।`;
      insights.auspiciousFor.push('अग्नि कार्य, तान्त्रिक साधना, शत्रु निवारण, सरसफाइ र बाधा शान्ति');
      insights.avoidFor.push('नयाँ व्यापार थालनी, विवाह सम्झौता, नयाँ घर सर्ने काम');
      insights.recommendation = 'भगवान् गणेश अथवा भैरवनाथको आराधना गरी कार्य अघि बढाएमा सबै व्यवधान हट्नेछन्।';
    } else {
      insights.auspiciousFor.push('नित्य कर्म, आर्थिक योजना, परामर्श, अध्ययन तथा पारिवारिक भेटघाट');
      insights.avoidFor.push('राहुकालको समयमा नयाँ कामको थालनी');
      insights.recommendation = `आज ${vaarInfo.deity}को ध्यान गरी ${vaarInfo.mantra} मन्त्रको स्मरण गर्दा कार्यसिद्धि मिल्नेछ।`;
    }

    // Nakshatra enrichment
    if (['रोहिणी', 'पुष्य', 'अश्विनी', 'हस्त', 'अनुराधा', 'स्वाती', 'रेवती'].includes(nakshatra)) {
      insights.auspiciousFor.push(`${nakshatra} नक्षत्रका कारण व्यापार, किनमेल र यात्रा शुभ`);
    }

    return insights;
  }, [panchanga, vaarInfo]);

  const chTypeColor = (type: string) => {
    if (type === 'शुभ') return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700';
    if (type === 'सामान्य') return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700';
    return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700';
  };

  return (
    <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-stone-50 dark:from-stone-900 dark:via-stone-900/90 dark:to-stone-950 rounded-2xl border border-amber-200/80 dark:border-stone-800 p-4 sm:p-5 shadow-sm relative overflow-hidden transition-all shrink-0">
      {/* Background Subtle Mandala Effect */}
      <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-amber-500/5 dark:bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/60 dark:border-stone-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-tr from-amber-600 to-amber-500 text-white rounded-xl shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold font-serif text-[#2D241E] dark:text-amber-100 flex items-center gap-1.5">
                <span>आजको वैदिक मार्गदर्शन</span>
                <span className="text-[10px] bg-amber-500/15 text-[#D97706] dark:text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                  {panchanga.dayNameNepali}
                </span>
              </h2>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-stone-400">
              पञ्चाङ्ग, चौघडिया तथा राहुकालमा आधारित दैनिक ज्योतिषीय सल्लाह
            </p>
          </div>
        </div>

        {/* Quick Highlights Pill Buttons & Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Rahu Kaal Quick Alert Tag */}
          <div className="inline-flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 px-2.5 py-1 rounded-xl text-rose-700 dark:text-rose-300 text-[11px] font-bold shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="hidden sm:inline font-medium text-rose-900 dark:text-rose-200">राहुकाल:</span>
            <span>{panchanga.rahuKaal.start} - {panchanga.rahuKaal.end}</span>
          </div>

          {/* Abhijit Muhurta Quick Alert Tag */}
          <div className="hidden md:inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-2.5 py-1 rounded-xl text-emerald-700 dark:text-emerald-300 text-[11px] font-bold shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="font-medium text-emerald-900 dark:text-emerald-200">अभिजीत:</span>
            <span>{panchanga.abhijitMuhurta.start} - {panchanga.abhijitMuhurta.end}</span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 bg-white dark:bg-stone-800 border border-amber-200/60 dark:border-stone-700 rounded-xl transition-colors cursor-pointer ml-1"
            title={isExpanded ? 'संकुचित गर्नुहोस्' : 'विस्तार गर्नुहोस्'}
            aria-label="Toggle widget expansion"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="pt-3.5 space-y-3.5">
          {/* Navigation Tabs for Insights */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-amber-100/40 dark:bg-stone-800/60 rounded-xl border border-amber-200/40 dark:border-stone-700/60">
            <button
              onClick={() => setActiveTab('insight')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'insight'
                  ? 'bg-white dark:bg-stone-700 text-[#7A1C1C] dark:text-amber-300 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>आजको विशेष सूत्र</span>
            </button>

            <button
              onClick={() => setActiveTab('choghadiya')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'choghadiya'
                  ? 'bg-white dark:bg-stone-700 text-[#7A1C1C] dark:text-amber-300 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>चौघडिया समय</span>
            </button>

            <button
              onClick={() => setActiveTab('caution')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'caution'
                  ? 'bg-white dark:bg-stone-700 text-[#7A1C1C] dark:text-amber-300 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>राहुकाल र बार्ने समय</span>
            </button>

            <button
              onClick={() => setActiveTab('shoola')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'shoola'
                  ? 'bg-white dark:bg-stone-700 text-[#7A1C1C] dark:text-amber-300 shadow-2xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>दिशा शूल र मन्त्र</span>
            </button>
          </div>

          {/* Tab 1: Today's Insight & Practical Guidance */}
          {activeTab === 'insight' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Main Recommendation Banner */}
              <div className="md:col-span-2 bg-white dark:bg-stone-800/90 rounded-xl p-3.5 sm:p-4 border border-amber-200/60 dark:border-stone-700 space-y-2.5">
                <div className="flex items-start gap-2">
                  <div className="p-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-lg shrink-0 mt-0.5">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                      {dailyGuidance.highlight}
                    </h3>
                    <p className="text-[11.5px] text-stone-600 dark:text-stone-300 leading-relaxed mt-1">
                      {dailyGuidance.recommendation}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 p-2.5 rounded-lg">
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      आज गर्न शुभ कार्यहरू:
                    </span>
                    <ul className="text-[11px] text-emerald-900/90 dark:text-emerald-200/90 mt-1 space-y-0.5 list-disc list-inside">
                      {dailyGuidance.auspiciousFor.map((item, i) => (
                        <li key={i} className="leading-tight">{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 p-2.5 rounded-lg">
                    <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      सावधानी अपनाउनु पर्ने विषय:
                    </span>
                    <ul className="text-[11px] text-rose-900/90 dark:text-rose-200/90 mt-1 space-y-0.5 list-disc list-inside">
                      {dailyGuidance.avoidFor.map((item, i) => (
                        <li key={i} className="leading-tight">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Day Lord & Blessing Card */}
              <div className="bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-xl p-3.5 sm:p-4 shadow-sm flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between text-amber-200 text-[11px] font-semibold border-b border-amber-500/50 pb-1.5 mb-2">
                    <span>वार स्वामी तथा मन्त्र साधना</span>
                    <Flame className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1">
                    <span>{vaarInfo.deity}</span>
                  </h4>
                  <p className="text-[11px] text-amber-100 mt-1">
                    शुभ रङ: <strong className="text-white">{vaarInfo.color}</strong>
                  </p>
                  <p className="text-[11px] text-amber-100/90 mt-0.5">
                    केन्द्रित फल: <span>{vaarInfo.focus}</span>
                  </p>
                </div>

                <div className="bg-black/20 rounded-lg p-2 border border-white/10 mt-2">
                  <span className="text-[10px] text-amber-200 uppercase font-semibold block">दैनिक जप मन्त्र:</span>
                  <span className="text-xs font-bold text-amber-100 tracking-wide block mt-0.5 font-serif">
                    {vaarInfo.mantra}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Choghadiya Real-Time Tracker */}
          {activeTab === 'choghadiya' && (
            <div className="bg-white dark:bg-stone-800/90 rounded-xl p-3.5 sm:p-4 border border-amber-200/60 dark:border-stone-700 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-700 pb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#D97706]" />
                  <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                    दिवा चौघडिया तालिका (८ खण्डहरू)
                  </span>
                </div>
                <span className="text-[11px] text-stone-500">
                  * शुभ, लाभ, अमृत चौघडियामा नयाँ काम थाल्नु सर्वोत्कृष्ट मानिन्छ
                </span>
              </div>

              {/* Choghadiya 8 Slots Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {(panchanga.choghadiya || []).map((ch, idx) => {
                  const isCurrent = currentChoghadiyaInfo.active?.name === ch.name && currentChoghadiyaInfo.active?.time === ch.time;
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all text-center relative ${
                        isCurrent
                          ? 'ring-2 ring-[#D97706] shadow-sm scale-[1.02] bg-amber-50/90 dark:bg-amber-950/60 border-amber-400'
                          : 'bg-stone-50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      {isCurrent && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#D97706] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-tighter shadow-xs">
                          वर्तमान
                        </span>
                      )}
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block ${chTypeColor(ch.type)}`}>
                          {ch.type}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">
                          {ch.name}
                        </h4>
                      </div>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-1 leading-tight">
                        {ch.time}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-stone-600 dark:text-stone-400">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <strong>शुभ/लाभ/अमृत:</strong> उत्तम फलदायी
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    <strong>चर:</strong> चलायमान यात्रा कार्य
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    <strong>काल/रोग/उद्वेग:</strong> बार्ने समय
                  </span>
                </div>

                {onNavigate && (
                  <button
                    onClick={() => onNavigate('panchanga')}
                    className="text-[#D97706] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>पञ्चाङ्गमा विस्तृत हेर्नुहोस्</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Rahukaal, Yamaganda, Gulika & Inauspicious Awareness */}
          {activeTab === 'caution' && (
            <div className="bg-white dark:bg-stone-800/90 rounded-xl p-3.5 sm:p-4 border border-amber-200/60 dark:border-stone-700 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Rahu Kaal Box */}
                <div className="p-3.5 bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-rose-700 dark:text-rose-300">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      राहुकाल (बार्ने समय)
                    </span>
                    <span className="text-[10px] bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 px-2 py-0.5 rounded font-bold">
                      अति वर्जित
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-rose-900 dark:text-rose-100">
                    {panchanga.rahuKaal.start} देखि {panchanga.rahuKaal.end} सम्म
                  </div>
                  <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80 leading-relaxed">
                    यस समयमा कुनै पनि नयाँ काम, व्यापार सम्झौता, यात्रा वा शुभ संस्कारको प्रारम्भ नगर्नुहोस्।
                  </p>
                </div>

                {/* Yamaganda Box */}
                <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-amber-800 dark:text-amber-300">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      यमगण्ड काल
                    </span>
                    <span className="text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded font-bold">
                      मध्यम वर्जित
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-amber-900 dark:text-amber-100">
                    {panchanga.yamaganda.start} देखि {panchanga.yamaganda.end} सम्म
                  </div>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
                    मृत्युतुल्य कष्ट वा असफलता निवारणका लागि यस कालमा महत्त्वपूर्ण यात्रा वा लगानी निषेध मानिन्छ।
                  </p>
                </div>

                {/* Gulika Kaal Box */}
                <div className="p-3.5 bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-700 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-stone-700 dark:text-stone-300">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      गुलिक काल
                    </span>
                    <span className="text-[10px] bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-300 px-2 py-0.5 rounded font-bold">
                      सामान्य
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                    {panchanga.gulika.start} देखि {panchanga.gulika.end} सम्म
                  </div>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                    शनि पुत्र मानिने गुलिक कालमा गरिएको काम दोहोरिने सम्भावना रहन्छ, त्यसैले शुभ कार्यमा बार्नु उपयुक्त हुन्छ।
                  </p>
                </div>
              </div>

              {/* Auspicious Abhijit & Brahma Muhurta Counters */}
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">
                    आजको सर्वकार्य सिद्धिदायक अभिजीत मुहूर्त: {panchanga.abhijitMuhurta.start} देखि {panchanga.abhijitMuhurta.end}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  राहुकालका दोषहरू पनि अभिजीत मुहूर्तको प्रभावले निष्प्रभावी हुन्छन्।
                </span>
              </div>
            </div>
          )}

          {/* Tab 4: Disha Shoola & Travel Wisdom */}
          {activeTab === 'shoola' && (
            <div className="bg-white dark:bg-stone-800/90 rounded-xl p-3.5 sm:p-4 border border-amber-200/60 dark:border-stone-700 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#FAF8F5] dark:bg-stone-900/60 border border-amber-200/60 dark:border-stone-700 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-xs sm:text-sm">
                    <Compass className="w-4 h-4 text-cyan-600" />
                    <span>आजको दिशा शूल (Travel Restriction):</span>
                  </div>
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg">
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-300 block">
                      निषेधित दिशा: {shoolaInfo.direction}
                    </span>
                    <p className="text-[11px] text-rose-800/90 dark:text-rose-200/90 mt-0.5">
                      {shoolaInfo.description}
                    </p>
                  </div>
                  <div className="text-[11.5px] text-stone-700 dark:text-stone-300">
                    <strong className="text-stone-900 dark:text-stone-100 font-semibold">अति आवश्यक यात्रा उपाय (परिहार): </strong>
                    <span>{shoolaInfo.parihar}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] dark:bg-stone-900/60 border border-amber-200/60 dark:border-stone-700 rounded-xl space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-xs sm:text-sm">
                      <Sun className="w-4 h-4 text-amber-600" />
                      <span>चन्द्रमाको गोचर तथा वास:</span>
                    </div>
                    <div className="mt-2 text-xs text-stone-700 dark:text-stone-300 space-y-1">
                      <p>
                        आज चन्द्रमा <strong className="text-[#D97706] font-bold">{panchanga.moonRashi}</strong> राशिमा विचरण गर्दै हुनुहुन्छ।
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        सम्मुख वा दायाँ चन्द्रमा कार्य सिद्धिका लागि सर्वाधिक लाभदायक मानिन्छ।
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex items-center justify-between text-[11px]">
                    <span className="text-stone-500">ऋतु: <strong>{panchanga.ritu}</strong> | अयन: <strong>{panchanga.ayana}</strong></span>
                    {onNavigate && (
                      <button
                        onClick={() => onNavigate('muhurta')}
                        className="text-[#D97706] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>मुहूर्त तालिका हेर्नुहोस् →</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
