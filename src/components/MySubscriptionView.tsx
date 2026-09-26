import React, { useState, useEffect } from 'react';
import {
  UserSubscriptionAccount,
  PaymentRecord,
  EsewaPaymentRequest,
  getStoredUserSubscription,
  getStoredEsewaRequests,
  evaluateSubscriptionStatus,
  toNepaliDigits
} from '../db/subscriptionStore';
import { ReceiptPrintModal } from './ReceiptPrintModal';
import { OrganizationProfile } from '../types/astrology';
import {
  UserCheck,
  CreditCard,
  Calendar,
  Clock,
  ShieldCheck,
  Receipt,
  Download,
  Printer,
  Sparkles,
  ArrowUpRight,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Hourglass
} from 'lucide-react';

interface MySubscriptionViewProps {
  onNavigateToPurchase?: () => void;
  orgProfile?: OrganizationProfile;
}

export const MySubscriptionView: React.FC<MySubscriptionViewProps> = ({
  onNavigateToPurchase,
  orgProfile,
}) => {
  const [userAccount, setUserAccount] = useState<UserSubscriptionAccount>(getStoredUserSubscription());
  const [status, setStatus] = useState(evaluateSubscriptionStatus());
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);
  const [esewaRequests, setEsewaRequests] = useState<EsewaPaymentRequest[]>([]);

  useEffect(() => {
    setUserAccount(getStoredUserSubscription());
    setStatus(evaluateSubscriptionStatus());
    setEsewaRequests(getStoredEsewaRequests());
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-2 sm:px-4 py-4 animate-in fade-in duration-200 font-serif">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/15 text-[#D97706] rounded-2xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
              मेरो सदस्यता खाता (My Subscription)
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              तपाईंको हालको योजना, सदस्यता अवधि, रसिद तथा खरिद इतिहास विवरण
            </p>
          </div>
        </div>

        {onNavigateToPurchase && (
          <button
            onClick={onNavigateToPurchase}
            className="px-4 py-2 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>नयाँ योजना खरिद गर्नुहोस्</span>
          </button>
        )}
      </div>

      {/* Active Subscription Summary Card */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-stone-100 p-6 rounded-3xl shadow-xl border border-stone-700 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-700/80 pb-4">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              हालको सक्रिय सदस्यता
            </span>
            <h2 className="text-2xl font-extrabold text-white">
              {status.planNameNepali}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              status.isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {status.isActive ? '✓ सक्रिय (ACTIVE)' : '✕ समाप्त (EXPIRED)'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-stone-950/60 p-3 rounded-2xl border border-stone-800 space-y-1">
            <span className="text-stone-400 text-[11px] block font-serif">प्रयोगकर्ताको नाम:</span>
            <span className="font-bold text-stone-100">{userAccount.fullName}</span>
          </div>
          <div className="bg-stone-950/60 p-3 rounded-2xl border border-stone-800 space-y-1">
            <span className="text-stone-400 text-[11px] block font-serif">समाप्ति मिति (Expires):</span>
            <span className="font-bold text-amber-300">{status.expiresDateBS || 'आजीवन'}</span>
          </div>
          <div className="bg-stone-950/60 p-3 rounded-2xl border border-stone-800 space-y-1">
            <span className="text-stone-400 text-[11px] block font-serif">बाँकी अवधि:</span>
            <span className="font-bold text-emerald-400">
              {status.isLifetime
                ? 'आजीवन (Unlimited)'
                : status.remainingDays !== null
                ? `${toNepaliDigits(status.remainingDays)} दिन`
                : status.remainingHoursInTrial !== null
                ? `${toNepaliDigits(status.remainingHoursInTrial)} घण्टा`
                : '० दिन'}
            </span>
          </div>
        </div>

        <p className="text-xs text-stone-300 pt-1 border-t border-stone-800">
          ℹ️ {status.formattedMessageNepali}
        </p>
      </div>

      {/* eSewa Pending / History Submissions Section */}
      {esewaRequests.length > 0 && (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
            <h3 className="text-md font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 font-serif">
              <Hourglass className="w-4 h-4 text-emerald-600" />
              <span>eSewa भुक्तानी प्रमाण स्थिति (eSewa Verification Submissions)</span>
            </h3>
            <span className="text-xs text-stone-500 font-mono">
              कुल: {toNepaliDigits(esewaRequests.length)}
            </span>
          </div>

          <div className="space-y-3 font-serif">
            {esewaRequests.map((req) => (
              <div
                key={req.requestId}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                  req.status === 'pending'
                    ? 'bg-amber-500/10 border-amber-500/40 text-stone-900 dark:text-stone-100'
                    : req.status === 'approved'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-stone-900 dark:text-stone-100'
                    : 'bg-red-500/10 border-red-500/40 text-stone-900 dark:text-stone-100'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{req.planNameNepali} ({req.platformNameNepali})</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      req.status === 'pending'
                        ? 'bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100'
                        : req.status === 'approved'
                        ? 'bg-emerald-200 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-100'
                        : 'bg-red-200 dark:bg-red-900/80 text-red-900 dark:text-red-100'
                    }`}>
                      {req.status === 'pending' && '⏳ '}
                      {req.status === 'approved' && '✓ '}
                      {req.status === 'rejected' && '✕ '}
                      {req.statusNepali}
                    </span>
                  </div>

                  <div className="text-stone-600 dark:text-stone-300 font-mono flex flex-wrap gap-[#12px] text-[11px]">
                    <span>कारोबार कोड: <strong className="text-stone-900 dark:text-stone-100">{req.transactionCode}</strong></span>
                    <span>• रकम: <strong>{req.submittedAmountFormattedNepali}</strong></span>
                    <span>• मिति: {req.paymentDateBS}</span>
                  </div>

                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    {req.status === 'pending' && 'ℹ️ तपाईंको eSewa भुक्तानी प्रमाण प्राप्त भएको छ र प्रशासकीय प्रमाणीकरणको क्रममा छ। प्रमाणीकरण बाँकी छ।'}
                    {req.status === 'approved' && '✓ तपाईंको eSewa भुक्तानी प्रमाणीकरण भई सदस्यता सफल रूपमा सक्रिय गरिएको छ।'}
                    {req.status === 'rejected' && '✕ तपाईंको भुक्तानी प्रमाण प्रमाणित हुन सकेन। कृपया विवरण जाँच गरी पुनः प्रयास गर्नुहोस्।'}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-stone-400 block">{req.requestId}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Purchase History Table */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <h3 className="text-md font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#D97706]" />
            <span>खरिद इतिहास तथा भुक्तानी रसिद (Purchase History & Receipts)</span>
          </h3>
          <span className="text-xs text-stone-500 font-mono">
            कुल रेकर्ड: {toNepaliDigits(userAccount.paymentHistory.length)}
          </span>
        </div>

        {userAccount.paymentHistory.length === 0 ? (
          <div className="text-center py-10 space-y-2 text-stone-500 dark:text-stone-400">
            <CreditCard className="w-10 h-10 mx-auto opacity-30 text-[#D97706]" />
            <p className="text-sm">हालसम्म कुनै पनि सशुल्क योजना खरिद गरिएको छैन।</p>
            {onNavigateToPurchase && (
              <button
                onClick={onNavigateToPurchase}
                className="mt-2 text-xs font-bold text-[#D97706] hover:underline"
              >
                योजनाहरू हेर्न यहाँ थिच्नुहोस् ➔
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold border-b border-stone-200 dark:border-stone-700">
                  <th className="p-3">भुक्तानी मिति</th>
                  <th className="p-3">योजना</th>
                  <th className="p-3">भुक्तानी माध्यम</th>
                  <th className="p-3">रकम</th>
                  <th className="p-3">ट्रान्स्याक्सन ID</th>
                  <th className="p-3 text-center">रसिद</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {userAccount.paymentHistory.map((rec) => (
                  <tr key={rec.txnId} className="hover:bg-amber-500/5 transition-colors">
                    <td className="p-3 font-mono font-bold text-stone-800 dark:text-stone-200">
                      {rec.dateBS} ({rec.timeStr})
                    </td>
                    <td className="p-3 font-bold text-[#D97706]">
                      {rec.planNameNepali}
                    </td>
                    <td className="p-3 text-stone-700 dark:text-stone-300">
                      {rec.paymentMethodNepali}
                    </td>
                    <td className="p-3 font-extrabold text-stone-900 dark:text-stone-100">
                      {rec.amountFormattedNepali}
                    </td>
                    <td className="p-3 font-mono text-stone-500">
                      {rec.txnId}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedReceipt(rec)}
                        className="px-3 py-1 bg-amber-500/15 hover:bg-amber-500/30 text-[#D97706] dark:text-amber-300 font-bold rounded-lg text-[11px] transition-all flex items-center gap-1 mx-auto"
                      >
                        <Printer className="w-3 h-3" />
                        <span>रसिद</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Receipt Print Modal */}
      {selectedReceipt && (
        <ReceiptPrintModal
          isOpen={true}
          onClose={() => setSelectedReceipt(null)}
          receipt={selectedReceipt}
          userAccount={userAccount}
          orgProfile={orgProfile}
        />
      )}

    </div>
  );
};
