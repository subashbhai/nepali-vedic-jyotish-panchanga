import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Laptop,
  Smartphone,
  Apple,
  RotateCcw,
  Zap,
  ArrowRight
} from 'lucide-react';
import {
  CURRENT_APP_VERSION,
  RemoteReleaseInfo,
  ElectronUpdaterStatus,
  checkLatestRelease,
  isDesktopApp,
  formatFileSize,
  getDismissedUpdateVersion,
  setDismissedUpdateVersion,
  triggerDesktopUpdateCheck,
  triggerDesktopDownloadUpdate,
  triggerDesktopRestartAndInstall,
  triggerDirectBrowserDownload,
  triggerInAppOrDirectDownload
} from '../../utils/appVersionManager';

interface AppUpdateNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  remoteRelease: RemoteReleaseInfo | null;
  electronStatus: ElectronUpdaterStatus;
  onManualCheck?: () => void;
  isChecking?: boolean;
}

export const AppUpdateNotificationModal: React.FC<AppUpdateNotificationModalProps> = ({
  isOpen,
  onClose,
  remoteRelease,
  electronStatus,
  onManualCheck,
  isChecking = false,
}) => {
  if (!isOpen) return null;

  const isDesktop = isDesktopApp();
  const targetVersion = remoteRelease?.version || electronStatus.version || CURRENT_APP_VERSION;
  const isDownloaded = electronStatus.status === 'downloaded';
  const isDownloading = electronStatus.status === 'downloading';
  const downloadPercent = electronStatus.percent || 0;

  const handleRestartAndInstall = () => {
    triggerDesktopRestartAndInstall();
  };

  const handleStartInAppDownload = async () => {
    await triggerInAppOrDirectDownload(remoteRelease);
  };

  const handleDismissForNow = () => {
    if (targetVersion) {
      setDismissedUpdateVersion(targetVersion);
    }
    onClose();
  };

  const winAsset = remoteRelease?.assets?.find(a => a.platform === 'windows');
  const apkAsset = remoteRelease?.assets?.find(a => a.platform === 'android');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-stone-900 border-2 border-amber-400/80 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#7A1C1C] via-[#991B1B] to-[#5B1010] text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
            title="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-900 flex items-center justify-center font-bold shadow-lg shrink-0">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 font-bold text-[10.5px] uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" />
                <span>नयाँ संस्करण उपलब्ध</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-serif text-white leading-tight">
                सफ्टवेयर अपडेट (Live Update)
              </h2>
            </div>
          </div>
        </div>

        {/* Version Compare Banner */}
        <div className="bg-amber-500/10 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/40 px-5 py-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-stone-500 dark:text-stone-400 block text-[11px]">हालको संस्करण:</span>
            <span className="font-bold text-stone-800 dark:text-stone-200 font-mono text-sm">
              v{CURRENT_APP_VERSION}
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <div className="text-right">
            <span className="text-stone-500 dark:text-stone-400 block text-[11px]">नयाँ संस्करण:</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono text-sm">
              {targetVersion.startsWith('v') ? targetVersion : `v${targetVersion}`}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-stone-800 dark:text-stone-200 flex-1">
          {/* Status Message / Download Progress */}
          <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5 text-stone-900 dark:text-stone-100">
                <Laptop className="w-4 h-4 text-amber-600" />
                <span>{isDesktop ? 'डेस्कटप एप सिधै डाउनलोड स्थिति:' : 'अद्यावधिक डाउनलोड स्थिति:'}</span>
              </span>
              <span className="font-mono text-amber-700 dark:text-amber-400 font-bold">
                {isDownloaded
                  ? 'डाउनलोड सम्पन्न (Ready)'
                  : isDownloading
                  ? `${downloadPercent}% डाउनलोड हुँदैछ`
                  : 'डाउनलोडका लागि तयार'}
              </span>
            </div>

            {isDownloading && (
              <div className="space-y-1.5">
                <div className="w-full bg-stone-200 dark:bg-stone-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${downloadPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-stone-500">
                  <span>सफ्टवेयरभित्रै सिधै डाउनलोड हुँदैछ...</span>
                  <span className="font-bold font-mono text-amber-600">{downloadPercent}%</span>
                </div>
              </div>
            )}

            {isDownloaded && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                  नयाँ अपडेट यसै कम्प्युटरमा डाउनलोड भइसकेको छ! नयाँ सुविधाहरू लागु गर्न तलको हरियो रिस्टार्ट बटन थिच्नुहोस्।
                </p>
              </div>
            )}
          </div>

          {/* Release Highlights / What's New */}
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-serif mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>यस संस्करणमा के नयाँ छ? (What's New)</span>
            </h3>
            <div className="bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl p-3.5 text-xs text-stone-600 dark:text-stone-300 space-y-2 max-h-40 overflow-y-auto">
              {remoteRelease?.releaseNotes ? (
                <div className="whitespace-pre-line leading-relaxed font-sans">
                  {remoteRelease.releaseNotes}
                </div>
              ) : (
                <ul className="list-disc list-inside space-y-1">
                  <li>डेस्कटप एप लोगो तथा देवताका ग्राफिक्सहरू १००% अफलाइन सुरक्षित।</li>
                  <li>नेटिभ बहु-रिजोलुसन विन्डोज आइकन समर्थन।</li>
                  <li>द्रुत गतिमा ज्योतिषीय तथा पञ्चाङ्ग गणना प्रणाली।</li>
                  <li>सफ्टवेयरभित्रै सिधै इन-एप डाउनलोड तथा अटो-अपडेट प्रणाली।</li>
                </ul>
              )}
            </div>
          </div>

          {/* Direct In-App Download Platform Buttons */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300">
              यसै सफ्टवेयरमा सिधै डाउनलोड गर्नुहोस् (Direct Downloads):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleStartInAppDownload}
                className="flex items-center justify-between p-2.5 rounded-xl border border-blue-300/80 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/70 dark:hover:bg-blue-900/40 transition-all text-xs text-blue-900 dark:text-blue-200 group cursor-pointer text-left"
              >
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Windows Setup (.exe)</span>
                    <span className="text-[10px] text-stone-500">
                      {formatFileSize(winAsset?.size || 0) || 'सिधै सफ्टवेयरमा डाउनलोड'}
                    </span>
                  </div>
                </div>
                <Download className="w-3.5 h-3.5 text-blue-600 group-hover:translate-y-0.5 transition-transform shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (apkAsset?.downloadUrl) {
                    triggerDirectBrowserDownload(apkAsset.downloadUrl, 'nepali-jyotish.apk');
                  } else {
                    handleStartInAppDownload();
                  }
                }}
                className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-300/80 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 transition-all text-xs text-emerald-900 dark:text-emerald-200 group cursor-pointer text-left"
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Android APK</span>
                    <span className="text-[10px] text-stone-500">मोबाइलका लागि सिधै डाउनलोड</span>
                  </div>
                </div>
                <Download className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-y-0.5 transition-transform shrink-0" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-stone-50 dark:bg-stone-800/80 border-t border-stone-200 dark:border-stone-700 p-4 sm:p-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDismissForNow}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-700 transition-colors cursor-pointer"
          >
            पछि सम्झाउनुहोस्
          </button>

          <div className="flex items-center gap-2">
            {isDownloaded ? (
              <button
                type="button"
                onClick={handleRestartAndInstall}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95 animate-pulse"
              >
                <RotateCcw className="w-4 h-4" />
                <span>अहिले रिस्टार्ट गरी नयाँ संस्करण खोल्नुहोस्</span>
              </button>
            ) : isDownloading ? (
              <button
                type="button"
                disabled
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-black text-xs shadow-lg flex items-center gap-2 cursor-wait opacity-90"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>डाउनलोड हुँदैछ ({downloadPercent}%)...</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartInAppDownload}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>यसै सफ्टवेयरमा सिधै डाउनलोड गर्नुहोस्</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Floating Update Alert Toast / Banner
 * Displayed at bottom-right corner whenever a new version is detected
 */
export const AppUpdateFloatingBanner: React.FC<{
  remoteRelease: RemoteReleaseInfo | null;
  electronStatus: ElectronUpdaterStatus;
  onOpenDetails: () => void;
}> = ({ remoteRelease, electronStatus, onOpenDetails }) => {
  const isDesktop = isDesktopApp();
  const targetVersion = remoteRelease?.version || electronStatus.version;
  const isDownloaded = electronStatus.status === 'downloaded';
  const isDownloading = electronStatus.status === 'downloading';

  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (targetVersion) {
      const savedDismissed = getDismissedUpdateVersion();
      if (savedDismissed === targetVersion && !isDownloaded) {
        setDismissed(true);
      } else {
        setDismissed(false);
      }
    }
  }, [targetVersion, isDownloaded]);

  if (dismissed || (!remoteRelease?.hasUpdate && electronStatus.status !== 'available' && !isDownloaded && !isDownloading)) {
    return null;
  }

  return (
    <div className="no-print fixed bottom-4 right-4 z-50 max-w-sm w-full bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white rounded-2xl border-2 border-amber-400 shadow-2xl p-4 animate-slide-up">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 font-bold shadow-md">
            <Zap className="w-5 h-5 animate-bounce" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-stone-950">
                नयाँ अपडेट {targetVersion ? `v${targetVersion.replace(/^v/i, '')}` : ''}
              </span>
              {isDownloaded && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white">
                  तयार
                </span>
              )}
            </div>
            <p className="text-xs font-serif font-bold text-stone-100 mt-1 leading-snug">
              {isDownloaded
                ? 'नयाँ अपडेट डाउनलोड सम्पन्न भयो!'
                : isDownloading
                ? `अपडेट डाउनलोड हुँदैछ (${electronStatus.percent || 0}%)...`
                : 'नयाँ संस्करण उपलब्ध छ। नयाँ सुविधाहरू हेर्नुहोस्।'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (targetVersion) setDismissedUpdateVersion(targetVersion);
            setDismissed(true);
          }}
          className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          title="हटाउनुहोस्"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-end gap-2 mt-3 pt-2.5 border-t border-amber-500/30">
        {isDownloaded ? (
          <button
            onClick={() => triggerDesktopRestartAndInstall()}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer animate-pulse"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>रिस्टार्ट गरी लागु गर्नुहोस्</span>
          </button>
        ) : isDownloading ? (
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span className="text-xs font-mono font-bold text-amber-300">
              सफ्टवेयरमा डाउनलोड हुँदैछ ({electronStatus.percent || 0}%)...
            </span>
          </div>
        ) : (
          <>
            <button
              onClick={onOpenDetails}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-all cursor-pointer"
            >
              विवरण
            </button>
            <button
              onClick={() => triggerInAppOrDirectDownload(remoteRelease)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>सिधै डाउनलोड गर्नुहोस्</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/**
 * Header Quick Update Status Indicator Pill
 */
export const HeaderUpdateBadgeButton: React.FC<{
  remoteRelease: RemoteReleaseInfo | null;
  electronStatus: ElectronUpdaterStatus;
  onClick: () => void;
}> = ({ remoteRelease, electronStatus, onClick }) => {
  const isDownloaded = electronStatus.status === 'downloaded';
  const hasUpdate = remoteRelease?.hasUpdate || electronStatus.status === 'available' || isDownloaded;

  if (!hasUpdate) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 animate-pulse shrink-0"
      title="नयाँ अपडेट उपलब्ध छ, हेर्न क्लिक गर्नुहोस्"
    >
      <Zap className="w-3.5 h-3.5 fill-current" />
      <span className="hidden sm:inline">अपडेट उपलब्ध</span>
      <span className="bg-stone-950 text-amber-300 px-1.5 py-0.5 rounded text-[10px] font-mono">
        v{remoteRelease?.version?.replace(/^v/i, '') || electronStatus.version || '1.0.1'}
      </span>
    </button>
  );
};
