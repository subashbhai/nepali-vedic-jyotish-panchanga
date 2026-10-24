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
  Smartphone,
  MessageSquare,
  KeyRound
} from 'lucide-react';
import {
  saveMobileUserSession,
  MobileUserProfile
} from '../db/mobileAuthStore';
import { authenticateUnifiedUser } from '../../db/unifiedSecurityBridge';
import { authService, OTPChannel } from '../../services/authService';

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
  const [activeTab, setActiveTab] = useState<'otp' | 'password' | 'register'>('otp');
  const [fullName, setFullName] = useState('');
  const [channel, setChannel] = useState<OTPChannel>('sms');
  const [destination, setDestination] = useState('');
  const [password, setPassword] = useState('');
  const [sharedOtpCode, setSharedOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [maskedRecipient, setMaskedRecipient] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 60-Second Cooldown Timer
  useEffect(() => {
    let timer: any;
    if (isOtpSent && resendCooldown > 0) {
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
  }, [isOtpSent, resendCooldown]);

  if (!isOpen) return null;

  // 1. Send OTP to selected channel (SMS, WhatsApp, Email)
  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanDest = destination.trim();
    if (!cleanDest) {
      setErrorMsg(channel === 'email' ? 'कृपया इमेल ठेगाना लेख्नुहोस्।' : 'कृपया मोबाइल नम्बर लेख्नुहोस्।');
      return;
    }

    if (channel === 'email') {
      if (!cleanDest.includes('@') || !cleanDest.includes('.')) {
        setErrorMsg('कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्।');
        return;
      }
    } else {
      const digits = cleanDest.replace(/\D/g, '');
      if (digits.length < 9) {
        setErrorMsg('कृपया ९ वा १० अङ्कको मान्य मोबाइल नम्बर लेख्नुहोस्।');
        return;
      }
    }

    setIsLoading(true);
    try {
      const purpose = activeTab === 'register' ? 'signup' : 'login';
      const res = await authService.sendOTP(channel, cleanDest, fullName.trim() || undefined, purpose);
      setIsLoading(false);

      if (res.success && res.challengeId) {
        setChallengeId(res.challengeId);
        setIsOtpSent(true);
        setMaskedRecipient(res.maskedDestination || cleanDest);
        setSharedOtpCode('');
        setResendCooldown(60);
        setCanResend(false);
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('सुरक्षा कोड पठाउँदा समस्या आयो।');
    }
  };

  // 2. Verify Single Shared OTP Box
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeId) return;

    const cleanCode = sharedOtpCode.trim().replace(/\D/g, '');
    if (cleanCode.length < 6) {
      setErrorMsg('कृपया ६ अङ्कको सुरक्षा कोड पूरा लेख्नुहोस्।');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await authService.verifySingleOTP(challengeId, cleanCode);
      setIsLoading(false);

      if (res.success && res.session) {
        const cleanMob = channel === 'email' ? (res.session.phone || '९८xxxxxxxx') : destination.trim();
        const cleanMail = channel === 'email' ? destination.trim() : ((res.session as any).email || `${cleanMob}@balanandajyotish.com.np`);
        const displayName = fullName.trim() || res.session.fullName || 'वैदिक साधक';

        const newUser: MobileUserProfile = {
          id: res.session.userId || `usr_${Date.now()}`,
          fullName: displayName,
          email: cleanMail,
          phone: cleanMob,
          isPhoneVerified: channel !== 'email',
          isEmailVerified: channel === 'email',
          role: (res.session.role as any) || 'USER',
          createdAtISO: new Date().toISOString()
        };

        saveMobileUserSession(newUser);
        setSuccessMsg('प्रमाणीकरण सफल भयो! स्वागत छ।');
        setTimeout(() => {
          onSuccess(newUser);
          onClose();
        }, 500);
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('सुरक्षा कोड प्रमाणित गर्न सकिएन।');
    }
  };

  // 3. Resend OTP
  const handleResendOTP = async () => {
    if (!challengeId || !canResend) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await authService.resendSingleOTP(challengeId);
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

  // 4. Standard Password Login
  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!destination.trim()) {
      setErrorMsg('कृपया फोन नम्बर वा प्रयोगकर्ता नाम प्रविष्ट गर्नुहोस्');
      return;
    }
    if (!password) {
      setErrorMsg('कृपया पासवर्ड प्रविष्ट गर्नुहोस्');
      return;
    }

    const res = authenticateUnifiedUser(destination.trim(), password);
    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    const cleanMob = res.clientPolicy?.mobile || res.user?.phone || destination.trim();
    const displayName = res.clientPolicy?.fullName || res.user?.fullName || 'वैदिक साधक';

    const loggedUser: MobileUserProfile = {
      id: res.user?.id || res.clientPolicy?.id || `usr_${Date.now()}`,
      fullName: displayName,
      email: destination.includes('@') ? destination.trim() : `${cleanMob}@balanandajyotish.com.np`,
      phone: cleanMob,
      isPhoneVerified: true,
      isEmailVerified: true,
      role: 'USER',
      createdAtISO: new Date().toISOString()
    };

    saveMobileUserSession(loggedUser);
    onSuccess(loggedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-amber-500/40 rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl relative">
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
            {activeTab === 'register' ? 'नयाँ सदस्यता दर्ता' : 'बालानन्द वैदिक ज्योतिष सेवा'}
          </h3>
          <p className="text-[11px] text-stone-400">
            {isOtpSent ? '६ अङ्कको सुरक्षा कोड प्रमाणीकरण' : 'नेपाली वैदिक ज्योतिष तथा व्यक्तिगत सेवा'}
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

        {/* ── VIEW: SINGLE SHARED OTP VERIFICATION BOX ── */}
        {isOtpSent ? (
          <form onSubmit={handleVerifyOTP} className="space-y-3.5 text-xs">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                सुरक्षा कोड पठाइयो
              </span>
              <p className="text-[11px] text-stone-300 leading-relaxed font-mono">
                <strong>{maskedRecipient}</strong> मा {channel === 'whatsapp' ? 'WhatsApp (ह्वाट्सएप)' : channel === 'sms' ? 'SMS' : 'Email'} मार्फत ६ अङ्कको OTP कोड पठाइएको छ।
              </p>
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
                value={sharedOtpCode}
                onChange={(e) => setSharedOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="• • • • • •"
                className="w-full bg-stone-950 border-2 border-amber-500 rounded-2xl p-3 text-center text-2xl font-mono font-black tracking-[0.5em] text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || sharedOtpCode.length < 6}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-stone-950 font-black rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'प्रमाणीकरण हुँदैछ...' : 'प्रमाणीकरण गरी प्रवेश गर्नुहोस्'}
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
                onClick={handleResendOTP}
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
                  setIsOtpSent(false);
                  setSharedOtpCode('');
                  setErrorMsg('');
                }}
                className="text-stone-400 hover:text-stone-200 text-[11px] hover:underline cursor-pointer"
              >
                ← माध्यम वा नम्बर सच्याउनुहोस्
              </button>
            </div>
          </form>
        ) : (
          /* ── VIEW: TAB SELECTION (OTP / PASSWORD / REGISTER) ── */
          <div className="space-y-3.5 text-xs">
            {/* Top Method Tabs */}
            <div className="flex bg-stone-950 p-1 rounded-xl text-xs font-bold border border-stone-800">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('otp');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                  activeTab === 'otp'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                OTP लगइन
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('password');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                  activeTab === 'password'
                    ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                पासवर्ड
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
                नयाँ दर्ता
              </button>
            </div>

            {/* TAB 1 & TAB 3: OTP DELIVERY FORM (LOGIN OR REGISTRATION) */}
            {(activeTab === 'otp' || activeTab === 'register') && (
              <form onSubmit={handleSendOTP} className="space-y-3">
                {activeTab === 'register' && (
                  <div>
                    <label className="block text-stone-400 mb-1 font-bold">पूरा नाम (Full Name):</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="उदा: सुवास शर्मा"
                        className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl p-2.5 text-stone-100 pl-9"
                      />
                    </div>
                  </div>
                )}

                {/* Delivery Channel Selector */}
                <div>
                  <label className="block text-stone-400 mb-1.5 font-bold">OTP प्राप्त गर्ने माध्यम:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setChannel('sms')}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        channel === 'sms'
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-black ring-1 ring-amber-500'
                          : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[10px]">📱 SMS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel('whatsapp')}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        channel === 'whatsapp'
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-black ring-1 ring-emerald-500'
                          : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px]">💬 WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel('email')}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        channel === 'email'
                          ? 'border-blue-500 bg-blue-500/20 text-blue-300 font-black ring-1 ring-blue-500'
                          : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-[10px]">✉️ Email</span>
                    </button>
                  </div>
                </div>

                {/* Destination Input */}
                <div>
                  <label className="block text-stone-400 mb-1 font-bold">
                    {channel === 'email' ? 'इमेल ठेगाना:' : 'मोबाइल नम्बर:'}
                  </label>
                  <div className="relative">
                    {channel === 'email' ? (
                      <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                    ) : (
                      <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                    )}
                    <input
                      type={channel === 'email' ? 'email' : 'tel'}
                      required
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder={channel === 'email' ? 'yourname@gmail.com' : '९८xxxxxxxx / ९७xxxxxxxx'}
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl p-2.5 text-stone-100 pl-9 font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-stone-500 mt-1 block">
                    {channel === 'sms' && '६ अङ्कको गोप्य SMS सुरक्षा कोड पठाइनेछ।'}
                    {channel === 'whatsapp' && '६ अङ्कको आधिकारिक WhatsApp सुरक्षा कोड पठाइनेछ।'}
                    {channel === 'email' && '६ अङ्कको इमेल प्रमाणीकरण कोड पठाइनेछ।'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isLoading ? 'कोड पठाइँदैछ...' : 'OTP सुरक्षा कोड प्राप्त गर्नुहोस् →'}</span>
                </button>
              </form>
            )}

            {/* TAB 2: PASSWORD LOGIN */}
            {activeTab === 'password' && (
              <form onSubmit={handleStandardLogin} className="space-y-3">
                <div>
                  <label className="block text-stone-400 mb-1 font-bold">मोबाइल वा प्रयोगकर्ता नाम:</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="९८xxxxxxxx / superadmin"
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl p-2.5 text-stone-100 pl-9"
                    />
                    <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-bold">पासवर्ड:</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-stone-950 border border-stone-800 focus:border-amber-500 rounded-xl p-2.5 text-stone-100 pl-9"
                    />
                    <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>लगइन गर्नुहोस्</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
