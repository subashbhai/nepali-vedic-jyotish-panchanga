import React, { useState, useMemo } from 'react';
import { 
  CalendarDays, 
  Sun, 
  Moon, 
  Clock, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  Award, 
  RefreshCw,
  Compass,
  Scroll,
  Info,
  Printer,
  ArrowRightLeft,
  Globe,
  Plus
} from 'lucide-react';
import { 
  PanchangaData, 
  LocationData, 
  BirthDetails, 
  PlanetPosition, 
  LagnaInfo, 
  VimshottariDashaResult, 
  OrganizationProfile 
} from '../types/astrology';
import { PrintPreviewModal } from './PrintPreviewModal';
import { DailyPanchangaPrintModal } from './panchanga/DailyPanchangaPrintModal';
import { QuickDateConverter } from './QuickDateConverter';
import { LocationSelectorModal } from './LocationSelectorModal';
import { LocalPlanetaryCard } from './LocalPlanetaryCard';
import { NepaliCalendarView } from './NepaliCalendarView';
import { DailyHoroscopeView } from './DailyHoroscopeView';
import { DateConverterView } from './converter/DateConverterView';
import { 
  POPULAR_GLOBAL_LOCATIONS, 
  WORLD_LOCATIONS_DATA, 
  formatTimeDifferenceFromNepal, 
  formatTimeZoneString 
} from '../data/worldLocations';
import { 
  calculatePanchanga, 
  generateMonthlyPanchanga, 
  getSpecialDaysAndFestivals 
} from '../utils/panchangaEngine';
import { 
  NEPAL_LOCATIONS, 
  toDevanagariNumerals 
} from '../utils/nepaliCalendar';
import { 
  convertADToBSFull, 
  convertBSToADFull, 
  NEPALI_MONTH_NAMES, 
  getBSDaysInMonth, 
  PADA_NAMES_NEPALI 
} from '../utils/bsCalendarData';
import { NepaliDatePicker } from './NepaliDatePicker';
import { runPanchangaTestSuite, PanchangaTestSuiteSummary } from '../utils/panchangaTester';

export type PanchangaSubTab = 'daily' | 'patro' | 'rashifal' | 'converter' | 'planetary' | 'festivals' | 'test_suite';

export interface PanchangaViewProps {
  initialPanchanga: PanchangaData;
  initialSubTab?: PanchangaSubTab;
  activeProfile?: BirthDetails;
  profiles?: BirthDetails[];
  todayTransitPlanets?: PlanetPosition[];
  natalPlanets?: PlanetPosition[];
  lagna?: LagnaInfo;
  dasha?: VimshottariDashaResult;
  todayAD?: string;
  todayBS?: any;
  onSelectProfile?: (profile: BirthDetails) => void;
  onNewProfile?: () => void;
  orgProfile?: OrganizationProfile;
}

