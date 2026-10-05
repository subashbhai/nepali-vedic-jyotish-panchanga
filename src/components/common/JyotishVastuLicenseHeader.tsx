import React, { useState, useEffect, memo } from 'react';
import { 
  Crown, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  User, 
  AlertCircle 
} from 'lucide-react';
import { 
  isClientPurchaseApproved, 
  getApprovedClientLicense, 
  is24HourTrialActive, 
  getTrialRemainingSeconds,
  getDeviceTrialRecord
} from '../../db/clientLeadStore';
import { 
  isSoftwareFullAccessUnlocked, 
  evaluateSubscriptionStatus 
} from '../../db/subscriptionStore';
import { getActiveRBACSession } from '../../db/rbacStore';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';

interface JyotishVastuLicenseHeaderProps {
  moduleName: 'ज्योतिष कार्यक्षेत्र' | 'वास्तुशास्त्र';
  onOpenPurchase?: (featureName?: string) => void;
  className?: string;
}

export const JyotishVastuLicenseHeader: React.FC<JyotishVastuLicenseHeaderProps> = memo(({
  moduleName,
  onOpenPurchase,
  className = ''
}) => {
  // Hide this block for now as per user request
  return null;

  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setRevision((r) => r + 1);
    window.addEventListener('software-full-access-updated', handleUpdate);
    window.addEventListener('trial-status-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    const interval = setInterval(() => setRevision((r) => r + 1), 60000); // refresh every minute

    return () => {
      window.removeEventListener('software-full-access-updated', handleUpdate);
      window.removeEventListener('trial-status-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const approvedLicense = getApprovedClientLicense();
  const isApproved = isClientPurchaseApproved() && !!approvedLicense?.isApproved;
  const isDirectUnlocked = isSoftwareFullAccessUnlocked();
  const isTrial24 = is24HourTrialActive();
  const trial24Record = getDeviceTrialRecord();
  const rbacSession = getActiveRBACSession();
  const subStatus = evaluateSubscriptionStatus();

  // 1. Fully Approved Client / Astrologer License
  if (isApproved || isDirectUnlocked) {
    const rawClient = approvedLicense?.clientName || rbacSession?.fullName || 'आधिकारिक ज्योतिषी';
    const clientName = (rawClient.includes('प्रमाणित ग्राहक') || rawClient.includes('Verified Client')) ? 'आधिकारिक ज्योतिषी' : rawClient;
    const planName = approvedLicense?.planId?.startsWith('lifetime') 
      ? 'Life Time' 
      : (approvedLicense?.planName || 'One Year');

    let durationText = planName;
    if (approvedLicense?.expiresAtISO) {
      try {
        const expDate = new Date(approvedLicense.expiresAtISO);
        const daysLeft = Math.max(0, Math.ceil((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
        durationText = `${planName} (${toDevanagariNumerals(daysLeft)} दिन बाँकी)`;
      } catch {}
    }

    return (
      <div className={`bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border-2 border-amber-500/50 rounded-2xl p-3 sm:px-4 sm:py-2.5 text-white shadow-md flex flex-wrap items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold font-serif text-amber-100 flex items-center gap-1.5">
                <span>{moduleName}</span>
                <span className="text-stone-400 font-sans">•</span>
                <span className="text-emerald-400 font-sans text-xs">सक्रिय लाइसेन्स</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/25 text-amber-200 border border-amber-500/40 shadow-2xs">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>{clientName} • {durationText}</span>
              </span>
            </div>
            <p className="text-[11px] text-stone-300">
              आधिकारिक पूर्ण पहुँच • असीमित कुण्डली निर्माण, विस्तृत फलादेश तथा A4 मुद्रण सुविधा
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-amber-300/90 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>पूर्ण संस्करण सक्रिय</span>
        </div>
      </div>
    );
  }

  // 2. 24-Hour Free Trial
  if (isTrial24) {
    const remainingSec = getTrialRemainingSeconds();
    const hours = Math.floor(remainingSec / 3600);
    const mins = Math.floor((remainingSec % 3600) / 60);
    const clientName = trial24Record?.leadFullName || rbacSession?.fullName || 'ट्रयाल प्रयोगकर्ता';

    return (
      <div className={`bg-gradient-to-r from-orange-950 via-stone-900 to-amber-950 border-2 border-orange-500/50 rounded-2xl p-3 sm:px-4 sm:py-2.5 text-white shadow-md flex flex-wrap items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-400/40 text-orange-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-orange-400 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold font-serif text-amber-100 flex items-center gap-1.5">
                <span>{moduleName}</span>
                <span className="text-stone-400 font-sans">•</span>
                <span className="text-orange-400 font-sans text-xs font-black">डेमो परीक्षण (Demo Trial)</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-200 border border-orange-500/40 shadow-2xs">
                <User className="w-3 h-3 text-orange-400" />
                <span>नाम: <strong>{clientName}</strong></span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-red-500/20 text-red-200 border border-red-500/40 shadow-2xs">
                <Clock className="w-3 h-3 text-red-400" />
                <span>अवधि बाँकी: {toDevanagariNumerals(hours)} घण्टा {toDevanagariNumerals(mins)} मिनेट</span>
              </span>
            </div>
            <p className="text-[11px] text-stone-300">
              २४-घण्टे निःशुल्क परीक्षण सक्रिय • म्याद सकिएपछि सफ्टवेयर खरिद गरी सुपरएडमिनबाट स्वीकृत गराउनु पर्नेछ
            </p>
          </div>
        </div>

        {onOpenPurchase && (
          <button
            type="button"
            onClick={() => onOpenPurchase('१ वर्षे पूर्ण सदस्यता')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span>One Year खरिद गर्नुहोस्</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  // 3. 7-Day Free Trial
  if (subStatus.isTrial && subStatus.isActive) {
    const clientName = rbacSession?.fullName || 'परीक्षण प्रयोगकर्ता';

    return (
      <div className={`bg-gradient-to-r from-orange-950 via-stone-900 to-amber-950 border-2 border-orange-500/50 rounded-2xl p-3 sm:px-4 sm:py-2.5 text-white shadow-md flex flex-wrap items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold font-serif text-amber-100 flex items-center gap-1.5">
                <span>{moduleName}</span>
                <span className="text-stone-400 font-sans">•</span>
                <span className="text-orange-400 font-sans text-xs font-black">डेमो परीक्षण (Demo 7-Day)</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-200 border border-orange-500/40 shadow-2xs">
                <User className="w-3 h-3 text-orange-400" />
                <span>नाम: <strong>{clientName}</strong></span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-2xs">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>अवधि: {subStatus.formattedMessageNepali}</span>
              </span>
            </div>
            <p className="text-[11px] text-stone-300">
              ७-दिने निःशुल्क परीक्षण सक्रिय • कुण्डली मुद्रण तथा स्थायी पहुँचका लागि १ वर्षे योजना लिनुहोस्
            </p>
          </div>
        </div>

        {onOpenPurchase && (
          <button
            type="button"
            onClick={() => onOpenPurchase('१ वर्षे पूर्ण सदस्यता')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span>One Year खरिद गर्नुहोस्</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  // 4. Default / Unpurchased Visitor Demo
  const visitorName = rbacSession?.fullName || 'नमुना प्रयोगकर्ता (Guest)';

  return (
    <div className={`bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border-2 border-amber-500/30 rounded-2xl p-3 sm:px-4 sm:py-2.5 text-white shadow-md flex flex-wrap items-center justify-between gap-3 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-bold font-serif text-amber-100 flex items-center gap-1.5">
              <span>{moduleName}</span>
              <span className="text-stone-400 font-sans">•</span>
              <span className="text-amber-400 font-sans text-xs font-black">डेमो संस्करण (Demo)</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-800 text-stone-300 border border-stone-700 shadow-2xs">
              <User className="w-3 h-3 text-stone-400" />
              <span>नाम: <strong>{visitorName}</strong></span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-800 text-amber-300 border border-amber-500/30 shadow-2xs">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>अवधि: <strong>निःशुल्क अवलोकन (Demo Only)</strong></span>
            </span>
          </div>
          <p className="text-[11px] text-stone-300">
            तपाईं हाल डेमो अवलोकनमा हुनुहुन्छ। २४ घण्टे निःशुल्क ट्रयाल लिन वा पूर्ण लाइसेन्स सक्रिय गर्न खरिद फारम भर्नुहोस्।
          </p>
        </div>
      </div>

      {onOpenPurchase && (
        <button
          type="button"
          onClick={() => onOpenPurchase('ज्योतिष तथा वास्तु लाइसेन्स')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <span>२४ घण्टे ट्रयाल / खरिद</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
});
