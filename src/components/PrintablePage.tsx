import React from 'react';
import { OrganizationProfile } from '../types/astrology';
import { toDevanagariNumerals } from '../utils/nepaliCalendar';

export interface PrintablePageProps {
  /** Optional page number for explicit header/footer display */
  pageNumber?: number;
  /** Total page count for document */
  totalPages?: number;
  /** Header Title (e.g. "बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा") */
  headerTitle?: string;
  /** Header Subtitle / Shloka or Date */
  headerSubtitle?: string;
  /** Custom Footer Message */
  footerNote?: string;
  /** Organization Profile for Branding */
  orgProfile?: Partial<OrganizationProfile>;
  /** Show Organization Logo in Header */
  showLogo?: boolean;
  /** Show Ornate Vedic Frame Border */
  showBorderFrame?: boolean;
  /** Watermark Text or Logo in Background */
  watermarkText?: string;
  /** Show full letterhead on page 1 only (clean continuous style for subsequent pages) */
  showHeaderOnFirstPageOnly?: boolean;
  /** Explicitly toggle header */
  showHeader?: boolean;
  /** Explicitly toggle footer */
  showFooter?: boolean;
  /** Extra CSS Class for the page container */
  className?: string;
  /** Extra CSS Class for the inner content */
  contentClassName?: string;
  /** Page Content */
  children: React.ReactNode;
}

/**
 * Reusable Ornate Vedic Border Frame
 */
export const OrnatePageFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative w-full h-full p-2 sm:p-3 border-2 border-[#B45309] rounded-xl bg-[#FFFDF7] shadow-xs">
      <div className="w-full h-full border border-[#D97706]/40 p-3 sm:p-4 rounded-lg relative flex flex-col justify-between">
        {/* Four Corner Om/Swastik Ornaments */}
        <div className="absolute top-1 left-1 text-[10px] text-[#B45309] font-bold select-none pointer-events-none">
          卐
        </div>
        <div className="absolute top-1 right-1 text-[10px] text-[#B45309] font-bold select-none pointer-events-none">
          ॐ
        </div>
        <div className="absolute bottom-1 left-1 text-[10px] text-[#B45309] font-bold select-none pointer-events-none">
          ॐ
        </div>
        <div className="absolute bottom-1 right-1 text-[10px] text-[#B45309] font-bold select-none pointer-events-none">
          卐
        </div>
        {children}
      </div>
    </div>
  );
};

/**
 * PrintablePage - A dynamic container component enforcing A4 portrait dimensions,
 * standardized margins, content-aware page break rules, consistent header/footer,
 * and automatic page numbering for print and PDF generation.
 */
