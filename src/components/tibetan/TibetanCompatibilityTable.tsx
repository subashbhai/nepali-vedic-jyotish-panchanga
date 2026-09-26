/**
 * Tibetan Compatibility Interpretation Table Component
 * (तिब्बती विवाह तथा सहकार्य मिलान पारम्परिक तालिका)
 * Based on Vaidurya Karpo (वैदूर्य कार्पो)
 * Brihat Jyotish Professional ERP
 */

import React, { useState } from 'react';
import {
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Droplets,
  Sparkles,
  ArrowRightLeft,
  BookOpen,
  Info,
  Compass,
  Check,
  Printer,
  ChevronDown,
  Layers,
  Award
} from 'lucide-react';
import {
  TibetanCompatibilityResult,
  TibetanCompatibilityDimensionRow,
  TibetanLifeForceComparisonRow
} from '../../types/tibetanAstrology';
import { BirthDetails } from '../../types/astrology';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';

interface TibetanCompatibilityTableProps {
  compatibility: TibetanCompatibilityResult;
  profile1: BirthDetails;
  profile2: BirthDetails;
  profiles?: BirthDetails[];
  onSelectPartnerId?: (id: string) => void;
  onSwapProfiles?: () => void;
  onApplyPreset?: (presetType: 'best' | 'neutral' | 'clash') => void;
}

