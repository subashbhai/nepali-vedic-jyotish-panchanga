import React, { memo } from 'react';
import { Award, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { YogaResult } from '../../types/astrology';

interface YogaPanelProps {
  yogas?: YogaResult[];
}

export const YogaPanel: React.FC<YogaPanelProps> = memo(({ yogas }) => {
  // Default list of yogas if none evaluated
  const defaultYogas: YogaResult[] = [
    {
      id: 'gaja_kesari',
      name: 'गजकेसरी योग',
      category: 'राजयोग',
      isPresent: true,
      strengthPercentage: 85,
      formingPlanets: ['गुरु', 'चन्द्र'],
      housesInvolved: [1, 4, 7, 10],
      descriptionNepali: 'चन्द्रमाबाट गुरु केन्द्र (१, ४, ७, १०) भावमा अवस्थित भएकाले गजकेसरी योग निर्माण भएको छ। व्यक्ति बुद्धिमान्, तेजस्वी, समाजमा सम्मानित र धनवान् हुन्छ।',
    },
    {
      id: 'budhaditya',
      name: 'बुधादित्य योग',
      category: 'शुभयोग',
      isPresent: true,
      strengthPercentage: 90,
      formingPlanets: ['सूर्य', 'बुध'],
      housesInvolved: [1, 10],
      descriptionNepali: 'सूर्य र बुध एउटै शुभ भाव वा राशिमा युति सम्बन्धमा रहेकाले बुधादित्य योग बनेको छ। तीक्ष्ण स्मरणशक्ति र प्रशासनिक क्षमता प्राप्त हुन्छ।',
    },
    {
      id: 'dhana_yoga',
      name: 'लक्ष्मी धन योग',
      category: 'धनयोग',
      isPresent: true,
      strengthPercentage: 80,
      formingPlanets: ['शुक्र', 'गुरु'],
      housesInvolved: [9, 11],
      descriptionNepali: 'लक्ष्मी स्थान (नवम भाव) र लाभ स्थान (एकादश भाव) का स्वामी ग्रहहरूको बलियो सम्बन्धले जीवनभर निरन्तर आर्थिक समृद्धि ल्याउँछ।',
    },
    {
      id: 'pancha_mahapurusha',
      name: 'शश महापुरुष योग',
      category: 'पंचमहापुरुष',
      isPresent: false,
      strengthPercentage: 0,
      formingPlanets: ['शनि'],
      housesInvolved: [],
      descriptionNepali: 'शनि केन्द्र भावमा स्वगृही वा उच्च राशिमा अवस्थित नभएकाले यो योग शमन अवस्थामा छ।',
    },
  ];

  const displayYogas = (yogas && yogas.length > 0) ? yogas : defaultYogas;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#7A1C1C] text-amber-300 flex items-center justify-center font-bold">
            <Award className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-[#7A1C1C] dark:text-amber-400 font-serif">
            शुभ तथा विशिष्ट ज्योतिषीय योगहरू (Yogas & Combinations)
          </h3>
        </div>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
          पाराशरीय योग सिद्धान्त
        </span>
      </div>

      {/* Grid of Yoga Cards */}
      <div className="grid grid-cols-1 gap-2.5 text-xs">
        {displayYogas.map((y, idx) => {
          const isFormed = y.isPresent;
          return (
            <div
              key={y.id + idx}
              className={`p-3 rounded-xl border transition-all ${
                isFormed
                  ? 'bg-[#FAF7F2] dark:bg-stone-800/80 border-amber-300/80 dark:border-amber-800/80 shadow-2xs'
                  : 'bg-stone-50 dark:bg-stone-900/50 border-stone-200 dark:border-stone-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-[#E6E0D5] dark:border-stone-700">
                <span className="font-extrabold text-[#7A1C1C] dark:text-amber-300 text-xs sm:text-sm flex items-center gap-1.5 truncate">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="truncate">{y.name}</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    isFormed
                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                      : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-400'
                  }`}
                >
                  {isFormed ? 'शुभ निर्मित' : 'अक्रिय'}
                </span>
              </div>

              <div className="pt-2 space-y-1 text-stone-700 dark:text-stone-300 text-[11px] leading-relaxed">
                <div>
                  <strong className="text-stone-900 dark:text-stone-100 font-bold">फल: </strong>
                  <span>{y.descriptionNepali}</span>
                </div>
                {y.formingPlanets && y.formingPlanets.length > 0 && (
                  <div className="pt-0.5 flex flex-wrap items-center gap-1 text-[10.5px] text-stone-500">
                    <span>कारक ग्रह:</span>
                    <span className="font-bold text-amber-900 dark:text-amber-300">
                      {y.formingPlanets.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
