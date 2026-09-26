import React from 'react';
import { 
  ArrowRightLeft, 
  CalendarDays, 
  Sparkles, 
  RotateCcw,
  BookOpen,
  Globe2,
  ChevronRight,
  Compass
} from 'lucide-react';
import { QuickDateConverter } from '../QuickDateConverter';
import { MultiSambatBlock } from './MultiSambatBlock';
import { NepaliSmartTypeBlock } from './NepaliSmartTypeBlock';
import { NavTab } from '../Navigation';

interface DateConverterViewProps {
  onNavigateTab?: (tab: NavTab) => void;
}

export const DateConverterView: React.FC<DateConverterViewProps> = ({
  onNavigateTab
}) => {
  return (
    <div className="w-full min-h-screen bg-[#FDFCF8] dark:bg-[#141210] text-[#2D241E] dark:text-stone-100 pb-16">
      {/* Page Header / Hero Banner */}
      <div className="bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border-b border-[#E6E0D5] dark:border-stone-800 py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mb-2 font-medium">
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('dashboard')}
              className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
            >
              गृहपृष्ठ
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-amber-700 dark:text-amber-400 font-bold">मिति रूपान्तरण तथा बहु-संवत्</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1A1A1A] dark:text-amber-100 flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-[#7A1C1C] text-white shadow-md">
                  <ArrowRightLeft className="w-6 h-6 text-amber-300" />
                </span>
                <span>मिति रूपान्तरण, बहु-संवत् तथा नेपाली युनिकोड</span>
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-3xl">
                विक्रम संवत् (BS) ↔ ईस्वी संवत् (AD), नेपाल संवत् (नेवाः संवत्), नेमा तिब्बती संवत् (लोसार), 
                उमेर गणना तथा बोलेर वा क्यामेराबाट फोटो खिची नेपालीमा टाइप र अनुवाद गर्ने आधिकारिक केन्द्र।
              </p>
            </div>

            {onNavigateTab && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab('panchanga')}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-750 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-[#D97706]" />
                  <span>आजको पञ्चाङ्ग</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('calendar')}
                  className="px-3.5 py-2 rounded-xl bg-[#7A1C1C] hover:bg-[#8B2323] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CalendarDays className="w-4 h-4 text-amber-300" />
                  <span>नेपाली पात्रो हेर्नुहोस्</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-6 space-y-8">
        
        {/* SECTION 1: Standard Bikram Sambat (BS) <-> Gregorian (AD) Date Converter */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7A1C1C]" />
              <span>१. विक्रम संवत् ↔ ईस्वी सन् मिति रूपान्तरण (BS ↔ AD Converter)</span>
            </h2>
            <span className="text-xs text-stone-500">वि.सं. १९७० देखि २१०० सम्म</span>
          </div>

          <QuickDateConverter
            mode="card"
            isOpen={true}
            onNavigateToPanchanga={(dateAD) => onNavigateTab && onNavigateTab('panchanga')}
          />
        </section>

        {/* SECTION 2: Multi-Sambat Block (Nepal Sambat, Newa Sambat, Nema Tibetan Sambat <-> BS) */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
              <span>२. नेपाल संवत्, नेवाः संवत् तथा नेमा तिब्बती संवत् रूपान्तरण (Multi-Sambat)</span>
            </h2>
            <span className="text-xs text-stone-500">शङ्खधर साख्वा राष्ट्रिय संवत् र हिमालयन लोसार संवत्</span>
          </div>

          <MultiSambatBlock />
        </section>

        {/* SECTION 3: Smart Type in Nepali, Voice Typing, Camera OCR & Translation */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>३. नेपालीमा टाइप गर्नुहोस् (Type in Nepali, Voice & Camera OCR)</span>
            </h2>
            <span className="text-xs text-stone-500">रोमानाइज्ड युनिकोड • १००० शब्द सीमा • भ्वाइस • क्यामेरा OCR • अनुवाद</span>
          </div>

          <NepaliSmartTypeBlock />
        </section>

      </div>
    </div>
  );
};
