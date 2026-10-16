import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Sparkles,
  Compass,
  CheckCircle2,
  Phone,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  Send,
  X,
  AlertCircle,
  Clock,
  Crown
} from 'lucide-react';
import { LockableServiceKey, ServiceLicenseDuration } from '../../types/serviceLicenseTypes';
import { submitServicePurchaseRequest } from '../../db/serviceLicenseStore';
import { RBACSession } from '../../db/rbacStore';
import { convertADToBS } from '../../utils/nepaliCalendar';

interface ServicePurchaseLockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceKey: LockableServiceKey;
  rbacSession?: RBACSession | null;
  onOpenAuthModal?: () => void;
}

export const ServicePurchaseLockedModal: React.FC<ServicePurchaseLockedModalProps> = ({
  isOpen,
  onClose,
  serviceKey,
  rbacSession,
  onOpenAuthModal
}) => {
  const [activeTab, setActiveTab] = useState<'purchase' | 'contact'>('purchase');
  const [fullName, setFullName] = useState(rbacSession?.fullName || '');
  const [phone, setPhone] = useState(rbacSession?.phone || rbacSession?.username || '');
  const [email, setEmail] = useState('');
  const [duration, setDuration] = useState<ServiceLicenseDuration>('1_year');
  const [paymentMethod, setPaymentMethod] = useState<'esewa' | 'khalti' | 'bank' | 'cash'>('esewa');
  const [userMessage, setUserMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isJyotish = serviceKey === 'jyotish';
  const serviceTitle = isJyotish ? 'ज्योतिष सेवा (Jyotish Sewa)' : 'वास्तु सेवा (Vastu Sewa)';
  const serviceSubTitle = isJyotish
    ? 'सम्पूर्ण जन्मकुण्डली, फलादेश, विंशोत्तरी दशा, गोचर, वर्षफल तथा पत्रिका प्रिन्ट'
    : '३६०° कम्पास, ८१ पद मण्डल, भूमि परीक्षण, पञ्चतत्त्व सन्तुलन तथा संरचना अडिट';

  const planAmount = duration === 'lifetime' ? 15000 : duration === '5_years' ? 12000 : 3500;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage('कृपया आफ्नो पूरा नाम लेख्नुहोस्।');
      return;
    }
    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setErrorMessage('कृपया १० अंकको मान्य मोबाइल नम्बर लेख्नुहोस्।');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    let todayBS = '२०८१';
    try {
      const res = convertADToBS(new Date().toISOString().split('T')[0]);
      todayBS = typeof res === 'string' ? res : (res as any).formattedBS || '२०८१';
    } catch {}

    const result = await submitServicePurchaseRequest({
      userId: rbacSession?.userId,
      username: rbacSession?.username,
      fullName: fullName.trim(),
      phone: cleanDigits,
      email: email.trim(),
      serviceKey,
      planDuration: duration,
      amountNPR: planAmount,
      paymentMethod,
      userMessage: userMessage.trim(),
      createdAtBS: todayBS
    });

    setIsSubmitting(false);

    if (result.success) {
      setIsSubmittedSuccess(true);
      if (result.request?.id) {
        setSubmittedRequestId(result.request.id);
      }
    } else {
      setErrorMessage(result.message);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `नमस्ते Superadmin ज्यू, म बालानन्द सफ्टवेयरको "${serviceTitle}" लाइसेन्स खरिद/सक्रिय गराउन चाहन्छु।\n\nनाम: ${fullName || 'सेवाग्राही'}\nमोबाइल: ${phone || 'N/A'}\nयोजना: ${duration === 'lifetime' ? 'आजीवन (Lifetime)' : '१ वर्ष'}`
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white dark:bg-stone-900 w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-amber-400/80 dark:border-stone-700 overflow-hidden z-10 my-auto text-stone-900 dark:text-stone-100"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#7A1C1C] via-[#9B2C2C] to-[#5C1515] p-5 sm:p-6 text-white relative">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="बन्द गर्नुहोस्"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 shadow-lg font-bold">
                <Lock className="w-6 h-6 text-[#7A1C1C]" />
              </div>
              <div className="min-w-0 pr-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold mb-1 border border-amber-400/30">
                  <span>🔒 हालको स्थिति: लक गरिएको (Locked)</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold font-serif leading-tight">
                  यो सेवा प्रयोग गर्न सफ्टवेयर खरिद गर्नुहोस्
                </h2>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto">
            {/* Service Identity Banner */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0 text-amber-700 dark:text-amber-400">
                {isJyotish ? <Sparkles className="w-5 h-5" /> : <Compass className="w-5 h-5" />}
              </div>
              <div className="text-xs sm:text-sm">
                <div className="font-bold text-amber-900 dark:text-amber-300 font-serif text-sm sm:text-base">
                  {serviceTitle}
                </div>
                <div className="text-stone-600 dark:text-stone-400 text-[11px] sm:text-xs mt-0.5">
                  {serviceSubTitle}
                </div>
              </div>
            </div>

            {/* Exact Required Message */}
            <div className="text-xs sm:text-sm leading-relaxed text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800/60 p-3.5 rounded-xl border border-stone-200 dark:border-stone-700">
              <p>
                <strong>तपाईंले खोल्न खोज्नुभएको सेवा हाल तपाईंको खातामा सक्रिय छैन।</strong> यो सेवा प्रयोग गर्न सफ्टवेयरको लाइसेन्स खरिद गर्नुहोस् वा आफ्नो लाइसेन्स सक्रिय गराउन Superadmin सँग सम्पर्क गर्नुहोस्।
              </p>
            </div>

            {/* Unauthenticated Login Alert */}
            {!rbacSession && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between text-xs text-blue-900 dark:text-blue-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>पहिले नै लाइसेन्स खरिद गरिसक्नुभएको छ भने लगइन गर्नुहोस्:</span>
                </div>
                {onOpenAuthModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuthModal();
                    }}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-xs"
                  >
                    लगइन गर्नुहोस्
                  </button>
                )}
              </div>
            )}

            {/* Success State */}
            {isSubmittedSuccess ? (
              <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-emerald-900 dark:text-emerald-200">
                  खरिद आवेदन सफलतापूर्वक प्राप्त भयो!
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                  तपाईंको आवेदन <strong>प्रतीक्षारत (Pending Approval)</strong> अवस्थामा छ। सुपरएडमिनले तपाईंको विवरण समीक्षा गरी लाइसेन्स सक्रिय गर्नेबित्तिकै यो सेवा खुल्नेछ।
                </p>
                {submittedRequestId && (
                  <div className="inline-block text-[11px] font-mono px-3 py-1 bg-white dark:bg-stone-800 rounded-lg border border-emerald-300 dark:border-emerald-700 text-stone-700 dark:text-stone-300">
                    आवेदन आईडी: {submittedRequestId}
                  </div>
                )}
                <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                  <a
                    href={`https://wa.me/9779841755199?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp मा तुरुन्त जानकारी दिनुहोस्</span>
                  </a>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-stone-200 hover:bg-stone-300 dark:bg-stone-700 dark:hover:bg-stone-600 font-bold rounded-xl text-xs"
                  >
                    बन्द गर्नुहोस्
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex border-b border-stone-200 dark:border-stone-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('purchase')}
                    className={`flex-1 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'purchase'
                        ? 'border-[#7A1C1C] text-[#7A1C1C] dark:text-amber-400 dark:border-amber-400'
                        : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>खरिद आवेदन (Purchase Form)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('contact')}
                    className={`flex-1 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'contact'
                        ? 'border-[#7A1C1C] text-[#7A1C1C] dark:text-amber-400 dark:border-amber-400'
                        : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    <span>सम्पर्क गर्नुहोस् (Contact Superadmin)</span>
                  </button>
                </div>

                {activeTab === 'purchase' ? (
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    {errorMessage && (
                      <div className="p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Plan Duration Selector */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                        लाइसेन्स अवधि छनोट (Plan Duration):
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div
                          onClick={() => setDuration('1_year')}
                          className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                            duration === '1_year'
                              ? 'border-[#7A1C1C] bg-[#7A1C1C]/5 dark:border-amber-400 dark:bg-amber-400/10'
                              : 'border-stone-200 dark:border-stone-700 hover:border-stone-300'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-xs">१ वर्ष (1 Year)</div>
                            <div className="text-[11px] text-stone-500">वार्षिक नवीकरण</div>
                          </div>
                          <div className="font-extrabold text-sm text-[#7A1C1C] dark:text-amber-400">
                            रु ३,५००
                          </div>
                        </div>

                        <div
                          onClick={() => setDuration('lifetime')}
                          className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between relative ${
                            duration === 'lifetime'
                              ? 'border-[#7A1C1C] bg-[#7A1C1C]/5 dark:border-amber-400 dark:bg-amber-400/10'
                              : 'border-stone-200 dark:border-stone-700 hover:border-stone-300'
                          }`}
                        >
                          <span className="absolute -top-2 right-2 text-[9px] font-bold bg-amber-500 text-stone-950 px-1.5 py-0.2 rounded-full shadow-xs">
                            लोकप्रिय
                          </span>
                          <div>
                            <div className="font-bold text-xs">आजीवन (Lifetime)</div>
                            <div className="text-[11px] text-stone-500">एकमुष्ट भुक्तानी</div>
                          </div>
                          <div className="font-extrabold text-sm text-[#7A1C1C] dark:text-amber-400">
                            रु १५,०००
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                          पूरा नाम *
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="तपाईंको पूरा नाम"
                          className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                          मोबाइल नम्बर *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="९८xxxxxxxx"
                          className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                          इमेल (वैकल्पिक)
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="example@mail.com"
                          className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                          भुक्तानी माध्यम (Payment)
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="esewa">eSewa (ईसेवा)</option>
                          <option value="khalti">Khalti (खल्ती)</option>
                          <option value="bank">बैंक ट्रान्सफर (Bank Deposit)</option>
                          <option value="cash">नगद वा कार्यालयमै (Cash)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1">
                        सुझाव वा सन्देश (वैकल्पिक)
                      </label>
                      <input
                        type="text"
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                        placeholder="थप विवरण वा आवश्यकता भए लेख्नुहोस्..."
                        className="w-full px-3 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-stone-200 dark:border-stone-800">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold rounded-xl text-xs cursor-pointer"
                      >
                        बन्द गर्नुहोस्
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#7A1C1C] to-[#9B2C2C] hover:from-[#8B2323] hover:to-[#AC3333] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>पठाउँदै...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>खरिद आवेदन पठाउनुहोस्</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4 py-2">
                    <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-3">
                      <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        मुख्य प्रशासक (Superadmin) सँग सम्पर्क विवरण:
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                          <Phone className="w-4 h-4 text-[#7A1C1C] dark:text-amber-400 shrink-0" />
                          <span>सम्पर्क नम्बर: <strong>+977 9841755199 / 9851000000</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                          <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>WhatsApp: <strong>+977 9841755199</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <a
                        href={`https://wa.me/9779841755199?text=${whatsappMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm text-center"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>WhatsApp मा सम्पर्क गर्नुहोस्</span>
                      </a>

                      <a
                        href="tel:9841755199"
                        className="flex-1 py-2.5 bg-[#7A1C1C] hover:bg-[#8B2323] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm text-center"
                      >
                        <Phone className="w-4 h-4" />
                        <span>फोन कल गर्नुहोस्</span>
                      </a>
                    </div>

                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold rounded-xl text-xs cursor-pointer"
                      >
                        बन्द गर्नुहोस्
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
