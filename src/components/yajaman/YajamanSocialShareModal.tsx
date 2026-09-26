import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Facebook, 
  Send, 
  Globe, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { YajamanPost } from '../../types/yajamanTypes';

interface YajamanSocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: YajamanPost | null;
}

export const YajamanSocialShareModal: React.FC<YajamanSocialShareModalProps> = ({
  isOpen,
  onClose,
  post,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !post) return null;

  const currentUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}#yajaman-post-${post.id}`
    : `https://balananda.app/yajaman/post/${post.id}`;

  const shareTitle = `🕉️ ${post.title} — ${post.categoryNameNepali}`;
  const shareSummary = `${post.description.substring(0, 140)}...\nस्थान: ${post.district} | सेवा प्रकार: ${post.serviceType}`;
  const fullShareText = `${shareTitle}\n\n${shareSummary}\n\n🔗 सेवा हेर्नुहोस्: ${currentUrl}`;

  // Native Web Share API
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareSummary,
          url: currentUrl,
        });
        onClose();
      } catch (err) {
        console.log('Share dismissed', err);
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const openShareWindow = (url: string) => {
    window.open(url, '_blank', 'width=600,height=500,scrollbars=yes,resizable=yes');
  };

  const shareFacebook = () => {
    openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(shareTitle)}`);
  };

  const shareWhatsApp = () => {
    openShareWindow(`https://api.whatsapp.com/send?text=${encodeURIComponent(fullShareText)}`);
  };

  const shareTwitter = () => {
    openShareWindow(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(currentUrl)}`);
  };

  const shareMessenger = () => {
    openShareWindow(`fb-messenger://share/?link=${encodeURIComponent(currentUrl)}`);
  };

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
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          title="बन्द गर्नुहोस्"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2.5 bg-amber-100 dark:bg-stone-800 text-[#7A1C1C] dark:text-amber-400 rounded-xl">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100">
              सामाजिक सञ्जालमा सेयर गर्नुहोस्
            </h3>
            <p className="text-xs text-stone-500">
              धार्मिक तथा कर्मकाण्ड सेवा पोस्ट सार्वजनिक रूपमा सेयर गर्नुहोस्
            </p>
          </div>
        </div>

        {/* Post Preview Card */}
        <div className="bg-amber-50/50 dark:bg-stone-900/60 border border-amber-200/70 dark:border-stone-800 rounded-xl p-3.5 mb-5 space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
          <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="line-clamp-1">{post.title}</span>
          </div>
          <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2">
            {post.description}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-stone-500 pt-1">
            <span>📍 {post.district}</span>
            <span>•</span>
            <span>🏷️ {post.categoryNameNepali}</span>
          </div>
        </div>

        {/* Share Buttons Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <button
            type="button"
            onClick={shareFacebook}
            className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white py-2.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Facebook className="w-4 h-4" />
            <span>Facebook</span>
          </button>

          <button
            type="button"
            onClick={shareWhatsApp}
            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-2.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={shareTwitter}
            className="flex items-center justify-center gap-2 bg-stone-900 hover:bg-black text-white py-2.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <span className="font-mono font-bold text-sm">𝕏</span>
            <span>X (Twitter)</span>
          </button>

          <button
            type="button"
            onClick={shareMessenger}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#00B2FF] to-[#006AFF] hover:opacity-90 text-white py-2.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Globe className="w-4 h-4" />
            <span>Messenger</span>
          </button>
        </div>

        {/* Native Share if available */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full mb-3 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>अन्य एप्स मार्फत सेयर गर्नुहोस् (Native Share)</span>
          </button>
        )}

        {/* Copy Link Input */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400">
            सिधा लिङ्क (Direct URL)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-700 dark:text-stone-300 font-mono select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#7A1C1C] hover:bg-[#9B2C2C] text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>प्रतिलिपि भयो</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>कपि लिङ्क</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2 text-[10px] text-stone-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>गोपनीयता सुरक्षित छ: सेयर गर्दा केवल सार्वजनिक विवरण र शीर्षक मात्र पठाइन्छ।</span>
        </div>
      </div>
    </div>
  );
};
