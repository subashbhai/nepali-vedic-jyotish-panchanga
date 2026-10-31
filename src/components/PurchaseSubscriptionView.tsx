import React, { useState, useEffect } from 'react';
import {
  PlanConfig,
  PaymentGatewayConfig,
  PaymentRecord,
  UserSubscriptionAccount,
  PlatformType,
  getStoredPlansConfig,
  getStoredPricingConfig,
  getStoredGateways,
  getStoredUserSubscription,
  saveUserSubscription,
  evaluateSubscriptionStatus,
  start48HourTrial,
  processPlanPurchase,
  submitEsewaPaymentRequest,
  ESEWA_RECIPIENT_NUMBER,
  ESEWA_RECIPIENT_NUMBER_EN,
  calculatePlatformPrice,
  getPlatformNameNepali,
  formatNPRCurrency,
  toNepaliDigits,
  generateTxnNumber,
  generateReceiptNumber
} from '../db/subscriptionStore';
import { ReceiptPrintModal } from './ReceiptPrintModal';
import { OrganizationProfile } from '../types/astrology';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Smartphone,
  Monitor,
  Globe2,
  ArrowRight,
  AlertCircle,
  Award,
  Zap,
  Info,
  Check,
  Crown,
  Compass,
  Phone,
  Copy,
  ExternalLink
} from 'lucide-react';
import {
  checkServiceAccess,
  getLocalLicenses,
  saveLocalLicenses
} from '../db/serviceLicenseStore';
import {
  getStoredClientLeads,
  saveClientLeads,
  getDeviceFingerprint,
  ClientLead
} from '../db/clientLeadStore';
import { getActiveRBACSession } from '../db/rbacStore';
import { convertADToBS } from '../utils/nepaliCalendar';

interface PurchaseSubscriptionViewProps {
  onNavigateHome?: () => void;
  orgProfile?: OrganizationProfile;
}

