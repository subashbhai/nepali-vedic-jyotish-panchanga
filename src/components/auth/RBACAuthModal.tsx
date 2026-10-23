import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Lock,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  KeyRound,
  MapPin,
  X,
  Clock,
  Sparkles,
  Calendar,
  Compass,
  ArrowRight,
  Check,
  RefreshCw,
  Briefcase,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { SystemRole, RBACSession } from '../../db/rbacStore';
import { authService } from '../../services/authService';
import { NEPAL_77_DISTRICTS } from '../../utils/geoLocationHelper';
import { BirthDetails, Gender } from '../../types/astrology';
import { getAssetUrl, handleImageFallback } from '../../utils/assetHelper';
import { convertBSToADFull, convertADToBSFull } from '../../utils/bsCalendarData';

interface RBACAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: SystemRole;
  isSuperAdminOnly?: boolean;
  initialMode?: 'signin' | 'signup';
  onLoginSuccess: (session: RBACSession, createdProfile?: BirthDetails) => void;
}

type AuthModalMode = 'signin' | 'signup_3fields' | 'dual_otp' | 'profile_stage2';

export const RBACAuthModal: React.FC<RBACAuthModalProps> = ({
  isOpen,
  onClose,
  isSuperAdminOnly = false,
  initialMode = 'signin',
  onLoginSuccess
}) => {
  const [mode, setMode] = useState<AuthModalMode>(
    isSuperAdminOnly ? 'signin' : initialMode === 'signup' ? 'signup_3fields' : 'signin'
  );

  // Sign In State
  const [loginPhoneOrEmail, setLoginPhoneOrEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phase 4: Exactly 3 fields for initial signup
  const [fullName, setFullName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');

  // Phase 5: Dual OTP State
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Active Authenticated Session
  const [authenticatedSession, setAuthenticatedSession] = useState<RBACSession | null>(null);

  // Phase 8: Stage 2 Detailed Profile State
  const [address, setAddress] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('बागमती प्रदेश');
  const [selectedDistrict, setSelectedDistrict] = useState('काठमाडौँ');
  const [localLevel, setLocalLevel] = useState('');
  const [ward, setWard] = useState('१');
  const [occupation, setOccupation] = useState('');
  const [gender, setGender] = useState<Gender>('male');

  // Birth Details for Kundali (Stage 2)
  const [dateType, setDateType] = useState<'BS' | 'AD'>('BS');
  const [bsYear, setBsYear] = useState('2055');
  const [bsMonth, setBsMonth] = useState('5');
  const [bsDay, setBsDay] = useState('15');
  const [birthHour, setBirthHour] = useState('06');
  const [birthMinute, setBirthMinute] = useState('30');
  const [birthAmPm, setBirthAmPm] = useState<'AM' | 'PM'>('AM');
  const [birthPlace, setBirthPlace] = useState('काठमाडौँ, नेपाल');

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reset or initialize modal mode when opened
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      if (!isSuperAdminOnly) {
        setMode(initialMode === 'signup' ? 'signup_3fields' : 'signin');
      } else {
        setMode('signin');
      }
    }
  }, [isOpen, initialMode, isSuperAdminOnly]);

  // Resend OTP Cooldown Timer
  useEffect(() => {
    let timer: any;
    if (mode === 'dual_otp' && resendCooldown > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, resendCooldown]);

  if (!isOpen) return null;

  // ─────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────

  // 1. Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginPhoneOrEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('कृपया मोबाइल नम्बर/इमेल र पासवर्ड दुवै प्रविष्ट गर्नुहोस्।');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.login(loginPhoneOrEmail, loginPassword);
      setIsLoading(false);

      if (res.success && res.session) {
        setSuccessMsg('लगइन सफल भयो!');
        setTimeout(() => {
          onLoginSuccess(res.session!);
          onClose();
        }, 600);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('लगइन गर्दा प्राविधिक समस्या आयो। कृपया पुनः प्रयास गर्नुहोस्।');
    }
  };

  // 2. Phase 4: Submit 3-Field Signup Form
  const handleStartSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = fullName.trim();
    const cleanPhone = signupPhone.trim();
    const cleanEmail = signupEmail.trim();

    if (!cleanName || cleanName.length < 2) {
      setErrorMsg('कृपया आफ्नो पूरा नाम (कम्तीमा २ अक्षर) प्रविष्ट गर्नुहोस्।');
      return;
    }

    const digitsOnly = cleanPhone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setErrorMsg('कृपया मान्य १० अङ्कको मोबाइल नम्बर प्रविष्ट गर्नुहोस् (उदा: ९८xxxxxxxx)।');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस् (उदा: example@gmail.com)।');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.startSignup(cleanName, cleanPhone, cleanEmail);
      setIsLoading(false);

      if (res.success && res.challengeId) {
        setChallengeId(res.challengeId);
        setIsPhoneVerified(false);
        setIsEmailVerified(false);
        setPhoneOtp('');
        setEmailOtp('');
        setResendCooldown(60);
        setCanResend(false);
        setMode('dual_otp');
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('साइन अप सुरु गर्दा समस्या आयो। कृपया पुनः प्रयास गर्नुहोस्।');
    }
  };

  // 3. Phase 5: Verify Mobile OTP
  const handleVerifyPhone = async () => {
    if (!challengeId) return;
    if (phoneOtp.trim().length < 6) {
      setErrorMsg('कृपया ६ अङ्कको मोबाइल OTP कोड लेख्नुहोस्।');
      return;
    }

    setIsVerifyingPhone(true);
    setErrorMsg(null);
    try {
      const res = await authService.verifyPhoneOTP(challengeId, phoneOtp);
      setIsVerifyingPhone(false);

      if (res.success && res.phoneVerified) {
        setIsPhoneVerified(true);
        setSuccessMsg('✓ मोबाइल प्रमाणीकरण सम्पन्न भयो!');

        // Check if both are now verified -> finalize automatically
        if (res.isBothVerified || isEmailVerified) {
          await triggerFinalize(challengeId);
        }
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setIsVerifyingPhone(false);
      setErrorMsg('मोबाइल OTP जाँच गर्दा समस्या आयो।');
    }
  };

  // 4. Phase 5: Verify Email OTP
  const handleVerifyEmail = async () => {
    if (!challengeId) return;
    if (emailOtp.trim().length < 6) {
      setErrorMsg('कृपया ६ अङ्कको इमेल OTP कोड लेख्नुहोस्।');
      return;
    }

    setIsVerifyingEmail(true);
    setErrorMsg(null);
    try {
      const res = await authService.verifyEmailOTP(challengeId, emailOtp);
      setIsVerifyingEmail(false);

      if (res.success && res.emailVerified) {
        setIsEmailVerified(true);
        setSuccessMsg('✓ इमेल प्रमाणीकरण सम्पन्न भयो!');

        // Check if both are now verified -> finalize automatically
        if (res.isBothVerified || isPhoneVerified) {
          await triggerFinalize(challengeId);
        }
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setIsVerifyingEmail(false);
      setErrorMsg('इमेल OTP जाँच गर्दा समस्या आयो।');
    }
  };

  // 5. Phase 7: Trigger Finalize & Automatic Login
  const triggerFinalize = async (cid: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const finRes = await authService.finalizeSignup(cid);
      setIsLoading(false);

      if (finRes.success && finRes.user && finRes.token) {
        const session: RBACSession = {
          token: finRes.token,
          userId: finRes.user.id,
          username: finRes.user.phone,
          fullName: finRes.user.fullName,
          role: finRes.user.role || 'CUSTOMER',
          roleNameNepali: finRes.user.roleNameNepali || 'यजमान / ग्राहक',
          status: 'active',
          permissions: finRes.user.permissions || ['store.view', 'kundali.view', 'profile.edit'],
          customerId: finRes.user.customerId,
          phone: finRes.user.phone,
          createdAtISO: new Date().toISOString(),
          lastActivityISO: new Date().toISOString()
        };

        setAuthenticatedSession(session);
        setSuccessMsg('साइन अप तथा दोहोरो प्रमाणीकरण सफल भयो! स्वागत छ।');
        // Phase 8: Transition directly to Stage 2 Profile Completion
        setMode('profile_stage2');
      } else {
        setErrorMsg(finRes.message || 'दर्ता प्रक्रिया अन्तिम रूप दिन सकिएन।');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('दर्ता सम्पन्न गर्दा समस्या आयो।');
    }
  };

  // 6. Resend OTP
  const handleResend = async () => {
    if (!challengeId || !canResend) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await authService.resendOTP(challengeId, 'both');
      setIsLoading(false);
      if (res.success) {
        setResendCooldown(60);
        setCanResend(false);
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('OTP पुनः पठाउन सकिएन।');
    }
  };

  // 7. Phase 8: Save Stage 2 Detailed Profile
  const handleSaveDetailedProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const birthDetailsObj: any = {
      name: fullName,
      dateBS: `${bsYear}-${bsMonth.padStart(2, '0')}-${bsDay.padStart(2, '0')}`,
      time: `${birthHour}:${birthMinute} ${birthAmPm}`,
      location: {
        name: birthPlace,
        district: selectedDistrict,
        province: selectedProvince,
        country: 'नेपाल'
      },
      gender
    };

    try {
      const res = await authService.completeDetailedProfile({
        fullName,
        address: address.trim() || `${selectedDistrict}, ${selectedProvince}`,
        province: selectedProvince,
        district: selectedDistrict,
        localLevel: localLevel.trim(),
        ward: ward.trim(),
        dobBS: `${bsYear}-${bsMonth}-${bsDay}`,
        birthTime: `${birthHour}:${birthMinute} ${birthAmPm}`,
        birthPlace: birthPlace.trim(),
        occupation: occupation.trim(),
        gender,
        birthDetails: birthDetailsObj
      });
      setIsLoading(false);

      if (res.success && authenticatedSession) {
        setSuccessMsg('तपाईंको विस्तृत विवरण सफलतापूर्वक सुरक्षित भयो!');
        setTimeout(() => {
          onLoginSuccess(authenticatedSession, birthDetailsObj);
          onClose();
        }, 800);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('विवरण सुरक्षित गर्दा समस्या आयो।');
    }
  };

  // 8. Skip Stage 2 and proceed with partial profile
  const handleSkipStage2 = () => {
    if (authenticatedSession) {
      onLoginSuccess(authenticatedSession);
      onClose();
    }
  };

  // Districts for selected province
  const filteredDistricts = NEPAL_77_DISTRICTS.filter((d) => d.province === selectedProvince);

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-2 sm:p-4 overflow-y-auto backdrop-blur-md bg-stone-950/80 animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-[#1C1917] text-stone-900 dark:text-stone-100 rounded-3xl shadow-2xl border-2 border-amber-400/80 dark:border-amber-600/80 w-full max-w-xl overflow-hidden relative my-auto max-h-[94vh] flex flex-col"
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#7A1C1C] via-[#9B2C2C] to-[#611212] text-white p-4 sm:p-5 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-stone-200 hover:text-white transition-colors cursor-pointer"
            title="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 pr-8">
            <div className="w-12 h-12 rounded-full bg-white dark:bg-stone-900 p-0.5 border-2 border-amber-300 flex items-center justify-center shrink-0 shadow-md overflow-hidden ring-2 ring-amber-400/30">
              <img
                src={getAssetUrl('/logo.png')}
                alt="बालानन्द लोगो"
                className="w-full h-full object-cover rounded-full select-none"
                onError={(e) => {
                  handleImageFallback(e, [
                    getAssetUrl('/logo.png'),
                    getAssetUrl('/assets/logo.png'),
                    getAssetUrl('/balananda-logo.png'),
                  ]);
                }}
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 font-bold text-[10px] uppercase tracking-wider mb-0.5">
                <ShieldCheck className="w-3 h-3 text-stone-950" />
                <span>
                  {mode === 'signin' && 'प्रयोगकर्ता लगइन'}
                  {mode === 'signup_3fields' && 'नयाँ सदस्यता दर्ता'}
                  {mode === 'dual_otp' && 'दोहोरो OTP प्रमाणीकरण'}
                  {mode === 'profile_stage2' && 'दोस्रो चरण: विस्तृत विवरण'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                बालानन्द वैदिक ज्योतिष सेवा
              </h3>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          {/* Success Banner */}
          {successMsg && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 dark:text-rose-200 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              VIEW 1: SIGN IN (LOGIN)
              ───────────────────────────────────────────────────────────── */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">
                  मोबाइल नम्बर वा प्रयोगकर्ता नाम *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="९८xxxxxxxx / ९७xxxxxxxx"
                    value={loginPhoneOrEmail}
                    onChange={(e) => setLoginPhoneOrEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">
                  पासवर्ड *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="तपाईंको पासवर्ड"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#7A1C1C] via-[#9B2C2C] to-[#7A1C1C] hover:from-[#8B2323] hover:to-[#6E1818] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-60"
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                <span>{isLoading ? 'लगइन हुँदैछ...' : 'साइन इन / लगइन गर्नुहोस्'}</span>
              </button>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 text-center">
                <p className="text-xs text-stone-500">
                  नयाँ खाता खोल्न चाहनुहुन्छ?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setMode('signup_3fields');
                    }}
                    className="text-amber-700 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    सदस्यता लिनुहोस् (Sign Up) ↗
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ─────────────────────────────────────────────────────────────
              VIEW 2: PHASE 4 SIGNUP (EXACTLY THREE FIELDS)
              ───────────────────────────────────────────────────────────── */}
          {mode === 'signup_3fields' && (
            <form onSubmit={handleStartSignup} className="space-y-4 animate-in fade-in">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-900 dark:text-amber-200">
                <span className="font-bold block">पहिलो चरण: केवल ३ वटा विवरण</span>
                <span className="text-[11px] text-stone-600 dark:text-stone-400">
                  मोबाइल र इमेलमा एक-एक वटा ६ अङ्कको गोप्य OTP सुरक्षा कोड पठाइनेछ।
                </span>
              </div>

              {/* Field 1: Full Name */}
              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">
                  १. पूरा नाम (Full Name) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="उदा: पं. रामप्रसाद शर्मा"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Field 2: Mobile Number */}
              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">
                  २. मोबाइल नम्बर (Mobile Number) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="९८xxxxxxxx / ९७xxxxxxxx"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  SMS मार्फत ६ अङ्कको OTP कोड पठाइनेछ।
                </span>
              </div>

              {/* Field 3: Email Address */}
              <div>
                <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1">
                  ३. इमेल ठेगाना (Email Address) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="example@gmail.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-stone-500 mt-0.5 block">
                  इमेल प्रमाणीकरण कोड (OTP) पठाइनेछ।
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-60"
              >
                <ShieldCheck className="w-4 h-4 text-amber-200" />
                <span>{isLoading ? 'OTP कोड पठाइँदैछ...' : 'सुरक्षा कोड (OTP) पठाउनुहोस् →'}</span>
              </button>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 text-center">
                <p className="text-xs text-stone-500">
                  पहिले नै खाता दर्ता छ?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setMode('signin');
                    }}
                    className="text-amber-700 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    साइन इन / Login गर्नुहोस् ↗
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ─────────────────────────────────────────────────────────────
              VIEW 3: PHASE 5 DUAL OTP VERIFICATION SCREEN
              ───────────────────────────────────────────────────────────── */}
          {mode === 'dual_otp' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <span className="font-bold block flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  दोहोरो प्रमाणीकरण आवश्यक छ
                </span>
                <p className="text-[11px] leading-relaxed text-stone-600 dark:text-stone-300">
                  तपाईंको मोबाइल <strong>{signupPhone}</strong> र इमेल <strong>{signupEmail}</strong> मा अलग-अलग ६ अङ्कको OTP पठाइएको छ। दुवै कोड प्रमाणीकरण गर्नुहोस्।
                </p>
              </div>

              {/* Channel 1: Mobile Phone OTP Block */}
              <div className={`p-4 rounded-2xl border-2 transition-all ${isPhoneVerified ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200' : 'bg-stone-50 dark:bg-stone-900 border-stone-300 dark:border-stone-700'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-amber-600" />
                    १. मोबाइल OTP (SMS)
                  </span>
                  {isPhoneVerified ? (
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      प्रमाणीकरण भयो
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                      बाँकी छ
                    </span>
                  )}
                </div>

                {!isPhoneVerified ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="६ अङ्कको कोड"
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl font-mono text-center text-sm font-bold tracking-widest focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={isVerifyingPhone || phoneOtp.length < 6}
                      onClick={handleVerifyPhone}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isVerifyingPhone ? 'जाँचिँदै...' : 'रुजु गर्नुहोस्'}
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>मोबाइल नम्बर ({signupPhone}) प्रमाणित भयो।</span>
                  </div>
                )}
              </div>

              {/* Channel 2: Email OTP Block */}
              <div className={`p-4 rounded-2xl border-2 transition-all ${isEmailVerified ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200' : 'bg-stone-50 dark:bg-stone-900 border-stone-300 dark:border-stone-700'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-amber-600" />
                    २. इमेल OTP (Email)
                  </span>
                  {isEmailVerified ? (
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      प्रमाणीकरण भयो
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                      बाँकी छ
                    </span>
                  )}
                </div>

                {!isEmailVerified ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="६ अङ्कको कोड"
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl font-mono text-center text-sm font-bold tracking-widest focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={isVerifyingEmail || emailOtp.length < 6}
                      onClick={handleVerifyEmail}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isVerifyingEmail ? 'जाँचिँदै...' : 'रुजु गर्नुहोस्'}
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>इमेल ठेगाना ({signupEmail}) प्रमाणित भयो।</span>
                  </div>
                )}
              </div>

              {/* Resend OTP Bar */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-stone-500">
                  {canResend ? 'कोड प्राप्त भएन?' : `पुनः पठाउन बाँकी: ${resendCooldown} सेकेन्ड`}
                </span>
                <button
                  type="button"
                  disabled={!canResend || isLoading}
                  onClick={handleResend}
                  className={`flex items-center gap-1 font-bold ${canResend ? 'text-amber-700 dark:text-amber-400 hover:underline cursor-pointer' : 'text-stone-400 cursor-not-allowed'}`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>नयाँ कोड पठाउनुहोस्</span>
                </button>
              </div>

              {/* Back Link */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setMode('signup_3fields');
                  }}
                  className="text-xs text-stone-500 hover:underline cursor-pointer"
                >
                  ← फोन वा इमेल सच्याउनुहोस्
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              VIEW 4: PHASE 8 SECOND-STAGE COMPLETE USER PROFILE
              ───────────────────────────────────────────────────────────── */}
          {mode === 'profile_stage2' && (
            <form onSubmit={handleSaveDetailedProfile} className="space-y-4 animate-in fade-in">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    प्रमाणित खाता: <strong>{fullName}</strong>
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                  दोहोरो प्रमाणित ✓
                </span>
              </div>

              <div className="border-b border-stone-200 dark:border-stone-800 pb-2">
                <h4 className="font-extrabold text-xs sm:text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>आफ्नो विस्तृत विवरण पूरा गर्नुहोस् (Stage 2)</span>
                </h4>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  चिना, कुण्डली, फलादेश तथा व्यक्तिगत सेवाहरूका लागि आवश्यक विवरण भर्नुहोस्।
                </p>
              </div>

              {/* Readonly Verified Contact Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-stone-100 dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-800">
                  <span className="text-[10px] text-stone-500 block">प्रमाणित मोबाइल नम्बर:</span>
                  <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400">
                    {signupPhone || authenticatedSession?.phone}
                  </span>
                </div>
                <div className="p-2.5 bg-stone-100 dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-800">
                  <span className="text-[10px] text-stone-500 block">प्रमाणित इमेल:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 truncate block">
                    {signupEmail || (authenticatedSession as any)?.email || 'pramanit@balananda.com'}
                  </span>
                </div>
              </div>

              {/* Geographic Location: Province & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                    प्रदेश (Province) *
                  </label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => {
                      setSelectedProvince(e.target.value);
                      const dList = NEPAL_77_DISTRICTS.filter((d) => d.province === e.target.value);
                      if (dList.length > 0) setSelectedDistrict(dList[0].district);
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none cursor-pointer"
                  >
                    {[
                      'कोशी प्रदेश',
                      'मधेश प्रदेश',
                      'बागमती प्रदेश',
                      'गण्डकी प्रदेश',
                      'लुम्बिनी प्रदेश',
                      'कर्णाली प्रदेश',
                      'सुदूरपश्चिम प्रदेश'
                    ].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                    जिल्ला (District) *
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none cursor-pointer"
                  >
                    {filteredDistricts.map((d) => (
                      <option key={d.district} value={d.district}>
                        {d.district} ({d.districtEn})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Municipality and Ward / Street Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                    गाउँपालिका / नगरपालिका (Local Level)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा: काठमाडौँ महानगरपालिका"
                    value={localLevel}
                    onChange={(e) => setLocalLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                    टोल / सडक / वडा नं. (Street / Tole)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा: बानेश्वर-१०, थापागाउँ"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Birth Details (BS Date, Time, Place) */}
              <div className="p-3 bg-stone-50 dark:bg-stone-900/60 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    जन्ममिति तथा जन्मसमय (कुण्डलीका लागि)
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-stone-500 text-[10px] mb-0.5">वर्ष (वि.सं.)</label>
                    <input
                      type="number"
                      value={bsYear}
                      onChange={(e) => setBsYear(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 text-[10px] mb-0.5">महिना</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={bsMonth}
                      onChange={(e) => setBsMonth(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 text-[10px] mb-0.5">गते</label>
                    <input
                      type="number"
                      min={1}
                      max={32}
                      value={bsDay}
                      onChange={(e) => setBsDay(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-center"
                    />
                  </div>
                </div>

                {/* Birth Time and Place */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-stone-500 text-[10px] mb-0.5">जन्मसमय (घण्टा : मिनेट)</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={birthHour}
                        onChange={(e) => setBirthHour(e.target.value)}
                        placeholder="HH"
                        className="w-12 px-2 py-1.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-center font-mono"
                      />
                      <span>:</span>
                      <input
                        type="text"
                        value={birthMinute}
                        onChange={(e) => setBirthMinute(e.target.value)}
                        placeholder="MM"
                        className="w-12 px-2 py-1.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-center font-mono"
                      />
                      <select
                        value={birthAmPm}
                        onChange={(e) => setBirthAmPm(e.target.value as any)}
                        className="px-2 py-1.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-xs"
                      >
                        <option value="AM">AM (बिहानी)</option>
                        <option value="PM">PM (दिउँसो/रात्री)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-500 text-[10px] mb-0.5">जन्मस्थान (Birth Place)</label>
                    <input
                      type="text"
                      placeholder="उदा: काठमाडौँ, नेपाल"
                      value={birthPlace}
                      onChange={(e) => setBirthPlace(e.target.value)}
                      className="w-full px-2 py-1.5 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Occupation and Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                    पेशा / व्यवसाय (Occupation)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा: प्राध्यापक, व्यापार, सेवा"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                    लिङ्ग (Gender)
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none cursor-pointer"
                  >
                    <option value="male">पुरुष (Male)</option>
                    <option value="female">महिला (Female)</option>
                    <option value="other">अन्य (Other)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>{isLoading ? 'सुरक्षित गरिँदैछ...' : 'विवरण सुरक्षित गर्नुहोस् र सुरु गर्नुहोस्'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSkipStage2}
                  className="w-full py-2.5 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 font-medium cursor-pointer"
                >
                  पछि भर्नुहोस् (ड्यासबोर्डमा जानुहोस् →)
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
