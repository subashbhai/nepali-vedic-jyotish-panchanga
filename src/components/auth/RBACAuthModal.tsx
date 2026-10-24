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
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { SystemRole, RBACSession } from '../../db/rbacStore';
import { authService, OTPChannel } from '../../services/authService';
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

  // Sign In State (Password Flow)
  const [loginPhoneOrEmail, setLoginPhoneOrEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Single Shared OTP Login State (SMS, WhatsApp, Email)
  const [signInMethod, setSignInMethod] = useState<'otp' | 'password'>('otp');
  const [selectedChannel, setSelectedChannel] = useState<OTPChannel>('sms');
  const [loginDestination, setLoginDestination] = useState('');
  const [sharedOtpCode, setSharedOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [maskedRecipientHint, setMaskedRecipientHint] = useState('');
  const [singleChallengeId, setSingleChallengeId] = useState<string | null>(null);

  // Unified Single OTP Signup State
  const [fullName, setFullName] = useState('');
  const [signupChannel, setSignupChannel] = useState<OTPChannel>('sms');
  const [signupDestination, setSignupDestination] = useState('');
  const [isSignupOtpSent, setIsSignupOtpSent] = useState(false);
  const [signupChallengeId, setSignupChallengeId] = useState<string | null>(null);
  const [signupMaskedDestination, setSignupMaskedDestination] = useState('');
  const [signupOtpCode, setSignupOtpCode] = useState('');

  // Legacy Dual OTP State (Preserved for compatibility)
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [devHint, setDevHint] = useState<{ phoneOtp?: string; emailOtp?: string } | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<any>(null);

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
      setIsOtpSent(false);
      setIsSignupOtpSent(false);
      setSharedOtpCode('');
      setSignupOtpCode('');
      setSingleChallengeId(null);
      setSignupChallengeId(null);
      if (!isSuperAdminOnly) {
        setMode(initialMode === 'signup' ? 'signup_3fields' : 'signin');
      } else {
        setMode('signin');
      }
    }
  }, [isOpen, initialMode, isSuperAdminOnly]);

  // Unified Resend OTP Cooldown Timer
  useEffect(() => {
    let timer: any;
    if ((isOtpSent || isSignupOtpSent || mode === 'dual_otp') && resendCooldown > 0) {
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
  }, [isOtpSent, isSignupOtpSent, mode, resendCooldown]);

  if (!isOpen) return null;

  // ─────────────────────────────────────────────────────────────
  // SINGLE SHARED-BOX OTP HANDLERS (SMS, WHATSAPP, EMAIL)
  // ─────────────────────────────────────────────────────────────

  // 1. Single OTP Login: Send OTP to selected channel
  const handleSendLoginOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanDest = loginDestination.trim();
    if (!cleanDest) {
      setErrorMsg(selectedChannel === 'email' ? 'कृपया इमेल ठेगाना प्रविष्ट गर्नुहोस्।' : 'कृपया मोबाइल नम्बर प्रविष्ट गर्नुहोस्।');
      return;
    }

    if (selectedChannel === 'email') {
      if (!cleanDest.includes('@') || !cleanDest.includes('.')) {
        setErrorMsg('कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस् (उदा: yourname@gmail.com)।');
        return;
      }
    } else {
      const digits = cleanDest.replace(/\D/g, '');
      if (digits.length < 10) {
        setErrorMsg('कृपया मान्य १० अङ्कको मोबाइल नम्बर प्रविष्ट गर्नुहोस् (उदा: ९८xxxxxxxx)।');
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await authService.sendOTP(selectedChannel, cleanDest, undefined, 'login');
      setIsLoading(false);
      if (res.success && res.challengeId) {
        setSingleChallengeId(res.challengeId);
        setIsOtpSent(true);
        setMaskedRecipientHint(res.maskedDestination || cleanDest);
        setSharedOtpCode('');
        setResendCooldown(60);
        setCanResend(false);
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('सुरक्षा कोड पठाउँदा प्राविधिक समस्या आयो।');
    }
  };

  // 2. Single OTP Login: Verify code from single shared box
  const handleVerifySingleOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleChallengeId) return;

    const cleanOtp = sharedOtpCode.trim().replace(/\D/g, '');
    if (cleanOtp.length < 6) {
      setErrorMsg('कृपया ६ अङ्कको सुरक्षा कोड पूरा प्रविष्ट गर्नुहोस्।');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await authService.verifySingleOTP(singleChallengeId, cleanOtp);
      setIsLoading(false);

      if (res.success && res.session) {
        setSuccessMsg('प्रमाणीकरण सफल भयो! स्वागत छ।');
        setTimeout(() => {
          onLoginSuccess(res.session!);
          onClose();
        }, 600);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('सुरक्षा कोड प्रमाणित गर्दा समस्या आयो।');
    }
  };

  // 3. Single OTP Login: Resend code with cooldown
  const handleResendLoginOTP = async () => {
    if (!singleChallengeId || !canResend) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await authService.resendSingleOTP(singleChallengeId);
      setIsLoading(false);
      if (res.success) {
        setResendCooldown(res.remainingSeconds || 60);
        setCanResend(false);
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('नयाँ कोड पुनः पठाउन सकिएन।');
    }
  };

  // 4. Single OTP Signup: Send OTP
  const handleSendSignupOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = fullName.trim();
    if (!cleanName || cleanName.length < 2) {
      setErrorMsg('कृपया आफ्नो पूरा नाम (कम्तीमा २ अक्षर) प्रविष्ट गर्नुहोस्।');
      return;
    }

    const cleanDest = signupDestination.trim();
    if (!cleanDest) {
      setErrorMsg(signupChannel === 'email' ? 'कृपया इमेल ठेगाना प्रविष्ट गर्नुहोस्।' : 'कृपया मोबाइल नम्बर प्रविष्ट गर्नुहोस्।');
      return;
    }

    if (signupChannel === 'email') {
      if (!cleanDest.includes('@') || !cleanDest.includes('.')) {
        setErrorMsg('कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्।');
        return;
      }
    } else {
      const digits = cleanDest.replace(/\D/g, '');
      if (digits.length < 10) {
        setErrorMsg('कृपया मान्य १० अङ्कको मोबाइल नम्बर प्रविष्ट गर्नुहोस्।');
        return;
      }
    }

    setIsLoading(true);
    try {
      const res = await authService.sendOTP(signupChannel, cleanDest, cleanName, 'signup');
      setIsLoading(false);
      if (res.success && res.challengeId) {
        setSignupChallengeId(res.challengeId);
        setIsSignupOtpSent(true);
        setSignupMaskedDestination(res.maskedDestination || cleanDest);
        setSignupOtpCode('');
        setResendCooldown(60);
        setCanResend(false);
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('साइन अप सुरु गर्दा समस्या आयो।');
    }
  };

  // 5. Single OTP Signup: Verify code
  const handleVerifySignupOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupChallengeId) return;

    const cleanOtp = signupOtpCode.trim().replace(/\D/g, '');
    if (cleanOtp.length < 6) {
      setErrorMsg('कृपया ६ अङ्कको सुरक्षा कोड प्रविष्ट गर्नुहोस्।');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await authService.verifySingleOTP(signupChallengeId, cleanOtp);
      setIsLoading(false);

      if (res.success && res.session) {
        setAuthenticatedSession(res.session);
        if (signupChannel === 'email') {
          setSignupEmail(signupDestination);
          if (!signupPhone) setSignupPhone(res.session.phone || '९८xxxxxxxx');
        } else {
          setSignupPhone(signupDestination);
          if (!signupEmail) setSignupEmail((res.session as any).email || `${signupDestination}@balanandajyotish.com.np`);
        }
        setSuccessMsg('प्रमाणीकरण सफल भयो! स्वागत छ।');
        // Transition to Stage 2 Profile Completion
        setMode('profile_stage2');
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('सुरक्षा कोड प्रमाणित गर्दा समस्या आयो।');
    }
  };

  // 6. Single OTP Signup: Resend code
  const handleResendSignupOTP = async () => {
    if (!signupChallengeId || !canResend) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await authService.resendSingleOTP(signupChallengeId);
      setIsLoading(false);
      if (res.success) {
        setResendCooldown(res.remainingSeconds || 60);
        setCanResend(false);
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('नयाँ कोड पुनः पठाउन सकिएन।');
    }
  };

  // ─────────────────────────────────────────────────────────────
  // PASSWORD & LEGACY HANDLERS
  // ─────────────────────────────────────────────────────────────

  // Sign In with Password
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
        setDevHint(res.devHint || null);
        setDeliveryStatus(res.deliveryStatus || null);
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
        if (res.devHint) {
          setDevHint(res.devHint);
        }
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
              VIEW 1: SIGN IN (LOGIN) - OTP FIRST WITH PASSWORD TAB
              ───────────────────────────────────────────────────────────── */}
          {mode === 'signin' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Method Switcher Tabs (OTP vs Password) */}
              {!isSuperAdminOnly && (
                <div className="flex bg-stone-100 dark:bg-stone-800 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setSignInMethod('otp');
                      setErrorMsg(null);
                    }}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      signInMethod === 'otp'
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>OTP कोड लगइन</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSignInMethod('password');
                      setErrorMsg(null);
                    }}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      signInMethod === 'password'
                        ? 'bg-gradient-to-r from-stone-700 to-stone-900 text-white shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>पासवर्ड लगइन</span>
                  </button>
                </div>
              )}

              {/* A. OTP LOGIN FLOW */}
              {(signInMethod === 'otp' && !isSuperAdminOnly) ? (
                !isOtpSent ? (
                  // Step A1: Choose Delivery Channel and Enter Destination
                  <form onSubmit={handleSendLoginOTP} className="space-y-3.5">
                    <div>
                      <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1.5 text-xs">
                        १. सुरक्षा कोड (OTP) प्राप्त गर्ने माध्यम छनोट गर्नुहोस्:
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedChannel('sms')}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                            selectedChannel === 'sms'
                              ? 'border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-200 font-bold ring-2 ring-amber-500/30'
                              : 'border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-amber-400'
                          }`}
                        >
                          <Smartphone className="w-4 h-4 text-amber-600" />
                          <span className="text-[11px]">📱 SMS</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedChannel('firebase')}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                            selectedChannel === 'firebase'
                              ? 'border-orange-500 bg-orange-500/15 text-orange-900 dark:text-orange-200 font-bold ring-2 ring-orange-500/30'
                              : 'border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-orange-400'
                          }`}
                        >
                          <ShieldCheck className="w-4 h-4 text-orange-600" />
                          <span className="text-[11px]">🔥 Firebase</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedChannel('whatsapp')}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                            selectedChannel === 'whatsapp'
                              ? 'border-emerald-500 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/30'
                              : 'border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-emerald-400'
                          }`}
                        >
                          <MessageSquare className="w-4 h-4 text-emerald-600" />
                          <span className="text-[11px]">💬 WhatsApp</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedChannel('email')}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                            selectedChannel === 'email'
                              ? 'border-blue-500 bg-blue-500/15 text-blue-900 dark:text-blue-200 font-bold ring-2 ring-blue-500/30'
                              : 'border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-blue-400'
                          }`}
                        >
                          <Mail className="w-4 h-4 text-blue-600" />
                          <span className="text-[11px]">✉️ Email</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1 text-xs">
                        {selectedChannel === 'email' ? 'इमेल ठेगाना *' : 'मोबाइल नम्बर *'}
                      </label>
                      <div className="relative">
                        {selectedChannel === 'email' ? (
                          <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        ) : (
                          <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                        )}
                        <input
                          type={selectedChannel === 'email' ? 'email' : 'tel'}
                          required
                          placeholder={
                            selectedChannel === 'email'
                              ? 'तपाईंको इमेल (उदा: user@gmail.com)'
                              : '९८xxxxxxxx / ९७xxxxxxxx'
                          }
                          value={loginDestination}
                          onChange={(e) => setLoginDestination(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none font-mono"
                        />
                      </div>
                      <span className="text-[10px] text-stone-500 mt-1 block">
                        {selectedChannel === 'sms' && 'नेपाली मोबाइल नम्बरमा ६ अङ्कको SMS सुरक्षा कोड पठाइनेछ।'}
                        {selectedChannel === 'firebase' && 'Google Firebase Phone Auth मार्फत तपाईंको मोबाइलमा आधिकारिक SMS कोड पठाइनेछ।'}
                        {selectedChannel === 'whatsapp' && 'तपाईंको WhatsApp नम्बरमा ६ अङ्कको आधिकारिक कोड पठाइनेछ।'}
                        {selectedChannel === 'email' && 'तपाईंको इमेल ठेगानामा ६ अङ्कको प्रमाणीकरण कोड पठाइनेछ।'}
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-60"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-200" />
                      <span>{isLoading ? 'OTP कोड पठाइँदैछ...' : 'OTP सुरक्षा कोड प्राप्त गर्नुहोस् →'}</span>
                    </button>
                  </form>
                ) : (
                  // Step A2: Single Shared OTP Verification Box
                  <form onSubmit={handleVerifySingleOTP} className="space-y-4">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>OTP कोड सफलतापूर्वक पठाइयो</span>
                      </div>
                      <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed font-mono">
                        <strong>{maskedRecipientHint}</strong> मा {selectedChannel === 'whatsapp' ? 'WhatsApp (ह्वाट्सएप)' : selectedChannel === 'sms' ? 'मोबाइल SMS' : 'इमेल (Email)'} मार्फत ६ अङ्कको गोप्य कोड पठाइएको छ।
                      </p>
                    </div>

                    <div>
                      <label className="block text-center text-stone-700 dark:text-stone-300 font-bold mb-2 text-xs">
                        प्राप्त ६ अङ्कको OTP कोड प्रविष्ट गर्नुहोस्:
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        autoFocus
                        required
                        placeholder="• • • • • •"
                        value={sharedOtpCode}
                        onChange={(e) => setSharedOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full text-center tracking-[0.6em] text-2xl font-mono py-3 font-black bg-white dark:bg-stone-900 border-2 border-amber-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || sharedOtpCode.length < 6}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{isLoading ? 'प्रमाणीकरण हुँदैछ...' : 'प्रमाणीकरण गरी लगइन गर्नुहोस्'}</span>
                    </button>

                    {/* Timer and Resend Controls */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-200 dark:border-stone-800">
                      <span className="text-stone-500 text-[11px]">
                        {canResend ? (
                          'कोड प्राप्त भएन?'
                        ) : (
                          <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-mono font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            <span>पुनः पठाउन बाँकी: {resendCooldown} सेकेन्ड</span>
                          </span>
                        )}
                      </span>
                      <button
                        type="button"
                        disabled={!canResend || isLoading}
                        onClick={handleResendLoginOTP}
                        className={`flex items-center gap-1 font-bold text-[11px] ${
                          canResend
                            ? 'text-amber-700 dark:text-amber-400 hover:underline cursor-pointer'
                            : 'text-stone-400 cursor-not-allowed'
                        }`}
                      >
                        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                        <span>पुनः कोड पठाउनुहोस्</span>
                      </button>
                    </div>

                    {/* Change Destination / Channel */}
                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsOtpSent(false);
                          setSharedOtpCode('');
                          setErrorMsg(null);
                        }}
                        className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xs hover:underline cursor-pointer"
                      >
                        ← माध्यम वा नम्बर सच्याउनुहोस्
                      </button>
                    </div>
                  </form>
                )
              ) : (
                // B. PASSWORD LOGIN FLOW
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1 text-xs">
                      मोबाइल नम्बर वा प्रयोगकर्ता नाम *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="९८xxxxxxxx / ९७xxxxxxxx / superadmin"
                        value={loginPhoneOrEmail}
                        onChange={(e) => setLoginPhoneOrEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1 text-xs">
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
                        className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 cursor-pointer"
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
                    <span>{isLoading ? 'लगइन हुँदैछ...' : 'पासवर्ड मार्फत लगइन गर्नुहोस्'}</span>
                  </button>
                </form>
              )}

              {/* Bottom Registration Link */}
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
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              VIEW 2: UNIFIED MEMBERSHIP SIGNUP (SINGLE OTP DELIVERY & SINGLE SHARED BOX)
              ───────────────────────────────────────────────────────────── */}
          {(mode === 'signup_3fields' || mode === 'dual_otp') && (
            <div className="space-y-4 animate-in fade-in">
              {!isSignupOtpSent ? (
                <form onSubmit={handleSendSignupOTP} className="space-y-3.5">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-900 dark:text-amber-200">
                    <span className="font-bold block">पहिलो चरण: व्यक्तिगत विवरण र प्रमाणीकरण</span>
                    <span className="text-[11px] text-stone-600 dark:text-stone-400">
                      आफ्नो रोजेको माध्यममा ६ अङ्कको गोप्य OTP सुरक्षा कोड प्राप्त गर्नुहोस्।
                    </span>
                  </div>

                  {/* Field 1: Full Name */}
                  <div>
                    <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1 text-xs">
                      १. पूरा नाम (Full Name) *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="उदा: पं. सुवास शर्मा"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Field 2: Delivery Channel Selection */}
                  <div>
                    <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1.5 text-xs">
                      २. OTP प्राप्त गर्ने माध्यम छनोट गर्नुहोस्:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setSignupChannel('sms')}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          signupChannel === 'sms'
                            ? 'border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-200 font-bold ring-2 ring-amber-500/30'
                            : 'border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-amber-400'
                        }`}
                      >
                        <Smartphone className="w-4 h-4 text-amber-600" />
                        <span className="text-[11px]">📱 SMS</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignupChannel('firebase')}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          signupChannel === 'firebase'
                            ? 'border-orange-500 bg-orange-500/15 text-orange-900 dark:text-orange-200 font-bold ring-2 ring-orange-500/30'
                            : 'border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-orange-400'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4 text-orange-600" />
                        <span className="text-[11px]">🔥 Firebase</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignupChannel('whatsapp')}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          signupChannel === 'whatsapp'
                            ? 'border-emerald-500 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/30'
                            : 'border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-emerald-400'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        <span className="text-[11px]">💬 WhatsApp</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignupChannel('email')}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          signupChannel === 'email'
                            ? 'border-blue-500 bg-blue-500/15 text-blue-900 dark:text-blue-200 font-bold ring-2 ring-blue-500/30'
                            : 'border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:border-blue-400'
                        }`}
                      >
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span className="text-[11px]">✉️ Email</span>
                      </button>
                    </div>
                  </div>

                  {/* Field 3: Mobile or Email Destination */}
                  <div>
                    <label className="block text-stone-700 dark:text-stone-300 font-bold mb-1 text-xs">
                      ३. {signupChannel === 'email' ? 'इमेल ठेगाना *' : 'मोबाइल नम्बर *'}
                    </label>
                    <div className="relative">
                      {signupChannel === 'email' ? (
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      ) : (
                        <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      )}
                      <input
                        type={signupChannel === 'email' ? 'email' : 'tel'}
                        required
                        placeholder={
                          signupChannel === 'email'
                            ? 'example@gmail.com'
                            : '९८xxxxxxxx / ९७xxxxxxxx'
                        }
                        value={signupDestination}
                        onChange={(e) => setSignupDestination(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-stone-500 mt-1 block">
                      {signupChannel === 'sms' && 'नेपाली मोबाइल नम्बरमा ६ अङ्कको SMS सुरक्षा कोड पठाइनेछ।'}
                      {signupChannel === 'firebase' && 'Google Firebase Phone Auth मार्फत तपाईंको मोबाइलमा आधिकारिक SMS कोड पठाइनेछ।'}
                      {signupChannel === 'whatsapp' && 'WhatsApp नम्बरमा ६ अङ्कको आधिकारिक सुरक्षा कोड पठाइनेछ।'}
                      {signupChannel === 'email' && 'इमेल ठेगानामा ६ अङ्कको प्रमाणीकरण कोड पठाइनेछ।'}
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-60"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-200" />
                    <span>{isLoading ? 'OTP कोड पठाइँदैछ...' : 'सुरक्षा कोड (OTP) प्राप्त गर्नुहोस् →'}</span>
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
              ) : (
                // Step 2: Single Shared OTP Verification Box for Signup
                <form onSubmit={handleVerifySignupOTP} className="space-y-4">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>OTP कोड सफलतापूर्वक पठाइयो</span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed font-mono">
                      <strong>{signupMaskedDestination}</strong> मा {signupChannel === 'whatsapp' ? 'WhatsApp (ह्वाट्सएप)' : signupChannel === 'sms' ? 'मोबाइल SMS' : 'इमेल (Email)'} मार्फत ६ अङ्कको गोप्य कोड पठाइएको छ।
                    </p>
                  </div>

                  <div>
                    <label className="block text-center text-stone-700 dark:text-stone-300 font-bold mb-2 text-xs">
                      प्राप्त ६ अङ्कको OTP कोड प्रविष्ट गर्नुहोस्:
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      autoFocus
                      required
                      placeholder="• • • • • •"
                      value={signupOtpCode}
                      onChange={(e) => setSignupOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full text-center tracking-[0.6em] text-2xl font-mono py-3 font-black bg-white dark:bg-stone-900 border-2 border-amber-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || signupOtpCode.length < 6}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{isLoading ? 'प्रमाणीकरण हुँदैछ...' : 'प्रमाणीकरण गरी अघि बढ्नुहोस् →'}</span>
                  </button>

                  {/* Timer and Resend Controls */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-200 dark:border-stone-800">
                    <span className="text-stone-500 text-[11px]">
                      {canResend ? (
                        'कोड प्राप्त भएन?'
                      ) : (
                        <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-mono font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>पुनः पठाउन बाँकी: {resendCooldown} सेकेन्ड</span>
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      disabled={!canResend || isLoading}
                      onClick={handleResendSignupOTP}
                      className={`flex items-center gap-1 font-bold text-[11px] ${
                        canResend
                          ? 'text-amber-700 dark:text-amber-400 hover:underline cursor-pointer'
                          : 'text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>पुनः कोड पठाउनुहोस्</span>
                    </button>
                  </div>

                  {/* Change Destination / Channel */}
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignupOtpSent(false);
                        setSignupOtpCode('');
                        setErrorMsg(null);
                      }}
                      className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xs hover:underline cursor-pointer"
                    >
                      ← विवरण वा माध्यम सच्याउनुहोस्
                    </button>
                  </div>
                </form>
              )}
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
