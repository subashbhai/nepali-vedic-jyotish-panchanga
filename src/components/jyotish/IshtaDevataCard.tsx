import React, { memo, useState, useMemo } from 'react';
import { Flame, Sparkles, BookOpen, ChevronRight, Award, ShieldCheck } from 'lucide-react';
import { LagnaInfo, PlanetPosition, BirthDetails } from '../../types/astrology';
import { calculateIshtaDevata } from '../../utils/ishtaDevataEngine';
import { IshtaDevataModal } from './IshtaDevataModal';

interface IshtaDevataCardProps {
  lagna?: LagnaInfo;
  planets?: PlanetPosition[];
  profile?: BirthDetails;
  className?: string;
}

export const IshtaDevataCard: React.FC<IshtaDevataCardProps> = memo(({
  lagna,
  planets,
  profile,
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Calculate Shastric Ishta Devata dynamically based on Lagna & Planets
  const ishtaData = useMemo(() => {
    return calculateIshtaDevata(lagna as LagnaInfo, planets as PlanetPosition[], profile);
  }, [lagna, planets, profile]);

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className={`bg-white dark:bg-stone-900 rounded-2xl border border-amber-300/80 dark:border-amber-800/80 p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between ${className}`}
        title="क्लिक गरी विस्तृत शास्त्रीय प्रमाण, श्लोक र पूजा विधि हेर्नुहोस्"
      >
        {/* Subtle decorative background gradient */}
        <div className="absolute -right-8 -top-8 w-28 h-28 bg-amber-100/50 dark:bg-amber-950/20 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />

        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-amber-100 dark:border-stone-800 pb-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#7A1C1C] dark:text-amber-400 font-serif leading-tight">
                इष्ट देवता निर्णय
              </h3>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                कुण्डली गणना (शास्त्र सम्मत)
              </span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-200 dark:border-amber-800">
            <Sparkles className="w-2.5 h-2.5" />
            <span>प्रमाण सहित</span>
          </span>
        </div>

        {/* Deity Highlight */}
        <div className="py-2.5 space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">मुख्य इष्ट:</span>
            <span className="text-sm sm:text-base font-extrabold text-[#7A1C1C] dark:text-amber-300 font-serif group-hover:text-amber-700 dark:group-hover:text-amber-200 transition-colors">
              {ishtaData.deityName}
            </span>
          </div>

          <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-1 leading-normal">
            {ishtaData.deityTitle}
          </p>

          {/* Quick pills */}
          <div className="flex items-center gap-1.5 pt-1 flex-wrap text-[10.5px]">
            <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
              ५औं भाव: <strong className="text-amber-700 dark:text-amber-400">{ishtaData.fifthLord}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
              कारकांश: <strong className="text-purple-700 dark:text-purple-400">{ishtaData.karakamshaRashi}</strong>
            </span>
          </div>

          {/* Main Benefit Snippet */}
          <div className="pt-1.5 flex items-start gap-1 text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 p-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
            <Award className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <span className="line-clamp-2 leading-snug">
              {ishtaData.benefitsList[0] || 'सर्वकार्य सिद्धि, ऐश्वर्य लाभ र संकट निवारण।'}
            </span>
          </div>
        </div>

        {/* Bottom Clickable CTA bar */}
        <div className="pt-2 border-t border-amber-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-400 relative z-10">
          <span className="flex items-center gap-1.5 group-hover:underline">
            <BookOpen className="w-3.5 h-3.5" />
            <span>श्लोक प्रमाण एवं पूजा विधि</span>
          </span>
          <ChevronRight className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Pop-up Modal */}
      <IshtaDevataModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ishtaData={ishtaData}
        jatakName={profile?.name}
      />
    </>
  );
});

IshtaDevataCard.displayName = 'IshtaDevataCard';