export const PanchangaView: React.FC<PanchangaViewProps> = ({ 
  initialPanchanga,
  initialSubTab,
  activeProfile,
  profiles,
  todayTransitPlanets,
  natalPlanets,
  lagna,
  dasha,
  todayAD,
  todayBS,
  onSelectProfile,
  onNewProfile,
  orgProfile,
}) => {
  // Main state with support for external initialSubTab
  const [activeTab, setActiveTab] = useState<PanchangaSubTab>(initialSubTab || 'daily');

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);
  
  // Date state: internal AD date YYYY-MM-DD
  const [selectedDateAD, setSelectedDateAD] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedLocation, setSelectedLocation] = useState<LocationData>(NEPAL_LOCATIONS[0]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState<boolean>(false);
  const [isDailyLetterheadPrintOpen, setIsDailyLetterheadPrintOpen] = useState<boolean>(false);
  const [isDateConverterOpen, setIsDateConverterOpen] = useState<boolean>(false);

  // Derived BS info
  const currentBS = useMemo(() => convertADToBSFull(selectedDateAD), [selectedDateAD]);

  // Calendar View month state
  const [calBSYear, setCalBSYear] = useState<number>(currentBS.year);
  const [calBSMonth, setCalBSMonth] = useState<number>(currentBS.month);

  // Daily Panchanga Data calculated live
  const panchanga: PanchangaData = useMemo(() => {
    return calculatePanchanga(
      selectedDateAD,
      '06:00',
      selectedLocation.latitude,
      selectedLocation.longitude,
      selectedLocation.timeZone
    );
  }, [selectedDateAD, selectedLocation]);

  // Daily Festivals calculated live
  const dailyFestivals = useMemo(() => {
    return getSpecialDaysAndFestivals(currentBS.year, currentBS.month, currentBS.day, panchanga);
  }, [currentBS, panchanga]);

  // Monthly Calendar Grid Data
  const monthlyData = useMemo(() => {
    return generateMonthlyPanchanga(
      calBSYear, 
      calBSMonth, 
      selectedLocation.latitude, 
      selectedLocation.longitude, 
      selectedLocation.timeZone
    );
  }, [calBSYear, calBSMonth, selectedLocation]);

  // Test Suite Results
  const [testSuiteResults, setTestSuiteResults] = useState<PanchangaTestSuiteSummary | null>(null);

  const handleRunTests = () => {
    const summary = runPanchangaTestSuite();
    setTestSuiteResults(summary);
  };

  // Navigation handlers
  const handlePreviousDay = () => {
    const date = new Date(selectedDateAD);
    date.setDate(date.getDate() - 1);
    setSelectedDateAD(date.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDateAD(new Date().toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const date = new Date(selectedDateAD);
    date.setDate(date.getDate() + 1);
    setSelectedDateAD(date.toISOString().split('T')[0]);
  };

  const handlePrevMonth = () => {
    if (calBSMonth === 1) {
      setCalBSMonth(12);
      setCalBSYear(calBSYear - 1);
    } else {
      setCalBSMonth(calBSMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (calBSMonth === 12) {
      setCalBSMonth(1);
      setCalBSYear(calBSYear + 1);
    } else {
      setCalBSMonth(calBSMonth + 1);
    }
  };

  // Pada display name
  const padaNameDev = PADA_NAMES_NEPALI[(panchanga.nakshatra.pada - 1) % 4] || `${toDevanagariNumerals(panchanga.nakshatra.pada)}`;

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Navigation */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
          <div>
            <h1 className="text-xl font-bold font-serif text-[#1A1A1A] dark:text-stone-100 flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-[#D97706]" />
              <span>नेपाली विक्रम संवत् तथा पूर्ण पञ्चाङ्ग प्रणाली</span>
            </h1>
            <p className="text-xs text-[#78716C] dark:text-stone-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>स्थान: <strong className="text-stone-800 dark:text-stone-200">{selectedLocation.flag || '📍'} {selectedLocation.name} ({selectedLocation.country})</strong></span>
              <span>•</span>
              <span>अक्षांश: {toDevanagariNumerals(selectedLocation.latitude.toFixed(2))}°</span>
              <span>•</span>
              <span>देशान्तर: {toDevanagariNumerals(selectedLocation.longitude.toFixed(2))}°</span>
              <span>•</span>
              <span className="text-amber-700 dark:text-amber-400 font-medium">
                {formatTimeDifferenceFromNepal(selectedLocation.timeZone)}
              </span>
            </p>
          </div>

          {/* Right Action: Location Selector & Print Preview */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Global Location Selector Trigger */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#FAF8F5] dark:bg-stone-800 hover:bg-amber-100/60 dark:hover:bg-stone-700 px-3 py-1.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700 text-xs font-semibold text-stone-800 dark:text-stone-200 transition-colors cursor-pointer shadow-2xs group"
              title="विश्वका कुनै पनि शहर (USA, UK, Australia, आदि) वा आफ्नै कोर्डिनेट्स चयन गर्नुहोस्"
            >
              <span className="text-base">{selectedLocation.flag || '📍'}</span>
              <span className="max-w-[130px] truncate text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 font-bold">
                {selectedLocation.name.split('(')[0].trim()}
              </span>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono bg-amber-100/80 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
                {formatTimeZoneString(selectedLocation.timeZone)}
              </span>
              <Globe className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600 transition-colors ml-0.5" />
            </button>

            <button
              onClick={() => setIsDateConverterOpen(true)}
              className="px-3.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-[#D97706] dark:text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-[#D97706]/30 shadow-xs transition-colors cursor-pointer"
              title="द्रुत मिति रूपान्तरण औजार (AD ↔ BS Date Converter)"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#D97706]" />
              <span>मिति रूपान्तरण</span>
            </button>

            <button
              onClick={() => setIsDailyLetterheadPrintOpen(true)}
              className="px-3.5 py-1.5 bg-[#8B1E0F] hover:bg-[#6D160A] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer border border-amber-500/40"
              title="ॐ को भव्य बोर्डर, बालानन्द लेटरहेड र बार स्वामी भगवान्‌को तस्बिर सहितको पञ्चाङ्ग प्रिन्ट / डाउनलोड / सेयर गर्नुहोस्"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>पञ्चाङ्ग (प्रिन्ट / डाउनलोड / सेयर)</span>
            </button>
          </div>
        </div>

        {/* Quick Regional Location Chips */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-1 text-xs">
          <div className="flex items-center gap-1 text-[#78716C] dark:text-stone-400 shrink-0">
            <Globe className="w-3.5 h-3.5 text-[#D97706]" />
            <span className="font-semibold text-stone-700 dark:text-stone-300">द्रुत स्थान चयन:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-thin">
            {POPULAR_GLOBAL_LOCATIONS.map((loc) => {
              const isCur = Math.abs(loc.latitude - selectedLocation.latitude) < 0.001 && Math.abs(loc.longitude - selectedLocation.longitude) < 0.001;
              return (
                <button
                  key={loc.name}
                  onClick={() => setSelectedLocation(loc)}
                  className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 border cursor-pointer ${
                    isCur
                      ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-2xs'
                      : 'bg-[#FAF8F5] dark:bg-stone-800/90 text-stone-700 dark:text-stone-300 border-[#E6E0D5] dark:border-stone-700 hover:border-amber-400 hover:bg-amber-50/50'
                  }`}
                  title={`${loc.name} - ${loc.country}`}
                >
                  <span>{loc.flag || '📍'}</span>
                  <span>{loc.englishName ? loc.englishName.split(',')[0] : loc.name.split('(')[0]}</span>
                </button>
              );
            })}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="px-2.5 py-1 rounded-lg text-xs whitespace-nowrap bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800 hover:bg-amber-100 font-medium flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>थप स्थान / कोर्डिनेट्स...</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs (दैनिक पञ्चाङ्ग, नेपाली पात्रो, दैनिक राशिफल, मिति रूपान्तरण, ग्रह स्थिति, चाडपर्व, परीक्षण) */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#E6E0D5]/70 dark:border-stone-800 pb-1 scrollbar-thin">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-[#7A1C1C] text-white shadow-xs ring-1 ring-[#5C1515]'
                : 'bg-[#FAF8F5] dark:bg-stone-800 text-[#2D241E] dark:text-stone-300 hover:bg-[#E6E0D5] dark:hover:bg-stone-700'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-300" />
            <span>दैनिक पञ्चाङ्ग</span>
          </button>

          <button
            onClick={() => setActiveTab('patro')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'patro'
                ? 'bg-[#7A1C1C] text-white shadow-xs ring-1 ring-[#5C1515]'
                : 'bg-[#FAF8F5] dark:bg-stone-800 text-[#2D241E] dark:text-stone-300 hover:bg-[#E6E0D5] dark:hover:bg-stone-700'
            }`}
          >
            <CalendarIcon className="w-4 h-4 text-amber-300" />
            <span>नेपाली पात्रो (क्यालेन्डर)</span>
          </button>

          <button
            onClick={() => setActiveTab('rashifal')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'rashifal'
                ? 'bg-[#7A1C1C] text-white shadow-xs ring-1 ring-[#5C1515]'
                : 'bg-[#FAF8F5] dark:bg-stone-800 text-[#2D241E] dark:text-stone-300 hover:bg-[#E6E0D5] dark:hover:bg-stone-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>दैनिक राशिफल</span>
          </button>

          <button
            onClick={() => setActiveTab('converter')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'converter'
                ? 'bg-[#7A1C1C] text-white shadow-xs ring-1 ring-[#5C1515]'
                : 'bg-[#FAF8F5] dark:bg-stone-800 text-[#2D241E] dark:text-stone-300 hover:bg-[#E6E0D5] dark:hover:bg-stone-700'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-amber-300" />
            <span>मिति रूपान्तरण</span>
          </button>

          <button
            onClick={() => setActiveTab('planetary')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'planetary'
                ? 'bg-[#7A1C1C] text-white shadow-xs ring-1 ring-[#5C1515]'
                : 'bg-[#FAF8F5] dark:bg-stone-800 text-[#2D241E] dark:text-stone-300 hover:bg-[#E6E0D5] dark:hover:bg-stone-700'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-300" />
            <span>ग्रह स्थिति व लग्न</span>
          </button>

          <button
            onClick={() => setActiveTab('festivals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'festivals'
                ? 'bg-[#7A1C1C] text-white shadow-xs ring-1 ring-[#5C1515]'
                : 'bg-[#FAF8F5] dark:bg-stone-800 text-[#2D241E] dark:text-stone-300 hover:bg-[#E6E0D5] dark:hover:bg-stone-700'
            }`}
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>विशेष दिन तथा चाडपर्वहरू</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('test_suite');
              if (!testSuiteResults) handleRunTests();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'test_suite'
                ? 'bg-[#7A1C1C] text-white shadow-xs ring-1 ring-[#5C1515]'
                : 'bg-[#FAF8F5] dark:bg-stone-800 text-[#2D241E] dark:text-stone-300 hover:bg-[#E6E0D5] dark:hover:bg-stone-700'
            }`}
          >
            <RefreshCw className="w-4 h-4 text-amber-300" />
            <span>पञ्चाङ्ग परीक्षण प्रणाली</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DAILY PANCHANGA VIEW */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* Day Navigator Bar */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handlePreviousDay}
                className="px-3.5 py-2 bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#E6E0D5] dark:hover:bg-stone-700 text-[#2D241E] dark:text-stone-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>अघिल्लो दिन</span>
              </button>

              <div className="text-center">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-lg sm:text-xl font-bold font-serif text-[#1A1A1A] dark:text-stone-100">
                    {currentBS.formattedBSFull}
                  </span>
                  {panchanga.masaInfo?.isAdhimasa && (
                    <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
                      ✨ अधिकमास
                    </span>
                  )}
                  {panchanga.masaInfo?.isKshayamasa && (
                    <span className="bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700 text-[11px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
                      ⚠️ क्षयमास
                    </span>
                  )}
                </div>

                {/* Classical Vedic Tithi Sub-header */}
                <div className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300 mt-1 flex items-center justify-center gap-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-300/60 dark:border-amber-700/50">
                    {panchanga.masaInfo?.masaName?.replace(' मास (शुद्ध)', '')?.replace(' (पुरुषोत्तम महिना)', '') || 'भाद्रपद'} {panchanga.tithi.paksha} पक्ष, {panchanga.tithi.name} तिथि
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 font-normal">
                    ({panchanga.tithi.endTime})
                  </span>
                  {panchanga.nepalSamvatFormatted && (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-600/10 border border-red-300 dark:border-red-800 text-[#8B1E0F] dark:text-red-300 text-xs font-bold inline-flex items-center gap-1">
                      <span>🇳🇵</span>
                      <span>{panchanga.nepalSamvatFormatted}</span>
                    </span>
                  )}
                </div>

                {dailyFestivals.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-1 mt-2">
                    {dailyFestivals.map((f, idx) => (
                      <span key={idx} className="bg-[#D97706]/10 text-[#D97706] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#D97706]/20">
                        ✨ {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToday}
                  className="px-3 py-2 bg-[#D97706]/10 hover:bg-[#D97706]/20 text-[#D97706] rounded-xl text-xs font-bold transition-colors"
                >
                  आज
                </button>

                <button
                  onClick={handleNextDay}
                  className="px-3.5 py-2 bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#E6E0D5] dark:hover:bg-stone-700 text-[#2D241E] dark:text-stone-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>भोलि</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick BS Date Selector */}
            <div className="pt-3 border-t border-[#E6E0D5] dark:border-stone-800">
              <NepaliDatePicker
                valueBS={currentBS.formattedBSFull}
                valueAD={selectedDateAD}
                onChange={({ dateAD }) => setSelectedDateAD(dateAD)}
                label="अन्य मितिको पञ्चाङ्ग रोज्नुहोस् (विक्रम संवत्):"
              />
            </div>
          </div>

          {/* Strict Sequence Layout Required by Prompt Rule #28 */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-6 shadow-sm space-y-6">
            <div className="border-b border-[#E6E0D5] dark:border-stone-800 pb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold font-serif text-[#1A1A1A] dark:text-stone-100 flex items-center gap-2">
                <Sun className="w-6 h-6 text-[#D97706]" />
                <span>आजको पञ्चाङ्ग</span>
              </h2>
              <span className="text-xs text-[#D97706] font-bold bg-[#D97706]/10 px-3 py-1 rounded-full border border-[#D97706]/20">
                संवत्सर: {panchanga.samvatsara}
              </span>
            </div>

            {panchanga.masaInfo?.isAdhimasa && (
              <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-xl p-3.5 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    ✨ पुरुषोत्तम महिना (अधिकमास) सूचना
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                    {panchanga.masaInfo.details} ({panchanga.masaInfo.masaName})
                  </p>
                </div>
              </div>
            )}

            {panchanga.masaInfo?.isKshayamasa && (
              <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 rounded-xl p-3.5 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    ⚠️ क्षयमास सूचना
                  </h4>
                  <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">
                    {panchanga.masaInfo.details} ({panchanga.masaInfo.masaName})
                  </p>
                </div>
              </div>
            )}

            {/* Structured Table matching exact order #28 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* 1. मिति */}
              <div className="bg-[#FAF8F5] dark:bg-stone-800/60 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#78716C] dark:text-stone-400">मिति:</span>
                <span className="text-sm font-bold text-[#1A1A1A] dark:text-stone-100">{panchanga.dateBS}</span>
              </div>

              {/* 2. वार */}
              <div className="bg-[#FAF8F5] dark:bg-stone-800/60 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#78716C] dark:text-stone-400">वार:</span>
                <span className="text-sm font-bold text-[#1A1A1A] dark:text-stone-100">{panchanga.dayNameNepali} ({panchanga.dayNameSanskrit})</span>
              </div>

              {/* 3. पक्ष */}
              <div className="bg-[#FAF8F5] dark:bg-stone-800/60 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#78716C] dark:text-stone-400">पक्ष:</span>
                <span className="text-sm font-bold text-[#D97706]">{panchanga.tithi.paksha} पक्ष</span>
              </div>

              {/* 4. तिथि */}
              <div className="bg-[#FAF8F5] dark:bg-stone-800/60 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#78716C] dark:text-stone-400">तिथि:</span>
                <span className="text-sm font-bold text-[#1A1A1A] dark:text-stone-100">{panchanga.tithi.name} ({panchanga.tithi.endTime})</span>
              </div>

              {/* 5. नक्षत्र */}
              <div className="bg-[#FAF8F5] dark:bg-stone-800/60 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#78716C] dark:text-stone-400">नक्षत्र:</span>
                <span className="text-sm font-bold text-[#1A1A1A] dark:text-stone-100">{panchanga.nakshatra.name} ({panchanga.nakshatra.endTime})</span>
              </div>

              {/* 6. पाद */}
              <div className="bg-[#FAF8F5] dark:bg-stone-800/60 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#78716C] dark:text-stone-400">पाद:</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{padaNameDev}</span>
              </div>

              {/* 7. योग */}
              <div className="bg-[#FAF8F5] dark:bg-stone-800/60 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#78716C] dark:text-stone-400">योग:</span>
                <span className="text-sm font-bold text-[#1A1A1A] dark:text-stone-100">{panchanga.yoga.name} ({panchanga.yoga.endTime})</span>
              </div>

              {/* 8. करण */}
              <div className="bg-[#FAF8F5] dark:bg-stone-800/60 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#78716C] dark:text-stone-400">करण:</span>
                <span className="text-sm font-bold text-[#1A1A1A] dark:text-stone-100">{panchanga.karana.name} ({panchanga.karana.endTime})</span>
              </div>

              {/* 9. चन्द्र राशि */}
              <div className="bg-[#FAF8F5] dark:bg-stone-800/60 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#78716C] dark:text-stone-400">चन्द्र राशि:</span>
                <span className="text-sm font-bold text-[#1A1A1A] dark:text-stone-100">{panchanga.moonRashi}</span>
              </div>

              {/* 10. सूर्य राशि */}
              <div className="bg-[#FAF8F5] dark:bg-stone-800/60 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#78716C] dark:text-stone-400">सूर्य राशि:</span>
                <span className="text-sm font-bold text-[#1A1A1A] dark:text-stone-100">{panchanga.sunRashi}</span>
              </div>

              {/* 11. सूर्योदय */}
              <div className="bg-[#FAF8F5] dark:bg-stone-800/60 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#78716C] dark:text-stone-400">सूर्योदय:</span>
                <span className="text-sm font-bold text-[#D97706]">{panchanga.sunrise}</span>
              </div>

              {/* 12. सूर्यास्त */}
              <div className="bg-[#FAF8F5] dark:bg-stone-800/60 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#78716C] dark:text-stone-400">सूर्यास्त:</span>
                <span className="text-sm font-bold text-[#D97706]">{panchanga.sunset}</span>
              </div>

              {/* 12क. दिनमान (Day Duration) */}
              <div className="bg-amber-50/70 dark:bg-amber-950/20 p-3.5 rounded-xl border border-amber-200/70 dark:border-amber-900/40 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-400">दिनमान:</span>
                <span className="text-xs font-bold text-amber-950 dark:text-amber-200">{panchanga.dayDuration || '१२ घण्टा १५ मिनेट'}</span>
              </div>

              {/* 12ख. रात्रिमान (Night Duration) */}
              <div className="bg-indigo-50/70 dark:bg-indigo-950/20 p-3.5 rounded-xl border border-indigo-200/70 dark:border-indigo-900/40 flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-800 dark:text-indigo-400">रात्रिमान:</span>
                <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">{panchanga.nightDuration || '११ घण्टा ४५ मिनेट'}</span>
              </div>

              {/* 12ग. सौर्य मध्यान्ह (Solar Noon) */}
              <div className="bg-[#FAF8F5] dark:bg-stone-800/60 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#78716C] dark:text-stone-400">सौर्य मध्यान्ह:</span>
                <span className="text-sm font-bold text-[#1A1A1A] dark:text-stone-100 font-mono">{panchanga.solarNoon || '१२:००'}</span>
              </div>

              {/* 13. चन्द्रोदय */}
              <div className="bg-[#FAF8F5] dark:bg-stone-800/60 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#78716C] dark:text-stone-400">चन्द्रोदय:</span>
                <span className="text-sm font-bold text-[#1A1A1A] dark:text-stone-100">{panchanga.moonrise}</span>
              </div>

              {/* 14. चन्द्रास्त */}
              <div className="bg-[#FAF8F5] dark:bg-stone-800/60 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#78716C] dark:text-stone-400">चन्द्रास्त:</span>
                <span className="text-sm font-bold text-[#1A1A1A] dark:text-stone-100">{panchanga.moonset}</span>
              </div>

              {/* 15. राहुकाल */}
              <div className="bg-rose-50/70 dark:bg-rose-950/30 p-3.5 rounded-xl border border-rose-200 dark:border-rose-800/50 flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800 dark:text-rose-300">राहुकाल:</span>
                <span className="text-sm font-bold text-rose-900 dark:text-rose-200">{panchanga.rahuKaal.start} देखि {panchanga.rahuKaal.end}</span>
              </div>

              {/* 16. यमगण्ड */}
              <div className="bg-[#FAF8F5] dark:bg-stone-800/60 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#78716C] dark:text-stone-400">यमगण्ड:</span>
                <span className="text-sm font-bold text-[#1A1A1A] dark:text-stone-100">{panchanga.yamaganda.start} देखि {panchanga.yamaganda.end}</span>
              </div>

              {/* 17. गुलिककाल */}
              <div className="bg-[#FAF8F5] dark:bg-stone-800/60 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#78716C] dark:text-stone-400">गुलिककाल:</span>
                <span className="text-sm font-bold text-[#1A1A1A] dark:text-stone-100">{panchanga.gulika.start} देखि {panchanga.gulika.end}</span>
              </div>

              {/* 18. अभिजित मुहूर्त */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">अभिजित मुहूर्त:</span>
                <span className="text-sm font-bold text-emerald-900 dark:text-emerald-200">{panchanga.abhijitMuhurta.start} देखि {panchanga.abhijitMuhurta.end}</span>
              </div>

              {/* 19. ब्रह्ममुहूर्त */}
              <div className="bg-[#FAF8F5] dark:bg-stone-800/60 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#78716C] dark:text-stone-400">ब्रह्ममुहूर्त:</span>
                <span className="text-sm font-bold text-[#1A1A1A] dark:text-stone-100">{panchanga.brahmaMuhurta.start} देखि {panchanga.brahmaMuhurta.end}</span>
              </div>

              {/* 20. प्रदोष */}
              <div className="bg-[#FAF8F5] dark:bg-stone-800/60 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#78716C] dark:text-stone-400">प्रदोष:</span>
                <span className="text-sm font-bold text-[#1A1A1A] dark:text-stone-100">{panchanga.pradoshaTime.start} देखि {panchanga.pradoshaTime.end}</span>
              </div>

              {/* 21. ऋतु */}
              <div className="bg-[#FAF8F5] dark:bg-stone-800/60 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#78716C] dark:text-stone-400">ऋतु:</span>
                <span className="text-sm font-bold text-[#1A1A1A] dark:text-stone-100">{panchanga.ritu} ऋतु</span>
              </div>

              {/* 22. अयन */}
              <div className="bg-[#FAF8F5] dark:bg-stone-800/60 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#78716C] dark:text-stone-400">अयन:</span>
                <span className="text-sm font-bold text-[#1A1A1A] dark:text-stone-100">{panchanga.ayana}</span>
              </div>

              {/* 23. संवत्सर */}
              <div className="bg-[#FAF8F5] dark:bg-stone-800/60 p-3.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-[#78716C] dark:text-stone-400">संवत्सर:</span>
                <span className="text-sm font-bold text-[#1A1A1A] dark:text-stone-100">{panchanga.samvatsara}</span>
              </div>

              {/* 24. चन्द्रमास (अधिमास / क्षयमास) */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                panchanga.masaInfo?.isAdhimasa
                  ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700'
                  : panchanga.masaInfo?.isKshayamasa
                  ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700'
                  : 'bg-[#FAF8F5] dark:bg-stone-800/60 border-[#E6E0D5] dark:border-stone-700/60'
              }`}>
                <span className="text-xs font-bold text-[#78716C] dark:text-stone-400">चन्द्रमास:</span>
                <span className={`text-sm font-bold ${
                  panchanga.masaInfo?.isAdhimasa
                    ? 'text-amber-800 dark:text-amber-300'
                    : panchanga.masaInfo?.isKshayamasa
                    ? 'text-rose-800 dark:text-rose-300'
                    : 'text-[#1A1A1A] dark:text-stone-100'
                }`}>
                  {panchanga.masaInfo?.masaName}
                </span>
              </div>
            </div>

            {/* Choghadiya Table */}
            <div className="pt-4 border-t border-[#E6E0D5] dark:border-stone-800 space-y-3">
              <h3 className="text-sm font-bold font-serif text-[#1A1A1A] dark:text-stone-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D97706]" />
                <span>दिनको चौघडिया समय तालिका (Choghadiya Timings)</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {panchanga.choghadiya.map((c, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-center space-y-1 ${
                      c.type === 'शुभ'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : c.type === 'सामान्य'
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    <span className="text-[10px] opacity-80 block">{c.time}</span>
                    <span className="text-xs font-bold block">{c.name}</span>
                    <span className="text-[9px] block font-semibold">{c.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location-Aware Planetary and Lagna Card */}
            <div className="pt-4 border-t border-[#E6E0D5] dark:border-stone-800">
              <LocalPlanetaryCard
                selectedLocation={selectedLocation}
                selectedDateAD={selectedDateAD}
                panchanga={panchanga}
                onOpenLocationModal={() => setIsLocationModalOpen(true)}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 1B: DEDICATED LOCATION-AWARE PLANETARY & LAGNA VIEW */}
      {activeTab === 'planetary' && (
        <div className="space-y-6">
          <LocalPlanetaryCard
            selectedLocation={selectedLocation}
            selectedDateAD={selectedDateAD}
            panchanga={panchanga}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
          />
        </div>
      )}

      {/* TAB 2: NEPALI PATRO / CALENDAR */}
      {activeTab === 'patro' && (
        <div className="space-y-6">
          <NepaliCalendarView onNavigateToPanchanga={() => setActiveTab('daily')} />
        </div>
      )}

      {/* TAB 3: DAILY HOROSCOPE / RASHIFAL */}
      {activeTab === 'rashifal' && (
        <div className="space-y-6">
          <DailyHoroscopeView
            activeProfile={activeProfile || null}
            profiles={profiles || []}
            todayPanchanga={panchanga}
            transitPlanets={todayTransitPlanets || []}
            natalPlanets={natalPlanets || []}
            lagna={lagna || {
              rashiId: 1,
              rashiName: 'मेष',
              degree: 0,
              formattedDegree: "००°००'",
              nakshatraName: 'अश्विनी',
              pada: 1,
              lord: 'मङ्गल'
            }}
            dasha={dasha || {
              birthMoonDegree: 0,
              balanceAtBirth: {
                planet: 'केतु',
                yearsLeft: 7,
                monthsLeft: 0,
                daysLeft: 0
              },
              mahadashas: []
            }}
            onSelectProfile={onSelectProfile || (() => {})}
            onNewProfile={onNewProfile || (() => {})}
          />
        </div>
      )}

      {/* TAB 4: DATE CONVERTER & MULTI-SAMBAT */}
      {activeTab === 'converter' && (
        <div className="space-y-6">
          <DateConverterView 
            onNavigateTab={(tab) => {
              if (tab === 'panchanga') {
                setActiveTab('daily');
              }
            }}
          />
        </div>
      )}

      {/* TAB 2B: QUICK MONTHLY BS CALENDAR VIEW */}
      {(activeTab as string) === 'monthly' && (
        <div className="space-y-6">
          {/* Month Navigator Header */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={handlePrevMonth}
              className="px-3.5 py-2 bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#E6E0D5] dark:hover:bg-stone-700 text-[#2D241E] dark:text-stone-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>अघिल्लो महिना</span>
            </button>

            <div className="text-center">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <h2 className="text-xl font-bold font-serif text-[#1A1A1A] dark:text-stone-100">
                  {NEPALI_MONTH_NAMES[calBSMonth - 1]} {toDevanagariNumerals(calBSYear)}
                </h2>
                {monthlyData[0]?.panchanga?.masaInfo?.isAdhimasa && (
                  <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
                    ✨ अधिकमास (पुरुषोत्तम महिना)
                  </span>
                )}
                {monthlyData[0]?.panchanga?.masaInfo?.isKshayamasa && (
                  <span className="bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
                    ⚠️ क्षयमास
                  </span>
                )}
              </div>
              <span className="text-xs text-[#78716C] dark:text-stone-400 block mt-0.5">
                मासिक विक्रम संवत् पात्रो | कुल {toDevanagariNumerals(monthlyData.length)} दिन
              </span>
            </div>

            <button
              onClick={handleNextMonth}
              className="px-3.5 py-2 bg-[#FAF8F5] dark:bg-stone-800 hover:bg-[#E6E0D5] dark:hover:bg-stone-700 text-[#2D241E] dark:text-stone-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>अर्को महिना</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Monthly Calendar Grid */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-sm overflow-x-auto">
            <div className="min-w-[700px]">
              {/* 7 Days Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2 text-center font-bold text-xs border-b border-[#E6E0D5] dark:border-stone-800 pb-2">
                <span className="text-[#2D241E] dark:text-stone-300">आइतबार</span>
                <span className="text-[#2D241E] dark:text-stone-300">सोमबार</span>
                <span className="text-[#2D241E] dark:text-stone-300">मङ्गलबार</span>
                <span className="text-[#2D241E] dark:text-stone-300">बुधबार</span>
                <span className="text-[#2D241E] dark:text-stone-300">बिहीबार</span>
                <span className="text-[#2D241E] dark:text-stone-300">शुक्रबार</span>
                <span className="text-rose-600 dark:text-rose-400">शनिबार</span>
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Offset blank cells for first day of month */}
                {Array.from({ length: monthlyData[0]?.panchanga?.vaar?.name ? ['आइतबार', 'सोमबार', 'मङ्गलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'].indexOf(monthlyData[0].panchanga.dayNameNepali) : 0 }).map((_, i) => (
                  <div key={`blank_${i}`} className="bg-[#FAF8F5]/50 dark:bg-stone-800/20 border border-transparent rounded-xl h-28" />
                ))}

                {monthlyData.map((dayItem) => {
                  const isSelected = selectedDateAD === dayItem.dateAD;
                  const isSaturday = dayItem.panchanga.dayNameNepali === 'शनिबार';
                  const hasFestivals = dayItem.festivals.length > 0;

                  return (
                    <button
                      key={dayItem.bsDay}
                      onClick={() => {
                        setSelectedDateAD(dayItem.dateAD);
                        setActiveTab('daily');
                      }}
                      className={`p-2 rounded-xl border text-left transition-all h-28 flex flex-col justify-between group ${
                        isSelected
                          ? 'border-[#D97706] bg-[#D97706]/10 ring-2 ring-[#D97706]'
                          : 'border-[#E6E0D5] dark:border-stone-800 bg-[#FDFCF8] dark:bg-stone-800/80 hover:bg-[#FAF8F5] dark:hover:bg-stone-700/80'
                      }`}
                    >
                      <div className="flex items-start justify-between w-full">
                        <span
                          className={`text-base font-bold font-serif ${
                            isSaturday
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-[#1A1A1A] dark:text-stone-100'
                          }`}
                        >
                          {toDevanagariNumerals(dayItem.bsDay)}
                        </span>
                        <span className="text-[10px] text-[#A8A29E] dark:text-stone-400 font-medium">
                          {dayItem.panchanga.tithi.name}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] text-[#78716C] dark:text-stone-400 block truncate font-medium">
                          नक्षत्र: {dayItem.panchanga.nakshatra.name}
                        </span>

                        {hasFestivals && (
                          <span className="bg-[#D97706] text-white text-[9px] font-bold px-1.5 py-0.5 rounded block truncate shadow-2xs">
                            {dayItem.festivals[0]}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FESTIVALS & SPECIAL DAYS DIRECTORY */}
      {activeTab === 'festivals' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-sm space-y-4">
            <h2 className="text-lg font-bold font-serif text-[#1A1A1A] dark:text-stone-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D97706]" />
              <span>वर्षका मुख्य धार्मिक, सांस्कृतिक तथा राष्ट्रिय चाडपर्वहरू</span>
            </h2>

            <p className="text-xs text-[#78716C] dark:text-stone-400">
              विक्रम संवत् २०८३ सालका मुख्य धार्मिक तिथि, एकादशी, पूर्णिमा, औंसी, सङ्क्रान्ति तथा पर्वहरूको विवरण।
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { title: 'नववर्ष तथा वसन्त पर्व', desc: 'वैशाख १ गते नयाँ वर्ष, मातातीर्थ औंसी, बुद्ध जयन्ती' },
                { title: 'साउने सङ्क्रान्ति र तीज', desc: 'साउने १ सङ्क्रान्ति, नाग पञ्चमी, जनै पूर्णिमा, श्रीकृष्ण जन्माष्टमी, हरितालिका तीज' },
                { title: 'बडादशैँ (विजयादशमी)', desc: 'घटस्थापना, फूलपाती, महाअष्टमी, महानवमी र विजयादशमी टीका' },
                { title: 'तिहार तथा छठ पर्व', desc: 'काग तिहार, कुकुर तिहार, लक्ष्मीपूजा, भाइटीका, छठ पर्व' },
                { title: 'माघे सङ्क्रान्ति र शिवरात्रि', desc: 'माघे सङ्क्रान्ति, श्रीपञ्चमी (सरस्वती पूजा), महाशिवरात्रि' },
                { title: 'फागु पूर्णिमा (होली)', desc: 'होली, घोडेजात्रा, रामनवमी, चैते दशैँ' },
              ].map((f, idx) => (
                <div key={idx} className="bg-[#FAF8F5] dark:bg-stone-800/80 border border-[#E6E0D5] dark:border-stone-700/80 p-4 rounded-xl space-y-1">
                  <span className="text-sm font-bold text-[#D97706] block">{f.title}</span>
                  <span className="text-xs text-[#2D241E] dark:text-stone-300 block">{f.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PANCHANGA TEST SUITE & VERIFICATION */}
      {activeTab === 'test_suite' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
              <div>
                <h2 className="text-lg font-bold font-serif text-[#1A1A1A] dark:text-stone-100 flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span>पञ्चाङ्ग गणना शुद्धता परीक्षण प्रणाली (Testing Suite)</span>
                </h2>
                <p className="text-xs text-[#78716C] dark:text-stone-400 mt-0.5">
                  विक्रम संवत्, तिथि, नक्षत्र, सूर्योदय, समय सीमा र भाषा शुद्धताको स्वचालित परीक्षण।
                </p>
              </div>

              <button
                onClick={handleRunTests}
                className="px-3.5 py-2 bg-[#D97706] hover:bg-[#B45309] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>पुनः परीक्षण गर्नुहोस्</span>
              </button>
            </div>

            {testSuiteResults && (
              <div className="space-y-4">
                {/* Summary Banner */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  testSuiteResults.isAllPassed
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="text-sm font-bold block">
                        परीक्षण नतिजा: {toDevanagariNumerals(testSuiteResults.passedCount)} / {toDevanagariNumerals(testSuiteResults.totalTests)} सफल
                      </span>
                      <span className="text-xs opacity-90 block">
                        {testSuiteResults.isAllPassed ? 'सबै पञ्चाङ्ग गणना र भाषा नियम पूर्ण रूपमा प्रमाणित छन्।' : 'केही परीक्षणमा सुधार आवश्यक छ।'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Individual Test Cards */}
                <div className="space-y-2.5">
                  {testSuiteResults.results.map((res) => (
                    <div key={res.id} className="p-3.5 bg-[#FAF8F5] dark:bg-stone-800/80 border border-[#E6E0D5] dark:border-stone-700/80 rounded-xl flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#D97706]">{res.category}:</span>
                          <span className="text-xs font-bold text-[#1A1A1A] dark:text-stone-100">{res.testNameNepali}</span>
                        </div>
                        <p className="text-xs text-[#78716C] dark:text-stone-400 mt-1 font-mono">{res.detailsNepali}</p>
                      </div>

                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md shrink-0 ${
                        res.passed 
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                          : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200'
                      }`}>
                        {res.passed ? 'सफल ✓' : 'विफल ✗'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🌟 1-Page Balananda Daily Panchanga Print / PDF / WhatsApp PNG Modal */}
      {isDailyLetterheadPrintOpen && (
        <DailyPanchangaPrintModal
          isOpen={isDailyLetterheadPrintOpen}
          onClose={() => setIsDailyLetterheadPrintOpen(false)}
          panchanga={panchanga}
          orgProfile={orgProfile}
          todayBS={`${toDevanagariNumerals(currentBS.year)}/${toDevanagariNumerals(currentBS.month)}/${toDevanagariNumerals(currentBS.day)}`}
          todayAD={selectedDateAD}
          locationName={selectedLocation.name}
          astrologerName={orgProfile?.astrologerName || 'ज्योतिषाचार्य सुकदेव शर्मा'}
        />
      )}

      {/* Print Preview & PDF Export Modal */}
      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        panchanga={panchanga}
        selectedDateAD={selectedDateAD}
        defaultReportType="panchanga"
      />

      {/* Quick Date Converter Modal */}
      {isDateConverterOpen && (
        <QuickDateConverter
          mode="modal"
          isOpen={isDateConverterOpen}
          onClose={() => setIsDateConverterOpen(false)}
          onApplyDate={(res) => {
            setSelectedDateAD(res.dateAD);
            setCalBSYear(res.yearBS);
            setCalBSMonth(res.monthBS);
          }}
        />
      )}

      {/* Global Location Selector Modal */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        selectedLocation={selectedLocation}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
      />
    </div>
  );
};

