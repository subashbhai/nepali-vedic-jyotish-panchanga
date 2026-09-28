import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  FileText,
  Phone,
  Sparkles,
  ExternalLink,
  Download
} from 'lucide-react';

export interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
  clientName: string;
  clientPhone?: string;
  dateBS?: string;
  pdfFilename?: string;
  pdfFile?: File | null;
  onDownloadPDF?: () => void;
  orgName?: string;
  orgPhone?: string;
  customSummaryText?: string;
}

export type UniversalShareModalProps = WhatsAppShareModalProps;

// WhatsApp SVG Icon
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.04 7.42C8.88 7.42 8.63 7.48 8.41 7.72C8.19 7.96 7.57 8.54 7.57 9.73C7.57 10.92 8.44 12.07 8.56 12.23C8.68 12.39 10.28 14.86 12.73 15.92C14.77 16.8 15.19 16.62 15.63 16.58C16.07 16.54 17.06 16 17.26 15.42C17.46 14.85 17.46 14.36 17.4 14.26C17.34 14.15 17.18 14.09 16.94 13.97C16.7 13.85 15.52 13.27 15.3 13.19C15.08 13.11 14.92 13.07 14.76 13.31C14.6 13.56 14.14 14.09 14 14.25C13.86 14.41 13.72 14.43 13.48 14.31C13.24 14.19 12.47 13.94 11.55 13.12C10.83 12.48 10.35 11.69 10.21 11.45C10.07 11.21 10.2 11.08 10.32 10.96C10.43 10.85 10.56 10.67 10.68 10.53C10.8 10.39 10.84 10.29 10.92 10.13C11 9.97 10.96 9.83 10.9 9.71C10.84 9.59 10.38 8.46 10.19 7.99C10 7.53 9.82 7.59 9.68 7.58L9.25 7.57C9.09 7.57 9.04 7.42 9.04 7.42Z" />
  </svg>
);

// Facebook SVG Icon
export const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// Messenger SVG Icon
export const MessengerIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.43 3.14 7.17.16.15.27.36.28.58l.1 1.83c.03.6.61 1.02 1.17.85l2.03-.62c.18-.05.37-.03.54.04.88.35 1.84.55 2.84.55 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm1.19 13.06l-2.61-2.79-5.1 2.79c-.39.21-.83-.22-.64-.62l5.44-7.53c.27-.37.83-.37 1.1 0l2.61 2.79 5.1-2.79c.39-.21.83.22.64.62l-5.44 7.53c-.27.37-.83.37-1.1 0z" />
  </svg>
);

