import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Bell,
  BellRing,
  BellOff,
  Sparkles,
  ShieldAlert,
  Flame,
  Volume2,
  VolumeX,
  CheckCircle2,
  Send,
  Trash2,
  Check,
  Settings,
  History,
  Calendar,
  Compass,
  ArrowRight,
  RefreshCw,
  Info,
  ExternalLink,
  Orbit,
  Sliders,
  RotateCcw,
  CheckCheck,
  Filter
} from 'lucide-react';
import { BirthDetails, PlanetPosition, LagnaInfo } from '../types/astrology';
import {
  TransitAlertItem,
  TransitAlertCategory,
  TransitAlertSeverity,
  TransitNotificationPreferences,
  TransitNotificationHistoryEntry
} from '../types/transitNotificationTypes';
import {
  calculateProfileTransitAlerts,
  isBrowserPushSupported,
  getBrowserPushPermission,
  requestBrowserPushPermission,
  getStoredTransitPreferences,
  saveTransitPreferences,
  DEFAULT_TRANSIT_PREFS,
  getStoredTransitHistory,
  clearTransitHistory,
  markTransitAlertAsRead,
  markAlertsAsViewed,
  isAlertUnread,
  sendTestTransitPushAlert,
  sendTransitWebPushNotification,
  playTransitChime
} from '../utils/transitNotificationEngine';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';

interface TransitNotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: BirthDetails | null;
  birthMoon: PlanetPosition;
  birthLagna?: LagnaInfo;
  transitPlanets: PlanetPosition[];
  todayAD: string;
  todayBS: string;
  onNavigateToGochar: () => void;
}

