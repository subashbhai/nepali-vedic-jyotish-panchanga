// High-Resolution 3D Model Snapshot & Printable Vastu PDF Report Generator
// बालानन्द कर्मकाण्ड - वास्तु भवन निर्माण योजना
import React, { useState, useEffect, useRef } from 'react';
import { 
  VastuPlannerProject, 
  GeneratedFloorPlan, 
  VastuAnalysisResult 
} from '../types';
import { 
  TerrainConfig, 
  TerrainVastuAnalysis,
  RoofStyle
} from './threeDHouseBuilder';
import { analyzeVastuBuildingPlan } from '../engine/vastuAnalysisEngine';
import { exportElementToPDF } from '../../utils/pdfGenerator';
import { canUserPrintDocuments } from '../../db/subscriptionStore';
import { 
  Download, 
  Printer, 
  Image as ImageIcon, 
  FileText, 
  X, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Compass, 
  Maximize2, 
  Loader2, 
  Eye, 
  TrendingUp, 
  Sun, 
  Moon, 
  Sunset, 
  Home, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Calendar,
  User,
  MapPin,
  CheckSquare
} from 'lucide-react';

interface Vastu3DExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: VastuPlannerProject;
  plan: GeneratedFloorPlan;
  terrainConfig: TerrainConfig;
  terrainAnalysis: TerrainVastuAnalysis;
  roofStyle: RoofStyle;
  lightingMood: 'day' | 'sunset' | 'night';
  onCaptureSnapshot: (width?: number, height?: number) => string | null;
}

type ResolutionOption = 'fhd' | 'qhd' | 'uhd';

