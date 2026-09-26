import React from 'react';
import {
  Lock,
  LogIn,
  UserPlus,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  ArrowRight,
  HelpCircle,
  Clock
} from 'lucide-react';

export interface ServiceItemInfo {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon?: React.ComponentType<{ className?: string }>;
  tabKey?: string;
}

export interface ServiceLoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceItemInfo | null;
  onOpenLogin: () => void;
  onOpenSignUp?: () => void;
  onOpenTrial?: () => void;
  onContinueAsGuest?: () => void;
}

export const ServiceLoginRequiredModal: React.FC<ServiceLoginRequiredModalProps> = ({
  isOpen,
  onClose,
  service,
  onOpenLogin,
  onOpenSignUp,
  onOpenTrial,
  onContinueAsGuest
}) => {
  if (!isOpen || !service) return null;

  const ServiceIcon = service.icon;

  const handleLoginClick = () => {
    onClose();
    onOpenLogin();
  };

  const handleSignUpClick = () => {
    onClose();
    if (onOpenSignUp) {
      onOpenSignUp();
    } else {
      onOpenLogin();
    }
  };

  const handleTrialClick = () => {
    onClose();
    if (onOpenTrial) {
      onOpenTrial();
    } else {
      onOpenLogin();
    }
  };

  const handleGuestContinue = () => {
    onClose();
    if (onContinueAsGuest) {
      onContinueAsGuest();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#FFFDF9] dark:bg-[#1C1917] rounded-3xl border-2 border-amber-500/40 dark:border-amber-600/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sacred Decorative Header Bar */}
        <div className="bg-gradient-to-r from-[#7A1C1C] via-[#991B1B] to-[#B45309] text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
            title="बन्द गर्नुहोस् (Close)"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/20 shadow-inner shrink-0">
              <Lock className="w-6 h-6 text-amber-300" />
            </span>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/30 text-[11px] font-bold text-amber-200 uppercase tracking-wide">
                <span>🔐</span>
                <span>Log In To Use Service</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-white mt-1">
                सेवा प्रयोग गर्न कृपया लगइन गर्नुहोस्
              </h2>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {/* Selected Service Spotlight Card */}
          <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-400/30 dark:border-amber-600/30 flex items-start gap-3">
            {ServiceIcon && (
              <span className="p-2.5 rounded-xl bg-amber-500/20 text-[#B45309] dark:text-amber-300 shrink-0">
                <ServiceIcon className="w-6 h-6" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 font-serif">
                  {service.title}
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-[#B45309] dark:text-amber-300 border border-amber-400/30">
                  {service.badge}
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                {service.subtitle}
              </p>
            </div>
          </div>

          {/* Prompt Message */}
          <div className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed space-y-2">
            <p>
              यस वैदिक सेवाको पूर्ण सुविधाहरू (कुण्डली फलादेश, पत्रिका निर्माण, विवाह मिलान तथा परामर्श) प्रयोग गर्न कृपया आफ्नो खातामा <b>लगइन</b> गर्नुहोस्।
            </p>
            <p className="text-stone-500 dark:text-stone-400 text-xs italic">
              Please sign in to your registered account or create a new account to access full features and save your data securely.
            </p>
          </div>

          {/* Benefits Bullet Points */}
          <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#25201A] border border-[#E6E0D5] dark:border-stone-800 space-y-2">
            <h4 className="text-[11px] font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>लगइन गरेपछि प्राप्त हुने विशेष सुविधाहरू:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600 dark:text-stone-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>व्यक्तिगत कुण्डली तथा फलादेश बचत</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>डिजिटल जन्मपत्रिका र PDF प्रिन्ट</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>३६ गुण मिलान र मांगलिक दोष विश्लेषण</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>वास्तु कम्पास तथा दिशा परामर्श सेवा</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            {/* Primary Log In Button */}
            <button
              type="button"
              onClick={handleLoginClick}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#7A1C1C] via-[#8B1E0F] to-[#B45309] hover:from-[#6B1818] hover:to-[#92400E] text-white font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer border border-amber-400/30"
            >
              <LogIn className="w-4 h-4 text-amber-300" />
              <span>🔑 लगइन गर्नुहोस् (Log In / Sign In)</span>
              <ArrowRight className="w-4 h-4 text-amber-300 ml-1" />
            </button>

            {/* Secondary Registration & Trial Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSignUpClick}
                className="py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-[#B45309] dark:text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>नयाँ खाता दर्ता (Sign Up)</span>
              </button>

              <button
                type="button"
                onClick={handleTrialClick}
                className="py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>२४-घण्टे ट्रयाल (Free Trial)</span>
              </button>
            </div>

            {/* Guest / Close buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-800 text-xs">
              {onContinueAsGuest ? (
                <button
                  type="button"
                  onClick={handleGuestContinue}
                  className="text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-300 underline font-medium cursor-pointer"
                >
                  नमुना हेर्नुहोस् (Preview as Guest)
                </button>
              ) : (
                <span className="text-[11px] text-stone-400">
                  सनातन वैदिक ज्योतिष सेवा
                </span>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold cursor-pointer transition-colors"
              >
                बन्द गर्नुहोस् (Close)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
