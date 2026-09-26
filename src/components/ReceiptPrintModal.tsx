import React from 'react';
import { PaymentRecord, UserSubscriptionAccount, toNepaliDigits } from '../db/subscriptionStore';
import { OrganizationProfile } from '../types/astrology';
import { Printer, Download, CheckCircle2, ShieldCheck, X } from 'lucide-react';

interface ReceiptPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt?: PaymentRecord;
  userAccount?: UserSubscriptionAccount;
  orgProfile?: OrganizationProfile;
  order?: any;
}

export const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({
  isOpen,
  onClose,
  receipt: propsReceipt,
  userAccount: propsAccount,
  orgProfile,
  order,
}) => {
  if (!isOpen) return null;

  const receipt: PaymentRecord = propsReceipt || {
    txnId: order?.orderCode || 'TXN-100',
    receiptNo: 'REC-100',
    planId: 'monthly',
    planNameNepali: order?.items?.[0]?.productName || 'वैदिक सामान खरिद',
    platformMode: 'web',
    platformNameNepali: 'वेब',
    basePriceNPR: order?.totalAmountNPR || 1000,
    basePriceFormattedNepali: `रु. ${order?.totalAmountNPR || 1000}`,
    appliedPercent: 100,
    amountNPR: order?.totalAmountNPR || 1000,
    amountFormattedNepali: `रु. ${order?.totalAmountNPR || 1000}`,
    dateAD: new Date().toISOString().split('T')[0],
    dateBS: order?.createdAtBS || '२०८१-०१-०१',
    timeStr: '१०:०० AM',
    paymentMethodNepali: 'eSewa',
    paymentMethodKey: 'esewa',
    status: 'success',
    periodStartBS: order?.createdAtBS || '२०८१-०१-०१',
    periodEndBS: '२०८२-०१-०१',
  };

  const userAccount: UserSubscriptionAccount = propsAccount || {
    userId: order?.userId || 'user_1',
    fullName: order?.deliveryAddress?.fullName || order?.userName || 'यजमान ग्राहक',
    email: 'yajaman@example.com',
    phone: order?.deliveryAddress?.mobile || '९८४१००००००',
    currentPlanId: 'monthly',
    trialStartedAtISO: null,
    trialExpiresAtISO: null,
    subscriptionStartedAtISO: new Date().toISOString(),
    subscriptionExpiresAtISO: null,
    isSuspended: false,
    activePlatformMode: 'web',
    paymentHistory: [receipt],
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-8">
        
        {/* Top Action Bar (Hidden on print) */}
        <div className="bg-stone-100 dark:bg-stone-800 px-6 py-4 flex items-center justify-between border-b border-stone-200 dark:border-stone-700 print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-sm font-serif">नेपाली डिजिटल रसिद (Digital Receipt)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>रसिद छाप्नुहोस् (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-receipt" className="p-8 space-y-6 bg-[#FAF8F5] dark:bg-stone-900 border-4 border-amber-500/20 m-2 rounded-2xl relative">
          
          {/* Header Branding */}
          <div className="text-center border-b border-stone-300 dark:border-stone-800 pb-4">
            <div className="flex items-center justify-center gap-2.5 mb-1">
              <img 
                src={orgProfile?.logoUrl || '/logo.png'} 
                alt="Logo" 
                className="w-11 h-11 object-cover rounded-full border border-amber-400/60 shadow-xs" 
                onError={(e) => {
                  e.currentTarget.src = '/logo.png';
                }}
              />
              <h1 className="text-xl font-extrabold font-serif text-[#D97706] tracking-wide">
                {(orgProfile as any)?.nameNepali || orgProfile?.name || 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा'}
              </h1>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-serif">
              {(orgProfile as any)?.taglineNepali || orgProfile?.tagline || 'नेपालकै सबैभन्दा भरपर्दो वैदिक सेवा'}
            </p>
            <p className="text-[11px] text-stone-500 mt-1 font-mono">
              स्थान: {(orgProfile as any)?.addressNepali || orgProfile?.address || 'काठमाडौँ, नेपाल'} | फोन: {(orgProfile as any)?.phoneNepali || orgProfile?.phone || '९८५१००००००'}
            </p>
          </div>

          {/* Receipt Title & Status Badge */}
          <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
            <div>
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                भुक्तानी रसिद (Payment Receipt)
              </span>
              <span className="text-sm font-bold text-stone-900 dark:text-stone-100 font-mono">
                क्रमाङ्क: {receipt.receiptNo}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>भुक्तानी सफल (PAID)</span>
            </div>
          </div>

          {/* Customer & Transaction Meta */}
          <div className="grid grid-cols-2 gap-4 text-xs border-b border-stone-200 dark:border-stone-800 pb-4">
            <div>
              <span className="text-stone-500 block">ग्राहकको नाम (Customer Name):</span>
              <span className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                {userAccount.fullName || 'श्रद्धेय प्रयोगकर्ता'}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block">सम्पर्क / इमेल (Contact):</span>
              <span className="font-medium text-stone-800 dark:text-stone-200 font-mono">
                {userAccount.phone || userAccount.email}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block">भुक्तानी मिति (विक्रम संवत्):</span>
              <span className="font-bold text-stone-800 dark:text-stone-200 font-mono">
                {receipt.dateBS} ({receipt.timeStr})
              </span>
            </div>
            <div>
              <span className="text-stone-500 block">भुक्तानी माध्यम (Method):</span>
              <span className="font-bold text-amber-800 dark:text-amber-300">
                {receipt.paymentMethodNepali}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-stone-500 block">ट्रान्स्याक्सन आईडी (Transaction ID):</span>
              <span className="font-mono font-extrabold text-stone-900 dark:text-stone-100 bg-stone-200 dark:bg-stone-800 px-2 py-0.5 rounded">
                {receipt.txnId}
              </span>
            </div>
          </div>

          {/* Plan & Pricing Breakdown Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              सदस्यता तथा मूल्य विवरण (Subscription Breakdown)
            </h3>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-200 font-bold border-b border-amber-300 dark:border-stone-700">
                  <th className="p-2 text-left">विवरण (Field)</th>
                  <th className="p-2 text-right">मापन/मान (Value)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                <tr>
                  <td className="p-2 font-medium text-stone-600 dark:text-stone-400">खरिद गरिएको प्लेटफर्म:</td>
                  <td className="p-2 text-right font-bold text-amber-800 dark:text-amber-300">
                    {receipt.platformNameNepali || 'वेब संस्करण'}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-stone-600 dark:text-stone-400">चयन गरिएको योजना:</td>
                  <td className="p-2 text-right font-bold text-stone-900 dark:text-stone-100">
                    {receipt.planNameNepali}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-stone-600 dark:text-stone-400">मूल मूल्य (कम्प्युटर १००%):</td>
                  <td className="p-2 text-right font-mono text-stone-800 dark:text-stone-200">
                    {receipt.basePriceFormattedNepali || receipt.amountFormattedNepali}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-stone-600 dark:text-stone-400">लागू प्रतिशत छुट दर:</td>
                  <td className="p-2 text-right font-bold text-emerald-700 dark:text-emerald-400">
                    {toNepaliDigits(receipt.appliedPercent || 100)}%
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-stone-600 dark:text-stone-400">अन्तिम भुक्तानी रकम:</td>
                  <td className="p-2 text-right font-extrabold text-[#D97706] text-sm">
                    {receipt.amountFormattedNepali}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-medium text-stone-600 dark:text-stone-400">सदस्यता अवधि:</td>
                  <td className="p-2 text-right font-bold text-stone-800 dark:text-stone-200">
                    {receipt.periodStartBS} देखि {receipt.periodEndBS} सम्म
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Amount Callout */}
          <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 flex items-center justify-between">
            <span className="text-sm font-bold text-stone-800 dark:text-stone-200 font-serif">
              भुक्तानी गरिएको जम्मा रकम (Total Paid):
            </span>
            <span className="text-xl font-extrabold font-serif text-[#D97706]">
              {receipt.amountFormattedNepali}
            </span>
          </div>

          {/* Footer Terms & Stamp */}
          <div className="pt-4 border-t border-dashed border-stone-300 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 space-y-1 text-center font-serif">
            <p>✓ यो कम्प्युटरद्वारा उत्पन्न आधिकारिक डिजिटल भुक्तानी रसिद हो।</p>
            <p>✓ एउटै खाताबाट मोबाइल, वेब र कम्प्युटर तीनै संस्करणमा समान पहुँच उपलब्ध रहनेछ।</p>
            <div className="pt-3 flex justify-between items-end text-[10px]">
              <span>बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा प्रणाली</span>
              <span className="font-bold text-[#D97706]">प्रमाणित डिजिटल रसिद मोहर 💮</span>
            </div>
          </div>

        </div>

        {/* Bottom Actions for Mobile */}
        <div className="p-4 bg-stone-100 dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 flex justify-end gap-2 print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold hover:bg-stone-300 transition-colors"
          >
            बन्द गर्नुहोस् (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
