import React from 'react';
import { PanchangaData, OrganizationProfile } from '../../types/astrology';
import { getDayDeityInfo } from '../../utils/deitySchedule';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';
import { getAssetUrl, handleImageFallback } from '../../utils/assetHelper';

export interface BalanandaDailyPanchangaDocumentProps {
  panchanga: PanchangaData;
  orgProfile?: Partial<OrganizationProfile>;
  todayBS?: string;
  todayAD?: string;
  locationName?: string;
  astrologerName?: string;
}

export const BalanandaDailyPanchangaDocument: React.FC<BalanandaDailyPanchangaDocumentProps> = ({
  panchanga,
  orgProfile,
  todayBS,
  todayAD,
  locationName = 'काठमाडौँ, नेपाल',
  astrologerName = 'ज्योतिषाचार्य सुकदेव शर्मा',
}) => {
  // Resolve Deity of the Day from the Panchanga's day name or date
  const dayDeity = getDayDeityInfo(panchanga.dayNameNepali, panchanga.dateAD || todayAD);

  // Safe fallback values
  const dateBS = todayBS || panchanga.dateBS || '२०८१/०१/०१';
  const dateAD = todayAD || panchanga.dateAD || new Date().toISOString().split('T')[0];

  const orgName = orgProfile?.name || 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा';
  const orgTagline = orgProfile?.tagline || 'नेपालकै सबैभन्दा भरपर्दो वैदिक सेवा • सनातन धर्म र प्रामाणिक ज्योतिषको संगम';
  const orgPhone = orgProfile?.phone || '+९७७-९७६४४००५३३';
  const orgEmail = orgProfile?.email || 'suwashdmk@gmail.com';
  const orgAddress = orgProfile?.address || 'काठमाडौँ, नेपाल';
  const orgWebsite = orgProfile?.website || 'suwashdmk.com';
  const orgPan = orgProfile?.panNo || 'PAN: ६०१२३४५६७';
  const orgReg = orgProfile?.registeredNo || 'दर्ता नं. १२३४/०८०';

  // Format times nicely
  // Format times nicely
  const formatTimeStr = (t?: string) => (t ? toDevanagariNumerals(t) : '—');

  const omArrayHeader = Array.from({ length: 23 });
  const omArraySide = Array.from({ length: 33 });

  return (
    <div
      id="balananda-single-page-panchanga"
      className="print-page printable-page a4-patrika-page relative w-[210mm] max-w-[210mm] min-h-[296mm] max-h-[296mm] bg-white text-[#1A1A1A] font-serif border-2 border-[#166534] p-1.5 sm:p-2 flex flex-col justify-between box-border mx-auto shadow-xl select-text overflow-hidden print:w-[210mm] print:h-[296mm] print:max-h-[296mm] print:p-1.5 print:m-0 print:shadow-none"
      style={{
        boxSizing: 'border-box',
        pageBreakAfter: 'avoid',
        breakAfter: 'avoid',
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Outer Om Top Row matching authentic Patrika Green Frame */}
      <div className="flex justify-between items-center text-[#166534] text-xs sm:text-sm font-black px-1 select-none overflow-hidden h-5 leading-none shrink-0">
        {omArrayHeader.map((_, i) => (
          <span key={i} className="mx-auto font-black scale-110">ॐ</span>
        ))}
      </div>

      <div className="flex flex-1 my-0.5 min-h-0">
        {/* Outer Om Left Column */}
        <div className="flex flex-col justify-between items-center text-[#166534] text-xs sm:text-sm font-black py-0.5 pr-1 select-none w-5 leading-none shrink-0">
          {omArraySide.map((_, i) => (
            <span key={i} className="font-black scale-110">ॐ</span>
          ))}
        </div>

        {/* Inner Border Box & Content */}
        <div className="flex-1 border-2 border-[#166534] p-2.5 sm:p-3 bg-white flex flex-col justify-between shadow-2xs overflow-hidden">
          {/* Document Inner Body */}
          <div className="relative z-10 flex flex-col justify-between h-full space-y-2">
            
            {/* ========================================================================= */}
            {/* 1. BALANANDA JYOTISH OFFICIAL LETTERHEAD (बालानन्द ज्योतिष लेटरहेड)        */}
            {/* ========================================================================= */}
            <div className="border-b-2 pb-1.5" style={{ borderColor: 'rgba(22, 101, 52, 0.5)' }}>
              {/* Top Vedic Mangala-Vachana */}
              <div className="text-center text-[10px] text-[#166534] font-semibold tracking-wider flex items-center justify-center gap-3">
                <span>{orgProfile?.mangalShloka || '॥ श्री गणेशाय नमः ॥ ॥ श्री कुलदेवतायै नमः ॥ ॥ श्री पशुपतिनाथो विजयते ॥'}</span>
              </div>

              {/* Letterhead Main Header */}
              <div className="flex items-center justify-between gap-3 mt-1 px-1">
                {/* Left: Organization Logo (LHS) */}
                <div className="w-16 h-16 rounded-xl border border-stone-200 dark:border-stone-700 p-1 flex items-center justify-center bg-white shadow-xs shrink-0 overflow-hidden">
                  <img
                    src={getAssetUrl(orgProfile?.logoUrl || '/logo.png')}
                    alt={orgName}
                    crossOrigin="anonymous"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full hidden flex-col items-center justify-center text-center p-0.5">
                    <span className="text-2xl leading-none text-[#166534] font-bold font-serif">ॐ</span>
                    <span className="text-[7.5px] font-bold text-stone-700 leading-tight">
                      {orgName.slice(0, 10)}
                    </span>
                  </div>
                </div>

                {/* Center Institution Identity */}
                <div className="text-center flex-1 min-w-0">
                  <h1 className="text-[19px] leading-tight font-extrabold text-[#166534] font-serif tracking-tight">
                    {orgName}
                  </h1>
              <p className="text-[10px] font-bold text-[#B45309] mt-0.5">
                {orgTagline}
              </p>
              
              {/* Credentials Badges */}
              <div className="flex items-center justify-center gap-2 text-[9px] text-[#44403C] mt-1 flex-wrap font-medium">
                <span className="bg-[#FAF5ED] px-1.5 py-0.5 rounded border border-[#E6E0D5] font-semibold text-[#8B1E0F]">
                  {orgReg}
                </span>
                <span>•</span>
                <span className="bg-[#FAF5ED] px-1.5 py-0.5 rounded border border-[#E6E0D5] font-semibold text-[#8B1E0F]">
                  {orgPan}
                </span>
                <span>•</span>
                <span>📍 {orgAddress}</span>
                <span>•</span>
                <span>📞 {toDevanagariNumerals(orgPhone)}</span>
                <span>•</span>
                <span className="font-mono text-[8.5px]">✉️ {orgEmail}</span>
                {orgWebsite && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[8.5px] text-[#8B1E0F] font-bold">🌐 {orgWebsite}</span>
                  </>
                )}
              </div>
            </div>

            {/* Right Official Verification Stamp Badge */}
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#8B1E0F] p-1 flex flex-col items-center justify-center text-center shrink-0 bg-[#FFF9F2] shadow-2xs">
              <span className="text-[7px] font-extrabold text-[#8B1E0F] tracking-tight">दैनिक पञ्चाङ्ग</span>
              <span className="text-sm text-[#D97706] font-bold leading-none">☀️</span>
              <span className="text-[6.5px] font-bold text-stone-700 leading-tight">प्रमाणित पत्र</span>
            </div>
          </div>

          {/* Sacred Vedic Shloka Ribbon */}
          <div className="mt-1.5 bg-[#FAF5ED] border-y border-[#E6E0D5] py-0.5 px-3 text-center">
            <p className="text-[9.5px] text-[#78350F] font-serif italic tracking-wide">
              ॐ सह नाववतु। सह नौ भुनक्तु। सह वीर्यं करवावहै। तेजस्विनावधीतमस्तु मा विद्विषावहै॥ ॐ शान्तिः शान्तिः शान्तिः॥
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. BAR SWAMI DEITY SPOTLIGHT CARD (बार अनुसारको बारको स्वामी भगवान्)      */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-r from-[#FFF5EB] via-[#FEF3C7]/40 to-[#FFF5EB] rounded-xl border border-[#D97706]/50 p-2 shadow-xs flex items-center justify-between gap-3">
          {/* Presiding Deity High-Resolution Artwork */}
          <div className="relative shrink-0">
            <div className="w-[84px] h-[84px] rounded-xl overflow-hidden border-2 border-[#D97706] shadow-sm bg-stone-100 flex items-center justify-center">
              <img
                src={getAssetUrl(dayDeity.imagePath)}
                alt={dayDeity.deityName}
                crossOrigin="anonymous"
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  handleImageFallback(e, [
                    getAssetUrl('/assets/deities/ganesha.jpg'),
                    getAssetUrl('/logo.png'),
                  ]);
                }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#8B1E0F] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-amber-300 shadow-2xs">
              {dayDeity.dayNameNepali}
            </div>
          </div>

          {/* Deity Details & Attributes */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#D97706]">🚩</span>
                <h2 className="text-[13px] font-bold text-[#8B1E0F] font-serif">
                  आजका स्वामी: {dayDeity.deityName}
                </h2>
              </div>
              <span className="bg-[#8B1E0F]/10 text-[#8B1E0F] text-[9px] font-bold px-2 py-0.5 rounded-md border border-[#8B1E0F]/20">
                {dayDeity.grahaLord}
              </span>
            </div>

            <p className="text-[9.5px] text-[#78350F] font-medium leading-tight mt-0.5">
              {dayDeity.deityShortTitle} • {dayDeity.worshipBlessings}
            </p>

            {/* Sacred Shloka Box */}
            <div className="mt-1 bg-white/90 rounded-md border border-amber-300/80 p-1.5 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[9.5px] text-[#8B1E0F] font-serif font-semibold whitespace-pre-line leading-tight">
                  {dayDeity.vedicShloka}
                </p>
                <p className="text-[8.5px] text-[#B45309] font-bold mt-0.5">
                  <span className="text-stone-600">बीज मन्त्र:</span> {dayDeity.bijaMantra}
                </p>
              </div>
              <div className="text-right shrink-0 text-[8px] text-stone-600 leading-tight">
                <div><strong className="text-[#8B1E0F]">शुभ रङ्ग:</strong> {dayDeity.favorableColor}</div>
                <div><strong className="text-[#8B1E0F]">शुभ दिशा:</strong> {dayDeity.favorableDirection}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. TODAY'S DATE & SAMVAT BANNER (मिति तथा संवत्सर विवरण)                  */}
        {/* ========================================================================= */}
        <div className="bg-[#8B1E0F] text-white rounded-lg px-3 py-1.5 flex items-center justify-between gap-2 shadow-xs">
          <div>
            <span className="text-[10px] text-amber-200 uppercase font-semibold">नेपाली विक्रम संवत्: </span>
            <span className="text-sm font-extrabold text-white font-serif">
              {toDevanagariNumerals(dateBS)} ({dayDeity.dayNameNepali})
            </span>
            <span className="text-[10px] text-amber-100 ml-2 font-mono">
              ({dateAD})
            </span>
            {panchanga.nepalSamvatFormatted && (
              <span className="text-[10px] bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded ml-2 font-medium border border-amber-300/30">
                {panchanga.nepalSamvatFormatted}
              </span>
            )}
          </div>

          <div className="text-[9px] text-amber-100 flex items-center gap-2">
            <span>संवत्सर: <strong className="text-white">{panchanga.samvatsara || 'श्रीकालयुक्त'}</strong></span>
            <span>•</span>
            <span>अयन: <strong className="text-white">{panchanga.ayana || 'उत्तरायण'}</strong></span>
            <span>•</span>
            <span>ऋतु: <strong className="text-white">{panchanga.ritu || 'वसन्त'}</strong></span>
            <span>•</span>
            <span>स्थान: <strong className="text-white">📍 {locationName}</strong></span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. CORE PANCHANGA (पञ्च-अङ्ग: तिथि, वार, नक्षत्र, योग, करण)               */}
        {/* ========================================================================= */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[11px] font-bold text-[#8B1E0F] font-serif flex items-center gap-1.5">
              <span>☸️</span>
              <span>आजको पञ्च-अङ्ग (The 5 Fundamental Limbs)</span>
            </h3>
            <span className="text-[9px] text-stone-500 font-medium">
              दृक्-सिद्ध सूर्योदयकालीन गणना
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5 text-center">
            {/* 1. तिथि (Tithi) */}
            <div className="bg-[#FAF5ED] rounded-lg border border-[#E6E0D5] p-1.5 shadow-2xs">
              <div className="text-[9px] font-bold text-[#B45309] uppercase">१. तिथि</div>
              <div className="text-xs font-extrabold text-[#8B1E0F] font-serif mt-0.5">
                {panchanga.tithi.paksha} {panchanga.tithi.name}
              </div>
              <div className="text-[8.5px] text-stone-600 mt-0.5 font-medium leading-tight">
                {panchanga.tithi.endTime ? `${formatTimeStr(panchanga.tithi.endTime)} सम्म` : 'दिनभर'}
              </div>
              {panchanga.tithi.subsequentName && (
                <div className="text-[7.5px] text-stone-500 mt-0.5 truncate">
                  उप्रान्त: {panchanga.tithi.subsequentName}
                </div>
              )}
            </div>

            {/* 2. वार (Vara) */}
            <div className="bg-[#FAF5ED] rounded-lg border border-[#E6E0D5] p-1.5 shadow-2xs">
              <div className="text-[9px] font-bold text-[#B45309] uppercase">२. वार</div>
              <div className="text-xs font-extrabold text-[#8B1E0F] font-serif mt-0.5">
                {panchanga.vaar?.name || dayDeity.dayNameNepali}
              </div>
              <div className="text-[8.5px] text-stone-600 mt-0.5 font-medium leading-tight">
                स्वामी: {panchanga.vaar?.lord || dayDeity.grahaLord.split(' ')[0]}
              </div>
              <div className="text-[7.5px] text-stone-500 mt-0.5">
                {dayDeity.dayNameSanskrit.split(' ')[0]}
              </div>
            </div>

            {/* 3. नक्षत्र (Nakshatra) */}
            <div className="bg-[#FAF5ED] rounded-lg border border-[#E6E0D5] p-1.5 shadow-2xs">
              <div className="text-[9px] font-bold text-[#B45309] uppercase">३. नक्षत्र</div>
              <div className="text-xs font-extrabold text-[#8B1E0F] font-serif mt-0.5 truncate">
                {panchanga.nakshatra.name}
              </div>
              <div className="text-[8.5px] text-stone-600 mt-0.5 font-medium leading-tight">
                {panchanga.nakshatra.endTime ? `${formatTimeStr(panchanga.nakshatra.endTime)} सम्म` : 'दिनभर'}
              </div>
              <div className="text-[7.5px] text-stone-500 mt-0.5">
                चरण: {toDevanagariNumerals(panchanga.nakshatra.pada)} • स्वामी: {panchanga.nakshatra.lord}
              </div>
            </div>

            {/* 4. योग (Yoga) */}
            <div className="bg-[#FAF5ED] rounded-lg border border-[#E6E0D5] p-1.5 shadow-2xs">
              <div className="text-[9px] font-bold text-[#B45309] uppercase">४. योग</div>
              <div className="text-xs font-extrabold text-[#8B1E0F] font-serif mt-0.5 truncate">
                {panchanga.yoga.name}
              </div>
              <div className="text-[8.5px] text-stone-600 mt-0.5 font-medium leading-tight">
                {panchanga.yoga.endTime ? `${formatTimeStr(panchanga.yoga.endTime)} सम्म` : 'दिनभर'}
              </div>
              <div className="text-[7.5px] text-stone-500 mt-0.5">
                योग सङ्ख्या: {toDevanagariNumerals(panchanga.yoga.number)}
              </div>
            </div>

            {/* 5. करण (Karana) */}
            <div className="bg-[#FAF5ED] rounded-lg border border-[#E6E0D5] p-1.5 shadow-2xs">
              <div className="text-[9px] font-bold text-[#B45309] uppercase">५. करण</div>
              <div className="text-xs font-extrabold text-[#8B1E0F] font-serif mt-0.5 truncate">
                {panchanga.karana.name}
              </div>
              <div className="text-[8.5px] text-stone-600 mt-0.5 font-medium leading-tight">
                {panchanga.karana.endTime ? `${formatTimeStr(panchanga.karana.endTime)} सम्म` : 'दिनभर'}
              </div>
              <div className="text-[7.5px] text-stone-500 mt-0.5">
                करण सङ्ख्या: {toDevanagariNumerals(panchanga.karana.number)}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. SUN / MOON MOVEMENTS & RASHI STATUS (सूर्य-चन्द्र स्थिति तथा काल)       */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 gap-2">
          {/* Left: Solar & Lunar Astronomical Events */}
          <div className="bg-[#FAF5ED] rounded-lg border border-[#E6E0D5] p-2">
            <div className="text-[10px] font-bold text-[#8B1E0F] flex items-center gap-1 mb-1 border-b border-[#E6E0D5] pb-0.5">
              <span>☀️</span>
              <span>सूर्य तथा चन्द्रमाको उदय-अस्त समय</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px]">
              <div className="flex justify-between">
                <span className="text-stone-600">🌅 सूर्योदय:</span>
                <strong className="text-stone-900">{formatTimeStr(panchanga.sunrise)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">🌇 सूर्यास्त:</span>
                <strong className="text-stone-900">{formatTimeStr(panchanga.sunset)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">🌙 चन्द्रोदय:</span>
                <strong className="text-stone-900">{formatTimeStr(panchanga.moonrise || '—')}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">🌘 चन्द्रास्त:</span>
                <strong className="text-stone-900">{formatTimeStr(panchanga.moonset || '—')}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">⏱️ दिनमान:</span>
                <strong className="text-stone-900">{toDevanagariNumerals(panchanga.dayDuration || '१२ घं. १५ मि.')}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">🌃 रात्रिमान:</span>
                <strong className="text-stone-900">{toDevanagariNumerals(panchanga.nightDuration || '११ घं. ४५ मि.')}</strong>
              </div>
            </div>
          </div>

          {/* Right: Astrological Signs, Elements & Moon Rashi */}
          <div className="bg-[#FAF5ED] rounded-lg border border-[#E6E0D5] p-2">
            <div className="text-[10px] font-bold text-[#8B1E0F] flex items-center gap-1 mb-1 border-b border-[#E6E0D5] pb-0.5">
              <span>🌌</span>
              <span>गोचर राशि तथा नक्षत्र सङ्केत</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px]">
              <div className="flex justify-between">
                <span className="text-stone-600">सूर्य राशि:</span>
                <strong className="text-[#8B1E0F]">{panchanga.sunRashi} राशि</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">चन्द्र राशि:</span>
                <strong className="text-[#8B1E0F]">{panchanga.moonRashi} राशि</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">नामक अक्षर:</span>
                <strong className="text-stone-900">{panchanga.namakshara || '—'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">गण / योनि:</span>
                <strong className="text-stone-900">{panchanga.gana || 'देव'} / {panchanga.yoni || '—'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">नाडी / वर्ण:</span>
                <strong className="text-stone-900">{panchanga.nadi || 'मध्य'} / क्षत्रिय</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">चन्द्रबल:</span>
                <strong className="text-emerald-700">अनुकूल</strong>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6. SHUBHA MUHURTA & ASHUBHA KAAL (शुभ मुहूर्त तथा वर्ज्य काल)              */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 gap-2">
          {/* Auspicious Muhurtas */}
          <div className="bg-[#ECFDF5] border border-emerald-300 rounded-lg p-2 shadow-2xs">
            <div className="text-[10px] font-bold text-emerald-900 flex items-center justify-between border-b border-emerald-200 pb-0.5 mb-1">
              <span className="flex items-center gap-1">
                <span>🌟</span>
                <span>शुभ मुहूर्त (Auspicious Timings)</span>
              </span>
              <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold">उत्तम</span>
            </div>
            <div className="space-y-1 text-[9px]">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-emerald-950">अभिजित् मुहूर्त:</span>
                <strong className="text-emerald-900 font-mono text-[9.5px]">
                  {panchanga.abhijitMuhurta ? `${formatTimeStr(panchanga.abhijitMuhurta.start)} - ${formatTimeStr(panchanga.abhijitMuhurta.end)}` : '११:३८ AM - १२:३० PM'}
                </strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-emerald-950">ब्रह्म मुहूर्त:</span>
                <strong className="text-emerald-900 font-mono text-[9.5px]">
                  {panchanga.brahmaMuhurta ? `${formatTimeStr(panchanga.brahmaMuhurta.start)} - ${formatTimeStr(panchanga.brahmaMuhurta.end)}` : '०४:०५ AM - ०४:५१ AM'}
                </strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-emerald-950">विजय / गोधूलि मुहूर्त:</span>
                <strong className="text-emerald-900 font-mono text-[9.5px]">
                  {panchanga.pradoshaTime ? `${formatTimeStr(panchanga.pradoshaTime.start)} - ${formatTimeStr(panchanga.pradoshaTime.end)}` : '०६:२० PM - ०६:४५ PM'}
                </strong>
              </div>
            </div>
          </div>

          {/* Inauspicious Periods */}
          <div className="bg-[#FEF2F2] border border-rose-300 rounded-lg p-2 shadow-2xs">
            <div className="text-[10px] font-bold text-rose-900 flex items-center justify-between border-b border-rose-200 pb-0.5 mb-1">
              <span className="flex items-center gap-1">
                <span>⚠️</span>
                <span>अशुभ / वर्ज्य समय (Inauspicious Periods)</span>
              </span>
              <span className="text-[8px] bg-rose-100 text-rose-800 px-1 rounded font-bold">त्याज्य</span>
            </div>
            <div className="space-y-1 text-[9px]">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-rose-950">राहुकाल (त्याज्य):</span>
                <strong className="text-rose-900 font-mono text-[9.5px]">
                  {panchanga.rahuKaal ? `${formatTimeStr(panchanga.rahuKaal.start)} - ${formatTimeStr(panchanga.rahuKaal.end)}` : '०४:३० PM - ०६:०० PM'}
                </strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-rose-950">यमगण्ड काल:</span>
                <strong className="text-rose-900 font-mono text-[9.5px]">
                  {panchanga.yamaganda ? `${formatTimeStr(panchanga.yamaganda.start)} - ${formatTimeStr(panchanga.yamaganda.end)}` : '१२:०० PM - ०१:३० PM'}
                </strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-rose-950">गुलिक काल:</span>
                <strong className="text-rose-900 font-mono text-[9.5px]">
                  {panchanga.gulika ? `${formatTimeStr(panchanga.gulika.start)} - ${formatTimeStr(panchanga.gulika.end)}` : '०३:०० PM - ०४:३० PM'}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 7. DAILY SANKALPA & SPIRITUAL BLESSINGS (दैनिक सङ्कल्प मन्त्र)             */}
        {/* ========================================================================= */}
        <div className="bg-[#FFF9F2] rounded-lg border border-[#D97706]/40 p-2 shadow-2xs">
          <div className="flex items-center justify-between gap-2 border-b border-[#D97706]/30 pb-0.5 mb-1">
            <span className="text-[10px] font-bold text-[#8B1E0F] flex items-center gap-1 font-serif">
              <span>🪔</span>
              <span>आजको नित्य वैदिक सङ्कल्प तथा साधना सूत्र (Daily Vedic Sankalpa)</span>
            </span>
            <span className="text-[8.5px] text-[#B45309] font-medium">
              शुभकर्म प्रारम्भ पूर्व पठनीय
            </span>
          </div>
          <p className="text-[9px] text-[#44403C] font-serif leading-relaxed italic">
            « ॐ विष्णुर्विष्णुर्विष्णुः श्रीमद्भगवतो महापुरुषस्य विष्णोराज्ञया प्रवर्तमानस्य अद्य श्रीब्रह्मणो द्वितीये परार्धे श्वेतवाराहकल्पे वैवस्वतमन्वन्तरे अष्टाविंशतितमे युगे कलियुगे कलिप्रथमचरणे नेपालदेशे {locationName.split(',')[0]} क्षेत्रे वि.सं. {toDevanagariNumerals(dateBS)} {dayDeity.dayNameSanskrit} {dayDeity.sankalpaSnippet} मम कायिकवाचिकमानसिक पापशान्तये सर्वमङ्गलप्राप्त्यर्थं नित्यकर्म करिष्ये। »
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 8. OFFICIAL SEAL, SIGNATURE & LETTERHEAD FOOTER (हस्ताक्षर तथा छाप)       */}
        {/* ========================================================================= */}
        <div className="border-t-2 border-[#8B1E0F]/40 pt-1.5 flex items-center justify-between gap-3 text-[8.5px]">
          {/* Verification Statement */}
          <div className="space-y-0.5 max-w-[55%]">
            <div className="flex items-center gap-1 text-[#8B1E0F] font-bold text-[9px]">
              <span>✔️</span>
              <span>{orgName} प्रमाणीकरण</span>
            </div>
            <p className="text-stone-600 leading-tight">
              यो पञ्चाङ्ग नेपाल सरकारको प्रामाणिक परम्परा तथा दृक्-सिद्ध गणितीय आधारमा प्रत्यक्ष सूर्योदयका लागि गणना गरिएको आधिकारिक प्रतिवेदन हो।
            </p>
            <div className="text-stone-500 font-mono text-[8px]">
              वेबसाइट: {orgWebsite} | फोन: {toDevanagariNumerals(orgPhone)}
            </div>
          </div>

          {/* Official Seal & Astrologer Signature */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Stamp Circle */}
            <div className="w-14 h-14 rounded-full border-2 border-[#8B1E0F] text-[#8B1E0F] flex flex-col items-center justify-center text-center p-0.5 bg-red-50/50 rotate-[-4deg] shadow-2xs">
              <span className="text-[6px] font-extrabold uppercase tracking-tighter truncate max-w-[48px]">{orgName.slice(0, 12)}</span>
              <span className="text-xs font-bold leading-none">ॐ</span>
              <span className="text-[6px] font-bold leading-tight">प्रमाणीकरण छाप</span>
            </div>

            {/* Signature Box */}
            <div className="text-center min-w-[110px] border-b border-stone-400 pb-0.5">
              <div className="font-serif italic text-stone-700 text-[10px] font-bold">
                {orgProfile?.astrologerName || astrologerName}
              </div>
              <div className="text-[8px] text-[#8B1E0F] font-bold">
                {orgProfile?.astrologerTitle || 'मुख्य ज्योतिषाचार्य'}
              </div>
              <div className="text-[7.5px] text-stone-500">
                {orgName}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

        {/* Outer Om Right Column */}
        <div className="flex flex-col justify-between items-center text-[#166534] text-xs sm:text-sm font-black py-0.5 pl-1 select-none w-5 leading-none shrink-0">
          {omArraySide.map((_, i) => (
            <span key={i} className="font-black scale-110">ॐ</span>
          ))}
        </div>
      </div>

      {/* Outer Om Bottom Row */}
      <div className="flex justify-between items-center text-[#166534] text-xs sm:text-sm font-black px-1 select-none overflow-hidden h-5 leading-none shrink-0">
        {omArrayHeader.map((_, i) => (
          <span key={i} className="mx-auto font-black scale-110">ॐ</span>
        ))}
      </div>
    </div>
  );
};
