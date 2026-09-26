import React, { useState, useEffect } from 'react';
import {
  Mail,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  X,
  Sparkles,
  ShieldCheck,
  Eye,
  RefreshCw,
  BellRing,
  Globe2
} from 'lucide-react';
import { PanchangaData, PlanetPosition, BirthDetails } from '../types/astrology';
import type { DailyHoroscopeData } from './DailyHoroscopeView';

interface HoroscopeEmailSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: BirthDetails | null;
  todayPanchanga: PanchangaData;
  horoscopeData: DailyHoroscopeData | null;
  transitPlanets: PlanetPosition[];
}

export const HoroscopeEmailSubscriptionModal: React.FC<HoroscopeEmailSubscriptionModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  todayPanchanga,
  horoscopeData,
  transitPlanets
}) => {
  const [email, setEmail] = useState<string>('suwashdmk@gmail.com');
  const [deliveryTime, setDeliveryTime] = useState<string>('06:30');
  const [includePlanetaryMovements, setIncludePlanetaryMovements] = useState<boolean>(true);
  const [includeTransitMatching, setIncludeTransitMatching] = useState<boolean>(true);
  const [includeRemedies, setIncludeRemedies] = useState<boolean>(true);
  const [includeLifeSectors, setIncludeLifeSectors] = useState<boolean>(true);

  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Check subscription status on open
  useEffect(() => {
    if (!isOpen) return;

    const checkStatus = async () => {
      try {
        const query = email ? `email=${encodeURIComponent(email)}` : (activeProfile?.id ? `profileId=${activeProfile.id}` : '');
        if (!query) return;

        const res = await fetch(`/api/horoscope/subscription-status?${query}`);
        if (res.ok) {
          const data = await res.json();
          if (data.isSubscribed && data.subscription) {
            setIsSubscribed(true);
            setEmail(data.subscription.email);
            setDeliveryTime(data.subscription.deliveryTime || '06:30');
            if (data.subscription.preferences) {
              setIncludePlanetaryMovements(data.subscription.preferences.includePlanetaryMovements ?? true);
              setIncludeTransitMatching(data.subscription.preferences.includeTransitMatching ?? true);
              setIncludeRemedies(data.subscription.preferences.includeRemedies ?? true);
              setIncludeLifeSectors(data.subscription.preferences.includeLifeSectors ?? true);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch subscription status:', err);
      }
    };

    checkStatus();
  }, [isOpen, activeProfile?.id]);

  if (!isOpen) return null;

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatusMessage({ text: 'कृपया मान्य ईमेल ठेगाना राख्नुहोस्।', type: 'error' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const moonRashi = activeProfile?.name ? (transitPlanets.find(p => p.name === 'चन्द्र')?.rashiName || 'मेष') : 'मेष';
      const response = await fetch('/api/horoscope/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          profileId: activeProfile?.id,
          profileName: activeProfile?.name || 'जातक',
          moonRashi: moonRashi,
          lagnaRashi: 'मेष',
          deliveryTime,
          preferences: {
            includePlanetaryMovements,
            includeTransitMatching,
            includeRemedies,
            includeLifeSectors
          }
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setIsSubscribed(true);
        setStatusMessage({
          text: data.messageNepali || 'दैनिक राशिफल ईमेल सूचना सफलतापूर्वक सक्रिय गरियो!',
          type: 'success'
        });
      } else {
        throw new Error(data.error || 'सदस्यता गर्न सकिएन');
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'त्रुटि भयो।', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!confirm('के तपाईं दैनिक राशिफल ईमेल सूचना सदस्यता खारेज गर्न चाहनुहुन्छ?')) return;

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const response = await fetch('/api/horoscope/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setIsSubscribed(false);
        setStatusMessage({ text: data.messageNepali || 'सदस्यता निष्क्रिय गरियो।', type: 'info' });
      }
    } catch (err: any) {
      setStatusMessage({ text: 'सदस्यता रद्द गर्न सकिएन।', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!email || !email.includes('@')) {
      setStatusMessage({ text: 'कृपया मान्य ईमेल ठेगाना प्रविष्ट गर्नुहोस्।', type: 'error' });
      return;
    }

    setIsSendingTest(true);
    setStatusMessage(null);

    try {
      const response = await fetch('/api/horoscope/send-daily-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          profile: {
            name: activeProfile?.name || 'जातक',
            moonRashi: transitPlanets.find(p => p.name === 'चन्द्र')?.rashiName || 'मेष',
            email: email
          },
          todayPanchanga,
          horoscopeData,
          transitPlanets,
          isTest: true
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setPreviewHtml(data.previewHtml);
        setStatusMessage({
          text: `आजको दैनिक राशिफल तथा मुख्य ग्रह गोचर चालको नमूना सूचना ${email} मा पठाइयो!`,
          type: 'success'
        });
      } else {
        throw new Error(data.error || 'ईमेल पठाउन सकिएन');
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'त्रुटि देखा पर्यो।', type: 'error' });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-stone-900 border-2 border-amber-500/80 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-6">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-red-950 via-amber-950 to-stone-900 text-amber-50 p-6 flex items-start justify-between border-b border-amber-600/40 relative">
          <div className="space-y-1.5 pr-6">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
                <Mail className="w-5 h-5" />
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-white flex items-center gap-2">
                <span>दैनिक राशिफल ईमेल सूचना सदस्यता</span>
              </h3>
            </div>
            <p className="text-xs text-amber-200/90 leading-relaxed font-serif">
              हरेक दिन बिहान आफ्नो जातक कुण्डली र सोही दिनको प्रत्यक्ष ग्रह गोचर चाल सारांश सिधै आफ्नो ईमेलमा प्राप्त गर्नुहोस्।
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NOTIFICATION STATUS BANNER */}
        {statusMessage && (
          <div
            className={`p-3.5 mx-6 mt-5 rounded-2xl text-xs flex items-center gap-2.5 font-medium ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                : 'bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : statusMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Globe2 className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* ACTIVE STATUS BADGE */}
        <div className="px-6 pt-5">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/70 dark:bg-stone-800/80 border border-amber-200 dark:border-stone-700">
            <div className="flex items-center gap-2.5">
              <div className={`w-3 h-3 rounded-full ${isSubscribed ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
              <div className="text-xs">
                <span className="text-stone-500 dark:text-stone-400">सदस्यता स्थिति: </span>
                <strong className={isSubscribed ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-stone-700 dark:text-stone-300'}>
                  {isSubscribed ? 'सक्रिय (Active Daily Delivery)' : 'निष्क्रिय (Not Subscribed)'}
                </strong>
              </div>
            </div>

            <div className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
              जातक: {activeProfile?.name || 'जातक'}
            </div>
          </div>
        </div>

        {/* FORM CONTENT */}
        <form onSubmit={handleSubscribe} className="p-6 space-y-5">
          
          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              तपाईंको ईमेल ठेगाना (Recipient Email Address) *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="उदा: yourname@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Delivery Time Option */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>दैनिक सूचना पठाउने समय (Daily Delivery Time)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { time: '05:30', label: '०५:३० बिहान (ब्रह्म मुहूर्त)' },
                { time: '06:30', label: '०६:३० बिहान (सूर्योदय)' },
                { time: '07:30', label: '०७:३० बिहान' },
                { time: '08:30', label: '०८:३० बिहान' }
              ].map((item) => (
                <button
                  type="button"
                  key={item.time}
                  onClick={() => setDeliveryTime(item.time)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                    deliveryTime === item.time
                      ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:border-amber-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Features to Include in Email */}
          <div className="space-y-2 pt-1">
            <span className="block text-xs font-bold text-stone-700 dark:text-stone-300">
              ईमेलमा समावेश हुने मुख्य विषयहरू (Included Daily Content):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-800/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePlanetaryMovements}
                  onChange={(e) => setIncludePlanetaryMovements(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-medium text-stone-800 dark:text-stone-200">
                  🪐 मुख्य ग्रह गोचर चाल सारांश
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-800/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTransitMatching}
                  onChange={(e) => setIncludeTransitMatching(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-medium text-stone-800 dark:text-stone-200">
                  ⚖️ गोचर र कुण्डली मिलान फलादेश
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-800/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLifeSectors}
                  onChange={(e) => setIncludeLifeSectors(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-medium text-stone-800 dark:text-stone-200">
                  💼 कार्य, स्वास्थ्य, परिवार फलादेश
                </span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-800/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeRemedies}
                  onChange={(e) => setIncludeRemedies(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-medium text-stone-800 dark:text-stone-200">
                  🕉️ शुभ रंग, अंक, दिशा र मन्त्र
                </span>
              </label>

            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isSendingTest || !email}
                className="px-3.5 py-2.5 bg-amber-100 hover:bg-amber-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-amber-900 dark:text-amber-300 font-bold text-xs rounded-xl border border-amber-300/80 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isSendingTest ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>नमूना ईमेल पठाउनुहोस्</span>
              </button>

              {previewHtml && (
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="px-3 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold rounded-xl border border-stone-300 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-stone-600" />
                  <span>पूर्वावलोकन</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isSubscribed && (
                <button
                  type="button"
                  onClick={handleUnsubscribe}
                  disabled={isLoading}
                  className="px-3 py-2.5 text-rose-700 hover:text-rose-800 text-xs font-bold transition cursor-pointer"
                >
                  सदस्यता रद्द
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-700 hover:to-amber-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <BellRing className="w-4 h-4" />
                )}
                <span>{isSubscribed ? 'अद्यावधिक गर्नुहोस्' : 'दैनिक सदस्यता लिनुहोस्'}</span>
              </button>
            </div>

          </div>

        </form>

      </div>

      {/* EMAIL PREVIEW MODAL */}
      {showPreviewModal && previewHtml && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>ईमेल प्रारूप पूर्वावलोकन (HTML Email Preview)</span>
              </span>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-stone-100">
              <div 
                dangerouslySetInnerHTML={{ __html: previewHtml }} 
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
