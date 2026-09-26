/**
 * Five Elements Interaction Chart (पञ्चतत्व चक्र - འབྱུང་བ་ལྔ)
 * Shows Generation (माता-पुत्र) & Control (शत्रु-मित्र) cycles
 * Brihat Jyotish Professional ERP
 */

import React from 'react';
import { TibetanElement, TibetanElementId } from '../../../types/tibetanAstrology';
import { TIBETAN_FIVE_ELEMENTS } from '../../../core/tibetan/tibetanElementEngine';

interface FiveElementInteractionChartProps {
  activeElement: TibetanElement;
  size?: number;
}

export const FiveElementInteractionChart: React.FC<FiveElementInteractionChartProps> = ({
  activeElement,
  size = 380
}) => {
  const center = size / 2;
  const radius = size * 0.36;

  // The 5 elements arranged around a pentagon starting from Top (Fire):
  // Fire (Top) -> Earth (Bottom-Right) -> Iron (Bottom-Left) -> Water (Mid-Left) -> Wood (Mid-Right)
  // Standard generation cycle order: Wood -> Fire -> Earth -> Iron -> Water -> Wood
  const elementsOrder: TibetanElementId[] = ['fire', 'earth', 'iron', 'water', 'wood'];

  const nodeCoords = elementsOrder.map((elemId, index) => {
    // 5 vertices of pentagon, starting at -90 deg (Top)
    const angle = (index * 72 - 90) * (Math.PI / 180);
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    const el = TIBETAN_FIVE_ELEMENTS[elemId];
    const isActive = el.id === activeElement.id;

    return {
      el,
      x,
      y,
      isActive,
      index
    };
  });

  // Helper to find coords by element id
  const getCoords = (id: TibetanElementId) => nodeCoords.find((n) => n.el.id === id)!;

  // Generation cycle lines: Wood -> Fire -> Earth -> Iron -> Water -> Wood
  const generationPairs: Array<[TibetanElementId, TibetanElementId]> = [
    ['wood', 'fire'],
    ['fire', 'earth'],
    ['earth', 'iron'],
    ['iron', 'water'],
    ['water', 'wood']
  ];

  // Controlling / Destructive cycle lines:
  // Wood -> Earth -> Water -> Fire -> Iron -> Wood
  const controlPairs: Array<[TibetanElementId, TibetanElementId]> = [
    ['wood', 'earth'],
    ['earth', 'water'],
    ['water', 'fire'],
    ['fire', 'iron'],
    ['iron', 'wood']
  ];

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="select-none overflow-visible max-w-full h-auto"
        >
          <defs>
            <marker
              id="arrowGen"
              viewBox="0 0 10 10"
              refX="16"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#16A34A" />
            </marker>
            <marker
              id="arrowCtrl"
              viewBox="0 0 10 10"
              refX="16"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#DC2626" />
            </marker>
          </defs>

          {/* Central background badge */}
          <circle
            cx={center}
            cy={center}
            r={radius * 0.45}
            fill="#F8FAFC"
            stroke="#E2E8F0"
            strokeWidth="1"
            className="dark:fill-slate-800/60 dark:stroke-slate-700"
          />
          <text
            x={center}
            y={center - 6}
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#475569"
            className="dark:fill-slate-300"
          >
            पञ्चतत्व चक्र
          </text>
          <text
            x={center}
            y={center + 12}
            textAnchor="middle"
            fontSize="10"
            fill="#94A3B8"
            className="dark:fill-slate-400"
          >
            འབྱུང་བ་ལྔ
          </text>

          {/* Generation Cycle Edges (Outer curved or straight lines) */}
          {generationPairs.map(([from, to]) => {
            const p1 = getCoords(from);
            const p2 = getCoords(to);
            return (
              <line
                key={`gen-${from}-${to}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="#16A34A"
                strokeWidth="2.2"
                markerEnd="url(#arrowGen)"
                strokeOpacity="0.8"
              />
            );
          })}

          {/* Control Cycle Edges (Inner star pentagram lines) */}
          {controlPairs.map(([from, to]) => {
            const p1 = getCoords(from);
            const p2 = getCoords(to);
            return (
              <line
                key={`ctrl-${from}-${to}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="#DC2626"
                strokeWidth="1.6"
                strokeDasharray="4 3"
                markerEnd="url(#arrowCtrl)"
                strokeOpacity="0.75"
              />
            );
          })}

          {/* Nodes (Elements) */}
          {nodeCoords.map((node) => (
            <g key={node.el.id} className="cursor-pointer group">
              {node.isActive && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="32"
                  fill="none"
                  stroke={node.el.hexColor}
                  strokeWidth="3"
                  strokeDasharray="4 2"
                  className="animate-spin-slow"
                />
              )}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.isActive ? '26' : '23'}
                fill={node.el.hexColor}
                stroke={node.isActive ? '#FFFFFF' : '#CBD5E1'}
                strokeWidth={node.isActive ? '3' : '1.5'}
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
              />
              <text
                x={node.x}
                y={node.y - 3}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={node.isActive ? '11' : '10'}
                fontWeight="bold"
                fill="#FFFFFF"
              >
                {node.el.nameNepali.split(' ')[0]}
              </text>
              <text
                x={node.x}
                y={node.y + 10}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
                fill="#FFFFFF"
                fillOpacity="0.9"
              >
                {node.el.nameTibetan.split(' ')[0]}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Cycle Legend */}
      <div className="mt-3 flex items-center justify-center gap-4 text-xs">
        <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
          <span className="w-4 h-0.5 bg-emerald-600 inline-block"></span>
          उत्पत्तिकारक चक्र (माता-पुत्र)
        </span>
        <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-medium">
          <span className="w-4 h-0.5 border-b border-dashed border-rose-600 inline-block"></span>
          नियन्त्रक चक्र (शत्रु-मित्र)
        </span>
      </div>
    </div>
  );
};
