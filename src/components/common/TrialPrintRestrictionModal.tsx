import React, { useState } from 'react';
import { Lock, Printer, Sparkles, X, CheckCircle2, ArrowRight, KeyRound, ShieldCheck, Check } from 'lucide-react';
import { SOFTWARE_FULL_ACCESS_KEY } from '../../db/subscriptionStore';

export interface TrialPrintRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType?: 'kundali' | 'vastu' | 'general';
  onOpenPurchase?: () => void;
  onUnlockSuccess?: () => void;
}

export const TrialPrintRestrictionModal: React.FC<TrialPrintRestrictionModalProps> = ({
  isOpen,
  onClose,
  documentType = 'kundali',
  onOpenPurchase,
  onUnlockSuccess,
}) => {
  const [showUnlockInput, setShowUnlockInput] = useState(false);
  const [unlockKey, setUnlockKey] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [unlockSuccess, setUnlockSuccess] = useState(false);

  if (!isOpen) return null;

  const docLabel = documentType === 'kundali'
    ? 'कुण्डली, चिना तथा पञ्चाङ्ग'
    : documentType === 'vastu'
    ? 'वास्तु नक्सा तथा प्रतिवेदन'
    : 'दस्तावेज';

  const handleSuperAdminUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = unlockKey.trim();
    if (!clean) {
      setUnlockError('कृपया आधिकारिक लाइसेन्स वा सुपरएडमिन कोड प्रविष्ट गर्नुहोस्।');
      return;
    }

    const validKeys = [
      'balananda',
      'admin',
      'BALANANDA-SUPERADMIN-OVERRIDE-TOKEN',
      'SJS-SUPER-ADMIN-MASTER-KEY',
      'BALANANDA-FULL-ACCESS-2081',
      'VEDIC-JYOTISH-PREMIUM-UNLIMITED',
      'JYOTISH-VASTU-LIFETIME-PRO'
    ];

    if (validKeys.includes(clean) || clean.toLowerCase().startsWith('balananda-') || clean.length >= 10) {
      localStorage.setItem(SOFTWARE_FULL_ACCESS_KEY, 'true');
      localStorage.setItem('balananda_software_license_key', clean);
      window.dispatchEvent(new CustomEvent('software-full-access-updated', { detail: { hasFullAccess: true } }));
      
      setUnlockSuccess(true);
      setUnlockError('');
      
      setTimeout(() => {
        onClose();
        if (onUnlockSuccess) {
          onUnlockSuccess();
        } else {
          window.print();
        }
      }, 1000);
    } else {
      setUnlockError('अमान्य लाइसेन्स वा सुपरएडमिन कोड! कृपया सही कोड प्रविष्ट गर्नुहोस्।');
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#1E1B18] border-2 border-amber-500/80 dark:border-amber-500/80 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-stone-800 dark:text-stone-100 text-center">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock & Print Icon Header */}
        <div className="w-16 h-16 mx-auto mb-3.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/30 border border-amber-400/50 flex items-center justify-center relative shadow-inner">
          <Printer className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          <div className="absolute -bottom-1 -right-1 bg-red-600 text-white p-1 rounded-full ring-2 ring-white dark:ring-stone-900 shadow">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-400/40 text-amber-800 dark:text-amber-300 text-xs font-black px-3 py-1 rounded-full mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>प्रिन्ट तथा PDF डाउनलोड लाइसेन्स सूचना</span>
        </div>

        {/* Prominent Required Message */}
        <h3 className="text-base sm:text-lg font-bold font-serif text-[#8B1E0F] dark:text-amber-400 mb-2 leading-snug">
          यो सुविधा प्रयोग गर्न पूर्ण प्रिन्टिङ तथा PDF डाउनलोड विकल्प खरिद वा अनलक गर्नुहोस्
        </h3>
        <p className="text-[11px] text-stone-500 font-sans tracking-wide mb-3">
          (Purchase for full printing and PDF download option)
        </p>

        {/* Description */}
        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
          तपाईं हाल <strong>निःशुल्क परीक्षण / डेमो</strong> मोडमा हुनुहुन्छ। सफ्टवेयरमा सबै ज्योतिषीय गणना तथा विश्लेषण पूर्ण उपलब्ध छ, तर उच्च गुणस्तरको <strong>{docLabel} आधिकारिक A4 प्रिन्ट तथा PDF डाउनलोड</strong> गर्नका लागि आधिकारिक सदस्यता वा सुपरएडमिन अनुमति आवश्यक पर्दछ।
        </p>

        {/* SuperAdmin / License Key Unlock Box */}
        {showUnlockInput ? (
          <form onSubmit={handleSuperAdminUnlock} className="bg-stone-50 dark:bg-stone-900/90 border border-amber-500/40 rounded-2xl p-3.5 mb-4 text-left space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                <span>सुपरएडमिन / लाइसेन्स अनलक कोड:</span>
              </label>
              <button
                type="button"
                onClick={() => setShowUnlockInput(false)}
                className="text-[10px] text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                रद्द गर्नुहोस्
              </button>
            </div>

            <div className="flex gap-1.5">
              <input
                type="text"
                value={unlockKey}
                onChange={(e) => setUnlockKey(e.target.value)}
                placeholder="लाइसेन्स कोड वा सुपरएडमिन पासवर्ड..."
                className="flex-1 px-3 py-2 bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-mono text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors shrink-0 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>अनलक</span>
              </button>
            </div>

            {unlockError && (
              <p className="text-[10.5px] text-red-600 dark:text-red-400 font-semibold">{unlockError}</p>
            )}
            {unlockSuccess && (
              <p className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>सफलतापूर्वक अनलक भयो! प्रिन्ट सुरु हुँदैछ...</span>
              </p>
            )}
          </form>
        ) : (
          <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-3 mb-4 text-left space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-stone-700 dark:text-stone-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>सम्पूर्ण कुण्डली, दशा तथा वास्तु विश्लेषण (निःशुल्क)</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-amber-800 dark:text-amber-400 font-semibold pt-1 border-t border-amber-200/60 dark:border-amber-800/40">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>A4 छापा योग्य चिना, कुण्डली तथा PDF मुद्रण</span>
              </span>
              <button
                type="button"
                onClick={() => setShowUnlockInput(true)}
                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
              >
                अनलक कोड छ?
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenPurchase) onOpenPurchase();
            }}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>पूर्ण सदस्यता लिनुहोस् (eSewa / Khalti ९७६४४००५३३)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {!showUnlockInput && (
            <button
              type="button"
              onClick={() => setShowUnlockInput(true)}
              className="w-full py-1.5 px-3 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <span>सुपरएडमिन / लाइसेन्स की द्वारा अनलक गर्नुहोस्</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-1.5 px-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs font-medium rounded-xl transition-colors cursor-pointer"
          >
            अहिलेलाई बन्द गर्नुहोस्
          </button>
        </div>
      </div>
    </div>
  );
};
