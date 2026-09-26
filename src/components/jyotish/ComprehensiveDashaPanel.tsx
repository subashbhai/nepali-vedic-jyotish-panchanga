import React, { useState, useEffect, useMemo, memo } from 'react';
import {
  Clock,
  ChevronDown,
  CheckCircle2,
  Calendar,
  Sparkles,
  Layers,
  Info,
  ShieldCheck,
  Zap
} from 'lucide-react';
import {
  BirthDetails,
  PlanetPosition,
  VimshottariDashaResult
} from '../../types/astrology';
import { toDevanagariNumerals, formatYears, convertADToBS } from '../../utils/nepaliCalendar';
import {
  calculateTribhagiDasha,
  calculateYoginiDasha,
  TribhagiDashaResult,
  YoginiDashaResult
} from '../../utils/multiDashaEngine';

export type DashaSystemType = 'vimshottari' | 'tribhagi' | 'yogini';

interface ComprehensiveDashaPanelProps {
  dasha?: VimshottariDashaResult;
  profile: BirthDetails;
  moon: PlanetPosition;
}

interface ActiveRunningDashaCardProps {
  systemLabel: string;
  systemCycleLabel?: string;
  todayBS: string;
  activeMahaName: string;
  activeMahaStartBS: string;
  activeMahaEndBS: string;
  activeAntarName: string;
  activeAntarStartBS: string;
  activeAntarEndBS: string;
  onJumpToActive?: () => void;
}

