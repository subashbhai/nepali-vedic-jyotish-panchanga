import React, { useState } from 'react';
import {
  Sparkles,
  Grid,
  Table,
  Info,
  Layers,
  Printer,
  AlertTriangle,
  Eye,
  Zap,
  ArrowRight,
  Download,
  Check,
  Loader2,
  FileText,
  Users,
  Compass
} from 'lucide-react';
import {
  BirthDetails,
  LagnaInfo,
  PlanetPosition,
  DivisionalChart,
  DivisionalChartType,
  VimshottariDashaResult,
  PanchangaData,
  AyanamsaSystem
} from '../types/astrology';
import { generateDivisionalChart } from '../utils/astroCalculations';
import { calculateBhavaAndDrishtiSystem, GrahaDrishtiItem } from '../utils/bhavaDrishtiEngine';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { AYANAMSA_SYSTEM_LIST } from '../utils/ayanamsaEngine';
import { exportKundaliPDF } from '../utils/pdfGenerator';
import { KundaliInteractiveChart, KundaliAspectReportTable } from './KundaliInteractiveChart';
import { RegionalChartStyleSelector } from './RegionalChartStyleSelector';
import { InteractivePlanetPopup } from './InteractivePlanetPopup';
import { BirthDetailsPanel } from './jyotish/BirthDetailsPanel';
import { PanchangaPanel } from './jyotish/PanchangaPanel';
import { VimshottariDashaPanel } from './jyotish/VimshottariDashaPanel';
import { PlanetPositionTable } from './jyotish/PlanetPositionTable';
import { BhavaTable } from './jyotish/BhavaTable';
import { PrintPreviewModal } from './PrintPreviewModal';
import { PrintableKundaliDocument } from './jyotish/PrintableKundaliDocument';
import { DetailedKundaliPdfModal } from './jyotish/DetailedKundaliPdfModal';
import { FamilyKundaliMergedPdfModal } from './jyotish/FamilyKundaliMergedPdfModal';
import { ReportActionToolbar } from './common/ReportActionToolbar';

interface KundaliViewProps {
  profile: BirthDetails;
  profiles?: BirthDetails[];
  lagna: LagnaInfo;
  planets: PlanetPosition[];
  dasha?: VimshottariDashaResult;
  panchanga?: PanchangaData;
  chartStyle: 'North Indian' | 'South Indian' | 'East Indian';
  onChangeChartStyle: (style: 'North Indian' | 'South Indian' | 'East Indian') => void;
  ayanamsaSystem?: AyanamsaSystem;
  onChangeAyanamsaSystem?: (system: AyanamsaSystem) => void;
  orgProfile?: any;
  onNavigateToTab?: (tab: string) => void;
}

const DIVISIONAL_TYPES: Array<{ type: DivisionalChartType; label: string }> = [
  { type: 'D1', label: 'D-1 (जन्म लग्न कुण्डली)' },
  { type: 'D9', label: 'D-9 (नवांश कुण्डली - भाग्य/विवाह)' },
  { type: 'D10', label: 'D-10 (दशांश / करियर/व्यवसाय)' },
  { type: 'D2', label: 'D-2 (होरा / धन-सम्पत्ति)' },
  { type: 'D3', label: 'D-3 (द्रेष्काण / पराक्रम/भाइ-बहिनी)' },
  { type: 'D4', label: 'D-4 (चतुर्थांश / घर-जग्गा सुख)' },
  { type: 'D7', label: 'D-7 (सप्तमांश / सन्तान सुख)' },
  { type: 'D12', label: 'D-12 (द्वादशांश / माता-पिता)' },
  { type: 'D16', label: 'D-16 (षोडशांश / वाहन/भौतिक सुख)' },
  { type: 'D20', label: 'D-20 (विंशांश / अध्यात्म/उपासना)' },
  { type: 'D24', label: 'D-24 (चतुर्विंशांश / उच्च विद्या)' },
  { type: 'D27', label: 'D-27 (सप्तविंशांश / मानसिक बल)' },
  { type: 'D30', label: 'D-30 (त्रिंशांश / अनिष्ट/रोग)' },
  { type: 'D40', label: 'D-40 (खवेदांश / वंश परम्परा)' },
  { type: 'D45', label: 'D-45 (अक्षवेदांश / नैतिक चरित्र)' },
  { type: 'D60', label: 'D-60 (षष्ट्यंश / सूक्ष्म कर्माधिकार)' },
];

