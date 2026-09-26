import React, { memo } from 'react';
import { Globe2, AlertTriangle, CheckCircle2, Moon, Compass } from 'lucide-react';
import { PlanetPosition } from '../../types/astrology';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';

interface TransitViewProps {
  moon: PlanetPosition;
  transitPlanets: PlanetPosition[];
}

export const TransitView: React.FC<TransitViewProps> = memo(({
  moon,
  transitPlanets,
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#E6E0D5] dark:border-stone-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#7A1C1C] text-amber-300 flex items-center justify-center font-bold">
              <Globe2 className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-[#7A1C1C] dark:text-amber-400 font-serif">
              ग्रह गोचर तथा साढेसाती विश्लेषण (Transit Analysis)
            </h3>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
            चन्द्र राशि: {moon.rashiName}
          </span>
        </div>

        {/* Sade Sati Card */}
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-800/80 space-y-1.5 text-xs">
          <div className="flex items-center justify-between font-bold text-amber-950 dark:text-amber-200">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>शनि साढेसाती तथा ढैय्या अवस्था:</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-bold">
              प्रथम/मध्य चरण (कुम्भ-मीन गोचर)
            </span>
          </div>
          <p className="text-amber-900/90 dark:text-amber-300/90">
            वर्तमानमा शनि महाराजको गोचर स्थिति अनुकूल स्थानमा रहेकाले धैर्य, लगनशीलता र अनुशासनका साथ अघि बढ्नु शुभ मानिन्छ।
          </p>
        </div>
      </div>

      {/* Transit Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 p-4 shadow-xs space-y-3">
        <h4 className="font-extrabold text-[#7A1C1C] dark:text-amber-300 border-b border-[#E6E0D5] dark:border-stone-800 pb-2 text-xs">
          वर्तमान गोचर ग्रह स्थिति तथा फल तालिका
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] dark:bg-stone-800 border-b border-[#E6E0D5] dark:border-stone-700 text-[#7A1C1C] dark:text-amber-300 font-extrabold font-serif">
                <th className="py-2 px-3">ग्रह</th>
                <th className="py-2 px-3">वर्तमान गोचर राशि</th>
                <th className="py-2 px-3">चन्द्रमाबाट भाव</th>
                <th className="py-2 px-3">गोचर फल</th>
                <th className="py-2 px-3">प्रभाव अवस्था</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E0D5]/60 dark:divide-stone-800 text-[#2D241E] dark:text-stone-200">
              {transitPlanets.map((p, idx) => {
                const houseFromMoon = ((p.rashiId - moon.rashiId + 12) % 12) + 1;
                const isGood = [3, 6, 10, 11].includes(houseFromMoon);

                return (
                  <tr key={idx} className="hover:bg-[#FAF7F2]/60 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="py-2 px-3 font-bold text-[#7A1C1C] dark:text-amber-300">{p.name}</td>
                    <td className="py-2 px-3 font-semibold">{p.rashiName}</td>
                    <td className="py-2 px-3 font-bold">{toDevanagariNumerals(houseFromMoon)} भाव</td>
                    <td className="py-2 px-3 font-medium">
                      {isGood
                        ? 'अनुकूल स्थान, सफलता तथा धन लाभ'
                        : 'सामान्य स्थान, कार्यमा केही ढिलाइ वा सजगता'}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isGood
                            ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {isGood ? 'शुभ फल' : 'मध्यम फल'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});
