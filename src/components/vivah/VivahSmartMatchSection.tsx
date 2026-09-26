import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  HeartHandshake, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Send, 
  Eye, 
  Award,
  BookOpen,
  Lock,
  Calendar,
  GraduationCap,
  Briefcase,
  MapPin,
  ShieldCheck,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { VivahProfile } from '../../types/vivahTypes';
import { 
  getTopKundaliMatches, 
  maskMatrimonialName, 
  KundaliMatchItem 
} from '../../utils/vivahPrivacyHelper';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';

interface VivahSmartMatchSectionProps {
  myProfile: VivahProfile | null;
  candidates: VivahProfile[];
  onViewProfile: (profile: VivahProfile) => void;
  onSendRequest: (profile: VivahProfile) => void;
  onOpenOnboardingModal?: () => void;
  onOpenGunaMilanModal?: (candidate: VivahProfile) => void;
}

export const VivahSmartMatchSection: React.FC<VivahSmartMatchSectionProps> = ({
  myProfile,
  candidates,
  onViewProfile,
  onSendRequest,
  onOpenOnboardingModal,
  onOpenGunaMilanModal,
}) => {
  const [selectedMatchModal, setSelectedMatchModal] = useState<KundaliMatchItem | null>(null);

  // Compute Top Kundali Matches (36 Guna Milan) sorted descending
  const topMatches = useMemo(() => {
    return getTopKundaliMatches(myProfile, candidates);
  }, [myProfile, candidates]);

  if (!myProfile) {
    return (
      <div className="bg-white dark:bg-[#1E1B18] p-8 sm:p-12 rounded-3xl border-2 border-amber-300 dark:border-stone-800 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400 text-[#D97706] flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <h3 className="font-bold font-serif text-lg sm:text-xl text-[#7A1C1C] dark:text-amber-300">
            शीर्ष ३६ गुण कुण्डली म्याचिङका लागि जन्म विवरण आवश्यक
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            हजुरको जन्म मिति, समय र स्थानको आधारमा सम्पूर्ण उम्मेदवारहरूसँग ३६ गुण अष्टकूट मिलान तत्काल गणना गरिन्छ।
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenOnboardingModal}
          className="bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-[#92400E] text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>आफ्नो जन्म विवरण दर्ता गर्नुहोस्</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hero Match Engine Banner */}
      <div className="bg-gradient-to-r from-[#7A1C1C] via-[#8B2323] to-[#5C1515] text-white p-5 sm:p-7 rounded-3xl border border-amber-400/40 shadow-xl space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-amber-400/15 to-transparent rounded-full pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/25 border border-amber-300/40 text-amber-200 px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>वैदिक अष्टकूट ३६ गुण म्याचिङ इन्जिन (Vedic Kundali Matching)</span>
          </div>

          <button
            type="button"
            onClick={onOpenOnboardingModal}
            className="text-xs bg-white/15 hover:bg-white/25 text-amber-100 font-bold px-3 py-1.5 rounded-xl border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>मेरो जन्म विवरण: {myProfile.dobBS} ({myProfile.birthTime})</span>
            <span className="text-amber-300 underline">सम्पादन</span>
          </button>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-100 relative z-10">
          {myProfile.displayFirstName || myProfile.userFullName} का लागि शीर्ष कुण्डली मिलेका वर/वधूहरू
        </h2>
        <p className="text-xs sm:text-sm text-amber-200/90 max-w-3xl leading-relaxed relative z-10">
          वैदिक ज्योतिष शास्त्र अनुसार वर र कन्याको जन्म नक्षत्र, राशि तथा चरणका आधारमा ८ कूटहरू (वर्ण, वश्य, तारा, योनि, ग्रहमैत्री, गण, भकूट, नाडी) को ३६ गुण मिलान गरी सबैभन्दा उच्च अङ्क प्राप्त उम्मेदवारहरू प्रस्तुत गरिएको छ।
        </p>

        {/* Quick Privacy Notice */}
        <div className="pt-1 flex items-center gap-2 text-[11px] text-amber-300/90 font-medium relative z-10">
          <Lock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span>गोपनीयताका लागि उम्मेदवारको नाम आधा मात्र लेखिएको छ र अनुहार ब्लर गरिएको छ।</span>
        </div>
      </div>

      {/* Top Matches Cards Grid */}
      <div className="space-y-4">
        {topMatches.length === 0 ? (
          <div className="bg-white dark:bg-[#1E1B18] p-8 rounded-2xl border text-center text-stone-500 text-xs">
            हाल कुनै पनि उम्मेदवार फेला परेन। कृपया फिल्टर वा प्राथमिकता समायोजन गर्नुहोस्।
          </div>
        ) : (
          topMatches.map((item, idx) => {
            const { profile, milanResult, totalGuna, qualityLabelNepali, nadiStatusNepali, bhakootStatusNepali, mangalStatusNepali } = item;
            const maskedName = maskMatrimonialName(profile.userFullName || profile.displayFirstName);

            return (
              <div
                key={profile.id}
                className="bg-white dark:bg-[#1E1B18] rounded-2xl border-2 border-amber-300/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-all p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 relative overflow-hidden group"
              >
                {/* Ranking Tag on top left */}
                <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-black text-[10px] px-3 py-0.5 rounded-br-xl shadow-xs flex items-center gap-1 z-10">
                  <Award className="w-3 h-3 text-amber-200" />
                  <span>शीर्ष मिलान #{idx + 1}</span>
                </div>

                {/* Left Side: Photo with Face Blur + Basic Info */}
                <div className="flex items-start sm:items-center gap-4 flex-1 pt-2 md:pt-0">
                  {/* Photo container with Facial Blurring */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 border-2 border-amber-400/80 shadow-md bg-stone-900 select-none">
                    <img
                      src={profile.profilePhoto}
                      alt={maskedName}
                      className="w-full h-full object-cover filter blur-[8px] scale-110 group-hover:scale-115 transition-transform duration-500 opacity-90"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-1 text-center">
                      <Lock className="w-4 h-4 text-amber-300 drop-shadow" />
                      <span className="text-[9px] text-white font-bold tracking-tight drop-shadow mt-0.5 leading-tight">
                        गोप्य अनुहार
                      </span>
                    </div>
                  </div>

                  {/* Candidate Overview */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-base sm:text-lg font-serif text-[#7A1C1C] dark:text-amber-300 truncate">
                        {maskedName}
                      </h3>
                      <span className="text-[11px] bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-mono font-bold px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                        {profile.profileCode}
                      </span>
                      <span className="text-[11px] bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold px-2 py-0.5 rounded-md">
                        {toDevanagariNumerals(profile.age)} वर्ष | {profile.heightFeetInches}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-xs text-stone-600 dark:text-stone-400">
                      <div className="flex items-center gap-1.5 truncate">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="font-medium truncate text-stone-800 dark:text-stone-200">{profile.education}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Briefcase className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{profile.occupation}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{profile.currentDistrict}, {profile.currentProvince}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{profile.casteEthnicity || 'हिन्दू'} {profile.gotra ? `(${profile.gotra} गोत्र)` : ''}</span>
                      </div>
                    </div>

                    {/* Astrological Match Pill Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border border-emerald-300/80 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>नाडी: {nadiStatusNepali}</span>
                      </span>
                      <span className="bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border border-blue-300/80 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>भकूट: {bhakootStatusNepali}</span>
                      </span>
                      <span className="bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border border-amber-300/80 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>{mangalStatusNepali}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Big 36 Guna Score Box & Actions */}
                <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-amber-200 dark:border-stone-800 md:pl-5">
                  <div className="text-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-stone-900 dark:to-stone-850 p-2.5 sm:p-3 rounded-2xl border border-amber-300 dark:border-amber-700/60 shadow-xs min-w-[140px]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 block">
                      कुल कुण्डली मिलान
                    </span>
                    <div className="flex items-baseline justify-center gap-1 font-serif text-2xl sm:text-3xl font-black text-[#7A1C1C] dark:text-amber-300">
                      <span>{toDevanagariNumerals(totalGuna)}</span>
                      <span className="text-sm font-sans font-bold text-stone-500">/ ३६ गुण</span>
                    </div>
                    <span className="inline-block text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full mt-0.5 shadow-2xs">
                      {qualityLabelNepali}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedMatchModal(item)}
                      className="flex items-center justify-center gap-1 bg-amber-100 hover:bg-amber-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-[#7A1C1C] dark:text-amber-300 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors border border-amber-300 dark:border-stone-700 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>८ कूट विश्लेषण</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSendRequest(profile)}
                      className="flex items-center justify-center gap-1 bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-[#92400E] text-white px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>अनुरोध पठाउनुहोस्</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detailed Ashtakoot 8-Koot Scorecard Modal */}
      {selectedMatchModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#FFFDF9] dark:bg-[#1E1B18] rounded-3xl border-2 border-amber-400 max-w-xl w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b pb-3 border-amber-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#7A1C1C] text-amber-300 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold font-serif text-base text-[#7A1C1C] dark:text-amber-300">
                    वैदिक ३६ गुण अष्टकूट विस्तृत विवरण
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {myProfile.displayFirstName} र {maskMatrimonialName(selectedMatchModal.profile.userFullName)} बीचको मिलान
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMatchModal(null)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Total Summary */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-stone-900 dark:to-stone-850 p-3.5 rounded-2xl border border-amber-300 flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-600 dark:text-stone-400">कुल अष्टकूट प्राप्ताङ्क:</span>
                <div className="text-2xl font-black font-serif text-[#7A1C1C] dark:text-amber-300">
                  {toDevanagariNumerals(selectedMatchModal.totalGuna)} / ३६ गुण
                </div>
              </div>
              <div className="text-right">
                <span className="bg-emerald-600 text-white font-bold px-3 py-1 rounded-full text-xs shadow-xs">
                  {selectedMatchModal.qualityLabelNepali} मिलान
                </span>
              </div>
            </div>

            {/* 8 Koot Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-amber-100/80 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border-b border-amber-300">
                    <th className="p-2 text-left">कूट नाम</th>
                    <th className="p-2">पूर्णाङ्क</th>
                    <th className="p-2">प्राप्ताङ्क</th>
                    <th className="p-2">वरको विशेषता</th>
                    <th className="p-2">कन्याको विशेषता</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-[11px]">
                  {selectedMatchModal.milanResult.ashtakoot.map((k, i) => (
                    <tr key={i} className="hover:bg-amber-50/50 dark:hover:bg-stone-850">
                      <td className="p-2 text-left font-bold text-stone-800 dark:text-stone-200">
                        {k.kootNepali}
                      </td>
                      <td className="p-2 font-mono text-stone-500">{toDevanagariNumerals(k.maxPoints)}</td>
                      <td className="p-2 font-mono font-bold text-[#7A1C1C] dark:text-amber-300">
                        {toDevanagariNumerals(k.obtainedPoints)}
                      </td>
                      <td className="p-2 text-stone-600 dark:text-stone-400">{k.boyAttr}</td>
                      <td className="p-2 text-stone-600 dark:text-stone-400">{k.girlAttr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Astrological Summary Note */}
            <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-200 text-xs text-stone-700 dark:text-stone-300 space-y-1">
              <p><strong>ज्योतिषीय परामर्श:</strong> {selectedMatchModal.milanResult.recommendationNepali}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedMatchModal(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold cursor-pointer"
              >
                बन्द गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={() => {
                  const prof = selectedMatchModal.profile;
                  setSelectedMatchModal(null);
                  onSendRequest(prof);
                }}
                className="bg-[#7A1C1C] hover:bg-[#991B1B] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>यस प्रोफाइललाई अनुरोध पठाउनुहोस्</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
