import React, { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Clock,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  saveMobileUserSession,
  MobileUserProfile
} from '../db/mobileAuthStore';
import { authenticateUnifiedUser } from '../../db/unifiedSecurityBridge';
import { authService } from '../../services/authService';

interface MobileAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: MobileUserProfile) => void;
}

export const MobileAuthModal: React.FC<MobileAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  // Only two clean tabs: 'login' (Direct Mobile/Username + Password) & 'register' (3-step Signup)
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login State (Direct Mobile No / Username + Password - NO OTP login tab)
  const [loginPhoneOrUser, setLoginPhoneOrUser] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Registration Flow State (Strict 3-step: Info -> OTP -> Username/Password)
  const [signupStep, setSignupStep] = useState<'initial' | 'otp_verify' | 'credentials'>('initial');
  const [signupFullName, setSignupFullName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupOtpCode, setSignupOtpCode] = useState('');
  const [signupChallengeId, setSignupChallengeId] = useState<string | null>(null);
  const [signupMaskedDestination, setSignupMaskedDestination] = useState('');
  const [signupDevOtpHint, setSignupDevOtpHint] = useState<string | null>(null);

  // Registration Credentials (Step 3: Arko Form)
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  // General States
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setSignupStep('initial');
      setSignupOtpCode('');
      setSignupChallengeId(null);
      setSignupDevOtpHint(null);
    }
  }, [isOpen]);

  // 60-Second Cooldown Timer for OTP resend
  useEffect(() => {
    let timer: any;
    const isWaiting = signupStep === 'otp_verify';
    if (isWaiting && resendCooldown > 0) {
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
  }, [signupStep, resendCooldown]);

  if (!isOpen) return null;

  // ──────────────────────────────────────────────────────────
  // 1. DIRECT MOBILE NO + PASSWORD LOGIN (NO OTP TAB)
  // ──────────────────────────────────────────────────────────
  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanInput = loginPhoneOrUser.trim();
    if (!cleanInput) {
      setErrorMsg('कृपया मोबाइल नम्बर वा प्रयोगकर्ता नाम प्रविष्ट गर्नुहोस्।');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('कृपया पासवर्ड प्रविष्ट गर्नुहोस्।');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.login(cleanInput, loginPassword);
      setIsLoading(false);

      if (!res.success) {
        setErrorMsg(res.message);
        return;
      }

      const cleanMob = res.session?.phone || cleanInput;
      const displayName = res.session?.fullName || 'वैदिक साधक';

      const loggedUser: MobileUserProfile = {
        id: res.session?.userId || `usr_${Date.now()}`,
        fullName: displayName,
        email: cleanInput.includes('@') ? cleanInput : `${cleanMob}@balanandajyotish.com.np`,
        phone: cleanMob,
        isPhoneVerified: true,
        isEmailVerified: true,
        role: (res.session?.role as any) || 'USER',
        createdAtISO: new Date().toISOString()
      };

      saveMobileUserSession(loggedUser);
      setSuccessMsg('लगइन सफल भयो! स्वागत छ।');
      setTimeout(() => {
        onSuccess(loggedUser);
        onClose();
      }, 500);
    } catch {
      setIsLoading(false);
      // Fallback to local security bridge
      const localRes = authenticateUnifiedUser(cleanInput, loginPassword);
      if (localRes.success) {
        const cleanMob = localRes.clientPolicy?.mobile || localRes.user?.phone || cleanInput;
        const displayName = localRes.clientPolicy?.fullName || localRes.user?.fullName || 'वैदिक साधक';
        const loggedUser: MobileUserProfile = {
          id: localRes.user?.id || localRes.clientPolicy?.id || `usr_${Date.now()}`,
          fullName: displayName,
          email: cleanInput.includes('@') ? cleanInput : `${cleanMob}@balanandajyotish.com.np`,
          phone: cleanMob,
          isPhoneVerified: true,
          isEmailVerified: true,
          role: 'USER',
          createdAtISO: new Date().toISOString()
        };
        saveMobileUserSession(loggedUser);
        onSuccess(loggedUser);
        onClose();
      } else {
        setErrorMsg(localRes.message || 'लगइन असफल भयो। मोबाइल नम्बर वा पासवर्ड मिलेन।');
      }
    }
  };

  // ──────────────────────────────────────────────────────────
  // 2. REGISTRATION STEP 1: Send OTP for Mobile + Email
  // ──────────────────────────────────────────────────────────
  const handleSendSignupOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanName = signupFullName.trim();
    const cleanPhone = signupPhone.trim().replace(/\D/g, '');
    const cleanEmail = signupEmail.trim();

    if (!cleanName) {
      setErrorMsg('कृपया पूरा नाम लेख्नुहोस्।');
      return;
    }

    if (cleanPhone.length < 9) {
      setErrorMsg('कृपया ९ वा १० अङ्कको मान्य मोबाइल नम्बर लेख्नुहोस्।');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्।');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.sendOTP('sms', cleanPhone, cleanName, 'signup');
      setIsLoading(false);

      if (res.success && res.challengeId) {
        setSignupChallengeId(res.challengeId);
        setSignupMaskedDestination(res.maskedDestination || cleanPhone);
        if (res.code) {
          setSignupDevOtpHint(res.code);
        }
        setSignupOtpCode('');
        setResendCooldown(60);
        setCanResend(false);
        setSignupStep('otp_verify');
        setSuccessMsg(res.message || 'सुरक्षा कोड पठाइयो!');
      } else {
        setErrorMsg(res.message || 'सुरक्षा कोड पठाउन सकिएन।');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('सुरक्षा कोड पठाउँदा समस्या आयो। पुनः प्रयास गर्नुहोस्।');
    }
  };

  // ──────────────────────────────────────────────────────────
  // 3. REGISTRATION STEP 2: Verify OTP
  // ──────────────────────────────────────────────────────────
  const handleVerifySignupOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupChallengeId) return;

    const cleanCode = signupOtpCode.trim().replace(/\D/g, '');
    if (cleanCode.length < 6) {
      setErrorMsg('कृपया ६ अङ्कको सुरक्षा कोड पूरा लेख्नुहोस्।');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await authService.verifySingleOTP(signupChallengeId, cleanCode);
      setIsLoading(false);

      if (res.success) {
        // Automatically suggest initial username
        const cleanNamePart = signupFullName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const phonePart = signupPhone.replace(/\D/g, '').slice(-4);
        setSignupUsername(cleanNamePart ? `${cleanNamePart}${phonePart}` : `user${phonePart}`);

        setSignupStep('credentials');
        setSuccessMsg('OTP प्रमाणीकरण सफल भयो! अब आफ्नो पासवर्ड निर्धारण गर्नुहोस्।');
      } else {
        setErrorMsg(res.message || 'सुरक्षा कोड मिलेन। कृपया जाँच गरी पुनः लेख्नुहोस्।');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('सुरक्षा कोड प्रमाणीकरण गर्दा समस्या आयो।');
    }
  };

  // ──────────────────────────────────────────────────────────
  // 4. REGISTRATION STEP 3: Finalize Account with Username & Password
  // ──────────────────────────────────────────────────────────
  const handleFinalizeSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanUser = signupUsername.trim() || signupPhone.trim().replace(/\D/g, '').slice(-10);
    if (cleanUser.length < 3) {
      setErrorMsg('प्रयोगकर्ता नाम कम्तिमा ३ अक्षरको हुनुपर्छ।');
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMsg('पासवर्ड कम्तिमा ६ अक्षरको हुनुपर्छ।');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg('दुवै पासवर्ड एकआपसमा मिलेनन्। कृपया पुनः जाँच गर्नुहोस्।');
      return;
    }

    setIsLoading(true);
    try {
      const regRes = await authService.registerWithCredentials({
        fullName: signupFullName.trim(),
        phone: signupPhone.trim(),
        email: signupEmail.trim(),
        username: cleanUser,
        password: signupPassword
      });
      setIsLoading(false);

      if (regRes.success) {
        const newUser: MobileUserProfile = {
          id: regRes.session?.userId || `usr_${Date.now()}`,
          fullName: signupFullName.trim(),
          email: signupEmail.trim(),
          phone: signupPhone.trim(),
          isPhoneVerified: true,
          isEmailVerified: true,
          role: 'USER',
          createdAtISO: new Date().toISOString()
        };

        saveMobileUserSession(newUser);
        setSuccessMsg('खाता सफलतापूर्वक दर्ता भयो! तपाईं मोबाइल नम्बर र पासवर्डबाट पनि लगइन गर्न सक्नुहुन्छ।');
        setTimeout(() => {
          onSuccess(newUser);
          onClose();
        }, 600);
      } else {
        setErrorMsg(regRes.message || 'दर्ता पूरा गर्न सकिएन।');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('खाता दर्ता गर्दा समस्या आयो। कृपया पुनः प्रयास गर्नुहोस्।');
    }
  };

  // ──────────────────────────────────────────────────────────
  // 5. REGISTRATION RESEND OTP
  // ──────────────────────────────────────────────────────────
  const handleResendSignupOTP = async () => {
    if (!signupChallengeId || !canResend) return;
    setIsLoading(true);
    setErrorMsg('');
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
      setErrorMsg('नयाँ कोड पठाउन सकिएन।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-amber-500/40 rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-stone-400 hover:text-white cursor-pointer"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto text-xl font-black">
            ॐ
          </div>
          <h3 className="font-bold text-base text-stone-100 font-serif">
            {activeTab === 'register' ? 'नयाँ सदस्यता दर्ता' : 'प्रयोगकर्ता लगइन'}
          </h3>
          <p className="text-[11px] text-stone-400">
            {activeTab === 'register' && signupStep === 'initial' && 'नाम, मोबाइल र इमेल भरेर अगाडि बढ्नुहोस्'}
            {activeTab === 'register' && signupStep === 'otp_verify' && '६ अङ्कको सुरक्षा कोड प्रमाणीकरण'}
            {activeTab === 'register' && signupStep === 'credentials' && 'आफ्नो पासवर्ड निर्धारण गर्नुहोस्'}
            {activeTab === 'login' && 'मोबाइल नम्बर वा प्रयोगकर्ता नाम र पासवर्ड राख्नुहोस्'}
          </p>
        </div>

        {/* Status Messages */}
        {errorMsg && (
          <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── TOP SWITCHER TABS (ONLY LOGIN & REGISTER - NO OTP LOGIN TAB) ── */}
        <div className="flex bg-stone-950 p-1 rounded-xl text-xs font-bold border border-stone-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            लगइन गर्नुहोस्
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            नयाँ दर्ता (Sign Up)
          </button>
        </div>

        {/* ═════════════════════════════════════════════════════════ */}
        {/* VIEW 1: DIRECT LOGIN (MOBILE NO / USERNAME + PASSWORD)     */}
        {/* ═════════════════════════════════════════════════════════ */}
        {activeTab === 'login' && (
          <form onSubmit={handleDirectLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-stone-300 mb-1 font-bold">
                मोबाइल नम्बर वा प्रयोगकर्ता नाम:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  value={loginPhoneOrUser}
                  onChange={(e) => setLoginPhoneOrUser(e.target.value)}
                  placeholder="९८xxxxxxxx / ९७xxxxxxxx / username"
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl p-2.5 text-stone-100 pl-9"
                />
                <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-stone-300 mb-1 font-bold">पासवर्ड:</label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl p-2.5 text-stone-100 pl-9 pr-9"
                />
                <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-3 text-stone-500 hover:text-stone-300 cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{isLoading ? 'जाँच हुँदैछ...' : 'लगइन गर्नुहोस्'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-1 border-t border-stone-800">
              <span className="text-[11px] text-stone-400">
                खाता छैन?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-amber-400 hover:underline font-bold cursor-pointer"
                >
                  यहाँ दर्ता गर्नुहोस्
                </button>
              </span>
            </div>
          </form>
        )}

        {/* ═════════════════════════════════════════════════════════ */}
        {/* VIEW 2: REGISTRATION FLOW (3-STEP STRICT WORKFLOW)         */}
        {/* ═════════════════════════════════════════════════════════ */}
        {activeTab === 'register' && (
          <div className="space-y-3.5 text-xs">
            {/* Step Indicators */}
            <div className="flex items-center justify-between text-[10px] text-stone-400 px-1">
              <span className={`flex items-center gap-1 ${signupStep === 'initial' ? 'text-amber-400 font-bold' : 'text-stone-500'}`}>
                १. विवरण
              </span>
              <span className="text-stone-700">──</span>
              <span className={`flex items-center gap-1 ${signupStep === 'otp_verify' ? 'text-amber-400 font-bold' : 'text-stone-500'}`}>
                २. OTP
              </span>
              <span className="text-stone-700">──</span>
              <span className={`flex items-center gap-1 ${signupStep === 'credentials' ? 'text-amber-400 font-bold' : 'text-stone-500'}`}>
                ३. पासवर्ड
              </span>
            </div>

            {/* STEP 1: INITIAL SIGNUP FORM (ONLY Full Name, Mobile No, Email Address - NO CHANNEL BLOCKS!) */}
            {signupStep === 'initial' && (
              <form onSubmit={handleSendSignupOTP} className="space-y-3">
                {/* Field 1: Full Name */}
                <div>
                  <label className="block text-stone-300 mb-1 font-bold">पूरा नाम (Full Name):</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      placeholder="उदा: सुवास शर्मा"
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl p-2.5 text-stone-100 pl-9"
                    />
                  </div>
                </div>

                {/* Field 2: Mobile No */}
                <div>
                  <label className="block text-stone-300 mb-1 font-bold">मोबाइल नम्बर (Mobile No):</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="९८xxxxxxxx / ९७xxxxxxxx"
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl p-2.5 text-stone-100 pl-9 font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 mt-0.5 block">
                    यस मोबाइल नम्बरमा ६ अङ्कको OTP सुरक्षा कोड पठाइनेछ।
                  </span>
                </div>

                {/* Field 3: Email Address */}
                <div>
                  <label className="block text-stone-300 mb-1 font-bold">इमेल ठेगाना (Email Address):</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl p-2.5 text-stone-100 pl-9 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isLoading ? 'कोड पठाइँदैछ...' : 'सुरक्षा कोड (OTP) प्राप्त गर्नुहोस् →'}</span>
                </button>
              </form>
            )}

            {/* STEP 2: OTP VERIFICATION */}
            {signupStep === 'otp_verify' && (
              <form onSubmit={handleVerifySignupOTP} className="space-y-3">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs space-y-1">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    सुरक्षा कोड पठाइयो
                  </span>
                  <p className="text-[11px] text-stone-300 leading-relaxed font-mono">
                    <strong>{signupMaskedDestination}</strong> मा ६ अङ्कको OTP सुरक्षा कोड पठाइएको छ।
                  </p>
                  {signupDevOtpHint && (
                    <p className="text-[11px] text-amber-400 font-mono font-bold pt-0.5">
                      परीक्षण कोड (OTP Hint): {signupDevOtpHint}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-center text-stone-300 font-bold mb-1.5 text-xs">
                    ६ अङ्कको OTP सुरक्षा कोड लेख्नुहोस्:
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    required
                    value={signupOtpCode}
                    onChange={(e) => setSignupOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="• • • • • •"
                    className="w-full bg-stone-950 border-2 border-amber-500 rounded-2xl p-3 text-center text-2xl font-mono font-black tracking-[0.5em] text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || signupOtpCode.length < 6}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-stone-950 font-black rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'प्रमाणीकरण हुँदैछ...' : 'कोड प्रमाणित गरी अर्को फारम खोल्नुहोस् →'}
                </button>

                {/* Timer and Resend */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-800">
                  <span className="text-stone-400">
                    {canResend ? (
                      'कोड आएन?'
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>पुनः पठाउन बाँकी: {resendCooldown} से.</span>
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    disabled={!canResend || isLoading}
                    onClick={handleResendSignupOTP}
                    className={`flex items-center gap-1 font-bold ${canResend ? 'text-amber-400 hover:underline cursor-pointer' : 'text-stone-600 cursor-not-allowed'}`}
                  >
                    <RotateCcw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>पुनः पठाउनुहोस्</span>
                  </button>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSignupStep('initial');
                      setSignupOtpCode('');
                      setErrorMsg('');
                    }}
                    className="text-stone-400 hover:text-stone-200 text-[11px] hover:underline cursor-pointer"
                  >
                    ← मोबाइल वा इमेल सच्याउनुहोस्
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: ARKO FORM (USERNAME & PASSWORD CREATION) */}
            {signupStep === 'credentials' && (
              <form onSubmit={handleFinalizeSignup} className="space-y-3">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs space-y-1">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    प्रयोगकर्ता नाम र पासवर्ड निर्धारण
                  </span>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    OTP प्रमाणीकरण सफल भयो। अब भविष्यमा सिधै मोबाइल नम्बर र यस पासवर्डबाट लगइन गर्न पासवर्ड सुरक्षित राख्नुहोस्:
                  </p>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-stone-300 mb-1 font-bold">प्रयोगकर्ता नाम (Username):</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="उदा: subash123"
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl p-2.5 text-stone-100 pl-9 font-mono"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-stone-300 mb-1 font-bold">नयाँ पासवर्ड (Password):</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="न्यूनतम ६ अक्षर वा अङ्क"
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl p-2.5 text-stone-100 pl-9 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-3 text-stone-500 hover:text-stone-300 cursor-pointer"
                    >
                      {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-stone-300 mb-1 font-bold">पासवर्ड पुष्टि (Confirm Password):</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                    <input
                      type={showSignupConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="माथिको पासवर्ड पुनः लेख्नुहोस्"
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl p-2.5 text-stone-100 pl-9 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                      className="absolute right-3 top-3 text-stone-500 hover:text-stone-300 cursor-pointer"
                    >
                      {showSignupConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !signupUsername || !signupPassword}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-stone-950 font-black rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isLoading ? 'डाटा सुरक्षित गरिँदैछ...' : 'दर्ता सम्पन्न गरी प्रवेश गर्नुहोस् ✓'}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
