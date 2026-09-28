import React, { useState, useRef, useEffect } from 'react';
import {
  Printer,
  Download,
  Share2,
  MessageCircle,
  Loader2,
  CheckCircle2,
  FileDown,
  ChevronDown,
  Image as ImageIcon
} from 'lucide-react';
import { exportElementToPDF, printElement, generatePDFFileFromElement, generatePNGFileFromElement } from '../../utils/pdfGenerator';
import { UniversalShareModal, WhatsAppIcon, FacebookIcon, MessengerIcon } from './WhatsAppShareModal';
import { canUserPrintDocuments } from '../../db/subscriptionStore';
import { TrialPrintRestrictionModal } from './TrialPrintRestrictionModal';

export interface ReportActionToolbarProps {
  elementId: string;
  reportTitle: string;
  clientName?: string;
  clientPhone?: string;
  dateBS?: string;
  customFilename?: string;
  customSummaryText?: string;
  orgName?: string;
  orgPhone?: string;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
  onCustomExportPDF?: () => Promise<void>;
  variant?: 'toolbar' | 'compact' | 'pill' | 'dark_header';
  className?: string;
}

export const ReportActionToolbar: React.FC<ReportActionToolbarProps> = ({
  elementId,
  reportTitle,
  clientName = 'जातक',
  clientPhone = '',
  dateBS,
  customFilename,
  customSummaryText,
  orgName,
  orgPhone,
  onBeforePrint,
  onAfterPrint,
  onCustomExportPDF,
  variant = 'toolbar',
  className = ''
}) => {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingPNG, setIsExportingPNG] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isShareDropdownOpen, setIsShareDropdownOpen] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [generatedPdfFile, setGeneratedPdfFile] = useState<File | null>(null);
  const [isPrintRestrictedModalOpen, setIsPrintRestrictedModalOpen] = useState(false);
  const [restrictedDocType, setRestrictedDocType] = useState<'kundali' | 'vastu' | 'general'>('general');

  const downloadMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(e.target as Node)) {
        setIsDownloadOpen(false);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setIsShareDropdownOpen(false);
      }
    };
    if (isDownloadOpen || isShareDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDownloadOpen, isShareDropdownOpen]);

  const sanitizedName = clientName.replace(/[\s\/:]+/g, '_');
  const sanitizedDate = (dateBS || 'Report').replace(/[\s\/:]+/g, '_');
  const filename = customFilename || `${reportTitle.replace(/[\s\/:]+/g, '_')}_${sanitizedName}_${sanitizedDate}.pdf`;

  const detectDocType = (): 'kundali' | 'vastu' | 'general' => {
    const text = `${reportTitle} ${elementId}`.toLowerCase();
    if (text.includes('kundali') || text.includes('कुण्डली') || text.includes('चिना') || text.includes('patrika') || text.includes('tipan')) {
      return 'kundali';
    }
    if (text.includes('vastu') || text.includes('वास्तु') || text.includes('mandala') || text.includes('blueprint')) {
      return 'vastu';
    }
    return 'general';
  };

  // 1. Direct Print Action
  const handlePrint = () => {
    const docType = detectDocType();
    const check = canUserPrintDocuments(docType);
    if (!check.allowed) {
      setRestrictedDocType(docType);
      setIsPrintRestrictedModalOpen(true);
      return;
    }
    if (onBeforePrint) onBeforePrint();
    printElement(elementId);
    if (onAfterPrint) onAfterPrint();
  };

  // 2. Direct PDF Export Action
  const handleDownloadPDF = async () => {
    const docType = detectDocType();
    const check = canUserPrintDocuments(docType);
    if (!check.allowed) {
      setRestrictedDocType(docType);
      setIsPrintRestrictedModalOpen(true);
      return;
    }
    if (isExportingPDF) return;
    setIsExportingPDF(true);
    setExportSuccess(false);

    try {
      if (onCustomExportPDF) {
        await onCustomExportPDF();
      } else {
        const res = await generatePDFFileFromElement(elementId, filename, 'a4', true);
        if (res.file) {
          setGeneratedPdfFile(res.file);
        }
      }
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  // 3. Direct PNG Export Action
  const handleDownloadPNG = async () => {
    const docType = detectDocType();
    const check = canUserPrintDocuments(docType);
    if (!check.allowed) {
      setRestrictedDocType(docType);
      setIsPrintRestrictedModalOpen(true);
      return;
    }
    if (isExportingPNG) return;
    setIsExportingPNG(true);
    setExportSuccess(false);

    try {
      const pngFilename = filename.replace(/\.pdf$/i, '.png');
      await generatePNGFileFromElement(elementId, pngFilename, true);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to export PNG:', err);
    } finally {
      setIsExportingPNG(false);
    }
  };

  const getFormattedShareMessage = () => {
    const currentDateText = dateBS || new Date().toLocaleDateString('ne-NP');
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    return `卐 ॐ नमो भगवते वासुदेवाय। 卐

आदरणीय *${clientName}* ज्यू,
तपाईंको आधिकारिक *${reportTitle}* तयार भएको छ।

📅 *मिति:* वि.सं. ${currentDateText}
🏛️ *संस्था:* ${orgName || 'श्री वैदिक ज्योतिष तथा वास्तु परामर्श सेवा'}
📞 *सम्पर्क:* ${orgPhone || '+९७७-९७६४४००५३३'}
${customSummaryText ? `\n📌 *मुख्य फलादेश तथा पञ्चाङ्ग सारांश:*\n${customSummaryText}\n` : ''}
📄 तपाईंको आधिकारिक वैदिक प्रतिवेदन तयार छ।
🔗 अवलोकन गर्नुहोस्: ${currentUrl}

✨ *शुभम् भवतु! कल्याणम् अस्तु!* ✨`;
  };

  // 1. Direct WhatsApp Share without downloading
  const handleDirectWhatsApp = () => {
    const msg = getFormattedShareMessage();
    let digits = (clientPhone || '').replace(/[^0-9]/g, '');
    if (digits.startsWith('0')) digits = digits.slice(1);
    if (digits.length === 10 && (digits.startsWith('98') || digits.startsWith('97') || digits.startsWith('96'))) {
      digits = `977${digits}`;
    }
    const encoded = encodeURIComponent(msg);
    const url = digits
      ? `https://api.whatsapp.com/send?phone=${digits}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  };

  // 2. Direct Facebook Share without downloading
  const handleDirectFacebook = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const msg = getFormattedShareMessage();
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'width=620,height=540,scrollbars=yes');
  };

  // 3. Direct Messenger Share without downloading
  const handleDirectMessenger = async () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const msg = getFormattedShareMessage();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(msg);
      }
    } catch {}

    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `fb-messenger://share?link=${encodeURIComponent(currentUrl)}`;
      setTimeout(() => {
        window.open('https://www.messenger.com/', '_blank');
      }, 1500);
    } else {
      const messengerDialog = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(currentUrl)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(currentUrl)}`;
      const opened = window.open(messengerDialog, '_blank', 'width=620,height=540');
      if (!opened || opened.closed) {
        window.open('https://www.messenger.com/', '_blank');
      }
    }
  };

  // 4. Copy Text Only
  const handleCopyTextOnly = async () => {
    const msg = getFormattedShareMessage();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(msg);
      }
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch {}
  };

  // 5. Open Comprehensive Share Modal
  const handleOpenShare = async () => {
    setIsShareModalOpen(true);
  };

  // Common styling for buttons based on variant
  const isDark = variant === 'dark_header';

  return (
    <>
      <div className={`flex items-center gap-2 flex-wrap ${className}`}>
        {/* Success toast indicator */}
        {exportSuccess && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-xl font-semibold animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>कागजात तयार / कपी भयो!</span>
          </span>
        )}

        {/* 1. PRINT BUTTON */}
        <button
          type="button"
          onClick={handlePrint}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95 ${
            isDark
              ? 'bg-stone-800 hover:bg-stone-700 text-amber-200 border border-amber-500/30'
              : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700'
          }`}
          title="ब्राउजरबाट सिधै प्रिन्ट गर्नुहोस्"
        >
          <Printer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>प्रिन्ट</span>
        </button>

        {/* 2. UNIFIED DOWNLOAD DROPDOWN BUTTON (PDF & PNG) */}
        <div className="relative" ref={downloadMenuRef}>
          <button
            type="button"
            onClick={() => setIsDownloadOpen((prev) => !prev)}
            disabled={isExportingPDF || isExportingPNG}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed bg-[#D97706] hover:bg-[#b45309] text-white`}
            title="कागजात डाउनलोड गर्नुहोस् (PDF / PNG)"
          >
            {isExportingPDF || isExportingPNG ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 text-white" />
            )}
            <span>डाउनलोड</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isDownloadOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDownloadOpen && (
            <div className="absolute left-0 mt-1.5 w-32 bg-white dark:bg-stone-900 border border-amber-500/40 rounded-xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => {
                  setIsDownloadOpen(false);
                  handleDownloadPDF();
                }}
                disabled={isExportingPDF}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-800 hover:text-amber-700 dark:hover:text-amber-300 transition cursor-pointer text-left"
              >
                <FileDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>PDF</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDownloadOpen(false);
                  handleDownloadPNG();
                }}
                disabled={isExportingPNG}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-amber-50 dark:hover:bg-stone-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer text-left border-t border-stone-100 dark:border-stone-800"
              >
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>PNG</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. UNIFIED SHARE DROPDOWN BUTTON (WhatsApp, Facebook, Messenger) */}
        <div className="relative" ref={shareMenuRef}>
          <button
            type="button"
            onClick={() => setIsShareDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95 text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
            title="प्रतिवेदन सेयर गर्नुहोस् (WhatsApp, Facebook, Messenger)"
          >
            <Share2 className="w-3.5 h-3.5 text-white" />
            <span>सेयर</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isShareDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isShareDropdownOpen && (
            <div className="absolute right-0 sm:left-0 mt-1.5 w-52 bg-white dark:bg-stone-900 border border-indigo-500/40 rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans">
              <div className="px-3 py-1 text-[10px] font-bold text-stone-400 dark:text-stone-500 border-b border-stone-100 dark:border-stone-800 uppercase tracking-wider">
                सेयर गर्ने माध्यम छान्नुहोस्
              </div>

              {/* 1. WhatsApp */}
              <button
                type="button"
                onClick={() => {
                  setIsShareDropdownOpen(false);
                  handleDirectWhatsApp();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 transition cursor-pointer text-left"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <WhatsAppIcon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block leading-tight">WhatsApp</span>
                  <span className="text-[10px] font-normal text-stone-400">च्याट वा नम्बरमा पठाउनुहोस्</span>
                </div>
              </button>

              {/* 2. Facebook */}
              <button
                type="button"
                onClick={() => {
                  setIsShareDropdownOpen(false);
                  handleDirectFacebook();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-300 transition cursor-pointer text-left border-t border-stone-100 dark:border-stone-800"
              >
                <div className="w-6 h-6 rounded-lg bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FacebookIcon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block leading-tight">Facebook</span>
                  <span className="text-[10px] font-normal text-stone-400">टाइमलाइन वा ग्रुपमा सेयर</span>
                </div>
              </button>

              {/* 3. Messenger */}
              <button
                type="button"
                onClick={() => {
                  setIsShareDropdownOpen(false);
                  handleDirectMessenger();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300 transition cursor-pointer text-left border-t border-stone-100 dark:border-stone-800"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#00B2FF] via-[#006AFF] to-[#9900FF] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MessengerIcon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block leading-tight">Messenger</span>
                  <span className="text-[10px] font-normal text-stone-400">साथीहरूलाई सन्देश</span>
                </div>
              </button>

              {/* 4. Copy Text */}
              <button
                type="button"
                onClick={() => {
                  setIsShareDropdownOpen(false);
                  handleCopyTextOnly();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-stone-800 hover:text-amber-700 dark:hover:text-amber-300 transition cursor-pointer text-left border-t border-stone-100 dark:border-stone-800"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block leading-tight">सन्देश कपी गर्नुहोस्</span>
                  <span className="text-[10px] font-normal text-stone-400">क्लिपबोर्डमा सुरक्षित</span>
                </div>
              </button>

              {/* 5. More Options / Dialog */}
              <button
                type="button"
                onClick={() => {
                  setIsShareDropdownOpen(false);
                  setIsShareModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer text-left border-t border-stone-100 dark:border-stone-800"
              >
                <div className="w-6 h-6 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 flex items-center justify-center shrink-0">
                  <Share2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="block leading-tight">थप विकल्प / पूर्वावलोकन</span>
                  <span className="text-[10px] font-normal text-stone-400">नम्बर हाल्न तथा सम्पूर्ण विवरण</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Universal Share Interactive Modal */}
      {isShareModalOpen && (
        <UniversalShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          reportTitle={reportTitle}
          clientName={clientName}
          clientPhone={clientPhone}
          dateBS={dateBS}
          pdfFilename={filename}
          pdfFile={generatedPdfFile}
          onDownloadPDF={handleDownloadPDF}
          orgName={orgName}
          orgPhone={orgPhone}
          customSummaryText={customSummaryText}
        />
      )}

      {/* Trial Print Restriction Modal */}
      <TrialPrintRestrictionModal
        isOpen={isPrintRestrictedModalOpen}
        onClose={() => setIsPrintRestrictedModalOpen(false)}
        documentType={restrictedDocType}
        onOpenPurchase={() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('open-subscription-purchase-modal'));
          }
        }}
      />
    </>
  );
};
