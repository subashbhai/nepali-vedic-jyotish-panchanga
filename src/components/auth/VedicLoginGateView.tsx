import React from 'react';
import { motion } from 'motion/react';
import {
  LogIn,
  UserPlus,
  Lock,
  Sparkles,
  ShoppingBag,
  Users,
  HeartHandshake,
  Compass,
  FileText,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  Sun,
  Flame,
  Star
} from 'lucide-react';
import { RBACSession, authenticateRBACUser } from '../../db/rbacStore';

interface VedicLoginGateViewProps {
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
  onLoginSuccess: (session: RBACSession) => void;
}

export const VedicLoginGateView: React.FC<VedicLoginGateViewProps> = ({
  onOpenSignIn,
  onOpenSignUp,
  onLoginSuccess
}) => {
  // Quick demo login handler
  const handleQuickCustomerLogin = () => {
    const res = authenticateRBACUser('9800000000', 'Yajaman#2081', 'CUSTOMER');
    if (res.success && res.session) {
      onLoginSuccess(res.session);
    }
  };

  const handleQuickAdminLogin = () => {
    const res = authenticateRBACUser('admin', 'sukadev#12', 'SUPER_ADMIN');
    if (res.success && res.session) {
      onLoginSuccess(res.session);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-8 sm:py-12 px-4 max-w-5xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full bg-white/95 dark:bg-[#201D1A]/95 rounded-3xl shadow-xl border-2 border-amber-300/80 dark:border-amber-700/60 overflow-hidden backdrop-blur-md"
      >
        {/* Sacred Decorative Banner */}
        <div className="bg-gradient-to-r from-[#7A1C1C] via-[#9B2C2C] to-[#631212] text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
            <Sun className="w-96 h-96 animate-spin-slow" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-white dark:bg-stone-800 p-1 shadow-2xl ring-4 ring-amber-400/80 overflow-hidden">
              <img src="/logo.png" alt="बालानन्द लोगो" className="w-full h-full object-cover rounded-full select-none" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-stone-900 font-bold text-xs shadow-md">
              <Lock className="w-3.5 h-3.5" />
              <span>प्रवेश द्वार • लगइन आवश्यक</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              बालानन्द वैदिक ज्योतिष, वास्तु तथा कर्मकाण्ड
            </h1>

            <p className="text-amber-100/90 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
              सफ्टवेयरका सम्पूर्ण मेनूहरू तथा वैदिक सेवाहरू प्रयोग गर्न कृपया पहिले आफ्नो खातामा साइन इन / लगइन गर्नुहोस्।
            </p>
          </div>
        </div>

        {/* Core Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Main Action Buttons */}
          <div className="max-w-md mx-auto space-y-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenSignIn}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#7A1C1C] via-[#9B2C2C] to-[#7A1C1C] hover:from-[#8B2323] hover:to-[#6E1818] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              <LogIn className="w-5 h-5 text-amber-300" />
              <span>साइन इन / लगइन गर्नुहोस्</span>
              <ArrowRight className="w-4 h-4 ml-1 opacity-80" />
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenSignUp}
              className="w-full py-3 px-6 rounded-2xl bg-amber-100 dark:bg-stone-800 hover:bg-amber-200 dark:hover:bg-stone-700 text-amber-900 dark:text-amber-200 font-bold text-sm flex items-center justify-center gap-2 border border-amber-300 dark:border-stone-600 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>नयाँ खाता दर्ता गर्नुहोस् (निःशुल्क साइन अप)</span>
            </motion.button>
          </div>

          {/* User Access Tiers Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* 1. Normal User Card */}
            <div className="bg-amber-50/60 dark:bg-stone-900/60 border border-amber-200 dark:border-stone-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                        साधारण यजमान (ग्राहक)
                      </h3>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400">
                        निःशुल्क पहुँच
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                    ३ मेनू खुला
                  </span>
                </div>

                <div className="space-y-2 text-xs text-stone-700 dark:text-stone-300 pt-1">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>यजमान सेवा:</strong> दैनिक संकल्प, पूजा-पाठ, पुरोहित बुकिङ</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>वैदिक पसल:</strong> रुद्राक्ष, शालिग्राम, यन्त्र, पूजा सामग्री</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>विवाह:</strong> विवाह मिलान, बायोडाटा तथा लग्न मुहूर्त</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-amber-200/60 dark:border-stone-800 mt-4">
                <button
                  type="button"
                  onClick={handleQuickCustomerLogin}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-stone-800 hover:bg-amber-100 text-stone-800 dark:text-stone-200 font-bold text-xs border border-stone-300 dark:border-stone-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>यजमान (ग्राहक) द्रुत प्रवेश</span>
                </button>
              </div>
            </div>

            {/* 2. Full Software Access Card */}
            <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-600/10 dark:from-stone-900 dark:to-stone-850 border-2 border-amber-400 dark:border-amber-600/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#7A1C1C] text-white flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#7A1C1C] dark:text-amber-300">
                        ज्योतिषी / पूर्ण सफ्टवेयर अधिकार
                      </h3>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400">
                        व्यावसायिक ज्योतिषी तथा संस्थागत लाइसेन्स
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-2xs">
                    सम्पूर्ण मेनू खुला
                  </span>
                </div>

                <div className="space-y-2 text-xs text-stone-700 dark:text-stone-300 pt-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>कुण्डली (D1, D9, D60) र पारिवारिक PDF प्रिन्टिङ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>दैनिक पञ्चाङ्ग, ग्रह स्पष्ट, दशा र गोचर फलित</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>३६०° वास्तु कम्पास, नेमा, केपी, अङ्क र प्रश्न ज्योतिष</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-amber-200/60 dark:border-stone-800 mt-4">
                <button
                  type="button"
                  onClick={handleQuickAdminLogin}
                  className="w-full py-2 px-3 rounded-xl bg-[#7A1C1C] hover:bg-[#8B2323] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>ज्योतिषी (पूर्ण अधिकार) द्रुत प्रवेश</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info banner */}
        <div className="p-3 bg-amber-50/70 dark:bg-stone-900 border-t border-amber-200 dark:border-stone-800 text-center text-[11px] text-stone-500 dark:text-stone-400">
          सफ्टवेयर पूर्ण खरिद सम्बन्धी जानकारी वा सहायता: <strong>+९७७-९७६४४००५३३ (eSewa / Khalti)</strong>
        </div>
      </motion.div>
    </div>
  );
};
