import React, { useState } from 'react';
import {
  Download,
  Printer,
  X,
  FileText,
  Sparkles,
  Sun,
  Moon,
  Compass,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Calendar,
  User,
  ShieldCheck,
  Award
} from 'lucide-react';
import {
  BirthDetails,
  LagnaInfo,
  PanchangaData,
  PlanetPosition,
  VimshottariDashaResult
} from '../types/astrology';
import type { DailyHoroscopeData } from './DailyHoroscopeView';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { exportDailyHoroscopePDF, printElement } from '../utils/pdfGenerator';
import { ReportActionToolbar } from './common/ReportActionToolbar';
import { RASHI_DATA } from '../utils/astroCalculations';

interface DailyHoroscopePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: BirthDetails | null;
  lagna: LagnaInfo;
  natalPlanets: PlanetPosition[];
  transitPlanets: PlanetPosition[];
  todayPanchanga: PanchangaData;
  dasha: VimshottariDashaResult;
  horoscopeData: DailyHoroscopeData | null;
  gregorianDateInfo: {
    formattedDate: string;
    weekday: string;
    fullString: string;
  };
}

export const DailyHoroscopePdfModal: React.FC<DailyHoroscopePdfModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  lagna,
  natalPlanets,
  transitPlanets,
  todayPanchanga,
  dasha,
  horoscopeData,
  gregorianDateInfo
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  if (!isOpen || !horoscopeData) return null;

  const activeMoon = natalPlanets.find((p) => p.name === 'चन्द्र') || { rashiName: 'मेष' };
  const activeMoonRashi = activeMoon.rashiName || 'मेष';

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    setDownloadSuccess(false);
    try {
      const sanitizedName = (activeProfile?.name || 'Jatak').replace(/\s+/g, '_');
      const sanitizedDate = (todayPanchanga.dateBS || 'Today').replace(/[\s/]+/g, '_');
      const filename = `दैनिक_राशिफल_${sanitizedName}_${sanitizedDate}.pdf`;
      
      const success = await exportDailyHoroscopePDF('printable-daily-horoscope-report', filename);
      if (success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3500);
      }
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    printElement('printable-daily-horoscope-report');
  };

  // Helper to format Rahu Kaal
  const rahuKaalStr = typeof todayPanchanga.rahuKaal === 'object'
    ? `${todayPanchanga.rahuKaal.start} - ${todayPanchanga.rahuKaal.end}`
    : (todayPanchanga.rahuKaal || 'अपराह्न');

  // Compute 9 main planetary transit positions
  const mainPlanetsList = [
    { name: 'सूर्य', en: 'Sun', lord: 'सिंह' },
    { name: 'चन्द्र', en: 'Moon', lord: 'कर्कट' },
    { name: 'मङ्गल', en: 'Mars', lord: 'मेष, वृश्चिक' },
    { name: 'बुध', en: 'Mercury', lord: 'मिथुन, कन्या' },
    { name: 'गुरु', en: 'Jupiter', lord: 'धनु, मीन' },
    { name: 'शुक्र', en: 'Venus', lord: 'वृष, तुला' },
    { name: 'शनि', en: 'Saturn', lord: 'मकर, कुम्भ' },
    { name: 'राहु', en: 'Rahu', lord: 'छाया' },
    { name: 'केतु', en: 'Ketu', lord: 'छाया' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-stone-900 border-2 border-amber-600 rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* MODAL TOOLBAR */}
        <div className="bg-gradient-to-r from-red-950 via-amber-950 to-stone-900 text-amber-50 px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-amber-600/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold font-serif text-white flex items-center gap-2">
                <span>दैनिक राशिफल तथा ग्रह गोचर प्रतिवेदन (PDF Export)</span>
              </h3>
              <p className="text-[11px] text-amber-200/80 font-serif">
                जातक: <strong>{activeProfile?.name || 'जातक'}</strong> | मिति: वि.सं. {todayPanchanga.dateBS} (ई.सं. {gregorianDateInfo.formattedDate})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center bg-black/40 border border-amber-500/30 rounded-xl px-2 py-1 gap-1 text-xs text-amber-200">
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 15, 60))}
                className="p-1 hover:text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] px-1">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 15, 120))}
                className="p-1 hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Unified Report Actions: Print, Export PDF, WhatsApp Share */}
            <ReportActionToolbar
              elementId="printable-daily-horoscope-report"
              reportTitle="दैनिक_राशिफल_तथा_ग्रह_गोचर"
              clientName={activeProfile?.name || 'जातक'}
              clientPhone={activeProfile?.phone}
              dateBS={todayPanchanga.dateBS}
              onCustomExportPDF={handleDownloadPDF}
              variant="dark_header"
              customSummaryText={`• चन्द्र राशि: ${activeMoonRashi} | नक्षत्र: ${todayPanchanga.nakshatra.name}\n• पञ्चाङ्ग: तिथि ${todayPanchanga.tithi.name}, योग ${todayPanchanga.yoga.name}\n• राहुकाल: ${rahuKaalStr}`}
            />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOAST SUCCESS BANNER */}
        {downloadSuccess && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 font-bold flex items-center justify-center gap-2 animate-in slide-in-from-top">
            <CheckCircle2 className="w-4 h-4" />
            <span>दैनिक राशिफल PDF प्रतिवेदन सफलतापूर्वक डाउनलोड भयो!</span>
          </div>
        )}

        {/* DOCUMENT PREVIEW CONTAINER */}
        <div className="flex-1 overflow-y-auto bg-stone-200 dark:bg-stone-950 p-3 sm:p-6 flex justify-center">
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease-out'
            }}
            className="w-full max-w-[210mm] space-y-6"
          >
            
            {/* ======================================================== */}
            {/* PRINTABLE PDF CONTAINER (Rendered to PDF / Printable)   */}
            {/* ======================================================== */}
            <div
              id="printable-daily-horoscope-report"
              className="bg-[#FFFDF7] text-[#1c1917] font-serif shadow-xl rounded-none p-0 overflow-hidden"
              style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}
            >
              
              {/* PAGE 1 */}
              <div className="p-8 space-y-5 relative" style={{ minHeight: '297mm', boxSizing: 'border-box', border: '3px double #B45309' }}>
                
                {/* 1. VEDIC MANGALCHARAN & HEADER */}
                <div className="text-center space-y-1 border-b-2 border-[#D97706]/40 pb-4">
                  <div className="text-xs font-bold text-[#B45309] tracking-widest uppercase">
                    ॥ श्री गणेशाय नमः ॥ ॐ सूर्याय नमः ॥
                  </div>
                  <h1 className="text-xl font-extrabold text-[#781d1d] tracking-tight">
                    बालानन्द वैदिक ज्योतिष, वास्तु तथा कर्मकाण्ड केन्द्र
                  </h1>
                  <p className="text-xs text-[#9a3412] font-sans font-medium">
                    (Vedic Astrology Research & Daily Planetary Transit Analysis)
                  </p>
                  
                  <div className="inline-block bg-[#FEF3C7] border border-[#F59E0B] px-5 py-1 rounded-full text-xs font-bold text-[#78350F] mt-1 shadow-xs">
                    🌟 व्यक्तिगत दैनिक राशिफल तथा प्रत्यक्ष ग्रह गोचर प्रतिवेदन 🌟
                  </div>
                </div>

                {/* 2. JATAK PROFILE & PANCHANGA DUAL GRID */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  
                  {/* Jatak Details Box */}
                  <div className="border border-[#D97706]/50 bg-[#FFFCF2] rounded-xl p-3 space-y-1.5">
                    <div className="text-[11px] font-bold text-[#781d1d] uppercase border-b border-[#D97706]/30 pb-1 flex items-center justify-between">
                      <span>👤 जातक कुण्डली विवरण</span>
                      <span className="text-[10px] text-[#9a3412] font-normal font-sans">Personal Details</span>
                    </div>
                    <div className="space-y-1 text-[11.5px]">
                      <div><strong>नाम:</strong> <span className="font-bold text-[#781d1d]">{activeProfile?.name || 'जातक'}</span> ({activeProfile?.gender === 'female' ? 'स्त्री' : 'पुरुष'})</div>
                      <div><strong>जन्म मिति:</strong> {activeProfile?.dateBS ? `वि.सं. ${activeProfile.dateBS}` : (activeProfile?.dateAD || 'उपलब्ध छैन')} | <strong>समय:</strong> {activeProfile?.time || '--'}</div>
                      <div><strong>जन्म स्थान:</strong> {activeProfile?.location?.name || activeProfile?.location?.district || 'काठमाडौं, नेपाल'}</div>
                      <div><strong>चन्द्र राशि:</strong> <span className="font-bold text-[#9a3412]">{activeMoonRashi}</span> | <strong>जन्म लग्न:</strong> <span className="font-bold">{lagna?.rashiName || 'मेष'}</span></div>
                      <div><strong>जन्म नक्षत्र:</strong> {natalPlanets.find(p => p.name === 'चन्द्र')?.nakshatraName || 'अश्विनी'} | <strong>चालू दशा:</strong> {dasha.currentMahadasha?.planet || 'गुरु'} ({dasha.currentAntardasha?.planet || 'शनि'})</div>
                    </div>
                  </div>

                  {/* Daily Panchanga & Dual Calendar Box */}
                  <div className="border border-[#D97706]/50 bg-[#FFFCF2] rounded-xl p-3 space-y-1.5">
                    <div className="text-[11px] font-bold text-[#781d1d] uppercase border-b border-[#D97706]/30 pb-1 flex items-center justify-between">
                      <span>📅 आजको पञ्चाङ्ग तथा क्यालेन्डर</span>
                      <span className="text-[10px] text-[#9a3412] font-normal font-sans">Today's Calendar</span>
                    </div>
                    <div className="space-y-1 text-[11.5px]">
                      <div><strong>नेपाली मिति:</strong> वि.सं. <span className="font-bold text-[#781d1d]">{todayPanchanga.dateBS}</span> ({todayPanchanga.dayNameNepali})</div>
                      <div><strong>अङ्ग्रेजी मिति:</strong> ई.सं. <span className="font-bold font-sans">{gregorianDateInfo.formattedDate}</span> ({gregorianDateInfo.weekday})</div>
                      <div><strong>तिथि:</strong> {todayPanchanga.tithi.name} ({todayPanchanga.tithi.paksha} पक्ष) | <strong>नक्षत्र:</strong> {todayPanchanga.nakshatra.name}</div>
                      <div><strong>योग:</strong> {todayPanchanga.yoga.name} | <strong>करण:</strong> {todayPanchanga.karana.name}</div>
                      <div><strong>राहुकाल (त्याज्य):</strong> <span className="text-[#991b1b] font-bold">{rahuKaalStr}</span> | <strong>सूर्य:</strong> {todayPanchanga.sunrise || '०५:३५'} / {todayPanchanga.sunset || '१८:४५'}</div>
                    </div>
                  </div>

                </div>

                {/* 3. OVERALL SCORE & DAILY SYNTHESIS */}
                <div className="border-2 border-[#D97706] bg-[#FFFBEB] rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between border-b border-[#F59E0B]/50 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-[#781d1d]">🌟 समग्र दैनिक स्थिति तथा फलादेश</span>
                      <span className="text-[10px] bg-[#FDE68A] text-[#78350F] px-2 py-0.5 rounded-full font-bold border border-[#F59E0B]">
                        {horoscopeData.isAiGenerated ? '✨ AI वैदिक फलादेश' : '📐 शास्त्रीय गोचर गणना'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-xs bg-[#781d1d] text-[#FEF3C7] px-3 py-1 rounded-lg">
                      <span>दैनिक शुभता दर:</span>
                      <span className="text-sm">{toDevanagariNumerals(horoscopeData.overallRating)}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#292524] leading-relaxed text-justify">
                    {horoscopeData.overallSummary}
                  </p>
                </div>

                {/* 4. KEY TRANSIT PLANETARY POSITIONS TABLE */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#781d1d] border-b border-[#D97706]/40 pb-1">
                    <span className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>आजका मुख्य ९ ग्रह गोचर स्थिति (Key Planetary Positions Today)</span>
                    </span>
                    <span className="text-[10px] font-normal text-[#57534E]">प्रत्यक्ष खगोलीय गणना</span>
                  </div>

                  <table className="w-full text-[11px] border-collapse border border-[#D97706]/40 bg-white">
                    <thead>
                      <tr className="bg-[#FEF3C7] text-[#78350F] font-bold border-b border-[#D97706]/40 text-center">
                        <th className="p-1.5 border-r border-[#D97706]/30 text-left pl-2">ग्रह (Planet)</th>
                        <th className="p-1.5 border-r border-[#D97706]/30">गोचर राशि</th>
                        <th className="p-1.5 border-r border-[#D97706]/30">भोगांश (Degree)</th>
                        <th className="p-1.5 border-r border-[#D97706]/30">नक्षत्र व चरण</th>
                        <th className="p-1.5 border-r border-[#D97706]/30">अवस्था / गति</th>
                        <th className="p-1.5">चन्द्र राशिबाट भाव</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mainPlanetsList.map((item, idx) => {
                        const trPlanet = transitPlanets.find((p) => p.name === item.name || p.name.includes(item.name));
                        const rashiName = trPlanet?.rashiName || (item.name === 'चन्द्र' ? (todayPanchanga.moonRashi || activeMoonRashi) : 'मेष');
                        const degree = trPlanet ? `${toDevanagariNumerals(Math.floor(trPlanet.degree || 0))}° ${toDevanagariNumerals(Math.floor(((trPlanet.degree || 0) % 1) * 60))}'` : '१२° २५\'';
                        const nakshatra = trPlanet?.nakshatraName || todayPanchanga.nakshatra.name || 'अश्विनी';
                        const isRetro = trPlanet?.isRetrograde ? 'वक्री (R)' : 'मार्गी (D)';
                        
                        // Compute house from moon
                        const moonRashiIdx = RASHI_DATA.findIndex(r => r.name === activeMoonRashi);
                        const currentRashiIdx = RASHI_DATA.findIndex(r => r.name === rashiName);
                        let houseFromMoon = 1;
                        if (moonRashiIdx !== -1 && currentRashiIdx !== -1) {
                          houseFromMoon = ((currentRashiIdx - moonRashiIdx + 12) % 12) + 1;
                        }

                        return (
                          <tr
                            key={item.name}
                            className={`border-b border-[#D97706]/20 text-center ${idx % 2 === 0 ? 'bg-[#FFFEFB]' : 'bg-[#FFFDF7]'}`}
                          >
                            <td className="p-1.5 border-r border-[#D97706]/20 text-left pl-2 font-bold text-[#781d1d]">
                              {item.name} <span className="text-[9px] text-[#78716C] font-normal">({item.en})</span>
                            </td>
                            <td className="p-1.5 border-r border-[#D97706]/20 font-bold text-[#9a3412]">{rashiName}</td>
                            <td className="p-1.5 border-r border-[#D97706]/20 font-mono text-[10px]">{degree}</td>
                            <td className="p-1.5 border-r border-[#D97706]/20">{nakshatra}</td>
                            <td className="p-1.5 border-r border-[#D97706]/20">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] ${trPlanet?.isRetrograde ? 'bg-[#FEE2E2] text-[#991B1B] font-bold' : 'bg-[#DCFCE7] text-[#166534]'}`}>
                                {isRetro}
                              </span>
                            </td>
                            <td className="p-1.5 font-bold text-[#78350F]">
                              {toDevanagariNumerals(houseFromMoon)} भाव {houseFromMoon === 1 || houseFromMoon === 5 || houseFromMoon === 9 || houseFromMoon === 10 || houseFromMoon === 11 ? '🟢' : ''}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 5. COMPARATIVE TRANSIT MATCHING BULLETS */}
                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  
                  {/* Auspicious Influences */}
                  <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-xl p-3 space-y-1.5">
                    <div className="font-bold text-[#166534] border-b border-[#BBF7D0] pb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                      <span>🟢 विशेष शुभ प्रभाव पर्ने क्षेत्रहरू</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-[#14532D]">
                      {(horoscopeData.auspiciousInfluences || [
                        'शुभ ग्रहहरूको दृष्टिले पारिवारिक समन्वय र धनार्जनमा सहयोग मिल्नेछ।',
                        'कार्यक्षेत्रमा नयाँ अवसर वा महत्वपूर्ण भेटघाटको योग छ।'
                      ]).map((item, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-[#16A34A] font-bold">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cautionary Influences */}
                  <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-xl p-3 space-y-1.5">
                    <div className="font-bold text-[#991B1B] border-b border-[#FECDD3] pb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
                      <span>🔴 विशेष सावधानी तथा मार्गनिर्देशन</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-[#881337]">
                      {(horoscopeData.inauspiciousInfluences || [
                        'राहुकालको समयमा नयाँ लगानी वा ठूला निर्णय लिनबाट बच्नुहोस्।',
                        'स्वास्थ्यमा सन्तुलित खानपान र यात्रामा सामान्य सतर्कता अपनाउनुहोला।'
                      ]).map((item, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-[#E11D48] font-bold">!</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Page 1 Footer */}
                <div className="pt-2 text-center text-[10px] text-[#78716C] border-t border-[#D97706]/30 flex items-center justify-between">
                  <span>बालानन्द वैदिक ज्योतिष सेवा • दैनिक राशिफल तथा ग्रह गोचर</span>
                  <span>पृष्ठ १ / २</span>
                </div>

              </div>

              {/* PAGE 2 */}
              <div className="p-8 space-y-5 relative" style={{ minHeight: '297mm', boxSizing: 'border-box', border: '3px double #B45309', marginTop: '20px' }}>
                
                {/* Page 2 Mini Header */}
                <div className="flex items-center justify-between border-b-2 border-[#D97706]/40 pb-2 text-xs">
                  <div className="font-bold text-[#781d1d]">
                    जातक: {activeProfile?.name || 'जातक'} | चन्द्र राशि: {activeMoonRashi}
                  </div>
                  <div className="font-bold text-[#78350F]">
                    वि.सं. {todayPanchanga.dateBS} (ई.सं. {gregorianDateInfo.formattedDate})
                  </div>
                </div>

                {/* 6. LIFE SECTORS GUIDANCE (4 COLUMNS / BLOCKS) */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-[#781d1d] border-b border-[#D97706]/30 pb-1 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>जीवनका मुख्य आयामहरूमा दैनिक ग्रह प्रभाव तथा मार्गदर्शन (Life Sector Guidance)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    
                    {/* Career & Finance */}
                    <div className="border border-[#D97706]/40 bg-[#FFFCF2] rounded-xl p-3.5 space-y-1.5">
                      <div className="font-bold text-[#9A3412] flex items-center gap-1.5 border-b border-[#D97706]/20 pb-1">
                        <span>💼 कार्यक्षेत्र, व्यापार तथा धन (Career & Finance)</span>
                      </div>
                      <p className="text-[11.5px] text-[#292524] leading-relaxed">
                        {horoscopeData.careerAndFinance || 'कार्यक्षेत्रमा अनुकूलता रहनेछ। व्यावसायिक लगानीमा योजनाबद्ध रूपमा अघि बढ्दा सफलता प्राप्त हुनेछ।'}
                      </p>
                    </div>

                    {/* Love & Family */}
                    <div className="border border-[#D97706]/40 bg-[#FFFCF2] rounded-xl p-3.5 space-y-1.5">
                      <div className="font-bold text-[#9F1239] flex items-center gap-1.5 border-b border-[#D97706]/20 pb-1">
                        <span>❤️ प्रेम, वैवाहिक जीवन तथा परिवार (Love & Family)</span>
                      </div>
                      <p className="text-[11.5px] text-[#292524] leading-relaxed">
                        {horoscopeData.loveAndFamily || 'पारिवारिक सम्बन्ध सुमधुर रहनेछ। प्रियजनहरूसँग समय बिताउने अवसर मिल्नेछ।'}
                      </p>
                    </div>

                    {/* Health & Wellness */}
                    <div className="border border-[#D97706]/40 bg-[#FFFCF2] rounded-xl p-3.5 space-y-1.5">
                      <div className="font-bold text-[#15803D] flex items-center gap-1.5 border-b border-[#D97706]/20 pb-1">
                        <span>🌿 स्वास्थ्य, ऊर्जा तथा मानसिक शान्ति (Health & Wellness)</span>
                      </div>
                      <p className="text-[11.5px] text-[#292524] leading-relaxed">
                        {horoscopeData.healthAndWellness || 'स्वास्थ्य स्थिति सामान्य रहनेछ। सन्तुलित आहार र नियमित योग-ध्यानले ऊर्जा बढाउनेछ।'}
                      </p>
                    </div>

                    {/* Lucky Factors Summary */}
                    <div className="border border-[#D97706]/40 bg-[#FEF3C7] rounded-xl p-3.5 space-y-1.5">
                      <div className="font-bold text-[#78350F] flex items-center gap-1.5 border-b border-[#F59E0B]/40 pb-1">
                        <span>🎨 दैनिक शुभ सूचक तत्वहरू (Lucky Indicators)</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
                        <div className="bg-white/80 p-1.5 rounded-lg border border-[#F59E0B]/30">
                          <span className="text-[9px] text-[#78716C] block">शुभ रंग</span>
                          <strong className="text-[#9A3412]">{horoscopeData.luckyColor || 'पहेंलो'}</strong>
                        </div>
                        <div className="bg-white/80 p-1.5 rounded-lg border border-[#F59E0B]/30">
                          <span className="text-[9px] text-[#78716C] block">शुभ अंक</span>
                          <strong className="text-[#9A3412]">{toDevanagariNumerals(horoscopeData.luckyNumber || 7)}</strong>
                        </div>
                        <div className="bg-white/80 p-1.5 rounded-lg border border-[#F59E0B]/30">
                          <span className="text-[9px] text-[#78716C] block">शुभ दिशा</span>
                          <strong className="text-[#9A3412]">{horoscopeData.luckyDirection || 'पूर्व'}</strong>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* 7. DAILY MANTRA & REMEDIES */}
                <div className="border-2 border-[#D97706] bg-[#FFFBEB] rounded-xl p-4 space-y-3">
                  <div className="text-xs font-bold text-[#781d1d] flex items-center justify-between border-b border-[#F59E0B]/40 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span>🕉️</span>
                      <span>दैनिक वैदिक जप मन्त्र तथा ग्रह शान्ति उपाय (Daily Mantra & Remedies)</span>
                    </span>
                    <span className="text-[10px] text-[#78350F] font-bold">ग्रहदोष निवारण</span>
                  </div>

                  <div className="bg-white border border-[#F59E0B]/50 rounded-lg p-3 text-center space-y-1">
                    <span className="text-[10px] text-[#78716C] font-sans uppercase tracking-wider font-bold">आजको विशेष दैनिक जप मन्त्र</span>
                    <p className="text-sm font-bold text-[#781d1d] font-serif">
                      "{horoscopeData.dailyMantra || 'ॐ नमो भगवते वासुदेवाय नमः'}"
                    </p>
                    <span className="text-[10px] text-[#9A3412]">बिहान कम्तीमा २१ वा १०८ पटक जप गर्नाले मनोकामना सिद्धि हुनेछ।</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px] pt-1">
                    <div className="space-y-1">
                      <strong className="text-[#166534] block">✓ आज गर्न हुने शुभ कार्यहरू (Do's):</strong>
                      <div className="text-[#292524] space-y-0.5">
                        • बिहान सूर्योदय दर्शन तथा सूर्यलाई अर्घ्य दान।<br />
                        • इष्टदेवको पूजा तथा मान्यजनबाट आशीर्वाद ग्रहण।<br />
                        • नियमित व्यापारिक कार्य तथा सकारात्मक संवाद।
                      </div>
                    </div>
                    <div className="space-y-1">
                      <strong className="text-[#991B1B] block">! आज बच्नुपर्ने कार्यहरू (Don'ts):</strong>
                      <div className="text-[#292524] space-y-0.5">
                        • राहुकालको समयमा नयाँ लगानी वा ठूला निर्णय।<br />
                        • बिना कारण विवाद, क्रोध तथा असत्य भाषण।<br />
                        • तामसिक भोजन तथा अनावश्यक जोखिमपूर्ण यात्रा।
                      </div>
                    </div>
                  </div>
                </div>

                {/* 8. CERTIFICATION, DISCLAIMER & SEAL */}
                <div className="border border-[#D97706]/40 bg-[#FFFCF2] rounded-xl p-3.5 flex items-center justify-between gap-4 text-xs">
                  <div className="space-y-1 max-w-md">
                    <div className="font-bold text-[#781d1d] flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#D97706]" />
                      <span>ज्योतिषीय प्रमाणीकरण तथा परामर्श</span>
                    </div>
                    <p className="text-[10px] text-[#57534E] leading-relaxed">
                      यो प्रतिवेदन जातकको जन्मकुण्डली र सोही दिनको खगोलीय ग्रह गोचर चालको आधारमा वैदिक ज्योतिषीय सिद्धान्त अनुसार तयार पारिएको हो।
                    </p>
                    <div className="text-[9.5px] text-[#78716C]">
                      प्रतिवेदन उत्पादन समय: वि.सं. {todayPanchanga.dateBS} | प्रमाणीकरण कोड: BALA-{Math.random().toString(36).substring(2, 8).toUpperCase()}
                    </div>
                  </div>

                  {/* Stamp Seal Box */}
                  <div className="w-24 h-24 border-2 border-dashed border-[#B45309] rounded-xl flex flex-col items-center justify-center text-center p-1 bg-white text-[#781d1d] shrink-0">
                    <span className="text-xs">🕉️</span>
                    <span className="text-[9px] font-bold">बालानन्द वैदिक सेवा</span>
                    <span className="text-[8px] text-[#B45309]">आधिकारिक छाप</span>
                  </div>
                </div>

                {/* Page 2 Footer */}
                <div className="pt-2 text-center text-[10px] text-[#78716C] border-t border-[#D97706]/30 flex items-center justify-between">
                  <span>© बालानन्द वैदिक ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा • सर्वाधिकार सुरक्षित</span>
                  <span>पृष्ठ २ / २</span>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