export const KundaliView: React.FC<KundaliViewProps> = ({
  profile,
  profiles,
  lagna,
  planets,
  dasha,
  panchanga,
  chartStyle,
  onChangeChartStyle,
  ayanamsaSystem = 'Chitrapaksha',
  onChangeAyanamsaSystem,
  orgProfile,
  onNavigateToTab,
}) => {
  const [selectedDivType, setSelectedDivType] = useState<DivisionalChartType>('D1');
  const [activeSubTab, setActiveSubTab] = useState<'rashi' | 'chalit' | 'bhavas' | 'drishti' | 'bhavesh' | 'table'>('rashi');
  const [selectedPlanetModal, setSelectedPlanetModal] = useState<PlanetPosition | null>(null);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState<boolean>(false);
  const [isDetailedPdfModalOpen, setIsDetailedPdfModalOpen] = useState<boolean>(false);
  const [isFamilyMergedPdfModalOpen, setIsFamilyMergedPdfModalOpen] = useState<boolean>(false);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);
  const [ayanamsaNotice, setAyanamsaNotice] = useState<string | null>(null);

  const handleExportPDF = async () => {
    try {
      setIsExportingPDF(true);
      const sanitizedName = (profile.name || 'Jatak').trim().replace(/\s+/g, '_');
      const filename = `Formal_Kundali_Report_${sanitizedName}_${selectedDivType}.pdf`;
      const success = await exportKundaliPDF('printable-kundali-document', filename);
      if (success) {
        setPdfSuccessMessage(`औपचारिक कुण्डली जन्मचार्ट, ग्रहस्थिति तथा विंशोत्तरी दशा A4 PDF (${filename}) सफलतापूर्वक डाउनलोड भयो।`);
        setTimeout(() => setPdfSuccessMessage(null), 5000);
      } else {
        setPdfSuccessMessage('PDF तयार गर्न सकिएन। कृपया पुनः प्रयास गर्नुहोस्।');
        setTimeout(() => setPdfSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to export Kundali PDF:', err);
      setPdfSuccessMessage('PDF निर्यातमा समस्या आयो। कृपया पुनः प्रयास गर्नुहोस्।');
      setTimeout(() => setPdfSuccessMessage(null), 4000);
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Compute effective PanchangaData fallback if not explicitly provided
  const moonPlanet = planets.find((p) => p.name === 'चन्द्र') || planets[0];
  const effectivePanchanga: PanchangaData = panchanga || {
    vikramSamvat: 2081,
    sakaSamvat: 1946,
    dateAD: profile.dateAD || '',
    dateBS: profile.dateBS ? (profile.dateBS.startsWith('वि.सं.') ? profile.dateBS : `वि.सं. ${profile.dateBS}`) : '',
    dayNameNepali: 'शुभ दिन',
    dayNameSanskrit: 'शुभवासरः',
    masaInfo: {
      isAdhimasa: false,
      isKshayamasa: false,
      masaType: 'शुद्ध मास',
      masaName: moonPlanet?.rashiName || 'वैशाख',
      details: '',
    },
    tithi: {
      number: 1,
      name: 'शुक्ल प्रतिपदा',
      paksha: 'शुक्ल',
      endTime: '',
      percentageRemaining: 80,
    },
    vaar: { name: 'आइतबार', lord: 'सूर्य' },
    nakshatra: {
      number: moonPlanet?.nakshatraId || 1,
      name: moonPlanet?.nakshatraName || 'अश्विनी',
      lord: moonPlanet?.nakshatraLord || 'केतु',
      pada: moonPlanet?.pada || 1,
      endTime: '',
    },
    yoga: { number: 1, name: 'विष्कुम्भ', endTime: '' },
    karana: { number: 1, name: 'बव', endTime: '' },
    sunrise: '०६:०५ AM',
    sunset: '०६:३५ PM',
    moonrise: '०२:१५ PM',
    moonset: '०२:३० AM',
    moonRashi: moonPlanet?.rashiName || 'मेष',
    rahuKaal: { start: '१०:३०', end: '१२:००' },
    yamaganda: { start: '१२:००', end: '०१:३०' },
    gulika: { start: '०१:३०', end: '०३:००' },
    abhijitMuhurta: { start: '११:४५', end: '१२:३५' },
    brahmaMuhurta: { start: '०४:३०', end: '०५:१५' },
    pradoshaTime: { start: '०६:३५', end: '०८:०५' },
    choghadiya: [
      { time: '०६:०५ - ०७:३५', name: 'अमृत', type: 'शुभ' },
      { time: '०७:३५ - ०९:०५', name: 'काल', type: 'अशुभ' },
      { time: '०९:०५ - १०:३५', name: 'शुभ', type: 'शुभ' },
    ],
    sunRashi: (planets.find(p => p.name === 'सूर्य')?.rashiName || 'मेष') as any,
    ritu: 'वसन्त',
    ayana: 'उत्तरायण',
    samvatsara: 'क्रोधन',
  };

  // Generate selected divisional chart
  const currentChart: DivisionalChart = generateDivisionalChart(selectedDivType, lagna, planets);

  // Calculate full Bhava, Chalit, Aspects, and Bhavesh System
  const bhavaSystem = calculateBhavaAndDrishtiSystem(lagna, planets, 'Sripati', true);

  return (
    <div className="space-y-6">
      {/* Lagna Boundary Warning Banner */}
      {bhavaSystem.lagnaSensitivity.isNearBoundary && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 p-4 rounded-2xl flex items-start gap-3 text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">{bhavaSystem.lagnaSensitivity.warningMessageNepali}</p>
            <p className="text-[11px] text-amber-800 dark:text-amber-300">
              संकेत: उच्च शुद्धताका लागि जन्म समय (+/- १५ सेकेन्ड) सूक्ष्म परीक्षण गर्नुहोस्।
            </p>
          </div>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold font-serif text-[#1A1A1A] dark:text-stone-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D97706]" />
            <span>{currentChart.titleNepali}</span>
          </h2>
          <p className="text-xs text-[#78716C] dark:text-stone-400 mt-0.5">{currentChart.description}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Divisional Chart Selector */}
          <select
            value={selectedDivType}
            onChange={(e) => setSelectedDivType(e.target.value as DivisionalChartType)}
            className="bg-[#FDFCF8] dark:bg-stone-800 text-[#2D241E] dark:text-stone-100 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#D97706]"
          >
            {DIVISIONAL_TYPES.map((d) => (
              <option key={d.type} value={d.type}>
                {d.label}
              </option>
            ))}
          </select>

          {/* Chart Style Selector */}
          <select
            value={chartStyle}
            onChange={(e) => onChangeChartStyle(e.target.value as any)}
            className="bg-[#FDFCF8] dark:bg-stone-800 text-[#2D241E] dark:text-stone-100 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#D97706]"
          >
            <option value="North Indian">उत्तरी शैली (North Indian Diamond)</option>
            <option value="South Indian">दक्षिणी शैली (South Indian Grid)</option>
            <option value="East Indian">पूर्वी शैली (East Indian)</option>
          </select>

          {/* Quick Ayanamsa System Selector */}
          {onChangeAyanamsaSystem && (
            <div className="flex items-center gap-1.5 bg-amber-50/80 dark:bg-stone-800 border border-amber-300/80 dark:border-amber-900/60 rounded-xl px-2.5 py-1 text-xs">
              <Compass className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
              <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 hidden sm:inline">अयनांश:</span>
              <select
                id="kundali-ayanamsa-quick-selector"
                value={ayanamsaSystem === 'Lahiri' ? 'Chitrapaksha' : (ayanamsaSystem || 'Chitrapaksha')}
                onChange={(e) => {
                  const newSys = e.target.value as AyanamsaSystem;
                  onChangeAyanamsaSystem(newSys);
                  const meta = AYANAMSA_SYSTEM_LIST.find((s) => s.id === newSys);
                  setAyanamsaNotice(`${meta?.shortLabel || newSys} अयनांश अनुसार सक्रिय कुण्डली पुनर्गणना गरियो!`);
                  setTimeout(() => setAyanamsaNotice(null), 4000);
                }}
                className="bg-transparent text-[#2D241E] dark:text-stone-100 font-semibold focus:outline-none cursor-pointer text-xs"
                title="अयनांश प्रणाली परिवर्तन गर्दा कुण्डली, ग्रह स्पष्ट अंश र दशा स्वतः पुनर्गणना हुन्छ"
              >
                {AYANAMSA_SYSTEM_LIST.map((sys) => (
                  <option key={sys.id} value={sys.id} className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">
                    {sys.shortLabel} {sys.isNationalStandard ? '★' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Generate Detailed PDF Report Button */}
          <button
            id="generate-detailed-pdf-btn"
            data-testid="generate-detailed-pdf-button"
            onClick={() => setIsDetailedPdfModalOpen(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-[#7A1C1C] to-[#991B1B] hover:from-[#5C1515] hover:to-[#7A1C1C] text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs hover:shadow-md transition-all cursor-pointer border border-amber-400/40"
            title="Generate Detailed multi-page Kundali PDF Report (Full birth chart analysis, planetary table, and 120-year Vimshottari dasha)"
          >
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>Generate Detailed PDF Report</span>
            <span className="hidden xl:inline-block px-1.5 py-0.2 text-[9px] bg-amber-400 text-stone-900 rounded font-bold">
              ३-पृष्ठ
            </span>
          </button>

          {/* Unified Report Actions: Print, Download PDF, WhatsApp Share */}
          <ReportActionToolbar
            elementId="printable-kundali-document"
            reportTitle={`जन्मकुण्डली_${profile.name || 'Jatak'}`}
            clientName={profile.name}
            clientPhone={profile.phone}
            dateBS={profile.dateBS}
            orgName={orgProfile?.name}
            orgPhone={orgProfile?.phone}
            onCustomExportPDF={handleExportPDF}
            customSummaryText={`• नाम: ${profile.name} | जन्म मिति: वि.सं. ${profile.dateBS || ''} (${profile.time})\n• जन्म स्थान: ${profile.location?.name || 'नेपाल'}\n• लग्न: ${lagna.rashiName} लग्न | राशि: ${planets.find(p => p.name === 'चन्द्र')?.rashiName || 'अज्ञात'}`}
          />

          {/* Export Multiple Profiles into a Merged PDF (Family Kundali Collection) */}
          <button
            id="export-family-pdf-btn"
            data-testid="export-family-pdf-button"
            onClick={() => setIsFamilyMergedPdfModalOpen(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-[#B45309] to-[#7A1C1C] hover:from-[#92400E] hover:to-[#5C1515] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs hover:shadow-md transition-all cursor-pointer border border-amber-300/40"
            title="Export multiple profiles' charts into a single merged PDF file (पारिवारिक कुण्डली सङ्ग्रह)"
          >
            <Users className="w-3.5 h-3.5 text-amber-200" />
            <span>पारिवारिक कुण्डली</span>
          </button>

          {/* Print Preview & Detailed Modal Trigger */}
          <button
            onClick={() => setIsPrintPreviewOpen(true)}
            className="px-3.5 py-1.5 bg-[#7A1C1C] hover:bg-[#5C1515] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="कुण्डली तथा पञ्चाङ्गको A4 मुद्रण प्रिभ्यु हेर्नुहोस्"
          >
            <Printer className="w-3.5 h-3.5 text-amber-300" />
            <span>विस्तृत मुद्रण</span>
          </button>
        </div>
      </div>

      {/* PDF Export Success / Status Toast Banner */}
      {pdfSuccessMessage && (
        <div className="flex items-center justify-between gap-2 p-3 bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 rounded-2xl text-xs text-amber-900 dark:text-amber-200 shadow-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{pdfSuccessMessage}</span>
          </div>
          <button
            onClick={() => setPdfSuccessMessage(null)}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Ayanamsa Change & Recalculation Notice */}
      {ayanamsaNotice && (
        <div className="flex items-center justify-between gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 shadow-2xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{ayanamsaNotice}</span>
          </div>
          <button
            onClick={() => setAyanamsaNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 dark:hover:text-emerald-100 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveSubTab('rashi')}
          className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeSubTab === 'rashi' ? 'bg-[#D97706] text-white font-bold shadow-xs' : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>राशी कुण्डली ({selectedDivType})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('chalit')}
          className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeSubTab === 'chalit' ? 'bg-[#D97706] text-white font-bold shadow-xs' : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>भावचलित कुण्डली</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bhavas')}
          className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeSubTab === 'bhavas' ? 'bg-[#D97706] text-white font-bold shadow-xs' : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>१२ भाव विवरण</span>
        </button>

        <button
          onClick={() => setActiveSubTab('drishti')}
          className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeSubTab === 'drishti' ? 'bg-[#D97706] text-white font-bold shadow-xs' : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>ग्रहदृष्टि तथा युति</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bhavesh')}
          className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeSubTab === 'bhavesh' ? 'bg-[#D97706] text-white font-bold shadow-xs' : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>भावेश स्थिति</span>
        </button>

        <button
          onClick={() => setActiveSubTab('table')}
          className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-colors ${
            activeSubTab === 'table' ? 'bg-[#D97706] text-white font-bold shadow-xs' : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>निरयन ग्रहस्थिति तालिका</span>
        </button>
      </div>

      {/* Sub-Tab Content Views */}
      {activeSubTab === 'rashi' && (
        <div className="space-y-6">
          {/* Regional Chart Style Selector (North Indian, South Indian, East Indian) */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-xs">
            <RegionalChartStyleSelector
              currentStyle={chartStyle}
              onSelectStyle={(style) => onChangeChartStyle(style)}
            />
          </div>

          {/* 3-Block Equal Grid: LHS = विवरण, बीचमा = कुण्डली, RHS = जन्मकालीन पञ्चाङ्ग */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-5 items-start w-full">
            {/* Block 1 (LHS): जन्म विवरण */}
            <div className="w-full">
              <BirthDetailsPanel
                profile={profile}
                panchanga={effectivePanchanga}
                lagna={lagna}
                onEdit={() => onNavigateToTab?.('profiles')}
                onPrint={() => setIsPrintPreviewOpen(true)}
              />
            </div>

            {/* Block 2 (बीचमा): मुख्य जन्मकुण्डली (Middle) */}
            <div className="bg-[#FAF7F2] dark:bg-stone-900/80 rounded-2xl sm:rounded-3xl border border-[#E6E0D5] dark:border-stone-800 p-3.5 sm:p-5 shadow-xs flex flex-col items-center w-full">
              <div className="w-full flex items-center justify-between flex-wrap gap-2 mb-3">
                <span className="text-xs bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 px-3 py-1 rounded-full font-bold border border-amber-300 dark:border-amber-800 tracking-wide shadow-xs truncate">
                  {currentChart.titleNepali} — {lagna.rashiName} लग्न ({lagna.formattedDegree})
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    id="chart-detailed-pdf-btn"
                    onClick={() => setIsDetailedPdfModalOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 bg-[#7A1C1C] hover:bg-[#5C1515] text-white border border-amber-400/40 rounded-lg font-bold shadow-2xs transition-colors cursor-pointer"
                    title="विस्तृत ३-पृष्ठीय कुण्डली PDF प्रतिवेदन हेर्नुहोस् र डाउनलोड गर्नुहोस्"
                  >
                    <FileText className="w-3 h-3 text-amber-300" />
                    <span>Detailed PDF</span>
                  </button>

                  <button
                    id="chart-download-pdf-btn"
                    onClick={handleExportPDF}
                    disabled={isExportingPDF}
                    className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 bg-white dark:bg-stone-800 hover:bg-amber-50 dark:hover:bg-stone-700 text-[#7A1C1C] dark:text-amber-300 border border-amber-300 dark:border-stone-700 rounded-lg font-bold shadow-2xs transition-colors cursor-pointer"
                    title="Download formal printable birth chart document (A4 PDF)"
                  >
                    {isExportingPDF ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Download className="w-3 h-3 text-[#D97706]" />
                    )}
                    <span>PDF</span>
                  </button>
                </div>
              </div>

              <div className="w-full">
                <KundaliInteractiveChart 
                  houses={currentChart.houses}
                  lagnaRashiId={lagna.rashiId}
                  chartStyle={chartStyle}
                  chartTitle={currentChart.titleNepali}
                  onPlanetSelect={(p) => setSelectedPlanetModal(p)}
                />
              </div>

              {/* Legend Badges */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-[#78716C] dark:text-stone-300 font-medium">
                <span className="flex items-center gap-1 bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-[#E6E0D5] dark:border-stone-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> सूर्य
                </span>
                <span className="flex items-center gap-1 bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-[#E6E0D5] dark:border-stone-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-200 border border-sky-400 inline-block" /> चन्द्रमा
                </span>
                <span className="flex items-center gap-1 bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-[#E6E0D5] dark:border-stone-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" /> मंगल
                </span>
                <span className="flex items-center gap-1 bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-[#E6E0D5] dark:border-stone-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> गुरु
                </span>
                <span className="flex items-center gap-1 bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-[#E6E0D5] dark:border-stone-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-200 border border-purple-400 inline-block" /> शुक्र
                </span>
                <span className="flex items-center gap-1 bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-[#E6E0D5] dark:border-stone-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" /> शनि
                </span>
                <span className="flex items-center gap-1 bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-[#E6E0D5] dark:border-stone-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> बुध / राहु / केतु
                </span>
              </div>
            </div>

            {/* Block 3 (RHS): जन्मकालीन पञ्चाङ्ग (कुण्डलीको दायाँ) */}
            <div className="w-full">
              <PanchangaPanel
                panchanga={effectivePanchanga}
                profile={profile}
                lagna={lagna}
                planets={planets}
                title="जन्मकालीन पञ्चाङ्ग"
              />
            </div>
          </div>

          {/* Dasha System */}
          <div className="w-full">
            <VimshottariDashaPanel dasha={dasha} />
          </div>

          {/* Detailed Planetary & Bhava Summary Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PlanetPositionTable lagna={lagna} planets={planets} />
            <BhavaTable lagna={lagna} planets={planets} />
          </div>
        </div>
      )}

      {activeSubTab === 'chalit' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-6 shadow-sm space-y-4">
          <div className="bg-amber-50 dark:bg-stone-800/60 p-3 rounded-xl border border-amber-200 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300">
            <p className="font-bold text-[#D97706] mb-1">भावचलित कुण्डली (Sripati Equal House Chalit Chart)</p>
            <p>
              राशी कुण्डलीमा ग्रहको राशि स्थिति देखाइन्छ भने भावचलित कुण्डलीमा लग्नको वास्तविक मध्य अंश (Lagna Degree = {lagna.formattedDegree}) अनुसार ग्रह कुन वास्तविक भाव (१ देखि १२) मा पर्छ भन्ने निर्धारण गरिन्छ।
            </p>
          </div>

          <div className="w-full">
            <KundaliInteractiveChart
              houses={bhavaSystem.bhavachalitHouses.map((bh) => ({
                houseNumber: bh.houseNumber,
                rashiName: bh.rashiName,
                planets: bh.planets,
              }))}
              lagnaRashiId={lagna.rashiId}
              chartStyle={chartStyle}
              isChalit={true}
              chartTitle="उन्नत भावचलित कुण्डली (Interactive Chalit Chart)"
              onPlanetSelect={(p) => setSelectedPlanetModal(p)}
            />
          </div>
        </div>
      )}

      {activeSubTab === 'bhavas' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
            <h3 className="text-md font-bold font-serif text-[#1A1A1A] dark:text-stone-100 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#D97706]" />
              <span>१२ भावको विस्तृत संरचना, भावेश, भावमध्य तथा ग्रह स्थिति</span>
            </h3>
            <span className="text-xs text-[#78716C] dark:text-stone-400 font-medium">
              पद्धति: {bhavaSystem.calculationSystemNepali}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bhavaSystem.bhavas.map((b) => (
              <div
                key={b.houseNumber}
                className="bg-[#FDFCF8] dark:bg-stone-800/50 rounded-xl p-4 border border-[#E6E0D5] dark:border-stone-700 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#1A1A1A] dark:text-stone-100">
                    भाव {toDevanagariNumerals(b.houseNumber)} ({b.rashiName} राशि)
                  </span>
                  <div className="flex gap-1 text-[10px]">
                    {b.isKendra && <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">केन्द्र</span>}
                    {b.isTrikona && <span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-bold">त्रिकोण</span>}
                    {b.isUpachaya && <span className="bg-sky-100 text-sky-900 px-1.5 py-0.5 rounded font-bold">उपचय</span>}
                    {b.isDushtasthana && <span className="bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded font-bold">त्रिक (६/८/१२)</span>}
                    {b.isMaraka && <span className="bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded font-bold">मारक</span>}
                  </div>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 font-medium">{b.domainNepali}</p>

                <div className="text-xs text-stone-600 dark:text-stone-400 space-y-1 pt-1 border-t border-stone-200 dark:border-stone-700">
                  <div className="flex justify-between">
                    <span>भावेश (Lord): <strong className="text-stone-900 dark:text-stone-100">{b.lord}</strong></span>
                    <span>भावमध्य: <strong className="text-stone-900 dark:text-stone-100">{b.formattedMadhya}</strong></span>
                  </div>

                  <div>
                    <span>राशी कुण्डलीमा ग्रह: </span>
                    {b.planetsRashi.length > 0 ? (
                      <span className="font-bold text-[#D97706]">
                        {b.planetsRashi.map((p) => p.name).join(', ')}
                      </span>
                    ) : (
                      <span className="text-stone-400">कुनै छैन</span>
                    )}
                  </div>

                  <div>
                    <span>भावचलितमा ग्रह: </span>
                    {b.planetsChalit.length > 0 ? (
                      <span className="font-bold text-emerald-600">
                        {b.planetsChalit.map((p) => p.name).join(', ')}
                      </span>
                    ) : (
                      <span className="text-stone-400">कुनै छैन</span>
                    )}
                  </div>

                  <div>
                    <span>भावमा परेको दृष्टि: </span>
                    {b.aspectsOnHouse.length > 0 ? (
                      <span className="font-medium text-purple-700 dark:text-purple-300">
                        {b.aspectsOnHouse.map((asp) => `${asp.aspectingPlanet} (${asp.aspectType})`).join(', ')}
                      </span>
                    ) : (
                      <span className="text-stone-400 font-normal">कुनै दृष्टि छैन</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'drishti' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-sm space-y-6">
          {/* Interactive Aspect Visualizer Kundali */}
          <div>
            <h3 className="text-md font-bold font-serif text-[#1A1A1A] dark:text-stone-100 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D97706]" />
              <span>प्रत्यक्ष ग्रहदृष्टि नक्साङ्कन कुण्डली (Interactive Aspect Map)</span>
            </h3>
            <p className="text-xs text-stone-500 mb-3">
              कुनै पनि ग्रहमा माउसको कर्सर लैजाँदा वा ट्याप गर्दा उक्त ग्रहबाट दृष्टि पर्ने भावहरूसम्म सीधा तीरहरू देखिनेछन्।
            </p>
            <KundaliInteractiveChart
              houses={currentChart.houses}
              lagnaRashiId={lagna.rashiId}
              chartTitle="प्रत्यक्ष ग्रहदृष्टि नक्साङ्कन"
              onPlanetSelect={(p) => setSelectedPlanetModal(p)}
            />
          </div>

          {/* Detailed Aspect Report Table */}
          <KundaliAspectReportTable houses={currentChart.houses} />

          {/* Graha Drishti Matrix Table */}
          <div>
            <h3 className="text-md font-bold font-serif text-[#1A1A1A] dark:text-stone-100 mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#D97706]" />
              <span>वैदिक ग्रहदृष्टि तालिका (Graha Drishti Matrix)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-b border-stone-300 dark:border-stone-700 font-semibold">
                    <th className="p-2.5">दृष्टिकर्ता ग्रह</th>
                    <th className="p-2.5">दृष्टिको प्रकार</th>
                    <th className="p-2.5">मूल भाव</th>
                    <th className="p-2.5">लक्षित भाव</th>
                    <th className="p-2.5">लक्षित राशि</th>
                    <th className="p-2.5">नेपाली विवरण</th>
                  </tr>
                </thead>
                <tbody>
                  {bhavaSystem.allDrishti.map((d, idx) => (
                    <tr key={idx} className="border-b border-stone-100 dark:border-stone-800/60 hover:bg-amber-50/50 dark:hover:bg-stone-800/40">
                      <td className="p-2.5 font-bold text-amber-800 dark:text-amber-400">{d.aspectingPlanet}</td>
                      <td className="p-2.5">
                        <span className="bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 px-2 py-0.5 rounded font-semibold text-[10px]">
                          {d.aspectType}
                        </span>
                      </td>
                      <td className="p-2.5">भाव {toDevanagariNumerals(d.sourceHouse)}</td>
                      <td className="p-2.5 font-bold">भाव {toDevanagariNumerals(d.targetHouse)}</td>
                      <td className="p-2.5">{d.targetRashiName}</td>
                      <td className="p-2.5 text-stone-600 dark:text-stone-300">{d.descriptionNepali}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Graha Yuti List */}
          <div>
            <h3 className="text-md font-bold font-serif text-[#1A1A1A] dark:text-stone-100 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#D97706]" />
              <span>ग्रह युति (Planetary Conjunctions)</span>
            </h3>

            {bhavaSystem.conjunctions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bhavaSystem.conjunctions.map((c, idx) => (
                  <div key={idx} className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold text-[#D97706]">
                      <span>{c.planet1} + {c.planet2}</span>
                      <span className="text-[11px] text-stone-500 font-normal">दूरी: {c.formattedDistance}</span>
                    </div>
                    <p className="text-stone-700 dark:text-stone-300">{c.descriptionNepali}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic">कुनै दुई ग्रह १२° भन्दा कम दूरीमा एउटै राशिमा युतिमा छैनन्।</p>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'bhavesh' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-sm space-y-4">
          <h3 className="text-md font-bold font-serif text-[#1A1A1A] dark:text-stone-100 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#D97706]" />
            <span>१२ भावेश (House Lords) हरूको स्थिति विवरण</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-b border-stone-300 dark:border-stone-700 font-semibold">
                  <th className="p-2.5">भावेश</th>
                  <th className="p-2.5">स्वामी ग्रह</th>
                  <th className="p-2.5">स्थित राशि</th>
                  <th className="p-2.5">स्थित भाव</th>
                  <th className="p-2.5">अंश</th>
                  <th className="p-2.5">नक्षत्र / पाद</th>
                  <th className="p-2.5">नेपाली विवरण</th>
                </tr>
              </thead>
              <tbody>
                {bhavaSystem.bhaveshPositions.map((bp) => (
                  <tr key={bp.houseNumber} className="border-b border-stone-100 dark:border-stone-800/60 hover:bg-stone-50 dark:hover:bg-stone-800/40">
                    <td className="p-2.5 font-bold text-[#D97706]">{bp.houseNameNepali}</td>
                    <td className="p-2.5 font-semibold">{bp.lordPlanet}</td>
                    <td className="p-2.5">{bp.residingRashiName}</td>
                    <td className="p-2.5 font-bold">भाव {toDevanagariNumerals(bp.residingHouseNumber)}</td>
                    <td className="p-2.5">{bp.formattedDegree}</td>
                    <td className="p-2.5">{bp.nakshatraName} (पाद {toDevanagariNumerals(bp.pada)})</td>
                    <td className="p-2.5 text-stone-600 dark:text-stone-300">{bp.descriptionNepali}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'table' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <h3 className="text-md font-bold font-serif text-[#1A1A1A] dark:text-stone-100 flex items-center gap-2">
              <Table className="w-4 h-4 text-[#D97706]" />
              <span>विस्तृत निरयन ग्रहस्थिति, अंश, नक्षत्र तथा पाद तालिका</span>
            </h3>

            <button
              id="table-download-pdf-btn"
              onClick={handleExportPDF}
              disabled={isExportingPDF}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-50 dark:bg-stone-800 hover:bg-amber-100 text-[#7A1C1C] dark:text-amber-300 border border-amber-300 dark:border-stone-700 rounded-xl font-bold transition-colors cursor-pointer"
              title="Download formal printable birth chart document (A4 PDF)"
            >
              {isExportingPDF ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-[#D97706]" />
              )}
              <span>Download PDF</span>
            </button>
          </div>

          <table className="w-full text-left text-xs text-[#2D241E] dark:text-stone-100 border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-[#E6E0D5] dark:border-stone-700 bg-[#F8FAFC] dark:bg-stone-800/80 text-[#64748B] dark:text-stone-300 font-semibold">
                <th className="p-2.5">ग्रह</th>
                <th className="p-2.5">राशि</th>
                <th className="p-2.5">अंश / कला / विकला</th>
                <th className="p-2.5">नक्षत्र</th>
                <th className="p-2.5">पाद</th>
                <th className="p-2.5">भाव</th>
                <th className="p-2.5">अवस्था / बल</th>
                <th className="p-2.5">गति / विशेष</th>
              </tr>
            </thead>
            <tbody>
              {/* Lagna Row */}
              <tr className="border-b border-[#F1F5F9] dark:border-stone-800/60 bg-[#FDFCF8] dark:bg-stone-800/40 font-semibold text-[#1A1A1A] dark:text-stone-100">
                <td className="p-2.5">लग्न</td>
                <td className="p-2.5">{lagna.rashiName}</td>
                <td className="p-2.5">{lagna.formattedDegree}</td>
                <td className="p-2.5">{lagna.nakshatraName}</td>
                <td className="p-2.5">{toDevanagariNumerals(lagna.pada)}</td>
                <td className="p-2.5">१ (प्रथम)</td>
                <td className="p-2.5">लग्न</td>
                <td className="p-2.5 text-emerald-600 dark:text-emerald-400">उदय</td>
              </tr>

              {/* Planets Rows */}
              {planets.map((p) => (
                <tr key={p.id} className="border-b border-[#F1F5F9] dark:border-stone-800/60 hover:bg-[#FDFCF8] dark:hover:bg-stone-800/40">
                  <td className="p-2.5 font-bold flex items-center gap-1.5">
                    <span>{p.symbol}</span>
                    <span>{p.name}</span>
                  </td>
                  <td className="p-2.5">{p.rashiName}</td>
                  <td className="p-2.5">{p.formattedDegree}</td>
                  <td className="p-2.5">{p.nakshatraName} ({p.nakshatraLord})</td>
                  <td className="p-2.5">{toDevanagariNumerals(p.pada)}</td>
                  <td className="p-2.5">{toDevanagariNumerals(p.bhava)} भाव</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      p.dignity === 'उच्च'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : p.dignity === 'नीच'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : p.dignity === 'स्वक्षेत्र'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-stone-100 text-stone-700 border border-stone-300'
                    }`}>
                      {p.dignity}
                    </span>
                  </td>
                  <td className="p-2.5 space-x-1">
                    {p.isRetrograde && (
                      <span className="bg-purple-100 text-purple-800 border border-purple-300 text-[10px] px-1.5 py-0.5 rounded font-medium">
                        वक्री
                      </span>
                    )}
                    {p.isCombust && (
                      <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] px-1.5 py-0.5 rounded font-medium">
                        अस्त
                      </span>
                    )}
                    {!p.isRetrograde && !p.isCombust && <span className="text-emerald-600 text-[10px]">मार्गी</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Advanced Interactive Planet Popup */}
      {selectedPlanetModal && (
        <InteractivePlanetPopup
          planet={selectedPlanetModal}
          lagna={lagna}
          allPlanets={planets}
          profile={profile}
          dasha={dasha}
          onClose={() => setSelectedPlanetModal(null)}
          onOpenFullFaladesh={onNavigateToTab ? () => onNavigateToTab('faladesh') : undefined}
        />
      )}

      {/* Off-screen Print-Safe Kundali Document for jspdf / html2canvas generation */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '210mm',
          zIndex: -999,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <PrintableKundaliDocument
          profile={profile}
          lagna={lagna}
          planets={planets}
          dasha={dasha}
          panchanga={effectivePanchanga}
          chartStyle={chartStyle}
          selectedDivType={selectedDivType}
          orgProfile={orgProfile}
          ayanamsaSystem={ayanamsaSystem}
        />
      </div>

      {/* Detailed Multi-Page Kundali PDF Report Modal */}
      <DetailedKundaliPdfModal
        isOpen={isDetailedPdfModalOpen}
        onClose={() => setIsDetailedPdfModalOpen(false)}
        profile={profile}
        lagna={lagna}
        planets={planets}
        dasha={dasha}
        panchanga={effectivePanchanga}
        orgProfile={orgProfile}
        initialChartStyle={chartStyle}
      />

      {/* Family Kundali Merged PDF Modal */}
      {isFamilyMergedPdfModalOpen && (
        <FamilyKundaliMergedPdfModal
          isOpen={isFamilyMergedPdfModalOpen}
          onClose={() => setIsFamilyMergedPdfModalOpen(false)}
          profiles={profiles}
          currentProfile={profile}
          orgProfile={orgProfile}
          initialChartStyle={chartStyle}
        />
      )}

      {/* Print Preview & PDF Export Modal */}
      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        profile={profile}
        lagna={lagna}
        planets={planets}
        dasha={dasha}
        panchanga={effectivePanchanga}
        orgProfile={orgProfile}
        defaultReportType="kundali"
      />
    </div>
  );
};

