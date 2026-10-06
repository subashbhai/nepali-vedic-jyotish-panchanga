import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  BookOpen,
  Copy,
  Check,
  Search,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  Layers,
  Sparkles
} from 'lucide-react';
import { DigitalReligiousBook } from '../../data/books/bookTypes';
import { PrintableLetterheadBanner } from '../common/PrintableLetterheadBanner';
import { OrganizationProfile } from '../../types/astrology';
import { printElement } from '../../utils/pdfGenerator';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';
import { BookPatrikaPageFrame } from './BookPatrikaPageFrame';
import { paginateBookIntoPages, PaginatedBookPage } from './bookPaginator';
import { handlePhoneticInputKeyDown, handlePhoneticBlur } from '../../utils/nepaliTransliteration';

interface BookReaderModalProps {
  book: DigitalReligiousBook | null;
  isOpen: boolean;
  onClose: () => void;
  orgProfile?: OrganizationProfile;
}

export const BookReaderModal: React.FC<BookReaderModalProps> = ({
  book,
  isOpen,
  onClose,
  orgProfile
}) => {
  if (!isOpen || !book) return null;

  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'all' | 'single'>('all'); // default to 'all' for complete reading & printing
  const [fontSize, setFontSize] = useState<number>(14); // in px
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Paginate the book into Patrika-bordered pages (top half Sanskrit, bottom half Nepali)
  const paginatedPages = useMemo(() => {
    return paginateBookIntoPages(book);
  }, [book]);

  const activePage: PaginatedBookPage = paginatedPages[activePageIndex] || paginatedPages[0];

  const handleCopyPage = (page: PaginatedBookPage) => {
    const textToCopy = `॥ ${book.titleNepali} ॥\n${page.chapterTitleNepali}\n(पृष्ठ ${toDevanagariNumerals(page.pageNumber)})\n\n${
      page.sanskritContent ? `[मूल संस्कृत मन्त्र]\n${page.sanskritContent}\n\n` : ''
    }${page.nepaliTikaContent ? `[नेपाली टीका एवं विधि]\n${page.nepaliTikaContent}` : ''}`;
    
    navigator.clipboard.writeText(textToCopy);
    setCopiedKey(`page-${page.pageNumber}`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handlePrint = () => {
    // Switch to 'all' mode and trigger print after render
    setViewMode('all');
    setTimeout(() => {
      printElement('balananda-printable-book-document');
    }, 150);
  };

  // Filter pages if search query is entered
  const displayedPages = useMemo(() => {
    if (!searchQuery.trim()) return paginatedPages;
    const q = searchQuery.toLowerCase();
    return paginatedPages.filter(
      (p) =>
        p.chapterTitleNepali.toLowerCase().includes(q) ||
        (p.chapterTitleSanskrit && p.chapterTitleSanskrit.toLowerCase().includes(q)) ||
        (p.sanskritContent && p.sanskritContent.toLowerCase().includes(q)) ||
        (p.nepaliTikaContent && p.nepaliTikaContent.toLowerCase().includes(q))
    );
  }, [paginatedPages, searchQuery]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
      <div className="bg-[#FFFDF7] dark:bg-[#1C1814] border-2 border-[#166534] rounded-2xl max-w-6xl w-full h-[96vh] flex flex-col shadow-2xl overflow-hidden relative text-[#2D241E] dark:text-stone-100">
        
        {/* Top Header / Action Bar */}
        <div className="px-4 py-3 bg-gradient-to-r from-[#14532D] via-[#166534] to-[#15803D] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-xl shrink-0 font-bold text-amber-200">
              📚
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold bg-amber-400 text-stone-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  पत्रिका शैली डिजिटल पुस्तक
                </span>
                <span className="text-[11px] text-emerald-100 font-mono">
                  जम्मा {toDevanagariNumerals(paginatedPages.length)} पृष्ठहरू
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold font-serif text-white truncate leading-tight mt-0.5">
                {book.titleNepali}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Print / Download Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-900 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              title="A4 पत्रिका ढाँचामा PDF डाउनलोड वा प्रिन्ट गर्नुहोस्"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">PDF डाउनलोड / प्रिन्ट</span>
              <span className="sm:hidden">डाउनलोड</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="बन्द गर्नुहोस्"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Header / Tool Controls */}
        <div className="px-4 py-2 bg-[#F3EFE6] dark:bg-[#231D18] border-b border-[#166534]/30 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0 font-sans">
          
          {/* View Mode Toggle: All Pages vs Single Page */}
          <div className="flex items-center gap-1 bg-white dark:bg-stone-800 p-1 rounded-xl border border-stone-300 dark:border-stone-700">
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'all'
                  ? 'bg-[#166534] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-300'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>सम्पूर्ण पृष्ठहरू ({toDevanagariNumerals(paginatedPages.length)})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'single'
                  ? 'bg-[#166534] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-300'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>एक-एक पृष्ठ हेर्नुहोस्</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-xs min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => handlePhoneticInputKeyDown(e, searchQuery, setSearchQuery)}
              onBlur={() => handlePhoneticBlur(searchQuery, setSearchQuery)}
              placeholder="मन्त्र वा व्याख्या खोज्नुहोस्..."
              className="w-full pl-8 pr-3 py-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs focus:outline-none focus:border-[#166534]"
            />
          </div>

          {/* Page Navigator (Single mode) + Font Size Controls */}
          <div className="flex items-center gap-2">
            {viewMode === 'single' && (
              <div className="flex items-center gap-1 bg-white dark:bg-stone-800 px-2 py-0.5 rounded-xl border border-stone-300 dark:border-stone-700">
                <button
                  type="button"
                  disabled={activePageIndex === 0}
                  onClick={() => setActivePageIndex((p) => Math.max(0, p - 1))}
                  className="p-1 text-stone-600 disabled:opacity-30 hover:text-stone-900 cursor-pointer"
                  title="अघिल्लो पृष्ठ"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono font-bold text-[#166534] px-1">
                  पृष्ठ {toDevanagariNumerals(activePageIndex + 1)} / {toDevanagariNumerals(paginatedPages.length)}
                </span>
                <button
                  type="button"
                  disabled={activePageIndex === paginatedPages.length - 1}
                  onClick={() => setActivePageIndex((p) => Math.min(paginatedPages.length - 1, p + 1))}
                  className="p-1 text-stone-600 disabled:opacity-30 hover:text-stone-900 cursor-pointer"
                  title="पछिल्लो पृष्ठ"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Font Size Zoom */}
            <div className="flex items-center gap-1 bg-white dark:bg-stone-800 p-0.5 rounded-xl border border-stone-300 dark:border-stone-700">
              <button
                type="button"
                onClick={() => setFontSize((prev) => Math.max(12, prev - 1))}
                className="p-1 text-stone-600 hover:text-stone-900 dark:text-stone-300 cursor-pointer"
                title="अक्षर सानो बनाउनुहोस्"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono font-bold text-stone-500 px-1">
                {fontSize}px
              </span>
              <button
                type="button"
                onClick={() => setFontSize((prev) => Math.min(18, prev + 1))}
                className="p-1 text-stone-600 hover:text-stone-900 dark:text-stone-300 cursor-pointer"
                title="अक्षर ठूलो बनाउनुहोस्"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Reader Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[#ECE5D8] dark:bg-[#120F0C] flex justify-center">
          
          {/* WRAPPER PRINTED BY PDF GENERATOR */}
          <div
            id="balananda-printable-book-document"
            className="w-full flex flex-col items-center"
          >
            {(viewMode === 'all' ? displayedPages : [activePage]).map((page) => {
              if (page.isCoverPage) {
                // PAGE 1: TITLE & COVER WITH OFFICIAL LETTERHEAD BANNER
                return (
                  <BookPatrikaPageFrame
                    key="cover-page-1"
                    pageNumber={1}
                    totalPages={paginatedPages.length}
                    bookTitle={book.titleNepali}
                    isCoverPage={true}
                    fontSize={fontSize}
                  >
                    <div className="flex flex-col justify-between h-full text-center py-2">
                      {/* Top Letterhead */}
                      <div className="border-b-2 border-[#166534]/40 pb-2">
                        <PrintableLetterheadBanner
                          orgProfile={orgProfile}
                          compact={true}
                          showEmblems={true}
                          certificateBadgeText="प्रमाणित धार्मिक ग्रन्थ"
                        />
                      </div>

                      {/* Main Title & Subtitle */}
                      <div className="my-auto py-4">
                        <div className="inline-block px-3 py-1 bg-[#166534]/10 border border-[#166534]/30 rounded-full text-xs font-bold text-[#166534] mb-2 font-sans">
                          ॥ श्रीहरिः ॐ ॥ डिजिटल वैदिक पुस्तकालय विशेषाङ्क
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-black text-[#8B1E0F] tracking-tight font-serif mt-1">
                          {book.titleNepali}
                        </h1>

                        {book.titleSanskrit && (
                          <p className="text-sm sm:text-base font-bold text-amber-900 mt-1 italic font-serif">
                            {book.titleSanskrit}
                          </p>
                        )}

                        <p className="text-xs sm:text-sm font-medium text-stone-700 mt-2 max-w-xl mx-auto leading-relaxed">
                          {book.subtitleNepali}
                        </p>

                        {/* Credits */}
                        <div className="mt-4 pt-3 border-t border-dashed border-stone-300 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-stone-700 font-sans">
                          <span><strong>मूल परम्परा:</strong> {book.authorOriginal}</span>
                          <span>•</span>
                          <span><strong>नेपाली रूपान्तरण:</strong> {book.translatorNepali}</span>
                          <span>•</span>
                          <span><strong>प्रकाशक:</strong> {book.publisher}</span>
                          <span>•</span>
                          <span><strong>संस्करण:</strong> {book.edition}</span>
                        </div>
                      </div>

                      {/* Table of Contents */}
                      <div className="mt-2 p-3 bg-stone-50 border border-stone-200 rounded-lg text-left">
                        <h4 className="text-xs font-bold text-[#166534] uppercase tracking-wider mb-1.5 flex items-center gap-1 font-sans">
                          <span>📖</span>
                          <span>विषय सूची (अध्याय विवरण)</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-stone-800">
                          {book.tocNepali.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-1 font-medium">
                              <span className="text-[#166534] font-bold">❖</span>
                              <span className="truncate">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </BookPatrikaPageFrame>
                );
              }

              // CONTENT PAGES: Top Half Sanskrit, Bottom Half Nepali Tika
              return (
                <div key={`page-${page.pageNumber}`} className="relative w-full flex justify-center">
                  <BookPatrikaPageFrame
                    pageNumber={page.pageNumber}
                    totalPages={paginatedPages.length}
                    bookTitle={book.titleNepali}
                    chapterTitleNepali={page.chapterTitleNepali}
                    chapterTitleSanskrit={page.chapterTitleSanskrit}
                    sanskritContent={page.sanskritContent}
                    nepaliTikaContent={page.nepaliTikaContent}
                    notesNepali={page.notesNepali}
                    fontSize={fontSize}
                  />

                  {/* Copy Button for current page */}
                  <button
                    type="button"
                    onClick={() => handleCopyPage(page)}
                    className="print:hidden absolute right-4 top-4 p-1.5 rounded-lg bg-white/80 hover:bg-white text-stone-700 shadow-sm border border-stone-200 text-xs flex items-center gap-1 cursor-pointer z-10"
                    title="यो पृष्ठ प्रतिलिपि गर्नुहोस्"
                  >
                    {copiedKey === `page-${page.pageNumber}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[10px] font-bold text-emerald-600">प्रतिलिपि भयो</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[10px]">प्रतिलिपि</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};
