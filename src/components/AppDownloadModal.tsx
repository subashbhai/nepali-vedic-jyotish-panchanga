import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Monitor, 
  Smartphone, 
  Apple, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink, 
  RefreshCw, 
  WifiOff, 
  Share2, 
  PlusSquare,
  HelpCircle,
  FileCheck,
  Check
} from 'lucide-react';
import { 
  DEFAULT_DIRECT_DOWNLOADS, 
  triggerDirectBrowserDownload, 
  checkLatestRelease,
  getApkDirectDownloadUrl
} from '../utils/appVersionManager';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ApkDownloadPromptModal } from './common/ApkDownloadPromptModal';

export type PlatformTab = 'WINDOWS' | 'ANDROID' | 'MAC' | 'IOS';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion?: string;
  initialTab?: PlatformTab;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({
  isOpen,
  onClose,
  currentVersion = 'v1.0.0',
  initialTab = 'WINDOWS',
}) => {
  const [activeTab, setActiveTab] = useState<PlatformTab>(initialTab);
  const [downloadUrls, setDownloadUrls] = useState(DEFAULT_DIRECT_DOWNLOADS);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [isPromptPreviewOpen, setIsPromptPreviewOpen] = useState(false);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  const [hasRealApk, setHasRealApk] = useState(true);
  const [localIp, setLocalIp] = useState<string>('192.168.1.67');

  useEffect(() => {
    fetch('/api/network-info')
      .then((res) => res.json())
      .then((data) => {
        if (data?.localIp && data.localIp !== 'localhost') {
          setLocalIp(data.localIp);
        }
      })
      .catch(() => {});
  }, []);

  const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const qrTargetUrl = typeof window !== 'undefined'
    ? (isLocalHost
        ? `http://${localIp || '192.168.1.67'}:${window.location.port || '3000'}/?action=download-apk`
        : `${window.location.origin}${window.location.pathname}?action=download-apk`)
    : '/?action=download-apk';

  // Synchronize latest release asset URLs from GitHub if available
  useEffect(() => {
    let isMounted = true;
    checkLatestRelease()
      .then((rel) => {
        if (!isMounted || !rel || !rel.assets || rel.assets.length === 0) return;

        const setupAsset = rel.assets.find(
          (a) => a.name.includes('setup') && a.name.endsWith('.exe')
        )?.downloadUrl;
        const portableAsset = rel.assets.find(
          (a) => !a.name.includes('setup') && a.name.endsWith('.exe')
        )?.downloadUrl;
        const apkAsset = rel.assets.find((a) => a.name.endsWith('.apk'))?.downloadUrl;
        const dmgAsset = rel.assets.find((a) => a.name.endsWith('.dmg'))?.downloadUrl;
        const zipAsset = rel.assets.find((a) => a.name.endsWith('.zip'))?.downloadUrl;

        if (apkAsset) {
          setHasRealApk(true);
        }

        setDownloadUrls((prev) => ({
          windowsSetup: setupAsset || prev.windowsSetup,
          windowsPortable: portableAsset || prev.windowsPortable,
          androidApk: apkAsset || getApkDirectDownloadUrl(),
          macDmg: dmgAsset || prev.macDmg,
          macZip: zipAsset || prev.macZip,
        }));
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isOpen) return null;

  const GITHUB_REPO_URL = 'https://github.com/subashbhai/nepali-vedic-jyotish-panchanga';
  const RELEASES_URL = `${GITHUB_REPO_URL}/releases/latest`;

  const handleStartDownload = (url: string, fileName: string, label: string) => {
    setDownloadingFile(fileName);
    setDownloadNotice(`${label} डाउनलोड सुरु भयो! फाइल कम्प्युटरको Downloads फोल्डरमा सुरक्षित हुँदैछ।`);
    triggerDirectBrowserDownload(url, fileName);
    setTimeout(() => {
      setDownloadingFile(null);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-[#FAF8F5] dark:bg-[#1A1816] rounded-3xl border border-[#E6E0D5] dark:border-stone-800 max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-950 via-[#7A1C1C] to-stone-900 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-400 text-stone-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
              Multi-Platform Offline App
            </span>
            <span className="text-amber-200 text-xs font-mono">
              संस्करण: {currentVersion}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold font-serif text-amber-100 flex items-center gap-2">
            <span>📲 एप डाउनलोड गर्नुहोस् (Download App)</span>
          </h3>
          <p className="text-xs text-amber-200/90 mt-1 max-w-lg leading-relaxed">
            कम्प्युटर वा मोबाइलमा एकपटक डाउनलोड गर्नुहोस् र इन्टरनेट बिना १००% अफलाइन कुण्डली, पञ्चाङ्ग तथा विवाह मिलान चलाउनुहोस्।
          </p>

          <div className="flex items-center gap-3 mt-3 text-[11px] text-amber-300/90">
            <span className="flex items-center gap-1">
              <WifiOff className="w-3.5 h-3.5" /> १००% अफलाइन चल्ने
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" /> स्वचालित लाइभ अपडेट (Auto-Update)
            </span>
          </div>
        </div>

        {/* 4 Platform Selection Tabs */}
        <div className="grid grid-cols-4 border-b border-[#E6E0D5] dark:border-stone-800 bg-white dark:bg-stone-900">
          {/* 1. Windows */}
          <button
            type="button"
            onClick={() => setActiveTab('WINDOWS')}
            className={`py-3 px-2 text-center border-b-2 cursor-pointer transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeTab === 'WINDOWS'
                ? 'border-[#7A1C1C] text-[#7A1C1C] dark:text-amber-400 font-bold bg-amber-50/40 dark:bg-amber-950/20'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span className="text-xs">Windows</span>
          </button>

          {/* 2. Android */}
          <button
            type="button"
            onClick={() => setActiveTab('ANDROID')}
            className={`py-3 px-2 text-center border-b-2 cursor-pointer transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeTab === 'ANDROID'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50/40 dark:bg-emerald-950/20'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span className="text-xs">Android</span>
          </button>

          {/* 3. Mac */}
          <button
            type="button"
            onClick={() => setActiveTab('MAC')}
            className={`py-3 px-2 text-center border-b-2 cursor-pointer transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeTab === 'MAC'
                ? 'border-blue-600 text-blue-700 dark:text-blue-400 font-bold bg-blue-50/40 dark:bg-blue-950/20'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span className="text-xs">macOS</span>
          </button>

          {/* 4. iOS */}
          <button
            type="button"
            onClick={() => setActiveTab('IOS')}
            className={`py-3 px-2 text-center border-b-2 cursor-pointer transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
              activeTab === 'IOS'
                ? 'border-purple-600 text-purple-700 dark:text-purple-400 font-bold bg-purple-50/40 dark:bg-purple-950/20'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-purple-600" />
            <span className="text-xs">iOS (iPhone)</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-stone-800 dark:text-stone-200 text-xs sm:text-sm">

          {/* Download Started Confirmation Banner */}
          {downloadNotice && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-2xl text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between gap-2 shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{downloadNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setDownloadNotice(null)}
                className="p-1 hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50 rounded-lg text-emerald-700 dark:text-emerald-300 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          
          {/* TAB 1: WINDOWS */}
          {activeTab === 'WINDOWS' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Monitor className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-stone-900 dark:text-stone-100">
                    Windows का लागि कम्प्युटर एप (.exe)
                  </h4>
                  <p className="text-xs text-stone-500">
                    Windows 10, 11 (64-bit) समर्थित • पूर्ण अफलाइन डेटाबेस
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Option 1: Installer */}
                <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-xs">
                      १. Windows Setup Installer
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                      सिफारिस गरिएको
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    डेस्कटप आइकन, स्टार्ट मेनु र स्वचालित अटो-अपडेटसहित कम्प्युटरमा इन्स्टल हुन्छ (~१३१ MB)।
                  </p>
                  <a
                    href={downloadUrls.windowsSetup}
                    download="nepali-vedic-jyotish-panchanga-setup-1.0.0.exe"
                    onClick={(e) => {
                      e.preventDefault();
                      handleStartDownload(
                        downloadUrls.windowsSetup,
                        'nepali-vedic-jyotish-panchanga-setup-1.0.0.exe',
                        'Windows Setup (.exe)'
                      );
                    }}
                    className="w-full py-2.5 px-4 bg-[#7A1C1C] hover:bg-[#991B1B] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform hover:scale-102 cursor-pointer"
                  >
                    {downloadingFile === 'nepali-vedic-jyotish-panchanga-setup-1.0.0.exe' ? (
                      <Check className="w-4 h-4 text-emerald-300" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Setup (.exe) सिधै डाउनलोड गर्नुहोस्
                  </a>
                </div>

                {/* Option 2: Portable */}
                <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-xs">
                      २. Portable Edition (.exe)
                    </span>
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md">
                      इन्स्टल गर्नु नपर्ने
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    पेनड्राइभ वा कुनै पनि फोल्डरमा राखेर सिधै डबल-क्लिक गरी चलाउन मिल्ने (~१०० MB)।
                  </p>
                  <a
                    href={downloadUrls.windowsPortable}
                    download="nepali-vedic-jyotish-panchanga-1.0.0.exe"
                    onClick={(e) => {
                      e.preventDefault();
                      handleStartDownload(
                        downloadUrls.windowsPortable,
                        'nepali-vedic-jyotish-panchanga-1.0.0.exe',
                        'Windows Portable (.exe)'
                      );
                    }}
                    className="w-full py-2.5 px-4 bg-stone-800 dark:bg-stone-700 hover:bg-stone-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform hover:scale-102 cursor-pointer"
                  >
                    {downloadingFile === 'nepali-vedic-jyotish-panchanga-1.0.0.exe' ? (
                      <Check className="w-4 h-4 text-emerald-300" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Portable (.exe) सिधै डाउनलोड गर्नुहोस्
                  </a>
                </div>
              </div>

              {/* Live update notice & Live Preview Button */}
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 dark:text-amber-200">
                <div className="flex items-start gap-2.5">
                  <RefreshCw className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-spin-slow" />
                  <div>
                    <strong>स्वचालित लाइभ अपडेट:</strong> नयाँ सुधार वा सुविधाहरू थपिएमा एपले स्वतः पहिचान गरी कम्प्युटरमै नयाँ संस्करण अपडेट गरिदिनेछ।
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('balananda_force_windows_app_shell', 'true');
                    window.dispatchEvent(new CustomEvent('windows-mode-changed'));
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs shadow-xs flex items-center justify-center gap-1.5 shrink-0 transition-transform hover:scale-102 cursor-pointer"
                >
                  <span>💻</span>
                  <span>Windows एप प्रत्यक्ष अनुभव गर्नुहोस् (Live Preview)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ANDROID */}
          {activeTab === 'ANDROID' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Smartphone className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-stone-900 dark:text-stone-100 font-serif">
                    बालानन्द वैदिक ज्योतिष सेवा — Android मोबाइल एप
                  </h4>
                  <p className="text-xs text-stone-500">
                    नेपाली वैदिक ज्योतिष तथा व्यक्तिगत ज्योतिष सेवा (Jyotish Services Only) • Android 8.0 देखि 15+
                  </p>
                </div>
              </div>

              {/* Two Download/Install Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Option 1: Direct Android APK */}
                <div className="p-4 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-stone-900 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-xs">
                      १. Android Package (.apk)
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      hasRealApk
                        ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50'
                        : 'text-amber-800 bg-amber-50 dark:bg-amber-950/50'
                    }`}>
                      {hasRealApk ? 'सिधै डाउनलोड (२८ MB)' : 'क्लाउड बिल्ड हुँदैछ'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    {hasRealApk
                      ? 'कम्प्युटर वा फोनमा सिधै .apk फाइल डाउनलोड गरी इन्स्टल गर्नुहोस् (~२८ MB)।'
                      : 'नयाँ APK फाइल क्लाउडमा तयार भइरहेको छ। तत्काल मोबाइलमा चलाउन २ नम्बरको १-क्लिक इन्स्टल वा QR स्क्यान गर्नुहोस्।'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const targetApk = downloadUrls.androidApk || getApkDirectDownloadUrl();
                      handleStartDownload(
                        targetApk,
                        'nepali-vedic-jyotish-panchanga.apk',
                        'Android APK (.apk)'
                      );
                    }}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform hover:scale-102 cursor-pointer"
                  >
                    {downloadingFile === 'nepali-vedic-jyotish-panchanga.apk' ? (
                      <Check className="w-4 h-4 text-emerald-200" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>Android APK (.apk) सिधै डाउनलोड गर्नुहोस्</span>
                  </button>
                </div>

                {/* Option 2: 1-Click PWA Install */}
                <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-900 dark:text-stone-100 text-xs">
                      २. Instant Web App (१-क्लिक)
                    </span>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md">
                      मोबाइलमै इन्स्टल
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    मोबाइलको ब्राउजरमै १-क्लिकमा होम स्क्रिनमा एप थप्नुहोस् (बिना झन्झट)।
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      if (isInstalled) {
                        setDownloadNotice('यो एप तपाईंको डिभाइसमा पहिले नै स्थापना भइसकेको छ।');
                        return;
                      }
                      if (isInstallable) {
                        const installed = await install();
                        if (installed) {
                          setDownloadNotice('एप सफलतापूर्वक तपाईंको मोबाइलमा स्थापना भयो!');
                        }
                      } else {
                        // If not directly installable, trigger APK download
                        handleStartDownload(
                          downloadUrls.androidApk,
                          'nepali-vedic-jyotish-panchanga.apk',
                          'Android APK (.apk)'
                        );
                      }
                    }}
                    className="w-full py-2.5 px-4 bg-stone-800 dark:bg-stone-700 hover:bg-stone-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform hover:scale-102 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>{isInstalled ? 'एप इन्स्टल भइसकेको छ ✅' : 'मोबाइलमा स्थापना गर्नुहोस् (Install)'}</span>
                  </button>
                </div>
              </div>

              {/* QR Code section for easy mobile scanning */}
              <div className="p-4 bg-stone-100 dark:bg-stone-900/90 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center gap-4 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-stone-300 dark:border-stone-700 shrink-0 shadow-xs flex flex-col items-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrTargetUrl)}`}
                    alt="Mobile APK Download QR Code"
                    className="w-24 h-24 rounded-lg"
                    loading="lazy"
                  />
                  <span className="text-[9px] text-stone-500 font-bold mt-1">Scan for APK</span>
                </div>
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div>
                    <span className="font-bold text-stone-800 dark:text-stone-200 block text-xs">
                      📱 मोबाइल क्यामेराबाट QR स्क्यान गर्नुहोस्
                    </span>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed mt-0.5">
                      कम्प्युटरबाट आफ्नो फोनको क्यामेराले यो कोड स्क्यान गर्दा सिधै <strong>"Download App?"</strong> पपअप खुल्नेछ र १-क्लिकमा APK डाउनलोड हुनेछ।
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-0.5 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.setItem('balananda_force_mobile_app_shell', 'true');
                        window.dispatchEvent(new CustomEvent('mobile-mode-changed'));
                        onClose();
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-[11px] shadow-sm flex items-center gap-1.5 transition-transform hover:scale-102 cursor-pointer"
                    >
                      <span>📱</span>
                      <span>मोबाइल एप प्रत्यक्ष चलाएर हेर्नुहोस् (Live Preview)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPromptPreviewOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] border border-emerald-600/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>पपअप कस्तो खुल्छ जाँच्नुहोस् (Preview Prompt)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MAC */}
          {activeTab === 'MAC' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center justify-center shrink-0">
                  <Apple className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-stone-900 dark:text-stone-100">
                    macOS (Apple Mac) का लागि कम्प्युटर एप
                  </h4>
                  <p className="text-xs text-stone-500">
                    Apple Silicon (M1/M2/M3/M4) तथा Intel Mac समर्थित
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Option 1: DMG */}
                <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                      १. Apple Mac DMG (.dmg)
                    </span>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md">
                      सिफारिस गरिएको
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    DMG फाइल डाउनलोड गरी Applications फोल्डरमा ड्र्याग गर्नुहोस् (~१३७ MB)।
                  </p>
                  <a
                    href={downloadUrls.macDmg}
                    download="nepali-vedic-jyotish-panchanga-1.0.0.dmg"
                    onClick={(e) => {
                      e.preventDefault();
                      handleStartDownload(
                        downloadUrls.macDmg,
                        'nepali-vedic-jyotish-panchanga-1.0.0.dmg',
                        'macOS DMG (.dmg)'
                      );
                    }}
                    className="w-full py-2.5 px-4 bg-stone-900 hover:bg-black text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform hover:scale-102 cursor-pointer"
                  >
                    {downloadingFile === 'nepali-vedic-jyotish-panchanga-1.0.0.dmg' ? (
                      <Check className="w-4 h-4 text-emerald-300" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    macOS DMG सिधै डाउनलोड
                  </a>
                </div>

                {/* Option 2: ARM64 Zip */}
                <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                      २. Apple Silicon Zip (.zip)
                    </span>
                    <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-md">
                      M1/M2/M3/M4
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Apple Silicon चिप भएका नयाँ Mac का लागि कम्प्रेस गरिएको जिप फाइल (~१३४ MB)।
                  </p>
                  <a
                    href={downloadUrls.macZip}
                    download="nepali-vedic-jyotish-panchanga-1.0.0-arm64-mac.zip"
                    onClick={(e) => {
                      e.preventDefault();
                      handleStartDownload(
                        downloadUrls.macZip,
                        'nepali-vedic-jyotish-panchanga-1.0.0-arm64-mac.zip',
                        'macOS ARM64 Zip (.zip)'
                      );
                    }}
                    className="w-full py-2.5 px-4 bg-stone-700 hover:bg-stone-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform hover:scale-102 cursor-pointer"
                  >
                    {downloadingFile === 'nepali-vedic-jyotish-panchanga-1.0.0-arm64-mac.zip' ? (
                      <Check className="w-4 h-4 text-emerald-300" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Apple Silicon Zip सिधै डाउनलोड
                  </a>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/50 text-[11px] text-amber-900 dark:text-amber-300">
                <strong>💡 Mac प्रयोगकर्ताका लागि टिप:</strong> पहिलो पटक खोल्दा 'App from unidentified developer' आएमा Finder मा गई एपमा Right-Click (वा Control+Click) गरी <em>Open</em> रोज्नुहोस्।
              </div>
            </div>
          )}

          {/* TAB 4: IOS */}
          {activeTab === 'IOS' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Smartphone className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-stone-900 dark:text-stone-100">
                    iPhone / iPad (iOS) का लागि स्थापना
                  </h4>
                  <p className="text-xs text-stone-500">
                    iOS Safari Standalone PWA • १००% अफलाइन क्यासिङ समर्थित
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-950/20 space-y-3">
                <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>आईफोनमा इन्स्टल गर्ने सजिलो ३-चरण विधि (Instant Install):</span>
                </div>

                <div className="space-y-2 text-xs text-stone-700 dark:text-stone-300">
                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">१</span>
                    <div>आफ्नो आईफोनको <strong>Safari Browser</strong> मा यो वेबसाइट खोल्नुहोस्।</div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">२</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      तल रहेको <strong>Share Button</strong> (<Share2 className="w-3.5 h-3.5 inline text-blue-600" />) मा थिच्नुहोस्।
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">३</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      सूचीबाट <strong>"Add to Home Screen"</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-purple-600" />) रोजेर माथि <strong>Add</strong> थिच्नुहोस्।
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-900 dark:text-emerald-300 text-[11px] font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>आईफोनको होम स्क्रिनमा सिधै एप बन्नेछ र अफलाइनमा पनि चल्नेछ।</span>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('balananda_force_mobile_app_shell', 'true');
                      window.dispatchEvent(new CustomEvent('mobile-mode-changed'));
                      onClose();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-transform hover:scale-102 cursor-pointer"
                  >
                    <span>📱</span>
                    <span>आईफोन / आईप्याडमा मोबाइल एप प्रत्यक्ष चलाएर हेर्नुहोस् (Live Preview)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security & Verification Footer */}
          <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-center gap-2 text-[11px] text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>सुरक्षित, १००% विज्ञापनरहित तथा आधिकारिक नेपाली वैदिक ज्योतिष प्रणाली</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-100 dark:bg-stone-950 border-t border-[#E6E0D5] dark:border-stone-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs cursor-pointer"
          >
            बन्द गर्नुहोस् (Close)
          </button>
        </div>
      </div>

      {/* Render APK Download Prompt Modal for preview */}
      <ApkDownloadPromptModal
        isOpen={isPromptPreviewOpen}
        onClose={() => setIsPromptPreviewOpen(false)}
        apkUrl={downloadUrls.androidApk}
      />
    </div>
  );
};
