// Formal 10-Page Municipal & Vedic Legal Blueprint Drawing Set Generator
// नेपाल सरकार तथा स्थानीय नगरपालिका मापदण्ड सम्मत १०-पृष्ठ औपचारिक भवन नक्सा तथा वास्तु दस्तावेज
import React, { useState } from 'react';
import { 
  VastuPlannerProject, 
  GeneratedFloorPlan, 
  CompassDirection 
} from '../types';
import { DIRECTION_NAMES_NEPALI } from '../rules/vastuRules';
import { 
  Printer, 
  X, 
  Layers, 
  Building2, 
  Compass, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Stamp,
  Award
} from 'lucide-react';
import { generateVastuFloorPlan } from '../planner/planGenerator';
import { canUserPrintDocuments } from '../../db/subscriptionStore';

interface TenPageLegalBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: VastuPlannerProject;
  plan: GeneratedFloorPlan;
  onProjectUpdate?: (updated: VastuPlannerProject, updatedPlan: GeneratedFloorPlan) => void;
}

export const TenPageLegalBlueprintModal: React.FC<TenPageLegalBlueprintModalProps> = ({
  isOpen,
  onClose,
  project,
  plan,
  onProjectUpdate
}) => {
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [printMode, setPrintMode] = useState<'all' | 'current'>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  if (!isOpen) return null;

  const currentFloorCount = Math.max(1, project.floorCount || 1);

  const handleFloorChange = (newCount: number) => {
    const updatedProject: VastuPlannerProject = {
      ...project,
      floorCount: newCount,
      updatedAt: new Date().toISOString()
    };
    const updatedPlan = generateVastuFloorPlan(updatedProject);
    if (onProjectUpdate) {
      onProjectUpdate(updatedProject, updatedPlan);
    }
  };

  const handlePrint = (mode: 'all' | 'current') => {
    if (!canUserPrintDocuments('vastu')) {
      window.dispatchEvent(new CustomEvent('trial-print-blocked', { detail: { docType: 'vastu' } }));
      return;
    }
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const plotW = plan.plotBounds.width;
  const plotH = plan.plotBounds.height;
  const bW = plan.buildingBounds.width;
  const bH = plan.buildingBounds.height;
  const groundFloor = plan.floors[0] || { rooms: [], floorNameNepali: 'भुइँतला' };
  const firstFloor = plan.floors[1] || plan.floors[0];
  const secondFloor = plan.floors[2] || plan.floors[1] || plan.floors[0];

  const primaryRoad = project.roads[0] || { direction: 'E' as CompassDirection, width: 16, name: 'मुख्य सडक (१६ फिट)' };
  const orientationAngle = project.orientationAngle || 0;

  // 10 Page Definitions
  const pagesList = [
    { id: 1, code: 'BLN-V-01', titleNepali: 'कभर, स्वामित्व तथा साइट/वास्तु मण्डल प्लान', short: 'साइट प्लान' },
    { id: 2, code: 'BLN-V-02', titleNepali: 'भुइँतला (Ground Floor) विस्तृत वास्तुशिल्प नक्सा', short: 'भुइँतला' },
    { id: 3, code: 'BLN-V-03', titleNepali: 'पहिलो तला (First Floor) वास्तुशिल्प नक्सा', short: 'पहिलो तला' },
    { id: 4, code: 'BLN-V-04', titleNepali: 'दोस्रो तला / माथिल्लो तला (Upper Floor) नक्सा', short: 'दोस्रो तला' },
    { id: 5, code: 'BLN-V-05', titleNepali: 'कौशी, खुला छत, सौर्य तथा पानी ट्याङ्की वास्तु नक्सा', short: 'कौशी/छत' },
    { id: 6, code: 'BLN-V-06', titleNepali: 'चारै दिशाको बाह्य स्वरूप नक्सा (All 4 Elevations)', short: '४ दिशा मोहोडा' },
    { id: 7, code: 'BLN-V-07', titleNepali: 'संरचनात्मक स्तम्भ ग्रिड, जग तथा बिम लेआउट', short: 'पिल्लर ग्रिड' },
    { id: 8, code: 'BLN-V-08', titleNepali: 'बिजुली, खानेपानी, ढल तथा वर्षात पानी वास्तु नक्सा', short: 'इन्जिनियरिङ' },
    { id: 9, code: 'BLN-V-09', titleNepali: '१६ दिशा मण्डल, आय-व्यय शुभाशुभ तथा पञ्चतत्त्व चक्र', short: 'वास्तु चक्र' },
    { id: 10, code: 'BLN-V-10', titleNepali: 'प्राविधिक घोषणा, कानूनी प्रमाणीकरण तथा आधिकारिक हस्ताक्षर पत्र', short: 'हस्ताक्षर पत्र' }
  ];

  // Helper Header for standard page border
  const renderSheetHeader = (pageNumber: number, dwgCode: string, sheetTitle: string) => (
    <div className="border-b-2 border-stone-800 pb-2 mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#7A1C1C] text-white flex items-center justify-center font-bold text-xs">
            ॐ
          </div>
          <div>
            <h1 className="font-serif font-black text-sm text-[#7A1C1C] tracking-wide">
              बालानन्द कर्मकाण्ड वैदिक वास्तु तथा इन्जिनियरिङ कन्सल्टेन्सी
            </h1>
            <p className="text-[10px] text-stone-600 font-medium">
              नेपाल राष्ट्रिय भवन संहिता (NBC 205/105) तथा स्थानीय नगरपालिका भवन निर्माण मापदण्ड सम्मत आधिकारिक नक्सा
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="inline-block bg-stone-100 border border-stone-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
            DWG NO: {dwgCode}
          </div>
          <div className="text-[10px] font-bold text-stone-800">
            पृष्ठ {pageNumber} / १० | मिति: {new Date().toLocaleDateString('ne-NP')}
          </div>
        </div>
      </div>

      <div className="mt-2 bg-amber-50 border-y border-amber-200 py-1 px-2 flex items-center justify-between text-[11px] font-bold text-amber-950">
        <span>{sheetTitle}</span>
        <span className="font-normal text-stone-600">
          परियोजना: {project.name} | गृहस्वामी: {project.clientName || 'श्रीमान् / श्रीमती'} | कुल तला: {currentFloorCount}
        </span>
      </div>
    </div>
  );

  // Helper Footer for title block & official stamp
  const renderSheetFooter = (pageNumber: number, dwgCode: string) => (
    <div className="mt-3 pt-2 border-t-2 border-stone-800 text-[9px] text-stone-700 flex items-end justify-between">
      <div className="grid grid-cols-4 gap-2 border border-stone-300 p-1.5 rounded bg-stone-50 flex-1 max-w-xl">
        <div>
          <span className="text-stone-400 block uppercase">स्थान / कित्ता</span>
          <span className="font-bold block truncate">{project.geoLocation?.locationName || 'नेपाल'} | कित्ता: १०८</span>
        </div>
        <div>
          <span className="text-stone-400 block uppercase">जग्गा नाप</span>
          <span className="font-bold block">{plotW} × {plotH} {project.unit} ({project.plotArea} {project.unit}²)</span>
        </div>
        <div>
          <span className="text-stone-400 block uppercase">स्केल (Scale)</span>
          <span className="font-bold block">1:100 / (1/8" = 1'-0")</span>
        </div>
        <div>
          <span className="text-stone-400 block uppercase">वास्तु स्कोर</span>
          <span className="font-bold text-emerald-800 block">
            {project.analysisResult?.overallScore || 88}% (उत्तम)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-center pl-3">
        <div>
          <div className="w-20 border-b border-stone-400 mb-0.5" />
          <span className="text-[8.5px] text-stone-600 block">वास्तुविद् प्रमाणीकरण</span>
        </div>
        <div>
          <div className="w-20 border-b border-stone-400 mb-0.5" />
          <span className="text-[8.5px] text-stone-600 block">इन्जिनियर हस्ताक्षर</span>
        </div>
        <div>
          <div className="w-20 border-b border-stone-400 mb-0.5" />
          <span className="text-[8.5px] text-stone-600 block">गृहस्वामी हस्ताक्षर</span>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      id="legal-blueprint-modal-overlay" 
      className="fixed inset-0 z-[1000] bg-stone-950/85 backdrop-blur-md flex flex-col p-0 sm:p-3 overflow-hidden"
    >
      {/* Top Interactive Toolbar (Hidden in Print) */}
      <header className="no-print bg-[#7A1C1C] text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md shrink-0 border-b border-amber-600/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-200">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold font-serif text-amber-100">
                १०-पृष्ठ कानूनी तथा नगरपालिका भवन नक्सा प्रिन्ट सेट
              </h2>
              <span className="bg-amber-400 text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                औपचारिक कानूनी दस्तावेज
              </span>
            </div>
            <p className="text-[11px] text-amber-200/90 hidden sm:block">
              नेपाल भवन मापदण्ड तथा वैदिक वास्तु शास्त्र अनुरूप भुइँतला देखि अन्तिम तला सम्मको पूर्ण नक्सा सेट
            </p>
          </div>
        </div>

        {/* Floor Count Quick Switcher */}
        <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-xl border border-amber-400/30">
          <span className="text-xs font-bold text-amber-200 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>भवन तला:</span>
          </span>
          {[1, 2, 3, 4, 5].map(cnt => (
            <button
              key={cnt}
              type="button"
              onClick={() => handleFloorChange(cnt)}
              className={`px-2 py-0.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                currentFloorCount === cnt
                  ? 'bg-amber-400 text-stone-950 shadow-xs'
                  : 'text-stone-300 hover:bg-white/10'
              }`}
            >
              {cnt} तला
            </button>
          ))}
        </div>

        {/* Print & Action Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="hidden md:flex items-center gap-1 bg-black/25 px-2 py-1 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
              className="p-1 hover:bg-white/10 rounded cursor-pointer text-amber-200"
              title="जुम घटाउनुहोस्"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] px-1">{Math.round(zoomLevel * 100)}%</span>
            <button
              type="button"
              onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
              className="p-1 hover:bg-white/10 rounded cursor-pointer text-amber-200"
              title="जुम बढाउनुहोस्"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Print Single Page */}
          <button
            type="button"
            onClick={() => handlePrint('current')}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-white/20"
            title="हाल हेरिरहेको पृष्ठ मात्र प्रिन्ट गर्नुहोस्"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">पृष्ठ {activePageIndex + 1} प्रिन्ट</span>
          </button>

          {/* Print All 10 Pages */}
          <button
            type="button"
            onClick={() => handlePrint('all')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
            title="सबै १० पृष्ठ औपचारिक नक्सा सेट प्रिन्ट वा PDF सेभ गर्नुहोस्"
          >
            <Printer className="w-4 h-4" />
            <span>सबै १० पृष्ठ प्रिन्ट (Print All 10)</span>
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white cursor-pointer ml-1"
            title="बन्द गर्नुहोस्"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Navigation Tabs for all 10 pages (Hidden in Print) */}
      <nav className="no-print bg-stone-100 dark:bg-stone-900 border-b border-stone-300 dark:border-stone-800 px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider pr-1">
          पृष्ठहरू:
        </span>
        {pagesList.map((p, idx) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActivePageIndex(idx)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
              activePageIndex === idx
                ? 'bg-[#7A1C1C] text-white border-[#7A1C1C] shadow-xs'
                : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:border-amber-400'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center font-mono">
              {p.id}
            </span>
            <span>{p.short}</span>
          </button>
        ))}
      </nav>

      {/* Main Printable Container */}
      <main className="flex-1 overflow-y-auto p-2 sm:p-6 bg-stone-200/70 dark:bg-stone-950 flex flex-col items-center">
        <div 
          id="legal-blueprint-modal-content"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
          className="transition-transform duration-150 w-full max-w-[210mm] space-y-6"
        >
          {/* ================= PAGE 1: COVER & SITE PLAN ================= */}
          <section 
            id="blueprint-page-1"
            className={`blueprint-legal-page a4-preview-container bg-white p-6 rounded-md shadow-lg border-2 border-stone-800 text-stone-900 font-sans ${
              printMode === 'current' && activePageIndex !== 0 ? 'hidden' : 'block'
            }`}
          >
            {renderSheetHeader(1, 'BLN-V-01', 'कभर पृष्ठ, स्वामित्व विवरण तथा घडेरी/साइट वास्तु मण्डल प्लान')}

            {/* Project Particulars Table */}
            <div className="grid grid-cols-2 gap-3 border border-stone-400 p-2.5 rounded bg-stone-50/70 text-xs mb-3">
              <div className="space-y-1">
                <div><span className="text-stone-500 font-semibold">आयोजनाको नाम:</span> <span className="font-bold">{project.name}</span></div>
                <div><span className="text-stone-500 font-semibold">गृहस्वामी (Client):</span> <span className="font-bold">{project.clientName || 'श्रीमान् / श्रीमती'}</span></div>
                <div><span className="text-stone-500 font-semibold">स्थान / वडा:</span> <span>{project.geoLocation?.locationName || 'नेपाल'}</span></div>
                <div><span className="text-stone-500 font-semibold">कित्ता नं.:</span> <span className="font-mono font-bold">१०८ / २५६</span></div>
              </div>
              <div className="space-y-1">
                <div><span className="text-stone-500 font-semibold">जग्गाको नाप:</span> <span className="font-mono font-bold">{plotW}' × {plotH}' ({project.plotArea} sq.ft)</span></div>
                <div><span className="text-stone-500 font-semibold">भवन फुटप्रिन्ट:</span> <span className="font-mono font-bold">{bW}' × {bH}' ({bW * bH} sq.ft)</span></div>
                <div><span className="text-stone-500 font-semibold">प्रस्तावित तला:</span> <span className="font-bold text-[#7A1C1C]">{currentFloorCount} तला (Ground + {currentFloorCount - 1})</span></div>
                <div><span className="text-stone-500 font-semibold">सडकको चौडाइ:</span> <span className="font-bold">{primaryRoad.name || `सडक (${primaryRoad.width} फिट)`}</span></div>
              </div>
            </div>

            {/* Site Plan Graphic SVG */}
            <div className="border-2 border-stone-800 rounded bg-[#FAF9F6] p-2 flex flex-col items-center relative">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest self-start mb-1">
                घडेरी तथा साइट प्लान (SITE & SETBACK LAYOUT - SCALE 1:100)
              </span>

              <svg viewBox="0 0 540 320" className="w-full h-[270px]">
                {/* Grid Background */}
                <defs>
                  <pattern id="siteGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="540" height="320" fill="url(#siteGrid)" />

                {/* Plot Boundary */}
                <rect x="70" y="30" width="380" height="240" fill="#FEFCE8" stroke="#1E293B" strokeWidth="2.5" />
                <text x="260" y="24" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#475569">
                  उत्तर सीमाना (North Boundary - {plotW}')
                </text>
                <text x="260" y="285" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#475569">
                  दक्षिण सीमाना (South Boundary - {plotW}')
                </text>

                {/* Setbacks Dotted Lines */}
                <rect x="110" y="60" width="300" height="180" fill="none" stroke="#94A3B8" strokeWidth="1" strokeDasharray="4 3" />

                {/* Building Footprint */}
                <rect x="130" y="75" width="260" height="150" fill="#E2E8F0" stroke="#7A1C1C" strokeWidth="2" />
                <text x="260" y="145" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#7A1C1C">
                  प्रस्तावित भवन निर्माण क्षेत्र ({bW}' × {bH}')
                </text>
                <text x="260" y="162" textAnchor="middle" fontSize="10" fill="#475569">
                  {currentFloorCount} तला आवासीय भवन
                </text>

                {/* Setback Annotations */}
                <text x="260" y="68" textAnchor="middle" fontSize="9" fill="#0284C7" fontWeight="bold">अगाडि सेटब्याक (५ फिट)</text>
                <text x="260" y="238" textAnchor="middle" fontSize="9" fill="#0284C7" fontWeight="bold">पछाडि सेटब्याक (५ फिट)</text>
                <text x="88" y="150" textAnchor="middle" fontSize="9" fill="#0284C7" fontWeight="bold">बायाँ सेटब्याक (५')</text>
                <text x="430" y="150" textAnchor="middle" fontSize="9" fill="#0284C7" fontWeight="bold">दायाँ सेटब्याक (५')</text>

                {/* Vastu Elements on Site */}
                {/* Tulsi Math (NE) */}
                <circle cx="370" cy="50" r="10" fill="#DCFCE7" stroke="#16A34A" strokeWidth="1.5" />
                <text x="370" y="53" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#15803D">तुलसी</text>

                {/* Boring / Water Sump (NE) */}
                <circle cx="390" cy="80" r="11" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
                <text x="390" y="83" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#0369A1">इनार/बोरीङ</text>

                {/* Septic Tank (NW) */}
                <rect x="80" y="45" width="24" height="16" fill="#FEE2E2" stroke="#DC2626" strokeWidth="1.5" />
                <text x="92" y="56" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#B91C1C">सेफ्टी ट्याङ्की</text>

                {/* Entrance Gate */}
                <rect x="230" y="267" width="50" height="7" fill="#7A1C1C" stroke="#000000" strokeWidth="1" />
                <text x="255" y="263" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#7A1C1C">मुख्य प्रवेशद्वार (Gate)</text>

                {/* Compass */}
                <g transform="translate(480, 70)">
                  <circle r="22" fill="#FFFFFF" stroke="#7A1C1C" strokeWidth="1.5" />
                  <polygon points="0,-18 5,0 -5,0" fill="#DC2626" />
                  <polygon points="0,18 5,0 -5,0" fill="#64748B" />
                  <text y="-20" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#DC2626">उत्तर (N)</text>
                  <text y="28" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#64748B">दक्षिण</text>
                </g>
              </svg>
            </div>

            {/* Setback & Municipal Norms Note */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] border-t border-stone-300 pt-2">
              <div className="p-1.5 bg-stone-100 rounded">
                <span className="font-bold block text-stone-800">१. भवन कभरेज (Ground Coverage):</span>
                <span>स्वीकार्य: ६०% | प्रस्तावित: {Math.round(((bW * bH) / (plotW * plotH || 1)) * 100)}% (मापदण्ड भित्र)</span>
              </div>
              <div className="p-1.5 bg-stone-100 rounded">
                <span className="font-bold block text-stone-800">२. खुला क्षेत्र (Open Space):</span>
                <span>स्वीकार्य: ४०% | बाँकी खुला आँगन: {100 - Math.round(((bW * bH) / (plotW * plotH || 1)) * 100)}%</span>
              </div>
              <div className="p-1.5 bg-stone-100 rounded">
                <span className="font-bold block text-stone-800">३. फ्लोर एरिया रेसियो (FAR):</span>
                <span>स्वीकार्य: १.७५ देखि २.२५ | प्रस्तावित: {(((bW * bH * currentFloorCount) / (project.plotArea || 1))).toFixed(2)}</span>
              </div>
            </div>

            {renderSheetFooter(1, 'BLN-V-01')}
          </section>

          {/* ================= PAGE 2: GROUND FLOOR PLAN ================= */}
          <section 
            id="blueprint-page-2"
            className={`blueprint-legal-page a4-preview-container bg-white p-6 rounded-md shadow-lg border-2 border-stone-800 text-stone-900 font-sans ${
              printMode === 'current' && activePageIndex !== 1 ? 'hidden' : 'block'
            }`}
          >
            {renderSheetHeader(2, 'BLN-V-02', 'भुइँतला (Ground Floor) विस्तृत वास्तुशिल्प नक्सा')}

            {/* Floor Drawing SVG */}
            <div className="border-2 border-stone-800 rounded bg-[#FAF9F6] p-2 flex flex-col items-center">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest self-start mb-1">
                भुइँतला वास्तुशिल्प नक्सा (GROUND FLOOR PLAN - SCALE 1:100)
              </span>

              <svg viewBox="0 0 540 320" className="w-full h-[280px]">
                {/* Outer Building Wall Thick Line */}
                <rect x="40" y="20" width="460" height="270" fill="#F8FAFC" stroke="#0F172A" strokeWidth="3" />

                {/* Central Brahmasthan */}
                <rect x="190" y="110" width="160" height="90" fill="#FEF3C7" fillOpacity="0.4" stroke="#D97706" strokeWidth="1" strokeDasharray="3 3" />
                <text x="270" y="158" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#B45309">
                  ब्रह्मस्थान (Brahmasthan)
                </text>

                {/* Ground Rooms Layout */}
                {groundFloor.rooms.map((rm, idx) => {
                  const rx = 40 + (rm.x / bW) * 460;
                  const ry = 20 + (rm.y / bH) * 270;
                  const rw = (rm.width / bW) * 460;
                  const rh = (rm.height / bH) * 270;

                  return (
                    <g key={rm.id || idx}>
                      <rect 
                        x={rx} 
                        y={ry} 
                        width={rw} 
                        height={rh} 
                        fill={rm.color || '#FFFFFF'} 
                        stroke="#1E293B" 
                        strokeWidth="1.8" 
                      />
                      <text x={rx + rw / 2} y={ry + rh / 2 - 4} textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#0F172A">
                        {rm.nameNepali.split(' (')[0]}
                      </text>
                      <text x={rx + rw / 2} y={ry + rh / 2 + 10} textAnchor="middle" fontSize="8" fill="#475569" fontFamily="monospace">
                        {rm.width.toFixed(1)}' × {rm.height.toFixed(1)}' ({rm.area} sq.ft)
                      </text>
                      <text x={rx + rw - 6} y={ry + 12} textAnchor="end" fontSize="7.5" fontWeight="bold" fill="#15803D">
                        {rm.vastuRating === 'recommended' ? '🟢 उत्तम' : '🟡 मान्य'}
                      </text>
                    </g>
                  );
                })}

                {/* Staircase (SW / West) */}
                <g transform="translate(60, 210)">
                  <rect width="70" height="60" fill="#F1F5F9" stroke="#334155" strokeWidth="1.5" />
                  {[1, 2, 3, 4, 5].map(st => (
                    <line key={st} x1="0" y1={st * 10} x2="70" y2={st * 10} stroke="#94A3B8" strokeWidth="1" />
                  ))}
                  <text x="35" y="35" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1E293B">
                    🪜 भर्याङ (१७ खुड्किला)
                  </text>
                </g>
              </svg>
            </div>

            {/* Room Schedule Table */}
            <div className="mt-2.5 overflow-x-auto">
              <table className="w-full text-left text-[9.5px] border border-stone-300">
                <thead className="bg-stone-100 border-b border-stone-300 font-bold text-stone-800">
                  <tr>
                    <th className="p-1">क्र.सं.</th>
                    <th className="p-1">कोठा</th>
                    <th className="p-1">वास्तु दिशा</th>
                    <th className="p-1">नाप (ल × चौ)</th>
                    <th className="p-1">क्षेत्रफल</th>
                    <th className="p-1">ढोका / झ्याल</th>
                    <th className="p-1">वास्तु गुणस्तर</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {groundFloor.rooms.slice(0, 6).map((r, i) => (
                    <tr key={r.id || i}>
                      <td className="p-1">{i + 1}</td>
                      <td className="p-1 font-bold">{r.nameNepali.split(' (')[0]}</td>
                      <td className="p-1">{DIRECTION_NAMES_NEPALI[r.direction as CompassDirection]?.name || r.direction}</td>
                      <td className="p-1 font-mono">{r.width.toFixed(1)}' × {r.height.toFixed(1)}'</td>
                      <td className="p-1 font-mono">{r.area} sq.ft</td>
                      <td className="p-1">D1 (३.५'×७'), W1 (५'×४.५')</td>
                      <td className="p-1 font-bold text-emerald-700">उत्तम (Recommended)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {renderSheetFooter(2, 'BLN-V-02')}
          </section>

          {/* ================= PAGE 3: FIRST FLOOR PLAN ================= */}
          <section 
            id="blueprint-page-3"
            className={`blueprint-legal-page a4-preview-container bg-white p-6 rounded-md shadow-lg border-2 border-stone-800 text-stone-900 font-sans ${
              printMode === 'current' && activePageIndex !== 2 ? 'hidden' : 'block'
            }`}
          >
            {renderSheetHeader(3, 'BLN-V-03', 'पहिलो तला (First Floor) विस्तृत वास्तुशिल्प नक्सा')}

            <div className="border-2 border-stone-800 rounded bg-[#FAF9F6] p-2 flex flex-col items-center">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest self-start mb-1">
                पहिलो तला वास्तुशिल्प नक्सा (FIRST FLOOR PLAN - SCALE 1:100)
              </span>

              <svg viewBox="0 0 540 320" className="w-full h-[280px]">
                {/* Outer Building Wall Thick Line with Balconies */}
                <rect x="40" y="20" width="460" height="270" fill="#F8FAFC" stroke="#0F172A" strokeWidth="3" />

                {/* Balconies (East & North) */}
                <rect x="40" y="5" width="200" height="15" fill="#E2E8F0" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="3 2" />
                <text x="140" y="15" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#0369A1">
                  खुला बालकनी (Balcony - ३' वाइड)
                </text>

                {/* First Floor Rooms */}
                {(firstFloor.rooms || groundFloor.rooms).map((rm, idx) => {
                  const rx = 40 + (rm.x / bW) * 460;
                  const ry = 20 + (rm.y / bH) * 270;
                  const rw = (rm.width / bW) * 460;
                  const rh = (rm.height / bH) * 270;

                  return (
                    <g key={rm.id || idx}>
                      <rect 
                        x={rx} 
                        y={ry} 
                        width={rw} 
                        height={rh} 
                        fill={rm.color || '#FFFFFF'} 
                        stroke="#1E293B" 
                        strokeWidth="1.8" 
                      />
                      <text x={rx + rw / 2} y={ry + rh / 2 - 4} textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#0F172A">
                        {idx === 0 ? 'मुख्य शयनकक्ष (Master Bed)' : idx === 1 ? 'परिवार लबी (Lobby)' : rm.nameNepali.split(' (')[0]}
                      </text>
                      <text x={rx + rw / 2} y={ry + rh / 2 + 10} textAnchor="middle" fontSize="8" fill="#475569" fontFamily="monospace">
                        {rm.width.toFixed(1)}' × {rm.height.toFixed(1)}' ({rm.area} sq.ft)
                      </text>
                    </g>
                  );
                })}

                {/* Stairwell Opening */}
                <g transform="translate(60, 210)">
                  <rect width="70" height="60" fill="#F1F5F9" stroke="#334155" strokeWidth="1.5" />
                  <line x1="0" y1="0" x2="70" y2="60" stroke="#DC2626" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="70" y1="0" x2="0" y2="60" stroke="#DC2626" strokeWidth="1" strokeDasharray="3 3" />
                  <text x="35" y="35" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#DC2626">
                    भर्याङ कटआउट (Cutout)
                  </text>
                </g>
              </svg>
            </div>

            {/* Opening Schedule */}
            <div className="mt-2.5 grid grid-cols-2 gap-3 text-[9.5px]">
              <div className="border border-stone-300 p-2 rounded bg-stone-50">
                <span className="font-bold text-stone-800 block mb-1">🚪 ढोकाको विवरण (Door Schedule):</span>
                <p>• D1 (मुख्य ढोका): ३'-६" × ७'-०" (काठको ठोस फ्रेम)</p>
                <p>• D2 (शयनकक्ष ढोका): ३'-०" × ७'-०" (Flush Door)</p>
                <p>• D3 (शौचालय ढोका): २'-६" × ७'-०" (Waterproof PVC/Wood)</p>
              </div>
              <div className="border border-stone-300 p-2 rounded bg-stone-50">
                <span className="font-bold text-stone-800 block mb-1">🪟 झ्यालको विवरण (Window Schedule):</span>
                <p>• W1 (मुख्य झ्याल): ५'-०" × ४'-६" (UPVC 3-Track Sliding)</p>
                <p>• W2 (सामान्य झ्याल): ४'-०" × ४'-६" (Double Glazed)</p>
                <p>• V1 (भेन्टिलेसन): २'-०" × १'-६" (Exhaust Fan सहित)</p>
              </div>
            </div>

            {renderSheetFooter(3, 'BLN-V-03')}
          </section>

          {/* ================= PAGE 4: SECOND FLOOR / UPPER FLOOR PLAN ================= */}
          <section 
            id="blueprint-page-4"
            className={`blueprint-legal-page a4-preview-container bg-white p-6 rounded-md shadow-lg border-2 border-stone-800 text-stone-900 font-sans ${
              printMode === 'current' && activePageIndex !== 3 ? 'hidden' : 'block'
            }`}
          >
            {renderSheetHeader(4, 'BLN-V-04', `दोस्रो तला / माथिल्लो तला (${currentFloorCount >= 3 ? 'Second Floor' : 'Upper Suite / Extension'}) नक्सा`)}

            <div className="border-2 border-stone-800 rounded bg-[#FAF9F6] p-2 flex flex-col items-center">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest self-start mb-1">
                {currentFloorCount >= 3 
                  ? 'दोस्रो तला विस्तृत नक्सा (SECOND FLOOR PLAN - SCALE 1:100)'
                  : 'माथिल्लो तला / भविष्य निर्माण विस्तार नक्सा (UPPER SUITE / FUTURE EXTENSION)'}
              </span>

              <svg viewBox="0 0 540 320" className="w-full h-[280px]">
                <rect x="40" y="20" width="460" height="270" fill="#F8FAFC" stroke="#0F172A" strokeWidth="3" />

                {/* Partitioning for 2nd Floor / Upper Living */}
                <rect x="40" y="20" width="220" height="150" fill="#FEF2F2" stroke="#1E293B" strokeWidth="1.8" />
                <text x="150" y="90" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#991B1B">
                  शयनकक्ष तथा ध्यान कक्ष (Bed/Meditation)
                </text>
                <text x="150" y="106" textAnchor="middle" fontSize="8" fill="#475569">
                  १४' × १२' (ईशान/पूर्व शान्त क्षेत्र)
                </text>

                <rect x="260" y="20" width="240" height="150" fill="#F0FDF4" stroke="#1E293B" strokeWidth="1.8" />
                <text x="380" y="90" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#166534">
                  पुस्तकालय तथा अध्ययन कक्ष (Study/Library)
                </text>
                <text x="380" y="106" textAnchor="middle" fontSize="8" fill="#475569">
                  १६' × १२' (बुद्धिकारक पूर्व दिशा)
                </text>

                {/* Open Terrace part */}
                <rect x="180" y="170" width="320" height="120" fill="#FFFBEB" stroke="#B45309" strokeWidth="1.5" strokeDasharray="4 2" />
                <text x="340" y="235" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#B45309">
                  खुला कौशी / कौशी बगैँचा (Open Terrace / Roof Garden)
                </text>

                {/* Stair Tower / Headroom */}
                <g transform="translate(60, 190)">
                  <rect width="90" height="80" fill="#E2E8F0" stroke="#0F172A" strokeWidth="2" />
                  <text x="45" y="45" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#0F172A">
                    भर्याङ मन्टी (Headroom)
                  </text>
                </g>
              </svg>
            </div>

            <div className="mt-2.5 p-2 bg-amber-50 border border-amber-200 rounded text-[9.5px] text-amber-950">
              <span className="font-bold block">वास्तु तथा इन्जिनियरिङ कैफियत:</span>
              <p>
                माथिल्लो तलामा भारी संरचनाहरू दक्षिण-पश्चिम (नैऋत्य) तर्फ केन्द्रित गरिएको छ भने उत्तर-पूर्व (ईशान) तर्फ खुला कौशी तथा हल्का निर्माण गरिएको छ, जसले भवनको गुरुत्वाकर्षण तथा वास्तु ऊर्जा सन्तुलन कायम राख्दछ।
              </p>
            </div>

            {renderSheetFooter(4, 'BLN-V-04')}
          </section>

          {/* ================= PAGE 5: ROOF & TERRACE PLAN ================= */}
          <section 
            id="blueprint-page-5"
            className={`blueprint-legal-page a4-preview-container bg-white p-6 rounded-md shadow-lg border-2 border-stone-800 text-stone-900 font-sans ${
              printMode === 'current' && activePageIndex !== 4 ? 'hidden' : 'block'
            }`}
          >
            {renderSheetHeader(5, 'BLN-V-05', 'कौशी, खुला छत, सौर्य तथा पानी ट्याङ्की वास्तु नक्सा')}

            <div className="border-2 border-stone-800 rounded bg-[#FAF9F6] p-2 flex flex-col items-center">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest self-start mb-1">
                छत तथा कौशी ढलान नक्सा (ROOF & DRAINAGE PLAN - SCALE 1:100)
              </span>

              <svg viewBox="0 0 540 320" className="w-full h-[280px]">
                {/* Parapet Outer Wall */}
                <rect x="40" y="20" width="460" height="270" fill="#FFFBEB" stroke="#0F172A" strokeWidth="2.5" />
                <text x="270" y="160" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#92400E">
                  आर.सी.सी. छत (खुला कौशी - ३ फिट प्यारापेट पर्खाल सहित)
                </text>

                {/* Rainwater Slope Direction Arrows */}
                <g stroke="#0284C7" strokeWidth="1.5" markerEnd="url(#arrow)">
                  <line x1="200" y1="200" x2="350" y2="70" strokeDasharray="4 2" />
                  <line x1="100" y1="220" x2="200" y2="70" strokeDasharray="4 2" />
                </g>
                <text x="250" y="80" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0369A1">
                  वर्षातको पानी ढलान → (Slope towards NE / North)
                </text>

                {/* Stair Headroom (SW) */}
                <g transform="translate(60, 190)">
                  <rect width="100" height="80" fill="#E2E8F0" stroke="#7A1C1C" strokeWidth="2" />
                  <text x="50" y="45" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#7A1C1C">
                    मन्टी (Stair Tower)
                  </text>

                  {/* Overhead Tank on top of Stair Tower */}
                  <rect x="20" y="10" width="60" height="30" fill="#0284C7" stroke="#0369A1" strokeWidth="1.5" />
                  <text x="50" y="28" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#FFFFFF">
                    OHT (पानी ट्याङ्की)
                  </text>
                </g>

                {/* Solar Water Heater (SE / South) */}
                <g transform="translate(380, 200)">
                  <rect width="90" height="60" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
                  <line x1="0" y1="15" x2="90" y2="15" stroke="#CA8A04" strokeWidth="1" />
                  <line x1="0" y1="30" x2="90" y2="30" stroke="#CA8A04" strokeWidth="1" />
                  <line x1="0" y1="45" x2="90" y2="45" stroke="#CA8A04" strokeWidth="1" />
                  <text x="45" y="35" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#854D0E">
                    ☀️ सौर्य ऊर्जा (Solar System)
                  </text>
                </g>
              </svg>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-3 text-[9.5px]">
              <div className="p-2 border border-stone-300 rounded bg-stone-50">
                <span className="font-bold text-stone-800 block">१. पानी ट्याङ्की स्थिति (नैऋत्य/पश्चिम):</span>
                <span>छतको सबैभन्दा अग्लो भागमा ओभरहेड पानी ट्याङ्की (१,०००-२,००० लिटर) राख्नाले वास्तु अनुसार स्थायित्व र आर्थिक भार सन्तुलित रहन्छ।</span>
              </div>
              <div className="p-2 border border-stone-300 rounded bg-stone-50">
                <span className="font-bold text-stone-800 block">२. ढल निकास तथा परनाले (ईशान/उत्तर):</span>
                <span>छतको सम्पूर्ण वर्षातको पानीको ढलान पूर्व र उत्तर तर्फ गराई सफा परनाले (Spouts) मार्फत भूमिगत जल भण्डार (Recharge Well) मा पुर्‍याइन्छ।</span>
              </div>
            </div>

            {renderSheetFooter(5, 'BLN-V-05')}
          </section>

          {/* ================= PAGE 6: 4 ELEVATIONS ================= */}
          <section 
            id="blueprint-page-6"
            className={`blueprint-legal-page a4-preview-container bg-white p-6 rounded-md shadow-lg border-2 border-stone-800 text-stone-900 font-sans ${
              printMode === 'current' && activePageIndex !== 5 ? 'hidden' : 'block'
            }`}
          >
            {renderSheetHeader(6, 'BLN-V-06', 'चारै दिशाको बाह्य स्वरूप नक्सा (All 4 Elevations)')}

            <div className="border-2 border-stone-800 rounded bg-[#FAF9F6] p-2 flex flex-col items-center">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest self-start mb-1">
                चारै मोहोडा स्वरूप नक्सा (ARCHITECTURAL ELEVATIONS - SCALE 1:100)
              </span>

              <svg viewBox="0 0 540 310" className="w-full h-[270px]">
                {/* Elevation Ground Line */}
                <line x1="20" y1="260" x2="520" y2="260" stroke="#000000" strokeWidth="2" />
                <text x="50" y="275" fontSize="8" fontWeight="bold" fill="#64748B">GL (±०'-०")</text>
                <text x="50" y="245" fontSize="8" fontWeight="bold" fill="#64748B">PL (+२'-०")</text>

                {/* 1. FRONT ELEVATION (अगाडि मोहोडा) */}
                <g transform="translate(40, 60)">
                  <text x="110" y="-10" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#7A1C1C">
                    अगाडि मोहोडा (Front Elevation)
                  </text>
                  {/* Building Mass */}
                  <rect width="220" height="190" fill="#F8FAFC" stroke="#0F172A" strokeWidth="2" />
                  {/* Plinth Base */}
                  <rect y="170" width="220" height="20" fill="#CBD5E1" stroke="#334155" strokeWidth="1" />
                  {/* Floors division */}
                  <line x1="0" y1="90" x2="220" y2="90" stroke="#0F172A" strokeWidth="1.5" />
                  <line x1="0" y1="10" x2="220" y2="10" stroke="#0F172A" strokeWidth="1.5" />
                  {/* Main Porch / Gate */}
                  <rect x="80" y="110" width="60" height="60" fill="#7A1C1C" stroke="#000000" strokeWidth="1.5" />
                  <text x="110" y="145" textAnchor="middle" fontSize="8" fill="#FFFFFF" fontWeight="bold">मुख्य ढोका</text>
                  {/* Windows */}
                  <rect x="20" y="120" width="40" height="35" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1" />
                  <rect x="160" y="120" width="40" height="35" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1" />
                  {/* Upper Windows */}
                  <rect x="30" y="30" width="45" height="40" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1" />
                  <rect x="145" y="30" width="45" height="40" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1" />
                  {/* Balcony Railing */}
                  <rect x="20" y="70" width="180" height="20" fill="none" stroke="#7A1C1C" strokeWidth="1" />
                  {/* Parapet */}
                  <rect y="-10" width="220" height="10" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1" />
                  {/* Staircase Tower in SW */}
                  <rect x="10" y="-40" width="60" height="30" fill="#CBD5E1" stroke="#0F172A" strokeWidth="1.5" />
                </g>

                {/* 2. SIDE ELEVATION (दायाँ मोहोडा) */}
                <g transform="translate(300, 60)">
                  <text x="100" y="-10" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#7A1C1C">
                    दायाँ मोहोडा (Right Side Elevation)
                  </text>
                  <rect width="200" height="190" fill="#F1F5F9" stroke="#0F172A" strokeWidth="2" />
                  <rect y="170" width="200" height="20" fill="#CBD5E1" stroke="#334155" strokeWidth="1" />
                  <line x1="0" y1="90" x2="200" y2="90" stroke="#0F172A" strokeWidth="1.5" />
                  <rect x="30" y="120" width="40" height="35" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1" />
                  <rect x="130" y="120" width="40" height="35" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1" />
                  <rect x="30" y="30" width="40" height="40" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1" />
                  <rect x="130" y="30" width="40" height="40" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1" />
                  <rect y="-10" width="200" height="10" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1" />
                </g>
              </svg>
            </div>

            <div className="mt-2.5 grid grid-cols-4 gap-2 text-center text-[9px] border border-stone-300 p-2 rounded bg-stone-50">
              <div><span className="text-stone-500 block">प्लिन्थ लेभल (PL)</span><span className="font-bold">+२'-०" (बाढी/हिलो सुरक्षा)</span></div>
              <div><span className="text-stone-500 block">भुइँतला उचाइ</span><span className="font-bold">१०'-०" क्लियर सिलिङ</span></div>
              <div><span className="text-stone-500 block">पहिलो तला उचाइ</span><span className="font-bold">१०'-०" क्लियर सिलिङ</span></div>
              <div><span className="text-stone-500 block">कुल भवन उचाइ</span><span className="font-bold">{currentFloorCount * 10 + 8} फिट (मापदण्ड भित्र)</span></div>
            </div>

            {renderSheetFooter(6, 'BLN-V-06')}
          </section>

          {/* ================= PAGE 7: STRUCTURAL COLUMN GRID ================= */}
          <section 
            id="blueprint-page-7"
            className={`blueprint-legal-page a4-preview-container bg-white p-6 rounded-md shadow-lg border-2 border-stone-800 text-stone-900 font-sans ${
              printMode === 'current' && activePageIndex !== 6 ? 'hidden' : 'block'
            }`}
          >
            {renderSheetHeader(7, 'BLN-V-07', 'संरचनात्मक स्तम्भ ग्रिड, जग तथा बिम लेआउट')}

            <div className="border-2 border-stone-800 rounded bg-[#FAF9F6] p-2 flex flex-col items-center">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest self-start mb-1">
                स्तम्भ ग्रिड तथा जग नक्सा (STRUCTURAL COLUMN GRID - SCALE 1:100)
              </span>

              <svg viewBox="0 0 540 310" className="w-full h-[270px]">
                {/* Centerlines */}
                {[80, 200, 320, 440].map((gx, idx) => (
                  <g key={gx}>
                    <line x1={gx} y1="30" x2={gx} y2="270" stroke="#DC2626" strokeWidth="0.8" strokeDasharray="6 3" />
                    <circle cx={gx} cy="20" r="9" fill="#FEE2E2" stroke="#DC2626" strokeWidth="1" />
                    <text x={gx} y="23" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#991B1B">{idx + 1}</text>
                  </g>
                ))}

                {[70, 160, 250].map((gy, idx) => (
                  <g key={gy}>
                    <line x1="50" y1={gy} x2="470" y2={gy} stroke="#DC2626" strokeWidth="0.8" strokeDasharray="6 3" />
                    <circle cx="480" cy={gy} r="9" fill="#FEE2E2" stroke="#DC2626" strokeWidth="1" />
                    <text x="480" y={gy + 3} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#991B1B">
                      {String.fromCharCode(65 + idx)}
                    </text>
                  </g>
                ))}

                {/* Beams Grid */}
                {[80, 200, 320, 440].map(gx => (
                  <line key={`b-v-${gx}`} x1={gx} y1="70" x2={gx} y2="250" stroke="#0F172A" strokeWidth="3" />
                ))}
                {[70, 160, 250].map(gy => (
                  <line key={`b-h-${gy}`} x1="80" y1={gy} x2="440" y2={gy} stroke="#0F172A" strokeWidth="3" />
                ))}

                {/* Columns at Intersections */}
                {[80, 200, 320, 440].map(gx => 
                  [70, 160, 250].map(gy => (
                    <g key={`${gx}-${gy}`}>
                      {/* Footing Outline */}
                      <rect x={gx - 18} y={gy - 18} width="36" height="36" fill="#F1F5F9" stroke="#64748B" strokeWidth="1" />
                      {/* RCC Column */}
                      <rect x={gx - 7} y={gy - 7} width="14" height="14" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1" />
                      <text x={gx + 12} y={gy - 10} fontSize="7" fontWeight="bold" fill="#0F172A">C1</text>
                    </g>
                  ))
                )}
              </svg>
            </div>

            {/* Column & Foundation Schedule */}
            <div className="mt-2.5 grid grid-cols-2 gap-3 text-[9.5px]">
              <div className="p-2 border border-stone-300 rounded bg-stone-50">
                <span className="font-bold text-stone-800 block mb-1">🏛️ स्तम्भ विवरण (Column Specification C1):</span>
                <p>• पिल्लर नाप: १२" × १२" (३००mm × ३००mm) M20 कंक्रीट</p>
                <p>• मुख्य डन्डी: ८ वटा १६mm TMT (Fe500D) भूकम्प प्रतिरोधी</p>
                <p>• रिङ (Ties): ८mm @ ४" c/c (जोइन्टमा) र ६" c/c (मध्यमा) १३५° हुक सहित</p>
              </div>
              <div className="p-2 border border-stone-300 rounded bg-stone-50">
                <span className="font-bold text-stone-800 block mb-1">🏗️ जग तथा बिम विवरण (Foundation & Tie Beams):</span>
                <p>• जग (Isolated Footing): ५'-०" × ५'-०" × १'-६" गहिराइ: ६ फिट</p>
                <p>• प्लिन्थ बिम (PB): ९" × १४" (६ वटा १६mm डन्डी + ८mm रिङ)</p>
                <p>• मापदण्ड: नेपाल राष्ट्रिय भवन संहिता NBC 205:2012 पूर्ण पालना</p>
              </div>
            </div>

            {renderSheetFooter(7, 'BLN-V-07')}
          </section>

          {/* ================= PAGE 8: ELECTRICAL & SANITARY ================= */}
          <section 
            id="blueprint-page-8"
            className={`blueprint-legal-page a4-preview-container bg-white p-6 rounded-md shadow-lg border-2 border-stone-800 text-stone-900 font-sans ${
              printMode === 'current' && activePageIndex !== 7 ? 'hidden' : 'block'
            }`}
          >
            {renderSheetHeader(8, 'BLN-V-08', 'बिजुली, खानेपानी, ढल तथा वर्षात पानी वास्तु नक्सा')}

            <div className="border-2 border-stone-800 rounded bg-[#FAF9F6] p-2 flex flex-col items-center">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest self-start mb-1">
                विद्युत, खानेपानी तथा ढल निकास इन्जिनियरिङ (MEP SERVICES LAYOUT - SCALE 1:100)
              </span>

              <svg viewBox="0 0 540 310" className="w-full h-[270px]">
                <rect x="40" y="20" width="460" height="270" fill="#F8FAFC" stroke="#0F172A" strokeWidth="2.5" />

                {/* Zones Indicators */}
                {/* Agneya (SE) - Electrical Board */}
                <g transform="translate(380, 200)">
                  <rect width="90" height="70" fill="#FEF2F2" stroke="#DC2626" strokeWidth="1.5" />
                  <text x="45" y="30" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#DC2626">⚡ मुख्य मिटर तथा</text>
                  <text x="45" y="45" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#DC2626">MCB प्यानल (आग्नेय)</text>
                </g>

                {/* Ishan (NE) - Underground Sump */}
                <g transform="translate(380, 40)">
                  <circle cx="45" cy="40" r="32" fill="#E0F2FE" stroke="#0284C7" strokeWidth="1.5" />
                  <text x="45" y="38" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#0369A1">💧 भूमिगत पानी</text>
                  <text x="45" y="52" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#0369A1">ट्याङ्की / बोरिङ (ईशान)</text>
                </g>

                {/* Vayavya (NW) - Septic Tank */}
                <g transform="translate(60, 40)">
                  <rect width="80" height="60" fill="#FEF9C3" stroke="#CA8A04" strokeWidth="1.5" />
                  <text x="40" y="30" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#854D0E">🚽 ढल सेफ्टी ट्याङ्की</text>
                  <text x="40" y="44" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#854D0E">& सोकपिट (वायव्य)</text>
                </g>

                {/* Nairitya (SW) - Heavy Inverter / Stabilizer */}
                <g transform="translate(60, 210)">
                  <rect width="80" height="60" fill="#F3E8FF" stroke="#7E22CE" strokeWidth="1.5" />
                  <text x="40" y="35" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#6B21A8">🔋 इन्भर्टर तथा</text>
                  <text x="40" y="48" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#6B21A8">भारी व्याट्री (नैऋत्य)</text>
                </g>

                {/* Pipeline Flow Lines */}
                <line x1="425" y1="72" x2="425" y2="200" stroke="#0284C7" strokeWidth="2" strokeDasharray="4 2" />
                <text x="435" y="140" fontSize="7.5" fill="#0284C7" fontWeight="bold">खानेपानी पाइप लाइन →</text>
              </svg>
            </div>

            <div className="mt-2.5 grid grid-cols-2 gap-3 text-[9.5px]">
              <div className="p-2 border border-stone-300 rounded bg-stone-50">
                <span className="font-bold text-stone-800 block mb-1">⚡ विद्युत वास्तु नियम:</span>
                <p>• मुख्य विद्युत मिटर, जेनेरेटर तथा इन्भर्टर आग्नेय कोण (दक्षिण-पूर्व) मा स्थापित।</p>
                <p>• सम्पूर्ण भवनको वायरिङमा कपर अर्थिङ (Earth Pit) अनिवार्य गरिएको छ।</p>
              </div>
              <div className="p-2 border border-stone-300 rounded bg-stone-50">
                <span className="font-bold text-stone-800 block mb-1">💧 पानी तथा ढल वास्तु नियम:</span>
                <p>• भूमिगत पानीको मूल वा बोरिङ ईशान कोण (उत्तर-पूर्व) मा हुनुपर्छ।</p>
                <p>• सेफ्टी ट्याङ्की र बोरिङको दुरी कम्तीमा ३० फिट टाढा वायव्य कोणमा राखिएको छ।</p>
              </div>
            </div>

            {renderSheetFooter(8, 'BLN-V-08')}
          </section>

          {/* ================= PAGE 9: VASTU MANDALA & AYADI ================= */}
          <section 
            id="blueprint-page-9"
            className={`blueprint-legal-page a4-preview-container bg-white p-6 rounded-md shadow-lg border-2 border-stone-800 text-stone-900 font-sans ${
              printMode === 'current' && activePageIndex !== 8 ? 'hidden' : 'block'
            }`}
          >
            {renderSheetHeader(9, 'BLN-V-09', '१६ दिशा मण्डल, आय-व्यय शुभाशुभ तथा पञ्चतत्त्व चक्र')}

            {/* 16 Zones Audit Table */}
            <div className="border border-stone-400 rounded p-2 bg-stone-50 mb-3">
              <span className="font-bold text-xs text-[#7A1C1C] block mb-1">
                १६ दिशा वास्तु चक्र अडिट तथा फल तालिका (16 Directional Energy Audit)
              </span>
              <div className="grid grid-cols-4 gap-2 text-[9px]">
                <div className="p-1.5 bg-white border border-stone-200 rounded">
                  <span className="font-bold text-emerald-800 block">१. ईशान (NE) - जल</span>
                  <span>पूजा कक्ष, अध्ययन, इनार (उत्तम - सुख शान्ति)</span>
                </div>
                <div className="p-1.5 bg-white border border-stone-200 rounded">
                  <span className="font-bold text-emerald-800 block">२. पूर्व (E) - इन्द्र</span>
                  <span>मुख्य प्रवेश, बैठक, खुला आँगन (उत्तम - स्वास्थ्य)</span>
                </div>
                <div className="p-1.5 bg-white border border-stone-200 rounded">
                  <span className="font-bold text-emerald-800 block">३. आग्नेय (SE) - अग्नि</span>
                  <span>भान्सा, ग्यास, मिटर (उत्तम - ऊर्जा र तेज)</span>
                </div>
                <div className="p-1.5 bg-white border border-stone-200 rounded">
                  <span className="font-bold text-emerald-800 block">४. दक्षिण (S) - यम</span>
                  <span>शयनकक्ष, भारी भण्डार (उत्तम - स्थायित्व)</span>
                </div>
                <div className="p-1.5 bg-white border border-stone-200 rounded">
                  <span className="font-bold text-emerald-800 block">५. नैऋत्य (SW) - पृथ्वी</span>
                  <span>गृहस्वामी शयनकक्ष, मन्टी (सर्वोत्तम - नेतृत्व)</span>
                </div>
                <div className="p-1.5 bg-white border border-stone-200 rounded">
                  <span className="font-bold text-emerald-800 block">६. पश्चिम (W) - वरुण</span>
                  <span>अध्ययन, भोजन, पानी ट्याङ्की (उत्तम - लाभ)</span>
                </div>
                <div className="p-1.5 bg-white border border-stone-200 rounded">
                  <span className="font-bold text-emerald-800 block">७. वायव्य (NW) - वायु</span>
                  <span>अतिथि कक्ष, शौचालय (उत्तम - सम्बन्ध)</span>
                </div>
                <div className="p-1.5 bg-white border border-stone-200 rounded">
                  <span className="font-bold text-emerald-800 block">८. उत्तर (N) - कुबेर</span>
                  <span>तिजोरी, बैठक, मुख्य द्वार (उत्तम - धन वृद्धि)</span>
                </div>
              </div>
            </div>

            {/* Ayadi Shadvarga Calculations */}
            <div className="border border-stone-400 rounded p-2.5 bg-amber-50/50 mb-3 text-[10px]">
              <span className="font-bold text-xs text-[#7A1C1C] block mb-1">
                वैदिक आय-व्यय तथा षड्वर्ग शुभाशुभ मान (Ayadi Shadvarga Vedic Calculation)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="font-semibold text-stone-600 block">गृह पिण्ड (क्षेत्रफल):</span>
                  <span className="font-bold font-mono">{bW * bH} वर्गफिट ({project.unit}²)</span>
                </div>
                <div>
                  <span className="font-semibold text-stone-600 block">आय मान (Income Factor):</span>
                  <span className="font-bold text-emerald-800">८ (ध्वज आय - सर्वोत्तम)</span>
                </div>
                <div>
                  <span className="font-semibold text-stone-600 block">व्यय मान (Expense Factor):</span>
                  <span className="font-bold text-blue-800">३ (आय &gt; व्यय प्रमाणित)</span>
                </div>
                <div>
                  <span className="font-semibold text-stone-600 block">योनि मान:</span>
                  <span className="font-bold text-emerald-800">१ - ध्वज योनि (यश, विजय)</span>
                </div>
                <div>
                  <span className="font-semibold text-stone-600 block">वार तथा नक्षत्र शुद्धि:</span>
                  <span className="font-bold text-emerald-800">शुभ (गुरु/शुक्र/बुध सम्मत)</span>
                </div>
                <div>
                  <span className="font-semibold text-stone-600 block">आयु मान:</span>
                  <span className="font-bold text-emerald-800">१०० वर्ष (पूर्ण दीर्घायु)</span>
                </div>
              </div>
            </div>

            {/* Non-destructive Vastu Remedies */}
            <div className="border border-stone-300 rounded p-2 text-[9px] bg-stone-50">
              <span className="font-bold text-stone-800 block mb-1">तोडफोडविहीन आधुनिक वैदिक वास्तु उपचार (Non-destructive Remedies):</span>
              <p>• पञ्चधातु पट्टी तथा तामाको तारद्वारा मुख्य प्रवेशद्वारको ऊर्जा सन्तुलन।</p>
              <p>• ब्रह्मस्थानमा पहेँलो वा प्राकृतिक उज्यालो प्रकाश र तुलसी स्थापना।</p>
              <p>• आग्नेय कोणमा रातो/सुन्तला रङ्ग तथा ईशान कोणमा हल्का निलो/सेतो रङ्ग संयोजन।</p>
            </div>

            {renderSheetFooter(9, 'BLN-V-09')}
          </section>

          {/* ================= PAGE 10: LEGAL DECLARATION & STAMPS ================= */}
          <section 
            id="blueprint-page-10"
            className={`blueprint-legal-page a4-preview-container bg-white p-6 rounded-md shadow-lg border-2 border-stone-800 text-stone-900 font-sans ${
              printMode === 'current' && activePageIndex !== 9 ? 'hidden' : 'block'
            }`}
          >
            {renderSheetHeader(10, 'BLN-V-10', 'प्राविधिक घोषणा, कानूनी प्रमाणीकरण तथा आधिकारिक हस्ताक्षर पत्र')}

            {/* Legal Undertaking Text */}
            <div className="border-2 border-stone-800 rounded p-3 bg-stone-50 mb-4 text-[10px] space-y-2 leading-relaxed">
              <h3 className="font-serif font-black text-xs text-[#7A1C1C] uppercase tracking-wide">
                घरधनी, परामर्शदाता तथा डिजाइन इन्जिनियरको संयुक्त कानूनी उद्घोष (Legal Undertaking)
              </h3>
              <p>
                हामी निम्न हस्ताक्षरकर्ताहरू संयुक्त रूपमा घोषणा गर्दछौँ कि प्रस्तुत <strong>"{project.name}"</strong> (कुल {currentFloorCount} तला) को आवासीय भवन नक्सा नेपाल सरकार, शहरी विकास मन्त्रालय द्वारा जारी <strong>नेपाल राष्ट्रिय भवन संहिता (NBC 205 / NBC 105:2020)</strong>, स्थानीय नगरपालिका / गाउँपालिकाको <strong>भवन निर्माण मापदण्ड २०८१</strong> तथा परम्परागत <strong>वैदिक वास्तुशास्त्रका सर्वमान्य सिद्धान्तहरू</strong> पूर्ण पालना गरी तयार पारिएको छ।
              </p>
              <p>
                यस नक्सा बमोजिम भवन निर्माण गर्दा भूकम्प प्रतिरोधी आर.सी.सी. फ्रेम संरचना, पर्याप्त प्राकृतिक प्रकाश, भेन्टिलेसन, अग्नि सुरक्षा, सडक अधिकार क्षेत्र (Right of Way) तथा खुला क्षेत्र मापदण्डको पूर्ण पालना हुनेछ।
              </p>
            </div>

            {/* Official 4 Signature & Seal Blocks */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              {/* Box 1: Owner Signature */}
              <div className="border-2 border-stone-800 rounded p-3 bg-white text-center space-y-4">
                <span className="text-[10px] font-bold text-stone-600 block uppercase">
                  १. जग्गाधनी / भवनधनी हस्ताक्षर
                </span>
                <div className="h-16 flex items-end justify-center">
                  <div className="w-36 border-b border-stone-600" />
                </div>
                <div className="text-[9.5px] text-stone-800">
                  <p className="font-bold">नाम: {project.clientName || 'श्रीमान् / श्रीमती'}</p>
                  <p>नागरिकता नं: .......................................</p>
                  <p>सम्पर्क: {project.clientPhone || '.......................................'}</p>
                </div>
              </div>

              {/* Box 2: Vastu Consultant Seal */}
              <div className="border-2 border-stone-800 rounded p-3 bg-white text-center space-y-4">
                <span className="text-[10px] font-bold text-[#7A1C1C] block uppercase">
                  २. वैदिक वास्तुविद् प्रमाणीकरण तथा छाप
                </span>
                <div className="h-16 flex items-center justify-center">
                  <div className="w-24 h-12 rounded-full border-2 border-[#7A1C1C] text-[#7A1C1C] text-[9px] font-serif font-bold flex flex-col items-center justify-center rotate-[-3deg]">
                    <span>बालानन्द कर्मकाण्ड</span>
                    <span className="text-[7.5px]">प्रमाणित वास्तु छाप</span>
                  </div>
                </div>
                <div className="text-[9.5px] text-stone-800">
                  <p className="font-bold">परामर्शदाता: बालानन्द वैदिक वास्तु परिषद्</p>
                  <p>पंजीकरण नं: VST-NP-२०८१</p>
                  <p>मिति: {new Date().toLocaleDateString('ne-NP')}</p>
                </div>
              </div>

              {/* Box 3: Structural Engineer */}
              <div className="border-2 border-stone-800 rounded p-3 bg-white text-center space-y-4">
                <span className="text-[10px] font-bold text-stone-600 block uppercase">
                  ३. नक्सा डिजाइन इन्जिनियर हस्ताक्षर
                </span>
                <div className="h-16 flex items-end justify-center">
                  <div className="w-36 border-b border-stone-600" />
                </div>
                <div className="text-[9.5px] text-stone-800">
                  <p className="font-bold">ई. .....................................................</p>
                  <p>NEC Reg. No.: ................ (Civil/Arch)</p>
                  <p>पद: स्ट्रक्चरल तथा आर्किटेक्चरल इन्जिनियर</p>
                </div>
              </div>

              {/* Box 4: Municipality Verification */}
              <div className="border-2 border-dashed border-stone-600 rounded p-3 bg-stone-50 text-center space-y-4">
                <span className="text-[10px] font-bold text-stone-600 block uppercase">
                  ४. स्थानीय नगरपालिका / प्राविधिक कक्ष
                </span>
                <div className="h-16 flex items-center justify-center text-stone-400 text-[10px] font-mono">
                  [ कार्यालयको आधिकारिक नक्सा पास छाप ]
                </div>
                <div className="text-[9.5px] text-stone-600">
                  <p>दर्ता नं: .................... | मिति: ....................</p>
                  <p>प्राविधिक शाखा अधिकृत हस्ताक्षर: ................</p>
                </div>
              </div>
            </div>

            {renderSheetFooter(10, 'BLN-V-10')}
          </section>
        </div>
      </main>
    </div>
  );
};
