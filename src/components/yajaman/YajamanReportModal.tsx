import React, { useState } from 'react';
import { X, ShieldAlert, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { YajamanReport } from '../../types/yajamanTypes';
import { reportYajamanItem } from '../../db/yajamanStore';

interface YajamanReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'POST' | 'COMMENT' | 'USER' | 'SERVICE_REQUEST';
  targetId: string;
  targetTitleOrName: string;
  currentUserId?: string;
  currentUserName?: string;
  onReportSubmitted?: () => void;
}

export const YajamanReportModal: React.FC<YajamanReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitleOrName,
  currentUserId = 'anonymous_visitor',
  currentUserName = 'सेवा प्रयोगकर्ता',
  onReportSubmitted,
}) => {
  const [category, setCategory] = useState<YajamanReport['category']>('SPAM');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    reportYajamanItem({
      reportedBy: currentUserId,
      reporterName: currentUserName,
      targetType,
      targetId,
      targetTitleOrName,
      category,
      reason: reason.trim(),
      details: details.trim(),
    });

    setIsSuccess(true);
    if (onReportSubmitted) onReportSubmitted();
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#1E1B18] rounded-2xl shadow-2xl border border-amber-200 dark:border-stone-700 p-6 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              उजुरी सफलतापूर्वक दर्ता भयो
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              प्रशासकले यस सामग्रीको तुरुन्त समीक्षा गरी आवश्यक कारबाही गर्नेछ।
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 rounded-xl">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-serif text-stone-900 dark:text-stone-100">
                  उजुरी वा रिपोर्ट गर्नुहोस्
                </h3>
                <p className="text-xs text-stone-500">
                  लक्ष्य: {targetTitleOrName}
                </p>
              </div>
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                उजुरीको मुख्य कारण:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl p-2.5 text-xs text-stone-800 dark:text-stone-200"
              >
                <option value="SPAM">स्पाम वा अवाञ्छित विज्ञापन (Spam)</option>
                <option value="FAKE_PROFILE">नक्कली वा झुटो प्रोफाइल (Fake Profile)</option>
                <option value="WRONG_INFO">गलत वा भ्रामक जानकारी (Misleading Info)</option>
                <option value="ABUSE">दुर्व्यवहार वा अमर्यादित भाषा (Abuse)</option>
                <option value="INAPPROPRIATE">अनुचित तस्बिर वा सामग्री (Inappropriate)</option>
                <option value="FRAUD">ठगी वा आर्थिक अनुचित क्रियाकलाप (Fraud)</option>
                <option value="OTHER">अन्य कारण (Other)</option>
              </select>
            </div>

            {/* Short Reason */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                छोटो शीर्षक:
              </label>
              <input
                type="text"
                required
                placeholder="उदा. अनावश्यक प्रचार, नियम विपरित सामग्री आदि"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl p-2.5 text-xs text-stone-800 dark:text-stone-200"
              />
            </div>

            {/* Additional Details */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                विस्तृत विवरण (ऐच्छिक):
              </label>
              <textarea
                rows={3}
                placeholder="यस विषयमा अन्य कुनै जानकारी भए उल्लेख गर्नुहोस्..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl p-2.5 text-xs text-stone-800 dark:text-stone-200 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>उजुरी पठाउनुहोस्</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
