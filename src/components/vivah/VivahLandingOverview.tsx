import React, { useState, useMemo } from 'react';
import { 
  Users, 
  ShieldCheck, 
  HeartHandshake, 
  Sparkles, 
  Search, 
  CheckCircle, 
  Lock, 
  MessageSquare, 
  PlusCircle, 
  ChevronRight,
  UserPlus,
  FileText,
  Award,
  Calendar,
  Edit3
} from 'lucide-react';
import { VivahProfile, VivahAdvertisement, ProfileGender } from '../../types/vivahTypes';
import { VivahProfileCard } from './VivahProfileCard';
import { getTopKundaliMatches } from '../../utils/vivahPrivacyHelper';

interface VivahLandingOverviewProps {
  profiles: VivahProfile[];
  advertisements: VivahAdvertisement[];
  favorites: string[];
  myProfile?: VivahProfile | null;
  onOpenOnboardingModal?: () => void;
  onToggleFavorite: (id: string) => void;
  onViewProfile: (profile: VivahProfile) => void;
  onSendRequest: (profile: VivahProfile) => void;
  onNavigateTab: (tabKey: string) => void;
  onQuickSearch: (gender: ProfileGender, district: string) => void;
}

export const VivahLandingOverview: React.FC<VivahLandingOverviewProps> = ({
  profiles,
  advertisements,
  favorites,
  myProfile,
  onOpenOnboardingModal,
  onToggleFavorite,
  onViewProfile,
  onSendRequest,
  onNavigateTab,
  onQuickSearch,
}) => {
  const [searchGender, setSearchGender] = useState<ProfileGender>('BRIDE');
  const [searchDistrict, setSearchDistrict] = useState<string>('');

  const featuredProfiles = profiles.filter(p => p.isActive && p.verificationLevel === 'ADMIN_VERIFIED').slice(0, 4);
  const totalProfiles = profiles.length;
  const totalGrooms = profiles.filter(p => p.gender === 'GROOM').length;
  const totalBrides = profiles.filter(p => p.gender === 'BRIDE').length;
  const verifiedCount = profiles.filter(p => p.verificationLevel === 'ADMIN_VERIFIED').length;

  // Calculate top 36 Guna matches for current user
  const topKundaliMatches = useMemo(() => {
    return getTopKundaliMatches(myProfile || null, profiles).slice(0, 4);
  }, [myProfile, profiles]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-white p-6 sm:p-10 border border-amber-800/60 shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-200 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>नेपालको विश्वासिलो वैदिक विवाह ब्यूरो (Nepali Matrimonial Portal)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold font-serif leading-tight text-amber-100">
            विवाह मञ्च — सुरक्षित, मर्यादित र परम्परागत नेपाली विवाह सम्बन्ध
          </h1>

          <p className="text-xs sm:text-base text-amber-100/90 leading-relaxed">
            बालानन्द ज्योतिष, वास्तु तथा कर्मकाण्ड सेवाको प्रमाणित वैवाहिक प्रणाली। व्यक्तिगत गोपनीयता (Privacy-First) लाई सर्वोपरी राखी सुयोग्य वर/वधू खोज्न मद्दत गर्दछौँ।
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigateTab('REGISTER')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold px-5 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 text-xs sm:text-sm"
            >
              <UserPlus className="w-4 h-4 text-stone-950" />
              <span>नयाँ विवाह प्रोफाइल दर्ता गर्नुहोस्</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('SEARCH')}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 rounded-xl border border-white/20 transition-all flex items-center gap-2 text-xs sm:text-sm backdrop-blur-md"
            >
              <Search className="w-4 h-4 text-amber-300" />
              <span>सुयोग्य जोडी खोज्नुहोस्</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Search Widget */}
      <div className="bg-white dark:bg-[#1E1B18] p-4 sm:p-6 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
          <Search className="w-4 h-4 text-[#D97706]" />
          <span>द्रुत जोडी खोज (Quick Search)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-stone-500 mb-1">म खोज्दैछु (Looking for):</label>
            <select
              value={searchGender}
              onChange={(e) => setSearchGender(e.target.value as ProfileGender)}
              className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2.5 text-xs font-semibold"
            >
              <option value="BRIDE">वधू प्रोफाइल (Bride Profiles)</option>
              <option value="GROOM">वर प्रोफाइल (Groom Profiles)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-stone-500 mb-1">मुख्य जिल्ला / क्षेत्र (District):</label>
            <select
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
              className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2.5 text-xs font-semibold"
            >
              <option value="">सबै जिल्लाहरू (All Districts)</option>
              <option value="काठमाडौँ">काठमाडौँ (Kathmandu)</option>
              <option value="ललितपुर">ललितपुर (Lalitpur)</option>
              <option value="भक्तपुर">भक्तपुर (Bhaktapur)</option>
              <option value="कास्की">कास्की / पोखरा (Pokhara)</option>
              <option value="चितवन">चितवन (Chitwan)</option>
              <option value="रूपन्देही">रूपन्देही / बुटवल</option>
              <option value="मोरङ">मोरङ / विराटनगर</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => onQuickSearch(searchGender, searchDistrict)}
              className="w-full bg-[#D97706] hover:bg-[#B45309] text-white font-bold py-2.5 px-4 rounded-xl shadow transition-colors flex items-center justify-center gap-2 text-xs"
            >
              <Search className="w-4 h-4" />
              <span>खोज्नुहोस् (Search Now)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-amber-50/80 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex items-center gap-3">
          <div className="p-2.5 bg-amber-500 text-stone-950 rounded-xl font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-stone-900 dark:text-stone-100 block">{totalProfiles}</span>
            <span className="text-[11px] text-stone-600 dark:text-stone-400">कुल दर्ता प्रोफाइल</span>
          </div>
        </div>

        <div className="bg-amber-50/80 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex items-center gap-3">
          <div className="p-2.5 bg-[#1E3A8A] text-white rounded-xl font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-stone-900 dark:text-stone-100 block">{totalGrooms}</span>
            <span className="text-[11px] text-stone-600 dark:text-stone-400">वर प्रोफाइलहरू</span>
          </div>
        </div>

        <div className="bg-amber-50/80 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex items-center gap-3">
          <div className="p-2.5 bg-[#991B1B] text-white rounded-xl font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-stone-900 dark:text-stone-100 block">{totalBrides}</span>
            <span className="text-[11px] text-stone-600 dark:text-stone-400">वधू प्रोफाइलहरू</span>
          </div>
        </div>

        <div className="bg-amber-50/80 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex items-center gap-3">
          <div className="p-2.5 bg-[#15803D] text-white rounded-xl font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-stone-900 dark:text-stone-100 block">{verifiedCount}</span>
            <span className="text-[11px] text-stone-600 dark:text-stone-400">प्रमाणित प्रोफाइल</span>
          </div>
        </div>
      </div>

      {/* Birth Details Status & Onboarding / Login Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/15 to-orange-500/10 border-2 border-amber-400/50 dark:border-amber-600/40 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500 text-stone-950 rounded-2xl shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold font-serif text-base sm:text-lg text-amber-950 dark:text-amber-200">
                वैदिक कुण्डली ३६ गुण मिलान प्रणाली
              </h3>
              {myProfile ? (
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                  ✓ जन्म विवरण सक्रिय
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                  विवरण आवश्यक
                </span>
              )}
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
              {myProfile
                ? `${myProfile.userFullName || myProfile.displayFirstName} | जन्म मिति: ${myProfile.dobBS} (${myProfile.birthTime || 'समय उपलब्ध'}) | स्थान: ${myProfile.birthPlace || myProfile.currentDistrict} | गोत्र: ${myProfile.gotra || 'उपलब्ध छैन'}`
                : '३६ गुण अष्टकूट मिलानका लागि आफ्नो जन्म मिति, समय र स्थान दर्ता गर्नुहोस्।'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenOnboardingModal}
          className="bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-[#92400E] text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 text-xs shrink-0 cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-amber-200" />
          <span>{myProfile ? 'जन्म विवरण सम्पादन गर्नुहोस्' : 'जन्म विवरण भर्नुहोस् (अनिवार्य)'}</span>
        </button>
      </div>

      {/* Top 36 Guna Matches Section */}
      {topKundaliMatches.length > 0 && (
        <div className="space-y-4 bg-gradient-to-br from-amber-50/60 to-orange-50/30 dark:from-stone-900/60 dark:to-stone-900/30 p-4 sm:p-6 rounded-3xl border-2 border-amber-300/80 dark:border-stone-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-900 dark:text-amber-200 px-3 py-0.5 rounded-full text-xs font-bold mb-1 border border-amber-300/60">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>शीर्ष कुण्डली म्याचिङ (Top 36 Guna Matches)</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
                {myProfile?.displayFirstName || 'हजुर'} का लागि सबैभन्दा उच्च गुण मिलेका जोडीहरू
              </h2>
              <p className="text-xs text-stone-500">
                गोपनीयताका लागि नाम आधा मात्र लेखिएको छ र फोटोको अनुहार ब्लर गरिएको छ।
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('MATCH')}
              className="text-xs text-[#D97706] hover:underline font-bold flex items-center gap-1 self-start sm:self-auto"
            >
              <span>सबै ३६ गुण मिलान हेर्नुहोस्</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topKundaliMatches.map((m) => (
              <VivahProfileCard
                key={m.profile.id}
                profile={m.profile}
                isFavorite={favorites.includes(m.profile.id)}
                gunaScore={m.totalGuna}
                qualityLabel={m.qualityLabelNepali}
                isTopMatch={true}
                onToggleFavorite={onToggleFavorite}
                onViewProfile={onViewProfile}
                onSendRequest={onSendRequest}
              />
            ))}
          </div>
        </div>
      )}

      {/* Featured Verified Profiles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#D97706]" />
              <span>प्रमाणित विशेष प्रोफाइलहरू (Featured Verified Profiles)</span>
            </h2>
            <p className="text-xs text-stone-500">एडमिनद्वारा पहिचान तथा कागजात प्रमाणीकरण गरिएका सुयोग्य प्रोफाइलहरू</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('SEARCH')}
            className="text-xs text-[#D97706] hover:underline font-bold flex items-center gap-1"
          >
            <span>सबै हेर्नुहोस्</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredProfiles.map((p) => (
            <VivahProfileCard
              key={p.id}
              profile={p}
              isFavorite={favorites.includes(p.id)}
              onToggleFavorite={onToggleFavorite}
              onViewProfile={onViewProfile}
              onSendRequest={onSendRequest}
            />
          ))}
        </div>
      </div>

      {/* Active Marriage Advertisements Showcase */}
      {advertisements.length > 0 && (
        <div className="bg-gradient-to-r from-amber-900/10 via-amber-800/5 to-amber-900/10 p-5 rounded-2xl border border-amber-200 dark:border-amber-800/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-serif text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#D97706]" />
              <span>ताजा विवाह विज्ञापनहरू (Marriage Advertisements)</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigateTab('ADS')}
              className="text-xs text-[#D97706] font-bold hover:underline"
            >
              विज्ञापन मञ्च हेर्नुहोस्
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advertisements.slice(0, 2).map((ad) => (
              <div key={ad.id} className="bg-white dark:bg-[#1E1B18] p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-start gap-3">
                <img src={ad.photoUrl} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0 border border-amber-300" />
                <div className="space-y-1 text-xs">
                  <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
                    {ad.gender === 'GROOM' ? 'वर विज्ञापन' : 'वधू विज्ञापन'}
                  </span>
                  <h4 className="font-bold text-stone-900 dark:text-stone-100">{ad.candidateName}</h4>
                  <p className="text-stone-600 dark:text-stone-400 line-clamp-2">{ad.familySummary}</p>
                  <p className="text-[#D97706] font-medium">अपेक्षा: {ad.partnerExpectations}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How it Works / Privacy First Guarantees */}
      <div className="bg-stone-50 dark:bg-stone-900/60 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100">
            विवाह मञ्च कसरी काम गर्दछ? (How It Works)
          </h3>
          <p className="text-xs text-stone-500">४ सरल र पूर्ण रूपमा सुरक्षित चरणहरू</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="bg-white dark:bg-[#1E1B18] p-4 rounded-2xl border border-stone-200 dark:border-stone-800 text-center space-y-2">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950 text-[#D97706] rounded-xl flex items-center justify-center font-bold mx-auto">1</div>
            <h4 className="font-bold text-stone-900 dark:text-stone-100">१. दर्ता र प्रोफाइल तयार</h4>
            <p className="text-stone-500">आफ्नो वा परिवारको सदस्यको विवाह विवरण, गोत्र र प्राथमिकता भर्नुहोस्।</p>
          </div>

          <div className="bg-white dark:bg-[#1E1B18] p-4 rounded-2xl border border-stone-200 dark:border-stone-800 text-center space-y-2">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950 text-[#D97706] rounded-xl flex items-center justify-center font-bold mx-auto">2</div>
            <h4 className="font-bold text-stone-900 dark:text-stone-100">२. सुयोग्य जोडी खोज</h4>
            <p className="text-stone-500">शिक्षा, पेशा, उमेर र ज्योतिषीय गुण मिलानका आधारमा छनोट गर्नुहोस्।</p>
          </div>

          <div className="bg-white dark:bg-[#1E1B18] p-4 rounded-2xl border border-stone-200 dark:border-stone-800 text-center space-y-2">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950 text-[#D97706] rounded-xl flex items-center justify-center font-bold mx-auto">3</div>
            <h4 className="font-bold text-stone-900 dark:text-stone-100">३. विवाह अनुरोध पठाउनुहोस्</h4>
            <p className="text-stone-500">सुरुमा फोन नम्बर र ठेगाना सार्वजनिक नभई इन-एप अनुरोध पठाउनुहोस्।</p>
          </div>

          <div className="bg-white dark:bg-[#1E1B18] p-4 rounded-2xl border border-stone-200 dark:border-stone-800 text-center space-y-2">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950 text-[#D97706] rounded-xl flex items-center justify-center font-bold mx-auto">4</div>
            <h4 className="font-bold text-stone-900 dark:text-stone-100">४. स्वीकृति र सम्पर्क आदान-प्रदान</h4>
            <p className="text-stone-500">दुवै पक्षको सहमति र एडमिन प्रमाणीकरण पछि मात्र सम्पर्क विवरण सेयर हुन्छ।</p>
          </div>
        </div>
      </div>
    </div>
  );
};
