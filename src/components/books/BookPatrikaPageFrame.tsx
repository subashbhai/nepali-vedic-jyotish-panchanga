import React from 'react';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';
import { PrintableLetterheadBanner } from '../common/PrintableLetterheadBanner';
import { OrganizationProfile } from '../../types/astrology';

interface BookPatrikaPageFrameProps {
  pageNumber: number;
  totalPages: number;
  bookTitle: string;
  chapterTitleNepali?: string;
  chapterTitleSanskrit?: string;
  sanskritContent?: string;
  nepaliTikaContent?: string;
  notesNepali?: string;
  isFirstPage?: boolean;
  isLastPage?: boolean;
  children?: React.ReactNode;
  fontSize?: number;
  orgProfile?: OrganizationProfile;
}

/**
 * Authentic Patrika-Style Page Border Frame (Green ॐ Repeating Border)
 * 
 * Rules requested by User:
 * 1. First Page: Shows the full Balananda Letterhead Header.
 * 2. Last Page: Shows the Balananda Official Publisher Footer.
 * 3. Intermediate Pages: No repetitive heavy header/footer! Full page utilized for reading.
 * 4. If No Sanskrit: Full page filled with Nepali text (no empty half-page).
 * 5. If Sanskrit Present: Page filled with top half Sanskrit and bottom half Nepali Tika.
 * 6. Authentic Patrika Om repeating frame on standard A4 dimensions.
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
  isFirstPage = false,
  isLastPage = false,
  children,
  fontSize = 14,
  orgProfile
}) => {
  const omArrayHeader = Array.from({ length: 22 });
  const omArraySide = Array.from({ length: 32 });

  const hasSanskrit = Boolean(sanskritContent && sanskritContent.trim().length > 0);
  const hasNepali = Boolean(nepaliTikaContent && nepaliTikaContent.trim().length > 0);

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
          
          {/* ========================================================
              TOP HEADER LOGIC:
              - First Page (pageNumber === 1): Shows full Letterhead Banner
              - Other Pages: Minimal running header line only
             ======================================================== */}
          {isFirstPage ? (
            <div className="border-b-2 border-[#166534]/50 pb-2 mb-2 shrink-0">
              <PrintableLetterheadBanner
                orgProfile={orgProfile}
                compact={true}
                showEmblems={true}
                certificateBadgeText="प्रमाणित धार्मिक ग्रन्थ"
              />
            </div>
          ) : (
            <div className="pb-1.5 mb-2 border-b border-[#166534]/40 flex items-center justify-between text-xs text-[#166534] shrink-0 font-sans">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-[#166534]">卐</span>
                <span className="truncate max-w-[260px] sm:max-w-md font-serif text-[#166534]">
                  {bookTitle}
                </span>
                {chapterTitleNepali && (
                  <span className="hidden sm:inline text-stone-600 font-sans font-medium truncate max-w-[220px]">
                    • {chapterTitleNepali}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 font-mono font-bold text-[11px] text-[#166534]">
                <span className="bg-[#166534]/10 text-[#166534] px-2 py-0.5 rounded border border-[#166534]/30">
                  पृष्ठ {toDevanagariNumerals(pageNumber)}
                </span>
              </div>
            </div>
          )}

          {/* ========================================================
              MAIN BODY CONTENT:
              - If children provided (e.g. Cover table of contents), render children.
              - Else if No Sanskrit: Full page filled with Nepali text (100% height).
              - Else if Sanskrit present: Top half Sanskrit, Bottom half Nepali Tika.
             ======================================================== */}
          {children ? (
            <div className="flex-1 my-1 overflow-y-auto min-h-0">
              {children}
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between my-1 min-h-0 overflow-hidden">
              
              {/* Optional Chapter Title Display */}
              {chapterTitleNepali && !isFirstPage && (
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

              {/* 1. SCENARIO A: NO SANSKRIT -> FULL PAGE FILLED WITH NEPALI */}
              {!hasSanskrit && hasNepali && (
                <div 
                  className="flex-1 rounded-lg border border-emerald-300/80 bg-[#F9FCF8] p-4 overflow-y-auto font-serif leading-relaxed text-stone-800 shadow-2xs max-h-full"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-emerald-200 text-xs font-bold text-emerald-900 font-sans select-none">
                    <span className="flex items-center gap-1.5">
                      <span>📖</span>
                      <span>प्रामाणिक शास्त्रीय विधि एवं नेपाली व्याख्या</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded border border-emerald-300/50">
                      सम्पूर्ण नेपाली पाठ
                    </span>
                  </div>
                  <div className="whitespace-pre-line leading-relaxed">
                    {nepaliTikaContent}
                  </div>
                </div>
              )}

              {/* 2. SCENARIO B: SANSKRIT PRESENT -> TOP HALF SANSKRIT + BOTTOM HALF TIKA */}
              {hasSanskrit && (
                <>
                  {/* Upper Section: आधा पेज मूल संस्कृत मन्त्राः / श्लोकाः */}
                  <div 
                    className={`flex-1 rounded-lg border border-amber-300/80 bg-[#FFFDF5] p-3 overflow-y-auto font-serif leading-relaxed text-[#3B1E08] shadow-2xs ${
                      hasNepali ? 'max-h-[48%]' : 'max-h-full'
                    }`}
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-amber-200 text-[11px] font-bold text-amber-900 font-sans select-none">
                      <span className="flex items-center gap-1">
                        <span>🕉️</span>
                        <span>मूल संस्कृत मन्त्र / श्लोक</span>
                      </span>
                      <span className="text-[10px] text-amber-700 bg-amber-100/60 px-1.5 py-0.5 rounded border border-amber-300/50">
                        सस्वर देवनागरी मन्त्राः
                      </span>
                    </div>
                    <div className="font-semibold whitespace-pre-line tracking-wide">
                      {sanskritContent}
                    </div>
                  </div>

                  {/* Classical Ornamental Divider Line */}
                  {hasNepali && (
                    <div className="my-1.5 flex items-center justify-center gap-2 text-[#166534] text-xs font-bold select-none shrink-0">
                      <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#166534]/50 to-transparent"></span>
                      <span className="text-[11px] font-black tracking-widest text-[#166534]">
                        ❖ ════ ॐ श्रीहरिः ॐ ════ ❖
                      </span>
                      <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#166534]/50 to-transparent"></span>
                    </div>
                  )}

                  {/* Lower Section: आधा पेज प्रामाणिक नेपाली टीका एवं विधि */}
                  {hasNepali && (
                    <div 
                      className="flex-1 rounded-lg border border-emerald-300/80 bg-[#F9FCF8] p-3 overflow-y-auto font-serif leading-relaxed text-stone-800 shadow-2xs max-h-[48%]"
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
                      <div className="whitespace-pre-line leading-relaxed">
                        {nepaliTikaContent}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Notes if any */}
              {notesNepali && (
                <div className="mt-1 px-2 py-1 bg-amber-50 rounded border border-amber-200 text-[10.5px] text-amber-900 flex items-center gap-1 shrink-0 font-sans">
                  <span className="font-bold">💡 निर्देश:</span>
                  <span>{notesNepali}</span>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              BOTTOM FOOTER LOGIC:
              - Last Page (pageNumber === totalPages): Shows official Publisher Footer
              - Other Pages: Clean, minimal footer (no repetitive heavy footer)
             ======================================================== */}
          {isLastPage ? (
            <div className="pt-2 mt-2 border-t-2 border-[#166534]/50 flex flex-col gap-1 text-center text-xs text-[#166534] shrink-0 font-sans bg-[#166534]/5 p-2 rounded-lg">
              <div className="flex items-center justify-between font-bold text-[11px]">
                <span>॥ श्रीरस्तु शुभं भवतु ॥</span>
                <span>बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा</span>
                <span className="font-mono">पृष्ठ {toDevanagariNumerals(pageNumber)} / {toDevanagariNumerals(totalPages)}</span>
              </div>
              <p className="text-[10px] text-stone-600 font-serif italic">
                यस ग्रन्थका सम्पूर्ण मन्त्र तथा शास्त्रीय विधिहरू सनातन परम्परा अनुसार शुद्ध रूपमा प्रकाशित गरिएका छन्।
              </p>
            </div>
          ) : (
            <div className="pt-1.5 mt-1 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-500 shrink-0 font-sans">
              <span className="font-medium text-[#166534]">
                बालानन्द डिजिटल पुस्तकालय
              </span>
              <span className="font-mono font-bold text-stone-600">
                पृष्ठ {toDevanagariNumerals(pageNumber)}
              </span>
            </div>
          )}

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
