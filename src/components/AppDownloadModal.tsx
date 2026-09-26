import React, { useState } from 'react';
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
  FileCheck
} from 'lucide-react';

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

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const GITHUB_REPO_URL = 'https://github.com/subashbhai/nepali-vedic-jyotish-panchanga';
  const RELEASES_URL = `${GITHUB_REPO_URL}/releases/latest`;

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
                    डेस्कटप आइकन, स्टार्ट मेनु र स्वचालित अटो-अपडेटसहित कम्प्युटरमा इन्स्टल हुन्छ।
                  </p>
                  <a
                    href={`${RELEASES_URL}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 bg-[#7A1C1C] hover:bg-[#991B1B] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform hover:scale-102"
                  >
                    <Download className="w-4 h-4" />
                    Setup (.exe) डाउनलोड गर्नुहोस्
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
                    पेनड्राइभ वा कुनै पनि फोल्डरमा राखेर सिधै डबल-क्लिक गरी चलाउन मिल्ने।
                  </p>
                  <a
                    href={`${RELEASES_URL}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 bg-stone-800 dark:bg-stone-700 hover:bg-stone-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform hover:scale-102"
                  >
                    <Download className="w-4 h-4" />
                    Portable (.exe) डाउनलोड गर्नुहोस्
                  </a>
                </div>
              </div>

              {/* Live update notice */}
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-950 dark:text-amber-200">
                <RefreshCw className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-spin-slow" />
                <div>
                  <strong>स्वचालित लाइभ अपडेट:</strong> तपाईंले एप चलाइरहँदा नयाँ सुधार वा सुविधाहरू थपिएमा एपले स्वतः पहिचान गरी कम्प्युटरमै नयाँ संस्करण अपडेट गरिदिनेछ।
                </div>
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
                  <h4 className="font-bold text-base text-stone-900 dark:text-stone-100">
                    Android का लागि मोबाइल एप (.apk)
                  </h4>
                  <p className="text-xs text-stone-500">
                    Android 8.0 देखि Android 15+ समर्थित • १००% अफलाइन पञ्चाङ्ग र कुण्डली
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-900 dark:text-emerald-300">
                    Direct Android Package (APK)
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-white dark:bg-emerald-900/40 px-2 py-0.5 rounded-full font-bold">
                    Latest Build
                  </span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  सीधै आफ्नो एन्ड्रोइड फोनमा डाउनलोड गरी इन्स्टल गर्नुहोस्। इन्स्टल गर्दा 'Install from Unknown Sources' अनुमति दिनुहोस्।
                </p>
                <a
                  href={`${RELEASES_URL}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-transform hover:scale-102"
                >
                  <Download className="w-4 h-4" />
                  Android APK डाउनलोड गर्नुहोस् (.apk)
                </a>
              </div>

              <div className="p-3.5 bg-stone-100 dark:bg-stone-900 rounded-2xl space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
                <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> मोबाइलमा इन्स्टल गर्ने तरिका:
                </span>
                <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px]">
                  <li>माथिको हरियो बटन थिचेर APK फाइल डाउनलोड गर्नुहोस्।</li>
                  <li>डाउनलोड सकिएपछि फाइलमा क्लिक गरी "Install" रोज्नुहोस्।</li>
                  <li>एप खोल्नुहोस् र बिना इन्टरनेट जुनसुकै स्थानमा कुण्डली तथा पञ्चाङ्ग प्रयोग गर्नुहोस्।</li>
                </ol>
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
                    macOS (Apple Mac) का लागि कम्प्युटर एप (.dmg)
                  </h4>
                  <p className="text-xs text-stone-500">
                    Apple Silicon (M1/M2/M3/M4) तथा Intel Mac समर्थित
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 space-y-3">
                <span className="font-bold text-xs text-stone-900 dark:text-stone-100 block">
                  Apple Mac Installer (.dmg)
                </span>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  DMG फाइल डाउनलोड गरी सिधै आफ्नो Applications फोल्डरमा ड्र्याग गर्नुहोस्।
                </p>
                <a
                  href={`${RELEASES_URL}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 bg-stone-900 hover:bg-black text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-transform hover:scale-102"
                >
                  <Download className="w-4 h-4" />
                  macOS DMG डाउनलोड गर्नुहोस् (.dmg)
                </a>
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
              </div>
            </div>
          )}

          {/* GitHub Repository Reference */}
          <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>आधिकारिक खुला स्रोत भण्डार: <strong>subashbhai/nepali-vedic-jyotish-panchanga</strong></span>
            </div>
            <a
              href={RELEASES_URL}
              target="_blank"
              rel="noreferrer"
              className="text-[#7A1C1C] dark:text-amber-400 font-bold hover:underline flex items-center gap-1"
            >
              <span>सबै रिलिज तथा चेन्जलोग हेर्नुहोस्</span>
              <ExternalLink className="w-3 h-3" />
            </a>
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
    </div>
  );
};
