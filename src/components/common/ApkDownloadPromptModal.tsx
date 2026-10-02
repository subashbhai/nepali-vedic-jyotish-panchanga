import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  Check, 
  X, 
  ShieldCheck, 
  Sparkles, 
  WifiOff, 
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { triggerDirectBrowserDownload, DEFAULT_DIRECT_DOWNLOADS, getApkDirectDownloadUrl } from '../../utils/appVersionManager';

interface ApkDownloadPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  apkUrl?: string;
  apkVersion?: string;
}

export const ApkDownloadPromptModal: React.FC<ApkDownloadPromptModalProps> = ({
  isOpen,
  onClose,
  apkUrl,
  apkVersion = '१.०.२',
}) => {
  const [downloadState, setDownloadState] = useState<'prompt' | 'downloading' | 'completed'>('prompt');

  if (!isOpen) return null;

  const handleConfirmDownload = () => {
    setDownloadState('downloading');
    const targetUrl = apkUrl || getApkDirectDownloadUrl();
    triggerDirectBrowserDownload(targetUrl, 'nepali-vedic-jyotish-panchanga.apk');
    setTimeout(() => {
      setDownloadState('completed');
    }, 1500);
  };

  const handleClose = () => {
    // Clean up query param from URL so it doesn't reopen on reload
    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.delete('action');
      url.searchParams.delete('download');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] dark:bg-[#1C1A17] rounded-3xl border-2 border-emerald-500/40 dark:border-emerald-600/30 max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-5 text-center relative">
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-inner">
            <Smartphone className="w-8 h-8 text-amber-300" />
          </div>

          <span className="bg-amber-400 text-stone-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-xs">
            Android Mobile App (.APK)
          </span>

          <h3 className="text-lg font-bold font-serif text-white mt-1.5">
            नेपाली वैदिक ज्योतिष तथा पञ्चाङ्ग
          </h3>
          <p className="text-[11px] text-emerald-100">
            संस्करण {apkVersion} • साइज: ~२८ MB • १००% सुरक्षित
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {downloadState === 'completed' ? (
            <div className="text-center py-3 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <Check className="w-9 h-9 stroke-[3]" />
              </div>
              <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">
                APK डाउनलोड सुरु भयो!
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed px-2">
                फाइल तपाईंको मोबाइलको <strong className="text-emerald-700 dark:text-emerald-400">Downloads</strong> फोल्डरमा आउँदैछ। डाउनलोड सम्पन्न भएपछि माथिको नोटिफिकेसन बारबाट छोएर <strong className="text-stone-900 dark:text-white">Install (स्थापना)</strong> गर्नुहोस्।
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer"
                >
                  हुन्छ, बन्द गर्नुहोस् (Done)
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Feature Highlights */}
              <div className="bg-white dark:bg-stone-900/90 rounded-2xl p-3.5 border border-stone-200 dark:border-stone-800 space-y-2 text-xs">
                <div className="flex items-center gap-2.5 text-stone-700 dark:text-stone-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>इन्टरनेट बिना १००% अफलाइन पञ्चाङ्ग तथा कुण्डली</span>
                </div>
                <div className="flex items-center gap-2.5 text-stone-700 dark:text-stone-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>कुनै विज्ञापन नभएको द्रुत तथा हलुका मोबाइल एप</span>
                </div>
                <div className="flex items-center gap-2.5 text-stone-700 dark:text-stone-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>आधिकारिक वैदिक ज्योतिष, वास्तु तथा फलादेश सेवा</span>
                </div>
              </div>

              {/* Download App Confirmation Prompt */}
              <div className="text-center pt-1">
                <p className="text-sm font-extrabold text-stone-900 dark:text-stone-100 font-serif leading-snug">
                  के तपाईं यो मोबाइल एप (APK) डाउनलोड गर्न चाहनुहुन्छ?
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  (Do you want to download the Android APK file?)
                </p>
              </div>

              {/* Yes & No Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {/* No / Cancel Button */}
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3 px-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-red-500" />
                  <span>होइन (No)</span>
                </button>

                {/* Yes / Download Button */}
                <button
                  type="button"
                  onClick={handleConfirmDownload}
                  disabled={downloadState === 'downloading'}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  {downloadState === 'downloading' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>तयार हुँदैछ...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>हो, डाउनलोड (Yes)</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
