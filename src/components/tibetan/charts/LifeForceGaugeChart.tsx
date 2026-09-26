/**
 * Tibetan Life Force Gauge Chart (सोग, लु, वाङ, लुङता र ला)
 * Multi-dimensional vitality bars and overall vitality indicator
 * Brihat Jyotish Professional ERP
 */

import React from 'react';
import { TibetanLifeForces } from '../../../types/tibetanAstrology';
import { toDevanagariNumerals } from '../../../utils/nepaliCalendar';

interface LifeForceGaugeChartProps {
  lifeForces: TibetanLifeForces;
}

export const LifeForceGaugeChart: React.FC<LifeForceGaugeChartProps> = ({ lifeForces }) => {
  const dimensions = [
    { key: 'sog', data: lifeForces.sog, icon: '❤️' },
    { key: 'lu', data: lifeForces.lu, icon: '🛡️' },
    { key: 'wang', data: lifeForces.wang, icon: '👑' },
    { key: 'lungta', data: lifeForces.lungta, icon: '🐎' },
    { key: 'la', data: lifeForces.la, icon: '✨' }
  ];

  const getProgressColor = (percent: number) => {
    if (percent >= 80) return 'bg-emerald-500';
    if (percent >= 65) return 'bg-blue-500';
    if (percent >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Overall Score Header */}
      <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent dark:from-amber-950/30 dark:via-orange-950/20 rounded-xl border border-amber-200 dark:border-amber-800/60">
        <div>
          <span className="text-xs font-semibold text-amber-900 dark:text-amber-300">
            समग्र जीवन-ऊर्जा सूचकाङ्क (Overall Vitality)
          </span>
          <div className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mt-0.5">
            <span>{lifeForces.overallVitalityStatusNepali}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-full border-4 border-amber-500 flex items-center justify-center bg-white dark:bg-slate-900 shadow-sm font-bold text-base text-amber-700 dark:text-amber-400">
            {toDevanagariNumerals(lifeForces.overallVitalityScore)}%
          </div>
        </div>
      </div>

      {/* 5 Dimensions Progress Bars */}
      <div className="flex flex-col gap-3">
        {dimensions.map(({ key, data, icon }) => (
          <div
            key={key}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <span>{icon}</span>
                <span>{data.titleNepali}</span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-normal"
                  style={{
                    backgroundColor: data.element.hexColor + '20',
                    color: data.element.hexColor
                  }}
                >
                  {data.element.nameNepali.split(' ')[0]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  {data.levelNepali}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {toDevanagariNumerals(data.strengthPercentage)}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                  data.strengthPercentage
                )}`}
                style={{ width: `${data.strengthPercentage}%` }}
              ></div>
            </div>

            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>{data.dimensionMeaning}</span>
              <span className="italic">सम्बन्ध: {data.relationWithYearElement}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
