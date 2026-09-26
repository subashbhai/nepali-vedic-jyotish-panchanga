import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Send, 
  ShieldCheck, 
  Lock, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  User, 
  Calendar, 
  Sparkles, 
  AlertTriangle, 
  Ban, 
  CheckCircle,
  Users,
  Home,
  Check,
  Phone,
  Mail,
  Building,
  HeartHandshake
} from 'lucide-react';
import { VivahProfile } from '../../types/vivahTypes';
import { maskMatrimonialName } from '../../utils/vivahPrivacyHelper';

interface VivahProfileDetailModalProps {
  profile: VivahProfile | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSendRequest: (profile: VivahProfile) => void;
  onReportProfile: (profile: VivahProfile) => void;
  onBlockProfile: (profile: VivahProfile) => void;
  onCheckAstroMilan?: (profile: VivahProfile) => void;
  connectionStatus?: 'NONE' | 'PENDING' | 'ACCEPTED' | 'APPROVED_BY_ADMIN';
  permittedContactPhone?: string;
  permittedContactEmail?: string;
}

export const VivahProfileDetailModal: React.FC<VivahProfileDetailModalProps> = ({
  profile,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onSendRequest,
  onReportProfile,
  onBlockProfile,
  onCheckAstroMilan,
  connectionStatus = 'NONE',
  permittedContactPhone,
  permittedContactEmail,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FAMILY' | 'PREFERENCES' | 'ASTRO'>('OVERVIEW');

  if (!isOpen || !profile) return null;

  const maskedName = maskMatrimonialName(profile.userFullName || profile.displayFirstName);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#1E1B18] text-[#2D241E] dark:text-stone-100 w-full max-w-4xl rounded-3xl border border-[#E6E0D5] dark:border-stone-800 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header Modal Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white flex items-center justify-between gap-4 border-b border-amber-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-600/30 rounded-xl border border-amber-400/30">
              <HeartHandshake className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-serif text-amber-100">{maskedName}</h2>
                <span className="text-xs bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded font-mono border border-amber-400/30">
                  {profile.profileCode}
                </span>
              </div>
              <p className="text-xs text-amber-200/80">
                {profile.gender === 'GROOM' ? 'वर बायोडाटा (Groom Profile)' : 'वधू बायोडाटा (Bride Profile)'} | {profile.currentDistrict}, {profile.currentProvince}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleFavorite(profile.id)}
              className={`p-2 rounded-xl backdrop-blur-md transition-colors ${
                isFavorite ? 'bg-rose-600 text-white' : 'bg-white/10 hover:bg-white/20 text-stone-200'
              }`}
              title="मनपर्नेमा राख्नुहोस्"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Banner Profile Summary Card */}
          <div className="bg-stone-50 dark:bg-stone-900/60 rounded-2xl p-4 sm:p-5 border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row items-center md:items-start gap-5">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden shrink-0 border-2 border-amber-500/40 shadow-lg bg-stone-900 select-none">
              <img
                src={profile.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                alt={maskedName}
                className="w-full h-full object-cover filter blur-[8px] scale-110"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-2 text-center pointer-events-none">
                <Lock className="w-4 h-4 text-amber-300 drop-shadow mb-1" />
                <span className="text-[10px] text-white font-bold tracking-tight drop-shadow leading-tight">
                  गोपनीयताका लागि अनुहार ब्लर
                </span>
                <span className="text-[9px] text-amber-200/90 mt-0.5">
                  स्वीकृति पछि मात्र खुल्ने
                </span>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-bold text-xs px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-800">
                  {profile.gender === 'GROOM' ? 'वर (Groom)' : 'वधू (Bride)'}
                </span>
                <span className="bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold px-2.5 py-1 rounded-lg">
                  {profile.age} वर्ष | उचाइ: {profile.heightFeetInches}
                </span>
                {profile.verificationLevel === 'ADMIN_VERIFIED' && (
                  <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> प्रमाणिक प्रोफाइल (Admin Verified)
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold font-serif text-[#2D241E] dark:text-stone-100">
                {maskedName} ({profile.education})
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
                {profile.occupation} | {profile.monthlyIncomeRange} | {profile.employedIn === 'GOVT' ? 'सरकारी सेवा' : profile.employedIn === 'PRIVATE' ? 'निजी क्षेत्र' : 'व्यापार/व्यवसाय'}
              </p>

              {/* Privacy Contact Info Protection Box */}
              <div className="mt-3 p-3 rounded-xl border transition-colors bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60">
                {connectionStatus === 'APPROVED_BY_ADMIN' ? (
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                      <CheckCircle className="w-4 h-4" />
                      <span>सम्पर्क आदान-प्रदान स्वीकृत (Approved Connection)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-stone-800 dark:text-stone-200">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-600" />
                        <span>फोन: {permittedContactPhone || profile.contactPhone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-amber-600" />
                        <span>ईमेल: {permittedContactEmail || profile.contactEmail}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-medium">
                      <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <p className="font-bold">सम्पर्क विवरण सुरक्षित छ (Contact Information Hidden)</p>
                        <p className="text-[11px] text-stone-600 dark:text-stone-400 font-sans">
                          {connectionStatus === 'PENDING'
                            ? 'अनुरोध पठाइएको छ। स्वीकृति पछि मात्र सम्पर्क विवरण आदानप्रदान हुन्छ।'
                            : connectionStatus === 'ACCEPTED'
                            ? 'अनुरोध स्वीकृत भएको छ। एडमिन प्रमाणीकरण पछि पूर्ण सम्पर्क खुला हुनेछ।'
                            : 'विवाह अनुरोध स्वीकृत भई दुवै पक्षको सहमति पछि मात्र सम्पर्क विवरण देखाइन्छ।'}
                        </p>
                      </div>
                    </div>
                    <span className="bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 text-[10px] font-bold px-2 py-1 rounded shrink-0">
                      Privacy-First
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-xl transition-colors whitespace-nowrap ${
                activeTab === 'OVERVIEW'
                  ? 'bg-[#D97706] text-white shadow'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              व्यक्तिगत विवरण
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('FAMILY')}
              className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-xl transition-colors whitespace-nowrap ${
                activeTab === 'FAMILY'
                  ? 'bg-[#D97706] text-white shadow'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              पारिवारिक पृष्ठभूमिका
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PREFERENCES')}
              className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-xl transition-colors whitespace-nowrap ${
                activeTab === 'PREFERENCES'
                  ? 'bg-[#D97706] text-white shadow'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              सुयोग्य जोडी अपेक्षा
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ASTRO')}
              className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-xl transition-colors whitespace-nowrap ${
                activeTab === 'ASTRO'
                  ? 'bg-[#D97706] text-white shadow'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              ज्योतिषीय जानकारी
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-stone-50 dark:bg-stone-900/50 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
                  <span className="text-stone-500 dark:text-stone-400 block font-medium">जन्म मिति (ई.सं. / वि.सं.)</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{profile.dobAD} ({profile.dobBS})</span>
                </div>
                <div className="bg-stone-50 dark:bg-stone-900/50 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
                  <span className="text-stone-500 dark:text-stone-400 block font-medium">वैवाहिक स्थिति</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">
                    {profile.maritalStatus === 'NEVER_MARRIED' ? 'अविवाहित (Never Married)' : profile.maritalStatus}
                  </span>
                </div>
                <div className="bg-stone-50 dark:bg-stone-900/50 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
                  <span className="text-stone-500 dark:text-stone-400 block font-medium">धर्म तथा वर्ण/समुदाय</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{profile.religion} | {profile.casteEthnicity || 'उल्लेख नगरिएको'}</span>
                </div>
                <div className="bg-stone-50 dark:bg-stone-900/50 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
                  <span className="text-stone-500 dark:text-stone-400 block font-medium">गोत्र (Gotra)</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{profile.gotra || 'उपलब्ध छैन'}</span>
                </div>
                <div className="bg-stone-50 dark:bg-stone-900/50 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
                  <span className="text-stone-500 dark:text-stone-400 block font-medium">हालको ठेगाना</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{profile.currentDistrict}, {profile.currentProvince}</span>
                </div>
                <div className="bg-stone-50 dark:bg-stone-900/50 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
                  <span className="text-stone-500 dark:text-stone-400 block font-medium">स्थायी ठेगाना</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{profile.permanentAddress}</span>
                </div>
                <div className="bg-stone-50 dark:bg-stone-900/50 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
                  <span className="text-stone-500 dark:text-stone-400 block font-medium">आहार रोजाइ (Diet)</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">
                    {profile.diet === 'VEG' ? 'शाकाहारी (Pure Veg)' : profile.diet === 'EGG' ? 'अण्डाल्प शाकाहारी' : 'मांसाहारी'}
                  </span>
                </div>
                <div className="bg-stone-50 dark:bg-stone-900/50 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
                  <span className="text-stone-500 dark:text-stone-400 block font-medium">धुम्रपान/मद्यपान</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">
                    {profile.drinkingSmoking === 'NO' ? 'गर्दिँन (No)' : profile.drinkingSmoking === 'OCCASIONAL' ? 'कदाचित (Occasional)' : 'गर्छु'}
                  </span>
                </div>
                <div className="bg-stone-50 dark:bg-stone-900/50 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
                  <span className="text-stone-500 dark:text-stone-400 block font-medium">मासिक आम्दानी</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{profile.monthlyIncomeRange}</span>
                </div>
              </div>

              <div className="bg-[#FAF7F2] dark:bg-stone-900/80 p-4 rounded-xl border border-[#E6E0D5] dark:border-stone-800 space-y-1">
                <h4 className="font-bold text-[#D97706]">आफ्नो बारेमा (About Me):</h4>
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed font-sans">{profile.aboutMe}</p>
              </div>

              {profile.hobbiesInterests && profile.hobbiesInterests.length > 0 && (
                <div className="space-y-1">
                  <h4 className="font-bold text-stone-800 dark:text-stone-200">रुचि र सौखहरू:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.hobbiesInterests.map((hobby, idx) => (
                      <span key={idx} className="bg-amber-100/70 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 text-xs px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                        {hobby}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Family */}
          {activeTab === 'FAMILY' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-stone-50 dark:bg-stone-900/50 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1">
                  <span className="text-stone-500 dark:text-stone-400 font-medium block">बुबाको पेशा/विवरण</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{profile.fatherOccupation || 'उल्लेख नगरिएको'}</span>
                </div>
                <div className="bg-stone-50 dark:bg-stone-900/50 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1">
                  <span className="text-stone-500 dark:text-stone-400 font-medium block">आमाको पेशा/विवरण</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{profile.motherOccupation || 'उल्लेख नगरिएको'}</span>
                </div>
                <div className="bg-stone-50 dark:bg-stone-900/50 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1">
                  <span className="text-stone-500 dark:text-stone-400 font-medium block">दाजुभाइ तथा दिदीबहिनी</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">{profile.siblingsInfo || 'उल्लेख नगरिएको'}</span>
                </div>
                <div className="bg-stone-50 dark:bg-stone-900/50 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1">
                  <span className="text-stone-500 dark:text-stone-400 font-medium block">परिवारको प्रकार र मान्यता</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">
                    {profile.familyType === 'JOINT' ? 'संयुक्त परिवार' : 'एकल परिवार'} | {profile.familyValues === 'TRADITIONAL' ? 'परम्परागत' : profile.familyValues === 'MODERATE' ? 'मध्यममार्गी' : 'उदार'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Partner Preferences */}
          {activeTab === 'PREFERENCES' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="bg-amber-50/60 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 space-y-3">
                <h4 className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" /> सुयोग्य जोडीका प्राथमिकताहरू (Partner Expectations)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-stone-500 block">उमेर सीमा:</span>
                    <span className="font-bold">{profile.partnerPreferences.minAge} देखि {profile.partnerPreferences.maxAge} वर्ष</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">उचाइ सीमा:</span>
                    <span className="font-bold">{profile.partnerPreferences.minHeightFeet} - {profile.partnerPreferences.maxHeightFeet} फिट</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">न्यूनतम शिक्षा:</span>
                    <span className="font-bold">{profile.partnerPreferences.minEducation}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">रुचाइएका पेशाहरू:</span>
                    <span className="font-bold">{profile.partnerPreferences.preferredProfessions?.join(', ') || 'सबै पेशा स्वीकार्य'}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">रुचाइएका जिल्ला/क्षेत्र:</span>
                    <span className="font-bold">{profile.partnerPreferences.preferredDistricts?.join(', ') || 'नेपालभरि'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Astro & Compatibility */}
          {activeTab === 'ASTRO' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="bg-stone-50 dark:bg-stone-900/50 p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-3">
                <h4 className="font-bold text-stone-800 dark:text-stone-200">जन्म विवरण तथा कुण्डली जानकारी:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-stone-500 block">जन्म समय:</span>
                    <span className="font-bold">{profile.birthTime || 'उल्लेख नगरिएको'}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">जन्म स्थान:</span>
                    <span className="font-bold">{profile.birthPlace || profile.currentDistrict}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">गोत्र:</span>
                    <span className="font-bold">{profile.gotra || 'उपलब्ध छैन'}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onCheckAstroMilan?.(profile)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-2.5 px-5 rounded-xl shadow transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>ज्योतिषीय गुण मिलान परीक्षण गर्नुहोस् (Astro Compatibility)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Safety & Report Actions Footer Bar */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onReportProfile(profile)}
                className="hover:text-rose-600 flex items-center gap-1 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>प्रतिवेदन/रिपोर्ट गर्नुहोस्</span>
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => onBlockProfile(profile)}
                className="hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1 transition-colors"
              >
                <Ban className="w-3.5 h-3.5 text-stone-500" />
                <span>अवरोध (Block) गर्नुहोस्</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSendRequest(profile)}
                className="flex items-center gap-1.5 bg-[#D97706] hover:bg-[#B45309] text-white font-bold px-5 py-2.5 rounded-xl shadow transition-colors text-xs"
              >
                <Send className="w-4 h-4" />
                <span>सम्पर्क / विवाह अनुरोध पठाउनुहोस्</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
