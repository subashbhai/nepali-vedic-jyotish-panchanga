import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldAlert,
  Sparkles,
  Lock,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  X,
  Smartphone,
  PhoneCall,
  Crown,
  Mail,
  MessageCircle,
  CheckCheck
} from 'lucide-react';
import {
  PAYMENT_RECIPIENT_FULL_ID,
  ESEWA_RECIPIENT_NUMBER_EN,
  SOFTWARE_PURCHASE_TIERS,
  SOFTWARE_SUPPORT_CONTACT,
  SoftwarePackageTier,
  activateSoftwareFullAccess
} from '../../db/subscriptionStore';
import { getAssetUrl, handleImageFallback } from '../../utils/assetHelper';

interface SoftwareFullAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  lockedFeatureName?: string;
  onUnlockSuccess: () => void;
}

export const SoftwareFullAccessModal: React.FC<SoftwareFullAccessModalProps> = ({
  isOpen,
  onClose,
  lockedFeatureName = 'ज्योतिष / वास्तुशास्त्र',
  onUnlockSuccess
}) => {
  const [activeCategory, setActiveCategory] = useState<'lifetime' | 'yearly'>('lifetime');
  const [selectedTierId, setSelectedTierId] = useState<string>('lifetime_mobile');
  const [selectedGateway, setSelectedGateway] = useState<'esewa' | 'khalti'>('esewa');
  const [txnCode, setTxnCode] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTiers = SOFTWARE_PURCHASE_TIERS.filter((t) => t.category === activeCategory);
  const selectedTier = SOFTWARE_PURCHASE_TIERS.find((t) => t.id === selectedTierId) || currentTiers[0];

  const handleCategorySwitch = (cat: 'lifetime' | 'yearly') => {
    setActiveCategory(cat);
    const firstInCat = SOFTWARE_PURCHASE_TIERS.find((t) => t.category === cat);
    if (firstInCat) setSelectedTierId(firstInCat.id);
  };

  const handleCopy = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleVerifyAndActivate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!txnCode.trim()) {
      setErrorMessage('कृपया eSewa वा Khalti को कारोबार नम्बर (Transaction / Ref ID) उल्लेख गर्नुहोस्।');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = activateSoftwareFullAccess(
        selectedTier.category,
        txnCode.trim(),
        selectedGateway
      );

      setIsSubmitting(false);
      if (res.success) {
        setSuccessMessage(res.messageNepali);
        setTimeout(() => {
          onUnlockSuccess();
          onClose();
        }, 1200);
      } else {
        setErrorMessage(res.messageNepali);
      }
    }, 600);
  };

  const handleInstantDemoUnlock = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      activateSoftwareFullAccess(selectedTier.category, 'DEMO-INSTANT-ACTIVATE', selectedGateway);
      setIsSubmitting(false);
      setSuccessMessage('परीक्षणको लागि सफ्टवेयरको पूर्ण अधिकार (Full Access) तुरुन्त सक्रिय भयो!');
      setTimeout(() => {
        onUnlockSuccess();
        onClose();
      }, 1000);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 overflow-y-auto backdrop-blur-md bg-stone-950/75 animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-[#1E1B18] text-[#2D241E] dark:text-stone-100 rounded-3xl shadow-2xl border-2 border-amber-400/80 dark:border-amber-600/80 w-full max-w-4xl overflow-hidden relative my-auto max-h-[94vh] flex flex-col"
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#7A1C1C] via-[#9B2C2C] to-[#611212] text-white p-4 sm:p-5 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-stone-200 hover:text-white transition-colors cursor-pointer"
            title="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 pr-8">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white dark:bg-stone-900 p-0.5 border-2 border-amber-300/80 flex items-center justify-center shrink-0 shadow-md overflow-hidden ring-2 ring-amber-400/30">
              <img
                src={getAssetUrl('/logo.png')}
                alt="बालानन्द लोगो"
                className="w-full h-full object-cover rounded-full select-none"
                onError={(e) => {
                  handleImageFallback(e, [
                    getAssetUrl('/logo.png'),
                    getAssetUrl('/assets/logo.png'),
                    getAssetUrl('/balananda-logo.png'),
                  ]);
                }}
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-900 font-bold text-[10px] uppercase tracking-wider mb-1">
                <Lock className="w-3 h-3" />
                <span>सफ्टवेयर खरिद तथा सक्रियता</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>नेपाली वैदिक ज्योतिष तथा वास्तु सफ्टवेयर</span>
              </h2>
              <p className="text-xs text-amber-100/90 mt-0.5">
                साधारण खातामा <span className="underline font-bold text-amber-200">{lockedFeatureName}</span> सुरक्षित छ। पूर्ण अधिकार खरिद गरी सबै मोड्युलहरू अनलक गर्नुहोस्।
              </p>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {/* Lifetime vs Yearly Category Toggle */}
          <div className="flex justify-center">
            <div className="inline-flex p-1 bg-stone-100 dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-inner">
              <button
                type="button"
                onClick={() => handleCategorySwitch('lifetime')}
                className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === 'lifetime'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <span>📱💻 जीवनभर (Lifetime)</span>
                <span className="px-1.5 py-0.2 bg-amber-300 text-stone-900 text-[10px] rounded-full font-black">
                  लोकप्रिय
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleCategorySwitch('yearly')}
                className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === 'yearly'
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
                    : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <span>📅 एक वर्षको सदस्यता (Annual)</span>
              </button>
            </div>
          </div>

          {/* 3 Cards for the Active Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {currentTiers.map((tier) => {
              const isSelected = selectedTierId === tier.id;
              return (
                <div
                  key={tier.id}
                  onClick={() => setSelectedTierId(tier.id)}
                  className={`rounded-2xl border-2 p-3.5 sm:p-4 flex flex-col justify-between transition-all cursor-pointer relative bg-gradient-to-b ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-950/30 ring-2 ring-amber-400/40 shadow-lg'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 hover:border-amber-300 hover:shadow-md'
                  }`}
                >
                  {tier.isBestValue && (
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[9px] shadow-xs">
                      सर्वोत्कृष्ट छनोट
                    </span>
                  )}
                  {tier.isPopular && (
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-amber-600 text-white font-bold text-[9px] shadow-xs">
                      धेरै रुचाइएको
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <span>{tier.labelNepali}</span>
                      </h4>
                    </div>

                    <div className="text-xl sm:text-2xl font-black text-[#7A1C1C] dark:text-amber-400 mt-1 mb-2">
                      {tier.priceFormattedNepali}
                    </div>

                    {/* Features list under each purchase option */}
                    <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-1.5">
                      <div className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                        मुख्य विशेषताहरू:
                      </div>
                      <ul className="space-y-1 text-[11px] text-stone-600 dark:text-stone-300">
                        {tier.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="leading-tight">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTierId(tier.id);
                      }}
                      className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-amber-100'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCheck className="w-4 h-4 text-white" />
                          <span>छानिएको योजना</span>
                        </>
                      ) : (
                        <span>यो योजना छान्नुहोस्</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment Method Selection: eSewa or Khalti */}
          <div className="bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-stone-800 dark:text-stone-200">
                  भुक्तानी माध्यम (eSewa वा Khalti बाट Send Money गर्नुहोस्):
                </label>
                <div className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  छानिएको: <span className="underline">{selectedTier.labelNepali}</span> — <strong className="text-sm">{selectedTier.priceFormattedNepali}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedGateway('esewa')}
                  className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer ${
                    selectedGateway === 'esewa'
                      ? 'border-[#60BB46] bg-[#60BB46]/10 ring-2 ring-[#60BB46]/30'
                      : 'border-stone-200 dark:border-stone-800 hover:border-emerald-300'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-[#60BB46] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    e
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">eSewa (ईसेवा)</div>
                    <div className="text-[11px] text-[#60BB46] font-semibold">{ESEWA_RECIPIENT_NUMBER_EN}</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGateway('khalti')}
                  className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer ${
                    selectedGateway === 'khalti'
                      ? 'border-[#5D2E8E] bg-[#5D2E8E]/10 ring-2 ring-[#5D2E8E]/30'
                      : 'border-stone-200 dark:border-stone-800 hover:border-purple-300'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-[#5D2E8E] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    K
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">Khalti (खल्ती)</div>
                    <div className="text-[11px] text-[#5D2E8E] font-semibold">{ESEWA_RECIPIENT_NUMBER_EN}</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Account Details & Copy */}
            <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10 dark:from-stone-900 dark:to-stone-850 border border-amber-300 dark:border-amber-700/60 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider block">
                  {selectedGateway === 'esewa' ? 'eSewa ID' : 'Khalti ID'} / सम्पर्क नम्बर
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-base sm:text-lg font-black text-stone-900 dark:text-stone-100">
                    {ESEWA_RECIPIENT_NUMBER_EN}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(ESEWA_RECIPIENT_NUMBER_EN)}
                    className="px-2.5 py-1 rounded-lg bg-amber-200 dark:bg-amber-900/60 hover:bg-amber-300 text-stone-900 dark:text-amber-200 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    title="नम्बर कपी गर्नुहोस्"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId ? 'कपी भयो' : 'कपी गर्नुहोस्'}</span>
                  </button>
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                  खातावाला: <strong className="text-stone-800 dark:text-stone-200">Subash Bhandari (Pnd. Sukadew Saran)</strong>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 block">भुक्तानी गर्नुपर्ने रकम</span>
                <span className="text-lg sm:text-xl font-black text-[#7A1C1C] dark:text-amber-400">
                  {selectedTier.priceFormattedNepali}
                </span>
              </div>
            </div>

            {/* Payment Verification Form */}
            <form onSubmit={handleVerifyAndActivate} className="space-y-3 pt-1">
              <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
                भुक्तानी प्रमाणीकरण विवरण प्रविष्ट गर्नुहोस्:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-stone-600 dark:text-stone-400 block mb-1">
                    कारोबार नम्बर (Transaction / Ref ID) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. ESW976440 वा 10293847"
                    value={txnCode}
                    onChange={(e) => setTxnCode(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-stone-600 dark:text-stone-400 block mb-1">
                    तपाईंको फोन नम्बर (वैकल्पिक)
                  </label>
                  <input
                    type="text"
                    placeholder="९८xxxxxxxx"
                    value={payerPhone}
                    onChange={(e) => setPayerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="font-bold">{successMessage}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#7A1C1C] via-[#9B2C2C] to-[#611212] hover:from-[#8B2323] hover:to-[#7A1C1C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    {isSubmitting ? 'प्रमाणित गरिँदैछ...' : 'भुक्तानी प्रमाणित गरी पूर्ण एक्सेस सक्रिय गर्नुहोस्'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleInstantDemoUnlock}
                  disabled={isSubmitting}
                  className="py-3 px-4 rounded-xl bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-800/60 text-amber-900 dark:text-amber-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-amber-300 dark:border-amber-700 transition-all cursor-pointer"
                  title="परीक्षणको लागि तत्काल पूर्ण अधिकार खोल्नुहोस्"
                >
                  <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>तत्काल डेमो अनलक</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modal Footer with exact required Contact and WhatsApp info */}
        <div className="p-3.5 bg-stone-100 dark:bg-stone-900/90 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 sm:px-6 shrink-0 text-xs">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-stone-700 dark:text-stone-300">
            <a
              href={SOFTWARE_SUPPORT_CONTACT.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
            >
              <MessageCircle className="w-4 h-4" />
              <span>📞 सम्पर्क / WhatsApp: <strong>{SOFTWARE_SUPPORT_CONTACT.phone}</strong></span>
            </a>

            <a
              href={SOFTWARE_SUPPORT_CONTACT.emailMailto}
              className="inline-flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-medium hover:underline"
            >
              <Mail className="w-4 h-4" />
              <span>📧 इमेल: <strong>{SOFTWARE_SUPPORT_CONTACT.email}</strong></span>
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white font-semibold cursor-pointer underline self-end sm:self-auto"
          >
            पछि गर्छु (रद्द)
          </button>
        </div>
      </motion.div>
    </div>
  );
};

