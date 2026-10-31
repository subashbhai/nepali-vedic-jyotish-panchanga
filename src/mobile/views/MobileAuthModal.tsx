import React, { useState, useEffect } from 'react';
import {
  Phone,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  LogIn,
  UserPlus,
  MapPin,
  Eye,
  EyeOff,
  Sparkles,
  X
} from 'lucide-react';
import {
  saveMobileUserSession,
  MobileUserProfile
} from '../db/mobileAuthStore';
import { authService } from '../../services/authService';
import { formatNepalPhoneNumber } from '../../services/firebaseAuthService';

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
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // 5-Field Registration Form State (Zero OTP)
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Status & Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsLoading(false);
      setActiveTab('login');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Handle Sign In ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanId = loginIdentifier.trim();
    const cleanPass = loginPassword.trim();

    if (!cleanId || !cleanPass) {
      setErrorMessage('कृपया मोबाइल नम्बर वा प्रयोगकर्ता नाम र पासवर्ड प्रविष्ट गर्नुहोस्।');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.login(cleanId, cleanPass);
      if (res.success && res.user) {
        setSuccessMessage(res.message || 'लगइन सफल भयो!');
        const mobileProfile: MobileUserProfile = {
          id: res.user.id,
          userId: res.user.id,
          username: res.user.username,
          phone: res.user.phone,
          fullName: res.user.fullName,
          role: res.user.role || 'CUSTOMER',
          status: res.user.status || 'active',
          token: res.token || `mob_${Date.now()}`
        };
        saveMobileUserSession(mobileProfile);
        setTimeout(() => {
          onSuccess(mobileProfile);
          onClose();
        }, 500);
      } else {
        setErrorMessage(res.message || 'लगइन प्रमाणिकरण असफल भयो।');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'लगइन गर्दा समस्या आयो।');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Handle 5-Field Signup ──
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = fullName.trim();
    const cleanAddress = address.trim();
    const cleanPhone = mobileNumber.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName || !cleanAddress || !cleanPhone || !cleanUsername || !cleanPassword) {
      setErrorMessage('सबै पाँचवटै फिल्ड भर्नु अनिवार्य छ।');
      return;
    }

    const phoneVal = formatNepalPhoneNumber(cleanPhone);
    if (!phoneVal.isValid) {
      setErrorMessage(phoneVal.error || 'कृपया मान्य १० अङ्कको मोबाइल नम्बर प्रविष्ट गर्नुहोस्।');
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMessage('पासवर्ड कम्तिमा ६ अक्षर वा अङ्कको हुनुपर्दछ।');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.signup({
        fullName: cleanName,
        address: cleanAddress,
        mobileNumber: phoneVal.local10,
        username: cleanUsername,
        password: cleanPassword
      });

      if (res.success && res.user) {
        setSuccessMessage(res.message || 'दर्ता सफल भयो!');
        const mobileProfile: MobileUserProfile = {
          id: res.user.id,
          userId: res.user.id,
          username: res.user.username,
          phone: res.user.phone,
          fullName: res.user.fullName,
          role: res.user.role || 'CUSTOMER',
          status: 'active',
          token: res.token || `mob_${Date.now()}`
        };
        saveMobileUserSession(mobileProfile);
        setTimeout(() => {
          onSuccess(mobileProfile);
          onClose();
        }, 500);
      } else {
        setErrorMessage(res.message || 'दर्ता असफल भयो।');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'दर्ता गर्दा प्राविधिक समस्या आयो।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl p-5 text-stone-100 shadow-2xl my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-600/20 border border-amber-500/40 flex items-center justify-center mb-2">
            <ShieldCheck className="w-6 h-6 text-amber-500" />
          </div>
          <h3 className="font-bold text-base text-amber-400 font-serif">बालानन्द वैदिक सेवा</h3>
          <p className="text-[11px] text-stone-400 mt-0.5">मोबाइल लगइन तथा नयाँ खाता दर्ता</p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-stone-950 rounded-2xl border border-stone-800 mb-4">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'login'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            लगइन (Sign In)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'register'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            नयाँ दर्ता (Sign Up)
          </button>
        </div>

        {/* Feedback alerts */}
        {errorMessage && (
          <div className="p-2.5 mb-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-2.5 mb-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {activeTab === 'login' ? (
          /* ── MOBILE LOGIN ── */
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-stone-300 mb-1">
                मोबाइल नम्बर वा युजरनेम *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="98XXXXXXXX वा username"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-300 mb-1">
                गोप्य पासवर्ड *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="तपाईंको पासवर्ड"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-9 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-2.5 text-stone-400"
                >
                  {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>प्रमाणित गरिँदैछ...</span>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>लगइन गर्नुहोस्</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* ── MOBILE 5-FIELD SIGNUP (NO OTP) ── */
          <form onSubmit={handleRegister} className="space-y-2.5">
            <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-2 text-[11px] text-amber-200/90 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>कुनै OTP चाहिँदैन। पाँच विवरण भरेर तुरुन्त सुरु गर्नुहोस्।</span>
            </div>

            {/* 1. Full Name */}
            <div>
              <label className="block text-[11px] font-bold text-stone-300 mb-0.5">१. पूरा नाम *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="राम शर्मा"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* 2. Address */}
            <div>
              <label className="block text-[11px] font-bold text-stone-300 mb-0.5">२. ठेगाना *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="काठमाडौँ, नेपाल"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* 3. Mobile Number */}
            <div>
              <label className="block text-[11px] font-bold text-stone-300 mb-0.5">३. मोबाइल नम्बर *</label>
              <input
                type="tel"
                required
                maxLength={10}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="९८XXXXXXXX"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            {/* 4. Username */}
            <div>
              <label className="block text-[11px] font-bold text-stone-300 mb-0.5">४. प्रयोगकर्ता नाम (Username) *</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                placeholder="ram_sharma"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            {/* 5. Password */}
            <div>
              <label className="block text-[11px] font-bold text-stone-300 mb-0.5">५. पासवर्ड *</label>
              <div className="relative">
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="कम्तिमा ६ अक्षर"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 pr-8 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-2.5 top-2 text-stone-400"
                >
                  {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>दर्ता गरिँदैछ...</span>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>खाता दर्ता गर्नुहोस्</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
