import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Sparkles,
  ShieldAlert,
  Globe2,
  CheckCircle2,
  Compass,
  Zap,
  ArrowRight,
  Info,
  Calendar,
  Layers,
  Award,
  Clock,
  HeartHandshake
} from 'lucide-react';
import {
  PlanetaryIngressEvent,
  requestAndSendBrowserNotification
} from '../utils/ingressDetector';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';

interface PlanetaryIngressAlertBoxProps {
  ingressEvents: PlanetaryIngressEvent[];
  userName?: string;
  className?: string;
}

export const PlanetaryIngressAlertBox: React.FC<PlanetaryIngressAlertBoxProps> = ({
  ingressEvents,
  userName = 'जातक',
  className = ''
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(
    ingressEvents.length > 0 ? ingressEvents[0].id : ''
  );
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [notificationStatusMsg, setNotificationStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSendingNotification, setIsSendingNotification] = useState<boolean>(false);
  const [autoNotifyEnabled, setAutoNotifyEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('astro_auto_ingress_notify') === 'true';
    } catch {
      return false;
    }
  });

  // Check browser notification permission status
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const selectedEvent = ingressEvents.find((e) => e.id === selectedEventId) || ingressEvents[0] || null;

  // Major highlight event (e.g. Saturn or Jupiter or Sun Sankranti)
  const majorHighlightEvent = ingressEvents.find((e) => e.planetName === 'शनि' || e.planetName === 'गुरु' || e.planetName === 'सूर्य') || ingressEvents[0];

  const handleSendNotification = async (eventToSend?: PlanetaryIngressEvent) => {
    const target = eventToSend || selectedEvent || ingressEvents[0];
    if (!target) return;

    setIsSendingNotification(true);
    setNotificationStatusMsg(null);

    const result = await requestAndSendBrowserNotification(target, userName);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    setIsSendingNotification(false);
    setNotificationStatusMsg({
      text: result.message,
      isError: !result.success
    });

    setTimeout(() => {
      setNotificationStatusMsg(null);
    }, 4500);
  };

  const handleToggleAutoNotify = async () => {
    if (!autoNotifyEnabled) {
      // Requesting permission
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted') {
        const res = await Notification.requestPermission();
        setNotificationPermission(res);
        if (res !== 'granted') {
          setNotificationStatusMsg({
            text: 'ब्राउजरमा सूचनाको अनुमति नभएकाले स्वचालित सूचना सक्रिय गर्न सकिएन।',
            isError: true
          });
          return;
        }
      }
      setAutoNotifyEnabled(true);
      try {
        localStorage.setItem('astro_auto_ingress_notify', 'true');
      } catch {}
      setNotificationStatusMsg({
        text: 'दैनिक ग्रह गोचर तथा सङ्क्रान्ति सूचना सफलतापूर्वक सक्रिय भयो!',
        isError: false
      });
      // Trigger instant preview notification
      if (majorHighlightEvent) {
        requestAndSendBrowserNotification(majorHighlightEvent, userName);
      }
    } else {
      setAutoNotifyEnabled(false);
      try {
        localStorage.setItem('astro_auto_ingress_notify', 'false');
      } catch {}
      setNotificationStatusMsg({
        text: 'स्वचालित गोचर सूचना निष्कृय गरियो।',
        isError: false
      });
    }

    setTimeout(() => {
      setNotificationStatusMsg(null);
    }, 3500);
  };

  if (!selectedEvent || ingressEvents.length === 0) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-br from-amber-950/95 via-stone-900 to-red-950 text-white rounded-3xl border-2 border-amber-500/70 p-5 sm:p-6 shadow-xl relative overflow-hidden space-y-5 ${className}`}>
      
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* TOP HEADER & NOTIFICATION TOGGLES */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-600/40 pb-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-amber-500/30 text-amber-200 border border-amber-400/50 text-[11px] px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-xs">
              <Globe2 className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>ग्रह गोचर प्रवेश तथा सङ्क्रान्ति अलर्ट (Planetary Ingress)</span>
            </span>

            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
              सक्रिय जातक: {userName}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold font-serif text-amber-100 flex items-center gap-2">
            <span>आजको महत्वपूर्ण ग्रह राशि परिवर्तन तथा गोचर प्रभाव</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h3>
          <p className="text-xs text-amber-200/80 leading-relaxed font-serif">
            शनि, गुरु, सूर्य सङ्क्रान्ति तथा चन्द्रमाको राशि प्रवेश अनुसार तपाईंको कुण्डलीमा आज सक्रिय रहेको विशेष गोचर फल:
          </p>
        </div>

        {/* NOTIFICATION ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSendNotification(selectedEvent)}
              disabled={isSendingNotification}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md border border-amber-400/50 flex items-center justify-center gap-2 transition transform active:scale-95 cursor-pointer disabled:opacity-50"
              title="यो गोचरको ब्राउजर सूचना पठाउनुहोस्"
            >
              <Bell className="w-3.5 h-3.5 text-amber-200 animate-bounce" />
              <span>{isSendingNotification ? 'पठाउँदै...' : 'ब्राउजरमा सूचना पठाउनुहोस्'}</span>
            </button>

            <button
              onClick={handleToggleAutoNotify}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                autoNotifyEnabled
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-xs'
                  : 'bg-stone-800/80 text-amber-200 border-amber-500/40 hover:bg-stone-700'
              }`}
              title="स्वचालित दैनिक गोचर सूचना अन/अफ गर्नुहोस्"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>{autoNotifyEnabled ? '🔔 स्वतः सक्रिय' : 'स्वतः सूचना अन'}</span>
            </button>
          </div>

          <div className="text-[10px] text-amber-300/70 font-sans flex items-center gap-1 self-start sm:self-auto">
            <Info className="w-3 h-3 text-amber-400" />
            <span>ब्राउजर अनुमति स्थिति: <strong className="text-amber-200">{notificationPermission === 'granted' ? 'स्वीकृत (Granted)' : notificationPermission === 'denied' ? 'अस्वीकृत' : 'स्वीकृति बाँकी'}</strong></span>
          </div>
        </div>
      </div>

      {/* FEEDBACK STATUS TOAST */}
      {notificationStatusMsg && (
        <div className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
          notificationStatusMsg.isError
            ? 'bg-rose-950/90 border-rose-600 text-rose-200'
            : 'bg-emerald-950/90 border-emerald-500 text-emerald-100'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notificationStatusMsg.text}</span>
        </div>
      )}

      {/* PLANETARY INGRESS SELECTOR CHIPS */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-bold text-amber-300 mr-1 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>गोचर ग्रह:</span>
        </span>
        {ingressEvents.map((event) => {
          const isSelected = event.id === selectedEventId;
          return (
            <button
              key={event.id}
              onClick={() => setSelectedEventId(event.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md ring-2 ring-amber-300'
                  : 'bg-stone-900/80 hover:bg-stone-800 text-amber-200 border border-amber-600/40'
              }`}
            >
              <span className="text-sm font-serif font-black">{event.glyph}</span>
              <span>{event.planetName}</span>
              <span className="text-[10px] opacity-85">({event.transitRashi})</span>
            </button>
          );
        })}
      </div>

      {/* DETAILED ACTIVE INGRESS SUMMARY CARD */}
      <div className="bg-stone-950/70 border border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 text-xl font-bold font-serif shadow-inner shrink-0">
              {selectedEvent.glyph}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10.5px] px-2 py-0.5 rounded-md font-bold ${
                  selectedEvent.nature === 'अत्यन्त शुभ'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60'
                    : selectedEvent.nature === 'सावधानी'
                    ? 'bg-rose-950 text-rose-300 border border-rose-500/60'
                    : 'bg-amber-950 text-amber-300 border border-amber-500/60'
                }`}>
                  {selectedEvent.nature} प्रभाव
                </span>
                <span className="text-[11px] text-amber-300/80">
                  {selectedEvent.timingDescriptionNepali}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-bold font-serif text-amber-100 mt-0.5">
                {selectedEvent.ingressTitleNepali}
              </h4>
            </div>
          </div>

          <div className="bg-black/50 border border-amber-500/30 rounded-xl p-2.5 text-xs text-right shrink-0">
            <div className="text-[10px] text-amber-300/80 uppercase font-bold">गोचर भोगांश (Degree)</div>
            <div className="text-sm font-extrabold text-amber-400 font-serif">
              {selectedEvent.formattedDegree} {selectedEvent.transitRashi}
            </div>
          </div>
        </div>

        {/* NATAL HOUSES & PERSONALIZED FRUITION */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
          
          {/* House alignment badges */}
          <div className="md:col-span-4 bg-stone-900/90 border border-stone-800 rounded-xl p-3.5 space-y-2.5 flex flex-col justify-center">
            <div className="flex items-center justify-between text-xs border-b border-stone-800 pb-2">
              <span className="text-stone-400">जन्म चन्द्र राशिबाट:</span>
              <strong className="text-amber-300 font-serif text-sm">
                भाव {toDevanagariNumerals(selectedEvent.houseFromMoon)}
              </strong>
            </div>
            <div className="flex items-center justify-between text-xs border-b border-stone-800 pb-2">
              <span className="text-stone-400">जन्म लग्नबाट:</span>
              <strong className="text-amber-300 font-serif text-sm">
                भाव {toDevanagariNumerals(selectedEvent.houseFromLagna)}
              </strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400">प्रभावित क्षेत्र:</span>
              <span className="bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded text-[11px] font-bold">
                {selectedEvent.impactCategory === 'career' ? '💼 कार्य तथा पद' : selectedEvent.impactCategory === 'finance' ? '💰 धन तथा भाग्य' : selectedEvent.impactCategory === 'health' ? '🌿 स्वास्थ्य व मन' : selectedEvent.impactCategory === 'family' ? '❤️ परिवार व सम्बन्ध' : '🕉️ आध्यात्मिक'}
              </span>
            </div>
          </div>

          {/* Detailed personalized impact */}
          <div className="md:col-span-8 bg-amber-950/30 border border-amber-500/30 rounded-xl p-3.5 space-y-2 flex flex-col justify-center">
            <strong className="text-xs font-bold text-amber-300 font-serif flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>जातकको कुण्डलीमा प्रत्यक्ष फलादेश:</span>
            </strong>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-serif">
              {selectedEvent.personalizedImpactNepali}
            </p>
          </div>

        </div>

        {/* VEDIC REMEDY & MANTRA BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="bg-stone-900/90 border border-stone-800 p-3 rounded-xl space-y-1">
            <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>दैनिक वैदिक उपाय:</span>
            </div>
            <p className="text-[11.5px] text-stone-300 leading-relaxed">
              {selectedEvent.remedyNepali}
            </p>
          </div>

          <div className="bg-stone-900/90 border border-stone-800 p-3 rounded-xl space-y-1">
            <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
              <span>सक्रियीकरण मन्त्र:</span>
            </div>
            <p className="text-[11.5px] text-amber-200 font-serif font-bold leading-relaxed select-all">
              {selectedEvent.mantraNepali}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
