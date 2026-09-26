import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Users, 
  Heart, 
  Lock, 
  Check, 
  Sparkles, 
  Camera, 
  FileText,
  ShieldCheck,
  AlertCircle,
  Shield,
  KeyRound
} from 'lucide-react';
import { VivahProfile, ProfileGender, MaritalStatus, EmploymentType, VisibilitySetting } from '../../types/vivahTypes';
import { RBACSession, registerRBACAccount, getRoleLabelNepali } from '../../db/rbacStore';
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
import { VivahDocumentUploader } from './VivahDocumentUploader';

interface VivahRegistrationFormProps {
  initialProfile?: VivahProfile | null;
  rbacSession?: RBACSession | null;
  onSaveProfile: (profile: VivahProfile) => void;
  onCancel?: () => void;
  onOpenAuthModal?: () => void;
}

export const VivahRegistrationForm: React.FC<VivahRegistrationFormProps> = ({
  initialProfile,
  rbacSession,
  onSaveProfile,
  onCancel,
  onOpenAuthModal,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [validationError, setValidationError] = useState<string>('');
  const [accountPassword, setAccountPassword] = useState<string>('');
  const [customFields, setCustomFields] = useState<Record<string, boolean>>({
    education: false,
    occupation: false,
    monthlyIncomeRange: false,
    gotra: false,
    caste: false,
    religion: false,
    fatherOccupation: false,
    motherOccupation: false,
  });

  // Form State
  const [formData, setFormData] = useState<Partial<VivahProfile>>({
    id: initialProfile?.id || `vivah_p_${Date.now()}`,
    profileCode: initialProfile?.profileCode || `VIV-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 89)}`,
    userId: initialProfile?.userId || rbacSession?.userId || `user_${Date.now()}`,
    userFullName: initialProfile?.userFullName || rbacSession?.fullName || '',
    displayFirstName: initialProfile?.displayFirstName || (rbacSession?.fullName ? rbacSession.fullName.split(' ')[0] : ''),
    gender: initialProfile?.gender || 'GROOM',
    dobAD: initialProfile?.dobAD || '1998-01-01',
    dobBS: initialProfile?.dobBS || '२०५४-०९-१७',
    birthTime: initialProfile?.birthTime || '08:00',
    birthPlace: initialProfile?.birthPlace || 'काठमाडौँ',
    age: initialProfile?.age || 26,
    currentDistrict: initialProfile?.currentDistrict || 'काठमाडौँ',
    currentProvince: initialProfile?.currentProvince || 'बागमती प्रदेश',
    permanentAddress: initialProfile?.permanentAddress || 'काठमाडौँ',
    maritalStatus: initialProfile?.maritalStatus || 'NEVER_MARRIED',
    education: initialProfile?.education || 'स्नातक (Bachelor)',
    fieldOfStudy: initialProfile?.fieldOfStudy || 'General',
    occupation: initialProfile?.occupation || 'निजी क्षेत्र (Private Job)',
    employedIn: initialProfile?.employedIn || 'PRIVATE',
    monthlyIncomeRange: initialProfile?.monthlyIncomeRange || 'रु ५०,००० - रु १,००,०००',
    heightFeetInches: initialProfile?.heightFeetInches || "5'6\"",
    complexion: initialProfile?.complexion || 'गोरो (Fair)',
    religion: initialProfile?.religion || 'हिन्दू (Hindu)',
    casteEthnicity: initialProfile?.casteEthnicity || '',
    gotra: initialProfile?.gotra || '',
    fatherOccupation: initialProfile?.fatherOccupation || '',
    motherOccupation: initialProfile?.motherOccupation || '',
    familyType: initialProfile?.familyType || 'NUCLEAR',
    familyValues: initialProfile?.familyValues || 'MODERATE',
    familyLocation: initialProfile?.familyLocation || '',
    siblingsInfo: initialProfile?.siblingsInfo || '',
    diet: initialProfile?.diet || 'VEG',
    drinkingSmoking: initialProfile?.drinkingSmoking || 'NO',
    hobbiesInterests: initialProfile?.hobbiesInterests || ['पठन', 'यात्रा', 'सङ्गीत'],
    aboutMe: initialProfile?.aboutMe || '',
    partnerPreferences: initialProfile?.partnerPreferences || {
      minAge: 22,
      maxAge: 30,
      minHeightFeet: 5.0,
      maxHeightFeet: 6.0,
      maritalStatus: ['NEVER_MARRIED'],
      minEducation: 'स्नातक (Bachelor)',
      preferredProfessions: ['इन्जिनियर', 'डाक्टर', 'शिक्षक', 'बैङ्कर', 'सरकारी सेवा'],
      preferredDistricts: ['काठमाडौँ', 'ललितपुर', 'भक्तपुर', 'कास्की'],
      preferredProvinces: ['बागमती प्रदेश', 'गण्डकी प्रदेश'],
      religion: 'हिन्दू',
    },
    profilePhoto: initialProfile?.profilePhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    additionalPhotos: initialProfile?.additionalPhotos || [],
    verificationLevel: initialProfile?.verificationLevel || 'BASIC',
    verificationStatus: initialProfile?.verificationStatus || 'NONE',
    contactPhone: initialProfile?.contactPhone || rbacSession?.username || '9841000000',
    contactEmail: initialProfile?.contactEmail || '',
    privacySettings: initialProfile?.privacySettings || {
      visibility: 'PUBLIC',
      hideContactDetails: true,
      allowDirectMatch: true,
    },
    createdAt: initialProfile?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    viewCount: initialProfile?.viewCount || 0,
    isActive: true,
  });

  // Sync with active RBAC session
  useEffect(() => {
    if (rbacSession && !initialProfile) {
      setFormData(prev => ({
        ...prev,
        userId: rbacSession.userId,
        userFullName: rbacSession.fullName,
        displayFirstName: prev.displayFirstName || rbacSession.fullName.split(' ')[0],
        contactPhone: prev.contactPhone || rbacSession.username,
      }));
    }
  }, [rbacSession, initialProfile]);

  const handleTextChange = (field: keyof VivahProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePartnerPrefChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      partnerPreferences: {
        ...prev.partnerPreferences!,
        [field]: value
      }
    }));
  };

  const handlePrivacyChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      privacySettings: {
        ...prev.privacySettings!,
        [field]: value
      }
    }));
  };

  const validateCurrentStep = (): boolean => {
    setValidationError('');
    if (currentStep === 1) {
      if (!formData.userFullName?.trim()) {
        setValidationError('कृपया पूरा नाम (Full Name) भर्नुहोस्।');
        return false;
      }
      if (!formData.displayFirstName?.trim()) {
        setValidationError('कृपया प्रोफाइलमा देखिने पहिलो नाम भर्नुहोस्।');
        return false;
      }
      if (!formData.dobAD) {
        setValidationError('कृपया जन्म मिति भर्नुहोस्।');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.education?.trim()) {
        setValidationError('कृपया शैक्षिक योग्यता छनोट गर्नुहोस्।');
        return false;
      }
      if (!formData.occupation?.trim()) {
        setValidationError('कृपया पेशा/रोजगार विवरण भर्नुहोस्।');
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.aboutMe?.trim()) {
        setValidationError('कृपया आफ्नो बारेमा छोटो परिचय (About Me) भर्नुहोस्।');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    let finalUserId = formData.userId;
    let finalFullName = formData.userFullName;

    if (rbacSession) {
      finalUserId = rbacSession.userId;
      finalFullName = rbacSession.fullName;
    } else if (formData.contactPhone && formData.userFullName) {
      // Auto-register/sync RBAC account if not logged in
      const res = registerRBACAccount({
        fullName: formData.userFullName,
        phone: formData.contactPhone,
        email: formData.contactEmail,
        password: accountPassword || 'User#2081',
        role: 'MARRIAGE_USER',
      });
      if (res.user) {
        finalUserId = res.user.id;
        finalFullName = res.user.fullName;
      }
    }

    const fullProfile = {
      ...formData,
      userId: finalUserId || `user_${Date.now()}`,
      userFullName: finalFullName || formData.userFullName || 'प्रयोगकर्ता',
    } as VivahProfile;

    onSaveProfile(fullProfile);
  };

  return (
    <div className="bg-white dark:bg-[#1E1B18] rounded-3xl border border-[#E6E0D5] dark:border-stone-800 shadow-xl overflow-hidden max-w-4xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#D97706]/10 text-[#D97706] rounded-2xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#2D241E] dark:text-stone-100">
              {initialProfile ? 'विवाह प्रोफाइल सम्पादन गर्नुहोस्' : 'नयाँ विवाह प्रोफाइल दर्ता (New Profile Registration)'}
            </h2>
            <p className="text-xs text-stone-500">
              नेपालको आधुनिक, सुरक्षित र मर्यादित विवाह मञ्चमा आफ्नो विवाह बायोडाटा थप्नुहोस्।
            </p>
          </div>
        </div>

        {/* RBAC Identity Banner */}
        {rbacSession ? (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-200 font-semibold">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#D97706]" />
              <span>प्रमाणित RBAC पहिचान सम्बद्ध: <strong>{rbacSession.fullName}</strong> ({getRoleLabelNepali(rbacSession.role)})</span>
            </div>
            <span className="font-mono text-[11px] bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded">ID: {rbacSession.userId}</span>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <span className="text-stone-600 dark:text-stone-400">
              विद्यमान RBAC खाताबाट लगइन गर्नुहोस् वा दर्ता गर्दा स्वतः <strong>MARRIAGE_USER</strong> खाता सिर्जना हुनेछ।
            </span>
            {onOpenAuthModal && (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="bg-[#D97706] hover:bg-[#B45309] text-white px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 shadow transition-colors"
              >
                RBAC लगइन गर्नुहोस्
              </button>
            )}
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center justify-between gap-2 mt-6">
          {[
            { step: 1, label: '१. व्यक्तिगत विवरण' },
            { step: 2, label: '२. शिक्षा, पेशा र परिवार' },
            { step: 3, label: '३. जोडी अपेक्षा र परिचय' },
            { step: 4, label: '४. गोपनीयता र फोटो' },
          ].map((s) => (
            <div
              key={s.step}
              className={`flex-1 text-center py-2 px-1 rounded-xl text-xs font-bold transition-colors ${
                currentStep === s.step
                  ? 'bg-[#D97706] text-white shadow'
                  : currentStep > s.step
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {validationError && (
        <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Personal Details */}
        {currentStep === 1 && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  पूरा नाम (Full Name) *
                </label>
                <input
                  type="text"
                  value={formData.userFullName || ''}
                  onChange={(e) => handleTextChange('userFullName', e.target.value)}
                  placeholder="उदा: रुपेश के.सी."
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 focus:ring-2 focus:ring-[#D97706]"
                  required
                />
                <span className="text-[10px] text-stone-400">नागरिकता/प्रमाणपत्र अनुसारको नाम</span>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  सार्वजनिक रूपमा देखिने पहिलो नाम (Display First Name) *
                </label>
                <input
                  type="text"
                  value={formData.displayFirstName || ''}
                  onChange={(e) => handleTextChange('displayFirstName', e.target.value)}
                  placeholder="उदा: रुपेश"
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 focus:ring-2 focus:ring-[#D97706]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  वर वा वधू (Gender / Role) *
                </label>
                <select
                  value={formData.gender || 'GROOM'}
                  onChange={(e) => handleTextChange('gender', e.target.value as ProfileGender)}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 font-semibold"
                >
                  <option value="GROOM">वर प्रोफाइल (Groom)</option>
                  <option value="BRIDE">वधू प्रोफाइल (Bride)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  जन्म मिति ई.सं. (Date of Birth AD) *
                </label>
                <input
                  type="date"
                  value={formData.dobAD || ''}
                  onChange={(e) => {
                    handleTextChange('dobAD', e.target.value);
                    const birthYear = new Date(e.target.value).getFullYear();
                    const ageCalc = new Date().getFullYear() - birthYear;
                    handleTextChange('age', ageCalc || 25);
                  }}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  जन्म मिति वि.सं. (DOB BS)
                </label>
                <input
                  type="text"
                  value={formData.dobBS || ''}
                  onChange={(e) => handleTextChange('dobBS', e.target.value)}
                  placeholder="उदा: २०५३-०१-३१"
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  जन्म समय (Birth Time)
                </label>
                <input
                  type="time"
                  value={formData.birthTime || ''}
                  onChange={(e) => handleTextChange('birthTime', e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  हालको जिल्ला (Current District) *
                </label>
                <input
                  type="text"
                  value={formData.currentDistrict || ''}
                  onChange={(e) => handleTextChange('currentDistrict', e.target.value)}
                  placeholder="उदा: काठमाडौँ, ललितपुर, कास्की..."
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  प्रदेश (Province) *
                </label>
                <select
                  value={formData.currentProvince || 'बागमती प्रदेश'}
                  onChange={(e) => handleTextChange('currentProvince', e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3"
                >
                  <option value="कोशी प्रदेश">कोशी प्रदेश</option>
                  <option value="मधेश प्रदेश">मधेश प्रदेश</option>
                  <option value="बागमती प्रदेश">बागमती प्रदेश</option>
                  <option value="गण्डकी प्रदेश">गण्डकी प्रदेश</option>
                  <option value="लुम्बिनी प्रदेश">लुम्बिनी प्रदेश</option>
                  <option value="कर्णाली प्रदेश">कर्णाली प्रदेश</option>
                  <option value="सुदूरपश्चिम प्रदेश">सुदूरपश्चिम प्रदेश</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  उचाइ (Height Feet/Inches)
                </label>
                <input
                  type="text"
                  value={formData.heightFeetInches || "5'7\""}
                  onChange={(e) => handleTextChange('heightFeetInches', e.target.value)}
                  placeholder="उदा: 5'8&quot;"
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  वैवाहिक स्थिति (Marital Status) *
                </label>
                <select
                  value={formData.maritalStatus || 'NEVER_MARRIED'}
                  onChange={(e) => handleTextChange('maritalStatus', e.target.value as MaritalStatus)}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 font-semibold"
                >
                  <option value="NEVER_MARRIED">अविवाहित (Never Married)</option>
                  <option value="DIVORCED">पारपाचुके / पारपाचुके सम्बन्धी (Divorced)</option>
                  <option value="WIDOWED">विदुर / विधवा (Widowed)</option>
                  <option value="AWAITING_DIVORCE">अदालती प्रक्रियामा रहेको (Awaiting Divorce)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Education, Profession & Family */}
        {currentStep === 2 && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* उच्चतम शिक्षा (Education) */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  उच्चतम शिक्षा (Education) *
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
                      handleTextChange('education', '');
                    } else {
                      setCustomFields(prev => ({ ...prev, education: false }));
                      handleTextChange('education', val);
                    }
                  }}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 text-xs"
                  required
                >
                  <option value="">-- उच्चतम शिक्षा छान्नुहोस् --</option>
                  {NEPALI_EDUCATIONS.map(edu => (
                    <option key={edu} value={edu}>{edu}</option>
                  ))}
                  <option value="CUSTOM">अन्य / आफैँ लेख्नुहोस् (Custom)...</option>
                </select>
                {(customFields.education || (formData.education && !NEPALI_EDUCATIONS.includes(formData.education))) && (
                  <input
                    type="text"
                    value={formData.education || ''}
                    onChange={(e) => handleTextChange('education', e.target.value)}
                    placeholder="उदा: B.E., MBBS, MBA, M.Sc., स्नातक..."
                    className="mt-2 w-full bg-stone-50 dark:bg-stone-900 border border-amber-300 dark:border-amber-700 rounded-xl p-2.5 text-xs"
                    required
                  />
                )}
              </div>

              {/* पेशा / पद (Occupation) */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  पेशा / पद (Occupation) *
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
                      handleTextChange('occupation', '');
                    } else {
                      setCustomFields(prev => ({ ...prev, occupation: false }));
                      handleTextChange('occupation', val);
                    }
                  }}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 text-xs"
                  required
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
                    value={formData.occupation || ''}
                    onChange={(e) => handleTextChange('occupation', e.target.value)}
                    placeholder="उदा: सिभिल इन्जिनियर, बालरोग विशेषज्ञ, बैङ्किङ..."
                    className="mt-2 w-full bg-stone-50 dark:bg-stone-900 border border-amber-300 dark:border-amber-700 rounded-xl p-2.5 text-xs"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  कार्यक्षेत्र प्रकार (Employed In)
                </label>
                <select
                  value={formData.employedIn || 'PRIVATE'}
                  onChange={(e) => handleTextChange('employedIn', e.target.value as EmploymentType)}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 text-xs"
                >
                  <option value="GOVT">सरकारी सेवा (Government Service)</option>
                  <option value="PRIVATE">निजी क्षेत्र (Private Sector)</option>
                  <option value="BUSINESS">व्यापार / खुद्रा व्यवसाय (Business)</option>
                  <option value="FOREIGN">वैदेशिक रोजगार / NRI</option>
                  <option value="FREELANCE">स्वतन्त्र व्यवसायी (Freelance / Self-Employed)</option>
                </select>
              </div>

              {/* मासिक आम्दानी दायरा (Monthly Income Range) */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  मासिक आम्दानी दायरा (Monthly Income Range)
                </label>
                <select
                  value={
                    customFields.monthlyIncomeRange
                      ? 'CUSTOM'
                      : NEPALI_INCOME_RANGES.includes(formData.monthlyIncomeRange || '')
                      ? formData.monthlyIncomeRange
                      : (formData.monthlyIncomeRange ? 'CUSTOM' : '')
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'CUSTOM') {
                      setCustomFields(prev => ({ ...prev, monthlyIncomeRange: true }));
                      handleTextChange('monthlyIncomeRange', '');
                    } else {
                      setCustomFields(prev => ({ ...prev, monthlyIncomeRange: false }));
                      handleTextChange('monthlyIncomeRange', val);
                    }
                  }}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 text-xs"
                >
                  <option value="">-- मासिक आम्दानी दायरा छान्नुहोस् --</option>
                  {NEPALI_INCOME_RANGES.map(inc => (
                    <option key={inc} value={inc}>{inc}</option>
                  ))}
                  <option value="CUSTOM">अन्य आम्दानी दायरा (आफैँ लेख्नुहोस्)...</option>
                </select>
                {(customFields.monthlyIncomeRange || (formData.monthlyIncomeRange && !NEPALI_INCOME_RANGES.includes(formData.monthlyIncomeRange))) && (
                  <input
                    type="text"
                    value={formData.monthlyIncomeRange || ''}
                    onChange={(e) => handleTextChange('monthlyIncomeRange', e.target.value)}
                    placeholder="उदा: रु ५०,००० - रु १,००,०००"
                    className="mt-2 w-full bg-stone-50 dark:bg-stone-900 border border-amber-300 dark:border-amber-700 rounded-xl p-2.5 text-xs"
                  />
                )}
              </div>

              {/* धर्म (Religion) */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  धर्म (Religion)
                </label>
                <select
                  value={formData.religion || 'हिन्दू (Hindu)'}
                  onChange={(e) => handleTextChange('religion', e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 text-xs"
                >
                  {NEPALI_RELIGIONS.map(r => (
                    <option key={r.value} value={r.value}>{r.labelNepali}</option>
                  ))}
                  <option value="अन्य (Other)">अन्य धर्म (Other)</option>
                </select>
              </div>

              {/* जात / समुदाय (Caste/Community) */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  जात तथा समुदाय (Caste & Community)
                </label>
                <select
                  value={formData.casteEthnicity || ''}
                  onChange={(e) => handleTextChange('casteEthnicity', e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 text-xs"
                >
                  <option value="">-- जात / समुदाय छान्नुहोस् --</option>
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
                  <optgroup label="अन्य">
                    {NEPALI_CASTES.filter(c => c.category === 'Other').map(c => (
                      <option key={c.value} value={c.value}>{c.labelNepali}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* गोत्र (Gotra) */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  गोत्र (Gotra)
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
                      handleTextChange('gotra', '');
                    } else {
                      setCustomFields(prev => ({ ...prev, gotra: false }));
                      handleTextChange('gotra', val);
                    }
                  }}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 text-xs"
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
                    onChange={(e) => handleTextChange('gotra', e.target.value)}
                    className="mt-2 w-full bg-stone-50 dark:bg-stone-900 border border-amber-300 dark:border-amber-700 rounded-xl p-2.5 text-xs"
                  />
                )}
              </div>

              {/* बुबाको पेशा (Father's Occupation) */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  पिताको पेशा (Father's Occupation)
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
                      handleTextChange('fatherOccupation', '');
                    } else {
                      setCustomFields(prev => ({ ...prev, fatherOccupation: false }));
                      handleTextChange('fatherOccupation', val);
                    }
                  }}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 text-xs"
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
                    onChange={(e) => handleTextChange('fatherOccupation', e.target.value)}
                    className="mt-2 w-full bg-stone-50 dark:bg-stone-900 border border-amber-300 dark:border-amber-700 rounded-xl p-2.5 text-xs"
                  />
                )}
              </div>

              {/* आमाको पेशा (Mother's Occupation) */}
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  माताको पेशा (Mother's Occupation)
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
                      handleTextChange('motherOccupation', '');
                    } else {
                      setCustomFields(prev => ({ ...prev, motherOccupation: false }));
                      handleTextChange('motherOccupation', val);
                    }
                  }}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 text-xs"
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
                    onChange={(e) => handleTextChange('motherOccupation', e.target.value)}
                    className="mt-2 w-full bg-stone-50 dark:bg-stone-900 border border-amber-300 dark:border-amber-700 rounded-xl p-2.5 text-xs"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Partner Expectations & Bio */}
        {currentStep === 3 && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                आफ्नो बारेमा छोटो परिचय (About Candidate) *
              </label>
              <textarea
                rows={3}
                value={formData.aboutMe || ''}
                onChange={(e) => handleTextChange('aboutMe', e.target.value)}
                placeholder="आफ्नो रुचि, चरित्र र जीवनशैलीको बारेमा खुलाउनुहोस्..."
                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3"
                required
              />
            </div>

            <div className="bg-amber-50/70 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 space-y-3">
              <h4 className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-amber-600" /> सुयोग्य जोडीका अपेक्षाहरू (Partner Preferences)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1">न्यूनतम उमेर (Min Age):</label>
                  <input
                    type="number"
                    value={formData.partnerPreferences?.minAge || 22}
                    onChange={(e) => handlePartnerPrefChange('minAge', parseInt(e.target.value) || 20)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-1">अधिकतम उमेर (Max Age):</label>
                  <input
                    type="number"
                    value={formData.partnerPreferences?.maxAge || 30}
                    onChange={(e) => handlePartnerPrefChange('maxAge', parseInt(e.target.value) || 35)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-1">न्यूनतम शिक्षा योग्यता:</label>
                  <input
                    type="text"
                    value={formData.partnerPreferences?.minEducation || 'स्नातक (Bachelor)'}
                    onChange={(e) => handlePartnerPrefChange('minEducation', e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-1">रुचाइएका क्षेत्रहरू/पेशा:</label>
                  <input
                    type="text"
                    value={formData.partnerPreferences?.preferredProfessions?.join(', ') || ''}
                    onChange={(e) => handlePartnerPrefChange('preferredProfessions', e.target.value.split(',').map(s => s.trim()))}
                    placeholder="उदा: इन्जिनियर, डाक्टर, शिक्षक..."
                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-2.5"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Privacy & Photos */}
        {currentStep === 4 && (
          <div className="space-y-4 text-xs sm:text-sm">
            {/* प्रोफाइल तस्बिर (Upload from Device / Camera) */}
            <VivahPhotoUploader
              value={formData.profilePhoto}
              onChange={(photoUrl) => handleTextChange('profilePhoto', photoUrl)}
              label="प्रोफाइल तस्बिर छनोट (तपाईंको गोपनीयता सुरक्षित रहनेछ - अनुहार स्वतः ब्लर हुनेछ):"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  सम्पर्क फोन (Contact Phone) *
                </label>
                <input
                  type="text"
                  value={formData.contactPhone || ''}
                  onChange={(e) => handleTextChange('contactPhone', e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 font-mono"
                  required
                />
                <span className="text-[10px] text-amber-700 dark:text-amber-400">यो सार्वजनिक हुँदैन।</span>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  सम्पर्क इमेल (Contact Email) *
                </label>
                <input
                  type="email"
                  value={formData.contactEmail || ''}
                  onChange={(e) => handleTextChange('contactEmail', e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 font-mono"
                  required
                />
              </div>
            </div>

            {/* परिचयपत्र कागजात (ऐच्छिक - प्रमाणीकरणका लागि) */}
            <div className="pt-1">
              <VivahDocumentUploader
                value={formData.idDocumentUrl}
                onChange={(docUrl) => handleTextChange('idDocumentUrl', docUrl)}
                label="परिचयपत्र कागजात (नागरिकता/राहदानी/NID - प्रमाणीकरणका लागि ऐच्छिक):"
                docType={formData.idDocumentType || 'नागरिकता'}
              />
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 space-y-3">
              <h4 className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-600" /> गोपनीयता नियन्त्रण (Privacy & Contact Controls)
              </h4>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.privacySettings?.hideContactDetails ?? true}
                    onChange={(e) => handlePrivacyChange('hideContactDetails', e.target.checked)}
                    className="w-4 h-4 text-[#D97706] rounded"
                  />
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    फोन र ईमेल गोप्य राख्नुहोस् (Hide Contact Info from Public Profile)
                  </span>
                </label>
                <p className="text-[11px] text-stone-500 pl-6">
                  सम्बन्धित प्रयोगकर्ताको अनुरोध र दुवै पक्षको स्वीकृति पछि मात्र सम्पर्क खुला हुनेछ।
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-between border-t border-stone-200 dark:border-stone-800 pt-5 mt-6">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold py-2.5 px-5 rounded-xl transition-colors"
            >
              पछाडि (Back)
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-600 font-bold py-2.5 px-5 rounded-xl transition-colors"
            >
              रद्द (Cancel)
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="bg-[#D97706] hover:bg-[#B45309] text-white font-bold py-2.5 px-6 rounded-xl shadow transition-colors"
            >
              अगाडि बढ्नुहोस् (Next Step)
            </button>
          ) : (
            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold py-2.5 px-7 rounded-xl shadow-lg transition-all"
            >
              प्रोफाइल सुरक्षित गर्नुहोस् (Save Profile)
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
