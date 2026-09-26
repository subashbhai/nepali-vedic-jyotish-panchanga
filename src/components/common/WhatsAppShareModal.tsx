import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  Download,
  Share2,
  Copy,
  Check,
  Send,
  FileText,
  Phone,
  User,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';

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

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
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
  const [isSharingNative, setIsSharingNative] = useState<boolean>(false);

  if (!isOpen) return null;

  // Clean phone number for WhatsApp URL (ensure country code e.g. 977 for Nepal if not present)
  const getSanitizedPhone = (raw: string): string => {
    let digits = raw.replace(/[^0-9]/g, '');
    if (digits.startsWith('0')) digits = digits.slice(1);
    // If standard 10 digit Nepali mobile (starts with 97, 98), prepend 977
    if (digits.length === 10 && (digits.startsWith('98') || digits.startsWith('97') || digits.startsWith('96'))) {
      return `977${digits}`;
    }
    return digits;
  };

  const currentDateText = dateBS || new Date().toLocaleDateString('ne-NP');

  const defaultMessage = `卐 ॐ नमो भगवते वासुदेवाय। 卐

आदरणीय *${clientName}* ज्यू,
तपाईंको आधिकारिक *${reportTitle}* तयार भएको छ।

📅 *मिति:* वि.सं. ${currentDateText}
🏛️ *संस्था:* ${orgName}
📞 *सम्पर्क:* ${orgPhone}
${customSummaryText ? `\n📌 *मुख्य फलादेश तथा पञ्चाङ्ग सारांश:*\n${customSummaryText}\n` : ''}
📄 तपाईंको आधिकारिक A4 PDF प्रतिवेदन तयार छ। कृपया प्राप्त प्रतिवेदन सुरक्षित राख्नुहोला।

✨ *शुभम् भवतु! कल्याणम् अस्तु!* ✨`;

  const handleOpenWhatsApp = () => {
    const cleanNumber = getSanitizedPhone(phoneNumber);
    const encoded = encodeURIComponent(defaultMessage);
    const url = cleanNumber
      ? `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    
    // Trigger PDF download first so the user has the file handy
    if (onDownloadPDF) {
      onDownloadPDF();
    }

    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      setIsSharingNative(true);
      try {
        const shareData: ShareData = {
          title: `${reportTitle} - ${clientName}`,
          text: defaultMessage,
        };
        if (pdfFile && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
          shareData.files = [pdfFile];
        }
        await navigator.share(shareData);
      } catch (err) {
        console.warn('Native share dismissed or not supported', err);
      } finally {
        setIsSharingNative(false);
      }
    } else {
      handleOpenWhatsApp();
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(defaultMessage);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-stone-950/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 border border-amber-600/40 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-white shadow-inner">
              <MessageCircle className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-serif flex items-center gap-1.5">
                <span>WhatsApp मा प्रतिवेदन सेयर</span>
                <span className="text-[10px] bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-400/40 font-mono">
                  Direct Share
                </span>
              </h3>
              <p className="text-xs text-emerald-100/90 font-serif">
                {reportTitle} • {clientName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Phone Number Input */}
          <div className="space-y-1.5">
            <label className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>ग्राहकको WhatsApp नम्बर (Phone Number):</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="उदा: ९८५१०००००० वा ९७६४४००५३३"
                className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 font-mono outline-none"
              />
              <span className="absolute right-3 top-2.5 text-[10px] text-stone-400">नेपाल (+९७७)</span>
            </div>
            <p className="text-[11px] text-stone-500">
              * नम्बर खाली छोडेमा WhatsApp खुल्दा सम्पर्क सूची (Contact List) बाट सिधै छनोट गर्न सकिन्छ।
            </p>
          </div>

          {/* Message Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>WhatsApp सन्देश पूर्वावलोकन (Message Preview):</span>
              </label>
              <button
                onClick={handleCopyText}
                className="text-stone-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 font-semibold transition cursor-pointer"
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
            <div className="bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 p-3 rounded-2xl max-h-40 overflow-y-auto whitespace-pre-wrap font-sans text-stone-700 dark:text-stone-300 leading-relaxed text-[11px]">
              {defaultMessage}
            </div>
          </div>

          {/* Action Highlights */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 rounded-2xl flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-emerald-900 dark:text-emerald-200 leading-normal">
              <strong>PDF प्रतिवेदन र सन्देश:</strong> "WhatsApp मा पठाउनुहोस्" क्लिक गर्दा तपाईंको प्रतिवेदन तुरुन्त डाउनलोड हुनेछ र ग्राहकको च्याटमा स्वतः वैदिक विवरण खुल्नेछ।
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            <button
              onClick={handleOpenWhatsApp}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer text-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp मा पठाउनुहोस्</span>
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator ? (
              <button
                onClick={handleNativeShare}
                disabled={isSharingNative}
                className="w-full flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-100 font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer text-xs border border-stone-700"
              >
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>मोबाइल सेयर (Native App)</span>
              </button>
            ) : onDownloadPDF ? (
              <button
                onClick={onDownloadPDF}
                className="w-full flex items-center justify-center gap-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-xs border border-stone-300 dark:border-stone-700"
              >
                <Download className="w-4 h-4 text-stone-500" />
                <span>PDF मात्र डाउनलोड</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-stone-100 dark:bg-stone-800/60 px-5 py-2.5 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500">
          <span>सुरक्षित वैदिक सञ्चार सेवा</span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">सत्यं वद धर्मं चर</span>
        </div>
      </div>
    </div>
  );
};
