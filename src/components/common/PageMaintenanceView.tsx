import React from 'react';
import { AlertTriangle, Clock, ArrowLeft, Home, RefreshCw } from 'lucide-react';

interface PageMaintenanceViewProps {
  pageTitle: string;
  maintenanceMessage?: string;
  onGoHome: () => void;
}

export const PageMaintenanceView: React.FC<PageMaintenanceViewProps> = ({
  pageTitle,
  maintenanceMessage,
  onGoHome
}) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6 min-h-[420px]">
      <div className="max-w-lg w-full bg-white dark:bg-stone-900 border border-amber-300/70 dark:border-stone-800 rounded-3xl p-8 text-center space-y-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="w-16 h-16 bg-amber-500/15 border border-amber-500/30 rounded-3xl mx-auto flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-md">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-amber-500/15 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold border border-amber-400/40">
            प्राविधिक मर्मतसम्भार (Maintenance Mode)
          </span>

          <h3 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100 mt-2">
            {pageTitle}
          </h3>

          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed max-w-md mx-auto">
            {maintenanceMessage ||
              'यो पृष्ठलाई थप प्रभावकारी तथा समृद्ध बनाउन हाल प्राविधिक मर्मतसम्भार तथा अद्यावधिक गरिँदैछ। केही समयपछि पुनः प्रयास गर्नुहोस्। असुविधाका लागि हामी क्षमाप्रार्थी छौँ।'}
          </p>
        </div>

        <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>पुनः जाँच गर्नुहोस्</span>
          </button>

          <button
            onClick={onGoHome}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>गृहपृष्ठमा जानुहोस्</span>
          </button>
        </div>
      </div>
    </div>
  );
};
