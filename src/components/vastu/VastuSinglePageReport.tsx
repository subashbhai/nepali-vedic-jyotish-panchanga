import React from 'react';
import { VastuProject } from '../VastuView';
import { ROOM_CONFIGS, VASTU_ZONES } from '../../utils/vastuEngine';
import { OrganizationProfile } from '../../types/astrology';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';

export interface VastuSinglePageReportProps {
  currentProject: VastuProject;
  auditResult: {
    score?: number;
    totalScore?: number;
    percentage: number;
    maxScore: number;
    gradeNepali: string;
    doshas: Array<{ roomName: string; rating?: string; remark: string; remedy?: string }>;
  };
  bhumiEval: {
    score: number;
    notes: string[];
  };
  orgProfile?: OrganizationProfile;
  astrologerName?: string;
}

export const VastuSinglePageReport: React.FC<VastuSinglePageReportProps> = ({
  currentProject,
  auditResult,
  bhumiEval,
  orgProfile,
  astrologerName = 'ज्योतिषाचार्य सुकदेव शर्मा',
}) => {
  const orgName = orgProfile?.name || 'बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवा';
  const orgPhone = orgProfile?.phone || '+९७७-९७६४४००५३३';
  const orgEmail = orgProfile?.email || 'suwashdmk@gmail.com';
  const orgAddress = orgProfile?.address || 'काठमाडौँ, नेपाल';
  const orgWebsite = orgProfile?.website || 'suwashdmk.com';
  const orgPan = orgProfile?.panNo || 'PAN: ६०१२३४५६७';
  const orgReg = orgProfile?.registeredNo || 'दर्ता नं. १२३४/०८०';

  // Format today's Nepali date
  const todayDateStr = new Date().toLocaleDateString('ne-NP');

  // Key rooms for the compact single-page table
  const displayRooms = ROOM_CONFIGS.slice(0, 8);

  return (
    <div
      id="vastu-single-page-report"
      className="print-page printable-page a4-patrika-page relative w-[210mm] max-w-[210mm] h-[297mm] max-h-[297mm] bg-[#FFFDF9] text-[#1A1A1A] font-serif box-border mx-auto shadow-2xl select-text overflow-hidden print:w-[210mm] print:h-[297mm] print:max-h-[297mm] print:m-0 print:shadow-none"
      style={{
        boxSizing: 'border-box',
        pageBreakAfter: 'avoid',
        breakAfter: 'avoid',
        pageBreakInside: 'avoid',
        breakInside: 'avoid',
        backgroundColor: '#FFFDF9',
      }}
    >
      {/* ========================================================================= */}
      {/* 🌟 VASTU BORDER: DOUBLE YELLOW LINE WITH BOLD GREEN SWASTIKAS (卐)         */}
      {/* ========================================================================= */}
      
      {/* 1. Outer Yellow Line */}
      <div className="absolute inset-[6px] border-[2.5px] border-[#EAB308] pointer-events-none rounded-xs z-20" />

      {/* 2. Inner Yellow Line */}
      <div className="absolute inset-[24px] border-[1.5px] border-[#EAB308] pointer-events-none rounded-xs z-20" />

      {/* 3. Bold Green Swastika Strip - Top */}
      <div 
        className="absolute top-[6px] left-[25px] right-[25px] h-[18px] flex items-center justify-between overflow-hidden text-[#15803D] text-[11px] font-black select-none pointer-events-none tracking-widest leading-none z-20"
        style={{ WebkitTextStroke: '0.4px #15803D', textShadow: '0 0 0.5px #15803D' }}
      >
        <span>卐</span><span>卐</span><span>卐</span><span>卐</span><span>卐</span>
        <span>卐</span><span>卐</span><span>卐</span><span>卐</span><span>卐</span>
        <span>卐</span><span>卐</span><span>卐</span><span>卐</span><span>卐</span>
        <span>卐</span><span>卐</span><span>卐</span><span>卐</span><span>卐</span>
        <span>卐</span><span>卐</span><span>卐</span><span>卐</span><span>卐</span>
        <span>卐</span><span>卐</span><span>卐</span><span>卐</span><span>卐</span>
      </div>

      {/* 4. Bold Green Swastika Strip - Bottom */}
      <div 
        className="absolute bottom-[6px] left-[25px] right-[25px] h-[18px] flex items-center justify-between overflow-hidden text-[#15803D] text-[11px] font-black select-none pointer-events-none tracking-widest leading-none z-20"
        style={{ WebkitTextStroke: '0.4px #15803D', textShadow: '0 0 0.5px #15803D' }}
      >
        <span>卐</span><span>卐</span><span>卐</span><span>卐</span><span>卐</span>
        <span>卐</span><span>卐</span><span>卐</span><span>卐</span><span>卐</span>
        <span>卐</span><span>卐</span><span>卐</span><span>卐</span><span>卐</span>
        <span>卐</span><span>卐</span><span>卐</span><span>卐</span><span>卐</span>
        <span>卐</span><span>卐</span><span>卐</span><span>卐</span><span>卐</span>
        <span>卐</span><span>卐</span><span>卐</span><span>卐</span><span>卐</span>
      </div>

      {/* 5. Bold Green Swastika Strip - Left */}
      <div 
        className="absolute left-[6px] top-[25px] bottom-[25px] w-[18px] flex flex-col items-center justify-between overflow-hidden text-[#15803D] text-[10.5px] font-black select-none pointer-events-none leading-none z-20"
        style={{ WebkitTextStroke: '0.4px #15803D', textShadow: '0 0 0.5px #15803D' }}
      >
        {Array.from({ length: 36 }).map((_, idx) => (
          <span key={idx}>卐</span>
        ))}
      </div>

      {/* 6. Bold Green Swastika Strip - Right */}
      <div 
        className="absolute right-[6px] top-[25px] bottom-[25px] w-[18px] flex flex-col items-center justify-between overflow-hidden text-[#15803D] text-[10.5px] font-black select-none pointer-events-none leading-none z-20"
        style={{ WebkitTextStroke: '0.4px #15803D', textShadow: '0 0 0.5px #15803D' }}
      >
        {Array.from({ length: 36 }).map((_, idx) => (
          <span key={idx}>卐</span>
        ))}
      </div>

      {/* 7. Corner Embellished Bold Swastikas */}
      <div 
        className="absolute top-[6px] left-[6px] w-[18px] h-[18px] flex items-center justify-center text-[#15803D] font-black text-[12px] select-none z-20"
        style={{ WebkitTextStroke: '0.45px #15803D' }}
      >
        卐
      </div>
      <div 
        className="absolute top-[6px] right-[6px] w-[18px] h-[18px] flex items-center justify-center text-[#15803D] font-black text-[12px] select-none z-20"
        style={{ WebkitTextStroke: '0.45px #15803D' }}
      >
        卐
      </div>
      <div 
        className="absolute bottom-[6px] left-[6px] w-[18px] h-[18px] flex items-center justify-center text-[#15803D] font-black text-[12px] select-none z-20"
        style={{ WebkitTextStroke: '0.45px #15803D' }}
      >
        卐
      </div>
      <div 
        className="absolute bottom-[6px] right-[6px] w-[18px] h-[18px] flex items-center justify-center text-[#15803D] font-black text-[12px] select-none z-20"
        style={{ WebkitTextStroke: '0.45px #15803D' }}
      >
        卐
      </div>

      {/* ========================================================================= */}
      {/* DOCUMENT INNER CONTENT (Safely padded inside 24px border with 10px buffer) */}
      {/* ========================================================================= */}
      <div className="relative z-10 w-full h-full p-[34px] pb-[36px] flex flex-col justify-between box-border overflow-hidden">
        
        {/* ======================================================================= */}
        {/* 1. TOP MANGLACHARAN & OFFICIAL BALANANDA LETTERHEAD                     */}
        {/* ======================================================================= */}
        <div className="space-y-1">
          {/* Sacred Invocations */}
          <div className="text-center text-[8.5px] text-[#8B1E0F] font-bold tracking-widest flex items-center justify-center gap-2 select-none">
            <span className="text-[#16A34A]">卐</span>
            <span>{orgProfile?.mangalShloka || '॥ श्री गणेशाय नमः ॥ ॥ श्री वास्तुपुरुषाय नमः ॥ ॥ श्री कुलदेवतायै नमः ॥'}</span>
            <span className="text-[#16A34A]">卐</span>
          </div>

          {/* Letterhead Main Header */}
          <div className="flex items-center justify-between gap-2 border-b-2 border-[#8B1E0F]/40 pb-1">
            {/* Left: Lord Ganesha Artwork */}
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#8B1E0F] via-[#D97706] to-[#EAB308] p-0.5 shadow-xs shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-[#FFFDF9] rounded-md flex flex-col items-center justify-center text-center p-0.5">
                <span className="text-base leading-none text-[#8B1E0F] font-bold">卐</span>
                <span className="text-[6.5px] font-extrabold text-[#16A34A] uppercase tracking-tighter mt-0.5">वास्तु</span>
              </div>
            </div>

            {/* Center: Institution Identity */}
            <div className="text-center flex-1 min-w-0">
              <h1 className="text-[15px] leading-tight font-black text-[#8B1E0F] tracking-tight">
                {orgName}
              </h1>
              <p className="text-[8.5px] font-bold text-[#B45309] mt-0.2">
                {orgProfile?.tagline || 'नेपालकै सबैभन्दा भरपर्दो वैदिक सेवा • सनातन धर्म र प्रामाणिक वास्तुको संगम'}
              </p>
              
              {/* Credentials Badges */}
              <div className="flex items-center justify-center gap-1.5 text-[7.5px] text-[#44403C] mt-0.5 flex-wrap font-sans font-medium">
                <span className="bg-[#FAF5ED] px-1 py-0.2 rounded border border-[#E6E0D5] font-bold text-[#8B1E0F]">
                  {orgReg}
                </span>
                <span>•</span>
                <span className="bg-[#FAF5ED] px-1 py-0.2 rounded border border-[#E6E0D5] font-bold text-[#8B1E0F]">
                  {orgPan}
                </span>
                <span>•</span>
                <span>📍 {orgAddress}</span>
                <span>•</span>
                <span>📞 {toDevanagariNumerals(orgPhone)}</span>
                <span>•</span>
                <span className="font-mono text-[7px]">✉️ {orgEmail}</span>
                {orgWebsite && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[7px] text-[#8B1E0F] font-bold">🌐 {orgWebsite}</span>
                  </>
                )}
              </div>
            </div>

            {/* Right: Certificate Seal Badge */}
            <div className="w-11 h-11 rounded-full border-2 border-dashed border-[#8B1E0F] p-0.5 flex flex-col items-center justify-center text-center shrink-0 bg-[#FFF9F2] shadow-2xs">
              <span className="text-[5.5px] font-extrabold text-[#8B1E0F] tracking-tight leading-none">वास्तु प्रतिवेदन</span>
              <span className="text-[10px] text-[#EAB308] font-bold leading-tight my-0.2">🏛️</span>
              <span className="text-[5px] font-bold text-stone-700 leading-none">प्रमाणित पत्र</span>
            </div>
          </div>

          {/* Certificate Title Banner */}
          <div className="bg-gradient-to-r from-[#8B1E0F] via-[#A82E1E] to-[#8B1E0F] text-white py-0.5 px-3 text-center rounded-md shadow-2xs">
            <h2 className="text-[11px] font-extrabold tracking-wider uppercase font-serif">
              ॥ वैदिक वास्तुशास्त्र तथा भवन मूल्याङ्कन प्रमाणपत्र ॥
            </h2>
            <p className="text-[7.5px] text-amber-200 font-sans">
              (Vedic Vastu Assessment & Non-Destructive Remedial Certificate)
            </p>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 2. CLIENT & PROPERTY METADATA GRID                                      */}
        {/* ======================================================================= */}
        <div className="border border-stone-300 rounded-lg p-1.5 bg-[#FAF5ED]/80 grid grid-cols-4 gap-1.5 text-[8px] font-sans shadow-2xs">
          <div>
            <span className="block text-stone-500 font-bold">परियोजनाको नाम:</span>
            <span className="font-extrabold text-[#8B1E0F] text-[9px] truncate block font-serif">
              {currentProject.projectName}
            </span>
          </div>
          <div>
            <span className="block text-stone-500 font-bold">गृहस्वामीको नाम:</span>
            <span className="font-extrabold text-stone-900 text-[9px] truncate block">
              {currentProject.clientName}
            </span>
          </div>
          <div>
            <span className="block text-stone-500 font-bold">स्थान / ठेगाना:</span>
            <span className="font-bold text-stone-800 truncate block">
              {currentProject.address}
            </span>
          </div>
          <div>
            <span className="block text-stone-500 font-bold">मुख्य ढोका / मुख:</span>
            <span className="font-bold text-[#8B1E0F] capitalize block">
              {currentProject.facingDirection} Facing
            </span>
          </div>
          <div>
            <span className="block text-stone-500 font-bold">क्षेत्रफल / आकार:</span>
            <span className="font-bold text-stone-800 block">
              {currentProject.plotAreaSqFt}
            </span>
          </div>
          <div>
            <span className="block text-stone-500 font-bold">निर्माणको चरण:</span>
            <span className="font-bold text-stone-800 capitalize block">
              {currentProject.constructionStage}
            </span>
          </div>
          <div>
            <span className="block text-stone-500 font-bold">भूमि परीक्षण अङ्क:</span>
            <span className="font-extrabold text-stone-900 block">
              {toDevanagariNumerals(bhumiEval.score)} / १०० (उत्तम)
            </span>
          </div>
          <div>
            <span className="block text-stone-500 font-bold">वास्तु प्राप्ताङ्क (Score):</span>
            <span className="font-black text-[#15803D] text-[9.5px] block">
              {toDevanagariNumerals(auditResult.percentage)}% ({auditResult.gradeNepali})
            </span>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 3. STRUCTURAL ROOM & ZONE EVALUATION TABLE (8 KEY COMPACT ROWS)          */}
        {/* ======================================================================= */}
        <div className="space-y-0.5 font-sans">
          <div className="flex items-center justify-between border-b border-red-800/30 pb-0.5">
            <h3 className="font-bold text-[9.5px] text-[#8B1E0F] font-serif flex items-center gap-1">
              <span>🧭</span>
              <span>संरचनागत वास्तु अवस्था विवरण (Room Placement Evaluation)</span>
            </h3>
            <span className="text-[7.5px] text-stone-500">
              ८१-पद वास्तुपुरुष मण्डल तथा दिशा सिद्धान्त
            </span>
          </div>

          <table className="w-full text-left text-[8px] border-collapse border border-stone-300">
            <thead>
              <tr className="bg-[#FEF3C7]/80 text-[#8B1E0F] font-bold border-b border-stone-300">
                <th className="p-0.5 px-1 border border-stone-300 text-center w-7">क्र.सं.</th>
                <th className="p-0.5 px-1 border border-stone-300 w-32">कोठा / संरचना</th>
                <th className="p-0.5 px-1 border border-stone-300 w-28">अवस्थित दिशा</th>
                <th className="p-0.5 px-1 border border-stone-300 text-center w-12">अङ्क (१०)</th>
                <th className="p-0.5 px-1 border border-stone-300">वास्तु फल तथा मूल्याङ्कन टिप्पणी</th>
              </tr>
            </thead>
            <tbody>
              {displayRooms.map((room, idx) => {
                const currentDir = currentProject.roomPlacements[room.id] || 'NE';
                const optionDetails = room.options[currentDir] || {
                  directionId: currentDir,
                  rating: 'average',
                  points: 5,
                  remarksNepali: 'सामान्य वास्तु अनुकूल'
                };
                const zoneObj = VASTU_ZONES.find((z) => z.id === currentDir);
                const isGood = optionDetails.points >= 7;
                const isBad = optionDetails.points <= 4;

                return (
                  <tr key={room.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF5ED]/50'}>
                    <td className="p-0.5 px-1 border border-stone-300 text-center font-bold text-stone-600">
                      {toDevanagariNumerals(idx + 1)}
                    </td>
                    <td className="p-0.5 px-1 border border-stone-300 font-bold text-stone-900 font-serif">
                      {room.nameNepali}
                    </td>
                    <td className="p-0.5 px-1 border border-stone-300 font-semibold">
                      {zoneObj?.nameNepali || currentDir}
                    </td>
                    <td className="p-0.5 px-1 border border-stone-300 text-center font-bold">
                      <span className={`px-1 py-0.2 rounded text-[7.5px] ${isGood ? 'bg-emerald-100 text-emerald-800' : isBad ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                        {toDevanagariNumerals(optionDetails.points)}
                      </span>
                    </td>
                    <td className="p-0.5 px-1 border border-stone-300 text-stone-700 leading-tight">
                      {optionDetails.remarksNepali}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ======================================================================= */}
        {/* 4. VASTU DOSHAS & NON-DESTRUCTIVE REMEDIAL MEASURES (तोडफोडविहीन उपचार)   */}
        {/* ======================================================================= */}
        <div className="bg-[#FFF9F2] rounded-lg border border-[#D97706]/40 p-1.5 shadow-2xs font-sans space-y-0.5">
          <div className="flex items-center justify-between border-b border-[#D97706]/30 pb-0.5">
            <h4 className="text-[9px] font-bold text-[#8B1E0F] uppercase flex items-center gap-1 font-serif">
              <span>🪔</span>
              <span>मुख्य वास्तु दोष तथा तोडफोडविहीन वैदिक उपचार (Non-Destructive Remedial Measures)</span>
            </h4>
            <span className="text-[7px] bg-[#16A34A]/10 text-[#16A34A] font-bold px-1 py-0.2 rounded border border-[#16A34A]/30">
              शास्त्रसम्मत विधि
            </span>
          </div>

          <div className="space-y-0.5 text-[7.5px] leading-snug">
            {auditResult.doshas.length > 0 ? (
              auditResult.doshas.slice(0, 3).map((d, idx) => (
                <div key={idx} className="flex items-start gap-1">
                  <span className="text-red-700 font-bold">•</span>
                  <div>
                    <strong className="text-red-900">{d.roomName}:</strong> {d.remark}{' '}
                    {d.remedy && (
                      <span className="text-emerald-900 font-bold">
                        (✓ तोडफोडविहीन उपाय: {d.remedy})
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-emerald-800 font-semibold flex items-center gap-1">
                <span>✓</span>
                <span>यस भवनमा कुनै प्रमुख वास्तु दोष देखिएको छैन। सम्पूर्ण दिशाहरू र पञ्चतत्वको सन्तुलन अत्यन्त अनुकूल रहेको छ।</span>
              </div>
            )}
            
            {/* General Auspicious Remedial Prescription */}
            <div className="pt-0.5 border-t border-amber-200/70 text-stone-600 flex items-center justify-between text-[7px] gap-2 flex-wrap">
              <span>• <strong>सामान्य ऊर्जा सन्तुलन:</strong> उत्तर-पूर्व (ईशान) लाई सधैं सफा, हल्का र जलपात्रयुक्त राख्नुहोस्।</span>
              <span>• <strong>अग्नि सन्तुलन:</strong> दक्षिण-पूर्व (आग्नेय) मा रातो रङ्ग वा अग्नि पिरामिडको स्थापना शुभ।</span>
              <span>• <strong>स्थिरता:</strong> दक्षिण-पश्चिम (नैऋत्य) लाई भारी र स्थिर राख्नुहोस्।</span>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 5. SACRED VASTU PURUSHA SHLOKA                                          */}
        {/* ======================================================================= */}
        <div className="bg-[#FAF5ED] border border-[#E6E0D5] py-0.5 px-2 text-center rounded">
          <p className="text-[8.5px] text-[#8B1E0F] font-serif font-bold italic tracking-wide leading-tight">
            नमस्ते वास्तुपुरुषाय भूशय्याभिरत प्रभो। मद्गृहं धनधान्यादिसमृद्धं कुरु सर्वदा॥
          </p>
        </div>

        {/* ======================================================================= */}
        {/* 6. AUTHENTICATION, MANUAL SIGNATURE & STAMP SPACE                       */}
        {/* ======================================================================= */}
        <div className="border-t-2 border-[#8B1E0F]/40 pt-1 flex items-center justify-between gap-2 text-[7.5px]">
          {/* Left Verification Statement */}
          <div className="space-y-0.5 max-w-[48%]">
            <div className="flex items-center gap-1 text-[#8B1E0F] font-bold text-[8px]">
              <span className="text-[#16A34A]">✔️</span>
              <span>{orgName} प्रामाणिक वास्तु परीक्षण तथा परामर्श</span>
            </div>
            <p className="text-stone-600 leading-tight">
              यो प्रतिवेदन वैदिक वास्तुशास्त्र, विश्वकर्मा प्रकाश तथा बृहत्संहिताका प्रामाणिक सूत्रहरूका आधारमा तयार पारिएको आधिकारिक प्रमाणपत्र हो।
            </p>
            <div className="text-stone-500 font-mono text-[7px]">
              मिति: वि.सं. {toDevanagariNumerals(todayDateStr)} | वेबसाइट: {orgWebsite} | सम्पर्क: {toDevanagariNumerals(orgPhone)}
            </div>
          </div>

          {/* Center: Open Space for Manual Physical Stamp (Compact) */}
          <div className="w-13 h-13 rounded-full border border-dashed border-stone-300 flex flex-col items-center justify-center text-center text-stone-400 select-none shrink-0 bg-stone-50/40">
            <span className="text-[6.5px] font-bold text-stone-400 uppercase tracking-tighter">आधिकारिक छाप</span>
            <span className="text-[5.5px] text-stone-400 mt-0.5">(यहाँ छाप लगाउनुहोस्)</span>
          </div>

          {/* Right: Astrologer / Vastu Expert Name & Signature Fill Block */}
          <div className="flex flex-col items-end justify-center min-w-[190px] space-y-1.5 shrink-0">
            <div className="text-[8.5px] font-serif text-stone-900">
              <strong className="text-[#8B1E0F]">{orgProfile?.astrologerTitle || 'वास्तुविद्'}:</strong>{' '}
              {orgProfile?.astrologerName ? (
                <span className="font-bold text-stone-800">{orgProfile.astrologerName}</span>
              ) : (
                <span className="font-mono text-stone-400 tracking-wider">.................................................</span>
              )}
            </div>
            <div className="flex flex-col items-center w-36">
              <div className="w-full border-b border-stone-600"></div>
              <span className="text-[7.5px] font-bold text-stone-700 mt-0.5">हस्ताक्षर (Signature)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
