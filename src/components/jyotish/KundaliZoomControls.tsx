import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Move, Hand } from 'lucide-react';

export interface KundaliZoomControlsProps {
  scale: number;
  isZoomed: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  className?: string;
  showHint?: boolean;
}

export const KundaliZoomControls: React.FC<KundaliZoomControlsProps> = ({
  scale,
  isZoomed,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  className = '',
  showHint = true,
}) => {
  const percentage = Math.round(scale * 100);

  return (
    <div
      className={`absolute bottom-2.5 right-2.5 z-20 flex flex-col items-end gap-1.5 pointer-events-auto select-none ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Zoom Status & Reset Pill */}
      {isZoomed && (
        <div className="flex items-center gap-1.5 bg-stone-900/90 dark:bg-stone-950/90 text-amber-300 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-mono font-bold shadow-lg border border-amber-500/30 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Move className="w-3 h-3 text-amber-400 animate-pulse" />
          <span>{percentage}%</span>
          <button
            type="button"
            onClick={onResetZoom}
            className="ml-1 pl-1.5 border-l border-amber-500/40 text-stone-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            title="सामान्य आकारमा फर्काउनुहोस् (1x)"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span className="text-[10px]">रिसेट</span>
          </button>
        </div>
      )}

      {/* Floating Control Buttons */}
      <div className="flex items-center gap-1 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md p-1 rounded-xl shadow-lg border border-stone-300/80 dark:border-stone-700/80">
        <button
          type="button"
          onClick={onZoomOut}
          disabled={scale <= 1.01}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-stone-700 dark:text-stone-200 hover:bg-amber-100/70 dark:hover:bg-stone-800 disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
          title="सानो बनाउनुहोस् (Zoom Out)"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        <button
          type="button"
          onClick={onResetZoom}
          className={`px-1.5 h-7 sm:h-8 rounded-lg flex items-center justify-center font-mono text-[10px] sm:text-[11px] font-extrabold transition-all cursor-pointer ${
            isZoomed
              ? 'bg-amber-500 text-stone-950 hover:bg-amber-400 font-black'
              : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
          title="रिसेट गर्नुहोस् (100%)"
          aria-label="Reset Zoom"
        >
          {isZoomed ? (
            <span className="flex items-center gap-0.5">
              <RotateCcw className="w-3 h-3" />
              <span>{percentage}%</span>
            </span>
          ) : (
            <span>1x</span>
          )}
        </button>

        <button
          type="button"
          onClick={onZoomIn}
          disabled={scale >= 3.9}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-stone-700 dark:text-stone-200 hover:bg-amber-100/70 dark:hover:bg-stone-800 disabled:opacity-35 disabled:cursor-not-allowed transition-all cursor-pointer"
          title="ठूलो बनाउनुहोस् (Zoom In)"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Mobile Gestures Micro-Hint */}
      {showHint && !isZoomed && (
        <div className="hidden sm:flex items-center gap-1 text-[9px] text-stone-500 dark:text-stone-400 bg-stone-100/80 dark:bg-stone-900/80 px-2 py-0.5 rounded-md border border-stone-200 dark:border-stone-800">
          <Hand className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
          <span>पिन्च वा डबल-ट्याप गर्नुहोस्</span>
        </div>
      )}
    </div>
  );
};
