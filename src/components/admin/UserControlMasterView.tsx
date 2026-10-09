import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Users, 
  UserCheck, 
  Lock, 
  Unlock, 
  KeyRound, 
  Copy, 
  Check, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Settings, 
  ShieldCheck, 
  ShieldAlert, 
  Smartphone, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  ChevronDown, 
  Info, 
  Bell, 
  LayoutDashboard, 
  Sliders, 
  FileText, 
  Compass, 
  Sparkles, 
  LogOut,
  Save,
  Laptop
} from 'lucide-react';
import { 
  loadAllClientPolicies, 
  saveAllClientPolicies, 
  registerOrUpdateClientPolicy, 
  resetClientDeviceLock, 
  generateLicenseCodePassword, 
  ClientAccessRecord, 
  AccessState, 
  SubscriptionPeriod, 
  CATEGORIZED_FEATURES, 
  getDefaultPermissionsMap 
} from '../../db/menuControlStore';

interface UserControlMasterViewProps {
  onBackToDashboard?: () => void;
  onLogoutAdmin?: () => void;
}

export const UserControlMasterView: React.FC<UserControlMasterViewProps> = ({
  onBackToDashboard,
  onLogoutAdmin
}) => {
  // Clients state
  const [clients, setClients] = useState<ClientAccessRecord[]>(() => loadAllClientPolicies());
  const [selectedMobile, setSelectedMobile] = useState<string>(() => clients[0]?.mobile || '9866416556');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuFilter, setMenuFilter] = useState<'all' | 'open' | 'close' | 'lock'>('all');

  // New user / Signup card state
  const [signupMobile, setSignupMobile] = useState('9866416556');
  const [signupName, setSignupName] = useState('Subash Bhandari');
  const [signupPeriod, setSignupPeriod] = useState<SubscriptionPeriod>('5_years');
  const [latestGeneratedPass, setLatestGeneratedPass] = useState('7F9K3D2P');
  const [showSignupSuccess, setShowSignupSuccess] = useState(true);
  const [copiedPass, setCopiedPass] = useState(false);

  // Edit User Modal
  const [editingClient, setEditingClient] = useState<ClientAccessRecord | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // Notification message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Bottom tabs for preview
  const [bottomPreviewTab, setBottomPreviewTab] = useState<'all' | 'mobile_view' | 'admin_detail' | 'features'>('all');

  // Currently active selected client record
  const activeClient = useMemo(() => {
    return clients.find(c => c.mobile === selectedMobile) || clients[0] || null;
  }, [clients, selectedMobile]);

  // Synchronize clients from localStorage and events
  const refreshClients = useCallback(() => {
    const list = loadAllClientPolicies();
    setClients(list);
  }, []);

  useEffect(() => {
    window.addEventListener('client-policies-updated', refreshClients);
    window.addEventListener('storage', refreshClients);
    return () => {
      window.removeEventListener('client-policies-updated', refreshClients);
      window.removeEventListener('storage', refreshClients);
    };
  }, [refreshClients]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter clients by search
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const q = searchQuery.toLowerCase();
    return clients.filter(c => 
      c.mobile.includes(q) || 
      c.fullName.toLowerCase().includes(q) || 
      (c.loginId && c.loginId.toLowerCase().includes(q))
    );
  }, [clients, searchQuery]);

  // Handle single feature permission toggle for active client
  const handleFeatureStateChange = (featureId: string, state: AccessState) => {
    if (!activeClient) return;
    const updatedPermissions = {
      ...activeClient.permissions,
      [featureId]: state
    };
    const updatedClient: ClientAccessRecord = {
      ...activeClient,
      permissions: updatedPermissions
    };

    const updatedList = clients.map(c => c.mobile === activeClient.mobile ? updatedClient : c);
    setClients(updatedList);
    saveAllClientPolicies(updatedList);
  };

  // Bulk save current changes
  const handleSaveChanges = () => {
    if (!activeClient) return;
    saveAllClientPolicies(clients);
    showToast(`सफलतापूर्वक सुरक्षित गरियो: ${activeClient.fullName} (${activeClient.mobile}) का मेनु अनुमतिहरू अद्यावधिक भए!`);
  };

  // Toggle active/inactive status
  const handleToggleStatus = (mobile: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = clients.find(c => c.mobile === mobile);
    if (!target) return;
    const newStatus = target.status === 'active' ? 'suspended' : 'active';
    const updatedList = clients.map(c => c.mobile === mobile ? { ...c, status: newStatus } : c);
    setClients(updatedList);
    saveAllClientPolicies(updatedList);
    showToast(`${target.fullName} को स्थिति ${newStatus === 'active' ? 'सक्रिय' : 'निष्क्रिय'} बनाइयो।`);
  };

  // Delete client
  const handleDeleteClient = (mobile: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`के तपाईँ निश्चित हुनुहुन्छ? प्रयोगकर्ता (${mobile}) हटाउन चाहनुहुन्छ?`)) {
      const updatedList = clients.filter(c => c.mobile !== mobile);
      setClients(updatedList);
      saveAllClientPolicies(updatedList);
      if (selectedMobile === mobile && updatedList.length > 0) {
        setSelectedMobile(updatedList[0].mobile);
      }
      showToast('प्रयोगकर्ता सफलतापूर्वक हटाइयो।');
    }
  };

  // Reset device lock
  const handleResetDevice = (mobile: string, e: React.MouseEvent) => {
    e.stopPropagation();
    resetClientDeviceLock(mobile);
    refreshClients();
    showToast('उपकरण लक (Device Lock) सफलतापूर्वक रिसेट भयो!');
  };

  // Handle quick password generator in signup box
  const handleGenerateAndRegister = () => {
    const clean = signupMobile.replace(/\D/g, '');
    if (!clean || clean.length < 10) {
      alert('कृपया मान्य १० अङ्कको मोबाइल नम्बर प्रविष्ट गर्नुहोस्।');
      return;
    }

    const newPass = generateLicenseCodePassword();
    const res = registerOrUpdateClientPolicy({
      mobile: clean,
      fullName: signupName || `ग्राहक ${clean.slice(-4)}`,
      password: newPass,
      period: signupPeriod
    });

    refreshClients();
    setSelectedMobile(clean);
    setLatestGeneratedPass(newPass);
    setShowSignupSuccess(true);
    showToast(`नयाँ पासवर्ड जेनेरेट भयो: ${newPass}`);
  };

  // Quick Copy password
  const handleCopyPassword = (pass: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
    showToast('पासवर्ड क्लिपबोर्डमा कपी गरियो!');
  };

  // Menu Selection Checkbox Toggle (middle card)
  const isFeatureOpen = (featId: string) => {
    if (!activeClient) return false;
    return activeClient.permissions[featId] === 'open';
  };

  const toggleFeatureCheckbox = (featId: string) => {
    if (!activeClient) return;
    const currentState = activeClient.permissions[featId] || 'close';
    const nextState: AccessState = currentState === 'open' ? 'close' : 'open';
    handleFeatureStateChange(featId, nextState);
  };

  // Flattened features list with filtering for right panel
  const allFeaturesFlat = useMemo(() => {
    const list: { group: string; id: string; name: string; defaultState: AccessState }[] = [
      { group: '१. जन्म कुण्डली', id: 'kundali', name: 'जन्म कुण्डली हेर्ने', defaultState: 'open' },
      { group: '१. जन्म कुण्डली', id: 'faladesh', name: 'फलादेश', defaultState: 'close' },
      { group: '१. जन्म कुण्डली', id: 'dasha', name: 'दशा-अन्तर्दशा', defaultState: 'lock' },
      { group: '१. जन्म कुण्डली', id: 'gochar', name: 'ग्रह स्थिति', defaultState: 'open' },
      { group: '१. जन्म कुण्डली', id: 'navamsha', name: 'वर्ग कुण्डली', defaultState: 'open' },
      { group: '१. जन्म कुण्डली', id: 'gochar_transit', name: 'गोचर', defaultState: 'open' },

      { group: '२. मुहूर्त हेर्ने', id: 'muhurta', name: 'शुभ मुहूर्त', defaultState: 'open' },
      { group: '२. मुहूर्त हेर्ने', id: 'vivah_muhurta', name: 'विवाह मुहूर्त', defaultState: 'close' },
      { group: '२. मुहूर्त हेर्ने', id: 'griha_muhurta', name: 'गृहप्रवेश मुहूर्त', defaultState: 'open' },

      { group: '३. विशेष जानकारी', id: 'ratna_ankajyotish', name: 'रत्न / धातु / रंग / अंक', defaultState: 'lock' },

      { group: '४. वास्तु सेवा', id: 'vastu_project', name: 'वास्तु विश्लेषण & प्रोजेक्ट', defaultState: 'open' },
      { group: '४. वास्तु सेवा', id: 'vastu_compass', name: '३६०° कम्पास & सुझाव', defaultState: 'open' },
      { group: '४. वास्तु सेवा', id: 'vastu_mandala', name: 'भूमि / भवन मुहूर्त ग्रिड', defaultState: 'open' },
      { group: '४. वास्तु सेवा', id: 'vastu_report', name: 'वास्तु प्रतिवेदन & ब्लुप्रिन्ट', defaultState: 'lock' },

      { group: '५. अन्य मुख्य मोड्युलहरू', id: 'panchanga', name: 'दैनिक पञ्चाङ्ग', defaultState: 'open' },
      { group: '५. अन्य मुख्य मोड्युलहरू', id: 'calendar', name: 'नेपाली क्यालेन्डर / पात्रो', defaultState: 'open' },
      { group: '५. अन्य मुख्य मोड्युलहरू', id: 'date_converter', name: 'मिति रूपान्तरण (BS-AD)', defaultState: 'open' },
      { group: '५. अन्य मुख्य मोड्युलहरू', id: 'kharedi', name: 'वैदिक पसल (Store)', defaultState: 'open' },
      { group: '५. अन्य मुख्य मोड्युलहरू', id: 'books_download', name: 'ग्रन्थ / पुस्तक पुस्तकालय', defaultState: 'open' },
    ];

    if (menuFilter === 'all') return list;
    return list.filter(item => {
      const state = activeClient?.permissions[item.id] || item.defaultState;
      return state === menuFilter;
    });
  }, [activeClient, menuFilter]);

  // Group the features for categorized display
  const groupedFeatures = useMemo(() => {
    const groups: Record<string, typeof allFeaturesFlat> = {};
    for (const item of allFeaturesFlat) {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    }
    return groups;
  }, [allFeaturesFlat]);

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-800 font-sans flex flex-col selection:bg-blue-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[10000] bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl border border-blue-400 flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER COMMAND BAR (Exact match to screenshot) */}
      <header className="bg-[#0B192C] text-white px-4 lg:px-6 py-2.5 flex items-center justify-between shadow-md border-b border-slate-800 shrink-0 sticky top-0 z-50">
        {/* Left: Brand & Dashboard title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 ring-2 ring-amber-400/40">
            <span className="text-xl leading-none">ॐ</span>
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base tracking-wide text-white flex items-center gap-2">
              <span>Brihat Jyotish</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-blue-600 text-blue-100">
                Super Admin
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Super Admin Dashboard — केन्द्रीय नियन्त्रण कक्ष</p>
          </div>
        </div>

        {/* Center Devotional Blessing */}
        <div className="hidden md:flex items-center gap-2 text-amber-300 font-serif font-bold text-sm tracking-wider bg-slate-800/60 px-4 py-1 rounded-full border border-amber-500/30">
          <span>ॐ श्री गणेशाय नमः</span>
        </div>

        {/* Right: Notifications & Super Admin Profile */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 relative cursor-pointer"
            title="सूचनाहरू"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500" />
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-400">
              SA
            </div>
            <div className="hidden sm:block text-left text-[11px] leading-tight">
              <span className="font-bold block text-white">Super Admin</span>
              <span className="text-[9px] text-slate-400">सुपरएडमिन</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER: SIDEBAR + CONTENT CANVAS */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT SIDEBAR (Dark Navy, matching screenshot) */}
        <aside className="w-60 bg-[#0B192C] text-slate-300 border-r border-slate-800 flex flex-col justify-between shrink-0 hidden md:flex">
          <div className="p-3 space-y-1 overflow-y-auto">
            {/* Dashboard Link */}
            <button
              type="button"
              onClick={onBackToDashboard}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span>Dashboard</span>
            </button>

            {/* User Management */}
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>User Management</span>
            </button>

            {/* Jyotish Sewa Accordion Group (Expanded) */}
            <div className="space-y-0.5 pt-1">
              <div className="flex items-center justify-between px-3 py-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Jyotish Sewa</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
              </div>

              {/* Menu Control (Active Item highlighted) */}
              <div className="pl-4 pr-1 space-y-1">
                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-md shadow-blue-900/30 text-left transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-white" />
                  <span>Menu Control</span>
                </button>

                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 text-left transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>User Access</span>
                </button>

                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 text-left transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reports</span>
                </button>
              </div>
            </div>

            {/* Vastu Sewa */}
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
            >
              <Compass className="w-4 h-4 text-slate-400" />
              <span>Vastu Sewa</span>
            </button>

            {/* System Settings */}
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>System Settings</span>
            </button>

            {/* Logout */}
            {onLogoutAdmin && (
              <button
                type="button"
                onClick={onLogoutAdmin}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Logout</span>
              </button>
            )}
          </div>

          {/* Bottom Admin Info Card (Matching Screenshot) */}
          <div className="p-3 border-t border-slate-800 bg-[#071324]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center font-bold text-xs ring-1 ring-slate-700">
                👤
              </div>
              <div className="min-w-0 flex-1 text-left">
                <span className="font-bold text-xs text-white block truncate">Super Admin</span>
                <span className="text-[10px] text-slate-400 block truncate">admin@brihatjyotish.com</span>
                <span className="text-[9px] text-slate-500 font-mono block mt-0.5">2082-09-10 10:25 AM</span>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN CANVAS AREA */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 space-y-5 bg-[#F0F4F8]">

          {/* TOP SECTION: USER LIST (LEFT 65%) + MENU CONTROL (RIGHT 35%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

            {/* ── LEFT: USER LIST (MOBILE REGISTRATION) [Col 7 / 60%] ── */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header with Search and Add User button */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                  <div>
                    <h2 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                      User List (Mobile Registration)
                    </h2>
                    <p className="text-[11px] text-slate-500">दर्ता भएका मोबाइल नम्बर तथा सक्रिय पासवर्ड सूची</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Search box */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Mobile No. खोज्नुहोस्..."
                        className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-40 sm:w-48 font-sans"
                      />
                    </div>

                    {/* Add User button */}
                    <button
                      type="button"
                      onClick={() => setIsAddUserModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 cursor-pointer transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add User</span>
                    </button>
                  </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-2.5 text-center w-12">क्र.सं.</th>
                        <th className="px-3 py-2.5">मोबाइल नं.</th>
                        <th className="px-3 py-2.5">प्रयोगकर्ता नाम</th>
                        <th className="px-3 py-2.5">Login ID</th>
                        <th className="px-3 py-2.5">Password</th>
                        <th className="px-3 py-2.5">अवधि</th>
                        <th className="px-3 py-2.5 text-center">स्थिति</th>
                        <th className="px-3 py-2.5 text-center w-24">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredClients.map((client, idx) => {
                        const isSelected = client.mobile === selectedMobile;
                        return (
                          <tr 
                            key={client.id || client.mobile}
                            onClick={() => setSelectedMobile(client.mobile)}
                            className={`cursor-pointer transition-colors ${
                              isSelected 
                                ? 'bg-blue-50/70 hover:bg-blue-50 border-l-4 border-l-blue-600 font-medium' 
                                : 'hover:bg-slate-50/80'
                            }`}
                          >
                            <td className="px-3 py-2.5 text-center text-slate-500 font-mono text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="px-3 py-2.5 font-mono font-bold text-slate-900">
                              {client.mobile}
                            </td>
                            <td className="px-3 py-2.5 text-slate-800">
                              {client.fullName}
                            </td>
                            <td className="px-3 py-2.5 font-mono text-slate-600 text-[11px]">
                              {client.loginId || client.mobile}
                            </td>
                            <td className="px-3 py-2.5 font-mono font-bold text-slate-900 tracking-wider">
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {client.passwordPlain}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-slate-600">
                              {client.period === '1_year' ? '१ वर्ष' : client.period === '5_years' ? '५ वर्ष' : 'Lifetime'}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <button
                                type="button"
                                onClick={(e) => handleToggleStatus(client.mobile, e)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                                  client.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                }`}
                                title="स्थिति परिवर्तन गर्न क्लिक गर्नुहोस्"
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${client.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <span>{client.status === 'active' ? 'सक्रिय' : 'निष्क्रिय'}</span>
                              </button>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => setEditingClient(client)}
                                  className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                                  title="सम्पादन गर्नुहोस्"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedMobile(client.mobile);
                                    showToast(`${client.fullName} का मेनु अनुमतिहरू दायाँतर्फ लोड गरियो।`);
                                  }}
                                  className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                                  title="मेनु पहुँच नियन्त्रण खोल्नुहोस्"
                                >
                                  <Settings className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteClient(client.mobile, e)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                  title="हटाउनुहोस्"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── ROW OF 3 CARDS UNDER USER LIST (Exact match to screenshot) ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* 1. User Signup (Mobile Registration) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                      User Signup (Mobile Registration)
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-slate-600">
                      मोबाइल नं. दर्ता गर्नुहोस्
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="tel"
                        value={signupMobile}
                        onChange={(e) => setSignupMobile(e.target.value)}
                        placeholder="मोबाइल नं."
                        className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateAndRegister}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shrink-0 cursor-pointer shadow-xs active:scale-95"
                      >
                        Generate Password
                      </button>
                    </div>
                  </div>

                  {/* Green Success Card */}
                  {showSignupSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-left text-xs animate-in fade-in">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>सफलतापूर्वक दर्ता भयो!</span>
                      </div>
                      <div className="text-[11px] space-y-0.5 text-slate-700 font-mono">
                        <div><strong className="text-slate-900 font-sans">Login ID:</strong> {activeClient?.loginId || signupMobile}</div>
                        <div><strong className="text-slate-900 font-sans">Password:</strong> <span className="bg-emerald-200/80 px-1 rounded font-bold text-emerald-900">{latestGeneratedPass}</span></div>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight pt-1 border-t border-emerald-200/60 font-sans">
                        यो पासवर्ड सुरक्षित राख्नुहोस। तपाईले लगइन गरेर पछि परिवर्तन गर्न सक्नुहुनेछ।
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. Menu Selection (For User) */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
                  <div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                      Menu Selection (For User)
                    </h3>
                    <p className="text-[10px] text-slate-500">कुन-कुन मेनु खोल्ने ? (मात्र आवश्यक छान्नुहोस्)</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Jyotish Sewa Checkboxes */}
                    <div>
                      <span className="font-bold text-[11px] text-slate-800 block mb-1">ज्योतिष सेवा</span>
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isFeatureOpen('kundali')} 
                            onChange={() => toggleFeatureCheckbox('kundali')} 
                            className="rounded text-blue-600" 
                          />
                          <span>जन्म कुण्डली</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isFeatureOpen('faladesh')} 
                            onChange={() => toggleFeatureCheckbox('faladesh')} 
                            className="rounded text-blue-600" 
                          />
                          <span>फलादेश</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isFeatureOpen('dasha')} 
                            onChange={() => toggleFeatureCheckbox('dasha')} 
                            className="rounded text-blue-600" 
                          />
                          <span>दशा-अन्तर्दशा</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isFeatureOpen('gochar')} 
                            onChange={() => toggleFeatureCheckbox('gochar')} 
                            className="rounded text-blue-600" 
                          />
                          <span>ग्रह स्थिति</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isFeatureOpen('navamsha')} 
                            onChange={() => toggleFeatureCheckbox('navamsha')} 
                            className="rounded text-blue-600" 
                          />
                          <span>गोचर</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isFeatureOpen('muhurta')} 
                            onChange={() => toggleFeatureCheckbox('muhurta')} 
                            className="rounded text-blue-600" 
                          />
                          <span>मुहूर्त</span>
                        </label>
                      </div>
                    </div>

                    {/* Vastu Sewa Checkboxes */}
                    <div className="pt-1 border-t border-slate-100">
                      <span className="font-bold text-[11px] text-slate-800 block mb-1">वास्तु सेवा</span>
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isFeatureOpen('vastu_project')} 
                            onChange={() => toggleFeatureCheckbox('vastu_project')} 
                            className="rounded text-blue-600" 
                          />
                          <span>वास्तु विश्लेषण</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isFeatureOpen('vastu_compass')} 
                            onChange={() => toggleFeatureCheckbox('vastu_compass')} 
                            className="rounded text-blue-600" 
                          />
                          <span>वास्तु सुझाव</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isFeatureOpen('vastu_mandala')} 
                            onChange={() => toggleFeatureCheckbox('vastu_mandala')} 
                            className="rounded text-blue-600" 
                          />
                          <span>भूमि / भवन मुहूर्त</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isFeatureOpen('vastu_report')} 
                            onChange={() => toggleFeatureCheckbox('vastu_report')} 
                            className="rounded text-blue-600" 
                          />
                          <span>गृह प्रवेश</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveChanges}
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer active:scale-98 transition-transform"
                  >
                    <span>Generate Password</span>
                  </button>
                </div>

                {/* 3. Password Validity */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
                  <div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                      Password Validity
                    </h3>
                    <p className="text-[10px] text-slate-500">अवधि चयन गर्नुहोस्</p>
                  </div>

                  {/* Radio buttons for duration */}
                  <div className="space-y-1.5 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="periodSelect" 
                        value="1_year"
                        checked={signupPeriod === '1_year'}
                        onChange={() => setSignupPeriod('1_year')}
                        className="text-blue-600" 
                      />
                      <span>१ वर्ष (365 दिन)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="periodSelect" 
                        value="5_years"
                        checked={signupPeriod === '5_years'}
                        onChange={() => setSignupPeriod('5_years')}
                        className="text-blue-600" 
                      />
                      <span className="font-bold text-slate-900">५ वर्ष (1825 दिन)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="periodSelect" 
                        value="lifetime"
                        checked={signupPeriod === 'lifetime'}
                        onChange={() => setSignupPeriod('lifetime')}
                        className="text-blue-600" 
                      />
                      <span>Lifetime (जीवनभर)</span>
                    </label>
                  </div>

                  {/* Generated Password Display */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">
                      Generated Password
                    </span>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center flex items-center justify-center gap-2 font-mono font-extrabold text-base text-slate-900">
                      <Lock className="w-4 h-4 text-blue-600" />
                      <span>{activeClient?.passwordPlain || latestGeneratedPass}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyPassword(activeClient?.passwordPlain || latestGeneratedPass)}
                      className={`w-full py-2 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all ${
                        copiedPass ? 'bg-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      {copiedPass ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPass ? 'कपी गरियो!' : 'Copy Password'}</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500 flex items-start gap-1 leading-tight">
                    <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span>यो पासवर्ड एउटा मोबाइल नं. मा एउटा डिभाइसमा मात्र एक पटक प्रयोग गर्न सक्नुहुन्छ।</span>
                  </p>
                </div>
              </div>
            </div>

            {/* ── RIGHT: MENU CONTROL PANEL [Col 5 / 40%] (Exact match to screenshot) ── */}
            <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 bg-white space-y-2">
                <div>
                  <h2 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>Menu Control</span>
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Jyotish Sewa - Menu Control (ज्योतिष सेवा सम्बन्धी मेनुहरू खोल्ने / बन्द गर्ने / लक गर्ने)
                  </p>
                </div>

                {/* Filter Tabs: सबै, खुला (Open), बन्द (Close), लक (Lock) */}
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setMenuFilter('all')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      menuFilter === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    🔘 सबै
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuFilter('open')}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      menuFilter === 'open'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    ✓ खुला (Open)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuFilter('close')}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      menuFilter === 'close'
                        ? 'bg-slate-600 text-white border-slate-600 shadow-xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    ⊘ बन्द (Close)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMenuFilter('lock')}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      menuFilter === 'lock'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    🔒 लक (Lock)
                  </button>
                </div>
              </div>

              {/* Menu Controls Table */}
              <div className="overflow-x-auto flex-1 p-2">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">मेनु / उपमेनु</th>
                      <th className="px-2 py-2 text-center w-12">Open</th>
                      <th className="px-2 py-2 text-center w-12">Close</th>
                      <th className="px-2 py-2 text-center w-12">Lock</th>
                      <th className="px-2 py-2 text-center w-16">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(groupedFeatures).map(([groupTitle, items]) => (
                      <React.Fragment key={groupTitle}>
                        {/* Category Heading row */}
                        <tr className="bg-slate-100/70 font-bold text-slate-900 text-xs">
                          <td colSpan={5} className="px-3 py-1.5 font-extrabold text-blue-900">
                            {groupTitle}
                          </td>
                        </tr>

                        {/* Category items */}
                        {items.map((feat) => {
                          const currentState: AccessState = activeClient?.permissions[feat.id] || feat.defaultState;
                          return (
                            <tr key={feat.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-3 py-2 pl-5 text-slate-800 text-[11px]">
                                <span className="text-slate-400 mr-1.5">&gt;</span>
                                <span>{feat.name}</span>
                              </td>

                              {/* Radio 1: Open */}
                              <td className="px-2 py-2 text-center">
                                <label className="cursor-pointer inline-flex items-center justify-center p-1">
                                  <input
                                    type="radio"
                                    name={`menu_state_${feat.id}`}
                                    value="open"
                                    checked={currentState === 'open'}
                                    onChange={() => handleFeatureStateChange(feat.id, 'open')}
                                    className="accent-emerald-600 w-4 h-4 cursor-pointer"
                                  />
                                </label>
                              </td>

                              {/* Radio 2: Close */}
                              <td className="px-2 py-2 text-center">
                                <label className="cursor-pointer inline-flex items-center justify-center p-1">
                                  <input
                                    type="radio"
                                    name={`menu_state_${feat.id}`}
                                    value="close"
                                    checked={currentState === 'close'}
                                    onChange={() => handleFeatureStateChange(feat.id, 'close')}
                                    className="accent-slate-500 w-4 h-4 cursor-pointer"
                                  />
                                </label>
                              </td>

                              {/* Radio 3: Lock */}
                              <td className="px-2 py-2 text-center">
                                <label className="cursor-pointer inline-flex items-center justify-center p-1">
                                  <input
                                    type="radio"
                                    name={`menu_state_${feat.id}`}
                                    value="lock"
                                    checked={currentState === 'lock'}
                                    onChange={() => handleFeatureStateChange(feat.id, 'lock')}
                                    className="accent-rose-600 w-4 h-4 cursor-pointer"
                                  />
                                </label>
                              </td>

                              {/* Status Badge */}
                              <td className="px-2 py-2 text-center">
                                {currentState === 'open' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    खुला
                                  </span>
                                )}
                                {currentState === 'close' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                    बन्द
                                  </span>
                                )}
                                {currentState === 'lock' && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                    लक
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Save Changes Button */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  चयनित प्रयोगकर्ता: <strong className="text-slate-800">{activeClient?.fullName}</strong> ({activeClient?.mobile})
                </span>
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── LOWER ARCHITECTURE & INTERACTIVE PREVIEW CARDS (Exact match to screenshot) ── */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  प्रणाली पूर्वावलोकन तथा प्रयोगकर्ता अनुभव (Live Interactive Showcase)
                </h3>
                <p className="text-[11px] text-slate-500">
                  क्लायन्ट लगइन पछि देखिने वास्तविक इन्टरफेस, लक मोड तथा व्यवस्थापकीय विवरण
                </p>
              </div>

              {/* View Switcher Pills */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setBottomPreviewTab('all')}
                  className={`px-3 py-1 rounded-xl font-bold cursor-pointer transition-colors ${
                    bottomPreviewTab === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  सबै हेर्नुहोस्
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-start">

              {/* 1. Mobile Login Screen Mockup */}
              <div className="bg-slate-950 text-white rounded-3xl p-4 shadow-xl border-4 border-slate-800 space-y-3 relative overflow-hidden">
                <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto" />
                <div className="text-center pt-2 space-y-1">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-bold mx-auto flex items-center justify-center text-xl shadow-md">
                    ॐ
                  </div>
                  <h4 className="font-bold text-xs text-amber-200">Brihat Jyotish</h4>
                  <p className="text-[9px] text-slate-400">वैदिक ज्योतिष र पञ्चाङ्ग</p>
                </div>

                <div className="space-y-2 pt-2 text-[10px]">
                  <div>
                    <label className="text-slate-400 block mb-0.5">Login ID / Mobile No.</label>
                    <input
                      type="text"
                      readOnly
                      value={activeClient?.mobile || '9866416556'}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px] font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-0.5">Password</label>
                    <input
                      type="password"
                      readOnly
                      value={activeClient?.passwordPlain || '••••••••'}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px] font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    className="w-full py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs mt-1 shadow-sm"
                  >
                    Login
                  </button>
                </div>

                <div className="flex items-center justify-between text-[8px] text-slate-400 pt-1">
                  <span>Password Reset</span>
                  <span>Contact Support</span>
                </div>
              </div>

              {/* 2. User Dashboard (After Login) */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-blue-900">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>User Dashboard</span>
                  </div>
                  <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                    सत्र सक्रिय
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block">{activeClient?.fullName}</span>
                    <span className="text-[10px] text-slate-500 font-mono block">{activeClient?.mobile}</span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                    🔑 Change Password
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-white">
                  <div className="bg-blue-600 p-2 rounded-xl text-center shadow-xs">
                    <span className="text-[10px] block font-bold">ज्योतिष सेवा</span>
                    <span className="text-[9px] opacity-80">(खुला मेनु मात्र)</span>
                    <span className="text-xs font-black block mt-0.5">3/6</span>
                  </div>
                  <div className="bg-emerald-600 p-2 rounded-xl text-center shadow-xs">
                    <span className="text-[10px] block font-bold">वास्तु सेवा</span>
                    <span className="text-[9px] opacity-80">(खुला मेनु मात्र)</span>
                    <span className="text-xs font-black block mt-0.5">2/5</span>
                  </div>
                </div>

                <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-600 flex items-start gap-1.5 leading-tight">
                  <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>अन्य मेनुहरू लक गरिएको छ। तपाईँको अनुमति अनुसार मात्र पहुँच छ।</span>
                </div>
              </div>

              {/* 3. Super Admin - User Detail View */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 space-y-2">
                <div className="border-b border-slate-100 pb-1.5 flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">User Detail View</span>
                  <button type="button" onClick={() => setEditingClient(activeClient)} className="text-[9px] text-blue-600 font-bold hover:underline">
                    Edit
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-700">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                    👤
                  </div>
                  <div className="min-w-0 font-mono text-[10px]">
                    <div>मोबाइल नं.: {activeClient?.mobile}</div>
                    <div>नाम: {activeClient?.fullName}</div>
                    <div>अवधि: {activeClient?.period}</div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-slate-200 text-[9px] font-bold pt-1">
                  <span className="text-blue-600 border-b-2 border-blue-600 pb-1 px-1">Menu Access</span>
                  <span className="text-slate-500 pb-1 px-1">Login History</span>
                  <span className="text-slate-500 pb-1 px-1">Device Info</span>
                </div>

                <div className="text-[9px] space-y-1 pt-1 font-mono">
                  <div className="flex justify-between">
                    <span>जन्म कुण्डली</span>
                    <span className="text-emerald-600 font-bold">Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span>फलादेश</span>
                    <span className="text-emerald-600 font-bold">Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span>दशा-अन्तर्दशा</span>
                    <span className="text-emerald-600 font-bold">Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span>गोचर</span>
                    <span className="text-rose-600 font-bold">Disabled</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleResetDevice(activeClient?.mobile || '', {} as any)}
                  className="w-full py-1 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
                >
                  उपकरण रिसेट (Reset Device)
                </button>
              </div>

              {/* 4. User Landing Page (Menu Locked View) */}
              <div className="bg-[#0A192F] text-white rounded-2xl shadow-sm border border-slate-800 p-3 space-y-2">
                <div className="text-center pb-1 border-b border-slate-800">
                  <span className="text-[11px] font-bold text-amber-300">ज्योतिष सेवा</span>
                  <span className="text-[8px] text-slate-400 block">(Menu Locked View)</span>
                </div>

                <div className="space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span>जन्म कुण्डली</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span>फलादेश</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span>दशा-अन्तर्दशा</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60 opacity-60">
                    <span>ग्रह स्थिति</span>
                    <span className="text-[9px] text-amber-400 font-bold flex items-center gap-1">
                      (लक गरिएको) <Lock className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/60 opacity-60">
                    <span>गोचर</span>
                    <span className="text-[9px] text-amber-400 font-bold flex items-center gap-1">
                      (लक गरिएको) <Lock className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>

                <div className="text-center pt-1 text-[8px] text-blue-300 border-t border-slate-800">
                  तपाईँको अनुमति अनुसार मात्र उपलब्ध छ।
                </div>
              </div>

              {/* 5. Golden Features Card: "यस प्रणालीका प्रमुख विशेषताहरू" */}
              <div className="bg-[#FEF9E7] text-slate-900 rounded-2xl shadow-sm border-2 border-amber-300 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 border-b border-amber-200 pb-1.5 text-amber-950 font-black text-xs">
                  <span className="text-amber-600">✦</span>
                  <span>यस प्रणालीका प्रमुख विशेषताहरू</span>
                </div>

                <ul className="text-[10px] space-y-1 text-slate-800 leading-tight">
                  <li className="flex items-start gap-1">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                    <span>मोबाइल नं. दर्ता गर्दा स्वतः पासवर्ड जेनेरेट</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Login ID = मोबाइल नं.</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                    <span>एक मोबाइल नं. = एक डिभाइस मात्र (एक पटक)</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                    <span>ज्योतिष र वास्तुका लागि छुट्टाछुट्टै मेनु नियन्त्रण</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                    <span>मेनु / उपमेनु अनुसार Open / Close / Lock</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                    <span>प्रयोगकर्ता आफैँले पासवर्ड परिवर्तन गर्न सक्ने</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                    <span>अवधि: १ वर्ष / ५ वर्ष / Lifetime</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                    <span>कुनै मेनु मात्र खोल्ने (Custom Access)</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                    <span>कुनै पनि मेनु बन्द गर्ने (Default)</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                    <span>सबै प्रयोगकर्ताको विवरण Super Admin Dashboard मा क्लिक गरेर तलपट्टि Facility Tick गर्ने सुविधा</span>
                  </li>
                  <li className="flex items-start gap-1 font-bold text-emerald-950">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                    <span>पूर्ण सुरक्षित र व्यवस्थित प्रणाली</span>
                  </li>
                </ul>

                <div className="pt-1.5 border-t border-amber-200 text-center font-serif text-[10px] text-amber-900 font-bold">
                  ॐ नमो भगवते वासुदेवाय || बृहत् ज्योतिष & वास्तु सेवा
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM FOOTER BANNER (Exact match to screenshot) */}
          <footer className="bg-[#0B192C] text-white py-3 px-4 rounded-2xl shadow-md text-center text-xs font-bold tracking-wider border border-slate-800">
            <span>सुरक्षित पहुँच | पूर्ण नियन्त्रण | तपाईँको सेवा, हाम्रो प्रतिबद्धता</span>
          </footer>
        </main>
      </div>

      {/* ── MODAL: EDIT USER DETAILS ── */}
      {editingClient && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 border border-slate-300 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-extrabold text-sm text-slate-900">प्रयोगकर्ता सम्पादन (Edit User)</h3>
              <button type="button" onClick={() => setEditingClient(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">मोबाइल नं.</label>
                <input
                  type="text"
                  disabled
                  value={editingClient.mobile}
                  className="w-full px-3 py-2 rounded-xl border bg-slate-100 font-mono text-slate-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">प्रयोगकर्ता नाम</label>
                <input
                  type="text"
                  value={editingClient.fullName}
                  onChange={(e) => setEditingClient({ ...editingClient, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Login ID</label>
                <input
                  type="text"
                  value={editingClient.loginId || editingClient.mobile}
                  onChange={(e) => setEditingClient({ ...editingClient, loginId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">पासवर्ड</label>
                <input
                  type="text"
                  value={editingClient.passwordPlain}
                  onChange={(e) => setEditingClient({ ...editingClient, passwordPlain: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">अवधि</label>
                <select
                  value={editingClient.period}
                  onChange={(e) => setEditingClient({ ...editingClient, period: e.target.value as SubscriptionPeriod })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="1_year">१ वर्ष</option>
                  <option value="5_years">५ वर्ष</option>
                  <option value="lifetime">Lifetime</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = clients.map(c => c.mobile === editingClient.mobile ? editingClient : c);
                  setClients(updated);
                  saveAllClientPolicies(updated);
                  setEditingClient(null);
                  showToast('प्रयोगकर्ता विवरण अद्यावधिक भयो!');
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
              >
                सुरक्षित गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD NEW USER ── */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 border border-slate-300 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-extrabold text-sm text-slate-900">+ नयाँ प्रयोगकर्ता थप्नुहोस् (Add User)</h3>
              <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">मोबाइल नं. *</label>
                <input
                  type="tel"
                  value={signupMobile}
                  onChange={(e) => setSignupMobile(e.target.value)}
                  placeholder="९८XXXXXXXX / 98XXXXXXXX"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">प्रयोगकर्ताको पूरा नाम</label>
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="नाम, थर"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">सदस्यता अवधि</label>
                <select
                  value={signupPeriod}
                  onChange={(e) => setSignupPeriod(e.target.value as SubscriptionPeriod)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="1_year">१ वर्ष (365 दिन)</option>
                  <option value="5_years">५ वर्ष (1825 दिन)</option>
                  <option value="lifetime">Lifetime (जीवनभर)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={() => {
                  handleGenerateAndRegister();
                  setIsAddUserModalOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
              >
                दर्ता र पासवर्ड जेनेरेट गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
