import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Lock,
  Phone,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  MapPin,
  X,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Server,
  Settings,
  RefreshCw
} from 'lucide-react';
import { SystemRole, RBACSession } from '../../db/rbacStore';
import { authService } from '../../services/authService';
import { apiClient } from '../../services/apiClient';
import { formatNepalPhoneNumber } from '../../services/firebaseAuthService';
import { getAssetUrl, handleImageFallback } from '../../utils/assetHelper';
import { BirthDetails } from '../../types/astrology';

interface RBACAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: SystemRole;
  isSuperAdminOnly?: boolean;
  initialMode?: 'signin' | 'signup';
  onLoginSuccess: (session: RBACSession, createdProfile?: BirthDetails) => void;
}

export const RBACAuthModal: React.FC<RBACAuthModalProps> = ({
  isOpen,
  onClose,
  isSuperAdminOnly = false,
  initialMode = 'signin',
  onLoginSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(
    isSuperAdminOnly ? 'signin' : initialMode === 'signup' ? 'signup' : 'signin'
  );

  // Sign In Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up Form State (EXACTLY 5 Visible Fields — Zero OTP)
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // UI / Status States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showBackendConfig, setShowBackendConfig] = useState(false);
  const [backendUrlInput, setBackendUrlInput] = useState(() => {
    return (typeof window !== 'undefined' && (localStorage.getItem('balananda_backend_url') || localStorage.getItem('balananda_api_base_url'))) || '';
  });
  const [testingBackend, setTestingBackend] = useState(false);
  const [backendTestResult, setBackendTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleTestAndSaveBackend = async () => {
    const raw = backendUrlInput.trim().replace(/\/+$/, '');
    if (!raw) {
      localStorage.removeItem('balananda_backend_url');
      localStorage.removeItem('balananda_api_base_url');
      apiClient.setBaseUrl('');
      setBackendTestResult({ ok: true, msg: 'पूर्वनिर्धारित (Default) कन्फिगरेसन पुनःस्थापित भयो।' });
      setErrorMsg(null);
      return;
    }
    if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
      setBackendTestResult({ ok: false, msg: 'कृपया मान्य URL (उदा: https://your-backend.run.app) प्रविष्ट गर्नुहोस्।' });
      return;
    }
    setTestingBackend(true);
    setBackendTestResult(null);
    try {
      const res = await fetch(`${raw}/api/health`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('balananda_backend_url', raw);
        apiClient.setBaseUrl(raw);
        setBackendTestResult({ ok: true, msg: `जडान सफल! सर्भर: ${data.app || 'Active'}, DB: ${data.database?.type || 'Connected'}` });
        setErrorMsg(null);
      } else {
        setBackendTestResult({ ok: false, msg: `सर्भरले HTTP ${res.status} फर्कायो।` });
      }
    } catch (e: any) {
      setBackendTestResult({ ok: false, msg: `जडान असफल (${e.message})। CORS वा सर्भर अनलाइन रहेको जाँच गर्नुहोस्।` });
    } finally {
      setTestingBackend(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      setIsLoading(false);
      setActiveTab(isSuperAdminOnly ? 'signin' : initialMode === 'signup' ? 'signup' : 'signin');
    }
  }, [isOpen, initialMode, isSuperAdminOnly]);

  if (!isOpen) return null;

  // ── Handle Sign In Submission ──
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanId = loginIdentifier.trim();
    const cleanPass = loginPassword.trim();

    if (!cleanId || !cleanPass) {
      setErrorMsg('कृपया मोबाइल नम्बर वा प्रयोगकर्ता नाम र पासवर्ड दुबै प्रविष्ट गर्नुहोस्।');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.login(cleanId, cleanPass);
      if (res.success && res.session) {
        setSuccessMsg(res.message || 'लगइन सफल भयो!');
        setTimeout(() => {
          onLoginSuccess(res.session!, res.user?.birthDetails);
          onClose();
        }, 500);
      } else {
        setErrorMsg(res.message || 'लगइन प्रमाणिकरण असफल भयो। विवरण जाँच्नुहोस्।');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'लगइन गर्दा प्राविधिक त्रुटि भयो।');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Handle 5-Field Signup Submission (No OTP!) ──
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = fullName.trim();
    const cleanAddress = address.trim();
    const cleanPhone = mobileNumber.trim();
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName) {
      setErrorMsg('कृपया आफ्नो पूरा नाम प्रविष्ट गर्नुहोस्।');
      return;
    }
    if (!cleanAddress) {
      setErrorMsg('कृपया आफ्नो स्थायी वा हालको ठेगाना प्रविष्ट गर्नुहोस्।');
      return;
    }
    if (!cleanPhone) {
      setErrorMsg('कृपया १० अङ्कको मोबाइल नम्बर प्रविष्ट गर्नुहोस्।');
      return;
    }
    const phoneVal = formatNepalPhoneNumber(cleanPhone);
    if (!phoneVal.isValid) {
      setErrorMsg(phoneVal.error || 'कृपया मान्य १० अङ्कको नेपाल मोबाइल नम्बर प्रविष्ट गर्नुहोस्।');
      return;
    }
    if (!cleanUsername) {
      setErrorMsg('कृपया युजरनेम प्रविष्ट गर्नुहोस् (३-३० अक्षर, अङ्क वा _)।');
      return;
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      setErrorMsg('पासवर्ड कम्तिमा ६ अक्षर वा अङ्कको हुनुपर्दछ।');
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

      if (res.success && res.session) {
        setSuccessMsg(res.message || 'खाता सफलतापूर्वक दर्ता भयो!');
        setTimeout(() => {
          onLoginSuccess(res.session!, res.user?.birthDetails);
          onClose();
        }, 600);
      } else {
        setErrorMsg(res.message || 'दर्ता प्रक्रिया सम्पन्न हुन सकेन।');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'दर्ता गर्दा प्राविधिक समस्या आयो।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-lg bg-white dark:bg-[#1E1B18] rounded-3xl shadow-2xl border-2 border-amber-300/80 dark:border-stone-800 overflow-hidden my-6"
      >
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-[#7A1C1C] via-[#8B2323] to-[#5C1515] p-5 text-white text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="बन्द गर्नुहोस्"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 mx-auto rounded-full bg-white dark:bg-stone-900 p-1 shadow-lg ring-3 ring-amber-400/80 overflow-hidden mb-2.5">
            <img
              src={getAssetUrl('/logo.png')}
              alt="बालानन्द लोगो"
              className="w-full h-full object-cover rounded-full select-none"
              onError={(e) => {
                handleImageFallback(e, [
                  getAssetUrl('/logo.png'),
                  getAssetUrl('/assets/logo.png'),
                  getAssetUrl('/balananda-logo.png')
                ]);
              }}
            />
          </div>

          <h2 className="text-xl font-bold font-serif tracking-wide text-amber-200">
            बालानन्द वैदिक ज्योतिष सेवा
          </h2>
          <p className="text-xs text-amber-100/90 mt-0.5">
            नेपाली वैदिक पञ्चाङ्ग, कुण्डली, फलादेश तथा आध्यात्मिक सेवा प्रणाली
          </p>
        </div>

        {/* Tab Switcher (लगइन vs नयाँ खाता दर्ता) */}
        {!isSuperAdminOnly && (
          <div className="grid grid-cols-2 p-2 bg-stone-100 dark:bg-stone-900/80 border-b border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signin');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'signin'
                  ? 'bg-white dark:bg-stone-800 text-[#7A1C1C] dark:text-amber-400 shadow-sm border border-amber-200 dark:border-stone-700'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>साइन इन (लगइन)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-white dark:bg-stone-800 text-[#7A1C1C] dark:text-amber-400 shadow-sm border border-amber-200 dark:border-stone-700'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>नयाँ खाता दर्ता</span>
            </button>
          </div>
        )}

        {/* Feedback Messages */}
        <div className="px-6 pt-4">
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 rounded-xl text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5 shadow-xs mb-3"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="leading-snug">{errorMsg}</span>
              </motion.div>
            )}

            {errorMsg && (errorMsg.includes('ब्याकइन्ड') || errorMsg.includes('API') || apiClient.isStaticHosting()) && (
              <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span className="font-bold">केन्द्रीय सर्भर जडान (Server Connection)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBackendConfig(!showBackendConfig)}
                    className="text-[11px] underline font-medium text-amber-800 dark:text-amber-300 hover:text-amber-950 cursor-pointer"
                  >
                    {showBackendConfig ? 'बन्द गर्नुहोस्' : 'कन्फिगर गर्नुहोस्'}
                  </button>
                </div>
                {showBackendConfig && (
                  <div className="mt-2.5 pt-2.5 border-t border-amber-200 dark:border-amber-900/60 space-y-2">
                    <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                      यो वेबसाइट Firebase Hosting मा चलिरहेको छ। केन्द्रीय डाटाबेस र ब्याकइन्डसँग जडान गर्न कृपया ब्याकइन्ड API URL प्रविष्ट गर्नुहोस्:
                    </p>
                    <div className="flex gap-1.5">
                      <input
                        type="url"
                        value={backendUrlInput}
                        onChange={(e) => setBackendUrlInput(e.target.value)}
                        placeholder="उदा: https://balananda-api.onrender.com"
                        className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={handleTestAndSaveBackend}
                        disabled={testingBackend}
                        className="px-3 py-1.5 bg-[#7A1C1C] hover:bg-[#8B2323] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {testingBackend ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'जडान परीक्षण'}
                      </button>
                    </div>
                    {backendTestResult && (
                      <p className={`text-[11px] font-medium ${backendTestResult.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                        {backendTestResult.msg}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-900 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2.5 shadow-xs mb-3"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="leading-snug">{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Form Body */}
        <div className="p-6 pt-2">
          {activeTab === 'signin' ? (
            /* ── TAB 1: NORMAL SIGN IN (MOBILE NO OR USERNAME + PASSWORD) ── */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  मोबाइल नम्बर वा प्रयोगकर्ता नाम (Username) *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="उदा: 98XXXXXXXX वा ram_sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  गोप्य पासवर्ड *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="तपाईंको पासवर्ड"
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-gradient-to-r from-[#7A1C1C] to-[#9B2C2C] hover:from-[#6B1717] hover:to-[#8B2323] text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    प्रमाणित गरिँदैछ...
                  </span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>लगइन गर्नुहोस्</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-stone-500 dark:text-stone-400">
                नयाँ प्रयोगकर्ता हुनुहुन्छ?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setErrorMsg(null);
                  }}
                  className="text-amber-700 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                >
                  यहाँ नयाँ खाता दर्ता गर्नुहोस्
                </button>
              </div>
            </form>
          ) : (
            /* ── TAB 2: 5-FIELD CLEAN SIGNUP (NO OTP!) ── */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div className="bg-amber-50 dark:bg-stone-900/90 border border-amber-200 dark:border-stone-800 rounded-xl p-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>कुनै OTP कोड आवश्यक छैन। फाराम भरेर तुरुन्त सेवाहरू सुरु गर्नुहोस्।</span>
              </div>

              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  १. पूरा नाम (Full Name) *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="उदा: रामप्रसाद शर्मा"
                    className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              {/* 2. Address */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  २. ठेगाना (Address) *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="उदा: काठमाडौँ, बागमती प्रदेश"
                    className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              {/* 3. Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  ३. मोबाइल नम्बर (Mobile No) *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-400" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="९८XXXXXXXX / ९७XXXXXXXX"
                    className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              {/* 4. User Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  ४. प्रयोगकर्ता नाम (User Name) *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                    placeholder="उदा: ram_sharma"
                    className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>
              </div>

              {/* 5. Password */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  ५. पासवर्ड (Password) *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-400" />
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="कम्तिमा ६ अक्षर वा अङ्क"
                    className="w-full pl-10 pr-10 py-2 text-xs sm:text-sm bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-stone-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3.5 top-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                  >
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 py-3 bg-gradient-to-r from-[#7A1C1C] to-[#9B2C2C] hover:from-[#6B1717] hover:to-[#8B2323] text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    दर्ता गरिँदैछ...
                  </span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>खाता दर्ता गर्नुहोस्</span>
                  </>
                )}
              </button>

              <div className="pt-1 text-center text-xs text-stone-500 dark:text-stone-400">
                पहिले नै दर्ता भइसकेको छ?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setErrorMsg(null);
                  }}
                  className="text-amber-700 dark:text-amber-400 font-bold hover:underline cursor-pointer"
                >
                  यहाँ साइन इन गर्नुहोस्
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
