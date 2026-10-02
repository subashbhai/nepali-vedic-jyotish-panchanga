import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  User, 
  GraduationCap, 
  Briefcase, 
  Building2, 
  Coins, 
  Users, 
  Heart, 
  Baby, 
  Home, 
  Award, 
  Globe, 
  ShieldAlert, 
  Printer, 
  Download, 
  BookOpen, 
  HelpCircle, 
  Clock, 
  Layers, 
  FileText, 
  CheckCircle2, 
  MessageSquare,
  Search,
  Check,
  Plus,
  Lock
} from 'lucide-react';
import { 
  BirthDetails, 
  LagnaInfo, 
  PlanetPosition, 
  PanchangaData, 
  YogaRuleResult, 
  VimshottariDashaResult,
  GocharTransitResult 
} from '../types/astrology';
import { 
  generateMasterFaladeshReport, 
  answerAstrologyQuestion 
} from '../utils/faladeshEngine';
import { evaluateAllYogasAndDoshas } from '../utils/yogaEngine';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { exportFaladeshPDF, printElement } from '../utils/pdfGenerator';
import { canUserPrintDocuments } from '../db/subscriptionStore';
import { OmBorderFrame } from './CheenaDocument';
import { ClassicalShlokaCard } from './ClassicalShlokaCard';
import { 
  BPHS_GRAHA_SWAROOPA, 
  BPHS_BHAVA_SHLOKAS 
} from '../utils/brihatParasharaDatabase';
import { InteractiveYogaBreakdown } from './InteractiveYogaBreakdown';

interface FaladeshViewProps {
  profile: BirthDetails;
  lagna: LagnaInfo;
  planets: PlanetPosition[];
  panchanga: PanchangaData;
  yogas: YogaRuleResult[];
  dasha: VimshottariDashaResult;
  sadeSatiStatus: string;
  gochar?: GocharTransitResult;
  onNewProfile?: () => void;
}

