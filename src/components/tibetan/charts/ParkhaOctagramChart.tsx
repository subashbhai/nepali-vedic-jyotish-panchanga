/**
 * Tibetan 8 Parkha Octagram Trigram Chart (८ पार्खा चक्र)
 * Brihat Jyotish Professional ERP
 */

import React from 'react';
import { TibetanParkha } from '../../../types/tibetanAstrology';
import { PARKHA_ORDER, TIBETAN_PARKHA_LIST } from '../../../core/tibetan/parkhaEngine';

interface ParkhaOctagramChartProps {
  natalParkha: TibetanParkha;
  size?: number;
}

export const ParkhaOctagramChart: React.FC<ParkhaOctagramChartProps> = ({
  natalParkha,
  size = 380
}) => {
  const center = size / 2;
  const radius = size * 0.38;

  // 8 Parkha octagram nodes (Li at Top/South, etc.)
  const nodes = PARKHA_ORDER.map((pId, idx) => {
    // 8 points: idx * 45 - 90 deg
    const angle = (idx * 45 - 90) * (Math.PI / 180);
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    const p = TIBETAN_PARKHA_LIST[pId];
    const isNatal = p.id === natalParkha.id;

    return {
      p,
      x,
      y,
      isNatal
    };
  });

  return (
    <div className="flex flex-col items-center p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="select-none overflow-visible max-w-full h-auto"
        >
          <defs>
            <radialGradient id="octaBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0.3" />
            </radialGradient>
          </defs>

          {/* Background Octagram Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="url(#octaBg)"
            stroke="#E2E8F0"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            className="dark:fill-slate-800/40 dark:stroke-slate-700"
          />

          {/* Central Parkha Info Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius * 0.42}
            fill="#FFFFFF"
            stroke="#D97706"
            strokeWidth="2"
            className="dark:fill-slate-800 dark:stroke-amber-500"
          />
          <text
            x={center}
            y={center - 12}
            textAnchor="middle"
            fontSize="18"
            fontWeight="bold"
            fill="#B45309"
            className="dark:fill-amber-400"
          >
            {natalParkha.trigramSymbol}
          </text>
          <text
            x={center}
            y={center + 8}
            textAnchor="middle"
            fontSize="11"
            fontWeight="bold"
            fill="#1E293B"
            className="dark:fill-slate-200"
          >
            तपाईंको पार्खा: {natalParkha.nameNepali.split(' ')[0]}
          </text>
          <text
            x={center}
            y={center + 23}
            textAnchor="middle"
            fontSize="9"
            fill="#64748B"
            className="dark:fill-slate-400"
          >
            {natalParkha.element.nameNepali.split(' ')[0]} • {natalParkha.directionNepali.split(' ')[0]}
          </text>

          {/* Octagon connecting lines */}
          {nodes.map((n, idx) => {
            const nextNode = nodes[(idx + 1) % nodes.length];
            return (
              <line
                key={`octa-line-${idx}`}
                x1={n.x}
                y1={n.y}
                x2={nextNode.x}
                y2={nextNode.y}
                stroke="#CBD5E1"
                strokeWidth="1.2"
                className="dark:stroke-slate-700"
              />
            );
          })}

          {/* Connecting lines from center to nodes */}
          {nodes.map((n, idx) => (
            <line
              key={`spoke-${idx}`}
              x1={center}
              y1={center}
              x2={n.x}
              y2={n.y}
              stroke={n.isNatal ? '#F97316' : '#E2E8F0'}
              strokeWidth={n.isNatal ? '2' : '1'}
              strokeDasharray={n.isNatal ? 'none' : '2 2'}
              className={n.isNatal ? 'dark:stroke-amber-400' : 'dark:stroke-slate-700'}
            />
          ))}

          {/* Nodes */}
          {nodes.map((node) => (
            <g key={node.p.id} className="cursor-pointer">
              {node.isNatal && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="26"
                  fill="#FED7AA"
                  stroke="#EA580C"
                  strokeWidth="2.5"
                  className="dark:fill-orange-950 dark:stroke-orange-500 animate-pulse"
                />
              )}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.isNatal ? '22' : '19'}
                fill={node.isNatal ? '#EA580C' : '#F8FAFC'}
                stroke={node.isNatal ? '#C2410C' : '#94A3B8'}
                strokeWidth={node.isNatal ? '2' : '1'}
                className={node.isNatal ? 'dark:fill-orange-600' : 'dark:fill-slate-800 dark:stroke-slate-600'}
              />
              <text
                x={node.x}
                y={node.y - 3}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={node.isNatal ? '14' : '12'}
                fontWeight="bold"
                fill={node.isNatal ? '#FFFFFF' : '#1E293B'}
                className={node.isNatal ? 'font-bold' : 'dark:fill-slate-200'}
              >
                {node.p.trigramSymbol}
              </text>
              <text
                x={node.x}
                y={node.y + 9}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
                fontWeight={node.isNatal ? 'bold' : 'normal'}
                fill={node.isNatal ? '#FFFFFF' : '#64748B'}
                className={node.isNatal ? '' : 'dark:fill-slate-400'}
              >
                {node.p.nameNepali.split(' ')[0]}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Direction summary cards */}
      <div className="w-full mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
          <div className="font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            जीवनदाता दिशा (Sogtso):
          </div>
          <div className="text-[11px] mt-0.5 font-medium">{natalParkha.directions[0]?.direction}</div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-300 mt-0.5">
            {natalParkha.directions[0]?.effectNepali}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200">
          <div className="font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            समृद्धि दिशा (Nammen):
          </div>
          <div className="text-[11px] mt-0.5 font-medium">{natalParkha.directions[1]?.direction}</div>
          <div className="text-[10px] text-blue-700 dark:text-blue-300 mt-0.5">
            {natalParkha.directions[1]?.effectNepali}
          </div>
        </div>
      </div>
    </div>
  );
};
