import React, { useState } from 'react';
import {
  PlanConfig,
  FeaturePermissionRule,
  SubscriptionPlanId,
  PricingConfig,
  EsewaPaymentRequest,
  EsewaIntegrationConfig,
  getStoredPlansConfig,
  savePlansConfig,
  getStoredPricingConfig,
  savePricingConfig,
  calculatePlatformPrice,
  getStoredFeatureRules,
  saveFeatureRules,
  getStoredUserSubscription,
  saveUserSubscription,
  getStoredEsewaRequests,
  approveEsewaPaymentRequest,
  rejectEsewaPaymentRequest,
  cancelEsewaPaymentRequest,
  getStoredEsewaConfig,
  saveEsewaConfig,
  ESEWA_RECIPIENT_NUMBER,
  toNepaliDigits,
  formatNPRCurrency,
  UserSubscriptionAccount
} from '../db/subscriptionStore';
import {
  Users,
  ShieldCheck,
  Settings2,
  DollarSign,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit2,
  Save,
  Percent,
  Smartphone,
  Globe2,
  Monitor,
  Calculator,
  Hourglass,
  Check,
  X,
  CreditCard
} from 'lucide-react';

export const AdminSubscriptionManagement: React.FC = () => {
  const [plans, setPlans] = useState<PlanConfig[]>(getStoredPlansConfig());
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(getStoredPricingConfig());
  const [featureRules, setFeatureRules] = useState<FeaturePermissionRule[]>(getStoredFeatureRules());
  const [activeUserAcc, setActiveUserAcc] = useState<UserSubscriptionAccount>(getStoredUserSubscription());

  // eSewa Management State
  const [esewaRequests, setEsewaRequests] = useState<EsewaPaymentRequest[]>(getStoredEsewaRequests());
  const [esewaFilter, setEsewaFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'mismatch'>('all');
  const [esewaConfig, setEsewaConfig] = useState<EsewaIntegrationConfig>(getStoredEsewaConfig());

  // Filter tab for members list
  const [memberFilter, setMemberFilter] = useState<'all' | 'free' | 'trial' | 'monthly' | 'yearly' | 'lifetime' | 'suspended'>('all');

  // Editing state for plans base prices
  const [editingPlanId, setEditingPlanId] = useState<SubscriptionPlanId | null>(null);
  const [tempBasePriceNPR, setTempBasePriceNPR] = useState<number>(0);

  // Notification message
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const refreshEsewaRequests = () => {
    setEsewaRequests(getStoredEsewaRequests());
    setActiveUserAcc(getStoredUserSubscription());
  };

  const handleApproveEsewa = (reqId: string) => {
    const res = approveEsewaPaymentRequest(reqId);
    if (res.success) {
      setSaveSuccessMsg(res.messageNepali);
      refreshEsewaRequests();
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  const handleRejectEsewa = (reqId: string) => {
    const res = rejectEsewaPaymentRequest(reqId);
    if (res.success) {
      setSaveSuccessMsg(res.messageNepali);
      refreshEsewaRequests();
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    }
  };

  const handleCancelEsewa = (reqId: string) => {
    const res = cancelEsewaPaymentRequest(reqId);
    if (res.success) {
      setSaveSuccessMsg(res.messageNepali);
      refreshEsewaRequests();
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  const handleSaveEsewaConfig = (newCfg: EsewaIntegrationConfig) => {
    setEsewaConfig(newCfg);
    saveEsewaConfig(newCfg);
    setSaveSuccessMsg('eSewa गेटवे एकीकरण ढाँचा सफलतापुर्वक अद्यावधिक गरियो।');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Handle Base Price Save
  const handleSavePlanBasePrice = (planId: SubscriptionPlanId) => {
    const updatedPlans = plans.map((p) => {
      if (p.id === planId) {
        return {
          ...p,
          basePriceNPR: tempBasePriceNPR,
          basePriceFormattedNepali: formatNPRCurrency(tempBasePriceNPR),
        };
      }
      return p;
    });

    setPlans(updatedPlans);
    savePlansConfig(updatedPlans);
    setEditingPlanId(null);
    setSaveSuccessMsg(`कम्प्युटर मूल आधार मूल्य सफलतापूर्वक रु. ${toNepaliDigits(tempBasePriceNPR.toLocaleString('en-IN'))} मा अद्यावधिक गरियो। वेब र मोबाइलको मूल्य स्वतः परिवर्तन भयो।`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Handle Percentage Settings Save
  const handleSavePricingConfig = (newConfig: PricingConfig) => {
    setPricingConfig(newConfig);
    savePricingConfig(newConfig);
    setSaveSuccessMsg('प्लेटफर्म मूल्य प्रतिशत र दशमलव रूपान्तरण नियम सफलतापूर्वक अद्यावधिक गरियो।');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleToggleFeaturePlan = (featureKey: string, planId: SubscriptionPlanId) => {
    const updatedRules = featureRules.map((rule) => {
      if (rule.featureKey === featureKey) {
        const hasPlan = rule.allowedPlans.includes(planId);
        const nextPlans = hasPlan
          ? rule.allowedPlans.filter((p) => p !== planId)
          : [...rule.allowedPlans, planId];
        return { ...rule, allowedPlans: nextPlans };
      }
      return rule;
    });

    setFeatureRules(updatedRules);
    saveFeatureRules(updatedRules);
  };

  const handleToggleUserSuspension = () => {
    const updatedAcc = {
      ...activeUserAcc,
      isSuspended: !activeUserAcc.isSuspended,
      suspensionReasonNepali: !activeUserAcc.isSuspended ? 'प्रशासकद्वारा नियम उल्लङ्घनका कारण खाता निलम्बित।' : undefined,
    };
    setActiveUserAcc(updatedAcc);
    saveUserSubscription(updatedAcc);
  };

  const handleChangeUserPlanByAdmin = (newPlanId: SubscriptionPlanId) => {
    const nowISO = new Date().toISOString();
    let expireISO: string | null = null;
    if (newPlanId === 'monthly') {
      expireISO = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (newPlanId === 'yearly') {
      expireISO = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    }

    const updatedAcc = {
      ...activeUserAcc,
      currentPlanId: newPlanId,
      subscriptionStartedAtISO: nowISO,
      subscriptionExpiresAtISO: expireISO,
    };
    setActiveUserAcc(updatedAcc);
    saveUserSubscription(updatedAcc);
    setSaveSuccessMsg(`प्रयोगकर्ताको सदस्यता प्रशासकद्वारा ${newPlanId} मा परिवर्तन गरियो।`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-2 sm:px-4 py-4 animate-in fade-in duration-200 font-serif">
      
      {/* Title Header */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/15 text-[#D97706] rounded-2xl">
            <Settings2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
              प्रशासकीय सदस्यता तथा केन्द्रीय मूल्य नियन्त्रण कक्ष
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              कम्प्युटर मूल मूल्य, वेब/मोबाइल प्रतिशत दर र सुविधाहरूको प्रशासकीय नियन्त्रण
            </p>
          </div>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* SECTION 1: Central Platform Pricing Percentage Controls */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <h2 className="text-md font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Percent className="w-4 h-4 text-[#D97706]" />
            <span>केन्द्रीय मूल्य प्रतिशत र रूपान्तरण नियम (Platform Percentages & Rounding)</span>
          </h2>
          <span className="text-xs text-stone-500">प्रारम्भिक मान: वेब = ७५% | मोबाइल = ५०%</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Computer Base Percent (100% Fixed) */}
          <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2">
            <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200">
              <Monitor className="w-4 h-4 text-amber-600" />
              <span className="font-bold text-xs">कम्प्युटर मूल मूल्य प्रतिशत:</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-extrabold text-stone-900 dark:text-stone-100 font-mono">
                {toNepaliDigits(pricingConfig.desktopPercent)}%
              </span>
              <span className="text-[11px] px-2 py-0.5 bg-amber-500/20 text-[#D97706] font-bold rounded">
                १००% आधार (Base)
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              कम्प्युटर संस्करणलाई मुख्य १००% मूल आधार मूल्य मानिन्छ।
            </p>
          </div>

          {/* Web Percent Editor */}
          <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2">
            <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200">
              <Globe2 className="w-4 h-4 text-amber-600" />
              <span className="font-bold text-xs">वेब संस्करण मूल्य प्रतिशत:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="10"
                max="200"
                value={pricingConfig.webPercent}
                onChange={(e) =>
                  handleSavePricingConfig({
                    ...pricingConfig,
                    webPercent: Number(e.target.value),
                  })
                }
                className="w-24 p-2 rounded-xl border border-amber-500 bg-white dark:bg-stone-900 text-sm font-extrabold font-mono text-stone-900 dark:text-stone-100"
              />
              <span className="text-sm font-bold">%</span>
            </div>
            <p className="text-[11px] text-stone-500">
              मूल्य = मूल मूल्य × {toNepaliDigits(pricingConfig.webPercent)}%
            </p>
          </div>

          {/* Mobile Percent Editor */}
          <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-2">
            <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200">
              <Smartphone className="w-4 h-4 text-amber-600" />
              <span className="font-bold text-xs">मोबाइल संस्करण मूल्य प्रतिशत:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="10"
                max="200"
                value={pricingConfig.mobilePercent}
                onChange={(e) =>
                  handleSavePricingConfig({
                    ...pricingConfig,
                    mobilePercent: Number(e.target.value),
                  })
                }
                className="w-24 p-2 rounded-xl border border-amber-500 bg-white dark:bg-stone-900 text-sm font-extrabold font-mono text-stone-900 dark:text-stone-100"
              />
              <span className="text-sm font-bold">%</span>
            </div>
            <p className="text-[11px] text-stone-500">
              मूल्य = मूल मूल्य × {toNepaliDigits(pricingConfig.mobilePercent)}%
            </p>
          </div>

        </div>

        {/* Rounding Rule Selector */}
        <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-stone-800 dark:text-stone-200 text-xs">
            <Calculator className="w-4 h-4 text-[#D97706]" />
            <div>
              <span className="font-bold block">मूल्यमा दशमलव आएमा रूपान्तरण नियम (Rounding Rule):</span>
              <span className="text-[11px] text-stone-500">प्रतिशत निकाल्दा पैसा/दशमलव आएमा नेपाली रुपैयाँमा पूर्ण अङ्क बनाउने नियम</span>
            </div>
          </div>

          <select
            value={pricingConfig.roundingRule}
            onChange={(e) =>
              handleSavePricingConfig({
                ...pricingConfig,
                roundingRule: e.target.value as 'round' | 'floor' | 'ceil',
              })
            }
            className="p-2 rounded-xl border border-amber-500 bg-white dark:bg-stone-900 text-xs font-bold text-stone-900 dark:text-stone-100"
          >
            <option value="round">निकटतम रुपैयाँमा (Nearest Integer - Math.round)</option>
            <option value="floor">तल्लो रुपैयाँमा (Floor Integer - Math.floor)</option>
            <option value="ceil">माथिल्लो रुपैयाँमा (Ceil Integer - Math.ceil)</option>
          </select>
        </div>
      </div>

      {/* SECTION 2: Edit Base Prices & Dynamic Live Calculation Preview */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <h2 className="text-md font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#D97706]" />
            <span>मूल सदस्यता मूल्य तथा स्वचालित प्लेटफर्म मूल्य (Base Prices & Calculated Matrix)</span>
          </h2>
          <span className="text-xs text-stone-500">प्रशासकले मूल मूल्य परिवर्तन गर्दा वेब र मोबाइलको मूल्य स्वतः अद्यावधिक हुन्छ।</span>
        </div>

        {/* Base Price Editor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.filter((p) => p.id !== 'free' && p.id !== 'trial').map((plan) => {
            const isEditing = editingPlanId === plan.id;

            return (
              <div key={plan.id} className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-stone-900 dark:text-stone-100">{plan.nameNepali}</span>
                  <span className="text-xs text-stone-500 font-mono">({plan.durationLabelNepali})</span>
                </div>

                <div className="pt-2 border-t border-stone-200 dark:border-stone-700 space-y-2">
                  <span className="text-[11px] text-stone-500 block">कम्प्युटर (१००% मूल मूल्य):</span>
                  {isEditing ? (
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-xs font-bold">रु.</span>
                      <input
                        type="number"
                        value={tempBasePriceNPR}
                        onChange={(e) => setTempBasePriceNPR(Number(e.target.value))}
                        className="w-full p-1.5 rounded-lg border border-amber-500 bg-white dark:bg-stone-900 text-xs font-bold font-mono"
                      />
                      <button
                        onClick={() => handleSavePlanBasePrice(plan.id)}
                        className="p-1.5 bg-[#D97706] text-white rounded-lg text-xs font-bold shrink-0"
                      >
                        <Save className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-extrabold text-[#D97706] font-serif">
                        {plan.basePriceFormattedNepali || formatNPRCurrency(plan.basePriceNPR)}
                      </span>
                      <button
                        onClick={() => {
                          setEditingPlanId(plan.id);
                          setTempBasePriceNPR(plan.basePriceNPR);
                        }}
                        className="px-2.5 py-1 bg-stone-200 dark:bg-stone-700 hover:bg-amber-500/20 hover:text-[#D97706] rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>मूल्य फेर्नुहोस्</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Automatic Platform Pricing Matrix Table */}
        <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-2">
          <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
            📊 स्वचालित गणना गरिएको प्लेटफर्म मूल्य तालिका (Live Calculated Pricing Matrix)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="bg-amber-100 dark:bg-stone-800 text-amber-900 dark:text-amber-200 font-bold border-b border-amber-300 dark:border-stone-700">
                  <th className="p-2.5">सदस्यता योजना</th>
                  <th className="p-2.5 text-center">कम्प्युटर (१००% मूल)</th>
                  <th className="p-2.5 text-center text-amber-800 dark:text-amber-300">
                    वेब ({toNepaliDigits(pricingConfig.webPercent)}%)
                  </th>
                  <th className="p-2.5 text-center text-emerald-800 dark:text-emerald-300">
                    मोबाइल ({toNepaliDigits(pricingConfig.mobilePercent)}%)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {plans.filter((p) => p.id !== 'free' && p.id !== 'trial').map((plan) => {
                  const desk = calculatePlatformPrice(plan.basePriceNPR, 'desktop', pricingConfig);
                  const web = calculatePlatformPrice(plan.basePriceNPR, 'web', pricingConfig);
                  const mob = calculatePlatformPrice(plan.basePriceNPR, 'mobile', pricingConfig);

                  return (
                    <tr key={plan.id} className="hover:bg-amber-50/50 dark:hover:bg-stone-800/40">
                      <td className="p-2.5 font-bold text-stone-900 dark:text-stone-100">
                        {plan.nameNepali} <span className="text-[10px] text-stone-500 font-normal">({plan.durationLabelNepali})</span>
                      </td>
                      <td className="p-2.5 text-center font-bold text-stone-900 dark:text-stone-100 font-mono">
                        {desk.formattedNepali}
                      </td>
                      <td className="p-2.5 text-center font-extrabold text-[#D97706] font-mono">
                        {web.formattedNepali}
                      </td>
                      <td className="p-2.5 text-center font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
                        {mob.formattedNepali}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* SECTION 3: Feature Permissions Matrix */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <h2 className="text-md font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D97706]" />
            <span>सुविधा अधिकार व्यवस्थापन (Feature Access Permissions Matrix)</span>
          </h2>
          <span className="text-xs text-stone-500">कुन योजनामा कुन सुविधा उपलब्ध हुने प्रशासकले यहाँबाट निर्धारण गर्नुहोस्</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold border-b border-stone-200 dark:border-stone-700">
                <th className="p-3 text-left">सुविधा विवरण (Feature Name)</th>
                <th className="p-3 text-center">निःशुल्क</th>
                <th className="p-3 text-center text-amber-700">परीक्षण</th>
                <th className="p-3 text-center">मासिक</th>
                <th className="p-3 text-center text-[#D97706]">वार्षिक</th>
                <th className="p-3 text-center">आजीवन</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {featureRules.map((rule) => (
                <tr key={rule.featureKey} className="hover:bg-amber-500/5 transition-colors">
                  <td className="p-3">
                    <span className="font-bold text-stone-900 dark:text-stone-100 block">
                      {rule.featureNameNepali}
                    </span>
                    <span className="text-[10px] text-stone-500">{rule.descriptionNepali}</span>
                  </td>
                  {(['free', 'trial', 'monthly', 'yearly', 'lifetime'] as SubscriptionPlanId[]).map((planId) => {
                    const isAllowed = rule.allowedPlans.includes(planId);
                    return (
                      <td key={planId} className="p-3 text-center">
                        <button
                          onClick={() => handleToggleFeaturePlan(rule.featureKey, planId)}
                          className={`w-6 h-6 rounded-md font-bold transition-all mx-auto flex items-center justify-center ${
                            isAllowed ? 'bg-emerald-600 text-white shadow-sm' : 'bg-stone-200 dark:bg-stone-700 text-stone-400'
                          }`}
                        >
                          {isAllowed ? '✓' : '✕'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: Member Directory & Account Controls */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <h2 className="text-md font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#D97706]" />
            <span>सबै सदस्य अभिलेख तथा निलम्बन नियन्त्रण (Subscribers Directory)</span>
          </h2>
          <span className="text-xs text-stone-500">नियम उल्लङ्घनमा खाता निलम्बित गर्ने प्रशासकीय अधिकार</span>
        </div>

        {/* Member Filter Pills */}
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          {[
            { id: 'all', label: 'सबै सदस्य' },
            { id: 'free', label: 'निःशुल्क' },
            { id: 'trial', label: 'परीक्षण' },
            { id: 'monthly', label: 'मासिक' },
            { id: 'yearly', label: 'वार्षिक' },
            { id: 'lifetime', label: 'आजीवन' },
            { id: 'suspended', label: 'निलम्बित' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setMemberFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                memberFilter === f.id
                  ? 'bg-[#D97706] text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Active Demo User Account Box */}
        <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                {activeUserAcc.fullName}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 bg-amber-500/20 text-[#D97706] rounded-md font-bold">
                योजना: {activeUserAcc.currentPlanId}
              </span>
              {activeUserAcc.isSuspended && (
                <span className="text-xs font-bold px-2 py-0.5 bg-red-600 text-white rounded-md">
                  निलम्बित (SUSPENDED)
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 font-mono">
              इमेल: {activeUserAcc.email} | फोन: {activeUserAcc.phone}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleChangeUserPlanByAdmin('lifetime')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              आजीवन योजना दिनुहोस्
            </button>
            <button
              onClick={handleToggleUserSuspension}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1 ${
                activeUserAcc.isSuspended
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {activeUserAcc.isSuspended ? (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>पुनः सक्रिय गर्नुहोस्</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>खाता निलम्बन गर्नुहोस्</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* SECTION 5: eSewa Payment Verification Management */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🟢</span>
              <h2 className="text-md font-bold text-stone-900 dark:text-stone-100 font-serif">
                eSewa भुक्तानी प्रमाणीकरण व्यवस्थापन (eSewa Payment Verification Management)
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              प्राप्तकर्ता नम्बर <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{ESEWA_RECIPIENT_NUMBER}</strong> मा प्राप्त भुक्तानी प्रमाणको प्रमाणीकरण र स्वीकृति
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="px-3 py-1 bg-amber-500/15 text-[#D97706] rounded-xl border border-amber-500/30">
              ⏳ प्रमाणीकरण बाँकी: {toNepaliDigits(esewaRequests.filter((r) => r.status === 'pending').length)}
            </span>
            {esewaRequests.filter((r) => r.isAmountMismatch).length > 0 && (
              <span className="px-3 py-1 bg-red-500/15 text-red-600 rounded-xl border border-red-500/30">
                ⚠️ रकम फरक: {toNepaliDigits(esewaRequests.filter((r) => r.isAmountMismatch).length)}
              </span>
            )}
          </div>
        </div>

        {/* Filter Pills for eSewa Submissions */}
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          {[
            { id: 'all', label: `सबै प्रमाण (${toNepaliDigits(esewaRequests.length)})` },
            { id: 'pending', label: `प्रमाणीकरण बाँकी (${toNepaliDigits(esewaRequests.filter((r) => r.status === 'pending').length)})` },
            { id: 'mismatch', label: `⚠️ रकम नमिलेको (${toNepaliDigits(esewaRequests.filter((r) => r.isAmountMismatch).length)})` },
            { id: 'approved', label: `स्वीकृत (${toNepaliDigits(esewaRequests.filter((r) => r.status === 'approved').length)})` },
            { id: 'rejected', label: `अस्वीकृत (${toNepaliDigits(esewaRequests.filter((r) => r.status === 'rejected').length)})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setEsewaFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                esewaFilter === f.id
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* eSewa Requests List / Table */}
        {esewaRequests.length === 0 ? (
          <div className="text-center py-8 text-stone-500 dark:text-stone-400 text-xs font-serif">
            हालसम्म कुनै पनि eSewa भुक्तानी प्रमाण दर्ता भएको छैन।
          </div>
        ) : (
          <div className="space-y-3 font-serif">
            {esewaRequests
              .filter((req) => {
                if (esewaFilter === 'pending') return req.status === 'pending';
                if (esewaFilter === 'approved') return req.status === 'approved';
                if (esewaFilter === 'rejected') return req.status === 'rejected';
                if (esewaFilter === 'mismatch') return req.isAmountMismatch;
                return true;
              })
              .map((req) => (
                <div
                  key={req.requestId}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    req.status === 'pending'
                      ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                      : req.status === 'approved'
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-stone-200/60 dark:border-stone-800 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-stone-900 dark:text-stone-100">
                          {req.userName}
                        </span>
                        <span className="text-xs text-stone-500 font-mono">({req.userPhone})</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'pending'
                            ? 'bg-amber-200 text-amber-900 border border-amber-300'
                            : req.status === 'approved'
                            ? 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                            : 'bg-red-200 text-red-900 border border-red-300'
                        }`}>
                          {req.status === 'pending' && '⏳ '}
                          {req.status === 'approved' && '✓ '}
                          {req.status === 'rejected' && '✕ '}
                          {req.statusNepali}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-mono">इमेल: {req.userEmail} | माग मिति: {req.paymentDateBS}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                        योजना: {req.planNameNepali} ({req.platformNameNepali})
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">{req.requestId}</span>
                    </div>
                  </div>

                  {/* Transaction Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono bg-white/80 dark:bg-stone-900/80 p-3 rounded-xl border border-stone-200/80 dark:border-stone-800">
                    <div>
                      <span className="text-[10px] text-stone-500 block font-serif">eSewa कारोबार कोड (Transaction ID):</span>
                      <strong className="text-emerald-700 dark:text-emerald-400 text-sm">{req.transactionCode}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-500 block font-serif">पेश गरिएको रकम:</span>
                      <strong className={`text-sm ${req.isAmountMismatch ? 'text-red-600 font-extrabold' : 'text-stone-900 dark:text-stone-100'}`}>
                        {req.submittedAmountFormattedNepali}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-500 block font-serif">अपेक्षित मूल्य (Calculated Price):</span>
                      <strong className="text-stone-900 dark:text-stone-100 text-sm">
                        {req.expectedAmountFormattedNepali}
                      </strong>
                    </div>
                  </div>

                  {/* Mismatch Alert Box */}
                  {req.isAmountMismatch && (
                    <div className="p-2.5 bg-red-100 dark:bg-red-950/60 border border-red-300 text-red-800 dark:text-red-200 text-xs rounded-xl flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>
                        ⚠️ ध्यान दिनुहोस्: पेश गरिएको रकम ({req.submittedAmountFormattedNepali}) अपेक्षित मूल्य ({req.expectedAmountFormattedNepali}) सँग मिलेन। प्रमाणीकरण अघि जाँच गर्नुहोस्।
                      </span>
                    </div>
                  )}

                  {/* Proof Note */}
                  <p className="text-xs text-stone-600 dark:text-stone-300 bg-stone-100/80 dark:bg-stone-800/60 p-2.5 rounded-xl border border-stone-200/60 dark:border-stone-700">
                    <strong>भुक्तानी प्रमाण टिप्पणी:</strong> {req.proofNoteOrImage || 'कुनै अतिरिक्त टिप्पणी छैन।'}
                  </p>

                  {/* Admin Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-stone-400">
                      {req.reviewedAtISO ? `प्रमाणीकरण मिति: ${req.reviewedAtISO.split('T')[0]}` : 'प्रमाणीकरण पर्खाइमा...'}
                    </span>

                    <div className="flex items-center gap-2">
                      {req.status !== 'approved' && (
                        <button
                          onClick={() => handleApproveEsewa(req.requestId)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>स्वीकृत गर्ने (Approve)</span>
                        </button>
                      )}

                      {req.status !== 'rejected' && (
                        <button
                          onClick={() => handleRejectEsewa(req.requestId)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>अस्वीकृत गर्ने (Reject)</span>
                        </button>
                      )}

                      {req.status === 'pending' && (
                        <button
                          onClick={() => handleCancelEsewa(req.requestId)}
                          className="px-2.5 py-1.5 bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-300 rounded-xl text-xs font-bold transition-all"
                        >
                          रद्द गर्ने
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))}
          </div>
        )}
      </div>

      {/* SECTION 6: Future eSewa Merchant API Settings */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
          <h2 className="text-md font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#D97706]" />
            <span>भविष्यको eSewa गेटवे एकीकरण ढाँचा (Future eSewa Merchant API Integration Settings)</span>
          </h2>
          <span className="text-xs text-stone-500 font-mono">संरचना तयारी</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3">
            <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
              eSewa एकीकरण प्रकार (Integration Mode):
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="radio"
                  name="esewaMode"
                  checked={esewaConfig.mode === 'manual'}
                  onChange={() => handleSaveEsewaConfig({ ...esewaConfig, mode: 'manual' })}
                  className="accent-[#D97706]"
                />
                <span>म्यानुअल प्रमाणीकरण (Manual Verification)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="radio"
                  name="esewaMode"
                  checked={esewaConfig.mode === 'merchant_api'}
                  onChange={() => handleSaveEsewaConfig({ ...esewaConfig, mode: 'merchant_api' })}
                  className="accent-[#D97706]"
                />
                <span>आधिकारिक Merchant API</span>
              </label>
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              हाल 'म्यानुअल प्रमाणीकरण' सक्रिय छ। यस मोडमा प्रयोगकर्ताले पेश गरेको eSewa कारोबार प्रमाणीकरण पछि मात्र सदस्यता स्वतः सक्रिय हुन्छ।
            </p>
          </div>

          <div className="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3">
            <label className="block text-xs font-bold text-stone-800 dark:text-stone-200">
              भविष्यका लागि eSewa Merchant विवरण (API Credentials):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-stone-500 block">Merchant Code:</span>
                <input
                  type="text"
                  value={esewaConfig.merchantId || ''}
                  onChange={(e) => setEsewaConfig({ ...esewaConfig, merchantId: e.target.value })}
                  placeholder="EPAYTEST"
                  className="w-full p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-stone-500 block">Secret Key:</span>
                <input
                  type="password"
                  value={esewaConfig.secretKey || ''}
                  onChange={(e) => setEsewaConfig({ ...esewaConfig, secretKey: e.target.value })}
                  placeholder="8gAkyRykSAsA"
                  className="w-full p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-mono"
                />
              </div>
            </div>
            <div className="flex justify-between items-center pt-1">
              <label className="flex items-center gap-1.5 text-[11px] text-stone-600 dark:text-stone-300">
                <input
                  type="checkbox"
                  checked={esewaConfig.isTestEnvironment}
                  onChange={(e) => setEsewaConfig({ ...esewaConfig, isTestEnvironment: e.target.checked })}
                  className="accent-[#D97706]"
                />
                <span>परीक्षण (Sandbox/Test) वातावरण</span>
              </label>

              <button
                onClick={() => handleSaveEsewaConfig(esewaConfig)}
                className="px-3 py-1 bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg text-xs font-bold transition-all"
              >
                सेभ गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
