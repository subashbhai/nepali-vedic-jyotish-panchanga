import React, { useId } from 'react';
import { OrganizationProfile, AstrologerProfile } from '../../types/astrology';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';

export interface OfficialAstrologerSealProps {
  orgProfile: OrganizationProfile;
  astrologer?: AstrologerProfile;
  verificationDateBS?: string;
  className?: string;
  sealSize?: number; // Stamp diameter in pixels
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Authentic Circular Rubber-Stamp Component (गोल कार्यालय छाप)
 * Designed to resemble the traditional inked seal of Nepali Vedic astrological institutions.
 */
export const CircularRubberStamp: React.FC<{
  orgName: string;
  address?: string;
  regNo?: string;
  sizePx?: number;
  className?: string;
}> = ({ orgName, address = 'काठमाडौँ, नेपाल', regNo, sizePx = 105, className = '' }) => {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '_');
  const upperPathId = `seal_upper_${rawId}`;
  const lowerPathId = `seal_lower_${rawId}`;

  // Truncate orgName gracefully if too long for the circular arc
  const displayOrgName = orgName.length > 32 ? orgName.slice(0, 30) + '...' : orgName;
  const displayAddress = address.length > 24 ? address.slice(0, 22) + '...' : address;
  const displayReg = regNo || 'दर्ता नं. १२३४/०८०';

  return (
    <div
      className={`relative select-none shrink-0 inline-block transform -rotate-2 hover:rotate-0 transition-transform duration-200 ${className}`}
      style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
      title="आधिकारिक कार्यालय छाप (Official Verified Seal)"
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-[0_1px_3px_rgba(153,27,27,0.25)]"
      >
        <defs>
          {/* Upper Arc for Org Name: Clockwise along top */}
          <path
            id={upperPathId}
            d="M 26,100 A 74,74 0 0,1 174,100"
            fill="none"
          />
          {/* Lower Arc for Address: Counter-clockwise along bottom so letters are upright */}
          <path
            id={lowerPathId}
            d="M 26,100 A 74,74 0 0,0 174,100"
            fill="none"
          />
        </defs>

        {/* Outer Circular Ring */}
        <circle
          cx="100"
          cy="100"
          r="95"
          fill="#FFFDF7"
          stroke="#991B1B"
          strokeWidth="3.5"
        />

        {/* Middle Dotted Ring */}
        <circle
          cx="100"
          cy="100"
          r="88"
          fill="none"
          stroke="#991B1B"
          strokeWidth="1.4"
          strokeDasharray="4 2.5"
        />

        {/* Inner Solid Ring */}
        <circle
          cx="100"
          cy="100"
          r="55"
          fill="#FEF2F2"
          stroke="#991B1B"
          strokeWidth="1.8"
        />

        {/* Upper Arc Text (Organization Name) */}
        <text
          fill="#991B1B"
          fontSize="11.5"
          fontWeight="800"
          letterSpacing="0.4"
          fontFamily="serif"
        >
          <textPath href={`#${upperPathId}`} startOffset="50%" textAnchor="middle">
            {displayOrgName}
          </textPath>
        </text>

        {/* Lower Arc Text (Address / Location) */}
        <text
          fill="#991B1B"
          fontSize="10"
          fontWeight="700"
          letterSpacing="0.6"
          fontFamily="serif"
        >
          <textPath href={`#${lowerPathId}`} startOffset="50%" textAnchor="middle">
            ★ {displayAddress} ★
          </textPath>
        </text>

        {/* Decorative Side Emblems */}
        <text x="18" y="103" fill="#991B1B" fontSize="10" fontWeight="bold" textAnchor="middle">卐</text>
        <text x="182" y="103" fill="#991B1B" fontSize="10" fontWeight="bold" textAnchor="middle">卐</text>

        {/* Center Content: Sacred Auspicious Motif */}
        <text
          x="100"
          y="70"
          fill="#991B1B"
          fontSize="16"
          fontWeight="900"
          fontFamily="serif"
          textAnchor="middle"
        >
          ॥ श्री ॥
        </text>

        {/* Center Banner: कार्यालय छाप */}
        <rect
          x="46"
          y="76"
          width="108"
          height="20"
          rx="3"
          fill="#991B1B"
        />
        <text
          x="100"
          y="90"
          fill="#FFFDF7"
          fontSize="9.5"
          fontWeight="900"
          letterSpacing="0.6"
          textAnchor="middle"
        >
          कार्यालय छाप
        </text>

        {/* Subtitle: प्रमाणित • VERIFIED */}
        <text
          x="100"
          y="110"
          fill="#991B1B"
          fontSize="8"
          fontWeight="800"
          letterSpacing="0.6"
          textAnchor="middle"
        >
          प्रमाणित • VERIFIED
        </text>

        {/* Registration Number */}
        <text
          x="100"
          y="125"
          fill="#7F1D1D"
          fontSize="7.5"
          fontWeight="700"
          textAnchor="middle"
        >
          {displayReg}
        </text>
      </svg>
    </div>
  );
};

