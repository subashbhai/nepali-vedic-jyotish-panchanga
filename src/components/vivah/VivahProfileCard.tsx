import React from 'react';
import { 
  Heart, 
  Send, 
  CheckCircle, 
  Shield, 
  ShieldCheck, 
  Lock, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  User, 
  Calendar,
  Sparkles,
  Eye
} from 'lucide-react';
import { VivahProfile } from '../../types/vivahTypes';
import { maskMatrimonialName } from '../../utils/vivahPrivacyHelper';
import { toDevanagariNumerals } from '../../utils/nepaliCalendar';

interface VivahProfileCardProps {
  profile: VivahProfile;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onViewProfile: (profile: VivahProfile) => void;
  onSendRequest: (profile: VivahProfile) => void;
  matchScore?: number;
  gunaScore?: number; // e.g. 28/36
  qualityLabel?: string;
  isTopMatch?: boolean;
}

export const VivahProfileCard: React.FC<VivahProfileCardProps> = ({
  profile,
  isFavorite,
  onToggleFavorite,
  onViewProfile,
  onSendRequest,
  matchScore,
  gunaScore,
  qualityLabel,
  isTopMatch = false,
}) => {
  const maskedName = maskMatrimonialName(profile.userFullName || profile.displayFirstName);

  const getVerificationBadge = () => {
    switch (profile.verificationLevel) {
      case 'ADMIN_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 bg-[#15803D] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
            <ShieldCheck className="w-3 h-3" /> प्रमाणीकृत
          </span>
        );
      case 'ID_SUBMITTED':
      case 'MOBILE_VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 bg-[#0284C7] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
            <CheckCircle className="w-3 h-3" /> फोन प्रमाणित
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-stone-500 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
            <Shield className="w-3 h-3" /> प्रोफाइल
          </span>
        );
    }
  };

  const getGenderBadge = () => {
    return profile.gender === 'GROOM' ? (
      <span className="bg-[#1E3A8A] text-white text-xs font-bold px-2.5 py-0.5 rounded-md">
        वर (Groom)
      </span>
    ) : (
      <span className="bg-[#991B1B] text-white text-xs font-bold px-2.5 py-0.5 rounded-md">
        वधू (Bride)
      </span>
    );
  };

  return (
    <div className={`bg-white dark:bg-[#1E1B18] rounded-2xl border ${
      isTopMatch ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-[#E6E0D5] dark:border-stone-800'
    } shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group`}>
      {/* Top Banner & Blurred Photo */}
      <div>
        <div className="relative h-60 w-full bg-stone-900 overflow-hidden select-none">
          {/* Facial Blurring applied directly to photo */}
          <img
            src={profile.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
            alt={maskedName}
            className="w-full h-full object-cover filter blur-[8px] scale-110 group-hover:scale-115 transition-transform duration-500 opacity-90"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />

          {/* Privacy Protection Center Stamp */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center pointer-events-none">
            <div className="bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white flex items-center gap-1.5 shadow-xl">
              <Lock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="text-[10px] font-bold tracking-wide">गोपनीयताका लागि अनुहार ब्लर गरिएको</span>
            </div>
            <span className="text-[9px] text-amber-200/90 font-medium mt-1 drop-shadow">
              आपसी अनुरोध स्वीकृत भएपछि मात्र स्पष्ट देखिने
            </span>
          </div>

          {/* Top Floating Overlay Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
            <div className="flex items-center gap-1.5 flex-wrap">
              {getGenderBadge()}
              {getVerificationBadge()}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(profile.id);
              }}
              className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer ${
                isFavorite
                  ? 'bg-rose-600 text-white shadow-lg scale-110'
                  : 'bg-black/50 text-white hover:bg-rose-500 hover:text-white'
              }`}
              title={isFavorite ? 'मनपर्ने सूचीबाट हटाउनुहोस्' : 'मनपर्नेमा थप्नुहोस्'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Top 36 Guna Match Badge */}
          {gunaScore !== undefined && (
            <div className="absolute top-12 left-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white backdrop-blur-md font-extrabold text-xs px-2.5 py-1 rounded-lg border border-amber-300/60 shadow-lg flex items-center gap-1.5 z-10">
              <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
              <span>{toDevanagariNumerals(gunaScore)}/३६ गुण मिलेको {qualityLabel ? `(${qualityLabel})` : ''}</span>
            </div>
          )}

          {/* Bottom Title on Image with Masked Name */}
          <div className="absolute bottom-3 left-3 right-3 text-white z-10">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-lg sm:text-xl font-bold font-serif text-white drop-shadow-md truncate">
                {maskedName}
              </h3>
              <span className="text-[11px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-amber-200 font-mono shrink-0">
                {profile.profileCode}
              </span>
            </div>
            <p className="text-xs text-stone-200 flex items-center gap-1.5 mt-0.5 font-medium">
              <Calendar className="w-3 h-3 text-amber-400" />
              <span>{toDevanagariNumerals(profile.age)} वर्ष</span>
              <span>•</span>
              <span>{profile.heightFeetInches}</span>
              {profile.gotra && (
                <>
                  <span>•</span>
                  <span className="text-amber-300 font-semibold">{profile.gotra} गोत्र</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Card Body Information */}
        <div className="p-4 space-y-3 text-xs sm:text-sm">
          <div className="grid grid-cols-1 gap-1.5 text-stone-700 dark:text-stone-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
              <span className="truncate">{profile.currentDistrict}, {profile.currentProvince}</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
              <span className="truncate font-semibold text-stone-800 dark:text-stone-200">{profile.education}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
              <span className="truncate">{profile.occupation} ({profile.monthlyIncomeRange})</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
              <span className="truncate">
                {profile.maritalStatus === 'NEVER_MARRIED' ? 'अविवाहित' : 'विवाहयोग्य'} | {profile.casteEthnicity || profile.religion}
              </span>
            </div>
          </div>

          {/* Short Introduction */}
          <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 italic bg-stone-50 dark:bg-stone-900/50 p-2 rounded-lg border border-stone-100 dark:border-stone-800">
            "{profile.aboutMe}"
          </p>

          {/* Privacy Discretion Guarantee */}
          <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-2 flex items-center justify-between text-xs text-amber-950 dark:text-amber-300">
            <div className="flex items-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>नाम तथा सम्पर्क विवरण सुरक्षित</span>
            </div>
            <span className="text-[10px] bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold px-2 py-0.5 rounded-md">
              गोप्य तथा सुरक्षित
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 pt-0 border-t border-stone-100 dark:border-stone-800/80 flex items-center gap-2 mt-2">
        <button
          type="button"
          onClick={() => onViewProfile(profile)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-[#2D241E] dark:text-stone-200 py-2.5 px-3 rounded-xl font-bold text-xs transition-colors border border-stone-200 dark:border-stone-700 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-[#D97706]" />
          <span>विवरण तथा कुण्डली</span>
        </button>

        <button
          type="button"
          onClick={() => onSendRequest(profile)}
          className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-[#92400E] text-white py-2.5 px-3 rounded-xl font-bold text-xs transition-all shadow-sm hover:shadow cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>अनुरोध पठाउनुहोस्</span>
        </button>
      </div>
    </div>
  );
};
