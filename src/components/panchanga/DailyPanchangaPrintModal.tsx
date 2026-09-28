import React, { useState, useRef, useEffect } from 'react';
import {
  Printer,
  FileDown,
  Download,
  ChevronDown,
  MessageCircle,
  X,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  Share2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { PanchangaData, OrganizationProfile } from '../../types/astrology';
import { BalanandaDailyPanchangaDocument } from './BalanandaDailyPanchangaDocument';
import { getDayDeityInfo } from '../../utils/deitySchedule';
import { sanitizeCloneForCanvas } from '../../utils/pdfGenerator';
import { WhatsAppIcon, FacebookIcon, MessengerIcon } from '../common/WhatsAppShareModal';

export interface DailyPanchangaPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  panchanga: PanchangaData;
  orgProfile?: Partial<OrganizationProfile>;
  todayBS?: string;
  todayAD?: string;
  locationName?: string;
  astrologerName?: string;
}

export const DailyPanchangaPrintModal: React.FC<DailyPanchangaPrintModalProps> = ({
  isOpen,
  onClose,
  panchanga,
  orgProfile,
  todayBS,
  todayAD,
  locationName = 'काठमाडौँ, नेपाल',
  astrologerName = 'ज्योतिषाचार्य सुकदेव शर्मा',
}) => {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingPNG, setIsExportingPNG] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(0.85);

  const documentWrapperRef = useRef<HTMLDivElement>(null);
  const downloadMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(e.target as Node)) {
        setIsDownloadOpen(false);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setIsShareOpen(false);
      }
    };
    if (isDownloadOpen || isShareOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDownloadOpen, isShareOpen]);

  if (!isOpen) return null;

  const dateBS = todayBS || panchanga.dateBS || '२०८१';
  const dateAD = todayAD || panchanga.dateAD || new Date().toISOString().split('T')[0];
  const dayDeity = getDayDeityInfo(panchanga.dayNameNepali, dateAD);
  const cleanDate = (todayBS || dateAD).replace(/[\s\/:]+/g, '_');

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // 1. Direct Single-Page Print
  const handlePrint = () => {
    const docEl = document.getElementById('balananda-single-page-panchanga');
    if (!docEl) {
      window.print();
      return;
    }

    // Create a dedicated printing iframe to ensure ONLY this 1 page prints cleanly
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const pri = iframe.contentWindow;
    if (!pri) {
      window.print();
      document.body.removeChild(iframe);
      return;
    }

    // Clone styles from head
    const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((tag) => tag.outerHTML)
      .join('\n');

    pri.document.open();
    pri.document.write(`
      <!DOCTYPE html>
      <html lang="ne">
        <head>
          <meta charset="utf-8" />
          <title>बालानन्द दैनिक पञ्चाङ्ग - ${dateBS}</title>
          ${styleTags}
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background-color: #FFFDF9 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
              overflow: hidden !important;
              width: 210mm !important;
              height: 297mm !important;
            }
            #balananda-single-page-panchanga {
              width: 210mm !important;
              max-width: 210mm !important;
              height: 296mm !important;
              max-height: 296mm !important;
              margin: 0 auto !important;
              box-shadow: none !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .no-print { display: none !important; }
          </style>
        </head>
        <body>
          ${docEl.outerHTML}
        </body>
      </html>
    `);
    pri.document.close();

    // Wait for styles and image to render in iframe, then trigger print
    setTimeout(() => {
      try {
        pri.focus();
        pri.print();
      } catch (err) {
        console.error('Print iframe failed, falling back to window.print():', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    }, 400);
  };

  // Helper to generate canvas from the 1-page document
  const generateDocumentCanvas = async () => {
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const [{ default: html2canvas }] = await Promise.all([import('html2canvas')]);
    const docEl = document.getElementById('balananda-single-page-panchanga');
    if (!docEl) throw new Error('Document element not found');

    return await html2canvas(docEl, {
      scale: 2, // High resolution for crisp Devanagari text and deity photo
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFDF9',
      windowWidth: 1200,
      onclone: (clonedDoc, clonedEl) => {
        // 1. Sanitize modern CSS colors (oklch) and parent layout transforms
        sanitizeCloneForCanvas(clonedDoc, clonedEl);

        // 2. Pre-inline all loaded images as local base64 data URLs to prevent canvas tainting or network CORS errors
        try {
          const originalImages = docEl.querySelectorAll<HTMLImageElement>('img');
          const clonedImages = clonedEl.querySelectorAll<HTMLImageElement>('img');
          clonedImages.forEach((clonedImg, idx) => {
            const origImg = originalImages[idx];
            if (origImg && origImg.complete && origImg.naturalWidth > 0) {
              try {
                const c = document.createElement('canvas');
                c.width = origImg.naturalWidth;
                c.height = origImg.naturalHeight;
                const ctx = c.getContext('2d');
                if (ctx) {
                  ctx.drawImage(origImg, 0, 0);
                  clonedImg.src = c.toDataURL('image/png');
                  clonedImg.removeAttribute('srcset');
                }
              } catch {
                clonedImg.crossOrigin = 'anonymous';
              }
            } else {
              clonedImg.crossOrigin = 'anonymous';
            }
          });
        } catch (imgErr) {
          console.warn('Image inlining error:', imgErr);
        }

        // 3. Ensure exact fixed dimensions in clone
        clonedEl.style.transform = 'none';
        clonedEl.style.boxShadow = 'none';
        clonedEl.style.margin = '0 auto';
        clonedEl.style.width = '210mm';
        clonedEl.style.height = '296mm';
        clonedEl.style.maxHeight = '296mm';
      },
    });
  };

  // 2. Download Single-Page A4 PDF
  const handleDownloadPDF = async () => {
    if (isExportingPDF) return;
    setIsExportingPDF(true);

    try {
      const [{ default: jsPDF }] = await Promise.all([import('jspdf')]);
      const canvas = await generateDocumentCanvas();

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.96);
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

      const fileName = `Balananda_Panchanga_${cleanDate}.pdf`;

      // Method 1: direct pdf.save
      try {
        pdf.save(fileName);
      } catch (saveErr) {
        console.warn('pdf.save direct error:', saveErr);
      }

      // Method 2: Blob anchor download fallback (guaranteed in all browsers / PWA / Electron)
      try {
        const blob = pdf.output('blob');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (document.body.contains(a)) document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 1500);
      } catch (blobErr) {
        console.warn('Blob anchor error:', blobErr);
      }

      showStatus('आधिकारिक PDF सफलतापूर्वक डाउनलोड भयो!');
    } catch (err: any) {
      console.error('Failed to export Panchanga PDF:', err);
      showStatus(`PDF डाउनलोड गर्दा त्रुटि भयो: ${err?.message || 'कृपया पुनः प्रयास गर्नुहोस्'}`, 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // 3. Download PNG Image File
  const handleDownloadPNG = async () => {
    if (isExportingPNG) return;
    setIsExportingPNG(true);

    try {
      const canvas = await generateDocumentCanvas();
      const fileName = `Balananda_Panchanga_${cleanDate}.png`;

      // Download via Blob or DataURL
      const triggerDownload = (url: string) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          if (document.body.contains(a)) document.body.removeChild(a);
          if (url.startsWith('blob:')) URL.revokeObjectURL(url);
        }, 1500);
      };

      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (blob) {
            triggerDownload(URL.createObjectURL(blob));
          } else {
            triggerDownload(canvas.toDataURL('image/png'));
          }
          showStatus('उच्च गुणस्तरको PNG तस्बिर सफलतापूर्वक डाउनलोड भयो!');
        }, 'image/png');
      } else {
        triggerDownload(canvas.toDataURL('image/png'));
        showStatus('उच्च गुणस्तरको PNG तस्बिर सफलतापूर्वक डाउनलोड भयो!');
      }
    } catch (err: any) {
      console.error('Failed to export PNG:', err);
      showStatus(`PNG तयार गर्दा त्रुटि भयो: ${err?.message || 'कृपया पुनः प्रयास गर्नुहोस्'}`, 'error');
    } finally {
      setIsExportingPNG(false);
    }
  };

  const getPanchangaShareText = () => {
    return `॥ बालानन्द दैनिक वैदिक पञ्चाङ्ग ॥\n📅 मिति: वि.सं. ${dateBS} (${dayDeity.dayNameNepali})\n🚩 आजका स्वामी: ${dayDeity.deityName} (${dayDeity.grahaLord})\n✨ आजको मन्त्र: ${dayDeity.bijaMantra}\n🌅 सूर्योदय: ${panchanga.sunrise} | 🌇 सूर्यास्त: ${panchanga.sunset}\n\n— ${orgProfile?.name || 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा'}\n🌐 ${typeof window !== 'undefined' ? window.location.href : 'https://suwashdmk.com'}`;
  };

  // 1. WhatsApp Share (NO AUTO DOWNLOAD)
  const handleShareWhatsApp = () => {
    const text = getPanchangaShareText();
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    showStatus('WhatsApp खुल्दैछ...');
  };

  // 2. Facebook Share (NO AUTO DOWNLOAD)
  const handleShareFacebook = () => {
    const text = getPanchangaShareText();
    const url = typeof window !== 'undefined' ? window.location.href : '';
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank', 'width=620,height=540');
    showStatus('Facebook संवाद खुल्दैछ...');
  };

  // 3. Messenger Share (NO AUTO DOWNLOAD)
  const handleShareMessenger = async () => {
    const text = getPanchangaShareText();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
    } catch {}
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `fb-messenger://share?link=${encodeURIComponent(url)}`;
    } else {
      window.open('https://www.messenger.com/', '_blank');
    }
    showStatus('पञ्चाङ्ग विवरण कपी भयो र Messenger खुल्दैछ!');
  };

  // 4. Copy Text
  const handleCopyShareText = async () => {
    const text = getPanchangaShareText();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        showStatus('पञ्चाङ्ग विवरण क्लिपबोर्डमा कपी भयो!');
      }
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-950/85 backdrop-blur-md overflow-hidden animate-fadeIn select-none">
      {/* ===================================================================== */}
      {/* TOP MODAL HEADER & ACTION TOOLBAR (no-print)                           */}
      {/* ===================================================================== */}
      <header className="no-print bg-[#1c1917] text-white border-b border-stone-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md shrink-0">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-stone-950 flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            ॐ
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-extrabold text-amber-300 font-serif">
                बालानन्द दैनिक पञ्चाङ्ग (लेटरहेड)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                A4 साइज (No Overflow)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-950/80 text-rose-300 border border-rose-800/40">
                {dayDeity.dayNameNepali}: {dayDeity.deityName.split(' ')[1] || dayDeity.deityName}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              ॐ को बोर्डर • बालानन्द लेटरहेड • बार स्वामी भगवान्‌को तस्बिर • शुद्ध वैदिक पञ्चाङ्ग
            </p>
          </div>
        </div>

        {/* Center: Status Toast */}
        {statusMessage && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold animate-fade-in ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'bg-rose-950 text-rose-300 border border-rose-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Right: Actions (Print, PDF, WhatsApp PNG, Download PNG, Close) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Zoom Controls for Preview */}
          <div className="hidden md:flex items-center bg-stone-800 px-2 py-1 rounded-xl border border-stone-700 text-xs text-stone-300 gap-1.5 mr-1">
            <button
              onClick={() => setPreviewZoom((z) => Math.max(0.5, z - 0.1))}
              className="p-1 hover:text-white cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] min-w-[36px] text-center">
              {Math.round(previewZoom * 100)}%
            </span>
            <button
              onClick={() => setPreviewZoom((z) => Math.min(1.2, z + 0.1))}
              className="p-1 hover:text-white cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 1. DIRECT PRINT BUTTON */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-[#8B1E0F] hover:bg-[#6D160A] text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95 border border-amber-500/40"
            title="A4 मा सिधै प्रिन्ट गर्नुहोस्"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>प्रिन्ट</span>
          </button>

          {/* 2. UNIFIED DOWNLOAD DROPDOWN BUTTON (PDF & PNG) */}
          <div className="relative" ref={downloadMenuRef}>
            <button
              type="button"
              onClick={() => setIsDownloadOpen((prev) => !prev)}
              disabled={isExportingPDF || isExportingPNG}
              className="flex items-center gap-1.5 bg-[#D97706] hover:bg-[#B45309] text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-60"
              title="कागजात डाउनलोड गर्नुहोस् (PDF / PNG)"
            >
              {isExportingPDF || isExportingPNG ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Download className="w-4 h-4 text-white" />
              )}
              <span>डाउनलोड</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isDownloadOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown containing only PDF and PNG */}
            {isDownloadOpen && (
              <div className="absolute right-0 mt-1.5 w-36 bg-stone-900 border border-amber-500/40 rounded-xl shadow-2xl py-1 z-50 text-white animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsDownloadOpen(false);
                    handleDownloadPDF();
                  }}
                  disabled={isExportingPDF}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold hover:bg-stone-800 text-stone-200 hover:text-amber-300 transition cursor-pointer text-left"
                >
                  <FileDown className="w-4 h-4 text-amber-400" />
                  <span>PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsDownloadOpen(false);
                    handleDownloadPNG();
                  }}
                  disabled={isExportingPNG}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold hover:bg-stone-800 text-stone-200 hover:text-emerald-400 transition cursor-pointer text-left border-t border-stone-800"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span>PNG</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. UNIFIED SHARE DROPDOWN BUTTON (WhatsApp, Facebook, Messenger, Copy) */}
          <div className="relative" ref={shareMenuRef}>
            <button
              type="button"
              onClick={() => setIsShareOpen((prev) => !prev)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
              title="सामाजिक सञ्जालमा सेयर गर्नुहोस्"
            >
              <Share2 className="w-4 h-4 text-white" />
              <span>सेयर</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${isShareOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown containing WhatsApp, Facebook, Messenger, and Copy */}
            {isShareOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-stone-900 border border-emerald-500/40 rounded-xl shadow-2xl py-1 z-50 text-white animate-in fade-in zoom-in-95 duration-100 divide-y divide-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsShareOpen(false);
                    handleShareWhatsApp();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-stone-800 text-stone-200 hover:text-emerald-400 transition cursor-pointer text-left"
                >
                  <WhatsAppIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsShareOpen(false);
                    handleShareFacebook();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-stone-800 text-stone-200 hover:text-blue-400 transition cursor-pointer text-left"
                >
                  <FacebookIcon className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Facebook</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsShareOpen(false);
                    handleShareMessenger();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-stone-800 text-stone-200 hover:text-sky-400 transition cursor-pointer text-left"
                >
                  <MessengerIcon className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Messenger</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsShareOpen(false);
                    handleCopyShareText();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold hover:bg-stone-800 text-stone-200 hover:text-amber-300 transition cursor-pointer text-left"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>सन्देश कपी गर्नुहोस्</span>
                </button>
              </div>
            )}
          </div>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-all cursor-pointer ml-1"
            title="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* MODAL MAIN BODY: LIVE DOCUMENT PREVIEW (Interactive & Centered)       */}
      {/* ===================================================================== */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-start justify-center bg-stone-900/60">
        <div
          ref={documentWrapperRef}
          style={{
            transform: `scale(${previewZoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="my-2"
        >
          <BalanandaDailyPanchangaDocument
            panchanga={panchanga}
            orgProfile={orgProfile}
            todayBS={todayBS}
            todayAD={todayAD}
            locationName={locationName}
            astrologerName={astrologerName}
          />
        </div>
      </div>
    </div>
  );
};
