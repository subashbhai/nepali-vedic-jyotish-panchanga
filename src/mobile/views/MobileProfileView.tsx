import React, { useState } from 'react';
import {
  User,
  Plus,
  Compass,
  CheckCircle2,
  Trash2,
  Edit2,
  LogOut,
  ShieldCheck,
  Phone,
  Mail,
  Users,
  Calendar,
  Clock,
  MapPin
} from 'lucide-react';
import {
  MobileUserProfile,
  MobileBirthProfile,
  ProfileRelationType
} from '../types/mobileJyotishTypes';
import {
  getMobileBirthProfiles,
  saveOrUpdateMobileBirthProfile,
  deleteMobileBirthProfile,
  setActiveMobileBirthProfile,
  clearMobileUserSession
} from '../db/mobileAuthStore';

export const MobileProfileView: React.FC<{
  user: MobileUserProfile | null;
  activeProfile: MobileBirthProfile;
  onRefreshProfiles: () => void;
  onOpenAuth: () => void;
  onExitToWeb?: () => void;
}> = ({ user, activeProfile, onRefreshProfiles, onOpenAuth, onExitToWeb }) => {
  const [profiles, setProfiles] = useState<MobileBirthProfile[]>(getMobileBirthProfiles);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New Profile Form State
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [dateOfBirth, setDateOfBirth] = useState('2000-01-01');
  const [timeOfBirth, setTimeOfBirth] = useState('12:00');
  const [placeOfBirth, setPlaceOfBirth] = useState('काठमाडौं, नेपाल');
  const [relation, setRelation] = useState<ProfileRelationType>('family');

  const handleSelectActive = (pId: string) => {
    setActiveMobileBirthProfile(pId);
    setProfiles(getMobileBirthProfiles());
    onRefreshProfiles();
  };

  const handleDelete = (pId: string) => {
    if (profiles.length <= 1) {
      alert('कम्तीमा एउटा जन्म विवरण हुनैपर्छ।');
      return;
    }
    if (window.confirm('के तपाईं यो जन्म विवरण हटाउन चाहनुहुन्छ?')) {
      const updated = deleteMobileBirthProfile(pId);
      setProfiles(updated);
      onRefreshProfiles();
    }
  };

  const handleSaveNewProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('कृपया नाम लेख्नुहोस्');
      return;
    }

    const relationLabels: Record<ProfileRelationType, string> = {
      self: 'आफ्नो (Self)',
      spouse: 'जीवनसाथी (Spouse)',
      family: 'परिवार (Family)',
      child: 'सन्तान (Child)',
      parent: 'अभिभावक (Parent)',
      other: 'अन्य (Other)'
    };

    const newProf: MobileBirthProfile = {
      id: `prof_${Date.now()}`,
      name: name.trim(),
      gender,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      latitude: 27.7172,
      longitude: 85.3240,
      timezone: 5.75,
      relation,
      relationLabelNepali: relationLabels[relation],
      isDefault: false
    };

    saveOrUpdateMobileBirthProfile(newProf);
    setProfiles(getMobileBirthProfiles());
    setIsAddingNew(false);
    setName('');
    onRefreshProfiles();
  };

  const handleLogout = () => {
    if (window.confirm('के तपाईं लगआउट गर्न चाहनुहुन्छ?')) {
      clearMobileUserSession();
      onOpenAuth();
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* 1. User Account Card */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-[#221008] border border-amber-500/40 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold text-xl">
              {user?.fullName ? user.fullName[0] : 'सु'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-stone-100">{user?.fullName || 'सुवास शर्मा'}</h3>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-stone-400 font-mono">{user?.phone || '९७६४४००५३३'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2 bg-stone-800 hover:bg-stone-700 text-rose-400 hover:text-rose-300 rounded-xl transition-colors cursor-pointer"
            title="लगआउट गर्नुहोस्"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-stone-800 text-stone-400 text-[11px]">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span>फोन प्रमाणित: सम्पन्न</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>सुरक्षित सत्र: सक्रिय</span>
          </div>
        </div>
      </div>

      {/* 2. Multiple Birth Profiles Management */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="font-bold text-xs text-stone-200 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              <span>जन्म विवरण सूची (My Saved Birth Profiles)</span>
            </h3>
            <p className="text-[10px] text-stone-400">आफ्नो, परिवार र आफन्तको कुण्डली सुरक्षित राख्नुहोस्</p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>नयाँ थप्नुहोस्</span>
          </button>
        </div>

        {/* Profiles List */}
        <div className="space-y-2.5">
          {profiles.map(p => {
            const isActive = p.id === activeProfile.id;
            return (
              <div
                key={p.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isActive
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-md ring-1 ring-amber-500/20'
                    : 'bg-stone-900 border-stone-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-stone-100 font-serif">{p.name}</h4>
                      <span className="text-[10px] bg-stone-950 px-2 py-0.5 rounded-full border border-stone-800 text-amber-300 font-medium">
                        {p.relationLabelNepali || 'आफ्नो'}
                      </span>
                      {isActive && (
                        <span className="text-[9px] bg-amber-500 text-stone-950 px-1.5 py-0.2 rounded font-black">
                          सक्रिय
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-400">
                      जन्म: {p.dateOfBirth} • {p.timeOfBirth}
                    </p>
                    <p className="text-[10px] text-stone-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400" />
                      <span>{p.placeOfBirth}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => handleSelectActive(p.id)}
                        className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        हेर्नुहोस्
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 text-stone-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="हटाउनुहोस्"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Optional: Switch to Full Desktop/Web Version */}
        {onExitToWeb && (
          <div className="pt-4 border-t border-stone-800/80 text-center">
            <button
              type="button"
              onClick={onExitToWeb}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-850 text-stone-400 hover:text-amber-300 border border-stone-800 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <span>🖥️</span>
              <span>पूर्ण डेस्कटप / वेब संस्करणमा फर्कनुहोस्</span>
            </button>
            <p className="text-[10px] text-stone-500 mt-1.5">
              (वेब सफ्टवेयरमा पञ्चाङ्ग क्यालेन्डर, वास्तु, पसल, कर्मकाण्ड र प्रशासकीय मेनु उपलब्ध छन्)
            </p>
          </div>
        )}
      </div>

      {/* 3. Add New Profile Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 w-full max-w-md space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-bold text-sm text-stone-100 font-serif flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>नयाँ जन्म विवरण थप्नुहोस्</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="p-1 text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-400 mb-1 font-bold">पूरा नाम (Full Name):</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="उदा: सीता शर्मा"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-400 mb-1 font-bold">सम्बन्ध (Relation):</label>
                  <select
                    value={relation}
                    onChange={(e) => setRelation(e.target.value as ProfileRelationType)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100"
                  >
                    <option value="self">आफ्नो (Self)</option>
                    <option value="spouse">जीवनसाथी (Spouse)</option>
                    <option value="child">सन्तान (Child)</option>
                    <option value="parent">माता/पिता (Parent)</option>
                    <option value="family">परिवार (Family)</option>
                    <option value="other">अन्य (Other)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-400 mb-1 font-bold">लिङ्ग (Gender):</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100"
                  >
                    <option value="male">पुरुष (Male)</option>
                    <option value="female">महिला (Female)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-400 mb-1 font-bold">जन्म मिति (Date AD):</label>
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2 text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 mb-1 font-bold">जन्म समय (Time):</label>
                  <input
                    type="time"
                    required
                    value={timeOfBirth}
                    onChange={(e) => setTimeOfBirth(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2 text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-bold">जन्म स्थान (Place of Birth):</label>
                <input
                  type="text"
                  required
                  value={placeOfBirth}
                  onChange={(e) => setPlaceOfBirth(e.target.value)}
                  placeholder="काठमाडौं, नेपाल"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 bg-stone-800 text-stone-300 font-bold rounded-xl"
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black rounded-xl shadow-md"
                >
                  विवरण सुरक्षित गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
