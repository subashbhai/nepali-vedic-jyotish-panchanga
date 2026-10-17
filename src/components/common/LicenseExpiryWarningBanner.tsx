import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, RefreshCw, X, ShieldAlert, CreditCard } from 'lucide-react';
import {
  calculateRemainingDays,
  isLicenseExpired,
  getNepaliExpiryWarningMessage,
  processExpiryMilestoneNotification
} from '../../utils/licenseExpiryEngine';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';
import { getStoredClientLeads, getApprovedClientLicense } from '../../db/clientLeadStore';
import { getLocalLicenses } from '../../db/serviceLicenseStore';
import { RBACSession } from '../../db/rbacStore';

interface LicenseExpiryWarningBannerProps {
  session?: RBACSession | null;
  onOpenRenewal?: () => void;
  className?: string;
}

export const LicenseExpiryWarningBanner: React.FC<LicenseExpiryWarningBannerProps> = ({
  session,
  onOpenRenewal,
  className = ''
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [remainingDays, setRemainingDays] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [planName, setPlanName] = useState<string>('वार्षिक सदस्यता');

  const evaluateExpiry = () => {
    // 1. Superadmin has permanent access, no banner needed
    if (session?.role === 'SUPER_ADMIN' || session?.role === 'STORE_ADMIN') {
      setRemainingDays(null);
      setIsExpired(false);
      return;
    }

    const userPhone = (session?.phone || session?.username || '').replace(/\D/g, '').slice(-10);
    const userId = session?.userId || '';

    // Check service licenses first
    const licenses = getLocalLicenses();
    const matchedLicense = licenses.find((l) => {
      const lPhone = (l.phone || '').replace(/\D/g, '').slice(-10);
      const lUser = (l.userId || '').toLowerCase();
      if (userPhone && lPhone === userPhone) return true;
      if (userId && lUser === userId.toLowerCase()) return true;
      return false;
    });

    let expiryTs: number | null | undefined = null;
    let currentPlan = '१ वर्षको सदस्यता';

    if (matchedLicense && matchedLicense.status === 'unlocked') {
      expiryTs = matchedLicense.expiresAtTimestamp;
      if (!expiryTs && matchedLicense.expiresAtISO) {
        expiryTs = new Date(matchedLicense.expiresAtISO).getTime();
      }
      currentPlan = matchedLicense.planNameNepali || (matchedLicense.duration === 'lifetime' ? 'आजीवन' : '१ वर्षको सदस्यता');
    }

    // Check client leads if no service license found
    if (!expiryTs) {
      const leads = getStoredClientLeads();
      const matchedLead = leads.find((l) => {
        if (l.status !== 'PURCHASE_APPROVED') return false;
        const lPhone = (l.mobile || l.whatsapp || '').replace(/\D/g, '').slice(-10);
        return userPhone && lPhone === userPhone;
      }) || leads.find(l => l.status === 'PURCHASE_APPROVED');

      if (matchedLead) {
        if (matchedLead.expiresAtTimestamp) {
          expiryTs = matchedLead.expiresAtTimestamp;
        } else if (matchedLead.expiresAtISO) {
          expiryTs = new Date(matchedLead.expiresAtISO).getTime();
        }
        currentPlan = matchedLead.planNameNepali || '१ वर्षको सदस्यता';
      }
    }

    // Check approved client device license
    if (!expiryTs) {
      const appLic = getApprovedClientLicense();
      if (appLic && appLic.isApproved && appLic.expiresAtISO) {
        expiryTs = new Date(appLic.expiresAtISO).getTime();
        currentPlan = appLic.planName || '१ वर्षको सदस्यता';
      }
    }

    if (!expiryTs || isNaN(expiryTs)) {
      setRemainingDays(null);
      setIsExpired(false);
      return;
    }

    const days = calculateRemainingDays(expiryTs);
    const expired = isLicenseExpired(expiryTs);

    setRemainingDays(days);
    setIsExpired(expired);
    setPlanName(currentPlan);

    // Trigger milestone notification check safely (duplicate-safe)
    if (session?.userId || userPhone) {
      processExpiryMilestoneNotification(session?.userId || userPhone, expiryTs, currentPlan);
    }
  };

  useEffect(() => {
    evaluateExpiry();
    const handleSync = () => evaluateExpiry();

    window.addEventListener('service-license-updated', handleSync);
    window.addEventListener('client-leads-updated', handleSync);
    window.addEventListener('software-full-access-updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('service-license-updated', handleSync);
      window.removeEventListener('client-leads-updated', handleSync);
      window.removeEventListener('software-full-access-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [session]);

  // Nothing to display if no expiry date or more than 30 days left
  if (remainingDays === null || (remainingDays > 30 && !isExpired)) {
    return null;
  }

  // If dismissed during this session and not completely expired, hide
  if (isDismissed && !isExpired) {
    return null;
  }

  const warningMessage = getNepaliExpiryWarningMessage(remainingDays, planName);

  return (
    <div
      role="alert"
      className={`relative z-30 transition-all duration-200 shadow-md ${
        isExpired
          ? 'bg-gradient-to-r from-rose-950 via-rose-900 to-red-950 border-b-2 border-rose-600 text-rose-100'
          : 'bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border-b-2 border-amber-500 text-amber-100'
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Left: Warning Icon & Message */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isExpired
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
            }`}
          >
            {isExpired ? (
              <ShieldAlert className="w-4 h-4 animate-pulse" />
            ) : (
              <Clock className="w-4 h-4 animate-spin text-amber-400" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`font-mono font-black text-[10px] uppercase px-2 py-0.5 rounded-md ${
                  isExpired
                    ? 'bg-rose-600 text-white'
                    : 'bg-amber-500 text-stone-950'
                }`}
              >
                {isExpired ? 'म्याद समाप्त (EXPIRED)' : `बाँकी: ${toDevanagariNumerals(remainingDays)} दिन`}
              </span>
              <span className="font-extrabold text-stone-100">
                {isExpired
                  ? 'सफ्टवेयर सदस्यताको म्याद समाप्त भएको छ'
                  : 'सफ्टवेयर सदस्यता नवीकरण सूचना'}
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-0.5 leading-snug truncate sm:whitespace-normal">
              {warningMessage ||
                (isExpired
                  ? 'सफ्टवेयर सेवाहरू सुचारु राख्न कृपया तुरुन्त सदस्यता नवीकरण गर्नुहोस्।'
                  : `तपाईंको सदस्यताको म्याद सकिन अब ${toDevanagariNumerals(remainingDays)} दिन बाँकी छ।`)}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {onOpenRenewal && (
            <button
              type="button"
              onClick={onOpenRenewal}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95 ${
                isExpired
                  ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-rose-950/60'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-amber-950/60'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{isExpired ? 'अहिले नै नवीकरण गर्नुहोस्' : 'म्याद थप / नवीकरण गर्नुहोस्'}</span>
            </button>
          )}

          {!isExpired && (
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 cursor-pointer"
              title="सूचना बन्द गर्नुहोस्"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
