import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, User, Home, MapPin, Sparkles, Building2 } from 'lucide-react';
import { BirthDetails } from '../types/astrology';
import { saveProfile } from '../db/profileStore';

interface CheenaQuickEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BirthDetails;
  onSave: (updatedProfile: BirthDetails) => void;
}

export const CheenaQuickEditModal: React.FC<CheenaQuickEditModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [fatherName, setFatherName] = useState('');
  const [fatherOccupation, setFatherOccupation] = useState('');
  const [motherName, setMotherName] = useState('');
  const [motherOccupation, setMotherOccupation] = useState('');
  const [fatherGotra, setFatherGotra] = useState('');
  const [motherGotra, setMotherGotra] = useState('');
  const [tole, setTole] = useState('');
  const [localBody, setLocalBody] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('नेपाल');
  const [kuldevata, setKuldevata] = useState('');
  const [vamsa, setVamsa] = useState('');
  const [childOrder, setChildOrder] = useState('द्वितिय');
  const [childType, setChildType] = useState('पुत्र');

  // Sync state when profile changes or modal opens
  useEffect(() => {
    if (profile) {
      setFatherName(profile.fatherDetails?.name || profile.parentName || '');
      setFatherOccupation(profile.fatherDetails?.occupation || '');
      setMotherName(profile.motherDetails?.name || '');
      setMotherOccupation(profile.motherDetails?.occupation || '');
      setFatherGotra(profile.fatherDetails?.gotra || '');
      setMotherGotra(profile.motherDetails?.gotra || '');
      setTole(profile.location?.tole || '');
      setLocalBody(profile.location?.localBody || '');
      setDistrict(profile.location?.district || '');
      setProvince(profile.location?.province || '');
      setCountry(profile.location?.country || 'नेपाल');
      setKuldevata(profile.familyHistory?.kuldevata || '');
      setVamsa(profile.familyHistory?.vamsa || '');
      setChildOrder(profile.familyHistory?.childOrder || 'द्वितिय');
      setChildType(profile.familyHistory?.childType || (profile.gender === 'male' ? 'पुत्र' : 'पुत्री'));
    }
  }, [profile, isOpen]);

  if (!isOpen || !profile) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedProfile: BirthDetails = {
      ...profile,
      parentName: fatherName || profile.parentName,
      fatherDetails: {
        ...profile.fatherDetails,
        name: fatherName,
        occupation: fatherOccupation,
        gotra: fatherGotra,
        district: district,
        province: province,
        country: country,
      },
      motherDetails: {
        ...profile.motherDetails,
        name: motherName,
        occupation: motherOccupation,
        gotra: motherGotra,
      },
      location: {
        ...profile.location,
        tole: tole,
        localBody: localBody,
        district: district,
        province: province,
        country: country || 'नेपाल',
      },
      familyHistory: {
        ...profile.familyHistory,
        childOrder: childOrder || 'द्वितिय',
        childType: childType || (profile.gender === 'male' ? 'पुत्र' : 'पुत्री'),
        kuldevata: kuldevata,
        vamsa: vamsa,
      },
    };

    saveProfile(updatedProfile);
    onSave(updatedProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 text-[#2D241E] dark:text-stone-100 rounded-2xl border border-[#E6E0D5] dark:border-stone-800 w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Edit3 className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif">
                चिना / टिपण पारिवारिक तथा स्थान विवरण
              </h2>
              <p className="text-xs text-amber-100/90 font-sans">
                जातक: <span className="font-bold underline decoration-amber-300">{profile.name}</span> | बाबु, आमा, गोत्र, गाउँ, शहर तथा देश भर्नुहोस्
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
          
          {/* SECTION 1: Parental Details */}
          <div className="space-y-3 bg-amber-50/50 dark:bg-stone-800/50 p-4 rounded-xl border border-amber-200/60 dark:border-stone-700">
            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200 border-b border-amber-200 dark:border-stone-700 pb-2">
              <User className="w-4 h-4 text-[#D97706]" />
              <span className="text-sm">बाबु तथा आमाको विवरण (Parental Details)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  बाबुको नाम (Father's Name) *
                </label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="उदा: जनक भट्ट"
                  className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#D97706]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  बाबुको पेसा / पेशा (Father's Occupation)
                </label>
                <input
                  type="text"
                  value={fatherOccupation}
                  onChange={(e) => setFatherOccupation(e.target.value)}
                  placeholder="उदा: शिक्षक / कृषि / ज्योतिष"
                  className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#D97706]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  आमाको नाम (Mother's Name)
                </label>
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  placeholder="उदा: सुमित्रा देवी भट्ट"
                  className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#D97706]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  आमाको पेसा / पेशा (Mother's Occupation)
                </label>
                <input
                  type="text"
                  value={motherOccupation}
                  onChange={(e) => setMotherOccupation(e.target.value)}
                  placeholder="उदा: गृहिणी / शिक्षिका"
                  className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#D97706]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Gotra, Lineage & Child Order */}
          <div className="space-y-3 bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl border border-stone-200 dark:border-stone-700">
            <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-200 border-b border-stone-200 dark:border-stone-700 pb-2">
              <Sparkles className="w-4 h-4 text-[#D97706]" />
              <span className="text-sm">गोत्र, सन्तान क्रम (द्वितिय/पुत्र), वंश तथा कुलदेवता विवरण</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  बाबुको गोत्र (Father's Gotra) *
                </label>
                <input
                  type="text"
                  value={fatherGotra}
                  onChange={(e) => setFatherGotra(e.target.value)}
                  placeholder="उदा: कश्यप / भारद्वाज / अत्रि / गौतम"
                  className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 font-semibold text-amber-900 dark:text-amber-200 focus:ring-2 focus:ring-[#D97706]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  आमाको मायती गोत्र (Mother's Gotra)
                </label>
                <input
                  type="text"
                  value={motherGotra}
                  onChange={(e) => setMotherGotra(e.target.value)}
                  placeholder="उदा: वशिष्ठ / विश्वामित्र"
                  className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#D97706]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  सन्तान क्रम (Child Order: प्रथम, द्वितिय, तृतीय...) *
                </label>
                <input
                  type="text"
                  value={childOrder}
                  onChange={(e) => setChildOrder(e.target.value)}
                  placeholder="उदा: द्वितिय / प्रथम / तृतीय / चतुर्थ"
                  className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 font-bold text-amber-900 dark:text-amber-200 focus:ring-2 focus:ring-[#D97706]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  सन्तान दर्जा (Child Type: पुत्र, पुत्री, सन्तान) *
                </label>
                <input
                  type="text"
                  value={childType}
                  onChange={(e) => setChildType(e.target.value)}
                  placeholder="उदा: पुत्र / पुत्री / सन्तति"
                  className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 font-bold text-amber-900 dark:text-amber-200 focus:ring-2 focus:ring-[#D97706]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  कुलदेवता / कुलदेवी (Kuldevata)
                </label>
                <input
                  type="text"
                  value={kuldevata}
                  onChange={(e) => setKuldevata(e.target.value)}
                  placeholder="उदा: लामचामी / मष्टा / मालिका"
                  className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#D97706]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  वंश / प्रवर (Vamsa / Lineage)
                </label>
                <input
                  type="text"
                  value={vamsa}
                  onChange={(e) => setVamsa(e.target.value)}
                  placeholder="उदा: सूर्यवंश / चन्द्रवंश / त्रिप्रवर"
                  className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#D97706]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Village, City, District & Country Location */}
          <div className="space-y-3 bg-amber-50/50 dark:bg-stone-800/50 p-4 rounded-xl border border-amber-200/60 dark:border-stone-700">
            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200 border-b border-amber-200 dark:border-stone-700 pb-2">
              <MapPin className="w-4 h-4 text-[#D97706]" />
              <span className="text-sm">गाउँ, शहर, जिल्ला, प्रदेश तथा देश (Location & Address)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  गाउँ / टोल (Village / Tole)
                </label>
                <input
                  type="text"
                  value={tole}
                  onChange={(e) => setTole(e.target.value)}
                  placeholder="उदा: अत्तरिया-०३ / पशुपतिनगर"
                  className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#D97706]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  शहर / नगरपालिका / गाउँपालिका (City / Local Body)
                </label>
                <input
                  type="text"
                  value={localBody}
                  onChange={(e) => setLocalBody(e.target.value)}
                  placeholder="उदा: गोदावरी नगरपालिका / काठमाडौँ"
                  className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#D97706]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  जिल्ला (District)
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="उदा: कैलाली / काठमाडौँ / झापा"
                  className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#D97706]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  प्रदेश (Province)
                </label>
                <input
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="उदा: सुदूरपश्चिम / बागमती / कोशी"
                  className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#D97706]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  देश (Country)
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="उदा: नेपाल / भारत / USA"
                  className="w-full bg-white dark:bg-stone-800 border border-[#E6E0D5] dark:border-stone-700 rounded-xl px-3 py-2 font-bold text-[#D97706] focus:ring-2 focus:ring-[#D97706]"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold"
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-[#D97706] hover:bg-[#b45309] text-white font-bold px-6 py-2 rounded-xl transition-all shadow-md active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>चिना विवरण सुरक्षित गर्नुहोस्</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
