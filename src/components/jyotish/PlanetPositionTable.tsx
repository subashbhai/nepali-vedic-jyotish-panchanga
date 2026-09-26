import React, { memo } from 'react';
import { Globe2 } from 'lucide-react';
import { LagnaInfo, PlanetPosition } from '../../types/astrology';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';

interface PlanetPositionTableProps {
  lagna: LagnaInfo;
  planets: PlanetPosition[];
}

export const PlanetPositionTable: React.FC<PlanetPositionTableProps> = memo(({
  lagna,
  planets,
}) => {
  // Construct complete row list including Lagna and 9 Planets
  const rows = [
    {
      name: 'लग्न',
      rashiName: lagna.rashiName,
      formattedDegree: lagna.formattedDegree || `${toDevanagariNumerals(Math.floor(lagna.degree || 0))}° ००′`,
      nakshatraName: lagna.nakshatraName,
      pada: toDevanagariNumerals(lagna.pada || 1),
      motion: 'मार्गी',
      dignity: 'शुभ',
    },
    ...planets.map((p) => ({
      name: p.name,
      rashiName: p.rashiName,
      formattedDegree: p.formattedDegree || `${toDevanagariNumerals(p.degree)}° ${toDevanagariNumerals(p.minutes)}′`,
      nakshatraName: p.nakshatraName,
      pada: toDevanagariNumerals(p.pada || 1),
      motion: p.isRetrograde ? 'वक्री' : 'मार्गी',
      dignity: p.dignity || 'सम',
    })),
  ];

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-xs space-y-3">
      {/* Table Header */}
      <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#7A1C1C] text-amber-300 flex items-center justify-center font-bold">
            <Globe2 className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-[#7A1C1C] dark:text-amber-400 font-serif">
            ग्रह स्थिति (Planetary Positions)
          </h3>
        </div>
        <span className="text-[11px] text-stone-500 font-medium">निरयण सायन आधार</span>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#FAF7F2] dark:bg-stone-800 border-b border-[#E6E0D5] dark:border-stone-700 text-[#7A1C1C] dark:text-amber-300 font-extrabold font-serif">
              <th className="py-2 px-3">ग्रह</th>
              <th className="py-2 px-3">राशि</th>
              <th className="py-2 px-3">अंश (Degree)</th>
              <th className="py-2 px-3">नक्षत्र</th>
              <th className="py-2 px-3">पाद</th>
              <th className="py-2 px-3">गति</th>
              <th className="py-2 px-3">अवस्था</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6E0D5]/60 dark:divide-stone-800 text-[#2D241E] dark:text-stone-200">
            {rows.map((r, idx) => (
              <tr key={idx} className="hover:bg-[#FAF7F2]/60 dark:hover:bg-stone-800/40 transition-colors">
                <td className="py-2 px-3 font-bold text-[#7A1C1C] dark:text-amber-300">
                  {r.name}
                </td>
                <td className="py-2 px-3 font-semibold">{r.rashiName}</td>
                <td className="py-2 px-3 font-mono text-stone-700 dark:text-stone-300">{r.formattedDegree}</td>
                <td className="py-2 px-3">{r.nakshatraName}</td>
                <td className="py-2 px-3 font-bold">{r.pada}</td>
                <td className="py-2 px-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.motion === 'वक्री'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                        : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                    }`}
                  >
                    {r.motion}
                  </span>
                </td>
                <td className="py-2 px-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.dignity === 'उच्च'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : r.dignity === 'नीच'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {r.dignity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
