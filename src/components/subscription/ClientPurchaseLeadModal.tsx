import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ShieldCheck,
  Lock,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Copy,
  Check,
  Smartphone,
  Monitor,
  Zap,
  Crown
} from 'lucide-react';
import {
  start24HourTrial,
  submitPurchaseApplication,
  is24HourTrialActive,
  isDeviceTrialExpired,
  getTrialRemainingSeconds,
  isClientPurchaseApproved
} from '../../db/clientLeadStore';
import { SOFTWARE_SUPPORT_CONTACT, PAYMENT_RECIPIENT_FULL_ID } from '../../db/subscriptionStore';

interface ClientPurchaseLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
  targetFeatureName?: string;
  initialMode?: 'trial_or_purchase' | 'purchase_only';
  onNavigateToAdmin?: (tab?: string) => void;
}

export const ClientPurchaseLeadModal: React.FC<ClientPurchaseLeadModalProps> = ({
  isOpen,
  onClose,
  onUnlockSuccess,
  targetFeatureName = 'ज्योतिष / वास्तुशास्त्र',
  initialMode = 'trial_or_purchase',
  onNavigateToAdmin,
}) => {
  // Form fields
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Purchase Sub-state
  const [showPurchasePlans, setShowPurchasePlans] = useState(initialMode === 'purchase_only');
  const [selectedPlanCategory, setSelectedPlanCategory] = useState<'yearly' | 'lifetime'>('yearly');
  const [selectedPlatform, setSelectedPlatform] = useState<'both' | 'desktop' | 'mobile'>('both');
  const [selectedGateway, setSelectedGateway] = useState<'esewa' | 'khalti' | 'bank'>('esewa');
  const [transactionCode, setTransactionCode] = useState('');
  const [copiedEsewa, setCopiedEsewa] = useState(false);

  // Status & Messaging
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check device status
  const trialExpired = isDeviceTrialExpired();
  const trialActive = is24HourTrialActive();
  const remainingTrialSeconds = getTrialRemainingSeconds();

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Validation: all 5 fields required
  const isFormValid =
    fullName.trim().length >= 3 &&
    address.trim().length >= 3 &&
    mobile.trim().length >= 10 &&
    email.trim().includes('@') &&
    whatsapp.trim().length >= 10;

  // Compute pricing
  const planPricing: Record<string, { label: string; price: number; formatted: string }> = {
    'yearly_mobile': { label: '१ वर्ष मोबाइल', price: 2000, formatted: 'रु. २,०००' },
    'yearly_desktop': { label: '१ वर्ष कम्प्युटर', price: 3500, formatted: 'रु. ३,५००' },
    'yearly_both': { label: '१ वर्ष मोबाइल + कम्प्युटर', price: 5000, formatted: 'रु. ५,०००' },
    'lifetime_mobile': { label: 'आजीवन मोबाइल', price: 5000, formatted: 'रु. ५,०००' },
    'lifetime_desktop': { label: 'आजीवन कम्प्युटर', price: 7500, formatted: 'रु. ७,५००' },
    'lifetime_both': { label: 'आजीवन मोबाइल + कम्प्युटर', price: 10000, formatted: 'रु. १०,०००' },
  };

  const currentPlanKey = `${selectedPlanCategory}_${selectedPlatform}` as keyof typeof planPricing;
  const currentPlan = planPricing[currentPlanKey] || planPricing['yearly_both'];

  const handleCopyEsewa = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('9764400533');
      setCopiedEsewa(true);
      setTimeout(() => setCopiedEsewa(false), 2000);
    }
  };

  // Handler: Start 24-Hour Free Trial
  const handleActivateTrial = () => {
    setErrorMsg(null);
    if (!isFormValid) {
      setErrorMsg('कृपया नाम, ठेगाना, मोबाइल नं., इमेल र ह्वाट्सएप नम्बर सबै अनिवार्य रूपमा भर्नुहोस्।');
      return;
    }

    if (trialExpired) {
      setErrorMsg('यस डिभाइसमा २४ घण्टे परीक्षण समाप्त भइसकेको छ। कृपया सफ्टवेयर खरिद गरी सुपरएडमिनबाट स्वीकृत गराउनुहोस्।');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = start24HourTrial({
        fullName: fullName.trim(),
        address: address.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim(),
      });
      setIsSubmitting(false);

      if (res.success) {
        setSuccessMsg(res.messageNepali);
        setTimeout(() => {
          onUnlockSuccess();
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.messageNepali);
      }
    }, 400);
  };

  // Handler: Submit Purchase Application
  const handleSubmitPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isFormValid) {
      setErrorMsg('कृपया नाम, ठेगाना, मोबाइल नं., इमेल र ह्वाट्सएप नम्बर सबै अनिवार्य रूपमा भर्नुहोस्।');
      return;
    }

    if (!transactionCode.trim()) {
      setErrorMsg('कृपया रकम भुक्तानी पश्चात eSewa / Khalti / Bank को कारोबार नम्बर (Transaction ID) उल्लेख गर्नुहोस्।');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = submitPurchaseApplication({
        fullName: fullName.trim(),
        address: address.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim(),
        planId: currentPlanKey as any,
        planNameNepali: currentPlan.label,
        planAmountNPR: currentPlan.price,
        paymentMethod: selectedGateway,
        transactionId: transactionCode.trim(),
      });
      setIsSubmitting(false);

      if (res.success) {
        setSuccessMsg(res.messageNepali);
      } else {
        setErrorMsg(res.messageNepali);
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-stone-900 border-2 border-amber-500/80 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto text-stone-900 dark:text-stone-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7A1C1C] via-[#9B2C2C] to-[#5C1515] text-white p-4 sm:p-5 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg font-serif">
                  सफ्टवेयर खरिद तथा परीक्षण फारम
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/50 text-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  One Year / Lifetime
                </span>
              </div>
              <p className="text-xs text-amber-200/90 mt-0.5">
                {targetFeatureName} सुविधाहरू खुला गर्न विवरण दर्ता गर्नुहोस्
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Trial Status Notice if active or expired */}
          {trialActive && (
            <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                तपाईंको २४ घण्टे परीक्षण सक्रिय छ (बाँकी समय: करिब {Math.floor(remainingTrialSeconds / 3600)} घण्टा)।
              </span>
            </div>
          )}

          {trialExpired && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">यस डिभाइसमा २४ घण्टे निःशुल्क परीक्षण समाप्त भएको छ।</strong>
                <span>
                  सफ्टवेयरका सम्पूर्ण विकल्पहरू सुचारु गर्न कृपया तलको खरिद फारम भरी सुपरएडमिनबाट स्वीकृत गराउनुहोस्।
                </span>
              </div>
            </div>
          )}

          {/* Success Message Banner */}
          {successMsg && (
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl flex items-start gap-3 text-xs text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-sm">आवेदन दर्ता भयो!</strong>
                <p className="mt-1 leading-relaxed">{successMsg}</p>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  {onNavigateToAdmin && (
                    <button
                      type="button"
                      onClick={() => onNavigateToAdmin('client_approvals')}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                    >
                      <Crown className="w-4 h-4 text-stone-950 fill-current" />
                      <span>👑 सुपरएडमिन कक्षमा गइ स्वीकृत गर्नुहोस् (Approve)</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    बन्द गर्नुहोस्
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-2xl flex items-center gap-2 text-xs text-rose-800 dark:text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!successMsg && (
            <>
              {/* १. अनिवार्य ग्राहक फारम */}
              <div className="space-y-3 bg-stone-50 dark:bg-stone-800/60 p-4 rounded-2xl border border-stone-200 dark:border-stone-700">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-black">१</span>
                    <span>ग्राहकको व्यक्तिगत तथा सम्पर्क विवरण (अनिवार्य)</span>
                  </h4>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                    सबै ५ वटै विवरण अनिवार्य
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  {/* Name */}
                  <div>
                    <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                      पूरा नाम (Full Name) *
                    </label>
                    <input
                      type="text"
                      placeholder="उदा: पं. रामप्रसाद शर्मा"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                      ठेगाना (Address) *
                    </label>
                    <input
                      type="text"
                      placeholder="उदा: काठमाडौँ-१०, बानेश्वर"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Mobile No */}
                  <div>
                    <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                      मोबाइल नम्बर (Mobile No.) *
                    </label>
                    <input
                      type="tel"
                      placeholder="९८xxxxxxxx / ९७xxxxxxxx"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* WhatsApp No */}
                  <div>
                    <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                      ह्वाट्सएप नम्बर (WhatsApp No.) *
                    </label>
                    <input
                      type="tel"
                      placeholder="९८xxxxxxxx / ९७xxxxxxxx"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Email ID */}
                  <div className="sm:col-span-2">
                    <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                      इमेल ठेगाना (Email ID) *
                    </label>
                    <input
                      type="email"
                      placeholder="example@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* २. कार्य छनोट: २४ घण्टे ट्रायल वा खरिद */}
              {!showPurchasePlans ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-black">२</span>
                      <span>सुविधा छनोट गर्नुहोस्</span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* २४ घण्टे ट्रायल बटन */}
                    <button
                      type="button"
                      disabled={!isFormValid || trialExpired || isSubmitting}
                      onClick={handleActivateTrial}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                        trialExpired
                          ? 'opacity-50 border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800/40 cursor-not-allowed'
                          : isFormValid
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40 cursor-pointer shadow-sm active:scale-98'
                          : 'opacity-60 border-stone-300 dark:border-stone-700 cursor-not-allowed'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                            <Zap className="w-4 h-4 text-emerald-600" />
                            २४ घण्टे निःशुल्क ट्रायल
                          </span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 font-black px-2 py-0.5 rounded-full">
                            निःशुल्क
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                          २४ घण्टाका लागि कुण्डली, फलादेश तथा वास्तुका सम्पूर्ण विकल्पहरू परीक्षण गर्नुहोस्।
                        </p>
                      </div>
                      <div className="mt-4 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/60 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        <span>२४ घण्टाको ट्रायल सुरु गर्नुहोस्</span>
                        <span>→</span>
                      </div>
                    </button>

                    {/* खरिद गर्ने बटन */}
                    <button
                      type="button"
                      onClick={() => setShowPurchasePlans(true)}
                      className="p-4 rounded-2xl border-2 border-amber-500 bg-gradient-to-br from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-left transition-all flex flex-col justify-between cursor-pointer shadow-sm active:scale-98"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                            <Crown className="w-4 h-4 text-amber-600 animate-bounce" />
                            सफ्टवेयर खरिद (१ वर्ष / आजीवन)
                          </span>
                          <span className="text-[10px] bg-amber-500 text-stone-950 font-black px-2 py-0.5 rounded-full">
                            One Year •
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                          सुपरएडमिनबाट आधिकारिक लाइसेन्स स्वीकृत गराई सम्पूर्ण प्रिमियम सुविधाहरू अनलक गर्नुहोस्।
                        </p>
                      </div>
                      <div className="mt-4 pt-2 border-t border-amber-200/60 dark:border-stone-700 flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300">
                        <span>योजना छनोट तथा भुक्तानी</span>
                        <span>→</span>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                /* खरिद विवरण तथा eSewa भुक्तानी मोड */
                <form onSubmit={handleSubmitPurchase} className="space-y-4 pt-1">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-2">
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-black">२</span>
                      <span>खरिद योजना र भुक्तानी विवरण</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowPurchasePlans(false)}
                      className="text-xs text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      ← पछाडि फर्कनुहोस्
                    </button>
                  </div>

                  {/* Plan Category: 1 Year vs Lifetime */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setSelectedPlanCategory('yearly')}
                      className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        selectedPlanCategory === 'yearly'
                          ? 'bg-[#7A1C1C] text-white border-[#5C1515] shadow-xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      <span>• One Year (१ वर्षको योजना)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPlanCategory('lifetime')}
                      className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        selectedPlanCategory === 'lifetime'
                          ? 'bg-[#7A1C1C] text-white border-[#5C1515] shadow-xs'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      <span>आजीवन (Life Time योजना)</span>
                    </button>
                  </div>

                  {/* Platform Choice */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {(['both', 'desktop', 'mobile'] as const).map((plat) => {
                      const key = `${selectedPlanCategory}_${plat}` as keyof typeof planPricing;
                      const item = planPricing[key];
                      const isSelected = selectedPlatform === plat;
                      return (
                        <button
                          key={plat}
                          type="button"
                          onClick={() => setSelectedPlatform(plat)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50/80 dark:bg-stone-800 text-amber-950 dark:text-amber-200 shadow-2xs'
                              : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          <div className="font-bold">{plat === 'both' ? 'मोबाइल + कम्प्युटर' : plat === 'desktop' ? 'कम्प्युटर मात्र' : 'मोबाइल मात्र'}</div>
                          <div className="text-amber-700 dark:text-amber-400 font-extrabold mt-1">{item.formatted}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Payment Receiver Box */}
                  <div className="p-3.5 bg-stone-100 dark:bg-stone-800/80 rounded-2xl border border-stone-300 dark:border-stone-700 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-700 dark:text-stone-300">
                        आधिकारिक भुक्तानी माध्यम : eSewa / Khalti
                      </span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-black text-sm">
                        तिर्नुपर्ने रकम: {currentPlan.formatted}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700">
                      <div>
                        <div className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                          eSewa / Khalti ID: ९७६४४००५३३
                        </div>
                        <div className="text-[11px] text-stone-500">
                          खातावाला: Subash Bhandari (Pnd. Sukadew Saran)
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyEsewa}
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {copiedEsewa ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedEsewa ? 'कपी भयो' : 'नम्बर कपी'}</span>
                      </button>
                    </div>

                    {/* Transaction Code Input */}
                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        eSewa / Khalti कारोबार नम्बर (Transaction / Ref ID) *
                      </label>
                      <input
                        type="text"
                        placeholder="उदा: 7C14A293 वा Ref Code"
                        value={transactionCode}
                        onChange={(e) => setTransactionCode(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!isFormValid || !transactionCode.trim() || isSubmitting}
                    className={`w-full py-3 rounded-2xl font-bold text-sm text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                      isFormValid && transactionCode.trim() && !isSubmitting
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 cursor-pointer active:scale-98'
                        : 'bg-stone-400 dark:bg-stone-700 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isSubmitting ? 'आवेदन दर्ता गरिँदैछ...' : 'खरिद आवेदन पेश गर्नुहोस् (सुपरएडमिन स्वीकृति)'}
                    </span>
                  </button>
                  <p className="text-[11px] text-center text-stone-500 dark:text-stone-400">
                    * आवेदन पेश भएपछि सुपरएडमिनले रकम रुजु गरी तपाईंको सफ्टवेयर सक्रिय (Approve) गरिदिनेछन्।
                  </p>

                  {/* Direct link for Super Admin */}
                  {onNavigateToAdmin && (
                    <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs bg-amber-500/10 p-3 rounded-xl border border-amber-500/30">
                      <span className="text-stone-700 dark:text-stone-300 font-medium text-center sm:text-left">
                        तपाईं नै मुख्य प्रशासक (Superadmin) हुनुहुन्छ?
                      </span>
                      <button
                        type="button"
                        onClick={() => onNavigateToAdmin('client_approvals')}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                      >
                        <Crown className="w-3.5 h-3.5 fill-current" />
                        <span>👑 खरिद स्वीकृति कक्ष (Superadmin)</span>
                      </button>
                    </div>
                  )}
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
