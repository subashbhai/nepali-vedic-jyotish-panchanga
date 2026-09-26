/**
 * Tibetan 9 Mewa Magic Square Interactive Visualization (स्मे-बा ९ / 3x3 Lo Shu)
 * Color-coded SVG graphics with element symbols, cardinal directions,
 * cosmic turtle shell contour, magic sum 15 guide, and traditional interpretation.
 * Brihat Jyotish Professional ERP
 */

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Compass,
  Flame,
  Droplets,
  Layers,
  Shield,
  Award,
  Check,
  BookOpen,
  Info,
  RotateCcw,
  Eye,
  Activity,
  HeartHandshake,
  ShieldCheck,
  Zap,
  Leaf
} from 'lucide-react';
import { TibetanMewa, TibetanElementId } from '../../../types/tibetanAstrology';
import { TIBETAN_MEWA_LIST } from '../../../core/tibetan/mewaEngine';
import { toDevanagariNumerals } from '../../../utils/nepaliCalendar';

export interface MewaMagicSquareChartProps {
  natalMewa: TibetanMewa;
  onSelectMewa?: (mewa: TibetanMewa) => void;
  showInterpretation?: boolean;
  className?: string;
}

// Classical Lo-Shu 3x3 Grid arrangement in Tibetan orientation (South at Top):
// Row 0 (Top / South): 4 (SE - Wood), 9 (S - Fire), 2 (SW - Water)
// Row 1 (Middle):      3 (E - Water), 5 (Center - Earth), 7 (W - Fire)
// Row 2 (Bottom / North): 8 (NE - Iron), 1 (N - Iron), 6 (NW - Iron)
const LO_SHU_GRID: number[][] = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6]
];

// Cell visual coordinates inside 600x600 SVG viewBox
const CELL_SIZE = 136;
const CELL_GAP = 12;
const GRID_START_X = 78;
const GRID_START_Y = 78;