const ActiveRunningDashaHighlightCard: React.FC<ActiveRunningDashaCardProps> = ({
  systemLabel,
  systemCycleLabel,
  todayBS,
  activeMahaName,
  activeMahaStartBS,
  activeMahaEndBS,
  activeAntarName,
  activeAntarStartBS,
  activeAntarEndBS,
  onJumpToActive,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/60 to-amber-50/50 dark:from-emerald-950/40 dark:via-stone-900 dark:to-amber-950/30 border-2 border-emerald-500/50 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-2.5">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </span>
          <h3 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-300 font-serif flex items-center gap-1.5 flex-wrap">
            <span>वर्तमान सक्रिय {systemLabel} (हाल चलिरहेको समय-चक्र)</span>
            {systemCycleLabel && (
              <span className="text-[11px] font-sans font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-700">
                {systemCycleLabel}
              </span>
            )}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
            आजको मिति: वि.सं. {todayBS}
          </span>
          {onJumpToActive && (
            <button
              onClick={onJumpToActive}
              className="text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg transition-colors shadow-2xs cursor-pointer"
              title="हाल सक्रिय दशा र अन्तर्दशा तालिकामा हेर्नुहोस्"
            >
              तालिकामा जानुहोस् ➔
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Active Mahadasha Block */}
        <div className="p-3 bg-white/95 dark:bg-stone-800/90 rounded-xl border border-emerald-300 dark:border-emerald-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-[10px] uppercase font-extrabold tracking-wider">
            <span>१. हाल चलिरहेको महादशा</span>
            <span className="px-2 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-[9px] font-bold">
              सक्रिय
            </span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-[#7A1C1C] dark:text-amber-400">
            {activeMahaName}
          </div>
          <div className="text-[11px] text-stone-700 dark:text-stone-300">
            चल्ने अवधि: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{toDevanagariNumerals(activeMahaStartBS)}</strong> देखि <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{toDevanagariNumerals(activeMahaEndBS)}</strong> सम्म
          </div>
        </div>

        {/* Active Antardasha Block */}
        <div className="p-3 bg-white/95 dark:bg-stone-800/90 rounded-xl border border-emerald-300 dark:border-emerald-800 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-[10px] uppercase font-extrabold tracking-wider">
            <span>२. हाल चलिरहेको अन्तर्दशा</span>
            <span className="px-2 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-[9px] font-bold">
              सक्रिय
            </span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-[#7A1C1C] dark:text-amber-400">
            {activeAntarName}
          </div>
          <div className="text-[11px] text-stone-700 dark:text-stone-300">
            चल्ने अवधि: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{toDevanagariNumerals(activeAntarStartBS)}</strong> देखि <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{toDevanagariNumerals(activeAntarEndBS)}</strong> सम्म
          </div>
        </div>
      </div>
    </div>
  );
};

export const ComprehensiveDashaPanel: React.FC<ComprehensiveDashaPanelProps> = memo(({
  dasha,
  profile,
  moon,
}) => {
  // Dropdown system selection state
  const [selectedSystem, setSelectedSystem] = useState<DashaSystemType>('vimshottari');

  // Selected Mahadasha index for each system
  const [selectedVimshottariIdx, setSelectedVimshottariIdx] = useState<number>(0);
  const [selectedTribhagiIdx, setSelectedTribhagiIdx] = useState<number>(0);
  const [selectedYoginiIdx, setSelectedYoginiIdx] = useState<number>(0);

  // Selected Cycle for multi-cycle systems (Tribhagi & Yogini)
  const [selectedTribhagiCycle, setSelectedTribhagiCycle] = useState<number | 'all'>(1);
  const [selectedYoginiCycle, setSelectedYoginiCycle] = useState<number | 'all'>(1);

  // Current Bikram Sambat date
  const todayBS = useMemo(() => {
    try {
      const now = new Date().toISOString().split('T')[0];
      return convertADToBS(now).formattedBS;
    } catch {
      return '२०८३';
    }
  }, []);

  const birthDateAD = profile.dateAD || '1995-05-15';
  const birthTimeStr = profile.time || '12:00';

  // Compute Tribhagi & Yogini calculations
  const tribhagiResult: TribhagiDashaResult = useMemo(() => {
    return calculateTribhagiDasha(moon, birthDateAD, birthTimeStr);
  }, [moon, birthDateAD, birthTimeStr]);

  const yoginiResult: YoginiDashaResult = useMemo(() => {
    return calculateYoginiDasha(moon, birthDateAD, birthTimeStr);
  }, [moon, birthDateAD, birthTimeStr]);

  // Active Vimshottari Dasha
  const activeVimshottari = useMemo(() => {
    if (!dasha?.mahadashas) return null;
    const m = dasha.mahadashas.find((item) => item.isCurrent);
    if (!m) return null;
    const ad = (m.subDashas || []).find((sub) => sub.isCurrent) || m.subDashas?.[0];
    return {
      mahadasha: m,
      antardasha: ad,
    };
  }, [dasha]);

  // Filtered Mahadashas by Cycle
  const filteredTribhagi = useMemo(() => {
    return tribhagiResult.mahadashas
      .map((m, originalIdx) => ({ m, originalIdx }))
      .filter(({ m }) => selectedTribhagiCycle === 'all' || m.cycleNumber === selectedTribhagiCycle);
  }, [tribhagiResult.mahadashas, selectedTribhagiCycle]);

  const filteredYogini = useMemo(() => {
    return yoginiResult.mahadashas
      .map((m, originalIdx) => ({ m, originalIdx }))
      .filter(({ m }) => selectedYoginiCycle === 'all' || m.cycleNumber === selectedYoginiCycle);
  }, [yoginiResult.mahadashas, selectedYoginiCycle]);

  // Set initial selected index to the current active Mahadasha on mount and on calculation update
  useEffect(() => {
    if (dasha?.mahadashas) {
      const activeIdx = dasha.mahadashas.findIndex((m) => m.isCurrent);
      if (activeIdx !== -1) setSelectedVimshottariIdx(activeIdx);
    }
    if (tribhagiResult?.mahadashas) {
      const activeIdx = tribhagiResult.mahadashas.findIndex((m) => m.isCurrent);
      if (activeIdx !== -1) {
        setSelectedTribhagiIdx(activeIdx);
        const activeM = tribhagiResult.mahadashas[activeIdx];
        if (activeM?.cycleNumber) setSelectedTribhagiCycle(activeM.cycleNumber);
      }
    }
    if (yoginiResult?.mahadashas) {
      const activeIdx = yoginiResult.mahadashas.findIndex((m) => m.isCurrent);
      if (activeIdx !== -1) {
        setSelectedYoginiIdx(activeIdx);
        const activeM = yoginiResult.mahadashas[activeIdx];
        if (activeM?.cycleNumber) setSelectedYoginiCycle(activeM.cycleNumber);
      }
    }
  }, [dasha, tribhagiResult, yoginiResult]);

  return (
    <div className="w-full bg-white dark:bg-stone-900 rounded-3xl border border-[#E6E0D5] dark:border-stone-800 p-4 sm:p-6 shadow-xs space-y-5">
      {/* 1. Header with Title & Prominent Dropdown Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E6E0D5] dark:border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#7A1C1C] text-amber-300 flex items-center justify-center font-bold shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#7A1C1C] dark:text-amber-400 font-serif">
                दशा प्रणाली तथा समय चक्र
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                {selectedSystem === 'vimshottari' && '१२० वर्ष चक्र'}
                {selectedSystem === 'tribhagi' && '४० वर्ष चक्र'}
                {selectedSystem === 'yogini' && '३६ वर्ष चक्र'}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              जन्म नक्षत्र: <strong className="text-[#2D241E] dark:text-stone-200">{moon.nakshatraName}</strong> (पाद {toDevanagariNumerals(moon.pada)}) | स्वामी: <strong className="text-[#7A1C1C] dark:text-amber-400">{moon.nakshatraLord}</strong>
            </p>
          </div>
        </div>

        {/* Dropdown System Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[#2D241E] dark:text-stone-300 shrink-0 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#7A1C1C] dark:text-amber-400" />
            <span>दशा छान्नुहोस्:</span>
          </label>
          <div className="relative">
            <select
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value as DashaSystemType)}
              className="appearance-none bg-[#FAF7F2] dark:bg-stone-800 border-2 border-[#7A1C1C]/40 dark:border-amber-500/40 text-[#7A1C1C] dark:text-amber-300 font-bold text-xs sm:text-sm py-2 pl-3 pr-9 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7A1C1C] cursor-pointer shadow-2xs"
            >
              <option value="vimshottari">विंशोत्तरी महादशा (१२० वर्ष)</option>
              <option value="tribhagi">त्रिभागी महादशा (४० वर्ष)</option>
              <option value="yogini">योगिनी महादशा (३६ वर्ष)</option>
            </select>
            <ChevronDown className="w-4 h-4 text-[#7A1C1C] dark:text-amber-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. VIMSHOTTARI DASHA VIEW */}
      {/* ========================================================================= */}
      {selectedSystem === 'vimshottari' && (
        <div className="space-y-4">
          {/* Birth Balance Overview */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-stone-800/60 border border-[#E6E0D5] dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-bold text-[#7A1C1C] dark:text-amber-300">
                विंशोत्तरी जन्म भोग्य दशा:
              </span>
              <span className="text-stone-700 dark:text-stone-300 font-medium">
                {dasha?.balanceAtBirth
                  ? `${dasha.balanceAtBirth.planet} महादशा ${toDevanagariNumerals(dasha.balanceAtBirth.yearsLeft)} वर्ष ${toDevanagariNumerals(dasha.balanceAtBirth.monthsLeft)} महिना ${toDevanagariNumerals(dasha.balanceAtBirth.daysLeft)} दिन बाँकी`
                  : `${moon.nakshatraLord} महादशा`}
              </span>
            </div>
            <span className="text-[11px] font-semibold bg-white dark:bg-stone-800 px-3 py-1 rounded-xl border border-[#E6E0D5] dark:border-stone-700 text-stone-600 dark:text-stone-300">
              कुल ९ ग्रहहरूको १२० वर्षे पूर्ण चक्र
            </span>
          </div>

          {/* Active Running Vimshottari Dasha Highlight Card */}
          {activeVimshottari && (
            <ActiveRunningDashaHighlightCard
              systemLabel="विंशोत्तरी महादशा"
              systemCycleLabel="१२० वर्ष चक्र"
              todayBS={todayBS}
              activeMahaName={`${activeVimshottari.mahadasha.planet} महादशा (${formatYears(activeVimshottari.mahadasha.durationYears || 0)} वर्ष)`}
              activeMahaStartBS={activeVimshottari.mahadasha.startDate || ''}
              activeMahaEndBS={activeVimshottari.mahadasha.endDate || ''}
              activeAntarName={`${activeVimshottari.mahadasha.planet} - ${activeVimshottari.antardasha?.planet || ''} अन्तर्दशा`}
              activeAntarStartBS={activeVimshottari.antardasha?.startDate || ''}
              activeAntarEndBS={activeVimshottari.antardasha?.endDate || ''}
              onJumpToActive={() => {
                const idx = dasha?.mahadashas?.findIndex((m) => m.isCurrent);
                if (idx !== -1 && idx !== undefined) setSelectedVimshottariIdx(idx);
              }}
            />
          )}

          {/* Mahadasha Horizontal Selector Chips */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              महादशा स्वामी छनोट गर्नुहोस्:
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
              {(dasha?.mahadashas || []).map((m, idx) => {
                const isSelected = selectedVimshottariIdx === idx;
                const isActive = m.isCurrent;
                return (
                  <button
                    key={m.planet + idx}
                    onClick={() => setSelectedVimshottariIdx(idx)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-[#7A1C1C] text-white border-[#7A1C1C] shadow-xs'
                        : 'bg-[#FAF7F2] dark:bg-stone-800/80 text-[#2D241E] dark:text-stone-300 border-[#E6E0D5] dark:border-stone-700 hover:bg-[#EAE4D9]'
                    }`}
                  >
                    <span>{m.planet} महादशा</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-amber-900/80 text-amber-200' : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                    }`}>
                      {formatYears(m.durationYears || 0)} वर्ष
                    </span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="हाल सक्रिय महादशा" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Mahadasha Detail Banner */}
          {dasha?.mahadashas && dasha.mahadashas[selectedVimshottariIdx] && (
            (() => {
              const currentM = dasha.mahadashas[selectedVimshottariIdx];
              return (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-stone-800/80 dark:to-stone-800/40 border border-amber-200 dark:border-stone-700 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#7A1C1C] text-amber-300 rounded-xl font-extrabold text-sm">
                        {currentM.planet}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#7A1C1C] dark:text-amber-300 font-serif">
                          {currentM.planet} महादशा अवधि
                        </h3>
                        <p className="text-stone-600 dark:text-stone-400">
                          कुल अवधि: <strong className="text-[#2D241E] dark:text-stone-200">{formatYears(currentM.durationYears || 0)} वर्ष</strong>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="bg-white dark:bg-stone-900 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
                        वि.सं.: <strong className="text-[#7A1C1C] dark:text-amber-300">{toDevanagariNumerals(currentM.startDate || '')}</strong> देखि <strong className="text-[#7A1C1C] dark:text-amber-300">{toDevanagariNumerals(currentM.endDate || '')}</strong>
                      </span>
                      {currentM.isCurrent && (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl font-extrabold border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>हाल सक्रिय महादशा</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Antardasha Full-Width Table */}
                  <div className="overflow-x-auto rounded-2xl border border-[#E6E0D5] dark:border-stone-800">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#FAF7F2] dark:bg-stone-800 border-b border-[#E6E0D5] dark:border-stone-700 text-[#7A1C1C] dark:text-amber-300 font-extrabold font-serif">
                          <th className="py-2.5 px-4">क्र.सं.</th>
                          <th className="py-2.5 px-4">अन्तर्दशा स्वामी</th>
                          <th className="py-2.5 px-4">प्रारम्भ मिति (वि.सं.)</th>
                          <th className="py-2.5 px-4">समाप्ति मिति (वि.सं.)</th>
                          <th className="py-2.5 px-4">स्थिति</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E6E0D5]/60 dark:divide-stone-800 text-[#2D241E] dark:text-stone-200">
                        {(currentM.subDashas || []).map((ad, adIdx) => (
                          <tr
                            key={ad.planet + adIdx}
                            className={`transition-colors ${
                              ad.isCurrent
                                ? 'bg-amber-100/70 dark:bg-amber-950/50 font-bold'
                                : 'hover:bg-[#FAF7F2]/60 dark:hover:bg-stone-800/40'
                            }`}
                          >
                            <td className="py-2.5 px-4 font-mono text-stone-500">{toDevanagariNumerals(adIdx + 1)}</td>
                            <td className="py-2.5 px-4 font-bold text-[#7A1C1C] dark:text-amber-300 flex items-center gap-2">
                              {ad.isCurrent && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                              <span>{currentM.planet} - {ad.planet}</span>
                            </td>
                            <td className="py-2.5 px-4 font-mono">{toDevanagariNumerals(ad.startDate || '')}</td>
                            <td className="py-2.5 px-4 font-mono">{toDevanagariNumerals(ad.endDate || '')}</td>
                            <td className="py-2.5 px-4">
                              {ad.isCurrent ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 inline-flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>वर्तमान सक्रिय</span>
                                </span>
                              ) : (
                                <span className="text-stone-500 dark:text-stone-400 text-[11px]">सामान्य</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TRIBHAGI DASHA VIEW */}
      {/* ========================================================================= */}
      {selectedSystem === 'tribhagi' && (
        <div className="space-y-4">
          {/* Tribhagi Overview */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-stone-800/60 border border-[#E6E0D5] dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
              <span className="font-bold text-[#7A1C1C] dark:text-amber-300">
                त्रिभागी जन्म भोग्य दशा:
              </span>
              <span className="text-stone-700 dark:text-stone-300 font-medium">
                {tribhagiResult.balanceAtBirth.formattedBalanceNepali}
              </span>
            </div>
            <span className="text-[11px] font-semibold bg-white dark:bg-stone-800 px-3 py-1 rounded-xl border border-[#E6E0D5] dark:border-stone-700 text-stone-600 dark:text-stone-300">
              प्रत्येक ग्रहको १/३ अनुपात (४० वर्ष चक्र)
            </span>
          </div>

          {/* Active Running Tribhagi Dasha Highlight Card */}
          {tribhagiResult.currentActiveDasha && (
            <ActiveRunningDashaHighlightCard
              systemLabel="त्रिभागी महादशा"
              systemCycleLabel={tribhagiResult.currentActiveDasha.cycleLabelNepali}
              todayBS={todayBS}
              activeMahaName={`${tribhagiResult.currentActiveDasha.mahadasha.planet} त्रिभागी महादशा`}
              activeMahaStartBS={tribhagiResult.currentActiveDasha.mahadasha.startDateBS}
              activeMahaEndBS={tribhagiResult.currentActiveDasha.mahadasha.endDateBS}
              activeAntarName={`${tribhagiResult.currentActiveDasha.mahadasha.planet} - ${tribhagiResult.currentActiveDasha.antardasha.planet} त्रिभागी अन्तर्दशा`}
              activeAntarStartBS={tribhagiResult.currentActiveDasha.antardasha.startDateBS}
              activeAntarEndBS={tribhagiResult.currentActiveDasha.antardasha.endDateBS}
              onJumpToActive={() => {
                if (tribhagiResult.currentActiveDasha) {
                  setSelectedTribhagiCycle(tribhagiResult.currentActiveDasha.cycleNumber);
                  setSelectedTribhagiIdx(tribhagiResult.currentActiveDasha.mahadashaIndex);
                }
              }}
            />
          )}

          {/* Mahadasha Horizontal Selector Chips with Cycle Switcher */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                त्रिभागी महादशा स्वामी छनोट गर्नुहोस्:
              </label>
              {/* Cycle Filter Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[1, 2, 3].map((cNum) => {
                  const isCurrentCycle = tribhagiResult.currentActiveDasha?.cycleNumber === cNum;
                  const isSelected = selectedTribhagiCycle === cNum;
                  const startAge = (cNum - 1) * 40;
                  const endAge = cNum * 40;
                  return (
                    <button
                      key={cNum}
                      type="button"
                      onClick={() => setSelectedTribhagiCycle(cNum)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 border cursor-pointer ${
                        isSelected
                          ? 'bg-[#7A1C1C] text-white border-[#7A1C1C] shadow-2xs'
                          : 'bg-[#FAF7F2] dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-[#E6E0D5] dark:border-stone-700 hover:bg-[#EAE4D9]'
                      }`}
                    >
                      <span>चक्र {toDevanagariNumerals(cNum)} ({toDevanagariNumerals(startAge)}-{toDevanagariNumerals(endAge)})</span>
                      {isCurrentCycle && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="वर्तमान सक्रिय चक्र" />
                      )}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setSelectedTribhagiCycle('all')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                    selectedTribhagiCycle === 'all'
                      ? 'bg-[#7A1C1C] text-white border-[#7A1C1C] shadow-2xs'
                      : 'bg-[#FAF7F2] dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-[#E6E0D5] dark:border-stone-700 hover:bg-[#EAE4D9]'
                  }`}
                >
                  सबै चक्रहरू
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
              {filteredTribhagi.map(({ m, originalIdx }) => {
                const isSelected = selectedTribhagiIdx === originalIdx;
                const isActive = m.isCurrent;
                return (
                  <button
                    key={m.planet + originalIdx}
                    onClick={() => setSelectedTribhagiIdx(originalIdx)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border cursor-pointer ${
                      isSelected
                        ? 'bg-[#7A1C1C] text-white border-[#7A1C1C] shadow-xs'
                        : isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 border-emerald-400 font-extrabold hover:bg-emerald-100'
                          : 'bg-[#FAF7F2] dark:bg-stone-800/80 text-[#2D241E] dark:text-stone-300 border-[#E6E0D5] dark:border-stone-700 hover:bg-[#EAE4D9]'
                    }`}
                  >
                    <span>{m.planet} त्रिभागी</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-amber-900/80 text-amber-200' : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                    }`}>
                      {m.durationFormattedNepali}
                    </span>
                    {isActive && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[9px] bg-emerald-500 text-stone-950 font-extrabold px-1 rounded">
                          सक्रिय
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Tribhagi Detail Banner & Table */}
          {tribhagiResult.mahadashas[selectedTribhagiIdx] && (
            (() => {
              const currentM = tribhagiResult.mahadashas[selectedTribhagiIdx];
              return (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-stone-800/80 dark:to-stone-800/40 border border-orange-200 dark:border-stone-700 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#7A1C1C] text-amber-300 rounded-xl font-extrabold text-sm">
                        {currentM.planet}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#7A1C1C] dark:text-amber-300 font-serif">
                            {currentM.planet} त्रिभागी महादशा अवधि
                          </h3>
                          <span className="text-[10px] bg-orange-100 dark:bg-orange-950/80 text-orange-900 dark:text-orange-300 font-semibold px-2 py-0.5 rounded-full border border-orange-300">
                            {currentM.cycleLabelNepali}
                          </span>
                        </div>
                        <p className="text-stone-600 dark:text-stone-400 mt-0.5">
                          अवधि: <strong className="text-[#2D241E] dark:text-stone-200">{currentM.durationFormattedNepali}</strong>
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="bg-white dark:bg-stone-900 px-3 py-1.5 rounded-xl border border-orange-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-medium">
                        वि.सं.: <strong className="text-[#7A1C1C] dark:text-amber-300 font-bold">{toDevanagariNumerals(currentM.startDateBS)}</strong> देखि <strong className="text-[#7A1C1C] dark:text-amber-300 font-bold">{toDevanagariNumerals(currentM.endDateBS)}</strong>
                      </span>
                      {currentM.isCurrent && (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl font-extrabold border border-emerald-300 flex items-center gap-1.5 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>हाल सक्रिय त्रिभागी महादशा</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Antardasha Full-Width Table */}
                  <div className="overflow-x-auto rounded-2xl border border-[#E6E0D5] dark:border-stone-800">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#FAF7F2] dark:bg-stone-800 border-b border-[#E6E0D5] dark:border-stone-700 text-[#7A1C1C] dark:text-amber-300 font-extrabold font-serif">
                          <th className="py-2.5 px-4">क्र.सं.</th>
                          <th className="py-2.5 px-4">अन्तर्दशा स्वामी</th>
                          <th className="py-2.5 px-4">प्रारम्भ मिति (वि.सं.)</th>
                          <th className="py-2.5 px-4">समाप्ति मिति (वि.सं.)</th>
                          <th className="py-2.5 px-4">अवधि (दिन)</th>
                          <th className="py-2.5 px-4">स्थिति</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E6E0D5]/60 dark:divide-stone-800 text-[#2D241E] dark:text-stone-200">
                        {currentM.subDashas.map((ad, adIdx) => (
                          <tr
                            key={ad.planet + adIdx}
                            className={`transition-colors ${
                              ad.isCurrent
                                ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-l-4 border-l-emerald-500 font-bold'
                                : 'hover:bg-[#FAF7F2]/60 dark:hover:bg-stone-800/40'
                            }`}
                          >
                            <td className="py-2.5 px-4 font-mono text-stone-500">{toDevanagariNumerals(adIdx + 1)}</td>
                            <td className="py-2.5 px-4 font-bold text-[#7A1C1C] dark:text-amber-300 flex items-center gap-2">
                              {ad.isCurrent && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                              <span>{currentM.planet} - {ad.planet}</span>
                            </td>
                            <td className="py-2.5 px-4 font-mono font-medium">{toDevanagariNumerals(ad.startDateBS)}</td>
                            <td className="py-2.5 px-4 font-mono font-medium">{toDevanagariNumerals(ad.endDateBS)}</td>
                            <td className="py-2.5 px-4 font-mono">{toDevanagariNumerals(ad.durationDays)} दिन</td>
                            <td className="py-2.5 px-4">
                              {ad.isCurrent ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-300 inline-flex items-center gap-1.5 shadow-2xs">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>वर्तमान सक्रिय</span>
                                </span>
                              ) : (
                                <span className="text-stone-500 dark:text-stone-400 text-[11px]">सामान्य</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. YOGINI DASHA VIEW */}
      {/* ========================================================================= */}
      {selectedSystem === 'yogini' && (
        <div className="space-y-4">
          {/* Yogini Overview */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-stone-800/60 border border-[#E6E0D5] dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-bold text-[#7A1C1C] dark:text-amber-300">
                योगिनी जन्म भोग्य दशा:
              </span>
              <span className="text-stone-700 dark:text-stone-300 font-medium">
                {yoginiResult.balanceAtBirth.formattedBalanceNepali}
              </span>
            </div>
            <span className="text-[11px] font-semibold bg-white dark:bg-stone-800 px-3 py-1 rounded-xl border border-[#E6E0D5] dark:border-stone-700 text-stone-600 dark:text-stone-300">
              ८ योगिनीहरूको ३६ वर्षे पूर्ण चक्र
            </span>
          </div>

          {/* Active Running Yogini Dasha Highlight Card */}
          {yoginiResult.currentActiveDasha && (
            <ActiveRunningDashaHighlightCard
              systemLabel="योगिनी महादशा"
              systemCycleLabel={yoginiResult.currentActiveDasha.cycleLabelNepali}
              todayBS={todayBS}
              activeMahaName={`${yoginiResult.currentActiveDasha.mahadasha.yogini.name} योगिनी महादशा (स्वामी: ${yoginiResult.currentActiveDasha.mahadasha.yogini.lord})`}
              activeMahaStartBS={yoginiResult.currentActiveDasha.mahadasha.startDateBS}
              activeMahaEndBS={yoginiResult.currentActiveDasha.mahadasha.endDateBS}
              activeAntarName={`${yoginiResult.currentActiveDasha.mahadasha.yogini.name} - ${yoginiResult.currentActiveDasha.antardasha.yogini.name} योगिनी अन्तर्दशा (स्वामी: ${yoginiResult.currentActiveDasha.antardasha.yogini.lord})`}
              activeAntarStartBS={yoginiResult.currentActiveDasha.antardasha.startDateBS}
              activeAntarEndBS={yoginiResult.currentActiveDasha.antardasha.endDateBS}
              onJumpToActive={() => {
                if (yoginiResult.currentActiveDasha) {
                  setSelectedYoginiCycle(yoginiResult.currentActiveDasha.cycleNumber);
                  setSelectedYoginiIdx(yoginiResult.currentActiveDasha.mahadashaIndex);
                }
              }}
            />
          )}

          {/* Mahadasha Horizontal Selector Chips with Cycle Switcher */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                योगिनी महादशा छनोट गर्नुहोस्:
              </label>
              {/* Cycle Filter Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[1, 2, 3].map((cNum) => {
                  const isCurrentCycle = yoginiResult.currentActiveDasha?.cycleNumber === cNum;
                  const isSelected = selectedYoginiCycle === cNum;
                  const startAge = (cNum - 1) * 36;
                  const endAge = cNum * 36;
                  return (
                    <button
                      key={cNum}
                      type="button"
                      onClick={() => setSelectedYoginiCycle(cNum)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 border cursor-pointer ${
                        isSelected
                          ? 'bg-[#7A1C1C] text-white border-[#7A1C1C] shadow-2xs'
                          : 'bg-[#FAF7F2] dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-[#E6E0D5] dark:border-stone-700 hover:bg-[#EAE4D9]'
                      }`}
                    >
                      <span>चक्र {toDevanagariNumerals(cNum)} ({toDevanagariNumerals(startAge)}-{toDevanagariNumerals(endAge)})</span>
                      {isCurrentCycle && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="वर्तमान सक्रिय चक्र" />
                      )}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setSelectedYoginiCycle('all')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                    selectedYoginiCycle === 'all'
                      ? 'bg-[#7A1C1C] text-white border-[#7A1C1C] shadow-2xs'
                      : 'bg-[#FAF7F2] dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-[#E6E0D5] dark:border-stone-700 hover:bg-[#EAE4D9]'
                  }`}
                >
                  सबै चक्रहरू
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
              {filteredYogini.map(({ m, originalIdx }) => {
                const isSelected = selectedYoginiIdx === originalIdx;
                const isActive = m.isCurrent;
                return (
                  <button
                    key={m.yogini.name + originalIdx}
                    onClick={() => setSelectedYoginiIdx(originalIdx)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border cursor-pointer ${
                      isSelected
                        ? 'bg-[#7A1C1C] text-white border-[#7A1C1C] shadow-xs'
                        : isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 border-emerald-400 font-extrabold hover:bg-emerald-100'
                          : 'bg-[#FAF7F2] dark:bg-stone-800/80 text-[#2D241E] dark:text-stone-300 border-[#E6E0D5] dark:border-stone-700 hover:bg-[#EAE4D9]'
                    }`}
                  >
                    <span>{m.yogini.name} ({m.yogini.lord})</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-amber-900/80 text-amber-200' : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
                    }`}>
                      {m.durationFormattedNepali}
                    </span>
                    {isActive && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[9px] bg-emerald-500 text-stone-950 font-extrabold px-1 rounded">
                          सक्रिय
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Yogini Detail Banner & Table */}
          {yoginiResult.mahadashas[selectedYoginiIdx] && (
            (() => {
              const currentM = yoginiResult.mahadashas[selectedYoginiIdx];
              return (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-stone-800/80 dark:to-stone-800/40 border border-emerald-200 dark:border-stone-700 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#7A1C1C] text-amber-300 rounded-xl font-extrabold text-sm">
                        {currentM.yogini.name}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#7A1C1C] dark:text-amber-300 font-serif">
                            {currentM.yogini.name} योगिनी महादशा (स्वामी: {currentM.yogini.lord})
                          </h3>
                          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-300">
                            {currentM.cycleLabelNepali}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            currentM.yogini.nature === 'अतिशुभ' || currentM.yogini.nature === 'सौम्य'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                          }`}>
                            {currentM.yogini.nature}
                          </span>
                        </div>
                        <p className="text-stone-600 dark:text-stone-400 mt-0.5">
                          {currentM.yogini.resultDescription}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="bg-white dark:bg-stone-900 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
                        वि.सं.: <strong className="text-[#7A1C1C] dark:text-amber-300">{toDevanagariNumerals(currentM.startDateBS)}</strong> देखि <strong className="text-[#7A1C1C] dark:text-amber-300">{toDevanagariNumerals(currentM.endDateBS)}</strong>
                      </span>
                      {currentM.isCurrent && (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 rounded-xl font-extrabold border border-emerald-300 flex items-center gap-1.5 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>हाल सक्रिय योगिनी महादशा</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Antardasha Full-Width Table */}
                  <div className="overflow-x-auto rounded-2xl border border-[#E6E0D5] dark:border-stone-800">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#FAF7F2] dark:bg-stone-800 border-b border-[#E6E0D5] dark:border-stone-700 text-[#7A1C1C] dark:text-amber-300 font-extrabold font-serif">
                          <th className="py-2.5 px-4">क्र.सं.</th>
                          <th className="py-2.5 px-4">अन्तर्दशा योगिनी</th>
                          <th className="py-2.5 px-4">स्वामी ग्रह</th>
                          <th className="py-2.5 px-4">प्रारम्भ मिति (वि.सं.)</th>
                          <th className="py-2.5 px-4">समाप्ति मिति (वि.सं.)</th>
                          <th className="py-2.5 px-4">अवधि</th>
                          <th className="py-2.5 px-4">स्थिति</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E6E0D5]/60 dark:divide-stone-800 text-[#2D241E] dark:text-stone-200">
                        {currentM.subDashas.map((ad, adIdx) => (
                          <tr
                            key={ad.yogini.name + adIdx}
                            className={`transition-colors ${
                              ad.isCurrent
                                ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-l-4 border-l-emerald-500 font-bold'
                                : 'hover:bg-[#FAF7F2]/60 dark:hover:bg-stone-800/40'
                            }`}
                          >
                            <td className="py-2.5 px-4 font-mono text-stone-500">{toDevanagariNumerals(adIdx + 1)}</td>
                            <td className="py-2.5 px-4 font-bold text-[#7A1C1C] dark:text-amber-300 flex items-center gap-2">
                              {ad.isCurrent && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                              <span>{currentM.yogini.name} - {ad.yogini.name}</span>
                            </td>
                            <td className="py-2.5 px-4 font-bold text-stone-700 dark:text-stone-300">{ad.yogini.lord}</td>
                            <td className="py-2.5 px-4 font-mono font-medium">{toDevanagariNumerals(ad.startDateBS)}</td>
                            <td className="py-2.5 px-4 font-mono font-medium">{toDevanagariNumerals(ad.endDateBS)}</td>
                            <td className="py-2.5 px-4 font-mono">
                              {toDevanagariNumerals(ad.durationMonths)} महिना ({toDevanagariNumerals(ad.durationDays)} दिन)
                            </td>
                            <td className="py-2.5 px-4">
                              {ad.isCurrent ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-300 inline-flex items-center gap-1.5 shadow-2xs">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>वर्तमान सक्रिय</span>
                                </span>
                              ) : (
                                <span className="text-stone-500 dark:text-stone-400 text-[11px]">सामान्य</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
});
