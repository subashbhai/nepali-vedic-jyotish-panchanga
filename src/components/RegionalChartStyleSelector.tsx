import React, { useState } from 'react';
import {
  Compass,
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sparkles,
  RotateCw,
  RotateCcw,
  Layers
} from 'lucide-react';

export type RegionalChartStyle = 'North Indian' | 'South Indian' | 'East Indian';

interface RegionalChartStyleSelectorProps {
  currentStyle: RegionalChartStyle;
  onSelectStyle: (style: RegionalChartStyle) => void;
  className?: string;
  showGuideToggle?: boolean;
}

export const RegionalChartStyleSelector: React.FC<RegionalChartStyleSelectorProps> = ({
  currentStyle,
  onSelectStyle,
  className = '',
  showGuideToggle = true,
}) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const STYLES_CONFIG = [
    {
      id: 'North Indian' as RegionalChartStyle,
      titleNepali: 'उत्तर भारतीय',
      titleEnglish: 'North Indian (Diamond)',
      subtitle: 'पारम्परिक हीरक कुण्डली',
      structure: 'भाव स्थिर (Fixed Houses)',
      direction: 'वामावर्त (Counter-Clockwise)',
      directionIcon: RotateCcw,
      region: 'नेपाल, उत्तर भारत, कश्मीर',
      description:
        '१२ भावहरू (१ देखि १२) सधैँ स्थिर स्थानमा रहन्छन्। लग्न (भाव १) सधैँ माथिल्लो हीरक (Diamond) मा रहन्छ र राशिहरू लग्न अनुसार वामावर्त सर्छन्।',
      diagramSvg: (
        <svg viewBox="0 0 100 100" className="w-12 h-12 stroke-current fill-none stroke-[1.8]">
          <rect x="5" y="5" width="90" height="90" className="stroke-stone-700 dark:stroke-stone-300 stroke-[2]" />
          <line x1="5" y1="5" x2="95" y2="95" className="stroke-stone-500 dark:stroke-stone-400 stroke-1" />
          <line x1="95" y1="5" x2="5" y2="95" className="stroke-stone-500 dark:stroke-stone-400 stroke-1" />
          <polygon points="50,5 95,50 50,95 5,50" className="stroke-amber-600 dark:stroke-amber-400 stroke-[2] fill-amber-500/10" />
          <circle cx="50" cy="27" r="4" className="fill-red-600 stroke-none" />
          <text x="50" y="30" className="text-[7px] font-bold fill-red-600 stroke-none text-anchor-middle" textAnchor="middle">
            ल
          </text>
        </svg>
      ),
    },
    {
      id: 'South Indian' as RegionalChartStyle,
      titleNepali: 'दक्षिण भारतीय',
      titleEnglish: 'South Indian (Square Grid)',
      subtitle: 'चौकोश स्थिर राशि चक्र',
      structure: 'राशि स्थिर (Fixed Rashis)',
      direction: 'दक्षिणावर्त (Clockwise)',
      directionIcon: RotateCw,
      region: 'दक्षिण भारत (केरल, तमिलनाडु, कर्नाटक)',
      description:
        '१२ राशिहरू ४×४ चौकोश ग्रिडमा सधैँ स्थिर रहन्छन् (मीन माथि-बायाँ, मेष त्यसपछि दायाँ)। लग्न (Ascendant) लाई विकर्ण रेखा वा (ल) ले जनाइन्छ र भावहरू घडीको सुई दिशामा घुम्छन्।',
      diagramSvg: (
        <svg viewBox="0 0 100 100" className="w-12 h-12 stroke-current fill-none stroke-[1.8]">
          <rect x="5" y="5" width="90" height="90" className="stroke-stone-700 dark:stroke-stone-300 stroke-[2]" />
          {/* Vertical grid lines */}
          <line x1="27.5" y1="5" x2="27.5" y2="95" className="stroke-stone-500 dark:stroke-stone-400 stroke-1" />
          <line x1="50" y1="5" x2="50" y2="27.5" className="stroke-stone-500 dark:stroke-stone-400 stroke-1" />
          <line x1="50" y1="72.5" x2="50" y2="95" className="stroke-stone-500 dark:stroke-stone-400 stroke-1" />
          <line x1="72.5" y1="5" x2="72.5" y2="95" className="stroke-stone-500 dark:stroke-stone-400 stroke-1" />
          {/* Horizontal grid lines */}
          <line x1="5" y1="27.5" x2="95" y2="27.5" className="stroke-stone-500 dark:stroke-stone-400 stroke-1" />
          <line x1="5" y1="50" x2="27.5" y2="50" className="stroke-stone-500 dark:stroke-stone-400 stroke-1" />
          <line x1="72.5" y1="50" x2="95" y2="50" className="stroke-stone-500 dark:stroke-stone-400 stroke-1" />
          <line x1="5" y1="72.5" x2="95" y2="72.5" className="stroke-stone-500 dark:stroke-stone-400 stroke-1" />
          {/* Center 2x2 box */}
          <rect x="27.5" y="27.5" width="45" height="45" className="fill-amber-500/10 stroke-amber-600 dark:stroke-amber-400 stroke-[1.5]" />
          {/* Aries box (col 1, row 0) slash */}
          <line x1="27.5" y1="5" x2="50" y2="27.5" className="stroke-red-600 stroke-[2]" />
          <text x="38" y="19" className="text-[6.5px] font-bold fill-red-600 stroke-none" textAnchor="middle">
            ल
          </text>
        </svg>
      ),
    },
    {
      id: 'East Indian' as RegionalChartStyle,
      titleNepali: 'पूर्वी भारतीय',
      titleEnglish: 'East Indian (Surya Chakra)',
      subtitle: 'सूर्य चक्र / बङ्गाली शैली',
      structure: 'राशि स्थिर (Fixed Rashis)',
      direction: 'वामावर्त (Counter-Clockwise)',
      directionIcon: RotateCcw,
      region: 'पूर्व नेपाल, बङ्गाल, मिथिला, ओडिशा, असम',
      description:
        '१२ राशिहरू सधैँ स्थिर रहन्छन् (मेष सधैँ माथिल्लो कोष्ठमा)। लग्न जहाँ पर्छ, त्यो भाव १ हुन्छ र भावहरू वामावर्त (घडीको विपरीत) दिशामा गणना गरिन्छ।',
      diagramSvg: (
        <svg viewBox="0 0 100 100" className="w-12 h-12 stroke-current fill-none stroke-[1.8]">
          <rect x="5" y="5" width="90" height="90" className="stroke-stone-700 dark:stroke-stone-300 stroke-[2]" />
          <line x1="5" y1="5" x2="95" y2="95" className="stroke-stone-500 dark:stroke-stone-400 stroke-1" />
          <line x1="95" y1="5" x2="5" y2="95" className="stroke-stone-500 dark:stroke-stone-400 stroke-1" />
          <polygon points="50,5 95,50 50,95 5,50" className="stroke-stone-700 dark:stroke-stone-300 stroke-1 fill-none" />
          {/* Highlight top diamond as Aries */}
          <polygon points="50,5 72.5,27.5 50,50 27.5,27.5" className="stroke-amber-600 dark:stroke-amber-400 stroke-[2] fill-amber-500/10" />
          <text x="50" y="29" className="text-[6.5px] font-bold fill-amber-700 dark:fill-amber-300 stroke-none" textAnchor="middle">
            मेष
          </text>
        </svg>
      ),
    },
  ];

  return (
    <div className={`w-full space-y-3 ${className}`}>
      {/* Top Header with title and guide toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              क्षेत्रीय कुण्डली शैली (Regional Chart Style)
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-amber-50 dark:bg-stone-800 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-stone-700">
                ३ वैदिक परम्परा
              </span>
            </span>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              आफ्नो अनुकूलता अनुसार उत्तरी, दक्षिणी वा पूर्वी शैली चयन गर्नुहोस्
            </p>
          </div>
        </div>

        {showGuideToggle && (
          <button
            type="button"
            onClick={() => setIsGuideOpen(!isGuideOpen)}
            className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 bg-amber-50/80 dark:bg-stone-800/80 border border-amber-200 dark:border-stone-700 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
            title="तीनवटै कुण्डली शैलीको तुलनात्मक विवरण हेर्नुहोस्"
          >
            <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="font-semibold">शैली तुलना मार्गदर्शिका</span>
            {isGuideOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* 3 Interactive Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {STYLES_CONFIG.map((style) => {
          const isSelected = currentStyle === style.id;
          const DirectionIcon = style.directionIcon;

          return (
            <div
              key={style.id}
              onClick={() => onSelectStyle(style.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectStyle(style.id);
                }
              }}
              className={`relative flex flex-col justify-between p-3.5 rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none text-left ${
                isSelected
                  ? 'border-[#D97706] dark:border-amber-500 bg-gradient-to-b from-amber-50/80 to-amber-100/30 dark:from-stone-900 dark:to-stone-800/80 shadow-md ring-2 ring-amber-400/20'
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 hover:border-amber-300 dark:hover:border-stone-700 hover:bg-amber-50/30 dark:hover:bg-stone-800/40 shadow-xs'
              }`}
            >
              {/* Selected Badge Indicator */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-[#D97706] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs animate-in fade-in zoom-in-90 duration-150">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>सक्रिय शैली</span>
                </div>
              )}

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`p-1.5 rounded-xl border transition-colors ${
                      isSelected
                        ? 'border-amber-400 bg-white dark:bg-stone-800 text-amber-600 dark:text-amber-400 shadow-xs'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-stone-500 dark:text-stone-400'
                    }`}
                  >
                    {style.diagramSvg}
                  </div>
                  <div>
                    <h4
                      className={`text-sm font-bold font-serif ${
                        isSelected ? 'text-[#D97706] dark:text-amber-400' : 'text-stone-900 dark:text-stone-100'
                      }`}
                    >
                      {style.titleNepali}
                    </h4>
                    <p className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                      {style.titleEnglish}
                    </p>
                    <span className="inline-block mt-0.5 text-[10px] font-semibold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.2 rounded border border-stone-200 dark:border-stone-700">
                      {style.subtitle}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                  {style.description}
                </p>
              </div>

              {/* Bottom Feature Badges */}
              <div className="pt-2.5 mt-2.5 border-t border-stone-200/80 dark:border-stone-800/80 flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1 font-bold text-stone-700 dark:text-stone-300">
                  <Layers className="w-3 h-3 text-[#D97706]" />
                  {style.structure}
                </span>
                <span className="flex items-center gap-1 text-stone-500 dark:text-stone-400">
                  <DirectionIcon className="w-3 h-3 text-amber-600" />
                  {style.direction.split(' ')[0]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expandable Comprehensive Regional Comparison Guide */}
      {isGuideOpen && (
        <div className="bg-[#FFFDF9] dark:bg-stone-900 border border-amber-200 dark:border-stone-700 rounded-2xl p-4 shadow-sm text-xs space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-amber-200 dark:border-stone-700 pb-2">
            <h5 className="font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D97706]" />
              <span>वैदिक ज्योतिषमा ३ क्षेत्रीय कुण्डली शैलीहरूको विस्तृत संरचना तथा नियम</span>
            </h5>
            <button
              onClick={() => setIsGuideOpen(false)}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs cursor-pointer"
            >
              बन्द गर्नुहोस् ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-amber-50/50 dark:bg-stone-800/50 p-3 rounded-xl border border-amber-200/60 dark:border-stone-700/60 space-y-1.5">
              <span className="font-bold text-[#D97706] dark:text-amber-400">१. उत्तर भारतीय (North Indian / Diamond)</span>
              <ul className="list-disc list-inside text-[11px] text-stone-700 dark:text-stone-300 space-y-1 leading-relaxed">
                <li><strong>संरचना:</strong> हीरक (Diamond) आकारको १२ भाव।</li>
                <li><strong>स्थिर तत्त्व:</strong> १२ वटै भाव (१ देखि १२) को स्थान सधैँ अपरिवर्तनीय हुन्छ।</li>
                <li><strong>लग्न स्थिति:</strong> माथिल्लो शीर्ष हीरक सधैँ भाव १ (लग्न) हुन्छ।</li>
                <li><strong>दिशा:</strong> वामावर्त (Counter-Clockwise)।</li>
                <li><strong>राशि अङ्कन:</strong> लग्न राशिको अङ्क (१ देखि १२) भाव १ मा लेखिन्छ र अन्य राशि अङ्क क्रमैसँग वामावर्त भरिन्छन्।</li>
              </ul>
            </div>

            <div className="bg-amber-50/50 dark:bg-stone-800/50 p-3 rounded-xl border border-amber-200/60 dark:border-stone-700/60 space-y-1.5">
              <span className="font-bold text-[#D97706] dark:text-amber-400">२. दक्षिण भारतीय (South Indian / Fixed Grid)</span>
              <ul className="list-disc list-inside text-[11px] text-stone-700 dark:text-stone-300 space-y-1 leading-relaxed">
                <li><strong>संरचना:</strong> ४×४ को बाहिरी १२ चौकोश ग्रिड। बिचको २×२ स्थानमा कुण्डली विवरण हुन्छ।</li>
                <li><strong>स्थिर तत्त्व:</strong> १२ राशिहरूको स्थान सधैँ स्थिर (मीन माथि बायाँ, मेष माथि दोस्रो, आदि)।</li>
                <li><strong>लग्न स्थिति:</strong> जुन राशिमा लग्न पर्छ, त्यहाँ (ल) वा विकर्ण रेखा (Slash) लगाइन्छ। त्यो कोष्ठ भाव १ बन्दछ।</li>
                <li><strong>दिशा:</strong> दक्षिणावर्त (Clockwise)।</li>
                <li><strong>भाव गणना:</strong> लग्न परेको राशिबाट घडीको सुई दिशामा भाव १, २, ३... क्रमशः गनिन्छ।</li>
              </ul>
            </div>

            <div className="bg-amber-50/50 dark:bg-stone-800/50 p-3 rounded-xl border border-amber-200/60 dark:border-stone-700/60 space-y-1.5">
              <span className="font-bold text-[#D97706] dark:text-amber-400">३. पूर्वी भारतीय (East Indian / Surya Chakra)</span>
              <ul className="list-disc list-inside text-[11px] text-stone-700 dark:text-stone-300 space-y-1 leading-relaxed">
                <li><strong>संरचना:</strong> हीरक-वर्ग संरचना (बङ्गाली, मैथिली तथा ओडिया परम्परा)।</li>
                <li><strong>स्थिर तत्त्व:</strong> राशिहरूको स्थान स्थिर हुन्छ। मेष सधैँ माथिल्लो शीर्ष कोष्ठमा रहन्छ।</li>
                <li><strong>लग्न स्थिति:</strong> जन्म लग्न जुन राशिमा पर्छ, त्यो कोष्ठ भाव १ हुन्छ र (ल) अंकित गरिन्छ।</li>
                <li><strong>दिशा:</strong> वामावर्त (Counter-Clockwise)।</li>
                <li><strong>भाव गणना:</strong> मेष (१), वृष (२), मिथुन (३) वामावर्त रहन्छन् र लग्नबाट वामावर्त भाव गणना हुन्छ।</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
