import React, { useState } from 'react';
import { Download, Share2, X, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 ${className}`}
        title="एप इन्स्टल गर्नुहोस् - इन्टरनेट नहुँदा पनि पञ्चाङ्ग र कुण्डली हेर्न सकिने"
      >
        <Download className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
        <span className="hidden sm:inline">एप इन्स्टल</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100 ${className}`}
          title="iPhone/iPad मा एप राख्नुहोस्"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
          <span className="hidden sm:inline">होमस्क्रिनमा थप्नुहोस्</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-stone-900 p-5 shadow-2xl border border-stone-200 dark:border-stone-800 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-600" />
                  <span>iPhone / iPad मा एप इन्स्टल गर्नुहोस्</span>
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-xs text-stone-600 dark:text-stone-300">
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold shrink-0 text-[11px]">
                    १
                  </span>
                  <span>Safari ब्राउजरको तल रहेको <strong>Share (सेयर)</strong> <Share2 className="inline w-3.5 h-3.5 mx-1" /> बटन थिच्नुहोस्।</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold shrink-0 text-[11px]">
                    २
                  </span>
                  <span>तल सारेर <strong>Add to Home Screen (होमस्क्रिनमा थप्नुहोस्)</strong> चयन गर्नुहोस्।</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold shrink-0 text-[11px]">
                    ३
                  </span>
                  <span>माथि दायाँपट्टि रहेको <strong>Add</strong> मा ट्याप गर्नुहोस्।</span>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold transition-colors"
              >
                बुझें
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
