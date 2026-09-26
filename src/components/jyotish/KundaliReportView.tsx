import React, { memo, useCallback, useState } from 'react';
import { Printer, FileText, Sparkles, Building2, Maximize2, Minimize2, LayoutGrid } from 'lucide-react';
import { BirthDetails, LagnaInfo, PlanetPosition, PanchangaData, VimshottariDashaResult, YogaResult } from '../../types/astrology';
import { BirthDetailsPanel } from './BirthDetailsPanel';
import { KundaliChartPanel } from './KundaliChartPanel';
import { PanchangaPanel } from './PanchangaPanel';
import { PlanetPositionTable } from './PlanetPositionTable';
import { BhavaTable } from './BhavaTable';
import { VimshottariDashaPanel } from './VimshottariDashaPanel';
import { YogaPanel } from './YogaPanel';
import { canUserPrintDocuments } from '../../db/subscriptionStore';
import { printElement } from '../../utils/pdfGenerator';

interface KundaliReportViewProps {
  profile: BirthDetails;
  lagna: LagnaInfo;
  planets: PlanetPosition[];
  panchanga: PanchangaData;
  dasha?: VimshottariDashaResult;
  yogas?: YogaResult[];
  orgProfile?: any;
}

export const KundaliReportView: React.FC<KundaliReportViewProps> = memo(({
  profile,
  lagna,
  planets,
  panchanga,
  dasha,
  yogas,
  orgProfile,
}) => {
  // Default to Full Wide view for optimal desktop experience
  const [isFullWidth, setIsFullWidth] = useState<boolean>(true);

  const handleTriggerPrint = useCallback(() => {
    printElement('printable-kundali-document');
  }, []);

  return (
    <div className="space-y-4 w-full">
      {/* Action and Width Controls Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h3 className="text-sm font-extrabold text-[#7A1C1C] dark:text-amber-400 font-serif flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>वैदिक जन्मकुण्डली तथा ग्रह चक्र पूर्ण प्रतिवेदन</span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            विस्तृत वैदिक कुण्डली, पञ्चाङ्ग, ग्रह स्थिति र विंशोत्तरी दशा प्रतिवेदन
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Full Wide vs Standard A4 Toggle */}
          <button
            onClick={() => setIsFullWidth(!isFullWidth)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isFullWidth
                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700 shadow-2xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
            }`}
            title={isFullWidth ? 'A4 पाना ढाँचामा हेर्नुहोस्' : 'पूर्ण चौडाइ (Full Wide) मा हेर्नुहोस्'}
          >
            {isFullWidth ? (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                <span>पूर्ण चौडाइ (Full Wide)</span>
              </>
            ) : (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>A4 ढाँचा (Centered)</span>
              </>
            )}
          </button>

          <button
            onClick={handleTriggerPrint}
            className="py-2 px-4 bg-[#7A1C1C] hover:bg-[#5C1515] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>अहिले प्रिन्ट गर्नुहोस्</span>
          </button>
        </div>
      </div>

      {/* Main Document Wrapper (Full Width or Centered Sheet based on toggle) */}
      <div
        id="printable-kundali-document"
        className={`bg-white text-[#2D241E] p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-[#E6E0D5] shadow-sm space-y-6 w-full font-sans transition-all print:shadow-none print:border-none print:p-0 print:max-w-none ${
          isFullWidth ? 'max-w-none' : 'max-w-4xl mx-auto'
        }`}
      >
        {/* Document Branding Header */}
        <div className="text-center border-b-2 border-[#7A1C1C] pb-4 space-y-1.5">
          <div className="text-xl sm:text-2xl font-black text-[#7A1C1C] font-serif tracking-wide">
            {orgProfile?.nameNepali || 'श्री वैदिक ज्योतिष तथा पञ्चाङ्ग कार्यालय'}
          </div>
          <div className="text-xs sm:text-sm text-stone-600 font-medium">
            {orgProfile?.addressNepali || 'काठमाडौँ, नेपाल'} | फोन: {orgProfile?.phone || '९८००००००००'}
          </div>
          <div className="text-sm sm:text-base font-bold text-amber-900 font-serif pt-1">
            ।। वैदिक जन्मकुण्डली तथा ग्रह चक्र प्रतिवेदन ।।
          </div>
        </div>

        {/* 3-Column Top Overview: 3 equal-sized blocks (LHS = विवरण, बीचमा = कुण्डली, RHS = जन्मकालीन पञ्चाङ्ग) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-5 items-start">
          <div className="w-full">
            <BirthDetailsPanel
              profile={profile}
              panchanga={panchanga}
              lagna={lagna}
              onEdit={() => {}}
              onPrint={handleTriggerPrint}
            />
          </div>
          <div className="w-full">
            <KundaliChartPanel lagna={lagna} planets={planets} chartTitle="जन्म लग्न कुण्डली" />
          </div>
          <div className="w-full">
            <PanchangaPanel
              panchanga={panchanga}
              profile={profile}
              lagna={lagna}
              planets={planets}
              title="जन्मकालीन पञ्चाङ्ग"
            />
          </div>
        </div>

        {/* Middle Row: Tables in full width or 2-column on wide screens */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
          <PlanetPositionTable lagna={lagna} planets={planets} />
          <BhavaTable lagna={lagna} planets={planets} />
        </div>

        {/* Full Width Dasha & Yoga Panels */}
        <VimshottariDashaPanel dasha={dasha} />
        <YogaPanel yogas={yogas} />

        {/* Footer Note */}
        <div className="pt-4 border-t border-[#E6E0D5] text-center text-xs text-stone-500 font-medium space-y-1">
          <div>गणना आधार: निरयण लाहिरी अयनांश | वैदिक पारम्पारिक सिद्धान्त</div>
          <div>कम्प्युटरकृत ज्योतिषीय कम्प्युटेशन - सर्व शुभम् भूयात्</div>
        </div>
      </div>
    </div>
  );
});