export const UniversalShareModal: React.FC<UniversalShareModalProps> = ({
  isOpen,
  onClose,
  reportTitle,
  clientName,
  clientPhone = '',
  dateBS,
  pdfFilename,
  pdfFile,
  onDownloadPDF,
  orgName = 'श्री वैदिक ज्योतिष तथा वास्तु परामर्श सेवा',
  orgPhone = '+९७७-९७६४४००५३३',
  customSummaryText
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string>(clientPhone);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSharingNative, setIsSharingNative] = useState<boolean>(false);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Clean phone number for WhatsApp URL (ensure country code e.g. 977 for Nepal if not present)
  const getSanitizedPhone = (raw: string): string => {
    let digits = raw.replace(/[^0-9]/g, '');
    if (digits.startsWith('0')) digits = digits.slice(1);
    if (digits.length === 10 && (digits.startsWith('98') || digits.startsWith('97') || digits.startsWith('96'))) {
      return `977${digits}`;
    }
    return digits;
  };

  const currentDateText = dateBS || new Date().toLocaleDateString('ne-NP');
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const defaultMessage = `卐 ॐ नमो भगवते वासुदेवाय। 卐

आदरणीय *${clientName}* ज्यू,
तपाईंको आधिकारिक *${reportTitle}* तयार भएको छ।

📅 *मिति:* वि.सं. ${currentDateText}
🏛️ *संस्था:* ${orgName}
📞 *सम्पर्क:* ${orgPhone}
${customSummaryText ? `\n📌 *मुख्य फलादेश तथा पञ्चाङ्ग सारांश:*\n${customSummaryText}\n` : ''}
📄 तपाईंको आधिकारिक वैदिक प्रतिवेदन तयार छ।
🔗 अवलोकन गर्नुहोस्: ${currentUrl}

✨ *शुभम् भवतु! कल्याणम् अस्तु!* ✨`;

  // 1. WHATSAPP SHARE (NO AUTO DOWNLOAD)
  const handleOpenWhatsApp = () => {
    const cleanNumber = getSanitizedPhone(phoneNumber);
    const encoded = encodeURIComponent(defaultMessage);
    const url = cleanNumber
      ? `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;

    window.open(url, '_blank');
    showToast('WhatsApp खुल्दैछ...');
  };

  // 2. FACEBOOK SHARE (NO AUTO DOWNLOAD)
  const handleOpenFacebook = () => {
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedQuote = encodeURIComponent(defaultMessage);
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedQuote}`;
    window.open(url, '_blank', 'width=620,height=540,scrollbars=yes');
    showToast('Facebook सेयर संवाद खुल्दैछ...');
  };

  // 3. MESSENGER SHARE (NO AUTO DOWNLOAD)
  const handleOpenMessenger = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(defaultMessage);
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 3000);
      }
    } catch {}

    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `fb-messenger://share?link=${encodeURIComponent(currentUrl)}`;
      setTimeout(() => {
        window.open('https://www.messenger.com/', '_blank');
      }, 1500);
    } else {
      const encodedUrl = encodeURIComponent(currentUrl);
      const messengerDialog = `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518&redirect_uri=${encodedUrl}`;
      const opened = window.open(messengerDialog, '_blank', 'width=620,height=540');
      if (!opened || opened.closed) {
        window.open('https://www.messenger.com/', '_blank');
      }
    }
    showToast('सन्देश कपी भयो र Messenger खुल्दैछ!');
  };

  // 4. COPY TEXT TO CLIPBOARD
  const handleCopyText = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(defaultMessage);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = defaultMessage;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedText(true);
      showToast('सन्देश क्लिपबोर्डमा कपी भयो!');
      setTimeout(() => setCopiedText(false), 2500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // 5. NATIVE MOBILE SHARE API
  const handleNativeShare = async () => {
    if (navigator.share) {
      setIsSharingNative(true);
      try {
        const shareData: ShareData = {
          title: `${reportTitle} - ${clientName}`,
          text: defaultMessage,
          url: currentUrl,
        };
        await navigator.share(shareData);
        showToast('सफलतापूर्वक सेयर गरियो!');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Native share dismissed or not supported', err);
        }
      } finally {
        setIsSharingNative(false);
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stone-950/80 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-white dark:bg-stone-900 border border-amber-600/40 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-white shadow-inner">
              <Share2 className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-serif flex items-center gap-1.5">
                <span>प्रतिवेदन सेयर (Share Report)</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full border border-white/30 font-mono">
                  Multi-Platform
                </span>
              </h3>
              <p className="text-xs text-indigo-100 font-serif">
                {reportTitle} • {clientName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto">
          {/* Toast feedback */}
          {toastMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold text-center animate-in fade-in slide-in-from-top-1 text-xs">
              {toastMessage}
            </div>
          )}

          {/* Social Platform Share Buttons Grid */}
          <div className="space-y-2">
            <label className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>सेयर गर्ने माध्यम रोज्नुहोस् (Select Platform):</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* 1. WhatsApp Button */}
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="flex items-center sm:flex-col justify-center gap-2 p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold transition-all shadow-sm cursor-pointer group text-left sm:text-center"
                title="WhatsApp मा सिधै पठाउनुहोस्"
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                </div>
                <div className="leading-tight">
                  <span className="block text-xs font-bold">WhatsApp</span>
                  <span className="text-[10px] text-emerald-100 font-normal">च्याट वा नम्बरमा</span>
                </div>
              </button>

              {/* 2. Facebook Button */}
              <button
                type="button"
                onClick={handleOpenFacebook}
                className="flex items-center sm:flex-col justify-center gap-2 p-3 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] active:scale-95 text-white font-bold transition-all shadow-sm cursor-pointer group text-left sm:text-center"
                title="Facebook मा सेयर गर्नुहोस्"
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <FacebookIcon className="w-4 h-4 text-white" />
                </div>
                <div className="leading-tight">
                  <span className="block text-xs font-bold">Facebook</span>
                  <span className="text-[10px] text-blue-100 font-normal">टाइमलाइन / ग्रुप</span>
                </div>
              </button>

              {/* 3. Messenger Button */}
              <button
                type="button"
                onClick={handleOpenMessenger}
                className="flex items-center sm:flex-col justify-center gap-2 p-3 rounded-2xl bg-gradient-to-tr from-[#00B2FF] via-[#006AFF] to-[#9900FF] hover:opacity-95 active:scale-95 text-white font-bold transition-all shadow-sm cursor-pointer group text-left sm:text-center"
                title="Messenger मा साथीहरूलाई पठाउनुहोस्"
              >
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <MessengerIcon className="w-4 h-4 text-white" />
                </div>
                <div className="leading-tight">
                  <span className="block text-xs font-bold">Messenger</span>
                  <span className="text-[10px] text-purple-100 font-normal">प्रत्यक्ष सन्देश</span>
                </div>
              </button>
            </div>
          </div>

          {/* Optional Phone Number Input for Direct WhatsApp */}
          <div className="space-y-1.5 bg-stone-50 dark:bg-stone-800/50 p-3 rounded-2xl border border-stone-200 dark:border-stone-700/70">
            <label className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>WhatsApp मा सिधै पठाउन ग्राहकको नम्बर (वैकल्पिक):</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="उदा: ९८५१०००००० वा ९७६४४००५३३"
                  className="w-full bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2 text-xs text-stone-900 dark:text-stone-100 font-mono outline-none"
                />
                <span className="absolute right-3 top-2 text-[10px] text-stone-400 font-mono">+९७७</span>
              </div>
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0 transition"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span>पठाउनुहोस्</span>
              </button>
            </div>
            <p className="text-[10.5px] text-stone-500">
              * नम्बर खाली छोडेमा WhatsApp एप वा वेब खुल्दा जुनसुकै च्याट/ग्रुप छान्न सकिन्छ।
            </p>
          </div>

          {/* Message Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>सन्देश पूर्वावलोकन (Message Preview):</span>
              </label>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 font-semibold transition cursor-pointer text-xs"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>कपी भयो!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>कपी गर्नुहोस्</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 p-3 rounded-2xl max-h-36 overflow-y-auto whitespace-pre-wrap font-sans text-stone-700 dark:text-stone-300 leading-relaxed text-[11px] select-all">
              {defaultMessage}
            </div>
          </div>

          {/* Secondary Action Buttons (Native share, copy text, optional manual PDF download) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyText}
                className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold rounded-xl transition cursor-pointer text-xs border border-stone-200 dark:border-stone-700"
              >
                <Copy className="w-3.5 h-3.5 text-stone-500" />
                <span>सन्देश कपी</span>
              </button>

              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  disabled={isSharingNative}
                  className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold rounded-xl transition cursor-pointer text-xs border border-stone-200 dark:border-stone-700"
                >
                  <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>अन्य एपहरू</span>
                </button>
              )}
            </div>

            {onDownloadPDF && (
              <button
                type="button"
                onClick={onDownloadPDF}
                className="flex items-center gap-1.5 px-3 py-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 font-semibold transition cursor-pointer text-xs underline decoration-dotted"
                title="यदि आफ्नै कम्प्युटरमा पनि PDF फाइल राख्न चाहनुहुन्छ भने मात्र क्लिक गर्नुहोस्"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF पनि डाउनलोड गर्नुहोस्</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-stone-100 dark:bg-stone-800/60 px-5 py-2.5 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500">
          <span>सुरक्षित वैदिक सञ्चार सेवा</span>
          <span className="font-semibold text-indigo-700 dark:text-indigo-400">सत्यं वद धर्मं चर</span>
        </div>
      </div>
    </div>
  );
};

// Backward-compatibility export alias
export const WhatsAppShareModal = UniversalShareModal;
