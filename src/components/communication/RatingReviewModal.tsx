import React, { useState } from 'react';
import { Star, Send, X, ShieldCheck } from 'lucide-react';
import { Booking } from '../../types/yajamanTypes';
import { convertADToBS } from '../../utils/nepaliCalendar';

interface RatingReviewModalProps {
  booking: Booking;
  onClose: () => void;
  onSubmitSuccess: (rating: number, reviewText: string) => void;
}

export const RatingReviewModal: React.FC<RatingReviewModalProps> = ({
  booking,
  onClose,
  onSubmitSuccess,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    // Save review to storage
    const STORAGE_KEY = 'balananda_ratings_v1';
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const newRating = {
      id: `rev_${Date.now()}`,
      bookingId: booking.id,
      yajamanId: booking.yajamanId,
      yajamanName: booking.yajamanName,
      providerId: booking.providerId,
      rating,
      reviewText,
      createdAtBS: convertADToBS(new Date().toISOString().split('T')[0]).formattedBS,
      createdAtTimestamp: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify([newRating, ...existing]));
    onSubmitSuccess(rating, reviewText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 text-stone-200 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div>
            <h3 className="font-bold text-stone-100 text-sm">सेवा समीक्षा तथा मूल्याङ्कन</h3>
            <p className="text-xs text-amber-400 font-serif">{booking.providerName} - {booking.serviceType}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-stone-800 rounded-lg text-stone-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-400">
          सेवा सम्पन्न भएकोमा बधाई छ। सेवा प्रदायकको कार्य सम्पादन र वैदिक सन्तुष्टि अनुसार तारा छनोट गरी प्रतिक्रिया दिनुहोस्।
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Selection */}
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-amber-400 focus:outline-none cursor-pointer transform hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-stone-700'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-300">
              {rating === 5 && 'अत्युत्तम सेवा (5/5)'}
              {rating === 4 && 'धेरै राम्रो सेवा (4/5)'}
              {rating === 3 && 'सामान्य सेवा (3/5)'}
              {rating === 2 && 'सुधार आवश्यक (2/5)'}
              {rating === 1 && 'असुविधाजनक (1/5)'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">विस्तृत समीक्षा / प्रतिक्रिया</label>
            <textarea
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="समयको पाबन्दी, वैदिक ज्ञान, र सेवा गुणस्तरबारे आफ्नो अनुभव लेख्नुहोस्..."
              required
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="p-2.5 bg-emerald-950/50 border border-emerald-900 rounded-xl flex items-center gap-2 text-[11px] text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>प्रमाणित सम्पन्न बुकिङसँग जोडिएको वास्तविक समीक्षा</span>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>समीक्षा पेश गर्नुहोस्</span>
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
