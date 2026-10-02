import React, { useState, useEffect } from 'react';
import {
  Globe,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ShieldCheck,
  Sparkles,
  Settings,
  RefreshCw,
  Save,
  RotateCcw,
  Sliders,
  DollarSign,
  Calendar,
  Layers,
  ExternalLink,
  Info,
  Flame,
  Search,
  Check,
  Building2,
  Clock,
  Home,
  HeartHandshake,
  ShoppingBag,
  Newspaper,
  Compass,
  FileText,
  Bot
} from 'lucide-react';
import {
  PageControlItem,
  ServiceControlItem,
  GlobalNoticeConfig,
  PageServiceMasterConfig,
  getStoredPageServiceConfig,
  savePageServiceConfig,
  resetPageServiceConfigToDefault
} from '../../../db/pageServiceControlStore';

interface AdminPageServiceControlSectionProps {
  onNavigateAppPage?: (tab: string) => void;
  onRefreshParent?: () => void;
}

export const AdminPageServiceControlSection: React.FC<AdminPageServiceControlSectionProps> = ({
  onNavigateAppPage,
  onRefreshParent
}) => {
  const [config, setConfig] = useState<PageServiceMasterConfig>(getStoredPageServiceConfig);
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'pages' | 'services' | 'notice'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Sync on mount or when storage changes
  useEffect(() => {
    const handleUpdate = () => {
      setConfig(getStoredPageServiceConfig());
    };
    window.addEventListener('page-service-control-updated', handleUpdate);
    return () => window.removeEventListener('page-service-control-updated', handleUpdate);
  }, []);

  const handleSaveAll = () => {
    savePageServiceConfig(config);
    setSaveSuccess(true);
    if (onRefreshParent) onRefreshParent();
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    const defaults = resetPageServiceConfigToDefault();
    setConfig(defaults);
    setResetConfirmOpen(false);
    setSaveSuccess(true);
    if (onRefreshParent) onRefreshParent();
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Page Updaters
  const updatePage = (id: string, updates: Partial<PageControlItem>) => {
    const newPages = config.pages.map(p => (p.id === id ? { ...p, ...updates } : p));
    const newConfig = { ...config, pages: newPages };
    setConfig(newConfig);
    savePageServiceConfig(newConfig);
  };

  // Service Updaters
  const updateService = (id: string, updates: Partial<ServiceControlItem>) => {
    const newServices = config.services.map(s => (s.id === id ? { ...s, ...updates } : s));
    const newConfig = { ...config, services: newServices };
    setConfig(newConfig);
    savePageServiceConfig(newConfig);
  };

  // Global Notice Updater
  const updateNotice = (updates: Partial<GlobalNoticeConfig>) => {
    const newNotice = { ...config.globalNotice, ...updates };
    const newConfig = { ...config, globalNotice: newNotice };
    setConfig(newConfig);
    savePageServiceConfig(newConfig);
  };

  // Quick Stats
  const totalPages = config.pages.length;
  const activePages = config.pages.filter(p => p.status === 'active').length;
  const maintenancePages = config.pages.filter(p => p.status === 'maintenance').length;

  const totalServices = config.services.length;
  const activeServices = config.services.filter(s => s.isEnabled).length;
  const openBookingServices = config.services.filter(s => s.isEnabled && s.isBookingOpen).length;

  // Filtered lists
  const filteredPages = config.pages.filter(
    p =>
      p.titleNepali.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.titleEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tabKey.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredServices = config.services.filter(
    s =>
      s.nameNepali.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPageIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home': return <Home className="w-5 h-5 text-amber-400" />;
      case 'Clock': return <Clock className="w-5 h-5 text-amber-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-amber-400" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5 text-rose-400" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-emerald-400" />;
      case 'ShoppingBag': return <ShoppingBag className="w-5 h-5 text-orange-400" />;
      case 'Newspaper': return <Newspaper className="w-5 h-5 text-blue-400" />;
      case 'Building2': return <Building2 className="w-5 h-5 text-stone-300" />;
      case 'Calendar': return <Calendar className="w-5 h-5 text-amber-400" />;
      case 'FileText': return <FileText className="w-5 h-5 text-amber-300" />;
      case 'Bot': return <Bot className="w-5 h-5 text-purple-400" />;
      default: return <Layers className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6 text-stone-100">
      {/* Top Banner / Header Card */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900/90 to-amber-950/40 border border-amber-500/30 p-5 md:p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>केन्द्रीय स्विचबोर्ड • पूर्ण नियन्त्रण</span>
              </span>
              <span className="text-xs text-stone-400 font-mono">अन्तिम अपडेट: {config.lastUpdatedBS}</span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold font-serif text-white tracking-wide flex items-center gap-2.5">
              <span>सम्पूर्ण पृष्ठ तथा सेवाहरूको पूर्ण नियन्त्रण</span>
            </h2>

            <p className="text-xs text-stone-300 max-w-3xl leading-relaxed">
              बालानन्द प्रणालीका सम्पूर्ण पृष्ठहरू (Pages), वैदिक सेवाहरू (Services), बुकिङ खुला/बन्द, पहुँच अधिकार (Public/Paid), मर्मतसम्भार (Maintenance Mode) र आपतकालीन ब्यानर एकै ठाउँबाट तत्काल नियन्त्रण गर्नुहोस्।
            </p>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setResetConfirmOpen(true)}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-stone-700"
              title="डिफल्ट सेटिङ्स रिसेट गर्नुहोस्"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>डिफल्ट रिसेट</span>
            </button>

            <button
              onClick={handleSaveAll}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4 text-stone-950" />
              <span>{saveSuccess ? 'सफलतापूर्वक सुरक्षित भयो!' : 'सबै परिवर्तन सुरक्षित गर्नुहोस्'}</span>
            </button>
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-stone-800/80">
          <div className="bg-stone-950/70 p-3 rounded-2xl border border-stone-800/90 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-stone-400 font-bold uppercase">कुल पृष्ठहरू</p>
              <p className="text-base font-black text-white">{totalPages} <span className="text-xs text-emerald-400 font-normal">({activePages} सक्रिय)</span></p>
            </div>
          </div>

          <div className="bg-stone-950/70 p-3 rounded-2xl border border-stone-800/90 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-stone-400 font-bold uppercase">वैदिक सेवाहरू</p>
              <p className="text-base font-black text-white">{totalServices} <span className="text-xs text-emerald-400 font-normal">({openBookingServices} बुकिङ खुला)</span></p>
            </div>
          </div>

          <div className="bg-stone-950/70 p-3 rounded-2xl border border-stone-800/90 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-stone-400 font-bold uppercase">मर्मतसम्भार पृष्ठ</p>
              <p className="text-base font-black text-white">{maintenancePages} <span className="text-xs text-stone-400 font-normal">मोड्युल</span></p>
            </div>
          </div>

          <div className="bg-stone-950/70 p-3 rounded-2xl border border-stone-800/90 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-stone-400 font-bold uppercase">ग्लोबल सूचना ब्यानर</p>
              <p className="text-base font-black text-white">{config.globalNotice.isEnabled ? <span className="text-emerald-400">सक्रिय (On)</span> : <span className="text-stone-400">निष्क्रिय (Off)</span>}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {resetConfirmOpen && (
        <div className="bg-rose-950/70 border border-rose-600/60 p-4 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-rose-200">के तपाईं सम्पूर्ण पृष्ठ तथा सेवाहरूलाई डिफल्ट अवस्थामा फर्काउन चाहनुहुन्छ?</h4>
              <p className="text-xs text-rose-300/80">सबै कस्टम मर्मतसम्भार सन्देशहरू र परिवर्तनहरू पुनः सुरु हुनेछन्।</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setResetConfirmOpen(false)}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold cursor-pointer"
            >
              रद्द गर्नुहोस्
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black cursor-pointer shadow"
            >
              हो, रिसेट गर्नुहोस्
            </button>
          </div>
        </div>
      )}

      {/* Filter & Subtab Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-900/80 p-2.5 rounded-2xl border border-stone-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveSubTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'all'
                ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            सबै नियन्त्रण ब्लकहरू ({totalPages + totalServices})
          </button>

          <button
            onClick={() => setActiveSubTab('pages')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'pages'
                ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>पृष्ठहरू ({totalPages})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('services')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'services'
                ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>वैदिक सेवाहरू ({totalServices})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('notice')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'notice'
                ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>ग्लोबल सूचना ब्यानर {config.globalNotice.isEnabled && <span className="w-2 h-2 rounded-full bg-emerald-400" />}</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-500" />
          <input
            type="text"
            placeholder="पृष्ठ वा सेवा खोज्नुहोस्..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-200 outline-none focus:border-amber-500/80 transition-colors"
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* BLOCK 1: GLOBAL EMERGENCY / FESTIVE ANNOUNCEMENT BANNER        */}
      {/* ============================================================== */}
      {(activeSubTab === 'all' || activeSubTab === 'notice') && (
        <div className="bg-stone-900 border border-amber-500/30 rounded-3xl p-5 md:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <span>ब्लक १ : साइट-व्यापी ग्लोबल सूचना ब्यानर (Global Announcement Banner)</span>
                </h3>
              </div>
              <p className="text-xs text-stone-400">
                सबै प्रयोगकर्ताहरूका लागि वेबसाइटको सबैभन्दा माथि देखिने विशेष घोषणा, चाडपर्व शुभकामना वा मर्मतसम्भार सूचना।
              </p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none self-start sm:self-center bg-stone-950 px-4 py-2 rounded-2xl border border-stone-800">
              <span className="text-xs font-bold text-stone-300">ब्यानर सक्रिय:</span>
              <input
                type="checkbox"
                checked={config.globalNotice.isEnabled}
                onChange={(e) => updateNotice({ isEnabled: e.target.checked })}
                className="w-5 h-5 accent-amber-500 cursor-pointer rounded"
              />
              <span className={`text-xs font-black ${config.globalNotice.isEnabled ? 'text-emerald-400' : 'text-stone-500'}`}>
                {config.globalNotice.isEnabled ? 'अन (ON)' : 'अफ (OFF)'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Form */}
            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">ब्यानरको प्रकार (Type)</label>
                  <select
                    value={config.globalNotice.type}
                    onChange={(e) => updateNotice({ type: e.target.value as any })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-200 outline-none focus:border-amber-500"
                  >
                    <option value="info">ℹ️ सामान्य सूचना (Info Banner)</option>
                    <option value="festive">🪔 चाडपर्व शुभकामना (Festive Greetings)</option>
                    <option value="warning">⚠️ मर्मतसम्भार पूर्वसूचना (Maintenance Notice)</option>
                    <option value="emergency">🚨 महत्त्वपूर्ण / आपतकालीन अलर्ट (Emergency Alert)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">ब्यानरको मुख्य शीर्षक</label>
                  <input
                    type="text"
                    value={config.globalNotice.titleNepali}
                    onChange={(e) => updateNotice({ titleNepali: e.target.value })}
                    placeholder="जस्तै: बडादशैंको पावन अवसरमा हार्दिक मङ्गलमय शुभकामना!"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">विस्तृत सन्देश (Message)</label>
                <textarea
                  rows={2}
                  value={config.globalNotice.messageNepali}
                  onChange={(e) => updateNotice({ messageNepali: e.target.value })}
                  placeholder="सम्पूर्ण श्रद्धालु तथा ज्योतिष प्रेमीहरूमा हार्दिक शुभकामना..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-200 outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">कारबाही बटनको नाम (Optional Action Button)</label>
                  <input
                    type="text"
                    value={config.globalNotice.actionText || ''}
                    onChange={(e) => updateNotice({ actionText: e.target.value })}
                    placeholder="जस्तै: आजको पञ्चाङ्ग हेर्नुहोस्"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-200 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">बटनले खोल्ने पृष्ठ (Target Page)</label>
                  <select
                    value={config.globalNotice.actionTab || 'panchanga'}
                    onChange={(e) => updateNotice({ actionTab: e.target.value })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-200 outline-none focus:border-amber-500"
                  >
                    {config.pages.map(p => (
                      <option key={p.tabKey} value={p.tabKey}>{p.titleNepali}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 flex flex-col justify-between space-y-3">
              <div>
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>लाइभ प्रिभ्यु (Live Visitor View)</span>
                </p>

                {config.globalNotice.isEnabled ? (
                  <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    config.globalNotice.type === 'festive'
                      ? 'bg-gradient-to-r from-amber-950/60 to-orange-950/60 border-amber-500/50 text-amber-200'
                      : config.globalNotice.type === 'warning'
                      ? 'bg-yellow-950/60 border-yellow-500/50 text-yellow-200'
                      : config.globalNotice.type === 'emergency'
                      ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                      : 'bg-blue-950/60 border-blue-500/50 text-blue-200'
                  }`}>
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>{config.globalNotice.titleNepali || 'शुभ सूचना'}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      {config.globalNotice.messageNepali || 'सूचना विवरण यहाँ देखिनेछ।'}
                    </p>
                    {config.globalNotice.actionText && (
                      <button className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-[10px] mt-2">
                        {config.globalNotice.actionText} →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-6 border border-dashed border-stone-800 rounded-2xl text-center text-xs text-stone-500">
                    ब्यानर हाल निष्क्रिय छ। सक्रिय गर्न माथिको स्विच अन गर्नुहोस्।
                  </div>
                )}
              </div>

              <p className="text-[10px] text-stone-500 text-center">
                परिवर्तनहरू वेबसाइटमा तत्काल लागू हुनेछन्।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* BLOCK 2: ALL PAGES CONTROL (सम्पूर्ण पृष्ठहरूको नियन्त्रण)     */}
      {/* ============================================================== */}
      {(activeSubTab === 'all' || activeSubTab === 'pages') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-400" />
                <span>ब्लक २ : सम्पूर्ण पृष्ठहरूको स्थिति र पहुँच नियन्त्रण (All Pages Control)</span>
              </h3>
              <p className="text-xs text-stone-400">
                प्रत्येक पृष्ठलाई सक्रिय, मर्मतसम्भार मोड वा पूर्ण बन्द गर्नुहोस्। पहुँच अधिकार (Public/Paid) पनि निर्धारण गर्न सकिन्छ।
              </p>
            </div>
            <span className="text-xs text-stone-400 font-mono self-start sm:self-auto">
              कुल: {filteredPages.length} पृष्ठ
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPages.map(page => {
              const isMaintenance = page.status === 'maintenance';
              const isDisabled = page.status === 'disabled';
              const isActive = page.status === 'active';

              return (
                <div
                  key={page.id}
                  className={`p-5 rounded-3xl border transition-all space-y-4 relative flex flex-col justify-between ${
                    isDisabled
                      ? 'bg-stone-950/60 border-stone-800/80 opacity-75'
                      : isMaintenance
                      ? 'bg-stone-900 border-yellow-500/40 shadow-md ring-1 ring-yellow-500/20'
                      : 'bg-stone-900/90 border-stone-800 hover:border-amber-500/40 shadow-md'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Icon + Title + Category */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-center shrink-0 shadow">
                          {renderPageIcon(page.icon)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-sm text-white font-serif">{page.titleNepali}</h4>
                            {page.badge && (
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {page.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-stone-400 font-mono">{page.titleEnglish} • key: <span className="text-amber-400 font-semibold">{page.tabKey}</span></p>
                        </div>
                      </div>

                      {/* Status Indicator */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : isMaintenance
                          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {isActive ? '● सक्रिय' : isMaintenance ? '⚠ मर्मतसम्भार' : '✕ बन्द'}
                      </span>
                    </div>

                    <p className="text-xs text-stone-400 leading-relaxed line-clamp-2">
                      {page.descriptionNepali}
                    </p>

                    {/* Controls Grid */}
                    <div className="bg-stone-950/80 p-3 rounded-2xl border border-stone-800/90 space-y-2.5 text-xs">
                      {/* Status Selector */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-400 mb-1">पृष्ठको स्थिति (Status):</label>
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            type="button"
                            onClick={() => updatePage(page.id, { status: 'active' })}
                            className={`py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                              isActive
                                ? 'bg-emerald-600 text-white shadow'
                                : 'bg-stone-900 text-stone-400 hover:text-white'
                            }`}
                          >
                            सक्रिय
                          </button>
                          <button
                            type="button"
                            onClick={() => updatePage(page.id, { status: 'maintenance' })}
                            className={`py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                              isMaintenance
                                ? 'bg-yellow-600 text-white shadow'
                                : 'bg-stone-900 text-stone-400 hover:text-white'
                            }`}
                          >
                            मर्मतसम्भार
                          </button>
                          <button
                            type="button"
                            onClick={() => updatePage(page.id, { status: 'disabled' })}
                            className={`py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                              isDisabled
                                ? 'bg-rose-600 text-white shadow'
                                : 'bg-stone-900 text-stone-400 hover:text-white'
                            }`}
                          >
                            बन्द
                          </button>
                        </div>
                      </div>

                      {/* Access Level Selector */}
                      <div>
                        <label className="block text-[11px] font-bold text-stone-400 mb-1">पहुँच अधिकार (Access):</label>
                        <select
                          value={page.accessLevel}
                          onChange={(e) => updatePage(page.id, { accessLevel: e.target.value as any })}
                          className="w-full bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-stone-200 outline-none focus:border-amber-500"
                        >
                          <option value="public">🌐 सबैका लागि खुला (Public Access)</option>
                          <option value="registered_only">👤 लगइन भएका प्रयोगकर्ता (Registered Users)</option>
                          <option value="paid_only">👑 सशुल्क / पूर्ण लाइसेन्स ग्राहक (Paid / VIP Only)</option>
                        </select>
                      </div>

                      {/* Nav Visibility */}
                      <label className="flex items-center justify-between text-[11px] text-stone-300 font-semibold cursor-pointer pt-1">
                        <span>शीर्ष मेनु बारमा देखाउने:</span>
                        <input
                          type="checkbox"
                          checked={!page.hideInNavigation}
                          onChange={(e) => updatePage(page.id, { hideInNavigation: !e.target.checked })}
                          className="w-4 h-4 accent-amber-500 rounded"
                        />
                      </label>
                    </div>

                    {/* Maintenance Notice if in maintenance */}
                    {isMaintenance && (
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-yellow-400">मर्मतसम्भार सूचना सन्देश:</label>
                        <input
                          type="text"
                          value={page.maintenanceMessage || 'यो पृष्ठ हाल प्राविधिक मर्मतसम्भारमा छ। केही समयपछि पुनः प्रयास गर्नुहोस्।'}
                          onChange={(e) => updatePage(page.id, { maintenanceMessage: e.target.value })}
                          className="w-full bg-stone-950 border border-yellow-500/40 rounded-xl p-2 text-xs text-yellow-200 outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Direct Launch / Preview button */}
                  <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-stone-500">
                      श्रेणी: <strong className="text-stone-400 uppercase">{page.category}</strong>
                    </span>

                    {onNavigateAppPage && (
                      <button
                        onClick={() => onNavigateAppPage(page.tabKey)}
                        className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        title="यो पृष्ठ एपमा खोल्नुहोस्"
                      >
                        <span>पेज खोल्नुहोस्</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* BLOCK 3: ALL SERVICES CONTROL (सम्पूर्ण वैदिक सेवाहरूको नियन्त्रण) */}
      {/* ============================================================== */}
      {(activeSubTab === 'all' || activeSubTab === 'services') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white font-serif flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <span>ब्लक ३ : सम्पूर्ण वैदिक सेवाहरू तथा बुकिङ नियन्त्रण (All Services Control)</span>
              </h3>
              <p className="text-xs text-stone-400">
                प्रत्येक वैदिक सेवा सक्रिय/निष्क्रिय गर्ने, अनलाइन बुकिङ खुला/बन्द गर्ने, आधारभूत शुल्क (NPR) र भुक्तानी दरहरू निर्धारण गर्नुहोस्।
              </p>
            </div>
            <span className="text-xs text-stone-400 font-mono self-start sm:self-auto">
              कुल: {filteredServices.length} सेवाहरू
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {filteredServices.map(service => {
              return (
                <div
                  key={service.id}
                  className={`p-5 rounded-3xl border transition-all space-y-4 relative flex flex-col justify-between ${
                    !service.isEnabled
                      ? 'bg-stone-950/60 border-stone-800/80 opacity-70'
                      : 'bg-stone-900 border-stone-800 hover:border-emerald-500/40 shadow-md'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow border ${
                          service.isEnabled ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400' : 'bg-stone-950 border-stone-800 text-stone-500'
                        }`}>
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-sm text-white font-serif">{service.nameNepali}</h4>
                            {service.badge && (
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {service.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-stone-400 font-mono">{service.nameEnglish}</p>
                        </div>
                      </div>

                      {/* Main Service Switch */}
                      <label className="flex items-center gap-2 cursor-pointer select-none bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800">
                        <span className="text-[11px] font-bold text-stone-400">सेवा:</span>
                        <input
                          type="checkbox"
                          checked={service.isEnabled}
                          onChange={(e) => updateService(service.id, { isEnabled: e.target.checked })}
                          className="w-4 h-4 accent-emerald-500 rounded"
                        />
                        <span className={`text-[11px] font-black ${service.isEnabled ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {service.isEnabled ? 'सक्रिय' : 'बन्द'}
                        </span>
                      </label>
                    </div>

                    <p className="text-xs text-stone-400 leading-relaxed">
                      {service.descriptionNepali}
                    </p>

                    {/* Configuration Grid */}
                    <div className="bg-stone-950/80 p-3.5 rounded-2xl border border-stone-800 space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Base Fee */}
                        <div>
                          <label className="block text-[11px] font-bold text-stone-400 mb-1 flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                            <span>आधारभूत शुल्क (NPR)</span>
                          </label>
                          <input
                            type="number"
                            value={service.baseFeeNPR}
                            onChange={(e) => updateService(service.id, { baseFeeNPR: Number(e.target.value) })}
                            className="w-full bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-amber-300 font-mono font-bold outline-none focus:border-amber-500"
                          />
                        </div>

                        {/* Booking Status */}
                        <div>
                          <label className="block text-[11px] font-bold text-stone-400 mb-1 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-blue-400" />
                            <span>अनलाइन बुकिङ स्थिति</span>
                          </label>
                          <select
                            value={service.isBookingOpen ? 'open' : 'closed'}
                            onChange={(e) => updateService(service.id, { isBookingOpen: e.target.value === 'open' })}
                            className="w-full bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-stone-200 outline-none focus:border-amber-500"
                          >
                            <option value="open">🟢 बुकिङ खुला (Booking Open)</option>
                            <option value="closed">🔴 बुकिङ बन्द (Temporarily Closed)</option>
                          </select>
                        </div>
                      </div>

                      {/* Toggles Row */}
                      <div className="pt-2 border-t border-stone-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <label className="flex items-center gap-2 text-stone-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={service.allowOnlinePayment}
                            onChange={(e) => updateService(service.id, { allowOnlinePayment: e.target.checked })}
                            className="w-4 h-4 accent-amber-500 rounded"
                          />
                          <span>eSewa अनलाइन भुक्तानी खुला</span>
                        </label>

                        <label className="flex items-center gap-2 text-stone-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={service.autoAssignExperts}
                            onChange={(e) => updateService(service.id, { autoAssignExperts: e.target.checked })}
                            className="w-4 h-4 accent-amber-500 rounded"
                          />
                          <span>उपलब्ध विशेषज्ञ स्वतः सिफारिस</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 text-[10px] text-stone-500 flex items-center justify-between">
                    <span>श्रेणी: <strong className="text-stone-400 uppercase">{service.category}</strong></span>
                    <span className="text-emerald-400 font-bold">✓ सिङ्क्रोनाइज्ड</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
