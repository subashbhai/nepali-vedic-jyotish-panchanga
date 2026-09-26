import React, { memo } from 'react';
import { BookOpen, Sparkles, Award, ShieldCheck, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { BPHSClassicalShloka } from '../utils/brihatParasharaDatabase';

interface ClassicalShlokaCardProps {
  shloka: BPHSClassicalShloka;
  bhavaShloka?: {
    sanskritVerse: string;
    sourceChapter: string;
    wordMeaningNepali: string;
    classicalEffectNepali: string;
  };
  planetName?: string;
  houseNumber?: number;
}

export const ClassicalShlokaCard: React.FC<ClassicalShlokaCardProps> = memo(({
  shloka,
  bhavaShloka,
  planetName,
  houseNumber,
}) => {
  return (
    <div className="space-y-4">
      {/* 1. GRAHA SWAROOPA SHLOKA FROM BPHS */}
      <div className="bg-linear-to-br from-amber-500/10 via-amber-600/5 to-stone-50 dark:from-amber-950/40 dark:via-stone-900/60 dark:to-stone-900 rounded-2xl border-2 border-amber-400/60 dark:border-amber-700/60 p-4 sm:p-5 shadow-md relative overflow-hidden">
        {/* Subtle Background Vedic Watermark */}
        <div className="absolute right-2 -bottom-6 text-7xl font-serif text-amber-500/10 select-none pointer-events-none">
          ॐ
        </div>

        {/* Header with Classical badge */}
        <div className="flex items-center justify-between border-b border-amber-300/60 dark:border-amber-800/60 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-600 dark:bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm sm:text-base text-amber-950 dark:text-amber-200 font-serif">
                बृहत्पाराशर होराशास्त्रम् — प्रमाण श्लोक
              </h4>
              <p className="text-[11px] text-amber-800 dark:text-amber-400 font-medium">
                {shloka.sourceChapterNepali}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-amber-200 text-amber-950 dark:bg-amber-950 dark:text-amber-200 border border-amber-400 dark:border-amber-700 shadow-xs">
            मूल संस्कृत श्लोक
          </span>
        </div>

        {/* Sanskrit Verse Callout Box */}
        <div className="bg-amber-100/70 dark:bg-stone-950/80 rounded-xl p-3.5 sm:p-4 border border-amber-300 dark:border-amber-800/80 my-3 text-center shadow-inner">
          <p className="text-amber-950 dark:text-amber-100 font-serif text-sm sm:text-base leading-relaxed tracking-wide whitespace-pre-line font-bold">
            {shloka.sanskritVerse}
          </p>
        </div>

        {/* Word by word breakdown (पदच्छेद / शब्दार्थ) */}
        {shloka.wordMeaningNepali && (
          <div className="bg-white/80 dark:bg-stone-850/80 rounded-xl p-3 border border-amber-200 dark:border-stone-700 mb-3 space-y-1">
            <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>पदच्छेद तथा शब्दार्थ (Word Breakdown):</span>
            </span>
            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
              {shloka.wordMeaningNepali}
            </p>
          </div>
        )}

        {/* Detailed Meaning (विस्तृत अन्वय तथा अर्थ) */}
        <div className="bg-white dark:bg-stone-850 rounded-xl p-3.5 border border-amber-200 dark:border-stone-700 mb-3 space-y-1.5 shadow-xs">
          <h5 className="font-bold text-xs text-[#7A1C1C] dark:text-amber-400 font-serif flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>विस्तृत शास्त्रीय अन्वय तथा फलादेश (Detailed Classical Meaning)</span>
          </h5>
          <p className="text-stone-800 dark:text-stone-200 text-xs sm:text-[13px] leading-relaxed">
            {shloka.detailedMeaningNepali}
          </p>
        </div>

        {/* Astrological Principles & Practical Effects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {/* Principles */}
          <div className="bg-amber-50/60 dark:bg-stone-900/70 p-3 rounded-xl border border-amber-200/80 dark:border-stone-800 space-y-1.5">
            <h6 className="font-bold text-[11px] text-amber-950 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>पाराशर मुख्य सिद्धान्त (Key Principles)</span>
            </h6>
            <ul className="space-y-1 text-xs text-stone-700 dark:text-stone-300">
              {shloka.astrologicalPrinciplesNepali.map((principle, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{principle}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Practical Effects */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800 space-y-1.5">
            <h6 className="font-bold text-[11px] text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
              <span>प्रत्यक्ष जीवन प्रभाव (Life Effects)</span>
            </h6>
            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
              {shloka.practicalEffectsNepali}
            </p>
          </div>
        </div>

        {/* Classical Remedy */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-stone-900 p-3 rounded-xl border border-amber-300 dark:border-amber-800 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
            <span>पाराशर विहित शास्त्रीय उपाय (Classical Remedy):</span>
          </div>
          <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed font-medium">
            {shloka.classicalRemedyNepali}
          </p>
        </div>
      </div>

      {/* 2. BHAVA PHALA SHLOKA FROM BPHS IF AVAILABLE */}
      {bhavaShloka && (
        <div className="bg-stone-50 dark:bg-stone-900/80 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 space-y-2.5">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center font-bold">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 font-serif">
                भावस्थिति शास्त्रीय श्लोक ({bhavaShloka.sourceChapter})
              </h4>
            </div>
          </div>

          <div className="bg-stone-100 dark:bg-stone-950 rounded-xl p-3 border border-stone-200 dark:border-stone-800 text-center">
            <p className="text-amber-900 dark:text-amber-200 font-serif text-xs sm:text-sm whitespace-pre-line font-bold">
              {bhavaShloka.sanskritVerse}
            </p>
          </div>

          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
            <strong className="text-stone-900 dark:text-stone-100">शास्त्रीय फल: </strong>
            {bhavaShloka.classicalEffectNepali}
          </p>
        </div>
      )}
    </div>
  );
});
