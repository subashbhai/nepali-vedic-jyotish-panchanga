import React from 'react';
import { motion } from 'motion/react';
import {
  LogIn,
  UserPlus,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Sun,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { getAssetUrl, handleImageFallback } from '../../utils/assetHelper';
import { RBACSession } from '../../db/rbacStore';

interface VedicLoginGateViewProps {
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
  onLoginSuccess?: (session: RBACSession) => void;
}

/**
 * Phase 3: New Clean, Mobile-Friendly First Screen / Landing Screen
 * Displays ONLY the essential actions:
 * 1. Login (साइन इन / लगइन)
 * 2. सदस्यता लिनुहोस् (नयाँ खाता दर्ता)
 */
export const VedicLoginGateView: React.FC<VedicLoginGateViewProps> = ({
  onOpenSignIn,
  onOpenSignUp
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-6 sm:py-10 px-4 max-w-4xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full bg-white dark:bg-[#1E1B18] rounded-3xl shadow-2xl border-2 border-amber-300/80 dark:border-amber-700/60 overflow-hidden backdrop-blur-md"
      >
        {/* Sacred Branding Banner */}
        <div className="bg-gradient-to-r from-[#7A1C1C] via-[#9B2C2C] to-[#611212] text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
            <Sun className="w-80 h-80 animate-spin-slow" />
          </div>

          <div className="relative z-10 max-w-xl mx-auto space-y-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-white dark:bg-stone-900 p-1 shadow-2xl ring-4 ring-amber-400/80 overflow-hidden">
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

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-stone-950 font-bold text-xs shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>नेपाली वैदिक ज्योतिष, वास्तु तथा कर्मकाण्ड</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              बालानन्द ज्योतिष सेवा
            </h1>

            <p className="text-amber-100/90 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
              पञ्चाङ्ग, कुण्डली, वास्तु, कर्मकाण्ड तथा सम्पूर्ण वैदिक सेवाहरू प्रयोग गर्न कृपया आफ्नो खातामा प्रवेश गर्नुहोस् वा नयाँ सदस्यता लिनुहोस्।
            </p>
          </div>
        </div>

        {/* Phase 3 Core Action Area: Exactly 2 Essential Actions */}
        <div className="p-6 sm:p-10 max-w-md mx-auto space-y-4">
          {/* Action 1: Login */}
          <button
            type="button"
            onClick={onOpenSignIn}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#7A1C1C] via-[#9B2C2C] to-[#7A1C1C] hover:from-[#8B2323] hover:to-[#6E1818] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-98"
          >
            <LogIn className="w-5 h-5 text-amber-300" />
            <span>साइन इन / Login</span>
            <ArrowRight className="w-4 h-4 ml-1 opacity-80" />
          </button>

          {/* Action 2: सदस्यता लिनुहोस् */}
          <button
            type="button"
            onClick={onOpenSignUp}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
          >
            <UserPlus className="w-5 h-5 text-stone-950" />
            <span>सदस्यता लिनुहोस्</span>
          </button>

          {/* Trust Highlights */}
          <div className="pt-6 border-t border-stone-200 dark:border-stone-800 text-center space-y-2">
            <div className="flex items-center justify-center gap-4 text-[11px] text-stone-600 dark:text-stone-400 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                सुरक्षित प्रमाणीकरण
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                OTP मार्फत सत्यापन
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-600" />
                वैदिक शुद्धता
              </span>
            </div>
            <p className="text-[10px] text-stone-500">
              © {new Date().getFullYear()} बालानन्द वैदिक ज्योतिष तथा पञ्चाङ्ग सेवा। सर्वाधिकार सुरक्षित।
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
