import React, { useState } from 'react';
import {
  Phone,
  Mail,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import {
  generateMobileOTP,
  verifyMobileOTP,
  saveMobileUserSession,
  MobileUserProfile
} from '../db/mobileAuthStore';
import { authenticateUnifiedUser } from '../../db/unifiedSecurityBridge';

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
  const [mode, setMode] = useState<'login' | 'register' | 'otp' | 'forgot'>('login');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [activeOtpSession, setActiveOtpSession] = useState<{ code: string; expiresAt: number } | null>(null);

  if (!isOpen) return null;

  const handleSendOTP = (targetPhone: string) => {
    if (!targetPhone || targetPhone.length < 9) {
      setErrorMsg('कृपया ९ वा १० अङ्कको वैध मोबाइल नम्बर लेख्नुहोस्');
      return;
    }
    const session = generateMobileOTP(targetPhone, 'phone');
    setActiveOtpSession(session);
    setInfoMsg(`सुरक्षा कोड (OTP): ${session.code} तपाईंको फोनमा पठाइयो। (परीक्षणको लागि यो कोड राख्नुहोस्)`);
    setMode('otp');
    setErrorMsg('');
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    const res = verifyMobileOTP(otpCode);
    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    const newUser: MobileUserProfile = {
      id: `usr_${Date.now()}`,
      fullName: fullName.trim() || 'वैदिक साधक',
      email: email.trim() || 'user@balanandajyotish.com.np',
      phone: phone.trim() || '९७६४४००५३३',
      isPhoneVerified: true,
      isEmailVerified: true,
      role: 'USER',
      createdAtISO: new Date().toISOString()
    };

    saveMobileUserSession(newUser);
    onSuccess(newUser);
    onClose();
  };

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrorMsg('कृपया फोन नम्बर वा प्रयोगकर्ता नाम प्रविष्ट गर्नुहोस्');
      return;
    }
    if (!password) {
      setErrorMsg('कृपया पासवर्ड प्रविष्ट गर्नुहोस्');
      return;
    }

    const res = authenticateUnifiedUser(phone, password);
    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    const cleanMob = res.clientPolicy?.mobile || res.user?.phone || phone;
    const displayName = res.clientPolicy?.fullName || res.user?.fullName || 'वैदिक साधक';

    const loggedUser: MobileUserProfile = {
      id: res.user?.id || res.clientPolicy?.id || `usr_${Date.now()}`,
      fullName: displayName,
      email: phone.includes('@') ? phone : `${cleanMob}@balanandajyotish.com.np`,
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
          className="absolute top-4 right-4 p-1 text-stone-400 hover:text-white"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto text-xl font-black">
            ॐ
          </div>
          <h3 className="font-bold text-base text-stone-100 font-serif">
            {mode === 'login' ? 'बालानन्द ज्योतिष सेवा - लगइन' :
             mode === 'register' ? 'नयाँ खाता सिर्जना गर्नुहोस्' :
             mode === 'otp' ? 'OTP कोड प्रमाणीकरण' : 'पासवर्ड पुनःप्राप्ति'}
          </h3>
          <p className="text-[11px] text-stone-400">
            नेपाली वैदिक ज्योतिष तथा व्यक्तिगत ज्योतिष सेवा
          </p>
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-200 text-xs">
            {infoMsg}
          </div>
        )}

        {/* Mode 1: Login */}
        {mode === 'login' && (
          <form onSubmit={handleStandardLogin} className="space-y-3 text-xs">
            <div>
              <label className="block text-stone-400 mb-1 font-bold">मोबाइल नम्बर वा ईमेल:</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="९८XXXXXXXX वा email@example.com"
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

            <div className="pt-2 border-t border-stone-800 text-center space-y-1.5">
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-amber-400 text-[11px] font-bold hover:underline cursor-pointer block w-full"
              >
                खाता छैन? नयाँ दर्ता (Register) गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-stone-400 text-[10px] hover:text-stone-300 cursor-pointer block w-full"
              >
                पासवर्ड बिर्सनुभयो?
              </button>
            </div>
          </form>
        )}

        {/* Mode 2: Register */}
        {mode === 'register' && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-stone-400 mb-1 font-bold">पूरा नाम (Full Name):</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="उदा: सुवास शर्मा"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100"
              />
            </div>

            <div>
              <label className="block text-stone-400 mb-1 font-bold">मोबाइल नम्बर (OTP का लागि):</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="९८XXXXXXXX"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100 font-mono"
              />
            </div>

            <button
              type="button"
              onClick={() => handleSendOTP(phone)}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              सुरक्षा कोड (OTP) पठाउनुहोस्
            </button>

            <div className="pt-2 border-t border-stone-800 text-center">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-amber-400 text-[11px] font-bold hover:underline cursor-pointer"
              >
                पहिले नै खाता छ? लगइन गर्नुहोस्
              </button>
            </div>
          </div>
        )}

        {/* Mode 3: OTP Verification */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-3 text-xs">
            <div>
              <label className="block text-stone-400 mb-1 font-bold">६ अङ्कको OTP कोड लेख्नुहोस्:</label>
              <input
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="१ २ ३ ४ ५ ६"
                className="w-full bg-stone-950 border border-amber-500 rounded-xl p-3 text-center text-lg font-mono tracking-widest text-amber-300"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              प्रमाणीकरण गरी प्रवेश गर्नुहोस्
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => handleSendOTP(phone)}
                className="text-[11px] text-stone-400 hover:text-amber-300 flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>कोड आएन? पुनः पठाउनुहोस्</span>
              </button>
            </div>
          </form>
        )}

        {/* Mode 4: Forgot Password */}
        {mode === 'forgot' && (
          <div className="space-y-3 text-xs">
            <p className="text-[11px] text-stone-300">
              आफ्नो दर्ता भएको मोबाइल नम्बर लेख्नुहोस्। पासवर्ड रिसेट लिङ्क वा OTP पठाइनेछ।
            </p>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="९८XXXXXXXX"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-stone-100"
            />
            <button
              type="button"
              onClick={() => handleSendOTP(phone)}
              className="w-full py-2.5 bg-amber-500 text-stone-950 font-black rounded-xl shadow-lg"
            >
              OTP कोड पठाउनुहोस्
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-stone-400 text-[11px] hover:underline block mx-auto text-center"
            >
              लगइन पृष्ठमा फर्कनुहोस्
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
