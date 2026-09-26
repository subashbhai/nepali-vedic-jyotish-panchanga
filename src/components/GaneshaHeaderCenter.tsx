import React from 'react';
import { VedicKalash } from './common/VedicKalash';
import { VedicCornerFlourish } from './common/VedicCornerFlourish';
import { convertADToBSFull } from '../utils/bsCalendarData';
import { getAssetUrl, handleImageFallback } from '../utils/assetHelper';

export interface GaneshaHeaderCenterProps {
  title?: string;
  subtitle?: string;
  primaryShloka?: string;
  secondaryShloka?: string;
  thirdLineText?: string;
  orgName?: string;
  orgPhone?: string;
  logoUrl?: string;
  className?: string;
  kalashSize?: number;
  ganeshaSize?: number;
}

/**
 * GaneshaHeaderCenter:
 * Sacred Vedic Patrika Heading Component matching authentic traditional Nepali/Indian Patrika design.
 * - बायाँ र दायाँ पट्टी २ वटा अति नै सुन्दर वैदिक मङ्गल कलश (Left & Right Vedic Kalash)
 * - बिच मा कमलको फूलमा विराजमान दिव्य भगवान् श्री गणेश (Center Lord Ganesha seated on Lotus)
 * - तल पवित्र मङ्गलाचरण:
 *     श्री मङ्गलमूर्तये नमः
 *     आदित्याद्या ग्रहाः सर्वे सनक्षत्राः सराशयः ।
 *     कुर्वन्तु मङ्गलं तस्य यस्यैषा [जन्मपत्रिका] ॥
 * - चारै कुनामा परम्परागत कुने बुट्टा (Vedic Corner Flourishes) र माथिल्लो किनारामा हरियो रेखा (Green Top Accent Line).
 * - जहिले बनाएको हो त्यसैको हालको वि.सं. मिति (Current BS Date of creation) र फोन नम्बर नराख्ने।
 */
export const GaneshaHeaderCenter: React.FC<GaneshaHeaderCenterProps> = ({
  title,
  subtitle,
  primaryShloka,
  secondaryShloka,
  thirdLineText,
  orgName,
  orgPhone,
  className = '',
  kalashSize = 74,
  ganeshaSize,
}) => {
  // Current creation BS date (जहिले बनाएको हो त्यसैको current मिति)
  const todayBS = convertADToBSFull(new Date());
  const currentBSMiti = `मिति: ${todayBS.formattedBSFull}`;

  // If subtitle is not provided or contains legacy Sambat string, default to current creation date (जहिले बनाएको हो त्यसैको current मिति)
  const displaySubtitle = (!subtitle || subtitle.includes('शुभ सम्बत्')) ? currentBSMiti : subtitle;

  // Determine appropriate patrika word for the Navagraha Mangala Shloka
  const patrikaWord = title?.includes('विवाह')
    ? 'विवाहपत्रिका'
    : title?.includes('व्रतबन्ध')
    ? 'व्रतबन्धपत्रिका'
    : title?.includes('शान्ति')
    ? 'शान्तिपत्रिका'
    : 'जन्मपत्रिका';

  const defaultThirdLine = thirdLineText || `कुर्वन्तु मङ्गलं तस्य यस्यैषा ${patrikaWord} ॥`;

  return (
    <div className={`w-full font-serif shrink-0 mb-2 select-none ${className}`}>
      {/* 1. Top Green Accent Line (माथिल्लो हरियो किनारा रेखा) */}
      <div className="w-full h-1 bg-emerald-700 rounded-t-xs" />

      {/* 2. Outer Ornate Red Frame (बाहिरी रातो घेरा) */}
      <div className="relative border-2 border-red-700 bg-[#FFFDF9] p-1 sm:p-1.5 shadow-xs">
        {/* Four Corner Flourishes (चारै कुनाका कुने बुट्टा) */}
        <VedicCornerFlourish position="top-left" size={32} />
        <VedicCornerFlourish position="top-right" size={32} />
        <VedicCornerFlourish position="bottom-left" size={32} />
        <VedicCornerFlourish position="bottom-right" size={32} />

        {/* 3. Inner Delicate Red Border (भित्री पातलो रातो रेखा) */}
        <div className="border border-red-400/80 px-2 py-1.5 sm:px-3 sm:py-2">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            
            {/* Left Side: Vedic Mangal Kalash (बायाँ पट्टी अति नै सुन्दर कलश) */}
            <div className="shrink-0 flex flex-col items-center justify-center pl-1 sm:pl-2">
              <VedicKalash size={kalashSize} />
            </div>

            {/* Center: Divine Lord Ganesha on Blooming Lotus + Sacred Sanskrit Shloka */}
            <div className="flex-1 flex flex-col items-center justify-center text-center min-w-0 px-1">
              
              {/* Lord Ganesha seated on Lotus Image */}
              <div className="relative mb-0.5">
                <img
                  src={getAssetUrl('/assets/deities/ganesha_lotus.jpg')}
                  alt="भगवान् श्री गणेश"
                  className="w-24 h-24 sm:w-28 sm:h-28 object-contain select-none"
                  onError={(e) => {
                    handleImageFallback(e, [
                      getAssetUrl('/assets/deities/ganesha.jpg'),
                      getAssetUrl('/logo.png'),
                    ]);
                  }}
                />
              </div>

              {/* Sacred Invocations & Navagraha Mangala Shloka */}
              <div className="space-y-0.5 text-center">
                <h2 className="text-[#CC0000] font-black text-xs sm:text-sm md:text-base font-serif tracking-widest leading-none">
                  श्री मङ्गलमूर्तये नमः
                </h2>
                <div className="text-[#CC0000] font-bold text-[10.5px] sm:text-[11.5px] md:text-xs font-serif leading-snug tracking-wide">
                  <p>आदित्याद्या ग्रहाः सर्वे सनक्षत्राः सराशयः ।</p>
                  <p>{defaultThirdLine}</p>
                </div>
              </div>

              {/* Optional Custom Primary / Secondary Shloka if explicitly required */}
              {primaryShloka && primaryShloka !== 'ॐ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥' && (
                <p className="text-[10px] sm:text-[10.5px] text-red-900 font-bold leading-tight mt-1 max-w-lg">
                  {primaryShloka}
                </p>
              )}
              {secondaryShloka && (
                <p className="text-[9px] text-amber-950/80 italic leading-tight">
                  {secondaryShloka}
                </p>
              )}

              {/* Patrika Title & Subtitle Badge */}
              {title && (
                <div className="mt-1">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-red-50 border border-red-300 text-red-900 font-black text-[11px] sm:text-xs tracking-wide font-serif shadow-2xs">
                    {title.startsWith('॥') ? title : `॥ ${title} ॥`}
                  </span>
                </div>
              )}

              {displaySubtitle && (
                <p className="text-[9.5px] sm:text-[10px] text-stone-600 font-sans font-medium mt-0.5 tracking-wide">
                  {displaySubtitle}
                </p>
              )}
            </div>

            {/* Right Side: Matching Vedic Mangal Kalash (दायाँ पट्टी अति नै सुन्दर कलश) */}
            <div className="shrink-0 flex flex-col items-center justify-center pr-1 sm:pr-2">
              <VedicKalash size={kalashSize} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default GaneshaHeaderCenter;