/**
 * Official Astrologer Seal & Signature Block (last page bottom-right corner)
 * Combines the authentic circular rubber stamp with the astrologer's signature and credentials.
 */
export const OfficialAstrologerSeal: React.FC<OfficialAstrologerSealProps> = ({
  orgProfile,
  astrologer,
  verificationDateBS,
  className = '',
  sealSize = 100,
  orientation = 'horizontal',
}) => {
  const astrologerName = astrologer?.name
    ? (astrologer.name.startsWith('ज्यो') || astrologer.name.startsWith('पं') ? astrologer.name : `ज्यो. पं. ${astrologer.name}`)
    : (orgProfile.astrologerName || 'ज्योतिषाचार्य सुकदेव शर्मा');

  const astrologerTitle = astrologer?.title || orgProfile.astrologerTitle || 'मुख्य ज्योतिषाचार्य तथा संस्थापक';
  const phone = astrologer?.contactPhone || orgProfile.phone || '+९७७-९७६४८४००५३३';

  if (orientation === 'vertical') {
    return (
      <div
        className={`text-center space-y-1 border-2 border-red-800/80 p-2 rounded-xl bg-gradient-to-b from-[#FFFDF9] to-amber-50/80 shadow-xs select-none ${className}`}
      >
        <div className="flex justify-center">
          <CircularRubberStamp
            orgName={orgProfile.name}
            address={orgProfile.address}
            regNo={orgProfile.registeredNo}
            sizePx={sealSize}
          />
        </div>

        {/* Signature Line */}
        <div className="pt-1 border-t border-dashed border-red-800/40">
          {astrologer?.signatureUrl ? (
            <div className="h-8 flex items-center justify-center my-0.5">
              <img src={astrologer.signatureUrl} alt="हस्ताक्षर" className="h-full object-contain" />
            </div>
          ) : (
            <div className="h-6 flex items-center justify-center italic text-[9.5px] text-stone-500 font-serif">
              हस्ताक्षर: ____________________
            </div>
          )}

          <p className="font-bold text-stone-900 text-xs leading-tight">
            {astrologerName}
          </p>
          <p className="text-[9px] text-stone-600 font-medium">
            {astrologerTitle}
          </p>
          <p className="text-[8px] text-stone-500">
            सम्पर्क: {toDevanagariNumerals(phone)}
          </p>
          {verificationDateBS && (
            <p className="text-[7.5px] text-[#166534] font-semibold mt-0.5">
              प्रमाणित मिति: {toDevanagariNumerals(verificationDateBS)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2.5 border-2 border-red-800/80 p-2 rounded-xl bg-gradient-to-r from-[#FFFDF9] to-amber-50/90 shadow-xs select-none ${className}`}
    >
      {/* Prominent Circular Rubber Stamp */}
      <CircularRubberStamp
        orgName={orgProfile.name}
        address={orgProfile.address}
        regNo={orgProfile.registeredNo}
        sizePx={sealSize}
      />

      {/* Astrologer Signature & Credentials */}
      <div className="space-y-0.5 text-left border-l border-red-800/30 pl-2 min-w-[130px]">
        <div className="text-[7.5px] font-extrabold text-red-800 uppercase tracking-wider">
          ॥ अधिकृत प्रमाणीकरण ॥
        </div>

        {astrologer?.signatureUrl ? (
          <div className="h-7 flex items-center my-0.5">
            <img src={astrologer.signatureUrl} alt="हस्ताक्षर" className="h-full object-contain" />
          </div>
        ) : (
          <div className="h-5 flex items-center italic text-[9px] text-stone-500 font-serif">
            हस्ताक्षर: ____________
          </div>
        )}

        <p className="font-bold text-stone-900 text-[11px] leading-tight font-serif">
          {astrologerName}
        </p>
        <p className="text-[8.5px] text-stone-700 font-medium leading-tight">
          {astrologerTitle}
        </p>
        <p className="text-[8px] text-stone-600">
          {orgProfile.name}
        </p>
        <p className="text-[7.5px] text-stone-500">
          सम्पर्क: {toDevanagariNumerals(phone)}
        </p>
        {verificationDateBS && (
          <div className="pt-0.5 border-t border-stone-200 text-[7.5px] text-[#166534] font-bold">
            प्रमाणित: {toDevanagariNumerals(verificationDateBS)}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficialAstrologerSeal;
