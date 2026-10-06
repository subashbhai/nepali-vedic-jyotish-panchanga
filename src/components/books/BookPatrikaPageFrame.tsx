import React from 'react';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';

interface BookPatrikaPageFrameProps {
  pageNumber: number;
  totalPages: number;
  bookTitle: string;
  chapterTitleNepali?: string;
  chapterTitleSanskrit?: string;
  sanskritContent?: string;
  nepaliTikaContent?: string;
  notesNepali?: string;
  isCoverPage?: boolean;
  children?: React.ReactNode;
  fontSize?: number;
}

/**
 * Authentic Patrika-Style Page Border Frame (Green ॐ Repeating Border)
 * Matches the classic Balananda Patrika / Cheena layout:
 * - Outer Green Border (#166534)
 * - Channel of repeating green ॐ characters (#166534)
 * - Inner Green Border (#166534)
 * - Top Half (५०%): मूल संस्कृत मन्त्र / श्लोक
 * - Classical Divider: ❖ ════ ॐ ════ ❖
 * - Bottom Half (५०%): प्रामाणिक नेपाली टीका एवं विधि
 * - Standard A4 dimensions for perfect PDF export & print
 */
export const BookPatrikaPageFrame: React.FC<BookPatrikaPageFrameProps> = ({
  pageNumber,
  totalPages,
  bookTitle,
  chapterTitleNepali,
  chapterTitleSanskrit,
  sanskritContent,
  nepaliTikaContent,
  notesNepali,
  isCoverPage = false,
  children,
  fontSize = 14
}) => {
  const omArrayHeader = Array.from({ length: 22 });
  const omArraySide = Array.from({ length: 32 });

  return (
    <div
      className="book-patrika-page print-page printable-page relative w-full bg-white text-stone-900 border-2 border-[#166534] p-1.5 sm:p-2.5 my-6 print:my-0 font-serif shadow-xl print:shadow-none box-border flex flex-col justify-between overflow-hidden transition-all"
      style={{
        width: '210mm',
        minHeight: '297mm',
        maxHeight: '297mm',
        maxWidth: '210mm',
        margin: '0 auto 24px auto',
        boxSizing: 'border-box',
        pageBreakAfter: 'always',
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
        breakAfter: 'page',
        backgroundColor: '#ffffff',
      }}
    >
      {/* 1. Outer Om Top Row */}
      <div className="flex justify-between items-center text-[#166534] text-xs sm:text-sm font-black px-1 select-none overflow-hidden h-5 leading-none shrink-0">
        {omArrayHeader.map((_, i) => (
          <span key={i} className="mx-auto font-black scale-110">ॐ</span>
        ))}
      </div>

      {/* 2. Middle Area (Side Om Columns + Inner Content Box) */}
      <div className="flex flex-1 my-0.5 min-h-0">
        {/* Left Om Column */}
        <div className="flex flex-col justify-between items-center text-[#166534] text-xs sm:text-sm font-black py-0.5 pr-1 select-none w-5 leading-none shrink-0">
          {omArraySide.map((_, i) => (
            <span key={i} className="font-black scale-110">ॐ</span>
          ))}
        </div>

        {/* Inner Border Box */}
        <div className="flex-1 border-2 border-[#166534] p-3 sm:p-4 bg-white flex flex-col justify-between shadow-2xs overflow-hidden">
          
          {/* Header Bar */}
          <div className="pb-2 border-b-2 border-[#166534]/50 flex items-center justify-between text-xs text-[#166534] shrink-0 font-sans">
            <div className="flex items-center gap-1.5 font-bold">
              <span>卐</span>
              <span className="truncate max-w-[280px] sm:max-w-md font-serif text-[#166534]">
                {bookTitle}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono font-bold text-[11px] text-[#166534]">
              {chapterTitleNepali && (
                <span className="hidden sm:inline text-stone-600 font-sans font-medium truncate max-w-[180px]">
                  {chapterTitleNepali}
                </span>
              )}
              <span className="bg-[#166534]/10 text-[#166534] px-2 py-0.5 rounded border border-[#166534]/30">
                पृष्ठ: {toDevanagariNumerals(pageNumber)}
              </span>
            </div>
          </div>

          {/* Main Body */}
          {children ? (
            <div className="flex-1 my-2 overflow-y-auto">
              {children}
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between my-2 min-h-0 overflow-hidden">
              
              {/* Optional Chapter Title Display */}
              {chapterTitleNepali && (
                <div className="mb-2 text-center shrink-0">
                  <h3 className="text-base sm:text-lg font-black text-[#8B1E0F] font-serif leading-tight">
                    {chapterTitleNepali}
                  </h3>
                  {chapterTitleSanskrit && (
                    <p className="text-xs font-bold text-amber-800 italic font-serif">
                      {chapterTitleSanskrit}
                    </p>
                  )}
                </div>
              )}

              {/* Upper Section: आधा पेज मूल संस्कृत मन्त्राः / श्लोकाः */}
              <div 
                className={`flex-1 rounded-lg border border-amber-300/80 bg-[#FFFDF5] p-3 overflow-y-auto font-serif leading-relaxed text-[#3B1E08] shadow-2xs ${
                  nepaliTikaContent ? 'max-h-[48%]' : 'max-h-full'
                }`}
                style={{ fontSize: `${fontSize}px` }}
              >
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-amber-200 text-[11px] font-bold text-amber-900 font-sans select-none">
                  <span className="flex items-center gap-1">
                    <span>🕉️</span>
                    <span>मूल संस्कृत मन्त्र / श्लोक</span>
                  </span>
                  <span className="text-[10px] text-amber-700 bg-amber-100/60 px-1.5 py-0.5 rounded border border-amber-300/50">
                    सस्वर देवनागरी पाठ
                  </span>
                </div>
                <div className="font-semibold whitespace-pre-line tracking-wide">
                  {sanskritContent || '—'}
                </div>
              </div>

              {/* Classical Ornamental Divider Line */}
              {nepaliTikaContent && (
                <div className="my-1.5 flex items-center justify-center gap-2 text-[#166534] text-xs font-bold select-none shrink-0">
                  <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#166534]/50 to-transparent"></span>
                  <span className="text-[11px] font-black tracking-widest text-[#166534]">
                    ❖ ════ ॐ श्रीहरिः ॐ ════ ❖
                  </span>
                  <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#166534]/50 to-transparent"></span>
                </div>
              )}

              {/* Lower Section: आधा पेज प्रामाणिक नेपाली टीका एवं विधि */}
              {nepaliTikaContent && (
                <div 
                  className={`flex-1 rounded-lg border border-emerald-300/80 bg-[#F9FCF8] p-3 overflow-y-auto font-serif leading-relaxed text-stone-800 shadow-2xs ${
                    sanskritContent ? 'max-h-[48%]' : 'max-h-full'
                  }`}
                  style={{ fontSize: `${fontSize - 1}px` }}
                >
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-emerald-200 text-[11px] font-bold text-emerald-900 font-sans select-none">
                    <span className="flex items-center gap-1">
                      <span>📖</span>
                      <span>प्रामाणिक नेपाली टीका एवं शास्त्रीय विधि</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded border border-emerald-300/50">
                      नेपाली रूपान्तरण
                    </span>
                  </div>
                  <div className="whitespace-pre-line">
                    {nepaliTikaContent}
                  </div>
                </div>
              )}

              {/* Notes if any */}
              {notesNepali && (
                <div className="mt-1.5 px-2 py-1 bg-amber-50 rounded border border-amber-200 text-[10.5px] text-amber-900 flex items-center gap-1 shrink-0 font-sans">
                  <span className="font-bold">💡 निर्देश:</span>
                  <span>{notesNepali}</span>
                </div>
              )}
            </div>
          )}

          {/* Footer Bar */}
          <div className="pt-2 border-t-2 border-[#166534]/50 flex items-center justify-between text-[10.5px] text-[#166534] shrink-0 font-sans">
            <span className="font-bold">
              बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा
            </span>
            <span className="hidden sm:inline text-stone-500 italic">
              डिजिटल धार्मिक पुस्तकालय
            </span>
            <span className="font-mono font-bold">
              पृष्ठ {toDevanagariNumerals(pageNumber)} / {toDevanagariNumerals(totalPages)}
            </span>
          </div>

        </div>

        {/* Right Om Column */}
        <div className="flex flex-col justify-between items-center text-[#166534] text-xs sm:text-sm font-black py-0.5 pl-1 select-none w-5 leading-none shrink-0">
          {omArraySide.map((_, i) => (
            <span key={i} className="font-black scale-110">ॐ</span>
          ))}
        </div>
      </div>

      {/* 3. Outer Om Bottom Row */}
      <div className="flex justify-between items-center text-[#166534] text-xs sm:text-sm font-black px-1 select-none overflow-hidden h-5 leading-none shrink-0">
        {omArrayHeader.map((_, i) => (
          <span key={i} className="mx-auto font-black scale-110">ॐ</span>
        ))}
      </div>
    </div>
  );
};
