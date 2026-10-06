import React, { useState, useRef } from 'react';
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
  Share2,
  Sparkles,
  Layers,
  ArrowDownToLine
} from 'lucide-react';
import { DigitalReligiousBook, BookChapter } from '../../data/books/bookTypes';
import { PrintableLetterheadBanner } from '../common/PrintableLetterheadBanner';
import { OrganizationProfile } from '../../types/astrology';
import { printElement } from '../../utils/pdfGenerator';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';

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

  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('all'); // default to 'all' so printing prints full book
  const [contentFilter, setContentFilter] = useState<'both' | 'nepali' | 'sanskrit'>('both');
  const [fontSize, setFontSize] = useState<number>(15); // in px
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeChapter: BookChapter = book.chapters[activeChapterIndex] || book.chapters[0];

  const handleCopyChapter = (chapter: BookChapter) => {
    const textToCopy = `॥ ${book.titleNepali} ॥\n${chapter.titleNepali}\n\n${chapter.contentSanskrit ? `[संस्कृत मन्त्र]\n${chapter.contentSanskrit}\n\n` : ''}[नेपाली टीका]\n${chapter.contentNepaliTika}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedKey(chapter.id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handlePrint = () => {
    // When printing, ensure viewMode is 'all' so full book is printed on letterhead
    setViewMode('all');
    setTimeout(() => {
      printElement('balananda-printable-book-document');
    }, 150);
  };

  // Filter chapters if searching
  const displayedChapters = searchQuery.trim()
    ? book.chapters.filter((ch) =>
        ch.titleNepali.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ch.titleSanskrit && ch.titleSanskrit.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ch.contentNepaliTika.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ch.contentSanskrit && ch.contentSanskrit.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : book.chapters;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
      <div className="bg-[#FFFDF7] dark:bg-[#1C1814] border-2 border-amber-500/50 dark:border-stone-700 rounded-2xl max-w-5xl w-full h-[95vh] flex flex-col shadow-2xl overflow-hidden relative text-[#2D241E] dark:text-stone-100">
        
        {/* Top Header / Action Bar */}
        <div className="px-4 py-3 bg-gradient-to-r from-[#8B1E0F] via-[#991B1B] to-[#78350F] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-xl shrink-0 font-bold text-amber-200">
              📚
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold bg-amber-400 text-stone-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  डिजिटल पुस्तक संस्करण
                </span>
                <span className="text-[11px] text-amber-200">
                  {book.categoryLabelNepali}
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
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
              title="PDF डाउनलोड वा प्रिन्ट गर्नुहोस्"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">PDF डाउनलोड / प्रिन्ट</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="बन्द गर्नुहोस्"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Control Sub-Bar: View mode, Chapter jump, Font size, Filter */}
        <div className="px-4 py-2.5 bg-[#FAF6EE] dark:bg-[#251F19] border-b border-[#E7DECD] dark:border-stone-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          
          {/* Chapter Selector & Search */}
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-[280px]">
            <div className="relative flex-1 min-w-[160px] max-w-[280px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="पुस्तकमा खोज्नुहोस्..."
                className="w-full pl-8 pr-3 py-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-colors cursor-pointer ${
                  viewMode === 'all'
                    ? 'bg-[#8B1E0F] text-white'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                }`}
              >
                सम्पूर्ण अध्याय ({toDevanagariNumerals(book.chapters.length)})
              </button>
              <button
                type="button"
                onClick={() => setViewMode('single')}
                className={`px-2.5 py-1 rounded-md font-bold text-[11px] transition-colors cursor-pointer ${
                  viewMode === 'single'
                    ? 'bg-[#8B1E0F] text-white'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700'
                }`}
              >
                एकल अध्याय
              </button>
            </div>
          </div>

          {/* Controls: Focus Filter & Font Sizing */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Filter buttons */}
            <div className="flex items-center bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setContentFilter('both')}
                className={`px-2 py-0.5 rounded font-medium cursor-pointer ${contentFilter === 'both' ? 'bg-amber-100 text-amber-900 font-bold dark:bg-amber-900/60 dark:text-amber-200' : 'text-stone-500'}`}
              >
                दुवै
              </button>
              <button
                type="button"
                onClick={() => setContentFilter('nepali')}
                className={`px-2 py-0.5 rounded font-medium cursor-pointer ${contentFilter === 'nepali' ? 'bg-amber-100 text-amber-900 font-bold dark:bg-amber-900/60 dark:text-amber-200' : 'text-stone-500'}`}
              >
                नेपाली टीका
              </button>
              <button
                type="button"
                onClick={() => setContentFilter('sanskrit')}
                className={`px-2 py-0.5 rounded font-medium cursor-pointer ${contentFilter === 'sanskrit' ? 'bg-amber-100 text-amber-900 font-bold dark:bg-amber-900/60 dark:text-amber-200' : 'text-stone-500'}`}
              >
                संस्कृत मन्त्र
              </button>
            </div>

            {/* Font size adjustments */}
            <div className="flex items-center gap-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg px-1.5 py-0.5">
              <button
                type="button"
                onClick={() => setFontSize((prev) => Math.max(13, prev - 1))}
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
                onClick={() => setFontSize((prev) => Math.min(22, prev + 1))}
                className="p-1 text-stone-600 hover:text-stone-900 dark:text-stone-300 cursor-pointer"
                title="अक्षर ठूलो बनाउनुहोस्"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Reader Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[#F4EFE6]/60 dark:bg-[#16120E] flex justify-center">
          
          {/* A4 PRINTABLE DOCUMENT WRAPPER */}
          <div
            id="balananda-printable-book-document"
            className="w-full max-w-4xl bg-white dark:bg-[#201A15] p-5 sm:p-10 rounded-2xl shadow-lg border border-[#E7DEC8] dark:border-stone-800 font-serif leading-relaxed text-[#1F1710] dark:text-[#EDE5DC] relative print:p-0 print:border-none print:shadow-none print:rounded-none"
            style={{ fontSize: `${fontSize}px` }}
          >
            {/* 1. Official Letterhead Banner at Top */}
            <div className="mb-6 border-b-2 border-[#8B1E0F]/40 pb-3">
              <PrintableLetterheadBanner
                orgProfile={orgProfile}
                compact={false}
                showEmblems={true}
                certificateBadgeText="प्रमाणित ग्रन्थ"
              />
            </div>

            {/* 2. Book Title & Publication Heading */}
            <div className="text-center my-6 pb-6 border-b border-amber-200 dark:border-stone-700/60">
              <div className="inline-block px-3 py-1 bg-[#FAF5ED] dark:bg-stone-800 border border-amber-300/80 rounded-full text-xs font-bold text-[#8B1E0F] dark:text-amber-300 mb-2 font-sans">
                ॥ श्रीहरिः ॐ ॥ वैदिक सनातन धर्म ग्रन्थालय विशेषाङ्क
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#8B1E0F] dark:text-amber-200 tracking-tight font-serif mt-1">
                {book.titleNepali}
              </h1>

              {book.titleSanskrit && (
                <p className="text-sm sm:text-base font-bold text-stone-600 dark:text-stone-300 mt-1 italic font-serif">
                  {book.titleSanskrit}
                </p>
              )}

              <p className="text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 mt-2 max-w-2xl mx-auto">
                {book.subtitleNepali}
              </p>

              {/* Publication Credits */}
              <div className="mt-4 pt-3 border-t border-dashed border-stone-200 dark:border-stone-700/50 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-stone-600 dark:text-stone-400 font-sans">
                <span><strong>मूल परम्परा:</strong> {book.authorOriginal}</span>
                <span>•</span>
                <span><strong>नेपाली टीका/सम्पादन:</strong> {book.translatorNepali}</span>
                <span>•</span>
                <span><strong>प्रकाशक:</strong> {book.publisher}</span>
                <span>•</span>
                <span><strong>संस्करण:</strong> {book.edition}</span>
                <span>•</span>
                <span><strong>मिति:</strong> {book.publishedDateBS}</span>
              </div>
            </div>

            {/* 3. Book Overview & Table of Contents (Printed on Page 1) */}
            <div className="mb-8 p-4 sm:p-5 bg-[#FAF7F0] dark:bg-stone-900/70 border border-amber-200/80 dark:border-stone-700 rounded-xl">
              <h3 className="text-sm font-bold text-[#8B1E0F] dark:text-amber-300 flex items-center gap-2 mb-2 font-sans">
                <span>📖</span>
                <span>पुस्तक सारांश एवं विषय सूची</span>
              </h3>
              <p className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 mb-3 font-sans">
                {book.descriptionNepali}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 border-t border-amber-200/60 dark:border-stone-800 text-xs">
                {book.tocNepali.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-stone-700 dark:text-stone-300 font-medium">
                    <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">❖</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Book Chapters Rendering */}
            <div className="space-y-8">
              {(viewMode === 'all' ? displayedChapters : [activeChapter]).map((chapter, idx) => (
                <article
                  key={chapter.id}
                  className="pt-4 border-t-2 border-amber-100 dark:border-stone-800/80 first:border-t-0 print:break-inside-avoid"
                >
                  {/* Chapter Header */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-[#8B1E0F] dark:text-amber-200 font-serif leading-tight">
                        {chapter.titleNepali}
                      </h2>
                      {chapter.titleSanskrit && (
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-400 font-serif mt-0.5">
                          {chapter.titleSanskrit}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyChapter(chapter)}
                      className="print:hidden p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors text-xs flex items-center gap-1 cursor-pointer shrink-0"
                      title="यो अध्याय प्रतिलिपि गर्नुहोस्"
                    >
                      {copiedKey === chapter.id ? (
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

                  {/* Sanskrit Section */}
                  {contentFilter !== 'nepali' && chapter.contentSanskrit && (
                    <div className="my-3 p-4 bg-[#FFF9EE] dark:bg-[#282119] border-l-4 border-amber-600 rounded-r-xl font-serif text-[#422006] dark:text-amber-100 leading-loose whitespace-pre-line tracking-wide">
                      <div className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest mb-1 font-sans flex items-center gap-1.5">
                        <span>🕉️</span>
                        <span>मूल संस्कृत मन्त्राः</span>
                      </div>
                      <div className="font-semibold">
                        {chapter.contentSanskrit}
                      </div>
                    </div>
                  )}

                  {/* Nepali Tika / Commentary */}
                  {contentFilter !== 'sanskrit' && (
                    <div className="my-3 p-4 bg-[#F8FAF7] dark:bg-[#1E231D] border-l-4 border-emerald-600 rounded-r-xl text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-line font-serif">
                      <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1 font-sans flex items-center gap-1.5">
                        <span>📖</span>
                        <span>प्रामाणिक नेपाली टीका एवं विधि</span>
                      </div>
                      <div>
                        {chapter.contentNepaliTika}
                      </div>
                    </div>
                  )}

                  {/* Special Notes */}
                  {chapter.notesNepali && (
                    <div className="my-2 px-3 py-1.5 bg-amber-50 dark:bg-stone-900/60 rounded-lg border border-amber-200/50 text-xs text-amber-900 dark:text-amber-200 font-sans italic">
                      <strong>💡 विशेष शास्त्रीय निर्देश:</strong> {chapter.notesNepali}
                    </div>
                  )}
                </article>
              ))}
            </div>

            {/* 5. Document Ending & Official Signature Seal */}
            <div className="mt-12 pt-6 border-t-2 border-[#8B1E0F]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-stone-600 dark:text-stone-400 print:break-inside-avoid">
              <div className="text-center sm:text-left">
                <p className="font-bold text-[#8B1E0F] dark:text-amber-300">
                  {orgProfile?.name || 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा'}
                </p>
                <p className="text-[10px] text-stone-500">
                  काठमाडौँ, नेपाल • फोन: {orgProfile?.phone || '+९७७-९७६४८४००५३३'} • दर्ता नं. १२३४/०८०
                </p>
                <p className="text-[9px] text-stone-400 mt-0.5">
                  प्रकाशित सामग्री केवल धर्म र वैदिक परम्परा संरक्षणका लागि हो।
                </p>
              </div>

              <div className="border border-dashed border-[#8B1E0F] rounded-xl px-4 py-2 text-center bg-[#FAF5ED] dark:bg-stone-900">
                <span className="text-[11px] font-bold text-[#8B1E0F] block">॥ शुभम् भूयात् ॥</span>
                <span className="text-[9px] text-stone-500">आधिकारिक डिजिटल प्रमाण-पत्र</span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Paging bar when in 'single' view mode */}
        {viewMode === 'single' && (
          <div className="px-4 py-2 bg-white dark:bg-[#1F1A15] border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
            <button
              type="button"
              disabled={activeChapterIndex <= 0}
              onClick={() => setActiveChapterIndex((prev) => Math.max(0, prev - 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 disabled:opacity-40 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>अघिल्लो अध्याय</span>
            </button>

            <span className="font-medium text-stone-600 dark:text-stone-400">
              अध्याय {toDevanagariNumerals(activeChapterIndex + 1)} / {toDevanagariNumerals(book.chapters.length)}
            </span>

            <button
              type="button"
              disabled={activeChapterIndex >= book.chapters.length - 1}
              onClick={() => setActiveChapterIndex((prev) => Math.min(book.chapters.length - 1, prev + 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 disabled:opacity-40 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold cursor-pointer"
            >
              <span>पछिल्लो अध्याय</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
