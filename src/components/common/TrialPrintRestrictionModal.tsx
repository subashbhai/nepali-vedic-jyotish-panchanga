import React from 'react';
import { Lock, Printer, Sparkles, X, CheckCircle2, ArrowRight } from 'lucide-react';

export interface TrialPrintRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType?: 'kundali' | 'vastu' | 'general';
  onOpenPurchase?: () => void;
}

export const TrialPrintRestrictionModal: React.FC<TrialPrintRestrictionModalProps> = ({
  isOpen,
  onClose,
  documentType = 'kundali',
  onOpenPurchase,
}) => {
  if (!isOpen) return null;

  const docLabel = documentType === 'kundali'
    ? 'कुण्डली तथा चिना'
    : documentType === 'vastu'
    ? 'वास्तु नक्सा तथा प्रतिवेदन'
    : 'दस्तावेज';

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#1E1B18] border-2 border-amber-500/60 dark:border-amber-600/60 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-stone-800 dark:text-stone-100 text-center">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock & Print Icon Header */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/30 border border-amber-400/50 flex items-center justify-center relative shadow-inner">
          <Printer className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          <div className="absolute -bottom-1 -right-1 bg-red-600 text-white p-1 rounded-full ring-2 ring-white dark:ring-stone-900 shadow">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-400/40 text-amber-800 dark:text-amber-300 text-xs font-black px-3 py-1 rounded-full mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>७ दिने निःशुल्क परीक्षण (Trial Mode)</span>
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-stone-100 mb-2">
          {docLabel} प्रिन्ट सुविधा सीमित छ
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-5">
          तपाईं हाल <strong>७ दिने निःशुल्क परीक्षण</strong> प्रयोग गर्दै हुनुहुन्छ। यस अवधिमा सफ्टवेयरका सम्पूर्ण सुविधाहरू हेर्न, गणना गर्न र अध्ययन गर्न सकिन्छ, तर <strong>आधिकारिक प्रिन्ट तथा PDF डाउनलोड सुविधा उपलब्ध छैन</strong>।
        </p>

        {/* Features Checklist */}
        <div className="bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-2xl p-3.5 mb-6 text-left space-y-2 text-xs">
          <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>सबै ग्रह, दशा, अष्टकवर्ग तथा वास्तु गणना (पूर्ण उपलब्ध)</span>
          </div>
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-semibold">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>व्यावसायिक छापा योग्य कुण्डली तथा वास्तु नक्सा प्रिन्ट (सशुल्क सदस्यता आवश्यक)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenPurchase) onOpenPurchase();
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-white text-sm font-extrabold rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>पूर्ण सदस्यता लिनुहोस् (अपग्रेड गर्नुहोस्)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-4 bg-transparent hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-700 dark:text-stone-400 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            अहिलेलाई बन्द गर्नुहोस्
          </button>
        </div>
      </div>
    </div>
  );
};
