import React, { useState, useEffect, useMemo } from 'react';
import {
  Sun,
  Moon,
  Sparkles,
  Bell,
  BellRing,
  BellOff,
  ChevronRight,
  X,
  Compass,
  Zap,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { BirthDetails, PanchangaData, PlanetPosition, LagnaInfo } from '../types/astrology';
import {
  generateQuickHoroscopeInsight,
  isDailyHoroscopePushEnabled,
  setDailyHoroscopePushEnabled,
  isDailyBannerDismissed,
  setDailyBannerDismissed,
  isBrowserNotificationSupported,
  getBrowserNotificationPermission,
  requestHoroscopeNotificationPermission,
  sendHoroscopeWebNotification,
  checkAndSendAutoDailyHoroscopeNotification,
  QuickHoroscopeInsight
} from '../utils/dailyHoroscopeNotifier';

interface DailyHoroscopeAlertBannerProps {
  activeProfile: BirthDetails | null;
  moon: PlanetPosition;
  lagna: LagnaInfo;
  todayPanchanga: PanchangaData;
  todayAD: string;
  todayBS: string;
  activeTab: string;
  onNavigateToHoroscope: () => void;
}

export const DailyHoroscopeAlertBanner: React.FC<DailyHoroscopeAlertBannerProps> = ({
  activeProfile,
  moon,
  lagna,
  todayPanchanga,
  todayAD,
  todayBS,
  activeTab,
  onNavigateToHoroscope,
}) => {
  const profileId = activeProfile?.id || 'default';
  const profileName = activeProfile?.name?.trim() || 'जातक';
  const moonRashi = moon?.rashiName || todayPanchanga?.moonRashi || 'मेष';
  const lagnaRashi = lagna?.rashiName || 'मेष';

  const [isDismissed, setIsDismissed] = useState<boolean>(() =>
    isDailyBannerDismissed(todayAD, profileId)
  );
  const [pushEnabled, setPushEnabled] = useState<boolean>(() => isDailyHoroscopePushEnabled());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(
    () => getBrowserNotificationPermission()
  );
  const [testNotificationFeedback, setTestNotificationFeedback] = useState<string | null>(null);

  // Update dismissed state when activeProfile or date changes
  useEffect(() => {
    setIsDismissed(isDailyBannerDismissed(todayAD, profileId));
  }, [todayAD, profileId]);

  // Sync notification permission status on mount
  useEffect(() => {
    setNotificationPermission(getBrowserNotificationPermission());
    setPushEnabled(isDailyHoroscopePushEnabled());
  }, []);

  // Compute quick insight
  const insight: QuickHoroscopeInsight = useMemo(() => {
    return generateQuickHoroscopeInsight(
      activeProfile,
      moonRashi,
      todayPanchanga,
      lagnaRashi
    );
  }, [activeProfile, moonRashi, todayPanchanga, lagnaRashi]);

  // Automatically check and trigger daily push notification if enabled
  useEffect(() => {
    if (pushEnabled && notificationPermission === 'granted') {
      checkAndSendAutoDailyHoroscopeNotification({
        todayDateStr: todayAD,
        profileId,
        profileName,
        moonRashi,
        todayBS,
        luckyColor: insight.luckyColor,
        luckyNumber: insight.luckyNumber,
        overallRating: insight.overallRating,
        onNavigateToHoroscope,
      });
    }
  }, [pushEnabled, notificationPermission, todayAD, profileId, profileName, moonRashi, todayBS, insight, onNavigateToHoroscope]);

  // Handle push notification toggle
  const handleTogglePushNotification = async () => {
    if (!isBrowserNotificationSupported()) {
      setTestNotificationFeedback('यो ब्राउजरमा वेब नोटिफिकेसन उपलब्ध छैन।');
      setTimeout(() => setTestNotificationFeedback(null), 4000);
      return;
    }

    if (notificationPermission !== 'granted') {
      const permission = await requestHoroscopeNotificationPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        setDailyHoroscopePushEnabled(true);
        setPushEnabled(true);
        setTestNotificationFeedback('दैनिक राशिफल पुश नोटिफिकेसन सक्रिय गरियो!');
        sendHoroscopeWebNotification({
          profileName,
          moonRashi,
          todayBS,
          luckyColor: insight.luckyColor,
          luckyNumber: insight.luckyNumber,
          overallRating: insight.overallRating,
          onNavigateToHoroscope,
        });
      } else {
        setDailyHoroscopePushEnabled(false);
        setPushEnabled(false);
        setTestNotificationFeedback('नोटिफिकेसन अस्वीकृत भयो। ब्राउजर सेटिङबाट अनुमति दिनुहोस्।');
      }
    } else {
      const nextState = !pushEnabled;
      setDailyHoroscopePushEnabled(nextState);
      setPushEnabled(nextState);
      setTestNotificationFeedback(
        nextState ? 'दैनिक राशिफल पुश नोटिफिकेसन सक्रिय भयो!' : 'दैनिक पुश नोटिफिकेसन बन्द गरियो।'
      );
    }

    setTimeout(() => setTestNotificationFeedback(null), 4000);
  };

  // Handle instant test notification
  const handleTestNotification = () => {
    if (notificationPermission !== 'granted') {
      handleTogglePushNotification();
      return;
    }

    const sent = sendHoroscopeWebNotification({
      profileName,
      moonRashi,
      todayBS,
      luckyColor: insight.luckyColor,
      luckyNumber: insight.luckyNumber,
      overallRating: insight.overallRating,
      onNavigateToHoroscope,
    });

    if (sent) {
      setTestNotificationFeedback('परीक्षण नोटिफिकेसन पठाइयो! स्क्रिनमा हेर्नुहोस्।');
    } else {
      setTestNotificationFeedback('नोटिफिकेसन पठाउन सकिएन।');
    }
    setTimeout(() => setTestNotificationFeedback(null), 4000);
  };

  const handleDismiss = () => {
    setDailyBannerDismissed(todayAD, profileId, true);
    setIsDismissed(true);
  };

  const handleRestore = () => {
    setDailyBannerDismissed(todayAD, profileId, false);
    setIsDismissed(false);
  };



  // If dismissed, render a subtle, non-intrusive compact banner/pill
  if (isDismissed) {
    return (
      <aside aria-label="दैनिक राशिफल सूचना पट्टी" className="mb-4 flex items-center justify-between px-3.5 py-2 bg-amber-50/90 dark:bg-stone-900/90 border border-amber-300/70 dark:border-stone-800 rounded-xl text-xs text-[#78350F] dark:text-amber-200 shadow-xs transition-all">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="font-semibold">{profileName}</span>
          <span className="text-amber-700 dark:text-amber-300/80">
            ({moonRashi} राशि) को आजको दैनिक राशिफल तयार छ
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToHoroscope}
            className="px-2.5 py-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg font-medium shadow-xs flex items-center gap-1 transition-transform active:scale-95 cursor-pointer text-[11px]"
          >
            <span>राशिफल हेर्नुहोस्</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRestore}
            title="विस्तृत ब्यानर पुनः देखाउनुहोस्"
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 px-1.5 py-0.5 rounded text-[11px] underline cursor-pointer"
          >
            विस्तार
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside aria-label="दैनिक राशिफल सूचना ब्यानर" className="mb-5 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2A1509] via-[#3B1E0C] to-[#1C1917] border border-amber-500/40 dark:border-amber-600/30 text-amber-50 shadow-md transition-all">
      {/* Subtle Vedic star background pattern decoration */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left Section: Icon & Horoscope Narrative */}
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/30 border border-amber-400/50 flex items-center justify-center text-amber-300 shrink-0 shadow-inner relative mt-0.5 sm:mt-0">
            <Sun className="w-6 h-6 text-amber-300 animate-pulse" />
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-stone-950 p-0.5 rounded-full ring-2 ring-stone-900">
              <Sparkles className="w-2.5 h-2.5" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Header Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-500/25 text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>दैनिक राशिफल अलर्ट (Daily Horoscope)</span>
              </span>

              <span className="text-xs font-semibold text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
                जातक: {profileName}
              </span>

              <span className="text-xs text-amber-300 font-medium">
                चन्द्र राशि: <strong className="text-amber-100">{moonRashi}</strong> {moon?.nakshatraName ? `(${moon.nakshatraName})` : ''}
              </span>

              <span className="text-[11px] text-amber-200/70 hidden sm:inline">
                | {todayBS}
              </span>
            </div>

            {/* Title / Hook */}
            <h3 className="text-sm sm:text-base font-bold text-white font-serif tracking-tight leading-snug">
              आजको दिन <span className="text-amber-300">{profileName}</span>का लागि चन्द्र गोचर अनुसार कस्तो रहनेछ?
            </h3>

            {/* Teaser Summary */}
            <p className="text-xs text-amber-200/85 mt-1 line-clamp-2 max-w-3xl leading-relaxed">
              {insight.summary}
            </p>

            {/* Lucky Parameters Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2 border-t border-amber-500/20 text-[11px]">
              <div className="flex items-center gap-1 text-amber-200 bg-black/20 px-2 py-0.5 rounded-md border border-amber-400/20">
                <span className="text-amber-400 font-bold">शुभ रङ्ग:</span>
                <span>{insight.luckyColor}</span>
              </div>

              <div className="flex items-center gap-1 text-amber-200 bg-black/20 px-2 py-0.5 rounded-md border border-amber-400/20">
                <span className="text-amber-400 font-bold">भाग्य अङ्क:</span>
                <span>{insight.luckyNumber}</span>
              </div>

              <div className="flex items-center gap-1 text-amber-200 bg-black/20 px-2 py-0.5 rounded-md border border-amber-400/20 hidden md:flex">
                <span className="text-amber-400 font-bold">शुभ दिशा:</span>
                <span>{insight.luckyDirection}</span>
              </div>

              <div className="flex items-center gap-1 text-amber-200 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/30">
                <Zap className="w-3 h-3 text-amber-300" />
                <span className="font-bold">दिनको अनुकूलता:</span>
                <span className="text-amber-100 font-semibold">{insight.overallRating}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Actions & Push Notification Opt-in */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 shrink-0 w-full lg:w-auto mt-2 lg:mt-0">
          {/* Main CTA: View Full Daily Horoscope */}
          <button
            onClick={onNavigateToHoroscope}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg border border-amber-300/50 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer ring-1 ring-amber-400/30"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>दैनिक राशिफल हेर्नुहोस्</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Secondary Controls: Daily Push Notification Alert Toggle & Test */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full">
            <button
              onClick={handleTogglePushNotification}
              className={`text-[11px] px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
                pushEnabled && notificationPermission === 'granted'
                  ? 'bg-amber-500/20 text-amber-200 border-amber-400/40 hover:bg-amber-500/30'
                  : 'bg-black/30 text-amber-300/80 border-white/10 hover:bg-black/50 hover:text-amber-200'
              }`}
              title={
                pushEnabled
                  ? 'दैनिक पुश अलर्ट सक्रिय छ (क्लिक गरेर बन्द गर्न सक्नुहुन्छ)'
                  : 'ब्राउजरमा हरेक दिन राशिफलको पुश सूचना पाउनुहोस्'
              }
            >
              {pushEnabled && notificationPermission === 'granted' ? (
                <>
                  <BellRing className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                  <span>पुश अलर्ट सक्रिय</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5" />
                  <span>दैनिक पुश सूचना सक्षम गर्नुहोस्</span>
                </>
              )}
            </button>

            {pushEnabled && notificationPermission === 'granted' && (
              <button
                onClick={handleTestNotification}
                className="text-[11px] px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10 transition-colors cursor-pointer"
                title="अहिले नै परीक्षण सूचना पठाउनुहोस्"
              >
                परीक्षण
              </button>
            )}

            {/* Dismiss X button */}
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="आजका लागि ब्यानर हटाउनुहोस् (Dismiss for today)"
              aria-label="Dismiss banner for today"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Feedback Toast message */}
          {testNotificationFeedback && (
            <div className="text-[11px] bg-amber-900/90 border border-amber-400/50 text-amber-100 px-2.5 py-1 rounded-md shadow-xs animate-fade-in flex items-center gap-1 w-full justify-center sm:justify-end">
              <CheckCircle2 className="w-3 h-3 text-amber-400" />
              <span>{testNotificationFeedback}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
