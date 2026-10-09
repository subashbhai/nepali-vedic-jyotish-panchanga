import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Smartphone,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  RotateCcw,
  Search,
  User,
  Phone,
  Calendar,
  Save,
  Check,
  Copy,
  Eye,
  EyeOff,
  Sliders,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Plus,
  RefreshCw,
  Laptop
} from 'lucide-react';
import {
  CATEGORIZED_FEATURES,
  ClientAccessRecord,
  AccessState,
  SubscriptionPeriod,
  loadAllClientPolicies,
  saveAllClientPolicies,
  registerOrUpdateClientPolicy,
  generateSmartPassword,
  calculatePeriodExpiry,
  resetClientDeviceLock,
  getDefaultPermissionsMap
} from '../../db/menuControlStore';

export const MenuControlPanel: React.FC = () => {
  const [policies, setPolicies] = useState<ClientAccessRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMobile, setSelectedMobile] = useState<string | null>(null);

  // New Client Form Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMobile, setNewMobile] = useState('');
  const [newName, setNewName] = useState('');
  const [newPeriod, setNewPeriod] = useState<SubscriptionPeriod>('1_year');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedMobile, setCopiedMobile] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Load Policies
  const refreshPolicies = () => {
    const list = loadAllClientPolicies();
    setPolicies(list);
    if (!selectedMobile && list.length > 0) {
      setSelectedMobile(list[0].mobile);
    }
  };

  useEffect(() => {
    refreshPolicies();

    const handleUpdate = () => {
      refreshPolicies();
    };
    window.addEventListener('client-policies-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('client-policies-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Filtered policies based on search query
  const filteredPolicies = useMemo(() => {
    if (!searchQuery.trim()) return policies || [];
    const q = searchQuery.toLowerCase();
    return (policies || []).filter(
      p => p && ((p.mobile || '').includes(q) || (p.fullName || '').toLowerCase().includes(q))
    );
  }, [policies, searchQuery]);

  // Currently selected client record for editing
  const selectedPolicy = useMemo(() => {
    if (!selectedMobile) return null;
    return policies.find(p => p.mobile === selectedMobile) || null;
  }, [policies, selectedMobile]);

  // Open modal with pre-generated password
  const handleOpenAddModal = () => {
    setNewMobile('');
    setNewName('');
    setNewPeriod('1_year');
    setGeneratedPassword(generateSmartPassword('Jyotish'));
    setShowPassword(true);
    setIsAddModalOpen(true);
  };

  // Save new client
  const handleSaveNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMobile.trim() || newMobile.replace(/\D/g, '').length < 10) {
      alert('कृपया कम्तीमा १० अङ्कको मान्य मोबाइल नम्बर प्रविष्ट गर्नुहोस्।');
      return;
    }

    try {
      const res = registerOrUpdateClientPolicy({
        mobile: newMobile.trim(),
        fullName: newName.trim() || 'ग्राहक सदस्य',
        password: generatedPassword,
        period: newPeriod
      });

      refreshPolicies();
      setSelectedMobile(res.record.mobile);
      setIsAddModalOpen(false);
      setSaveSuccessMsg(`मोबाइल ${res.record.mobile} सफलतापूर्वक दर्ता भयो! पासवर्ड: ${generatedPassword}`);
      setTimeout(() => setSaveSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err?.message || 'दर्ता गर्न सकिएन।');
    }
  };

  // Update a single permission for selected user
  const handlePermissionChange = (featureId: string, state: AccessState) => {
    if (!selectedPolicy) return;

    const updatedPermissions = {
      ...selectedPolicy.permissions,
      [featureId]: state
    };

    const updatedPolicies = policies.map(p =>
      p.mobile === selectedPolicy.mobile ? { ...p, permissions: updatedPermissions } : p
    );

    setPolicies(updatedPolicies);
    saveAllClientPolicies(updatedPolicies);

    setSaveSuccessMsg('सुविधा पहुँच सफलतापूर्वक अद्यावधिक भयो!');
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  // Category Bulk Toggles (All Open, All Close, All Lock)
  const handleCategoryBulkToggle = (category: 'jyotish' | 'vastu' | 'other', state: AccessState) => {
    if (!selectedPolicy) return;

    const group = CATEGORIZED_FEATURES.find(g => g.category === category);
    if (!group) return;

    const newPerms = { ...selectedPolicy.permissions };
    group.items.forEach(it => {
      newPerms[it.id] = state;
    });

    const updatedPolicies = policies.map(p =>
      p.mobile === selectedPolicy.mobile ? { ...p, permissions: newPerms } : p
    );

    setPolicies(updatedPolicies);
    saveAllClientPolicies(updatedPolicies);

    setSaveSuccessMsg(`क्याटेगोरीका सम्पूर्ण सुविधाहरू '${state.toUpperCase()}' गरियो!`);
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  // Change Period for selected user
  const handlePeriodChange = (period: SubscriptionPeriod) => {
    if (!selectedPolicy) return;
    const expiry = calculatePeriodExpiry(period);

    const updatedPolicies = policies.map(p =>
      p.mobile === selectedPolicy.mobile
        ? {
            ...p,
            period,
            expiresAtTimestamp: expiry.timestamp,
            expiresAtBS: expiry.bsDate
          }
        : p
    );

    setPolicies(updatedPolicies);
    saveAllClientPolicies(updatedPolicies);
    setSaveSuccessMsg(`समय अवधि '${period}' मा अद्यावधिक गरियो!`);
    setTimeout(() => setSaveSuccessMsg(null), 2500);
  };

  // Reset Device Lock
  const handleResetDevice = (mobile: string) => {
    if (confirm('के तपाईं यस ग्राहकको डिभाइस लक रिसेट गर्न चाहनुहुन्छ? (यसपछि ग्राहकले नयाँ उपकरणबाट लगइन गर्न पाउनेछन्)')) {
      resetClientDeviceLock(mobile);
      refreshPolicies();
      alert('डिभाइस लक सफलतापूर्वक रिसेट गरियो!');
    }
  };

  // Regenerate Password for selected user
  const handleRegeneratePassword = () => {
    if (!selectedPolicy) return;
    const newPwd = generateSmartPassword('Jyotish');
    if (confirm(`नयाँ पासवर्ड: ${newPwd}\nके तपाईं यो पासवर्ड सुरक्षित गर्न चाहनुहुन्छ?`)) {
      registerOrUpdateClientPolicy({
        mobile: selectedPolicy.mobile,
        fullName: selectedPolicy.fullName,
        password: newPwd,
        period: selectedPolicy.period,
        permissions: selectedPolicy.permissions
      });
      refreshPolicies();
      setSaveSuccessMsg(`नयाँ पासवर्ड सुरक्षित भयो: ${newPwd}`);
      setTimeout(() => setSaveSuccessMsg(null), 5000);
    }
  };

  const copyToClipboard = (text: string, mobileId: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedMobile(mobileId);
      setTimeout(() => setCopiedMobile(null), 2000);
    } catch {}
  };

  return (
    <div className="space-y-6 text-stone-150">
      {/* Top Header Command Bar */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-stone-800 p-5 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>सुपरएडमिन केन्द्रीय स्विचबोर्ड</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-100 flex items-center gap-2.5 font-serif">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <span>सफ्टवेयर मेनु तथा ग्राहक पहुँच नियन्त्रण (Menu & Submenu Access Control)</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
            ज्योतिष सेवा तथा वास्तु सेवाका प्रत्येक मेनु र उप-मेनुहरूलाई ग्राहकको मोबाइल नम्बर अनुसार १. खुल्ला (Open) २. बन्द (Close / Deem) ३. लक (Lock) नियन्त्रण गर्नुहोस्।
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>नयाँ मोबाइल दर्ता / पासवर्ड जेनेरेट</span>
        </button>
      </div>

      {saveSuccessMsg && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-700/80 text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Left Column = Clients Directory, Right Column = Feature Permissions Switchboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Registered Clients List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <span className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>दर्ता भएका ग्राहकहरू ({policies.length})</span>
              </span>
              <button
                type="button"
                onClick={refreshPolicies}
                className="p-1 hover:bg-stone-800 rounded-lg text-stone-400 hover:text-stone-200 cursor-pointer"
                title="रिफ्रेस गर्नुहोस्"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="मोबाइल वा नाम खोज्नुहोस्..."
                className="w-full pl-8 pr-3 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Clients List */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredPolicies.length === 0 ? (
                <div className="text-center py-8 text-stone-500 text-xs">
                  कुनै पनि ग्राहक फेला परेन। माथिको 'नयाँ मोबाइल दर्ता' बटनबाट थप्नुहोस्।
                </div>
              ) : (
                filteredPolicies.map(c => {
                  const isSelected = c.mobile === selectedMobile;
                  const isExpired = Date.now() > c.expiresAtTimestamp;

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedMobile(c.mobile)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-stone-100 shadow-md ring-1 ring-amber-500/30'
                          : 'bg-stone-950/60 border-stone-800/80 hover:bg-stone-800/50 text-stone-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <strong className="text-xs font-bold block truncate text-stone-100">
                            {c.fullName}
                          </strong>
                          <span className="font-mono text-xs text-amber-400 block font-bold mt-0.5">
                            {c.mobile}
                          </span>
                        </div>

                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                            isExpired
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : c.period === 'lifetime'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}
                        >
                          {c.period === 'lifetime' ? 'आजीवन' : c.period === '5_years' ? '५ वर्ष' : '१ वर्ष'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-stone-400 mt-2 pt-2 border-t border-stone-800/50">
                        <span>म्याद: {c.expiresAtBS}</span>
                        {c.activeDeviceId ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-mono">
                            <Laptop className="w-2.5 h-2.5" />
                            <span>१ डिभाइस लक</span>
                          </span>
                        ) : (
                          <span className="text-stone-500">डिभाइस खाली</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Client Permissions Switchboard (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {selectedPolicy ? (
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-2xl space-y-6">
              {/* Selected User Quick Info Header */}
              <div className="bg-stone-950 border border-stone-800/90 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-400" />
                    <h3 className="text-base font-black text-stone-100">{selectedPolicy.fullName}</h3>
                    <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded-lg">
                      {selectedPolicy.mobile}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">
                    दर्ता मिति: {selectedPolicy.createdAtBS} • म्याद समाप्ति: <strong>{selectedPolicy.expiresAtBS}</strong>
                  </p>
                </div>

                {/* Password & Single Device Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Generated Password Pill */}
                  <div className="flex items-center gap-1.5 bg-stone-900 border border-stone-700 px-3 py-1.5 rounded-xl text-xs font-mono">
                    <span className="text-stone-400 text-[10px]">पासवर्ड:</span>
                    <strong className="text-amber-300 font-bold">{selectedPolicy.passwordPlain}</strong>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedPolicy.passwordPlain, selectedPolicy.mobile)}
                      className="text-stone-400 hover:text-white p-0.5 cursor-pointer"
                      title="पासवर्ड कपी गर्नुहोस्"
                    >
                      {copiedMobile === selectedPolicy.mobile ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleRegeneratePassword}
                    className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    नयाँ पासवर्ड
                  </button>

                  {/* Reset Device Lock Button */}
                  {selectedPolicy.activeDeviceId && (
                    <button
                      type="button"
                      onClick={() => handleResetDevice(selectedPolicy.mobile)}
                      className="px-2.5 py-1.5 bg-rose-950/70 hover:bg-rose-900/80 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>डिभाइस रिसेट</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Subscription Duration Selector */}
              <div className="flex items-center justify-between p-3.5 bg-stone-950/60 border border-stone-800 rounded-2xl flex-wrap gap-3">
                <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>पहुँच समय अवधि (Validity Period):</span>
                </span>

                <div className="flex items-center gap-1.5">
                  {(['1_year', '5_years', 'lifetime'] as SubscriptionPeriod[]).map(per => (
                    <button
                      key={per}
                      type="button"
                      onClick={() => handlePeriodChange(per)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedPolicy.period === per
                          ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                          : 'bg-stone-900 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {per === '1_year' ? '१ वर्ष (1 Year)' : per === '5_years' ? '५ वर्ष (5 Years)' : 'आजीवन (Lifetime)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categorized Permissions Tables */}
              <div className="space-y-6">
                {CATEGORIZED_FEATURES.map(group => {
                  return (
                    <div key={group.category} className="bg-stone-950/70 border border-stone-800 rounded-2xl overflow-hidden shadow-sm">
                      {/* Category Header with Bulk Actions */}
                      <div className="p-3.5 bg-stone-950 border-b border-stone-800 flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-stone-100 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            <span>{group.categoryLabelNepali}</span>
                          </h4>
                          <span className="text-[10px] text-stone-500 font-sans">{group.categoryLabelEnglish}</span>
                        </div>

                        {/* Quick Category Bulk Actions */}
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className="text-stone-500 text-[10px] mr-1">एकमुष्ट:</span>
                          <button
                            type="button"
                            onClick={() => handleCategoryBulkToggle(group.category, 'open')}
                            className="px-2 py-0.5 rounded bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 text-[10px] font-bold cursor-pointer"
                          >
                            सबै Open
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCategoryBulkToggle(group.category, 'close')}
                            className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-[10px] font-bold cursor-pointer"
                          >
                            सबै Close
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCategoryBulkToggle(group.category, 'lock')}
                            className="px-2 py-0.5 rounded bg-amber-950/80 hover:bg-amber-900 text-amber-400 border border-amber-800 text-[10px] font-bold cursor-pointer"
                          >
                            सबै Lock
                          </button>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="divide-y divide-stone-850">
                        {group.items.map(feat => {
                          const currentState: AccessState =
                            selectedPolicy.permissions?.[feat.id] || feat.defaultState;

                          return (
                            <div
                              key={feat.id}
                              className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-stone-900/40 transition-colors"
                            >
                              <div className="min-w-0 pr-2">
                                <strong className="text-xs font-bold text-stone-200 block truncate">
                                  {feat.nameNepali}
                                </strong>
                                <p className="text-[10px] text-stone-400 truncate mt-0.5">
                                  {feat.descriptionNepali}
                                </p>
                              </div>

                              {/* 3-Way State Selector Buttons */}
                              <div className="flex items-center gap-1 shrink-0 bg-stone-900 p-1 rounded-xl border border-stone-800">
                                {/* 1. Open */}
                                <button
                                  type="button"
                                  onClick={() => handlePermissionChange(feat.id, 'open')}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                    currentState === 'open'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'text-stone-400 hover:text-stone-200'
                                  }`}
                                  title="खुल्ला (प्रयोगकर्ताले पूर्ण पहुँच पाउनेछ)"
                                >
                                  <Unlock className="w-3 h-3" />
                                  <span>Open</span>
                                </button>

                                {/* 2. Close */}
                                <button
                                  type="button"
                                  onClick={() => handlePermissionChange(feat.id, 'close')}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                    currentState === 'close'
                                      ? 'bg-stone-700 text-stone-100 shadow-xs'
                                      : 'text-stone-400 hover:text-stone-200'
                                  }`}
                                  title="बन्द (मेनु Deem र Unclickable हुनेछ)"
                                >
                                  <XCircle className="w-3 h-3 text-stone-300" />
                                  <span>Close</span>
                                </button>

                                {/* 3. Lock */}
                                <button
                                  type="button"
                                  onClick={() => handlePermissionChange(feat.id, 'lock')}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                    currentState === 'lock'
                                      ? 'bg-amber-600 text-white shadow-xs'
                                      : 'text-stone-400 hover:text-stone-200'
                                  }`}
                                  title="लक (विशेष पासवर्ड वा लाइसेन्स आवश्यक)"
                                >
                                  <Lock className="w-3 h-3" />
                                  <span>Lock</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-12 text-center text-stone-500">
              <Smartphone className="w-12 h-12 mx-auto text-stone-700 mb-3" />
              <p className="font-bold text-sm text-stone-400">कुनै ग्राहक छनोट गरिएको छैन।</p>
              <p className="text-xs text-stone-500 mt-1">बायाँ सूचीबाट ग्राहक छान्नुहोस् वा नयाँ दर्ता गर्नुहोस्।</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add New Client Mobile & Auto Generate Password */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-amber-500/50 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-100">नयाँ ग्राहक पहुँच दर्ता</h3>
                  <p className="text-[11px] text-stone-400">मोबाइल नम्बर अनुसार अटो-पासवर्ड जेनेरेट</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewClient} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-300 font-bold mb-1">ग्राहकको पूरा नाम (Full Name):</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="उदा: रामप्रसाद शर्मा"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">मोबाइल नम्बर (१० अङ्क):</label>
                <input
                  type="tel"
                  required
                  value={newMobile}
                  onChange={e => setNewMobile(e.target.value)}
                  placeholder="उदा: 9851023456"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl font-mono text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-bold mb-1">समय अवधि (Subscription Period):</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '1_year', label: '१ वर्ष' },
                    { id: '5_years', label: '५ वर्ष' },
                    { id: 'lifetime', label: 'आजीवन' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setNewPeriod(opt.id as SubscriptionPeriod)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        newPeriod === opt.id
                          ? 'bg-amber-500 text-stone-950 border-amber-400 font-black'
                          : 'bg-stone-950 text-stone-400 border-stone-800 hover:bg-stone-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generated Password Box */}
              <div className="p-3 bg-stone-950 border border-amber-500/40 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5" />
                    <span>स्वतः जेनेरेट भएको पासवर्ड:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setGeneratedPassword(generateSmartPassword('Jyotish'))}
                    className="text-[10px] text-stone-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    पुनः जेनेरेट गर्नुहोस्
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={generatedPassword}
                    onChange={e => setGeneratedPassword(e.target.value)}
                    className="flex-1 px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl font-mono font-bold text-amber-300 text-sm focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="p-2 bg-stone-800 text-stone-400 hover:text-white rounded-xl cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(generatedPassword, 'new_pwd')}
                    className="p-2 bg-stone-800 text-stone-400 hover:text-white rounded-xl cursor-pointer"
                    title="कपी गर्नुहोस्"
                  >
                    {copiedMobile === 'new_pwd' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-stone-400 leading-tight">
                  यो पासवर्ड ग्राहकले आफ्नो लगइन आइडी (मोबाइल) र पासवर्डको रूपमा प्रयोग गर्न सक्नेछन्। लगइन गरेपछि ग्राहकले पासवर्ड परिवर्तन गर्न पनि सक्नेछन्।
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-bold cursor-pointer"
                >
                  रद्द गर्नुहोस्
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-bold cursor-pointer shadow-md"
                >
                  दर्ता & सुरक्षित गर्नुहोस्
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
