/**
 * Tibetan Birth Mandala Chart (सिपाहो / जन्म मण्डल चार्ट)
 * Features 12 Animals circle, 8 Parkha octagram, and 9 Mewa Magic Square
 * Brihat Jyotish Professional ERP
 */

import React from 'react';
import { TibetanYearInfo, TibetanMewa, TibetanParkha } from '../../../types/tibetanAstrology';
import { ANIMAL_ORDER, TIBETAN_ANIMALS } from '../../../core/tibetan/tibetanCalendarEngine';
import { PARKHA_ORDER, TIBETAN_PARKHA_LIST } from '../../../core/tibetan/parkhaEngine';
import { toDevanagariNumerals } from '../../../utils/nepaliCalendar';

interface TibetanBirthMandalaChartProps {
  yearInfo: TibetanYearInfo;
  mewa: TibetanMewa;
  parkha: TibetanParkha;
  size?: number;
}

export const TibetanBirthMandalaChart: React.FC<TibetanBirthMandalaChartProps> = ({
  yearInfo,
  mewa,
  parkha,
  size = 460
}) => {
  const center = size / 2;
  const outerRadius = size * 0.46;
  const parkhaRadius = size * 0.32;
  const mewaBoxSize = size * 0.28;

  // 12 Animals around the perimeter
  const animalSectors = ANIMAL_ORDER.map((animalId, index) => {
    const angle = (index * 30 - 90) * (Math.PI / 180);
    const angleDeg = index * 30 - 90;
    const x = center + (outerRadius - 22) * Math.cos(angle);
    const y = center + (outerRadius - 22) * Math.sin(angle);
    const animal = TIBETAN_ANIMALS[animalId];
    const isClientAnimal = animal.id === yearInfo.animal.id;

    return {
      animal,
      index,
      x,
      y,
      angleDeg,
      isClientAnimal
    };
  });

  // 8 Parkha around the middle ring
  const parkhaSectors = PARKHA_ORDER.map((pId, index) => {
    const angle = (index * 45 - 90) * (Math.PI / 180);
    const x = center + (parkhaRadius - 16) * Math.cos(angle);
    const y = center + (parkhaRadius - 16) * Math.sin(angle);
    const p = TIBETAN_PARKHA_LIST[pId];
    const isClientParkha = p.id === parkha.id;

    return {
      p,
      x,
      y,
      isClientParkha
    };
  });

  // 3x3 Mewa Grid mapping (Lo Shu square standard):
  // 4, 9, 2
  // 3, 5, 7
  // 8, 1, 6
  const mewaGrid = [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6]
  ];

  const mewaColors: Record<number, { bg: string; text: string }> = {
    1: { bg: '#F1F5F9', text: '#334155' },
    2: { bg: '#1E293B', text: '#F8FAFC' },
    3: { bg: '#2563EB', text: '#FFFFFF' },
    4: { bg: '#16A34A', text: '#FFFFFF' },
    5: { bg: '#EAB308', text: '#713F12' },
    6: { bg: '#E2E8F0', text: '#1E293B' },
    7: { bg: '#DC2626', text: '#FFFFFF' },
    8: { bg: '#F8FAFC', text: '#0F172A' },
    9: { bg: '#B91C1C', text: '#FFFFFF' }
  };

  const cellDim = mewaBoxSize / 3;
  const startX = center - mewaBoxSize / 2;
  const startY = center - mewaBoxSize / 2;

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-gradient-to-b from-amber-50/50 via-white to-orange-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-amber-950/20 rounded-2xl border border-amber-200/70 dark:border-amber-900/40 shadow-sm">
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="select-none overflow-visible max-w-full h-auto"
        >
          <defs>
            <radialGradient id="mandalaBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFBEB" stopOpacity="1" />
              <stop offset="70%" stopColor="#FEF3C7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.6" />
            </radialGradient>
            <filter id="goldenGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#D97706" floodOpacity="0.35" />
            </filter>
            <filter id="activeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#EA580C" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Base Background Circles */}
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="url(#mandalaBg)"
            stroke="#D97706"
            strokeWidth="3"
            filter="url(#goldenGlow)"
            className="dark:fill-slate-900 dark:stroke-amber-600"
          />

          <circle
            cx={center}
            cy={center}
            r={outerRadius - 38}
            fill="none"
            stroke="#B45309"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            className="dark:stroke-amber-500/70"
          />

          <circle
            cx={center}
            cy={center}
            r={parkhaRadius + 14}
            fill="#FEF3C7"
            stroke="#D97706"
            strokeWidth="2"
            className="dark:fill-slate-800/90 dark:stroke-amber-600"
          />

          {/* 12 Animal Sectors */}
          {animalSectors.map((s) => (
            <g key={s.animal.id} className="transition-transform duration-300">
              {s.isClientAnimal && (
                <circle
                  cx={s.x}
                  cy={s.y}
                  r="20"
                  fill="#FEF08A"
                  stroke="#EA580C"
                  strokeWidth="2.5"
                  filter="url(#activeGlow)"
                  className="dark:fill-amber-900/60 dark:stroke-amber-400 animate-pulse"
                />
              )}
              <circle
                cx={s.x}
                cy={s.y}
                r={s.isClientAnimal ? '18' : '15'}
                fill={s.isClientAnimal ? '#F97316' : '#FFFBEB'}
                stroke={s.isClientAnimal ? '#C2410C' : '#D97706'}
                strokeWidth={s.isClientAnimal ? '2' : '1'}
                className={s.isClientAnimal ? 'dark:fill-amber-600' : 'dark:fill-slate-800 dark:stroke-amber-600/70'}
              />
              <text
                x={s.x}
                y={s.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={s.isClientAnimal ? '10' : '9'}
                fontWeight={s.isClientAnimal ? 'bold' : 'normal'}
                fill={s.isClientAnimal ? '#FFFFFF' : '#78350F'}
                className={s.isClientAnimal ? 'font-bold' : 'dark:fill-amber-200'}
              >
                {s.animal.nameNepali.split(' ')[0]}
              </text>
            </g>
          ))}

          {/* 8 Parkha Ring */}
          {parkhaSectors.map((p) => (
            <g key={p.p.id}>
              {p.isClientParkha && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="18"
                  fill="#FED7AA"
                  stroke="#F97316"
                  strokeWidth="2"
                  filter="url(#activeGlow)"
                  className="dark:fill-orange-950 dark:stroke-orange-500"
                />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={p.isClientParkha ? '15' : '13'}
                fill={p.isClientParkha ? '#EA580C' : '#FEF3C7'}
                stroke={p.isClientParkha ? '#9A3412' : '#B45309'}
                strokeWidth="1.2"
                className={p.isClientParkha ? 'dark:fill-orange-600' : 'dark:fill-slate-800 dark:stroke-amber-500/80'}
              />
              <text
                x={p.x}
                y={p.y - 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={p.isClientParkha ? '11' : '10'}
                fill={p.isClientParkha ? '#FFFFFF' : '#92400E'}
                className={p.isClientParkha ? 'font-bold' : 'dark:fill-amber-300'}
              >
                {p.p.trigramSymbol}
              </text>
            </g>
          ))}

          {/* Inner Central 3x3 Mewa Square */}
          <g transform={`translate(${startX}, ${startY})`}>
            <rect
              x="0"
              y="0"
              width={mewaBoxSize}
              height={mewaBoxSize}
              fill="#FFFFFF"
              stroke="#B45309"
              strokeWidth="2.5"
              rx="6"
              filter="url(#goldenGlow)"
              className="dark:fill-slate-900 dark:stroke-amber-600"
            />
            {mewaGrid.map((row, rIdx) =>
              row.map((cellNum, cIdx) => {
                const cellX = cIdx * cellDim;
                const cellY = rIdx * cellDim;
                const isNatalMewa = cellNum === mewa.number;
                const styling = mewaColors[cellNum] || { bg: '#E2E8F0', text: '#0F172A' };

                return (
                  <g key={`${rIdx}-${cIdx}`}>
                    <rect
                      x={cellX + 1}
                      y={cellY + 1}
                      width={cellDim - 2}
                      height={cellDim - 2}
                      rx="3"
                      fill={styling.bg}
                      stroke={isNatalMewa ? '#F97316' : '#CBD5E1'}
                      strokeWidth={isNatalMewa ? '2.5' : '0.8'}
                      className={isNatalMewa ? 'dark:stroke-amber-400' : ''}
                    />
                    {isNatalMewa && (
                      <circle
                        cx={cellX + cellDim / 2}
                        cy={cellY + cellDim / 2}
                        r={cellDim / 2 - 4}
                        fill="none"
                        stroke="#EA580C"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                    )}
                    <text
                      x={cellX + cellDim / 2}
                      y={cellY + cellDim / 2 + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="14"
                      fontWeight="bold"
                      fill={styling.text}
                    >
                      {toDevanagariNumerals(cellNum)}
                    </text>
                  </g>
                );
              })
            )}
          </g>
        </svg>
      </div>

      {/* Legend & Summary Footer */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
          <span className="w-2 h-2 rounded-full bg-orange-600"></span>
          जन्म राशि: <strong>{yearInfo.animal.nameNepali}</strong>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-900 dark:text-orange-200 border border-orange-300 dark:border-orange-700">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          पार्खा: <strong>{parkha.nameNepali.split(' ')[0]} ({parkha.trigramSymbol})</strong>
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700">
          <span className="w-2 h-2 rounded-full bg-yellow-600"></span>
          मेवा: <strong>{toDevanagariNumerals(mewa.number)} ({mewa.nameNepali.split(' ')[1]})</strong>
        </span>
      </div>
    </div>
  );
};
