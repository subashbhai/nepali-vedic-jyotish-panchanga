import React from 'react';
import { OrganizationProfile } from '../../types/astrology';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';
import { getAssetUrl, handleImageFallback } from '../../utils/assetHelper';

export interface PrintableLetterheadBannerProps {
  orgProfile?: OrganizationProfile;
  compact?: boolean;
  showEmblems?: boolean;
  certificateBadgeText?: string;
  className?: string;
}

/**
 * Reusable Official Vedic Letterhead Banner
 * Displays the sacred invocation, organization/brand name, tagline,
 * registration number, PAN number, address, phone, email, and website.
 * Fully configurable from Settings / Dashboard by any licensee/astrologer.
 */
export const PrintableLetterheadBanner: React.FC<PrintableLetterheadBannerProps> = ({
  orgProfile,
  compact = false,
  showEmblems = true,
  certificateBadgeText,
  className = '',
}) => {
  const orgName = orgProfile?.name || 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा';
  const orgTagline = orgProfile?.tagline || 'नेपालकै सबैभन्दा भरपर्दो वैदिक सेवा • सनातन धर्म र प्रामाणिक वास्तुको संगम';
  const orgPhone = orgProfile?.phone || '+९७७-९७६४८४००५३३';
  const orgEmail = orgProfile?.email || 'suwashdmk@gmail.com';
  const orgAddress = orgProfile?.address || 'काठमाडौँ, नेपाल';
  const orgWebsite = orgProfile?.website || 'suwashdmk.com';
  const orgPan = orgProfile?.panNo || 'PAN: ६०१२३४५६७';
  const orgReg = orgProfile?.registeredNo || 'दर्ता नं. १२३४/०८०';
  const orgMangalShloka = orgProfile?.mangalShloka || '॥ श्री गणेशाय नमः ॥ ॥ श्री वास्तुपुरुषाय नमः ॥ ॥ श्री कुलदेवतायै नमः ॥';

  return (
    <div className={`w-full font-serif select-text ${className}`}>
      {/* 1. Top Sacred Invocation / Mangala-Vachana */}
      <div className={`text-center font-bold tracking-widest text-[#8B1E0F] flex items-center justify-center gap-2 select-none ${compact ? 'text-[8px]' : 'text-[9.5px]'}`}>
        <span className="text-[#15803D] font-black text-xs">卐</span>
        <span>{orgMangalShloka}</span>
        <span className="text-[#15803D] font-black text-xs">卐</span>
      </div>

      {/* 2. Main Identity Row (Emblem + Brand Name + Slogan + Contact Badges) */}
      <div className={`flex items-center justify-between gap-2.5 mt-1 border-b-2 border-[#8B1E0F]/40 ${compact ? 'pb-1' : 'pb-2'}`}>
        {/* Optional Left Sacred Artwork / Emblem */}
        {showEmblems && (
          <div className={`${compact ? 'w-11 h-11' : 'w-14 h-14'} rounded-full border-2 border-amber-500/70 p-0.5 shadow-xs shrink-0 flex items-center justify-center bg-white overflow-hidden ring-2 ring-amber-400/20`}>
            <img
              src={getAssetUrl(orgProfile?.logoUrl || '/logo.png')}
              alt="बालानन्द लोगो"
              className="w-full h-full object-cover rounded-full select-none"
              onError={(e) => {
                handleImageFallback(e, [
                  getAssetUrl('/logo.png'),
                  getAssetUrl('/assets/logo.png'),
                  getAssetUrl('/balananda-logo.png'),
                ]);
              }}
            />
          </div>
        )}

        {/* Center: Brand Name & Detailed Badges */}
        <div className="text-center flex-1 min-w-0">
          <h1 className={`font-black text-[#8B1E0F] tracking-tight leading-tight ${compact ? 'text-[15px]' : 'text-[18px]'}`}>
            {orgName}
          </h1>

          {orgTagline && (
            <p className={`font-bold text-[#B45309] mt-0.5 leading-snug ${compact ? 'text-[8px]' : 'text-[9.5px]'}`}>
              {orgTagline}
            </p>
          )}

          {/* Metadata Badges (Reg No, PAN, Address, Phone, Email, Website) */}
          <div className={`flex items-center justify-center gap-1.5 text-[#44403C] mt-1 flex-wrap font-sans font-medium ${compact ? 'text-[7.5px]' : 'text-[8.5px]'}`}>
            {orgReg && (
              <span className="bg-[#FAF5ED] px-1.5 py-0.5 rounded border border-[#E6E0D5] font-bold text-[#8B1E0F]">
                {orgReg}
              </span>
            )}
            {orgReg && orgPan && <span>•</span>}
            {orgPan && (
              <span className="bg-[#FAF5ED] px-1.5 py-0.5 rounded border border-[#E6E0D5] font-bold text-[#8B1E0F]">
                {orgPan}
              </span>
            )}
            {orgAddress && <span>•</span>}
            {orgAddress && <span>📍 {orgAddress}</span>}
            {orgPhone && <span>•</span>}
            {orgPhone && <span>📞 {toDevanagariNumerals(orgPhone)}</span>}
            {orgEmail && <span>•</span>}
            {orgEmail && <span className="font-mono">✉️ {orgEmail}</span>}
            {orgWebsite && <span>•</span>}
            {orgWebsite && <span className="font-mono text-[#8B1E0F] font-bold">🌐 {orgWebsite}</span>}
          </div>
        </div>

        {/* Optional Right Certificate Seal Badge */}
        {showEmblems && (
          <div className={`${compact ? 'w-11 h-11' : 'w-13 h-13'} rounded-full border-2 border-dashed border-[#8B1E0F] p-0.5 flex flex-col items-center justify-center text-center shrink-0 bg-[#FFF9F2] shadow-2xs`}>
            <span className="text-[6px] font-extrabold text-[#8B1E0F] tracking-tight leading-none">
              {certificateBadgeText || 'आधिकारिक'}
            </span>
            <span className="text-xs text-[#EAB308] font-bold leading-tight my-0.5">🏛️</span>
            <span className="text-[5.5px] font-bold text-stone-700 leading-none">प्रमाणित पत्र</span>
          </div>
        )}
      </div>
    </div>
  );
};