export const PurchaseSubscriptionView: React.FC<PurchaseSubscriptionViewProps> = ({
  orgProfile,
}) => {
  const [plans, setPlans] = useState<PlanConfig[]>(getStoredPlansConfig());
  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>(getStoredGateways());
  const [userAccount, setUserAccount] = useState<UserSubscriptionAccount>(getStoredUserSubscription());
  const [status, setStatus] = useState(evaluateSubscriptionStatus());
  const pricingConfig = getStoredPricingConfig();

  // Checkout Modal State
  const [selectedPlanForPurchase, setSelectedPlanForPurchase] = useState<PlanConfig | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayConfig>(gateways[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);

  // Dedicated Jyotish & Vastu Lifetime Set State (रु. १०,०००)
  const [showJyotishVastuCheckout, setShowJyotishVastuCheckout] = useState(false);
  const [jyotishVastuGateway, setJyotishVastuGateway] = useState<'esewa' | 'khalti'>('esewa');
  const [jyotishVastuTxn, setJyotishVastuTxn] = useState('');
  const [isActivatingSet, setIsActivatingSet] = useState(false);
  const [licenseRev, setLicenseRev] = useState(0);

  const currentSession = getActiveRBACSession();
  const jyotishAccess = checkServiceAccess('jyotish', currentSession);
  const vastuAccess = checkServiceAccess('vastu', currentSession);
  const isBothUnlocked = jyotishAccess.allowed && vastuAccess.allowed;

  // eSewa Specific Payment Proof State
  const [esewaTxnCode, setEsewaTxnCode] = useState('');
  const [esewaPaidAmount, setEsewaPaidAmount] = useState<number>(0);
  const [esewaPaymentDateBS, setEsewaPaymentDateBS] = useState('');
  const [esewaProofNote, setEsewaProofNote] = useState('');
  const [esewaUserName, setEsewaUserName] = useState('');
  const [esewaUserAddress, setEsewaUserAddress] = useState('');
  const [esewaUserPhone, setEsewaUserPhone] = useState('');
  const [esewaUserWhatsapp, setEsewaUserWhatsapp] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Active Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState<PaymentRecord | null>(null);

  useEffect(() => {
    refreshState();
    const handleLicenseUpdate = () => {
      setLicenseRev((v) => v + 1);
      refreshState();
    };
    window.addEventListener('service-license-updated', handleLicenseUpdate);
    window.addEventListener('client-leads-updated', handleLicenseUpdate);
    window.addEventListener('subscription-status-updated', handleLicenseUpdate);
    return () => {
      window.removeEventListener('service-license-updated', handleLicenseUpdate);
      window.removeEventListener('client-leads-updated', handleLicenseUpdate);
      window.removeEventListener('subscription-status-updated', handleLicenseUpdate);
    };
  }, []);

  const refreshState = () => {
    const currentAcc = getStoredUserSubscription();
    setUserAccount(currentAcc);
    setStatus(evaluateSubscriptionStatus());
    setPlans(getStoredPlansConfig());
  };

  const handlePurchaseJyotishVastuSet = (instant: boolean = false) => {
    const session = getActiveRBACSession();
    const phone = session?.phone || session?.username || esewaUserPhone.trim() || '९७६४४००५३३';
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const fullName = session?.fullName || esewaUserName.trim() || userAccount.fullName || 'श्रद्धेय प्रयोगकर्ता';
    const txn = jyotishVastuTxn.trim() || `TXN-JV-${Date.now()}`;

    if (!instant && !jyotishVastuTxn.trim()) {
      setPaymentErrorMessage('कृपया कारोबार प्रमाणीकरणका लागि Transaction ID अनिवार्य राख्नुहोस्।');
      return;
    }

    setIsActivatingSet(true);
    setPaymentErrorMessage(null);

    setTimeout(() => {
      const nowISO = new Date().toISOString();
      const todayBS = convertADToBS(nowISO.split('T')[0]).formattedBS;

      // 1. Activate Service Licenses for both Jyotish & Vastu (Lifetime)
      const existingLicenses = getLocalLicenses();
      ['jyotish', 'vastu'].forEach((sKey) => {
        const idx = existingLicenses.findIndex(
          (l) => l.serviceKey === sKey && ((cleanPhone && (l.phone || '').includes(cleanPhone)) || (session?.userId && l.userId === session.userId))
        );
        const lic = {
          id: `lic_${sKey}_${Date.now()}`,
          serviceKey: sKey as 'jyotish' | 'vastu',
          userId: session?.userId || cleanPhone || `usr_${Date.now()}`,
          username: session?.username || cleanPhone,
          fullName,
          phone: cleanPhone || phone,
          unlocked: true,
          grantedPeriod: 'lifetime' as const,
          duration: 'lifetime',
          startsAtISO: nowISO,
          startsAtBS: todayBS,
          updatedAtISO: nowISO,
          grantedAtISO: nowISO,
          grantedAtBS: todayBS,
          expiresAtTimestamp: undefined,
          grantedBy: 'Purchase / Set Activation',
          paymentStatus: 'verified' as const,
          status: 'unlocked' as const,
          amountNPR: 10000
        };
        if (idx >= 0) existingLicenses[idx] = lic as any;
        else existingLicenses.unshift(lic as any);
      });
      saveLocalLicenses(existingLicenses);

      // 2. Activate in Client Leads as PURCHASE_APPROVED
      const leads = getStoredClientLeads();
      const leadIdx = leads.findIndex(
        (l) => cleanPhone && (l.mobile || l.whatsapp || '').replace(/\D/g, '').slice(-10) === cleanPhone
      );
      const approvedLead: ClientLead = {
        id: leadIdx >= 0 ? leads[leadIdx].id : `LEAD-${Date.now()}`,
        fullName,
        address: esewaUserAddress.trim() || 'काठमाडौँ',
        mobile: cleanPhone || phone,
        email: (session as any)?.email || '',
        whatsapp: esewaUserWhatsapp.trim() || cleanPhone || phone,
        deviceFingerprint: getDeviceFingerprint(),
        status: 'PURCHASE_APPROVED',
        paymentVerificationStatus: 'VERIFIED',
        verifiedAmount: 10000,
        planId: 'lifetime_both' as any,
        planNameNepali: 'ज्योतिष तथा वास्तु पूर्ण सेट (कम्प्युटर + मोबाइल आजीवन)',
        planAmountNPR: 10000,
        paymentMethod: (jyotishVastuGateway as any) || 'esewa',
        transactionId: txn,
        submittedAtISO: nowISO,
        submittedAtBS: todayBS,
        approvedAtISO: nowISO,
        approvedAtBS: todayBS,
        approvedBy: 'Instant Payment / SuperAdmin Rule',
        cashVerified: true
      };
      if (leadIdx >= 0) leads[leadIdx] = approvedLead;
      else leads.unshift(approvedLead);
      saveClientLeads(leads);

      // 3. Update User Subscription to Lifetime
      const currentAcc = getStoredUserSubscription();
      const receipt: PaymentRecord = {
        txnId: generateTxnNumber(),
        receiptNo: generateReceiptNumber(),
        planId: 'lifetime',
        planNameNepali: 'ज्योतिष तथा वास्तु पूर्ण सेट (कम्प्युटर + मोबाइल आजीवन)',
        platformMode: 'both' as any,
        platformNameNepali: 'कम्प्युटर तथा मोबाइल दुवै',
        basePriceNPR: 10000,
        basePriceFormattedNepali: 'रु. १०,०००',
        appliedPercent: 100,
        amountNPR: 10000,
        amountFormattedNepali: 'रु. १०,०००',
        dateAD: nowISO.split('T')[0],
        dateBS: todayBS,
        timeStr: `${nowISO.slice(11, 16)}`,
        paymentMethodNepali: jyotishVastuGateway === 'khalti' ? 'खल्ती (Khalti)' : 'ईसेवा (eSewa)',
        paymentMethodKey: jyotishVastuGateway,
        status: 'success',
        periodStartBS: todayBS,
        periodEndBS: 'आजीवन'
      };

      const updatedAcc = {
        ...currentAcc,
        currentPlanId: 'lifetime' as const,
        subscriptionStartedAtISO: nowISO,
        subscriptionExpiresAtISO: null,
        paymentHistory: [receipt, ...currentAcc.paymentHistory]
      };
      saveUserSubscription(updatedAcc);
      localStorage.setItem('software_full_access_unlocked_v1', 'true');

      // 4. Trigger all cross-system events so Navigation and menus react immediately
      window.dispatchEvent(new CustomEvent('service-license-updated'));
      window.dispatchEvent(new CustomEvent('software-full-access-updated', { detail: { hasFullAccess: true } }));
      window.dispatchEvent(new CustomEvent('client-leads-updated'));
      window.dispatchEvent(new CustomEvent('subscription-status-updated'));

      setIsActivatingSet(false);
      setPaymentSuccessMessage('बधाई छ! ज्योतिष तथा वास्तु पूर्ण सेट (रु. १०,०००) सफलतापूर्वक सक्रिय भयो। अब मुख्य मेनुमा "ज्योतिष सेवा" र "वास्तु सेवा" पूर्ण रूपमा खुल्ला भएका छन्।');
      refreshState();
      setLicenseRev((v) => v + 1);
    }, 600);
  };

  const handleStartTrial = () => {
    start48HourTrial();
    refreshState();
  };

  const handleOpenCheckout = (plan: PlanConfig) => {
    // Duplicate subscription check
    if (status.isActive && (userAccount.currentPlanId === 'monthly' || userAccount.currentPlanId === 'yearly' || userAccount.currentPlanId === 'lifetime')) {
      alert('तपाईंको खातामा हाल सक्रिय सदस्यता रहेको छ। पुनः दोहोरो खरिद गर्न आवश्यक छैन।');
      return;
    }

    const currentPlat = userAccount.activePlatformMode || 'web';
    const calc = calculatePlatformPrice(plan.basePriceNPR, currentPlat, pricingConfig);

    let initialName = userAccount.fullName !== 'श्रद्धेय प्रयोगकर्ता' ? userAccount.fullName : '';
    let initialPhone = userAccount.phone !== '९८००००००००' ? userAccount.phone : '';
    let initialAddress = 'काठमाडौँ';
    try {
      const sessRaw = localStorage.getItem('balananda_rbac_session_v2');
      if (sessRaw) {
        const s = JSON.parse(sessRaw);
        if (s?.fullName) initialName = s.fullName;
        if (s?.phone) initialPhone = s.phone;
      }
      const profRaw = localStorage.getItem('balananda_personal_birth_profile');
      if (profRaw) {
        const p = JSON.parse(profRaw);
        if (p?.name && !initialName) initialName = p.name;
        if (p?.location?.name) initialAddress = p.location.name;
      }
    } catch {}

    setEsewaUserName(initialName);
    setEsewaUserPhone(initialPhone);
    setEsewaUserWhatsapp(initialPhone);
    setEsewaUserAddress(initialAddress);

    setSelectedPlanForPurchase(plan);
    setEsewaPaidAmount(calc.amountNPR);
    setEsewaTxnCode('');
    setEsewaProofNote('');
    setPaymentErrorMessage(null);
    setPaymentSuccessMessage(null);
    setSimulateFailure(false);
  };

  const handleCopyEsewaNumber = () => {
    try {
      navigator.clipboard.writeText(ESEWA_RECIPIENT_NUMBER_EN);
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEsewaProofSubmit = () => {
    if (!selectedPlanForPurchase) return;

    if (!esewaUserName.trim()) {
      setPaymentErrorMessage('कृपया आफ्नो पूरा नाम (Full Name) भर्नुहोस्।');
      return;
    }
    if (!esewaUserPhone.trim()) {
      setPaymentErrorMessage('कृपया आफ्नो मोबाइल नम्बर (Mobile No) भर्नुहोस्।');
      return;
    }
    if (!esewaTxnCode || esewaTxnCode.trim().length === 0) {
      setPaymentErrorMessage('कृपया eSewa कारोबार क्रमाङ्क (Transaction Code) अनिवार्य राख्नुहोस्।');
      return;
    }

    setIsProcessing(true);
    setPaymentErrorMessage(null);

    setTimeout(() => {
      setIsProcessing(false);
      const res = submitEsewaPaymentRequest({
        planId: selectedPlanForPurchase.id as 'monthly' | 'yearly' | 'lifetime',
        platformMode: userAccount.activePlatformMode || 'web',
        transactionCode: esewaTxnCode.trim(),
        submittedAmountNPR: esewaPaidAmount,
        paymentDateBS: esewaPaymentDateBS,
        proofNoteOrImage: esewaProofNote,
        userName: esewaUserName.trim(),
        userAddress: esewaUserAddress.trim() || 'काठमाडौँ',
        userPhone: esewaUserPhone.trim(),
        userWhatsapp: esewaUserWhatsapp.trim() || esewaUserPhone.trim()
      });

      if (res.success) {
        setPaymentSuccessMessage(res.messageNepali);
        refreshState();
        setTimeout(() => {
          setSelectedPlanForPurchase(null);
          setEsewaTxnCode('');
          setEsewaProofNote('');
        }, 2200);
      } else {
        setPaymentErrorMessage(res.messageNepali);
      }
    }, 800);
  };

  const handleExecutePurchase = () => {
    if (!selectedPlanForPurchase) return;

    if (selectedGateway.id === 'esewa') {
      handleEsewaProofSubmit();
      return;
    }

    if (selectedPlanForPurchase.id === 'free' || selectedPlanForPurchase.id === 'trial') return;

    setIsProcessing(true);
    setPaymentErrorMessage(null);

    setTimeout(() => {
      setIsProcessing(false);
      const result = processPlanPurchase(
        selectedPlanForPurchase.id as 'monthly' | 'yearly' | 'lifetime',
        selectedGateway.id,
        selectedGateway.nameNepali,
        userAccount.activePlatformMode || 'web',
        simulateFailure
      );

      if (result.success) {
        setPaymentSuccessMessage(result.messageNepali);
        refreshState();
        if (result.receipt) {
          setActiveReceipt(result.receipt);
        }
        setTimeout(() => {
          setSelectedPlanForPurchase(null);
        }, 1200);
      } else {
        setPaymentErrorMessage(result.messageNepali);
      }
    }, 1000);
  };

  const handleChangePlatformMode = (mode: PlatformType) => {
    const updated = { ...userAccount, activePlatformMode: mode };
    saveUserSubscription(updated);
    setUserAccount(updated);
  };

  // Calculate current dynamic platform price for selected platform
  const currentPlatform = userAccount.activePlatformMode || 'web';
  const monthlyCalc = calculatePlatformPrice(
    plans.find((p) => p.id === 'monthly')?.basePriceNPR || 600,
    currentPlatform,
    pricingConfig
  );
  const yearlyCalc = calculatePlatformPrice(
    plans.find((p) => p.id === 'yearly')?.basePriceNPR || 3000,
    currentPlatform,
    pricingConfig
  );
  const lifetimeCalc = calculatePlatformPrice(
    plans.find((p) => p.id === 'lifetime')?.basePriceNPR || 10000,
    currentPlatform,
    pricingConfig
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-2 sm:px-4 py-4 animate-in fade-in duration-200">
      
      {/* Top Banner & Platform Switcher */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-stone-100 p-6 rounded-3xl shadow-xl border border-stone-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                स्वाचालित प्लेटफर्म आधारित मूल्य प्रणाली
              </span>
              <span className="text-xs text-stone-400">एउटै खाता • एउटै सदस्यता</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold font-serif text-white tracking-wide">
              सदस्यता तथा खरिद सेवा (Membership Plans)
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl font-serif">
              तपाईं हाल <strong className="text-amber-400">{getPlatformNameNepali(currentPlatform)}</strong> प्रयोग गर्दै हुनुहुन्छ। खरिद गर्दा यसै प्लेटफर्मको लागू मूल्य प्रस्तुत गरिएको छ।
            </p>
          </div>

          {/* Platform Mode Selector */}
          <div className="flex items-center bg-stone-950/80 p-1.5 rounded-2xl border border-stone-800 self-stretch md:self-auto justify-center">
            <button
              onClick={() => handleChangePlatformMode('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentPlatform === 'desktop'
                  ? 'bg-[#D97706] text-white shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>कम्प्युटर (१००%)</span>
            </button>
            <button
              onClick={() => handleChangePlatformMode('web')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentPlatform === 'web'
                  ? 'bg-[#D97706] text-white shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>वेब ({toNepaliDigits(pricingConfig.webPercent)}%)</span>
            </button>
            <button
              onClick={() => handleChangePlatformMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentPlatform === 'mobile'
                  ? 'bg-[#D97706] text-white shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>मोबाइल ({toNepaliDigits(pricingConfig.mobilePercent)}%)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Duplicate Active Subscription Prevention Warning */}
      {status.isActive && (userAccount.currentPlanId === 'monthly' || userAccount.currentPlanId === 'yearly' || userAccount.currentPlanId === 'lifetime') && (
        <div className="bg-amber-500/15 dark:bg-amber-950/40 border-2 border-amber-500 text-amber-900 dark:text-amber-200 p-4 rounded-2xl shadow-sm flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm font-serif">
              तपाईंको खातामा हाल सक्रिय सदस्यता रहेको छ।
            </h3>
            <p className="text-xs">
              तपाईंको {status.planNameNepali} सक्रिय छ (समाप्ति मिति: {status.expiresDateBS})। एउटै खाताबाट मोबाइल, वेब र कम्प्युटर तीनै संस्करणमा समान रूपमा प्रयोग गर्न सक्नुहुन्छ।
            </p>
          </div>
        </div>
      )}

      {/* Expiry Warning */}
      {status.isTrialExpired && (
        <div className="bg-amber-500/15 dark:bg-amber-950/40 border-2 border-amber-500 text-amber-900 dark:text-amber-200 p-4 rounded-2xl shadow-sm flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm font-serif">
              तपाईंको ४८ घण्टे परीक्षण अवधि समाप्त भएको छ।
            </h3>
            <p className="text-xs">
              निरन्तर प्रयोगका लागि कृपया तलको कुनै एक सदस्यता योजना चयन गरी खरिद गर्नुहोस्। तपाईंको डाटा पूर्ण रूपमा सुरक्षित छ।
            </p>
          </div>
        </div>
      )}

      {/* Equal Cross-Platform Rights Clarification Callout */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 rounded-2xl flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200 font-serif">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">💡 सदस्यता अधिकार एउटै रहनेछ (Equal Multi-Platform Access):</span>
          <span>
            प्लेटफर्मअनुसार खरिद मूल्य फरक भए पनि सदस्यताको अधिकार फरक हुँदैन। उदाहरणका लागि: मोबाइलबाट {lifetimeCalc.formattedNepali} मा खरिद गरिएको सदस्यता मोबाइल, वेब र कम्प्युटर तीनै संस्करणमा जीवनभर लागू हुनेछ।
          </span>
        </div>
      </div>

      {/* 48-Hour Free Trial Spotlight Card */}
      {!status.isTrial && !status.isLifetime && status.effectivePlanId === 'free' && !status.isTrialExpired && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-amber-500/10 dark:from-amber-950/30 dark:to-amber-900/30 border-2 border-amber-400 dark:border-amber-600 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-[11px] font-extrabold uppercase tracking-wider inline-block">
              🎁 नयाँ प्रयोगकर्ताका लागि विशेष
            </span>
            <h2 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100">
              ४८ घण्टे नि:शुल्क पूर्ण परीक्षण योजना (48-Hour Free Trial)
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-300 font-serif max-w-xl">
              परीक्षण अवधिमा प्लेटफर्म अनुसार फरक मूल्य लागू हुँदैन। ४८ घण्टासम्म सम्पूर्ण सशुल्क ज्योतिषीय सुविधाहरू निःशुल्क अनुभव गर्नुहोस्।
            </p>
          </div>
          <button
            onClick={handleStartTrial}
            className="px-6 py-3 rounded-2xl bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-sm shadow-md hover:scale-105 transition-all flex items-center gap-2 shrink-0"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>४८ घण्टे परीक्षण सुरु गर्नुहोस्</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 विशेष ब्लक: ज्योतिष तथा वास्तु खरिद (कम्प्युटर + मोबाइल आजीवन रु. १०,०००) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-amber-500 bg-gradient-to-br from-[#200B0B] via-stone-900 to-[#10241A] text-stone-100 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/20 to-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-6">
          {/* Top Title & Badges */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/30 pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Crown className="w-3.5 h-3.5 fill-current" />
                  <span>आधिकारिक विशेष प्याकेज</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>कम्प्युटर + मोबाइल आजीवन सेट</span>
                </span>
                {isBothUnlocked && (
                  <span className="px-2.5 py-0.5 rounded-full bg-green-500 text-stone-950 text-[11px] font-black">
                    ✓ तपाईंको खातामा सक्रिय
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-serif text-white tracking-wide">
                ज्योतिष तथा वास्तु पूर्ण सेट (Jyotish & Vastu Full Lifetime Package)
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-2xl font-serif">
                कम्प्युटर र मोबाइल दुवैमा सधैँभरिका लागि पूर्ण पहुँच। यो सेट खरिद गरेपछि मात्र मुख्य नेभिगेसनमा <strong className="text-amber-300">"ज्योतिष सेवा"</strong> र <strong className="text-emerald-300">"वास्तु सेवा"</strong> मेनुहरू खुल्ला हुनेछन्।
              </p>
            </div>

            {/* Price Tag */}
            <div className="bg-stone-950/80 p-4 rounded-2xl border border-amber-500/40 text-center shrink-0 min-w-[200px]">
              <div className="text-[11px] text-stone-400 line-through">नियमित मूल्य: रु. १५,०००</div>
              <div className="text-3xl sm:text-4xl font-black font-serif text-amber-400">
                रु. १०,०००
              </div>
              <div className="text-[11px] text-stone-300 font-bold mt-0.5">
                एकपटक भुक्तानी • आजीवन असीमित
              </div>
            </div>
          </div>

          {/* Features Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-serif">
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-[13px]">सम्पूर्ण वैदिक ज्योतिष कार्यक्षेत्र</strong>
                <span className="text-stone-300 text-[11px]">बृहत् जन्मकुण्डली (D1 देखि D60), फलादेश, विंशोत्तरी दशा, प्रत्यक्ष गोचर, वर्षफल, प्रश्न, अङ्क, विवाह मिलान तथा गुण मिलान।</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10">
              <Compass className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-[13px]">सम्पूर्ण वैदिक वास्तुशास्त्र कार्यक्षेत्र</strong>
                <span className="text-stone-300 text-[11px]">३६०° डिजिटल कम्पास, ८१-पद वास्तु मण्डल, पञ्चतत्त्व सन्तुलन, ३२ द्वार तथा आवासीय/व्यावसायिक भवन अडिट।</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10">
              <Monitor className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-[13px]">कम्प्युटर + मोबाइल आजीवन पहुँच</strong>
                <span className="text-stone-300 text-[11px]">विन्डोज ल्यापटप/डेस्कटप, म्याक, एन्ड्रोइड तथा आईफोन मोबाइल सबैमा एउटै खाताबाट असीमित डिभाइसमा लगइन।</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10">
              <Award className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-[13px]">A4 प्रिन्ट तथा संस्थागत ब्रान्डिङ</strong>
                <span className="text-stone-300 text-[11px]">बृहत् चिना, पत्रिका, कुण्डली तथा वास्तु प्रतिवेदन A4 PDF मुद्रण, आफ्नै लेटरहेड/लोगो तथा २४/७ प्राथमिकता सहयोग।</span>
              </div>
            </div>
          </div>

          {/* Action or Active State */}
          {isBothUnlocked ? (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white font-serif">तपाईंको खातामा यो सेट सक्रिय भइसकेको छ!</h4>
                  <p className="text-xs text-stone-300 font-serif">मुख्य नेभिगेसन बारमा "ज्योतिष सेवा" र "वास्तु सेवा" मेनुहरू उपलब्ध छन्।</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.location.hash = '#jyotishi';
                    window.location.reload();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  ज्योतिष सेवा खोल्नुहोस् ↗
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.location.hash = '#vastu';
                    window.location.reload();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  वास्तु सेवा खोल्नुहोस् ↗
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {!showJyotishVastuCheckout ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-stone-950/60 border border-amber-500/30">
                  <div className="text-xs text-stone-300 font-serif">
                    <span className="text-amber-400 font-bold block mb-0.5">📌 सदस्यता सूचना:</span>
                    यो योजना खरिद गर्नासाथ तपाईंको खातामा ज्योतिष तथा वास्तु दुवै सेवाका सम्पूर्ण सुविधाहरू आजीवन खुल्नेछन्।
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowJyotishVastuCheckout(true)}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-stone-950 font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Crown className="w-4 h-4 fill-current" />
                    <span>ज्योतिष तथा वास्तु पूर्ण सेट खरिद गर्नुहोस् (रु. १०,०००)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Interactive Checkout Flow for Rs. 10,000 */
                <div className="p-5 sm:p-6 rounded-2xl bg-stone-950/90 border-2 border-amber-500 shadow-xl space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">💎</span>
                      <div>
                        <h4 className="font-bold text-sm text-white font-serif">भुक्तानी तथा सक्रियता (Payment & Instant Activation)</h4>
                        <span className="text-[11px] text-stone-400">रकम: रु. १०,००० (आजीवन सेट)</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowJyotishVastuCheckout(false)}
                      className="text-stone-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg bg-stone-800 cursor-pointer"
                    >
                      रद्द गर्नुहोस् ✕
                    </button>
                  </div>

                  {/* Payment Gateway Toggle */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setJyotishVastuGateway('esewa')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        jyotishVastuGateway === 'esewa'
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-sm'
                          : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center text-[10px]">✓</span>
                      <span>eSewa (ईसेवा): ९७६४४००५३३</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setJyotishVastuGateway('khalti')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        jyotishVastuGateway === 'khalti'
                          ? 'border-purple-500 bg-purple-500/20 text-purple-300 shadow-sm'
                          : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px]">✓</span>
                      <span>Khalti (खल्ती): ९७६४४००५३३</span>
                    </button>
                  </div>

                  {/* Account / QR Instructions */}
                  <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 text-xs text-stone-300 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>प्रापक नम्बर (Recipient No):</span>
                        <code className="text-amber-400 font-mono text-sm bg-stone-950 px-2 py-0.5 rounded border border-amber-500/40">
                          {ESEWA_RECIPIENT_NUMBER_EN}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyEsewaNumber}
                          className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedNumber ? 'प्रतिलिपि भयो!' : 'कपी'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-400">
                        eSewa वा Khalti एपबाट सोझै रु. १०,००० पठाएर तलको फारममा कारोबार कोड (Txn Code) राखी पेश गर्नुहोस्।
                      </p>
                    </div>
                  </div>

                  {/* Verification Form */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-300 mb-1">
                          प्रयोगकर्ताको पूरा नाम (Full Name):
                        </label>
                        <input
                          type="text"
                          value={esewaUserName}
                          onChange={(e) => setEsewaUserName(e.target.value)}
                          placeholder="उदा. सुवास भण्डारी"
                          className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-300 mb-1">
                          सम्पर्क मोबाइल नं. (Mobile / WhatsApp):
                        </label>
                        <input
                          type="tel"
                          value={esewaUserPhone}
                          onChange={(e) => setEsewaUserPhone(e.target.value)}
                          placeholder="९८XXXXXXXX"
                          className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-300 mb-1">
                        भुक्तानी कारोबार कोड (eSewa / Khalti Transaction ID):
                      </label>
                      <input
                        type="text"
                        value={jyotishVastuTxn}
                        onChange={(e) => setJyotishVastuTxn(e.target.value)}
                        placeholder="उदा. ESW98234123 वा KHL-982341"
                        className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <button
                        type="button"
                        disabled={isActivatingSet}
                        onClick={() => handlePurchaseJyotishVastuSet(false)}
                        className="flex-1 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>भुक्तानी कोड पेश गरी सक्रिय गर्नुहोस्</span>
                      </button>
                      <button
                        type="button"
                        disabled={isActivatingSet}
                        onClick={() => handlePurchaseJyotishVastuSet(true)}
                        className="flex-1 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        <span>तत्काल परीक्षण / आधिकारिक अनलक गर्नुहोस्</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3 Main Paid Plan Cards with Dynamic Calculated Prices */}
      <div className="space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-extrabold font-serif text-stone-900 dark:text-stone-100">
            सदस्यता योजनाहरू चयन गर्नुहोस् ({getPlatformNameNepali(currentPlatform)})
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 font-serif">
            नेपाली अङ्कमा लागू मूल्य • मोबाइल, वेब र कम्प्युटरमा साझा अधिकार
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Monthly Plan Card */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">अल्पकालीन</span>
                  <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100">मासिक सदस्यता</h3>
                </div>
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 text-xs font-bold">१ महिना</span>
              </div>

              <div className="py-2 border-y border-stone-100 dark:border-stone-800">
                <span className="text-3xl font-extrabold font-serif text-[#D97706]">
                  {monthlyCalc.formattedNepali}
                </span>
                <span className="text-xs text-stone-500 ml-1">/ १ महिना</span>
                {monthlyCalc.appliedPercent < 100 && (
                  <span className="block text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">
                    ({getPlatformNameNepali(currentPlatform)} {toNepaliDigits(monthlyCalc.appliedPercent)}% लागू)
                  </span>
                )}
              </div>

              <ul className="space-y-2.5 text-xs text-stone-700 dark:text-stone-300 font-serif">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>असीमित ग्राहक तथा कुण्डली अभिलेख</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>डिजिटल चिना, टिपण र विवाह पत्रिका</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>प्रत्यक्ष ग्रहदृष्टि नक्साङ्कन</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>वैदिक वास्तुशास्त्र चक्र विश्लेषण</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleOpenCheckout(plans.find((p) => p.id === 'monthly') || plans[2])}
              disabled={status.isActive && userAccount.currentPlanId !== 'free' && userAccount.currentPlanId !== 'trial'}
              className={`mt-6 w-full py-3 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                status.isActive && userAccount.currentPlanId !== 'free' && userAccount.currentPlanId !== 'trial'
                  ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                  : 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-[#D97706] dark:hover:bg-[#D97706] dark:hover:text-white'
              }`}
            >
              <span>मासिक खरिद गर्नुहोस् ({monthlyCalc.formattedNepali})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Yearly Plan Card - Featured */}
          <div className="bg-gradient-to-b from-amber-50/80 to-white dark:from-stone-900 dark:to-stone-950 border-2 border-amber-500 rounded-3xl p-6 shadow-xl relative flex flex-col justify-between transform md:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-[#D97706] text-white text-[11px] font-extrabold rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>लोकप्रिय तथा विशेष बचत</span>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider">दीर्घकालीन</span>
                  <h3 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">वार्षिक सदस्यता</h3>
                </div>
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold">१ वर्ष</span>
              </div>

              <div className="py-2 border-y border-amber-200 dark:border-stone-800">
                <span className="text-4xl font-extrabold font-serif text-[#D97706]">
                  {yearlyCalc.formattedNepali}
                </span>
                <span className="text-xs text-stone-500 ml-1">/ १ वर्ष</span>
                {yearlyCalc.appliedPercent < 100 && (
                  <span className="block text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">
                    ({getPlatformNameNepali(currentPlatform)} {toNepaliDigits(yearlyCalc.appliedPercent)}% लागू)
                  </span>
                )}
              </div>

              <ul className="space-y-2.5 text-xs text-stone-800 dark:text-stone-200 font-serif">
                <li className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>मासिक भन्दा भारी बचतसहित वार्षिक सुविधा</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>असीमित ग्राहक, कुण्डली र टिपण अभिलेख</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>उच्च गुणस्तरको चिना/पत्रिका प्रिन्ट र PDF</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>वैदिक वास्तु ३२ द्वार तथा ८ पद चक्र</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>आर्जे (Aarje) अनुसन्धान तथा नियम खोज</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleOpenCheckout(plans.find((p) => p.id === 'yearly') || plans[3])}
              disabled={status.isActive && userAccount.currentPlanId !== 'free' && userAccount.currentPlanId !== 'trial'}
              className={`mt-6 w-full py-3.5 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                status.isActive && userAccount.currentPlanId !== 'free' && userAccount.currentPlanId !== 'trial'
                  ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                  : 'bg-[#D97706] hover:bg-[#B45309] text-white hover:scale-[1.02]'
              }`}
            >
              <span>वार्षिक खरिद गर्नुहोस् ({yearlyCalc.formattedNepali})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Lifetime Plan Card */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">सधैँका लागि</span>
                  <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100">आजीवन सदस्यता</h3>
                </div>
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs font-bold">आजीवन</span>
              </div>

              <div className="py-2 border-y border-stone-100 dark:border-stone-800">
                <span className="text-3xl font-extrabold font-serif text-[#D97706]">
                  {lifetimeCalc.formattedNepali}
                </span>
                <span className="text-xs text-stone-500 ml-1">/ एकपटक भुक्तानी</span>
                {lifetimeCalc.appliedPercent < 100 && (
                  <span className="block text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">
                    ({getPlatformNameNepali(currentPlatform)} {toNepaliDigits(lifetimeCalc.appliedPercent)}% लागू)
                  </span>
                )}
              </div>

              <ul className="space-y-2.5 text-xs text-stone-700 dark:text-stone-300 font-serif">
                <li className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>पुनः कहिल्यै नवीकरण गर्नु नपर्ने</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>भविष्यमा आउने सबै नयाँ सुविधाहरू निःशुल्क</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>मोबाइल, वेब र कम्प्युटरमा जीवनभर पहुँच</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>प्राथमिकतामा आधारित विशेषज्ञ सहयोग</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleOpenCheckout(plans.find((p) => p.id === 'lifetime') || plans[4])}
              disabled={status.isActive && userAccount.currentPlanId !== 'free' && userAccount.currentPlanId !== 'trial'}
              className={`mt-6 w-full py-3 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                status.isActive && userAccount.currentPlanId !== 'free' && userAccount.currentPlanId !== 'trial'
                  ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                  : 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-[#D97706] dark:hover:bg-[#D97706] dark:hover:text-white'
              }`}
            >
              <span>आजीवन खरिद गर्नुहोस् ({lifetimeCalc.formattedNepali})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <h3 className="text-md font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D97706]" />
            <span>सदस्यता योजना तुलना (Plan Comparison Matrix)</span>
          </h3>
          <span className="text-xs text-stone-500 font-serif">प्रशासकद्वारा नियन्त्रित सुविधा अधिकार</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold border-b border-stone-200 dark:border-stone-700">
                <th className="p-3 text-left">ज्योतिषीय सुविधा (Feature)</th>
                <th className="p-3 text-center">निःशुल्क</th>
                <th className="p-3 text-center text-amber-700 dark:text-amber-300">४८ घण्टे परीक्षण</th>
                <th className="p-3 text-center">मासिक ({monthlyCalc.formattedNepali})</th>
                <th className="p-3 text-center text-[#D97706]">वार्षिक ({yearlyCalc.formattedNepali})</th>
                <th className="p-3 text-center">आजीवन ({lifetimeCalc.formattedNepali})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-serif">
              <tr>
                <td className="p-3 font-medium text-stone-900 dark:text-stone-100">दैनिक पञ्चाङ्ग तथा मुहूर्त</td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-stone-900 dark:text-stone-100">जन्मकुण्डली (D1) तथा सामान्य विवरण</td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-stone-900 dark:text-stone-100">असीमित ग्राहक तथा कुण्डली अभिलेख</td>
                <td className="p-3 text-center"><XCircle className="w-4 h-4 text-stone-300 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-stone-900 dark:text-stone-100">प्रत्यक्ष ग्रहदृष्टि नक्साङ्कन (Interactive Drishti)</td>
                <td className="p-3 text-center"><XCircle className="w-4 h-4 text-stone-300 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-stone-900 dark:text-stone-100">डिजिटल चिना, टिपण र विवाह पत्रिका छाप्ने र PDF</td>
                <td className="p-3 text-center"><XCircle className="w-4 h-4 text-stone-300 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-stone-900 dark:text-stone-100">वैदिक वास्तु ३२ द्वार तथा ८ पद चक्र</td>
                <td className="p-3 text-center"><XCircle className="w-4 h-4 text-stone-300 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                <td className="p-3 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Checkout Drawer / Modal */}
      {selectedPlanForPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-8">
            
            <div className="bg-stone-900 text-white p-5 flex items-center justify-between border-b border-stone-800">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">सुरक्षित भुक्तानी केन्द्र</span>
                <h3 className="text-base font-bold font-serif">{selectedPlanForPurchase.nameNepali} खरिद गर्नुहोस्</h3>
              </div>
              <button
                onClick={() => setSelectedPlanForPurchase(null)}
                className="p-1 rounded-full hover:bg-stone-800 text-stone-400 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              
              {/* Order Summary Box */}
              {(() => {
                const planCalc = calculatePlatformPrice(selectedPlanForPurchase.basePriceNPR, currentPlatform, pricingConfig);
                return (
                  <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-stone-500 dark:text-stone-400 block font-serif">भुक्तानी गर्नुपर्ने रकम ({getPlatformNameNepali(currentPlatform)}):</span>
                        <span className="text-2xl font-extrabold font-serif text-[#D97706]">
                          {planCalc.formattedNepali}
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 text-xs font-bold rounded-xl">
                        अवधि: {selectedPlanForPurchase.durationLabelNepali}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40 text-[11px] text-stone-600 dark:text-stone-300 flex justify-between font-serif">
                      <span>कम्प्युटर मूल मूल्य: {formatNPRCurrency(selectedPlanForPurchase.basePriceNPR)}</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        लागू प्रतिशत: {toNepaliDigits(planCalc.appliedPercent)}%
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300 font-serif">
                  भुक्तानी माध्यम चयन गर्नुहोस् (Select Payment Method):
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {gateways.map((gw) => (
                    <button
                      key={gw.id}
                      onClick={() => setSelectedGateway(gw)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs font-medium transition-all ${
                        selectedGateway.id === gw.id
                          ? 'bg-amber-500/15 border-[#D97706] dark:border-amber-500 text-stone-900 dark:text-stone-100 font-bold ring-2 ring-[#D97706]/30'
                          : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{gw.logoIcon}</span>
                        <span>{gw.nameNepali}</span>
                      </div>
                      {selectedGateway.id === gw.id && (
                        <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gateway Instructions & Specific Forms */}
              {selectedGateway.id === 'esewa' ? (
                <div className="space-y-4 pt-1">
                  
                  {/* eSewa Recipient Card */}
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-stone-900 dark:text-stone-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🟢</span>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">eSewa प्राप्तकर्ता नम्बर</span>
                          <span className="text-lg font-extrabold font-mono text-emerald-800 dark:text-emerald-300">
                            {ESEWA_RECIPIENT_NUMBER} ({ESEWA_RECIPIENT_NUMBER_EN})
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleCopyEsewaNumber}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
                      >
                        {copiedNumber ? '✓ कपी भयो!' : 'नम्बर कपी गर्नुहोस्'}
                      </button>
                    </div>
                  </div>

                  {/* Step-by-Step Instructions */}
                  <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 space-y-2 text-xs font-serif">
                    <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-[#D97706]" />
                      <span>eSewa बाट भुक्तानी गर्ने तरिका (Step-by-Step Instructions):</span>
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-stone-600 dark:text-stone-300 pl-1 leading-relaxed">
                      <li>eSewa एप वा वेबमा लगइन गरी "Send Money" वा "Scan QR" छान्नुहोस्।</li>
                      <li>प्राप्तकर्ता नम्बरमा <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{ESEWA_RECIPIENT_NUMBER}</strong> प्रयोग गर्नुहोस्।</li>
                      <li>
                        पठाउने रकममा देखाइएको सही रकम{' '}
                        <strong className="text-[#D97706]">
                          {calculatePlatformPrice(selectedPlanForPurchase.basePriceNPR, currentPlatform, pricingConfig).formattedNepali}
                        </strong>{' '}
                        राख्नुहोस्।
                      </li>
                      <li>भुक्तानी सफल भएपछि प्राप्त भएको कारोबार क्रमाङ्क (Transaction Code / Ref ID) तलको फारममा राखी पेश गर्नुहोस्।</li>
                    </ol>
                  </div>

                  {/* Payment Proof Submission Form */}
                  <div className="space-y-3 p-4 bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 rounded-2xl">
                    <h4 className="text-xs font-extrabold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>भुक्तानी प्रमाण विवरण (Payment Proof Form):</span>
                    </h4>

                    {/* 5-Field eSewa Application Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 font-serif mb-1">
                          पूरा नाम (Full Name) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={esewaUserName}
                          onChange={(e) => setEsewaUserName(e.target.value)}
                          placeholder="तपाईंको पूरा नाम"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-serif focus:ring-2 focus:ring-[#D97706] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 font-serif mb-1">
                          ठेगाना (Address) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={esewaUserAddress}
                          onChange={(e) => setEsewaUserAddress(e.target.value)}
                          placeholder="उदा: काठमाडौँ, पोखरा, वा जिल्ला"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-serif focus:ring-2 focus:ring-[#D97706] outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 font-serif mb-1">
                          मोबाइल नम्बर (Mobile No) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={esewaUserPhone}
                          onChange={(e) => setEsewaUserPhone(e.target.value)}
                          placeholder="उदा: 98XXXXXXXX"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono focus:ring-2 focus:ring-[#D97706] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 font-serif mb-1">
                          व्हाट्सएप नम्बर (WhatsApp No)
                        </label>
                        <input
                          type="tel"
                          value={esewaUserWhatsapp}
                          onChange={(e) => setEsewaUserWhatsapp(e.target.value)}
                          placeholder="उदा: 98XXXXXXXX"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono focus:ring-2 focus:ring-[#D97706] outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 font-serif mb-1">
                          कारोबार क्रमाङ्क (Transaction Code / Ref ID) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={esewaTxnCode}
                          onChange={(e) => setEsewaTxnCode(e.target.value)}
                          placeholder="उदा: 9X82K102 वा ESW9821034"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono focus:ring-2 focus:ring-[#D97706] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 font-serif mb-1">
                          भुक्तानी रकम (NPR)
                        </label>
                        <input
                          type="number"
                          value={esewaPaidAmount}
                          onChange={(e) => setEsewaPaidAmount(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono focus:ring-2 focus:ring-[#D97706] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 font-serif mb-1">
                        भुक्तानी मिति (वि.सं.)
                      </label>
                      <input
                        type="text"
                        value={esewaPaymentDateBS}
                        onChange={(e) => setEsewaPaymentDateBS(e.target.value)}
                        placeholder="उदा: २०८३/०४/२०"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono focus:ring-2 focus:ring-[#D97706] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 font-serif mb-1">
                        भुक्तानीको प्रमाण / ट्रान्सफर टिप्पणी (Proof / Note / Remitter Name)
                      </label>
                      <textarea
                        rows={2}
                        value={esewaProofNote}
                        onChange={(e) => setEsewaProofNote(e.target.value)}
                        placeholder="उदा: रामचन्द्र शर्माको eSewa ID ९८४१२३४५६७ बाट रु. २२५० रकमान्तर गरिएको छ।"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-serif focus:ring-2 focus:ring-[#D97706] outline-none"
                      />
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-900 dark:text-amber-200 font-serif leading-relaxed">
                      🔒 <strong>सुरक्षा नियम:</strong> भुक्तानी प्रमाण दर्ता गरेपछि प्रशासकले प्रमाणीकरण गरी स्वीकृत गरेपछि मात्र तपाईंको सदस्यता सक्रिय हुनेछ। प्रमाणीकरण नभएसम्म सदस्यता सक्रिय हुने छैन।
                    </div>
                  </div>

                </div>
              ) : (
                <>
                  {/* Gateway Instructions */}
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 font-serif bg-stone-100 dark:bg-stone-800/60 p-3 rounded-xl">
                    ℹ️ {selectedGateway.instructionsNepali}
                  </p>

                  {/* Simulated Failure Test Toggle */}
                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                    <span className="text-stone-500 font-serif">भुक्तानी असफलता परीक्षण मोड:</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={simulateFailure}
                        onChange={(e) => setSimulateFailure(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>
                </>
              )}

              {/* Error or Success Messages */}
              {paymentErrorMessage && (
                <div className="p-3 bg-red-100 dark:bg-red-950/50 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 text-xs rounded-xl flex items-center gap-2">
                  <XCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{paymentErrorMessage}</span>
                </div>
              )}

              {paymentSuccessMessage && (
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{paymentSuccessMessage}</span>
                </div>
              )}

              {/* Execute Payment Button */}
              <button
                onClick={handleExecutePurchase}
                disabled={isProcessing}
                className={`w-full py-3.5 rounded-2xl bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                  isProcessing ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isProcessing ? (
                  <span>प्रमाणीकरण अनुरोध दर्ता हुँदैछ...</span>
                ) : selectedGateway.id === 'esewa' ? (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>eSewa भुक्तानी प्रमाण पेश गर्नुहोस्</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      भुक्तानी पूरा गर्नुहोस् ({calculatePlatformPrice(selectedPlanForPurchase.basePriceNPR, currentPlatform, pricingConfig).formattedNepali})
                    </span>
                  </>
                )}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* Active Receipt Modal */}
      {activeReceipt && (
        <ReceiptPrintModal
          isOpen={true}
          onClose={() => setActiveReceipt(null)}
          receipt={activeReceipt}
          userAccount={userAccount}
          orgProfile={orgProfile}
        />
      )}

    </div>
  );
};
