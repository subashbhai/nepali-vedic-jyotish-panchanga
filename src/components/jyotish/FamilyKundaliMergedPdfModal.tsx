import React, { useState, useMemo, useRef } from 'react';
import {
  Users,
  Download,
  Printer,
  X,
  Check,
  Sparkles,
  FileText,
  AlertCircle,
  Loader2,
  BookOpen,
  Calendar,
  MapPin,
  Clock,
  CheckSquare,
  Square,
  Search,
  Eye,
  Settings,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import {
  BirthDetails,
  OrganizationProfile,
  ApplicationSettings
} from '../../types/astrology';
import { getStoredProfiles } from '../../db/profileStore';
import { getCachedAstroCalculation } from '../../utils/astroCache';
import { exportMergedProfilesPDF, PDFProgressInfo, printElement } from '../../utils/pdfGenerator';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';
import { PrintableKundaliDocument } from './PrintableKundaliDocument';
import { DetailedKundaliPdfDocument, DetailedKundaliPdfOptions } from './DetailedKundaliPdfDocument';

export interface FamilyKundaliMergedPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles?: BirthDetails[];
  currentProfile?: BirthDetails;
  orgProfile?: OrganizationProfile;
  settings?: ApplicationSettings;
  initialChartStyle?: 'North Indian' | 'South Indian' | 'East Indian';
}

