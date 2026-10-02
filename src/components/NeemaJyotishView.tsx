/**
 * Neema Jyotish View (नेमा ज्योतिष / तिब्बती ज्योतिष)
 * Complete Tibetan Astrology Professional ERP Workspace
 * Brihat Jyotish Professional ERP
 */

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Compass,
  Sun,
  Moon,
  Calendar,
  Award,
  Shield,
  Check,
  Flame,
  Droplets,
  HeartHandshake,
  BookOpen,
  Printer,
  Search,
  Info,
  HelpCircle,
  ArrowRight,
  Layers,
  FileText,
  CheckCircle2,
  AlertTriangle,
  User,
  RefreshCw,
  Eye,
  ShieldCheck,
  Clock,
  MapPin,
  Filter
} from 'lucide-react';

import { BirthDetails } from '../types/astrology';
import { toDevanagariNumerals, convertADToBS } from '../utils/nepaliCalendar';
import { computeTibetanBirthChart, TibetanBirthChartData } from '../core/tibetan/tibetanBirthChartEngine';
import { calculateTibetanCompatibility } from '../core/tibetan/tibetanCompatibilityEngine';
import { CLASSICAL_TIBETAN_BOOKS, TIBETAN_CANONICAL_RULES } from '../core/rules/sources/tibetan/tibetanSourceRegistry';
import { printElement } from '../utils/pdfGenerator';

// Visual Charts
import { TibetanBirthMandalaChart } from './tibetan/charts/TibetanBirthMandalaChart';
import { FiveElementInteractionChart } from './tibetan/charts/FiveElementInteractionChart';
import { MewaMagicSquareChart } from './tibetan/charts/MewaMagicSquareChart';
import { ParkhaOctagramChart } from './tibetan/charts/ParkhaOctagramChart';
import { LifeForceGaugeChart } from './tibetan/charts/LifeForceGaugeChart';
import { TibetanCompatibilityTable } from './tibetan/TibetanCompatibilityTable';

interface NeemaJyotishViewProps {
  activeProfile?: BirthDetails | null;
  profiles?: BirthDetails[];
  onSelectProfile?: (profile: BirthDetails) => void;
  onOpenNewProfileModal?: () => void;
}

export type NeemaTabId =
  | 'overview'
  | 'elements'
  | 'mewa_parkha'
  | 'predictions'
  | 'calendar_rhythm'
  | 'match'
  | 'evidence'
  | 'report'
  | 'audit';