export const MewaMagicSquareChart: React.FC<MewaMagicSquareChartProps> = ({
  natalMewa,
  onSelectMewa,
  showInterpretation = true,
  className = ''
}) => {
  const [selectedMewaNum, setSelectedMewaNum] = useState<number>(natalMewa.number);
  const [hoveredMewaNum, setHoveredMewaNum] = useState<number | null>(null);
  const [showMagicSum, setShowMagicSum] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'karma' | 'nature' | 'career' | 'health' | 'remedies' | 'harmony'>('karma');

  // Currently displayed Mewa
  const currentMewa: TibetanMewa = useMemo(() => {
    return TIBETAN_MEWA_LIST[selectedMewaNum] || natalMewa;
  }, [selectedMewaNum, natalMewa]);

  const handleSelect = (num: number) => {
    setSelectedMewaNum(num);
    const selected = TIBETAN_MEWA_LIST[num];
    if (selected && onSelectMewa) {
      onSelectMewa(selected);
    }
  };

  const handleResetToNatal = () => {
    handleSelect(natalMewa.number);
  };

  // Helper for rendering SVG Element Symbols
  const renderElementGlyph = (elementId: TibetanElementId, x: number, y: number, color: string) => {
    switch (elementId) {
      case 'fire':
        // Triple Dancing Flame
        return (
          <g transform={`translate(${x - 12}, ${y - 12})`} fill={color}>
            <path d="M12 2C10.5 4.5 8 7 8 10.5C8 12.7 9.8 14.5 12 14.5C14.2 14.5 16 12.7 16 10.5C16 7 13.5 4.5 12 2ZM7 9C6.5 10.5 5 12 5 14C5 17.3 7.7 20 11 20C11.3 20 11.7 20 12 19.9C9.5 19.4 8 17.5 8 15.5C8 13.5 9 12 10 11L7 9ZM17 9L14 11C15 12 16 13.5 16 15.5C16 17.5 14.5 19.4 12 19.9C12.3 20 12.7 20 13 20C16.3 20 19 17.3 19 14C19 12 17.5 10.5 17 9Z" />
          </g>
        );
      case 'water':
        // Fluid Ocean Waves
        return (
          <g transform={`translate(${x - 12}, ${y - 12})`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
            <path d="M3 10C5 8 7 8 9 10C11 12 13 12 15 10C17 8 19 8 21 10" />
            <path d="M3 15C5 13 7 13 9 15C11 17 13 17 15 15C17 13 19 13 21 15" />
          </g>
        );
      case 'wood':
        // Sacred Sprouting Tree/Bodhi Branch
        return (
          <g transform={`translate(${x - 12}, ${y - 12})`} fill={color}>
            <path d="M12 21V11M12 11C12 7 8 5 4 6C4 10 7 12 12 11ZM12 11C12 7 16 5 20 6C20 10 17 12 12 11Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="12" cy="11" r="2" fill={color} />
          </g>
        );
      case 'earth':
        // Majestic Mount Meru Three Peaks
        return (
          <g transform={`translate(${x - 12}, ${y - 12})`} fill={color}>
            <path d="M12 4L5 18H19L12 4Z" opacity="0.9" />
            <path d="M5 11L1 18H9L5 11Z" opacity="0.6" />
            <path d="M19 11L15 18H23L19 11Z" opacity="0.6" />
          </g>
        );
      case 'iron':
      default:
        // Sacred Crossed Vajra / Crystalline Sword
        return (
          <g transform={`translate(${x - 12}, ${y - 12})`} stroke={color} strokeWidth="2" strokeLinecap="round" fill="none">
            <circle cx="12" cy="12" r="3" fill={color} />
            <line x1="12" y1="3" x2="12" y2="7" />
            <line x1="12" y1="17" x2="12" y2="21" />
            <line x1="3" y1="12" x2="7" y2="12" />
            <line x1="17" y1="12" x2="21" y2="12" />
            <path d="M9 5L12 2L15 5M9 19L12 22L15 19M5 9L2 12L5 15M19 9L22 12L19 15" />
          </g>
        );
    }
  };

  return (
    <div className={`w-full flex flex-col gap-6 ${className}`}>
      {/* Top Header & Interactive Mode Controls */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/50 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>९ मेवा (जादुई अंक मण्डल)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Lo Shu 3×3
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              कूर्माकार ब्रह्माण्ड (Golden Cosmic Turtle) तथा पञ्चतत्वीय ऊर्जा केन्द्र
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {/* Toggle Magic Sum Lines */}
          <button
            type="button"
            onClick={() => setShowMagicSum((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              showMagicSum
                ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
            title="३x३ वर्गको प्रत्येक दिशामा योग १५ हुने जादुई रेखा देखाउनुहोस्"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>जादुई योग: १५</span>
          </button>

          {/* Reset to Natal Mewa */}
          <button
            type="button"
            onClick={handleResetToNatal}
            disabled={selectedMewaNum === natalMewa.number}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              selectedMewaNum === natalMewa.number
                ? 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-700'
                : 'cursor-pointer bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800 hover:bg-orange-100'
            }`}
            title="तपाईंको आफ्नै जन्म मेवामा फर्कनुहोस्"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>मेरो जन्म मेवा</span>
          </button>
        </div>
      </div>

      {/* Quick Mewa Selector Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap px-1">
          मेवा छनोट:
        </span>
        {([1, 2, 3, 4, 5, 6, 7, 8, 9] as number[]).map((num) => {
          const m = TIBETAN_MEWA_LIST[num];
          const isSelected = selectedMewaNum === num;
          const isNatal = natalMewa.number === num;

          return (
            <button
              key={num}
              type="button"
              onClick={() => handleSelect(num)}
              className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                isSelected
                  ? 'ring-2 ring-amber-500 shadow-md scale-105 z-10 text-white'
                  : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:scale-[1.02]'
              }`}
              style={{
                backgroundColor: isSelected ? m.hexColor : undefined
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full border border-white/40 shrink-0"
                style={{ backgroundColor: m.hexColor }}
              />
              <span>
                {toDevanagariNumerals(num)} {m.nameNepali.split(' ')[1]}
              </span>
              {isNatal && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Grid Section: SVG Interactive Chart + Quick Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Interactive Magic Square */}
        <div className="lg:col-span-7 flex flex-col items-center p-4 sm:p-6 bg-gradient-to-b from-amber-50/50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 rounded-2xl border border-amber-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          {/* Subtle Tibetan Background Watermark Knot */}
          <div className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-10 flex items-center justify-center">
            <Compass className="w-96 h-96 text-amber-900" />
          </div>

          <div className="w-full max-w-[480px] aspect-square relative z-10">
            <svg
              viewBox="0 0 600 600"
              className="w-full h-full select-none overflow-visible filter drop-shadow-md"
            >
              <defs>
                {/* Individual Cell Gradients */}
                {/* 1 White */}
                <linearGradient id="mewaGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F8FAFC" />
                  <stop offset="100%" stopColor="#CBD5E1" />
                </linearGradient>
                {/* 2 Black */}
                <linearGradient id="mewaGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0F172A" />
                  <stop offset="100%" stopColor="#1E293B" />
                </linearGradient>
                {/* 3 Blue */}
                <linearGradient id="mewaGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E40AF" />
                  <stop offset="100%" stopColor="#2563EB" />
                </linearGradient>
                {/* 4 Green */}
                <linearGradient id="mewaGrad4" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#15803D" />
                  <stop offset="100%" stopColor="#16A34A" />
                </linearGradient>
                {/* 5 Yellow */}
                <linearGradient id="mewaGrad5" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#854D0E" />
                  <stop offset="100%" stopColor="#CA8A04" />
                </linearGradient>
                {/* 6 White */}
                <linearGradient id="mewaGrad6" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#64748B" />
                </linearGradient>
                {/* 7 Red */}
                <linearGradient id="mewaGrad7" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#991B1B" />
                  <stop offset="100%" stopColor="#DC2626" />
                </linearGradient>
                {/* 8 White */}
                <linearGradient id="mewaGrad8" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E2E8F0" />
                  <stop offset="100%" stopColor="#F1F5F9" />
                </linearGradient>
                {/* 9 Red */}
                <linearGradient id="mewaGrad9" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7F1D1D" />
                  <stop offset="100%" stopColor="#B91C1C" />
                </linearGradient>

                {/* Golden Turtle Shell Outer Glow Filter */}
                <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Cosmic Turtle Shell Outer Contour (Srid Pa Ho Mandala) */}
              <rect
                x="30"
                y="30"
                width="540"
                height="540"
                rx="32"
                ry="32"
                fill="#FFFBEB"
                stroke="#D97706"
                strokeWidth="2.5"
                className="dark:fill-slate-900/90 dark:stroke-amber-600/70"
              />
              <rect
                x="44"
                y="44"
                width="512"
                height="512"
                rx="24"
                ry="24"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="1.2"
                strokeDasharray="6 3"
                opacity="0.6"
              />

              {/* Four Cardinal Direction Outer Markers */}
              {/* SOUTH (Top in classical Tibetan Astro) */}
              <g transform="translate(300, 22)">
                <rect x="-65" y="-14" width="130" height="24" rx="12" fill="#DC2626" />
                <text x="0" y="3" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">
                  दक्षिण (South / lHo) • अग्नि
                </text>
              </g>

              {/* NORTH (Bottom) */}
              <g transform="translate(300, 578)">
                <rect x="-65" y="-10" width="130" height="24" rx="12" fill="#475569" />
                <text x="0" y="6" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">
                  उत्तर (North / Byang) • जल
                </text>
              </g>

              {/* EAST (Left) */}
              <g transform="translate(22, 300)">
                <rect x="-14" y="-55" width="24" height="110" rx="12" fill="#2563EB" />
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="11"
                  fontWeight="bold"
                  transform="rotate(-90)"
                >
                  पूर्व (East / Shar)
                </text>
              </g>

              {/* WEST (Right) */}
              <g transform="translate(578, 300)">
                <rect x="-10" y="-55" width="24" height="110" rx="12" fill="#DC2626" />
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="11"
                  fontWeight="bold"
                  transform="rotate(90)"
                >
                  पश्चिम (West / Nub)
                </text>
              </g>

              {/* Intercardinal Corner Labels */}
              <text x="75" y="62" textAnchor="start" fontSize="10" fontWeight="bold" fill="#B45309" className="dark:fill-amber-400">
                दक्षिण-पूर्व (SE)
              </text>
              <text x="525" y="62" textAnchor="end" fontSize="10" fontWeight="bold" fill="#B45309" className="dark:fill-amber-400">
                दक्षिण-पश्चिम (SW)
              </text>
              <text x="75" y="546" textAnchor="start" fontSize="10" fontWeight="bold" fill="#B45309" className="dark:fill-amber-400">
                उत्तर-पूर्व (NE)
              </text>
              <text x="525" y="546" textAnchor="end" fontSize="10" fontWeight="bold" fill="#B45309" className="dark:fill-amber-400">
                उत्तर-पश्चिम (NW)
              </text>

              {/* 3x3 Magic Square Cells */}
              {LO_SHU_GRID.map((row, rIdx) =>
                row.map((mewaNum, cIdx) => {
                  const mewaItem = TIBETAN_MEWA_LIST[mewaNum];
                  const x = GRID_START_X + cIdx * (CELL_SIZE + CELL_GAP);
                  const y = GRID_START_Y + rIdx * (CELL_SIZE + CELL_GAP);
                  const isSelected = selectedMewaNum === mewaNum;
                  const isNatal = natalMewa.number === mewaNum;
                  const isHovered = hoveredMewaNum === mewaNum;

                  // Text contrast color logic
                  const isWhiteTone = mewaNum === 1 || mewaNum === 8;
                  const textColor = isWhiteTone ? '#0F172A' : '#FFFFFF';
                  const subTextColor = isWhiteTone ? '#334155' : 'rgba(255, 255, 255, 0.85)';
                  const iconColor = isWhiteTone ? '#334155' : '#FFFFFF';

                  return (
                    <g
                      key={mewaNum}
                      className="cursor-pointer transition-transform duration-200"
                      onClick={() => handleSelect(mewaNum)}
                      onMouseEnter={() => setHoveredMewaNum(mewaNum)}
                      onMouseLeave={() => setHoveredMewaNum(null)}
                    >
                      {/* Natal Mewa Halo Glow */}
                      {isNatal && (
                        <rect
                          x={x - 4}
                          y={y - 4}
                          width={CELL_SIZE + 8}
                          height={CELL_SIZE + 8}
                          rx="24"
                          ry="24"
                          fill="none"
                          stroke="#F59E0B"
                          strokeWidth="3.5"
                          opacity="0.85"
                          filter="url(#goldGlow)"
                        />
                      )}

                      {/* Cell Main Background Rect */}
                      <rect
                        x={x}
                        y={y}
                        width={CELL_SIZE}
                        height={CELL_SIZE}
                        rx="20"
                        ry="20"
                        fill={`url(#mewaGrad${mewaNum})`}
                        stroke={
                          isSelected
                            ? '#F59E0B'
                            : isNatal
                            ? '#EA580C'
                            : isHovered
                            ? '#94A3B8'
                            : 'rgba(255, 255, 255, 0.25)'
                        }
                        strokeWidth={isSelected ? 4 : isNatal ? 3 : 1.5}
                        opacity={isHovered ? 0.96 : 1}
                      />

                      {/* Natal Badge Indicator on Cell */}
                      {isNatal && (
                        <g transform={`translate(${x + CELL_SIZE / 2}, ${y + 3})`}>
                          <rect
                            x="-42"
                            y="-14"
                            width="84"
                            height="18"
                            rx="9"
                            fill="#EA580C"
                            stroke="#FFFFFF"
                            strokeWidth="1"
                          />
                          <text
                            x="0"
                            y="-1"
                            textAnchor="middle"
                            fill="#FFFFFF"
                            fontSize="8.5"
                            fontWeight="900"
                            letterSpacing="0.3"
                          >
                            तपाईंको जन्म मेवा
                          </text>
                        </g>
                      )}

                      {/* Selected Badge Indicator */}
                      {isSelected && !isNatal && (
                        <g transform={`translate(${x + CELL_SIZE / 2}, ${y + 3})`}>
                          <rect
                            x="-32"
                            y="-14"
                            width="64"
                            height="18"
                            rx="9"
                            fill="#D97706"
                            stroke="#FFFFFF"
                            strokeWidth="1"
                          />
                          <text
                            x="0"
                            y="-1"
                            textAnchor="middle"
                            fill="#FFFFFF"
                            fontSize="8.5"
                            fontWeight="bold"
                          >
                            चयनित
                          </text>
                        </g>
                      )}

                      {/* Cell Top Header: Element Symbol & Direction */}
                      <g transform={`translate(${x + 14}, ${y + 24})`}>
                        {renderElementGlyph(mewaItem.element.id, 6, 4, iconColor)}
                        <text
                          x="24"
                          y="8"
                          fontSize="9.5"
                          fontWeight="bold"
                          fill={subTextColor}
                        >
                          {mewaItem.element.nameNepali.split(' ')[0]}
                        </text>
                      </g>

                      {/* Direction on Top Right */}
                      <text
                        x={x + CELL_SIZE - 14}
                        y={y + 32}
                        textAnchor="end"
                        fontSize="9.5"
                        fontWeight="600"
                        fill={subTextColor}
                      >
                        {mewaItem.directionNepali.split(' ')[0]}
                      </text>

                      {/* Center: Large Devanagari Numeral */}
                      <text
                        x={x + CELL_SIZE / 2 - 8}
                        y={y + 82}
                        textAnchor="middle"
                        fontSize="44"
                        fontWeight="900"
                        fontFamily="serif"
                        fill={textColor}
                      >
                        {toDevanagariNumerals(mewaNum)}
                      </text>

                      {/* Arabic Numeral Badge */}
                      <g transform={`translate(${x + CELL_SIZE / 2 + 30}, ${y + 70})`}>
                        <circle cx="0" cy="0" r="11" fill="rgba(0,0,0,0.22)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                        <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#FFFFFF">
                          {mewaNum}
                        </text>
                      </g>

                      {/* Bottom Info: Tibetan Name & Color */}
                      <text
                        x={x + CELL_SIZE / 2}
                        y={y + 107}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="bold"
                        fill={textColor}
                      >
                        {mewaItem.nameNepali.split(' ')[1]}
                      </text>
                      <text
                        x={x + CELL_SIZE / 2}
                        y={y + 122}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="medium"
                        fill={subTextColor}
                      >
                        {mewaItem.nameTibetan.split(' ')[0]}
                      </text>
                    </g>
                  );
                })
              )}

              {/* Optional Magic Sum Overlay Lines (15) */}
              {showMagicSum && (
                <g className="pointer-events-none animate-in fade-in duration-300">
                  {/* Horizontal Rows */}
                  {[0, 1, 2].map((r) => {
                    const lineY = GRID_START_Y + r * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
                    return (
                      <g key={`row-${r}`}>
                        <line
                          x1={GRID_START_X - 18}
                          y1={lineY}
                          x2={GRID_START_X + 3 * CELL_SIZE + 2 * CELL_GAP + 18}
                          y2={lineY}
                          stroke="#F59E0B"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                          opacity="0.8"
                        />
                        <rect
                          x={GRID_START_X + 3 * CELL_SIZE + 2 * CELL_GAP + 6}
                          y={lineY - 10}
                          width="36"
                          height="20"
                          rx="6"
                          fill="#D97706"
                        />
                        <text
                          x={GRID_START_X + 3 * CELL_SIZE + 2 * CELL_GAP + 24}
                          y={lineY + 4}
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontSize="10"
                          fontWeight="bold"
                        >
                          = १५
                        </text>
                      </g>
                    );
                  })}

                  {/* Vertical Columns */}
                  {[0, 1, 2].map((c) => {
                    const lineX = GRID_START_X + c * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
                    return (
                      <g key={`col-${c}`}>
                        <line
                          x1={lineX}
                          y1={GRID_START_Y - 18}
                          x2={lineX}
                          y2={GRID_START_Y + 3 * CELL_SIZE + 2 * CELL_GAP + 18}
                          stroke="#F59E0B"
                          strokeWidth="2"
                          strokeDasharray="6 4"
                          opacity="0.8"
                        />
                        <rect
                          x={lineX - 18}
                          y={GRID_START_Y + 3 * CELL_SIZE + 2 * CELL_GAP + 6}
                          width="36"
                          height="20"
                          rx="6"
                          fill="#D97706"
                        />
                        <text
                          x={lineX}
                          y={GRID_START_Y + 3 * CELL_SIZE + 2 * CELL_GAP + 20}
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontSize="10"
                          fontWeight="bold"
                        >
                          = १५
                        </text>
                      </g>
                    );
                  })}

                  {/* Diagonals */}
                  <line
                    x1={GRID_START_X + 20}
                    y1={GRID_START_Y + 20}
                    x2={GRID_START_X + 3 * CELL_SIZE + 2 * CELL_GAP - 20}
                    y2={GRID_START_Y + 3 * CELL_SIZE + 2 * CELL_GAP - 20}
                    stroke="#EA580C"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    opacity="0.75"
                  />
                  <line
                    x1={GRID_START_X + 3 * CELL_SIZE + 2 * CELL_GAP - 20}
                    y1={GRID_START_Y + 20}
                    x2={GRID_START_X + 20}
                    y2={GRID_START_Y + 3 * CELL_SIZE + 2 * CELL_GAP - 20}
                    stroke="#EA580C"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    opacity="0.75"
                  />
                </g>
              )}
            </svg>
          </div>

          {/* Bottom Footnote on Turtle Matrix */}
          <div className="mt-3 text-center max-w-md">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              कुनै पनि कोठामा क्लिक गरी सो मेवाको विस्तृत फल, गुण, मन्त्र र पञ्चतत्वीय सम्बन्ध अध्ययन गर्नुहोस्।
            </p>
          </div>
        </div>

        {/* Selected Mewa Overview & Quick Stats Card */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div
            className="p-5 rounded-2xl border text-white shadow-md relative overflow-hidden transition-all duration-300"
            style={{
              backgroundColor: currentMewa.hexColor,
              borderColor: currentMewa.hexColor
            }}
          >
            {/* Top Badge */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-xs border border-white/20">
                {currentMewa.number === natalMewa.number ? '✨ तपाईंको जन्म मेवा' : 'चयनित मेवा विश्लेषण'}
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white/20 text-white">
                स्मे-बा {toDevanagariNumerals(currentMewa.number)}
              </span>
            </div>

            {/* Mewa Title & Tibetan Name */}
            <div className="flex items-baseline gap-2 mb-1">
              <h4 className="text-2xl font-black tracking-tight text-white">
                {currentMewa.nameNepali}
              </h4>
            </div>
            <div className="text-xs font-medium text-white/85 mb-4">
              तिब्बती नाम: <strong className="text-white">{currentMewa.nameTibetan}</strong>
            </div>

            {/* Key Metrics Chips */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              <div className="p-2.5 rounded-xl bg-black/20 backdrop-blur-xs border border-white/15">
                <div className="text-[10px] text-white/70">सम्बद्ध पञ्चतत्व</div>
                <div className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                  {currentMewa.element.id === 'fire' && <Flame className="w-3.5 h-3.5 text-amber-300" />}
                  {currentMewa.element.id === 'water' && <Droplets className="w-3.5 h-3.5 text-blue-300" />}
                  {currentMewa.element.id === 'wood' && <Leaf className="w-3.5 h-3.5 text-emerald-300" />}
                  {currentMewa.element.id === 'earth' && <Layers className="w-3.5 h-3.5 text-amber-300" />}
                  {currentMewa.element.id === 'iron' && <Zap className="w-3.5 h-3.5 text-slate-300" />}
                  <span>{currentMewa.element.nameNepali}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/20 backdrop-blur-xs border border-white/15">
                <div className="text-[10px] text-white/70">दिशा तथा वास्तु</div>
                <div className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <Compass className="w-3.5 h-3.5 text-amber-300" />
                  <span>{currentMewa.directionNepali}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/20 backdrop-blur-xs border border-white/15">
                <div className="text-[10px] text-white/70">कूर्माकार अङ्ग</div>
                <div className="font-bold text-white truncate mt-0.5">
                  {currentMewa.turtlePartNepali || 'कूर्माकार शरीर'}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black/20 backdrop-blur-xs border border-white/15">
                <div className="text-[10px] text-white/70">संरक्षक बोधिसत्त्व</div>
                <div className="font-bold text-white truncate mt-0.5">
                  {currentMewa.protectiveDeityNepali || 'बोधिसत्त्व'}
                </div>
              </div>
            </div>

            {/* Sacred Mantra Card */}
            {currentMewa.sacredMantra && (
              <div className="p-3 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25">
                <div className="text-[10px] font-semibold text-white/80 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>परम पवित्र मन्त्र (Sacred Mantra):</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-amber-100 tracking-wide">
                  {currentMewa.sacredMantra}
                </div>
              </div>
            )}
          </div>

          {/* Quick Core Quality Callout */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-xs space-y-2">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>मूल गुण तथा स्वभाव (Core Personality):</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {currentMewa.qualityNepali}
            </p>
            {currentMewa.symbolNepali && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                <strong>प्रतीक:</strong> {currentMewa.symbolNepali}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Traditional Interpretation Section */}
      {showInterpretation && (
        <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 flex flex-col gap-5">
          {/* Section Heading with Canonical Citation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  परम्परागत मेवा फल एवं शास्त्रीय व्याख्या (Traditional Interpretation)
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                प्रमाण: वैदूर्य कार्पो (Vaidurya Karpo) एवं तिब्बती कूर्माकार चक्र (Srid-pa-ho)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                {currentMewa.nameNepali} को विस्तृत विवेचना
              </span>
            </div>
          </div>

          {/* Sub-Tabs for Structured Traditional Analysis */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {[
              { id: 'karma', label: 'पूर्वजन्म कर्म', icon: Sparkles },
              { id: 'nature', label: 'स्वभाव र मनोविज्ञान', icon: Award },
              { id: 'career', label: 'अनुकूल कार्यक्षेत्र', icon: Activity },
              { id: 'health', label: 'स्वास्थ्य र सतर्कता', icon: ShieldCheck },
              { id: 'remedies', label: 'शान्ति उपाय र पूजा', icon: HeartHandshake },
              { id: 'harmony', label: 'पञ्चतत्व मैत्री चक्र', icon: Layers }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#7A1C1C] text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Display */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 text-xs sm:text-sm">
            {/* 1. Karma Tab */}
            {activeTab === 'karma' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>पूर्वजन्मीय कर्म संस्कार एवं आध्यात्मिक यात्रा:</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                  {currentMewa.karmicTendencyNepali}
                </p>
                {currentMewa.pastLifeOriginNepali && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
                    <strong>पूर्वजन्मीय लोक तथा उत्पत्ति:</strong> {currentMewa.pastLifeOriginNepali}
                  </div>
                )}
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  * तिब्बती ज्योतिष अनुसार मानिसको जन्म मेवा पूर्वजन्मीय सञ्चित कर्मको ऐना हो। यसले यस जीवनमा चेतनाको गन्तव्य र आध्यात्मिक झुकाव निर्धारण गर्दछ।
                </div>
              </div>
            )}

            {/* 2. Nature & Psychology Tab */}
            {activeTab === 'nature' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>गहिरो स्वभाव, मनोवृत्ति एवं चरित्र (In-depth Psychology):</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                  {currentMewa.personalityDeepNepali || currentMewa.qualityNepali}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      सकारात्मक सबल पक्षहरू:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">
                      {currentMewa.qualityNepali}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      सचेत रहनुपर्ने पक्ष:
                    </span>
                    <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 text-xs space-y-0.5">
                      {currentMewa.cautions.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Career Tab */}
            {activeTab === 'career' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm">
                  <Activity className="w-4 h-4 text-amber-600" />
                  <span>अनुकूल पेशा, व्यापार तथा आजीविका (Favorable Professions):</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs">
                  {currentMewa.nameNepali} का व्यक्तिहरूका लागि निम्न क्षेत्रहरूमा प्राकृतिक दक्षता र सफलता प्राप्त हुने सम्भावना उच्च रहन्छ:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  {currentMewa.favorableActivities.map((act, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
                    >
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Health Tab */}
            {activeTab === 'health' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <span>स्वास्थ्य, शारीरिक धातु एवं सावधानी (Health Precautions):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      स्वास्थ्य सतर्कता सम्बन्धी सुझावहरू:
                    </span>
                    <ul className="list-disc list-inside text-slate-600 dark:text-slate-400 text-xs space-y-1">
                      {currentMewa.cautions.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      सम्बद्ध शारीरिक अङ्ग (Tibetan Anatomy):
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                      कूर्माकार चक्र अनुसार <strong>{currentMewa.turtlePartNepali}</strong> मा विशेष ऊर्जा केन्द्रित रहन्छ। शरीरको ताप, वायु र कफ (त्रिदोष) को सन्तुलन मिलाउनुहोस्।
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Remedies Tab */}
            {activeTab === 'remedies' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm">
                  <HeartHandshake className="w-4 h-4 text-emerald-600" />
                  <span>पारम्परिक तिब्बती शान्ति उपाय, मन्त्र एवं पूजा (Tibetan Remedies):</span>
                </div>
                {currentMewa.tibetanRemediesNepali && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentMewa.tibetanRemediesNepali.map((rem, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200 leading-relaxed"
                      >
                        <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {toDevanagariNumerals(i + 1)}
                        </span>
                        <span>{rem}</span>
                      </div>
                    ))}
                  </div>
                )}
                {currentMewa.sacredMantra && (
                  <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
                    <strong>दैनिक जप मन्त्र:</strong> {currentMewa.sacredMantra} (कम्तीमा २१ वा १०८ पटक नित्य जप गर्नु शुभ मानिन्छ)।
                  </div>
                )}
              </div>
            )}

            {/* 6. Five Elements Harmony Tab */}
            {activeTab === 'harmony' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>पञ्चतत्वीय सम्बन्ध एवं अनुकूलता चक्र (Five Element Cycles):</span>
                </div>
                {currentMewa.elementHarmony && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                      <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                        मातृ तत्व (Nourishing)
                      </div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-1">
                        {currentMewa.elementHarmony.motherElement}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                      <div className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase">
                        सन्तान तत्व (Creative)
                      </div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-1">
                        {currentMewa.elementHarmony.childElement}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                      <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">
                        मित्र तत्व (Harmonious)
                      </div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-1">
                        {currentMewa.elementHarmony.friendElement}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
                      <div className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase">
                        शत्रु तत्व (Challenging)
                      </div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs mt-1">
                        {currentMewa.elementHarmony.enemyElement}
                      </div>
                    </div>
                  </div>
                )}
                <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  * वैदूर्य कार्पो अनुसार आमा तत्वले पोषण दिन्छ, सन्तान तत्वले सिर्जनशीलता बढाउँछ, र शत्रु तत्वसँग सावधान रहनुपर्छ।
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
