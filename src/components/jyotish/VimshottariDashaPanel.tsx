import React, { useState, memo } from 'react';
import { Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { VimshottariDashaResult } from '../../types/astrology';
import { toDevanagariNumerals, formatYears } from '../../utils/nepaliCalendar';

interface VimshottariDashaPanelProps {
  dasha?: VimshottariDashaResult;
}

export const VimshottariDashaPanel: React.FC<VimshottariDashaPanelProps> = memo(({ dasha }) => {
  const [selectedMahaIndex, setSelectedMahaIndex] = useState<number>(0);

  if (!dasha || !dasha.mahadashas || dasha.mahadashas.length === 0) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-xs text-xs text-stone-500 text-center">
        विंशोत्तरी दशा गणना उपलब्ध छैन।
      </div>
    );
  }

  const selectedMaha = dasha.mahadashas[selectedMahaIndex] || dasha.mahadashas[0];

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-xs space-y-3">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#7A1C1C] text-amber-300 flex items-center justify-center font-bold">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-[#7A1C1C] dark:text-amber-400 font-serif">
            विंशोत्तरी महादशा चक्र (१२० वर्ष)
          </h3>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          विंशोत्तरी दशा चक्र
        </span>
      </div>

      {/* Mahadasha Selector Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {dasha.mahadashas.map((m, idx) => {
          const isSelected = selectedMahaIndex === idx;
          const isActive = m.isCurrent;
          return (
            <button
              key={m.planet + idx}
              onClick={() => setSelectedMahaIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#7A1C1C] text-white shadow-2xs'
                  : 'bg-[#FAF7F2] dark:bg-stone-800 text-[#2D241E] dark:text-stone-300 hover:bg-[#EAE4D9]'
              }`}
            >
              <span>{m.planet}</span>
              {isActive && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Mahadasha Overview Card */}
      <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-stone-800/60 border border-[#E6E0D5] dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div>
          <span className="text-stone-500 dark:text-stone-400 font-medium">महादशा स्वामी: </span>
          <span className="font-extrabold text-[#7A1C1C] dark:text-amber-300 text-sm">
            {selectedMaha.planet} ({formatYears(selectedMaha.durationYears || 0)} वर्ष)
          </span>
        </div>
        <div className="text-stone-700 dark:text-stone-300 font-semibold">
          अवधि: <span className="text-[#7A1C1C] dark:text-amber-300 font-bold">{toDevanagariNumerals(selectedMaha.startDate || '')}</span> देखि <span className="text-[#7A1C1C] dark:text-amber-300 font-bold">{toDevanagariNumerals(selectedMaha.endDate || '')}</span>
        </div>
      </div>

      {/* Antardasha Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#FAF7F2] dark:bg-stone-800 border-b border-[#E6E0D5] dark:border-stone-700 text-[#7A1C1C] dark:text-amber-300 font-extrabold font-serif">
              <th className="py-2 px-3">अन्तर्दशा स्वामी</th>
              <th className="py-2 px-3">प्रारम्भ मिति</th>
              <th className="py-2 px-3">समाप्ति मिति</th>
              <th className="py-2 px-3">स्थिति</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E0D5]/60 dark:divide-stone-800 text-[#2D241E] dark:text-stone-200">
            {(selectedMaha.subDashas || []).map((ad, idx) => (
              <tr
                key={ad.planet + idx}
                className={`transition-colors ${
                  ad.isCurrent
                    ? 'bg-amber-100/70 dark:bg-amber-950/50 font-bold'
                    : 'hover:bg-[#FAF7F2]/60 dark:hover:bg-stone-800/40'
                }`}
              >
                <td className="py-2 px-3 font-bold text-[#7A1C1C] dark:text-amber-300 flex items-center gap-1.5">
                  {ad.isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                  <span>{selectedMaha.planet} - {ad.planet}</span>
                </td>
                <td className="py-2 px-3 font-mono">{toDevanagariNumerals(ad.startDate || '')}</td>
                <td className="py-2 px-3 font-mono">{toDevanagariNumerals(ad.endDate || '')}</td>
                <td className="py-2 px-3">
                  {ad.isCurrent ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300">
                      हाल सक्रिय
                    </span>
                  ) : (
                    <span className="text-stone-500 dark:text-stone-400 text-[10px]">सामान्य</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
