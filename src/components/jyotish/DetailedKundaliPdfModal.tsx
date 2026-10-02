import React, { useState, useRef, useCallback } from 'react';
import {
  Download,
  Printer,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Sliders,
  Check,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Settings2
} from 'lucide-react';
import {
  BirthDetails,
  LagnaInfo,
  PlanetPosition,
  PanchangaData,
  VimshottariDashaResult,
  OrganizationProfile,
} from '../../types/astrology';
import {
  DetailedKundaliPdfDocument,
  DetailedKundaliPdfOptions,
} from './DetailedKundaliPdfDocument';
import { exportElementToPDF, printElement } from '../../utils/pdfGenerator';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';
import { canUserPrintDocuments } from '../../db/subscriptionStore';

export interface DetailedKundaliPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BirthDetails;
  lagna: LagnaInfo;
  planets: PlanetPosition[];
  dasha?: VimshottariDashaResult;
  panchanga?: PanchangaData;
  orgProfile?: OrganizationProfile;
  initialChartStyle?: 'North Indian' | 'South Indian' | 'East Indian';
}

export const DetailedKundaliPdfModal: React.FC<DetailedKundaliPdfModalProps> = ({
  isOpen,
  onClose,
  profile,
  lagna,
  planets,
  dasha,
  panchanga,
  orgProfile,
  initialChartStyle = 'North Indian',
}) => {
  const [chartStyle, setChartStyle] = useState<'North Indian' | 'South Indian' | 'East Indian'>(initialChartStyle);
  const [colorTheme, setColorTheme] = useState<'vedic' | 'classic' | 'monochrome'>('vedic');
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [activePage, setActivePage] = useState<number>(1);
  const [showOptionsDrawer, setShowOptionsDrawer] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // Section options
  const [options, setOptions] = useState<DetailedKundaliPdfOptions>({
    chartStyle: initialChartStyle,
    colorTheme: 'vedic',
    includeD9: true,
    includeChandra: true,
    includeBhavas: true,
    includeDrishti: true,
    includeYogas: true,
    includeFullDasha: true,
    includeAntardasha: true,
    includeRemedies: true,
    includeSeal: true,
  });

  const previewContainerRef = useRef<HTMLDivElement>(null);

  const handleToggleOption = (key: keyof DetailedKundaliPdfOptions) => {
    setOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.15, 1.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.15, 0.5));
  const handleResetZoom = () => setZoomLevel(0.85);

  const handleScrollToPage = (pageNum: number) => {
    setActivePage(pageNum);
    if (previewContainerRef.current) {
      const pageElements = previewContainerRef.current.querySelectorAll('.print-page');
      if (pageElements[pageNum - 1]) {
        pageElements[pageNum - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleExportPDF = async () => {
    const check = canUserPrintDocuments('kundali');
    if (!check.allowed) {
      window.dispatchEvent(new CustomEvent('trial-print-blocked', { detail: { reason: check.reasonNepali, docType: 'kundali' } }));
      return;
    }
    try {
      setIsExporting(true);
      const sanitizedName = (profile.name || 'Jatak').trim().replace(/\s+/g, '_');
      const filename = `Detailed_Kundali_Report_${sanitizedName}_3Pages.pdf`;

      const success = await exportElementToPDF('detailed-kundali-pdf-document-preview', filename, 'a4');
      if (success) {
        setExportSuccessMsg(`विस्तृत कुण्डली ३-पृष्ठीय PDF प्रतिवेदन (${filename}) सफलतापूर्वक डाउनलोड भयो!`);
        setTimeout(() => setExportSuccessMsg(null), 5000);
      } else {
        setExportSuccessMsg('PDF तयार गर्न सकिएन। कृपया पुनः प्रयास गर्नुहोस्।');
        setTimeout(() => setExportSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error('Detailed PDF generation failed:', err);
      setExportSuccessMsg('PDF डाउनलोडमा समस्या आयो। कृपया पुनः प्रयास गर्नुहोस्।');
      setTimeout(() => setExportSuccessMsg(null), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    const check = canUserPrintDocuments('kundali');
    if (!check.allowed) {
      window.dispatchEvent(new CustomEvent('trial-print-blocked', { detail: { reason: check.reasonNepali, docType: 'kundali' } }));
      return;
    }
    printElement('detailed-kundali-pdf-document-preview');
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detailed-pdf-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm overflow-hidden animate-fadeIn"
    >
      <div className="bg-[#FAF7F2] dark:bg-stone-900 border border-amber-300 dark:border-stone-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col w-full max-w-6xl h-[94vh] overflow-hidden text-stone-900 dark:text-stone-100">
        {/* =========================================================================
            1. MODAL HEADER
           ========================================================================= */}
        <div className="bg-white dark:bg-stone-800/90 border-b border-stone-200 dark:border-stone-700 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D97706] to-[#7A1C1C] text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="detailed-pdf-modal-title" className="text-base sm:text-lg font-black font-serif text-[#7A1C1C] dark:text-amber-400">
                  विस्तृत जन्मकुण्डली PDF प्रतिवेदन
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  A4 ३-पृष्ठीय औपचारिक प्रतिवेदन
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                जातक: <strong className="text-stone-800 dark:text-stone-200">{profile.name}</strong> • जन्म लग्न: <strong>{lagna.rashiName} ({toDevanagariNumerals(lagna.rashiId)})</strong> • १२० वर्षे विंशोत्तरी दशा तथा ग्रहस्थिति
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOptionsDrawer(!showOptionsDrawer)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                showOptionsDrawer
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-600 hover:bg-stone-200'
              }`}
              title="प्रतिवेदन अनुकूलन विकल्पहरू"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">अनुकूलन (Options)</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600 text-stone-600 dark:text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="बन्द गर्नुहोस्"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            2. INTERACTIVE TOOLBAR: ZOOM, PAGE JUMPS & THEME SELECTOR
           ========================================================================= */}
        <div className="bg-[#FAF7F2] dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* Chart Style & Theme Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium text-[11px]">शैली:</span>
              <select
                value={chartStyle}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setChartStyle(val);
                  setOptions((prev) => ({ ...prev, chartStyle: val }));
                }}
                className="bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="North Indian">उत्तरी शैली (Diamond)</option>
                <option value="South Indian">दक्षिणी शैली (Grid)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-stone-500 font-medium text-[11px]">रङ्ग:</span>
              <select
                value={colorTheme}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setColorTheme(val);
                  setOptions((prev) => ({ ...prev, colorTheme: val }));
                }}
                className="bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="vedic">वैदिक स्वर्णिम (Vedic Red/Gold)</option>
                <option value="classic">शास्त्रीय (Classic Parchment)</option>
                <option value="monochrome">मुद्रण कालो-सेतो (Monochrome)</option>
              </select>
            </div>
          </div>

          {/* Page Jump Pills */}
          <div className="flex items-center gap-1 bg-stone-200/80 dark:bg-stone-700 p-0.5 rounded-xl text-[11px] font-bold">
            <button
              onClick={() => handleScrollToPage(1)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activePage === 1 ? 'bg-white dark:bg-stone-900 text-[#7A1C1C] dark:text-amber-400 shadow-2xs' : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              पृष्ठ १: जन्म विवरण र चक्र
            </button>
            <button
              onClick={() => handleScrollToPage(2)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activePage === 2 ? 'bg-white dark:bg-stone-900 text-[#7A1C1C] dark:text-amber-400 shadow-2xs' : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              पृष्ठ २: ग्रहस्थिति र भाव
            </button>
            <button
              onClick={() => handleScrollToPage(3)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activePage === 3 ? 'bg-white dark:bg-stone-900 text-[#7A1C1C] dark:text-amber-400 shadow-2xs' : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              पृष्ठ ३: दशा चक्र र उपाय
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={handleZoomOut}
              className="p-1 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-1.5 py-0.5 text-[11px] font-bold text-stone-700 dark:text-stone-300 font-mono hover:bg-stone-100 rounded"
              title="Reset Zoom"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            3. OPTIONS DRAWER (COLLAPSIBLE)
           ========================================================================= */}
        {showOptionsDrawer && (
          <div className="bg-amber-50/90 dark:bg-stone-850 border-b border-amber-200 dark:border-stone-700 px-6 py-3 shrink-0 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>प्रतिवेदनमा समावेश गरिने खण्डहरू (Included Sections):</span>
              </span>
              <button
                onClick={() => setShowOptionsDrawer(false)}
                className="text-[11px] text-amber-800 dark:text-amber-400 hover:underline font-bold"
              >
                बन्द गर्नुहोस् ✕
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options.includeD9}
                  onChange={() => handleToggleOption('includeD9')}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>D-9 नवांश कुण्डली</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options.includeChandra}
                  onChange={() => handleToggleOption('includeChandra')}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>चन्द्र कुण्डली सङ्केत</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options.includeBhavas}
                  onChange={() => handleToggleOption('includeBhavas')}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>द्वादश भाव स्पष्ट विश्लेषण</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options.includeDrishti}
                  onChange={() => handleToggleOption('includeDrishti')}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>ग्रह दृष्टि सम्बन्ध तालिका</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options.includeYogas}
                  onChange={() => handleToggleOption('includeYogas')}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>मुख्य शुभ योग तथा दोष</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options.includeFullDasha}
                  onChange={() => handleToggleOption('includeFullDasha')}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>१२० वर्षे सम्पूर्ण महादशा</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options.includeAntardasha}
                  onChange={() => handleToggleOption('includeAntardasha')}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>चालु महादशाको अन्तर्दशा विस्तार</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options.includeRemedies}
                  onChange={() => handleToggleOption('includeRemedies')}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>वैदिक शान्ति, रत्न तथा मन्त्र उपाय</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options.includeSeal}
                  onChange={() => handleToggleOption('includeSeal')}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>ज्योतिषी प्रमाणीकरण तथा कार्यालय छाप</span>
              </label>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {exportSuccessMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/80 border-b border-emerald-300 dark:border-emerald-800 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">{exportSuccessMsg}</span>
            </div>
            <button
              onClick={() => setExportSuccessMsg(null)}
              className="text-stone-400 hover:text-stone-600 font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* =========================================================================
            4. LIVE DOCUMENT PREVIEW STAGE
           ========================================================================= */}
        <div
          ref={previewContainerRef}
          className="flex-1 overflow-auto p-4 sm:p-8 bg-[#EFECE6] dark:bg-stone-950 flex flex-col items-center"
        >
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="shadow-2xl rounded-xl mb-12"
          >
            <DetailedKundaliPdfDocument
              id="detailed-kundali-pdf-document-preview"
              profile={profile}
              lagna={lagna}
              planets={planets}
              dasha={dasha}
              panchanga={panchanga}
              orgProfile={orgProfile}
              options={{
                ...options,
                chartStyle,
                colorTheme,
              }}
            />
          </div>
        </div>

        {/* =========================================================================
            5. MODAL FOOTER & EXPORT BUTTONS
           ========================================================================= */}
        <div className="bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs">
          <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>A4 पोर्ट्रेट ढाँचा (२१०mm × २९७mm) • ३ पूर्ण पृष्ठ • मुद्रण तथा डिजिटल आर्काइभ योग्य</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              रद्द गर्नुहोस्
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#7A1C1C] hover:bg-[#5C1515] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="सिधै प्रिन्ट गर्नुहोस्"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>प्रिन्ट गर्नुहोस्</span>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-5 py-2 bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-[#92400E] disabled:opacity-60 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              title="३-पृष्ठीय विस्तृत जन्मकुण्डली A4 PDF डाउनलोड गर्नुहोस्"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                  <span>PDF प्रतिवेदन तयार हुँदैछ...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-amber-200" />
                  <span>विस्तृत PDF डाउनलोड (Download Detailed PDF)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
