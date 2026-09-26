import React, { useState, useEffect, useMemo } from 'react';
import { X, Settings as SettingsIcon, Check, ShieldCheck, AlertCircle, Trash2, FileText, RefreshCw, Compass, CheckCircle2, RotateCcw, Building2, Eye, Camera } from 'lucide-react';
import { ApplicationSettings, AyanamsaSystem, HouseSystem, OrganizationProfile } from '../types/astrology';
import { getErrorLogs, clearPersistentErrorStates, subscribeToErrorLogs, ERROR_LOG_STORAGE_KEY } from '../utils/errorLogger';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';
import { ErrorLogModal } from './ErrorLogModal';
import { AYANAMSA_SYSTEM_LIST, getAyanamsaMetadata, calculateAyanamsaValue, formatAyanamsaDMS } from '../utils/ayanamsaEngine';
import { clearAstroCache } from '../utils/astroCache';
import { canonicalJulianDay } from '../utils/canonicalAstroEngine';
import { PrintableLetterheadBanner } from './common/PrintableLetterheadBanner';
import { DEFAULT_ORG_PROFILE } from '../db/profileStore';
import { LogoUploadModal } from './common/LogoUploadModal';
import { getAssetUrl, handleImageFallback } from '../utils/assetHelper';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ApplicationSettings;
  onSaveSettings: (settings: ApplicationSettings) => void;
  orgProfile?: OrganizationProfile;
  onSaveOrgProfile?: (org: OrganizationProfile) => void;
  initialTab?: 'astro' | 'letterhead';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  orgProfile,
  onSaveOrgProfile,
  initialTab = 'astro',
}) => {
  const [activeTab, setActiveTab] = useState<'astro' | 'letterhead'>(initialTab);
  const [ayanamsaSystem, setAyanamsaSystem] = useState<AyanamsaSystem>(settings?.ayanamsaSystem || 'Chitrapaksha');
  const [nodeType, setNodeType] = useState<'Mean' | 'True'>(settings?.nodeType || 'Mean');
  const [houseSystem, setHouseSystem] = useState<HouseSystem>(settings?.houseSystem || 'Placidus');
  const [chartStyle, setChartStyle] = useState<'North Indian' | 'South Indian' | 'East Indian'>(settings?.chartStyle || 'North Indian');
  const [jyotishiModeEnabled, setJyotishiModeEnabled] = useState(!!settings?.jyotishiModeEnabled);
  const [astrologerName, setAstrologerName] = useState(settings?.astrologerName || '');
  const [organizationName, setOrganizationName] = useState(settings?.organizationName || '');
  const [errorLogCount, setErrorLogCount] = useState(0);
  const [isErrorLogModalOpen, setIsErrorLogModalOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [clearedFeedback, setClearedFeedback] = useState<string | null>(null);
  const [orgFormData, setOrgFormData] = useState<OrganizationProfile>(orgProfile || DEFAULT_ORG_PROFILE);

  const refreshLogCount = () => {
    setErrorLogCount(getErrorLogs().length);
  };

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setAyanamsaSystem(settings?.ayanamsaSystem || 'Chitrapaksha');
      setNodeType(settings?.nodeType || 'Mean');
      setHouseSystem(settings?.houseSystem || 'Placidus');
      setChartStyle(settings?.chartStyle || 'North Indian');
      setJyotishiModeEnabled(!!settings?.jyotishiModeEnabled);
      setAstrologerName(settings?.astrologerName || '');
      setOrganizationName(settings?.organizationName || '');
      setOrgFormData(orgProfile ? { ...DEFAULT_ORG_PROFILE, ...orgProfile } : DEFAULT_ORG_PROFILE);
      refreshLogCount();
      const unsub = subscribeToErrorLogs(refreshLogCount);
      return () => unsub();
    }
  }, [isOpen, settings, orgProfile, initialTab]);

  const handleClearPersistentErrors = () => {
    clearPersistentErrorStates({ keepLogs: false, clearSessionStorage: true });
    refreshLogCount();
    setClearedFeedback('स्थायी त्रुटि अवस्था तथा क्यास सफा गरियो!');
    setTimeout(() => setClearedFeedback(null), 3000);
  };

  const selectedMeta = useMemo(() => {
    return getAyanamsaMetadata(ayanamsaSystem);
  }, [ayanamsaSystem]);

  const todayJd = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return canonicalJulianDay(todayStr, '06:00', 5.75).jdUT;
  }, []);

  const currentValDeg = useMemo(() => {
    return calculateAyanamsaValue(todayJd, ayanamsaSystem);
  }, [todayJd, ayanamsaSystem]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clear astronomical cache so all components immediately recalculate with the new Ayanamsa
    clearAstroCache();
    onSaveSettings({
      ...settings,
      ayanamsaSystem,
      nodeType,
      houseSystem,
      chartStyle,
      jyotishiModeEnabled,
      astrologerName: orgFormData.astrologerName || astrologerName,
      organizationName: orgFormData.name || organizationName,
    });
    if (onSaveOrgProfile) {
      onSaveOrgProfile(orgFormData);
    }
    onClose();
  };

  const handleResetOrgToDefault = () => {
    if (window.confirm('के तपाईं पूर्वनिर्धारित बालानन्द ब्यानर तथा विवरण पुनर्स्थापित गर्न चाहनुहुन्छ?')) {
      setOrgFormData(DEFAULT_ORG_PROFILE);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 text-[#2D241E] dark:text-stone-100 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 w-full max-w-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#FDFCF8] dark:bg-stone-800/80 p-4 sm:p-5 border-b border-[#E6E0D5] dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-[#D97706]" />
            <h2 className="text-lg font-bold font-serif text-[#1A1A1A] dark:text-stone-100">प्रणाली सेटिङ तथा ब्रान्डिङ</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#78716C] hover:text-[#1A1A1A] dark:text-stone-400 dark:hover:text-stone-100 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E6E0D5] dark:border-stone-800 bg-[#FAF8F5] dark:bg-stone-900/60 px-4 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('astro')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'astro'
                ? 'border-[#D97706] text-[#D97706]'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>🖩 ज्योतिषीय गणना एवं अयनांश</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('letterhead')}
            className={`flex items-center gap-2 py-3 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'letterhead'
                ? 'border-[#D97706] text-[#D97706]'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>📜 आधिकारिक लेटरहेड तथा प्रिन्ट ब्यानर</span>
            <span className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 text-[10px] px-1.5 py-0.5 rounded font-bold">
              कस्टमाइजेसन
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {/* TAB 1: ASTROLOGICAL & SYSTEM CALCULATION SETTINGS */}
          {activeTab === 'astro' && (
            <div className="space-y-4">
              {/* Ayanamsa Selection with live calculation & descriptive guide */}
              <div className="space-y-2 p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40">
                <div className="flex items-center justify-between">
                  <label htmlFor="ayanamsa-system-select" className="font-bold text-[#2D241E] dark:text-stone-200 flex items-center gap-1.5 text-xs">
                    <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>अयनांश प्रणाली (Ayanamsa System)</span>
                  </label>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300/60 dark:border-amber-700/60">
                    मान: {formatAyanamsaDMS(currentValDeg)}
                  </span>
                </div>

                <select
                  id="ayanamsa-system-select"
                  value={ayanamsaSystem === 'Lahiri' ? 'Chitrapaksha' : ayanamsaSystem}
                  onChange={(e) => setAyanamsaSystem(e.target.value as AyanamsaSystem)}
                  className="w-full bg-white dark:bg-stone-800 border border-amber-300/80 dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-semibold text-[#2D241E] dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                >
                  {AYANAMSA_SYSTEM_LIST.map((sys) => (
                    <option key={sys.id} value={sys.id}>
                      {sys.nameNepali} {sys.isNationalStandard ? '★ (राष्ट्रिय मानक)' : ''}
                    </option>
                  ))}
                </select>

                {/* Dynamic system explanation & offset card */}
                <div className="rounded-lg p-2.5 bg-white/95 dark:bg-stone-900/90 border border-amber-200 dark:border-amber-900/40 text-[11px] space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between text-stone-700 dark:text-stone-300">
                    <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                      <span>सन्दर्भ / आधार:</span>
                      <span className="font-normal text-stone-600 dark:text-stone-400">{selectedMeta.epochInfo}</span>
                    </span>
                    <span className="font-mono text-stone-500 dark:text-stone-400 text-[10px]">
                      अन्तर: {selectedMeta.offsetDescription}
                    </span>
                  </div>

                  <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-[11px]">
                    {selectedMeta.descriptionNepali}
                  </p>

                  <div className="pt-1.5 flex items-center gap-1.5 text-[10.5px] text-emerald-800 dark:text-emerald-300 font-medium border-t border-amber-100 dark:border-stone-800">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>अयनांश सुरक्षित हुनासाथ सक्रिय कुण्डलीको लग्न, ग्रह स्पष्ट, नक्षत्र पाद तथा दशा स्वतः पुनर्गणना हुन्छ।</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2D241E] dark:text-stone-300 mb-1">राहु-केतु गणना (Node Type)</label>
                <select
                  value={nodeType}
                  onChange={(e) => setNodeType(e.target.value as 'Mean' | 'True')}
                  className="w-full bg-[#FDFCF8] dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 text-[#2D241E] dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                >
                  <option value="True">True Nodes (वास्तविक अंश - Recommended)</option>
                  <option value="Mean">Mean Nodes (औसत अंश)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#2D241E] dark:text-stone-300 mb-1">कुण्डली चक्र शैली (Default Chart Style)</label>
                <select
                  value={chartStyle}
                  onChange={(e) => setChartStyle(e.target.value as any)}
                  className="w-full bg-[#FDFCF8] dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 text-[#2D241E] dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                >
                  <option value="North Indian">उत्तर भारतीय (North Indian Diamond Style)</option>
                  <option value="South Indian">दक्षिण भारतीय (South Indian Square Style)</option>
                  <option value="East Indian">पूर्वी भारतीय (East Indian Style)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-[#E6E0D5] dark:border-stone-800 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="jyotishi_mode"
                    checked={jyotishiModeEnabled}
                    onChange={(e) => setJyotishiModeEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D97706] focus:ring-[#D97706]"
                  />
                  <label htmlFor="jyotishi_mode" className="font-bold text-[#1A1A1A] dark:text-stone-200">
                    प्रोफेसर / ज्योतिषी मोड (Astrologer Branding Mode)
                  </label>
                </div>

                {jyotishiModeEnabled && (
                  <div className="space-y-2 pl-6">
                    <div>
                      <label className="block text-[11px] text-[#78716C] dark:text-stone-400 mb-1">ज्योतिषीको नाम</label>
                      <input
                        type="text"
                        value={astrologerName}
                        onChange={(e) => setAstrologerName(e.target.value)}
                        className="w-full bg-[#FDFCF8] dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-1.5 text-[#2D241E] dark:text-stone-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#78716C] dark:text-stone-400 mb-1">संस्था / कार्यालयको नाम</label>
                      <input
                        type="text"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        className="w-full bg-[#FDFCF8] dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-1.5 text-[#2D241E] dark:text-stone-100"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* System Health & Error Log Section */}
              <div className="pt-3 border-t border-[#E6E0D5] dark:border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                    <span className="font-bold text-[#1A1A1A] dark:text-stone-200">
                      प्रणाली स्थिति तथा त्रुटि लग (Error Logs & State)
                    </span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    errorLogCount > 0 
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' 
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {toDevanagariNumerals(errorLogCount)} रेकर्ड
                  </span>
                </div>

                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  एपमा आएका त्रुटिहरू, स्ट्याक ट्रेस र अवस्था <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.2 rounded text-amber-700 dark:text-amber-400">'{ERROR_LOG_STORAGE_KEY}'</code> मा सुरक्षित हुन्छन्।
                </p>

                {clearedFeedback && (
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold">
                    ✓ {clearedFeedback}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsErrorLogModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>लगहरू हेर्नुहोस् (View Logs)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearPersistentErrors}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                    title="स्थानीय भण्डारणमा रहेका सबै त्रुटि अवस्थाहरू तथा क्यास सफा गर्नुहोस्"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>स्थायी त्रुटि अवस्था खाली गर्नुहोस्</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OFFICIAL PRINTABLE LETTERHEAD BANNER & BRANDING CONFIGURATION */}
          {activeTab === 'letterhead' && (
            <div className="space-y-4">
              {/* Guidance Box */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-950 dark:text-amber-200 flex items-start gap-2.5">
                <span className="text-base leading-none shrink-0">📜</span>
                <div className="text-[11px] leading-relaxed">
                  <strong className="font-bold">सफ्टवेयर प्रयोगकर्ता तथा ज्योतिषी ब्रान्डिङ:</strong> तपाईंले यहाँ राख्नुभएको संस्थाको नाम, मङ्गल श्लोक, ट्यागलाइन, दर्ता नं., प्यान नं., सम्पर्क विवरण तथा ज्योतिषाचार्यको नाम कुण्डली, दैनिक पञ्चाङ्ग, वास्तु प्रतिवेदन लगायतका <strong>सबै प्रिन्ट हुने आधिकारिक कागजातहरूमा</strong> स्वतः प्रदर्शित हुनेछ।
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 text-xs">
                    <Eye className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>प्रत्यक्ष प्रिन्ट ब्यानर पूर्वावलोकन (Live Letterhead Banner Preview)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleResetOrgToDefault}
                    className="flex items-center gap-1 text-[11px] text-stone-600 dark:text-stone-400 hover:text-red-700 dark:hover:text-red-400 underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>पूर्वनिर्धारित बालानन्द ब्यानर पुनर्स्थापित गर्नुहोस्</span>
                  </button>
                </div>

                <div className="p-3.5 bg-[#FFFDF9] dark:bg-stone-950 rounded-xl border-2 border-dashed border-amber-300 dark:border-stone-700 shadow-inner overflow-x-auto">
                  <div className="min-w-[540px]">
                    <PrintableLetterheadBanner orgProfile={orgFormData} />
                  </div>
                </div>
              </div>

              {/* Logo Upload & Customization Section */}
              <div className="p-3.5 bg-white dark:bg-stone-850 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-amber-400 p-0.5 bg-white overflow-hidden shadow-xs flex items-center justify-center shrink-0 ring-2 ring-amber-400/20">
                    <img
                      src={orgFormData.logoUrl || getAssetUrl('/logo.png')}
                      alt="Logo"
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        handleImageFallback(e);
                      }}
                    />
                  </div>
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-stone-800 dark:text-stone-100 block">
                      संस्थाको लोगो व्यवस्थापन (Custom App & Report Logo)
                    </span>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                      कम्प्युटरबाट आफ्नो लोगो अपलोड गर्नुहोस् (PNG, JPG, WebP)। यो १००% अफलाइन रहन्छ।
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLogoModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>लोगो फेर्नुहोस् (Upload Logo)</span>
                  </button>
                </div>
              </div>

              {/* Input Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* 1. Mangal Shloka (Full Width) */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-800 dark:text-stone-200 mb-1">
                    शीर्ष मङ्गल श्लोक / स्तुति (Sacred Top Invocation)
                  </label>
                  <input
                    type="text"
                    value={orgFormData.mangalShloka || ''}
                    onChange={(e) => setOrgFormData({ ...orgFormData, mangalShloka: e.target.value })}
                    placeholder="॥ श्री गणेशाय नमः ॥ ॥ कुलदेवतायै नमः ॥ ॥ श्री मात-पितृ चरणकमलेभ्यो नमः ॥"
                    className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-stone-900 dark:text-stone-100 font-serif focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                  />
                  <span className="text-[10px] text-stone-500">कागजातको शिरमा हरियो स्वस्तिक बीच रहने पवित्र मङ्गलाचरण।</span>
                </div>

                {/* 2. Organization / Brand Name (Full Width) */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-800 dark:text-stone-200 mb-1">
                    संस्था / कार्यालय / ब्रान्डको नाम (Organization / Brand Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={orgFormData.name || ''}
                    onChange={(e) => setOrgFormData({ ...orgFormData, name: e.target.value })}
                    placeholder="बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा"
                    className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-stone-900 dark:text-stone-100 font-serif font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                  />
                </div>

                {/* 3. Tagline (Full Width) */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-800 dark:text-stone-200 mb-1">
                    नारा / ट्यागलाइन (Tagline / Slogan)
                  </label>
                  <input
                    type="text"
                    value={orgFormData.tagline || ''}
                    onChange={(e) => setOrgFormData({ ...orgFormData, tagline: e.target.value })}
                    placeholder="नेपालकै सबैभन्दा भरपर्दो वैदिक सेवा • सनातन धर्म र प्रामाणिक वास्तुको संगम"
                    className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                  />
                </div>

                {/* 4. Registration No. */}
                <div>
                  <label className="block font-bold text-stone-800 dark:text-stone-200 mb-1">
                    आधिकारिक दर्ता नं. (Registration No.)
                  </label>
                  <input
                    type="text"
                    value={orgFormData.registeredNo || ''}
                    onChange={(e) => setOrgFormData({ ...orgFormData, registeredNo: e.target.value })}
                    placeholder="दर्ता नं. १२३४/०८०"
                    className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                  />
                </div>

                {/* 5. PAN No. */}
                <div>
                  <label className="block font-bold text-stone-800 dark:text-stone-200 mb-1">
                    स्थायी लेखा नं. (PAN No.)
                  </label>
                  <input
                    type="text"
                    value={orgFormData.panNo || ''}
                    onChange={(e) => setOrgFormData({ ...orgFormData, panNo: e.target.value })}
                    placeholder="PAN: ६०१२३४५६७"
                    className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                  />
                </div>

                {/* 6. Address */}
                <div>
                  <label className="block font-bold text-stone-800 dark:text-stone-200 mb-1">
                    कार्यालयको ठेगाना (Location / Address)
                  </label>
                  <input
                    type="text"
                    value={orgFormData.address || ''}
                    onChange={(e) => setOrgFormData({ ...orgFormData, address: e.target.value })}
                    placeholder="काठमाडौँ, नेपाल"
                    className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                  />
                </div>

                {/* 7. Phone */}
                <div>
                  <label className="block font-bold text-stone-800 dark:text-stone-200 mb-1">
                    आधिकारिक फोन / मोबाइल (Phone)
                  </label>
                  <input
                    type="text"
                    value={orgFormData.phone || ''}
                    onChange={(e) => setOrgFormData({ ...orgFormData, phone: e.target.value })}
                    placeholder="+९७७-९७६४४००५३३"
                    className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                  />
                </div>

                {/* 8. Email */}
                <div>
                  <label className="block font-bold text-stone-800 dark:text-stone-200 mb-1">
                    आधिकारिक इमेल (Email)
                  </label>
                  <input
                    type="email"
                    value={orgFormData.email || ''}
                    onChange={(e) => setOrgFormData({ ...orgFormData, email: e.target.value })}
                    placeholder="suwashdmk@gmail.com"
                    className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                  />
                </div>

                {/* 9. Website */}
                <div>
                  <label className="block font-bold text-stone-800 dark:text-stone-200 mb-1">
                    वेबसाइट / सामाजिक सञ्जाल (Website)
                  </label>
                  <input
                    type="text"
                    value={orgFormData.website || ''}
                    onChange={(e) => setOrgFormData({ ...orgFormData, website: e.target.value })}
                    placeholder="suwashdmk.com"
                    className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                  />
                </div>

                {/* 10. Astrologer / Expert Name */}
                <div>
                  <label className="block font-bold text-stone-800 dark:text-stone-200 mb-1">
                    मुख्य ज्योतिषाचार्य / विज्ञको नाम (Astrologer Name)
                  </label>
                  <input
                    type="text"
                    value={orgFormData.astrologerName || ''}
                    onChange={(e) => setOrgFormData({ ...orgFormData, astrologerName: e.target.value })}
                    placeholder="ज्योतिषाचार्य सुकदेव शर्मा (खाली राखेमा दस्तखतका लागि डट-डट आउनेछ)"
                    className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                  />
                </div>

                {/* 11. Astrologer Title */}
                <div>
                  <label className="block font-bold text-stone-800 dark:text-stone-200 mb-1">
                    पद / उपाधि (Title / Designation)
                  </label>
                  <input
                    type="text"
                    value={orgFormData.astrologerTitle || ''}
                    onChange={(e) => setOrgFormData({ ...orgFormData, astrologerTitle: e.target.value })}
                    placeholder="मुख्य ज्योतिषाचार्य / वरिष्ठ वास्तुविद्"
                    className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#D97706]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E6E0D5] dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#78716C] hover:text-[#1A1A1A] dark:text-stone-300 dark:hover:text-stone-100"
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              className="bg-[#D97706] hover:bg-[#b45309] text-white font-bold px-5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>सुरक्षित गर्नुहोस्</span>
            </button>
          </div>
        </form>

        {/* Error Log Modal */}
        <ErrorLogModal
          isOpen={isErrorLogModalOpen}
          onClose={() => setIsErrorLogModalOpen(false)}
          onStateCleared={refreshLogCount}
        />

        {/* Custom Logo Upload Modal */}
        <LogoUploadModal
          isOpen={isLogoModalOpen}
          onClose={() => setIsLogoModalOpen(false)}
          onLogoUpdated={(newUrl) => setOrgFormData((prev) => ({ ...prev, logoUrl: newUrl || '/logo.png' }))}
        />
      </div>
    </div>
  );
};

export default SettingsModal;