export const FamilyKundaliMergedPdfModal: React.FC<FamilyKundaliMergedPdfModalProps> = ({
  isOpen,
  onClose,
  profiles: initialProfiles,
  currentProfile,
  orgProfile,
  settings,
  initialChartStyle = 'North Indian'
}) => {
  // Load profiles from prop or stored profiles fallback
  const availableProfiles = useMemo(() => {
    if (initialProfiles && initialProfiles.length > 0) {
      return initialProfiles;
    }
    const stored = getStoredProfiles();
    if (stored && stored.length > 0) return stored;
    return currentProfile ? [currentProfile] : [];
  }, [initialProfiles, currentProfile]);

  // Selected profile IDs for export (default: all profiles selected)
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    return availableProfiles.map(p => p.id || `profile_${p.name}`);
  });

  // Search filter query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Customization Options
  const [familyTitle, setFamilyTitle] = useState<string>('पारिवारिक कुण्डली सङ्ग्रह');
  const [familyGotra, setFamilyGotra] = useState<string>('शुभ पारिवारिक कुण्डली तथा दशा विचार');
  const [includeCoverPage, setIncludeCoverPage] = useState<boolean>(true);
  const [documentType, setDocumentType] = useState<'standard' | 'detailed'>('standard');
  const [chartStyle, setChartStyle] = useState<'North Indian' | 'South Indian' | 'East Indian'>(initialChartStyle);
  const [activeTab, setActiveTab] = useState<'select' | 'preview'>('select');

  // Export State & Progress
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progressInfo, setProgressInfo] = useState<PDFProgressInfo | null>(null);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Filtered profiles for selection list
  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) return availableProfiles;
    const q = searchQuery.toLowerCase().trim();
    return availableProfiles.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.customerId && p.customerId.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.location?.name && p.location.name.toLowerCase().includes(q))
    );
  }, [availableProfiles, searchQuery]);

  // Profiles chosen for export in current selection order
  const selectedProfiles = useMemo(() => {
    return availableProfiles.filter(p => selectedIds.includes(p.id || `profile_${p.name}`));
  }, [availableProfiles, selectedIds]);

  // Pre-calculate full astro details for each selected profile
  const calculatedFamilyData = useMemo(() => {
    const ayanSys = (settings?.ayanamsaSystem as any) || 'Lahiri';
    return selectedProfiles.map(profile => {
      const dateAD = profile.dateAD || '1995-05-15';
      const time = profile.time || '08:30';
      const lat = profile.location?.latitude ?? 27.7172;
      const lng = profile.location?.longitude ?? 85.3240;
      const tz = profile.location?.timeZone ?? 5.75;

      const calc = getCachedAstroCalculation(dateAD, time, lat, lng, tz, ayanSys);
      return {
        profile,
        calc
      };
    });
  }, [selectedProfiles, settings?.ayanamsaSystem]);

  // Toggle profile selection
  const handleToggleProfile = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Select all / Deselect all
  const handleSelectAll = () => {
    setSelectedIds(availableProfiles.map(p => p.id || `profile_${p.name}`));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  // Export merged PDF handler
  const handleExportMergedPDF = async () => {
    if (selectedProfiles.length === 0) {
      alert('कृपया कम्तीमा एउटा सदस्य कुण्डली चयन गर्नुहोस्।');
      return;
    }

    try {
      setIsExporting(true);
      setProgressInfo({
        currentPage: 0,
        totalPages: (includeCoverPage ? 1 : 0) + selectedProfiles.length * (documentType === 'detailed' ? 3 : 2),
        message: 'पारिवारिक कुण्डली पानाहरूको तयारी सुरु हुँदैछ...'
      });

      const cleanTitle = familyTitle.trim().replace(/\s+/g, '_') || 'Family_Kundali';
      const filename = `${cleanTitle}_Merged_${toDevanagariNumerals(selectedProfiles.length)}Members_${Date.now().toString().slice(-4)}.pdf`;

      const success = await exportMergedProfilesPDF(
        'printable-family-kundali-collection',
        filename,
        'a4',
        (progress) => setProgressInfo(progress)
      );

      if (success) {
        setExportSuccessMessage(`पारिवारिक कुण्डली सङ्ग्रह (${selectedProfiles.length} सदस्य, ${toDevanagariNumerals(progressInfo?.totalPages || selectedProfiles.length * 2)} पृष्ठ) सफलतापूर्वक एकमुष्ट PDF मा डाउनलोड भयो!`);
        setTimeout(() => setExportSuccessMessage(null), 6000);
      } else {
        alert('PDF बनाउन सकिएन। कृपया पुनः प्रयास गर्नुहोस्।');
      }
    } catch (err) {
      console.error('Failed to export merged family PDF:', err);
      alert('PDF निर्यातमा त्रुटि भयो।');
    } finally {
      setIsExporting(false);
      setProgressInfo(null);
    }
  };

  // Direct print option
  const handlePrintCollection = () => {
    printElement('printable-family-kundali-collection');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#FFFDF9] dark:bg-stone-900 border border-amber-300/80 dark:border-stone-700 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-[#7A1C1C] via-[#991B1B] to-[#B45309] text-white p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs border border-white/20">
              <Users className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-serif">
                  पारिवारिक कुण्डली सङ्ग्रह — एकमुष्ट PDF निर्यात
                </h3>
                <span className="text-[10px] font-bold bg-amber-400 text-stone-900 px-2 py-0.5 rounded-full">
                  Merged PDF
                </span>
              </div>
              <p className="text-xs text-amber-100/90 mt-0.5 font-sans">
                परिवारका सबै सदस्यहरूको जन्मकुण्डली, ग्रहस्थिति तथा दशा विवरण एउटै व्यावसायिक A4 PDF फाइलमा तयार गर्नुहोस्।
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            title="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TOP TABS & STATS BAR */}
        <div className="bg-stone-100 dark:bg-stone-850 border-b border-stone-200 dark:border-stone-800 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('select')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'select'
                  ? 'bg-[#7A1C1C] text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>१. सदस्य चयन तथा सेटिङ</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {toDevanagariNumerals(selectedProfiles.length)} / {toDevanagariNumerals(availableProfiles.length)}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-[#7A1C1C] text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>२. प्रत्यक्ष प्रिभ्यु (Preview)</span>
            </button>
          </div>

          <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
            <span>जम्मा पृष्ठ:</span>
            <span className="font-bold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-stone-800 px-2.5 py-0.5 rounded-lg border border-amber-200 dark:border-stone-700">
              {toDevanagariNumerals((includeCoverPage ? 1 : 0) + selectedProfiles.length * (documentType === 'detailed' ? 3 : 2))} पृष्ठ A4
            </span>
          </div>
        </div>

        {/* SUCCESS MESSAGE BANNER */}
        {exportSuccessMessage && (
          <div className="bg-emerald-50 dark:bg-emerald-950/80 border-b border-emerald-300 dark:border-emerald-800 p-3 px-6 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">{exportSuccessMessage}</span>
            </div>
            <button
              onClick={() => setExportSuccessMessage(null)}
              className="text-stone-400 hover:text-stone-700 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* PROGRESS BAR BANNER (WHEN EXPORTING) */}
        {isExporting && progressInfo && (
          <div className="bg-amber-50 dark:bg-amber-950/70 border-b border-amber-300 dark:border-amber-800 p-3 px-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-950 dark:text-amber-200">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                <span>{progressInfo.message}</span>
              </div>
              <span>
                {toDevanagariNumerals(progressInfo.currentPage)} / {toDevanagariNumerals(progressInfo.totalPages)}
              </span>
            </div>
            <div className="w-full bg-amber-200 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-600 to-[#7A1C1C] h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${Math.round((progressInfo.currentPage / Math.max(progressInfo.totalPages, 1)) * 100)}%`
                }}
              />
            </div>
          </div>
        )}

        {/* MODAL MAIN CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: SELECTION AND SETTINGS */}
          {activeTab === 'select' && (
            <div className="space-y-6">
              
              {/* TOP CONFIGURATION CARD */}
              <div className="bg-white dark:bg-stone-850 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#7A1C1C] dark:text-amber-400 uppercase tracking-wider">
                  <Settings className="w-4 h-4" />
                  <span>सङ्ग्रह शीर्षक तथा मुद्रण ढाँचा (Collection Title & Layout)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      सङ्ग्रह शीर्षक (Family Title):
                    </label>
                    <input
                      type="text"
                      value={familyTitle}
                      onChange={(e) => setFamilyTitle(e.target.value)}
                      placeholder="उदा: शर्मा परिवार कुण्डली सङ्ग्रह"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-[#FFFDF9] dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      गोत्र / उपशीर्षक (Gotra / Subtitle):
                    </label>
                    <input
                      type="text"
                      value={familyGotra}
                      onChange={(e) => setFamilyGotra(e.target.value)}
                      placeholder="उदा: कौशिक गोत्र / काठमाडौँ"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-[#FFFDF9] dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                      चार्ट शैली (Chart Style):
                    </label>
                    <select
                      value={chartStyle}
                      onChange={(e) => setChartStyle(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-[#FFFDF9] dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="North Indian">उत्तरी शैली (North Indian Diamond)</option>
                      <option value="South Indian">दक्षिणी शैली (South Indian Grid)</option>
                      <option value="East Indian">पूर्वी शैली (East Indian)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-stone-200 dark:border-stone-800 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeCoverPage}
                      onChange={(e) => setIncludeCoverPage(e.target.checked)}
                      className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      पारिवारिक आवरण पृष्ठ समावेश गर्नुहोस् (Include Family Cover Page with Directory)
                    </span>
                  </label>

                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-stone-500 font-medium">प्रतिवेदन ढाँचा:</span>
                    <button
                      type="button"
                      onClick={() => setDocumentType('standard')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        documentType === 'standard'
                          ? 'bg-amber-600 text-white'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      मानक २-पृष्ठ
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocumentType('detailed')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        documentType === 'detailed'
                          ? 'bg-amber-600 text-white'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      विस्तृत ३-पृष्ठ
                    </button>
                  </div>
                </div>
              </div>

              {/* PROFILE SELECTION CARD */}
              <div className="bg-white dark:bg-stone-850 p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-600" />
                      <span>कुण्डली सङ्ग्रहमा समावेश गरिने सदस्यहरू छनोट गर्नुहोस्</span>
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      जति धेरै सदस्य चयन गर्नुहुन्छ, सबैको कुण्डली क्रमिक रूपमा एउटै PDF मा थपिनेछ।
                    </p>
                  </div>

                  {/* QUICK SELECT BUTTONS */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSelectAll}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>सबै छनोट ({toDevanagariNumerals(availableProfiles.length)})</span>
                    </button>

                    <button
                      onClick={handleDeselectAll}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                    >
                      <Square className="w-3.5 h-3.5 text-stone-400" />
                      <span>खाली गर्नुहोस्</span>
                    </button>
                  </div>
                </div>

                {/* SEARCH INPUT */}
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="नाम, ग्राहक नं, वा ठेगाना खोज्नुहोस्..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* PROFILES GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                  {filteredProfiles.map((p) => {
                    const pId = p.id || `profile_${p.name}`;
                    const isSelected = selectedIds.includes(pId);

                    return (
                      <div
                        key={pId}
                        onClick={() => handleToggleProfile(pId)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isSelected
                            ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 shadow-xs'
                            : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 opacity-75'
                        }`}
                      >
                        <div className="pt-0.5">
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-md bg-[#7A1C1C] text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-md border-2 border-stone-300 dark:border-stone-600" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold font-serif text-sm text-stone-900 dark:text-stone-100 truncate">
                              {p.name}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 shrink-0">
                              {p.category || (p.gender === 'female' ? 'महिला' : 'पुरुष')}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1 text-[11px] text-stone-600 dark:text-stone-400">
                            <div className="flex items-center gap-1 truncate">
                              <Calendar className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate">{p.dateBS || p.dateAD}</span>
                            </div>
                            <div className="flex items-center gap-1 truncate">
                              <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate">{toDevanagariNumerals(p.time || '०८:३०')}</span>
                            </div>
                            <div className="flex items-center gap-1 truncate col-span-2 mt-0.5">
                              <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate">{p.location?.name || 'काठमाडौँ'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredProfiles.length === 0 && (
                  <div className="text-center py-8 text-stone-500 text-xs">
                    कुनै प्रोफाइल फेला परेन। कृपया खोजी शब्द परिवर्तन गर्नुहोस्।
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: LIVE PREVIEW OF ASSEMBLED COLLECTION */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800 p-3.5 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  तल प्रस्तुत गरिएको छान्एिको पारिवारिक कुण्डली सङ्ग्रहको मुद्रण संरचना। डाउनलोड गर्दा यही ठ्याक्कै रूपमा A4 आकारमा आउनेछ।
                </span>
              </div>

              {/* Cover Page Preview Indicator */}
              {includeCoverPage && (
                <div className="bg-white dark:bg-stone-850 p-4 rounded-xl border border-stone-200 dark:border-stone-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold font-serif text-stone-800 dark:text-stone-200">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span>पृष्ठ १: {familyTitle} — पारिवारिक आवरण तथा नामावली तालिका</span>
                  </div>
                  <span className="text-[10px] text-amber-800 dark:text-amber-400 font-bold bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded">
                    कभर पेज समावेश
                  </span>
                </div>
              )}

              {/* Members List in order */}
              <div className="space-y-2">
                {calculatedFamilyData.map(({ profile }, idx) => (
                  <div
                    key={profile.id || idx}
                    className="bg-white dark:bg-stone-850 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#7A1C1C] text-white flex items-center justify-center font-bold text-[11px]">
                        {toDevanagariNumerals(idx + 1)}
                      </span>
                      <div>
                        <div className="font-bold text-stone-900 dark:text-stone-100 font-serif text-sm">
                          {profile.name}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {profile.dateBS || profile.dateAD} • {profile.location?.name || 'नेपाल'}
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-lg">
                      {documentType === 'detailed' ? '३ पृष्ठ' : '२ पृष्ठ'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* HIDDEN / OFF-SCREEN PRINTABLE CONTAINER FOR PDF GENERATION */}
        {/* Rendered in the DOM so html2canvas can capture the exact high-res pages */}
        <div
          id="printable-family-kundali-collection"
          className="fixed left-[-9999px] top-0 w-[1200px] pointer-events-none opacity-100 bg-[#FFFDF7]"
          style={{ width: '1200px' }}
        >
          {/* 1. OPTIONAL FAMILY COVER PAGE */}
          {includeCoverPage && (
            <div
              className="printable-page bg-[#FFFDF7] text-stone-900 p-12 space-y-8 flex flex-col justify-between"
              style={{ width: '1200px', minHeight: '1697px' }}
              data-profile-name="पारिवारिक आवरण"
            >
              {/* Cover Header */}
              <div className="text-center space-y-4 border-b-4 border-double border-[#7A1C1C] pb-8">
                <div className="text-sm font-serif font-bold text-[#7A1C1C] tracking-widest uppercase">
                  ॥ श्री गणेशाय नमः ॥ ॐ नमो भगवते वासुदेवाय ॥
                </div>

                <div className="text-4xl font-extrabold font-serif text-[#7A1C1C] tracking-wide pt-2">
                  {familyTitle}
                </div>

                <div className="text-lg font-serif text-[#B45309] font-bold">
                  {familyGotra}
                </div>

                <p className="max-w-2xl mx-auto text-xs text-stone-700 italic font-serif leading-relaxed">
                  ॐ शुक्लाम्बरधरं विष्णुं शशिवर्णं चतुर्भुजम्। प्रसन्नवदनं ध्यायेत् सर्वविघ्नोपशान्तये॥
                  <br />
                  ब्रह्मा मुरारिस्त्रिपुरान्तकारी भानुः शशी भूमिसुतो बुधश्च। गुरुश्च शुक्रः शनिराहुकेतवः कुर्वन्तु सर्वे मम सुप्रभातम्॥
                </p>
              </div>

              {/* Organization Profile Details */}
              {orgProfile && (
                <div className="text-center space-y-1 bg-amber-50/60 p-4 rounded-xl border border-amber-200">
                  <div className="font-bold text-base font-serif text-[#7A1C1C]">{orgProfile.name}</div>
                  <div className="text-xs text-stone-600">{orgProfile.address} • सम्पर्क: {orgProfile.phone} • {orgProfile.email}</div>
                  <div className="text-[11px] text-amber-800 italic">{orgProfile.tagline}</div>
                </div>
              )}

              {/* Family Members Directory Table */}
              <div className="space-y-3">
                <h4 className="text-base font-bold font-serif text-[#7A1C1C] flex items-center gap-2 border-b border-[#7A1C1C]/40 pb-1">
                  <span>पारिवारिक सदस्य विवरण तथा कुण्डली अनुक्रमणिका (Family Members Directory)</span>
                </h4>

                <table className="w-full text-left border-collapse border border-stone-300 text-xs">
                  <thead>
                    <tr className="bg-[#7A1C1C] text-white">
                      <th className="border border-stone-300 p-2 text-center w-10">क्र.सं.</th>
                      <th className="border border-stone-300 p-2">सदस्यको नाम (Name)</th>
                      <th className="border border-stone-300 p-2">सम्बन्ध / वर्ग</th>
                      <th className="border border-stone-300 p-2">जन्म मिति (वि.सं. / ई.सं.)</th>
                      <th className="border border-stone-300 p-2">जन्म समय</th>
                      <th className="border border-stone-300 p-2">जन्म स्थान</th>
                      <th className="border border-stone-300 p-2">जन्म लग्न</th>
                      <th className="border border-stone-300 p-2">जन्म राशि / नक्षत्र</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculatedFamilyData.map(({ profile, calc }, index) => {
                      const moonPl = calc.planets.find(p => p.name === 'चन्द्र');
                      return (
                        <tr
                          key={profile.id || index}
                          className={index % 2 === 0 ? 'bg-white' : 'bg-amber-50/40'}
                        >
                          <td className="border border-stone-300 p-2 text-center font-bold">
                            {toDevanagariNumerals(index + 1)}
                          </td>
                          <td className="border border-stone-300 p-2 font-bold font-serif text-stone-900">
                            {profile.name}
                          </td>
                          <td className="border border-stone-300 p-2 text-stone-700">
                            {profile.category || 'पारिवारिक सदस्य'}
                          </td>
                          <td className="border border-stone-300 p-2 font-mono">
                            {profile.dateBS || profile.dateAD}
                          </td>
                          <td className="border border-stone-300 p-2 font-mono">
                            {toDevanagariNumerals(profile.time || '०८:३०')}
                          </td>
                          <td className="border border-stone-300 p-2">
                            {profile.location?.name || 'काठमाडौँ'}
                          </td>
                          <td className="border border-stone-300 p-2 font-bold text-[#7A1C1C]">
                            {calc.lagna.rashiName} लग्न
                          </td>
                          <td className="border border-stone-300 p-2">
                            {moonPl?.rashiName || 'मेष'} • {moonPl?.nakshatraName || 'अश्विनी'} ({toDevanagariNumerals(moonPl?.pada || 1)} पाउ)
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Astrologer Certification & Blessing */}
              <div className="bg-amber-50 border border-amber-300 p-5 rounded-xl space-y-3">
                <div className="font-bold text-xs text-[#7A1C1C]">
                  ॥ ज्योतिषाचार्य शुभाशीर्वाद तथा समर्पण ॥
                </div>
                <p className="text-xs text-stone-700 leading-relaxed font-serif">
                  प्रस्तुत पारिवारिक कुण्डली सङ्ग्रह सनातन वैदिक ज्योतिषीय सिद्धान्त, पराशरीय होराशास्त्र तथा आधुनिक दृक-गणितीय सिद्धान्त अनुसार तयार पारिएको हो। यस परिवारका समस्त सदस्यहरूको जीवनमा आरोग्य, दीर्घायु, विद्या, यश, श्री तथा पारिवारिक सुख-शान्ति सदा सर्वदा व्याप्त रहोस् भनी भगवान् श्री पशुपतिनाथ, कुलदेवता तथा नवग्रह भगवान्सँग प्रार्थना गरिन्छ।
                </p>
                <div className="flex justify-between items-end pt-4 border-t border-amber-200 text-xs">
                  <div>
                    <div className="font-bold text-stone-800">सम्पादित मिति: {toDevanagariNumerals(new Date().toLocaleDateString('ne-NP'))}</div>
                    <div className="text-stone-600">स्थान: {orgProfile?.address || 'काठमाडौँ, नेपाल'}</div>
                  </div>
                  <div className="text-center">
                    <div className="w-32 border-b border-stone-800 pb-1 font-bold text-stone-900">
                      आधिकारिक प्रमाणीकरण
                    </div>
                    <div className="text-[10px] text-stone-600">ज्योतिषाचार्य / पण्डित</div>
                  </div>
                </div>
              </div>

              {/* Cover Footer */}
              <div className="pt-4 border-t border-[#7A1C1C]/40 flex justify-between text-[11px] text-stone-600">
                <div>बालानन्द वैदिक ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा अनुसन्धान प्रणाली</div>
                <div className="font-bold text-[#7A1C1C]">पारिवारिक आवरण पृष्ठ (Cover Page)</div>
              </div>
            </div>
          )}

          {/* 2. RENDER ALL SELECTED PROFILES IN SEQUENCE */}
          {calculatedFamilyData.map(({ profile, calc }) => {
            const effectivePanchanga = calc.panchanga;

            if (documentType === 'detailed') {
              const detailedOpts: DetailedKundaliPdfOptions = {
                chartStyle,
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
              };

              return (
                <div key={profile.id} data-profile-name={profile.name} className="contents">
                  <DetailedKundaliPdfDocument
                    profile={profile}
                    lagna={calc.lagna}
                    planets={calc.planets}
                    dasha={calc.dasha}
                    panchanga={effectivePanchanga}
                    orgProfile={orgProfile}
                    options={detailedOpts}
                  />
                </div>
              );
            }

            // Standard 2-page formal document
            return (
              <div key={profile.id} data-profile-name={profile.name} className="contents">
                <PrintableKundaliDocument
                  profile={profile}
                  lagna={calc.lagna}
                  planets={calc.planets}
                  dasha={calc.dasha}
                  panchanga={effectivePanchanga}
                  chartStyle={chartStyle}
                  selectedDivType="D1"
                  orgProfile={orgProfile}
                />
              </div>
            );
          })}
        </div>

        {/* MODAL FOOTER CONTROLS */}
        <div className="bg-stone-50 dark:bg-stone-850 border-t border-stone-200 dark:border-stone-800 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-stone-600 dark:text-stone-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              चयनित सदस्यहरू: <strong>{toDevanagariNumerals(selectedProfiles.length)} जना</strong> • कुल मुद्रण: <strong>{toDevanagariNumerals((includeCoverPage ? 1 : 0) + selectedProfiles.length * (documentType === 'detailed' ? 3 : 2))} पृष्ठ</strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              रद्द गर्नुहोस्
            </button>

            <button
              onClick={handlePrintCollection}
              disabled={isExporting || selectedProfiles.length === 0}
              className="px-4 py-2 bg-stone-700 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
              title="प्रत्यक्ष प्रिन्टरमा पठाउनुहोस्"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>प्रिन्ट गर्नुहोस्</span>
            </button>

            <button
              id="btn-export-family-merged-pdf"
              data-testid="export-family-merged-pdf-button"
              onClick={handleExportMergedPDF}
              disabled={isExporting || selectedProfiles.length === 0}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-[#7A1C1C] via-[#991B1B] to-[#B45309] hover:from-[#5C1515] hover:to-[#7A1C1C] disabled:opacity-50 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>एकमुष्ट PDF बन्दैछ...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>एकमुष्ट PDF डाउनलोड गर्नुहोस् (Merged PDF)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
