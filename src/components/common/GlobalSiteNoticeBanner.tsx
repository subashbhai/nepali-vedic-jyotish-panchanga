import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, Info, Flame, X, ArrowRight } from 'lucide-react';
import { getStoredPageServiceConfig, GlobalNoticeConfig } from '../../db/pageServiceControlStore';

interface GlobalSiteNoticeBannerProps {
  onNavigateTab?: (tab: string) => void;
}

export const GlobalSiteNoticeBanner: React.FC<GlobalSiteNoticeBannerProps> = ({ onNavigateTab }) => {
  const [notice, setNotice] = useState<GlobalNoticeConfig>(() => getStoredPageServiceConfig().globalNotice);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setNotice(getStoredPageServiceConfig().globalNotice);
      setIsDismissed(false);
    };
    window.addEventListener('page-service-control-updated', handleUpdate);
    return () => window.removeEventListener('page-service-control-updated', handleUpdate);
  }, []);

  if (!notice.isEnabled || isDismissed) {
    return null;
  }

  const isFestive = notice.type === 'festive';
  const isEmergency = notice.type === 'emergency';
  const isWarning = notice.type === 'warning';

  return (
    <div
      className={`no-print relative border-b py-2.5 px-4 transition-all duration-300 shadow-xs ${
        isFestive
          ? 'bg-gradient-to-r from-amber-700 via-amber-800 to-orange-800 border-amber-600/50 text-amber-50'
          : isEmergency
          ? 'bg-gradient-to-r from-rose-900 via-red-900 to-rose-950 border-rose-700 text-rose-50'
          : isWarning
          ? 'bg-gradient-to-r from-yellow-900 via-amber-900 to-yellow-950 border-yellow-700 text-yellow-50'
          : 'bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 border-amber-500/30 text-stone-100'
      }`}
    >
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="shrink-0">
            {isFestive && <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />}
            {isEmergency && <AlertTriangle className="w-4 h-4 text-rose-300 animate-bounce" />}
            {isWarning && <AlertTriangle className="w-4 h-4 text-yellow-300" />}
            {!isFestive && !isEmergency && !isWarning && <Info className="w-4 h-4 text-blue-300" />}
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 truncate">
            {notice.titleNepali && (
              <span className="font-bold underline decoration-amber-400/50">{notice.titleNepali} :</span>
            )}
            <span className="font-medium opacity-95">{notice.messageNepali}</span>
          </div>

          {notice.actionText && notice.actionTab && onNavigateTab && (
            <button
              onClick={() => onNavigateTab(notice.actionTab!)}
              className="ml-2 px-2.5 py-0.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-full font-bold text-[10px] shrink-0 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>{notice.actionText}</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        {notice.dismissible && (
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-lg hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer shrink-0"
            title="सूचना बन्द गर्नुहोस्"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
