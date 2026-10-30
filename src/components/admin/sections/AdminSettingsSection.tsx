import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Building2,
  Save,
  ShieldAlert,
  DollarSign,
  Globe,
  Lock,
  FileText,
  CloudCheck,
  Sparkles,
  Database,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  Compass,
  HelpCircle,
  Palette,
  ShoppingBag,
  Newspaper,
  HeartHandshake,
  Bot,
  ExternalLink,
  Image as ImageIcon,
  Check,
  Sliders,
  Radio,
  FileCheck,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Zap,
  ArrowRight
} from 'lucide-react';

import {
  PricingConfig,
  getStoredPricingConfig,
  savePricingConfig,
  formatNPRCurrency
} from '../../../db/subscriptionStore';

import {
  ApplicationSettings,
  OrganizationProfile,
  AyanamsaSystem,
  HouseSystem
} from '../../../types/astrology';

import {
  getStoredSettings,
  saveSettings,
  getStoredOrgProfile,
  saveOrgProfile,
  getStoredProfiles,
  saveProfiles
} from '../../../db/profileStore';

import { clearAstroCache, getAstroCacheStats } from '../../../utils/astroCache';
import { clearPersistentErrorStates } from '../../../utils/errorLogger';
import { PrintableLetterheadBanner } from '../../common/PrintableLetterheadBanner';
import { LogoUploadModal } from '../../common/LogoUploadModal';
import { getAssetUrl } from '../../../utils/assetHelper';

export type SettingsSubTab = 'calculations' | 'letterhead' | 'pricing' | 'backup' | 'notice';

export interface AdminSettingsSectionProps {
  initialSubTab?: SettingsSubTab;
  activeSubTab?: SettingsSubTab;
  onSubTabChange?: (tab: SettingsSubTab) => void;
  onNavigateTab?: (tab: string) => void;
}

