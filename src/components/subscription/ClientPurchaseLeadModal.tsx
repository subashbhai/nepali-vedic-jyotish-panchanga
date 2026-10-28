import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Lock,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Copy,
  Check,
  Smartphone,
  Monitor,
  Zap,
  Crown,
  ChevronRight,
  ArrowLeft,
  User,
  Calendar,
  Award
} from 'lucide-react';
import {
  start24HourTrialAsync,
  submitPurchaseApplication,
  submitPurchaseApplicationAsync,
  is24HourTrialActive,
  isDeviceTrialExpired,
  getTrialRemainingSeconds,
  isClientPurchaseApproved
} from '../../db/clientLeadStore';
import { getActiveRBACSession } from '../../db/rbacStore';
import { getUserPersonalBirthProfile } from '../../db/profileStore';
import { convertBSToADFull } from '../../utils/bsCalendarData';

interface ClientPurchaseLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
  targetFeatureName?: string;
  initialMode?: 'trial_or_purchase' | 'purchase_only';
  onNavigateToAdmin?: (tab?: string) => void;
}

export const ClientPurchaseLeadModal: React.FC<ClientPurchaseLeadModalProps> = ({
  isOpen,
  onClose,
  onUnlockSuccess,
  targetFeatureName = 'ज्योतिष / वास्तुशास्त्र',
  initialMode = 'trial_or_purchase',
}) => {
  // Form fields (Registration fields)
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Additional mandatory birth details
  const [dobBS, setDobBS] = useState('२०४६-०५-१५');
  const [birthTime, setBirthTime] = useState('०६:३०');
  const [birthLocation, setBirthLocation] = useState('काठमाडौँ');
  const [gender, setGender] = useState('पुरुष');

  // Optional cultural details
  const [gotra, setGotra] = useState('');
  const [customGotra, setCustomGotra] = useState('');
  const [jaatBarna, setJaatBarna] = useState('');
  const [customJaat, setCustomJaat] = useState('');

  // Master cultural lists
  const [gotraList, setGotraList] = useState<string[]>([
    'कश्यप', 'भारद्वाज', 'वशिष्ठ', 'विश्वामित्र', 'गौतम', 'जमदग्नि', 'अत्रि', 'अगस्त्य', 
    'गर्ग', 'कौडिन्य', 'उपमन्यु', 'पराशर', 'शाण्डिल्य', 'धनञ्जय', 'माधव', 'आत्रेय', 
    'घृतकौशिक', 'मौद्गल्य', 'कौशिक', 'अंगिरस', 'हरित', 'माण्डव्य', 'अन्य / सूचीमा छैन'
  ]);
  const [jaatList, setJaatList] = useState<string[]>([
    'ब्राह्मण (पर्वते)', 'क्षेत्री', 'ठकुरी', 'संन्यासी / दशनामी', 'नेवार', 'मगर', 
    'गुरुङ', 'राई', 'लिम्बु', 'तामाङ', 'शेर्पा', 'थारु', 'यादव', 'दलित समुदाय', 
    'मधेशी समुदाय', 'मुस्लिम समुदाय', 'अन्य / सूचीमा छैन'
  ]);

  // Fetch cultural data from backend
  useEffect(() => {
    fetch('/api/cultural-data')
      .then(r => r.json())
      .then(d => {
        if (d && d.success && d.data) {
          if (Array.isArray(d.data.gotras) && d.data.gotras.length > 0) {
            const names = d.data.gotras.map((g: any) => g.nameNepali);
            if (!names.includes('अन्य / सूचीमा छैन')) names.push('अन्य / सूचीमा छैन');
            setGotraList(names);
          }
          if (Array.isArray(d.data.jaatBarna) && d.data.jaatBarna.length > 0) {
            const names = d.data.jaatBarna.map((j: any) => j.nameNepali);
            if (!names.includes('अन्य / सूचीमा छैन')) names.push('अन्य / सूचीमा छैन');
            setJaatList(names);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Purchase Sub-state
  const [showPurchasePlans, setShowPurchasePlans] = useState(initialMode === 'purchase_only');
  const [selectedPlanCategory, setSelectedPlanCategory] = useState<'yearly' | 'lifetime'>('yearly');
  const [selectedPlatform, setSelectedPlatform] = useState<'both' | 'desktop' | 'mobile'>('both');
  const [isPlanConfirmed, setIsPlanConfirmed] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<'esewa' | 'khalti' | 'bank'>('esewa');
  const [transactionCode, setTransactionCode] = useState('');
  const [copiedEsewa, setCopiedEsewa] = useState(false);

  // Status & Messaging
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check device status
  const trialExpired = isDeviceTrialExpired();
  const trialActive = is24HourTrialActive();
  const remainingTrialSeconds = getTrialRemainingSeconds();

  const activeSession = getActiveRBACSession();
  const prevIsOpenRef = useRef(false);

  // Restore pending plan if redirected from login
  useEffect(() => {
    try {
      const savedCat = sessionStorage.getItem('balananda_pending_plan_category');
      const savedPlat = sessionStorage.getItem('balananda_pending_plan_platform');
      if (savedCat === 'yearly' || savedCat === 'lifetime') {
        setSelectedPlanCategory(savedCat);
        sessionStorage.removeItem('balananda_pending_plan_category');
      }
      if (savedPlat === 'both' || savedPlat === 'desktop' || savedPlat === 'mobile') {
        setSelectedPlatform(savedPlat);
        sessionStorage.removeItem('balananda_pending_plan_platform');
      }
    } catch {}
  }, []);

  // 1. Initialise form and plan state ONLY when modal transitions from closed to open
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setErrorMsg(null);
      setSuccessMsg(null);
      setShowPurchasePlans(initialMode === 'purchase_only');
      setIsPlanConfirmed(false);
      setIsSubmitting(false);

      const session = getActiveRBACSession();
      if (session) {
        if (session.fullName && !fullName) setFullName(session.fullName);
        if ((session.phone || session.username) && !mobile) {
          const ph = session.phone || session.username;
          setMobile(ph);
          if (!whatsapp) setWhatsapp(ph);
        }
        if ((session as any).email && !email) setEmail((session as any).email);

        const prof = getUserPersonalBirthProfile(session.userId, session.fullName, session.phone || session.username);
        if (prof) {
          if (prof.dateBS) setDobBS(prof.dateBS);
          if (prof.time) setBirthTime(prof.time);
          if (prof.location?.name || prof.location?.district) setBirthLocation(prof.location.name || prof.location.district || '');
          if (prof.gender) setGender(prof.gender);
          if (prof.gotra) setGotra(prof.gotra);
        }
      }
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, initialMode]);

  // 2. Window event listener for software unlock
  useEffect(() => {
    if (!isOpen) return;

    const handleFullAccessUnlocked = (e: any) => {
      if (e?.detail?.hasFullAccess === true && isClientPurchaseApproved()) {
        onUnlockSuccess();
        onClose();
      }
    };
    window.addEventListener('software-full-access-updated', handleFullAccessUnlocked);
    return () => {
      window.removeEventListener('software-full-access-updated', handleFullAccessUnlocked);
    };
  }, [isOpen, onUnlockSuccess, onClose]);

  if (!isOpen) return null;

  // Validation: all 5 registration fields + mandatory birth details
  const isBirthValid =
    dobBS.trim().length >= 8 &&
    birthTime.trim().length >= 3 &&
    birthLocation.trim().length >= 2;

  const isFormValid =
    fullName.trim().length >= 3 &&
    address.trim().length >= 3 &&
    mobile.trim().length >= 10 &&
    email.trim().includes('@') &&
    whatsapp.trim().length >= 10 &&
    isBirthValid;

  // Compute pricing
  const planPricing: Record<string, { label: string; price: number; formatted: string; desc: string; icon: any; popular?: boolean }> = {
    'yearly_mobile': {
      label: '१ वर्ष मोबाइल मात्र',
      price: 200,
      formatted: 'रु. २००',
      desc: 'एन्ड्रोइड तथा iOS मोबाइल एपमा कुण्डली, फलादेश तथा पञ्चाङ्ग सेवा',
      icon: Smartphone
    },
    'yearly_desktop': {
      label: '१ वर्ष कम्प्युटर मात्र',
      price: 500,
      formatted: 'रु. ५००',
      desc: 'विन्डोज ल्यापटप / डेस्कटपमा ठूलो स्क्रिन, विस्तृत प्रिन्टिङ तथा फलादेश',
      icon: Monitor
    },
    'yearly_both': {
      label: '१ वर्ष मोबाइल + कम्प्युटर (सर्वोत्कृष्ट / Best Value)',
      price: 1200,
      formatted: 'रु. १,२००',
      desc: 'मोबाइल र कम्प्युटर दुवैमा पूर्ण पहुँच, कुनै पनि डिभाइसबाट सिंक हुने',
      icon: Zap,
      popular: true
    },
    'lifetime_mobile': {
      label: 'आजीवन मोबाइल मात्र',
      price: 1000,
      formatted: 'रु. १,०००',
      desc: 'एकपटक भुक्तानी गरी मोबाइलमा सधैँभरिका लागि पूर्ण पहुँच',
      icon: Smartphone
    },
    'lifetime_desktop': {
      label: 'आजीवन कम्प्युटर मात्र',
      price: 2500,
      formatted: 'रु. २,५००',
      desc: 'एकपटक भुक्तानी गरी कम्प्युटरमा सधैँभरिका लागि पूर्ण पहुँच',
      icon: Monitor
    },
    'lifetime_both': {
      label: 'आजीवन मोबाइल + कम्प्युटर (सर्वोत्कृष्ट / Best Value)',
      price: 3000,
      formatted: 'रु. ३,०००',
      desc: 'मोबाइल र कम्प्युटर दुवैमा आजीवन पूर्ण पहुँच, भविष्यका सम्पूर्ण नयाँ फिचर निःशुल्क',
      icon: Zap,
      popular: true
    },
  };

  const currentPlanKey = `${selectedPlanCategory}_${selectedPlatform}` as keyof typeof planPricing;
  const currentPlan = planPricing[currentPlanKey] || planPricing['yearly_both'];

  const handleCopyEsewa = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText('9764400533');
      setCopiedEsewa(true);
      setTimeout(() => setCopiedEsewa(false), 2000);
    }
  };

  // Handler: Start 24-Hour Free Trial
  const handleActivateTrial = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setErrorMsg(null);
    if (!isFormValid) {
      setErrorMsg('कृपया नाम, ठेगाना, मोबाइल नं., इमेल र ह्वाट्सएप नम्बर सबै अनिवार्य रूपमा भर्नुहोस्।');
      return;
    }

    if (trialExpired) {
      setErrorMsg('यस डिभाइसमा २४ घण्टे परीक्षण समाप्त भइसकेको छ। कृपया सफ्टवेयर खरिद गरी सुपरएडमिनबाट स्वीकृत गराउनुहोस्।');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await start24HourTrialAsync({
        fullName: fullName.trim(),
        address: address.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim(),
      });

      if (res.success) {
        setSuccessMsg(res.messageNepali);
        setTimeout(() => {
          onUnlockSuccess();
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.messageNepali);
      }
    } catch {
      setErrorMsg('परीक्षण सुरु गर्दा समस्या भयो। कृपया पुनः प्रयास गर्नुहोस्।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Open purchase plans selection view (Strictly NO premature submission)
  const handleProceedToPurchasePlans = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setErrorMsg(null);
    setShowPurchasePlans(true);
    setIsPlanConfirmed(false);
  };

  // Handler: Explicit OK confirmation for chosen plan
  const handleConfirmPlan = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsPlanConfirmed(true);
    setErrorMsg(null);
  };

  // Handler: Submit Purchase Application (Only after user confirmed plan and submits)
  const handleSubmitPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isPlanConfirmed) {
      setErrorMsg('कृपया पहिले उपयुक्त योजना छनोट गरी "यो योजना छनोट गर्नुहोस् (OK)" बटन थिच्नुहोस्।');
      return;
    }

    if (!isFormValid) {
      setErrorMsg('कृपया नाम, ठेगाना, मोबाइल नं., इमेल, जन्ममिति (BS), जन्म समय र स्थान अनिवार्य रूपमा भर्नुहोस्।');
      return;
    }

    const finalTx = transactionCode.trim() || 'भुक्तानी रुजु बाँकी (Pending eSewa)';

    let calculatedAD = '';
    if (dobBS) {
      try {
        const parts = dobBS.split('-').map(p => parseInt(p, 10));
        if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
          calculatedAD = convertBSToADFull(parts[0], parts[1], parts[2]);
        }
      } catch {}
    }

    const finalGotra = gotra === 'अन्य / सूचीमा छैन' ? customGotra.trim() : gotra;
    const finalJaat = jaatBarna === 'अन्य / सूचीमा छैन' ? customJaat.trim() : jaatBarna;

    setIsSubmitting(true);
    try {
      const res = await submitPurchaseApplicationAsync({
        fullName: fullName.trim(),
        address: address.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        whatsapp: whatsapp.trim(),
        planId: currentPlanKey as any,
        planNameNepali: currentPlan.label,
        planAmountNPR: currentPlan.price,
        paymentMethod: selectedGateway,
        transactionId: finalTx,
        dobBS: dobBS.trim(),
        dobAD: calculatedAD,
        birthTime: birthTime.trim(),
        birthLocation: birthLocation.trim(),
        gender,
        gotra: finalGotra,
        jaatBarna: finalJaat,
      });

      if (res.success) {
        setSuccessMsg(`तपाईंको '${currentPlan.label}' (${currentPlan.formatted}) खरिद आवेदन दर्ता भयो! सुपरएडमिनले रकम रुजु गरी स्वीकृत गरेपछि तपाईंको सफ्टवेयर सक्रिय हुनेछ।`);
      } else {
        setErrorMsg(res.messageNepali);
      }
    } catch {
      setErrorMsg('खरिद आवेदन पठाउँदा समस्या भयो। कृपया पुनः प्रयास गर्नुहोस्।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-stone-900 border-2 border-amber-500/80 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto text-stone-900 dark:text-stone-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7A1C1C] via-[#9B2C2C] to-[#5C1515] text-white p-4 sm:p-5 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg font-serif">
                  {showPurchasePlans ? 'सफ्टवेयर खरिद योजना छनोट' : 'सफ्टवेयर खरिद तथा परीक्षण फारम'}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/50 text-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  १ वर्ष / आजीवन योजना
                </span>
              </div>
              <p className="text-xs text-amber-200/90 mt-0.5">
                {targetFeatureName} सुविधाहरू खुला गर्न विवरण दर्ता गर्नुहोस्
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* Active Registered User Badge / Guest Login Notice */}
          {activeSession ? (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  प्रमाणीकृत खाता: <strong>{activeSession.fullName}</strong> ({activeSession.phone || activeSession.username})
                </span>
              </div>
              <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                दर्ता भएको सदस्य
              </span>
            </div>
          ) : (
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>खरिद वा परीक्षण गर्न पहिले खाता लगइन वा दर्ता गर्नुहोस्।</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.dispatchEvent(new CustomEvent('open-rbac-auth-modal'));
                }}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shrink-0 cursor-pointer"
              >
                खाता लगइन वा नयाँ दर्ता ↗
              </button>
            </div>
          )}

          {/* Trial Status Notice if active or expired */}
          {trialActive && (
            <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                तपाईंको २४ घण्टे परीक्षण सक्रिय छ (बाँकी समय: करिब {Math.floor(remainingTrialSeconds / 3600)} घण्टा)।
              </span>
            </div>
          )}

          {trialExpired && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">यस डिभाइसमा २४ घण्टे निःशुल्क परीक्षण समाप्त भएको छ।</strong>
                <span>
                  सफ्टवेयरका सम्पूर्ण विकल्पहरू सुचारु गर्न कृपया तलको खरिद योजना छनोट गरी सुपरएडमिनबाट स्वीकृत गराउनुहोस्।
                </span>
              </div>
            </div>
          )}

          {/* Success Message Banner */}
          {successMsg && (
            <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl flex items-start gap-3 text-xs text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-sm">आवेदन दर्ता भयो!</strong>
                <p className="mt-1 leading-relaxed">{successMsg}</p>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-stone-700 hover:bg-stone-600 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    बन्द गर्नुहोस्
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-2xl flex items-center gap-2 text-xs text-rose-800 dark:text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!successMsg && (
            <>
              {/* १. अनिवार्य ग्राहक फारम */}
              <div className="space-y-3 bg-stone-50 dark:bg-stone-800/60 p-4 rounded-2xl border border-stone-200 dark:border-stone-700">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-black">१</span>
                    <span>ग्राहकको व्यक्तिगत तथा सम्पर्क विवरण (अनिवार्य)</span>
                  </h4>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                    सबै ५ वटै विवरण अनिवार्य
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  {/* Name */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-stone-600 dark:text-stone-300 font-bold">
                        पूरा नाम (Full Name) *
                      </label>
                      {activeSession && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          🔒 स्वतः भरिएको
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="उदा: पं. रामप्रसाद शर्मा"
                      value={fullName}
                      readOnly={Boolean(activeSession)}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl focus:border-amber-500 focus:outline-none ${
                        activeSession 
                          ? 'bg-stone-100 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 cursor-not-allowed font-medium' 
                          : 'bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700'
                      }`}
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                      ठेगाना (Address) *
                    </label>
                    <input
                      type="text"
                      placeholder="उदा: काठमाडौँ-१०, बानेश्वर"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Mobile No */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-stone-600 dark:text-stone-300 font-bold">
                        मोबाइल नम्बर (Mobile No.) *
                      </label>
                      {activeSession && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          🔒 स्वतः भरिएको
                        </span>
                      )}
                    </div>
                    <input
                      type="tel"
                      placeholder="९८xxxxxxxx / ९७xxxxxxxx"
                      value={mobile}
                      readOnly={Boolean(activeSession)}
                      onChange={(e) => setMobile(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl focus:border-amber-500 focus:outline-none ${
                        activeSession 
                          ? 'bg-stone-100 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 cursor-not-allowed font-mono' 
                          : 'bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700'
                      }`}
                    />
                  </div>

                  {/* WhatsApp No */}
                  <div>
                    <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                      ह्वाट्सएप नम्बर (WhatsApp No.) *
                    </label>
                    <input
                      type="tel"
                      placeholder="९८xxxxxxxx / ९७xxxxxxxx"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Email ID */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-stone-600 dark:text-stone-300 font-bold">
                        इमेल ठेगाना (Email ID) *
                      </label>
                      {activeSession && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          🔒 खातासँग बाँधिएको
                        </span>
                      )}
                    </div>
                    <input
                      type="email"
                      placeholder="example@gmail.com"
                      value={email}
                      readOnly={Boolean(activeSession && (activeSession as any).email)}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl focus:border-amber-500 focus:outline-none ${
                        activeSession && (activeSession as any).email 
                          ? 'bg-stone-100 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 cursor-not-allowed' 
                          : 'bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* १.१. अनिवार्य जन्म विवरण (कुण्डली तथा फलादेश) */}
              <div className="space-y-3 bg-amber-500/5 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span>जन्म विवरण (कुण्डली तथा फलादेशका लागि अनिवार्य)</span>
                  </h4>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700">
                    ४ वटै अनिवार्य
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  {/* DOB BS */}
                  <div>
                    <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                      जन्म मिति (वि.सं.) *
                    </label>
                    <input
                      type="text"
                      placeholder="उदा: २०४६-०५-१५"
                      value={dobBS}
                      onChange={(e) => setDobBS(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* TOB */}
                  <div>
                    <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                      जन्म समय (Birth Time) *
                    </label>
                    <input
                      type="text"
                      placeholder="उदा: ०६:३०"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Birth Place */}
                  <div>
                    <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                      जन्म स्थान (जिल्ला / शहर) *
                    </label>
                    <input
                      type="text"
                      placeholder="उदा: काठमाडौँ"
                      value={birthLocation}
                      onChange={(e) => setBirthLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                      लिङ्ग (Gender) *
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none cursor-pointer"
                    >
                      <option value="पुरुष">पुरुष (Male)</option>
                      <option value="महिला">महिला (Female)</option>
                      <option value="अन्य">अन्य (Other)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* १.२. सांस्कृतिक तथा परम्परागत विवरण (ऐच्छिक) */}
              <div className="space-y-3 bg-stone-50 dark:bg-stone-800/60 p-4 rounded-2xl border border-stone-200 dark:border-stone-700">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>सांस्कृतिक तथा परम्परागत विवरण (ऐच्छिक / Non-blocking)</span>
                  </h4>
                  <span className="text-[10px] text-stone-500 font-medium">
                    कुण्डली मिलान तथा पूजाका लागि
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  {/* Gotra */}
                  <div>
                    <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                      गोत्र (Gotra)
                    </label>
                    <select
                      value={gotra}
                      onChange={(e) => setGotra(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none cursor-pointer"
                    >
                      <option value="">-- गोत्र छनोट गर्नुहोस् --</option>
                      {gotraList.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    {gotra === 'अन्य / सूचीमा छैन' && (
                      <input
                        type="text"
                        placeholder="आफ्नो गोत्र टाइप गर्नुहोस्"
                        value={customGotra}
                        onChange={(e) => setCustomGotra(e.target.value)}
                        className="mt-2 w-full px-3 py-2 bg-white dark:bg-stone-900 border border-amber-400 rounded-xl focus:outline-none"
                      />
                    )}
                  </div>

                  {/* Jaat / Barna */}
                  <div>
                    <label className="block text-stone-600 dark:text-stone-300 font-bold mb-1">
                      जात / वर्ण (Community / Caste)
                    </label>
                    <select
                      value={jaatBarna}
                      onChange={(e) => setJaatBarna(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none cursor-pointer"
                    >
                      <option value="">-- जात/वर्ण छनोट गर्नुहोस् --</option>
                      {jaatList.map((j) => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                    </select>
                    {jaatBarna === 'अन्य / सूचीमा छैन' && (
                      <input
                        type="text"
                        placeholder="आफ्नो जात/वर्ण टाइप गर्नुहोस्"
                        value={customJaat}
                        onChange={(e) => setCustomJaat(e.target.value)}
                        className="mt-2 w-full px-3 py-2 bg-white dark:bg-stone-900 border border-amber-400 rounded-xl focus:outline-none"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* २. कार्य छनोट: २४ घण्टे ट्रायल वा खरिद */}
              {!showPurchasePlans ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-black">२</span>
                      <span>सुविधा छनोट गर्नुहोस्</span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* २४ घण्टे ट्रायल बटन */}
                    <button
                      type="button"
                      disabled={!isFormValid || trialExpired || isSubmitting}
                      onClick={handleActivateTrial}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                        trialExpired
                          ? 'opacity-50 border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800/40 cursor-not-allowed'
                          : isFormValid
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40 cursor-pointer shadow-sm active:scale-98'
                          : 'opacity-60 border-stone-300 dark:border-stone-700 cursor-not-allowed'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                            <Zap className="w-4 h-4 text-emerald-600" />
                            २४ घण्टे निःशुल्क ट्रायल
                          </span>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 font-black px-2 py-0.5 rounded-full">
                            निःशुल्क
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                          २४ घण्टाका लागि कुण्डली, फलादेश तथा वास्तुका सम्पूर्ण विकल्पहरू परीक्षण गर्नुहोस्।
                        </p>
                      </div>
                      <div className="mt-4 pt-2 border-t border-emerald-200/60 dark:border-emerald-900/60 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        <span>२४ घण्टाको ट्रायल सुरु गर्नुहोस्</span>
                        <span>→</span>
                      </div>
                    </button>

                    {/* खरिद गर्ने बटन (अब योजनाहरू खोल्छ, आफैँ बन्द हुँदैन) */}
                    <button
                      type="button"
                      onClick={handleProceedToPurchasePlans}
                      className="p-4 rounded-2xl border-2 border-amber-500 bg-gradient-to-br from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-left transition-all flex flex-col justify-between cursor-pointer shadow-sm active:scale-98"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                            <Crown className="w-4 h-4 text-amber-600 animate-bounce" />
                            सफ्टवेयर खरिद (१ वर्ष / आजीवन)
                          </span>
                          <span className="text-[10px] bg-amber-500 text-stone-950 font-black px-2 py-0.5 rounded-full">
                            योजनाहरू हेर्नुहोस् •
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                          १ वर्ष वा आजीवन योजना छनोट गरी सुपरएडमिनबाट आधिकारिक लाइसेन्स स्वीकृत गराउनुहोस्।
                        </p>
                      </div>
                      <div className="mt-4 pt-2 border-t border-amber-200/60 dark:border-stone-700 flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300">
                        <span>उपलब्ध योजनाहरू छनोट गर्नुहोस्</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                /* योजना छनोट तथा भुक्तानी खण्ड */
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-2">
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-black">२</span>
                      <span>खरिद योजना छनोट गर्नुहोस्</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowPurchasePlans(false)}
                      className="text-xs text-amber-700 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>अन्य विकल्पमा फर्कनुहोस्</span>
                    </button>
                  </div>

                  {/* Plan Duration Category Switcher */}
                  <div>
                    <label className="block text-stone-600 dark:text-stone-400 font-bold text-xs mb-1.5">
                      अवधि छनोट गर्नुहोस् :
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlanCategory('yearly');
                          setIsPlanConfirmed(false);
                        }}
                        className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          selectedPlanCategory === 'yearly'
                            ? 'bg-[#7A1C1C] text-white border-[#5C1515] shadow-sm font-black'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-750'
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        <span>१ वर्षको योजना (One Year)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPlanCategory('lifetime');
                          setIsPlanConfirmed(false);
                        }}
                        className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          selectedPlanCategory === 'lifetime'
                            ? 'bg-[#7A1C1C] text-white border-[#5C1515] shadow-sm font-black'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-750'
                        }`}
                      >
                        <Crown className="w-4 h-4 text-amber-300" />
                        <span>आजीवन योजना (Lifetime)</span>
                      </button>
                    </div>
                  </div>

                  {/* 3 Available Plan Cards */}
                  <div>
                    <label className="block text-stone-600 dark:text-stone-400 font-bold text-xs mb-1.5">
                      डिभाइस तथा सुविधा छनोट गर्नुहोस् (कुनै एक रोज्नुहोस्) :
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {(['both', 'desktop', 'mobile'] as const).map((plat) => {
                        const key = `${selectedPlanCategory}_${plat}` as keyof typeof planPricing;
                        const item = planPricing[key];
                        const isSelected = selectedPlatform === plat;
                        const Icon = item.icon;

                        return (
                          <div
                            key={plat}
                            onClick={() => {
                              setSelectedPlatform(plat);
                              setIsPlanConfirmed(false);
                            }}
                            className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                              isSelected
                                ? 'border-amber-500 bg-amber-50/90 dark:bg-amber-950/30 text-amber-950 dark:text-amber-100 shadow-md ring-2 ring-amber-400/40'
                                : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1.5">
                                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-amber-500 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'}`}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <span className="font-bold text-xs">
                                    {plat === 'both' ? 'मोबाइल + कम्प्युटर' : plat === 'desktop' ? 'कम्प्युटर मात्र' : 'मोबाइल मात्र'}
                                  </span>
                                </div>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-amber-600 bg-amber-600 text-white' : 'border-stone-300 dark:border-stone-600'}`}>
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                              </div>

                              {item.popular && (
                                <span className="inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 mb-1.5 shadow-2xs">
                                  ⭐ सर्वोत्कृष्ट (Best Value)
                                </span>
                              )}

                              <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-snug">
                                {item.desc}
                              </p>
                            </div>

                            <div className="mt-3 pt-2 border-t border-stone-200 dark:border-stone-700/60 flex items-baseline justify-between">
                              <span className="text-[10px] text-stone-500">शुल्क:</span>
                              <span className="text-amber-700 dark:text-amber-400 font-black text-sm">
                                {item.formatted}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explicit OK / Confirm Plan Button */}
                  <div className="pt-1">
                    {!isPlanConfirmed ? (
                      <button
                        type="button"
                        onClick={handleConfirmPlan}
                        className="w-full py-3 px-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                      >
                        <Check className="w-5 h-5 stroke-[2.5]" />
                        <span>यो योजना छनोट गर्नुहोस् (OK) : {currentPlan.label} ({currentPlan.formatted})</span>
                      </button>
                    ) : (
                      <div className="p-3.5 bg-emerald-500/15 border-2 border-emerald-500/60 rounded-2xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 shadow-sm animate-in fade-in">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-extrabold text-sm block text-emerald-800 dark:text-emerald-300">
                              ✓ योजना छनोट भयो: {currentPlan.label}
                            </span>
                            <span className="text-[11px] text-stone-600 dark:text-stone-300">
                              तिर्नुपर्ने रकम: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{currentPlan.formatted}</strong>
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsPlanConfirmed(false)}
                          className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-900 dark:text-emerald-200 text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
                        >
                          योजना बदल्नुहोस् ✎
                        </button>
                      </div>
                    )}
                  </div>

                  {/* भुक्तानी विवरण तथा फारम पेश खण्ड (Only visible once plan is OK/confirmed) */}
                  {isPlanConfirmed ? (
                    <form onSubmit={handleSubmitPurchase} className="space-y-3.5 pt-2 animate-in fade-in">
                      {/* Payment Receiver Box */}
                      <div className="p-3.5 bg-stone-100 dark:bg-stone-800/80 rounded-2xl border border-stone-300 dark:border-stone-700 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-700 dark:text-stone-300">
                            आधिकारिक भुक्तानी माध्यम : eSewa / Khalti
                          </span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-black text-sm">
                            तिर्नुपर्ने रकम: {currentPlan.formatted}
                          </span>
                        </div>

                        <div className="flex items-center justify-between bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700">
                          <div>
                            <div className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                              eSewa / Khalti ID: ९७६४४००५३३
                            </div>
                            <div className="text-[11px] text-stone-500">
                              खातावाला: Subash Bhandari (Pnd. Sukadew Saran)
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyEsewa}
                            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            {copiedEsewa ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedEsewa ? 'कपी भयो' : 'नम्बर कपी'}</span>
                          </button>
                        </div>

                        {/* Transaction Code Input */}
                        <div>
                          <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                            eSewa / Khalti कारोबार नम्बर (Transaction / Ref ID) *
                          </label>
                          <input
                            type="text"
                            placeholder="उदा: 7C14A293 वा Ref Code"
                            value={transactionCode}
                            onChange={(e) => setTransactionCode(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl focus:border-amber-500 focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={!isFormValid || isSubmitting}
                        className={`w-full py-3 rounded-2xl font-bold text-sm text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                          isFormValid && !isSubmitting
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 cursor-pointer active:scale-98'
                            : 'bg-stone-400 dark:bg-stone-700 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {isSubmitting
                            ? 'आवेदन दर्ता गरिँदैछ...'
                            : transactionCode.trim()
                            ? `खरिद आवेदन पेश गर्नुहोस् (${currentPlan.label})`
                            : `खरिद आवेदन पेश गर्नुहोस् (रकम पछि रुजु गर्ने)`}
                        </span>
                      </button>
                      <p className="text-[11px] text-center text-stone-500 dark:text-stone-400">
                        * आवेदन पेश भएपछि सुपरएडमिनले तपाईंले रोज्नुभएको योजना (<strong>{currentPlan.label}</strong>) अनुसार रकम रुजु गरी सफ्टवेयर सक्रिय (Approve) गरिदिनेछन्।
                      </p>
                    </form>
                  ) : (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 rounded-xl text-center text-xs text-amber-800 dark:text-amber-300">
                      💡 माथिका योजनाहरू हेरी तपाईंलाई उपयुक्त हुने योजना छनोट गर्नुहोस् र <strong>'यो योजना छनोट गर्नुहोस् (OK)'</strong> बटन थिच्नुहोस्। त्यसपछि भुक्तानी फारम खुल्नेछ।
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