export const Vastu3DExportModal: React.FC<Vastu3DExportModalProps> = ({
  isOpen,
  onClose,
  project,
  plan,
  terrainConfig,
  terrainAnalysis,
  roofStyle,
  lightingMood,
  onCaptureSnapshot
}) => {
  const [activeTab, setActiveTab] = useState<'snapshot' | 'report'>('snapshot');
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [selectedResolution, setSelectedResolution] = useState<ResolutionOption>('fhd');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState<boolean>(false);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);
  
  // PDF Report customizable sections
  const [include3DImage, setInclude3DImage] = useState<boolean>(true);
  const [includeTerrainAnalysis, setIncludeTerrainAnalysis] = useState<boolean>(true);
  const [includePanchaTattva, setIncludePanchaTattva] = useState<boolean>(true);
  const [includeRoomTable, setIncludeRoomTable] = useState<boolean>(true);
  const [includeRemedies, setIncludeRemedies] = useState<boolean>(true);

  // Compute full Vastu analysis
  const vastuAnalysis: VastuAnalysisResult = React.useMemo(() => {
    return project.analysisResult || analyzeVastuBuildingPlan(project);
  }, [project]);

  // Capture snapshot on modal open
  useEffect(() => {
    if (isOpen) {
      // Capture an initial high-res preview snapshot (1920x1080)
      const dataUrl = onCaptureSnapshot(1920, 1080);
      if (dataUrl) {
        setSnapshotUrl(dataUrl);
      }
    }
  }, [isOpen, onCaptureSnapshot]);

  if (!isOpen) return null;

  const resolutionConfig: Record<ResolutionOption, { label: string; width: number; height: number; desc: string }> = {
    fhd: { label: 'Full HD (1080p)', width: 1920, height: 1080, desc: '१९२० × १०८० - कम्प्युटर र मोबाइलका लागि उपयुक्त' },
    qhd: { label: '2K QHD (1440p)', width: 2560, height: 1440, desc: '२५६० × १४४० - उच्च गुणस्तरीय प्रिन्ट तथा पोस्टर' },
    uhd: { label: '4K UHD (2160p)', width: 3840, height: 2160, desc: '३८४० × २१६० - अल्ट्रा आर्किटेक्चरल स्पष्टता' }
  };

  const getCleanProjectName = () => {
    return project.name.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-\u0900-\u097F]/g, '') || 'Vastu_House_Plan';
  };

  // 1. Download High-Resolution Snapshot PNG
  const handleDownloadSnapshot = () => {
    if (!canUserPrintDocuments('vastu')) {
      window.dispatchEvent(new CustomEvent('trial-print-blocked', { detail: { docType: 'vastu' } }));
      return;
    }
    setIsDownloadingImage(true);
    try {
      const config = resolutionConfig[selectedResolution];
      const dataUrl = onCaptureSnapshot(config.width, config.height) || snapshotUrl;
      if (!dataUrl) {
        alert('३D तस्बिर क्याप्चर गर्न सकिएन।');
        setIsDownloadingImage(false);
        return;
      }

      const link = document.createElement('a');
      const filename = `${getCleanProjectName()}_3D_${selectedResolution.toUpperCase()}.png`;
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccessMsg(`तस्बिर (${config.label}) सफलतापूर्वक डाउनलोड भयो!`);
      setTimeout(() => setDownloadSuccessMsg(null), 3500);
    } catch (e) {
      console.error('Snapshot download failed:', e);
    } finally {
      setIsDownloadingImage(false);
    }
  };

  // 2. Generate and Download Complete PDF Report
  const handleDownloadPDF = async () => {
    if (!canUserPrintDocuments('vastu')) {
      window.dispatchEvent(new CustomEvent('trial-print-blocked', { detail: { docType: 'vastu' } }));
      return;
    }
    setIsGeneratingPdf(true);
    try {
      // Ensure we have a fresh high-res image embedded
      if (!snapshotUrl) {
        const dataUrl = onCaptureSnapshot(1920, 1080);
        if (dataUrl) setSnapshotUrl(dataUrl);
      }

      // Small delay to ensure DOM and image rendering are primed
      await new Promise(resolve => setTimeout(resolve, 200));

      const filename = `${getCleanProjectName()}_Vastu_3D_Report.pdf`;
      const success = await exportElementToPDF('vastu-3d-printable-pdf-root', filename, 'a4');

      if (success) {
        setDownloadSuccessMsg('पूर्ण ३D वास्तु प्रतिवेदन (PDF) डाउनलोड भयो!');
        setTimeout(() => setDownloadSuccessMsg(null), 4000);
      }
    } catch (e) {
      console.error('PDF generation error:', e);
      alert('PDF तयार गर्दा त्रुटि भयो। कृपया पुनः प्रयास गर्नुहोस्।');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 3. Direct Browser Print
  const handleDirectPrint = () => {
    if (!canUserPrintDocuments('vastu')) {
      window.dispatchEvent(new CustomEvent('trial-print-blocked', { detail: { docType: 'vastu' } }));
      return;
    }
    window.print();
  };

  const getRoofStyleNepali = (style: string) => {
    if (style === 'pitched_tile') return 'रातो टायलको छानो (Tile Roof)';
    if (style === 'pitched_slate') return 'हिमाली स्लेट छानो (Himalayan Slate)';
    if (style === 'pitched_copper') return 'तामाको धातु छानो (Copper Bronze)';
    if (style === 'pitched_green') return 'हरियो पर्यावरण छानो (Eco Green)';
    if (style === 'flat_terrace') return 'आरसीसी खुला कौशी (Flat Terrace)';
    return 'भित्री कोठा योजना (Cutaway)';
  };

  const getLightingMoodNepali = (mood: string) => {
    if (mood === 'day') return 'उज्यालो दिन (Daylight)';
    if (mood === 'sunset') return 'सुनौलो साँझ (Sunset)';
    return 'रात्रि बत्ती (Night Lights)';
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white dark:bg-stone-900 border-2 border-amber-300 dark:border-stone-700 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-amber-200 dark:border-stone-800 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50/40 dark:from-stone-900 dark:to-stone-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7A1C1C] text-amber-300 flex items-center justify-center shadow-md shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-serif text-[#7A1C1C] dark:text-amber-400 leading-tight">
                ३D भवन दृश्य तथा वास्तु प्रतिवेदन निर्यात
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                उच्च गुणस्तरीय ३D तस्बिर (PNG) र प्रिन्टयोग्य वास्तु मूल्याङ्कन प्रतिवेदन (PDF)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition cursor-pointer"
            aria-label="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Bar */}
        <div className="px-4 sm:px-6 pt-3 pb-2 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-stone-900/50 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('snapshot')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'snapshot'
                  ? 'bg-[#7A1C1C] text-white shadow-md'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-100 dark:hover:bg-stone-700'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>📸 उच्च गुणस्तरीय ३D तस्बिर (PNG)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('report')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
                activeTab === 'report'
                  ? 'bg-[#7A1C1C] text-white shadow-md'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-amber-100 dark:hover:bg-stone-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>📄 पूर्ण वास्तु PDF प्रतिवेदन (PDF Report)</span>
            </button>
          </div>

          {downloadSuccessMsg && (
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-fadeIn">
              <Check className="w-3.5 h-3.5" />
              <span>{downloadSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: 3D High-Res Snapshot Export */}
          {activeTab === 'snapshot' && (
            <div className="space-y-6">
              {/* Snapshot Image Preview */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-amber-300 dark:border-stone-700 bg-stone-950 shadow-inner group">
                {snapshotUrl ? (
                  <img
                    src={snapshotUrl}
                    alt="३D घरको योजना दृश्य"
                    className="w-full max-h-[380px] object-contain mx-auto"
                  />
                ) : (
                  <div className="w-full h-64 flex flex-col items-center justify-center text-stone-400 space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                    <span className="text-xs">३D तस्बिर तयार हुँदैछ...</span>
                  </div>
                )}

                {/* Floating Preview Info Badges */}
                <div className="absolute bottom-3 left-3 bg-stone-900/90 backdrop-blur-md border border-stone-700 text-white rounded-xl px-3 py-1.5 text-xs flex items-center gap-3 shadow-lg">
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Home className="w-3.5 h-3.5" /> {getRoofStyleNepali(roofStyle)}
                  </span>
                  <span className="text-stone-500">•</span>
                  <span className="flex items-center gap-1 text-stone-300">
                    <Sun className="w-3.5 h-3.5 text-amber-300" /> {getLightingMoodNepali(lightingMood)}
                  </span>
                  <span className="text-stone-500">•</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <TrendingUp className="w-3.5 h-3.5" /> {terrainAnalysis.slopeDirectionNepali} ({terrainAnalysis.score}%)
                  </span>
                </div>
              </div>

              {/* Resolution Selection Grid */}
              <div className="bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider block">
                  तस्बिरको गुणस्तर तथा रेजोल्युसन रोज्नुहोस् (Image Quality / Resolution):
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['fhd', 'qhd', 'uhd'] as ResolutionOption[]).map((res) => {
                    const cfg = resolutionConfig[res];
                    const isSelected = selectedResolution === res;
                    return (
                      <button
                        key={res}
                        type="button"
                        onClick={() => setSelectedResolution(res)}
                        className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer relative ${
                          isSelected
                            ? 'border-[#7A1C1C] bg-amber-50/70 dark:bg-amber-950/40 shadow-sm'
                            : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-stone-900 dark:text-stone-100 font-serif">
                            {cfg.label}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-[#7A1C1C] dark:text-amber-400" />}
                        </div>
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block mt-0.5">
                          {cfg.width} × {cfg.height} px
                        </span>
                        <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                          {cfg.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Snapshot Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-xs text-stone-500 italic">
                  💡 क्यामेरा कोण परिवर्तन गर्न मोडल बन्द गरी मुख्य स्क्रिनमा घुमाएर पुनः निर्यात खोल्न सक्नुहुन्छ।
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const dataUrl = onCaptureSnapshot(resolutionConfig[selectedResolution].width, resolutionConfig[selectedResolution].height);
                      if (dataUrl) setSnapshotUrl(dataUrl);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-bold transition cursor-pointer"
                  >
                    🔄 ताजा तस्बिर लिनुहोस् (Refresh Capture)
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadSnapshot}
                    disabled={isDownloadingImage}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg cursor-pointer transition disabled:opacity-50"
                  >
                    {isDownloadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>PNG तस्बिर डाउनलोड ({selectedResolution.toUpperCase()})</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Full Printable PDF Report Export & Preview */}
          {activeTab === 'report' && (
            <div className="space-y-6">
              
              {/* Report Controls & Options */}
              <div className="bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider block mb-2">
                    प्रतिवेदनमा समावेश गरिने खण्डहरू (Included Report Sections):
                  </span>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 dark:text-stone-300 font-medium">
                      <input
                        type="checkbox"
                        checked={include3DImage}
                        onChange={(e) => setInclude3DImage(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>३D भवन तस्बिर</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 dark:text-stone-300 font-medium">
                      <input
                        type="checkbox"
                        checked={includeTerrainAnalysis}
                        onChange={(e) => setIncludeTerrainAnalysis(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>धरातल तथा ढलान</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 dark:text-stone-300 font-medium">
                      <input
                        type="checkbox"
                        checked={includePanchaTattva}
                        onChange={(e) => setIncludePanchaTattva(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>पञ्चतत्त्व सन्तुलन</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 dark:text-stone-300 font-medium">
                      <input
                        type="checkbox"
                        checked={includeRoomTable}
                        onChange={(e) => setIncludeRoomTable(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>कोठागत मूल्याङ्कन</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 dark:text-stone-300 font-medium">
                      <input
                        type="checkbox"
                        checked={includeRemedies}
                        onChange={(e) => setIncludeRemedies(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>वैदिक उपाय</span>
                    </label>
                  </div>
                </div>

                {/* PDF Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDirectPrint}
                    className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                    title="प्रिन्टरबाट सिधै प्रिन्ट गर्नुहोस्"
                  >
                    <Printer className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                    <span>सिधै प्रिन्ट</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPdf}
                    className="px-5 py-2.5 rounded-xl bg-[#7A1C1C] hover:bg-[#601616] text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg cursor-pointer transition disabled:opacity-50"
                  >
                    {isGeneratingPdf ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    ) : (
                      <Download className="w-4 h-4 text-amber-400" />
                    )}
                    <span>📄 PDF प्रतिवेदन डाउनलोड</span>
                  </button>
                </div>
              </div>

              {/* PDF Document Visual Preview Banner */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-stone-800 border border-amber-200 dark:border-stone-700 flex items-center justify-between text-xs text-stone-600 dark:text-stone-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <Eye className="w-4 h-4 text-amber-600 shrink-0" />
                  तलको भाग आधिकारिक A4 प्रिन्ट ढाँचामा प्रस्तुत गरिएको छ। यो भाग सिधै PDF मा रूपान्तरण हुन्छ।
                </span>
                <span className="font-bold text-[#7A1C1C] dark:text-amber-400 shrink-0">
                  कुल २ पृष्ठ A4
                </span>
              </div>

              {/* Printable PDF Render Area (Used by exportElementToPDF & visible as preview) */}
              <div
                id="vastu-3d-printable-pdf-root"
                className="bg-stone-100 dark:bg-stone-950 p-2 sm:p-4 rounded-2xl overflow-x-auto border border-stone-300 dark:border-stone-800 space-y-6"
              >
                
                {/* PAGE 1: 3D Visualization, Project Specifications & Terrain Slope */}
                <div
                  className="print-page bg-[#FFFDF7] text-stone-900 mx-auto w-full max-w-[800px] min-h-[1100px] p-8 sm:p-10 rounded-xl shadow-lg border-2 border-amber-200 flex flex-col justify-between"
                  style={{ pageBreakAfter: 'always' }}
                >
                  <div>
                    {/* Header */}
                    <div className="border-b-2 border-[#7A1C1C] pb-4 flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-[#7A1C1C] uppercase tracking-wider mb-1">
                          <span>ॐ श्री गणेशाय नमः</span>
                          <span>•</span>
                          <span>वैदिक वास्तु भवन निर्माण</span>
                        </div>
                        <h1 className="text-2xl font-black font-serif text-[#7A1C1C]">
                          बालानन्द कर्मकाण्ड
                        </h1>
                        <h2 className="text-sm font-bold text-stone-700 mt-0.5">
                          ३D वास्तु भवन योजना तथा धरातल मूल्याङ्कन प्रतिवेदन
                        </h2>
                      </div>

                      <div className="text-right">
                        <div className="inline-block px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-center">
                          <span className="text-[10px] uppercase font-bold text-stone-500 block">
                            वास्तु अङ्क
                          </span>
                          <span className="text-xl font-black font-serif text-[#7A1C1C]">
                            {vastuAnalysis.overallScore}%
                          </span>
                          <span className="text-[10px] font-bold text-amber-800 block">
                            श्रेणी: {vastuAnalysis.grade}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Project Meta Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 my-3 border-b border-amber-200/80 text-xs bg-amber-50/40 p-2.5 rounded-xl">
                      <div>
                        <span className="text-[10px] text-stone-500 font-bold block">परियोजनाको नाम</span>
                        <span className="font-bold text-stone-900">{project.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 font-bold block">गृहस्वामी / ग्राहक</span>
                        <span className="font-bold text-stone-900">{project.clientName || 'गृहस्वामी'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 font-bold block">जग्गाको नाप / क्षेत्रफल</span>
                        <span className="font-bold text-stone-900">
                          {project.plotLength} × {project.plotWidth} {project.unit} ({project.plotArea} {project.unit}²)
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 font-bold block">मुख्य सडक / दिशा</span>
                        <span className="font-bold text-stone-900">
                          {project.roads[0]?.direction || 'उत्तर'} | तला: {project.floorCount}
                        </span>
                      </div>
                    </div>

                    {/* 3D Model Render Image */}
                    {include3DImage && (
                      <div className="my-4 rounded-xl overflow-hidden border-2 border-amber-300 bg-stone-900 shadow-md">
                        {snapshotUrl ? (
                          <img
                            src={snapshotUrl}
                            alt="३D वास्तु भवन दृश्य"
                            className="w-full max-h-[360px] object-cover mx-auto"
                          />
                        ) : (
                          <div className="w-full h-48 flex items-center justify-center text-stone-400">
                            ३D तस्बिर लोडिङ...
                          </div>
                        )}
                        <div className="bg-stone-900 text-stone-300 text-[11px] px-3 py-1.5 flex items-center justify-between">
                          <span>३D यथार्थपरक भवन मोडेल (आँगन, बगैँचा, बाटो, तुलसीको मठ र धरातल सहित)</span>
                          <span className="text-amber-400 font-semibold">{getRoofStyleNepali(roofStyle)}</span>
                        </div>
                      </div>
                    )}

                    {/* Terrain & Slope Analysis Section */}
                    {includeTerrainAnalysis && (
                      <div className="my-4 p-4 rounded-xl border border-amber-300 bg-amber-50/50 space-y-2">
                        <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                          <h3 className="text-xs font-black font-serif text-[#7A1C1C] flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-amber-700" />
                            <span>जमिनको धरातल, उँचाइ तथा ढलान वास्तु मूल्याङ्कन</span>
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white bg-[#7A1C1C]">
                            ढलान अङ्क: {terrainAnalysis.score}/१००
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                          <div>
                            <span className="text-[10px] text-stone-500 block">ढलान दिशा</span>
                            <span className="font-bold text-stone-900">{terrainAnalysis.slopeDirectionNepali}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-500 block">भिरालोपन / उँचाइ फरक</span>
                            <span className="font-bold text-stone-900">
                              {terrainAnalysis.gradientPercent}% ({terrainAnalysis.heightDifference} फिट अन्तर)
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-500 block">शास्त्रीय फैसला</span>
                            <span className="font-bold text-emerald-800">{terrainAnalysis.titleNepali}</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-stone-700 leading-relaxed pt-1 italic">
                          📜 {terrainAnalysis.classicalRule}
                        </p>
                        <p className="text-[11px] text-stone-700 leading-relaxed">
                          <strong>पारिवारिक प्रभाव:</strong> {terrainAnalysis.effectsNepali?.join(', ') || 'सामान्य प्रभाव'}
                        </p>
                      </div>
                    )}

                    {/* Executive Summary */}
                    <div className="p-3 rounded-xl bg-white border border-stone-200 text-xs leading-relaxed space-y-1">
                      <span className="font-bold text-[#7A1C1C] block font-serif">
                        मुख्य वास्तु निष्कर्ष (Executive Summary):
                      </span>
                      <p className="text-stone-700">{vastuAnalysis.summaryNepali}</p>
                    </div>
                  </div>

                  {/* Page 1 Footer */}
                  <div className="border-t border-stone-200 pt-3 flex items-center justify-between text-[10px] text-stone-400 mt-4">
                    <span>बालानन्द कर्मकाण्ड वास्तु भवन योजना • आधिकारिक डिजिटल प्रतिवेदन</span>
                    <span>पृष्ठ १ / २</span>
                  </div>
                </div>

                {/* PAGE 2: 5-Elements, Room Table & Vedic Remedies */}
                <div
                  className="print-page bg-[#FFFDF7] text-stone-900 mx-auto w-full max-w-[800px] min-h-[1100px] p-8 sm:p-10 rounded-xl shadow-lg border-2 border-amber-200 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header Page 2 */}
                    <div className="border-b border-stone-200 pb-2 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#7A1C1C] font-serif">
                        {project.name} - विस्तृत कोठागत विश्लेषण तथा वैदिक उपचार
                      </span>
                      <span className="text-xs text-stone-500">पृष्ठ २ / २</span>
                    </div>

                    {/* Pancha Tattva (5 Elements) Matrix */}
                    {includePanchaTattva && vastuAnalysis.elementBalance && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold font-serif text-[#7A1C1C] uppercase tracking-wider">
                          पञ्चतत्त्व सन्तुलन विश्लेषण (Five Elements Energy Balance)
                        </h3>
                        <div className="grid grid-cols-5 gap-2">
                          {[
                            { key: 'water', name: 'जल तत्त्व', dir: 'उत्तर-पूर्व (ईशान)', score: vastuAnalysis.elementBalance.water ?? 85, color: 'text-blue-700 bg-blue-50 border-blue-200' },
                            { key: 'fire', name: 'अग्नि तत्त्व', dir: 'दक्षिण-पूर्व (आग्नेय)', score: vastuAnalysis.elementBalance.fire ?? 85, color: 'text-red-700 bg-red-50 border-red-200' },
                            { key: 'earth', name: 'पृथ्वी तत्त्व', dir: 'दक्षिण-पश्चिम (नैरृत्य)', score: vastuAnalysis.elementBalance.earth ?? 85, color: 'text-amber-800 bg-amber-50 border-amber-200' },
                            { key: 'air', name: 'वायु तत्त्व', dir: 'उत्तर-पश्चिम (वायव्य)', score: vastuAnalysis.elementBalance.air ?? 85, color: 'text-teal-700 bg-teal-50 border-teal-200' },
                            { key: 'space', name: 'आकाश तत्त्व', dir: 'केन्द्र (ब्रह्मस्थान)', score: vastuAnalysis.elementBalance.space ?? 90, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' }
                          ].map((elem) => (
                            <div key={elem.key} className={`p-2 rounded-xl border text-center ${elem.color}`}>
                              <span className="text-[10px] font-bold block">{elem.name}</span>
                              <span className="text-sm font-black block font-serif my-0.5">{elem.score}%</span>
                              <span className="text-[9px] text-stone-500 block leading-tight">{elem.dir}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Room-by-Room Evaluation Table */}
                    {includeRoomTable && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold font-serif text-[#7A1C1C] uppercase tracking-wider">
                          कोठागत वास्तु स्थिति तालिका (Room Compliance Directory)
                        </h3>
                        <div className="border border-amber-200 rounded-xl overflow-hidden text-xs">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-amber-100/70 text-[#7A1C1C] font-bold text-[11px]">
                                <th className="p-2 border-b border-amber-200">क्र.सं.</th>
                                <th className="p-2 border-b border-amber-200">कोठाको नाम</th>
                                <th className="p-2 border-b border-amber-200">तल्ला</th>
                                <th className="p-2 border-b border-amber-200">सिफारिस दिशा</th>
                                <th className="p-2 border-b border-amber-200">वास्तु स्थिति</th>
                                <th className="p-2 border-b border-amber-200">आकार (ft)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {project.rooms.slice(0, 8).map((rm, idx) => (
                                <tr key={rm.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-amber-50/30'}>
                                  <td className="p-2 border-b border-stone-200/60 text-stone-500">{idx + 1}</td>
                                  <td className="p-2 border-b border-stone-200/60 font-bold text-stone-900">{rm.nameNepali}</td>
                                  <td className="p-2 border-b border-stone-200/60">{rm.floorNumber === 0 ? 'भुइँतला' : `${rm.floorNumber} तल्ला`}</td>
                                  <td className="p-2 border-b border-stone-200/60 font-semibold text-amber-900">{rm.preferredDirection}</td>
                                  <td className="p-2 border-b border-stone-200/60">
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                      उत्तम वास्तु
                                    </span>
                                  </td>
                                  <td className="p-2 border-b border-stone-200/60 text-stone-600">
                                    {rm.minLength} × {rm.minWidth} ft
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Non-Destructive Vedic Remedies Section */}
                    {includeRemedies && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold font-serif text-[#7A1C1C] uppercase tracking-wider">
                          गैर-विनाशकारी वैदिक वास्तु उपायहरू (Non-Destructive Vedic Harmonizers)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded-xl border border-amber-200 bg-white space-y-1">
                            <span className="font-bold text-stone-900 flex items-center gap-1 text-[11px]">
                              🪔 ईशान कोण (North-East) ऊर्जा संवर्धन:
                            </span>
                            <p className="text-stone-600 text-[10px] leading-relaxed">
                              उत्तर-पूर्व खुला राखी बिहानको सूर्यकिरण निर्बाध आउने वातावरण बनाउनुहोस्। तुलसीको मठ र जलकलश स्थापना गर्नुहोस्।
                            </p>
                          </div>
                          <div className="p-2.5 rounded-xl border border-amber-200 bg-white space-y-1">
                            <span className="font-bold text-stone-900 flex items-center gap-1 text-[11px]">
                              🏔️ नैरृत्य कोण (South-West) स्थिरता:
                            </span>
                            <p className="text-stone-600 text-[10px] leading-relaxed">
                              दक्षिण-पश्चिम भागलाई घरको सबैभन्दा गह्रौँ र अग्लो बनाउनुहोस्। मुख्य शयनकक्ष वा ओभरहेड पानी ट्यांकी राख्नु शुभ हुन्छ।
                            </p>
                          </div>
                          <div className="p-2.5 rounded-xl border border-amber-200 bg-white space-y-1">
                            <span className="font-bold text-stone-900 flex items-center gap-1 text-[11px]">
                              🔥 आग्नेय कोण (South-East) तेज सन्तुलन:
                            </span>
                            <p className="text-stone-600 text-[10px] leading-relaxed">
                              भान्सा र बिजुली मिटर आग्नेयमा राख्नुहोस्। यहाँ पानीको ट्यांकी वा सेफ्टी ट्यांकी कहिल्यै नराख्नुहोस्।
                            </p>
                          </div>
                          <div className="p-2.5 rounded-xl border border-amber-200 bg-white space-y-1">
                            <span className="font-bold text-stone-900 flex items-center gap-1 text-[11px]">
                              💨 वायव्य कोण (North-West) वायु प्रवाह:
                            </span>
                            <p className="text-stone-600 text-[10px] leading-relaxed">
                              अतिथि कोठा, सवारी पार्किङ वा सामान्य शौचालयका लागि वायव्य कोण उपयुक्त हुन्छ।
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Official Sign-off & Signature Block */}
                    <div className="pt-4 border-t-2 border-dashed border-stone-300 grid grid-cols-2 gap-8 text-xs mt-6">
                      <div className="space-y-8">
                        <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">
                          वास्तुविद् / ज्योतिषाचार्य प्रमाणित हस्ताक्षर:
                        </span>
                        <div className="border-t border-stone-400 pt-1 text-stone-800">
                          <span className="font-bold block">बालानन्द कर्मकाण्ड वास्तु प्रतिष्ठान</span>
                          <span className="text-[10px] text-stone-500">वैदिक वास्तु अनुसन्धान केन्द्र</span>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">
                          गृहस्वामी / निर्माणकर्ता स्वीकृति:
                        </span>
                        <div className="border-t border-stone-400 pt-1 text-stone-800">
                          <span className="font-bold block">{project.clientName || 'गृहस्वामी'}</span>
                          <span className="text-[10px] text-stone-500">मिति: {new Date().toLocaleDateString('ne-NP')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Page 2 Footer */}
                  <div className="border-t border-stone-200 pt-3 flex items-center justify-between text-[10px] text-stone-400 mt-4">
                    <span>शुभम् भवतु • वास्तु शान्तिः सर्वसुखप्रदा</span>
                    <span>पृष्ठ २ / २</span>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Bar */}
        <div className="p-4 border-t border-amber-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-stone-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>बालानन्द कर्मकाण्ड वास्तु इन्जिनियरिङ प्रणाली</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-bold transition cursor-pointer"
            >
              बन्द गर्नुहोस् (Close)
            </button>

            {activeTab === 'snapshot' ? (
              <button
                type="button"
                onClick={handleDownloadSnapshot}
                disabled={isDownloadingImage}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black flex items-center gap-2 cursor-pointer shadow-md transition disabled:opacity-50"
              >
                {isDownloadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>तस्बिर डाउनलोड गर्नुहोस् ({selectedResolution.toUpperCase()})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="px-5 py-2 rounded-xl bg-[#7A1C1C] hover:bg-[#601616] text-white text-xs font-black flex items-center gap-2 cursor-pointer shadow-md transition disabled:opacity-50"
              >
                {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> : <Download className="w-4 h-4 text-amber-400" />}
                <span>📄 PDF प्रतिवेदन डाउनलोड</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
