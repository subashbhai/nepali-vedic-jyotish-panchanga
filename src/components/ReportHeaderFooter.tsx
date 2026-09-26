import React from 'react';
import { Phone, Mail, MapPin, Sparkles } from 'lucide-react';
import { OrganizationProfile } from '../types/astrology';
import { getAssetUrl, handleImageFallback } from '../utils/assetHelper';

interface ReportHeaderProps {
  orgProfile: OrganizationProfile;
  titleNepali: string;
  subtitleNepali?: string;
  clientPhotoUrl?: string;
  clientName?: string;
  clientDetailsSummary?: string;
  showPhoto?: boolean;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  orgProfile,
  titleNepali,
  subtitleNepali,
  clientPhotoUrl,
  clientName,
  clientDetailsSummary,
  showPhoto = true,
}) => {
  return (
    <div className="border-b-2 border-[#D97706] pb-4 mb-6 bg-gradient-to-r from-[#FFFDF9] via-white to-[#FEF3C7]/30 dark:from-stone-900 dark:via-stone-900 dark:to-stone-900 p-4 rounded-2xl shadow-xs">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Organization Logo & Info */}
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-stone-800 rounded-full p-0.5 border-2 border-amber-500/50 dark:border-amber-600/50 shadow-md flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-amber-400/20">
            <img
              src={getAssetUrl(orgProfile?.logoUrl || '/logo.png')}
              alt={orgProfile?.name || 'बालानन्द लोगो'}
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                handleImageFallback(e, [
                  getAssetUrl('/logo.png'),
                  getAssetUrl('/assets/logo.png'),
                  getAssetUrl('/balananda-logo.png'),
                ]);
              }}
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#1A1A1A] dark:text-stone-100 tracking-wide text-[#92400E] dark:text-amber-400">
              {orgProfile.name || 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा'}
            </h1>
            <p className="text-xs font-semibold text-[#78716C] dark:text-stone-300 mt-0.5">
              {orgProfile.headerNote || 'नेपालकै सबैभन्दा भरपर्दो वैदिक सेवा'}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-[11px] text-[#2D241E] dark:text-stone-300 mt-1.5 font-medium">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#D97706]" />
                सम्पर्क: <strong className="text-[#92400E] dark:text-amber-300">{orgProfile.phone || '+९७७-९७६४८४००५३३'}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-[#D97706]" />
                इमेल: <strong className="text-[#1A1A1A] dark:text-stone-100">{orgProfile.email || 'suwashdmk@gmail.com'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Client Photo if enabled */}
        {showPhoto && clientPhotoUrl && (
          <div className="flex flex-col items-center shrink-0 border-l border-amber-500/20 pl-4 sm:pl-6">
            <div className="w-16 h-20 sm:w-20 sm:h-24 bg-stone-100 dark:bg-stone-800 rounded-xl overflow-hidden border-2 border-[#D97706] shadow-sm">
              <img
                src={clientPhotoUrl}
                alt={clientName || 'Client Photo'}
                className="w-full h-full object-cover"
              />
            </div>
            {clientName && (
              <span className="text-[10px] font-bold text-stone-800 dark:text-stone-200 mt-1 max-w-[100px] truncate text-center">
                {clientName}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Center Lord Ganesha Icon & Invocation Banner */}
      <div className="flex flex-col items-center justify-center my-2 text-center">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400 text-xs font-bold tracking-widest uppercase">
          <span>卐</span>
          <span>॥ श्री गणेशाय नमः ॥</span>
          <span>卐</span>
        </div>
        
        {/* Lord Ganesha Small Central Emblem */}
        <div className="w-12 h-12 my-1 rounded-full bg-gradient-to-b from-amber-100 to-red-100 dark:from-stone-800 dark:to-stone-900 border border-amber-600 p-1 flex items-center justify-center shadow-xs">
          <svg viewBox="0 0 100 100" className="w-full h-full text-red-700 dark:text-red-400 fill-current">
            <path d="M50 8 L58 22 L42 22 Z" fill="#D97706" />
            <path d="M22 36 C12 36 12 56 26 56 C26 44 26 38 22 36 Z" opacity="0.9" />
            <path d="M78 36 C88 36 88 56 74 56 C74 44 74 38 78 36 Z" opacity="0.9" />
            <path d="M30 32 Q50 20 70 32 C72 44 68 54 50 56 C32 54 28 44 30 32 Z" />
            <path d="M42 28 Q50 34 58 28" stroke="#F59E0B" strokeWidth="3" fill="none" />
            <circle cx="50" cy="27" r="2.5" fill="#B91C1C" />
            <path d="M44 54 C44 72 32 74 28 66 C26 62 30 60 34 62 C38 64 40 60 40 54 Z" fill="#991B1B" />
          </svg>
        </div>

        <p className="text-[10px] text-amber-900 dark:text-amber-300 font-bold italic tracking-wide">
          ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥
        </p>
      </div>

      {/* Report Title Banner */}
      <div className="mt-3 pt-2 border-t border-amber-500/20 text-center">
        <h2 className="text-lg sm:text-xl font-bold font-serif text-[#1A1A1A] dark:text-stone-100 inline-flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D97706]" />
          {titleNepali}
          <Sparkles className="w-4 h-4 text-[#D97706]" />
        </h2>
        {subtitleNepali && (
          <p className="text-xs text-[#78716C] dark:text-stone-400 mt-0.5">
            {subtitleNepali}
          </p>
        )}
      </div>
    </div>
  );
};

interface ReportFooterProps {
  orgProfile: OrganizationProfile;
}

export const ReportFooter: React.FC<ReportFooterProps> = ({ orgProfile }) => {
  return (
    <div className="mt-8 pt-4 border-t-2 border-[#D97706]/40 text-center text-xs text-[#78716C] dark:text-stone-400 space-y-1">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-semibold text-[#2D241E] dark:text-stone-200">
        <span>{orgProfile.name || 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा'}</span>
        <span>|</span>
        <span>सम्पर्क: {orgProfile.phone || '+९७७-९७६४४००५३३'}</span>
        <span>|</span>
        <span>इमेल: {orgProfile.email || 'suwashdmk@gmail.com'}</span>
      </div>
      <p className="text-[10px] text-stone-400">
        {orgProfile.footerNote || 'शास्त्रीय मान्यता, वैदिक सिद्धान्त तथा आधुनिक गणितीय पञ्चाङ्ग गणनामा आधारित प्रतिवेदन।'}
      </p>
    </div>
  );
};
