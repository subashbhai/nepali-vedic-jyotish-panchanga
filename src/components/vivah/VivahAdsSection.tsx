import React, { useState } from 'react';
import { 
  FileText, 
  PlusCircle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ShieldAlert, 
  Lock, 
  Send, 
  Sparkles,
  Eye,
  Edit,
  Phone
} from 'lucide-react';
import { VivahAdvertisement, VivahProfile, AdStatus } from '../../types/vivahTypes';

interface VivahAdsSectionProps {
  ads: VivahAdvertisement[];
  userProfile: VivahProfile | null;
  onCreateAd: (ad: VivahAdvertisement) => void;
  onViewProfile?: (profileId: string) => void;
}

export const VivahAdsSection: React.FC<VivahAdsSectionProps> = ({
  ads,
  userProfile,
  onCreateAd,
  onViewProfile,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterGender, setFilterGender] = useState<'ALL' | 'GROOM' | 'BRIDE'>('ALL');

  // New Ad Form State
  const [adCandidateName, setAdCandidateName] = useState(userProfile ? `${userProfile.displayFirstName} (प्रोफाइल कोड: ${userProfile.profileCode})` : '');
  const [adEducation, setAdEducation] = useState(userProfile?.education || '');
  const [adProfession, setAdProfession] = useState(userProfile?.occupation || '');
  const [adLocation, setAdLocation] = useState(userProfile ? `${userProfile.currentDistrict}, ${userProfile.currentProvince}` : '');
  const [adFamilySummary, setAdFamilySummary] = useState('');
  const [adPartnerExpectations, setAdPartnerExpectations] = useState('');

  const approvedAds = ads.filter(a => a.status === 'APPROVED');
  const filteredAds = approvedAds.filter(a => filterGender === 'ALL' || a.gender === filterGender);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adFamilySummary.trim() || !adPartnerExpectations.trim()) return;

    const newAd: VivahAdvertisement = {
      id: `ad_${Date.now()}`,
      adCode: `AD-2081-${Math.floor(10 + Math.random() * 89)}`,
      profileId: userProfile?.id || 'vivah_p_101',
      userId: userProfile?.userId || 'user_101',
      candidateName: adCandidateName || 'इमानदार उम्मेदवार',
      gender: userProfile?.gender || 'GROOM',
      age: userProfile?.age || 27,
      education: adEducation || 'स्नातक',
      profession: adProfession || 'निजी व्यवसाय',
      location: adLocation || 'काठमाडौँ',
      familySummary: adFamilySummary,
      partnerExpectations: adPartnerExpectations,
      photoUrl: userProfile?.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      contactPhoneHidden: true,
      status: 'PENDING_REVIEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onCreateAd(newAd);
    setIsModalOpen(false);
    alert('विवाह विज्ञापन रिभ्युका लागि पठाइएको छ। एडमिनको स्वीकृति पछि विज्ञापन प्रकाशित हुनेछ।');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner & Create Action Header */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-white p-6 rounded-3xl border border-amber-800/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-200 px-3 py-0.5 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>विवाह विज्ञापन मञ्च (Matrimonial Advertisements)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-100">
            विवाह विज्ञापन तथा संक्षिप्त बायोडाटा (Biodata Ads)
          </h2>
          <p className="text-xs text-amber-200/80">
            दैनिक प्रकाशित हुने प्रमाणित विवाह विज्ञापनहरू। विज्ञापन पोस्ट गर्नुअघि एडमिन रिभ्यु अनिवार्य रहन्छ।
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold px-5 py-3 rounded-xl shadow-lg transition-all flex items-center gap-2 text-xs sm:text-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-stone-950" />
          <span>नयाँ विवाह विज्ञापन राख्नुहोस्</span>
        </button>
      </div>

      {/* Gender Filter Buttons */}
      <div className="flex items-center justify-between gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterGender('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              filterGender === 'ALL'
                ? 'bg-[#D97706] text-white shadow'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}
          >
            सबै विज्ञापनहरू ({approvedAds.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterGender('GROOM')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              filterGender === 'GROOM'
                ? 'bg-[#1E3A8A] text-white shadow'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}
          >
            वर विज्ञापन (Groom Ads)
          </button>
          <button
            type="button"
            onClick={() => setFilterGender('BRIDE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              filterGender === 'BRIDE'
                ? 'bg-[#991B1B] text-white shadow'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
            }`}
          >
            वधू विज्ञापन (Bride Ads)
          </button>
        </div>
      </div>

      {/* Ads Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAds.map((ad) => (
          <div
            key={ad.id}
            className="bg-white dark:bg-[#1E1B18] p-5 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <img
                    src={ad.photoUrl}
                    alt=""
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/40 shadow-sm"
                  />
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${
                      ad.gender === 'GROOM' ? 'bg-[#1E3A8A]' : 'bg-[#991B1B]'
                    }`}>
                      {ad.gender === 'GROOM' ? 'वर विज्ञापन' : 'वधू विज्ञापन'}
                    </span>
                    <h3 className="font-bold text-base font-serif text-stone-900 dark:text-stone-100 mt-0.5">
                      {ad.candidateName}
                    </h3>
                    <p className="text-xs text-stone-500 font-mono">{ad.adCode} | {ad.location}</p>
                  </div>
                </div>

                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                  प्रमाणित
                </span>
              </div>

              <div className="text-xs space-y-2 text-stone-700 dark:text-stone-300">
                <p><strong>शिक्षा तथा पेशा:</strong> {ad.education} ({ad.profession})</p>
                <p className="bg-stone-50 dark:bg-stone-900/50 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800">
                  <strong>पारिवारिक पृष्ठभूमि:</strong> {ad.familySummary}
                </p>
                <p className="bg-amber-50/70 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200">
                  <strong>जोडी अपेक्षा:</strong> {ad.partnerExpectations}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                <Lock className="w-3.5 h-3.5" />
                <span>सम्पर्क सुरक्षित (Contact Hidden)</span>
              </div>

              {onViewProfile && (
                <button
                  type="button"
                  onClick={() => onViewProfile(ad.profileId)}
                  className="bg-[#D97706] hover:bg-[#B45309] text-white font-bold py-1.5 px-3 rounded-lg shadow text-xs transition-colors"
                >
                  प्रोफाइल हेर्नुहोस्
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Ad Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E1B18] w-full max-w-xl rounded-3xl p-6 border border-[#E6E0D5] dark:border-stone-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <h3 className="font-bold font-serif text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#D97706]" />
                <span>नयाँ विवाह विज्ञापन दर्ता</span>
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold mb-1">विज्ञापन शीर्षक / उम्मेदवार विवरण *</label>
                <input
                  type="text"
                  value={adCandidateName}
                  onChange={(e) => setAdCandidateName(e.target.value)}
                  placeholder="उदा: क्षेत्री कुलीन परिवारका २८ वर्षे कम्प्युटर इन्जिनियर"
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">शिक्षा योग्यता</label>
                  <input
                    type="text"
                    value={adEducation}
                    onChange={(e) => setAdEducation(e.target.value)}
                    placeholder="उदा: B.E. Computer Engineering"
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">पेशा र आम्दानी</label>
                  <input
                    type="text"
                    value={adProfession}
                    onChange={(e) => setAdProfession(e.target.value)}
                    placeholder="उदा: Senior Engineer (रु १.५ लाख+)"
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">पारिवारिक पृष्ठभूमि (Family Background) *</label>
                <textarea
                  rows={2}
                  value={adFamilySummary}
                  onChange={(e) => setAdFamilySummary(e.target.value)}
                  placeholder="उदा: बुबा निजामती अधिकृत (निभृत), आमा गृहणी, १ बहिनी..."
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1">सुयोग्य जोडी अपेक्षा (Partner Expectations) *</label>
                <textarea
                  rows={2}
                  value={adPartnerExpectations}
                  onChange={(e) => setAdPartnerExpectations(e.target.value)}
                  placeholder="उदा: २३-२७ वर्ष उमेरकी स्नातक/स्नातकोत्तर उत्तीर्ण सुसंस्कृत कन्याको खोजी..."
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 text-[11px] text-amber-900 dark:text-amber-300">
                नोट: विज्ञापन रिभ्युका लागि एडमिन टोलीकहाँ जानेछ। एडमिनले जाँच गरी स्वीकृत गरेपछि मात्र विज्ञापन मञ्चमा प्रकाशित हुनेछ।
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-stone-100 dark:bg-stone-800 px-4 py-2.5 rounded-xl font-bold"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="bg-[#D97706] hover:bg-[#B45309] text-white font-bold px-6 py-2.5 rounded-xl shadow"
                >
                  रिभ्युका लागि पठाउनुहोस् (Submit)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