export const TibetanCompatibilityTable: React.FC<TibetanCompatibilityTableProps> = ({
  compatibility,
  profile1,
  profile2,
  profiles = [],
  onSelectPartnerId,
  onSwapProfiles,
  onApplyPreset
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'table' | 'elements' | 'lifeforces' | 'evidence'>('table');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const {
    overallVerdictNepali,
    totalCompatibilityPercentage,
    dimensionRows,
    lifeForceRows,
    elementCycleDetails,
    mewaPairingDetails,
    animalPairingDetails,
    strengthsSummary,
    challengesSummary,
    traditionalHarmonizingAdvice,
    evidence
  } = compatibility;

  const toggleRow = (id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  // Verdict Colors
  const getVerdictStyle = () => {
    if (totalCompatibilityPercentage >= 80) {
      return {
        bg: 'bg-emerald-500/10 dark:bg-emerald-950/30',
        border: 'border-emerald-300 dark:border-emerald-800',
        text: 'text-emerald-800 dark:text-emerald-300',
        badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
      };
    }
    if (totalCompatibilityPercentage >= 65) {
      return {
        bg: 'bg-blue-500/10 dark:bg-blue-950/30',
        border: 'border-blue-300 dark:border-blue-800',
        text: 'text-blue-800 dark:text-blue-300',
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border-blue-300 dark:border-blue-700'
      };
    }
    if (totalCompatibilityPercentage >= 50) {
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-950/30',
        border: 'border-amber-300 dark:border-amber-800',
        text: 'text-amber-800 dark:text-amber-300',
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border-amber-300 dark:border-amber-700'
      };
    }
    return {
      bg: 'bg-rose-500/10 dark:bg-rose-950/30',
      border: 'border-rose-300 dark:border-rose-800',
      text: 'text-rose-800 dark:text-rose-300',
      badge: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border-rose-300 dark:border-rose-700'
    };
  };

  const verdictStyle = getVerdictStyle();

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Header with Profile Selector Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <HeartHandshake className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  तिब्बती विवाह तथा सहकार्य मिलान (Tibetan Compatibility)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  वैदूर्य कार्पो (Vaidurya Karpo) मानक अनुसार ५ प्रमुख आयामहरूको पारम्परिक तुलनात्मक तालिका
                </p>
              </div>
            </div>
          </div>

          {/* Controls: Partner Selector & Role Swap */}
          <div className="flex flex-wrap items-center gap-2">
            {profiles.length > 1 && onSelectPartnerId && (
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  दोस्रो पात्र:
                </label>
                <select
                  value={profile2.id || ''}
                  onChange={(e) => onSelectPartnerId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {profiles
                    .filter((p) => p.id !== profile1.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.dateAD})
                      </option>
                    ))}
                </select>
              </div>
            )}

            {onSwapProfiles && (
              <button
                type="button"
                onClick={onSwapProfiles}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="वर र कन्याको भूमिका साटासाट गर्नुहोस्"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>भूमिका साटासाट</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="यो मिलान विवरण छाप्नुहोस्"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>प्रिन्ट</span>
            </button>
          </div>
        </div>

        {/* Quick Testing Presets Bar (For instant testing of different configurations) */}
        {onApplyPreset && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              परीक्षण नमुनाहरू:
            </span>
            <button
              type="button"
              onClick={() => onApplyPreset('best')}
              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
            >
              ✓ अति उत्तम (त्रिसङ्गम जोडी)
            </button>
            <button
              type="button"
              onClick={() => onApplyPreset('neutral')}
              className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 rounded-md border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
            >
              • सामान्य / पोषक जोडी
            </button>
            <button
              type="button"
              onClick={() => onApplyPreset('clash')}
              className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 rounded-md border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
            >
              ! विपरीत द्वन्द्व (दुन्जुर जोडी)
            </button>
          </div>
        )}
      </div>

      {/* 2. Master Compatibility Metric & Profile Header Cards */}
      <div className={`p-5 rounded-2xl border ${verdictStyle.border} ${verdictStyle.bg} transition-all`}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Profile 1 Card */}
          <div className="md:col-span-4 p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                पात्र १ ({profile1.gender === 'female' ? 'कन्या' : 'वर'})
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {profile1.dateAD}
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
              {profile1.name}
            </h4>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="px-2 py-0.5 rounded font-medium bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
                {compatibility.boyAnimal.nameNepali.split(' ')[0]} ({compatibility.boyAnimal.nameTibetan})
              </span>
              <span className={`px-2 py-0.5 rounded font-medium ${compatibility.boyElement.badgeBg}`}>
                {compatibility.boyElement.nameNepali.split(' ')[0]}
              </span>
              <span className="px-2 py-0.5 rounded font-medium bg-purple-100 text-purple-900 dark:bg-purple-950/70 dark:text-purple-300">
                मेवा {toDevanagariNumerals(compatibility.boyMewa.number)}
              </span>
              <span className="px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                {compatibility.boyParkha.nameNepali.split(' ')[0]}
              </span>
            </div>
          </div>

          {/* Central Compatibility Meter */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              समग्र अनुकूलता प्राप्ताङ्क
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {toDevanagariNumerals(totalCompatibilityPercentage)}
              </span>
              <span className="text-xl font-extrabold text-slate-500 dark:text-slate-400">%</span>
            </div>

            <div className={`px-3.5 py-1 rounded-full text-xs font-bold border ${verdictStyle.badge}`}>
              {overallVerdictNepali}
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full max-w-[200px] bg-slate-200 dark:bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  totalCompatibilityPercentage >= 80
                    ? 'bg-emerald-500'
                    : totalCompatibilityPercentage >= 65
                    ? 'bg-blue-500'
                    : totalCompatibilityPercentage >= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${totalCompatibilityPercentage}%` }}
              />
            </div>
          </div>

          {/* Profile 2 Card */}
          <div className="md:col-span-4 p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                पात्र २ ({profile2.gender === 'male' ? 'वर' : 'कन्या'})
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {profile2.dateAD}
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
              {profile2.name}
            </h4>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="px-2 py-0.5 rounded font-medium bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
                {compatibility.girlAnimal.nameNepali.split(' ')[0]} ({compatibility.girlAnimal.nameTibetan})
              </span>
              <span className={`px-2 py-0.5 rounded font-medium ${compatibility.girlElement.badgeBg}`}>
                {compatibility.girlElement.nameNepali.split(' ')[0]}
              </span>
              <span className="px-2 py-0.5 rounded font-medium bg-purple-100 text-purple-900 dark:bg-purple-950/70 dark:text-purple-300">
                मेवा {toDevanagariNumerals(compatibility.girlMewa.number)}
              </span>
              <span className="px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                {compatibility.girlParkha.nameNepali.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        {[
          { id: 'table', label: 'पारम्परिक व्याख्या तालिका', icon: Layers },
          { id: 'elements', label: 'पञ्चतत्व चक्र एवं मध्यस्थ तत्व', icon: Flame },
          { id: 'lifeforces', label: '५ जीवनशक्ति चक्र (Sog-Lu-Wang)', icon: Droplets },
          { id: 'evidence', label: 'शास्त्रीय ग्रन्थ प्रमाण (वैदूर्य कार्पो)', icon: BookOpen }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-rose-600 text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 shadow-2xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. SUB-TAB CONTENT 1: COLOR-CODED TRADITIONAL INTERPRETATION TABLE */}
      {activeSubTab === 'table' && (
        <div className="flex flex-col gap-5">
          <div className="overflow-hidden bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3.5 min-w-[160px]">परीक्षण आयाम (भार)</th>
                    <th className="p-3.5 min-w-[140px]">पात्र १ ({profile1.name.split(' ')[0]})</th>
                    <th className="p-3.5 min-w-[140px]">पात्र २ ({profile2.name.split(' ')[0]})</th>
                    <th className="p-3.5 min-w-[180px]">शास्त्रीय सम्बन्ध</th>
                    <th className="p-3.5 min-w-[120px] text-center">स्तर</th>
                    <th className="p-3.5 min-w-[80px] text-right">अंक</th>
                    <th className="p-3.5 w-10 text-center">विवरण</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {dimensionRows.map((row) => {
                    const isExpanded = expandedRowId === row.id;
                    return (
                      <React.Fragment key={row.id}>
                        <tr
                          onClick={() => toggleRow(row.id)}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors ${
                            isExpanded ? 'bg-slate-50/90 dark:bg-slate-800/60' : ''
                          }`}
                        >
                          {/* Dimension Title & Weight */}
                          <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                            <div>{row.titleNepali}</div>
                            <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                              भार: {toDevanagariNumerals(row.weightagePercentage)}%
                            </span>
                          </td>

                          {/* Profile 1 Value */}
                          <td className="p-3.5">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${row.boyValue.colorBadge}`}>
                              {row.boyValue.nameNepali}
                            </span>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {row.boyValue.detail}
                            </div>
                          </td>

                          {/* Profile 2 Value */}
                          <td className="p-3.5">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${row.girlValue.colorBadge}`}>
                              {row.girlValue.nameNepali}
                            </span>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {row.girlValue.detail}
                            </div>
                          </td>

                          {/* Classical Relation */}
                          <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                            {row.classicalRelation}
                          </td>

                          {/* Level Badge */}
                          <td className="p-3.5 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border ${row.levelBadge.badgeClass}`}
                            >
                              {row.levelBadge.text}
                            </span>
                          </td>

                          {/* Score */}
                          <td className="p-3.5 text-right font-black text-slate-900 dark:text-slate-100 whitespace-nowrap">
                            <span className="text-rose-600 dark:text-rose-400">
                              {toDevanagariNumerals(row.score)}
                            </span>
                            <span className="text-slate-400 font-normal">
                              /{toDevanagariNumerals(row.maxScore)}
                            </span>
                          </td>

                          {/* Expand Button */}
                          <td className="p-3.5 text-center">
                            <ChevronDown
                              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                                isExpanded ? 'transform rotate-180 text-rose-600' : ''
                              }`}
                            />
                          </td>
                        </tr>

                        {/* Expanded Interpretation & Remedy Drawer */}
                        {isExpanded && (
                          <tr className="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                            <td colSpan={7} className="p-4 pt-1">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                                    <Info className="w-4 h-4 text-blue-500" />
                                    <span>शास्त्रीय फलादेश तथा व्याख्या:</span>
                                  </div>
                                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {row.interpretationNepali}
                                  </p>
                                </div>

                                <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 mb-1.5">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    <span>पारम्परिक शान्ति तथा सामञ्जस्य उपाय:</span>
                                  </div>
                                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {row.remedyNepali}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strengths and Traditional Harmonizing Advice Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-300 mb-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>सबल पक्षहरू (Strengths & Harmonious Merits):</span>
              </div>
              <ul className="space-y-1.5 text-emerald-800 dark:text-emerald-200">
                {strengthsSummary.length > 0 ? (
                  strengthsSummary.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500 italic">कुनै विशिष्ट उच्च अनुकूलता फेला परेन।</li>
                )}
              </ul>
            </div>

            {/* Challenges & Remedies */}
            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300 mb-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>सावधानी एवं पारम्परिक मार्गदर्शन (Harmonizing Prescriptions):</span>
              </div>
              <ul className="space-y-1.5 text-amber-800 dark:text-amber-200">
                {traditionalHarmonizingAdvice.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 5. SUB-TAB CONTENT 2: FIVE ELEMENT CYCLES & MEDIATOR ELEMENT */}
      {activeSubTab === 'elements' && (
        <div className="flex flex-col gap-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-rose-500" />
              पञ्चतत्व चक्र एवं सम्बन्ध विश्लेषण (Five Elements Interaction Cycle)
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              तिब्बती ज्युङ्ची (Jungtsi) परम्परामा विवाह मिलानको मूल आधार पाँच तत्व (काठ, आगो, पृथ्वी, फलाम, पानी) को माता-पुत्र, मित्र र शत्रु चक्र हो।
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Element Comparison Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">
                  वर्ष तत्व सम्बन्ध:
                </div>
                <div className="flex items-center justify-around gap-2 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="text-center">
                    <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${compatibility.boyElement.badgeBg}`}>
                      {compatibility.boyElement.nameNepali}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1">पात्र १</div>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      {compatibility.elementRelation}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {elementCycleDetails.cycleType}
                    </span>
                  </div>

                  <div className="text-center">
                    <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${compatibility.girlElement.badgeBg}`}>
                      {compatibility.girlElement.nameNepali}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1">पात्र २</div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                  {elementCycleDetails.explanationNepali}
                </p>
              </div>

              {/* Intermediary Mediator Remedy Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                  <span>तत्व सन्तुलन तथा मध्यस्थ तत्व (Intermediary Mediator):</span>
                  {elementCycleDetails.mediatingElement && (
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${elementCycleDetails.mediatingElement.badgeBg}`}>
                      मध्यस्थ: {elementCycleDetails.mediatingElement.nameNepali.split(' ')[0]}
                    </span>
                  )}
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    पारम्परिक शान्ति विधि:
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {elementCycleDetails.remedyRitualNepali}
                  </p>
                </div>

                <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 bg-amber-50/50 dark:bg-amber-950/20 p-2.5 rounded border border-amber-200/60 dark:border-amber-900/40">
                  <strong>शास्त्रीय नियम:</strong> यदि वर र कन्याको तत्व शत्रु (दमन) परेमा दुवै तत्वलाई जोड्ने तेस्रो मध्यस्थ तत्वको रङ्ग, वस्त्र, आभूषण वा कोठाको रङ्ग संयोजन प्रयोग गर्दा द्वन्द्व न्यून भई सम्बन्ध सौहार्दपूर्ण बन्दछ।
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. SUB-TAB CONTENT 3: 5 LIFE FORCES CROSS ANALYSIS */}
      {activeSubTab === 'lifeforces' && (
        <div className="flex flex-col gap-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  ५ जीवनशक्ति तत्व चक्र तालमेल (Sog, Lu, Wang, Lungta, La)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  दुवै पात्रका पाँचैवटा जीवन-ऊर्जाका तत्वहरूको आमने-सामने तुलना
                </p>
              </div>
              <div className="text-xs font-bold px-2.5 py-1 rounded bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                कुल प्राप्ताङ्क: {toDevanagariNumerals(compatibility.lifeForceBalanceScore)}/१५
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3">शक्ति आयाम</th>
                    <th className="p-3">पात्र १ तत्व</th>
                    <th className="p-3">पात्र २ तत्व</th>
                    <th className="p-3">पारस्परिक सम्बन्ध</th>
                    <th className="p-3">स्तर</th>
                    <th className="p-3">फलादेश टिप्पणी</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {lifeForceRows.map((lf) => (
                    <tr key={lf.dimensionId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                        <div>{lf.titleNepali}</div>
                        <span className="text-[10px] text-slate-500 font-normal">{lf.meaningNepali}</span>
                      </td>

                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${lf.boyElement.badgeBg}`}>
                          {lf.boyElement.nameNepali.split(' ')[0]}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${lf.girlElement.badgeBg}`}>
                          {lf.girlElement.nameNepali.split(' ')[0]}
                        </span>
                      </td>

                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        {lf.relation}
                      </td>

                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${lf.badgeClass}`}>
                          {lf.statusLabel}
                        </span>
                      </td>

                      <td className="p-3 text-slate-600 dark:text-slate-300">
                        {lf.harmonyNoteNepali}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. SUB-TAB CONTENT 4: CLASSICAL EVIDENCE (वैदूर्य कार्पो) */}
      {activeSubTab === 'evidence' && (
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              शास्त्रीय ग्रन्थ एवं प्रमाण (Classical Source Registry)
            </h4>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            यो अनुकूलता परीक्षण पूर्ण रूपमा तिब्बती मानक राजपरम्पराको प्रामाणिक ग्रन्थ <strong>वैदूर्य कार्पो (Vaidurya Karpo - White Beryl)</strong> को विवाह प्रकरण (Bag-tsi) अनुसार गणना गरिएको हो।
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                मूल ग्रन्थ तथा लेखक:
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                {evidence.sourceTitle} | लेखक: {evidence.author}
              </p>
              <div className="mt-2 text-slate-500">
                <strong>अध्याय:</strong> {evidence.chapter} ({evidence.pageOrVerse || 'पृष्ठ १९०-२२५'})
              </div>
              <div className="mt-1 text-slate-500">
                <strong>परम्परा:</strong> {evidence.tradition} | पद्धति: {evidence.system}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                शास्त्रीय प्रमाणिक स्थिति:
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {evidence.sourceType}
                </span>
                <span className="text-slate-500">
                  विश्वसनीयता सूचकांक: {evidence.confidence}%
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {evidence.notesNepali}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TibetanCompatibilityTable;
