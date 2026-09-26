import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Sparkles, ChevronRight, ExternalLink } from 'lucide-react';
import { PlanetName } from '../types/astrology';
import {
  getBPHSDashaShloka,
  getBPHSYogaShloka,
  getBPHSShlokaForPlanet
} from '../utils/brihatParasharaDatabase';
import { ShlokaViewTarget } from './BPHSShlokaSidePanel';

interface BPHSShlokaTooltipProps {
  target: ShlokaViewTarget;
  onOpenSidePanel: (target: ShlokaViewTarget) => void;
  children?: React.ReactNode;
  customLabel?: string;
  className?: string;
  inlineBadge?: boolean;
}

export const BPHSShlokaTooltip: React.FC<BPHSShlokaTooltipProps> = ({
  target,
  onOpenSidePanel,
  children,
  customLabel,
  className = '',
  inlineBadge = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  let title = '';
  let source = '';
  let previewVerse = '';
  let shortMeaning = '';

  if (target.type === 'dasha') {
    const d = getBPHSDashaShloka(target.planet);
    if (d) {
      title = `${d.planet} महादशा फल`;
      source = d.sourceChapter;
      previewVerse = d.sanskritVerse.split('\n')[0];
      shortMeaning = d.generalMeaningNepali;
    }
  } else if (target.type === 'yoga') {
    const y = getBPHSYogaShloka(target.yogaCodeOrName);
    if (y) {
      title = y.nameNepali;
      source = y.sourceChapter;
      previewVerse = y.sanskritVerse.split('\n')[0];
      shortMeaning = y.detailedMeaningNepali;
    }
  } else if (target.type === 'graha') {
    const g = getBPHSShlokaForPlanet(target.planet);
    if (g) {
      title = `${target.planet} ग्रह स्वरूप`;
      source = g.sourceChapterNepali;
      previewVerse = g.sanskritVerse.split('\n')[0];
      shortMeaning = g.detailedMeaningNepali;
    }
  }

  if (!previewVerse) return <>{children}</>;

  return (
    <div className={`relative inline-block ${className}`} ref={triggerRef}>
      {children ? (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="cursor-pointer"
        >
          {children}
        </div>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg border transition-all ${
            inlineBadge
              ? 'bg-amber-100/90 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900'
              : 'bg-amber-500/15 text-amber-950 dark:text-amber-300 border-amber-400/40 hover:bg-amber-500/25'
          }`}
          title="पाराशर श्लोक तथा प्रमाण हेर्नुहोस्"
        >
          <BookOpen className="w-3 h-3 text-amber-600 dark:text-amber-400" />
          <span>{customLabel || 'श्लोक/प्रमाण'}</span>
        </button>
      )}

      {/* Floating Popover Tooltip */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute z-50 w-72 sm:w-80 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-amber-50 dark:bg-stone-900 border-2 border-amber-400 dark:border-amber-700 rounded-2xl p-3.5 shadow-2xl space-y-2 animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-amber-200 dark:border-stone-800 pb-1.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="font-bold text-xs text-amber-950 dark:text-amber-200 font-serif">
                {title}
              </span>
            </div>
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-sm bg-amber-200 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
              BPHS
            </span>
          </div>

          {/* Source chapter */}
          <p className="text-[10px] text-amber-800 dark:text-amber-400 font-medium">
            {source}
          </p>

          {/* Sanskrit Line */}
          <div className="bg-amber-100/90 dark:bg-stone-950 p-2.5 rounded-xl border border-amber-300 dark:border-stone-800 text-center">
            <p className="text-xs font-serif font-bold text-amber-950 dark:text-amber-100 leading-snug">
              {previewVerse}
            </p>
          </div>

          {/* Short Interpretation */}
          <p className="text-[11px] text-stone-700 dark:text-stone-300 line-clamp-2 leading-relaxed">
            {shortMeaning}
          </p>

          {/* Side Panel Button */}
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenSidePanel(target);
            }}
            className="w-full mt-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span>विस्तृत अन्वय, शब्दार्थ र उपाय हेर्नुहोस्</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-amber-400 dark:border-t-amber-700 pointer-events-none" />
        </div>
      )}
    </div>
  );
};