export const TransitNotificationCenterModal: React.FC<TransitNotificationCenterModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  birthMoon,
  birthLagna,
  transitPlanets,
  todayAD,
  todayBS,
  onNavigateToGochar
}) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'settings' | 'history'>('alerts');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterOnlyActivePlanets, setFilterOnlyActivePlanets] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [prefs, setPrefs] = useState<TransitNotificationPreferences>(getStoredTransitPreferences);
  const [history, setHistory] = useState<TransitNotificationHistoryEntry[]>([]);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);

  const profileName = activeProfile?.name?.trim() || 'जातक';
  const moonRashi = birthMoon?.rashiName || 'मेष';

  const alerts: TransitAlertItem[] = useMemo(() => {
    return calculateProfileTransitAlerts({
      activeProfile,
      birthMoon,
      birthLagna,
      transitPlanets,
      todayAD,
      todayBS
    });
  }, [activeProfile, birthMoon, birthLagna, transitPlanets, todayAD, todayBS]);

  useEffect(() => {
    if (isOpen) {
      setPermission(getBrowserPushPermission());
      setPrefs(getStoredTransitPreferences());
      setHistory(getStoredTransitHistory());
      setTestResult(null);
      // Mark all current active transit alerts as viewed when user opens the center
      if (alerts.length > 0) {
        markAlertsAsViewed(alerts, activeProfile?.id);
      }
    }
  }, [isOpen, alerts, activeProfile?.id]);

  // Planet preferences statistics
  const enabledPlanetsCount = useMemo(() => {
    return [
      prefs.alertShani,
      prefs.alertGuru,
      prefs.alertRahuKetu,
      prefs.alertSurya,
      prefs.alertMangal,
      prefs.alertBudha,
      prefs.alertShukra,
      prefs.alertChandraAshtama,
      prefs.alertVakri
    ].filter(Boolean).length;
  }, [prefs]);

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter((alert) => {
    if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) return false;
    if (selectedCategory !== 'all' && alert.category !== selectedCategory) return false;
    if (filterOnlyActivePlanets) {
      if (alert.category === 'guru' && !prefs.alertGuru) return false;
      if (alert.category === 'shani') {
        if (!prefs.alertShani) return false;
        if (alert.id.includes('shani_sadesati') && prefs.alertShaniSadeSati === false) return false;
      }
      if (alert.category === 'rahu_ketu' && !prefs.alertRahuKetu) return false;
      if (alert.category === 'surya' && !prefs.alertSurya) return false;
      if (alert.category === 'mangal' && !prefs.alertMangal) return false;
      if (alert.category === 'budha' && !prefs.alertBudha) return false;
      if (alert.category === 'shukra' && !prefs.alertShukra) return false;
      if (alert.category === 'chandra' && !prefs.alertChandraAshtama) return false;
      if (alert.category === 'vakri' && !prefs.alertVakri) return false;
    }
    return true;
  });

  const handleTogglePreference = (key: keyof TransitNotificationPreferences) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    saveTransitPreferences(updated);
    if (key === 'soundEnabled' && updated.soundEnabled) {
      playTransitChime(528);
    }
  };

  const handleEnableAllPlanets = () => {
    const updated: TransitNotificationPreferences = {
      ...prefs,
      alertGuru: true,
      alertShani: true,
      alertShaniSadeSati: true,
      alertRahuKetu: true,
      alertSurya: true,
      alertMangal: true,
      alertBudha: true,
      alertShukra: true,
      alertChandraAshtama: true,
      alertVakri: true
    };
    setPrefs(updated);
    saveTransitPreferences(updated);
    playTransitChime(528);
  };

  const handleDisableAllPlanets = () => {
    const updated: TransitNotificationPreferences = {
      ...prefs,
      alertGuru: false,
      alertShani: false,
      alertShaniSadeSati: false,
      alertRahuKetu: false,
      alertSurya: false,
      alertMangal: false,
      alertBudha: false,
      alertShukra: false,
      alertChandraAshtama: false,
      alertVakri: false
    };
    setPrefs(updated);
    saveTransitPreferences(updated);
  };

  const handleResetToDefaults = () => {
    setPrefs(DEFAULT_TRANSIT_PREFS);
    saveTransitPreferences(DEFAULT_TRANSIT_PREFS);
    playTransitChime(528);
  };

  const handleRequestPermission = async () => {
    const res = await requestBrowserPushPermission();
    setPermission(res);
    if (res === 'granted') {
      const updated = { ...prefs, enabled: true };
      setPrefs(updated);
      saveTransitPreferences(updated);
      playTransitChime(528);
      setTestResult({
        success: true,
        message: 'ब्राउजर सूचना अनुमति स्वीकृत भयो! गोचर पुश सूचना सक्रिय गरिएको छ।'
      });
    } else {
      setTestResult({
        success: false,
        message: 'सूचना अनुमति दिइएन। कृपया ब्राउजरको साइट सेटिङबाट अनुमति खोल्नुहोस्।'
      });
    }
  };

  const handleSendTestPush = async () => {
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const res = await sendTestTransitPushAlert({
        activeProfile,
        alerts,
        onNavigateToGochar: () => {
          onClose();
          onNavigateToGochar();
        }
      });
      setPermission(getBrowserPushPermission());
      setTestResult(res);
      setHistory(getStoredTransitHistory());
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleClearHistory = () => {
    clearTransitHistory();
    setHistory([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-stone-900 w-full max-w-4xl rounded-2xl sm:rounded-3xl border border-amber-300 dark:border-stone-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 text-white flex items-center justify-between gap-3 shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-inner">
              <Bell className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold font-serif">
                  ग्रह गोचर पुश सूचना केन्द्र (Planetary Transit Notification Center)
                </h3>
                <span className="text-[11px] bg-black/20 text-amber-100 px-2 py-0.5 rounded-full border border-white/20 font-sans">
                  {profileName} ({moonRashi} राशि)
                </span>
              </div>
              <p className="text-xs text-amber-100/90 mt-0.5">
                जन्म कुण्डलीमा आधारित प्रमुख ग्रह गोचर, साढेसाती, ढैय्या र संक्रान्ति अलर्ट
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl text-white/90 hover:text-white transition cursor-pointer"
            title="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center border-b border-[#E6E0D5] dark:border-stone-800 bg-[#FAF8F5] dark:bg-stone-950 px-4 sm:px-6 pt-2 shrink-0 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'alerts'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>सक्रिय गोचर अलर्टहरू ({toDevanagariNumerals(alerts.length)})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'settings'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Sliders className="w-4 h-4 text-stone-500" />
            <span>ग्रह तथा सूचना सेटिङ</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-semibold border border-amber-300/60 dark:border-amber-700/60">
              {toDevanagariNumerals(enabledPlanetsCount)}/९
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <History className="w-4 h-4 text-stone-500" />
            <span>सूचना इतिहास ({toDevanagariNumerals(history.length)})</span>
          </button>
        </div>

        {/* FEEDBACK BANNER */}
        {testResult && (
          <div
            className={`p-3 text-xs flex items-center justify-between gap-2 px-6 ${
              testResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-b border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-b border-rose-200 dark:border-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
            <button
              onClick={() => setTestResult(null)}
              className="text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* TAB CONTENTS */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: ACTIVE ALERTS */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="space-y-2.5 bg-[#FAF8F5] dark:bg-stone-800/60 p-3 sm:p-3.5 rounded-xl border border-stone-200 dark:border-stone-700 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-stone-600 dark:text-stone-400">गम्भीरता:</span>
                    <button
                      onClick={() => setSelectedSeverity('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                        selectedSeverity === 'all'
                          ? 'bg-amber-600 text-white'
                          : 'bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-600'
                      }`}
                    >
                      सबै ({toDevanagariNumerals(alerts.length)})
                    </button>
                    <button
                      onClick={() => setSelectedSeverity('maha_parivartan')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                        selectedSeverity === 'maha_parivartan'
                          ? 'bg-rose-600 text-white'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200'
                      }`}
                    >
                      महा-परिवर्तन
                    </button>
                    <button
                      onClick={() => setSelectedSeverity('alert')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                        selectedSeverity === 'alert'
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200'
                      }`}
                    >
                      सचेत/सावधान
                    </button>
                    <button
                      onClick={() => setSelectedSeverity('shubha')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                        selectedSeverity === 'shubha'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200'
                      }`}
                    >
                      शुभ फलदायी
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setFilterOnlyActivePlanets(!filterOnlyActivePlanets)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                        filterOnlyActivePlanets
                          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-400 dark:border-amber-600'
                          : 'bg-white dark:bg-stone-700 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-600'
                      }`}
                      title="सेटिङमा अन गरिएका ग्रहहरूको अलर्ट मात्र देखाउने"
                    >
                      <Filter className="w-3 h-3 text-amber-600" />
                      <span>सक्रिय ग्रह मात्र {filterOnlyActivePlanets ? '✓' : ''}</span>
                    </button>

                    <button
                      onClick={() => {
                        markAlertsAsViewed(alerts, activeProfile?.id);
                        playTransitChime(528);
                        setTestResult({
                          success: true,
                          message: 'सबै गोचर सूचनाहरू हेरिसकिएको चिन्ह लगाइयो। घण्टीको ब्लिंकिङ शान्त भएको छ।'
                        });
                      }}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="सबै गोचर सूचनाहरू पढेको चिन्ह लगाउनुहोस्"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>सबै हेरिसकियो ✓</span>
                    </button>

                    <button
                      onClick={handleSendTestPush}
                      disabled={isSendingTest}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
                    >
                      <Send className={`w-3 h-3 ${isSendingTest ? 'animate-spin' : ''}`} />
                      <span>परीक्षण पुश सूचना</span>
                    </button>
                  </div>
                </div>

                {/* Planetary Category Quick Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-stone-200/70 dark:border-stone-700/70 pb-0.5">
                  <span className="text-[11px] font-semibold text-stone-500 shrink-0">ग्रह छनोट:</span>
                  {[
                    { id: 'all', label: 'सबै ग्रह' },
                    { id: 'shani', label: 'शनि/साढेसाती' },
                    { id: 'guru', label: 'गुरु' },
                    { id: 'rahu_ketu', label: 'राहु-केतु' },
                    { id: 'surya', label: 'सूर्य' },
                    { id: 'mangal', label: 'मङ्गल' },
                    { id: 'budha', label: 'बुध' },
                    { id: 'shukra', label: 'शुक्र' },
                    { id: 'chandra', label: 'चन्द्र' },
                    { id: 'vakri', label: 'वक्री' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2 py-0.5 rounded-md font-medium text-[11px] whitespace-nowrap transition cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-stone-800 dark:bg-stone-100 text-white dark:text-stone-900 font-bold'
                          : 'bg-stone-200/80 dark:bg-stone-700/80 text-stone-700 dark:text-stone-300 hover:bg-stone-300'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alert cards */}
              <div className="space-y-4">
                {filteredAlerts.length === 0 ? (
                  <div className="text-center py-10 text-stone-500 space-y-2">
                    <Sparkles className="w-8 h-8 mx-auto text-amber-500 opacity-60" />
                    <p className="text-sm font-bold">चयन गरिएको फिल्टरमा कुनै गोचर फेला परेन।</p>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 ${
                        alert.severity === 'maha_parivartan'
                          ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                          : alert.severity === 'alert'
                          ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                          : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 shadow-xs border ${
                              alert.severity === 'maha_parivartan'
                                ? 'bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 border-rose-400'
                                : alert.severity === 'alert'
                                ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 border-amber-400'
                                : 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 border-emerald-400'
                            }`}
                          >
                            {alert.planet === 'शनि' && '♄'}
                            {alert.planet === 'गुरु' && '♃'}
                            {alert.planet === 'राहु' && '☊'}
                            {alert.planet === 'केतु' && '☋'}
                            {alert.planet === 'सूर्य' && '☉'}
                            {alert.planet === 'मंगल' && '♂'}
                            {alert.planet === 'चन्द्र' && '☽'}
                            {alert.planet === 'बुध' && '☿'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-base font-bold font-serif text-stone-900 dark:text-stone-100">
                                {alert.title}
                              </h4>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  alert.severity === 'maha_parivartan'
                                    ? 'bg-rose-100 text-rose-900 border-rose-300'
                                    : alert.severity === 'alert'
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                }`}
                              >
                                {alert.severity === 'maha_parivartan' && 'महा-परिवर्तन'}
                                {alert.severity === 'alert' && 'विशेष सचेत'}
                                {alert.severity === 'shubha' && 'शुभ फलदायी'}
                                {alert.severity === 'madhyam' && 'मध्यम'}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 flex items-center gap-1">
                                <span>हेरिसकिएको</span>
                                <span className="text-emerald-600">✓</span>
                              </span>
                            </div>
                            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                              {alert.subtitle}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={async () => {
                            const sent = await sendTransitWebPushNotification({
                              alert,
                              profileName,
                              onNavigateToGochar: () => {
                                onClose();
                                onNavigateToGochar();
                              }
                            });
                            if (sent) {
                              setTestResult({
                                success: true,
                                message: `"${alert.title}" को पुश सूचना तुरुन्त पठाइयो!`
                              });
                              setHistory(getStoredTransitHistory());
                            } else {
                              setTestResult({
                                success: false,
                                message: 'सूचना पठाउन सकिएन। अनुमति जाँच गर्नुहोस्।'
                              });
                            }
                          }}
                          className="px-3 py-1.5 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-600 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs self-start sm:self-auto shrink-0"
                          title="यस अलर्टको पुश सूचना तुरुन्त पठाउनुहोस्"
                        >
                          <Bell className="w-3.5 h-3.5 text-amber-600" />
                          <span>पुश पठाउनुहोस्</span>
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed">
                        {alert.detailedForecast}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-bold text-stone-600 dark:text-stone-400">प्रभावित क्षेत्र:</span>
                        {alert.keyAreas.map((area, idx) => (
                          <span
                            key={idx}
                            className="bg-white/90 dark:bg-stone-800 px-2.5 py-0.5 rounded-lg border border-stone-200 dark:border-stone-700 font-medium text-stone-700 dark:text-stone-300"
                          >
                            {area}
                          </span>
                        ))}
                      </div>

                      {/* Remedies */}
                      <div className="bg-white/90 dark:bg-stone-900/90 p-3.5 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900 dark:text-amber-300">
                          <Flame className="w-3.5 h-3.5 text-amber-600" />
                          <span>शास्त्रसम्मत वैदिक उपाय तथा शान्ति विधान:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-xs text-stone-700 dark:text-stone-300">
                          {alert.remedies.map((rem, idx) => (
                            <li key={idx}>{rem}</li>
                          ))}
                        </ul>
                      </div>

                      {alert.validityNoteNepali && (
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 italic">
                          ℹ️ {alert.validityNoteNepali}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: NOTIFICATION & PLANET SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Browser Permission Status Card */}
              <div className="p-4 sm:p-5 rounded-2xl border border-amber-300 dark:border-stone-700 bg-[#FAF8F5] dark:bg-stone-800/70 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                        permission === 'granted'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {permission === 'granted' ? <BellRing className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        ब्राउजर पुश सूचना अनुमति स्थिति
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        वर्तमान स्थिति:{' '}
                        <strong
                          className={
                            permission === 'granted'
                              ? 'text-emerald-600'
                              : permission === 'denied'
                              ? 'text-rose-600'
                              : 'text-amber-600'
                          }
                        >
                          {permission === 'granted'
                            ? 'स्वीकृत (Granted)'
                            : permission === 'denied'
                            ? 'अस्वीकृत (Denied)'
                            : 'मागिएको छैन (Default)'}
                        </strong>
                      </p>
                    </div>
                  </div>

                  {permission !== 'granted' && (
                    <button
                      onClick={handleRequestPermission}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-sm"
                    >
                      अनुमति माग्नुहोस्
                    </button>
                  )}
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  पुश सूचना सक्रिय गरेपछि महत्वपूर्ण ग्रहहरू (गुरु, शनि, राहु, केतु, संक्रान्ति र अष्टम चन्द्र) परिवर्तन हुँदा तपाईंको डिभाइसमा वास्तविक समयमा सूचना प्राप्त हुनेछ।
                </p>
              </div>

              {/* Master Delivery & Sound Channels */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-600" />
                  <span>पुश सूचना च्यानल तथा ध्वनि (Master Notification Channels)</span>
                </h4>

                <div className="divide-y divide-stone-200 dark:divide-stone-800 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden bg-white dark:bg-stone-900 text-xs shadow-2xs">
                  {/* Master Push Toggle */}
                  <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-stone-900 dark:text-stone-100 block text-sm">
                        सबै गोचर पुश सूचना सक्रिय (Master Notification Switch)
                      </span>
                      <span className="text-stone-500 dark:text-stone-400 text-xs">
                        नयाँ ग्रह गोचर तथा संक्रान्ति हुँदा पृष्ठभूमिमा डिभाइस पुश पठाउने
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs.enabled}
                      onClick={() => handleTogglePreference('enabled')}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        prefs.enabled ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs absolute top-0.5 ${
                          prefs.enabled ? 'left-6.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Sacred Sound Chime */}
                  <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 mt-0.5">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 dark:text-stone-100 block">
                            पवित्र घण्ट/ध्वनि सङ्केत (Sacred Vedic Chime)
                          </span>
                          <button
                            type="button"
                            onClick={() => playTransitChime(528)}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-600 dark:text-stone-300 cursor-pointer transition border border-stone-200 dark:border-stone-700"
                            title="५२८ हर्ज वैदिक ध्वनि परीक्षण गर्नुहोस्"
                          >
                            ध्वनि सुन्नुहोस् 🔔
                          </button>
                        </div>
                        <span className="text-stone-500 dark:text-stone-400 text-xs">
                          सूचना आगमनको समयमा ५२८ हर्जको शान्त एवम् मङ्गलकारी वैदिक घण्टी बजाउने
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs.soundEnabled}
                      onClick={() => handleTogglePreference('soundEnabled')}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        prefs.soundEnabled ? 'bg-amber-600' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs absolute top-0.5 ${
                          prefs.soundEnabled ? 'left-6.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* DEDICATED SECTION: Specific Planet Transit Alert Toggles */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Orbit className="w-4 h-4 text-amber-600" />
                      <span>ग्रह अनुसार विशेष गोचर अलर्ट सेटिङ (Planetary Transit Alert Toggles)</span>
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      कुन-कुन ग्रहको गोचर, साढेसाती तथा अक्षीय परिवर्तन सम्बन्धी अलर्ट प्राप्त गर्ने हो सो छनोट गर्नुहोस्।
                    </p>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                    ९ मध्ये {toDevanagariNumerals(enabledPlanetsCount)} ग्रह सक्रिय
                  </span>
                </div>

                {/* Quick Action Buttons Bar */}
                <div className="flex items-center gap-2 flex-wrap text-xs bg-stone-100 dark:bg-stone-800/80 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700">
                  <span className="font-semibold text-stone-600 dark:text-stone-400">द्रुत कार्य:</span>
                  <button
                    type="button"
                    onClick={handleEnableAllPlanets}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-700 hover:bg-stone-50 text-stone-700 dark:text-stone-200 font-medium transition cursor-pointer border border-stone-200 dark:border-stone-600 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>सबै खोल्नुहोस् (Enable All)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDisableAllPlanets}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-700 hover:bg-stone-50 text-stone-700 dark:text-stone-200 font-medium transition cursor-pointer border border-stone-200 dark:border-stone-600 flex items-center gap-1"
                  >
                    <BellOff className="w-3.5 h-3.5 text-rose-500" />
                    <span>सबै बन्द गर्नुहोस् (Disable All)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetToDefaults}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-700 hover:bg-stone-50 text-stone-700 dark:text-stone-200 font-medium transition cursor-pointer border border-stone-200 dark:border-stone-600 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                    <span>पूर्वनिर्धारित (Reset to Default)</span>
                  </button>
                </div>

                {/* Granular Planet List */}
                <div className="divide-y divide-stone-200 dark:divide-stone-800 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden bg-white dark:bg-stone-900 text-xs shadow-2xs">
                  {/* 1. Saturn / Shani & Sade Sati */}
                  <div className="p-3.5 sm:p-4 space-y-3 bg-[#FAF8F5]/50 dark:bg-stone-900">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-1.5">
                            🪐 शनिदेव गोचर अलर्ट (Saturn Transits)
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold">
                            २.५ वर्ष राशि / ७.५ वर्ष साढेसाती
                          </span>
                        </div>
                        <span className="text-stone-500 dark:text-stone-400 block text-xs">
                          साढेसाती (१, २, १२ भाव) र कण्टक/अष्टम ढैय्या (४, ८ भाव) का साथै राशि परिवर्तन सचेतना।
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={prefs.alertShani}
                        onClick={() => handleTogglePreference('alertShani')}
                        className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                          prefs.alertShani ? 'bg-amber-600' : 'bg-stone-300 dark:bg-stone-700'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs absolute top-0.5 ${
                            prefs.alertShani ? 'left-6.5' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Sub-toggle: Sade Sati Specific */}
                    <div className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      prefs.alertShani
                        ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
                        : 'bg-stone-100/60 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 opacity-60'
                    }`}>
                      <div className="space-y-0.5">
                        <span className="font-bold text-stone-800 dark:text-stone-200 block text-xs flex items-center gap-1">
                          <span>⚠️ साढेसाती विशेष अलर्ट (Sade Sati High-Priority Alert)</span>
                        </span>
                        <span className="text-[11px] text-stone-600 dark:text-stone-400 block">
                          जन्म चन्द्रबाट १२, १, २ भावमा शनि भ्रमण हुँदा आद्य, मध्य तथा अन्त्य चरणको सूचना
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        disabled={!prefs.alertShani}
                        aria-checked={prefs.alertShani && prefs.alertShaniSadeSati !== false}
                        onClick={() => handleTogglePreference('alertShaniSadeSati')}
                        className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 disabled:cursor-not-allowed ${
                          prefs.alertShani && prefs.alertShaniSadeSati !== false ? 'bg-amber-600' : 'bg-stone-300 dark:bg-stone-700'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform shadow-xs absolute top-0.5 ${
                            prefs.alertShani && prefs.alertShaniSadeSati !== false ? 'left-5.5' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* 2. Guru / Jupiter */}
                  <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-1.5">
                          ✨ देवगुरु वृहस्पति (गुरु) गोचर अलर्ट (Jupiter Transits)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold">
                          १ वर्ष राशि गोचर
                        </span>
                      </div>
                      <span className="text-stone-500 dark:text-stone-400 block text-xs">
                        वार्षिक राशि परिवर्तन, ५, ९, ११ भावमा ज्ञान, भाग्य र आर्थिक वृद्धि तथा ६, ८, १२ भावमा सतर्कता।
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs.alertGuru}
                      onClick={() => handleTogglePreference('alertGuru')}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        prefs.alertGuru ? 'bg-amber-600' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs absolute top-0.5 ${
                          prefs.alertGuru ? 'left-6.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 3. Rahu & Ketu */}
                  <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-1.5">
                          🌀 राहु तथा केतु १८ महिने अक्ष गोचर (Rahu-Ketu Karmic Axis)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold">
                          १८ महिना अक्ष चक्र
                        </span>
                      </div>
                      <span className="text-stone-500 dark:text-stone-400 block text-xs">
                        १८ महिने अक्ष परिवर्तन (१/७, २/८ अक्ष), सम्बन्ध रूपान्तरण, वैदेशिक अवसर, भ्रम र कर्मिक सतर्कता।
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs.alertRahuKetu}
                      onClick={() => handleTogglePreference('alertRahuKetu')}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        prefs.alertRahuKetu ? 'bg-amber-600' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs absolute top-0.5 ${
                          prefs.alertRahuKetu ? 'left-6.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 4. Surya / Sun Sankranti */}
                  <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-1.5">
                          ☀️ मासिक सूर्य संक्रान्ति गोचर अलर्ट (Sun Sankranti & Monthly Transits)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold">
                          ३० दिन मासिक गोचर
                        </span>
                      </div>
                      <span className="text-stone-500 dark:text-stone-400 block text-xs">
                        प्रत्येक महिनाको सूर्य संक्रान्ति (महिना परिवर्तन), आत्मबल, सरकारी काम, पदोन्नति र पिता/स्वास्थ्य प्रभाव।
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs.alertSurya}
                      onClick={() => handleTogglePreference('alertSurya')}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        prefs.alertSurya ? 'bg-amber-600' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs absolute top-0.5 ${
                          prefs.alertSurya ? 'left-6.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 5. Mangal / Mars */}
                  <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-1.5">
                          🔥 मङ्गल गोचर तथा पराक्रम सचेतना (Mars / Mangal Transits)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-semibold">
                          ४५ दिन गोचर चक्र
                        </span>
                      </div>
                      <span className="text-stone-500 dark:text-stone-400 block text-xs">
                        १, ४, ७, ८, १२ भावमा आवेश तथा वाहन सुरक्षा, ३, ६, १०, ११ मा प्रतिस्पर्धा विजय र ऊर्जा वृद्धि।
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs.alertMangal}
                      onClick={() => handleTogglePreference('alertMangal')}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        prefs.alertMangal ? 'bg-amber-600' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs absolute top-0.5 ${
                          prefs.alertMangal ? 'left-6.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 6. Budha / Mercury */}
                  <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-1.5">
                          🟢 बुध गोचर तथा व्यापार/बुद्धि अलर्ट (Mercury / Budha Transits)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold">
                          २१ दिन गोचर चक्र
                        </span>
                      </div>
                      <span className="text-stone-500 dark:text-stone-400 block text-xs">
                        व्यापारिक लाभ, वित्तीय हिसाबकिताब, शैक्षिक सफलता, वाकचातुर्य तथा कागजात/सम्झौता प्रमाणीकरण।
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs.alertBudha}
                      onClick={() => handleTogglePreference('alertBudha')}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        prefs.alertBudha ? 'bg-amber-600' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs absolute top-0.5 ${
                          prefs.alertBudha ? 'left-6.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 7. Shukra / Venus */}
                  <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-1.5">
                          💖 शुक्र गोचर तथा ऐश्वर्य/सम्बन्ध अलर्ट (Venus / Shukra Transits)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-pink-100 dark:bg-pink-950/60 text-pink-800 dark:text-pink-300 font-semibold">
                          २५-३० दिन चक्र
                        </span>
                      </div>
                      <span className="text-stone-500 dark:text-stone-400 block text-xs">
                        भौतिक सुख-सुविधा, दाम्पत्य सौहार्द, नयाँ वाहन/आभूषण खरिद र विलासिता बजेट सन्तुलन।
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs.alertShukra}
                      onClick={() => handleTogglePreference('alertShukra')}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        prefs.alertShukra ? 'bg-amber-600' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs absolute top-0.5 ${
                          prefs.alertShukra ? 'left-6.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 8. Chandra / Ashtama Chandra */}
                  <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-1.5">
                          🌑 अष्टम चन्द्र (घातचन्द्र) दैनिक सचेतना (Moon / Ashtama Alerts)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold">
                          २.२५ दिन दैनिक चक्र
                        </span>
                      </div>
                      <span className="text-stone-500 dark:text-stone-400 block text-xs">
                        चन्द्रमा ८औँ भावमा जाँदा ठूलो वित्तीय लगानी, नयाँ सम्झौता र लामो यात्रा स्थगनको वास्तविक समय सूचना।
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs.alertChandraAshtama}
                      onClick={() => handleTogglePreference('alertChandraAshtama')}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        prefs.alertChandraAshtama ? 'bg-amber-600' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs absolute top-0.5 ${
                          prefs.alertChandraAshtama ? 'left-6.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* 9. Retrograde Planets */}
                  <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-1.5">
                          🔄 वक्री ग्रह विशेष सचेतना (Retrograde Planet Alerts)
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold">
                          अस्थायी वक्र चक्र
                        </span>
                      </div>
                      <span className="text-stone-500 dark:text-stone-400 block text-xs">
                        बुध, गुरु, शनि र मङ्गल वक्री हुँदा सञ्चार, दस्तावेज र योजनाहरूको पुनरावलोकन तथा प्राविधिक सावधानी।
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={prefs.alertVakri}
                      onClick={() => handleTogglePreference('alertVakri')}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        prefs.alertVakri ? 'bg-amber-600' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs absolute top-0.5 ${
                          prefs.alertVakri ? 'left-6.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-stone-600 dark:text-stone-400">
                  हालसम्म डेलिभर गरिएका गोचर सूचनाहरू ({toDevanagariNumerals(history.length)})
                </span>
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>इतिहास मेटाउनुहोस्</span>
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-12 text-stone-500 space-y-2 bg-[#FAF8F5] dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-800">
                  <History className="w-8 h-8 mx-auto text-amber-500/60" />
                  <p className="text-sm font-bold">हालसम्म कुनै गोचर सूचना पठाइएको छैन।</p>
                  <p className="text-xs max-w-sm mx-auto text-stone-400">
                    परीक्षण पुश सूचना पठाएर वा नयाँ ग्रह गोचर हुँदा यहाँ इतिहास अभिलेख हुनेछ।
                  </p>
                  <button
                    onClick={handleSendTestPush}
                    className="mt-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    परीक्षण सूचना पठाउनुहोस्
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                          <Bell className="w-3.5 h-3.5 text-amber-600" />
                          {item.title}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {new Date(item.sentAt).toLocaleString('ne-NP', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </span>
                      </div>
                      <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-[#FAF8F5] dark:bg-stone-950 border-t border-[#E6E0D5] dark:border-stone-800 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-600" />
            <span>गोचर गणना लाहिरी अयनांश र चन्द्र राशिमा पूर्णतः आधारित छ।</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onNavigateToGochar();
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <span>गोचर कुण्डली हेर्नुहोस्</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
