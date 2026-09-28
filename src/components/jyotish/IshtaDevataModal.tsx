import React, { memo } from 'react';
import { 
  X, 
  Sparkles, 
  Flame, 
  BookOpen, 
  Compass, 
  Calendar, 
  CheckCircle2, 
  Award,
  ScrollText,
  ShieldCheck
} from 'lucide-react';
import { IshtaDevataResult } from '../../utils/ishtaDevataEngine';

interface IshtaDevataModalProps {
  isOpen: boolean;
  onClose: () => void;
  ishtaData: IshtaDevataResult;
  jatakName?: string;
}

export const IshtaDevataModal: React.FC<IshtaDevataModalProps> = memo(({
  isOpen,
  onClose,
  ishtaData,
  jatakName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-stone-900 rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-amber-300 dark:border-amber-700/60 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Sacred Header */}
        <div className="relative bg-gradient-to-r from-[#7A1C1C] via-[#991B1B] to-[#7A1C1C] text-white p-4 sm:p-5 border-b-2 border-amber-400/60">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-amber-200 hover:text-white transition-colors cursor-pointer"
            title="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5 pr-8">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-400/20 border-2 border-amber-300 flex items-center justify-center shrink-0 shadow-inner">
              <Flame className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold bg-amber-400 text-stone-950 px-2.5 py-0.5 rounded-full tracking-wide uppercase">
                  शास्त्र सम्मत कुण्डली गणना
                </span>
                {jatakName && (
                  <span className="text-xs text-amber-200 font-medium">
                    जातक: <strong className="text-white">{jatakName}</strong>
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-2xl font-bold font-serif text-white tracking-wide mt-0.5">
                इष्ट देवता निर्णय एवं शास्त्रीय प्रमाण
              </h2>
              <p className="text-xs text-amber-200/90 font-serif">
                बृहत् पराशर होरा शास्त्र एवं महर्षि जैमिनी कारकांश सिद्धान्त अनुसार
              </p>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-stone-800 dark:text-stone-200 flex-1">
          
          {/* Main Deity Hero Spotlight */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50/40 to-amber-100/60 dark:from-stone-800 dark:via-stone-800/80 dark:to-stone-900 border border-amber-200 dark:border-stone-700 shadow-xs flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {ishtaData.imagePath && (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md shrink-0 bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                <img 
                  src={ishtaData.imagePath} 
                  alt={ishtaData.deityName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to decorative icon if image not available
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>तपाईंको परम कल्याणकारी मुख्य इष्ट देवता</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#7A1C1C] dark:text-amber-400 font-serif">
                {ishtaData.deityName}
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300">
                {ishtaData.deityTitle}
              </p>
              <p className="text-xs text-stone-600 dark:text-stone-400 italic">
                उपासना स्वरूप: {ishtaData.worshipForm}
              </p>
            </div>
          </div>

          {/* 1. Astrological Derivation (ग्रह तथा भावगत गणितीय प्रमाण) */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 border-b border-[#E6E0D5] dark:border-stone-700 pb-1.5">
              <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif">
                १. कुण्डलीका ग्रह एवं भावगत शास्त्रीय गणना
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-stone-800/80 border border-slate-200 dark:border-stone-700 flex flex-col justify-between">
                <span className="text-[11px] text-stone-500 dark:text-stone-400">लग्न राशि</span>
                <span className="font-bold text-stone-900 dark:text-stone-100 text-sm mt-0.5">{ishtaData.lagnaRashi}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex flex-col justify-between">
                <span className="text-[11px] text-amber-800 dark:text-amber-400">५औं (मन्त्र) भाव / पञ्चमेश</span>
                <span className="font-bold text-[#7A1C1C] dark:text-amber-300 text-sm mt-0.5">
                  {ishtaData.fifthHouseRashi} ({ishtaData.fifthLord})
                </span>
                {ishtaData.planetsInFifthHouse.length > 0 && (
                  <span className="text-[10px] text-stone-600 dark:text-stone-400">
                    भावस्थ: {ishtaData.planetsInFifthHouse.join(', ')}
                  </span>
                )}
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex flex-col justify-between">
                <span className="text-[11px] text-blue-800 dark:text-blue-400">आत्मकारक (AK)</span>
                <span className="font-bold text-blue-950 dark:text-blue-200 text-sm mt-0.5">{ishtaData.atmakarakaPlanet}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 flex flex-col justify-between">
                <span className="text-[11px] text-purple-800 dark:text-purple-400">कारकांश (D-9) / १२औं भाव</span>
                <span className="font-bold text-purple-950 dark:text-purple-200 text-sm mt-0.5">
                  {ishtaData.karakamshaRashi}
                </span>
                <span className="text-[10px] text-stone-600 dark:text-stone-400">
                  {ishtaData.jivanmuktamsaPlanetOrLord}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-stone-800/50 border border-[#E6E0D5] dark:border-stone-700 text-xs leading-relaxed text-stone-700 dark:text-stone-300">
              <span className="font-bold text-amber-800 dark:text-amber-400">शास्त्रीय व्याख्या: </span>
              {ishtaData.explanationNepali}
            </div>
          </div>

          {/* 2. Classical Sanskrit Shlokas & Pramana (मूल संस्कृत श्लोक प्रमाण) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[#E6E0D5] dark:border-stone-700 pb-1.5">
              <ScrollText className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif">
                २. प्रामाणिक शास्त्रीय प्रमाण एवं श्लोक
              </h4>
            </div>

            <div className="space-y-2.5">
              {ishtaData.pramanaList.map((pramana, idx) => (
                <div 
                  key={idx}
                  className="p-3 sm:p-4 rounded-xl bg-amber-50/40 dark:bg-stone-800/70 border-l-4 border-amber-500 dark:border-amber-400 border-t border-r border-b border-[#E6E0D5] dark:border-stone-700 space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="text-[11px] font-bold text-[#7A1C1C] dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950 px-2 py-0.5 rounded-md">
                      {pramana.source}
                    </span>
                  </div>
                  
                  {/* Sanskrit Shloka */}
                  <div className="font-serif text-xs sm:text-[13px] font-bold text-stone-900 dark:text-stone-100 whitespace-pre-line leading-relaxed tracking-wide bg-white/70 dark:bg-stone-900/60 p-2.5 rounded-lg border border-amber-200/60 dark:border-stone-700/60">
                    {pramana.sutraOrShloka}
                  </div>

                  {/* Nepali Meaning */}
                  <div className="text-xs text-stone-600 dark:text-stone-300 leading-normal pl-1">
                    <strong className="text-stone-800 dark:text-stone-200 font-medium">नेपाली तात्पर्य: </strong>
                    {pramana.nepaliMeaning}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Life Benefits & Blessings (उपासनाबाट प्राप्त हुने कल्याणकारी फल) */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 border-b border-[#E6E0D5] dark:border-stone-700 pb-1.5">
              <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif">
                ३. {ishtaData.blessingsTitle}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {ishtaData.benefitsList.map((benefit, i) => (
                <div 
                  key={i} 
                  className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 flex items-start gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-stone-700 dark:text-stone-200 leading-snug">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Puja & Mantra Guide (दैनिक साधना, मन्त्र एवं पूजा विधि) */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 border-b border-[#E6E0D5] dark:border-stone-700 pb-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif">
                ४. नित्य साधना, मन्त्र तथा पूजा विधि
              </h4>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-stone-800/80 border border-slate-200 dark:border-stone-700 space-y-3 text-xs">
              {/* Mantras */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-700 dark:text-stone-300">बीज मन्त्र:</span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">१०८ पटक जप</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-700 font-mono font-bold text-sm text-[#7A1C1C] dark:text-amber-300 text-center tracking-wider">
                  {ishtaData.beejMantra}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-700 dark:text-stone-300">दैनिक जप मन्त्र:</span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 font-serif font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-200 text-center">
                  {ishtaData.japaMantra}
                </div>
              </div>

              {/* Ritual specifics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-200 dark:border-stone-700 text-[11px]">
                <div className="p-1.5 rounded-md bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 flex flex-col">
                  <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-600" /> शुभ वार:
                  </span>
                  <span className="font-bold text-stone-800 dark:text-stone-200 mt-0.5">{ishtaData.shubhDay}</span>
                </div>

                <div className="p-1.5 rounded-md bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 flex flex-col">
                  <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
                    <Compass className="w-3 h-3 text-blue-600" /> शुभ दिशा:
                  </span>
                  <span className="font-bold text-stone-800 dark:text-stone-200 mt-0.5">{ishtaData.shubhDirection}</span>
                </div>

                <div className="p-1.5 rounded-md bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 flex flex-col">
                  <span className="text-stone-500 dark:text-stone-400">प्रिय पुष्प:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200 mt-0.5 truncate" title={ishtaData.favoriteFlower}>
                    {ishtaData.favoriteFlower}
                  </span>
                </div>

                <div className="p-1.5 rounded-md bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-700 flex flex-col">
                  <span className="text-stone-500 dark:text-stone-400">प्रिय नैवेद्य:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200 mt-0.5 truncate" title={ishtaData.naivedya}>
                    {ishtaData.naivedya}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-stone-850 border-t border-[#E6E0D5] dark:border-stone-700 flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            * कुण्डलीका पञ्चमेश एवं कारकांशको सूक्ष्म अध्ययन गरी निकालिएको शास्त्रीय निष्कर्ष
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#7A1C1C] hover:bg-[#5C1515] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            बन्द गर्नुहोस्
          </button>
        </div>
      </div>
    </div>
  );
});

IshtaDevataModal.displayName = 'IshtaDevataModal';
