import React, { useState, useMemo, useEffect } from 'react';
import {
  Bell,
  BellRing,
  BellOff,
  Sparkles,
  ShieldAlert,
  Compass,
  ArrowRight,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Settings,
  Send,
  Flame,
  Globe2,
  HeartHandshake
} from 'lucide-react';
import { BirthDetails, PlanetPosition, LagnaInfo } from '../../types/astrology';
import {
  TransitAlertItem,
  TransitNotificationPreferences
} from '../../types/transitNotificationTypes';
import {
  calculateProfileTransitAlerts,
  isBrowserPushSupported,
  getBrowserPushPermission,
  requestBrowserPushPermission,
  getStoredTransitPreferences,
  saveTransitPreferences,
  sendTestTransitPushAlert,
  sendTransitWebPushNotification,
  playTransitChime
} from '../../utils/transitNotificationEngine';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';

interface TransitPushAlertWidgetProps {
  activeProfile: BirthDetails | null;
  birthMoon: PlanetPosition;
  birthLagna?: LagnaInfo;
  transitPlanets: PlanetPosition[];
  todayAD: string;
  todayBS: string;
  onOpenNotificationCenter: () => void;
  onNavigateToGochar: () => void;
  className?: string;
}

export const TransitPushAlertWidget: React.FC<TransitPushAlertWidgetProps> = ({
  activeProfile,
  birthMoon,
  birthLagna,
  transitPlanets,
  todayAD,
  todayBS,
  onOpenNotificationCenter,
  onNavigateToGochar,
  className = ''
}) => {
  const profileName = activeProfile?.name?.trim() || 'जातक';
  const moonRashi = birthMoon?.rashiName || 'मेष';

  // Compute transit alerts for active profile
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

  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(() => alerts[0]?.id || null);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() => getBrowserPushPermission());
  const [prefs, setPrefs] = useState<TransitNotificationPreferences>(() => getStoredTransitPreferences());
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);

  useEffect(() => {
    setPermission(getBrowserPushPermission());
    setPrefs(getStoredTransitPreferences());
  }, []);

  // Update default expanded alert when profile changes
  useEffect(() => {
    if (alerts.length > 0) {
      setExpandedAlertId(alerts[0].id);
    }
  }, [activeProfile?.id]);

  const handleTogglePush = async () => {
    if (!isBrowserPushSupported()) {
      setTestStatus('तपाईंको ब्राउजरले वेब पुश सूचना समर्थन गर्दैन।');
      return;
    }

    if (permission !== 'granted') {
      const result = await requestBrowserPushPermission();
      setPermission(result);
      if (result === 'granted') {
        const updated = { ...prefs, enabled: true };
        setPrefs(updated);
        saveTransitPreferences(updated);
        setTestStatus('पुश सूचना सक्रिय गरियो! अब महत्वपूर्ण गोचर परिवर्तनको सूचना प्राप्त हुनेछ।');
        playTransitChime(528);
      } else {
        setTestStatus('सूचना अनुमति अस्वीकृत गरिएको छ। कृपया ब्राउजर सेटिङमा अनुमति खुला गर्नुहोस्।');
      }
    } else {
      const updated = { ...prefs, enabled: !prefs.enabled };
      setPrefs(updated);
      saveTransitPreferences(updated);
      setTestStatus(updated.enabled ? 'पुश सूचना पुनः सक्रिय भयो।' : 'पुश सूचना बन्द गरियो।');
    }
  };

  const handleSendTestPush = async () => {
    setIsSendingTest(true);
    setTestStatus(null);
    try {
      const res = await sendTestTransitPushAlert({
        activeProfile,
        alerts,
        onNavigateToGochar
      });
      setPermission(getBrowserPushPermission());
      setTestStatus(res.message);
    } catch {
      setTestStatus('सूचना पठाउन सकिएन।');
    } finally {
      setIsSendingTest(false);
      setTimeout(() => setTestStatus(null), 6000);
    }
  };

  const highPriorityAlerts = alerts.filter(
    (a) => a.severity === 'maha_parivartan' || a.severity === 'alert'
  );

  return (
    <div
      id="dashboard-transit-push-alert-card"
      className={`bg-white dark:bg-stone-900 rounded-2xl border border-amber-300/80 dark:border-stone-800 shadow-xs relative overflow-hidden transition-all duration-200 ${className}`}
    >
      {/* Top Accent Gradient */}
      <div className="h-1.5 w-full bg-gradient-to-r from-orange-600 via-amber-500 to-indigo-600" />

      <div className="p-5 sm:p-6 space-y-4">
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6E0D5] dark:border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-rose-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold shrink-0 shadow-inner">
              <Globe2 className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-950 dark:to-orange-950 text-amber-900 dark:text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700 shadow-2xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>व्यक्तिगत गोचर पुश सूचना (Transit Push Alert)</span>
                </span>
                <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                  चन्द्र राशि: <strong>{moonRashi}</strong> • {profileName}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold font-serif text-[#1A1A1A] dark:text-stone-100 mt-0.5 flex items-center gap-2">
                <span>प्रमुख ग्रह गोचर प्रभाव तथा सचेतना</span>
                {highPriorityAlerts.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 font-sans font-bold border border-rose-300 dark:border-rose-800">
                    {toDevanagariNumerals(highPriorityAlerts.length)} विशेष सचेतना
                  </span>
                )}
              </h3>
            </div>
          </div>

          {/* Quick Push Notification Controls */}
          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <button
              onClick={handleTogglePush}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 border ${
                prefs.enabled && permission === 'granted'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                  : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700'
              }`}
              title={
                prefs.enabled && permission === 'granted'
                  ? 'पुश सूचना सक्रिय छ (Push Alerts Active)'
                  : 'पुश सूचना सक्रिय गर्नुहोस् (Enable Push Alerts)'
              }
            >
              {prefs.enabled && permission === 'granted' ? (
                <>
                  <BellRing className="w-3.5 h-3.5 text-emerald-200 animate-bounce" />
                  <span>पुश सूचना: सक्रिय</span>
                </>
              ) : (
                <>
                  <BellOff className="w-3.5 h-3.5 text-stone-500" />
                  <span>पुश सूचना खुला गर्नुहोस्</span>
                </>
              )}
            </button>

            <button
              id="btn-test-transit-push"
              onClick={handleSendTestPush}
              disabled={isSendingTest}
              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 rounded-xl text-xs font-bold border border-amber-300/80 dark:border-amber-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95 disabled:opacity-60"
              title="ब्राउजरमा तत्काल परीक्षण पुश सूचना पठाउनुहोस्"
            >
              <Send className={`w-3.5 h-3.5 text-amber-700 dark:text-amber-400 ${isSendingTest ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">परीक्षण सूचना</span>
            </button>

            <button
              onClick={onOpenNotificationCenter}
              className="p-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-700 transition cursor-pointer"
              title="गोचर सूचना केन्द्र तथा विस्तृत सेटिङ"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* FEEDBACK BANNER (If test sent or permission toggled) */}
        {testStatus && (
          <div className="p-3 bg-amber-50 dark:bg-stone-800/80 border border-amber-300 dark:border-stone-700 rounded-xl text-xs text-amber-950 dark:text-amber-200 flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{testStatus}</span>
          </div>
        )}

        {/* ALERTS ACCORDION LIST */}
        <div className="space-y-3">
          {alerts.slice(0, 4).map((alert) => {
            const isExpanded = expandedAlertId === alert.id;
            const isHighSeverity = alert.severity === 'maha_parivartan' || alert.severity === 'alert';

            return (
              <div
                key={alert.id}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  alert.severity === 'maha_parivartan'
                    ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                    : alert.severity === 'alert'
                    ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60'
                    : 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                }`}
              >
                {/* Alert Header Row */}
                <div
                  onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs border ${
                        alert.severity === 'maha_parivartan'
                          ? 'bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 border-rose-300'
                          : alert.severity === 'alert'
                          ? 'bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border-amber-300'
                          : 'bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border-emerald-300'
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
                        <h4 className="text-sm font-bold font-serif text-stone-900 dark:text-stone-100">
                          {alert.title}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            alert.severity === 'maha_parivartan'
                              ? 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200'
                              : alert.severity === 'alert'
                              ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200'
                          }`}
                        >
                          {alert.severity === 'maha_parivartan' && 'महा-परिवर्तन'}
                          {alert.severity === 'alert' && 'विशेष सचेत'}
                          {alert.severity === 'shubha' && 'शुभ फलदायी'}
                          {alert.severity === 'madhyam' && 'सामान्य'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                        {alert.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-stone-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-500" />
                    )}
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="px-3.5 pb-4 sm:px-4 space-y-3 text-xs border-t border-black/5 dark:border-white/5 pt-3 animate-in fade-in duration-150">
                    <p className="leading-relaxed text-stone-800 dark:text-stone-200 font-sans">
                      {alert.detailedForecast}
                    </p>

                    {/* Key Influenced Areas */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400">प्रभावित क्षेत्र:</span>
                      {alert.keyAreas.map((area, idx) => (
                        <span
                          key={idx}
                          className="bg-white/80 dark:bg-stone-800 px-2 py-0.5 rounded-md border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-medium"
                        >
                          {area}
                        </span>
                      ))}
                    </div>

                    {/* Recommended Vedic Remedies */}
                    <div className="bg-white/80 dark:bg-stone-900/80 p-3 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300">
                        <Flame className="w-3.5 h-3.5 text-amber-600" />
                        <span>शास्त्रसम्मत उपाय तथा शान्ति मार्गदर्शन (Vedic Remedies):</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-700 dark:text-stone-300">
                        {alert.remedies.map((rem, idx) => (
                          <li key={idx}>{rem}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Action button to test notification or go to Gochar View */}
                    <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                      <button
                        onClick={async () => {
                          const sent = await sendTransitWebPushNotification({
                            alert,
                            profileName,
                            onNavigateToGochar
                          });
                          if (sent) {
                            setTestStatus(`"${alert.title}" सम्बन्धी पुश सूचना पठाइयो!`);
                          } else {
                            setTestStatus('सूचना पठाउन सकिएन। अनुमति जाँच गर्नुहोस्।');
                          }
                        }}
                        className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-amber-900 dark:text-amber-300 font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Bell className="w-3 h-3 text-amber-600" />
                        <span>यस गोचरको पुश सूचना पठाउनुहोस्</span>
                      </button>

                      <button
                        onClick={onNavigateToGochar}
                        className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>विस्तृत गोचर कुण्डली हेर्नुहोस्</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* FOOTER BAR: View all and notification center trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E6E0D5] dark:border-stone-800 text-xs">
          <div className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            <span>
              गोचर प्रभाव जातक <strong>{profileName}</strong> को जन्म चन्द्र राशि <strong>({moonRashi})</strong> र लग्नमा आधारित छ।
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNotificationCenter}
              className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-900 dark:bg-stone-700 dark:hover:bg-stone-600 text-white font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Bell className="w-3.5 h-3.5 text-amber-300" />
              <span>सबै गोचर सूचनाहरू ({toDevanagariNumerals(alerts.length)})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
