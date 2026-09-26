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
import { WhatsAppShareModal } from './WhatsAppShareModal';
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
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [generatedPdfFile, setGeneratedPdfFile] = useState<File | null>(null);
  const [isPrintRestrictedModalOpen, setIsPrintRestrictedModalOpen] = useState(false);
  const [restrictedDocType, setRestrictedDocType] = useState<'kundali' | 'vastu' | 'general'>('general');

  const downloadMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(e.target as Node)) {
        setIsDownloadOpen(false);
      }
    };
    if (isDownloadOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDownloadOpen]);

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

  // 4. Direct Share / WhatsApp Action
  const handleOpenShare = async () => {
    // If we haven't generated the PDF file yet, silently generate in memory
    if (!generatedPdfFile) {
      try {
        const res = await generatePDFFileFromElement(elementId, filename, 'a4', false);
        if (res.file) {
          setGeneratedPdfFile(res.file);
        }
      } catch (err) {
        console.warn('Pre-generating PDF for share failed, will proceed with download on share', err);
      }
    }
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
            <span>कागजात तयार भयो!</span>
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

        {/* 3. SHARE PDF / WHATSAPP BUTTON */}
        <button
          type="button"
          onClick={handleOpenShare}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95 text-white bg-emerald-600 hover:bg-emerald-500`}
          title="WhatsApp वा अन्य माध्यमबाट सिधै PDF र सन्देश सेयर गर्नुहोस्"
        >
          <MessageCircle className="w-3.5 h-3.5 text-white" />
          <span>WhatsApp सेयर</span>
        </button>
      </div>

      {/* WhatsApp Share Interactive Modal */}
      {isShareModalOpen && (
        <WhatsAppShareModal
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
