import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  GraduationCap, 
  Briefcase, 
  ShieldCheck, 
  Check, 
  Heart,
  Lock,
  Phone,
  Camera
} from 'lucide-react';
import { VivahProfile, ProfileGender, MaritalStatus } from '../../types/vivahTypes';
import { saveStoredMyVivahProfile, getStoredMyVivahProfile } from '../../utils/vivahPrivacyHelper';
import { convertBSToAD, convertADToBS } from '../../utils/nepaliCalendar';
import {
  NEPALI_GOTRAS,
  NEPALI_CASTES,
  NEPALI_RELIGIONS,
  NEPALI_FATHER_OCCUPATIONS,
  NEPALI_MOTHER_OCCUPATIONS,
  NEPALI_EDUCATIONS,
  NEPALI_OCCUPATIONS,
  NEPALI_INCOME_RANGES
} from '../../constants/vivahConstants';
import { VivahPhotoUploader } from './VivahPhotoUploader';

interface VivahOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileSaved: (profile: VivahProfile) => void;
  initialProfile?: VivahProfile | null;
}

export const VivahOnboardingModal: React.FC<VivahOnboardingModalProps> = ({
  isOpen,
  onClose,
  onProfileSaved,
  initialProfile,
}) => {
  const [formData, setFormData] = useState<Partial<VivahProfile>>(() => {
    const stored = initialProfile || getStoredMyVivahProfile();
    return stored || {
      id: `vivah_my_${Date.now()}`,
      profileCode: `VIV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      userFullName: '',
      displayFirstName: '',
      gender: 'GROOM',
      dobBS: '२०५३-०१-१५',
      dobAD: '1996-04-28',
      birthTime: '०८:१५',
      birthPlace: 'काठमाडौँ',
      age: 28,
      currentDistrict: 'काठमाडौँ',
      currentProvince: 'बागमती प्रदेश',
      permanentAddress: 'काठमाडौँ, नेपाल',
      maritalStatus: 'NEVER_MARRIED',
      education: 'स्नातक (Bachelor)',
      fieldOfStudy: 'व्यवस्थापन तथा प्रविधि',
      occupation: 'इन्जिनियरिङ / सफ्टवेयर',
      employedIn: 'PRIVATE',
      monthlyIncomeRange: 'रु १,००,००० - रु १,५०,०००',
      heightFeetInches: "5'8\"",
      religion: 'हिन्दू (Hindu)',
      casteEthnicity: 'क्षेत्री (Chhetri)',
      gotra: 'कश्यप (Kashyap)',
      fatherOccupation: 'निजामती सेवा / व्यवसाय',
      motherOccupation: 'गृहणी (Homemaker)',
      familyType: 'NUCLEAR',
      familyValues: 'MODERATE',
      diet: 'VEG',
      drinkingSmoking: 'NO',
      aboutMe: 'सरल, इमानदार र संस्कारवान्। परिवार र कार्यक्षेत्र दुवैलाई सन्तुलनमा राख्ने सोच भएको।',
      profilePhoto: '',
      contactPhone: '9841000000',
      contactEmail: '',
      verificationLevel: 'BASIC',
      verificationStatus: 'APPROVED',
      isActive: true,
    };
  });

  const [activeTabSection, setActiveTabSection] = useState<'BIRTH' | 'PERSONAL' | 'CAREER' | 'PHOTO'>('BIRTH');
  const [errorMsg, setErrorMsg] = useState('');
  const [customFields, setCustomFields] = useState<{
    gotra?: boolean;
    caste?: boolean;
    religion?: boolean;
    fatherOccupation?: boolean;
    motherOccupation?: boolean;
    education?: boolean;
    occupation?: boolean;
    monthlyIncomeRange?: boolean;
  }>({});

  useEffect(() => {
    if (initialProfile) {
      setFormData(initialProfile);
    }
  }, [initialProfile]);

  if (!isOpen) return null;

  const handleBsDateChange = (bs: string) => {
    setFormData((prev) => {
      let ad = prev.dobAD || '1996-01-01';
      try {
        const normalized = bs.replace(/[०-९]/g, d => '०१२३४५६७८९'.indexOf(d).toString());
        const parts = normalized.split(/[-/]/);
        if (parts.length === 3) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          const d = parseInt(parts[2], 10);
          if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
            const converted = convertBSToAD(y, m, d);
            if (converted) ad = converted;
          }
        }
      } catch (e) {
        // keep fallback
      }
      const birthYear = parseInt(bs.replace(/[०-९]/g, d => '०१२३४५६७८९'.indexOf(d).toString()).split('-')[0]) || 2053;
      const calculatedAge = Math.max(18, 2081 - birthYear);
      return { ...prev, dobBS: bs, dobAD: ad, age: calculatedAge };
    });
  };

  const handleGenderChange = (gender: ProfileGender) => {
    setFormData((prev) => ({
      ...prev,
      gender,
      profilePhoto: prev.profilePhoto || '',
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userFullName?.trim()) {
      setErrorMsg('कृपया आफ्नो पूरा नाम अनिवार्य भर्नुहोस्।');
      setActiveTabSection('BIRTH');
      return;
    }
    if (!formData.dobBS || !formData.birthTime || !formData.birthPlace) {
      setErrorMsg('कुण्डली ३६ गुण मिलानका लागि जन्म मिति, समय र स्थान अनिवार्य छ।');
      setActiveTabSection('BIRTH');
      return;
    }

    const firstWord = formData.userFullName.trim().split(/\s+/)[0];
    const finalProfile: VivahProfile = {
      id: formData.id || `vivah_my_${Date.now()}`,
      profileCode: formData.profileCode || `VIV-2081-${Math.floor(100 + Math.random() * 899)}`,
      userId: formData.userId || `user_${Date.now()}`,
      userFullName: formData.userFullName.trim(),
      displayFirstName: formData.displayFirstName || firstWord,
      gender: formData.gender || 'GROOM',
      dobAD: formData.dobAD || '1996-04-28',
      dobBS: formData.dobBS || '२०५३-०१-१५',
      birthTime: formData.birthTime || '०८:१५',
      birthPlace: formData.birthPlace || 'काठमाडौँ',
      age: formData.age || 28,
      currentDistrict: formData.currentDistrict || 'काठमाडौँ',
      currentProvince: formData.currentProvince || 'बागमती प्रदेश',
      permanentAddress: formData.permanentAddress || 'काठमाडौँ, नेपाल',
      maritalStatus: (formData.maritalStatus as MaritalStatus) || 'NEVER_MARRIED',
      education: formData.education || 'स्नातक (Bachelor)',
      fieldOfStudy: formData.fieldOfStudy || 'General',
      occupation: formData.occupation || 'सेवा / व्यवसाय',
      employedIn: formData.employedIn || 'PRIVATE',
      monthlyIncomeRange: formData.monthlyIncomeRange || 'रु ५०,००० - रु १,००,०००',
      heightFeetInches: formData.heightFeetInches || "5'6\"",
      religion: formData.religion || 'हिन्दू (Hindu)',
      casteEthnicity: formData.casteEthnicity || 'क्षेत्री',
      gotra: formData.gotra || 'कश्यप',
      fatherOccupation: formData.fatherOccupation || '',
      motherOccupation: formData.motherOccupation || '',
      familyType: formData.familyType || 'NUCLEAR',
      familyValues: formData.familyValues || 'MODERATE',
      diet: formData.diet || 'VEG',
      drinkingSmoking: formData.drinkingSmoking || 'NO',
      hobbiesInterests: formData.hobbiesInterests || ['सङ्गीत', 'यात्रा'],
      aboutMe: formData.aboutMe || 'सरल र पारिवारिक स्वभाव।',
      partnerPreferences: formData.partnerPreferences || {
        minAge: 20,
        maxAge: 35,
        minHeightFeet: 5.0,
        maxHeightFeet: 6.2,
        maritalStatus: ['NEVER_MARRIED'],
        minEducation: 'स्नातक',
        preferredProfessions: ['इन्जिनियर', 'डाक्टर', 'शिक्षक', 'सरकारी सेवा'],
        preferredDistricts: ['काठमाडौँ', 'पोखरा'],
        preferredProvinces: ['बागमती प्रदेश'],
      },
      profilePhoto: formData.profilePhoto || '',
      additionalPhotos: [],
      verificationLevel: 'BASIC',
      verificationStatus: 'APPROVED',
      contactPhone: formData.contactPhone || '9841000000',
      contactEmail: formData.contactEmail || '',
      privacySettings: {
        visibility: 'PUBLIC',
        hideContactDetails: true,
        allowDirectMatch: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 1,
      isActive: true,
      isFeatured: true,
    };

    saveStoredMyVivahProfile(finalProfile);
    onProfileSaved(finalProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FFFDF9] dark:bg-[#1E1B18] rounded-3xl shadow-2xl border-2 border-amber-400 dark:border-amber-600/80 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#7A1C1C] via-[#991B1B] to-[#7A1C1C] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif text-amber-100 flex items-center gap-1.5">
                <span>वैवाहिक प्रोफाइल दर्ता तथा जन्म विवरण</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-200 border border-amber-400/40 px-2 py-0.5 rounded-full font-bold">
                  गोप्य एवं सुरक्षित
                </span>
              </h2>
              <p className="text-[11px] text-amber-200/80">
                ३६ गुण कुण्डली मिलानका लागि आफ्नो सही जन्म मिति, समय र स्थान भर्नुहोस्।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-amber-200 dark:border-stone-800 bg-amber-50/60 dark:bg-stone-900/60 p-1.5 gap-1 overflow-x-auto text-xs font-bold shrink-0">
          {[
            { key: 'BIRTH', label: '१. जन्म तथा व्यक्तिगत विवरण', icon: Calendar },
            { key: 'PERSONAL', label: '२. गोत्र, जात तथा परिवार', icon: User },
            { key: 'CAREER', label: '३. शिक्षा तथा पेशा', icon: Briefcase },
            { key: 'PHOTO', label: '४. फोटो तथा परिचय', icon: Camera },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTabSection === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTabSection(tab.key as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#7A1C1C] text-white shadow-xs'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-amber-100 dark:hover:bg-stone-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-950/40 border-l-4 border-red-600 p-2.5 mx-5 mt-3 text-xs text-red-800 dark:text-red-300 font-bold rounded-r-xl">
            {errorMsg}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm text-stone-800 dark:text-stone-200">
          
          {/* TAB 1: BIRTH & BASIC DETAILS */}
          {activeTabSection === 'BIRTH' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    आफ्नो पूरा नाम (Full Name) <span className="text-red-600">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="जस्तै: रुपेश के.सी. / प्रनिशा श्रेष्ठ"
                    value={formData.userFullName || ''}
                    onChange={(e) => setFormData({ ...formData, userFullName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                  <span className="text-[10px] text-stone-500">
                    गोपनीयताका लागि अन्य प्रयोगकर्ताहरूलाई तपाईंको नाम आधा मात्र (जस्तै 'रुपेश के...') देखाइनेछ।
                  </span>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    म को हुँ (Gender) <span className="text-red-600">*</span>:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleGenderChange('GROOM')}
                      className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                        formData.gender === 'GROOM'
                          ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                          : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300'
                      }`}
                    >
                      <span>👨 वर (केटा)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenderChange('BRIDE')}
                      className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                        formData.gender === 'BRIDE'
                          ? 'bg-[#991B1B] text-white border-[#991B1B]'
                          : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300'
                      }`}
                    >
                      <span>👩 वधू (केटी)</span>
                    </button>
                  </div>
                </div>

                {/* Marital Status */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    वैवाहिक स्थिति (Marital Status):
                  </label>
                  <select
                    value={formData.maritalStatus || 'NEVER_MARRIED'}
                    onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="NEVER_MARRIED">अविवाहित (Never Married)</option>
                    <option value="DIVORCED">सम्बन्धविच्छेद (Divorced)</option>
                    <option value="WIDOWED">एकल (Widowed)</option>
                  </select>
                </div>

                {/* Birth Date BS */}
                <div>
                  <label className="block text-xs font-bold text-[#7A1C1C] dark:text-amber-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>जन्म मिति (वि.सं.)</span> <span className="text-red-600">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="YYYY-MM-DD जस्तै २०५३-०१-१५"
                    value={formData.dobBS || ''}
                    onChange={(e) => handleBsDateChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-stone-800 font-mono text-xs font-bold"
                  />
                  <span className="text-[10px] text-stone-500">ई.सं.: {formData.dobAD} (उमेर: {formData.age} वर्ष)</span>
                </div>

                {/* Birth Time */}
                <div>
                  <label className="block text-xs font-bold text-[#7A1C1C] dark:text-amber-400 mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>जन्म समय (Birth Time)</span> <span className="text-red-600">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="जस्तै ०८:१५ AM वा २०:४०"
                    value={formData.birthTime || ''}
                    onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-stone-800 font-mono text-xs font-bold"
                  />
                </div>

                {/* Birth Place */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#7A1C1C] dark:text-amber-400 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>जन्म स्थान (Birth City / District)</span> <span className="text-red-600">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="जस्तै: काठमाडौँ, पोखरा, बुटवल, धरान, चितवन..."
                    value={formData.birthPlace || ''}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-stone-800 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTabSection('PERSONAL')}
                  className="bg-[#7A1C1C] text-white px-5 py-2 rounded-xl font-bold text-xs hover:bg-[#991B1B] cursor-pointer"
                >
                  अर्को: गोत्र र परिवार विवरण →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: GOTRA, CASTE, FAMILY */}
          {activeTabSection === 'PERSONAL' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. गोत्र (Gotra) */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    गोत्र (Gotra) <span className="text-red-500">*</span>:
                  </label>
                  <select
                    value={
                      customFields.gotra
                        ? 'CUSTOM'
                        : NEPALI_GOTRAS.some(g => g.value === formData.gotra)
                        ? formData.gotra
                        : (formData.gotra ? 'CUSTOM' : '')
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'CUSTOM') {
                        setCustomFields(prev => ({ ...prev, gotra: true }));
                        setFormData({ ...formData, gotra: '' });
                      } else {
                        setCustomFields(prev => ({ ...prev, gotra: false }));
                        setFormData({ ...formData, gotra: val });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-medium outline-none focus:border-amber-500"
                  >
                    <option value="">-- गोत्र छान्नुहोस् (Select Gotra) --</option>
                    {NEPALI_GOTRAS.map(g => (
                      <option key={g.value} value={g.value}>
                        {g.labelNepali} {g.exampleSurnames ? `(${g.exampleSurnames.split(',').slice(0, 3).join(',')}...)` : ''}
                      </option>
                    ))}
                    <option value="CUSTOM">अन्य / यहाँ नभएको (आफैँ लेख्नुहोस्)...</option>
                  </select>
                  {(customFields.gotra || (formData.gotra && !NEPALI_GOTRAS.some(g => g.value === formData.gotra))) && (
                    <input
                      type="text"
                      placeholder="आफ्नो गोत्र यहाँ लेख्नुहोस्..."
                      value={formData.gotra || ''}
                      onChange={(e) => setFormData({ ...formData, gotra: e.target.value })}
                      className="mt-1.5 w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-stone-800 text-xs font-medium"
                    />
                  )}
                </div>

                {/* 2. जात / समुदाय (Caste/Community) */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    जात / समुदाय (Caste/Community) <span className="text-red-500">*</span>:
                  </label>
                  <select
                    value={
                      customFields.caste
                        ? 'CUSTOM'
                        : NEPALI_CASTES.some(c => c.value === formData.casteEthnicity)
                        ? formData.casteEthnicity
                        : (formData.casteEthnicity ? 'CUSTOM' : '')
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'CUSTOM') {
                        setCustomFields(prev => ({ ...prev, caste: true }));
                        setFormData({ ...formData, casteEthnicity: '' });
                      } else {
                        setCustomFields(prev => ({ ...prev, caste: false }));
                        setFormData({ ...formData, casteEthnicity: val });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-medium outline-none focus:border-amber-500"
                  >
                    <option value="">-- जात / समुदाय छान्नुहोस् (Select Caste) --</option>
                    <optgroup label="खस / आर्य">
                      {NEPALI_CASTES.filter(c => c.category === 'Khas/Arya').map(c => (
                        <option key={c.value} value={c.value}>{c.labelNepali}</option>
                      ))}
                    </optgroup>
                    <optgroup label="नेवार समुदाय">
                      {NEPALI_CASTES.filter(c => c.category === 'Newar').map(c => (
                        <option key={c.value} value={c.value}>{c.labelNepali}</option>
                      ))}
                    </optgroup>
                    <optgroup label="जनजाति तथा आदिवासी">
                      {NEPALI_CASTES.filter(c => c.category === 'Janajati').map(c => (
                        <option key={c.value} value={c.value}>{c.labelNepali}</option>
                      ))}
                    </optgroup>
                    <optgroup label="मधेश / तराई समुदाय">
                      {NEPALI_CASTES.filter(c => c.category === 'Madhesi/Tarai').map(c => (
                        <option key={c.value} value={c.value}>{c.labelNepali}</option>
                      ))}
                    </optgroup>
                    <optgroup label="शिल्पी तथा दलित समुदाय">
                      {NEPALI_CASTES.filter(c => c.category === 'Dalit').map(c => (
                        <option key={c.value} value={c.value}>{c.labelNepali}</option>
                      ))}
                    </optgroup>
                    <optgroup label="अन्य समुदाय">
                      {NEPALI_CASTES.filter(c => c.category === 'Other').map(c => (
                        <option key={c.value} value={c.value}>{c.labelNepali}</option>
                      ))}
                    </optgroup>
                    <option value="CUSTOM">अन्य / यहाँ नभएको (आफैँ लेख्नुहोस्)...</option>
                  </select>
                  {(customFields.caste || (formData.casteEthnicity && !NEPALI_CASTES.some(c => c.value === formData.casteEthnicity))) && (
                    <input
                      type="text"
                      placeholder="आफ्नो जात वा समुदाय यहाँ लेख्नुहोस्..."
                      value={formData.casteEthnicity || ''}
                      onChange={(e) => setFormData({ ...formData, casteEthnicity: e.target.value })}
                      className="mt-1.5 w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-stone-800 text-xs font-medium"
                    />
                  )}
                </div>

                {/* 3. धर्म (Religion) */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    धर्म (Religion):
                  </label>
                  <select
                    value={
                      customFields.religion
                        ? 'CUSTOM'
                        : NEPALI_RELIGIONS.some(r => r.value === formData.religion)
                        ? formData.religion
                        : (formData.religion ? 'CUSTOM' : 'हिन्दू (Hindu)')
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'CUSTOM') {
                        setCustomFields(prev => ({ ...prev, religion: true }));
                        setFormData({ ...formData, religion: '' });
                      } else {
                        setCustomFields(prev => ({ ...prev, religion: false }));
                        setFormData({ ...formData, religion: val });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-medium outline-none focus:border-amber-500"
                  >
                    {NEPALI_RELIGIONS.map(r => (
                      <option key={r.value} value={r.value}>{r.labelNepali}</option>
                    ))}
                    <option value="CUSTOM">अन्य धर्म (आफैँ लेख्नुहोस्)...</option>
                  </select>
                  {(customFields.religion || (formData.religion && !NEPALI_RELIGIONS.some(r => r.value === formData.religion))) && (
                    <input
                      type="text"
                      placeholder="आफ्नो धर्म यहाँ लेख्नुहोस्..."
                      value={formData.religion || ''}
                      onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                      className="mt-1.5 w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-stone-800 text-xs font-medium"
                    />
                  )}
                </div>

                {/* उचाइ (Height) */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    उचाइ (Height):
                  </label>
                  <input
                    type="text"
                    placeholder="जस्तै 5'8&quot; वा 5'3&quot;"
                    value={formData.heightFeetInches || ''}
                    onChange={(e) => setFormData({ ...formData, heightFeetInches: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                  />
                </div>

                {/* 4. पिताको पेशा (Father's Occupation) */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    पिताको पेशा (Father's Occupation):
                  </label>
                  <select
                    value={
                      customFields.fatherOccupation
                        ? 'CUSTOM'
                        : NEPALI_FATHER_OCCUPATIONS.includes(formData.fatherOccupation || '')
                        ? formData.fatherOccupation
                        : (formData.fatherOccupation ? 'CUSTOM' : '')
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'CUSTOM') {
                        setCustomFields(prev => ({ ...prev, fatherOccupation: true }));
                        setFormData({ ...formData, fatherOccupation: '' });
                      } else {
                        setCustomFields(prev => ({ ...prev, fatherOccupation: false }));
                        setFormData({ ...formData, fatherOccupation: val });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-medium outline-none focus:border-amber-500"
                  >
                    <option value="">-- पिताको पेशा छान्नुहोस् --</option>
                    {NEPALI_FATHER_OCCUPATIONS.map(occ => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                    <option value="CUSTOM">अन्य पेशा (आफैँ लेख्नुहोस्)...</option>
                  </select>
                  {(customFields.fatherOccupation || (formData.fatherOccupation && !NEPALI_FATHER_OCCUPATIONS.includes(formData.fatherOccupation))) && (
                    <input
                      type="text"
                      placeholder="पिताको पेशा खुलाउनुहोस्..."
                      value={formData.fatherOccupation || ''}
                      onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                      className="mt-1.5 w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-stone-800 text-xs font-medium"
                    />
                  )}
                </div>

                {/* 5. माताको पेशा (Mother's Occupation) */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    माताको पेशा (Mother's Occupation):
                  </label>
                  <select
                    value={
                      customFields.motherOccupation
                        ? 'CUSTOM'
                        : NEPALI_MOTHER_OCCUPATIONS.includes(formData.motherOccupation || '')
                        ? formData.motherOccupation
                        : (formData.motherOccupation ? 'CUSTOM' : '')
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'CUSTOM') {
                        setCustomFields(prev => ({ ...prev, motherOccupation: true }));
                        setFormData({ ...formData, motherOccupation: '' });
                      } else {
                        setCustomFields(prev => ({ ...prev, motherOccupation: false }));
                        setFormData({ ...formData, motherOccupation: val });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-medium outline-none focus:border-amber-500"
                  >
                    <option value="">-- माताको पेशा छान्नुहोस् --</option>
                    {NEPALI_MOTHER_OCCUPATIONS.map(occ => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                    <option value="CUSTOM">अन्य पेशा (आफैँ लेख्नुहोस्)...</option>
                  </select>
                  {(customFields.motherOccupation || (formData.motherOccupation && !NEPALI_MOTHER_OCCUPATIONS.includes(formData.motherOccupation))) && (
                    <input
                      type="text"
                      placeholder="माताको पेशा खुलाउनुहोस्..."
                      value={formData.motherOccupation || ''}
                      onChange={(e) => setFormData({ ...formData, motherOccupation: e.target.value })}
                      className="mt-1.5 w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-stone-800 text-xs font-medium"
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTabSection('BIRTH')}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 cursor-pointer"
                >
                  ← पछाडि
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabSection('CAREER')}
                  className="bg-[#7A1C1C] text-white px-5 py-2 rounded-xl font-bold text-xs hover:bg-[#991B1B] cursor-pointer"
                >
                  अर्को: शिक्षा तथा पेशा →
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CAREER & LOCATION */}
          {activeTabSection === 'CAREER' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* उच्चतम शिक्षा (Education) */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    उच्चतम शिक्षा (Education) <span className="text-red-500">*</span>:
                  </label>
                  <select
                    value={
                      customFields.education
                        ? 'CUSTOM'
                        : NEPALI_EDUCATIONS.includes(formData.education || '')
                        ? formData.education
                        : (formData.education ? 'CUSTOM' : '')
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'CUSTOM') {
                        setCustomFields(prev => ({ ...prev, education: true }));
                        setFormData({ ...formData, education: '' });
                      } else {
                        setCustomFields(prev => ({ ...prev, education: false }));
                        setFormData({ ...formData, education: val });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-medium outline-none focus:border-amber-500"
                  >
                    <option value="">-- उच्चतम शिक्षा छान्नुहोस् --</option>
                    {NEPALI_EDUCATIONS.map(edu => (
                      <option key={edu} value={edu}>{edu}</option>
                    ))}
                    <option value="CUSTOM">अन्य शिक्षा / डिग्री (आफैँ लेख्नुहोस्)...</option>
                  </select>
                  {(customFields.education || (formData.education && !NEPALI_EDUCATIONS.includes(formData.education))) && (
                    <input
                      type="text"
                      placeholder="आफ्नो शैक्षिक योग्यता / डिग्री यहाँ लेख्नुहोस्..."
                      value={formData.education || ''}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      className="mt-1.5 w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-stone-800 text-xs font-medium"
                    />
                  )}
                </div>

                {/* पेशा / पद (Occupation) */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    पेशा / पद (Occupation) <span className="text-red-500">*</span>:
                  </label>
                  <select
                    value={
                      customFields.occupation
                        ? 'CUSTOM'
                        : NEPALI_OCCUPATIONS.includes(formData.occupation || '')
                        ? formData.occupation
                        : (formData.occupation ? 'CUSTOM' : '')
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'CUSTOM') {
                        setCustomFields(prev => ({ ...prev, occupation: true }));
                        setFormData({ ...formData, occupation: '' });
                      } else {
                        setCustomFields(prev => ({ ...prev, occupation: false }));
                        setFormData({ ...formData, occupation: val });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-medium outline-none focus:border-amber-500"
                  >
                    <option value="">-- पेशा / पद छान्नुहोस् --</option>
                    {NEPALI_OCCUPATIONS.map(occ => (
                      <option key={occ} value={occ}>{occ}</option>
                    ))}
                    <option value="CUSTOM">अन्य पेशा / पद (आफैँ लेख्नुहोस्)...</option>
                  </select>
                  {(customFields.occupation || (formData.occupation && !NEPALI_OCCUPATIONS.includes(formData.occupation))) && (
                    <input
                      type="text"
                      placeholder="आफ्नो पेशा वा पद यहाँ लेख्नुहोस्..."
                      value={formData.occupation || ''}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      className="mt-1.5 w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-stone-800 text-xs font-medium"
                    />
                  )}
                </div>

                {/* मासिक आम्दानी (Monthly Income Range) */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    मासिक आम्दानी (Monthly Income Range):
                  </label>
                  <select
                    value={
                      customFields.monthlyIncomeRange
                        ? 'CUSTOM'
                        : NEPALI_INCOME_RANGES.includes(formData.monthlyIncomeRange || '')
                        ? formData.monthlyIncomeRange
                        : (formData.monthlyIncomeRange ? 'CUSTOM' : 'रु ५०,००० - रु ७५,००० (NPR 50K - 75K)')
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'CUSTOM') {
                        setCustomFields(prev => ({ ...prev, monthlyIncomeRange: true }));
                        setFormData({ ...formData, monthlyIncomeRange: '' });
                      } else {
                        setCustomFields(prev => ({ ...prev, monthlyIncomeRange: false }));
                        setFormData({ ...formData, monthlyIncomeRange: val });
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-medium outline-none focus:border-amber-500"
                  >
                    <option value="">-- मासिक आम्दानी छान्नुहोस् --</option>
                    {NEPALI_INCOME_RANGES.map(inc => (
                      <option key={inc} value={inc}>{inc}</option>
                    ))}
                    <option value="CUSTOM">अन्य आम्दानी खुलाउनुहोस्...</option>
                  </select>
                  {(customFields.monthlyIncomeRange || (formData.monthlyIncomeRange && !NEPALI_INCOME_RANGES.includes(formData.monthlyIncomeRange))) && (
                    <input
                      type="text"
                      placeholder="आफ्नो मासिक आम्दानी खुलाउनुहोस्..."
                      value={formData.monthlyIncomeRange || ''}
                      onChange={(e) => setFormData({ ...formData, monthlyIncomeRange: e.target.value })}
                      className="mt-1.5 w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-stone-800 text-xs font-medium"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    हालको बसोबास (Current District/City):
                  </label>
                  <input
                    type="text"
                    placeholder="जस्तै: काठमाडौँ, पोखरा, सिड्नी, न्यूयोर्क..."
                    value={formData.currentDistrict || ''}
                    onChange={(e) => setFormData({ ...formData, currentDistrict: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTabSection('PERSONAL')}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 cursor-pointer"
                >
                  ← पछाडि
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabSection('PHOTO')}
                  className="bg-[#7A1C1C] text-white px-5 py-2 rounded-xl font-bold text-xs hover:bg-[#991B1B] cursor-pointer"
                >
                  अर्को: फोटो तथा परिचय →
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: PHOTO & BIO */}
          {activeTabSection === 'PHOTO' && (
            <div className="space-y-4">
              {/* प्रोफाइल तस्बिर छनोट (Device Upload / Camera) */}
              <VivahPhotoUploader
                value={formData.profilePhoto}
                onChange={(photoUrl) => setFormData({ ...formData, profilePhoto: photoUrl })}
                label="प्रोफाइल तस्बिर छनोट (तपाईंको गोपनीयता सुरक्षित रहनेछ - अनुहार स्वतः ब्लर हुनेछ):"
              />

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  सम्पर्क फोन नम्बर (गोप्य रहनेछ - केवल आपसी सहमतिमा मात्र आदानप्रदान हुने):
                </label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <input
                    type="text"
                    placeholder="९८xxxxxxxx"
                    value={formData.contactPhone || ''}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  आफ्नो बारेमा संक्षिप्त परिचय (About Me / Bio):
                </label>
                <textarea
                  rows={3}
                  placeholder="आफ्नो रुचि, जीवनप्रतिको दृष्टिकोण र कस्तो जीवनसाथी खोज्दै हुनुहुन्छ..."
                  value={formData.aboutMe || ''}
                  onChange={(e) => setFormData({ ...formData, aboutMe: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              {/* Privacy badge */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-300">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>१००% गोपनीयता सुरक्षा:</strong> तपाईंको नाम आधा मात्र देखिनेछ र तस्बिरको अनुहार ब्लर रहनेछ।
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTabSection('CAREER')}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 cursor-pointer"
                >
                  ← पछाडि
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#D97706] to-[#B45309] hover:from-[#B45309] hover:to-[#92400E] text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>दर्ता सम्पन्न गरी ३६ गुण म्याच हेर्नुहोस्</span>
                </button>
              </div>
            </div>
          )}

        </form>

      </div>
    </div>
  );
};