export const AdminSettingsSection: React.FC<AdminSettingsSectionProps> = ({
  initialSubTab = 'calculations',
  activeSubTab: controlledSubTab,
  onSubTabChange,
  onNavigateTab,
}) => {
  // Active Sub-Tab state
  const [internalSubTab, setInternalSubTab] = useState<SettingsSubTab>(controlledSubTab || initialSubTab);
  const currentSubTab = controlledSubTab !== undefined ? controlledSubTab : internalSubTab;

  const setSubTab = (tab: SettingsSubTab) => {
    setInternalSubTab(tab);
    onSubTabChange?.(tab);
  };

  useEffect(() => {
    if (controlledSubTab && controlledSubTab !== internalSubTab) {
      setInternalSubTab(controlledSubTab);
    }
  }, [controlledSubTab]);

  // Tab 1: Calculations & Astro Engine State
  const [settings, setSettings] = useState<ApplicationSettings>(() => getStoredSettings());
  const [cacheStats, setCacheStats] = useState(() => getAstroCacheStats());
  const [astroSavedToast, setAstroSavedToast] = useState(false);
  const [cacheClearedToast, setCacheClearedToast] = useState(false);
  const [errorClearedToast, setErrorClearedToast] = useState(false);

  // Tab 2: Letterhead & Organization Profile State
  const [orgProfile, setOrgProfile] = useState<OrganizationProfile>(() => getStoredOrgProfile());
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [letterheadSavedToast, setLetterheadSavedToast] = useState(false);

  // Tab 3: Pricing & Commissions State
  const [pricing, setPricing] = useState<PricingConfig>(() => getStoredPricingConfig());
  const [pricingSavedToast, setPricingSavedToast] = useState(false);

  // Tab 4: Cloud Sync & Backup State
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessToast, setExportSuccessToast] = useState(false);
  const [restoreSuccessToast, setRestoreSuccessToast] = useState(false);
  const [restoreErrorToast, setRestoreErrorToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab 5: Global Announcement Banner State
  const [announcementActive, setAnnouncementActive] = useState<boolean>(() => {
    try {
      return localStorage.getItem('balananda_announcement_active') === 'true';
    } catch {
      return false;
    }
  });
  const [announcementTitle, setAnnouncementTitle] = useState<string>(() => {
    try {
      return localStorage.getItem('balananda_announcement_title') || 'महत्वपूर्ण सूचना';
    } catch {
      return 'महत्वपूर्ण सूचना';
    }
  });
  const [announcementText, setAnnouncementText] = useState<string>(() => {
    try {
      return (
        localStorage.getItem('balananda_announcement_text') ||
        'बालानन्द वैदिक सेवामा सबै ग्राहक तथा ज्योतिषीहरूलाई स्वागत छ। अनलाइन परामर्श तथा कुण्डली सेवा उपलब्ध छन्।'
      );
    } catch {
      return 'बालानन्द वैदिक सेवामा सबै ग्राहक तथा ज्योतिषीहरूलाई स्वागत छ।';
    }
  });
  const [noticeSavedToast, setNoticeSavedToast] = useState(false);

  // Save Astro Settings
  const handleSaveAstroSettings = () => {
    saveSettings(settings);
    setAstroSavedToast(true);
    setTimeout(() => setAstroSavedToast(false), 3000);
  };

  // Clear Astro Engine Cache
  const handleClearAstroCache = () => {
    clearAstroCache();
    setCacheStats(getAstroCacheStats());
    setCacheClearedToast(true);
    setTimeout(() => setCacheClearedToast(false), 3000);
  };

  // Clear Persistent Error States
  const handleClearErrorLogs = () => {
    clearPersistentErrorStates({ keepLogs: false, clearSessionStorage: true });
    setErrorClearedToast(true);
    setTimeout(() => setErrorClearedToast(false), 3000);
  };

  // Save Organization Letterhead Profile
  const handleSaveOrgProfile = () => {
    saveOrgProfile(orgProfile);
    setLetterheadSavedToast(true);
    setTimeout(() => setLetterheadSavedToast(false), 3000);
  };

  // Save Pricing Configuration
  const handleSavePricing = () => {
    savePricingConfig(pricing);
    setPricingSavedToast(true);
    setTimeout(() => setPricingSavedToast(false), 3000);
  };

  // Save Announcement Notice
  const handleSaveNotice = () => {
    try {
      localStorage.setItem('balananda_announcement_active', String(announcementActive));
      localStorage.setItem('balananda_announcement_title', announcementTitle);
      localStorage.setItem('balananda_announcement_text', announcementText);
    } catch (e) {
      console.error(e);
    }
    setNoticeSavedToast(true);
    setTimeout(() => setNoticeSavedToast(false), 3000);
  };

  // Full JSON Backup Export
  const handleExportFullBackup = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const backupData = {
          metadata: {
            system: 'Balananda Vaidik Sewa',
            timestamp: new Date().toISOString(),
            exportedBy: 'Super Admin',
            version: '2.5.0',
          },
          settings: getStoredSettings(),
          orgProfile: getStoredOrgProfile(),
          pricingConfig: getStoredPricingConfig(),
          profiles: getStoredProfiles(),
          announcement: {
            active: announcementActive,
            title: announcementTitle,
            text: announcementText,
          },
        };

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonString);
        downloadAnchor.setAttribute(
          'download',
          `balananda_system_backup_${new Date().toISOString().slice(0, 10)}.json`
        );
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        setExportSuccessToast(true);
        setTimeout(() => setExportSuccessToast(false), 4000);
      } catch (err) {
        console.error('Backup export failed:', err);
      } finally {
        setIsExporting(false);
      }
    }, 600);
  };

  // Full JSON Backup Restore
  const handleRestoreBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (!parsed || typeof parsed !== 'object') {
          throw new Error('अवैध ब्याकअप JSON संरचना!');
        }

        if (parsed.settings) {
          saveSettings(parsed.settings);
          setSettings(parsed.settings);
        }
        if (parsed.orgProfile) {
          saveOrgProfile(parsed.orgProfile);
          setOrgProfile(parsed.orgProfile);
        }
        if (parsed.pricingConfig) {
          savePricingConfig(parsed.pricingConfig);
          setPricing(parsed.pricingConfig);
        }
        if (Array.isArray(parsed.profiles)) {
          saveProfiles(parsed.profiles);
        }
        if (parsed.announcement) {
          setAnnouncementActive(Boolean(parsed.announcement.active));
          setAnnouncementTitle(parsed.announcement.title || 'महत्वपूर्ण सूचना');
          setAnnouncementText(parsed.announcement.text || '');
          localStorage.setItem('balananda_announcement_active', String(parsed.announcement.active));
          localStorage.setItem('balananda_announcement_title', parsed.announcement.title || '');
          localStorage.setItem('balananda_announcement_text', parsed.announcement.text || '');
        }

        setRestoreSuccessToast(true);
        setRestoreErrorToast(null);
        setTimeout(() => setRestoreSuccessToast(false), 5000);
      } catch (err: any) {
        console.error('Restore error:', err);
        setRestoreErrorToast(err?.message || 'ब्याकअप फाइल पढ्न सकिएन।');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── TOP HEADER & SUBTAB NAVIGATION BAR ── */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-stone-100 font-serif">
                  केन्द्रीय प्रणाली तथा व्यवस्थापन सेटिङ्स (System Settings Hub)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                ज्योतिष गणना सुत्र, लेटरहेड ब्यानर, कमिसन दर, क्लाउड सिंक, ब्याकअप र यजमान सूचना नियन्त्रण।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-[11px] font-mono px-3 py-1 rounded-xl bg-stone-950 border border-stone-800 text-stone-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              क्लाउड सिंक सक्रिय
            </span>
          </div>
        </div>

        {/* 5 Sub-Tabs Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3.5 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSubTab('calculations')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              currentSubTab === 'calculations'
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md font-black'
                : 'bg-stone-950 hover:bg-stone-800 text-stone-300 border-stone-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>१. प्रणाली तथा ज्योतिष गणना</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('letterhead')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              currentSubTab === 'letterhead'
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md font-black'
                : 'bg-stone-950 hover:bg-stone-800 text-stone-300 border-stone-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>२. लेटरहेड तथा ब्रान्डिङ</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('pricing')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              currentSubTab === 'pricing'
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md font-black'
                : 'bg-stone-950 hover:bg-stone-800 text-stone-300 border-stone-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>३. शुल्क तथा eSewa भुक्तानी</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('backup')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              currentSubTab === 'backup'
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md font-black'
                : 'bg-stone-950 hover:bg-stone-800 text-stone-300 border-stone-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>४. क्लाउड सिंक र ब्याकअप</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('notice')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              currentSubTab === 'notice'
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md font-black'
                : 'bg-stone-950 hover:bg-stone-800 text-stone-300 border-stone-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>५. सूचना र द्रुत लन्चप्याड</span>
          </button>
        </div>
      </div>

      {/* ── SUB-TAB 1: ASTROLOGICAL & SYSTEM CALCULATIONS ── */}
      {currentSubTab === 'calculations' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-stone-100 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-400" />
                  <span>वैदिक ज्योतिष गणना सुत्र तथा अयनांश प्रणाली</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  कुण्डली, पञ्चाङ्ग, ग्रह स्पष्ट र भाव गणनाका लागि आधिकारिक खगोलीय प्यारामिटरहरू।
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveAstroSettings}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{astroSavedToast ? 'सुरक्षित भयो!' : 'गणना सेटिङ बचत गर्नुहोस्'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* Ayanamsha System */}
              <div className="bg-stone-950 border border-stone-800/80 p-4 rounded-2xl space-y-2">
                <label className="block text-stone-300 font-bold">
                  अयनांश प्रणाली (Ayanamsa System)
                </label>
                <select
                  value={settings.ayanamsaSystem}
                  onChange={(e) =>
                    setSettings({ ...settings, ayanamsaSystem: e.target.value as AyanamsaSystem })
                  }
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-stone-100 font-semibold outline-none focus:border-amber-500"
                >
                  <option value="Chitrapaksha">चित्रपक्ष / लाहिरी (Chitrapaksha Lahiri - मानक)</option>
                  <option value="Lahiri">लाहिरी (Lahiri Ephemeris)</option>
                  <option value="KP">के.पी. अयनांश (Krishnamurti Padhdhati)</option>
                  <option value="Raman">बि.भि. रमण (B.V. Raman)</option>
                  <option value="Yukteshwar">युक्तेश्वर (Sri Yukteshwar)</option>
                  <option value="FaganBradley">फागन-ब्र्याडली (Fagan-Bradley)</option>
                  <option value="Sayan">सायन / ट्रपिकल (Tropical / Sayana)</option>
                </select>
                <p className="text-[11px] text-stone-500">
                  नेपाल तथा भारतका आधिकारिक पञ्चाङ्गहरूमा चित्रपक्ष (लाहिरी) अयनांश सर्वमान्य मानिन्छ।
                </p>
              </div>

              {/* Node Calculation Type */}
              <div className="bg-stone-950 border border-stone-800/80 p-4 rounded-2xl space-y-2">
                <label className="block text-stone-300 font-bold">
                  राहु-केतु नोड गणना (Rahu/Ketu Node)
                </label>
                <select
                  value={settings.nodeType}
                  onChange={(e) =>
                    setSettings({ ...settings, nodeType: e.target.value as 'True' | 'Mean' })
                  }
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-stone-100 font-semibold outline-none focus:border-amber-500"
                >
                  <option value="True">ट्रु नोड (True Node - खगोलीय यथार्थ विन्दु)</option>
                  <option value="Mean">मिन नोड (Mean Node - औसत मध्यम गति)</option>
                </select>
                <p className="text-[11px] text-stone-500">
                  आधुनिक कम्प्युटेशनल ज्योतिषमा True Node बढी सुक्ष्म र यथार्थ मानिन्छ।
                </p>
              </div>

              {/* House System */}
              <div className="bg-stone-950 border border-stone-800/80 p-4 rounded-2xl space-y-2">
                <label className="block text-stone-300 font-bold">
                  भाव विभाजन विधि (House System)
                </label>
                <select
                  value={settings.houseSystem}
                  onChange={(e) =>
                    setSettings({ ...settings, houseSystem: e.target.value as HouseSystem })
                  }
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-stone-100 font-semibold outline-none focus:border-amber-500"
                >
                  <option value="Whole Sign">होल साइन (Whole Sign - प्रत्येक राशि एक भाव)</option>
                  <option value="Placidus">प्लासिडस (Placidus / श्रीपति सन्निकट)</option>
                  <option value="Equal">समान भाव (Equal House 30°)</option>
                </select>
                <p className="text-[11px] text-stone-500">
                  वैदिक पराशरी पद्धतिमा Whole Sign (राशितुल्य भाव) अत्यधिक प्रामाणिक मानिन्छ।
                </p>
              </div>

              {/* Chart Style */}
              <div className="bg-stone-950 border border-stone-800/80 p-4 rounded-2xl space-y-2">
                <label className="block text-stone-300 font-bold">
                  कुण्डली चक्र शैली (Kundali Chart Style)
                </label>
                <select
                  value={settings.chartStyle}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      chartStyle: e.target.value as 'North Indian' | 'South Indian' | 'East Indian',
                    })
                  }
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-stone-100 font-semibold outline-none focus:border-amber-500"
                >
                  <option value="North Indian">उत्तर भारतीय (North Indian - हिरा/डायमण्ड आकार)</option>
                  <option value="South Indian">दक्षिण भारतीय (South Indian - घडीको दिशा)</option>
                  <option value="East Indian">पूर्व भारतीय / बंगाली (East Indian / Maithili)</option>
                </select>
                <p className="text-[11px] text-stone-500">
                  नेपाल तथा उत्तर भारतमा हिरा आकार (North Indian) सर्वाधिक लोकप्रिय छ।
                </p>
              </div>

              {/* Theme Mode */}
              <div className="bg-stone-950 border border-stone-800/80 p-4 rounded-2xl space-y-2">
                <label className="block text-stone-300 font-bold">
                  प्रणाली थिम मोड (Theme Mode)
                </label>
                <select
                  value={settings.themeMode}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      themeMode: e.target.value as 'light' | 'dark' | 'system',
                    })
                  }
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-stone-100 font-semibold outline-none focus:border-amber-500"
                >
                  <option value="dark">गाढा वैदिक थिम (Dark Mode - सिफारिस)</option>
                  <option value="light">हल्का सुनौलो थिम (Light Mode)</option>
                  <option value="system">यन्त्र अनुसार (System Default)</option>
                </select>
                <p className="text-[11px] text-stone-500">
                  प्रणालीको मुख्य दृश्य स्वरूप र पृष्ठभूमिको रङ्ग निर्धारण।
                </p>
              </div>

              {/* Professional Jyotishi Mode Toggle */}
              <div className="bg-stone-950 border border-stone-800/80 p-4 rounded-2xl flex flex-col justify-between">
                <div className="space-y-1">
                  <label className="block text-stone-300 font-bold">
                    व्यावसायिक ज्योतिषी मोड (Professional Mode)
                  </label>
                  <p className="text-[11px] text-stone-500">
                    विस्तृत षड्बल, अष्टकवर्ग, सर्वाष्टक र सुक्ष्म दशा चक्र प्रदर्शन गर्ने।
                  </p>
                </div>
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({ ...settings, jyotishiModeEnabled: !settings.jyotishiModeEnabled })
                    }
                    className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors border ${
                      settings.jyotishiModeEnabled
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-stone-900 text-stone-400 border-stone-800'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 ${settings.jyotishiModeEnabled ? 'text-amber-400' : 'text-stone-600'}`}
                    />
                    <span>{settings.jyotishiModeEnabled ? 'सक्रिय छ (Enabled)' : 'निष्क्रिय छ (Disabled)'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Astro Cache & Error Purge Operations */}
            <div className="bg-stone-950/70 border border-amber-500/20 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-xs sm:text-sm text-stone-200">
                    खगोलीय गणना क्यास (Astronomical Cache Memory)
                  </span>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-amber-400">
                    {cacheStats.size} / {cacheStats.maxSize} एन्ट्री
                  </span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Hits: {cacheStats.hits} • Misses: {cacheStats.misses} • क्यास खाली गर्दा एप पुनः नयाँ सुत्रबाट ताजा गणना गर्दछ।
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearAstroCache}
                  className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold text-xs rounded-xl border border-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{cacheClearedToast ? 'क्यास खाली गरियो!' : 'एस्ट्रो क्यास खाली गर्नुहोस्'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearErrorLogs}
                  className="px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 font-bold text-xs rounded-xl border border-rose-800/80 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{errorClearedToast ? 'त्रुटि स्टेट खाली गरियो!' : 'त्रुटि लग स्टेट रिसेट'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 2: LETTERHEAD & OFFICIAL BRANDING ── */}
      {currentSubTab === 'letterhead' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-stone-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>लेटरहेड ब्यानर तथा संस्थागत ब्रान्डिङ (Letterhead Branding)</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  कुण्डली पत्रिका प्रिन्ट, रसिद, बिल तथा आधिकारिक सिफारिस पत्रमा देखिने शीर्ष ब्यानर।
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsLogoModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl text-xs border border-stone-700 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <span>संस्था लोगो परिवर्तन</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveOrgProfile}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{letterheadSavedToast ? 'सुरक्षित भयो!' : 'लेटरहेड बचत गर्नुहोस्'}</span>
                </button>
              </div>
            </div>

            {/* Live Interactive Preview Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  लेटरहेड ब्यानर प्रत्यक्ष पूर्वावलोकन (Live Letterhead Banner Preview)
                </span>
                <span className="text-[10px] text-stone-500">A4 तथा पत्रिका मुद्रणमा ठ्याक्कै यस्तै देखिन्छ</span>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-amber-500/40 shadow-inner overflow-hidden">
                <PrintableLetterheadBanner orgProfile={orgProfile} />
              </div>
            </div>

            {/* Editable Form Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="block text-stone-300 font-bold">संस्था / कार्यालयको नाम (नेपाली)</label>
                <input
                  type="text"
                  value={orgProfile.name}
                  onChange={(e) => setOrgProfile({ ...orgProfile, name: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 font-semibold focus:border-amber-500 outline-none"
                  placeholder="बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-stone-300 font-bold">आधिकारिक फोन / WhatsApp</label>
                <input
                  type="text"
                  value={orgProfile.phone}
                  onChange={(e) => setOrgProfile({ ...orgProfile, phone: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 font-mono focus:border-amber-500 outline-none"
                  placeholder="+९७७-९७६४४००५३३"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-stone-300 font-bold">आधिकारिक इमेल ठेगाना</label>
                <input
                  type="email"
                  value={orgProfile.email}
                  onChange={(e) => setOrgProfile({ ...orgProfile, email: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 font-mono focus:border-amber-500 outline-none"
                  placeholder="suwashdmk@gmail.com"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-stone-300 font-bold">कार्यालय ठेगाना</label>
                <input
                  type="text"
                  value={orgProfile.address}
                  onChange={(e) => setOrgProfile({ ...orgProfile, address: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:border-amber-500 outline-none"
                  placeholder="काठमाडौँ, नेपाल"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-stone-300 font-bold">वेबसाइट / वेब ठेगाना</label>
                <input
                  type="text"
                  value={orgProfile.website || ''}
                  onChange={(e) => setOrgProfile({ ...orgProfile, website: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 font-mono focus:border-amber-500 outline-none"
                  placeholder="balananda-vaidik-sewa.web.app"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-stone-300 font-bold">दर्ता नम्बर (Registration No)</label>
                <input
                  type="text"
                  value={orgProfile.registeredNo || ''}
                  onChange={(e) => setOrgProfile({ ...orgProfile, registeredNo: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:border-amber-500 outline-none"
                  placeholder="दर्ता नं. १२३४/०८०"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-stone-300 font-bold">स्थायी लेखा नम्बर (PAN No)</label>
                <input
                  type="text"
                  value={orgProfile.panNo || ''}
                  onChange={(e) => setOrgProfile({ ...orgProfile, panNo: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 font-mono focus:border-amber-500 outline-none"
                  placeholder="PAN: ६०१२३४५६७"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="block text-stone-300 font-bold">संस्थाको मूल आदर्श वाक्य (Tagline)</label>
                <input
                  type="text"
                  value={orgProfile.tagline || ''}
                  onChange={(e) => setOrgProfile({ ...orgProfile, tagline: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 focus:border-amber-500 outline-none"
                  placeholder="नेपालकै सबैभन्दा भरपर्दो वैदिक सेवा • सनातन धर्म र प्रामाणिक वास्तुको संगम"
                />
              </div>

              <div className="space-y-1 md:col-span-3">
                <label className="block text-stone-300 font-bold">शीर्ष मङ्गल श्लोक (Invocation Mantra)</label>
                <input
                  type="text"
                  value={orgProfile.mangalShloka || ''}
                  onChange={(e) => setOrgProfile({ ...orgProfile, mangalShloka: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 font-serif focus:border-amber-500 outline-none"
                  placeholder="॥ श्री गणेशाय नमः ॥ ॥ श्री वास्तुपुरुषाय नमः ॥ ॥ श्री कुलदेवतायै नमः ॥"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-3 bg-stone-950 p-3 rounded-xl border border-stone-800">
                <input
                  type="checkbox"
                  id="showLogoBills"
                  checked={orgProfile.showLogoOnBills}
                  onChange={(e) => setOrgProfile({ ...orgProfile, showLogoOnBills: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 cursor-pointer"
                />
                <label htmlFor="showLogoBills" className="text-stone-300 font-bold cursor-pointer">
                  रसिद तथा बिलहरूमा संस्थाको लोगो मुद्रण गर्ने
                </label>
              </div>

              <div className="flex items-center gap-3 bg-stone-950 p-3 rounded-xl border border-stone-800">
                <input
                  type="checkbox"
                  id="showPhotoReports"
                  checked={orgProfile.showPhotoOnReports}
                  onChange={(e) => setOrgProfile({ ...orgProfile, showPhotoOnReports: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 cursor-pointer"
                />
                <label htmlFor="showPhotoReports" className="text-stone-300 font-bold cursor-pointer">
                  विस्तृत फलादेश प्रतिवेदनमा प्रमुखको तस्विर देखाउने
                </label>
              </div>
            </div>
          </div>

          {/* Logo Upload Modal */}
          {isLogoModalOpen && (
            <LogoUploadModal
              isOpen={isLogoModalOpen}
              onClose={() => setIsLogoModalOpen(false)}
              onLogoUpdated={(newUrl) => {
                setOrgProfile((prev) => ({
                  ...prev,
                  logoUrl: newUrl || '/logo.png',
                }));
              }}
            />
          )}
        </div>
      )}

      {/* ── SUB-TAB 3: PRICING, COMMISSIONS & ESEWA ── */}
      {currentSubTab === 'pricing' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-stone-100 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <span>प्लेटफर्म कमिसन दर, सेवा शुल्क तथा eSewa भुक्तानी खाता</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  ज्योतिष, वास्तु र कर्मकाण्ड सेवाको आधार शुल्क दर र आधिकारिक eSewa भुक्तानी विवरण।
                </p>
              </div>

              <button
                type="button"
                onClick={handleSavePricing}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{pricingSavedToast ? 'सुरक्षित भयो!' : 'शुल्क दर बचत गर्नुहोस्'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Left Column: Fees & Commissions */}
              <div className="bg-stone-950 border border-stone-800/80 p-5 rounded-2xl space-y-4">
                <h4 className="font-bold text-stone-200 text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>सेवा परामर्श आधार शुल्क दर (NPR)</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-stone-400 mb-1 font-bold">
                      प्लेटफर्म कमिसन दर (%) (Commission Percent)
                    </label>
                    <input
                      type="number"
                      value={(pricing as any).commissionPercentRate || 10}
                      onChange={(e) =>
                        setPricing({
                          ...pricing,
                          commissionPercentRate: Number(e.target.value),
                        } as any)
                      }
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 font-mono font-bold focus:border-amber-500 outline-none"
                    />
                    <p className="text-[10px] text-stone-500 mt-1">
                      विशेषज्ञ ज्योतिषीहरूको अनलाइन परामर्शबाट प्लेटफर्मले लिने प्रतिशत।
                    </p>
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1 font-bold">
                      ज्योतिष परामर्श आधार शुल्क (Jyotish Consultation Fee)
                    </label>
                    <input
                      type="number"
                      value={(pricing as any).serviceRates?.jyotishConsultationNPR || 1000}
                      onChange={(e) =>
                        setPricing({
                          ...pricing,
                          serviceRates: {
                            ...((pricing as any).serviceRates || {}),
                            jyotishConsultationNPR: Number(e.target.value),
                          },
                        } as any)
                      }
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 font-mono font-bold focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1 font-bold">
                      वास्तु परामर्श आधार शुल्क (Vastu Consultation Fee)
                    </label>
                    <input
                      type="number"
                      value={(pricing as any).serviceRates?.vastuConsultationNPR || 2500}
                      onChange={(e) =>
                        setPricing({
                          ...pricing,
                          serviceRates: {
                            ...((pricing as any).serviceRates || {}),
                            vastuConsultationNPR: Number(e.target.value),
                          },
                        } as any)
                      }
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 font-mono font-bold focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1 font-bold">
                      कर्मकाण्ड पूजा आधार शुल्क (Karmakanda Pooja Fee)
                    </label>
                    <input
                      type="number"
                      value={(pricing as any).serviceRates?.karmakandaPoojaNPR || 5000}
                      onChange={(e) =>
                        setPricing({
                          ...pricing,
                          serviceRates: {
                            ...((pricing as any).serviceRates || {}),
                            karmakandaPoojaNPR: Number(e.target.value),
                          },
                        } as any)
                      }
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 font-mono font-bold focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: eSewa Official Account */}
              <div className="bg-stone-950 border border-stone-800/80 p-5 rounded-2xl space-y-4">
                <h4 className="font-bold text-stone-200 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#60BB46]/20 text-[#60BB46] font-bold flex items-center justify-center text-xs">
                    e
                  </span>
                  <span>eSewa भुक्तानी खाता विवरण (Official eSewa Gateway)</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-stone-400 mb-1 font-bold">
                      eSewa आधिकारिक प्राप्तकर्ता मोबाइल (eSewa ID)
                    </label>
                    <input
                      type="text"
                      defaultValue={(pricing as any).esewaReceiverPhone || '9764400533'}
                      onChange={(e) =>
                        setPricing({
                          ...pricing,
                          esewaReceiverPhone: e.target.value,
                        } as any)
                      }
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 font-mono font-bold focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1 font-bold">
                      eSewa आधिकारिक खातावालाको नाम (Account Holder Name)
                    </label>
                    <input
                      type="text"
                      defaultValue={(pricing as any).esewaAccountName || 'सुवास घिमिरे (बालानन्द वैदिक सेवा)'}
                      onChange={(e) =>
                        setPricing({
                          ...pricing,
                          esewaAccountName: e.target.value,
                        } as any)
                      }
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 font-bold focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div className="p-3.5 bg-emerald-950/30 border border-emerald-800/40 rounded-xl space-y-1">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      प्रत्यक्ष भुक्तानी प्रमाणीकरण प्रणाली
                    </span>
                    <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                      ग्राहकले eSewa मार्फत गरेको भुक्तानीको Transaction ID तथा स्क्रिनसट सुपरएडमिन फाइनान्स मोड्युलमा
                      १-क्लिकमा प्रमाणीकरण गर्न सकिन्छ।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 4: CLOUD SYNC & SYSTEM BACKUP ── */}
      {currentSubTab === 'backup' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-6">
            <div className="border-b border-stone-800 pb-3">
              <h3 className="text-sm sm:text-base font-bold text-stone-100 flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" />
                <span>क्लाउड सिंक स्थिति तथा पूर्ण ब्याकअप केन्द्र (Cloud Sync & Backup)</span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                सम्पूर्ण प्रयोगकर्ता कुण्डली, बुकिङ, पञ्चाङ्ग गणना र सेटिङ्सको १-क्लिक JSON ब्याकअप र पुनर्स्थापना।
              </p>
            </div>

            {/* Cloud Status Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-stone-950 border border-emerald-500/30 p-4 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-300">क्लाउड डाटाबेस स्थिति</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-sm font-extrabold text-emerald-400 font-mono">
                  PostgreSQL Online
                </div>
                <p className="text-[11px] text-stone-400">
                  रेन्डर API क्लाउड तथा स्थानीय क्यास पूर्ण सिंकमा छन्।
                </p>
              </div>

              <div className="bg-stone-950 border border-amber-500/30 p-4 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-300">स्थानीय कुण्डली अभिलेख</span>
                  <Database className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-sm font-extrabold text-amber-300 font-mono">
                  {getStoredProfiles().length} कुण्डली सुरक्षित
                </div>
                <p className="text-[11px] text-stone-400">
                  ब्राउजर LocalStorage तथा क्लाउडमा सुरक्षित भण्डारण।
                </p>
              </div>

              <div className="bg-stone-950 border border-stone-800 p-4 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-300">डेटा इन्क्रिप्शन</span>
                  <Lock className="w-4 h-4 text-stone-400" />
                </div>
                <div className="text-sm font-extrabold text-stone-200 font-mono">
                  AES-256 TLS 1.3
                </div>
                <p className="text-[11px] text-stone-400">
                  व्यक्तिगत जन्म विवरण र परामर्श पूर्णतया गोप्य।
                </p>
              </div>
            </div>

            {/* Backup & Restore Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 1. Export JSON */}
              <div className="bg-stone-950 border border-stone-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-amber-400" />
                    <h4 className="font-bold text-stone-100 text-sm">
                      पूर्ण प्रणाली JSON ब्याकअप डाउनलोड (Full Export)
                    </h4>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    प्रणालीका सम्पूर्ण कुण्डलीहरू, संस्थागत लेटरहेड, अयनांश सेटिङ, शुल्क दर र सूचनाहरूको
                    पूर्ण JSON संग्रह फाइल डाउनलोड गर्नुहोस्।
                  </p>
                </div>

                {exportSuccessToast && (
                  <div className="p-2.5 bg-emerald-950/60 border border-emerald-700 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ब्याकअप फाइल सफलतापूर्वक डाउनलोड भयो!
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleExportFullBackup}
                  disabled={isExporting}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-stone-950 font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'ब्याकअप फाइल तयार हुँदैछ...' : '१-क्लिक ब्याकअप JSON डाउनलोड'}</span>
                </button>
              </div>

              {/* 2. Restore JSON */}
              <div className="bg-stone-950 border border-stone-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-bold text-stone-100 text-sm">
                      JSON ब्याकअपबाट पुनर्स्थापना (Restore from JSON)
                    </h4>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    अघिल्लो सुरक्षित ब्याकअप JSON फाइल अपलोड गरी प्रणालीका सबै सेटिङ, प्रोफाइल र रेकर्डहरू पुनर्स्थापना गर्नुहोस्।
                  </p>
                </div>

                {restoreSuccessToast && (
                  <div className="p-2.5 bg-emerald-950/60 border border-emerald-700 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ब्याकअप सफलतापूर्वक पुनर्स्थापना भयो!
                  </div>
                )}

                {restoreErrorToast && (
                  <div className="p-2.5 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    {restoreErrorToast}
                  </div>
                )}

                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json"
                    onChange={handleRestoreBackupFile}
                    className="hidden"
                    id="restoreFileInput"
                  />
                  <label
                    htmlFor="restoreFileInput"
                    className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-xl text-xs border border-stone-700 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>ब्याकअप JSON फाइल छान्नुहोस् र रिस्टोर गर्नुहोस्</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 5: NOTICE BROADCAST & QUICK LAUNCHPAD ── */}
      {currentSubTab === 'notice' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 space-y-6">
            {/* Global Notice Broadcast Section */}
            <div className="space-y-4 border-b border-stone-800 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-100 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <span>यजमान तथा ग्राहक सार्वजनिक सूचना प्रसारण (Public Notice Broadcast)</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    एपको मुख्य पृष्ठमा सबै आगन्तुक तथा ग्राहकहरूलाई देखिने आधिकारिक ब्यानर सन्देश।
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveNotice}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Save className="w-4 h-4" />
                  <span>{noticeSavedToast ? 'प्रसारण सुरक्षित भयो!' : 'सूचना प्रसारण बचत'}</span>
                </button>
              </div>

              <div className="bg-stone-950 border border-stone-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="announcementActive"
                      checked={announcementActive}
                      onChange={(e) => setAnnouncementActive(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 cursor-pointer"
                    />
                    <label htmlFor="announcementActive" className="text-xs font-bold text-stone-200 cursor-pointer">
                      सार्वजनिक सूचना ब्यानर सक्रिय गर्नुहोस् (Enable Notice Banner)
                    </label>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      announcementActive
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-stone-900 text-stone-500 border border-stone-800'
                    }`}
                  >
                    {announcementActive ? 'लाइभ देखिन्छ' : 'हाल बन्द छ'}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="block text-stone-400 text-xs font-bold">सूचना शीर्षक (Title)</label>
                  <input
                    type="text"
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 font-bold text-xs focus:border-amber-500 outline-none"
                    placeholder="महत्वपूर्ण सूचना"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-stone-400 text-xs font-bold">सूचना विवरण (Notice Message)</label>
                  <textarea
                    rows={3}
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-stone-100 text-xs leading-relaxed focus:border-amber-500 outline-none"
                    placeholder="बालानन्द वैदिक सेवामा सबै ग्राहक तथा ज्योतिषीहरूलाई स्वागत छ..."
                  />
                </div>
              </div>
            </div>

            {/* 5 Quick Launchpad Shortcuts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-stone-200 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>द्रुत व्यवस्थापन लन्चप्याड (Super Admin Quick Launchpad)</span>
                </h4>
                <span className="text-[10px] text-stone-500">१-क्लिकमा सम्बन्धित मोड्युलमा जानुहोस्</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* 1. Store Admin */}
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('store_pos')}
                  className="bg-stone-950 hover:bg-stone-800/80 border border-stone-800 hover:border-amber-500/50 p-3.5 rounded-2xl flex items-center justify-between group transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-stone-200 group-hover:text-amber-300 block">
                        स्टोर एवं पुस्तकालय एडमिन
                      </span>
                      <span className="text-[10px] text-stone-500 block">
                        सामग्री, PDF ग्रन्थ तथा अर्डर
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </button>

                {/* 2. POS Counter */}
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('store_pos')}
                  className="bg-stone-950 hover:bg-stone-800/80 border border-stone-800 hover:border-indigo-500/50 p-3.5 rounded-2xl flex items-center justify-between group transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-stone-200 group-hover:text-indigo-300 block">
                        काउन्टर POS बिलिङ टर्मिनल
                      </span>
                      <span className="text-[10px] text-stone-500 block">
                        प्रत्यक्ष काउन्टर बिक्री र रसिद
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </button>

                {/* 3. News Editor */}
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('samachar_editor')}
                  className="bg-stone-950 hover:bg-stone-800/80 border border-stone-800 hover:border-emerald-500/50 p-3.5 rounded-2xl flex items-center justify-between group transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Newspaper className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-stone-200 group-hover:text-emerald-300 block">
                        समाचार तथा लेख सम्पादक
                      </span>
                      <span className="text-[10px] text-stone-500 block">
                        पञ्चाङ्ग, राशिफल तथा खगोल लेख
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </button>

                {/* 4. Vivah Portal */}
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('vivah_portal')}
                  className="bg-stone-950 hover:bg-stone-800/80 border border-stone-800 hover:border-rose-500/50 p-3.5 rounded-2xl flex items-center justify-between group transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-stone-200 group-hover:text-rose-300 block">
                        विवाह बायोडाटा सुपरभाइजर
                      </span>
                      <span className="text-[10px] text-stone-500 block">
                        वैवाहिक प्रोफाइल प्रमाणीकरण
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-600 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
                </button>

                {/* 5. Daily WhatsApp Dispatch */}
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('daily_whatsapp')}
                  className="bg-stone-950 hover:bg-stone-800/80 border border-stone-800 hover:border-green-500/50 p-3.5 rounded-2xl flex items-center justify-between group transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/15 text-green-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-stone-200 group-hover:text-green-300 block">
                        दैनिक ह्वाट्सएप डिस्प्याच
                      </span>
                      <span className="text-[10px] text-stone-500 block">
                        पञ्चाङ्ग तथा राशिफल सन्देश प्रसारण
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-600 group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
