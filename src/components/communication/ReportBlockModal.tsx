import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';
import { UserReport } from '../../types/communicationTypes';
import { blockUser, createReportUser } from '../../db/communicationStore';

interface ReportBlockModalProps {
  reporterId: string;
  reporterName: string;
  reporterType: 'YAJAMAN' | 'PROVIDER';
  reportedUserId: string;
  reportedUserName: string;
  reportedUserType: 'YAJAMAN' | 'PROVIDER';
  bookingId?: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const ReportBlockModal: React.FC<ReportBlockModalProps> = ({
  reporterId,
  reporterName,
  reporterType,
  reportedUserId,
  reportedUserName,
  reportedUserType,
  bookingId,
  onClose,
  onSuccess,
}) => {
  const [reasonCategory, setReasonCategory] = useState<UserReport['reasonCategory']>('INAPPROPRIATE_BEHAVIOR');
  const [details, setDetails] = useState('');
  const [shouldBlock, setShouldBlock] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;

    createReportUser(
      reporterId,
      reporterName,
      reporterType,
      reportedUserId,
      reportedUserName,
      reportedUserType,
      reasonCategory,
      details,
      bookingId
    );

    if (shouldBlock) {
      blockUser(reporterId, reportedUserId, details);
    }

    onSuccess(shouldBlock ? 'प्रयोगकर्ता रिपोर्ट तथा ब्लक गरियो।' : 'रिपोर्ट प्रशासककहाँ पठाइयो।');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 text-stone-200 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span>रिपोर्ट वा ब्लक गर्नुहोस्</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-stone-800 rounded-lg text-stone-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-400">
          तपाईं <strong className="text-stone-200">{reportedUserName}</strong> विरुद्ध रिपोर्ट गर्दै हुनुहुन्छ। रिपोर्ट सुपर प्रशासकद्वारा छानबिन गरिनेछ।
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">कारण छनोट गर्नुहोस्</label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value as any)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
            >
              <option value="INAPPROPRIATE_BEHAVIOR">अनुचित भाषा वा दुर्व्यवहार</option>
              <option value="FRAUD">ठगी वा गलत वित्तीय माग</option>
              <option value="NO_SHOW">तोकिएको समयमा अनुपस्थित / सम्पर्कविहीन</option>
              <option value="SPAM">अनावश्यक सन्देश वा विज्ञापन</option>
              <option value="OTHER">अन्य समस्या</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">विस्तृत विवरण</label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="घटनाको संक्षिप्त विवरण लेख्नुहोस्..."
              required
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="blockUserCheck"
              checked={shouldBlock}
              onChange={(e) => setShouldBlock(e.target.checked)}
              className="w-4 h-4 rounded border-stone-800 text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="blockUserCheck" className="text-xs font-bold text-rose-300 cursor-pointer">
              यस प्रयोगकर्तालाई मेरो खाताबाट ब्लक गर्नुहोस्
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
            >
              रिपोर्ट पेश गर्नुहोस्
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl cursor-pointer"
            >
              रद्द
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