export const FaladeshView: React.FC<FaladeshViewProps> = ({
  profile,
  lagna,
  planets,
  panchanga,
  yogas,
  dasha,
  sadeSatiStatus,
  gochar,
  onNewProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'life_areas' | 'parashara_shloka' | 'graha_phal' | 'bhava_phal' | 'bhavesh_varga' | 'yoga_dosha' | 'dasha_timeline' | 'qna_engine' | 'report_print'>('life_areas');
  const [astrologerNotes, setAstrologerNotes] = useState<string>('जातकको कुण्डलीमा शुभ ग्रहहरूको स्थिति अनुकूल रहेकाले प्रयत्न र अनुशासनले मनोकाङ्क्षा पूरा हुनेछ।');
  const [customQuestion, setCustomQuestion] = useState<string>('मेरो पेशा र जागिरको अवस्था कस्तो देखिन्छ?');
  const [qnaResult, setQnaResult] = useState<any>(null);

  const report = generateMasterFaladeshReport(
    profile,
    lagna,
    planets,
    panchanga,
    dasha,
    gochar,
    astrologerNotes
  );

  const yogaEval = evaluateAllYogasAndDoshas(lagna, planets, dasha, gochar);

  const handleAskQuestion = (qText: string) => {
    const res = answerAstrologyQuestion(
      qText,
      lagna,
      planets,
      dasha,
      yogaEval.yogas,
      yogaEval.doshas,
      gochar
    );
    setQnaResult(res);
  };

  const handlePrint = () => {
    const check = canUserPrintDocuments('kundali');
    if (!check.allowed) {
      window.dispatchEvent(new CustomEvent('trial-print-blocked', { detail: { reason: check.reasonNepali, docType: 'kundali' } }));
      return;
    }
    printElement('printable-faladesh-report');
  };

  const handleDownloadPDF = () => {
    const check = canUserPrintDocuments('kundali');
    if (!check.allowed) {
      window.dispatchEvent(new CustomEvent('trial-print-blocked', { detail: { reason: check.reasonNepali, docType: 'kundali' } }));
      return;
    }
    exportFaladeshPDF(report);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'User': return <User className="w-4 h-4 text-[#D97706]" />;
      case 'GraduationCap': return <GraduationCap className="w-4 h-4 text-[#D97706]" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4 text-[#D97706]" />;
      case 'Building2': return <Building2 className="w-4 h-4 text-[#D97706]" />;
      case 'Coins': return <Coins className="w-4 h-4 text-[#D97706]" />;
      case 'Users': return <Users className="w-4 h-4 text-[#D97706]" />;
      case 'Heart': return <Heart className="w-4 h-4 text-[#D97706]" />;
      case 'Baby': return <Baby className="w-4 h-4 text-[#D97706]" />;
      case 'Home': return <Home className="w-4 h-4 text-[#D97706]" />;
      case 'Award': return <Award className="w-4 h-4 text-[#D97706]" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-[#D97706]" />;
      case 'Globe': return <Globe className="w-4 h-4 text-[#D97706]" />;
      case 'ShieldAlert': return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      default: return <Compass className="w-4 h-4 text-[#D97706]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E6E0D5] dark:border-stone-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#F59E0B]/10 text-[#D97706] rounded-xl">
              <Compass className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-serif text-[#1A1A1A] dark:text-stone-100">
                वैदिक फलादेश इन्जिन (Classical Vedic Phaladesh Engine)
              </h2>
              <p className="text-xs text-[#78716C] dark:text-stone-400 mt-1">
                जातक: <strong className="text-[#2D241E] dark:text-stone-200">{profile.name}</strong> | {lagna.rashiName} लग्न | {panchanga.moonRashi} चन्द्र राशि | नक्षत्र: {panchanga.nakshatra.name} (पाद {toDevanagariNumerals(panchanga.nakshatra.pada)})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onNewProfile && (
              <button
                onClick={onNewProfile}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer ring-1 ring-amber-500/50"
                title="नयाँ जन्म विवरण हाल्नुहोस् र नयाँ कुण्डली खोल्नुहोस्"
              >
                <Plus className="w-4 h-4" />
                <span>नयाँ कुण्डली (New Kundali)</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-[#FDFCF8] dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 text-[#2D241E] dark:text-stone-200 rounded-xl text-xs font-medium hover:bg-[#F5F2EB] dark:hover:bg-stone-700 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-[#D97706]" />
              <span>छपाइ (Print)</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-3.5 py-2 bg-[#D97706] text-white rounded-xl text-xs font-semibold hover:bg-[#B45309] shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>प्रतिवेदन (PDF)</span>
            </button>
          </div>
        </div>

        {/* Overview Box */}
        <p className="text-xs text-[#2D241E] dark:text-stone-200 leading-relaxed font-serif bg-[#FDFCF8] dark:bg-stone-800/80 p-4 rounded-xl border border-[#E6E0D5] dark:border-stone-700/80">
          {report.overviewSummaryNepali}
        </p>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 pt-4">
          <button
            onClick={() => setActiveTab('life_areas')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'life_areas'
                ? 'bg-[#2D241E] text-white shadow-sm dark:bg-stone-200 dark:text-stone-900'
                : 'bg-[#FDFCF8] dark:bg-stone-800 text-[#78716C] dark:text-stone-300 hover:bg-[#F5F2EB] dark:hover:bg-stone-700 border border-[#E6E0D5] dark:border-stone-700'
            }`}
          >
            <Layers className="w-4 h-4 text-[#D97706]" />
            <span>१३ जीवन क्षेत्र (13 Life Areas)</span>
          </button>

          <button
            onClick={() => setActiveTab('parashara_shloka')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'parashara_shloka'
                ? 'bg-[#7A1C1C] text-white shadow-sm ring-1 ring-amber-400'
                : 'bg-amber-100/60 dark:bg-amber-950/40 text-amber-950 dark:text-amber-300 hover:bg-amber-200/70 border border-amber-300 dark:border-amber-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>बृहत्पाराशर श्लोक (BPHS)</span>
          </button>

          <button
            onClick={() => setActiveTab('graha_phal')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'graha_phal'
                ? 'bg-[#2D241E] text-white shadow-sm dark:bg-stone-200 dark:text-stone-900'
                : 'bg-[#FDFCF8] dark:bg-stone-800 text-[#78716C] dark:text-stone-300 hover:bg-[#F5F2EB] dark:hover:bg-stone-700 border border-[#E6E0D5] dark:border-stone-700'
            }`}
          >
            <User className="w-4 h-4 text-[#D97706]" />
            <span>नवग्रह फल (9 Planets)</span>
          </button>

          <button
            onClick={() => setActiveTab('bhava_phal')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'bhava_phal'
                ? 'bg-[#2D241E] text-white shadow-sm dark:bg-stone-200 dark:text-stone-900'
                : 'bg-[#FDFCF8] dark:bg-stone-800 text-[#78716C] dark:text-stone-300 hover:bg-[#F5F2EB] dark:hover:bg-stone-700 border border-[#E6E0D5] dark:border-stone-700'
            }`}
          >
            <Home className="w-4 h-4 text-[#D97706]" />
            <span>द्वादश भावफल (12 Houses)</span>
          </button>

          <button
            onClick={() => setActiveTab('bhavesh_varga')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'bhavesh_varga'
                ? 'bg-[#2D241E] text-white shadow-sm dark:bg-stone-200 dark:text-stone-900'
                : 'bg-[#FDFCF8] dark:bg-stone-800 text-[#78716C] dark:text-stone-300 hover:bg-[#F5F2EB] dark:hover:bg-stone-700 border border-[#E6E0D5] dark:border-stone-700'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#D97706]" />
            <span>भावेश र वर्गफलादेश (Lords & Vargas)</span>
          </button>

          <button
            onClick={() => setActiveTab('yoga_dosha')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'yoga_dosha'
                ? 'bg-[#2D241E] text-white shadow-sm dark:bg-stone-200 dark:text-stone-900'
                : 'bg-[#FDFCF8] dark:bg-stone-800 text-[#78716C] dark:text-stone-300 hover:bg-[#F5F2EB] dark:hover:bg-stone-700 border border-[#E6E0D5] dark:border-stone-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#D97706]" />
            <span>योग तथा दोष (Yogas & Doshas)</span>
          </button>

          <button
            onClick={() => setActiveTab('dasha_timeline')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'dasha_timeline'
                ? 'bg-[#2D241E] text-white shadow-sm dark:bg-stone-200 dark:text-stone-900'
                : 'bg-[#FDFCF8] dark:bg-stone-800 text-[#78716C] dark:text-stone-300 hover:bg-[#F5F2EB] dark:hover:bg-stone-700 border border-[#E6E0D5] dark:border-stone-700'
            }`}
          >
            <Clock className="w-4 h-4 text-[#D97706]" />
            <span>दशा-गोचर र समयरेखा (Timeline)</span>
          </button>

          <button
            onClick={() => setActiveTab('qna_engine')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'qna_engine'
                ? 'bg-[#2D241E] text-white shadow-sm dark:bg-stone-200 dark:text-stone-900'
                : 'bg-[#FDFCF8] dark:bg-stone-800 text-[#78716C] dark:text-stone-300 hover:bg-[#F5F2EB] dark:hover:bg-stone-700 border border-[#E6E0D5] dark:border-stone-700'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-[#D97706]" />
            <span>प्रश्न-उत्तर (Interactive Q&A)</span>
          </button>

          <button
            onClick={() => setActiveTab('report_print')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'report_print'
                ? 'bg-[#2D241E] text-white shadow-sm dark:bg-stone-200 dark:text-stone-900'
                : 'bg-[#FDFCF8] dark:bg-stone-800 text-[#78716C] dark:text-stone-300 hover:bg-[#F5F2EB] dark:hover:bg-stone-700 border border-[#E6E0D5] dark:border-stone-700'
            }`}
          >
            <FileText className="w-4 h-4 text-[#D97706]" />
            <span>पूर्ण फलादेश प्रतिवेदन (Report)</span>
            {!canUserPrintDocuments('kundali').allowed && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 font-bold border border-amber-500/30 flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" />
                प्रिन्ट
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: 13 LIFE AREAS */}
      {activeTab === 'life_areas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.lifeAreas.map((area) => (
              <div
                key={area.areaKey}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-2.5">
                  <h3 className="text-base font-bold font-serif text-[#1A1A1A] dark:text-stone-100 flex items-center gap-2">
                    {getIconComponent(area.iconName)}
                    <span>{area.areaTitleNepali}</span>
                  </h3>
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                    area.overallRating === 'अति उत्तम' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200' :
                    area.overallRating === 'उत्तम' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200' :
                    'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200'
                  }`}>
                    {area.overallRating}
                  </span>
                </div>

                <p className="text-xs text-[#2D241E] dark:text-stone-300 leading-relaxed font-serif">
                  {area.summaryNepali}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 p-2.5 rounded-xl space-y-1">
                    <strong className="text-emerald-800 dark:text-emerald-300 block font-medium">सबल पक्षहरू:</strong>
                    <ul className="list-disc list-inside text-[11px] text-emerald-900 dark:text-emerald-200 space-y-0.5">
                      {area.strengthsNepali.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 p-2.5 rounded-xl space-y-1">
                    <strong className="text-rose-800 dark:text-rose-300 block font-medium">सजगता/चुनौती:</strong>
                    <ul className="list-disc list-inside text-[11px] text-rose-900 dark:text-rose-200 space-y-0.5">
                      {area.challengesNepali.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-[#FDFCF8] dark:bg-stone-800/80 border border-[#E6E0D5] dark:border-stone-700 p-2.5 rounded-xl text-xs text-[#78716C] dark:text-stone-300 space-y-1">
                  <span className="block text-[11px] text-[#D97706] font-bold">सक्रिय समय:</span>
                  <p className="text-[11px]">{area.activeTimingNepali}</p>
                </div>

                {area.medicalDisclaimerNoticeNepali && (
                  <div className="bg-rose-50 dark:bg-stone-800/80 border border-rose-200 dark:border-rose-800/60 p-3 rounded-xl text-xs text-rose-900 dark:text-rose-200 leading-relaxed flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>स्वास्थ्य सूचना:</strong> {area.medicalDisclaimerNoticeNepali}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Master Remedies Section */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold font-serif text-[#1A1A1A] dark:text-stone-100 border-b border-[#E6E0D5] dark:border-stone-800 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D97706]" />
              <span>समग्र वैदिक उपाय प्रणाली (Mantra, Daan, Pooja & Behavioral Remedies)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#FDFCF8] dark:bg-stone-800/80 border border-[#E6E0D5] dark:border-stone-700 p-3.5 rounded-xl space-y-1.5">
                <strong className="text-[#D97706] block font-bold">मन्त्र जप:</strong>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-[#78716C] dark:text-stone-300">
                  {report.remediesMasterList.mantraJap.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#FDFCF8] dark:bg-stone-800/80 border border-[#E6E0D5] dark:border-stone-700 p-3.5 rounded-xl space-y-1.5">
                <strong className="text-[#D97706] block font-bold">दान-धर्म र सेवा:</strong>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-[#78716C] dark:text-stone-300">
                  {report.remediesMasterList.daanSewa.map((d, idx) => (
                    <li key={idx}>{d}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#FDFCF8] dark:bg-stone-800/80 border border-[#E6E0D5] dark:border-stone-700 p-3.5 rounded-xl space-y-1.5">
                <strong className="text-[#D97706] block font-bold">पूजा र व्रत:</strong>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-[#78716C] dark:text-stone-300">
                  {report.remediesMasterList.poojaVrat.map((pv, idx) => (
                    <li key={idx}>{pv}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#FDFCF8] dark:bg-stone-800/80 border border-[#E6E0D5] dark:border-stone-700 p-3.5 rounded-xl space-y-1.5">
                <strong className="text-[#D97706] block font-bold">व्यवहारिक आचरण:</strong>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-[#78716C] dark:text-stone-300">
                  {report.remediesMasterList.lifestyleAndBehavior.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: BRIHAT PARASHARA CLASSICAL SHLOKAS */}
      {activeTab === 'parashara_shloka' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Overview Banner */}
          <div className="bg-gradient-to-r from-amber-900 via-amber-950 to-stone-900 text-white p-5 rounded-2xl border border-amber-700 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-bold text-xl text-amber-300">
                ॐ
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-serif text-amber-100">
                  बृहत्पाराशर होराशास्त्रम् — प्रमाण श्लोक, पदच्छेद तथा विस्तृत अर्थ
                </h3>
                <p className="text-xs text-amber-200/80 font-medium">
                  महर्षि पराशर विरचित मूल संस्कृत श्लोक, पदच्छेद, विस्तृत नेपाली अन्वय तथा शास्त्रीय फलादेश
                </p>
              </div>
            </div>
          </div>

          {/* Grid of all 9 Planets Classical Shlokas */}
          <div className="space-y-5">
            <h4 className="text-sm font-bold text-amber-950 dark:text-amber-300 font-serif flex items-center gap-2 border-b border-amber-300 dark:border-amber-800 pb-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>१. नवग्रह स्वरूप प्रमाण श्लोक (९ ग्रहहरूको शास्त्रीय स्वरूप तथा फल)</span>
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {planets.map((planet) => {
                const shloka = BPHS_GRAHA_SWAROOPA[planet.name];
                const bhavaShloka = BPHS_BHAVA_SHLOKAS[planet.bhava];
                if (!shloka) return null;
                return (
                  <ClassicalShlokaCard
                    key={planet.name}
                    shloka={shloka}
                    bhavaShloka={bhavaShloka}
                    planetName={planet.name}
                    houseNumber={planet.bhava}
                  />
                );
              })}
            </div>
          </div>

          {/* Grid of 12 Bhavas Classical Shlokas */}
          <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800">
            <h4 className="text-sm font-bold text-amber-950 dark:text-amber-300 font-serif flex items-center gap-2 border-b border-amber-300 dark:border-amber-800 pb-2">
              <Home className="w-4 h-4 text-amber-600" />
              <span>२. द्वादश भाव प्रमाण श्लोक (१२ भावहरूको पराशर फल)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((hNum) => {
                const bShloka = BPHS_BHAVA_SHLOKAS[hNum];
                if (!bShloka) return null;
                return (
                  <div
                    key={hNum}
                    className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-amber-200 dark:border-stone-800 shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-amber-100 dark:border-stone-800 pb-1.5">
                      <span className="font-bold text-amber-900 dark:text-amber-400 font-serif">
                        भाव {toDevanagariNumerals(hNum)} औँ स्थान
                      </span>
                      <span className="text-[10px] text-stone-500 font-medium">
                        {bShloka.sourceChapter}
                      </span>
                    </div>

                    <div className="bg-amber-50/70 dark:bg-stone-950 rounded-lg p-2 text-center border border-amber-200/50 dark:border-stone-800">
                      <p className="font-serif font-bold text-amber-950 dark:text-amber-200 text-xs whitespace-pre-line leading-relaxed">
                        {bShloka.sanskritVerse}
                      </p>
                    </div>

                    <p className="text-[11px] text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                      <strong>शास्त्रीय अर्थ: </strong>
                      {bShloka.classicalEffectNepali}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GRAHA PHAL */}
      {activeTab === 'graha_phal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {report.grahaPhalList.map((g) => (
            <div
              key={g.planetId}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-[#F59E0B]/10 text-[#D97706] flex items-center justify-center font-bold text-sm">
                    {g.planetNameNepali.charAt(0)}
                  </span>
                  <div>
                    <h3 className="text-base font-bold font-serif text-[#1A1A1A] dark:text-stone-100">
                      {g.planetNameNepali} ({g.planetNameSanskrit})
                    </h3>
                    <p className="text-[11px] text-[#78716C] dark:text-stone-400">
                      {g.rashiName} राशि | भाव {toDevanagariNumerals(g.houseNumber)}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200">
                  {g.dignity}
                </span>
              </div>

              <p className="text-xs text-[#2D241E] dark:text-stone-300 leading-relaxed font-serif">
                {g.classicalSummaryNepali}
              </p>

              <div className="text-[11px] text-[#78716C] dark:text-stone-400 space-y-1 bg-[#FDFCF8] dark:bg-stone-800/80 p-2.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700">
                <div><strong>नक्षत्र:</strong> {g.nakshatraName} (स्वामी: {g.nakshatraLord})</div>
                <div><strong>दृष्टि भाव:</strong> {g.aspectingHouses.map(toDevanagariNumerals).join(', ')}</div>
                {g.conjoinedPlanets.length > 0 && (
                  <div><strong>युति ग्रह:</strong> {g.conjoinedPlanets.join(', ')}</div>
                )}
              </div>

              <div className="space-y-1.5 text-xs pt-1">
                <div className="text-emerald-800 dark:text-emerald-300">
                  <strong className="block font-medium">सकारात्मक प्रभाव:</strong>
                  <ul className="list-disc list-inside text-[11px] space-y-0.5 text-emerald-900 dark:text-emerald-200">
                    {g.positiveEffects.map((pe, idx) => <li key={idx}>{pe}</li>)}
                  </ul>
                </div>

                <div className="text-rose-800 dark:text-rose-300">
                  <strong className="block font-medium">सतर्कता क्षेत्र:</strong>
                  <ul className="list-disc list-inside text-[11px] space-y-0.5 text-rose-900 dark:text-rose-200">
                    {g.challengesToWatch.map((cw, idx) => <li key={idx}>{cw}</li>)}
                  </ul>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-2.5 rounded-xl text-xs text-amber-900 dark:text-amber-300">
                <strong>शास्त्रीय उपाय:</strong> {g.remedyNepali}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: BHAVA PHAL */}
      {activeTab === 'bhava_phal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.bhavaPhalList.map((b) => (
            <div
              key={b.houseNumber}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-2.5">
                <h3 className="text-base font-bold font-serif text-[#1A1A1A] dark:text-stone-100 flex items-center gap-2">
                  <Home className="w-4 h-4 text-[#D97706]" />
                  <span>{b.houseNameNepali}</span>
                </h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200">
                  {b.strengthRating}
                </span>
              </div>

              <div className="text-xs text-[#78716C] dark:text-stone-400">
                <strong>कारकत्व:</strong> {b.significationsNepali}
              </div>

              <p className="text-xs text-[#2D241E] dark:text-stone-300 leading-relaxed font-serif bg-[#FDFCF8] dark:bg-stone-800/80 p-3 rounded-xl border border-[#E6E0D5] dark:border-stone-700">
                {b.classicalInterpretationNepali}
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#78716C] dark:text-stone-300">
                <div className="bg-stone-50 dark:bg-stone-800/50 p-2 rounded-lg">
                  <strong>भावेश ग्रह:</strong> {b.lordPlanet} (भाव {toDevanagariNumerals(b.lordHousePosition)} मा)
                </div>
                <div className="bg-stone-50 dark:bg-stone-800/50 p-2 rounded-lg">
                  <strong>भाव राशि:</strong> {b.rashiName}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: BHAVESH & VARGAS */}
      {activeTab === 'bhavesh_varga' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold font-serif text-[#1A1A1A] dark:text-stone-100 border-b border-[#E6E0D5] dark:border-stone-800 pb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#D97706]" />
              <span>भावेश स्थिति र शास्त्रीय फल (House Lords Placement Readings)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {report.bhaveshPhalList.map((bh) => (
                <div
                  key={bh.houseNumber}
                  className="bg-[#FDFCF8] dark:bg-stone-800/80 border border-[#E6E0D5] dark:border-stone-700 p-4 rounded-xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-[#E6E0D5]/60 dark:border-stone-700/60 pb-1.5">
                    <strong className="text-[#2D241E] dark:text-stone-100 font-bold">{bh.houseNameNepali}</strong>
                    <span className="text-[11px] text-[#D97706]">
                      स्वामी: {bh.lordPlanet} → भाव {toDevanagariNumerals(bh.placedInHouse)}
                    </span>
                  </div>
                  <p className="text-[#78716C] dark:text-stone-300 leading-relaxed">
                    {bh.explanationNepali}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: YOGA & DOSHA */}
      {activeTab === 'yoga_dosha' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold font-serif text-[#1A1A1A] dark:text-stone-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#D97706]" />
                  <span>कुण्डलीका सक्रिय शुभ योगहरू (Active Classical Yogas & Interactive Breakdown)</span>
                </h3>
                <p className="text-xs text-[#78716C] dark:text-stone-400 mt-1">
                  कुनै पनि योगमा क्लिक गरी त्यसको प्रत्यक्ष कुण्डली रेखाचित्र, निर्माणमा सहभागी ग्रहहरू र शास्त्रीय प्रमाण विश्लेषण हेर्नुहोस्।
                </p>
              </div>
              <div className="bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 self-start sm:self-auto">
                सक्रिय योगहरू: {toDevanagariNumerals(yogaEval.yogas.length)} वटा
              </div>
            </div>

            <InteractiveYogaBreakdown
              yogas={yogaEval.yogas}
              lagna={lagna}
              planets={planets}
              dasha={dasha}
            />
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold font-serif text-[#1A1A1A] dark:text-stone-100 border-b border-[#E6E0D5] dark:border-stone-800 pb-3 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>दोष पहिचान, बल र भङ्ग/शमन स्थिति (Dosha Evaluation & Mitigation)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {yogaEval.doshas.map((d) => (
                <div key={d.id} className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-amber-900 dark:text-amber-200 text-sm font-bold font-serif">{d.nameNepali}</strong>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${
                      d.isCancelled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {d.isCancelled ? 'दोष शमित/भङ्ग' : 'सक्रिय दोष'}
                    </span>
                  </div>
                  <p className="text-amber-800 dark:text-amber-300 leading-relaxed font-serif">{d.descriptionNepali}</p>
                  {d.cancellationRulesTriggeredNepali && d.cancellationRulesTriggeredNepali.length > 0 && (
                    <div className="text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200">
                      <strong>भङ्ग/शमन कारण:</strong> {d.cancellationRulesTriggeredNepali.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DASHA & TIMELINE */}
      {activeTab === 'dasha_timeline' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold font-serif text-[#1A1A1A] dark:text-stone-100 border-b border-[#E6E0D5] dark:border-stone-800 pb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#D97706]" />
              <span>दशा र गोचरको संयुक्त फलादेश (Dasha-Gochar Active Coordination)</span>
            </h3>

            <div className="bg-[#FDFCF8] dark:bg-stone-800/80 border border-[#E6E0D5] dark:border-stone-700 p-4 rounded-xl space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#2D241E] dark:text-stone-200">
                <div>
                  <strong>महादशा स्वामी:</strong> {report.dashaGocharPhal.mahadashaPlanet}
                </div>
                <div>
                  <strong>अन्तरदशा स्वामी:</strong> {report.dashaGocharPhal.antardashaPlanet}
                </div>
                <div>
                  <strong>सक्रिय जीवन क्षेत्र:</strong> {report.dashaGocharPhal.activeLifeAreasNepali.join(', ')}
                </div>
                <div>
                  <strong>समय सीमा:</strong> वि.सं. {report.dashaGocharPhal.startDateBS} देखि {report.dashaGocharPhal.endDateBS}
                </div>
              </div>

              <div className="border-t border-[#E6E0D5] dark:border-stone-700 pt-3 text-[#78716C] dark:text-stone-300 leading-relaxed font-serif space-y-1">
                <p><strong>दशा-गोचर समन्वय:</strong> {report.dashaGocharPhal.gocharCoordinationNepali}</p>
                <p><strong>प्रमुख मार्गदर्शन:</strong> {report.dashaGocharPhal.keyAdviceNepali}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold font-serif text-[#1A1A1A] dark:text-stone-100 border-b border-[#E6E0D5] dark:border-stone-800 pb-3 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#D97706]" />
              <span>जीवनको समयरेखा (Chronological Life Timeline)</span>
            </h3>

            <div className="space-y-3">
              {report.lifeTimeline.map((tl) => (
                <div key={tl.phaseId} className="bg-[#FDFCF8] dark:bg-stone-800/80 border border-[#E6E0D5] dark:border-stone-700 p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-[#E6E0D5]/60 dark:border-stone-700/60 pb-1.5">
                    <strong className="text-[#2D241E] dark:text-stone-100 font-bold text-sm font-serif">{tl.titleNepali}</strong>
                    <span className="text-[11px] text-[#D97706] bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      {tl.periodBS}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#78716C] dark:text-stone-300 pt-1">
                    <div>
                      <strong className="text-emerald-800 dark:text-emerald-300 block">अवसरका क्षेत्रहरू:</strong>
                      <ul className="list-disc list-inside text-[11px]">
                        {tl.opportunityAreasNepali.map((o, idx) => <li key={idx}>{o}</li>)}
                      </ul>
                    </div>
                    <div>
                      <strong className="text-amber-800 dark:text-amber-300 block">सजगताका क्षेत्रहरू:</strong>
                      <ul className="list-disc list-inside text-[11px]">
                        {tl.precautionAreasNepali.map((p, idx) => <li key={idx}>{p}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: INTERACTIVE Q&A ENGINE */}
      {activeTab === 'qna_engine' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-6 shadow-sm space-y-5">
          <div className="border-b border-[#E6E0D5] dark:border-stone-800 pb-3">
            <h3 className="text-lg font-bold font-serif text-[#1A1A1A] dark:text-stone-100 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#D97706]" />
              <span>जिज्ञासा तथा प्रश्न-उत्तर इन्जिन (Rule-Driven Astrological Q&A)</span>
            </h3>
            <p className="text-xs text-[#78716C] dark:text-stone-400 mt-0.5">
              कुण्डलीको वास्तविक ग्रह स्थिति र शास्त्रीय नियमका आधारमा बिना कुनै भ्रम उत्तर प्राप्त गर्नुहोस्।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="उदा: मेरो पेशा, विवाह वा धनको स्थिति कस्तो छ?"
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700 bg-[#FDFCF8] dark:bg-stone-800 text-xs text-[#2D241E] dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#D97706]"
            />
            <button
              onClick={() => handleAskQuestion(customQuestion)}
              className="px-5 py-2.5 bg-[#2D241E] dark:bg-stone-200 text-white dark:text-stone-900 rounded-xl text-xs font-semibold hover:bg-black dark:hover:bg-white transition-colors flex items-center justify-center gap-2 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>उत्तर हेर्नुहोस्</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-[#78716C] dark:text-stone-400 text-[11px] self-center">नमुना प्रश्नहरू:</span>
            {['मेरो पेशा र जागिरको अवस्था कस्तो छ?', 'विवाहको योग कहिले बन्छ?', 'धन सञ्चय र आम्दानी कस्तो रहला?'].map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCustomQuestion(q);
                  handleAskQuestion(q);
                }}
                className="px-2.5 py-1 bg-[#FDFCF8] dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 text-[#78716C] dark:text-stone-300 rounded-lg text-[11px] hover:bg-[#F5F2EB] dark:hover:bg-stone-700"
              >
                {q}
              </button>
            ))}
          </div>

          {qnaResult && (
            <div className="bg-[#FDFCF8] dark:bg-stone-800/80 border border-[#E6E0D5] dark:border-stone-700 p-5 rounded-2xl space-y-4 text-xs font-serif">
              <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-700 pb-2">
                <span className="font-bold text-[#D97706] text-sm">{qnaResult.questionCategory}</span>
                <span className="text-[11px] text-[#78716C] dark:text-stone-400">स्रोत: {qnaResult.sourceReferenceNepali}</span>
              </div>

              <div className="space-y-2 text-[#2D241E] dark:text-stone-200 leading-relaxed">
                <div>
                  <strong className="text-[#D97706] block mb-0.5">१. कुण्डलीका आधारभूत तथ्यहरू:</strong>
                  <p className="text-[11px] text-[#78716C] dark:text-stone-300">
                    सम्बन्धित ग्रह: {qnaResult.astrologicalFactsInvolved.relevantPlanets.join(', ')} | भाव: {qnaResult.astrologicalFactsInvolved.relevantHouses.map(toDevanagariNumerals).join(', ')} | वर्तमान दशा: {qnaResult.astrologicalFactsInvolved.currentDasha}
                  </p>
                </div>

                <div>
                  <strong className="text-[#D97706] block mb-0.5">२. लागू भएको शास्त्रीय नियम:</strong>
                  <p className="bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-[#E6E0D5] dark:border-stone-700">
                    {qnaResult.appliedClassicalRuleNepali}
                  </p>
                </div>

                <div>
                  <strong className="text-[#D97706] block mb-0.5">३. सन्तुलित फलादेश निष्कर्ष:</strong>
                  <p className="bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800/40 text-[#1A1A1A] dark:text-stone-100 font-bold">
                    {qnaResult.balancedPredictionNepali}
                  </p>
                </div>

                <div>
                  <strong className="text-[#D97706] block mb-0.5">४. सक्रिय समय र सुझाव उपाय:</strong>
                  <p className="text-[11px] mb-1">{qnaResult.favorablePeriodNepali}</p>
                  <ul className="list-disc list-inside text-[11px] text-emerald-800 dark:text-emerald-300">
                    {qnaResult.recommendedRemediesNepali.map((r: string, idx: number) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 8: ASTROLOGER NOTES & PRINT REPORT */}
      {activeTab === 'report_print' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-6 shadow-sm space-y-6">
          <div className="border-b border-[#E6E0D5] dark:border-stone-800 pb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold font-serif text-[#1A1A1A] dark:text-stone-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#D97706]" />
              <span>व्यावसायिक प्रतिवेदन र ज्योतिषी टिप्पणी (Consultation Report & Astrologer Mode)</span>
            </h3>
            <span className="text-xs text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200">
              संस्करण {report.engineVersion}
            </span>
          </div>

          {!canUserPrintDocuments('kundali').allowed && (
            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-red-500/10 to-amber-500/10 border-2 border-dashed border-amber-600/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-700 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#7A1C1C] dark:text-amber-400">पूर्ण फलादेश प्रतिवेदन प्रिन्ट तथा आधिकारिक निर्यात</h4>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    सम्पूर्ण जीवन विश्लेषण, दशा महादशा र ज्योतिषी सिफारिससहितको पूर्ण प्रिन्ट प्रतिवेदन डाउनलोड गर्न पूर्ण सदस्यता वा परीक्षण आवश्यक पर्दछ।
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-subscription-purchase-modal'))}
                className="px-4 py-2 bg-gradient-to-r from-[#7A1C1C] to-[#9B2C2C] text-white text-xs font-bold rounded-xl shadow-md hover:brightness-110 shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>पूर्ण संस्करण खरिद / अनलक</span>
              </button>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#2D241E] dark:text-stone-200">
              ज्योतिषीको व्यक्तिगत टिप्पणी र सिफारिस (Astrologer's Custom Note):
            </label>
            <textarea
              rows={3}
              value={astrologerNotes}
              onChange={(e) => setAstrologerNotes(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#E6E0D5] dark:border-stone-700 bg-[#FDFCF8] dark:bg-stone-800 text-xs text-[#2D241E] dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#D97706]"
            />
          </div>

          {/* Printable Report Preview Container */}
          <div id="printable-faladesh-report">
            <OmBorderFrame>
              <div className="bg-[#FFFDF7] p-6 space-y-6">
                <div className="text-center border-b border-red-700 pb-4 space-y-1">
                  <h2 className="text-xl font-bold font-serif text-red-800">
                    वैदिक जन्मकुण्डली तथा सम्पूर्ण फलादेश प्रतिवेदन
                  </h2>
                  <p className="text-xs text-stone-600">
                    नेपाली पात्रो तथा पञ्चाङ्ग गणना प्रणाली | विक्रम संवत् आधारित
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-amber-50 p-4 rounded-xl border border-red-200 text-stone-900">
                  <div><strong>जातकको नाम:</strong> {profile.name}</div>
                  <div><strong>जन्म मिति:</strong> {profile.dateBS}</div>
                  <div><strong>जन्म समय:</strong> {profile.time}</div>
                  <div><strong>जन्म स्थान:</strong> {profile.location || (profile as any).place || 'काठमाडौँ'}</div>
                  <div><strong>लग्न:</strong> {lagna.rashiName}</div>
                  <div><strong>चन्द्र राशि:</strong> {panchanga.moonRashi}</div>
                  <div><strong>नक्षत्र:</strong> {panchanga.nakshatra.name}</div>
                  <div><strong>वर्तमान दशा:</strong> {report.dashaGocharPhal.mahadashaPlanet} - {report.dashaGocharPhal.antardashaPlanet}</div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-red-700 font-serif">१. कुण्डलीको संक्षिप्त सारांश</h4>
                  <p className="text-xs text-stone-800 leading-relaxed font-serif bg-amber-50 p-3 rounded-xl border border-red-200">
                    {report.overviewSummaryNepali}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-red-700 font-serif">२. ज्योतिषीको व्यक्तिगत टिप्पणी</h4>
                  <p className="text-xs text-stone-800 leading-relaxed font-serif bg-amber-100/60 p-3 rounded-xl border border-amber-300">
                    {astrologerNotes}
                  </p>
                </div>

                <div className="text-[11px] text-stone-600 border-t border-red-200 pt-3 text-center">
                  {report.healthDisclaimerNepali}
                </div>
              </div>
            </OmBorderFrame>
          </div>
        </div>
      )}
    </div>
  );
};
