import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, X, Download, ShieldCheck, ArrowRight } from 'lucide-react';
import { deviceUpdateManager, DeviceUpdateInfo } from '../../utils/deviceUpdateService';
import { isDesktopApp, isMobileApp } from '../../utils/appVersionManager';

export const DeviceUpdateNotificationBanner: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<DeviceUpdateInfo | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const unsubscribe = deviceUpdateManager.subscribe((info) => {
      setUpdateInfo(info);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  if (!updateInfo) return null;

  const handleUpdateClick = async () => {
    setIsUpdating(true);
    try {
      await deviceUpdateManager.applyUpdateNow();
    } catch (e) {
      console.error('Update failed:', e);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    if (updateInfo) {
      deviceUpdateManager.dismissUpdate(updateInfo.version);
    }
  };

  const isDesktop = isDesktopApp();
  const isMobile = isMobileApp();

  return (
    <div className="fixed top-2 sm:top-4 inset-x-2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-[99999] max-w-xl w-full animate-in slide-in-from-top-4 duration-300">
      <div className="bg-gradient-to-r from-stone-950 via-[#7A1C1C] to-stone-950 text-white rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 shadow-2xl border-2 border-amber-400 ring-4 ring-black/40 backdrop-blur-md flex items-center justify-between gap-3">
        {/* Left Icon with pulsating ring */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-5 h-5 text-stone-950 fill-stone-950 animate-bounce" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-stone-950 px-2 py-0.2 rounded-full">
                नयाँ अपडेट {updateInfo.version}
              </span>
              <span className="text-[11px] text-amber-200/90 hidden sm:inline font-mono">
                {isDesktop ? 'Windows App' : isMobile ? 'Mobile App' : 'Web App'}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-amber-100 font-serif leading-tight truncate mt-0.5">
              {updateInfo.releaseNotes || 'नयाँ सुविधाहरू र कार्यसम्पादन सुधार तयार छ!'}
            </h4>
            <p className="text-[10px] text-stone-300 truncate hidden sm:block">
              आफ्नो यन्त्रमा नवीनतम परिवर्तन तुरुन्त लागू गर्न अपडेट गर्नुहोस्।
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleUpdateClick}
            disabled={isUpdating}
            className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-stone-950 font-bold text-xs sm:text-sm shadow-md flex items-center gap-1.5 cursor-pointer transition-transform disabled:opacity-50"
            title="तुरुन्त नयाँ संस्करण लागू गर्नुहोस्"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{isUpdating ? 'अपडेट हुँदै...' : 'अहिले अपडेट'}</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-stone-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            title="पछि गर्नुहोस्"
            aria-label="बन्द गर्नुहोस्"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
