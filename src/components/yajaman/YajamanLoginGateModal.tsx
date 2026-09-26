import React from 'react';
import { Lock, LogIn, UserPlus, X, ShieldAlert, Sparkles } from 'lucide-react';

interface YajamanLoginGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  featureName?: string;
  actionMessage?: string;
}

export const YajamanLoginGateModal: React.FC<YajamanLoginGateModalProps> = ({
  isOpen,
  onClose,
  onOpenLogin,
  onOpenRegister,
  featureName = 'यजमान सेवा सुविधा',
  actionMessage = 'यो सुविधा प्रयोग गर्न पहिले लगइन गर्नुहोस्।',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#1E1B18] rounded-2xl shadow-2xl border border-amber-200 dark:border-stone-700 p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title="बन्द गर्नुहोस्"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2 pb-1">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center text-amber-700 dark:text-amber-300 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7A1C1C] dark:text-amber-400 bg-amber-50 dark:bg-stone-800 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-stone-700">
              <Sparkles className="w-3 h-3 text-amber-500" />
              {featureName}
            </span>
            <h3 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
              लगइन आवश्यक छ
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed max-w-xs">
              {actionMessage}
            </p>
          </div>
        </div>

        {/* Security & Privacy Notice */}
        <div className="my-5 bg-amber-50/70 dark:bg-stone-800/60 border border-amber-200/80 dark:border-stone-700 rounded-xl p-3.5 flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-stone-700 dark:text-stone-300 leading-normal">
            यजमान र पण्डित/ज्योतिष महानुभावहरूको व्यक्तिगत सम्पर्क र मर्यादाको सुरक्षाका लागि पूर्ण विवरण तथा सेवा अनुरोध लगइन पश्चात मात्र खुला हुन्छ।
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenLogin();
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#7A1C1C] hover:bg-[#9B2C2C] text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all text-sm cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-amber-300" />
            <span>लगइन गर्नुहोस्</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenRegister();
            }}
            className="w-full flex items-center justify-center gap-2 bg-amber-100 dark:bg-stone-800 hover:bg-amber-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 font-bold py-3 px-4 rounded-xl border border-amber-300 dark:border-stone-600 transition-all text-sm cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>नयाँ खाता बनाउनुहोस्</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full text-center text-xs text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 py-1.5 transition-colors cursor-pointer"
          >
            पछि गर्ने (सार्वजनिक फिड मात्र हेर्नुहोस्)
          </button>
        </div>
      </div>
    </div>
  );
};