export const PrintablePage: React.FC<PrintablePageProps> = ({
  pageNumber,
  totalPages,
  headerTitle,
  headerSubtitle,
  footerNote,
  orgProfile,
  showLogo = true,
  showBorderFrame = true,
  watermarkText = 'ॐ बालानन्द वैदिक सेवा',
  variant = 'standard',
  showHeaderOnFirstPageOnly = false,
  showHeader = true,
  showFooter = true,
  className = '',
  contentClassName = '',
  children,
}) => {
  const orgName = orgProfile?.name || 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा';
  const orgPhone = orgProfile?.phone || '+९७७-९७६४८४००५३३';
  const orgLogo = orgProfile?.logoUrl || '/logo.png';
  const orgMangalShloka = orgProfile?.mangalShloka || '॥ श्री गणेशाय नमः ॥';

  const formattedPageNum = pageNumber ? toDevanagariNumerals(pageNumber) : undefined;
  const formattedTotalPages = totalPages ? toDevanagariNumerals(totalPages) : undefined;

  const isCover = variant === 'cover';
  const isSubsequentPage = (pageNumber !== undefined && pageNumber > 1);
  const shouldRenderFullHeader = showHeader && !isCover && (!showHeaderOnFirstPageOnly || !isSubsequentPage);
  const shouldRenderMinimalSectionHeader = showHeader && !isCover && showHeaderOnFirstPageOnly && isSubsequentPage && !!headerTitle;

  const innerContent = (
    <div className="flex flex-col h-full justify-between relative z-10 w-full min-h-[267mm]">
      
      {/* ================= DYNAMIC PRINT HEADER ================= */}
      {shouldRenderFullHeader ? (
        <header className="printable-header pb-2.5 border-b border-[#D97706]/40 mb-3 shrink-0 flex items-center justify-between gap-3 text-stone-900">
          <div className="flex items-center gap-2.5">
            {showLogo && (
              <div className="w-10 h-10 border border-[#D97706]/50 rounded-full p-0.5 bg-amber-50 shrink-0 flex items-center justify-center overflow-hidden shadow-xs">
                <img 
                  src={orgLogo || '/logo.png'} 
                  alt="Logo" 
                  className="w-full h-full object-cover rounded-full" 
                  onError={(e) => {
                    e.currentTarget.src = '/logo.png';
                  }}
                />
              </div>
            )}
            <div>
              <h2 className="text-xs sm:text-sm font-bold font-serif text-[#1A1A1A] leading-tight">
                {headerTitle || orgName}
              </h2>
              {headerSubtitle && (
                <p className="text-[10px] text-stone-600 font-medium font-serif leading-tight">
                  {headerSubtitle}
                </p>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] font-bold font-serif text-[#B45309] block">
              {orgMangalShloka.split('॥')[1] ? `॥ ${orgMangalShloka.split('॥')[1].trim()} ॥` : orgMangalShloka}
            </span>
            <span className="text-[9px] text-stone-500 font-medium block">
              फोन: {toDevanagariNumerals(orgPhone)}
            </span>
          </div>
        </header>
      ) : shouldRenderMinimalSectionHeader ? (
        <header className="printable-header pb-1.5 border-b border-[#D97706]/30 mb-2 shrink-0 flex items-center justify-between text-stone-900">
          <h2 className="text-xs font-bold font-serif text-[#8B1E0F] leading-tight">
            ॥ {headerTitle} ॥
          </h2>
          {headerSubtitle && (
            <span className="text-[9.5px] text-stone-500 font-serif">
              {headerSubtitle}
            </span>
          )}
        </header>
      ) : null}

      {/* ================= MAIN CONTENT AREA ================= */}
      <main
        className={`printable-content flex-1 w-full space-y-4 text-stone-900 ${contentClassName}`}
      >
        {children}
      </main>

      {/* ================= DYNAMIC PRINT FOOTER ================= */}
      {showFooter && (
        <footer className="printable-footer pt-2.5 border-t border-[#D97706]/40 mt-3 shrink-0 flex items-center justify-between text-[10px] text-stone-600 font-serif leading-none">
          <div>
            <span className="font-semibold text-stone-800">
              {footerNote || orgName}
            </span>
            <span className="hidden sm:inline text-stone-400 mx-1">|</span>
            <span className="hidden sm:inline text-stone-500">
              वैदिक संस्कृति तथा आधुनिक प्रविधिको सङ्गम
            </span>
          </div>

          <div className="text-center italic text-stone-500 font-medium">
            ॥ धर्मो रक्षति रक्षितः ॥
          </div>

          <div className="font-bold text-[#B45309] text-right">
            {formattedPageNum ? (
              <span>
                पृष्ठ {formattedPageNum}
                {formattedTotalPages ? ` / ${formattedTotalPages}` : ''}
              </span>
            ) : (
              <span className="print-page-counter">
                पृष्ठ <span className="page-number-css">1</span>
              </span>
            )}
          </div>
        </footer>
      )}
    </div>
  );

  return (
    <section
      className={`printable-page a4-preview-container relative bg-[#FFFDF7] text-stone-900 font-serif box-border p-4 sm:p-6 md:p-8 overflow-hidden page-break-after-always page-break-inside-avoid ${className}`}
      style={{
        width: '210mm',
        minHeight: '297mm',
        boxSizing: 'border-box',
      }}
    >
      {/* Background Watermark Pattern */}
      {watermarkText && (
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0">
          <div className="text-center transform -rotate-12">
            <span className="text-7xl font-bold font-serif text-[#B45309] block">
              {watermarkText}
            </span>
          </div>
        </div>
      )}

      {showBorderFrame ? (
        <OrnatePageFrame>{innerContent}</OrnatePageFrame>
      ) : (
        innerContent
      )}
    </section>
  );
};

/**
 * Utility Component: Wraps elements to prevent breaking inside during printing
 */
export const PrintKeepTogether: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`page-break-inside-avoid break-inside-avoid ${className}`}>
      {children}
    </div>
  );
};

/**
 * Utility Component: Forces a clean A4 page break in print mode
 */
export const PrintPageBreak: React.FC = () => {
  return (
    <div
      className="page-break-after-always break-after-page text-transparent select-none h-0 overflow-hidden"
      aria-hidden="true"
    />
  );
};

/**
 * Utility Component: Print-optimized table wrapper ensuring header rows repeat on new pages
 */
export const PrintTableContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`w-full overflow-x-auto page-break-inside-auto ${className}`}>
      <table className="w-full border-collapse page-break-inside-auto font-serif text-xs">
        {children}
      </table>
    </div>
  );
};