export const NeemaJyotishView: React.FC<NeemaJyotishViewProps> = ({
  activeProfile,
  profiles = [],
  onSelectProfile,
  onOpenNewProfileModal
}) => {
  const [activeTab, setActiveTab] = useState<NeemaTabId>('overview');
  const [predictionSearch, setPredictionSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('सबै');

  // Compatibility partner state
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [customPresetPartner, setCustomPresetPartner] = useState<BirthDetails | null>(null);
  const [isSwapped, setIsSwapped] = useState(false);
  const [mewaParkhaSubView, setMewaParkhaSubView] = useState<'mewa' | 'parkha' | 'both'>('mewa');

  // Fallback profile if none is active
  const effectiveProfile: BirthDetails = useMemo(() => {
    if (activeProfile && activeProfile.dateAD) {
      return activeProfile;
    }
    if (profiles.length > 0 && profiles[0].dateAD) {
      return profiles[0];
    }
    // Default canonical profile
    return {
      id: 'default-profile',
      name: 'नमुना जातक (Sample Client)',
      gender: 'male',
      dateAD: '1995-05-15',
      time: '06:30',
      location: {
        name: 'काठमाडौं, नेपाल',
        country: 'नेपाल',
        latitude: 27.7172,
        longitude: 85.324,
        timeZone: 5.75
      }
    };
  }, [activeProfile, profiles]);

  // Compute master Tibetan birth chart
  const chartData: TibetanBirthChartData = useMemo(() => {
    return computeTibetanBirthChart(effectiveProfile);
  }, [effectiveProfile]);

  const { yearInfo, currentYearInfo, lifeForces, mewa, parkha, predictions, auditRecord } = chartData;

  // Default fallback partner if only 1 profile exists
  const defaultPartner: BirthDetails = useMemo(() => {
    return {
      id: 'sample-partner-female',
      name: 'नमुना कन्या (सुश्री आर्या)',
      gender: 'female',
      dateAD: '1998-08-20',
      time: '10:15',
      location: {
        name: 'पोखरा, नेपाल',
        country: 'नेपाल',
        latitude: 28.2096,
        longitude: 83.9856,
        timeZone: 5.75
      }
    };
  }, []);

  // Partner for compatibility matching
  const partnerProfile = useMemo(() => {
    if (customPresetPartner) return customPresetPartner;
    if (selectedPartnerId) {
      return profiles.find((p) => p.id === selectedPartnerId) || defaultPartner;
    }
    const other = profiles.find((p) => p.id !== effectiveProfile.id);
    return other || defaultPartner;
  }, [customPresetPartner, selectedPartnerId, profiles, effectiveProfile, defaultPartner]);

  // Handle profile swap for compatibility perspective
  const activeBoyProfile = isSwapped ? partnerProfile : effectiveProfile;
  const activeGirlProfile = isSwapped ? effectiveProfile : partnerProfile;

  const boyChart = useMemo(() => computeTibetanBirthChart(activeBoyProfile), [activeBoyProfile]);
  const girlChart = useMemo(() => computeTibetanBirthChart(activeGirlProfile), [activeGirlProfile]);

  const compatibilityResult = useMemo(() => {
    return calculateTibetanCompatibility(
      boyChart.yearInfo,
      boyChart.lifeForces,
      boyChart.mewa,
      boyChart.parkha,
      girlChart.yearInfo,
      girlChart.lifeForces,
      girlChart.mewa,
      girlChart.parkha
    );
  }, [boyChart, girlChart]);

  const handleSelectPartner = (id: string) => {
    setCustomPresetPartner(null);
    setSelectedPartnerId(id);
  };

  const handleSwapProfiles = () => {
    setIsSwapped((prev) => !prev);
  };

  const handleApplyPreset = (presetType: 'best' | 'neutral' | 'clash') => {
    if (presetType === 'best') {
      // Dragon (2000) or compatible trine
      setCustomPresetPartner({
        id: 'preset-best-dragon',
        name: 'त्रिसङ्गम अनुकूल कन्या (२००० ड्रागन/मेघ)',
        gender: 'female',
        dateAD: '2000-05-10',
        time: '08:00',
        location: { name: 'काठमाडौं', country: 'नेपाल', latitude: 27.7172, longitude: 85.324, timeZone: 5.75 }
      });
    } else if (presetType === 'neutral') {
      // Wood Pig (1995) + Tiger (1998)
      setCustomPresetPartner({
        id: 'preset-neutral-tiger',
        name: 'तटस्थ/पोषक कन्या (१९९८ बाघ/पृथ्वी)',
        gender: 'female',
        dateAD: '1998-10-15',
        time: '12:00',
        location: { name: 'ललितपुर', country: 'नेपाल', latitude: 27.67, longitude: 85.32, timeZone: 5.75 }
      });
    } else if (presetType === 'clash') {
      // Rat (1996) + Horse (2002) -> 6-distance Dun-zur direct conflict
      setCustomPresetPartner({
        id: 'preset-clash-horse',
        name: 'विपरीत दुन्जुर कन्या (२००२ घोडा/आगो)',
        gender: 'female',
        dateAD: '2002-06-21',
        time: '14:30',
        location: { name: 'भक्तपुर', country: 'नेपाल', latitude: 27.67, longitude: 85.42, timeZone: 5.75 }
      });
    }
  };

  // Filtered predictions
  const filteredPredictions = useMemo(() => {
    return predictions.filter((item) => {
      const matchesCat = selectedCategory === 'सबै' || item.categoryNepali === selectedCategory;
      const matchesQuery =
        !predictionSearch ||
        item.titleNepali.toLowerCase().includes(predictionSearch.toLowerCase()) ||
        item.headlineNepali.toLowerCase().includes(predictionSearch.toLowerCase()) ||
        item.detailedTextNepali.toLowerCase().includes(predictionSearch.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [predictions, selectedCategory, predictionSearch]);

  const categories = useMemo(() => {
    const set = new Set(predictions.map((p) => p.categoryNepali));
    return ['सबै', ...Array.from(set)];
  }, [predictions]);

  // Birth details formatted
  const birthDateBS = useMemo(() => {
    try {
      if (effectiveProfile.dateBS) {
        const parts = effectiveProfile.dateBS.split('-').map(Number);
        return { year: parts[0], month: parts[1], day: parts[2] };
      }
      return convertADToBS(effectiveProfile.dateAD);
    } catch {
      return null;
    }
  }, [effectiveProfile.dateAD, effectiveProfile.dateBS]);

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Banner / Client Context Bar */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-800 to-amber-900 text-white shadow-md border-b border-amber-600/40">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Title & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/30 border border-amber-300/40 flex items-center justify-center text-amber-200 shadow-inner">
                <Compass className="w-6 h-6 text-amber-200 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-wide text-amber-100">नेमा ज्योतिष</h1>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 border border-amber-400/30 font-medium">
                    Tibetan Astrology (འབྱུང་རྩིས་ དང་ དཀར་རྩིས་)
                  </span>
                </div>
                <p className="text-xs text-amber-200/90 mt-0.5">
                  वैदूर्य कार्पो (Vaidurya Karpo) मानक पञ्चतत्व, ९ मेवा एवं ८ पार्खा विश्लेषण प्रणाली
                </p>
              </div>
            </div>

            {/* Client Picker & Meta */}
            <div className="flex flex-wrap items-center gap-2">
              {profiles.length > 1 && onSelectProfile && (
                <div className="flex items-center gap-1.5 bg-black/20 rounded-lg px-2.5 py-1 border border-amber-400/30">
                  <User className="w-3.5 h-3.5 text-amber-300" />
                  <select
                    value={effectiveProfile.id}
                    onChange={(e) => {
                      const found = profiles.find((p) => p.id === e.target.value);
                      if (found) onSelectProfile(found);
                    }}
                    className="bg-transparent text-xs text-amber-100 font-medium focus:outline-none cursor-pointer"
                  >
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                        {p.name} ({p.dateAD})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {onOpenNewProfileModal && (
                <button
                  onClick={onOpenNewProfileModal}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  नयाँ कुण्डली
                </button>
              )}

              <button
                onClick={() => printElement('neemajyotish-printable-report')}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-1.5 transition-colors border border-white/20 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-200" />
                प्रिन्ट
              </button>
            </div>
          </div>

          {/* Quick Profile Overview Strip */}
          <div className="mt-3 pt-3 border-t border-amber-600/50 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-amber-100/90">
            <span className="flex items-center gap-1 font-semibold text-white">
              <User className="w-3.5 h-3.5 text-amber-300" />
              {effectiveProfile.name}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              जन्म: {effectiveProfile.dateAD} (ई.सं.)
              {birthDateBS && ` / वि.सं. ${toDevanagariNumerals(birthDateBS.year)}-${toDevanagariNumerals(birthDateBS.month)}-${toDevanagariNumerals(birthDateBS.day)}`}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              {effectiveProfile.time}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              {effectiveProfile.location?.name || 'नेपाल'}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Tibetan Astrological Key Metrics Strip */}
      <div className="bg-amber-100/70 dark:bg-slate-900/90 border-b border-amber-200 dark:border-slate-800 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              {yearInfo.tibetanYearNameNepali}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200 shadow-2xs">
              पशु: <strong className="text-orange-600 dark:text-orange-400">{yearInfo.animal.nameNepali}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200 shadow-2xs">
              तत्व: <strong style={{ color: yearInfo.element.hexColor }}>{yearInfo.element.nameNepali}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200 shadow-2xs">
              मेवा: <strong>{toDevanagariNumerals(mewa.number)} ({mewa.nameNepali.split(' ')[1]})</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200 shadow-2xs">
              पार्खा: <strong>{parkha.nameNepali.split(' ')[0]} ({parkha.trigramSymbol})</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200 shadow-2xs">
              लुङता: <strong className="text-blue-600 dark:text-blue-400">{lifeForces.lungta.element.nameNepali.split(' ')[0]}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Workspace Navigation Tabs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
            {[
              { id: 'overview', label: 'जन्म मण्डल र सार', icon: Compass },
              { id: 'elements', label: 'पाँच तत्व र जीवनशक्ति', icon: Flame },
              { id: 'mewa_parkha', label: 'मेवा र पार्खा चक्र', icon: Layers },
              { id: 'predictions', label: '२० क्षेत्र फलादेश', icon: BookOpen },
              { id: 'calendar_rhythm', label: 'वार्षिक, मासिक र दैनिक', icon: Calendar },
              { id: 'match', label: 'सम्बन्ध/विवाह मिलान', icon: HeartHandshake },
              { id: 'evidence', label: 'शास्त्रीय ग्रन्थ र प्रमाण', icon: ShieldCheck },
              { id: 'report', label: 'पूर्ण प्रतिवेदन', icon: FileText },
              { id: 'audit', label: 'अडिट मोड', icon: Shield }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as NeemaTabId)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Tab Content Area */}
      <main id="neemajyotish-printable-report" className="max-w-7xl mx-auto px-4 py-6 sm:px-6 flex-1 w-full">
        {/* TAB 1: OVERVIEW & MANDALA */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Traditional Mandala SVG */}
              <div className="lg:col-span-6 flex flex-col items-center">
                <div className="w-full bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
                  <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-amber-600" />
                      तिब्बती जन्म मण्डल (Sipaho Natal Mandala)
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      १२ पशु • ८ पार्खा • ९ मेवा
                    </span>
                  </div>
                  <TibetanBirthMandalaChart yearInfo={yearInfo} mewa={mewa} parkha={parkha} size={420} />
                </div>
              </div>

              {/* Right Column: Key Metaphysical Summary & Pillars */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                {/* Life Force Quick Gauge */}
                <LifeForceGaugeChart lifeForces={lifeForces} />

                {/* Primary Daily Pillars */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                    <div className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-emerald-600" />
                      सोग-जा (प्राण/शुभ वार)
                    </div>
                    <div className="text-base font-bold text-emerald-950 dark:text-emerald-100 mt-1">
                      {yearInfo.animal.soulDayNepali}
                    </div>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300/80 mt-1">
                      नयाँ कार्य, सम्झौता र यात्राका लागि सर्वथा शुभ।
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
                    <div className="text-xs text-rose-800 dark:text-rose-300 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      शे-जा (संकट/सावधानी वार)
                    </div>
                    <div className="text-base font-bold text-rose-950 dark:text-rose-100 mt-1">
                      {yearInfo.animal.dangerDayNepali}
                    </div>
                    <p className="text-[11px] text-rose-700 dark:text-rose-300/80 mt-1">
                      विवाद, ठूला जोखिम र शल्यक्रिया आदिमा विशेष सावधानी।
                    </p>
                  </div>
                </div>

                {/* Classical Tradition Guarantee Note */}
                <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-xs">
                  <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    प्रामाणिक शास्त्रीय आधार (Vaidurya Karpo Certified)
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    यो विश्लेषण कुनै सामान्य वा काल्पनिक ढाँचामा होइन, पाँचौं दलाई लामाका प्रमुख खगोलविद् देसी साङग्ये ग्याछोद्वारा १६८७ ईस्वीमा रचित कालजयी ग्रन्थ <strong>‘वैदूर्य कार्पो’ (सेतो वैदूर्य)</strong> को ज्युङ्ची नियम अनुसार शुद्ध गणितीय विधिबाट निष्पादित गरिएको हो।
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FIVE ELEMENTS & LIFE FORCE */}
        {activeTab === 'elements' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 flex flex-col items-center">
                <FiveElementInteractionChart activeElement={yearInfo.element} size={380} />
              </div>
              <div className="lg:col-span-7 flex flex-col gap-4">
                <LifeForceGaugeChart lifeForces={lifeForces} />
              </div>
            </div>

            {/* In-depth 5 Forces Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[lifeForces.sog, lifeForces.lu, lifeForces.wang, lifeForces.lungta, lifeForces.la].map((dim) => (
                <div
                  key={dim.id}
                  className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {dim.titleNepali}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-bold"
                        style={{
                          backgroundColor: dim.element.hexColor + '20',
                          color: dim.element.hexColor
                        }}
                      >
                        {dim.element.nameNepali.split(' ')[0]}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                      {dim.dimensionMeaning}
                    </div>
                    <div className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                      {dim.traditionalSignificance}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 text-[11px] text-amber-900 dark:text-amber-300">
                    <strong>उपाय:</strong> {dim.supportingRemedy}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: MEWA & PARKHA TRIGRAM */}
        {activeTab === 'mewa_parkha' && (
          <div className="flex flex-col gap-6">
            {/* View Switcher Sub-bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  दृश्य छनोट (Select View):
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMewaParkhaSubView('mewa')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      mewaParkhaSubView === 'mewa'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    ९ मेवा जादुई मण्डल (Interactive Mewa)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMewaParkhaSubView('parkha')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      mewaParkhaSubView === 'parkha'
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    ८ पार्खा त्रिकोण (Parkha Octagram)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMewaParkhaSubView('both')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      mewaParkhaSubView === 'both'
                        ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    दुवै सँगै (Combined)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>तपाईंको जन्म मेवा: <strong className="text-amber-700 dark:text-amber-400">{mewa.nameNepali}</strong></span>
                <span>•</span>
                <span>पार्खा: <strong className="text-orange-700 dark:text-orange-400">{parkha.nameNepali}</strong></span>
              </div>
            </div>

            {/* Sub-view: MEWA Dedicated or BOTH */}
            {(mewaParkhaSubView === 'mewa' || mewaParkhaSubView === 'both') && (
              <div className="w-full">
                <MewaMagicSquareChart natalMewa={mewa} />
              </div>
            )}

            {/* Sub-view: PARKHA Dedicated or BOTH */}
            {(mewaParkhaSubView === 'parkha' || mewaParkhaSubView === 'both') && (
              <div className="w-full bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
                <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-orange-600" />
                    ८ पार्खा (त्रिकोण एवं वास्तु दिशा चक्र)
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300">
                    {parkha.nameNepali}
                  </span>
                </div>
                <ParkhaOctagramChart natalParkha={parkha} size={420} />

                {/* Complete 5 Directions Guide */}
                <div className="w-full mt-6 flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    वास्तु एवं दिशानिर्देश (Directional Guidelines):
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    {parkha.directions.map((d, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-800 dark:text-slate-200">
                            {d.nameNepali} ({d.tibetanTerm})
                          </span>
                          <span className="text-amber-600 dark:text-amber-400 font-bold">
                            {d.direction}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                          {d.effectNepali}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: 20 PREDICTION DOMAINS */}
        {activeTab === 'predictions' && (
          <div className="flex flex-col gap-5">
            {/* Header & Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                  २० क्षेत्र फलादेश (Classical Comprehensive Interpretations)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  प्रत्येक फलादेशको पछाडि वैदूर्य कार्पोको सूत्र, प्रमाण स्थिति र परम्परागत उपाय सङ्कलित छ।
                </p>
              </div>

              {/* Search & Filter */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="फलादेश खोज्नुहोस्..."
                    value={predictionSearch}
                    onChange={(e) => setPredictionSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-amber-600 text-white font-bold shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Predictions List */}
            <div className="flex flex-col gap-4">
              {filteredPredictions.map((pred) => (
                <div
                  key={pred.topicId}
                  className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-300 dark:hover:border-amber-700/60 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                        {pred.categoryNepali}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {pred.titleNepali}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          pred.strengthStatus === 'उत्तम' || pred.strengthStatus === 'शुभ'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                        }`}
                      >
                        {pred.strengthStatus}
                      </span>
                    </div>
                  </div>

                  {/* Headline */}
                  <div className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-2">
                    {pred.headlineNepali}
                  </div>

                  {/* Detailed Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line mb-4">
                    {pred.detailedTextNepali}
                  </p>

                  {/* Indicators Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 text-xs">
                      <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 mb-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        अनुकूल सूचकहरू (Favorable Indicators):
                      </div>
                      <ul className="list-disc list-inside text-emerald-800 dark:text-emerald-200/90 space-y-1">
                        {pred.favorableIndicators.map((ind, i) => (
                          <li key={i}>{ind}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 text-xs">
                      <div className="font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5 mb-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        सावधानीका क्षेत्र (Challenging Factors):
                      </div>
                      <ul className="list-disc list-inside text-rose-800 dark:text-rose-200/90 space-y-1">
                        {pred.challengingIndicators.map((ind, i) => (
                          <li key={i}>{ind}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Remedies & Source Evidence Footer */}
                  <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-slate-800/70 border border-amber-200/60 dark:border-slate-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-amber-900 dark:text-amber-300">
                        परम्परागत उपाय:
                      </span>{' '}
                      <span className="text-slate-700 dark:text-slate-300">
                        {pred.remediesNepali.join(' • ')}
                      </span>
                    </div>

                    {/* Rule Evidence Badge */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        स्रोत: {pred.evidence.sourceTitle} ({pred.evidence.chapter})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CALENDAR RHYTHM (Annual, Monthly, Daily, Dung-kor) */}
        {activeTab === 'calendar_rhythm' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Dung-kor 12-Year cycle analysis */}
              <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm mb-2">
                  <RefreshCw className="w-4 h-4 text-orange-600" />
                  डुङ-कोर (Dung-kor - १२ वर्षे चक्र)
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                  प्रत्येक १२ वर्षमा आफ्नै जन्म पशु राशि दोहोरिँदा ऊर्जा सङ्क्रमण काल मानिन्छ।
                </p>
                <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 text-xs text-orange-900 dark:text-orange-200 font-medium">
                  तपाईंको डुङ-कोर वर्षहरू: १२, २४, ३६, ४८, ६०, ७२ औं वर्ष। यस्तो समयमा महाकाल पूजा तथा शान्ति पाठ परम्परागत रूपमा उत्तम मानिन्छ।
                </div>
              </div>

              {/* Monthly Rhythm */}
              <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm mb-2">
                  <Moon className="w-4 h-4 text-blue-600" />
                  चन्द्रमास र ऊर्जा तरङ्ग (Lunar Rhythms)
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                  शुक्ल पक्षको अष्टमी, पूर्णिमा र शुक्ल दशमी गुरु पद्मसंभव एवं तारा दिवसका रूपमा विशेष ऊर्जावान् रहनेछ।
                </p>
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 font-medium">
                  महिनाको १५ औं दिन (पूर्णिमा) ध्यान र नयाँ सम्झौताका लागि अनुकूल, कृष्ण पक्षको ३० औं दिन विश्रामका लागि उपयुक्त।
                </div>
              </div>

              {/* Daily Planetary Harmony */}
              <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm mb-2">
                  <Sun className="w-4 h-4 text-amber-600" />
                  दैनिक वार तालमेल (Day Rhythms)
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                  जीवन वार (सोग-जा): <strong>{yearInfo.animal.soulDayNepali}</strong>
                  <br />
                  संकट वार (शे-जा): <strong>{yearInfo.animal.dangerDayNepali}</strong>
                </p>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 font-medium">
                  {yearInfo.animal.soulDayNepali} का दिन थालिएका कार्यमा पूर्ण सफलता तथा {yearInfo.animal.dangerDayNepali} मा संयम रहनुहोस्।
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: COMPATIBILITY MATCHING (विवाह/सहकार्य मिलान) */}
        {activeTab === 'match' && compatibilityResult && (
          <TibetanCompatibilityTable
            compatibility={compatibilityResult}
            profile1={activeBoyProfile}
            profile2={activeGirlProfile}
            profiles={profiles}
            onSelectPartnerId={handleSelectPartner}
            onSwapProfiles={handleSwapProfiles}
            onApplyPreset={handleApplyPreset}
          />
        )}

        {/* TAB 7: CLASSICAL SOURCES & EVIDENCE */}
        {activeTab === 'evidence' && (
          <div className="flex flex-col gap-6">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                शास्त्रीय ग्रन्थ एवं प्रमाण सङ्ग्रह (Classical Source Registry)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
                नेमा ज्योतिष मोड्युलमा कुनै पनि फलादेश वा गणना काल्पनिक छैन। प्रत्येक सूत्र ऐतिहासिक तिब्बती एवं हिमाली ग्रन्थहरूसँग प्रमाणित छ।
              </p>

              {/* Books Catalog */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {CLASSICAL_TIBETAN_BOOKS.map((book) => (
                  <div
                    key={book.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {book.status}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {book.historicalPeriod}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {book.nepaliTitle}
                    </h4>
                    <div className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">
                      {book.tibetanTitle} • {book.transliteratedTitle}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                      लेखक: <strong>{book.author}</strong> ({book.tradition})
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                      {book.descriptionNepali}
                    </p>

                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      प्रमुख अध्यायहरू:
                    </div>
                    <ul className="list-disc list-inside text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
                      {book.chapters.slice(0, 4).map((ch, i) => (
                        <li key={i}>{ch}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Verified Rule Evidence Table */}
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                सत्यापित शास्त्रीय नियमहरू (Audited Canonical Rules):
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-700 rounded-lg">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-2.5">नियम ID</th>
                      <th className="p-2.5">प्रणाली</th>
                      <th className="p-2.5">विषय</th>
                      <th className="p-2.5">मूल ग्रन्थ एवं अध्याय</th>
                      <th className="p-2.5">विश्वसनीयता</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                    {TIBETAN_CANONICAL_RULES.map((r) => (
                      <tr key={r.ruleId}>
                        <td className="p-2.5 font-mono text-[11px] font-bold text-amber-700 dark:text-amber-400">
                          {r.ruleId}
                        </td>
                        <td className="p-2.5">{r.system}</td>
                        <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200">{r.topic}</td>
                        <td className="p-2.5">
                          {r.sourceTitle} - {r.chapter} ({r.pageOrVerse})
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                            {toDevanagariNumerals(r.confidence)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: FULL PRINT REPORT */}
        {activeTab === 'report' && (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md print:p-0 print:border-none print:shadow-none">
            {/* Print Header */}
            <div className="text-center pb-6 border-b-2 border-amber-600">
              <h2 className="text-2xl font-black text-amber-900 dark:text-amber-200 tracking-wide">
                बृहत् तिब्बती ज्योतिष प्रतिवेदन
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                नेमा ज्योतिष • वैदूर्य कार्पो (Vaidurya Karpo) मानक पञ्चतत्व एवं मेवा प्रणाली
              </p>
            </div>

            {/* Profile Meta Info Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <div>
                <span className="text-slate-500">नाम:</span>
                <div className="font-bold text-slate-800 dark:text-slate-200">{effectiveProfile.name}</div>
              </div>
              <div>
                <span className="text-slate-500">जन्म मिति:</span>
                <div className="font-bold text-slate-800 dark:text-slate-200">{effectiveProfile.dateAD}</div>
              </div>
              <div>
                <span className="text-slate-500">जन्म समय:</span>
                <div className="font-bold text-slate-800 dark:text-slate-200">{effectiveProfile.time}</div>
              </div>
              <div>
                <span className="text-slate-500">जन्म स्थान:</span>
                <div className="font-bold text-slate-800 dark:text-slate-200">{effectiveProfile.location?.name || 'नेपाल'}</div>
              </div>
            </div>

            {/* Core Metrics Banner */}
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-slate-600 dark:text-slate-400">तिब्बती संवत्:</span>
                <div className="font-bold text-amber-900 dark:text-amber-200 text-sm">
                  {yearInfo.tibetanYearNameNepali}
                </div>
              </div>
              <div className="flex gap-3">
                <div>
                  <span className="text-slate-500">मेवा:</span>
                  <div className="font-bold">{toDevanagariNumerals(mewa.number)} ({mewa.nameNepali.split(' ')[1]})</div>
                </div>
                <div>
                  <span className="text-slate-500">पार्खा:</span>
                  <div className="font-bold">{parkha.nameNepali.split(' ')[0]} ({parkha.trigramSymbol})</div>
                </div>
                <div>
                  <span className="text-slate-500">लुङता:</span>
                  <div className="font-bold">{lifeForces.lungta.element.nameNepali.split(' ')[0]}</div>
                </div>
              </div>
            </div>

            {/* Life Force 5 Summary */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                पञ्च जीवन-ऊर्जा स्तर (Sog, Lu, Wang, Lungta, La):
              </h4>
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                {[lifeForces.sog, lifeForces.lu, lifeForces.wang, lifeForces.lungta, lifeForces.la].map((dim) => (
                  <div key={dim.id} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{dim.titleNepali.split(' ')[0]}</div>
                    <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                      {toDevanagariNumerals(dim.strengthPercentage)}%
                    </div>
                    <div className="text-[10px] text-slate-500">{dim.levelNepali}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Predictions Summary */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
                प्रमुख फलादेश एवं जीवन मार्गदर्शन:
              </h4>
              <div className="flex flex-col gap-3">
                {predictions.slice(0, 6).map((pred) => (
                  <div key={pred.topicId} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-200 mb-0.5">
                      {pred.titleNepali}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      {pred.detailedTextNepali.slice(0, 220)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Traditional Remedies & Seal */}
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs">
              <div className="font-bold text-amber-900 dark:text-amber-200 mb-1">
                परम्परागत उपाय एवं मन्त्र:
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                पञ्चरङ्गी लुङता ध्वजा फहराउनुहोस्, हरित तारा मन्त्र (ॐ तारे तुत्तारे तुरे सोहा) एवं मञ्जुश्री मन्त्रको नियमित साधना गर्नुहोस्।
              </p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500">
              <span>प्रतिवेदन तयार: {new Date().toLocaleDateString('ne-NP')}</span>
              <span>Brihat Jyotish Professional ERP • Neema Jyotish Module</span>
            </div>
          </div>
        )}

        {/* TAB 9: AUDIT MODE */}
        {activeTab === 'audit' && (
          <div className="flex flex-col gap-5">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-base mb-2">
                <Shield className="w-5 h-5 text-amber-600" />
                अडिट मोड एवं एल्गोरिदम ट्रेस (Audit & Deterministic Trace)
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
                यस अडिट ट्रेलले नेमा ज्योतिषको सम्पूर्ण गणना १००% पुनरुत्पादन योग्य (Deterministic) र शास्त्रीय ग्रन्थमा आधारित रहेको सुनिश्चित गर्दछ।
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="font-bold text-slate-800 dark:text-slate-200 mb-3">
                    इनपुट एवं क्याल्कुलेसन ट्रेस
                  </div>
                  <div className="space-y-2 text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">इनपुट ह्यास (Hash):</span>
                      <span className="font-mono text-[11px]">{auditRecord.inputHash}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">गणना समय (Timestamp):</span>
                      <span>{auditRecord.calculationTimestamp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">इन्जिन भर्सन:</span>
                      <span className="font-mono">{auditRecord.engineVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">शास्त्रीय स्रोत भर्सन:</span>
                      <span className="font-mono">{auditRecord.sourceVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">लागू गरिएका नियम संख्या:</span>
                      <span className="font-bold">{auditRecord.ruleCountApplied} वटा</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="font-bold text-slate-800 dark:text-slate-200 mb-3">
                    गणितीय म्यापिङ आउटपुट
                  </div>
                  <div className="space-y-2 text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500">रबजुङ चक्र:</span>
                      <span>{auditRecord.rabjungCycle} औं चक्र</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">पशु राशि (Animal):</span>
                      <span className="font-bold">{auditRecord.computedYearAnimal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">वर्ष तत्व (Element):</span>
                      <span className="font-bold">{auditRecord.computedYearElement}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">मेवा (Natal Mewa):</span>
                      <span className="font-bold">{auditRecord.computedNatalMewa}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">पार्खा (Natal Parkha):</span>
                      <span className="font-bold">{auditRecord.computedNatalParkha}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
